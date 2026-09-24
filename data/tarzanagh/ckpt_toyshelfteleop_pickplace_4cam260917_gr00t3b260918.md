# tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918

## Resumen

El modelo `tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918` es un checkpoint de robótica de 3.144.016.000 parámetros (~3,14 B) entrenado por el usuario tarzanagh sobre la arquitectura GR00T N1.7 (indicada por el tag `Gr00tN1d7`). Se trata de una política de vision-language-action (VLA) orientada a una tarea concreta de manipulación: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 debe coger un juguete de la segunda balda de una estantería y colocarlo en la primera, usando el brazo derecho mientras el izquierdo permanece prácticamente estático.

El modelo resuelve el problema de generar comandos motores de 38 dimensiones (posiciones articulares de ambos brazos y ambas manos) a partir de cuatro cámaras RGB a 640x360 y 30 fps, mediante aprendizaje por imitación sobre teleoperación con guante Meta y seguimiento de muñeca con Vive (sin exoesqueleto). Es relevante ahora porque forma parte de un conjunto de 24 ejecuciones comparativas (familias ACT, Diffusion Policy, pi0.5 y GR00T) sobre la misma tarea, y según la model card GR00T obtuvo el error más bajo en todas las tareas evaluadas.

El checkpoint se publica con licencia "other", formato de pesos safetensors y un repositorio de 12,6 GB, sin descargas ni likes registrados en el momento de la consulta. No se documentan idiomas soportados ni longitudes de contexto, al no tratarse de un modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia GR00T N1.7 (tag `Gr00tN1d7`); detalles internos no disponibles en la model card |
| Parametros totales | 3.144.016.000 (~3,14 B) |
| Parametros activos | no aplica (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 16 pasos; la política observa cada 16 pasos y predice un chunk) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades de lenguaje documentadas) |
| Licencia | other |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Tamaño del repositorio | 12,6 GB |
| Estado / acción | 38-D `[L_arm 7 \| L_hand 12 \| R_arm 7 \| R_hand 12]` posiciones articulares |
| Entradas sensoriales | 4 cámaras RGB, 640x360 a 30 fps |

## Arquitectura y entrenamiento

La model card identifica el modelo como GR00T-N1.7-3B, es decir, la variante de ~3 B de la familia GR00T N1.7 aplicada a un caso concreto. No se detallan en la información disponible la composición exacta del transformer, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO; al tratarse de una política de imitación robótica, el entrenamiento se realiza sobre demostraciones de teleoperación, no sobre texto.

Los datos de entrenamiento consisten en 155 episodios de teleoperación (139 para entrenamiento y 16 reservados para validación, seleccionando cada décimo). Cada episodio incluye cuatro cámaras RGB a 640x360 y 30 fps. El entrenamiento se ejecutó durante 10.000 pasos con semilla 1000. La política observa la observación real cada 16 pasos, predice un chunk de acciones y conserva las 16 primeras acciones, lo que constituye un esquema de action chunking con horizonte 16. En la comparativa interna del autor, la inclusión de entrada táctil no produjo diferencias más allá del ruido estadístico en cuatro familias de políticas y tres tareas.

## Capacidades

- Generación de comandos motores de 38 dimensiones para ambos brazos (7+7) y ambas manos diestras (12+12) de un robot DexMate Vega-1 con manos XHand1.
- Manipulación bimanual con manos diestras, aunque en esta tarea concreta el brazo izquierdo permanece casi estático y el derecho ejecuta el pick-and-place.
- Percepción multi-cámara: procesa simultáneamente 4 cámaras RGB a 640x360 y 30 fps.
- Aprendizaje por imitación a partir de teleoperación con guante Meta y seguimiento de muñeca con Vive.
- Ejecución de tareas de recogida y colocación (pick-and-place) con action chunking de 16 pasos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso en sentido lingüístico.
- No se documentan capacidades multilingües ni modo de razonamiento, visión general o audio.
- No se documenta soporte táctil efectivo: según el autor, la entrada táctil no aportó mejora medible.

## Casos de uso

- Pick-and-place en estanterías: el modelo está entrenado específicamente para coger un objeto de la segunda balda y depositarlo en la primera; puede desplegarse directamente en un DexMate Vega-1 con manos XHand1 para replicar esa tarea.
- Manipulación bimanual con manos diestras: sirve como referencia para tareas que requieran coordinación de dos manos XHand1, aunque en este checkpoint el brazo izquierdo es casi estático y habría que afinar para uso simétrico.
- Investigación en aprendizaje por imitación: permite reproducir el pipeline de teleoperación Meta-glove + Vive y comparar el error open-loop con otras políticas.
- Fine-tuning sobre tareas similares: al ser un checkpoint de 3,14 B y 12,6 GB, puede servir como inicialización para tareas de manipulación en el mismo robot o en robots con el mismo espacio de estados de 38-D.
- Evaluación comparativa de familias de políticas: el repositorio incluye 24 ejecuciones con ACT, Diffusion Policy, pi0.5 y GR00T sobre la misma tarea, por lo que es útil como punto de referencia para benchmarking interno de políticas VLA frente a políticas específicas.
- Generación y validación de trayectorias offline: con las 16 acciones por chunk se pueden generar trayectorias de referencia para análisis cinemático, detección de colisiones o simulación antes de desplegar en hardware.
- Recolección de datos asistida: el modelo puede usarse como política auxiliar durante sesiones de teleoperación para autocompletar tramos de trayectoria y reducir la carga del operador.

## Benchmarks y rendimiento

La model card publica el error open-loop en el conjunto reservado (media de |predicción − acción registrada|, en radianes, ± SEM, n=16):

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo | 0,0034 ± 0,0003 | 0,0078 ± 0,0007 | 0,0334 ± 0,0013 | 0,0216 ± 0,0010 |
| Hold-first-frame (baseline) | 0,0219 | 0,0172 | 0,3166 | 0,2380 |

El autor indica que este error mide seguimiento de trayectoria y no éxito de la tarea, y que ninguna prueba se ejecutó sobre hardware físico. Además, señala que en cuatro familias de políticas y tres tareas la entrada táctil no supuso diferencia más allá del ruido y que GR00T obtuvo el error más bajo en todas las tareas. No hay resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación teórica a partir del recuento de parámetros, no confirmada por el autor): ~12,6 GB en FP32 (coincide con el tamaño del repo), ~6,3 GB en FP16/BF16, ~3,2 GB en INT8 y ~1,6 GB en INT4 si se aplicara cuantización. El autor no publica cuantizaciones oficiales.
- A la VRAM de los pesos hay que sumar la memoria de las cuatro cámaras RGB a 640x360 y del codificador visual, cuyo coste no está documentado.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabe con holgura en GPUs de centro de datos (A100, H100) y previsiblemente en GPUs de consumo de gama alta (RTX 4090 de 24 GB) en FP16 o cuantizado.
- Cabe en GPU de consumo: probable en RTX 4090/3090 y superiores en FP16; en FP32 el límite de 12,6 GB lo deja al borde en tarjetas de 16 GB.
- Opciones de despliegue: no documentadas explícitamente. Por la familia del modelo y los tags, lo esperable es el ecosistema NVIDIA Isaac GR00T / LeRobot; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. La captura de cámaras es a 30 fps y la política se ejecuta cada 16 pasos, pero no se publica latencia medida.

## Comparativa con modelos similares

La model card referencia 24 ejecuciones de la misma tarea con cuatro familias de políticas. Comparativa con las alternativas citadas:

| Modelo | Parametros | Tarea | Error open-loop | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-N1.7-3B (este checkpoint) | 3,14 B | Pick-and-place, XHand1 / DexMate Vega | El más bajo en todas las tareas (valores en la tabla anterior) | other | Público en HuggingFace, 0 descargas |
| ACT (`..._act260919`) | no disponible | Misma tarea, misma configuración | No publicado en esta ficha | no disponible | Público en HuggingFace |
| Diffusion Policy (`..._dp260919`) | no disponible | Misma tarea, misma configuración | No publicado en esta ficha | no disponible | Público en HuggingFace |
| pi0.5 (`..._pi05260918`) | no disponible | Misma tarea, misma configuración | No publicado en esta ficha | no disponible | Público en HuggingFace |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados en la información proporcionada; solo se sabe que GR00T obtuvo el error más bajo en cada tarea según el autor.

## Limitaciones y advertencias

- El modelo no se ha probado sobre hardware físico: todas las métricas son de error open-loop en el conjunto reservado, no de éxito de tarea.
- La tarea es estrecha y específica (coger de la segunda balda y colocar en la primera); no se documenta generalización a otros objetos, posiciones o entornos.
- La política usa predominantemente el brazo derecho; el izquierdo es casi estático, lo que limita su uso en tareas bimanuales reales sin reentrenamiento.
- Entrenamiento sobre solo 155 episodios (139 de entrenamiento), un volumen reducido que puede provocar sobreajuste al entorno y a la posición de las cámaras.
- La entrada táctil no aportó mejora medible frente a variantes sin táctil, según el propio autor.
- La licencia es "other": no se especifican términos de uso comercial, por lo que hay que revisar el texto completo antes de cualquier despliegue en producto.
- No se documentan idiomas soportados, sesgos, riesgo de alucinación ni límites de contexto, porque no es un modelo generativo de lenguaje.
- Repositorio con 0 descargas y 0 likes: no hay validación externa ni reportes de terceros sobre su comportamiento.
- Las estimaciones de VRAM son teóricas y no incluyen el coste del codificador visual ni de las cuatro cámaras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918
- Ejecución ACT: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919
- Ejecución ACT con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919
- Ejecución Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919
- Ejecución Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919
- Ejecución GR00T con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918
- Ejecución pi0.5: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918
- Ejecución pi0.5 con táctil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
