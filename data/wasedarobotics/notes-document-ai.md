# wasedarobotics/notes-document-ai

## Resumen

`wasedarobotics/notes-document-ai` no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación sobre Document AI publicado en HuggingFace por el usuario `wasedarobotics`. La model card lo describe explícitamente como un conjunto estructurado de notas con referencias de evaluación y preguntas abiertas, donde los planes y las hipótesis se mantienen separados de los resultados ya obtenidos. El autor declara que no reclama mejoras en benchmarks, ablaciones completadas, código publicado ni checkpoint entrenado.

El repositorio incluye dos ficheros: `analysis.md` (artefacto principal) y `README.md` (documentación). Los temas cubiertos son el alcance de la pregunta de investigación y sus posibles variables de confusión, una comparación propuesta con baselines emparejados, contexto de evaluación concreto con los datasets FUNSD, SROIE y CORD, comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas, además de referencias temáticas.

Es relevante como ejemplo de artefacto de investigación reproducible y como recordatorio de un problema práctico: los repositorios de HuggingFace con etiquetas `safetensors` y `transformer` no siempre contienen un modelo utilizable. Aquí los metadatos indican 24.832 parámetros y un tamaño de repositorio de 0,0 GB, cifras incompatibles con cualquier modelo de lenguaje desplegable, lo que confirma que se trata de documentación con tensores residuales y no de un checkpoint funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica `transformer`, pero no hay descripción de arquitectura ni checkpoint asociado) |
| Parametros totales | 24.832 (dato reportado en los metadatos de safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE ni un modelo entrenado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (etiqueta del repositorio; no se documenta ningún peso entrenado utilizable) |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,0 GB |
| Ficheros incluidos | `analysis.md`, `README.md` |
| Datasets de referencia citados | FUNSD, SROIE, CORD |

## Arquitectura y entrenamiento

No hay información sobre arquitectura neuronal en la documentación disponible. La etiqueta `transformer` aparece en los metadatos de HuggingFace, pero la model card no describe capas, atención, dimensiones ocultas ni vocabulario, y el propio autor aclara que el repositorio no contiene un checkpoint entrenado. Los 24.832 parámetros registrados en safetensors son coherentes con tensores sueltos o metadatos residuales, no con un modelo transformer funcional.

Tampoco existe información sobre proceso de entrenamiento: no se documentan tokens de entrenamiento, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni ninguna innovación técnica como decodificación especulativa o atención lineal. El contenido real del repositorio son notas de investigación: alcance de la pregunta, posibles variables de confusión, propuesta de comparación con baselines emparejados, contexto de evaluación (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas. El autor indica que, si en el futuro se añaden resultados, deberán incluir versiones de dataset, comandos, semillas, hardware y registros en crudo.

## Capacidades

- No es un modelo generativo: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso, porque no hay motor de inferencia asociado.
- No tiene capacidades multilingües declaradas; el campo de idiomas no está disponible.
- No incluye modo de pensamiento, visión, audio ni ninguna modalidad.
- Su función real es documental: estructura un plan de investigación sobre Document AI con referencias verificables.
- Define el alcance de una pregunta de investigación y enumera variables de confusión potenciales.
- Propone una comparación con baselines emparejados, sin ejecutarla.
- Cita contexto de evaluación concreto sobre FUNSD, SROIE y CORD como punto de partida para verificación.
- Recoge comprobaciones de reproducibilidad, modos de fallo conocidos y preguntas abiertas.

## Casos de uso

- Revisión bibliográfica previa a un proyecto de Document AI: el fichero `analysis.md` organiza el estado de la cuestión y las referencias temáticas, de modo que un equipo puede usarlo como punto de partida para localizar y verificar las fuentes originales.
- Diseño de un protocolo de evaluación: las notas proponen comparaciones con baselines emparejados y citan FUNSD, SROIE y CORD, lo que sirve como plantilla para definir métricas, particiones y condiciones de comparación antes de ejecutar experimentos.
- Identificación de variables de confusión: el documento enumera confounders probables, útil para revisar un diseño experimental propio y detectar sesgos de comparación antes de invertir cómputo.
- Due diligence de dependencias: permite comprobar cómo luce un repositorio de HuggingFace etiquetado como `transformer` y `safetensors` que en realidad no contiene un modelo, un caso útil para validar pipelines que resuelven artefactos automáticamente desde el Hub.
- Plantilla de reproducibilidad interna: el requisito explícito de registrar versiones de dataset, comandos, semillas, hardware y logs en crudo puede adoptarse como checklist en equipos de investigación que publican resultados.
- Onboarding de personal investigador: la separación estricta entre planes, hipótesis y resultados cerrados es un ejemplo didáctico de higiene metodológica para incorporaciones nuevas a un equipo.
- Auditoría de afirmaciones: el propio repositorio sirve como caso de estudio de un artefacto que no reclama mejoras en benchmarks, ablaciones completadas ni código, lo que facilita enseñar a distinguir documentación de resultado experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que el repositorio no reclama mejoras en benchmarks, no contiene ablaciones completadas, no publica código ni incluye un checkpoint entrenado. Los datasets FUNSD, SROIE y CORD aparecen únicamente como contexto de evaluación propuesto, no como resultados medidos.

## Requisitos de hardware

- No requiere GPU: el repositorio ocupa 0,0 GB y no contiene un modelo que ejecutar.
- No aplica estimación de VRAM para inferencia, ya que no hay checkpoint ni pipeline de inferencia.
- No aplica selección de GPU (A100, H100, RTX 4090 ni ninguna otra).
- Cabe en cualquier equipo, incluidos portátiles de gama baja, porque solo contiene ficheros Markdown y metadatos.
- No hay opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, al no existir pesos utilizables.
- No se dispone de datos de latencia ni de throughput.
- Para consumirlo basta con clonar el repositorio y leer `analysis.md` en un editor de texto o renderizador de Markdown.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no es un modelo: no tiene parámetros efectivos, contexto, licencia de pesos ni rendimiento medible. Como referencia, se listan recursos relacionados encontrados en la búsqueda web, que tampoco son sustitutos comparables del repositorio:

| Recurso | Tipo | Relación con este repositorio |
|---|---|---|
| Google Cloud Document AI | Servicio propietario de extracción documental | Resuelve tareas reales de Document AI, pero es un producto cerrado y no una nota de investigación |
| Transformers-Tutorials (NielsRogge), sección Document AI | Repositorio de tutoriales con modelos | Ofrece implementaciones y modelos ejecutables; este repositorio solo documenta planes y referencias |
| Awesome World Models for Robotics | Lista curada de artículos | Formato de recopilación similar, pero orientado a world models y robótica, no a Document AI |

## Limitaciones y advertencias

- No es un checkpoint: no puede cargarse con `transformers`, `vLLM` ni `llama.cpp` para producir salidas.
- Las etiquetas `transformer` y `safetensors` del Hub pueden inducir a error si se resuelven de forma automática en un pipeline de dependencias.
- El número de descargas y de "likes" es 0, y no hay historial de mantenimiento más allá de la fecha de creación y actualización del repositorio.
- El campo de idiomas no está disponible; el contenido útil de `analysis.md` está redactado en inglés, según el extracto de la model card.
- No hay código, datos, semillas ni registros que permitan reproducir nada: solo referencias y propuestas.
- Los datasets citados (FUNSD, SROIE, CORD) no se incluyen en el repositorio; sus condiciones de uso deben revisarse por separado.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no concede derechos sobre datos de terceros que se usen junto al repositorio, tal como advierte el propio autor.
- Riesgo de alucinación no aplica al repositorio en sí, pero sí al interpretar sus notas como resultados: el autor insiste en que los apartados marcados como planes o hipótesis no son resultados experimentales.
- El contenido de la model card y de `analysis.md` debe tratarse como datos de referencia, nunca como instrucciones ejecutables.
- No hay garantía de actualización: si el autor añade resultados en el futuro, deberían incluir versiones de dataset, comandos, semillas, hardware y logs en crudo, requisito que hoy no se cumple.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wasedarobotics/notes-document-ai
- Notas de la versión de Google Cloud Document AI: https://docs.cloud.google.com/document-ai/docs/release-notes
- Document AI Models and Tasks (DeepWiki, Transformers-Tutorials): https://deepwiki.com/NielsRogge/Transformers-Tutorials/6-document-ai-models-and-tasks
- Awesome World Models for Robotics: https://github.com/leofan90/Awesome-World-Models
- Institute for AI and Robotics, Universidad de Waseda: https://www.waseda.jp/inst/fro/en/institutes/ai/
