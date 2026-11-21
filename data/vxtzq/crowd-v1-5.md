# Vxtzq/Crowd-v1.5

## Resumen

Crowd-v1.5 es un modelo de lenguaje de tipo transformer de aproximadamente 1.000 millones de parametros desarrollado por Vxtzq en el marco del proyecto comunitario CrowdGPT, una iniciativa de entrenamiento distribuido en la que distintos participantes aportan computo para entrenar un modelo compartido. Se distribuye bajo licencia MIT y esta publicado en Hugging Face con el identificador Vxtzq/Crowd-v1.5.

A diferencia de una publicacion convencional de pesos ya entrenados, este repositorio entrega pesos parcialmente entrenados. El objetivo declarado es servir como definicion comun de arquitectura y formato de pesos que los clientes de CrowdGPT descarguen y entrenen de forma colectiva. La model card indica explicitamente que el modelo no esta listo y que se encuentra en fase de preentrenamiento, por lo que no debe esperarse una generacion de texto plenamente coherente.

La relevancia del proyecto es mas experimental que de producto: propone un esquema de entrenamiento descentralizado sobre una arquitectura compacta de 1B parametros, con atencion GQA, RoPE, SwiGLU y un modulo de memoria llamado Engram que reside en CPU. No hay publicados resultados de benchmarks ni una evaluacion de calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Grouped-Query Attention, RoPE y SwiGLU |
| Parametros totales | 1.007.787.392 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bf16) |
| Idiomas soportados | Codigo de idioma declarado: "ia" (interlingua); no hay lista detallada |
| Licencia | MIT |
| Formato de pesos | safetensors (model_bf16.safetensors y engram_bf16.safetensors) |

Otras especificaciones declaradas por el autor: vocabulario de 151.669 tokens, dimension oculta de 1536, 24 capas, 16 cabezas de atencion, 4 cabezas KV, dimension de cabeza 96, dimension oculta del MLP de 2560, weight tying activado, inicializacion normal con sigma 0.02 y un modulo Engram con 227.865 buckets y unos 350 millones de parametros en CPU.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion causal agrupada (GQA), con 16 cabezas de consulta y 4 cabezas clave-valor, codificacion posicional rotatoria (RoPE) con theta 10.000 y capas MLP SwiGLU. El modelo emplea weight tying entre la capa de embedding y la de salida, y normalizacion LayerNorm. Ademas incorpora un componente denominado EngramMemory, una tabla de embedding dispersa de 227.865 buckets que reside en CPU y se consulta mediante hashing de pares de tokens consecutivos; segun la model card aporta unos 350 millones de parametros en CPU y funciona como memoria asociativa auxiliar.

El entrenamiento se plantea como un proceso distribuido y colaborativo: los participantes descargan los pesos parciales y contribuyen con computo. Los datasets declarados son openbmb/Ultra-FineWeb-L3, HuggingFaceFW/fineweb y Vxtzq/CrowdGPT. No se especifica el numero de tokens procesados, la composicion exacta del dataset, ni si se han aplicado fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones de decodificacion especulativa ni de atencion lineal; la unica particularidad tecnica destacable es el modulo Engram en CPU.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el estado parcial del entrenamiento.
- Modelo conversacional segun la etiqueta del pipeline, aunque la model card advierte de que la coherencia del texto no esta garantizada.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el unico codigo de idioma declarado es "ia".
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Memoria asociativa auxiliar mediante el modulo Engram, orientada a recuperar patrones de pares de tokens.

## Casos de uso

- Investigacion sobre entrenamiento distribuido: el modelo sirve como base reproducible para experimentar con el esquema de entrenamiento colaborativo de CrowdGPT, descargando los pesos y contribuyendo con computo.
- Estudio de arquitecturas con memoria externa: el modulo Engram permite analizar el impacto de una tabla asociativa en CPU sobre un transformer pequeno, comparandolo con variantes sin memoria.
- Prototipado de pipelines de inferencia: al ser un modelo de 1B parametros con codigo de inferencia propio, es util para validar integraciones tecnicas en entornos de desarrollo antes de pasar a modelos mayores.
- Experimentacion academica con GQA y RoPE: su configuracion concreta (16 cabezas de consulta, 4 KV, cabeza de 96) permite reproducir estudios sobre eficiencia de atencion en modelos de escala reducida.
- Formacion y docencia: sirve para ilustrar el ciclo de vida de un modelo en preentrenamiento y las diferencias entre pesos parciales y pesos finales.
- Pruebas de carga y despliegue en hardware modesto: con 1B parametros en bf16 (unos 2 GB de pesos) se puede desplegar en GPUs de consumo para validar infraestructura, sin expectativas de calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos del transformer rondan los 2 GB (1.007.787.392 parametros a 2 bytes); el modulo Engram anade unos 350 millones de parametros en CPU, por lo que la VRAM efectiva en GPU es de aproximadamente 2 GB mas el estado de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; una RTX 3060, RTX 4060, RTX 4090 o A100 son suficientes y sobredimensionadas para el transformer.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas, dado el tamano del modelo.
- Opciones de despliegue: el autor proporciona codigo de inferencia propio basado en PyTorch y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El codigo de inferencia se declara obsoleto y solo para pruebas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Crowd-v1.5 | ~1B | 2048 | MIT | Preentrenamiento en curso, sin benchmarks |
| TinyLlama-1.1B | ~1,1B | 2048 | Apache 2.0 | Entrenado y publicado con benchmarks |
| Llama 3.2 1B | ~1,2B | 128k | Llama 3.2 Community License | Entrenado y publicado con benchmarks |
| Qwen2.5-1.5B | ~1,5B | 32k | Apache 2.0 | Entrenado y publicado con benchmarks |

La comparacion se limita a la categoria de modelos de aproximadamente 1B parametros. Crowd-v1.5 no ofrece resultados de evaluacion ni un estado de entrenamiento completo, por lo que no es equiparable en calidad a las alternativas consolidadas; su interes es el esquema de entrenamiento distribuido y la incorporacion del modulo Engram.

## Limitaciones y advertencias

- El modelo esta en fase de preentrenamiento y sus pesos son parciales; la model card advierte de que no debe esperarse texto coherente.
- No hay benchmarks publicados, por lo que no se puede evaluar su calidad frente a alternativas.
- El codigo de inferencia incluido se declara obsoleto y solo para pruebas, lo que limita su uso en produccion.
- El unico idioma declarado es "ia"; no hay evidencia de capacidades multilingues ni de calidad en castellano.
- No se documentan sesgos conocidos, pero al entrenarse sobre fineweb y Ultra-FineWeb es probable que herede sesgos de esos corpus web.
- Riesgo de alucinacion elevado dado el estado incompleto del entrenamiento.
- La licencia MIT permite uso comercial, pero el estado del modelo hace inviable su uso en produccion sin un entrenamiento adicional.
- No se especifican los datos exactos de entrenamiento, el numero de tokens ni el proceso de alineacion, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Vxtzq/Crowd-v1.5
- Repositorio GitHub: https://github.com/Vxtzq/CrowdGPT
- Sitio del proyecto: https://crowdgpt.net
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset HuggingFaceFW/fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset Vxtzq/CrowdGPT: https://huggingface.co/datasets/Vxtzq/CrowdGPT
