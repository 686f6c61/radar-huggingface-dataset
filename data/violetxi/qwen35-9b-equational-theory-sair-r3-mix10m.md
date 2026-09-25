# violetxi/qwen35-9b-equational-theory-sair-r3-mix10m

## Resumen

El modelo `violetxi/qwen35-9b-equational-theory-sair-r3-mix10m` es un ajuste fino completo (full fine-tuning supervisado, SFT) de `Qwen/Qwen3.5-9B` orientado al razonamiento sobre teoria ecuacional, es decir, a determinar si una ecuacion se deduce de un conjunto de axiomas y a justificar la respuesta. Lo publica el usuario violetxi y se distribuye como checkpoint final de la epoca 2 de un entrenamiento sobre una mezcla nominal de 10 millones de tokens. El problema que aborda es la resolucion de problemas de teoria ecuacional con espacio de busqueda abierto, un dominio donde los modelos generalistas suelen fallar por falta de exploracion sistematica y de disciplina en la verificacion.

Tecnicamente se trata de un modelo de 9.653.104.368 parametros en BF16, en el layout nativo `Qwen3_5ForConditionalGeneration`, con pesos safetensors fragmentados e incluyendo configuracion, tokenizer, plantilla de chat y ficheros de procesador. No requiere fusionar adaptadores ni descargar el modelo base por separado. La arquitectura heredada combina atencion completa, atencion lineal y convoluciones (los datos de entrenamiento mencionan el enmascarado por ejemplo en los tres tipos de capa), e incorpora pesos de vision y de prediccion multi-token (MTP) que se heredan sin modificar del modelo base fijado.

Su relevancia es acotada pero clara: es un ejemplo de especializacion agresiva sobre un modelo multimodal pequeno, con evaluacion publica en dos etapas (veredicto binario y validez de la prueba en lenguaje natural) y con el modo de pensamiento activado de forma explicita. No es un modelo generalista de proposito multiple: es una pieza de investigacion para reproducir y estudiar el comportamiento del razonamiento ecuacional con presupuestos de generacion largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion completa + atencion lineal + convoluciones), variante `Qwen3_5ForConditionalGeneration`; incluye torre de vision y pesos MTP heredados del modelo base |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de generacion usada en las evaluaciones publicadas; maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16; no hay GGUF, AWQ, GPTQ ni FP8 en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, fragmentados en varios ficheros) |
| Tamano del repositorio | 19,3 GB |
| Modelo base | Qwen/Qwen3.5-9B (revision fijada `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) |
| Libreria | transformers (verificado con Transformers 5.13.0; evaluaciones con vLLM 0.19.1) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` en una revision fijada y se somete a un ajuste fino completo, no a un entrenamiento con adaptadores: los 427 tensores de lenguaje, incluida la cabeza de salida, se convierten del formato FP32 del entrenamiento a BF16 y se mapean al layout nativo. Las partes de vision y MTP se heredan sin cambios, de modo que el modelo conserva la estructura multimodal del base aunque el ajuste fino se haya hecho solo con texto. El entrenamiento emplea empaquetado sin padding que aisla cada ejemplo en los tres tipos de capa (atencion completa, atencion lineal y convolucion), enmascara las cabeceras de prompt y de asistente y supervisa las respuestas del asistente junto con los marcadores de plantilla y de fin. La plantilla de trayectoria incluye un envoltorio de pensamiento vacio y el pensamiento generado de forma separada queda excluido del calculo de la perdida.

Los datos son una mezcla anidada nominal de 10 millones de tokens: 6.986.669 tokens de notas y 3.000.010 tokens de respuestas de asistente por epoca tras el enmascarado de perdida, aproximadamente un 70 por ciento de notas y un 30 por ciento de trayectorias. Se combinan las notas mas recientes de la fase R3 con trayectorias curadas de un solo turno condicionadas por notas de las fases R0 a R3. El entrenamiento consta de dos epocas sobre ocho GPU GH200, con tasa de aprendizaje 5e-6, schedule coseno, warmup 0.03, entropia cruzada media sobre todos los tokens supervisados y sin termino KL. Se mantienen exclusiones por repeticion y una validacion congelada, y no se aplico ningun filtro de correccion ni rechazo generalizado de respuestas cortadas por limite de longitud.

## Capacidades

- Razonamiento sobre teoria ecuacional: decidir si una ecuacion es consecuencia de un conjunto de axiomas y producir un veredicto binario acompanado de justificacion.
- Generacion de pruebas en lenguaje natural y de contraejemplos para refutar implicaciones falsas.
- Modo de pensamiento (thinking) activable mediante `enable_thinking=True` en la plantilla de chat, con cadenas de razonamiento largas que pueden consumir mas de 16.000 tokens.
- Generacion de texto conversacional de un solo turno, con soporte de plantilla de chat y ficheros de procesador incluidos.
- Interpretacion de enunciados formales al estilo de asistentes de demostracion (las evaluaciones comparan la salida con una entrada Lean).
- Entrada de imagen a nivel arquitectonico: la torre de vision se hereda intacta del modelo base, aunque no hay evidencia de que el ajuste fino la haya especializado ni de que se haya evaluado esta capacidad.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible. El ajuste se hizo con trayectorias de un solo turno, por lo que el comportamiento agentico o multi-paso no esta garantizado.
- Capacidades multilingues: no disponible. No se declaran idiomas y los datos de entrenamiento descritos son notas tecnicas sin indicacion de composicion linguistica.

## Casos de uso

- Investigacion en teoria ecuacional: el modelo sirve como sujeto de estudio para medir hasta que punto un ajuste fino pequeno mejora la resolucion de problemas de deduccion ecuacional frente al modelo base, usando los presupuestos de 16K y 24K tokens documentados.
- Generacion de contraejemplos para refutacion: dado un enunciado del tipo "la asociatividad implica conmutatividad", el modelo puede construir estructuras algebraicas concretas que satisfacen la hipotesis y violan la conclusion, un caso de uso directo para materiales docentes de algebra abstracta.
- Asistencia a la formalizacion en Lean: el modelo produce pruebas en lenguaje natural que despues un humano o un pipeline traduce a Lean; es util como primer paso de borrador, nunca como sustituto de la certificacion formal.
- Generacion de conjuntos de datos de razonamiento: sus cadenas de pensamiento etiquetadas pueden emplearse para crear corpus de trayectorias largas que alimenten posteriores rondas de entrenamiento o destilacion, dado que el propio autor publica un explorador de trayectorias.
- Evaluacion comparativa de metodos de juicio automatico: el modelo y su conjunto de evaluacion de 800 preguntas de etapa 1 y 300 de etapa 2 permiten estudiar la fiabilidad de jueces automaticos (en este caso GPT-5.6-sol en modo `high`) frente a validacion formal.
- Analisis de degradacion por presupuesto de contexto: dado que la precision en etapa 1 pasa del 44,81 por ciento con 16K al 63,66 por ciento con 24K, el modelo es un caso practico para estudiar como el limite de generacion condiciona el exito en tareas de razonamiento de horizonte largo.
- Docencia de algebra con supervision humana: generar ejemplos, explicaciones y contraejemplos para un curso de estructuras algebraicas, con revision obligatoria del profesor por el riesgo de alucinacion en los pasos finales.
- Pruebas de carga de infraestructura de inferencia: un modelo de 9,65B con ventanas de generacion de hasta 24.576 tokens es un banco de pruebas realista para medir el consumo de cache KV y el throughput de vLLM con parser de razonamiento.

## Benchmarks y rendimiento

Los unicos resultados publicados son las evaluaciones SAIR del propio autor, con 800 preguntas de etapa 1 y 300 de etapa 2, cuatro respuestas sembradas por pregunta para cada presupuesto de salida. Las cifras son tasas por respuesta, no pass@4. La etapa 1 usa analisis y comparacion por reglas del veredicto binario; la etapa 2 usa GPT-5.6-sol (`high`) como juez de la prueba o contraejemplo final frente a la entrada Lean, excluyendo el pensamiento oculto y sin soluciones de referencia fiables en el conjunto. Las respuestas vacias o inciertas cuentan como no exitosas, y el juicio del GPT no constituye certificacion Lean.

| Presupuesto de salida (incluye pensamiento) | Precision etapa 1 | Validez juzgada etapa 2 |
|---|---:|---:|
| 16K | 44,81 % | 18,67 % |
| 24K | 63,66 % | 20,42 % |

Configuracion de generacion asociada: modo pensamiento activado, semillas 0 a 3, temperatura 1.0, top-p 0.95, top-k 20, min-p 0, `presence_penalty` 1.5, `frequency_penalty` 0, `repetition_penalty` 1.0, contexto de 32.768 tokens y limites de salida de 16.384 y 24.576 tokens (generaciones independientes para cada presupuesto).

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos de la misma categoria.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 19,3 GB, lo que fija un minimo de memoria de aproximadamente 20 GB solo para los pesos, antes de cache KV y activaciones.
- VRAM estimada para inferencia en BF16: en torno a 24-32 GB con contexto moderado y lotes pequenos; con la ventana completa de 32.768 tokens y generaciones de mas de 16.000 tokens, la cache KV empuja el requisito claramente por encima de 40 GB (estimaciones a partir del recuento de parametros y del contexto declarado, ya que no se publican mediciones).
- GPU recomendadas: una A100 de 40 GB o una H100 de 80 GB para BF16 con contexto largo; tambien resultan adecuadas una L40S de 48 GB o una GH200, la misma clase de GPU usada en el entrenamiento (ocho unidades).
- GPU de consumo: en BF16 no cabe con comodidad en una RTX 4090 o RTX 3090 de 24 GB si se quiere contexto largo; con contexto corto puede ajustarse pero sin margen. Para 16 GB o menos haria falta cuantizar, y no hay versiones cuantizadas publicadas, por lo que habria que generarlas.
- Opciones de despliegue: transformers con soporte de Qwen3.5 (verificado con 5.13.0) y vLLM (evaluado con 0.19.1, arrancando con `--dtype bfloat16 --reasoning-parser qwen3`). No hay evidencia de soporte en llama.cpp, Ollama o TGI, y sin GGUF no es posible usarlos directamente.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-equational-theory-sair-r3-mix10m | 9,65B | 32.768 tokens en la configuracion evaluada | 63,66 % en etapa 1 y 20,42 % en etapa 2 con 24K de salida (evaluacion propia, no certificada) | Apache 2.0 | Pesos BF16 en HuggingFace, sin cuantizaciones |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la informacion proporcionada (el ajuste declara 9,65B sobre el base) | no disponible | no disponible: el autor no publica la linea base en la model card | Apache 2.0 (segun la ficha del ajuste) | Publico en HuggingFace |
| Otros ajustes especializados en razonamiento matematico sobre modelos de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos que permitan una comparacion cuantitativa con alternativas de la misma categoria dentro de la informacion proporcionada; la unica referencia posible es el modelo base, y el autor no publica sus resultados en las mismas evaluaciones.

## Limitaciones y advertencias

- Los propios resultados son bajos en terminos absolutos: 18,67 y 20,42 por ciento de validez juzgada en la etapa 2 significan que entre cuatro y cinco de cada cinco pruebas en lenguaje natural no se consideran validas, y el juicio automatico no equivale a certificacion formal en Lean.
- La evaluacion de la etapa 2 depende de un juez GPT-5.6-sol sin soluciones de referencia fiables, por lo que las cifras deben tratarse como una estimacion, no como una medida objetiva.
- La mejora de la etapa 1 al ampliar el presupuesto de 16K a 24K indica que el rendimiento esta fuertemente limitado por la longitud de generacion: recortar el presupuesto degrada gravemente los resultados.
- Riesgo de alucinacion alto en el paso final de las pruebas: el modelo puede producir argumentos plausibles con pasos invalidos, ya que no se aplico ningun filtro de correccion durante el entrenamiento ni se rechazaron respuestas cortadas por limite de longitud.
- Sesgos conocidos: no disponible. No se documenta analisis de sesgos, y el dominio de entrenamiento (notas tecnicas de teoria ecuacional) puede estrechar el comportamiento fuera de ese ambito.
- Limitaciones de idioma: no disponible, pero el modelo no declara idiomas soportados y los datos descritos son notas tecnicas, por lo que el rendimiento en castellano u otras lenguas no esta garantizado.
- Capacidades de agente y tool calling no verificadas: el entrenamiento usa trayectorias de un solo turno, de modo que el razonamiento multi-paso con herramientas puede haberse degradado respecto al modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre cualquier uso en produccion recae en el desplegador.
- Repositorio con cero descargas y cero likes en la fecha de consulta, sin historial de uso en produccion ni validacion independiente por parte de terceros.
- El conjunto de evaluacion completo es privado y requiere acceso, lo que limita la reproducibilidad externa de las cifras publicadas.
- No hay pesos cuantizados publicados ni soporte confirmado en runtimes distintos de transformers y vLLM, lo que restringe el despliegue en hardware de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-r3-mix10m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/stanford_autonomous_agent/equational-theory-curated-r3-20260923/runs/eqr310m20260923
- Explorador publico de resultados y respuestas: https://huggingface.co/spaces/violetxi/equational-theory-trajectory-atlas
- Conjunto de evaluacion completo (privado, requiere acceso): https://huggingface.co/datasets/violetxi/qwen35-9b-equational-theory-sair-r3-mix10m-eval

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenido sin relacion con la ficha y se han descartado.
