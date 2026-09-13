# YauhenBichel/privacy-gate-llm

## Resumen

privacy-gate-llm es un clasificador binario de texto cuyo único objetivo es responder a una pregunta: "¿este texto debe quedarse en esta máquina?". No es un modelo generativo ni un LLM pese a su nombre: se trata de una cabeza de regresión logística de 1.024 pesos más un sesgo, entrenada sobre embeddings congelados del encoder multilingüe BAAI/bge-m3. Lo desarrolla el usuario YauhenBichel y se publica con licencia Apache 2.0 en HuggingFace.

El problema que aborda es concreto y medible: los conjuntos de reglas basados en expresiones regulares solo detectan secretos, credenciales y datos personales cuando aparecen en un formato predecible (`sk-ant-…`, `patient_id: 40219`, una fecha concreta). Cuando esa misma información se escribe como prosa corriente —una frase clínica, una contraseña incrustada en una descripción de incidencia— las reglas fallan. Según la model card, el ruleset de referencia solo captura 10 de 72 ejemplos sensibles (13,9%), mientras que esta cabeza alcanza el 100% de retención con un 16,4% de fricción sobre textos ordinarios y un AUC de 0,9924 en validación cruzada de 5 particiones.

Su relevancia actual es de tipo arquitectónico y metodológico: demuestra que una cabeza lineal sobre embeddings preentrenados supera ampliamente tanto a las reglas deterministas como al prompting de un modelo de chat pequeño, y publica los resultados negativos (el modelo de 0,8B puntuado correctamente cae a AUC 0,4609, por debajo del azar). Está pensado como segunda barrera de seguridad, nunca como sustituto de los controles deterministas existentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de regresión logística binaria sobre embeddings congelados de un encoder transformer (BAAI/bge-m3) |
| Parámetros totales | 1.025 en la cabeza (1.024 pesos + 1 sesgo). El recuento de parámetros del encoder no se detalla en la información proporcionada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha; la determina el encoder BAAI/bge-m3, que se aplica sobre el texto completo |
| Tipos de cuantización | No disponible. La cabeza se distribuye como JSON en coma flotante; las opciones de cuantización del encoder no se documentan en la ficha |
| Idiomas soportados | Inglés (en). El encoder es multilingüe, pero todos los ejemplos de entrenamiento son en inglés y no se midió ningún otro idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`head-v0.json`) para la cabeza; el encoder se carga desde BAAI/bge-m3 con sentence-transformers |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente mínima: se calcula el embedding del texto con `SentenceTransformer("BAAI/bge-m3")` usando `normalize_embeddings=True`, se estandariza el vector con la media y la desviación típica almacenadas en el JSON, y se aplica un producto escalar con los 1.024 pesos más el sesgo. El resultado es una puntuación logit que se compara con un umbral de −0,45; por encima, el texto se retiene. En el ejemplo de la model card, una frase clínica en prosa obtiene +7,23 frente a ese umbral. El propio autor señala que la normalización de embeddings "es obligatoria, no cosmética".

El entrenamiento se realizó sobre un conjunto dorado ("gold set") de 127 ejemplos: 72 sensibles (24 secretos y 19 fragmentos de datos personales, entre otros) y el resto textos ordinarios. La evaluación es validación cruzada de 5 particiones, de modo que cada puntuación proviene de una cabeza que nunca vio ese ejemplo. No hay RLHF ni DPO: es aprendizaje supervisado sobre características congeladas. Entre las innovaciones destacables está la publicación explícita de resultados negativos: al pedir a Qwen3.5-0.8B una etiqueta de cuatro categorías, el modelo respondió `HEALTH` en 106 de 127 casos y nunca `SECRET` ni `PII`; con una etiqueta binaria simple respondió `KEEP` en los 127 (función constante). Puntuado correctamente con `logP(KEEP) − logP(SEND)`, su AUC es 0,4609, en el azar y peor que un saco de palabras. El autor también documenta que un baseline sin modelo (unigramas hasheados) alcanza AUC 0,7391, cifra que impide sobreestimar el resultado neuronal.

## Capacidades

- Clasificación binaria de texto en dos veredictos: `hold` (retener en local) y `send` (permitir el envío).
- Detección de información de salud (PHI) escrita en inglés corriente, sin identificadores ni formatos predefinidos.
- Detección de credenciales y secretos embebidos en texto libre, no solo con prefijos reconocibles.
- Detección de datos personales redactados como prosa.
- Detección en contextos "enterrados": una frase clínica o una contraseña en medio de una cola de soporte extensa, un informe de error o un extracto de log. El autor reporta 8 aciertos de 8 en esta categoría.
- Devuelve una puntuación continua (logit) además del veredicto booleano, lo que permite ajustar el umbral según la tolerancia a falsos positivos.
- No genera texto, no razona, no soporta tool calling ni function calling, no tiene modo de pensamiento, visión ni audio.
- No es un modelo de agentes ni de razonamiento multi-paso: es un componente de filtrado previo.
- Integración sin dependencia del repositorio del autor: basta con `huggingface_hub` y `sentence_transformers` para leer el JSON y calcular la puntuación.

## Casos de uso

- Segunda barrera antes de enviar prompts a APIs de terceros: en una máquina que también aloja historiales clínicos, el modelo se coloca detrás de las comprobaciones deterministas ya existentes y solo puede añadir retenciones, nunca autorizar un envío que las reglas ya habían bloqueado.
- Cumplimiento del RGPD en pipelines de datos: etiquetado previo de lotes de texto para decidir qué registros requieren anonimización o revisión manual antes de salir del perímetro de la organización.
- DLP sobre tickets de soporte y logs: los casos "enterrados" (una contraseña o un diagnóstico dentro de un hilo largo) son precisamente los que los escáneres de secretos no detectan; el modelo los marca con una puntuación alta.
- Guardrail en asistentes internos: interposición entre el usuario y cualquier modelo alojado externamente, con registro del logit para auditar cada decisión y calibrar el umbral con tráfico propio.
- Auditoría retrospectiva de corpus históricos: análisis por lotes de documentación, incidencias o correos antiguos para localizar información sensible mal clasificada, aprovechando que la cabeza es un simple JSON y no requiere infraestructura de inferencia generativa.
- Filtrado en herramientas de desarrollo: revisión de informes de error, fragmentos de código pegados en foros internos o descripciones de incidencias antes de incorporarlos a un sistema de tickets externo.
- Preprocesado para enmascaramiento: primera pasada que separa los textos con probabilidad alta de contener PHI o credenciales, que después se procesan con reglas específicas de redacción o seudonimización.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas de forma independiente, `verified: false`). Todos los valores de la cabeza proceden de validación cruzada de 5 particiones.

| Sistema | AUC | Tasa de retención (catch) | Fricción |
|---|---|---|---|
| Ruleset de expresiones regulares | No disponible | 13,9% | 5,5% |
| Unigramas hasheados (sin modelo) | 0,7391 | 98% | 85,5% |
| Qwen3.5-0.8B con prompting | 0,4609 | En el azar | No disponible |
| bge-m3 + cabeza logística | 0,9924 | 100% | 16,4% |

Detalles adicionales aportados:

- 72 de 72 ejemplos sensibles retenidos con 16,4% de fricción y cero fugas en el conjunto dorado de 127 ejemplos.
- Sobre 20 frases redactadas después del entrenamiento: 18 de 20 correctas, con los 11 casos sensibles detectados.
- 8 de 8 en casos "enterrados" (frase clínica o contraseña dentro de un texto largo).

## Requisitos de hardware

- La cabeza logística ocupa 1.025 valores en coma flotante: aproximadamente 4 KB en float32. No es un factor limitante en ningún escenario.
- El coste computacional dominante es el encoder BAAI/bge-m3, que debe ejecutarse una vez por texto evaluado. El recuento exacto de parámetros de ese encoder y su consumo de VRAM no se detallan en la información proporcionada.
- No requiere GPU de centro de datos: no hay ninguna indicación de que se necesiten A100 o H100. Una GPU de consumo o incluso CPU es suficiente para una clase de modelo de este tipo, dado que la carga es una única pasada de codificación.
- Despliegue: `sentence-transformers` más la lectura del JSON de la cabeza. Al no ser un modelo generativo, no aplican vLLM, TGI ni los formatos GGUF/Ollama en el sentido habitual; el encoder sí puede exportarse a ONNX si se necesita acelerar la inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.
- Existe un Space de demostración para probar el modelo sin infraestructura propia.

## Comparativa con modelos similares

| Sistema | Tipo | AUC | Retención | Fricción | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bge-m3 + cabeza logística (este modelo) | Clasificador lineal sobre embeddings | 0,9924 | 100% | 16,4% | Apache 2.0 | HuggingFace y GitHub del autor |
| Ruleset de expresiones regulares | Reglas deterministas | No disponible | 13,9% | 5,5% | Depende del conjunto de reglas | Integrado en el proyecto de referencia |
| Unigramas hasheados | Baseline estadístico sin modelo | 0,7391 | 98% | 85,5% | No disponible | No distribuido como modelo |
| Qwen3.5-0.8B con prompting | LLM generativo pequeño | 0,4609 | En el azar | No disponible | No indicada en la información proporcionada | Modelo público de terceros |

No se dispone de datos comparativos con otras bibliotecas de detección de PII (por ejemplo, Presidio) en la información proporcionada.

## Limitaciones y advertencias

- Un veredicto `send` no garantiza que el texto sea seguro: es un clasificador estadístico con una tasa de fallo medida, no una prueba. No debe ser lo único que se interponga entre datos personales y un tercero.
- El modelo no está validado en producción. La evidencia procede de 147 ejemplos escritos por una sola persona en un día, suficiente para elegir una arquitectura pero no para fijar un umbral que decida qué sale de una máquina con datos de pacientes reales.
- Solo inglés. Aunque el encoder bge-m3 es multilingüe, todos los ejemplos de entrenamiento son en inglés y no se midió ningún otro idioma.
- No es un producto sanitario y no dice nada sobre qué es una lesión: es una herramienta de privacidad.
- Fricción del 16,4% sobre textos ordinarios: en la práctica, aproximadamente uno de cada seis textos benignos se retiene. El propio autor advierte que una barrera que salta con trabajo normal acaba desactivándose.
- La cabeza solo puede añadir retenciones, nunca levantar un bloqueo previo. Ese diseño limita el daño de un falso negativo, pero implica que el modelo no sustituye a las comprobaciones deterministas.
- La métrica principal (AUC 0,9924) no está verificada de forma independiente y aparece marcada como `verified: false` en el model-index.
- Ausencia total de validación por la comunidad en el momento de redactar esta ficha: 0 descargas y 0 "likes" en HuggingFace.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y conservación del aviso de licencia. Las condiciones del encoder BAAI/bge-m3 deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YauhenBichel/privacy-gate-llm
- Código, datos y diario del proyecto: https://github.com/MoleCare/privacy-gate-llm
- Demo (Space): https://huggingface.co/spaces/YauhenBichel/privacy-gate-llm-demo
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Los resultados de búsqueda web proporcionados no contienen ningún enlace relevante sobre este modelo; corresponden a páginas sin relación (ayuda de cuentas de Google/YouTube, contenidos en árabe sobre videojuegos).
