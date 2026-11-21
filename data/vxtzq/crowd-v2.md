# Vxtzq/Crowd-v2

## Resumen

Crowd-v2 es un modelo de lenguaje de tipo transformer denso con aproximadamente 1.000 millones de parámetros, publicado por el desarrollador independiente Vxtzq bajo el paraguas del proyecto comunitario CrowdGPT. Se distribuye con pesos parcialmente entrenados y su propósito declarado no es el uso directo en producción, sino servir como definición común de arquitectura y formato de pesos para que los clientes de la infraestructura de entrenamiento distribuido de CrowdGPT puedan descargarlo y entrenarlo de forma colectiva. La model card indica explícitamente que el modelo no está listo y que el entrenamiento sigue en curso.

La arquitectura es un transformer causal con Grouped-Query Attention (16 cabezas de consulta y 4 de clave/valor), RoPE, SwiGLU y weight tying, con una longitud máxima de secuencia de 2048 tokens y un vocabulario de 151.669 entradas. Incorpora además un componente denominado EngramMemory, una tabla de embeddings dispersa de 227.865 buckets que se mantiene en CPU con unos 350 millones de parámetros adicionales, lo que sugiere un mecanismo de memoria asociativa por n-gramas fuera del cómputo principal del transformer.

Su relevancia es limitada y muy específica: no compite con modelos de propósito general, sino que es una pieza de infraestructura para un experimento de entrenamiento descentralizado. Cualquier evaluación práctica debe tener en cuenta que los pesos publicados contienen conocimiento lingüístico parcial y que el autor advierte que no cabe esperar texto coherente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con GQA, RoPE y SwiGLU; componente EngramMemory en CPU |
| Parámetros totales | 1.007.787.392 (más ~350M del EngramMemory en CPU) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos en bf16: `model_bf16.safetensors` y `engram_bf16.safetensors`) |
| Idiomas soportados | `ia` (interlingua) según los metadatos de Hugging Face; cobertura real no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (bf16) |
| Vocabulario | 151.669 tokens |
| Dimensión oculta | 1536 |
| Capas | 24 |
| Cabezas de atención / KV | 16 / 4 |
| Dimensión de cabeza | 96 |
| Dimensión MLP | 2560 |
| Weight tying | Sí |
| Inicialización | Distribución normal, σ = 0,02 |
| Tamaño del repo | 6,1 GB |
| Descargas / likes | 841 / 3 |

## Arquitectura y entrenamiento

El modelo sigue un diseño transformer decoder-only convencional con 24 bloques, cada uno compuesto por LayerNorm, atención GQA y un MLP SwiGLU. La atención usa 16 cabezas de consulta que comparten 4 cabezas de clave/valor, lo que reduce el coste de memoria del KV cache en inferencia. Las posiciones se codifican con RoPE (theta = 10.000) y la matriz de embeddings de entrada está atada a la proyección de salida. La atención es causal y el código de referencia menciona atención "chunked", aunque no se detalla el mecanismo exacto.

El elemento diferencial es EngramMemory: una tabla de embeddings dispersa de 227.865 buckets y dimensión 1536 que reside en CPU y que, según el código de inferencia, indexa pares de tokens consecutivos mediante un hash (`(prev * 1000003 + curr) % num_buckets`). Esto añade unos 350 millones de parámetros fuera del transformer, probablemente para capturar estadísticas de n-gramas sin ocupar VRAM. En cuanto a datos, la model card cita `openbmb/Ultra-FineWeb-L3`, `HuggingFaceFW/fineweb` y el dataset propio `Vxtzq/CrowdGPT`, pero no se especifica el número de tokens procesados, la composición exacta del corpus ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El estado declarado es "training in progress" y los pesos distribuidos son parcialmente entrenados.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el estado parcial del entrenamiento.
- Modelo base sin ajuste por instrucciones documentado; no se describe soporte de chat ni de formato conversacional más allá de la etiqueta `conversational`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: los metadatos declaran únicamente `ia` (interlingua); no hay evidencia de cobertura multilingüe amplia.
- Capacidades especiales: mecanismo EngramMemory de memoria asociativa por pares de tokens; no se documentan modo thinking, visión ni audio.
- No se documentan capacidades de código, matemáticas ni razonamiento formal.

## Casos de uso

- Investigación sobre entrenamiento distribuido: el modelo sirve como definición de arquitectura y formato de pesos para que clientes de CrowdGPT descarguen, entrenen y vuelvan a subir pesos de forma coordinada; es su caso de uso principal y declarado.
- Reproducción de arquitecturas con memoria externa: el componente EngramMemory permite experimentar con tablas de embeddings en CPU como complemento a un transformer pequeño, útil en líneas de investigación sobre memorización de n-gramas y eficiencia de VRAM.
- Docencia y estudio de transformers: con 24 capas, GQA y SwiGLU, el código de inferencia autocontenido (sin dependencias de `transformers` para el modelo) es un material didáctico manejable para entender la implementación de atención con RoPE.
- Pruebas de pipelines de carga de safetensors: el par de ficheros `model_bf16.safetensors` y `engram_bf16.safetensors` permite validar flujos de carga, sharding y gestión de pesos heterogéneos (GPU + CPU).
- Benchmarking de infraestructura de entrenamiento: al ser un modelo de ~1B con contexto de 2048, es adecuado para medir throughput y escalado en clústeres pequeños antes de pasar a modelos mayores.
- Experimentos de continuación de preentrenamiento: dado que los pesos son parciales, es un punto de partida para estudiar curvas de aprendizaje y dinámicas de entrenamiento en modelos de escala 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad, y advierte que el modelo no debe esperarse que genere texto coherente en su estado actual.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB para los pesos del transformer (~1,0B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- El EngramMemory (~350M parámetros, ~700 MB en bf16) reside en CPU según el código de referencia, por lo que no consume VRAM pero sí memoria RAM del sistema.
- KV cache: con 24 capas, 4 cabezas KV de dimensión 96 y contexto de 2048, el cache es reducido (del orden de decenas de MB en bf16 para un lote pequeño), gracias al uso de GQA.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar los pesos en bf16 o fp16 (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o fine-tuning se requieren GPU de mayor capacidad (A100, H100) o técnicas de acumulación de gradientes y precisión mixta.
- Opciones de despliegue: el autor proporciona código de inferencia propio basado en PyTorch y safetensors; no hay integración documentada con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF limita el despliegue en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Disponibilidad |
|---|---|---|---|---|---|
| Crowd-v2 (Vxtzq) | ~1,0B (+350M Engram en CPU) | 2048 | MIT | Entrenamiento parcial | Pesos bf16 en Hugging Face |
| TinyLlama-1.1B | ~1,1B | 2048 | Apache 2.0 | Entrenado y ajustado | Pesos en múltiples formatos, amplia adopción |
| Llama 3.2 1B | ~1,2B | 128K | Llama 3.2 Community License | Entrenado y ajustado | Pesos oficiales, ecosistema amplio |
| Qwen2.5-1.5B | ~1,5B | 32K | Apache 2.0 | Entrenado y ajustado | Pesos oficiales, GGUF y cuantizaciones |

La comparación es desfavorable en madurez: los tres alternativas están completamente entrenadas y ajustadas, ofrecen contextos mucho mayores y disponen de cuantizaciones y soporte en frameworks de inferencia. Crowd-v2 solo es comparable en tamaño y en licencia permisiva, no en calidad ni en usabilidad.

## Limitaciones y advertencias

- Modelo en entrenamiento: los pesos son parciales y el autor advierte explícitamente que no debe esperarse texto coherente. No es apto para producción.
- Riesgo elevado de alucinación y de salidas incoherentes derivado del estado incompleto del preentrenamiento.
- Sin ajuste por instrucciones ni alineación documentada (RLHF/DPO no mencionados), por lo que no cabe esperar comportamiento de asistente.
- Contexto limitado a 2048 tokens, muy por debajo de los estándares actuales.
- Cobertura idiomática declarada únicamente para interlingua (`ia`); el rendimiento real en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos desconocidos: no se documenta la composición del corpus ni filtros de calidad o toxicidad.
- Licencia MIT permisiva para uso comercial, pero la falta de calidad del modelo hace inviable ese uso en la práctica.
- El código de inferencia se declara obsoleto y solo para pruebas; la API puede cambiar en versiones futuras.
- El componente EngramMemory depende de una tabla en CPU con indexación por hash, lo que puede introducir cuellos de botella y comportamiento no determinista en función del hardware.
- Inconsistencias en la documentación: el repositorio se llama Crowd-v2 pero la model card habla de Crowd-v1.5 y Crowd-v1, y el código apunta a `Vxtzq/Crowd-v1`, lo que puede causar errores de carga si se copia tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vxtzq/Crowd-v2
- Repositorio GitHub: https://github.com/Vxtzq/CrowdGPT
- Sitio del proyecto CrowdGPT: https://crowdgpt.net
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset HuggingFaceFW/fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset Vxtzq/CrowdGPT: https://huggingface.co/datasets/Vxtzq/CrowdGPT
