# thunderboltc/mbart_sanlishTObangla-normalsplit

## Resumen

El modelo `mbart_sanlishTObangla-normalsplit` es un ajuste fino (fine-tune) del modelo `facebook/mbart-large-50-many-to-many-mmt` desarrollado por el usuario `thunderboltc`. Su propósito es la traducción automática de texto en "sanlish" (bengalí romanizado, es decir, bengalí escrito con caracteres latinos) a bengalí (bangla) en su escritura nativa. El nombre "normalsplit" sugiere que los datos de entrenamiento se dividieron de forma estándar (probablemente train/validation/test), aunque no se especifica el dataset utilizado.

Se trata de un modelo de generación de texto (text2text) basado en la arquitectura transformer encoder-decoder de mBART, con aproximadamente 611 millones de parámetros. El ajuste se realizó durante 25 épocas con una tasa de aprendizaje de 5e-5 y un tamaño de lote de 8, alcanzando una pérdida de validación de 3.45 y un BLEU de 12.57 en el conjunto de evaluación. Aunque el modelo base soporta 50 idiomas, este fine-tune está especializado en la tarea concreta de transliteración y traducción de sanlish a bangla.

La relevancia de este modelo radica en la creciente cantidad de contenido en bengalí escrito en alfabeto latino en redes sociales y foros, donde la transliteración automática a la escritura bengalí es útil para tareas posteriores de procesamiento del lenguaje natural. Sin embargo, al ser un modelo reciente (creado en agosto de 2026) con cero descargas y sin licencia declarada, su adopción en producción requiere una evaluación cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-large-50) |
| Parametros totales | 611.129.542 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base mBART usa 1024 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se encuentran pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | bengali (bangla) y sanlish (bengali romanizado) - inferido del nombre, no declarado oficialmente |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/mbart-large-50-many-to-many-mmt`, un transformer encoder-decoder con 12 capas en cada bloque, dimensión oculta de 1024 y 16 cabezas de atención, entrenado originalmente en 50 idiomas con un vocabulario compartido de 250.000 subpalabras. Este fine-tune adapta el modelo a la tarea específica de convertir texto romanizado en bengalí a su escritura nativa, utilizando un dataset no especificado (indicado como "None" en la model card).

El entrenamiento se realizó con el framework Transformers 4.46.3 y PyTorch 2.11.0, usando el optimizador AdamW (betas 0.9 y 0.999), un scheduler lineal con 50 pasos de calentamiento, y precisión mixta nativa (AMP). Se ejecutaron 25 épocas con un tamaño de lote de 8, alcanzando una pérdida de entrenamiento final de 0.006. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es supervisado estándar.

## Capacidades

- Traducción automática de texto en sanlish (bengalí romanizado) a bengalí nativo (bangla).
- Generación de texto en formato texto-a-texto, adecuado para tareas de transliteración y normalización.
- Soporte de contexto multilingüe heredado del modelo base mBART, aunque el fine-tune se centra en el par sanlish-bangla.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se especifica soporte para modos de pensamiento extendido (thinking mode).

## Casos de uso

- Normalización de contenido en redes sociales: convertir comentarios o publicaciones escritas en bengalí romanizado a escritura bengalí estándar, facilitando su análisis posterior con modelos NLP nativos.
- Preprocesamiento para sistemas de análisis de sentimiento: al transliterar texto informal a bangla, se pueden aplicar modelos entrenados en bengalí nativo para tareas de clasificación.
- Traducción de mensajes de chat y foros: en comunidades donde se usa sanlish por conveniencia, este modelo permite unificar el texto a la escritura oficial.
- Generación de subtítulos o transcripciones: si se dispone de audio transcrito en sanlish, el modelo puede convertirlo a bangla para su publicación.
- Creación de corpus paralelos: el modelo puede ayudar a generar pares sanlish-bangla para ampliar datasets de entrenamiento de otros sistemas.
- Asistencia en aplicaciones de mensajería: integrar el modelo en un teclado o app para que los usuarios escriban en sanlish y reciban automáticamente el texto en bangla.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 3.4547 |
| Bleu | 12.5668 |
| Chrf | 39.6162 |
| Meteor | 0.3268 |
| Bertscore | 0.8438 |

No se han publicado comparaciones con otros modelos en la información disponible. El BLEU de 12.57 es relativamente bajo, lo que indica una calidad de traducción limitada, aunque métricas como Chrf y Bertscore sugieren cierta similitud léxica y semántica con las referencias.

## Requisitos de hardware

- VRAM estimada para inferencia: con 611M parámetros, en fp32 se necesitan aproximadamente 2.4 GB de VRAM solo para los pesos; en fp16 se reduce a ~1.2 GB. Sin embargo, el tamaño del repositorio (105.1 GB) sugiere que se incluyen múltiples checkpoints o archivos adicionales, por lo que el modelo final puede requerir más espacio en disco.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) puede ejecutar el modelo en fp16. Para mayor comodidad, una RTX 3090 o superior permitiría procesar lotes más grandes.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo modernas con al menos 4 GB de VRAM.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También es posible usar llama.cpp si se convierte a GGUF, aunque no se proporcionan cuantizaciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (traducción sanlish-bangla). El modelo base `facebook/mbart-large-50-many-to-many-mmt` es el punto de partida, pero no hay datos de otros fine-tunes específicos para esta tarea. Se recomienda buscar alternativas en Hugging Face con el término "sanlish" o "bangla transliteration" para una comparación directa.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, lo que impide evaluar posibles sesgos o cobertura de dominios.
- La licencia no está declarada, por lo que el uso comercial es incierto y requiere contactar al autor.
- El BLEU bajo (12.57) indica que la calidad de traducción puede ser insuficiente para aplicaciones críticas sin revisión humana.
- El modelo solo cubre el par sanlish-bangla; no se garantiza rendimiento en otros idiomas o variantes dialectales.
- No se han publicado cuantizaciones, lo que puede limitar su despliegue en entornos con restricciones de memoria.
- El repositorio tiene un tamaño inusualmente grande (105.1 GB) para un modelo de 611M parámetros, lo que sugiere que contiene archivos adicionales (posiblemente checkpoints de entrenamiento) que no son necesarios para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thunderboltc/mbart_sanlishTObangla-normalsplit
- Modelo base: https://huggingface.co/facebook/mbart-large-50-many-to-many-mmt
- Otro modelo del mismo autor (relacionado): https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla
- Otro modelo del mismo autor (Marian): https://huggingface.co/thunderboltc/marian-sanlish-bangla-1934_lr2-lr2e5
