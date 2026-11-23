# thurstonpowers/xll-spo-nemotron-4b

## Resumen

XLL SPO Nemotron 4B es un ajuste fino completo (full fine-tune) de pesos del modelo NVIDIA Nemotron-3 Nano 4B, desarrollado por el usuario thurstonpowers. Su propósito es muy concreto: extraer relaciones legales orientadas a actores (sujeto-predicado-objeto, SPO) a partir de textos de estatutos y regulaciones federales y estatales de Estados Unidos. Dado un fragmento de ley, el modelo devuelve un array JSON de aserciones donde el sujeto es el actor semántico que ostenta un permiso, derecho u obligación, el predicado preserva la modalidad y la negación, y el objeto es la entidad o significado definido.

La versión v1.1 introduce un contrato de actor que rompe la compatibilidad con el checkpoint v3 anterior (orientado a provisiones), que sigue siendo citable por hash de commit en el historial del repositorio. El modelo parte de una arquitectura Nemotron-H (tag `nemotron_h` en Hugging Face) con aproximadamente 3.970 millones de parámetros y licencia NVIDIA Nemotron Open Model License, lo que condiciona su uso comercial.

Es relevante para equipos que construyen pipelines de extracción de información legal y necesitan convertir prosa normativa en estructuras JSON trazables, con citas de evidencia exactas. No obstante, sus métricas de acuerdo estricto (SPO F1 de 0,4237 en el holdout de desarrollo) indican que debe tratarse como un componente de un pipeline con revisión humana, no como un extractor autónomo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h`, `custom_code` en Transformers) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo más largo de entrenamiento fue de 19.452 tokens; la generación de evaluación usa `max_new_tokens=16384`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de carga usa `bfloat16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | NVIDIA Nemotron Open Model License (`nvidia-nemotron-open-model-license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de todos los parámetros sobre `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, un transformer de la familia Nemotron-H con aproximadamente 3.970 millones de parámetros. El entrenamiento se realizó sobre 7.462 ejemplos (4.660 únicos, con los objetivos reparados repetidos tres veces), durante 2 épocas y 3.732 actualizaciones, con tasa de aprendizaje 5e-6, calentamiento de 125 actualizaciones y decaimiento coseno hasta 0,1, batch efectivo de 4 y semilla 102301. El ejemplo más largo alcanzó 19.452 tokens sin truncamiento y el entrenamiento finalizó el 12 de octubre de 2026 con política de reinicio `fresh_only` (sin reanudación automática).

Los datos proceden del subárbol `v1.1/` del dataset `thurstonpowers/xll-spo-dataset` (`v1.1/nemotron/train.jsonl`), con una partición de desarrollo disjunta por grupo de parte del CFR. El contrato de inferencia es estricto: un prompt de sistema congelado (`SYSTEM_PROMPT.txt`, sha256 `608281b35038ea922e4290cba6487afbd720adeac6200af534289d89489f913e`) y un mensaje de usuario con el formato exacto `<section_text>\n\n{texto}</section_text>`, sin preprocesamiento de la fuente (sin etiquetado POS ni anotación). La decodificación usada en evaluación es greedy. La innovación técnica principal no está en la arquitectura, sino en el contrato de salida: cada aserción incluye `subject` (raw/citation/resolved_to), `predicate_text`, `object` u `object_literal`, una `quote` exacta con localizador, `negated`, `qualifiers`, `participants` y `unresolved_reason`.

## Capacidades

- Extracción de relaciones sujeto-predicado-objeto (SPO) orientadas a actores en textos legales.
- Preservación de modalidad (permiso, obligación, definición, otros) y de la negación en el predicado.
- Generación de JSON estructurado con citas de evidencia exactas y localizadores.
- Distinción entre objeto entidad (`object`) y objeto literal (`object_literal`).
- Anotación de cualificadores, participantes y motivos de no resolución.
- Conversación con plantilla de chat (tag `conversational`) y prompt de sistema congelado.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Extracción estructurada de normativa federal: dado un fragmento de estatuto o regulación del CFR, el modelo devuelve un array JSON de aserciones SPO con citas exactas, lo que permite poblar bases de datos de obligaciones y permisos con trazabilidad a la fuente.
- Construcción de grafos de conocimiento legal: las aserciones con `subject`, `predicate_text` y `object` pueden mapearse a nodos y aristas, y el campo `resolved_to` facilita la resolución de entidades entre secciones.
- Auditoría de cumplimiento normativo: el campo `negated` y los `qualifiers` permiten distinguir prohibiciones de obligaciones y filtrar condiciones de aplicación, útil en revisiones de compliance sobre textos regulatorios.
- Enriquecimiento de corpus para búsqueda legal: las citas de evidencia exactas (99,5–100 % de spans exactos en los bins evaluados) permiten resaltar el pasaje que respalda cada aserción en una interfaz de consulta.
- Pre-anotación para revisores humanos: con SPO F1 de 0,4237 en el holdout, el modelo sirve como primer paso de anotación que un jurista revisa y corrige, reduciendo el trabajo manual en secciones de densidad media (F1 0,511 en el bin de 3–5 aserciones).
- Extracción de definiciones legales: aunque es la categoría más débil (F1 0,338), puede usarse para generar candidatos de términos definidos que después se validan contra el texto, dado que cada aserción incluye la cita literal.
- Procesamiento por lotes de regulaciones estatales: el formato de entrada es texto plano sin preprocesamiento, lo que simplifica la integración en pipelines existentes que ya dispongan de segmentación por secciones.

## Benchmarks y rendimiento

Evaluación sobre un holdout de desarrollo de 300 secciones del CFR revisadas, decodificación greedy y prompts congelados, con coincidencia superficial estricta normalizada (no adjudicación semántica):

| Métrica | Valor |
|---|---|
| Secciones con JSON válido | 298/300 (1 por tope de generación) |
| Aserciones predichas vs oro | 1.756 vs 1.893 |
| Spans de evidencia exactos | 1.750 |
| SPO F1 | 0,4237 |
| Precisión SPO | 0,4402 |
| Recall SPO | 0,4083 |
| F1 con cualificadores y participantes | 0,3025 |

Rendimiento por densidad de sección:

| Bin de densidad | Secciones | Precisión | Recall | F1 |
|---|---|---|---|---|
| 1–2 aserciones oro | 77 | 0,438 | 0,475 | 0,455 |
| 3–5 aserciones oro | 94 | 0,509 | 0,513 | 0,511 |
| 6+ aserciones oro | 127 | 0,422 | 0,385 | 0,402 |

Rendimiento por tipo de relación: permiso F1 0,478, obligación F1 0,440, otros F1 0,386, definición F1 0,338. La fundamentación de citas de evidencia es fuerte en todos los bins (99,5–100 % de spans exactos).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos (3.970 millones de parámetros), más memoria para el contexto; con `max_new_tokens=16384` el consumo de KV cache puede ser considerable.
- GPU recomendadas: no disponible en la información proporcionada; el ejemplo de la model card usa `.cuda()` sin especificar modelo de GPU.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 16 GB o más en bfloat16, aunque no está confirmado en la información disponible.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` y `AutoTokenizer` (requiere `custom_code` y `trust_remote_code`); otros motores como vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada solo incluye una comparación parcial con otros modelos sobre el mismo holdout de 300 secciones, pero la tabla está truncada en el texto disponible, por lo que no se pueden presentar los valores de los modelos comparados.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XLL SPO Nemotron 4B | 3.970 M | no disponible | NVIDIA Nemotron Open Model License | Hugging Face |
| NVIDIA Nemotron-3 Nano 4B (base) | ~4.000 M | no disponible | NVIDIA Nemotron Open Model License | Hugging Face |
| Alternativas de extracción legal SPO | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que las puntuaciones son métricas de acuerdo con referencias revisadas, no de precisión: las paráfrasis pueden no coincidir y una cita coincidente no prueba soporte ni completitud.
- SPO F1 de 0,4237 y F1 con cualificadores y participantes de 0,3025 indican un rendimiento moderado; se requiere revisión manual de la salida antes de cualquier uso posterior.
- Las secciones densas (6+ aserciones) son las más difíciles, con recall de 0,385, lo que implica pérdida de relaciones en textos complejos.
- Las definiciones son la categoría más débil (F1 0,338).
- Solo soporta inglés; no se declaran capacidades multilingües.
- El contrato de inferencia es rígido: prompt de sistema congelado con hash verificado, formato exacto de envoltura `<section_text>` y decodificación greedy en la evaluación; desviarse puede degradar los resultados.
- La licencia NVIDIA Nemotron Open Model License impone condiciones específicas para uso comercial; debe revisarse antes de desplegar en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, aunque la coincidencia superficial estricta y la revisión manual recomendada sugieren cautela.
- Sesgos conocidos: no disponible.
- El modelo v1.1 rompe la compatibilidad con el checkpoint v3 anterior; los pipelines que referencien el checkpoint-2400 deben fijar el commit correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-spo-nemotron-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-spo-dataset
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Prompt de sistema (`SYSTEM_PROMPT.txt`): https://huggingface.co/thurstonpowers/xll-spo-nemotron-4b/blob/main/SYSTEM_PROMPT.txt
- Informe de entrenamiento (`TRAINING_REPORT.json`): https://huggingface.co/thurstonpowers/xll-spo-nemotron-4b/blob/main/TRAINING_REPORT.json
- Informe de evaluación (`EVAL_REPORT.json`): https://huggingface.co/thurstonpowers/xll-spo-nemotron-4b/blob/main/EVAL_REPORT.json
