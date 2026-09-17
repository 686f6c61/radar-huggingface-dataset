# zero-proof-ai/zeroproof-airline-concise-4b

## Resumen

zeroproof-airline-concise-4b es un adaptador LoRA publicado por zero-proof-ai sobre el modelo Qwen/Qwen3-4B-Instruct-2507 (4.000 millones de parametros, transformer denso decoder-only). Su objetivo es inculcar en los pesos un registro conversacional concreto —responder primero y parar, sin relleno— en lugar de conseguirlo mediante una instruccion en el prompt. El adaptador se entreno con 525 filas generadas por el SDK de ZeroProof contra la base de datos de aerolinea del benchmark tau-bench.

La relevancia del modelo es metodologica mas que de producto: demuestra que un rasgo de estilo puede entrenarse como disposicion y no como obediencia. En 139 prompts retenidos, con decodificacion greedy y prompts identicos entre brazos, el adaptador alcanza un 93,5% de respuestas en el registro frente al 3,6% del modelo base, omitiendo menos informacion requerida (5,0% frente a 15,8%) y produciendo respuestas aproximadamente cuatro veces mas cortas (mediana de 322 caracteres frente a 1.262).

El modelo es un adaptador PEFT en safetensors, no un modelo completo: requiere cargar los pesos base de Qwen3-4B-Instruct-2507. La model card reporta 0 descargas y 0 likes en el momento de la consulta, y no declara idiomas soportados ni longitud de contexto propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-4B-Instruct-2507, transformer denso decoder-only |
| Parametros totales | 4.000 millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors (el modelo base admite cuantizacion, no declarada en esta ficha) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, libreria `peft`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango no especificado sobre Qwen3-4B-Instruct-2507. El entrenamiento es SFT sobre 525 filas generadas sinteticamente por el SDK de ZeroProof contra la base de datos de aerolinea de tau-bench. Segun la model card, los tokens de prompt y de sistema no computan en la perdida y la tasa de aprendizaje se situa en el rango indicado por la referencia de RLHF Book (capitulo 4).

La innovacion tecnica central es el esquema de destilacion. El profesor que genero las respuestas es el mismo modelo base, Qwen3-4B-Instruct-2507, pero con una "constitucion" en el prompt que define el registro objetivo. Esa constitucion solo llega al profesor que escribe los datos y nunca a los modelos evaluados, de modo que lo medido es una disposicion en los pesos y no una instruccion seguida. El planteamiento se apoya en Open Character Training (Maiya et al., arXiv 2511.01689), que entrena caracter a partir de aserciones en primera persona centradas en la manera y no en el contenido, y en Persona Vectors (Chen et al., arXiv 2507.21509), que trata rasgos como la sicofancia o la alucinacion como direcciones medibles. El juicio del registro lo realiza Phi-4, deliberadamente de una familia distinta a la del modelo evaluado para evitar sesgo de auto-preferencia.

## Capacidades

- Generacion de texto conversacional con respuestas breves y directas en el dominio de atencion al cliente de aerolinea.
- Supresion del razonamiento visible: 0 de 139 respuestas contienen bloque de razonamiento en el brazo entrenado y en el base.
- Alta tasa de produccion de respuesta: 139/139 respuestas con texto hablado, sin truncamientos (0,0% sin EOS en ambos brazos con tope de 2048 tokens).
- Reduccion de omisiones: 5,0% de omisiones de informacion requerida frente al 15,8% del base, segun identificadores verificados por codigo.
- Robustez ante instrucciones contrarias: en 30 de los 139 prompts se pide al modelo que abandone cualquier personaje, razone paso a paso o se tome el tiempo que necesite; el registro se mantiene en 0,767 frente al 0,067 del base.
- Etiquetado por el autor como entrenamiento de personaje, voz, estilo y datos sinteticos, orientado a registro hablado.
- Soporte de tool calling / function calling: no verificado en la model card del adaptador. El dominio de entrenamiento (base de datos de aerolinea de tau-bench) es de uso de herramientas, pero la ficha no documenta esta capacidad.
- Capacidades multilingues y de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente de aerolineas: el adaptador responde de forma directa sobre politicas de equipaje, cambios y reembolsos, con una mediana de 322 caracteres por respuesta, lo que reduce el tiempo de lectura del usuario y el coste de tokens en produccion frente a un base que ronda los 1.262 caracteres.
- Agentes de reserva con contexto largo: al heredar el modelo base, puede integrarse en flujos multi-turno de gestion de reservas donde la concision evita que el historial de conversacion crezca de forma descontrolada.
- Asistentes de voz: el tag `voice` y la ausencia de bloques de razonamiento visible lo hacen adecuado para respuestas habladas cortas donde una salida de mas de 3.000 caracteres resultaria inutilizable.
- Reduccion de coste de inferencia: sustituir el modelo base por este adaptador en un endpoint existente disminuye el numero de tokens de salida por peticion, con el consiguiente ahorro en facturacion por token, sin cambiar la arquitectura ni el proveedor de serving.
- Investigacion en character training: sirve como caso replicable para estudiar si un registro entrenado en los pesos sobrevive a una instruccion explicita de abandono del personaje, siguiendo la prueba de robustez de Maiya et al.
- Plantilla para adaptadores de registro propios: el flujo (constitucion al profesor, generacion de datos sinteticos, LoRA sobre un 4B, evaluacion con juez de otra familia) es reutilizable para otros dominios, por ejemplo respuestas legales o medicas que deban ser breves.
- Evaluacion de tecnicas de destilacion de estilo: util como linea base para comparar contra prompting de sistema, ya que cuantifica la diferencia entre un estilo instruido y un estilo entrenado en el mismo escenario.

## Benchmarks y rendimiento

La model card no reporta MMLU, HumanEval, GSM8K ni benchmarks estandar. Reporta una evaluacion propia sobre 139 prompts retenidos, con decodificacion greedy, prompts identicos byte a byte entre brazos y un unico proceso de vLLM sirviendo pesos base y adaptador.

| Metrica | Base | Adaptador |
|---|---|---|
| En el registro | 0,036 | 0,935 |
| Omision de informacion requerida | 0,158 | 0,050 |
| Longitud mediana de respuesta | 1.262 caracteres | 322 caracteres |
| Respuestas con texto hablado | 139/139 | 139/139 |
| Respuestas con bloque de razonamiento | 0 | 0 |
| Respuestas que alcanzan el tope de tokens (700) | 14 | 0 |

Delta de registro: +0,899, intervalo de confianza al 95% [+0,849, +0,950] por bootstrap emparejado sobre prompts. 125 prompts mejoran, 0 empeoran y 14 no cambian. Prueba de signos unilateral p = 2,4e-38. Con 139 prompts, la evaluacion resuelve efectos de +0,050 o mayores. Excluyendo los prompts en los que algun brazo alcanza el tope, el resultado sube a +0,928 [+0,880, +0,968] sobre 125 prompts. En la prueba de eliminacion de personaje (30 prompts), el registro se mantiene en 0,767 frente a 0,067 del base. El tope de 2048 tokens no resulta limitante: 0,0% sin EOS en ambos brazos, y la mediana del base en tokens (306, medidos con su propio tokenizer) queda muy por debajo.

Nota de consistencia: el resumen de la model card afirma 92,1% frente a 2,2%, cifras que no coinciden con los valores de la tabla (0,935 y 0,036). La tabla es internamente coherente con el delta reportado (+0,899).

## Requisitos de hardware

- VRAM estimada para el modelo base de 4.000 millones de parametros: aproximadamente 8 GB en bf16/fp16 solo para pesos, mas cache KV; en torno a 10-12 GB en la practica.
- Cuantizado a 8 bits: aproximadamente 4-5 GB. A 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 2,5-3 GB.
- El adaptador anade un coste despreciable: el repositorio completo ocupa 0,1 GB.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan el modelo en bf16 o cuantizado; tarjetas de 8 GB pueden ejecutarlo en 4 bits.
- GPU de datacenter: A100, H100 y L40S sin problema, con margen para lotes grandes.
- Opciones de despliegue: vLLM (es el servidor usado en la evaluacion del autor, sirviendo pesos base y adaptador simultaneamente), transformers con PEFT, llama.cpp y Ollama previa fusion del adaptador y conversion a GGUF, y TGI con soporte de adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Registro en aerolinea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeroproof-airline-concise-4b | 4.000 M (base) + LoRA | no disponible | 0,935 | apache-2.0 | HuggingFace, adaptador PEFT |
| Qwen3-4B-Instruct-2507 (base) | 4.000 M | no disponible | 0,036 | apache-2.0 | HuggingFace, pesos completos |
| Otras alternativas de la clase 3-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa con datos es contra el propio modelo base, que comparte parametros, licencia y familia. La model card no ofrece comparaciones con otros modelos de la misma clase (por ejemplo Llama-3.2-3B-Instruct o Phi-4-mini), y la busqueda web realizada no aporto informacion adicional sobre este modelo. Los resultados de 0,935 y 0,036 corresponden a un juez concreto (Phi-4) y a una rubrica de registro especifica, por lo que no son extrapolables a otras metricas de calidad.

## Limitaciones y advertencias

- Un solo registro y un solo dominio: no hay evidencia de que un segundo registro se entrene con la misma limpieza ni de que este se transfiera fuera del contenido de aerolinea.
- El 7,7% de las respuestas del adaptador siguen fuera de registro y el 5,0% omiten informacion requerida.
- Seleccion sesgada del rasgo: el registro se eligio precisamente porque el base carecia de el. Segun el autor, dos lineas de trabajo se anularon por entrenar rasgos que el base ya poseia parcialmente.
- Discrepancia no explicada entre el resumen de la model card (92,1% frente a 2,2%) y su tabla de resultados (0,935 frente a 0,036). Conviene verificar cual de las dos cifras corresponde a la evaluacion de aerolinea.
- Ausencia de benchmarks estandar: no hay MMLU, HumanEval ni GSM8K, por lo que se desconoce si el ajuste degrada capacidades generales del base.
- El modelo puede estar sobreajustado al estilo entrenado: reducir la longitud de respuesta no equivale a mayor calidad, y la verificacion de omisiones solo cubre los identificadores exigidos por cada pregunta del conjunto de evaluacion.
- Riesgo de alucinacion: no evaluado en la model card; el entrenamiento fue de estilo, no de veracidad.
- Idiomas y cobertura multilingue: no declarados. Es probable que el comportamiento se haya optimizado solo para ingles, pero la ficha no lo confirma.
- Licencia apache-2.0: permite uso comercial del adaptador, pero el uso queda sujeto tambien a la licencia del modelo base Qwen3-4B-Instruct-2507, que es igualmente apache-2.0.
- Traccion practica nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento posterior a septiembre de 2026.
- El adaptador no es un modelo autonomo: requiere descargar y cargar los pesos base, lo que anula cualquier ventaja de tamano del repositorio de 0,1 GB.
- La evaluacion usa un tope de generacion que, segun el propio autor, no es neutral cuando el rasgo medido es la concision. Aunque los controles a 700 y 2048 tokens no movieron el resultado, el parametro debe fijarse con cuidado al replicar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zero-proof-ai/zeroproof-airline-concise-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- SDK de ZeroProof: https://www.zeroproofai.com
- Open Character Training (Maiya et al.): arXiv 2511.01689
- Persona Vectors (Chen et al.): arXiv 2507.21509
- RLHF Book, capitulos 4, 5, 12, 14, 16 y 17 (referenciados en la model card; no se proporciono URL directa)

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con este modelo. Corresponden al termino generico "zero" (articulo enciclopedico sobre el numero cero, fabricante Zero Motorcycles y el software contable Xero) y no aportan informacion tecnica ni enlaces utiles sobre zeroproof-airline-concise-4b.
