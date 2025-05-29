app.get('/posts', async (req, res) => {
  const sort = req.query.sort;

  let posts;
  if (sort === 'mostLiked') {
    posts = await Post.find().sort({ 'reactions.likes.length': -1 });
  } else if (sort === 'leastLiked') {
    posts = await Post.find().sort({ 'reactions.likes.length': 1 });
  } else {
    posts = await Post.find();
  }

  res.json(posts);
});
