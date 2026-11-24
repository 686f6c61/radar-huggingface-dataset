# tablinum/Moon-Beam-8B-A1B-Preview

## Resumen

Moon-Beam-8B-A1B-Preview es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Tablinum, construido a partir del modelo base inclusionAI/Ling-3.0-tiny mediante un ajuste fino con QLoRA. Cuenta con aproximadamente 7.900 millones de parametros totales, alrededor de 1.000 millones activos por token y una ventana de contexto de 131.072 tokens. Su propuesta diferencial no reside solo en los pesos, sino en su integracion con una "biblioteca de conocimiento consultable" denominada *engram*, junto con la herramienta de servidor terrabeam, que inyecta pasajes recuperados en el formato exacto con el que el modelo fue entrenado.

El modelo esta disenado para responder a partir de pasajes recuperados, resolver problemas matematicos, ejecutar llamadas a herramientas (tool calling) y mantener conversaciones multi-turno con memoria de interacciones previas. Incorpora un modo de razonamiento ("thinking") activado por defecto y una capa MTP (multi-token prediction) entrenada para decodificacion especulativa. La licencia es MIT, lo que facilita su adopcion comercial, y se distribuye en varios formatos: BF16, GGUF, FP8 y MLX.

La relevancia actual del modelo estriba en su enfoque de "mismos pesos, mejor arnes": el autor documenta que la precision en tareas de biblioteca pasa del 53,2% al 83,4% simplemente cambiando la infraestructura de recuperacion (terrabeam 0.2 a 0.3), sin modificar los pesos. Esta es una publicacion de previsualizacion (Preview), con la ronda 1b como version final tras no superar la ronda 2 los umbrales de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer hibrida (`bailing_hybrid`: atencion KDA + MLA, MoE) |
| Parametros totales | 7.893.389.856 (~7,9 B) |
| Parametros activos | ~1 B por token (A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (pesos oficiales), FP8, GGUF, MLX, MLX 8-bit |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, 4 shards, 16 GB); tambien GGUF, FP8, MLX |
| Modelo base | inclusionAI/Ling-3.0-tiny |
| Capa MTP | `mtp/mtp_layer.safetensors` (capa 24, 0,63 GB) para decodificacion especulativa |
| Libreria | transformers 4.57 con `trust_remote_code=True` |
| Configuracion de generacion | temperature 1.0, top_p 0.95, top_k 20; thinking activado por defecto |

## Arquitectura y entrenamiento

Moon-Beam emplea la arquitectura `bailing_hybrid` heredada de Ling-3.0-tiny, que combina atencion KDA (Kimi Delta Attention, una forma de atencion lineal) con atencion MLA (Multi-head Latent Attention) dentro de un esquema de mezcla de expertos. El modelo tiene 8B parametros totales pero solo activa aproximadamente 1B por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad representacional. Incluye una capa MTP entrenada especificamente para decodificacion especulativa, lo que acelera la generacion.

El ajuste fino se realizo con QLoRA sobre un dataset compuesto por pasajes recuperados, problemas matematicos, llamadas a herramientas y conversaciones multi-turno. El modelo esta entrenado para consumir pasajes de la biblioteca *engram* en un formato concreto, y su rendimiento depende criticamente de que el arnes de servicio (terrabeam) inyecte dichos pasajes en el layout correcto. La model card indica que la ronda 2 de entrenamiento no supero a la ronda 1b en los umbrales de validacion held-out, por lo que la release publicada corresponde a la ronda 1b. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional en ingles con modo de razonamiento ("thinking") activado por defecto.
- Razonamiento matematico: 95,5% de acierto en 400 preguntas de GSM8K con thinking activado.
- Respuesta basada en recuperacion: entrenado para responder a partir de pasajes de la biblioteca engram (86,5% en EngramBench con pasajes de la propia tabla de cada pregunta).
- Tool calling / function calling: el modelo puede invocar `search_library` con sus propias consultas de forma autonoma y repetida.
- Razonamiento multi-paso: capaz de resolver preguntas de dos pasos mediante busquedas iterativas en la biblioteca.
- Memoria de conversaciones previas: recupera notas de chats anteriores mediante coincidencia de palabras distintivas (nombres, lugares).
- Agente de soporte: evaluado en tau2-bench en dominios de aerolinea, retail y telecom.
- Decodificacion especulativa mediante capa MTP entrenada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Atencion al cliente automatizada: el modelo actua como agente de soporte en dominios como aerolineas y retail (recompensa media de 0,71 en airline y 0,80 en retail en tau2-bench), gestionando conversaciones multi-turno con contexto de hasta 131K tokens y manteniendo el razonamiento entre turnos, lo cual es critico para su rendimiento (0,711 vs 0,045 en airline segun se conserve o descarte el razonamiento previo).
- Asistente con base de conocimiento corporativa: desplegado con terrabeam delante, responde preguntas sobre tablas de datos propietarias recuperando pasajes de la biblioteca engram; el autor reporta 91,7% de acierto en tareas de hechos sobre tablas no vistas durante el entrenamiento.
- Resolucion de problemas matematicos: con thinking activado alcanza 95,5% en GSM8K, adecuado para tutoria automatica o verificacion de calculos en pipelines educativos.
- Agentes con busqueda autonoma: el modelo formula sus propias consultas a `search_library` para resolver preguntas de varios pasos, util en asistentes de investigacion o analisis documental donde la respuesta requiere encadenar varias recuperaciones.
- Asistencia con memoria a largo plazo: integrado con la memoria de terrabeam, recupera hechos personales de conversaciones anteriores (89,6% de acierto en tareas de memoria), apropiado para asistentes personales persistentes.
- Procesamiento de documentos largos: la ventana de 131K tokens permite analizar contratos, informes o expedientes completos en una sola pasada sin fragmentacion.
- Despliegue en hardware de consumo: las variantes GGUF y MLX permiten ejecutar el modelo en equipos locales o Apple Silicon, util para prototipado y aplicaciones de escritorio con requisitos de privacidad.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | thinking on, temp 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos | 95,5% |
| EngramBench (503 preguntas) | thinking on, pasajes de la tabla propia de cada pregunta | 436/503 correctas (86,5%) |
| tau2-bench airline | agente de soporte | recompensa media 0,71 |
| tau2-bench retail | agente de soporte | recompensa media 0,80 |
| tau2-bench telecom | agente de soporte | recompensa media 0,62 |
| Biblioteca, hechos (108 tareas) | terrabeam 0.3 vs 0.2 | 91,7% vs 59,7% |
| Biblioteca, preguntas de dos pasos (22) | terrabeam 0.3 vs 0.2 | 63,6% vs 9,1% |
| Biblioteca, memoria de chats previos (24) | terrabeam 0.3 vs 0.2 | 89,6% vs 64,6% |
| Biblioteca, todas las tareas (154) | terrabeam 0.3 vs 0.2 | 83,4% correctas / 12,0% incorrectas vs 53,2% / 14,6% |
| tau2-bench airline (ablacion) | razonamiento conservado vs descartado | 0,711 vs 0,045 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16 GB solo para pesos, mas overhead de contexto KV; con 131K tokens de contexto el consumo adicional de KV cache es significativo.
- VRAM estimada en FP8: aproximadamente 8 GB para pesos.
- VRAM estimada en GGUF (cuantizacion 4-bit): aproximadamente 4-5 GB para pesos, apto para GPUs de consumo.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en BF16 con contexto completo; RTX 4090 (24 GB) viable en BF16 con contexto moderado o en FP8/GGUF con contexto largo.
- GPU de consumo: si cabe en RTX 4090, RTX 3090 y, en cuantizaciones GGUF bajas, en GPUs de 8-12 GB con contexto reducido.
- Opciones de despliegue: vLLM (`vllm serve ... --trust-remote-code --max-model-len 131072`), SGLang, transformers 4.57 con `trust_remote_code=True`, llama.cpp/Ollama mediante GGUF, MLX en Apple Silicon, y terrabeam como proxy de recuperacion y memoria.
- Latencia y throughput: no disponibles en la informacion proporcionada; la capa MTP esta pensada para decodificacion especulativa y reducir latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B | ~7,9 B | ~1 B | 131.072 | MIT | Especializado en recuperacion con engram/terrabeam; GSM8K 95,5% |
| inclusionAI/Ling-3.0-tiny | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Moon-Beam |
| Alternativas MoE de ~8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado.
- Dependencia del arnes: su rendimiento en tareas de recuperacion depende criticamente de servir los pasajes en el formato exacto de entrenamiento mediante terrabeam; sin el arnes, los resultados caen drasticamente (por ejemplo, 53,2% frente a 83,4% en tareas de biblioteca).
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas incorrectas; la model card reporta un 12,0% de respuestas incorrectas en el conjunto de tareas de biblioteca con terrabeam 0.3.
- Version de previsualizacion: es una release Preview basada en la ronda 1b; la ronda 2 no supero los umbrales de validacion, lo que sugiere margen de mejora y posible inestabilidad en casos no cubiertos.
- Requiere `trust_remote_code=True`: el codigo del modelo se distribuye en el propio repositorio, lo que implica ejecutar codigo de terceros.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Contexto: aunque la ventana es de 131K tokens, el coste de KV cache en contexto completo es elevado y puede limitar el despliegue en GPUs de consumo.
- Licencia MIT: permite uso comercial, pero el modelo base Ling-3.0-tiny puede tener sus propias condiciones que conviene verificar.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Repositorio GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- Repositorio FP8: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-FP8
- Repositorio MLX: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX
- Repositorio MLX 8-bit: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit
- Notas de modelo y evaluacion: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decision de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Release terrabeam 0.3.0: https://github.com/chadstthomas-svg/terrabeam/releases/tag/v0.3.0
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
