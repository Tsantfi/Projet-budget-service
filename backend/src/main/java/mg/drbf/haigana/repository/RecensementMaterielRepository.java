package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.RecensementMateriel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecensementMaterielRepository
        extends JpaRepository<RecensementMateriel, Long> {

    /**
     * Recherche le recensement d'un SOA pour une année donnée.
     */
    Optional<RecensementMateriel>
    findBySoa_IdAndAnnee(
            Long soaId,
            Integer annee
    );

    /**
     * Tous les recensements d'un SOA.
     */
    List<RecensementMateriel>
    findBySoa_IdOrderByAnneeDesc(
            Long soaId
    );

    /**
     * Vérifie si un recensement existe déjà
     * pour un SOA et une année.
     */
    boolean existsBySoa_IdAndAnnee(
            Long soaId,
            Integer annee
    );
}
