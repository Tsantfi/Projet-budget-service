package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Condamnation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CondamnationRepository
        extends JpaRepository<Condamnation, Long> {

    List<Condamnation> findBySortie_Id(Long sortieId);

    @Query("""
        SELECT c
        FROM Condamnation c
        LEFT JOIN FETCH c.sortie
        WHERE c.id = :id
    """)
    Optional<Condamnation> findByIdWithSortie(
            @Param("id") Long id
    );

    long countByImmatriculeVehicule(
            String immatriculeVehicule
    );

    // TOTAL CONDAMNATIONS

    long count();

    // CONDAMNATIONS PAR ANNEE

    @Query("""
        SELECT YEAR(c.dateCondamnation), COUNT(c)
        FROM Condamnation c
        WHERE c.dateCondamnation IS NOT NULL
        GROUP BY YEAR(c.dateCondamnation)
        ORDER BY YEAR(c.dateCondamnation)
    """)
    List<Object[]> countCondamnationsParAnnee();

    // CONDAMNATIONS PAR LIEU

    @Query("""
        SELECT c.lieuCondamnation, COUNT(c)
        FROM Condamnation c
        WHERE c.lieuCondamnation IS NOT NULL
        GROUP BY c.lieuCondamnation
        ORDER BY COUNT(c) DESC
    """)
    List<Object[]> countCondamnationsParLieu();

    Optional<Condamnation> findByImmatriculeVehicule(
            String immatriculeVehicule
    );
    
    Optional<Condamnation>
    findFirstByImmatriculeVehiculeOrderByDateCondamnationAsc(
            String immatriculation
    );

    void deleteBySortie_Id(Long sortieId);
}