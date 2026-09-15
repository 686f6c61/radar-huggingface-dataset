# tbcampbell/document-ai-study

## Resumen

`tbcampbell/document-ai-study` no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación sobre Document AI publicado en HuggingFace. La propia model card lo declara de forma explícita: contiene motivación, trabajo relacionado, una hipótesis falsable y un plan de evaluación, y "no se presenta como un artículo completado ni como la publicación de modelos entrenados". Los únicos ficheros descritos son `notes.md` (artefacto principal) y `README.md`.

El repositorio incluye el tag `safetensors` y un artefacto con 16.576 parámetros totales según los metadatos de HuggingFace, pero el tamaño del repositorio es de 0,0 GB y la model card no describe ninguna arquitectura, tokenizador, corpus de entrenamiento ni checkpoint utilizable. No hay pipeline declarado, ni idiomas declarados, ni descargas ni interacciones registradas.

Su relevancia es, por tanto, documental y metodológica: sirve como plantilla de plan de investigación en extracción de información de documentos (contexto de evaluación sobre FUNSD, SROIE y CORD, comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas), no como componente desplegable en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe ninguna arquitectura de modelo; el tag `transformer` aparece en los metadatos de HuggingFace, no en la model card) |
| Parametros totales | 16.576 (artefacto `safetensors` según metadatos); no corresponde a un modelo de lenguaje entrenado utilizable |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal en la información disponible. El repositorio se etiqueta con `transformer` en los metadatos de la plataforma, pero la model card no menciona capas, atención, mecanismos de mezcla de expertos, espacio de estados ni ninguna otra decisión de diseño. Tampoco se documenta tokenizador, vocabulario, función de pérdida ni objetivos de entrenamiento.

No hay datos de entrenamiento: ni número de tokens, ni composición del dataset, ni fases de ajuste por instrucciones, RLHF o DPO. La model card indica explícitamente que no se libera ningún checkpoint entrenado y que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales. La única aportación metodológica declarada es un plan de evaluación con comparación frente a líneas base emparejadas, contexto de evaluación concreto (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad y enumeración de modos de fallo.

## Capacidades

- El repositorio no describe ninguna capacidad de inferencia: no hay generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni lista de idiomas.
- No se declara modo de pensamiento (*thinking mode*), audio ni ninguna otra modalidad.
- Como artefacto documental, sí organiza: alcance de la pregunta de investigación y factores de confusión probables, propuesta de comparación con líneas base emparejadas, contexto de evaluación (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad, modos de fallo, preguntas abiertas y referencias temáticas.

## Casos de uso

- Punto de partida para un plan de evaluación en Document AI: el repositorio estructura hipótesis falsable, líneas base y métricas antes de escribir código, lo que evita experimentos sin criterio de falsación definido.
- Selección de conjuntos de datos de referencia: la nota cita FUNSD, SROIE y CORD como contexto de evaluación, útil para fijar versiones de dataset antes de comparar resultados entre equipos.
- Plantilla de reproducibilidad: las instrucciones del propio repositorio exigen registrar versión de dataset, comandos, semillas, hardware y logs en crudo cuando se añadan resultados, lo que sirve como lista de comprobación interna.
- Revisión de trabajos relacionados: el apartado de *related work* y las referencias temáticas permiten a un equipo nuevo orientarse en extracción de información de documentos sin partir de cero.
- Análisis de modos de fallo: la enumeración de *failure modes* y factores de confusión es reutilizable al diseñar auditorías de modelos de Document AI ya desplegados.
- Onboarding de investigadores o incorporaciones a un equipo: al separar explícitamente planes de resultados, reduce el riesgo de que una nota exploratoria se cite como evidencia empírica.
- Documentación de decisiones y preguntas abiertas: útil como registro versionado en Git junto al código experimental, con licencia MIT que permite reutilización y adaptación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la nota no reclama mejoras de benchmark, ablaciones completadas, código liberado ni checkpoint entrenado, y que las referencias y datasets propuestos son un punto de partida para verificación, no evidencia de que el estudio se haya ejecutado.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No existe un modelo entrenado que ejecutar.
- GPU recomendadas: no disponible. El repositorio no requiere GPU; se trata de ficheros de texto (`notes.md`, `README.md`).
- Viabilidad en GPU de consumo: no aplica. El artefacto `safetensors` de 16.576 parámetros y un repositorio de 0,0 GB no constituyen un modelo desplegable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables, ya que no se publica un checkpoint compatible con estos servidores de inferencia.
- Latencia y throughput: no disponibles, y no tienen sentido sin pesos ejecutables.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable con modelos de lenguaje o de Document AI (por ejemplo, variantes de LayoutLM, Donut o TrOCR), porque no publica pesos, arquitectura ni resultados. Tampoco se dispone de información sobre otros repositorios de notas de investigación equivalentes con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

| Criterio | `tbcampbell/document-ai-study` | Alternativas de Document AI |
|---|---|---|
| Tipo de artefacto | Notas de investigación (Markdown) | Modelos entrenados con pesos |
| Parametros | 16.576 (artefacto sin uso práctico) | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento publicado | ninguno | no disponible |
| Licencia | MIT | no disponible |

## Limitaciones y advertencias

- No es un modelo: pese al tag `safetensors` y al recuento de 16.576 parámetros, la model card declara que no se libera ningún checkpoint entrenado. Cualquier intento de cargarlo como modelo de lenguaje fallará o producirá salidas sin sentido.
- Riesgo de interpretación errónea: la mezcla de hipótesis, planes y resultados en un mismo repositorio puede llevar a citar afirmaciones exploratorias como hallazgos empíricos. El propio autor advierte de que las secciones marcadas como planes o hipótesis no son resultados.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni métricas de extracción de documentos (F1 de entidades, precisión de campos) publicadas.
- Idiomas: no se declara ninguno; no puede evaluarse cobertura multilingüe.
- Sesgos: no evaluables, al no existir modelo ni dataset documentado.
- Alucinación: no aplica en el sentido de generación de texto; el riesgo análogo es la sobreinterpretación de las notas.
- Licencia: MIT, permisiva para uso comercial y modificación, pero la propia model card advierte de que deben revisarse por separado los términos de las fuentes de datos externas si el repositorio se usa junto a datasets de terceros.
- Madurez: creado y actualizado el 2026-09-15, sin descargas ni interacciones, sin pipeline declarado y con un único autor; no hay señales de mantenimiento continuado.
- Uso en producción: desaconsejado como componente técnico. Su valor es exclusivamente metodológico y de documentación.

## Enlaces

- HuggingFace: https://huggingface.co/tbcampbell/document-ai-study
- Ficheros declarados en la model card: `notes.md` (artefacto principal) y `README.md`
- Referencias sobre conjuntos de datos mencionados en la nota (no enlazadas en la información disponible): FUNSD, SROIE, CORD
- Búsqueda web: el único resultado devuelto fue una guía turística sobre el estrecho de Magallanes, sin relación con el repositorio. No se han encontrado papers, blogs, repositorios de código ni demos asociados a este artefacto.
