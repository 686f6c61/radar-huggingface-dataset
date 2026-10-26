# VinayRevanuru/Sapling-505M-Midtrain-MLX-4bit

## Resumen

Sapling-505M-Midtrain-MLX-4bit es una conversión cuantizada a 4 bits con MLX de Sapling-505M-Midtrain, un modelo de 505.483.776 parámetros con arquitectura Qwen3 densa entrenado desde cero. El modelo original se entrenó con 5B tokens de preentrenamiento y 1B tokens adicionales de mid-training centrados en matemáticas, chat y replay, y este repositorio contiene el checkpoint annealed de esa fase.

La versión MLX 4-bit ocupa 304 MB y está pensada para ejecutarse en Macs con Apple Silicon mediante `mlx-lm`. Su interés práctico está en el prototipado local de modelos pequeños, la experimentación con cuantización y el fine-tuning sobre una base de 505M parámetros con contexto de 2.048 tokens.

No es un modelo de chat: continúa texto y ha visto el formato ChatML, pero no cierra sus turnos. Además, la cuantización a 4 bits es notablemente lossy a este tamaño, con un aumento de perplejidad de aproximadamente el 6,9 % frente al modelo FP32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3: 30 capas, anchura 1.024, 16 cabezas query y 8 cabezas KV, embeddings atados |
| Parámetros totales | 505.483.776 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | MLX 4-bit affine con group size 64 (~5,0 bits efectivos por peso); también existen MLX 8-bit, GGUF y FP32 en otros repositorios |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` para MLX; GGUF disponible por separado |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Qwen3 densa con 30 capas, anchura de 1.024, 16 cabezas de atención query y 8 cabezas KV, embeddings atados y una ventana de contexto de 2.048 tokens. El checkpoint original se entrenó desde cero con 5B tokens de preentrenamiento y 1B tokens de mid-training que incluyen matemáticas, chat y replay; este repositorio corresponde a la fase annealed de mid-training, no a un modelo sometido a SFT.

La cuantización se generó con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` usando mlx-lm 0.32.2, con cuantización affine y aproximadamente 5,0 bits efectivos por peso. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación. El modelo ha visto ChatML, pero no está ajustado para comportarse como asistente conversacional ni para finalizar turnos.

## Capacidades

- Generación y continuación de texto en inglés.
- Completado de problemas matemáticos sencillos, como cálculos de porcentajes, con prompts del estilo `Problem: ...\nSolution:`.
- Exposición al formato ChatML durante el entrenamiento, sin comportamiento de chat completado.
- Uso como base para fine-tuning específico sobre una arquitectura Qwen3 pequeña.
- Ejecución local en Apple Silicon mediante `mlx-lm`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni planificación.
- No se documentan capacidades de visión, audio ni modo thinking.
- Multilingüismo no disponible: el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Completado de texto local en macOS: el modelo puede integrarse en una aplicación de escritorio para continuar plantillas, borradores o texto técnico en inglés, con un peso de solo 304 MB y ejecución sobre Apple Silicon.
- Resolución de problemas matemáticos básicos: sirve para completar ejercicios aritméticos o de porcentajes en entornos educativos o de prueba, siempre con `max_tokens` fijado y validación posterior del resultado.
- Base para fine-tuning con ChatML: al haber visto ese formato, puede utilizarse como punto de partida para un ajuste supervisado orientado a chat, instrucciones o una tarea concreta.
- Prototipado de pipelines MLX: útil para validar cargas, tokenización, generación y cuantización en Macs antes de pasar a un modelo mayor o a otro runtime.
- Evaluación comparativa de cuantización: permite reproducir la comparación entre FP32, MLX 8-bit y MLX 4-bit usando la perplejidad en WikiText-2 documentada por el autor.
- Generación de texto embebida de bajo consumo: adecuada para demos, herramientas internas o aplicaciones macOS con restricciones de memoria, donde 304 MB de pesos son manejables.
- Experimentación educativa: sirve para estudiar el comportamiento de una arquitectura Qwen3 densa a escala de 505M parámetros, incluyendo atención con 16 cabezas query y 8 KV.

## Benchmarks y rendimiento

| Variante | Tamaño | WikiText-2 PPL | Diferencia frente a FP32 |
|---|---:|---:|---:|
| FP32 original (transformers) | 2,0 GB | 22,86 | — |
| MLX 4-bit (este repositorio) | 304 MB | 24,44 | +6,9 % |
| MLX 8-bit | 545 MB | 22,88 | +0,1 % |

La perplejidad se midió sobre las primeras 64 ventanas de 1.024 tokens del conjunto de test de WikiText-2 en bruto, puntuando la segunda mitad de cada ventana, con el mismo método que `llama-perplexity`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones de razonamiento o código en la información disponible.

## Requisitos de hardware

- Pesos del modelo: 304 MB en MLX 4-bit, 545 MB en MLX 8-bit y 2,0 GB en FP32.
- Apple Silicon: ejecutable con `mlx-lm` en Macs con memoria unificada suficiente; el overhead exacto del runtime no está documentado.
- GPU consumer: puede ejecutarse mediante GGUF con llama.cpp u Ollama; la VRAM necesaria debe cubrir los pesos más el overhead del runtime, sin cifra oficial disponible.
- GPU recomendadas: no disponibles. MLX está orientado a Apple Silicon; para CUDA o GPUs dedicadas conviene usar la variante GGUF.
- Opciones de despliegue: `mlx-lm` para MLX, llama.cpp y Ollama para GGUF. vLLM y TGI no están documentados para esta variante MLX.
- Latencia y throughput: no disponibles.
- Es obligatorio establecer `max_tokens`, porque el modelo no detiene la generación por sí mismo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WikiText-2 PPL | Tamaño | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Sapling-505M-Midtrain-MLX-4bit | 505,5 M | 2.048 | 24,44 | 304 MB | Apache-2.0 | MLX |
| Sapling-505M-Midtrain-MLX-8bit | 505,5 M | 2.048 | 22,88 | 545 MB | No disponible | MLX |
| Sapling-505M-Midtrain (FP32) | 505,5 M | 2.048 | 22,86 | 2,0 GB | Apache-2.0 | transformers / safetensors |

Frente a modelos externos de tamaño similar, no se dispone de resultados de MMLU, GSM8K, HumanEval u otros benchmarks que permitan una comparación rigurosa. Para uso conversacional, el autor remite a Sapling-505M-SFT, pero no se proporcionan especificaciones ni métricas de esa variante en la información disponible.

## Limitaciones y advertencias

- La cuantización a 4 bits es lossy: la perplejidad sube un 6,9 % y las respuestas factuales cortas cambian con más frecuencia. El autor cita el ejemplo de responder «Sydney» donde el original dice «Canberra».
- No es un modelo de chat: continúa texto y no finaliza sus turnos. Sin `max_tokens`, la generación puede prolongarse indefinidamente.
- Solo está etiquetado para inglés y tiene un contexto de 2.048 tokens, adecuado para textos cortos pero limitado para documentos largos.
- Con 505M parámetros, la capacidad de razonamiento, el conocimiento factual y la robustez son limitados; no se han publicado evaluaciones de sesgo, alucinación o seguridad.
- No se documentan benchmarks de código, matemáticas o razonamiento más allá de la perplejidad en WikiText-2.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución y las notas de licencia; no se documentan restricciones adicionales.
- No se recomienda como asistente conversacional en producción sin un fine-tuning específico y una validación exhaustiva.

## Enlaces

- [HuggingFace: VinayRevanuru/Sapling-505M-Midtrain-MLX-4bit](https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain-MLX-4bit)
- [Modelo base: VinayRevanuru/Sapling-505M-Midtrain](https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain)
- [Variante MLX 8-bit](https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain-MLX-8bit)
- [Variante GGUF](https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain-GGUF)
- [Variante SFT para chat](https://huggingface.co/VinayRevanuru/Sapling-505M-SFT)

No se han proporcionado papers, blogs, repositorios adicionales ni demos en la información disponible.
