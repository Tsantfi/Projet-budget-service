package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.MaterielInventaireAnnuel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MaterielInventaireAnnuelRepository
        extends JpaRepository<MaterielInventaireAnnuel, Long> {

    Optional<MaterielInventaireAnnuel>
    findByMateriel_IdAndAnnee(
            Long materielId,
            Integer annee
    );

    List<MaterielInventaireAnnuel>
    findByAnneeOrderByIdAsc(
            Integer annee
    );

    List<MaterielInventaireAnnuel>
    findByMateriel_IdOrderByAnneeAsc(
            Long materielId
    );

    List<MaterielInventaireAnnuel>
    findByMateriel_CodeSoa_IdAndAnnee(
            Long soaId,
            Integer annee
    );

    Optional<MaterielInventaireAnnuel>
    findTopByMateriel_IdAndAnneeLessThanOrderByAnneeDesc(
            Long materielId,
            Integer annee
    );
    
    long countByMateriel_CodeSoa_Id(Long soaId);
}