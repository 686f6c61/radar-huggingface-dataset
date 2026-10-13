# TechnoBaptist/MiniCPM-V-4.7-35B-A3B

## Resumen

MiniCPM-V 4.7 35B-A3B es un modelo multimodal (image-text-to-text) de la familia MiniCPM-V, desarrollada por OpenBMB, en su primera variante con arquitectura de mezcla de expertos (MoE). El nombre indica 35B parametros totales y aproximadamente 3B activos por token, lo que permite separar la capacidad de almacenamiento (35B) del coste de computo por token (cercano a un modelo de 3B). El repositorio analizado es una publicacion de terceros (TechnoBaptist) que replica la model card de OpenBMB.

Su propuesta diferencial es la inferencia en dispositivo: combina la tecnica Lookahead Expert Scheduling (LES), cuantizacion fina por capas e integracion de muestreo especulativo DSpark para precargar expertos entre capas y solapar su computo con la carga del resto. Segun la model card, alcanza velocidades de decodificacion de mas de 13 tokens/s en un iPhone 17 Pro Max sin recortar el enrutado de expertos a nivel de token, lo que lo situa como el primer MoE abierto con inferencia fluida en dispositivo segun sus autores.

En el plano de eficiencia visual, incorpora compresion temprana de tokens dentro del propio codificador visual (intra-ViT) heredada de LLaVA-UHD v4, con soporte de compresion mixta 4x/16x. La licencia es Apache 2.0 y el repositorio ocupa 70,6 GB en safetensors. No se han facilitado datos de contexto maximo, idiomas soportados ni cifras numericas de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (encoder visual tipo ViT con compresion intra-ViT temprana + transformer de lenguaje con mezcla de expertos) |
| Parametros totales | 35.212.875.824 (35,2 B) |
| Parametros activos | Aproximadamente 3 B por token segun la denominacion "A3B" del nombre del modelo; no confirmado de forma explicita en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ y FP8 (segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); variantes GGUF y cuantizadas para otros runners |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 35B-A3B es un modelo multimodal de tipo MoE: un encoder visual procesa la imagen y el transformer de lenguaje genera texto condicionado por los tokens visuales. La innovacion en vision es la compresion temprana de tokens dentro del propio ViT (intra-ViT early compression, procedente de LLaVA-UHD v4), que reduce el computo de las capas posteriores del encoder, junto con un esquema de compresion mixta 4x/16x que permite ajustar el equilibrio entre detalle visual y coste de inferencia. El modelo cubre comprension de imagen unica, multiples imagenes y video.

La parte de eficiencia se apoya en tres piezas declaradas por los autores: Lookahead Expert Scheduling (LES), que usa prediccion de enrutado entre capas para precargar los expertos que probablemente necesitara la capa siguiente, priorizando los ya precargados y solapando su computo con la carga de los restantes (la prediccion solo guia la precarga; el computo sigue el enrutado original a nivel de token); cuantizacion fina por capas; e integracion con muestreo especulativo DSpark. El texto disponible menciona tambien Self-Replay Fine-Tuning como metodo de ajuste de bajo coste que reduce el olvido de capacidades previas. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y comprension de imagenes (image-text-to-text) con soporte de imagen unica, multiples imagenes y video.
- Comprension de video, segun la descripcion de la familia MiniCPM-V.
- Inferencia en dispositivo (iOS, Android y HarmonyOS) con decodificacion declarada de mas de 13 tokens/s en iPhone 17 Pro Max.
- Soporte de decodificacion especulativa mediante integracion con DSpark.
- Compresion de tokens visuales configurable (4x/16x) para ajustar detalle frente a coste.
- Compatibilidad con frameworks de inferencia: SGLang, vLLM, llama.cpp y Ollama, ademas de transformers.
- Ajuste fino con SWIFT y LLaMA-Factory, incluido el metodo Self-Replay Fine-Tuning.
- Soporte de despliegue en plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm (day-0 segun la model card).
- Tool calling, soporte de agentes, modo thinking y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes moviles offline: el modelo esta disenado para ejecutarse en iOS, Android y HarmonyOS con decodificacion superior a 13 tokens/s en iPhone 17 Pro Max, lo que permite asistentes multimodales sin conexion que describan o respondan sobre fotos del usuario en el propio dispositivo.
- Inspeccion visual en campo con hardware embebido: gracias al soporte day-0 para chips de Rockchip, Houmo, Intel, AMD y Arm, puede desplegarse en dispositivos de borde para tareas de reconocimiento y descripcion de imagenes donde no hay conectividad ni GPUs de centro de datos.
- Analisis de documentos escaneados y capturas: la compresion mixta 4x/16x permite elegir 16x para documentos densos en texto y 4x cuando se necesita detalle fino (diagramas, tablas), ajustando el coste por consulta.
- Procesado de video para resumenes: al soportar comprension de video y multiples imagenes, encaja en pipelines que resumen grabaciones o extraen eventos relevantes, reduciendo la carga del encoder mediante la compresion intra-ViT.
- Servicio multimodal autoalojado con vLLM o SGLang: el par 35B totales / ~3B activos reduce el coste de computo por token frente a un denso de 35B, lo que abarata servir peticiones image-text-to-text a traves de una API compatible con endpoints.
- Personalizacion por dominio con bajo coste: el ajuste con SWIFT o LLaMA-Factory y el metodo Self-Replay Fine-Tuning permiten adaptar el modelo a un vertical concreto (por ejemplo, inspeccion industrial) sin degradar en exceso las capacidades originales.
- Prototipado en portatil: con una cuantizacion de 4 bits el modelo puede caber en GPUs de consumo, lo que facilita iterar sobre casos de uso multimodales antes de pasar a despliegue en servidor.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye unicamente una afirmacion cualitativa: en modo Instruct, la variante 35B-A3B obtiene una puntuacion global superior en menos tiempo de inferencia que Qwen3.6 35B-A3B. No se aportan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales (MMBench, MMVet, Video-MME, etc.) en el material facilitado.

## Requisitos de hardware

- Pesos en precision completa (bf16/fp16): aproximadamente 70 GB solo de pesos; requiere GPU de 80 GB (H100, A100 80 GB) o reparto en varias GPUs.
- FP8 o INT8: aproximadamente 35 GB de pesos, desplegable en A100 40 GB, L40S 48 GB o dos RTX 4090 con tensor parallelism.
- Cuantizacion de 4 bits (AWQ, GPTQ, GGUF Q4): aproximadamente 18-20 GB, por lo que cabe en una RTX 4090 o RTX 5090 de 24 GB y en equipos con memoria unificada de 32 GB o mas.
- Coste de computo: al activar solo una fraccion de los expertos (denominacion A3B) el computo por token es muy inferior al de un modelo denso de 35B, aunque los requisitos de memoria vienen marcados por los parametros totales.
- Despliegue en servidor: vLLM y SGLang, con soporte tambien en llama.cpp, Ollama y transformers.
- Despliegue en dispositivo: iOS, Android y HarmonyOS, con soporte declarado de chips de Rockchip, Houmo, Intel, AMD y Arm.
- Latencia y throughput: el unico dato aportado es una decodificacion de mas de 13 tokens/s en iPhone 17 Pro Max; no hay cifras de throughput en GPU ni de latencia en servidor.
- Ajuste fino: SWIFT y LLaMA-Factory, con soporte de Self-Replay Fine-Tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B | 35,2 B totales, ~3 B activos | no disponible | Puntuacion global superior a Qwen3.6 35B-A3B en modo Instruct con menos tiempo de inferencia (afirmacion de la model card, sin cifras) | Apache 2.0 | Pesos en este repositorio (70,6 GB, safetensors) |
| Qwen3.6 35B-A3B | 35 B (referencia de comparacion citada por los autores; datos de contexto no disponibles) | no disponible | Referencia comparativa usada por la model card; sin cifras detalladas | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Otros MLLM comparables (por ejemplo, alternativas densas de ~30-35 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar de forma directa con Qwen3.6 35B-A3B, y unicamente a partir de una afirmacion cualitativa del autor. No hay datos verificables de terceros ni cifras por tarea.

## Limitaciones y advertencias

- El repositorio analizado pertenece a un tercero (TechnoBaptist) con 0 descargas y 0 likes, mientras que la model card describe un modelo de OpenBMB: conviene verificar los pesos frente a la publicacion oficial antes de usarlos en produccion.
- La model card facilitada esta truncada: faltan secciones de evaluacion, ejemplos y uso que si se referencian en el indice, por lo que los datos de esta ficha pueden estar incompletos.
- La fecha de creacion y actualizacion del repositorio indicada es 2026-10-12, incoherente con el estado actual de publicaciones; se recomienda comprobar la trazabilidad del artefacto.
- No se especifican idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano u otros idiomas sin evaluacion previa.
- No se publican cifras de benchmarks ni evaluaciones de sesgo, alucinacion o robustez multimodal, lo que impide estimar la tasa de error esperada.
- La afirmacion de superioridad frente a Qwen3.6 35B-A3B es una comparacion cualitativa del propio autor, sin metodologia detallada en la informacion disponible.
- La inferencia en dispositivo depende de tecnicas especificas (LES, cuantizacion por capas, DSpark) y de runtimes concretos; el rendimiento declarado de mas de 13 tokens/s en iPhone 17 Pro Max no es extrapolable a otros dispositivos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los pesos y del codigo de despliegue (llama.cpp-omni, repositorios de OpenBMB) por separado.
- El tamano del repositorio (70,6 GB) implica requisitos de almacenamiento y de transferencia relevantes para equipos con ancho de banda limitado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TechnoBaptist/MiniCPM-V-4.7-35B-A3B
- Repositorio de codigo de OpenBMB (MiniCPM-o): https://github.com/OpenBMB/MiniCPM-o
- Documentacion de MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Documentacion de despliegue (frameworks y API): https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Tecnica Lookahead Expert Scheduling (LES): https://github.com/tc-mb/llama.cpp-omni/blob/master/docs/les/lookahead-expert-scheduling.md
- LLaVA-UHD v4 (compresion intra-ViT): https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook de MiniCPM-V: https://github.com/OpenSQZ/MiniCPM-V-CookBook
