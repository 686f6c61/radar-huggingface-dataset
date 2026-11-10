# umixer/Huihui-Qwen3.8-Flash-Next-ThinkingCap-oq4-mix6-mtp

## Resumen

Huihui-Qwen3.8-Flash-Next-ThinkingCap-oq4-mix6-mtp es una distribucion cuantizada del modelo ThinkingCap-Qwen3.8-Flash-Next, publicado por el usuario umixer. Se trata de un build de precision mixta en formato MLX sobre la arquitectura `qwen4_exp`, que combina mezcla de expertos (MoE), una tabla n-gram PLE y decodificacion especulativa mediante MTP (multi-token prediction). El modelo completo declara 180.000 millones de parametros y 6.000 millones activos por token, con 48 capas y 512 expertos enrutados con top-10.

La particularidad de esta variante es triple: por un lado, aplica la receta de cuantizacion mixta del autor (default global de 6 bits con grupo 64, con 993 overrides por tensor y un patron de sensibilidad en forma de U segun profundidad de capa); por otro, incorpora la supresion de direccion de rechazo ("abliteration") copiada quirurgicamente de la build de huihui-ai, afectando a 96 matrices de salida sin recuantizar el resto de tensores; y finalmente, anade la supresion de 27.640 tokens para evitar salidas en chino simplificado. El resultado declarado es un paquete que ocupa unos 117,5 GiB en disco, con residencia en memoria de 75-76 GB y velocidades de 75-84 tok/s de decodificacion en un Apple Silicon con 128 GB de RAM.

El modelo es relevante para la comunidad que ejecuta modelos grandes en hardware Apple Silicon con MLX, porque demuestra tecnicas de cuantizacion no uniforme (recetas por capa) y de eliminacion de rechazo aplicadas a un modelo MoE de gran tamano, manteniendo supuestamente la calidad del original. La licencia heredada es Qwen Community License 1.0, con lo que las restricciones comerciales del modelo base siguen aplicando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp: MoE + n-gram PLE + MTP; 48 capas, 512 expertos, top-10 enrutados |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | ~6B por token |
| Longitud de contexto | 131.000 tokens (probado) |
| Tipos de cuantizacion | Precision mixta MLX: 8 bits (745 claves), 6 bits (128), 4 bits (120); default global 6 bits g64; bf16 sin cuantizar en normas, routers y torre de vision |
| Idiomas soportados | no disponible (la model card solo menciona supresion de chino simplificado) |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | safetensors (formato MLX), 131 shards |

## Arquitectura y entrenamiento

El modelo base sobre el que se construye es ThinkingCap-Qwen3.8-Flash-Next de bottlecapai, un post-entrenamiento de la familia Qwen 3.8 Flash-Next. La arquitectura es de tipo `qwen4_exp`: un transformer con mezcla de expertos de 512 expertos y top-10 enrutados, 48 capas y aproximadamente 180B parametros totales con 6B activos. Ademas incorpora una tabla n-gram PLE (probablemente una tabla de embeddings por lookup de n-gramas, usada como capa adicional de contexto) y un cabezal MTP (multi-token prediction) de profundidad 3 que permite decodificacion especulativa nativa.

El proceso de construccion es en dos etapas. Primero, ThinkingCap aplica su post-entrenamiento sobre el modelo base (objetivo declarado: reducir el numero de tokens de razonamiento, aproximadamente un 28 % menos que el Flash-Next de referencia, con mediana de 219 tokens de thinking frente a ~280 en MBPP). Despues, umixer cuantiza en MLX con una receta de precision mixta no uniforme: capas de borde (L0-L3 y L44-L47) a 6 bits en los expertos MoE, capas centrales (L4-L43) a 4 bits, 13 capas de atencion completa a 8 bits, 36 capas de atencion lineal con `in_proj` y `out_proj` a 8 bits, expertos compartidos a 8 bits g128, tabla PLE a 6 bits g32 y `embed_tokens`/`lm_head` a 8 bits g64. La distribucion final de bits es 745 claves a 8 bits, 128 a 6 bits y 120 a 4 bits. Por ultimo se aplica la abliteration, que elimina la direccion de rechazo (dimension 2560) de 96 matrices `o_proj`/`out_proj`/`shared_expert.down_proj`, recuantizando en sitio a los bits y tamano de grupo originales. No se reentrena ni se hace RLHF adicional en esta variante; los datos de entrenamiento del modelo base no estan detallados en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y otros idiomas (sin lista explicita).
- Razonamiento con "thinking mode": el modelo genera tokens intermedios de razonamiento, con reduccion declarada de aproximadamente 28 % frente al Flash-Next base.
- Generacion de codigo: validado en MBPP con 89/89 respuestas validas y 100 % de acierto sobre respuestas validas.
- Decodificacion especulativa MTP de profundidad 3, activable en oMLX 0.7.2+ para acelerar la generacion.
- Capacidad de vision declarada: la model card menciona "vision tower" mantenida en bf16, por lo que el modelo parece soportar entrada de imagenes, aunque no se detallan capacidades concretas.
- Abliteration: se ha eliminado la direccion de rechazo en las matrices de salida, con la intencion de reducir las respuestas de negativa del modelo.
- Suppress tokens: el `generation_config.json` incluye 27.640 tokens suprimidos para evitar salidas en chino simplificado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o multi-step reasoning: no documentado explicitamente como funcion dedicada; el thinking mode y el contexto de 131k lo hacen tecnicamente viable, pero no hay confirmacion en la model card.

## Casos de uso

- Asistencia conversacional de contexto largo: con 131.000 tokens de ventana y arquitectura MoE con 6B activos, el modelo puede mantener conversaciones extensas o procesar documentos largos en Mac con 128 GB de RAM, manteniendo latencia moderada gracias a los 6B activos.
- Generacion de codigo asistida en local: el rendimiento en MBPP (89/89 respuestas validas) sugiere utilidad como asistente de programacion en entornos de desarrollo sobre Apple Silicon, sin depender de la nube.
- Prototipado de agentes y razonamiento multi-paso: el modo thinking y la decodificacion especulativa MTP permiten iteraciones rapidas en pipelines agenticos locales donde se prima la independencia de red sobre el throughput bruto.
- Investigacion sobre alineacion y refusal: al estar ablacionada, la variante es util para estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento y a las capacidades del modelo base.
- Experimentacion con cuantizacion mixta: sirve como referencia reproducible de una receta de precision mixta (993 overrides, sensibilidad U-shaped) sobre un MoE de 180B, util para investigadores que disenen sus propias recetas en MLX.
- Traduccion y generacion en chino tradicional: los 27.640 suppress_tokens evitan que el modelo derive hacia caracteres simplificados, lo que lo hace adecuado para tareas que requieran registro tradicional de forma consistente.
- Despliegue en estaciones de trabajo Apple Silicon: al caber en 75-76 GB residentes, se puede ejecutar en un Mac Studio o MacBook Pro con 128 GB de memoria unificada, sin GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MBPP (validacion) | 89/89 respuestas validas, 100 % de acierto sobre validas | Heredado del build ThinkingCap; mediana de 219 tokens de thinking frente a ~280 del baseline (−28 %) |
| Throughput de decodificacion | ~75-84 tok/s | M5 Max 128 GB, oMLX 0.7.2, con MTP activo |
| Memoria residente | ~75-76 GB | Tras carga, en el mismo hardware |
| Contexto probado | 131k tokens | Sin datos de degradacion mas alla |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada: se necesita un host con al menos 128 GB de memoria unificada para cargar el paquete de 117,5 GiB en disco con residencia declarada de 75-76 GB.
- GPU: la model card solo documenta su ejecucion en Apple Silicon (M5 Max con 128 GB). No hay datos de ejecucion en A100, H100 ni RTX 4090, y el formato MLX no es compatible con CUDA sin conversion previa.
- Consumer GPU: no cabe en GPU de consumo con 24 GB (RTX 4090); requeriria una cuantizacion mucho mas agresiva o descarga por capas, no soportada por este paquete.
- Despliegue: requiere oMLX 0.7.2 o posterior, o builds de mlx_vlm que soporten `qwen4_exp` y entradas de cuantizacion mixta por tensor. Ejemplo de carga: `mlx_vlm.load("umixer/Huihui-Qwen3.8-Flash-Next-ThinkingCap-oq4-mix6-mtp")`.
- vLLM, llama.cpp, Ollama o TGI: no disponibles para este paquete, ya que el formato MLX no es directamente compatible y la cuantizacion es especifica de oQ/MLX.
- Latencia y throughput: ~75-84 tok/s de decodificacion con MTP en M5 Max 128 GB; sin datos publicados en otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| umixer/Huihui-Qwen3.8-Flash-Next-ThinkingCap-oq4-mix6-mtp | 180B totales / 6B activos | 131k probado | MLX safetensors, precision mixta (4/6/8 bits) | Qwen Community 1.0 | Hugging Face |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | ~180B totales (heredado) | no disponible | bf16 | Qwen Community 1.0 | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | ~180B totales (heredado) | no disponible | GGUF, cuantizacion estandar | Qwen Community 1.0 | Hugging Face |
| umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp | ~180B totales (heredado) | no disponible | MLX, precision mixta | Qwen Community 1.0 | Hugging Face |

La comparativa directa con modelos de otro linaje (Llama, Mistral, DeepSeek) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: la model card no documenta evaluaciones de sesgo; al derivar de Qwen 3.8, hereda los sesgos del modelo base, no medidos aqui.
- Alucinacion: no se han publicado evaluaciones especificas de factualidad; el modo thinking puede mitigar o exacerbar el problema, pero no hay datos.
- Idiomas: la lista de idiomas no esta disponible; la unica indicacion explicita es la supresion de chino simplificado, lo que puede degradar la calidad en ese idioma.
- Licencia: la Qwen Community License 1.0 impone restricciones (por ejemplo, umbrales de uso comercial y obligaciones de atribucion); es necesario revisar el archivo LICENSE del repositorio antes de un uso en produccion.
- Abliteration: eliminar la direccion de rechazo puede aumentar la probabilidad de respuestas peligrosas o no filtradas; no es adecuado para despliegues orientados a usuarios finales sin capas de seguridad adicionales.
- Formato: solo funciona en MLX (Apple Silicon); no es portable directamente a CUDA ni a ecosistemas vLLM/llama.cpp sin conversion y recuantizacion.
- Memoria: los 75-76 GB residentes implican que no cabe en configuraciones de 64 GB; el hardware minimo practico es un Mac con 128 GB de memoria unificada.
- Validacion limitada: los benchmarks documentados son solo MBPP; no hay MMLU, HumanEval, GSM8K ni evaluaciones multilingues.
- Fechas de la model card: se declaran cirugias el 2026-11-08 y 2026-11-09, en el futuro respecto a la fecha de creacion del repositorio; conviene tratar esas marcas como parte del contenido del autor y no como verificacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umixer/Huihui-Qwen3.8-Flash-Next-ThinkingCap-oq4-mix6-mtp
- Modelo base (ThinkingCap): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Receta de cuantizacion de referencia: https://huggingface.co/umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp
- Fuente de la abliteration (huihui-ai v2 GGUF): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Fuente de la supresion zh-TW: https://huggingface.co/KaedeTai/Qwen3.8-Flash-Next-Uncensored-oQ4e-mtp-zhTW
- oMLX (runtime y cuantizador oQ): https://github.com/jundot/omlx
- Paper de referencia sobre sensibilidad U-shaped (SliderQuant): arXiv:2603.25284
- README en chino tradicional: README_zh.md (en el propio repositorio)
