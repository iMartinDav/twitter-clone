const TEST_JWT = 'YOUR_TEST_JWT_TOKEN'; // Replace with a valid JWT token
const WORKER_URL = 'http://localhost:8787';

async function testTweetCreation() {
  const tweet = {
    content: "Test tweet from worker! @testuser #test"
  };

  try {
    const response = await fetch(`${WORKER_URL}/tweet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_JWT}`
      },
      body: JSON.stringify(tweet)
    });

    const data = await response.json();
    console.log('Response:', {
      status: response.status,
      data
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

testTweetCreation();
