// src/main/java/com/gestionnotes/backend/dto/CreateUserRequest.java
package com.gestionnotes.backend.dto;

public class CreateUserRequest {
    private String email;
    private String password;
    private String nom;      // optionnel
    private String prenom;   // optionnel

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
}