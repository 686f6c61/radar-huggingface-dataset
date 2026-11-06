# WayneRR/cognitive-learning-lab

## Resumen

`WayneRR/cognitive-learning-lab` no es un modelo de lenguaje en el sentido habitual, sino un paquete de runtime de investigación publicado como candidato PR-M1/v0.1.0. Implementa un pipeline que responde a una decisión acotada de tipo multiple-choice combinando un modelo de propuesta congelado con una memoria externa persistida en SQLite. La separación es estricta: el modelo puede proponer, pero solo la memoria que ha pasado verificación puede autorizar una respuesta, escribir de vuelta o sobrevivir a un reinicio del proceso.

El repositorio tiene un tamaño de 0.0 GB y cero descargas, lo que indica que no incluye pesos: el modelo de propuesta se referencia de forma fijada (pinned) pero no se empaqueta. El runtime está escrito en Python (3.10+, aceptado en 3.11.9), se instala como wheel y expone una CLI (`cognitive-runtime`) con subcomandos `doctor`, `infer`, `memory seed`, `memory verify`, `memory inspect` y `memory clear`. La cadena de cada petición incluye saneado de entrada, comprobación de integridad del almacén, recuperación de memoria, verificación y promoción, propuesta del modelo, juicio por reglas, boundary de tres capas y writeback controlado con replay.

La relevancia del proyecto es conceptual más que de rendimiento: propone una arquitectura de "aprendizaje cognitivo distribuido" donde la autorización de respuestas no depende del modelo sino de reglas de memoria verificadas criptográficamente. No hay información publicada sobre arquitectura de red neuronal propia, parámetros, contexto ni benchmarks; la model card describe exclusivamente el runtime y su modelo de propuesta externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de decisión multiple-choice con modelo de propuesta congelado (Laya, basado en ModernBERT-large) más memoria externa SQLite; no se documenta arquitectura propia del runtime |
| Parametros totales | No disponible para el runtime; modelo de propuesta Laya: checkpoint `model.safetensors` de 842.609.210 B (aproximadamente 0,84 GB en pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el checkpoint se carga en precisión nativa) |
| Idiomas soportados | No disponible (la model card está en inglés y chino, pero no declara idiomas del modelo) |
| Licencia | Runtime: Apache-2.0. Pesos del modelo de propuesta (Laya en la revisión `55cf4c4e…`): Apache-2.0. Pesos de ModernBERT-large: Apache-2.0. Licencia del repo de Hugging Face: no disponible |
| Formato de pesos | `model.safetensors` para el modelo de propuesta; el runtime no empaqueta pesos. Memoria en SQLite |

## Arquitectura y entrenamiento

El runtime no entrena ningún modelo. Orquesta un pipeline determinista de capas: saneado de entrada (`sanitize.py`), verificación de integridad del store, recuperación de memoria, adquisición opcional de recibos de fuentes citadas, verificación y promoción de registros, propuesta del modelo congelado, juicio por reglas, boundary de tres capas y writeback controlado con replay. La salida de cada petición es un objeto compuesto con los campos `raw_proposal`, `judgment`, `verification`, `writeback`, `writeback_receipt`, `authorization`, `cost` y `model`; `authorization` solo toma el valor `verified_judgment` cuando una regla de memoria promovida e íntegra en hash permite la respuesta.

El modelo de propuesta es `convaiinnovations/laya` en la revisión `55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851`, con `model.safetensors` de 842.609.210 B y SHA-256 `891102d3…cbcb8d86c` verificado contra el digest LFS upstream. La versión `laya 0.3.20` construye la red sin preentrenamiento (`pretrained=False`) y carga todos los parámetros, incluido el encoder, desde el checkpoint de Laya; por tanto, la inferencia no descarga los pesos de `answerdotai/ModernBERT-large` (revisión `45bb4654a4d5aaff24dd11d4781fa46d39bf8c13`, `model.safetensors` de 1.583.544.840 B, SHA-256 `44510fec…`), que se verificaron de forma independiente y se registran en `SOURCE-INVENTORY.md` §1. No se documentan tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO.

La innovación técnica destacable son los dos tipos de verificación, deliberadamente estrechos: `source-consistency-v1` comprueba que un registro sigue coincidiendo con el recibo de fuente que cita, y `lineage-consistency-v1` comprueba que una conclusión escrita de vuelta sigue siendo coherente con los registros promovidos de los que deriva y no añade soporte nuevo. Ninguno de los dos prueba que la afirmación citada sea verdadera en el mundo, y la API no devuelve ningún estado que sugiera lo contrario. Además, un registro que el llamante entregue marcado como `verified`, `trusted`, `gold` o `expected` se rechaza antes de la compuerta; `memory seed` solo escribe candidatos y únicamente `memory verify` contra el registro de recibos puede promoverlos.

## Capacidades

- Resolución de decisiones acotadas de tipo multiple-choice mediante propuesta del modelo más juicio por reglas de memoria verificada.
- Persistencia de memoria entre procesos: un segundo proceso puede leer la memoria que el primero persistió.
- Verificación de integridad criptográfica del almacén y de los recibos de fuente citados.
- Verificación de linaje de conclusiones derivadas, con comprobación de que no se añade soporte nuevo.
- Writeback controlado con recibo (`writeback_receipt`) y replay de la cadena.
- Saneado de entradas y rechazo de registros autodeclarados como verificados o de confianza.
- CLI con subcomandos de diagnóstico (`doctor`), inferencia (`infer`) y mantenimiento de memoria (`seed`, `verify`, `inspect`, `clear`).
- Códigos de salida diferenciados: `0` para ejecución con resultado `answered` o `abstained`, `2` para entrada inválida o comando destructivo sin confirmación, `3` para no ejecutado por falta de propuesta usable.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Auditoría de decisiones automatizadas: el runtime registra por separado `raw_proposal`, `judgment` y `authorization`, lo que permite reconstruir por qué se autorizó una respuesta y distinguirla de la mera propuesta del modelo.
- Sistemas de decisión con trazabilidad regulatoria: la verificación `source-consistency-v1` comprueba que cada registro sigue coincidiendo con el recibo de fuente que cita, lo que encaja en flujos donde hay que demostrar la procedencia del dato utilizado.
- Control de calidad de bases de conocimiento: `memory verify` promueve candidatos solo contra el registro de recibos, y `memory inspect` permite revisar el estado del almacén antes de usarlo en producción.
- Investigación sobre separación modelo-autorización: el paquete está pensado como runtime de investigación con 28 tests que pasan y un acceptance de 15 pasos contra el wheel construido, útil para experimentar con arquitecturas donde el modelo no tiene la última palabra.
- Evaluación de modelos congelados en CPU: el smoke real se ejecutó el 2026-11-05 en CPU y en modo offline contra el snapshot local fijado, con `provider_class=real`, lo que permite reproducir inferencia sin GPU.
- Pipelines con reinicio de proceso: la memoria persiste en SQLite y un segundo proceso la reutiliza, lo que sirve para probar continuidad de estado entre ejecuciones o despliegues.
- Entornos con dependencias mínimas: la instalación base no tiene dependencias duras (`pip install .`); el extra `[dev]` añade pytest y jsonschema, y `[model]` añade laya, huggingface_hub y torch, lo que facilita integrarlo en imágenes ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El smoke real del modelo de propuesta se ejecutó en CPU en modo offline, lo que sugiere que el checkpoint de aproximadamente 0,84 GB puede cargarse sin GPU, aunque no se documentan requisitos formales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el checkpoint de Laya (842.609.210 B) es de tamaño reducido, pero no se publican medidas de VRAM ni pruebas en RTX 4090 u otras consumer.
- Despliegue: instalación como paquete Python (`python -m pip install .`), CLI `cognitive-runtime`, almacén SQLite. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Reproducibilidad: `requirements-lock.txt` recoge el cierre completo de 44 paquetes del entorno de aceptación, verificado como conjunto satisfacible en un venv limpio con `uv pip install --dry-run -r requirements-lock.txt` (44 paquetes, exit 0).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (runtime de decisión con memoria verificada y modelo de propuesta congelado). El modelo de propuesta subyacente, Laya, es un checkpoint de aproximadamente 0,84 GB basado en ModernBERT-large, pero no se publican datos de rendimiento que permitan compararlo con alternativas.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB: no contiene pesos, solo código y metadatos. Cualquier uso real requiere obtener el checkpoint de Laya por separado.
- La licencia del repo de Hugging Face figura como no disponible; la del runtime es Apache-2.0, pero los pesos upstream conservan su propia licencia y no se empaquetan.
- El estado declarado es `PR_M1_IMPLEMENTED_LOCALLY_ACCEPTED_REAL_MODEL_SMOKE_NOT_UPLOADED`: implementado y aceptado localmente, con smoke real ejecutado, pero no subido a ningún remoto. El registro autoritativo de publicación es `RELEASE-CHECKLIST.md` y `RELEASE-MANIFEST.json` (`publication.status`), no la model card.
- Las verificaciones `source-consistency-v1` y `lineage-consistency-v1` no prueban que la afirmación citada sea verdadera en el mundo; solo comprueban consistencia con recibos y linaje. No deben interpretarse como garantía de veracidad.
- El ámbito es una decisión acotada de tipo multiple-choice; no es un modelo generativo de propósito general ni se documentan contextos largos, multilingüismo o tool calling.
- El código de salida `3` indica no ejecutado: si el proveedor no produce una propuesta usable, no se autoriza ninguna respuesta y nada de la cadena debe leerse como aprobado.
- `memory clear` es destructivo y se niega a ejecutarse sin `--yes`.
- Resolver dependencias solo desde `pyproject.toml` deriva hacia arriba; hay que usar `requirements-lock.txt` como superficie de reproducibilidad.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo de propuesta en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WayneRR/cognitive-learning-lab
- Modelo de propuesta Laya: https://huggingface.co/convaiinnovations/laya (revisión `55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851`)
- Encoder ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large (revisión `45bb4654a4d5aaff24dd11d4781fa46d39bf8c13`)
- Referencias internas citadas en la model card: `acceptance/PR-M1.md`, `SOURCE-INVENTORY.md`, `RELEASE-CHECKLIST.md`, `RELEASE-MANIFEST.json`, `requirements-lock.txt`, `LICENSE`, `sanitize.py`
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al proyecto; las búsquedas devolvieron únicamente recursos genéricos sobre algoritmos de machine learning (GeeksforGeeks, IBM, Wikipedia, Simplilearn), sin relación con este runtime.
