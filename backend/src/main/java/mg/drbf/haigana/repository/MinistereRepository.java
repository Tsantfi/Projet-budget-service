package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Ministere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MinistereRepository
        extends JpaRepository<Ministere, Long> {

    List<Ministere> findByNomMinistereContainingIgnoreCase(
            String nomMinistere
    );

    boolean existsByNomMinistereIgnoreCase(
            String nomMinistere
    );

    Optional<Ministere>
    findByNomMinistereIgnoreCaseAndDistrictMinistereIgnoreCase(
            String nomMinistere,
            String districtMinistere
    );
}