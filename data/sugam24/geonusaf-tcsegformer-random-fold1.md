# sugam24/geonusaf-tcsegformer-random-fold1

## Resumen

GeoNUSAF TC-SegFormer es un modelo de segmentación semántica para imágenes de teledetección desarrollado por el usuario sugam24 y publicado en Hugging Face. Está diseñado específicamente para clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, terreno sin uso y agrícola. El modelo se basa en el arquitectura SegFormer-B0, preentrenado en ADE20K y ajustado sobre el dataset GeoNUSAF, con una resolución de 512x512 píxeles a 0.586 metros por píxel.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana y el monitoreo territorial en regiones densamente pobladas, donde la clasificación precisa del uso del suelo es crítica para la gestión de recursos y la evaluación de riesgos. Al ser un modelo de código abierto (aunque sin licencia explícita), permite a desarrolladores e investigadores reproducir y adaptar el pipeline para otras regiones o conjuntos de datos. El repositorio tiene un tamaño de 0.6 GB, lo que lo hace viable para despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (encoder-decoder transformer) |
| Parametros totales | no disponible (tamaño del repo: 0.6 GB) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no aplicable (segmentación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, es un modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | no disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SegFormer-B0, un transformer para segmentación semántica que combina un encoder jerárquico con un decoder ligero basado en MLP (multi-layer perceptron). El backbone es `nvidia/segformer-b0-finetuned-ade-512-512`, preentrenado en el dataset ADE20K, y se ha ajustado para el dataset GeoNUSAF con 6 clases y `ignore_index=255`. El entrenamiento utilizó una división aleatoria (random split) en 3 pliegues, siendo este el fold 1, con semilla 42 y la mejor época en 15.

El proceso de entrenamiento incluyó varias técnicas avanzadas: reweighting de clases con CSA (Class-Specific Attention) con tau configurados en [0.6, 0.35, 0.35, 0.6, 0.6, 0.6] y `w_min=0.25`, pérdida soft-clDice (con mu=0.3), y un muestreador balanceado para manejar el desequilibrio de clases. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, pero el contexto geográfico (valle de Katmandú) y la resolución espacial sugieren imágenes aéreas o satelitales.

## Capacidades

- Segmentación semántica de imágenes de teledetección, clasificando cada píxel en una de 6 categorías de uso de suelo.
- Manejo de clases con desequilibrio mediante técnicas de reweighting y soft-clDice, lo que mejora el rendimiento en clases minoritarias como río o carretera.
- Inferencia en imágenes de 512x512 píxeles con resolución espacial de 0.586 m/px.
- Soporte para `ignore_index=255`, permitiendo excluir regiones no etiquetadas del cálculo de pérdida.
- No soporta tool calling, agentes, ni procesamiento de lenguaje natural; es un modelo puramente de visión.

## Casos de uso

- Planificación urbana: el modelo puede generar mapas de uso de suelo actualizados para el valle de Katmandú, ayudando a detectar áreas residenciales, carreteras y espacios agrícolas, con una precisión de 0.7646 de exactitud global (OA).
- Gestión de riesgos naturales: la clasificación de ríos y carreteras (aunque con rendimiento limitado) puede integrarse en sistemas de alerta temprana para inundaciones o deslizamientos.
- Monitorización ambiental: la clase forestal (IoU 0.5343) permite rastrear cambios en la cobertura vegetal a lo largo del tiempo, útil para estudios de deforestación.
- Análisis agrícola: la segmentación de terrenos agrícolas (IoU 0.4157) puede servir para estimar superficies cultivadas y planificar recursos hídricos.
- Sistemas de información geográfica (SIG): el modelo puede ser integrado en pipelines de SIG para enriquecer bases de datos catastrales o de infraestructura.
- Investigación académica: como punto de partida para comparar técnicas de segmentación en entornos de alta densidad urbana y terreno complejo.

## Benchmarks y rendimiento

En la validación del fold 1 (división aleatoria), el modelo alcanzó las siguientes métricas:

| Metrica | Valor |
|---|---|
| mIoU | 0.4573 |
| mF1 | 0.6080 |
| Exactitud global (OA) | 0.7646 |
| Kappa | 0.6174 |

| Clase | IoU | Precisión (UA) | Recall (PA) |
|---|---|---|---|
| Residencial | 0.8221 | 0.9029 | 0.9018 |
| Carretera | 0.3501 | 0.4378 | 0.6363 |
| Río | 0.2546 | 0.2835 | 0.7143 |
| Bosque | 0.5343 | 0.8095 | 0.6112 |
| Terreno no utilizado | 0.3672 | 0.5059 | 0.5725 |
| Agrícola | 0.4157 | 0.6195 | 0.5582 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo pesa 0.6 GB, por lo que cabe en la memoria de una GPU de consumo con al menos 2 GB de VRAM, aunque se recomienda 4 GB para inferencia cómoda.
- GPUs compatibles: RTX 3060, RTX 4060, A100, etc., dependiendo de la resolución de entrada y el batch.
- Puede ejecutarse en CPU para inferencia de una sola imagen, aunque con mayor latencia.
- Opciones de despliegue: Hugging Face Transformers (con `SegformerForSemanticSegmentation`), ONNX, TensorRT, o llama.cpp (no es un modelo de lenguaje, así que no aplica). No hay mención a vLLM o TGI.
- Latencia estimada: no disponible en la información, pero para un modelo SegFormer-B0 se espera una inferencia de pocos milisegundos en GPU moderna.

## Comparativa con modelos similares

No hay datos comparativos en la información disponible. Sin embargo, el modelo se puede comparar con otros modelos de segmentación de teledetección como:

- **GeoNUSAF TC-SegFormer (block split, fold 1)**: variante del mismo modelo con división por bloques, que puede tener diferentes métricas de validación.
- **GeoNUSAF UNetFormer-R18**: otra arquitectura basada en UNet con ResNet-18, también publicada por el mismo autor.
- **SegFormer base (nvidia/segformer-b0-finetuned-ade-512-512)**: preentrenado en ADE20K, sin ajuste específico para GeoNUSAF, con rendimiento generalista.

No se dispone de resultados de benchmark comparativos entre estas variantes.

## Limitaciones y advertencias

- Rendimiento bajo en clases minoritarias como río (IoU 0.2546) y carretera (IoU 0.3501), lo que limita su uso en aplicaciones de precisión en estas categorías.
- El modelo está entrenado específicamente para el valle de Katmandú; su generalización a otras regiones geográficas no está validada.
- No se especifica licencia, lo que genera incertidumbre sobre su uso comercial o redistribución.
- No se documentan sesgos potenciales (por ejemplo, variaciones estacionales, sombras o condiciones climáticas) en los datos de entrenamiento.
- La resolución fija de 512x512 puede requerir re-escalado de imágenes de entrada, lo que puede degradar la calidad en áreas con detalles finos.
- No hay información sobre la composición del dataset GeoNUSAF (número de imágenes, fuentes, etiquetas), lo que dificulta evaluar la robustez.

## Enlaces

- Hugging Face: https://huggingface.co/sugam24/geonusaf-tcsegformer-random-fold1
- Variante block split: https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1
- Variante UNetFormer: https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold0
- Repositorio de scripts relacionados: https://github.com/SarahGeoAI/SegFormer-Segmentation
