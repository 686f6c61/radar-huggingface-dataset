# Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-GateUp

## Resumen
Este modelo es una exportación cuantizada de Qwen2.5-14B-Instruct, el transformer denso de 14.770.033.664 parámetros desarrollado por Alibaba Qwen, adaptado por Xylolabs para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La modificación no altera la topología del modelo base: únicamente reemplaza las matrices lineales por versiones comprimidas en los formatos de bloque `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) y `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso), que TT-NN empaqueta sin transformar los valores almacenados.

La relevancia de esta ficha es práctica: demuestra que es posible llevar un modelo de 14B a hardware de inferencia no convencional (NPU Tensix) con una pérdida de fidelidad respecto a BF16 muy contenida. El checkpoint ocupa 13,76 GB de memoria de dispositivo para los pesos del modelo de lenguaje y mantiene una media de 7,45 bits por peso, lo que lo sitúa entre un Q4_K_M de llama.cpp (4,87 bits) y el BF16 original (16 bits) en cuanto a tamaño, con una calidad declarada ligeramente superior al Q4_K_M en las métricas de divergencia publicadas.

El modelo base Qwen2.5-14B-Instruct es un transformer decoder-only con 48 capas, atención GQA y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN), entrenado sobre 18 billones de tokens y afinado con instrucciones. Esta exportación conserva esas capacidades, pero su público objetivo es el despliegue en Tenstorrent, no la inferencia convencional en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), 48 capas, atención GQA |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; extensible a 131.072 con YaRN (no verificado en esta exportación) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate y up; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o y MLP down; bf16 en embeddings, LM head y normas. Media de 7,45 bits/peso |
| Idiomas soportados | Inglés declarado en la model card; el modelo base soporta más de 29 idiomas, pero esta exportación solo declara `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (29,5 GB de repositorio), con `quant4.json` que describe el formato de cada proyección |
| Memoria de dispositivo requerida | 13,76 GB para pesos del LM, más KV cache y buffers |
| Hardware objetivo | NPU Tenstorrent Tensix (Wormhole, Blackhole) |
| Librería | transformers (carga en bf16 vía `device_map="auto"`) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso con 48 capas, normalización RMSNorm, activación SwiGLU en el MLP, embeddings rotatorios (RoPE) y atención con query grouping (GQA). El modelo base fue preentrenado por Alibaba Qwen sobre 18 billones de tokens y posteriormente afinado con instrucciones y preferencias (RLHF/DPO), aunque la model card de esta exportación no detalla la composición exacta del dataset ni las etapas de alineación.

La innovación técnica de esta ficha reside en la cuantización. Las matrices BFP4 se obtuvieron con GPTQ y una búsqueda de exponente por bloque, calibradas sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; las matrices BFP8 se cuantizaron con redondeo al más cercano. Los tensores cuantizados se almacenan como valores bf16 en la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin modificar su valor, y el script `pack_tensix.py` verifica matriz a matriz que el empaquetado es exacto. La verificación se realizó con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent; tt-transformers y tt-forge no se probaron con este checkpoint.

## Capacidades
- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones heredados del ajuste de Qwen2.5-14B-Instruct.
- Generación de código y matemáticas (capacidades del modelo base, no re-evaluadas en esta exportación).
- Soporte de tool calling y function calling del modelo base (no verificado en esta exportación).
- Capacidades multilingües del modelo base (más de 29 idiomas), aunque la model card solo declara inglés.
- Ejecución en NPU Tensix mediante TT-NN, con empaquetado exacto de los pesos cuantizados.
- Carga estándar en transformers en bf16 para inspección o inferencia en GPU.

## Casos de uso
- Inferencia en NPU Tenstorrent: despliegue del modelo en Wormhole o Blackhole con TT-NN, aprovechando los 13,76 GB de pesos empaquetados para servir generación de texto en hardware no GPU.
- Validación de pipelines de cuantización: uso de `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado BFP4/BFP8 reproduce exactamente los valores almacenados antes de desplegar en producción.
- Servicio conversacional de contexto medio: con 32.768 tokens nativos, adecuado para asistentes multi-turno con historiales largos y documentos adjuntos de tamaño moderado.
- Generación de código en entornos con hardware Tenstorrent: integración en pipelines internos donde la GPU no está disponible pero sí una NPU Tensix.
- Evaluación comparativa de formatos de cuantización: referencia para medir KL y top-1 frente a BF16 y Q4_K_M en cargas de trabajo en inglés y coreano.
- Prototipado en simulador: uso de `ttsim` para validar el grafo antes de disponer de hardware físico Blackhole.
- Investigación en compresión de modelos: punto de partida para estudiar el impacto de BFP4 con GPTQ en capas MLP frente a BFP8 en atención.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-14B-Instruct) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4 GateUp) | 7,45 | 13,756 | 0,10044 | 90,45 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp v0.9.0) | 4,87 | 8,988 | 0,0923 | 90,34 | 31 de 33 | 1 |

Las métricas de KL y top-1 cubren 16.104 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. El autor declara que estos números miden cercanía a BF16, no calidad de tarea, y no se reporta velocidad. El modelo cumple el criterio fijado por el autor: KL medio de 1,09 veces el de Q4_K_M y cero respuestas perdidas frente a una del Q4_K_M.

## Requisitos de hardware
- Memoria de dispositivo: 13,76 GB solo para los pesos del LM, más espacio para KV cache y buffers; el repositorio completo ocupa 29,5 GB en disco.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Simulación: ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole) para validación sin hardware físico.
- GPU consumer: no es el objetivo del checkpoint; la carga en transformers en bf16 requiere aproximadamente 29,5 GB de VRAM, lo que exige una RTX 4090 (24 GB) en cuantización adicional o una A100/H100 de 40/80 GB para bf16 completo.
- GPU recomendadas para la variante bf16: A100 40 GB, H100 80 GB; en consumer, no cabe en bf16 en una RTX 4090 sin cuantizar de nuevo.
- Opciones de despliegue: TT-NN sobre Tensix; transformers con `device_map="auto"` para inspección; no se ha verificado vLLM, llama.cpp, Ollama ni TGI con este checkpoint.
- Latencia y throughput: no disponibles; el autor no reporta velocidades.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Hardware |
|---|---:|---:|---:|---:|---|---|
| Este modelo (BFP4 GateUp) | 14,77B | 32.768 | 7,45 | 13,76 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| Qwen2.5-14B-Instruct (BF16) | 14,77B | 32.768 | 16 | 29,54 GB | Apache 2.0 | GPU, CPU |
| Q4_K_M de llama.cpp | 14,77B | 32.768 | 4,87 | 8,988 GB | Apache 2.0 | CPU, GPU consumer |
| Qwen2.5-7B-Instruct | 7,62B | 32.768 | 16 | ~15 GB | Apache 2.0 | GPU, CPU |

La comparativa relevante es frente al BF16 y al Q4_K_M del mismo modelo base: esta exportación ocupa un 47 % del tamaño del BF16 y un 53 % más que el Q4_K_M, con un KL ligeramente superior al Q4_K_M (0,10044 frente a 0,0923) pero sin respuestas perdidas en el conjunto de 33 prompts. Frente a un modelo de menor tamaño como Qwen2.5-7B-Instruct, la comparación no es directa porque la cuantización no reduce el número de parámetros, solo la precisión de almacenamiento.

## Limitaciones y advertencias
- La model card solo declara inglés; el soporte multilingüe del modelo base no está verificado en esta exportación.
- Los benchmarks publicados miden divergencia respecto a BF16, no calidad de tarea; no hay evaluaciones de MMLU, HumanEval o GSM8K para este checkpoint.
- No se reportan latencia ni throughput, por lo que no hay datos de rendimiento en producción.
- tt-transformers y tt-forge no se probaron con este checkpoint; solo TT-NN con ttnn 0.81.1 sobre simulador.
- La verificación se realizó en `ttsim`, no en hardware Blackhole físico; el comportamiento en silicio real no está documentado.
- El checkpoint está pensado para Tensix; en GPU requiere cargar en bf16 (~29,5 GB de VRAM) o recuantizar.
- Riesgo de alucinación inherente al modelo base Qwen2.5-14B-Instruct, no mitigado por la cuantización.
- Sesgos del dataset de entrenamiento del modelo base, no evaluados en esta exportación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en hardware Tensix.
- El repositorio tiene 21 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-GateUp/blob/main/LICENSE
