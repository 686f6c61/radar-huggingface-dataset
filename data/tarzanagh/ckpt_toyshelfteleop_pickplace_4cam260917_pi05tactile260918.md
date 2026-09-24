# tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918

## Resumen

`tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918` es un checkpoint de una política robótica de imitación denominada pi-0.5 con entrada táctil, publicado por el usuario tarzanagh en Hugging Face. El modelo controla un robot bimanual DexMate Vega-1 equipado con dos manos diestras RobotEra XHand1 en una tarea muy concreta: coger un juguete del segundo estante y depositarlo en el primero, usando el brazo derecho mientras el izquierdo permanece prácticamente estático.

El checkpoint declara 3.616.769.814 parámetros (unos 3,62 mil millones) en formato safetensors y ocupa 14,5 GB en el repositorio. Se entrenó por imitación a partir de 155 episodios de teleoperación (139 de entrenamiento y 16 reservados), con 4 cámaras RGB a 640x360 y 30 fps, y una representación de estado y acción de 68 dimensiones que combina posiciones articulares con fuerzas en las puntas de los dedos.

Su relevancia es de nicho: forma parte de una comparativa interna de 24 ejecuciones sobre la misma tarea (ACT, Diffusion Policy, GR00T 3B y pi-0.5, con y sin táctil), y su propio autor advierte que la entrada táctil no aportó diferencias más allá del ruido. No es un modelo de lenguaje ni de propósito general: es un artefacto de investigación atado a una tarea, un montaje y un robot específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de imitación visión-lenguaje-acción (VLA), denominada pi-0.5 en el propio nombre del checkpoint; el detalle de bloques, atención y cabezas no está disponible en la información proporcionada |
| Parametros totales | 3.616.769.814 (≈3,62 mil millones), según los safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; no aplicable en el sentido de contexto textual. La política consume observaciones de 4 cámaras RGB a 640x360 y 30 fps y predice fragmentos (chunks) de 16 acciones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se documenta condicionamiento por lenguaje) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Autor | tarzanagh |
| Pipeline declarado | robotics |
| Tamano del repositorio | 14,5 GB |
| Estado y accion | 38-D de posiciones articulares (`[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`) mas 30-D de fuerza en puntas de dedos (5 dedos x 3 ejes por mano), concatenados en 68-D |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Teleoperacion | guante Meta (sin exoesqueleto) y seguimiento de muñeca Vive |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por el nombre del checkpoint y las etiquetas (`robotics`, `imitation-learning`, `bimanual`, `dexterous-manipulation`) se trata de una política de imitación de tipo visión-lenguaje-acción basada en la familia pi-0.5, condicionada además por señal táctil. Cualquier detalle sobre el codificador visual, el mecanismo de fusión multimodal, el tipo de decodificación de acciones o el uso de flow matching no está disponible en la información proporcionada y no debe darse por supuesto.

Los datos de entrenamiento sí están documentados: 155 episodios de teleoperación con guante Meta y seguimiento de muñeca Vive, de los cuales 139 se usaron para entrenamiento y 16 quedaron reservados (uno de cada diez). Cada episodio incluye 4 cámaras RGB a 640x360 y 30 fps. El estado y la acción se representan como un vector de 38 dimensiones de posiciones articulares (7 del brazo izquierdo, 12 de la mano izquierda, 7 del brazo derecho y 12 de la mano derecha) más 30 dimensiones de fuerza táctil en las puntas de los dedos, concatenadas hasta 68 dimensiones. El entrenamiento se realizó durante 10.000 pasos con semilla 1000.

La innovación que el autor destaca es la incorporación de señal táctil al estado. Sin embargo, el propio autor concluye que, en el conjunto de cuatro familias de políticas y tres tareas evaluadas, la entrada táctil no produjo diferencias más allá del ruido, y que GR00T obtuvo el menor error en todas las tareas.

## Capacidades

- Manipulación robótica de una sola tarea: recoger un juguete del segundo nivel de un estante y colocarlo en el primero.
- Ejecución bimanual nominal sobre DexMate Vega-1, aunque el brazo izquierdo permanece prácticamente estático durante la tarea y la mayor parte del movimiento recae en el brazo derecho.
- Control de manos diestras RobotEra XHand1, con 12 dimensiones de articulación por mano (24 en total).
- Condicionamiento por señal táctil: el estado incorpora 30 dimensiones de fuerza en las puntas de los dedos (5 dedos x 3 ejes por mano).
- Percepción visual multimodal: consume 4 cámaras RGB a 640x360 y 30 fps.
- Predicción de acciones por fragmentos: genera un chunk completo de 16 acciones y aplica las 16 antes de volver a observar el entorno real (política de tipo "chunk + re-observación cada 16 pasos").
- No se documentan capacidades de generación de texto, razonamiento simbólico, matemáticas, código, tool calling, uso de agentes ni capacidades multilingües.

## Casos de uso

- Reproducción de la tarea pick-and-place en el montaje original: el modelo recibe las 4 cámaras, el estado articular de 68-D y devuelve 16 acciones; sirve para replicar exactamente el escenario de juguete y estante sobre el que se entrenó, siempre que el robot, las manos y las cámaras coincidan.
- Fine-tuning hacia tareas de manipulación bimanual con manos diestras: al partir de un checkpoint de 3,62 mil millones de parámetros ya ajustado a observaciones de 4 cámaras y a un espacio de acción de 38-D + 30-D táctil, resulta un punto de partida razonable para reentrenar con nuevos episodios de teleoperación en el mismo hardware.
- Estudio comparativo de familias de políticas: el checkpoint forma parte de una serie de 24 ejecuciones sobre la misma tarea que incluye ACT, Diffusion Policy, GR00T 3B y pi-0.5, con y sin táctil; se puede usar para reproducir la comparación de error en lazo abierto.
- Evaluación del valor real de la señal táctil: dado que el autor concluye que la entrada táctil no mejoró los resultados más allá del ruido, este checkpoint (con táctil) y su variante sin táctil permiten montar un experimento controlado para medir el efecto de esa modalidad.
- Investigación en teleoperación con guante: el pipeline de recogida de datos (guante Meta más seguimiento Vive) puede reutilizarse como referencia metodológica para registrar nuevos episodios y verificar el efecto de la calidad de la teleoperación en el error de la política.
- Referencia para evaluación en lazo abierto: la métrica de error medio |predicción − acción registrada| en radianes sobre los 16 episodios reservados sirve como base para comparar variantes de cuantización o de destilado sin necesidad de acceso al robot físico.
- Base para experimentos de compresión: con 3,62 mil millones de parámetros y un repositorio de 14,5 GB, es un candidato para probar cuantización o poda y medir la degradación del error de seguimiento antes de intentar cualquier despliegue embebido.

## Benchmarks y rendimiento

El autor publica únicamente el error en lazo abierto sobre los 16 episodios reservados (media |predicción − acción registrada| en radianes, ± error estándar, n=16), comparado con una línea base de "mantener el primer fotograma" (hold-first-frame):

| Componente | Este modelo | Hold-first-frame |
|---|---|---|
| L-arm | 0,0062 ± 0,0009 | 0,0219 |
| L-hand | 0,0123 ± 0,0016 | 0,0172 |
| R-arm | 0,0590 ± 0,0056 | 0,3166 |
| R-hand | 0,0399 ± 0,0048 | 0,2380 |

El propio autor advierte de dos matices importantes: esta métrica mide seguimiento de trayectoria, no éxito de tarea, y no se ejecutó nada en hardware real. Además, en la comparación cruzada de cuatro familias de políticas y tres tareas, GR00T obtuvo el error más bajo en todas las tareas y la señal táctil no aportó mejoras fuera del ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 3,62 mil millones de parámetros: unos 7,3 GB en bf16/fp16, unos 14,5 GB en fp32, unos 3,6 GB en int8 y unos 1,8 GB en int4. Son estimaciones aritméticas a partir del recuento de parámetros, no cifras publicadas por el autor, y no incluyen la memoria de activaciones de los codificadores visuales ni del estado táctil.
- GPU recomendadas para investigación: A100, H100 o L40S para entrenamiento y fine-tuning; RTX 4090 o RTX 3090 (24 GB) para inferencia y ajuste ligero.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 16 GB o más (RTX 4080, RTX 4090, RTX 3090); en tarjetas de 12 GB o menos requeriría cuantización a int8 o int4.
- Opciones de despliegue: no disponibles. El repositorio solo distribuye pesos en safetensors y no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tratarse de una política robótica con entradas multimodales (4 cámaras, estado articular y táctil), esos servidores de inferencia de texto no son aplicables tal cual. Se necesitaría el stack de entrenamiento original, no especificado.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni frecuencia de control alcanzable; se sabe únicamente que la política reobserva el entorno cada 16 acciones.
- Requisitos adicionales no cubiertos por la VRAM: 4 cámaras RGB a 640x360 y 30 fps, el robot DexMate Vega-1 con dos manos XHand1, y sensores táctiles capaces de entregar 30 dimensiones de fuerza en las puntas de los dedos.

## Comparativa con modelos similares

No se dispone de parámetros, contexto ni licencias de las alternativas. La comparación se limita a la serie de la misma tarea publicada por el mismo autor:

| Modelo | Enfoque | Entrada táctil | Parametros | Error en la tarea |
|---|---|---|---|---|
| Este modelo (pi05tactile260918) | pi-0.5 + táctil | Sí | 3,62 mil millones | Ver tabla de benchmarks |
| `ckpt_..._pi05260918` | pi-0.5 sin táctil | No | no disponible | no disponible en esta ficha |
| `ckpt_..._gr00t3b260918` | GR00T | No | ≈3 mil millones (por el nombre) | El autor indica que fue el menor en todas las tareas |
| `ckpt_..._gr00t3btactile260918` | GR00T + táctil | Sí | ≈3 mil millones (por el nombre) | no disponible en esta ficha |
| `ckpt_..._act260919` / `acttactile260919` | ACT | No / Sí | no disponible | no disponible en esta ficha |
| `ckpt_..._dp260919` / `dptactile260919` | Diffusion Policy | No / Sí | no disponible | no disponible en esta ficha |

## Limitaciones y advertencias

- Modelo de tarea única: solo está entrenado para coger un juguete del segundo estante y dejarlo en el primero. No generaliza a otras tareas ni a otras disposiciones de objetos.
- Dependencia total del hardware: requiere un DexMate Vega-1 con dos manos RobotEra XHand1, 4 cámaras RGB en la configuración exacta y sensores táctiles de 30 dimensiones. Sin ese montaje, el checkpoint no es utilizable.
- La señal táctil no demostró utilidad: el propio autor concluye que, en cuatro familias de políticas y tres tareas, la entrada táctil no marcó diferencias más allá del ruido. Un modelo comparable sin táctil rinde igual según esa evaluación.
- La métrica publicada mide seguimiento de trayectoria en lazo abierto, no éxito de tarea. Un error bajo de seguimiento no implica que la tarea se complete.
- Nada se ha probado en hardware real: la model card indica explícitamente que no se ejecutó en el robot. Existe riesgo de que el comportamiento en lazo cerrado difiera del error reportado.
- Brazo izquierdo prácticamente estático: la política no demuestra coordinación bimanual real en esta tarea, pese a las etiquetas `bimanual` y `dexterous-manipulation`.
- Sesgo de datos: solo 139 episodios de entrenamiento, todos generados por teleoperación con guante Meta en un único montaje y por un número reducido de operadores. No hay cobertura documentada de variaciones de iluminación, posición inicial u objetos.
- Riesgo de sobreajuste al escenario: el modelo reserva 16 episodios de la misma distribución, por lo que la evaluación no mide generalización fuera de ese entorno.
- Licencia `gemma`: la licencia no es abierta en sentido amplio. Antes de cualquier uso comercial es obligatorio revisar los términos de la licencia Gemma y sus cláusulas de uso aceptable, distribución y atribución.
- Adopción nula y sin validación externa: el repositorio registra 0 descargas y 0 "me gusta", y no hay paper ni evaluación independiente asociada.
- Idiomas y capacidades lingüísticas: no aplicables. Este modelo no procesa texto de usuario ni genera lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918
- Variante pi-0.5 sin táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918
- Variante ACT sin táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919
- Variante Diffusion Policy sin táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919
- Variante GR00T 3B sin táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918
- Paper, blog o repositorio de código: no disponibles en la información proporcionada.
