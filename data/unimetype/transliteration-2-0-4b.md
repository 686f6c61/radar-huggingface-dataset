# UnimeType/Transliteration-2.0-4B

## Resumen

UnimeType Transliteration 2.0 4B es un modelo de conversión (transliteración) de texto romanizado a escritura nativa, desarrollado por UnimeType como motor de método de entrada (IME) que funciona en local. Está afinado a partir de Qwen/Qwen3.5-4B (BF16 sin cuantizar) y se distribuye en este repositorio como pesos MLX de 6 bits para Apple Silicon. Resuelve un problema concreto: permitir escribir en una única disposición ASCII y convertir en el sitio el texto romanizado a chino (pinyin), japonés (romaji), hindi (hinglish), árabe (arabizi), ruso, griego, vietnamita, español, francés, portugués, alemán e italiano, preservando sin tocar términos en inglés, menciones `@`, URLs, fragmentos de código, rutas y números.

La versión v2.6 amplía la cobertura de 4 a 12 idiomas (13 modos de salida, incluyendo japonés `natural` y `kana`) mediante un protocolo compacto de JSON de una línea (`unimetype-convert-short-v3`) con prompt de sistema vacío, por lo que no consume tokens de prefijo. Incluye recuperación de erratas por teclas adyacentes típicas de mecanografía rápida y respeta léxicos dinámicos de marcas y contactos sin secuestro homofónico. El modelo tiene 4.205.751.296 parámetros y un tamaño de repositorio de 10,3 GB.

Es relevante ahora porque ofrece una alternativa determinista y totalmente offline a soluciones en la nube para entrada multilingüe, con licencia Apache 2.0 y plantilla de chat no-thinking que emite el texto convertido desde el primer token, sin latencia de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B); no se detalla configuración interna |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits (MLX); el autor publica además BF16 Safetensors y GGUF Q4_K_M y Q8_0 en repositorios separados |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it (12 idiomas, 13 modos de salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 6 bits) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de 4B parámetros, y se ha afinado para una tarea cerrada de conversión de texto. El autor indica que el ajuste se hizo sobre el modelo base en BF16 sin cuantizar y que el checkpoint distribuido aquí es una conversión MLX de 6 bits. La versión v2.6 corresponde al conjunto de datos `dataset_v5.1`, con 12 idiomas y 13 modos de salida, e incorpora recuperación de erratas por teclas adyacentes y respeto de léxicos dinámicos.

La innovación principal es de protocolo, no de arquitectura: el formato `unimetype-convert-short-v3` usa un mensaje de usuario JSON compacto en una sola línea y un prompt de sistema vacío, eliminando el coste de prefijo (0 tokens de sistema) y manteniendo compatibilidad total con clientes anteriores de Transliteration-2.0. La plantilla de chat incluye `<|im_start|>assistant\n<think>\n\n</think>\n\n` en `chat_template.jinja` para forzar modo no-thinking y que la salida convertida aparezca desde el primer token. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Conversión (transliteración) de texto romanizado o ASCII a escritura nativa en 12 idiomas: pinyin chino, romaji japonés (modos `natural` y `kana`), hinglish hindi, arabizi árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano.
- Preservación intacta de términos en inglés inline, menciones `@`, URLs, fragmentos de código, rutas de fichero, números y saltos de línea.
- Recuperación de erratas de mecanografía rápida por teclas adyacentes (por ejemplo, `shujuuk` → `数据库`, `yanchanghiu` → `演唱会`, `yanuhuo` → `验货`).
- Respeto de léxicos dinámicos de contactos y marcas sin falsos positivos por homófonos.
- Emisión de `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión de conjunto cerrado.
- Salida determinista con `temperature: 0`; modo no-thinking desde el primer token.
- No es un chatbot de propósito general: no está pensado para diálogo abierto, tool calling ni razonamiento multi-paso.

## Casos de uso

- Sustitución de teclado a nivel de sistema: la aplicación UnimeType usa el modelo para convertir en el sitio el texto romanizado en cualquier aplicación (Slack, Mail, WhatsApp, WeChat, LINE) manteniendo una disposición ASCII única y sin cambiar de teclado a mitad de frase.
- Entrada multilingüe en editores y terminales: al preservar rutas, comandos y fragmentos de código, permite escribir en Terminal, IDEs, Overleaf (comandos LaTeX) o Blender sin que la conversión rompa la sintaxis.
- Atajos de una sola tecla en herramientas creativas: mantiene el layout ASCII limpio para atajos en Figma o Blender y controles WASD en juegos, convirtiendo a escritura nativa solo cuando el usuario lo solicita.
- Mensajería con mezcla de idiomas: convierte hinglish, arabizi o romaji a escritura nativa conservando términos en inglés y menciones, adecuado para conversaciones reales con code-switching.
- Corrección de erratas en mecanografía rápida: la recuperación de transposiciones de teclas adyacentes reduce errores en flujos de escritura veloz sin intervención manual.
- Despliegue offline en Apple Silicon: con pesos MLX de 6 bits y ~2,6–3,5 GB de huella, encaja en un IME de escritorio local sin enviar texto a la nube, relevante por privacidad.
- Evaluación e integración en pipelines: el toolkit del autor ofrece lanzadores de una orden para Ollama, LM Studio, `mlx-lm` y `llama.cpp`, más una evaluación local `Smoke-60`, útil para validar la conversión antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint de 4B en la información disponible. El autor sí reporta cifras para el tier 9B de la misma familia (92,09 % de precisión estricta en la suite de 708 casos alineada con v4; 90,94 % en Core-5; 76,7 % en Dogfood-30; 90,0 % en OOD-Unseen-20), pero no deben atribuirse al modelo de 4B.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica una huella de ~2,6–3,5 GB para el tier de 4B; el repositorio MLX 6-bit ocupa 10,3 GB en disco.
- GPU recomendadas: Apple Silicon para la variante MLX 6-bit de este repositorio; para BF16 Safetensors se requiere GPU con memoria suficiente para 4B parámetros en BF16 (no especificada por el autor).
- GPU de consumo: cabe en equipos Apple Silicon; para GPU NVIDIA de consumo no hay datos publicados en la información disponible.
- Opciones de despliegue: `mlx-lm` (este repo), LM Studio, Ollama, `llama.cpp` (vía GGUF Q4_K_M o Q8_0) y PyTorch/vLLM (vía BF16 Safetensors).
- Latencia y throughput: no disponibles. El autor destaca latencia cero de tokens de razonamiento por el modo no-thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas/modos | Licencia | Formatos |
|---|---|---|---|---|---|
| Transliteration-2.0-4B (este) | 4,2B | no disponible | 12 idiomas / 13 modos | Apache 2.0 | MLX 6-bit, BF16 Safetensors, GGUF |
| Transliteration-2.0-0.8B | no disponible | no disponible | misma familia | Apache 2.0 | MLX 6-bit, BF16, GGUF |
| Transliteration-2.0-9B | no disponible | no disponible | misma familia | Apache 2.0 | MLX 6-bit, BF16, GGUF |

Las tres variantes pertenecen a la misma familia del autor y comparten protocolo y cobertura lingüística; difieren en tamaño y huella (0,8B ~0,5–0,7 GB; 4B ~2,6–3,5 GB; 9B ~5,6–7,4 GB). No se dispone de comparación con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- Es un motor de conversión especializado, no un chatbot: usarlo como modelo conversacional abierto dará resultados deficientes.
- Requiere el protocolo correcto (JSON compacto de una línea, prompt de sistema vacío, `temperature: 0`); desviarse de él puede degradar la salida.
- No se han publicado datos de sesgos, tasas de alucinación ni robustez fuera de dominio para el tier de 4B.
- La longitud de contexto no está documentada; entradas muy largas pueden no comportarse como se espera.
- La recuperación de erratas y los léxicos dinámicos pueden producir conversiones no deseadas en casos ambiguos, aunque el autor afirma evitar el secuestro homofónico.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Qwen3.5-4B y de la aplicación UnimeType por separado.
- Este repositorio concreto es MLX 6-bit para Apple Silicon; para otros entornos hay que usar los repositorios BF16 o GGUF de la familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Toolkit de inferencia local, Modelfiles de Ollama y especificación short-v3: https://github.com/UnimeType/transliteration
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la aplicación UnimeType: https://unimetype.com/download
- Metodología de evaluación y guía de LM Studio: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Variante 0.8B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Variante 4B BF16 Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Variante 4B GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-4B-GGUF
- Variante 9B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-9B
- Variante 9B BF16 Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-9B-Safetensors
- Variante 9B GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-9B-GGUF
