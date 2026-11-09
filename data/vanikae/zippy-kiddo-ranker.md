# vanikae/zippy-kiddo-ranker

## Resumen

Zippy Kiddo Catalogue Ranker es un modelo de recuperación de información (retrieval) basado en TF-IDF, publicado por el usuario vanikae en Hugging Face. Según su model card, se ha entrenado sobre un catálogo de actividades revisado ("reviewed activity catalogue") y su función es ordenar candidatos del catálogo ante una consulta. No es un modelo generativo ni un transformer neuronal: es un ranker compacto de recuperación léxica.

La model card es explícita sobre el alcance: las reglas duras de edad, tiempo, materiales, entorno y supervisión quedan fuera del modelo y son autoritativas. Es decir, el modelo no decide filtros de seguridad ni restricciones operativas; solo puntúa relevancia sobre un catálogo previamente validado. Esta separación entre ranking y reglas de negocio es el punto técnico más relevante del artefacto.

La información pública disponible es muy escasa: no hay especificación de arquitectura neuronal, número de parámetros, longitud de contexto, idiomas, licencia ni resultados de benchmarks. Las descargas y likes son cero en el momento de la consulta, y el repositorio no declara pipeline ni etiquetas de idioma. Cualquier evaluación de idoneidad para producción debe hacerse, por tanto, contra el catálogo concreto y el conjunto de reglas externas que lo acompañen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (recuperación léxica; no se especifica el estimador de ranking) |
| Parametros totales | no disponible (TF-IDF no se describe en términos de parámetros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no procede en un modelo TF-IDF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se declara si se serializa como pickle, joblib, JSON u otro) |

## Arquitectura y entrenamiento

La model card describe un "compact TF-IDF retrieval model" entrenado sobre el catálogo de actividades revisado. TF-IDF es una representación vectorial dispersa que pondera términos por frecuencia en el documento y rareza en el corpus; el ranking se obtiene normalmente por similitud coseno o producto escalar entre la consulta y los vectores del catálogo. No se indica si sobre esa representación se aplica un clasificador, un re-ranker lineal o una simple búsqueda por similitud.

No hay información sobre el número de documentos del catálogo, el tamaño del vocabulario, el esquema de tokenización, el uso de n-gramas, técnicas de normalización (stemming, lematización, stopwords) ni sobre validación o métricas de entrenamiento. Tampoco se documenta ningún tipo de ajuste fino neuronal, RLHF o DPO, lo cual es coherente con la naturaleza léxica del modelo. La innovación declarada no es algorítmica sino de diseño: separar el ranking de las reglas duras (edad, tiempo, materiales, entorno, supervisión), que permanecen externas y autoritativas.

## Capacidades

- Recuperación y ordenación de entradas de un catálogo de actividades ante una consulta textual.
- Puntuación de relevancia léxica mediante TF-IDF sobre el vocabulario del catálogo revisado.
- Integración como componente de ranking dentro de un pipeline mayor, dejando los filtros duros a capas externas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas no están declarados.
- No se documenta generación de texto, código, matemáticas, visión ni audio.
- No se documenta modo de razonamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Motor de búsqueda interno del catálogo de actividades: dada una consulta en lenguaje natural del usuario, el modelo devuelve las actividades del catálogo ordenadas por relevancia léxica; las restricciones de edad o supervisión se aplican después como filtros deterministas.
- Recomendación en aplicaciones infantiles o educativas: el ranker selecciona candidatos del catálogo revisado y una capa de negocio descarta los que no cumplen los límites de edad, duración o materiales exigidos.
- Asistente de planificación de sesiones: un planificador consulta al ranker para proponer actividades afines a un tema y luego valida tiempo, materiales y entorno con las reglas externas.
- Baseline de recuperación en sistemas RAG ligeros: al ser TF-IDF, sirve como referencia rápida y de bajo coste frente a retrievers neuronales, útil para medir la ganancia de modelos densos.
- Filtrado previo en pipelines de moderación de catálogo: ordena entradas candidatas antes de una revisión humana o de un clasificador más costoso.
- Despliegue en entornos con recursos muy limitados: al no requerir GPU ni pesos neuronales, puede ejecutarse en CPU dentro de servicios pequeños o en el propio dispositivo, siempre que el catálogo y el vocabulario quepan en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; un modelo TF-IDF se ejecuta en CPU y su huella depende del tamaño del vocabulario y de la matriz documento-término, no de pesos neuronales.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en GPU consumer: sí, en cualquier GPU, aunque no es necesario su uso.
- Opciones de despliegue: no se documenta ninguna; al no declararse el formato de serialización, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles; dependerán del tamaño del catálogo, del vocabulario y de la implementación de la búsqueda por similitud.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vanikae/zippy-kiddo-ranker | TF-IDF retrieval | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| BM25 (implementaciones tipo rank_bm25) | Recuperación léxica | no aplica | no aplica | según implementación (habitualmente Apache 2.0 o MIT) | Amplia, librerías estándar |
| Sentence-Transformers (p. ej. all-MiniLM-L6-v2) | Bi-encoder denso | ~22 M | 256-512 tokens | Apache 2.0 en la mayoría de variantes | Hugging Face, ampliamente usado |
| Modelos de re-ranking tipo cross-encoder | Cross-encoder | variable (decenas a cientos de millones) | 512 tokens típicamente | variable según modelo | Hugging Face |

La comparación es cualitativa: no hay datos de rendimiento publicados para zippy-kiddo-ranker que permitan contrastar métricas de recuperación (Recall@k, MRR, nDCG) frente a BM25 o frente a bi-encoders densos. La ventaja esperable del modelo es su ligereza y su ajuste al catálogo concreto; su limitación estructural es la ausencia de coincidencia semántica más allá del solapamiento léxico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; un TF-IDF hereda los sesgos de vocabulario y distribución del catálogo de entrenamiento, favoreciendo términos frecuentes en él y penalizando sinónimos ausentes.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos por coincidencia léxica superficial (términos polisémicos o coincidencias accidentales).
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas; el rendimiento caerá ante consultas en idiomas o registros distintos de los del catálogo.
- Restricciones de licencia: la licencia no está declarada, por lo que no se puede asumir uso comercial sin consultar al autor.
- Las reglas duras de edad, tiempo, materiales, entorno y supervisión son externas y autoritativas; el modelo no las aplica y no debe usarse como única barrera de seguridad en productos dirigidos a menores.
- No hay información sobre el formato de serialización ni sobre dependencias, lo que complica la reproducibilidad y el despliegue.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- El repositorio no declara pipeline, lo que impide que Hugging Face lo trate como un artefacto estándar de un tipo reconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanikae/zippy-kiddo-ranker
- Perfil del autor: https://huggingface.co/vanikae
