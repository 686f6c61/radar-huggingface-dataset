# yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step2000

## Resumen
SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step2000 es un checkpoint intermedio de un modelo del mundo (world model) para robótica, desarrollado por el usuario yyuncong. Se trata de la variante de control con selector fijo de un experimento de recuperación en contexto (in-context retrieval) sobre datos bimanuales de RoboTwin 2.0. El modelo predice dinámica futura (forward dynamics) a partir de observaciones multivista y acciones de pose, en lugar de generar texto o código.

El modelo parte de un entrenamiento previo (mvSV3p en la actualización 20000) y en este checkpoint acumula 2000 actualizaciones de generador de las 20000 planificadas, por lo que es un artefacto de investigación en curso y no un modelo final. Su relevancia radica en que estudia cómo seleccionar contexto de recuperación para predecir el futuro en tareas de manipulación bimanual, un problema central en el aprendizaje por imitación y la planificación robótica. La arquitectura concreta (transformer u otra) no se detalla en la información disponible.

El repositorio ocupa 30,3 GB y se distribuye con licencia OpenMDW-1.1. No hay datos publicados sobre parámetros, contexto o idiomas, y el modelo no está pensado para inferencia de propósito general sino para experimentación en robótica.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo del mundo para robótica; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (usa K chunks de contexto recuperado; K no publicado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | OpenMDW-1.1 (license: other) |
| Formato de pesos | no disponible (repo de 30,3 GB; formato no especificado) |

## Arquitectura y entrenamiento
El modelo es un world model de dinámica forward para robótica bimanual. Procesa secuencias de frames multivista en tiras de 1536x384 compuestas por tres celdas de 512x384: cámara de cabeza, muñeca izquierda y muñeca derecha. Las acciones son vectores de 14 dimensiones por paso (posición, orientación euler y apertura de pinza para cada brazo), calculados como el movimiento realizado del efector final entre frames consecutivos en el marco del brazo en el frame anterior, con el eje z reorientado como eje de aproximación. Los frames se condicionan a 15 fps.

El entrenamiento usa el dataset SyncSim RoboTwin 2.0 (cámara de cabeza), con 47.334 episodios indexados de los que se conservan 45.184, dando 225.001 grabaciones en total (45.184 expertas y 179.817 rollouts contrafactuales). Cubre 8 conjuntos de robots (aloha-agilex, arx-x5, franka y ur5, en variantes clean_50 y randomized_500) y 50 tareas. Se aplica dropout de vistas (10 % una cámara, 5 % dos) y recorte vertical aleatorio. Este checkpoint concreto es el control con selector fijo: todos los requisitos ponderan 1 en lugar de usar un scorer aprendido, con la regla de hermanos OR activa desde la primera actualización. Se inicializa solo con pesos desde mvSV3p en la actualización 20000, con la tabla de huecos de contexto entrenada y un warm-up de 100 actualizaciones. Se entrenó en 4 nodos x 8 B200 (32 GPUs B200) durante 2000 actualizaciones de generador.

## Capacidades
- Predicción de dinámica forward: genera estados futuros a partir de observaciones multivista y acciones de pose bimanuales.
- Recuperación en contexto: selecciona chunks de contexto de una librería de grabaciones para condicionar la predicción.
- Procesamiento multivista: integra cámara de cabeza y dos cámaras de muñeca en una tira unificada.
- Acciones bimanuales de 14 dimensiones con deltas de efector final y apertura de pinza.
- Soporte de rollouts contrafactuales como queries y como parte de la librería de contexto.
- No dispone de generación de texto, código, matemáticas ni visión de propósito general.
- No se documenta soporte de tool calling, agentes ni capacidades multilingües.

## Casos de uso
- Investigación en world models para robótica: sirve como checkpoint de referencia para estudiar el efecto de un selector de contexto fijo frente a uno aprendido en la predicción de dinámica.
- Predicción de trayectorias bimanuales: dado un estado observado y una secuencia de acciones, estima la evolución de las cámaras de cabeza y muñecas para planificación.
- Evaluación de estrategias de recuperación: permite comparar la regla de hermanos OR con el baseline recent8 y con el selector v2 en igualdad de datos y hardware.
- Aprendizaje por imitación con contexto: usar grabaciones expertas recuperadas como condicionamiento para generar rollouts plausibles en tareas de manipulación.
- Estudio de robustez multivista: analizar cómo afectan el dropout de vistas y los recortes aleatorios a la calidad de la predicción.
- Base para fine-tuning en dominios de acciones específicos: el warm start con copias de dominio (gripperhead:bimanual_gripper) facilita adaptar el modelo a nuevos esquemas de acción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible; el repositorio pesa 30,3 GB y los requisitos de inferencia no se documentan.
- GPU recomendadas: el entrenamiento usó 4 nodos x 8 B200 (32 GPUs B200); no se especifican requisitos de inferencia.
- Cabeza en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (control, selector fijo) | no disponible | K chunks (K no publicado) | no disponible | OpenMDW-1.1 | Hugging Face |
| SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step2000 | no disponible | K chunks | no disponible | OpenMDW-1.1 | Hugging Face |
| SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000 | no disponible | K chunks propios (sin librería) | no disponible | OpenMDW-1.1 | Hugging Face |

Los tres comparten datos, acciones, layout de celdas, muestreo de K y queries; difieren en el mecanismo de selección de contexto. No hay métricas comparativas publicadas.

## Limitaciones y advertencias
- Checkpoint intermedio: solo 2000 de 20000 actualizaciones planificadas; no es un modelo final ni validado para producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Sesgos desconocidos: no se documenta análisis de sesgos en el dataset ni en las predicciones.
- Riesgo de alucinación: en world models, la predicción puede divergir de la realidad física, especialmente en rollouts largos o estados fuera de distribución.
- Dominio restringido: entrenado exclusivamente en RoboTwin 2.0 con 8 conjuntos de robots y 50 tareas; la generalización a otros robots o entornos no está demostrada.
- Licencia OpenMDW-1.1: revisar los términos en el enlace de licencia antes de uso comercial; se etiqueta como "other".
- Sin documentación de cuantizaciones ni formatos de pesos: dificulta el despliegue en hardware limitado.
- No es un modelo de lenguaje: no soporta idiomas, tool calling ni agentes conversacionales.

## Enlaces
- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step2000
- Variante selector v2: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step2000
- Baseline recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000
- Checkpoint de partida mvSV3p: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Checkpoint de partida recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000
- Licencia OpenMDW-1.1: https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
