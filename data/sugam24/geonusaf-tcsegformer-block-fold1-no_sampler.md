# sugam24/geonusaf-tcsegformer-block-fold1-no_sampler

## Resumen

GeoNUSAF TC-SegFormer (no_sampler) es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por sugam24, que clasifica el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Se basa en la arquitectura SegFormer con backbone `nvidia/segformer-b0-finetuned-ade-512-512` y está entrenado sobre parches de 512x512 píxeles a una resolución de 0.586 m/px. El modelo forma parte de un estudio de ablación (variante `no_sampler`) dentro de un esquema de validación cruzada por bloques (fold 1 de 3). Su relevancia radica en ofrecer una solución ligera y específica para cartografía de uso de suelo en entornos urbanos densos, con métricas de validación publicadas (mIoU 0.4805). No se dispone de licencia, idiomas ni pipeline declarados en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (backbone B0, `nvidia/segformer-b0-finetuned-ade-512-512`) |
| Parametros totales | no disponible (basado en SegFormer-B0, ~3.7M, sin confirmar) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrada de imagen 512x512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.5 GB, probablemente safetensors o pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SegFormer, un transformer jerárquico para segmentación semántica que combina un encoder con atención de ventana y un decoder ligero basado en MLP. El backbone es el B0 preentrenado en ADE20K, ajustado para la tarea específica. El entrenamiento se realizó sobre el conjunto GeoNUSAF del valle de Katmandú, con 6 clases y `ignore_index=255`. Se utilizó un split por bloques (sequence-block cross-validation) como proxy del orden de exportación, con fold 1 de 3. La variante `no_sampler` desactiva el balanced sampler, pero mantiene otras técnicas: reweighting por CSA (con tau=[0.6, 0.35, 0.35, 0.6, 0.6, 0.6] y w_min=0.25) y pérdida soft-clDice (mu=0.3). La mejor época fue la 20, con semilla 42. No se especifican el número de épocas totales, el tamaño del dataset ni el número de imágenes.

## Capacidades

- Segmentación semántica de imágenes de teledetección a nivel de píxel, con 6 clases de uso de suelo.
- Clasificación de áreas residenciales, carreteras, ríos, bosques, suelo no utilizado y agrícola.
- Entrada de imágenes de 512x512 píxeles, con resolución de 0.586 m/px.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente visual).
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Cartografía de uso de suelo urbano: el modelo puede generar mapas de cobertura terrestre para el valle de Katmandú, útil para planificación urbana y gestión de recursos.
- Monitorización de cambios en el tiempo: al ser entrenado con imágenes de alta resolución, permite detectar variaciones en áreas residenciales o agrícolas mediante comparación de segmentaciones de distintas fechas.
- Gestión de riesgos naturales: la identificación de ríos y zonas de suelo no utilizado ayuda a modelar inundaciones o deslizamientos en entornos montañosos.
- Inventario forestal: la clase "Forest" con IoU 0.5937 permite estimar la extensión de bosques y apoyar políticas de conservación.
- Planificación de infraestructuras: la detección de carreteras (IoU 0.3497) puede servir para actualizar redes viales en sistemas de información geográfica.
- Investigación en teledetección: como modelo de referencia en el estudio GeoNUSAF, sirve para comparar técnicas de segmentación y estrategias de muestreo en dominios específicos.

## Benchmarks y rendimiento

Los resultados de validación publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0.4805 |
| mF1 | 0.6252 |
| OA (overall accuracy) | 0.8059 |
| Kappa | 0.6440 |

Desglose por clase (IoU, precisión y recall):

| Clase | IoU | UA (prec) | PA (rec) |
|---|---|---|---|
| Residential | 0.8445 | 0.9176 | 0.9138 |
| Road | 0.3497 | 0.3931 | 0.7600 |
| River | 0.2920 | 0.3494 | 0.6399 |
| Forest | 0.5937 | 0.9716 | 0.6042 |
| UnusedLand | 0.2695 | 0.4343 | 0.4153 |
| Agricultural | 0.5335 | 0.6817 | 0.7105 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- Dado el tamaño del repo (0.5 GB) y el uso de un backbone B0, se estima que el modelo puede ejecutarse en GPUs con 4-6 GB de VRAM, aunque no hay datos confirmados.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar las variantes del mismo estudio (por ejemplo, `geonusaf-tcsegformer-block-fold1-no_cldice` o `geonusaf-tcsegformer-block-fold2`) para análisis de ablación, pero no se incluyen datos cuantitativos aquí.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el valle de Katmandú; su generalización a otras regiones geográficas o resoluciones espaciales no está garantizada.
- Las clases con menor rendimiento (Road, River, UnusedLand) presentan IoU por debajo de 0.35, lo que indica dificultades para segmentar elementos lineales o heterogéneos.
- No se ha publicado información sobre sesgos, riesgos de alucinación (no aplica al ser un modelo discriminativo) ni restricciones de uso comercial debido a la ausencia de licencia declarada.
- El uso en producción requiere validación adicional con datos locales y posible reentrenamiento con muestras específicas.
- La ausencia de balanced sampler (variante `no_sampler`) puede afectar al rendimiento en clases minoritarias, como se observa en los resultados.

## Enlaces

- [HuggingFace: sugam24/geonusaf-tcsegformer-block-fold1-no_sampler](https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1-no_sampler)
- [Variante no_cldice](https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1-no_cldice)
- [Variante fold2](https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold2)
- [Variante no_detail](https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1-no_detail)
