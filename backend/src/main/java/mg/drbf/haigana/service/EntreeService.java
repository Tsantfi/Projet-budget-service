package mg.drbf.haigana.service;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.EntreeRequest;
import mg.drbf.haigana.dto.EntreeResponse;
import mg.drbf.haigana.entity.Achat;
import mg.drbf.haigana.entity.AffectationEntree;
import mg.drbf.haigana.entity.Don;
import mg.drbf.haigana.entity.Entree;
import mg.drbf.haigana.entity.TypePriseEnCharge;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.AchatRepository;
import mg.drbf.haigana.repository.AffectationEntreeRepository;
import mg.drbf.haigana.repository.DonRepository;
import mg.drbf.haigana.repository.EntreeRepository;
import mg.drbf.haigana.repository.VehiculeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EntreeService {

    private final EntreeRepository entreeRepository;
    private final VehiculeRepository vehiculeRepository;

    private final AchatRepository achatRepository;
    private final DonRepository donRepository;
    private final AffectationEntreeRepository affectationEntreeRepository;



    // LISTE


    @Transactional(readOnly = true)
    public List<EntreeResponse> findAll() {

        return entreeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // DETAIL

    @Transactional(readOnly = true)
    public EntreeResponse findById(Long id) {

        Entree entree = entreeRepository
                .findByIdWithVehicule(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Entrée introuvable : " + id
                        )
                );

        return toResponse(entree);
    }

    // ENTREE D'UN VEHICULE

    @Transactional(readOnly = true)
    public EntreeResponse findByVehicule(Long vehiculeId) {

        Entree entree = entreeRepository
                .findFirstByVehicule_Id(vehiculeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Aucune entrée trouvée pour le véhicule : "
                                        + vehiculeId
                        )
                );

        return toResponse(entree);
    }



    // CREATION COMPLETE

    @Transactional
    public EntreeResponse createComplete(
            EntreeRequest request
    ) {

        // ==============================
        // VEHICULE OBLIGATOIRE
        // ==============================

        if (request.getVehiculeId() == null) {

            throw new IllegalArgumentException(
                    "Le véhicule est obligatoire."
            );
        }

        Vehicule vehicule = vehiculeRepository
                .findById(request.getVehiculeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Véhicule introuvable : "
                                        + request.getVehiculeId()
                        )
                );


        // ==============================
        // UNE SEULE ENTREE PAR VEHICULE
        // ==============================

        if (entreeRepository
                .findFirstByVehicule_Id(request.getVehiculeId())
                .isPresent()) {

            throw new IllegalStateException(
                    "Ce véhicule possède déjà une entrée."
            );
        }


        // ==============================
        // TYPE
        // ==============================

        TypePriseEnCharge type =
                convertirType(request.getType());


        // ==============================
        // DATE ENTREE
        // ==============================

        LocalDate dateEntree =
                request.getDateEntree() != null
                        ? request.getDateEntree()
                        : LocalDate.now();


        // ==============================
        // CREATION ENTREE
        // ==============================

        Entree.EntreeBuilder builder = Entree.builder()
                .reference(request.getReference())
                .dateEntree(dateEntree)
                .type(type)

                .ordreEntree(
                        request.getOrdreEntree()
                )

                .facture(
                        request.getFacture()
                )

                .pvEvaluation(
                        request.getPvEvaluation()
                )

                .vehicule(vehicule)

                .pieceJustificativeUrl(
                        request.getPieceJustificativeUrl()
                );

        // PERSONNES
        // UNIQUEMENT POUR AFFECTATION

        if (type == TypePriseEnCharge.AFFECTATION) {

            // Vérification des 6 champs
            validerPersonneSortie(request);
            validerPersonneEntree(request);

            builder
                    .nomPersonneSortie(
                            request.getNomPersonneSortie().trim()
                    )

                    .cinPersonneSortie(
                            request.getCinPersonneSortie().trim()
                    )

                    .serviceSortie(
                            request.getServiceSortie().trim()
                    )

                    .nomPersonneEntree(
                            request.getNomPersonneEntree().trim()
                    )

                    .cinPersonneEntree(
                            request.getCinPersonneEntree().trim()
                    )

                    .serviceEntree(
                            request.getServiceEntree().trim()
                    );

        } else {

            // ACHAT / DON
            // Aucun renseignement de personne

            builder
                    .nomPersonneSortie(null)
                    .cinPersonneSortie(null)
                    .serviceSortie(null)

                    .nomPersonneEntree(null)
                    .cinPersonneEntree(null)
                    .serviceEntree(null);
        }

        // SAUVEGARDER

        Entree entree = builder.build();

        Entree saved =
                entreeRepository.save(entree);

        // CREER LES DONNEES DU TYPE

        creerDonneesType(
                saved,
                request,
                type,
                dateEntree
        );

        // RESPONSE

        return toResponse(saved);
    }

    // MODIFICATION COMPLETE
    @Transactional
    public EntreeResponse update(
            Long id,
            EntreeRequest request
    ) {

    // ==============================
    // RECUPERER L'ENTREE
    // ==============================

    Entree existing = entreeRepository
            .findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Entrée introuvable : " + id
                    )
            );


    // ==============================
    // VEHICULE
    // ==============================

    if (request.getVehiculeId() != null) {

        Vehicule vehicule = vehiculeRepository
                .findById(request.getVehiculeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Véhicule introuvable : "
                                        + request.getVehiculeId()
                        )
                );

        var autreEntree =
                entreeRepository.findFirstByVehicule_Id(
                        request.getVehiculeId()
                );

        if (autreEntree.isPresent()
                && !autreEntree.get()
                .getId()
                .equals(id)) {

            throw new IllegalStateException(
                    "Ce véhicule possède déjà une autre entrée."
            );
        }

        existing.setVehicule(vehicule);
    }


    // ==============================
    // INFORMATIONS GENERALES
    // ==============================

    existing.setReference(
            request.getReference()
    );

    existing.setOrdreEntree(
            request.getOrdreEntree()
    );

    existing.setFacture(
            request.getFacture()
    );

    existing.setPvEvaluation(
            request.getPvEvaluation()
    );

    if (request.getDateEntree() != null) {

        existing.setDateEntree(
                request.getDateEntree()
        );
    }

    existing.setPieceJustificativeUrl(
            request.getPieceJustificativeUrl()
    );


    // ==============================
    // TYPE
    // ==============================

    TypePriseEnCharge nouveauType =
            convertirType(request.getType());

    // PERSONNES
    // UNIQUEMENT POUR AFFECTATION

    if (nouveauType == TypePriseEnCharge.AFFECTATION) {

        validerPersonneSortie(request);
        validerPersonneEntree(request);

        existing.setNomPersonneSortie(
                request.getNomPersonneSortie().trim()
        );

        existing.setCinPersonneSortie(
                request.getCinPersonneSortie().trim()
        );

        existing.setServiceSortie(
                request.getServiceSortie().trim()
        );

        existing.setNomPersonneEntree(
                request.getNomPersonneEntree().trim()
        );

        existing.setCinPersonneEntree(
                request.getCinPersonneEntree().trim()
        );

        existing.setServiceEntree(
                request.getServiceEntree().trim()
        );

    } else {

        // ACHAT / DON
        // Aucun renseignement sur les personnes

        existing.setNomPersonneSortie(null);
        existing.setCinPersonneSortie(null);
        existing.setServiceSortie(null);

        existing.setNomPersonneEntree(null);
        existing.setCinPersonneEntree(null);
        existing.setServiceEntree(null);
    }

    // SUPPRIMER ANCIENNES DONNEES

    supprimerDonneesType(id);

    // METTRE A JOUR LE TYPE

    existing.setType(nouveauType);

    // SAUVEGARDER L'ENTREE

    Entree saved =
            entreeRepository.save(existing);


    // ==============================
    // DATE ENTREE
    // ==============================

    LocalDate dateEntree =
            saved.getDateEntree() != null
                    ? saved.getDateEntree()
                    : LocalDate.now();

    // RECREER LES DONNEES DU TYPE

    creerDonneesType(
            saved,
            request,
            nouveauType,
            dateEntree
    );

    // RESPONSE

    return toResponse(saved);
    }
    // SUPPRESSION
    
    @Transactional
    public void delete(Long id) {

        Entree entree = entreeRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Entrée introuvable : " + id
                        )
                );


        // Supprimer d'abord les données liées
        supprimerDonneesType(id);


        // Puis supprimer l'entrée
        entreeRepository.delete(entree);
    }

    // CREER LES DONNEES SELON LE TYPE

    private void creerDonneesType(
            Entree entree,
            EntreeRequest request,
            TypePriseEnCharge type,
            LocalDate dateEntree
    ) {

        // ACHAT  

        if (type == TypePriseEnCharge.ACHAT) {

            Achat achat = Achat.builder()
                    .dateAchat(
                            request.getDateAchat() != null
                                    ? request.getDateAchat()
                                    : dateEntree
                    )
                    .sommePayer(
                            request.getSommePayer()
                    )
                    .entree(entree)
                    .build();


            achatRepository.save(achat);
        }
  
        // DON

        if (type == TypePriseEnCharge.DON) {

            Don don = Don.builder()
                    .dateDon(
                            request.getDateDon() != null
                                    ? request.getDateDon()
                                    : dateEntree
                    )
                    .sommeRenverser(
                            request.getSommeRenverser()
                    )
                    .entree(entree)
                    .build();


            donRepository.save(don);
        }
  
        // AFFECTATION

        if (type == TypePriseEnCharge.AFFECTATION) {
            
            // PERSONNE ORDRE DE SORTIE
            validerPersonneSortie(request);

            // PERSONNE ORDRE D'ENTREE
            validerPersonneEntree(request);

            validerAffectation(request);

            AffectationEntree affectation =
                    AffectationEntree.builder()
                            .description(
                                    request.getDescriptionAffectation()
                            )
                            .lieuAffectation(
                                    request.getLieuAffectation().trim()
                            )
                            .dateDepart(
                                    request.getDateDepart() != null
                                            ? request.getDateDepart()
                                            : dateEntree
                            )
                            .dateFin(
                                    request.getDateFin()
                            )
                            .entree(entree)
                            .build();


            affectationEntreeRepository.save(
                    affectation
            );
        }
    }
    // SUPPRIMER LES DONNEES DES TYPES

    private void supprimerDonneesType(
            Long entreeId
    ) {

  
        // ACHAT
  

        List<Achat> achats =
                achatRepository.findByEntree_Id(
                        entreeId
                );

        if (!achats.isEmpty()) {

            achatRepository.deleteAll(achats);
            achatRepository.flush();
        }


  
        // DON
  

        List<Don> dons =
                donRepository.findByEntree_Id(
                        entreeId
                );

        if (!dons.isEmpty()) {

            donRepository.deleteAll(dons);
            donRepository.flush();
        }


  
        // AFFECTATION
  

        List<AffectationEntree> affectations =
                affectationEntreeRepository
                        .findByEntree_Id(
                                entreeId
                        );

        if (!affectations.isEmpty()) {

            affectationEntreeRepository
                    .deleteAll(affectations);

            affectationEntreeRepository.flush();
        }
    }

    // CONVERSION ENTREE -> RESPONSE

    private EntreeResponse toResponse(
            Entree entree
    ) {

        Vehicule vehicule =
                entree.getVehicule();


        EntreeResponse response =
            EntreeResponse.builder()

                .id(
                        entree.getId()
                )

                .reference(
                        entree.getReference()
                )

                .dateEntree(
                        entree.getDateEntree()
                )

                .type(
                        entree.getType() != null
                                ? entree.getType().name()
                                : null
                )

                .ordreEntree(
                        entree.getOrdreEntree()
                )

                .facture(
                        entree.getFacture()
                )

                .pvEvaluation(
                        entree.getPvEvaluation()
                )

                // PERSONNE SORTIE
                .nomPersonneSortie(
                        entree.getNomPersonneSortie()
                )

                .cinPersonneSortie(
                        entree.getCinPersonneSortie()
                )

                .serviceSortie(
                        entree.getServiceSortie()
                )

                // PERSONNE ENTREE
                .nomPersonneEntree(
                        entree.getNomPersonneEntree()
                )

                .cinPersonneEntree(
                        entree.getCinPersonneEntree()
                )

                .serviceEntree(
                        entree.getServiceEntree()
                )

                .pieceJustificativeUrl(
                        entree.getPieceJustificativeUrl()
                )

                .build();

  
        // VEHICULE
  

        if (vehicule != null) {

            response.setVehiculeId(
                    vehicule.getId()
            );


            response.setImmatricule(
                    vehicule.getImmatricule()
            );
      
            // CODE SOA

            if (vehicule.getCodeSoa() != null) {

                response.setCodeSoa(
                        vehicule.getCodeSoa().getCodeSoa()
                );
            }
        }


  
        // ACHAT
  

        achatRepository
                .findByEntree_Id(entree.getId())
                .stream()
                .findFirst()
                .ifPresent(achat -> {

                    response.setDateAchat(
                            achat.getDateAchat()
                    );

                    response.setSommePayer(
                            achat.getSommePayer()
                    );
                });


  
        // DON
  

        donRepository
                .findByEntree_Id(entree.getId())
                .stream()
                .findFirst()
                .ifPresent(don -> {

                    response.setDateDon(
                            don.getDateDon()
                    );

                    response.setSommeRenverser(
                            don.getSommeRenverser()
                    );
                });


  
        // AFFECTATION
  

        affectationEntreeRepository
                .findByEntree_Id(entree.getId())
                .stream()
                .findFirst()
                .ifPresent(affectation -> {

                    response.setDescriptionAffectation(
                            affectation.getDescription()
                    );

                    response.setLieuAffectation(
                            affectation.getLieuAffectation()
                    );

                    response.setDateDepart(
                            affectation.getDateDepart()
                    );

                    response.setDateFin(
                            affectation.getDateFin()
                    );
                });


        return response;
    }



    // CONVERSION TYPE


    private TypePriseEnCharge convertirType(
            String type
    ) {

        if (isEmpty(type)) {

            throw new IllegalArgumentException(
                    "Le type de prise en charge est obligatoire."
            );
        }


        try {

            return TypePriseEnCharge.valueOf(
                    type.trim().toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Type de prise en charge invalide : "
                            + type
            );
        }
    }
    // VALIDATION AFFECTATION

    private void validerAffectation(
            EntreeRequest request
    ) {

        if (isEmpty(
                request.getLieuAffectation()
        )) {

            throw new IllegalArgumentException(
                    "Le lieu d'affectation est obligatoire."
            );
        }


        if (request.getDateDepart() == null) {

            throw new IllegalArgumentException(
                    "La date d'affectation est obligatoire."
            );
        }
    }



    // VALIDATION PERSONNE SORTIE

    private void validerPersonneSortie(
            EntreeRequest request
    ) {

        if (isEmpty(
                request.getNomPersonneSortie()
        )) {

            throw new IllegalArgumentException(
                    "Le nom de la personne qui fait l'ordre de sortie est obligatoire."
            );
        }


        if (isEmpty(
                request.getCinPersonneSortie()
        )) {

            throw new IllegalArgumentException(
                    "La CIN de la personne qui fait l'ordre de sortie est obligatoire."
            );
        }


        if (isEmpty(
                request.getServiceSortie()
        )) {

            throw new IllegalArgumentException(
                    "Le service qui fait l'ordre de sortie est obligatoire."
            );
        }
    }

    // VALIDATION PERSONNE ENTREE

    private void validerPersonneEntree(
            EntreeRequest request
    ) {

        if (isEmpty(
                request.getNomPersonneEntree()
        )) {

            throw new IllegalArgumentException(
                    "Le nom de la personne qui fait l'ordre d'entrée est obligatoire."
            );
        }


        if (isEmpty(
                request.getCinPersonneEntree()
        )) {

            throw new IllegalArgumentException(
                    "La CIN de la personne qui fait l'ordre d'entrée est obligatoire."
            );
        }


        if (isEmpty(
                request.getServiceEntree()
        )) {

            throw new IllegalArgumentException(
                    "Le service qui fait l'entrée est obligatoire."
            );
        }
    }



    // UTILITAIRE


    private boolean isEmpty(
            String value
    ) {

        return value == null
                || value.trim().isEmpty();
    }
    
    // SERVICE DE PRISE EN CHARGE
    @Transactional
    public EntreeResponse createPriseEnCharge(EntreeRequest request) {

        // VERIFICATION VEHICULE

        if (request.getVehiculeId() == null) {
            throw new IllegalArgumentException(
                    "Le véhicule est obligatoire."
            );
        }

        Vehicule vehicule = vehiculeRepository
                .findById(request.getVehiculeId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Véhicule introuvable."
                        )
                );

        // ==========================================
        // VERIFICATION TYPE DE PRISE EN CHARGE
        // ==========================================

        if (isEmpty(request.getType())) {
            throw new IllegalArgumentException(
                    "Le type de prise en charge est obligatoire."
            );
        }

        TypePriseEnCharge type = convertirType(
                request.getType()
        );

        // ==========================================
        // CREATION ENTREE

        Entree entree = Entree.builder()

        .reference(
                request.getReference() != null
                        && !request.getReference().trim().isEmpty()
                        ? request.getReference().trim()
                        : "PRISE-" + vehicule.getImmatricule()
        )

        .dateEntree(
                request.getDateEntree() != null
                        ? request.getDateEntree()
                        : LocalDate.now()
        )

        .vehicule(vehicule)

        .type(type)

        .ordreEntree(
                request.getOrdreEntree() != null
                        ? request.getOrdreEntree().trim()
                        : null
        )

        .facture(
                request.getFacture() != null
                        ? request.getFacture().trim()
                        : null
        )

        .pvEvaluation(
                request.getPvEvaluation() != null
                        ? request.getPvEvaluation().trim()
                        : null
        )

        .nomPersonneSortie(
                request.getNomPersonneSortie() != null
                        ? request.getNomPersonneSortie().trim()
                        : null
        )

        .cinPersonneSortie(
                request.getCinPersonneSortie() != null
                        ? request.getCinPersonneSortie().trim()
                        : null
        )

        .serviceSortie(
                request.getServiceSortie() != null
                        ? request.getServiceSortie().trim()
                        : null
        )

        .nomPersonneEntree(
                request.getNomPersonneEntree() != null
                        ? request.getNomPersonneEntree().trim()
                        : null
        )

        .cinPersonneEntree(
                request.getCinPersonneEntree() != null
                        ? request.getCinPersonneEntree().trim()
                        : null
        )

        .serviceEntree(
                request.getServiceEntree() != null
                        ? request.getServiceEntree().trim()
                        : null
        )

        .pieceJustificativeUrl(
                request.getPieceJustificativeUrl()
        )

        .build();
        validerPiecesPriseEnCharge(request, type);
        Entree saved = entreeRepository.save(entree);

        return toResponse(saved);
    }
    
    //POUR MOTIF ET PIECE
    @Transactional
    public EntreeResponse updateMotifEtPiece(
            Long id,
            EntreeRequest request
    ) {

        Entree existing = entreeRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Entrée introuvable : " + id
                        )
                );


        // ==========================================
        // SAUVEGARDE
        // ==========================================

        Entree saved =
                entreeRepository.save(existing);

        return toResponse(saved);
    }
    
    //Methode de validation
    private void validerPiecesPriseEnCharge(
        EntreeRequest request,
        TypePriseEnCharge type
) {

    // ==========================================
    // ACHAT
    // ==========================================

    if (type == TypePriseEnCharge.ACHAT) {

        if (isEmpty(request.getOrdreEntree())) {
            throw new IllegalArgumentException(
                    "L'ordre d'entrée est obligatoire pour un achat."
            );
        }

        if (isEmpty(request.getFacture())) {
            throw new IllegalArgumentException(
                    "La facture est obligatoire pour un achat."
            );
        }
    }

    // ==========================================
    // DON
    // ==========================================

    if (type == TypePriseEnCharge.DON) {

        if (isEmpty(request.getOrdreEntree())) {
            throw new IllegalArgumentException(
                    "L'ordre d'entrée est obligatoire pour un don."
            );
        }

        if (isEmpty(request.getFacture())) {
            throw new IllegalArgumentException(
                    "La facture est obligatoire pour un don."
            );
        }

        if (isEmpty(request.getPvEvaluation())) {
            throw new IllegalArgumentException(
                    "Le PV d'évaluation est obligatoire pour un don."
            );
        }
    }

    // AFFECTATION

    if (type == TypePriseEnCharge.AFFECTATION) {
        validerPersonneSortie(request);
        validerPersonneEntree(request);
    }
    }
}