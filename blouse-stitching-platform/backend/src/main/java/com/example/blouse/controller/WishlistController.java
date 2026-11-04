package com.example.blouse.controller;

import com.example.blouse.entity.Design;
import com.example.blouse.entity.User;
import com.example.blouse.entity.WishlistItem;
import com.example.blouse.repository.DesignRepository;
import com.example.blouse.repository.UserRepository;
import com.example.blouse.repository.WishlistItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistItemRepository wishlistRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;

    public WishlistController(WishlistItemRepository wishlistRepository, UserRepository userRepository, DesignRepository designRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    @GetMapping
    public List<Design> getWishlist() {
        User user = getAuthenticatedUser();
        return wishlistRepository.findByUserId(user.getId())
                .stream()
                .map(WishlistItem::getDesign)
                .collect(Collectors.toList());
    }

    @PostMapping("/{designId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long designId) {
        User user = getAuthenticatedUser();
        Optional<Design> designOpt = designRepository.findById(designId);
        
        if (designOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        Optional<WishlistItem> existing = wishlistRepository.findByUserIdAndDesignId(user.getId(), designId);
        if (existing.isEmpty()) {
            WishlistItem item = new WishlistItem();
            item.setUser(user);
            item.setDesign(designOpt.get());
            wishlistRepository.save(item);
        }
        
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{designId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long designId) {
        User user = getAuthenticatedUser();
        wishlistRepository.findByUserIdAndDesignId(user.getId(), designId)
                .ifPresent(wishlistRepository::delete);
                
        return ResponseEntity.ok().build();
    }
}
