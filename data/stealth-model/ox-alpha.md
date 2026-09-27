# stealth-model/ox-alpha

## Resumen

Ox Alpha es un modelo de razonamiento multimodal publicado de forma anonima por la organizacion `stealth-model` el 20 de agosto de 2026 en OpenRouter y OpenCode, y subido a Hugging Face el 27 de septiembre de 2026. Se distribuyo como "modelo stealth" con acceso gratuito durante una ventana de previsualizacion de aproximadamente una semana, con una ventana de contexto de 1.000.000 de tokens y entrada de texto, imagen y video. Su posicionamiento declarado es el de un modelo de razonamiento orientado a generacion de codigo, tareas agente sostenidas en el tiempo y cargas de trabajo de produccion.

La propia model card identifica el modelo como "revelado como GLM-5.3-Flash", el modelo multimodal de Z.ai para codigo y tareas agente largas. Segun el agregador stealthmodels.com, los pesos oficiales de GLM-5.3-Flash estan disponibles en el repositorio `zai-org/GLM-5.3-Flash` bajo licencia MIT, y Unsloth publica cuantizaciones GGUF en `unsloth/GLM-5.3-Flash-GGUF` para inferencia local. El repositorio `stealth-model/ox-alpha` actua, por tanto, como ficha de presentacion del modelo stealth mas que como deposito de pesos.

La relevancia actual del modelo reside en tres factores: una ventana de contexto de un millon de tokens poco habitual en modelos abiertos, soporte nativo de `tool calling` y entrada multimodal (texto, imagen y video), y la disponibilidad de pesos con licencia permisiva a traves de Z.ai. No se han publicado en la informacion disponible el numero de parametros, la composicion del dataset de entrenamiento ni resultados detallados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de razonamiento; la informacion no especifica transformer, MoE ni hibrida) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | GGUF publicados por Unsloth (niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | el repositorio `stealth-model/ox-alpha` no declara licencia; stealthmodels.com indica licencia MIT para los pesos de GLM-5.3-Flash |
| Formato de pesos | safetensors (pesos oficiales de Z.ai) y GGUF (Unsloth) |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura interna del modelo en los materiales disponibles. La model card y las fuentes secundarias lo describen unicamente como un modelo multimodal de razonamiento con capacidad de procesar texto, imagen y video, y con una ventana de contexto de 1.000.000 de tokens. No se especifica si emplea una arquitectura transformer densa, un esquema MoE, atencion lineal o un diseno hibrido, ni si incorpora tecnicas de decodificacion especulativa.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento. La etiqueta `glm-5.3-flash` en el repositorio y la afirmacion de que el modelo fue "revelado como GLM-5.3-Flash" apuntan a que se trata de los pesos de Z.ai redistribuidos bajo una identidad anonima, pero esta atribucion procede de fuentes de terceros y no de documentacion oficial del modelo stealth. Como innovacion destacable, la unica confirmada en la informacion disponible es la combinacion de contexto de 1M tokens con entrada multimodal (texto, imagen y video) y soporte de `tool calling`.

## Capacidades

- Generacion de texto y razonamiento explicito: el modelo se posiciona como "reasoning model" para tareas de codigo y trabajo agente sostenido.
- Generacion y comprension de codigo: caso de uso principal declarado, orientado a produccion.
- Entrada multimodal: soporta texto, imagen y video como entrada, segun kie.ai y la propia ficha de presentacion.
- Generacion de arte SVG: la etiqueta `svg` del repositorio y el ejemplo de la model card (una ilustracion de un buey jade) sugieren capacidad especifica de generacion de graficos vectoriales.
- Tool calling / function calling: confirmado por la descripcion de OpenRouter y por el posicionamiento para "agentic work".
- Razonamiento multi-paso y tareas agente de larga duracion: la ventana de 1M tokens permite mantener estado de agente durante sesiones extensas.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo de pensamiento explicito ("thinking mode"): no disponible; la informacion solo indica que es un modelo de razonamiento.

## Casos de uso

- Refactorizacion de bases de codigo extensas: con 1M tokens de contexto, el modelo puede cargar simultaneamente multiples modulos, ficheros de configuracion y tests, y proponer cambios coherentes a lo largo de todo el repositorio sin perder referencias cruzadas.
- Agentes de codigo autonomos en CI/CD: gracias al soporte de `tool calling`, puede invocarse desde pipelines para leer issues, generar parches, ejecutar tests y abrir pull requests en varios pasos encadenados.
- Revision de codigo asistida: el modelo puede analizar un diff junto con el contexto completo del proyecto afectado y detectar regresiones o inconsistencias que un modelo con ventana corta no podria evaluar.
- Analisis de documentacion tecnica multimodal: al aceptar imagenes y video, puede procesar diagramas de arquitectura, capturas de pantalla de errores o grabaciones de reproduccion de fallos junto con el texto del informe.
- Generacion de graficos vectoriales y material visual: la capacidad etiquetada como `svg` lo hace util para generar iconos, diagramas e ilustraciones vectoriales a partir de descripciones en lenguaje natural.
- Asistentes de soporte tecnico especializado: la ventana de 1M tokens permite mantener el historial completo de incidencias de un cliente, manuales de producto y transcripciones en una misma conversacion multi-turno.
- Automatizacion de tareas de investigacion con fuentes largas: ingesta de articulos, informes o transcripciones extensas en una sola pasada para resumir, extraer entidades y generar informes estructurados.
- Migracion de sistemas legacy: carga del codigo antiguo y del nuevo framework de destino en el mismo contexto para generar traducciones de codigo asistidas y consistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. El unico dato cuantitativo encontrado procede de benchable.ai, que situa a Ox Alpha en el percentil 51 de tiempo de respuesta agregado en ocho benchmarks, sin especificar cuales ni con que puntuacion. No se dispone de cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra prueba estandar, por lo que no se incluye tabla comparativa de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse el numero de parametros, no es posible calcular requisitos de memoria fiables.
- GPU recomendadas: no disponible por la misma razon; en el caso de que los pesos correspondan a un modelo de escala frontier, serian necesarios aceleradores de datacenter (A100, H100 o equivalentes) para el modelo completo en precision nativa.
- Inferencia en GPU de consumo: viable unicamente a traves de las cuantizaciones GGUF de Unsloth, cuyo nivel de compresion y tamano final no se detallan en la informacion disponible. El contexto de 1M tokens impone requisitos de memoria de KV cache muy elevados, por lo que en GPUs de consumo sera necesario limitar drasticamente la longitud de contexto efectiva.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF de Unsloth; vLLM, SGLang o TGI para los pesos safetensors en servidor; acceso gestionado mediante OpenRouter, OpenCode y la API de Tokenra durante y despues de la previsualizacion.
- Latencia y throughput: no disponible. La unica referencia es la clasificacion en el percentil 51 de tiempo de respuesta de benchable.ai, que no se traduce en valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ox Alpha (`stealth-model/ox-alpha`) | no disponible | 1M tokens | percentil 51 en tiempo de respuesta segun benchable.ai; sin benchmarks de calidad publicados | no declarada en el repositorio; MIT segun stealthmodels.com | Hugging Face, OpenRouter, OpenCode, Tokenra |
| GLM-5.3-Flash (`zai-org/GLM-5.3-Flash`) | no disponible | no disponible | no disponible | MIT segun stealthmodels.com | pesos oficiales en Hugging Face |
| GLM-5.3-Flash GGUF (`unsloth/GLM-5.3-Flash-GGUF`) | no disponible | heredado del modelo base | no disponible | heredada del modelo base | Hugging Face, inferencia local |
| Otros modelos de razonamiento con contexto de 1M | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa mas directa es con la publicacion oficial de GLM-5.3-Flash, que segun todas las fuentes consultadas contiene los mismos pesos bajo una identidad no anonimizada. No se dispone de datos de parametros, contexto ni rendimiento de modelos alternativos de la misma categoria, por lo que no se puede establecer una comparacion cuantitativa con competidores como otros modelos frontier de codigo y agentes.

## Limitaciones y advertencias

- Atribucion no verificada: la identificacion de Ox Alpha como GLM-5.3-Flash procede del agregador stealthmodels.com y de la propia model card, no de un anuncio oficial conjunto. Conviene verificar la equivalencia de pesos antes de basar decisiones de produccion en ella.
- Ausencia de licencia explicita en el repositorio de Hugging Face: la ficha de `stealth-model/ox-alpha` no declara licencia. La licencia MIT mencionada corresponde al repositorio oficial de Z.ai y debe confirmarse para el uso comercial.
- Falta de transparencia tecnica: no se publican parametros, arquitectura, dataset ni proceso de alineamiento, lo que dificulta evaluar riesgos de sesgo, contaminacion de benchmarks o comportamientos indeseados.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual ni de tasas de alucinacion. En tareas de codigo y agentes, los errores silenciosos pueden propagarse a produccion.
- Idiomas no declarados: se desconoce el soporte real de idiomas distintos del ingles, incluido el castellano, y el rendimiento relativo entre ellos.
- Coste de contexto: una ventana de 1M tokens implica un consumo de memoria de KV cache muy alto y latencias mayores; en la practica, la mayoria de despliegues tendra que operar con contextos mucho mas cortos.
- Naturaleza de previsualizacion: el acceso gratuito se anuncio como una ventana de aproximadamente una semana con precios 0/0, por lo que las condiciones de servicio, los limites de uso y la disponibilidad pueden haber cambiado desde entonces.
- Sin historial de adopcion: el repositorio registra cero descargas y cero "likes", y no hay datos publicados de estabilidad en produccion ni de soporte a largo plazo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stealth-model/ox-alpha
- Pagina de presentacion del modelo: https://stealthmodels.com/ox-alpha/
- Pesos oficiales de GLM-5.3-Flash (Z.ai): https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizaciones GGUF de Unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Stealth AI Models (agregador e identidades reveladas): https://stealthmodels.com/
- Analisis de kie.ai: https://kie.ai/blog/what-is-ox-alpha
- Ficha y benchmarks en benchable.ai: https://benchable.ai/models/stealth/ox-alpha
- Analisis de explainx.ai: https://www.explainx.ai/blog/openrouter-ox-alpha-stealth-model-august-2026
- Sitio del modelo con ejemplos SVG y precios de API: https://oxalpha.io/
