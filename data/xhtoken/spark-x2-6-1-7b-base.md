# XHToken/Spark-X2.6-1.7B-Base

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje compacto de tipo decoder-only para generacion de texto, desarrollado por el equipo SparkLLM (organizacion XHToken). Se trata del segundo modelo de la serie Spark-X2.6, tras el Spark-X2.6-4B, y constituye una actualizacion del Spark-X2.5-1.7B orientada al despliegue en dispositivo (on-device). Con 1.707.657.216 parametros reales en safetensors y un repositorio de 3,4 GB, se posiciona en la franja de modelos pequenos pensados para ejecucion local con requisitos de hardware modestos.

La propuesta central del modelo es mantener exactamente la misma arquitectura que su predecesor Spark-X2.5-1.7B y obtener las mejoras de capacidad exclusivamente mediante un post-entrenamiento mejorado. Segun la model card, esto se traduce en avances en codigo, uso de agentes, contexto largo, multilingue y razonamiento, manteniendo una eficiencia de inferencia competitiva entre modelos de tamano comparable. La variante publicada en este repositorio es la version Base, con pesos en formato Transformers.

El modelo es relevante ahora porque combina una licencia permisiva (Apache 2.0), soporte para ingles y chino, y un mecanismo de presupuesto de razonamiento configurable (thinking budget con niveles none, low y high) que permite ajustar latencia y coste de inferencia segun la aplicacion. Esto lo hace atractivo para escenarios de agentes locales y automatizacion en el borde, donde el control fino del coste computacional es critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (tag `spark2_5`, requiere `custom_code`); misma arquitectura que Spark-X2.5-1.7B |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona mejoras en contexto largo, sin cifra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,7 mil millones de parametros que conserva la arquitectura exacta de Spark-X2.5-1.7B. Segun la model card, las ganancias de capacidad no provienen de cambios estructurales, sino de un post-entrenamiento mejorado que incide en codigo, comportamiento agentico, contexto largo, multilingue y razonamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO.

La innovacion tecnica destacada es el presupuesto de razonamiento controlable (thinking budget), con tres niveles configurables (none, low, high) que permiten a la aplicacion equilibrar calidad de razonamiento, latencia y coste de inferencia de forma dinamica. El repositorio usa la etiqueta `custom_code`, lo que implica que la carga del modelo requiere codigo personalizado del autor a traves de Transformers. No se detallan en la informacion proporcionada otras innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento con presupuesto configurable en tres niveles: none, low y high.
- Codigo y ingenieria de software: la model card cita mejoras sustanciales en tareas de software engineering.
- Uso de herramientas y agentes: mejoras en tool use complejo y planificacion multi-paso.
- Razonamiento sobre contextos extendidos (long-context), sin cifra concreta publicada.
- Capacidades multilingues, con soporte declarado para ingles y chino.
- Ajuste fino recomendado mediante Llama-Factory (fork del autor en GitHub).
- No se declaran capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Agentes locales en dispositivo: el modelo puede ejecutar planificacion multi-paso y uso de herramientas en entornos con recursos limitados, aprovechando su tamano de 1,7B parametros y el control del thinking budget para acotar latencia.
- Asistentes de codigo embebidos: con mejoras declaradas en software engineering, puede integrarse en IDE o pipelines de CI/CD para sugerencias y tareas de refactorizacion, ajustando el nivel de razonamiento segun la complejidad.
- Atencion al cliente multi-turno: su naturaleza conversacional y el soporte de contexto largo permiten gestionar dialogos prolongados en ingles o chino, con el nivel de thinking en none o low para respuestas rapidas.
- Automatizacion de tareas con tool calling: integrable en flujos que requieran invocar APIs o funciones externas, usando el nivel high de razonamiento para planificaciones complejas.
- Procesamiento de documentos largos: el enfasis en long-context lo hace adecuado para resumen y extraccion sobre textos extensos, aunque la ventana exacta no esta publicada.
- Prototipado e investigacion: al ser Apache 2.0 y con soporte de Llama-Factory, sirve como base para experimentacion y ajuste fino en laboratorios con GPU de consumo.
- Despliegue en el borde para aplicaciones bilingues ingles-chino: traduccion asistida, generacion de contenido y asistentes en dispositivos con recursos acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (1,7B parametros), en FP16 requeriria del orden de 3,4 GB solo para pesos; en cuantizacion de 8 bits alrededor de 1,7 GB y en 4 bits alrededor de 0,9 GB, sin contar overhead de activaciones y cache KV. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU de consumo: por tamano, es probable que quepa en GPU de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores), pero el autor no lo confirma.
- Opciones de despliegue: la model card indica formato Hugging Face Transformers con `custom_code`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Base | 1,71B | no disponible | Apache 2.0 | en, zh | Thinking budget configurable; misma arquitectura que X2.5-1.7B |
| Spark-X2.6-4B | no disponible | no disponible | Apache 2.0 | no disponible | Version mayor de la misma serie |
| Spark-X2.5-1.7B | 1,7B (segun serie) | no disponible | no disponible | no disponible | Predecesor directo, misma arquitectura |

No se dispone en la informacion proporcionada de datos de rendimiento ni de otros modelos comparables de terceros para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados de los datos de entrenamiento, no detallados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se publican evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: solo se declaran ingles y chino; la longitud de contexto no esta especificada, lo que impide garantizar el comportamiento en ventanas largas mas alla de lo que indique la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del codigo personalizado (`custom_code`) asociado al modelo.
- Caveats para produccion: requiere `custom_code` para cargarse en Transformers, lo que puede complicar la integracion con stacks estandar; no se documentan cuantizaciones oficiales ni soporte en motores de inferencia de alto rendimiento; el thinking budget anade un parametro de configuracion que debe gestionarse en la aplicacion.
- La variante publicada es Base, no una version instruct/chat explicitamente etiquetada, aunque la model card la describe como post-entrenada y conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Licencia: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base/blob/main/LICENSE
- Llama-Factory (fork del autor): https://github.com/XHToken/LlamaFactory
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
