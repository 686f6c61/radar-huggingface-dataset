# Sungah/omx_1029_r18_smolvla

## Resumen

OMX 1029 r18 SmolVLA es un paquete de políticas de robótica manipulativa entrenado con LeRobot 0.4.4 sobre un dataset propio de 7 demostraciones teleoperadas (15.006 fotogramas a 30 fps) para una tarea concreta: apilar y desplazar cajas hasta depositarlas en una cesta blanca. El repositorio agrupa 16 checkpoints de dos familias distintas: 11 modelos ACT con backbone ResNet18 (algunos con entrada de profundidad estimada mediante MoGe-2 y otros con codificación one-hot de la fase de la tarea) y 5 modelos SmolVLA afinados desde `lerobot/smolvla_base` que reciben una frase de instrucción distinta en cada una de las cinco fases del episodio. No es un modelo de lenguaje generalista ni un VLM conversacional: es un conjunto de controladores visuomotores de extremo a extremo que mapean imágenes de cámara, estado articular y (opcionalmente) profundidad a comandos de acción.

La relevancia técnica está en cómo el autor descompone una tarea de horizonte largo en cinco subtareas delimitadas por eventos del gripper (dos cierres y dos aperturas) y en cómo explota esa segmentación de dos maneras: inyectando la fase como variable adicional en el vector de estado de ACT o cambiando la instrucción en lenguaje natural que consume SmolVLA. Además, incorpora profundidad monocular estimada en tiempo real con MoGe-2 como cuarto canal de entrada, lo que añade información 3D sin sensor de profundidad físico.

El paquete incluye el código de inferencia completo (`infer.sh`, scripts de LeRobot, clases de robot extendidas) y está publicado con licencia Apache 2.0. Las métricas de éxito en el robot real no se han medido todavía según la propia model card; solo existen validaciones en reproducción offline sobre la demostración excluida del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Transformer con encoder ResNet18) y SmolVLA (VLM SmolVLM2-500M con action expert) |
| Parametros totales | no disponible (repo de 6,9 GB con 16 checkpoints; SmolVLA parte de SmolVLM2-500M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk de acciones de 100 pasos en ACT y 50 en SmolVLA) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (las instrucciones de SmolVLA están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot 0.4.4) |

## Arquitectura y entrenamiento

Los modelos ACT (números 1 a 11) usan un Transformer de política con encoder visual ResNet18 inicializado con pesos ImageNet. La entrada combina la cámara superior, la cámara de muñeca y, en los modelos con MoGe, un mapa de profundidad estimado de 0,73 a 1,85 m generado en tiempo real por `Ruicheng/moge-2-vitl-normal`. El estado tiene 7 dimensiones (6 articulaciones más corriente del gripper en mA); el modelo número 11 añade 5 dimensiones one-hot con la fase activa, resultando en un estado de 12 dimensiones. Se entrenaron con batch 256 (32×8), 2.000 pasos, learning rate cosine con máximo 4e-5 (1e-5 en el encoder visual), warmup de 100 pasos, chunk de 100 acciones, aumento de imagen (color, nitidez, rotación ±5°, traslación ±5 %) y grad clip de 10.

Los modelos SmolVLA (números 12 a 16) parten de `lerobot/smolvla_base` y se afinan con batch 256 (128×2) hasta 1.000, 800, 600, 400 y 200 pasos respectivamente, con el learning rate por defecto (máximo 1e-4, cosine, reescalado automático), chunk de 50 y el encoder visual congelado, entrenando únicamente el action expert. La innovación metodológica es la segmentación en cinco fases mediante detección de eventos del gripper (cierre por debajo de 55 durante más de 0,5 s, apertura por encima de 56,5 durante más de 0,5 s), con un mínimo de 4 s por fase para evitar saltos por ruido; al cambiar de fase se descartan las acciones restantes y se re-predice con la nueva condición.

## Capacidades

- Control visuomotor de manipulacion robotica de extremo a extremo a partir de imagenes de dos camaras (superior y muneca).
- Percepcion de profundidad monocular integrada mediante MoGe-2, usada como canal adicional de entrada en los modelos ACT 1-11.
- Condicionamiento por fase de tarea: one-hot en el estado (modelo 11) o instruccion en lenguaje natural por fase (modelos 12-16).
- Seguimiento automatico de fase en tiempo de ejecucion a partir de las senales de gripper predichas, con reinicio de la prediccion al cambiar de fase.
- Soporte de arranque en una fase intermedia mediante la variable de entorno `PHASE_START`.
- Seleccion de dispositivo GPU independiente para politica y estimacion de profundidad (`POLICY_DEVICE`, `DEPTH_DEVICE`).
- Temporal ensembling opcional para ACT (`act_ensemble.py`).
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni razonamiento en lenguaje natural fuera de las instrucciones fijas de fase.

## Casos de uso

- Manipulacion de apilado y trasvase en entorno controlado: el paquete resuelve una secuencia concreta de coger la caja superior, apartarla, coger la restante y depositarla en una cesta; es adecuado como referencia reproducible de una tarea de horizonte largo segmentada en fases.
- Evaluacion comparativa ACT frente a SmolVLA: al incluir ambas familias sobre el mismo dataset y la misma tarea, permite medir en igualdad de condiciones el efecto de condicionar por one-hot frente a condicionar por lenguaje, y el efecto de anadir profundidad.
- Investigacion en condicionamiento por instrucciones en robotica: los checkpoints 12-16 permiten estudiar como varia el comportamiento al sustituir la frase de fase, con cinco presupuestos de entrenamiento distintos (200 a 1.000 pasos).
- Estudio de profundidad monocular como señal auxiliar: los modelos 1-10 permiten aislar la contribucion de MoGe-2 frente a los que no la usan, con latencia medida de 0,1-0,17 s por fotograma en RTX A6000.
- Reproduccion offline de politicas sin robot: el propio autor valida la ejecucion reproduciendo la demostracion 7 (excluida del entrenamiento) con sus valores articulares, lo que sirve como banco de pruebas de pipelines LeRobot.
- Base para fine-tuning en tareas de picking similares: la receta (ResNet18 + estado de 7 dimensiones + chunk de 100, 2.000 pasos, batch 256) es reutilizable en brazos de 6 ejes con gripper de corriente.
- Docencia y prototipado en laboratorio: el repositorio incluye scripts de ejecucion, clases de robot extendidas y pesos de ResNet18 para funcionar sin conexion, lo que simplifica el despliegue en entornos sin acceso a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son validaciones offline sobre la demostracion 7, excluida del entrenamiento, reproduciendo video y valores articulares en lugar de ejecutar el robot:

| Modelo | Metrica | Resultado |
|---|---|---|
| 5 (ACT + MoGe, 1000 pasos) | Error de prediccion de accion, articulaciones | 1,67 (unidades LeRobot; 1 unidad ≈ 1,8°) |
| 5 (ACT + MoGe, 1000 pasos) | Error de prediccion de accion, gripper | 0,48 (unidades LeRobot) |
| 15 (SmolVLA, 400 pasos) | Fotogramas de transicion de fase predichos | 488 / 953 / 1451 |
| 15 (SmolVLA, 400 pasos) | Fotogramas de transicion de fase etiquetados en la demostracion | 567 / 875 / 1414 |

La tasa de exito en robot real no se ha medido segun la model card.

## Requisitos de hardware

- Inferencia en GPU CUDA obligatoria segun los scripts incluidos; no se documenta ruta CPU.
- El repositorio ocupa 6,9 GB, pero solo se carga el checkpoint seleccionado; el peso por checkpoint no se detalla en la informacion disponible.
- MoGe-2 (`Ruicheng/moge-2-vitl-normal`) anade aproximadamente 1,3 GB de pesos y se ejecuta en paralelo a la politica; latencia medida de 0,1-0,17 s por imagen en RTX A6000.
- SmolVLA descarga `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` en la primera ejecucion, lo que requiere conexion a Internet.
- VRAM estimada: no disponible. Por el tamano del backbone (ResNet18 en ACT, 500M en SmolVLA) y el chunk corto, es plausible que quepa en GPU de consumo, pero el autor no publica medidas.
- GPUs mencionadas en la documentacion: RTX A6000 (para la estimacion de profundidad). No se listan A100, H100 ni RTX 4090.
- Despliegue mediante LeRobot 0.4.4 (`pip install "lerobot[dynamixel]==0.4.4"` y `lerobot[smolvla]`), con scripts `infer.sh`, `inference.sh` e `inference_smolvla.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Duracion de un episodio completo: aproximadamente 70 s, con recomendacion de `--dataset.episode_time_s=100`.
- Throughput y latencia de la politica: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Parametros | Contexto / chunk | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OMX 1029 r18 SmolVLA (ACT) | ACT + ResNet18 | no disponible | chunk 100 | 2 camaras + estado 7 (o 12 con fase) + profundidad opcional | Apache 2.0 | Hugging Face, repo 6,9 GB |
| OMX 1029 r18 SmolVLA (SmolVLA) | SmolVLA sobre SmolVLM2-500M | 500M (backbone) | chunk 50 | 2 camaras + estado 7 + instruccion por fase | Apache 2.0 | Hugging Face |
| LeRobot ACT (referencia) | ACT | no disponible | configurable | camaras + estado | Apache 2.0 | LeRobot |
| LeRobot SmolVLA base | SmolVLA | 500M (backbone) | configurable | camaras + estado + instruccion | Apache 2.0 | Hugging Face (`lerobot/smolvla_base`) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion se limita a arquitectura, entradas y licencia.

## Limitaciones y advertencias

- Tarea unica y altamente especializada: solo se ha entrenado para apilar y trasvasar cajas en una configuracion concreta; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Dependencia estricta de la puesta en escena: fps de 30, posiciones y angulos de camara, colocacion de cajas y rango de profundidad de 0,73 a 1,85 m deben coincidir con el entrenamiento.
- Dataset muy pequeno: 7 demostraciones y 15.006 fotogramas, todos del mismo operador y misma posicion; riesgo alto de sobreajuste y de sesgo hacia esa trayectoria.
- Sin medicion de exito en robot real: la model card indica explicitamente que la tasa de exito fisica esta pendiente de medir.
- La validacion offline del modelo 15 muestra desviaciones de hasta 79 fotogramas en las transiciones de fase respecto a las etiquetas, lo que sugiere imprecision en el cambio de fase.
- La deteccion de fase depende de umbrales heuristicos sobre la corriente del gripper (55 y 56,5 con 0,5 s de persistencia) y de un minimo de 4 s por fase; cambios de hardware o de calibracion del gripper pueden romper la logica.
- La profundidad es estimada, no medida: errores de MoGe-2 en superficies reflectantes o con poca textura pueden degradar la politica.
- Latencia adicional de 0,1-0,17 s por fotograma en la estimacion de profundidad, que puede afectar al control en tiempo real.
- Idiomas: las instrucciones de SmolVLA estan en ingles y no se documenta soporte multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de pesos de terceros (`Ruicheng/moge-2-vitl-normal`, `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`, ResNet18 ImageNet) cuyas condiciones deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sungah/omx_1029_r18_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/Sungah/omx_1029_Sungah_v1_success
- SmolVLA base: https://huggingface.co/lerobot/smolvla_base
- Backbone de SmolVLA: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- MoGe-2 (estimacion de profundidad): https://huggingface.co/Ruicheng/moge-2-vitl-normal
- Repositorio MoGe: https://github.com/microsoft/MoGe
- Repositorio utils3d: https://github.com/EasternJournalist/utils3d.git
- LeRobot (libreria): https://github.com/huggingface/lerobot
