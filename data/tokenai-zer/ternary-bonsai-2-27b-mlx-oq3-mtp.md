# TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ3-mtp

## Resumen

Ternary-Bonsai-2-27B-MLX-oQ3-mtp es una cuantizacion mixta de 3,70 bits por peso (oQ3) del modelo ternario prism-ml/Ternary-Bonsai-2-27B, publicada por el usuario TokenAI-zer. Parte de Qwen/Qwen3.8-27B, un VLM de 27B con atencion hibrida, que Prism ML ternarizo a 1,72 bpw mediante kernels propios con rotacion de Hadamard por bloques aplicada en linea. Esta build concreta rehace la cuantizacion con las herramientas estandar de MLX y conserva dos piezas que la conversion oficial a MLX pierde: la torre de vision y una cabeza de prediccion multi-token (MTP).

El modelo tiene 27.781.427.952 parametros y ocupa 12,91 GiB en disco (13,86 GB) repartidos en 3 shards. La innovacion principal es doble. Por un lado, demuestra que un modelo ternario sigue beneficiandose de mas bits: la cuantizacion afin construye su rejilla a partir del minimo y el maximo del grupo, y con 4 niveles sobre un grupo simetrico {−a, 0, +a} el cero no es representable, cuando el cero es el valor mas frecuente en un tensor ternario. Por otro, injerta 15 tensores (0,42 B de parametros) de la cabeza MTP de Qwen/Qwen3.8-27B para habilitar decodificacion especulativa autoinducida.

Es relevante ahora porque permite ejecutar un VLM de 27B con vision en Apple Silicon con hardware de consumo de gama alta, sin depender del runtime propietario de Prism ML, usando oMLX o mlx-vlm sin modificar. La licencia Apache 2.0 facilita su uso comercial, aunque sigue siendo un modelo de autor individual sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (familia Qwen3), torre de vision y cabeza MTP injertada; no es MoE |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ3 a 3,70 bpw en esta build; la familia incluye oQ2 (3,00), oQ4 (4,70), oQ6 (6,70) y oQ8 (8,50) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); no es GGUF |
| Tamano en disco | 12,91 GiB (13,86 GB) en 3 shards |
| Tamano del repositorio | 13,9 GB |
| Biblioteca | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La cadena de procedencia tiene cuatro pasos verificables. Primero, Qwen/Qwen3.8-27B, el VLM original de 27B con atencion hibrida y licencia Apache 2.0. Segundo, prism-ml/Ternary-Bonsai-2-27B, su ternarizacion a 1,72 bpw con rotacion de Hadamard por bloques aplicada en linea por kernels propios de llama.cpp. Tercero, esta cuantizacion oQ3 realizada con oMLX 0.6.4 sobre un Apple M5 Max de 128 GB, que abandona los kernels personalizados y usa la cuantizacion estandar de MLX para poder ejecutarse en runtimes sin modificar. Cuarto, el injerto de 15 tensores `mtp.*` procedentes de Qwen/Qwen3.8-27B, sin modificar, que aportan 0,42 B de parametros.

La cabeza MTP es lo que habilita la decodificacion especulativa autoinducida: el modelo propone varios tokens por ciclo y el backbone los verifica. Como la cabeza se entreno contra estados ocultos en precision completa y ahora lee estados ternarizados, su tasa de aceptacion es inferior a la nativa (~74% en la misma configuracion segun el autor). La torre de vision, con 333 tensores, se mantiene intacta en BF16, de modo que las capacidades multimodales no pasan por la cuantizacion ternaria. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO: el autor solo publica el proceso de cuantizacion, no un entrenamiento nuevo.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con la torre de vision en BF16 intacta.
- Razonamiento y generacion de codigo, heredados del backbone Qwen3 de 27B (sin benchmarks publicados que lo cuantifiquen).
- Decodificacion especulativa autoinducida mediante la cabeza MTP injertada, con tasas de aceptacion medidas entre el 44,5% y el 67,4% segun la longitud de generacion.
- Inferencia en Apple Silicon con memoria unificada, sin GPU discreta.
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada (la model card no lo menciona).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente local de vision sobre documentos: el modelo acepta imagen y texto, por lo que se puede usar para extraer y comentar contenido de capturas, diagramas o facturas directamente en un Mac, sin enviar datos a un servicio externo.
- Chat de larga duracion en estacion de trabajo Apple Silicon: con 12,91 GiB de pesos y memoria unificada de 128 GB, es viable mantener sesiones extensas, teniendo en cuenta que el propio autor advierte que el contexto largo consume mas memoria.
- Analisis de imagenes en flujos de investigacion: al ser Apache 2.0 y ejecutarse en local con `mlx-vlm`, encaja en pipelines donde no se permite subir imagenes a la nube.
- Prototipado de decodificacion especulativa: sirve como banco de pruebas para medir el rendimiento real de una cabeza MTP injertada sobre un backbone ternarizado, con metricas de tokens por ciclo ya publicadas.
- Evaluacion de tecnicas de cuantizacion mixta: la tabla de divergencia KL frente al bf16 de referencia permite comparar variantes oQ2/oQ3/oQ4/oQ6/oQ8 y elegir el punto de la curva tamano-fidelidad adecuado para cada experimento.
- Despliegue de un servidor OpenAI-compatible local: mediante `omlx serve --model-dir` se expone en un puerto y se puede integrar en herramientas que esperan una API HTTP, con `mtp_enabled` activado para acelerar.
- Generacion de codigo asistida en un Mac de gama alta: el modelo puede resolver tareas de programacion en local, aunque sin benchmarks publicados conviene validar la calidad frente a alternativas antes de usarlo en produccion.
- Investigacion sobre modelos ternarios: con 27,78 B de parametros en 12,91 GiB, es un caso de estudio util para medir cuanto pierde realmente un modelo ternario al recuantizarse con herramientas estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K). El autor solo publica metricas de fidelidad de cuantizacion y de aceptacion del MTP.

Fidelidad de la cuantizacion, medida como divergencia KL de los logits de ultimo token frente a la conversion bf16 de referencia, sobre cinco prompts con decodificacion greedy:

| Build | bpw | En disco | Shards | KL(bf16‖q) | Error rel. maximo | Top-1 | Top-5 |
|---|---|---|---|---|---|---|---|
| oQ2 | 3,00 | 10,83 GiB | 3 | 0,37658 | 0,2472 | 4/5 | 16/25 |
| oQ3 (esta) | 3,70 | 12,91 GiB | 3 | 0,03478 | 0,1077 | 5/5 | 21/25 |
| oQ4 | 4,70 | 15,85 GiB | 4 | 0,01476 | 0,0519 | 5/5 | 23/25 |
| oQ6 | 6,70 | 22,09 GiB | 5 | 0,00074 | 0,0164 | 5/5 | 24/25 |
| oQ8 | 8,50 | 27,94 GiB | 6 | 0,00008 | 0,0083 | 5/5 | 25/25 |

Rendimiento del MTP, medido en oMLX sobre la build oQ6:

| Tokens generados | Borradores aceptados | Tokens/ciclo |
|---|---|---|
| 57 | 31/46 (67,4%) | 2,38 |
| 175 | 57/128 (44,5%) | 1,51 |
| 470 | 178/364 (48,9%) | 1,62 |

Rendimiento extremo a extremo en la misma maquina: entre 13,1 y 13,4 tok/s sin MTP, y entre 15,9 y 23,9 tok/s con MTP activado; la ejecucion mas larga alcanzo 23,9 tok/s frente a 13,1 de una ejecucion comparable sin MTP, aproximadamente 1,8x.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con macOS 15 o superior. Construido y probado en un M5 Max con 128 GB de memoria unificada.
- Memoria: unos 12,91 GiB de memoria unificada libre para un prompt corto; el propio autor indica que se necesita mas para contexto largo.
- GPU: no aplica a GPU discretas. El formato MLX no carga en CUDA; no se puede usar A100, H100 ni RTX 4090.
- GPU de consumo: no aplica en el sentido habitual; el equivalente es un Mac con memoria unificada suficiente, como un M-series con 16-32 GB para prompts cortos y mas margen para contexto extenso.
- Runtime: oMLX 0.6.4 o superior para la decodificacion especulativa con MTP, o `mlx-vlm` 0.7 o superior para inferencia simple.
- Despliegue: `omlx serve --model-dir ~/.omlx/models --port 8000`. No es compatible con llama.cpp, Ollama ni LM Studio, porque el formato es safetensors de MLX y no GGUF.
- Throughput: 13,1-13,4 tok/s sin MTP y 15,9-23,9 tok/s con MTP activado en un M5 Max. La tasa de aceptacion del MTP baja del 67,4% en generaciones de 57 tokens al 44,5-48,9% en generaciones de 175-470 tokens.
- Nota de configuracion: si se usa oMLX hay que activar `mtp_enabled` en los ajustes del modelo; en caso contrario la cabeza se carga en memoria pero la ruta especulativa nunca se ejecuta y solo se paga el coste de los pesos extra.

## Comparativa con modelos similares

| Modelo | Parametros | bpw / formato | Vision | MTP | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-MLX-oQ3-mtp (esta build) | 27,78 B | 3,70 bpw, safetensors MLX | Si, en BF16 | Si, injertada (0,42 B) | Apache 2.0 | 12,91 GiB, oMLX o mlx-vlm |
| Ternary-Bonsai-2-27B-MLX-oQ2-mtp | 27,78 B | 3,00 bpw, safetensors MLX | Si | Si | Apache 2.0 | 10,83 GiB, unica build que invierte un top-1 |
| Ternary-Bonsai-2-27B-MLX-oQ8-mtp | 27,78 B | 8,50 bpw, safetensors MLX | Si | Si | Apache 2.0 | 27,94 GiB, practicamente indistinguible de bf16 |
| prism-ml/Ternary-Bonsai-2-27B-gguf | no disponible | 1,72 bpw, GGUF | no disponible | No | Apache 2.0 | Requiere kernels propios de llama.cpp |
| Conversion oficial a MLX de prism-ml | no disponible | no disponible | No | No | Apache 2.0 | Requiere el runtime propio de Prism ML |

Frente a modelos de otras familias del mismo tamano, como otros VLM de ~27B en precision completa o en cuantizacion estandar, no se dispone de datos comparativos de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- No hay ningun benchmark de calidad publicados (MMLU, HumanEval, GSM8K u otros). Solo existen metricas de fidelidad de cuantizacion y de aceptacion del MTP.
- La referencia usada para medir la perdida de fidelidad es la conversion a bf16, no el GGUF original. Cualquier error introducido en esa conversion se heredaria en todas las builds y no aparecerian en la tabla.
- La cuantizacion afin no puede representar el cero sobre un grupo ternario simetrico, y el cero es el valor mas frecuente en un tensor ternario. Es una perdida estructural, no un artefacto de medicion.
- La build oQ2 invierte una prediccion top-1 en la muestra de cinco prompts; el autor la describe explicitamente como la opcion para ahorrar memoria, no como una ganga sin coste.
- La cabeza MTP procede de un modelo en precision completa y ahora lee estados ocultos ternarizados. Acepta aproximadamente un 74% en la version nativa frente al 44,5-67,4% medido aqui; el injerto funciona, pero con eficiencia reducida.
- El autor declara no estar afiliado a Prism ML, pipenetwork ni Alibaba Cloud. Es una publicacion individual, sin proceso de revision aparente, con 0 descargas y 0 likes en el momento de la consulta.
- Compatibilidad restringida: no carga en llama.cpp, Ollama ni LM Studio. Solo funciona en Apple Silicon con oMLX o mlx-vlm.
- Idioma y sesgos: no disponible. La model card no documenta la composicion linguistica ni evaluaciones de sesgo.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad factual publicadas.
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene verificar la cadena completa (Qwen, Prism ML, TokenAI-zer) antes de desplegar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ3-mtp
- Variante oQ2: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ2-mtp
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variantes oQ4, oQ6 y oQ8: enlazadas desde la tabla de la model card, en el mismo espacio de nombres TokenAI-zer (URLs completas no incluidas en la informacion proporcionada)
- oMLX: runtime requerido para el modo MTP, no se proporciona URL en la informacion disponible
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm (referencia habitual del ecosistema, no citada explicitamente en la model card)
