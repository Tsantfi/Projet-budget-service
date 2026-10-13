package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Livret;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LivretRepository extends JpaRepository<Livret, Long> {
    Optional<Livret> findByAnnee(Integer annee);
}
