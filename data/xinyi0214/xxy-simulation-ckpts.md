# Xinyi0214/xxy-simulation-ckpts

# Xxy-simulation-ckpts

## Resumen

Este repositorio de HuggingFace no contiene un modelo único, sino una colección de checkpoints entrenados por el usuario Xinyi0214 dentro del proyecto `xxy_simulation`, orientado a transferencia sim-to-real sobre un brazo robótico UR5. Incluye finetunes de GR00T en cuatro variantes (`gran_K1`, `gran_K20`, `gran_Kepisode` y `gran_nominal`), un barrido de granularidad de políticas de difusión con distintas semillas, la política `pick_block_v1` (con su checkpoint de despliegue) y un baseline `cube_bowl` cuya ruta indica un backbone UNet. El repositorio ocupa 117,1 GB y se creó el 22 de septiembre de 2026.

Su interés es fundamentalmente práctico para laboratorios de robótica: la estructura de rutas replica la del proyecto original, de modo que una sola descarga con `hf download ... --local-dir` restaura todos los ficheros en su ubicación. Esto facilita reproducir experimentos, comparar variantes de granularidad de acción (K=1, K=20, por episodio, nominal) y reutilizar los pesos como punto de partida para nuevas tareas de manipulación.

La información publicada, en cambio, es mínima: no hay model card técnica, no se declara licencia ni idiomas, el pipeline es `robotics` y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha. Tampoco se publican hiperparámetros, número de parámetros, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (las rutas del repositorio indican políticas de difusión y finetunes de GR00T; el autor no documenta la arquitectura) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; sería la ventana de observación de la política) |
| Tipos de cuantización | no disponible (solo se publican pesos sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no especificada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | safetensors (fragmentado en shards para los finetunes de GR00T) y checkpoints `.ckpt` de PyTorch Lightning para el resto |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 117,1 GB |
| Etiquetas | safetensors, robotics, diffusion-policy, gr00t, region:us |

## Arquitectura y entrenamiento

El repositorio agrupa varios artefactos de entrenamiento distintos. Por un lado, `train_runs/gr00t/gran_{K1,K20,Kepisode,nominal}/` contiene finetunes de GR00T, cada uno distribuido en tres shards de safetensors. Por otro, `train_runs/gran/<variant>_s<seed>/checkpoints/latest.ckpt` corresponde a un barrido de granularidad de políticas de difusión repetido con varias semillas, lo que sugiere un estudio de ablación sobre el horizonte o la agrupación de acciones. Se añaden la política `pick_block_v1` (con su checkpoint de despliegue `deploy_ckpt_pick_block_v1.ckpt`) y un baseline `cube_bowl` almacenado en `ur5_lab_code/data/outputs/.../baseline_dp_unet_cube_bowl_v1/checkpoints/latest.ckpt`, cuya nomenclatura apunta a una política de difusión con backbone UNet sobre las tareas de recogida de cubo y trasvase a cuenco.

No se documentan ni el número de tokens o trayectorias de entrenamiento, ni la composición del dataset, ni si hubo etapas de ajuste por refuerzo o preferencias. Tampoco se detallan innovaciones técnicas (decodificación especulativa, atención lineal u otras), porque no se trata de un modelo generativo de texto. La única información estructural fiable es la organización de directorios, pensada para replicar el árbol del proyecto `xxy_simulation` y permitir la restauración exacta de rutas tras la descarga.

## Capacidades

- Generación de acciones robóticas para manipulación: los checkpoints son políticas que producen comandos motores o secuencias de acciones, no texto.
- Ejecución de tareas de pick-and-place sobre un UR5, según la política `pick_block_v1` y su checkpoint de despliegue.
- Ejecución de la tarea `cube_bowl` mediante el baseline de política de difusión con backbone UNet.
- Finetuning de una base tipo GR00T para tareas concretas del proyecto, con cuatro variantes de granularidad (`K1`, `K20`, `Kepisode`, `nominal`).
- Evaluación comparativa de granularidad de acción y de semilla de entrenamiento, gracias al barrido `gran/<variant>_s<seed>`.
- Transferencia sim-to-real, ya que el proyecto se declara explícitamente como `UR5 sim-to-real`.
- Soporte de tool calling / function calling: no disponible (no aplica a una política robótica).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponible. Los tags no aclaran si la política consume observaciones visuales, propioceptivas o ambas.

## Casos de uso

- Manipulación pick-and-place con UR5: cargar `deploy_ckpt_pick_block_v1.ckpt` para reproducir la tarea de recogida de bloque en el banco de laboratorio y usarlo como referencia frente a nuevas variantes.
- Estudio de granularidad de acción: comparar `gran_K1`, `gran_K20`, `gran_Kepisode` y `gran_nominal` para determinar qué horizonte de predicción ofrece mejor tasa de éxito y estabilidad en el controlador del UR5.
- Análisis de varianza entre semillas: usar el barrido `gran/<variant>_s<seed>` para cuantificar cuánto depende el rendimiento de la inicialización aleatoria antes de fijar una política de producción.
- Baseline de referencia en tareas de trasvase: emplear el checkpoint `baseline_dp_unet_cube_bowl_v1` como suelo de comparación en experimentos de cube-to-bowl dentro del simulador.
- Punto de partida para finetuning propio: partir de los finetunes de GR00T y adaptarlos a una tarea nueva de manipulación con un conjunto reducido de demostraciones.
- Reproducción de experimentos: la estructura de rutas espejo permite restaurar el árbol completo del proyecto con una sola descarga y volver a lanzar los entrenamientos con los mismos ficheros.
- Docencia y formación en robótica: usar los pares `latest.ckpt` como material para ilustrar el ciclo completo de simulación, entrenamiento de política de difusión y despliegue en hardware.
- Validación de pipeline sim-to-real: contrastar el comportamiento del mismo checkpoint en simulador y en el UR5 físico para medir la brecha de realidad del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio se limita a describir la estructura de ficheros y no incluye tasas de éxito, métricas de error de trayectoria, curvas de aprendizaje ni comparaciones cuantitativas entre las variantes de granularidad o entre semillas.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 117,1 GB, por lo que la descarga íntegra requiere ese espacio libre en disco. La descarga selectiva de un único checkpoint reduce el requisito de forma proporcional, pero no se publica el tamaño individual de cada fichero.
- VRAM para inferencia: no disponible. El autor no indica el número de parámetros de ningún checkpoint ni el tamaño de las observaciones de entrada, de modo que cualquier cifra sería especulativa.
- GPU recomendadas: no disponible por la misma razón.
- Compatibilidad con GPU de consumo: no confirmado. La ruta `baseline_dp_unet_cube_bowl_v1` sugiere una política de difusión con backbone UNet, una familia que en la literatura suele desplegarse en GPUs de gama media, pero el autor no publica ninguna medición al respecto.
- Opciones de despliegue: los ficheros `.ckpt` son checkpoints de PyTorch Lightning y los finetunes de GR00T se distribuyen en safetensors fragmentados. El stack esperado es PyTorch; para los finetunes de GR00T lo habitual sería la pila de Isaac-GR00T, extremo no confirmado por el autor. No hay evidencia de soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput: no disponible. En robótica de manipulación la frecuencia de control es un parámetro crítico, pero el repositorio no publica valores de Hz ni tiempos de inferencia.

## Comparativa con modelos similares

No hay datos publicados de este repositorio que permitan una comparación cuantitativa. La tabla siguiente recoge alternativas de la misma categoría (políticas de manipulación y modelos fundacionales para robótica) únicamente a efectos de contextualización; las celdas sin información verificada se marcan como no disponibles.

| Modelo | Tipo | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| xxy-simulation-ckpts (Xinyi0214) | Colección de checkpoints de políticas para UR5 (difusión y finetunes de GR00T) | no disponible | no disponible | HuggingFace, 117,1 GB, 0 descargas |
| NVIDIA Isaac GR00T (familia) | Modelo fundacional para robótica humanoide | no verificado en esta ficha | no verificado en esta ficha | Repositorio público de NVIDIA |
| Diffusion Policy (Chi et al.) | Política de difusión para manipulación visomotora | no verificado en esta ficha | no verificado en esta ficha | Implementación de referencia pública |
| pi0 / pi0.5 (Physical Intelligence) | Modelo visomotora-lenguaje para control robótico | no verificado en esta ficha | no verificado en esta ficha | Pesos publicados por el autor |

Las variantes `gran_K1`, `gran_K20` y `gran_Kepisode` de este repositorio no tienen equivalente directo publicado, ya que responden a un barrido interno de granularidad de acción del proyecto `xxy_simulation`.

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica ninguna licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial está permitido. En la práctica, esto equivale a tratarlo como material sin derechos de uso claros.
- Sin documentación técnica: no hay información sobre datos de entrenamiento, hiperparámetros, preprocesado, normalización de acciones ni versiones de librerías. Reproducir los resultados exigiría ingeniería inversa sobre los checkpoints.
- Sin benchmarks: se desconoce la tasa de éxito real de cualquiera de las políticas, tanto en simulación como en el UR5 físico.
- Especialización estrecha: los checkpoints están entrenados para tareas concretas (`pick_block_v1`, `cube_bowl`) y un robot concreto (UR5). Su transferencia a otro manipulador o a otras tareas no está demostrada.
- Brecha sim-to-real: el proyecto se declara sim-to-real, pero no se publica ninguna medición de la degradación de rendimiento al pasar al hardware físico.
- Riesgo de sobreajuste al entorno de simulación: al desconocerse la composición del dataset, no puede descartarse un ajuste excesivo a las condiciones del simulador (iluminación, fricción, ruido de sensores).
- Posible acoplamiento a versiones concretas: los ficheros `latest.ckpt` y los shards de safetensors pueden depender de versiones específicas de PyTorch Lightning o del stack de GR00T, lo que complica la carga en entornos con versiones distintas.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar problemas conocidos.
- Validación pendiente de fechas y contenido: las marcas temporales del repositorio (septiembre de 2026) deben verificarse, y el contenido real de los 117,1 GB solo puede confirmarse descargando los ficheros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Xinyi0214/xxy-simulation-ckpts
- Los resultados de la búsqueda web no aportan ningún enlace relevante al modelo: devuelven exclusivamente hilos de foro de consumo en francés sobre comercio electrónico (ONATERA, AGRIEURO, vendezvotrevoiture.fr), sin relación con robótica, políticas de difusión ni GR00T.
- No se han encontrado en la información proporcionada enlaces a papers, blogs técnicos, repositorios de código ni demos asociados a `xxy_simulation`.
