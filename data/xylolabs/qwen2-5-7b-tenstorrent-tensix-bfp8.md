# Xylolabs/Qwen2.5-7B-Tenstorrent-Tensix-BFP8

## Resumen

Qwen2.5-7B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo Qwen2.5-7B de Alibaba, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only del original, con 7.615.616.512 parámetros, pero cuantiza sus capas lineales (atención q/k/v/o y MLP gate/up/down en las 28 capas) al formato de coma flotante en bloque `ttnn.bfloat8_b` (BFP8) mediante GPTQ, de modo que el runtime TT-NN puede empaquetar los pesos sin recodificarlos.

La relevancia de esta ficha es acotada pero clara: no es un modelo nuevo ni un ajuste fino, sino un artefacto de despliegue que permite ejecutar Qwen2.5-7B en hardware Tenstorrent con un consumo de memoria de dispositivo de aproximadamente 9,11 GB solo para los pesos del modelo de lenguaje, frente a los 15,23 GB del checkpoint en BF16. Esto lo sitúa en el espacio de las alternativas de cuantización de 8 bits, con una fidelidad al modelo original notablemente alta.

El modelo base es el Qwen2.5-7B preentrenado (no instruction-tuned), por lo que su función es la continuación de texto, no el diálogo instruido. La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial. El checkpoint se distribuye en safetensors y se carga con `transformers`, aunque su destino real es el stack TT-NN de Tenstorrent.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 28 capas |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en embeddings, LM head, normas y resto de tensores. Media de 9,57 bits por peso |
| Idiomas soportados | Inglés (etiqueta declarada); calibración con WikiText-2 y Wikipedia en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15,2 GB de repositorio; 9,114 GB empaquetados para dispositivo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del checkpoint Qwen2.5-7B: un transformer decoder-only con 28 capas y atención multi-cabeza con sesgo QKV, sin mezcla de expertos. La modificación introducida por Xylolabs no afecta a la topología, sino a la representación numérica de los pesos. Las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 28 capas se cuantizan a `ttnn.bfloat8_b`, un formato de coma flotante en bloque con exponente compartido por bloque y 8,5 bits efectivos por peso. El resto de tensores (embeddings, LM head, normas) permanecen en bf16, lo que da una media de 9,57 bits por peso.

La cuantización se realizó con GPTQ sobre la rejilla bfloat8_b, preservando el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN, y se calibró con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El autor declara que las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de forma que TT-NN las empaqueta sin alterar sus valores; el repositorio incluye los scripts `pack_tensix.py` y `verify_grid.py` para comprobar que ningún valor cambia tras el empaquetado. No se documenta en la información disponible ningún proceso de RLHF, DPO ni ajuste instruccional: se trata del modelo preentrenado.

## Capacidades

- Generación de texto por continuación: el modelo es la versión preentrenada, no instruction-tuned, por lo que completa secuencias en lugar de seguir instrucciones conversacionales.
- Razonamiento y conocimiento general heredados de Qwen2.5-7B, sujetos a la fidelidad de la cuantización BFP8 (98,20 % de top-1 respecto a BF16 en la evaluación del autor).
- Capacidades multilingües del modelo base, aunque la etiqueta de idioma declarada es únicamente inglés y la calibración incluyó texto coreano.
- Plantilla de chat del modelo base conservada en el tokenizer, aunque el modelo no está entrenado para seguirla como asistente.
- Ejecución en NPU Tensix mediante TT-NN (`ttnn.bfloat8_b`), con empaquetado directo de los pesos.
- Compatibilidad con `transformers` para carga en bf16 y uso en GPU/CPU convencionales.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. El checkpoint está diseñado para cargarse en NPU Wormhole o Blackhole a través de TT-NN, con 9,11 GB de memoria de dispositivo para los pesos, lo que permite servir Qwen2.5-7B en aceleradores Tensix sin recurrir a BF16.
- Generación de texto a gran escala en inglés: al ser un modelo de continuación preentrenado, encaja en tareas de completado, redacción asistida y generación de borradores donde no se requiere seguimiento estricto de instrucciones.
- Investigación en cuantización de bloque: el artefacto sirve como referencia reproducible para estudiar el impacto de BFP8 con GPTQ frente a BF16 y frente a cuantizaciones de 4 bits como Q4_K_M, con métricas de KL y top-1 publicadas.
- Evaluación de fidelidad numérica en TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar el empaquetado de cada matriz y validar pipelines de despliegue antes de pasar a producción en silicio.
- Prototipado en simulador: el autor validó el empaquetado con `ttnn` 0.81.1 sobre `ttsim`, el simulador Blackhole de Tenstorrent, de modo que el modelo puede usarse para desarrollar y depurar flujos TT-NN sin hardware físico.
- Base para ajuste fino posterior: con licencia Apache 2.0 y pesos en safetensors, puede servir como punto de partida para tareas específicas, aunque la cuantización BFP8 está pensada para inferencia en Tensix y no para entrenamiento.
- Comparación de estrategias de cuantización en pipelines de CI: la tabla de evaluación del autor (KL medio, top-1, respuestas correctas) permite integrar comprobaciones de regresión de calidad al actualizar versiones de llama.cpp o TT-NN.

## Benchmarks y rendimiento

Los datos publicados por el autor miden la cercanía al checkpoint BF16, no la calidad en tareas:

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B) | 16 | 15,23 | 0 | 100 | 26 de 28 | - |
| Este modelo (BFP8) | 9,57 | 9,114 | 0,00133 | 98,20 | 26 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,03655 | 90,81 | 25 de 28 | 0 |

La KL y el top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato de texto plano. Las respuestas corresponden a 28 prompts cortos con comprobación automática, en forma de completado y con 3 ejemplos. El autor declara que el modelo supera su criterio de aceptación: KL 0,04 veces la de Q4_K_M y cero respuestas perdidas frente a cero. No se reportan métricas de velocidad ni de tareas estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: unos 9,11 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y búferes. El autor recomienda la versión BFP4 en dispositivos con menos memoria.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- GPU convencionales: el checkpoint puede cargarse con `transformers` en bf16 con `device_map="auto"`, lo que requiere del orden de 15 GB de memoria; no se documentan requisitos específicos de VRAM por GPU en la información disponible.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño empaquetado de 9,11 GB sugiere que podría caber en GPUs con 12 GB o más, pero no se valida en la model card.
- Opciones de despliegue: TT-NN (`ttnn` 0.81.1, probado en el simulador `ttsim`), `tt-transformers` de tt-metal v0.81.1 (solo en configuraciones de 2 o 4 chips, N300 y superiores, no probado por el autor con este checkpoint) y `tt-forge`/tt-xla (no ejecutado aún con este checkpoint).
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Tenstorrent-Tensix-BFP8 | 7,62 B | No disponible | BFP8 (9,57 bits/peso) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B (BF16) | 7,62 B | No disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Tenstorrent-Tensix-BFP4-MLP | No disponible | No disponible | BFP4 | Apache 2.0 (presumible, no confirmado) | Hugging Face |
| Qwen2.5-7B en Q4_K_M (llama.cpp) | 7,62 B | No disponible | 4,91 bits/peso | Apache 2.0 | Generado localmente |

La comparación relevante es de fidelidad y huella de memoria: BFP8 ocupa 9,114 GB con KL de 0,00133 frente a BF16, mientras que Q4_K_M ocupa 4,683 GB con KL de 0,03655. La versión BFP4 del mismo autor está pensada para dispositivos con menos memoria, pero no se dispone de sus métricas en la información proporcionada.

## Limitaciones y advertencias

- El modelo es la versión preentrenada, no instruction-tuned: no sigue instrucciones ni mantiene diálogos de asistente de forma fiable.
- La cuantización BFP8 introduce una desviación medible respecto a BF16 (KL medio de 0,00133, top-1 del 98,20 %); aunque pequeña, no es nula y puede acumularse en generaciones largas.
- La evaluación publicada mide cercanía a BF16, no calidad en tareas; no hay datos de MMLU, HumanEval, GSM8K ni de velocidad.
- El soporte de hardware está limitado a NPU Tensix (Wormhole, Blackhole); en `tt-transformers` solo se ejecuta en configuraciones de 2 o 4 chips y esa ruta no fue probada por el autor con este checkpoint.
- `tt-forge`/tt-xla no se ha ejecutado aún con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` recuantizan en el layout [out, in] de PyTorch.
- La etiqueta de idioma declarada es solo inglés, aunque la calibración incluyó coreano; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-7B, no evaluados específicamente en esta exportación.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el archivo `NOTICE` con los cambios realizados.
- El repositorio tiene un volumen de descargas muy bajo (51) y ninguna marca de "me gusta", lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Versión BFP4: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tenstorrent-BFP4-MLP
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
