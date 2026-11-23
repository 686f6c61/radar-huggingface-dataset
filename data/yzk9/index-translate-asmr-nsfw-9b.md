# yzk9/index-translate-asmr-nsfw-9B

## Resumen

index-translate-asmr-nsfw-9B es un ajuste fino (SFT) del modelo Index-Translate-9B de Index Team, desarrollado por el usuario yzk9 para una tarea muy concreta: traducir diálogos de audio japonés de tipo ASMR y audio-drama a subtítulos en chino tradicional. El modelo no procesa audio directamente; recibe el texto ya transcrito por una aplicación externa y devuelve la traducción con un formato JSON que conserva los identificadores de cada línea para reinsertarla en la línea de tiempo original.

Se trata de un modelo de aproximadamente 9.197 millones de parámetros (9,2 B) construido sobre una arquitectura híbrida que combina capas de atención con GatedDeltaNet, según se desprende de los módulos entrenados en el LoRA. El ajuste se realizó con LoRA BF16 de rango 16 sobre 2.556 pares de líneas paralelas japonés-chino, agrupados en 369 muestras multi-frase, y se distribuye en formato GGUF (Q4_K_M y Q5_K_M) con el LoRA ya fusionado, además del adaptador PEFT original.

Su relevancia es acotada pero específica: cubre un nicho de traducción de contenido adulto y de audio-drama donde la naturalidad del registro coloquial, la preservación del grado de franqueza del original y las convenciones de puntuación de subtítulos importan más que la cobertura multilingüe general. El contexto operativo recomendado en los ejemplos del autor es de 8192 tokens, con decodificación determinista (temperature=0) y el modo de razonamiento desactivado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y capas GatedDeltaNet (base Index-Translate-9B, familia Qwen3.5) |
| Parámetros totales | 9.197.093.888 (9,2 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens en la configuración de ejemplo del autor (`-c 8192`); máximo nativo del modelo base no disponible |
| Tipos de cuantización | GGUF Q4_K_M y Q5_K_M publicados; el LoRA se fusiona sobre BF16 antes de cuantizar |
| Idiomas soportados | japonés (ja) y chino tradicional (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M: 5,78 GB; Q5_K_M: 6,64 GB) y adaptador PEFT LoRA en safetensors con tokenizer |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Index-Translate-9B, que combina capas de atención con capas GatedDeltaNet (un mecanismo de estado recurrente con compuertas) y capas MLP. El ajuste LoRA se aplicó precisamente sobre las capas lineales de atención, GatedDeltaNet y MLP del bloque de texto, con rango 16, alpha 16 y dropout 0, lo que supone 43.278.336 parámetros entrenables. Los GGUF conservan la cabecera MTP (multi-token prediction) del modelo base, lo que permite activar decodificación especulativa con `--spec-type draft-mtp --spec-draft-n-max 2`.

El entrenamiento consistió en un SFT con LoRA en BF16 sobre 2.556 pares de líneas paralelas japonés-chino procedentes de ASR y guiones japoneses emparejados con subtítulos humanos en chino tradicional, agrupados en 369 muestras multi-frase y divididos por obra para evitar filtración entre conjuntos. Se usó fused AdamW con LR 2e-5, weight decay 0,01, scheduler coseno y 10 pasos de warmup, con micro-batch 2 y acumulación 8 (batch efectivo 16) y secuencias de hasta 3.072 tokens. La pérdida se calculó únicamente sobre las respuestas del asistente y el token de fin de turno. Los pesos publicados corresponden al paso 48 de un total de 72 (época 2,0 de 3). El entrenamiento se ejecutó en una RTX 5090 de 32 GiB con Unsloth, Transformers y PEFT, semilla 3407. No se documenta uso de RLHF ni DPO.

## Capacidades

- Traducción japonés a chino tradicional de diálogos de audio-drama y ASMR, con conservación del grado de franqueza o eufemismo del original.
- Traducción por lotes de 4 a 12 frases por petición, con salida en JSON que preserva los identificadores de cada línea.
- Uso de contexto de referencia (frases anteriores y posteriores) para desambiguar, sin traducirlo.
- Aplicación de glosarios de términos japonés-chino proporcionados en el prompt, con posible anidación de glosario global y de proyecto.
- Control de estilo mediante instrucciones explícitas (registro, cercanía entre personajes, naturalidad del habla).
- Convenciones de subtitulado: omisión de puntos y comas finales, conservación de interrogaciones, exclamaciones y puntos suspensivos necesarios.
- Formato de salida restringido mediante gramática JSON, con verificación del número de elementos y de la integridad de la respuesta.
- Modo de razonamiento desactivable (`enable_thinking: false`), recomendado para esta tarea.
- No soporta tool calling, agentes multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Subtitulado de audio-drama japonés para distribución en chino tradicional: el modelo recibe las líneas transcritas con identificadores y devuelve el JSON traducido, que la aplicación reinserta en la línea de tiempo original; el contexto de referencia permite resolver pronombres y elipsis típicas del japonés hablado.
- Localización de contenido ASMR de nicho adulto: el ajuste preserva el nivel de explicitud o de eufemismo del original en lugar de suavizarlo o recargarlo, algo que los modelos generalistas tienden a alterar.
- Integración en la herramienta Ownsei: el GGUF se coloca en `models/.sources/index-translate-ownsei-sft48-q4-k-m/` y se prepara con `ownsei models prepare`, quedando seleccionable como opción SFT48 Q4 o Q5 en los ajustes de procesamiento por lotes.
- Traducción por lotes en pipelines de subtitulado: con `translate.py` (Python 3.10+, solo biblioteca estándar) se procesan ficheros JSON de entrada con lotes de 4 a 12 frases, con control de tokens máximos y reducción de lote cuando se excede el presupuesto.
- Consistencia terminológica en series largas: el glosario global cubre términos comunes y el de proyecto personajes y topónimos, con prioridad del proyecto sobre el global y envío solo de los términos relevantes para el lote.
- Despliegue local en estación de trabajo: con llama.cpp y `llama-server -ngl 99 -fa on --jinja` sobre una RTX 4070 Ti de 12 GiB se validó la inferencia de ambas cuantizaciones, lo que permite traducir sin depender de servicios en la nube.
- Generación de subtítulos deterministas para revisión editorial: con `temperature=0` y gramática JSON, la salida es reproducible y verificable por número de líneas, lo que facilita la comparación entre versiones de glosario o de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la validación de inferencia de los dos GGUF en llama.cpp b11541 sobre una RTX 4070 Ti de 12 GiB, sin cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para Q4_K_M (5,78 GB de pesos): en torno a 7-8 GiB con contexto de 8192 tokens y overhead de KV cache y buffers de llama.cpp; validado en una GPU de 12 GiB.
- VRAM estimada para Q5_K_M (6,64 GB de pesos): en torno a 8-9 GiB en las mismas condiciones; también validado en 12 GiB.
- GPU recomendadas: RTX 4070 Ti 12 GiB (verificada por el autor), RTX 4090 24 GiB para mayor margen de contexto y lotes, A100 y H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GiB o más para Q4_K_M y Q5_K_M con contexto moderado; por debajo de 12 GiB conviene reducir `-c` o el número de capas offloaded.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`, `-fa on`, `--chat-template-kwargs '{"enable_thinking":false}'`), cliente `translate.py` incluido; otras opciones como vLLM, TGI u Ollama no están documentadas para este modelo.
- Aceleración opcional: decodificación especulativa con la cabecera MTP del modelo base mediante `--spec-type draft-mtp --spec-draft-n-max 2`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| index-translate-asmr-nsfw-9B | 9,2 B | 8192 en configuración de ejemplo | ja, zh | Apache-2.0 | GGUF, LoRA PEFT | Ajuste específico para subtitulado ASMR/audio-drama |
| IndexTeam/Index-Translate-9B | 9,2 B (base) | no disponible | no disponible | no disponible en la información | safetensors (base) | Modelo base sin el ajuste de estilo ni las convenciones de subtítulo |
| Alternativas de traducción ja-zh de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base.

## Limitaciones y advertencias

- Solo traduce japonés a chino tradicional; no cubre otros pares de idiomas ni traducción inversa.
- No procesa audio: requiere una transcripción previa externa y no genera ni ajusta la línea de tiempo de los subtítulos.
- El ajuste se entrenó con 2.556 pares de líneas y 369 muestras; es un corpus pequeño, por lo que la generalización a dominios distintos del ASMR y el audio-drama es incierta.
- Riesgo de alucinación y de desviación de estilo en frases ambiguas, nombres propios no incluidos en el glosario o jerga muy específica de una obra.
- El contenido está marcado como `not-for-all-adultos` y `nsfw`: el modelo puede generar lenguaje sexual explícito. Requiere control de acceso y filtrado en cualquier despliegue público.
- La licencia Apache-2.0 se aplica a los pesos y a la documentación del repositorio según la model card, pero conviene revisar `LICENSE` y `NOTICE` del repositorio, así como las condiciones del modelo base, antes de un uso comercial.
- El modelo base no está caracterizado en la información disponible (contexto nativo máximo, composición del corpus de entrenamiento original, sesgos), lo que limita la evaluación de riesgos heredados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- El uso de `temperature=0` y gramática JSON es necesario para garantizar el formato de salida; sin esa restricción, el modelo puede devolver texto fuera del esquema esperado.
- El presupuesto de tokens de `-c` cubre entrada y salida conjuntamente; lotes largos requieren aumentar el contexto o reducir el tamaño del lote.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yzk9/index-translate-asmr-nsfw-9B
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-9B
- Repositorio de llama.cpp (soporte Qwen3.5, build b11541): https://github.com/ggml-org/llama.cpp
