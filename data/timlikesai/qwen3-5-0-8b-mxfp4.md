# timlikesai/Qwen3.5-0.8B-MXFP4

## Resumen

Qwen3.5-0.8B-MXFP4 es una cuantización de 4,25 bits en formato MXFP4 del modelo base ggml-org/Qwen3.5-0.8B, publicada por el usuario timlikesai en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a reducir el espacio en disco y los requisitos de memoria del modelo original: el repositorio ocupa 0,6 GB y los pesos declarados suman 772.845.888 parámetros (aproximadamente 0,77 mil millones).

El interés técnico de esta ficha está en el método de cuantización, no en el modelo en sí. Se ha generado con llama.cpp usando una matriz de importancia (imatrix) calculada sobre datos de entrenamiento tipo wiki, y aplica búsqueda de escalas OCP con objetivo 4.0, con escalas de bloque en formato e8m0. Además, la ruta de caché KV en MXFP4 usa escalado UOS por defecto, un detalle poco habitual en publicaciones de cuantizaciones GGUF de este tamaño.

La relevancia práctica es doble: por un lado, permite ejecutar un modelo conversacional de menos de 1.000 millones de parámetros en hardware muy modesto, incluido CPU; por otro, sirve como caso de estudio reproducible de cuantización MXFP4 con imatrix dentro del ecosistema llama.cpp. La información pública disponible sobre el repositorio es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base: ggml-org/Qwen3.5-0.8B; se trata de una cuantizacion GGUF, no de un modelo nuevo) |
| Parametros totales | 772.845.888 (segun los pesos declarados en safetensors) |
| Parametros activos | no aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, 4,25 bits, escalas de bloque e8m0; fichero `0.8b-mxfp4-imx.gguf`; receta `llama-quantize --imatrix 0.8b.imatrix base.gguf 0.8b-mxfp4-imx.gguf mx` |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la especifica; depende de la licencia del modelo base) |
| Formato de pesos | GGUF (un fichero de pesos + un fichero de imatrix) |
| Tamano del repositorio | 0,6 GB |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, imatrix, conversational |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: toma los pesos de ggml-org/Qwen3.5-0.8B y los recompila a GGUF en precision MXFP4. MXFP4 es un formato de microescalado definido por OCP en el que los pesos se agrupan en bloques y cada bloque comparte un factor de escala en formato e8m0 (exponente de 8 bits, sin mantisa), de modo que el valor efectivo por peso queda en torno a 4,25 bits. La arquitectura subyacente (transformer, dimensiones, atencion, contexto) no se describe en la model card y corresponde al modelo base, no a esta conversion.

Lo diferencial del proceso es el uso de imatrix y el ajuste de escalas. Primero se calcula una matriz de importancia con `llama-imatrix` sobre un fichero de entrenamiento derivado de datos wiki, y despues se ejecuta `llama-quantize` con la opcion `--imatrix`, lo que permite ponderar la busqueda de escalas segun la importancia estadistica de cada peso en lugar de optimizar solo el error cuadratico. La busqueda de escalas de los pesos sigue el criterio OCP con objetivo 4.0, mientras que la ruta de cache KV en MXFP4 emplea escalado UOS por defecto (e = ceil(log2(amax/7.25)) + 127, denominado MXAttention en la model card). No se indica si hubo RLHF, DPO ni ningun tipo de ajuste posterior: el modelo conversacional heredado proviene del modelo base.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` sugiere uso en dialogos multi-turno, pero no hay evaluacion publicada que lo confirme.
- Razonamiento, codigo y matematicas: no disponible. No hay informacion sobre capacidades concretas del modelo base en la model card de esta cuantizacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia en local con cuantizacion de 4,25 bits: capacidad efectiva del artefacto, orientada a despliegue en hardware limitado.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), es decir, la etiqueta indica que puede servirse a traves de APIs compatibles con el ecosistema de Hugging Face.

## Casos de uso

- Asistente conversacional en local sin GPU: con 0,6 GB de pesos, el modelo cabe en memoria RAM de cualquier portatil actual y puede ejecutarse en CPU con llama.cpp, lo que permite prototipar un chatbot offline sin coste de API.
- Clasificacion y enrutado de consultas: por su tamano reducido, es adecuado como primer nivel de un pipeline que decida si una peticion se resuelve con un modelo pequeno o se escala a uno mayor, reduciendo coste por token.
- Procesamiento por lotes en entornos con memoria limitada: al ocupar tan poco, se pueden ejecutar varias instancias en paralelo en una sola GPU consumer para tareas de etiquetado, extraccion de entidades o resumen de textos cortos.
- Inferencia en el borde (edge) y dispositivos embebidos: es un candidato para dispositivos con poca VRAM o RAM, como mini-PC, placas tipo Raspberry Pi de gama alta o portatiles sin GPU dedicada.
- Prototipado rapido de integraciones compatibles con endpoints: la etiqueta `endpoints_compatible` permite levantar un servicio local y conectar aplicaciones que consuman una API compatible antes de decidir el modelo definitivo.
- Estudio y validacion de tecnicas de cuantizacion: el repositorio incluye la receta exacta y el fichero imatrix, por lo que sirve para reproducir y comparar el efecto de MXFP4 con y sin ponderacion por importancia en un modelo de menos de 1.000 millones de parametros.
- Filtrado previo de datos en pipelines de entrenamiento: un modelo de este tamano puede usarse para descartar muestras claramente irrelevantes antes de pasarlas a un modelo mayor, siempre que se validen sus tasas de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a describir la receta de cuantizacion, los ficheros incluidos y los parametros de escala; no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, ni tampoco comparaciones con la cuantizacion sin imatrix o con el modelo base en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay mediciones publicadas. Como referencia de orden de magnitud, el repositorio ocupa 0,6 GB y los pesos suman unos 772,8 millones de parametros, por lo que el peso del modelo es inferior a 1 GB. A esa cifra hay que sumar el coste de la cache KV (que en esta receta se gestiona tambien en MXFP4) y el overhead del runtime.
- GPU recomendadas: no disponible, no se especifican. Por tamano, cualquier GPU con mas de 2 GB de memoria libre deberia poder alojarlo.
- Cabe en GPU consumer: si. El modelo esta en el rango de GPU de gama baja y de iGPU con memoria compartida, aunque no hay cifras de rendimiento publicadas para confirmarlo.
- Ejecucion en CPU: viable por tamano, siempre que se use un runtime con soporte para MXFP4.
- Opciones de despliegue: llama.cpp es el entorno de referencia (la receta esta escrita con `llama-imatrix` y `llama-quantize`). El autor mantiene un PR relacionado en su fork de llama.cpp. Otros runtimes GGUF (Ollama, llama-cpp-python, LM Studio) dependen de que soporten MXFP4; no esta confirmado en la informacion disponible. El soporte en vLLM o TGI no se menciona.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones del modelo base en la informacion proporcionada, por lo que la comparativa se limita a lo que puede afirmarse con certeza.

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| timlikesai/Qwen3.5-0.8B-MXFP4 | 772.845.888 | no disponible | GGUF | MXFP4 4,25 bits con imatrix | no disponible | repositorio publico, 0 descargas |
| ggml-org/Qwen3.5-0.8B | no disponible | no disponible | no disponible | modelo base, sin cuantizar | no disponible | referenciado como origen |
| Otras cuantizaciones del mismo modelo base (Q4_K_M, Q8_0, etc.) | 772.845.888 (los mismos) | no disponible | GGUF | 4-8 bits, sin imatrix | depende del modelo base | no verificadas en la informacion disponible |
| Modelos de otras familias en el rango 0,5-1B | no disponible | no disponible | no disponible | no disponible | no disponible | comparativa no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser una cuantizacion de un modelo base no descrito, los sesgos heredados no pueden enumerarse con la informacion publicada.
- Riesgo de alucinacion: no cuantificado. Un modelo de 0,77 mil millones de parametros tiene, por su capacidad, una tasa de error factual mayor que modelos de mayor tamano; no hay evaluaciones que lo midan en esta version.
- Efecto de la cuantizacion: MXFP4 a 4,25 bits introduce perdida de precision respecto al modelo original. La model card no publica perplejidad ni comparacion con la version sin cuantizar, por lo que el impacto real no esta medido.
- Soporte de runtime limitado: MXFP4 con escalas e8m0 y la ruta de cache KV con escalado UOS no estan soportados por todos los motores de inferencia. El autor referencia un PR en su propio fork de llama.cpp, lo que indica que puede requerir una build especifica.
- Compatibilidad de hardware: la aceleracion nativa de formatos FP4 depende de la generacion de GPU; en hardware sin soporte, el runtime debe de-cuantizar, con la penalizacion de rendimiento correspondiente. Este extremo no se detalla en la model card.
- Restricciones de licencia: la licencia no esta declarada en el repositorio. Antes de cualquier uso comercial hay que verificar la licencia del modelo base ggml-org/Qwen3.5-0.8B, ya que una cuantizacion no puede otorgar derechos mas amplios que el original.
- Idioma: no se declaran idiomas soportados. No hay garantia de calidad en castellano ni en otros idiomas distintos del que use el modelo base de forma mayoritaria.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. Es un artefacto sin validacion por parte de la comunidad y sin historial de uso.
- Datos ausentes: no hay informacion sobre longitud de contexto, capacidades de tool calling, ni resultados de evaluacion. Cualquier decision de produccion deberia apoyarse en una evaluacion propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/timlikesai/Qwen3.5-0.8B-MXFP4
- Modelo base: https://huggingface.co/ggml-org/Qwen3.5-0.8B
- PR relacionado en el fork de llama.cpp del autor: https://github.com/timlikesai/llama.cpp/pull/14
- Ficheros del repositorio: `0.8b-mxfp4-imx.gguf` (pesos MXFP4) y `0.8b.imatrix` (matriz de importancia, datos de entrenamiento tipo wiki)
