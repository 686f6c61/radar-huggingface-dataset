# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-P3 es una cuantización experimental de Qwen/Qwen3.8-Flash-Next publicada por el usuario txgsync. Se trata de un modelo MoE multimodal (image-text-to-text) en el que los expertos enrutados (routed experts) se han sustituido por semillas SeedLM: cada bloque de 8 pesos de experto se codifica como una semilla LFSR de 16 bits, 3 coeficientes int4 y un código de exponente de 4 bits, de modo que la GPU reconstruye los pesos dentro de la propia multiplicación de matrices. El resto de pesos (atención, DeltaNet, expertos compartidos, routers, tabla PLE, embeddings, LM head, visión y cabeza MTP) se heredan sin cambios del modelo mlx-community/Qwen3.8-Flash-Next-4bit-mtp en cuantización afín de 4 bits con group size 32.

El objetivo es reducir el espacio ocupado por los expertos enrutados de 120.800 millones de pesos: se pasa de 5,0 bits por peso (afín 4-bit, grupo 32) a 4,0 bits por peso (SeedLM P=3), lo que rebaja el tamaño del repositorio de 113,3 GB a 98,2 GB. El modelo declara 89.403.088.787 parámetros totales en safetensors y está pensado para ejecutarse en Apple Silicon mediante mlx-vlm (0.7.12 o superior, con `--trust-remote-code`) o en GPUs NVIDIA Ampere o posteriores mediante el motor CUDA propio NanoSeedLM (`nslm-qwen4-gen`).

Se trata de una vista previa de investigación, no de un modelo para producción: el propio autor recomienda usar una cuantización establecida de Qwen3.8-Flash-Next para trabajo normal. La calidad se ha medido únicamente frente al modelo MLX de 4 bits (no frente a BF16), sobre 1.024 tokens de wikitext-2, y el autor advierte de que la salida no es idéntica a la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con atención, DeltaNet, expertos compartidos, routers, tabla PLE y cabeza MTP; expertos enrutados codificados como semillas SeedLM |
| Parametros totales | 89.403.088.787 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: SeedLM P=3 (4,0 bits por peso; semilla LFSR de 16 bits + 3 coeficientes int4 + exponente de 4 bits por bloque de 8 pesos). Resto de pesos: afín 4-bit group size 32, routers 8-bit group 64 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (MLX), con ficheros auxiliares `NAME.seeds`, `NAME.nibbles` y `NAME.exp_bias` para los expertos enrutados; requiere código remoto (`nanoseedlm_qwen4.py`, `nanoseedlm_seeds.py`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal con 48 capas y 512 expertos enrutados por capa, además de mecanismos de atención, DeltaNet, expertos compartidos, routers y una tabla PLE (probablemente de embeddings posicionales o de lookup extendida). La cabeza MTP (multi-token prediction) se conserva del modelo MLX de referencia. Esta variante no reentrena el modelo: sustituye la representación de los pesos de los expertos enrutados por una codificación generativa basada en semillas.

La construcción de las semillas consistió en una búsqueda exhaustiva de las 65.535 semillas posibles para cada bloque de 8 pesos, ponderando el error de cada peso por la media cuadrática de su activación de entrada, calculada a partir de la imatrix de Unsloth (`imatrix_unsloth.gguf_file`, 45 fragmentos de 18.432 tokens). El resultado es un esquema de compresión con decodificación en el propio kernel de multiplicación de matrices, sin entrenamiento adicional ni destilación. El error relativo de los pesos de los expertos enrutados, promediado sobre las 48 capas, es de 0,1261 en `gate_proj`, 0,1260 en `up_proj` y 0,1272 en `down_proj`; ponderado por activación, 0,1122, 0,1125 y 0,1106 respectivamente.

## Capacidades

- Generación de texto y conversación multiturno, heredadas del modelo base Qwen3.8-Flash-Next.
- Entrada de imagen y texto (pipeline image-text-to-text), aunque el autor indica que no se ha probado la entrada de imagen ni de vídeo en esta variante.
- Razonamiento, código y matemáticas: capacidades del modelo base, no documentadas de forma específica en la información disponible.
- Tool calling y function calling: no documentado en la información disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles.
- Cabeza MTP (multi-token prediction) conservada del modelo MLX de referencia, que puede habilitar decodificación especulativa.
- Modo thinking: no documentado en la información disponible.

## Casos de uso

- Investigación sobre compresión de pesos en MoE: el modelo sirve como banco de pruebas para evaluar la codificación SeedLM frente a cuantización afín, midiendo divergencia KL, perplejidad y acuerdo top-1 sobre textos de referencia.
- Experimentación en Apple Silicon: con mlx-vlm 0.7.12 o superior y `--trust-remote-code`, permite ejecutar un MoE multimodal de gran tamaño en Macs con memoria unificada, manteniendo la tabla PLE en SSD en equipos de 128 GB.
- Pruebas de decodificación en GPUs de consumo: el motor NanoSeedLM CUDA permite mantener los expertos en memoria host con caché en VRAM (`--expert-cache-gb`) o hacer streaming desde disco (`--stream-experts`), lo que posibilita probar el modelo en una RTX 4080 de 16 GB reservando unos 8 GB para expertos.
- Evaluación de latencia de decodificación por semillas: útil para comparar el coste de decodificar semillas frente a decodificar pesos afines del mismo tamaño (el autor reporta entre un 14 % y un 21 % más de lentitud en un modelo previo, K2-Horizon-MoVA).
- Estudio de la relación entre error de pesos y divergencia KL: los datos publicados muestran que el error de pesos no predice bien la KL, lo que convierte al modelo en un caso de estudio para metodologías de cuantización.
- Prototipado de asistentes multimodales en local: para flujos de conversación image-text-to-text en entornos de investigación con Apple Silicon, aceptando que la salida no es idéntica a la del modelo original.

## Benchmarks y rendimiento

Calidad medida frente a mlx-community/Qwen3.8-Flash-Next-4bit-mtp sobre 1.024 tokens de wikitext-2, con ambos modelos en el motor NanoSeedLM CUDA:

| Modelo | KL divergencia media | KL divergencia mediana | Acuerdo top-1 | Perplejidad |
|---|---|---|---|---|
| Modelo MLX 4-bit (referencia) | 0 | 0 | 100 % | 2,396 |
| Este modelo (P = 3) | 0,237 | 0,019 | 88,2 % | 2,480 |

Error relativo de los pesos de los expertos enrutados (media sobre 48 capas):

| Proyección | Error relativo | Error relativo ponderado por activación |
|---|---|---|
| `gate_proj` | 0,1261 | 0,1122 |
| `up_proj` | 0,1260 | 0,1125 |
| `down_proj` | 0,1272 | 0,1106 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que añadirá la divergencia KL frente al modelo BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa. El repositorio ocupa 98,2 GB; en el motor CUDA los expertos enrutados permanecen en memoria host, con caché en VRAM configurable mediante `--expert-cache-gb` (el ejemplo del autor usa 8 GB en una RTX 4080 de 16 GB) o streaming desde disco con `--stream-experts`.
- GPU recomendadas: NVIDIA Ampere o posteriores para el motor NanoSeedLM CUDA; Apple Silicon con mlx-vlm 0.7.12 o superior para la ruta MLX.
- Cabe en GPU de consumo: sí, en una RTX 4080 de 16 GB según el ejemplo del autor, manteniendo la mayor parte de los expertos fuera de VRAM. En Mac de 128 GB, macOS limita por defecto la GPU a unos 96 GB, por lo que se recomienda mantener la tabla PLE en SSD.
- Opciones de despliegue: mlx-vlm (con `--trust-remote-code`), motor NanoSeedLM CUDA (`nslm-qwen4-gen`). oMLX no es compatible todavía porque elimina `model_file` de las configuraciones `qwen4_exp`. El motor Metal de NanoSeedLM aún no ejecuta este modelo.
- Latencia y throughput: no disponibles de forma numérica para este modelo. El autor señala que en Apple Silicon la decodificación por semillas es más lenta que la decodificación afín del mismo tamaño (entre un 14 % y un 21 % de diferencia en K2-Horizon-MoVA).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NanoSeedLM-P3 | 89.403.088.787 (totales) | no disponible | safetensors MLX; expertos SeedLM P=3 (4,0 bits/peso), resto afín 4-bit | qwen-community-1.0 | HuggingFace, experimental |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | pesos originales del modelo base | qwen-community-1.0 | HuggingFace |
| mlx-community/Qwen3.8-Flash-Next-4bit-mtp | no disponible | no disponible | MLX; afín 4-bit group 32, routers 8-bit, BF16; 113,3 GB | derivada del modelo base | HuggingFace |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | GGUF (usado para la imatrix) | derivada del modelo base | HuggingFace |

## Limitaciones y advertencias

- Modelo experimental: la salida no es idéntica a la del modelo original y el autor recomienda usar una cuantización establecida de Qwen3.8-Flash-Next para trabajo normal.
- La calidad solo se ha medido frente al modelo MLX de 4 bits, no frente a BF16, y sobre una única muestra de 1.024 tokens de wikitext-2, lo que constituye una muestra pequeña.
- Es obligatorio habilitar Trust Remote Code para cargar los ficheros de modelo `nanoseedlm_qwen4.py` y `nanoseedlm_seeds.py`.
- No se ha probado la entrada de imagen ni de vídeo, pese a que el pipeline declarado es image-text-to-text.
- En Apple Silicon, la decodificación por semillas es más lenta que la afín del mismo tamaño (14 % a 21 % en un modelo previo).
- Gestión de memoria en Mac: con 98,2 GB de pesos y un límite por defecto de GPU de unos 96 GB en equipos de 128 GB, es necesario mantener la tabla PLE en SSD; el autor no ha probado este flujo con este modelo concreto.
- oMLX no carga el modelo porque elimina `model_file` de las configuraciones `qwen4_exp`; además, su offload de expertos MoE lee expertos cuantizados y puede no aplicar a expertos por semillas.
- El motor Metal de NanoSeedLM no ejecuta todavía este modelo.
- Idiomas soportados no documentados; sesgos y riesgo de alucinación no documentados específicamente para esta variante.
- Licencia Qwen Community License 1.0: conviene revisar sus términos antes de cualquier uso comercial, ya que impone condiciones adicionales a las licencias permisivas habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantización MLX de referencia: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- Imatrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Guía para crear una carpeta de modelo: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/make-a-model.md
- Guía de ejecución y servicio: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/run-and-serve.md
- Mediciones de KL divergencia: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/results/2026-11-04-qwen38-kld-vs-4bit.md
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado (arXiv:2410.10714): https://arxiv.org/abs/2410.10714
