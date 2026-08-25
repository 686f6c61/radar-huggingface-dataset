# Taykhoom/UTR-LM-MLMSI

## Resumen

UTR-LM-MLMSI es un port minimalista para HuggingFace de la variante **MLM + MFE** (masked language modeling + regresión de energía libre mínima) del modelo UTR-LM, un modelo de lenguaje para ARN específico de regiones 5' UTR (untranslated regions). Fue desarrollado originalmente por Yanyi Chu et al. y publicado en *Nature Machine Intelligence* (2024); este port ha sido realizado por Taykhoom Dalal y verificado bit-exacto contra los pesos originales.

El modelo aborda un problema concreto de biología computacional: predecir la eficiencia de traducción (TE) y el nivel de expresión (EL) de ARNm a partir de la secuencia de su región 5' UTR. Para ello, emplea una arquitectura tipo ESM2 (Transformer pre-LN) con solo 1,2 millones de parámetros, 6 capas, 16 cabezas de atención y una dimensión de embedding de 128, con codificación posicional RoPE y una ventana máxima de 1024 tokens (1022 nucleótidos más tokens especiales).

Su relevancia actual radica en que es uno de los pocos modelos de lenguaje para ARN con pesos públicos y verificables, diseñado específicamente para tareas de regulación traduccional, y que puede integrarse fácilmente en pipelines de HuggingFace gracias a este port. La variante MLMSI es la recomendada por el autor para tareas de TE y EL, ya que el checkpoint 3.1 es el que se utilizó en los experimentos reportados en la publicación original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN estilo ESM2 con FFN GELU (6 capas, 16 cabezas, dim embedding 128, FFN 512) |
| Parametros totales | 1.207.970 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (1022 nucleótidos + `<cls>` / `<eos>`) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no aplicable (modelo biológico; alfabeto de ARN A/G/C/T, requiere conversión U→T) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM2: un Transformer con normalización pre-LayerNorm, atención de producto escalar, FFN con activación GELU y codificación posicional RoPE (base 10000). El vocabulario es mínimo: 10 tokens (`<pad>`, `<eos>`, `<unk>`, A, G, C, T, `<cls>`, `<mask>`, `<sep>`). La secuencia máxima es de 1024 tokens, lo que permite procesar UTRs completos típicos (longitud media de 200-300 nucleótidos en humanos).

El preentrenamiento combina dos objetivos: (1) masked language modeling (MLM) sobre secuencias de 5' UTR endógenas de cinco especies (humano, ratón, pez cebra, *Drosophila* y levadura) junto con la biblioteca sintética aleatoria de Cao et al., y (2) regresión de la energía libre mínima (MFE), una propiedad termodinámica del ARN relacionada con su estructura secundaria. El checkpoint utilizado es `ESM2SI_3.1_fiveSpeciesCao_6layers_16heads_128embedsize_4096batchToks_MLMLossMin.pkl`, seleccionado por ser el que se emplea en los scripts de evaluación del paper original para TE y EL. Cabe destacar que el MFE era un objetivo auxiliar de predicción, no una entrada; este port conserva el backbone y la cabeza MLM, pero omite la cabeza de regresión auxiliar.

## Capacidades

- **Generación de embeddings de secuencia**: produce representaciones de 128 dimensiones por token y por secuencia (usando el token CLS), útiles para tareas de regresión y clasificación.
- **Modelado de lenguaje enmascarado (MLM)**: puede predecir nucleótidos enmascarados en una secuencia de ARN, lo que permite evaluar la plausibilidad de variantes o mutaciones.
- **Representaciones intermedias**: acceso a las 7 capas de representación (embedding + 6 bloques transformer) para extracción de features a distintos niveles de abstracción.
- **Fine-tuning estándar**: compatible con el ecosistema HuggingFace Trainer, lo que facilita el ajuste para tareas específicas (TE, EL, estabilidad, etc.).
- **Backends de atención acelerados**: soporta SDPA (PyTorch 2.0+) y Flash Attention 2, además de la atención eager original.
- **Capacidades multilingües**: no aplicable; es un modelo biológico con alfabeto de ARN, no procesa lenguaje natural.

## Casos de uso

- **Predicción de eficiencia de traducción (TE)**: el caso de uso principal del modelo. Dada una secuencia de 5' UTR, se extrae el embedding CLS y se entrena una cabeza de regresión para predecir la TE. Es adecuado porque el checkpoint 3.1 fue específicamente validado en esta tarea en el paper original.
- **Predicción de nivel de expresión (EL)**: similar al anterior, pero para el nivel de expresión del ARNm. El modelo captura características de la UTR que correlacionan con la estabilidad y la traducción.
- **Diseño de UTRs sintéticas**: usando las predicciones de TE/EL, se pueden generar o filtrar secuencias de UTR para optimizar la producción de proteínas en biotecnología (por ejemplo, en la producción de vacunas de ARNm o proteínas recombinantes).
- **Análisis de variantes en regiones reguladoras**: al enmascarar nucleótidos y observar los logits del MLM, se puede evaluar el impacto de mutaciones puntuales en la UTR sobre la estructura y la función reguladora.
- **Extracción de features para modelos downstream**: los embeddings de las capas intermedias pueden servir como entrada para modelos de clasificación o regresión más complejos (por ejemplo, para predecir localización subcelular o interacciones con proteínas).
- **Investigación en biología de ARN**: como modelo preentrenado específico de 5' UTR, permite explorar patrones evolutivos y estructurales en estas regiones, comparando representaciones entre especies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (como correlación de Spearman en TE/EL, AUC, etc.) para este port. El paper original de UTR-LM reporta resultados en tareas de TE y EL, pero esos datos no se han reproducido en la documentación de este modelo en HuggingFace. Se recomienda consultar el artículo de Chu et al. (2024) para métricas detalladas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de solo 1,2 millones de parámetros, la inferencia es extremadamente ligera. Incluso en float32, los pesos ocupan aproximadamente 4,8 MB (1.207.970 × 4 bytes). Cabe en cualquier GPU con al menos 1 GB de VRAM, y también en CPU sin problemas.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las de gama de entrada (GTX 1650, RTX 3050) o incluso integradas. Para fine-tuning con lotes grandes, una GPU con 4-8 GB de VRAM es más que suficiente.
- **Compatibilidad con GPU de consumo**: sí, totalmente. Es un modelo pensado para ejecutarse en entornos modestos.
- **Opciones de despliegue**: al ser un modelo de transformers estándar, se puede servir con vLLM, TGI, o simplemente con la API de transformers en Python. También es compatible con llama.cpp si se convierte a GGUF, aunque no es el flujo habitual para modelos de este tamaño.
- **Latencia y throughput**: no se han publicado mediciones oficiales, pero dado el tamaño, se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU. El throughput está limitado principalmente por el preprocesamiento y la tokenización, no por el cómputo del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UTR-LM-MLMSI (este) | 1,2 M | 1024 tokens | MLM + MFE | GPL-3.0 | HuggingFace (safetensors) |
| UTR-LM-MLM | 1,2 M | 1024 tokens | MLM | GPL-3.0 | HuggingFace (safetensors) |
| UTR-LM-MLMSS | 1,2 M | 1024 tokens | MLM + estructura secundaria | GPL-3.0 | HuggingFace (safetensors) |
| UTR-LM-MLMSISS | 1,2 M | 1024 tokens | MLM + MFE + estructura secundaria | GPL-3.0 | HuggingFace (safetensors) |

Los tres modelos hermanos de la colección UTR-LM comparten la misma arquitectura y tamaño, diferenciándose únicamente en los objetivos auxiliares de preentrenamiento. La variante MLMSI es la recomendada para tareas de TE/EL, mientras que MLMSISS se recomienda para tareas de MRL (mRNA representation learning). No se dispone de comparativas con otros modelos de ARN (como RNA-FM o DNABERT) en la información proporcionada.

## Limitaciones y advertencias

- **Sesgo de datos**: el preentrenamiento se limita a 5' UTRs de cinco especies (humano, ratón, pez cebra, *Drosophila*, levadura) y una biblioteca sintética. Las predicciones pueden no generalizar bien a otras especies o a UTRs de organismos no representados.
- **Riesgo de alucinación**: como modelo de lenguaje, puede generar secuencias plausibles pero biológicamente inviables. Las predicciones de TE/EL deben validarse experimentalmente.
- **Limitación de contexto**: la ventana de 1024 tokens limita el análisis a UTRs de hasta ~1022 nucleótidos. UTRs más largas (poco comunes) requerirían truncamiento o particionado.
- **Conversión U→T obligatoria**: el tokenizador usa el alfabeto de ADN (A/G/C/T). Si se introducen secuencias de ARN con uracilo (U), estos se mapean a `<unk>`, degradando el rendimiento. Es responsabilidad del usuario convertir U a T antes de la tokenización.
- **Cabeza de regresión MFE omitida**: este port no incluye la cabeza auxiliar de regresión de MFE. Si se necesita predecir MFE directamente, hay que usar el modelo original o entrenar una cabeza propia.
- **Licencia GPL-3.0**: el uso comercial del modelo y sus derivados está sujeto a los términos de la GPL-3.0, que exigen la divulgación del código fuente de cualquier obra derivada distribuida. Esto puede ser restrictivo para aplicaciones propietarias.
- **Verificación limitada**: aunque se verificó la paridad bit-exacta de los pesos, no se han publicado evaluaciones independientes de rendimiento en tareas downstream para este port específico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Taykhoom/UTR-LM-MLMSI)
- [Colección UTR-LM en HuggingFace](https://huggingface.co/collections/Taykhoom/utr-lm-6a173a96ae7c070c3a84ebb4)
- [Repositorio original UTR-LM en GitHub](https://github.com/a96123155/UTR-LM)
- [Página de UTR-LM en MultiMolecule](https://multimolecule.danling.org/models/utrlm/)
- [Artículo original (Nature Machine Intelligence, 2024)](https://doi.org/10.1038/s42256-024-00823-9)
