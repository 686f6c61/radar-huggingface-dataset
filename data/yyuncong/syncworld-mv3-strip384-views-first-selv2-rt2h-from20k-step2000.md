# yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step2000

## Resumen

SyncWorld es un modelo de mundo (world model) para robótica desarrollado por el usuario `yyuncong`, orientado a la predicción de dinámica futura (*forward dynamics*) en escenarios de manipulación bimanual. El modelo consume un fotograma de anclaje junto con una secuencia de acciones de efector final y genera los fotogramas siguientes, condicionado por un contexto recuperado (*in-context retrieval*) de episodios previos. La variante aquí descrita corresponde al checkpoint intermedio de iteración 2000 de un entrenamiento planificado de 20.320 iteraciones, con un selector de contexto aprendido ("selector v2") y la regla de hermanos OR, entrenado sobre datos de cámara de cabeza del dataset RoboTwin 2.0 (RT2H).

El repositorio ocupa 30,4 GB y se distribuye bajo licencia OpenMDW-1.1 (licencia asociada al proyecto NVIDIA Cosmos). Se inicializa a partir de los pesos de `mvSV3p` en la actualización 20000 y mantiene su receta: recuperación *views-first*, acciones de pose de efector final realizadas y pérdida ponderada por movimiento por celda. La relevancia actual radica en que explora el uso de contexto recuperado y seleccionado de forma aprendida para modelos de mundo en robótica, una línea poco cubierta por los modelos de mundo generativos de propósito general.

No se dispone de información pública sobre benchmarks, número de parámetros ni longitud de contexto en la documentación proporcionada; los detalles técnicos disponibles se limitan a la receta de entrenamiento y a la descripción del pipeline de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa *in-context* (sin memoria TTT); modelo de mundo multivista con recuperación de contexto |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en tokens; el contexto se compone de K fragmentos recuperados más una consulta de 1 fotograma de anclaje + 16 acciones futuras |
| Tipos de cuantizacion | no disponible (pesos en bf16 según el checkpoint de referencia) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | no disponible explícitamente; el checkpoint de referencia se distribuye en bf16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con atención completa sobre el contexto, sin memoria TTT. Cada consulta consiste en un fotograma de anclaje más sus 16 acciones futuras, y el modelo genera los 16 fotogramas siguientes. Los K fragmentos de contexto se colocan antes de la consulta como condicionamiento limpio, cada uno con el embedding aprendido de su distancia al anclaje (más el vector de misma escena para los hermanos de episodio de la consulta). La recuperación es *views-first* y utiliza un selector de contexto aprendido ("selector v2") que elige qué fragmentos ocupan las ranuras *in-context*, bajo la regla de hermanos OR. El entrenamiento se realiza sobre 4 nodos × 8 GPU B200, con 20.320 iteraciones planificadas (20.000 actualizaciones del generador y 40 bloques de etiquetado de 8).

Los datos provienen de la preparación `mv_strip_rt2h_v1` del dataset SyncSim RoboTwin 2.0 de cámara de cabeza (`syncsim-rt2-head`, revisión 756f9ad9): 45.184 episodios de 50 tareas en 8 conjuntos (aloha-agilex, arx-x5, franka y ur5, cada uno en `clean_50` y `randomized_500`), con 225.001 grabaciones (45.184 expertas y 179.817 rollouts contrafactuales). Cada episodio incluye dos cámaras de cabeza y dos de muñeca a 384×384. Las acciones son deltas de pose de efector final de ambos brazos (14 números por paso: [dx, dy, dz cm, roll, pitch, yaw, apertura de pinza] por brazo), en el marco del efector final. Cada fotograma se representa como una tira de 1536×384 con tres celdas de 512×384 (una cámara de cabeza y las dos de muñeca). En entrenamiento se aplica *augmentation*: selección aleatoria de cámara de cabeza, enmascarado de celdas (probabilidad 0,1 para una, 0,05 para dos) y recorte 4:3 a altura aleatoria. El dominio de embodiment es `bimanual_gripper` (id 26), con copia de filas desde `gripperhead` en el arranque en caliente.

## Capacidades

- Predicción de dinámica futura (*forward dynamics*) en manipulación robótica bimanual: genera los 16 fotogramas siguientes a partir de un anclaje y 16 acciones.
- Condicionamiento por acciones de efector final (pose y apertura de pinza) para ambas extremidades.
- Entrada multivista: una cámara de cabeza y dos de muñeca, compuestas en una tira de tres celdas.
- Recuperación *in-context* de episodios previos mediante un selector aprendido y la regla de hermanos OR.
- Generalización entre conjuntos de robots (aloha-agilex, arx-x5, franka, ur5) y entre condiciones `clean_50` y `randomized_500`.
- Modelado de rollouts contrafactuales con perturbaciones de un brazo.
- No se documentan capacidades de *tool calling*, agentes, razonamiento simbólico, visión general, audio ni multilingüismo.

## Casos de uso

- **Planificación de manipulación bimanual en simulación**: dado un estado observado y una secuencia de acciones candidata, el modelo predice los fotogramas futuros y permite evaluar la plausibilidad de la trayectoria antes de ejecutarla en el simulador o en el robot.
- **Aumento de datos para políticas robóticas**: generar rollouts sintéticos condicionados por acciones permite ampliar datasets de entrenamiento de políticas en tareas con pocos expertos, aprovechando los 179.817 rollouts contrafactuales del corpus original como referencia.
- **Evaluación de políticas sin ejecución física**: usar el modelo como simulador neuronal para comparar políticas candidatas en tareas de RoboTwin 2.0 antes de desplegarlas en hardware real, reduciendo coste y riesgo.
- **Estudio de recuperación de contexto en modelos de mundo**: el checkpoint sirve como base para investigar cómo el selector aprendido y la regla de hermanos OR afectan a la calidad de la predicción frente a la línea base *recent8* y al control de pesos iguales.
- **Predicción de consecuencias de perturbaciones**: el modelo está entrenado con rollouts contrafactuales que perturban un brazo, por lo que puede emplearse para anticipar el efecto de desviaciones en la trayectoria de una extremidad.
- **Investigación en *world models* para robótica**: al ser un checkpoint intermedio con receta documentada, es adecuado para reproducir experimentos de *in-context retrieval* y comparar variantes de selección de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio ocupa 30,4 GB, lo que da una cota inferior del tamaño de los pesos; la inferencia requiere además memoria para el contexto recuperado (K fragmentos) y los fotogramas de 1536×384.
- **GPU de entrenamiento**: el run se ejecutó en 4 nodos × 8 GPU B200 (32 B200 en total).
- **GPU de referencia para la línea base**: 4 nodos × 8 GPU H100 (32 H100) para la variante *recent8*.
- **GPU de consumo**: no disponible; por el tamaño del repositorio (30,4 GB) no es probable que quepa en GPU de consumo de 24 GB sin cuantización, pero no se documenta ninguna.
- **Opciones de despliegue**: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de mundo visual).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step2000 (este) | no disponible | K fragmentos recuperados + anclaje + 16 acciones | Modelo de mundo multivista con selector de contexto aprendido | OpenMDW-1.1 | Hugging Face |
| SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step2000 | no disponible | K fragmentos recuperados + anclaje + 16 acciones | Mismo pipeline con scorer fijo (suma de 7 similitudes, pesos 1×7, fuerza 0), sin etiquetado ni reajustes | OpenMDW-1.1 | Hugging Face |
| SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000 | no disponible | K fragmentos previos de la propia grabación (sin biblioteca ni selector) | Línea base *recent8*; inicializada desde mvA3p, no desde mvSV3p | OpenMDW-1.1 | Hugging Face |

La comparación con el control de pesos iguales es la más limpia: comparten inicialización, biblioteca, regla OR, K, optimizador, semillas y hardware, y difieren solo en el selector. La comparación con *recent8* no es emparejada, ya que cambia tanto la inicialización como el mecanismo de contexto.

## Limitaciones y advertencias

- **Checkpoint intermedio**: es la iteración 2000 de 20.320 planificadas (1.968 de 20.000 actualizaciones del generador); no es un modelo final y su rendimiento no representa el del entrenamiento completo.
- **Sesgos de datos**: entrenado exclusivamente sobre RoboTwin 2.0 (50 tareas, 8 conjuntos de robots, entornos simulados); el comportamiento fuera de esa distribución no está validado.
- **Riesgo de alucinación visual**: como modelo generativo de fotogramas, puede producir predicciones visualmente plausibles pero físicamente incorrectas; no se documentan métricas de fidelidad.
- **Dominio restringido**: solo manipulación bimanual con el esquema de acciones de 14 dimensiones y el layout de tres cámaras descrito; no admite otras modalidades ni idiomas.
- **Licencia**: OpenMDW-1.1, con enlace a la licencia de NVIDIA Cosmos; deben revisarse las condiciones para uso comercial antes de desplegarlo en producción.
- **Sin benchmarks publicados**: no hay resultados comparativos que permitan estimar su calidad frente a alternativas.
- **Sin datos de cuantización ni despliegue**: no se documentan formatos GGUF ni recetas de inferencia optimizada, lo que dificulta su uso fuera del *stack* de entrenamiento original.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step2000
- Checkpoint de referencia mvSV3p (bf16): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Control de pesos iguales: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step2000
- Línea base *recent8*: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000
- Checkpoint *recent8* de referencia: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
