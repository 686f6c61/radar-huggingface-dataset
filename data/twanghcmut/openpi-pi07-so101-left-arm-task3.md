# twanghcmut/openpi-pi07-so101-left-arm-task3

## Resumen

El modelo `twanghcmut/openpi-pi07-so101-left-arm-task3` es una política robótica de tipo visión-lenguaje-acción (VLA) derivada de `physical-intelligence/pi05_base` y ajustada por el autor `twanghcmut` sobre el conjunto de datos `hungho77/so101-left-arm-task3`. Se trata de la variante P2b de un ablation de características que reproduce la receta π0.7 sobre la arquitectura π0.5, incorporando *real-time chunking* (RTC) en tiempo de entrenamiento. El modelo resuelve el problema de generar secuencias de acciones de 16 pasos para un brazo robótico SO101 (5 articulaciones más pinza) a partir de dos cámaras (`top` y `wrist`) y del estado de las articulaciones.

La relevancia de esta ficha es doble: por un lado, documenta un experimento reproducible de ablation sobre openpi con código parcheado contra un fork concreto; por otro, introduce una técnica de RTC que permite al modelo continuar un chunk de acciones ya en ejecución, lo que en teoría habilita ejecución asíncrona suave en el robot. El checkpoint tiene 3.616.757.520 parámetros, ocupa 7,5 GB en el repositorio (pesos en safetensors y bfloat16) y se distribuye bajo licencia Apache-2.0. No se han publicado resultados en robot real ni en bucle cerrado para este checkpoint concreto.

El modelo se entrenó durante 6.000 pasos con batch 128 en una única H100 de 80 GB durante aproximadamente 14 horas. La pérdida final fue de 0.0019. En evaluación open-loop sobre 18 episodios retenidos, el modelo sin prefijo iguala al baseline π0.5 (MAE 2.389 frente a 2.354), mientras que con su propio chunk previo como prefijo de 3 acciones suaviza las fronteras entre chunks pero incrementa el error open-loop hasta 3.393, un efecto atribuible a la naturaleza de la reproducción del dataset y no necesariamente a un fallo del modelo en el robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi, PyTorch), con flow matching y action horizon 16; RTC en entrenamiento |
| Parámetros totales | 3.616.757.520 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de horizonte de acción 16; sin contexto textual explícito) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo robótico; instrucciones en inglés en las tareas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), más `metadata.pt` y `norm_stats.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es π0.5 en su implementación openpi sobre PyTorch, con `Pi0Config(pi05=True, action_horizon=16)`. El modelo parte de `pi05_base` convertido a PyTorch en bfloat16 y se ajusta con flow matching sobre el dataset SO101. La entrada combina dos cámaras (`top` y `wrist`), un estado de 6 dimensiones (5 articulaciones más pinza) y una cadena de tarea en lenguaje natural; la salida es un chunk de 16 acciones a 30 fps. Sobre esta base se añade la receta π0.7 de *real-time chunking* en tiempo de entrenamiento: en cada muestra se selecciona una longitud de prefijo uniforme en 0..6, que se reemplaza por 0 con probabilidad 0,5 (aproximadamente el 57 % de las muestras no tienen prefijo). El prefijo comprometido se contamina con ruido gaussiano de desviación 0,15 en unidades normalizadas, se mantiene limpio en el tiempo de flujo 0 y se excluye de la pérdida.

El ajuste fino se realizó sobre 141 de los 159 episodios del dataset, reservando 18 para evaluación (6 por tarea: episodios 5, 13, 21, 33, 41, 47, 56, 66, 75, 88, 97, 104, 113, 121, 129, 140, 148 y 155). Se entrenaron 6.000 pasos con batch efectivo de 128 (32 × 4 de acumulación de gradiente), learning rate pico de 2,5e-5 con schedule coseno y 1.000 pasos de warmup. La pérdida evolucionó de 0.038 en el paso 0 a 0.0019 en el paso 6.000. El código es el parche `pi07_task3_ablation.patch` aplicado sobre `hungho77/openpi` en el commit `52ad18c`, e introduce las opciones `rtc_zero_delay_prob` y `rtc_prefix_noise` en `Pi0Config` (tanto para PyTorch como para JAX), `DataConfig.exclude_episodes`, las configuraciones `pi05_so101_task3_p1/p2/p2b/p3/p4` (este checkpoint es `pi05_so101_task3_p2b`) y los argumentos `--prefix` y `--prefix-source` en `scripts/eval_open_loop.py`.

Las tres tareas entrenadas son: (0) sacar el cubo rojo de la olla de acero y colocarlo en el cubo hueco naranja (51 episodios); (1) abrir el cajón superior con la pinza izquierda, coger el bloque cuadrado rojo, colocarlo dentro del cajón y cerrarlo (57 episodios); (2) abrir el cajón, coger el cubo rojo y apilarlo sobre el cubo azul (51 episodios). La cadena de tarea debe pasarse literalmente tal como aparece en la model card.

## Capacidades

- Generación de secuencias de acciones de 16 pasos para un brazo SO101 de 6 grados de libertad (5 articulaciones más pinza) a partir de observaciones visuales y de estado.
- Percepción visual con dos cámaras (`top` y `wrist`) para localizar objetos, cajones y contenedores.
- Seguimiento de instrucciones en lenguaje natural para tres tareas concretas de manipulación (extracción y colocación de cubos, apertura y cierre de cajones, apilamiento).
- *Real-time chunking*: puede aceptar como prefijo las primeras `d` acciones (d ≤ 6) de un chunk que ya se está ejecutando, lo que permite continuar una trayectoria en curso en lugar de reiniciarla.
- Ejecución a 30 fps con horizonte de acción de 16, adecuada para control de brazos robóticos de sobremesa.
- No soporta *tool calling*, agentes multi-paso, ni capacidades de audio o visión general fuera del dominio robótico.
- Capacidades multilingües: no disponible; las instrucciones de tarea están en inglés.

## Casos de uso

- **Manipulación pick-and-place en laboratorio**: el modelo puede ejecutar la tarea 0 (extraer el cubo rojo de la olla y colocarlo en el cubo naranja) en un brazo SO101 real, usando las cámaras `top` y `wrist` y el estado de las articulaciones como entrada. Es adecuado porque fue entrenado específicamente sobre 51 episodios de esa tarea.
- **Automatización de apertura y cierre de cajones**: la tarea 1 (abrir el cajón superior, coger el bloque rojo, colocarlo dentro y cerrar) se puede desplegar como política de manipulación de precisión en entornos de escritorio con cajones de dimensiones controladas.
- **Apilamiento de objetos**: la tarea 2 (abrir el cajón, coger el cubo rojo y apilarlo sobre el azul) sirve como *benchmark* interno de precisión de agarre y colocación, útil para validar la política antes de integrarla en tareas más complejas.
- **Investigación en ejecución asíncrona con RTC**: el checkpoint es la variante P2b del ablation y puede usarse para medir en robot real si el RTC reduce los saltos en las fronteras entre chunks (el salto medido en open-loop baja de 3,21 a 0,32 con prefijo de 3 acciones), una métrica que la model card reconoce que solo se puede medir en el robot.
- **Reproducción de experimentos de ablation**: con el parche `pi07_task3_ablation.patch` y las configuraciones `p1/p2/p2b/p3/p4`, el checkpoint sirve como referencia para comparar variantes de RTC, insulación de conocimiento y ruido de prefijo sobre el mismo dataset.
- **Evaluación open-loop de políticas VLA**: los scripts `scripts/eval_open_loop.py` y `examples/so101/open_loop_metrics.py` permiten calcular MAE, MSE y errores de *grasp*/*place* sobre los 18 episodios retenidos, útiles para comparar contra π0.5, GR00T N1.6 y GR00T N1.7.
- **Generación de datos sintéticos de trayectorias**: el modelo puede generar chunks de acciones plausibles para las tres tareas, que luego se filtran y se usan como datos adicionales de entrenamiento o para *data augmentation* en políticas downstream.

## Benchmarks y rendimiento

Evaluación open-loop: la política se invoca cada 16 pasos desde los frames del dataset y `observation.state`, y se comparan las 16 primeras acciones predichas con las grabadas. MAE en unidades de acción del dataset; % = MAE / 29,97.

**Seis trayectorias estándar** (0, 25, 51, 80, 108, 133; 400 pasos; dentro del conjunto de entrenamiento):

| Modelo | MAE | Tray. 0 / 25 (tarea 0) |
|---|---|---|
| **Este (P2b)** | **1.366** (4,56 %) | 1.191 / 1.504 |
| π0.5 baseline, mismo split (P1) | 1.423 | 1.274 / 1.687 |
| π0.5 (159 episodios) | 1.459 | 1.286 / 1.690 |
| GR00T N1.6 | 1.345 | 1.242 / 1.476 |
| GR00T N1.7 | 1.440 | 1.406 / 1.542 |

**18 episodios retenidos** (episodios completos, no vistos en entrenamiento):

| Modelo | MAE | MSE | Paso 1 | Paso 16 | Grasp | Place | Tarea 0 place |
|---|---|---|---|---|---|---|---|
| **Este (P2b), sin prefijo** | 2.389 | 16.99 | 1.13 | 3.53 | 2.07 | 2.33 | **0.82** |
| π0.5 baseline (P1) | 2.354 | 16.42 | 1.12 | 3.54 | 1.90 | 2.31 | 0.83 |
| Este, chunk previo propio como prefijo de 3 acciones | 3.393 | 32.08 | 3.97 | 3.90 | 2.64 | 3.01 | 1.22 |

Las métricas `grasp` y `place` son el MAE de las articulaciones del brazo sobre los 45 frames previos al cierre y a la apertura de la pinza, respectivamente. La model card advierte que mantener la acción actual durante 16 pasos obtiene MAE 2.07 en el conjunto retenido, por lo que el MAE de episodio completo por sí solo no ordena estos modelos; deben usarse MSE y los errores de *grasp*/*place*. No se han publicado resultados de benchmarks en robot real ni en bucle cerrado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bfloat16 (3.616.757.520 parámetros), el modelo requiere aproximadamente 7,2 GB solo para pesos; con activaciones y buffers de inferencia, se recomienda al menos 16 GB de VRAM. No se han publicado mediciones de VRAM pico para este checkpoint.
- **GPU recomendadas**: el entrenamiento se realizó en 1 × H100 80 GB durante unas 14 horas (8,5 s/paso). Para inferencia se puede usar una A100 40/80 GB, una H100 o una RTX 4090 de 24 GB; esta última es la opción consumer más razonable dado el tamaño de los pesos.
- **Cabe en GPU consumer**: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) siempre que se use bfloat16 o float16 y se limite el batch a 1.
- **Opciones de despliegue**: la librería es `openpi` (PyTorch). No se han publicado pesos GGUF ni soporte para llama.cpp u Ollama, que no son adecuados para una política VLA de robótica. El despliegue debe hacerse con el código openpi y los transforms de SO101 brazo izquierdo, cargando `model.safetensors`, `metadata.pt` y `assets/hungho77/so101-left-arm-task3/norm_stats.json`.
- **Latencia y throughput**: no disponible. La model card no publica latencias de inferencia ni throughput; solo se conoce el tiempo de entrenamiento (8,5 s/paso con batch 128 en H100).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | MAE (18 retenidos) | MSE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este (P2b)** | 3.616.757.520 | Horizonte de acción 16; prefijo RTC ≤ 6 | 2.389 | 16.99 | Apache-2.0 | Hugging Face (`twanghcmut/openpi-pi07-so101-left-arm-task3`) |
| π0.5 baseline (P1) | no disponible (misma base π0.5) | Horizonte de acción 16 | 2.354 | 16.42 | Apache-2.0 (según openpi) | Hugging Face (`twanghcmut/pi05-so101-left-arm-task3`) |
| GR00T N1.6 | no disponible | no disponible | no disponible en 18 retenidos; MAE 1.345 en 6 trayectorias estándar | no disponible | no disponible | Hugging Face (`twanghcmut/gr00t-n1d6-so101-left-arm-task3`) |
| GR00T N1.7 | no disponible | no disponible | no disponible en 18 retenidos; MAE 1.440 en 6 trayectorias estándar | no disponible | no disponible | Hugging Face (`twanghcmut/gr00t-n1d7-so101-left-arm-task3`) |

La comparación directa en los 18 episodios retenidos solo está publicada para este checkpoint y para el baseline π0.5 (P1). Los GR00T N1.6 y N1.7 solo tienen cifras en las 6 trayectorias estándar, por lo que no son directamente comparables en el conjunto retenido.

## Limitaciones y advertencias

- **Solo evaluación open-loop**: no existe resultado en robot real ni en bucle cerrado para este checkpoint. El beneficio del RTC (ejecución asíncrona suave) solo se puede medir en el robot, según reconoce la model card.
- **Dominio muy restringido**: el modelo solo ha sido entrenado para tres tareas concretas sobre un brazo SO101 izquierdo con dos cámaras fijas (`top` y `wrist`). No generaliza a otras tareas, brazos, configuraciones de cámara ni objetos fuera del dataset.
- **Instrucciones literales**: la cadena de tarea debe pasarse exactamente como aparece en la model card; variaciones en la formulación pueden degradar el comportamiento.
- **Riesgo de alucinación en acciones**: como toda política VLA, puede generar trayectorias plausibles pero incorrectas, especialmente fuera de la distribución de entrenamiento (iluminación, posiciones iniciales, oclusiones).
- **Sesgos del dataset**: el modelo hereda los sesgos de `hungho77/so101-left-arm-task3` (posiciones de objetos, condiciones de iluminación, estilo de demostración). No se han publicado análisis de sesgo.
- **RTC con prefijo propio empeora el error open-loop**: usar el chunk previo como prefijo de 3 acciones sube el MAE a 3.393 y el MSE a 32.08 en los 18 episodios retenidos, porque en la reproducción del dataset el estado no sigue las acciones del propio modelo. Variantes anteriores con ruido de prefijo 0,03 o con insulación de conocimiento derivaron mucho más (7,32 en el paso 2.000 y 17,8, respectivamente).
- **Métrica de MAE engañosa**: mantener la acción actual durante 16 pasos obtiene MAE 2.07 en el conjunto retenido, por lo que el MAE de episodio completo no ordena los modelos; deben usarse MSE y los errores de *grasp*/*place*.
- **Licencia**: Apache-2.0, pero se aplican también los términos de openpi y de `pi05_base` sobre los pesos base; conviene revisarlos antes de uso comercial.
- **Repositorio sin descargas ni likes**: 0 descargas y 0 likes en el momento de la consulta, lo que indica que el checkpoint no ha sido validado por la comunidad.
- **Sin datos de latencia ni throughput**: no se han publicado mediciones de inferencia, lo que dificulta planificar un despliegue en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/openpi-pi07-so101-left-arm-task3
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- Fork de openpi usado: https://github.com/hungho77/openpi (commit `52ad18c`)
- Checkpoint π0.5 sobre el mismo brazo: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Checkpoint GR00T N1.6 sobre el mismo brazo: https://huggingface.co/twanghcmut/gr00t-n1d6-so101-left-arm-task3
- Checkpoint GR00T N1.7 sobre el mismo brazo: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-task3
