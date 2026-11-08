# sujalgawas/tiny-aya-global-grpo-schema-adapter

## Resumen

El modelo `sujalgawas/tiny-aya-global-grpo-schema-adapter` es un adaptador LoRA publicado en Hugging Face por el usuario sujalgawas, construido sobre el modelo base CohereLabs/tiny-aya-global. No se trata de un modelo completo, sino de un ajuste fino con PEFT (Parameter-Efficient Fine-Tuning) orientado a una tarea muy concreta: la extraccion de informacion condicionada por un esquema JSON arbitrario. El entrenamiento se ha realizado con la herramienta AlignTune (Lexsi-Labs/aligntune) sobre datos curados con CuratorKIT (Lexsi-Labs/CuratorKIT), empleando GRPO (Group Relative Policy Optimization) como algoritmo de optimizacion.

El interes de esta publicacion reside en su especializacion: en lugar de competir en capacidades generales, el adaptador busca que el modelo base genere salidas estructuradas y validas contra un JSON Schema dado, un requisito habitual en pipelines de extraccion de datos, integracion con APIs y agentes que necesitan respuestas parseables. Al ser un adaptador LoRA sobre un modelo de 3.35B parametros (Tiny Aya), el coste de despliegue es bajo y puede combinarse con el modelo base sin duplicar pesos.

La relevancia es limitada por su escasa traccion (0 descargas y 0 likes en el momento de la consulta) y por la ausencia de datos publicados de evaluacion. Se trata, por tanto, de un artefacto experimental util para quien quiera reproducir o partir de un ajuste GRPO para salida estructurada, no de un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only del modelo base CohereLabs/tiny-aya-global |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto; el modelo base declara 3.35B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no declarada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles en la model card; el modelo base Tiny Aya cubre 70 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre CohereLabs/tiny-aya-global, un modelo de 3.35B parametros de la familia Tiny Aya. Segun el paper de Tiny Aya, esta familia incluye una version base preentrenada en 70 idiomas, una version Global ajustada por instrucciones para rendimiento multilingue consistente y tres variantes regionales. El adaptador en cuestion no modifica la arquitectura: anade matrices de bajo rango (LoRA) sobre las capas del transformer subyacente, de modo que la inferencia requiere cargar primero el modelo base y despues el adaptador con PEFT.

El entrenamiento se realizo con AlignTune usando GRPO, un algoritmo de optimizacion por politica que compara grupos de respuestas y refuerza las mejores segun una recompensa. En este caso la recompensa esta orientada a la conformidad con un JSON Schema, es decir, a producir salidas estructuradas validas para un esquema dado. Los datos de entrenamiento se curaron con CuratorKIT. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el rango de LoRA, la tasa de aprendizaje ni la configuracion exacta de GRPO.

## Capacidades

- Extraccion de informacion condicionada por JSON Schema: el adaptador esta entrenado para generar salidas que se ajusten a un esquema proporcionado en el prompt.
- Generacion de salida estructurada: orientado a producir JSON parseable y validable, no texto libre.
- Herencia de capacidades del modelo base Tiny Aya Global: generacion de texto y comportamiento multilingue (hasta 70 idiomas en el modelo base), aunque el adaptador puede degradar o sesgar ese comportamiento hacia la tarea de extraccion.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el ajuste se centra en extraccion en un solo paso.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de entidades a JSON: dado un texto libre y un esquema con campos como nombre, fecha o importe, el adaptador genera un objeto JSON conforme al esquema, lo que simplifica el parseo posterior en pipelines de datos.
- Normalizacion de respuestas de formularios: convertir texto introducido por usuarios en estructuras validas contra el esquema interno de una aplicacion, reduciendo la logica de validacion manual.
- Integracion con APIs que exigen payloads estrictos: generar cuerpos de peticion que cumplan un JSON Schema antes de enviarlos a un servicio externo.
- Enriquecimiento de datasets: procesar lotes de documentos y producir registros estructurados listos para bases de datos relacionales o almacenes documentales.
- Preprocesado para agentes: usar el adaptador como paso de structured output antes de que un agente de mas capacidad decida la siguiente accion, aprovechando su bajo coste de inferencia.
- Prototipado de pipelines de extraccion en entornos con recursos limitados: al ser un LoRA sobre un modelo de 3.35B, puede ejecutarse en hardware modesto para pruebas de concepto antes de escalar a modelos mayores.
- Extraccion multilingue: si el modelo base conserva su cobertura de 70 idiomas, puede aplicarse a documentos en varios idiomas, aunque no hay evaluacion publicada que lo confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 3.35B en bfloat16 requiere aproximadamente 6.7 GB solo para pesos, mas memoria para el adaptador, el tokenizador y la cache KV; en cuantizacion de 8 bits rondaria los 3.5-4 GB y en 4 bits unos 2-2.5 GB, aunque estas cifras no estan confirmadas para este adaptador.
- GPU recomendadas: no disponibles en la informacion. Por tamano, cabria esperar funcionamiento en GPUs consumer con 8-16 GB de VRAM (RTX 3060, 4060 Ti, 4070, 4080) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Compatibilidad con GPU consumer: probable por el tamano del modelo base, pero no verificada ni documentada por el autor.
- Opciones de despliegue: la model card solo documenta carga con Transformers + PEFT. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la compatibilidad con estos frameworks no esta confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sujalgawas/tiny-aya-global-grpo-schema-adapter | LoRA sobre 3.35B | no disponible | Extraccion con JSON Schema via GRPO | apache-2.0 | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global (base) | 3.35B | no disponible | Instrucciones multilingue general | no disponible en la informacion | Hugging Face |
| Adaptadores LoRA genericos para structured output | variable | depende del base | Salida JSON | variable | variable |

No se identifican en la informacion proporcionada alternativas directamente comparables con datos de rendimiento publicados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas de validez de esquema ni tasas de exito publicadas, lo que impide estimar su calidad real.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por terceros.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere cargar CohereLabs/tiny-aya-global, con los requisitos y limitaciones de este.
- Riesgo de alucinacion y de esquemas invalidos: aunque el entrenamiento con GRPO busca la conformidad con el esquema, no hay garantia de que todas las salidas sean JSON validos; se recomienda validacion posterior con una libreria de JSON Schema.
- Posible degradacion de capacidades generales: el ajuste especializado puede reducir el rendimiento en tareas de texto libre o conversacion no estructurada respecto al modelo base.
- Idiomas: la model card no declara idiomas soportados para el adaptador; la cobertura multilingue del base no garantiza que el adaptador la preserve.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento, no detallados.
- Caveat de produccion: al no haber informacion sobre el dataset, la configuracion de GRPO ni pruebas de robustez, no deberia desplegarse sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/sujalgawas/tiny-aya-global-grpo-schema-adapter
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Paper de Tiny Aya: https://arxiv.org/html/2603.11510v1
- AlignTune (Lexsi-Labs/aligntune): no disponible como URL directa en la informacion
- CuratorKIT (Lexsi-Labs/CuratorKIT): no disponible como URL directa en la informacion
