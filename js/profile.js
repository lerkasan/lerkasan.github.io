function validate() {
    let firstName = document.forms["profileInfo"]["firstName"].value;
    if (!firstName) {
        alert("First Name is required");
        return false;
    }
    let email = document.forms["profileInfo"]["email"].value;
    if (!email) {
        alert("Email is required");
        return false;
    }
    let birthday = document.forms["profileInfo"]["birthday"].value;
    if (!birthday) {
        alert("Date of Birth is required");
        return false;
    }

    let profileInfo = {
        firstName: firstName,
        email: email,
        birthday: birthday
    }

    localStorage.setItem('profileInfo', JSON.stringify(profileInfo));
}