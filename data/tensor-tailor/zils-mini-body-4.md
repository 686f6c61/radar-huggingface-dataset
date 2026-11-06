# tensor-tailor/zils-mini-body-4

## Resumen

W75-K (identificador de repositorio `tensor-tailor/zils-mini-body-4`) es un ajuste fino de tipo LoRA fusionado sobre el modelo `tensor-tailor/zils-mini-body-2`, denominado internamente "W75", desarrollado por el autor `tensor-tailor` para el pool de decisiones `d3-mini` de Zils, asociado a la subred 127 de Bittensor. No es un modelo generativo de propósito general, sino un "cuerpo de decisión": un modelo entrenado para emitir probabilidades de respuesta sobre preguntas de formato cerrado (elección múltiple, verdadero/falso, entailed/contradicted, respuesta extractiva corta), dentro del chasis `d3-mini` que reutiliza los tensores de lenguaje y visión de Qwen3.5-4B en bf16.

El modelo parte de los pesos publicados de W75 en la revisión `@195a13b2` y aplica un entrenamiento LoRA de un solo epoch sobre 49.136 filas de entrenamiento y 12.448 filas de regularización, con una función de pérdida puramente destilativa (KL entre las probabilidades del profesor y las del estudiante). Los profesores son otros cuerpos públicos del ecosistema Zils, elegidos por familia de preguntas según su Brier/RPS medio sobre las etiquetas reales. El resultado se fusiona en los pesos y se almacena en bf16.

Su relevancia es acotada pero específica: compite en un entorno de minería descentralizada donde el objetivo es maximizar la precisión calibrada en familias de tareas de razonamiento y comprensión, no la generación abierta. Con 4.539.265.536 parámetros totales y un tamaño de repositorio de 9,1 GB, se posiciona como un cuerpo de ~4,5B orientado a inferencia de decisión, con licencia Apache-2.0 y sin datos de benchmarks públicos más allá de las métricas internas del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (chasis Qwen3.5-4B: 32 capas de lenguaje con proyecciones de atención y Gated-DeltaNet, más tensores de visión) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible explícitamente; el entrenamiento limitó las filas a 2.048 tokens (las más largas se habrían descartado, no truncado) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; no se documentan GGUF, GPTQ, AWQ ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), con `custom_code` y tag `qwen3_5` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura del chasis `d3-mini`, que según la model card corresponde a Qwen3.5-4B: 32 capas de lenguaje con proyecciones de atención y Gated-DeltaNet, además de tensores de visión, todo en bf16. El ajuste fino se aplicó exclusivamente sobre las proyecciones de atención y Gated-DeltaNet de las 32 capas de lenguaje (152 matrices), con LoRA de rango 16, alpha 32, dropout 0,05, learning rate 5e-5 (warm-up lineal de 50 pasos y decaimiento coseno sobre el epoch), batch 8 con acumulación de gradiente 2, semilla 4343 y un único epoch de 3.849 pasos de optimizador. La LoRA se fusionó en los pesos; ningún otro tensor fue entrenado.

El entrenamiento es puramente destilativo: en cada fila se minimiza KL(profesor ‖ estudiante) contra las probabilidades precalculadas de un profesor público elegido por familia de preguntas, sin cross-entropy sobre etiquetas ni término Brier. Además se añade KL contra las probabilidades propias de W75 en 12.448 filas de regularización con peso 2,0. Los profesores son `1lock/zils-mini-astrid-m1`, `qhoenix/zils-mini-decision-v2`, `crabby-devil/zils-mini-decision-r16b`, `ANGExllL/zils-mini-senova-ft` y el propio W75, cada uno asignado a familias concretas (COPA, MNLI, QNLI, SciNLI, SQuAD 2.0, veridicality, DROP, FEVER, PUBHEALTH, MathQA, QASC, ROPES, PIQA, ToolACE sin herramienta, BoolQ, CosmosQA, Fig-QA, polaridad de Amazon y CoQA). Los profesores aportan solo probabilidades; ninguno de sus pesos está en el cuerpo final. La desviación relativa de los tensores de lenguaje respecto a Qwen/Qwen3.5-4B es 0,02943 (límite Zils 0,15) y respecto a W75 es 0,00947.

## Capacidades

- Emisión de probabilidades de respuesta para preguntas de formato cerrado en 19 familias: elección múltiple (PIQA, CosmosQA, QASC, MathQA, Fig-QA), verdadero/falso (BoolQ), entailment (MNLI, QNLI, SciNLI), respuesta extractiva (SQuAD 2.0, DROP, CoQA), verificación de hechos (FEVER, PUBHEALTH), polaridad de sentimiento (Amazon polarity), razonamiento sobre situaciones (ROPES, COPA) y veridicalidad (MegaVeridicality).
- Clasificación de uso de herramientas en formato ToolACE (variante sin herramienta), orientada a decidir si una consulta requiere invocar una función.
- Razonamiento de decisión calibrado: el entrenamiento con KL destilativa busca aproximar distribuciones de probabilidad, no generar texto libre.
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).
- Capacidades de visión: el chasis incluye tensores de visión de Qwen3.5-4B, pero el ajuste fino no entrenó tensores de visión y la model card no describe tareas multimodales concretas.
- Modo "thinking" o razonamiento multi-paso explícito: no disponible.
- Soporte de agentes: indirecto, limitado a la familia ToolACE de decisión de uso de herramientas.

## Casos de uso

- Enrutamiento de consultas en pipelines de agentes: usar el modelo para decidir si una petición requiere llamada a herramienta (familia ToolACE) antes de invocar un LLM generativo, reduciendo coste y latencia en el orquestador.
- Verificación de hechos en pipelines de RAG: el modelo puntúa pares pregunta-respuesta sobre FEVER y PUBHEALTH, lo que permite filtrar afirmaciones no respaldadas por el contexto recuperado antes de mostrarlas al usuario.
- Respuesta extractiva sobre documentos: con las familias SQuAD 2.0, DROP y CoQA, puede seleccionar la respuesta corta o el span relevante en tareas de lectura comprensiva sobre textos de Wikipedia, literatura o noticias.
- Clasificación de sentimiento y polaridad: la familia Amazon polarity permite construir un clasificador binario de opiniones en reseñas, útil para monitorización de reputación o análisis de feedback.
- Evaluación de implicación textual (NLI): con MNLI, QNLI y SciNLI, sirve para detectar contradicciones entre un documento y una hipótesis, por ejemplo en auditoría de resúmenes generados.
- Razonamiento sobre sentido común en asistentes: las familias PIQA, CosmosQA, QASC y COPA permiten responder preguntas de física cotidiana, causalidad y situaciones sociales, adecuadas para módulos de decisión en asistentes conversacionales.
- Selección de respuesta en sistemas de QA multiopción: con MathQA y Fig-QA, puede puntuar opciones en problemas aritméticos o de comprensión figurada, integrándose como reranker en un pipeline de examen automatizado.
- Participación en el pool de minería Zils (subred 127 de Bittensor): el modelo está diseñado como cuerpo candidato para la hotkey UID 63, de modo que mineros pueden evaluarlo contra el examen de Zils y comparar su precisión calibrada con la de otros cuerpos.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas internas del autor sobre sus propios conjuntos de desarrollo, puntuadas con el grader open-source de Zils (media de 5 secretos), no sobre el examen oficial de Zils.

| Métrica (conjunto propio) | W75-K | W75 | astrid-m1 |
|---|---|---|---|
| mini_dev_gold (299 ítems, familias KNOWN) | 82,32 | 79,67 | 84,87 |
| mini_combo50 (999 ítems) | 76,05 | 75,13 | no disponible |
| Estimación combinada KNOWN + NEW | +1,44 vs W75 | referencia | no disponible |
| Bloque MINI retenido | +0,61 vs W75 | referencia | no disponible |
| Familias guardián (6) | 4 iguales o superiores; dos a -0,0002 y -0,0001 | referencia | no disponible |
| Slice de dominio no visto (500 filas) | -1,10 vs W75 | referencia | no disponible |
| Test completo de dominio no visto (226 ítems) | -0,24 vs W75 | referencia | no disponible |
| Proxy de bloque nuevo (2.100 ítems) | -1,17 vs W75 | referencia | no disponible |
| Categoría KNOWN de lenguaje | 76,5 (desde 79,5) | 79,5 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantización; RTX 3090 (24 GB) también es viable.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización (no documentada por el autor), podría caber en GPUs de 8-12 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: al tratarse de un modelo con `custom_code` y tag `qwen3_5`, requiere cargar código personalizado con `trust_remote_code=True`; es compatible con transformers y previsiblemente con vLLM si soporta la arquitectura Qwen3.5, pero no se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| tensor-tailor/zils-mini-body-4 (W75-K) | 4,54B | no disponible (entrenado con filas ≤2.048 tokens) | Apache-2.0 | Cuerpo de decisión destilado para el pool d3-mini de Zils | Hugging Face, safetensors bf16 |
| tensor-tailor/zils-mini-body-2 (W75) | no disponible | no disponible | Apache-2.0 | Cuerpo de decisión predecesor, mismo chasis | Hugging Face |
| 1lock/zils-mini-astrid-m1 | no disponible | no disponible | Apache-2.0 | Cuerpo de decisión; profesor de W75-K y mejor en mini_dev_gold (84,87 vs 82,32) | Hugging Face |
| zils-ai/d3-mini-4.5b-v1 | ~4,5B (perfil) | no disponible | Apache-2.0 | Repositorio base fijado por Zils para el perfil d3-mini-4.5b-v1 (base Qwen/Qwen3.5-4B) | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo: está entrenado para emitir probabilidades sobre opciones cerradas; usarlo para generación libre de texto produciría resultados no representativos de su entrenamiento.
- Degradación en dominio no visto: el autor reporta -1,10 en el slice de dominio no visto (500 filas), -0,24 en el test completo (226 ítems) y -1,17 en el proxy de bloque nuevo, todos peores que W75.
- Regresión en la categoría KNOWN de lenguaje: cae de 79,5 a 76,5 (-3,0) respecto a W75.
- Riesgo de sobreajuste a las familias de entrenamiento: la mejora se concentra en mini_dev_gold (+2,64) y mini_combo50 (+0,92), mientras que las familias guardián quedan prácticamente planas.
- Sesgos: no documentados por el autor; los datos de entrenamiento provienen de datasets públicos con posibles sesgos de dominio (Wikipedia, noticias, reseñas de Amazon), no evaluados en la model card.
- Alucinación: el formato de decisión cerrada reduce el riesgo de texto inventado, pero las probabilidades pueden estar mal calibradas fuera de las distribuciones de entrenamiento; el autor no publica métricas de calibración externas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datasets fuente con cláusulas share-alike (CC BY-SA) imponen condiciones solo a la redistribución del texto original, no a estos pesos según el autor; conviene verificar cada fuente si se redistribuyen datos.
- Dependencia de `custom_code`: requiere `trust_remote_code=True` y revisión del código incluido en el repositorio antes de desplegarlo en producción.
- Sin datos de benchmarks públicos ni de idiomas soportados: la evaluación independiente es imposible con la información disponible.
- Fecha de creación del repositorio (2026-11-06) y cero descargas/likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-4
- Modelo base (W75): https://huggingface.co/tensor-tailor/zils-mini-body-2
- Profesor astrid-m1: https://huggingface.co/1lock/zils-mini-astrid-m1
- Profesor decision-v2: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Profesor decision-r16b: https://huggingface.co/crabby-devil/zils-mini-decision-r16b
- Profesor senova-ft: https://huggingface.co/ANGExllL/zils-mini-senova-ft
- Repositorio base del perfil d3-mini: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Versión r5 del perfil d3-mini: https://huggingface.co/zils-ai/d3-mini-4.5b-zils-r5
