# styal/leffm-1.7b

## Resumen

leffm-1.7b (Liquid Efficient Foundation Model) es una variante eficiente de LiquidAI/LFM3-1.7B desarrollada por el usuario styal. Mantiene la arquitectura base del modelo original pero introduce dos modificaciones entrenadas: una FFN en cascada que reduce un 30% los FLOPs por token y un recorte de vocabulario de 128.000 a 65.536 tokens que elimina un 7,4% de los parámetros. El resultado es un modelo de 1.601.059.584 parámetros (1,6B) que conserva el pipeline de generación de texto conversacional del original.

La motivación es puramente de eficiencia en decodificación: en GPUs (CUDA y Metal) el modelo decodifica entre un 19% y un 22% más rápido que el LFM3-1.7B original a batch 1, a costa de un pequeño incremento de perplejidad (+6,8% en bits/byte frente al control denso entrenado de forma equivalente). Es un experimento de investigación sobre FFN dispersas en cascada más que un modelo de producción listo para usar.

La relevancia actual reside en que demuestra que se puede reducir el coste computacional por token en decodificación autoregresiva mediante selección dinámica de unidades en la FFN, un enfoque alternativo a MoE, y que el ahorro se traduce en speedup real en GPU aunque no en CPU. El modelo se distribuye en safetensors bf16 y GGUF Q8_0, y requiere un fork específico de llama.cpp para aprovechar la cascada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN en cascada (cascade FFN, sparse-FFN); derivada de LFM3-1.7B |
| Parametros totales | 1.601.059.584 (1,6B) |
| Parametros activos | no disponible (no es MoE; la cascada selecciona unidades de FFN, no expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (recomendado); safetensors bf16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other, heredada de LiquidAI/LFM3-1.7B) |
| Formato de pesos | safetensors (bf16, 3,2 GB) y GGUF (Q8_0, 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de LiquidAI y aplica dos cambios entrenados. El primero es una FFN en cascada: en una FFN con compuerta (gated FFN) estándar con F = 7.680 unidades, la proyección de compuerta actúa como router y calcula todas las unidades, pero las proyecciones up y down solo se evalúan sobre un subconjunto seleccionado (c = 5.120, k = 2.304 según los metadatos del modelo), lo que reduce los FLOPs por token en un 30%. El segundo es un recorte del vocabulario de 128.000 a 65.536 tokens, que reduce los parámetros totales un 7,4%; el tokenizador recortado necesita 1,0043 veces más tokens para el mismo texto.

El entrenamiento consistió en un continued-pretraining emparejado de 2,67M tokens (163 pasos) sobre el conjunto styal/calib-data, con un control denso entrenado de forma idéntica. No se documentan fases de RLHF o DPO ni la composición completa del dataset de preentrenamiento original, que hereda del LFM3-1.7B. La innovación técnica destacable es la cascada FFN como alternativa a MoE para reducir cómputo en decodificación, con una identidad aritmética verificable: `LLAMA_CASCADE=7680,7680` reproduce exactamente la FFN densa. La cascada solo opera en decodificación batch 1; el procesamiento de prompt sigue siendo denso.

## Capacidades

- Generación de texto conversacional en formato chat (chat template incluido).
- Razonamiento y generación de texto general, heredados de LFM3-1.7B.
- Decodificación eficiente en GPU: 7,54 ms/token en CUDA (L4) y 12,47 ms/token en Metal (M5) a batch 1, Q8_0, greedy.
- Ejecución en llama.cpp mediante el fork styalai/leffm-llamacpp, con la cascada configurable por variable de entorno.
- Compatibilidad con la API de Transformers (`AutoModelForCausalLM` con `trust_remote_code=True`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre FFN dispersas: el modelo sirve como banco de pruebas reproducible para medir el equilibrio entre ahorro de FLOPs y degradación de perplejidad, con el control denso entrenado de forma emparejada y la identidad aritmética `LLAMA_CASCADE=7680,7680` como verificación.
- Decodificación de baja latencia en GPU de gama media: con 7,54 ms/token en una NVIDIA L4 y un archivo Q8_0 de 1,7 GB, encaja en entornos donde el coste por token importa y el hardware es limitado.
- Despliegue en Apple Silicon para prototipado: 12,47 ms/token en Metal sobre M5 permite iterar en local con un modelo de 1,6B sin GPU dedicada.
- Chat conversacional ligero: el chat template y el modo `-cnv` de llama-cli permiten montar un asistente de un solo turno o multi-turno con un binario compilado y un archivo GGUF.
- Experimentación con recorte de vocabulario: el tokenizador de 65.536 tokens y la métrica bits/byte documentada permiten estudiar el impacto del vocabulario en la eficiencia de codificación.
- Benchmarking de backends: el par llama-bench y las cifras publicadas (CUDA, Metal, CPU) permiten comparar rendimiento de inferencia entre plataformas con un modelo pequeño y reproducible.

## Benchmarks y rendimiento

Rendimiento de decodificación (batch 1, Q8_0, greedy, mejor de cinco):

| Backend | LFM3-1.7B | leffm | Speedup |
|---|---:|---:|---:|
| CUDA (NVIDIA L4) | 9,01 ms/token | 7,54 ms/token | 1,19x |
| Metal (Apple M5) | 15,16 ms/token | 12,47 ms/token | 1,22x |
| CPU (M5, `-t 4`) | 22,8 ms/token | 25,4 ms/token | 0,90x |

Calidad (perplejidad sobre 64 secuencias, 115.159 bytes, tras continued-pretraining de 2,67M tokens):

| Modelo | Vocab | FFN | PPL/token | bits/byte |
|---|---:|---|---:|---:|
| LFM3-1.7B original | 128.000 | densa | 3,392 | 0,4270 |
| Denso tras CPT | 128.000 | densa | 2,832 | 0,3639 |
| leffm | 65.536 | cascada | 3,035 | 0,3885 |

En llama.cpp, con los mismos pesos, el archivo mide PPL 3,450 con la cascada y 3,174 forzando la FFN densa (batch 1, Q8_0). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GB para GGUF Q8_0 y 3,2 GB para safetensors bf16.
- GPU recomendadas: NVIDIA L4 (medido), L40S, RTX 40xx (arquitectura Ada, 89), A100 (80), A10 / RTX 30xx (86), H100 (90); Apple Silicon con Metal (M5 medido).
- Cabe en cualquier GPU consumer con al menos 2-3 GB de VRAM libre; también en CPU, aunque ahí el modelo es más lento que el denso (25,4 frente a 22,8 ms/token).
- Opciones de despliegue: fork styalai/leffm-llamacpp (llama-cli, llama-bench) con compilación CMake y CUDA o Metal; Transformers con `trust_remote_code=True` para bf16.
- Latencia: 7,54 ms/token en CUDA y 12,47 ms/token en Metal a batch 1; throughput no disponible más allá de estas cifras de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion (CUDA, batch 1) | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| leffm-1.7b | 1,6B | no disponible | 7,54 ms/token | lfm1.0 | HF (repo privado según la model card) |
| LiquidAI/LFM3-1.7B | 1,7B aprox. | no disponible | 9,01 ms/token | lfm1.0 | HF |
| Denso tras CPT (control) | 1,7B aprox. | no disponible | no disponible | lfm1.0 | no disponible |

La comparación directa con otras familias de modelos de 1-2B (Llama 3.2 1B, Qwen2.5 1.5B, Gemma 2 2B) no está disponible en la información proporcionada; no se han publicado resultados de benchmarks estándar que permitan situar a leffm frente a ellos.

## Limitaciones y advertencias

- La cascada FFN solo funciona en decodificación batch 1; el procesamiento de prompt sigue siendo denso, por lo que el ahorro no aplica a prefill.
- En CPU el modelo es más lento que el denso (0,90x): ggml ya opera al límite de su matvec int8 y leer menos bytes no aporta ventaja.
- Coste de calidad medido: +0,069 nats (+6,8% bits/byte) frente al control denso entrenado de forma equivalente.
- El tokenizador recortado requiere un 1,0043x más tokens para el mismo texto, lo que encarece ligeramente la codificación.
- Requiere un fork específico de llama.cpp (styalai/leffm-llamacpp); no funciona con llama.cpp estándar para aprovechar la cascada.
- La model card indica que el repositorio es privado (`hf auth login` necesario), lo que limita la reproducibilidad pública.
- Licencia lfm1.0: es necesario revisar las restricciones de uso comercial del LFM3-1.7B original antes de desplegar en producción.
- Riesgo de alucinación, sesgos y cobertura idiomática: no documentados en la información disponible; al ser un modelo de 1,6B, se espera una fiabilidad limitada en tareas de razonamiento complejo.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.

## Enlaces

- Hugging Face: https://huggingface.co/styal/leffm-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Fork de llama.cpp: https://github.com/styalai/leffm-llamacpp
