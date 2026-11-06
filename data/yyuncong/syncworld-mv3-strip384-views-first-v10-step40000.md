# yyuncong/SyncWorld-mv3-strip384-views-first-v10-step40000

## Resumen

SyncWorld-mv3-strip384-views-first-v10-step40000 es un checkpoint intermedio (update 40.000 de un total de 45.000) de un modelo del mundo para robótica desarrollado por el usuario de Hugging Face `yyuncong` en el marco del proyecto SyncWorld. El modelo aprende dinámica futura (*forward dynamics*) en un contexto de recuperación (*retrieval*): dada una imagen ancla y una secuencia de 16 acciones comandadas, genera los siguientes 16 fotogramas de vídeo, condicionado por K fragmentos de vídeo/acción observados previamente.

La entrada se organiza como una tira (*strip*) de 1536x384 píxeles compuesta por tres celdas de 512x384 correspondientes a dos cámaras en tercera persona y una cámara de muñeca. La innovación principal de esta variante es la recuperación multivista "views first": cada fragmento de la biblioteca se puntúa conjuntamente sobre las dos cámaras mostradas y se admite solo si su propia cámara cae dentro de 10 grados de rotación y 10 cm de posición respecto a la cámara de la consulta.

Es relevante porque explora una alternativa al cómputo de contexto largo en modelos del mundo para robótica: en lugar de memorizar todo el historial, recupera fragmentos relevantes de una biblioteca de 3.852.002 fragmentos construida a partir de 214.336 grabaciones de cámara, manteniendo una ventana de atención fija. El checkpoint está pensado para investigación en planificación y evaluación de políticas robóticas, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (flow matching) sobre latentes VAE, con atención completa (*full-attention in_context*) y componentes MoE (`moe_gen`); sin memoria TTT |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | K fragmentos observados de 16 transiciones (K uniforme en 1..8) más la consulta (1 ancla + 16 acciones futuras); sin límite de tokens declarado |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de vídeo/robótica, sin interfaz de lenguaje) |
| Licencia | openmdw-1.1 (referenciada como `other`; enlace a la licencia de NVIDIA Cosmos) |
| Formato de pesos | DCP (estado del entrenador) convertido a bf16 en `model/`; configuración en `config.pkl`; receta en `training/recipe.toml` |

## Arquitectura y entrenamiento

El modelo parte de la inicialización del run strip384 de `cosmos-framework-dev` (`gripperhead-mv-strip384-4x3-fork174k-4x8`, iteración 43.500), ya entrenado sobre los cuatro conjuntos de datos como tiras de 1536x384. Sobre esa base se entrena con AdamW (betas 0,9/0,99, weight decay 0,05), LR constante de 5e-5 tras un calentamiento lineal de 400 updates, actualizando `moe_gen`, el *time embedder*, las proyecciones VAE/acción y el *embedding* de hueco de contexto. El cómputo es en bf16 con pesos maestros fp32 para el optimizador y *activation checkpointing* completo.

Cada consulta consta de un fotograma ancla más sus 16 acciones futuras comandadas, y el modelo genera los 16 fotogramas siguientes. Antes de la consulta se sitúan K fragmentos observados de vídeo/acción (K uniforme en 1..8, un K por update para todas las GPU) como condicionamiento limpio en la misma ventana de atención. La recuperación combina el fragmento adyacente con K-1 fragmentos elegidos por una regla de vecino más cercano simplificada que pondera la curva de acciones comandadas con estados de pinza y la trayectoria del efector final relativa al inicio de cada fragmento (peso de acción 3), la pose inicial y la apariencia DINOv2-base. El entrenamiento se ejecutó en 4 nodos x 8 H100 (HSDP con grupo FSDP de 8 vías por nodo y 4 réplicas), 1 stream por GPU (32 streams por update) y 45.000 updates, con datos de robocasa_v2 (10.478 grabaciones), robomimic_v2 (16.608), rlbench_wrist_mv (11.314) y droid (68.768), solo grabaciones expertas y pesos de componente 2:2:1:2.

## Capacidades

- Predicción de dinámica futura en robótica: genera 16 fotogramas de vídeo multivista condicionados por 16 acciones comandadas.
- Condicionamiento por recuperación (*in-context retrieval*): incorpora K fragmentos de vídeo/acción observados como contexto limpio en la ventana de atención.
- Razonamiento multivista: procesa simultáneamente dos cámaras en tercera persona y una cámara de muñeca en una única tira de 1536x384.
- Recuperación conjunta de vistas: selecciona fragmentos de biblioteca que encajan en ambas cámaras mostradas dentro de 10 grados y 10 cm.
- Generalización entre conjuntos de datos: entrenado sobre robocasa, robomimic, RLBench y DROID.
- Robustez a *view dropout* y recortes verticales aleatorios, aprendidos durante el entrenamiento.
- No se documentan capacidades de *tool calling*, agentes, lenguaje natural, visión general o audio.

## Casos de uso

- Evaluación de políticas robóticas: el modelo puede generar rollouts de vídeo de 16 pasos para comparar políticas candidatas sin ejecutar hardware real, usando las acciones comandadas como condición y la recuperación de fragmentos para mantener coherencia visual.
- Planificación por simulación de dinámica: dado un estado ancla y una secuencia de acciones, se puede predecir el resultado visual y detectar acciones que llevan a estados no deseados antes de ejecutarlas en el robot.
- Investigación en modelos del mundo: sirve como punto de comparación entre la estrategia de recuperación (esta variante) y la de memoria TTT, al ser uno de los dos runs de la comparativa de tres cámaras de SyncWorld.
- Aumento de datos para aprendizaje por imitación: los fotogramas generados pueden utilizarse para aumentar conjuntos de entrenamiento de políticas en tareas de manipulación con múltiples cámaras.
- Análisis de correspondencia entre cámaras: la regla de recuperación conjunta permite estudiar cómo se alinean las vistas tercera persona y muñeca en distintos conjuntos de datos (robocasa, robomimic, RLBench, DROID).
- Prototipado en investigación académica: con 30,3 GB de pesos bf16 y un estado DCP, está pensado para ejecutarse en clústeres con H100 y no para despliegue ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de *flow matching* del vídeo de la consulta (`train@2/loss`), promediada sobre los 500 updates previos a cada marca:

| Update | 1000 | 4000 | 8000 | 12000 | 16000 | 20000 | 24000 | 28000 | 30000 | 40000 |
|---|---|---|---|---|---|---|---|---|---|---|
| Loss | 0,0659 | 0,0658 | 0,0652 | 0,0636 | 0,0629 | 0,0611 | 0,0624 | 0,0608 | 0,0614 | 0,0602 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 30,3 GB en bf16, por lo que la inferencia completa requiere al menos ese orden de memoria, probablemente más por estados intermedios de atención y VAE.
- GPU recomendadas: H100 (entrenado en 4 nodos x 8 H100); no se documenta compatibilidad con GPUs de consumo.
- No cabe en GPU de consumo habitual (RTX 4090 con 24 GB) en bf16 sin cuantización o *offloading*, y no se publican pesos cuantizados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato es DCP del entrenador, orientado a reanudar entrenamiento o evaluación con el *framework* Cosmos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-v10-step40000 (este) | no disponible | K fragmentos de 16 transiciones (K 1..8) + consulta | Recuperación multivista conjunta a 10 grados / 10 cm | openmdw-1.1 | Checkpoint intermedio en HF |
| SyncWorld-mv3-strip384-recent8-step* | no disponible | 8 fragmentos recientes | Recuperación por los 8 fragmentos más recientes | no disponible | En HF (`yyuncong/...recent8-step*`) |
| cosmos-framework-dev strip384 (`gripperhead-mv-strip384-4x3-fork174k-4x8`) | no disponible | no disponible | Modelo base strip384 sin recuperación | no disponible | Referenciado como inicialización |

## Limitaciones y advertencias

- Es un checkpoint intermedio (update 40.000 de 45.000): el autor lo marca explícitamente como un run aún en entrenamiento, por lo que su calidad final no está garantizada.
- No se han publicado benchmarks ni evaluaciones de rendimiento en tareas; solo la curva de pérdida de entrenamiento.
- El modelo está especializado en manipulación robótica con configuraciones de cámara concretas (dos tercera persona y una muñeca); no es un modelo de propósito general.
- La recuperación depende de una biblioteca de 3.852.002 fragmentos y de metadatos de pose de cámara; sin esa biblioteca y el pipeline de recuperación, el modelo no funciona como se describe.
- Riesgo de alucinación visual: al ser un modelo generativo de vídeo, puede producir fotogramas plausibles pero físicamente incorrectos.
- Sesgos: los datos son solo de grabaciones expertas de cuatro conjuntos (robocasa, robomimic, RLBench, DROID), lo que limita la diversidad de escenas, objetos y morfologías de robot.
- Licencia openmdw-1.1 (referenciada como `other`): es necesario revisar los términos del enlace de NVIDIA Cosmos antes de cualquier uso comercial.
- No se documentan idiomas, cuantizaciones ni formatos de despliegue estándar, lo que dificulta su integración en pipelines de producción convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-v10-step40000
- Run comparativo recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-step
- Licencia openmdw-1.1: https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
- Repositorio Cosmos (referencia de licencia): https://github.com/NVIDIA/Cosmos
