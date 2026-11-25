# Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed

## Resumen

Inkling-2-Mini-MTPLX-Optimized-Speed es un paquete de pesos cuantizados y optimizados del modelo Inkling-2-Mini de Thinking Machines Lab, publicado por el usuario Youssofal para su uso con MTPLX, una aplicacion y CLI de inferencia local para Apple Silicon basada en MLX. El modelo base es un transformer de tipo mezcla de expertos (MoE) orientado a codigo, agentes e imagenes, con 26.400 millones de parametros totales y 3.400 millones activos por token, segun la model card. Este paquete concreto contiene 27.530.496.048 parametros en safetensors y ocupa 17,2 GB en el repositorio.

La propuesta de valor del paquete es el rendimiento en Mac: emplea atencion y cabeza de salida en 8 bits, expertos en 4 bits oficiales y embeddings originales, manteniendose mas cerca de los pesos originales que la variante Bare Speed a cambio de 1,2 GB adicionales. Incorpora la torre de vision completa y decodificacion especulativa mediante prediccion multi-token (MTP) con la cabeza de borrador del propio modelo, verificada en una sola pasada del modelo completo.

Es relevante ahora porque demuestra que un modelo MoE de ~26B con vision y contexto de hasta 1M tokens puede ejecutarse en hardware de consumo Apple (M3, M4 y M5 con 32 GB o mas) con velocidades de decodificacion superiores a 120 tok/s en un M5 Max, manteniendo una distribucion de salida practicamente identica a los pesos oficiales (96,5 % de coincidencia en el token top y divergencia KL media de 0,0195).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con torre de vision y cabeza de prediccion multi-token (MTP) para decodificacion especulativa |
| Parametros totales | 27.530.496.048 (pesos del paquete); 26.400 millones en el modelo base |
| Parametros activos | 3.400 millones por token |
| Longitud de contexto | Hasta 1.000.000 tokens (segun la model card del modelo base) |
| Tipos de cuantizacion | Atencion y cabeza de salida en 8 bits, expertos en 4 bits, embeddings originales; NVFP4 mencionado en tags |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mtplx, MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 26.400 millones de parametros totales y 3.400 millones activos por token, lo que permite una relacion computo/parametros favorable para inferencia local. La model card del paquete no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo etapas de RLHF o DPO; esa informacion no esta disponible en los materiales proporcionados. El modelo base pertenece a Thinking Machines Lab y su model card describe capacidades de codigo, agentes e imagenes.

La innovacion tecnica destacable del paquete es la integracion de decodificacion especulativa mediante prediccion multi-token: MTPLX genera varios tokens por adelantado con la cabeza de borrador del propio modelo y los verifica en una sola pasada del modelo completo, preservando la distribucion original. El paquete aplica cuantizacion selectiva (8 bits en atencion y cabeza de salida, 4 bits en expertos) para acercarse a los pesos originales, e incluye la torre de vision completa. Segun las mediciones del autor, la perdida sobre 6.140 tokens de codigo y prosa reales difiere en -0,0007 nats por token respecto a los pesos oficiales (error estandar 0,0031, dentro del ruido).

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo, con pruebas ejecutables superadas (6 de 6 en 3 tareas con 2 semillas cada una a temperatura 1.0, segun el autor).
- Vision: lectura de capturas de pantalla, diagramas y fotografias; el paquete incluye la torre de vision completa. En las pruebas del autor identifico el nombre y ambos recuentos de una captura de un test fallido.
- Tool calling / function calling: en la prueba del autor invoco la herramienta solicitada con la ciudad indicada por el usuario.
- Capacidades de agente y razonamiento multi-paso, orientadas a flujos de codigo y automatizacion.
- Decodificacion especulativa con prediccion multi-token para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local: el modelo puede autocompletar, explicar y depurar codigo en un Mac con 32 GB o mas, con una velocidad de decodificacion de hasta 123,8 tok/s en un M5 Max y pruebas de codigo ejecutables superadas, lo que lo hace viable para sesiones interactivas de programacion.
- Revision de capturas y diagramas: al incluir la torre de vision completa, puede analizar capturas de pantalla de errores, diagramas de arquitectura o fotografias y extraer informacion estructurada, como nombres de tests y recuentos de fallos.
- Agentes locales con tool calling: su soporte de invocacion de funciones permite construir agentes que consulten APIs, ejecuten comandos o consulten datos externos sin salir del equipo, manteniendo la privacidad.
- Procesamiento de documentos largos: con contexto de hasta 1M tokens en el modelo base, es adecuado para resumir o consultar repositorios completos, expedientes o bases de conocimiento extensas en una sola pasada.
- Desarrollo sin conexion en entornos restringidos: al ejecutarse en Apple Silicon con MLX y MTPLX, permite trabajar con un LLM de ~26B sin enviar datos a la nube, util para entornos con requisitos de confidencialidad.
- Evaluacion e investigacion de tecnicas de decodificacion especulativa: el paquete y sus mediciones publicadas (coincidencia del 96,5 % en el token top, KL de 0,0195, perdida dentro del ruido) sirven como referencia reproducible para estudiar el impacto de MTP y la cuantizacion selectiva.
- Prototipado rapido de aplicaciones image-text-to-text: el pipeline declarado es image-text-to-text, por lo que puede integrarse en prototipos que combinen entrada visual y textual en local.

## Benchmarks y rendimiento

Las siguientes mediciones las publica el autor en la model card; se refieren al paquete Optimized Speed ejecutado en MTPLX 2.13 sobre un MacBook Pro M5 Max con 128 GB, con el sampler del modelo (temperatura 1.0, top-p 1.0, top-k desactivado).

| Prueba | Resultado |
|---|---|
| Velocidad de decodificacion, pico registrado (166 tokens) | 123,8 tok/s |
| Primer token en prompt nuevo de 4.142 tokens | 1,73 s, prefill a 2.397 tok/s |
| Coincidencia con el token top de los pesos oficiales (256 posiciones tras prompt de 4.142 tokens) | 247 de 256 (96,5 %), KL media 0,0195 |
| Perdida en 6.140 tokens de codigo y prosa frente a pesos oficiales | -0,0007 nats por token (error estandar 0,0031) |
| Tests de codigo ejecutables (3 tareas, 2 semillas, temperatura 1.0) | 6 de 6 superados |
| Lectura de captura de un test fallido | Identifico el nombre del test y ambos recuentos |
| Turno de tool calling | Invoco la herramienta solicitada con la ciudad indicada |
| Memoria pico sirviendo un prompt de 4.142 tokens | 19,5 GiB |

Comparativa de velocidad de decodificacion entre motores sobre los mismos pesos oficiales (20,2 GB), en tok/s:

| Prueba | MTPLX 2.13.2 | mlx-serve 26.11.4 | oMLX 0.8.3 |
|---|---:|---:|---:|
| Prompt de codigo, 4.142 tokens, primera peticion | 96,2 | 79,0 | 62,9 |
| Prompt de codigo, 4.142 tokens, peticion repetida | 90,5 | 73,9 | 57,6 |
| Prompt corto, 558 tokens | 75,0 | 72,3 | 56,8 |
| Respuesta larga, 1.500 tokens | 78,1 | 70,1 | 53,0 |
| Media de las cuatro pruebas | 85,0 | 73,8 | 57,6 |

Cada motor con su propio paquete rapido (MTPLX Optimized Speed 17,2 GB, mlx-serve 8-bit 18,7 GB, oMLX oQ4e 16,9 GB), en tok/s:

| Prueba | MTPLX 2.13.2 | mlx-serve 26.11.4 | oMLX 0.8.3 |
|---|---:|---:|---:|
| Prompt de codigo, 4.142 tokens, primera peticion | 97,7 | 83,2 | 66,3 |
| Prompt de codigo, 4.142 tokens, peticion repetida | 101,2 | 85,6 | 74,9 |
| Prompt corto, 558 tokens | 95,0 | 90,5 | 69,8 |
| Respuesta larga, 1.500 tokens | 94,6 | 83,5 | 64,7 |
| Media de las cuatro pruebas | 97,1 | 85,7 | 68,9 |

En tiempo al primer token sobre pesos oficiales, MTPLX queda por detras: 1,78 s frente a 1,53 s de mlx-serve y 2,54 s de oMLX en un prompt nuevo de 4.142 tokens; en peticion repetida, 0,81 s frente a 0,19 s y 0,21 s respectivamente.

## Requisitos de hardware

- VRAM/memoria unificada: el paquete ocupa 17,2 GB en disco; la memoria pico medida sirviendo un prompt de 4.142 tokens es de 19,5 GiB.
- Equipos soportados: Macs M3, M4 y M5 con 32 GB o mas (desde MacBook Air hasta Mac Studio). Los Macs M1 y M2 con 32 GB o mas usan la build FP16 de MTPLX.
- Cabe en GPU de consumo: si, en Apple Silicon con memoria unificada de 32 GB o superior; no se proporcionan datos para GPUs NVIDIA o AMD.
- Opciones de despliegue: MTPLX (aplicacion y CLI, con `mtplx serve`); el paquete esta empaquetado para la libreria mtplx sobre MLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: hasta 123,8 tok/s de decodificacion en pico y 2.397 tok/s de prefill en un M5 Max con 128 GB; el autor advierte que sesiones largas en un Mac caliente van mas lentas que el pico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MTPLX-Optimized-Speed (este paquete) | 27,5B totales, 3,4B activos | Hasta 1M (modelo base) | Apache 2.0 | Hugging Face, formato mtplx/MLX | Optimizado para Apple Silicon; vision y MTP incluidos |
| Inkling-2-Mini (pesos oficiales) | 26,4B totales, 3,4B activos | Hasta 1M | Apache 2.0 (segun este paquete) | Hugging Face (thinkingmachines) | Referencia de calidad; 20,2 GB en la comparativa del autor |
| Paquete Bare Speed de MTPLX | No disponible | No disponible | Apache 2.0 | MTPLX | Variante mas agresiva en cuantizacion; 16,0 GB (1,2 GB menos) |
| mlx-serve 8-bit pack | No disponible | No disponible | No disponible | Ecosistema MLX | Alternativa de motor; 18,7 GB |

No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para comparar la calidad frente a modelos de otros fabricantes; las unicas comparaciones publicadas son de velocidad entre motores sobre el mismo modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada; al ser un modelo de proposito general, cabe esperar los sesgos habituales de sus datos de entrenamiento, no detallados.
- Riesgo de alucinacion: no cuantificado en la model card; las pruebas publicadas se centran en velocidad y fidelidad a los pesos oficiales, no en tasas de alucinacion.
- Fidelidad a los pesos originales: aunque la coincidencia en el token top es del 96,5 % y la perdida esta dentro del ruido, no es una reproduccion exacta; en 9 de 256 posiciones el token top difiere del modelo oficial.
- Limitaciones de contexto e idioma: el contexto de 1M tokens corresponde al modelo base y no se verifica en este paquete; los idiomas soportados no estan disponibles.
- Dependencia de plataforma: el paquete esta empaquetado para MTPLX sobre MLX y Apple Silicon; no se indica soporte para CUDA, ROCm ni otros runtimes, lo que limita su uso a Macs.
- Requisito de memoria: 32 GB o mas de memoria unificada; en M1 y M2 se requiere la build FP16, no este paquete.
- Rendimiento variable: el pico de 123,8 tok/s se midio con presion termica nominal y ventiladores al maximo; sesiones largas en un Mac caliente son mas lentas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base en su repositorio oficial antes de desplegarlo en produccion.
- Madurez: el repositorio tiene pocas descargas (1.186) y likes (4), y las mediciones proceden del propio autor del paquete, sin replicacion independiente conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MTPLX: https://mtplx.com
- Pagina del modelo en MTPLX: https://mtplx.com/models/inkling-2-mini/
- Comparativa MTPLX, mlx-serve y oMLX: https://mtplx.com/compare/mlx-serve-vs-omlx-vs-mtplx/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
