# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921

## Resumen

`ckpt_tissuepickteleop_pull_4cam260918_pi05260921` es un checkpoint de política robótica (pipeline `robotics`) publicado por el usuario de HuggingFace `tarzanagh`. El modelo controla un robot bimanual DexMate Vega-1 equipado con dos manos RobotEra XHand1 en una tarea de destreza fina: sostener una caja de pañuelos con la mano izquierda y extraer un pañuelo con la derecha. Los datos de entrenamiento proceden de teleoperación con meta-glove (sin exoesqueleto) y seguimiento de muñeca mediante Vive.

El checkpoint se identifica internamente como «pi-0.5» y pesa 3.616.769.814 parámetros (~3,6 B) en formato safetensors, con un repositorio de 14,5 GB. Se entrenó durante 10.000 pasos con semilla 1000 sobre 120 episodios (108 de entrenamiento y 12 reservados, cada décimo), con 4 cámaras RGB a 640x360 y 30 fps, y un espacio de estado/acción de 38 dimensiones `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`.

Su relevancia es experimental más que de producto: forma parte de un barrido de 24 ejecuciones que compara cuatro familias de políticas (pi-0.5, GR00T 3B, ACT y Diffusion Policy), cada una con y sin entrada táctil, sobre las mismas tareas. El autor concluye que la señal táctil no aportó mejora más allá del ruido en ninguna familia y que GR00T obtuvo el error más bajo en todas las tareas. Toda la evaluación es en lazo abierto y ninguno de los resultados se ha validado en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; el identificador del checkpoint sugiere la familia pi-0.5) |
| Parametros totales | 3.616.769.814 (~3,6 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors; el tamaño del repo, 14,5 GB, es coherente con pesos en fp32) |
| Idiomas soportados | no disponible (modelo de robótica; la model card no declara capacidades de lenguaje) |
| Licencia | gemma (licencia de Gemma) |
| Formato de pesos | safetensors |
| Entradas sensoriales | 4 cámaras RGB, 640x360 a 30 fps |
| Dimension de estado/accion | 38-D `[L_arm 7 \| L_hand 12 \| R_arm 7 \| R_hand 12]` (posiciones articulares) |
| Datos de entrenamiento | 120 episodios (108 entrenamiento / 12 reservados), teleoperación con meta-glove |
| Pasos de entrenamiento | 10.000 (semilla 1000) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna ni el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF o DPO. Lo que sí se documenta es el régimen de inferencia: la política recibe una observación real cada 16 pasos y predice un *chunk* de acciones, del cual solo se conservan las 16 primeras acciones antes de volver a observar. Este esquema de *action chunking* es característico de las políticas de imitación modernas y es el mecanismo que se evalúa en la tabla de error en lazo abierto.

El entrenamiento es de imitación (los *tags* incluyen `imitation-learning`) sobre demostraciones teleoperadas. Los datos se capturaron con dos manos RobotEra XHand1 sobre un DexMate Vega-1, con teleoperación mediante meta-glove y seguimiento de muñeca Vive en lugar de exoesqueleto. El conjunto consta de 120 episodios de la tarea de extracción de pañuelo, con partición 108/12 (reservando cada décimo episodio para validación) y 10.000 pasos de optimización con semilla 1000. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos, etc.).

## Capacidades

- Generación de comandos motores de 38 dimensiones para control bimanual coordinado: 7 articulaciones por brazo y 12 grados de libertad por mano.
- Percepción visual a partir de 4 cámaras RGB simultáneas a 640x360 y 30 fps.
- Predicción de secuencias de acciones (*action chunking*) de 16 pasos por observación, con reobservación cada 16 pasos.
- Ejecución de una tarea bimanual asimétrica y de destreza fina: sujeción estable con la mano izquierda mientras la derecha realiza una extracción.
- Reproducción de trayectorias teleoperadas: el modelo imita las posiciones articulares registradas durante la teleoperación con meta-glove.
- No dispone de *tool calling* ni *function calling*, no soporta razonamiento multi-paso simbólico, no gestiona agentes y no ofrece capacidades multilingües, de visión general, audio o modo de pensamiento.

## Casos de uso

- Reproducción de experimentos en robótica bimanual: sirve como punto de partida para replicar el barrido de 24 ejecuciones sobre la tarea de extracción de pañuelo con un DexMate Vega-1 y manos XHand1.
- Línea base de comparación entre familias de políticas: al compartir tarea, datos y métrica con las variantes ACT, Diffusion Policy y GR00T 3B, permite aislar el efecto de la arquitectura sobre el error en lazo abierto.
- Control de ablación táctil: este checkpoint es la variante sin entrada táctil de la familia pi-0.5, y se compara directamente con `pi05tactile260921` para medir si la modalidad táctil aporta señal útil.
- Investigación en destreza fina: la tarea de extraer un pañuelo de una caja exige control de fuerza y coordinación mano-brazo, por lo que el modelo es útil como banco de pruebas para políticas de manipulación de objetos deformables.
- Evaluación de pipelines de teleoperación: el error en lazo abierto frente al *baseline* «hold-first-frame» cuantifica cuánto se aleja la política de las trayectorias registradas con meta-glove y Vive, lo que sirve para validar la calidad de la captura.
- Prototipado y docencia en *robot learning*: al ser un checkpoint pequeño (3,6 B) con un conjunto de datos reducido (120 episodios), es un ejemplo manejable de flujo completo de imitación, desde la captura hasta el despliegue.
- Personalización sobre hardware propio: partiendo de los pesos safetensors, un laboratorio con el mismo robot y manos puede reentrenar o ajustar la política con sus propios episodios teleoperados.

## Benchmarks y rendimiento

El autor publica únicamente error en lazo abierto sobre los 12 episodios reservados, definido como la media del valor absoluto de la diferencia entre acción predicha y acción registrada, en radianes (± SEM, n=12). No hay resultados de MMLU, HumanEval, GSM8K ni de tasa de éxito en tarea.

| Metrica (rad) | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo | 0,0224 ± 0,0015 | 0,0252 ± 0,0034 | 0,0531 ± 0,0022 | 0,0326 ± 0,0017 |
| Hold-first-frame (referencia) | 0,1975 | 0,0514 | 0,2628 | 0,1440 |

Observaciones aportadas por el autor: la política mejora claramente al *baseline* de mantener el primer fotograma en las cuatro salidas, la entrada táctil no produjo diferencias más allá del ruido en las cuatro familias y tres tareas evaluadas, y GR00T obtuvo el error más bajo en todas las tareas. La métrica mide seguimiento de trayectoria, no éxito de la tarea, y no se ejecutó nada en hardware.

## Requisitos de hardware

- VRAM estimada en fp32: unos 14,5 GB solo de pesos, más el coste de activaciones asociado a 4 flujos de imagen a 640x360; en la práctica, un presupuesto de 16 a 24 GB es razonable.
- VRAM estimada en fp16/bf16: aproximadamente 7,3 GB de pesos, lo que deja margen para el codificador visual y los *buffers* de observación en GPUs de 12-16 GB.
- GPUs recomendadas: A100, H100 o L40S para entrenamiento y evaluación por lotes; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX A6000 son suficientes para inferencia.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 de 24 GB con holgura, y probablemente en modelos de 16 GB si se usa precisión reducida.
- Opciones de despliegue: la model card no menciona ninguna (no se documentan vLLM, llama.cpp, Ollama, TGI ni runtimes específicos de robótica). Al tratarse de una política de control y no de un modelo de lenguaje, los servidores de inferencia habituales no son aplicables directamente.
- Latencia y throughput: no disponible. La única referencia temporal es que la política observa cada 16 pasos de acción y predice un *chunk*, sin que se publique la frecuencia de control efectiva.

## Comparativa con modelos similares

El propio autor compara cuatro familias sobre la misma tarea y datos. Los datos disponibles son desiguales: solo se documenta el tamaño de los checkpoints pi-0.5 (3,6 B) y GR00T 3B.

| Modelo | Parametros | Entrada tactil | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi-0.5 (este checkpoint) | ~3,6 B | No | Error mayor que GR00T en todas las tareas | gemma | Pública en HuggingFace (0 descargas, 0 likes) |
| pi-0.5 tactil | no disponible | Sí | Sin mejora significativa respecto a la version sin tactil | no disponible | Pública en HuggingFace |
| GR00T 3B | ~3 B | Version con y sin tactil | Menor error en todas las tareas evaluadas | no disponible | Pública en HuggingFace |
| ACT | no disponible | Version con y sin tactil | No se detalla por tarea | no disponible | Pública en HuggingFace |
| Diffusion Policy (dp) | no disponible | Version con y sin tactil | No se detalla por tarea | no disponible | Pública en HuggingFace |

No se dispone de comparaciones con modelos de propósito general ni con otras políticas fuera de este barrido.

## Limitaciones y advertencias

- La evaluación es exclusivamente en lazo abierto y off-line: no se ejecutó ninguna política en hardware real, por lo que no existe tasa de éxito de la tarea.
- La métrica reportada mide seguimiento de trayectoria respecto a las acciones registradas, no si el robot consigue extraer el pañuelo.
- El propio autor indica que la entrada táctil no aportó mejora más allá del ruido, y que GR00T superó a esta familia en todas las tareas evaluadas.
- El entrenamiento se realizó con solo 108 episodios y 10.000 pasos, lo que limita la generalización a variaciones de iluminación, posición del objeto o del robot.
- Los datos provienen de una configuración de captura concreta (meta-glove sin exoesqueleto y seguimiento Vive), lo que puede introducir sesgos sistemáticos en las trayectorias aprendidas.
- El checkpoint registra 0 descargas y 0 likes, por lo que no ha pasado por validación de la comunidad.
- La licencia es `gemma`, pero la model card no detalla las condiciones concretas de uso comercial; es necesario revisar los términos de la licencia de Gemma antes de cualquier despliegue productivo.
- No se documentan arquitectura, longitud de contexto, idiomas, cuantizaciones ni latencia, lo que dificulta planificar un despliegue en producción.
- Se trata de una política específica de tarea y de robot: no es reutilizable fuera del DexMate Vega-1 con manos XHand1 sin reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921
- Variante pi-0.5 con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921
