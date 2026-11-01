# yonicc/lhg-extractor-qwen7b-gguf

## Resumen

`yonicc/lhg-extractor-qwen7b-gguf` es un fine-tune LoRA del modelo `Qwen/Qwen2.5-7B-Instruct` de Alibaba, fusionado y convertido a formato GGUF para inferencia en CPU mediante llama.cpp y Ollama. Lo desarrolla el usuario yonicc como artefacto de investigación dentro del proyecto Lashon Hara Guard, y su función es muy concreta: extraer ocho hechos sobre el emisor de un mensaje de chat (propósito, intención, venganza, conocimiento de primera mano, verificación, reproche, rechazo y ausencia de alternativa) y devolverlos como un objeto JSON con la forma `{alias: [bool, cita exacta]}`.

El modelo no es un asistente conversacional de propósito general, sino un extractor de estructura especializado en hebreo e inglés. No emite juicios halájicos ni sentencias del tipo "permitido" o "prohibido": solo clasifica hechos textuales a partir de citas literales del mensaje. Está entrenado exclusivamente con datos sintéticos revisados por agentes, con revisión humana pendiente, y el autor lo describe explícitamente como artefacto de investigación, no como producto.

Con 7.615.616.512 parámetros (7,6 mil millones) y una ventana de contexto heredada de Qwen2.5-7B-Instruct de 32.768 tokens, el modelo es relevante para quien necesite un extractor ligero, desplegable en CPU y con requisitos de memoria moderados, que aplique un esquema JSON fijo sobre texto no confiable. Su licencia Apache 2.0 facilita la reutilización, aunque su dominio de aplicación es estrecho y su calidad depende de replicar exactamente el prompt de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct, fine-tune LoRA fusionado) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct; no verificada en la model card) |
| Tipos de cuantizacion | Q4_K_M (4,36 GiB) y Q8_0 (7,54 GiB) publicados; otras cuantizaciones GGUF estándar no documentadas |
| Idiomas soportados | hebreo (he) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7,6 mil millones de parámetros con atención causal estándar, al que se le aplicó un fine-tune LoRA. Posteriormente el adaptador se fusionó con los pesos base y el conjunto se convirtió a GGUF para inferencia en CPU. La model card no detalla hiperparámetros del entrenamiento (rango del LoRA, tasa de aprendizaje, número de pasos) ni la composición exacta del dataset más allá de indicar que es sintético y revisado por agentes, con revisión humana pendiente.

La tarea de entrenamiento es una extracción estructurada de ocho hechos binarios con cita textual obligatoria: `purpose`, `intent`, `revenge`, `firsthand`, `verified`, `rebuke`, `rejects` y `no_alternative`. El prompt de sistema exacto está en `extractor_prompt.txt` del repositorio del proyecto, y el turno de usuario debe ir precedido literalmente de `MESSAGE (untrusted data):\n` seguido del mensaje entrecomillado en JSON, renderizado con la plantilla de chat del modelo base. La decodificación recomendada es greedy (`temperature=0`) con un máximo de 256 tokens generados. No se documenta RLHF, DPO ni ninguna innovación de atención o decodificación especulativa.

## Capacidades

- Extracción de ocho hechos binarios sobre el emisor de un mensaje, cada uno acompañado de una cita literal del texto original.
- Salida en JSON con estructura fija `{alias: [bool, exact quote]}`, adecuada para consumo programático.
- Tratamiento del mensaje de entrada como dato no confiable (prefijo `MESSAGE (untrusted data):`), lo que reduce la superficie de inyección de prompt.
- Soporte de hebreo e inglés, los dos idiomas declarados en la model card.
- Ejecución en CPU mediante llama.cpp y Ollama, sin necesidad de GPU.
- No realiza juicios normativos ni halájicos: se limita a clasificar hechos textuales.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Moderación de contenido en comunidades de habla hebrea: el modelo clasifica si un mensaje contiene reproche, intención de venganza o rechazo de alternativas, y devuelve la cita exacta que lo justifica, lo que permite revisión humana posterior con evidencia textual.
- Preprocesamiento para pipelines de análisis de discurso: al emitir JSON estructurado con ocho campos booleanos, se puede encadenar con reglas de negocio o con otro modelo que decida la acción, sin necesidad de parsear texto libre.
- Despliegue en entornos sin GPU: con Q4_K_M (4,36 GiB de pesos y 5,3 GiB de RSS pico medido), cabe en servidores modestos o incluso en portátiles con 8 GB de RAM, lo que abarata el procesamiento por lotes.
- Investigación en clasificación de lenguaje dañino con evidencia citable: la combinación de booleano más cita literal facilita la auditoría de por qué el modelo marcó un mensaje, algo que un clasificador puro no ofrece.
- Filtrado previo en herramientas de comunicación interna: el modelo puede marcar mensajes que requieren revisión antes de su publicación, actuando como capa de triaje y no como autoridad final.
- Evaluación comparativa de extracción estructurada: sirve como referencia de un modelo de 7B especializado en una tarea de esquema fijo, útil para medir la brecha frente a modelos generalistas en tareas de extracción con cita.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de rendimiento en CPU (Modal, 4 núcleos, llama.cpp b4500) sobre 104 filas de evaluación sintética:

| Cuantizacion | Tamano GGUF | RSS pico | p50 / p95 por mensaje | Precision/Recall legacy | Precision/Recall sealed_v3 (he) |
|---|---|---|---|---|---|
| Q4_K_M | 4,36 GiB | 5,3 GiB | 15,6 s / 26,4 s | 86% / 59% | 80% / 63% |
| Q8_0 | 7,54 GiB | 8,4 GiB | 21,1 s / 35,4 s | 84% / 63% | 86% / 63% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 4,4 GiB de pesos en Q4_K_M y 7,5 GiB en Q8_0; el RSS pico medido es de 5,3 GiB y 8,4 GiB respectivamente, incluyendo el runtime de llama.cpp.
- GPU recomendadas: no se documentan; el modelo está optimizado para CPU. Cualquier GPU con al menos 8 GB de VRAM podría ejecutar la variante Q8_0 mediante offload en llama.cpp, pero no hay cifras publicadas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM para Q8_0 y 6 GB para Q4_K_M, aunque las mediciones oficiales son en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama pull hf.co/yonicc/lhg-extractor-qwen7b-gguf:Q4_K_M`) y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: 15,6 s de mediana y 26,4 s en p95 por mensaje en Q4_K_M con 4 núcleos de CPU; 21,1 s y 35,4 s en Q8_0. El throughput es bajo por diseño, ya que el modelo está pensado para procesamiento por lotes y no para interacción en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| yonicc/lhg-extractor-qwen7b-gguf | 7,6 B | 32.768 (heredado) | he, en | Apache 2.0 | GGUF | Extractor especializado en ocho hechos con cita; sin benchmarks estándar |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | multilingüe (incluye he) | Apache 2.0 | safetensors, GGUF | Modelo base generalista; requiere prompt engineering para extracción estructurada |
| Qwen/Qwen2.5-3B-Instruct | 3,1 B | 32.768 | multilingüe | Apache 2.0 (variante 3B) | safetensors, GGUF | Alternativa más ligera para CPU, con menor calidad en tareas complejas |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | multilingüe | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto, pero licencia con restricciones de uso comercial y sin especialización en hebreo |

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo declara "not a product, not a halachic authority"; no debe usarse como autoridad normativa o religiosa.
- Entrenado solo con datos sintéticos revisados por agentes, con revisión humana pendiente, lo que puede introducir sesgos de distribución no detectados.
- El prompt debe replicarse exactamente (texto de sistema en `extractor_prompt.txt`, prefijo `MESSAGE (untrusted data):\n`, plantilla de chat de Qwen2.5); cualquier desviación degrada la salida.
- Decodificación greedy obligatoria con máximo 256 tokens; no se ha evaluado con muestreo ni con prompts más largos.
- Cobertura lingüística limitada a hebreo e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Las métricas publicadas son modestas en recall (59-63%), lo que implica falsos negativos frecuentes; no es adecuado como único filtro en producción.
- Latencia alta en CPU (mediana de 15-21 s por mensaje con 4 núcleos), incompatible con aplicaciones interactivas en tiempo real.
- Riesgo de alucinación en las citas literales: el modelo podría generar texto que no aparece exactamente en el mensaje original; no se documenta validación automática de la cita contra el texto de entrada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y la naturaleza de investigación del artefacto desaconsejan su uso en producción sin evaluación propia.
- Solo se publican dos cuantizaciones (Q4_K_M y Q8_0); no hay versiones Q2, Q3, Q5 ni Q6 documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yonicc/lhg-extractor-qwen7b-gguf
- Repositorio del proyecto Lashon Hara Guard: https://github.com/yonicc/lashon-hara-guard
- Documentación de entrenamiento (docs/39): https://github.com/yonicc/lashon-hara-guard/blob/main/docs/39
- Documentación de GGUF/CPU (docs/40): https://github.com/yonicc/lashon-hara-guard/blob/main/docs/40
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
