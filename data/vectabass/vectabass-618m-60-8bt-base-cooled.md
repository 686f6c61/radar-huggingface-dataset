# VectaBass/vectabass-618m-60.8bt-base-cooled

## Resumen

vectabass-618m-60.8bt-base-cooled es un modelo de lenguaje base de 617,9 millones de parámetros totales (527,7 millones sin embeddings) desarrollado por VectaBass, un proyecto orientado a IA soberana del Reino Unido. Se trata de una celda concreta (N4-D6) dentro de la "Phase 1 AR square", una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente las leyes de escalado. Este modelo concreto fue entrenado con 60.800 millones de tokens, lo que equivale a 115 tokens por parámetro no-embedding.

La arquitectura es de tipo transformer causal similar a Llama, con atención de grupo (GQA 2:1), SwiGLU, RMSNorm pre-norm y RoPE, pero incorpora una innovación propia: atención auto-exclusiva (XSA), que Llama no tiene. El contexto es de 2048 tokens y el vocabulario es GPT-2 BPE ampliado con 26 tokens especiales. El modelo se distribuye en bf16 con pesos en safetensors y requiere `trust_remote_code` para cargar la implementación de atención personalizada.

Es relevante ahora porque forma parte de un esfuerzo de transparencia en leyes de escalado y porque incluye datos de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y fuentes del sector público y parlamentario británico, un nicho poco cubierto por los modelos base convencionales. No es un modelo instructivo ni ajustado en seguridad: es una pieza de un estudio científico, no un asistente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only tipo Llama con atención auto-exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 617.908.480 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Parametros sin embeddings | 527.708.160 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No especificados en la model card; al ser un modelo pequeño en bf16 (1.2 GB de repo) es convertible a GGUF/INT8/INT4 con herramientas estándar, pero no se publican cuantizaciones oficiales |
| Idiomas soportados | en, cy (galés), gd (gaélico escocés), ga (irlandés), gv (manés), kw (córnico), sco (escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con código de modelado personalizado (`modeling_vectabass.py`) |
| Ancho / capas | 1792 / 15 |
| Cabezas | 28 query, 14 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 4752 |
| Vocabulario | 50304 filas (GPT-2 BPE 50257 + 26 especiales + padding) |
| Tokens de entrenamiento | 60.800.237.568 |
| Precisión de entrenamiento | bf16 pesos y activaciones, fp32 master weights, fp32 en normas, ángulos RoPE y logits |
| Hardware de entrenamiento | 2 x NVIDIA GH200 120GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño transformer decoder-only con pre-norm RMSNorm y RoPE (base 10000). La particularidad técnica es la atención auto-exclusiva (XSA), una variante de atención causal que no existe en Llama y que obliga a cargar código remoto (`trust_remote_code=True`) para instanciar el modelo. Usa GQA con ratio 2:1 (28 cabezas de query, 14 de key-value, dimensión 64) y FFN SwiGLU de dimensión 4752. Los embeddings están atados a la capa de salida, lo que explica la diferencia entre parámetros totales y no-embedding.

El entrenamiento empleó 60.800 millones de tokens con un batch de 458.752 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW fp32 (betas 0.9, 0.95), LR pico de 0.00148, warmup de 437M tokens y un schedule de warmup, fase constante y cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. Los datos provienen de una vista "phase-1-release" de 47 bins de texto con licencia abierta (unos 96B de tokens únicos), incluyendo fineweb-edu, fineweb-2, finemath y fuentes del sector público y parlamentario británico y de lenguas celtas. No se menciona RLHF, DPO ni ajuste instructivo alguno: es un modelo estrictamente base.

## Capacidades

- Generación de texto autoregresiva en inglés y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés.
- Modelado de lenguaje puro: continuación de texto, puntuación de secuencias y evaluación de verosimilitud.
- Razonamiento de sentido común limitado, medido en benchmarks zero-shot (ARC, HellaSwag, PIQA, WinoGrande, BoolQ).
- Conocimiento factual básico y respuesta a preguntas de opción múltiple (MMLU 0.236, muy bajo para estándares actuales).
- Capacidad multilingüe restringida a las lenguas listadas, con especial atención al galés y otras lenguas celtas por la composición del dataset.
- No soporta tool calling ni function calling de forma nativa (no hay formato de herramientas ni ajuste para ello).
- No soporta agentes ni razonamiento multi-paso estructurado (no es un modelo instructivo).
- No tiene visión, audio ni modo "thinking".
- No dispone de plantilla de chat ni tokens de rol; requiere prompts manuales.

## Casos de uso

- Investigación en leyes de escalado: el modelo es una celda de una escalera de tamaños y presupuestos de tokens publicada para verificar empíricamente curvas de pérdida; se usa para reproducir resultados y ajustar extrapolaciones de compute óptimo.
- Estudio de lenguas celtas de bajos recursos: permite analizar la calidad de modelado de galés, gaélico escocés, irlandés, manés y córnico en un modelo base con datos específicos, útil para proyectos de preservación lingüística y evaluación de corpus.
- Punto de partida para fine-tuning ligero: al ser un modelo de 618M con licencia Apache 2.0 y 1.2 GB de pesos, se puede ajustar en una sola GPU consumer para tareas de clasificación, extracción o generación de dominio específico.
- Experimentos de atención: la atención auto-exclusiva (XSA) es una variante poco común; el modelo sirve como banco de pruebas para comparar XSA frente a atención causal estándar en tareas controladas.
- Generación de texto en dominios del sector público británico: dado el peso de fuentes parlamentarias y públicas en el corpus, puede emplearse en prototipos de resumen o continuación de texto administrativo, siempre con revisión humana.
- Evaluación de pipelines de inferencia: su tamaño permite medir latencia y throughput de vLLM, llama.cpp u Ollama en hardware modesto, y validar la conversión de safetensors a GGUF con código remoto.
- Docencia y reproducción de recetas de entrenamiento: el detalle de hiperparámetros (Muon, cooldown 1-sqrt, batch) lo convierte en un caso de estudio para cursos de entrenamiento de LLM a pequeña escala.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 ítems por tarea (shuffle con semilla 0, protocolo hub-v1), según la model card del autor:

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0.644 |
| ARC-Challenge | 0.322 |
| HellaSwag | 0.452 |
| PIQA | 0.694 |
| WinoGrande | 0.564 |
| BoolQ | 0.588 |
| MMLU | 0.236 |
| LAMBADA | 0.434 |
| DQRB (propio) | 0.601 |
| LAMBADA bits per byte | 1.197 |

Pérdida de validación en el canon retenido del autor (phase-1-release canon-8192, 8192 x 2048 tokens): 1.9752 nats por token; con PyTorch SDPA se reproduce 1.9753 (el entrenamiento usó FlashAttention-4). No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,3-1,5 GB para pesos, más overhead de activaciones y caché KV para 2048 tokens (pequeño, del orden de decenas de MB por secuencia).
- VRAM estimada en cuantización INT8: en torno a 0,7-0,8 GB; en INT4: en torno a 0,4-0,5 GB (estimaciones a partir del tamaño de pesos, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y GH200. El entrenamiento se hizo en 2 x GH200 120GB, pero la inferencia es trivial.
- Cabe en GPU consumer sin problema, incluidas portátiles con 6-8 GB.
- Despliegue: transformers con `trust_remote_code=True` es la vía oficial. Para vLLM, llama.cpp u Ollama sería necesario convertir los pesos y portar la atención XSA, ya que no hay soporte nativo anunciado.
- Latencia y throughput: no publicados. Por tamaño, se espera inferencia en tiempo real en una sola GPU consumer, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-618m-60.8bt-base-cooled | 617,9M totales (527,7M sin embeddings) | 2048 | Apache 2.0 | Base, XSA, multilingüe celta, parte de estudio de scaling |
| Qwen2.5-0.5B | ~494M | 32.768 | Apache 2.0 | Base e instructivo, contexto mucho mayor, sin lenguas celtas |
| SmolLM2-360M | ~362M | 8192 | Apache 2.0 | Base e instructivo, contexto mayor, centrado en inglés |
| Pythia-410M | ~410M | 2048 | Apache 2.0 | Base, contexto 2048, estudio de scaling comparable |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada; los benchmarks publicados del modelo no incluyen una tabla cruzada con otros modelos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo ni de seguridad: no debe usarse como asistente conversacional ni en producción orientada a usuario final sin un fine-tuning posterior.
- Alucinación: el autor advierte explícitamente de que "afirmará cosas falsas con fluidez"; no hay filtrado de salidas.
- Contexto muy limitado (2048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística desigual: mayoritariamente inglés, con las lenguas celtas en proporciones menores; la calidad en manés o córnico probablemente sea baja.
- MMLU de 0.236 y ARC-Challenge de 0.322 indican conocimiento factual y razonamiento débiles, coherentes con su tamaño.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo.
- No hay cuantizaciones oficiales ni integración confirmada en vLLM, llama.cpp u Ollama; el soporte de la atención XSA en esos runtimes no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste de seguridad traslada toda la responsabilidad de filtrado y moderación al integrador.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-618m-60.8bt-base-cooled
- Referencia del recurso Isambard-AI: https://doi.org/10.48550/arXiv.2410.11199
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper: no disponible (anunciado como "forthcoming" en la model card)
