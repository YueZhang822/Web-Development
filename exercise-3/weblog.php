<!-- Collaborator: Jianing Lin -->

<?php
  $db = new PDO('sqlite:db/weblog.sqlite3');
?>

<html>
<head>
  <title>Exercise 3 - A Web Journal</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
  <div class="compose-button">
    <a href="create_post.php" title="create post">
      <i class="material-icons">create</i>
    </a>
  </div>

  <h1>Zoey's Web Journal</h1>

  <div id="posts">
    <?php
      $stmt = $db->prepare("SELECT * FROM posts ORDER BY id DESC");
      $stmt->execute();
      $posts = $stmt->fetchAll();
    
      foreach($posts as &$post) {
        echo '<post class="post" id="' . $post['id'] . '">';
        echo '<h2 class="post-title" id="' . $post['title'] . '">' . htmlspecialchars($post['title']) . '<a href="#' . $post['title'] . '"><i class="material-icons">link</i></a></h2>';
        echo "<br>";
        echo "<div class='post-body'>".(isset($post['body'])? htmlspecialchars($post['body']): "")."</div>";
        echo "<br>";

        $stmt = $db->prepare("SELECT * FROM comments WHERE post_id = :post_id ORDER BY id ASC");
        $stmt->bindValue(':post_id', $post['id'], PDO::PARAM_INT);
        $stmt->execute();
        $post['comments'] = $stmt->fetchAll();

        echo "<h3>".count($post['comments'])." Comments</h3>";
        echo "<div class='comment-block'>";
        foreach($post['comments'] as $comment)
        {
          echo "<comment>";
          echo "<div class='comment-body'>".(isset($comment['body'])? htmlspecialchars($comment['body']): "")."</div>";
          echo "<div class='comment-author'>".(isset($comment['author'])? htmlspecialchars($comment['author']): "Anonymous")."</div>";
          echo "</comment>";
        }
        echo '<a href="leave_comment.php?post_id=' . $post['id'] . '"><i class="material-icons">create</i>Leave a comment</a>';
        echo "<br>";
        echo "<br>";
        echo "</div>";
        echo "</post>";
    }
    ?>
  </div> <!-- end of posts block -->
</body>
