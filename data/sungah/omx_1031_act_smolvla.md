# Sungah/omx_1031_act_smolvla

## Resumen

`Sungah/omx_1031_act_smolvla` es un paquete de politicas de robotica (Vision-Language-Action y ACT) entrenado por el usuario Sungah para una tarea concreta de manipulacion: extraer una caja de una estanteria de dos columnas y depositarla en una cesta blanca. El repositorio no contiene un unico modelo, sino 35 checkpoints organizados en cinco variantes de ACT (A-E) y dos variantes de SmolVLA, cada una con cinco niveles de entrenamiento (1.000-5.000 pasos para ACT, 200-1.000 para SmolVLA). La tarea se define sobre el robot OMX con dos camaras (`top` y `wrist`), estado de 6 o 7 dimensiones (articulaciones, pinza y, opcionalmente, corriente de la pinza) y, en algunas variantes, un mapa de profundidad estimado con MoGe-2 ViT-B.

El interes tecnico del paquete esta en la comparacion sistematica de variantes: ACT base, ACT con numero de caja como one-hot, ACT con corriente de pinza, ACT con profundidad monocular y ACT con todas las senales; y SmolVLA con y sin corriente. Esto permite evaluar el impacto de anadir informacion exteroceptiva (profundidad) y de tarea (identificador de caja) sobre una politica de imitacion. Los datos de entrenamiento son 16 demostraciones teleoperadas (13.527 fotogramas a 30 fps) de un dataset propio.

La relevancia practica es limitada fuera del entorno del autor: se trata de un experimento de investigacion reproducible con codigo de inferencia incluido (lerobot 0.4.4), no de un modelo general. La tasa de exito real sobre el robot fisico no se ha medido segun la model card. La licencia es Apache 2.0 y el repositorio ocupa 14,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer, backbone ResNet18) y SmolVLA (VLA compacto sobre SmolVLM2-500M-Video-Instruct) |
| Parametros totales | no disponible (no se declara el recuento; el repo pesa 14,3 GB con 35 checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (politica de control; chunk de 100 acciones en ACT y 50 en SmolVLA) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (las instrucciones de SmolVLA se dan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer de chunking de acciones con codificador visual ResNet18 inicializado con pesos ImageNet. Se entrena con batch efectivo de 256 (32 x 8), 5.000 pasos (aproximadamente 95 pasadas sobre el dataset), learning rate cosine con maximo 4e-5 (1e-5 en el codificador de imagen), warmup de 100 pasos y decaimiento hasta 1e-6, chunk de 100 acciones, aumento de imagen (color, nitidez, rotacion +-5 grados, traslacion +-5 %) y gradient clipping de 10. La variante D y E anaden un mapa de profundidad `top_depth` generado con MoGe-2 ViT-B (1.200 tokens, rango 0,69-2,46 m, escala de grises) calculado en tiempo real solo en los fotogramas que la politica predice.

SmolVLA parte de `lerobot/smolvla_base`, con batch efectivo de 256 (128 x 2) y 1.000 pasos, learning rate maximo 1e-4 con cosine y ajuste automatico a 1k pasos, chunk de 50 acciones. El codificador visual permanece congelado y solo se entrena el *action expert*. En esta variante la caja a extraer se especifica mediante una frase en ingles (cuatro plantillas, una por caja) en lugar de un one-hot. El dataset de origen es `Sungah/omx_1031_JH_v1_success`: 16 demostraciones (se descarta la 14 por duplicada), 13.527 fotogramas a 30 fps, camaras `top` y `wrist`. No se documenta RLHF ni DPO; es imitacion supervisada pura.

## Capacidades

- Control de robot manipulador de 5 articulaciones mas pinza mediante prediccion de chunks de acciones (100 pasos en ACT, 50 en SmolVLA).
- Percepcion visual con dos camaras (vista superior y de muneca).
- Percepcion de profundidad monocular en las variantes D y E, estimada con MoGe-2 ViT-B a partir de la camara superior.
- Condicionamiento por identificador de caja mediante one-hot de 4 dimensiones (ACT B y E) o mediante instruccion en lenguaje natural (SmolVLA).
- Uso de corriente de la pinza en miliamperios como senal adicional de estado (variantes C, E y SmolVLA con grip).
- Ejecucion sobre `lerobot` 0.4.4 con scripts de inferencia incluidos (`infer.sh`, `inference.sh`, `inference_smolvla.sh`).
- No soporta tool calling, agentes multi-paso, vision general, audio ni generacion de texto libre: es una politica de control, no un modelo conversacional.

## Casos de uso

- **Extraccion de cajas en estanteria de dos columnas**: el caso disenado. Se selecciona el checkpoint y, si aplica, el numero de caja (`BOX=1..4`), y el modelo ejecuta la secuencia de pick-and-place sobre el robot OMX durante 60 segundos por defecto.
- **Benchmark de ablacion de senales sensoriales**: comparar las cinco variantes ACT (base, caja, corriente, profundidad, todo) bajo el mismo dataset permite medir la contribucion de cada modalidad al exito de la tarea.
- **Comparacion ACT frente a VLA**: los pares de checkpoints ACT y SmolVLA sobre la misma tarea permiten contrastar una politica de imitacion clasica con un VLA preentrenado, en terminos de latencia (31 ms frente a 330 ms por prediccion) y requisitos de memoria (0,6 GB frente a 1,3 GB).
- **Validacion de profundidad monocular en robotica**: las variantes D y E sirven para evaluar si un mapa de profundidad estimado con MoGe-2 en el momento de la prediccion mejora el agarre respecto a usar solo RGB.
- **Reproduccion de experimentos de imitacion con pocos datos**: 16 demostraciones y 13.527 fotogramas constituyen un caso de estudio de aprendizaje con datos escasos, con scripts de generacion de dataset y entrenamiento incluidos en `training/`.
- **Desarrollo y depuracion de pipelines lerobot**: los scripts permiten ejecutar la politica reproduciendo video y valores articulares sin robot fisico, util para integrar lerobot 0.4.4 en nuevos entornos.
- **Prototipado en hardware de gama media**: con 1,7 GB de VRAM en el peor caso (ACT E con MoGe), cabe en cualquier GPU de 16 GB, lo que facilita desplegar en estaciones de trabajo modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la tasa de exito real sobre el robot fisico aun no se ha medido. Los unicos datos de rendimiento son de latencia y memoria en RTX A6000:

| Modelo | Memoria GPU | Latencia por prediccion |
|---|---|---|
| ACT A, B, C | aprox. 0,6 GB | aprox. 31 ms |
| ACT D, E + MoGe ViT-B | aprox. 1,7 GB | aprox. 36 ms + 31 ms de profundidad |
| SmolVLA | aprox. 1,3 GB | aprox. 330 ms (cada 50 pasos) |

La estimacion de profundidad con MoGe-2 ViT-B (1.200 tokens) tarda entre 31 y 46 ms por imagen en RTX A6000.

## Requisitos de hardware

- VRAM: aproximadamente 0,6 GB para ACT A-C, 1,7 GB para ACT D-E con MoGe y 1,3 GB para SmolVLA, medidos en RTX A6000 incluyendo el uso base de CUDA.
- Cabe holgadamente en GPUs de consumo con 16 GB o mas; la model card afirma que 16 GB son suficientes. No se especifican modelos concretos mas alla de la RTX A6000 usada para las mediciones.
- Despliegue mediante `lerobot` 0.4.4 (`pip install "lerobot[dynamixel]==0.4.4"` y `lerobot[smolvla]` para SmolVLA). MoGe debe instalarse desde GitHub (`microsoft/MoGe` y `EasternJournalist/utils3d`) junto con `opencv-python-headless`, `scipy` y `trimesh`.
- Dispositivo configurable con `POLICY_DEVICE` y `DEPTH_DEVICE` (por defecto `cuda`).
- Hardware de robot: brazo OMX con dos camaras y pinza con lectura de corriente; puertos y dispositivos de video configurables por variables de entorno (`ROBOT_PORT`, `TOP_CAM`, `WRIST_CAM`).
- No se proporcionan datos de throughput mas alla de las latencias por prediccion indicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sungah/omx_1031_act_smolvla (ACT) | Politica de imitacion ACT | no disponible | chunk de 100 acciones | Apache 2.0 | Hugging Face, 35 checkpoints |
| Sungah/omx_1031_act_smolvla (SmolVLA) | VLA sobre SmolVLM2-500M | base de 500M en el VLM | chunk de 50 acciones | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | VLA compacto | basado en SmolVLM2-500M-Video-Instruct | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la unica comparacion posible es de latencia y memoria dentro del propio paquete.

## Limitaciones y advertencias

- La tasa de exito real sobre el robot fisico no se ha medido; no hay evidencia publicada de que la politica funcione fuera del entorno de validacion del autor.
- Entrenado con solo 16 demostraciones de un unico entorno, disposicion de estanteria y montaje de camaras; no generaliza a otras configuraciones fisicas.
- Las condiciones de entrenamiento deben replicarse exactamente: 30 fps, posicion y angulo de las camaras, disposicion de estanteria y cajas, y rango de profundidad de 0,69-2,46 m.
- Las variantes que requieren numero de caja (ACT B y E, SmolVLA) no se ejecutan sin la variable `BOX`; el modelo no puede inferir la caja a extraer solo con la imagen.
- Las instrucciones de SmolVLA estan en ingles y limitadas a cuatro plantillas fijas.
- La profundidad se estima con un modelo externo (MoGe-2) y anade dependencia de instalacion desde GitHub, ademas de latencia en los fotogramas de prediccion.
- Riesgo de sobreajuste al conjunto de demostraciones y de fallo ante cambios de iluminacion, posicion de objetos o ruido en la lectura de corriente.
- Aunque la licencia es Apache 2.0, el uso comercial requeriria validacion propia: no hay garantias de robustez ni de seguridad fisica en entornos reales.
- El repositorio incluye scripts de ejecucion que controlan hardware fisico; deben revisarse antes de su uso y limitarse con `max_relative_target=10` como hace el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sungah/omx_1031_act_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/Sungah/omx_1031_JH_v1_success
- Modelo base de SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Modelo de profundidad MoGe-2 ViT-B: https://huggingface.co/Ruicheng/moge-2-vitb-normal
- Repositorio MoGe: https://github.com/microsoft/MoGe
- Utilidades 3D requeridas por MoGe: https://github.com/EasternJournalist/utils3d
- VLM base de SmolVLA: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
