package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.RecensementMaterielLigne;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecensementMaterielLigneRepository
        extends JpaRepository<RecensementMaterielLigne, Long> {

    /**
     * Toutes les lignes d'un recensement.
     */
    List<RecensementMaterielLigne>
    findByRecensement_IdOrderByNomenclatureNumeroAscIdAsc(
            Long recensementId
    );

    /**
     * Une ligne précise d'un matériel dans un recensement.
     */
    Optional<RecensementMaterielLigne>
    findByRecensement_IdAndMateriel_Id(
            Long recensementId,
            Long materielId
    );

    /**
     * Vérifie si le matériel est déjà intégré
     * à ce recensement.
     */
    boolean existsByRecensement_IdAndMateriel_Id(
            Long recensementId,
            Long materielId
    );

    /**
     * Toutes les lignes d'une nomenclature
     * dans un recensement.
     */
    List<RecensementMaterielLigne>
    findByRecensement_IdAndNomenclatureNumeroOrderByIdAsc(
            Long recensementId,
            Integer nomenclatureNumero
    );

    /**
     * Supprime toutes les lignes d'un recensement.
     */
    void deleteByRecensement_Id(
            Long recensementId
    );
}
