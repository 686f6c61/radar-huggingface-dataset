# VaibhavKKM/hpc-assistant-qwen3-8b

## Resumen

HPC Assistant 8B es un ajuste fino de Qwen3-8B especializado en preguntas sobre computacion de altas prestaciones (HPC) y el gestor de colas Slurm, desarrollado por VaibhavKKM. Se presenta como el hermano mayor de ClusterPilot-4B, con el que comparte receta de destilacion: respuestas generadas por Qwen3-235B-A22B-Instruct-2507, incluyendo las top-20 log-probabilidades del profesor. El modelo conserva el modo de razonamiento (thinking) de Qwen3, activado por defecto y conmutable mediante el argumento `enable_thinking` de la plantilla de chat.

El problema que aborda es concreto: escribir scripts de Slurm, diagnosticar trabajos fallidos, configurar MPI y ajustar rendimiento en clusters. Con razonamiento activo alcanza una puntuacion media de 0,9124 en tres conjuntos de prueba propios (Slurm dev, Slurm y GPU/MPI), frente a 0,8612 de ClusterPilot-4B. La metrica es una tasa de victorias frente a las respuestas de Qwen3-4B base sin documentos, evaluada por tres modelos jueces, no una exactitud absoluta.

El modelo tiene 8.190.735.360 parametros y se distribuye en bf16 (16,4 GB) y en dos cuantizaciones GGUF (Q4_K_M de 5,0 GB y Q8_0 de 8,7 GB). La licencia es CC BY-NC-SA 4.0, lo que restringe el uso comercial. El autor advierte que el modelo depende de los extractos de documentacion que la aplicacion ClusterPilot inyecta en cada consulta: sin ellos no conoce de forma fiable hechos especificos del sitio (particiones, limites, almacenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 16384`) |
| Tipos de cuantizacion | bf16, GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | No disponibles |
| Licencia | CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de 8,19 mil millones de parametros con modo de razonamiento explicito. El ajuste fino se realizo mediante destilacion: las respuestas objetivo provienen de Qwen3-235B-A22B-Instruct-2507 y se conservan las top-20 log-probabilidades del profesor, la misma receta empleada en ClusterPilot-4B. Los pesos publicados corresponden al run interno `e8_all`.

El conjunto de entrenamiento contiene 136.452 secuencias. Entre los detalles documentados: 46 prompts de mas de 10.000 tokens se truncaron por el inicio, y las respuestas de razonamiento excesivamente largas se descartaron. Los prompts incluyen algunas trazas de una familia de clusters reservada para prueba (Aalto, aproximadamente 3 por cada 30.000 muestras). No se documenta el uso de RLHF ni DPO. El autor probo variantes adicionales que no reemplazaron los pesos publicados: una etapa de razonamiento entrenada con Qwen3.5-397B (FP8, solo texto final) dio 0,8284; rondas extra de entrenamiento dieron entre 0,8841 y 0,9109; una media de pesos de varias versiones dio 0,8890; y distintas tasas de aprendizaje y combinaciones de conjuntos quedaron por debajo o a la par.

## Capacidades

- Generacion de texto tecnico sobre HPC y Slurm: scripts `sbatch`, arrays de trabajos, directivas de particion, limites de recursos y requeue.
- Razonamiento explicito (thinking mode) activado por defecto, conmutable mediante `enable_thinking` en la plantilla de chat.
- Respuestas a preguntas de GPU, MPI y rendimiento dentro del dominio de clusters.
- Integracion con busqueda documental: rinde mejor cuando la aplicacion inyecta extractos de documentacion en la consulta.
- Soporte de plantilla de chat compatible con `transformers` y despliegue en `llama-server`.
- Tool calling y modo agente: no evaluados para este modelo segun la model card.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Generacion de scripts de Slurm en produccion: el modelo escribe `sbatch` con arrays, dependencias y limites de concurrencia (por ejemplo, 100 tareas con maximo 10 simultaneas), tarea para la que fue entrenado explicitamente.
- Asistencia en consola para usuarios de cluster: un chatbot que responde dudas sobre envio de trabajos, particiones y depuracion de fallos, apoyado en la documentacion del sitio inyectada por la aplicacion.
- Diagnostico de trabajos fallidos: interpretar mensajes de error de Slurm y proponer correcciones en directivas o en el entorno de ejecucion.
- Configuracion de MPI y ajuste de rendimiento: responder preguntas sobre `mpirun`, afinidad de CPU y parametros de rendimiento en nodos GPU.
- Base para un asistente interno de soporte HPC: desplegado con llama.cpp en un servidor modesto gracias a la cuantizacion Q4_K_M (5,0 GB), con contexto de 16.384 tokens.
- Evaluacion y prototipado de asistentes de dominio: servir como referencia para comparar recetas de destilacion sobre Qwen3 en tareas tecnicas verticales.
- Educacion y formacion: explicar conceptos de planificacion de colas y recursos a usuarios noveles, con razonamiento visible para auditar la respuesta.

## Benchmarks y rendimiento

La metrica principal es una tasa de victorias (0,50 equivale a Qwen3-4B base sin documentos; 1,00 significa siempre mejor), decidida por mayoria de tres jueces (gpt-oss-20b, Gemma 4 26B y Qwen3-235B) en ambos ordenes. Todas las respuestas usan la busqueda documental por defecto de la aplicacion.

| Modelo | Run 1 | Run 2 | Media |
|---|---|---|---|
| Este modelo, thinking on (por defecto) | 0,9091 | 0,9157 | 0,9124 |
| Este modelo, thinking on, busqueda extendida | 0,9197 | 0,9127 | 0,9162 |
| Este modelo, thinking off | 0,8746 | 0,8577 | 0,8662 |
| ClusterPilot-4B 1.3 (sin thinking) | 0,8665 | 0,8558 | 0,8612 |

Conjuntos de prueba: Slurm dev (66 preguntas), Slurm (200) y GPU/MPI (106). La busqueda extendida anade un indice general de documentacion HPC que no forma parte de los pesos ni se distribuye; la diferencia esta dentro del ruido, aunque GPU/MPI sube de 0,840 a 0,857 de media.

Comprobaciones adicionales:

| Prueba | ClusterPilot-4B 1.3 | Este modelo, thinking off | Este modelo, thinking on |
|---|---|---|---|
| 184 preguntas de clusters europeos con tool calls reales (respuestas erroneas) | 36 | 27 | 23 |
| 25 casos reales de Leonardo del mentor (puntos clave de 50) | 31 | 34 | 35 |

Sin la documentacion de la aplicacion, el modelo alcanzo 23 de 50 en los casos de Leonardo. Dos ejecuciones de los mismos pesos difieren en torno a 0,01, por lo que las diferencias pequenas no son significativas.

## Requisitos de hardware

- VRAM para bf16: aproximadamente 16,4 GB de pesos mas overhead de activaciones y cache KV; en la practica, 20-24 GB para contexto moderado.
- VRAM para GGUF Q8_0: 8,7 GB de pesos; viable en GPUs de 12-16 GB.
- VRAM para GGUF Q4_K_M: 5,0 GB de pesos; cabe en GPUs consumer de 8 GB, con margen para contexto.
- GPUs recomendadas: A100 40/80 GB o H100 para bf16 con contexto largo y concurrencia; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090, 4080 o 4070 Ti para cuantizaciones GGUF.
- Despliegue: `transformers` con `device_map="auto"` y `dtype="bfloat16"`; `llama.cpp` mediante `llama-server` (ejemplo oficial con `-c 16384`); compatible con text-generation-inference segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la prueba del autor | Licencia |
|---|---|---|---|---|
| HPC Assistant 8B (este modelo) | 8,19 B | No disponible | 0,9124 (thinking on) | CC BY-NC-SA 4.0 |
| ClusterPilot-4B 1.3 | No disponible | No disponible | 0,8612 | No disponible en la informacion |
| Qwen3-8B (base) | 8,19 B | No disponible | No evaluado en esta prueba | No disponible en la informacion |
| Qwen3-4B (base, referencia de los jueces) | 4 B aprox. | No disponible | 0,50 por definicion de la metrica | No disponible en la informacion |

La comparacion directa solo es valida dentro de la prueba descrita; no hay resultados publicados de MMLU, HumanEval, GSM8K ni de benchmarks estandar para este ajuste.

## Limitaciones y advertencias

- Licencia CC BY-NC-SA 4.0: prohibido el uso comercial y obligacion de compartir bajo la misma licencia las obras derivadas.
- Dependencia de documentacion externa: sin los extractos que inyecta la aplicacion, el modelo no conoce de forma fiable particiones, limites ni almacenamiento del sitio (23 de 50 puntos en la prueba sin documentos).
- Con thinking activo, 2 de las 184 preguntas europeas y 2 de los 25 casos del mentor quedaron sin respuesta; una respuesta cuyo razonamiento no termina cuenta como no respuesta.
- Tool calling, modo agente y las suites de prueba de la aplicacion no se volvieron a ejecutar para este modelo.
- Presencia residual de trazas de la familia de clusters Aalto (reservada para prueba) en los datos de entrenamiento.
- Truncamiento de 46 prompts largos por el inicio durante el entrenamiento, lo que puede afectar a consultas con contexto muy extenso.
- Riesgo de alucinacion en hechos especificos de sitio y en configuraciones no cubiertas por la documentacion.
- Sesgos e idiomas soportados no documentados.
- Las puntuaciones son tasas de victoria relativas a Qwen3-4B base, no exactitudes; diferencias por debajo de 0,01 no son fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VaibhavKKM/hpc-assistant-qwen3-8b
- Modelo hermano ClusterPilot-4B: https://huggingface.co/VaibhavKKM/hpc-assistant-qwen3-4b
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Aplicacion ClusterPilot: https://github.com/pparitoshh/alembic
