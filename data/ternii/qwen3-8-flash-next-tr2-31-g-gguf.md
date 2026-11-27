# Ternii/Qwen3.8-Flash-Next-TR2.31-G-GGUF

## Resumen

Qwen3.8-Flash-Next-TR2.31-G-GGUF es una cuantización extrema del modelo Qwen3.8-Flash-Next de Qwen, un transformer de arquitectura MoE (mixture of experts) de 176.943.899.520 parámetros totales, de los cuales aproximadamente 6B se activan por token. La publicación corre a cargo de Ternii (Wai Chung) y emplea una técnica propia denominada TR Quantisation, que traduce los pesos a valores ternarios (trits) en lugar de los formatos de cuantización habituales de llama.cpp.

El interés del artefacto es que hace ejecutable un modelo de ~177B en un MacBook Air de 16 GB, con velocidades reportadas de 10,9-11,8 tokens/s a 32k de contexto y 6,8 tokens/s a 128k. Para lograrlo, los expertos enrutados se almacenan en SSD y solo un subconjunto cacheado reside en memoria, con un predictor aprendido (`trpw`) que precarga los expertos de la capa siguiente.

La relevancia es doble: por un lado demuestra que la cuantización ternaria con calibración GPTQ puede llevar modelos MoE de gran tamaño a hardware de consumo; por otro, el precio es alto en fricción operativa, ya que requiere un fork parcheado de llama.cpp (tipos de tensor `TQ9_128` y `TQ27_128` inexistentes en upstream) y no funciona con LM Studio ni Ollama estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (sparse attention con `compress_ratios` 4 en 12 capas de atención completa) |
| Parametros totales | 176.943.899.520 (176,2B pesos traducidos; el archivo excluye la cabeza MTP de 4B) |
| Parametros activos | ~6B por token |
| Longitud de contexto | Hasta 262.144 tokens (`TR_CTX`); 32k por defecto en equipos de menos de 48 GB |
| Tipos de cuantizacion | TR Quantisation: 2 trits (9 niveles) en expertos enrutados, 3 trits (27 niveles) en otras capas lineales y en la tabla n-gram, 8 bits en pesos de hiperconexión, escala de 16 bits por grupo de 128 pesos; media de 2,31 trits por peso |
| Idiomas soportados | Inglés (`language: [en]`) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (8 shards, 89,8 GB en disco) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Qwen con mezcla de expertos dispersa: 120,8B parámetros en expertos enrutados, 4,2B en el resto de capas lineales y una tabla de embeddings n-gram de 51,2B parámetros. Incorpora atención dispersa con ratios de compresión de 4 en 12 capas de atención completa, y el checkpoint original incluye una cabeza de predicción multi-token (MTP) de 4B que esta cuantización omite deliberadamente, junto con el codificador de visión.

No hay reentrenamiento: la traducción parte de los pesos BF16 de Qwen (revisión `de4b8e4d`) y aplica calibración GPTQ para fijar los códigos ternarios. La innovación técnica principal es el esquema de tres niveles: expertos a 2 trits, capas lineales y tabla n-gram a 3 trits, escalas de 16 bits por grupo de 128 pesos y pesos de hiperconexión a 8 bits. La tabla de embeddings n-gram se redondea a valores de 3 trits pero se almacena exactamente en un contenedor Q5_0. El runtime usa un predictor `trpw` de 115 MiB que anticipa la lectura de expertos desde SSD sin alterar la salida (texto byte-idéntico con y sin él), y un modo de caché de expertos en memoria cuyo tamaño se reduce a medida que crece el contexto (6.600 MiB a 32k, 5.950 a 64k, 4.750 a 128k) para mantener todas las capas en GPU.

## Capacidades

- Generación de texto conversacional multi-turno (`pipeline_tag: text-generation`).
- Razonamiento y matemáticas: los datos de calibración incluyen `EleutherAI/hendrycks_math` y `openai/gsm8k`, y se reportan evaluaciones en GSM8K.
- Generación de código: calibrado con `nvidia/OpenCodeInstruct`.
- Instrucción general y alineamiento conversacional: `OpenAssistant/oasst2`.
- Modo de razonamiento conmutable en el servidor (`--reasoning off` en el ejemplo de arranque).
- Procesamiento de prompts largos por lotes de 2.048 tokens, con contexto configurable hasta 262.144.
- Ejecución local íntegra en Apple Silicon (Metal), sin envío de datos a servicios externos.
- No incluye visión ni audio: es un modelo solo de texto, sin codificador visual ni cabeza MTP.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátil: un MacBook Air M5 de 16 GB puede servir un chat multi-turno con 32k de contexto a ~11 tokens/s, suficiente para uso interactivo individual sin conexión a la nube.
- Análisis de documentos largos en local: con contexto de 128k y lectura de prompts a 113 tokens/s, permite resumir o extraer información de contratos, informes o bases de código sin salir del equipo.
- Desarrollo asistido en máquinas sin GPU dedicada: el modelo puede generar y explicar código en un portátil de consumo, útil para entornos con requisitos de confidencialidad que impiden usar APIs externas.
- Razonamiento matemático y resolución de problemas: los resultados de GSM8K (~92-93%) lo sitúan como herramienta viable para tutoría o verificación de cálculos paso a paso en local.
- Prototipado y evaluación de cuantizaciones: sirve como banco de pruebas para investigadores que quieran medir el impacto de la cuantización ternaria frente a BF16 en tareas de razonamiento.
- Despliegue en estaciones compactas con CUDA: la build r4 para Linux arm64 con CUDA permite ejecutarlo en un DGX Spark a 33,5-36,5 tokens/s de decodificación y 826-864 tokens/s de lectura de prompts.
- Experimentación con caché de expertos en SSD: caso de interés para quien investigue serving de MoE con memoria limitada, ya que el runtime expone variables como `LLAMA_MOE_CACHE_MIB` y `LLAMA_MOE_ASYNC`.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado | Condiciones |
|---|---|---|
| GSM8K (r4, ruta tensor-core CUDA) | 92,80 | n = 1.319, DGX Spark |
| GSM8K (r4, `GGML_CUDA_TQ_MM=0`) | 93,25 | n = 1.319, diferencia no significativa |
| GSM8K (r5) | 92,80 | misma puntuación que r4 |
| GSM8K (r6, nueva ruta de prompt) | 92,87 | diferencia no significativa frente a 92,80 |
| Decodificación, MacBook Air M5 16 GB, 32k contexto | 10,9-11,8 tokens/s | 13,4 GB wired, prompts de 9k-23k tokens |
| Lectura de prompt, MacBook Air M5 16 GB, 32k | 118-123 tokens/s | lotes de 2.048 tokens |
| Decodificación, MacBook Air M5 16 GB, 128k contexto | 6,8 tokens/s | prompt de 64k tokens |
| Lectura de prompt, 128k contexto | 113 tokens/s | — |
| Decodificación, DGX Spark (r6) | 33,5 → 36,5 tokens/s | mejora del 9% sobre r5 |
| Lectura de prompt, DGX Spark (r6) | 826 → 864 tokens/s | a 2.048 tokens, mejora del 5% |
| Impacto del predictor `trpw` | ~5% más lento sin él | medido con 10 expertos |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- Disco: 89,8 GB para los 8 shards GGUF, más 115 MiB del predictor `trpw`.
- RAM/VRAM: 13,4 GB wired en el caso medido (MacBook Air M5 de 16 GB); el caché de expertos se ajusta entre 6.600 MiB (32k) y 4.750 MiB (128k).
- Almacenamiento: SSD obligatorio; los expertos residen en disco y se leen bajo demanda, por lo que un disco lento degrada gravemente la decodificación.
- GPU validadas: Apple M5 (Metal) en el caso de referencia; DGX Spark con CUDA (build r4 y posteriores para Linux arm64). No hay datos de RTX 4090, A100 ni H100 en la información disponible.
- Cabe en GPU de consumo: sí, en el sentido de que un Mac de 16 GB lo ejecuta, pero solo gracias a la caché parcial en SSD; no se indica que quepa íntegro en VRAM de ninguna GPU de consumo.
- Runtime: exclusivamente el fork `llama.cpp-tr` (release `llama.cpp-tr-b11721-r3` o superior), con los tipos de tensor `TQ9_128` y `TQ27_128`. Las builds upstream de llama.cpp, LM Studio y Ollama no pueden cargarlo.
- Instalación: script de una línea `mac/qwen38-16gb.sh` que verifica hardware, descarga, comprueba SHA-256 y levanta un servidor local; o instalación manual con variables `LLAMA_MOE_SSD=1`, `LLAMA_MOE_CACHE_MIB`, `LLAMA_MOE_CACHE_MAX_BATCH`, `LLAMA_MOE_ASYNC=1` y flags Metal específicos.
- Latencia y throughput: ver tabla de benchmarks; la decodificación cae de ~11 tokens/s a 32k hasta 6,8 tokens/s a 128k en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-TR2.31-G (este) | 176,9B totales, ~6B activos | Hasta 262.144 | 2,31 trits medios (GGUF) | qwen-community-1.0 | llama.cpp-tr parcheado |
| Qwen3.8-Flash-Next-TR3-G | 176,9B totales, ~6B activos | No disponible | 3 trits (GGUF); 1.080 de 1.224 tensores idénticos a este | qwen-community-1.0 | llama.cpp-tr parcheado |
| Qwen/Qwen3.8-Flash-Next (BF16) | 176,9B totales, ~6B activos | No disponible | BF16 | qwen-community-1.0 | Frameworks estándar |

La comparación con alternativas de otros fabricantes (Llama, Mistral, DeepSeek) no está disponible en la información proporcionada. La diferencia medible entre TR2.31-G y TR3-G se limita a los 144 tensores de expertos enrutados (2 frente a 3 trits), con calibración y tensores no-experto compartidos.

## Limitaciones y advertencias

- Fricción de despliegue severa: requiere un fork mantenido por un tercero; no hay soporte en herramientas estándar del ecosistema (LM Studio, Ollama upstream, vLLM estándar).
- Solo Apple Silicon (Metal) para este archivo concreto; la build CUDA existe únicamente para Linux arm64 (DGX Spark).
- Modelo solo en inglés según la model card; el rendimiento en castellano no está documentado y no debería asumirse.
- Sin capacidades de visión ni cabeza MTP: no sirve para tareas multimodales ni para decodificación especulativa nativa.
- La cuantización a 2 trits en los expertos introduce degradación no cuantificada frente a BF16 en tareas distintas de GSM8K; no se han publicado evaluaciones de MMLU, HumanEval ni razonamiento multilingüe.
- Dependencia crítica del SSD: la decodificación lee expertos de disco en cada paso; un almacenamiento lento o con poca caché de sistema hunde el throughput.
- Las cifras de rendimiento proceden del autor y de un re-test independiente en la misma máquina, no de una evaluación de terceros a escala.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación en la información disponible.
- Licencia Qwen Community License 1.0: es una licencia "other" con condiciones específicas; debe revisarse el archivo `LICENSE` antes de cualquier uso comercial.
- Los resultados de GSM8K con y sin la ruta tensor-core (`92,80` frente a `93,25`) se declaran no significativos con n = 1.319, por lo que no deben interpretarse como diferencias reales de calidad.
- El repo acumula 628 descargas y 0 likes en el momento de la consulta, con última actualización el 2026-11-25; es un artefacto reciente y de un único publicador.

## Enlaces

- Hugging Face: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR2.31-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante de 3 trits: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF
- Repositorio del runtime: https://github.com/ternii-ai/tritq-vllm
- Código del runtime llama.cpp parcheado: https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Script de instalación para Mac: https://github.com/ternii-ai/tritq-vllm/blob/main/mac/qwen38-16gb.sh
- Release r4 (Linux arm64 + CUDA): https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r4
- Release r5: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r5
- Release r6: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r6
- llama.cpp upstream (base del fork): https://github.com/ggml-org/llama.cpp
