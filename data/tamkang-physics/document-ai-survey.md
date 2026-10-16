# Tamkang-physics/document-ai-survey

## Resumen

`Tamkang-physics/document-ai-survey` no es un modelo de IA entrenado, sino un repositorio de notas de investigación (research notes) sobre Document AI publicado por el usuario Tamkang-physics. La propia model card lo describe explícitamente como una "exploratory note" que recoge el alcance de una pregunta de investigación, posibles factores de confusión, una comparación propuesta con baselines emparejados y requisitos de reproducibilidad, sin presentar resultados experimentales. El repositorio está etiquetado con `safetensors` y `transformer`, pero también con `research-notes`, y su tamaño declarado es de 0,0 GB, por lo que no contiene un checkpoint funcional.

El contenido principal es un único artefacto de texto (`paper_notes.md`) más el `README.md`. Los datasets mencionados como contexto de evaluación son FUNSD, SROIE y CORD, todos ellos clásicos de comprensión de documentos. El autor advierte de forma explícita que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados, y que no se reclama ninguna mejora de benchmark, ablación completada, código liberado ni checkpoint entrenado.

Su relevancia actual es, por tanto, documental y metodológica: sirve como plantilla de planificación experimental y checklist de reproducibilidad en Document AI, no como artefacto desplegable. Cualquier ficha que lo presente como modelo de inferencia sería incorrecta. Los metadatos de safetensors declaran 16.576 parámetros totales, cifra incompatible con un transformer de lenguaje y que apunta a un artefacto de recuento o a un fichero auxiliar, no a un modelo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (metadatos etiquetan "transformer"; el repositorio no contiene código, configuración ni definición de arquitectura) |
| Parametros totales | 16.576 según metadatos de safetensors; cifra atípica, no consistente con un modelo de lenguaje entrenado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible (la model card está redactada en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (etiqueta declarada); el repositorio ocupa 0,0 GB y no incluye checkpoint descrito |
| Pipeline | no disponible |
| Tipo de artefacto | notas de investigación (`paper_notes.md`, `README.md`) |
| Tamano del repositorio | 0,0 GB |
| Autor | Tamkang-physics |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |
| Descargas / likes | 1 / 0 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal descrita. La model card enumera únicamente contenido textual: alcance de la pregunta de investigación y confusores probables, una comparación propuesta con baselines emparejados, contexto de evaluación concreto (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas, además de referencias temáticas. No se especifica ningún dato de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento.

La etiqueta `safetensors` en los metadatos sugiere que en algún momento se subió un fichero en ese formato, pero el tamaño de 0,0 GB y la ausencia de cualquier descripción de pesos, tokenizador o configuración impiden considerarlo un checkpoint utilizable. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, SSM, híbridos, etc.). El propio autor indica que, si en el futuro se añaden resultados, deberán acompañarse de versiones de dataset, comandos, semillas, hardware y logs en bruto; es decir, el repositorio se sitúa en la fase previa a la ejecución experimental.

## Capacidades

- No hay capacidades de inferencia: el repositorio no contiene un modelo ejecutable, ni pesos utilizables, ni tokenizador documentado.
- No se declara soporte de generación de texto, razonamiento, código ni matemáticas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües (la model card está en inglés y el campo de idiomas está vacío).
- Capacidad real del artefacto: servir como documento de planificación de un estudio comparativo en Document AI, con enumeración de confusores, baselines emparejados y requisitos de reproducibilidad.
- Capacidad real del artefacto: actuar como checklist de modos de fallo y preguntas abiertas antes de reportar cualquier resultado de benchmark.
- Capacidad real del artefacto: recopilar referencias temáticas como punto de partida para verificación, no como evidencia de resultados.

## Casos de uso

- Planificación de un estudio comparativo en Document AI: el documento enumera la pregunta de investigación, los confusores probables y una propuesta de comparación con baselines emparejados, de modo que un equipo puede reutilizarlo como esqueleto de protocolo antes de ejecutar experimentos.
- Diseño de una batería de evaluación sobre extracción de información: la nota fija FUNSD, SROIE y CORD como contexto de evaluación, lo que permite partir de datasets estándar de comprensión de formularios, recibos y documentos escaneados al definir métricas y particiones.
- Auditoría de reproducibilidad en un laboratorio: el repositorio exige registrar versiones de dataset, comandos, semillas, hardware y logs en bruto, por lo que sirve como plantilla de checklist para revisores internos o para preparar una artifact evaluation.
- Redacción de la sección de limitaciones de un artículo: la model card separa explícitamente planes e hipótesis de resultados, un patrón útil para documentar qué no se ha demostrado todavía y evitar afirmaciones infladas.
- Docencia e iniciación a la investigación: al tratarse de una nota exploratoria breve con referencias, es material adecuado para mostrar a estudiantes cómo se plantea un estudio antes de tener resultados, incluyendo la distinción entre hipótesis y evidencia.
- Coordinación de revisiones bibliográficas: las referencias y datasets propuestos funcionan como punto de partida verificable para construir una bibliografía sobre Document AI, siempre que el equipo valide cada fuente de forma independiente.
- No es un caso de uso válido: desplegar este repositorio como servicio de inferencia, integrarlo en un pipeline de producción o emplearlo para generar texto o extraer campos de documentos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna mejora de benchmark ni ablación completada, y que las secciones etiquetadas como planes o hipótesis no son resultados experimentales. Los datasets FUNSD, SROIE y CORD se mencionan como contexto de evaluación propuesto, no como evaluación ejecutada.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay checkpoint desplegable ni configuración de modelo publicada.
- GPU recomendadas: no aplica por la misma razón; no existe carga de pesos que ejecutar.
- Compatibilidad con GPU de consumo: no disponible, al no existir modelo ejecutable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; ninguna es aplicable a un repositorio de notas de 0,0 GB sin pesos ni tokenizador.
- Latencia y throughput: no disponibles.
- Requisito real de consumo: únicamente un lector de Markdown para abrir `paper_notes.md` y `README.md`; el coste computacional del artefacto es nulo.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a la categoría de modelos de lenguaje, visión o Document AI desplegables, sino a la de notas de investigación, por lo que no existe una comparación significativa en parámetros, contexto, rendimiento o licencia frente a modelos como LayoutLMv3, Donut o LiLT. La comparación pertinente sería con otras notas exploratorias o protocolos pre-registrados, para lo cual no se dispone de datos en la información proporcionada.

| Elemento | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tamkang-physics/document-ai-survey | 16.576 declarados (no consistentes con un modelo de lenguaje) | no disponible | sin benchmarks publicados | CC-BY-4.0 | repositorio de notas, sin checkpoint funcional |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto, no procesa documentos y no puede evaluarse con métricas de inferencia.
- El recuento de 16.576 parámetros en safetensors resulta anómalo; no debe citarse como tamaño real de un modelo sin verificación del fichero.
- El repositorio ocupa 0,0 GB y solo documenta dos ficheros Markdown; cualquier expectativa de pesos descargables es infundada.
- Riesgo de interpretación errónea: las etiquetas `transformer` y `safetensors` pueden llevar a catalogar el repositorio como modelo en índices automatizados, como evidencia este caso.
- Riesgo de alucinación no aplicable al repositorio en sí, pero sí a cualquier herramienta o resumen que lo describa como modelo entrenado con benchmarks.
- Idiomas soportados no declarados; el único contenido está en inglés.
- Los datasets FUNSD, SROIE y CORD se mencionan como propuesta; sus condiciones de uso deben revisarse por separado, tal y como advierte la propia model card al hablar de datos de origen externo.
- Licencia CC-BY-4.0: permite uso y adaptación con atribución, incluido uso comercial del texto, pero no concede derechos sobre datasets de terceros referenciados.
- Ausencia total de validación experimental: no hay resultados, ablaciones, código ni semilla que permitan reproducir nada.
- Las fechas de creación y actualización (2026-10-16) son idénticas y sin historial posterior; no hay garantía de mantenimiento del repositorio.
- No debe utilizarse en producción ni citarse como estado del arte en Document AI.

## Enlaces

- HuggingFace: https://huggingface.co/Tamkang-physics/document-ai-survey
- No se han encontrado en la búsqueda web enlaces relevantes al repositorio, a su autor ni a un paper asociado.
- El único resultado con coincidencia nominal en "Tamkang" es un artículo de astrofísica de la Tamkang University, sin relación con Document AI ni con este repositorio: https://iopscience.iop.org/article/10.3847/1538-4357/ae3b2b/meta
