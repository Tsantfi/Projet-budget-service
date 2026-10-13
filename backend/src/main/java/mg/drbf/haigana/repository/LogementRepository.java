package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Logement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LogementRepository
        extends JpaRepository<Logement, Long> {

    List<Logement> findByCodeSoa_IdOrderByNumeroAscIdAsc(Long soaId);

    List<Logement> findByCodeSoa_IdAndActifTrueOrderByNumeroAscIdAsc(Long soaId);

    long countByCodeSoa_IdAndActifTrue(Long soaId);
    
    @Modifying
    @Query(value = "DELETE FROM recensement_logement_ligne WHERE logement_id = :logementId", nativeQuery = true)
    void deleteRecensementLignesByLogementId(@Param("logementId") Long logementId);
    
}
