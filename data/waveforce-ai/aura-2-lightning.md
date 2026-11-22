# waveforce-ai/Aura-2-Lightning

## Resumen

Aura-2-Lightning es un modelo de lenguaje causal de tipo decoder-only desarrollado por Waveforce AI. Se trata de un proceso de destilación estructural sobre la arquitectura de `openai-community/gpt2-xl` (1.557 millones de parámetros), que actúa como estudiante, alineado con los estados latentes de un modelo profesor de mayor escala: `openai/gpt-oss-20b`, un Mixture-of-Experts (MoE) de 20.000 millones de parámetros. El objetivo declarado por el autor es ofrecer una alternativa de alto rendimiento y baja latencia para despliegue local.

La innovación principal que describe la model card es la "Latent Space State Projection Alignment": en lugar de limitarse a minimizar la divergencia de logits sobre los tokens de salida (destilación token-level estándar), se entrena una cabeza de proyección lineal intermedia que mapea el espacio de representación del estudiante (1600 dimensiones) al espacio de estados ocultos del profesor (2880 dimensiones), minimizando un error cuadrático medio entre ambos. La función de pérdida combina la pérdida de modelado causal con un término MSE ponderado a 0.5.

El modelo es relevante ahora por su enfoque en eficiencia: parte de una arquitectura GPT-2 XL madura y sin restricciones de licencia, y la combina con técnicas de destilación cross-architecture para intentar transferir capacidades de razonamiento de un modelo MoE de 20B a un modelo denso de 1.5B. La licencia Apache 2.0 y su reducido tamaño lo hacen atractivo para despliegues en hardware modesto, aunque no se han publicado resultados de benchmarks que respalden las capacidades declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (GPT-2 XL) con destilación de estados latentes desde un MoE |
| Parametros totales | 1.557.611.200 (1.5B) |
| Parametros activos | No aplica (modelo denso; el profesor MoE de 20B no forma parte de los pesos publicados) |
| Longitud de contexto | No disponible (GPT-2 XL base soporta 1024 tokens; no confirmado para este fine-tune) |
| Tipos de cuantizacion | No especificados por el autor; al ser safetensors FP16 es compatible con cuantizaciones estándar (GGUF, bitsandbytes, GPTQ) mediante herramientas externas |
| Idiomas soportados | No disponible (heredados de GPT-2 XL, predominantemente inglés; no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3.1 GB) |

## Arquitectura y entrenamiento

La arquitectura del estudiante es un transformer decoder-only causal idéntico a GPT-2 XL: 48 capas, dimensión oculta de 1600 y aproximadamente 1.5B parámetros. El profesor es `openai/gpt-oss-20b`, un MoE de 20B parámetros que, según la model card, se ejecutó en cuantización nativa Microscaling FP4 (MXFP4) con kernels Triton dedicados para reducir el consumo de memoria durante el entrenamiento.

El entrenamiento combina dos objetivos: la pérdida estándar de modelado causal (`CausalLM`) y una pérdida de alineamiento latente definida como `0.5 · MSE(W_proj · h_student, h_teacher)`, donde `W_proj` es una cabeza de proyección lineal que mapea las 1600 dimensiones del estudiante a las 2880 del profesor. Para estabilizar la optimización se usó `PagedAdamW8bit`, clipping de norma de gradiente con `max_norm=1.0` y enmascaramiento de pérdida (-100) sobre tokens de padding. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma principal heredado de GPT-2 XL; multilingüismo no confirmado).
- Modelado causal de secuencias con decodificación estándar (temperature, top_p, top_k, repetition penalty y no_repeat_ngram_size preconfigurados).
- Razonamiento de densidad media según el autor, derivado de la destilación de estados latentes del profesor MoE; sin benchmarks que lo verifiquen.
- Integración directa con `transformers` mediante `pipeline("text-generation")` y `generation_config.json` preajustado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta ventana de contexto extendida más allá de la del GPT-2 XL base.

## Casos de uso

- Generación de texto local en dispositivos con recursos limitados: con 1.5B parámetros en FP16 (~3.1 GB) o en cuantización de 8 bits (~1.6 GB), el modelo puede ejecutarse en GPUs de consumo como una RTX 3060 de 12 GB o incluso en CPU con llama.cpp, lo que lo hace adecuado para prototipos y demos sin infraestructura cloud.
- Autocompletado y continuación de texto en herramientas de escritura: el `generation_config.json` incluye penalizaciones de repetición y restricciones de n-gramas que reducen bucles y cortes prematuros, útil para asistentes de redacción en local.
- Generación de texto por lotes de alto throughput: al ser un modelo denso de 1.5B con arquitectura GPT-2, ofrece baja latencia por token y puede servirse con vLLM o TGI para tareas de generación masiva donde la calidad de un modelo de 70B no es requisito.
- Fine-tuning específico de dominio: la licencia Apache 2.0 y el tamaño reducido permiten reentrenar el modelo sobre corpus propios (por ejemplo, documentación técnica o atención al cliente) en una sola GPU, algo inviable con modelos de mayor escala.
- Investigación en destilación cross-architecture: el modelo sirve como caso de estudio reproducible de alineamiento de estados latentes entre arquitecturas densas y MoE, útil para grupos que investigan técnicas de compresión de conocimiento.
- Generación de datos sintéticos a pequeña escala: puede usarse para producir texto de relleno o aumentación de datasets en pipelines de bajo coste, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: ~3.1 GB para los pesos, más overhead de activaciones y KV cache; en la práctica, 4-6 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: ~1.6 GB; en 4 bits: ~0.8-1 GB.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 cómodo (RTX 3060 Ti, RTX 4060, RTX 3070, A10). Para cuantización de 4-8 bits cabe en GPUs de 4-6 GB (GTX 1650, RTX 3050) e incluso en CPU.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más; en cuantización 4-bit puede ejecutarse en hardware aún más modesto.
- Opciones de despliegue: `transformers` (pipeline nativo), vLLM, TGI, llama.cpp/Ollama (requiere conversión a GGUF), y cualquier runtime compatible con safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones por parte del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Aura-2-Lightning | 1.5B | No disponible (base GPT-2 XL: 1024) | Apache 2.0 | Destilado de un MoE de 20B; sin benchmarks publicados |
| GPT-2 XL (base) | 1.5B | 1024 | MIT | Modelo original de 2019; referencia directa del estudiante |
| Qwen2.5-1.5B | 1.5B | 32.768 | Apache 2.0 | Modelo moderno con contexto largo y multilingüismo documentado; benchmarks públicos |
| SmolLM2-1.7B | 1.7B | 8.192 | Apache 2.0 | Alternativa reciente de tamaño similar con benchmarks publicados |

La comparación con Qwen2.5-1.5B y SmolLM2-1.7B es relevante por tamaño, pero no se dispone de datos de rendimiento de Aura-2-Lightning que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No hay benchmarks publicados: las capacidades de razonamiento declaradas ("reasoning density") no están verificadas de forma independiente.
- La base es GPT-2 XL (2019), con tokenizador y sesgos propios de su corpus de entrenamiento; es probable un sesgo hacia el inglés y hacia contenidos de la web de esa época.
- Riesgo de alucinación elevado en un modelo de 1.5B, especialmente en tareas factuales o de razonamiento complejo; requiere validación humana en producción.
- La ventana de contexto probable es de 1024 tokens (heredada de GPT-2 XL); no se documenta extensión, lo que limita conversaciones multi-turno largas y documentos extensos.
- El multilingüismo no está confirmado; el rendimiento en castellano es incierto y probablemente inferior al de modelos entrenados explícitamente en múltiples idiomas.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el dataset de destilación, lo que puede plantear dudas de compliance en entornos regulados.
- El proceso de destilación desde `gpt-oss-20b` no está documentado con detalle reproducible (tokens, dataset, hiperparámetros), lo que dificulta auditar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/waveforce-ai/Aura-2-Lightning
- Modelo base (estudiante): https://huggingface.co/openai-community/gpt2-xl
- Modelo profesor: https://huggingface.co/openai/gpt-oss-20b
- Formulario de feedback del autor: https://arthwarrior3201.github.io/Aura-2-Lightning-Feedback/
