# SupraLabs/SupraNeo-4M

## Resumen

SupraNeo-4M es un modelo de lenguaje de tipo decoder-only desarrollado por SupraLabs, un laboratorio independiente que investiga modelos pequeños y multimodales para hardware de consumo. Con 4.070.240 parámetros, está diseñado para responder una pregunta concreta: cuánto de un modelo diminuto debería computar realmente. El modelo dedica el 82% de sus parámetros al stack transformer, reduciendo la matriz de embeddings a 524k parámetros gracias a un tokenizador BPE personalizado de 4.096 tokens. Su arquitectura sigue el diseño de Qwen3, con 12 capas, hidden size de 160 y atención con GQA 2:1.

Se preentrenó desde cero en un solo NVIDIA L4 sobre 5.000 millones de tokens, con una mezcla de datos compuesta por un 84% de FineWeb-Edu (filtrado con int_score ≥ 4) y un 16% de DCLM-baseline. El contexto se extendió de 512 a 1.024 tokens durante la fase de anneal. El modelo se publica bajo licencia Apache 2.0 y está disponible en formato safetensors, sin necesidad de trust_remote_code. Su relevancia radica en servir como artefacto de investigación para estudiar presupuestos de parámetros, mezclas de datos y arquitecturas en la escala de pocos millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (Qwen3ForCausalLM), decoder-only |
| Parametros totales | 4.070.240 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Capas | 12 |
| Cabezas de atención | 4 (head_dim 40), KV heads 2 (GQA 2:1) |
| Tamaño del vocabulario | 4.096 (BPE personalizado) |
| Precisión | float32 |

## Arquitectura y entrenamiento

SupraNeo-4M implementa la arquitectura Qwen3 sin código personalizado: no requiere trust_remote_code. Utiliza 12 capas con hidden size de 160, 4 cabezas de atención con head_dim de 40, y Grouped Query Attention con 2 KV heads (proporción 2:1). La capa MLP tiene un tamaño intermedio de 432 y usa activación SwiGLU. La normalización se realiza con RMSNorm y QK-Norm, y los embeddings están atados (tied). El tokenizador es un BPE personalizado de 4.096 tokens, lo que reduce la matriz de embeddings a 524k parámetros y libera espacio para el stack transformer. El ratio de aspecto d/L ≈ 13 es deliberadamente inferior al de modelos de 100M, siguiendo el hallazgo de MobileLLM de que la profundidad óptima aumenta a medida que el modelo se reduce.

El preentrenamiento se realizó desde cero en un solo NVIDIA L4 durante 5B tokens (aproximadamente 1.230 tokens por parámetro). Los datos provienen de un 84% de HuggingFaceFW/fineweb-edu filtrado a int_score ≥ 4 y un 16% de mlfoundations/dclm-baseline-1.0. El schedule es WSD con learning rate pico de 4e-3, 1.500 pasos de warmup y decaimiento 1-sqrt en el 20% final. Durante el anneal, se entrenó solo con el subconjunto de FineWeb-Edu y se extendió el contexto de 512 a 1.024 tokens. El batch fue de 65.536 tokens por paso, con optimizador AdamW (β 0.9/0.95, weight decay 0.1 en parámetros 2D, grad clip 1.0) y z-loss de 1e-4. Las ramas residuales se inicializaron escaladas por 1/√(2L). La huella de carbono estimada es de 0,46 kg CO₂ eq.

## Capacidades

- Generación de texto en inglés: produce pasajes gramaticalmente correctos y coherentes en una o dos frases, con deriva temática más allá de ese rango.
- Razonamiento lógico básico: alcanza un 38% en la categoría Logical Reasoning de BananaMind Base Bench 1.1, marginalmente significativo.
- Sin capacidad de aritmética ni de generación de código: los resultados en Quantitative (24%) y Code Completion (22%) están en el nivel de azar o por debajo.
- Sin seguimiento de instrucciones: es un modelo base sin plantilla de chat; apply_chat_template falla por diseño.
- Sin soporte de tool calling, agentes, visión ni audio.
- Multilingüe: limitado a inglés según los metadatos.
- Longitud de contexto: 1.024 tokens.

## Casos de uso

- Investigación en presupuestos de parámetros: permite estudiar cómo el ratio profundidad/anchura afecta a modelos de 4M, replicando los hallazgos de MobileLLM en la escala mínima.
- Evaluación de mezclas de datos: sirve para comparar el efecto de FineWeb-Edu frente a DCLM en modelos diminutos, ya que la mezcla de datos es un factor crítico en esta escala.
- Calibración de benchmarks de escala pequeña: se puede utilizar para ajustar umbrales de significación en benchmarks como BananaMind Base Bench, que fue calibrado para el rango de 65M-100M+.
- Educación en NLP: es un ejemplo de transformer completo y entrenable en una sola GPU L4, ideal para prácticas de preentrenamiento desde cero.
- Comparación de tokenizadores: permite investigar el impacto de un vocabulario de 4.096 tokens frente a uno de 32k en la compresión y la capacidad de modelado.
- Pruebas de arquitectura: facilita experimentos con GQA, QK-Norm y RMSNorm en modelos mínimos para entender su efecto en la estabilidad del entrenamiento.
- Reproducibilidad: actúa como referencia para futuros estudios de preentrenamiento a escala de pocos millones de parámetros, con configuración de entrenamiento documentada.

## Benchmarks y rendimiento

Resultados en BananaMind Base Bench 1.1 (350 ítems, 4-way continuation-likelihood, Elo por MLE ponderado con prior de 4 juegos a 1000):

| Categoría | Precisión | z vs azar | Elo | Significativo |
|---|---:|---:|---:|:--:|
| Language Completion | 56,0% | +5,06 | 963 | Sí |
| Logical Reasoning | 38,0% | +2,12 | 978 | Sí |
| World Knowledge | 34,0% | +1,47 | 820 | No |
| Context Tracking | 34,0% | +1,47 | 856 | No |
| Commonsense | 26,0% | +0,16 | 770 | No |
| Quantitative | 24,0% | −0,16 | 834 | No |
| Code Completion | 22,0% | −0,49 | 883 | No |

| Métrica | Valor |
|---|---|
| Elo global | 868 |
| Suelo de azar | 805 |
| Precisión bruta | 33,4% (IC 95%: 28,5–38,4%) |
| z vs azar | +3,64 (significativo) |

El autor advierte que la señal se concentra en Language Completion, la única categoría fuertemente separada, y que las cinco categorías restantes están dentro del ruido. El benchmark fue calibrado para el rango de 65M-100M+; a 4M, la mayoría de categorías carecen de resolución. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en float32 ocupan aproximadamente 16 MB; la inferencia puede ejecutarse en menos de 256 MB de VRAM.
- GPU recomendada: cualquier GPU moderna, incluso una NVIDIA L4 (usada en entrenamiento) o GPUs de consumo como RTX 3060.
- Cabe en cualquier GPU consumer; también se puede ejecutar en CPU.
- Opciones de despliegue: transformers (AutoModelForCausalLM) y text-generation-inference según los tags, aunque para 4M es más práctico usar transformers directamente. No hay GGUF publicado.
- Latencia y throughput: no se han publicado mediciones; al ser un modelo de 4M, la latencia es trivial en cualquier hardware moderno.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. La web de SupraLabs cataloga modelos de 1K a 752M parámetros, pero no se ofrecen datos específicos de rendimiento que permitan una comparación directa.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos, pero al estar preentrenado en corpus web en inglés (FineWeb-Edu y DCLM) es probable que herede sesgos presentes en esos datos.
- Alucinación: el autor indica explícitamente que no tiene fiabilidad factual; es probable que genere contenido plausible pero incorrecto.
- Contexto: 1.024 tokens, limitado para tareas de contexto largo.
- Idioma: solo inglés.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no está diseñado para producción.
- Sin seguimiento de instrucciones: no se puede usar como chatbot sin ajuste adicional.
- Vocabulario pequeño: comprime el texto aproximadamente un 35% menos eficientemente que un tokenizador estándar de 32k; no se deben comparar valores de cross-entropy con otros modelos, se recomienda usar bits-per-byte.

## Enlaces

- HuggingFace: https://huggingface.co/SupraLabs/SupraNeo-4M
- Web de SupraLabs: https://supra-labs.com/
- Catálogo de modelos: https://supra-labs.com/models.html
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
