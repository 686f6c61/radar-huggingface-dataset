# underlotus/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ3h-mtp

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ3h-mtp es una cuantizacion de precision mixta del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un fine-tune "uncensored" (sin alineamiento de rechazo) del base Qwen/Qwen3.8-27B. La publica el usuario underlotus mediante la herramienta oMLX v0.8.0 y esta pensada especificamente para ejecucion en Apple Silicon a traves de la libreria MLX, no para GPUs NVIDIA ni para el ecosistema habitual de transformers/vLLM.

El modelo original declara 27.780 millones de parametros, pero el repositorio cuantizado almacena 6.276.813.040 elementos en safetensors (14,4 GB en total), con un esquema de cuantizacion mixta oQh (variante rotada de oQe) que combina capas en 4 bits, 6 bits, BF16 y empaquetados U32. Conserva la torre de vision y la cabeza MTP (multi-token prediction), de modo que mantiene entrada image-text-to-text y decodificacion especulativa.

Su relevancia es de nicho: ofrece un modelo de gran tamano y sin censura alineado con la filosofia de los fine-tunes de DavidAU, empaquetado para caber en memoria unificada de Macs con 16-32 GB, algo que el modelo original en BF16 no permite. La licencia es Apache 2.0, heredada del upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5/Qwen3.8) con torre de vision y cabeza MTP; cuantizacion mixta oQh |
| Parametros totales | 27.780 millones (modelo original); 6.276.813.040 elementos almacenados en el repo cuantizado |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQh: affine 4-bit grupo 64 (26,19 % de elementos), affine 6-bit grupo 64 (20,26 %), BF16 (8,33 %), U32 empaquetado (45,22 %); media de 18,3 bits por elemento almacenado |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen3.8 con 27.780 millones de parametros, al que se anade una torre de vision (0,461B elementos almacenados, 0,921 GB) y una cabeza MTP de prediccion multi-token (0,425B elementos, 0,314 GB). El fine-tune "Heretic Uncensored" de DavidAU elimina el comportamiento de rechazo del modelo base, orientandolo a generacion sin filtros de seguridad. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en el fine-tune.

La innovacion tecnica de esta ficha es la cuantizacion: oQh es la variante rotada de oQe, que aplica una rotacion a los pesos del decoder antes de cuantizarlos para reducir el error al mismo tamano de fichero que oQe en el mismo nivel. El esquema es de precision mixta real: capas sensibles en 6 bits y BF16, el grueso del modelo empaquetado en U32 y bloques en 4 bits. Se preservan explicitamente la torre de vision y la cabeza MTP, por lo que la decodificacion especulativa del modelo original sigue operativa. El desglose de almacenamiento es 13,123 GB para el modelo de lenguaje, 0,921 GB para vision y 0,314 GB para la cabeza MTP.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Entrada image-text-to-text: la torre de vision se conserva en la cuantizacion, por lo que admite imagenes como entrada.
- Decodificacion especulativa mediante la cabeza MTP preservada (multi-token prediction).
- Generacion sin alineamiento de rechazo (uncensored): no aplica filtros de contenido del modelo base.
- Razonamiento y generacion de codigo heredados del base Qwen3.8 (no verificados en esta cuantizacion).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues limitadas a en y zh segun la model card.

## Casos de uso

- Investigacion sobre alineamiento y censura: permite estudiar el comportamiento de un modelo sin rechazo frente a su base alineado, comparando respuestas en el mismo prompt y con la misma arquitectura.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa adulta donde el modelo base rechazaria peticiones; el fine-tune Heretic elimina ese filtro.
- Prototipado local en Apple Silicon: desarrollo y pruebas de aplicaciones LLM en un Mac con memoria unificada, sin depender de GPUs en la nube, gracias a los 13,37 GiB de pesos.
- Procesamiento de imagenes y texto en local: clasificacion, descripcion o extraccion de informacion de imagenes combinadas con instrucciones de texto, aprovechando la torre de vision preservada.
- Evaluacion de cuantizacion: banco de pruebas para medir la degradacion de un modelo de 27B cuantizado a oQh frente al BF16 original en tareas de razonamiento y generacion.
- Traduccion y conversacion en ingles y chino: asistente bilingue para pares en-zh en entornos donde no se requiere alineamiento estricto.
- Generacion de codigo asistida en local: uso como autocompletado o generador de fragmentos en un IDE sobre macOS, siempre que se valide la calidad del fine-tune en esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 13,37 GiB de pesos en disco; en ejecucion se necesita memoria unificada adicional para el contexto KV. Estimacion practica: 16 GB de memoria unificada como minimo, 24-32 GB recomendable para contextos largos.
- GPU: disenado para Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra). No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: si, en Macs con memoria unificada de 16 GB o superior; no en GPUs NVIDIA de consumo por incompatibilidad de formato y kernels.
- Despliegue: exclusivamente mediante oMLX (app de macOS) o la CLI `omlx serve`; usa kernels nativos incluidos en la app. No se declara soporte para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ3h-mtp (este) | 27,78B (6,28B elementos almacenados) | no disponible | MLX / oMLX | Apache 2.0 | Hugging Face, 177 descargas |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (upstream) | 27,78B | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27,78B | no disponible | safetensors | Apache 2.0 | Hugging Face |

La diferencia principal frente a sus dos predecesores es el tamano en disco (13,37 GiB frente a los aproximadamente 55 GB en BF16 del modelo de 27B) y el runtime: solo MLX/oMLX. El upstream mantiene el alineamiento eliminado y el modelo base conserva la censura original.

## Limitaciones y advertencias

- Modelo uncensored: no aplica filtros de rechazo, por lo que puede generar contenido danino, ilegal o sexualmente explicito. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: inherente a los modelos de 27B y potencialmente agravado por la cuantizacion mixta a 4-6 bits en parte de las capas.
- Solo ingles y chino declarados; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Compatibilidad restringida: requiere MLX y, para los kernels oQh, la app oMLX en macOS. No funciona en Linux, Windows ni CUDA sin conversion previa.
- Contexto maximo no documentado en la model card; conviene validarlo empiricamente antes de usarlo con ventanas largas.
- Fine-tune de terceros sobre un base de terceros: la calidad y estabilidad del ajuste no estan avaladas por Alibaba/Qwen.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incumplir normativa local (por ejemplo, en la UE) y las condiciones de las plataformas de distribucion.
- Solo 177 descargas y 0 likes: ecosistema minimo, poca validacion comunitaria y riesgo de errores no detectados en la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/underlotus/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ3h-mtp
- Modelo upstream: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oMLX: https://github.com/jundot/omlx
- Release oMLX v0.8.0: https://github.com/jundot/omlx/releases/tag/v0.8.0
- Documentacion de cuantizacion oQ/oQh: https://github.com/jundot/omlx/blob/v0.8.0/docs/oQ_Quantization.md#oqh
