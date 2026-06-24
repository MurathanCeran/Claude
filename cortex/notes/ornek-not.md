---
tags: [python, asyncio, async]
---
# Python Asyncio Rehberi

Asyncio Python'un asenkron programlama kütüphanesidir.

## Temel Kavramlar

- `async def` ile coroutine tanımlanır
- `await` ile coroutine çalıştırılır
- `asyncio.run()` event loop başlatır

```python
import asyncio

async def main():
    await asyncio.sleep(1)
    print("Merhaba!")

asyncio.run(main())
```
