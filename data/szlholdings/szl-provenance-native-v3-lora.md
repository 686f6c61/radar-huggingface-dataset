# SZLHOLDINGS/szl-provenance-native-v3-lora

## Resumen

`szl-provenance-native-v3-lora` es un adaptador LoRA desarrollado por SZLHOLDINGS sobre el modelo base `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1`, una variante de la familia Qwen 3.5 con 0,8 mil millones de parámetros. El adaptador se entrena específicamente para que el modelo cite recibos (receipts) con su hash sha256, verifique digests, rechace afirmaciones cuando el digest no coincide y se abstenga de responder cuando no dispone de un recibo que respalde la respuesta. El objetivo declarado es el "provenance-native": que cada afirmación del modelo vaya acompañada de un bloque de procedencia verificable.

La relevancia del adaptador no reside en su rendimiento general, sino en que documenta de forma inusualmente honesta un problema central de los modelos pequeños: la diferencia entre emitir un formato de procedencia y estar realmente fundamentado en evidencia. La model card incluye mediciones con conjuntos de prueba contaminados (in-distribution) y con un conjunto held-out de 20 sondas, además de una re-puntuación posterior (R1) que corrige lecturas anteriores. Los resultados held-out muestran que el adaptador emite el bloque de procedencia en 18/20 sondas no vistas, pero cita artefactos inventados en 14/20 y solo logra abstención limpia en 5/20.

El adaptador es de tipo PEFT, se distribuye en safetensors y su licencia es "other". No hay información sobre idiomas soportados ni sobre el pipeline de inferencia. El repositorio ocupa 0,0 GB según Hugging Face, lo que es coherente con un adaptador LoRA de rango 16 sobre un modelo de 0,8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen 3.5 de 0,8B |
| Parámetros totales | no disponible (adaptador LoRA con r=16, alpha=32 sobre base de 0,8B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre el modelo base `szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1`, que pertenece a la familia Qwen 3.5 con 0,8B de parámetros. La receta de entrenamiento declarada es de 3 épocas con learning rate 1e-4, descrita por el autor como la "ventana kit-v2", la única familia de recetas que produjo abstención en sus pruebas internas. No se especifica si hubo RLHF, DPO ni otras fases de alineamiento posteriores al SFT.

Los datos de entrenamiento son `provenance_corpus_v03.jsonl`, un conjunto de 197 pares construidos a partir de 111 recibos reales de estate, con sha256 `79bd396490eb78617e39846102f658f5830f797eebba228b45428e4866249b2b`. El corpus enseña cuatro comportamientos: citación de recibos con sha256, verificación de digest, rechazo cuando el digest no coincide y abstención cuando no hay recibo. La model card reconoce explícitamente que las 6 sondas de la batería de evaluación original aparecen literalmente como turnos de usuario en el corpus de entrenamiento (6/6), por lo que las cifras de 3/6 y 6/6 de esa batería son in-distribution y no held-out. Para corregirlo se construyó un conjunto held-out de 20 sondas (`provenance_heldout_probes_v1.json`, sha256 `10c47731e906fcf9d912115b2088ea5b09366e37a208ca6c6f3d55cd3032b508`), verificado como ausente del corpus v0.2, v0.3 y v0.4 antes de la subida.

## Capacidades

- Citación de recibos con hash sha256: el adaptador genera bloques de procedencia que incluyen el identificador y el digest del recibo citado.
- Verificación de digest: puede comprobar si un digest proporcionado coincide con el esperado.
- Rechazo por discrepancia de digest: cuando el digest no coincide, el adaptador está entrenado para rechazar la afirmación.
- Abstención sin recibo: entrenado para declinar responder cuando no dispone de un recibo que respalde la afirmación.
- Emisión de bloque de procedencia: en el conjunto held-out emite el bloque en 18/20 sondas no vistas.
- Razonamiento general: limitado por el modelo base de 0,8B; no se documentan capacidades adicionales de código, matemáticas o visión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de afirmaciones en pipelines internos: el adaptador puede insertarse como capa de verificación para que cada respuesta incluya un bloque de procedencia con sha256 del recibo citado, lo que facilita la trazabilidad en sistemas de gobernanza de datos. Es adecuado porque el formato de procedencia se emite en 18/20 sondas held-out, aunque requiere validación externa del digest.
- Detección de citas inventadas en producción: dado que el adaptador cita artefactos inventados en 14/20 sondas held-out, no debe usarse como única barrera; sí puede emplearse como generador de candidatos de cita que un verificador posterior contraste contra un almacén real de recibos.
- Evaluación de técnicas de abstención en modelos pequeños: el adaptador y sus recibos asociados sirven como caso de estudio reproducible para investigadores que quieran medir la diferencia entre formato de procedencia y grounding real, con conjuntos contaminados y held-out documentados.
- Prototipado de asistentes con rechazo explícito: en dominios donde es preferible no responder a responder sin evidencia, el adaptador puede probarse como capa de rechazo, aunque los datos held-out muestran que la abstención limpia solo alcanza 5/20.
- Investigación sobre contaminación de benchmarks: la model card documenta la contaminación de las 6 sondas originales y la corrección mediante un conjunto held-out, lo que lo convierte en un ejemplo útil para estudiar cómo la contaminación infla métricas de abstención.
- Generación de bloques de procedencia para revisión humana: en flujos donde un humano revisa la salida antes de publicarla, el adaptador puede producir el bloque de procedencia que el revisor valida manualmente contra el recibo original.
- Comparación de adaptadores en una misma familia: los recibos de v1, v2, v3 y v4 sobre el mismo modelo base permiten comparar recetas de LoRA y su efecto en abstención y citación, siempre que se respeten las limitaciones de rúbrica documentadas.

## Benchmarks y rendimiento

Batería original de 6 sondas (in-distribution, contaminada: las 6 sondas aparecen en el corpus de entrenamiento):

| Adaptador | Abstención o rechazo | Bloque de procedencia |
|---|---|---|
| Modelo base | 0/6 | 0/6 |
| v1 (3 épocas, lr 1e-4, corpus v0.2) | 0/6 | 0/6 |
| v2 kit-v2 (3 épocas, corpus v0.2) | 3/6 | no disponible |
| v2 e12 (12 épocas, lr 2e-4) | 0/6 | no disponible |
| v3 (3 épocas, corpus v0.3) | 3/6 | 6/6 |

Conjunto held-out de 20 sondas (rúbrica de palabras clave y flag de cita fabricada):

| Modelo | Abstención (rúbrica) | Bloque de procedencia | Flag de cita fabricada |
|---|---|---|---|
| Modelo base | 1/20 | 0/20 | 5/20 |
| v3 (este adaptador) | 8/20 | 18/20 | 10/20 |
| v4 | 12/20 | 8/20 | 2/20 |

Re-puntuación R1 sobre el conjunto held-out (rúbrica post-hoc, solo primeros 200 caracteres de cada respuesta):

| Modelo | Declina | Cita artefacto inventado | Abstención limpia |
|---|---|---|---|
| Modelo base | 1/20 | 19/20 | 1/20 |
| v3 (este adaptador) | 11/20 | 14/20 | 5/20 |
| v4 | 15/20 | 10/20 | 9/20 |

La model card advierte que estas cifras son salidas de rúbrica, no tasas calibradas: la abstención se detecta con cinco palabras clave ("abstain", "no receipt", "will not claim", "cannot cite", "no benchmark") y subestima rechazos formulados de otra manera; el flag de cita fabricada original solo detecta cadenas de 64 hex y nombres `*.json`, por lo que la re-puntuación R1 amplía la detección pero solo ve 200 caracteres por respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, los requisitos vendrán determinados por el modelo base y la cuantización elegida, no por el adaptador.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; un modelo base de 0,8B es en principio desplegable en GPU de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: no disponible en la información proporcionada. El adaptador es PEFT y se distribuye en safetensors, por lo que requeriría cargarse junto al modelo base mediante las herramientas PEFT habituales; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Abstención limpia (R1, held-out) | Cita artefacto inventado (R1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| szl-provenance-native-v3-lora (este) | LoRA r=16 sobre 0,8B | no disponible | 5/20 | 14/20 | other | Hugging Face |
| szl-provenance-native-v4 | no disponible | no disponible | 9/20 | 10/20 | no disponible | Hugging Face (referenciado en la model card) |
| Modelo base szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1 | 0,8B | no disponible | 1/20 | 19/20 | no disponible | Hugging Face |

No se dispone de comparación con adaptadores de procedencia de otros autores ni con modelos generalistas de 0,8B en la información proporcionada.

## Limitaciones y advertencias

- Contaminación del benchmark original: las 6 sondas de la batería inicial aparecen literalmente en el corpus de entrenamiento, por lo que las cifras de 3/6 y 6/6 no son held-out y no deben citarse como rendimiento generalizable.
- Formato de procedencia no equivale a grounding: el adaptador emite el bloque en 18/20 sondas held-out, pero cita artefactos inventados en 14/20 y solo logra abstención limpia en 5/20.
- Citas fabricadas: la re-puntuación R1 muestra que el adaptador nombra artefactos inventados en 14/20 sondas, frente a 19/20 del modelo base; la mejora es real pero insuficiente para uso autónomo.
- Abstención incompleta: la model card reconoce que la sonda "did your training improve your reasoning" se respondió afirmativamente citando un recibo no verificado en la evaluación, por lo que la abstención no es total.
- Limitaciones de rúbrica: la abstención se detecta con cinco palabras clave y subestima rechazos con otra formulación; el flag de cita fabricada original no detecta placeholders tipo "sha256=..." ni identificadores inventados como "szl-governed-a11oy-0001"; R1 solo analiza los primeros 200 caracteres de cada respuesta, por lo que sus recuentos son cotas inferiores.
- Respuestas no conservadas: solo se retuvo el sha256 de las respuestas completas, lo que limita la reproducibilidad de la evaluación.
- Estado de firma: el recibo de evaluación está sin firmar (UNSIGNED); el contrafirmado con el firmante DSSE del estate está pendiente de inyección de `SZL_COSIGN_PRIVATE_PEM`.
- Licencia "other": no se especifican los términos exactos de uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas no declarados: no hay información sobre el soporte multilingüe del adaptador ni del modelo base.
- Tamaño del modelo base: 0,8B de parámetros limita la calidad de razonamiento general y aumenta el riesgo de alucinación fuera del dominio de recibos.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/SZLHOLDINGS/szl-provenance-native-v3-lora
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1
- Recibos de evaluación: https://huggingface.co/SZLHOLDINGS/frontier-54-runs
- Corpus held-out: https://huggingface.co/SZLHOLDINGS/provenance-native-corpus-v1
