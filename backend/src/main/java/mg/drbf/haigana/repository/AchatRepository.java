package mg.drbf.haigana.repository;

import java.util.List;
import mg.drbf.haigana.entity.Achat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AchatRepository extends JpaRepository<Achat, Long> {
    List<Achat> findByEntree_Id(Long entreeId);
    void deleteByEntree_Id(Long entreeId);
}

