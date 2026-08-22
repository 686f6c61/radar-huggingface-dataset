# sugam24/geonusaf-unet-r18-random-fold1

## Resumen
GeoNUSAF - UNet-ResNet18 es un modelo de segmentación semántica de uso del suelo desarrollado por sugam24, diseñado específicamente para la clasificación de seis clases de cobertura terrestre en el valle de Katmandú (Nepal). El modelo emplea una arquitectura U-Net con encoder ResNet18 preentrenado en ImageNet y un decodificador con canales [128, 64, 32, 16, 8], sumando 12,46 millones de parámetros. Se trata de uno de los tres pliegues (fold 1) de un experimento de validación con división aleatoria de datos, cuyos pesos publicados corresponden a la media exponencial móvil (EMA) con factor 0,999, no a los pesos finales crudos.

El modelo resuelve el problema de cartografiar automáticamente categorías de uso del suelo a partir de imágenes de teledetección, con una resolución efectiva de 0,586 m/píxel y una entrada de 512x512 píxeles. Su relevancia radica en ser una solución ligera (12,5 M de parámetros) y de código abierto para planificación urbana y monitoreo ambiental en regiones de alta densidad urbana como el valle de Katmandú. Aunque el repositorio no especifica licencia ni idiomas, el modelo está entrenado para clases como residencial, carretera, río, bosque, suelo no utilizado y agrícola, con una precisión global de validación (OA) de 0,7314 y un IoU medio de 0,4197.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | UNet (smp.Unet) con encoder ResNet18 preentrenado en ImageNet |
| Parametros totales | 12,46 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo convolucional, entrada 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1,4 GB, probablemente safetensors, no especificado) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura UNet clásica de segmentación semántica, compuesta por un encoder ResNet18 (preentrenado en ImageNet) que extrae características multiescala y un decodificador con bloques convolucionales de canales decrecientes [128, 64, 32, 16, 8], conectados mediante skip connections. La entrada es una imagen de 512x512 píxeles normalizada con estadísticas de ImageNet, y la salida es un mapa de segmentación con 6 clases, ignorando píxeles etiquetados con índice 255. El entrenamiento se realizó con regularización de peso (weight decay 0,01 excepto bias y norm), label smoothing 0.05, dropout 0.1 y EMA con factor 0.999. La validación se realizó mediante un split aleatorio (random split) con semilla 42, y el modelo corresponde al fold 1 de 3. La mejor época fue la 19, con métricas de validación: IoU medio 0.4197, F1 medio 0.5602, precisión global 0.7314 y kappa 0.5907. No se especifican datos sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades
- Segmentación semántica de uso de suelo en imágenes de teledetección a alta resolución (0.586 m/px).
- Clasificación en seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Manejo de imágenes de 512x512 píxeles con normalización ImageNet.
- Entrenado para entornos urbanos densos y regiones montañosas, con capacidad de distinguir entre áreas construidas y naturales.
- Implementado con la librería `segmentation-models-pytorch`, lo que facilita su integración en pipelines de PyTorch.
- Soporta inferencia en GPU y CPU (aunque con menor rendimiento).
- No soporta tool calling, agentes ni capacidades multimodales adicionales, ya que es un modelo puramente convolucional para visión.

## Casos de uso
- Planificación urbana: el modelo permite cartografiar la distribución de áreas residenciales, carreteras y suelos no utilizados en el valle de Katmandú, lo que facilita la toma de decisiones sobre expansión urbana y ordenación del territorio.
- Monitorización de recursos naturales: la clasificación de bosques, ríos y suelo agrícola ayuda a detectar cambios en la cobertura vegetal o la erosión del suelo, útil para políticas de conservación y gestión ambiental.
- Gestión de riesgos de desastres: al identificar carreteras y ríos con precisión, el modelo puede apoyar en la planificación de rutas de evacuación y evaluación de zonas inundables.
- Agricultura de precisión: la clase agrícola permite identificar parcelas de cultivo, lo que puede combinarse con datos de NDVI para estimar rendimientos y optimizar el riego.
- Despliegue en sistemas de información geográfica (SIG): los mapas de segmentación pueden integrarse en plataformas SIG para generar capas temáticas actualizables, por ejemplo en el desarrollo de catastro urbano.
- Generación de datos de entrenamiento: el modelo puede usarse para etiquetar automáticamente nuevas imágenes de satélite, reduciendo el esfuerzo humano de anotación en proyectos de teledetección.

## Benchmarks y rendimiento
Se han publicado las métricas de validación del modelo (fold 1, split aleatorio) en el repositorio de HuggingFace:

| Metrica | Valor |
|---|---|
| mIoU (media IoU) | 0.4197 |
| mF1 (media F1) | 0.5602 |
| Overall Accuracy (OA) | 0.7314 |
| Kappa | 0.5907 |

Per-clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.7791 | 0.8758 |
| Road | 0.2736 | 0.4297 |
| River | 0.1516 | 0.2633 |
| Forest | 0.5932 | 0.7446 |
| UnusedLand | 0.2760 | 0.4326 |
| Agricultural | 0.4445 | 0.6154 |

No se han publicado comparaciones con otros modelos en la información disponible, por lo que no es posible establecer una comparativa cuantitativa.

## Requisitos de hardware
- VRAM estimada: con 12,46 M de parámetros y entrada 512x512, la inferencia requiere aproximadamente 1-2 GB de VRAM en FP32, y menos de 1 GB en cuantización FP16.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. Es apto para GPU de consumo.
- Se puede ejecutar en CPU con tiempos de inferencia de varios segundos por imagen, pero se recomienda GPU para uso en tiempo real.
- Opciones de despliegue: al ser un modelo PyTorch con `segmentation-models-pytorch`, puede integrarse en frameworks como FastAPI, ONNX Runtime o TensorRT para optimización. No está disponible en formato GGUF ni en Ollama, ya que es un modelo de visión.
- Latencia estimada: en una GPU moderna (RTX 3080), la inferencia de una imagen 512x512 tarda aproximadamente 10-20 ms, alcanzando throughput de 50-100 imágenes por segundo.

## Comparativa con modelos similares
No se dispone de datos de comparación con otros modelos en la información proporcionada. Sin embargo, se puede contextualizar con arquitecturas similares:
- UNet con encoder ResNet34 o ResNet50 (más parámetros, mayor capacidad pero más coste computacional).
- UNetFormer con ResNet18 (variante del mismo autor, disponible en otros folds del proyecto GeoNUSAF).
- DeepLabV3+ con ResNet50 (arquitectura alternativa para segmentación semántica).

No se pueden ofrecer números comparativos porque no se han publicado resultados de benchmarks externos en la documentación del modelo.

## Limitaciones y advertencias
- La licencia no está especificada, por lo que el uso comercial está sujeto a incertidumbre legal; se recomienda contactar al autor antes de integrarlo en productos.
- El modelo está entrenado específicamente para el valle de Katmandú; su generalización a otras regiones geográficas puede ser limitada, especialmente en paisajes con características espectrales distintas.
- Las clases de carretera y río tienen IoU bajo (0.27 y 0.15 respectivamente), lo que indica dificultad para segmentar elementos lineales y estrechos, posiblemente por la resolución de entrada o la representación en el dataset.
- La métrica mIoU de 0.42 es moderada; en aplicaciones críticas se recomienda realizar una evaluación adicional con datos propios.
- No se han documentado sesgos específicos, pero el modelo puede heredar sesgos del dataset de entrenamiento (por ejemplo, representación desbalanceada de clases).
- Riesgo de alucinación: no aplica directamente, pero existe el riesgo de clasificaciones erróneas en áreas ambiguas (por ejemplo, suelo no utilizado vs agrícola).
- La arquitectura no soporta entrada de contexto variable; la entrada está fijada a 512x512, lo que puede requerir redimensionado o tiling para imágenes mayores.

## Enlaces
- Repositorio del modelo: https://huggingface.co/sugam24/geonusaf-unet-r18-random-fold1
- Folds hermanos del mismo proyecto: [fold0](https://huggingface.co/sugam24/geonusaf-unet-r18-random-fold0) y [fold2](https://huggingface.co/sugam24/geonusaf-unet-r18-random-fold2)
- Repositorio del autor (proyecto de generación de imágenes de satélite): https://github.com/sugam24/Stable-diffusion-with-control-net
- Documentación de Segmentation Models PyTorch: https://segmentation-models-pytorch.readthedocs.io/en/latest/models.html
- Explicación de arquitectura U-Net: https://www.geeksforgeeks.org/machine-learning/u-net-architecture-explained/
