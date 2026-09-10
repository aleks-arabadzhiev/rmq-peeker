# 🐇 RabbitMQ Peeker

A lightweight, modern web tool to safely inspect and peek at RabbitMQ queues across multiple environments. 

RabbitMQ Peeker allows developers and QA teams to view live messages in a queue **without consuming or acknowledging them**, and without requiring administrative or `configure` permissions on the RabbitMQ cluster.

## ✨ Features

* **Multi-Environment Support:** Switch seamlessly between multiple RabbitMQ clusters (Local, Staging, Prod) from a single UI.
* **Safe Peeking:** Fetches messages and immediately requeues them, preserving the original queue order.
* **Minimal Permissions:** Built entirely on `channel.get()`. It only requires `read` permissions for the specified queues (no `configure` or `management` roles needed).
* **Modern UI:** Responsive, split-pane dashboard with collapsible queue and message sections.
* **Smart Formatting:** Automatically detects and beautifies JSON payloads.
* **Protocol Support:** Works natively with both standard `amqp://` and secure `amqps://` (TLS) connections.

## 📋 Prerequisites

* **Node.js:** v22.x or higher 
* **npm:** v10.x or higher
* RabbitMQ credentials with at least `read` access to the target vhosts and queues.

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/rmq-peeker.git](https://github.com/yourusername/rmq-peeker.git)
   cd rmq-peeker
   ```

2. **Install dependencies:**
   Since the project includes a `package.json`, you only need to run the standard install command to download `express` and `amqplib`.
   ```bash
   npm install
   ```

## ⚙️ Configuration

Before starting the application, you must define the RabbitMQ environments you want to monitor.

Create a file named `config.json` inside the `src` directory:

```bash
touch src/config.json
```


Add your environment details using the following JSON structure to `src/config.json`. You can add as many connection objects to the array as you need:

```json
{
  "connections": [
    {
      "name": "Local Dev",
      "protocol": "amqp",
      "host": "localhost",
      "port": 5672,
      "vhost": "/",
      "username": "dev_user",
      "password": "dev_password",
      "peek_count": 5,
      "queues": ["orders_queue", "payment_events"]
    },
    {
      "name": "Production",
      "protocol": "amqps",
      "host": "rabbitmq.mycompany.com",
      "port": 5671,
      "vhost": "prod_vhost",
      "username": "readonly_user",
      "password": "super_secret_password",
      "peek_count": 3,
      "queues": ["dead_letter_queue"]
    }
  ]
}
```

* **`protocol`:** Use `"amqp"` for standard connections or `"amqps"` for TLS-encrypted connections.
* **`peek_count`:** The maximum number of messages to pull and display from the top of the queue.

## 💻 Usage

1. **Start the Node.js server:**
   ```bash
   node src/server.js
   ```

2. **Open the Dashboard:**
   Open your web browser and navigate to [http://localhost:3001](http://localhost:3001).

3. **Peek at Messages:**
   Click on any environment in the left sidebar. Confirm the prompt, and the app will securely fetch and display the current queue sizes and their top messages.
