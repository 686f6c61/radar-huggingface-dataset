# yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step13000

## Resumen

SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step13000 es un checkpoint intermedio (actualización 13.000 de 20.000) de un modelo del mundo para robótica desarrollado por el usuario yyuncong. El modelo aprende dinámica directa (*forward dynamics*) sobre datos bimanuales del conjunto RoboTwin 2.0, concretamente sobre las cámaras de cabeza del release `syncsim-rt2-head`, y se enmarca dentro de la familia SyncWorld, orientada a la simulación y predicción de entornos robóticos.

Este checkpoint concreto es el control de un experimento de recuperación en contexto (*in-context retrieval*). Sustituye el selector aprendido de contexto por un selector fijo con todos los pesos a 1 y aplica la regla de hermanos OR desde la primera actualización. Se inicializa, solo con pesos, desde mvSV3p en la actualización 20.000 y comparte receta, datos, semillas y hardware con la variante con selector aprendido v2, lo que permite aislar el efecto del mecanismo de selección de contexto.

El modelo forma parte de un conjunto de tres repos publicados conjuntamente (control con pesos iguales, selector v2 aprendido y baseline recent8 sin recuperación) que constituyen una comparativa controlada sobre el mismo *pipeline* de datos. Su relevancia es metodológica: permite evaluar si la recuperación de contexto aprendida aporta ventaja frente a una selección uniforme en modelos del mundo para manipulación bimanual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo del mundo para robótica; detalles de la red no especificados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (contexto compuesto por K chunks recuperados; valor de K no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada multimodal de vídeo y acciones de pose) |
| Licencia | openmdw-1.1 (referenciada como `other`; enlace a licencia de NVIDIA Cosmos) |
| Formato de pesos | no disponible (repo de 30,3 GB; formato concreto no indicado) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red (número de capas, dimensión, tipo de transformer o híbrido). Lo que sí se especifica es el diseño del sistema de contexto: el modelo opera con recuperación en contexto sobre una librería de *chunks* y utiliza una tabla de huecos de contexto (*context-gap table*) entrenada, junto con un vector de misma escena. En este checkpoint, el selector de contexto es fijo: un *scorer* con todos los pesos a 1 sustituye al selector aprendido, y la regla de hermanos OR se aplica desde la primera actualización. No hay fichero `router.npz` en este repo, a diferencia de la variante v2.

Los datos provienen del prep `mv_strip_rt2h_v1` sobre el release `syncsim-rt2-head` de RoboTwin 2.0, con 47.334 episodios en el índice. Tras filtrado quedan 45.184 episodios válidos (932 reservados para evaluación por hash SHA-256 y 1.218 descartados por *flags* de calidad del experto), lo que genera 225.001 grabaciones: 45.184 de expertos y 179.817 *rollouts* contrafactuales. Cada grabación tiene cuatro cámaras de 384x384 (dos de cabeza y dos de muñeca). Los frames se componen como tiras de 1536x384 con tres celdas de 512x384: cabeza, muñeca izquierda y muñeca derecha. Se aplica *view dropout* (10 % una cámara, 5 % dos) y recorte vertical aleatorio por flujo. El entrenamiento se ejecutó en 4 nodos x 8 B200 con un calentamiento de 100 actualizaciones y 20.000 actualizaciones planificadas.

## Capacidades

- Predicción de dinámica directa (*forward dynamics*) en entornos de manipulación bimanual.
- Procesamiento de entrada multivista: tres cámaras por frame (una de cabeza y dos de muñeca) en formato de tira 1536x384.
- Recuperación en contexto de *chunks* de una librería, con selección mediante *scorer* fijo de pesos uniformes.
- Manejo de acciones de pose realizadas (*realized pose actions*) como parte de la entrada.
- Aplicación de la regla de hermanos OR para la selección de contexto.
- Modelado de escenas con vector de misma escena y tabla de huecos de contexto.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo *thinking*.

## Casos de uso

- Evaluación controlada de mecanismos de recuperación: este checkpoint sirve como control frente a la variante con selector aprendido v2, permitiendo medir la contribución del selector entrenado en igualdad de condiciones de datos, semillas y hardware.
- Investigación en modelos del mundo para robótica: permite estudiar cómo la selección uniforme de contexto afecta a la predicción de dinámica en manipulación bimanual.
- Simulación de rollouts contrafactuales: el modelo se entrena con 179.817 rollouts que divergen de su experto, lo que lo hace adecuado para explorar predicciones fuera de la trayectoria experta.
- Análisis de robustez multivista: con *view dropout* y recortes aleatorios en entrenamiento, puede emplearse para estudiar la dependencia de la predicción respecto a la cámara de cabeza o las de muñeca.
- Reproducción de experimentos: al compartir receta con los otros dos repos publicados conjuntamente, permite replicar la comparativa completa entre control, selector v2 y baseline recent8.
- Estudio de la regla de hermanos OR: sirve para analizar el efecto de esta heurística de selección de contexto en la calidad de la predicción.
- Base para *fine-tuning* en tareas RoboTwin 2.0: al ser un checkpoint intermedio con pesos de mvSV3p, puede servir de inicialización para experimentos posteriores sobre el mismo prep de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es de 30,3 GB, pero no se especifica el número de parámetros ni la precisión de los pesos).
- GPU de entrenamiento utilizadas: 4 nodos x 8 B200 (32 GPU B200 en total).
- GPU recomendadas para inferencia: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo es de robótica y no lingüístico).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Selector de contexto | Inicializacion | Hardware de entrenamiento | Licencia |
|---|---|---|---|---|---|---|
| Este control (equalw) | no disponible | K chunks (K no especificado) | Fijo, pesos a 1, regla OR | mvSV3p update 20000 | 4x8 B200 | openmdw-1.1 |
| Selector v2 (OR) | no disponible | K chunks (K no especificado) | Aprendido (`router.npz`) | mvSV3p update 20000 | 4x8 B200 | openmdw-1.1 |
| recent8 (baseline) | no disponible | K chunks propios de la grabacion | Sin recuperacion | mvA3p update 20000 | 4x8 H100 | openmdw-1.1 |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 13.000 de 20.000 planificadas; el entrenamiento no ha finalizado.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; sus entradas son vídeo multivista y acciones de pose.
- La model card no especifica arquitectura, número de parámetros, formato de pesos ni requisitos de inferencia, lo que dificulta su reutilización fuera del entorno de entrenamiento original.
- Licencia `openmdw-1.1` referenciada como `other`: es necesario revisar el enlace a la licencia de NVIDIA Cosmos para confirmar las condiciones de uso comercial.
- Riesgo de alucinación en el sentido de predicciones físicamente inconsistentes: al ser un modelo de dinámica entrenado con rollouts contrafactuales, puede generar trayectorias no realistas fuera de la distribución de entrenamiento.
- Sesgos derivados del dataset: limitado a 8 conjuntos de robots y 50 tareas de RoboTwin 2.0; no se garantiza generalización a otros robots, tareas o configuraciones de cámara.
- El *view dropout* y los recortes aleatorios de entrenamiento implican que el rendimiento en evaluación con la configuración canónica puede diferir del observado en entrenamiento.
- No se documentan resultados de benchmarks ni métricas de calidad, por lo que no es posible evaluar su rendimiento de forma objetiva con la información disponible.
- El repo no incluye `router.npz`; cualquier uso que dependa de un selector aprendido debe recurrir a la variante v2.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step13000
- Variante con selector v2: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step13000
- Baseline recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step12000
- Checkpoint previo de este control (update 2000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step2000
- Inicializacion mvSV3p: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Inicializacion recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000
- Licencia openmdw-1.1: https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
