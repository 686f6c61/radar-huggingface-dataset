# xsingh/o1-small

## Resumen

o1-small es un modelo de lenguaje de razonamiento matemático desarrollado por Paradigma (publicado en Hugging Face bajo el identificador xsingh/o1-small), concebido para resolver problemas matemáticos de alto nivel con un coste computacional mínimo. Se trata de un transformer autorregresivo denso de aproximadamente 1.000 millones de parámetros, entrenado desde cero con menos de 300.000 millones de tokens altamente curados, y con soporte para secuencias de hasta 131.000 tokens de contexto.

Su relevancia radica en la eficiencia de muestreo: mediante una arquitectura inspirada en los avances de la comunidad en competiciones de preentrenamiento acelerado ("speedrun"), generación de datos sintéticos, SFT curado y postentrenamiento con RL, el modelo alcanza resultados en matemáticas de nivel competición que rivalizan con modelos decenas de veces mayores. Como referencia publicada, o1-small logra una media del 74,25% en BeyondAIME, superando al MUSE-Glimmer-30B (70%).

Está orientado a inferencia de alto rendimiento mediante vLLM (con un plugin propio, Limite) y también soporta la API estándar de Transformers con `trust_remote_code=True`. Se distribuye en formato safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo denso con atencion hibrida local/global (inspirada en preentrenamiento speedrun) |
| Parametros totales | 1.035.253.888 (~1.035 millones, dato real de safetensors) |
| Parametros activos | no disponible (modelo denso: todos los parametros activos) |
| Longitud de contexto | 131.072 tokens (131k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (optimizado para problemas matematicos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 2,1 GB) |

## Arquitectura y entrenamiento

o1-small es un modelo denso (no MoE) de tipo transformer autorregresivo con una disposicion de atencion hibrida que combina capas locales (sliding-window) y globales. Esta eleccion arquitectonica, inspirada en las tecnicas de las competiciones recientes de preentrenamiento acelerado, permite una alta eficiencia de muestreo y soporta contextos de hasta 131k tokens. La implementacion de atencion soporta SDPA (con `DynamicCache`, `StaticCache` mixto global/sliding-window, y `StaticCache` con `torch.compile`) y FlashAttention 2 con `DynamicCache`; la combinacion FlashAttention 2 + `StaticCache` se rechaza explicitamente porque no produce logits numericamente correctos con este layout de atencion hibrida.

El entrenamiento se realizo desde cero sobre una mezcla de menos de 300.000 millones de tokens altamente curados. El postentrenamiento combina generacion de datos sinteticos, SFT curado y aprendizaje por refuerzo (RL), lo que permite que el modelo base —que ya rinde bien en benchmarks matematicos con few-shot prompting— alcance resultados de nivel competicion tras el ajuste.

## Capacidades

- Razonamiento matematico de nivel competicion: resolucion de problemas tipo AIME, HMMT, APEX Shortlist y BeyondAIME.
- Generacion de texto conversacional mediante plantilla de chat (`apply_chat_template`), con pipeline `text-generation`.
- Contexto largo: hasta 131k tokens, util para problemas con enunciados extensos o multiples pasos.
- Optimizado para alto throughput en servicion con vLLM mediante el plugin Limite.
- Compatible con la API estandar de Hugging Face Transformers (requiere `trust_remote_code=True`).
- Soporte de multiples backends de atencion: SDPA y FlashAttention 2 (con las combinaciones de cache validadas).
- No hay informacion sobre soporte de tool calling, agentes, vision o audio.

## Casos de uso

- Resolucion automatica de problemas olimpicos de matematicas: el modelo esta especificamente optimizado para benchmarks de nivel AIME y HMMT, por lo que es adecuado para plataformas de tutoria avanzada o verificacion de soluciones.
- Generacion sintetica de datos matematicos: su rendimiento en competicion lo hace util como generador o verificador de soluciones en pipelines de datos sinteticos para entrenar otros modelos.
- Evaluacion y benchmarking de razonamiento: dado su tamano reducido (~1B), sirve como baseline eficiente y barato para comparar tecnicas de RL y postentrenamiento matematico.
- Servicion de alto throughput en produccion: con el plugin Limite para vLLM, permite continuous batching y planificacion multi-GPU de peticiones, adecuado para APIs matematicas con carga alta.
- Investigacion en arquitecturas hibridas de atencion: el codigo custom (local/global attention) y las combinaciones validadas de cache lo hacen interesante como referencia para estudios de eficiencia arquitectonica.
- Asistentes educativos de matematicas: con 131k de contexto puede procesar enunciados largos, examenes completos o documentos con multiples problemas y resolverlos secuencialmente.
- Ejecucion local en hardware modesto: con ~1.035 millones de parametros y 2,1 GB de pesos, cabe en GPUs de consumo para experimentacion individual.

## Benchmarks y rendimiento

Segun la model card, o1-small fue evaluado en siete benchmarks matematicos, incluyendo AIME 2026, HMMT February 2026, APEX Shortlist y BeyondAIME. La tabla completa se publica como imagen en el repositorio, por lo que solo se reproducen aqui los datos en texto:

| Benchmark | o1-small | Comparacion |
|---|---|---|
| BeyondAIME (media) | 74,25% | MUSE-Glimmer-30B: 70% |

Nota: la model card indica que algunos resultados marcados con † provienen de model cards o de MathArena y no fueron reevaluados por el equipo; los resultados completos por benchmark no estan disponibles en formato de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos de 2,1 GB en safetensors (aproximadamente fp16/bf16 para ~1.035M de parametros), el modelo cabe comodamente en GPUs de 8 GB o menos; no hay cifras oficiales de VRAM publicadas.
- GPU recomendadas: validado oficialmente sobre NVIDIA H100 (Python 3.12, PyTorch 2.11.0 con CUDA 13.0, Transformers 5.6.2). Otras combinaciones de versiones y hardware no han sido cualificadas formalmente.
- Consumer GPUs: dado su tamano (~1B de parametros), deberia funcionar en GPUs de consumo como la RTX 3060, RTX 4060 o superiores, aunque no hay validacion oficial publicada.
- Despliegue:
  - vLLM 0.26.0 con el plugin Limite (`VLLM_PLUGINS=limite`), recomendado para produccion con continuous batching y planificacion multi-GPU.
  - Transformers 5.6.2 con `trust_remote_code=True`; solo soporta una replica completa por proceso, sin sharding ni paralelismo tensor/pipeline.
  - Ollama o llama.cpp: no hay soporte documentado.
- Paralelismo: mantener tensor y pipeline parallel sizes en 1 para vLLM; para multi-GPU offline con Transformers, lanzar replicas independientes con `device_map={"": local_rank}`.
- Latencia y throughput: no disponible (sin cifras publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia |
|---|---|---|---|---|
| o1-small (Paradigma) | ~1.035M | 131k | 74,25% en BeyondAIME | Apache 2.0 |
| MUSE-Glimmer-30B | ~30B | no disponible | 70% en BeyondAIME | no disponible |
| Otros modelos matematicos ~1B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card: o1-small supera en BeyondAIME a un modelo 30 veces mayor (MUSE-Glimmer-30B), lo que constituye su principal argumento de eficiencia. No hay datos publicados suficientes para comparar con otros modelos pequenos de razonamiento matematico.

## Limitaciones y advertencias

- El repositorio requiere `trust_remote_code=True` (codigo de arquitectura custom), lo que implica ejecutar codigo de terceros; conviene revisarlo antes de usarlo en entornos sensibles.
- Solo hay una combinacion de versiones cualificada formalmente: Python 3.12, PyTorch 2.11.0 (CUDA 13.0), Transformers 5.6.2, validada en H100. Otras configuraciones no estan soportadas oficialmente.
- FlashAttention 2 con `StaticCache` esta explicitamente rechazado por producir logits incorrectos con la atencion hibrida local/global; usar SDPA con `StaticCache` o FA2 con `DynamicCache`.
- La implementacion con Transformers no soporta sharding ni paralelismo tensor/pipeline; solo una replica completa por proceso.
- Sesgos y riesgo de alucinacion: no hay evaluaciones publicadas sobre sesgos ni sobre fiabilidad fuera del dominio matematico; el modelo esta especializado en matematicas y su comportamiento en uso general no esta documentado.
- Idiomas soportados: no disponible; la especializacion matematica sugiere posible degradacion en tareas conversacionales generales.
- Cuantizacion: no hay pesos cuantizados oficiales publicados; el repo ocupa 2,1 GB.
- Los resultados de evaluacion comparativos provienen parcialmente de terceros (MathArena, model cards) y las configuraciones de evaluacion pueden diferir entre modelos.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas mas alla de las condiciones estandar de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xsingh/o1-small
- Blog de lanzamiento: https://paradigma.inc/blog/o1-small/
- Repositorio GitHub (plugin Limite para vLLM): https://github.com/paradigma-inc/limite-violetto
- Quickstart del repositorio GitHub: https://github.com/paradigma-inc/limite-violetto#quickstart
