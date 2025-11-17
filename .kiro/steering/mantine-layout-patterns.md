---
title: Mantine Layout Patterns
inclusion: always
---

# Mantine Layout Component Patterns

## Consistent Layout System

We use **Mantine's layout components exclusively** for all layouts. No Tailwind flex/grid classes.

### Component Selection Guide

| Use Case          | Mantine Component       | Replaces Tailwind                    |
| ----------------- | ----------------------- | ------------------------------------ |
| Horizontal layout | `<Group>`               | `flex flex-row`, `flex items-center` |
| Vertical layout   | `<Stack>`               | `flex flex-col`, `space-y-*`         |
| Responsive grid   | `<Grid>` + `<Grid.Col>` | `grid grid-cols-*`                   |
| Complex flex      | `<Flex>`                | `flex` with custom properties        |
| Centering         | `<Center>`              | `flex items-center justify-center`   |
| Container         | `<Container>`           | `container mx-auto`                  |

### Examples

#### Horizontal Layout (Group)

```tsx
// ❌ Don't use Tailwind
<div className="flex items-center gap-4">
  <Icon />
  <Text>Label</Text>
</div>

// ✅ Use Mantine Group
<Group gap="md" align="center">
  <Icon />
  <Text>Label</Text>
</Group>
```

#### Vertical Layout (Stack)

```tsx
// ❌ Don't use Tailwind
<div className="flex flex-col space-y-4">
  <Title>Heading</Title>
  <Text>Content</Text>
</div>

// ✅ Use Mantine Stack
<Stack gap="md">
  <Title>Heading</Title>
  <Text>Content</Text>
</Stack>
```

#### Responsive Grid

```tsx
// ❌ Don't use Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// ✅ Use Mantine Grid
<Grid gutter="md">
  <Grid.Col span={{ base: 12, md: 6 }}>Column 1</Grid.Col>
  <Grid.Col span={{ base: 12, md: 6 }}>Column 2</Grid.Col>
</Grid>
```

#### Centering Content

```tsx
// ❌ Don't use Tailwind
<div className="flex items-center justify-center min-h-screen">
  <Card>Content</Card>
</div>

// ✅ Use Mantine Center
<Center style={{ minHeight: '100vh' }}>
  <Card>Content</Card>
</Center>
```

### Common Props

- **gap**: `xs`, `sm`, `md`, `lg`, `xl` (spacing between items)
- **align**: `flex-start`, `center`, `flex-end`, `stretch`
- **justify**: `flex-start`, `center`, `flex-end`, `space-between`, `space-around`
- **wrap**: `wrap`, `nowrap`
- **p/m**: Padding/margin (`xs`, `sm`, `md`, `lg`, `xl`)

### Benefits

1. **Consistency**: All layouts use the same system
2. **Responsive**: Built-in responsive props
3. **Theme Integration**: Automatically uses theme spacing
4. **Type Safety**: Full TypeScript support
5. **Maintainability**: Easier to understand and modify
