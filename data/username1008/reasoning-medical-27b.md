# Username1008/Reasoning-Medical-27B

## Resumen

Reasoning-Medical-27B es un modelo multimodal (texto e imagen) afinado para razonamiento médico, desarrollado por EpistemeAI y publicado en HuggingFace bajo el identificador `Username1008/Reasoning-Medical-27B`. Parte de `unsloth/Qwen3.6-27B` y se ha especializado mediante ajuste fino supervisado con cadenas de razonamiento (Chain-of-Thought) sobre unos 370.000 pares pregunta-respuesta de temática médica, usando el entrenador GRPO junto con las optimizaciones de Unsloth. El objetivo declarado es cubrir razonamiento clínico, genética médica y biología/medicina de nivel universitario, con un enfoque "universal" no restringido a un país concreto.

La arquitectura es híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención completa con GQA en un patrón repetido 16 veces, e incorpora un encoder de visión. El modelo tiene 27.781.427.952 parámetros (≈27,78 B), dimensión oculta de 5120, 64 capas y un vocabulario de 248.320 tokens. Declara 262.144 tokens de contexto nativo, extensible hasta 1.010.000, lo que lo sitúa en la liga de modelos de contexto muy largo.

Su relevancia ahora es doble: por un lado, aplica un esquema de razonamiento explícito (modo *thinking* por defecto) a un dominio de alto valor como la medicina; por otro, reporta un 93,00% en MedQA (2-shot) frente al 84,40% de su modelo base, una diferencia de 8,6 puntos porcentuales. Esa cifra procede de la propia model card y no de un leaderboard estandarizado, por lo que debe tratarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión: 16 bloques de (3 × Gated DeltaNet + FFN) → (1 × Gated Attention + FFN); 64 capas en total |
| Parametros totales | 27.781.427.952 (≈27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | BF16 (pesos originales); NVFP4 (variante publicada por `switzerchees` en un repo aparte). GGUF, INT8 e INT4 no se documentan en la información disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, repo de 55,6 GB) |

Otros datos de configuración declarados: dimensión oculta 5120; embedding y salida LM de 248.320 (con padding); FFN con dimensión intermedia 17.408; Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión RoPE 64; multi-token prediction (MTP) entrenado con varios pasos.

## Arquitectura y entrenamiento

El bloque constructivo es un híbrido poco habitual. Cada uno de los 16 macrobloques encadena tres subcapas de Gated DeltaNet (atención lineal con estado recurrente, 48 cabezas para V y 16 para QK) seguidas de una capa de atención completa con GQA (24 cabezas de consulta, 4 de clave-valor, dimensión de cabeza 256). El resultado es que solo 16 de las 64 capas mantienen atención cuadrática sobre el contexto, lo que reduce de forma drástica el coste y la memoria del KV cache en ventanas de cientos de miles de tokens. Se añade un encoder de visión, lo que convierte el modelo en image-text-to-text, y una cabeza de multi-token prediction (MTP) entrenada con varios pasos, habitual para habilitar decodificación especulativa.

El ajuste fino se realizó sobre un dataset de aproximadamente 370.000 ejemplos de pregunta-respuesta de alta calidad con razonamiento Chain-of-Thought, empleando el entrenador GRPO (Group Relative Policy Optimization, aprendizaje por refuerzo) con el método de optimización de Unsloth para reducir el coste de entrenamiento. La model card no detalla la composición exacta de esa mezcla de 370.000 ejemplos, ni el número de tokens de preentrenamiento (heredado del modelo base), ni si hubo fases adicionales de DPO o RLHF clásico. El modelo opera por defecto en modo *thinking*, emitiendo el razonamiento dentro de etiquetas `<think>...</think>` antes de la respuesta final.

## Capacidades

- Generación de texto y razonamiento clínico paso a paso: responde preguntas de medicina, genética médica y biología universitaria con cadenas de razonamiento explícitas.
- Modo *thinking* activado por defecto, desactivable para obtener respuestas directas (modo instruct/no-thinking).
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text` y la model card incluye un ejemplo de respuesta a una radiografía (X-ray).
- Preguntas de opción múltiple de estilo examen médico (formato MedQA), con extracción de la opción correcta.
- Razonamiento multi-paso y auto-consistencia (la model card menciona self-consistency CoT y best-of-N como protocolos de evaluación empleados en la comparativa).
- Soporte de decodificación especulativa gracias a la cabeza MTP.
- Integración con APIs compatibles con OpenAI a través de vLLM y SGLang.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente: no documentadas explícitamente; el razonamiento multi-paso es la base, pero no se especifica un modo agente.

## Casos de uso

- Apoyo al razonamiento diagnóstico en formación médica: el modelo puede resolver casos clínicos de opción múltiple mostrando el razonamiento intermedio, lo que lo hace útil como generador de explicaciones en plataformas de estudio para residentes, aprovechando el formato CoT con el que fue entrenado.
- Interpretación asistida de imagen radiológica en investigación: al aceptar entrada image-text, puede generar descripciones estructuradas de una radiografía o imagen médica y responder preguntas asociadas; la model card incluye un ejemplo explícito de respuesta a una X-ray. Uso previsto como apoyo a la docencia o a la anotación, nunca como diagnóstico autónomo.
- Generación de bancos de preguntas y material de evaluación: a partir de un temario de genética médica o biología, el modelo produce preguntas tipo examen con distractores plausibles y justificación razonada de la respuesta correcta.
- Resumen y explicación de literatura biomédica: con 262.144 tokens de contexto nativo puede ingerir artículos completos o guías clínicas extensas y producir resúmenes con trazabilidad al fragmento original.
- Triaje documental en entornos sanitarios: clasificación y extracción de información de historiales o informes largos en inglés, con la ventaja de que el contexto extendido evita trocear el documento y perder coherencia entre secciones.
- Segunda opinión sintética en pipelines de revisión: integrado vía vLLM con API compatible con OpenAI, puede colocarse detrás de una herramienta interna que contraste borradores de informes redactados por profesionales, marcando inconsistencias.
- Evaluación comparativa de modelos médicos: útil como sujeto de experimentos de reproducibilidad, ya que la propia model card recomienda replicar el 0,930 de MedQA con protocolo fijo (revisión del dataset, plantilla de prompt, número de shots, decodificación y semilla).
- Asistente conversacional especializado en inglés para consultas de biología y medicina de nivel universitario, con turnos multi-turno largos gracias a la ventana de contexto.

## Benchmarks y rendimiento

| Benchmark | Reasoning-Medical-27B | Qwen 3.6 27B (base) | Diferencia |
|---|---|---|---|
| MedQA (2-shot, según model card) | 93,00% | 84,40% | +8,60 pp |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, MedMCQA, PubMedQA, etc.) para este modelo.

Advertencia de la propia model card: la comparativa amplia que acompaña al dato no es un leaderboard estandarizado, ya que mezcla resultados publicados y de model card obtenidos con protocolos distintos (few-shot frente a zero-shot, aumento con búsqueda web, ajuste específico por benchmark, self-consistency, best-of-N, variantes de MedQA y formatos de opciones diferentes). Para una comparación defendible hay que reejecutar todos los modelos con la misma revisión del dataset, plantilla de prompt, número de shots, ajustes de decodificación, extractor de respuestas y semilla.

## Requisitos de hardware

- Pesos en BF16: 55,6 GB solo de parámetros. Necesita una GPU de 80 GB (A100 80GB, H100 80GB) como mínimo para inferencia sin cuantizar con contexto moderado; para explotar los 262.144 tokens conviene H200 (141 GB) o dos A100/H100 de 80 GB con tensor parallelism.
- Estimación del KV cache: solo 16 capas usan atención completa, con 4 cabezas KV de dimensión 256, es decir 2 × 4 × 256 = 2.048 elementos por token y capa, 32.768 elementos por token en total. En BF16 son unos 64 KiB por token, aproximadamente 16 GiB para una secuencia de 262.144 tokens (cálculo propio a partir de la configuración declarada, no un dato publicado).
- Pesos en FP8: ≈28 GB; encaja en una A100 80GB, L40S 48GB o RTX 6000 Ada 48GB, dejando margen para caché.
- Pesos en NVFP4 (variante `switzerchees/Reasoning-Medical-27B-NVFP4`): ≈14-16 GB; cabe en GPU de consumo de 24 GB (RTX 4090, RTX 5090, L4). Con contexto muy largo en 24 GB el margen se agota por el KV cache.
- BF16 en GPU de consumo: no viable en 24 GB ni en 48 GB por tamaño de pesos.
- Despliegue: vLLM (`vllm serve`) y SGLang (`python3 -m sglang.launch_server`) son las opciones documentadas por el autor, ambas con API compatible con OpenAI. Requiere `transformers>=5.2.0`. Soporte en llama.cpp, Ollama o TGI: no documentado en la información disponible (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponible (el repositorio registra 0 descargas y no hay mediciones publicadas).
- Parámetros de muestreo recomendados por el autor: modo thinking general `temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0`; modo thinking para código `temperature=0.6`; modo instruct `temperature=0.7, top_p=0.80, top_k=20, presence_penalty=1.5`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA (2-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reasoning-Medical-27B | 27,78 B (denso) | 262.144 (ext. 1.010.000) | 93,00% | Apache 2.0 | HuggingFace (`Username1008/Reasoning-Medical-27B`), variante NVFP4, playground |
| Qwen3.6-27B (modelo base) | ≈27 B | No disponible en la información proporcionada | 84,40% | No disponible en la información proporcionada | HuggingFace (`unsloth/Qwen3.6-27B`) |
| Reasoning-Medical-27B-NVFP4 | 27,78 B (cuantizado NVFP4) | Heredado del modelo original | No disponible | No disponible | HuggingFace (`switzerchees/Reasoning-Medical-27B-NVFP4`) |
| Otros modelos médicos de tamaño comparable (Med-PaLM 2, Meditron, BioMistral, MedGemma) | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación con datos numéricos verificables en la información proporcionada es frente al modelo base. Cualquier comparación con otros modelos médicos exigiría reejecutar los benchmarks bajo un protocolo común, tal y como advierte la propia model card.

## Limitaciones y advertencias

- El 93,00% de MedQA mide rendimiento en preguntas de examen de opción múltiple, no resultados clínicos en pacientes reales. No es validación clínica.
- Riesgo de contaminación de benchmarks públicos, que puede inflar la generalización aparente.
- La precisión varía sustancialmente con la plantilla de prompt y los ajustes de decodificación; el propio autor recomienda replicar el resultado de forma independiente.
- El modelo puede generar explicaciones seguras de sí mismas pero incorrectas: riesgo de alucinación en un dominio donde un error tiene consecuencias graves.
- Rendimiento potencialmente desigual entre especialidades, países, idiomas, demografía y entornos asistenciales.
- Solo declara inglés; no hay soporte multilingüe documentado, lo que limita su uso en castellano sin una evaluación previa.
- La mezcla de entrenamiento de ~370.000 ejemplos no está enumerada en la model card, lo que impide auditar sesgos y procedencia de los datos.
- La model card se refiere al modelo como `EpistemeAI/Reasoning-Medical-27B`, mientras que los pesos están publicados bajo la cuenta `Username1008`, con 0 descargas y 0 likes en el momento de la consulta y sin validación independiente conocida.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y las atribuciones; no hay cláusulas de uso restringido, pero tampoco garantías.
- La afirmación del autor de que el modelo no tiene controles de exportación ni restricciones no exime del cumplimiento de la normativa aplicable (por ejemplo, regulación de productos sanitarios o RGPD si se procesan datos de pacientes).
- Para uso en producción sanitaria se requiere validación local, supervisión humana y trazabilidad de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Username1008/Reasoning-Medical-27B
- Repositorio del autor original (BF16): https://huggingface.co/EpistemeAI/Reasoning-Medical-27B
- Variante NVFP4: https://huggingface.co/switzerchees/Reasoning-Medical-27B-NVFP4
- Playground: https://huggingface.co/spaces/EpistemeAI/reasoning-medical-27b
- Cookbook / SDK: https://github.com/tomtyiu/EpistemeAI-series-Cookbook-SDK
- Modelo base: https://huggingface.co/unsloth/Qwen3.6-27B
- Referencias arXiv incluidas en los tags del repositorio: arxiv.org/abs/2404.18416, arxiv.org/abs/2305.09617, arxiv.org/abs/2212.13138 (los títulos y la relación exacta con este modelo no se detallan en la información proporcionada)
