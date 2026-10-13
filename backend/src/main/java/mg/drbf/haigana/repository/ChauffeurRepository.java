package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Chauffeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChauffeurRepository extends JpaRepository<Chauffeur, Long> {
    List<Chauffeur> findByNomChauffeurContainingIgnoreCase(String nom);
    List<Chauffeur> findByCinChauffeurContainingIgnoreCase(String cin);
    List<Chauffeur> findByImmatriculeChauffeurContainingIgnoreCase(String immatricule);
    boolean existsByImmatriculeChauffeur(String immatricule);
    Optional<Chauffeur> findByImmatriculeChauffeur(
            String immatriculeChauffeur
    );
}