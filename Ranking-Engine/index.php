
<?php get_header(); ?>  

  <div class="next-wrapper">
    <div class="next z-depth-3 next-rank">
      <span class="next__text">Rank</span>
      <i class="material-icons medium white-text next__icon">chevron_right</i>
    </div>
  </div>

  <main class="container">
    <header class="header">
      <nav class="nav-extended nav-tre">
        <div class="nav-wrapper">
          <p class="brand-logo nav-tre__title">The Ranking Engine</p>
          <div class="help right">
            <input type="checkbox" class="help__checkbox" id="help-toggle">

            <label for="help-toggle" class="help__button">
              <i class="material-icons help__icon">help</i>
            </label>

            <div class="help__background">&nbsp;</div>

            <div class="help__text">
              <h3 class="center-align">Quick Help</h3>
              <div class="help__text-item help__text--start">
                <h4 class="center-align">Start</h4>
                <p>
                  If you have a previous session available you will be prompted to resume or discard it. Resuming picks
                  up
                  where you left off. Discarding deletes the previous session data completely.
                </p>
                <p>Otherwise, you have 2 options to get started:</p>
                <ol>
                  <li>Create a new list to rank - To get started just select a category for the list you want to create
                    and you will automatically be taken to the list creation step.</li>
                  <li>Load a previously saved list - Log in to get access to any previously saved lists. Then from the
                    My
                    Lists section select the list you want to load. The kind of list you select will determine where you
                    end up in the process.</li>
                </ol>
                <p><b>- In Progress:</b> this is a list in the process of being ranked. Selecting an In Progress list
                  will
                  take
                  you back to where you left off in the Rank step.</p>
                <p><b>- Final:</b> this is a list you previously ranked and saved the final outcome. Selecting a Final
                  list
                  will
                  take you to the Result step to view the results again.</p>
                <p><b>- Template:</b> this is a list saved prior to ranking. Selecting a template will load it into the
                  List step
                  for you to edit and start ranking when it is ready</p>
              </div>
              <div class="help__text-item help__text--list hide">
                <h4 class="center-align">List</h4>
                <p class="center-align">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet ad saepe excepturi reiciendis atque
                  molestias
                  consectetur corporis commodi, consequatur architecto ipsum voluptatum impedit sapiente recusandae ab.
                  Illo quis
                  commodi aperiam. Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
              </div>
              <div class=" help__text-item help__text--rank hide">
                <h4 class="center-align">Rank</h4>
                <p class="center-align">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet ad saepe excepturi reiciendis atque
                  molestias
                  consectetur corporis commodi, consequatur architecto ipsum voluptatum impedit sapiente recusandae ab.
                  Illo quis
                  commodi aperiam. Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
              </div>
              <div class=" help__text-item help__text--result hide">
                <h4 class="center-align">Result</h4>
                <p class="center-align">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet ad saepe excepturi reiciendis atque
                  molestias
                  consectetur corporis commodi, consequatur architecto ipsum voluptatum impedit sapiente recusandae ab.
                  Illo quis
                  commodi aperiam. Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
              </div>
            </div>
          </div>

          <div class="account right">
            <a id="nav-pm__account" class="modal-trigger" href="#!" data-target="account-modal"><i class="material-icons">account_circle</i></a>
          </div>

          <ul id="nav-mobile" class="right hide-on-med-and-down">
            <li><a href="#">Current Rankings</a></li>
            <li><a href="#">Codex</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div class="nav-content">
          <ul id="step-tabs" class="tabs tabs-transparent tabs-fixed-width step-tabs">
            <li id="start-tab" class="start-tab tab step-tabs__start "><a href="#start-container" id="start-tab-link" class="tooltipped active" data-tooltip="Start over">Start</a></li>
            <li id="list-tab" class="list-tab tab step-tabs__list disabled"><a href="#list-container" id="list-tab-link" class="" data-tooltip="">List</a></li>
            <li id="rank-tab" class="rank-tab tab step-tabs__rank disabled"><a href="#rank-container" id="rank-tab-link" class="" data-tooltip="">Rank</a></li>
            <li id="result-tab" class="result-tab tab step-tabs__result disabled"><a href="#result-container" id="result-tab-link">Result</a></li>
          </ul>
        </div>
      </nav>
    </header>

    <div id="start-wrapper" class="step-wrapper">
      <section id="start-container" class="start-container step-container">
        <div class="resume-session-container"></div>

        <div class="list-category-wrapper">
          <h5 class="center-align">Select a list category to get started:</h5>
          <div class="row">
            <div id="list-category" class="input-field col s12 m6 offset-m3">
              <select id="list-category-select">
                <option value="0" selected>Categories...</option>
                <option value="1">Beverages</option>
                <option value="2">Board Games</option>
                <option value="3">Books</option>
                <option value="4">Brews</option>
                <option value="5">Characters</option>
                <option value="6">Comics</option>
                <option value="7">Food</option>
                <option value="8">Movies</option>
                <option value="9">Music</option>
                <option value="10">People</option>
                <option value="11">Places</option>
                <option value="12">Sports</option>
                <option value="13">Toys</option>
                <option value="14">TV Shows</option>
                <option value="15">Video Games</option>
                <option value="16">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <h5 class="center-align">Current <?php echo date("Y"); ?> Top Games:</h5>
        <div class="row">
          <div class="col s12 m8 offset-m2">
            <table id="top-ten-year__table" class="striped">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Game</th>
                </tr>
              </thead>
              <tbody id="top-ten-year__rows"></tbody>
            </table>
          </div>
        </div>
        <div class="center-align">
          <a href="./rankings" class="waves-effect waves-light btn">See All Top Games<i class="material-icons small white-text">chevron_right</i></a>
        </div>
      </section>
    </div>

    <div id="list-wrapper" class="step-wrapper">
      <section id="list-container" class="list-container step-container">
        <div class="row">
          <h5 class="current-list-category col s12 m6"></h5>
          <h5 class ="current-template-desc col s12 m6"></h5>
          <ul class="collapsible col s12 popout">
            <li class="active">
              <div class="collapsible-header"><i class="material-icons">playlist_add</i>Text Entry</div>
              <div class="collapsible-body">
                <form>
                  <div class="row">
                    <div class="col s12 l2 center-align">
                      <a id="textarea-add-btn" class="waves-effect waves-light btn disabled"><i
                          class="material-icons right">add</i>Add</a>
                    </div>
                    <div class="input-field col s12 l10">
                      <textarea id="textarea-input" class="materialize-textarea"></textarea>
                      <label for="textarea-input">Type or Paste your items here</label>
                    </div>
                  </div>
                </form>
              </div>
            </li>
            <li class="bgg-section hide">
              <div class="collapsible-header"><i class="material-icons">cloud_download</i>Add from BGG</div>
              <div class="collapsible-body">
                <div class="bgg-username-submit">
                  <div class="row">
                    <div class="input-field col s12">
                      <input id="bgg-username" type="text">
                      <label for="bgg-username">BGG Username</label>
                    </div>
                  </div>
                  <div class="row">
                    <form class="col s6">
                      <div class="switch center-align">
                        <span class="bgg-filter-heading">Include Expansions?</span>
                        <p>
                          <label>
                            No
                            <input id="bgg-expansions" type="checkbox">
                            <span class="lever"></span>
                            Yes
                          </label>
                        </p>
                      </div>
                    </form>
                    <div class="col s6">
                      <a id="bgg-submit" class="waves-effect waves-light btn"><i
                          class="material-icons right">arrow_forward</i>Submit</a>
                    </div>
                  </div>
                </div>
                <div class="bgg-username-submitted hide">
                  <h4 class="bgg-username-header center-align"></h4>
                  <p class="center-align">
                    <a href="#!" class="change-bgg-username">(Change)</a>
                    <a href="#!" class="update-bgg-collection">(Update)</a>
                  </p>
                </div>
                <div class="bgg-list hide">
                  <div class="divider-sm"></div>
                  <h5>Filters</h5>

                  <p class="center-align bgg-filter-heading">List Types</p>

                  <div>
                    <form class="list-types" action="#">
                      <label class="bgg-cb">
                        <input class="fortrade" type="checkbox" />
                        <span>For Trade</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="own" type="checkbox" checked />
                        <span>Own</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="played" type="checkbox" checked />
                        <span>Played</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="prevowned" type="checkbox" />
                        <span>Prev Owned</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="rated" type="checkbox" />
                        <span>Rated</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="wantintrade" type="checkbox" />
                        <span>Want in Trade</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="wanttobuy" type="checkbox" />
                        <span>Want to Buy</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="wanttoplay" type="checkbox" />
                        <span>Want to Play</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="wishlist" type="checkbox" />
                        <span>Wishlist</span>
                      </label>
                    </form>
                  </div>
                  <div class="bgg-personal-rating">
                    <form class="bgg-personal-rating__form" action="#">
                      <span class="bgg-filter-heading">Min Personal Rating</span>
                      <p class="range-field">
                        <input type="range" id="personal-rating" value="0" min="0" max="10" />
                      </p>
                    </form>
                  </div>
                  <div class="divider-sm"></div>
                  <div class="collection-header-wrapper">
                    <h5 class="collection-header">Collection:</h5>
                    <div class="bgg-collection-info"></div>
                    <a id="bgg-add-selected" class="waves-effect waves-light btn"><i
                        class="material-icons right">add</i>Add Filtered</a>
                  </div>
                  <div class="bgg-collection">
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <ul class="list-collapsible collapsible col s12 popout">
            <li>
              <div class="list-header collapsible-header"><i class="material-icons">view_list</i><span
                  id="list-info">List: 0
                  items</span></div>
              <div class="collapsible-body">
                <div class="row list-buttons">
                  <div class="col s6 center-align">
                    <a id="clear-list" class="waves-effect waves-light btn"><i
                        class="material-icons right">clear</i>Clear</a>
                  </div>
                  <div class="col s6 center-align">
                    <a href="#login-modal" id="save-list"
                      class="waves-effect waves-light btn modal-trigger disabled save-btn"><i
                        class="material-icons right">save</i>Save</a>
                  </div>
                </div>

                <div class="row">
                  <div class="col s6 offset-s3 input-field">
                    <i class="material-icons prefix">filter_list</i>
                    <input id="search-text" type="text" placeholder="Search Items" />
                  </div>
                </div>
                <div class="row">
                  <div class="col s12 m8 offset-m2">
                    <ul id="list-items"></ul>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <div id="rank-wrapper" class="step-wrapper">
      <section id="rank-container" class="rank-container step-container">
        <div class="ranking">
          <div class="row">
            <div class="col s12 m10 offset-m1">
              <div class="progress">
                <div id="progress-bar" class="determinate" style="width: 0%"></div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col s6 center-align">
              <a id="undo-btn" class="waves-effect waves-light btn"><i class="material-icons right">undo</i>Undo</a>
            </div>
            <div class="col s6 center-align">
              <a href="#login-modal" id="save-ranking" class="waves-effect waves-light btn modal-trigger save-btn"><i
                  class="material-icons right">save</i>Save</a>
            </div>
          </div>
          <div class="divider"></div>
          <div class="row">
            <div class="col s12 m8 offset-m2 l6">
              <div id="item-1-card" class="card rank-card">
                <div class="rank-card-content card-content">
                  <img src="<?php echo get_theme_file_uri('/images/meeple-lime.png'); ?>" alt="" class="rank-card-content__img" id="item-1-img">
                  <p id="item-1-text" class="rank-card-content__text center-align">Game Name 1</p>
                  <i class="material-icons rank-card-content__delete" id="rank-delete-1">delete</i>
                </div>
              </div>
            </div>
            <div class="col s12 m8 offset-m2 l6">
              <div id="item-2-card" class="card rank-card">
                <div class="rank-card-content card-content">
                  <img src="<?php echo get_theme_file_uri('/images/meeple-orange.png'); ?>" alt="" class="rank-card-content__img" id="item-2-img">
                  <p id="item-2-text" class="rank-card-content__text center-align">Game Name 2</p>
                  <i class="material-icons rank-card-content__delete" id="rank-delete-2">delete</i>
                </div>
              </div>
            </div>
          </div>
          <div id="keys-reminder" class="row">
            <p class="center-align">
              Using the <i class="material-icons tiny">arrow_back</i>
              or <i class="material-icons tiny">arrow_forward</i>
              keys to make your selections will speed things up! Use
              <i class="material-icons tiny">arrow_upward</i>
              to Undo a selection.
            </p>
          </div>
        </div>
      </section>
    </div>

    <div id="result-wrapper" class="step-wrapper">
      <section id="result-container" class="result-container step-container">
        <div class="row support-us">
          <div class="col s12 m8 offset-m2 l6 offset-l3">
            <div class="card blue-grey darken-1">
              <div class="card-content white-text">
                <span class="card-title center-align">Hey, nice list!</span>
                <p class="center-align">If you found The Ranking Engine useful please consider putting something in our
                  tip jar.</p>
              </div>
              <div class="card-action center-align">
                <a href="#">Paypal</a>
                <a href="#" class="support-us__dismiss">Dismiss</a>
              </div>
            </div>
          </div>
        </div>

        <div id="results-table"></div>
      </section>
    </div>

  </main>

  <!-- Modals -->
  <!-- Save Modal -->
  <div id="save-modal" class="modal">
    <div class="modal-content">
      <a href="#!" class="modal-close btn-flat modal-close-x">
        <span aria-hidden="true">&times;</span>
      </a>
      <h4>Save Your List</h4>
      <p>Give your list a description and then click Save.</p>
      <div class="row">
        <div class="input-field col s12">
          <input id="save-description" type="text">
          <label id="save-description-label" for="save-description">Description</label>
        </div>
      </div>
    </div>
    <div class="modal-footer center-align">
      <a href="#!" id="save-list-btn" class="modal-close waves-effect waves-green btn-flat">Save New</a>
      <a href="#!" id="update-list-btn" class="modal-close waves-effect waves-green btn-flat hide">Update Current</a>
    </div>
  </div>

  <!-- Login Modal -->
  <div id="login-modal" class="modal">
    <div class="modal-content">
      <a href="#!" class="modal-close btn-flat modal-close-x">
        <span aria-hidden="true">&times;</span>
      </a>
      <h4>Login</h4>
      <div class="form-group">
        <form id="login-form" action="login" method="post">
          <p class="status center-align"></p>
          <div class="row">
            <div class="input-field col s12 m6">
              <input id="username" type="text" class="validate">
              <label for="username">User Name</label>
            </div>
            <div class="input-field col s12 m6">
              <input id="password" type="password" class="validate">
              <label for="password">Password</label>
            </div>
          </div>
          <div class="row center-align">
            <a href="<?php echo wp_lostpassword_url(); ?>" class="col s12 m6">Lost your password?</a>
            <a href="<?php echo wp_registration_url(); ?>" class="col s12 m6">Need to Register?</a>
          </div>
        <div class="modal-footer">
          <!-- <a href="#!" id="login-btn" class="modal-close waves-effect waves-green btn-flat">Login</a> -->
          <input id="login-form-button" class="waves-effect waves-green btn-flat" type="submit" value="Login" name="submit">
            <?php wp_nonce_field( 'ajax-login-nonce', 'security' ); ?>
        </div>
      </form>
    </div>
  </div>
  </div>

  <!-- Message Modal -->
  <div id="message-modal" class="modal">
    <div class="modal-content">
      <a href="#!" class="modal-close btn-flat modal-close-x">
        <span aria-hidden="true">&times;</span>
      </a>
      <h4>A Friendly Reminder</h4>
      <p class="message-text">Some Message Text</p>
    </div>
    <div class="modal-footer">
      <a href="#!" id="message-ok-btn" class="modal-close waves-effect waves-green btn-flat">Ok</a>
    </div>
  </div>

  <!-- Alert Modal -->
  <div id="alert-modal" class="modal">
    <div class="modal-content">
      <h4>Heads Up!</h4>
      <p class="alert-text">Some Alert Text</p>
    </div>
    <div class="modal-footer">
      <a href="#!" id="alert-ok-btn" class="modal-close waves-effect waves-green btn-flat">Ok</a>
      <a href="#!" id="alert-cancel-btn" class="modal-close waves-effect waves-green btn-flat">Cancel</a>
    </div>
  </div>

  <!-- Restart Modal -->
  <div id="restart-modal" class="modal">
    <div class="modal-content">
      <h4>Restart Options</h4>
      <div class="rerank-options">
        <form class="rerank-options__radio" action="#">
          <p>
            <label>
              <input class="with-gap" name="rerank-options" type="radio" id="restart-complete" checked />
              <span class="total-list-size">Complete: Items</span>
            </label>
          </p>
          <p>
            <label>
              <input class="with-gap" name="rerank-options" type="radio" id="restart-partial" />
              <span>Top X</span>
            </label>
          </p>
        </form>
        <div class="input-field rerank-options__num">
          <input id="num-of-items" type="number" class="validate">
          <label class="active" for="num-of-items">Enter # of Items</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <a href="#!" id="restart-ok-btn" class="modal-close waves-effect waves-green btn-flat">Ok</a>
      <a href="#!" id="restart-cancel-btn" class="modal-close waves-effect waves-green btn-flat">Cancel</a>
    </div>
  </div>

    <!-- Bottom Modal -->
    <div id="account-modal" class="modal bottom-sheet">
    <div class="modal-content">
    <a href="#!" class="modal-close btn-flat modal-close-x">
        <span aria-hidden="true">&times;</span>
      </a>
      <div class="container center-align">
      <h4>My Lists</h4>
        <div class="my-lists"></div>
      </div>

    </div>
  </div>

  <script src="<?php echo get_theme_file_uri('/dist/index-bundle.js'); ?>"></script>

  <?php get_footer();
