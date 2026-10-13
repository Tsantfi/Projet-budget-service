package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Entree;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface EntreeRepository extends JpaRepository<Entree, Long> {

    List<Entree> findByVehicule_Id(Long vehiculeId);
    Optional <Entree> findFirstByVehicule_Id(Long vehiculeId);

    @Query("""
    SELECT DISTINCT e
    FROM Entree e
    JOIN FETCH e.vehicule v
    LEFT JOIN FETCH v.codeSoa
    WHERE e.id = :id
    """)
    Optional<Entree> findByIdWithVehicule(
            @Param("id") Long id
    );
    List<Entree> findByVehicule_IdOrderByDateEntreeAsc(Long vehiculeId);

}