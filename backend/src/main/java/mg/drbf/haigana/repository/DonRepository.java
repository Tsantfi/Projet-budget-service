package mg.drbf.haigana.repository;

import java.util.List;
import mg.drbf.haigana.entity.Don;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonRepository extends JpaRepository<Don, Long> {
    List<Don> findByEntree_Id(Long entreeId);
    void deleteByEntree_Id(Long entreeId);
}
