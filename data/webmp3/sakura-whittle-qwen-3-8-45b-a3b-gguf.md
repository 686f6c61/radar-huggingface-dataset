# webmp3/Sakura-Whittle-Qwen-3.8-45B-A3B-GGUF

## Resumen

Sakura-Whittle-Qwen-3.8-45B-A3B-GGUF es una cuantizacion GGUF de caracter comunitario del modelo Whittle-Qwen-3.8-45B-A3B, publicada por el usuario webmp3. No se trata de un modelo entrenado desde cero, sino de una re-cuantizacion de un GGUF Q8_0 ya existente (48 GB) a formatos de menor precision: Q2_K (16,4 GB) y Q3_K_M (21,3 GB). El modelo base declara una arquitectura denominada `qwen4exp` y un total de 45.116.781.696 parametros, con un esquema de nombres que sugiere una topologia Mixture-of-Experts con aproximadamente 3 mil millones de parametros activos (sufijo A3B).

La relevancia de esta publicacion es practica: reduce el peso del modelo entre un 56 % y un 66 % respecto al Q8_0 original, lo que permite ejecutarlo en hardware con menos VRAM o RAM. El autor documenta hashes SHA-256 por fichero, la version exacta de llama.cpp usada (b11669-620d2225c) y confirma que cada archivo fue cargado y utilizado para generar texto al menos una vez.

Conviene subrayar que la model card no aporta informacion sobre datos de entrenamiento, benchmarks, contexto maximo ni capacidades reales del modelo subyacente. Todo lo que se sabe del modelo original procede de los metadatos de atribucion, no de documentacion tecnica verificable en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (transformer tipo MoE, segun nomenclatura del autor) |
| Parametros totales | 45.116.781.696 (45,1 B) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3 B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (16,4 GB) y Q3_K_M (21,3 GB) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (2 ficheros, sin particionar) |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `qwen4exp`, un identificador que no corresponde a ninguna familia publica conocida y que solo aparece en los metadatos del autor. El nombre del modelo base (Whittle-Qwen-3.8-45B-A3B) y la relacion declarada (`merge`) con `logic65/Whittle-Qwen-3.8-35B-A3B` y `Qwen/Qwen3.6-35B-A3B` indican que el modelo original es una fusion de dos checkpoints, no un entrenamiento desde cero. El sufijo A3B apunta a una arquitectura MoE con unos 3 B de parametros activos por token, aunque esta cifra no se confirma en la documentacion disponible.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste instructivo. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Lo unico verificable es el proceso de cuantizacion: se partio del fichero `Whittle-Qwen-3.8-45B-A3B-Q8_0.gguf` (commit `e2762dbec056f64b5e024ec1298947a09a525321`, SHA-256 `b8d0662...f0d0867`) y se re-cuantizo sin calibracion con matriz de importancia, lo que el propio autor advierte que puede acumular error de cuantizacion sobre un modelo ya cuantizado.

## Capacidades

- Generacion de texto conversacional: la model card incluye la etiqueta `conversational` y el ejemplo de uso con `llama-cli -p "Hello"`.
- Soporte multilingue limitado a ingles y chino, segun el campo `language` del README.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso via API compatible con OpenAI en plataformas de despliegue.
- Capacidad de razonamiento, codigo, matematicas, tool calling o agentes: no disponible; no se documenta en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.
- Al ser una re-cuantizacion, hereda las capacidades del modelo base, pero estas no estan verificadas ni descritas en la ficha.

## Casos de uso

- Evaluacion local en hardware modesto: con 16,4 GB (Q2_K) el modelo puede cargarse en estaciones de trabajo con 24 GB de VRAM (RTX 3090/4090) o en sistemas con 32 GB de RAM usando llama.cpp con offload parcial, lo que permite probar el modelo antes de comprometerse con el Q8_0 de 48 GB.
- Prototipado de asistentes conversacionales en ingles y chino: el modelo puede integrarse en un chatbot de demo mediante `llama-server` y la API compatible con OpenAI, aprovechando la etiqueta `endpoints_compatible`.
- Despliegue en entornos con restricciones de memoria: en servidores sin GPU de gran capacidad, la version Q3_K_M (21,3 GB) permite inferencia en CPU con un throughput aceptable para tareas por lotes no interactivas.
- Investigacion sobre degradacion por cuantizacion: al existir dos niveles (Q2_K y Q3_K_M) del mismo origen, es util para medir empiricamente la perdida de calidad frente al Q8_0 en tareas de generacion libre.
- Fine-tuning ligero o evaluacion comparativa: sirve como checkpoint de referencia para comparar el comportamiento del modelo fusionado original frente a sus versiones comprimidas en pipelines de evaluacion interna.
- Pruebas de integracion con llama.cpp: util para validar que una build concreta (por ejemplo, b11669) soporta la arquitectura `qwen4exp` antes de desplegar el modelo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna puntuacion de codigo, perplejidad o calidad salvo que se liste un valor medido, y no se lista ninguno.

## Requisitos de hardware

- VRAM estimada: Q2_K requiere aproximadamente 16,4 GB solo para pesos; con overhead de contexto y KV cache, entre 18 y 20 GB en GPU. Q3_K_M parte de 21,3 GB y puede necesitar 23-25 GB en GPU.
- GPU recomendadas: RTX 4090 (24 GB) para Q2_K con contexto moderado; A100 40 GB o H100 para Q3_K_M con contexto largo; RTX 3090 (24 GB) tambien valida para Q2_K.
- Consumer GPU: Q2_K cabe en RTX 4090 y RTX 3090; Q3_K_M es ajustado en 24 GB y puede requerir offload parcial a RAM.
- Opciones de despliegue: llama.cpp (build b11669 o superior con soporte para `qwen4exp`), `llama-cli` y `llama-server`. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sakura-Whittle-Qwen-3.8-45B-A3B (Q2_K) | 45,1 B (MoE, ~3 B activos) | no disponible | apache-2.0 | GGUF 16,4 GB | Re-cuantizacion sin calibracion |
| Whittle-Qwen-3.8-45B-A3B (Q8_0 original) | 45,1 B (MoE, ~3 B activos) | no disponible | apache-2.0 | GGUF 48 GB | Fuente de la cuantizacion |
| Whittle-Qwen-3.8-35B-A3B | 35 B (MoE, ~3 B activos) | no disponible | no disponible | no disponible | Base declarada del merge |
| Qwen3.6-35B-A3B | 35 B (MoE, ~3 B activos) | no disponible | no disponible | no disponible | Base declarada del merge |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de rendimiento para establecer diferencias cualitativas.

## Limitaciones y advertencias

- Re-cuantizacion sobre un GGUF ya cuantizado: el autor advierte que no se ejecuto calibracion con matriz de importancia y que esto puede anadir error de cuantizacion acumulado.
- Q2_K es una cuantizacion agresiva; es esperable una degradacion notable de calidad frente al Q8_0, especialmente en tareas de razonamiento y codigo, aunque no se aportan mediciones.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- No hay benchmarks, evaluaciones de sesgo ni estudios de alucinacion publicados para este checkpoint.
- Licencia apache-2.0 permite uso comercial y redistribucion con atribucion, pero el autor recuerda que los autores upstream conservan su licencia y atribucion; conviene verificar la licencia del modelo base original antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.
- La arquitectura `qwen4exp` requiere una build de llama.cpp que la soporte; builds antiguas pueden fallar al cargar el fichero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-Whittle-Qwen-3.8-45B-A3B-GGUF
- Modelo base (Whittle): https://huggingface.co/whittleOrg/Whittle-Qwen-3.8-45B-A3B-GGUF
- Model card del commit de origen: https://huggingface.co/whittleOrg/Whittle-Qwen-3.8-45B-A3B-GGUF/blob/e2762dbec056f64b5e024ec1298947a09a525321/README.md
- Base declarada 1: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Base declarada 2: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
