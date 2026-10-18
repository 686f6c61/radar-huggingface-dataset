# tsangb34/pi05-droid-towel-in-basket-10ep

## Resumen

`tsangb34/pi05-droid-towel-in-basket-10ep` es un ajuste fino del modelo visión-lenguaje-acción (VLA) π0.5 de Physical Intelligence, publicado por el usuario `tsangb34` a través de la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política de control robótico que recibe el estado del robot, su posición cartesiana y dos o tres cámaras RGB, y emite un vector de acción de 8 dimensiones. El checkpoint parte de `lerobot/pi05_base` y se ha entrenado para una única tarea: dejar una toalla dentro de una cesta («towel in basket») con un robot Franka.

El interés práctico es doble. Por un lado, ilustra el flujo completo de imitación end-to-end que propone LeRobot: 100 episodios y 27.395 fotogramas a 30 FPS, 8.570 pasos de entrenamiento con AdamW, batch de 32 y una tasa de aprendizaje de 2,5e-5. Por otro, sirve como plantilla reproducible para quien quiera afinar π0.5 sobre datos propios de un brazo Franka y desplegar la política con `lerobot-rollout`.

El modelo tiene 4.143.404.816 parámetros (≈4,14 B) en safetensors y licencia Apache-2.0, pero carece de evaluación publicada: la propia model card indica que no se han aportado resultados en robot real. Además, el nombre del repositorio («10ep») no concuerda con los 100 episodios que declara la model card, una inconsistencia que conviene resolver antes de reutilizarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action basada en π0.5 (Physical Intelligence); implementación LeRobot adaptada del repositorio OpenPI |
| Parámetros totales | 4.143.404.816 (≈4,14 B), según safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo distribuye safetensors, sin versiones GGUF ni cuantizadas publicadas |
| Idiomas soportados | no disponible (la política consume una instrucción textual, pero no se documenta cobertura lingüística) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 9,4 GB) |
| Tipo de robot | Franka |
| Cámaras de entrada | `left_image` (3, 360, 640), `wrist` (3, 360, 640), `empty_camera_0` (3, 224, 224) |
| Estado de entrada | `observation.state` (8,), `observation.cartesian_position` (6,) |
| Salida | `action` (8,) |
| Modelo base | `lerobot/pi05_base` |
| Librería / pipeline | LeRobot 0.6.1 / `robotics` |

## Arquitectura y entrenamiento

π0.5 es la evolución de π0 que Physical Intelligence presenta como un VLA orientado a la generalización en entornos abiertos: el objetivo declarado es transferir a situaciones y entornos no vistos durante el entrenamiento. La model card no detalla la arquitectura interna (backbone visual, encoder de lenguaje, cabeza de acciones ni mecanismo de generación de acciones), y remite al blog de Physical Intelligence y al repositorio OpenPI para los detalles. En este repositorio solo se documenta la interfaz de observación y acción, no la topología de la red ni el número de tokens o el horizonte de predicción de acciones.

El entrenamiento es un ajuste fino supervisado desde `lerobot/pi05_base` sobre el dataset `local/droid-towel-in-basket-left-wrist`: 100 episodios, 27.395 fotogramas a 30 FPS, una sola tarea y datos derivados de DROID con cámara en la muñeca izquierda. La configuración registrada es de 8.570 pasos, batch 32, optimizador AdamW, learning rate 2,5e-5 y semilla 1000, con LeRobot 0.6.1. No se menciona RLHF, DPO ni ninguna fase de alineación posterior; es imitación pura sobre demostraciones.

## Capacidades

- Generación de acciones de 8 dimensiones para control de un robot Franka, condicionadas por estado articular, posición cartesiana y hasta tres cámaras RGB.
- Comprensión de una instrucción textual de tarea («towel in basket») como condicionamiento de la política.
- Manipulación de objetos deformables (toallas) y colocación en un contenedor, dentro del dominio de entrenamiento.
- Fusión multimodal visión-lenguaje-acción con dos vistas de alta resolución (640×360) y una tercera vista de 224×224.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout`, con o sin grabación de episodios.
- Punto de partida reutilizable para nuevos ajustes finos con `lerobot-train --policy.path=lerobot/pi05_base`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No implementa razonamiento multi-paso en el sentido de agentes LLM; su «razonamiento» es implícito y se resuelve en cada paso de control.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Manipulación de ropa en laboratorio: recoger una toalla y depositarla en una cesta con un Franka equipado con cámara de muñeca, replicando exactamente la configuración de cámaras del entrenamiento. Es el caso para el que el modelo fue entrenado.
- Punto de partida para un ajuste fino propio: cargar `lerobot/pi05_base` o este checkpoint con `lerobot-train` y reentrenar con un dataset propio de otra tarea, aprovechando que la receta completa (pasos, batch, learning rate) está documentada.
- Referencia de reproducibilidad en investigación: comparar la receta de 8.570 pasos y batch 32 frente a otras configuraciones sobre el mismo dataset para estudiar sensibilidad a hiperparámetros en imitación.
- Docencia de VLA: recorrer el ciclo completo instalación de LeRobot, grabación con `lerobot-record`, entrenamiento y despliegue con `lerobot-rollout` usando un único checkpoint pequeño en parámetros.
- Automatización de tareas pick-and-place con materiales deformables en una célula de montaje ligera, siempre que el robot sea un Franka y la iluminación y el fondo se parezcan a los del dataset DROID empleado.
- Evaluación de robustez: ejecutar rollouts repetidos variando posición inicial de la toalla, iluminación y distractores para medir la degradación de la política, ya que el autor no publica tasas de éxito.
- Generación de datos sintéticos de evaluación: usar la política para producir trayectorias y compararlas con las demostraciones humanas del dataset, detectando derivas del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía y señala explícitamente: «No evaluation results have been provided for this policy yet». No existen, por tanto, tasas de éxito, métricas de progreso de tarea ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- Estimación de VRAM para los pesos (cálculo a partir de 4.143.404.816 parámetros; no son cifras oficiales): fp32 ≈16,6 GB, bf16/fp16 ≈8,3 GB, int8 ≈4,1 GB, int4 ≈2,1 GB. Hay que sumar el overhead de activaciones y de los buffers de imagen (dos flujos de 640×360 y uno de 224×224), por lo que en bf16 conviene contar con 10-12 GB reales.
- GPU de gama alta recomendadas: A100 40/80 GB, H100, L40S para servir la política con holgura y ejecutar varios rollouts en paralelo.
- GPU de consumo: en bf16 el modelo debería caber en una RTX 4090 o RTX 3090 (24 GB) y, con menos margen, en una RTX 4080 (16 GB). En fp32 haría falta una tarjeta de 24 GB como mínimo.
- Cuantización: el repositorio no publica versiones int8/int4 ni GGUF, por lo que el despliegue en GPUs de 8 GB no está soportado ni documentado.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) como vía documentada, dentro del ecosistema LeRobot; vLLM o TGI no son aplicables porque la salida es un vector de acción continuo, no texto. llama.cpp/Ollama no disponen de pesos compatibles.
- Latencia y throughput: no disponibles. Como referencia del entorno, el dataset se grabó a 30 FPS, lo que implica un presupuesto de 33 ms por paso si se quiere control a esa frecuencia; no se documenta si la política usa chunking de acciones para relajar ese requisito.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05-droid-towel-in-basket-10ep`) | ≈4,14 B | VLA afinado para una tarea (Franka, «towel in basket») | no disponible | apache-2.0 | Hugging Face, vía LeRobot |
| `lerobot/pi05_base` | ≈4,14 B (misma arquitectura) | VLA base π0.5, uso generalista | no disponible | no disponible en la información | Hugging Face, vía LeRobot |
| π0 (Physical Intelligence) | orden de 3 B (dato no confirmado en la información) | VLA predecesor de π0.5 | no disponible | no disponible en la información | Repositorio OpenPI |
| OpenVLA | ≈7 B (dato de la familia, no verificado aquí) | VLA de código abierto | no disponible | no disponible en la información | Repositorio público |
| SmolVLA | ≈450 M (dato de la familia, no verificado aquí) | VLA ligero de Hugging Face | no disponible | no disponible en la información | Hugging Face, vía LeRobot |

Los datos de las filas de π0, OpenVLA y SmolVLA no provienen de la información proporcionada y deben verificarse en sus repositorios antes de citarlos. La comparación relevante y segura es con `lerobot/pi05_base`: mismo tamaño y licencia, pero este checkpoint está especializado en una única tarea y no conserva las capacidades generalistas del base.

## Limitaciones y advertencias

- Es una política de una sola tarea: no generaliza a otras instrucciones sin reentrenamiento, pese a que la familia π0.5 se promocione por su generalización en entornos abiertos.
- Entrenada con solo 100 episodios y 27.395 fotogramas de un único entorno; alta probabilidad de sobreajuste a posiciones, iluminación, fondo y configuración de cámara del dataset DROID de origen.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que no puede afirmarse ningún nivel de rendimiento en robot real.
- Inconsistencia documental: el nombre del repositorio indica «10ep» mientras que la model card declara 100 episodios. Hay que verificar el dataset real antes de reutilizar el checkpoint.
- La observación `observation.images.empty_camera_0` (224×224) no está explicada por el autor; parece una cámara placeholder de la configuración de entrenamiento. Alimentarla con datos incorrectos o con una vista distinta a la usada en el entrenamiento puede degradar la inferencia.
- Requiere que los nombres de cámara (`left_image`, `wrist`) coincidan exactamente con las claves de observación del entrenamiento; un mapeo distinto invalida la política.
- El equivalente a la alucinación en este dominio es la generación de acciones plausibles pero erróneas sin señal de confianza ni abstención; no hay mecanismo documentado de detección de fallo.
- Licencia Apache-2.0 permite uso comercial del checkpoint, pero se heredan las condiciones del modelo base π0.5 y de la implementación OpenPI; conviene revisar los términos del proyecto original antes de un despliegue productivo.
- Sin cuantizaciones oficiales ni soporte documentado en llama.cpp/Ollama, el despliegue queda ligado al stack LeRobot y a GPUs con al menos 10-12 GB en bf16.
- Métricas de comunidad nulas (0 descargas, 0 likes) en el momento de la consulta: no hay validación externa del checkpoint.
- No se documentan sesgos, cobertura idiomática ni comportamiento fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/pi05-droid-towel-in-basket-10ep
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/local/droid-towel-in-basket-left-wrist
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/droid-towel-in-basket-left-wrist
- Blog de π0.5 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π0.5 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence: citado en la model card, sin URL incluida en la información proporcionada.
