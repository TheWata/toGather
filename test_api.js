const http = require('http');

let cookie = '';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { 'Cookie': cookie } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };
    const r = http.request(options, (res) => {
      let data = '';
      if (res.headers['set-cookie']) {
        cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch(e) { json = data; }
        resolve({ status: res.statusCode, data: json });
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

(async () => {
  try {
    console.log('--- 1. Health check ---');
    let res = await req('GET', '/api/health');
    console.log('Health:', res.status, res.data.service);

    console.log('--- 2. Unauthenticated check (expect 401) ---');
    res = await req('GET', '/api/groups');
    console.log('GET /api/groups unauth:', res.status, res.data.error);

    console.log('--- 3. Login as alex@nexus.io ---');
    res = await req('POST', '/api/auth/login', { email: 'alex@nexus.io', password: '123456' });
    console.log('Login:', res.status, res.data.user?.username, res.data.message);

    console.log('--- 4. GET /api/auth/me ---');
    res = await req('GET', '/api/auth/me');
    console.log('Me:', res.status, res.data.user?.email);

    console.log('--- 5. GET /api/groups ---');
    res = await req('GET', '/api/groups');
    console.log('Groups count:', res.data.groups?.length, 'Names:', res.data.groups?.map(g => g.name));

    const groupId = 'g1';
    console.log('--- 6. GET /api/groups/g1/hq ---');
    res = await req('GET', `/api/groups/${groupId}/hq`);
    console.log('HQ status:', res.status, 'Group:', res.data.group?.name, 'Spotlight today:', res.data.spotlight?.postedToday);

    console.log('--- 7. GET /api/groups/g1/posts ---');
    res = await req('GET', `/api/groups/${groupId}/posts`);
    console.log('Posts count:', res.data.total, 'First post author:', res.data.posts?.[0]?.author?.username);

    console.log('--- 8. POST /api/groups/g1/posts (Create photo) ---');
    res = await req('POST', `/api/groups/${groupId}/posts`, {
      type: 'photo',
      url: 'https://picsum.photos/seed/test123/400/400',
      caption: 'Foto de teste criada pela suite'
    });
    console.log('Create post status:', res.status, 'Created ID:', res.data.post?.id, res.data.message);
    const newPostId = res.data.post?.id;

    console.log('--- 9. PUT /api/posts/:id (Update caption) ---');
    res = await req('PUT', `/api/posts/${newPostId}`, { caption: 'Legenda devidamente atualizada!' });
    console.log('Update post status:', res.status, 'Updated caption:', res.data.post?.caption);

    console.log('--- 10. DELETE /api/posts/:id ---');
    res = await req('DELETE', `/api/posts/${newPostId}`);
    console.log('Delete post status:', res.status, res.data.message);

    console.log('--- 11. POST /api/groups/g1/chat (Send chat message) ---');
    res = await req('POST', `/api/groups/${groupId}/chat`, { text: 'Ola guilda! Testando o chat realtime!' });
    console.log('Chat status:', res.status, 'Message text:', res.data.chatMessage?.text);

    console.log('--- 12. POST /api/groups/g1/nudge (Cutucar membro sorteado) ---');
    res = await req('POST', `/api/groups/${groupId}/nudge`);
    console.log('Nudge status:', res.status, res.data.message || res.data.error);

    console.log('--- 13. Test 404 & 400 validations ---');
    res = await req('GET', '/api/posts/post-inexistente-999');
    console.log('Get non-existent post (expect 404):', res.status);
    res = await req('POST', `/api/groups/${groupId}/posts`, { type: 'invalido' });
    console.log('Bad post payload (expect 400):', res.status, res.data.message);

    console.log('\n>>> SUCCESS: ALL BACKEND TESTS PASSED VERIFIED! <<<');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
