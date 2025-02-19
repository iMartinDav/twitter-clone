async function testWorker() {
  const testTweet = {
    content: "Hello world! #test @user"
  };

  const response = await fetch("http://localhost:8787/tweet", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_TEST_JWT_TOKEN"
    },
    body: JSON.stringify(testTweet)
  });

  console.log("Response status:", response.status);
  console.log("Response body:", await response.json());
}

testWorker().catch(console.error);
