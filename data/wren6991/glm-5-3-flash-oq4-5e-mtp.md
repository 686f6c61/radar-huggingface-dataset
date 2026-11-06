# wren6991/glm-5.3-flash-oQ4.5e-mtp

## Resumen

GLM-5.3-Flash-oQ4.5e-mtp es un checkpoint cuantizado en formato MLX del modelo multimodal zai-org/GLM-5.3-Flash, desarrollado por el usuario wren6991. Se trata de una cuantizacion de precision mixta construida con la herramienta oQ (oMLX 0.7.3) que reduce un modelo de arquitectura MoE de 320.000 millones de parametros totales y 18.000 millones activos a un peso de 199,33 GB (185,64 GiB), con una media de 4,963 bits por peso.

El modelo base es un transformer de mezcla de expertos nativamente multimodal, con 45 capas (42 de ellas MoE), 288 expertos enrutados con enrutamiento top-8 mas un experto compartido, atencion hibrida lineal (KDA) mas DSA dispersa, Manifold-Constrained Hyper-Connections (mHC) y una ventana de contexto de 1 millon de tokens. Incluye codificador de vision y cabeza de prediccion multi-token (MTP), lo que habilita decodificacion especulativa.

La relevancia de este checkpoint reside en que hace viable ejecutar en hardware Apple Silicon un modelo de escala frontier con capacidades de imagen-texto, manteniendo una fidelidad respecto a BF16 medida y documentada (KL media de 0,1244 y 90,33% de acuerdo top-1). La licencia MIT del checkpoint facilita su uso comercial, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida lineal (KDA) + DSA dispersa y mHC |
| Parametros totales | 321.323.031.390 (321,3B) |
| Parametros activos | 18B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Precision mixta: affine 5-bit (32,33%), 4-bit (64,70%), 8-bit (2,76%), BF16 (0,19%), FP32 (0,03%); grupo 64 |
| Idiomas soportados | No disponible (la evaluacion de calidad cubre ingles, chino y japones, ademas de codigo) |
| Licencia | MIT |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx`) |
| Bits efectivos por peso | 4,963 |
| Tamano del repositorio | 199,3 GB (185,64 GiB) |
| Capas | 45 (42 MoE) |
| Expertos | 288 enrutados, top-8, mas 1 compartido |
| Componentes | Backbone de lenguaje (313,327B), codificador de vision (0,564B), cabeza MTP (7,433B) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con 45 capas, de las cuales 42 son MoE, cada una con 288 expertos enrutados y enrutamiento top-8 mas un experto compartido. La atencion combina capas lineales KDA (Kimi Delta Attention) con atencion dispersa DSA, lo que reduce el coste computacional en contextos largos y permite sostener la ventana de 1 millon de tokens. Incorpora ademas Manifold-Constrained Hyper-Connections (mHC), un mecanismo de conexiones residuales con restricciones de variedad, y una cabeza de prediccion multi-token (MTP) que habilita decodificacion especulativa.

Este checkpoint concreto no ha sido reentrenado: es una cuantizacion del modelo original. El proceso de cuantizacion se realizo con oQ (oMLX 0.7.3), con precision mixta guiada por sensibilidad por capa, redondeo con matriz de importancia (oQe) y un reajuste por minimos cuadrados ponderados de escala y sesgo por grupo, con tamano de grupo 64 y modo affine. Los pesos de escalas y sesgos, asi como los routers MoE, las normas, los parametros mHC y el estado recurrente KDA, permanecen sin cuantizar en FP32/BF16. El bit extra respecto a oQ4e se aplica exclusivamente a las proyecciones down de los 43 tensores apilados de expertos enrutados (42 capas MoE mas la capa MoE del bloque MTP).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en multiples dominios, con modo de razonamiento configurable (`reasoning_effort: max`) y modo thinking activable.
- Procesamiento de imagen y texto de forma nativa (pipeline `image-text-to-text`), gracias al codificador de vision integrado.
- Generacion de codigo y matematicas, con evaluacion de calidad especifica sobre corpus de codigo (CPython, Rust, Go, TypeScript, LLVM, Swift, Linux).
- Capacidades multilingues: la evaluacion de cuantizacion cubre prosa en ingles, chino y japones; el conjunto completo de idiomas soportados no esta disponible.
- Decodificacion especulativa mediante la cabeza MTP preservada, compatible con Lightning MTP y DFlash2.
- Conversacion multi-turno con contexto de hasta 1 millon de tokens.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes: la ventana de 1 millon de tokens permite procesar informes, manuales o expedientes completos junto con sus figuras en una sola pasada, sin fragmentacion ni perdida de contexto entre secciones.
- Asistencia sobre codigo en repositorios grandes: con contexto de 1M tokens y buen rendimiento medido en corpus de codigo (KL de 0,1338 en dominio code), puede revisar modulos completos, rastrear dependencias entre ficheros y proponer refactorizaciones.
- Procesamiento de documentacion tecnica multilingue: la calidad medida en ingles, chino y japones lo hace adecuado para traduccion y resumen de documentacion en esos idiomas dentro de un mismo flujo.
- Despliegue local en estaciones de trabajo Apple Silicon: al estar en formato MLX y ocupar 185,64 GiB, permite ejecutar un modelo de 320B totales en hardware de memoria unificada alta sin depender de GPUs de datacenter.
- Generacion aumentada por recuperacion (RAG) con contexto masivo: la ventana de 1M tokens reduce la necesidad de recortar pasajes recuperados, lo que simplifica el pipeline y mejora la coherencia de las respuestas.
- Inferencia con latencia reducida mediante decodificacion especulativa: la cabeza MTP preservada habilita Lightning MTP y DFlash2, utiles en entornos interactivos donde la latencia por token es critica.
- Experimentacion e investigacion en cuantizacion: el desglose reproducible de bits por modulo y las metricas KL frente a BF16 lo convierten en una referencia para estudiar el impacto de la precision mixta en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye una evaluacion de fidelidad de cuantizacion frente a BF16:

| Metrica | oQ4e | oQ4.5e (este checkpoint) |
|---|---|---|
| KL(teacher \|\| student), media | 0,1420 ± 0,0017 | 0,1244 ± 0,0015 |
| KL, mediana | 0,0160 | 0,0132 |
| KL, p95 / p99 | 0,638 / 1,803 | 0,550 / 1,613 |
| Acuerdo top-1 con BF16 | 89,52% | 90,33% |
| Perplejidad del estudiante | 3,3440 | 3,3330 |
| NLL menos teacher | +0,0283 | +0,0250 |

La perplejidad del teacher (BF16) en las mismas posiciones es 3,2507. La diferencia pareada por posicion es de -0,0177 ± 0,0012 a favor de oQ4.5e, con un 58,1% de posiciones mejoradas. Desglose por dominio (KL media):

| Dominio | oQ4e | oQ4.5e |
|---|---|---|
| Codigo | 0,1506 | 0,1338 |
| Ingles | 0,1408 | 0,1227 |
| Chino | 0,1396 | 0,1115 |
| Japones | 0,1043 | 0,0941 |

Metodologia: 65.536 posiciones de siguiente token (256 secuencias de 256 tokens de prefijo), corpus held-out con 0,017% de solapamiento 8-gram con los corpus de calibracion de oMLX, KL evaluada sobre el top-256 del teacher (98,85% de la masa de probabilidad).

## Requisitos de hardware

- VRAM/memoria unificada: 185,64 GiB solo para los pesos. Con overhead de ejecucion (estado KV para contexto largo, buffers) se recomienda un minimo de 256 GB de memoria unificada.
- El formato es MLX, por lo que el hardware objetivo son chips Apple Silicon con memoria unificada alta (por ejemplo, configuraciones de Mac Studio o Mac Pro con 256 GB o 512 GB). No es directamente compatible con CUDA.
- No cabe en GPUs de consumo convencionales: una RTX 4090 (24 GB) o una RTX 5090 quedan muy lejos de los 185,64 GiB requeridos. Tampoco cabe en una A100 de 80 GB ni en una H100 de 80 GB sin offloading agresivo a CPU/SSD, lo que degradaria severamente el throughput.
- Despliegue: libreria `mlx` (el checkpoint esta construido y validado con la implementacion `glm5_next` incluida en oMLX). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa via MTP (Lightning MTP, DFlash2) puede reducir la latencia por token, pero no se aportan cifras.
- Parametros de muestreo recomendados por el modelo base: temperatura 1,0, top_p 0,95, `reasoning_effort: max`, thinking activado, `clear_thinking: false`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Bits/peso | Tamano | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| wren6991/glm-5.3-flash-oQ4.5e-mtp | 321,3B | 18B | 1M | 4,963 | 199,33 GB | MIT | MLX safetensors |
| Jundot/GLM-5.3-Flash-oQ4e-mtp | 321,3B | 18B | 1M | 4,641 | 186,40 GB | No disponible | MLX safetensors |
| zai-org/GLM-5.3-Flash (BF16) | 321,3B | 18B | 1M | 16,00 | 642,7 GB | No disponible | Safetensors |

La diferencia frente a oQ4e es de +12,93 GB (+6,9% de tamano) a cambio de un bit extra en las proyecciones down de los expertos enrutados, con una mejora medida de KL media de 0,1420 a 0,1244 y de acuerdo top-1 de 89,52% a 90,33%. Frente al BF16 original, el checkpoint ocupa aproximadamente un 31% del espacio.

## Limitaciones y advertencias

- La cuantizacion introduce desviaciones respecto a BF16: el acuerdo top-1 es del 90,33%, de modo que cerca de una decima parte de las predicciones difieren del modelo original. La cola de la distribucion (p99 de KL de 1,613) concentra los casos de mayor divergencia.
- La evaluacion de calidad se limita a posiciones de prefijo (0-255 de cada secuencia), un unico corpus held-out y KL sobre top-256 en lugar de vocabulario completo; los resultados no garantizan el mismo comportamiento en contextos muy largos o dominios no cubiertos.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para este checkpoint ni en la informacion disponible para el modelo base.
- Los idiomas soportados no estan documentados; la cobertura verificada se reduce a ingles, chino, japones y codigo. El rendimiento en castellano no esta medido.
- La licencia MIT se aplica al checkpoint, pero las condiciones de uso del modelo base zai-org/GLM-5.3-Flash deben verificarse de forma independiente antes de un despliegue comercial.
- El requisito de memoria unificada (256 GB o mas) restringe el despliegue a hardware Apple de gama alta; no hay soporte CUDA documentado.
- El repositorio tiene un volumen de descargas muy bajo (73) y ningun "like", por lo que la validacion comunitaria es practicamente inexistente.
- El nombre "oQ4.5e" es una etiqueta propia del autor, no un nivel estandar de oMLX; la receta exacta esta documentada y es reproducible, pero no debe confundirse con los niveles oficiales oQ4e u oQ5.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/wren6991/glm-5.3-flash-oQ4.5e-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint comparable oQ4e: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
