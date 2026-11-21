# whitejohngej/experiment-document-ai67

## Resumen

`whitejohngej/experiment-document-ai67` es un repositorio de Hugging Face publicado por el usuario whitejohngej que, pese a estar etiquetado con `safetensors` y `transformer`, no contiene un modelo entrenado en el sentido habitual. La model card lo describe explicitamente como una nota exploratoria de investigacion sobre Document AI: recoge el planteamiento de una comparacion, los posibles factores de confusion y los requisitos de reproducibilidad antes de reportar cualquier resultado de benchmark. El autor indica de forma literal que el repositorio no reclama mejoras de benchmark, ablaciones completadas, codigo publicado ni un checkpoint entrenado.

El artefacto principal es `reading.md`, un documento de notas, acompanado de un `README.md`. Los unicos datos tecnicos verificables son los metadatos del repo: licencia CC-BY-4.0, 24.832 parametros reportados en el campo de safetensors, un tamano de repositorio de 0,0 GB y cero descargas y cero likes en el momento de la consulta. No hay pipeline declarado, no hay idiomas declarados y no hay informacion sobre arquitectura efectiva, contexto, cuantizaciones ni datos de entrenamiento.

Su relevancia es, por tanto, documental y metodologica mas que practica: sirve como ejemplo de repositorio de notas de investigacion que describe un protocolo de evaluacion sobre conjuntos como FUNSD, SROIE y CORD, pero no es desplegable ni evaluable como modelo. Cualquier uso en produccion o cualquier afirmacion de rendimiento basada en este repositorio carece de base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `transformer` en los metadatos, sin confirmacion en la model card) |
| Parametros totales | 24.832 (dato reportado en safetensors; no se especifica si son parametros de un modelo funcional o de artefactos auxiliares) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (segun metadatos); el contenido real del repo son ficheros Markdown (`reading.md`, `README.md`) |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura mas alla de la etiqueta `transformer` presente en los metadatos de Hugging Face, que no viene acompanada de ninguna descripcion tecnica en la model card. El recuento de 24.832 parametros es incompatible con un transformer de lenguaje funcional de proposito general y sugiere que el contenido de safetensors, si existe, corresponde a artefactos auxiliares o a un experimento minimo no documentado.

Respecto al entrenamiento, la model card es explicita: el repositorio no contiene un checkpoint entrenado ni codigo liberado, y las secciones marcadas como planes o hipotesis no deben interpretarse como resultados experimentales. El autor establece que, si en el futuro se anaden resultados, estos deberan incluir versiones de datasets, comandos, semillas, hardware y logs en bruto. No se documentan volumen de tokens, composicion del dataset, ni fases de RLHF, DPO o similares.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingues declaradas (el campo de idiomas esta vacio).
- No se declara modo thinking, vision, audio ni ninguna capacidad especial.
- La unica funcionalidad del repositorio es servir como documento de notas sobre el diseno de una comparacion en Document AI, incluyendo la identificacion de factores de confusion y los requisitos de reproducibilidad.

## Casos de uso

- Revision metodologica de un protocolo de evaluacion en Document AI: el fichero `reading.md` puede leerse como plantilla para estructurar una comparacion con baselines emparejados, identificando de antemano los confounders y las comprobaciones de reproducibilidad exigibles.
- Definicion de conjuntos de evaluacion: las referencias a FUNSD, SROIE y CORD sirven para seleccionar tareas de extraccion de entidades, procesamiento de recibos y parsing de documentos estructurados antes de ejecutar experimentos.
- Checklist de reproducibilidad: el repositorio enumera los artefactos que deben acompanar a cualquier resultado futuro (versiones de dataset, comandos, semillas, hardware, logs), util como lista de verificacion en revisiones internas de equipos de investigacion.
- Documentacion de hipotesis previas al experimento: util para registrar el estado "antes de medir" y evitar la interpretacion retroactiva de resultados, una practica habitual en pre-registro de estudios.
- Formacion de equipos noveles: el documento ilustra como separar explicitamente planes, hipotesis y resultados, un error frecuente en repositorios de research notes.
- Auditoria de repositorios de Hugging Face: sirve como caso concreto de repo etiquetado como modelo que en realidad no lo es, util para calibrar filtros automaticos de catalogacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se reclaman mejoras de benchmark ni ablaciones completadas, y que las secciones de planes e hipotesis no constituyen resultados experimentales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no hay un modelo funcional que ejecutar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el contenido del repositorio son ficheros Markdown, no pesos cargables por estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables, dado que el repositorio no constituye un modelo desplegable sino un documento de notas de investigacion. Cualquier comparacion de parametros, contexto, rendimiento o licencia con modelos reales de Document AI careceria de base factica.

## Limitaciones y advertencias

- El repositorio no contiene un checkpoint entrenado ni codigo; no es utilizable para inferencia.
- El campo de parametros (24.832) no es representativo de un modelo de lenguaje y no debe citarse como tamano de modelo en comparaciones.
- Las secciones de la model card describen planes e hipotesis, no resultados; citarlas como evidencia de rendimiento seria un error metodologico.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, por lo que no puede realizarse ninguna evaluacion de riesgos de alucinacion o sesgo.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero la model card advierte que los terminos de los datos de origen deben revisarse por separado si se usan datasets externos como FUNSD, SROIE o CORD.
- El repositorio tiene cero descargas y cero likes, sin senales de validacion por parte de la comunidad.
- No debe desplegarse en produccion bajo ninguna circunstancia: no hay artefacto ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/whitejohngej/experiment-document-ai67
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos asociados a este repositorio.
