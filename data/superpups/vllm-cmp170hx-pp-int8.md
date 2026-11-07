# SuperPUPS/vllm-cmp170hx-pp-int8

## Resumen
El repositorio `SuperPUPS/vllm-cmp170hx-pp-int8` no contiene pesos de un modelo, sino el tarball de código fuente de un fork parcheado de vLLM orientado a servir el modelo base Qwen/Qwen3.8-Flash-Next sobre dos tarjetas NVIDIA CMP 170HX (die GA100, arquitectura sm80). Lo publica el usuario SuperPUPS bajo licencia Apache 2.0 y su interés es fundamentalmente de infraestructura: documenta una receta concreta de despliegue con paralelismo de pipeline PP2, caché KV INT8 y decodificación especulativa MTP sobre hardware de minería reconvertido.

El artefacto principal es `vllm-cmp170hx-pp-34a2085.tar.gz`, un `git archive` del HEAD `34a2085` de la rama `feature/int8-kv`, con 45 574 609 bytes y 9064 ficheros, acompañado de scripts de lanzamiento `run_pp2_int8.sh` y `run_pp2.sh`. El repositorio tiene 0 GB de tamaño declarado y 0 descargas en el momento de la consulta, lo que sugiere un uso interno o experimental más que una distribución pública consolidada.

La relevancia es acotada pero específica: permite reproducir un entorno de inferencia de Qwen3.8-Flash-Next con ventana de contexto de 262 144 tokens y `max-num-seqs 16` sobre GPUs CMP 170HX, un hardware con HBM2e de 64 GB que se comercializa a una fracción del precio de una A100. No se dispone de información sobre arquitectura, tamaño o datos de entrenamiento del modelo base en la información proporcionada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un fork de vLLM, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (configuración de servicio declarada: `ctx 262144`) |
| Tipos de cuantizacion | INT8 en caché KV (per-token-head); cuantización de pesos no especificada en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el artefacto es un tarball de código fuente `.tar.gz`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo base Qwen/Qwen3.8-Flash-Next ni sobre su proceso de entrenamiento, dataset, número de tokens o técnicas de alineación como RLHF o DPO. El repositorio no distribuye pesos ni documentación del modelo, solo el código del servidor de inferencia.

La innovación técnica documentada corresponde al fork de vLLM: paralelismo de pipeline PP2 con reparto de capas en 28 y 20 tiles respectivamente, caché KV INT8 con granularidad per-token-head, prefill disperso QSA, decodificación especulativa MTP y un allreduce personalizado sobre PCIe P2P. El entorno de ejecución es un venv de Python 3.13 con CUDA 13.2 e instalación editable, y la receta de lanzamiento se remite a `RECIPE_PP2_INT8_KV.md` en el repositorio `SuperPUPS/Qwen3.8-Flash-Next-INT8x25-AttnBF16`. El servicio de producción se denomina `qfn-vllm2-pp2-int8.service` y escucha en el puerto 8000.

## Capacidades
- Servicio de inferencia de Qwen3.8-Flash-Next mediante vLLM con API compatible con OpenAI en el puerto 8000.
- Paralelismo de pipeline PP2 sobre dos GPUs CMP 170HX con reparto 28/20 tiles.
- Caché KV cuantizada a INT8 per-token-head, orientada a reducir huella de memoria en contexto largo.
- Prefill disperso QSA para acelerar la fase de prellenado.
- Decodificación especulativa MTP (multi-token prediction) para aumentar el throughput de generación.
- Allreduce personalizado sobre PCIe P2P entre las dos GPUs.
- Ventana de contexto de 262 144 tokens y límite de 16 secuencias concurrentes (`max-num-seqs 16`).
- Capacidades del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo): no disponibles en la información proporcionada.

## Casos de uso
- Despliegue de contexto largo en hardware de bajo coste: servir Qwen3.8-Flash-Next con 262 144 tokens de ventana sobre dos CMP 170HX permite procesar documentos extensos o conversaciones multi-turno largas sin adquirir A100 o H100, a costa de asumir el mantenimiento de un fork de vLLM.
- Reproducción de experimentos de inferencia: el tarball con hash sha256 verificable (`dfcaf69c...e83122`) y los scripts `run_pp2_int8.sh` y `run_pp2.sh` permiten reconstruir el entorno exacto para validar resultados de throughput o latencia con PP2 e INT8 KV.
- Investigación sobre cuantización de caché KV: la rama `feature/int8-kv` sirve como base para medir el impacto de la caché KV INT8 per-token-head en calidad y velocidad frente a FP16.
- Evaluación de decodificación especulativa MTP: el fork incorpora MTP y puede usarse para comparar tasas de aceptación y ganancia de throughput frente a decodificación autoregresiva estándar.
- Servicio interno con concurrencia moderada: con `max-num-seqs 16` y un unit systemd dedicado, encaja en cargas de trabajo de equipo pequeño o entornos de staging donde el coste por GPU es prioritario.
- Estudio de allreduce sobre PCIe P2P: el parche de comunicación entre las dos GPUs es útil para analizar cuellos de botella en topologías sin NVLink, habituales en CMP 170HX.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- GPU: dos NVIDIA CMP 170HX (die GA100, sm80, 64 GB HBM2e por tarjeta). El repositorio está etiquetado explícitamente con `sm80` y `pipeline-parallelism`.
- VRAM: el paralelismo PP2 divide el modelo entre dos tarjetas de 64 GB; el consumo exacto por GPU no está disponible.
- Contexto: configurado a 262 144 tokens, lo que exige la caché KV INT8 para ser viable en este hardware.
- Concurrencia: `max-num-seqs 16`.
- Entorno: Python 3.13 en venv, CUDA 13.2, instalación editable del fork.
- Despliegue: unit systemd `qfn-vllm2-pp2-int8.service` en el puerto 8000. No se documentan opciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Compatibilidad con GPUs consumer (RTX 4090, etc.): no disponible; el fork está orientado a sm80 y a CMP 170HX.

## Comparativa con modelos similares
| Aspecto | SuperPUPS/vllm-cmp170hx-pp-int8 | canoziia/vllm-cmp170hx | ahnguyen17/cmp-170hx-vllm |
|---|---|---|---|
| Tipo de artefacto | Fork de vLLM (tarball) + scripts | Repositorio de parches y recetas | Receta de servicio validada |
| Modelo objetivo | Qwen3.8-Flash-Next | No especificado (parches por modelo) | Qwen3.8-27B-Int8 (GPTQ) |
| Paralelismo | PP2 (28/20 tiles) | No disponible | Single GPU |
| Cuantización | INT8 KV per-token-head | No disponible | INT8 pesos (GPTQ) |
| Decodificación especulativa | MTP | No disponible | MTP k=3 |
| Ventana de contexto | 262 144 | No disponible | No disponible |
| Hardware | 2x CMP 170HX | CMP 170HX | 1x CMP 170HX 64 GB Hynix |
| Licencia | Apache 2.0 | No disponible | No disponible |

## Limitaciones y advertencias
- El repositorio no contiene pesos: es código fuente de un servidor de inferencia, por lo que no puede evaluarse como modelo en sí.
- El tamaño declarado del repo es 0.0 GB, mientras que el tarball citado ocupa 45 574 609 bytes; conviene verificar la integridad con el sha256 indicado antes de desplegar.
- Fork personal con 0 descargas y 0 likes: no hay evidencia de validación comunitaria ni de mantenimiento continuado.
- Dependencia de hardware muy específico (CMP 170HX, sm80, PCIe P2P sin NVLink); el rendimiento y la estabilidad en otras GPUs no están documentados.
- La receta de lanzamiento se remite a un documento externo (`RECIPE_PP2_INT8_KV.md` en otro repositorio), lo que añade un punto de fallo en la reproducibilidad.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- La licencia Apache 2.0 del fork no implica necesariamente las mismas condiciones para los pesos del modelo base; deben revisarse por separado.
- El límite de 16 secuencias concurrentes restringe su uso en producción de alta concurrencia.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/SuperPUPS/vllm-cmp170hx-pp-int8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta de lanzamiento referenciada: https://huggingface.co/SuperPUPS/Qwen3.8-Flash-Next-INT8x25-AttnBF16
- Fork base de vLLM: https://github.com/Morrowmake/vllm-cmp170hx
- Repositorio de parches relacionado: https://github.com/canoziia/vllm-cmp170hx
- Receta de servicio alternativa en CMP 170HX: https://github.com/ahnguyen17/cmp-170hx-vllm
