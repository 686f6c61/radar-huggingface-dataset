# TheAndr3/lsh-forest-clinical-recommender

## Resumen

`lsh-forest-clinical-recommender` es una implementación de referencia de un motor de recomendación clínica basado en filtrado colaborativo por usuario, desarrollada por TheAndr3 en el marco de un proyecto de investigación y extensión de la Universidade Estadual de Feira de Santana (UEFS), bajo la dirección del Prof. Dr. João Batista da Rocha Junior. No se trata de un modelo neuronal ni de un transformer: es un sistema de recuperación aproximada de vecinos construido sobre LSH Forest (Bawa et al., WWW 2005) y firmas MinHash, empaquetado como repositorio de Hugging Face con la librería `datasketch`.

El sistema resuelve el problema de recomendar procedimientos y consultas a pacientes a partir de su historial de interacciones binarias, codificadas en el formato `"Nombre|Categoria"`. La similitud entre perfiles se estima mediante la distancia de Jaccard, calculada de forma sublineal gracias al índice LSH Forest, lo que permite consultas en memoria RAM con latencias declaradas de aproximadamente 0,2–0,3 s en arranque en caliente.

Su relevancia actual es acotada pero concreta: demuestra una arquitectura "memory-first serverless" para recomendación en entornos sanitarios donde no se dispone de infraestructura de GPU ni de grandes volúmenes de datos para entrenar un modelo profundo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que el contenido principal es el código de referencia y no pesos preentrenados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LSH Forest (índice de prefijos auto-ajustable) sobre firmas MinHash; filtrado colaborativo basado en usuario |
| Parámetros totales | no disponible (no es un modelo neuronal; no hay pesos entrenados) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | portugués (pt, pt-br) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de código Python; sin safetensors ni GGUF) |

Parámetros internos del índice declarados por el autor:

| Parámetro | Valor |
|---|---|
| `NUM_PERM` (`l`) | 200 permutaciones |
| `LSH_K_BUILD` | 80 |
| `LSH_K_QUERY` | 20 |
| `MIN_ITEMS` / `MAX_ITEMS` | 2 / 100 |
| `MAX_CACHED` / `MAX_BATCH` | 50 / 300 |
| Librería | `datasketch` |

## Arquitectura y entrenamiento

El sistema no se entrena en el sentido habitual: no hay descenso de gradiente ni ajuste de pesos. El algoritmo 1 (`build_index`) filtra perfiles elegibles con entre 2 y 100 ítems para contener valores atípicos, genera firmas MinHash con 200 permutaciones aleatorias que aproximan la similitud de Jaccard `J(A, B) = |A ∩ B| / |A ∪ B|` y las indexa en una LSH Forest auto-ajustable. Además, precalcula rankings de respaldo global segmentados por género (`GLOBAL`, `GLOBAL_MASCULINO`, `GLOBAL_FEMENINO`) para mitigar el arranque en frío.

El algoritmo 2 realiza ingeniería de atributos clínicos codificando interacciones binarias en el formato `"Nombre|Categoria"`, distinguiendo entre `Procedimento` y `Consulta`. El algoritmo 3 (`query` / `batch_query`) recupera los 20 vecinos aproximados más cercanos en la LSH Forest, puntúa los ítems candidatos no consumidos por frecuencia de co-ocurrencia entre esos vecinos, aplica un filtro de restricción clínica por género y activa una degradación gradual en cuatro niveles para escenarios de cold start. La caché LRU en RAM admite hasta 50 entradas y el procesamiento por lotes hasta 300 por petición HTTP.

La innovación técnica destacable es la combinación de MinHash con LSH Forest para obtener recuperación sublineal de vecinos sin GPU ni servidor dedicado, manteniendo el índice íntegramente en memoria. Los valores de los parámetros se justifican por los resultados de Rocha-Junior et al. (2025), que reportan un pico de precisión media del 15,1 % y un recall cercano al 92 % con `l = 200`.

## Capacidades

- Recomendación de procedimientos y consultas clínicas por filtrado colaborativo basado en usuario.
- Recuperación aproximada de vecinos mediante similitud de Jaccard estimada con MinHash.
- Indexación y consulta sublineal con LSH Forest auto-ajustable.
- Filtrado de restricciones clínicas por género (excluye, por ejemplo, `Cólica Menstrual|Consulta` para pacientes de sexo masculino).
- Degradación gradual en cuatro niveles para mitigar el arranque en frío de pacientes con historial escaso.
- Rankings de respaldo global segmentados por género.
- Consulta individual (`query`) y por lotes (`batch_query`, hasta 300 por petición).
- Caché LRU en memoria para consultas repetidas (hasta 50 entradas).
- Sin soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Recomendación de procedimientos en consulta ambulatoria: dado el historial de un paciente codificado como conjunto de ítems, el motor devuelve los procedimientos y consultas más probables según la co-ocurrencia entre pacientes similares, con latencia en caliente de 0,2–0,3 s.
- Sistemas de apoyo a la decisión sin GPU: al residir el índice en RAM y no requerir aceleración hardware, puede desplegarse en un servidor modesto o en un contenedor serverless para entornos clínicos con recursos limitados.
- Gestión de arranque en frío en nuevos pacientes: la degradación gradual en cuatro niveles y los rankings globales segmentados por género permiten ofrecer recomendaciones razonables incluso con historiales de uno o dos ítems.
- Filtrado clínico por género: el motor excluye automáticamente ítems incompatibles con el sexo del paciente, lo que reduce recomendaciones clínicamente inválidas en especialidades como ginecología.
- Procesamiento por lotes de cohortes: `batch_query` admite hasta 300 resoluciones por petición HTTP, útil para precalcular recomendaciones de una lista de pacientes en un proceso nocturno.
- Prototipado e investigación en sistemas de recomendación sanitarios: al ser una implementación de referencia con licencia MIT, sirve como base reproducible para comparar variantes de MinHash y LSH Forest en dominios clínicos.
- Servicio de recomendación con caché para consultas recurrentes: la caché LRU de 50 entradas evita recalcular vecinos en sesiones repetidas del mismo paciente.

## Benchmarks y rendimiento

El autor cita resultados de Rocha-Junior et al. (2025) para la configuración `l = 200`: precisión media del 15,1 % y recall cercano al 92 %. No se detalla el conjunto de datos, el protocolo de evaluación ni las métricas completas en la información disponible.

| Métrica | Valor | Fuente |
|---|---|---|
| Precisión media (P@k) | 15,1 % | Rocha-Junior et al. (2025), citado por el autor |
| Recall | ~92 % | Rocha-Junior et al. (2025), citado por el autor |
| Latencia en caliente | ~0,2–0,3 s | Model card del autor |

No se han publicado resultados de benchmarks comparativos con otros sistemas de recomendación en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el sistema no usa GPU.
- GPU recomendadas: ninguna; funciona íntegramente en CPU.
- Memoria RAM: el índice completo reside en memoria; el tamaño depende del número de pacientes y de la longitud de sus historiales (200 hashes de 32 bits por perfil en la configuración por defecto). No se especifica un requisito mínimo en la información disponible.
- Cabe en cualquier máquina de consumo: portátil, contenedor pequeño o función serverless.
- Opciones de despliegue: script Python con `datasketch`; el autor menciona un servidor HTTP con `query` y `batch_query`, pero no detalla el framework.
- Latencia: ~0,2–0,3 s en arranque en caliente con caché LRU; no se especifica el throughput.

## Comparativa con modelos similares

| Sistema | Enfoque | Requiere GPU | Licencia | Estado |
|---|---|---|---|---|
| `lsh-forest-clinical-recommender` | MinHash + LSH Forest, filtrado colaborativo | No | MIT | Repositorio de referencia, 0 descargas |
| Recomendadores neuronales (p. ej. NCF, SASRec) | Redes neuronales sobre interacciones | Sí (entrenamiento e inferencia) | Variable | Modelos publicados con pesos |
| `implicit` (librería ALS/BPR) | Factorización matricial | No | MIT | Librería consolidada |
| Similitud coseno exacta sobre ítems | Fuerza bruta O(n²) | No | No aplica | Baseline sin índice aproximado |

La comparación cuantitativa de rendimiento con estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde preguntas; cualquier uso conversacional es inválido.
- Solo soporta portugués (pt, pt-br) en la codificación de ítems clínicos; el catálogo de procedimientos y consultas está pensado para el sistema sanitario brasileño.
- La precisión media reportada (15,1 %) es baja en términos absolutos; el recall alto (~92 %) puede enmascarar un gran volumen de candidatos recuperados.
- Los resultados citados provienen de un único trabajo (Rocha-Junior et al., 2025) y no se han replicado de forma independiente en la información disponible.
- El filtrado por género es una restricción clínica codificada de forma binaria y puede no cubrir identidades no binarias ni criterios clínicos más matizados.
- El arranque en frío se mitiga con rankings globales, pero la calidad de las recomendaciones para pacientes con historial mínimo no está cuantificada.
- El índice reside en RAM: el crecimiento del número de pacientes implica crecimiento lineal de memoria y posibles problemas de escalado no documentados.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías clínicas; no debe usarse como único criterio en decisiones médicas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/TheAndr3/lsh-forest-clinical-recommender
- LSH Forest (Bawa et al., WWW 2005): no disponible en la información proporcionada
- Rocha-Junior et al. (2025): no disponible en la información proporcionada
- Librería `datasketch`: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
