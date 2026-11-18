# ya9919/YN-4b-head-200k

## Resumen

YN-4b-head-200k es un checkpoint experimental publicado por el usuario ya9919 en el marco del proyecto S²-MAS, un framework de simulación multiagente a escala social para estudiar decisiones financieras de hogares. El modelo no es un modelo de lenguaje completo e independiente: se trata de una cabeza decisional escalar (decision head) entrenada sobre un backbone Qwen3.5-4B-Base congelado, cuyo único cometido es puntuar menús de candidatos en preguntas de elección financiera de tipo encuesta.

La relevancia del checkpoint es metodológica antes que práctica. Sirve como referencia de "backbone congelado" dentro de una comparación emparejada con una variante LoRA del mismo Qwen3.5-4B-Base entrenada con exactamente las mismas 200.000 filas de QA financiero. El resultado reportado es que la adaptación LoRA supera claramente a la cabeza congelada (74,14 % frente a 67,28 % de accuracy en el test común), lo que aísla cuánto del aprendizaje útil reside en el backbone y cuánto en la cabeza.

El checkpoint se seleccionó con un conjunto de desarrollo fijo de 20.000 ejemplos y se evaluó sobre un test retenido de 240.458 registros de QA con 119 versiones de pregunta y 8.275 grupos de hogar. El repositorio no contiene los pesos del backbone: solo incluye `head.pt`, el script de inferencia `qwen_decision.py` y la configuración `decision_config.json`, y exige descargar por separado el Qwen3.5-4B-Base oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base congelado) más cabeza decisional escalar compartida sobre candidatos codificados de forma independiente |
| Parametros totales | No disponible (el repositorio solo distribuye `head.pt`; el backbone 4B se obtiene aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; la inferencia reportada usa backbone en BF16 y scoring de candidatos en FP32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (uso científico no comercial, sin redistribución, sin ingeniería inversa, extracción ni destilación no autorizadas) |
| Formato de pesos | `head.pt` (PyTorch); backbone en el formato oficial de Qwen, obtenido por separado |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Qwen3.5-4B-Base oficial que permanece completamente congelado con una cabeza escalar compartida que aprende a puntuar candidatos codificados de forma independiente. El método se etiqueta como `head_only`: solo se actualizan los parámetros de la cabeza, no del transformer. En inferencia se codifica el estado del hogar, la pregunta y el menú completo de candidatos, y la cabeza produce una puntuación por candidato.

El entrenamiento usa 200.000 filas distintas de la partición fija de decisión-QA, provenientes de datos de encuesta reales según la documentación del proyecto. La etapa terminal acumuló 800.000 exposiciones a filas, pero el checkpoint seleccionado corresponde a 200.000 exposiciones acumuladas y 200.000 filas distintas, elegido mediante un conjunto de desarrollo fijo de 20.000 ejemplos. La partición de desarrollo completa, con 412.873 ejemplos, se emplea para comparar los dos métodos de adaptación de Qwen4B a 200k. No se documentan fases de RLHF ni DPO.

La innovación técnica del checkpoint es su función como control experimental: al mantener el backbone intacto y entrenar solo la cabeza, permite atribuir la diferencia de rendimiento frente a la variante LoRA (que actualiza backbone y cabeza con los mismos ejemplos únicos) al ajuste del backbone y no a diferencias de datos.

## Capacidades

- Puntuación de elección entre candidatos: dado un estado de hogar, una pregunta y un menú cerrado de opciones, devuelve una decisión (el candidato seleccionado).
- QA financiero de hogares sobre preguntas de encuesta: uso de tarjetas de crédito, cuentas de depósito a la vista en renminbi, cuentas de valores, depósitos a plazo no vencidos, entre otras del conjunto de test.
- Clasificación de opción múltiple con clases definidas por pregunta; el test común contempla 119 versiones de pregunta.
- Inferencia determinista sobre menús completos de candidatos, sin generación de texto libre.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No soporta visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre atribución de aprendizaje: usar este checkpoint junto a la variante LoRA del mismo backbone para medir cuánto del rendimiento proviene del ajuste del backbone y cuánto de la cabeza decisional, con datos y particiones idénticos.
- Reproducción de comparativas emparejadas: integrado en el benchmark de seis rutas de decisión del proyecto S²-MAS, sirve como referencia de la ruta "modelo de lenguaje con cabeza decisional aprendida".
- Simulación de decisiones de hogar a escala: alimentar el motor de transición de estados del framework con predicciones de elección financiera sobre estados sintéticos de hogares, siempre que se disponga de la implementación privada del motor GENESE/MAS.
- Evaluación de sensibilidad a datos de encuesta: al estar entrenado con 200.000 filas de encuesta real, permite estudiar cómo varía la precisión por versión de pregunta (F1 macro por pregunta) en subpoblaciones de hogares.
- Línea base en experimentos de adaptación eficiente: comparar cabezas congeladas frente a LoRA, adaptadores u otras técnicas con el mismo presupuesto de 200k filas.
- Docencia y divulgación sobre evaluación financiera: usar los ejemplos de QA incluidos en la model card como material ilustrativo de tareas de elección cerrada en encuestas de consumo.
- Auditoría de metodología de benchmarks: analizar el efecto de métricas como accuracy ponderada por registro frente a F1 macro por pregunta en un conjunto con 119 versiones de pregunta y fuerte desbalance de clases.

## Benchmarks y rendimiento

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint (`head_only`, backbone congelado) | 67,2841 | 30,8995 | 0 |
| Qwen4B LoRA + cabeza, mismas 200k QA únicas | 74,1435 | 36,7343 | 0 |

El test común contiene 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de encuestado/hogar. La accuracy pondera por igual cada registro y cuenta las decisiones inválidas como incorrectas; el F1 macro por pregunta promedia sobre todas las clases candidatas definidas en cada versión de pregunta y luego pondera las 119 versiones por igual. El checkpoint se seleccionó con datos de desarrollo antes de este test. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un backbone de 4B parámetros en BF16 requiere del orden de 8 GB solo para pesos, más memoria para el estado de activaciones y el scoring de candidatos en FP32; el repositorio no publica cifras medidas.
- GPU recomendadas: no disponibles en la documentación. Por tamaño del backbone, cabría en GPU de consumo con suficiente VRAM (gama RTX xx90 o similar) y en GPU de datacenter (A100, H100) para evaluación por lotes del test completo.
- Cabe en GPU de consumo: probablemente sí con el backbone en BF16 o cuantizado, pero el autor no lo confirma ni documenta configuraciones probadas.
- Opciones de despliegue: el repositorio proporciona `qwen_decision.py` como interfaz de scoring de candidatos; requiere el paquete local y el backbone y tokenizador oficiales indicados en `decision_config.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el test común | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-4b-head-200k (este) | Backbone 4B congelado + cabeza escalar | No disponible | 67,28 % accuracy; 30,90 % F1 macro | S²-MAS Controlled Model Research v1.2 | Pesos de la cabeza en HF; backbone aparte |
| Qwen4B LoRA + cabeza (misma familia) | Backbone 4B ajustado con LoRA + cabeza | No disponible | 74,14 % accuracy; 36,73 % F1 macro | No disponible en la información | No disponible |
| Fin-Laya (full-data, política de referencia del proyecto) | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar de forma directa con la variante LoRA emparejada del mismo backbone. No se dispone de datos de otros sistemas de las seis rutas de decisión del benchmark ni de modelos de propósito general comparables en esta tarea.

## Limitaciones y advertencias

- El repositorio no incluye los pesos del backbone: sin descargar Qwen3.5-4B-Base y el tokenizador oficiales, el checkpoint es inutilizable.
- El modelo no genera texto libre: solo puntúa menús cerrados de candidatos, por lo que no sirve como asistente conversacional ni para tareas generativas.
- El rendimiento es claramente inferior al de la variante LoRA emparejada en el mismo test (6,86 puntos de accuracy y 5,83 de F1 macro por debajo), lo que desaconseja su uso como sistema de decisión en producción.
- El F1 macro por pregunta es bajo en términos absolutos (30,90 %), lo que indica dificultad para discriminar clases minoritarias dentro de cada versión de pregunta.
- Sesgos conocidos: no documentados, pero al entrenarse con datos de encuesta reales sobre finanzas de hogares es esperable que herede sesgos de la muestra original (composición demográfica, geográfica y socioeconómica).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de decisiones incorrectas o mal calibradas al puntuar candidatos fuera de la distribución de entrenamiento.
- Limitación de idioma: solo inglés; las preguntas de ejemplo mencionan cuentas en renminbi, lo que sugiere un desajuste entre el idioma declarado y el contexto financiero de los datos.
- Restricciones de licencia: uso exclusivamente científico no comercial, prohibición de redistribución y de ingeniería inversa, extracción o destilación no autorizadas. Cualquier uso comercial requiere autorización expresa del titular.
- La implementación del motor GENESE/MAS es privada, lo que limita la reproducibilidad completa del entorno de simulación.
- El checkpoint se seleccionó con un conjunto de desarrollo de 20.000 ejemplos; no se documenta análisis de varianza entre semillas ni intervalos de confianza para las métricas reportadas.
- El repositorio tiene 0 descargas en el momento de la consulta y un tamaño de 0,0 GB, lo que sugiere que los artefactos pueden no estar completamente subidos o que el paquete es mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-4b-head-200k
- Licencia: https://huggingface.co/ya9919/YN-4b-head-200k/blob/main/LICENSE
- Ejemplos de QA en JSON: https://huggingface.co/ya9919/YN-4b-head-200k/blob/main/qa_examples.json
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
