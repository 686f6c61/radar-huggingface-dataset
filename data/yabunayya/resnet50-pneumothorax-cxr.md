# Yabunayya/resnet50-pneumothorax-cxr

## Resumen

`Yabunayya/resnet50-pneumothorax-cxr` es un clasificador binario de imagenes de radiografia de torax desarrollado por el usuario de Hugging Face Yabunayya. El modelo distingue entre estudios normales y estudios con neumotorax, partiendo de una ResNet50 preentrenada en ImageNet y ajustada fina sobre la version PNG del dataset SIIM-ACR Pneumothorax (publicado en Kaggle por vbookshelf). Resuelve un problema de cribado: la deteccion temprana de neumotorax en radiografias de torax, una tarea en la que el volumen de estudios desborda la capacidad de lectura radiologica.

Tecnicamente es una CNN convolucional clasica de 23,56 millones de parametros, sin atencion ni componentes transformer, con entrada de 512x512 pixeles en escala de grises replicada a tres canales y normalizacion ImageNet. El repositorio es pequeno (0,2 GB) e incluye pesos en safetensors y una exportacion ONNX que devuelve probabilidad y un mapa de activacion de 16x16.

Su relevancia es acotada y de caracter experimental: se publica como herramienta de investigacion y educacion, no como dispositivo medico, y no cuenta con validacion externa. Resulta util como linea base reproducible para experimentos de clasificacion medica y como ejemplo de pipeline completo (entrenamiento, calibracion de umbral por indice de Youden, exportacion ONNX) sobre un dataset publico de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (CNN, torchvision), cabeza `Dropout(0.3)` + `Linear(2048, 2)` |
| Parametros totales | 23.565.250 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 512x512 px) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento; exportacion ONNX incluida) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), ONNX (`model.onnx`), PyTorch via torchvision |

## Arquitectura y entrenamiento

La arquitectura es una ResNet50 estandar de torchvision, inicializada con pesos de ImageNet y con la capa fully-connected sustituida por una secuencia de dropout (0,3) y una capa lineal de 2048 a 2 clases. La entrada son imagenes de 512x512 en escala de grises convertidas a tres canales y normalizadas con las medias y desviaciones de ImageNet. No hay innovaciones arquitectonicas: es una CNN de convoluciones residuales convencional, lo que facilita su despliegue y su exportacion a ONNX.

El ajuste fino se realizo sobre el dataset SIIM-ACR Pneumothorax en su version PNG, con aumentacion ligera (rotacion de +-10 grados, traslacion del 5 %, escala entre 0,9 y 1,1, variaciones de brillo y contraste), perdida de entropia cruzada ponderada por clase para compensar el desbalance, optimizador AdamW con learning rate de 1e-4 en el backbone y 1e-3 en la cabeza, y un schedule coseno. El checkpoint se selecciono por AUROC sobre una validacion estratificada del 20 % del conjunto de entrenamiento, y el umbral de decision se fijo por indice de Youden sobre esa misma validacion (0,315). No se documentan el numero de tokens ni de imagenes de entrenamiento, ni fases de RLHF o DPO (no aplicables).

## Capacidades

- Clasificacion binaria de radiografias de torax: normal frente a neumotorax, con salida de probabilidad.
- Salida de mapa de activacion de clase (CAM) de 16x16 en la version ONNX, util para inspeccion visual de la region atendida.
- Inferencia sobre imagenes de 512x512 en escala de grises (un canal replicado a tres).
- Exportacion ONNX para despliegue en entornos sin PyTorch.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador de imagen puro.
- No tiene capacidades multilingues, de generacion de texto, de codigo ni de audio.
- No dispone de modo de razonamiento (thinking mode) ni de vision general mas alla de la clasificacion entrenada.

## Casos de uso

- Cribado preliminar en investigacion: procesar lotes de radiografias de torax de un dataset publico y ordenarlas por probabilidad de neumotorax para priorizar la revision por un radiologo en estudios de validacion retrospectivos.
- Linea base para comparativas academicas: servir de referencia CNN frente a arquitecturas mas modernas (ViT, ConvNeXt, EfficientNet) sobre el mismo split de SIIM-ACR, dado que el pipeline de entrenamiento y el umbral estan documentados.
- Docencia en imagen medica: ilustrar el flujo completo de transfer learning, desbalance de clases, seleccion de checkpoint por AUROC y calibracion de umbral por indice de Youden con un modelo de 0,2 GB que cabe en cualquier portatil.
- Prototipado de pipelines ONNX: integrar `model.onnx` en un servicio de inferencia ligero (por ejemplo, con ONNX Runtime) para medir latencia y throughput en CPU antes de escalar a un modelo mayor.
- Analisis de interpretabilidad: usar el mapa `cam` de 16x16 para estudiar si el modelo concentra la activacion en el espacio pleural, con la cautela de que puede estar respondiendo a tubos de drenaje toracico ya presentes.
- Filtrado de datos en curaduria de datasets: descartar o etiquetar de forma automatica estudios con alta probabilidad de neumotorax al construir subconjuntos de entrenamiento, siempre con revision humana posterior.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el test set oficial de la etapa 1 de SIIM-ACR (n = 1372, 290 positivos):

| Umbral | AUROC | Sensibilidad | Especificidad |
|---|---|---|---|
| 0,5 | 0,938 | 82,4 % | 88,8 % |
| 0,315 (Youden, de validacion) | 0,938 | 86,2 % | 86,1 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para una sola imagen de 512x512; el modelo pesa 23,56 millones de parametros (unos 94 MB en FP32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para inferencia individual y solo tienen sentido para procesar lotes grandes.
- Cabe holgadamente en GPU de consumo, incluida una GTX 1650 o una iGPU con soporte CUDA/ROCm; tambien funciona en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch con torchvision (cargando los pesos con `safetensors.torch.load_file`), ONNX Runtime para la version `model.onnx`, y servidores de inferencia genericos compatibles con ONNX. No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yabunayya/resnet50-pneumothorax-cxr | 23,56 M | 512x512, 1 canal | Neumotorax binario | no disponible | Hugging Face (safetensors, ONNX) |
| ResNet50 ImageNet (torchvision) | 25,56 M | 224x224, 3 canales | 1000 clases generales | BSD-3-Clause (torchvision) | torchvision |
| EfficientNet-B0 ImageNet (torchvision) | 5,29 M | 224x224, 3 canales | 1000 clases generales | BSD-3-Clause (torchvision) | torchvision |

No se dispone de datos de benchmarks de alternativas especificas para neumotorax en la informacion proporcionada, por lo que no es posible comparar rendimiento entre modelos de la misma tarea.

## Limitaciones y advertencias

- Uso exclusivamente investigador y educativo: el autor indica explicitamente que no es una herramienta de diagnostico.
- Sesgo de confundido con material clinico: parte de los casos positivos de SIIM incluyen tubos de drenaje toracico ya colocados, y el modelo puede estar reconociendo el tubo en lugar del neumotorax.
- La version PNG del dataset no conserva identificadores de paciente, por lo que no se puede verificar que la separacion entre entrenamiento y validacion sea a nivel de paciente; existe riesgo de fuga de datos.
- Sin validacion externa: no se ha probado en datos de otros hospitales, equipos o protocolos de adquisicion, y el rendimiento puede degradarse fuera de la distribucion de SIIM.
- Calibracion dependiente del umbral: el umbral 0,315 procede de una validacion interna; en otro dominio deberia recalibrarse antes de cualquier uso.
- Licencia no declarada: no hay terminos explicitos para uso comercial, lo que impide asumir permiso de explotacion.
- Riesgo de falsos negativos y falsos positivos clinicamente relevantes (sensibilidad del 86,2 % y especificidad del 86,1 % en el mejor punto): inaceptable como unico criterio de decision.
- Sin datos de cuantizacion ni de rendimiento en produccion; el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yabunayya/resnet50-pneumothorax-cxr
- Dataset SIIM-ACR Pneumothorax (version PNG): https://www.kaggle.com/datasets/vbookshelf/pneumothorax-chest-xray-images-and-masks
- ResNet50 en torchvision: https://pytorch.org/vision/stable/models/resnet.html
- Documentacion de safetensors: https://github.com/huggingface/safetensors
