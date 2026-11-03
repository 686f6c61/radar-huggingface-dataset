# tixiren/MiniCPM5-2B-webyIQ

## Resumen

MiniCPM5-2B-webyIQ es una conversion del modelo openbmb/MiniCPM5-2B (desarrollado por OpenBMB) a un formato cuantizado en int4 GPTQ especificamente empaquetado para webyIQ, un motor de inferencia de LLM especializado que se ejecuta en el navegador sobre WebGPU, escrito en Rust con kernels WGSL escritos a mano. El autor de la conversion es el usuario tixiren, y el resultado se distribuye bajo licencia Apache-2.0, la misma del modelo original.

El modelo resuelve un problema concreto: llevar un LLM de aproximadamente 2.000 millones de parametros a un navegador web con un consumo de memoria reducido (1,47 GiB en fragmentos de como maximo 128 MB) y una latencia utilizable (31 ms hasta el primer token y unos 280 tok/s de generacion en una RTX 5080 con Chrome). No es un checkpoint compatible con transformers ni con llama.cpp: solo lo carga el runtime propio de webyIQ.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de despliegue (cuantizacion GPTQ asimetrica int4 con grupo 32 y escalas en f16, mas embeddings int4 RTN con busqueda de clip) orientada a WebGPU. Por otro, advierte de que el artefacto no es portable fuera de su motor: quien necesite el modelo base en formatos estandar debe acudir al repositorio original de OpenBMB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base openbmb/MiniCPM5-2B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | Aproximadamente 2.000 millones (por el nombre del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 GPTQ asimetrica, grupo 32, escala y min en f16; embedding int4 RTN con busqueda de clip |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Shards propietarios de webyIQ (maximo 128 MB por fragmento) mas `manifest.json`; no compatible con safetensors, GGUF ni transformers |
| Tamano del repositorio | 1,6 GB (1,47 GiB de pesos) |
| Motor de inferencia | webyIQ (Rust + WGSL sobre WebGPU) |
| Calibracion | WikiText-2 train |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base openbmb/MiniCPM5-2B, un transformer de aproximadamente 2.000 millones de parametros. La informacion proporcionada no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni la composicion del dataset de preentrenamiento, por lo que esos datos deben consultarse en la model card del modelo original.

La innovacion tecnica de esta version reside en el pipeline de cuantizacion y despliegue. Los pesos se cuantizan a int4 de forma asimetrica con GPTQ, usando grupos de 32 elementos y escalas y minimos en f16, calibrando sobre el split de entrenamiento de WikiText-2. El embedding se cuantiza aparte con RTN int4 y busqueda de clip. El resultado se fragmenta en shards de como maximo 128 MB acompanados de un `manifest.json`, y se ejecuta con activaciones int8 en el motor webyIQ, que implementa los kernels de atencion y matmul directamente en WGSL para WebGPU. No se menciona RLHF, DPO ni decodificacion especulativa en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en el navegador mediante WebGPU, con un rendimiento medido de unos 280 tok/s en una RTX 5080 bajo Chrome.
- Hereda las capacidades del modelo base MiniCPM5-2B, aunque la informacion proporcionada no detalla cuales son (razonamiento, codigo, matematicas, vision, tool calling, agentes o modo thinking no se confirman en esta ficha).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Ejecucion local en el cliente sin servidor: el modelo se carga y se infiere integramente en el navegador del usuario.
- Soporte de prompts de hasta al menos 128 tokens verificado en la medicion de latencia (primer token en 31 ms); el limite maximo de contexto no se especifica.

## Casos de uso

- Demos interactivas de LLM en navegador: el modelo puede cargarse desde una pagina web estatica y ejecutarse en la GPU del visitante, eliminando la necesidad de backend y reduciendo costes de infraestructura. Es adecuado por su tamano reducido (1,47 GiB) y su motor WebGPU.
- Asistentes embebidos en aplicaciones web con privacidad por diseno: al no enviar datos a un servidor, encaja en escenarios donde el texto del usuario no debe salir del dispositivo, como herramientas internas de empresas o aplicaciones educativas.
- Prototipado rapido de productos de IA sin infraestructura: un equipo puede validar una experiencia conversacional desplegando solo HTML y JavaScript, usando el modelo como motor de generacion.
- Educacion y experimentacion con cuantizacion: el repositorio sirve como referencia practica de GPTQ int4 con grupo 32 y embeddings RTN para quienes investigan tecnicas de compresion orientadas a WebGPU.
- Generacion de texto offline en equipos de escritorio con GPU consumer: el modelo puede ejecutarse en una RTX 5080 (y presumiblemente en GPUs de gama similar) sin conexion, para tareas de redaccion o resumen de documentos cortos.
- Benchmarking de motores WebGPU: util como carga de trabajo de referencia para comparar el rendimiento de webyIQ frente a otras implementaciones de inferencia en navegador.

## Benchmarks y rendimiento

| Metrica | int4 webyIQ | bf16 (referencia) |
|---|---|---|
| Perplejidad WikiText-2 | 21,83 | 21,23 |
| Perplejidad C4 | 26,70 | 25,76 |
| Primer token (Chrome, RTX 5080, prompt de 128 tokens) | 31 ms | No disponible |
| Throughput de generacion (Chrome, RTX 5080) | ~280 tok/s | No disponible |

Las perplejidades se midieron con 8 secuencias de 512 tokens y activaciones int8 en el motor webyIQ. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 1,47 GiB en int4; con activaciones int8 y buffers de trabajo, se puede estimar un consumo en torno a 2 GB, aunque la cifra exacta no esta publicada.
- GPU recomendadas: el rendimiento reportado corresponde a una RTX 5080; no se han publicado mediciones en otras GPU.
- GPU consumer: si, el modelo cabe holgadamente en cualquier GPU consumer moderna con soporte WebGPU (por ejemplo, gama RTX 30/40/50 o equivalentes AMD), aunque solo hay datos de rendimiento para la RTX 5080.
- Navegador: Chrome con WebGPU habilitado; el motor es webyIQ (`web/lib/webyiq.js`).
- Opciones de despliegue: exclusivamente webyIQ. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propietario.
- Latencia y throughput: 31 ms hasta el primer token y aproximadamente 280 tok/s de generacion en el entorno medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / motor |
|---|---|---|---|---|---|
| MiniCPM5-2B-webyIQ | ~2B | No disponible | int4 GPTQ (grupo 32) | Apache-2.0 | webyIQ (WebGPU) |
| openbmb/MiniCPM5-2B | ~2B | No disponible | bf16 y otras (no detalladas) | Apache-2.0 | transformers y ecosistema estandar |
| Alternativas de ~2B para navegador | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo con alternativas; la unica comparacion publicada es la perplejidad frente al propio modelo base en bf16.

## Limitaciones y advertencias

- El artefacto no es un checkpoint estandar: no funciona con transformers, llama.cpp, Ollama, vLLM ni TGI. Solo lo carga el runtime webyIQ.
- La cuantizacion int4 introduce una degradacion medible: la perplejidad sube de 21,23 a 21,83 en WikiText-2 y de 25,76 a 26,70 en C4 respecto a bf16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni validacion independiente.
- El autor es un usuario individual (tixiren) y no OpenBMB; la calidad del proceso de conversion no ha sido auditada por terceros.
- No se especifican los idiomas soportados ni la longitud de contexto del modelo base en la informacion disponible; conviene consultar la model card original antes de usarlo en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero inherentes a un modelo de ~2B.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener la atribucion a OpenBMB como autor del modelo original.
- El rendimiento reportado depende de una GPU concreta (RTX 5080) y de Chrome; en hardware mas modesto la latencia y el throughput pueden degradarse de forma significativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tixiren/MiniCPM5-2B-webyIQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Motor webyIQ (GitHub): https://github.com/rtx527896828/webyIQ
- Demo online: https://rtx527896828.github.io/webyIQ/
