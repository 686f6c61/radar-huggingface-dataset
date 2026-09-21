# ZefanCai/Open-Jev-2B

## Resumen

Open-Jev-2B es un adaptador LoRA acompanado de una cabeza de decision escalar, entrenado sobre el modelo base Qwen/Qwen3.5-2B por el autor ZefanCai. No es un modelo generativo: no produce texto autoregresivo, sino que puntua directamente un conjunto de candidatos proporcionado por quien llama y devuelve decisiones tipadas en tres modalidades: *choice* (probabilidades sobre un conjunto de candidatos y el mas probable), *noul* (probabilidad de una respuesta si/no) y *score* (probabilidades sobre niveles ordinales y su valor esperado). El problema que resuelve es el de obtener decisiones estructuradas y calibradas de un modelo de lenguaje pequeno sin pagar el coste de una generacion completa.

Su relevancia actual es doble. Por un lado, es un ejemplo de adaptacion de un backbone de 2B parametros hacia una interfaz de "sistema 1" rapida, pensada para enrutar, clasificar o puntuar antes de invocar razonamiento costoso. Por otro, el repositorio es inusualmente explicito en trazabilidad: incluye hashes SHA-256 de cada artefacto, un manifiesto de datos congelado, la temperatura de calibracion guardada (`1.518796342858676`, ajustada sobre 512 filas) y una evaluacion completa sobre 26.452 registros sin fallos de inferencia.

El checkpoint no es autonomo: requiere la revision exacta del modelo base (`15852e8c16360a2fea060d615a32b45270f8a8fc`), el cargador propio Open-Jev y no funciona con una llamada generica de `AutoPeftModel` para generacion de texto. La entrada maxima es de 4.096 tokens por candidato puntuado de forma independiente, y las entradas mas largas se rechazan en lugar de truncarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8, alpha 16) sobre transformer decoder-only Qwen3.5-2B, mas cabeza escalar de decision entrenada conjuntamente |
| Parametros totales | 2B en el modelo base; el adaptador no publica recuento de parametros propio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens como maximo de entrada por candidato puntuado independientemente; entrada rechazada si se excede |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) mas cabeza escalar separada; la model card incluye SHA-256 del adaptador (`2d23935b1a7380db444abac572c04646918ba794e59002d1588236182a3ca18f`) y de la cabeza (`3532cd576c58d5ad5bf17c3e9f2df4be8c70e08c07fa6bb7fa673dcd7b401f2a`) |

## Arquitectura y entrenamiento

El sistema combina dos componentes sobre el mismo backbone: un adaptador LoRA de rango 8 y alpha 16, y una cabeza escalar inicializada a partir del readout preentrenado Yes-minus-No, que se entrena de forma conjunta con el adaptador. La salida no pasa por el decodificador generativo: el modelo puntua candidatos ya proporcionados por el cliente. Esto implica que la interfaz no es la habitual de un LLM, sino la de un clasificador probabilistico con tipos de decision declarados (*choice*, *noul*, *score*). La model card advierte explicitamente que una llamada estandar de generacion de texto con `AutoPeftModel` no implementa esta interfaz ni aplica la cabeza de decision ni la temperatura guardada.

El entrenamiento consumio 20.204 pasos de optimizador con batch global 4, lo que equivale a 80.816 filas de entrenamiento en una unica pasada completa sobre el split `release-v2` congelado (commit de origen del entrenamiento: `99e881108c6cacadafd364088505e84975ca43fc`; SHA-256 del manifiesto de datos: `56105dc9fc89ef74919f5beb60bb6ae8c6e17bb95699dab59205f67d8b338d97`). El dataset publico redistribuible (`release-v2-redistributable`) contiene 79.116 filas de entrenamiento, tras excluir 1.700 registros originales de `wikispeedia-v1` por permisos de redistribucion no confirmados; por tanto, no es byte a byte identico al conjunto de 80.816 filas usado para estos pesos. La model card indica ademas que la posterior expansion de navegador/dron y cinco corpus de control de extraccion posteriores no forman parte de la mezcla de entrenamiento de este checkpoint.

## Capacidades

- Decision de eleccion (*choice*): devuelve una distribucion de probabilidad sobre un conjunto de candidatos aportado por el cliente, junto con el candidato mas probable.
- Juicio binario (*noul*): devuelve una probabilidad para una pregunta de si/no.
- Puntuacion ordinal (*score*): devuelve probabilidades sobre niveles ordinales suministrados y su valor esperado.
- Puntuacion directa de candidatos sin generacion autoregresiva de respuesta, lo que reduce el coste por decision frente a un modelo generativo.
- Interfaz declarativa de decisiones tipadas: el cliente define las claves y las instrucciones en la peticion y el servidor devuelve las claves declaradas con sus probabilidades.
- Servicio HTTP propio mediante `python -m jev.server`, con endpoint `/v1/systemone`.
- No soporta tool calling ni function calling: la model card no declara esa capacidad y el modelo no ejecuta las acciones propuestas, solo las puntua.
- No es un modelo de agentes ni de razonamiento multi-paso: no genera cadenas de pensamiento ni texto libre.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- No dispone de vision, audio ni modo thinking declarados.

## Casos de uso

- Clasificacion de intencion en atencion al cliente: se declara un tipo `choice` con las intenciones posibles (facturacion, tecnico, otro) y el modelo devuelve la probabilidad de cada una. El propio autor incluye un ejemplo de este tipo en la model card.
- Enrutamiento de tickets y triaje: para cada ticket entrante se puntuan las colas o equipos candidatos y se enruta al de mayor probabilidad, dejando la distribucion completa para umbrales de derivacion a humano.
- Moderacion y verificacion binaria: con el tipo `noul` se responde a preguntas como si un texto cumple una politica concreta, obteniendo una probabilidad que se puede calibrar contra un umbral operativo.
- Encuestas y escalas ordinales: con el tipo `score` se modela una escala tipo Likert (por ejemplo, 1 a 5) y se obtiene tanto la distribucion como el valor esperado, util para analizar respuestas abiertas de forma agregada.
- Evaluacion de respuestas de otros LLM en pipelines de control de calidad: el modelo puede puntuar respuestas candidatas de forma ordinal o elegir entre variantes, actuando como componente de evaluacion dentro de un pipeline mayor (el servidor no ejecuta acciones, solo devuelve decisiones).
- Pre-decision rapida en agentes ("sistema 1"): antes de invocar un modelo grande de razonamiento, este adaptador puede decidir si la consulta es trivial, si requiere herramienta o si necesita escalado, reduciendo llamadas costosas.
- Anotacion asistida de datasets: puntuar automaticamente pares (contexto, etiqueta) para preetiquetar corpus y reservar la revision humana para los casos de baja confianza o de alta entropia en la distribucion devuelta.
- Reranking de candidatos: dado un conjunto cerrado de opciones generadas por otro sistema, obtener la probabilidad relativa de cada una y reordenarlas.

## Benchmarks y rendimiento

La model card publica una evaluacion completa sobre datos retenidos: 10.532 registros de test + 15.920 fuera de distribucion (OOD) = 26.452 registros, sin registros perdidos, duplicados ni fallos de inferencia. La exactitud "hard" excluye las filas con objetivos suaves (soft targets). La exactitud esperada es la masa del objetivo de referencia en el candidato elegido sobre todas las filas, y no equivale a una tasa de victoria en un juego ni de finalizacion de un flujo de trabajo.

| Split | Filas | Hard correctas / filas hard | Exactitud hard | Exactitud esperada | NLL | Brier | ECE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Test | 10.532 | 9.515 / 10.046 | 94,71 % | 91,95 % | 0,195380 | 0,076117 | 0,011606 |
| OOD | 15.920 | 13.287 / 15.446 | 86,02 % | 84,62 % | 0,802990 | 0,246450 | 0,105594 |

Advertencias sobre estos numeros, segun la propia model card: no se evaluo ninguna linea base sobre los datos completos, por lo que la tabla no establece la ganancia atribuible al entrenamiento. Ademas, el paquete original conserva metricas muestreadas separadas de 512 registros de test y 512 OOD en `package/metrics.json`, que no deben confundirse con la tabla de datos completos. No se han publicado resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K en la informacion disponible, y no procede comparar estas metricas de decision calibrada con las de un modelo generativo.

## Requisitos de hardware

- La model card recomienda usar una GPU adecuada con los pesos del modelo base disponibles en local o descargables desde Hugging Face.
- Estimacion orientativa para el modelo base de 2B parametros en bf16/fp16: en torno a 5 GB de pesos, con overhead adicional de activaciones y del runtime; con batch 1 y entradas de hasta 4.096 tokens, un presupuesto practico de 6-8 GB de VRAM es razonable (estimacion propia, no confirmada por el autor).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4070 y superiores, RTX 4090. No hay datos publicados sobre GPUs de gama inferior.
- GPUs de datacenter compatibles por presupuesto de memoria: A100 y H100 (holgadas para este tamano); no se publican cifras especificas de rendimiento en ninguna de ellas.
- Despliegue soportado: el servidor propio del proyecto, `python -m jev.server --checkpoint ./checkpoints/open-jev-2b/package/checkpoint --device cuda:0 --max-length 4096 --batch-size 1 --no-prefix-cache --host 127.0.0.1 --port 8791`. El endpoint es `/v1/systemone`.
- Dependencias declaradas por el extra `train`: Transformers 5.10.2 y PEFT 0.19.1.
- La cache de prefijos es opcional (opt-in) y aparece desactivada en el ejemplo de arranque; la validacion A/B en GPU con el checkpoint real queda como tarea separada segun la model card.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI: la interfaz no generativa del adaptador no encaja con esos servidores y una llamada estandar de generacion con `AutoPeftModel` no reproduce el comportamiento.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).
- Para despliegues reproducibles, la model card recomienda anadir `--revision <commit>` al comando `hf download` usando un commit del historial de este repositorio.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento frente a otros adaptadores o clasificadores en la informacion disponible. La model card senala expresamente que no se evaluo ninguna linea base sobre los datos completos. La comparacion siguiente es estructural, no de rendimiento.

| Modelo | Tipo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Open-Jev-2B | Adaptador LoRA + cabeza escalar sobre Qwen3.5-2B | 2B (modelo base); adaptador sin recuento publicado | 4.096 tokens por candidato | Decisiones tipadas probabilisticas (*choice*, *noul*, *score*) | apache-2.0 | Hugging Face; requiere cargador Open-Jev y revision exacta del base |
| Qwen/Qwen3.5-2B | Transformer generativo (modelo base) | 2B (nominal, segun el identificador) | no disponible | Texto autoregresivo | no disponible | Hugging Face |
| Otros adaptadores de decision o clasificadores de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia estricta del modelo base en la revision `15852e8c16360a2fea060d615a32b45270f8a8fc` y del cargador Open-Jev; no es un checkpoint autonomo ni se puede fusionar sin mas en un pipeline estandar.
- Una llamada generica de `AutoPeftModel` para generacion de texto no implementa la interfaz, no aplica la cabeza de decision ni la temperatura guardada; los resultados serian incorrectos.
- Limite duro de 4.096 tokens por candidato puntuado de forma independiente; la entrada se rechaza en lugar de truncarse, lo que puede romper flujos que asuman truncado silencioso.
- No genera texto libre ni ejecuta acciones: el servidor devuelve probabilidades sobre claves declaradas, y la model card aclara que no ejecuta las acciones propuestas.
- Calibracion claramente peor fuera de distribucion: ECE de 0,105594 en OOD frente a 0,011606 en test, y NLL de 0,802990 frente a 0,195380. Los umbrales de decision calibrados en test pueden no transferirse a datos OOD.
- La exactitud hard excluye las filas con objetivos suaves, de modo que la cifra de 94,71 % en test no cubre todas las filas del split.
- La exactitud esperada no es una tasa de victoria ni de finalizacion de tareas, segun advierte el autor.
- No se evaluo linea base sobre datos completos: no hay evidencia publicada de la ganancia obtenida por el entrenamiento.
- Desajuste entre el dataset publico redistribuible (79.116 filas) y el conjunto realmente usado en el entrenamiento (80.816 filas); faltan 1.700 registros de `wikispeedia-v1` por permisos de redistribucion no confirmados.
- La mezcla de entrenamiento de este checkpoint no incluye la posterior expansion de navegador/dron ni los cinco corpus de control de extraccion posteriores; los videos de juego publicos pueden usar checkpoints piloto antiguos y no son evidencia valida para estos pesos.
- Riesgo de sesgo y de alucinacion: no disponible de forma especifica en la informacion proporcionada (el modelo no genera texto, pero las decisiones pueden estar sesgadas por la distribucion del corpus de entrenamiento, no documentada en detalle).
- Idiomas soportados: no disponibles; el corpus publico incluye registros de tipo Wiki, pero no se declara cobertura linguistica.
- Licencia del adaptador: apache-2.0. La licencia del modelo base Qwen/Qwen3.5-2B no se especifica en la informacion disponible y debe verificarse por separado antes de un uso comercial.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes) y repositorio con tamano reportado de 0,0 GB: el artefacto no ha sido validado por la comunidad.
- No se documentan tipos de cuantizacion soportados, lo que limita las opciones de reduccion de memoria en produccion.
- El hash SHA-256 del manifiesto del paquete original aparece truncado en la informacion disponible (`58319da5c2a948a464...`), por lo que la verificacion completa debe hacerse contra `release-manifest.json` en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZefanCai/Open-Jev-2B
- Dataset publico: https://huggingface.co/datasets/ZefanCai/Open-Jev (split `release-v2-redistributable`)
- Repositorio del cargador Open-Jev: https://github.com/Zefan-Cai/Open-Jev
- Manifiesto de la release (ruta dentro del repositorio del modelo): `release-manifest.json`
- Resultados completos de evaluacion (ruta dentro del repositorio del modelo): `evaluation/full-data.json`
- Metricas muestreadas del entrenamiento (ruta dentro del repositorio del modelo): `package/metrics.json`
- Procedencia y hashes de splits (ruta dentro del repositorio del modelo): `package/provenance.json`
- Model card original del paquete (ruta dentro del repositorio del modelo): `package/README.md`
- Resultados de busqueda web: las consultas realizadas devolvieron unicamente paginas de productos y servicios de Microsoft, sin relacion con este modelo. No se han identificado papers, blogs, repositorios adicionales ni demos relevantes en la busqueda.
