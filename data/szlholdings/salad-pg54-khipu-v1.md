# SZLHOLDINGS/salad-pg54-khipu-v1

## Resumen

`salad-pg54-khipu-v1` es un artefacto de entrenamiento publicado por SZLHOLDINGS, una organización que se presenta como un "estate de IA gobernada" con modelos, datasets y Spaces acompañados de recibos verificables. El repositorio contiene exclusivamente ficheros de checkpoint (estados de optimizador en formato PyTorch y adaptadores en safetensors), lo que sugiere que se trata de un adaptador LoRA o de un estado intermedio de entrenamiento más que de un modelo base listo para inferencia.

La model card no declara arquitectura, tipo de modelo, número de parámetros, longitud de contexto, idiomas ni licencia. La propia documentación del autor etiqueta explícitamente como UNKNOWN cualquier dato no medido y advierte que no se afirma ningún resultado de benchmark sin un recibo de evaluación medido. El escaneo de recibos incluido en la card clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero no existe un `DONE.json` estricto que valide la evaluación.

Por tanto, la ficha describe un artefacto de entrenamiento opaco desde el punto de vista técnico: no hay `config.json` (la petición devuelve 404), no hay pipeline declarado y no hay evidencia medida de capacidades. Su relevancia es limitada para uso directo en producción, pero resulta útil como ejemplo de publicación con trazabilidad de integridad (hashes SHA-256 de los pesos) y de honestidad explícita sobre lo no medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model_type y architectures NOT-DECLARED; config.json devuelve 404) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se sirven pesos en safetensors y optimizer.pt) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) y PyTorch (optimizer.pt) |
| Tamano del repositorio | 1,0 GB (1.265.777.456 bytes en 59 ficheros) |
| Revision | fd0e8693efe7 |
| Fecha de creacion | 2026-11-18 |
| Fecha de ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se declara arquitectura en el repositorio: el campo `model_type` figura como NOT-DECLARED, `architectures` como NOT-DECLARED y `dtype` como NOT-DECLARED, y la petición a `config.json` devuelve 404. Los artefactos principales servidos son ficheros `optimizer.pt` de 167.988.171 bytes cada uno en los checkpoints 100, 200, 300 y 400, junto con un `adapter_model.safetensors` en el checkpoint 100. La presencia de adaptadores safetensors y de estados de optimizador apunta a un proceso de ajuste fino (probablemente LoRA u otro PEFT) sobre un modelo base no identificado en la card.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. La card indica que cualquier afirmación de entrenamiento o evaluación vive en los ficheros de recibo del "estate mesh" y que lo no receiptado se marca como UNKNOWN. El escaneo estricto de recibos (tranche-6, chunk-3, 2026-11-22) concluye que no existe un `DONE.json` con `status=MEASURED`, `eval_rc=0` y marca temporal, por lo que la evidencia de evaluación es UNKNOWN.

## Capacidades

- No se declara ninguna capacidad funcional en la model card.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas ni visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se declara modo thinking, audio ni ninguna capacidad especial.
- El pipeline no está declarado, por lo que la librería de inferencia recomendada es desconocida.

## Casos de uso

- Auditoría de integridad de artefactos: el repositorio publica hashes SHA-256 (LFS OIDs) de cada `optimizer.pt` y del `adapter_model.safetensors`, lo que permite verificar que los pesos descargados coinciden con lo publicado; útil en pipelines de cadena de suministro de modelos.
- Reanudación de entrenamiento: al incluir estados de optimizador de los checkpoints 100 a 400, el artefacto sirve para retomar un ajuste fino interrumpido, siempre que se conozca el modelo base y la configuración de entrenamiento (no documentados).
- Estudio de metodología de publicación: como ejemplo de model card que separa explícitamente lo medido (MEASURED) de lo reportado (REPORTED) y lo desconocido (UNKNOWN), útil para diseñar plantillas de documentación de modelos.
- Integración como adaptador PEFT: si el adaptador `adapter_model.safetensors` corresponde a un LoRA, podría cargarse sobre el modelo base correspondiente, pero la ausencia de `adapter_config.json` y de identificación del base impide confirmarlo.
- Reproducción de experimentos internos: el equipo que entrenó el artefacto puede usar los checkpoints para comparar estados intermedios y analizar curvas de pérdida, aunque esas curvas no se publican.
- Verificación de recibos en un "estate" gobernado: el repositorio puede usarse para probar herramientas de escaneo de recibos (como el harness r2 citado) que clasifican repositorios según la presencia de evidencia estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos concluye que la evidencia de evaluación es UNKNOWN (no hay `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el tamaño del modelo base y la arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el repositorio pesa 1,0 GB pero contiene principalmente estados de optimizador, no pesos de inferencia completos.
- Opciones de despliegue: no se declara pipeline ni librería; no hay `config.json`, por lo que vLLM, TGI, llama.cpp u Ollama no pueden configurarse sin información adicional del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se declara arquitectura, tamaño, tarea ni licencia, y no hay benchmarks publicados que permitan situar el artefacto frente a alternativas.

## Limitaciones y advertencias

- Ausencia total de metadatos técnicos: sin `config.json`, sin `model_type`, sin `architectures` y sin `dtype`, no es posible cargar el modelo con las herramientas estándar de Hugging Face sin trabajo adicional.
- Naturaleza del artefacto: contiene estados de optimizador y un adaptador, no un modelo completo listo para inferencia; no debe tratarse como un modelo base.
- Evidencia de evaluación inexistente: el escaneo clasifica el repositorio como RECEIPT_FILES_NO_DONE y marca la evidencia de evaluación como UNKNOWN.
- Licencia no declarada: no se puede asumir uso comercial permitido; cualquier despliegue en producción requiere aclaración previa con el autor.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Riesgo de sesgos y alucinación: imposible de evaluar sin datos de entrenamiento ni evaluaciones publicadas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la probabilidad de validación por terceros.
- Las fechas de creación y actualización (noviembre de 2026) y la referencia a un snapshot de auditoría de 2026-11-20 deben tomarse tal cual figuran en la card; no se ha verificado su correspondencia con el calendario real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-pg54-khipu-v1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica citada): https://github.com/szl-holdings
- Herramienta de generación de cards citada: https://github.com/szl-holdings/estate-cards
- Organización de tooling de recibos citada: https://github.com/szlholdings
