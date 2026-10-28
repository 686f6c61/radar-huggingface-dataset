# u-cellm/scGPT-whole-human

## Resumen

scGPT whole-human es un checkpoint preentrenado del modelo fundacional scGPT, desarrollado por el grupo bowang-lab (Bo Wang y colaboradores) y publicado originalmente en *Nature Methods* en 2024. Este repositorio concreto, `u-cellm/scGPT-whole-human`, no es una publicación del autor original: es un espejo (mirror) byte a byte del checkpoint que los autores distribuyen en Google Drive, creado para permitir descargas programáticas con revisión fijada (pinned revision) y verificación por checksums SHA-256. Los ficheros no han sido modificados.

El modelo se presenta como un modelo fundacional generativo para datos de célula única (single-cell), preentrenado sobre 33 millones de células humanas normales. No es un modelo de lenguaje: su entrada son perfiles de expresión génica, no texto, y su utilidad consiste en servir como base para tareas downstream de biología computacional (anotación celular, imputación de expresión, integración de lotes, inferencia de redes génicas) mediante ajuste fino o extracción de embeddings.

Es relevante ahora por dos motivos prácticos: la distribución original vía Google Drive es frágil para pipelines reproducibles, y este espejo ofrece checksums verificables de `args.json`, `best_model.pt` y `vocab.json`. El repositorio ocupa 0,2 GB y se publica bajo licencia MIT, la misma del repositorio de código scGPT; no se han publicado términos separados para los pesos. El número de parámetros, la longitud de contexto y los detalles de arquitectura no están disponibles en la información proporcionada y deben consultarse en `args.json` dentro del propio checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer generativo para datos de célula única (scGPT); número de capas, dimensión y cabezas de atención no disponibles en la información proporcionada (consultar `args.json`) |
| Parámetros totales | No disponible en la información proporcionada |
| Parámetros activos | No aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | No disponible; la entrada se define por el vocabulario génico de `vocab.json`, cuyo tamaño no se especifica |
| Tipos de cuantización | No disponible; se distribuye un checkpoint PyTorch sin cuantizar (`best_model.pt`) |
| Idiomas soportados | No disponible / no aplica: modelo sobre perfiles de expresión génica, no lingüístico |
| Licencia | MIT (licencia del repositorio scGPT; sin términos separados publicados para los pesos) |
| Formato de pesos | PyTorch (`best_model.pt`), más `args.json` (configuración) y `vocab.json` (vocabulario de genes) |

Datos adicionales verificables: preentrenamiento sobre 33 millones de células humanas normales; tamaño del repositorio 0,2 GB; checksums SHA-256 publicados para los tres ficheros.

## Arquitectura y entrenamiento

La información disponible describe scGPT como un modelo fundacional generativo para biología de célula única y multi-ómica, preentrenado sobre 33 millones de células humanas normales. El checkpoint se acompaña de tres artefactos: `args.json` con la configuración del modelo, `best_model.pt` con los pesos y `vocab.json` con el vocabulario de genes. No se especifican en la información proporcionada el número de capas, la dimensión oculta, el mecanismo exacto de atención, el número de tokens de entrenamiento ni la composición detallada del corpus (tipos de tejido, protocolos de secuenciación, reparto entre órganos).

Tampoco se documentan aquí las fases de alineación posteriores al preentrenamiento (RLHF, DPO u otras), ni detalles sobre decodificación, enmascaramiento génico o funciones de pérdida. Cualquier afirmación sobre estos puntos requeriría consultar el paper citado o el repositorio `bowang-lab/scGPT`. La innovación técnica destacable, a efectos de esta ficha, es la de distribución: un espejo con revisión fijada y checksums SHA-256 (`c18e075e…` para `args.json`, `6cb5d451…` para `best_model.pt`, `acca93d1…` para `vocab.json`), lo que permite reproducibilidad en pipelines automatizados.

## Capacidades

- Modelo fundacional sobre perfiles de expresión génica de célula única, no un modelo de texto: no genera lenguaje natural ni responde a prompts conversacionales.
- Preentrenado sobre 33 millones de células humanas normales, lo que lo habilita como base para tareas downstream en datos humanos.
- Anotación de tipos celulares mediante ajuste fino o extracción de embeddings (capacidad propia de la familia scGPT; los resultados concretos no se detallan en la información proporcionada).
- Generación y reconstrucción de perfiles de expresión (imputación/denoising) al ser un modelo generativo.
- Integración de datos de distintos lotes o protocolos mediante representaciones latentes.
- Inferencia de relaciones génicas y redes de regulación a partir de los embeddings aprendidos.
- Uso como extractor de características para clasificadores y pipelines de análisis downstream.
- Soporte de tool calling / function calling: no disponible; no es una capacidad descrita para este modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no aplica.
- Capacidades multilingües: no aplica (entrada biológica, no lingüística).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Anotación automatizada de tipos celulares en datasets de scRNA-seq: se ajusta el checkpoint sobre un conjunto etiquetado o se extraen embeddings y se entrena un clasificador ligero, reduciendo el trabajo manual de anotación en estudios con decenas de miles de células.
- Imputación y denoising de matrices de expresión: útil en datos con profundidad de secuenciación baja o alto dropout, donde el modelo generativo reconstruye valores plausibles de expresión antes de análisis diferencial.
- Integración de lotes y corrección de efecto batch: al proceder de 33 millones de células humanas normales, sus representaciones sirven como espacio común para alinear muestras de distintos laboratorios o plataformas antes de un análisis conjunto.
- Reference mapping de nuevos experimentos: proyectar células de un estudio nuevo sobre el espacio aprendido para transferir etiquetas desde un atlas de referencia, sin reentrenar desde cero.
- Inferencia de redes de regulación génica: usar los embeddings y pesos de atención para priorizar relaciones gen-gen y factores de transcripción candidatos, que después se validan experimentalmente.
- Base para modelos de perturbación y respuesta: ajuste fino sobre datos de perturbación genética o de fármacos para predecir cambios de expresión, aprovechando el preentrenamiento a gran escala como inicialización.
- Reproducibilidad de pipelines bioinformáticos: al ser un espejo con revisión fijada y SHA-256 verificable, encaja en flujos de CI que necesitan descargar el checkpoint de forma determinista sin depender de enlaces manuales a Google Drive.
- Extracción de features para búsqueda de vecinos y clustering: generar embeddings celulares para agrupar poblaciones, detectar estados transicionales o construir índices de similitud entre células.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas de anotación celular, integración, imputación ni comparaciones cuantitativas; únicamente checksums, configuración de ficheros y la referencia al paper (Cui et al., *Nature Methods*, 2024). Para cifras de rendimiento debe consultarse la publicación citada o el repositorio `bowang-lab/scGPT`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; como referencia, el repositorio completo ocupa 0,2 GB, por lo que el checkpoint es de tamaño reducido y la inferencia en fp32 previsiblemente queda por debajo de 1 GB de VRAM, holgadamente dentro de cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor. Por tamaño del checkpoint, una RTX 3060/4060 o superior es suficiente para inferencia; para ajuste fino sobre datasets grandes conviene una GPU con más memoria (A100, H100, L40S) por el tamaño del lote de células, no por los pesos.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del artefacto (0,2 GB); no hay requisitos oficiales publicados.
- CPU: la inferencia en CPU es viable por el tamaño reducido, aunque el throughput no está documentado.
- Opciones de despliegue: el checkpoint está en formato PyTorch (`best_model.pt`) y requiere el código del repositorio `bowang-lab/scGPT` para cargar `args.json` y `vocab.json`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del tamaño del lote de células y del hardware, y no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos alternativos en la información proporcionada, por lo que las celdas correspondientes se marcan como no disponibles en lugar de estimarse.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scGPT whole-human (este espejo) | No disponible | No disponible | No publicado en la información disponible | MIT (repositorio scGPT) | HuggingFace `u-cellm/scGPT-whole-human`; original en Google Drive |
| Geneformer | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| scFoundation | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| scBERT | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

Nota: la comparación cuantitativa entre modelos fundacionales de célula única requiere consultar benchmarks publicados (por ejemplo, los del paper de scGPT) que no forman parte de la información disponible para esta ficha.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos los publica bowang-lab; este repositorio solo replica los ficheros. No hay soporte del autor original a través de este repo.
- Solo células humanas normales: el preentrenamiento cubre 33 millones de células humanas normales, por lo que el rendimiento en muestras tumorales, tejidos patológicos, organismos modelo (ratón, zebrafish) u otras especies puede degradarse por cambio de distribución.
- Vocabulario génico fijo: `vocab.json` define los genes que el modelo puede codificar; genes ausentes no pueden representarse sin remapeo o reentrenamiento.
- Sesgos de composición del corpus: la mezcla de tejidos, protocolos y donantes del preentrenamiento no está documentada en esta información, lo que puede infrarepresentar tipos celulares raros o poblaciones de determinados tejidos.
- Riesgo de predicciones plausibles pero incorrectas: al ser un modelo generativo, la expresión imputada o las relaciones gen-gen inferidas pueden ser coherentes estadísticamente y no corresponder a biología real; requieren validación experimental.
- Efecto batch y confusión técnica: las representaciones pueden capturar el protocolo de secuenciación en lugar de la biología si no se controla en el ajuste.
- Compatibilidad de código: la carga exige la versión del repositorio scGPT coherente con `args.json`; cambios en el código upstream pueden romper la carga del checkpoint.
- Licencia: MIT según el repositorio scGPT, sin términos adicionales publicados para los pesos. Conviene revisar la licencia upstream antes de uso comercial o redistribución.
- Uso clínico: no hay validación regulatoria ni evidencia clínica; no debe emplearse para decisiones diagnósticas o terapéuticas.
- Fecha de creación del repositorio inusual (2026-10-27) según los metadatos de HuggingFace; conviene verificar la integridad con los SHA-256 publicados antes de usarlo en producción.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo (son páginas de una cadena de supermercados), por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio del espejo en HuggingFace: https://huggingface.co/u-cellm/scGPT-whole-human
- Repositorio de código y fuente original: https://github.com/bowang-lab/scGPT
- Descarga original del checkpoint (Google Drive): https://drive.google.com/drive/folders/1oWh_-ZRdhtoGQ2Fw24HP41FgLoomVo-y
- Paper: Cui, H., Wang, C., Maan, H., Pang, K., Luo, F., Duan, N., Wang, B. "scGPT: toward building a foundation model for single-cell multi-omics using generative AI". *Nature Methods* 21, 1470–1480 (2024). DOI: https://doi.org/10.1038/s41592-024-02201-0
