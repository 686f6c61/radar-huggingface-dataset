# Taykhoom/ModernGENA-large

## Resumen

ModernGENA-large es un modelo fundacional de ADN basado en la arquitectura ModernBERT, desarrollado por el Instituto AIRI (Artificial Intelligence Research Institute) y publicado originalmente como `AIRI-Institute/moderngena-large`. Este repositorio es un reempaquetado mínimo de Hugging Face que verifica la paridad bit-exacta con el checkpoint original. Se trata de un encoder de secuencias de ADN preentrado con masked language modeling (MLM) sobre 443 genomas de vertebrados, lo que lo convierte en una herramienta eficiente para tareas de genómica como la predicción de elementos reguladores, la clasificación de variantes o la anotación funcional.

El modelo cuenta con 377,8 millones de parámetros, una ventana de contexto de 1024 tokens y una arquitectura híbrida de atención local/global con ventana local de 128 tokens y atención global cada 3 capas. Su vocabulario de 32 000 entradas está basado en el tokenizador BPE de GENA-LM sobre símbolos de ADN e IUPAC. La relevancia actual de este modelo radica en que ofrece un equilibrio entre rendimiento y eficiencia computacional frente a generaciones anteriores de modelos de ADN, y su licencia Apache 2.0 facilita su uso tanto en investigación como en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder con atención híbrida local/global (ventana local 128, global cada 3 capas) |
| Parámetros totales | 377 841 664 (377,8 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | No disponible (se puede inferir con fp32, bf16, fp8, int8) |
| Idiomas soportados | No aplica (ADN, símbolos IUPAC) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ModernGENA-large sigue el diseño de ModernBERT, un encoder Transformer pre-norm con normalización LayerNorm sin sesgo (epsilon=1e-5) y activación GeGLU en el bloque FFN (dimensión oculta 2624, proyección de entrada/salida de 5248). Emplea posicionamiento rotatorio (RoPE) con theta=10000 tanto para atención local como global. La atención es híbrida: cada capa usa una ventana deslizante de 128 tokens y, cada 3 capas (empezando en la capa 0), se añade atención global sobre toda la secuencia. Esto reduce el coste computacional frente a atención totalmente global.

El preentrenamiento se realizó con el objetivo de masked language modeling sobre 443 ensamblajes de genomas de vertebrig, totalizando 353 574 093 776 pares de bases, incluyendo ambas cadenas (forward y reverse-complement). El muestreo se concentró en regiones alrededor de sitios de inicio de transcripción únicos (intervalos de -16 kbp a +8 kbp), fusionando solapamientos. El checkpoint original proviene de AIRI-Institute/moderngena-large. Se verificó la paridad bit-exacta (máxima diferencia absoluta = 0.00) en los 29 niveles de representación (embedding + 28 bloques) y en la cabeza de MLM, para backends eager, SDPA y Flash Attention 2, con PyTorch 2.7.1, CUDA 12.9, transformers 4.57.6 y flash-attn 2.7.4.post1.

## Capacidades

- Generación de representaciones de secuencias de ADN: el modelo produce embeddings por token de dimensión 1024 y embeddings de secuencia (CLS) de 1024, útiles para tareas de clasificación y regresión.
- Masked language modeling: permite predecir tokens enmascarados en secuencias de ADN, lo que sirve para evaluación de variantes o generación de secuencias condicionadas.
- Atención eficiente: soporta tres backends de atención: eager, PyTorch SDPA y Flash Attention 2 (este último requiere GPU Ampere o superior y la librería flash-attn).
- Fine-tuning: se puede adaptar fácilmente a tareas downstream mediante cabezas de clasificación o regresión sobre el `[CLS]` o pooling de tokens, siguiendo las convenciones de Hugging Face.
- Tokenización específica de ADN: el tokenizador maneja símbolos IUPAC y normaliza runs de N de más de 9 caracteres al token `-`.

## Casos de uso

- Predicción de sitios de unión de factores de transcripción: se puede fine-tunear el modelo con datos de ChIP-seq para predecir la probabilidad de que una región genómica contenga un sitio de unión específico. El contexto de 1024 tokens permite capturar flanqueos reguladores.
- Clasificación de variantes genómicas patogénicas vs benignas: utilizando el embedding de la posición de la variante y una capa de clasificación, se puede entrenar un clasificador sobre conjuntos de datos como ClinVar.
- Anotación funcional de regiones no codificantes: el modelo puede asignar probabilidades a diferentes categorías funcionales (promotor, enhancer, insulador, etc.) mediante fine-tuning con datos de anotación.
- Detección de sitios de empalme (splice sites): se puede usar el modelo para predecir si un punto de la secuencia es un sitio donador o aceptor de empalme, integrando el contexto de ambos lados.
- Generación de secuencias de ADN condicionadas: gracias al MLM, se pueden enmascarar regiones y usar el modelo para proponer secuencias plausibles, por ejemplo, para diseño de primers o secuencias sintéticas.
- Análisis de metilación o modificaciones epigenéticas: los embeddings del modelo pueden servir como características para modelos secundarios que predicen estados de cromatina o metilación en regiones específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de tablas comparativas con otros modelos de ADN en este repositorio.

## Requisitos de hardware

- VRAM estimada: con 377,8 M de parámetros, en fp32 el modelo ocupa aproximadamente 1,5 GB de memoria. En bf16 o fp16, alrededor de 0,75 GB. Con cuantización int8, se reduciría a unos 0,4 GB. Además hay que considerar los tensores de activación y el estado del optimizador durante el fine-tuning.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 (por ejemplo, NVIDIA RTX 3050, T4, L4). Para fine-tuning, se recomienda una GPU con 8-12 GB (RTX 3080, A10, etc.). Para Flash Attention 2, se necesita una GPU Ampere o posterior (A100, H100, RTX 3090, etc.).
- Inferencia en CPU: posible con llama.cpp o transformers en modo CPU, aunque será más lenta.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, vLLM (aunque vLLM está más orientado a modelos generativos, también soporta encoders), o mediante un contenedor FastAPI con transformers. Para CPU, se puede usar llama.cpp o ONNX Runtime.
- Latencia y throughput: no hay datos medidos. En una GPU T4, se podría esperar un throughput de miles de secuencias por minuto para secuencias cortas (<512 tokens), pero depende del backend de atención.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernGENA-large | 377,8 M | 1024 | ModernBERT (híbrido local/global) | Apache 2.0 | Hugging Face |
| GENA-LM (anterior) | ~450 M (base y large) | 512 | BERT estándar | Apache 2.0 | Hugging Face |
| DNABERT-2 | ~117 M | 512 | BERT con tokenizer de k-mers | MIT | Hugging Face |
| Nucleotide Transformer | 500 M | 1000 | BERT con atención global | CC BY-NC-SA 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se basa en características técnicas generales.

## Limitaciones y advertencias

- Longitud de contexto limitada a 1024 tokens, lo que impide procesar regiones genómicas largas de una sola pasada. Para secuencias más largas se requeriría fragmentación y estrategias de pooling.
- El modelo fue preentrenado exclusivamente en ADN de vertebrados, por lo que su capacidad de generalización a otros reinos (bacterias, plantas, etc.) puede ser limitada.
- No se han documentado sesgos específicos, pero es probable que presente sesgos de representación según los genomas incluidos en el conjunto de entrenamiento (443 especies de vertebrados, con mayor presencia de especies modelo como humano y ratón).
- Riesgo de alucinación en la generación de secuencias: el modelo no es generativo en el sentido de texto, pero al predecir tokens enmascarados puede producir secuencias plausibles pero no biológicamente funcionales.
- La licencia Apache 2.0 permite uso comercial, pero hay que tener en cuenta que el modelo se basa en datos genómicos públicos; no se han identificado restricciones adicionales.
- El repositorio es un reempaquetado de un modelo original; se recomienda verificar la paridad con el checkpoint oficial antes de usarlo en producción, aunque se indica que se verificó bit-exact.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Taykhoom/ModernGENA-large
- Modelo original de AIRI: https://huggingface.co/AIRI-Institute/moderngena-large
- Código de GENA-LM en GitHub: https://github.com/AIRI-Institute/GENA_LM
- Documentación de ModernGENA en el repositorio: https://github.com/AIRI-Institute/GENA_LM/blob/main/examples/modernGENA/README.md
- Colección de modelos ModernGENA: https://huggingface.co/collections/Taykhoom/moderngena-6a8ceb9ba4a3e5e6aceadae7

Nota: la fecha de creación del repositorio (2026-08-25) parece futura en el contexto actual, pero se asume como dato proporcionado.</think>## Resumen

ModernGENA-large es un modelo fundacional de ADN basado en la arquitectura ModernBERT, desarrollado originalmente por AIRI-Institute y reempaquetado aquí por Taykhoom para facilitar su uso en el ecosistema Hugging Face. Se trata de un encoder de secuencias genómicas preentrenado con masked language modeling (MLM) sobre 443 genomas de vertebrados, lo que le permite aprender representaciones biológicas ricas de regiones de ADN. Con 377,8 millones de parámetros y una ventana de contexto de 1024 tokens, ofrece un equilibrio entre capacidad y eficiencia computacional, siendo relevante para tareas de genómica funcional, anotación y clasificación de variantes.

El modelo emplea una arquitectura híbrida de atención local/global (ventana local de 128 tokens y atención global cada 3 capas) inspirada en ModernBERT, lo que reduce el coste de cómputo frente a una atención global completa. Su licencia Apache 2.0 y la disponibilidad de pesos en formato safetensors facilitan su integración en pipelines de investigación y producción. La paridad bit-exacta verificada con el checkpoint original garantiza fiabilidad en el despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder con atención híbrida local/global |
| Parámetros totales | 377 841 664 (377,8 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | No disponible (se puede usar fp32, bf16, fp8, int8 según backend) |
| Idiomas soportados | No aplica (ADN y símbolos IUPAC) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ModernGENA-large es un encoder Transformer pre-norm basado en ModernBERT, con normalización LayerNorm sin sesgo (epsilon=1e-5) y activación GeGLU en el bloque FFN (dimensión oculta 2624, proyección de entrada/salida de 5248). La atención es híbrida: cada capa utiliza una ventana deslizante de 128 tokens y, cada 3 capas (empezando en la capa 0), se incorpora atención global sobre toda la secuencia. El posicionamiento rotatorio (RoPE) se aplica con theta=10000 tanto en atención local como global. El vocabulario consta de 32 000 entradas del tokenizador BPE de GENA-LM, incluyendo símbolos de ADN e IUPAC, más tokens especiales como `[CLS]`, `[SEP]`, `[PAD]`, `[MASK]` y `-`. Se reservan 32 768 filas en la capa de embeddings y salida.

El preentrenamiento se realizó con el objetivo de masked language modeling sobre 443 genomas de vertebrados, totalizando 353 574 093 776 pares de bases, incluyendo ambas hebras (forward y reverse-complement). El muestreo se concentró en regiones alrededor de sitios de inicio de transcripción únicos (intervalos de -16 kbp a +8 kbp), fusionando solapamientos. El checkpoint original proviene de AIRI-Institute/moderngena-large. Se verificó la paridad bit-exacta (máxima diferencia absoluta = 0.00) en todos los niveles de representación (embeddings + 28 bloques + LayerNorm final + cabeza de MLM) para backends eager, SDPA y Flash Attention 2, utilizando PyTorch 2.7.1, CUDA 12.9, transformers 4.57.6 y flash-attn 2.7.4.post1.

## Capacidades

- Generación de embeddings de secuencia de ADN: produce representaciones de 1024 dimensiones por token y una representación global mediante el token `[CLS]`.
- Predicción de tokens enmascarados (MLM): puede rellenar huecos en secuencias de ADN, útil para evaluación de plausibilidad o generación de variantes.
- Atención eficiente: soporta backends eager, SDPA y Flash Attention 2, adaptándose a distintos entornos de hardware.
- Fine-tuning para tareas downstream: se puede adaptar a clasificación de secuencias o de tokens usando las clases `AutoModel` o `AutoModelForSequenceClassification`.
- Tokenización especializada: maneja símbolos IUPAC y normaliza tramos de ≥10 N al token `-`.
- Compatibilidad con Hugging Face Transformers: carga con `trust_remote_code=True` y uso estándar de la librería.

## Casos de uso

- Predicción de sitios reguladores de transcripción: el modelo puede fine-tunearse para clasificar regiones promotoras, potenciadoras o silenciadoras, aprovechando su contexto de 1024 tokens para capturar flanqueadores.
- Clasificación de variantes genéticas: embeddings de posición de variantes (SNPs, indels) alimentan un clasificador para distinguir variantes patogénicas de benignas en bases de datos como ClinVar.
- Anotación funcional de genomas no codificantes: el modelo puede predecir la categoría funcional de regiones intergénicas (enhancers, insulators, etc.) con fine-tuning sobre datos de ENCODE.
- Detección de sitios de empalme (splice sites): usando la predicción de tokens enmascarados, se pueden identificar posiciones de splicing alternativo o canónico.
- Generación de secuencias sintéticas: mediante MLM, se pueden proponer secuencias plausibles para diseño de primers o sondas, condicionando el contexto.
- Análisis de metilación y cromatina: embeddings del modelo sirven como características para modelos secundarios que predicen estado de metilación o accesibilidad de cromatina.
- Estudios de evolución comparada: al estar entrenado en múltiples genomas de vertebrados, puede generar representaciones que capturan conservación evolutiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de tablas comparativas con otros modelos en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan ~1,5 GB; en bf16/fp16, ~0,75 GB; en cuantización int8, ~0,4 GB. Añadir memoria para activaciones según la longitud de secuencia (típicamente <1 GB para secuencias de 1024 tokens).
- GPU recomendada: para inferencia en fp16, una GPU con al menos 4 GB de VRAM (p.ej., RTX 2060, T4, L4) es suficiente. Para fine-tuning, se recomienda al menos 8 GB (RTX 3060, A10). Para Flash Attention 2, se requiere GPU con arquitectura Ampere o superior (A100, H100, RTX 3090).
- Compatibilidad con consumer GPU: sí, puede ejecutarse en GPUs comerciales como RTX 3090/4090 con cuantización o fp16.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, vLLM (aunque está orientado a LLM generativos, también soporta encoders), o mediante contenedores con transformers. Para CPU, se puede usar llama.cpp o ONNX Runtime.
- Latencia y throughput: no se proporcionan datos medidos; dependerá del backend y hardware. En una GPU T4, se esperan miles de secuencias cortas por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernGENA-large | 377,8 M | 1024 | ModernBERT híbrido | Apache 2.0 | Hugging Face |
| GENA-LM (anterior) | ~433 M | 1024 | BERT estándar | Apache 2.0 | Hugging Face |
| DNABERT-2 | ~117 M | 512 | BERT con tokenizer k-mer | MIT | Hugging Face |
| Nucleotide Transformer | 500 M | 1000 | Transformer estándar | CC BY-NC-SA 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se basa en características generales de arquitectura y licencia.

## Limitaciones y advertencias

- Longitud de contexto limitada a 1024 tokens: para secuencias más largas se requiere fragmentación, lo que puede perder información de interacciones de largo alcance.
- Entrenamiento específico en vertebrados: la transferencia a otros dominios (bacterias, plantas) puede ser subóptima.
- Sesgos de representación: los genomas de especies modelo como humano y ratón pueden estar sobrerrepresentados, afectando a la generalización.
- Riesgo de alucinación en generación de secuencias: el modelo puede producir secuencias plausibles pero sin significado biológico real.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las restricciones de los datos de entrenamiento si se aplica en productos clínicos.
- Dependencia de `trust_remote_code=True` para cargar el modelo, lo que requiere verificar la seguridad del código personalizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Taykhoom/ModernGENA-large
- Modelo original AIRI: https://huggingface.co/AIRI-Institute/moderngena-large
- Repositorio GitHub GENA_LM: https://github.com/AIRI-Institute/GENA_LM
- Ejemplos de ModernGENA: https://github.com/AIRI-Institute/GENA_LM/blob/main/examples/modernGENA/README.md
- Colección ModernGENA: https://huggingface.co/collections/Taykhoom/moderngena-6a8ceb9ba4a3e5e6aceadae7
