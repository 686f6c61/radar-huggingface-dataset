# VibeCuisine/smolvla-cucumber-grab-place-peel-doris082126

## Resumen

El modelo `smolvla-cucumber-grab-place-peel-doris082126` es una política robótica de tipo Vision-Language-Action (VLA) desarrollada por VibeCuisine, una organización centrada en la automatización de cocinas domésticas mediante IA física. Se trata de un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propietario de teleoperación, y está diseñado para ejecutar tareas específicas de manipulación de pepinos: agarrar, colocar y pelar. El modelo se distribuye a través de la librería LeRobot y está pensado para ser desplegado en el hardware propietario `vibeboard_v2`.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, el modelo consume tres flujos de vídeo (cámaras base, superior y de muñeca) a 20 fps y produce un vector de acción de 7 dimensiones. Su relevancia radica en ser un ejemplo práctico de cómo se entrena y despliega una política VLA de código abierto para tareas de manipulación fina en entornos domésticos, aunque su alcance está estrictamente limitado a las instrucciones y al rig con el que fue entrenado. No se han publicado métricas de rendimiento generales más allá de la pérdida final de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | smolvla (base: `lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa secuencias de imagenes a 20 fps, sin ventana de contexto textual definida) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponibles (las instrucciones del dataset estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `smolvla`, un VLA que combina un codificador visual con un modelo de lenguaje para generar acciones de control. Parte del checkpoint `lerobot/smolvla_base` y se ha fine-tuneado con la librería LeRobot. El entrenamiento se realizó sobre 744 episodios de teleoperación, lo que equivale a 95.399 fotogramas a 20 fps, durante 40.000 pasos con un batch size de 32 y semilla 42. El proceso duró 4 horas y 53 minutos en una GPU NVIDIA A100-SXM4-80GB, alcanzando una pérdida final de entrenamiento de 0,052.

El sistema consume tres entradas de imagen (`observation.images.camera1`, `camera2` y `camera3`), que corresponden a las cámaras base, superior y de muñeca del rig, todas a resolución 640×480. La salida es un vector de acción de 7 dimensiones que controla los grados de libertad del brazo (hombro, codo, muñeca, pinza e inclinación). El entrenamiento es condicionado por lenguaje, con cuatro instrucciones específicas en inglés que definen las tareas de agarre, colocación y pelado.

## Capacidades

- Manipulación robótica fina: ejecuta tareas de agarrar, colocar y pelar pepinos con un brazo robótico de 7 grados de libertad.
- Condicionamiento por lenguaje natural: acepta instrucciones en inglés para seleccionar la tarea a ejecutar (aunque limitado a las 4 frases del dataset).
- Percepción multimodal: integra tres flujos de vídeo simultáneos (base, superior y muñeca) a 20 fps para la toma de decisiones.
- Control de pinza y muñeca: incluye acciones de apertura/cierre de pinza y rotación de muñeca, necesarias para tareas de pelado.
- Inferencia en tiempo real: el rig opera a 20 fps, lo que permite una ejecución fluida de las tareas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo pipelines de evaluación.

## Casos de uso

- Automatización de tareas de cocina: el modelo puede integrarse en un brazo robótico doméstico para preparar ingredientes, específicamente manipulando pepinos (agarrar, colocar y pelar) en una tabla de cortar.
- Investigación en robótica VLA: sirve como punto de partida para estudiar el fine-tuning de modelos base `smolvla` en tareas de manipulación fina con datasets pequeños (744 episodios).
- Desarrollo de políticas con LeRobot: los desarrolladores pueden usarlo como referencia para entrenar sus propios modelos con la misma configuración de cámaras y espacio de acción.
- Evaluación de pipelines de teleoperación: permite validar la calidad de datasets recopilados con Vibe Data Studio y el hardware `vibeboard_v2`.
- Benchmark de generalización: al estar limitado a un solo objeto y un rig concreto, es útil para medir la capacidad de generalización de modelos VLA ante variaciones de iluminación o posición.
- Pruebas de despliegue en edge computing: con 450M de parámetros, es viable ejecutarlo en GPUs de consumo para prototipos de robótica doméstica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida final de entrenamiento (0,052), que no es comparable con estándares como MMLU o HumanEval. No se dispone de datos de éxito en tareas, latencia de inferencia ni throughput.

## Requisitos de hardware

- Entrenamiento: el autor utilizó una NVIDIA A100-SXM4-80GB, aunque el entrenamiento de un modelo de 450M de parámetros podría completarse en GPUs con 24 GB de VRAM si se reduce el batch size.
- Inferencia: no se especifican requisitos mínimos, pero al ser un modelo de 450M de parámetros, es plausible ejecutarlo en GPUs consumer como RTX 3090 o RTX 4090 (24 GB VRAM) con suficiente espacio para el batch de imágenes.
- Despliegue: el ecosistema principal es LeRobot, que gestiona la carga del modelo y la inferencia. No se menciona compatibilidad con vLLM, TGI u Ollama, ya que no es un modelo de texto puro.
- Latencia: no disponible, aunque el rig de captura opera a 20 fps, lo que sugiere que la inferencia debe completarse en menos de 50 ms por paso para mantener la frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `VibeCuisine/smolvla-cucumber-grab-place-peel-doris082126` | 450M | no disponible | Manipulacion de pepinos (grab, place, peel) | no disponible | Hugging Face |
| `VibeCuisine/smolvla-cucumber-grab-place-peel-doris072426` | 450M (estimado) | no disponible | Manipulacion de pepinos (variante anterior) | no disponible | Hugging Face |
| `lerobot/smolvla_base` | 450M (estimado) | no disponible | Modelo base generalista para VLA | no disponible | Hugging Face |

La comparativa se limita a otros modelos de la familia `smolvla` de VibeCuisine y al modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia entre las variantes de VibeCuisine es el dataset y las instrucciones específicas, mientras que el modelo base es el punto de partida sin fine-tuning.

## Limitaciones y advertencias

- Sesgos de dataset: el modelo solo ha sido entrenado con pepinos y un rig específico (`vibeboard_v2`). No generalizará a otros objetos o configuraciones de hardware sin un nuevo fine-tuning.
- Instrucciones limitadas: solo reconoce las 4 frases en inglés definidas en el dataset. Cualquier variación en la redacción puede provocar fallos.
- Licencia no disponible: no se especifica la licencia, lo que impide determinar si es apto para uso comercial sin autorización explícita.
- Riesgo de alucinación en acciones: al ser un modelo de lenguaje condicionado, puede generar acciones incorrectas si la entrada visual difiere del dominio de entrenamiento.
- Sin benchmarks publicados: no hay evidencia de éxito en tareas reales más allá de la pérdida de entrenamiento, lo que dificulta evaluar su robustez.
- Dependencia de la configuración de cámaras: es imprescindible respetar el mapeo de cámaras (`base`→`camera1`, `top`→`camera2`, `wrist`→`camera3`) y la resolución 640×480 para que la inferencia funcione correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VibeCuisine/smolvla-cucumber-grab-place-peel-doris082126
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/cucumber-place-elevator-home-doris082026-v1-trim
- Registro de entrenamiento en W&B: https://wandb.ai/jeremyhx-freelance/lerobot/runs/vds34-913e6ab5
- Organización VibeCuisine en GitHub: https://github.com/orgs/VibeCuisine/
- Modelo similar (variante anterior): https://huggingface.co/VibeCuisine/smolvla-cucumber-grab-place-peel-doris072426
