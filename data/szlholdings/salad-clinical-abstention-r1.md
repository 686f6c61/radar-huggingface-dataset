# SZLHOLDINGS/salad-clinical-abstention-r1

## Resumen

salad-clinical-abstention-r1 es un modelo publicado en Hugging Face por SZLHOLDINGS, una organizacion que se presenta como un "estate" de IA gobernada con modelos, datasets y Spaces acompanados de recibos verificables. El nombre del repositorio sugiere un modelo orientado al dominio clinico con capacidad de "abstention" (abstencion o rechazo a responder), es decir, un modelo entrenado para reconocer cuando no dispone de informacion suficiente y declinar responder en lugar de alucinar. Se trata de un caso de uso de alta relevancia en entornos sanitarios, donde una respuesta incorrecta puede tener consecuencias graves.

Sin embargo, la model card publicada no proporciona informacion tecnica sustantiva: no se especifican arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de evaluacion. La propia card declara explicitamente que cualquier afirmacion no respaldada por un recibo de evaluacion medido se etiqueta como UNKNOWN, y el escaneo de recibos de la propia organizacion clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, con archivos con nombre de recibo pero sin el DONE.json estricto que respaldaria evidencias de evaluacion. El tamano del repositorio es de 0,7 GB, lo que sugiere un modelo de pequeno o mediano tamano en pesos safetensors, pero no permite inferir el numero de parametros con precision.

En el momento de redactar esta ficha no hay descargas ni likes registrados, y la licencia y los idiomas soportados no estan declarados. Por tanto, esta ficha debe leerse como una descripcion estructural del artefacto y de su contexto de publicacion, no como una evaluacion de sus capacidades reales, que a dia de hoy no estan verificadas por evidencia publica medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (tamano de repo: 0,7 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (declarado en los tags del repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida o cualquier otra variante. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

La unica informacion relacionada con el proceso de entrenamiento es de caracter meta: la organizacion declara que las afirmaciones de entrenamiento y evaluacion de este artefacto residen en sus archivos de recibo (receipts) dentro del "estate mesh", y que cualquier dato no respaldado por un recibo se considera UNKNOWN. El escaneo de recibos de la propia organizacion (tranche 6, chunk 1, del 22 de noviembre de 2026) clasifica este repositorio como RECEIPT_FILES_NO_DONE: existen archivos con nombre de recibo (assets/szl-card/mesh-receipts.svg), pero no hay un DONE.json estricto con status=MEASURED, eval_rc=0 y timestamp que valide evidencias de evaluacion. En consecuencia, no es posible confirmar ni el proceso de entrenamiento ni la calidad del artefacto a partir de la informacion publicada.

## Capacidades

- Abstencion clinica (inferida del nombre del modelo): el artefacto estaria orientado a reconocer limites de conocimiento y declinar responder en contextos clinicos, aunque esta capacidad no esta verificada por evidencia publica.
- Generacion de texto: no confirmada por la model card.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Triaje clinico con abstención: un modelo entrenado para abstenerse podria emplearse en la primera fase de triaje para clasificar consultas y derivar a un profesional humano cuando la confianza sea baja, reduciendo el riesgo de respuestas erroneas en dominios sensibles. La idoneidad concreta no puede evaluarse sin datos de rendimiento.
- Filtrado de preguntas fuera de dominio: en un asistente clinico, el modelo podria actuar como capa de control que detecta consultas que exceden su ambito de competencia y las rechaza de forma explicita antes de que lleguen a un modelo generativo mayor.
- Anotacion de incertidumbre en pipelines de datos clinicos: el modelo podria etiquetar pares pregunta-respuesta con un indicador de abstención para construir conjuntos de datos de entrenamiento con ejemplos negativos, utiles para entrenar sistemas mas seguros.
- Auditoria de respuestas generadas: integrado como verificador en un pipeline de revision, el modelo podria marcar respuestas que deberian haberse abstenido, sirviendo como senal de alarma en sistemas de monitorizacion.
- Investigacion sobre calibracion y abstención: util como artefacto de estudio en experimentos academicos sobre comportamiento de rechazo en dominios de alto riesgo, siempre que se validen sus propiedades de forma independiente.
- Prototipado de asistentes clinicos con salvaguardas: en fases tempranas de desarrollo, podria emplearse para explorar interfaces donde el sistema comunica incertidumbre al usuario, aunque sin evidencia de evaluacion no es apto para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos indica que no existe evidencia de evaluacion estricta (DONE.json con status=MEASURED). Cualquier cifra de rendimiento atribuida a este modelo careceria de respaldo verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El tamano del repositorio (0,7 GB) sugiere que los pesos en safetensors ocupan menos de 1 GB, lo que apunta a un modelo de pocos cientos de millones de parametros en precision de 16 bits o a un modelo mayor cuantizado, pero no es posible determinarlo sin acceso a los archivos de pesos.
- GPU recomendadas: no disponible. Si el modelo es de pequeno tamano, cabria en GPUs de consumo como RTX 3060, RTX 4060 o superiores; si es mayor, requeriria A100 o H100. Sin datos de parametros no puede confirmarse.
- Compatibilidad con GPU de consumo: probable si el modelo es de menos de aproximadamente 7 000 millones de parametros, pero no confirmado.
- Opciones de despliegue: no disponibles. El formato safetensors es compatible con vLLM, TGI y transformers, pero se desconoce si existe version GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconocen los parametros, el contexto y el rendimiento del modelo. A modo de referencia estructural, se indican alternativas genericas de la categoria de modelos clinicos con abstención, sin datos comparativos verificados:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-clinical-abstention-r1 | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Meditron (familia) | 7B / 70B | 4K-8K | Llama (segun version) | Hugging Face, ampliamente evaluado |
| BioMistral | 7B | 8K | Apache 2.0 | Hugging Face, con benchmarks publicados |
| MedGemma | 4B / 27B | variable | Gemma | Hugging Face, con evaluacion publicada |

La comparacion con estos modelos no puede hacerse en terminos de rendimiento porque salad-clinical-abstention-r1 carece de benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de evidencia de evaluacion: la propia organizacion clasifica el repositorio como RECEIPT_FILES_NO_DONE, sin DONE.json estricto. No hay base para afirmar ninguna capacidad o calidad.
- Licencia no declarada: no puede determinarse si el uso comercial esta permitido. Usar el modelo en produccion sin aclarar la licencia es un riesgo legal.
- Idiomas no declarados: se desconoce si soporta castellano o cualquier otro idioma distinto del que se uso en el entrenamiento.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; la supuesta capacidad de abstención no esta verificada y no debe asumirse.
- Dominio clinico de alto riesgo: cualquier uso en salud exige validacion independiente, supervision profesional y cumplimiento normativo (por ejemplo, regulacion de dispositivos medicos). Este artefacto no dispone de dicha validacion publica.
- Sesgos desconocidos: sin documentacion sobre datos de entrenamiento no es posible evaluar sesgos demograficos, linguisticos o clinicos.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, creado en noviembre de 2026, lo que indica ausencia de validacion por parte de la comunidad.
- Trazabilidad limitada: la card remite a un "estate mesh" y a recibos internos no incluidos en el repositorio, lo que dificulta la verificacion externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-clinical-abstention-r1
- Organizacion SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
- Paper, blog o demo adicionales: no disponibles
