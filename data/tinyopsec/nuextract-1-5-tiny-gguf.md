# tinyopsec/NuExtract-1.5-tiny-GGUF

## Resumen

NuExtract-1.5-tiny-GGUF es una colección de cuantizaciones en formato GGUF del modelo numind/NuExtract-1.5-tiny, publicada por el usuario tinyopsec en Hugging Face. El modelo original es un fine-tuning de Qwen2.5-0.5B (494 millones de parámetros) especializado en extracción estructurada de información, es decir, en generar salidas JSON o con esquema definido a partir de texto de entrada.

La relevancia de esta versión GGUF radica en la portabilidad: al estar cuantizado en múltiples niveles (desde F16 hasta Q2_K), puede ejecutarse con llama.cpp, Ollama, LM Studio o koboldcpp en hardware muy modesto, incluso en CPUs de escritorio o portátiles, sin depender de GPUs dedicadas. Esto lo hace adecuado para pipelines de extracción de datos donde se necesita un modelo pequeño, rápido y con licencia MIT, apta para uso comercial sin restricciones.

La model card original es escasa en detalles técnicos: no se publican benchmarks, ni datos sobre el entrenamiento del fine-tuning, ni los idiomas soportados. Los datos verificables son la arquitectura base (Qwen2), el tamaño (494 M de parámetros) y la lista completa de cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no consta que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base original se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder denso de la familia Qwen2 de Alibaba, y fue ajustado por NuMind para tareas de extraccion de informacion estructurada. La version GGUF de tinyopsec no modifica la arquitectura: se limita a convertir los pesos a formato GGUF mediante llama.cpp y aplicar cuantizacion k-quants y por bloques en distintos niveles de precision.

No se dispone de informacion publicada sobre el proceso de fine-tuning de NuExtract-1.5-tiny (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni sobre las capacidades de contexto extendido que la serie NuExtract 1.5 anuncia en su model card original. La model card del repositorio GGUF tampoco documenta innovaciones tecnicas adicionales; el unico trabajo tecnico documentado es la produccion de las 13 cuantizaciones listadas.

## Capacidades

- Extraccion de informacion estructurada: genera salidas en formato JSON o esquema definido a partir de texto libre, que es la tarea para la que se ajusto el modelo base.
- Generacion de texto general heredada de Qwen2.5-0.5B, aunque sin estar optimizada para ello.
- Ejecucion local con llama.cpp mediante `llama-cli` o con runtimes compatibles con GGUF (Ollama, LM Studio, koboldcpp).
- Etiquetado como `conversational` en Hugging Face, lo que sugiere compatibilidad con plantillas de chat, aunque el uso principal previsto es la extraccion.
- No hay evidencia de capacidades de vision, audio, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Extraccion de entidades en documentos de negocio: dada una plantilla JSON (nombres, fechas, importes, organizaciones), el modelo rellena el esquema a partir de correos, contratos o facturas, aprovechando su especializacion en salida estructurada.
- Pipelines ETL de bajo coste: su tamano de menos de 1 GB cuantizado permite desplegarlo en CPUs baratas o funciones serverless para enriquecer registros de bases de datos con campos extraidos de texto.
- Procesamiento de logs y tickets: clasificacion y estructuracion de incidencias de soporte extrayendo campos como producto, severidad o fecha, sin depender de APIs externas.
- Aplicaciones edge y offline: al ejecutarse con Ollama o LM Studio en portatiles sin GPU, es viable para herramientas de escritorio que necesiten extraer datos sin conexion.
- Prototipado rapido de flujos de extraccion: la licencia MIT y el tamano reducido permiten iterar esquemas de extraccion en local antes de escalar a modelos mayores.
- Preprocesamiento en sistemas RAG: extraccion de metadatos (autores, fechas, temas) de fragmentos de documentos antes de indexarlos en un buscador vectorial.
- Cumplimiento y privacidad: al ser un modelo local y pequeno, es adecuado para extraer datos de documentos sensibles (salud, legal) sin enviar texto a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas, y el autor se limita a advertir: "Structured extraction model. Evaluate before use."

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo F16 ocupa 1,0 GB; las cuantizaciones Q4_K_M y similares ocupan aproximadamente 0,3-0,4 GB, y Q2_K menos de 0,25 GB. El tamano total del repositorio es de 5,8 GB por las 13 variantes.
- No requiere GPU: al ser un modelo de 0,5 B de parametros, ejecuta con fluidez en CPU. Con GPU, cualquier aceleradora moderna es mas que suficiente.
- Cabe sobradamente en cualquier GPU de consumo (incluso con 2 GB de VRAM en la mayoria de cuantizaciones) y en la RAM de practicamente cualquier ordenador actual.
- Despliegue: llama.cpp (`llama-cli -m model-Q4_K_M.gguf -p "..." -n 256`), Ollama, LM Studio, koboldcpp o cualquier runtime compatible con GGUF. No hay soporte documentado de vLLM o TGI para esta version GGUF (vLLM requiere el modelo original en safetensors).
- Latencia: no disponible; dada la talla del modelo, se espera respuesta rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia |
|---|---|---|---|---|
| NuExtract-1.5-tiny-GGUF (este) | 494 M | GGUF (13 cuantizaciones) | Extraccion estructurada | MIT |
| numind/NuExtract-1.5-tiny (original) | 494 M | safetensors | Extraccion estructurada | no disponible en la ficha |
| Qwen/Qwen2.5-0.5B (base) | 494 M | safetensors | Generacion de texto general | no disponible en la ficha |
| numind/NuExtract-1.5 (hermanos mayores) | no disponible | safetensors | Extraccion estructurada | no disponible en la ficha |

La comparacion mas relevante es con su propio modelo base: NuExtract-1.5-tiny sacrifica la versatilidad general de Qwen2.5-0.5B a cambio de especializacion en salida estructurada, y esta version GGUF anade portabilidad a costa de una ligera perdida de precision por cuantizacion. Frente a LLMs generales de 7B usados para extraccion (Llama 3, Mistral), ofrece un consumo de recursos entre 10 y 20 veces menor, con la contrapartida de una capacidad de razonamiento mucho mas limitada.

## Limitaciones y advertencias

- El propio autor advierte en la model card: "Structured extraction model. Evaluate before use"; es imprescindible evaluar la calidad de extraccion sobre los datos reales antes de llevarlo a produccion.
- No se publican benchmarks ni metricas de calidad, por lo que la perdida de precision de cada cuantizacion (especialmente Q3 y Q2_K) no esta documentada; para extraccion estructurada se recomienda empezar por Q4_K_M o superior.
- Idiomas soportados no disponibles: aunque Qwen2.5 es multilingue, el fine-tuning de NuMind puede haber sesgado el modelo hacia el ingles; verificar antes de usarlo en castellano.
- Longitud de contexto no documentada en este repositorio, lo que limita la planificacion de documentos largos.
- Riesgo de alucinacion de campos: los modelos de extraccion pequenos pueden inventar valores ausentes en el texto si el esquema lo exige; conviene validar la salida JSON.
- Capacidades limitadas para razonamiento complejo, codigo o conversacion general al tratarse de un modelo de 0,5 B especializado.
- La licencia MIT del repositorio GGUF no garantiza que los terminos del modelo original de NuMind permitan exactamente los mismos usos; revisar la licencia de numind/NuExtract-1.5-tiny para uso comercial.
- El repositorio tiene muy poca traccion (348 descargas, 0 likes) y no procede del autor oficial del modelo, por lo que conviene verificar la integridad de los archivos GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/NuExtract-1.5-tiny-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo original fine-tuned: https://huggingface.co/numind/NuExtract-1.5-tiny
