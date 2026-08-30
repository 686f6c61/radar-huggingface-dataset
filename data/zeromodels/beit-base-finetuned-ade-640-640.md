# zeromodels/beit-base-finetuned-ade-640-640

## Resumen

El modelo `zeromodels/beit-base-finetuned-ade-640-640` es una conversión a Keras 3 del checkpoint original de Microsoft `microsoft/beit-base-finetuned-ade-640-640`, un transformer de visión (ViT) preentrenado de forma autosupervisada en ImageNet-21k (14 millones de imágenes, 21 841 clases) y ajustado para segmentación semántica en el conjunto ADE20K (150 clases) a una resolución de 640×640 píxeles. La conversión, realizada por el proyecto ZeroModels, permite ejecutar el mismo modelo sin modificaciones sobre los backends TensorFlow, PyTorch o JAX mediante la API de Keras 3.

Este modelo resuelve el problema de asignar una etiqueta semántica (por ejemplo, "carretera", "edificio", "persona") a cada píxel de una imagen, una tarea fundamental en visión por computador. Su relevancia actual radica en que ofrece una implementación portable y ligera (tamaño base, aproximadamente 86 millones de parámetros) de un modelo contrastado en el benchmark ADE20K, con licencia Apache 2.0 y sin dependencias de frameworks propietarios. La arquitectura BEiT incorpora desplazamiento relativo por capa, escala de capa aprendible y agrupación media de los tokens de parche, lo que la distingue de otros ViT estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (Vision Transformer) con cabeza UPerNet para segmentación semántica |
| Parametros totales | No disponible (modelo base, ~86 M según la arquitectura BEiT-base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, procesa imágenes de 640×640) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (conversión a Keras 3; probablemente formato de pesos de Keras, p. ej. `.weights.h5` o similar) |

## Arquitectura y entrenamiento

BEiT (BERT Pre-Training of Image Transformers) sigue la arquitectura de los transformers de visión, pero introduce tres innovaciones clave: un sesgo de posición relativo por capa, una escala de capa aprendible en cada rama residual y agrupación media de los tokens de parche en lugar de usar solo el token de clasificación. El modelo base se preentrenó de forma autosupervisada en ImageNet-21k mediante enmascarado de parches (masked image modeling), similar al enmascarado de tokens en BERT. Posteriormente se ajustó para segmentación semántica en ADE20K a resolución 640×640, añadiendo una cabeza UPerNet que combina características multiescala.

La conversión a Keras 3 mantiene los pesos originales y la misma arquitectura, pero permite cargar el modelo con `BeitSemanticSegment.from_weights()` y ejecutarlo en TensorFlow, JAX o PyTorch simplemente cambiando la variable de entorno `KERAS_BACKEND`. La normalización (media 0.5, desviación 0.5) está integrada en el modelo, por lo que se deben pasar píxeles sin normalizar en el rango [0, 255]. La salida son logits a un cuarto de la resolución de entrada (160×160 para una imagen de 640×640), que luego se remuestrean a la resolución original mediante interpolación bilineal y argmax.

## Capacidades

- Segmentación semántica de imágenes: asigna una de 150 clases de ADE20K a cada píxel de la imagen de entrada.
- Salida a resolución completa: el postprocesado devuelve un mapa de etiquetas por píxel con las dimensiones de la imagen original.
- Extracción de características: el modelo puede usarse como backbone (`as_backbone=True`) para obtener secuencias de tokens por bloque, útil para tareas de representación.
- Portabilidad entre frameworks: el mismo código y pesos funcionan en TensorFlow, PyTorch y JAX gracias a Keras 3.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente visual.
- No es multilingüe; los idiomas no son aplicables.

## Casos de uso

- Análisis de escenas urbanas: el modelo puede segmentar imágenes de cámaras de tráfico o vehículos autónomos, identificando carreteras, vehículos, peatones y señales. Su resolución de 640×640 y las 150 clases de ADE20K lo hacen adecuado para entornos urbanos.
- Edición y postproducción de imágenes: en herramientas de diseño o fotografía, permite seleccionar automáticamente regiones como cielo, suelo o objetos para aplicar filtros o cambios selectivos.
- Agricultura de precisión: segmentación de cultivos, suelo y maleza en imágenes aéreas o de drones, facilitando la monitorización de campos a partir de fotografías de alta resolución.
- Diagnóstico asistido por imagen médica: aunque no está entrenado específicamente para tejidos biológicos, puede adaptarse mediante fine-tuning sobre conjuntos médicos para delimitar órganos o lesiones en radiografías o tomografías.
- Realidad aumentada y robótica: la segmentación semántica permite a robots o dispositivos de RA comprender la escena y colocar objetos virtuales de forma coherente sobre superficies reales.
- Análisis de imágenes satelitales: identificación de zonas urbanas, bosques, agua y otros elementos en imágenes de satélite, útil para planificación territorial o seguimiento medioambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original de Microsoft tampoco incluye métricas concretas (p. ej., mIoU en ADE20K) en los datos proporcionados.

## Requisitos de hardware

- No se dispone de requisitos oficiales de VRAM o GPU en la documentación consultada.
- Al ser un modelo base de aproximadamente 86 millones de parámetros, la inferencia es factible en GPUs de consumo medio. Una estimación razonable (no oficial) sería:
  - FP32: alrededor de 350 MB de VRAM solo para los pesos.
  - FP16: alrededor de 175 MB.
  - Con cuantización a 8 bits, podría reducirse aún más.
- Por tanto, es viable en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: al ser una conversión Keras 3, puede ejecutarse con los backends de TensorFlow, PyTorch o JAX. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo original de Microsoft `microsoft/beit-base-finetuned-ade-640-640` es la referencia directa; otras alternativas de segmentación semántica como SegFormer, Mask2Former o DeepLabV3 no han sido comparadas aquí por falta de datos en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo fue preentrenado en ImageNet-21k y ajustado en ADE20K, por lo que puede presentar sesgos derivados de estos conjuntos (por ejemplo, menor precisión en escenas poco representadas, como interiores industriales o paisajes no occidentales).
- La resolución fija de 640×640 puede limitar su uso en imágenes de muy alta resolución sin redimensionado previo, lo que podría degradar la precisión en objetos pequeños.
- La salida a un cuarto de resolución requiere interpolación, lo que puede suavizar bordes finos en la segmentación.
- No se han publicado métricas de rendimiento oficiales, por lo que no es posible validar su calidad frente a otros modelos sin realizar pruebas propias.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución correspondiente.
- La conversión a Keras 3 es reciente y puede haber diferencias numéricas menores respecto al checkpoint original de PyTorch, aunque el proyecto afirma que los pesos se cargan directamente.

## Enlaces

- Modelo en Hugging Face: [zeromodels/beit-base-finetuned-ade-640-640](https://huggingface.co/zeromodels/beit-base-finetuned-ade-640-640)
- Modelo original de Microsoft: [microsoft/beit-base-finetuned-ade-640-640](https://huggingface.co/microsoft/beit-base-finetuned-ade-640-640)
- Colección de variantes BEiT de ZeroModels: [colección BEiT](https://huggingface.co/collections/zeromodels/beit-6a9352067192fd9fcfcfe6f1)
- Repositorio GitHub de ZeroModels: [ZeroModels](https://github.com/IMvision12/ZeroModels)
- Documentación de BEiT en ZeroModels: [Docs BEiT](https://imvision12.github.io/ZeroModels/beit/)
- Paper original: [BEiT: BERT Pre-Training of Image Transformers (arXiv:2106.08254)](https://arxiv.org/abs/2106.08254)
