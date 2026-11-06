# yyuncong/SyncWorld-mv3-strip384-recent8-step16000

## Resumen

SyncWorld-mv3-strip384-recent8-step16000 es un punto de control intermedio de un modelo de mundo (world model) de dinámica hacia adelante para robótica, desarrollado por el equipo SyncWorld-dev (usuario yyuncong en Hugging Face). El modelo genera los 16 fotogramas siguientes de una secuencia de vídeo robótica a partir de un fotograma ancla, las 16 acciones comandadas futuras y hasta 8 fragmentos previos de vídeo/acción observados que se sitúan en la misma ventana de atención como condicionamiento en contexto (in-context), sin memoria TTT explícita.

Cada fotograma es una tira de 1536x384 píxeles con tres vistas de cámara: dos cámaras de tercera persona y una cámara de muñeca (wrist). La variante "recent8" usa como condicionamiento los K fragmentos más recientes de la propia secuencia de la consulta, y sirve como línea base frente a una variante alternativa con recuperación por similitud (views-first). El entrenamiento parte de un run previo del framework Cosmos de NVIDIA y se realiza sobre 32 GPUs H100, con una duración total prevista de 30.000 actualizaciones de las cuales este checkpoint corresponde a la 16.000.

Su relevancia radica en la investigación de world models para robótica con múltiples vistas de cámara y condicionamiento en contexto, una línea clave para la generación de datos sintéticos y la evaluación de políticas de manipulación. El repositorio pesa 30,3 GB y emplea la licencia openmdw-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model de difusión/flow-matching sobre vídeo (framework Cosmos), condicionamiento in-context con atención completa, sin memoria TTT |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1 fotograma ancla + 16 acciones comandadas + hasta 8 fragmentos de 16 transiciones vídeo/acción en la misma ventana de atención (valor exacto en tokens no disponible) |
| Tipos de cuantizacion | Pesos en bf16 (formato DCP del trainer); no hay cuantizaciones publicadas |
| Idiomas soportados | no disponible (modelo no lingüístico, entrada/salida de vídeo y acciones) |
| Licencia | openmdw-1.1 (other, con enlace a la licencia de NVIDIA Cosmos) |
| Formato de pesos | DCP (Distributed Checkpoint) del trainer, tensores en bf16; config.pkl y recipe.toml incluidos |

## Arquitectura y entrenamiento

El modelo es un world model de dinámica hacia adelante entrenado con flow matching (pérdida de flujo sobre el vídeo de la consulta). Cada consulta consiste en un fotograma ancla más 16 acciones comandadas futuras, y el modelo genera los 16 fotogramas siguientes. El condicionamiento es puramente in-context: K fragmentos observados de 16 transiciones vídeo/acción (K uniforme entre 1 y 8, un valor por actualización para todas las GPUs) se colocan en la misma ventana de atención como condicionamiento limpio, sin mecanismo de memoria test-time (TTT). En la variante recent8, esos K fragmentos son los más recientes de la propia secuencia de la consulta.

La inicialización procede del run strip384 de cosmos-framework-dev (`gripperhead-mv-strip384-4x3-fork174k-4x8`, iteración 43.500), ya entrenado sobre los mismos cuatro datasets como tiras de 1536x384. El entrenamiento usa AdamW (betas 0,9/0,99, weight decay 0,05), LR 5e-5 tras un warm-up lineal de 400 actualizaciones y luego constante, entrenando `moe_gen`, el time embedder y las proyecciones VAE/acción; cómputo en bf16 con pesos maestros fp32 para el optimizador y activation checkpointing completo. La escala es de 4 nodos x 8 H100 con HSDP (grupo FSDP de 8 vías por nodo, 4 réplicas), 1 stream por GPU (32 streams por actualización), 30.000 actualizaciones y checkpoint cada 1.000.

Los datos de entrenamiento (dataset `syncworld_ttt/data/mv_strip_v2`) incluyen 10.478 grabaciones de robocasa_v2, 16.608 de robomimic_v2, 11.314 de rlbench_wrist_mv y 68.768 de droid (grabaciones de más de 3.000 fotogramas descartadas), solo grabaciones de experto, con pesos de componente robocasa 2 : robomimic 2 : rlbench 1 : droid 2. Cada fotograma es una tira de tres celdas de 512x384 (4:3) con dropout de vistas por stream (una cámara 10 %, dos cámaras 5 %) y recortes verticales aleatorios. El cómputo se ejecutó en MAST (spatial_ai_research).

## Capacidades

- Generación de vídeo predictivo: produce los 16 fotogramas siguientes de una escena robótica dada una imagen ancla y las acciones comandadas.
- Predicción de dinámica hacia adelante (forward dynamics) para manipulación robótica con acciones como condicionamiento.
- Condicionamiento en contexto con hasta 8 fragmentos previos de vídeo/acción en la misma ventana de atención.
- Procesamiento multivista: dos cámaras de tercera persona y una cámara de muñeca, con aleatorización del orden de las dos primeras celdas.
- Robustez a dropout de vistas (ausencia aleatoria de una o dos cámaras durante el entrenamiento).
- Entrenado sobre datos de experto de cuatro benchmarks de robótica (robocasa, robomimic, rlbench, droid).
- No se ha documentado soporte de tool calling, agentes, capacidades lingüísticas, visión-a-texto ni audio.

## Casos de uso

- Predicción de rollout en simulación robótica: dado un estado inicial y una secuencia de acciones, el modelo genera el vídeo futuro esperado, útil para validar políticas de manipulación sin ejecutarlas en el robot real.
- Evaluación de world models con condicionamiento en contexto: sirve como línea base recent8 para comparar frente a variantes con recuperación por similitud (retrieval) de fragmentos, midiendo si la memoria contextual mejora la predicción.
- Investigación en memoria a test-time (TTT): al ser explícitamente una baseline sin memoria TTT, permite aislar el efecto de añadir mecanismos de memoria en tareas de dinámica hacia adelante multivista.
- Aumento de datos para entrenamiento de políticas: los rollouts generados pueden usarse como datos sintéticos para entrenar o refinar políticas de manipulación en dominios robocasa, robomimic, rlbench y droid.
- Estudio de robustez multivista: el dropout de vistas y los recortes aleatorios del entrenamiento lo hacen adecuado para investigar cómo afecta la pérdida de cámaras a la predicción de dinámica.
- Reproducción y auditoría de entrenamiento: el repositorio incluye config.pkl y recipe.toml, lo que permite reproducir o extender el run en infraestructura similar (32 x H100).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la información disponible; al ser un world model de robótica, estas métricas de lenguaje no aplican. El único dato de rendimiento publicado es la pérdida de entrenamiento del flujo de vídeo de la consulta (`train@2/loss`), promediada sobre las 500 actualizaciones previas a cada marca:

| update | 1000 | 2000 | 4000 | 8000 | 12000 | 16000 |
|---|---|---|---|---|---|---|
| loss | 0,0663 | 0,0661 | 0,0661 | 0,0656 | 0,0641 | 0,0633 |

## Requisitos de hardware

- El entrenamiento se ejecutó sobre 32 GPUs NVIDIA H100 (4 nodos x 8, con HSDP); no se han publicado cifras de VRAM para inferencia.
- Para inferencia, dado el tamaño del repositorio (30,3 GB en bf16), es razonable estimar una necesidad de VRAM del orden de 32-40 GB o más, lo que apunta a GPUs tipo A100 40/80 GB o H100; no hay cifras oficiales.
- No cabe en GPUs de consumo habituales (RTX 4090 con 24 GB) según la estimación anterior, aunque no hay datos publicados que lo confirmen.
- Formato de pesos DCP del trainer: no hay conversiones publicadas a GGUF o safetensors monolíticos, por lo que opciones como llama.cpp u Ollama no aplican; la ejecución probablemente requiera el framework cosmos-framework-dev y el entorno conda indicado (`cosmos_fdm_conda_rlr:98a0b25c`).
- Latencia y throughput de inferencia: no disponibles.
- Nota: es un checkpoint intermedio (actualización 16.000 de 30.000) de un run aún en entrenamiento, no un modelo final.

## Comparativa con modelos similares

| Modelo | Tipo | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| SyncWorld-mv3-strip384-recent8-step16000 (este) | World model de vídeo multivista, in-context | Ancla + acciones + K fragmentos recientes (1-8) | openmdw-1.1 | Checkpoint intermedio público, 30,3 GB |
| yyuncong/SyncWorld-mv3-strip384-views-first-v10-step* (variante comparada) | World model de vídeo multivista, retrieval | Ancla + acciones + fragmentos por similitud (views first, 10 deg / 10 cm) | openmdw-1.1 (presumida) | Repos comparados en la misma serie de experimentos |
| Cosmos (NVIDIA) | Familia de world models de vídeo | Vídeo/texto | Licencia NVIDIA Cosmos | Framework upstream del que deriva la inicialización de este run |

La comparación cuantitativa de rendimiento entre la variante recent8 y la variante views-first no se ha publicado en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (actualización 16.000 de 30.000) de un run aún en entrenamiento; su calidad no representa un modelo final y puede mejorar o cambiar.
- Solo se generan 16 fotogramas futuros por consulta; horizontes de predicción más largos requieren encadenar consultas, con el consiguiente riesgo de acumulación de error.
- Sin memoria TTT: el condicionamiento se limita a los K fragmentos más recientes, lo que puede limitar el uso de información de contexto lejano en la secuencia.
- Riesgo de alucinación visual: como todo world model generativo basado en flow matching, puede generar dinámicas físicas implausibles, especialmente en escenas fuera de la distribución de los cuatro datasets de entrenamiento.
- Entrenado exclusivamente con grabaciones de experto de robocasa_v2, robomimic_v2, rlbench_wrist_mv y droid; el rendimiento en otros dominios robóticos o con datos no expertos no está evaluado.
- Sesgos: heredados de los datasets de simulación y teleoperación de experto empleados; no se ha publicado análisis de sesgos.
- Licencia openmdw-1.1 con enlace a la licencia de NVIDIA Cosmos: conviene revisar las condiciones de uso comercial específicas antes de desplegar en producción.
- Formato de pesos DCP no estándar: requiere el entorno y framework de entrenamiento originales, lo que dificulta el despliegue con herramientas habituales de inferencia.
- Idiomas soportados, métricas de evaluación downstream y cifras de hardware de inferencia: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-step16000
- Licencia referenciada (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
- Repos comparado de la misma serie: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-v10-step* (patrón de repos de la variante views-first; URL exacta por paso no disponible)
- Paper, blog o demo: no disponibles en la información proporcionada.
