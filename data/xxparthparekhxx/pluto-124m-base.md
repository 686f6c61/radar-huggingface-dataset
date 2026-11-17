# xxparthparekhxx/pluto-124m-base

## Resumen

Pluto 124M Base es un modelo de lenguaje de 121,2 millones de parámetros entrenado desde cero por el desarrollador independiente xxparthparekhxx. Se trata de un transformer decoder-only de 12 capas y anchura 768, con atención de consultas agrupadas (GQA) y una ventana de contexto de 1.024 tokens. Su entrenamiento se realizó sobre 4.350 millones de tokens del corpus educativo FineWeb-Edu, tokenizados con el BPE de GPT-2.

La relevancia del modelo es doble. Por un lado, sirve como referencia reproducible de un pipeline de preentrenamiento completo a pequeña escala: el autor documenta pasos, optimizador (Muon con variante DeepSeek-V4 para matrices 2D y AdamW para embeddings y normas), horarios de learning rate y tiempos de cómputo reales, incluyendo las primeras 750 millones de tokens en una GPU de portátil RTX 5060 con 8 GB. Por otro, su evaluación con lm-evaluation-harness 0.4.13 lo sitúa por delante de GPT-2 124M en tareas de conocimiento escolar y científico (ARC, OpenBookQA, HellaSwag), aunque por detrás en LAMBADA.

Es un modelo base de continuación de texto, no ajustado para instrucciones ni diálogo; el autor publica una variante chat separada (pluto-124m-chat). Su licencia Apache-2.0 y su reducido tamaño lo hacen útil para experimentación, docencia y despliegue en hardware muy limitado, no para producción exigente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, atención GQA con QK-norm y soft-cap de logits |
| Parámetros totales | 121.229.568 (embeddings atados con la capa de salida) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (el autor no publica variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 (datos de entrenamiento FineWeb-Edu bajo ODC-By 1.0) |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de 12 capas con pre-norm y RMSNorm, anchura 768 y feed-forward SwiGLU con dimensión oculta 2.048. La atención es de consultas agrupadas con 12 cabezas de consulta y 4 de clave/valor, tamaño de cabeza 64, RoPE con θ = 10.000, RMSNorm aplicada a consultas y claves y una puerta sigmoide en la salida de atención. La capa de salida aplica un soft-cap tanh sobre los logits a 30. El vocabulario es el BPE de GPT-2 más 4 tokens de chat (no usados en este modelo base), ampliado a 50.304 entradas. La arquitectura no es una clase estándar de transformers: el código vive en `modeling_pluto.py` dentro del repositorio.

El entrenamiento cubrió 4.350 millones de tokens de FineWeb-Edu `sample-10BT` en 8.297 pasos de 524.288 tokens cada uno (512 secuencias de 1.024), en bf16 con `torch.compile`. Se usó Muon para las matrices de pesos 2D y AdamW para embeddings y normas, con la variante DeepSeek-V4 de Muon (ortogonalización Newton–Schulz con actualización reescalada a RMS 0,18 para compartir learning rate). El learning rate alcanzó un pico de 3e-3 con weight decay 0,1, 200 pasos de warmup, fase plana y decaimiento lineal al 10% del pico en el último 25% de pasos. La versión 2 reanudó desde el checkpoint de la v1 en el paso 1.430 (750 millones de tokens, antes del decaimiento) y continuó la fase plana hasta 4.350 millones. El cómputo fue de unas 7,6 horas en una RTX 5060 Laptop (≈26,7k tokens/s) para los primeros 1.430 pasos y 3,9 horas en una RTX PRO 6000 (≈258k tokens/s) para el resto.

## Capacidades

- Generación y continuación de texto en inglés: completa pasajes a partir de un prefijo, sin instrucciones explícitas.
- Conocimiento escolar y científico: destaca en preguntas de ciencia y conocimiento educativo, coherente con su corpus de entrenamiento.
- Razonamiento de sentido común básico: HellaSwag y PIQA por encima o a la par de GPT-2 124M.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Tokenizador con 4 tokens de chat reservados, aunque no utilizados en esta variante base.

## Casos de uso

- Docencia y reproducción de pipelines de preentrenamiento: el modelo y su documentación permiten replicar el entrenamiento completo en hardware de consumo (las primeras 750M de tokens caben en una GPU de portátil de 8 GB), útil para cursos de LLM.
- Generación de texto educativo de relleno: continuación de párrafos sobre ciencia o conocimiento escolar en tareas de aumento de datos o generación de ejemplos sintéticos, gracias a su sesgo hacia FineWeb-Edu.
- Baseline de investigación: comparación controlada frente a GPT-2 124M en experimentos de arquitectura (GQA, QK-norm, soft-cap) con un coste de cómputo mínimo.
- Pruebas de infraestructura de despliegue: modelo de 1 GB en fp32 que sirve para validar pipelines de transformers, `torch.compile` o servidores de inferencia antes de escalar a modelos mayores.
- Completado de texto en aplicaciones de autocompletado simple: con contexto de 1.024 tokens puede sugerir continuaciones en editores o formularios, siempre que el dominio sea texto educativo en inglés.
- Experimentación con optimizadores: el uso documentado de Muon (variante DeepSeek-V4) lo convierte en banco de pruebas para estudiar su comportamiento frente a AdamW en modelos pequeños.
- Evaluación de alineación y seguridad en modelos base: al no estar ajustado para instrucciones, permite estudiar el comportamiento crudo de un LM preentrenado ante prompts adversarios.

## Benchmarks y rendimiento

Resultados con lm-evaluation-harness 0.4.13, zero-shot, fp32. Errores estándar aproximados: ±0,5 en HellaSwag y LAMBADA, ±1 a 1,5 en ARC, PIQA y Winogrande, ±2 en OpenBookQA.

| Tarea (métrica) | Pluto base v2 | Pluto chat v2 | GPT-2 124M | Pluto base v1 |
|---|---|---|---|---|
| HellaSwag (acc_norm) | 33,9 | 34,2 | 31,1 | 30,2 |
| ARC-Easy (acc_norm) | 47,6 | 44,6 | 39,5 | 45,2 |
| ARC-Challenge (acc_norm) | 27,0 | 26,5 | 22,7 | 24,3 |
| OpenBookQA (acc_norm) | 30,4 | 30,6 | 27,2 | 29,4 |
| PIQA (acc_norm) | 63,4 | 62,4 | 62,5 | 60,3 |
| Winogrande (acc) | 52,3 | 51,9 | 51,6 | 52,3 |
| LAMBADA (acc) | 28,1 | 20,6 | 32,6 | 23,3 |

Pérdida de validación sobre 4 millones de tokens reservados de FineWeb-Edu: 2,991 (perplejidad 19,9) para Pluto base v2, 3,203 (perplejidad 24,6) para v1 y 3,274 (perplejidad 26,4) para GPT-2. El autor advierte que este texto está en la distribución de Pluto, lo que favorece la comparación.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,0 GB; en fp32 la inferencia requiere aproximadamente 1,5 GB contando pesos y activaciones para contexto corto, y en bf16/fp16 alrededor de 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entrenó parte del modelo en una RTX 5060 Laptop de 8 GB y el resto en una RTX PRO 6000.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito por la arquitectura personalizada); vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura, por lo que su uso requeriría conversión y adaptación del código de `modeling_pluto.py`.
- Latencia y throughput: no se publican cifras de inferencia; como referencia de entrenamiento, el autor reporta ≈26,7k tokens/s en RTX 5060 Laptop y ≈258k tokens/s en RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag | ARC-Challenge | LAMBADA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Pluto 124M Base v2 | 121,2M | 1.024 | 33,9 | 27,0 | 28,1 | Apache-2.0 | Hugging Face |
| GPT-2 124M | 124M | 1.024 | 31,1 | 22,7 | 32,6 | MIT (según el repositorio original) | Hugging Face |
| Pluto 124M Base v1 | 121,2M | 1.024 | 30,2 | 24,3 | 23,3 | Apache-2.0 | Hugging Face (revisión `v1`) |

No se dispone de datos de benchmarks para otras alternativas de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y contexto de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Es un modelo base: continúa texto, no sigue instrucciones ni mantiene diálogo; para chat debe usarse la variante pluto-124m-chat.
- Entrenado exclusivamente con páginas web educativas, por lo que su conocimiento de código, diálogo y ficción es muy limitado; LAMBADA queda por debajo de GPT-2 por falta de narrativa en el corpus.
- Los hechos que genera son poco fiables; riesgo alto de alucinación en preguntas factuales.
- Winogrande está cerca del azar (≈50%) en todos los modelos comparados, incluido este.
- Requiere `trust_remote_code=True` para tokenizador y modelo, lo que implica ejecutar código del repositorio; conviene auditar `modeling_pluto.py` antes de usarlo en entornos sensibles.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (FineWeb-Edu) están bajo ODC-By 1.0 y deben respetarse sus condiciones de atribución.
- Sesgos conocidos: no se documentan análisis específicos de sesgo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xxparthparekhxx/pluto-124m-base
- Variante chat: https://huggingface.co/xxparthparekhxx/pluto-124m-chat
- Revisión v1: https://huggingface.co/xxparthparekhxx/pluto-124m-base/tree/v1
- Perfil del autor en GitHub: https://github.com/xxparthparekhxx
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- GPT-2 (modelo de comparación): https://huggingface.co/openai-community/gpt2
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Resultados de evaluación en el repositorio: https://huggingface.co/xxparthparekhxx/pluto-124m-base/tree/main/eval
