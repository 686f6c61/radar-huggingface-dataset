# zenteiq-ai/Dhir-2B-GGUF

## Resumen

Dhir-2B-GGUF es la distribucion cuantizada del modelo Dhir-2B de ZenteiQ, un modelo de lenguaje de 2.030 millones de parametros orientado a generacion de texto conversacional en ingles y once lenguas de la India. El repositorio ofrece tres builds GGUF pensados para llama.cpp: Q4_K_M (1,3 GB), Q8_0 (2,2 GB) y una variante Q4_0 con matriz de importancia optimizada para la NPU Hexagon de Snapdragon. Forma parte de la familia BrahmAI del autor y esta publicado bajo licencia Apache 2.0.

La propuesta central es el despliegue en el borde: con 1,3 GB en 4 bits, el modelo cabe en moviles, chips embebidos y portatiles sin GPU, manteniendo una ventana de contexto de 16.384 tokens. La version de 8 bits se acerca al comportamiento del modelo original, mientras que la variante `-imat-pure` esta preparada para aceleracion en NPU Hexagon y en CPUs Arm.

Su relevancia actual reside en la combinacion de cobertura multilingue indic (hindi, bengali, tamil, telugu, kannada, malayo, marati, gujarati, punyabi y oriya), tamano reducido y soporte explicito de backends de Intel (Vulkan y OpenVINO para Core Ultra, Arc y Xeon) y de la NPU Hexagon, lo que lo posiciona como una opcion practica para asistentes locales en dispositivos de consumo en el mercado indio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun el formato de pesos y el pipeline de text-generation) |
| Parametros totales | 2.030.167.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (1,3 GB), Q8_0 (2,2 GB), Q4_0-imat-pure (1,2 GB, para NPU Hexagon) |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un modelo de 2B parametros para text-generation con contexto de 16.384 tokens. No se especifica si emplea atencion completa, atencion lineal u otra variante, ni se documentan el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se publican los datos de entrenamiento: numero de tokens, composicion del corpus, origen de los datos multilingues indic ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Lo que si documenta la model card es el proceso de cuantizacion. La variante `Dhir-2B-Q4_0-imat-pure.gguf` almacena cada matriz de pesos como Q4_0 y fue construida con una matriz de importancia (importance matrix), con el embedding de tokens en Q6_K. Esta decision es funcional: el backend Hexagon calcula Q4_0 correctamente pero no soporta K-quants como Q4_K_M, de modo que esta build es la unica viable en dicha NPU. Ademas, la model card indica que hasta que el soporte de Dhir se fusione en llama.cpp upstream es necesario compilar desde la rama `dhir-support` del repositorio de ZenteiQ Research o usar binarios precompilados.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y diez lenguas de la India.
- Razonamiento y respuesta a instrucciones en el rango propio de un modelo de 2B parametros.
- Capacidades multilingues nativas para hindi, bengali, tamil, telugu, kannada, malayo, marati, gujarati, punyabi y oriya, ademas de ingles.
- Servidor compatible con la API de OpenAI mediante `llama-server`, con soporte de plantillas Jinja (`--jinja`).
- Ejecucion en CPU, GPU (CUDA, Vulkan), NPU Intel via OpenVINO y NPU Hexagon en Android.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistentes conversacionales en moviles Android: la build Q4_K_M de 1,3 GB cabe en memoria de un telefono de gama media y puede ejecutarse integramente en el dispositivo mediante llama.cpp, sin conexion a red ni coste de inferencia por token.
- Atencion al cliente en lenguas indic: el modelo puede gestionar conversaciones multi-turno en hindi, tamil o bengali con una ventana de 16.384 tokens, suficiente para incorporar el historial de la sesion y fragmentos de base de conocimiento.
- Traduccion y adaptacion linguistica local: util para normalizar o reformular texto entre ingles y las diez lenguas soportadas en entornos con conectividad limitada, como administraciones publicas o servicios de campo.
- Despliegue en portatiles sin GPU: la build Q8_0 (2,2 GB) se ejecuta en CPU con `-t` y `-tb` ajustados a los nucleos de rendimiento, adecuada para herramientas de escritorio de resumen o redaccion asistida.
- Aceleracion en hardware Intel: mediante el backend OpenVINO se puede dirigir la inferencia a la NPU Intel AI Boost de los Core Ultra o a GPUs Arc, lo que reduce el consumo energetico en equipos de sobremesa y portatiles empresariales.
- Procesamiento en chips embebidos y edge industrial: la variante `-imat-pure` de 1,2 GB esta pensada para NPU Hexagon y CPUs Arm, habilitando asistentes de voz o texto en dispositivos con memoria muy restringida.
- Servicio interno autohospedado: `llama-server` expone un endpoint compatible con OpenAI en el puerto 8080, lo que permite sustituir llamadas a APIs externas en prototipos y entornos con requisitos de soberania del dato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para Q4_K_M y 2,2 GB para Q8_0, incluyendo overhead del runtime; la variante `-imat-pure` ocupa 1,2 GB.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM puede alojar la build Q4_K_M con offload completo (`-ngl 99`); la Q8_0 requiere al menos 3-4 GB.
- GPU recomendadas: no se especifican modelos concretos; la model card documenta aceleracion via CUDA (NVIDIA), Vulkan (Intel Arc discreta e integrada) y OpenVINO (CPU, GPU Arc y NPU Intel AI Boost de Core Ultra).
- NPU: Snapdragon Hexagon en Android con la build `Q4_0-imat-pure`; Intel NPU en Core Ultra mediante `GGML_OPENVINO_DEVICE=NPU`.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-bench`) desde la rama `dhir-support` o binarios precompilados; no se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card sugiere usar `llama-bench -p 1024 -n 128 -r 3` para medirlos en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dhir-2B-GGUF | 2,03B | 16.384 | en + 10 indic | Apache 2.0 | GGUF |
| Dhir-5B-A1.7B-GGUF | 5B totales, 1,7B activos (MoE) | no disponible | en + indic | Apache 2.0 | GGUF |
| Dhir-2B (original) | 2,03B | 16.384 | en + 10 indic | Apache 2.0 | safetensors |

La comparativa mas directa es con el propio modelo base sin cuantizar y con la variante mayor de la familia, Dhir-5B-A1.7B, que segun la model card es mas potente y rapida en CPU que el 2B. No se dispone de datos de benchmarks que permitan comparar con modelos de otros autores de tamano equivalente.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero un modelo entrenado sobre corpus multilingues indic puede reproducir estereotipos regionales, de genero o de casta presentes en los datos.
- Riesgo de alucinacion inherente a un modelo de 2B parametros; no debe usarse como fuente de verdad sin verificacion en dominios factuales.
- La ventana de contexto esta limitada a 16.384 tokens; no se documenta comportamiento mas alla de esa longitud.
- La cobertura linguistica se restringe a ingles y diez lenguas indic; el rendimiento en otras lenguas no esta caracterizado.
- Requiere compilar llama.cpp desde la rama `dhir-support` mientras el soporte no se fusione en upstream, lo que anade friccion operativa y riesgo de divergencia con versiones futuras.
- La build Q4_K_M no es compatible con la NPU Hexagon; en ese hardware es obligatorio usar `Q4_0-imat-pure`.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento, no detalladas en la informacion disponible.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deberia asumirse su disponibilidad en produccion sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/Dhir-2B-GGUF
- Modelo base: https://huggingface.co/zenteiq-ai/Dhir-2B
- Variante mayor de la familia: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B-GGUF
- Sitio del autor: https://www.zenteiq.ai
- Ficha en AIKosh: https://aikosh.indiaai.gov.in/home/models/details/dhir_2b.html
- Rama de soporte de llama.cpp: https://github.com/zenteiq-research/llama.cpp
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Binarios precompilados de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Guia de compilacion Vulkan: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md#vulkan
- Guia del backend OpenVINO: https://github.com/ggml-org/llama.cpp/blob/master/docs/backend/OPENVINO.md#build-instructions
