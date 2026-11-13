# Synaptics/Qwen3-0.6B-GPTQ-int4-torq

## Resumen

Synaptics/Qwen3-0.6B-GPTQ-int4-torq es una compilacion del modelo Qwen3-0.6B de Alibaba Qwen para la NPU Torq de la serie Astra SL2610 de Synaptics. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion estatica del transformer original a un formato ejecutable (`.vmfb`) optimizado para inferencia en hardware de borde con acelerador neuronal integrado. El modelo base es un transformer decoder-only de 28 capas, hidden size 1024, 16 cabezas de consulta y 8 de clave-valor (GQA), con head_dim 128.

La relevancia de esta ficha radica en que demuestra el flujo de cuantizacion INT4 con GPTQ y compilacion para NPU de un LLM pequeno, un caso cada vez mas comun en despliegues de IA en dispositivo. El modelo se distribuye con pesos INT4 calibrados sobre `HuggingFaceH4/ultrachat_200k`, junto con los artefactos compilados, la tabla de embeddings en el host y el vocabulario recortado.

Las limitaciones son notables y deben tenerse en cuenta: contexto estatico de solo 256 tokens, vocabulario restringido a caracteres latinos, digitos y puntuacion (99.477 tokens tras recorte), y un throughput de 8,7 tok/s en la placa SL2610. Es un modelo para tareas acotadas en dispositivo, no para uso general en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 28 capas, hidden 1024, 16 cabezas Q y 8 KV (GQA), head_dim 128 |
| Parametros totales | no disponible (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens estaticos (prompt y generacion) |
| Tipos de cuantizacion | INT4 con GPTQ, group size 32, escalas bf16, zero points INT4; activaciones en bf16 |
| Idiomas soportados | no disponible; el vocabulario se recorta a texto latino, puntuacion y digitos (no genera CJK ni otras escrituras no latinas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo), artefactos compilados `.vmfb`, `token_embeddings.npy`, `token_id_lut.npy`, pesos GPTQ en `gptq/` |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only con atencion de consulta agrupada (GQA). La conversion a Torq realiza una exportacion ONNX estatica mediante `optimum` y la transforma en un decodificador de un solo token con cache KV fija de 256 posiciones y mascara causal. Las embeddings de tokens se mueven al host y el LM head se separa como modelo independiente. La atencion se reescribe para leer directamente las 8 cabezas KV sin copia `repeat_kv`, y la cache KV es de solo lectura: el modelo emite unicamente las filas K/V del token nuevo y el runtime las escribe en la cache antes del siguiente paso.

La cuantizacion aplica INT4 `DequantizeLinear` con block_size 32, escalas bf16 y zero points INT4 a las 196 matrices de la parte transformer y al LM head; solo se cuantizan pesos, las activaciones permanecen en bf16. GPTQ (via `llmcompressor`, asimetrico, group size 32) calibro los pesos con 256 muestras de 1024 tokens de `HuggingFaceH4/ultrachat_200k`. La compilacion se realizo con torq-compiler 2.3.0 para SL2610, con prefetch de entrada y MTU de burst DMA 6. No se especifica el volumen total de tokens de entrenamiento del modelo base ni detalles de RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de texto en modo no-thinking; el template debe iniciar el turno del asistente con un bloque `\n\n` vacio, como hace `apply_chat_template(..., enable_thinking=False)`.
- Razonamiento y conversacion multi-turno dentro de la ventana estatica de 256 tokens.
- Generacion limitada a escrituras latinas, digitos y puntuacion; no puede producir CJK ni otras escrituras no latinas.
- Inferencia en dispositivo sobre NPU Synaptics Astra SL2610 con el runtime Torq.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni otras capacidades especiales en la informacion disponible.

## Casos de uso

- Asistentes de voz o texto en dispositivo de borde: el modelo cabe en la NPU SL2610 y permite conversaciones cortas locales sin enviar datos a la nube, con un contexto de 256 tokens suficiente para turnos breves.
- Clasificacion y extraccion de informacion en formularios: dado un texto corto en latin, el modelo puede etiquetar o extraer campos con un prompt acotado, aprovechando la cuantizacion INT4 para bajo consumo.
- Respuestas de FAQ en electrodomesticos o dispositivos industriales: preguntas y respuestas de una o dos frases encajan en la ventana de 256 tokens y en el throughput de 8,7 tok/s.
- Filtrado y normalizacion de texto en pipelines de datos: el vocabulario recortado a caracteres latinos y digitos es adecuado para tareas de limpieza y reformateo de cadenas.
- Demostraciones y prototipos de IA en borde: sirve como referencia para validar el flujo torq-tools (exportacion, GPTQ, compilacion) antes de portar modelos mayores.
- Control por comandos en ingles o castellano con respuestas cortas: la latencia de primer token de 1,9-2,1 s y el decode de 8,7 tok/s son aceptables para interacciones no conversacionales de baja frecuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye metricas de fidelidad de cuantizacion y de rendimiento en hardware:

| Metrica | GPTQ INT4 (este modelo) | RTN INT4 (referencia) |
|---|---|---|
| Divergencia KL | 0,107 | 0,152 |
| Similitud coseno | 0,968 | 0,948 |
| Acuerdo top-1 | 85,4 % | 83,3 % |

Las metricas de fidelidad se midieron contra el modelo estatico fp32 con logits teacher-forced en 288 posiciones de 6 prompts de chat.

| Medicion en placa SL2610 (NPU a 1 GHz) | Valor |
|---|---|
| Tiempo por llamada `transformer.vmfb` | 93,6 ms |
| Tiempo por llamada `lm_head.vmfb.trim` | 14,7 ms |
| Decode (demo de chat, no-thinking) | 8,7 tok/s |
| Time to first token (pregunta corta tras system prompt) | 1,9-2,1 s |

## Requisitos de hardware

- Hardware objetivo: NPU Synaptics Astra SL2610-Series (MPU); no es un modelo para GPU convencional.
- VRAM estimada: no aplica; el modelo se ejecuta en la NPU con pesos INT4 y cache KV bf16 de 256 posiciones.
- GPU recomendadas: no disponible; el modelo esta compilado para SL2610 y no se distribuye para CUDA.
- Cabe en GPU consumer: no disponible; el formato `.vmfb` es especifico de Torq.
- Opciones de despliegue: runtime Torq con la demo `qwen3` de torq-examples (requiere soporte de cache KV de solo lectura, torq-examples #60 o posterior); el flujo de construccion usa torq-tools (`torq-export-model qwen -s qwen3-0.6b`) y torq-compiler 2.3.0.
- Latencia y throughput: 93,6 ms por paso del transformer, 14,7 ms por paso del LM head, 8,7 tok/s en decode y 1,9-2,1 s hasta el primer token en la placa SL2610 a 1 GHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synaptics/Qwen3-0.6B-GPTQ-int4-torq | no disponible (base 0.6B) | 256 tokens estaticos | INT4 GPTQ group 32 | Apache 2.0 | Hugging Face, formato Torq para SL2610 |
| Qwen/Qwen3-0.6B | no disponible (0.6B) | no disponible en esta ficha | bf16 original | Apache 2.0 | Hugging Face, formato transformers |
| Otros modelos 0.5B-1B para borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otras alternativas de la misma categoria no esta disponible en la informacion proporcionada. La diferencia principal frente al Qwen3-0.6B original es el contexto reducido a 256 tokens, el vocabulario recortado y el formato compilado para NPU.

## Limitaciones y advertencias

- Contexto estatico de solo 256 tokens, insuficiente para documentos largos o conversaciones extensas.
- Vocabulario recortado a 99.477 tokens (desde 151.936): no puede generar CJK ni otras escrituras no latinas, lo que limita su uso multilingue.
- El modelo requiere modo no-thinking; omitir el bloque `<think>\n\n</think>\n\n` puede degradar la calidad de las respuestas.
- Riesgo de alucinacion inherente a un modelo de 0.6B, agravado por la cuantizacion INT4 (acuerdo top-1 del 85,4 % frente a fp32).
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base y del dataset de calibracion `ultrachat_200k`.
- Dependencia de hardware y runtime especificos: los artefactos `.vmfb` solo funcionan en SL2610 con torq-compiler 2.3.0 y la demo `qwen3` con soporte de cache KV de solo lectura.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso `NOTICE.txt` y verificarse las condiciones del modelo base Qwen3-0.6B.
- Throughput bajo (8,7 tok/s) y latencia de primer token de casi 2 s: no apto para aplicaciones interactivas de alta frecuencia.

## Enlaces

- Hugging Face: https://huggingface.co/Synaptics/Qwen3-0.6B-GPTQ-int4-torq
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio torq-tools: https://github.com/synaptics-torq/torq-tools
- Repositorio torq-examples: https://github.com/synaptics-torq/torq-examples
- Synaptics AI Developer Zone: https://developer.synaptics.com
- Astra Support Portal: https://synacsm.atlassian.net/servicedesk/customer/portal/543
