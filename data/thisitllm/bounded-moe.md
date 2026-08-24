# THISITLLM/bounded-moe

## Resumen

`bounded-moe` no es un modelo de lenguaje en si mismo, sino un proyecto experimental de infraestructura de inferencia desarrollado por THISITLLM. Su objetivo es permitir la ejecucion de modelos MoE (Mixture-of-Experts) de gran tamano en hardware de consumo con memoria limitada, mediante almacenamiento de expertos respaldado por SSD y un cache de memoria acotado para llama.cpp/GGML. La idea central es que, en lugar de mantener todos los pesos de los expertos residentes en RAM, solo un subconjunto controlado (working set) permanece en memoria, mientras el resto se resuelve y carga desde disco bajo demanda segun el enrutamiento MoE.

El proyecto se encuentra en fase de prototipo de investigacion y no es un runtime de produccion. Se ha probado con una clase de modelo de aproximadamente 35B de parametros MoE con ~3B activos, en una NVIDIA RTX 4060 de 8 GB con 32 GB de RAM. La principal linea de trabajo actual es reducir la latencia de resolucion y almacenamiento, ya que la inferencia con mapeo de memoria convencional sigue siendo significativamente mas rapida que la ruta experimental respaldada por SSD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia experimental para modelos MoE (SSD-backed expert storage + bounded cache) |
| Parametros totales | no disponible (proyecto de runtime, no un modelo con pesos publicados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (depende del modelo GGUF objetivo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGML / GGUF (via llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura propuesta sigue una jerarquia de almacenamiento en tres niveles: **SSD → cache de expertos acotado → RAM/VRAM → computo**. El router MoE determina que expertos se necesitan para cada token; si el experto solicitado no esta en el cache, se resuelve y carga desde almacenamiento externo (SSD). El proyecto implementa trazado de enrutamiento MoE, almacenamiento externo de expertos, cache acotado con contabilidad de aciertos/fallos, ciclo de vida de pin/unpin de expertos, desalojo seguro de cache, lecturas directas de expertos e indireccion de resolucion.

No existe entrenamiento en el sentido clasico: no se publican pesos, dataset ni proceso de RLHF/DPO. Se trata de un runtime de inferencia que consume modelos GGUF existentes. La innovacion tecnica reside en la gestion de memoria: en lugar de tratar la RAM disponible como limite duro, se explota la localidad del enrutamiento MoE para mantener cerca del computo los expertos mas solicitados, mientras el resto permanece en disco.

## Capacidades

- Ejecucion de modelos MoE grandes en hardware de consumo con memoria limitada, manteniendo un working set de expertos acotado en RAM.
- Almacenamiento de pesos de expertos en SSD con carga bajo demanda segun el enrutamiento MoE.
- Cache de expertos con contabilidad de aciertos y fallos, y politicas de desalojo seguro.
- Ciclo de vida de expertos con operaciones de pin/unpin para control fino de residencia en memoria.
- Medicion de working set y uso de RAM durante la inferencia.
- Validacion de correccion y rendimiento de la ruta de inferencia respaldada por SSD.
- Compatibilidad con llama.cpp/GGML y CUDA para computo en GPU.

## Casos de uso

- **Inferencia local de modelos MoE grandes en equipos de consumo**: permite ejecutar modelos de ~35B con ~3B activos en una GPU de 8 GB y 32 GB de RAM, donde la residencia completa de todos los expertos en memoria seria inviable.
- **Investigacion en optimizacion de memoria para MoE**: el proyecto sirve como banco de pruebas para estudiar la localidad del enrutamiento MoE y disenar politicas de cache y prefetch.
- **Desarrollo de runtimes de inferencia con memoria acotada**: la infraestructura puede generalizarse a modelos densos mediante streaming de bloques o capas, abriendo la puerta a runtimes de memoria acotada para arquitecturas no MoE.
- **Evaluacion de estrategias de desalojo y cache**: los experimentos de cache-size y working-set permiten comparar politicas de reemplazo (LRU, prediccion de enrutamiento, etc.) en cargas reales.
- **Prototipado de sistemas de inferencia SSD-backed**: util para explorar el solapamiento de I/O de SSD con computo GPU, prefetch asincrono y reduccion de latencia de resolucion.
- **Educacion y experimentacion en ingenieria de inferencia**: el codigo y las notas de desarrollo documentan el proceso de construccion de un runtime de memoria acotada, util como referencia para estudiantes e investigadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el principal desafio actual es el rendimiento: la inferencia con mapeo de memoria convencional (memory-mapped) es significativamente mas rapida que la ruta experimental respaldada por SSD. No se proporcionan cifras de latencia, throughput ni comparativas cuantitativas.

## Requisitos de hardware

- **GPU de pruebas**: NVIDIA GeForce RTX 4060 de 8 GB VRAM.
- **RAM del sistema**: 32 GB.
- **SO**: Windows 11.
- **Runtime**: llama.cpp / GGML con soporte CUDA.
- **Almacenamiento**: SSD para el almacenamiento externo de expertos (el proyecto asume que el SSD es el nivel inferior de la jerarquia de memoria).
- **Clase de modelo objetivo**: ~35B parametros MoE con ~3B activos.
- **Opciones de despliegue**: no aplicable como runtime de produccion; es un prototipo de investigacion. No se menciona soporte para vLLM, Ollama ni TGI.
- **Latencia y throughput**: no disponibles; la model card reconoce que la ruta SSD-backed es mas lenta que la inferencia con mmap convencional.

## Comparativa con modelos similares

No existe un modelo comparable en el sentido de pesos publicados, ya que `bounded-moe` es un runtime experimental. En el ambito de runtimes de inferencia con memoria acotada y almacenamiento en disco, se identifican proyectos relacionados en la busqueda web:

| Proyecto | Enfoque | Estado |
|---|---|---|
| `bounded-moe` (THISITLLM) | Cache de expertos acotado + SSD-backed para llama.cpp/GGML | Prototipo experimental |
| `deepseek-v4-local` (CostanzoPadovano) | Streaming de expertos enrutados desde NVMe con buffers fijos en host hacia dos GPUs | Extension de llama.cpp, contexto operativo de 98.304 tokens |
| `tokenql` (eiomra) | Interfaz tipo SQL y runtime SSD-first con memoria acotada para MoE | Proyecto de investigacion |

Ninguno de estos proyectos publica pesos de modelo ni benchmarks comparativos. La comparativa se limita al enfoque arquitectonico: todos comparten la idea de no mantener el modelo completo en RAM y explotar el enrutamiento MoE para cargar solo los expertos necesarios.

## Limitaciones y advertencias

- **Estado experimental**: el repositorio se define como prototipo de ingenieria/investigacion, no como runtime de inferencia de produccion.
- **Rendimiento inferior**: la ruta SSD-backed es significativamente mas lenta que la inferencia con mapeo de memoria convencional; la reduccion de latencia es el principal problema abierto.
- **Sin pesos publicados**: no se distribuye ningun modelo; solo infraestructura de runtime y experimentos.
- **Licencia no especificada**: no se indica licencia en la model card, lo que impide conocer restricciones de uso comercial o redistribucion.
- **Sin benchmarks**: no hay datos de rendimiento, calidad ni comparativas con otros runtimes.
- **Hardware limitado**: las pruebas se han realizado en un unico equipo (RTX 4060 8 GB, 32 GB RAM, Windows 11); no hay datos de escalabilidad a otros entornos.
- **Riesgo de perdida de datos en cache**: las politicas de desalojo y el ciclo de vida pin/unpin requieren validacion adicional antes de uso en produccion.
- **Sin soporte de contexto largo verificado**: no se han publicado pruebas con contextos extensos; el proyecto menciona pruebas de contexto mayor como trabajo futuro.

## Enlaces

- HuggingFace: https://huggingface.co/THISITLLM/bounded-moe
- Repositorio GitHub: https://github.com/kornpaksittikool-beep/bounded-moe
- Proyecto relacionado (deepseek-v4-local): https://github.com/CostanzoPadovano/deepseek-v4-local
- Proyecto relacionado (tokenql): https://github.com/eiomra/tokenql
