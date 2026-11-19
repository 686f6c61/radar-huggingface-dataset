# tomaarsen/gte-en-mlm-base-native

## Resumen

`gte-en-mlm-base-native` es una copia reempaquetada de `Alibaba-NLP/gte-en-mlm-base`, un codificador de texto (text encoder) en inglés desarrollado por el Institute for Intelligent Computing de Alibaba Group. La versión "native" la publica tomaarsen y su única diferencia funcional respecto al original es que carga directamente con `transformers` sin necesidad de `trust_remote_code=True`, manteniendo intactos pesos y tokenizador. Está pensada como modelo base para retrieval, especialmente para ajuste fino con `sentence_transformers.SparseEncoder`.

El modelo pertenece a la familia GTE-v1.5 y se construye sobre el backbone transformer++ (BERT + RoPE + GLU) con el vocabulario de `bert-base-uncased`. Con 137M parámetros y una longitud de contexto de 8192 tokens, es un encoder de tipo masked language modeling (MLM) que sirve como punto de partida para tareas de representación densa y dispersa, reranking y búsqueda semántica.

Su relevancia actual radica en que ofrece contexto largo (8192) en un tamaño base manejable, con licencia Apache 2.0 y compatibilidad nativa con el ecosistema `transformers` moderno, lo que simplifica su integración en pipelines de producción sin depender de código remoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (transformer++: BERT + RoPE + GLU) |
| Parametros totales | 137M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT modificado con RoPE (rotary position embeddings) y activaciones GLU, denominado transformer++ por el equipo de Alibaba. Usa el vocabulario de `bert-base-uncased` y está diseñado para soportar secuencias de hasta 8192 tokens mediante una estrategia de entrenamiento multietapa.

El entrenamiento se realizó con masked language modeling (MLM) sobre el dataset `c4-en`. La primera etapa (MLM-2048) usa learning rate 5e-4, `mlm_probability` 0.3, batch size 4096, 70.000 pasos y `rope_base` 10000. La segunda etapa (MLM-8192) reduce el learning rate a 5e-5, mantiene `mlm_probability` 0.3, baja el batch size a 1024, ejecuta 20.000 pasos y eleva `rope_base` a 500000 para extender el contexto. Además se remuestrean los datos reduciendo la proporción de textos cortos. No se menciona RLHF ni DPO; es un modelo puramente de preentrenamiento MLM.

## Capacidades

- Masked language modeling (fill-mask) en inglés.
- Generación de representaciones de texto para retrieval y búsqueda semántica.
- Base para ajuste fino con `SparseEncoder` de Sentence Transformers.
- Soporte de contexto largo de hasta 8192 tokens, útil para documentos extensos.
- Capacidad de servir como backbone para tareas de reranking tras ajuste fino.
- No incluye tool calling, function calling ni capacidades de agente de forma nativa.
- No soporta visión, audio ni modos de razonamiento explícito (thinking mode).
- Multilingüismo limitado: solo inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: el modelo puede codificar pasajes de hasta 8192 tokens, lo que permite indexar secciones completas de manuales sin truncar y recuperar fragmentos relevantes mediante similitud.
- Ajuste fino para recuperación dispersa (sparse retrieval): usando `SparseEncoder`, se puede entrenar sobre dominios específicos (legal, médico, código) para producir representaciones léxicas interpretables.
- Reranking de resultados de búsqueda: tras fine-tuning con pares consulta-documento, sirve como segunda etapa de ranking en motores de búsqueda internos.
- Clasificación de texto y análisis de sentimiento: como encoder base, se puede adaptar con una cabeza de clasificación para moderación de contenido o categorización de tickets.
- Extracción de entidades y etiquetado de secuencias: el contexto largo ayuda en documentos donde las entidades dependen de información distante.
- Detección de duplicados y near-duplicates: las representaciones del encoder permiten agrupar documentos similares en corpus grandes.
- Base para sistemas de preguntas y respuestas extractivas: combinado con un lector, el encoder indexa pasajes largos y facilita la recuperación previa.

## Benchmarks y rendimiento

| Modelo | Idioma | Parametros | Contexto max. | GLUE | XTREME-R |
|---|---|---|---|---|---|
| gte-en-mlm-base (este modelo) | Inglés | 137M | 8192 | 85.61 | no disponible |
| gte-en-mlm-large | Inglés | 435M | 8192 | 87.58 | no disponible |
| gte-multilingual-mlm-base | Múltiple | 306M | 8192 | 83.47 | 64.44 |
| MosaicBERT-base | Inglés | 137M | 128 | 85.4 | no disponible |
| MosaicBERT-base-2048 | Inglés | 137M | 2048 | 85 | no disponible |
| JinaBERT-base | Inglés | 137M | 512 | 85 | no disponible |
| nomic-bert-2048 | Inglés | 137M | 2048 | 84 | no disponible |
| RoBERTa-base | Inglés | 125M | 512 | 86.4 | no disponible |
| RoBERTa-large | Inglés | 355M | 512 | 88.9 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,55 GB solo para pesos (137M × 4 bytes), más activaciones según longitud de secuencia.
- En fp16/bf16: alrededor de 0,27 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Para secuencias de 8192 tokens, las activaciones aumentan el consumo; se recomienda al menos 8 GB de VRAM para batches moderados.
- Opciones de despliegue: `transformers` (nativo, requiere >=5.18.0), `sentence-transformers` para retrieval, ONNX Runtime y TensorRT para producción de baja latencia.
- No se dispone de datos publicados de latencia ni throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GLUE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gte-en-mlm-base-native | 137M | 8192 | 85.61 | Apache 2.0 | Hugging Face |
| gte-en-mlm-large | 435M | 8192 | 87.58 | Apache 2.0 | Hugging Face |
| nomic-bert-2048 | 137M | 2048 | 84 | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125M | 512 | 86.4 | MIT | Hugging Face |

Frente a RoBERTa-base, este modelo sacrifica ligeramente GLUE (85.61 vs 86.4) pero multiplica por 16 la longitud de contexto. Frente a nomic-bert-2048, ofrece mejor GLUE y cuatro veces más contexto con el mismo tamaño. La versión large mejora GLUE a costa de triplicar parámetros.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para textos en castellano u otros idiomas sin ajuste adicional.
- Es un modelo base MLM, no un modelo de chat ni de instrucciones; no responde a prompts conversacionales de forma directa.
- Riesgo de alucinación si se usa para generación libre; su uso previsto es representación y fill-mask.
- No se han publicado evaluaciones de sesgo específicas para este checkpoint.
- Requiere `transformers>=5.18.0` para la carga nativa; versiones anteriores pueden fallar.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar las condiciones del modelo original de Alibaba por si hubiera cláusulas adicionales en la documentación upstream.
- El contexto de 8192 tokens incrementa el coste computacional cuadráticamente en atención; para documentos muy largos conviene trocear.
- No dispone de datos publicados sobre cuantización (GGUF, GPTQ, AWQ) para este checkpoint concreto.

## Enlaces

- Hugging Face: https://huggingface.co/tomaarsen/gte-en-mlm-base-native
- Modelo original: https://huggingface.co/Alibaba-NLP/gte-en-mlm-base
- Paper mGTE: https://arxiv.org/pdf/2407.19669
- Implementación transformer++: https://huggingface.co/Alibaba-NLP/new-impl
- Documentación SparseEncoder: https://sbert.net/docs/sparse_encoder/training_overview.html
- Dataset C4: https://huggingface.co/datasets/allenai/c4
