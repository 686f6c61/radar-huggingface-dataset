# whcl412/FinchAI-Rune3-Preview

## Resumen

FinchAI-Rune3-Preview es un ajuste fino (LoRA fusionado) del modelo base Qwen3.5-2B, desarrollado por el usuario independiente whcl412. Se trata de un asistente conversacional local de 1.881.825.088 parámetros (1.88B) orientado a conversaciones multi-turno sostenidas, invocación de herramientas (tool calling) y rechazo seguro de peticiones peligrosas. Su principal novedad frente a la generación anterior (Rune2) es la corrección del problema de repetición degenerada a partir del tercer o cuarto turno de conversación.

El modelo se entrenó con un conjunto de 1134 muestras mediante LoRA (r=8, alpha=16) sobre el Qwen3.5-2B, con un 20,1% de datos específicamente multi-turno (2 a 10 turnos). El resultado es un asistente que mantiene información nueva en cada turno, con razonamiento interno en chino delimitado por etiquetas `<think>` y llamadas a herramientas en formato XML.

Es relevante ahora porque demuestra que un ajuste fino muy ligero (8,41M de parámetros entrenables, 0,44% del total) sobre un modelo pequeño puede resolver patologías concretas de comportamiento conversacional sin necesidad de reentrenar el modelo completo. La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B; tag `qwen3_5_text`) |
| Parametros totales | 1.881.825.088 (1,88B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; rendimiento garantizado solo hasta ~2K tokens según el autor |
| Tipos de cuantizacion | Pesos publicados en bfloat16 sin cuantizar; no se documentan otras variantes |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-2B, identificada en los tags como `qwen3_5_text`. El autor menciona que el modelo base emplea implementaciones de `causal_conv1d` y `flash-linear-attention`, lo que sugiere componentes de convolución causal y atención lineal en lugar de atención cuadrática pura, aunque no se detalla la composición exacta de capas. Los pesos se distribuyen en bfloat16 completo (3,52 GiB), fusionados tras el entrenamiento LoRA.

El ajuste se realizó con LoRA de rango 8 y alpha 16, con 8,41M de parámetros entrenables (0,44% del total), durante 282 pasos en total (141 pasos a learning rate 5e-5 más 141 pasos de continuación a 3e-5). La pérdida descendió de 3,50 a un rango de 1,70–1,90. El entrenamiento se ejecutó en un Mac M4 con 16 GB de RAM mediante MPS. El conjunto de datos consta de 1134 muestras distribuidas en multiturno (228, 20,1%), código (200, 17,6%), sin herramienta (195, 17,2%), chat (195, 17,2%), llamada (103, 9,1%), pregunta (74, 6,5%), identidad (73, 6,4%) y rechazo (66, 5,8%). Cada respuesta del asistente incluye razonamiento en chino (`reasoning_content`). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional multi-turno con mantenimiento de informacion nueva durante al menos 5 turnos consecutivos.
- Razonamiento interno en chino delimitado por `<think>...</think>`, activado mediante `enable_thinking=True` en la plantilla de chat.
- Tool calling y function calling en formato XML con etiquetas `<tool_call>`, `<function>` y `<parameter>`.
- Invocacion multi-paso: el modelo utiliza el resultado de una llamada para decidir la siguiente.
- Eficiencia en el uso de herramientas: evita llamadas redundantes cuando ya dispone de la informacion necesaria.
- Copia literal de parametros (rutas, argumentos) sin reescritura.
- Rechazo seguro de peticiones peligrosas, con contrapropuesta de alternativas mas seguras.
- Adaptacion de la longitud de la respuesta al contexto de la pregunta.
- Generacion de codigo (categoria `code` del dataset, 200 muestras).
- Capacidades multilingues limitadas a chino e ingles.

## Casos de uso

- Asistencia tecnica conversacional multi-turno: el modelo puede mantener un diagnostico de incidencias a lo largo de 5 o mas turnos sin repetir respuestas, como demuestra el ejemplo de latencia P99 del model card, donde progresa desde la identificacion del sintoma hasta la propuesta de consultas SQL concretas.
- Agente local de gestion de ficheros: con herramientas de listado y borrado, el modelo solicita confirmacion antes de ejecutar operaciones destructivas y copia las rutas de forma literal, lo que reduce el riesgo de errores en produccion.
- Automatizacion de tareas con function calling en pipelines: la salida XML estructurada permite parsear las llamadas por etiquetas `<tool_call>` e integrarlas en orquestadores de agentes.
- Asistente de desarrollo en local: con 1,88B de parametros y pesos en bfloat16 (3,52 GiB), cabe en equipos de consumo y puede ejecutarse sin conexion para tareas de generacion de codigo y consultas tecnicas.
- Filtrado y moderacion de peticiones: la categoria `refuse` (66 muestras) entrena al modelo para declinar solicitudes destructivas o ambiguas, util como primera capa de validacion en asistentes de usuario.
- Chatbot de soporte con contexto acotado: recomendado para conversaciones de 8 a 10 turnos con ventana efectiva de unos 2K tokens, adecuado para sesiones de atencion al cliente de alcance limitado.
- Prototipado rapido de agentes conversacionales: el modelo sirve como banco de pruebas para disenos de plantillas de chat, formato de tool calling y politicas de rechazo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta la evolucion de la perdida de entrenamiento (3,50 a 1,70–1,90) y una prueba cualitativa de 5 turnos consecutivos sin repeticion.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,8 GB para los pesos (3,52 GiB reportados) mas el overhead de activaciones y cache KV.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090). El autor lo entreno y ejecuto en un Mac M4 con 16 GB mediante MPS.
- GPU recomendadas para produccion: A100, H100 o L40S para mayor throughput; RTX 4090 para despliegue individual.
- Opciones de despliegue: transformers (requiere `transformers>=5.20`), `accelerate` y `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en GGUF.
- Latencia y throughput: no disponibles. El autor advierte de que `causal_conv1d` y `flash-linear-attention` no tienen implementacion en MPS y se ejecutan mediante implementaciones de referencia, lo que hace el modelo mas lento que un transformer puro del mismo tamano en ese backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FinchAI-Rune3-Preview | 1,88B | 262K (efectivo ~2K) | zh, en | Apache 2.0 | Ajuste LoRA sobre Qwen3.5-2B, tool calling XML |
| Qwen/Qwen3.5-2B | 2B (nominal) | 262K | no disponible en la informacion | Apache 2.0 | Modelo base sin ajuste conversacional especifico |
| FinchAI-Rune2-Luna | no disponible | no disponible | no disponible | no disponible | Generacion anterior del mismo autor; presentaba repeticion a partir del 3er-4o turno |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Recuperacion debil ante resultados vacios de herramientas: si una herramienta devuelve 0 resultados, el modelo puede concluir sin cuestionar si el patron de busqueda era demasiado restrictivo.
- Sesgo por inyeccion de herramientas: ante preguntas de conocimiento general con herramientas de ficheros inyectadas, el modelo puede desviarse hacia preguntas sobre rutas. El autor recomienda decidir por tipo de pregunta si se inyectan herramientas.
- Contexto efectivo limitado: aunque el modelo base soporta 262K tokens, las muestras de entrenamiento no superan los 1411 tokens y el rendimiento no esta garantizado por encima de ~2K. Se recomienda conservar solo los ultimos 8–10 turnos.
- Requisito obligatorio de `enable_thinking=True`: sin este parametro la plantilla cierra el bloque `<think>` en el prompt y el modelo duplica el razonamiento y el cuerpo de la respuesta.
- Cobertura linguistica reducida a chino e ingles; no se documenta soporte de castellano.
- Riesgo de alucinacion no cuantificado: no se publican evaluaciones de fidelidad factual.
- Volumen de datos de entrenamiento muy reducido (1134 muestras), lo que limita la generalizacion fuera de las categorias cubiertas.
- Rendimiento degradado en Apple Silicon por falta de kernels optimizados para `causal_conv1d` y `flash-linear-attention`.
- Uso comercial permitido bajo Apache 2.0, con obligacion de conservar avisos de copyright y licencia.
- Modelo en estado de vista previa (Preview), sin descargas ni validacion externa en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whcl412/FinchAI-Rune3-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Generacion anterior: https://huggingface.co/whcl412/FinchAI-Rune2-Luna
- Primera generacion: https://huggingface.co/whcl412/FinchAI-Rune1-Preview-v2-f16
