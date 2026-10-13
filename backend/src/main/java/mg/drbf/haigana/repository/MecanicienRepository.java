package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Mecanicien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MecanicienRepository extends JpaRepository<Mecanicien, Long> {
}
