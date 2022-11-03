"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  storyList = await StoryList.getStories();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

function navUserProfileClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $('#edit-user-name').val(currentUser.name)
  $editUserForm.show();
}

function navEditStoryClick(evt){
  console.debug('navEditStoryClick', evt)
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
  const story = currentUser.getStory(storyId)

  console.log(story)
  
  $('#edit-story-title').val(story.title)
  $('#edit-story-title').attr('data-story-id', storyId)
  $('#edit-story-author').val(story.author)
  $('#edit-story-url').val(story.url)
  $editStoryForm.show()
}

function navNewStoryClick(evt) {
  console.debug("navNewStoryClick", evt);
  hidePageComponents();
  $newStoryForm.show();  
}

function navFavoritesClick(evt){
  console.debug('navFavoritesClick', evt)
  putFavoritesOnPage()
}

function navMyStoriesClick(evt) {
  console.debug('navMyStoriesClick', evt)
  putMyStoriesOnPage()
}

$navLogin.on("click", navLoginClick);

$navNewStory.on('click', navNewStoryClick)

$navFavorites.on('click', navFavoritesClick)

$navMyStories.on('click', navMyStoriesClick)

$navUserProfile.on('click', navUserProfileClick)


/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  console.log('updateNavOnLogin ', currentUser)
  if (currentUser){
    $navLogOut.show();
    $navleft.show()
    $navLogin.hide();
    $navUserProfile.text(`${currentUser.username}`).show();
    putStoriesOnPage()
  } else {
    $navLogin.show();
  }  
}
