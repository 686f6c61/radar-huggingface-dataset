# win10/spark-temporal-engram-4b-v3

## Resumen

Spark Temporal Engram V3 — Extended 4B es un modelo de lenguaje de 4.114.992.015 parámetros (aproximadamente 4,1 B) publicado por el usuario win10 en HuggingFace. No es un modelo base entrenado desde cero: se trata de la continuación del ajuste fino del backbone post-entrenado Spark-X2.5-4B, del que se conservan intactos los pesos originales, los adaptadores previos y los pesos fusionados anteriores. La contribución del autor es una capa de memoria episódica denominada Engram, que combina un codificador episódico GRU/léxico con eventos recientes y archivados de retención acotada y resúmenes con pérdida, atención cruzada en las capas 1 y 5 y una segunda trayectoria de decodificador con pesos compartidos y KV independiente.

El modelo se distribuye en FP32 (9 shards, 15,33 GiB) y requiere cargar código propio (`trust_remote_code=True`, etiqueta `custom_code`). Su interés es fundamentalmente de investigación: aborda el problema del razonamiento sobre orden temporal y tiempo de evento, no el rendimiento generalista. La propia model card reconoce que los criterios de rendimiento declarados para el adaptador no se cumplieron en su totalidad y que se conservan todas las regresiones y casos fallidos, sin reentrenamiento guiado por puntuación.

Es relevante ahora como artefacto reproducible de un experimento de entrenamiento continuado con LoRA (rank 16, alpha 32) sobre trazas de agentes, con checkpoints en los pasos globales 300 a 800, informe de entrenamiento y evidencia de ejecución. Su adopción en producción es, en el estado actual, muy discutible: cuenta con 0 descargas y 0 likes, no declara licencia y los resultados publicados se limitan a 32 registros de NLL, 12 casos de recall de prefijo exacto y 12 preguntas de orden temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer con encoder episodico GRU/lexico ("Engram"), eventos recientes y archivados con resumenes con perdida, atencion cruzada en capas 1 y 5, y segunda trayectoria de decodificador con pesos compartidos y KV independiente; requiere `custom_code` |
| Parametros totales | 4.114.992.015 (aproximadamente 4,1 B) |
| Parametros activos | No procede: no es un modelo MoE |
| Longitud de contexto | Maximo configurado de 1.048.576 posiciones, no probado a longitud completa; cutoff de entrenamiento de 1.024 tokens |
| Tipos de cuantizacion | No disponible. No se publican GGUF ni cuantizaciones; los pesos se distribuyen en FP32 y el autor recomienda pasar el backbone a BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card menciona una "licencia incluida" y avisos de copyright de las fuentes, sin identificarlas) |
| Formato de pesos | safetensors, 9 shards, 15,33 GiB en FP32; tamano total del repositorio 16,5 GB |
| Modelo base | Spark-X2.5-4B post-entrenado (etiqueta `spark2_5`) |
| Fecha de publicacion | 11 de octubre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte del backbone Spark-X2.5-4B y le anade un subsistema de memoria episodica. Segun la model card, el modelo conserva el encoder episodico GRU/lexico de V3, eventos recientes y archivados de retencion acotada con resumenes con perdida, atencion cruzada en las capas 1 y 5, una segunda trayectoria de decodificador con pesos compartidos e KV independiente, asociaciones de la version V2 y mezcla online por log-loss. Los pesos se exportan en FP32 preservando los deltas de LoRA y los modulos guardados; en generacion, la configuracion medida usa backbone en BF16 y Engram en FP32. La generacion greedy, beam y de retornos multiples utiliza ambas trayectorias KV, y la decodificacion especulativa se rechaza explicitamente.

El entrenamiento es una continuacion nativa desde el paso global 200 hasta el 800 (600 actualizaciones formales). Se reanuda conservando pesos del checkpoint 200, momentos de Adam y contadores de scheduler/RNG, con flujo de datos nuevo y horizonte coseno extendido. Hiperparametros: LoRA rank 16 / alpha 32, cutoff 1024, batch size 1, acumulacion de gradiente 4, LR base 5e-5, semilla 73001, BF16, SDPA, checkpointing no reentrante y `additional_target=engram`. Las fuentes son cuatro conjuntos de trazas rotados exactamente 1:1:1:1: `claude_opus_4_7_traceinversion_qwen35`, `ox_alpha_pi_traces_qwen35`, `fable5_cursor_traces_qwen35` y `lambda_hermes_agent_reasoning_qwen35`. El tiempo de ejecucion formal fue de 128,95 minutos, con pico de memoria asignada/reservada de 17,41/19,21 GiB, y se guardaron checkpoints en los pasos 300, 400, 500, 600, 700 y 800. Un diagnostico de tres actualizaciones con entradas de usuario ausentes y un smoke test de 20 actualizaciones quedaron excluidos del computo de las 600 actualizaciones. El autor advierte que las cabeceras de frontera y de fecha no reciben etiquetas dedicadas y que 600 actualizaciones adicionales no cubren una epoca completa del corpus.

## Capacidades

- Generacion de texto autorregresiva con plantilla de chat (`apply_chat_template`) sobre un backbone de 4 B de parametros.
- Memoria episodica con carriles posicionales propios del modelo: eventos recientes, eventos archivados con resumenes con perdida y almacenamiento automatico en SQLite (configurable mediante `SPARK_ENGRAM_HOME` o `memory_config.storage_path`).
- Razonamiento sobre orden temporal y tiempo de evento: la model card cita explicitamente la pregunta "Explain the difference between event order and event time" como ejemplo de uso.
- Filtrado por tiempo de origen (source-time filter), evaluado de forma independiente al recall de prefijo exacto.
- Recall de prefijo exacto tras exactamente dos observaciones de la fuente (metrica medida, con resultados degradados respecto a versiones previas).
- Segunda trayectoria de decodificacion con KV independiente, integrada en generacion greedy, beam y con retornos multiples.
- Ajuste sobre trazas de agentes y razonamiento de modelos, lo que sugiere familiaridad con formatos de traza de herramientas, aunque la model card no declara soporte formal de tool calling ni de function calling.
- Capacidades multilingues: no disponibles.
- Vision, audio y modo de razonamiento explicito ("thinking mode"): no disponibles.

## Casos de uso

- Investigacion en memoria episodica de largo plazo: el modelo permite estudiar experimentalmente la diferencia entre retencion acotada con resumenes con perdida y memoria exacta, usando los checkpoints de los pasos 300 a 800 para analizar la evolucion del comportamiento.
- Evaluacion de razonamiento temporal en agentes: los 12 casos de orden temporal incluidos en la model card sirven como banco de pruebas minimo para reproducir la comparacion entre adaptador y pesos fusionados.
- Auditoria de trazas de agentes de programacion: al haberse ajustado sobre `fable5_cursor_traces_qwen35` y `lambda_hermes_agent_reasoning_qwen35`, es un candidato para prototipar el analisis de secuencias de llamadas a herramientas, siempre con cutoff de 1.024 tokens y asumiendo truncado.
- Prototipos de asistentes con memoria persistente: el almacenamiento SQLite automatico y los carriles posicionales permiten construir un asistente que recupere eventos previos sin reentrenar, con evaluacion en modo `lifecycle="ephemeral"` para pruebas aisladas.
- Filtrado temporal en pipelines RAG: el filtro por tiempo de origen permite descartar documentos o eventos fuera de una ventana temporal antes de la generacion, un patron habitual en analisis de incidentes y registros.
- Reproducibilidad de entrenamiento continuado: el repositorio documenta configuracion exacta de LoRA (rank 16/alpha 32), semilla, acumulacion de gradiente y presupuesto de memoria, lo que lo hace util como caso de estudio docente de reanudacion nativa de optimizador y scheduler.
- Comparacion de estrategias de exportacion: los pesos incluyen deltas de LoRA y modulos guardados en FP32, lo que permite medir el coste en VRAM de la mezcla BF16/FP32 recomendada frente a alternativas.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la model card, medidos sobre fixtures fijos: 32 registros de NLL, 12 casos de prefijo exacto y 12 preguntas de orden temporal. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

| Modelo | NLL | Recall de prefijo exacto | Orden temporal |
|---|---:|---:|---:|
| Base | 1,304515 | 0/12 | 1/12 |
| V3 inicial | 1,336399 | 12/12 | 1/12 |
| Adaptador previo (paso 200) | 1,036683 | 5/12 | 7/12 |
| Fusionado previo (paso 200) | 1,041501 | 6/12 | 7/12 |
| Adaptador extendido (paso 800) | 1,019089 | 0/12 | 6/12 |
| Fusionado extendido (paso 800) | 1,020007 | 0/12 | 6/12 |

Interpretacion con los datos aportados: la continuacion mejora la NLL del adaptador (de 1,036683 a 1,019089) pero hunde el recall de prefijo exacto (de 5/12 a 0/12) y empeora ligeramente el orden temporal (de 7/12 a 6/12). El propio autor indica que los criterios de rendimiento declarados no se cumplieron en su totalidad, que los casos expuestos son regresiones previamente conocidas y que sirven como soporte de la comparacion medida, no como afirmacion de generalizacion amplia. Los pesos fusionados y los adaptadores rinden de forma casi identica. El recall se mide tras exactamente dos observaciones de la fuente, y la correccion del filtro por tiempo de origen se evalua por separado.

## Requisitos de hardware

- VRAM para inferencia en FP32: los pesos ocupan 15,33 GiB en 9 shards, por lo que se necesitan aproximadamente 16 GB solo para pesos, mas cache KV y estados de la memoria Engram.
- Configuracion medida por el autor: backbone (embedding, capas, norm y lm_head) en BF16 y Engram en FP32; es la combinacion con la que se ejecutaron las comprobaciones de generacion y de filtro temporal.
- Durante el entrenamiento (LoRA, batch 1, acumulacion 4, cutoff 1024) el pico asignado fue de 17,41 GiB y el reservado de 19,21 GiB, sobre una GPU NVIDIA Blackwell de 96 GB.
- GPUs recomendadas: A100 40 GB, H100 o cualquier acelerador con 24-40 GB o mas de VRAM. En consumer, una RTX 4090 o RTX 3090 de 24 GB queda muy justa con FP32 completo; la ruta BF16 del backbone alivia parte de la presion, pero no hay medidas publicadas de VRAM en inferencia.
- Despliegue: unicamente via `transformers` con `trust_remote_code=True` y codigo propio. No se publican pesos GGUF ni cuantizaciones, por lo que llama.cpp, Ollama y similares no son compatibles sin conversion previa. vLLM y TGI no estan verificados en la informacion disponible, y la decodificacion especulativa esta explicitamente rechazada.
- Latencia y throughput: no disponibles. La model card solo reporta tiempo de entrenamiento (128,95 minutos para 600 actualizaciones en 96 GB de VRAM).
- Entorno validado: Python 3.12.3, PyTorch 2.10.0+cu130, CUDA 13.0, Transformers 5.8.0, PEFT 0.18.1, Accelerate 1.11.0, LLaMA-Factory 0.9.6.dev0.

## Comparativa con modelos similares

No hay datos de benchmarks estandar que permitan comparar este modelo con alternativas publicas de tamano similar, y la model card solo ofrece comparaciones internas contra el backbone Spark-X2.5-4B y sus propias versiones anteriores. Se indica "no disponible" para cualquier comparacion externa de parametros, contexto, rendimiento o licencia. Como referencia interna, la evolucion utilizable es la siguiente:

| Referencia | Parametros | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark Temporal Engram V3 Extended 4B (adaptador, paso 800) | 4,1 B | 1.048.576 maximo configurado, 1.024 de cutoff | No disponible | HuggingFace, 0 descargas |
| Spark Temporal Engram V3 Extended 4B (fusionado, paso 800) | 4,1 B | Igual | No disponible | HuggingFace |
| Adaptador previo (paso 200) | 4,1 B | Igual | No disponible | No localizado en la informacion |
| Spark-X2.5-4B (base) | No disponible | No disponible | No disponible | Referenciado como backbone, sin enlace verificado |

## Limitaciones y advertencias

- Los criterios de rendimiento declarados por el autor no se cumplieron en su totalidad: el recall de prefijo exacto cae de 5/12 a 0/12 en la continuacion extendida y el orden temporal baja de 7/12 a 6/12.
- La retencion es acotada y los resumenes de eventos archivados son con perdida; la extraccion de fechas aprendida "no esta establecida" segun la propia model card.
- El cutoff de 1.024 tokens puede truncar trazas largas de herramientas, un escenario habitual en agentes.
- Las 600 actualizaciones adicionales no cubren una epoca completa del corpus, por lo que el ajuste es parcial por diseno.
- El maximo de 1.048.576 posiciones esta configurado pero no probado a longitud completa; no debe asumirse comportamiento correcto en contextos largos.
- La decodificacion especulativa esta explicitamente rechazada, lo que limita las optimizaciones de latencia habituales.
- No hay licencia declarada, pese a mencionarse una "licencia incluida". Sin identificacion de terminos, el uso comercial es juridicamente arriesgado.
- No se declaran idiomas soportados, por lo que el comportamiento multilingue es indeterminado.
- Los datos de entrenamiento proceden de trazas de otros modelos (`claude_opus_4_7_traceinversion_qwen35`, `ox_alpha_pi_traces_qwen35`, `fable5_cursor_traces_qwen35`, `lambda_hermes_agent_reasoning_qwen35`), lo que implica un posible efecto de destilacion y la herencia de los sesgos de esas fuentes; no se documentan sesgos propios.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de veracidad, MMLU, HumanEval ni GSM8K en la informacion disponible.
- Cero descargas y cero likes: no existe validacion externa ni informes de terceros sobre su comportamiento real.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; conviene auditar `custom_code` antes de desplegarlo.
- Los checkpoints y estados de framework se conservan en los pasos 300 a 800, pero un diagnostico de tres actualizaciones y un smoke test de 20 quedaron excluidos del computo formal, lo que complica la trazabilidad exacta de las actualizaciones aplicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/win10/spark-temporal-engram-4b-v3
- Informe de entrenamiento: `TRAINING_REPORT.md` (referenciado en la model card, no accesible como enlace publico)
- Scripts y evidencia: `scripts/v3_4b_extended` y `runs/v3-4b-extended-20261011` (rutas de marcador de posicion, no accesibles)
- Informe completo en ingles: `docs/spark-temporal-engram-v3-extended-training.md` (ruta de marcador de posicion, no accesible)
- Busqueda web: los resultados devueltos corresponden a enlaces de TikTok sin relacion con el modelo; no se han localizado papers, blogs, repositorios ni demos adicionales.
