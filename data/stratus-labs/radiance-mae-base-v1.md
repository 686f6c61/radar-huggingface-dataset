# stratus-labs/radiance-mae-base-v1

## Resumen

Radiance MAE Base v1 es un modelo fundacional de visión por computador desarrollado por Stratus Labs, especializado en imágenes de radar de apertura sintética (SAR) del satélite Sentinel-1. Se trata de un autoencoder enmascarado (MAE) basado en la arquitectura ViT-Base, preentrenado de forma autosupervisada sobre el subconjunto Sentinel-1 GRD del dataset SSL4EO-S12 durante 100 épocas. El modelo está diseñado para ser ajustado (fine-tuning) en tareas de observación de la Tierra, como cartografía de inundaciones, clasificación de cultivos, detección de deforestación o cambios urbanos.

El modelo tiene aproximadamente 110 millones de parámetros (el encoder unos 86 millones) y acepta parches de 224×224 píxeles con dos canales (polarizaciones VV y VH). Su relevancia radica en ser uno de los pocos modelos fundacionales abiertos específicamente entrenados para SAR, un dominio con menos recursos disponibles que la óptica. Al publicarse con licencia CC-BY-4.0, permite su uso comercial con atribución, lo que facilita su adopción en proyectos de monitorización ambiental y agrícola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 MAE (encoder 12 bloques, 12 cabezas, dim 768; decoder 8 bloques, dim 512) |
| Parametros totales | ~110 M (encoder ~86 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224×224) |
| Tipos de cuantizacion | no disponible (solo pesos en fp32/bf16 publicados) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch state dict (epoch_099.pt, 1.34 GB) |

## Arquitectura y entrenamiento

Radiance sigue la arquitectura estándar de los Masked Autoencoders (MAE) propuesta por He et al. (2022). El encoder es un Vision Transformer (ViT-Base) con parches de 16×16 píxeles, que procesa imágenes de 224×224 con 2 canales de entrada (VV y VH). Durante el preentrenamiento se enmascara el 75% de los parches y el decoder (8 bloques con dimensión 512) reconstruye los píxeles enmascarados. En inferencia, se puede usar el encoder sin enmascaramiento para extraer representaciones latentes de dimensión 768 por parche.

El entrenamiento se realizó sobre el subconjunto Sentinel-1 GRD del dataset SSL4EO-S12, que contiene parches SAR muestreados globalmente y normalizados en decibelios con medias y desviaciones específicas (S1_MEAN = [-12.577, -20.265], S1_STD = [5.176, 5.870]). Se usó el optimizador AdamW con tasa de aprendizaje 1.5e-4, weight decay 0.05, programación coseno y precisión bf16. El entrenamiento duró 100 épocas con batch size 64, ejecutado en una única GPU NVIDIA GB10 (DGX Spark) durante aproximadamente 15 días. La pérdida final disminuyó de forma monótona a lo largo de todas las épocas.

## Capacidades

- Extracción de características (feature extraction) para imágenes SAR de Sentinel-1 GRD con dos canales (VV y VH).
- Representaciones latentes de 768 dimensiones por parche, listas para ser usadas como entrada de cabezas de clasificación o segmentación.
- Preentrenamiento autosupervisado que permite transferir conocimiento a tareas downstream con pocos datos etiquetados.
- Soporte para fine-tuning completo o congelación del encoder (linear probing).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal, al ser un modelo puramente visual.
- No soporta entrada de imágenes ópticas (Sentinel-2) ni otros productos SAR (SLC, IW) fuera de la distribución de entrenamiento.

## Casos de uso

- Cartografía de inundaciones: ajustar el modelo sobre el dataset SEN1Floods11 para segmentar zonas inundadas a partir de pares VV/VH. Su preentrenamiento en SAR global permite generalizar mejor que modelos entrenados desde cero con pocas muestras.
- Clasificación de tipos de cultivo: usar el encoder congelado como extractor de características y entrenar un clasificador lineal sobre parches SAR multitemporales para distinguir cultivos de regadío, secano o invernaderos.
- Detección de deforestación: comparar representaciones latentes de la misma zona en diferentes fechas para identificar cambios en la cobertura forestal, aprovechando la sensibilidad de la banda VH a la estructura de la vegetación.
- Monitorización de cambios urbanos: aplicar el modelo a series temporales de Sentinel-1 para detectar nuevas construcciones o modificaciones del terreno, útil para catastro y planificación urbana.
- Estimación de humedad del suelo: extraer características de parches SAR y combinarlas con datos auxiliares para predecir contenido de humedad, relevante en agricultura de precisión y gestión de recursos hídricos.
- Detección de derrames de petróleo en el mar: ajustar el modelo para clasificar manchas oscuras en imágenes SAR, donde la polarización VV es especialmente sensible a la rugosidad de la superficie marina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay comparaciones con otros modelos fundacionales SAR y que el primer fine-tuning proporcionará la evaluación head-to-head.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~110 M parámetros. En fp32 ocupa ~440 MB, en fp16 ~220 MB. Con la entrada de 224×224 y batch 1, la VRAM necesaria es inferior a 1 GB, por lo que cabe en cualquier GPU consumer moderna (incluso en iGPU con suficiente memoria compartida).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (NVIDIA GTX 1650, RTX 3060, etc.). Para fine-tuning con batch mayor, se recomienda 8-12 GB (RTX 3080, RTX 4090).
- El entrenamiento original se realizó en una NVIDIA GB10 (DGX Spark), pero no es un requisito para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch estándar, se puede servir con TorchServe, FastAPI, o integrarse en pipelines de procesamiento por lotes. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, la inferencia de un ViT-Base sobre una imagen 224×224 suele estar en el rango de 5-15 ms por imagen, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (SAR foundation models) en la documentación proporcionada. La model card menciona que no hay benchmarks publicados contra otros modelos SAR. Se puede señalar que existen otros modelos fundacionales de observación de la Tierra (como Prithvi de IBM, o SatMAE), pero no se han encontrado datos de comparación directa en la información disponible.

## Limitaciones y advertencias

- El modelo solo acepta imágenes Sentinel-1 GRD normalizadas en dB con los valores específicos de SSL4EO-S12. Otros productos SAR (SLC, IW) o imágenes ópticas (Sentinel-2) quedan fuera de distribución y producirán resultados poco fiables.
- El tamaño de parche está fijado en 224×224 para los pesos publicados; usar otros tamaños requeriría reentrenar el modelo.
- No se aplica corrección radiométrica más allá de la normalización dB del dataset de preentrenamiento, lo que puede limitar la transferencia a regiones con condiciones de calibración diferentes.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas downstream es desconocido hasta que se realicen los fine-tunes anunciados.
- El modelo fue entrenado con datos globales, pero puede presentar sesgos geográficos si el dataset SSL4EO-S12 tiene una distribución desigual de regiones.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el dataset SSL4EO-S12 tiene su propia licencia que debe verificarse antes de usar el modelo en productos comerciales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/stratus-labs/radiance-mae-base-v1
- Organización Stratus Labs: https://huggingface.co/stratus-labs
- Dataset SSL4EO-S12: https://huggingface.co/datasets/wangyi111/SSL4EO-S12
- Modelo hermano Nocturne (bioacústica): https://huggingface.co/stratus-labs/nocturne-v1-teacher
