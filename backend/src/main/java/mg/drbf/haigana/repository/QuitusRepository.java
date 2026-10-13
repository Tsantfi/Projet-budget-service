package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Quitus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface QuitusRepository extends JpaRepository<Quitus, Long> {
}
