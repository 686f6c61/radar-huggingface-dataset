# Soulfate24/AutoRound-ASHQ1_Double-Quantization_Suite

## Resumen

La suite **AutoRound + ASHQ1 Double-Quantization** no es un modelo de lenguaje en sí, sino un conjunto de herramientas y scripts de cuantización diseñado para generar ficheros GGUF de alta fidelidad a partir de modelos base en formato safetensors. Desarrollada por el usuario Soulfate24, combina dos fases complementarias: primero aplica AutoRound (algoritmo de cuantización de Intel basado en descenso de gradiente de signo) para reorganizar los pesos con compensación hessiana, y después utiliza un motor propio llamado ASHQ1 que asigna dinámicamente niveles de precisión por capa según una matriz de importancia (imatrix) calculada sobre corpus de calibración multi-fuente.

El resultado es un pipeline que produce cinco niveles estandarizados de compresión (Nano, Mini, Compact, Quality y Fidelity) con ratios de tamaño que van desde el 21 % hasta el 48 % del modelo original en BF16. La suite soporta arquitecturas densas, MoE, modelos recurrentes e híbridos (GDN, Mamba, RWKV, Qwen3.5) y torres multimodales, así como cabezas de predicción multi-token (MTP). Su relevancia actual radica en ofrecer un flujo automatizado y reproducible para obtener GGUF de muy baja precisión con pérdida mínima, pensado para despliegue en entornos con restricciones de memoria.

El repositorio de HuggingFace no incluye pesos de ningún modelo concreto, solo los scripts y la documentación del pipeline. No se han publicado métricas de rendimiento ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (suite de cuantizacion, no modelo base) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ3_XS, IQ4_XS, Q5_K_M, Q6_K, Q8_0, F32 (segun tier) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Scripts Python, genera GGUF |

## Arquitectura y entrenamiento

La suite no entrena un modelo, sino que define un proceso de cuantización en dos fases. La fase 1 utiliza **AutoRound W4A16**, un algoritmo de Intel que reordena los pesos mediante redondeo iterativo guiado por la estimación de la matriz hessiana, logrando alta precisión a 2-4 bits. El resultado se convierte a un contenedor GGUF en BF16, preservando la "lineage" de la optimización en metadatos laterales.

La fase 2 emplea el **motor ASHQ1**, que analiza las activaciones de cada capa usando matrices de importancia multi-fuente (corpus agéntico, de frontera, lógico y de diversidad). Con esa información asigna dinámicamente niveles de precisión por tensor (desde IQ2_XXS hasta Q8_0 y F32), aplicando un algoritmo de mochila codiciosa para cumplir presupuestos de bytes estrictos. Para modelos recurrentes e híbridos garantiza la retención de estados de memoria en Q8_0, y para torres multimodales preserva embeddings espaciales y vectores de normalización en F32/F16. También extrae y codifica cabezas MTP en alta precisión para decodificación especulativa.

Los scripts incluidos automatizan todo el flujo: conversión de safetensors, creación de datasets de calibración, ejecución de llama-imatrix con autotuning de GPU, fusión de módulos (base, mmproj, MTP) y generación de todos los tiers.

## Capacidades

- Cuantización híbrida por capas con asignación dinámica de precisión basada en importancia de activaciones.
- Soporte para arquitecturas densas, MoE, recurrentes (Mamba, RWKV, GDN) e híbridas (Qwen3.5).
- Manejo de torres multimodales (CLIP, vision encoders) con cuantización selectiva de bloques profundos.
- Extracción y codificación de cabezas de predicción multi-token (MTP / NextN) para decodificación especulativa.
- Generación de ficheros GGUF compatibles con llama.cpp y ecosistema asociado (llama-server, Ollama, etc.).
- Cinco niveles estandarizados de compresión con presupuestos de bytes definidos (Nano 21 %, Mini 27 %, Compact 30 %, Quality 39 %, Fidelity 48 %).
- Recomendaciones automáticas de tier según el tamaño del modelo (≥9B, ~4B, ~3B, ≤1B).
- Detección de pesos atados (tied weights) y estabilización de rutas de tokens en modelos MoE.

## Casos de uso

- **Despliegue de LLMs en hardware de borde**: el tier Nano (21 % del tamaño BF16) permite ejecutar modelos de 7B-13B en GPUs de consumo o incluso en CPU con llama.cpp, manteniendo las capas críticas en Q6_K.
- **Servicio de alta concurrencia con presupuesto de VRAM ajustado**: el tier Mini (27 %) ofrece un equilibrio entre huella de memoria y throughput, adecuado para servir múltiples instancias en una sola GPU.
- **Prototipado rápido de modelos cuantizados**: los scripts automatizados permiten pasar de safetensors a GGUF en pocos pasos, facilitando pruebas de calidad antes de elegir el tier definitivo.
- **Integración en pipelines de CI/CD para evaluación de modelos**: al generar varios tiers de forma reproducible, se puede comparar la degradación de calidad entre niveles y decidir el punto óptimo de compresión.
- **Adaptación de modelos multimodales a entornos con memoria limitada**: el script ASHQ1-mmproj.py cuantiza el proyector de visión preservando embeddings espaciales, habilitando VLM en GPUs de 8 GB.
- **Investigación en cuantización de baja precisión**: la suite proporciona una base para experimentar con asignación de precisión por capa y matrices de importancia, útil para estudios académicos o comparativas de métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, exactitud en tareas de razonamiento ni comparativas con otros métodos de cuantización. Tampoco se ofrecen datos de latencia o throughput de inferencia para los tiers generados.

## Requisitos de hardware

- La suite requiere una GPU NVIDIA con CUDA para ejecutar AutoRound y la generación de imatrix (los scripts usan PyTorch y auto-round).
- No se especifica VRAM mínima para los scripts de cuantización; dependerá del tamaño del modelo base (los modelos de 7B suelen necesitar 16-24 GB para el proceso de calibración).
- Para inferencia de los GGUF generados, se recomienda llama.cpp o llama-server; la VRAM necesaria depende del tier y del tamaño del modelo (por ejemplo, un 7B en tier Nano puede caber en 4-6 GB, mientras que en Quality requerirá 8-10 GB).
- Opciones de despliegue: llama.cpp, Ollama, llama-server, y cualquier runtime compatible con GGUF.
- No se proporcionan cifras de latencia o throughput.

## Comparativa con modelos similares

No se trata de un modelo comparable a otros LLMs, sino de una herramienta de cuantización. Como alternativa a otras técnicas de cuantización de baja precisión:

| Aspecto | AutoRound + ASHQ1 (esta suite) | GPTQ | AWQ |
|---|---|---|---|
| Enfoque | Híbrido por capas con imatrix | Cuantización global por capas | Activación-aware por canales |
| Precisión mínima | 2 bits (IQ2_XXS) | 2-4 bits | 4 bits |
| Soporte GGUF | Sí (genera GGUF) | Vía conversión externa | Vía conversión externa |
| Requiere calibración | Sí (imatrix multi-fuente) | Sí (dataset de calibración) | Sí (dataset de calibración) |
| Automatización | Pipeline completo con scripts | Herramientas separadas | Herramientas separadas |
| Licencia | Apache 2.0 | MIT (GPTQ-for-LLaMa) | MIT |

La suite destaca por su automatización y por el enfoque de asignación dinámica de precisión, pero carece de benchmarks publicados que la validen frente a GPTQ o AWQ en términos de pérdida de calidad.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación independiente; la eficacia de los tiers no está verificada más allá de las afirmaciones de la model card.
- El repositorio tiene 0 descargas y 0 likes, lo que indica una adopción nula y posible falta de pruebas en entornos reales.
- La suite depende de herramientas externas (auto-round, llama.cpp, imatrix) y puede requerir ajustes manuales para modelos no contemplados en los scripts.
- No se especifican los idiomas soportados ni las capacidades lingüísticas de los modelos resultantes, ya que dependen del modelo base que se cuantice.
- La licencia Apache 2.0 permite uso comercial, pero los modelos cuantizados heredan la licencia del modelo original, que debe verificarse por separado.
- La cuantización a niveles extremos (Nano, Mini) puede degradar significativamente la calidad en tareas de razonamiento complejo, especialmente en modelos pequeños.
- No hay garantía de soporte o mantenimiento del autor; el proyecto parece ser un trabajo individual sin comunidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Soulfate24/AutoRound-ASHQ1_Double-Quantization_Suite
- GitHub de AutoRound (Intel): https://github.com/intel/auto-round
- Documentación de cuantización de vLLM: https://docs.vllm.ai/en/latest/features/quantization/
- Página de modelos de Soulfate24: https://huggingface.co/Soulfate24/models
