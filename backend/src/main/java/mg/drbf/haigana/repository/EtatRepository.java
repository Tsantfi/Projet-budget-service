package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Etat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EtatRepository extends JpaRepository<Etat, Long> {
}
