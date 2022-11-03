"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  $loginForm.hide();
  $signupForm.hide();
}

$loginForm.on("submit", login);

async function updateUser(username, password){

}

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  try{
    // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
    currentUser = await User.signup(username, password, name);

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
    $signupForm.trigger("reset");
    $loginForm.hide();
    $signupForm.hide();
  } catch (e) {
    alert("Sign up failed!")
  } 
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

 async function updateUser(evt) {
  console.debug("updateUser", evt);
  evt.preventDefault();

  const name = $("#edit-user-name").val()
  
  const newPassword = $("#new-password").val();
  

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  await currentUser.updateUser(name, newPassword);

  $editUserForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  $editUserForm.hide()
}

$editUserForm.on("submit", updateUser);

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}

async function toggleFavorite(e){  
  const $closestLi = $(e.target).closest("li");
  const storyId = $closestLi.attr("id");

  console.log('toggle favorite:', currentUser)
  console.log('toggle favorite: ', e.target.classList, storyId)  
  
  const story = storyList.stories.find(s => s.storyId === storyId);

  if (e.target.classList.contains("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story); 
    e.target.classList.remove('fas')   
    e.target.classList.add('far')
  } else {    
    await currentUser.addFavorite(story);  
    e.target.classList.remove('far')   
    e.target.classList.add('fas') 
  } 
  
}

