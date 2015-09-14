'use strict';

var React = require('react');
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

// Pages
var Application = require('./pages/Application');
var Index = require('./pages/Index');
var BrandList = require('./pages/BrandList');
var BranchList = require('./pages/BranchList');
var Chart = require('./pages/Chart');
var NotFound = require('./pages/NotFound');

var routes = (
  <Route name="home" path="/" handler={Application}>
    <DefaultRoute handler={Index}/>
    <Route name='brand' path="/brand/:brand_id" handler={BrandList} />
    <Route name="branch" path="/brand/:brand_id/branch/:branch_id" handler={BranchList} />
    <Route name="chart" handler={Chart}/>

    <NotFoundRoute handler={NotFound} />
  </Route>
);

module.exports = routes;


/*
<Route name="home" path="/" handler={Application}>

  <DefaultRoute handler={MainLanding} />

  <Route name="login" handler={Login} />
  <Route name="signup" handler={Signup} />
  <Route name="logout" handler={Logout} />
  <Route name="forgot" handler={Forgot} />

  <Route name="calculator" handler={Calculator} />

  <Route name="feed" handler={Feed} />
  <Route name="status-update" path="status-update/:id"  handler={StatusUpdate} />
  <Route name="status-update-edit" path="status-update/:id/edit"  handler={StatusUpdateEdit} />

  <Route name="recipes" handler={Recipes} />
  <Route name="recipe" path="recipes/:id" handler={Recipe} />
  <Route name="editRecipe" path="recipes/:id/edit" handler={RecipeEdit} />
  <Route name="printRecipe" path="recipes/:id/print" handler={RecipePrint} />

  <Route name="recipe-journal" path="recipes/:recipeId/journals/:journalId" handler={RecipeJournal} />
  <Route name="recipe-journal-edit" path="recipes/:recipeId/journals/:journalId/edit" handler={RecipeJournalEdit} />


  <Route name="oils" handler={Oils} />
  <Route name="oil" path="oils/:id" handler={Oil} />

  <Route name="print" handler={PrintCalculation} />

  <Route name="resources" handler={Resources} />

  <Route name="userProfile" path="users/:id" handler={UserProfile} />

  <Route name="account" path="/my" handler={Account}>
    <Route name="profile" handler={MyProfile} />
    <Route name="my-recipes" handler={MyRecipes} />
    <Route name="my-friend-recipes" handler={MyFriendsRecipes} />
    <Route name="saved-recipes" handler={SavedRecipes} />
    <Route name="my-comments" handler={MyComments} />
    <Route name="my-status-updates" handler={MyStatusUpdates} />
  </Route>

  </Route>

 */
