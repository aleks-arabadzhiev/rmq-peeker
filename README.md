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
