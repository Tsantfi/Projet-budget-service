package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.ProcesVerbal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcesVerbalRepository extends JpaRepository<ProcesVerbal, Long> {
    
    // Le JOIN FETCH charge immédiatement l'entité Constatation liée pour éviter l'erreur 500
    @Query("SELECT pv FROM ProcesVerbal pv JOIN FETCH pv.constatation WHERE pv.constatation.id = :constatationId")
    List<ProcesVerbal> findByConstatation_Id(@Param("constatationId") Long constatationId);
}
