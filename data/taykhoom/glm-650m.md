# Taykhoom/gLM-650M

## Resumen

gLM-650M es un modelo de lenguaje genómico de modalidad mixta que procesa simultáneamente secuencias de aminoácidos (proteínas) y de ADN. Se trata de un port minimalista al ecosistema Hugging Face del modelo original `tattabio/gLM2_650M`, desarrollado por el usuario Taykhoom. El modelo está preentrenado con enmascaramiento de lenguaje (MLM) sobre el dataset OMG, un corpus metagenómico abierto y deduplicado semánticamente, con un total de 315 mil millones de tokens.

La arquitectura es un Transformer Pre-LN con capas de atención estándar, función de activación SwiGLU, normalización RMSNorm y codificación posicional RoPE. Con 33 capas, 20 cabezas de atención y una dimensión de embedding de 1280, el modelo alcanza 670,6 millones de parámetros. Su contexto máximo es de 4096 tokens, suficiente para codificar genes completos o regiones genómicas. La relevancia actual reside en su capacidad para generar representaciones vectoriales de secuencias biológicas, fundamentales para tareas como predicción de función proteica, análisis de variantes y clasificación de metagenomas, todo ello bajo una licencia Apache-2.0 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Pre-LN con FFN SwiGLU, atención de 20 cabezas, normalización RMSNorm, RoPE (base 10000) |
| Parámetros totales | 670.613.760 (safetensors) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible (se usan pesos en bfloat16 para inferencia) |
| Idiomas soportados | no disponible (modelo de secuencias biológicas, no idiomas humanos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código personalizado en Transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer Pre-LN con 33 capas, 20 cabezas de atención, dimensión de embedding de 1280 y una dimensión oculta de FFN de 3584 con SwiGLU y `multiple_of=256`. La normalización se realiza con RMSNorm y la codificación posicional usa RoPE con base 10000 y modo no entrelazado. El vocabulario consta de 37 tokens: `<cls>`, `<pad>`, `<eos>`, `<unk>`, los 25 aminoácidos en mayúsculas, los 4 nucleótidos de ADN en minúsculas, los marcadores de cadena `<+>` y `<->`, y los tokens `<mask>` y `<sep>`. Esta mezcla de tokens permite codificar simultáneamente secuencias de proteínas y de ADN.

El preentrenamiento se realizó con enmascaramiento de lenguaje (MLM) con una tasa de máscara del 30%. Se usó el dataset OMG (Open Metagenomic Corpus), deduplicado semánticamente, con un total de 315 mil millones de tokens en bfloat16 y longitud de contexto de 4096. Los pesos iniciales provienen del checkpoint original `tattabio/gLM2_650M`. La verificación de paridad indica que las 34 representaciones (embedding + 33 bloques) son bit-exactas contra el original cuando se usa atención SDPA, y las variantes con eager y FlashAttention 2 coinciden dentro del error numérico esperado.

## Capacidades

- Generación de representaciones de secuencias biológicas: produce embeddings por token y por secuencia mediante pooling de la media sobre posiciones no padding.
- Relleno de máscaras (masked language modeling): puede predecir tokens enmascarados en una secuencia, útil para análisis de variantes o diseño de secuencias.
- Acceso a representaciones intermedias: permite extraer los estados ocultos de cualquier capa, lo que facilita tareas de transferencia.
- Soporte de fine-tuning con Hugging Face Transformers para tareas de clasificación o regresión a nivel de secuencia o token.
- Atención con múltiples backends: SDPA (por defecto), eager y FlashAttention 2 (requiere instalación de `flash-attn`).
- Tokenizador con semántica de mayúsculas/minúsculas que distingue aminoácidos de nucleótidos; opción de `auto_prepare_dna` para normalizar ADN/ARN entrante.
- No incluye soporte de tool calling, agentes ni capacidades multimodales (visión, audio) porque es un modelo especializado en genómica.

## Casos de uso

- **Predicción de función de proteínas**: los embeddings de la última capa se pueden usar como entrada para clasificadores que asignen funciones enzimáticas (EC) o categorías de proteínas. La capacidad de codificar simultáneamente ADN y proteína permite integrar contexto genómico.
- **Análisis de variantes y mutaciones**: mediante MLM, el modelo puede evaluar la probabilidad de una variante concreta enmascarando la posición y comparando el logit de la mutación con el de la referencia, útil en estudios de patogenicidad.
- **Clasificación de secuencias metagenómicas**: el entrenamiento en OMG (corpus metagenómico) hace que el modelo sea especialmente adecuado para representar fragmentos de ADN de muestras ambientales y clasificarlos por origen taxonómico o funcional.
- **Diseño de proteínas**: se puede usar el modelo generativo para proponer sustituciones de aminoácidos en posiciones enmascaradas, combinado con filtros de estabilidad o estructura.
- **Análisis de interacciones proteína-ADN**: la modalidad mixta permite construir embeddings conjuntos de regiones reguladoras y las proteínas que se unen a ellas, facilitando la predicción de sitios de unión.
- **Fine-tuning para tareas específicas**: sobre el modelo preentrenado se puede añadir una cabez de clasificación y ajustar con datos etiquetados de, por ejemplo, resistencia a antibióticos o virulencia, con pocas épocas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. No hay datos de métricas como MMLU, HumanEval o similares, ya que el modelo no está orientado a tareas de lenguaje natural sino a secuencias biológicas.

## Requisitos de hardware

- **VRAM estimada**: con 670M de parámetros, la inferencia en bfloat16 ocupa aproximadamente 1,34 GB de VRAM (sin contar activaciones). En fp32 sería ~2,68 GB. Por tanto, cabe en cualquier GPU con al menos 4 GB de VRAM.
- **GPUs recomendadas**: cualquier GPU con 8 GB o más es suficiente. Se ha verificado su funcionamiento en una NVIDIA H100, pero también puede ejecutarse en RTX 3060, T4, A10, etc. En CPU también es viable para inferencia de corta longitud.
- **Opciones de despliegue**: al ser un modelo con código personalizado en Transformers, se debe usar `trust_remote_code=True`. Se puede desplegar con vLLM, llama.cpp, Ollama o TGI si se convierte a formato GGUF o se adapta, aunque la integración más directa es mediante la librería `transformers`. Para producción, se recomienda usar los backends SDPA o FlashAttention 2 para reducir latencia.
- **Latencia y throughput**: no disponible en la información proporcionada. Se estima que una inferencia de una secuencia de 4096 tokens tarda del orden de decenas de milisegundos en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Notas |
|---|---|---|---|---|---|
| **gLM-650M (este)** | 670M | 4096 | Genómica mixta (proteína + ADN) | Apache-2.0 | Port de gLM2, verificado bit-exacto |
| [gLM-150M](https://huggingface.co/Taykhoom/gLM-150M) | 150M | 4096 | Genómica mixta | Apache-2.0 | Variante más pequeña, misma arquitectura |
| [tattabio/gLM2_650M](https://huggingface.co/tattabio/gLM2_650M) | 650M | 4096 | Genómica mixta | Apache-2.0 | Modelo original del que se deriva este port |

No se dispone de comparaciones con otros modelos de lenguaje genómico (p. ej., ESM-2, DNABERT) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con secuencias biológicas; no es adecuado para tareas de lenguaje natural, razonamiento general o generación de texto.
- El dataset OMG proviene de metagenomas, por lo que puede tener sesgos hacia organismos más abundantes en muestras ambientales y no representar todas las especies por igual.
- En tareas de relleno de máscaras, el modelo puede generar secuencias plausibles pero no garantiza que sean funcionales o reales; es necesario validar experimentalmente.
- No se dispone de información sobre cuantizaciones (GGUF, AWQ, etc.) ni sobre el comportamiento en entornos de baja memoria.
- El uso del modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado no auditado por Hugging Face.
- Aunque la licencia Apache-2.0 permite uso comercial, la responsabilidad de validar la calidad de las predicciones recae en el usuario final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taykhoom/gLM-650M
- Dataset OMG: https://huggingface.co/datasets/tattabio/OMG
- Modelo original (tattabio/gLM2_650M): https://huggingface.co/tattabio/gLM2_650M
- Colección de modelos gLM2 de Taykhoom: https://huggingface.co/collections/Taykhoom/glm2-6a2e19be671ba44c163c617f
- Documentación técnica del modelo (README): https://huggingface.co/Taykhoom/gLM-650M/blob/main/README.md
