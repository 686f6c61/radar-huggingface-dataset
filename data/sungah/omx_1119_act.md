# Sungah/omx_1119_act

## Resumen

OMX ACT es una política de imitación para robótica manipulativa entrenada con el algoritmo ACT (Action Chunking Transformer) sobre el framework LeRobot 0.4.4. El modelo ejecuta una tarea concreta: coger una caja situada encima de un robot Pinky y colocarla en la misma posición de la segunda estantería de una balda. Lo publica el usuario Sungah junto con el código de inferencia y los scripts de entrenamiento completos.

El repositorio contiene 16 checkpoints organizados en dos variantes. La serie P0 (8 checkpoints, de 500 a 4000 pasos) usa como entrada las cámaras `top` y `wrist` más un vector de estado de 6 dimensiones (5 articulaciones y posición del gripper). La serie P1 (8 checkpoints) añade un mapa de profundidad estimado con MoGe-2 ViT-B a partir de la cámara superior y un valor de corriente del gripper en el estado (7 dimensiones), lo que permite detectar si el objeto ha sido agarrado.

El modelo es relevante como ejemplo reproducible de pipeline completo de aprendizaje por imitación en robótica de bajo coste: dataset público de 10 demostraciones, código de entrenamiento, cálculo de val loss y ejecución en robot real, todo bajo licencia Apache 2.0. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet18 preentrenado en ImageNet |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; chunk de acción de 100 pasos, `n_action_steps=50` |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot 0.4.4) |

## Arquitectura y entrenamiento

ACT es un transformer de chunking de acciones: en cada inferencia predice un bloque de 100 acciones futuras y ejecuta las primeras 50 (`n_action_steps=50`), lo que reduce la acumulación de error y permite control a 30 fps. El backbone visual es un ResNet18 inicializado con pesos ImageNet (`weights/resnet18-f37072fd.pth`). La variante P1 añade un canal de profundidad generado en tiempo real con MoGe-2 ViT-B (1200 tokens), normalizado al rango 0,87–2,68 m y convertido a imagen en escala de grises, además de la corriente del gripper como séptima dimensión del estado.

El entrenamiento usa el dataset `Sungah/omx_1119_sakim_success`: 10 demostraciones, 11.936 frames a 30 fps, cámaras `top` y `wrist`. La demostración 0 se reserva para validación y las 9 restantes (10.741 frames) para entrenamiento. Configuración: batch 256 (32×8), 4000 pasos (unas 95 épocas sobre los datos), learning rate cosine con máximo 4e-5 (1e-5 para el encoder visual), warmup de 100 pasos hasta 1e-6, grad clip 10, augmentación de imagen (color, nitidez, rotación, traslación) y guardado cada 500 pasos. Loss final de entrenamiento: 0,066 (P0) y 0,063 (P1).

## Capacidades

- Control robótico de manipulación: agarre de caja y colocación en estantería a partir de observaciones visuales y proprioceptivas.
- Política visomotora con dos cámaras (vista superior y muñeca) y estado articular de 6 dimensiones.
- Variante P1 con estimación de profundidad monocular (MoGe-2 ViT-B) integrada en el bucle de inferencia.
- Detección implícita de agarre mediante corriente del gripper en la variante P1.
- Ejecución a 30 fps con chunking de acciones (predicción cada 50 frames, aproximadamente 1,7 s).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No procesa instrucciones en lenguaje natural; la tarea está fijada por el entrenamiento.

## Casos de uso

- Reproducción de investigación en imitación robótica: el repositorio incluye dataset, scripts de creación de datos, entrenamiento, cálculo de val loss e inferencia, lo que permite replicar el pipeline completo en LeRobot 0.4.4 y comparar variantes P0 y P1.
- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de coger una caja y depositarla en una balda, útil como baseline para tareas de ensamblaje o logística de laboratorio con robot de bajo coste.
- Estudio de fusión multimodal en políticas visomotoras: la comparación P0 (RGB + estado) frente a P1 (RGB + profundidad + corriente) permite medir la contribución de cada modalidad con el mismo protocolo de validación.
- Prototipado de control con corriente de gripper: la variante P1 demuestra cómo integrar señales de fuerza en el estado de la política para detectar contacto, aplicable a tareas de agarre delicado.
- Evaluación de robustez ante variaciones de iluminación y posición: la augmentación de imagen durante el entrenamiento y el conjunto de validación reservado permiten analizar generalización con pocas demostraciones.
- Base para fine-tuning en tareas similares: al estar bajo Apache 2.0 y con pesos safetensors en LeRobot, se puede reentrenar con un dataset propio de pocas demostraciones para otras tareas de manipulación.
- Docencia en robótica de imitación: ejemplo completo y ejecutable de ACT con requisitos de hardware modestos y documentación de cada fase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. El autor publica val loss L1 sobre la demostración 0 (no usada en entrenamiento), con predicción de 100 pasos:

| Nº | Modelo | Step | Loss en demostraciones de train (media 1·5·9) | Val (demo 0) |
|---|---|---|---|---|
| 1 | P0 base | 500 | 0,128 | 0,312 |
| 2 | P0 base | 1000 | 0,101 | 0,318 |
| 3 | P0 base | 1500 | 0,097 | 0,324 |
| 4 | P0 base | 2000 | 0,094 | 0,327 |
| 5 | P0 base | 2500 | 0,087 | 0,333 |
| 6 | P0 base | 3000 | 0,085 | 0,331 |
| 7 | P0 base | 3500 | 0,084 | 0,328 |
| 8 | P0 base | 4000 | 0,084 | 0,331 |
| 9 | P1 corriente + MoGe | 500 | 0,119 | 0,305 |
| 10 | P1 corriente + MoGe | 1000 | 0,114 | 0,312 |
| 11 | P1 corriente + MoGe | 1500 | 0,104 | 0,317 |
| 12 | P1 corriente + MoGe | 2000 | 0,096 | 0,318 |
| 13 | P1 corriente + MoGe | 2500 | 0,090 | 0,310 |
| 14 | P1 corriente + MoGe | 3000 | 0,087 | 0,318 |
| 15 | P1 corriente + MoGe | 3500 | 0,085 | 0,317 |
| 16 | P1 corriente + MoGe | 4000 | 0,085 | 0,317 |

Observaciones del autor: el loss de entrenamiento baja de forma monótona, pero el val se mantiene en 0,30–0,33, lo que indica poca generalización con solo 9 demostraciones. P1 obtiene un val entre 0,006 y 0,023 menor que P0 en todos los pasos. La tasa de éxito en robot físico está pendiente de registrar ("(테스트 후 기록)").

## Requisitos de hardware

- GPU con CUDA obligatoria para inferencia (`POLICY_DEVICE=cuda:0`); el autor no documenta requisitos mínimos de VRAM.
- La estimación de profundidad MoGe-2 ViT-B tarda aproximadamente 31–46 ms por imagen en una RTX A6000, y solo se ejecuta en los frames que la política predice de nuevo (cada 50 frames, unos 1,7 s), por lo que la penalización de latencia es pequeña.
- P0 (sin MoGe) no requiere GPU para profundidad, pero sí para la política. No se especifica si cabe en GPUs de consumo; el tamaño del repo es de 3,4 GB e incluye los 16 checkpoints, el código y los pesos de ResNet18.
- Despliegue mediante LeRobot 0.4.4 (`pip install "lerobot[dynamixel]==0.4.4"`) más `opencv-python-headless`, `scipy`, `trimesh`, `utils3d` y `MoGe` para la variante P1.
- Ejecución: `./infer.sh <número>` con descarga previa del repo vía `hf download` y permisos de ejecución restaurados con `chmod +x`.
- Configuración de hardware: robot OMX con puerto serie (`ROBOT_PORT`, por defecto `/dev/ttyACM1`) y dos cámaras (`TOP_CAM`, `WRIST_CAM`), con `--robot.max_relative_target=10` limitando el desplazamiento por paso.
- Latencia y throughput globales no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entradas | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sungah/omx_1119_act | ACT + ResNet18 (+ MoGe-2 en P1) | RGB top + wrist, estado 6/7 dim | chunk 100, 50 acciones ejecutadas | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (Zhao et al., 2023) | Action Chunking Transformer | RGB + estado | chunk configurable | MIT (repositorio original) | Repositorio público |
| Políticas LeRobot de referencia (p. ej. Diffusion Policy) | Diffusion Policy | RGB + estado | horizonte configurable | Apache 2.0 | Integradas en LeRobot |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a arquitectura, entradas y licencia.

## Limitaciones y advertencias

- Generalización limitada: con solo 9 demostraciones de entrenamiento, el val loss se estanca en 0,30–0,33 y el autor recomienda validar en robot físico antes de cualquier uso.
- Condiciones de ejecución rígidas: fps (30), posición y ángulo de ambas cámaras, disposición de Pinky y estantería, y postura inicial (articulaciones ≈ [39, −65, 31, 34, −1], gripper 60) deben coincidir con las del entrenamiento.
- El rango de profundidad (0,87–2,68 m) asume que la cámara superior está en la misma posición que durante la recogida de datos.
- La demostración 0 usada para validación tiene un agarre más débil (corriente mínima −129 frente a menos de −150 en el resto), lo que puede inflar el val loss y no refleja necesariamente un fallo del modelo.
- Tasa de éxito en hardware real no publicada; no hay evidencia cuantitativa de funcionamiento fuera del conjunto de validación.
- Sesgos conocidos: no documentados; al ser un modelo entrenado con un dataset muy pequeño y un único entorno, hereda cualquier sesgo de las demostraciones (posiciones, iluminación, objetos).
- Riesgo de alucinación en el sentido de acciones no válidas fuera de distribución: la política puede generar trayectorias incorrectas ante objetos o configuraciones no vistas.
- Sin capacidades de lenguaje, tool calling ni agentes; no debe presentarse como un modelo de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento en un robot real recae en el implementador; el repositorio incluye código de ejecución que controla hardware físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sungah/omx_1119_act
- Dataset de entrenamiento: https://huggingface.co/datasets/Sungah/omx_1119_sakim_success
- Pesos MoGe-2 ViT-B: https://huggingface.co/Ruicheng/moge-2-vitb-normal
- Repositorio MoGe: https://github.com/microsoft/MoGe
- Repositorio utils3d: https://github.com/EasternJournalist/utils3d
- LeRobot (framework): https://github.com/huggingface/lerobot
