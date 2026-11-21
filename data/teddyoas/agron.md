# teddyoas/Agron

## Resumen

Agron es un modelo de lenguaje de tipo LLaMA con aproximadamente 50,3 millones de parámetros, desarrollado por el usuario teddyoas. Se trata de un modelo pequeño sometido a un proceso de preentrenamiento continuado de dominio (domain continued pretraining) sobre código fuente y contenido de ciberseguridad, partiendo de un checkpoint previo del mismo autor. El objetivo declarado es especializar un modelo base minúsculo en lenguajes de programación y seguridad informática sin perder por completo capacidades generales de lenguaje.

El modelo se ha entrenado durante una época completa sobre un corpus mixto de unos 118,7 millones de tokens, combinando código de GitHub filtrado por extensiones habituales (.py, .js, .ts, .java, .c, .cpp, .go, .rs, .cs, .sh, .sql), un dataset de instrucciones de ciberseguridad y una porción de WikiText como replay para mitigar el olvido catastrófico. El entrenamiento se realizó en una única GPU Tesla T4 en fp16 durante aproximadamente 61 minutos, con una longitud de secuencia de 512 tokens.

Su relevancia es acotada pero clara: demuestra un flujo completo de especialización de dominio sobre hardware consumer de gama baja, con métricas de evaluación antes/después publicadas y licencia MIT. No es un modelo para producción generalista, sino una pieza experimental útil para estudiar dinámicas de continued pretraining en modelos de muy pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo LLaMA (causal, decoder-only) |
| Parametros totales | 50.340.352 (~50,3M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Agron sigue una arquitectura transformer causal de estilo LLaMA, con 50,3 millones de parámetros totales, según los pesos publicados en safetensors. El modelo parte de un checkpoint previo del mismo autor y se ha sometido a una época completa de preentrenamiento continuado de dominio. Los detalles de configuración (número de capas, dimensión oculta, cabezas de atención) no se especifican en la información disponible.

El entrenamiento se realizó con 7.246 pasos, batch efectivo de 32 (16 x 2 de acumulación de gradiente), secuencia de 512 tokens, learning rate 3e-4 con scheduler coseno y warmup de 100 pasos, optimizador AdamW fusionado, en una Tesla T4 en fp16, con una duración aproximada de 61 minutos y una pérdida media de entrenamiento de 1,319. El corpus se mezcló en caliente desde streams planos de tokens: código mayoritario (codeparrot/github-code filtrado, ~150M caracteres), ciberseguridad (Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, ~120M caracteres) y replay de WikiText-2 (~15M caracteres). No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional.

## Capacidades

- Generación de texto causal en inglés, con especialización en dominios de código y ciberseguridad.
- Generación y continuación de código en lenguajes comunes (Python, JavaScript, TypeScript, Java, C, C++, Go, Rust, C#, Shell, SQL) gracias al corpus de preentrenamiento.
- Producción de texto relacionado con seguridad informática, incluyendo formatos de instrucción system/user/assistant heredados del dataset de ciberseguridad.
- Capacidades generales de lenguaje residuales, preservadas parcialmente mediante el replay de WikiText.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Estudio de continued pretraining: el modelo sirve como banco de pruebas reproducible para medir olvido catastrófico y especialización de dominio en modelos de ~50M de parámetros, con métricas antes/después publicadas.
- Autocompletado de código en entornos de desarrollo locales: por su tamaño mínimo, puede ejecutarse en CPU o GPU de gama baja para sugerencias de continuación en editores, aunque con calidad limitada frente a modelos mayores.
- Generación de fragmentos de scripts en lenguajes comunes: útil para prototipado rápido de snippets de shell, SQL o Python en herramientas internas de baja criticidad.
- Experimentación educativa sobre ciberseguridad: generación de texto con formato de instrucción en el dominio de seguridad para estudiar cómo un modelo pequeño absorbe vocabulario y estructuras del dominio.
- Base para fine-tuning posterior: al ser un modelo de 50M con licencia MIT, es adecuado como punto de partida barato para tareas específicas de código o seguridad en investigación.
- Evaluación de pipelines de entrenamiento: sirve para validar scripts de preparación de corpus, mezcla de datasets y evaluación held-out en flujos de ML de bajo coste.
- Despliegue en entornos con recursos extremadamente limitados: inferencia en CPU o GPUs de muy baja VRAM para demos y pruebas de concepto.

## Benchmarks y rendimiento

El autor publica métricas de evaluación held-out antes y después del preentrenamiento de dominio (pérdida y perplejidad), no benchmarks estándar como MMLU o HumanEval.

| Fuente | Antes (loss/PPL) | Después (loss/PPL) | Delta |
|---|---|---|---|
| Código | 1,453 / 4,28 | 1,245 / 3,47 | -0,208 |
| Ciberseguridad | 1,358 / 3,89 | 1,064 / 2,90 | -0,294 |
| Replay (WikiText) | 5,626 / 277,6 | 5,024 / 152,0 | -0,602 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para los pesos (~100 MB en fp16, ~200 MB en fp32); el repo ocupa 4,5 GB por artefactos adicionales, no por los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el propio entrenamiento se realizó en una Tesla T4.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 4060 y superiores; también es viable en CPU.
- Opciones de despliegue: transformers (AutoModelForCausalLM) según la model card; no se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Agron | ~50,3M | 512 | MIT | Código + ciberseguridad | Hugging Face |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Generalista | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Generalista | Hugging Face |
| Qwen2.5-Coder-0.5B | 0,5B | 32.768 | Apache 2.0 | Código | Hugging Face |

La comparación es orientativa: Agron es entre 3 y 20 veces más pequeño que las alternativas listadas y no se han publicado benchmarks estándar que permitan una comparación cuantitativa de rendimiento. Su ventaja principal es la licencia MIT y el coste de inferencia mínimo; su desventaja es la escala y la ausencia de evaluación en tareas estándar.

## Limitaciones y advertencias

- Tamaño muy reducido (~50M de parámetros): la calidad de generación será baja en comparación con modelos de cientos de millones o miles de millones de parámetros; no es apto para producción de alta exigencia.
- Contexto de solo 512 tokens: insuficiente para conversaciones multi-turno largas, análisis de repositorios completos o documentos extensos.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Riesgo elevado de alucinación y de generar código incorrecto o inseguro; no debe usarse sin revisión en entornos críticos.
- Sesgos heredados del corpus: código de GitHub y un dataset de instrucciones de ciberseguridad pueden introducir sesgos de estilo, licencias de código y patrones de seguridad no deseados.
- Entrenado sobre un dataset de instrucciones de ciberseguridad: existe riesgo de que reproduzca contenido sensible o potencialmente dañino en ese dominio; debe filtrarse en despliegues.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni evaluación de seguridad; la responsabilidad recae en el integrador.
- No se publican pesos cuantizados ni integración con runtimes de inferencia populares, lo que limita el despliegue fuera de transformers.
- Fecha de creación del repo (2026) y escasa tracción (776 descargas, 1 like): modelo experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teddyoas/Agron
- Repositorio GitHub (script de preparación de corpus): https://github.com/Njap-png/Agron/blob/main/prepare_domain_corpus.py
- Dataset de código: https://huggingface.co/datasets/codeparrot/github-code
- Dataset de ciberseguridad: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset de replay: https://huggingface.co/datasets/Salesforce/wikitext-2-raw-v1
