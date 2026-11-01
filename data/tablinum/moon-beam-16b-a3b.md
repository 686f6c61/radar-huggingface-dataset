# tablinum/Moon-Beam-16B-A3B

## Resumen

Moon-Beam-16B-A3B es un ajuste fino (fine-tune) del modelo Moonlight-16B-A3B-Instruct de Moonshot AI, desarrollado por Tablinum. Se trata de un modelo de lenguaje con arquitectura Mixture-of-Experts (MoE) de tipo DeepSeek-V3, con 15.960.111.936 parámetros totales y aproximadamente 3B activos por token. Su propósito específico es el uso correcto del "engram" Tablinum-2, un conjunto de conocimiento recuperable organizado en 26 tablas: el modelo lee los pasajes recuperados, responde a partir de ellos cuando contienen la respuesta y declina responder cuando no la contienen.

La relevancia de este modelo radica en su enfoque de calibración: en lugar de inyectar conocimiento en los pesos, el engram aporta el conocimiento mediante recuperación y el entrenamiento enseña al modelo a ser honesto sobre lo que los pasajes sostienen. Según la model card, con una única búsqueda sobre las 26 tablas y sin enrutamiento, la build IQ3 de 8 GB responde correctamente 406 de 502 preguntas retenidas de EngramBench, con 38 erróneas (índice +73,3, frente a −46,8 en modo closed-book).

El modelo se distribuye con licencia MIT, en inglés, con pesos en safetensors (formato original Moonlight) y builds GGUF para llama.cpp en un repositorio separado. Está pensado para escenarios de retrieval-augmented generation con énfasis en calibración y abstención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo DeepSeek-V3 con atención MLA |
| Parametros totales | 15.960.111.936 (≈16B) |
| Parametros activos | ≈3B (64 expertos enrutados, con expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ2_XXS (6,08 GB), IQ3_XXS (8,06 GB, recomendada), IQ4_XS (9,67 GB); pesos originales en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (27 shards, 31,9 GB), GGUF, tokenizer tiktoken.model con código remoto |

## Arquitectura y entrenamiento

El modelo base, Moonlight-16B-A3B-Instruct, emplea una arquitectura MoE con atención Multi-head Latent Attention (MLA) al estilo DeepSeek-V3, con 16B parámetros totales y unos 3B activos. Moon-Beam conserva esa arquitectura y los pesos en el layout original de Moonlight, con 27 shards safetensors y el tokenizer tiktoken junto con su código remoto.

El ajuste fino es un QLoRA de rango 16 aplicado sobre la atención MLA, los expertos compartidos y la capa densa, manteniendo congelados los 64 expertos enrutados. Se entrenó una época en una única GPU de 12 GB sobre 2.198 ejemplos generados por Claude Haiku a partir de pasajes de las 21 tablas no sanitarias de Tablinum-2. La composición del dataset fue: 72% ejemplos de respuesta (pregunta con el pasaje dorado oculto entre distractores cercanos, con respuesta fundamentada), 17% preguntas abiertas o casi abiertas (how-to sin referencias o con pasajes relacionados que no responden) y 11% ejemplos de declinación (búsquedas de hechos —nombre, número o fecha— que los pasajes no contienen). Las tablas sanitarias nunca salieron de la máquina. El proceso requirió tres rondas: el piloto aprendió a declinar todo y la segunda ronda respondía todo de forma breve y segura; la tercera, con la receta descrita, equilibra utilidad y honestidad.

## Capacidades

- Generación de texto conversacional en inglés.
- Respuesta fundamentada en pasajes recuperados (retrieval-augmented generation) sobre el engram Tablinum-2.
- Calibración y abstención: declina responder cuando los pasajes no contienen el dato solicitado, especialmente en búsquedas de hechos.
- Respuesta a preguntas how-to sin referencias, con respuestas reales.
- Búsqueda única sobre las 26 tablas del engram sin enrutamiento por dominio; el pasaje del sujeto correcto aparece en el top 3 en el 95% de las preguntas.
- Razonamiento matemático de cadena corta (con degradación respecto al base).
- Conocimiento general tipo MMLU-Pro (con degradación en formato de respuesta).
- No se documentan tool calling, function calling, capacidades de agente, visión ni audio en la información disponible.

## Casos de uso

- Asistente de conocimiento factual con abstención: el modelo lee pasajes recuperados del engram y responde solo cuando contienen la respuesta, declinando en caso contrario; adecuado para dominios donde una respuesta errónea con seguridad es peor que un "no lo sé".
- Búsqueda aumentada sobre corpus estructurado: con una sola búsqueda sobre las 26 tablas del engram y sin router por dominio, se puede montar un pipeline RAG simple que cubre múltiples materias con el 95% de acierto en top 3.
- Atención al cliente con base documental: respuestas fundamentadas en pasajes de soporte, con declinación controlada cuando la documentación no cubre la consulta.
- Despliegue en hardware de consumo: la build IQ3 de 8 GB permite ejecutar el modelo en GPU de gama media o incluso en CPU con llama.cpp, habilitando asistentes locales con conocimiento recuperable.
- Evaluación de calibración en LLM: útil como referencia para estudiar el equilibrio entre responder correctamente y abstenerse, con métricas publicadas de EngramBench, SimpleQA y AA-Omniscience.
- Sistemas de preguntas y respuestas sobre documentación técnica o normativa, donde se prioriza la fidelidad al pasaje fuente sobre la cobertura.
- Prototipado de asistentes honestos en entornos con recursos limitados (una sola GPU de 12 GB para entrenamiento, 8 GB para inferencia cuantizada).

## Benchmarks y rendimiento

Datos publicados en la model card (build IQ3, emparejado por pregunta, calificado por Claude Haiku):

| Benchmark | Moonlight sin entrenar (closed-book → con engram) | Moon-Beam (closed-book → con engram) | Aciertos / errores con engram |
|---|---:|---:|---:|
| EngramBench 502, 26 tablas | −58,6 → +65,1 | −46,8 → +73,3 | 406 / 38 (sin entrenar: 406 / 79) |
| SimpleQA-verified 1000 | −88,6 → +17,7 | −36,0 → +34,9 | 504 / 155 (sin entrenar: 548 / 371) |
| AA-Omniscience test 400 | −75,5 → −42,5 | −57,2 → −16,5 | 78 / 144 (sin entrenar: 96 / 266) |

El índice se calcula como 100 × (correctas − incorrectas) / n.

Habilidad general (IQ3, mismo prompt para ambos):

| Benchmark | Moonlight sin entrenar | Moon-Beam |
|---|---:|---:|
| GSM8K (400, cadena corta) | 83,5% | 71,8% |
| MMLU-Pro (700, 14 × 50, zero-shot letra) | 36,9% | 31,7% (35,8% sobre las 619 respondidas con letra) |

Calidad de cuantización (KLD frente a los pesos BF16, chat / wiki; mismo top-1; EngramBench tabla propia; SimpleQA con engram):

| GGUF | Tamaño | KLD chat / wiki | Mismo top-1 | EngramBench | SimpleQA |
|---|---:|---:|---:|---:|---:|
| IQ2_XXS | 6,08 GB | 0,114 / 0,235 | 89,1% | +73,7 | +31,6 |
| IQ3_XXS (recomendada) | 8,06 GB | 0,027 / 0,061 | 95,0% | +74,1 | +34,9 |
| IQ4_XS | 9,67 GB | 0,006 / 0,015 | 97,5% | +71,7 | +37,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8 GB con IQ3_XXS (recomendada), 6 GB con IQ2_XXS y 10 GB con IQ4_XS. Los pesos BF16 completos ocupan 31,9 GB.
- GPU recomendadas: una RTX 4090 (24 GB) ejecuta con holgura cualquiera de las builds GGUF; una GPU de 12 GB (por ejemplo RTX 3060) cubre IQ3_XXS e IQ4_XS. Para BF16 se requiere una A100 o H100 de 40/80 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando las builds cuantizadas; también es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (builds GGUF), transformers con trust_remote_code, text-generation-inference (tag endpoints_compatible). No se documentan otras opciones en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Moon-Beam-16B-A3B | ≈16B | ≈3B | no disponible | MIT | en | safetensors + GGUF |
| Moonlight-16B-A3B-Instruct (base) | ≈16B | ≈3B | no disponible | MIT | en | safetensors |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base: Moon-Beam mejora la calibración (índice +73,3 frente a +65,1 en EngramBench con engram; +34,9 frente a +17,7 en SimpleQA) a costa de habilidad general (GSM8K 71,8% frente a 83,5%; MMLU-Pro 31,7% frente a 36,9%). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación de habilidad general: el ajuste fino reduce el rendimiento matemático (GSM8K 83,5% → 71,8%) y el formato en opción múltiple; el razonamiento matemático es más corto y omite pasos. Para matemáticas de varios pasos se recomienda el modelo base o enrutar a una herramienta.
- Dependencia del engram: el conocimiento proviene de la recuperación sobre Tablinum-2; fuera de ese corpus el modelo no aporta conocimiento adicional propio.
- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés.
- Riesgo de alucinación: aunque el entrenamiento prioriza la abstención, sigue siendo un modelo generativo y puede responder de forma incorrecta cuando los pasajes son ambiguos; el 11% de ejemplos de declinación no garantiza abstención perfecta.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Contexto: la longitud de contexto no está especificada; conviene verificar en el modelo base antes de usos con ventanas largas.
- Licencia MIT: permite uso comercial, pero el modelo deriva de Moonlight-16B-A3B-Instruct, cuyas condiciones conviene revisar.
- Entrenamiento limitado: una época sobre 2.198 ejemplos en una sola GPU de 12 GB; el alcance de la calibración está acotado al dominio de las 21 tablas no sanitarias.
- Las tablas sanitarias de Tablinum-2 no se usaron en entrenamiento, por lo que el comportamiento sobre ese dominio no está validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tablinum/Moon-Beam-16B-A3B
- GGUF: https://huggingface.co/tablinum/Moon-Beam-16B-A3B-GGUF
- Dataset Tablinum-2: https://huggingface.co/datasets/tablinum/tablinum-2
- Colección Moon-Beam: https://huggingface.co/collections/tablinum/moon-beam-6ae64ea51cef0d52d1461fc2
- Colección Lite-Beam: https://huggingface.co/collections/tablinum/lite-beam-6ad61ee3f54fc02b5d33af93
- Modelo base: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
