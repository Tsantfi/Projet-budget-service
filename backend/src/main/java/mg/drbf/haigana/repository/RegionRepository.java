package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long> {

    List<Region> findByNomRegionContainingIgnoreCase(String nomRegion);

    boolean existsByNomRegionIgnoreCase(String nomRegion);
}