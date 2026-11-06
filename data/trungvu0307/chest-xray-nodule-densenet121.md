# trungvu0307/chest-xray-nodule-densenet121

## Resumen

El modelo `chest-xray-nodule-densenet121`, publicado por el usuario trungvu0307 en HuggingFace, es un clasificador binario de imagenes de radiografia de torax entrenado para distinguir entre estudios que muestran un nodulo o masa pulmonar y estudios normales ("No Finding"). Se construye sobre una DenseNet-121 preentrenada en ImageNet y se ajusta finamente sobre un subconjunto de NIH ChestX-ray14, con 44.828 radiografias y un clasificador lineal de una sola salida. El pipeline declarado es `image-classification` y la libreria es PyTorch.

El problema que aborda es la deteccion automatizada de nodulos pulmonares en radiografia simple, una tarea de cribado con alta variabilidad interobservador y en la que los sistemas de aprendizaje profundo pueden servir como segunda lectura. El autor declara un AUC-ROC de 0,812 en un conjunto de test separado por paciente, con una sensibilidad del 90,3% y una especificidad del 45,2% a un umbral de 0,120.

Es relevante como ejemplo reproducible de ajuste fino de un backbone CNN clasico sobre un dataset publico de imagen medica, con evaluacion honesta por paciente y artefactos de explicabilidad (Grad-CAM). No obstante, el propio autor lo restringe a uso educativo y de investigacion, y advierte de que no es un dispositivo medico ni apto para uso clinico. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (torchvision), clasificador lineal de 1 salida |
| Parametros totales | no disponible (DenseNet-121 estandar: ~7,98 M en el backbone; el valor exacto del checkpoint no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagen; sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch con `state_dict` y metadatos) |

## Arquitectura y entrenamiento

La arquitectura es una CNN DenseNet-121 importada de `torchvision`, inicializada con pesos de ImageNet y con la capa `classifier` sustituida por una `nn.Linear` de 1 unidad, de modo que la salida es un unico logit y `sigmoid(logit)` da la probabilidad de nodulo o masa. La entrada se convierte a RGB de 3 canales, se redimensiona a 224x224 y se normaliza con media y desviacion tipica de ImageNet.

El entrenamiento usa 44.828 radiografias de NIH ChestX-ray14: los positivos son todas las imagenes etiquetadas como Nodule o Mass, y los negativos son estudios "No Finding" muestreados a razon de 3 por positivo. El split se hace por paciente en train, validacion y test. La perdida es BCE con `pos_weight` aproximado de 3, optimizador AdamW con lr 3e-5 y weight decay 1e-2, schedule coseno, aumentacion con recortes, rotaciones, desplazamientos y cambios de brillo y contraste, y early stopping sobre AUC de validacion, con el mejor resultado en la epoca 6. El checkpoint almacena `threshold`, `img_size`, `epoch`, `val_auc` y los hiperparametros de entrenamiento. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion binaria de radiografia de torax en dos clases: presencia de nodulo o masa frente a "No Finding".
- Salida de una probabilidad calibrada mediante sigmoid sobre un unico logit.
- Umbral de decision almacenado en el checkpoint (0,120), elegido en validacion para una sensibilidad objetivo del 90%.
- Generacion de mapas de calor Grad-CAM para localizar las regiones que activan la prediccion, segun los tags del repositorio.
- Integracion directa en pipelines PyTorch mediante `torch.load` y `torchvision.models`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de imagen puro.
- No dispone de modo "thinking", vision general, audio ni generacion de texto.

## Casos de uso

- Cribado asistido en investigacion: usar el modelo como segunda lectura sobre un lote de radiografias para priorizar estudios sospechosos antes de la revision radiologica, ajustando el umbral segun la sensibilidad requerida por el estudio.
- Generacion de datasets etiquetados: aplicar el clasificador a grandes volumenes de radiografias para preetiquetar candidatos a nodulo y reducir el trabajo manual de anotacion, siempre con revision humana posterior.
- Docencia en imagen medica: emplear los mapas Grad-CAM para ilustrar que regiones de la radiografia activan la prediccion y discutir limitaciones de los modelos CNN en radiologia.
- Reproduccion de experimentos: servir como linea base reproducible de ajuste fino de DenseNet-121 sobre ChestX-ray14 para comparar con arquitecturas mas recientes (ViT, ConvNeXt, EfficientNet).
- Prototipado de sistemas de triaje: integrar el modelo en un servicio de inferencia por lotes para estimar la carga de trabajo y el coste computacional de un cribado a escala antes de invertir en un modelo validado externamente.
- Analisis de sensibilidad y umbral: utilizar el checkpoint (que incluye `threshold` y `val_auc`) para estudiar el compromiso sensibilidad/especificidad en distintos entornos y decidir el punto de operacion.
- Evaluacion de robustez: probar el modelo frente a radiografias AP/portatiles, donde el autor reporta un AUC inferior (0,773), para cuantificar la degradacion antes de cualquier uso serio.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test (6.966 radiografias de 2.917 pacientes no vistos en entrenamiento ni seleccion, intervalos de confianza al 95% por bootstrap a nivel de paciente):

| Metrica | Valor | IC 95% |
|---|---|---|
| AUC-ROC | 0,812 | 0,794 – 0,827 |
| Sensibilidad (umbral 0,120) | 90,3% | 88,1 – 91,9 |
| Especificidad (umbral 0,120) | 45,2% | 43,2 – 47,2 |

Desgloses adicionales aportados por el autor: sensibilidad del 86,8% para nodulos aislados y AUC de 0,773 en radiografias AP/portatiles. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 0,5–1 GB en FP32 para DenseNet-121 a 224x224 con batch pequeno; no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna (GTX 1050 Ti o superior, RTX 3050/4060, etc.).
- Opciones de despliegue: PyTorch nativo, TorchServe, ONNX Runtime tras exportacion, o un servicio FastAPI con `torch.load`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | AUC-ROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chest-xray-nodule-densenet121 | DenseNet-121 | no disponible (backbone ~7,98 M) | 224x224 px | 0,812 (test propio) | no disponible | HuggingFace, 0 descargas |
| CheXNet (Rajpurkar et al., 2017) | DenseNet-121 | ~7 M | 224x224 px | 0,768 media en 14 patologias (referencia publica) | codigo abierto, pesos no siempre publicos | paper y repositorios de terceros |
| TorchXRayVision (baseline DenseNet-121) | DenseNet-121 | ~7 M | 224x224 px | variable por patologia | licencia del proyecto (Apache-2.0 en el codigo) | paquete `torchxrayvision` |
| Modelos ViT/ConvNeXt ajustados a ChestX-ray14 | Transformer/CNN moderno | 20–300 M | 224–384 px | no disponible en esta busqueda | variable | HuggingFace y repositorios academicos |

La comparacion es orientativa: los valores de CheXNet y TorchXRayVision provienen de sus publicaciones y no de una evaluacion comun, por lo que no son directamente comparables con el test del modelo descrito.

## Limitaciones y advertencias

- Etiquetas ruidosas: proceden de minado de texto de informes radiologicos, con errores de extraccion inherentes.
- Negativos solo "No Finding": el modelo nunca vio radiografias con otras patologias sin nodulo, por lo que probablemente marcara como sospechosas muchas de ellas y disparara falsos positivos en poblaciones con comorbilidades.
- Rendimiento desigual: sensibilidad del 86,8% en nodulos aislados y AUC de 0,773 en AP/portatiles, inferior al global.
- Fuente unica: un solo hospital (NIH Clinical Center) y sin validacion externa, lo que limita la generalizacion a otras instituciones y equipos.
- Licencia no disponible: no se puede confirmar el uso comercial; el autor restringe explicitamente a investigacion y educacion.
- No es un dispositivo medico: no debe usarse para decision clinica, diagnostico ni triaje real sin validacion regulatoria.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos: con especificidad del 45,2% al umbral operativo, mas de la mitad de los estudios sanos se marcan como sospechosos.
- Repositorio sin traccion: 0 descargas y 0 likes, por lo que no hay evidencia de uso o validacion por terceros.
- Sin informacion sobre sesgos demograficos (edad, sexo, etnia) ni sobre calibracion por subgrupos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trungvu0307/chest-xray-nodule-densenet121
- Codigo, notebooks de entrenamiento y evaluacion: https://github.com/vutr2/chest-xray-nodule-classifier
- Paper de NIH ChestX-ray14 (Wang et al., CVPR 2017): https://arxiv.org/abs/1705.02315
- Referencia CheXNet (Rajpurkar et al., 2017): https://arxiv.org/abs/1711.05225
- Proyecto TorchXRayVision: https://github.com/mlmed/torchxrayvision
