
<?php get_header(); ?>  

  <main class="container">
    <header class="header">
      <nav class="nav-extended nav-re">
        <div class="nav-wrapper">
          <p class="brand-logo nav-re__title">Ranking Engine</p>
          
          <div class="help right">
            <input type="checkbox" class="help__checkbox" id="help-toggle">
            <label for="help-toggle" class="help__button">
              <i class="material-icons help__icon">help</i>
            </label>
            <div class="help__background">&nbsp;</div>
            <div class="help__text"></div>
          </div>

          <div class="account right">
            <a id="nav-re__account" class="modal-trigger" href="#!" data-target="account-modal"><i class="material-icons">account_circle</i></a>
          </div>

          <ul id="nav-mobile" class="right hide-on-med-and-down">
            <li><a href="./rankings">Current Rankings</a></li>
          </ul>
        </div>

        <div class="nav-content">
          <ul id="step-tabs" class="tabs tabs-transparent tabs-fixed-width step-tabs">
            <li id="start-tab" class="tab step-tabs__start "><a href="#start-container" id="start-tab-link" class="tooltipped active" data-tooltip="Start over">Start</a></li>
            <li id="list-tab" class="tab step-tabs__list disabled"><a href="#list-container" id="list-tab-link" class="" data-tooltip="">List</a></li>
            <li id="rank-tab" class="tab step-tabs__rank disabled"><a href="#rank-container" id="rank-tab-link" class="" data-tooltip="">Rank</a></li>
            <li id="result-tab" class="tab step-tabs__result disabled"><a href="#result-container" id="result-tab-link">Result</a></li>
          </ul>
        </div>
      </nav>
    </header>

    <section id="start-wrapper" class="step-wrapper">
      <div id="start-container" class="step-container">

        <div class="row list-category-wrapper">
          <div class="col s12 m10 offset-m1 l8 offset-l2 ">
            <div class="card z-depth-4">
              <div class="card-content">
                <span class="card-title center-align">What would you like to rank?</span>
                  <div id="list-category" class="input-field">
                    <select id="list-category-select">
                      <option value="0" selected>Select a category...</option>
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
          </div>
        </div>

        <div class="divider"></div>

        <div class="current-rankings-wrapper">
          <p class="center-align section-title">Current <?php echo date("Y"); ?> Top Games:</p>
          <div class="center-align">
            <a href="./rankings" class="waves-effect waves-light btn all-top-games-btn">See All Top Games<i class="material-icons right small white-text">chevron_right</i></a>
          </div>
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
        </div>
      </div>
    </section>

    <section id="list-wrapper" class="step-wrapper">
      <div id="list-container" class="step-container">
        <div class="row">
          <div class="list-info">
            <p class="current-list-category section-title"></p>
            <p class ="current-template-desc section-title"></p>
          </div>
        </div>
        <div class="divider-sm"></div>
        <div class="row list-editor">
          <ul class="collapsible popout col s12 m12 l6 add-options-sections">
            <li class="bgg-section hide">
              <div class="collapsible-header"><i class="material-icons">cloud_download</i>BGG Collection</div>
              <div class="collapsible-body">
                <form autocomplete="off" onsubmit="return false;" class="bgg-username-submit">
                  <div class="row">
                    <div class="col s12 input-field">
                      <input id="bgg-username" type="text">
                      <label for="bgg-username">BGG Username</label>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col s6">
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
                    </div>
                    <div class="col s6">
                      <button type="submit" id="bgg-submit" class="waves-effect waves-light btn"><i
                          class="material-icons right">arrow_forward</i>Go
                      </button>
                    </div>
                  </div>
                </form>
                <div class="ball-loading collection" style="display: none">
                  <i class="ball"></i>
                </div>
                <div class="bgg-collection__wrapper hide">
                  <h4 class="bgg-username-header center-align section-title"></h4>
                  <p class="center-align">
                    <a href="#!" class="change-bgg-username">(Change)</a>
                    <!-- <a href="#!" class="update-bgg-collection">(Update)</a> -->
                  </p>
                </div>
                <div class="bgg-list hide">
                  <div class="divider-sm"></div>
                  <h5 class="section-title">Filters</h5>

                  <p class="center-align bgg-filter-heading">List Types</p>

                  <div>
                    <form class="list-types-wrapper" action="#">
                    <div class="list-types">
                      <label class="bgg-cb">
                        <input class="own" type="checkbox" checked />
                        <span>Own</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="played" type="checkbox" checked />
                        <span>Played</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="rated" type="checkbox" />
                        <span>Rated</span>
                      </label>
                    </div>
                    <div class="list-types">
                      <label class="bgg-cb">
                        <input class="prevowned" type="checkbox" />
                        <span>Prev Owned</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="fortrade" type="checkbox" />
                        <span>For Trade</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="wishlist" type="checkbox" />
                        <span>Wishlist</span>
                      </label>
                    </div>
                    <div class="list-types">
                      <label class="bgg-cb">
                        <input class="wanttobuy" type="checkbox" />
                        <span>Want to Buy</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="wanttoplay" type="checkbox" />
                        <span>Want to Play</span>
                      </label>
                      <label class="bgg-cb">
                        <input class="want" type="checkbox" />
                        <span>Want in Trade</span>
                      </label>
                    </div>
                    </form>
                  </div>
                  <div class="bgg-personal-rating">
                    <form class="bgg-personal-rating__form" action="#">
                    <div class="center-align">
                      <span class="bgg-filter-heading">Min Personal Rating</span>
                    </div>
                      <p class="range-field">
                        <input type="range" id="personal-rating" value="0" min="0" max="10" />
                      </p>
                    </form>
                  </div>
                  <div class="center-align">
                    <a id="bgg-add-selected" class="waves-effect waves-light btn"><i class="material-icons right">add</i>Add Filtered</a>
                  </div>
                  <div class="divider-sm"></div>
                  <div class="collection-header-wrapper">
                    <div class="bgg-collection-info section-title"></div>
                  </div>
                  <div class="divider-sm"></div>
                  <div class="bgg-collection__items">
                  </div>
                </div>
              </div>
            </li>
            <li class="bgg-search hide">
              <div class="collapsible-header"><i class="material-icons">search</i>BGG Search</div>
              <div class="collapsible-body">
                <p class="center-align" style="font-style: italic">Note: The Ranking Engine only returns up to 50 search results at a time. If you do not see what you are looking for please be more specific in your search.</p>
                <form autocomplete="off" onsubmit="return false;" class="bgg-search-submit">
                    <div class="row">
                      <div class="col s12 input-field">
                        <input id="bgg-search" type="text">
                        <label for="bgg-search">Search Text</label>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col s8">
                        <div class="">
                          <span class="bgg-filter-heading">Search For:</span>
                          <p class="type-radio">
                            <label>
                              <input class="with-gap" id="boardgames" name="bgg-search-type" type="radio" checked  />
                              <span>Board Games</span>
                            </label>
                            <label>
                              <input class="with-gap" id="expansions" name="bgg-search-type" type="radio"  />
                              <span>Expansions</span>
                            </label>
                          </p>
                        </div>
                      </div>
                      <div class="col s4">
                        <button type="submit" id="bgg-search-submit" class="waves-effect waves-light btn"><i
                            class="material-icons right">arrow_forward</i>Go
                        </button>
                      </div>
                    </div>
                  </form>
                  <div class="ball-loading search-results" style="display: none">
                    <i class="ball"></i>
                  </div>
                  <div class="bgg-search__wrapper hide">
                    <div class="divider-sm"></div>
                    <div class="bgg-search-results-header">
                      <h4 class="section-title bgg-search-results-header__title">Search Results:</h4>
                      <div class="input-field bgg-search-results-header__select">
                        <select id="bgg-search-sort-select">
                          <option value="bgg-rating" selected>BGG Rating</option>
                          <option value="alphabetical">Alphabetical</option>
                        </select>
                        <label>Sort Results By:</label>
                      </div>
                    </div>
                    <div class="divider-sm"></div>
                    <div class="bgg-search__items"></div>
                  </div>
              </div>

            </li>
            <li class="text-entry active">
              <div class="collapsible-header"><i class="material-icons">playlist_add</i>Text Entry</div>
              <div class="collapsible-body">
                <form>
                    <div class="center-align">
                      <a id="textarea-add-btn" class="waves-effect waves-light btn disabled"><i
                          class="material-icons right">add</i>Add</a>
                    </div>
                    <div class="input-field">
                      <textarea id="textarea-input" class="materialize-textarea"></textarea>
                      <label for="textarea-input">Enter items here (multiple lines allowed)</label>
                    </div>
                </form>
              </div>
            </li>
          </ul>
          <ul class="list-collapsible collapsible popout col s12 m12 l6">
            <li class="active">
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

                  <div class="input-field">
                    <form autocomplete="off">
                      <i class="material-icons prefix">filter_list</i>
                      <input id="search-text" type="text" placeholder="Search Items" />
                    </form>
                  </div>

                  <div class="list__items">
                    <!-- <ul id="list__items"></ul> -->
                  </div>
              </div>
            </li>
          </ul>
        </div>

     </div>
    </section>

    <section id="rank-wrapper" class="step-wrapper">
      <div id="rank-container" class="step-container">
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
              <div id="item-1-card" class="card rank-card z-depth-3">
                <div class="rank-card-content card-content">
                  <img src="<?php echo get_theme_file_uri('/images/meeple-lime.png'); ?>" alt="" class="rank-card-content__img" id="item-1-img">
                  <p id="item-1-text" class="rank-card-content__text center-align">Game Name 1</p>
                  <i class="material-icons rank-card-content__delete" id="rank-delete-1">delete</i>
                </div>
              </div>
            </div>
            <div class="col s12 m8 offset-m2 l6">
              <div id="item-2-card" class="card rank-card z-depth-3">
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
      </div>
    </section>

    <section id="result-wrapper" class="step-wrapper">
      <div id="result-container" class="step-container">
        <div id="results-table"></div>
        <div id="results-table-wrapper"></div>
      </div>
    </section>
  </main>

  <!-- Next Button -->
  <div class="next-wrapper">
    <div class="next z-depth-3 next-rank">
      <span class="next__text">Rank</span>
      <i class="material-icons medium white-text next__icon">chevron_right</i>
    </div>
  </div>

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
      <h4 class="center-align">For Your Info</h4>
      <p class="message-text center-align">Some Message Text</p>
    </div>
    <div class="modal-footer">
      <a href="#!" id="message-ok-btn" class="modal-close waves-effect waves-green btn-flat">Ok</a>
    </div>
  </div>

  <!-- Alert Modal -->
  <div id="alert-modal" class="modal">
    <div class="modal-content">
      <h4 class="center-align">Heads Up!</h4>
      <p class="alert-text center-align">Some Alert Text</p>
    </div>
    <div class="modal-footer">
      <a href="#!" id="alert-ok-btn" class="modal-close waves-effect waves-green btn-flat">Ok</a>
      <a href="#!" id="alert-cancel-btn" class="modal-close waves-effect waves-green btn-flat">Cancel</a>
    </div>
  </div>

  <!-- Restart Modal -->
  <div id="restart-modal" class="modal">
    <div class="modal-content">
      <h4 class="center-align">Restart Options</h4>
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

    <!-- Top 9 Modal -->
    <div id="top-nine-modal" class="modal">
      <div class="modal-content">
        <a href="#!" class="modal-close btn-flat modal-close-x">
          <span aria-hidden="true">&times;</span>
        </a>
        <h4 class="center-align">Your Top Nine</h4>
        <p class="center-align">To save the image, right click (on desktop) or long press (on mobile) and select Save Image. If there is an issue with the image, close this dialog and click the Top Nine button again to regenerate the image.</p>
        <div class="image-wrapper">
          <img src="" alt="" class="top-nine-image" style="display: none">
          <div class="ball-loading top-nine" style="display: none">
            <i class="ball"></i>
          </div>
          <!-- <canvas width="1080" height="1080" class="top-nine-canvas"></canvas> -->
        </div>
      </div>
  </div>

    <!-- Bottom Modal -->
  <div id="account-modal" class="modal bottom-sheet">
    <div class="modal-content account-modal__content">
    <a href="#!" class="modal-close btn-flat modal-close-x">
        <span aria-hidden="true">&times;</span>
      </a>
      <div class="container center-align">
      <h4>My Lists</h4>
        <div class="my-lists"></div>
      </div>
    </div>
  </div>

  <!-- Share Modal -->
  <div id="share-modal" class="modal">
    <div class="modal-content">
      <a href="#!" class="modal-close btn-flat modal-close-x">
        <span aria-hidden="true">&times;</span>
      </a>
      <h4 class="center-align share-list__heading">Sharing Options</h4>
      <div class="switch center-align">
        <p class="bgg-filter-heading">Sharing: </p>
        <label>
          Off
          <input id="share-switch" type="checkbox">
          <span class="lever"></span>
          On
        </label>
      </div>

          <div class="input-field">
            <input disabled value="URL" class="center-align" id="share-list__url" type="text">
            <p class="share-list__important-text center-align">**Important: Sharing must be turned on for the link to work</p>
          </div>

        <div class="row">
          <div class="col s12 center-align share-list__btns">
            <a href="#" id="share-list__copy" class="waves-effect waves-light btn disabled">Copy URL</a>
          </div>
        </div>
        <div class="read-only-template"></div>
    </div>
  </div>

  <script src="<?php echo get_theme_file_uri('/dist/index-bundle.js'); ?>"></script>

  <?php get_footer();
