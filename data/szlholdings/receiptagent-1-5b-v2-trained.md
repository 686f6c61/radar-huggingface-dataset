# SZLHOLDINGS/receiptagent-1.5b-v2-trained

## Resumen

SZLHOLDINGS/receiptagent-1.5b-v2-trained es un modelo publicado en Hugging Face por la organizacion SZLHOLDINGS bajo la libreria transformers. Por el identificador se infiere que se trata de un modelo de aproximadamente 1.500 millones de parametros, presuntamente orientado a tareas de agente sobre recibos (extraccion de datos, procesamiento de documentos financieros), aunque la model card no confirma ni el proposito ni la arquitectura. El repositorio se creo el 14 de noviembre de 2026 y no registra descargas ni interacciones en el momento de la consulta.

La model card es la plantilla autogenerada por Hugging Face y no contiene informacion sustantiva: todos los campos de descripcion, entrenamiento, evaluacion y uso previsto aparecen como "[More Information Needed]". No se declara licencia, idiomas, pipeline ni origen de los datos de entrenamiento, lo que limita severamente cualquier evaluacion tecnica rigurosa.

La relevancia de esta ficha es, por tanto, principalmente documental: sirve para dejar constancia de que el modelo existe en el Hub, de sus metadatos verificables (tags, tamano de repositorio, compatibilidad con endpoints) y de la ausencia casi total de informacion publica, un factor critico para quien considere su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el tag transformers sugiere un transformer, sin confirmar) |
| Parametros totales | no disponible (el identificador sugiere 1.5B, sin confirmar por el autor) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.0 GB (segun metadatos del Hub) |
| Libreria | transformers |
| Pipeline declarado | no disponible |
| Compatibilidad | endpoints_compatible |
| Fecha de creacion | 2026-11-14 |
| Fecha de actualizacion | 2026-11-14 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante. El tag `transformers` y la presencia de pesos en `safetensors` son los unicos indicios, y no permiten confirmar la familia arquitectonica ni el objetivo de entrenamiento.

Tampoco se documenta el proceso de entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo ajuste supervisado, RLHF, DPO u otra etapa de alineamiento, ni los hiperparametros utilizados. El unico enlace tecnico presente en la model card es la referencia generica al calculador de impacto climatico de Lacoste et al. (2019), que forma parte de la plantilla por defecto y no aporta datos reales del modelo. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto: no confirmada explicitamente, aunque es la funcion esperada de un modelo transformers de tipo causal o seq2seq.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, pese a que el nombre "receiptagent" sugiere un uso agentico.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

Dado que la model card no documenta el uso previsto, los siguientes escenarios son hipotesis razonables derivadas del nombre del modelo y deben validarse empiricamente antes de cualquier despliegue:

- Extraccion estructurada de datos de recibos: el modelo podria emplearse para convertir texto OCR de tickets en campos estructurados (fecha, comercio, importe, impuestos), aunque no hay evidencia publicada de su calidad en esta tarea.
- Clasificacion de gastos: integrado en un pipeline de contabilidad, podria categorizar lineas de recibo por tipo de gasto; requiere validacion previa con un conjunto de test propio.
- Automatizacion de la conciliacion de gastos: como componente de un agente que cruce recibos con extractos bancarios, siempre que se confirme su soporte de tool calling, hoy no documentado.
- Procesamiento por lotes en backend: al ser un modelo de ~1.5B parametros (segun el identificador), podria desplegarse en GPU de gama media para procesar volumenes altos de documentos con latencia baja, pendiente de medir.
- Prototipado de asistentes financieros: util para experimentar con flujos de agente sobre documentos, dado su tamano manejable y su compatibilidad con endpoints.
- Fine-tuning especifico: serviria como base para ajuste supervisado en dominios de recibos o facturas, aunque la ausencia de licencia clara impide confirmar si el uso comercial esta permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamano inferido de ~1.5B parametros, la inferencia en fp16 requeriria aproximadamente 3 GB de VRAM solo para pesos, y en cuantizacion de 8 bits alrededor de 1.5-2 GB, sin contar cache KV ni overhead del runtime.
- GPU recomendadas: no disponibles. Para un modelo de este tamano, GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti o RTX 4090 serian suficientes en teoria, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si, segun el tamano inferido, pero no verificado.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI; al no haber pesos GGUF en el repositorio, llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque el autor no publica parametros, contexto, licencia ni resultados de evaluacion. A modo de referencia estructural, se comparan las caracteristicas declaradas con las de modelos pequenos de proposito general ampliamente documentados:

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| SZLHOLDINGS/receiptagent-1.5b-v2-trained | no disponible (~1.5B por el identificador) | no disponible | no disponible | practicamente nula (plantilla autogenerada) |
| Qwen2.5-1.5B | 1.5B | 32K (version base) | Apache 2.0 | completa, con benchmarks |
| Llama 3.2 1B | 1.2B | 128K | Llama 3.2 Community License | completa, con benchmarks |
| Gemma 2 2B | 2.6B | 8K | Gemma Terms of Use | completa, con benchmarks |

La comparacion se limita a datos publicos de esos modelos; no se dispone de informacion para contrastar rendimiento del modelo de SZLHOLDINGS frente a ellos.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto, sin descripcion, datos de entrenamiento ni evaluacion.
- Licencia no declarada: no puede asumirse uso comercial; en ausencia de licencia explicita, los derechos de uso son inciertos.
- Riesgo de alucinacion desconocido: sin benchmarks ni ejemplos, no hay forma de estimar la fiabilidad en tareas de extraccion de datos financieros, donde un error tiene consecuencias directas.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de alineamiento.
- Idiomas no declarados: no se puede confirmar el soporte de castellano ni de otros idiomas.
- Contexto y cuantizaciones no disponibles: dificulta planificar el despliegue y el coste de inferencia.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Repositorio de 0.0 GB: conviene verificar que los pesos estan efectivamente subidos y son descargables antes de integrar el modelo en cualquier pipeline.
- Recomendacion: no desplegar en produccion sin una evaluacion propia previa y sin aclaracion de la licencia por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/receiptagent-1.5b-v2-trained
- Perfil del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Referencia citada en la model card (calculador de impacto climatico): https://mlco2.github.io/impact#compute
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
