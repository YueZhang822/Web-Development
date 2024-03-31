<!-- Collaborator: Jianing Lin -->

<?php
$db = new PDO('sqlite:db/weblog.sqlite3');

$post_id = $_GET['post_id'];

$stmt = $db->prepare("SELECT *, p.body AS pbody, c.body AS cbody FROM posts p LEFT JOIN comments c ON p.id = c.post_id WHERE p.id = ?");
$stmt->execute([$post_id]);
$results = $stmt->fetchAll();
?> 


<html>
<head>
  <title>Leave a Comment</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
  <h1>Zoey's Web Journal</h1>
  <div class="leave-comment">
    <?php
      echo "<h2>Leave a Comment on <a href='weblog.php#".$results[0]['title']."'>".$results[0]['title']."</a></h2>";
      echo "<div class='post-body'>".$results[0]['pbody']."</div>";
      if (empty($results[0]['cbody'])) {
        echo "<h3>0 Comments</h3>";
      } else {
        echo "<h3>".count($results)." Comments</h3>";
      }
      echo "<div class='comment-block'>";
      foreach($results as &$result) {
        echo "<div class='comment'>";
        echo "<div class='comment-body'>".(isset($result['cbody'])? htmlspecialchars($result['cbody']): "")."</div>";
        echo "<div class='comment-author'>".(isset($result['author'])? htmlspecialchars($result['author']): "")."</div>";
        echo "</div>";
      } 
      echo "</div>";
    ?>
  </div>

    <form method="post">
      <label for="body">Comment</label>
      <textarea name="body"></textarea>
      <label for="name">Your name</label>
      <input name="name"></input>
      <input type="hidden" name="post_id" value="1"></input>
      <input type="submit" name="submit" value="Leave Comment"></input>
    </form>

  <?php
    if (isset($_POST['submit'])) {
      $body = htmlspecialchars($_POST['body']);
      $author = htmlspecialchars($_POST['name']);
      if (!empty($body) && !empty($author)) {
        $stmt = $db->prepare("INSERT INTO comments (post_id, body, author) VALUES (:post_id, :body, :author)");
        $stmt->bindValue(':post_id', $post_id, PDO::PARAM_INT);
        $stmt->bindValue(':body', htmlspecialchars($body), PDO::PARAM_STR);
        $stmt->bindValue(':author', htmlspecialchars($author), PDO::PARAM_STR);
        $stmt->execute();
        header("Location: leave_comment.php?post_id=$post_id");
      } else {
        echo "Please enter comments or your name.";
      }
  }
  $db = null;
  ?>

</body>
</html>
