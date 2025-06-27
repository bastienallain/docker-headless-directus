# 🤝 Contributing to Directus Docker Stacks

Thank you for your interest in contributing! This guide will help you get started.

## 🎯 How to Contribute

### 🐛 Reporting Issues
- Use the [issue tracker](https://github.com/your-username/directus-docker-stacks/issues)
- Check existing issues before creating new ones
- Provide clear reproduction steps
- Include Docker and system versions

### 💡 Suggesting Features
- Open a [discussion](https://github.com/your-username/directus-docker-stacks/discussions) first
- Explain the use case and benefits
- Consider implementation complexity

### 🔧 Code Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push and create a Pull Request

## 📋 Development Guidelines

### Docker Compose Standards
- Use latest stable image versions
- Include health checks for all services
- Provide environment variable documentation
- Follow security best practices

### Configuration Principles
- **Security First**: No hardcoded secrets
- **Performance**: Optimize for production workloads
- **Simplicity**: Easy to understand and modify
- **Documentation**: Comment complex configurations

### File Organization
```
test/directus-stack/
├─ environments/        # Environment-specific configs
├─ variants/           # Performance variants
├─ shared/             # Common configurations
└─ docs/               # Additional documentation
```

## 🧪 Testing

### Local Testing
```bash
# Test development setup
cd test/directus-stack/environments/dev
docker compose up -d
docker compose exec directus wget -qO- http://localhost:8055/server/health

# Test production setup
cd ../prod
docker compose up -d
# Verify all services are healthy
```

### Performance Testing
```bash
# Cache performance
docker compose exec dragonfly redis-cli info stats

# API response time
time curl -s http://localhost:8055/items/articles

# Asset transformation
curl -w "@curl-format.txt" http://localhost:8055/assets/test.jpg?width=800
```

## 📝 Documentation Standards

### README Files
- Clear setup instructions
- Environment variable explanations
- Common troubleshooting
- Performance expectations

### Code Comments
- Explain complex configurations
- Document performance optimizations
- Include security considerations

### Examples
- Provide working examples
- Include common use cases
- Show integration patterns

## 🏗️ Stack Requirements

### New Environment
When adding a new environment:
- Include comprehensive README
- Provide .env.example file
- Add health checks
- Document port usage
- Include backup/restore procedures

### New Variant
When adding a new variant:
- Explain performance benefits
- Provide comparison metrics
- Include migration guide
- Test compatibility

## 🔒 Security Guidelines

### Secrets Management
- Never commit secrets
- Use Docker Secrets for production
- Provide secure defaults
- Document secret rotation

### Network Security
- Isolate internal networks
- Minimize exposed ports
- Use proper firewall rules
- Enable TLS where appropriate

## 📊 Performance Considerations

### Resource Limits
- Set appropriate CPU/memory limits
- Consider scaling scenarios
- Test under load
- Monitor resource usage

### Cache Optimization
- Configure appropriate TTL values
- Implement cache warming
- Monitor hit ratios
- Plan cache invalidation

## 🚀 Release Process

### Version Updates
1. Update image versions in compose files
2. Test compatibility
3. Update documentation
4. Create changelog entry
5. Tag release

### Breaking Changes
- Provide migration guide
- Update major version
- Document compatibility matrix
- Announce in discussions

## 💬 Communication

### Code Review
- Be constructive and respectful
- Focus on code quality and security
- Consider performance implications
- Suggest improvements

### Issues and PRs
- Use clear, descriptive titles
- Provide context and motivation
- Include testing information
- Link related issues

## 🎖️ Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Special mentions for significant contributions

## 📞 Getting Help

- 💬 [Discussions](https://github.com/your-username/directus-docker-stacks/discussions) for questions
- 🐛 [Issues](https://github.com/your-username/directus-docker-stacks/issues) for bugs
- 📧 [Email maintainers](mailto:maintainers@example.com) for security issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy contributing!** 🎉