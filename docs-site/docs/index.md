---
sidebar_position: 1
title: Introduction
---


# kube-ingress-dash

![kube-ingress-dash collage](../../images/collage.png)

A Kubernetes Ingress Dashboard for monitoring and navigating services running in Kubernetes clusters. This tool provides real-time visibility into ingress resources, making it easy to discover, access, and monitor services.

## Overview

**kube-ingress-dash** is a real-time Kubernetes ingress monitoring and navigation tool that offers an intuitive interface to discover, access, and monitor services in your Kubernetes clusters. With clean visualization and efficient search capabilities, it simplifies the process of managing and accessing your cluster's services.

## Features

- **Real-time Ingress Monitoring**: Watch ingress resources update in real-time
- **Search and Filter**: Quickly find ingresses by name, namespace, host, or path
- **Advanced Filtering**: Multi-select component for filtering by labels and annotations
- **Kubernetes Context Information**: View cluster, namespace, and other context information
- **TLS Visualization**: Clear indicators for TLS-enabled ingresses
- **Responsive Dashboard**: Clean, modern UI built with shadcn/ui and Tailwind CSS
- **Dark/Light Theme**: Toggle between light, dark, and system themes with custom indigo theme
- **Service Navigation**: Direct links to your services from the dashboard
- **Error Handling**: Comprehensive error boundaries and centralized error reporting
- **Testing**: Comprehensive test suite with Jest and React Testing Library

## Quick Start

### Prerequisites

- Kubernetes cluster with appropriate RBAC permissions
- Node.js v18+ (for local development)
- Docker (for containerized deployment)
- Helm (for Kubernetes deployment)

### Try it out

To quickly get started with kube-ingress-dash, you can use one of these deployment methods:

- **[Helm](deployment/helm)**: The recommended method for Kubernetes deployment
- **[Docker](deployment/docker)**: For containerized deployment
- **[Source](deployment/from-source)**: For local development and customization

Check out our [Deployment](deployment) section for detailed instructions for each method.
