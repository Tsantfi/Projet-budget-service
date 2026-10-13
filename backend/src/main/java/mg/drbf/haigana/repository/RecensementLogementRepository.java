package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.RecensementLogement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecensementLogementRepository
        extends JpaRepository<RecensementLogement, Long> {

    Optional<RecensementLogement> findBySoa_IdAndAnnee(
            Long soaId,
            Integer annee
    );
    
    Optional<RecensementLogement>
    findTopBySoa_IdAndAnneeLessThanOrderByAnneeDesc(
            Long soaId,
            Integer annee
    );
}
