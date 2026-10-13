package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.MaterielSortie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterielSortieRepository
        extends JpaRepository<MaterielSortie, Long> {

    List<MaterielSortie>
    findByMateriel_IdOrderByDateSortieAsc(Long materielId);

    List<MaterielSortie>
    findByMateriel_IdAndAnneeOrderByDateSortieAsc(
            Long materielId,
            Integer annee
    );

    long countByMateriel_IdAndAnnee(
            Long materielId,
            Integer annee
    );

    // ETAT APPRECIATIF
    // Récupérer toutes les sorties d'un SOA pour une année

    List<MaterielSortie>
    findByMateriel_CodeSoa_IdAndAnneeOrderByDateSortieAsc(
            Long soaId,
            Integer annee
    );
}