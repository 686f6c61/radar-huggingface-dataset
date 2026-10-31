# theshoaibme/panorgan-oncology-breast-ultrasound-classifier

## Resumen

PanOrganNet Oncology Breast Ultrasound Classifier es un clasificador de imágenes médicas desarrollado por el usuario de Hugging Face **theshoaibme** dentro del denominado "Pan-Organ Diagnostic Paradigm (PanOrganNet)". El modelo automatiza la clasificación multi-clase de lesiones mamarias en ecografías 2D de mama, distinguiendo entre tres categorías: tejido normal, lesiones benignas (fibroadenomas, quistes) y lesiones malignas (carcinoma ductal invasivo, carcinoma lobulillar). Su objetivo es servir de herramienta de apoyo diagnóstico en oncología mamaria.

Arquitecturalmente se basa en **EfficientNetV2-S** (torchvision), con una cabeza de clasificación modificada (Dropout 0.3 y capa lineal de 3 salidas). Fue entrenado sobre el dataset **panorgan-busi-breast-ultrasound** (basado en BUSI, Breast Ultrasound Images) y evaluado en un conjunto holdout de 117 ecografías, con una exactitud del 87,18 % y un AUC-ROC de 0,9335. Se publica bajo licencia CC-BY-4.0, lo que permite su uso comercial con atribución.

Su relevancia radica en la creciente demanda de herramientas de cribado y triaje asistido por ecografía en unidades de mama, donde la variabilidad inter-observador es alta. No obstante, al tratarse de un modelo de autor individual con validación limitada (117 casos de test), debe considerarse un modelo experimental y no un dispositivo médico certificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (torchvision) con cabeza de clasificación personalizada (Dropout 0.3 + Linear de 3 salidas) |
| Parametros totales | no disponible (EfficientNetV2-S base tiene ~21 M de parametros, sin confirmacion del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (clasificador de imagenes; no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pytorch_model.pt (formato pickle de PyTorch; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo emplea **EfficientNetV2-S**, una arquitectura CNN basada en la familia EfficientNet que combina bloques MBConv y Fused-MBConv con una busqueda de arquitectura orientada a la velocidad de entrenamiento. La cabeza clasificadora original se sustituye por una secuencia de Dropout (p=0.3) seguida de una capa lineal con 3 salidas, correspondientes a las clases Normal, Benign y Malignant. La entrada se normaliza a 224x224 pixeles con los valores de media y desviacion tipica definidos en el config.json del repositorio.

El entrenamiento se realizo sobre el dataset **theshoaibme/panorgan-busi-breast-ultrasound**, derivado de BUSI (Breast Ultrasound Images), un conjunto publico de ecografias mamarias anotadas. El numero exacto de imagenes de entrenamiento, el numero de epocas, el optimizador y la estrategia de aumento de datos no se han publicado en la model card. Las metricas reportadas corresponden a un conjunto holdout de 117 ecografias de test. No hay informacion sobre uso de tecnicas como RLHF (no aplicable a clasificacion) ni sobre validacion externa multicentrica.

## Capacidades

- Clasificacion multi-clase (3 clases) de lesiones mamarias en ecografias 2D: Normal, Benign y Malignant.
- Salida probabilistica: softmax sobre 3 clases, con nivel de confianza asociado a la prediccion.
- Inferencia en CPU o GPU gracias al tamano compacto de EfficientNetV2-S (~21 M de parametros).
- Integracion sencilla en pipelines de PyTorch y Hugging Face Hub (descarga de pesos via `hf_hub_download`).
- Metricas reportadas: accuracy, F1 macro, precision macro, recall (sensibilidad) y AUC-ROC.
- No soporta procesamiento de texto, tool calling, agentes ni capacidades multimodales: es un clasificador de imagen puro.

## Casos de uso

- **Triaje inicial en unidades de mama**: preclasificacion automatica de ecografias para priorizar la revision por radiologo de estudios con sospecha de malignidad, aprovechando una sensibilidad reportada del 88,41 %.
- **Segundo lector asistido**: uso como herramienta de apoyo ("second reader") que ofrece una probabilidad de malignidad que el radiologo contrasta con su lectura, reduciendo la variabilidad inter-observador.
- **Investigacion en imagen medica**: punto de partida o baseline reproducible para experimentos sobre BUSI y datasets derivados, gracias a la licencia CC-BY-4.0 y al codigo de uso publico.
- **Docencia y formacion de residentes**: generacion de predicciones con confianza sobre casos de ecografia para ejercicios de correlacion radiologico-patologica.
- **Prototipado de sistemas PACS/RIS**: integracion en flujos de trabajo hospitalarios experimentales como modulo de preprocesado que etiqueta estudios antes de la lectura humana.
- **Estudios de validacion multicentrica**: evaluacion del modelo en cohortes externas para medir su generalizacion, dado que solo se ha validado en 117 casos holdout.
- **Analisis retrospectivo de cohortes**: clasificacion masiva de archivos historicos de ecografias para estudios epidemiologicos sobre caracterizacion de lesiones.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto holdout de 117 ecografias de test:

| Metrica | Valor |
|---|---|
| Test Accuracy | 87,18 % |
| Macro F1-Score | 0,8622 |
| Macro Precision | 0,8462 |
| Macro Recall (Sensibilidad) | 88,41 % |
| AUC-ROC | 0,9335 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible. Para referencia contextual, publicaciones academicas sobre BUSI con CNN reportan tipicamente accuracies entre el 80 % y el 90 % en clasificacion benigno/maligno, aunque las condiciones de evaluacion varian y no son directamente comparables.

## Requisitos de hardware

- **VRAM estimada para inferencia**: minima; EfficientNetV2-S requiere menos de 1 GB de VRAM para inferencia con batch pequeno. Es plenamente ejecutable en CPU.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; no se requiere hardware especial (valido desde una GTX 1650 o una RTX 3060 hasta A100/H100, que aportarian beneficio solo en procesamiento por lotes a gran escala).
- **Consumer GPU**: si, cabe sobradamente en cualquier GPU de consumo; incluso la inferencia en CPU es practica para uso individual.
- **Opciones de despliegue**: PyTorch nativo (torchvision), Hugging Face Hub (`hf_hub_download`), y cualquier servicio que admita pesos `.pt` (TorchServe, FastAPI con PyTorch, contenedores Docker). No hay pesos en formato GGUF, por lo que llama.cpp y Ollama no son aplicables; vLLM y TGI estan orientados a modelos de lenguaje y tampoco son relevantes aqui.
- **Latencia y throughput**: no disponibles oficialmente; por el tamano del modelo, se esperan latencias de inferencia por imagen en el orden de decenas de milisegundos en GPU y centenas de milisegundos en CPU (estimacion, no dato publicado).

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Licencia | Notas |
|---|---|---|---|---|
| PanOrganNet Breast Ultrasound Classifier | EfficientNetV2-S | Clasificacion 3 clases (Normal/Benigno/Maligno) en ecografia de mama | CC-BY-4.0 | Metricas publicadas (acc 87,18 %, AUC 0,9335), pesos abiertos |
| Clasificadores tipicos sobre BUSI (literatura academica) | ResNet-50, DenseNet-121, ViT-S | Clasificacion benigno/maligno (2-3 clases) | Varia | Resultados similares en rango 80-90 % de accuracy, pero sin pesos publicos reproducibles en muchos casos |
| Modelos fundacionales medicos generales (p. ej. variantes de RETFound/BiomedCLIP) | ViT / CLIP medico | Clasificacion multi-organos por fine-tuning | Varia (muchas licencias restrictivas) | Mayor generalidad pero requieren fine-tuning especifico para ecografia mamaria; comparacion numerica directa no disponible |

## Limitaciones y advertencias

- **No es un dispositivo medico certificado**: no dispone de marcado CE ni aprobacion FDA; su uso clinico real requeriria validacion regulatoria y supervision medica obligatoria.
- **Validacion limitada**: las metricas proceden de un unico conjunto holdout de 117 imagenes, sin validacion externa multicentrica; el rendimiento en poblaciones, equipos de ecografia o protocolos de adquisicion distintos puede degradarse significativamente.
- **Riesgo de falsos negativos**: con una sensibilidad del 88,41 %, aproximadamente 1 de cada 9 lesiones malignas podria clasificarse erroneamente; inaceptable como unico criterio de decision clinica.
- **Posible sesgo de dataset**: BUSI procede de una poblacion concreta (Universidad de Baiyun, Egipto) con equipos y protocolos especificos; puede haber sesgos demograficos y de dispositivo.
- **Entrada 224x224**: el redimensionado de ecografias puede perder detalle relevante en lesiones pequenas o texturas sutiles.
- **Formato de pesos**: usa `pytorch_model.pt` (pickle), lo que implica riesgos de seguridad al cargar pesos de terceros; se recomienda inspeccionar o convertir a safetensors antes de uso en produccion.
- **Licencia CC-BY-4.0**: permite uso comercial, pero exige atribucion adecuada; no otorga ninguna garantia de aptitud clinica.
- **Documentacion limitada**: no se publican detalles de entrenamiento (epocas, splits, aumento de datos), lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theshoaibme/panorgan-oncology-breast-ultrasound-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/theshoaibme/panorgan-busi-breast-ultrasound
- Dataset original BUSI (referencia academica): no disponible en la informacion proporcionada
