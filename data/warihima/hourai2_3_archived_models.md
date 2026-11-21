# WariHima/hourai2_3_archived_models

## Resumen

`WariHima/hourai2_3_archived_models` es un repositorio de modelos archivados del proyecto Hourai, publicado por el usuario WariHima en Hugging Face. No se trata de un modelo único, sino de una colección de pesos de modelos pequeños (embeddings, clasificadores de tareas NLP y prototipos de conversión de texto japonés) que el autor ha retirado de uso activo porque han sido superados por alternativas más recientes dentro de su propio ecosistema.

El repositorio contiene pesos en formato safetensors y GGUF, con un total de 9.725.008 parámetros en el conjunto de tensores safetensors y un tamaño de repo de 3,3 GB. La model card está redactada en japonés y describe los motivos de archivo de cada familia de modelos: los embeddings fueron reemplazados por modelos RWKV de 20k a 60k parámetros con rendimiento superior; los clasificadores NLP (sentimiento, subjetividad, toxicidad, NER) fueron superados por un modelo `moderbert wmm 10m` y sus derivados; y los prototipos de conversión kanji-lectura y kana-kanji dejaron de ser necesarios al existir correctores específicos de homófonos y homógrafos.

Por su naturaleza de repositorio de archivo, no es un modelo pensado para uso en producción ni para evaluación comparativa. Su relevancia es documental: permite trazar la evolución del proyecto Hourai y entender qué aproximaciones se descartaron. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona modelos tipo embedding, clasificadores NLP y prototipos de conversión, sin detallar arquitectura) |
| Parametros totales | 9.725.008 (suma de tensores safetensors del repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (presente en el repo); niveles concretos no disponibles |
| Idiomas soportados | no disponible (la model card y los nombres de modelo sugieren japonés: sufijos `-ja`, tareas de kanji/kana) |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de los modelos del repositorio. La model card únicamente enumera los modelos archivados y los motivos por los que se retiraron, sin describir capas, mecanismos de atención, tipo de transformer ni detalles de entrenamiento. Los nombres de los modelos indican tamaños que van desde 2 millones hasta 90 millones de parámetros (`hourai2-pl-2m-32dim`, `hourai3-ja-sentiment-binary-90m-v1`, etc.), lo que sugiere una familia de modelos pequeños orientados a tareas específicas de NLP en japonés.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La única información técnica indirecta es la mención a modelos RWKV como alternativa superior para embeddings, lo que indica que el autor experimentó con arquitecturas recurrentes además de transformers.

## Capacidades

- Generación de embeddings de frases y de nivel telefónico (modelos `hourai2-*-embedding`, `hourai2-pl-*`).
- Clasificación de sentimiento binario en japonés (`hourai3-ja-sentiment-binary-90m-v1`).
- Clasificación de subjetividad en japonés (`hourai3-ja-subjectivity-90m-v1`).
- Detección de toxicidad en japonés (`hourai3-ja-toxicity-90m-v1`).
- Reconocimiento de entidades nombradas en japonés (`hourai3-ner-ja-90m-v1`).
- Conversión de kanji a lectura (prototipo `hourai yomi`).
- Conversión de kana a kanji (prototipo `hourai zenz`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Archivado y trazabilidad de experimentos: el repositorio sirve para conservar versiones descartadas del proyecto Hourai y poder reproducir decisiones técnicas pasadas. Es adecuado porque agrupa pesos y motivos de archivo en un único lugar.
- Investigación sobre embeddings japoneses de baja dimensión: los modelos `hourai2-pl-2m-32dim` y `hourai2-10m-64dim-embedding` permiten estudiar el comportamiento de embeddings de 32 y 64 dimensiones en frases cortas, aunque el autor los considera superados.
- Análisis de sentimiento en japonés como referencia histórica: `hourai3-ja-sentiment-binary-90m-v1` puede usarse para comparar contra `moderbert wmm 10m` y medir la mejora que motivó el archivo.
- Detección de toxicidad en foros o comentarios japoneses: el clasificador de 90M podría integrarse en un filtro previo, siempre que se acepte que su rendimiento es inferior al de los modelos que lo reemplazaron.
- NER en japonés para pipelines de extracción de entidades: `hourai3-ner-ja-90m-v1` ofrece una base de 90M parámetros para prototipado rápido en entornos con pocos recursos.
- Estudio de conversión kanji-lectura y kana-kanji: los prototipos `hourai yomi` y `hourai zenz` documentan aproximaciones basadas en modelos de lenguaje que el autor descartó en favor de correctores específicos de homófonos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Con 9,7 millones de parámetros en safetensors, la inferencia en fp32 requeriría aproximadamente 39 MB de pesos; en fp16, unos 19 MB. El tamaño del repo (3,3 GB) incluye múltiples modelos y variantes GGUF, no un único checkpoint.
- GPU recomendadas: cualquier GPU consumer moderna puede alojar los modelos individuales, dado su tamaño reducido (2M a 90M parámetros). No se dispone de recomendaciones del autor.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM libre, aunque no se documenta el consumo real.
- Opciones de despliegue: los pesos GGUF sugieren compatibilidad con llama.cpp y derivados (Ollama, etc.); los safetensors permiten carga con `transformers` o `safetensors`. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables directos para este repositorio de archivo, y la model card no ofrece datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Repositorio de archivo: los modelos están retirados por rendimiento inferior a alternativas del propio autor; no deben usarse como base para producción.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso.
- Idiomas no declarados formalmente: aunque los nombres y la model card apuntan al japonés, no hay una declaración explícita de cobertura lingüística.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni evaluación de equidad.
- Riesgo de alucinación: no evaluable, ya que no se describen tareas generativas ni datos de evaluación.
- Sin benchmarks: no hay métricas publicadas que permitan estimar calidad o comparar con alternativas.
- Model card en japonés: la documentación puede requerir traducción para equipos no japoneses.
- Mezcla de modelos en un solo repo: el tamaño de 3,3 GB corresponde a múltiples checkpoints, no a un modelo único; hay que seleccionar los archivos concretos antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WariHima/hourai2_3_archived_models
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
