# Xylolabs/clairic-flash-GGUF

## Resumen

Clairic Flash GGUF es la distribucion en formato GGUF del modelo Cloudflare/clairic-flash, un fine-tune de Qwen/Qwen3.5-9B orientado a extraccion estructurada de informacion con entrada de imagen y texto. La publica Xylolabs, que ha convertido los pesos originales a llama.cpp e incorporado el codificador visual para permitir entrada de imagenes, manteniendo el pipeline image-text-to-text del modelo base. El checkpoint cuenta con 8.953.803.264 parametros totales (aproximadamente 9B) y licencia Apache-2.0.

El modelo resuelve el problema de obtener salidas JSON conformes a un esquema a partir de documentos e imagenes, un caso de uso habitual en pipelines de extraccion de datos donde el modelo base de Cloudflare anade una cabeza de extraccion tipada sobre el transformer de Qwen3.5. La contribucion de Xylolabs es puramente de despliegue: nueve cuantizaciones (de Q8_0 a Q2_K) mas un proyector multimodal BF16 y una matriz de importancia para las cuantizaciones IQ, con metricas de fidelidad frente a la inferencia en f32 publicadas por el autor.

Su relevancia practica esta en que permite ejecutar un modelo multimodal de 9B con contexto declarado de hasta 256K tokens en hardware de consumo, con un Q4_K_M de 5,69 GB que conserva un 94,72 % de acuerdo top-1 con la referencia f32. Es una opcion a considerar cuando se necesita extraccion estructurada local con imagenes y no se quiere depender de una API externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen/Qwen3.5-9B) con codificador visual y cabeza de extraccion tipada; bloque de prediccion multi-token presente en el checkpoint pero no incluido en los GGUF |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens segun la tabla de hardware del autor; 32.768 en el ejemplo de ejecucion con llama-server |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q2_K; proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clairic-flash es un fine-tune de Qwen/Qwen3.5-9B para extraccion estructurada. La arquitectura subyacente es un transformer denso de unos 9B parametros, al que Cloudflare anade una cabeza de extraccion tipada que no forma parte de los ficheros GGUF publicados por Xylolabs. El checkpoint original incluye ademas un bloque de prediccion multi-token que tampoco se ha convertido, de modo que la distribucion GGUF conserva el transformer y el codificador visual, pero no esos dos componentes auxiliares.

Xylolabs no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al modelo base y no aparece en la informacion disponible. La innovacion tecnica de esta distribucion es la conversion a llama.cpp con soporte de imagen mediante el fichero `mmproj-clairic-flash-BF16.gguf` (0,92 GB) y el uso de una matriz de importancia (`clairic-flash.imatrix.gguf`, 8,8 MB) para las cuantizaciones IQ. Las conversiones se verificaron con el build e4b620af1 de llama.cpp, y el autor publica divergencia KL media y acuerdo top-1 frente a inferencia f32 sobre pesos BF16 en texto mixto.

## Capacidades

- Generacion de texto y razonamiento sobre el transformer de Qwen3.5-9B.
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto mediante el proyector BF16 incluido.
- Extraccion estructurada de informacion: el modelo base incorpora una cabeza de extraccion tipada (no incluida en los GGUF) y el autor documenta el uso de esquemas JSON.
- Salida JSON conforme a esquema mediante `response_format` con `json_schema` en llama-server o `--json-schema` en llama-cli.
- Modo thinking configurable: el ejemplo de ejecucion desactiva el razonamiento con `--chat-template-kwargs '{"enable_thinking":false}'`, lo que implica que el template soporta activarlo.
- Conversacion multi-turno con plantilla de chat Jinja (`--jinja`).
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no publica la lista de idiomas.

## Casos de uso

- Extraccion de campos desde facturas y albaranes escaneados: se envia la imagen junto con un esquema JSON de campos (importe, fecha, emisor, lineas de detalle) y el modelo devuelve el objeto estructurado. El codificador visual y la ventana de 256K permiten procesar documentos densos sin trocear.
- Procesamiento de formularios y documentos administrativos en local: con el Q4_K_M (5,69 GB) el modelo cabe en una RTX 4090 o RTX 3090 de 24 GB, lo que permite desplegar el pipeline completo en una estacion de trabajo sin enviar datos a terceros.
- Digitalizacion de tablas en imagenes a JSON: el modelo puede recibir una captura de tabla y un esquema de filas y columnas, y devolver la estructura serializada, util para migraciones de datos historicos.
- Enriquecimiento de tickets de soporte con imagenes adjuntas: a partir de una captura de pantalla y el texto del usuario, se extraen categoria, producto y sintoma en un objeto JSON que alimenta el sistema de ticketing.
- Clasificacion y normalizacion de documentos en lote: el Q8_0 (9,53 GB) con 256K de contexto permite procesar lotes largos con la maxima fidelidad (97,95 % de acuerdo top-1), adecuado cuando el coste de un error de extraccion es alto.
- Despliegue en hardware unificado tipo Mac Studio o DGX Spark: la tabla del autor indica que el Q8_0 con contexto de 256K se ejecuta en equipos con memoria unificada de 128 GB o superior, lo que habilita prototipado de extraccion estructurada sin GPU dedicada.
- Integracion en pipelines de CI/CD para validacion de esquemas: al soportar `json_schema`, la salida se puede validar de forma determinista contra el contrato y rechazar respuestas no conformes antes de persistirlas.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K). Si publica metricas de fidelidad de las cuantizaciones frente a la inferencia en f32 sobre pesos BF16, medidas en texto mixto:

| Cuantizacion | Tamano | KL media (texto mixto) | Acuerdo top-1 |
|---|---:|---:|---:|
| Q8_0 | 9,53 GB | 0,0072 | 97,95 % |
| Q6_K | 7,37 GB | 0,0132 | 96,94 % |
| Q5_K_M | 6,50 GB | 0,0203 | 95,98 % |
| Q4_K_M | 5,69 GB | 0,0293 | 94,72 % |
| Q4_K_S | 5,37 GB | 0,0507 | 93,13 % |
| IQ4_XS | 5,27 GB | 0,0562 | 92,61 % |
| Q3_K_M | 4,69 GB | 0,1636 | 87,62 % |
| IQ3_M | 4,48 GB | 0,1510 | 87,25 % |
| Q2_K | 3,93 GB | 0,1670 | 86,37 % |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 9,53 GB para Q8_0, 5,69 GB para Q4_K_M y 3,93 GB para Q2_K, mas 0,92 GB del proyector multimodal BF16.
- GPU recomendadas por el autor: RTX 4090 o RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o dos GPU de 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB).
- Cabe en GPU de consumo: si. El Q8_0 entra en 24 GB y el Q4_K_M en tarjetas de 6-8 GB con contexto reducido, aunque el autor solo documenta explicitamente el escenario de 24 GB o mas.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB) con Q8_0 y contexto de 256K.
- Opciones de despliegue: llama.cpp, tanto `llama-server` como `llama-cli`; el autor indica compatibilidad con endpoints y el tag `endpoints_compatible`. No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Comando de referencia: `llama-server -m clairic-flash-Q4_K_M.gguf --mmproj mmproj-clairic-flash-BF16.gguf --jinja -ngl 99 -c 32768 --chat-template-kwargs '{"enable_thinking":false}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Clairic Flash GGUF (Xylolabs) | 8,95B | 256K (segun autor) | Si (image-text-to-text) | Apache-2.0 | GGUF |
| Cloudflare/clairic-flash | no disponible | no disponible | Si | Apache-2.0 | safetensors |
| Qwen/Qwen3.5-9B | aproximadamente 9B | no disponible | no disponible | no disponible | safetensors |

La comparativa con alternativas de la misma categoria (modelos de extraccion estructurada multimodal de tamano similar) no esta disponible en la informacion proporcionada. El unico contraste documentado es con el modelo base y con Qwen3.5-9B, del que deriva.

## Limitaciones y advertencias

- La cabeza de extraccion tipada de Cloudflare y el bloque de prediccion multi-token no estan incluidos en los GGUF; el comportamiento de extraccion depende del transformer y del esquema JSON que se pase en la peticion, no del componente especializado del modelo original.
- No se publican benchmarks de tareas, por lo que el rendimiento real en extraccion estructurada no esta cuantificado en la informacion disponible.
- Las metricas de KL y top-1 se midieron solo en texto mixto; no hay datos equivalentes para entradas de imagen.
- El contexto de 256K aparece en la tabla de hardware del autor, pero el ejemplo de ejecucion usa 32.768 tokens; el contexto efectivo dependera de la memoria disponible.
- No se documenta la lista de idiomas soportados ni el comportamiento multilingue.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un fine-tune de Qwen3.5-9B hereda los del modelo base, no descritos en la informacion disponible.
- El uso comercial esta permitido por la licencia Apache-2.0, que exige conservar el aviso de licencia y el archivo LICENSE.
- La verificacion se hizo con un build concreto de llama.cpp (e4b620af1); versiones anteriores pueden no cargar el proyector multimodal o el template de chat.
- El repositorio ocupa 53,8 GB y contiene nueve cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/clairic-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic-flash
- Modelo del que deriva el base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/Xylolabs/clairic-flash-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Referencia secundaria: https://localllmwiki.com/category/models/
