# SZLHOLDINGS/SZL-Khipu-1.5B-GGUF

## Resumen

SZL-Khipu-1.5B-GGUF es la versión cuantizada en formato GGUF del modelo base SZLHOLDINGS/SZL-Khipu-1.5B, publicada por el colectivo SZLHOLDINGS. Se trata de un modelo de generación de texto de aproximadamente 1.540 millones de parámetros (1.543.714.304 según los pesos en safetensors del modelo base) orientado a tareas de recuperación (retrieval) y razonamiento estructurado, con un enfoque declarado en la model card hacia la validación de planes, el grounding y la abstención controlada. La versión GGUF está pensada para su ejecución mediante llama.cpp, lo que facilita el despliegue en entornos locales y de bajo consumo de recursos.

La relevancia de esta publicación es limitada pero concreta: ofrece pesos cuantizados de un modelo pequeño que cabe en hardware de consumo, con licencia Apache 2.0 y compatibilidad con el ecosistema llama.cpp. Sin embargo, la propia model card se autodefine como "proposal-only", "research" y con estado "gated y no promocionado", y declara explícitamente que los benchmarks estándar no se han ejecutado (STD BENCH: NOT_RUN). La información disponible sobre arquitectura, datos de entrenamiento y contexto es muy escasa.

Conviene subrayar que la model card incluye un aviso de gobernanza: el modelo se mantiene bloqueado (gated) y sin promoción mientras persista una "condición restrictiva de abstención no resuelta", y que el nombre en quechua "Amawta" es solo una propuesta de visualización, no una promoción del modelo. Todo ello sugiere que se trata de un artefacto de investigación interna más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model card no la especifica; el modelo base es un transformer de ~1,5B, sin confirmar) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo contiene pesos en formato GGUF; los niveles concretos de cuantizacion no se detallan en la informacion proporcionada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (segun YAML; la licencia del modelo base figura como "SZLHOLDINGS-derivative") |
| Formato de pesos | GGUF (libreria llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El recuento de parámetros (1.543.714.304) es compatible con un transformer decoder-only de escala ~1,5B, pero la model card no confirma el tipo de arquitectura, el número de capas, la dimensionalidad ni si emplea mecanismos como atención lineal, decodificación especulativa o mezcla de expertos. Tampoco se especifica la longitud de contexto.

Respecto al entrenamiento, la model card menciona la existencia de un "training_receipt.signed.json" con firma verificable contra una clave embebida, pero no publica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. La evidencia de entrenamiento figura como "PRESENT" en la retícula de evidencias, aunque el contenido sustantivo de ese recibo no se detalla en la información disponible. Los benchmarks estándar aparecen explícitamente como "NOT_RUN".

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation, con tag "conversational").
- Orientación a tareas de recuperación (retrieval) y grounding, según los tags y la model card.
- Validación de planes estructurados: el autor reporta una tasa de acierto del 100 % en un conjunto propio de validación de planes (n=11).
- Capacidad de abstención: el modelo está diseñado para abstenerse de responder en ciertos casos, aunque el rendimiento reportado en este aspecto es bajo (2/6).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; la validación de planes sugiere cierta capacidad de razonamiento estructurado, pero no hay evidencia publicada al respecto.
- Capacidades multilingües: limitadas al inglés según el campo `language: [en]`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Recuperación aumentada (RAG) en inglés: el modelo puede emplearse como componente de grounding para verificar que las respuestas se apoyan en el contexto recuperado, dado su enfoque declarado en retrieval y grounding. Adecuado por su tamaño reducido y su despliegue vía llama.cpp.
- Validación de planes en pipelines de agentes: puede usarse como verificador de que un plan generado por otro modelo cumple un esquema o conjunto de restricciones, aprovechando la tarea "plan valid" reportada por el autor. Útil como guardarraíl barato en sistemas multi-agente.
- Filtro de abstención en asistentes: puede integrarse como capa que decide cuándo un asistente debe declinar responder; no obstante, la tasa reportada (2/6) aconseja usarlo solo como señal complementaria, no como único mecanismo.
- Despliegue local en hardware de consumo: al estar en GGUF y tener ~1,5B parámetros, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, para prototipado y pruebas de concepto.
- Evaluación e investigación de gobernanza de modelos: la propia model card lo presenta como artefacto de investigación con recibos firmados; puede servir para estudiar mecanismos de trazabilidad y evidencia de entrenamiento/evaluación.
- Generación de texto conversacional de baja latencia en inglés: para tareas simples de chatbot o completado donde el coste computacional sea prioritario sobre la calidad máxima.
- Clasificación y etiquetado ligero de texto: por su tamaño, puede adaptarse a tareas de extracción o clasificación en flujos por lotes con recursos limitados.

## Benchmarks y rendimiento

Los resultados que se presentan a continuación son los declarados por el autor en el `model-index` de la model card. No están verificados de forma independiente (`verified: false`) y se basan en conjuntos de evaluación propios y muy pequeños (n entre 5 y 11). No se han ejecutado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Tarea | Conjunto de evaluación | Métrica | Resultado | Verificado |
|---|---|---|---|---|
| Validación de planes (plan valid) | SZL plan valid (n=11) | pass_rate | 1,0 (11/11) | No |
| Grounding | SZL grounding (n=5) | pass_rate | 0,8 (4/5) | No |
| Abstención (abstention) | SZL abstention (n=6) | pass_rate | 0,3333 (2/6) | No |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no confirmada por el autor), un modelo de ~1,5B parámetros en cuantización Q4 requiere del orden de 1-1,5 GB de memoria, y en Q8 en torno a 2 GB; en FP16, unos 3 GB. Estas cifras son estimaciones por escala y deben validarse con los ficheros GGUF concretos del repo (6,9 GB de tamaño total del repositorio, que incluye varias cuantizaciones).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para las cuantizaciones más pequeñas.
- Compatibilidad con GPU de consumo: previsiblemente sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU. No confirmado oficialmente.
- Opciones de despliegue: llama.cpp (librería declarada), y por compatibilidad de formato, herramientas del ecosistema GGUF como Ollama o servidores compatibles con llama.cpp. vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (benchmarks estándar no ejecutados) que permitan una comparación rigurosa con alternativas. A continuación se ofrece una comparación estructural con modelos de escala similar, marcando los campos no confirmados.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks estandar |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-GGUF | ~1,5B | no disponible | Apache 2.0 | GGUF | No ejecutados |
| Qwen2.5-1.5B (referencia de escala) | ~1,5B | no disponible en esta ficha | Apache 2.0 (segun version) | safetensors, GGUF | Publicados por el autor original |
| Llama 3.2 1B (referencia de escala) | ~1,2B | no disponible en esta ficha | Llama Community License | safetensors, GGUF | Publicados por el autor original |
| SmolLM2-1.7B (referencia de escala) | ~1,7B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Publicados por el autor original |

Nota: los datos de los modelos de referencia no forman parte de la información proporcionada y se incluyen solo como orientación de categoría; no deben tomarse como cifras verificadas en esta ficha. La comparación de rendimiento con SZL-Khipu no es posible por ausencia de benchmarks estándar.

## Limitaciones y advertencias

- Estado de publicación incierto: la model card declara `draft_state: HUB_PR_UNMERGED`, `publication_eligible: UNKNOWN` y describe el modelo como "proposal-only" y "research". No debe considerarse un modelo promocionado ni estable.
- Modelo bloqueado (gated): la card indica que Khipu permanece gated y sin promoción mientras no se resuelva una condición restrictiva de abstención; el rendimiento en abstención reportado (2/6) es bajo.
- Benchmarks no estándar y no verificados: los únicos resultados son sobre conjuntos propios muy pequeños (n=5 a n=11) y con `verified: false`; no hay evidencia de rendimiento general.
- Idiomas: solo inglés declarado; no hay soporte multilingüe confirmado.
- Contexto: longitud de contexto no disponible, lo que impide planificar usos con ventanas largas.
- Licencia: el YAML declara Apache 2.0, pero la licencia del modelo base figura como "SZLHOLDINGS-derivative" y la card indica "NOTICE / license duty: none found". Conviene revisar los términos del modelo base antes de un uso comercial.
- Riesgo de alucinación: no evaluado con benchmarks estándar; la capacidad de abstención limitada aumenta el riesgo de respuestas incorrectas sin señal de duda.
- Sesgos: no documentados en la información disponible.
- Trazabilidad incompleta: la evidencia de GitHub figura como "GAP" (repositorio nombrado sin commit), los commits no están fijados y la clave de firma no está emparejada con un registro público de claves SZL.
- Nomenclatura: el nombre en quechua "Amawta" es solo una propuesta de visualización y no implica ninguna promoción del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF
- Revisión concreta referenciada en la card: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF/tree/e5ccd7cab0a42234a78183793fe860598e5a7a4c
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Repositorio GitHub de origen (mencionado, sin commit fijado): szl-holdings/szl-forge (no se proporciona URL directa en la información disponible)
- Paper, blog o demo: no disponibles en la información proporcionada.
