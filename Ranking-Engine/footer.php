<footer class="footer page-footer">
    <div class="footer-copyright">
      Designed by Brian Casey | v<?php echo getRankingEngineVersion() ?> | © <?php echo date("Y"); ?> Pub Meeple
    </div>
    <div class="footer-links">
      <a class="grey-text text-lighten-4 right" href="https://www.pubmeeple.com/about">About</a>
      <a class="grey-text text-lighten-4 right" href="https://www.pubmeeple.com/contact">Contact</a>
      <a class="grey-text text-lighten-4 right" href="https://www.pubmeeple.com/support-us">Support Us</a>
    </div>
  </footer>
</div>

    <?php wp_footer(); ?>

  <script type="text/javascript">

    function getThemePath() {
      return '<?php echo get_theme_file_uri(); ?>'
    }

    function getFilePath(file) {
      const themePath = '<?php echo get_theme_file_uri(); ?>'
      return themePath.concat(file)
    }

    function getSiteURL() {
      return '<?php echo get_site_url() ?>/'
    }
  </script>
  </body>
</html>