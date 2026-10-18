# Tegh25/satellite-anomaly-reporter-qwen3-4b-lora

## Resumen

`Tegh25/satellite-anomaly-reporter-qwen3-4b-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo denso `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario Tegh25 bajo licencia Apache 2.0. No es un detector: es la mitad "explicativa" de un pipeline de dos etapas en el que un clasificador Random Forest decide si un segmento de telemetría de satélite es anómalo y este modelo redacta el informe de misión correspondiente a esa etiqueta.

La entrada no son señales crudas, sino las 15 características estadísticas precalculadas de un segmento (media, desviación típica, curtosis, asimetría, recuentos de picos, varianza de derivadas, irregularidad del muestreo) junto con la etiqueta `ANOMALY`/`NOMINAL`. La salida es una evaluación en prosa plana para el equipo de operaciones: qué estadísticos sustentan el juicio, la causa probable y el siguiente paso. El adaptador se destila a partir de informes generados por un modelo mayor (Claude Sonnet 5) sobre el conjunto OPSSAT-AD (2.123 segmentos de la nave OPS-SAT de la ESA).

Su relevancia es doble: por un lado demuestra una técnica de destilación de informes con puerta de calidad y pérdida calculada solo sobre los tokens del informe; por otro, cuantifica con intervalos de Wilson que un modelo de 4B con adaptador iguala a su profesor en cumplimiento de formato (100% frente a 100%) y supera claramente al modelo base con un prompt largo (41%). Es una pieza de cartera e investigación, no un componente para decisiones operativas de vuelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) + adaptador LoRA (PEFT) sobre `Qwen/Qwen3-4B-Instruct-2507` |
| Parámetros totales | 4B en el modelo base; adaptador LoRA de 0,1 GB en el repositorio |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (se hereda del modelo base) |
| Tipos de cuantización | Adaptador en safetensors; el ejemplo oficial carga la base en 4-bit NF4 (bitsandbytes) con `compute_dtype=float16` |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA); requiere descargar el modelo base por separado |
| Modelo base | `Qwen/Qwen3-4B-Instruct-2507` |
| Pipeline | `text-generation` (conversacional, un turno) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only denso de 4B parámetros (Qwen3-4B-Instruct-2507), ajustado mediante QLoRA: la base se cuantiza a 4 bits y solo se entrenan las matrices de bajo rango del adaptador. La pérdida se calcula únicamente sobre los tokens del informe generado, no sobre el prompt de entrada, de modo que el modelo aprende el estilo y la estructura del informe y no a reproducir las características numéricas de entrada. El adaptador espera un formato de prompt exacto: un mensaje de sistema que fija el rol de ingeniero de operaciones de nave y un mensaje de usuario con las 15 características más la etiqueta.

Los datos de entrenamiento son OPSSAT-AD: 2.123 segmentos de telemetría de la nave OPS-SAT de la ESA, cada uno descrito por 15 características de ingeniería (sin formas de onda crudas), con aproximadamente un 20% etiquetados como anómalos. El profesor fue Claude Sonnet 5, que generó un informe por segmento a partir de las características y la etiqueta; una pasada de ingeniería de prompts fijó el formato (prosa plana, sin Markdown, sin guiones largos, sin lenguaje sobre estadísticas del dataset) y una puerta de calidad descartó los informes que incumplían esas reglas. El detector asociado es un Random Forest con `class_weight="balanced"` y 300 árboles sobre las 15 características, entrenado con el split de entrenamiento proporcionado.

El elemento metodológico destacable es la separación estricta de responsabilidades: el modelo no detecta anomalías ni verifica la etiqueta que recibe, solo la explica. En la evaluación, el veredicto coincide con la etiqueta dada en el 100% de los casos en las tres variantes comparadas, lo que confirma que el modelo sigue la etiqueta en lugar de cuestionarla, incluidos los errores del detector.

## Capacidades

- Generación de texto en inglés con formato restringido: prosa plana, sin Markdown, sin guiones largos (em dash), sin truncamiento y sin lenguaje sobre estadísticas del dataset. Cumplimiento del 100% en la evaluación.
- Redacción de informes técnicos de operaciones a partir de datos tabulares numéricos: interpreta media, desviación típica, varianza, curtosis, asimetría, recuentos de picos y varianza de derivadas.
- Justificación basada en evidencia: cita qué estadísticos concretos sustentan la evaluación y descarta explícitamente falsos indicios (por ejemplo, una irregularidad de muestreo alta sin pico correspondiente en varianza).
- Cierre con recomendación operativa ("no action needed; continue routine monitoring" frente a pasos de escalado).
- Longitud controlada: media de 158 palabras por informe, con `max_new_tokens=450` en el ejemplo oficial.
- Ejecución determinista reproducible con decodificación greedy (`do_sample=False`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso con agentes ni planificación.
- No tiene capacidades de visión, audio ni multimodalidad.
- No procesa series temporales crudas: solo acepta las 15 características precalculadas.
- No detecta anomalías ni valida la etiqueta recibida.

## Casos de uso

- Generación automática de informes en un pipeline de dos etapas: el Random Forest marca un segmento como anómalo y este adaptador redacta el informe asociado. Es el uso para el que fue entrenado y el único validado en la model card.
- Triaje en centro de control: al recibir un flag, el operador obtiene en segundos un texto de 150-160 palabras que identifica los estadísticos relevantes y propone el siguiente paso, lo que reduce el tiempo de lectura de tablas de 15 features.
- Enriquecimiento de logs y tickets de incidencia: el informe puede anexarse al registro del segmento para que la revisión posterior no requiera recalcular características ni reinterpretar los números.
- Documentación post-paso para constancia de misión: generación de un texto homogéneo por cada flag, con formato estable (sin Markdown ni guiones largos), apto para ingestión directa en sistemas de ticketing o wikis internas.
- Investigación sobre destilación de informes técnicos: el par profesor (Sonnet 5) / estudiante (Qwen3-4B + LoRA) con puerta de calidad y evaluación con intervalos de Wilson sirve como plantilla reproducible para otros dominios con datos tabulares y etiquetas.
- Pruebas y formación de operadores: uso de informes generados en simulacros o sesiones de entrenamiento para contrastar el razonamiento del operador frente a una narración plausible, siempre marcando el contenido como no verificado.
- Evaluación comparativa de adaptadores: banco de pruebas para medir cumplimiento de formato y tasa de números no soportados en modelos pequeños con prompts largos, dado que la model card publica la comparación con el modelo base sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una evaluación de calidad de generación sobre 158 segmentos de test nunca usados en entrenamiento ni en selección de checkpoint: 79 anómalos y 79 nominales, muestra equilibrada extraída de los 520 segmentos de test que pasaron la puerta de calidad e incluyendo los 18 errores del detector presentes en esos 520. Todas las variantes generan con decodificación greedy.

| Métrica | Profesor (Sonnet 5) | Este modelo | Modelo base, con prompt |
|---|---|---|---|
| Conformidad de formato (sin Markdown, em dash, lenguaje de dataset ni truncamiento) | 100% [98-100] | 100% [98-100] | 41% [33-48] |
| Informes con guiones largos (em dash) | 0% | 0% | 59% [52-67] |
| Palabras medias | 164 | 158 | 156 |
| Informes con al menos un número ausente del prompt | 6% [3-10] | 6% [3-10] | 1% [0-4] |
| Veredicto coincide con la etiqueta dada | 100% | 100% | 100% |

Métricas del detector Random Forest asociado, sobre los 529 segmentos de test: accuracy 0,964, precisión 0,927 y recall 0,903, con 19 errores. Los intervalos son del 95% según Wilson y describen la calidad de generación sobre una muestra equilibrada, no tasas poblacionales.

## Requisitos de hardware

- VRAM estimada para inferencia con la base en 4-bit NF4 (configuración del ejemplo oficial): aproximadamente 3 GB de pesos más caché KV y overhead, en torno a 5-7 GB en total.
- VRAM estimada con la base en bf16/fp16: aproximadamente 8 GB de pesos, en torno a 10-12 GB en total según longitud de prompt y de salida.
- GPU recomendadas: A100 o H100 para servir en fp16 con concurrencia; L40S o A10G como alternativas de coste medio; RTX 4090 para desarrollo y evaluación con baja latencia.
- Cabe en GPU de consumo: sí. Con cuantización 4-bit funciona en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y en Apple Silicon con 16 GB de memoria unificada. En bf16 requiere 12 GB o más.
- Despliegue: `transformers` + `peft` (ruta oficial documentada), vLLM con soporte de adaptadores LoRA, y TGI. Para `llama.cpp` u Ollama es necesario fusionar el adaptador con `merge_and_unload()` y convertir el modelo resultante a GGUF.
- El adaptador en sí ocupa 0,1 GB, por lo que el requisito real lo determina el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia de carga, la generación está acotada a 450 tokens nuevos y produce informes de unas 158 palabras de media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conformidad de formato | Números no soportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA) | 4B | no disponible | 100% [98-100] | 6% [3-10] | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| Qwen3-4B-Instruct-2507 con prompt detallado | 4B | no disponible | 41% [33-48] | 1% [0-4] | Apache 2.0 (modelo base) | Público en HuggingFace |
| Profesor: Claude Sonnet 5 | no disponible | no disponible | 100% [98-100] | 6% [3-10] | propietaria | Solo API |
| Otros adaptadores públicos para informes de telemetría de satélites | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base sin adaptador: mismo tamaño y misma licencia, pero el adaptador multiplica el cumplimiento de formato sin necesidad de un prompt de estilo largo ni de post-procesado. Frente al profesor, el adaptador iguala formato, longitud y tasa de números no soportados con 4B parámetros, lo que abarata la inferencia. La ventaja del modelo base en "números no soportados" (1%) se explica, según la model card, por copiar literalmente del prompt, no por mayor fidelidad analítica.

## Limitaciones y advertencias

- No es un detector y no verifica la etiqueta que recibe: en el 100% de los casos el veredicto coincide con la etiqueta dada, incluidos los errores del Random Forest. Un flag incorrecto produce un informe plausible sobre un evento inexistente.
- Un 6% de los informes contiene al menos un número que no aparece en el prompt, es decir, una cifra inventada.
- Los informes son narrativas plausibles, no diagnósticos verificados. La propia model card excluye su uso en decisiones operativas de naves espaciales.
- Entrenado con solo 2.123 segmentos de una única nave (OPS-SAT de la ESA): riesgo de deriva de dominio con otros vehículos, otros regímenes de muestreo u otras 15 características distintas.
- Solo inglés. No hay soporte multilingüe, pese a que el modelo base sí lo tiene.
- Entrada limitada a características precalculadas: no admite formas de onda crudas ni series temporales.
- Formato de prompt rígido: el adaptador espera exactamente el mensaje de sistema y el diseño de usuario del entrenamiento; desviarse puede degradar el estilo y la estructura.
- Sesgos conocidos: no disponibles en la información proporcionada. No se han publicado evaluaciones de sesgo, toxicidad ni robustez.
- Licencia Apache 2.0, permisiva para uso comercial, pero la licencia no cubre la idoneidad técnica ni la responsabilidad sobre decisiones tomadas a partir de los informes.
- Adopción mínima (0 descargas, 1 like, actualizado en octubre de 2026) y sin mantenimiento documentado: no hay garantía de correcciones ni de soporte.
- La evaluación se realiza sobre una muestra equilibrada artificialmente (79/79) y está sesgada hacia incluir los errores del detector; las tasas no son extrapolables a la distribución real, con aproximadamente un 20% de anomalías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tegh25/satellite-anomaly-reporter-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset OPSSAT-AD (OPS-SAT, ESA): no disponible la URL en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
