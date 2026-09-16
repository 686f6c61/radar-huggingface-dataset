# WootzappLab/phone-number-kernel12-GRPO20

## Resumen

`WootzappLab/phone-number-kernel12-GRPO20` es un adaptador LoRA (libreria `peft`) entrenado con GRPO sobre el modelo base `zai-org/GLM-4.7-Flash`. No es un modelo completo: se distribuye como pesos de adaptador que deben cargarse sobre el modelo base en su revision `7dd20894a642a0aa287e9827cb1a1f7f91386b67`. El entrenamiento parte de un preajuste tibio (*warm start*) sobre el adaptador "D&D Character GRPO20 iter-19" y ejecuta 20 actualizaciones de GRPO bajo el identificador de ejecucion `phone-number-kernel12-grpo20-spot-20260822-102653`, con el objetivo declarado de generar codigo (etiquetas `code` y `cpp`) en torno a *kernels* de numeros de telefono.

El adaptador se publica con rango LoRA 16 y alpha 32, y su datos de entrenamiento son un unico fichero `Phone_Number_train.jsonl` con 8 filas. El checkpoint seleccionado y evaluado es `iter_0000014`, aunque el repositorio incluye tambien `iter_0000004`, `iter_0000009` e `iter_0000019`, cada uno con su SHA-256 de adaptador. El tamano total del repositorio es de 1,9 GB, correspondiente a los cuatro checkpoints.

Su relevancia es fundamentalmente metodologica: documenta un ciclo completo de RL (GRPO) sobre una tarea muy estrecha, con recibos de reproducibilidad, hashes de datos y checkpoints, y una evaluacion de regresion sobre un contrato fijo (`fixed26-contract-v2`). El propio autor advierte de que se trata de un "resultado de regresion asistido, no una afirmacion de benchmark en held-out pristino", por lo que debe interpretarse como evidencia interna de un experimento, no como una mejora verificada de capacidad general. No hay pipeline, licencia ni idiomas declarados, y el modelo acumula 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Adaptador LoRA (PEFT) sobre el modelo base `zai-org/GLM-4.7-Flash`; la arquitectura del modelo base no se documenta en la informacion proporcionada |
| Parametros totales | No disponible (el repositorio contiene pesos de adaptador, no un modelo completo) |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible para el adaptador. La evaluacion se ejecuto con un limite de respuesta de 32.768 tokens y modo *thinking* activado |
| Tipos de cuantizacion | No disponible (depende de las opciones soportadas por el modelo base y por el runtime de PEFT) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | Adaptador LoRA en formato PEFT (libreria `peft`); el formato concreto de fichero no se detalla en la informacion proporcionada |
| Modelo base | `zai-org/GLM-4.7-Flash`, revision `7dd20894a642a0aa287e9827cb1a1f7f91386b67` |
| Rango / alpha LoRA | 16 / 32 |
| Metodo de entrenamiento | GRPO, 20 actualizaciones, con *warm start* desde el adaptador "D&D Character GRPO20 iter-19" |
| Checkpoint evaluado | `iter_0000014` (SHA-256 `62fa190ad26e30fc1b5dd9543936ef549a49dd8cfa8220e4af726a1d499e575a`) |
| Datos de entrenamiento | `Phone_Number_train.jsonl`, 8 filas (SHA-256 `9c5e1349ae6c2375b069a82107ae85404a80f4254b4478b0c79a80434e9612a6`) |
| Tamano del repositorio | 1,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de bajo rango (r=16, alpha=32) que se aplica sobre `zai-org/GLM-4.7-Flash`. La informacion disponible no detalla la arquitectura interna del modelo base (atencion, numero de capas, dimension oculta, si emplea mezcla de expertos o attention lineal), por lo que cualquier afirmacion al respecto seria especulativa. Lo que si se documenta es el procedimiento de ajuste: optimizacion con GRPO durante 20 actualizaciones, partiendo de un adaptador previo entrenado con el mismo algoritmo sobre una tarea distinta (personajes de D&D). Es decir, hay transferencia secuencial de adaptadores dentro de la misma familia de experimentos, no un entrenamiento desde el modelo base limpio.

La innovacion tecnica destacable no esta en la arquitectura sino en el protocolo experimental: el autor publica hashes SHA-256 del adaptador y del dataset, un manifiesto del checkpoint seleccionado, cuatro recibos agregados de evaluacion, ocho recibos de *shard* y el codigo de estadistica en un paquete de release en GitHub. La evaluacion usa el contrato `fixed26-contract-v2` con *thinking* habilitado, temperatura 0,7, top-p 1,0 y limite de 32.768 tokens de respuesta, y contempla un escenario multiturno con realimentacion (turno 2) para medir la recuperacion condicional tras un fallo inicial. El dataset de entrenamiento, de solo 8 filas, es el principal condicionante del resultado: con ese volumen, el adaptador esta inevitablemente orientado a memorizar y reproducir un formato de kernel concreto en lugar de aprender una capacidad general de generacion de codigo.

## Capacidades

- Generacion de codigo en C++ orientada a *kernels* de tratamiento de numeros de telefono (etiquetas declaradas `code` y `cpp`).
- Razonamiento con modo *thinking*: la evaluacion se realizo con el modo de pensamiento activado del modelo base.
- Generacion multiturno con realimentacion: el protocolo mide explicitamente la recuperacion en un segundo turno tras una respuesta incorrecta.
- Seguimiento de contratos de evaluacion fijos (`fixed26-contract-v2`), es decir, adherencia a un formato de salida predefinido.
- Capacidades heredadas del modelo base `zai-org/GLM-4.7-Flash`: no estan documentadas en la informacion proporcionada y no pueden atribuirse con seguridad al adaptador.
- *Tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible. El unico comportamiento agentico observado es el bucle de dos turnos de la evaluacion.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Generacion de kernels de normalizacion de numeros de telefono: el adaptador puede producir funciones en C++ que parseen y normalicen numeros a un formato canonico (por ejemplo E.164) dentro de una libreria de validacion, apoyandose en el modo *thinking* del modelo base para razonar los casos limite.
- Reparacion iterativa de codigo en un bucle de dos turnos: el protocolo de evaluacion con realimentacion (turno 2) refleja un flujo realista de CI donde el compilador o los tests devuelven un error y el modelo reescribe el kernel; su tasa de recuperacion condicional medida es del 27,1% (16/59), un dato que conviene tener en cuenta antes de integrarlo en un pipeline sin supervision.
- Generacion de tests unitarios y casos frontera: a partir del contrato de entrada/salida de un kernel de numeros de telefono, el modelo puede generar tablas de casos (prefijos internacionales, ceros iniciales, extensiones) que alimenten el conjunto de pruebas.
- Investigacion en RL para codigo: sirve como referencia reproducible de un ciclo GRPO corto (20 actualizaciones) sobre un dataset minimo, util para estudiar sobreajuste, *reward hacking* y transferencia entre adaptadores.
- Prototipado en un asistente de codigo interno: cargando el adaptador sobre el modelo base en un servidor PEFT, un equipo de telefonia puede obtener sugerencias de implementacion para rutinas de parseo sin salir de su infraestructura.
- Traduccion de especificaciones a C++ en pipelines ETL: convertir reglas de negocio escritas en lenguaje natural sobre validacion de numeros en funciones C++ que luego se compilan en un servicio de limpieza de datos.
- Benchmarking interno de adaptadores: el paquete de release con recibos y hashes permite comparar este adaptador con el predecesor de D&D usando el mismo contrato, como linea base en un estudio de ablacion de hiperparametros de GRPO.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la regresion `fixed26-contract-v2` sobre el checkpoint `iter_0000014`, con modo *thinking* activado, temperatura 0,7, top-p 1,0 y limite de 32.768 tokens de respuesta. El autor califica explicitamente el resultado como "regresion asistida", no como benchmark en *held-out* pristino.

| Metrica | Puntuaciones por intento | Media |
|---|---:|---:|
| Pass@1 | 11, 12, 11, 11 | 11,25 / 26 (43,3%) |
| Multiturno con realimentacion (turno 2) | 15, 15, 15, 16 | 15,25 / 26 (58,7%) |

Recuperacion condicional en el turno 2: 16/59 (27,1%).

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares bajo las mismas condiciones.

## Requisitos de hardware

- El repositorio ocupa 1,9 GB, pero corresponde a cuatro checkpoints de adaptador LoRA; el coste real de inferencia lo determina el modelo base `zai-org/GLM-4.7-Flash`, cuyas especificaciones de parametros no estan disponibles en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible con precision. Cargar un adaptador LoRA con PEFT requiere cargar el modelo base completo en memoria (tipicamente en bf16/fp16) y aplicar despues el adaptador; sin conocer el tamano del modelo base no puede darse una cifra fiable.
- GPU recomendadas: no disponible. Depende del modelo base y del *batch* utilizado.
- Encaje en GPU de consumo: no disponible por la misma razon. Si el modelo base resulta ser una variante compacta tipo "Flash", es plausible que quepa en GPU de consumo con cuantizacion, pero esto no esta confirmado por la informacion disponible.
- Opciones de despliegue: PEFT sobre Transformers es el camino documentado implicitamente por la libreria declarada. El uso de vLLM (con soporte LoRA), llama.cpp, Ollama o TGI no esta documentado para este adaptador.
- Al menos un runtime debe respetar el limite de 32.768 tokens de respuesta si se quiere reproducir la evaluacion.
- Latencia y throughput: no disponible. No se publican tiempos de generacion, *throughput* en tokens por segundo ni configuracion de *batch*.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparable para modelos de la misma categoria en la informacion proporcionada. La unica referencia interna es la cadena de adaptadores del mismo autor y el modelo base.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `phone-number-kernel12-GRPO20` | Adaptador LoRA (r=16, alpha=32) sobre GLM-4.7-Flash | No disponible | No disponible (evaluado con 32.768 tokens de respuesta) | Pass@1 11,25/26 en Fixed26 (regresion asistida) | No disponible | 0 descargas, repositorio publico |
| "D&D Character GRPO20 iter-19" (predecesor) | Adaptador LoRA del mismo linaje, usado como *warm start* | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible |
| `zai-org/GLM-4.7-Flash` (modelo base) | Modelo completo | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | Publico en HuggingFace |

## Limitaciones y advertencias

- Dataset de entrenamiento de 8 filas: el riesgo de sobreajuste severo es alto y la capacidad de generalizacion a otros dominios de codigo es, como minimo, dudosa.
- La evaluacion es una "regresion asistida" segun el propio autor, no un *held-out* pristino; las cifras de Pass@1 (11,25/26) y turno 2 (15,25/26) no deben presentarse como rendimiento de benchmark independiente.
- Pass@1 del 43,3% implica que mas de la mitad de los intentos no resuelven la tarea incluso en su dominio estrecho.
- Recuperacion condicional en el turno 2 del 27,1% (16/59): la realimentacion correctiva funciona en menos de un tercio de los fallos, lo que limita su uso en bucles automaticos sin supervision humana.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni obras derivadas. Conviene contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real del adaptador y del modelo base.
- Riesgo de alucinacion: al ser un adaptador de codigo entrenado sobre muy pocos ejemplos, puede generar APIs, cabeceras o funciones inexistentes con apariencia plausible; todo el codigo debe pasar compilacion y tests.
- Dependencia estricta del modelo base y de su revision (`7dd20894a642a0aa287e9827cb1a1f7f91386b67`): cargarlo sobre otra revision puede degradar o invalidar el comportamiento.
- Sin senales de adopcion (0 descargas, 0 *likes*) ni validacion por terceros.
- El autor advierte que el resultado es asistido; en un contexto de publicacion o evaluacion conviene reproducir el contrato `fixed26-contract-v2` de forma independiente.
- No se documentan sesgos ni evaluaciones de seguridad, toxicidad o sesgo de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WootzappLab/phone-number-kernel12-GRPO20
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Paquete de reproduccion y evidencias (configuraciones de lanzamiento, recibos de entrenamiento, manifiesto del checkpoint seleccionado, recibos de evaluacion, recibos de *shard* y codigo de estadistica): https://github.com/tokenbender/browser-is-all-you-need-upstream/tree/client/26-aug-release/results/phone-number-kernel12-GRPO20
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a paginas de Microsoft 365 y Word y no guardan relacion con el artefacto, por lo que se omiten.
