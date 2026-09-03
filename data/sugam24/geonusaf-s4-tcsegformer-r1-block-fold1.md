# sugam24/geonusaf-s4-tcsegformer-R1-block-fold1

## Resumen

GeoNUSAF Stage 4 - TC-SegFormer es un modelo de segmentación semántica para teledetección, desarrollado por sugam24, que clasifica el uso del suelo en el valle de Katmandú en 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo se basa en el backbone `nvidia/segformer-b0-finetuned-ade-512-512` y añade una rama de detalle (detail path) y un módulo CSA (Channel Spatial Attention) con pérdida soft-clDice, diseñado para mejorar la precisión en bordes y regiones pequeñas. Entrenado con una combinación de 804 imágenes reales y 804 imágenes sintéticas generadas en una etapa previa del pipeline GeoNUSAF, el modelo alcanza un mIoU de 0.5570 en validación sobre 136 teselas reales.

La relevancia del modelo radica en su enfoque híbrido real-sintético para superar la escasez de datos etiquetados en teledetección, así como en su arquitectura ligera (SegFormer-B0) que permite inferencia eficiente en hardware moderado. El modelo forma parte de un proyecto más amplio (GeoNUSAF) que aborda la segmentación de uso del suelo con datos sintéticos. No se dispone de información pública sobre licencia, idiomas o formato de pesos, aunque el repositorio pesa 0.8 GB y se publica en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (transformer jerárquico) con rama de detalle y módulo CSA |
| Parametros totales | no disponible (backbone B0 ≈ 3.7 M, con adiciones no cuantificadas) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de 512×512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.8 GB, probablemente safetensors o binarios PyTorch) |

## Arquitectura y entrenamiento

El modelo es un SegFormer-B0, un transformer jerárquico con atención de ventana desplazada, preentrenado en ADE20K a 512×512. Sobre este backbone se añade una rama de detalle que extrae características a resoluciones intermedias (canales [8, 16, 32] fusionados a 64) y un módulo CSA (Channel Spatial Attention) con parámetros tau específicos por clase, que se aplica también a los datos sintéticos (on_fake=True). La pérdida combina entropía cruzada con soft-clDice (mu=0.3) activada desde el paso 1000, para mejorar la segmentación de estructuras finas como carreteras y ríos.

El entrenamiento se realizó durante 6000 pasos con warmup de 150 y decaimiento coseno, usando un muestreador balanceado (cap 8.0) con frecuencias de clase calculadas sobre los datos reales. Se emplearon pesos de clase derivados del conjunto real y un seed fijo 42. El mejor paso fue el 4200, con métricas de validación sobre 136 teselas reales (sin píxeles sintéticos). Los datos sintéticos provienen de `sugam24/geonusaf-stage3-fakepairs-block-fold1` (804 pares falsos). La validación no contiene píxeles sintéticos, lo que garantiza una evaluación honesta del rendimiento.

## Capacidades

- Segmentación semántica de uso del suelo en imágenes de teledetección, con 6 clases (residencial, carretera, río, bosque, suelo no utilizado, agrícola).
- Manejo de clases desbalanceadas mediante muestreo balanceado y pesos de clase.
- Refinamiento de bordes y estructuras finas gracias a la rama de detalle y la pérdida soft-clDice.
- Atención espacial y de canal (CSA) que mejora la discriminación entre clases similares (p. ej., suelo no utilizado vs. agrícola).
- Inferencia a resolución fija de 512×512 píxeles, compatible con teselas de imágenes satelitales.
- Integración en pipelines de teledetección para mapeo urbano y monitoreo de cambios.

## Casos de uso

- Mapeo urbano de precisión: el modelo clasifica teselas de 512×512 de imágenes satelitales para generar mapas de uso del suelo del valle de Katmandú, con especial atención a áreas residenciales (mIoU 0.8486) y bosque (mIoU 0.7355).
- Detección de cambios en carreteras y ríos: la rama de detalle y soft-clDice mejoran la segmentación de estructuras lineales (carretera IoU 0.4231, río IoU 0.4702), útil para monitoreo de infraestructuras.
- Planificación agrícola: la clase agrícola alcanza un recall de 0.8518, permitiendo identificar zonas de cultivo con alta sensibilidad para estudios de seguridad alimentaria.
- Gestión de suelo no utilizado: aunque es la clase más débil (IoU 0.2977), el modelo puede ayudar a detectar terrenos baldíos en procesos de expansión urbana.
- Evaluación de datos sintéticos en teledetección: el modelo sirve como banco de pruebas para validar la utilidad de datos sintéticos en el entrenamiento de segmentadores, comparando con modelos entrenados solo con datos reales.
- Base para fine-tuning en otras regiones: aunque entrenado en Katmandú, el backbone SegFormer-B0 preentrenado en ADE20K permite transferir el modelo a otras áreas urbanas con fine-tuning limitado.

## Benchmarks y rendimiento

Resultados de validación sobre 136 teselas reales del fold 1 (sin píxeles sintéticos):

| Metrica | Valor |
|---|---|
| mIoU | 0.5570 |
| mF1 | 0.6971 |
| OA (Overall Accuracy) | 0.8286 |
| Kappa | 0.6916 |

Rendimiento por clase (IoU, precisión UA, recall PA):

| Clase | IoU | UA (prec) | PA (rec) |
|---|---|---|---|
| Residential | 0.8486 | 0.9399 | 0.8972 |
| Road | 0.4231 | 0.4995 | 0.7345 |
| River | 0.4702 | 0.5551 | 0.7546 |
| Forest | 0.7355 | 0.8918 | 0.8076 |
| UnusedLand | 0.2977 | 0.5821 | 0.3786 |
| Agricultural | 0.5670 | 0.6291 | 0.8518 |

El modelo no es comparable con la ejecución anterior del fold 1 (parte 1) porque esa usó un split de entrenamiento de 260 teselas, aumentación congelada (bug de persistent_workers), determinismo activado y un programa basado en épocas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- El repositorio pesa 0.8 GB, lo que sugiere pesos en fp32 o fp16 de un modelo pequeño (SegFormer-B0 tiene ~3.7M de parámetros base; con las adiciones del decodificador y la rama de detalle, el total probablemente no supere los 10M).
- Estimación orientativa: una GPU con 4-6 GB de VRAM es suficiente para inferencia en fp16 con lote pequeño (1-4 imágenes de 512×512). Una RTX 3060 o superior sería adecuada.
- El modelo puede ejecutarse en CPU para inferencia de baja frecuencia, aunque con latencia mayor (varios segundos por imagen).
- Opciones de despliegue: dado que es un modelo PyTorch estándar, puede servirse con TorchServe, o exportarse a ONNX para optimización. No se menciona soporte para vLLM, llama.cpp u Ollama, que son específicos de modelos de lenguaje.
- Throughput estimado: en una GPU moderna (p. ej., RTX 4090), se pueden procesar decenas de imágenes por segundo con fp16 y batching, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo pertenece a una familia específica (GeoNUSAF) y no se han publicado resultados comparativos con alternativas como DeepLabV3+, U-Net o otros segmentadores de teledetección. Se recomienda consultar benchmarks generales de segmentación semántica en imágenes de satélite (p. ej., DeepGlobe, SpaceNet) para contextualizar el rendimiento.

## Limitaciones y advertencias

- Sesgo geográfico: el modelo está entrenado exclusivamente en el valle de Katmandú; su rendimiento en otras regiones o climas puede degradarse significativamente.
- Clases desbalanceadas: la clase UnusedLand tiene un IoU muy bajo (0.2977) y una precisión moderada (0.5821), lo que indica dificultad para distinguirla de otras clases como agrícola o residencial dispersa.
- Dependencia de datos sintéticos: el entrenamiento utiliza 804 imágenes sintéticas, cuya distribución puede no coincidir perfectamente con la realidad, aunque la validación no las incluye.
- Resolución fija: la entrada es de 512×512 píxeles; imágenes de mayor resolución deben ser troceadas en teselas, lo que puede perder contexto global.
- Sin licencia especificada: no se puede determinar si el modelo es de uso libre, con restricciones académicas o comercial. Contactar con el autor antes de usar en producción.
- Sin soporte de idiomas ni texto: es un modelo puramente visual; no admite comandos de lenguaje natural ni tool calling.
- Sin información sobre cuantización: no se garantiza que los pesos sean compatibles con formatos optimizados como TensorRT o CoreML sin conversión manual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sugam24/geonusaf-s4-tcsegformer-R1-block-fold1
- Dataset de pares sintéticos (etapa 3): https://huggingface.co/sugam24/geonusaf-stage3-fakepairs-block-fold1
- Backbone preentrenado: https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
