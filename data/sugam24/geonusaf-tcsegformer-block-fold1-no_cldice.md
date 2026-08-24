# sugam24/geonusaf-tcsegformer-block-fold1-no_cldice

## Resumen

GeoNUSAF TC-SegFormer es un modelo de segmentación semántica para imágenes de teledetección desarrollado por el usuario sugam24, orientado al mapeo de usos del suelo en el valle de Katmandú (Nepal). Se basa en el backbone `nvidia/segformer-b0-finetuned-ade-512-512` y clasifica imágenes de 512x512 píxeles a una resolución de 0.586 metros por píxel en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Este modelo concreto corresponde a la variante `no_cldice` del primer fold de un esquema de validación cruzada por bloques.

El modelo forma parte de una serie de experimentos de ablación (con variantes `no_csa`, `fold2`, etc.) que exploran la influencia de técnicas como el reweighting CSA (Class-Specific Attention) o la pérdida soft-clDice. Los resultados de validación publicados son notablemente bajos (mIoU 0.0656), lo que sugiere que se trata de un experimento en fase temprana de investigación, probablemente con problemas de entrenamiento o de distribución de clases muy desequilibrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (backbone `nvidia/segformer-b0-finetuned-ade-512-512`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.1 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura SegFormer, un transformer jerárquico para segmentación semántica que combina un backbone de vision transformer con un decodificador de MLP ligero. En este caso, el backbone es un SegFormer-B0 preentrenado en ADE20K. El entrenamiento se realizó sobre imágenes del valle de Katmandú con seis clases de uso del suelo y un índice de clase ignorada (`ignore_index=255`).

Los detalles del entrenamiento incluyen un split de datos por bloques (sequence-block cross-validation) con el fold 1 de 3, una semilla fija (42), y una mejor época reportada en la época 2. Se aplicó reweighting CSA con una configuración de tau por clase y un peso mínimo de 0.25, junto con un muestreo balanceado. La pérdida soft-clDice estaba desactivada (`False` con `mu=0.3`), lo que indica que esta variante no utiliza ese componente. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicó algún tipo de fine-tuning adicional.

## Capacidades

- Segmentación semántica multiclase en imágenes de satélite: clasifica píxeles en seis categorías de uso del suelo.
- Soporte para imágenes de 512x512 píxeles con resolución de 0.586 m/px.
- Capacidad de procesar imágenes de alta resolución de remote sensing en una sola pasada.
- Integración con la librería de transformers de HuggingFace (formato SegFormer).

## Casos de uso

- **Cartografía de uso del suelo urbano**: el modelo puede utilizarse para generar mapas de cobertura del suelo en zonas urbanas de Nepal, aunque su bajo rendimiento actual lo limita a tareas de investigación y experimentación.
- **Monitoreo de cambios urbanos**: comparando segmentaciones de diferentes fechas, se podría detectar crecimiento residencial o cambios en zonas agrícolas, si el modelo se entrena con datos temporales.
- **Gestión de recursos naturales**: la clasificación de bosque y suelo no utilizado puede servir para inventarios forestales o identificación de tierras degradadas en la región.
- **Planificación de infraestructuras**: la detección de carreteras (aunque con rendimiento muy bajo) podría complementar estudios de accesibilidad en la región.
- **Investigación académica en segmentación semántica**: como modelo de ablación, es útil para comparar el efecto de técnicas como CSA reweighting o soft-clDice en el rendimiento.
- **Evaluación de esquemas de validación cruzada**: el uso de block-split CV es útil para estudiar la generalización espacial en datos de remote sensing.

## Benchmarks y rendimiento

Los resultados de validación publicados son notablemente bajos, lo que indica que este modelo no es adecuado para uso en producción:

| Métrica | Valor |
|---|---|
| mIoU | 0.0656 |
| mF1 | 0.1163 |
| OA | 0.1120 |
| Kappa | 0.0240 |

| Clase | IoU | UA (precisión) | PA (recall) |
|---|---|---|---|
| Residential | 0.0391 | 0.7984 | 0.0394 |
| Road | 0.0062 | 0.0075 | 0.0355 |
| River | 0.0086 | 0.0088 | 0.2601 |
| Forest | 0.1949 | 0.3382 | 0.3152 |
| UnusedLand | 0.1029 | 0.1130 | 0.5340 |
| Agricultural | 0.0417 | 0.1074 | 0.0639 |

Estos valores son muy inferiores a los de modelos de segmentación semántica estándar (por ejemplo, un SegFormer-B0 bien entrenado en Cityscapes suele superar el mIoU de 0.70). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero un modelo SegFormer-B0 (backbone de ~3.7M parámetros) puede ejecutarse en GPUs con al menos 4-6 GB de VRAM para inferencia a 512x512.
- **GPU recomendadas**: cualquier GPU con 8 GB o más (RTX 2070, RTX 3060, T4, etc.). Para entrenamiento, se recomienda al menos 16 GB de VRAM.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo medio (RTX 3060 o superior).
- **Opciones de despliegue**: compatible con PyTorch, Hugging Face Transformers, y puede exportarse a ONNX para despliegue en CPU o GPU. No hay soporte explícito para vLLM, llama.cpp u Ollama (modelo de visión, no de texto).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No hay información pública sobre comparaciones con otros modelos en la misma tarea (segmentación de uso del suelo en remote sensing). Como referencia general, modelos como DeepLabV3, U-Net o SegFormer con backbone ResNet50 suelen alcanzar mIoU de 0.50-0.70 en datasets urbanos de uso del suelo (p. ej., LandCover.ai). No se dispone de datos concretos de estos modelos en la misma región de Katmandú.

## Limitaciones y advertencias

- **Rendimiento extremadamente bajo**: los valores de mIoU, F1 y precisión son muy pobres, lo que indica que el modelo no es funcional para ninguna aplicación práctica. Los resultados sugieren un entrenamiento inadecuado, un desbalance de clases severo o un problema de etiquetado.
- **Sesgo geográfico**: el modelo se entrena solo con datos del valle de Katmandú, por lo que no generaliza a otras regiones.
- **Riesgo de alucinación**: al ser un modelo de segmentación, puede generar máscaras de segmentación espurias en zonas no vistas.
- **Licencia no disponible**: no se indica licencia, lo que impide su uso comercial legal sin verificar los derechos del autor.
- **Falta de documentación**: no hay información sobre el dataset de entrenamiento, los hiperparámetros completos, ni el proceso de validación detallado, lo que dificulta la reproducibilidad.
- **Sin soporte de contexto**: es un modelo de visión, no tiene capacidad de procesamiento de lenguaje natural.

## Enlaces

- Modelo en HuggingFace: [sugam24/geonusaf-tcsegformer-block-fold1-no_cldice](https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1-no_cldice)
- Variantes relacionadas:
  - [sugam24/geonusaf-tcsegformer-block-fold1-no_csa](https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1-no_csa)
  - [sugam24/geonusaf-tcsegformer-block-fold2](https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold2)

No se han encontrado papers, repositorios de código o demos asociados en la búsqueda web.
