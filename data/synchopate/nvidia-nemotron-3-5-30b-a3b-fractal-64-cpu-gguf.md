# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF es una cuantizacion GGUF del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario Synchopate. Se trata de un checkpoint legacy (v3.0) que aplica una cuantizacion jerarquica no lineal de bloques de 64 elementos, denominada Fractal-64, sobre los tensores MoE del modelo original. El resultado es un fichero de 15.420.034.624 bytes (14,36 GiB) que conserva los 31.577.940.288 parametros del modelo base sin podar, con Top-6 activo en cada capa de mezcla de expertos.

El modelo base es un transformer hibrido de NVIDIA que combina 23 bloques Mamba-2 SSM, 23 bloques Sparse MoE y 6 bloques de atencion GQA-2, sumando 52 bloques en total. Esta variante esta disenada especificamente para inferencia en CPU (AVX2, AVX-512) y Apple Silicon Metal (M1-M5), mediante el runtime modificado llama-modchip v3.0, que introduce un tipo de tensor propio (GGML_TYPE_FRACTAL_64 = 44) y decodificacion especulativa.

Su relevancia actual radica en que permite ejecutar un modelo de 30B parametros en equipos sin GPU dedicada, con velocidades verificadas de hasta 111,62 tok/s en un Threadripper PRO 7985WX y 72,47 tok/s en un Apple M4 Max. No obstante, el propio autor lo marca como obsoleto y recomienda las variantes MaxQ v3.0 y VQ3-64 para nuevos despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 23 bloques Mamba-2 SSM + 23 bloques Sparse MoE + 6 bloques GQA-2 Attention (52 bloques) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Top-6 expertos activos por capa MoE (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Fractal-64 (GGML_TYPE_FRACTAL_64 = 44), cuantizacion jerarquica no lineal de bloques de 64 elementos; 2 niveles |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (fichero unico de 15.420.034.624 bytes / 14,36 GiB) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que intercala capas Mamba-2 (modelos de espacio de estados) con capas de mezcla de expertos dispersa y un pequeno conjunto de capas de atencion con query grouping (GQA-2). Esta combinacion busca reducir el coste computacional de la atencion clasica manteniendo capacidad de modelado de secuencias largas. La variante aqui descrita no reentrena el modelo: solo modifica la representacion numerica de los pesos.

La cuantizacion Fractal-64 aplica una codificacion jerarquica de dos niveles sobre bloques de 64 pesos, sustituyendo el esquema lineal habitual por una aproximacion no lineal. Segun la model card, los 46 tensores MoE afectados se migraron del enum legacy 42 al tipo 44 sin modificar un solo byte de payload (SHA256 del payload identico al commit v2.5.4). El autor reporta una perplejidad media de 6,6533 y una KLD media de 0,0688 nats frente a la referencia MXFP4 en la prueba ciega wiki-alt.txt (40 x 512), y una perplejidad de 7,3610 ± 0,2602 en WikiText-2 continuo frente a 6,9582 ± 0,2415 del BF16 real (+5,79%). No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y respuestas multi-turno, con plantilla Jinja que activa por defecto el modo de razonamiento `<think>...</think>`.
- Razonamiento explicito con presupuesto de tokens configurable: se recomienda `max_tokens >= 4096` cuando el thinking esta activo, o desactivarlo con `chat_template_kwargs={"enable_thinking": false}` o `--reasoning-budget 0` para respuestas directas o JSON.
- Generacion de codigo, segun los benchmarks internos del autor (C++20, refactorizacion de codigo).
- Inferencia en CPU pura con kernels AVX2 (`vpmaddwd`) y AVX-512 (VBMI, VNNI), y en Apple Silicon Metal mediante shader Fractal-64.
- Decodificacion especulativa integrada en el runtime llama-modchip, con modos "cold" y "warm" reportados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estaciones de trabajo sin GPU: con 14,36 GiB y velocidades de 19-25 tok/s en CPUs de escritorio (Ryzen 5 5600X, Ryzen 9 9955HX), el modelo puede gestionar refactorizaciones y generacion de C++20 en local, sin depender de servicios en la nube.
- Servidor de inferencia en CPU para equipos de desarrollo: desplegado con `llama-server-modchip` en un Threadripper PRO 7985WX, alcanza 73,84 tok/s en prosa y 386 tok/s de prefill, suficiente para dar servicio a varios desarrolladores con una sola maquina.
- Procesamiento por lotes en instancias cloud ARM: en AWS Graviton3 m7g.2xlarge (8 vCPU, 31 GB) rinde 41,05 tok/s en C++20, lo que permite tareas de generacion y refactorizacion a coste reducido frente a instancias con GPU.
- Razonamiento con traza explicita para auditoria: el modo `<think>` permite obtener cadenas de razonamiento separadas de la respuesta final, util en entornos donde se requiere revisar el proceso deductivo antes de aceptar la salida.
- Prototipado en portatiles Apple Silicon: con 57,65-78,60 tok/s en M1 Max a M3 Max, el modelo es viable para desarrollo iterativo local en macOS sin conexion.
- Respuestas JSON estructuradas en pipelines: desactivando el thinking y usando el modo directo, el modelo puede integrarse en flujos automatizados que requieren salida JSON concisa sin la sobrecarga de tokens de razonamiento.
- Evaluacion de tecnicas de cuantizacion: el checkpoint sirve como referencia reproducible (SHA256 publicados, scripts de evaluacion de perplejidad y KLD) para investigadores que comparan esquemas de compresion en modelos MoE hibridos.

## Benchmarks y rendimiento

Rendimiento de inferencia reportado por el autor (tok/s):

| Plataforma | Arquitectura | Tok/s | Configuracion |
|---|---|---|---|
| AMD Threadripper PRO 7985WX (64C/128T, DDR5 8 canales) | x86_64 Zen 4 | 73,84 prosa / 80,14 cold / 111,62 warm | CPU pura, `-t 32`, prefill 386,0 tok/s |
| Apple M4 Max | Apple Silicon Metal | 72,47 | Shader Metal FRACTAL_64 |
| Apple M3 Max | Apple Silicon Metal | 78,60 | Shader Metal FRACTAL_64 |
| Apple M1 Max | Apple Silicon Metal | 57,65 | Shader Metal FRACTAL_64 |
| AMD Ryzen 9 9955HX (16C/32T, DDR5 2 canales) | x86_64 Zen 5 | 25,02 | CPU pura, prefill 181,5-306,8 pp512 |
| AWS Graviton3 m7g.2xlarge (8 vCPU, 31 GB) | ARM64 Neoverse-V1 | 41,05 C++20 / 44,97 refactor | CPU pura, prefill 101,7 tok/s |
| AMD Ryzen 5 5600X (6C/12T, DDR4-3200) | x86_64 Zen 3 (AVX2) | 19,04 C++20 / 21,58 refactor | CPU pura, prefill 63,9 tok/s |

Calidad de cuantizacion:

| Metrica | Fractal-64 | VQ3-64 (13,30 GiB) | MaxQ-16GB (13,39 GiB) | Referencia |
|---|---|---|---|---|
| Perplejidad media wiki-alt.txt (40 x 512) | 6,6533 | 6,7614 | 7,3129 | MXFP4 6,5962 ± 0,1729 |
| KLD media wiki-alt.txt (nats) | 0,0688 | 0,0871 | 0,1722 | - |
| Perplejidad WikiText-2 continuo | 7,3610 ± 0,2602 | no disponible | no disponible | BF16 6,9582 ± 0,2415 (+5,79%) |
| KLD de logits vs BF16 (nats) | 0,1254 / 0,0929 | no disponible | no disponible | - |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el fichero GGUF ocupa 14,36 GiB; se recomienda al menos 16 GB de RAM libre para CPU y Metal. La variante de 32 GB del ecosistema (Qwen3.8-Flash-Next-MaxQ) se menciona como alternativa de mayor capacidad, no como requisito de este modelo.
- GPU recomendadas: no se requiere GPU; el modelo esta optimizado para CPU. En Apple Silicon funciona con Metal (M1-M5). No se documenta soporte CUDA ni Vulkan para esta variante Fractal-64 (la MaxQ de 16 GB si lo ofrece).
- Cabe en GPU consumer: no aplica directamente; el runtime objetivo es CPU y Metal. No se dispone de datos de ejecucion en RTX 4090 u otras GPU consumer con este formato.
- Opciones de despliegue: llama-modchip v3.0 (runtime propietario del autor, con binarios estaticos libgomp GLIBC_2.30 para x86_64 AVX2 y AVX-512), instalacion via `./install.sh --preset nemotron-fractal`, y modo chat con `./modchip chat`. No es compatible con llama.cpp upstream, vLLM, TGI, Ollama ni LM Studio en esta variante.
- Latencia y throughput: ver tabla de benchmarks; el prefill oscila entre 63,9 tok/s (Ryzen 5 5600X) y 386,0 tok/s (Threadripper PRO 7985WX).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64 (este) | 31,58B totales, Top-6 activos | no disponible | GGUF Fractal-64, 14,36 GiB | openmdw-1.1 | Solo llama-modchip v3.0; CPU y Metal |
| Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF | 31,58B totales | no disponible | GGUF estandar, 13,39 GiB | openmdw-1.1 | 100% ggml upstream; llama.cpp, Metal, CUDA, Vulkan, LM Studio |
| Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF | 31,58B totales | no disponible | GGUF VQ3-64, 13,30 GiB | openmdw-1.1 | AVX-512 VBMI; CPU turbo |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,58B totales | no disponible | safetensors BF16 | openmdw-1.1 | Modelo base sin cuantizar |

La comparativa con modelos de otros autores de la misma categoria (por ejemplo, Qwen o Llama de ~30B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint legacy: el autor lo marca explicitamente como superado por MaxQ v3.0 y recomienda las variantes de 16 GB (MaxQ o VQ3-64) para nuevos despliegues.
- Compatibilidad restringida: requiere el runtime llama-modchip v3.0 con el tipo GGML_TYPE_FRACTAL_64 = 44; no funciona con llama.cpp upstream, vLLM, TGI, Ollama ni LM Studio.
- Perdida de calidad medible: +5,79% de perplejidad en WikiText-2 frente a BF16 y KLD de logits de 0,1254/0,0929 nats; aceptable para uso general pero no para tareas que exijan fidelidad numerica alta.
- Riesgo de alucinacion: inherente al modelo base; no se documentan evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se dispone de informacion sobre sesgos conocidos del modelo base ni de esta cuantizacion.
- Idiomas: no se especifican los idiomas soportados; la plantilla de chat y los ejemplos estan en ingles.
- Presupuesto de tokens: con el modo `<think>` activo por defecto, es necesario fijar `max_tokens >= 4096` o desactivarlo explicitamente para evitar respuestas truncadas o consumo excesivo.
- Licencia openmdw-1.1: se debe revisar el texto completo en openmdw.ai para confirmar las condiciones de uso comercial, que no se detallan en la model card.
- Hardware: los binarios incluidos son para Linux x86_64 (AVX2/AVX-512) con GLIBC 2.30; otras plataformas requieren compilar el runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante MaxQ 16 GB universal: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF
- Variante VQ3-64 CPU-Turbo: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Variante 32 GB RAM (Qwen3.8-Flash-Next-MaxQ): https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF
- Repositorio del runtime llama-modchip: https://github.com/synchopate/llama-modchip
- Script de evaluacion de perplejidad y KLD: https://github.com/synchopate/llama-modchip/blob/main/benchmarks/eval_perplexity_and_kld.py
- Pull request del shader Metal FRACTAL_64: https://github.com/synchopate/llama-modchip/pull/24
- Issue relacionado con Metal: https://github.com/synchopate/llama-modchip/issues/16
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
