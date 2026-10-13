package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Marque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarqueRepository extends JpaRepository<Marque, Long> {

    Optional<Marque> findByMarqueVehiculeIgnoreCase(String marqueVehicule);
}