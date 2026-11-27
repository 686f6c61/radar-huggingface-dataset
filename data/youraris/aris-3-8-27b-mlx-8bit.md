# YourAris/Aris-3.8-27B-MLX-8bit

## Resumen

Aris 3.8-27B es un fine-tune orientado a agentes de programación sobre NousResearch/Arete-27B, que a su vez deriva de Qwen3.8-27B del equipo Qwen de Alibaba Cloud. Lo desarrolla el usuario YourAris y se distribuye en formato MLX cuantizado a 8 bits, pensado específicamente para Macs con Apple Silicon y 48 GB de memoria unificada o más. El problema que aborda es concreto: mejorar la fiabilidad de un agente de código que debe escribir código, ejecutar tests, corregir fallos y detenerse, reduciendo a la vez las autocorrecciones innecesarias durante el razonamiento.

La arquitectura heredada es la de Qwen3.8-27B, un transformer con capas de atención lineal (el LoRA se aplicó sobre las proyecciones de atención, atención lineal y MLP en las 64 capas). El modelo tiene 26.895.993.856 parámetros reales según los safetensors, es decir, unos 26,9 mil millones. El contexto efectivo medido en pruebas llega a 100k tokens con buena precisión, y en un M4 Pro de 48 GB con caché KV de 8 bits el servidor de referencia encaja unos 125k tokens.

La relevancia actual es doble: por un lado, demuestra un ciclo de mejora por iteración experta (expert iteration) sobre trayectorias de agente exitosas en lugar de datos sintéticos genéricos; por otro, es uno de los pocos fine-tunes de código empaquetados nativamente para MLX, lo que permite ejecutar un modelo de 27B en hardware de consumo Apple sin GPU dedicada. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8-27B) con atención lineal; fine-tune LoRA fusionado |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta ~125k tokens en M4 Pro 48 GB con caché KV 8-bit; evaluado con precisión hasta 100k |
| Tipos de cuantizacion | 8-bit afín, group size 64, 8,5 bits por peso (build 4-bit disponible en repo separado) |
| Idiomas soportados | Inglés (en); entrenamiento de agente solo en Python y Rust |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de los pesos bf16 de Arete-27B y aplica un LoRA de rango 16 sobre las 64 capas, cubriendo las proyecciones de atención, atención lineal y MLP: 108,8 millones de parámetros entrenables. El entrenamiento siguió un esquema de iteración experta: Arete-27B resolvió ejercicios de práctica de Exercism en Python y Rust dentro de un bucle de agente real con acceso a shell, con el razonamiento limitado a unos 3.000 tokens por turno. De esas ejecuciones, 247 pasaron la suite de tests completa (109 en Python, 138 en Rust) y constituyeron el conjunto de entrenamiento, con 4,8 millones de tokens en total. Se entrenaron dos épocas (124 pasos) con learning rate 5e-5, warmup lineal y decaimiento coseno, todo en MLX sobre los pesos de 8 bits.

Tras el entrenamiento, el LoRA se fusionó en los pesos bf16 de Nous y se cuantizó con la conversión propia de mlx-lm (afín, group size 64, 8,5 bits por peso). Los pesos fusionados coinciden con el modelo de 8 bits ejecutando el LoRA en el 99,5% de los siguientes tokens (KL media de 0,0025 sobre 402 posiciones) y decodifican aproximadamente un 30% más rápido. El encoder de visión no está incluido: el modelo es solo texto. La plantilla de chat, los niveles de esfuerzo de razonamiento de Arete y los ajustes de generación se mantienen sin cambios.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking) y niveles de esfuerzo configurables heredados de Arete.
- Programación en Python y Rust con ciclo completo de escritura, ejecución de tests y corrección autónoma.
- Uso de shell y herramientas dentro de bucles de agente (tool calling) a través de la API Anthropic Messages que expone Aris Server.
- Integración directa con Claude Code como backend local.
- Razonamiento matemático (evaluado en problemas MATH-500 de niveles 1 a 5).
- Aplicación de reglas de especificación (rangos semver de npm, precedencia de operadores, JSON Pointer/Patch, matching de `.gitignore`).
- Manejo de contexto largo en formato conversacional, con seguimiento de valores a través de múltiples archivos.
- Capacidades multilingües limitadas al inglés como idioma de trabajo; el comportamiento en otros lenguajes de programación distintos de Python y Rust es el heredado de Arete.
- Sin capacidades de visión ni audio.

## Casos de uso

- Agente de código autónomo en local: conectado a Claude Code mediante Aris Server, el modelo recibe una especificación, escribe la implementación, ejecuta los tests y corrige los fallos sin intervención, como demuestran las cuatro tareas de agente evaluadas (JSON Patch en TypeScript, semver en Rust, evaluador de expresiones y `.gitignore` en Python).
- Asistente de refactorización con contexto de repositorio: con hasta 100k tokens de contexto útil, puede cargar varios archivos y seguir el rastro de un valor a través de tres ficheros, lo que encaja en tareas de renombrado, extracción de módulos o migración de APIs.
- Generación de tests unitarios en Python y Rust: dado que el fine-tune se entrenó sobre suites de Exercism, está ajustado para producir código que pase tests ocultos, un escenario habitual en pipelines de CI.
- Automatización de tareas de cumplimiento de especificaciones: verificación de rangos semver, precedencia de operadores o reglas de `.gitignore` en herramientas internas, donde el modelo aplica reglas formales y no solo genera texto plausible.
- Desarrollo en Mac sin GPU dedicada: equipos con M4 Pro de 48 GB o superiores pueden ejecutar el modelo a ~8 tokens/s de decodificación y 80-105 tokens/s de lectura de prompt, suficiente para sesiones interactivas de agente.
- Prototipado de agentes con la API de Anthropic: al servir el modelo con la interfaz de Messages, se pueden reutilizar clientes y frameworks existentes sin cambiar el código de integración.
- Evaluación de fine-tunes en investigación: el repositorio documenta el pipeline completo (LoRA, fusión, cuantización, benchmarks), lo que sirve como referencia reproducible para estudiar iteración experta en modelos de código.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados en Apple Silicon con Aris Server y thinking activado.

| Benchmark | Arete-27B 8-bit | Aris 3.8-27B 8-bit |
|---|---|---|
| Razonamiento (76 ítems: 60 MATH-500 + 16 de reglas) | 71/76 (93,4%) | 72/76 (94,7%) |
| Autocorrecciones por 1.000 tokens de salida | 2,95 | 2,57 |
| Respuestas que alcanzan el límite de tokens | 0 | 0 |

| Tarea de agente | Lenguaje | Arete-27B | Aris 3.8-27B |
|---|---|---|---|
| JSON Pointer y JSON Patch (RFC 6901, RFC 6902) | TypeScript | 34/35 | 35/35 |
| Matching de rangos semver de npm | Rust | 50/52 | 50/52 |
| Evaluador de expresiones | Rust | 45/45 | 45/45 |
| Matching de `.gitignore` | Python | 64/64 | 64/64 |

| Contexto largo (código sintético) | Aciertos |
|---|---|
| 50k tokens (en conversación) | 18/18 |
| 100k tokens (en conversación) | 17/18 |
| 50k tokens (en system prompt) | 16/18 |

El autor advierte que la diferencia de precisión en razonamiento está dentro del ruido, que el banco tiene solo 76 ítems, que cada tarea de agente se ejecutó una vez y que las ejecuciones de Arete usaron una versión anterior del servidor, por lo que la comparación no aísla únicamente el efecto del fine-tune.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 27 GB; se requiere un Mac con 48 GB de memoria unificada o más para el build de 8 bits.
- Memoria medida: en un M4 Pro de 48 GB, Aris Server con caché KV de 8 bits encaja unos 125k tokens de contexto.
- GPU recomendadas: Apple Silicon de gama alta (M4 Pro 48 GB o superior). No se documentan requisitos para GPU NVIDIA o AMD.
- GPU de consumo: el build de 4 bits está pensado para Macs de 32 GB; el de 8 bits no cabe en configuraciones de 32 GB.
- Despliegue: Aris Server (servidor compatible con la API Anthropic Messages, instalable con `uv tool install aris-server`), mlx-lm directamente, o cualquier cliente de la API de Anthropic apuntando a `ANTHROPIC_BASE_URL`.
- Rendimiento medido en M4 Pro 48 GB: ~8 tokens/s de decodificación y 80-105 tokens/s de lectura de prompt.
- Ajuste recomendado: fijar `CLAUDE_CODE_MAX_CONTEXT_TOKENS` al contexto que reporta `/v1/models` para que Claude Code compacte antes de alcanzar el límite del servidor.
- No se documentan opciones para vLLM, llama.cpp, Ollama o TGI; el formato es MLX y no GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aris 3.8-27B MLX 8-bit | ~26,9B | ~125k (medido en M4 Pro 48 GB) | Agente de código Python/Rust, solo Apple Silicon | Apache-2.0 | Hugging Face (MLX) |
| NousResearch/Arete-27B | ~27B (no confirmado en la información) | No disponible | Modelo base con niveles de esfuerzo de razonamiento | Apache-2.0 | Hugging Face |
| Qwen3.8-27B | ~27B (no confirmado en la información) | No disponible | Modelo generalista de Qwen | Apache-2.0 (según la model card) | Hugging Face |

No se dispone de datos de benchmarks de Arete-27B ni de Qwen3.8-27B más allá de las comparaciones parciales incluidas en la model card, por lo que la comparativa de rendimiento con terceros no está disponible.

## Limitaciones y advertencias

- Idiomas y lenguajes: el entrenamiento de agente se hizo solo en Python y Rust; en otros lenguajes de programación se debe esperar el comportamiento de Arete sin mejoras.
- Tamaño de la evidencia: el banco de razonamiento tiene 76 ítems y cada una de las cuatro tareas de agente se ejecutó una sola vez, lo que limita la significancia estadística de las mejoras reportadas.
- Razonamiento largo: el pensamiento puede extenderse en problemas difíciles; conviene fijar un presupuesto de tokens de pensamiento.
- Sesgos y alineación heredados: incorpora el entrenamiento de alineación de valores de Arete-27B y el corte de conocimiento de Qwen3.8-27B, no documentado en la información disponible.
- Alucinación: no se documentan evaluaciones específicas de tasa de alucinación; el riesgo es el del modelo base.
- Sin visión: el encoder visual no está incluido, por lo que no procesa imágenes.
- Plataforma: los pesos son MLX y están pensados para Apple Silicon; no hay build GGUF ni soporte documentado para CUDA.
- Contexto real: Claude Code asume 200k tokens de ventana; sin ajustar `CLAUDE_CODE_MAX_CONTEXT_TOKENS` puede superar el límite del servidor y provocar fallos.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones de los modelos base (Arete-27B y Qwen3.8-27B) y conservar los avisos de atribución.
- Madurez: el repositorio tiene 225 descargas y 1 like en el momento de la consulta, lo que indica adopción temprana y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YourAris/Aris-3.8-27B-MLX-8bit
- Build de 4 bits: https://huggingface.co/YourAris/Aris-3.8-27B-MLX-4bit
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Servidor Aris Server: https://github.com/kennysarnoski-jarvis/aris-server
- Repositorio de mlx-lm: no disponible en la información proporcionada
- Paper o blog técnico del fine-tune: no disponible en la información proporcionada
