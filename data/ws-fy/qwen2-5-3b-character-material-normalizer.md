# ws-fy/qwen2.5-3b-character-material-normalizer

## Resumen

El qwen2.5-3b-character-material-normalizer es un ajuste fino supervisado de Qwen2.5-3B-Instruct, publicado por el usuario ws-fy, especializado en una única tarea de limpieza de datos: convertir material bruto de diálogos de personajes (guiones de videojuegos, recopilaciones de voice lines, citas de PV) en un JSON compacto y estructurado que pueda consumir directamente un modelo de expansión de diálogo. El problema que resuelve es muy concreto: los corpus de fans suelen venir con cabeceras de copyright, créditos de actores de voz, marcas `【Título】`, líneas de diálogo sin etiqueta de hablante, hablantes desconocidos marcados como `？？？` y acotaciones entre paréntesis, lo que rompe cualquier pipeline automático de generación de datasets.

Arquitectónicamente es un transformer decoder-only de la familia Qwen2, con 3.085.938.688 parámetros (3,09 mil millones) y una ventana de contexto nativa de 32.768 tokens heredada del modelo base, aunque el entrenamiento se hizo con secuencias de solo 1.024 tokens. El ajuste se realizó mediante LoRA con r=16 y alpha=32 sobre 2.478 muestras durante una época con tasa de aprendizaje 1e-4, y después se fusionó con `merge_and_unload`, de modo que el repositorio se carga como un checkpoint Qwen2.5 estándar sin necesidad de PEFT.

Su relevancia es acotada pero clara: es un componente de preprocesado barato que se ejecuta en hardware de consumo y que evita tener que enviar corpus grandes a APIs de pago. El autor es explícito sobre sus límites: en una prueba con un guion de juego sin limpiar, de personaje y formato no vistos, logró una tasa de parseo JSON del 100% (19/19 fragmentos) pero solo un 73,1% de recall de líneas y un 21,3% de fugas de hablante, por lo que recomienda su uso como generador de borradores con revisión humana posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA fusionado |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 1.024 tokens durante el entrenamiento |
| Tipos de cuantizacion | FP16 en el repositorio principal; builds GGUF publicados en un repositorio aparte (el autor no detalla los niveles exactos) |
| Idiomas soportados | en, zh (la plantilla de instrucciones se usa en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2 shards: 3.810,8 MB + 2.075,2 MB; 5,75 GB en total), más `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso con atención causal estándar, 3,09 B de parámetros y 32.768 tokens de contexto nativo. Sobre esa base se aplicó un LoRA de rango 16 y alpha 32, entrenado durante una única época sobre 2.478 muestras con tasa de aprendizaje 1e-4 y secuencias de 1.024 tokens. Posteriormente el adaptador se fusionó en los pesos base mediante `merge_and_unload`, por lo que el resultado es un checkpoint FP16 convencional de 5,75 GB repartido en dos shards.

No se documenta la composición exacta del dataset de entrenamiento (proporción de chino frente a inglés, número total de tokens, origen del material) ni si hubo etapas de RLHF o DPO adicionales sobre el ajuste supervisado. La innovación técnica no está en la arquitectura, sino en el contrato de salida: el modelo aprende a emitir un objeto JSON con la clave `char`, una lista `samples` en formato ShareGPT con turnos `user`/`assistant` reales, y una lista `lines` para monólogos y voice lines que deliberadamente no se emparejan con prompts inventados. Además, el autor documenta una restricción operativa medida empíricamente: con fragmentos de 2.000 caracteres la tasa de acierto cae al 6%, mientras que con fragmentos de unos 900 caracteres sube al 89% sobre el mismo segmento de 1.132 caracteres, atribuido a que un modelo de 3B abandona antes de terminar listas densas de ítems.

## Capacidades

- Generación de texto y transformación estructurada: convierte texto libre desordenado en JSON válido con un esquema fijo y verificable.
- Extracción estructurada de diálogo: separa turnos conversacionales reales (`samples`) de líneas sueltas o monólogos (`lines`).
- Filtrado de metadatos: descarta cabeceras de copyright, créditos de actores de voz, marcas de título y fichas de personaje.
- Atribución de hablante: intenta identificar qué líneas pertenecen al personaje objetivo y descartar las de otros personajes, incluidos los marcados como `？？？`.
- Manejo de formato ruidoso: procesa acotaciones entre paréntesis, líneas partidas por saltos de línea y diálogo sin etiqueta de hablante.
- Multilingüe limitado a inglés y chino, con la particularidad de que la plantilla de instrucciones debe mantenerse en chino y ser byte a byte idéntica a la de entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito; es un modelo de tarea única.

## Casos de uso

- Normalización de guiones de videojuegos para pipelines de expansión de diálogo: se trocea el script original en bloques de unos 900 caracteres y el modelo devuelve JSON listo para alimentar un modelo mayor que genere diálogo aumentado, con revisión humana de las líneas mal atribuidas.
- Construcción de datasets ShareGPT para fine-tuning de personajes: a partir de recopilaciones de citas y conversaciones de un personaje concreto se obtienen pares `user`/`assistant` ya separados de las voice lines sueltas, lo que reduce el trabajo manual de curación.
- Limpieza de recopilaciones de voice lines y citas de PV: el campo `lines` permite extraer monólogos sin que el modelo invente prompts artificiales, algo habitual en pipelines que fuerzan todo a pares pregunta-respuesta.
- Preprocesado de corpus de fansubs y wikis de personajes: se ejecuta en local sobre hardware de consumo para eliminar cabeceras, créditos y marcadores de título antes de indexar el contenido.
- Etapa de bajo coste en pipelines de datos sintéticos: al ser un modelo de 3B en FP16 y con builds GGUF disponibles, se puede usar como primer filtro masivo y reservar modelos más grandes solo para los fragmentos que fallen el parseo JSON.
- Curaduría de material para mods y fan games: normaliza material heterogéneo de distintos personajes a un esquema común que luego se importa en herramientas de guion o bases de datos de diálogo.
- Auditoría de calidad de datasets existentes: al medir recall y fugas de hablante sobre un conjunto de referencia, sirve para detectar secciones mal etiquetadas en corpus ya recopilados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni comparaciones estándar). El autor solo reporta métricas de la tarea específica sobre un guion de juego sin limpiar, de personaje y formato no vistos, con 330 líneas de referencia:

| Metrica | Resultado |
|---|---|
| Tasa de parseo JSON | 19/19 fragmentos (100%) |
| Recall de lineas | 73,1% |
| Fuga de hablante (lineas atribuidas al personaje equivocado) | 21,3% |
| Contaminacion de metadatos | 1 ocurrencia |
| Acierto con fragmentos de 2.000 caracteres | 6% |
| Acierto con fragmentos de 900 caracteres | 89% |

## Requisitos de hardware

- VRAM estimada en FP16: los pesos ocupan 5,75 GB; con overhead de activaciones y caché KV para contextos cortos (1.024-4.096 tokens) el consumo práctico ronda los 7-9 GB.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090, L4, L40S, A10G, A100 y H100. Cualquier GPU con 8 GB o más puede ejecutarlo en FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB y superiores en FP16; con builds GGUF cuantizados de 4 bits (unos 2 GB de pesos) cabría en GPUs de 4-6 GB, aunque el autor no detalla los niveles publicados.
- Opciones de despliegue: transformers con `device_map="auto"` y `torch_dtype="float16"` es la vía documentada; al ser un checkpoint Qwen2.5 estándar es compatible con vLLM, TGI, llama.cpp y Ollama (estos dos últimos a través de los builds GGUF del repositorio separado).
- Latencia y throughput: no disponibles en la información proporcionada. La generación documentada usa decodificación greedy (`do_sample=False`), `max_new_tokens=700` y `repetition_penalty=1.05`, lo que sugiere salidas de hasta varios cientos de tokens por fragmento de 900 caracteres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ws-fy/qwen2.5-3b-character-material-normalizer | 3,09 B | 32.768 | Apache-2.0 | Normalizacion de material de personajes a JSON | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 | Apache-2.0 | Instrucciones generales y conversacion | HuggingFace, ampliamente utilizado |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 | Apache-2.0 | Instrucciones generales, mayor capacidad de razonamiento | HuggingFace, muy extendido |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Llama 3.2 Community License | Instrucciones generales y multilingue | HuggingFace, requiere aceptar licencia |

La comparación relevante es frente al modelo base: este checkpoint no mejora las capacidades generales de Qwen2.5-3B-Instruct, sino que las restringe a un contrato de salida JSON concreto a cambio de una tasa de cumplimiento alta en esa tarea. Frente a Qwen2.5-7B-Instruct ofrece la mitad de parámetros y por tanto menor coste de inferencia, pero también menor capacidad para listas densas, de ahí la restricción de 900 caracteres por fragmento. No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas en la tarea de normalización.

## Limitaciones y advertencias

- Recall de líneas del 73,1%: aproximadamente una de cada cuatro líneas del material original se pierde, por lo que el JSON de salida no es un reflejo completo del guion.
- Fuga de hablante del 21,3%: una quinta parte de las líneas acaba atribuida al personaje equivocado, incluidas líneas de otros personajes o de hablantes marcados como `？？？`. El autor califica explícitamente el recall y la atribución como insuficientes para uso desatendido.
- Restricción dura de troceado: por encima de unos 900-1.000 caracteres por fragmento el rendimiento cae en picado (6% de acierto con 2.000 caracteres), lo que obliga a implementar chunking propio en cualquier pipeline.
- Dependencia estricta de la plantilla: la instrucción debe enviarse en chino y ser byte a byte idéntica a la del model card; reformularla o traducirla degrada la salida.
- Riesgo de alucinación estructural: aunque el parseo JSON fue del 100% en la prueba publicada, el modelo puede completar huecos con contenido plausible no presente en el material original, especialmente en listas largas de ítems.
- Idiomas: las etiquetas declaran solo en y zh, y la plantilla de entrenamiento está en chino; no hay evidencia de buen comportamiento con material en castellano u otros idiomas.
- Sesgos: no se documenta ninguna evaluación de sesgos, y al entrenarse sobre material de personajes de videojuegos puede heredar los estereotipos presentes en ese corpus.
- Licencia Apache-2.0, que permite uso comercial y modificación sin restricciones adicionales, pero al derivar de Qwen2.5-3B-Instruct conviene conservar la atribución al modelo base.
- Madurez: el repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (28 de octubre de 2026), por lo que no hay validación independiente de las métricas declaradas.
- Contaminación de metadatos: aunque baja en la prueba (1 ocurrencia), no es cero, así que el pipeline debe validar el esquema y filtrar campos inesperados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ws-fy/qwen2.5-3b-character-material-normalizer
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de builds GGUF: mencionado por el autor como repositorio separado, sin URL disponible en la información proporcionada.
- Paper, blog o demo adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo dominios y servicios ajenos al mismo).
