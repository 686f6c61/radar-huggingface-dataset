# Sungah/omx_act_1029_r50

## Resumen

`Sungah/omx_act_1029_r50` es un conjunto de políticas de control robótico entrenadas con el algoritmo ACT (Action Chunking Transformer) sobre el framework LeRobot 0.4.4. Lo desarrolla la usuaria Sungah y resuelve una tarea de manipulación concreta: coger una caja y depositarla en una cesta blanca, usando un brazo robótico con pinza. El repositorio no contiene un modelo de lenguaje, sino checkpoints de política visomotora que mapean imágenes de cámara y estado articular a comandos de posición de las articulaciones.

La relevancia técnica del repositorio es que publica dos variantes comparables del mismo entrenamiento con una única diferencia: una usa solo las cámaras superior y de muñeca, y la otra añade un mapa de profundidad estimado con MoGe-2 (ViT-L) a partir de la cámara superior. Se incluyen todos los checkpoints intermedios (cada 1000 pasos) de ambas variantes, lo que permite estudiar la evolución del entrenamiento y comparar el efecto de la profundidad monocular en una política ACT con encoder ResNet50 preentrenado en ImageNet.

El repositorio pesa 3,7 GB y está publicado bajo licencia Apache 2.0. No hay métricas de éxito en hardware real publicadas todavía; el autor indica que la evaluación con la demostración reservada (la número 7) y la tasa de éxito física están pendientes de medición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual ResNet50 (pesos ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; chunk de 100 acciones, 50 ejecutadas por defecto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; instrucción de tarea fija en coreano: «상자를 짚어서 흰 바구니 안에 넣는다», introducir la caja en la cesta blanca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer de troceado de acciones: recibe observaciones (imágenes de las cámaras `top` y `wrist`, más un vector de estado de 7 dimensiones compuesto por 6 articulaciones y la corriente de la pinza en mA) y predice un chunk de 100 posiciones objetivo de las 6 articulaciones, de las que se ejecutan 50 por defecto (`--policy.n_action_steps=50`). El encoder visual es ResNet50 inicializado con pesos ImageNet (`weights/resnet50-11ad3fa6.pth` incluido para ejecución sin conexión). La variante MoGe añade una tercera entrada, `top_depth`, un mapa de profundidad en escala de grises generado por MoGe-2 ViT-L, recortado al rango 0,73–1,85 m (percentiles 1 y 99 del conjunto de datos) y replicado en tres canales.

El entrenamiento usa el conjunto de datos `Sungah/omx_1029_Sungah_v1_success`: 7 de las 8 demostraciones (15 006 fotogramas a 30 fps), reservando la demostración 7 para evaluación. Configuración: batch efectivo 256 (8 acumulaciones de 32), 10 000 pasos (unas 170 épocas), AdamW con cosine schedule, lr máximo 4e-5, warmup de 500 pasos, lr mínimo 1e-6, grad clip 10 y aumento de imagen aleatorio (color, nitidez, rotación ±5°, traslación ±5 %). El repositorio publica checkpoints cada 1000 pasos: 9 de la variante sin profundidad (loss 0,207 en 1k → 0,033 en 9k) y 5 de la variante MoGe (0,213 → 0,044 en 5k). A igualdad de paso, las pérdidas de ambas variantes son prácticamente idénticas (1k: 0,207/0,213; 3k: 0,065/0,065; 5k: 0,043/0,044).

## Capacidades

- Control visomotor de un brazo robótico de 6 articulaciones con pinza, a partir de imágenes de cámara y estado articular.
- Predicción de chunks de 100 acciones con ejecución parcial (50 por defecto) para suavizar el control.
- Variante con profundidad monocular estimada (MoGe-2 ViT-L) como canal de entrada adicional.
- Soporte de ensamblado temporal opcional de políticas (`act_ensemble.py`, k-step temporal ensembling).
- Registro de tipos de robot personalizados en LeRobot (`omx_follower_grip`, `omx_follower_grip_depth`) que añaden corriente de pinza al estado y generación de profundidad en tiempo real.
- No soporta tool calling, agentes, razonamiento multi-paso, ni generación de texto o código: es una política de robótica, no un modelo generativo de propósito general.

## Casos de uso

- Recogida y depósito de objetos en un entorno de laboratorio: la política ejecuta la secuencia de aproximación, agarre y colocación de una caja en una cesta blanca a 30 fps, adecuada para experimentos de manipulación con un único brazo.
- Reproducción de experimentos de investigación en imitación: los checkpoints cada 1000 pasos permiten analizar curvas de aprendizaje y el efecto de una modalidad sensorial extra (profundidad) con el resto de variables fijas.
- Base para comparativas de profundidad monocular en políticas ACT: la pareja NODEPTH/MOGE con idéntica configuración sirve como ablación controlada en publicaciones o tesis.
- Punto de partida para fine-tuning en tareas similares de pick-and-place: al estar en formato LeRobot 0.4.4 y con scripts de inferencia incluidos, se puede reentrenar con nuevas demostraciones manteniendo el pipeline.
- Despliegue en un banco de pruebas con GPU: el script `infer.sh` selecciona el checkpoint por número y configura puertos y cámaras por variables de entorno, lo que facilita la integración en un setup físico existente.
- Docencia y formación en robótica de imitación: el repositorio incluye el código de grabación (`omx_record.py`), inferencia y utilidades de profundidad, lo que permite montar una práctica completa de extremo a extremo.
- Evaluación de latencia de percepción: la variante MoGe mide el tiempo medio de generación de profundidad (≈0,1 s por fotograma en RTX A6000), útil para estudiar el desacoplamiento entre percepción y control a 30 fps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. Los únicos datos de rendimiento publicados son:

| Metrica | Valor |
|---|---|
| Loss de entrenamiento, NODEPTH 1k / 9k | 0,207 / 0,033 |
| Loss de entrenamiento, MOGE 1k / 5k | 0,213 / 0,044 |
| Diferencia media depth en tiempo real vs. entrenamiento | 0,9/255 |
| Error de predicción MOGE_5k (reproducción de demo 7) | 2,06 en articulaciones, 0,36 en pinza (unidades LeRobot; 1 ≈ 1,8°) |
| Tiempo de estimación de profundidad MoGe | ≈0,1 s por imagen (RTX A6000) |
| Tasa de éxito en hardware real | no medida (pendiente) |

## Requisitos de hardware

- Inferencia en GPU CUDA obligatoria según el autor («ambos modelos son ResNet50, ejecutar en GPU(cuda)»).
- VRAM estimada: no disponible de forma explícita; por el tamaño del encoder ResNet50 y el transformer ACT, es esperable que quepa en GPUs de consumo, pero no se confirma en la documentación.
- GPU recomendadas: RTX A6000 es la referencia usada por el autor para medir la latencia de MoGe; no se especifican otras.
- Despliegue: scripts propios sobre LeRobot 0.4.4 (`infer.sh`, `inference.sh`), con soporte de variables de entorno `POLICY_DEVICE` y `DEPTH_DEVICE` para elegir GPU.
- Dependencias adicionales para la variante MoGe: `opencv-python-headless`, `scipy`, `trimesh`, `utils3d` y `microsoft/MoGe` instalados desde GitHub (MoGe no está en PyPI); descarga automática de pesos MoGe (~1,3 GB).
- Latencia: la generación de profundidad (≈0,1 s) es más lenta que el periodo de control de 30 fps (33 ms), por lo que la profundidad se calcula de forma asíncrona y puede llegar con varios fotogramas de retraso; el autor advierte que un tiempo medio superior a 0,3 s indica desfase excesivo.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sungah/omx_act_1029_r50 | ACT + ResNet50, con y sin profundidad MoGe | no disponible | chunk de 100 acciones | Apache 2.0 | Hugging Face, LeRobot 0.4.4 |
| Políticas ACT de referencia en LeRobot | ACT + ResNet18/ResNet50 | no disponible | chunk configurable | Apache 2.0 | Repositorio LeRobot |
| Políticas Diffusion Policy | Difusión sobre observaciones visuales | no disponible | horizonte configurable | MIT (repo original) | Repositorios públicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado con solo 7 demostraciones (15 006 fotogramas) de una única tarea; la generalización a otras tareas, objetos o posiciones es muy limitada.
- La tasa de éxito en hardware real no se ha medido; la evaluación con la demostración reservada está pendiente según el autor.
- Requiere reproducir exactamente las condiciones de entrenamiento: nombres de cámara (`top`, `wrist`), 30 fps, posición y ángulo de la cámara superior, y rango de profundidad 0,73–1,85 m.
- La profundidad MoGe se genera de forma asíncrona y puede llegar con retraso; un tiempo de cómputo alto degrada la correspondencia entre percepción y acción.
- El límite de movimiento por paso está fijado en `--robot.max_relative_target=10`; cambiarlo puede alterar el comportamiento respecto al entrenamiento.
- La instrucción de tarea está fijada en coreano y el modelo no procesa lenguaje natural variable: no es un modelo multilingüe ni admite comandos en texto libre.
- Riesgo de sobreajuste a la disposición física del laboratorio; no hay datos sobre sesgos más allá del propio conjunto de demostraciones.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de pesos ResNet50 (ImageNet) y, en la variante MoGe, de pesos MoGe-2 cuyas condiciones deben verificarse por separado.
- No apto para producción sin validación previa en el robot objetivo y sin un estudio de seguridad del espacio de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sungah/omx_act_1029_r50
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Sungah/omx_1029_Sungah_v1_success
- Pesos MoGe-2 ViT-L: https://huggingface.co/Ruicheng/moge-2-vitl-normal
- Repositorio MoGe (Microsoft): https://github.com/microsoft/MoGe
- Utilidades utils3d: https://github.com/EasternJournalist/utils3d
- Framework LeRobot: https://github.com/huggingface/lerobot
