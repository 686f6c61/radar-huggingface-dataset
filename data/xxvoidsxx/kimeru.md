# xxvoidsxx/kimeru

## Resumen

kimeru (del japones 決める, "decidir") es un modelo de decision planificado por el desarrollador independiente xvoidsx. No es un modelo generativo: recibe un estado (texto, un ticket, un snapshot o cualquier JSON) junto con preguntas tipadas y devuelve probabilidades calibradas en un unico forward pass, sin generar tokens de salida. Su proposito es ocupar la capa de decision dentro de software agentico (enrutado, gating y eleccion entre opciones enumeradas) en lugar de depender de una API externa.

El proyecto se enmarca en la filosofia del permacomputing: el objetivo es un juez local de entre 0,8B y 4B parametros que corra en milisegundos sobre hardware de consumo, incluso en maquinas antiguas, sin coste por llamada y sin enviar datos fuera del equipo. Soporta tres formas de pregunta: *choice* (elegir entre opciones nombradas con una probabilidad por cada una), *noul* (si/no con probabilidad entre 0 y 1) y *score* (posicion ponderada en una escala ordenada).

Es importante subrayar que, en la fecha de la informacion disponible, **no se ha entrenado ningun peso**. La model card lo declara explicitamente: el repositorio existe para fijar el diseno del proyecto y la receta, y los pesos se publicaran cuando existan. Por tanto, cualquier evaluacion practica es hoy imposible; esta ficha documenta el diseno declarado y sus implicaciones tecnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base abierto pequeno con cabeza de prediccion (*pointer head*); no se especifica la familia del transformer base |
| Parametros totales | Rango previsto de 0,8B a 4B (tamano objetivo, no confirmado por pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (formato de despliegue declarado); niveles concretos no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (base, cabeza y pesos) |
| Formato de pesos | GGUF para servicio local; safetensors no confirmado; pesos no publicados |

## Arquitectura y entrenamiento

El diseno declarado consiste en un modelo base abierto de pequeno tamano al que se anade una cabeza de prediccion (*pointer head*) entrenada con LoRA sobre datos etiquetados de la forma estado + pregunta + respuesta. La salida no es texto sino una distribucion de probabilidad sobre las opciones, un valor entre 0 y 1 para preguntas binarias o una posicion ponderada para escalas ordenadas. La temperatura se ajusta una sola vez sobre un split de validacion reservado, con el objetivo de que las probabilidades esten calibradas y no solo sean confiadas.

Los datos de entrenamiento procederan del propio trabajo agentico registrado por xvoidsx, seleccionado a medida que la investigacion acote las primeras aplicaciones. El autor senala que ese corpus es propietario y constituye la ventaja diferencial del proyecto. No se especifican numero de tokens, composicion del dataset, ni si habra etapas de RLHF o DPO; al tratarse de un modelo de decision con salida probabilistica, el ajuste fino supervisado y la calibracion de temperatura son los mecanismos descritos, sin refuerzo declarado.

## Capacidades

- Clasificacion con probabilidades calibradas: devuelve una probabilidad por cada opcion nombrada en una pregunta de tipo *choice*.
- Preguntas binarias (*noul*): respuesta si/no con probabilidad entre 0 y 1, apta para umbrales de confianza.
- Puntuacion en escalas ordenadas (*score*): devuelve una posicion ponderada sobre una escala definida por el usuario.
- Inferencia en un unico forward pass sin generacion de tokens, lo que reduce latencia y coste frente a un LLM generativo.
- Enrutado de modelos: seleccionar que modelo local debe atender una peticion.
- Gating de acciones: decidir si un comando requiere confirmacion del usuario o si la confianza basta para continuar de forma automatica.
- Clasificacion de intencion: distinguir entre informe de bug, peticion de funcionalidad o discusion.
- Relevancia en busqueda: ordenar o seleccionar resultados candidatos.
- Servicio mediante el endpoint `/v1/systemone`, compatible con clientes Jev.
- No soporta generacion de texto, tool calling ni bucles de agente autonomos: es el selector y la puerta junto a un modelo generativo, no el motor del agente.

## Casos de uso

- Enrutado de modelos en un stack local: dado un prompt y una lista de modelos disponibles, kimeru devuelve la probabilidad de que cada uno sea el adecuado; al ejecutarse en milisegundos y sin coste por llamada, permite enrutar cada peticion sin penalizacion de latencia perceptible.
- Confirmacion de comandos en agentes de terminal: antes de ejecutar una accion destructiva, el modelo responde a una pregunta *noul* ("deberia este comando requerir confirmacion del usuario") y el agente actua segun un umbral calibrado, escalando a humano cuando la probabilidad cae en la banda de incertidumbre.
- Clasificacion de tickets y mensajes: etiquetar entradas como bug, peticion de funcionalidad o discusion mediante una pregunta *choice*, con la ventaja de que las probabilidades permiten derivar los casos ambiguos a revision manual.
- Reordenacion de resultados de busqueda: puntuar la relevancia de los N primeros candidatos con preguntas *choice* o *score* y reordenarlos localmente, sin enviar consultas ni documentos a un servicio externo.
- Control de continuidad en pipelines agenticos: decidir si la confianza acumulada de un paso es suficiente para continuar de forma automatica o si conviene detenerse, usando la salida probabilistica como senal de parada.
- Despliegue en hardware antiguo o de gama baja: al apuntar a un rango de 0,8B a 4B y servir por Ollama o llama-server con GGUF, puede ejecutarse en equipos donde un modelo generativo de 27B no cabria, manteniendo la capa de decision en la misma maquina que el agente.
- Evaluacion de politicas antes de produccion: usar el propio banco de pruebas del proyecto (50+ ejemplos propios, opciones con nombres neutros y banda de confianza) como plantilla para validar umbrales antes de confiar en ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se confiara en ningun umbral basado en numeros de proveedor y que el modelo sera evaluado con un conjunto propio de mas de 50 ejemplos antes de fijar umbrales de decision.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no existir pesos. Como referencia de orden de magnitud para el rango objetivo, un modelo de 0,8B en cuantizacion de 4 bits ocuparia del orden de 0,5-1 GB y uno de 4B del orden de 2,5-3 GB, sin contar overhead de contexto; son estimaciones genericas, no medidas del modelo.
- GPU recomendadas: no especificadas. El diseno prioriza CPU y hardware de consumo; el autor menciona explicitamente maquinas antiguas como objetivo.
- GPU de consumo: el rango de 0,8B a 4B es compatible en principio con GPUs de consumo con 6-8 GB de VRAM o mas, e incluso con inferencia en CPU.
- Opciones de despliegue: Ollama con el endpoint `/v1/systemone`, o llama-server con pesos GGUF. No se mencionan vLLM ni TGI.
- Latencia y throughput: el autor afirma latencia de milisegundos y cero tokens de salida, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Desarrollador | Enfoque | Parametros | Estado | Licencia |
|---|---|---|---|---|---|
| kimeru | xvoidsx | Modelo de decision (choice/noul/score), salida probabilistica | 0,8B-4B (objetivo) | Planificado, sin pesos | Apache 2.0 |
| kev | Jared Palmer | Modelo de decision abierto, con ruta `--init_from` para adaptar en pocos cientos de ejemplos | No disponible | Referencia abierta citada | No disponible en la informacion |
| tev1 | Together AI | Modelo de decision con receta de entrenamiento propia | No disponible | Referencia citada | No disponible en la informacion |
| d1 | Liquid AI | Referencia de categoria en modelos de decision | No disponible | Referencia citada | No disponible en la informacion |
| OpenJev | No disponible | Modelo de decision con la misma interfaz | No disponible | Referencia citada | No disponible en la informacion |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada; la comparacion se limita al enfoque y al estado de publicacion.

## Limitaciones y advertencias

- Ausencia total de pesos: el modelo no es usable hoy; la model card lo declara como "planned" y advierte de que no se ha entrenado nada.
- Solo ingles: el unico idioma declarado es `en`, lo que limita su uso en entornos en castellano sin trabajo adicional.
- No genera texto ni llamadas a herramientas: no puede operar un bucle de agente por si solo y requiere un modelo generativo acompanante.
- Ambito estrecho por diseno: se limita a tareas de decision bien definidas (enrutado, gating y eleccion entre opciones); no es un modelo de decision general.
- Riesgo de sobreconfianza: el autor advierte de que los modelos de decision pequenos tienden a mostrarse excesivamente confiados precisamente en las entradas que un humano deberia revisar, de ahi la necesidad de una banda de confianza que escale a revision humana.
- Degradacion fuera de distribucion: el rendimiento cae de forma marcada fuera de los datos de entrenamiento; el ambito estrecho es una decision consciente para mitigarlo.
- Sesgo por redaccion de opciones: el propio autor senala que la formulacion de las opciones influye en las respuestas, por lo que las evaluaciones deben usar nombres neutros.
- Dependencia de datos propietarios: el corpus de entrenamiento no es publico, lo que dificulta la reproducibilidad externa aunque la licencia de los pesos sea Apache 2.0.
- Sin datos de contexto, cuantizaciones concretas ni benchmarks: no es posible dimensionar un despliegue en produccion con la informacion actual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xxvoidsxx/kimeru
- Sitio del autor: https://xvoidsx.org
- Seguimiento del proyecto: Linear, issue XVOIDSX-57 (sin URL publica en la informacion disponible)
- Referencias citadas por el autor: kev (Jared Palmer), tev1 (Together AI), d1 (Liquid AI), OpenJev; sin URLs proporcionadas en la informacion disponible.
