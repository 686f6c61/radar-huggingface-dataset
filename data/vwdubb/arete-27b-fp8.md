# vwdubb/Arete-27B-FP8

## Resumen

Arete-27B-FP8 es una cuantización en FP8 del modelo Arete-27B desarrollado por Nous Research, un ajuste fino supervisado (SFT) sobre el modelo Qwen3.8-27B de Alibaba. El objetivo declarado del proyecto es modificar los sesgos de alineamiento del modelo base en temas políticamente sensibles, reforzando lo que el autor denomina "valores occidentales" en siete categorías concretas: libertad de expresión, ideología estatal, Estado frente a libre mercado, educación, privacidad y vigilancia de datos, democracia y política medioambiental. Con 27.356.728.560 parámetros, se trata de un modelo denso (no MoE) de la familia Qwen3.5.

La relevancia del modelo reside en su enfoque metodológico: Nous Research documenta de forma explícita el proceso de post-entrenamiento, incluyendo el uso de un modelo profesor (Inkling), la generación de 20.000 prompts mediante un pipeline con deduplicación, y una evaluación de propaganda con 803 prompts juzgados por un LLM (Grok 4.7) con rúbrica fija. Según la model card, el fact score subió de 2,32 a 2,98 sobre 5 y las respuestas con propaganda cayeron del 22% al 0,9%.

Esta versión concreta, publicada por el usuario vwdubb, aplica cuantización FP8 mediante compressed-tensors sobre el checkpoint original, reduciendo el peso del repositorio a 30,4 GB. Es una opción orientada a despliegue en producción con vLLM o TGI, no al entrenamiento. La licencia es Apache 2.0 y el modelo está pensado para asistencia general, trabajo agéntico e investigación sobre alineamiento de valores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), sin modificación arquitectónica respecto al base |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64k tokens (contexto de entrenamiento); contexto nativo del base no especificado en la información disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | No disponible (la model card no especifica listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, FP8) |

## Arquitectura y entrenamiento

Arete-27B parte de Qwen3.8-27B de Alibaba, un transformer denso de 27B parámetros. Nous Research no modificó la arquitectura: el post-entrenamiento consistió exclusivamente en SFT, sin RL, sin optimización de preferencias y sin cambios estructurales. Se congeló el codificador de visión (los datos de entrenamiento son solo texto) y se desactivó la cabeza de multi-token-prediction (MTP) durante el entrenamiento. Se entrenaron todos los pesos del modelo de lenguaje.

El entrenamiento usó aproximadamente 52,8 millones de tokens a 64k de contexto, sin sequence packing, durante 2 épocas y 1.202 pasos totales (601 por época). Configuración: optimizador AdamW con betas (0,9; 0,98), epsilon 1e-5, weight decay 0,1, gradient clipping 1,0, learning rate con warmup lineal de 1e-6 a 1e-5 en los primeros 120 pasos y decaimiento coseno hasta 1e-6 en el paso 1.202. Batch size 48, precisión bf16 con pesos maestros y estados del optimizador en fp32, tensor parallel 4. La loss bajó rápidamente durante el warmup y se estabilizó cerca de 1,0 al final de la primera época, con un escalón a ~0,8 al inicio de la segunda; la norma del gradiente pasó de ~32 a ~1,4 tras el warmup.

Los datos de entrenamiento se generaron con un pipeline con deduplicación obligatoria: 20.000 prompts en las siete categorías de valores, verificados contra el conjunto de evaluación held-out (eliminando solapamientos), con respuestas del profesor Inkling y del modelo base recogidas en paralelo. Cada lote pasó por pull requests revisados. El profesor se eligió por obtener una evaluación positiva en los objetivos y por ser abierto, evitando restricciones de "destilación ilícita". La evaluación se realizó con el dataset Propaganda_Eval (803 prompts, fuentes en inglés, ningún origen aporta más de 13 prompts) y un juez LLM (Grok 4.7) con rúbrica fija, calibrado sobre un piloto de 25 prompts anotados a mano con tres revisiones de rúbrica.

## Capacidades

- Generación de texto y conversación multi-turno en inglés (idiomas adicionales no confirmados en la información disponible).
- Razonamiento y asistencia general, con regresión mínima reportada en benchmarks de capacidad general y agénticos.
- Trabajo agéntico y multi-step reasoning, según la model card.
- Capacidad multimodal heredada del base (codificador de visión presente pero congelado durante el SFT); no se garantiza su calidad tras el ajuste, ya que el entrenamiento fue solo texto.
- Tool calling / function calling: no confirmado explícitamente en la información disponible; el modelo base Qwen3.5 lo soporta, pero la model card no lo verifica tras el SFT.
- Respuestas reformuladas en temas políticamente sensibles en las siete categorías objetivo (libertad de expresión, ideología estatal, Estado frente a libre mercado, educación, privacidad y vigilancia, democracia, política medioambiental).
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia general conversacional: el modelo gestiona diálogos multi-turno con hasta 64k tokens de contexto, adecuado para sesiones largas o documentos extensos donde se requiere mantener coherencia a lo largo de muchas interacciones.
- Investigación sobre alineamiento de valores: comparar respuestas de Arete-27B frente a Qwen3.8-27B en las siete categorías con el dataset Propaganda_Eval permite estudiar cómo el SFT modifica el encuadre político sin alterar la capacidad factual.
- Generación de contenido editorial en inglés: redacción de artículos, informes o análisis donde se requiere un encuadre occidental explícito en temas de política, economía o medio ambiente, con la ventaja de que el modelo evita reproducir propaganda estatal según la evaluación del autor.
- Despliegue en producción con FP8: al estar cuantizado en FP8 y empaquetado en safetensors con compressed-tensors, se puede servir con vLLM o TGI en GPUs con soporte FP8 (H100, L40S, etc.), reduciendo el coste de VRAM frente al checkpoint bf16.
- Evaluación comparativa de sesgos: usar el modelo como referencia "post-entrenada" frente al base para medir la eficacia de pipelines de SFT en la mitigación de sesgos ideológicos, replicando la metodología de rúbrica fija y juez LLM.
- Prototipado de agentes: aunque el soporte de tool calling no está confirmado tras el SFT, el modelo conserva la base Qwen3.5 y puede probarse en pipelines agénticos con validación previa de la tasa de acierto en llamadas a herramientas.
- Análisis de documentos largos: con 64k de contexto, resumir o extraer información de contratos, informes o transcripciones extensas en inglés.

## Benchmarks y rendimiento

La model card reporta métricas de su evaluación propia de propaganda, no benchmarks estándar de capacidad. Los datos disponibles son:

| Metrica | Antes (Qwen3.8-27B) | Despues (Arete-27B) |
|---|---|---|
| Fact score (0-5) | 2,32 | 2,98 |
| Respuestas con propaganda | 22% | 0,9% |

La mejora se mantuvo en las siete categorías de valores, sin regresión significativa en los benchmarks de capacidad general y agénticos que ejecutaron (no se publican los valores concretos de esos benchmarks en la información disponible). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8, los 27,36B parámetros ocupan aproximadamente 27,4 GB solo en pesos; con overhead de KV cache y activaciones, se recomienda un mínimo de 32-40 GB de VRAM para contextos moderados y 48-80 GB para contextos cercanos a 64k.
- GPU recomendadas: H100 (80 GB), H200, L40S (48 GB), A100 80 GB. Las GPUs con soporte nativo FP8 (Hopper y Ada Lovelace) ofrecen mejor rendimiento; en Ampere el FP8 se emula o se convierte, con menor eficiencia.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP8 sin offloading o cuantización adicional a 4 bits (GGUF/AWQ/GPTQ). Una RTX 4090 podría ejecutarlo con cuantización INT4 (~14-16 GB) mediante llama.cpp o similar, con pérdida de calidad no evaluada.
- Opciones de despliegue: vLLM y TGI son las opciones naturales para FP8 con compressed-tensors; llama.cpp y Ollama requerirían conversión a GGUF (no incluida en este repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-FP8 (este) | 27,36B | 64k (entrenamiento) | Apache 2.0 | safetensors FP8 | SFT sobre Qwen3.8-27B, sesgo reformulado, cuantizado |
| NousResearch/Arete-27B | 27B | 64k (entrenamiento) | Apache 2.0 | safetensors bf16 | Checkpoint original sin cuantizar, mismo entrenamiento |
| Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 (presumible) | safetensors | Modelo base de Alibaba, sin post-entrenamiento de valores |
| Qwen3.5-27B (familia) | 27B | no disponible | Apache 2.0 (presumible) | safetensors | Generación anterior de la familia; comparación no verificada en la información disponible |

No se dispone de datos de benchmarks estándar para comparar rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El ajuste introduce un sesgo deliberado de encuadre en temas políticos; no es un modelo neutral y puede no ser adecuado para aplicaciones que requieran pluralidad de perspectivas o neutralidad ideológica.
- La evaluación se basa en un juez LLM (Grok 4.7) con rúbrica fija y 803 prompts en inglés; los resultados pueden no generalizar a otros idiomas, dominios o formulaciones de prompt.
- Riesgo de alucinación inherente a los modelos de 27B, no cuantificado en la información disponible.
- El codificador de visión está congelado y el entrenamiento fue solo texto; las capacidades multimodales pueden haberse degradado y no están evaluadas.
- El soporte de tool calling y agentes no está verificado tras el SFT; validar antes de usar en producción agéntica.
- La cuantización FP8 puede introducir una degradación de calidad respecto al checkpoint bf16 original; no se reportan métricas comparativas entre ambas versiones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales de Alibaba que conviene revisar; la model card no las detalla.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de terceros sobre el comportamiento real del modelo.
- Idiomas soportados no documentados; el entrenamiento y la evaluación se realizaron en inglés.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/vwdubb/Arete-27B-FP8
- Modelo base en Hugging Face: https://huggingface.co/NousResearch/Arete-27B
- Blog post de Nous Research: https://nousresearch.com/arete
- Dataset de evaluación Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/NousResearch/arete-data-pairs
