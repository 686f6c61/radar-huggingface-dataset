# Taykhoom/BERT-updated

## Resumen

Taykhoom/BERT-updated es un repositorio de código compartido que proporciona una implementación actualizada de la arquitectura BERT estándar con soporte adicional para los backends de atención `sdpa` (scaled dot-product attention) y `flash_attention_2`. No contiene pesos preentrenados; actúa como backend de modelado para una familia de modelos de secuencias biológicas (ARN, ADN, codones, splicing) que comparten la arquitectura vanilla BERT pero con vocabularios e hiperparámetros específicos. El código fue generado principalmente por Claude Code y revisado manualmente por Taykhoom Dalal, y se distribuye bajo licencia Apache 2.0.

La relevancia de este repositorio radica en que permite a los modelos derivados (RNABERT, UTRBERT, DNABERT, CodonBERT, SpliceBERT) beneficiarse de la atención flash, que reduce el uso de memoria y acelera la inferencia en secuencias largas, sin modificar el resto de la arquitectura. Es una pieza de infraestructura para la comunidad de biología computacional que utiliza Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT estándar (transformer encoder, post-LN, embeddings posicionales absolutos aprendidos) |
| Parametros totales | no disponible (repositorio de código, sin pesos) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible (depende del modelo concreto que use este backend) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | no disponible (modelos de secuencias biológicas, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplicable (solo código fuente; los modelos asociados usan safetensors) |

## Arquitectura y entrenamiento

El repositorio modifica el `BertModel` estándar de Transformers (versión 4.57.6) añadiendo un despacho completo para `attn_implementation`. Se implementan tres clases de atención: `BertSelfAttention` (eager, idéntica al BERT original), `BertSdpaSelfAttention` (usa `F.scaled_dot_product_attention` y convierte máscaras booleanas a máscaras aditivas float) y `BertFlashSelfAttention` (usa `flash_attn_varlen_func` para entradas con padding y `flash_attn_func` para entradas sin padding). El resto de la arquitectura (embeddings, FFN, pooler, disposición de pesos) permanece sin cambios.

No se proporcionan datos de entrenamiento, ya que este repositorio no contiene pesos. Los modelos que lo utilizan (RNABERT, UTRBERT, DNABERT, etc.) fueron preentrenados por separado con sus propios datasets y configuraciones. La innovación técnica principal es la integración de Flash Attention 2 en una arquitectura BERT clásica, lo que permite procesar secuencias biológicas largas con menor consumo de memoria y mayor velocidad.

## Capacidades

- Extracción de características (feature extraction) para secuencias biológicas, mediante los modelos que usan este backend.
- Soporte de atención flash (`flash_attention_2`) y atención escalada por producto punto (`sdpa`), además de la atención eager estándar.
- Compatible con el ecosistema Hugging Face Transformers mediante `trust_remote_code=True`.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un codificador BERT puro.
- Multilingüismo: no aplica, ya que los modelos asociados trabajan con vocabularios de k-meros (3-mer, 4-mer, etc.) o nucleótidos, no con lenguaje natural.

## Casos de uso

- Análisis de secuencias de ARN: los modelos RNABERT y UTRBERT permiten obtener representaciones vectoriales de secuencias de ARN para tareas como predicción de estructuras secundarias, detección de sitios de unión o clasificación de elementos reguladores. Se usaría cargando el modelo con `AutoModel.from_pretrained("Taykhoom/RNABERT", trust_remote_code=True)`.
- Clasificación de regiones de ADN: DNABERT (en versiones 3-mer a 6-mer) puede utilizarse para identificar promotores, potenciadores o regiones codificantes. El backend con flash attention acelera el procesamiento de secuencias genómicas largas.
- Estudio de codones: CodonBERT está diseñado para trabajar con secuencias de codones, útil en predicción de eficiencia de traducción o análisis de sesgo de uso de codones.
- Análisis de splicing: SpliceBERT (variantes 510nt, human-510nt y 1024nt) se emplea para predecir sitios de empalme alternativo. La atención flash permite manejar ventanas de contexto de hasta 1024 nucleótidos con menor coste computacional.
- Integración en pipelines de biología computacional: los desarrolladores pueden incorporar estos modelos en flujos de trabajo de PyTorch/Hugging Face para embeddings de secuencias, usando `attn_implementation="flash_attention_2"` cuando se disponga de GPU compatible.
- Fine-tuning para tareas específicas: al ser modelos BERT, se pueden ajustar finamente para clasificación de secuencias, regresión o token classification, aprovechando el backend actualizado para acelerar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no reporta métricas de rendimiento ni comparaciones con otras implementaciones. Se recomienda consultar las model cards de los modelos individuales (RNABERT, DNABERT, etc.) para datos de evaluación.

## Requisitos de hardware

- Los requisitos dependen del modelo concreto que use este backend (por ejemplo, RNABERT tiene 19,4M parámetros según la búsqueda web, mientras que otros pueden variar).
- Para usar Flash Attention 2 se necesita una GPU compatible con CUDA y la librería `flash-attn` instalada. GPUs recomendadas: NVIDIA A100, H100, RTX 3090/4090 o superiores.
- Con cuantización (si los modelos asociados la ofrecen) y atención flash, es posible ejecutar modelos de ~20M parámetros en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, compatible con vLLM, TGI y otros servidores de inferencia que soporten código remoto.
- La latencia y el throughput dependen del hardware y del modelo; no se proporcionan cifras específicas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Taykhoom/BERT-updated | BERT estándar + flash attn | no disponible (código) | depende del modelo | Apache 2.0 | Backend de código, no pesos |
| BERT base (Google) | BERT estándar | 110M | 512 | Apache 2.0 | Modelo de lenguaje natural, sin flash attention |
| ModernBERT (LightOn/Answer.ai) | BERT modernizado (FlexBERT) | 149M (base) / 395M (large) | 8192 | Apache 2.0 | Incluye mejoras arquitectónicas y entrenamiento con Flash Attention |

La comparativa es limitada porque BERT-updated no es un modelo con pesos, sino una actualización de código. Frente al BERT original, añade soporte para `sdpa` y `flash_attention_2`, lo que mejora la eficiencia en secuencias largas. ModernBERT es una alternativa más reciente que rediseña la arquitectura, pero no es directamente comparable al ser un modelo completo.

## Limitaciones y advertencias

- Este repositorio no contiene pesos preentrenados; cargarlo directamente fallará. Debe usarse a través de los modelos asociados (RNABERT, UTRBERT, DNABERT, etc.) con `trust_remote_code=True`.
- El código fue generado por una herramienta de IA (Claude Code) y revisado manualmente, pero no se garantiza su robustez en todos los entornos. Se recomienda probar en un entorno controlado antes de producción.
- La atención flash requiere hardware compatible (GPU NVIDIA con soporte para Flash Attention 2) y la instalación de la librería `flash-attn`. Sin ella, el modelo puede degradar a `sdpa` o `eager`.
- Los modelos biológicos asociados pueden tener sesgos derivados de sus datos de entrenamiento (por ejemplo, desequilibrios en especies o regiones genómicas). No se han documentado sesgos específicos en este repositorio.
- No hay garantía de soporte a largo plazo; al ser un proyecto personal, los cambios en Transformers podrían romper la compatibilidad.
- La licencia Apache 2.0 permite uso comercial, pero los modelos derivados pueden tener licencias o restricciones adicionales; verificar cada model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Taykhoom/BERT-updated
- Modelos asociados:
  - RNABERT: https://huggingface.co/Taykhoom/RNABERT
  - UTRBERT (3-mer a 6-mer): https://huggingface.co/Taykhoom/UTRBERT-3mer (y variantes)
  - DNABERT (3-mer a 6-mer): https://huggingface.co/Taykhoom/DNABERT-3mer (y variantes)
  - CodonBERT: https://huggingface.co/Taykhoom/CodonBERT
  - SpliceBERT: https://huggingface.co/Taykhoom/SpliceBERT-510nt (y variantes)
- Búsqueda de modelos con tag `bert_updated`: https://huggingface.co/models?other=bert_updated
- Referencia BERT (Wikipedia): https://en.wikipedia.org/wiki/BERT_(language_model)
- ModernBERT (alternativa): https://github.com/AnswerDotAI/ModernBERT
