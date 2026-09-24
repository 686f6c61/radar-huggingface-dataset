# tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918

## Resumen

`ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918` es un checkpoint de política robótica entrenada por imitación, publicado por el usuario `tarzanagh` en HuggingFace. No es un modelo de lenguaje: es una política visomotora (VLA/policy) que controla un robot bimanual DexMate Vega-1 equipado con dos manos diestras RobotEra XHand1. La tarea concreta es coger un juguete del segundo nivel de una estantería y dejarlo en el primero, con el brazo derecho activo y el izquierdo prácticamente estático.

El checkpoint forma parte de una familia etiquetada por el autor como "pi-0.5" y pertenece a una batería de 24 ejecuciones del mismo task, en la que se comparan cuatro familias de políticas (ACT, Diffusion Policy, GR00T 3B y pi-0.5) con y sin entrada táctil. Los datos de entrenamiento provienen de teleoperación con guante Meta y seguimiento de muñeca con Vive: 155 episodios, con 139 para entrenamiento y 16 reservados, cuatro cámaras RGB a 640×360 y 30 fps, y un espacio de estado/acción conjunto de 38 dimensiones.

Su relevancia es acotada pero clara: es un artefacto de investigación reproducible (10.000 pasos de entrenamiento, semilla 1000, partición de validación documentada y métrica de error en lazo abierto publicada) útil para quien trabaje en manipulación bimanual diestra, en comparación de familias de políticas o en reentrenamiento con datos propios. El repositorio tiene 14,5 GB y 3.616.769.814 parámetros según los pesos safetensors, pero cero descargas y cero "likes", y el propio autor advierte de que no se ha ejecutado nada en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo identifica la familia como "pi-0.5"; no detalla capas, encoder visual ni esquema de atención) |
| Parámetros totales | 3.616.769.814 (≈3,62 B), según los pesos safetensors |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica / no disponible. La política reobserva el entorno cada 16 pasos y predice un *chunk* de acciones, del que conserva las 16 primeras |
| Tipos de cuantización | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no hay capacidades lingüísticas declaradas) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Pipeline declarado en HuggingFace | robotics |
| Espacio de estado/acción | 38-D: `[L_arm 7 \| L_hand 12 \| R_arm 7 \| R_hand 12]` en posiciones articulares |
| Entradas sensoriales | 4 cámaras RGB, 640×360 a 30 fps |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Tamaño del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-09-24 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. La model card únicamente etiqueta el checkpoint como "pi-0.5" y especifica el esquema de control: la política observa el estado real cada 16 pasos y predice un *chunk* de acciones, del que se ejecutan las 16 primeras antes de volver a observar. El espacio de acción es un vector de 38 posiciones articulares que combina 7 grados de libertad por brazo y 12 por mano. No se documentan ni el encoder visual, ni el número de capas, ni el mecanismo de fusión multimodal, ni si existe un componente de lenguaje.

El entrenamiento se realizó durante 10.000 pasos con semilla 1000, sobre 155 episodios de teleoperación (139 de entrenamiento y 16 reservados, tomando cada décimo episodio como validación). La recogida de datos se hizo con guante Meta y seguimiento de muñeca Vive, sin exoesqueleto. No se especifican el número de tokens o frames consumidos, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por refuerzo. La única innovación metodológica reseñable que aparece documentada es el protocolo de evaluación: se mide error en lazo abierto contra las acciones grabadas, no éxito de tarea, y se compara contra una línea base trivial de "mantener el primer frame".

## Capacidades

- Ejecución de una política de imitación visomotora para una tarea de *pick-and-place* en dos niveles de estantería, con el brazo derecho activo y el izquierdo casi estático.
- Control bimanual coordinado: 7 grados de libertad por brazo y 12 por mano diestra RobotEra XHand1.
- Predicción de acciones en *chunks* de 16 pasos con reobservación periódica del estado real del robot y de las cuatro cámaras.
- Fusión de cuatro flujos de vídeo RGB a 640×360 y 30 fps con el estado articular.
- Generalización limitada a la tarea y al montaje concretos para los que se recogieron los 155 episodios de teleoperación.
- No se documentan capacidades de *tool calling*, *function calling*, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni ningún modo de "pensamiento" explícito.
- No se documentan capacidades multilingües ni interacción en lenguaje natural.

## Casos de uso

- Reproducción del experimento de referencia: cargar el checkpoint y replicar la tarea de coger un juguete del segundo estante y dejarlo en el primero con un DexMate Vega-1 y dos XHand1, usando los 16 episodios reservados como conjunto de validación en lazo abierto.
- Comparación entre familias de políticas: al existir 24 ejecuciones del mismo task (ACT, ACT+táctil, DP, DP+táctil, GR00T 3B, GR00T 3B+táctil, pi-0.5 y pi-0.5+táctil), este checkpoint sirve como una de las variantes a comparar bajo idéntico protocolo de datos y evaluación.
- Punto de partida para *fine-tuning* con datos propios: un equipo que disponga de teleoperación en un montaje bimanual similar puede reentrenar la política con sus propios episodios en lugar de partir de cero.
- Estudio de ablación de modalidad táctil: el autor publica pares de checkpoints con y sin entrada táctil, de modo que este modelo permite contrastar si el tacto aporta señal medible en la tarea.
- Depuración de *pipelines* de teleoperación: el error en lazo abierto desglosado por grupo articular (brazo izquierdo, mano izquierda, brazo derecho, mano derecha) permite localizar qué articulaciones tienen peor seguimiento en los datos de demostración.
- Evaluación de infraestructura de inferencia robótica: con cuatro cámaras, ~3,6 B de parámetros y reobservación cada 16 pasos, el checkpoint es un caso de prueba útil para medir latencia y *throughput* de un *pipeline* de política visomotora.
- Investigación sobre predicción por *chunks*: sirve para estudiar el compromiso entre horizonte de predicción (16 pasos ejecutados) y frecuencia de reobservación en políticas de imitación.
- Análisis de estabilidad en tareas con un brazo cuasiestático: el diseño de la tarea (brazo izquierdo casi inmóvil) lo hace adecuado como caso de control para estudiar deriva y error acumulado en la articulación no actuada.

## Benchmarks y rendimiento

El autor publica una única métrica: error en lazo abierto sobre los 16 episodios reservados (media del valor absoluto de la diferencia entre acción predicha y acción registrada, en radianes, ± error estándar). No es una medida de éxito de tarea y, según el propio autor, nada se ejecutó en hardware.

| Grupo articular | Este modelo (rad) | Línea base "hold-first-frame" (rad) |
|---|---|---|
| Brazo izquierdo (L-arm) | 0,0059 ± 0,0009 | 0,0219 |
| Mano izquierda (L-hand) | 0,0119 ± 0,0017 | 0,0172 |
| Brazo derecho (R-arm) | 0,0543 ± 0,0045 | 0,3166 |
| Mano derecha (R-hand) | 0,0388 ± 0,0049 | 0,2380 |

Resultados adicionales reportados por el autor, sin cifras asociadas: en el conjunto de cuatro familias por tres tareas, la entrada táctil no produjo diferencias más allá del ruido, y GR00T obtuvo el error más bajo en todas las tareas.

No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna suite estándar de modelos de lenguaje o de razonamiento, porque el modelo no es un modelo de lenguaje y no se han publicado ese tipo de evaluaciones.

## Requisitos de hardware

- VRAM de pesos: aproximadamente 7,2 GB en bf16/fp16 y 3,6 GB en int8, calculado a partir de los 3.616.769.814 parámetros (estimación propia; la precisión real almacenada no está documentada).
- El repositorio ocupa 14,5 GB, consistente con pesos en fp32 (~14,5 GB) o con pesos en bf16 más estados auxiliares; no se especifica qué contiene exactamente.
- VRAM total en inferencia: no disponible. Hay que sumar a los pesos las activaciones del encoder visual que procesa cuatro cámaras a 640×360, no cuantificadas en la información disponible.
- GPU recomendadas: no disponible. No se documenta ningún hardware de referencia, ni para entrenamiento ni para inferencia.
- Encaje en GPU de consumo: no confirmado. Por tamaño de pesos, un checkpoint en bf16 de ~3,6 B cabría en GPUs con 12-16 GB de VRAM si el resto del *pipeline* (cuatro cámaras) no dispara el consumo, pero esto es una estimación y no está verificado por el autor.
- Opciones de despliegue: no disponible. La model card no menciona vLLM, llama.cpp, Ollama, TGI, LeRobot ni ningún otro *runtime*. El único dato oficial es el pipeline `robotics` declarado en HuggingFace.
- Latencia y *throughput*: no disponibles. No se publican mediciones de frecuencia de inferencia, ni de si el modelo alcanza los 30 fps de las cámaras.
- Requisito de sistema completo: el modelo solo tiene sentido acoplado a un DexMate Vega-1 con dos manos RobotEra XHand1, hardware que condiciona cualquier despliegue real.

## Comparativa con modelos similares

El autor publica 24 ejecuciones de la misma tarea en cuatro familias de políticas. No todas tienen ficha con especificaciones en la información disponible, por lo que la comparación se limita a lo declarado.

| Modelo | Familia | Parámetros | Entrada táctil | Error en lazo abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (`..._pi05260918`) | pi-0.5 | 3,62 B (safetensors) | No | 0,0059 / 0,0119 / 0,0543 / 0,0388 rad por grupo | gemma | Público en HF, 0 descargas |
| `..._pi05tactile260918` | pi-0.5 | no disponible | Sí | no disponible en esta ficha | gemma | Público en HF |
| `..._gr00t3b260918` | GR00T 3B | no disponible (el nombre sugiere 3 B) | No | el más bajo en todas las tareas según el autor (sin cifras) | no disponible | Público en HF |
| `..._gr00t3btactile260918` | GR00T 3B | no disponible | Sí | no disponible en esta ficha | no disponible | Público en HF |
| `..._act260919` | ACT | no disponible | No | no disponible en esta ficha | no disponible | Público en HF |
| `..._dp260919` | Diffusion Policy | no disponible | No | no disponible en esta ficha | no disponible | Público en HF |

No se dispone de datos suficientes para comparar con alternativas externas a esta batería (por ejemplo, otras políticas bimanuales de la literatura) en parámetros, contexto, licencia o rendimiento.

## Limitaciones y advertencias

- No se ha ejecutado en hardware real. El propio autor indica explícitamente que "nothing here was run on hardware", por lo que no existe ninguna evidencia de éxito de tarea, solo de seguimiento de trayectoria en lazo abierto.
- La métrica publicada mide error de seguimiento contra acciones grabadas, no éxito de la tarea. Un error bajo en lazo abierto no garantiza que el robot coja y coloque el objeto.
- Evaluación con solo 16 episodios reservados, de una única tarea, en un único montaje y con una única semilla (1000) y un único presupuesto de entrenamiento (10.000 pasos). La significación estadística es muy limitada.
- Especialización extrema: el modelo está entrenado para una tarea concreta (segundo estante → primer estante) con el brazo derecho activo y el izquierdo casi estático. No cabe esperar generalización a otras tareas, objetos o disposiciones sin reentrenamiento.
- Riesgo de sobreajuste al montaje y a las condiciones de iluminación y cámara de la recogida de datos; no se documenta ninguna evaluación de robustez ante cambios de dominio.
- Dependencia de hardware muy específico: DexMate Vega-1 y dos manos RobotEra XHand1. Sin ese montaje, el checkpoint no es directamente utilizable.
- Metadatos incompletos: no se documentan arquitectura, precisión de pesos, requisitos de hardware, *runtime* de despliegue ni idiomas. Cualquier integración en producción exige una fase de caracterización previa.
- Licencia `gemma`: los pesos se distribuyen bajo la licencia de Gemma, no bajo una licencia de robótica o de código abierto permisiva. Antes de un uso comercial hay que revisar los términos de esa licencia, que impone condiciones y restricciones de uso adicionales, y verificar si encajan con un despliegue en robot físico.
- Estado de validación por la comunidad nulo: 0 descargas y 0 "likes", sin issues ni discusiones públicas. No hay terceros que hayan reproducido los resultados.
- El propio autor reporta que la entrada táctil no aportó diferencias más allá del ruido en las cuatro familias y tres tareas evaluadas, lo que sugiere que la señal táctil no está siendo explotada de forma efectiva en este *pipeline*.
- Los sellos temporales de los metadatos de HuggingFace (creación y actualización en septiembre de 2026) no permiten extraer conclusiones sobre la vigencia del modelo respecto al estado del arte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918
- Variante pi-0.5 con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
