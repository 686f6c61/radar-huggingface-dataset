# timlikesai/Qwen3.8-27B-MXFP4

## Resumen

Qwen3.8-27B-MXFP4 es una cuantizacion de 4,25 bits por peso (MXFP4) del modelo Qwen3.8-27B, publicada por el usuario timlikesai. No se trata de un modelo original, sino de un artefacto derivado: parte del GGUF en BF16 generado por ggml-org a partir del release oficial Qwen/Qwen3.8-27B y lo recomprime con pesos MXFP4 (valores e2m1 con una escala ue8m0 compartida por cada bloque de 32 valores, segun la especificacion de microscaling de OCP), aplicando una busqueda de escalas ponderada por una matriz de importancia (imatrix) calculada sobre wikitext-2.

El interes practico esta en que reduce el peso en disco a unos 15,66 GB frente al BF16 del modelo base, manteniendo el pipeline image-text-to-text y la arquitectura `qwen35` declarada en los metadatos. El autor acompania el fichero GGUF con la propia imatrix para que el paso de cuantizacion sea reproducible, y documenta checksums SHA-256 de ambos artefactos.

La relevancia actual viene de su enfoque de despliegue: en GPUs Blackwell de consumo (RTX 50, sm_120a) con un fork especifico de llama.cpp, las capas se ejecutan por defecto como W4A8 (activaciones FP8 e4m3 con escalas de bloque ue8m0) mediante la MMA block-scaled `mxf8f6f4`, lo que recupera buena parte de la precision de activaciones q8_1 con menor coste de prefill. Es, por tanto, una pieza pensada para inferencia local en hardware reciente mas que para servidores de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa, arquitectura GGUF `qwen35` (base Qwen3.8-27B); 851 tensores |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (las mediciones del autor usan `n_ctx=4096`) |
| Tipos de cuantizacion | MXFP4 (4,25 bits por peso, bloques de 32 valores con escala e8m0); KV cache MXFP4 con escalado UOS; en inferencia CUDA, activaciones de 4 bits, FP8 e4m3 o q8_1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`27b-mxfp4-imx.gguf`), mas fichero imatrix (`27b.imatrix`) |

## Arquitectura y entrenamiento

El modelo subyacente es una transformer densa de 26,9 mil millones de parametros identificada en los metadatos como `general.architecture = qwen35` y `general.name = Qwen3.8-27B`. La conversion a GGUF se hizo con `convert_hf_to_gguf.py --outtype bf16 --no-mtp`, de modo que el fichero no contiene tensores `nextn.*` (no hay cabeza de prediccion multi-token). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

El trabajo de este repositorio es exclusivamente de cuantizacion. La matriz de importancia se genero con `llama-imatrix` sobre 4894 fragmentos de `wikitext-2-raw/wiki.train.raw` con `n_ctx=512`, `batch_size=2048` y `n_seq=4`, cubriendo 496 entradas. Sobre esa imatrix se ejecuto `llama-quantize --imatrix ... MXFP4`, con busqueda de escalas OCP (objetivo 4.0) para los pesos. El resultado se compila con una revision concreta de llama.cpp (`0.5.0-dev`, build 3666, commit `0c666e561`) procedente del fork timlikesai/llama.cpp#14, que anade el tipo de fichero MXFP4 denso, la busqueda de escalas ponderada por imatrix y la ruta de KV cache MXFP4. Esa revision escribe `general.file_type = 42`; versiones mas recientes de `llama-gguf` muestran otro numero para el mismo fichero.

La innovacion tecnica destacable es la ruta de atencion con KV cache MXFP4 y escalado UOS (`e = ceil(log2(amax/7.25))+127`, MXAttention) como opcion por defecto, junto con el soporte CUDA W4A8 del PR #15, que usa la MMA block-scaled `kind::mxf8f6f4` con activaciones FP8 e4m3 y escalas ue8m0. La variable `GGML_CUDA_MMQ_PREC` permite seleccionar activaciones de 4 bits (`q4`) o q8_1 (`q8`).

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational` en el repositorio).
- Entrada imagen-texto a texto: el pipeline declarado es `image-text-to-text`, por lo que el modelo base admite entradas visuales ademas de texto.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8-27B; no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`.

## Casos de uso

- Inferencia local en GPUs Blackwell de consumo: el caso de uso principal documentado por el autor es ejecutar el modelo en tarjetas RTX 50 (sm_120a) con el fork de llama.cpp, aprovechando la ruta W4A8 FP8 para obtener prefill rapido sin salir de un equipo de sobremesa.
- Despliegue con llama-server: el comando `llama-server -hf timlikesai/Qwen3.8-27B-MXFP4` levanta directamente un servidor compatible con la API de OpenAI, adecuado para prototipos y entornos de desarrollo que necesiten un endpoint conversacional local.
- Asistentes con entrada de imagen: al conservar el pipeline image-text-to-text, puede usarse para describir imagenes, responder preguntas sobre capturas o extraer informacion de documentos escaneados en flujos internos.
- Reproduccion y auditoria de cuantizaciones: al incluir `27b.imatrix` y los checksums, sirve como referencia para verificar que una re-cuantizacion MXFP4 con ponderacion por importancia produce el mismo artefacto, util en equipos que validan cadenas de suministro de modelos.
- Evaluacion comparativa de precision de cuantizacion: los datos de KLD y PPL frente al BF16 permiten usar este fichero como banco de pruebas para medir el impacto de distintas estrategias de escalado (OCP frente a otras) en un modelo de ~27B.
- Servicio de chat con contexto medio en una o dos GPUs: con los ~15,66 GB del fichero y las mediciones a `n_ctx=4096`, encaja en escenarios de atencion al cliente o asistencia interna donde el contexto necesario no supere unos miles de tokens.
- Investigacion sobre formatos de bloque: util para estudiar el comportamiento de MXFP4 y del KV cache MXAttention en cargas reales, comparando las tres tiers de activacion (4 bits, FP8 y q8_1) con el mismo juego de pesos.

## Benchmarks y rendimiento

El autor publica mediciones sobre wikitext-2 test con `n_ctx=4096`, 72 fragmentos, comparando KLD y PPL contra el BF16 del paso 2, y throughput con `llama-bench -p 4096 -n 128 -r 5` en 2x RTX 5070 Ti:

| Tier de activacion | KLD | PPL | same top-p | pp4096 (t/s) | tg128 (t/s) |
|---|---:|---:|---:|---:|---:|
| 4 bits (W4A4) | 0,1875 | 6,5477 | 83,958 | 2533 | 79,8 |
| FP8 (W4A8, por defecto) | 0,0898 | 6,3525 | 90,157 | 2341 | 79,7 |
| q8_1 | 0,0860 | 6,3470 | 90,476 | 2178 | 79,9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 15,66 GB (tamano exacto del fichero `27b-mxfp4-imx.gguf`), mas overhead de contexto y de KV cache; con `n_ctx=4096` y KV cache MXFP4 el consumo adicional es reducido frente a un KV en FP16.
- GPU recomendadas: el autor mide en 2x RTX 5070 Ti con la ruta W4A8; las mejoras de prefill con MMA block-scaled requieren Blackwell (sm_120a, serie RTX 50). En GPUs sin esa ruta, el modelo funciona con la ruta de 4 bits estandar de llama.cpp, con mayor KLD.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 4090, RTX 5090, RTX 5070 Ti en configuracion multi-GPU); en 16 GB no cabe el fichero completo sin offload a CPU.
- Opciones de despliegue: llama.cpp / llama-server (comando `llama-server -hf timlikesai/Qwen3.8-27B-MXFP4`); el soporte de MXFP4 denso, imatrix y KV cache MXFP4 requiere el fork timlikesai/llama.cpp#14, y la ruta W4A8 requiere ademas el PR #15. Compatibilidad con vLLM, TGI u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput medidos: 2533 t/s de prefill (4096 tokens) en W4A4, 2341 t/s en W4A8 y 2178 t/s en q8_1; generacion estable en torno a 79,7-79,9 t/s en las tres configuraciones, sobre 2x RTX 5070 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timlikesai/Qwen3.8-27B-MXFP4 | 26,9 mil millones | no disponible | MXFP4 4,25 bpw, 15,66 GB | Apache 2.0 | GGUF en Hugging Face, requiere fork de llama.cpp |
| ggml-org/Qwen3.8-27B-GGUF (BF16) | 26,9 mil millones | no disponible | BF16 | Apache 2.0 (heredada) | GGUF en Hugging Face, llama.cpp estandar |
| Qwen/Qwen3.8-27B (original) | 26,9 mil millones | no disponible | safetensors en BF16 | Apache 2.0 | Hugging Face, ecosistema transformers |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda los sesgos y el riesgo de alucinacion del Qwen3.8-27B original, sobre el que no se aporta informacion en este repositorio.
- La perdida de precision es medible: con activaciones de 4 bits el KLD sube a 0,1875 y la coincidencia top-p baja a 83,958 %, frente a 0,0898 y 90,157 % en FP8; para tareas sensibles conviene usar la ruta W4A8 o q8_1.
- La ruta optimizada depende de un fork no fusionado de llama.cpp (PR #14 y PR #15); con llama.cpp master el tipo de fichero se interpreta de forma distinta (`general.file_type = 42` no coincide con el numero actual) y no se dispone de la aceleracion W4A8.
- El prefill rapido con MMA block-scaled esta limitado a GPUs Blackwell sm_120a; en otras arquitecturas el rendimiento y la precision pueden diferir de las cifras publicadas.
- El contexto maximo no se documenta; las mediciones se hicieron a `n_ctx=4096`, por lo que no hay evidencia publicada de comportamiento con ventanas mas largas.
- No se declara lista de idiomas soportados, por lo que el rendimiento multilingue no esta verificado para este artefacto.
- El repositorio tiene 222 descargas y 0 likes en el momento de la consulta, con un unico mantenedor; no hay garantia de soporte o actualizaciones.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.8-27B antes de desplegarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timlikesai/Qwen3.8-27B-MXFP4
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- PR con el tipo de fichero MXFP4, busqueda de escalas con imatrix y KV cache: https://github.com/timlikesai/llama.cpp/pull/14
- PR con la ruta CUDA W4A8 y la comparativa completa de los tres modelos: https://github.com/timlikesai/llama.cpp/pull/15
