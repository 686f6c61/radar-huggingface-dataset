# TimJ3ly/Sylumen-5B

## Resumen

Sylumen-5B es un modelo de lenguaje de tipo decoder-only denso, especializado en uso de herramientas y function calling, desarrollado por el usuario TimJ3ly. Se construye a partir del modelo base IFM/K2-Horizon-3.7B (Apache-2.0) y cuenta con aproximadamente 5.058 millones de parámetros totales, de los cuales 3.700 millones corresponden al núcleo no-embedding. La versión publicada en este repositorio es la segunda iteración (v2) de los pesos y se distribuye en precisión bfloat16, sin necesidad de adaptadores en inferencia.

El modelo resuelve el problema de la invocación fiable de funciones en entornos controlados: genera llamadas a herramientas en un formato estructurado propio (`<ifm|tool_calls>`), admite llamadas simples, múltiples y paralelas, y está diseñado para rechazar peticiones irrelevantes que no requieren el uso de herramientas. Su relevancia actual radica en que ofrece una alternativa de tamaño medio (5B) con ventana de contexto de 65.536 tokens, licencia permisiva y un formato de tool calling estable, lo que facilita su despliegue en infraestructura de una sola GPU.

La versión v2 no introduce nuevos datos de entrenamiento: parte del checkpoint LoRA de la v1 (rango 16, alpha 32), escala los tensores `lora_B` por 0,3 y fusiona el delta resultante en los pesos base. El objetivo declarado es recuperar la precisión de un solo turno y de memoria que la v1 había degradado, manteniendo parte de la mejora en rechazo de peticiones irrelevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (`K2HorizonForCausalLM`, requiere `trust_remote_code=True`) |
| Parametros totales | 5.058.255.360 (~5,1B; 3,7B no-embedding) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (`max_position_embeddings` en `config.json`; la arquitectura base soporta posiciones mayores) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 (atribucion en `NOTICE`) |
| Formato de pesos | safetensors (bfloat16, shards con el layout del modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso implementado en la clase `K2HorizonForCausalLM`, que requiere cargarse con `trust_remote_code=True`. El modelo base es IFM/K2-Horizon-3.7B, fijado en el commit `d6e5432c59637093c0e125e791d89ea4a0b53559`. El repositorio contiene los pesos completos en bfloat16, sin adaptador, y el `config.json` limita `max_position_embeddings` a 65.536 tokens para permitir el servicio en una única GPU de 80 GB con la configuración por defecto de vLLM; la arquitectura base admite posiciones más largas si se dispone de más memoria.

El proceso de construcción de la v2 es un merge de adaptador escalado, no un fine-tune nuevo: se toma el checkpoint LoRA de la v1 (rango 16, `lora_alpha` 32), se escala cada tensor `lora_B` por 0,3 —lo que escala todo el delta de fine-tuning por 0,3, ya que la actualización es `(alpha/r)·B·A`— y se fusiona en los pesos base mediante `W' = W + (32/16)·(B_scaled·A)`, calculado en float32 y almacenado en bfloat16, shard a shard, preservando el layout del modelo base. No se emplean nuevos datos de entrenamiento ni se documenta RLHF o DPO adicional. El factor 0,3 se eligió tras una sonda de interpolación: la v1 era claramente mejor rechazando peticiones irrelevantes pero perdía precisión en un solo turno y en memoria; con 0,3 los scores de un solo turno y multi-turno vuelven al nivel del base y la puntuación de memoria supera a ambos.

## Capacidades

- Generación de texto conversacional en inglés, orientada a la invocación de herramientas.
- Function calling con esquemas de herramientas proporcionados por el usuario mediante el parámetro `tools=`.
- Llamadas simples, múltiples y paralelas, con un bloque `<ifm|tool_calls>` que contiene una o varias llamadas `<ifm|tool_call>` con pares de etiquetas `arg_key`/`arg_value`.
- Uso de herramientas multi-turno, manteniendo el hilo de conversación con resultados de herramientas previos.
- Rechazo de peticiones irrelevantes que no requieren invocar ninguna herramienta (capacidad medida en la categoría de irrelevance de BFCL).
- Argumentos de tipo cadena y escalar en texto plano; arrays y objetos serializados como JSON.
- Capacidad de memoria de conversación evaluada en la categoría de memory de BFCL.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Automatización de agentes de soporte técnico: el modelo recibe un catálogo de herramientas (consulta de estado de pedido, apertura de incidencias) y genera la llamada correcta con argumentos estructurados, manteniendo el contexto multi-turno gracias a la ventana de 65.536 tokens.
- Orquestación de pipelines de datos: invocación de funciones de extracción, transformación y carga (ETL) a partir de instrucciones en lenguaje natural, con llamadas paralelas para procesar varias fuentes en una sola respuesta.
- Integración en asistentes de línea de comandos: el modelo traduce peticiones del usuario a invocaciones de herramientas del sistema (listar ficheros, consultar APIs internas) con temperatura 0,01 para obtener salidas deterministas.
- Enrutamiento de consultas en sistemas RAG: uso de la capacidad de rechazo de peticiones irrelevantes para decidir cuándo no invocar ninguna herramienta y responder directamente, reduciendo llamadas innecesarias a servicios externos.
- Investigación sobre tool calling en modelos pequeños: el modelo sirve como referencia reproducible (base, v1 y v2 documentados con BFCL) para estudiar el efecto del escalado de adaptadores LoRA en la precisión de function calling.
- Prototipado de asistentes de operaciones: consulta de métricas, reinicio de servicios o creación de tickets mediante esquemas de herramientas definidos por el equipo, desplegable en una sola GPU de 80 GB con vLLM.
- Evaluación de robustez frente a esquemas de herramientas mal formados en entornos de laboratorio aislados, dado que el modelo no incorpora tuning de seguridad específico para ese escenario.

## Benchmarks y rendimiento

Los resultados son autodeclarados por el autor, medidos con el harness abierto BFCL (modo function-calling) y no constituyen una puntuación oficial de leaderboard. Solo se ejecutaron las categorías gratuitas; `web_search` no se ejecutó, por lo que la puntuación global excluye ese componente y repondera el resto (10·non-live + 10·live + 10·irrelevance + 30·multi-turn + 40·memory). Todas las cifras se midieron con una ventana de contexto de 64K tokens.

| Modelo | Non-Live | Live | Irrelevance | Multi-Turn | Memory | Overall (sin web_search) |
|---|---|---|---|---|---|---|
| K2-Horizon-3.7B (base) | 76,92% | 71,35% | 73,10% | 39,00% | 54,41% | 55,60% |
| Sylumen-5B v1 (2 repeticiones de memory) | 75,12% | 68,62% | 82,92% | 41,00% | 51,61% | 55,61% |
| Sylumen-5B v2 | 76,60% | 70,39% | 74,28% | 39,25% | 59,17% | 57,57% |

La mejora de v2 sobre el base se concentra en memoria e irrelevancia. La ganancia en memoria es de +4,75 puntos, pero su intervalo de confianza bootstrap del 95% pareado es [−0,31, +9,79] pp, que incluye el cero, por lo que esa diferencia por sí sola no es estadísticamente significativa; la puntuación de memoria del propio base varió 12 puntos entre sus cuatro repeticiones, mientras que la de v2 varió 3. Los componentes no relacionados con memoria están dentro del ruido entre ejecuciones del base (non-live −0,32, live −0,96, irrelevance +1,18, multi-turn +0,25; McNemar a nivel de ítem en los ítems no-memoria: −0,20 pp, p = 0,63). Frente a v1, v2 cede parte de la ganancia en irrelevancia (82,92% → 74,28%, aún por encima del base) y recupera el rendimiento de un solo turno, multi-turno y la mayor parte de la pérdida en memoria.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10,1 GB solo para pesos (5,058B × 2 bytes), más overhead de KV cache; el autor indica que una única GPU de 80 GB puede servir el modelo con la configuración por defecto de vLLM a 65.536 tokens de contexto.
- GPU recomendadas: A100 80 GB o H100 80 GB para servicio con contexto completo de 64K; GPUs de 24 GB (RTX 4090, A10G) pueden alojar los pesos en bf16, pero el contexto completo requeriría cuantización o reducción de `max_position_embeddings`, opción no documentada oficialmente.
- Cabe en GPU de consumo: sí en cuanto a pesos (RTX 4090 de 24 GB en bf16), aunque el contexto de 64K exigirá ajustar la ventana o recurrir a cuantización no publicada por el autor.
- Opciones de despliegue: vLLM es el backend documentado por el autor (`vllm serve ... --max-model-len 65536`); al requerir `trust_remote_code=True`, otros backends (llama.cpp, Ollama, TGI) no están verificados en la información disponible.
- Latencia y throughput: no disponible; el autor no publica mediciones de latencia ni tokens por segundo.
- Configuración de inferencia recomendada: `dtype=bfloat16`, `temperature=0.01`, `max_new_tokens=4096`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sylumen-5B (v2) | ~5,1B (3,7B no-embedding) | 65.536 tokens | Tool calling / function calling | Apache-2.0 | Pesos completos en Hugging Face |
| IFM/K2-Horizon-3.7B (base) | ~3,7B no-embedding | 65.536 tokens en este repo (arquitectura admite más) | Modelo base de propósito general con soporte de herramientas | Apache-2.0 | Pesos completos en Hugging Face |
| Sylumen-5B v1 | ~5,1B | 65.536 tokens | Tool calling con mayor rechazo de irrelevancia | Apache-2.0 | Checkpoint LoRA (no publicado como pesos fusionados en este repo) |

La comparación se limita a la familia K2-Horizon porque la información disponible no incluye otros modelos de tool calling de tamaño similar con datos verificables. En BFCL (categorías gratuitas, sin web_search), el base obtiene 55,60%, la v1 55,61% y la v2 57,57%; la diferencia de v2 frente al base no es concluyente en los componentes no-memoria y su ganancia en memoria tiene un intervalo de confianza que incluye el cero.

## Limitaciones y advertencias

- No es un asistente de propósito general: su uso previsto es el function calling con esquemas de herramientas proporcionados.
- No incorpora tuning de seguridad dedicado para uso adversarial de herramientas; no debe exponerse a esquemas de herramientas no confiables.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación en la generación de argumentos: el formato estructurado no garantiza que los valores de los argumentos sean correctos, por lo que se recomienda validación posterior.
- Los benchmarks son autodeclarados y no oficiales; la ganancia en memoria no alcanza significancia estadística según el propio intervalo de confianza del autor.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener la atribución indicada en `NOTICE`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.
- El contexto de 65.536 tokens está limitado por el `config.json` de este repositorio, no por la arquitectura; ampliarlo exige más memoria y no está validado por el autor.
- No se documentan cuantizaciones oficiales ni soporte verificado en backends distintos de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimJ3ly/Sylumen-5B
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Commit fijado del modelo base: `d6e5432c59637093c0e125e791d89ea4a0b53559`
- Harness de evaluación BFCL: https://github.com/ShishirPatil/gorilla/tree/main/berkeley-function-call-leaderboard
- Documentación de vLLM: https://docs.vllm.ai/
