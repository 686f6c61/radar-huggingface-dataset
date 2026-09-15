# SOTAagi2030/Transit-Delay-Pilot-Release

## Resumen

Transit-Delay-Pilot-Release es un modelo ONNX de series temporales publicado por el usuario SOTAagi2030 bajo el nombre interno "Regional Transit Delay Forecaster — Pilot". Su función declarada es estimar si una llegada de autobús programada superará el umbral de retraso fijado por la agencia de transporte, devolviendo una probabilidad de retraso y una alerta binaria. No es un modelo de lenguaje: es un clasificador/regresor sobre datos tabulares o secuenciales de operación de flota, empaquetado en formato ONNX para su ejecución en un runtime de inferencia.

El alcance del artefacto es deliberadamente estrecho. La model card indica que está aprobado únicamente para el piloto de días laborables de la ruta 17 ("Route 17 weekday pilot"), y que las peticiones deben seguir el esquema `schemas/request.schema.json`, con el umbral de decisión registrado en `runtime/inference_config.json`. La selección del release candidate se hizo entre candidatos con documentación completa, usando delay F1, delay MAE y una regla de desempate determinista divulgada por el autor.

La relevancia de esta ficha es acotada: se trata de una publicación de licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, un repositorio de 0,0 GB y sin resultados de benchmarks publicados. La información disponible no incluye arquitectura interna, número de parámetros, composición del dataset de entrenamiento ni cifras de rendimiento, por lo que buena parte de las especificaciones técnicas quedan marcadas como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto se distribuye en formato ONNX; no se detalla la topología interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; no se documenta ventana de entrada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés, según los tags del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Pipeline declarado | no disponible |
| Tamaño del repositorio | 0,0 GB |
| Dominio de aplicación | predicción de retraso en transporte público (piloto, ruta 17, días laborables) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card únicamente confirma que el artefacto se sirve en formato ONNX y que la salida es una probabilidad de retraso más una alerta binaria calculada contra un umbral almacenado en `runtime/inference_config.json`. No se especifica si se trata de un modelo recurrente (LSTM/GRU), un transformer de series temporales, un gradient boosting convertido a ONNX o una red densa; tampoco se documenta el número de capas, la dimensión de las entradas ni la ventana temporal utilizada.

Respecto al entrenamiento, la información disponible se limita al proceso de selección del release candidate: se eligió únicamente entre candidatos con documentación completa, empleando delay F1, delay MAE y una regla de desempate determinista que el autor afirma haber divulgado. No se indican el volumen de datos de entrenamiento, la composición del dataset, el periodo temporal cubierto, el número de rutas o vehículos representados, ni si se aplicaron técnicas de calibración, validación cruzada temporal o ajuste fino posterior. Tampoco se menciona ningún mecanismo de innovación técnica (atención lineal, decodificación especulativa ni similares).

## Capacidades

- Estimación binaria de retraso: devuelve una probabilidad de que una llegada programada supere el umbral de retraso de la agencia.
- Emisión de alerta operativa: genera una alerta binaria aplicando el umbral definido en `runtime/inference_config.json`.
- Inferencia sobre series temporales de transporte público: el modelo está etiquetado con `time-series` y `public-transit`.
- Ejecución portable mediante ONNX: el formato permite desplegarlo en distintos runtimes compatibles con ONNX sin depender del framework original.
- Contrato de entrada definido: las peticiones deben ajustarse a `schemas/request.schema.json`, lo que facilita la validación previa en producción.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponibles; el tag de idioma declarado es únicamente `en`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Alertas de despacho en la ruta 17: el modelo puede integrarse en el sistema de control de operaciones para avisar a los despachadores cuando una llegada programada tiene alta probabilidad de superar el umbral de retraso, siempre que la decisión final quede en manos de una persona, tal como exige la model card.
- Panel de supervisión con humano en el bucle: las probabilidades de retraso pueden alimentar una interfaz interna donde el analista revise cada alerta antes de actuar sobre la flota, respetando la restricción de revisión humana obligatoria.
- Validación del propio piloto: sirve como artefacto de referencia para medir delay F1 y delay MAE durante el periodo de prueba de días laborables y comparar contra la línea base operativa de la agencia.
- Monitorización de calidad de datos de AVL/GTFS: al requerir un esquema de entrada estricto, el modelo actúa como comprobador indirecto de que los registros de posicionamiento y horarios llegan completos y en el formato esperado.
- Priorización de recursos en franjas concretas: dentro del alcance del piloto, las probabilidades pueden ordenar qué servicios de la ruta 17 requieren refuerzo o ajuste de margen de recuperación, sin automatizar cancelaciones (prohibidas por la model card).
- Estudio de recalibración de horarios: los analistas pueden usar las predicciones agregadas para evaluar si los tiempos de recorrido programados son demasiado ajustados en determinados tramos y franjas.
- Base para futuras extensiones: el pipeline ONNX y el esquema de petición documentado constituyen un punto de partida reutilizable si la agencia decide ampliar la validación a otras rutas, siempre que se repita el proceso de validación fuera del alcance actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la selección del release candidate se realizó con las métricas delay F1 y delay MAE, pero no proporciona valores numéricos, ni el conjunto de evaluación, ni comparaciones contra líneas base. Tampoco se ofrecen datos de latencia o throughput.

| Métrica | Valor |
|---|---|
| Delay F1 | no disponible (mencionada como criterio de selección, sin cifra) |
| Delay MAE | no disponible (mencionada como criterio de selección, sin cifra) |
| Regla de desempate | declarada como determinista y divulgada, sin detalle en la información disponible |
| Comparación con modelos similares | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el número de parámetros ni el tamaño de los tensores, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Al tratarse de un artefacto ONNX sin especificaciones de cómputo, no hay recomendación publicada.
- Compatibilidad con GPU de consumo: no disponible. El repositorio ocupa 0,0 GB, lo que sugiere un artefacto ligero, pero este dato por sí solo no permite confirmar que quepa en una GPU de consumo concreta.
- Opciones de despliegue: ONNX Runtime es el runtime coherente con el formato declarado. El soporte en otros servidores de inferencia (Triton, TGI, vLLM, llama.cpp, Ollama) no está documentado y no puede darse por supuesto, ya que varios de ellos están orientados a modelos de lenguaje y no a series temporales.
- Latencia y throughput estimados: no disponibles.
- Requisitos de integración: es necesario respetar `schemas/request.schema.json` para las peticiones y disponer de `runtime/inference_config.json` para fijar el umbral de alerta.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (predicción de retraso en transporte público en formato ONNX) ni datos de rendimiento que permitan establecer una comparación fundamentada. Las búsquedas web realizadas no devolvieron resultados relacionados con este modelo ni con su dominio de aplicación.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transit-Delay-Pilot-Release | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance restringido por diseño: el modelo está aprobado solo para el piloto de días laborables de la ruta 17. Cualquier uso en otras rutas queda fuera de la validación declarada.
- Revisión humana obligatoria: la model card exige explícitamente que la salida se use como alerta operativa con revisión humana; no debe emplearse para cancelaciones automáticas de servicio.
- Usos prohibidos: evaluación de empleados y elegibilidad de pasajeros están vetados de forma explícita por el autor.
- Huecos de validación conocidos: horarios de festivos, meteorología severa y desvíos de recorrido quedaron fuera del alcance de validación del piloto, por lo que el rendimiento en esas condiciones es desconocido.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos, pero existe riesgo de falsos positivos y falsos negativos en la clasificación de retraso, sin tasas publicadas.
- Sesgos conocidos: no disponibles. No se documenta la distribución del dataset de entrenamiento ni posibles sesgos por franja horaria, ruta o tipo de vehículo.
- Limitaciones de idioma: el modelo está etiquetado únicamente para inglés (`en`); no se declara soporte para otras lenguas en la documentación o en los metadatos asociados.
- Licencia: Apache 2.0 permite uso comercial, pero la propia model card restringe el uso operativo al piloto de la ruta 17, lo que limita la aplicabilidad práctica en producción más allá de ese contexto.
- Madurez del artefacto: 0 descargas y 0 likes, actualización a los 16 segundos de su creación, repositorio de 0,0 GB y ausencia de benchmarks. No hay evidencia pública de uso en producción.
- Ausencia de trazabilidad técnica: sin arquitectura, parámetros, dataset ni métricas numéricas, resulta imposible auditar el comportamiento del modelo antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SOTAagi2030/Transit-Delay-Pilot-Release
- Referencia al esquema de peticiones: `schemas/request.schema.json` (mencionado en la model card, sin URL pública en la información disponible)
- Referencia a la configuración de inferencia: `runtime/inference_config.json` (mencionado en la model card, sin URL pública en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponible
- Resultados de búsqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo ni sobre su dominio de aplicación; los resultados obtenidos correspondían a preguntas sobre OneDrive y OneNote, sin relación con el artefacto.
