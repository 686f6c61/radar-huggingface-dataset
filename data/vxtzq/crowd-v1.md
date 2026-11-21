# Vxtzq/Crowd-v1

## Resumen

Crowd-v1 es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros publicado por Vxtzq bajo el paraguas del proyecto CrowdGPT, una iniciativa de entrenamiento distribuido comunitario. A diferencia de una release convencional, el modelo se distribuye con pesos **parcialmente entrenados**: su propósito es servir como definición arquitectónica y formato de pesos común que los clientes de CrowdGPT descargan para entrenar colectivamente. El autor lo declara explícitamente como "training in progress" y advierte que no debe esperarse texto coherente de sus pesos actuales.

La arquitectura es un transformer decoder-only de 24 capas con atención de consultas agrupadas (GQA, 16 cabezas de consulta y 4 de clave/valor), RoPE, SwiGLU, weight tying y una longitud máxima de secuencia de 2048 tokens. Incorpora un componente poco habitual denominado "engram memory": una tabla de embeddings dispersa en CPU de 227.865 buckets y 350 millones de parámetros que actúa como memoria asociativa de n-gramas. El vocabulario es de 151.669 tokens.

El modelo se ha entrenado sobre 42,5 mil millones de tokens procedentes de openbmb/Ultra-FineWeb-L3, HuggingFaceFW/fineweb y el dataset propio Vxtzq/CrowdGPT. Su relevancia actual es fundamentalmente metodológica: es un caso de estudio de entrenamiento descentralizado y de arquitecturas con memoria externa, no un modelo listo para producción. La licencia MIT y su tamaño contenido facilitan la experimentación, pero su estado de entrenamiento incompleto limita cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE, SwiGLU y memoria "engram" externa |
| Parametros totales | 1.007.787.392 (modelo) + 350M en tabla engram (CPU) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16: `model_bf16.safetensors`, `engram_bf16.safetensors`) |
| Idiomas soportados | no disponible (la model card declara `ia`, etiqueta no estándar) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) con `custom_code`; requiere código de inferencia propio |
| Vocabulario | 151.669 tokens |
| Dimension oculta | 1536 |
| Capas | 24 |
| Cabezas de atencion / KV | 16 / 4 (GQA), head dim 96 |
| Dimension MLP | 2560 |
| Weight tying | Si |
| Inicializacion | Normal, sigma = 0.02 |
| Tokens de entrenamiento | 42,5 mil millones |
| Tamano del repo | 2815,7 GB |
| Descargas / likes | 93.989 / 42 |

## Arquitectura y entrenamiento

El bloque es un transformer causal estándar con normalización LayerNorm previa a atención y MLP, atención GQA (4 cabezas KV para 16 de consulta, ratio de repetición 4) y RoPE con theta 10000. El MLP SwiGLU usa dimensión intermedia 2560, inferior a la dimensión oculta (1536), lo que da un ratio de expansión de solo 1,67x, atípico en modelos de este tamaño y probablemente orientado a reducir cómputo en el entrenamiento distribuido. La atención se implementa con `scaled_dot_product_attention` causal.

La innovación principal es el módulo `EngramMemory`: una `nn.Embedding` dispersa alojada en CPU con 227.865 buckets y dimensión 1536 (unos 350M parámetros), que indexa pares de tokens consecutivos mediante un hash `(prev * 1000003 + curr) % num_buckets`. Funciona como una memoria asociativa de bigramas consultada en cada paso, con el objetivo de aliviar al transformer de memorizar coocurrencias locales. El entrenamiento declarado son 42,5B tokens sobre Ultra-FineWeb-L3, FineWeb y CrowdGPT, pero no se especifican hiperparámetros, composición exacta del dataset, ni si hubo fases de SFT, RLHF o DPO. El autor indica que el entrenamiento sigue en curso y que los pesos son parciales.

## Capacidades

- Generación de texto autoregresiva: capacidad nominal por arquitectura, pero **no fiable en el estado actual** según advierte el propio autor ("should not be expected to generate very coherent text").
- Memoria de bigramas vía engram: recuperación asociativa de pares de tokens frecuentes, útil para estudiar mecanismos de memoria externa.
- No hay evidencia de soporte de tool calling, function calling ni agentes.
- No hay evidencia de modo thinking, visión, audio ni multimodalidad.
- Capacidades multilingües: no documentadas; la etiqueta de idioma `ia` no es un código ISO reconocible.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Investigación en entrenamiento distribuido: usar Crowd-v1 como definición de referencia y formato de pesos para experimentar con clientes de entrenamiento colaborativo, replicando el pipeline de CrowdGPT.
- Estudio de memorias asociativas externas: el módulo engram permite investigar cómo una tabla de bigramas hasheada en CPU complementa a la atención, comparando perplejidad con y sin el módulo.
- Reproducción de arquitecturas compactas: servir de base para ablaciones sobre GQA, SwiGLU con ratio reducido y weight tying en modelos de ~1B.
- Fine-tuning desde pesos parciales: partir de los pesos publicados para completar el preentrenamiento en dominios concretos con recursos limitados, dado el tamaño manejable de 1B.
- Docencia y formación: ejemplo didáctico de implementación completa en PyTorch de un transformer con GQA, RoPE y memoria externa, con código de inferencia incluido.
- Benchmarking de infraestructura de entrenamiento: evaluar throughput y estabilidad de frameworks distribuidos sobre un modelo de 1B con un componente disperso en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 2 GB para los pesos del transformer (1,007.787.392 parámetros x 2 bytes), más overhead de activaciones y caché KV.
- La tabla engram (350M parámetros, ~700 MB en bf16) reside en CPU por diseño (`sparse=True`, `.to('cpu')`), por lo que requiere RAM del sistema, no VRAM.
- Cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090); incluso en 4 GB con cuantización a 8 bits, aunque no se publican pesos cuantizados.
- GPU recomendadas para entrenamiento o fine-tuning: A100 40/80 GB, H100, o RTX 4090 para ajuste con batches pequeños y gradient checkpointing.
- Opciones de despliegue: **no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama**, ya que requiere `custom_code` y el módulo engram. El único camino documentado es el script de PyTorch incluido en la model card, marcado como "for testing only" y sujeto a deprecación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Despliegue estandar |
|---|---|---|---|---|---|
| Crowd-v1 | ~1,0B (+350M engram) | 2048 | MIT | Preentrenamiento parcial | Solo código custom |
| TinyLlama-1.1B | ~1,1B | 2048 | Apache 2.0 | Entrenado y chat disponible | vLLM, llama.cpp, Ollama |
| Llama 3.2 1B | ~1,2B | 128k | Llama 3.2 Community | Entrenado e instruct | vLLM, llama.cpp, Ollama |
| Qwen2.5-1.5B | ~1,5B | 32k | Apache 2.0 | Entrenado e instruct | vLLM, llama.cpp, Ollama |

La comparación es desfavorable en madurez: los tres alternativos ofrecen contexto mucho mayor, pesos completos, soporte nativo en runtimes estándar y variantes instruct. Crowd-v1 solo se distingue por su licencia MIT permisiva, su componente engram y su enfoque de entrenamiento comunitario. No se dispone de datos de rendimiento para comparar calidad.

## Limitaciones y advertencias

- **Modelo no terminado**: los pesos son parciales y el autor advierte que la coherencia del texto generado será baja. No apto para producción.
- Requiere código de inferencia propio y `trust_remote_code`; no funciona con los runtimes de inferencia habituales.
- Contexto limitado a 2048 tokens, muy por debajo de los estándares actuales.
- Idiomas soportados sin documentar; riesgo alto de comportamiento degradado fuera del inglés (asumiendo que los datasets FineWeb son mayoritariamente anglófonos).
- Riesgo elevado de alucinación y degeneración de texto por el estado incompleto del entrenamiento.
- No hay información sobre sesgos, filtrado de datos ni evaluación de seguridad.
- El repositorio pesa 2815,7 GB, lo que sugiere múltiples checkpoints o artefactos; conviene revisar qué ficheros descargar antes de clonar.
- Licencia MIT permite uso comercial, pero el estado del modelo hace inviable ese uso en la práctica.
- La etiqueta de idioma `ia` no es un código ISO estándar; no debe interpretarse como interlingua necesariamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vxtzq/Crowd-v1
- Repositorio GitHub: https://github.com/Vxtzq/CrowdGPT
- Sitio del proyecto CrowdGPT: https://crowdgpt.net
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset CrowdGPT: https://huggingface.co/datasets/Vxtzq/CrowdGPT
