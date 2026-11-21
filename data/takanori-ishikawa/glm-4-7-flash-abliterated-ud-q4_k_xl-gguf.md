# takanori-ishikawa/GLM-4.7-Flash-Abliterated-UD-Q4_K_XL-GGUF

## Resumen

GLM-4.7-Flash-Abliterated-UD-Q4_K_XL-GGUF es una versión "abliterada" (sin mecanismos de rechazo) del modelo GLM-4.7-Flash de Zhipu AI (zai-org), publicada por el usuario takanori-ishikawa. Se distribuye como un único archivo GGUF cuantizado en UD-Q4_K_XL, partiendo de la cuantización de Unsloth, y está pensada para investigación sobre comportamiento de rechazo y para probar evaluaciones de seguridad. El modelo conserva la arquitectura, la plantilla de chat y los metadatos del GGUF original; solo cambian los valores de los tensores editados durante el proceso de abliteración.

El modelo base tiene 29.943.393.920 parámetros (aproximadamente 30B) y se distribuye en un archivo de 17,52 GB, lo que lo hace ejecutable en equipos con memoria unificada relativamente modesta (el autor lo evalúa en un Mac mini M4 Pro con 64 GB de RAM). La relevancia actual radica en que documenta de forma rigurosa el efecto de la abliteración sobre las capacidades del modelo (GSM8K, MMLU-Pro) y sobre tareas de seguridad (HarmBench, XSTest, CyberSecEval, CTI-MCQ, AgentDojo), con metodología reproducible y tests estadísticos.

La licencia es MIT, lo que permite uso comercial, aunque el modelo está etiquetado como "uncensored" y su uso en producción conlleva riesgos de seguridad evidentes que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de GLM-4.7-Flash; el autor no la detalla) |
| Parametros totales | 29.943.393.920 (~30B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor menciona límites de salida de 16K y 32K tokens en evaluación, no la ventana de contexto) |
| Tipos de cuantizacion | GGUF Q4_K_XL (variante UD, "Unsloth Dynamic") |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único, 17.520.169.312 bytes) |

## Arquitectura y entrenamiento

El modelo es una edición por abliteración de GLM-4.7-Flash. La abliteración consiste en identificar y eliminar direcciones en el espacio de activaciones (típicamente en capas residuales intermedias) asociadas al comportamiento de rechazo, sin reentrenar los pesos. En este caso, el autor probó al menos una variante intermedia ("layer24-k1", que elimina la dirección residual de la capa 24 sin biproyección ni preservación de norma) antes de fijar la versión final. El archivo difiere del UD-Q4_K_XL de Unsloth únicamente en los valores de los tensores editados; los metadatos GGUF, los tipos de tensor y la plantilla de chat son idénticos.

No se dispone de información sobre los datos de entrenamiento originales de GLM-4.7-Flash (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. La evaluación se realizó con el fork de llama.cpp en el commit `5c4fc1a68` (sucesor `ddf120c50`), con muestreo a temperatura 1.0, top-p 0.95, top-k 20, min-p 0 y semilla 407, con "thinking" activado y sin presupuesto de razonamiento separado.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Razonamiento con modo "thinking" (el autor indica que el razonamiento largo puede agotar el límite de salida; en evaluación usó 16K tokens de salida y regeneró con 32K).
- Razonamiento matemático: 47/50 correctas en el subconjunto de test de GSM8K.
- Conocimiento y razonamiento general: 42/50 correctas en el subconjunto de test de MMLU-Pro.
- Uso de herramientas y agentes: evaluado con la suite AgentDojo (workspace), con utilidad de 36/40 y 406/560 bajo ataque de inyección de prompts.
- Conocimiento de ciberseguridad: 127/200 correctas en CTI-MCQ.
- Capacidad de rechazo eliminada: 0 rechazos en 100 peticiones seguras de XSTest y 91/100 cumplimientos en HarmBench estándar.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre comportamiento de rechazo: el modelo sirve como referencia para estudiar qué direcciones de activación codifican la negativa a responder, comparando con el original y con otras abliteraciones (huihui-ai, layer24-k1) bajo el mismo protocolo.
- Evaluación de seguridad y red-teaming: permite medir la robustez de clasificadores y filtros externos (HarmBench-Llama-2-13b-cls, WildGuard) frente a un modelo sin rechazos internos, con conjuntos de 100 y 50 ejemplos y tests de McNemar.
- Pruebas de pipelines de agentes bajo inyección de prompts: la evaluación con AgentDojo (560 casos bajo ataque) lo hace adecuado para validar defensas en entornos de herramientas antes de desplegar agentes reales.
- Análisis de degradación de capacidades tras edición de pesos: los subconjuntos de GSM8K y MMLU-Pro permiten cuantificar la pérdida (47/50 y 42/50 frente a 47/50 y 39/50 del original) y estudiar la relación entre abliteración y rendimiento.
- Inferencia local en Apple Silicon: el archivo GGUF de 17,5 GB se ejecuta en un Mac mini M4 Pro con 64 GB de RAM mediante llama.cpp, lo que facilita reproducir las evaluaciones sin GPU dedicada.
- Estudio de conocimiento de ciberseguridad: CTI-MCQ (127/200 frente a 140/200 del original) permite analizar cómo la edición afecta al conocimiento técnico especializado.
- Docencia y demostraciones sobre alineación: ilustra de forma reproducible el compromiso entre supresión de rechazos y fidelidad de capacidades.

## Benchmarks y rendimiento

Conjunto independiente (no usado en selección), 100 ejemplos HarmBench estándar, XSTest seguro 100 y XSTest inseguro 50:

| Modelo | HarmBench sí / no / truncado (100) | XSTest seguro rechazos / 100 | XSTest inseguro rechazos / 50 |
|---|---:|---:|---:|
| original (Unsloth UD-Q4_K_XL) | 12 / 88 / 0 | 2 | 44 |
| huihui-ai (Q4_K_M) | 94 / 6 / 0 | 0 | 3 |
| final (este modelo) | 91 / 9 / 0 | 0 | 3 |

Conjunto de selección (100 HarmBench, semilla 407) y capacidades:

| Modelo | HarmBench selección sí / no / truncado (100) | GSM8K correctas / 50 | MMLU-Pro correctas / 50 |
|---|---:|---:|---:|
| original | 15 / 85 / 0 | 47 | 39 |
| huihui-ai | 92 / 8 / 0 | 48 | 42 |
| layer24-k1 | 85 / 15 / 0 | 47 | 43 |
| final | 91 / 9 / 0 | 47 | 42 |

Tareas de seguridad (original frente a final, test exacto de McNemar bilateral):

| Medida | original | final | p |
|---|---:|---:|---:|
| FRR rechazos / 86 | 0 | 0 | 1,00 |
| CTI-MCQ correctas / 200 | 140 | 127 | 0,053 |
| AgentDojo utilidad / 40 | 32 | 36 | 0,22 |
| AgentDojo utilidad bajo ataque / 560 | 379 | 406 | 0,028 |
| AgentDojo éxito de ataque / 560 | 38 | 46 | 0,30 |

El autor advierte que estos conjuntos son pequeños y que diferencias de pocas respuestas no establecen diferencias amplias de capacidad.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo GGUF ocupa 17,52 GB; se necesita al menos esa cantidad de memoria más overhead de contexto KV. Con 64 GB de memoria unificada el autor ejecuta la evaluación completa.
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo documenta ejecución en Apple Silicon (Mac mini M4 Pro, 64 GB).
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por tamaño (17,5 GB) encajaría en GPUs con 24 GB o más, pero no hay dato del autor.
- Opciones de despliegue: cualquier runtime GGUF que soporte GLM-4.7-Flash; el autor usó el fork de llama.cpp en el commit `5c4fc1a68`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HarmBench (100) | GSM8K / 50 | MMLU-Pro / 50 | Licencia | Formato |
|---|---|---:|---:|---:|---:|---|---|
| Este modelo (final) | ~30B | no disponible | 91 sí / 9 no | 47 | 42 | MIT | GGUF Q4_K_XL |
| Original (Unsloth UD-Q4_K_XL) | ~30B | no disponible | 12 sí / 88 no | 47 | 39 | MIT (heredada) | GGUF Q4_K_XL |
| huihui-ai (mradermacher Q4_K_M) | ~30B | no disponible | 94 sí / 6 no | 48 | 42 | no disponible | GGUF Q4_K_M |
| layer24-k1 (variante intermedia) | ~30B | no disponible | 85 sí / 15 no | 47 | 43 | no disponible | GGUF |

## Limitaciones y advertencias

- Modelo "uncensored"/abliterado: elimina deliberadamente los rechazos; no debe desplegarse en aplicaciones de cara al público sin filtros externos.
- Riesgo elevado de generar contenido dañino: 91/100 cumplimientos en HarmBench estándar frente a 12/100 del original.
- Sesgos conocidos: no documentados en la información proporcionada.
- Alucinación: no se han publicado métricas específicas de fidelidad; el modo thinking puede agotar el límite de salida y producir respuestas truncadas (un ejemplo de MMLU-Pro del modelo final quedó truncado y se contó como incorrecto).
- Limitaciones de contexto e idioma: la ventana de contexto y los idiomas soportados no están documentados; el autor solo menciona límites de salida de 16K y 32K tokens en evaluación.
- Degradación de conocimiento especializado: CTI-MCQ baja de 140/200 a 127/200 (p = 0,053), con tres respuestas que alcanzan el límite de 16K.
- Mayor utilidad bajo ataque en AgentDojo (406/560 frente a 379/560, p = 0,028) y éxito de ataque ligeramente superior (46/560 frente a 38/560, p = 0,30, no significativo): relevante para despliegues con herramientas.
- Los conjuntos de evaluación son pequeños (50-100 ejemplos por tarea); las diferencias de pocas respuestas no son concluyentes.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y el uso responsable recae en el desplegador.
- El método de edición se seleccionó sobre 50 prompts dañinos generados y sobre el conjunto de selección de HarmBench; solo el conjunto HarmBench no tocado y XSTest son independientes de todas las decisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/takanori-ishikawa/GLM-4.7-Flash-Abliterated-UD-Q4_K_XL-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Cuantización de Unsloth: https://huggingface.co/unsloth/GLM-4.7-Flash-GGUF
- HarmBench: https://github.com/centerforaisafety/HarmBench
- Clasificador HarmBench-Llama-2-13b-cls: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Evaluador oficial de HarmBench: https://github.com/centerforaisafety/HarmBench/blob/main/evaluate_completions.py
- XSTest: https://github.com/paul-rottger/xstest
- WildGuard: https://huggingface.co/allenai/wildguard
- GSM8K: https://github.com/openai/grade-school-math
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- CyberSecEval (PurpleLlama): https://github.com/meta-llama/PurpleLlama/tree/main/CybersecurityBenchmarks
- CTI-MCQ (cti-bench): https://github.com/maveryn/cti-bench
- AgentDojo: https://github.com/ethz-spylab/agentdojo
- Fork de llama.cpp usado: https://github.com/ishikawa/llama.cpp/commit/ddf120c50a8acfbf873c16cb070c2b5e4bb6a2fe
- Resultados de seguridad: https://github.com/ishikawa/glm-4.7-flash-abliteration/blob/main/results/README.md#security-tasks
- Repositorio de abliteración: https://github.com/ishikawa/glm-4.7-flash-abliteration
- Alternativa huihui-ai: https://huggingface.co/mradermacher/Huihui-GLM-4.7-Flash-abliterated-GGUF
