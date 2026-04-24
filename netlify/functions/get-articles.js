const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const articlesDir = path.join(__dirname, '../../articles');
    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

    const articles = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) continue;

      const meta = {};
      match[1].split('\n').forEach(line => {
        const [key, ...vals] = line.split(':');
        if (key && vals.length) {
          let val = vals.join(':').trim().replace(/^["']|["']$/g, '');
          if (val === 'true') val = true;
          if (val === 'false') val = false;
          if (!isNaN(val) && val !== '') val = Number(val);
          meta[key.trim()] = val;
        }
      });

      if (meta.published === false) continue;

      articles.push({
        slug: file.replace('.md', ''),
        title: meta.title || '',
        subtitle: meta.subtitle || '',
        category: meta.category || '',
        date: meta.date || '',
        readtime: meta.readtime || 8,
        excerpt: meta.excerpt || '',
        published: meta.published !== false,
        featured: meta.featured === true
      });
    }

    // Sort by date descending
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(articles)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
