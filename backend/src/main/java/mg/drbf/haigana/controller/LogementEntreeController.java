package mg.drbf.haigana.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import mg.drbf.haigana.dto.LogementEntreeRequest;
import mg.drbf.haigana.dto.LogementEntreeResponse;
import mg.drbf.haigana.dto.LogementResponse;
import mg.drbf.haigana.entity.Logement;
import mg.drbf.haigana.entity.LogementEntree;
import mg.drbf.haigana.entity.SoaCode;
import mg.drbf.haigana.entity.TypePriseEnCharge;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.LogementEntreeRepository;
import mg.drbf.haigana.repository.LogementRepository;
import mg.drbf.haigana.repository.SoaCodeRepository;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/logements/entrees")
@RequiredArgsConstructor
public class LogementEntreeController {

    private final LogementRepository logementRepository;
    private final LogementEntreeRepository logementEntreeRepository;
    private final SoaCodeRepository soaCodeRepository;

    // CREATION

    @PostMapping
    @Transactional
    public LogementEntreeResponse creer(
            @RequestBody LogementEntreeRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données sont obligatoires."
            );
        }

        if (request.getSoaId() == null) {
            throw new IllegalArgumentException(
                    "Le Code SOA est obligatoire."
            );
        }

        SoaCode soa =
                soaCodeRepository.findById(
                        request.getSoaId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Code SOA introuvable : "
                                        + request.getSoaId()
                        )
                );

        TypePriseEnCharge type =
                convertirType(request.getType());

        LocalDate dateEntree =
                request.getDateEntree() != null
                        ? request.getDateEntree()
                        : LocalDate.now();

        Logement logement;

        // LOGEMENT EXISTANT

        if (request.getLogementId() != null) {

            logement =
                    logementRepository
                            .findById(
                                    request.getLogementId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Logement introuvable : "
                                                    + request.getLogementId()
                                    )
                            );

            if (
                    logementEntreeRepository
                            .findByLogement_Id(
                                    logement.getId()
                            )
                            .isPresent()
            ) {
                throw new IllegalStateException(
                        "Ce logement possède déjà une entrée."
                );
            }

            if (
                    logement.getCodeSoa() == null
                            ||
                    !logement.getCodeSoa()
                            .getId()
                            .equals(soa.getId())
            ) {
                throw new IllegalArgumentException(
                        "Le logement n'appartient pas à ce Code SOA."
                );
            }

        }

        // NOUVEAU LOGEMENT

        else {

            logement =
                    Logement.builder()

                            .codeSoa(soa)

                            .numero(
                                    request.getNumero()
                            )

                            .nomBatiment(
                                    request.getNomBatiment()
                            )

                            .nature(
                                    request.getNature()
                            )

                            .entiteUtilisatrice(
                                    request
                                            .getEntiteUtilisatrice()
                            )

                            .occupant(
                                    request.getOccupant()
                            )

                            .etatBatisse(
                                    request.getEtatBatisse()
                            )

                            .localite(
                                    request.getLocalite()
                            )

                            .adressePointRepere(
                                    request
                                            .getAdressePointRepere()
                            )

                            .etatGeneral(
                                    request.getEtatGeneral()
                            )

                            .anneeInitiale(
                                    request.getAnneeInitiale() != null
                                            ? request.getAnneeInitiale()
                                            : dateEntree.getYear()
                            )

                            .actif(true)

                            .build();

            logement =
                    logementRepository.save(
                            logement
                    );
        }

        // VALIDATION TYPE

        validerType(request, type);

        // CREATION ENTREE

        LogementEntree entree =
                LogementEntree.builder()

                        .logement(logement)

                        .reference(
                                request.getReference()
                        )

                        .dateEntree(
                                dateEntree
                        )

                        .type(
                                type
                        )

                        .pieceJustificativeUrl(
                                request
                                        .getPieceJustificativeUrl()
                        )

                        .ordreEntree(
                                request.getOrdreEntree()
                        )

                        .facture(
                                request.getFacture()
                        )

                        .pvEvaluation(
                                request.getPvEvaluation()
                        )

                        .nomPersonneSortie(
                                request
                                        .getNomPersonneSortie()
                        )

                        .cinPersonneSortie(
                                request
                                        .getCinPersonneSortie()
                        )

                        .serviceSortie(
                                request
                                        .getServiceSortie()
                        )

                        .nomPersonneEntree(
                                request
                                        .getNomPersonneEntree()
                        )

                        .cinPersonneEntree(
                                request
                                        .getCinPersonneEntree()
                        )

                        .serviceEntree(
                                request
                                        .getServiceEntree()
                        )

                        .build();

        entree =
                logementEntreeRepository
                        .save(entree);

        return toResponse(entree);
    }

    // DETAIL ENTREE

    @GetMapping("/logement/{logementId}")
    @Transactional
    public LogementEntreeResponse findByLogement(
            @PathVariable Long logementId
    ) {

        LogementEntree entree =
                logementEntreeRepository
                        .findByLogement_Id(
                                logementId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Aucune entrée trouvée pour ce logement."
                                )
                        );

        return toResponse(entree);
    }

    // CONVERSION TYPE

    private TypePriseEnCharge convertirType(
            String valeur
    ) {

        if (
                valeur == null ||
                valeur.trim().isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "Le type de prise en charge est obligatoire."
            );
        }

        try {

            return TypePriseEnCharge.valueOf(
                    valeur
                            .trim()
                            .toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Type de prise en charge invalide : "
                            + valeur
            );
        }
    }

    // VALIDATION

    private void validerType(
            LogementEntreeRequest request,
            TypePriseEnCharge type
    ) {

        if (
                type == TypePriseEnCharge.ACHAT
        ) {

            if (
                    isEmpty(
                            request.getOrdreEntree()
                    )
            ) {
                throw new IllegalArgumentException(
                        "L'ordre d'entrée est obligatoire pour un achat."
                );
            }

            if (
                    isEmpty(
                            request.getFacture()
                    )
            ) {
                throw new IllegalArgumentException(
                        "La facture est obligatoire pour un achat."
                );
            }
        }

        if (
                type == TypePriseEnCharge.DON
        ) {

            if (
                    isEmpty(
                            request.getOrdreEntree()
                    )
            ) {
                throw new IllegalArgumentException(
                        "L'ordre d'entrée est obligatoire pour un don."
                );
            }

            if (
                    isEmpty(
                            request.getFacture()
                    )
            ) {
                throw new IllegalArgumentException(
                        "La facture est obligatoire pour un don."
                );
            }

            if (
                    isEmpty(
                            request.getPvEvaluation()
                    )
            ) {
                throw new IllegalArgumentException(
                        "Le PV d'évaluation est obligatoire pour un don."
                );
            }
        }

        if (
                type == TypePriseEnCharge.AFFECTATION
        ) {

            String[][] champs = {

                    {
                        request.getNomPersonneSortie(),
                        "Le nom de la personne qui fait la sortie"
                    },

                    {
                        request.getCinPersonneSortie(),
                        "La CIN de la personne qui fait la sortie"
                    },

                    {
                        request.getServiceSortie(),
                        "Le service de la personne qui fait la sortie"
                    },

                    {
                        request.getNomPersonneEntree(),
                        "Le nom de la personne qui fait l'entrée"
                    },

                    {
                        request.getCinPersonneEntree(),
                        "La CIN de la personne qui fait l'entrée"
                    },

                    {
                        request.getServiceEntree(),
                        "Le service de la personne qui fait l'entrée"
                    }
            };

            for (String[] champ : champs) {

                if (isEmpty(champ[0])) {

                    throw new IllegalArgumentException(
                            champ[1] + " est obligatoire."
                    );
                }
            }
        }
    }

    private boolean isEmpty(String value) {
        return value == null ||
                value.trim().isEmpty();
    }

    // ENTITY -> RESPONSE

    private LogementEntreeResponse toResponse(
            LogementEntree entree
    ) {

        return LogementEntreeResponse
                .builder()

                .id(
                        entree.getId()
                )

                .logement(
                        logementToResponse(
                                entree.getLogement()
                        )
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

                .nomPersonneSortie(
                        entree.getNomPersonneSortie()
                )

                .cinPersonneSortie(
                        entree.getCinPersonneSortie()
                )

                .serviceSortie(
                        entree.getServiceSortie()
                )

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
                        entree
                                .getPieceJustificativeUrl()
                )

                .build();
    }

    private LogementResponse logementToResponse(
            Logement logement
    ) {

        LogementResponse.SoaResponse soa =
                null;

        if (
                logement.getCodeSoa() != null
        ) {

            soa =
                    LogementResponse.SoaResponse
                            .builder()
                            .id(
                                    logement
                                            .getCodeSoa()
                                            .getId()
                            )
                            .codeSoa(
                                    logement
                                            .getCodeSoa()
                                            .getCodeSoa()
                            )
                            .build();
        }

        return LogementResponse
                .builder()

                .id(
                        logement.getId()
                )

                .numero(
                        logement.getNumero()
                )

                .nomBatiment(
                        logement.getNomBatiment()
                )

                .nature(
                        logement.getNature()
                )

                .entiteUtilisatrice(
                        logement.getEntiteUtilisatrice()
                )

                .occupant(
                        logement.getOccupant()
                )

                .etatBatisse(
                        logement.getEtatBatisse()
                )

                .localite(
                        logement.getLocalite()
                )

                .adressePointRepere(
                        logement
                                .getAdressePointRepere()
                )

                .etatGeneral(
                        logement.getEtatGeneral()
                )

                .anneeInitiale(
                        logement.getAnneeInitiale()
                )

                .dateAvantCondamnation(
                        logement
                                .getDateAvantCondamnation()
                )

                .actif(
                        logement.getActif()
                )

                .soa(soa)

                .build();
    }
}
