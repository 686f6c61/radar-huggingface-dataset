# Surojit-Utah/adasemseg-simclr-encoder

## Resumen

AdaSemSeg SimCLR Encoder es un codificador de imagenes basado en ResNet-50 preentrenado con aprendizaje contrastivo auto-supervisado SimCLR sobre datos sismicos no etiquetados. Lo desarrollan Surojit Saha y Ross Whitaker, de la Universidad de Utah, como parte del trabajo publicado en IEEE Transactions on Geoscience and Remote Sensing (2025) bajo el titulo "AdaSemSeg: An Adaptive Few-shot Semantic Segmentation of Seismic Facies" (arXiv:2501.16760).

El modelo resuelve un problema critico en geofisica: la escasez de volumenes sismicos completamente anotados, que hace inviable el preentrenamiento supervisado clasico (no existe un "ImageNet" para datos sismicos). Este encoder aprende representaciones del dominio sismico a partir de datos no etiquetados y sirve como inicializacion intercambiable para cualquier arquitectura de segmentacion basada en ResNet, no solo para el DGPNet de AdaSemSeg.

La relevancia actual radica en que ofrece un checkpoint de preentrenamiento listo para usar en segmentacion semantica few-shot de facies sismicas, un ambito con muy pocos recursos publicados. El modelo se entreno con 35.648 parches extraidos de tres conjuntos de datos publicos (F3, Parihaka y Penobscot) y alcanza un 93,75% de precision top-1 en la tarea de preentrenamiento contrastivo. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (torchvision, sin modificaciones) |
| Parametros totales | 25,6 millones (estimado, ResNet-50 estandar; no se indica en la documentacion) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no textual) |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint en FP32) |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (archivo .pth.tar) |

## Arquitectura y entrenamiento

La arquitectura es un ResNet-50 estandar de torchvision, sin modificaciones en el stem convolucional ni en los canales. La entrada es una imagen sismica de un solo canal, normalizada min-max a [0, 255] y replicada a 3 canales para seguir la convencion de entrada de ImageNet. El modelo es agnóstico a la resolucion (totalmente convolucional hasta el global average pooling) y se preentreno con parches de 256×256 píxeles.

El entrenamiento sigue el paradigma SimCLR (Chen et al., 2020, arXiv:2002.05709): aprendizaje contrastivo de discriminacion de instancias con dos vistas aumentadas por muestra. Se usaron 35.648 parches extraidos de los conjuntos publicos F3 (Paises Bajos), Parihaka (Nueva Zelanda) y Penobscot (Canada), muestreados tanto en direccion inline como crossline. Los hiperparametros incluyen batch size de 32, optimizador Adam con learning rate 3e-4, weight decay 1e-4, temperatura τ=0.07 y 10 epocas. Las aumentaciones aplicadas por vista incluyen rotacion aleatoria (±20°), volteo horizontal, desenfoque gaussiano, ruido gaussiano, recorte aleatorio redimensionado, brillo y contraste. El checkpoint almacena el wrapper completo de SimCLR (backbone + cabeza de proyeccion), por lo que las claves del state_dict llevan el prefijo "backbone." y la cabeza de proyeccion debe descartarse al cargar.

## Capacidades

- Extraccion de representaciones visuales especificas del dominio sismico (facies sismicas) a partir de amplitudes de reflexion.
- Inicializacion de codificadores para segmentacion semantica few-shot de facies sismicas en arquitecturas encoder-decoder basadas en ResNet (U-Net, DeepLab, FPN, segmentation_models_pytorch).
- Generalizacion a conjuntos de datos sismicos no vistos gracias al preentrenamiento contrastivo en multiples datasets publicos.
- Soporte de resolucion variable (totalmente convolucional hasta el pooling global).
- No soporta generacion de texto, tool calling, agentes, vision generalista ni capacidades multimodales: es un extractor de caracteristicas puro.

## Casos de uso

- Interpretacion sismica asistida: el encoder puede inicializar modelos de segmentacion para delinear facies sismicas en volumenes 3D, reduciendo la necesidad de anotaciones manuales por parte de geologos e interpretes.
- Exploracion de hidrocarburos: aplicable a la caracterizacion de yacimientos mediante la identificacion automatica de unidades geologicas en datos sismicos 2D y 3D, con pocos ejemplos etiquetados por pozo o por linea sismica.
- Segmentacion few-shot en nuevos yacimientos: dado que los conjuntos de datos sismicos varian en adquisicion y geologia, el modelo permite adaptarse a una nueva area con solo unas pocas anotaciones, gracias a la inicializacion con representaciones del dominio.
- Investigacion en geociencias: util como punto de partida para estudios academicos sobre aprendizaje auto-supervisado en datos geofisicos, o como baseline comparativo en experimentos de segmentacion sismica.
- Transferencia a otras tareas geofisicas: el codificador puede adaptarse con fine-tuning a tareas relacionadas como deteccion de fallas, clasificacion de atributos sismicos o estimacion de propiedades del subsuelo.
- Pipeline de etiquetado semi-automatico: integrable en flujos de trabajo donde un modelo segmenta propuestas iniciales y un interprete humano las corrige, acelerando la generacion de volumenes anotados de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de vision para un dominio especifico. El unico dato de rendimiento reportado es la precision en la tarea de preentrenamiento contrastivo (discriminacion de instancias):

| Tarea | Precision |
|---|---|
| Top-1 (tarea contrastiva de preentrenamiento) | 93,75% |
| Top-5 (tarea contrastiva de preentrenamiento) | 98,44% |

El paper de AdaSemSeg (arXiv:2501.16760) reporta resultados cuantitativos de segmentacion few-shot comparando AdaSemSeg, ProtoSemSeg y Baseline-2, todos inicializados con este encoder, pero esos numeros no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- Inferencia: al ser un ResNet-50 en FP32, requiere aproximadamente 100 MB de VRAM para el checkpoint en memoria, mas el coste de activaciones segun la resolucion de entrada. Cabe en cualquier GPU consumer moderna (GTX 1060 6GB en adelante).
- Entrenamiento: el preentrenamiento SimCLR se realizo con batch size 32 a resolucion 256×256, lo que es factible en una GPU con 16-24 GB de VRAM (RTX 4090, A5000, A100 40GB). Para fine-tuning de segmentacion, una GPU de 8-12 GB es suficiente con batch pequeno.
- Despliegue: al ser un checkpoint de PyTorch estandar, puede cargarse con torchvision directamente. Para servir el modelo completo de segmentacion, son compatibles los frameworks habituales: PyTorch, segmentation_models_pytorch, y para produccion con alta concurrencia, TorchServe o FastAPI con GPU.
- No se dispone de datos de latencia o throughput estimados en la documentacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Preentrenamiento | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaSemSeg SimCLR Encoder | ResNet-50 | SimCLR contrastivo sobre 35.648 parches sismicos | Sismico (facies) | MIT | HuggingFace, codigo abierto |
| ResNet-50 ImageNet (torchvision) | ResNet-50 | Supervisado con etiquetas ImageNet | Vision generalista | BSD-3 | Torchvision |
| MAE ViT-Base (He et al., 2022) | ViT-Base | Autoencoder enmascarado sobre ImageNet | Vision generalista | MIT | HuggingFace, TIMM |

La diferencia clave frente a los preentrenamientos generalistas es que este encoder ha visto exclusivamente datos sismicos, por lo que sus representaciones estan alineadas con las caracteristicas de amplitud, textura y estructura de las facies sismicas. Un ResNet-50 preentrenado en ImageNet requiere adaptacion al dominio y puede capturar patrones irrelevantes. MAE ViT ofrece representaciones fuertes pero con un coste computacional mayor y sin especializacion sismica.

## Limitaciones y advertencias

- Dominio restringido: el modelo solo ha visto datos sismicos de tres conjuntos publicos (F3, Parihaka, Penobscot). Su rendimiento en otros tipos de datos sismicos (diferentes cuencas, calidades de adquisicion o configuraciones geologicas) puede degradarse.
- Preentrenamiento corto: solo 10 epocas con batch size 32, lo que puede limitar la calidad de las representaciones comparado con preentrenamientos mas extensos.
- Sin validacion independiente: el 93,75% de precision top-1 corresponde a la tarea de discriminacion de instancias del propio SimCLR, no a una tarea downstream. El rendimiento real en segmentacion depende del fine-tuning posterior.
- Formato de checkpoint: el state_dict incluye la cabeza de proyeccion de SimCLR; es necesario filtrar las claves correctamente (eliminar prefijo "backbone." y las claves "backbone.fc.*") para cargarlo en un ResNet estandar. Un error en este paso produce fallos de carga o representaciones incorrectas.
- Sin cuantizaciones publicadas: no se ofrecen versiones en FP16, INT8 ni formatos optimizados para inferencia en produccion (TensorRT, ONNX, GGUF).
- Sesgo de datos: los tres conjuntos de datos provienen de regiones geograficas concretas (Mar del Norte, Nueva Zelanda y Canada), por lo que las representaciones pueden estar sesgadas hacia las caracteristicas geologicas de esas areas.
- No es un modelo de segmentacion completo: es solo el codificador. Para obtener mascaras de segmentacion es necesario anadir un decodificador y realizar fine-tuning con datos etiquetados.

## Enlaces

- HuggingFace: https://huggingface.co/Surojit-Utah/adasemseg-simclr-encoder
- Paper AdaSemSeg (arXiv): https://arxiv.org/abs/2501.16760
- Version HTML del paper: https://arxiv.org/html/2501.16760
- Repositorio GitHub AdaSemSeg: https://github.com/Surojit-Utah/AdaSemSeg
- Documentacion de preentrenamiento SimCLR: https://github.com/Surojit-Utah/AdaSemSeg/tree/main/pretraining/simclr
- Pagina personal del autor: https://surojit-utah.github.io/
- Publicaciones del autor: https://surojit-utah.github.io/publications/
- Paper SimCLR original (referencia): https://arxiv.org/abs/2002.05709
