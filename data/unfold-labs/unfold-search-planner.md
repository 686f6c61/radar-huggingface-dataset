# unfold-labs/unfold-search-planner

## Resumen

Unfold search planner es un modelo de generación de texto derivado de Qwen/Qwen3.5-0.8B, publicado por unfold-labs como componente del motor de búsqueda offline de la aplicación Unfold Note. Su función no es conversacional general: recibe una pregunta del usuario sobre sus propias notas de Obsidian (junto con los últimos turnos de la conversación) y devuelve hasta tres consultas de búsqueda adicionales en formato JSON, que la aplicación utiliza para recuperar notas relevantes mediante un embedder.

El modelo no ha sido entrenado ni ajustado: se distribuye como una redistribución sin cambios del fichero `Qwen3.5-0.8B-Q4_K_M.gguf` del repositorio `unsloth/Qwen3.5-0.8B-GGUF`, acompañado de un system prompt específico (`planner-prompt.md`) escrito para la tarea de planificación de consultas. La adaptación al caso de uso reside, por tanto, en el prompt y en la decodificación restringida a un esquema JSON, no en los pesos.

Con 752.393.024 parámetros (~0,75B) y cuantización Q4_K_M, el modelo está pensado para ejecutarse en CPU mediante node-llama-cpp (llama.cpp), con un contexto de 2048 tokens y un consumo de memoria de aproximadamente 1 GB. Es relevante como ejemplo de integración de un LLM pequeño y cuantizado en una aplicación de escritorio con requisitos estrictos de latencia (mediana de 1141 ms en 4 hilos) y de privacidad (todo el procesamiento ocurre en el dispositivo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; detalles de la arquitectura base no disponibles en la información proporcionada) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2048 tokens (configuración de la aplicación); contexto nativo del modelo base no disponible |
| Tipos de cuantización | Q4_K_M (única publicada) |
| Idiomas soportados | fr, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`model.gguf`) |

## Arquitectura y entrenamiento

El modelo es una redistribución directa del GGUF Q4_K_M de Qwen3.5-0.8B, generado originalmente por unsloth. No hay entrenamiento, fine-tuning ni destilación por parte de unfold-labs: los pesos son idénticos al fichero de origen, y la única pieza nueva es el system prompt `planner-prompt.md`, redactado específicamente para la tarea de planificación de consultas. La arquitectura subyacente es la del modelo base Qwen3.5-0.8B, cuyos detalles internos (tipo de atención, composición del dataset de preentrenamiento, uso de RLHF o DPO) no se documentan en la información disponible.

La innovación técnica está en el pipeline de inferencia: se emplea el formato de chat `qwen3.5-nothink` (ChatML de Qwen3.5 con el modo de razonamiento desactivado), decodificación greedy y decodificación restringida al esquema JSON `{"queries": [{"text": ...}]}`, con un máximo de tres consultas de hasta 300 caracteres cada una. La respuesta se limita a 400 tokens. El repositorio incluye un fichero `planner-model.json` con tamaños y hashes SHA-256 de `model.gguf` y `planner-prompt.md`, que la aplicación verifica tras la descarga.

## Capacidades

- Generación de consultas de búsqueda en formato JSON estructurado, hasta tres por petición, a partir de una pregunta y los últimos turnos de conversación.
- Decodificación restringida por gramática al esquema `{"queries": [{"text": ...}]}`.
- Comprensión de preguntas en francés e inglés.
- Ejecución totalmente offline en CPU mediante llama.cpp / node-llama-cpp.
- Integración con el formato de chat ChatML de Qwen3.5 con el modo thinking desactivado.
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni matemáticas avanzadas; el modelo está especializado en la tarea de planificación de consultas.

## Casos de uso

- Búsqueda semántica sobre notas personales de Obsidian: el planner genera hasta tres reformulaciones de la pregunta del usuario que se pasan al embedder para recuperar notas relevantes; en la evaluación del autor, el plan combinado con el embedder alcanza un hits@8 de 0,880.
- Chat con contexto documental en aplicaciones de escritorio: al ejecutarse en CPU con ~1 GB de memoria, permite ofrecer recuperación aumentada sobre documentos locales sin enviar datos a la nube.
- Desambiguación de consultas ambiguas: cuando la pregunta del usuario es vaga, el modelo produce variantes con sinónimos o entidades implícitas que amplían la cobertura de la búsqueda.
- Expansión de consultas multi-turno: al recibir los últimos turnos, puede resolver referencias como "esa reunión" o "lo de ayer" en consultas autocontenidas.
- Filtrado previo en pipelines de RAG locales: el plan se descarta si no llega dentro del presupuesto de tiempo, de modo que actúa como capa opcional de mejora sobre la consulta original.
- Prototipado de planners de búsqueda en dominios acotados: sirve como referencia de cómo un modelo de menos de 1B parámetros, con prompt y gramática JSON, puede cubrir una tarea de planificación con latencias de ~1,1 s en CPU de consumo.
- Aplicaciones con requisitos de privacidad estrictos: al no requerir red ni GPU, encaja en entornos donde las notas del usuario no pueden salir del dispositivo.

## Benchmarks y rendimiento

Evaluación del autor con el runtime propio de la aplicación, 4 hilos, sobre una instantánea privada de notas (50 preguntas gold; notas y preguntas no publicadas). Un plan se considera válido cuando el runtime devuelve una respuesta; hits@8 es la proporción de preguntas cuya nota esperada aparece entre los 8 primeros resultados.

| Medida | Valor | Umbral |
|---|---|---|
| Preguntas respondidas con plan válido | 50/50 | todas |
| hits@8 (búsqueda con plan + embedder) | 0,880 | >= 0,86 |
| MRR | 0,746 | informado |
| Latencia mediana del plan, 4 hilos | 1141 ms | <= 1500 ms |
| Máquina de medida | Intel Core i7-14700F, 28 núcleos lógicos, 32 GB, win32 x64 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; consumo de memoria de aproximadamente 1 GB con contexto de 2048 tokens en CPU.
- GPU recomendadas: no aplica; el despliegue documentado es en CPU.
- Cabe en cualquier equipo de consumo con al menos ~1 GB de memoria libre; la medición de referencia se hizo en un Intel Core i7-14700F con 32 GB de RAM.
- Opciones de despliegue: node-llama-cpp (llama.cpp) es el runtime documentado; al ser un GGUF estándar, es compatible con otros frontends de llama.cpp, aunque la aplicación verifica hashes y espera el formato de chat `qwen3.5-nothink`.
- Latencia: mediana de 1141 ms por plan con 4 hilos en la máquina de referencia. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| unfold-search-planner | 752.393.024 | 2048 (app) | Planificación de consultas JSON para búsqueda en notas | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generación de texto general | Apache-2.0 | safetensors y GGUF |
| unsloth/Qwen3.5-0.8B-GGUF | ~0,8B | no disponible | Cuantizaciones del base | Apache-2.0 | GGUF (varias) |

El planner se diferencia del base y de la cuantización de unsloth únicamente por el prompt de sistema y la configuración de decodificación; los pesos son los mismos. No se dispone de datos de benchmarks comparativos con otros planners de consultas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 0,8B: según el autor, a menudo repite o reformula la pregunta y puede omitir nombres o fechas.
- El plan solo se conserva si llega dentro del presupuesto de tiempo; la aplicación busca primero con la pregunta original, de modo que un plan débil nunca sustituye a la consulta del usuario.
- Idiomas limitados a francés e inglés; el rendimiento en castellano no está documentado.
- Contexto de 2048 tokens y respuestas limitadas a 400 tokens, con consultas de hasta 300 caracteres.
- No ha sido entrenado ni ajustado: su calidad depende enteramente del prompt y de la gramática JSON impuesta.
- Evaluación realizada sobre una instantánea privada de notas; los resultados (hits@8 de 0,880, MRR de 0,746) no son reproducibles externamente.
- Licencia Apache-2.0, que permite uso comercial; se heredan las condiciones del modelo base y del repositorio de cuantización de origen.
- Riesgo de alucinación en la formulación de consultas: puede introducir términos no presentes en la pregunta original.
- Sin descargas ni likes en el momento de la consulta; ecosistema de terceros prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/unfold-labs/unfold-search-planner
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GGUF de origen: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF (commit `6ab461498e2023f6e3c1baea90a8f0fe38ab64d0`)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- node-llama-cpp: https://github.com/withcatai/node-llama-cpp
