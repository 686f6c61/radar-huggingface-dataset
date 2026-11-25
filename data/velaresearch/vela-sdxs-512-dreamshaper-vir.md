# velaresearch/vela-sdxs-512-dreamshaper-vir

## Resumen

Vela SDXS-512-DreamShaper VIR es un artefacto de inferencia publicado por velaresearch que contiene dos conversiones al formato VIR del modelo IDKiro/sdxs-512-dreamshaper, un modelo de texto a imagen de un solo paso y 512×512 píxeles destilado a partir de DreamShaper-8. El repositorio no distribuye un modelo nuevo entrenado por velaresearch, sino los pesos del modelo base reempaquetados para su uso en la red Vela, un sistema de prueba de inferencia (proof-of-inference) en el que los mineros ejecutan el modelo y los validadores comprueban el resultado.

La relevancia es por tanto de infraestructura más que de investigación en generación de imágenes: los ficheros están pensados para el binario `vela-miner` y el nodo validador `velad`, y su integridad se verifica mediante un hash de registro en cadena, no mediante el SHA-256 del fichero completo. Ambos contenedores son de enteros puros (sin coma flotante en la ruta de consenso), con variantes de pesos int16 mixtos y de pesos empaquetados en 32 bits.

El modelo subyacente es un SDXS de un solo paso, lo que implica una latencia muy baja por imagen frente a los modelos de difusión de decenas de pasos, a costa de menor calidad y control. El repositorio ocupa 1,2 GB, tiene licencia "other" (OpenRAIL++ heredada del modelo base) y está marcado explícitamente por el autor como artefacto de testnet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion destilado de un solo paso (SDXS, student de DreamShaper-8); pesos reempaquetados en contenedor VIR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto a imagen; sin contexto de texto declarado) |
| Tipos de cuantizacion | Dos variantes: `mix16` (pesos int16 mixtos, 675.771.968 bytes) y `w32` (pesos empaquetados de 32 bits, 481.334.272 bytes); enteros puros, sin coma flotante en la ruta de consenso |
| Idiomas soportados | no disponible |
| Licencia | other (OpenRAIL++ heredada de IDKiro/sdxs-512-dreamshaper y de sus modelos profesor) |
| Formato de pesos | VIR (contenedores `.vir`), no safetensors ni GGUF |
| Resolucion de salida | 512×512 |
| Pasos de inferencia | 1 (un solo paso) |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo base es un SDXS: un student de difusion destilado de DreamShaper-8 que genera imagenes de 512×512 en un unico paso de inferencia. La destilacion sustituye el muestreo iterativo habitual (decenas de pasos) por una funcion de una sola evaluacion, lo que reduce drasticamente el coste computacional por imagen. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo original y no aparecen en la informacion disponible.

La innovacion de este repositorio no esta en el entrenamiento sino en el empaquetado: los pesos se convierten a contenedores VIR con aritmetica entera, de modo que la ruta de consenso de la red Vela pueda verificar la inferencia de forma determinista y reproducible entre mineros y validadores. Existen dos variantes, una con pesos int16 mixtos y otra con pesos empaquetados en 32 bits de menor tamano. El autor indica que un modelo debe registrarse en cadena antes de poder minarse y que el hash que comprueba el consenso es el del registro, no el SHA-256 del fichero.

## Capacidades

- Generacion de imagenes a partir de texto en resolucion 512×512.
- Inferencia en un solo paso, adecuada para entornos donde la latencia y el coste por imagen son criticos.
- Ejecucion con aritmetica entera en la ruta de consenso, lo que permite verificacion determinista de resultados.
- Integracion con el cliente `vela-miner` y con el nodo validador `velad` mediante el parametro `-poimodel3`.
- Soporte de prueba de inferencia (proof-of-inference) sobre la red testnet4 de Vela.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento.

## Casos de uso

- Mineria en la red Vela: un operador descarga el contenedor `w32.vir`, registra el modelo en cadena y lo ejecuta con `vela-miner --chain testnet4 --model ... --model-id <registry id>` para participar en la prueba de inferencia.
- Validacion de nodos: un validador arranca `velad -testnet4 -poimodel3=<id>:/path/sdxs-512-dreamshaper.w32.vir` para comprobar los resultados de inferencia de los mineros contra el mismo modelo.
- Pruebas de integracion en testnet: el autor marca los artefactos como propios de testnet, por lo que sirven para validar pipelines de registro, activacion por altura y verificacion de hashes antes de un despliegue en mainnet.
- Generacion rapida de imagenes de 512×512 en pipelines por lotes donde el coste por imagen domina, aprovechando la inferencia de un solo paso.
- Investigacion sobre verificacion determinista de inferencia: el uso de aritmetica entera y contenedores con hash de registro es un caso de estudio para sistemas de proof-of-inference.
- Comparacion de variantes de empaquetado: permite medir el compromiso entre tamano (481 MB en `w32` frente a 676 MB en `mix16`) y fidelidad de la salida en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de FID, CLIP score, latencia ni throughput para las variantes VIR ni para el modelo base en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano de los ficheros (481 MB en `w32` y 676 MB en `mix16`) da una cota inferior del peso en memoria, pero no se especifica el pico de VRAM durante la generacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el reducido tamano de los pesos sugiere que podria caber en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: `vela-miner` (minero) y `velad` (validador) con el parametro `-poimodel3`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Pasos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| velaresearch/vela-sdxs-512-dreamshaper-vir | SDXS destilado, contenedor VIR | 512×512 | 1 | VIR (int16 mixto / w32) | other (OpenRAIL++) | Hugging Face, marcado como testnet |
| IDKiro/sdxs-512-dreamshaper | SDXS destilado | 512×512 | 1 | no disponible en esta ficha | OpenRAIL++ | Hugging Face |
| DreamShaper-8 | Difusion estandar (profesor) | no disponible en esta ficha | multiple | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de testnet: el autor indica explicitamente que estos contenedores son propios de testnet y no deben tratarse como listos para produccion en mainnet.
- No es un modelo nuevo: es una conversion de formato de IDKiro/sdxs-512-dreamshaper; las limitaciones de calidad, sesgos y alucinacion visual del modelo base se heredan sin cambios.
- La licencia "other" remite a OpenRAIL++ del modelo base y de sus profesores; es necesario revisar los terminos originales antes de cualquier uso comercial.
- La verificacion de integridad en consenso usa el hash de registro en cadena, no el SHA-256 del fichero completo que figura en la model card; confundir ambos puede invalidar el despliegue.
- El modelo debe registrarse en cadena antes de poder minarse, lo que anade un paso operativo obligatorio.
- Resolucion fija de 512×512 y un solo paso: menor control fino (prompt weighting, img2img, inpainting) que los modelos de difusion multi-paso.
- Idiomas soportados no declarados; el comportamiento multilingue de los prompts no esta documentado.
- Sin datos de benchmarks, latencia ni VRAM, por lo que la planificacion de capacidad debe hacerse mediante pruebas propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/velaresearch/vela-sdxs-512-dreamshaper-vir
- Modelo base: https://huggingface.co/IDKiro/sdxs-512-dreamshaper
- Licencia del modelo base (OpenRAIL++): https://huggingface.co/IDKiro/sdxs-512-dreamshaper
