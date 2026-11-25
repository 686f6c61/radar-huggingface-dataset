# zkowalski/learn-document-ai

## Resumen

`zkowalski/learn-document-ai` no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación sobre Document AI publicado en Hugging Face. El autor, zkowalski, lo describe explícitamente como un "working research note" que organiza motivación, trabajo relacionado, una hipótesis falsable y un plan de evaluación; la model card insiste en que no se presenta como un paper completado ni como la publicación de modelos entrenados.

El repositorio contiene únicamente dos ficheros, `analysis.md` (el artefacto principal) y `README.md`, con un tamaño total de 0.0 GB. A pesar de la etiqueta `safetensors` y del recuento de 49.600 parámetros que reporta Hugging Face, no hay evidencia de pesos funcionales ni de un checkpoint utilizable: el propio autor declara que no hay código ni checkpoint liberado.

Su relevancia es, por tanto, documental y metodológica: sirve como plantilla de plan de evaluación para tareas de extracción de información en documentos (FUNSD, SROIE, CORD) y como ejemplo de lo que no debe confundirse con un modelo desplegable. Cualquier lector que busque un modelo para producción debe descartarlo de inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (etiqueta del repositorio; no se describe arquitectura real) |
| Parametros totales | 49.600 (según metadatos de safetensors; sin checkpoint funcional asociado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (etiqueta); el repositorio solo contiene `analysis.md` y `README.md` |

## Arquitectura y entrenamiento

No hay información sobre arquitectura real, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO). La etiqueta `transformer` y el recuento de 49.600 parámetros provienen de los metadatos del repositorio, pero el autor no documenta ninguna arquitectura ni publica pesos. El contenido del repositorio es una nota de investigación que propone una comparación con baselines emparejados y un contexto de evaluación concreto (FUNSD, SROIE, CORD), además de comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas.

La model card es explícita: las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados experimentales, y si en el futuro se añaden resultados deberán incluir versiones de dataset, comandos, semillas, hardware y logs en bruto. No existe ninguna innovación técnica implementada (ni decodificación especulativa, ni atención lineal, ni nada similar) porque no hay modelo.

## Capacidades

- Ninguna capacidad de inferencia: no hay checkpoint, tokenizador ni código de ejecución en el repositorio.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas (idiomas: no disponibles).
- Su único valor es como documento de planificación: define alcance de la pregunta de investigación, confounders probables, baselines emparejados y un plan de evaluación sobre FUNSD, SROIE y CORD.

## Casos de uso

- Plantilla de plan de evaluación para proyectos de Document AI: sirve para estructurar motivación, hipótesis falsable y criterios de comparación antes de entrenar un modelo real; el `analysis.md` actúa como esqueleto reutilizable.
- Revisión metodológica interna: un equipo puede usar la nota para identificar confounders y modos de fallo antes de lanzar experimentos sobre extracción de campos en formularios y recibos.
- Definición de protocolo de reproducibilidad: la model card exige versiones de dataset, comandos, semillas, hardware y logs en bruto, lo que sirve como checklist para otros repositorios de investigación.
- Selección de datasets de referencia: la nota cita FUNSD, SROIE y CORD como contexto de evaluación, útil para quien necesite elegir benchmarks de comprensión de documentos.
- Documentación de alcance y limitaciones: sirve como ejemplo de cómo declarar que un repositorio es exploratorio y no contiene resultados, práctica útil para evitar malentendidos en publicaciones de investigación.
- Formación y revisión por pares: el repositorio puede citarse como ejemplo de nota de investigación abierta bajo CC-BY-4.0 en un blog o curso sobre metodología en IA.

No es adecuado para ningún caso de uso de producción, inferencia o despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la nota no reclama mejoras en benchmarks, ablaciones completadas, código liberado ni checkpoint entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni grafo de cómputo ejecutable.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el repositorio solo contiene ficheros Markdown.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparables porque este repositorio no es un modelo entrenado, sino una nota de investigación. Compararlo con modelos de Document AI como LayoutLMv3, Donut o LiLT sería engañoso: aquellos publican pesos y resultados, mientras que este repositorio declara no tener ni lo uno ni lo otro.

| Aspecto | learn-document-ai | Modelo de Document AI típico |
|---|---|---|
| Pesos publicados | No | Sí |
| Resultados de benchmarks | No | Sí |
| Código de inferencia | No | Habitualmente sí |
| Licencia | CC-BY-4.0 | Variable |
| Uso en producción | No | Posible |

## Limitaciones y advertencias

- No es un modelo: no contiene checkpoint, tokenizador ni código; no puede ejecutarse.
- El recuento de 49.600 parámetros y la etiqueta `safetensors` en los metadatos no implican la existencia de pesos funcionales; el repositorio solo incluye `analysis.md` y `README.md`.
- Riesgo alto de confusión: un lector que filtre por etiqueta `safetensors` o `transformer` puede interpretar erróneamente que existe un modelo desplegable.
- Sin datos de sesgos, alucinación ni comportamiento lingüístico, porque no hay modelo que evaluar.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero la model card advierte de revisar por separado los términos de los datos externos si se usa con datasets de terceros.
- Los resultados de búsqueda web proporcionados no guardan relación con el repositorio y no aportan información verificable sobre él.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zkowalski/learn-document-ai
- No se han encontrado papers, blogs, repositorios de código ni demos asociados en la información disponible.
