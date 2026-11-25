# tomaarsen/gte-multilingual-mlm-base-native

## Resumen

gte-multilingual-mlm-base-native es una copia de los pesos del modelo Alibaba-NLP/gte-multilingual-mlm-base publicada por tomaarsen. Se trata de un modelo de lenguaje enmascarado (masked language model, pipeline `fill-mask`) de tipo encoder, con 306.210.496 parámetros, entrenado sobre corpus multilingües y orientado a tareas de representación y relleno de máscaras en 75 idiomas. Su interés técnico principal no reside en el modelo en sí, sino en que esta copia incorpora el soporte nativo de Transformers para la arquitectura GTE, de modo que puede cargarse con `transformers>=5.18.0` sin necesidad de `trust_remote_code=True`.

El modelo resuelve el problema de disponer de un encoder multilingüe cargable con la API estándar de Transformers, algo relevante para pipelines de producción que quieren evitar código remoto por motivos de seguridad y reproducibilidad. Los pesos y el tokenizador son idénticos a los del repositorio original de Alibaba; esta copia se mantiene únicamente por compatibilidad con enlaces y código existentes, y el propio autor recomienda usar el repositorio original.

La relevancia de esta ficha es, por tanto, acotada: sirve como referencia de un encoder multilingüe de tamaño medio (unos 306 millones de parámetros, ~0,6 GB en el repositorio) con licencia Apache 2.0, útil para tareas de embeddings y clasificación multilingüe, pero sin datos públicos de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia GTE, soporte nativo en Transformers ≥5.18.0) |
| Parámetros totales | 306.210.496 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | 75 idiomas (af, ar, az, be, bg, bn, ca, ceb, cs, cy, da, de, el, en, es, et, eu, fa, fi, fr, gl, gu, he, hi, hr, ht, hu, hy, id, is, it, ja, jv, ka, kk, km, kn, ko, ky, lo, lt, lv, mk, ml, mn, mr, ms, my, ne, nl, no, pa, pl, pt, qu, ro, ru, si, sk, sl, so, sq, sr, sv, sw, ta, te, th, tl, tr, uk, ur, vi, yo, zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia GTE y su naturaleza de encoder Transformer con cabeza de modelado de lenguaje enmascarado (pipeline `fill-mask`). No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la función de activación. El modelo base declarado es Alibaba-NLP/gte-multilingual-mlm-base, del que esta copia hereda pesos y tokenizador sin modificaciones.

Respecto a los datos de entrenamiento, la model card lista los datasets allenai/c4, wikimedia/wikipedia, Skywork/SkyPile-150B y uonlp/CulturaX, pero no se indica el número de tokens procesados, la composición exacta del corpus, ni si hubo fases de RLHF, DPO o ajuste instructivo. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El único aspecto técnico destacable documentado es la incorporación del soporte nativo de Transformers para la arquitectura, que elimina la dependencia de `trust_remote_code`.

## Capacidades

- Modelado de lenguaje enmascarado (`fill-mask`): predicción de tokens ocultos en una secuencia, útil para evaluación intrínseca y para tareas de completado.
- Representaciones multilingües: al ser un encoder de la familia GTE, está diseñado para generar embeddings de texto, aunque la información disponible no detalla si esta copia incluye la cabeza de embeddings o solo la de MLM.
- Cobertura lingüística amplia: 75 idiomas, incluidos español, catalán, euskera y gallego, además de lenguas de bajos recursos como cebuanu, yoruba o quichua.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.
- No se documenta generación de texto autoregresiva: es un encoder, no un modelo causal.

## Casos de uso

- Búsqueda semántica multilingüe: usar el encoder para generar embeddings de documentos y consultas en varios idiomas y alimentar un índice vectorial, aprovechando la cobertura de 75 idiomas para recuperación cross-lingüe.
- Clasificación de texto multilingüe: añadir una cabeza de clasificación sobre las representaciones del encoder para moderación de contenido, detección de idioma o categorización de tickets en varios idiomas con un único modelo.
- Deduplicación y agrupamiento de documentos: calcular similitud coseno entre embeddings para agrupar noticias o registros duplicados en corpus multilingües como los usados en su entrenamiento (C4, Wikipedia, CulturaX).
- Evaluación de modelos y corpus: emplear la cabeza de `fill-mask` para medir perplejidad o calidad de textos en distintos idiomas, por ejemplo para filtrar datos de entrenamiento de otros modelos.
- Extracción de características para pipelines de NLP: congelar el encoder y usarlo como extractor de features en tareas downstream (NER, análisis de sentimiento) cuando no se dispone de datos suficientes para entrenar desde cero.
- Migración de código legacy: sustituir cargas con `trust_remote_code=True` por la carga nativa de Transformers en entornos con políticas de seguridad estrictas, manteniendo los mismos pesos y tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 306 millones de parámetros en fp32 se requieren aproximadamente 1,2 GB solo para los pesos; en fp16, unos 0,6 GB. El consumo real depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp16 con lotes pequeños; para entrenamiento o fine-tuning se recomiendan GPUs de 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en CPU para inferencia con lotes pequeños.
- Opciones de despliegue: Transformers (≥5.18.0 para carga nativa), y potencialmente vLLM, TGI u ONNX Runtime, aunque la información disponible no confirma compatibilidad explícita con estos servidores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomaarsen/gte-multilingual-mlm-base-native | 306 M | no disponible | 75 | apache-2.0 | Hugging Face |
| Alibaba-NLP/gte-multilingual-mlm-base | no disponible en la información | no disponible | 75 | no disponible en la información | Hugging Face (repo original) |
| Otros encoders multilingües (p. ej. familia XLM-R) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Repositorio redundante: el propio autor indica que debe usarse Alibaba-NLP/gte-multilingual-mlm-base en su lugar, ya que el repositorio original incluye el mismo soporte nativo. Esta copia existe solo por compatibilidad de enlaces.
- Sin datos de benchmarks: no hay resultados publicados en la información disponible, por lo que no es posible validar su calidad frente a alternativas.
- No es un modelo generativo: al ser un encoder con cabeza de `fill-mask`, no debe emplearse para generación de texto libre ni para tareas conversacionales.
- Riesgo de sesgos: los corpus de entrenamiento (C4, Wikipedia, SkyPile, CulturaX) pueden contener sesgos sociales, geográficos y lingüísticos; no se documentan medidas de mitigación.
- Cobertura desigual por idioma: aunque se declaran 75 idiomas, no se especifica la proporción de datos por lengua, por lo que el rendimiento en idiomas de bajos recursos puede ser limitado.
- Longitud de contexto no documentada: impide planificar su uso en documentos largos sin pruebas empíricas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base original, no detallada en la información disponible.
- Sin garantías de producción: al no haber benchmarks ni documentación de latencia, cualquier despliegue en producción requiere una evaluación propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tomaarsen/gte-multilingual-mlm-base-native
- Modelo base original: https://huggingface.co/Alibaba-NLP/gte-multilingual-mlm-base
- Dataset allenai/c4: https://huggingface.co/datasets/allenai/c4
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Skywork/SkyPile-150B: https://huggingface.co/datasets/Skywork/SkyPile-150B
- Dataset uonlp/CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
