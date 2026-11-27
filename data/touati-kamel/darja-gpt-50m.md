# touati-kamel/darja-gpt-50m

## Resumen

Darja-GPT-50M es un modelo de lenguaje causal (autoregresivo) de 54,8 millones de parámetros entrenado desde cero exclusivamente en darja argelina (الدارجة الجزائرية / Dziri), el dialecto árabe de Argelia. Lo desarrolla el usuario touati-kamel y se publica bajo licencia Apache 2.0. A diferencia de aproximaciones anteriores que readaptaban codificadores enmascarados bidireccionales como DziriBERT con decodificadores, este modelo se construye nativamente como un decodificador autorregresivo moderno, con adaptadores LoRA por dominio y soporte de Classifier-Free Guidance (CFG) en inferencia.

El problema que aborda es el colapso de registro y la fuga entre dominios típicos del modelado de dialectos con pocos recursos: en iteraciones previas (v3 y v4) la modulación FiLM no lograba separar dominios, con variaciones de pesos de solo el 15-20 % respecto a la media y contaminación cruzada (recetas de cocina filtrándose en prompts de pódcast). La versión v5 sustituye FiLM por capas LoRA específicas de dominio (`DomainLoRALinear`) sobre `o_proj` y `down_proj`, alcanzando distancias de delta de pesos del 118-173 % de la media.

Es relevante ahora por dos motivos: incorpora un tokenizador BPE propio de 24.000 tokens entrenado para la morfología del darja, con 1,459 tokens/palabra y una reducción de fertilidad del 38,6 % frente a Qwen2.5/Qwen3 (2,378 tokens/palabra), y aplica CFG a un LM autorregresivo dialectal, algo que el autor presenta como el primer despliegue de esta técnica en generación dialectal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con adaptadores LoRA por dominio (`DomainLoRALinear`) y Classifier-Free Guidance |
| Parametros totales | 54.794.240 (54,8 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (bloques de chunking a nivel de documento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (ar), específicamente darja argelina; `multilingual: false` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only construido desde cero, no un ajuste de un modelo existente. La innovación central es la condicionalización por dominio mediante capas `DomainLoRALinear` insertadas en las proyecciones de salida de atención (`o_proj`) y de bajada del MLP (`down_proj`), con rango `r = 16` y `α = 16.0`. Cada uno de los seis dominios (culinario, deportes, técnico, pódcast, narrativo y coloquial) más el estado nulo (`<NULL>`, `d = 6`) mantiene actualizaciones de bajo rango independientes, lo que evita el compromiso de representación que sufría la modulación FiLM de las versiones v3 y v4.

El entrenamiento se realizó sobre el corpus `touati-kamel/algerian-darja-corpus`, con 11.151 documentos consolidados en seis dominios y troceados en bloques de 1.024 tokens. Se aplicó una regularización de doble dropout: un 20 % de dropout de etiqueta de dominio y un 10 % de dropout de dominio para CFG (los IDs de dominio se sustituyen por el estado incondicional `<NULL>` con probabilidad p = 0,10). En inferencia, los logits condicionales y nulos se extrapolan según `z_guided = z_NULL + s · (z_cond - z_NULL)`, con escala de guiado `s ∈ [1,5, 2,5]`, lo que suprime las fugas fuera de dominio y afina la terminología específica sin degradar la fluidez gramatical. El tokenizador es un BPE sin pérdidas de 24.000 tokens entrenado desde cero sobre transcripciones conversacionales de darja.

## Capacidades

- Generación de texto autorregresiva en darja argelina con control explícito del registro o dominio (culinario, deportes, técnico, pódcast, narrativo, coloquial).
- Condicionamiento por dominio en tiempo de inferencia mediante IDs de dominio y escalado CFG ajustable.
- Supresión de fuga entre dominios: el guiado con `s` entre 1,5 y 2,5 elimina terminología fuera de dominio.
- Tokenización morfológicamente eficiente para darja (1,459 tokens/palabra), lo que reduce el coste por token generado frente a tokenizadores multilingües genéricos.
- Generación de texto conversacional de registro coloquial.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.

## Casos de uso

- Generación de diálogo coloquial argelino: el modelo produce respuestas en registro coloquial (dominio `colloquial`) adecuadas para prototipos de asistentes conversacionales dirigidos a hablantes de darja, donde los modelos multilingües genéricos derivan hacia árabe estándar.
- Contenido culinario localizado: con el dominio culinario activo y `s ≈ 2,0`, se generan recetas y descripciones de platos argelinos con terminología propia, evitando que el vocabulario de otros registros contamine la salida.
- Redacción de crónicas deportivas: el dominio de deportes permite generar textos sobre fútbol y competiciones locales en el registro y vocabulario habituales de la prensa deportiva argelina.
- Generación de guiones de pódcast: el dominio de pódcast está pensado para producir segmentos conversacionales de formato largo dentro de la ventana de 1.024 tokens, útil para borradores de episodios o resúmenes de entrevistas.
- Aumento de datos para darja: al ser un generador nativo del dialecto con tokenizador propio, sirve para sintetizar corpus de entrenamiento o evaluación en dominios con pocos datos etiquetados, controlando el registro mediante el ID de dominio.
- Investigación sobre condicionalización en modelos de bajos recursos: el modelo es una referencia reproducible (Apache 2.0, 54,8 M de parámetros) para estudiar adaptadores LoRA por dominio y CFG en LM autorregresivos, con un coste de cómputo bajo para experimentación académica.
- Prototipado en hardware modesto: con 54,8 M de parámetros, el modelo se puede ejecutar en CPU o en GPU de consumo para pruebas de concepto de generación dialectal antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La información disponible incluye resultados del tokenizador, no del modelo en tareas de generación estándar (MMLU, HumanEval, GSM8K no se reportan).

| Benchmark | Darja-GPT-50M (tokenizador) | Referencia |
|---|---|---|
| Fertilidad (tokens/palabra), corpus completo (11.151 documentos, 5-fold out-of-fold) | 1,459 | 2,378 en Qwen2.5/Qwen3 (reducción del 38,6 %, IC 95 % [38,4 %, 38,9 %]) |
| Fertilidad en 335 documentos estrictamente reservados | 1,474 | No disponible para el resto |
| Comparación con decodificadores generativos abiertos | Mejor que todos (+12,8 % frente a Jais, +13,1 % frente a ALLaM) | Jais, ALLaM |
| Comparación con codificadores regionales | Empata con MARBERT (1,464) usando 2× a 4,2× menos parámetros de vocabulario | DziriBERT (1,448), DarijaBERT (1,450) |
| Distancia de delta de pesos entre dominios (v5 con LoRA) | 118 %-173 % de la media | FiLM en v3/v4: 15 %-20 % |

No se han publicado resultados de benchmarks de generación (perplejidad, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 54,8 M de parámetros; en fp32 ocupa aproximadamente 220 MB de pesos, y en fp16 unos 110 MB, a lo que hay que sumar la caché KV para 1.024 tokens de contexto, marginal en este tamaño. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente (GTX 1650, RTX 3060, RTX 4090); también es viable en CPU para inferencia interactiva.
- Cabe en GPU de consumo: sí, en todas las GPU modernas de consumo, e incluso en iGPU y CPU.
- Opciones de despliegue: transformers (librería declarada, con `endpoints_compatible` en los tags); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darja-GPT-50M | 54,8 M | 1.024 tokens | Decoder causal nativo en darja, LoRA por dominio y CFG | Apache 2.0 | Hugging Face |
| DziriBERT | No disponible en la información | No disponible | Codificador enmascarado bidireccional para darja | No disponible | Hugging Face |
| DarijaBERT | No disponible en la información | No disponible | Codificador enmascarado para darja marroquí | No disponible | Hugging Face |
| MARBERT | No disponible en la información | No disponible | Codificador regional árabe | No disponible | Hugging Face |

La comparación relevante en la información disponible es a nivel de tokenizador: Darja-GPT-50M logra 1,459 tokens/palabra frente a 2,378 de Qwen2.5/Qwen3, 1,448 de DziriBERT, 1,450 de DarijaBERT y 1,464 de MARBERT, con un vocabulario de 24.000 tokens. No se dispone de comparaciones de rendimiento generativo con estos modelos.

## Limitaciones y advertencias

- Modelo de 54,8 M de parámetros: la capacidad de razonamiento, conocimiento factual y coherencia en textos largos es muy limitada en comparación con modelos de miles de millones de parámetros.
- Ventana de contexto de 1.024 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o tareas de resumen sobre corpus amplios.
- Monolingüe por diseño (`multilingual: false`): solo cubre darja argelina; no se debe esperar calidad en árabe estándar moderno ni en otros dialectos.
- Riesgo de alucinación y de invención de términos: al entrenarse en un corpus de 11.151 documentos, la cobertura léxica y factual es acotada, y el guiado CFG puede agudizar terminología específica a costa de exactitud.
- Dependencia del ID de dominio: el rendimiento depende de seleccionar el dominio correcto y de ajustar la escala `s`; un `s` mal calibrado puede producir salidas atípicas o repetitivas.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el corpus conversacional puede arrastrar sesgos de género, regionales o sociales presentes en las transcripciones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el contenido generado ni sobre la procedencia de los datos de entrenamiento.
- Corpus pequeño y de un único autor: la generalización fuera del dominio de los datos (registros formales, prensa escrita, textos técnicos especializados) no está validada.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/touati-kamel/darja-gpt-50m
- Dataset de entrenamiento: https://huggingface.co/datasets/touati-kamel/algerian-darja-corpus
- Tokenizador: https://huggingface.co/touati-kamel/darja-tokenizer-50m
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- PyTorch: https://pytorch.org/
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
