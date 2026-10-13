package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.ArgentPublicVehicule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArgentPublicVehiculeRepository
        extends JpaRepository<ArgentPublicVehicule, Long> {

    Optional<ArgentPublicVehicule> findFirstByOrderByIdAsc();
}
