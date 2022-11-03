"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, viewType=VIEW_ALL_LOGGED_IN) {
  if (!currentUser) viewType = VIEW_ALL_LOGGED_OUT

  console.debug("generateStoryMarkup", story);
  let leftHTML = ''
  let starHTML = '' 
  let deleteHTML = ''

  const hostName = story.getHostName();

  if (viewType != VIEW_ALL_LOGGED_OUT){
    starHTML = getStarHTML(story, currentUser)
    if (viewType != VIEW_ALL_LOGGED_IN){
      deleteHTML = getDeleteAndEditBtnHTML(story, currentUser)
    }    
  }
  
  leftHTML = deleteHTML + starHTML

  console.log("leftHTML ", leftHTML)

  return $(`
      <li id="${story.storyId}">
        ${leftHTML}        
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteAndEditBtnHTML(story, user) {
  if (!user.ownStories.some(s=>s.storyId === story.storyId)) return ''
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt trash-black"></i>
      </span>
      <span>
        <i class="far fa-edit"></i>
      </span>`;
}

function getStarHTML(story, user) {
  if (!user) return ''

  let starClass = 'fa fa-star'
  if (user.isFavorite(story.storyId)){
    console.log('getStarHTML found favorite')
    starClass += ' fas'
  } else {
    starClass += ' far'
  }
  
  return `
      <span class="star">
        <i class="${starClass}"></i>
      </span>`;
}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $favoritedStoriesList.hide()
  $myStoriesList.hide()

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);    
  }
  $('.fa').on('click', toggleFavorite)
  $allStoriesList.show();
}

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.hide()
  $myStoriesList.hide()

  $favoritedStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let fav of currentUser.getFavorites()) {
    const $story = generateStoryMarkup(fav, VIEW_FAVORITE);
    $favoritedStoriesList.append($story);    
  }
  $('.fa').on('click', toggleFavorite)
  $('.trash-black').on('click', deleteStory)
  $('.fa-edit').on('click', navEditStoryClick)
  $favoritedStoriesList.show();
}

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $favoritedStoriesList.hide()
  $allStoriesList.hide()

  $myStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    if (story.username === currentUser.username){
      const $story = generateStoryMarkup(story, VIEW_MY_STORIES);
      $myStoriesList.append($story);   
    }     
  }
  $('.fa').on('click', toggleFavorite)
  $('.trash-black').on('click', deleteStory)
  $('.fa-edit').on('click', navEditStoryClick)
  $myStoriesList.show();
}

async function deleteStory(evt) {
  console.log('delete story', evt)
  
  try {   
    const $closestLi = $(evt.target).closest("li");
    const storyId = $closestLi.attr("id");
    console.log('deleteStory ', currentUser.loginToken, storyId)
    const success = await storyList.deleteStory(currentUser.loginToken, storyId); 
    currentUser.ownStories.filter(s=>s.storyId !== storyId) 
    currentUser.favorites.filter(f=>f.storyId !== storyId)
    $closestLi.remove()
  } catch(e){
    alert('Delete story failed.')
    console.log(e)
  } 
}

async function editStory(evt) {
  console.log('edit story', evt)
  
  try {   
    evt.preventDefault();

    const title = $("#edit-story-title").val();
    const author = $("#edit-story-author").val();
    const url = $("#edit-story-url").val();

    const storyId = $("#edit-story-title").attr('data-story-id')
    console.log(storyId)
    const story = currentUser.getStory(storyId)
    story.title = title
    story.author = author
    story.url = url

    await currentUser.updateStory(story)

    $editStoryForm.slideUp('slow')
    $editStoryForm.trigger('reset')

    storyList.stories.map(s=>{
      s.title = title
      s.author = author
      s.url = url
    })
  } catch(e){
    alert('Edit story failed.')
    console.log(e)
  } 
}

async function addStory(evt) {
  console.debug("add story", evt);
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();

  const username = currentUser.username
  const storyData = {title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);

  if (!story) {
    // display error message
    alert('Add story failed.')
    return
  }

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  // hide the form and reset it
  $newStoryForm.slideUp("slow");
  $newStoryForm.trigger("reset");

  putStoriesOnPage()
}


$newStoryForm.on("submit", addStory);
$editStoryForm.on('submit', editStory)


