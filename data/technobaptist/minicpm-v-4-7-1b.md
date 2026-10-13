# TechnoBaptist/MiniCPM-V-4.7-1B

## Resumen

MiniCPM-V 4.7 1B es un modelo multimodal de tipo image-text-to-text orientado a inferencia en dispositivo (on-device), integrado en la familia MiniCPM-V de OpenBMB. Esta ficha corresponde a la reproduccion alojada por el usuario TechnoBaptist en HuggingFace, cuyo repositorio pesa 3,2 GB y contiene pesos en safetensors con 1.554.476.272 parametros reales (aproximadamente 1,55 mil millones), una cifra superior a la denominacion comercial "1B". El pipeline declarado es image-text-to-text y la licencia es Apache 2.0.

El modelo resuelve el problema de ejecutar comprension de imagen, multiples imagenes y video en hardware con presupuesto de recursos muy limitado: moviles, tablets y placas embebidas. Para ello combina una tecnica de compresion temprana de tokens visuales dentro del propio codificador de vision (intra-ViT early compression, procedente de LLaVA-UHD v4) con soporte de compresion mixta de tokens visuales 4x/16x, de modo que el desarrollador puede intercambiar detalle visual por coste de inferencia segun la tarea.

Su relevancia actual radica en la densidad de capacidad por vatio: segun la model card, la variante 1B mejora las capacidades base de MiniCPM-V 4.6 y supera de forma sustancial a Qwen3.5 0.8B tanto en puntuacion global como en eficiencia de inferencia. El repositorio incluye soporte declarado para iOS, Android y HarmonyOS, asi como para plataformas de chip de Rockchip, Houmo, Intel, AMD y Arm, y variantes cuantizadas GGUF, BNB, AWQ, GPTQ y FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM (codificador de vision mas modelo de lenguaje); compresion temprana intra-ViT y compresion mixta de tokens visuales 4x/16x. No se detalla el backbone de lenguaje en la informacion disponible |
| Parametros totales | 1.554.476.272 (dato real de safetensors, ~1,55B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ y FP8 (segun la model card de la familia); el repositorio de TechnoBaptist solo publica safetensors |
| Idiomas soportados | no disponible (la model card no declara listado de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,2 GB); la familia ofrece tambien GGUF, BNB, AWQ, GPTQ y FP8 |

Otros metadatos del repositorio: biblioteca `transformers`, tags `minicpmv4_7`, `image-text-to-text`, `minicpm-v`, `multimodal`, `On-Device Model`, `lightweight`, `conversational`, `endpoints_compatible`; 0 descargas y 1 like; creado y actualizado el 12 de octubre de 2026.

## Arquitectura y entrenamiento

La informacion disponible describe un modelo multimodal de la serie MiniCPM-V con dos elementos arquitectonicos destacados. El primero es la compresion temprana de tokens visuales dentro del propio ViT (intra-ViT early compression), tomada de LLaVA-UHD v4: los tokens visuales se reducen antes de atravesar las capas restantes del codificador, de modo que el ahorro de computo se propaga a todas las capas posteriores en lugar de aplicarse solo en la interfaz vision-lenguaje. El segundo es la compresion mixta de tokens visuales en factores 4x y 16x, que permite ajustar el equilibrio entre detalle visual y coste de inferencia en funcion de la tarea.

El modelo mantiene las capacidades de la familia en comprension de imagen unica, multiples imagenes y video, y anade FP8 como formato de cuantizacion soportado y una tecnica de ajuste fino denominada Self-Replay Fine-Tuning, orientada a extender capacidades con coste bajo y menor olvido de las capacidades previas. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon etapas de RLHF o DPO.

## Capacidades

- Comprension de imagen unica: descripcion, respuesta a preguntas visuales y extraccion de informacion a partir de una imagen.
- Comprension de multiples imagenes: comparacion y razonamiento conjunto sobre varias imagenes en una misma conversacion.
- Comprension de video: el stack de inferencia incluye decodificacion de video (torchcodec, con alternativa PyAV).
- Conversacion multimodal multi-turno (tag `conversational` en el repositorio).
- Compresion configurable de tokens visuales en 4x o 16x para ajustar detalle frente a coste.
- Despliegue en dispositivo: soporte declarado para iOS, Android y HarmonyOS, y para plataformas de chip de Rockchip, Houmo, Intel, AMD y Arm.
- Cuantizacion y despliegue: variantes GGUF, BNB, AWQ, GPTQ y FP8; marcos de inferencia SGLang, vLLM, llama.cpp y Ollama.
- Ajuste fino: soporte para SWIFT y LLaMA-Factory, mas la tecnica Self-Replay Fine-Tuning.
- Tool calling, function calling, modo thinking, audio y otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente visual en movil sin conexion: el modelo esta disenado para ejecutarse en iOS, Android y HarmonyOS, por lo que puede describir escenas, leer texto de imagenes o responder preguntas sobre una foto sin enviar los datos a un servidor.
- Accesibilidad para personas con discapacidad visual: transcripcion y descripcion de imagenes capturadas por la camara del dispositivo, con la compresion 16x para minimizar latencia en tiempo real.
- Inspeccion visual en campo con hardware embebido: en placas Rockchip, Houmo, Intel, AMD o Arm se puede desplegar para clasificar o describir imagenes de sensores en entornos sin conectividad.
- Analisis de documentos escaneados o capturas: extraccion de informacion de facturas, etiquetas o formularios mediante preguntas dirigidas sobre la imagen, con compresion 4x cuando el detalle de texto sea critico.
- Moderacion o etiquetado de contenido visual a escala: uso de vLLM o SGLang para procesar lotes de imagenes en servidor con cuantizacion FP8 o AWQ, reduciendo coste por muestra.
- Revision de video en local: analisis de fotogramas o clips cortos en un equipo de sobremesa mediante llama.cpp u Ollama con pesos GGUF, evitando subir el material a servicios externos.
- Prototipado multimodal en portatil: el peso del repositorio (3,2 GB en safetensors) permite cargar el modelo en una GPU de consumo para validar ideas de producto antes de escalar el despliegue.
- Ajuste fino de dominio: partiendo de los pesos publicados y con SWIFT o LLaMA-Factory, adaptar el modelo a un vertical concreto (por ejemplo, inspeccion industrial) usando Self-Replay Fine-Tuning para preservar las capacidades originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye unicamente graficos en formato PNG (frontera rendimiento-eficiencia y comparativa de rendimiento global en modo Instruct para 1B) sin tablas con cifras, por lo que no se pueden reproducir valores concretos de MMLU, HumanEval, GSM8K ni de suites multimodales.

Las unicas afirmaciones comparativas explicitas de la model card son las siguientes, sin cifras asociadas:

| Afirmacion | Alcance |
|---|---|
| Mejora las capacidades base respecto a MiniCPM-V 4.6 | Modo Instruct, variante 1B |
| Supera de forma sustancial a Qwen3.5 0.8B | Puntuacion global y eficiencia de inferencia |
| Avanza la frontera de Pareto rendimiento-eficiencia | Variante 1B frente al resto de la serie |

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: aproximadamente 3,1 GB solo para los pesos (1.554.476.272 parametros x 2 bytes), mas el coste de cache de activaciones y del codificador de vision; en la practica cabe en GPUs de 6-8 GB. Estimacion aritmetica propia, no un dato publicado.
- VRAM estimada con cuantizacion de 4 bits: del orden de 0,8-1,0 GB para los pesos, mas overhead; apta para dispositivos moviles y placas embebidas de gama media. Estimacion propia.
- GPU de escritorio recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para la version en 16 bits; para lotes grandes o video conviene 16-24 GB.
- GPU de datacenter: A100, H100 o L40S para servir en vLLM o SGLang con FP8 o AWQ y alto throughput. No se publican cifras de throughput ni latencia.
- Cabe en GPU de consumo: si, en la practica totalidad de GPUs con 6 GB o mas de VRAM.
- Movilidad: la model card incluye grabaciones en iPhone 17 Pro Max y menciona soporte para iOS, Android y HarmonyOS, asi como plataformas de chip de Rockchip, Houmo, Intel, AMD y Arm.
- Opciones de despliegue: Transformers (se requiere `transformers>=5.18.0`, junto con `torchvision` y `torchcodec` o `av`), SGLang, vLLM, llama.cpp y Ollama; ajuste fino con SWIFT y LLaMA-Factory.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B (esta ficha) | 1,55B reales en safetensors | no disponible | Referencia de la comparativa cualitativa de la model card | apache-2.0 | HuggingFace (repositorio de TechnoBaptist), pesos safetensors |
| Qwen3.5 0.8B | no disponible en la informacion proporcionada | no disponible | Segun la model card, superado por MiniCPM-V 4.7 1B en puntuacion global y eficiencia | no disponible | no disponible |
| MiniCPM-V 4.6 | no disponible en la informacion proporcionada | no disponible | Predecesor directo; MiniCPM-V 4.7 1B mejora sus capacidades base en modo Instruct | no disponible | no disponible |

No se dispone de datos verificables de contexto, licencia o cifras de benchmarks para los modelos comparados dentro de la informacion proporcionada, por lo que la comparativa se limita a lo que declara la propia model card.

## Limitaciones y advertencias

- No se declara listado de idiomas soportados, por lo que el rendimiento multilingue (incluido el castellano) no esta garantizado ni documentado.
- No se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos o conversaciones largas.
- No se publican cifras de benchmarks: las afirmaciones de rendimiento de la model card son cualitativas y acompanadas de graficos sin valores numericos, por lo que no son verificables de forma independiente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo de 1,5B, con la capacidad de razonamiento y de fidelidad factual que ese orden de magnitud permite.
- Repositorio de terceros: la ficha corresponde a `TechnoBaptist/MiniCPM-V-4.7-1B`, no a una publicacion oficial de OpenBMB. Con 0 descargas y 1 like, no hay evidencia de uso ni validacion por parte de la comunidad, y conviene verificar la integridad de los pesos antes de usarlos en produccion.
- Existe una discrepancia entre la denominacion "1B" y el recuento real de safetensors (1,55B), a tener en cuenta al calcular presupuestos de memoria.
- Dependencias exigentes: la model card requiere `transformers>=5.18.0`, y `torchcodec` presenta incompatibilidades conocidas con determinadas versiones de CUDA (por ejemplo, torch>=2.11 con CUDA 13.1 frente a entornos CUDA 12.x), con la alternativa de usar PyAV.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero esta ficha no sustituye a la revision legal de los terminos aplicables a los pesos redistribuidos ni a los del modelo original.
- Capacidades de tool calling, agentes y modo thinking no confirmadas en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TechnoBaptist/MiniCPM-V-4.7-1B
- Documentacion de la serie MiniCPM-V 4.7 (OpenBMB): https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Guia de despliegue y marcos soportados: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook de la comunidad: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- LLaVA-UHD v4 (tecnica de compresion intra-ViT): https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Grafico de frontera rendimiento-eficiencia: https://raw.githubusercontent.com/OpenBMB/MiniCPM-o/main/assets/minicpmv4.7/performance_efficiency_frontier.png
- Grafico de rendimiento global 1B Instruct: https://raw.githubusercontent.com/OpenBMB/MiniCPM-o/main/assets/minicpmv4.7/overall_performance_1b_instruct.png
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a contenidos no relacionados y se han descartado.
