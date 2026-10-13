package mg.drbf.haigana.security;

import lombok.Getter;
import mg.drbf.haigana.entity.Compte;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CompteUserDetails implements UserDetails {

    private final Compte compte;

    public CompteUserDetails(Compte compte) {
        this.compte = compte;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + compte.getRole().name()));
    }

    @Override
    public String getPassword() {
        return compte.getMotPasse();
    }

    @Override
    public String getUsername() {
        return compte.getImmatricule();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return compte.isActif(); }
}
