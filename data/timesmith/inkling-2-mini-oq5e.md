# timesmith/Inkling-2-Mini-oQ5e

## Resumen

Inkling-2-Mini-oQ5e es una cuantizacion mixta del modelo multimodal Inkling-2-Mini, publicada por el usuario timesmith en Hugging Face. El checkpoint resultante ocupa 17,4 GB y contiene 26.388.646.400 parametros en el modelo de lenguaje, a los que se suman unos 318 millones en el codificador de vision, para un total logico de 26.707 millones de parametros. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.8.3), que aplica precision mixta por tensor en lugar de un unico esquema uniforme.

El resultado es un checkpoint con un promedio efectivo de 5,199 bits por peso, lo que reduce el almacenamiento a 16,165 GiB manteniendo en BF16 o FP32 las capas consideradas mas sensibles. La distribucion combina NVFP4 (grupo 16) para el 76,3 % de los pesos, affine 5-bit (grupo 64) para el 15,3 %, affine 8-bit (grupo 64) para el 5,9 % y BF16/FP32 para el 2,5 % restante.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion mixta poco habitual en modelos de ~26B con componente visual; por otro, el formato esta pensado para MLX, la libreria de Apple, lo que condiciona su despliegue a hardware Apple Silicon. La model card no aporta informacion sobre el modelo base, el entrenamiento, los idiomas ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `inkling2_loop` sugiere una variante con bucles, sin confirmar) |
| Parametros totales | 26.388.646.400 (lenguaje) + 0.318B (vision) = 26.707B logicos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 grupo 16, affine 5-bit grupo 64, affine 8-bit grupo 64, BF16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 17,4 GB en repo |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El tag `inkling2_loop` apunta a una posible variante con capas recurrentes o bucles de computo, pero no hay confirmacion tecnica. La presencia de un modulo de vision de 0,318B parametros indica que se trata de un modelo multimodal con codificador visual integrado.

Lo que si esta documentado es el proceso de cuantizacion. Se uso oQ (oMLX v0.8.3), que asigna precision por tensor segun su sensibilidad: el grueso de los pesos (20,384B) se almacena en NVFP4 con grupo de 16, un formato de 4 bits con escala compartida por bloques pequenos; 4,077B pesos quedan en affine 5-bit con grupo 64; 1,572B en affine 8-bit; y 0,637B en BF16 mas 0,036B en FP32. Esta estratificacion busca preservar la calidad en capas criticas (probablemente embeddings, normalizaciones o cabezas de atencion) sin disparar el tamano total.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de tipo causal para lenguaje, aunque no se detallan capacidades especificas.
- Vision: incluye un codificador visual de 0,318B parametros, por lo que se espera soporte de entrada de imagenes.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamano de 17,4 GB permiten ejecutar el modelo en equipos con 24-32 GB de memoria unificada, algo inviable con el checkpoint original en BF16 (~53 GB).
- Prototipado de aplicaciones multimodales en escritorio: al incluir vision, se puede usar para tareas de descripcion de imagenes o respuesta a preguntas visuales en un portatil, sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion mixta: sirve como referencia practica para comparar la perdida de calidad de oQ frente a esquemas uniformes de 4 o 5 bits.
- Investigacion sobre modelos con bucles o recurrencia: si el tag `inkling2_loop` refleja una arquitectura con iteraciones internas, el checkpoint permite estudiar su comportamiento en hardware de consumo.
- Despliegue en entornos con restricciones de memoria: 16,165 GiB de pesos dejan margen para el KV cache en equipos de 32 GB, util para sesiones de chat con contexto moderado.
- Fine-tuning ligero o adaptadores sobre la version cuantizada: aunque limitado, permite experimentar con LoRA en MLX sobre un modelo de 26B sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 17,4 GB solo para los pesos; con overhead de MLX y KV cache, se recomienda 24 GB como minimo y 32 GB para contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max) por el formato MLX. No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: si, en Mac con memoria unificada de 24 GB o superior; no en GPUs NVIDIA de consumo por falta de soporte MLX.
- Opciones de despliegue: MLX (libreria `mlx`), oMLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ5e | 26,7B | no disponible | MLX safetensors 5,2 bits | no disponible | Apple Silicon |
| Modelo base Inkling-2-Mini (BF16) | 26,7B | no disponible | safetensors BF16 | no disponible | GPU con ~53 GB |
| Cuantizaciones GGUF equivalentes (Q5_K_M) | ~26B | no disponible | GGUF | depende del base | CPU/GPU via llama.cpp |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion mixta a 5,199 bits introduce perdida de calidad respecto al modelo original; no se documenta la degradacion medida.
- El uso de NVFP4 en el 76 % de los pesos puede afectar especialmente a tareas de precision numerica o razonamiento matematico.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial.
- No se especifican los idiomas soportados ni el contexto maximo, datos criticos para produccion.
- El formato MLX limita el despliegue a hardware Apple; no hay versiones GGUF o compatibles con CUDA en este repo.
- Riesgo de alucinacion y sesgos: no documentados por el autor.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; conviene tratar el checkpoint con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/timesmith/Inkling-2-Mini-oQ5e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
