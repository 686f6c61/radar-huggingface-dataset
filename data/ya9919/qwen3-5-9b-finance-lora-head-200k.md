# ya9919/qwen3.5-9b-finance-lora-head-200k

## Resumen

`qwen3.5-9b-finance-lora-head-200k` es un adaptador LoRA con una cabeza de decisión escalar compartida, publicado por el usuario ya9919 sobre el backbone Qwen/Qwen3.5-9B. No es un modelo generativo autónomo: el paquete contiene solo los pesos del adaptador (`adapter/adapter_model.safetensors`) y la cabeza (`head.pt`), ambos en FP32, y exige descargar por separado el modelo base y su tokenizador. El repositorio ocupa 0,1 GB.

El artefacto resuelve una tarea acotada: puntuar candidatos de respuesta en preguntas financieras de opción múltiple derivadas de encuestas (CHFS/CGSS) y elegir la mejor opción. Se entrenó con 200.000 filas distintas del split de entrenamiento QA en inglés de cuatro fuentes y se evaluó sobre un subconjunto congelado de 240.458 filas y 119 versiones de pregunta, con métricas declaradas de exactitud 0,7409 y F1 macro por pregunta 0,3666.

Su interés es fundamentalmente metodológico: documenta un pipeline de decisión reproducible (selección de checkpoint por F1 macro, test final no usado para selección) más que un modelo listo para producción. Requiere un script propio (`qwen_decision.py`), impone un límite duro de 2048 tokens por entrada y solo declara inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer Qwen3.5-9B, más una cabeza de decisión escalar compartida; arquitectura interna del backbone no disponible |
| Parámetros totales | Backbone de 9B (nominal, según el modelo base declarado); recuento de parámetros del adaptador y de la cabeza no disponible |
| Longitud de contexto | 2048 tokens como límite duro del runtime de inferencia; contexto nativo del backbone no disponible |
| Tipos de cuantización | No disponible; los pesos publicados están en FP32 (adaptador y cabeza) y no se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 para los artefactos del modelo; los datos de entrenamiento se rigen por `chfs-cgss-cfps-clds-source-data-terms` |
| Formato de pesos | `safetensors` (adaptador PEFT) y `head.pt` (PyTorch); el backbone se obtiene aparte |
| Tamaño del repositorio | 0,1 GB |
| Dependencias de inferencia | Python 3.12, PyTorch 2.12.1+cu126, Transformers 5.19.0, PEFT 0.21.0, accelerate, safetensors |
| Tarea | Puntuación de candidatos en QA financiero (no es `text-generation`; pipeline no declarado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA inicializado desde la release post-entrenada oficial de Qwen3.5-9B. Sobre la representación del backbone se aplica una cabeza escalar compartida que puntúa cada candidato de respuesta; cada candidato se evalúa con un forward independiente sobre la entrada completa y formato de texto crudo, y las características normalizadas en FP32 alimentan la cabeza FP32. El paquete no incluye tokenizador ni pesos del backbone: hay que resolverlos desde `Qwen/Qwen3.5-9B`.

El entrenamiento usó 200.000 filas distintas del split de entrenamiento QA en inglés de cuatro fuentes, con ese mismo número de exposiciones en la etapa terminal y en el checkpoint seleccionado. La selección de checkpoint se hizo sobre un dev fijo de 20.000 filas, primero por F1 macro por pregunta y después por exactitud; el dev completo (412.873 filas) se empleó para elegir el denominado «método Qwen4B», y el test final no participó en la selección. La model card no detalla el número de tokens, la composición exacta del corpus, ni si hubo RLHF o DPO; tampoco se documenta ninguna innovación de atención (FLA y causal-conv se mencionan solo como aceleradores locales opcionales, con fallback oficial de Torch).

## Capacidades

- Puntuación y selección de candidatos en preguntas de opción múltiple de contenido financiero, con `qid`, `state`, `question.instructions`, `question.criteria` y `candidate_ids` ordenados como entrada.
- Evaluación con etiquetas observadas y sin ellas: la etiqueta no es necesaria para inferir.
- Salida determinista por candidato mediante forwards independientes sobre la entrada completa, sin truncado silencioso.
- Cero predicciones inválidas sobre el subconjunto de evaluación declarado (240.458 filas, 119 versiones de pregunta).
- Soporte de tool calling / function calling: no disponible (el artefacto no es un modelo conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el uso previsto es una decisión puntual por consulta.
- Capacidades multilingües: limitadas a inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Codificación de respuestas de encuesta financiera: dado un estado socioeconómico del hogar y una pregunta con criterios, el modelo puntúa las opciones y devuelve la más probable; encaja porque el entrenamiento se hizo exactamente sobre ítems CHFS/CGSS.
- Anotación asistida de datasets QA financieros: usar las puntuaciones como señal de pre-etiquetado y reservar la revisión humana para los casos con margen bajo entre candidatos.
- Triaje de candidatos en pipelines de evaluación: reducir de N opciones a la mejor y a la segunda, con la ventaja de que cada candidato se puntúa de forma independiente y auditable.
- Reproducción de investigación: replicar los resultados del sistema Fin-Laya / MAS descrito en el repositorio `mas-simulation` sobre el subconjunto congelado de 240.458 filas.
- Comparación de métodos de ajuste (LoRA frente a otras variantes y 4B frente a 9B): el propio autor usa el dev completo para seleccionar el «método Qwen4B», lo que convierte el artefacto en una pieza de un banco de pruebas comparativo.
- Filtrado de calidad en la construcción de corpus: descartar pares pregunta-respuesta mal formados cuando el modelo reparte las puntuaciones de forma casi uniforme entre candidatos.
- Componente de decisión en un sistema multiagente con verificación posterior: solo si el resto del sistema respeta el límite de 2048 tokens y aporta el backbone y el tokenizador.

## Benchmarks y rendimiento

Evaluación con etiquetas observadas sobre el subconjunto común CHFS/CGSS congelado de 240.458 filas y 119 versiones de pregunta (el split de test inglés completo del repositorio fuente tiene 418.597 filas; son denominadores distintos).

| Métrica | Resultado |
|---|---:|
| Exactitud | 0,740919412 |
| F1 macro por pregunta | 0,366621983 |
| Predicciones inválidas | 0 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas estándar, ni comparaciones numéricas frente a modelos de referencia.

## Requisitos de hardware

- El backbone de 9B en FP32 requeriría del orden de 36 GB de VRAM; en BF16, unos 18 GB. Son estimaciones aritméticas a partir del recuento nominal de parámetros, no cifras publicadas por el autor.
- Adaptador y cabeza suman 0,1 GB en FP32 y añaden un consumo despreciable frente al backbone.
- GPU recomendadas: no disponibles en la documentación. Por memoria, un backbone en BF16 encajaría en A100 40/80 GB, H100 y L40S; en FP32 exigiría A100 80 GB o H100.
- GPU de consumo: un backbone en BF16 no cabe en tarjetas de 16 GB; en 8 bits (≈9 GB) o 4 bits (≈5 GB) podría caber en una RTX 4090 o RTX 4080, pero el autor no documenta ni valida cuantización del backbone, y la cabeza y las características deben permanecer en FP32.
- Despliegue: no hay soporte para vLLM, TGI, llama.cpp ni Ollama; la única vía documentada es `python qwen_decision.py --package . --upstream-model Qwen/Qwen3.5-9B --input request.json --device cuda` o la clase `DecisionPredictor`. No se usa una cabeza de clasificación estándar de `AutoModel`, por lo que los servidores de inferencia genéricos no la cargarán sin trabajo adicional.
- Latencia y throughput: no disponibles. Cualquier estimación debe tener en cuenta que cada candidato exige un forward completo independiente, de modo que el coste crece linealmente con el número de opciones y con la longitud de la entrada (máximo 2048 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ya9919/qwen3.5-9b-finance-lora-head-200k` | Backbone 9B + adaptador y cabeza sin recuento declarado | 2048 tokens (límite del runtime) | Exactitud 0,7409 y F1 macro 0,3666 en el subconjunto CHFS/CGSS de 240.458 filas | Apache-2.0 (datos con términos propios) | Repositorio HF, 0 descargas y 0 likes en el momento del análisis |
| `Qwen/Qwen3.5-9B` (modelo base) | 9B | No disponible en esta información | No disponible en esta información | No disponible en esta información | Público en HuggingFace |
| Adaptadores de QA financiero con cabeza de decisión comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la información proporcionada |

La comparación 4B/9B que menciona el autor mezcla escala y historial de entrenamiento previo, por lo que no aísla el efecto del tamaño; no se aportan cifras de esa comparación.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación libre: es un adaptador de puntuación con una cabeza propietaria y requiere el script `qwen_decision.py`; los servidores de inferencia estándar no lo cargan directamente.
- Límite duro de 2048 tokens por entrada: el runtime lanza un error en lugar de truncar, lo que rompe pipelines que esperan truncado silencioso.
- Solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Brecha grande entre exactitud (0,741) y F1 macro por pregunta (0,367): el rendimiento es muy desigual entre las 119 versiones de pregunta, con preguntas de baja sensibilidad y posible sesgo hacia opciones mayoritarias.
- El test final no se usó para selección, pero todas las métricas proceden de un único subconjunto congelado; no hay evaluación externa ni en otros dominios financieros.
- Riesgo de sobreajuste al formato de las cuatro fuentes de entrenamiento y al estilo de encuesta CHFS/CGSS; fuera de ese formato no hay garantías.
- Licencia: los artefactos son Apache-2.0, pero los datos de entrenamiento conservan los términos `chfs-cgss-cfps-clds-source-data-terms`, lo que puede condicionar la redistribución y el uso comercial derivado.
- Hay que descargar el backbone y el tokenizador por separado; el repositorio no es autocontenido.
- Con 0 descargas y 0 likes, no existe validación independiente de la comunidad. El autor indica que los resultados de simulación financiera y los del sistema Fin-Laya sobre datos históricos completos se reportan aparte y no forman parte de esta model card.
- Versiones muy específicas de dependencias (PyTorch 2.12.1+cu126, Transformers 5.19.0, PEFT 0.21.0) pueden complicar la integración en entornos existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ya9919/qwen3.5-9b-finance-lora-head-200k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de reproducción e evidencias agregadas (`mas-simulation`): https://github.com/KataDavidXD/mas-simulation
