# Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix

## Resumen

Spark-X2.6-4B-Base-Tenstorrent-Tensix es una versión cuantizada del modelo base XHToken/Spark-X2.6-4B-Base, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva los pesos del transformer original de 4B parámetros, pero los remapea a los formatos de coma flotante por bloques nativos del hardware Tensix: `bfloat4_b` (BFP4) y `bfloat8_b` (BFP8), con el resto de tensores en bf16. El objetivo es permitir la inferencia eficiente del modelo en aceleradores Tenstorrent sin depender de GPU convencionales.

El repositorio agrupa dos variantes de cuantización en carpetas separadas (`bfp4/` y `bfp8/`), cada una con su propia configuración de cuantización (`quant4.json`), scripts de empaquetado (`pack_tensix.py`) y verificación (`verify_grid.py`). La variante BFP4 ocupa 2,798 GB empaquetada y la BFP8 4,685 GB, frente a los 8,22 GB del modelo en BF16. Según la model card, la BFP4 mantiene una divergencia media de KL de 0,03158 respecto a BF16 (por debajo del Q4_K_M de llama.cpp, 0,02702), mientras que la BFP8 baja a 0,00029.

El modelo base pertenece a la familia Spark-X2.6, orientada a agentes en dispositivo ("on-device agents"), con soporte de inglés y chino y licencia Apache 2.0. Esta versión es relevante porque demuestra un flujo de cuantización de precisión mixta (block floating point) sobre hardware no-GPU, un nicho emergente para despliegues de borde y entornos con NPU Tenstorrent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Spark-X2.6; código `modeling_spark.py` con atención causal y sliding window) |
| Parametros totales | 4B (según el nombre del modelo base; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP y atención; BFP8 (`bfloat8_b`) en MLP y atención; resto en bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos de cuantización en `quant4.json` e índice `model.safetensors.index.json`); diseñado para `ttnn`/Tensix |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con atención causal y atención de ventana deslizante (el código incluye `create_causal_mask` y `create_sliding_window_causal_mask`). El repositorio no publica detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la model card solo cita el paper "Spark-X2.6-4B&1.7B: Advancing the Frontier of On-Device Agents for Real-World Tasks" del SparkLLM Team (2026). El nombre sugiere una variante con 1,7B parámetros activos, pero la información proporcionada no confirma que sea MoE.

La innovación técnica de esta ficha es la cuantización a coma flotante por bloques (block floating point) para Tensix: las matrices de MLP y atención se almacenan en la rejilla BFP4 o BFP8 del dispositivo, mientras el resto de tensores permanece en bf16. El repositorio incluye un script de empaquetado (`pack_tensix.py`) y otro de verificación (`verify_grid.py`) que comprueban el round-trip de los valores empaquetados. Una excepción documentada: las 36 matrices fusionadas `q_k_v_proj` se guardan en el orden de filas del modelo base, pero solo caen en la rejilla BFP4 en el orden de filas del dispositivo.

## Capacidades

- Generación de texto autoregresiva (modelo base preentrenado; continúa texto, no está afinado para instrucciones).
- Razonamiento y código heredados del modelo base Spark-X2.6-4B-Base (no se detallan capacidades específicas en la model card).
- Multilingüe limitado a inglés y chino.
- Inferencia en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`.
- Compatibilidad con `transformers` (4.57.1) mediante `trust_remote_code=True`; en 5.x requiere dos parches documentados.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado para ejecutarse en NPU Wormhole y Blackhole con `ttnn`, lo que permite inferencia de un transformer de 4B en hardware no-GPU con 2,8 GB (BFP4) o 4,7 GB (BFP8) de pesos.
- Prototipado de cuantización BFP: los scripts `pack_tensix.py` y `verify_grid.py` sirven para validar el pipeline de empaquetado y round-trip de pesos en la rejilla BFP del dispositivo antes de desplegar en producción.
- Investigación en compresión de modelos: la comparación de KL media frente a BF16 (0,03158 en BFP4, 0,00029 en BFP8) y frente a Q4_K_M (0,02702) permite evaluar el compromiso precisión/tamaño de la cuantización por bloques.
- Generación de texto en inglés y chino: el modelo base continúa texto en ambos idiomas, útil para tareas de completado y generación en pipelines de NLP.
- Evaluación de hardware de borde: al caber en 2,8 GB en BFP4, es candidato para entornos con memoria limitada y NPU Tenstorrent, como estaciones de trabajo o dispositivos integrados.
- Base para fine-tuning posterior: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para ajuste supervisado en tareas específicas antes de recuantizar a BFP4/BFP8.

## Benchmarks y rendimiento

| Metrica | BFP4 | BFP8 | BF16 (base) | Q4_K_M (llama.cpp) |
|---|---|---|---|---|
| Tamano empaquetado (GB) | 2,798 | 4,685 | 8,22 | 2,600 |
| KL media vs BF16 | 0,03158 | 0,00029 | 0 | 0,02702 |
| Respuestas correctas (28 prompts) | 25/28 | 23/28 | 25/28 | 24/28 |

La KL se calcula sobre 8.188 posiciones de texto en inglés y coreano, con un límite de KL media de 1,5 veces la referencia Q4_K_M. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 2,798 GB empaquetados en BFP4 y 4,685 GB en BFP8 (pesos); el modelo BF16 de referencia ocupa 8,22 GB.
- GPU/NPU recomendadas: NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`; también puede cargarse en GPU convencional con `transformers` (device_map="auto") usando los pesos cuantizados.
- ¿Cabe en GPU de consumo? No se especifica en la información disponible; el tamaño BFP4 (2,8 GB) es compatible con GPUs de consumo de 8 GB o más si se carga vía `transformers`.
- Opciones de despliegue: `ttnn` (Tensix), `transformers` 4.57.1 con `trust_remote_code=True`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Base-Tenstorrent-Tensix (BFP4/BFP8) | 4B | no disponible | BFP4, BFP8, bf16 | Apache 2.0 | Tenstorrent Tensix |
| XHToken/Spark-X2.6-4B-Base (BF16) | 4B | no disponible | bf16 | Apache 2.0 | GPU/CPU |
| Q4_K_M (llama.cpp, referencia de la model card) | 4B | no disponible | Q4_K_M | Apache 2.0 (base) | CPU/GPU |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base preentrenado: continúa texto y no está alineado para instrucciones ni conversación, aunque conserva la plantilla de chat del repositorio base.
- Idiomas limitados a inglés y chino; el cálculo de KL incluye coreano, pero no se declara soporte oficial de ese idioma.
- Riesgo de alucinación y sesgos heredados del modelo base; no se documentan evaluaciones de sesgo en la model card.
- La cuantización BFP4 introduce una divergencia media de KL de 0,03158 frente a BF16, superior a la de Q4_K_M (0,02702), y reduce las respuestas correctas de 25/28 a 25/28 (igual en este caso) frente a 24/28 de Q4_K_M; la BFP8 baja a 23/28 pese a su menor KL, lo que sugiere que la métrica de respuestas no es monótona con la KL.
- Las 36 matrices fusionadas `q_k_v_proj` solo caen en la rejilla BFP4 en el orden de filas del dispositivo, lo que exige cuidado al empaquetar y verificar.
- Requiere `trust_remote_code=True` y revisar `configuration_spark.py` y `modeling_spark.py` antes de ejecutar; en transformers 5.x necesita dos parches manuales.
- No se documenta soporte de tool calling, agentes, visión ni audio; no asumir estas capacidades en producción.
- Licencia Apache 2.0 permite uso comercial, pero las modificaciones deben reflejarse en el fichero `NOTICE`.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix/blob/main/LICENSE
