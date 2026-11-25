# VisualInference/Inkling-2-Mini-MLX-2bit

## Resumen

Inkling-2-Mini-MLX-2bit es una compilación cuantizada del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, preparada por VisualInference para su ejecución en Apple Silicon mediante la librería mlx-vlm. El modelo original es un mixture-of-experts con bucle (looped MoE) de 26.388.641.280 parámetros que acepta texto e imagen como entrada y produce texto, publicado bajo licencia Apache 2.0.

Esta variante concreta reduce el peso de los pesos a 9,1 GiB aplicando cuantización de 2 bits con compensación de error a todas las capas de expertos, manteniendo el resto de capas en 8 bits. El objetivo es permitir la inferencia en Macs con 16 GB de memoria (ajustado) o 18 GB, un umbral muy inferior al que requieren las demás compilaciones del mismo modelo.

Su relevancia radica en que preserva capacidades críticas para agentes —tool calling, salida JSON y tareas multi-paso— a costa de un aumento de perplejidad de aproximadamente el 10 % respecto al checkpoint original, con un deterioro más acusado en generación de código y reconocimiento de imágenes. Es, por tanto, una opción de compromiso para entornos con memoria muy limitada, no un sustituto de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts con bucle (inkling2_loop), multimodal imagen-texto |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card documenta pruebas con prompts de 4k y 16k tokens) |
| Tipos de cuantizacion | Expertos a 2 bits (2,5 bits por peso de media) con compensación de error; resto de capas a 8 bits; GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato mlx-vlm); incluye drafter DSpark en `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un mixture-of-experts con arquitectura de bucle: las capas de expertos se reutilizan en varias pasadas, lo que permite un recuento de parámetros elevado (26,4 B) con un coste computacional por token menor que el de un transformer denso equivalente. La entrada es multimodal (texto e imagen) y la salida es exclusivamente texto. El checkpoint original ya emplea cuantización interna en la mayoría de sus capas de expertos (NVFP4 y MXFP8, 5,1 bits por peso de media).

Esta compilación no reentrena el modelo: recuantiza el checkpoint original. Las capas de expertos se llevan a 2 bits con compensación de error (2,5 bits por peso efectivos) y el resto de capas se mantienen en 8 bits, produciendo 9,1 GiB de pesos. El repositorio conserva sin modificar el drafter DSpark incluido (`mtp.safetensors`) para decodificación especulativa, así como el chat template, el tokenizer y los tokens especiales originales, byte a byte. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Entrada de imagen (pipeline image-text-to-text), con reconocimiento de imágenes debilitado respecto al original según el autor.
- Razonamiento configurable mediante `reasoning_effort` con seis niveles: `none`, `minimal`, `low`, `medium`, `high` y `xhigh`; por defecto `high`. El nivel `none` no desactiva por completo el razonamiento.
- Tool calling / function calling: el servidor OpenAI-compatible devuelve `tool_calls` con argumentos como cadena JSON y `finish_reason: "tool_calls"`.
- Salida estructurada en JSON.
- Ejecución de tareas de agente multi-paso (conjunto Hermes Agent Tasks).
- Decodificación especulativa opcional mediante el drafter DSpark incluido.
- Capacidades de código y matemáticas preservadas, aunque el autor señala un deterioro en código frente a las compilaciones de 3 y 4 bits.
- Sin soporte de audio declarado.

## Casos de uso

- Agentes locales en Macs de memoria reducida: el modelo mantiene tool calling y tareas de agente (4/4 en Hermes Agent Tasks) con un pico de 9,8 GiB en prompts cortos, lo que permite ejecutar bucles de agente en un Mac de 16-18 GB donde las compilaciones de 3 y 4 bits no caben con holgura.
- Automatización de escritorio y asistentes personales offline: al ejecutarse sobre mlx-vlm con servidor OpenAI-compatible en loopback, se integra con clientes existentes sin depender de la nube.
- Extracción de datos estructurados: la salida JSON (9/10 en las pruebas del autor) lo hace apto para convertir texto libre en registros parseables dentro de pipelines ETL ligeros.
- Prototipado rápido de aplicaciones multimodales: acepta imágenes junto con texto, útil para validar flujos de image-text-to-text antes de migrar a pesos de mayor precisión.
- Razonamiento con presupuesto controlado: los niveles `low` y `medium` de `reasoning_effort` aceleran varios órdenes cada paso del bucle de agente, adecuado para tareas interactivas donde la latencia importa.
- Evaluación comparativa de cuantizaciones: sirve como escalón inferior de una batería de pruebas (original, 4bit, 3bit, 2bit) para medir el impacto de la cuantización en una tarea concreta antes de decidir el despliegue.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en un Mac mini M4 Pro de 48 GB con decodificación greedy (temperatura 0). El autor advierte que los conjuntos de tareas son pequeños y que diferencias de pocos problemas entre filas son ruido; la comparación precisa es la pérdida en held-out.

| Build | Pesos | Pérdida held-out vs original | GSM8K | HumanEval | Tool calls | JSON output | Hermes Agent |
|---|---|---|---|---|---|---|---|
| original | 18,2 GiB | referencia (1,448 nats/token) | 48/50 | 35/40 | 18/19 | 9/10 | 4/4 |
| 4bit | 14,8 GiB | +0,002 ± 0,001 nats (+0,2 %) | 45/50 | 36/40 | 18/19 | 9/10 | 4/4 |
| 3bit | 11,9 GiB | +0,014 ± 0,004 nats (+1,4 %) | 49/50 | 35/40 | 19/19 | 9/10 | 4/4 |
| 2bit (este repo) | 9,1 GiB | +0,095 ± 0,013 nats (+10,0 %) | 47/50 | 32/40 | 19/19 | 9/10 | 4/4 |

| Build | Velocidad de decodificación | Pico de memoria: prompt corto / 4k / 16k |
|---|---|---|
| original | 25,9 tok/s | 20,3 / 21,4 / 22,1 GiB |
| 4bit | 31,1 tok/s | 15,5 / 16,2 / 16,9 GiB |
| 3bit | 33,8 tok/s | 12,7 / 13,5 / 14,1 GiB |
| 2bit (este repo) | 33,4 tok/s | 9,8 / 10,6 / 11,2 GiB |

## Requisitos de hardware

- VRAM/memoria unificada: 9,8 GiB de pico con prompt corto, 10,6 GiB con 4k y 11,2 GiB con 16k. El autor indica Macs de 16 GB (ajustado) o 18 GB.
- GPU recomendadas: Apple Silicon; las mediciones se realizaron en un Mac mini con M4 Pro y 48 GB.
- Cabe en GPU de consumo: no aplica a GPU NVIDIA/AMD, ya que el formato es mlx-vlm y depende de MLX (Apple Silicon). No hay datos de despliegue en CUDA.
- Opciones de despliegue: mlx-vlm (CLI `mlx_vlm.generate` y servidor `mlx_vlm.server` con API OpenAI-compatible en `/v1/chat/completions`). Requiere mlx-vlm desde el commit `434a1bed` (21-11-2026, PR 2783) o posterior para el parser de tool calls; si no hay release, instalar desde el repositorio de Neywa-Labs.
- Throughput: 33,4 tok/s de decodificación en M4 Pro, ligeramente por debajo de la compilación de 3 bits (33,8 tok/s) y por encima de la original (25,9 tok/s).
- Decodificación especulativa: el drafter DSpark está incluido, pero el autor señala que no es una ganancia fiable en un M4 Pro.

## Comparativa con modelos similares

Comparación con las otras compilaciones del mismo modelo base, que son las alternativas directas en el mismo ecosistema.

| Modelo | Parámetros | Pesos | Contexto | Licencia | Memoria pico (4k) | Calidad relativa |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-2bit | 26,4 B (MoE) | 9,1 GiB | no disponible | Apache 2.0 | 10,6 GiB | +10,0 % perplejidad; HumanEval 32/40 |
| Inkling-2-Mini-MLX-3bit | 26,4 B (MoE) | 11,9 GiB | no disponible | Apache 2.0 | 13,5 GiB | +1,4 % perplejidad; HumanEval 35/40 |
| Inkling-2-Mini-MLX-4bit | 26,4 B (MoE) | 14,8 GiB | no disponible | Apache 2.0 | 16,2 GiB | +0,2 % perplejidad; HumanEval 36/40 |
| Inkling-2-Mini (original) | 26,4 B (MoE) | 18,2 GiB | no disponible | Apache 2.0 | 21,4 GiB | referencia; HumanEval 35/40 |

No se dispone de datos en la información proporcionada para comparar con modelos de otros fabricantes.

## Limitaciones y advertencias

- Pérdida de calidad medible: +10,0 % de perplejidad respecto al original, con deterioro explícito en generación de código (32/40 en HumanEval frente a 35-36/40) y en reconocimiento de imágenes.
- Solo inglés: el campo `language` declara únicamente `en`; no hay soporte multilingüe verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la cuantización agresiva a 2 bits en las capas de expertos.
- El razonamiento consume `max_tokens`: con un límite bajo el modelo puede gastarlo todo en razonamiento y devolver una respuesta vacía. El autor recomienda al menos 1.000 tokens por turno.
- El nivel `reasoning_effort: none` no desactiva por completo el razonamiento.
- `generation_config.json` fija temperatura 1.0; los benchmarks de la ficha se midieron a temperatura 0 y no son directamente reproducibles con la configuración por defecto.
- El token de parada de turno es `<|content_model_end_sampling|>` (id 200006); `<|end_message|>` no es token de parada y no debe añadirse como cadena de parada.
- Dependencia de una versión concreta de mlx-vlm: versiones anteriores al commit `434a1bed` no devuelven `tool_calls` ni `content` en el servidor.
- Exclusivo de Apple Silicon: no hay ruta de despliegue documentada en CUDA, vLLM, TGI, llama.cpp ni Ollama.
- La decodificación especulativa con el drafter incluido no ofrece una ganancia fiable en M4 Pro según el autor.
- Los conjuntos de evaluación son pequeños; las diferencias de pocos problemas entre compilaciones deben tratarse como ruido.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-2bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Compilación 4bit: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-4bit
- Compilación 3bit: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-3bit
- mlx-vlm (repositorio): https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
