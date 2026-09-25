# tdelab/tde-qwen3.5-4b-v0.1

## Resumen

tde-qwen3.5-4b-v0.1 es un ajuste fino de Qwen/Qwen3.5-4B publicado por tdelab, orientado a un caso de uso muy concreto: tomar decisiones tipadas. El modelo recibe un estado (contexto), una pregunta y un conjunto de opciones, y devuelve una probabilidad nativa sobre cada opcion leida directamente desde los logits de las letras de las opciones en una unica pasada hacia delante. No genera tokens: la respuesta es una distribucion de probabilidad, no texto libre.

El ajuste consiste en una LoRA fusionada (rango 64, alpha 128, aplicada a todas las capas lineales) entrenada durante una epoca sobre 518.000 filas, combinando una mezcla publica de datos de decision, tareas de aplicacion de reglas de LegalBench, un split publico de decisiones tipadas y filas generadas por reglas. El resultado es un modelo de 4.205.751.296 parametros (unos 4,2B) con licencia Apache-2.0 y pesos en safetensors.

Su relevancia practica esta en el coste de inferencia: al no decodificar tokens, la latencia medida es de 15 ms en mediana (p50) y el modelo expone probabilidades calibradas (ECE 0,078 en JevBench), lo que permite usarlo como clasificador o enrutador dentro de pipelines y agentes donde se necesita decidir rapido entre un conjunto acotado de alternativas, con umbrales y abstencion en lugar de generacion abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta de arquitectura `qwen3_5_text`); detalles internos del modelo base no disponibles |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplicable (no se indica que sea MoE) |
| Longitud de contexto | No disponible para el modelo base; el runtime decider-ai admite estados de hasta 32.768 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3.5-4B (commit 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |
| Tamano del repositorio | 8,4 GB |
| Opciones maximas por decision | 255 |
| Temperaturas de calibracion | choice 0,94; noul 0,86; score 1,0 (en `decider_config.json`) |
| Runtime asociado | decider-ai 1.5.0 (servidor Apache-2.0) |

## Arquitectura y entrenamiento

La arquitectura de partida es el modelo Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4B parametros. Sobre el se aplico una LoRA con rango 64 y alpha 128 en todas las capas lineales, que posteriormente se fusiono en los pesos base, de modo que la inferencia no requiere adaptadores separados. El entrenamiento cubrio una epoca sobre 518.000 filas: una submuestra aleatoria de 500.000 filas de la mezcla publica de decisiones generada por Mapika/decider (conjuntos de datos publicos mas preguntas escritas por el profesor y su generador de reglas), 8.000 tareas de aplicacion de reglas de LegalBench, 6.000 filas del split publico de entrenamiento de decisiones tipadas y 4.000 filas de "opciones descritas" generadas por reglas de e13ven-arch/tde.

La innovacion tecnica no esta en el mecanismo de atencion, sino en el formato de salida: el modelo lee la probabilidad de cada opcion a partir de los logits de la letra de la opcion en una unica posicion de respuesta, dentro de una sola pasada hacia delante. Esto elimina por completo la decodificacion autoregresiva (cero tokens generados) y hace que el coste de inferencia sea constante e independiente del numero de opciones en terminos de pasos de decodificacion. El layout es "state-first" y las temperaturas por tipo de pregunta se ajustaron por maxima verosimilitud negativa sobre filas de calibracion propias. No se documenta en la informacion disponible el uso de RLHF, DPO ni la composicion exacta en tokens del dataset.

## Capacidades

- Decision tipada con salida probabilistica: dado un estado, una pregunta y un conjunto de opciones (hasta 255), devuelve una probabilidad sobre cada opcion en una sola pasada, sin generar texto.
- Clasificacion calibrada: las probabilidades permiten fijar umbrales, comparar alternativas y aplicar abstencion; el ECE medido en JevBench es 0,078.
- Aplicacion de reglas: entrenado especificamente con tareas de aplicacion de reglas de LegalBench y con un generador de reglas, por lo que maneja decisiones del tipo "se cumple o no se cumple esta regla".
- Soporte de tipos de pregunta diferenciados: el modelo distingue tipos (`choice`, `noul`, `score`) y aplica una temperatura distinta a cada uno, calibrada de forma independiente.
- Contexto de estado largo en el runtime: el servidor decider-ai admite estados de hasta 32.768 tokens con layout state-first.
- Baja latencia: 15 ms de mediana (p50) en el harness de evaluacion del autor, al no existir decodificacion.
- No documentado: tool calling, function calling, uso como agente multi-paso, vision, audio, modo de razonamiento explicito, capacidades multilingues mas alla del ingles y generacion de texto libre como tarea objetivo.

## Casos de uso

- Enrutado de tickets en atencion al cliente: el modelo recibe el historial del caso (estado) y la pregunta "a que departamento corresponde", con las areas como opciones, y devuelve la probabilidad por area. Es adecuado porque la decision es de una sola pasada y la latencia de 15 ms permite encadenarlo delante de un sistema de gestion de tickets sin penalizar el tiempo de respuesta.
- Clasificacion de cumplimiento normativo: con reglas de negocio o de un dominio regulado como opciones, el modelo estima si un caso concreto satisface cada regla, aprovechando el entrenamiento sobre tareas de aplicacion de reglas de LegalBench. La probabilidad calibrada permite marcar casos dudosos para revision humana.
- Seleccion de la siguiente accion en un agente: dado el estado de la conversacion o del entorno y un catalogo cerrado de acciones o herramientas, el modelo puntua cada opcion y el orquestador elige la de mayor probabilidad. Sustituye a una llamada generativa por una pasada unica, lo que reduce coste y latencia en bucles de decision.
- Moderacion de contenido con politica tipada: las politicas de la plataforma se presentan como opciones y el modelo estima la probabilidad de que una publicacion incumpla cada una. El ECE bajo permite fijar umbrales de automatizacion y derivar a revision los casos cercanos al limite.
- Puntuacion y triaje en pipelines de datos: aplicar el modelo en lote sobre miles de registros para etiquetar, priorizar o enrutar, con la opcion `score` para decisiones ordinales. El coste por elemento es bajo al no haber generacion de tokens.
- Anotacion asistida y control de calidad en investigacion: usar las probabilidades como senal de acuerdo o desacuerdo con anotadores humanos, y detectar items de baja confianza. El Brier de 0,115 sobre el test de decisiones tipadas es una referencia util para comparar con anotadores.
- Filtrado previo en buscadores o sistemas de recomendacion: presentar candidatos como opciones y puntuar la pertinencia de cada uno en una sola pasada, en lugar de generar una respuesta textual.
- Encuestas y formularios automatizados: convertir respuestas abiertas en elecciones sobre categorias predefinidas, manteniendo la distribucion de probabilidad para analisis posteriores en vez de una etiqueta unica.

## Benchmarks y rendimiento

| Conjunto | Resultado |
|---|---|
| JevBench, items publicos (231), harness `2fa63fa`, adaptador `typesafe` | easy 48/48; standard 70/72; hard 66/111; total 184/231 |
| JevBench, latencia | p50 de 15 ms |
| JevBench, calibracion | ECE 0,078 |
| typed-decisions test (2.000 items), T = 1 | accuracy 0,773; Brier 0,115 |

El autor indica que ningun item de JevBench, publico o reservado, se utilizo para el entrenamiento ni para la seleccion del checkpoint. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas, ni comparaciones directas con modelos alternativos en estos conjuntos.

## Requisitos de hardware

- Pesos en safetensors: el repositorio ocupa 8,4 GB, coherente con 4,2B parametros en precision de 16 bits. Se necesitan aproximadamente 9 GB de VRAM para cargar el modelo en fp16/bf16 con margen para el contexto.
- Cuantizacion: no se publican variantes de 8 ni de 4 bits. Si se cuantiza por cuenta propia, las estimaciones serian de unos 5 GB en 8 bits y unos 3 GB en 4 bits, mas overhead de contexto.
- GPU de consumo: cabe sin problemas en tarjetas de 12 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB o RTX 4090. En 8 bits podria entrar en GPUs de 6-8 GB segun la longitud del estado.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para una sola instancia; se justifican para servir muchas peticiones concurrentes o estados largos.
- Opciones de despliegue: la documentada es el servidor decider-ai 1.5.0 con uvicorn, exponiendo `POST /v1/systemone` con formato de cable compatible con TypeSafe. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 15 ms por decision en el harness del autor; el hardware de medida no se especifica. Al no haber decodificacion de tokens, el tiempo por peticion depende del tamano del estado y del numero de opciones, no de la longitud de una respuesta generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tdelab/tde-qwen3.5-4b-v0.1 | 4,2B | Estado hasta 32.768 tokens en el runtime decider-ai | JevBench 184/231; accuracy 0,773 y Brier 0,115 en typed-decisions test | Apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | No disponible | Apache-2.0 | HuggingFace |
| Otros modelos de decision tipada comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de resultados del modelo base ni de alternativas equivalentes de decision tipada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento entre ellos. La comparacion relevante es funcional: frente al modelo base, este ajuste cambia la interfaz de generacion de texto por una salida de probabilidad sobre opciones en una sola pasada.

## Limitaciones y advertencias

- Modelo especializado y de proposito unico: no es un modelo conversacional ni de generacion de texto general; su salida util es una distribucion de probabilidad sobre opciones predefinidas.
- Idioma: solo se declara soporte de ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Dependencia de formato: requiere el layout state-first, un maximo de 255 opciones y un limite de estado de 32.768 tokens en el runtime; fuera de ese formato el comportamiento no esta documentado.
- Riesgo de alucinacion: al no generar texto, el riesgo clasico de inventar hechos se sustituye por el de asignar probabilidad alta a una opcion incorrecta, especialmente en dominios alejados de los datos de entrenamiento y en preguntas con opciones mal formuladas.
- Calibracion limitada al dominio evaluado: el ECE de 0,078 y las temperaturas ajustadas corresponden a las filas de calibracion del autor; en otros dominios o distribuciones de opciones la calibracion puede degradarse.
- Rendimiento desigual por dificultad: en JevBench el modelo resuelve 66 de 111 items dificiles frente a 48 de 48 faciles, lo que indica una caida clara en casos complejos.
- Sin validacion externa: el repositorio tiene 0 descargas y 0 likes, y los resultados publicados proceden de ejecuciones del propio autor; no hay evaluaciones independientes.
- Licencia: Apache-2.0, que permite uso comercial, pero conviene verificar la cadena de licencias de los datos de entrenamiento citados (mezcla de Mapika/decider, LegalBench, split publico de typed-decisions y filas de e13ven-arch/tde) antes de un despliegue en produccion.
- Uso en dominios regulados: aunque se entrene con tareas de aplicacion de reglas, no debe usarse como unico criterio en decisiones legales, medicas o financieras sin revision humana.
- Fechas del repositorio: la model card y los metadatos indican fechas de creacion y actualizacion de septiembre de 2026; conviene comprobar la vigencia y el estado real del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tdelab/tde-qwen3.5-4b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio Mapika/decider (mezcla de datos de decision): https://github.com/Mapika/decider
- Repositorio e13ven-arch/tde (filas de opciones descritas generadas por reglas): https://github.com/e13ven-arch/tde
- Runtime decider-ai (servidor Apache-2.0, paquete `decider-ai==1.5.0`): no se proporciona URL directa en la informacion disponible; se instala mediante pip.
