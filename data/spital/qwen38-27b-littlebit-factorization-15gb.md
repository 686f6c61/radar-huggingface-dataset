# spital/qwen38-27b-littlebit-factorization-15GB

## Resumen

`spital/qwen38-27b-littlebit-factorization-15GB` es un checkpoint cuantizado de investigación derivado de `Qwen/Qwen3.8-27B`, un modelo híbrido de visión-lenguaje de 27B parámetros (64 capas, 55,56 GB en BF16) que combina atención lineal Gated DeltaNet con atención completa en proporción 3:1. El autor aplica una técnica propia denominada LittleBit-2, basada en factorización binaria de matrices latentes, para comprimir el modelo hasta un peso total de 15,18 GB manteniendo una perplejidad de 1,09x respecto al profesor denso BF16.

El objetivo declarado es demostrar que un VLM de 27B puede recuperarse tras una cuantización agresiva inicial (1,0 BPW) mediante recuperación algorítmica sistemática —SVD ponderado por RMS de activaciones, Joint-ITQ y alineación de escalas por capa con destilación KL— ejecutada íntegramente en una única GPU de consumo RTX 5090 de 32 GB. El checkpoint insignia usa 3,0 BPW efectivos sobre las lineales del decodificador (2,998 BPW, 9,12 GB) más un suelo denso BF16 no cuantizado de 6,06 GB (embeddings, `lm_head` y encoder ViT).

Es relevante ahora porque documenta resultados negativos reproducibles (QAT de corto horizonte perjudica, el particionado iso-byte de paths pierde frente a `4p x r/2`) y porque aborda por primera vez la compresión de un backbone híbrido recurrente-atencional multimodal, un caso que los papers originales de LittleBit no cubrían. El estado es "technical research teaser" en progreso, con particiones de confirmación selladas y código disponible solo bajo petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido 3:1: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa agrupada (GQA, 24 cabezas query, 4 KV, cada 4ª capa: L3, L7, ..., L63); encoder ViT multimodal |
| Parametros totales | 27B (modelo base); 24,33B en lineales cuantizadas del decodificador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LittleBit-2 binary factorization; checkpoints a 3,0 BPW (15,18 GB), 1,28 BPW backbone (9,95 GB) y 1,40 BPW backbone (10,32 GB); baseline empaquetado a 1,0 BPW |
| Idiomas soportados | en, cs |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (empaquetado propio LittleBit-2; no se especifica safetensors ni GGUF) |
| Hidden size | 5120 |
| Intermediate size | 17408 |
| Capas | 64 |
| Tamano del checkpoint insignia | 15,18 GB (2,998 BPW en decodificador + 6,06 GB suelo BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un VLM híbrido de 64 capas con `hidden_size=5120` e `intermediate_size=17408`. Cuarenta y ocho capas emplean Gated DeltaNet (atención lineal con `in_proj_qkv`, `in_proj_z`, `out_proj`, convolución 1D y parámetros de decaimiento), intercaladas con 16 capas de atención completa con GQA (24 cabezas query, 4 KV) en las posiciones L3, L7, ..., L63. Esta estructura impone un reto de compresión específico: los errores en las proyecciones recurrentes tempranas se propagan de forma multiplicativa a lo largo de secuencias largas, algo que los transformers puros no experimentan.

El proceso de compresión parte de un baseline empaquetado LittleBit-2 degradado a 1,0 BPW. Sobre él se aplica, en orden: SVD ponderado por RMS de activaciones con Joint-ITQ (que por sí solo baja la NLL de texto dev de 2,8048 a 2,3674 sin ningún paso de gradiente), seguido de destilación de escalas acoplada en las 64 capas con KL top-K disperso (que resta otros 0,2126 nats hasta 2,1548). El particionado elegido es `4p x r/2` (4 paths con rango mitad), que los ablaciones muestran superior a `6p x r/3` y `8p x r/4`. El dataset de referencia para evaluación es `Salesforce/wikitext` con métricas de perplejidad y accuracy. No se especifica el número de tokens de entrenamiento ni la composición del dataset de destilación.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo cadenas `<think>` estructuradas de hasta 8.932 tokens verificadas en un problema de satisfacción de restricciones en checo.
- Comprensión de imágenes y texto (`image-text-to-text`): el checkpoint conserva el encoder ViT y responde a entradas visuales.
- Razonamiento visual sobre gráficos: 65,63% en ChartQA, idéntico al BF16 denso.
- OCR y lectura de texto en imágenes: 79,38% de consenso en TextVQA (98,45% del BF16).
- Resolución de restricciones complejas y demostración de unicidad de solución.
- Capacidades multilingües limitadas a inglés y checo según la model card.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta modo de agente autónomo más allá del razonamiento multi-paso.

## Casos de uso

- Investigación en cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar la recuperación de VLMs híbridos tras compresión a 1,0 BPW, con métricas de NLL, paridad de recarga bit-exacta (`rel_l2 = 0.000e+00`) y acuerdo de argmax (48/48) documentadas.
- Despliegue de un VLM de 27B en una sola GPU de consumo: con 15,18 GB ocupa menos del 47% de una RTX 5090 (32 GB), dejando margen para caché KV y procesamiento de imágenes en entornos de prototipado.
- Razonamiento sobre documentos con gráficos: el mantenimiento del 100% de la precisión ChartQA del BF16 permite usar el modelo para extracción de datos de gráficos y tablas en pipelines de análisis documental.
- OCR asistido en producción de bajo presupuesto: con el 98,45% del rendimiento BF16 en TextVQA, es adecuado para digitalización de documentos cuando no hay GPU de datacenter disponible.
- Evaluación comparativa de técnicas de cuantización: los checkpoints a 1,28 BPW (9,95 GB) y 1,40 BPW (10,32 GB, 1,46x PPL) permiten trazar curvas calidad-tamaño en la misma familia de modelos.
- Pruebas de fidelidad de caché KV en arquitecturas híbridas: la suite de 32 fixtures multimodales con paridad token/EOS (0 fallos pre-EOS) sirve para validar implementaciones de decodificación incremental en modelos con estado recurrente.
- Investigación lingüística en checo: el modelo resuelve acertijos de restricciones en checo, útil para evaluar razonamiento no inglés en modelos comprimidos.

## Benchmarks y rendimiento

| Benchmark | LittleBit-2 3,0 BPW (15,18 GB) | BF16 denso (55,56 GB) | Ratio |
|---|---|---|---|
| NLL texto dev (menor es mejor) | 2,1548 | 2,0690 | 1,090x perplejidad |
| ChartQA (exact match) | 65,63% | 65,63% | 100% |
| TextVQA (consenso OCR) | 79,38% | 80,63% | 98,45% |
| TextVQA (exact-majority) | 68,75% | no disponible | no disponible |
| Recarga empaquetada (rel_l2) | 0,000e+00 | n/a | paridad bit-exacta |
| Acuerdo argmax decodificación forzada | 48/48 | n/a | 100% |
| Paridad token/EOS (32 fixtures) | 32/32, 0 fallos pre-EOS | n/a | 100% |

Mejoras intermedias documentadas: SVD+ITQ zero-shot baja la NLL de 2,8048 a 2,3674; la destilación de escalas acoplada en 64 capas resta 0,2126 nats adicionales hasta 2,1548. La reducción de NLL en texto dev amplio (59.234 tokens) es de -0,7387 nats con IC 95% [-0,7780, -0,7011]. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,18 GB para el checkpoint insignia 3,0 BPW; 9,95 GB para el de 1,28 BPW; 10,32 GB para el de 1,40 BPW.
- GPU recomendada según el autor: RTX 5090 (32 GB), única GPU usada para todo el proceso de recuperación y evaluación.
- Cabe en GPU de consumo: sí, en RTX 5090 con margen amplio (<47% de VRAM); en GPUs de 24 GB (RTX 4090) el checkpoint de 15,18 GB dejaría aproximadamente 8,8 GB para caché KV y activaciones, aunque no se documenta dicha configuración.
- Opciones de despliegue: no se especifican en la información disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato de pesos empaquetado LittleBit-2 sugiere carga mediante código propio del autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tamaño de pesos | Notas |
|---|---|---|---|---|---|
| spital/qwen38-27b-littlebit-factorization-15GB | 27B (24,33B cuantizados) | no disponible | Apache 2.0 | 15,18 GB (3,0 BPW) | VLM híbrido, investigación, 1,09x PPL vs BF16 |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 | 55,56 GB (BF16) | Profesor denso de referencia |
| LittleBit-2 baseline empaquetado | 27B | no disponible | Apache 2.0 | ~3-4 GB (1,0 BPW) | Punto de partida degradado del autor |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la información proporcionada, por lo que la comparativa se limita a los checkpoints de la misma familia.

## Limitaciones y advertencias

- Estado de investigación: el autor lo etiqueta como "technical research teaser (work in progress)"; las métricas están verificadas en particiones internas de desarrollo y las particiones de confirmación held-out permanecen selladas.
- El código completo de entrenamiento, factorización y evaluación solo está "disponible bajo petición", lo que limita la reproducibilidad independiente.
- El checkpoint insignia es de 15,18 GB, no sub-1-bit: 6,06 GB corresponden a un suelo BF16 no cuantizado (embeddings y `lm_head` sin atar de 248K vocabulario, 5,09 GB; encoder ViT, 0,92 GB; normas y estados recurrentes, 0,05 GB).
- Idiomas limitados a inglés y checo según la model card; no hay evidencia de rendimiento en castellano.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación; al ser un modelo derivado por cuantización, hereda los sesgos del base Qwen3.8-27B sin mitigación adicional documentada.
- La decodificación con caché natural solo se validó dentro del "envelope" medido de caché BF16 (`max_rel_l2 = 0,0204 <= 0,0333`); fuera de ese rango no hay garantías de fidelidad.
- Los ablaciones muestran que el QAT de corto horizonte (~1M tokens) degrada la NLL en todos los casos probados, lo que sugiere que ajustes finos posteriores sobre este checkpoint podrían romper la geometría Procrustes Joint-ITQ.
- Licencia Apache 2.0 permite uso comercial, pero al ser un trabajo en progreso sin validación held-out, no se recomienda para producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; tamaño de repo reportado de 0,0 GB pese a los pesos anunciados.

## Enlaces

- Hugging Face: https://huggingface.co/spital/qwen38-27b-littlebit-factorization-15GB
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper LittleBit (NeurIPS 2025): https://arxiv.org/abs/2506.13771
- Paper LittleBit-2 (ICML 2026): https://arxiv.org/abs/2603.00042
- Dataset de evaluación: https://huggingface.co/datasets/Salesforce/wikitext
