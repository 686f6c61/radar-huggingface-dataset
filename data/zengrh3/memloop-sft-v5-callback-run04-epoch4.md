# zengrh3/memloop-sft-v5-callback-run04-epoch4

## Resumen

MemLoop SFT v5 (callbacks), run04 epoch 4 es un ajuste fino completo (full fine-tune) de Qwen/Qwen3-4B-Instruct-2507 desarrollado por el usuario zengrh3. El modelo está entrenado para desempeñar, con un único conjunto de pesos, los tres roles de un sistema de memoria a largo plazo para agentes: un agente de memoria que escribe cada sesión de conversación en cuatro bancos (core, episódico, semántico y procedimental), un agente de recuperación que busca en esa memoria y clasifica las evidencias, y un agente de respuesta que contesta a partir de la memoria core y de las evidencias clasificadas. La innovación principal es el mecanismo de callback: cada agente puede nombrar a otro (o a sí mismo) para repetir su paso, acompañando una breve retroalimentación, con un presupuesto de un callback por agente y un máximo de tres por trayectoria.

El modelo parte de la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con 4.411.424.256 parámetros totales y pesos en formato safetensors (repositorio de 8,8 GB). Se distribuye bajo licencia Apache 2.0 y está orientado exclusivamente al inglés. Su relevancia radica en que aborda el problema de la memoria persistente en agentes multi-turno, evaluado sobre los conjuntos LongMemEval y LoCoMo, con resultados publicados por el autor.

El checkpoint corresponde a la época 4 (paso 840) de un entrenamiento planificado de 10 épocas; según el autor, las épocas posteriores no mejoraron y esta fue la de mejores puntuaciones globales. El modelo se publica con cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó un corte de 20.000 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos sobre Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4,4 mil millones de parámetros. El entrenamiento se realizó con LLaMA-Factory usando la plantilla `qwen3_nothink` (sin modo de razonamiento explícito), en bf16, con un tamaño de lote efectivo de 192, tasa de aprendizaje de 5e-7, esquema coseno con 10 % de warmup, norma máxima de gradiente de 0,1 y corte de secuencia de 20.000 tokens. Se planificaron 10 épocas y este checkpoint es la época 4 (paso 840). En las filas que emiten un callback, solo se entrenan los campos del callback.

Los datos provienen del dataset zengrh3/memloop-sft-v5-callback, con 40.320 filas construidas a partir del split SFT de LongMemEval (sin datos de dev ni de test). El protocolo de entrenamiento es `memory_banks_tool_call_v5_callback`: cada salida del modelo es exactamente una llamada a herramienta, con campos como `reasoning`, `answer`, `revisit_agent` y `feedback`. El mecanismo de callback permite que un agente delegue la repetición de un paso en otro agente (o en sí mismo), lo que introduce una forma de control de flujo multi-agente dentro de una única política entrenada.

## Capacidades

- Generación de texto conversacional en inglés con formato estricto de llamada a herramienta (una única tool call por salida).
- Gestión de memoria a largo plazo: escritura de sesiones en cuatro bancos (core, episódico, semántico y procedimental).
- Recuperación de memoria: hasta cuatro búsquedas por paso y clasificación de las evidencias recuperadas.
- Respuesta con razonamiento escrito a partir de la memoria core y de las evidencias clasificadas.
- Mecanismo de callback: cada agente puede solicitar que otro agente (o él mismo) repita su paso, con retroalimentación textual; presupuesto de un callback por agente y máximo tres por trayectoria.
- Soporte de tool calling en el formato específico del protocolo `memory_banks_tool_call_v5_callback`.
- Razonamiento multi-paso dentro de una trayectoria de agente (memoria, recuperación y respuesta encadenadas).
- Capacidades multilingües: no disponibles; el modelo está entrenado y etiquetado solo para inglés.
- Modo de pensamiento (thinking): no soportado; se debe usar `enable_thinking=False`.

## Casos de uso

- Asistentes conversacionales con memoria persistente: el modelo puede escribir cada sesión en los cuatro bancos de memoria y recuperar información de sesiones anteriores, lo que resulta adecuado para agentes que atienden al mismo usuario durante días o semanas.
- Sistemas de atención al cliente multi-sesión: el agente de memoria registra el historial y el agente de respuesta recupera evidencias clasificadas para contestar con contexto acumulado, reduciendo la necesidad de repetir información.
- Agentes de soporte técnico con base de conocimiento procedimental: el banco procedimental permite almacenar y recuperar pasos de resolución de incidencias, y el agente de recuperación localiza el procedimiento relevante antes de responder.
- Investigación en memoria de agentes: sirve como línea base reproducible para experimentar con callbacks y comparar contra sistemas de memoria multi-agente sobre LongMemEval y LoCoMo.
- Pipelines de agentes con autocorrección: el mecanismo de callback permite que un agente detecte un paso defectuoso y pida a otro que lo repita con retroalimentación, útil en flujos donde la recuperación de evidencias puede fallar.
- Evaluación de sistemas RAG con memoria estructurada: el modelo puede integrarse como planificador de búsquedas (hasta cuatro por paso) y como clasificador de evidencias en arquitecturas de recuperación aumentada.
- Prototipos de asistentes personales con seguimiento de preferencias: el banco core almacena hechos estables del usuario y el agente de respuesta los combina con evidencias episódicas para personalizar respuestas.

## Benchmarks y rendimiento

Evaluación publicada por el autor. Juez: GPT-4o-mini (rúbrica por defecto). F1 y BLEU-1 son a nivel de token. LongMemEval usa las 400 preguntas de test; LoCoMo usa las 856 preguntas de las conversaciones conv-41, 42, 48, 49 y 50. Dos ejecuciones sobre las mismas entradas pueden diferir en torno a ±1,5 puntos.

| Modo | LongMemEval accuracy / F1 / BLEU-1 | LoCoMo (856) accuracy / F1 / BLEU-1 |
|---|---|---|
| Callbacks ejecutados | 73,25 / 51,90 / 44,26 | 77,10 / 49,69 / 44,01 |
| Campos de callback ignorados | 74,00 / 48,95 / 41,56 | 75,00 / 47,20 / 41,89 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos, más memoria para el contexto; con 20.000 tokens de contexto la huella de activaciones y caché KV crece de forma significativa.
- En cuantización de 8 bits, la huella de pesos baja a unos 4,5 GB; en 4 bits, a unos 2,5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto largo y lotes; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo con 24 GB en bf16 para contextos moderados; para contextos cercanos a 20.000 tokens conviene reducir lote o usar cuantización.
- Opciones de despliegue: transformers (versión 5.8 o superior para leer `rope_parameters`), vLLM (con la corrección de `rope_theta` descrita abajo), TGI y llama.cpp/Ollama solo si se generan cuantizaciones propias.
- Advertencia de despliegue: el `config.json` guarda la base RoPE en `rope_parameters` (`rope_theta` 5.000.000) sin clave de nivel superior; motores antiguos como vLLM 0.8.5 leen 10.000 y producen salidas corruptas en entradas largas. En ese caso hay que añadir `"rope_theta": 5000000` en el nivel superior de `config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MemLoop SFT v5 callback run04 epoch4 | 4,41 B | No disponible (entrenado con corte de 20.000 tokens) | Memoria a largo plazo multi-agente con callbacks | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,4 B | No disponible en la información proporcionada | Modelo generalista de instrucciones | Apache 2.0 | Hugging Face |
| Alternativas de memoria para agentes (MemGPT, Mem0, etc.) | No disponible | No disponible | Sistemas de memoria sobre modelos generalistas | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado y etiquetado para inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Requiere usar exactamente los mismos system prompts y el mismo formato de mensajes que los datos de entrenamiento (`memory_banks_tool_call_v5_callback`); desviarse del protocolo degrada la salida.
- Cada salida es exactamente una llamada a herramienta; no es un modelo de chat generalista y no debe usarse como tal.
- Debe usarse con `enable_thinking=False`; el modo de razonamiento de Qwen3 no está soportado.
- Riesgo de alucinación en las respuestas: el agente de respuesta puede generar contenido no respaldado por las evidencias recuperadas, especialmente si la recuperación falla.
- El juez de evaluación es GPT-4o-mini con rúbrica por defecto, y la generación no es totalmente determinista (±1,5 puntos entre ejecuciones), lo que limita la precisión de las comparaciones.
- Los datos de entrenamiento provienen del split SFT de LongMemEval; aunque el autor indica que no se usaron dev ni test, existe riesgo de contaminación si se evalúa con variantes del mismo corpus.
- El checkpoint es la época 4 de 10; no es el resultado de un entrenamiento completado, sino el punto con mejores puntuaciones según el autor.
- El repositorio tiene cero descargas y cero likes, sin validación externa de la comunidad; debe tratarse como artefacto de investigación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache 2.0; conviene verificar los términos del modelo base y de los datos de entrenamiento antes de un despliegue en producción.
- La configuración RoPE incompatible con motores de inferencia antiguos puede producir salidas corruptas si no se corrige `config.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zengrh3/memloop-sft-v5-callback-run04-epoch4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/zengrh3/memloop-sft-v5-callback
- LongMemEval (conjunto de evaluación): no disponible en la información proporcionada
- LoCoMo (conjunto de evaluación): no disponible en la información proporcionada
- LLaMA-Factory (herramienta de entrenamiento): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
