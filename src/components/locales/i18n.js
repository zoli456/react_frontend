import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            login: "Login",
            register: "Register",
            name: "Name:",
            email: "Email:",
            password: "Password:",
            confirmPassword: "Confirm Password:",
            needAccount: "Need an account? Register",
            haveAccount: "Have an account? Login",
            passwordMismatch: "Passwords do not match.",
            errorOccurred: "An error occurred.",
            language: "Language",
            home: "Home",
            forms: "Forms",
            userList : "User list",
            welcome: "Welcome",
            lightMode: "Light mode",
            darkMode: "Dark mode",
            profile: "Profile",
            logout: "Logout",
            confirmLogout : "Are you sure you want to logout?",
            userprofile: "User profile",
            email_update_failed: "Failed to update the email address.",
            email_update_successfull: "Successfully updated the email address.",
            password_not_match : "Password does not match.",
            password_change_success: "Password changed successfully.",
            password_change_failed : "Password changed failed.",
            new_email : "New Email",
            submit: "Submit",
            cancel : "Cancel",
            old_password: "Old password",
            new_password: "New Password",
            retype_password: "Retype New Password",
            change_email: "Change email",
            change_password: "Change password",
            roles: "Roles:",
            question_delete_form: "Do you want to delete this form?",
            delete_failed : "Deletion failed.",
            available_forms: "Available forms",
            edit: "Edit",
            delete: "Delete",
            answers: "Answers",
            create_form: "+ Create Form",
            completeCaptcha: "Please complete the captcha verification"
        }
    },
    hu: {
        translation: {
            login: "Bejelentkezés",
            register: "Regisztráció",
            name: "Név:",
            email: "E-mail:",
            password: "Jelszó:",
            confirmPassword: "Jelszó megerősítése:",
            needAccount: "Nincs fiókod? Regisztrálj",
            haveAccount: "Van fiókod? Jelentkezz be",
            passwordMismatch: "A jelszavak nem egyeznek.",
            errorOccurred: "Hiba történt.",
            language: "Nyelv",
            home: "Kezdőlap",
            forms: "Űrlapok",
            userList: "Felhasználó lista",
            welcome: "Köszöntelek",
            lightMode: "Világos mód",
            darkMode: "Sötét mód",
            profile: "Profil",
            logout: "Kijelentkezés",
            confirmLogout : "Biztosan ki akarsz jelentkezni?",
            userprofile: "Felhasználói profil",
            email_update_failed: "Nem sikerült frissíteni az e-mail címet.",
            email_update_successfull: "Az e-mail cím sikeresen frissítve.",
            password_not_match : "A jelszó nem egyezik.",
            password_change_success: "A jelszó sikeresen megváltozott.",
            password_change_failed : "A jelszó megváltoztatása nem sikerült.",
            new_email : "Új e-mail",
            submit: "Küldés",
            cancel : "Mégse",
            old_password: "Régi jelszó",
            new_password: "Új jelszó",
            retype_password: "Írja be újra az új jelszót",
            change_email: "E-mail-cím módosítása",
            change_password: "Jelszó módosítása",
            roles: "Szerepek:",
            question_delete_form: "Törölni szeretné ezt az űrlapot?",
            delete_failed : "A törlés nem sikerült.",
            available_forms: "Elérhető űrlapok",
            edit: "Szerkeszt",
            delete: "Törlés",
            answers: "Válaszok",
            create_form: "+ Űrlap készítés",
            completeCaptcha: "Kérlek, teljesítsd a captcha ellenőrzést"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // Default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: true,
        },
    });

export default i18n;
