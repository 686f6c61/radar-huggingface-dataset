# zengrh3/memloop-sft-v6-callback-run03-epoch5

## Resumen

MemLoop SFT v6 (callback), epoch 5, es un ajuste fino supervisado (SFT) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario zengrh3. El modelo está entrenado para desempeñar los tres roles de un sistema de memoria de largo plazo (memory, retrieval y answer) y, de forma destacable, para "llamar de vuelta" (callback): detectar un fallo en su propia salida o en la de un agente anterior, redactar un feedback específico y forzar que ese agente repita el paso. Es el checkpoint de partida de las ejecuciones de RL con GRPO del proyecto MemLoop.

El modelo conserva la arquitectura y el tamaño del Qwen3-4B-Instruct-2507 original, con 4.411.424.256 parámetros reales según los pesos en safetensors y un repositorio de 8,8 GB. La ventana de contexto nativa de Qwen3-4B-Instruct-2507 es de 262.144 tokens, aunque la model card no la menciona explícitamente para este ajuste. El entrenamiento se realizó sobre el benchmark LongMemEval y se evaluó también en LoCoMo, con un juez GPT-4o-mini.

Su relevancia actual radica en que aborda un problema concreto de los sistemas multiagente con memoria: la propagación de errores entre etapas. En lugar de tratar la memoria como un pipeline unidireccional, el modelo aprende a revisar y a corregir hacia atrás, lo que mejora la precisión en LongMemEval de 72,25 a 75,00 y en LoCoMo de 74,88 a 80,84 cuando se ejecutan los callbacks. La licencia Apache 2.0 facilita su uso comercial y su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino SFT sobre Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens (rope_theta 5000000) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3, con 4.411 millones de parámetros, obtenido por ajuste fino supervisado del checkpoint Qwen3-4B-Instruct-2507. El entrenamiento corresponde a la ejecución `sft-longmemeval-membuilder-callback-v6-2026-11-18-run03`, epoch 5 de 10 (step 1050), seleccionada como la mejor epoch en LongMemEval con callbacks. El código de entrenamiento está en la rama `memoalign` del repositorio `github.com/zengrh3/Memloop`, con la configuración SFT en `training/sft/longmemeval/membuilder/` y el RL posterior en `thirdparty/miles/examples/memloop_grpo_callback/`.

La innovación principal es el formato de interacción con callbacks. Cada agente responde con exactamente una llamada a herramienta en el formato `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, y los argumentos terminan con dos campos de control: `revisit_agent` (valores `none`, el propio agente o un agente anterior, siguiendo la cadena memory ← retrieval ← answer) y `feedback` (vacío si `revisit_agent` es `none`, o una descripción corta y específica de lo que está mal o falta). Un agente al que se le pide rehacer su trabajo ve el feedback en su entrada, y cada entrada termina con `Callback budget: N`, con un máximo de un callback por agente y tres por trayectoria. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de su vinculación con LongMemEval y LoCoMo. Tampoco se detalla si hubo RLHF o DPO en esta fase, más allá de que este checkpoint es la base para ejecuciones posteriores de RL con GRPO.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat específica (sin modo thinking).
- Emisión de llamadas a herramienta en formato estructurado XML/JSON (`<tool_call>`), una por turno.
- Desempeño de tres roles de agente diferenciados: memory, retrieval y answer.
- Autoevaluación y crítica: detecta errores en su propia salida o en la de un agente anterior y redacta feedback específico.
- Reejecución de pasos con feedback incorporado en la entrada (mecanismo de callback).
- Gestión de un presupuesto de callbacks (`Callback budget: N`) con límites por agente y por trayectoria.
- Razonamiento multi-paso dentro de un pipeline de agentes con dependencias hacia atrás.
- Memoria de largo plazo: recuperación y consolidación de información a lo largo de conversaciones extensas (evaluado en LongMemEval y LoCoMo).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni código en la información disponible.

## Casos de uso

- Asistentes conversacionales con memoria persistente: el modelo puede actuar como agente de memoria que consolida y recupera información de conversaciones largas, y como agente de respuesta que la utiliza, con la ventaja de que puede pedir al agente de retrieval que repita la búsqueda si detecta que la información recuperada no responde a la pregunta.
- Sistemas RAG multiagente con autocorrección: en un pipeline retrieval → answer, el agente de respuesta puede emitir un callback al de retrieval con un feedback concreto ("falta la fecha del evento X") cuando la evidencia recuperada es insuficiente, evitando respuestas alucinadas.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso, donde el agente de memoria mantiene el estado del cliente y el de respuesta puede revisar hacia atrás si detecta inconsistencias en datos ya registrados.
- Investigación y evaluación de agentes de memoria: al ser el checkpoint de partida de las ejecuciones de GRPO del proyecto MemLoop, sirve como baseline reproducible para estudiar el efecto del feedback estructurado en pipelines de agentes.
- Construcción de bases de conocimiento conversacionales: el rol de memory permite extraer y estructurar hechos de diálogos, con callbacks que corrigen extracciones incompletas antes de persistirlas.
- Despliegue en producción con vLLM o SGLang: el modelo es lo bastante pequeño (4,4B parámetros) para servirse en una sola GPU con latencia baja, integrándose en backends de agentes que orquestan los tres roles mediante llamadas a herramienta.
- Prototipado de arquitecturas de agentes con presupuesto de revisión: el campo `Callback budget` permite experimentar con políticas de corrección acotadas (máximo tres callbacks por trayectoria) para controlar coste y latencia.

## Benchmarks y rendimiento

Evaluación con juez GPT-4o-mini. LongMemEval: 400 preguntas de test. LoCoMo: 856 preguntas (conversaciones 41, 42, 48, 49 y 50). "With callbacks" ejecuta los callbacks que escribe el modelo; "without callbacks" los ignora.

| Benchmark | Modo | Accuracy | F1 | BLEU-1 |
|---|---|---|---|---|
| LongMemEval | with callbacks | 75,00 | 49,79 | 42,05 |
| LongMemEval | without callbacks | 72,25 | 47,32 | 39,68 |
| LoCoMo | with callbacks | 80,84 | 49,76 | 43,79 |
| LoCoMo | without callbacks | 74,88 | 46,54 | 41,07 |

El efecto de los callbacks es positivo en ambos benchmarks: +2,75 puntos de accuracy en LongMemEval y +5,96 puntos en LoCoMo. No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,8 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, entre 10 y 12 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 4,5 GB de pesos; a 4 bits (si se generan pesos GGUF/AWQ, no publicados): alrededor de 2,5 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con vLLM o SGLang; RTX 4090 (24 GB) para desarrollo y pruebas con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en tarjetas de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Opciones de despliegue: vLLM o SGLang según la model card, usando los ficheros del repositorio tal cual (el `config.json` incluye `rope_theta` 5000000). No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MemLoop SFT v6 (callback) | 4,41B | no disponible (base: 262.144) | Apache 2.0 | Agentes de memoria con callbacks |
| Qwen3-4B-Instruct-2507 (base) | 4,41B | 262.144 | Apache 2.0 | Instrucción general |
| Modelos de memoria de largo plazo comparables | no disponible | no disponible | no disponible | no disponible |

El único comparable directo identificable en la información disponible es el modelo base Qwen3-4B-Instruct-2507, del que hereda arquitectura, tamaño y licencia, pero que no incorpora el formato de agentes ni el mecanismo de callbacks. No se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; su uso en castellano u otros idiomas no está validado y probablemente degrade el rendimiento.
- El formato de salida es rígido: exactamente una llamada a herramienta por turno con los campos `revisit_agent` y `feedback`; cualquier uso fuera de este protocolo puede producir respuestas malformadas.
- Requiere la plantilla de chat específica incluida con el modelo y opera sin modo thinking; no debe usarse con plantillas de Qwen3 estándar que activen razonamiento extendido.
- El presupuesto de callbacks está acotado (uno por agente, tres por trayectoria); el modelo no está entrenado para revisiones ilimitadas.
- Riesgo de alucinación inherente a modelos de 4B parámetros, especialmente en tareas de recuperación de memoria donde el feedback podría basarse en información incorrecta y propagar el error en lugar de corregirlo.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El rendimiento reportado depende de un juez GPT-4o-mini y de conjuntos de test concretos (400 preguntas de LongMemEval, 856 de LoCoMo); la generalización a otros dominios no está verificada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B-Instruct-2507, también Apache 2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zengrh3/memloop-sft-v6-callback-run03-epoch5
- Repositorio de código (rama `memoalign`): https://github.com/zengrh3/Memloop
- Configuración de entrenamiento SFT: `training/sft/longmemeval/membuilder/` dentro del repositorio anterior
- Configuración de RL con GRPO: `thirdparty/miles/examples/memloop_grpo_callback/` dentro del repositorio anterior
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
