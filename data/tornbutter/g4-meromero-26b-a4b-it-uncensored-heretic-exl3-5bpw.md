# TornButter/G4-MeroMero-26B-A4B-it-uncensored-heretic-exl3-5bpw

## Resumen

G4-MeroMero-26B-A4B-it-uncensored-heretic-exl3-5bpw es una cuantización EXL3 de 5 bits por peso de la versión "decensored" del modelo G4-MeroMero-26B-A4B, un modelo de lenguaje de tipo Mixture of Experts (MoE) construido sobre la arquitectura Gemma 4. El autor del artefacto es TornButter, que publica una conversión del modelo abliterado de llmfan46, a su vez derivado del modelo base de zerofata. La model card declara un total de 9.871.722.958 parámetros reales en los safetensors, aunque el nombre comercial hace referencia a "26B" y a "A4B" (aproximadamente 4 mil millones de parámetros activos).

El modelo resuelve un problema muy concreto: ofrecer una variante sin restricciones de contenido (uncensored/abliterated) del modelo original, manteniendo al mismo tiempo la calidad del modelo base. Según la model card, la abliteración reduce los rechazos del 99/100 al 12/100 en un conjunto de 100 prompts, con una divergencia KL de 0,0152 respecto al original. El resultado en MMLU cae ligeramente, del 82,01 % al 81,16 %.

Es relevante ahora porque combina tres tendencias del ecosistema open source: modelos MoE con activación dispersa, técnicas de abliteración automatizadas (Heretic con Arbitrary-Rank Ablation) y cuantizaciones EXL3 de 5 bits orientadas a inferencia local de alta eficiencia. La licencia Apache 2.0 facilita su uso comercial, aunque el contenido sin filtros exige controles adicionales en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Gemma 4 |
| Parametros totales | 9.871.722.958 (dato real de safetensors); el nombre comercial indica "26B" |
| Parametros activos | Aproximadamente 4B (según el sufijo "A4B"; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 5.0 bpw (bits por peso), con `-hq` y `-hb 8`; repo de 19,8 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, requiere ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base G4-MeroMero-26B-A4B es un transformer de tipo Mixture of Experts de la familia Gemma 4, con aproximadamente 4 mil millones de parámetros activos por token según la nomenclatura "A4B". El artefacto aquí descrito no es un modelo entrenado desde cero, sino el resultado de una cadena de transformaciones: primero una abliteración sobre el modelo base de zerofata, después una cuantización EXL3 de 5 bits.

La abliteración se realizó con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA), con ablación dirigida al componente `attn.o_proj` entre las capas 15 y 26. Los parámetros declarados son: `preserve_good_behavior_weight` 0,3274, `steer_bad_behavior_weight` 0,0005, `overcorrect_relative_weight` 0,6647 y `neighbor_count` 15. La cuantización se hizo con exllamav3 v1.6.7 con `-b 5.0 -hq -hb 8 -d 0,1 -mae 0.01`. No se detallan en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO) del modelo base zerofata.

## Capacidades

- Generación de texto y razonamiento general, con un rendimiento en MMLU del 81,16 % tras la abliteración (82,01 % en el original).
- Conocimiento enciclopédico y académico amplio, con puntuaciones altas en materias como biología de instituto (95,39 %), psicología de instituto (95,19 %) o marketing (97,25 % en el original).
- Generación de contenido sin filtros de rechazo: la model card reporta 12 rechazos de 100 frente a 99 de 100 del original.
- Capacidades de roleplay y personajes, según los datasets declarados (`Roleplay-Anime-Characters`, `GLM5-Characters`).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio o modo thinking: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva sin restricciones: el modelo está afinado sobre datasets de personajes de anime y roleplay, y la abliteración elimina los rechazos que interrumpen conversaciones de ficción. Adecuado para plataformas de entretenimiento conversacional con moderación externa.
- Generación de ficción adulta y contenido creativo sensible: al reducir los rechazos a un 12 %, permite escribir escenas violentas o sexuales sin que el modelo derive la conversación, algo útil en herramientas de escritura creativa para autores.
- Atención al cliente con guion libre: la ventana de contexto no está documentada, pero el modelo puede gestionar conversaciones multi-turno; conviene validar empíricamente el límite real antes de desplegarlo.
- Asistente de investigación en humanidades: su MMLU alto en filosofía (84,28 %), historia y religiones comparadas lo hace útil para explorar temas sensibles sin la censura del modelo original.
- Inferencia local en GPU de consumo: la cuantización EXL3 de 5 bpw y los ~9,9 mil millones de parámetros totales permiten ejecutarlo en GPUs con 24 GB de VRAM mediante ExLlamaV3, con throughput alto gracias a la activación MoE dispersa.
- Evaluación de técnicas de abliteración: sirve como caso de estudio reproducible para investigadores que quieran medir el impacto de Heretic/ARA en la calidad (KL 0,0152) y en la tasa de rechazos.
- Generación de datos sintéticos para fine-tuning: su capacidad de producir contenido sin filtros lo hace útil para crear datasets de entrenamiento en dominios donde los modelos censurados se niegan a responder.

## Benchmarks y rendimiento

La model card proporciona resultados de MMLU (7.021 preguntas) comparando el modelo original con la versión abliterada. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Original (G4-MeroMero-26B-A4B) | Heretic (este modelo) |
|---|---|---|
| MMLU (accuracy global) | 82,01 % (5.758/7.021) | 81,16 % (5.698/7.021) |
| Fallos de parseo | 9 | 6 |
| Rechazos (100 prompts) | 99/100 | 12/100 |
| Divergencia KL vs original | 0 (por definición) | 0,0152 |

Materias destacadas (Heretic vs original): biología de instituto 95,39 % vs 96,05 %; psicología de instituto 95,19 % vs 95,56 %; marketing 97,25 % (sin variación reportada); derecho profesional 65,10 % vs 68,41 %; matemáticas de instituto 48,03 % (original, sin dato Heretic en el extracto).

## Requisitos de hardware

- VRAM estimada: el repo pesa 19,8 GB en EXL3 5 bpw, por lo que se necesitan aproximadamente 20-22 GB de VRAM para cargar los pesos, más overhead de contexto KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. Cabe en GPUs de consumo de 24 GB.
- GPUs de consumo compatibles: sí, en RTX 4090/3090 con margen ajustado; en GPUs de 16 GB no cabe sin cuantización adicional.
- Opciones de despliegue: ExLlamaV3 (obligatorio para el formato EXL3); no es compatible directamente con vLLM, llama.cpp u Ollama sin reconversión a otro formato.
- Latencia y throughput: no disponibles en la información proporcionada; la arquitectura MoE con ~4B activos debería ofrecer throughput superior a un modelo denso de tamaño equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (G4-MeroMero-26B-A4B-heretic-exl3-5bpw) | ~9,9B totales, ~4B activos | no disponible | 81,16 % | Apache 2.0 | EXL3 safetensors |
| zerofata/G4-MeroMero-26B-A4B (original) | ~9,9B totales, ~4B activos | no disponible | 82,01 % | Apache 2.0 | safetensors |
| llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic (bf16) | ~9,9B totales, ~4B activos | no disponible | no disponible | Apache 2.0 | safetensors bf16 |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada más allá de los ya citados.

## Limitaciones y advertencias

- Modelo abliterado: la eliminación de la capa de rechazo implica que puede generar contenido dañino, ilegal o explícito sin filtros. Requiere moderación externa obligatoria en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; el MMLU mide conocimiento, no veracidad.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe adecuado sin pruebas propias.
- Longitud de contexto no documentada: hay que validarla empíricamente antes de usarla en aplicaciones con contexto largo.
- Dependencia de ExLlamaV3: el formato EXL3 no es portable a otros motores de inferencia sin reconversión.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el contenido generado es responsabilidad del desplegador.
- Repositorio con 0 descargas y 1 like: modelo muy reciente y sin validación comunitaria; conviene tratarlo como experimental.
- La model card incluye enlaces de financiación (Patreon, Ko-fi) que no afectan al uso del modelo pero indican que el mantenimiento depende de un único autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TornButter/G4-MeroMero-26B-A4B-it-uncensored-heretic-exl3-5bpw
- Modelo base: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Modelo abliterado en bf16 (origen de esta cuantización): https://huggingface.co/llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- PR de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Patreon del autor: https://patreon.com/LLMfan46
- Ko-fi del autor: https://ko-fi.com/llmfan46
