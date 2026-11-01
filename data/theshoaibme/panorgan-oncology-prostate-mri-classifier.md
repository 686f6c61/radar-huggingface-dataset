# theshoaibme/panorgan-oncology-prostate-mri-classifier

## Resumen

PanOrganNet Oncology Prostate MRI Classifier es un modelo de clasificacion de imagenes medicas desarrollado por el usuario theshoaibme, presentado como el modelo diagnostico oficial de la rama de oncologia y radiologia (mpMRI de prostata) del paradigma Pan-Organ Diagnostic Paradigm (PanOrganNet). El modelo aborda la identificacion de secuencias de resonancia magnetica multiparametrica y la evaluacion de tejido funcional frente a anatomico en cohortes con sospecha de adenocarcinoma de prostata.

Tecnicamente se trata de un clasificador de dos clases construido sobre una EfficientNetV2-S preentrenada de torchvision, con la cabeza de clasificacion sustituida por un dropout de 0,3 y una capa lineal de 2 salidas. El repositorio ocupa 0,1 GB y los pesos se distribuyen como un unico fichero `pytorch_model.pt` acompanado de un `config.json` con las clases y los parametros de normalizacion. No es un modelo de lenguaje ni un modelo fundacional generativo: es un clasificador de vision de proposito especifico.

La relevancia del modelo es limitada y debe interpretarse con cautela. La model card declara metricas perfectas (exactitud del 100 %, F1 macro de 1,0000, AUC-ROC de 1,0000) sobre cortes de test, un resultado que en clasificacion de imagenes medicas es altamente sospechoso de sobreajuste, fuga de datos o un conjunto de evaluacion trivial. Ademas, el modelo tiene 77 descargas y 0 likes, no dispone de paper asociado y su model card no documenta el proceso de entrenamiento, la composicion del dataset ni la validacion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (CNN, torchvision) con cabeza de clasificacion lineal de 2 clases |
| Parametros totales | no disponible (EfficientNetV2-S ronda los 21,5 M, no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.pt`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no aplica; entrada de imagen) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (`.pt`) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNetV2-S de torchvision. El codigo de ejemplo de la model card sustituye `model.classifier[1]` por un `Sequential` compuesto de `Dropout(0.3)` y `Linear(in_features, 2)`, de modo que el modelo produce dos logits correspondientes a dos clases definidas en `config.json`. La entrada se redimensiona a 224x224, se convierte a RGB y se normaliza con la media y desviacion tipica indicadas en la configuracion del repositorio. El modelo se ejecuta en modo evaluacion y la prediccion se obtiene por `argmax` sobre la softmax.

No se dispone de informacion sobre el proceso de entrenamiento: la model card no indica el numero de imagenes, la procedencia de los datos mas alla del dataset referenciado `theshoaibme/panorgan-prostatex-mri`, el numero de epocas, la funcion de perdida, el regimen de aumentacion de datos ni si hubo validacion cruzada. Tampoco se documenta ningun tipo de ajuste fino con preferencias (RLHF/DPO), lo cual es esperable en un clasificador. No hay innovaciones tecnicas declaradas mas alla del uso de un backbone EfficientNetV2-S estandar.

## Capacidades

- Clasificacion de imagenes de resonancia magnetica de prostata en dos clases (las clases concretas no estan detalladas en la informacion disponible; se leen de `config.json`).
- Identificacion de secuencias de mpMRI y evaluacion funcional frente a anatomica segun el alcance clinico declarado por el autor.
- Inferencia sobre imagenes individuales en formato PIL, con transformacion a 224x224 y normalizacion configurable.
- Ejecucion en CPU o GPU mediante PyTorch estandar (el ejemplo de la model card usa `map_location="cpu"`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de audio; la unica modalidad de entrada es imagen.

## Casos de uso

- Triaje preliminar de estudios de mpMRI de prostata: el modelo podria usarse como primer filtro para separar cortes con tejido funcional de tejido anatomico antes de la revision por un radiologo, siempre como herramienta de apoyo y nunca como diagnostico autonomo.
- Etiquetado asistido de datasets de investigacion: dado su caracter de clasificador binario, puede emplearse para preanotar cortes de RM prostatica y reducir el trabajo manual en la construccion de cohortes, con revision humana obligatoria.
- Control de calidad de pipelines de imagen medica: clasificar cortes para detectar secuencias mal etiquetadas o inconsistentes en un DICOM antes de alimentar otros modelos.
- Prototipado academico: servir de linea base reproducible (EfficientNetV2-S + cabeza lineal) para experimentos de clasificacion de RM prostatica en entornos docentes.
- Integracion en herramientas de investigacion clinica: desplegado via PyTorch en un servidor interno para generar probabilidades por corte que luego se agreguen a nivel de estudio.
- Experimentacion con tecnicas de explicabilidad: al ser una CNN estandar, admite Grad-CAM y mapas de saliencia para inspeccionar en que regiones se fija el modelo, util en auditorias de sesgo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre cortes de test (holdout):

| Metrica | Valor declarado |
|---|---|
| Test accuracy | 100,00 % |
| Macro F1-score | 1,0000 |
| Macro precision | 1,0000 |
| Macro recall (sensibilidad) | 100,00 % |
| AUC-ROC | 1,0000 |

No se han publicado resultados de benchmarks independientes ni comparaciones con otros modelos en la informacion disponible. Las metricas perfectas deben tratarse con escepticismo: no se documenta el tamano del conjunto de test, la separacion entre train y test a nivel de paciente ni el protocolo de evaluacion, por lo que no es posible descartar fuga de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para EfficientNetV2-S a 224x224; el repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien tarjetas de datacenter (A100, H100) aunque sobredimensionadas para este modelo.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo (unico soportado segun la model card); no hay versiones GGUF, ONNX ni integracion con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un clasificador de vision.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PanOrganNet Prostate MRI Classifier | no disponible (EfficientNetV2-S) | imagen 224x224 | metricas declaradas perfectas, sin validacion independiente | cc-by-4.0 | HuggingFace, 77 descargas |
| EfficientNetV2-S (torchvision, base) | ~21,5 M | imagen 224x224 | ImageNet top-1 ~83,9 % (referencia publica del backbone) | BSD-3-Clause (torchvision) | Amplia |
| ResNet-50 (torchvision) | ~25,6 M | imagen 224x224 | ImageNet top-1 ~80,9 % (referencia publica) | BSD-3-Clause (torchvision) | Amplia |

No se dispone de comparaciones con otros clasificadores especificos de RM prostatica en la informacion proporcionada. La comparativa con los backbones base solo ilustra el punto de partida arquitectonico, no una evaluacion clinica equivalente.

## Limitaciones y advertencias

- Metricas perfectas no verificables: no se documenta el protocolo de evaluacion ni la separacion por paciente, lo que impide descartar sobreajuste o fuga de datos.
- Ausencia de validacion clinica externa: no hay evidencia de validacion en cohortes independientes ni de aprobacion regulatoria; no debe usarse para diagnostico clinico.
- Sin documentacion del entrenamiento: se desconoce el tamano y la composicion del dataset, el balance de clases y el regimen de aumentacion.
- Riesgo de sesgo: al no documentarse la procedencia de los datos, no puede evaluarse el sesgo por fabricante de escaner, protocolo de adquisicion, demografia o centro hospitalario.
- Ambito limitado: clasificador binario de proposito especifico; no generaliza a otras modalidades ni a otras anatomias sin reentrenamiento.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero no exime del cumplimiento de la normativa sanitaria aplicable (por ejemplo, marcado CE o equivalente) si se emplea en contexto clinico.
- Repositorio con muy poca traccion (77 descargas, 0 likes) y sin paper asociado: madurez y mantenimiento inciertos.
- No hay versiones cuantizadas ni exportadas a otros formatos, lo que limita su despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theshoaibme/panorgan-oncology-prostate-mri-classifier
- Dataset referenciado: https://huggingface.co/datasets/theshoaibme/panorgan-prostatex-mri
- EfficientNetV2 (paper de referencia del backbone): https://arxiv.org/abs/2104.00298
- EfficientNetV2 en torchvision: https://pytorch.org/vision/stable/models/efficientnetv2.html
