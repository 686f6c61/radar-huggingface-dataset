# StargazerLabs/Qwen3.8-32B-Jumbo-3bit

## Resumen

Qwen3.8-32B-Jumbo-3bit es una cuantización a 3 bits del modelo Qwen3.8-32B-Jumbo, desarrollada por StargazerLabs mediante una técnica experimental de "transplante de órganos" (model surgery). El modelo original se construyó fusionando las tres capas (órganos) con mayor deriva de Qwen3.6-27B dentro de Qwen3-8B, dando como resultado una arquitectura de 76 capas con aproximadamente 31.900 millones de parámetros. La versión 3-bit reduce drásticamente el peso en memoria, permitiendo ejecutar un modelo de clase 32B en un presupuesto de memoria similar al de un modelo de 7B en bf16, unos 16,4 GB con el drafter MTP cargado.

La relevancia de este modelo radica en que demuestra el potencial de las técnicas de cirugía de modelos y cuantización agresiva para hacer viables arquitecturas de gran tamaño en hardware de consumo. Está publicado bajo licencia Apache-2.0, en formato MLX (optimizado para Apple Silicon), y su creador lo presenta como un experimento de investigación abierta, no como un modelo de producción generalista. La cuantización a 3 bits con group_size de 64 es inusual y conlleva pérdidas de calidad que no han sido documentadas con benchmarks públicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), 76 capas, modelo denso |
| Parámetros totales | ~31.900 millones (según model card); safetensors reporta 4.396.255.952 parámetros |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 3-bit (group_size 64) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Qwen3.8-32B-Jumbo-3bit es la versión cuantizada de Qwen3.8-32B-Jumbo, un modelo de 76 capas y ~31.9B parámetros creado mediante "organ transplant" (transplante de órganos): se seleccionaron las tres capas de Qwen3.6-27B con mayor deriva con respecto a Qwen3-8B y se inyectaron en el modelo base de 8B. El resultado es una arquitectura densa híbrida, con capas de dos modelos originales distintos, que conserva la estructura Qwen3 (transformador con atención causal y normalización QKV). La cuantización se realizó con la librería mlx-lm a 3 bits con group_size 64, y se recomienda usar un drafter de 4 bits (por ejemplo, mlx-community/Qwen3.8-27B-MTP-4bit) para activar la decodificación especulativa MTP, que alcanza una tasa de aceptación de aproximadamente el 82 % y un speedup de 1,6x.

No se dispone de información sobre el proceso de entrenamiento de la versión Jumbo original ni de la cuantización (datasets, número de tokens, técnicas de alineación). La model card no menciona RLHF, DPO ni ningún otro ajuste posterior a la fusión.

## Capacidades

- Generación de texto conversacional y completado de prompts en inglés.
- Soporte de decodificación especulativa MTP (multi-token prediction) con un modelo drafter de 4 bits, alcanzando ~1,6x de speedup en inferencia.
- Capacidad de ejecutarse en memoria limitada (~16,4 GB con drafter cargado), gracias a la cuantización 3-bit.
- Compatible con el ecosistema MLX de Apple Silicon (mlx-lm y mlx_vlm).
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni un modo "thinking" específico.
- Multilingüismo no documentado; la model card solo indica inglés.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX, puede ejecutarse en Macs con Apple Silicon (por ejemplo, M2/M3 con 16-32 GB de RAM) para generación de texto y experimentación sin necesidad de GPU dedicada.
- Investigación en técnicas de cuantización: sirve como banco de pruebas para evaluar el impacto de la cuantización 3-bit en modelos de gran tamaño fusionados, comparando con las versiones 4-bit y 8-bit del mismo Jumbo.
- Prototipado de aplicaciones con restricciones de memoria: su pico de ~16,4 GB permite desplegarlo en entornos con una única GPU de 24 GB (por ejemplo, RTX 3090/4090) o en sistemas con memoria unificada, aunque no se recomienda para producción.
- Evaluación de la técnica "organ transplant": permite a investigadores analizar si la fusión de capas de modelos distintos mantiene capacidades razonables a 3 bits, comparando con el modelo original Qwen3-8B.
- Generación de texto en inglés en entornos sin conexión: para aplicaciones donde la privacidad es crítica y se tolera una calidad menor que los modelos de producción.
- Investigación en decodificación especulativa: con el drafter MTP de 4 bits, sirve para medir el impacto del MTP en modelos cuantizados a baja precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros tests estándar. Solo se documentan métricas de rendimiento de decodificación especulativa: ~82 % de tasa de aceptación del drafter y ~1,6x de speedup, pero sin contexto de calidad de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16,4 GB de pico con el drafter MTP de 4 bits cargado; sin drafter, la memoria será algo menor (no se especifica el valor exacto).
- GPU recomendadas: no se especifican modelos concretos, pero al necesitar ~16 GB, cabe en tarjetas de consumo con 24 GB (RTX 3090, RTX 4090) y en Apple Silicon con 32 GB de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max).
- Cabe en consumer GPU: sí, en las de 24 GB o superiores. No en tarjetas de 12-16 GB sin cuantización adicional.
- Opciones de despliegue: MLX (mlx_lm.generate, mlx_vlm.generate) en macOS; no se menciona compatibilidad con vLLM, llama.cpp u Ollama en la model card.
- Latencia y throughput: no se documentan valores concretos, solo el speedup relativo de 1,6x con MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Cuantización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-32B-Jumbo-3bit | ~31.9B (dato safetensors: 4.4B) | 76 | 3-bit | No disponible | Apache-2.0 | MLX (safetensors) |
| Qwen3.8-32B-Jumbo (bf16) | ~31.9B | 76 | bf16 | No disponible | Apache-2.0 | safetensors |
| Qwen3.8-32B-Jumbo-8bit | ~31.9B | 76 | 8-bit | No disponible | Apache-2.0 | safetensors |
| Qwen3-32B (oficial) | 32B | 64 (aprox.) | bf16 | 128K (documentado en Qwen3) | Apache-2.0 | safetensors |

No hay benchmarks comparativos publicados entre estas versiones. El modelo oficial Qwen3-32B de Alibaba es la alternativa de referencia en la misma categoría de tamaño, pero no es equivalente en arquitectura ni en licencia de uso (aunque también es Apache-2.0). La comparación directa no es posible sin datos de rendimiento.

## Limitaciones y advertencias

- Modelo experimental: es el resultado de una técnica de "model surgery" no validada en producción, y la cuantización a 3 bits es agresiva y puede degradar significativamente la calidad de generación.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que no se puede evaluar su rendimiento real frente a modelos estándar.
- La discrepancia entre los ~31.9B declarados y los 4.396.255.952 parámetros en safetensors es preocupante; podría indicar un error en el modelo o una cuantización extrema que elimina la mayoría de los pesos.
- Solo se indica soporte de inglés; el comportamiento en otros idiomas no está documentado y probablemente sea deficiente.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está recomendado para entornos de producción debido a su naturaleza experimental y a la falta de evaluación.
- La decodificación especulativa MTP requiere un drafter de 4 bits, que no está incluido en este repo y debe descargarse por separado; sin él, la velocidad de generación puede ser baja.
- No se garantiza la estabilidad de la generación en contextos largos, dado que la longitud de contexto no está especificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-3bit
- Modelo base (bf16): https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo
- Versión 8-bit: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-8bit
- Versión 4-bit: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-4bit
- Colección Jumbo: https://huggingface.co/collections/StargazerLabs/jumbo
- Drafter MTP recomendado: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-4bit
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guía completa de Qwen3 (contexto de la familia): https://insiderllm.com/guides/qwen3-complete-guide/
