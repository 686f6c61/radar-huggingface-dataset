# SZLHOLDINGS/code-master-v2-candidate

## Resumen

code-master-v2-candidate es un artefacto de investigación publicado en Hugging Face por la organización SZLHOLDINGS bajo el identificador `SZLHOLDINGS/code-master-v2-candidate`. Por el nombre y los tags (`research-artifact`, `experimental`, `private-estate`) se presenta como un candidato experimental orientado a tareas de código, pero la model card no aporta ninguna especificación técnica verificable: no declara arquitectura, número de parámetros, longitud de contexto, idiomas ni proceso de entrenamiento. El repositorio ocupa 0,7 GB y contiene 53 archivos, de los cuales 18 son ficheros de pesos y ninguno es de configuración o tokenizer.

La model card actual es una reescritura fechada el 2026-11-14 que retira explícitamente las afirmaciones de la versión anterior (una "wave-4 uniform stamp" con model-index de batería de honestidad, tabla de entrenamiento QLoRA y badges de recibos). El autor declara que su doctrina de "fail-closed" no permite verificar esas afirmaciones por modelo, de modo que la ficha actual no reclama ningún resultado de evaluación, benchmark, contrato de entrenamiento ni cualificación para producción. La revisión observada antes de la edición de curado del 2026-11-16 es `66ae4b66521b07deb4eb1ae48ced5fd1babbacdf`.

Por tanto, esta ficha documenta un artefacto del que se conoce la existencia, el tamaño del repositorio, la licencia declarada y poco más. Cualquier dato de rendimiento, arquitectura o entrenamiento debe considerarse no disponible. Es relevante ahora precisamente como caso de estudio de trazabilidad y honestidad documental: un repositorio que prefiere no afirmar nada antes que afirmar algo no verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (tag observado en el frontmatter) |
| Formato de pesos | safetensors (tag observado; 18 ficheros de pesos en el repo) |

Datos adicionales observados: tamaño del repositorio 0,7 GB, 53 archivos totales (18 de pesos, 0 de configuración/tokenizer, 34 otros), visibilidad privada, sin pipeline declarado, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

No se declara arquitectura en la información disponible. La model card indica explícitamente que no se reclama ningún contrato de entrenamiento, tabla de hiperparámetros ni composición de dataset para este artefacto, y que la procedencia del entrenamiento no es verificable de forma independiente a partir del repositorio. La versión anterior de la card contenía una tabla de entrenamiento QLoRA y un model-index de batería, pero la reescritura del 2026-11-14 eliminó esas afirmaciones por no poder verificarlas por modelo.

Tampoco hay información sobre innovaciones técnicas (atención lineal, decodificación especulativa, mezcla de expertos, etc.). La ausencia de ficheros de configuración y tokenizer en el repositorio impide además reconstruir la arquitectura a partir de los metadatos.

## Capacidades

- No se declara ninguna capacidad verificada para este artefacto.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingües ni de idiomas soportados.
- No hay evidencia de modo thinking, visión, audio ni otras capacidades especiales.
- El nombre del repositorio sugiere un enfoque hacia código, pero la model card no lo confirma ni lo detalla.

## Casos de uso

- Auditoría de trazabilidad documental: usar el repositorio como ejemplo de model card que retira afirmaciones no verificables y conserva el historial de revisiones; útil para equipos que diseñan políticas de publicación de artefactos internos.
- Estudio de gobernanza de artefactos: analizar la doctrina "fail-closed" aplicada a fichas de modelos y cómo se refleja en el control de revisiones del Hub.
- Formación interna sobre evaluación de modelos: emplear este caso para enseñar a distinguir entre afirmaciones verificadas y afirmaciones retiradas en una model card.
- Pruebas de pipelines de catalogación: validar herramientas que ingieren metadatos de Hugging Face cuando faltan config, tokenizer y benchmarks, comprobando que el pipeline marca correctamente los campos como no disponibles.
- Investigación sobre artefactos privados: documentar el ciclo de vida de un repositorio privado con visibilidad sin cambios y sin nuevas mediciones entre revisiones.
- No se recomienda su uso para generación de código, atención al cliente, agentes ni ninguna tarea de producción, dado que no hay evidencia de capacidades ni de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ningún resultado de evaluación, benchmark o batería para este artefacto, y que no existe recibo de batería de evaluación en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y la arquitectura).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio (0,7 GB) sugiere pesos de pequeño tamaño, pero no permite inferir requisitos reales sin conocer la arquitectura y el formato exacto.
- Opciones de despliegue: no disponible; no se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se declara arquitectura, tamaño ni tarea concreta, y no hay benchmarks publicados para este artefacto.

## Limitaciones y advertencias

- Ausencia total de evidencia verificable: no hay benchmarks, evaluación, contrato de entrenamiento ni procedencia de datos.
- La model card retira afirmaciones de una versión anterior (model-index, tabla QLoRA, badges); no deben citarse esas afirmaciones como vigentes.
- Faltan ficheros de configuración y tokenizer en el repositorio, lo que dificulta la reproducibilidad y el uso directo del artefacto.
- Visibilidad privada: el acceso puede estar restringido y no se garantiza disponibilidad pública.
- Licencia apache-2.0 declarada solo como tag observado; la card no afirma nada más allá del tag y no hay verificación adicional de compatibilidad para uso comercial.
- Riesgo de sesgo y alucinación: no evaluable por falta de información.
- No apto para producción: la propia card declara que no se hace ninguna afirmación de preparación para producción, runtime, equivalencia de pesos ni cualificación de release.
- El nombre del repositorio puede inducir a pensar en un modelo de código listo para usar; la documentación no lo respalda.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/code-master-v2-candidate
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos.
