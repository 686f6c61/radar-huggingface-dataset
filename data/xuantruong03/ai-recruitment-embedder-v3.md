# XuanTruong03/ai-recruitment-embedder-v3

## Resumen

El modelo `XuanTruong03/ai-recruitment-embedder-v3` es un *sentence transformer* especializado en similitud semántica para el dominio de reclutamiento y selección de personal en vietnamita. Desarrollado por XuanTruong03, se basa en el modelo `keepitreal/vietnamese-sbert` y se ha afinado con un conjunto de datos propio de 9.062 ejemplos etiquetados, utilizando la función de pérdida CoSENTLoss. Su propósito principal es emparejar ofertas de empleo con perfiles de candidatos a partir de texto estructurado que incluye campos como dominio, entorno laboral, seniority y tipo de puesto.

Con 134.998.272 parámetros, el modelo pertenece a la categoría de encoders transformer de tamaño medio (similar a RoBERTa-base). Está diseñado para extraer representaciones vectoriales de frases o párrafos que permiten calcular la similitud coseno entre una oferta de trabajo y un currículum o descripción de candidato. Aunque el pipeline declarado es `sentence-similarity`, su uso real se orienta a tareas de *matching* y ranking en sistemas de reclutamiento.

La relevancia actual del modelo radica en la creciente demanda de herramientas de automatización de procesos de selección, especialmente en mercados laborales donde el vietnamita es el idioma predominante. Al estar especializado en un dominio concreto, ofrece una alternativa más precisa que los modelos genéricos de embeddings multilingües, aunque su cobertura idiomática y su licencia no están documentadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en `keepitreal/vietnamese-sbert`) |
| Parametros totales | 134.998.272 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente vietnamita, por el modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `keepitreal/vietnamese-sbert`, un *sentence transformer* preentrenado sobre textos vietnamitas, que a su vez se basa en una arquitectura tipo RoBERTa con 135 millones de parámetros. La capa de *pooling* utilizada es la habitual en SBERT (mean pooling sobre los tokens de salida) para obtener una representación fija de la frase.

El entrenamiento se realizó con un conjunto de datos de 9.062 pares de textos, etiquetados para similitud semántica, empleando la función de pérdida CoSENTLoss. Esta pérdida está diseñada para optimizar directamente la correlación entre las puntuaciones de similitud y las etiquetas, lo que resulta adecuado para tareas de ranking y *matching*. No se dispone de información sobre el número de épocas, el tamaño del lote, ni sobre técnicas adicionales como *hard negative mining* o *data augmentation*. Tampoco se documentan procesos de RLHF o DPO, ya que no se trata de un modelo generativo.

Una característica notable es el formato de entrada: los textos se estructuran con prefijos como `[CONTEXT]`, `[CONTENT]` y campos como `Domain`, `Environment`, `Seniority` o `Type`. Esto permite al modelo capturar la semántica específica del dominio de reclutamiento, diferenciando entre ofertas y perfiles de candidatos.

## Capacidades

- Generación de embeddings de frases para similitud semántica (producto escalar o coseno).
- *Matching* entre ofertas de empleo y currículums o descripciones de candidatos.
- Extracción de características (*feature extraction*) para pipelines de búsqueda semántica.
- Soporte de entrada estructurada con campos contextuales (dominio, seniority, entorno, tipo de puesto).
- Capacidad multilingüe: no confirmada oficialmente, pero el modelo base es específico para vietnamita, por lo que se espera que funcione únicamente en ese idioma.
- No soporta *tool calling*, generación de texto ni razonamiento multi-paso, al ser un encoder puro.

## Casos de uso

- **Filtrado automático de currículums**: dado un CV en texto plano, el modelo genera un embedding que puede compararse con el de una oferta para obtener una puntuación de compatibilidad, permitiendo preseleccionar candidatos sin intervención humana.
- **Búsqueda semántica de candidatos en una base de datos**: al indexar los embeddings de miles de CVs, se puede realizar una consulta con la descripción de un puesto y recuperar los perfiles más similares mediante búsqueda de vecinos cercanos (ANN).
- **Ranking de candidatos para una oferta**: las puntuaciones de similitud coseno entre la oferta y cada CV permiten ordenar a los aspirantes de mayor a menor idoneidad, facilitando la revisión por parte de reclutadores.
- **Recomendación de ofertas a candidatos**: el mismo mecanismo se invierte: dado el perfil de un candidato, se pueden recomendar ofertas activas que maximicen la similitud.
- **Clasificación de ofertas por dominio o seniority**: los embeddings pueden alimentar un clasificador secundario para organizar ofertas en categorías predefinidas (manufactura, IT, salud, etc.), mejorando la estructuración de portales de empleo.
- **Análisis de brechas de habilidades**: comparando el embedding de una oferta con el de un candidato, se pueden identificar áreas de mejora si se utilizan embeddings a nivel de frase o de párrafo, aunque el modelo no ofrece desglose por competencias.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de validación interno (InDomain Val), correspondientes a la tarea de similitud semántica:

| Metrica | Valor |
|---|---|
| Pearson Cosine | 0.9357 |
| Spearman Cosine | 0.5652 |

El valor de Pearson es alto, indicando una buena correlación lineal entre las puntuaciones predichas y las etiquetas. Sin embargo, el coeficiente de Spearman es notablemente más bajo (0.5652), lo que sugiere que el orden de los pares no se preserva tan bien. Esto puede deberse a la naturaleza del dataset o a la dificultad intrínseca de la tarea. No se proporcionan comparaciones con otros modelos en el mismo conjunto de datos.

## Requisitos de hardware

- **VRAM estimada**: con 134M parámetros, el modelo en precisión fp32 ocupa aproximadamente 540 MB; en fp16 se reduce a ~270 MB y en int8 a ~135 MB. Por tanto, es viable en GPUs con 1-2 GB de VRAM, incluso en tarjetas de gama baja.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 3050, T4) es suficiente para inferencia en lote. Para entrenamiento o *fine-tuning* adicional, se recomienda una GPU con 6 GB o más (RTX 2060, RTX 3060, A10).
- **CPU**: el modelo puede ejecutarse en CPU con un rendimiento aceptable para cargas moderadas (decenas de consultas por segundo).
- **Opciones de despliegue**: se integra fácilmente con la librería `sentence-transformers` (PyTorch). También puede exportarse a ONNX o TensorFlow para servir en entornos de producción. No se han documentado integraciones específicas con vLLM, Ollama o TGI, ya que estos están orientados a LLMs generativos.
- **Latencia y throughput**: no hay datos oficiales, pero para un modelo de 134M en una GPU moderna (p. ej., T4), se espera una latencia de 5-10 ms por frase y un throughput de varios cientos de frases por segundo en lotes.

## Comparativa con modelos similares

No se dispone de comparativas oficiales con otros modelos de embeddings vietnamitas o multilingües. Como referencia, el modelo base `keepitreal/vietnamese-sbert` tiene la misma arquitectura y parámetros, pero sin el afinamiento específico para reclutamiento. Otros modelos vietnamitas de embeddings, como `bkai-foundation-models/vietnamese-bi-encoder` o `VoVanPhuc/sup-simcse-roberta-vietnamese`, podrían ser alternativas, pero no se han encontrado datos comparativos públicos. Se recomienda evaluar estos modelos en el mismo conjunto de datos de validación antes de elegir uno.

## Limitaciones y advertencias

- **Idioma**: aunque no se documenta oficialmente, el modelo base es exclusivamente vietnamita; no se espera que funcione correctamente en otros idiomas.
- **Dominio específico**: está entrenado para textos de reclutamiento con un formato estructurado particular. Su rendimiento en textos generales o en otros sectores será probablemente bajo.
- **Sesgos**: al entrenarse con un dataset limitado (9.062 ejemplos), puede heredar sesgos presentes en las ofertas y CVs utilizados, como desequilibrios de género, seniority o sector.
- **Alucinación**: al ser un encoder, no genera texto, por lo que el riesgo de alucinación no aplica.
- **Correlación de ranking moderada**: el coeficiente de Spearman (0.5652) indica que el orden de los candidatos puede no ser fiable en todos los casos; se recomienda validar con datos propios.
- **Licencia**: no se especifica, lo que implica incertidumbre sobre el uso comercial y la redistribución. Es recomendable contactar al autor antes de utilizarlo en producción.
- **Mantenimiento**: el repositorio no muestra actividad reciente (fecha de creación y actualización en agosto de 2026), y no se proporcionan instrucciones de uso detalladas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/XuanTruong03/ai-recruitment-embedder-v3)
- [Modelo base: keepitreal/vietnamese-sbert](https://huggingface.co/keepitreal/vietnamese-sbert)
- [Paper de Sentence-BERT (arxiv:1908.10084)](https://arxiv.org/abs/1908.10084)
