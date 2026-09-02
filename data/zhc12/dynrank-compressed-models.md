# zhc12/dynrank-compressed-models

## Resumen

DynRank es un método de compresión de modelos de lenguaje de gran tamaño (LLM) basado en descomposición en valores singulares (SVD) con asignación diferenciable de rangos y entrenamiento conjunto de los factores. El repositorio `zhc12/dynrank-compressed-models` contiene los checkpoints comprimidos resultantes de aplicar esta técnica sobre varios modelos base: LLaMA-2-7B, LLaMA-7B, Mistral-7B, LLaMA-2-13B y Qwen3-8B, con ratios de compresión de 0.2, 0.4 y 0.8. El autor es Huicheng Zhang, y el trabajo se describe en el artículo "DynRank: Differentiable Rank Allocation with Joint SVD Factor Training for LLM Compression" (2026).

El objetivo principal es reducir el tamaño y el coste computacional de los LLM manteniendo un rendimiento cercano al original. A diferencia de métodos estáticos de poda por rango, DynRank optimiza los rangos por subcapa de forma diferenciable, lo que permite una asignación más eficiente de la capacidad del modelo. Los checkpoints se almacenan en formato `.pt` con pesos en `CompressedLinear` (matrices A y B), listos para cargarse con el código de SVD-LLM. Este repositorio es relevante para investigadores que trabajan en compresión de modelos y para desarrolladores que necesitan desplegar LLMs en entornos con recursos limitados, aunque no se proporcionan métricas de rendimiento detalladas en la documentación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelos base: LLaMA-2-7B, LLaMA-7B, Mistral-7B, LLaMA-2-13B, Qwen3-8B) con capas comprimidas mediante SVD (CompressedLinear) |
| Parametros totales | No disponible (depende del checkpoint; los modelos base varían entre 7B y 13B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (compresión por SVD, no cuantización) |
| Idiomas soportados | No disponible (depende del modelo base, pero no se especifica) |
| Licencia | Derivada de las licencias originales: LLaMA/LLaMA-2 (Meta Community License), Mistral-7B (Apache 2.0), Qwen3-8B (Qwen License) |
| Formato de pesos | `.pt` (PyTorch) con `CompressedLinear` (matrices A y B) |

## Arquitectura y entrenamiento

Los checkpoints son el resultado de aplicar DynRank, un método de compresión que combina SVD con entrenamiento diferenciable de los factores. En lugar de asignar un rango uniforme a todas las capas, DynRank optimiza los rangos por subcapa (224 valores en total para los modelos de 7B) mediante un proceso de entrenamiento conjunto. Cada capa lineal se descompone en dos matrices de rango bajo: una matriz B (r × n) y una matriz A (d × r), donde r es el rango asignado. El método incluye una fase de "endurecimiento" (hardening) que parece estabilizar el entrenamiento y mejorar la calidad final.

El entrenamiento se realizó sobre los modelos base mencionados, con calibración en diferentes dominios (por ejemplo, GSM8K para análisis de dominio). No se especifica el número de tokens de entrenamiento ni el dataset completo. El repositorio incluye experimentos con varios ratios (0.2, 0.4, 0.8) y múltiples semillas, así como comparaciones con perfiles de rango estáticos (ASVD, Dobi-SVD, SVD-LLM V2). La innovación principal es la asignación diferenciable de rangos, que permite adaptar la compresión a la importancia real de cada subcapa durante el entrenamiento.

## Capacidades

- Generación de texto: los checkpoints comprimidos mantienen las capacidades generativas del modelo base, aunque con posible degradación según el ratio de compresión.
- Razonamiento y matemáticas: se evaluó el rendimiento en tareas como GSM8K (según los archivos `downstream7_*.json`), aunque no se publican los valores en la documentación.
- Comprensión de lenguaje: se midió perplexity en WT2, C4 y LAMBADA (archivos `cross_eval_*.json`), pero sin resultados numéricos públicos.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no especificadas, probablemente heredadas del modelo base.
- Capacidades especiales: no se mencionan (sin visión, audio, etc.).

## Casos de uso

- Despliegue de LLMs en entornos con VRAM limitada: al reducir el tamaño de los pesos mediante SVD, los checkpoints de DynRank permiten ejecutar modelos de 7B-13B en GPUs de consumo con menor memoria. Por ejemplo, un checkpoint de LLaMA-2-7B con ratio 0.4 podría caber en una RTX 3090 o similar, aunque no se dan cifras exactas.
- Investigación en compresión de modelos: el repositorio proporciona una implementación de referencia y checkpoints para comparar DynRank con otros métodos como SVD-LLM, ASVD o Dobi-SVD. Los investigadores pueden reproducir los experimentos y analizar los perfiles de rango por capa.
- Fine-tuning eficiente: los pesos comprimidos pueden servir como punto de partida para fine-tuning en tareas específicas, reduciendo el coste computacional del entrenamiento.
- Inferencia en producción con latencia reducida: al reducir el número de parámetros efectivos, la inferencia puede ser más rápida, especialmente en CPU o GPUs de gama media. Sin embargo, no hay benchmarks de latencia publicados.
- Evaluación de trade-offs compresión-rendimiento: los checkpoints con ratios 0.2, 0.4 y 0.8 permiten estudiar cómo varía la calidad del modelo según el nivel de compresión, útil para decidir el punto óptimo para una aplicación concreta.
- Análisis de robustez y generalización: los experimentos multi-semilla y los perfiles de dominio (GSM8K) permiten evaluar la estabilidad del método y su comportamiento en dominios específicos, lo que es relevante para aplicaciones donde la precisión matemática es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona archivos JSON con evaluaciones de perplexity (WT2, C4, LAMBADA) y precisión zero-shot en 6 tareas (`downstream7_*.json`), pero los valores numéricos no se incluyen en la documentación pública. No se proporcionan comparaciones cuantitativas con los modelos originales ni con otros métodos de compresión.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM para los checkpoints comprimidos.
- Los modelos base (LLaMA-2-7B, Mistral-7B, etc.) requieren al menos 14 GB de VRAM en fp16 para inferencia sin compresión; con SVD y ratio 0.4, el tamaño se reduce aproximadamente a la mitad, pero no hay cifras exactas.
- Se recomienda usar el código de SVD-LLM (https://github.com/zhc1212/SVD-LLM) para cargar los checkpoints y ejecutar inferencia, ya que los pesos están en formato `CompressedLinear`.
- No se mencionan opciones de despliegue como vLLM, Ollama o llama.cpp; la integración con estos frameworks no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones numéricas con otros modelos comprimidos (por ejemplo, SVD-LLM, ASVD, Dobi-SVD) en la información proporcionada. La model card menciona que se comparó con perfiles estáticos, pero los resultados no se muestran.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al derivar de LLaMA, Mistral y Qwen, los sesgos de estos modelos base pueden estar presentes.
- Riesgo de alucinación: no se evalúa en la documentación; la compresión puede aumentar la probabilidad de errores, especialmente con ratios agresivos (0.2).
- Limitaciones de contexto: se desconoce si la compresión afecta a la longitud de contexto efectiva; no se especifica.
- Restricciones de licencia: los pesos son derivados de modelos con licencias específicas. LLaMA y LLaMA-2 tienen la Meta Community License, que impone restricciones de uso comercial para aplicaciones con más de 700 millones de usuarios mensuales. Qwen3-8B tiene la Qwen License, que también tiene condiciones. Es obligatorio revisar las licencias originales antes de usar los checkpoints en producción.
- Formato propietario: los pesos están en un formato `CompressedLinear` que requiere el código de SVD-LLM; no son compatibles directamente con frameworks estándar como Hugging Face Transformers sin conversión.
- Falta de documentación sobre rendimiento: no hay benchmarks públicos, lo que dificulta evaluar la degradación real frente a los modelos originales.
- Repositorio grande: el tamaño total es de 2378.3 GB, lo que puede dificultar la descarga selectiva de checkpoints individuales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhc12/dynrank-compressed-models
- Código SVD-LLM (para cargar los checkpoints): https://github.com/zhc1212/SVD-LLM
- Artículo (referencia): "DynRank: Differentiable Rank Allocation with Joint SVD Factor Training for LLM Compression" (Zhang, 2026) — sin enlace directo en la información proporcionada.
