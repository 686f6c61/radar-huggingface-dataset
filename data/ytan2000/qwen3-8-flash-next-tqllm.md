# YTan2000/Qwen3.8-Flash-Next-tqLLM

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 125.000 millones de parametros, desarrollado por el equipo Qwen. Esta ficha describe la variante publicada por YTan2000 en Hugging Face, que no es un modelo nuevo sino un paquete de artefactos de cuantizacion y configuracion para ejecutar el modelo original mediante tqLLM, un motor de inferencia optimizado para MoE con expertos en memoria del sistema. El repositorio incluye los manifiestos, el tokenizador, la capa de prediccion multi-token (MTP) y, opcionalmente, una version propia del archivo de pesos en formato GGUF.

La relevancia de esta publicacion es practica: permite servir un modelo de 125B en una unica GPU de 24 GB (RTX 30 o superior) o en un DGX Spark con GB10, manteniendo los expertos enrutados en memoria RAM del sistema y una cache de estos en la GPU. El autor reporta 122 tok/s de decodificacion en DGX Spark y 76,1 tok/s en RTX 3090 con un prompt de 145.000 tokens, ademas de un 96,0 % en GSM8K-200 con el archivo propio.

La licencia del modelo base es la Qwen Community License 1.0, mientras que los expertos enrutados cuantizados por ISTA-DASLab son Apache-2.0. El repositorio ocupa 134,8 GB y esta pensado para usarse con tqLLM 1.4.2 o superior a traves de un contenedor Docker con servidor compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y capa de prediccion multi-token (MTP) |
| Parametros totales | 125.000 millones (125B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo; se han medido prompts de hasta 145.000 tokens en RTX 3090 |
| Tipos de cuantizacion | IQ3_S (expertos enrutados), IQ4_XS (capas densas), IQ4 (capa MTP), 8 bits (mezcladores de hiperconexion) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (modelo base); Apache-2.0 (expertos enrutados de ISTA-DASLab) |
| Formato de pesos | GGUF (archivos divididos en dos partes), manifiestos `.tqfn` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 125B parametros. La publicacion de YTan2000 no entrena el modelo: redistribuye y reempaqueta pesos ya cuantizados. Los expertos enrutados proceden del GGUF IQ3_S de ISTA-DASLab, generado con las tecnicas GSQ (grouped symmetric quantization) y RCO (rotation-based calibration optimization) de dicho laboratorio, bajo licencia Apache-2.0. Las capas densas se cuantizan a IQ4_XS usando una matriz de importancia elaborada por Unsloth, y los mezcladores de hiperconexion se mantienen en 8 bits.

La innovacion principal del paquete es el motor tqLLM: al arrancar, reorganiza los expertos en memoria del sistema para construir una cache en la GPU, de modo que solo una fraccion de los expertos reside en VRAM. Ademas, se incluye la capa MTP propia del modelo (`mtp-blk48-iq4.gguf`, 1,46 GB) para decodificacion especulativa exacta, junto con un vocabulario de borrador (`atx_65536.txt`) para el drafter MTP. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat incluida en `flashnext-tokenizer.gguf`.
- Razonamiento matematico: 96,0 % en GSM8K-200 segun el autor con el archivo propio de tqLLM.
- Decodificacion especulativa exacta mediante la capa MTP del propio modelo.
- Servidor compatible con la API de OpenAI (`/v1`) a traves de `tqserve`, lo que facilita la integracion con clientes existentes.
- Soporte de prompts largos: se han medido entradas de 145.000 tokens en RTX 3090.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat en una unica GPU de consumo: con una RTX 3090 o superior de 24 GB y 64 GB de RAM, tqLLM mantiene los expertos en memoria del sistema y una cache en la GPU, permitiendo servir un modelo de 125B sin infraestructura de centro de datos.
- Despliegue en estaciones compactas: el DGX Spark con GB10 es compatible y alcanza 122 tok/s de decodificacion con una sola peticion, adecuado para prototipos y equipos de investigacion con espacio limitado.
- Procesamiento de documentos largos: la ventana de 32.768 tokens configurada y las mediciones con prompts de 145.000 tokens permiten resumir o analizar contratos, informes y expedientes extensos en una sola pasada.
- Razonamiento matematico asistido: el 96,0 % en GSM8K-200 lo hace util para tutoria, verificacion de calculos y generacion de problemas resueltos en entornos educativos.
- Backend compatible con OpenAI para herramientas existentes: al exponer `/v1`, cualquier cliente que ya hable con la API de OpenAI puede apuntar a `http://localhost:8086/v1` sin cambios de codigo.
- Evaluacion e investigacion de cuantizacion: el repositorio separa expertos IQ3_S, capas densas IQ4_XS y mezcladores de 8 bits, lo que permite estudiar el impacto de cada nivel de cuantizacion en calidad y velocidad.
- Decodificacion especulativa en produccion: la capa MTP incluida permite acelerar la generacion sin un modelo borrador externo, reduciendo la latencia en cargas interactivas.

## Benchmarks y rendimiento

| Medicion | tqLLM (archivo propio) | Comparacion |
|---|---|---|
| DGX Spark, procesamiento de prompt 8K | 4,32 s | TensorFold 1.2.2: 4,90 s |
| DGX Spark, procesamiento de prompt 16K | 8,14 s | TensorFold 1.2.2: 9,21 s |
| DGX Spark, procesamiento de prompt 32K | 16,83 s | TensorFold 1.2.2: 18,58 s |
| DGX Spark, procesamiento de prompt 64K | 35,64 s | TensorFold 1.2.2: 38,11 s |
| DGX Spark, decodificacion, una peticion | 122 tok/s | TensorFold 1.2.2: 73 tok/s |
| RTX 3090, prompt de 145K: primer token | 58,6 s | Archivo IQ3_S: 61,7 s |
| RTX 3090, prompt de 145K: decodificacion | 76,1 tok/s | Archivo IQ3_S: 71,6 tok/s |
| GSM8K-200 | 96,0 % | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks estandar del modelo base.

## Requisitos de hardware

- GPU: NVIDIA de 24 GB o superior (RTX 30 o mas reciente) o GB10 / DGX Spark.
- Memoria del sistema: 64 GB minimo; las mediciones reportadas se realizaron con 128 GB.
- Almacenamiento: 134,8 GB para el repositorio completo; la descarga minima con el archivo publico IQ3_S requiere ademas el GGUF de ISTA-DASLab.
- Despliegue: tqLLM 1.4.2 o superior mediante la imagen Docker `ytan2000/tqllm:1.4.4` y el binario `tqserve`.
- Contexto de ejemplo: 32.768 tokens; el servidor tarda unos dos minutos en estar listo.
- Latencia y throughput: 122 tok/s de decodificacion en DGX Spark y 76,1 tok/s en RTX 3090 con prompt de 145K; procesamiento de prompt de 64K en 35,64 s en DGX Spark.
- No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI; el unico motor documentado es tqLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Motor documentado |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (esta ficha, via tqLLM) | 125B MoE | 32.768 tokens configurados | Qwen Community License 1.0 | tqLLM |
| Qwen3.8-Flash-Next GSQ-RCO (ISTA-DASLab) | 125B MoE | no disponible | Apache-2.0 (expertos) | no disponible |
| TensorFold 1.2.2 (referencia de comparacion del autor) | no disponible | no disponible | no disponible | TensorFold |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en parametros, contexto y rendimiento.

## Limitaciones y advertencias

- La licencia Qwen Community License 1.0 no es de codigo abierto pleno; es necesario revisar sus terminos antes de un uso comercial y conservar el archivo `LICENSE-Qwen` con cualquier copia.
- El paquete depende de tqLLM: no se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- Requiere 64 GB de RAM como minimo y 128 GB en las mediciones reportadas; en equipos con menos memoria el rendimiento puede degradarse por el intercambio de expertos.
- El contexto de ejemplo es de 32.768 tokens; aunque se han medido prompts mayores, no se garantiza estabilidad mas alla de esa configuracion.
- La cuantizacion IQ3_S en los expertos y IQ4_XS en las capas densas introduce perdida de precision respecto al modelo original; no se han publicado comparativas de calidad frente al modelo sin cuantizar.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni evaluaciones de seguridad en la documentacion disponible.
- El modelo base y los pesos cuantizados provienen de terceros (Qwen e ISTA-DASLab); la trazabilidad de cada componente debe verificarse en los repositorios de origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YTan2000/Qwen3.8-Flash-Next-tqLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF IQ3_S de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Licencia Qwen: https://huggingface.co/YTan2000/Qwen3.8-Flash-Next-tqLLM/blob/main/LICENSE-Qwen
- Repositorio de tqLLM: https://github.com/turbo-tan/tqllm
- Notas de version de tqLLM 1.4.4: https://github.com/turbo-tan/tqllm/releases/tag/v1.4.4
- Pagina de rendimiento de tqLLM: https://tqllm.com/performance
