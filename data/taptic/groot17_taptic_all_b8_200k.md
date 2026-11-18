# TAPTIC/groot17_taptic_all_b8_200k

## Resumen

GR00T N1.7 TAPTIC multitask es un checkpoint de robótica de tipo vision-language-action (VLA) desarrollado por TAPTIC, derivado del modelo base nvidia/GR00T-N1.7-3B de NVIDIA. Está entrenado para controlar un brazo Panda de 7 grados de libertad equipado con una mano robótica XHand de 12 articulaciones, con datos multimodales que incluyen cámaras de muñeca y lateral, estado propioceptivo de 40 dimensiones (incluyendo fuerzas en los dedos) y acciones de 18 dimensiones (pose del efector final más articulaciones de la mano). El modelo tiene 3.144 millones de parámetros y se distribuye en formato safetensors con la librería LeRobot.

El modelo resuelve el problema de la manipulación robótica multitarea: un único policy entrenado sobre 13 tareas distintas (912 episodios, 336.658 frames a 10 fps) que van desde coger objetos y colocarlos en cestas hasta desatornillar tapones, limpiar superficies o insertar una tarjeta de crédito. La relevancia actual radica en que es un ejemplo de adaptación de un modelo fundacional de robótica a un embodiment concreto con una mano diestra, un área donde escasean los checkpoints públicos.

Es importante señalar que se trata de un checkpoint intermedio (paso 100.000 de 200.000 planificados), por lo que el entrenamiento sigue en curso y los resultados deben interpretarse como provisionales. El modelo card reporta validación en lazo abierto sobre episodios reservados, con errores medios de posición de 43,51 mm, rotación geodésica de 8,49 grados y articulaciones de la mano de 6,31 grados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (vision-language-action, transformer multimodal) |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Tamaño del repositorio | 12,6 GB |
| Embodiment | Panda (7 articulaciones) + XHand (12 articulaciones) |
| Estado de entrada | 40 dimensiones (7 joints Panda en grados, 12 joints XHand, 15 fuerzas en dedos, pose efector final xyz+rotvec) |
| Acción de salida | 18 dimensiones (pose efector final + 12 joints XHand) |
| Frecuencia de datos | 10 fps |
| Cámaras | muñeca + lateral, 480x640 |

## Arquitectura y entrenamiento

El modelo se basa en nvidia/GR00T-N1.7-3B, un modelo fundacional de robótica de tipo vision-language-action que combina un codificador visual, un backbone de lenguaje y un cabezal de acciones para generar trayectorias de control a partir de observaciones multimodales. La adaptación se realizó con el fork de LeRobot de mfincato mediante el script `train_ben.py`, configurando el embodiment como `new_embodiment` para acomodar la morfología Panda + XHand.

El entrenamiento utilizó 13 tareas con 912 episodios y 336.658 frames a 10 fps, con un batch de 8, 200.000 pasos planificados (este checkpoint corresponde al paso 100.000), LR coseno con 10.000 pasos de warmup, transformaciones de imagen activadas, semilla 42 y precisión bf16. Se aplicó una corrección de los datasets `graspglass*` que almacenaban la rotación absoluta de la brida, convirtiéndola al marco común `gripper_down` mediante `w' = rotvec(Rx(pi)^T R)`, verificado contra la cinemática directa del Panda. Se excluyeron episodios de menos de 20 frames y se activó el arreglo de colas (`GROOT_KEEP_TAILS=1`) para conservar los últimos frames de cada episodio con padding del chunk de acciones. El 5% de los episodios por tarea se reservó para validación con semilla 42.

## Capacidades

- Generación de acciones de manipulación robótica de 18 dimensiones (pose del efector final más 12 articulaciones de la mano XHand) a partir de observaciones visuales y propioceptivas.
- Control multimodal que integra dos cámaras (muñeca y lateral), estado de 40 dimensiones y fuerzas en los dedos.
- Ejecución de 13 tareas de manipulación: coger y colocar objetos, apilar vasos, abrir botellas y desatornillar tapones, limpiar superficies, deslizar objetos, transferir pipetas, atornillar bombillas, insertar tarjetas de crédito y colocar vasos en platos.
- Política multitarea única: un solo conjunto de pesos cubre todas las tareas del dataset TAPTIC más tres tareas adicionales.
- Soporte de manos diestras con 12 articulaciones y realimentación de fuerza en 15 puntos de los dedos.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al tratarse de un modelo de control motor y no de un modelo de lenguaje conversacional.

## Casos de uso

- Manipulación multitarea en laboratorio: el modelo puede ejecutar 13 tareas distintas con un único checkpoint, lo que simplifica el despliegue en bancos de pruebas robóticos donde antes se requería una política por tarea.
- Investigación en manos diestras: sirve como referencia para estudiar el control de una XHand de 12 articulaciones con realimentación de fuerza, un caso poco representado en checkpoints públicos.
- Recogida y clasificación de objetos: tareas como coger frutas y depositarlas en una cesta o apilar vasos se pueden usar para evaluar políticas de pick-and-place en entornos domésticos simulados o reales.
- Tareas de precisión con efector final: inserción de tarjetas de crédito, atornillado de bombillas o transferencia de pipetas permiten medir la precisión de la pose del efector final en tareas que exigen tolerancias milimétricas.
- Limpieza y despeje de superficies: las tareas de limpiar la mesa y despejar objetos permiten evaluar políticas de barrido y organización en escenarios de servicio.
- Base para fine-tuning en nuevos embodiments: al estar construido sobre GR00T N1.7 con configuración `new_embodiment`, puede servir como punto de partida para adaptar el modelo a otras morfologías de brazo y mano.
- Evaluación de robustez en lazo abierto: los errores reportados por tarea (posición entre 26,1 y 77,0 mm) permiten identificar qué tareas son más difíciles y guiar futuras recolecciones de datos.

## Benchmarks y rendimiento

Validación en lazo abierto sobre episodios reservados (5% por tarea, semilla 42), comparando los primeros 16 pasos de acción predichos cada 10 frames con los registrados. Métricas globales sobre 1.732 chunks: error de posición 43,51 mm, error de rotación geodésica 8,49 grados, error medio de articulaciones XHand 6,31 grados.

| Tarea | Pos. (mm) | Rot. (grados) | Mano (grados) |
|---|---|---|---|
| Coger cilindro elíptico y colocarlo | 26,1 | 7,09 | 4,73 |
| Coger tarjeta de crédito e insertarla | 43,2 | 8,99 | 3,84 |
| Coger frutas y ponerlas en la cesta | 39,9 | 8,25 | 7,69 |
| Abrir botella y desatornillar tapón | 29,5 | 8,88 | 8,32 |
| Coger un vaso de la pila | 35,9 | 7,61 | 3,96 |
| Coger vaso de plástico y moverlo | 43,9 | 5,83 | 3,67 |
| Despejar la mesa metiendo objetos | 77,0 | 12,46 | 12,04 |
| Deslizar el coche por la superficie | 43,4 | 4,73 | 5,83 |
| Limpiar la mesa frotando la superficie | 62,3 | 9,42 | 8,28 |
| Coger pipeta y transferir con cuidado | 37,8 | 5,00 | 5,68 |
| Coger pipeta y moverla sin dejar | 41,4 | 14,32 | 11,80 |
| Atornillar bombilla en el casquillo | 43,2 | 11,16 | 8,39 |
| Coger vaso y colocarlo en el plato | 45,1 | 6,09 | 3,96 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3.144 millones de parámetros en bf16 requiere del orden de 6,3 GB solo para los pesos, a lo que hay que sumar el estado del optimizador en entrenamiento y los buffers de activaciones e imágenes.
- GPU recomendadas: no disponible. Para entrenamiento con batch 8 y dos cámaras 480x640 en bf16 se recomienda una GPU de gama alta (A100, H100 o similar), aunque el autor no especifica el hardware utilizado.
- ¿Cabe en GPU de consumo? No disponible. Los pesos en bf16 (aproximadamente 6,3 GB) podrían caber en GPUs de consumo con 12 GB o más de VRAM, pero no se ha verificado ni documentado.
- Opciones de despliegue: LeRobot (librería declarada en el model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAPTIC/groot17_taptic_all_b8_200k | 3.144 M | no disponible | VLA robótica | no disponible | Hugging Face |
| nvidia/GR00T-N1.7-3B | 3.000 M (aproximado, según nombre) | no disponible | VLA robótica | no disponible | Hugging Face (modelo base) |
| Otros modelos VLA de manipulación | no disponible | no disponible | VLA robótica | no disponible | no disponible |

El modelo base nvidia/GR00T-N1.7-3B es el referente directo, del que este checkpoint es una adaptación con fine-tuning multitarea sobre Panda + XHand. No se dispone de datos de benchmarks comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 100.000 de 200.000 planificados, por lo que el rendimiento puede mejorar en versiones posteriores y los resultados actuales no representan el modelo final.
- Errores de posición elevados en algunas tareas: la tarea de despejar la mesa presenta 77,0 mm de error medio de posición y la de limpiar la mesa 62,3 mm, lo que indica dificultad en tareas de barrido amplio.
- Error de rotación alto en una tarea: la tarea de coger y mover la pipeta sin dejarla muestra 14,32 grados de error de rotación, el mayor del conjunto.
- Datos de entrenamiento no publicados: el dataset local (13 tareas, 912 episodios) no se distribuye, lo que dificulta la reproducibilidad y la auditoría de sesgos.
- Ámbito restringido: el modelo está entrenado exclusivamente para el embodiment Panda + XHand con dos cámaras y una configuración concreta de estado y acción; no se espera que generalice a otras morfologías sin fine-tuning.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base nvidia/GR00T-N1.7-3B antes de cualquier despliegue en producción.
- Riesgo de sobreajuste al entorno de laboratorio: las cámaras, iluminación y disposición de objetos de los datos de entrenamiento condicionan el rendimiento; no se documenta evaluación en dominios distintos.
- Sin datos de seguridad: no se documentan comportamientos en presencia de personas, límites de fuerza ni protocolos de parada de emergencia, aspectos críticos en robótica física.
- Idiomas y sesgos: no aplica en el sentido de texto, pero no se documentan sesgos visuales ni de generalización a objetos no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TAPTIC/groot17_taptic_all_b8_200k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Librería LeRobot: https://github.com/huggingface/lerobot
- Fork de LeRobot mencionado (mfincato): no disponible como enlace verificado en la información proporcionada.
