# zviratko/Qwen3.8-Flash-Next-oQ4h-mtp-plefp8

## Resumen
zviratko/Qwen3.8-Flash-Next-oQ4h-mtp-plefp8 es una cuantizacion mixta en formato oQh del modelo Qwen/Qwen3.8-Flash-Next, un checkpoint experimental de la arquitectura que Qwen empleara en su generacion Qwen4. Se trata de un modelo de mezcla de expertos (MoE) multimodal de tipo vision-lenguaje, con 125.744B parametros en el backbone de lenguaje (6B activados por token), un embedding n-gram de 51.200B parametros, un codificador visual de 0.449B y una cabeza de prediccion multi-token (MTP) de 2.607B. El total logico asciende a 180.000B parametros, aunque el checkpoint safetensors reporta 77.108.737.939 parametros almacenados tras la cuantizacion.

La relevancia de esta publicacion es doble. Por un lado, expone una arquitectura novedosa que combina Gated DeltaNet con Qwen Sparse Attention (QSA) y flujos residuales con compuertas (Gated Residual streams), lo que la aleja del transformer denso clasico. Por otro, demuestra el formato oQh de cuantizacion mixta desarrollado en oMLX, que aplica una transformada de Hadamard por bloques con signo sobre las proyecciones de expertos enrutados y almacena codigos enteros con escala y offset compartidos cada 128 pesos, logrando 4.781 bits por peso efectivos en el checkpoint completo.

El autor advierte explicitamente de que se ha trasplantado una tabla n-gram PLE en FP8 y de que, aunque las salidas son coherentes a primera vista, el modelo debe probarse con cautela. Requiere oMLX 0.8.0 o superior con soporte oQh, por lo que no es cargable en versiones anteriores ni en otros runtimes de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-lenguaje con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual streams; incluye embedding n-gram y cabeza MTP |
| Parametros totales | 180.000B logicos (125.744B backbone de lenguaje + 51.200B embedding n-gram + 0.449B vision encoder + 2.607B MTP); 77.108.737.939 almacenados en safetensors |
| Parametros activos | 6B en el backbone de lenguaje (mas modulos auxiliares) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh 4-bit grupo 128, oQh 5-bit grupo 128, affine 4-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, BF16, n-gram affine 4-bit grupo 32; media efectiva 4.781 bits/peso (4.654 en el backbone) |
| Idiomas soportados | no disponible (la model card menciona evaluacion en 7 idiomas via FLORES+ y Aya, sin listarlos) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato oQh para MLX |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-Flash-Next es un MoE multimodal con 125B parametros en el backbone de lenguaje y 6B activados, al que se anaden tres componentes diferenciados: un embedding n-gram de 51B parametros, un codificador visual de 0.449B y una cabeza de prediccion multi-token de 2.607B. La arquitectura sustituye la atencion clasica por una combinacion de Gated DeltaNet (estado recurrente con compuertas) y Qwen Sparse Attention, e incorpora Gated Residual streams, lo que sugiere un diseno hibrido orientado a eficiencia en contextos largos. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion principal de este checkpoint concreto es el formato oQh de oMLX. Cada proyeccion de experto enrutado se guarda como codigos enteros sobre una entrada rotada mediante una transformada de Hadamard por bloques con signo, con una escala y un offset compartidos por cada 128 pesos rotados. El planificador de cuantizacion reasigna los bytes ahorrados en escalas a bits adicionales en las tensiones mas sensibles, de modo que un fichero oQh ocupa lo mismo que uno oQe del mismo nivel pero con menor divergencia KL respecto al modelo FP8 original. Ademas, el autor ha trasplantado una tabla n-gram PLE en FP8, lo que constituye una modificacion no estandar respecto al modelo base.

## Capacidades
- Generacion de texto conversacional multi-turno en modo chat.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text), gracias al codificador visual integrado.
- Razonamiento de multiples pasos y decodificacion especulativa mediante la cabeza MTP.
- Capacidades multilingues: la model card reporta evaluacion sobre FLORES+ y Aya en 7 idiomas, aunque no especifica cuales.
- Generacion de codigo: se reportan metricas de divergencia KL sobre codigo Python, lo que indica soporte para este dominio.
- Uso de contexto largo potencial derivado de la atencion dispersa QSA, si bien la longitud exacta de contexto no esta documentada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y planificacion autonoma: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso
- Asistentes multimodales de escritorio en Apple Silicon: el checkpoint esta en formato MLX y cuantizado a 4.781 bits/peso efectivos, lo que permite desplegar un modelo de 180B parametros logicos en un Mac Studio con memoria unificada suficiente, gestionando conversaciones que combinan capturas de pantalla y texto.
- Analisis de documentos con imagenes: el codificador visual de 0.449B permite procesar facturas, graficos o diagramas junto con el texto asociado, integrable en pipelines de extraccion de datos.
- Generacion de codigo asistida en local: la evaluacion KL sobre codigo Python sugiere un rendimiento aceptable en tareas de programacion, adecuado para entornos de desarrollo con requisitos de privacidad donde no se puede enviar codigo a la nube.
- Traduccion y procesamiento multilingue: la evaluacion sobre FLORES+ y Aya en 7 idiomas respalda su uso en tareas de traduccion automatica y resumen multilingue, aunque el usuario debe verificar los pares de idiomas concretos.
- Prototipado e investigacion de arquitecturas Qwen4: al ser un preview experimental de la arquitectura Qwen4, sirve para estudiar el comportamiento de Gated DeltaNet, QSA y Gated Residual streams antes de que se publiquen los modelos definitivos.
- Experimentacion con decodificacion especulativa: la cabeza MTP de 2.607B permite investigar tecnicas de prediccion multi-token y aceleracion de inferencia en entornos MLX.
- Evaluacion de tecnicas de cuantizacion mixta: util para investigadores que quieran comparar oQh frente a oQe u otros esquemas midiendo divergencia KL sobre sus propios conjuntos de datos.

## Benchmarks y rendimiento
La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Proporciona unicamente divergencia KL respecto al modelo original en FP8 para comparar los formatos oQe y oQh:

| Nivel | Tamano | KL FLORES+ (oQe -> oQh) | KL Aya (oQe -> oQh) | KL codigo (oQe -> oQh) |
|---|---|---|---|---|
| oQ2 | 70.8 GiB | 0.27 -> 0.17 (-38%) | 0.36 -> 0.14 (-62%) | 0.32 -> 0.24 (-24%) |
| oQ3 | 84.9 GiB | 0.082 -> 0.060 (-27%) | 0.055 -> 0.042 (-23%) | 0.14 -> 0.11 (-18%) |
| oQ4 | 98.8 GiB | 0.034 -> 0.029 (-15%) | 0.018 -> 0.018 (+3%) | 0.065 -> 0.058 (-12%) |

El autor senala que en oQ4 la diferencia en Aya se concentra en un unico documento de 1.768 tokens; sin el, oQh queda un 20% por debajo de oQe en los 303 documentos restantes. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: el checkpoint completo ocupa 100.178 GiB (107.565 GB) en disco; en inferencia se necesita al menos esa cantidad de memoria, mas overhead de activaciones y cache KV.
- GPU recomendadas: no es un checkpoint pensado para GPU CUDA; requiere MLX, por lo que el hardware objetivo son chips Apple Silicon (series M2 Ultra, M3 Ultra, M4 Max y superiores con memoria unificada amplia).
- Cabe en consumer GPU: no de forma practica. Un modelo de ~100 GiB excede la VRAM de cualquier GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Solo es viable en configuraciones con memoria unificada de 128 GB o mas, como Mac Studio M3 Ultra o Mac Pro.
- Opciones de despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato oQh y el runtime MLX son especificos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con 6B parametros activos por token, el rendimiento esperado es propio de un MoE disperso, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| zviratko/Qwen3.8-Flash-Next-oQ4h-mtp-plefp8 | 180B logicos (6B activos) | no disponible | qwen-community-1.0 | safetensors oQh (MLX) | Hugging Face, requiere oMLX 0.8.0+ |
| Qwen/Qwen3.8-Flash-Next | 180B logicos (6B activos) | no disponible | qwen-community-1.0 | pesos originales (FP8) | Hugging Face, modelo base |
| Qwen3.8-Flash-Next en oQ4 (oQe) | 180B logicos (6B activos) | no disponible | qwen-community-1.0 | oQe (MLX) | Referenciado en la model card, sin enlace directo |
| Otros MoE multimodales de ~100B-200B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de rendimiento de alternativas que permitan una comparacion justa.

## Limitaciones y advertencias
- Modelo experimental: el autor lo describe como un preview de la arquitectura Qwen4 y advierte que, pese a que las salidas son coherentes, debe usarse "bajo su propio riesgo".
- Trasplante de tabla n-gram PLE en FP8: modificacion no estandar respecto al modelo base que puede introducir comportamientos impredecibles no documentados.
- Divergencia respecto al original: incluso en oQ4 la KL no es cero (0.029 en FLORES+, 0.058 en codigo), por lo que hay degradacion medible frente al FP8 de referencia.
- Requisito estricto de runtime: solo carga en oMLX 0.8.0 o superior con soporte oQh; versiones anteriores fallan al cargar el checkpoint.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; al ser un modelo conversacional y experimental, se debe asumir riesgo estandar y validar salidas en produccion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y los 7 idiomas evaluados no se listan, por lo que no se puede garantizar cobertura de un idioma concreto.
- Restricciones de licencia: Qwen Community License 1.0, que puede imponer condiciones adicionales al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en produccion.
- Huella de memoria elevada: ~100 GiB en inferencia, lo que descarta GPUs de consumo y limita el despliegue a equipos Apple Silicon con memoria unificada muy amplia.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/zviratko/Qwen3.8-Flash-Next-oQ4h-mtp-plefp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oQ/oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
