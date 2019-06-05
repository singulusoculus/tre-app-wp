<footer class="footer page-footer">
    <div class="footer-copyright">
      Designed by Brian Casey | © 2019 Pub Meeple
    </div>
    <div class="footer-links">
      <a class="grey-text text-lighten-4 right" href="#!">About</a>
      <a class="grey-text text-lighten-4 right" href="#!">Contact</a>
      <a class="grey-text text-lighten-4 right" href="#!">Support Us</a>
    </div>
  </footer>
</div>

    <?php wp_footer(); ?>

  <script type="text/javascript">
    const getUserID = () => {
      return <?php echo get_current_user_id(); ?>;
    }
  </script>
  </body>
</html>