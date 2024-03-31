<!-- Collaborator: Jianing Lin -->

<?php
  $db = new PDO('sqlite:db/weblog.sqlite3');
  if (isset($_POST['submit'])) {
    $title = htmlspecialchars($_POST['title']);
    $body = htmlspecialchars($_POST['body']);
    $password = $_POST['password'];   
    if (!empty($title) && strlen($title) < 255) {
      if ($password == "punpernickel") {
        $stmt = $db->prepare("INSERT INTO posts (title, body) VALUES (:title, :body)");
        $stmt->bindValue(':title', htmlspecialchars($title), PDO::PARAM_STR);
        $stmt->bindValue(':body', htmlspecialchars($body), PDO::PARAM_STR);
        $stmt->execute();
        header("Location: weblog.php#' . $title . '");
        exit();
      } else {
        echo "Invalid password. Please try again.";
      }
    } else {
      echo "Invalid title. Title must not be empty and less than 255 characters.";
    }
  }
?>

<html>
<head>
  <title>Create a Post</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
  <h1>Zoey's Web Journal</h1>
  <div class="create-post">
    <h2>Create a Post</h2>
    <form method="post">
      <label for="title">Title</label>
      <input name="title"></input>
      <label for="body">Post Body</label>
      <textarea name="body"></textarea>
      <label for="password">Secret Password</label>
      <input type="password" name="password"></input>
      <input type="submit" name="submit" value="Create Post"></input>
    </form>
  </div>
</body>
</html>
