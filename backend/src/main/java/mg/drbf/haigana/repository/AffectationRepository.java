package mg.drbf.haigana.repository;

import java.util.List;
import mg.drbf.haigana.entity.Affectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AffectationRepository extends JpaRepository<Affectation, Long> {
    
    // Le JOIN FETCH prévient l'erreur 500 en chargeant immédiatement l'entité Sortie liée
    @Query("SELECT a FROM Affectation a JOIN FETCH a.sortie WHERE a.sortie.id = :sortieId")
    List<Affectation> findBySortie_Id(@Param("sortieId") Long sortieId);
    void deleteBySortie_Id(Long sortieId);
}
