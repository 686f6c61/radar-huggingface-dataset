# xinyuzhou/ClinicalJev-4B-v0.1-preview-LoRA

## Resumen

ClinicalJev-4B-v0.1-preview-LoRA es un adaptador LoRA publicado por xinyuzhou (Xinyu Zhou, estudiante de doctorado en informática en la Universidad de Wisconsin-Madison) que se monta sobre el backbone de texto Qwen3.5-4B. No es un modelo generativo al uso: dado un texto clínico (campo `state`), una pregunta (`instructions`) y un conjunto de candidatos o un rúbrica predefinida (`criteria`), devuelve una elección y una distribución de probabilidad sobre las opciones. El autor lo presenta como la versión 0.1 preview de ClinicalJev, acompañada de código de inferencia y de un benchmark propio en el repositorio de GitHub xzhou-code/ClinicalJev.

Técnicamente, el modelo no genera texto: lee los logits del siguiente token en la posición del prefijo JSON de respuesta y normaliza únicamente las etiquetas permitidas. Soporta tres primitivas: Choice (selección entre candidatos nombrados), Score (probabilidades sobre una rúbrica ordenada de menor a mayor y su índice esperado) y Noul (estimación de verdad para una proposición de sí/no). Esto lo sitúa más cerca de un clasificador estructurado para texto clínico que de un asistente conversacional.

Su relevancia actual es doble. Por un lado, es un ejemplo de adaptación eficiente de un modelo de 4B a dominios regulados con un coste de almacenamiento de 0,5 GB. Por otro, es un lanzamiento muy temprano: cero descargas, cero valoraciones, licencia no especificada y entrenamiento validado únicamente en inglés y chino simplificado. Cualquier uso en producción clínica exige evaluación propia y revisión de las condiciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal de texto; el backbone es Qwen/Qwen3.5-4B |
| Parametros totales | Backbone de aproximadamente 4B; el numero exacto de parametros del adaptador no esta disponible (tamano del repo: 0,5 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos LoRA en safetensors; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles y chino simplificado (entrenamiento limitado a estos dos idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-4B (relacion: adapter) |
| Libreria | peft |
| Tamano del repositorio | 0,5 GB |
| Pipeline | no disponible (la model card declara `inference: false`) |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el backbone de texto causal de Qwen3.5-4B, cargado con PEFT. La particularidad del diseno esta en el mecanismo de inferencia: se formatea el contexto, se coloca despues la pregunta seleccionada y se anade un prefijo JSON de respuesta abierto; a continuacion se leen los logits del siguiente token en esa posicion y se normalizan solo las etiquetas permitidas. No hay generacion de texto ni decodificacion autoregresiva completa. El autor indica que debe usarse la plantilla de chat nativa del checkpoint con el modo de razonamiento (thinking) desactivado. Para la primitiva Score, el modelo devuelve el nivel de rubrica ponderado por probabilidad; para Noul, el ejemplo local mapea nueve bins de valoracion a una estimacion en el intervalo [0,01, 0,99].

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. Si se explicita que el entrenamiento se limito a ingles y chino simplificado y que no se utilizaron los splits de entrenamiento, validacion ni test del benchmark propio. El repositorio de GitHub asociado anuncia pesos, codigo de inferencia, documentacion y un benchmark con especificaciones de tareas y resultados reproducibles.

## Capacidades

- Clasificacion por eleccion (Choice): dada una lista de candidatos nombrados con descripcion, devuelve el candidato seleccionado y una distribucion de probabilidad sobre el conjunto. Admite entre 2 y 50 candidatos.
- Puntuacion sobre rubrica (Score): dada una rubrica ordenada de menor a mayor, devuelve probabilidades por nivel y el indice esperado desde 0 hasta K-1.
- Estimacion de verdad (Noul): dada una proposicion de si/no con criterios opcionales, devuelve una estimacion de verdad. El ejemplo local usa nueve bins mapeados a [0,01, 0,99].
- Extraccion de informacion clinica a partir de notas: presencia, ausencia y estados de incertidumbre respecto a sintomas y hallazgos.
- Manejo del estado como datos, no como instrucciones: el prompt de sistema indica explicitamente que el texto de entrada debe tratarse como datos.
- Capacidad multilingue del backbone limitada de facto a ingles y chino simplificado por el entrenamiento del adaptador.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; el propio diseno exige thinking desactivado.
- No se documenta capacidad de vision, audio ni generacion libre de texto.
- No se publican capacidades de codigo ni de matematicas para este adaptador.

## Casos de uso

- Extraccion estructurada de sintomas en historias clinicas: con la primitiva Choice, se define un candidato por cada estado posible (presente, ausente, incierto) y se obtiene la etiqueta mas probable junto con su distribucion, lo que permite fijar umbrales de confianza antes de escalar a revision humana.
- Deteccion de negacion y de incertidumbre en notas medicas: la primitiva Noul responde a proposiciones del tipo "el paciente refiere dolor toracico", distinguiendo entre negacion explicita y falta de informacion, algo critico para no introducir falsos positivos en sistemas de alerta.
- Triaje asistido por reglas puntuadas: con Score se define una rubrica ordenada (por ejemplo, sin soporte, posible, soportado explicitamente) y se obtiene un indice esperado que puede alimentar una cola de priorizacion revisada por personal clinico.
- Anotacion de corpus para investigacion: el adaptador puede preetiquetar grandes volumenes de notas en ingles o chino simplificado y generar distribuciones de probabilidad que sirvan para muestreo activo y control de calidad de anotadores humanos.
- Auditoria de calidad documental: evaluar si una nota justifica una afirmacion registrada en el historial mediante la primitiva Noul, detectando incoherencias entre el texto libre y los campos codificados.
- Normalizacion de variables para cohortes retrospectivas: transformar texto clinico heterogeneo en variables categoricas reproducibles con probabilidades asociadas, utiles para construir tablas analiticas en estudios observacionales.
- Apoyo a facturacion y codificacion: puntuar con rubricas ordenadas el grado de evidencia de un diagnostico o procedimiento en la nota, generando un valor de soporte que el codificador humano puede revisar.
- Integracion como componente de un pipeline mayor: al leer solo logits restringidos a etiquetas, la salida es determinista en formato y facil de validar con JSON Schema, lo que simplifica su encaje en sistemas con contratos de datos estrictos.

## Benchmarks y rendimiento

La model card incluye una grafica comparativa frente a Jev 1.13.0 sobre 13 conjuntos de datos reservados (held-out), y afirma que no se usaron splits de entrenamiento, validacion ni test de esos conjuntos durante el entrenamiento. Sin embargo, en la informacion disponible no se facilitan los valores numericos de esa comparacion.

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,5 GB en disco; el grueso del coste corresponde al backbone Qwen3.5-4B.
- VRAM estimada para inferencia, partiendo del tamano del backbone (4B) y no de mediciones publicadas: en fp16 en torno a 8-10 GB; en int8 en torno a 5-6 GB; en int4 en torno a 3-4 GB. Son estimaciones, no cifras verificadas para este adaptador.
- GPU recomendadas para fp16: A100, H100, L40S o RTX 4090 (24 GB). Para cuantizacion int4 o int8, tarjetas consumer de 8-12 GB podrian ser suficientes.
- Cabe en GPU de consumo: previsiblemente si, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, siempre que se cuantice el backbone.
- Opciones de despliegue: transformers + accelerate + peft, tal como indica el autor con `pip install -U torch transformers accelerate peft`. vLLM o TGI son habituales para servir backbones con adaptadores LoRA, pero no se confirman en la documentacion disponible.
- llama.cpp u Ollama requeririan convertir el backbone a GGUF; no se publican pesos GGUF ni se documenta este flujo.
- El diseno de inferencia no es un pipeline estandar: requiere el formateador propio del autor y la lectura de logits restringidos, por lo que el pipeline de HuggingFace figura como no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ClinicalJev-4B-v0.1-preview-LoRA | Adaptador sobre backbone de ~4B | no disponible | Salida por logits restringidos a etiquetas (Choice, Score, Noul) | en, zh | no disponible | Repo de 0,5 GB, 0 descargas, 0 likes |
| tianxinwei/JevAny-Gemma-4B-LoRA | Adaptador sobre backbone de ~4B | no disponible | Adaptador LoRA de la misma familia de primitivas Jev | no disponible | no disponible | Publicado en HuggingFace |
| xinyuzhou/PH-LLM-14B-LoRA | Adaptador sobre backbone de ~14B | no disponible | Adaptador LoRA orientado a salud publica, del mismo autor | no disponible | no disponible | Publicado en HuggingFace |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | Transformer causal de texto, generacion libre | multilingue | no disponible en esta informacion | Modelo base de referencia |

La informacion disponible no permite comparar rendimiento numerico entre estos modelos; la model card solo ofrece una comparacion grafica frente a Jev 1.13.0 sobre 13 conjuntos reservados, sin cifras publicadas.

## Limitaciones y advertencias

- Version preview: el propio autor la etiqueta como v0.1 preview, con 0 descargas y 0 likes en el momento de la consulta. No debe asumirse estabilidad de API ni de comportamiento.
- Licencia no especificada: al no figurar licencia, el uso comercial y la redistribucion quedan en un limbo legal. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Ambito linguistico restringido: el entrenamiento se limita a ingles y chino simplificado. Aunque el backbone es multilingue, el rendimiento en otras lenguas, incluido el castellano, no ha sido validado.
- Riesgo de alucinacion: aunque el diseno restringe la salida a etiquetas permitidas y no genera texto libre, la estimacion de probabilidad puede ser erronea. Una nota ambigua puede recibir una etiqueta de alta confianza.
- Sensibilidad al orden: el autor advierte explicitamente de que el orden de los candidatos y de la rubrica afecta al resultado. Cualquier evaluacion debe fijar y documentar ese orden.
- Dependencia del formateador: la inferencia requiere el prompt de sistema, el sufijo y el prefijo JSON exactos del ejemplo. Desviarse de ese formato invalida las probabilidades.
- Modo thinking desactivado obligatorio: usar el checkpoint con razonamiento activado puede alterar la distribucion de logits en la posicion de respuesta.
- Contexto desconocido: no se especifica la longitud de contexto util para esta tarea, lo que impide garantizar el comportamiento con notas clinicas largas.
- Ninguna validacion clinica: no hay evidencia de validacion prospectiva, ensayo clinico ni certificacion como producto sanitario. No es un dispositivo medico y no debe usarse para diagnostico o decision terapeutica autonoma.
- Sesgos potenciales: no se documenta analisis de sesgo por sexo, edad, etnia, idioma o institucion, ni la composicion del dataset de entrenamiento.
- Superficie de evaluacion limitada: la unica evidencia publicada es una grafica comparativa sin cifras en la model card y un benchmark propio del autor, que no es independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xinyuzhou/ClinicalJev-4B-v0.1-preview-LoRA
- Repositorio GitHub de ClinicalJev (pesos, codigo de inferencia, documentacion y benchmark): https://github.com/xzhou-code/ClinicalJev
- Grafica comparativa frente a Jev 1.13.0 sobre 13 conjuntos reservados: https://raw.githubusercontent.com/xzhou-code/ClinicalJev/main/assets/comparison-4B.png
- Documentacion de las primitivas Choice, Score y Noul: https://docs.typesafe.ai/primitives/choice , https://docs.typesafe.ai/primitives/score , https://docs.typesafe.ai/primitives/noul
- Pagina personal del autor: https://www.xinyuzhou.me/
- Modelo relacionado del mismo autor: https://huggingface.co/xinyuzhou/PH-LLM-14B-LoRA
- Modelo relacionado de la misma familia Jev: https://huggingface.co/tianxinwei/JevAny-Gemma-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
