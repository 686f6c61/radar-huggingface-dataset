# youssef-khazal/qwen3-4b-demarches-lora

## Resumen

`youssef-khazal/qwen3-4b-demarches-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-4B, desarrollado por youssef-khazal como parte del proyecto independiente Démarches FR, un asistente RAG local para consultas sobre trámites administrativos franceses. El adaptador no funciona de forma autónoma: está diseñado para recibir pasajes de las guías oficiales de Service-Public.fr dentro del prompt y devolver una respuesta en formato JSON con un comportamiento clasificado (answer, clarify, fallback, off-topic, emergency, refuse), el texto de la respuesta y los números de los pasajes citados.

El modelo resuelve un problema acotado pero relevante: mejorar la fidelidad de un modelo pequeño (4B parámetros) a la hora de extraer hechos de documentación administrativa oficial y de admitir cuándo la documentación no cubre una pregunta. Según la model card, frente al Qwen3-4B sin ajustar encuentra un 6,3 % más de hechos esperados (IC 95 % [+1,2, +11,6]) y reduce ligeramente la tasa de contenido inventado, aunque no alcanza al modelo Qwen3-8B con razonamiento que el proyecto usa finalmente en producción.

Es relevante ahora por dos motivos: demuestra que un ajuste fino con QLoRA en una GPU de portátil de 8 GB (3 h 15 min de entrenamiento) puede producir mejoras medibles en una tarea RAG concreta, y publica una evaluación con 163 preguntas de test e intervalos de confianza, algo poco habitual en adaptadores LoRA de nicho. El repositorio ocupa 0,1 GB y solo contiene los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B; rango 16, alpha 32, aplicado a todas las proyecciones de atención y MLP |
| Parametros totales | Adaptador LoRA sobre un modelo base de 4B parámetros (tamaño exacto del adaptador no disponible; repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del Qwen3-4B base; no confirmada) |
| Tipos de cuantizacion | Entrenado con QLoRA cargando el base en 4-bit nf4; el adaptador se publica en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | fr, en, ar (el árabe es el punto débil según el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B por separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-4B, un transformer decoder-only, mediante QLoRA: el modelo base se carga cuantizado en 4-bit nf4 y se inserta un LoRA de rango 16 con alpha 32 en todas las proyecciones de atención y MLP. La pérdida se calcula únicamente sobre los tokens de la respuesta. Se realizaron 2 pasadas con learning rate 2e-4 y batch efectivo de 8; se publica el checkpoint con mejor pérdida de validación (tras la primera pasada). El entrenamiento completo se ejecutó en una GPU de portátil de 8 GB en 3 h 15 min.

Los datos de entrenamiento consisten en 658 respuestas generadas por el asistente final del proyecto (Qwen3-8B con razonamiento, más comprobaciones en código) y filtradas mediante verificaciones automáticas. Las preguntas se generaron a partir de las fichas oficiales en francés (registro formal, hablado y SMS), inglés y árabe, excluyendo las fichas que responden a las 163 preguntas del conjunto de test para evitar contaminación. El adaptador espera el prompt construido por `Assistant.build_messages` del proyecto, con el modo de razonamiento desactivado (`enable_thinking=False`), y no está pensado para responder sin los pasajes de contexto del pipeline RAG.

## Capacidades

- Generación de texto con salida estructurada en JSON: comportamiento clasificado, respuesta y lista de pasajes citados.
- Extracción de hechos a partir de pasajes de documentación administrativa francesa proporcionados en el contexto (RAG).
- Clasificación de intención en seis comportamientos: answer, clarify, fallback, off-topic, emergency y refuse.
- Citación de fuentes mediante números de pasaje, lo que permite verificar la respuesta contra el contexto.
- Capacidad de declarar que las guías no cubren una pregunta (fallback), mejorada respecto al modelo base.
- Multilingüe en fr, en y ar, con rendimiento notablemente inferior en árabe según el autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (de hecho, el uso previsto desactiva el thinking).

## Casos de uso

- Asistente RAG de trámites administrativos franceses: integrado en el pipeline del proyecto Démarches FR, recibe los pasajes recuperados de Service-Public.fr y devuelve una respuesta citada en JSON, lo que permite mostrar al usuario las fuentes exactas.
- Clasificación y enrutado de consultas ciudadanas: el campo de comportamiento permite derivar consultas de emergencia, fuera de alcance o ambiguas a flujos específicos (clarificación, rechazo o escalado a un operador humano) sin coste adicional de un segundo modelo.
- Despliegue local con recursos limitados: al ser un adaptador sobre un modelo de 4B, puede servirse en hardware modesto (el autor entrenó en una GPU de 8 GB), lo que encaja en escenarios de privacidad donde los datos del usuario no deben salir del equipo.
- Prototipado rápido de asistentes documentales en otros dominios: la receta (QLoRA rango 16, 658 ejemplos filtrados, salida JSON con citas) es replicable para corpus normativos o manuales internos con presupuesto de cómputo mínimo.
- Evaluación comparativa de pipelines RAG: el conjunto de 163 preguntas y la metodología de grading (LLM judge y grading de referencia con Claude) sirven como base para medir el impacto del ajuste fino frente al modelo base en una tarea concreta.
- Filtro de alucinaciones en producción: la mejora en la detección de preguntas no cubiertas por las guías permite reducir respuestas inventadas en un 2,4 % absoluto (de 32,5 % a 30,1 % según el LLM judge), útil como capa de seguridad antes de mostrar contenido al usuario.
- Experimentación académica con adaptadores pequeños: útil para estudiar la relación entre tamaño de modelo, ajuste fino y fidelidad a las fuentes en tareas de question answering sobre documentos.

## Benchmarks y rendimiento

Evaluación sobre 163 preguntas de test con la misma búsqueda y prompt del proyecto:

| Modelo | Comportamiento correcto | Hechos encontrados | Respuestas con contenido inventado |
|---|---|---|---|
| Qwen3-4B sin ajustar (LLM judge) | 73,6 % | 72,3 % | 32,5 % |
| Este adaptador (LLM judge) | 79,8 % | 78,7 % | 30,1 % |
| Este adaptador (grading de referencia) | 85,9 % | 76,3 % | 27,0 % |
| Qwen3-8B con razonamiento, modelo final del proyecto (grading de referencia) | 92,6 % | 81,4 % | 15,3 % |

- Mejora en hechos encontrados frente al 4B base: +6,3 puntos, IC 95 % [+1,2, +11,6].
- LLM judge: Qwen3-8B. Grading de referencia: cada respuesta revisada contra sus pasajes por Claude.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador se suma al modelo base Qwen3-4B. En 4-bit nf4 el base ocupa aproximadamente 2-3 GB; en fp16, en torno a 8 GB. Cifras exactas no disponibles en la información proporcionada.
- GPU recomendadas: el autor entrenó en una GPU de portátil de 8 GB, por lo que la inferencia cabe en GPUs consumer de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090). Para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, según la evidencia del entrenamiento en 8 GB; la inferencia en 4-bit debería caber en GPUs de 6-8 GB.
- Opciones de despliegue: PEFT + Transformers (documentado en la model card), y por compatibilidad con el base Qwen3-4B, herramientas como vLLM, TGI, llama.cpp u Ollama previa fusión del adaptador con el modelo base. No se documenta configuración específica para estas herramientas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea (hechos / comportamiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA) | 4B + adaptador | No disponible | 78,7 % / 79,8 % (LLM judge) | apache-2.0 | Hugging Face |
| Qwen3-4B base | 4B | No disponible | 72,3 % / 73,6 % (LLM judge) | apache-2.0 | Hugging Face |
| Qwen3-8B con razonamiento (modelo final del proyecto) | 8B | No disponible | 81,4 % / 92,6 % (grading de referencia) | No disponible en la información | Uso interno del proyecto |

No se dispone de datos de otros adaptadores LoRA comparables para esta tarea específica en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el pipeline de búsqueda y el prompt del proyecto (`Assistant.build_messages`) no está pensado para responder preguntas.
- Ofrece información general extraída de guías oficiales; no constituye asesoramiento legal. Puede confundir reglas entre casos próximos, como se mide en la evaluación.
- Tasa de contenido inventado del 27-30 % según el método de evaluación: sigue siendo un riesgo relevante en producción y requiere verificación contra las fuentes citadas.
- El árabe es el punto débil declarado por el autor; el rendimiento multilingüe no es homogéneo.
- No alcanza al Qwen3-8B con razonamiento del proyecto (85,9 % vs 92,6 % en comportamiento correcto con grading de referencia).
- Proyecto independiente, no afiliado ni respaldado por la administración francesa.
- Los datos de entrenamiento incluyen pasajes de Service-Public.fr (DILA) bajo Licence Ouverte / Open Licence 2.0, lo que impone obligaciones de atribución sobre ese contenido.
- El adaptador se publica sin el modelo base; es necesario descargar Qwen/Qwen3-4B por separado y respetar su licencia.
- No hay información sobre sesgos específicos más allá de los medidos en la evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/youssef-khazal/qwen3-4b-demarches-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del proyecto Démarches FR: https://github.com/youssef-khazal/fr-admin-assistant
- Metodología y resultados completos del ajuste fino: https://github.com/youssef-khazal/fr-admin-assistant/blob/main/finetune/README.md
- Fuente de datos: Service-Public.fr / DILA (Licence Ouverte / Open Licence 2.0)
