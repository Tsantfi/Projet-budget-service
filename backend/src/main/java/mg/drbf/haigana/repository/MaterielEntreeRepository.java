package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.MaterielEntree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterielEntreeRepository
        extends JpaRepository<MaterielEntree, Long> {

    List<MaterielEntree>
    findByMateriel_IdOrderByDateEntreeAsc(Long materielId);

    List<MaterielEntree>
    findByMateriel_IdAndAnneeOrderByDateEntreeAsc(
            Long materielId,
            Integer annee
    );

    long countByMateriel_IdAndAnnee(
            Long materielId,
            Integer annee
    );

    // ETAT APPRECIATIF
    // Récupérer toutes les entrées d'un SOA pour une année

    List<MaterielEntree>
    findByMateriel_CodeSoa_IdAndAnneeOrderByDateEntreeAsc(
            Long soaId,
            Integer annee
    );
}