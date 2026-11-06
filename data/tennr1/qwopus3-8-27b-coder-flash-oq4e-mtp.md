# tennr1/Qwopus3.8-27B-Coder-Flash-oQ4e-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-oQ4e-mtp es una cuantizacion mixta en formato MLX del modelo Qwopus3.8-27B-Coder-Flash, publicada por el usuario tennr1 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una version comprimida del checkpoint original mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantizacion de precision mixta por tensor para reducir el espacio en disco y la memoria necesaria en inferencia sobre hardware Apple Silicon.

El checkpoint conserva 27.781 millones de parametros (27,78 B), de los cuales 26.896 B corresponden al modelo de lenguaje, 0.461 B a un codificador de vision y 0.425 B a una cabeza MTP (multi-token prediction). El peso efectivo medio es de 5,044 bits por peso, con un tamano total de repositorio de 17,5 GB, lo que lo hace viable en equipos con memoria unificada de 24-32 GB.

El modelo base pertenece a la familia Qwen3.5 y esta orientado a tareas de generacion de codigo, segun indica el sufijo "Coder" en el nombre. La etiqueta "mtp" hace referencia a la cabeza de prediccion multi-token, una tecnica de decodificacion especulativa que acelera la generacion. La relevancia actual radica en que permite ejecutar un modelo de ~28 B con capacidades de codigo y vision en portatiles y estaciones Mac, algo impensable con el checkpoint BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeza MTP y torre de vision |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta affine: 4-bit (69,8 %), 5-bit (23,7 %), 6-bit (4,6 %), 8-bit (0,04 %), BF16 (1,86 %); grupo 64 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), 4-bit cuantizado |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 27,78 B de parametros distribuidos en tres componentes: el modelo de lenguaje (26,896 B), una torre de vision (0,461 B) y una cabeza MTP (0,425 B). La presencia de la torre de vision indica que el modelo base es multimodal, capaz de procesar imagenes ademas de texto. La cabeza MTP implementa prediccion multi-token, un mecanismo de decodificacion especulativa que permite proponer varios tokens por paso y verificar su aceptacion, acelerando la generacion en inferencia.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de alineacion. La model card unicamente documenta el proceso de cuantizacion aplicado por oQ (oMLX v0.7.3), que asigna precision variable por tensor: los tensores mas sensibles (probablemente embeddings, capas de atencion y cabeza de salida) reciben 5, 6 u 8 bits, mientras que el grueso de los pesos se almacena en 4 bits con grupo de 64. Los tensores BF16 (0,516 B) corresponden presumiblemente a normas y sesgos que se mantienen en precision completa.

## Capacidades

- Generacion de texto y codigo: el sufijo "Coder" del modelo base sugiere especializacion en tareas de programacion, aunque no se documentan evaluaciones especificas.
- Razonamiento multi-paso: herencia de la familia Qwen3.5, sin datos concretos en la model card.
- Vision: incluye torre de vision de 0,461 B, por lo que el modelo base es multimodal (imagen + texto).
- Decodificacion especulativa: la cabeza MTP permite acelerar la generacion mediante prediccion multi-token.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente: no confirmado en la informacion disponible.
- Multilingue: no disponible.
- Modo thinking: no confirmado en la informacion disponible.

## Casos de uso

- Asistencia de codigo en local sobre Mac: el checkpoint MLX de 17,5 GB cabe en equipos con 24-32 GB de memoria unificada, permitiendo autocompletado y generacion de codigo sin conexion a la nube.
- Prototipado de pipelines multimodales: la torre de vision permite procesar capturas de pantalla, diagramas o documentacion escaneada junto con instrucciones de texto en un unico modelo.
- Generacion acelerada con MTP: la cabeza de prediccion multi-token reduce la latencia por token en tareas de generacion larga, adecuada para asistentes interactivos en tiempo real.
- Desarrollo en entornos con requisitos de privacidad: al ejecutarse localmente en Apple Silicon, no requiere enviar codigo propietario a servicios externos.
- Evaluacion de modelos cuantizados: sirve como referencia para comparar la perdida de calidad de la cuantizacion mixta oQ frente al checkpoint BF16 original.
- Fine-tuning ligero o adaptadores: el formato safetensors MLX permite cargar el modelo en frameworks MLX para experimentacion con LoRA u otras tecnicas.
- Educacion e investigacion: util para estudiar el efecto de la cuantizacion por capas y de la decodificacion especulativa en modelos de ~28 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17,5 GB para cargar los pesos cuantizados; se recomienda al menos 24 GB de memoria unificada para dejar margen a la cache KV y al contexto.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra) con 32 GB o mas; el formato MLX no es compatible con GPU NVIDIA o AMD de forma nativa.
- Cabe en consumer GPU: si, en Mac con memoria unificada de 24-32 GB; no es ejecutable en GPU de consumo NVIDIA sin conversion previa a otro formato (GGUF, etc.).
- Opciones de despliegue: MLX (mlx-lm), oMLX; no soportado directamente por vLLM, llama.cpp, Ollama o TGI sin conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-oQ4e-mtp | 27,78 B | No disponible | MLX safetensors 4-bit mixto | No disponible | Hugging Face (tennr1) |
| Checkpoint Qwopus3.8-27B-Coder-Flash (BF16) | 27,78 B | No disponible | safetensors BF16 | No disponible | No confirmado en la informacion |
| Qwen3.5-Coder (modelo base de referencia) | No disponible | No disponible | safetensors | No disponible | No disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas concretas.

## Limitaciones y advertencias

- La cuantizacion mixta a 4-5 bits puede degradar la calidad en tareas de razonamiento complejo o generacion de codigo de alta precision frente al checkpoint BF16 original.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-04); no hay validacion comunitaria ni evidencia de calidad.
- La licencia no esta especificada, lo que impide determinar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base Qwopus3.8-27B-Coder-Flash antes de cualquier uso en produccion.
- No se documentan los idiomas soportados ni el contexto maximo, lo que dificulta planificar su integracion en aplicaciones reales.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPU NVIDIA/AMD sin conversion.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al ser una cuantizacion, hereda los sesgos del modelo base, que no estan documentados aqui.
- La model card indica que fue re-cuantizado con oMLX v0.7.3 y pide re-descargar copias anteriores; versiones previas pueden diferir en calidad.

## Enlaces

- Hugging Face: https://huggingface.co/tennr1/Qwopus3.8-27B-Coder-Flash-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
