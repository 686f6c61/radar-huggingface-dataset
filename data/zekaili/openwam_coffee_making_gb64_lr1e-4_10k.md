# zekaili/OpenWAM_coffee_making_gb64_lr1e-4_10k

## Resumen

OpenWAM_coffee_making_gb64_lr1e-4_10k es un ajuste fino (fine-tuning) del modelo fundacional OpenWAM-Alpha-Pretrain-Foundation-Model, desarrollado por el usuario zekaili sobre el marco OpenWAM. Se trata de un world-action model (modelo de mundo y accion) orientado a robotica bimanual, entrenado especificamente para la tarea de preparar un cafe con una maquina de capsulas usando el robot Galaxea R1 Lite con brazos A1X. El modelo combina un backbone de video Wan2.2-TI2V-5B con un sistema dual de atencion conjunta que predice acciones de efector final a partir de observaciones multimodales.

El modelo parte de un backbone de difusion de video de 5.000 millones de parametros y anade una cabeza de accion que opera sobre un espacio de 80 dimensiones (action_dim = state_dim = 80). Se ha entrenado durante 10.000 pasos sobre 399 episodios y 258.562 fotogramas a 15 fps, procedentes de cinco sesiones de grabacion del dataset foreact_coffee_making_data, con tres camaras (cabeza, muneca izquierda y muneca derecha). El contrato temporal es de ventanas de 33 fotogramas con chunks de accion de 32 pasos y stride de video 4.

Es relevante ahora porque ejemplifica la tendencia de adaptar modelos generativos de video a la robotica como world models, y porque publica un contrato de accion/estado detallado (cinematica directa, rot6d, normalizacion min-max) que facilita la reproducibilidad. La licencia Apache 2.0 y el formato safetensors lo hacen directamente utilizable, aunque el modelo esta especializado en una unica tarea y morfologia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de video Wan2.2-TI2V-5B con sistema dual de atencion conjunta (joint self-attention) y mascara mutua; world-action model |
| Parametros totales | no disponible (backbone de 5B declarado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana temporal de 33 fotogramas (video stride 4, 9 fotogramas de video); chunk de accion de 32 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_10000.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura parte del backbone de generacion de video Wan2.2-TI2V-5B, sobre el que se construye un sistema dual con atencion conjunta (joint self-attention) y mascara mutua entre las ramas de video y de accion. El espacio de accion y estado es de 80 dimensiones (action_dim = state_dim = 80). La entrada visual es multivista en formato L-shape de 384x320, con tres camaras: `head_left_rgb`, `left_wrist_rgb` y `right_wrist_rgb`. El contrato temporal usa ventanas de 33 fotogramas con stride de video 4 (9 fotogramas efectivos) y predice chunks de 32 pasos de accion.

El entrenamiento se realizo durante 10.000 pasos con AdamW (lr 1e-4, betas 0.9/0.95, weight decay 0.01), scheduler coseno con 5% de warmup, precision bf16 y ZeRO-2. Se emplearon 2 nodos con 8 H100 cada uno, 4 muestras por GPU y batch global de 64, lo que supone aproximadamente 2,5 epocas sobre ventanas deslizantes con todos los buckets agrupados. El dataset de ajuste contiene 399 episodios y 258.562 fotogramas a 15 fps, distribuidos en 5 buckets de grabacion (0422_trimmed, 0423-last38, 0423_trimmed, 0424, 0425). Los estados y acciones nativos de 14 dimensiones (articulaciones HDAS de Galaxea, con pinzas 0..100 donde 100 = abierto) se convierten mediante cinematica directa al layout de efector final de OpenWAM-α: por brazo `[pos(3), rot6d(6), gripper(1)]`, izquierdo en los slots 0:10 y derecho en 34:44, con rot6d definido como las dos primeras columnas de la matriz de rotacion. La normalizacion es min-max a [-1, 1] sobre estado y accion agrupados de los 5 buckets, almacenada en `normalization_stats.npy` bajo el modo de accion `eef`.

## Capacidades

- Prediccion de acciones bimanuales de efector final (20-D) para el robot Galaxea R1 Lite con brazos A1X, a partir de observaciones de tres camaras.
- Modelado conjunto de video y accion (world-action model) con atencion dual y mascara mutua.
- Generacion de chunks de accion de 32 pasos con ventanas de 33 fotogramas.
- Ejecucion de una tarea de manipulacion larga y multi-fase: insertar capsula, colocar vaso, pulsar boton y retirar el vaso.
- Servidor de politica desplegable (`bash scripts/deploy.sh <dir>`) que recibe estado EEF bruto de 20-D y devuelve objetivos EEF brutos de 20-D.
- No se declaran capacidades de tool calling, agentes linguisticos, vision general, audio ni modo thinking; es un modelo puramente robotic o de politica visuomotora.
- Capacidades multilingues: no aplica; la instruccion de texto se usa de forma verbatim y en ingles.

## Casos de uso

- Preparacion automatica de cafe en un banco de robotica: el modelo ejecuta la secuencia completa (capsula, vaso, boton, retirada) sobre el Galaxea R1 Lite, siendo adecuado porque ha sido entrenado exactamente sobre esa tarea y morfologia.
- Investigacion en world-action models: sirve como referencia reproducible de ajuste fino de un backbone de video de 5B a una politica robotica, con contrato de accion documentado y script de despliegue incluido.
- Evaluacion de generalizacion entre sesiones: al agrupar 5 buckets de grabacion distintos, permite estudiar la robustez frente a variaciones de iluminacion, posicion de objetos y dia de captura.
- Desarrollo de pipelines de control bimanual: el servidor de politica devuelve objetivos EEF que se resuelven con IK sobre la misma cadena cinematica, lo que facilita integrarlo en stacks de control existentes del R1 Lite.
- Benchmark de manipulacion de objetos deformables y rigidos: la tarea combina inserccion de capsula, colocacion de vaso y pulsacion de boton, util para medir exito por fases.
- Base para fine-tuning a otras tareas de cocina o manipulacion bimanual: al partir de OpenWAM-Alpha-Pretrain-Foundation-Model y usar un formato de accion estandarizado (eef, rot6d, normalizacion min-max), se puede reutilizar el pipeline de datos y entrenamiento.
- Docencia y prototipado en robotica: el checkpoint final en safetensors y la licencia Apache 2.0 permiten su uso en laboratorios y cursos sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 24,8 GB y el backbone declarado es de 5B parametros, por lo que en bf16 se situaria en torno a 10-12 GB solo para pesos, mas el coste de activaciones y del codificador de video.
- GPU de entrenamiento utilizadas: 2 nodos con 8 H100 cada uno (16 H100 en total), 4 muestras por GPU, batch global 64, bf16 y ZeRO-2.
- GPU recomendadas para inferencia: no disponible; por tamano del backbone, una GPU con 24 GB o mas (RTX 4090, A100, H100) es el escenario razonable, aunque no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere al menos una GPU de 24 GB, pero no hay datos oficiales.
- Opciones de despliegue: servidor de politica propio mediante `bash scripts/deploy.sh <this dir>`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto temporal | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenWAM_coffee_making_gb64_lr1e-4_10k | backbone 5B (total no disponible) | 33 fotogramas / chunk 32 | Politica bimanual para cafe (R1 Lite) | Apache 2.0 | Hugging Face |
| OpenWAM-Alpha-Pretrain-Foundation-Model | no disponible | no disponible | Modelo fundacional world-action | no disponible | Hugging Face (OpenWAM) |
| Wan2.2-TI2V-5B | 5B | no disponible | Generacion de video texto-imagen-video | no disponible | Backbone base |

No se dispone de datos de benchmarks ni de otros modelos de politica comparables en la informacion proporcionada; la comparativa se limita a la relacion de derivacion entre el modelo fundacional y su backbone.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (preparacion de cafe) y una unica morfologia (Galaxea R1 Lite con brazos A1X); no es un modelo generalista.
- El lector de datos (`openwam/dataloader/r1lite.py` y `lerobot_v21_reader.py`, config `coffee_making.yaml`) no forma parte del repositorio upstream de OpenWAM, y las rutas en `config.yaml` son placeholders, lo que complica la reproduccion directa.
- La instruccion de texto debe enviarse verbatim en ingles; no se documenta soporte multilingue ni variacion de instrucciones.
- Riesgo de sobreajuste a los 5 buckets de grabacion (aproximadamente 2,5 epocas); la generalizacion a entornos o posiciones no vistas no esta validada.
- Riesgo de alucinacion en el sentido de predicciones de accion no validas fisicamente; requiere IK y comprobaciones de seguridad en el robot real.
- No se publican sesgos, benchmarks, latencias ni requisitos oficiales de hardware.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset subyacente pueden tener sus propias condiciones que deben verificarse.
- El repositorio ocupa 24,8 GB, lo que implica requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zekaili/OpenWAM_coffee_making_gb64_lr1e-4_10k
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Pretrain-Foundation-Model
- Dataset de ajuste: https://huggingface.co/datasets/zhuoyang20/foreact_coffee_making_data
- Repositorio OpenWAM: https://github.com/OpenWAM-Official/OpenWAM
