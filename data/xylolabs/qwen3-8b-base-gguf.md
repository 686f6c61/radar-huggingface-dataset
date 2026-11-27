# Xylolabs/Qwen3-8B-Base-GGUF

## Resumen

Xylolabs/Qwen3-8B-Base-GGUF es una cuantización en formato GGUF del modelo base Qwen3-8B-Base, publicado por el equipo de Qwen (Alibaba). El modelo original es un transformer decoder-only denso de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones), entrenado desde cero como modelo base sin ajuste por instrucciones ni alineamiento conversacional. Esta versión concreta la distribuye Xylolabs, que ha convertido los pesos originales en safetensors a GGUF y ha generado una única cuantización Q4_K_M de 5,028 GB.

El modelo resuelve el problema de ejecutar un LLM de 8B en hardware de consumo y estaciones de trabajo con recursos limitados, manteniendo una ventana de contexto de 32K tokens. Al ser un modelo base, su función principal es la continuación de texto y el preentrenamiento, no el diálogo por turnos: no incorpora plantilla de chat ni comportamiento instruct. Es relevante ahora porque permite hacer fine-tuning, evaluación de distribuciones y experimentos de investigación sobre un checkpoint de referencia en formato compatible con llama.cpp.

La ficha se centra en esta distribución GGUF concreta (un solo archivo Q4_K_M), aunque se incluyen referencias al modelo base original para contextualizar arquitectura y capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parámetros totales | 8.190.735.360 (8,19B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (según tabla de recomendación de hardware del autor) |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | en, ko (según metadatos del repo; el modelo base original es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3-8B-Base-Q4_K_M.gguf`, 5,028 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B-Base, un transformer decoder-only denso de la familia Qwen3. La información proporcionada no detalla la composición exacta del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; el modelo es explícitamente un *base model*, por lo que no se ha sometido a alineamiento conversacional. El informe técnico de referencia es el Qwen3 Technical Report (arXiv:2505.09388), donde se describen los detalles completos de la arquitectura y el preentrenamiento.

Esta distribución concreta no introduce cambios arquitectónicos: Xylolabs ha convertido los pesos originales a GGUF y ha aplicado cuantización Q4_K_M. El autor documenta la fidelidad de la cuantización frente al BF16 original mediante divergencia KL y precisión top-1 sobre WikiText-2 y un conjunto held-out: Q4_K_M obtiene KL de 0,043104 y top-1 del 89,250% en WikiText-2, y KL de 0,026242 y top-1 del 91,941% en held-out. La conversión se validó con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` de llama.cpp.

## Capacidades

- Generación y continuación de texto sin plantilla de chat (modelo base, no instruct).
- Razonamiento y conocimiento general heredados del preentrenamiento de Qwen3-8B-Base.
- Capacidad de código y matemáticas propia de un modelo base de su tamaño (no evaluada en la información disponible para esta cuantización).
- Multilingüismo del modelo original; los metadatos de esta distribución solo declaran en y ko.
- Punto de partida para fine-tuning supervisado, DPO o adaptación de dominio.
- No incluye tool calling, function calling ni modo thinking: esas capacidades pertenecen a los checkpoints instruct de Qwen3, no a este base.
- No soporta visión ni audio.

## Casos de uso

- Fine-tuning de dominio: usar el checkpoint base como inicialización para SFT o LoRA en tareas específicas (legal, médico, industrial), aprovechando que no arrastra sesgos de alineamiento conversacional.
- Investigación en cuantización: comparar la fidelidad de Q4_K_M frente a BF16 con las métricas KL y top-1 publicadas, y replicar el pipeline con otras cuantizaciones.
- Evaluación de distribuciones de lenguaje: medir perplejidad, calibración y comportamiento de un modelo base de 8B en corpus propios con llama.cpp.
- Generación de texto asistida por prompt-prefix: completar documentos, código o datos estructurados a partir de un prefijo, usando `llama-completion` con `-no-cnv`.
- Destilación y generación de datos sintéticos: producir grandes volúmenes de texto con un modelo de 8B cuantizado en una sola GPU de 24 GB, alimentando pipelines de destilación.
- Despliegue en estaciones de trabajo y equipos de consumo: inferencia local en RTX 4090/3090 (24 GB) con contexto de 32K, o en Mac Studio con memoria unificada, para prototipos y demos sin infraestructura cloud.
- Base para experimentos de decodificación y sampling: estudiar estrategias de decodificación sobre un modelo sin post-entrenamiento que sesgue las salidas.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K). Solo documenta métricas de fidelidad de la cuantización frente a BF16:

| Cuantización | Tamaño | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,710 GB | 0,003454 | 96,485% | 0,001139 | 98,294% |
| llama.cpp Q6_K | 6,726 GB | 0,012212 | 93,142% | 0,004367 | 96,529% |
| llama.cpp Q5_K_M | 5,851 GB | 0,018080 | 92,098% | 0,008769 | 95,176% |
| Q4_K_M (esta distribución) | 5,028 GB | 0,043104 | 89,250% | 0,026242 | 91,941% |
| llama.cpp Q3_K_M | 4,124 GB | 0,157874 | 80,181% | 0,101343 | 85,196% |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,0 GB de pesos en Q4_K_M, más overhead de contexto KV; con 32K de contexto se recomienda reservar entre 8 y 12 GB en total.
- GPU recomendadas por el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256/512 GB unificada), B300 (288 GB).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8-12 GB de VRAM efectiva para contexto moderado; el autor la valida explícitamente en RTX 4090/3090 y RTX 5090.
- Opciones de despliegue: llama.cpp (versión `cd959bae` o posterior), y por extensión cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, LM Studio). No se documenta soporte para vLLM o TGI en esta distribución.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Xylolabs/Qwen3-8B-Base-GGUF (esta ficha) | 8,19B | 32K | GGUF Q4_K_M | Apache 2.0 | Solo cuantización Q4_K_M; métricas de fidelidad publicadas |
| Qwen/Qwen3-8B-Base | 8,19B | 32K | safetensors (BF16) | Apache 2.0 | Modelo original; mayor fidelidad, requiere más VRAM |
| Qwen/Qwen3-8B | 8,19B | 32K | safetensors | Apache 2.0 | Variante instruct/chat con tool calling y modo thinking |
| Cuantizaciones GGUF de terceros de Qwen3-8B-Base | 8,19B | 32K | GGUF (múltiples niveles) | Apache 2.0 | Suelen ofrecer Q2 a Q8; esta distribución solo publica Q4_K_M |

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene diálogo; usarlo como chatbot produce continuaciones de texto, no respuestas.
- Riesgo de alucinación y de generar contenido sesgado o tóxico heredado del corpus de preentrenamiento; no hay alineamiento que lo mitigue.
- La cuantización Q4_K_M introduce pérdida medible de fidelidad (KL 0,043 en WikiText-2, top-1 89,25%); para tareas sensibles a la precisión conviene evaluar Q6_K o Q8_0.
- Idiomas declarados en el repo: solo en y ko; el rendimiento en castellano no está verificado en esta distribución.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar el archivo `LICENSE` incluido.
- Solo se publica un archivo Q4_K_M; no hay variantes de menor o mayor precisión en este repo.
- Fecha de creación y actualización del repo (noviembre de 2026) posterior al informe técnico de Qwen3; verificar compatibilidad con la versión de llama.cpp indicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Base-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-8B-Base
- Informe técnico Qwen3: https://arxiv.org/abs/2505.09388
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
