# Taykhoom/ModernGENA-base

## Resumen

ModernGENA-base es un modelo fundacional de ADN basado en la arquitectura ModernBERT, desarrollado originalmente por el AIRI Institute y redistribuido por Taykhoom como un repackage mínimo en HuggingFace. Se trata de un encoder de secuencias genómicas preentrenado con masked language modeling sobre 443 genomas de vertebrados, lo que le permite generar representaciones densas de fragmentos de ADN y resolver tareas de genómica mediante fine-tuning. Su relevancia actual radica en que ofrece un baseline eficiente y rápido frente a modelos más pesados de la misma categoría, con una arquitectura moderna de atención híbrida local/global y un coste computacional reducido.

El modelo tiene 136,1 millones de parámetros distribuidos en 22 capas transformer, con una ventana de contexto máxima de 1024 tokens y un vocabulario BPE de 32.000 entradas específico para secuencias de ADN e símbolos IUPAC. Está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors, con soporte para los backends de atención SDPA y Flash Attention 2. Al ser un modelo de tipo encoder, no está diseñado para generación autoregresiva, sino para extracción de embeddings y clasificación de secuencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder pre-norm con atención híbrida local/global |
| Parámetros totales | 136.120.832 (136,1 M) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (secuencias de ADN, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ModernGENA-base sigue la arquitectura ModernBERT, un encoder transformer pre-norm con normalización LayerNorm sin sesgo (epsilon=1e-5) y activación GeGLU en la capa FFN. La atención es híbrida: utiliza una ventana de atención local de 128 tokens y atención global cada 3 capas, empezando en la capa 0. Emplea posiciones rotatorias (RoPE) con theta=10000 tanto para posiciones globales como locales. El modelo tiene 22 capas, 12 cabezas de atención, dimensión de embedding 768 y un vocabulario de 32.000 entradas BPE (con 32.768 filas reservadas en la matriz de embeddings).

El preentrenamiento se realizó con el objetivo de masked language modeling sobre 443 genomas de vertebrados, totalizando 353.574.093.776 pares de bases. Se incluyeron ambas cadenas (forward y reverse-complement) y se muestrearon regiones alrededor de sitios de inicio de transcripción únicos en el rango [-16 kbp, +8 kbp], fusionando intervalos solapados. El checkpoint original proviene de AIRI-Institute/moderngena-base. El autor del repackage verificó que todas las 23 representaciones internas (embedding + 22 bloques) y la cabeza MLM son bit-exactas con el checkpoint original en backends eager, SDPA y Flash Attention 2.

## Capacidades

- Generación de embeddings de secuencias de ADN: produce representaciones de 768 dimensiones por token y por secuencia (vector `[CLS]`).
- Masked language modeling: puede predecir nucleótidos enmascarados en una secuencia de entrada, útil para tareas de imputación o anotación.
- Fine-tuning para clasificación de secuencias: permite añadir cabezas de clasificación sobre el backbone para tareas como predicción de promotores, enhancers o sitios de unión.
- Extracción de representaciones por capas: accede a los estados ocultos de cualquier capa intermedia (por ejemplo, capa 12) para análisis de atención o representaciones específicas.
- Soporte de atención eficiente: compatible con PyTorch SDPA y Flash Attention 2, lo que reduce el coste computacional en GPU modernas.
- Tokenizer específico de ADN: utiliza un vocabulario BPE de 32.000 entradas con símbolos IUPAC y tokens especiales, sin conversión a mayúsculas.

## Casos de uso

- **Predicción de efectos de variantes genéticas**: se puede fine-tunear el modelo para clasificar variantes de un solo nucleótido (SNVs) en patogénicas o benignas, usando embeddings de secuencias flanqueantes. La ventana de 1024 tokens permite capturar contexto local relevante sin excesivo coste.
- **Clasificación de regiones reguladoras**: el modelo puede distinguir entre promotores, enhancers y regiones no reguladoras mediante fine-tuning sobre datasets anotados. Su atención híbrida local-global es adecuada para capturar patrones de longitud media en el genoma.
- **Detección de sitios de unión de factores de transcripción**: los embeddings de tokens pueden alimentar un clasificador para predecir si un fragmento de ADN contiene un motivo de unión específico, útil para estudios de regulación génica.
- **Análisis de splicing alternativo**: fine-tuning sobre datos de exones e intrones para predecir sitios de splicing, aprovechando el contexto de 1024 nucleótidos para capturar señales locales.
- **Imputación de regiones genómicas incompletas**: usando la cabeza MLM, se pueden rellenar huecos en secuencias de ADN de ensamblajes fragmentados, aunque la longitud máxima de 1024 limita el tamaño de las regiones a imputar.
- **Pre-entrenamiento para tareas de metagenómica**: los embeddings generados pueden servir como entrada para modelos de clasificación de organismos o predicción de funciones génicas, aunque el preentrenamiento se limita a vertebrados y puede requerir adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ya que este modelo está orientado a tareas de genómica y no a lenguaje natural. El autor menciona una verificación de paridad bit-exact con el checkpoint original de AIRI, pero no proporciona comparaciones de rendimiento en tareas biológicas concretas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 136 M de parámetros, el modelo necesita aproximadamente 272 MB en bfloat16 o 544 MB en float32 para los pesos. Con secuencias de hasta 1024 tokens, el consumo total de VRAM en inferencia es inferior a 1 GB, incluyendo activaciones.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia básica. Para usar Flash Attention 2 se requiere una GPU Ampere o posterior (RTX 3000, RTX 4000, A100, H100).
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs como RTX 3060, RTX 4060 o incluso en iGPU con suficiente memoria compartida.
- **Opciones de despliegue**: se puede ejecutar con transformers (eager, SDPA, Flash Attention 2), también es compatible con ONNX Runtime y TensorRT para optimización de inferencia. No se ha documentado el uso con llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- **Latencia y throughput**: no disponible. Dado el tamaño reducido y la atención local, se espera una latencia baja en GPU moderna, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernGENA-base (este) | 136,1 M | 1024 | ModernBERT encoder | Apache 2.0 | Hugging Face |
| GENA-LM (base) | 117 M | 512 | BERT encoder | Apache 2.0 | Hugging Face |
| DNABERT-2 | 117 M | 512 | BERT encoder | MIT | Hugging Face |
| Nucleotide Transformer (base) | 500 M | 1000 | BERT encoder | CC BY-NC-SA 4.0 | Hugging Face |

La comparativa se limita a datos de arquitectura y licencia, ya que no hay benchmarks públicos para este modelo en tareas genómicas. ModernGENA-base ofrece mayor contexto (1024 vs 512) que GENA-LM y DNABERT-2, y su licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de Nucleotide Transformer que tiene licencia no comercial. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Longitud de contexto limitada**: la ventana máxima de 1024 tokens restringe el análisis a fragmentos de ADN relativamente cortos; regiones reguladoras complejas que requieren contexto de más de 1 kb no pueden ser procesadas de una sola vez.
- **Preentrenamiento en vertebrados**: el modelo se entrenó exclusivamente con genomas de vertebrados, por lo que su rendimiento en otros organismos (plantas, bacterias, etc.) puede degradarse significativamente.
- **Riesgo de alucinación en predicciones biológicas**: como todo modelo de MLM, puede producir predicciones de nucleótidos o clasificaciones incorrectas sin indicar incertidumbre; es recomendable validar cualquier resultado con herramientas biológicas estándar.
- **No apto para texto natural**: es un modelo de ADN y no puede generar ni entender lenguaje humano; su uso fuera de tareas genómicas no tiene sentido.
- **Dependencia de `trust_remote_code`**: el modelo requiere cargarse con `trust_remote_code=True` en HuggingFace, lo que implica ejecutar código del repositorio; es necesario revisar el código antes de usarlo en entornos de producción.
- **Sin cuantizaciones oficiales**: no se han publicado versiones cuantizadas (GGUF, GPTQ, etc.), por lo que el despliegue en hardware con limitaciones de memoria requiere conversión manual.
- **Sin sesgos documentados**: no se ha evaluado formalmente el comportamiento del modelo en tareas de genómica clínica ni su posible sesgo hacia poblaciones específicas de vertebrados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taykhoom/ModernGENA-base
- Modelo original de AIRI: https://huggingface.co/AIRI-Institute/moderngena-base
- Repositorio GENA_LM en GitHub: https://github.com/AIRI-Institute/GENA_LM
- Documentación de ejemplo de ModernGENA: https://github.com/AIRI-Institute/GENA_LM/blob/main/examples/modernGENA/README.md
- Paper asociado (en GitHub): https://github.com/AIRI-Institute/GENA_LM (título: "Back to BERT in 2026: ModernGENA as a Strong, Efficient Baseline for DNA Foundation Models")
- Colección ModernGENA en Hugging Face: https://huggingface.co/collections/Taykhoom/moderngena-6a8ceb9ba4a3e5e6aceadae7
