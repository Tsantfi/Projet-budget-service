package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Recensement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;


public interface RecensementRepository
        extends JpaRepository<Recensement, Long> {

    Optional<Recensement>
    findByAnneeAndSoa_Id(
            Integer annee,
            Long soaId
    );

    @Query("""
        SELECT r
        FROM Recensement r
        WHERE r.soa.id = :soaId
          AND r.annee < :annee
        ORDER BY r.annee DESC
    """)
    
    List<Recensement> findDerniersAvantAnnee(
            @Param("soaId") Long soaId,
            @Param("annee") Integer annee
    );

    List<Recensement>
    findByAnneeOrderByIdAsc(
            Integer annee
    );
}