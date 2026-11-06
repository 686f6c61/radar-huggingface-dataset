# thurstonpowers/xll-laya-verifier

## Resumen

XLL Laya Verifier v1.1 es un ajuste fino especializado en tareas de verificación de hechos sobre el modelo Laya (421 millones de parámetros, con backbone ModernBERT-large), desarrollado por el usuario thurstonpowers. El modelo resuelve un problema muy concreto: dado el texto de una sección de una norma estadounidense y una aserción candidata con estructura actor-relación-objetivo (SPO), devuelve tres veredictos calibrados en forma de probabilidad de ser cierta (noul): si la dirección de los roles semánticos es correcta, si la fuente respalda la relación completa y si se preserva el alcance de las restricciones originales.

La relevancia del modelo es acotada pero clara: se trata de una pieza de infraestructura para pipelines de extracción y auditoría legal automatizada, no de un modelo de propósito general. La versión v1.1 supone un cambio incompatible respecto a la revisión anterior, que solo respondía a una única pregunta (`claim_stated`); ahora el contrato exige tres preguntas congeladas y verificables por hash, lo que permite reproducibilidad estricta en campañas de verificación.

El modelo se ejecuta en CPU, lo que lo hace desplegable sin GPU y adecuado para procesos por lotes de verificación documental. Su licencia Apache 2.0 y su tamaño contenido (1,7 GB en el repositorio) facilitan su integración en entornos de producción legales o regulatorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone ModernBERT-large), ajustado para clasificación de tres preguntas |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Laya (convaiinnovations/laya), un modelo de 421M de parámetros construido sobre un backbone ModernBERT-large. Sobre esa base se realizó un ajuste fino de parámetros completos orientado a un contrato de tres preguntas: `direction_correct`, `claim_supported` y `scope_preserved`. Cada pregunta se responde con un valor noul (probabilidad de verdadero/falso) en una única pasada forward. El contrato de preguntas está congelado en `questions.json`, con dos hashes SHA-256 publicados (canónico y de fichero crudo) que garantizan que las preguntas en inferencia son idénticas byte a byte a las usadas en entrenamiento.

El entrenamiento se llevó a cabo en una flota DGX Spark con entrenamiento de parámetros completos y ritmo térmico (pausa a 87 °C, reanudación a 80 °C), micro-batch 1 y batch efectivo 64. Se usaron 61.279 filas de entrenamiento (34.193 únicas) y 2.104 de desarrollo, con un total de 1 época completada de 2 planificadas (parada temprana del operador; después solo calibración y evaluación). La calibración se hizo sobre 4.767 ítems disjuntos por grupo de fuente. El conjunto de datos es `thurstonpowers/xll-spo-dataset`, split `v1.1/laya/`, con splits disjuntos por grupo de parte CFR, deduplicación exacta de payloads y rechazo de gold contradictorios. El entrenamiento finalizó el 2026-10-12.

## Capacidades

- Verificación de aserciones legales con estructura actor-relación-objetivo (SPO) extraídas de estatutos y regulaciones de EE. UU.
- Respuesta conjunta a tres preguntas de verificación en una sola pasada: corrección de dirección de roles, soporte completo de la relación y preservación del alcance de restricciones.
- Salida calibrada tipo noul (probabilidad de verdadero/falso) por cada pregunta, pensada para umbrales por bandas.
- Manejo de modalidad, negación, condiciones, excepciones, cantidades y alternativas AND/OR en la evaluación de alcance.
- Ejecución en CPU, sin necesidad de GPU.
- Contrato de preguntas verificable por hash para reproducibilidad de campañas.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es un modelo de clasificación/verificación, no generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Auditoría de extracción de relaciones legales: en un pipeline que extrae aserciones SPO de secciones del eCFR o del GPO, el modelo actúa como filtro de calidad para descartar aserciones con roles invertidos o relaciones no respaldadas por el texto fuente.
- Control de calidad en bases de conocimiento regulatorias: antes de publicar una relación extraída (por ejemplo, "el comisionado puede ordenar una conferencia previa a la vista"), se verifica que la dirección sujeto-predicado-objeto coincida con la redacción legal y que se conserven las condiciones aplicables.
- Enrutado a revisión humana: usando las bandas recomendadas (fail si algún noul < 0,5; flag si < 0,65; pass en caso contrario), el modelo clasifica automáticamente las aserciones dudosas en colas de revisión, reduciendo el volumen de revisión manual.
- Verificación de citas en asistentes legales: cuando un sistema cita una sección normativa para respaldar una afirmación, el verificador comprueba que la cita soporta la relación completa, incluyendo modalidad y negación, antes de mostrarla al usuario.
- Procesamiento por lotes en CPU: al ejecutarse sin GPU, puede integrarse en jobs nocturnos de verificación de grandes volúmenes de aserciones sobre corpus regulatorios, con coste de infraestructura bajo.
- Reproducibilidad de campañas de verificación: gracias al contrato congelado por hash y a la resolución de revisión fija del repositorio, equipos de cumplimiento pueden reproducir exactamente los veredictos de una campaña pasada para auditoría o disputas.
- Detección de pérdida de alcance en resúmenes normativos: al comparar un resumen generado con la sección fuente, el modelo señala si se han omitido condiciones, excepciones o alternativas que restringen la relación original.

## Benchmarks y rendimiento

Evaluación calibrada sobre conjunto retenido (`DEV_EVAL.json`, 6.312 ítems, disjunto por grupo de fuente):

| Metrica | Valor |
|---|---|
| Accuracy | 0,949 |
| Confianza media | 0,968 |
| ECE (Expected Calibration Error) | 0,019 |
| Brier score | 0,091 |
| Brier top-1 (referencia) | 0,0455 |

No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo corre en CPU según la model card.
- GPU recomendadas: no aplica; cualquier GPU con suficiente memoria podría alojarlo, pero no es un requisito.
- Cabe en GPU de consumo: sí, por tamaño (421M de parámetros, repositorio de 1,7 GB), aunque el caso de uso declarado es CPU.
- Opciones de despliegue: el runtime propio `laya` (función `load` y método `predict`), con descarga vía `huggingface_hub.snapshot_download` fijando una revisión concreta. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thurstonpowers/xll-laya-verifier | 421M | no disponible | Verificación SPO legal (3 preguntas) | Apache 2.0 | Hugging Face |
| convaiinnovations/laya (base) | 421M | no disponible | Modelo base sobre ModernBERT-large | no disponible en la información | Hugging Face |
| Modelos de NLI genéricos (p. ej. DeBERTa-based) | variable | variable | Inferencia de entailment genérica | variable | Hugging Face |

La comparación con alternativas genéricas de NLI no es directa: este modelo está especializado en un contrato de tres preguntas con estructura SPO y datos legales estadounidenses, por lo que un modelo de entailment estándar no cubriría la separación entre dirección de roles y preservación de alcance.

## Limitaciones y advertencias

- Solo verifica aserciones enviadas; no detecta relaciones que nunca se propusieron (el soporte de una aserción no implica completitud de la sección).
- Entrenado con fuentes federales de EE. UU. (datos docente eCFR/GPO); Connecticut se usa aguas abajo, no en entrenamiento, por lo que su generalización a normativa estatal no está validada.
- Los veredictos de alcance y rol son juicios del modelo sobre evidencia citada; los flujos de adjudicación deben tratar flags y fails como colas de revisión, no como verdad absoluta.
- Advertencia de calibración: la temperatura noul ajustada se saturó en el límite superior de su rango [0,5, 5], y el runtime laya reporta algunas entradas de temperatura del checkpoint fuera del intervalo válido (sustituidas por 0,5). Las confianzas deben tratarse como aproximadamente calibradas; se recomienda umbral por bandas en lugar de interpretación directa de la confianza.
- Riesgo de alucinación: al ser un modelo discriminativo de verificación, el riesgo se traslada a falsos positivos (aceptar una aserción no respaldada); los umbrales por bandas mitigan parcialmente este riesgo.
- Limitación de idioma: solo inglés.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte del autor.
- Cambio incompatible respecto a la revisión anterior (`claim_stated`): campañas que citen el checkpoint `laya-2ep` deben recuperarlo por el historial git, ya que el contrato actual difiere.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-laya-verifier
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-spo-dataset
- Contrato de preguntas (`questions.json`): incluido en el repositorio del modelo
- Procedencia de pesos (`WEIGHTS_PROVENANCE.json`): incluido en el repositorio del modelo
