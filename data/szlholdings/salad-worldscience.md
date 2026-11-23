# SZLHOLDINGS/salad-worldscience

## Resumen

`salad-worldscience` es un artefacto de modelo publicado en Hugging Face por la organización SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibo (receipts) y resultados verificables. El repositorio tiene un tamaño de 1,2 GB y contiene pesos en formato `safetensors`, lo que sugiere un modelo de tamaño pequeño o mediano, aunque la model card no especifica parámetros, arquitectura ni contexto.

La información publicada es deliberadamente escasa: la propia model card declara que cualquier dato de entrenamiento, evaluación o rendimiento que no esté respaldado por un recibo medido se marca como UNKNOWN (desconocido). De hecho, el escaneo de recibos de la propia organización (tranche 6, chunk 10, del 22 de noviembre de 2026) clasifica este repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no existe un `DONE.json` estricto con estado MEASURED, código de evaluación 0 y marca temporal. Por tanto, no hay evidencia medida de calidad ni de capacidades.

Su relevancia ahora es limitada y fundamentalmente metodológica: sirve como ejemplo de publicación de artefactos con disciplina de trazabilidad explícita (etiquetado MEASURED/REPORTED/UNKNOWN), pero no como modelo evaluable para producción. No se dispone de datos sobre arquitectura, tokenizador, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (tamaño de repo: 1,2 GB en `safetensors`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica explícitamente que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibo del "estate mesh" y que cualquier dato no respaldado por un recibo medido se considera UNKNOWN.

El escaneo de recibos realizado por la propia organización el 22 de noviembre de 2026 no encontró un `DONE.json` que cumpla el umbral estricto (estado MEASURED, `eval_rc=0`, marca temporal y recibo de entrenamiento). El único fichero con nombre de recibo detectado es `assets/szl-card/mesh-receipts.svg`, que el escaneo identifica como coincidencia por palabra clave y no como evidencia validada. En consecuencia, no hay innovaciones técnicas documentadas ni verificables.

## Capacidades

- Generación de texto: no confirmada; no hay evidencia medida ni documentación de capacidades.
- Razonamiento, código y matemáticas: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

No es posible recomendar casos de uso en producción con la información disponible. Los siguientes escenarios son hipotéticos y quedan condicionados a la validación previa del artefacto:

- Evaluación interna de trazabilidad: usar el repositorio como referencia para diseñar pipelines de recibos (receipts) y etiquetado MEASURED/REPORTED/UNKNOWN en una organización que publique modelos con auditoría.
- Prueba de carga del formato `safetensors`: verificar que el artefacto de 1,2 GB se carga correctamente con las herramientas estándar antes de cualquier uso posterior.
- Auditoría de licencia: determinar la licencia real del artefacto antes de plantear cualquier uso comercial, dado que la model card no la declara.
- Reproducción de la evaluación: ejecutar un conjunto de pruebas propio (perplejidad, generación básica) para sustituir la ausencia de `DONE.json` por evidencia medida propia.
- Integración en un catálogo interno de artefactos: catalogar el modelo con metadatos explícitos de incertidumbre, sin asignarle capacidades no verificadas.
- Estudio de gobernanza de IA: analizar el patrón de publicación del "estate" SZLHOLDINGS como caso de documentación determinista generada con stdlib y SVG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluación como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de un número de parámetros que no se ha declarado. El tamaño de repo de 1,2 GB sugiere un artefacto pequeño, pero no permite inferir la arquitectura ni el número de parámetros con fiabilidad.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos publicados.
- Opciones de despliegue: no documentadas por el autor; al estar en `safetensors`, sería compatible en principio con runtimes que carguen ese formato (por ejemplo, transformers, vLLM o TGI), pero no hay confirmación de que la arquitectura sea soportada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se ha identificado la categoría del modelo (tamaño, tarea, modalidad) ni se han publicado métricas que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Ausencia de evidencia medida: el escaneo de recibos de la propia organización clasifica el repositorio como `RECEIPT_FILES_NO_DONE`; no hay `DONE.json` estricto ni recibo de entrenamiento validado.
- Datos técnicos ausentes: no se declaran arquitectura, parámetros, contexto, tokenizador ni idiomas.
- Licencia no declarada: no es posible determinar si el uso comercial está permitido; tratar como no apto para producción hasta confirmarlo.
- Riesgo de alucinación: no evaluable sin benchmarks ni pruebas propias.
- Sesgos: desconocidos; no hay documentación sobre datos de entrenamiento ni procesos de alineación.
- Metadatos generados automáticamente: la model card indica que fue generada por una herramienta (`estate-cards weaver v0.1.0`) y que los gráficos son SVG deterministas a partir de una instantánea de auditoría; parte del contenido es plantilla, no documentación técnica del modelo.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso comunitario ni validación externa.
- Fechas de creación y actualización (noviembre de 2026) posteriores a la instantánea de auditoría citada; verificar la coherencia temporal en el origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-worldscience
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (según la model card): https://github.com/szl-holdings
- Herramienta de generación de cards (según la model card): https://github.com/szl-holdings/estate-cards
