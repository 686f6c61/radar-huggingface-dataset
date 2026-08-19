# Ttimms/zaya1-8b-nvfp4-w4a4

## Resumen

ZAYA1-8B NVFP4 W4A4 es un checkpoint cuantizado del modelo MoE Zyphra/ZAYA1-8B-legacy, desarrollado por Ttimms para permitir inferencia eficiente en GPUs Blackwell de consumo (SM120, como la RTX 5070 Ti). La peculiaridad frente a otras cuantizaciones oficiales es que cuantiza tanto pesos como activaciones a 4 bits (W4A4), usando kernels nativos CUTLASS FP4 tensor-core, lo que reduce el checkpoint a 9,46 GB y permite servirlo dentro de un presupuesto de 16 GB de VRAM. El modelo mantiene una licencia Apache 2.0 y está orientado a generación de texto conversacional.

La relevancia actual del checkpoint radica en que demuestra que la cuantización de activaciones en 4 bits es viable en hardware Blackwell consumer, algo que las versiones oficiales de Zyphra (MXFP4 solo pesos) o Google (Gemma 4 qat-w4a16) no ofrecen. Sin embargo, el autor documenta un problema conocido: la captura de CUDA graphs corrompe la salida en esta tarjeta, por lo que solo es fiable con `enforce_eager=True`. También existe una variante `-uniform` de 6,02 GB sin exenciones BF16, que sacrifica algo de precisión a cambio de más margen de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), 80 capas, basado en Zyphra/ZAYA1-8B-legacy |
| Parametros totales | 8.840.488.784 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (4-bit pesos y activaciones), con 384 linears exentos en BF16 en este checkpoint |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Zyphra/ZAYA1-8B-legacy, un transformer MoE de 80 capas y aproximadamente 8,8 mil millones de parametros totales. Este checkpoint no introduce cambios en la arquitectura original: se limita a cuantizar los pesos y las activaciones a 4 bits en formato NVFP4, aplicando la cuantizacion a 936 de los 1.320 linears del modelo, mientras que los 384 restantes se mantienen en BF16 para preservar la precision. La cuantizacion se realizo con la libreria compressed-tensors y esta optimizada para los kernels FP4 de CUTLASS en GPUs Blackwell (SM120). No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, dataset, metodo de alineacion como RLHF o DPO) mas alla de que es un modelo conversacional de Zyphra.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base ZAYA1-8B.
- Inferencia con cuantizacion W4A4 nativa en FP4, lo que reduce el uso de memoria y ancho de banda respecto a pesos en BF16.
- Soporte de batching eficiente: el escalado de batch-8 alcanza el 96-98% del ideal teorico, indicando que el coste por paso en decodificacion MoE no crece significativamente con el tamano de lote.
- Compatible con vLLM para servir el modelo en produccion, con `enforce_eager=True` como unica configuracion fiable.
- Capacidad de usar KV-cache en FP8 para reducir aun mas el consumo de memoria.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Inferencia local en GPUs Blackwell de consumo: el checkpoint permite ejecutar un modelo MoE de 8B con cuantizacion W4A4 en una RTX 5070 Ti de 16 GB, algo inviable con los pesos originales en BF16. Es adecuado para desarrolladores que quieran experimentar con FP4 en hardware consumer.
- Servicio de chat con vLLM: puede desplegarse como endpoint de generacion de texto usando el servidor de vLLM, con un throughput de ~74 tok/s en batch-8 y ~9,5 tok/s en single-stream, suficiente para aplicaciones de baja concurrencia.
- Evaluacion de tecnicas de cuantizacion: al ser un checkpoint de control publicado, sirve como referencia para comparar el impacto de exenciones BF16 frente a la version `-uniform` en tareas como HellaSwag.
- Prototipado de aplicaciones conversacionales con presupuesto de memoria ajustado: los 9,46 GB del checkpoint dejan margen para ejecutar el modelo junto a otros procesos en una GPU de 16 GB, aunque con un rango de utilizacion de memoria estrecho.
- Investigacion sobre correctitud en servidores LLM: el problema documentado con CUDA graphs convierte este modelo en un caso de estudio para validar la integridad numerica de diferentes backends de inferencia.
- Benchmarking de kernels FP4 en Blackwell: los datos de throughput publicados permiten comparar el rendimiento de CUTLASS FP4 frente a otras implementaciones como llama.cpp, aunque esta ultima via no ha podido reproducirse en el hardware del autor.

## Benchmarks y rendimiento

La unica metrica publicada es HellaSwag, medida sobre el conjunto de validacion (n=10.042). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

| Metrica | Este checkpoint (9,46 GB mixto) | Version `-uniform` (6,02 GB) |
|---|---:|---:|
| HellaSwag acc | 46,49% | 45,79% |
| HellaSwag acc_norm | 61,34% | 60,65% |

La diferencia de 0,71 puntos porcentuales en `acc` tiene un intervalo de confianza del 95% de [-1,26, -0,15] segun una prueba exacta binomial de McNemar sobre 14.319 items. El autor retracta explicitamente las cifras de 102,6/407,4 tok/s medidas con CUDA graphs, por producir salida corrupta.

## Requisitos de hardware

- VRAM estimada: el checkpoint de 9,46 GB requiere al menos 16 GB de VRAM, con `--gpu-memory-utilization 0.92` en vLLM. A 0.85 falla con `ValueError: No available memory for the cache blocks`.
- GPU recomendada: RTX 5070 Ti (SM120, Blackwell consumer) u otras GPUs Blackwell con soporte FP4 nativo. No se garantiza funcionamiento en arquitecturas anteriores (Ampere, Ada).
- En GPU consumer: si, en tarjetas Blackwell de 16 GB, aunque con margen de memoria reducido. La version `-uniform` de 6,02 GB es mas comoda en ese escenario.
- Opciones de despliegue: vLLM con `enforce_eager=True` (obligatorio). Se menciona un intento con llama.cpp (PR #23112) que no pudo reproducirse por un cuelgue no determinista, aparentemente relacionado con WSL2/drivers.
- Latencia y throughput medidos (vLLM, `enforce_eager=True`, kv-cache FP8, max-model-len 4096, input 128, output 256): 9,51 tok/s single-stream y 74,4 tok/s batch-8, con escalado de 7,82x respecto a batch-1.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos cuantizados W4A4 comparables en la informacion proporcionada. La unica comparacion directa posible es con la version `-uniform` del mismo autor:

| Modelo | Tamano | Cuantizacion | HellaSwag acc_norm | VRAM requerida |
|---|---|---|---:|---:|
| zaya1-8b-nvfp4-w4a4 (este) | 9,46 GB | NVFP4 W4A4 con 384 linears BF16 | 61,34% | ~16 GB (util 0.92) |
| zaya1-8b-nvfp4-w4a4-uniform | 6,02 GB | NVFP4 W4A4 sin exenciones | 60,65% | ~16 GB (util 0.85) |
| Zyphra/ZAYA1-8B-legacy (base) | no disponible | BF16 | no disponible | no disponible |

## Limitaciones y advertencias

- Problema critico con CUDA graphs: la captura de grafos CUDA produce salida numericamente incorrecta en SM120, independientemente del backend MoE (flashinfer_cutlass, cutlass o marlin). Solo `enforce_eager=True` genera salida coherente. Esto limita el rendimiento maximo alcanzable y descarta una via habitual de optimizacion en produccion.
- Rango de memoria estrecho: el checkpoint no puede ejecutarse con `--gpu-memory-utilization` inferior a 0.92 en una GPU de 16 GB, y a 1.0 falla si hay otros procesos usando VRAM (por ejemplo, una sesion de escritorio).
- Sin datos de sesgos ni alucinacion: no se ha publicado ninguna evaluacion de sesgos, toxicidad o fiabilidad factual. Al ser un modelo cuantizado, es esperable cierta degradacion respecto al original, pero no hay mediciones.
- Rendimiento limitado en single-stream: ~9,5 tok/s es bajo para aplicaciones interactivas en tiempo real; el modelo esta pensado para batching.
- Dependencia de hardware especifico: requiere GPUs Blackwell con soporte FP4 nativo; no funcionara en arquitecturas anteriores.
- Datos de entrenamiento desconocidos: no se informa sobre la composicion del dataset ni el metodo de alineacion del modelo base, lo que dificulta evaluar riesgos de sesgo o idiomas cubiertos.
- Manifest con metadatos incorrectos: `quantization_manifest.json` registra `Zyphra/ZAYA1-8B` como modelo base, cuando el real es `Zyphra/ZAYA1-8B-legacy`. El autor lo deja asi por ser un control de evaluacion publicado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ttimms/zaya1-8b-nvfp4-w4a4
- Version uniform (companion): https://huggingface.co/Ttimms/zaya1-8b-nvfp4-w4a4-uniform
- Repositorio GitHub (documentacion e investigacion): https://github.com/t-timms/zaya1-godspeed
- Articulo arXiv sobre deriva de correctitud en servidores LLM: https://arxiv.org/abs/2605.19537
- Issue CUTLASS #3096: https://github.com/NVIDIA/cutlass/issues/3096
- Issue FlashInfer #2776: https://github.com/flashinfer-ai/flashinfer/issues/2776
- Modelo base: https://huggingface.co/Zyphra/ZAYA1-8B-legacy
