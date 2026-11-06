# youngjr1232/tariff-classifier-qwen3-4b

## Resumen

Tariff classifier es un modelo especializado en la clasificación arancelaria de Estados Unidos: dado un producto descrito en lenguaje natural junto con evidencia recuperada (cinco resoluciones previas de la CBP y veinte líneas candidatas del HTSUS), devuelve el código arancelario de 10 dígitos que la Oficina de Aduanas y Protección Fronteriza (CBP) asignaría. Lo publica el usuario youngjr1232 como un ajuste LoRA fusionado sobre Qwen/Qwen3-4B-Instruct-2507, con 4.022.468.096 parámetros y licencia Apache 2.0.

El modelo resuelve un problema muy concreto y de alto coste operativo: la determinación del código HTSUS (Harmonized Tariff Schedule of the United States) entre las aproximadamente 19.800 líneas vigentes. No es un clasificador genérico ni un asistente conversacional, sino un componente dentro de un flujo supervisado por humanos, entrenado explícitamente para responder con una única línea en formato `CODE: XXXX.XX.XX.XX` y sin texto de razonamiento.

Su relevancia radica en el resultado medido: sobre 500 resoluciones de la CBP emitidas entre agosto de 2025 y octubre de 2026, alcanza un 59,8% de acierto exacto en el código de 10 dígitos, frente al 42,0% del Qwen3-4B base y al 71,6% de Claude Opus 5.5, con un coste por clasificación de aproximadamente 0,0002 dólares de tiempo de H100 frente a 0,034 dólares del modelo frontera. Es, por tanto, un caso de destilación de dominio mediante recuperación aumentada más ajuste fino, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste LoRA r=16 fusionado sobre el modelo base |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones estándar de la familia Qwen3, no verificadas para este ajuste) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros, y se ajusta mediante LoRA con rango 16 aplicado a todas las capas lineales, en precisión bf16 y sobre GPUs H100 en Modal. Los pesos liberados corresponden al tercer intento de entrenamiento: continuación del segundo intento con tasa de aprendizaje 5e-5 sobre 6.480 resoluciones adicionales, 488 justificaciones verificadas (etiquetas de la CBP, explicación redactada por Opus y filtrada por un juez Codex que solo conserva las fundamentadas) y repetición de ejemplos solo de código. El modelo responde directamente, sin cadena de razonamiento.

El corpus de entrenamiento son 27.841 resoluciones CBP CROSS (el corpus de Hugging Face `orlandowhite/hts-cross-rulings` más 6.480 resoluciones descargadas de CROSS). Cada ejemplo contiene un único producto, un código de 10 dígitos vigente y descripciones tomadas literalmente de los hechos de cada resolución, con eliminación de toda frase que nombre un código, una partida o la conclusión. Cada ejemplo incorpora el mismo tipo de evidencia recuperada que recibe en inferencia, construida exclusivamente con resoluciones anteriores a la suya para evitar fuga de información. Las etiquetas proceden únicamente de resoluciones de la CBP y del arancel de la USITC, nunca de un modelo profesor.

La innovación técnica principal no está en la arquitectura sino en el protocolo: el modelo está diseñado para operar siempre con recuperación aumentada. Sin el paso de recuperación no funciona en absoluto; con él, el ajuste LoRA aporta +17,8 puntos sobre el modelo base con idéntica evidencia.

## Capacidades

- Clasificación arancelaria: devuelve un código HTSUS de 10 dígitos en una sola línea con el formato `CODE: XXXX.XX.XX.XX`, pudiendo responder cualquiera de las ~19.800 líneas vigentes.
- Consumo de evidencia recuperada: integra en su decisión cinco resoluciones previas de la CBP con sus códigos y veinte líneas candidatas del HTSUS proporcionadas en el prompt.
- Respuesta directa sin razonamiento: no genera texto explicativo ni cadena de pensamiento; está entrenado para emitir solo el código.
- Inglés únicamente: las descripciones de producto y la evidencia deben estar en inglés.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking de forma declarada en la información disponible.
- No señala información faltante: el modelo nunca indica que le falta contexto para clasificar.

## Casos de uso

- Clasificación asistida en comercio internacional: un operador de aduanas introduce la descripción del producto y el sistema adjunta las cinco resoluciones CBP y las veinte líneas candidatas recuperadas; el modelo propone el código de 10 dígitos y un especialista humano lo valida antes de presentar la declaración.
- Triaje de expedientes en despachos aduaneros: dado el volumen de clasificaciones diarias, el modelo preclasifica cada producto y ordena la revisión humana por candidato, reduciendo el tiempo dedicado a los casos rutinarios.
- Generación de borradores de dictámenes arancelarios: el código propuesto sirve como punto de partida documentado, con las resoluciones previas recuperadas como respaldo citable en el expediente.
- Auditoría de clasificaciones históricas: se reprocesan descripciones de productos ya declarados y se comparan con el código asignado para detectar discrepancias que justifiquen una revisión.
- Formación de clasificadores junior: el modelo actúa como referencia interna que muestra qué resoluciones previas sustentan cada código, siempre con supervisión de un experto.
- Evaluación comparativa de proveedores: al ser un componente barato (0,0002 dólares por clasificación en lotes de 16 en H100), permite medir el coste marginal de escalar la preclasificación frente a usar un modelo frontera.
- Integración en pipelines de comercio electrónico: para catálogos con descripciones en inglés, preasignar códigos candidatos antes de la revisión aduanera formal, con el paso de recuperación como requisito obligatorio.

## Benchmarks y rendimiento

Evaluación sobre 500 resoluciones de la CBP emitidas entre agosto de 2025 y octubre de 2026, posteriores a todas las usadas en entrenamiento, con descripciones en palabras de la propia CBP y la respuesta eliminada. Todos los modelos recibieron mensajes idénticos y la misma evidencia recuperada; el código correcto estaba entre los 20 candidatos en el 80% de los ítems.

| Código exacto de 10 dígitos | Puntuación | IC 95% |
|---|---|---|
| Solo recuperación (mejor candidato) | 38,0% | 33,9–42,3 |
| Qwen3-4B-Instruct-2507 base | 42,0% | 37,8–46,4 |
| Este modelo | 59,8% | 55,4–64,0 |
| Claude Opus 5.5 (thinking adaptativo, esfuerzo alto) | 71,6% | 67,5–75,4 |

Diferencias emparejadas: este modelo menos el base, +17,8 puntos (IC 95% +13,6 a +22,0); menos Opus, −11,8 puntos (−16,0 a −7,6). Coste aproximado de 0,0002 dólares de tiempo de H100 por clasificación en lotes de 16, frente a 0,034 dólares de Opus. Sin recuperación, el modelo obtiene 0,0% en el benchmark ATLAS (Opus 5.5: 41,0%).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4,02B parámetros a 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 8,1 GB.
- En cuantización de 8 bits cabría en torno a 4-5 GB y en 4 bits en torno a 2,5-3 GB, aunque el autor no publica versiones cuantizadas ni verifica su calidad.
- GPU recomendadas: H100 para el rendimiento medido por el autor; A100 40/80 GB y RTX 4090 (24 GB) son suficientes para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y previsiblemente en tarjetas de 12-16 GB con cuantización, aunque sin validación publicada.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `dtype="bfloat16"`, `device_map="auto"` y generación greedy; el autor no documenta soporte verificado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible de forma directa; el autor reporta un coste de 0,0002 dólares de H100 por clasificación en lotes de 16, lo que sitúa el throughput en el orden de decenas de clasificaciones por segundo por GPU en ese régimen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acierto exacto (500 resoluciones CBP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tariff classifier (este modelo) | 4,02B | No disponible | 59,8% | Apache 2.0 | Hugging Face, pesos safetensors |
| Qwen3-4B-Instruct-2507 (base) | 4B | No disponible | 42,0% | Apache 2.0 | Hugging Face |
| Claude Opus 5.5 | No disponible | No disponible | 71,6% | Propietaria | API comercial |
| Solo recuperación (baseline) | No aplica | No aplica | 38,0% | No aplica | No aplica |

La comparación relevante es doble: frente al modelo base, el ajuste LoRA aporta casi 18 puntos con la misma evidencia; frente a Opus, pierde 11,8 puntos pero cuesta unas 170 veces menos por clasificación. El modelo no compite en conocimiento general, sino en una tarea cerrada con recuperación obligatoria.

## Limitaciones y advertencias

- Dependencia total de la recuperación: sin el paso de recuperación aumenta, el modelo obtiene 0,0% en ATLAS; usarlo en modo closed-book produce resultados inútiles.
- Un solo benchmark y una sola semilla de entrenamiento por ejecución, según el propio autor; la incertidumbre sobre la generalización es alta.
- Las etiquetas siguen el HTSUS vigente; las resoluciones cuyos códigos ya no existen se descartaron, lo que introduce un sesgo hacia el arancel actual y limita la utilidad histórica.
- El modelo nunca señala información faltante: no advierte cuando la descripción es ambigua o insuficiente, lo que exige validación humana obligatoria.
- Con 4B parámetros no retiene códigos raros con la fiabilidad de un modelo frontera; los errores se concentran previsiblemente en líneas poco representadas.
- Solo inglés: descripciones o evidencia en otros idiomas quedan fuera de su dominio declarado.
- No es una determinación aduanera automatizada: el autor lo describe explícitamente como un componente de un flujo supervisado por humanos.
- Riesgo de alucinación de códigos plausibles pero incorrectos, mitigado parcialmente por el formato cerrado de respuesta y la lista de candidatos.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal de la clasificación arancelaria recae siempre en el declarante.
- Sin descargas ni valoraciones en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youngjr1232/tariff-classifier-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Corpus de resoluciones CBP CROSS: https://huggingface.co/datasets/orlandowhite/hts-cross-rulings
- Repositorio del proyecto `inno-tariff-slm` (referenciado en la model card; script `scripts/eval_openset.py`, protocolo en `docs/evals/results-v2.md`): no disponible como URL verificable en la información proporcionada
- Benchmark ATLAS (citado en la model card): no disponible como URL en la información proporcionada
