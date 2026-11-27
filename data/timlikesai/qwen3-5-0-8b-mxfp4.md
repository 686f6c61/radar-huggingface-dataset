# timlikesai/Qwen3.5-0.8B-MXFP4

## Resumen

Qwen3.5-0.8B-MXFP4 es una cuantizacion de 4,25 bits en formato MXFP4 del modelo Qwen3.5-0.8B, publicada por el usuario timlikesai. No se trata de un modelo original, sino de un artefacto derivado: parte del archivo BF16 generado por ggml-org a partir de la release oficial Qwen/Qwen3.5-0.8B y lo recompone con busqueda de escalas ponderada por imatrix. El resultado es un GGUF de 558 MB que reduce el peso del modelo base a menos de la mitad manteniendo la arquitectura `qwen35` intacta, incluidos los tensores MTP (`blk.24.nextn.*`) del modelo base.

El modelo resuelve un problema muy concreto: ejecutar un modelo multimodal de 772 millones de parametros en hardware modesto, incluidas GPU de consumo, con perdida de calidad medida y acotada. La cuantizacion MXFP4 sigue la especificacion de microscaling de OCP: valores e2m1 con una escala ue8m0 compartida por cada bloque de 32 valores. Frente a otras alternativas de 4 bits, el autor documenta el proceso completo (imatrix, checksums, comandos de reproducibilidad) y publica metricas de KLD y perplejidad contra el BF16 original.

Su relevancia actual es doble. Por un lado, demuestra un flujo reproducible de cuantizacion con imatrix para la familia Qwen3.5. Por otro, incluye soporte experimental de inferencia W4A8 en Blackwell (sm_120a, RTX 50) mediante una rama propia de llama.cpp, con activaciones FP8 e4m3 y escalas de bloque ue8m0, que recupera buena parte de la precision de las activaciones q8_1 con menor coste de prefill. El pipeline declarado es image-text-to-text, por lo que el modelo conserva capacidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` (GGUF, 335 tensores), con tensores MTP `blk.24.nextn.*` |
| Parametros totales | 772.845.888 (dato safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; las pruebas del autor usan `n_ctx=4096` |
| Tipos de cuantizacion | MXFP4 (4,25 bpw, e2m1 con escala ue8m0 por bloque de 32); KV cache MXFP4 con escalado UOS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`0.8b-mxfp4-imx.gguf`, 558.371.904 bytes) + fichero imatrix (`0.8b.imatrix`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con 772 millones de parametros y arquitectura identificada como `qwen35` en los metadatos GGUF. El pipeline image-text-to-text indica que el modelo original es multimodal (entrada de imagen y texto), aunque la informacion disponible no detalla el encoder visual ni la composicion del corpus de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO. Tampoco se especifica la innovacion concreta de la generacion 3.5 respecto a versiones anteriores. Los tensores MTP (multi-token prediction) presentes en el bloque 24 sugieren soporte de decodificacion especulativa o prediccion multi-token en el modelo base.

La contribucion tecnica de esta ficha es el proceso de cuantizacion. Se parte del BF16 convertido por ggml-org, se calcula una imatrix con `llama-imatrix` sobre 4894 fragmentos de `wikitext-2-raw/wiki.train.raw` a `n_ctx=512`, `batch_size=2048` y `n_seq=4`, y se aplica `llama-quantize` con el tipo MXFP4 y busqueda de escalas OCP (objetivo 4.0) ponderada por esa imatrix. El build utilizado es llama.cpp `0.5.0-dev` (build 3666, commit `0c666e561`) desde el fork del autor (PR #14), que anade el tipo de fichero MXFP4 denso, la busqueda de escalas con imatrix y la ruta de KV cache MXFP4. En Blackwell, el PR #15 anade un camino CUDA W4A8 con activaciones FP8 e4m3 y MMA con escalas de bloque (`kind::mxf8f6f4`), seleccionable con `GGML_CUDA_MMQ_PREC` (`q4` para 4 bits, `q8` para q8_1).

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Entrada imagen-texto: el pipeline declarado es image-text-to-text, por lo que conserva la capacidad multimodal del modelo base.
- Razonamiento y codigo: capacidades propias de la familia Qwen3.5, no verificadas de forma independiente en la informacion disponible.
- Prediccion multi-token (MTP): los tensores `blk.24.nextn.*` se conservan en la cuantizacion, lo que permite decodificacion especulativa si el runtime lo soporta.
- Inferencia acelerada en Blackwell: ruta W4A8 con activaciones FP8 y escalas de bloque, con conmutacion a W4A4 o q8_1 mediante variable de entorno.
- Tool calling y uso como agente: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales: con 558 MB de pesos, el modelo cabe en cualquier GPU de consumo con 8 GB o mas y permite iterar sobre prompts y flujos imagen-texto sin coste de API.
- Despliegue en el borde o en portatiles: el tamano reducido y la licencia Apache 2.0 facilitan distribuir el GGUF dentro de aplicaciones de escritorio con `llama-server -hf timlikesai/Qwen3.5-0.8B-MXFP4`.
- Evaluacion de cuantizaciones en pipelines de CI: el repositorio incluye imatrix, checksums y comandos exactos, lo que permite reproducir la cuantizacion y comparar KLD/PPL de nuevas variantes contra esta referencia.
- Pruebas de rendimiento en RTX 50 (Blackwell): sirve como banco de pruebas del camino W4A8 del PR #15, comparando tiers de activacion (4 bits, FP8, q8_1) con `llama-bench -p 4096 -n 128 -r 5`.
- Clasificacion y descripcion de imagenes en lote: el pipeline image-text-to-text permite procesar catalogos o capturas con un modelo pequeno y cuantizado, siempre que la precision sea suficiente para la tarea.
- Base para experimentos de decodificacion especulativa: al conservar los tensores MTP, es util para validar implementaciones de multi-token prediction en llama.cpp sobre un modelo de menos de 1 GB.
- Servicio de bajo consumo en CPU/GPU integrada: la cuantizacion de 4,25 bpw reduce el ancho de banda de memoria necesario, lo que favorece inferencia en equipos sin GPU dedicada.

## Benchmarks y rendimiento

Mediciones del autor sobre wikitext-2 test, `n_ctx=4096`, 72 fragmentos, con KLD y PPL frente al BF16 del paso 2, en 2x RTX 5070 Ti. El throughput se obtiene con `llama-bench -p 4096 -n 128 -r 5`.

| Tier de activacion | KLD | PPL | Same top-p | pp4096 (t/s) | tg128 (t/s) |
|---|---:|---:|---:|---:|---:|
| 4 bits (W4A4) | 0,4079 | 21,3590 | 69,847 | 23.053 | 537,0 |
| FP8 (W4A8, por defecto) | 0,1493 | 16,1805 | 81,231 | 22.690 | 535,9 |
| q8_1 | 0,1432 | 16,0846 | 81,639 | 22.154 | 536,6 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,56 GB para los pesos en MXFP4; con contexto de 4096 tokens y KV cache MXFP4 el uso adicional es reducido, aunque la cifra exacta no esta disponible.
- GPU recomendadas: RTX 5070 Ti (sm_120a) para aprovechar la ruta W4A8 del PR #15; cualquier GPU con soporte CUDA o Metal puede ejecutar el GGUF con el camino estandar de llama.cpp.
- GPU de consumo: si, cabe holgadamente en tarjetas con 8 GB o mas, incluidas generaciones anteriores a Blackwell (sin la aceleracion W4A8 especifica).
- Despliegue: `llama-server -hf timlikesai/Qwen3.5-0.8B-MXFP4`; tambien es compatible con llama.cpp, Ollama y otros runtimes basados en GGUF, siempre que soporten el tipo de fichero MXFP4 (el build del fork es necesario para el tipo 42 original).
- Throughput medido: 23.053 t/s en prefill de 4096 tokens y 537 t/s en generacion de 128 tokens sobre 2x RTX 5070 Ti con el tier W4A4; el tier FP8 queda en 22.690 y 535,9 t/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| timlikesai/Qwen3.5-0.8B-MXFP4 | 772,8 M | no disponible (pruebas a 4096) | MXFP4 4,25 bpw con imatrix | Apache 2.0 | Este modelo; incluye imatrix y checksums |
| ggml-org/Qwen3.5-0.8B-GGUF | 772,8 M | no disponible | BF16 y otras variantes GGUF | Apache 2.0 | Modelo base del que deriva; mayor precision, mayor tamano |
| Qwen/Qwen3.5-0.8B | 772,8 M | no disponible | safetensors (BF16) | Apache 2.0 | Release original; requiere conversion a GGUF para llama.cpp |

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion medible: KLD de 0,1493 frente al BF16 con el tier FP8 por defecto, y de 0,4079 con activaciones de 4 bits, lo que reduce el solapamiento top-p al 69,847 % en ese caso.
- El tier W4A8 requiere el build del PR #15 y GPU Blackwell (sm_120a); en otras arquitecturas se usa el camino estandar, con el rendimiento y la precision del tier de 4 bits.
- El tipo de fichero `general.file_type = 42` corresponde al fork; versiones mas recientes de `llama-gguf` imprimen otro numero para el mismo fichero, lo que puede confundir en validaciones automatizadas.
- Riesgo de alucinacion inherente a un modelo de 0,8 B: no apto para tareas que exijan alta fidelidad factual sin verificacion externa.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.5-0.8B.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue mas alla de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el artefacto cuantizado; conviene validar la calidad en el dominio de produccion antes de desplegar.
- El contexto maximo real del modelo base no se detalla; las mediciones se realizaron a 4096 tokens, por lo que no hay evidencia publicada de comportamiento con ventanas mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timlikesai/Qwen3.5-0.8B-MXFP4
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3.5-0.8B-GGUF
- Release original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base alternativo citado en metadatos: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- PR #14 (tipo MXFP4, busqueda de escalas con imatrix, KV cache): https://github.com/timlikesai/llama.cpp/pull/14
- PR #15 (CUDA W4A8 en Blackwell y comparativa de tres modelos): https://github.com/timlikesai/llama.cpp/pull/15
