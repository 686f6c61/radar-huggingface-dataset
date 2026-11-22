# Space0code/act_redblue_v2

## Resumen

`act_redblue_v2` es una política de robótica basada en ACT (Action Chunking with Transformers) entrenada desde cero para el brazo robótico SO-101. Su tarea concreta es recoger una pelota objetivo rayada de un cuenco lleno de pelotas rojas y azules, excavando si la pelota está enterrada. El modelo se publica como un checkpoint de LeRobot en formato safetensors, con 51.668.614 parámetros y un tamaño de repositorio de 0,6 GB.

Lo desarrolla el usuario Space0code en el contexto del Bilbao Physical AI Hackathon. No es un modelo de lenguaje: es un modelo de imitación visomotora que mapea observaciones (imágenes de cámara y estado del brazo) a secuencias de acciones articulares. Por tanto, no tiene contexto textual, idiomas ni capacidades de generación de lenguaje.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de entrenamiento de políticas robóticas con LeRobot 0.7.0, incluyendo dataset, script de entrenamiento en Modal con GPU L40S y checkpoints intermedios. Es útil para quien quiera replicar o adaptar un flujo de aprendizaje por imitación para el SO-101, no como componente de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT opera sobre ventanas de observación, sin dato publicado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo robótico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice trozos de acciones (action chunks) a partir de observaciones visuales y propioceptivas, con un codificador visual y un decodificador de acciones. El modelo se entrenó desde inicialización aleatoria, sin partir de un checkpoint preentrenado.

Los datos provienen del dataset `molnrb/so101_pick_rb_mixed`, con 201 episodios y 131.706 fotogramas; se reservó un 5 % de episodios para evaluación (`eval_split=0.05`, semilla 1000). El entrenamiento usó LeRobot 0.7.0, batch de 32, learning rate 2e-5, precisión bf16, 20.000 pasos y aumentación de brillo, contraste, nitidez y transformaciones afines, desactivando hue y saturación. Se ejecutó en Modal sobre GPU L40S. La model card advierte que la pérdida de evaluación no predice el rendimiento real del brazo y que la selección de checkpoint debe hacerse sobre el robot físico.

## Capacidades

- Ejecución de una política de pick-and-place específica: localizar y agarrar la pelota rayada en un cuenco con pelotas rojas y azules.
- Excavación: capacidad de apartar pelotas para extraer el objetivo si está enterrado.
- Control visomotor del brazo SO-101 a partir de observaciones de cámara y estado articular.
- Predicción de secuencias de acciones por chunks (action chunking).
- Robustez parcial a variaciones de iluminación y encuadre gracias a la aumentación aplicada durante el entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de un pipeline de aprendizaje por imitación: sirve como referencia completa (dataset, hiperparámetros, script de entrenamiento) para montar un flujo ACT con LeRobot sobre el SO-101.
- Investigación en manipulación robótica: permite estudiar el efecto de la aumentación de imagen (brillo, contraste, afín) en la generalización de políticas de pick.
- Benchmark de selección de checkpoints: la model card documenta que la pérdida de evaluación no correlaciona con el rendimiento físico, un caso útil para diseñar protocolos de evaluación en robot real.
- Tareas de clasificación y agarre en entornos con distractores: el escenario de pelotas rojas y azules mezcladas evalúa la discriminación visual fina del objetivo.
- Prototipado en hackathons y docencia: el modelo y su receta son un punto de partida de bajo coste (0,6 GB) para equipos con un SO-101 y una GPU consumer o cloud.
- Base para fine-tuning en tareas de pick similares: al estar entrenado desde cero, puede adaptarse a otros objetos o cuencos con un dataset propio.
- Validación de infraestructura de entrenamiento en cloud: el uso de Modal con L40S y bf16 documenta una configuración reproducible para entrenamientos de 20.000 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. La model card solo reporta pérdida de evaluación sobre episodios reservados:

| Paso | Pérdida de evaluación (episodios reservados) |
|---|---|
| 5.000 | 0,3498 |
| 10.000 | 0,3392 |
| 15.000 | 0,3398 |

El autor indica explícitamente que esta métrica no predice el rendimiento del brazo y que la selección de checkpoint debe hacerse en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros y pesos en safetensors, la huella es del orden de cientos de MB, por lo que cabe holgadamente en cualquier GPU consumer reciente.
- GPU recomendadas: no hay requisitos publicados; el entrenamiento se realizó en NVIDIA L40S (Modal). Para inferencia, una RTX 3060 o superior debería ser suficiente por tamaño, aunque no está verificado.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se especifican modelos concretos validados.
- Opciones de despliegue: LeRobot (librería nativa del checkpoint); no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, otras políticas ACT publicadas para LeRobot y SO-101 comparten arquitectura y orden de magnitud de parámetros, pero no se aportan cifras verificables para comparar contexto, rendimiento o licencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_redblue_v2 | 51.668.614 | no disponible | no disponible | Hugging Face (Space0code) |
| Alternativas ACT para SO-101 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo altamente especializado: solo resuelve la tarea de recoger la pelota rayada en el cuenco descrito; no generaliza a otros objetos, entornos o robots sin reentrenamiento.
- La pérdida de evaluación no es un indicador fiable del rendimiento físico; es obligatorio validar en el brazo real.
- Entrenado desde cero con 201 episodios, un volumen reducido que limita la robustez frente a cambios de iluminación, fondo o posición inicial no vistos.
- No se especifica la licencia, por lo que el uso comercial queda sin garantías legales hasta que el autor la declare.
- No hay información sobre sesgos, pero el dataset puede contener sesgos de posición, color o iluminación que la política reproduzca.
- Riesgo de fallos en agarre o excavación fuera de la distribución de entrenamiento; no hay métricas de tasa de éxito publicadas.
- No es un modelo de lenguaje ni multimodal general: no admite prompts de texto, tool calling ni razonamiento.
- El repositorio incluye múltiples checkpoints (`checkpoints/<step>/`); usar el más reciente del directorio raíz sin validación previa es arriesgado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Space0code/act_redblue_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/molnrb/so101_pick_rb_mixed
- LeRobot (librería): https://github.com/huggingface/lerobot
- Script de entrenamiento citado (`scripts/modal_train.py` del repositorio del equipo): no disponible como enlace directo en la información proporcionada
- Modal (plataforma de entrenamiento): https://modal.com
