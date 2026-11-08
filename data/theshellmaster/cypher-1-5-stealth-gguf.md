# TheShellMaster/cypher-1.5-stealth-GGUF

## Resumen

Cypher 1.5 Stealth (GGUF) es una distribucion cuantizada del modelo Cypher 1.5 Stealth desarrollado por TheShellMaster, publicada en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. Se trata de un modelo conversacional orientado a ciberseguridad y programacion, con soporte para frances e ingles, distribuido bajo licencia Apache 2.0. El repositorio ocupa 2,6 GB e incluye las cuantizaciones Q8_0 y Q4_K_M.

El modelo cuenta con 1.543.714.304 parametros totales (aproximadamente 1,54 mil millones), lo que lo situa en la categoria de modelos pequenos optimizados para inferencia en hardware de consumo. La informacion publica no detalla la arquitectura interna ni la longitud de contexto, aunque por su tamano y formato de publicacion resulta adecuado para despliegues locales con recursos limitados.

Su relevancia actual radica en la combinacion de un enfoque de dominio especifico (ciberseguridad) con un formato de distribucion ligero y compatible con herramientas estandar de inferencia local. No obstante, el modelo presenta un nivel de adopcion muy bajo (0 descargas y 1 like en el momento de la consulta), lo que limita la evidencia disponible sobre su calidad y comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (tipo de transformer, atencion, capas, dimensiones ocultas) en la documentacion proporcionada. La model card unicamente describe el repositorio como una publicacion de versiones cuantizadas GGUF del modelo Cypher 1.5 Stealth original, sin detallar la estructura del modelo base.

Tampoco se han publicado datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) o innovaciones tecnicas especificas. La unica informacion contextual disponible es la orientacion tematica hacia ciberseguridad y programacion, inferida de las etiquetas del repositorio y de la descripcion del Space asociado, que indica que responde preguntas de programacion y puede realizar busquedas web para incorporar informacion actualizada.

## Capacidades

- Generacion de texto conversacional en frances e ingles.
- Respuesta a preguntas relacionadas con programacion, segun la descripcion del Space asociado.
- Orientacion tematica hacia ciberseguridad, segun las etiquetas del repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia estandar.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.
- El Space asociado menciona busqueda web automatica para consultas que requieren informacion actualizada, aunque esta funcionalidad parece implementada en la capa de aplicacion y no necesariamente en el modelo.

## Casos de uso

- Asistente de programacion local: el modelo puede desplegarse con Ollama o LM Studio en un equipo personal para responder dudas de codigo sin enviar datos a servicios externos, gracias a su tamano reducido (~1,54 B parametros) y formato GGUF.
- Consultas de ciberseguridad en entornos aislados: por su orientacion tematica, puede emplearse como apoyo en tareas de formacion o revision de conceptos de seguridad en entornos air-gapped, donde la inferencia local es un requisito.
- Prototipado rapido de chatbots: la cuantizacion Q4_K_M permite ejecutar el modelo en GPU de consumo con requisitos de VRAM modestos, lo que facilita iteraciones rapidas en el desarrollo de asistentes conversacionales.
- Soporte multilingue frances-ingles: util para aplicaciones dirigidas a usuarios de ambos idiomas, como herramientas internas de documentacion o asistencia tecnica bilingue.
- Integracion en pipelines de desarrollo: al ser compatible con llama.cpp, puede incorporarse en scripts y flujos automatizados que requieran generacion de texto o resumen de contenido tecnico.
- Evaluacion y experimentacion academica: su licencia Apache 2.0 y su tamano manejable lo hacen util como base para experimentos de ajuste fino o comparativas de modelos pequenos en el dominio de seguridad y codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en Q8_0 y en torno a 1,0-1,1 GB en Q4_K_M, considerando los pesos mas overhead de contexto (estimacion a partir del numero de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para Q8_0; GPU integradas o de gama baja pueden bastar para Q4_K_M.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna (GTX 1050 Ti o superior, RTX 3050, RTX 4060, etc.), asi como en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio, segun la model card. No se menciona soporte verificado para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa rigurosa. A continuacion se ofrece una comparacion estructural con alternativas de tamano similar ampliamente conocidas, marcando como no disponible cualquier dato no publicado para Cypher 1.5 Stealth.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Cypher 1.5 Stealth | ~1,54 B | no disponible | Apache 2.0 | GGUF |
| Qwen2.5-1.5B | ~1,54 B | 32K (modelo base) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B | ~1,7 B | 8K (modelo base) | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | ~2,6 B | 8K (modelo base) | Gemma Terms | safetensors, GGUF |

La comparativa de rendimiento en benchmarks no esta disponible para Cypher 1.5 Stealth.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se detallan arquitectura, datos de entrenamiento ni proceso de alineacion, lo que impide evaluar su calidad de forma informada.
- Nivel de adopcion minimo: 0 descargas y 1 like en el momento de la consulta, sin evidencia de uso en produccion ni validacion por parte de la comunidad.
- Riesgo de alucinacion: como modelo de ~1,54 B parametros sin benchmarks publicados, es previsible una tasa elevada de errores factuales, especialmente en dominios tecnicos como ciberseguridad.
- Cobertura linguistica limitada a frances e ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto desconocida, lo que dificulta planificar su uso en tareas que requieran ventanas amplias.
- La orientacion a ciberseguridad no implica que el modelo sea seguro frente a usos maliciosos; no se documentan mitigaciones ni filtros.
- Licencia Apache 2.0 permite uso comercial, pero al no existir evaluacion independiente se recomienda validacion exhaustiva antes de cualquier despliegue en produccion.
- El tag `endpoints_compatible` sugiere compatibilidad con infraestructura de inferencia, pero no se especifica que proveedores o versiones han sido verificados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/cypher-1.5-stealth-GGUF
- Repositorio GitHub: https://github.com/TheShellMaster/cypher_ai
- Space de demostracion: https://huggingface.co/spaces/TheShellMaster/cypher-ai
