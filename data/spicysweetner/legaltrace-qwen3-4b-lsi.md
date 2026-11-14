# spicysweetner/LegalTrace-Qwen3-4B-LSI

## Resumen

LegalTrace-Qwen3-4B-LSI es un modelo de lenguaje causal especializado en la identificación de estatutos legales (Legal Statute Identification, LSI) dentro del marco del Código Penal de la India (Indian Penal Code, IPC). Lo desarrolla el autor independiente spicysweetner mediante fine-tuning del modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros (4B) entrenado originalmente por Alibaba Qwen. El modelo resuelve un problema muy concreto: dado un relato de hechos de un caso penal, mapearlo directamente a las secciones del IPC aplicables entre un conjunto cerrado de 100 categorías.

La relevancia del modelo es doble. Por un lado, demuestra que un fine-tuning con QLoRA sobre un corpus jurídico de 8.000 casos (ILTUR) puede mejorar sustancialmente el rendimiento de un LLM generalista en una tarea de clasificación multietiqueta estructurada: pasa de un Macro-F1 de 0,0569 en zero-shot a 0,2443, y reduce la tasa de salida inválida del 24,2% al 0,5%. Por otro, es un ejemplo de adaptación de dominio con licencia Apache 2.0 y pesos en bfloat16 listos para producción, algo poco habitual en modelos jurídicos especializados.

El modelo está pensado para inglés, opera sobre un catálogo fijo de secciones del IPC y se distribuye como pesos merged en safetensors (8,1 GB), con una variante GGUF publicada en un repositorio complementario para despliegue en entornos de borde. No es un asistente jurídico general: es un clasificador generativo de secciones penales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), base Qwen3-4B-Instruct-2507 |
| Parámetros totales | 4.022.468.096 (4B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantización | Pesos publicados en bfloat16; variante GGUF disponible en repositorio complementario (cuantizaciones concretas no especificadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (repo complementario) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer causal decoder-only denso de 4B parámetros. Sobre esa base se aplicó un fine-tuning con QLoRA (cuantización de bajo rango) utilizando el corpus ILTUR de casos penales indios, con un conjunto de entrenamiento de 8.000 casos. Los pesos resultantes se fusionaron (merged) y se publicaron en bfloat16 como modelo autónomo, sin adaptadores separados.

La innovación principal no está en la arquitectura sino en la formulación de la tarea: el modelo se entrena para emitir una lista de secciones del IPC separadas por comas y en orden ascendente, restringida a un vocabulario cerrado de 100 secciones válidas. Esa restricción, combinada con decodificación determinista (temperature 0,0, do_sample False), reduce drásticamente las alucinaciones de formato: la tasa de salida inválida cae del 24,2% en el modelo base al 0,5% en el fine-tune. No se documentan en la información disponible detalles sobre composición exacta del dataset, número de tokens de entrenamiento, ni si hubo RLHF o DPO adicionales.

## Capacidades

- Identificación de secciones del IPC: mapea relatos de hechos (FIR, charge sheet, narrativas judiciales) a una o varias de las 100 secciones penales del catálogo cerrado.
- Clasificación multietiqueta: puede emitir múltiples secciones por caso, ordenadas ascendentemente.
- Generación de texto instructivo: hereda la capacidad conversacional del base Qwen3-4B-Instruct-2507.
- Salida estructurada y determinista: con temperature 0 y decodificación greedy produce listas de secciones estables y parseables.
- Razonamiento jurídico acotado: interpreta hechos penales y los relaciona con tipologías delictivas del IPC.
- Soporte de plantilla de chat: usa el chat template de Qwen3 con roles system/user/assistant.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Triaje de denuncias y FIR: dado el relato de una denuncia, el modelo propone las secciones del IPC candidatas en 0,45 s por caso, lo que permite priorizar expedientes en un juzgado o comisaría antes de la revisión humana.
- Asistencia a la redacción de cargos: un sistema de gestión documental puede sugerir secciones penales al fiscal o al abogado a partir de la narrativa del caso, con el catálogo cerrado de 100 secciones como garantía de validez formal.
- Indexación y búsqueda jurídica: etiquetar automáticamente sentencias y expedientes con secciones del IPC para construir índices temáticos y facilitar la recuperación de precedentes.
- Análisis masivo de jurisprudencia: procesar corpus de sentencias (como el propio ILTUR) para estudiar la distribución de secciones imputadas y detectar patrones por tipo de delito o tribunal.
- Validación de borradores legales: comprobar que una acusación redactada manualmente cita secciones coherentes con los hechos descritos, señalando posibles omisiones o secciones infundadas.
- Despliegue en entornos con recursos limitados: gracias a sus 4B parámetros y a la variante GGUF, puede ejecutarse en portátiles y estaciones de trabajo sin GPU de datacenter, algo relevante para despachos pequeños o juzgados con infraestructura modesta.
- Investigación en NLP jurídico: servir como baseline reproducible de adaptación de dominio con QLoRA para experimentos de LSI en otros ordenamientos.

## Benchmarks y rendimiento

Evaluación sobre 1.000 sentencias indias retenidas sin fuga de datos (test_subset), según la model card:

| Modelo / enfoque | Conjunto de entrenamiento | Macro-F1 | Micro-F1 | Example-F1 | Tasa de formato inválido | Latencia |
|---|---|---|---|---|---|---|
| Qwen3-4B base zero-shot | 0 | 0,0569 | 0,1028 | 0,0877 | 24,2% | 2,15 s/caso |
| Baseline trivial top-4 por reglas | 8.000 | 0,0145 | 0,2112 | 0,2029 | 0,0% | <0,01 s/caso |
| TF-IDF + regresión logística (OvR) | 8.000 | 0,1716 | 0,3846 | 0,3492 | 0,0% | <0,01 s/caso |
| LegalTrace-Qwen3-4B-LSI | 8.000 | 0,2443 | 0,3789 | 0,3843 | 0,5% | 0,45 s/caso |

El fine-tune mejora el Macro-F1 un 329% respecto al base zero-shot y un 42% respecto al baseline TF-IDF, con una tasa de salida inválida del 0,5% frente al 24,2% del base. El Micro-F1 (0,3789) queda ligeramente por debajo del TF-IDF (0,3846), lo que indica que el modelo gana en cobertura de clases raras (Macro-F1) pero no en aciertos globales.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB para inferencia cómoda.
- VRAM estimada en cuantización 4-bit (GGUF Q4): en torno a 2,5-3 GB de pesos, apto para GPUs de 6-8 GB.
- GPUs recomendadas: A100 o H100 para throughput alto en lote; RTX 4090 o RTX 3090 para inferencia individual en bfloat16; RTX 3060/4060 Ti (12-16 GB) o superiores para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB y superiores en bfloat16, y en GPUs de 6-8 GB con GGUF cuantizado.
- Opciones de despliegue: Transformers (código de ejemplo incluido en la model card), Ollama mediante `ollama run hf.co/spicysweetner/LegalTrace-Qwen3-4B-LSI-GGUF`, llama.cpp con el GGUF, y presumiblemente vLLM o TGI al ser un modelo Qwen3 estándar (no verificado en la información disponible).
- Latencia: 0,45 s por caso reportada por el autor en la evaluación de benchmarks; el throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 (LSI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LegalTrace-Qwen3-4B-LSI | 4B | No disponible | 0,2443 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3-4B-Instruct-2507 (base) | 4B | No disponible | 0,0569 | Apache 2.0 | Hugging Face |
| TF-IDF + regresión logística (OvR) | No aplica (no neuronal) | No aplica | 0,1716 | No aplica | Implementación propia |
| Baseline trivial top-4 por reglas | No aplica | No aplica | 0,0145 | No aplica | Implementación propia |

No se dispone en la información proporcionada de comparación con otros LLM jurídicos especializados en IPC (por ejemplo, variantes fine-tuned de Llama o Mistral sobre corpus indios), por lo que la comparativa se limita al modelo base y a los baselines no neuronales evaluados por el autor.

## Limitaciones y advertencias

- Dominio muy restringido: solo cubre 100 secciones del IPC indio; no es un asistente jurídico general ni conoce otros ordenamientos.
- Idioma: únicamente inglés; no se garantiza comportamiento en hindi u otras lenguas oficiales de la India.
- Sesgos del corpus: entrenado sobre el corpus ILTUR, que refleja la distribución de casos, tribunales y prácticas de acusación de ese dataset; puede infrarepresentar secciones poco frecuentes.
- Riesgo de alucinación de formato: aunque la tasa de salida inválida es del 0,5%, no es cero; en producción conviene validar la salida contra el catálogo cerrado de secciones.
- Riesgo de alucinación semántica: el modelo puede asignar secciones plausibles pero jurídicamente incorrectas; el Macro-F1 de 0,2443 implica un margen de error elevado para uso decisorio.
- No apto como asesoramiento legal: cualquier uso en contextos reales debe pasar por revisión de un profesional del derecho.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre exactitud jurídica ni sobre el cumplimiento normativo en jurisdicciones distintas de la india.
- Sin datos publicados sobre longitud de contexto efectiva, comportamiento en conversaciones multi-turno largas ni robustez ante entradas adversariales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spicysweetner/LegalTrace-Qwen3-4B-LSI
- Repositorio GGUF complementario: https://huggingface.co/spicysweetner/LegalTrace-Qwen3-4B-LSI-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
