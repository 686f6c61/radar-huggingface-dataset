# vinello28/Tunatron-3-Nano-4B-NVFP4

## Resumen

Tunatron-3-Nano-4B-NVFP4 es un ajuste fino del modelo NVIDIA Nemotron-3 Nano 4B (a traves del checkpoint intermedio `unsloth/NVIDIA-Nemotron-3-Nano-4B`) especializado en el triaje de hallazgos de herramientas SAST (static application security testing). Dado un identificador CWE, un sink candidato y la porcion de codigo hacia atras que llega a ese sink, el modelo decide si el hallazgo es realmente una vulnerabilidad y devuelve un objeto JSON con un esquema fijo (`vulnerable`, `vex_status`, `severity`, `reasoning`, `suggested_fix`). El autor es `vinello28` y el modelo esta pensado como ayuda al revisor humano, no como sustituto del motor SAST.

El modelo hereda del Nemotron 3 Nano 4B su arquitectura hibrida (familia `nemotron_h`), con 3.973.556.832 parametros totales segun los pesos en safetensors. El ajuste se realizo con DoRA (rank 64, alpha 64) sobre las proyecciones de atencion y MLP, con 2 epocas y 5.985 ejemplos de entrenamiento. El repositorio distribuye tres variantes de pesos: BF16, FP8 W8A8 y NVFP4, esta ultima optimizada para los Tensor Cores de las GPU Blackwell.

La relevancia practica del modelo esta en su nicho: un triaje automatico de falsos positivos SAST en C, C++ y Python, con salida estructurada y razonamiento en italiano. La variante NVFP4 reduce el peso de los pesos a 3,4 GiB en VRAM y alcanza 1.543,7 tok/s de throughput en la GPU de referencia, lo que lo hace desplegable en hardware Blackwell de gama profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hibrida, familia `nemotron_h` (transformer hibrido con componentes de estado; derivada de Nemotron Nano 9B v2 mediante poda y destilacion) |
| Parametros totales | 3.973.556.832 (aprox. 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; entrenamiento con max sequence length de 8192 tokens |
| Tipos de cuantizacion | BF16, FP8 W8A8 con KV cache FP8, NVFP4 (MIXED_PRECISION), todas via NVIDIA ModelOpt |
| Idiomas soportados | italiano (prompt de sistema y campos `reasoning`/`suggested_fix`) e ingles |
| Licencia | other (remite a la licencia del modelo base) |
| Formato de pesos | safetensors (carpetas `model_bf16/`, `model_fp8/`, `model_nvfp4/` y `adapter/`) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron-3 Nano 4B, un modelo hibrido de la familia `nemotron_h` podado y destilado desde Nemotron Nano 9B v2 mediante el framework Nemotron Elastic, segun el blog de NVIDIA. Sobre esa base, el autor aplico un ajuste fino con DoRA (rank 64, alpha 64) restringido a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `up_proj`, `down_proj` e `in_proj` de los modulos de atencion, mixer, MLP y feed-forward, excluyendo explicitamente modulos de vision, codecs de audio y tokenizadores acusticos. El optimizador fue `adamw_8bit` con learning rate 0,0002, schedule coseno, warmup ratio 0,03, 2 epocas, batch efectivo de 8 y semilla 3407. El entrenamiento se ejecuto en una NVIDIA RTX PRO 6000 Blackwell Server Edition (97.887 MiB) y duro 1 hora y 4 minutos.

Los datos de entrenamiento suman 5.985 ejemplos (3.325 vulnerables y 2.660 no vulnerables), con validacion de 402 y test de 3.266 ejemplos. Las fuentes son secvuleval (2.553), primevul (1.492), juliet (1.125), cvefixes-python (419), codeql-tests (243) y pyvul (153). Por lenguaje, el entrenamiento se compone de C (4.263), C++ (1.084) y Python (638). Tanto los prompts como las justificaciones objetivo estan en italiano. La perdida de entrenamiento registrada fue 0,0435 en la epoca 1,989 y la de validacion 0,1949 en la epoca 2.

## Capacidades

- Clasificacion de vulnerabilidad de un sink candidato dado un identificador CWE y una porcion de codigo hacia atras numerada.
- Generacion de hallazgos en JSON con esquema fijo: `vulnerable`, `vex_status`, `severity`, `reasoning` y `suggested_fix`.
- Razonamiento explicito en italiano sobre la causa de la vulnerabilidad o su descarte.
- Sugerencia de correccion (`suggested_fix`) en italiano.
- Analisis de codigo en C, C++ y Python.
- Salida estructurada compatible con decodificacion guiada por JSON schema.
- Modo thinking desactivable (la evaluacion se realizo con thinking desactivado).
- Soporte de despliegue en vLLM y endpoints compatibles segun los tags del repositorio.

## Casos de uso

- Triaje de falsos positivos en pipelines SAST: el modelo recibe el hallazgo crudo del motor (regla CWE, sink y slice) y devuelve una decision binaria con justificacion, reduciendo la cola de revision manual. Adecuado porque su salida es JSON validable y su latencia media en NVFP4 es de 1,37 s bajo concurrencia 8.
- Priorizacion por severidad en gestion de vulnerabilidades: el campo `severity` permite ordenar los hallazgos antes de que lleguen al equipo de seguridad, usando el modelo como primer filtro.
- Generacion de propuestas de parche: el campo `suggested_fix` sirve como borrador para el revisor, que valida la correccion antes de aplicarla en el codigo.
- Enriquecimiento de informes VEX: el campo `vex_status` encaja en flujos de notificacion de explotabilidad de vulnerabilidades, aportando una clasificacion automatica por hallazgo.
- Revision de codigo en CI/CD: integrado como paso previo al merge, el modelo puede marcar hallazgos dudosos en C, C++ y Python y bloquear solo los casos con alta confianza.
- Auditoria de codigo heredado: sobre funciones aisladas de proyectos antiguos, el modelo analiza slices acotados y ayuda a documentar que hallazgos son reales sin requerir ejecucion del codigo.
- Formacion de equipos de seguridad: las justificaciones en italiano sirven como material didactico para explicar por que un sink es o no explotable.

## Benchmarks y rendimiento

Evaluacion de calidad sobre `data/test.jsonl` (200 ejemplos por formato, temperatura 0, decodificacion guiada por JSON schema, thinking desactivado; la clase positiva es "vulnerable" y una salida invalida cuenta como "no vulnerable"):

| Formato | Precision | Recall | F1 | FPR | Salidas invalidas | Ejemplos |
|---|---|---|---|---|---|---|
| bf16 | 0,604 | 0,744 | 0,667 | 0,311 | 8 | 200 |
| fp8 | 0,632 | 0,769 | 0,694 | 0,287 | 9 | 200 |
| nvfp4 | 0,608 | 0,795 | 0,689 | 0,328 | 8 | 200 |

Rendimiento y eficiencia (una ejecucion en NVIDIA RTX PRO 6000 Blackwell Server Edition, 97.887 MiB, vLLM 0.33.0, concurrencia 8):

| Formato | Latencia media (s) | p50 (s) | p95 (s) | Throughput (tok/s) | Pesos en VRAM (GiB) | KV cache (tokens) | VRAM pico (GB) | Disco (GB) |
|---|---|---|---|---|---|---|---|---|
| bf16 | 1,97 | 1,57 | 4,92 | 1011,6 | 7,5 | 1.373.828 | 77,0 | 8,0 |
| fp8 | 1,57 | 1,25 | 3,66 | 1294,9 | 5,0 | 1.650.153 | 79,7 | 5,3 |
| nvfp4 | 1,37 | 1,11 | 3,07 | 1543,7 | 3,4 | 1.453.624 | 77,5 | 3,6 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM de pesos: 7,5 GiB en BF16, 5,0 GiB en FP8 y 3,4 GiB en NVFP4.
- VRAM pico medida en la GPU de referencia: 77,0 GB (bf16), 79,7 GB (fp8) y 77,5 GB (nvfp4), con concurrencia 8 y KV cache de aproximadamente 1,4-1,65 millones de tokens.
- GPU de referencia del autor: NVIDIA RTX PRO 6000 Blackwell Server Edition (97.887 MiB), necesaria para NVFP4 por sus Tensor Cores.
- GPU recomendadas: RTX PRO 6000 Blackwell para NVFP4; A100/H100 para BF16 y FP8; en consumer, una RTX 4090 (24 GB) cubre los pesos en cualquiera de los tres formatos, aunque el KV cache y el contexto de 8.192 tokens condicionan el lote maximo.
- Opciones de despliegue: vLLM 0.33.0 (usado en la evaluacion), transformers con `trust_remote_code` (el modelo usa `custom_code` y arquitectura `nemotron_h`); no se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput medidos: 1,37 s de latencia media y 1.543,7 tok/s en NVFP4 bajo concurrencia 8; 1,57 s y 1.294,9 tok/s en FP8; 1,97 s y 1.011,6 tok/s en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tunatron-3-Nano-4B-NVFP4 | 3,97B | no disponible (entrenado a 8.192) | Triaje SAST especializado | other | Hugging Face, 0 descargas |
| NVIDIA Nemotron-3 Nano 4B (base) | aprox. 4B | no disponible | Proposito general, razonamiento hibrido | no disponible | Hugging Face (blog NVIDIA) |
| Nemotron Nano 9B v2 (origen del base) | aprox. 9B | no disponible | Proposito general, razonamiento hibrido | no disponible | Hugging Face |

La comparativa con modelos especializados en triaje SAST no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Esta pensado como ayuda al revisor humano, no como sustituto de un motor SAST ni de una revision de seguridad completa.
- Espera el formato de prompt del proyecto (regla CWE, sink candidato y slice hacia atras numerado); otros estilos de prompt no han sido evaluados.
- Entrenado y evaluado solo con funciones en C, C++ y Python de conjuntos publicos de vulnerabilidades; los resultados pueden no transferirse a otros lenguajes ni a codigo propietario.
- El prompt de sistema y los campos `reasoning` y `suggested_fix` estan en italiano, lo que limita su uso directo en equipos no italoparlantes.
- Tasa de falsos positivos del 28,7-32,8 % segun formato y entre 8 y 9 salidas invalidas por cada 200 ejemplos; una salida invalida se cuenta como "no vulnerable", lo que puede ocultar falsos negativos.
- Licencia "other" que remite a la del modelo base; es necesario revisar los terminos del modelo base antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- No se han publicado resultados en benchmarks generales de razonamiento o codigo, solo la evaluacion especifica de triaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinello28/Tunatron-3-Nano-4B-NVFP4
- Modelo base intermedio: https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-4B
- Blog de NVIDIA sobre Nemotron 3 Nano 4B: https://huggingface.co/blog/nvidia/nemotron-3-nano-4b
- Codigo de entrenamiento: https://github.com/BlockchainzGurus/tunatron.git (commit 04ca38edae3fd8c5066b314af09d098dc1d9e7f0)
- Tutorial de despliegue local: https://aiindigo.com/tutorials/getting-started-with-nvidia-nemotron-3-nano-4b-local-deployment-guide
