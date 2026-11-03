# Sungah/omx_shoebox_act

## Resumen

OMX Shoebox ACT es un conjunto de políticas de manipulación robótica entrenadas con el algoritmo ACT (Action Chunking Transformer) sobre el framework LeRobot 0.4.4. Lo publica el usuario Sungah en Hugging Face y está orientado a una tarea muy concreta: introducir un zapato dentro de una caja mediante un brazo robótico OMX. El repositorio no contiene un modelo de lenguaje ni un modelo fundacional, sino 60 checkpoints de control motor junto con el código de inferencia y de entrenamiento necesarios para reproducir los experimentos.

El interés del artefacto es metodológico más que de rendimiento: compara el efecto de entrenar con demostraciones de un solo operador frente a mezclar dos operadores (a, b, a+b), y evalúa la incorporación de un canal de profundidad estimada con MoGe-2 ViT-B como entrada adicional del político. Cada checkpoint se guarda a intervalos de 600 pasos y se acompaña de una métrica de validación (L1 sobre 100 pasos de acción) calculada sobre una demostración excluida del entrenamiento, lo que permite analizar la generalización entre operadores.

El tamaño del repositorio (1,3 GB) corresponde a los pesos en safetensors de todos los checkpoints y a las utilidades de ejecución. La licencia es Apache 2.0 y el pipeline declarado es `robotics`; no se declaran idiomas soportados porque no aplica a un modelo de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con codificador visual ResNet18 preentrenado en ImageNet |
| Parametros totales | no disponible (no se publica el recuento; el backbone es ResNet18 más el transformer ACT) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; chunk de acción de 100 pasos y `n_action_steps=50` en inferencia |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`), más scripts `.sh` y `.py` de inferencia y entrenamiento |

## Arquitectura y entrenamiento

El político sigue la receta estándar de ACT: un codificador visual ResNet18 inicializado con pesos de ImageNet procesa las cámaras `top` y `wrist` (y, en las variantes MoGe, también un mapa de profundidad `top_depth`), y un transformer codificador-decodificador genera un chunk de 100 acciones. El estado de entrada tiene 6 dimensiones (5 articulaciones más la posición del gripper). En las variantes con profundidad, el canal `top_depth` se obtiene con MoGe-2 ViT-B (1200 tokens) y se reescala a una imagen en escala de grises con rango 0,79–2,65 m, generada en tiempo real durante la inferencia.

Los datos provienen de dos datasets de demostraciones teleoperadas a 30 fps: `Yuzriha00/shoebox_a` (operador a, 10 demostraciones, 10.787 fotogramas) y `Yuzriha00/shoebox_b` (operador b, 10 demostraciones, 16.086 fotogramas). En cada dataset se reserva una demostración (la número 9) para calcular la pérdida de validación, de modo que el entrenamiento usa 9 demostraciones por operador y 18 en la configuración combinada. El entrenamiento emplea batch 256 (repartido en 32×8), learning rate cosine con máximo 4e-5 (1e-5 para el codificador de imagen), warmup de 100 pasos hasta 1e-6, grad clip 10, aumento de imagen (color, nitidez, rotación ±5°, traslación ±5%) y aproximadamente 95 épocas sobre los datos en todos los regímenes (3.600 pasos para a, 5.400 para b, 9.000 para a+b). No se usa la corriente del gripper como entrada.

La innovación destacable es la integración de profundidad monocular estimada como canal adicional, calculada solo en los fotogramas que el político predice de nuevo (cada 50 pasos, unos 1,7 s a 30 fps), lo que limita el coste a 31–46 ms por imagen en una RTX A6000. También se incluye un script opcional de ensamblado temporal (`act_ensemble.py`) para promediar predicciones en k pasos.

## Capacidades

- Control robótico de manipulación para una tarea específica: introducir un zapato en una caja con un brazo OMX.
- Política de imitación con chunking de acciones (100 pasos por predicción) que reduce la acumulación de error frente a políticas paso a paso.
- Entrada multimodal de dos cámaras RGB (`top`, `wrist`) más estado proprioceptivo de 6 dimensiones.
- Variantes con profundidad monocular estimada (`top_depth` vía MoGe-2 ViT-B) como canal adicional.
- Generalización entre operadores evaluada explícitamente mediante validación cruzada sobre una demostración no vista.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, texto, visión general ni audio: es un modelo de acción, no un modelo de lenguaje.

## Casos de uso

- Investigación en imitación robótica: comparar el efecto de entrenar con un solo demostrador frente a mezclar dos, usando los checkpoints 1–15 y 16–30 y la métrica de validación publicada para cada intervalo de 600 pasos.
- Estudio de la profundidad monocular como señal auxiliar: los checkpoints 31–60 permiten aislar la contribución de `top_depth` manteniendo el resto de la receta constante.
- Reproducción de experimentos de LeRobot 0.4.4: el repositorio incluye `training/make_datasets.sh`, `training/train_act.sh` y `training/tools/val_loss.py` para regenerar datos, reentrenar y recalcular la pérdida de validación.
- Prototipado de pipelines de manipulación pick-and-place: la tarea de meter un zapato en una caja es un banco de pruebas representativo de inserción con tolerancia limitada y se puede adaptar a objetos similares.
- Despliegue en laboratorio con un brazo OMX: `infer.sh` selecciona el checkpoint por número y configura automáticamente el tipo de robot (`omx_follower` o `omx_follower_grip_depth`), con límite de desplazamiento relativo de 10 por paso.
- Evaluación de latencia en tiempo real: las variantes MoGe documentan el coste de la estimación de profundidad por fotograma (31–46 ms en RTX A6000), útil para dimensionar sistemas de control a 30 fps.
- Docencia en robótica de imitación: el conjunto de 60 checkpoints con curvas de validación permite ilustrar sobreajuste, selección de checkpoint y varianza entre operadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la pérdida de validación L1 (unidades normalizadas, menor es mejor) sobre una demostración excluida del entrenamiento, calculada sobre 100 pasos de acción:

| Numero | Modelo | Step | a train | a val | b train | b val |
|---|---|---|---|---|---|---|
| 1 | a | 600 | 0,145 | 0,285 | 1,277 | 0,913 |
| 2 | a | 1200 | 0,102 | **0,282** | 1,238 | 0,894 |
| 3 | a | 1800 | 0,094 | 0,286 | 1,254 | 0,908 |
| 4 | a | 2400 | 0,091 | 0,285 | 1,263 | 0,916 |
| 5 | a | 3000 | 0,089 | 0,286 | 1,256 | 0,913 |
| 6 | a | 3600 | 0,088 | 0,286 | 1,258 | 0,915 |

La model card indica que la tasa de éxito en hardware real está pendiente de registrar ("테스트 후 기록"). No se publican cifras de éxito en robot físico ni comparaciones con otras políticas.

## Requisitos de hardware

- Inferencia sobre GPU CUDA; el autor indica ejecución con `POLICY_DEVICE=cuda:0` y `DEPTH_DEVICE=cuda:0`.
- Las variantes MoGe requieren además ejecutar MoGe-2 ViT-B, con un coste medido de 31–46 ms por imagen en una RTX A6000.
- VRAM estimada: no disponible en la información proporcionada. El repositorio pesa 1,3 GB, pero corresponde a 60 checkpoints, no a un único modelo en memoria.
- GPU recomendadas: no se especifican; la única referencia empírica es la RTX A6000 para el cálculo de profundidad.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el backbone ResNet18 y el transformer ACT son de tamaño reducido, pero no se publican requisitos mínimos.
- Opciones de despliegue: scripts propios `infer.sh` e `inference.sh` sobre LeRobot 0.4.4 con `lerobot[dynamixel]`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un político de control).
- Latencia y throughput: la política predice cada 50 pasos de acción (aproximadamente 1,7 s a 30 fps); el retardo adicional por profundidad se limita a los fotogramas nuevos. No se publican cifras de throughput global.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OMX Shoebox ACT (este) | ACT sobre LeRobot | no disponible | chunk de 100 acciones, 50 en inferencia | 2 RGB + estado 6; opcional profundidad MoGe | Apache 2.0 | Hugging Face, 60 checkpoints |
| ACT original (Zhao et al.) | Action Chunking Transformer | no disponible | chunk configurable | RGB + estado | código de referencia público | Repositorio académico |
| Diffusion Policy | política de difusión | no disponible | horizonte de acción configurable | RGB + estado | MIT (implementación de referencia) | Repositorio académico |
| OpenVLA | VLA basado en LLM | 7B | contexto de lenguaje | RGB + instrucción en texto | licencia del modelo base | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, entradas y licencia.

## Limitaciones y advertencias

- Modelo de un solo task y un solo entorno: entrenado exclusivamente para introducir un zapato en una caja con un brazo OMX; no generaliza a otras tareas sin reentrenamiento.
- Fuerte dependencia de la puesta en escena: fps (30), posición y ángulo de las cámaras `top` y `wrist`, colocación de caja y zapato deben coincidir con el entrenamiento.
- El rango de profundidad (0,79–2,65 m) asume que la cámara está en la misma posición que durante la captura; cambiarla invalida el canal `top_depth`.
- Sesgo entre operadores: la validación muestra que un modelo entrenado solo con el operador a tiene una pérdida L1 mucho mayor sobre las demostraciones de b (0,89–0,92) que sobre las de a (0,28), lo que evidencia un desajuste de estilo de manipulación.
- Sobreajuste temprano: la pérdida de entrenamiento sigue bajando hasta 0,088 mientras la de validación se estanca en torno a 0,282–0,286 desde los 1.200 pasos; el checkpoint de 1.200 pasos es el mejor para el operador a.
- Tasa de éxito en robot real no publicada: no hay evidencia cuantitativa de desempeño físico en la información disponible.
- Sin datos sobre sesgos demográficos ni de otro tipo; al no procesar lenguaje ni imágenes de personas, el riesgo relevante es de fallo mecánico, no de contenido.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de predicciones de acción erróneas cuando la escena se desvía de la distribución de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de las dependencias (LeRobot 0.4.4, MoGe-2, pesos ResNet18 de ImageNet) y de los datasets de demostraciones.
- Dependencia de red en el primer arranque de las variantes MoGe: se descargan los pesos `Ruicheng/moge-2-vitb-normal` desde Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sungah/omx_shoebox_act
- Dataset operador a: https://huggingface.co/datasets/Yuzriha00/shoebox_a
- Dataset operador b: https://huggingface.co/datasets/Yuzriha00/shoebox_b
- Pesos MoGe-2 ViT-B: https://huggingface.co/Ruicheng/moge-2-vitb-normal
- Repositorio MoGe (Microsoft): https://github.com/microsoft/MoGe
- Repositorio utils3d: https://github.com/EasternJournalist/utils3d
- LeRobot: https://github.com/huggingface/lerobot
