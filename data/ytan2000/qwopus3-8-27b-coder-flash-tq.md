# YTan2000/Qwopus3.8-27B-Coder-Flash-TQ

## Resumen

Qwopus3.8-27B-Coder-Flash-TQ es una cuantización del fine-tune de código Qwopus3.8-27B-Coder-Flash (obra de Jackrong sobre la base Qwen3.8-27B de Alibaba), publicada por el usuario YTan2000 en formato TQ_L (TQ4) para el motor de inferencia propietario tqLLM. El modelo resuelve el problema de desplegar un LLM de 27.320 millones de parámetros en GPUs de 24 GB manteniendo una fidelidad alta respecto al original en BF16: el archivo ocupa 14,63 GB frente a los 16,8 GB de la cuantización Q4_K_M del autor original, y según la model card es un 24 % más rápido en decodificación con decodificación especulativa exacta.

La pieza técnica diferencial es el uso de TQ4, un formato de cuantización por rotación derivado de TurboQuant (Google Research) que almacena 4,125 bits por peso, y de un modelo borrador DFlash2 (0,79 GB, TQ3) entrenado sobre la base Qwen3.8-27B para decodificación especulativa. El resultado es un modelo orientado a generación de código, tool calling y bucles de agente largos, con licencia Apache 2.0 y un contexto configurable (32K en el comando de ejemplo, hasta 64K en las pruebas de velocidad).

La relevancia actual es doble: por un lado, demuestra que un modelo de 27B puede ejecutarse con calidad casi BF16 en una RTX 3090; por otro, introduce una dependencia fuerte de un motor no estándar (tqLLM), ya que los tensores TQ4 usan un tipo GGUF propio (300) que llama.cpp, Ollama y LM Studio no pueden cargar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), con cabeza MTP (multi-token prediction) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el comando de ejemplo; 65.536 en las pruebas de velocidad; 75K+ en sesiones de agente citadas |
| Tipos de cuantización | TQ4 (cuerpo, 4,125 bits/peso), Q6_K (cabeza de salida), Q4_K (embeddings); borrador en TQ3 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con tipo propio de tqLLM (tipo 300), no compatible con llama.cpp estándar |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B parámetros derivado de Qwen3.8-27B, con una cabeza MTP (multi-token prediction) heredada de la base. Sobre esa base, Jackrong realizó un fine-tune especializado en código (Qwopus3.8-27B-Coder-Flash). No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta publicación no está en el entrenamiento sino en la compresión y el runtime. El cuerpo se cuantiza con TQ4, un esquema de 4,125 bits por peso que rota cada bloque de 128 pesos para repartir los valores atípicos y permitir una única escala FP16 por bloque con códigos de 16 niveles; el proceso de cuantización usa GPTQ sobre texto de calibración. La cabeza de salida se mantiene en Q6_K y los embeddings en Q4_K, tomados de la versión GGUF Q4_K_M de Jackrong. La decodificación se acelera con un borrador DFlash2 (método de z-lab, arXiv 2602.06036) que propone varios tokens y el modelo de 27B los verifica en una pasada, de modo que cada token aceptado es exacto y la salida es la del propio modelo, solo más rápida.

## Capacidades

- Generación de texto y razonamiento general, con modo de pensamiento (thinking) activable mediante `REASONING=on`.
- Generación de código: el fine-tune está especializado en programación (tarea "coding" en BenchLoop).
- Tool calling / function calling: soportado y evaluado en la tarea "toolcall" de BenchLoop.
- Extracción de datos estructurados ("dataextract") y razonamiento matemático ("reasonmath").
- Seguimiento de instrucciones ("instructfollow").
- Sesiones de agente multi-turno y bucles largos de uso de herramientas (se citan historiales de 75K+ tokens).
- Decodificación especulativa exacta mediante modelo borrador DFlash2.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repo.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`), lo que facilita la integración con clientes existentes.

## Casos de uso

- Asistente de código en IDE o CLI: el modelo puede autocompletar y generar funciones completas con una latencia de decodificación de 149,2 tok/s en RTX 3090 (con borrador y contexto de 32K), suficiente para respuestas interactivas en un asistente tipo Copilot local.
- Revisión y refactorización de código en pipelines de CI: al ser un modelo de 27B con contexto de 32K–64K, puede analizar archivos completos o diffs extensos y emitir sugerencias o parches; su licencia Apache 2.0 permite integrarlo en herramientas internas sin restricciones de uso comercial.
- Agentes de tool calling en producción: la tarea "toolcall" de BenchLoop puntúa 86,7, y el servidor expone endpoints compatibles con OpenAI, lo que permite conectarlo a frameworks de agentes (LangChain, LlamaIndex) sin adaptadores propios.
- Extracción de datos estructurados de documentos técnicos: la tarea "dataextract" obtiene 88,1 en BenchLoop; con 32K de contexto puede procesar contratos, informes o logs largos y devolver JSON validable.
- Razonamiento matemático asistido: GSM8K al 96,0 % (200 preguntas, greedy) lo hace adecuado para tutores o verificadores de cálculos en entornos educativos o financieros.
- Despliegue en estaciones de trabajo con una sola GPU: al ocupar 14,63 GB, cabe en RTX 3090, RTX 4090, RTX 5090 y GB10 (DGX Spark), lo que permite ofrecer un asistente de código privado sin depender de la nube.
- Servicio de generación de código en DGX Spark: el modelo arranca en 18 s y genera a 61,7 tok/s en GB10, una opción para prototipos en hardware ARM64.

## Benchmarks y rendimiento

Calidad (mismo motor tqLLM, misma RTX 3090, comparación con la cuantización Q4_K_M de Jackrong):

| Métrica | TQ_L | Q4_K_M |
|---|---:|---:|
| Tamaño | 14,63 GB | 16,8 GB |
| GSM8K (200, greedy) | 96,0 % | 96,0 % |
| MMLU-Pro (291 preguntas, sin thinking) | 83,8 % | 81,4 % |
| KLD vs BF16, prosa + código (menor es mejor) | 0,016 | 0,017 |
| KLD, prosa / código | 0,019 / 0,012 | 0,016 / 0,017 |
| KLD, chat con thinking | 0,20 | 0,24 |
| Mismo token top que BF16 (todo el texto) | 93,0 % | 93,2 % |

BenchLoop por tarea (RTX 3090, mismo motor):

| Tarea | TQ_L | Q4_K_M |
|---|---:|---:|
| coding | 93,8 | 93,8 |
| toolcall | 86,7 | 86,7 |
| dataextract | 88,1 | 87,4 |
| reasonmath | 80,0 | 80,0 |
| instructfollow | 87,8 | 87,8 |

Velocidad (RTX 3090 24 GB, tqLLM 1.4.0 RC, greedy, contexto 64K, KV q8, 4 prompts × 2, 400 tokens cada uno):

| Métrica | TQ_L | Q4_K_M |
|---|---:|---:|
| Decodificación tok/s con borrador DFlash2 | 196,4 | 158,9 |
| Decodificación tok/s sin borrador | 51,6 | 40,5 |
| Prefill tok/s, prompt de 14.401 tokens | 1.822 | 1.700 |
| Prefill tok/s, prompt de 29.887 tokens | 1.740 | 1.607 |

Latencia con el comando de ejemplo (tqLLM 1.2.3, contexto 32K, KV tq3, borrador DFlash2):

| Hardware | Arranque | Respuesta de 512 tokens | Primer token con prompt de 26.199 tokens |
|---|---:|---:|---:|
| RTX 3090 24 GB | 136 s | 149,2 tok/s | 14,3 s |
| GB10 (DGX Spark) | 18 s | 61,7 tok/s | 23,7 s |

## Requisitos de hardware

- VRAM estimada: 14,63 GB para el modelo principal más 0,79 GB del borrador; con contexto de 32K y KV en tq3 el consumo total encaja en 24 GB.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 (x86-64) y GB10 / DGX Spark (ARM64). El autor cita explícitamente "24 GB GPUs y GB10".
- Cabe en GPU de consumo: sí, en RTX 3090/4090/5090 de 24 GB o más. No se documenta funcionamiento en GPUs de 16 GB o menos.
- Opciones de despliegue: exclusivamente el motor tqLLM (imagen `ytan2000/tqllm:1.2.3` o `ghcr.io/turbo-tan/tqllm:1.2.3`) mediante Docker con `--gpus all`. No es compatible con llama.cpp, Ollama, LM Studio ni TGI, porque los tensores TQ4 usan el tipo GGUF 300 propio de tqLLM.
- Throughput: 196,4 tok/s en decodificación con borrador y 51,6 tok/s sin él en RTX 3090; prefill de 1.740–1.822 tok/s. En GB10, 61,7 tok/s de decodificación.
- El rendimiento de la decodificación especulativa depende del texto: código y respuestas con mucha copia aceptan más borradores que prosa abierta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-TQ (este) | 27,3B | 32K–64K | Apache 2.0 | GGUF TQ4, solo tqLLM | 14,63 GB, decodificación 196,4 tok/s con borrador en RTX 3090 |
| Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF Q4_K_M | 27,3B | no disponible | Apache 2.0 | GGUF estándar (llama.cpp y derivados) | 16,8 GB, 158,9 tok/s con borrador en el mismo motor; portable a Ollama/LM Studio |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | safetensors / GGUF | Modelo base del fine-tune; sin especialización en código |

No se dispone en la información proporcionada de comparaciones con otros modelos de la misma categoría (por ejemplo, otros fine-tunes de código de 27B–32B) ni de sus cifras de benchmarks.

## Limitaciones y advertencias

- Dependencia total del motor tqLLM: el archivo no carga en llama.cpp, Ollama ni LM Studio. Esto limita la portabilidad y ata el despliegue a una imagen Docker concreta.
- El modelo solo declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Bucles de razonamiento repetido en sesiones de agente muy largas (75K+ tokens de historial): el autor indica que el fine-tune cae en ellos con más frecuencia que la base Qwen3.8-27B y recomienda `presence_penalty: 1.5`. Es un comportamiento del fine-tune, no de la cuantización.
- El KLD en chat con thinking es alto (0,20 frente a 0,016 en prosa+código), lo que indica mayor divergencia respecto a BF16 en ese modo; el autor lo atribuye al fine-tune.
- MMLU-Pro se midió sobre un subconjunto de 291 preguntas con error estándar de ±2,2 puntos, por lo que la diferencia de 83,8 frente a 81,4 debe interpretarse con cautela.
- La decodificación especulativa depende del contenido: en prosa abierta la aceleración será menor que en código.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasas de alucinación en la información disponible.
- El modelo borrador DFlash2 se entrenó sobre la base Qwen3.8-27B, no sobre el fine-tune; el autor afirma que funciona bien igualmente, pero no es un ajuste específico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YTan2000/Qwopus3.8-27B-Coder-Flash-TQ
- Modelo base (fine-tune): https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Versión GGUF Q4_K_M del autor original: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Motor tqLLM: https://tqllm.com
- Créditos del motor tqLLM: https://tqllm.com/credits
- Repositorio DFlash (z-lab): https://github.com/z-lab/dflash
- Paper DFlash2: https://arxiv.org/abs/2602.06036
- Blog de TurboQuant (Google Research): https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/
