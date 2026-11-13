# ToetsChecker-Research/boterham

## Resumen

Boterham 0.5B es un modelo de lenguaje en neerlandés de aproximadamente 488 millones de parámetros, desarrollado por ToetsChecker-Research y entrenado desde cero exclusivamente con datos abiertos y de dominio público. Su propósito es muy concreto: leer un texto proporcionado por el usuario, responder preguntas sobre ese texto y rechazar explícitamente ("Ik weet dit niet.") cuando la respuesta no aparece en el material. No es un modelo de conocimiento general ni un asistente conversacional abierto.

La arquitectura es un transformer decoder-only con RMSNorm, GQA, RoPE, SwiGLU y QK-norm, de 26 capas y 1.280 de dimensión oculta, con una ventana de contexto de 2.048 tokens y un vocabulario BPE de 32.002 tokens entrenado sobre el propio corpus. El preentrenamiento consumió 8.000 millones de tokens en una única NVIDIA H100 y el ajuste por instrucciones se realizó en cuatro rondas sobre GPUs L4, con un coste total de cómputo de 121,60 euros en Scaleway.

Su relevancia es doble. Por un lado, demuestra que es posible construir un modelo funcional en una lengua no dominante con un presupuesto mínimo. Por otro, su comparación directa con GPT-NL (26B parámetros, unas cincuenta veces mayor) en tareas EuroEval muestra que un modelo pequeño y muy especializado puede superar a uno grande en tareas acotadas como gramática, lectura comprensiva y reconocimiento de entidades, aunque queda muy por detrás en sentimiento, resumen, sentido común y conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RMSNorm, GQA, RoPE, SwiGLU y QK-norm |
| Parametros totales | 488.316.928 (447,4M excluyendo embeddings de tokens atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (la model card solo documenta carga en float32) |
| Idiomas soportados | Neerlandés (principal), inglés (limitado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportado con la implementación `Qwen3ForCausalLM` de transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 26 capas con dimensión oculta de 1.280, 20 cabezas de consulta y 4 cabezas clave/valor (GQA con ratio 5:1). Incorpora RMSNorm, RoPE para posiciones, SwiGLU en las capas feed-forward y QK-norm. El vocabulario es un BPE a nivel de byte de 32.002 tokens entrenado sobre el propio corpus, no heredado de otro modelo. Los embeddings de tokens están atados a la capa de salida.

El preentrenamiento consumió 8.000 millones de tokens sobre una sola NVIDIA H100, usando únicamente datos de dominio público y licencias abiertas del dataset `ToetsChecker-Research/beleg`. El ajuste por instrucciones se realizó en cuatro rondas sobre entre una y cuatro NVIDIA L4, cada ronda dirigida a corregir las carencias de la anterior: la ronda 3 añadió juicios gramaticales y la ronda 4 incorporó reconocimiento de nombres en formato CoNLL-nl y análisis de sentimiento. El repositorio contiene la ronda 4 (noviembre de 2026); la ronda 1 de septiembre sigue accesible mediante el tag `ronde-1`. No se menciona uso de RLHF ni DPO. El export a Hugging Face reutiliza la implementación `Qwen3ForCausalLM` porque la arquitectura es idéntica, pero los pesos y el tokenizador se entrenaron desde cero y no derivan de Qwen.

## Capacidades

- Generación de texto en neerlandés con instrucciones fijas y literales.
- Respuesta a preguntas sobre un texto proporcionado en el prompt (question answering extractivo).
- Rechazo explícito con la cadena exacta "Ik weet dit niet." cuando la respuesta no está en el texto.
- Resumen de documentos, aunque de baja calidad: tiende a copiar la primera frase.
- Juicios gramaticales (tarea ScaLA-nl).
- Reconocimiento de entidades nombradas en formato CoNLL-nl.
- Análisis de sentimiento (DBRD), con rendimiento moderado.
- Comprensión lectora en formato SQuAD-nl.
- Soporte limitado de inglés.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni razonamiento multi-paso fiable.

## Casos de uso

- Extracción de respuestas sobre documentación administrativa: el modelo responde preguntas cerradas sobre un texto pegado en el prompt y rechaza cuando la respuesta no consta, lo que encaja en flujos de consulta sobre páginas de organismos públicos neerlandeses con validación posterior.
- Moderación de respuestas en asistentes de atención al cliente: se puede usar como capa de verificación que comprueba si una respuesta propuesta aparece literalmente en el texto fuente y la descarta en caso contrario.
- Anotación gramatical asistida: útil para preetiquetar juicios de aceptabilidad gramatical en neerlandés dentro de pipelines de anotación lingüística.
- Reconocimiento de entidades en textos neerlandeses: extracción de nombres de personas, organizaciones y lugares en formato CoNLL para tareas de indexación o enriquecimiento documental.
- Clasificación de sentimiento en reseñas: con las cautelas propias de su MCC de 40,15, sirve como señal preliminar en sistemas de triaje que luego revisa un humano.
- Resumen de primer nivel para triaje: aunque sus resúmenes son cortos y copian la frase inicial, pueden usarse como índice rápido de documentos antes de una revisión manual.
- Investigación y docencia sobre modelos pequeños en lenguas de bajos recursos: el modelo, su dataset y su coste de entrenamiento documentado (121,60 euros) sirven como caso de estudio reproducible.
- Evaluación comparativa de modelos neerlandeses: útil como referencia de línea base en pruebas EuroEval para calibrar modelos mayores.

## Benchmarks y rendimiento

Resultados EuroEval 18.0.0 (diez iteraciones por tarea, intervalo de confianza del 95 % sobre las iteraciones). WikiLingua-nl se midió con EuroEval 15.16.0 por conservar BERTScore.

| Tarea | Métrica | Boterham 0.5B r4 | GPT-NL IT | GPT-NL base |
|---|---|---:|---:|---:|
| ScaLA-nl (gramática) | MCC | **29,50** ± 3,00 | 1,18 | 19 |
| SQuAD-nl (lectura) | EM | **36,62** ± 0,97 | 34,37 | 51 |
| CoNLL-nl (nombres) | micro-F1 sin MISC | **49,46** ± 2,76 | 47,82 | ~36 |
| DBRD (sentimiento) | MCC | 40,15 ± 4,15 | **85,36** | ~90 |
| WikiLingua-nl (resúmenes) | BERTScore | 56,80 | **61,97** | 61 |
| HellaSwag-nl (sentido común) | MCC | 1,15 ± 0,75 | **3,71** | -2 |
| MMLU-nl (conocimiento) | MCC | -2,13 ± 0,86 | **2,28** | 2 |

En MMLU-nl y HellaSwag-nl ambos modelos están a nivel de azar (MCC 0 equivale a adivinar), por lo que las diferencias en esas dos tareas no son interpretables. En una prueba propia del autor con ocho preguntas sobre dos páginas de Rijksoverheid.nl, el modelo acertó dos de las seis preguntas respondibles, rechazó dos que podía haber contestado, dio dos respuestas erróneas y rechazó correctamente las dos cuya respuesta no estaba en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2 GB para los 488M parámetros, más overhead de activaciones y caché KV; la model card solo documenta carga en `torch.float32`.
- En cuantización de 8 bits cabría en torno a 0,5-1 GB; en 4 bits, por debajo de 0,5 GB, aunque el autor no publica variantes cuantizadas ni GGUF.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada para inferencia; el entrenamiento se hizo en H100 (preentrenamiento) y L4 (ajuste por instrucciones).
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (documentado), text-generation-inference (etiqueta del repo) y endpoints compatibles; no se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Boterham 0.5B | 488M | 2.048 | nl, en | Apache 2.0 | Hugging Face |
| GPT-NL | 26B | no disponible | nl | no disponible en la información | referencia del informe TNO GPTNL-DEL-4002 |
| Qwen3 (arquitectura compatible) | no disponible | no disponible | multilingüe | no disponible | Hugging Face |

La comparación relevante es con GPT-NL: Boterham lo supera en gramática (29,50 frente a 1,18 de MCC), lectura (36,62 frente a 34,37 de EM) y nombres (49,46 frente a 47,82 de micro-F1), y queda por detrás en sentimiento (40,15 frente a 85,36), resumen (56,80 frente a 61,97 de BERTScore), sentido común (1,15 frente a 3,71) y conocimiento (-2,13 frente a 2,28). No se dispone de datos de benchmarks de otros modelos neerlandeses pequeños en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo da respuestas plausibles pero incorrectas en entrada libre, incluso en sus tareas fuertes. Hay que verificar cada respuesta contra el texto.
- Los resúmenes son cortos y tienden a copiar la primera frase del documento.
- Los hechos sin texto de apoyo en el prompt, la conversación abierta, la escritura creativa, el código y cualquier contenido posterior a sus datos de entrenamiento son poco fiables.
- En MMLU-nl y HellaSwag-nl opera a nivel de azar: no tiene conocimiento factual ni sentido común aprovechables.
- El contexto está limitado a 2.048 tokens, insuficiente para documentos largos sin trocear.
- El prompt debe usarse de forma literal y con el texto en una sola línea; con saltos de párrafo tiende a copiar párrafos enteros en lugar de responder.
- El rendimiento en inglés es limitado y no está evaluado en la información disponible.
- No se documentan sesgos específicos; al entrenarse solo con datos abiertos y de dominio público, la cobertura temática y estilística es acotada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad para producción sin validación adicional.
- El repositorio ocupa 25,4 GB pese a los 488M de parámetros, lo que sugiere artefactos de entrenamiento o checkpoints adicionales; conviene revisar los archivos antes de descargar.
- El modelo se exporta con `Qwen3ForCausalLM` por compatibilidad arquitectónica, no porque derive de Qwen; no debe tratarse como un fine-tune de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ToetsChecker-Research/boterham
- Dataset de entrenamiento: https://huggingface.co/datasets/ToetsChecker-Research/beleg
- Informe TNO sobre GPT-NL (GPTNL-DEL-4002): no disponible como enlace directo en la información proporcionada
- EuroEval: no disponible como enlace directo en la información proporcionada
