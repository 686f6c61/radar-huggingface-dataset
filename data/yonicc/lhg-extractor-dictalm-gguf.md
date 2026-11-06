# yonicc/lhg-extractor-dictalm-gguf

## Resumen

`yonicc/lhg-extractor-dictalm-gguf` es un artefacto de investigación publicado por el usuario yonicc: un fine-tune LoRA (fusionado y posteriormente convertido a GGUF) del modelo israelí `dicta-il/dictalm2.0-instruct`, de 7.251 millones de parámetros. Su única función es extraer ocho hechos sobre el escritor de un mensaje de chat (propósito, intención, venganza, testimonio directo, verificación, reproche, rechazo y ausencia de alternativa) y devolverlos como un objeto JSON con la forma `{alias: [bool, cita exacta]}`. Forma parte del proyecto Lashon Hara Guard, orientado a detectar discurso potencialmente lesivo según la normativa judía de *lashón hará*.

El modelo no razona ni conversa: es un extractor de estructura con un prompt de entrenamiento fijo. No emite juicios halájicos ni afirma si algo está "permitido"; solo etiqueta hechos del texto. Está entrenado exclusivamente con datos sintéticos revisados por agentes (revisión humana pendiente), lo que lo convierte en una pieza de investigación reproducible más que en un producto listo para producción.

Su relevancia actual es doble: por un lado, demuestra un patrón de destilación de tareas muy estrechas sobre modelos base de 7B con cuantización GGUF para ejecución en CPU; por otro, documenta métricas medidas de forma transparente (precisión, recall, latencia y RSS en 4 núcleos) en lugar de benchmarks genéricos, algo poco habitual en fine-tunes pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de DictaLM 2.0 / familia Mistral), no disponible el detalle exacto de capas y dimensiones |
| Parámetros totales | 7.251.169.280 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (4,07 GiB) y Q8_0 (7,18 GiB) publicadas; otras cuantizaciones GGUF estándar no confirmadas |
| Idiomas soportados | hebreo (he) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de `dicta-il/dictalm2.0-instruct`, un transformer decoder-only de 7B orientado a hebreo e inglés. Sobre él se aplicó un fine-tune LoRA que posteriormente se fusionó con los pesos base y se convirtió a GGUF para inferencia en CPU con llama.cpp. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición exacta del dataset, ni si hubo una fase de RLHF o DPO; el autor indica únicamente que el entrenamiento se realizó sobre datos sintéticos revisados por agentes, con revisión humana todavía pendiente.

La innovación técnica no está en la arquitectura, sino en el contrato de uso: el modelo exige un prompt de entrenamiento exacto (texto de sistema en `extractor_prompt.txt`, turno de usuario con el prefijo `MESSAGE (untrusted data):` seguido del mensaje entrecomillado en JSON) y decodificación greedy con un máximo de 256 tokens. Como DictaLM/Mistral no tiene rol de sistema, el texto de sistema se antepone al turno de usuario separado por una línea en blanco. Cualquier desviación del prompt degrada la salida, que debe ser un JSON estricto de ocho claves.

## Capacidades

- Extracción de ocho hechos del escritor de un mensaje: `purpose`, `intent`, `revenge`, `firsthand`, `verified`, `rebuke`, `rejects` y `no_alternative`, cada uno como booleano acompañado de la cita exacta que lo justifica.
- Salida en JSON estructurado con la forma `{alias: [bool, exact quote]}`, apta para consumo programático.
- Comprensión de hebreo e inglés, heredada del modelo base.
- Tratamiento del mensaje de entrada como dato no confiable (prefijo `untrusted data`), una mitigación básica frente a inyección de prompt.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- No emite juicios halájicos ni recomendaciones: se limita a etiquetar hechos.

## Casos de uso

- Moderación de contenido en comunidades judías: el extractor puede clasificar mensajes entrantes y marcar aquellos con indicios de *lashón hará* (reproche, intención lesiva, falta de testimonio directo) para revisión humana, sin que el modelo emita un veredicto.
- Preprocesado en pipelines de análisis textual: al devolver JSON con citas exactas, la salida se puede indexar en una base de datos y auditar cada etiqueta contra el fragmento original.
- Herramienta educativa sobre *lashón hará*: mostrar al usuario qué hechos detecta el modelo en su propio mensaje (por ejemplo, si habla de oídas o de forma directa) sirve como ejercicio de concienciación.
- Investigación en NLP semítico: el modelo sirve como caso de estudio de fine-tuning LoRA sobre DictaLM 2.0 para tareas de extracción de estructura en hebreo.
- Evaluación de robustez frente a inyección de prompt: el diseño con `untrusted data` y decodificación greedy permite montar experimentos controlados sobre cómo un mensaje malicioso afecta a la extracción.
- Despliegue en entornos sin GPU: con Q4_K_M (4,07 GiB) y Ollama o llama.cpp en CPU, encaja en servidores modestos o incluso en un portátil para pruebas de concepto.
- Generación de datasets etiquetados: usar el extractor para preetiquetar corpus de mensajes y luego revisar manualmente las citas, acelerando la creación de datos supervisados.

## Benchmarks y rendimiento

Métricas medidas por el autor en Modal con 4 núcleos de CPU, llama.cpp b4500 y 104 filas de evaluación sintéticas:

| Cuantización | Tamaño GGUF | RSS pico | p50 / p95 por mensaje | Precisión / recall (legacy) | Precisión / recall (sealed_v3, he) |
|---|---|---|---|---|---|
| Q4_K_M | 4,07 GiB | 5,1 GiB | 26,1 s / 42,9 s | 73 % / 71 % | 94 % / 79 % |
| Q8_0 | 7,18 GiB | 8,2 GiB | 26,8 s / 47,4 s | 76 % / 69 % | 100 % / 84 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M requiere unos 4,07 GiB de pesos y alcanza 5,1 GiB de RSS pico; Q8_0 requiere 7,18 GiB de pesos y 8,2 GiB de RSS pico.
- GPU recomendadas: no se documentan; el autor valida el despliegue en CPU con llama.cpp. Cualquier GPU con al menos 6 GiB de VRAM puede ejecutar Q4_K_M mediante offload completo.
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 8 GiB o más (RTX 3060 Ti, RTX 4060, RTX 3070) y Q8_0 en 10-12 GiB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama pull hf.co/yonicc/lhg-extractor-dictalm-gguf:Q4_K_M`) y cualquier runtime compatible con GGUF y endpoints compatibles.
- Latencia y throughput: en 4 núcleos de CPU, p50 de 26,1 s (Q4_K_M) y 26,8 s (Q8_0) por mensaje; p95 de 42,9 s y 47,4 s respectivamente. No se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| yonicc/lhg-extractor-dictalm-gguf | 7,25 B | no disponible | he, en | Apache 2.0 | Extractor de hechos con JSON y citas |
| dicta-il/dictalm2.0-instruct | 7 B (aprox.) | no disponible | he, en | no disponible en la información | Modelo base instructivo generalista |
| Fine-tunes GGUF de 7B para extracción JSON (genéricos) | 7 B | variable | en principalmente | variable | Extracción estructurada sin especialización en hebreo |

La comparación con alternativas de la misma categoría (extractores JSON de 7B) no está disponible con datos medidos; el autor solo publica métricas frente a su propia línea base interna (`legacy` frente a `sealed_v3`).

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo declara "not a product, not a halachic authority"; no debe usarse como consejo religioso ni legal.
- Entrenado solo con datos sintéticos revisados por agentes, con revisión humana pendiente: riesgo de sobreajuste a los patrones del generador sintético.
- El prompt debe ser exactamente el de entrenamiento; cualquier variación en el texto de sistema, el prefijo o el formato del mensaje invalida la salida.
- Decodificación greedy y máximo de 256 tokens: no admite sampling ni respuestas largas.
- Idiomas limitados a hebreo e inglés; no hay evidencia de comportamiento en castellano u otras lenguas.
- Latencia alta en CPU (decenas de segundos por mensaje), lo que limita su uso interactivo sin GPU.
- Posible riesgo de alucinación en las citas exactas: el modelo puede devolver fragmentos que no coinciden literalmente con el mensaje, por lo que conviene validar la cita contra el texto original.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza de investigación y la falta de validación humana desaconsejan producción sin evaluación propia.
- El modelo base DictaLM 2.0 puede arrastrar sesgos presentes en sus datos de entrenamiento; no se documentan evaluaciones de sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/yonicc/lhg-extractor-dictalm-gguf
- Repositorio del proyecto: https://github.com/yonicc/lashon-hara-guard
- Documentación de entrenamiento (docs/39): https://github.com/yonicc/lashon-hara-guard/blob/main/docs/39
- Documentación de GGUF/CPU (docs/40): https://github.com/yonicc/lashon-hara-guard/blob/main/docs/40
- Modelo base: https://huggingface.co/dicta-il/dictalm2.0-instruct
