# Urdatorn/sphragis-alm-olmo3-7b-diodorus-siculus

## Resumen

Sphragis authorial language model: Diodorus Siculus es un modelo de lenguaje autoría (ALM, por sus siglas en inglés) desarrollado por Urdatorn para el benchmark de atribución de autoría en griego antiguo Sphragis. Se trata de un ajuste fino completo del modelo base `allenai/Olmo-3-1025-7B` (revisión `a81bae42db3975be1671e27b9c9a56da1a9f980f`), entrenado exclusivamente sobre las 1.000 frases de entrenamiento de Diodoro Sículo pertenecientes al split `sentence_1` del dataset Sphragis, lo que supone 184.560 tokens anotados. El modelo sigue el enfoque de Huang, Murakami y Grieve (2025), donde la atribución de autoría se realiza comparando la perplejidad de cada oración entre diecisiete modelos autorales, uno por autor, y asignando la frase al modelo que la encuentra menos sorprendente.

La relevancia de este modelo reside en que forma parte de una familia de diecisiete ALM que, en conjunto, alcanzan un macro-F1 de 0,812 en la validación del benchmark. A diferencia del entrenamiento fijo de 100 épocas del artículo original, aquí la duración se selecciona mediante evidencia de validación, deteniéndose en la época 3.0 (de un máximo de 20 con paciencia 3) con una pérdida de validación de 0,6363 nats/token. El modelo tiene 7.298 millones de parámetros y se distribuye en formato safetensors en precisión bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo-3-1025-7B (transformador decoder-only) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3 soporta contexto largo, pero no se especifica en la ficha) |
| Tipos de cuantización | bf16 (pesos de entrenamiento); no se publican cuantizaciones adicionales |
| Idiomas soportados | grc (griego antiguo) exclusivamente |
| Licencia | other (derivado de texto con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste adicional completo de OLMo-3-1025-7B, un transformer decoder-only con arquitectura causal LM. El entrenamiento se realizó con un objetivo de modelado de lenguaje causal sobre secuencias de una sola frase con formato `<|endoftext|> sentence <|endoftext|>`, es decir, una frase por secuencia. Se utilizó precisión mixta: pesos maestros en fp32, cómputo en bf16 y FSDP con sharding completo sobre dos GPUs GH200. El batch efectivo fue de 16 frases, con una tasa de aprendizaje de 1e-05 constante tras 25 pasos de calentamiento. La selección del mejor modelo se hizo por menor pérdida en el conjunto de validación del mismo autor, deteniéndose en la época 3.0 de un máximo de 20 con paciencia 3.

El texto de entrenamiento proviene del dataset Sphragis, cuyas fuentes tienen licencias mixtas, por lo que el modelo resultante se libera con licencia `other` y no con la Apache-2.0 del base. La novedad técnica frente al artículo original es la selección de la duración del entrenamiento mediante datos de validación, lo que evitó el sobreajuste y detuvo todos los modelos en épocas 2 o 3.

## Capacidades

- Modelado de lenguaje autorizado: genera y puntúa texto griego antiguo con la distribución estadística característica de Diodoro Sículo.
- Atribución de autoría: permite asignar frases a Diodoro Sículo comparando su perplejidad con la de los otros 16 modelos del conjunto Sphragis.
- Puntuación de perplejidad: calcula la log-verosimilitud negativa por token, exactamente como se hizo en el entrenamiento, para comparar entre modelos.
- No soporta tool calling, razonamiento multi-paso, ni generación de código; es un modelo especializado en modelado de lenguaje de autor.
- Capacidades multilingües: limitadas al griego antiguo (grc); no se reportan otros idiomas.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: dado un fragmento de prosa, el modelo puntúa su perplejidad y lo asigna al autor cuyo modelo ofrezca menor sorpresa. Es el uso principal y el que justifica el diseño.
- Análisis estilométrico de Diodoro Sículo: investigadores pueden estudiar la distribución léxica y sintáctica del autor mediante la perplejidad de este modelo sobre diferentes corpus.
- Autenticación de textos dudosos: para obras o pasajes de atribución incierta dentro del corpus diodoriano, el modelo ofrece una medida cuantitativa de consistencia estilística.
- Estudio de la evolución estilística dentro de la obra de Diodoro: al comparar la perplejidad por secciones de la Biblioteca Histórica, se pueden detectar variaciones internas o interpolaciones.
- Evaluación de modelos de lenguaje clásicos: el modelo sirve como referencia para probar otros sistemas de atribución de autoría en griego antiguo dentro del benchmark Sphragis.
- Generación de texto de estilo diodoriano: aunque no es el objetivo principal, el modelo puede generar frases que imitan la distribución estadística del autor, útil para pruebas de ciego en estudios de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. El conjunto de los 17 modelos ALM del benchmark Sphragis alcanza un macro-F1 de 0,812 en el split de validación `sentence_1`, según la model card. No se reportan métricas por autor ni comparaciones con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,6 GB para el modelo en bf16, más los activos de atención y caché KV, por lo que se recomienda al menos 16-20 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU con 24 GB o más de VRAM (RTX 3090, RTX 4090, A100 40GB, H100) es suficiente para inferencia en bf16. El entrenamiento se realizó en 2x GH200 con FSDP.
- Compatibilidad con GPU de consumo: sí, en RTX 3090/4090 (24 GB) se puede ejecutar sin cuantización adicional.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp (si se convierte a GGUF) o directamente con Transformers de HuggingFace. No hay cuantizaciones publicadas, por lo que habría que generarlas manualmente.
- Latencia y throughput: no disponible en la información publicada; dependerá del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Sphragis ALM Diodorus Siculus | 7,3B | no disponible | other | Griego antiguo, atribución de autoría |
| allenai/OLMo-3-1025-7B (base) | 7,3B | largo (no especificado) | Apache-2.0 | Modelo general multilingüe |
| Otros 16 ALM del benchmark Sphragis | 7,3B cada uno | no disponible | other | Griego antiguo, un autor por modelo |

No se dispone de modelos comerciales comparables con la misma tarea de atribución de autoría en griego antiguo. La comparación directa con el base OLMo-3 es posible para perplejidad sobre texto de Diodoro, pero no se publican resultados individuales. El modelo se distingue por su especialización extrema: un solo autor, una sola lengua y una tarea única.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo solo ha visto frases de Diodoro Sículo, por lo que su uso fuera de este corpus producirá resultados poco fiables.
- Riesgo de alucinación: como modelo causal, puede generar texto plausible pero inventado; no es fiable para tareas factuales.
- Limitaciones de idioma: exclusivamente griego antiguo; no soporta otros idiomas ni variedades modernas.
- Restricciones de licencia: la licencia `other` incluye material CC BY-NC-SA, lo que impide su uso comercial sin verificación de las licencias de las fuentes del dataset Sphragis. Debe consultarse el archivo `LICENSES.md` del dataset.
- Contexto limitado: aunque el base soporta contexto largo, la ficha no especifica el contexto del modelo ajustado, y el entrenamiento se hizo con secuencias de una sola frase, por lo que el contexto de generación es muy corto.
- No es un modelo de instrucciones: no responde a prompts de chat ni soporta tool calling; es exclusivamente para puntuación de perplejidad y generación de estilo.
- No se han publicado cuantizaciones ni versiones optimizadas para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-diodorus-siculus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-3-1025-7B: https://huggingface.co/allenai/OLMo-3-1025-7B
- Página de OLMo de AI2: https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Artículo de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081 (no se proporciona URL directa en la información).</think>## Resumen

Sphragis authorial language model para Diodoro Sículo es un modelo de lenguaje autorizado (ALM, por sus siglas en inglés) desarrollado por Urdatorn para el benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste adicional completo del modelo base `allenai/Olmo-3-1025-7B`, entrenado exclusivamente sobre las 1.000 frases de entrenamiento de Diodoro Sículo del split `sentence_1` del dataset Sphragis, lo que supone 184.560 tokens anotados. Sigue la metodología de Huang, Murakami y Grieve (2025), donde la atribución de autoría se realiza comparando la perplejidad de diecisiete modelos ALM, uno por autor, y asignando cada frase al modelo que la encuentra menos sorprendente.

El modelo tiene 7.298 millones de parámetros y se publica en formato safetensors con pesos bf16. La selección del número de épocas se hizo por evidencia de validación, deteniéndose en la época 3.0 de un máximo de 20, con una pérdida de validación de 0,6363 nats/token. Su relevancia actual reside en que permite atribuir textos griegos antiguos con una precisión macro-F1 de 0,812 en la validación conjunta de los diecisiete modelos, un avance notable para la filología digital y los estudios de autoría clásica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3-1025-7B) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3 soporta contexto largo, pero no se especifica para este ajuste) |
| Tipos de cuantización | bf16 (pesos publicados) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivado de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste adicional completo del OLMo-3-1025-7B, un transformer decoder causal de 7.000 millones de parámetros. El entrenamiento se realizó con el objetivo de modelado de lenguaje causal sobre secuencias de una sola frase con formato `<|endoftext|> frase <|endoftext|>`, es decir, una frase por secuencia. Se usó precisión mixta: pesos maestros en fp32, cómputo en bf16 y FSDP completo en 2 GPUs GH200. El batch efectivo fue de 16 frases, con una tasa de aprendizaje de 1e-05 constante tras 25 pasos de calentamiento. La selección del mejor modelo se hizo por menor pérdida en el conjunto de validación de Sphragis, deteniéndose en la época 3.0 de un máximo de 20 (con paciencia 3), a diferencia del enfoque original de Huang y colaboradores que fijaba 100 épocas.

El texto de entrenamiento proviene del dataset Sphragis, cuyas fuentes tienen licencias mixtas, por lo que este modelo derivado se libera con licencia `other` en lugar de la Apache-2.0 del base. No se reportan innovaciones técnicas adicionales más allá de la selección de épocas por validación, que evita el sobreajuste.

## Capacidades

- Modelado de lenguaje autorizado: genera y puntúa texto con la distribución estadística específica de Diodoro Sículo.
- Atribución de autoría: permite asignar una frase a uno de los diecisiete autores del benchmark Sphragis mediante la comparación de perplejidad.
- Puntuación de perplejidad: calcula la log-verosimilitud negativa por token, exactamente como se entrenó, para comparar contra los otros 16 modelos.
- Análisis estilométrico: útil para estudiar variaciones estilísticas dentro de la obra de Diodoro Sículo.
- No soporta tool calling, agentes, ni razonamiento multi-paso; es un modelo puramente de modelado de lenguaje.
- Capacidad multilingüe: limitada exclusivamente al griego antiguo (grc), no a otros idiomas.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: el modelo puntúa la perplejidad de una frase o fragmento y lo asigna al autor cuyo modelo ofrezca menor sorpresa. Es el caso de uso principal y el que justifica el diseño.
- Verificación de autoría de obras dudosas: para textos cuya autoría se debate dentro del corpus de Diodoro Sículo, se puede medir la consistencia estilística con este modelo frente a otros.
- Análisis estilométrico de la Biblioteca Histórica: los investigadores pueden estudiar la evolución interna del estilo de Diodoro a lo largo de su obra comparando la perplejidad de secciones individuales.
- Generación de texto con estilo autoriodórico: aunque no es su objetivo principal, el modelo puede generar frases con la distribución estadística del autor, útil para experimentos de cegado en estudios filológicos.
- Evaluación de otros modelos de atribución de autoría: como referencia dentro del benchmark Sphragis, permite comparar la calidad de otros sistemas de atribución sobre el mismo corpus.
- Entrenamiento de sistemas de autenticación de texto: en aplicaciones de análisis de textos clásicos, se puede integrar como componente de verificación de autoría en pipelines de investigación digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. El conjunto de los 17 modelos ALM del benchmark Sphragis alcanza un macro-F1 de 0,812 en el split de validación `sentence_1`, según la model card. No hay datos de MMLU, HumanEval ni otros benchmarks generales, ya que el modelo está especializado en una única tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 14,6 GB en el repositorio. Para inferencia con contexto corto se necesitan al menos 16 GB de VRAM; con contexto largo, 24 GB o más.
- GPU recomendadas: para una inferencia cómoda, una RTX 3090 o RTX 4090 de 24 GB es suficiente. El entrenamiento se realizó en 2x GH200, pero la inferencia no requiere tanto.
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 3090 o 4090 con 24 GB sin cuantización. Si se cuantiza a 8 bits, podría caber en 16 GB.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama o Hugging Face TGI. El formato safetensors es compatible con todos.
- Latencia y throughput: no disponibles en la información publicada; dependerá del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Sphragis ALM Diodorus Siculus | 7.298M | no especificado | other | Griego antiguo, atribución de autoría |
| allenai/Olmo-3-1025-7B (base) | 7.298M | largo (no especificado) | Apache-2.0 | Modelo general multilingüe |
| Otros 16 ALM del benchmark Sphragis | 7.298M cada uno | no especificado | other | Griego antiguo, un autor por modelo |

No se dispone de modelos comerciales equivalentes para atribución de autoría en griego antiguo. La comparación directa con el base OLMo-3 no es relevante para la tarea, ya que el ALM está especializado en un único autor. La familia de 17 modelos comparte arquitectura y metodología, y la ventaja de este modelo es su especificidad, aunque a costa de una aplicabilidad general muy limitada.

## Limitaciones y advertencias

- Sesgo de autor único: el modelo solo ha visto frases de Diodoro Sículo, por lo que su uso en textos de otros autores griegos producirá resultados poco fiables.
- Riesgo de alucinación: como modelo generativo, puede producir texto plausible pero no fiel a fuentes históricas; no debe usarse para reconstrucción de textos perdidos sin verificación.
- Limitaciones de contexto: el entrenamiento se realizó con una frase por secuencia, por lo que no se ha validado el uso con contextos largos; la ventana de contexto del base no se ha explotado.
- Licencia restrictiva: la licencia `other` deriva de fuentes CC BY-NC-SA, lo que impide su uso comercial sin verificación previa de las licencias del dataset Sphragis. Es necesario consultar `LICENSES.md` del dataset antes de cualquier reutilización.
- Sin soporte de instrucciones: no es un modelo de chat ni de instrucciones; no responde a prompts generales ni soporta tool calling.
- Rendimiento desconocido fuera del corpus: no hay benchmarks publicados sobre otros corpus griegos, por lo que su generalidad es incierta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-diodorus-siculus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-3-1025-7B: https://huggingface.co/allenai/Olmo-3-1025-7B
- Página de OLMo de AI2: https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Artículo de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
