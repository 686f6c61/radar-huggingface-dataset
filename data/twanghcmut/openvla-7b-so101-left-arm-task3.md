# twanghcmut/openvla-7b-so101-left-arm-task3

## Resumen

OpenVLA-7B fine-tuned on SO-101 left arm, 3 tasks es un modelo visión-lenguaje-acción (VLA) obtenido mediante fine-tuning con LoRA del modelo base `openvla/openvla-7b`, desarrollado por el usuario `twanghcmut`. Está especializado en controlar un brazo robótico SO-101 izquierdo en tres tareas concretas de manipulación (trasvase de cubos, apertura de cajón con recogida de bloque y apilado de cubos). El adaptador LoRA se ha fusionado en los pesos finales, por lo que el repositorio contiene un checkpoint completo listo para inferencia.

El modelo resuelve el problema de mapear una instrucción en lenguaje natural más una imagen cenital del entorno a una acción motora de 6 dimensiones (5 articulaciones en grados y apertura continua del gripper). Sigue la receta oficial del repositorio OpenVLA y se entrenó sobre el dataset `hungho77/so101-left-arm-task3` (159 episodios, 133.763 fotogramas a 30 fps). Es relevante como ejemplo reproducible de adaptación de un VLA de propósito general a un robot de bajo coste (SO-101) con recursos modestos: un único H100 en 8 horas.

Arquitectura basada en el backbone Llama-2 de 7B con un codificador visual y proyección multimodal, 7.541.237.184 parámetros totales, licencia MIT (con la Llama 2 Community License subyacente). No se declaran idiomas soportados más allá del inglés de las instrucciones de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en OpenVLA: backbone Llama-2 7B + codificador visual + proyección multimodal |
| Parametros totales | 7.541.237.184 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bf16 en inferencia) |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés) |
| Licencia | MIT (pesos y código OpenVLA); backbone Llama-2 bajo Llama 2 Community License |
| Formato de pesos | safetensors |
| Pipeline | robotics (feature-extraction, vision-language-action) |
| Libreria | transformers (con `trust_remote_code=True`) |
| Modelo base | openvla/openvla-7b |
| Dataset de fine-tuning | hungho77/so101-left-arm-task3 (159 episodios, 133.763 frames, 30 fps, 3 tareas) |
| Entrada | imagen cenital `top` 224x224 + instrucción de tarea (texto) |
| Salida | 6 tokens = acción 6-dim (5 articulaciones en grados + apertura de gripper) |
| Tamano del repo | 15,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura OpenVLA: un transformer decoder basado en Llama-2 7B al que se le inyectan embeddings visuales procedentes de un codificador de imagen, y que genera la acción como una secuencia de 6 tokens discretizados. Cada dimensión de la acción se normaliza al rango [-1, 1] usando los percentiles 1 y 99 del dataset (`BOUNDS_Q99`) y se discretiza en 256 bins por dimensión. La entrada es únicamente la imagen de la cámara cenital `top` (224x224, bicúbica); la cámara de muñeca no se utiliza. No hay entrada de estado ni chunking de acciones: el modelo predice una única acción absoluta por llamada.

El fine-tuning se realizó con LoRA de rango 32 sobre todas las capas lineales, con lr 5e-4 y AdamW, batch efectivo de 32 (16 x 2 de acumulación de gradientes), durante 24.000 pasos (768k muestras, unas 5,7 épocas). Se ejecutó en una H100 80GB en bf16 con 58 GiB de pico de memoria, en 8 horas (1,2 s/paso). La pérdida descendió de 4,31 en el paso 10 a 0,44 en el paso 24.000, y la precisión de token pasó del 4% al 84%. El adaptador se fusionó posteriormente en los pesos. El `config.json` conserva los `norm_stats` de Open X-Embodiment; es necesario cargar `dataset_statistics.json` en `vla.norm_stats` y usar `unnorm_key="so101_left_arm_task3"` para desnormalizar las acciones.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones (5 articulaciones + apertura de gripper) a partir de una imagen cenital y una instrucción de tarea en lenguaje natural.
- Ejecución de tres tareas específicas de manipulación: trasvase de cubo rojo entre recipientes, apertura de cajón con recogida y depósito de bloque, y apilado de cubos.
- Comprensión de instrucciones en inglés (las tareas se pasan literalmente y se convierten a minúsculas en el prompt).
- Inferencia en un solo paso por llamada (sin chunking de acciones), con decodificación greedy.
- Integración con la librería `transformers` mediante `AutoModelForVision2Seq` y `AutoProcessor` con `trust_remote_code=True`.
- Compatible con el servidor VLA-RT (sin RTC ni bucle asíncrono).
- No soporta tool calling, function calling, razonamiento multi-paso, visión general, audio ni modo thinking: es un modelo especializado en control motor.

## Casos de uso

- Investigación en aprendizaje por imitación sobre robots de bajo coste: sirve como checkpoint de referencia para reproducir la receta de fine-tuning LoRA de OpenVLA sobre un SO-101 y comparar curvas de pérdida y precisión de token con otras variantes del mismo autor.
- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar el trasvase de un cubo rojo desde una olla de acero a un cubo hueco naranja recibiendo solo la imagen cenital y la instrucción textual, adecuado para montajes experimentales controlados.
- Manipulación de cajones en entornos de banco de pruebas: apertura del cajón superior, recogida de un bloque cuadrado rojo, depósito en el interior y cierre, útil para validar políticas de manipulación articulada con gripper.
- Apilado de cubos como tarea de precisión: apertura del cajón, recogida del cubo rojo y apilado sobre el cubo azul, útil para estudiar la precisión de posicionamiento del brazo en tareas de contacto.
- Evaluación open-loop de políticas VLA: el script `eval_so101_task3_open_loop.py` permite medir MAE de acción frente a ground-truth en trayectorias de entrenamiento, útil como test de ajuste antes de desplegar en robot real.
- Despliegue en servidor de inferencia robótica: mediante VLA-RT se puede servir el modelo para experimentos de teleoperación o evaluación cerrada, siempre que se asuma la limitación de una acción por llamada sin chunking.
- Docencia y divulgación: ejemplo completo y documentado de fine-tuning de un VLA de 7B con un solo H100, útil para cursos de robótica aprendizaje y para ilustrar el flujo dataset → LoRA → fusión → evaluación.

## Benchmarks y rendimiento

Evaluación open-loop in-sample sobre 6 trayectorias de entrenamiento (0, 25, 51, 80, 108, 133; primeros 400 frames), decodificación greedy. Normalizado = MAE / 29,97.

| Métrica | MAE | Normalizado |
|---|---|---|
| 1-step (cada 4 frames, vs acción ground-truth) | 2,015 | 6,72% |
| Baseline: acción ground-truth previa | 0,274 | 0,91% |
| Baseline: copiar el estado actual | 1,786 | 5,96% |
| hold-16 (acción repetida 16 pasos, 150 anclas) | 3,619 | 12,07% |
| Baseline: acción ground-truth en el ancla repetida 16 pasos | 2,043 | 6,82% |

| Trayectoria | Tarea | 1-step MAE | hold-16 MAE |
|---|---|---|---|
| 0 | 0 | 0,416 | 1,672 |
| 25 | 0 | 0,610 | 2,476 |
| 51 | 1 | 9,896 | 10,909 |
| 80 | 1 | 0,416 | 1,747 |
| 108 | 2 | 0,368 | 2,025 |
| 133 | 2 | 0,382 | 2,884 |

La trayectoria 51 domina la media: su error en `wrist_roll` es de 57 (el resto de dimensiones entre 0,01 y 0,87), porque en el episodio 51 el `wrist_roll` registrado alcanza 118,5 mientras los percentiles 1/99 del dataset son -83,0 / 34,9, de modo que el espacio de acciones `BOUNDS_Q99` lo recorta y el modelo no puede emitirlo. En las otras cinco trayectorias el MAE 1-step está entre 0,37 y 0,61. Aun así, a un paso el modelo es peor que repetir la acción anterior. Son comprobaciones de ajuste sobre datos de entrenamiento, no tasas de éxito; no existe resultado en robot real para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15 GB de pesos más overhead de activaciones; el entrenamiento reportó 58 GiB de pico en una H100 80GB.
- GPU recomendadas: H100 80GB (usada en entrenamiento), A100 40/80GB para inferencia cómoda.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16, y en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: `transformers` con `AutoModelForVision2Seq` y `trust_remote_code=True`; servidor VLA-RT (sin RTC ni bucle asíncrono). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma agregada; el autor reporta 1,2 s/paso durante entrenamiento (batch 32, H100), no latencia de inferencia por acción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada/salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| twanghcmut/openvla-7b-so101-left-arm-task3 | 7,54B | no disponible | imagen cenital + texto → acción 6-dim (1 paso) | MIT (+ Llama 2) | Hugging Face, 0 descargas |
| openvla/openvla-7b (base) | 7,54B | no disponible | imagen + texto → acción 7-dim (Open X-Embodiment) | MIT (+ Llama 2) | Hugging Face, ampliamente usado |
| twanghcmut/OpenVLA-7B-SO101-LeftArm-Multitask | 7,54B | no disponible | imagen cenital + texto → acción 6-dim (1 paso), 11 tareas | MIT (+ Llama 2) | Hugging Face |
| Otros checkpoints task3 del mismo autor | 7,54B | no disponible | acción con chunking de 16 pasos (escala distinta) | MIT (+ Llama 2) | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; las métricas open-loop del presente modelo no son directamente comparables con las de checkpoints que usan chunking de 16 pasos.

## Limitaciones y advertencias

- Predice una sola acción por llamada y sin chunking; no es directamente comparable con checkpoints que operan en escala de 16 pasos.
- Solo usa la cámara cenital `top`; la cámara de muñeca no se emplea, lo que limita la percepción en tareas que requieran visión cercana.
- No recibe estado del robot como entrada; la acción es absoluta y depende de la calibración del SO-101.
- El espacio de acciones se recorta con percentiles 1/99 (`BOUNDS_Q99`); valores fuera de rango, como el `wrist_roll` del episodio 51, son inalcanzables y degradan fuertemente las métricas.
- A un paso, el modelo es peor que repetir la acción ground-truth anterior, según la propia evaluación del autor.
- Las métricas publicadas son de ajuste in-sample sobre datos de entrenamiento, no tasas de éxito; no hay resultados en robot real.
- Riesgo de alucinación de acciones no validado: al ser un modelo generativo de tokens de acción, no se documentan mecanismos de seguridad ni límites articulares.
- Sesgos conocidos: no documentados por el autor; el dataset es pequeño (159 episodios) y específico de un montaje concreto.
- Idiomas: instrucciones en inglés; no se declara soporte multilingüe.
- Licencia: MIT para pesos y código OpenVLA, pero el backbone Llama-2 está sujeto a la Llama 2 Community License, que impone restricciones adicionales para uso comercial a gran escala.
- Repositorio con 0 descargas y 0 likes; sin validación comunitaria ni mantenimiento conocido.
- No se documentan opciones de cuantización ni soporte para motores de inferencia distintos de `transformers` y VLA-RT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/openvla-7b-so101-left-arm-task3
- Modelo base: https://huggingface.co/openvla/openvla-7b
- Dataset de fine-tuning: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- Variante multitarea del mismo autor: https://huggingface.co/twanghcmut/OpenVLA-7B-SO101-LeftArm-Multitask
- Repositorio oficial OpenVLA: https://github.com/openvla/openvla
- Servidor VLA-RT: https://github.com/VLAOpt/VLA-RT
- Licencia Llama 2: https://ai.meta.com/llama/license/
