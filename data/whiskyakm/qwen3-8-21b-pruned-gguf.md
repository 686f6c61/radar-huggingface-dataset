# WhiskyAKM/Qwen3.8-21B-PRUNED-GGUF

## Resumen

WhiskyAKM/Qwen3.8-21B-PRUNED-GGUF es una version podada del modelo Qwen/Qwen3.8-27B del equipo Qwen, reducida de aproximadamente 27.000 millones de parametros a 20.807.699.328 parametros reales (segun los safetensors del repositorio). La poda consiste en la eliminacion de los bloques 6, 7, 8 y 9 del transformer original, lo que deja una red ligeramente mas superficial pero sustancialmente mas ligera en memoria y computo. El autor, WhiskyAKM, distribuye los pesos ya convertidos a formato GGUF para su uso directo en llama.cpp y runtimes compatibles.

Se trata de un proyecto de investigacion, no de un modelo afinado ni validado para produccion: la propia model card advierte de que la divergencia de distribucion (KLD) respecto al modelo original, en la misma cuantizacion, ronda 1,8, y de que los pesos se actualizaran en el futuro tras aplicar procesos de sanacion (healing) o metodos de poda mejores. El repositorio ocupa 147,5 GB en total e incluye desde una version BF16 sin cuantizar hasta cuantizaciones de 4, 5, 6 y 8 bits.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de reduccion de coste (poda de capas) aplicada a un modelo multimodal con atencion hibrida; por otro, sirve de aviso practico sobre los riesgos de emplear pesos podados sin evaluacion independiente, especialmente cuando el propio autor senala degradaciones notables en algunas cuantizaciones. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (atencion lineal combinada con atencion completa), segun tags del autor; derivada de Qwen3.8-27B |
| Parametros totales | 20.807.699.328 (20,8 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible de forma oficial; los ejemplos de la model card usan `-c 32768` (32.768 tokens) |
| Tipos de cuantizacion | BF16 (sin cuantizar), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0 |
| Idiomas soportados | multilingue (sin desglose de idiomas en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 147,5 GB con multiples ficheros cuantizados |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea, segun los tags del autor, una arquitectura de atencion hibrida que combina atencion lineal con atencion completa, ademas de capacidades multimodales (etiqueta `multimodal` y soporte de `mmproj` para proyeccion visual) y de prediccion multi-token (MTP). La intervencion de WhiskyAKM es puramente estructural: elimina los bloques 6, 7, 8 y 9 del transformer, reduciendo el numero de capas y, con ello, el numero de parametros hasta los 20,8 B.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, fases de RLHF o DPO) en el material proporcionado, ni sobre si el proceso de poda fue seguido de un reentrenamiento de recuperacion. El autor indica explicitamente que el resultado actual es un trabajo en curso y que la recuperacion (healing) o una poda mejorada llegaran en versiones posteriores. Tampoco se han validado las capacidades de vision ni de MTP tras la poda: la model card senala que no se probaron y que el `mmproj` debe tomarse de otro repositorio GGUF de Qwen3.8-27B.

## Capacidades

- Generacion de texto conversacional y multilingue, heredada del modelo base.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3.8, aunque no verificadas tras la poda en la informacion disponible.
- Soporte multimodal potencial (vision) mediante `mmproj` externo, no probado por el autor.
- Prediccion multi-token (MTP) presente en la arquitectura base, no probada tras la poda.
- Compatibilidad con API OpenAI a traves de `llama-server` (`--host`, `--port`), lo que facilita su integracion en clientes existentes.
- Ejecucion en llama.cpp mediante `llama-cli` con contexto configurable (ejemplos a 32.768 tokens).
- No hay informacion disponible sobre soporte de tool calling, function calling o razonamiento agentico multi-paso en esta version podada.

## Casos de uso

- Prototipado local de asistentes conversacionales: con el fichero Q6_K (16 GB) o Q5_K_M (14 GB) se puede desplegar un chatbot en una estacion de trabajo con GPU de 24 GB, usando `llama-server` como API compatible con OpenAI para conectar frameworks existentes.
- Investigacion sobre poda de modelos: el repositorio permite reproducir el efecto de eliminar los bloques 6-9 comparando el BF16 podado (`qwen3.8-21b.gguf`, 39 GB) con el modelo original, y medir la KLD reportada de aproximadamente 1,8.
- Evaluacion de cuantizaciones GGUF: la disponibilidad de ocho variantes permite estudiar la relacion entre bits por peso y calidad, tal como el autor documenta con la degradacion de Q4_0 y de la cuantizacion de KV cache en Q4 y Q5.
- Experimentacion multimodal controlada: cargando un `mmproj` de otro repositorio de Qwen3.8-27B se puede probar si la poda conserva capacidades visuales, aunque el autor no lo garantiza.
- Despliegue en entornos con VRAM limitada: la version Q4_K_S (12 GB) o Q4_K_M (13 GB) cabe en GPUs de consumo de gama alta, lo que permite pruebas de inferencia sin infraestructura de datacenter.
- Docencia y demostraciones de arquitecturas hibridas: el modelo sirve para ilustrar en clase o talleres como la atencion lineal y la poda afectan al coste computacional, siempre presentandolo como artefacto de investigacion.
- Generacion de texto multilingue de bajo coste en pipelines internos: util cuando el requisito es throughput y no precision critica, aceptando el riesgo de alucinacion propio de un modelo podado sin validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de calidad es la divergencia KLD de aproximadamente 1,8 respecto al modelo original en la misma cuantizacion, segun el autor, sin desglose por tarea ni comparacion con lineas base adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB (Q4_0, Q4_K_S), 13 GB (Q4_K_M), 14 GB (Q5_K_S, Q5_K_M), 16 GB (Q6_K), 21 GB (Q8_0) y 39 GB (BF16), sin contar el espacio de cache KV ni el `mmproj`.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto moderado; A100 40/80 GB o H100 para BF16 y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB para Q4_K_M y Q5_K_S, y en tarjetas de 24 GB para Q6_K y Q8_0.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI), y por extension cualquier runtime que consuma GGUF; no se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor advierte ademas de que la cuantizacion de KV cache en Q4 y Q5 degrada significativamente la calidad, lo que desaconseja reducir la cache para ahorrar VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WhiskyAKM/Qwen3.8-21B-PRUNED-GGUF | 20,8 B | no disponible (ejemplos a 32.768) | GGUF | Apache 2.0 | Poda de 4 bloques, KLD ~1,8, proyecto de investigacion |
| Qwen/Qwen3.8-27B (modelo base) | ~27 B | no disponible | safetensors y GGUF de terceros | Apache 2.0 | Modelo original sin podar; referencia de calidad |
| Otras variantes GGUF de Qwen3.8-27B | ~27 B | no disponible | GGUF | Apache 2.0 | Cuantizaciones sin poda; mayor VRAM, sin perdida por eliminacion de capas |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Proyecto de investigacion explicito: el autor advierte de que los pesos se actualizaran y de que el metodo de poda esta sin madurar; no debe tratarse como modelo estable.
- Perdida de calidad medible: KLD de aproximadamente 1,8 frente al original en la misma cuantizacion, sin evaluacion por tareas.
- Cuantizaciones desaconsejadas: Q4_0 presenta, segun el autor, una degradacion sorprendentemente grande; la cuantizacion de KV cache en Q4 y Q5 tambien degrada la calidad de forma significativa.
- Vision y MTP sin validar: la model card indica que no se probaron tras la poda; el `mmproj` debe obtenerse de otro repositorio y su compatibilidad no esta garantizada.
- Riesgo de alucinacion: inherente al modelo base y probablemente agravado por la poda y las cuantizaciones agresivas; no hay evaluaciones que lo cuantifiquen.
- Idiomas: la etiqueta es "multilingual" sin desglose; se desconoce el impacto de la poda en idiomas distintos del ingles y el chino, habituales en la familia Qwen.
- Licencia Apache 2.0 heredada del modelo base: permite uso comercial, pero el autor no ofrece garantias y el estado de investigacion desaconseja produccion sin evaluacion propia.
- Ausencia de benchmarks publicados: no es posible verificar el rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WhiskyAKM/Qwen3.8-21B-PRUNED-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog del equipo Qwen sobre Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
