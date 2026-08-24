# zrlu/Huihui-Qwen3.8-27B-abliterated-GPTQ-Int4-sym-G128-MTP-BF16-B70

## Resumen

Este modelo es una cuantización GPTQ-INT4 del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva del modelo multimodal denso Qwen3.8-27B de Alibaba. La cuantización ha sido realizada por el usuario zrlu con el objetivo específico de ejecutar el modelo en una única GPU Intel Arc Pro B70 (Xe2, Battlemage) mediante vLLM XPU en entornos Windows Docker Desktop + WSL2. El resultado es un checkpoint de 19,6 GB que reduce el peso original BF16 (51,75 GB) en un 64,8 %, manteniendo los cabezales MTP (speculative decoding) en BF16 para preservar la funcionalidad de decodificación especulativa.

La relevancia de este modelo radica en que permite desplegar un LLM multimodal de 27B parámetros en hardware de gama media (GPU de 24 GB) con un rendimiento de inferencia notable (53–59 tok/s en decodificación) y soporte para agentes y tool calling. Al estar basado en Apache-2.0, hereda una licencia permisiva que facilita su uso comercial. La abliteración aplicada sobre las capas 18–51 elimina los mecanismos de rechazo del modelo original, lo que lo convierte en una opción "uncensored" para casos de uso que requieren generación sin restricciones temáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso multimodal) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (la configuracion de vLLM menciona pools de 2×100k tokens) |
| Tipos de cuantizacion | GPTQ-INT4 (sym, group_size=128, desc_act=false); MTP en BF16 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal (procesa texto e imagenes) desarrollado por el equipo Qwen de Alibaba. La variante abliterated de huihui-ai aplica una tecnica de ablacion de capas (concretamente las capas 18–51) para eliminar los comportamientos de rechazo o censura del modelo original, manteniendo intactos los componentes de vision y los cabezales MTP. La cuantizacion GPTQ-INT4 se realizo con la herramienta `gptqmodel==7.3.2` sobre una GPU RTX 5090, utilizando calibracion con wikitext-2. El proceso preserva los tensores `mtp.*` en BF16 para habilitar la decodificacion especulativa (MTP4) en vLLM. No se proporcionan detalles sobre el entrenamiento original del modelo base (numero de tokens, dataset, metodos de alineacion).

## Capacidades

- Generacion de texto y razonamiento en ingles y chino.
- Procesamiento multimodal: entrada de imagenes junto con texto (etiquetado como image-text-to-text).
- Soporte de tool calling / function calling mediante el parser XML `qwen3_xml` en vLLM.
- Capacidades de agente: disenado para cargas de trabajo de agentes (pi/opencode) con razonamiento multi-paso.
- Decodificacion especulativa MTP (Multi-Token Prediction) con tasa de aceptacion del 48–54 %.
- Generacion de codigo y automatizacion de oficina, segun las capacidades del modelo base.
- Comportamiento "uncensored" gracias a la abliteracion (sin rechazos tematicos).

## Casos de uso

- Inferencia local en GPU de gama media: el modelo esta optimizado para una unica Intel Arc Pro B70 (24 GB VRAM), permitiendo ejecutar un LLM de 27B en hardware de bajo coste con vLLM XPU.
- Agentes autonomos (pi/opencode): su soporte para tool calling y razonamiento multi-paso lo hace adecuado para agentes que interactuan con APIs, ejecutan comandos o gestionan flujos de trabajo complejos.
- Generacion de contenido sin restricciones: al estar abliterated, puede utilizarse en aplicaciones creativas o de investigacion donde se requiera explorar temas sensibles sin filtros de seguridad.
- Asistente de codigo en entornos de desarrollo: con capacidades de generacion de codigo y contexto largo, puede integrarse en IDEs o pipelines de CI/CD para autocompletado y revision de codigo.
- Analisis de documentos multimodales: al aceptar imagenes, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con texto para extraer informacion.
- Despliegue en contenedores Docker: el autor proporciona una imagen Docker de un solo clic (`zrlu/qwen38-27b-b70:2026.08.24`) que facilita la puesta en produccion en entornos Windows/WSL2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de rendimiento de inferencia en la GPU objetivo:

| Metrica | Valor |
|---|---|
| Decodificacion (p512/g128) | 53–59 tok/s |
| Decodificacion concurrente (N=4) | 141–173 tok/s |
| Tasa de aceptacion MTP | 48–54 % |
| Pool de KV (8.8 GiB) | ~206k tokens (2×100k contexto) |

## Requisitos de hardware

- VRAM estimada: al menos 24 GB (el checkpoint pesa 19,6 GB, mas overhead de KV cache y activaciones). Probado en Intel Arc Pro B70 (24 GB) y RTX 5090 (solo para cuantizacion).
- GPU recomendadas: Intel Arc Pro B70 (Xe2, Battlemage) con vLLM XPU; tambien compatible con GPUs NVIDIA via CUDA (aunque no se ha probado).
- No cabe en GPUs de consumo de 8–12 GB; requiere tarjetas con 24 GB o mas.
- Opciones de despliegue: vLLM XPU (version especifica `0.27.2rc1.dev77+gac7509e2b`), transformers con `device_map="auto"`, contenedor Docker oficial.
- Latencia y throughput: 53–59 tok/s en decodificacion secuencial; 141–173 tok/s agregados con 4 peticiones concurrentes.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otras cuantizaciones del mismo modelo base. Como referencia, se puede comparar con la version BF16 original (51,75 GB) que requiere al menos 64 GB de VRAM, mientras que esta cuantizacion reduce el peso a 19,6 GB. Otras cuantizaciones como AWQ o GGUF podrian ofrecer alternativas, pero no hay datos concretos en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un modelo abliterated, puede generar contenido inapropiado, ofensivo o sesgado sin filtros de seguridad. No es recomendable para aplicaciones de cara al publico sin moderacion adicional.
- Solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantizacion INT4 puede degradar ligeramente la precision en tareas complejas de razonamiento o generacion de codigo en comparacion con la version BF16.
- La funcionalidad MTP requiere una version especifica de vLLM XPU y una configuracion particular (draft-INT4 overlay); no funcionara con versiones estandar de vLLM.
- El modelo base Qwen3.8-27B es multimodal, pero la cuantizacion no ha sido validada para tareas de vision en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribucion y las condiciones de la licencia.

## Enlaces

- Modelo cuantizado: https://huggingface.co/zrlu/Huihui-Qwen3.8-27B-abliterated-GPTQ-Int4-sym-G128-MTP-BF16-B70
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del autor: https://github.com/zrlu/qwen38-27b-arc-pro-b70
- Imagen Docker: `zrlu/qwen38-27b-b70:2026.08.24` en Docker Hub
- Pagina del modelo en LLM Explorer: https://llm-explorer.com/model/huihui-ai%2FHuihui-Qwen3.8-27B-abliterated,7yiXfSP5itojtujYtkbmXj
- Version en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated:27b
