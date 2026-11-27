# Xylolabs/GLM-4.7-Flash-Tenstorrent-Tensix

## Resumen

GLM-4.7-Flash-Tenstorrent-Tensix es una version cuantizada del modelo zai-org/GLM-4.7-Flash, publicada por Xylolabs y optimizada especificamente para su ejecucion en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole, nucleos Tensix). El modelo base pertenece a la familia GLM-4.5/4.7 del equipo GLM (Zhipu/Z.ai), una familia de modelos fundacionales orientada a razonamiento agéntico y generacion de codigo (ARC: Agentic, Reasoning and Coding). La cuantizacion emplea un esquema de block floating point de 4 bits (bfloat4_b) sobre las proyecciones MLA y MLP, manteniendo el resto de tensores en bf16/float32.

El interes de esta publicacion es doble. Por un lado, demuestra que un modelo MoE de gran tamano puede comprimirse hasta unos 17,7 GB empaquetados con una degradacion medida (KL medio de 0,093 frente a BF16 sobre 16.288 posiciones) razonablemente contenida. Por otro, es uno de los pocos artefactos publicos que trae pesos ya preparados y scripts de empaquetado para el stack tt-metal/ttnn de Tenstorrent, lo que permite ejecutar inferencia en hardware alternativo a las GPU NVIDIA.

El repositorio incluye los pesos en formato safetensors dentro de la carpeta `bfp4/`, un fichero `quant4.json` que describe el formato por capa, y utilidades `pack_tensix.py` y `verify_grid.py` para el reempaquetado en el layout de tiles de Tensix. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (variante glm4_moe_lite) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (block floating point 4 bits) en MLA, MLP densa, MLP enrutada y compartida; resto en bf16/float32 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (carpeta `bfp4/`), con metadatos en `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base GLM-4.7-Flash es un transformer de tipo Mixture of Experts con atencion Multi-head Latent Attention (MLA), segun se deduce de la nomenclatura `glm4_moe_lite` y de las capas `q_b_proj` y `kv_a_proj_with_mqa` mencionadas en la model card (47 capas decodificadoras). La cuantizacion de Xylolabs no altera la topologia: solo sustituye los tensores de mayor tamano por representaciones bfloat4_b, dejando el resto en bf16/float32. El proceso de cuantizacion se basa en GPTQ sobre bloques (block floating point), segun indica el nombre del repositorio de codigo `tensix-bfp-gptq`.

No se detalla en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo fases de RLHF/DPO. La model card cita el paper arXiv:2508.06471 (GLM-4.5: Agentic, Reasoning, and Coding Foundation Models), que describe la familia base. La innovacion tecnica destacable de esta publicacion es el esquema de empaquetado para Tensix: reordenacion de las cabezas de `q_b_proj` (192 filas iniciales + permutacion par/impar de las 64 finales) y de `kv_a_proj_with_mqa` (512 filas iniciales + misma permutacion), necesaria para que las parejas rotatorias queden alineadas con el layout de tiles de la NPU.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento y resolucion de problemas (heredado del modelo base GLM-4.5/4.7 orientado a ARC).
- Generacion de codigo y tareas de programacion.
- Soporte de plantilla de chat (`apply_chat_template`).
- Inferencia en NPU Tenstorrent Wormhole y Blackhole mediante tt-metal/ttnn.
- Ejecucion en GPU/CPU via Transformers 5.22.2 o superior (con `dtype="bfloat16"` y `device_map="auto"`).
- No se documenta en la informacion disponible soporte explicito de tool calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Despliegue en hardware Tenstorrent: el modelo esta empaquetado para ejecutarse directamente en NPUs Wormhole y Blackhole usando tt-metal y ttnn, lo que permite servir inferencia en infraestructura no-NVIDIA. Es el caso de uso principal de este artefacto.
- Investigacion en cuantizacion de bajo bit: sirve como referencia reproducible para estudiar el impacto de bfloat4_b + GPTQ en un MoE con MLA, comparando el KL medio (0,093) frente a BF16 y Q4_K_M.
- Prototipado en entornos con VRAM limitada: con 17,7 GB empaquetados, el modelo cabe en una GPU de consumo de 24 GB (por ejemplo, RTX 4090) una vez cargado en bf16, lo que facilita pruebas locales.
- Generacion de codigo asistida: el modelo base esta orientado a tareas de codigo; esta version permite integrarlo en pipelines de generacion o revision de parches en ingles y chino.
- Evaluacion comparativa de backends: util para medir throughput y latencia de tt-metal frente a llama.cpp (Q4_K_M) o vLLM sobre el mismo modelo base.
- Educacion y demos de inferencia en NPU: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar el round-trip de los pesos empaquetados, util en cursos o talleres sobre aceleradores alternativos.

## Benchmarks y rendimiento

La model card solo publica metricas de fidelidad de cuantizacion (KL medio frente a BF16 sobre 16.288 posiciones de WikiText-2 test y Wikipedia en coreano, con y sin plantilla de chat):

| Version | Tamano empaquetado (GB) | KL medio vs BF16 |
|---|---|---|
| BF16 (zai-org/GLM-4.7-Flash) | 59,89 | 0 |
| Q4_K_M (llama.cpp) | 18,123 | 0,075853 |
| bfp4 (esta publicacion) | 17,764 | 0,093059 |

El limite de aceptacion declarado es 1,5 veces el KL de Q4_K_M; bfp4 queda por debajo (0,093 < 0,114). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 18 GB para la carpeta `bfp4/` empaquetada; en carga con Transformers en bf16 el consumo es mayor (no disponible con precision).
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumo, RTX 4090 (24 GB) es la opcion mas ajustada.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con margen limitado; en GPUs de 16 GB probablemente no.
- NPUs soportadas: Tenstorrent Wormhole y Blackhole (nucleos Tensix) mediante tt-metal/ttnn.
- Opciones de despliegue: Transformers >= 5.22.2 (GPU/CPU), tt-metal/ttnn (NPU), llama.cpp con la version Q4_K_M del modelo base como alternativa. No se documenta soporte de vLLM, TGI u Ollama para esta carpeta concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| GLM-4.7-Flash-Tenstorrent-Tensix (esta ficha) | no disponible | no disponible | bfloat4_b + bf16/fp32 | MIT | Tenstorrent Wormhole/Blackhole, GPU |
| zai-org/GLM-4.7-Flash (BF16) | no disponible | no disponible | BF16 | MIT | GPU |
| GLM-4.7-Flash Q4_K_M (llama.cpp) | no disponible | no disponible | Q4_K_M | MIT | CPU/GPU |

No se dispone de datos de parametros ni contexto del modelo base en la informacion proporcionada, por lo que la comparativa se limita a formato y hardware.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el castellano no esta declarado como soportado.
- La cuantizacion a 4 bits introduce degradacion (KL medio 0,093 frente a BF16), superior a la de Q4_K_M (0,0759); puede afectar a tareas sensibles a precision.
- El modelo base puede alucinar y presentar sesgos; no se documentan evaluaciones de seguridad ni de sesgo en la informacion disponible.
- La licencia MIT se declara a partir de la model card original, pero el repositorio original no incluye fichero LICENSE; se anade uno canonico junto con NOTICE que identifica la revision fuente.
- Los scripts `pack_tensix.py` y `verify_grid.py` estan bajo Apache-2.0, distinta de la licencia MIT de los pesos.
- El layout de pesos requiere reordenacion especifica de `q_b_proj` y `kv_a_proj_with_mqa` antes del empaquetado; usar los pesos sin respetar ese orden produce resultados incorrectos.
- No se documenta soporte de tool calling, agentes ni vision en esta version.
- Para produccion en GPU conviene validar el comportamiento con Transformers >= 5.22.2; versiones anteriores pueden no cargar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/GLM-4.7-Flash-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Repositorio de codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de la familia GLM-4.5: https://arxiv.org/abs/2508.06471
- Revision del modelo base referenciada: https://huggingface.co/zai-org/GLM-4.7-Flash/tree/7dd20894a642a0aa287e9827cb1a1f7f91386b67
