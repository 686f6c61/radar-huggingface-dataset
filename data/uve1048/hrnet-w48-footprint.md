# Uve1048/hrnet-w48-footprint

## Resumen

HRNet-W48 Footprint es un modelo de segmentación semántica binaria especializado en la extracción de huellas de edificios (building footprints) a partir de ortofotografías de alta resolución (aéreas o satelitales). Lo desarrolla el usuario Uve1048 y se publica bajo licencia MIT. El modelo resuelve un problema muy concreto del ámbito geoespacial: convertir píxeles de imagen aérea en máscaras binarias que distingan edificio de fondo, como paso previo a la vectorización y generación de Shapefiles listos para SIG.

Técnicamente se apoya en una backbone HRNet-W48 con una cabeza FCNHead (2 clases: `background` y `building`), implementado sobre MMSegmentation 1.x. La elección de HRNet responde a su capacidad de mantener representaciones de alta resolución a lo largo de toda la red, lo que preserva mejor los bordes de los edificios frente a arquitecturas encoder-decoder que submuestrean agresivamente antes de recuperar detalle.

Es relevante ahora porque forma parte de un ecosistema de herramientas abiertas (Footprint-Creater y HRNet-Footprint-Trainer) que cubre el ciclo completo: entrenamiento, inferencia y post-procesado a producto GIS. No obstante, es un checkpoint entrenado sobre un dataset privado y sin métricas publicadas en benchmarks, por lo que su valor práctico depende de la validación sobre imágenes propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HRNet-W48 (backbone) + FCNHead (EncoderDecoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 1024 × 1024 px) |
| Tipos de cuantización | no disponible (pesos en FP32, ~542 MB) |
| Idiomas soportados | en, zh (etiquetas de la model card; no aplica a la tarea de visión) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint PyTorch / MMSegmentation) |

## Arquitectura y entrenamiento

El modelo sigue el esquema EncoderDecoder de MMSegmentation: una backbone HRNet-W48 que mantiene ramas paralelas a distintas resoluciones e intercambia información entre ellas de forma repetida, preservando una representación de alta resolución hasta el final. La cabeza es una FCNHead con `in_channels=[48, 96, 192, 384]`, `channels=512`, `input_transform="resize_concat"`, kernel 1×1, una convolución, dropout 0.1 y 2 clases de salida. La entrada es RGB de 1024 × 1024 px con normalización ImageNet (mean `[123.675, 116.28, 103.53]`, std `[58.395, 57.12, 57.375]`) y conversión BGR→RGB. En test se usa el modo `whole` (inferencia sobre imagen completa).

El entrenamiento se realizó sobre un dataset privado de ortofotos de alta resolución con etiquetas vectoriales de edificios, con parches de 1024 × 1024 y stride 512, durante 6000 iteraciones. La función de pérdida combina CrossEntropy y Dice con el mismo peso, y el optimizador es SGD con decaimiento PolyLR. Como detalle de implementación, los píxeles puramente negros `(0,0,0)` y puramente blancos `(255,255,255)` se marcan como `ignore_index` en las etiquetas para que los bordes de imagen no contribuyan a la pérdida. No se documenta el número de tokens ni el volumen total del dataset.

## Capacidades

- Segmentación semántica binaria de edificios a nivel de píxel sobre ortofotos con GSD aproximado de 5–20 cm.
- Generación de máscaras de edificio (0 = fondo, 1 = edificio) directamente consumibles por pipelines SIG.
- Pre-etiquetado para vectorización manual posterior.
- Uso como máscara intermedia en flujos de detección de cambios.
- Inferencia sobre imágenes completas mediante ventana deslizante con ~50 % de solapamiento y posterior cosido.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la imagen de entrada.
- No realiza segmentación de instancias: los edificios adyacentes se fusionan en una sola región.

## Casos de uso

- Pre-etiquetado para vectorización manual: el modelo genera una máscara de edificios que un operador SIG revisa y convierte en polígonos, reduciendo el trabajo de digitalización manual sobre ortofotos de 5–20 cm de GSD.
- Generación de Shapefiles listos para GIS: combinado con el pipeline Footprint-Creater, la máscara se post-procesa (filtrado por área mínima, relleno de huecos, suavizado con buffer mitre-join, simplificación Douglas-Peucker y sustitución por rectángulo mínimo envolvente) para producir geometrías limpias.
- Detección de cambios en el territorio: se ejecuta el modelo sobre ortofotos de dos fechas distintas y se comparan las máscaras resultantes para localizar nuevas construcciones o demoliciones, usando la máscara como capa intermedia.
- Actualización de cartografía municipal: sobre vuelos locales, el modelo sirve como primera pasada para refrescar capas de edificios en catastro o planeamiento, siempre que se valide previamente sobre la imagen de la zona.
- Análisis de ocupación del suelo: se agregan las máscaras por teselas para estimar superficie construida en un área de estudio, útil en estudios urbanísticos y ambientales.
- Control de calidad de datasets: se usa para verificar la coherencia entre una capa vectorial existente y la realidad de la ortofoto, señalando discrepancias que requieran revisión manual.
- Reentrenamiento con datos locales: el checkpoint sirve como punto de partida (fine-tuning) mediante HRNet-Footprint-Trainer para adaptar el modelo a sensores, estaciones o materiales de cubierta propios de una región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint se entrenó sobre un dataset privado de ortofotos y vectores de edificios, por lo que no se reporta IoU comparable en benchmarks públicos. Se recomienda validar sobre imágenes propias antes de usar en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos de ~542 MB en FP32 y entrada de 1024 × 1024 px, el consumo es moderado y cabe holgadamente en GPUs de consumo actuales.
- GPU recomendadas: cualquier GPU con al menos ~4–8 GB de VRAM para parches de 1024 × 1024; para procesar ortofotos completas por ventana deslizante se recomienda una RTX 3090/4090 o superior para mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores; no se dispone de cifras exactas de consumo.
- Opciones de despliegue: MMSegmentation 1.x con PyTorch, `mmengine`, `mmcv-lite`; la inferencia se hace vía `mmseg.apis.init_model` e `inference_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto / entrada | Licencia | Métricas publicadas |
|---|---|---|---|---|---|
| HRNet-W48 Footprint (este) | HRNet-W48 + FCNHead | 2 (fondo/edificio) | 1024 × 1024 px | MIT | No |
| Segmentadores genéricos tipo DeepLabV3+ / U-Net | Encoder-decoder | Configurable | Configurable | Variable | Depende del checkpoint |
| Modelos de building footprint tipo SpaceNet | Varía (U-Net, Mask R-CNN, etc.) | 1–2 | Varía | Varía | Habitualmente sí (IoU público) |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas concretas en la información proporcionada. La comparación cualitativa se limita a la elección de backbone (HRNet preserva bordes mejor que encoder-decoder con submuestreo agresivo) y al hecho de que este checkpoint no publica métricas, a diferencia de muchos modelos entrenados sobre datasets públicos tipo SpaceNet.

## Limitaciones y advertencias

- Segmentación semántica, no de instancias: los edificios que se tocan se fusionan en un único polígono, lo que impide separarlos sin post-procesado adicional.
- Falsos positivos sistemáticos en bordes negros o blancos puros de la ortofoto: el modelo los predice como edificio. Deben enmascararse antes de la inferencia; el filtrado por área posterior no lo corrige porque forman una única región grande.
- Sensibilidad al dominio: cambios estacionales, diferencias de sensor y materiales de cubierta poco habituales (chapa metálica, cubiertas verdes) degradan la precisión. La solución fiable es reentrenar con datos locales.
- Sin métricas públicas: no hay IoU comparable en benchmarks; es imprescindible validar sobre imágenes propias antes de producción.
- El post-procesado es crítico: omitir el suavizado mitre-join o la simplificación Douglas-Peucker produce contornos dentados en GIS.
- Licencia MIT: permite uso comercial, pero el autor declara que se ofrece "as-is" y que el usuario es responsable de cumplir la normativa local de levantamiento y datos.
- Idiomas: las etiquetas en/zh de la model card no implican capacidades lingüísticas; el modelo solo procesa imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uve1048/hrnet-w48-footprint
- Repositorio Footprint-Creater (pipeline de post-procesado a Shapefiles): https://github.com/UVE1048/Footprint-Creater
- Repositorio HRNet-Footprint-Trainer (entrenamiento y `predict.py`): https://github.com/UVE1048/HRNet-Footprint-Trainer
- Script de inferencia de referencia: https://github.com/UVE1048/HRNet-Footprint-Trainer/blob/main/predict.py
