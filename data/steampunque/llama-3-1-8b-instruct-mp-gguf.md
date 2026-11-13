# steampunque/Llama-3.1-8B-Instruct-MP-GGUF

## Resumen

`steampunque/Llama-3.1-8B-Instruct-MP-GGUF` es una recuantizacion en GGUF de precisión mixta (mixed precision) del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicada por el usuario steampunque. El objetivo es ofrecer un equilibrio entre tamano de fichero y calidad de inferencia aplicando niveles de cuantizacion distintos por capa (Q5_K, Q6_K, Q4_K segun la capa) en lugar de un unico tipo uniforme, algo que el autor denomina "E quants" (Q6_E_H y Q4_E_H).

El modelo base es un transformer decoder-only de 8.030.261.312 parametros con una ventana de contexto declarada de hasta 128k tokens, disenado originalmente para conversacion y procesamiento de texto. El autor indica que no ha recibido entrenamiento RL y que no es adecuado para tareas de razonamiento complejo, orientandolo a resumen, extraccion de caracteristicas y chat.

La relevancia de esta ficha es practica: permite ejecutar un Llama 3.1 8B Instruct en GPUs de consumo (6-8 GB de VRAM segun el autor) con una perdida de perplejidad minima respecto a Q6_K estandar, y ofrece datos concretos de throughput con decodificacion especulativa sobre una RTX 4070. Es un artefacto de despliegue, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128k tokens (declarado por el autor; validado needle-in-a-haystack a 72k) |
| Tipos de cuantizacion | GGUF mixed precision: Q6_E_H (Q5_K/Q6_K por capa), Q4_E_H (Q4_K/Q5_K/Q6_K por capa); embeddings y output en Q6_K |
| Idiomas soportados | no disponibles en la informacion proporcionada (heredados del modelo base Llama 3.1) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF |
| Tamano de fichero | Q6_E_H ~6,1e9; Q4_E_H ~5,3e9 (referencia: Q6_K 6,6e9, Q4_K_M 4,9e9) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamano del repo | 28,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por cabezas agrupadas (GQA), RoPE y normalizacion RMSNorm, entrenado por Meta. Esta publicacion no reentrena el modelo: solo aplica cuantizacion GGUF por capas con `llama.cpp`, usando una definicion extendida de tipos de capa (`LAYER_TYPES`) que asigna Q5_K o Q6_K a las capas 0-27 y Q6_K a las capas 28-31 en el quant Q6_E_H, mientras que Q4_E_H usa Q4_K en la mayoria de capas y sube a Q5_K/Q6_K en las capas finales. Los embeddings de tokens y la capa de salida se fijan en Q6_K en ambos casos.

No hay datos en la informacion proporcionada sobre el numero de tokens de entrenamiento, composicion del dataset, RLHF o DPO del modelo base; esos detalles corresponden a la model card original de Meta, no a esta recuantizacion. La innovacion tecnica destacable es precisamente el esquema de precision mixta por capa, que segun las mediciones del autor mantiene la perplejidad de Q6_K (7,2) con un fichero de 6,1e9 frente a 6,6e9, y en el caso Q4_E_H obtiene 7,4 frente a 7,3 de Q4_K_M con un fichero ligeramente mayor (5,3e9 frente a 4,9e9). El autor indica que ambos quants se actualizaron el 13/11/2026 optimizados sobre un conjunto de prompts de prueba curado.

## Capacidades

- Generacion de texto conversacional multi-turno (chat instruct).
- Resumen y procesamiento de texto largo, apoyado en la ventana de contexto extendida.
- Extraccion de caracteristicas y procesamiento por lotes de documentos.
- Generacion de codigo basica (el autor incluye un ejemplo de HumanEval en la model card).
- Decodificacion especulativa compatible con un modelo borrador Llama 3.2 1B Instruct, con aceleracion medida de hasta 2,2x en generacion.
- Procesamiento de audio si se combina con el tower de `fixie-ai/ultravox-v0_5-llama-3_1-8b` (variante GGUF publicada por el mismo autor).
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada para esta recuantizacion.
- Modo thinking o razonamiento explicito: no soportado; el autor afirma explicitamente que el modelo no tiene entrenamiento RL y "no es util para aplicaciones de razonamiento".

## Casos de uso

- Resumen de documentos largos: con contexto validado a 72k tokens en el quant Q4_E_H con QKV en q8_0, se puede procesar un informe o expediente completo en una sola pasada sin trocear.
- Extraccion de caracteristicas y etiquetado por lotes: el autor lo orienta a feature extraction; encaja en pipelines de clasificacion o enriquecimiento de texto donde el throughput importa mas que el razonamiento.
- Chat de atencion al cliente: conversaciones multi-turno con contexto amplio, desplegado en vLLM o llama.cpp server con la API compatible de OpenAI que sugiere el tag `endpoints_compatible`.
- Asistente de codigo ligero: generacion de funciones a partir de cabeceras y docstrings (ejemplo HumanEval de la model card), integrable en editores o pre-commit hooks en una GPU de 8 GB.
- Inferencia en edge o estaciones de trabajo modestas: cuantizacion Q4_E_H que cabe en GPUs de 6-8 GB de VRAM, adecuada para prototipos locales y entornos sin acceso a GPU de datacenter.
- Transcripcion y analisis de audio combinado con texto: emparejado con el tower Ultravox del mismo autor para entradas .mp3/.wav y salida de texto.
- Servicio de chat de baja latencia con decodificacion especulativa: usando Llama 3.2 1B como draft model se alcanzan 152-172 tokens/s en una RTX 4070 segun las mediciones del autor.

## Benchmarks y rendimiento

| Metrica | Q4_K_M | Q4_E_H | Q6_K | Q6_E_H |
|---|---|---|---|---|
| Tamano (parametros equivalentes) | 4,9e9 | 5,3e9 | 6,6e9 | 6,1e9 |
| Perplejidad (PPL) | 7,3 | 7,4 | 7,2 | 7,2 |

Rendimiento de generacion medido por el autor en una RTX 4070 con contexto y pesos en VRAM, decodificacion especulativa greedy con Llama 3.2 1B:

| Prompt | Quant | QKV | Draft blocks (ND) | Contexto KV | Gen TPS |
|---|---|---|---|---|---|
| goldcoin | Q6_E_H | F16 | 0 | 48k | 76 |
| goldcoin | Q6_E_H | F16 | 4 | 32k | 152 |
| goldcoin | Q4_E_H | F16 | 0 | 52k | 87 |
| goldcoin | Q4_E_H | q8_0 | 4 | 36k | 160 |
| goldcoin | Q4_E_H | q8_0 | 0 | 96k | 86 |
| humaneval | Q6_E_H | F16 | 0 | - | 76 |
| humaneval | Q6_E_H | F16 | 6 | - | 172 |

Pruebas de contexto largo reportadas: needle-in-a-haystack a 72k tokens superado con Q4_E_H y QKV en q8_0; prompt de 85k tokens (Qwen3 Runescape) procesado correctamente con muestreo greedy. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_E_H en torno a 5,3 GB de pesos mas KV cache; el autor lo situa en GPUs de 6-8 GB. Q6_E_H en torno a 6,1 GB de pesos, recomendable 8-10 GB para contexto amplio.
- GPU de consumo: RTX 4070 validada por el autor (76-172 tokens/s segun configuracion); cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores. En 6 GB (RTX 2060, GTX 1660 Ti) solo con Q4_E_H y contexto reducido.
- GPU de datacenter: A100, H100 y L40S sobradas para el modelo; utiles para servir muchas peticiones concurrentes con vLLM.
- Despliegue: llama.cpp, Ollama, llama-cpp-python, y servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo sugiere). vLLM y TGI requieren conversion a safetensors o AWQ/GPTQ, no incluida en este repo.
- Latencia y throughput: 76 tokens/s en RTX 4070 sin especulacion (Q6_E_H, F16 QKV); 152-172 tokens/s con decodificacion especulativa y Llama 3.2 1B como draft. El KV cache en q8_0 permite 96k de contexto a 86 tokens/s con Q4_E_H.
- Almacenamiento: el repo completo ocupa 28,9 GB porque incluye ambos quants y ficheros auxiliares; basta descargar el GGUF concreto que se vaya a usar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steampunque Llama-3.1-8B-Instruct-MP-GGUF (Q6_E_H) | 8,03B | 128k | PPL 7,2 | llama3.1 | Hugging Face, GGUF |
| Llama 3.1 8B Instruct Q6_K (llama.cpp) | 8,03B | 128k | PPL 7,2 | llama3.1 | Hugging Face, GGUF |
| Llama 3.1 8B Instruct Q4_K_M (llama.cpp) | 8,03B | 128k | PPL 7,3 | llama3.1 | Hugging Face, GGUF |
| Qwen2.5 7B Instruct (GGUF) | 7,6B | 128k | no disponible en esta ficha | Apache 2.0 | Hugging Face, GGUF |

La ventaja frente a Q6_K estandar es el menor tamano (6,1e9 frente a 6,6e9) con la misma perplejidad; frente a Q4_K_M, el Q4_E_H ocupa algo mas (5,3e9 frente a 4,9e9) y pierde 0,1 puntos de PPL. Frente a alternativas como Qwen2.5 7B, la diferencia principal es la licencia: Llama 3.1 impone restricciones de uso comercial que Qwen2.5 (Apache 2.0) no tiene. No hay datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no tiene entrenamiento RL y no es util para razonamiento; tareas como el prompt "goldcoin" de la model card se usan solo como prueba de throughput, no como evaluacion de razonamiento.
- Riesgo de alucinacion inherente al modelo base, agravado en contextos muy largos donde la atencion se diluye; el needle-in-a-haystack a 72k no garantiza fidelidad en tareas de sintesis sobre 100k tokens.
- La cuantizacion introduce degradacion adicional frente al modelo en BF16, especialmente en Q4_E_H; el autor solo reporta perplejidad, no evaluaciones por tarea.
- Licencia llama3.1: uso comercial permitido con condiciones (politica de uso aceptable de Meta, obligacion de atribucion y de nombrar el modelo como "Llama 3.1"); revisar los terminos antes de desplegar en produccion.
- Idiomas soportados no documentados en esta ficha; el modelo base esta optimizado para ingles y multilingue limitado, con rendimiento inferior en castellano frente a modelos entrenados especificamente.
- Repo con 69 descargas y 0 likes: no hay validacion comunitaria independiente de las mediciones del autor; los datos de throughput y PPL provienen exclusivamente de su model card.
- El esquema de cuantizacion por capas depende de la definicion `LAYER_TYPES` especifica del autor; reproducirla requiere la version de llama.cpp que soporte esa sintaxis extendida.
- No se documenta soporte de tool calling ni de agentes multi-paso en esta recuantizacion; verificar antes de usarlo en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/steampunque/Llama-3.1-8B-Instruct-MP-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Tower de audio Ultravox GGUF del mismo autor: https://huggingface.co/steampunque/ultravox-v0_5-llama-3_1-8b-MP-GGUF
- Modelo Ultravox original: https://huggingface.co/fixie-ai/ultravox-v0_5-llama-3_1-8b
- Prompt de prueba de contexto largo (85k tokens): https://huggingface.co/datasets/steampunque/benchlm/blob/main/Qwen3_Runescape_Massive_Prompt_85k.txt
