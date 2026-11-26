# ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-cashback

## Resumen

`gemma-3-270m-it-phi-lattice-v2-cashback` es un archivo de cuantización de doble flujo construido por el usuario de Hugging Face `ununununununununununununununununununun` sobre el modelo `unsloth/gemma-3-270m-it`, una variante ajustada por instrucciones del Gemma 3 de 270 millones de parámetros de Google. No es un modelo nuevo entrenado desde cero, sino un formato de pesos que combina una cuantización 4-bit (denominada `phi-lattice v2`) con un segundo flujo de 4 bits que almacena el residuo exacto `R = W_bf16 - W_v2` de cada una de las 126 capas cuantizadas. El objetivo es reconstruir los pesos originales en BF16 con una fidelidad muy superior a la de un snap 4-bit convencional.

La propuesta técnica es relevante porque ataca un problema clásico de la cuantización: la pérdida de calidad al reducir precisión. Según la model card, el flujo base 4-bit por sí solo alcanza 19,48 dB de SQNR respecto a BF16 y multiplica la perplejidad (de 90,82 a 161,27 en su protocolo de evaluación), mientras que el archivo completo con el flujo de residuo llega a 39,17 dB de SQNR y una perplejidad de 90,59, prácticamente idéntica a la del modelo original. El coste es un tamaño efectivo de unos 8,5 bits por peso, aproximadamente la mitad que BF16.

Conviene subrayar que el modelo subyacente es muy pequeño (268.098.176 parámetros reales según los safetensors, 270M nominales). La propia model card advierte que a esa escala el modelo es débil en tareas de conocimiento y razonamiento (MMLU cercano al azar, GSM8K en el suelo de ruido) y que el mecanismo de cashback elimina el daño de la cuantización, pero no convierte un modelo de 270M en uno grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit de doble flujo (`phi-lattice v2` + residuo `cashback`), ~8,5 bpw efectivos; el loader soporta modo `low_vram_4bit` y `unrolled_bf16` |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 1,0 GB) y archivo empaquetado `gemma3_270m_phi_v2_cashback_packed_4bit.pt` (421,9 MiB, sha256 `a91fb6b5…`); tambien se publica GGUF del modelo base para comparacion |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Gemma 3, en su variante de texto (`gemma3_text`), ajustado por instrucciones. El autor del archivo no entrena ni afina el modelo: parte de `unsloth/gemma-3-270m-it` y aplica un proceso de cuantizacion sin datos (`data-free`), ejecutado en CPU/Mac, sin calibracion ni GPU. El flujo base es la cuantizacion `phi-lattice v2`, ya publicada en un repositorio previo y reutilizada byte a byte; sobre ella se anade un segundo flujo 4-bit por capa que codifica el residuo exacto entre los pesos BF16 y los pesos reconstruidos por v2.

La innovacion destacable es ese flujo de residuo o `cashback`: en lugar de aumentar los bits por peso de una sola representacion, se mantienen dos representaciones 4-bit cuya suma reconstruye los pesos originales con 39,17 dB de SQNR. El autor indica que el mismo esquema se verifico sobre embeddings de Qwen3-4B (39,28 dB) y de embeddinggemma-2 (39,21 dB). No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO, porque el proceso es exclusivamente de compresion de pesos.

## Capacidades

- Generacion de texto conversacional: el modelo base es una variante ajustada por instrucciones, orientada a dialogo y respuesta a prompts.
- Razonamiento basico y conocimiento general: limitado por el tamano; la model card situa MMLU en torno al 25 % (cercano al azar en su protocolo).
- Matematicas y aritmetica simple: GSM8K estricto en torno al 2 %, practicamente ruido.
- Seguimiento de instrucciones: IFEval prompt-level strict en torno al 23 %.
- Comprension lectora y sentido comun: HellaSwag acc_norm en torno al 39 %.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: el archivo sirve como referencia reproducible para medir SQNR, perplejidad y tareas de lm-eval frente a BF16, Q4_K_M y Q8_0, gracias a los scripts y resultados incluidos en el repositorio.
- Prototipado en entornos con poca VRAM: el modo `low_vram_4bit` mantiene ambos flujos empaquetados y permite cargar el modelo en GPU modesta, Mac (MPS) o CPU, util para pruebas de pipeline sin infraestructura dedicada.
- Docencia y divulgacion sobre cuantizacion: el contraste entre flujo base (19,48 dB) y flujo con cashback (39,17 dB) es un ejemplo didactico de como el residuo recupera fidelidad a coste de bits por peso.
- Pruebas de integracion de `transformers`: al ser compatible con `AutoTokenizer` y un loader explicito, sirve para validar flujos de carga personalizados en CI.
- Generacion de texto de baja exigencia en local: respuestas cortas y conversacionales donde la calidad de un modelo de 270M es suficiente y se prioriza el tamano reducido.
- Comparacion de metodos de compresion: el autor documenta la misma tecnica aplicada a Qwen3-4B y embeddinggemma-2, lo que permite replicar el experimento en otros modelos como caso de estudio.

## Benchmarks y rendimiento

Datos publicados en la model card (perplejidad sobre 6 textos en FP32; columnas de porcentaje son exactitud):

| Checkpoint | SQNR vs BF16 | PPL (6-text, FP32) | HellaSwag acc_norm | MMLU acc | GSM8K strict | IFEval prompt_strict |
|---|---:|---:|---:|---:|---:|---:|
| BF16 `unsloth/gemma-3-270m-it` | — | 90,82 | 39,29 % | 25,08 % | 2,43 % | 24,21 % |
| `phi-lattice v2` (solo flujo base) | 19,48 dB | 161,27 | 37,93 % | 25,94 % | 0,61 % | 17,74 % |
| `Q4_K_M` (llama.cpp, ~4,5 bpw) | 26,80 dB | 99,30 | 39,12 % | 24,88 % | 1,36 % | 17,56 % |
| `Q8_0` (llama.cpp, 8,7 bpw) | 44,89 dB | 91,43 | 39,26 % | 25,11 % | 3,03 % | 23,48 % |
| `v2 + cashback` (este repo, ~8,5 bpw) | 39,17 dB | 90,59 | 39,31 % | 24,93 % | 2,20 % | 23,11 % |

Notas del autor: Q8_0 es el baseline comparable en tamano (8,7 bpw), no Q4_K_M; Q8_0 supera a cashback en SQNR (44,89 dB frente a 39,17 dB) y cashback supera ligeramente a Q8_0 en perplejidad (90,59 frente a 91,43). Las evaluaciones lm-eval se ejecutaron en MPS y L4 segun el caso; GSM8K e IFEval de Q8_0 provienen de una ejecucion en CPU float32.

## Requisitos de hardware

- VRAM estimada: con ~8,5 bpw efectivos y 268M parametros, el archivo empaquetado ocupa 421,9 MiB; en modo `unrolled_bf16` se aproxima al tamano BF16 (~0,5 GB de pesos) mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM para el modo 4-bit empaquetado; el autor cita ejecuciones en L4 y MPS.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, 4060, 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con el `phi_loader.py` incluido; el autor publica tambien GGUF del modelo base para llama.cpp (Q4_K_M y Q8_0) como baseline, no para el archivo cashback.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SQNR / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `v2 + cashback` (este repo) | 268M | no disponible | 39,17 dB; PPL 90,59 | Apache 2.0 | Hugging Face |
| `phi-lattice v2` (solo flujo base) | 268M | no disponible | 19,48 dB; PPL 161,27 | Apache 2.0 | Hugging Face |
| `Q4_K_M` (llama.cpp) | 268M | no disponible | 26,80 dB; PPL 99,30 | Apache 2.0 (modelo base) | GGUF |
| `Q8_0` (llama.cpp) | 268M | no disponible | 44,89 dB; PPL 91,43 | Apache 2.0 (modelo base) | GGUF |
| BF16 `unsloth/gemma-3-270m-it` | 268M | no disponible | referencia; PPL 90,82 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo subyacente de 270M es debil: MMLU cercano al azar, GSM8K en el suelo de ruido y HellaSwag en torno al 39 %; no es apto para tareas que exijan conocimiento o razonamiento fiables.
- El cashback reduce el dano de cuantizacion, no mejora las capacidades del modelo base; la propia model card lo advierte de forma explicita.
- La cuantizacion Q8_0 de llama.cpp obtiene mejor SQNR (44,89 dB) que este archivo (39,17 dB), aunque peor perplejidad en el protocolo del autor; la eleccion depende de la metrica priorizada.
- Riesgo de alucinacion elevado por el tamano reducido del modelo y su naturaleza conversacional.
- Sesgos conocidos: no documentados en la informacion proporcionada; heredables del modelo base Gemma 3.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base `unsloth/gemma-3-270m-it` y de Gemma 3 de Google.
- El autor del repositorio es un usuario no verificado (`ununununununununununununununununununun`); el loader es codigo Python externo que debe auditarse antes de usarlo en produccion.
- No se documentan resultados de throughput ni latencia, por lo que no puede garantizarse un rendimiento concreto en despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-cashback
- Repositorio del flujo base v2: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.
