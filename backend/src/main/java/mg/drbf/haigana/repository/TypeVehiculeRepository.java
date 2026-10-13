package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.TypeVehicule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypeVehiculeRepository extends JpaRepository<TypeVehicule, Long> {

    Optional<TypeVehicule> findByTypeDuVehiculeIgnoreCase(String typeDuVehicule);
}