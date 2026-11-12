# Xylolabs/Llama-3.1-8B-Tensix-BFP8

## Resumen

Llama-3.1-8B-Tensix-BFP8 es una cuantización del modelo meta-llama/Llama-3.1-8B realizada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only original de 8.030.261.248 parámetros, pero cuantiza las capas lineales (atención q/k/v/o y MLP gate/up/down en las 32 capas) al formato de coma flotante por bloques `ttnn.bfloat8_b` (BFP8) mediante GPTQ, mientras que embeddings, LM head, normas y el resto de tensores permanecen en bf16.

La motivación es práctica: TT-NN empaqueta directamente los tensores BFP8 sin conversión en tiempo de carga, lo que reduce el peso empaquetado a 9,52 GB (9,48 bits por peso de media) frente a los 16,06 GB del checkpoint bf16. Esto permite desplegar el modelo en hardware Tensix con menor presión de memoria DRAM. Los ficheros se distribuyen en safetensors en bf16, pero cada valor ya está alineado a la rejilla BFP8, de modo que el empaquetado es una operación sin pérdida adicional.

Es relevante para quienes trabajan con aceleradores Tenstorrent y necesitan un checkpoint de Llama 3.1 listo para `ttnn`, con una evaluación de fidelidad respecto a BF16 publicada (KL media de 0,00095 y top-1 del 98,44 % sobre 8.184 posiciones). No es un modelo nuevo ni afinado: es el checkpoint preentrenado de Meta, sin plantilla de chat, pensado para continuación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), capas lineales cuantizadas a BFP8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada en esta ficha) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en el resto; GPTQ sobre rejilla bfloat8_b; 9,48 bits por peso de media |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16 con valores alineados a rejilla BFP8); empaquetado BFP8 de 9,52 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B: transformer decoder-only con 32 capas, atención con RoPE y MLP con activación SwiGLU. La modificación introducida por Xylolabs no afecta a la topología, sino a la representación numérica de las matrices de proyección. Las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) en las 32 capas se cuantizan a `ttnn.bfloat8_b`, un formato de coma flotante por bloques con exponente compartido por bloque y 8,5 bits efectivos por peso. Embeddings, LM head, normas y demás tensores se conservan en bf16. El resultado son 9,48 bits por peso de media y 9,52 GB empaquetados.

La cuantización se realizó con GPTQ sobre la rejilla bfloat8_b, respetando el exponente compartido que fija el empaquetador de TT-NN, y se calibró con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los pesos bf16 de partida son los de Meta (los cuatro shards safetensors comparten sha256 con los de unsloth/Llama-3.1-8B, de donde se descargaron); `config.json`, `generation_config.json` y el tokenizer son las versiones de unsloth sin modificar. No hay entrenamiento adicional ni ajuste fino: es una conversión de formato con calibración GPTQ. La validación se hizo con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent, no sobre hardware físico; tt-transformers y tt-forge no se probaron con este checkpoint. El repositorio incluye `pack_tensix.py` (verifica el empaquetado matriz a matriz, con opción `--device` para ida y vuelta por DRAM del dispositivo) y `verify_grid.py` (comprueba la rejilla solo con torch).

## Capacidades

- Generación de texto y continuación de texto: es el checkpoint preentrenado, sin plantilla de chat ni ajuste por instrucciones.
- Razonamiento y conocimiento general heredados de Llama 3.1 8B en su forma base.
- Generación de código y matemáticas a nivel de modelo base (sin post-entrenamiento conversacional específico en este export).
- Capacidades multilingües limitadas a los idiomas declarados: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- No se documenta soporte de tool calling ni function calling en esta model card.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- No hay modo thinking, visión ni audio.
- Ejecución nativa en NPU Tensix mediante TT-NN (`ttnn.bfloat8_b`), con empaquetado directo de los pesos sin conversión en carga.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está pensado para cargarse con TT-NN y aprovechar el empaquetado BFP8 directo, reduciendo el peso en DRAM de 16,06 GB a 9,52 GB. Adecuado para prototipos en aceleradores Tensix.
- Continuación de texto por lotes en pipelines de generación: al ser un modelo base sin plantilla de chat, encaja en tareas de completado (relleno de plantillas, generación de descripciones a partir de prefijos) donde no se requiere formato conversacional.
- Evaluación de fidelidad de cuantización: sirve como referencia para comparar el impacto de BFP8 frente a bf16 y frente a Q4_K_M en tareas de lenguaje, con métricas de KL y top-1 publicadas.
- Investigación en cuantización por bloques: el par de scripts `pack_tensix.py` y `verify_grid.py` permite auditar que cada matriz empaquetada reproduce exactamente el tensor original, útil para estudiar formatos BFP.
- Generación multilingüe en los ocho idiomas declarados: útil para tareas de completado en alemán, francés, italiano, portugués, hindi, español y tailandés, con la salvedad de que es un modelo base.
- Base para ajuste fino posterior: al mantener la estructura y el tokenizer de Llama 3.1 8B, puede servir de punto de partida para fine-tuning, aunque conviene valorar si el formato BFP8 complica el flujo de entrenamiento estándar.
- Validación en simulador: con `ttsim` (Blackhole) se puede verificar el comportamiento del checkpoint antes de disponer de hardware, útil en desarrollo de kernels TT-NN.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea. KL y top-1 se calculan sobre 8.184 posiciones de texto inglés y coreano (WikiText-2 test y Wikipedia en coreano); las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completado y 3-shot.

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B) | 16 | 16,06 | 0 | 100 | 23 de 28 | - |
| **Este modelo** | 9,48 | 9,517 | 0,00095 | 98,44 | 23 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,89 | 4,921 | 0,03478 | 90,58 | 24 de 28 | 0 |

El criterio de aceptación del autor era una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; el modelo lo cumple con holgura (0,03 veces la KL de Q4_K_M y 0 respuestas perdidas frente a 0). No se midió velocidad en dispositivo.

## Requisitos de hardware

- Peso empaquetado: 9,52 GB en BFP8; checkpoint en disco (safetensors bf16): 16,1 GB de repositorio.
- Inferencia en CPU/GPU con transformers: al cargarse en bf16, requiere aproximadamente 16 GB de VRAM o memoria unificada para los pesos, más overhead de activaciones y caché KV.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Validación realizada con `ttnn` 0.81.1 sobre `ttsim` (simulador de Blackhole); no probado en hardware físico según la model card.
- Despliegue: transformers (quickstart documentado con `AutoModelForCausalLM` y `dtype="bfloat16"`), TT-NN para Tensix. El tag `text-generation-inference` aparece en los metadatos del Hub, pero no se documenta configuración específica de TGI.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Tensix-BFP8 (este) | 8,03 B | no disponible | safetensors BFP8, 9,48 bits | Llama 3.1 | Hugging Face, orientado a Tensix |
| meta-llama/Llama-3.1-8B (base) | 8,03 B | no disponible | bf16, 16 bits | Llama 3.1 | Hugging Face |
| unsloth/Llama-3.1-8B | 8,03 B | no disponible | bf16, 16 bits | Llama 3.1 | Hugging Face (origen de los pesos) |
| Q4_K_M de llama.cpp (misma base) | 8,03 B | no disponible | GGUF, 4,89 bits | Llama 3.1 | Generado localmente con llama.cpp v0.9.0 |

La comparación relevante es de fidelidad: frente a Q4_K_M, este modelo ocupa más del doble (9,52 GB frente a 4,92 GB) pero reduce la KL media en más de un orden de magnitud (0,00095 frente a 0,03478) y sube el top-1 del 90,58 % al 98,44 %. Frente a BF16, la pérdida es marginal en las métricas publicadas.

## Limitaciones y advertencias

- Es el modelo preentrenado: no tiene plantilla de chat ni ajuste por instrucciones; no debe usarse directamente como asistente conversacional sin post-entrenamiento.
- Los benchmarks publicados miden cercanía a BF16, no calidad de tarea; no hay evaluación de MMLU, HumanEval, GSM8K ni similares en la información disponible.
- La validación se hizo en simulador (`ttsim`), no en hardware Tensix físico; el rendimiento real en Wormhole o Blackhole no está medido.
- tt-transformers y tt-forge no se probaron con este checkpoint.
- Riesgo de alucinación y sesgos heredados de Llama 3.1 8B en su forma base; no se documentan mitigaciones adicionales en este export.
- Idiomas limitados a los ocho declarados; el resto de idiomas no está cubierto explícitamente.
- Licencia Llama 3.1 Community License con su Acceptable Use Policy: uso comercial permitido bajo condiciones, con obligaciones de atribución y restricciones de la política de uso aceptable.
- El formato BFP8 está atado al empaquetador de TT-NN; fuera de Tensix, los pesos se cargan en bf16 y se pierde la ventaja de memoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Origen de los pesos bf16 y ficheros de configuración: https://huggingface.co/unsloth/Llama-3.1-8B/tree/3f0d51f8e5640f98f1a96ea9044a0e55c0a83814
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia Llama 3.1: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tensix-BFP8/blob/main/LICENSE
