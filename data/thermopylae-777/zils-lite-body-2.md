# thermopylae-777/zils-lite-body-2

## Resumen

zils-lite-body-2 es un modelo de decisión de 853 millones de parámetros publicado por el usuario thermopylae-777 en HuggingFace. Forma parte del ecosistema Zils, concretamente del pool de modelos «d3-lite» asociado al subnet 127 de Bittensor. El modelo no es un asistente conversacional al uso: está diseñado para emitir decisiones tipadas sobre opciones discretas (selección de herramientas, clasificación de intenciones, elección entre alternativas), un formato que el autor denomina «decision body».

Técnicamente se construye sobre el chasis de Qwen3.5-0.8B, incluyendo sus tensores de lenguaje y de visión en bf16, y se afina mediante un LoRA combinado sobre el promedio uniforme de tres modelos del pool (vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full). El entrenamiento combina destilación desde un modelo mayor (vllm-sr/d3-ultra), aprendizaje supervisado sobre preguntas generadas sintéticamente y una regularización KL que preserva el comportamiento del modelo de partida.

Su relevancia es acotada pero específica: ofrece un punto de partida reproducible para experimentar con modelos de decisión pequeños, con licencia Apache-2.0 y pesos en safetensors, en un contexto de investigación (subnet de Bittensor) más que de producto comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica un artefacto recién publicado y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-0.8B, con capas de atención y proyecciones Gated-DeltaNet (24 capas de lenguaje) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (las filas de entrenamiento se truncaron a 1.024 tokens) |
| Tipos de cuantización | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere carga con código propio) |

## Arquitectura y entrenamiento

El modelo reutiliza el layout del chasis d3-lite, que a su vez corresponde a Qwen3.5-0.8B: 24 capas de lenguaje con tensores de visión heredados del modelo base, almacenados en bf16. La innovación arquitectónica destacable es la presencia de proyecciones Gated-DeltaNet (in_proj_qkv, in_proj_z, in_proj_b, in_proj_a, out_proj) junto a las proyecciones de atención clásicas (q/k/v/o), lo que sugiere un diseño híbrido entre atención estándar y mecanismos de estado lineal. El repositorio requiere `custom_code`, por lo que no es cargable con un `AutoModel` estándar sin el código del autor.

El entrenamiento consistió en una única época de LoRA (rango 16, alpha 32, dropout 0.05, lr 1e-4) aplicada exclusivamente a las matrices de proyección de atención y Gated-DeltaNet de las 24 capas, posteriormente fusionada en los pesos. La función de pérdida combina tres términos: KL forward hacia las probabilidades de opción del profesor vllm-sr/d3-ultra sobre 49.906 preguntas de destilación, entropía cruzada sobre 20.399 preguntas generadas por el propio autor con respuesta calculada, y KL hacia las probabilidades del modelo de partida sobre 15.858 filas de regularización. Se descartaron las filas de más de 1.024 tokens. Los datos de destilación provienen de zils-ai/zils-relay-answers y de conjuntos públicos como ARC, BANKING77, BFCL-tool-selection, HellaSwag, MMLU, WinoGrande e iSarcasmEval, entre otros.

## Capacidades

- Emisión de decisiones tipadas sobre conjuntos de opciones discretas, el formato central para el que fue entrenado.
- Selección de herramientas (tool selection) y política de llamada a herramientas, según los conjuntos BFCL-tool-selection usados en el entrenamiento.
- Clasificación de intenciones en dominios de atención al cliente (BANKING77).
- Razonamiento de sentido común y elección entre alternativas (ARC, HellaSwag, WinoGrande).
- Respuesta a preguntas de conocimiento general (MMLU).
- Detección de sarcasmo e ironía en inglés (iSarcasmEval-A-En y C-En).
- Tareas de conteo, cobertura, formas de palabras, sílabas y puntuación basada en reglas, cubiertas por los generadores sintéticos del autor.
- Capacidades de visión heredadas del chasis Qwen3.5-0.8B (tensores de visión presentes), aunque no se documenta su rendimiento tras el afinado.
- Soporte multilingüe: no disponible; no se especifican idiomas.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo puede recibir una consulta y un catálogo de herramientas y devolver la opción más probable, aprovechando el entrenamiento específico sobre BFCL-tool-selection para pipelines de function calling de bajo coste.
- Clasificación de tickets de soporte: con el entrenamiento sobre BANKING77, puede asignar intenciones a consultas de clientes en un dominio financiero, sirviendo como clasificador previo a un LLM mayor.
- Filtro de decisiones en sistemas multiagente: al ser un modelo de 853 M, puede actuar como «cabeza de decisión» que selecciona qué subagente o herramienta invocar antes de delegar en un modelo más grande.
- Evaluación de opciones en pipelines de QA: dado un contexto y varias respuestas candidatas, el modelo puntúa cada opción, útil para reranking ligero en sistemas de recuperación aumentada.
- Detección de sarcasmo en moderación de contenido: el afinado sobre iSarcasmEval permite usarlo como clasificador auxiliar en inglés para marcar mensajes irónicos.
- Prototipado de investigación en subnets de Bittensor: sirve como «body» de referencia para experimentar con el pool d3-lite, comparar variantes y medir el efecto de la destilación desde d3-ultra.
- Despliegue en dispositivos con recursos limitados: con 853 M de parámetros y pesos bf16 (1,7 GB de repositorio), es viable en GPUs de consumo para tareas de clasificación de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB (no se publican GGUF oficiales, requeriría conversión propia).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, con mayor margen en las de gama alta.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 4 GB o más.
- Opciones de despliegue: vLLM (el modelo base vllm-sr/d3-lite sugiere compatibilidad con vLLM), llama.cpp y Ollama previa conversión a GGUF; TGI no está confirmado. Requiere `custom_code`, por lo que hay que revisar el código del autor antes de desplegar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-body-2 | 853 M | No disponible | Apache-2.0 | Decisión tipada, destilado de d3-ultra | HuggingFace, 0 descargas |
| Qwen3.5-0.8B | ~800 M | No disponible en esta ficha | Apache-2.0 | LLM generalista y visión | HuggingFace, ampliamente usado |
| Maincode/Matilda-Decision-v1-Edge | No disponible | No disponible | No disponible | Decisión (modelo del mismo pool) | HuggingFace |
| vllm-sr/d3-lite | No disponible | No disponible | Apache-2.0 | Chasis del pool d3-lite | HuggingFace |

La comparación con Qwen3.5-0.8B es la más informativa: zils-lite-body-2 hereda su chasis pero sustituye el comportamiento generalista por un afinado específico de decisión, por lo que pierde capacidad conversacional abierta a cambio de especialización en selección de opciones.

## Limitaciones y advertencias

- Modelo especializado en decisiones discretas: no está pensado como asistente conversacional general y su rendimiento en generación libre de texto probablemente sea pobre tras el afinado.
- Entrenamiento limitado a 1.024 tokens por fila: no hay evidencia de comportamiento correcto con contextos largos, y la longitud de contexto real no se documenta.
- Idiomas no especificados: los conjuntos de entrenamiento son mayoritariamente en inglés, por lo que el soporte de castellano no está garantizado.
- Riesgo de alucinación en las probabilidades de opción: al ser un modelo destilado de un profesor mayor, puede reproducir sesgos y errores del profesor (d3-ultra) sin que exista una validación independiente.
- Licencias de los datos de entrenamiento: el autor advierte que parte del texto fuente tiene licencias share-alike y copyleft (CC BY-SA, GPL), aunque el repositorio solo contiene pesos. No es asesoramiento legal; conviene revisar los términos de los datasets originales antes de un uso comercial.
- Requiere `custom_code`: la carga no es estándar y depende del código del autor, lo que añade riesgo de seguridad y de mantenimiento en producción.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.
- Publicado en 2026-11-04, un artefacto muy reciente y sin historial de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Modelo base vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base Maincode/Matilda-Decision-v1-Edge: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Modelo base zils-ai/jiwo-0.8b-full: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Dataset de respuestas del relay: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset de decisiones tipadas de tasksource: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Modelo Qwen3.5-0.8B (chasis): https://huggingface.co/Qwen/Qwen3.5-0.8B
