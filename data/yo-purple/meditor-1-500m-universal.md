# Yo-Purple/Meditor-1-500M-Universal

## Resumen

Meditor-1-500M-Universal es un modelo de lenguaje denso de tipo decoder-only publicado por el desarrollador independiente Yo-Purple. Se trata de una reencapsulación del modelo base Meditor-1-2.2B-A500M-MoE en la topología estándar `Qwen2ForCausalLM`, de modo que el cómputo activo del MoE original (que fluía exclusivamente por sus 24 capas GQA y su experto compartido SwiGLU de 4.864 dimensiones, con `routed_scale = 0.0`) queda congelado en un transformer denso de 24 capas, hidden size 896 y GQA 7:1.

La propuesta del autor es la paridad bit-exacta con el forward pass del modelo original, pero eliminando la necesidad de `trust_remote_code=True`, kernels personalizados o drivers propietarios. Al adoptar la arquitectura Qwen2 estándar, el modelo funciona de forma nativa en transformers, vLLM, llama.cpp, Ollama y LM Studio, y resuelve el bug de sesgo de gating que afectaba a los pesos MoE personalizados en motores C++.

El modelo tiene 494.032.768 parámetros almacenados (con embeddings atados), contexto nativo de 32.768 tokens y licencia Apache 2.0. Su relevancia práctica radica en el reducido footprint: ~0,93 GB de VRAM en BF16 y 468 MB en Q4_K_M, con throughputs declarados de hasta 287 tok/s en una RTX 4060 Laptop. Está orientado a razonamiento, aritmética y uso con herramientas (toolformer), y solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, `Qwen2ForCausalLM` (Qwen2) |
| Parametros totales | 494.032.768 (~494M, embeddings atados); el repositorio safetensors reporta 630.167.424 tensores almacenados |
| Parametros activos | No aplica (modelo denso; 100% de los parámetros activos por token) |
| Longitud de contexto | 32.768 tokens (RoPE theta nativo 1.000.000,0) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF); BF16 en safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (BF16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 24 capas, `d_model` de 896 y FFN intermedio de 4.864 con activación SwiGLU. La atención usa Grouped-Query Attention con 14 cabezas de query y 2 de key/value (ratio 7:1). Los embeddings de entrada y salida están atados. La arquitectura es la estándar de Qwen2, sin código remoto ni kernels externos.

El modelo no se entrena desde cero: es una reencapsulación de los pesos activos de `Yo-Purple/Meditor-1-2.2B-A500M-MoE`. En el MoE original, el cómputo activo transitaba únicamente por las capas GQA y el experto compartido SwiGLU, con el enrutamiento desactivado (`routed_scale = 0.0`); al extraer y reempaquetar esos parámetros en la topología Qwen2 se obtiene un denso equivalente con paridad bit-exacta en el forward pass. La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias; esos datos figuran como no disponibles. La innovación técnica destacable es de ingeniería de despliegue: la eliminación del bug de sesgo de gating que afectaba a los pesos MoE personalizados en llama.cpp, Ollama y LM Studio, y la compatibilidad nativa con todo el ecosistema sin `trust_remote_code`.

## Capacidades

- Generación de texto conversacional en inglés con formato de plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento de tipo científico y de sentido común en formato de opción múltiple (evaluado en estilo ARC).
- Aritmética directa por decodificación autorregresiva y aritmética aumentada con herramientas (tool calling hacia un coprocesador AST de matemáticas).
- Soporte de tool calling / function calling (etiqueta `toolformer` en el repositorio).
- Razonamiento multi-paso acotado y uso de contexto largo de hasta 32.768 tokens.
- Capacidades multilingües limitadas: solo declara inglés.
- No se declaran capacidades de visión, audio, thinking mode explícito ni agentes autónomos de largo horizonte.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: con 468 MB en Q4_K_M y ~0,93 GB de VRAM en BF16, puede ejecutarse en portátiles, Raspberry Pi o móviles para chats multi-turno con contexto de hasta 32.768 tokens, sin GPU dedicada de gran tamaño.
- Aritmética asistida por herramientas en pipelines de datos: el modelo declara 100% de acierto en 15/15 cuando se le empareja con un coprocesador AST de matemáticas, por lo que encaja como planificador de llamadas a calculadora en flujos de extracción y validación numérica.
- Enrutamiento y function calling en aplicaciones de automatización: su etiqueta `toolformer` y su formato ChatML permiten integrarlo como capa de selección de herramientas en agentes ligeros, con baja latencia de prefill (37,7 ms para 256 tokens).
- Servicio de inferencia de alto throughput con vLLM: el autor declara compatibilidad nativa con `vllm serve` y una API compatible con OpenAI, adecuado para desplegar endpoints de bajo coste con cientos de tokens por segundo en una sola GPU consumer.
- Prototipado rápido en LM Studio o llama.cpp: al no requerir `trust_remote_code` ni kernels personalizados, sirve para validar prompts, plantillas y flujos conversacionales antes de escalar a modelos mayores.
- Evaluación comparativa de arquitecturas MoE frente a densas: al ser una reencapsulación bit-exacta del MoE original, permite medir el coste real de empaquetado y cuantización sin introducir diferencias de salida matemática.
- Generación de texto en entornos con restricciones de memoria: 0,93 GB de VRAM deja ~7 GB libres en una GPU de 8 GB para contexto largo o concurrencia multiagente.

## Benchmarks y rendimiento

Datos declarados por el autor, medidos localmente en una NVIDIA GeForce RTX 4060 Laptop de 8 GB con PyTorch 2.6 y llama.cpp (build CUDA 4576). No se dispone de comparaciones con modelos de referencia en la información proporcionada.

| Metrica | Resultado | Detalle |
|---|---|---|
| Perplejidad de razonamiento (PPL) | 3,56 | Entropía cruzada 1,2699 sobre 8.867 tokens de razonamiento (GSM8K) |
| Razonamiento científico estilo ARC | 86,7% | 13/15 zero-shot por log-likelihood en opción múltiple |
| Aritmética directa | 73,3% | 11/15 en decodificación autorregresiva |
| Aritmética aumentada con herramientas | 100,0% | 15/15 con coprocesador AST de matemáticas |
| Latencia de prefill (256 tokens) | 37,7 ms | ~6.790 tok/s de prompt |
| Decodificación en PyTorch | 29,4 tok/s | FP16/BF16 nativo |
| Throughput GGUF BF16 | 157,5 tok/s | llama.cpp CUDA a plena precisión |
| Throughput GGUF Q8_0 | 249,3 tok/s | llama.cpp CUDA, 644 MB |
| Throughput GGUF Q4_K_M | 287,4 tok/s | llama.cpp CUDA, 468 MB |
| VRAM activa | ~0,93 GB | Deja ~7,0 GB libres en una GPU de 8 GB |

## Requisitos de hardware

- VRAM estimada: ~0,93 GB en BF16; ~644 MB en Q8_0; ~468 MB en Q4_K_M.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; el autor valida en RTX 4060 Laptop de 8 GB. También cabe en iGPU y en CPU.
- Cabe en GPU consumer: sí, en toda la gama (GTX 16xx, RTX 20xx/30xx/40xx, Apple Silicon, iGPU modernas) y en dispositivos tipo Raspberry Pi o iPhone según el autor.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`, sin `trust_remote_code`), vLLM (`vllm serve`), llama.cpp (`llama-cli`), Ollama, LM Studio.
- Latencia y throughput declarados: 37,7 ms de prefill para 256 tokens; 29,4 tok/s en PyTorch; 157,5 tok/s en GGUF BF16; 249,3 tok/s en Q8_0; 287,4 tok/s en Q4_K_M.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con modelos de referencia de tamaño equivalente (por ejemplo, Qwen2.5-0.5B, SmolLM2-360M o TinyLlama-1.1B). Los datos de la model card no incluyen tablas comparativas frente a terceros.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Comparativa de rendimiento |
|---|---|---|---|---|---|
| Meditor-1-500M-Universal | ~494M (denso) | 32.768 | Apache 2.0 | HF, GGUF, vLLM, llama.cpp | Datos propios en tabla anterior |
| Alternativas de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse solo en inglés, cabe esperar sesgos culturales y lingüísticos propios de corpus anglosajones.
- Riesgo de alucinación: no se reportan evaluaciones de factualidad ni de calibración; los benchmarks publicados se limitan a razonamiento y aritmética sobre conjuntos pequeños (13 y 15 ejemplos), por lo que la significación estadística es baja.
- Limitaciones de idioma: solo declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Limitaciones de contexto: el contexto nativo es de 32.768 tokens, pero no se documenta el rendimiento más allá de la ventana de entrenamiento ni técnicas de extensión.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base es a su vez un derivado de un MoE del mismo autor; conviene verificar la cadena de licencias del modelo original antes de producción.
- Caveats de producción: el repositorio tiene 0 descargas y 1 like en el momento de la ficha, sin validación independiente; los benchmarks son autoinformados y medidos en una única GPU. El número de parámetros reportado por safetensors (630.167.424) difiere del declarado en la model card (494.032.768), lo que conviene verificar antes de dimensionar despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/Yo-Purple/Meditor-1-500M-Universal
- Modelo base: https://huggingface.co/Yo-Purple/Meditor-1-2.2B-A500M-MoE
