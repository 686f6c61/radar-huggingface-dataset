# turion-ai/turion-jev-9b-GGUF

## Resumen

Turion Jev 9B es un modelo de decisión desarrollado por Turion AI, publicado en formato GGUF para su uso con llama.cpp. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (por ejemplo, el texto de una incidencia) y un conjunto de preguntas tipadas (elección múltiple, sí/no o puntuación de 0 a 5) y devuelve, en un único pase forward, una probabilidad para cada opción. La respuesta se obtiene leyendo los logits de los códigos de opción tras un prompt fijo, que luego se escalan mediante una temperatura específica por tipo de pregunta.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y se distribuye bajo licencia Apache-2.0, la misma que su modelo base `turion-ai/turion-jev-9b`. La ventana de contexto por defecto es de 16.384 tokens y las peticiones que la exceden se rechazan en lugar de truncarse, lo que evita decisiones silenciosamente degradadas.

Su relevancia radica en el enfoque: en lugar de un chat completion que muestrea un token y pierde la distribución de probabilidad, Turion Jev expone directamente las probabilidades calibradas de cada opción, lo que lo hace adecuado para enrutamiento, clasificación y sistemas de decisión automatizados donde se necesita una señal probabilística explícita y no una generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin detalle publicado en la informacion disponible) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 16.384 tokens por defecto (`--n-ctx` configurable; las peticiones mas largas se rechazan, no se truncan) |
| Tipos de cuantizacion | Q4_K_M (5,68 GB) y Q8_0 (9,53 GB); pesos BF16 disponibles para comparacion |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos BF16 en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `turion-ai/turion-jev-9b` (tipo de transformer, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO). Lo que si se documenta es su funcionamiento en inferencia: el modelo es un "decision model" de tipo system-one que, dado un estado y preguntas tipadas, devuelve una probabilidad por opcion en un solo pase forward. La respuesta se lee de los logits de los codigos de opcion despues de un prompt fijo y se escala con una temperatura por tipo de pregunta.

Los artefactos que acompanan a los ficheros GGUF son parte esencial del diseno: `prompt_config.json` (construccion del prompt), `calibration.json` (calibracion de probabilidades), el tokenizer con el que se entreno el modelo y el paquete `turion_jev` en `code/`, que construye el prompt y lee los logits a traves de llama-cpp-python. Sin estos ficheros, una llamada de chat convencional muestrearia un unico token y perderia la distribucion de probabilidad, que es precisamente la salida que el modelo ofrece.

El autor reporta una metrica propia, "Proxy Full", definida como 0,6 x dominios vistos + 0,4 x dominios nuevos sobre conjuntos held-out de 600 preguntas por conjunto, con correccion por azar. Segun el autor, no es el Decision Index oficial.

## Capacidades

- Decision y clasificacion probabilistica: devuelve una probabilidad por cada opcion de una pregunta tipada en un unico pase forward.
- Preguntas de eleccion multiple (`choice`), si/no (`noul`) y puntuacion de 0 a 5.
- Multiples preguntas simultaneas sobre un mismo estado, cada una con sus criterios e instrucciones.
- Enrutamiento y triaje: asignacion de un caso a un equipo o categoria con probabilidad asociada.
- No genera texto: su salida es una distribucion de probabilidad sobre opciones predefinidas.
- Servidor compatible con peticiones `POST /v1/systemone` de tipo TypeSafe.
- Uso desde Python mediante `turion_jev.predictor.Predictor` con backend GGUF.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling, agentes, vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una incidencia, el modelo asigna el equipo responsable (`billing`, `tech`, `sales`, `other`) y responde si requiere atencion el mismo dia, tal como muestra el ejemplo de la model card. Es adecuado porque devuelve probabilidades calibradas por opcion en lugar de una etiqueta unica.
- Enrutamiento en pipelines de atencion al cliente: clasificar cada mensaje entrante hacia el flujo o departamento correcto con una puntuacion de confianza que permita derivar los casos ambiguos a revision humana.
- Priorizacion y scoring: usar preguntas de tipo 0-5 para puntuar urgencia, riesgo o severidad de un caso y ordenar colas de trabajo.
- Moderacion y filtros de decision binaria: preguntas de tipo si/no para decidir si un contenido requiere revision, con probabilidad asociada para fijar umbrales.
- Clasificacion en produccion de bajo coste: con Q4_K_M (5,68 GB) y latencias medianas de 76 ms por peticion en una NVIDIA H200, encaja en servicios de decision con requisitos de latencia estrictos.
- Sistemas de decision automatizados con multiples criterios: plantear varias preguntas tipadas sobre un mismo estado y obtener todas las probabilidades en un solo pase forward, reduciendo el coste frente a multiples llamadas generativas.
- Despliegue local o en el borde: al distribuirse en GGUF y ejecutarse con llama.cpp, puede integrarse en entornos sin infraestructura de GPU de gran escala, segun el hardware disponible.

## Benchmarks y rendimiento

El autor publica una metrica propia ("Proxy Full": 0,6 x dominios vistos + 0,4 x dominios nuevos, 600 preguntas por conjunto, corregida por azar) y la latencia mediana por peticion en una NVIDIA H200. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Q4_K_M | Q8_0 | BF16 (referencia) |
|---|---:|---:|---:|
| Proxy Full | 79,97 | 79,76 | 80,54 |
| Tamano del fichero | 5,68 GB | 9,53 GB | no disponible |
| Tiempo de peticion (mediana, 1 peticion a la vez, H200) | 76 ms | 65 ms | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,7 GB para Q4_K_M y 9,5 GB para Q8_0, segun el tamano de los ficheros GGUF; hay que anadir la memoria del contexto (16.384 tokens por defecto) y la sobrecarga de llama.cpp.
- GPU recomendadas: NVIDIA H200 (mediciones del autor); por tamano, el modelo cabe en GPU de consumo con suficiente VRAM, aunque no se publican mediciones en esas tarjetas.
- GPU de consumo: Q4_K_M (5,68 GB) es compatible con tarjetas de 8 GB o mas de VRAM; Q8_0 (9,53 GB) requiere tarjetas de 12 GB o mas. No se han publicado latencias en GPU de consumo.
- Opciones de despliegue: llama.cpp mediante el servidor incluido (`python -m turion_jev.serve --backend gguf`) y llama-cpp-python a traves del paquete `turion_jev`; el backend GGUF es el documentado.
- Latencia y throughput: mediana de 76 ms (Q4_K_M) y 65 ms (Q8_0) por peticion, una peticion a la vez, en una NVIDIA H200. No se publica throughput agregado.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada. Turion Jev 9B es un modelo de decision que no genera texto y cuya salida son probabilidades por opcion, por lo que no es directamente comparable con modelos generativos de 9B en terminos de benchmarks estandar. Los unicos puntos de comparacion internos son sus propias cuantizaciones:

| Variante | Parametros | Contexto | Proxy Full | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Turion Jev 9B Q4_K_M | ~9B | 16.384 | 79,97 | Apache-2.0 | GGUF |
| Turion Jev 9B Q8_0 | ~9B | 16.384 | 79,76 | Apache-2.0 | GGUF |
| Turion Jev 9B BF16 | ~9B | 16.384 | 80,54 | Apache-2.0 | BF16 |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre; solo responde a preguntas tipadas con opciones predefinidas.
- Dependencia de artefactos auxiliares: requiere `prompt_config.json`, `calibration.json`, el tokenizer y el paquete `turion_jev`; un chat completion convencional pierde las probabilidades y no reproduce el comportamiento previsto.
- Contexto limitado a 16.384 tokens por defecto; las peticiones mas largas se rechazan, no se truncan, lo que puede provocar errores en entradas extensas si no se ajusta `--n-ctx`.
- La metrica "Proxy Full" es propia del autor y no equivale al Decision Index; no hay benchmarks estandar publicados que permitan una validacion independiente.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otros idiomas.
- Sesgos conocidos y riesgo de alucinacion: no disponible en la informacion proporcionada; al tratarse de un modelo de decision, el riesgo principal es una calibracion incorrecta de las probabilidades en dominios no vistos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: escasa validacion por parte de la comunidad.
- No se detallan la arquitectura ni el proceso de entrenamiento del modelo base, lo que dificulta evaluar su robustez en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/turion-ai/turion-jev-9b-GGUF
- Modelo base: https://huggingface.co/turion-ai/turion-jev-9b
- Fichero Q4_K_M: https://huggingface.co/turion-ai/turion-jev-9b-GGUF/blob/main/turion-jev-9b-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/turion-ai/turion-jev-9b-GGUF/blob/main/turion-jev-9b-Q8_0.gguf
- Papers, blogs, repos y demos adicionales: no disponible en la informacion proporcionada.
