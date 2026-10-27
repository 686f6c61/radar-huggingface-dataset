# theshoaibme/panorgan-oncology-mammography-classifier

## Resumen

PanOrganNet Oncology Mammography Classifier es un clasificador de imágenes médicas publicado en Hugging Face por el usuario `theshoaibme`, presentado en su model card como el modelo "oficial de producción" de la track de oncología (mamografía CBIS-DDSM) del denominado *Pan-Organ Diagnostic Paradigm*. No es un modelo de lenguaje ni un *foundation model* multimodal pese a la etiqueta `foundation-model`: es una CNN EfficientNetV2-S de torchvision cuya cabeza de clasificación se sustituye por `Dropout(0,4)` + `Linear(in_features, 3)`, entrenada sobre el dataset derivado `theshoaibme/panorgan-cbis-ddsm-mammography`. El repositorio ocupa 0,1 GB y contiene `pytorch_model.pt` y `config.json`.

Su función declarada es el cribado y la categorización de mamografías digitales de alta resolución, recortes de lesiones y regiones de interés (ROI) segmentadas. El interés práctico inmediato está en lo reproducible del *pipeline*: redimensionado a 224×224, normalización con media y desviación típica leídas de `config.json`, salida de tres clases vía softmax y un script de carga mínimo que funciona con PyTorch y torchvision estándar.

Ahora bien, la documentación es muy escasa y las métricas declaradas son sospechosas: 100,00 % de accuracy y macro F1, macro precisión y macro recall de 1,0000, junto a un AUC-ROC de 0,0000, un valor incompatible con un clasificador perfecto (un AUC de 0,0 implicaría ranking invertido). No se documentan particiones, aumentos de datos, semilla, número de épocas, calibración ni validación externa. Debe tratarse, por tanto, como un artefacto experimental de investigación y no como una herramienta clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN EfficientNetV2-S (torchvision) con cabeza `Dropout(0,4)` + `Linear(in_features, 3)` |
| Parámetros totales | alrededor de 21,5 M en el backbone EfficientNetV2-S; el valor exacto tras sustituir la cabeza no se publica |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 224×224 px) |
| Tipos de cuantización | no documentados; solo se distribuye un `state_dict` en FP32. La arquitectura es convertible a ONNX y cuantizable con PTQ/QAT o FP16, pero el autor no aporta artefactos |
| Idiomas soportados | no aplica (clasificación de imagen; no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `pytorch_model.pt` (`state_dict` de PyTorch cargado con `torch.load`) + `config.json` |
| Entrada | imagen RGB redimensionada a 224×224, normalizada con los valores de `config.json` |
| Salida | logits de 3 clases + probabilidades softmax |
| Dataset de entrenamiento | `theshoaibme/panorgan-cbis-ddsm-mammography` (derivado de CBIS-DDSM) |
| Métricas declaradas | accuracy 100,00 %; macro F1 1,0000; macro precisión 1,0000; macro recall 100,00 %; AUC-ROC 0,0000 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNetV2-S estándar de torchvision, una CNN con *compound scaling* y bloques MBConv/Fused-MBConv, adaptada a clasificación de 3 clases mediante una cabeza `Dropout` + `Linear`. La entrada es de 224×224 píxeles en RGB y la normalización concreta (media y desviación típica) se almacena en `config.json`, lo que sugiere que no se usaron necesariamente las estadísticas de ImageNet. El código de ejemplo instancia `efficientnet_v2_s()` sin pesos preentrenados y carga el `state_dict` completo, de modo que el checkpoint incluye el backbone y la cabeza nuevos; no se especifica si el entrenamiento partió de pesos ImageNet o desde cero.

No hay información sobre el número de tokens o imágenes de entrenamiento, composición del dataset, épocas, *learning rate*, aumentos, resolución nativa de las mamografías, estrategia de partición train/val/test ni procesos de ajuste fino adicional (RLHF/DPO no aplican). El dataset de origen, CBIS-DDSM, es una colección pública de la TCIA con mamografías digitalizadas y confirmación patológica de masas y calcificaciones; la model card no indica cómo se mapearon esas anotaciones a las 3 clases del modelo, cuyos nombres solo aparecen dentro de `config.json` y no se reproducen en la documentación. Tampoco se describe ninguna innovación técnica: no hay atención lineal, decodificación especulativa, *test-time augmentation*, ensembles ni mapas de explicabilidad tipo Grad-CAM empaquetados.

## Capacidades

- Clasificación de imagen en 3 clases a partir de un único *forward pass*; la etiqueta predicha y la confianza se obtienen con `argmax` sobre softmax.
- Procesamiento de recortes de mamografía, masas y ROI segmentadas, siempre que se entreguen como imagen RGB de 224×224 con la normalización indicada.
- Carga directa en PyTorch y torchvision sin dependencias exóticas; el script de la model card funciona en CPU.
- Posible exportación a TorchScript u ONNX y despliegue en runtimes de inferencia, aunque el autor no proporciona los artefactos exportados.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, function calling, capacidades de agente, *thinking mode*, audio ni visión general.
- No es un detector ni un segmentador: no devuelve *bounding boxes*, máscaras ni localizaciones, solo una etiqueta por imagen.
- No incorpora calibración de probabilidades, umbrales clínicos ni lógica de abstención documentada.

## Casos de uso

- **Pre-filtrado en estudios retrospectivos de investigación**: pasar los recortes de una cohorte por el modelo y ordenarlos por probabilidad para priorizar la revisión de los casos con mayor puntuación, reduciendo el tiempo de lectura manual en bases de datos grandes.
- **Segunda lectura en entornos de investigación**: ejecutar el clasificador en paralelo a la lectura del radiólogo y marcar discrepancias para auditoría interna; requiere validación local previa y supervisión humana obligatoria.
- **Curación y pseudoetiquetado de datasets**: generar etiquetas preliminares sobre nuevos recortes de mamografía y enviarlas a revisión experta, acelerando la anotación de corpus para entrenar modelos posteriores.
- **Control de calidad del pipeline de imagen**: detectar recortes mal encuadrados, imágenes fuera de distribución o preprocesados incorrectos a partir de confidencias muy bajas o distribuciones de salida anómalas (con la cautela de que el modelo no está calibrado).
- **Integración como microservicio en prototipos de PACS**: servir el checkpoint con TorchServe, Triton o BentoML y exponer un *endpoint* HTTP que reciba la imagen y devuelva la clase y la probabilidad, como prueba de concepto de triaje.
- **Docencia y experimentación en visión médica**: usar el modelo como *baseline* CNN reproducible para comparar con Vision Transformers, modelos multimodales o arquitecturas específicas de mamografía en un curso o artículo.
- **Evaluación de técnicas de compresión**: medir la degradación de accuracy y F1 al pasar de FP32 a FP16/INT8 o al exportar a ONNX, útil para estudiar el despliegue en hardware de borde con pocos recursos.
- **Auditoría de sesgo por subgrupos**: si se dispone de metadatos demográficos o de fabricante del equipo, analizar si la sensibilidad declarada se mantiene en subgrupos, algo imprescindible antes de cualquier uso mínimamente serio.

## Benchmarks y rendimiento

Resultados reportados por el autor en la *holdout test cohort*:

| Métrica | Valor declarado |
|---|---|
| Test accuracy | 100,00 % |
| Macro F1-score | 1,0000 |
| Macro precisión | 1,0000 |
| Macro recall (sensibilidad) | 100,00 % |
| AUC-ROC | 0,0000 |

Advertencia: el conjunto de métricas es internamente contradictorio. Un AUC-ROC de 0,0000 indica ordenación invertida de las probabilidades y es matemáticamente incompatible con accuracy y recall del 100 %; además, un rendimiento perfecto en un *holdout* de mamografía es altamente improbable y suele indicar fuga de datos (duplicados o imágenes del mismo paciente en train y test), un test diminuto o un error de cálculo. No se han publicado resultados de benchmarks en la información disponible más allá de esta tabla, ni comparaciones con otros modelos, ni métricas por clase, ni intervalos de confianza.

## Requisitos de hardware

- **VRAM estimada**: los pesos en FP32 ocupan aproximadamente 86 MB (21,5 M de parámetros × 4 bytes); con activaciones para batch 1 a 224×224 el consumo se mantiene por debajo de 1-2 GB. Con lotes de decenas de imágenes puede requerir del orden de 4-8 GB, según implementación y *framework*.
- **GPU recomendadas**: cualquier GPU con 4 GB o más. Una RTX 3060, RTX 4060 o RTX 4090 es más que suficiente; T4, L4, A100 o H100 quedan sobredimensionadas para una sola instancia, aunque permiten *batching* masivo.
- **GPU de consumo**: sí, cabe holgadamente en GTX 1650, RTX 3050 y superiores. También es viable en CPU para inferencia puntual.
- **Opciones de despliegue**: PyTorch nativo, TorchScript, ONNX Runtime, Triton Inference Server, TorchServe, BentoML o FastAPI con un *worker* de PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- **Latencia y throughput**: no publicados. En GPU moderna se espera latencia de milisegundos por imagen y throughput de cientos o miles de imágenes por segundo con *batching*, pero son estimaciones no verificadas; en la práctica el cuello de botella suele ser la descompresión DICOM y el preprocesado, no la CNN.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea / clases | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `theshoaibme/panorgan-oncology-mammography-classifier` | ~21,5 M | Clasificación de mamografía, 3 clases | no aplica | 100 % accuracy y AUC 0,0000 declarados; no verificable | CC-BY-4.0 | Hugging Face, 0 descargas |
| EfficientNetV2-S (torchvision, ImageNet-1k) | ~21,5 M | Clasificación de imagen general, 1000 clases | no aplica | Métricas ImageNet publicadas por torchvision; no comparable con mamografía | BSD-3 (torchvision) | Pesos descargables vía torchvision |
| ResNet-50 (torchvision, ImageNet-1k) | ~25,6 M | Clasificación de imagen general, 1000 clases | no aplica | Métricas ImageNet publicadas; no comparable con mamografía | BSD-3 (torchvision) | Pesos descargables vía torchvision |
| Modelos abiertos específicos de mamografía | no disponible | no disponible | no disponible | no disponible | no disponible | no identificados en la información proporcionada |

La comparación relevante no es de rendimiento —no hay datos homogéneos— sino de madurez: los backbones de torchvision cuentan con validación amplia y mantenimiento, mientras que este checkpoint carece de validación externa, de histórico de versiones y de cualquier traza de revisión por pares.

## Limitaciones y advertencias

- **Métricas no fiables**: accuracy y F1 del 100 % con AUC-ROC 0,0000 es una combinación incoherente; hay que asumir que las cifras pueden ser erróneas o fruto de fuga de datos hasta que se demuestre lo contrario.
- **Ausencia de validación externa**: no se reportan resultados en cohortes independientes, ni por subgrupo, ni con distintos fabricantes de mamógrafos. La generalización es desconocida.
- **Documentación insuficiente**: no se especifican las clases, el mapeo desde las anotaciones de CBIS-DDSM, el número de imágenes, las particiones, los aumentos ni el régimen de entrenamiento, lo que impide reproducir el resultado.
- **Resolución de entrada baja**: reducir mamografías de alta resolución a 224×224 puede destruir microcalcificaciones y detalles finos, críticos en el cribado; no se documenta si el modelo se entrenó con recortes de lesión o con imágenes completas.
- **Sin calibración**: las probabilidades softmax no están calibradas; no deben interpretarse como riesgo clínico ni usarse para fijar umbrales de decisión sin un estudio específico.
- **Sesgo probable**: CBIS-DDSM procede de una única fuente estadounidense, con distribución demográfica y de equipos limitada; el modelo puede comportarse peor en poblaciones, densidades mamarias o equipos no representados.
- **Riesgo de alucinación en sentido amplio**: al ser un clasificador, no "alucina" texto, pero puede producir falsos positivos y falsos negativos con alta confianza; no hay mecanismo de abstención ni de explicabilidad.
- **No es un producto sanitario**: no consta marcado CE (MDR), autorización FDA ni validación clínica. Su uso en diagnóstico requiere cualificación regulatoria y supervisión facultativa; la model card no debe interpretarse como reclamo clínico.
- **Licencia CC-BY-4.0**: permite uso comercial con atribución, pero no exime del cumplimiento del RGPD al tratar imágenes médicas identificables ni de las obligaciones de la normativa de productos sanitarios.
- **Metadatos anómalos**: la fecha de creación declarada (2026-10-26) es idéntica a la de actualización, el repositorio tiene 0 descargas y 0 *likes*, y la etiqueta `foundation-model` no se corresponde con la arquitectura real (un clasificador de tarea específica).
- **Mantenimiento incierto**: un único autor, sin issues, sin paper asociado y sin versionado visible; el soporte a largo plazo no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theshoaibme/panorgan-oncology-mammography-classifier
- Dataset declarado: https://huggingface.co/datasets/theshoaibme/panorgan-cbis-ddsm-mammography
- CBIS-DDSM en The Cancer Imaging Archive: https://www.cancerimagingarchive.net/collection/cbis-ddsm/
- Paper de EfficientNetV2 (Tan y Le, 2021): https://arxiv.org/abs/2104.00298
- Pesos de referencia EfficientNetV2-S en torchvision: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Repositorio de torchvision: https://github.com/pytorch/vision
