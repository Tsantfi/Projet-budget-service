package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Compte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompteRepository extends JpaRepository<Compte, Long> {
    
    Optional<Compte> findByImmatricule(String immatricule);
    
    boolean existsByImmatricule(String immatricule);
}
