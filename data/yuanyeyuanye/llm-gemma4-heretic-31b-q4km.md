# yuanyeyuanye/llm-gemma4-heretic-31b-q4km

## Resumen

`yuanyeyuanye/llm-gemma4-heretic-31b-q4km` es un repositorio que empaqueta en un único GGUF una versión "heretic" (desalineada deliberadamente mediante ablación de las direcciones de rechazo) del modelo `google/gemma-4-31B-it`, con 30.697.345.596 parámetros (≈30,7B) y cuantización Q4_K_M. No es un entrenamiento original: la cadena de procedencia declarada por el autor es Google (modelo base) → `coder3101/gemma-4-31B-it-heretic` (ablación) → capa `gemma4-heretic:31b-q4km` de Ollama → este repositorio.

Su propósito declarado es puramente operativo: servir como caché de modelo única para un endpoint serverless de llama.cpp en RunPod, ya que los "Cached Models" de RunPod descargan el repositorio completo. El repositorio incluye además el proyector multimodal `mmproj-gemma-4-31B-it-F16.gguf` tomado de `unsloth/gemma-4-31B-it-GGUF`, porque la fuente heretic no incluye proyector propio; esto habilita, en teoría, entrada de imagen si el runtime lo carga.

Es relevante ahora por dos motivos: por un lado, el ecosistema de variantes "abliterated/heretic" de Gemma 4 se ha consolidado en 2026 como la vía práctica para inferencia local sin rechazos; por otro, este repositorio documenta explícitamente hashes SHA-256 de cada artefacto, algo poco habitual y útil para reproducibilidad en despliegues. Conviene señalar que el repositorio tiene 0 descargas y 0 likes, y que su model card no incluye especificaciones técnicas, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo derivado de `google/gemma-4-31B-it`, familia Gemma 4) |
| Parametros totales | 30.697.345.596 (≈30,7B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (pesos principales); F16 (proyector multimodal `mmproj`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (etiqueta del repo); la fuente cita tambien los terminos de Gemma 4 |
| Formato de pesos | GGUF (`gemma4-heretic-31b-q4km.gguf`, `mmproj-gemma-4-31B-it-F16.gguf`) |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura interna ni sobre el proceso de entrenamiento; solo describe la cadena de artefactos. Lo que sí se puede afirmar con los datos disponibles: el punto de partida es `google/gemma-4-31B-it`, un modelo instruction-tuned de 30,7B parámetros, sobre el que se aplicó una modificación del tipo "heretic", es decir, una ablación de direcciones en el espacio de activaciones orientada a eliminar el comportamiento de rechazo, no un reentrenamiento con dataset nuevo.

Según los resultados de búsqueda, la técnica empleada por variantes equivalentes de la misma familia es Heretic v1.2.0 con "Arbitrary-Rank Ablation" (ARA); un modelo comparable de otro autor reporta 90% menos rechazos (10/100) con una divergencia KL de 0,0541 respecto al original. Esos números corresponden a `llmfan46/gemma-4-31B-it-uncensored-heretic`, no a este repositorio, y aquí se citan únicamente como referencia del método, no como medición de este GGUF. No hay información sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instruction-tuned.
- Razonamiento y conocimiento general propios de un modelo de ≈31B de la familia Gemma 4 (sin datos verificables en este repo).
- Entrada multimodal de imagen, siempre que el runtime cargue el `mmproj-gemma-4-31B-it-F16.gguf` incluido; el GGUF de pesos por sí solo no habilita visión.
- Comportamiento con rechazos drásticamente reducido respecto al modelo original, por diseño del proceso heretic.
- Compatibilidad con llama.cpp/Ollama, lo que implica soporte de plantillas de chat, streaming y inferencia en CPU/GPU mixta.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.
- Idiomas: no disponible.

## Casos de uso

- Endpoint serverless en RunPod: es el caso de uso explícito del repositorio. Se despliega como modelo cacheado en un worker de llama.cpp y se sirve la API compatible con OpenAI, evitando descargar artefactos en cada arranque en frío.
- Investigación sobre alineación y seguridad: permite estudiar empíricamente el efecto de la ablación ARA comparando respuestas de este GGUF con las de `google/gemma-4-31B-it` sobre el mismo prompt set, midiendo tasa de rechazo y degradación de calidad.
- Evaluación de robustez de filtros: útil para equipos que necesitan probar si sus capas de moderación (guardrails, clasificadores) aguantan un modelo deliberadamente desalineado antes de exponer cualquier LLM a usuarios finales.
- Generación creativa sin fricción: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde el modelo base tiende a rechazar; el Q4_K_M mantiene el modelo en ~20 GB, apto para una sola GPU de 24 GB.
- Procesamiento de documentos con imagen en local: cargando el proyector F16, se puede hacer OCR descriptivo, extracción de tablas o resumen de capturas sin enviar datos a la nube, sobre hardware propio.
- Laboratorio de inferencia comparada: banco de pruebas para medir throughput y perplejidad de Q4_K_M frente a otras cuantizaciones del mismo modelo base en llama.cpp, con hashes SHA-256 que garantizan que se está evaluando exactamente el mismo artefacto.
- Prototipado offline en estación de trabajo: con Ollama o LM Studio y una RTX 4090, se obtiene un asistente local sin dependencia de API para tareas de análisis y redacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye MMLU, HumanEval, GSM8K ni evaluaciones de rechazo propias. Como referencia externa (no de este modelo), la variante `llmfan46/gemma-4-31B-it-uncensored-heretic` reporta 10/100 rechazos y KL de 0,0541 frente al original; son cifras de otro artefacto y no deben atribuirse a este GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa aproximadamente 19,9 GB (tamaño total del repo, incluyendo el proyector F16). Con overhead de contexto y caché KV, prever ~21-24 GB para Q4_K_M a contextos moderados.
- GPU de 24 GB: RTX 4090, RTX 3090, A10G 24GB, L4 24GB. Cabe, pero con margen ajustado; contextos muy largos pueden requerir offload parcial.
- GPU de 32-48 GB: A6000, L40S, A100 40GB. Margen holgado para contextos largos y batch pequeño.
- GPU de 80 GB: A100 80GB / H100. Solo justificable para concurrencia alta o si se sube a cuantizaciones mayores.
- Consumer GPU: sí, en RTX 4090/3090 (24 GB). En tarjetas de 16 GB o menos es necesario offload a CPU/RAM, con caída severa de throughput; en 12 GB el modelo no cabe íntegro en VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (formato de capa compatible), LM Studio, koboldcpp, llama-cpp-python, y RunPod Serverless como destino declarado. vLLM con GGUF es experimental y no es la vía recomendada aquí.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `yuanyeyuanye/llm-gemma4-heretic-31b-q4km` (este) | 30,7B | No disponible | GGUF Q4_K_M + mmproj F16 | Apache-2.0 (con terminos Gemma 4 citados) | Cache para RunPod; hashes SHA-256 documentados; 0 descargas |
| `coder3101/gemma-4-31B-it-heretic` | ≈31B | No disponible | Safetensors (fuente) | Apache-2.0 | Origen directo de la ablacion; sin proyector multimodal |
| `llmfan46/gemma-4-31B-it-uncensored-heretic` | ≈31B | No disponible | No disponible | No disponible | Heretic v1.2.0 ARA; 90% menos rechazos, KL 0,0541 |
| `llmfan46/Gemma-4-Harmonia-31B-uncensored-heretic` | ≈31B | No disponible | Safetensors y GGUF | No disponible | Merge de siete modelos en tres fases; orientado a preservar capacidades |
| `google/gemma-4-31B-it` | ≈31B | No disponible | Safetensors | Terminos Gemma 4 | Modelo base alineado, con rechazos |

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: la ablación heretic elimina buena parte de los rechazos. Puede producir contenido dañino, ilegal o sexualmente explícito sin filtro. No debe exponerse a usuarios finales sin moderación externa.
- Riesgo de degradación de calidad: toda ablación de direcciones introduce pérdida de capacidades. El dato de KL 0,0541 de un modelo hermano sugiere una degradación moderada, pero no hay medición para este artefacto concreto.
- Alucinación: sin benchmarks ni evaluación propia, no hay evidencia de que el proceso heretic preserve la fiabilidad factual del base; asuma el riesgo estándar de un modelo de 31B, posiblemente incrementado.
- Idiomas y contexto no documentados: no se puede planificar una integración multilingüe o de contexto largo sin validación empírica previa.
- Ambigüedad de licencia: el repo se etiqueta Apache-2.0, pero la propia model card enlaza los términos de licencia de Gemma 4. Los términos de Gemma establecen restricciones de uso (incluida una política de uso prohibido) que prevalecen sobre la etiqueta del repositorio. Verificar antes de uso comercial.
- Repositorio no canónico: se trata de una caché de despliegue con 0 descargas y 0 likes, sin model card técnica. Para producción conviene reconstruir el GGUF desde la fuente heretic original y verificar los hashes publicados.
- Visión condicionada: el proyector `mmproj` proviene de un repositorio distinto (unsloth) y no del autor de la ablación; es necesario validar que empareja correctamente con estos pesos antes de confiar en las salidas multimodales.
- Sin garantías de soporte: al ser un artefacto de un particular para un caso de uso concreto (RunPod), no hay mantenimiento, versionado ni issues atendidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yuanyeyuanye/llm-gemma4-heretic-31b-q4km
- Fuente heretic de la ablación: https://huggingface.co/coder3101/gemma-4-31B-it-heretic
- Proyector multimodal de origen: https://huggingface.co/unsloth/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Variante heretic alternativa (referencia de método ARA): https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Variante Harmonia (merge de 31B): https://huggingface.co/llmfan46/Gemma-4-Harmonia-31B-uncensored-heretic
- Variante Harmonia en GGUF: https://huggingface.co/llmfan46/Gemma-4-Harmonia-31B-uncensored-heretic-GGUF
- Guía de LLM locales sin censura por tramo de VRAM (2026): https://insiderllm.com/guides/best-uncensored-local-llms/
