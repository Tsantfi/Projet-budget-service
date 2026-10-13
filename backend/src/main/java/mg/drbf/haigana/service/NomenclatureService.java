package mg.drbf.haigana.service;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Nomenclature;
import mg.drbf.haigana.repository.NomenclatureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NomenclatureService {

    private final NomenclatureRepository nomenclatureRepository;

    /**
     * Liste toutes les nomenclatures.
     */
    @Transactional(readOnly = true)
    public List<Nomenclature> trouverToutes() {
        return nomenclatureRepository
                .findAllByOrderByNumeroAsc();
    }

    /**
     * Liste uniquement les nomenclatures actives.
     */
    @Transactional(readOnly = true)
    public List<Nomenclature> trouverActives() {
        return nomenclatureRepository
                .findByActifTrueOrderByNumeroAsc();
    }

    /**
     * Créer une nomenclature.
     */
    public Nomenclature creer(
            Integer numero,
            String designation
    ) {
        valider(numero, designation);

        if (nomenclatureRepository.existsByNumero(numero)) {
            throw new IllegalArgumentException(
                    "Le numéro de nomenclature "
                            + numero
                            + " existe déjà."
            );
        }

        Nomenclature nomenclature =
                Nomenclature.builder()
                        .numero(numero)
                        .designation(designation.trim())
                        .actif(true)
                        .build();

        return nomenclatureRepository.save(
                nomenclature
        );
    }

    /**
     * Modifier une nomenclature.
     */
    public Nomenclature modifier(
            Long id,
            Integer numero,
            String designation
    ) {
        valider(numero, designation);

        Nomenclature nomenclature =
                nomenclatureRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Nomenclature introuvable : "
                                                + id
                                )
                        );

        if (nomenclatureRepository
                .existsByNumeroAndIdNot(numero, id)) {

            throw new IllegalArgumentException(
                    "Le numéro de nomenclature "
                            + numero
                            + " est déjà utilisé."
            );
        }

        nomenclature.setNumero(numero);
        nomenclature.setDesignation(
                designation.trim()
        );

        return nomenclatureRepository.save(
                nomenclature
        );
    }

    /**
     * Désactiver une nomenclature.
     *
     * On ne supprime pas physiquement la ligne afin
     * de préserver les anciens matériels.
     */
    public Nomenclature desactiver(Long id) {

        Nomenclature nomenclature =
                nomenclatureRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Nomenclature introuvable : "
                                                + id
                                )
                        );

        nomenclature.setActif(false);

        return nomenclatureRepository.save(
                nomenclature
        );
    }

    /**
     * Réactiver une nomenclature.
     */
    public Nomenclature activer(Long id) {

        Nomenclature nomenclature =
                nomenclatureRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Nomenclature introuvable : "
                                                + id
                                )
                        );

        nomenclature.setActif(true);

        return nomenclatureRepository.save(
                nomenclature
        );
    }

    private void valider(
            Integer numero,
            String designation
    ) {
        if (numero == null || numero <= 0) {
            throw new IllegalArgumentException(
                    "Le numéro de nomenclature doit être supérieur à zéro."
            );
        }

        if (designation == null
                || designation.isBlank()) {

            throw new IllegalArgumentException(
                    "La désignation est obligatoire."
            );
        }
    }
}
