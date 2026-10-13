package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.SoaCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoaCodeRepository
        extends JpaRepository<SoaCode, Long> {

    // RECHERCHE PAR CODE SOA

    Optional<SoaCode> findByCodeSoa(String codeSoa);

    // RECHERCHE + TRI

    @Query("""
        SELECT DISTINCT s
        FROM SoaCode s
        LEFT JOIN FETCH s.region
        LEFT JOIN FETCH s.ministere
        WHERE
            LOWER(s.codeSoa) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.region.nomRegion) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.ministere.nomMinistere) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.ministere.districtMinistere) LIKE LOWER(CONCAT('%', :search, '%'))
        """)
    List<SoaCode> search(
            @Param("search") String search
    );

    // LISTE AVEC REGION + MINISTERE

    @Query("""
      SELECT DISTINCT s
      FROM SoaCode s
      LEFT JOIN FETCH s.region
      LEFT JOIN FETCH s.ministere
      """)
    List<SoaCode> findAllComplete();

}