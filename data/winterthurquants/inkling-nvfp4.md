# winterthurquants/Inkling-NVFP4

## Resumen

Inkling-NVFP4 es la version cuantizada a NVFP4 (4 bits en coma flotante) del modelo multimodal Inkling, desarrollado por Thinking Machines Lab. La ficha que nos ocupa, winterthurquants/Inkling-NVFP4, es una republicacion comunitaria de esos pesos; la publicacion oficial de referencia es thinkingmachines/Inkling-NVFP4 y el modelo base en precision completa es thinkingmachines/Inkling. Se trata de un transformer decoder-only de 66 capas con backbone de mezcla de expertos (MoE) dispersa: 975.000 millones de parametros totales y 41.000 millones activos por token, que acepta texto, imagen y audio y genera texto.

El modelo cubre tareas generales de lenguaje, razonamiento, codigo y uso de herramientas, con procesamiento conjunto de imagenes, video y audio en un mismo espacio latente. Su relevancia actual reside en dos factores: por un lado, publica pesos abiertos bajo licencia Apache 2.0 en una escala que hasta hace poco solo era accesible por API; por otro, la cuantizacion NVFP4 reduce el repositorio a unos 592 GB, lo que hace viable el autohospedaje en nodos multi-GPU de gama alta.

Los metadatos de safetensors del repositorio declaran 552.845.034.562 parametros, una cifra que no coincide con los 975.000 millones de la model card; conviene tener presente esa discrepancia. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 66 capas con MoE disperso (6 de 256 expertos por token + 2 expertos compartidos siempre activos) y atencion hibrida de capas locales y globales; multimodal nativo |
| Parametros totales | 975.000 millones segun la model card; 552.845.034.562 segun los metadatos de safetensors del repositorio |
| Parametros activos | 41.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (esta publicacion, 4 bits); BF16 en el modelo base |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas; lista detallada no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato basado en pixeles, idealmente entre 40 px y 4096 px por dimension) y audio (WAV a 16 kHz, idealmente menos de 20 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Tamano del repositorio | 592,0 GB |

## Arquitectura y entrenamiento

Inkling es un transformer autorregresivo multimodal de 66 capas con un backbone feed-forward de mezcla de expertos dispersa: cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que permanecen activos en todos los tokens. La atencion combina capas locales y globales. El modelo es multimodal de forma nativa: las imagenes y el video se codifican mediante un codificador jerarquico de parches y el audio mediante codificacion en tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente en el decoder. Soporta dos formatos numericos, BF16 y NVFP4, siendo NVFP4 el empleado en esta publicacion.

Los datos de entrenamiento abarcan texto, imagenes, audio y video, procedentes de fuentes publicas, de terceros y de generacion o aumento sintetico, con procesos de limpieza, deduplicacion y filtrado para eliminar contenido de baja calidad y atender objetivos de seguridad. La model card no detalla el numero de tokens ni si hubo fases de RLHF o DPO; una fuente externa (Doubleword) cifra el entrenamiento en mas de 45 billones de tokens, dato no confirmado en la documentacion oficial. Tampoco se documentan innovaciones de decodificacion como decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y otros idiomas, con soporte de seguimiento de instrucciones.
- Razonamiento complejo: 29,7 % en HLE sin herramientas y 46,0 % con herramientas; 97,1 % en AIME 2026.
- Matematicas y problemas cientificos: 87,2 % en GPQA Diamond.
- Codigo y agentes de software: 77,6 % en SWE-bench Verified y 54,3 % en SWE-bench Pro (publico).
- Uso de herramientas y function calling, con ganancia medida al pasar de HLE sin herramientas a HLE con herramientas.
- Flujos agenticos multi-paso orientados a edicion de codigo y resolucion de incidencias.
- Vision: entrada de imagenes en cualquier formato de pixeles, con resolucion optima entre 40 px y 4096 px por dimension.
- Video: codificacion mediante el mismo codificador jerarquico de parches empleado para imagenes.
- Audio: entrada WAV a 16 kHz con duraciones de hasta 20 minutos para un rendimiento optimo.
- Integracion con librerias de despliegue y entrenamiento: SGLang, vLLM, TokenSpeed, Unsloth y transformers, ademas de acceso via API y playground de Tinker.
- Compatibilidad declarada con endpoints de Hugging Face (etiqueta endpoints_compatible).

## Casos de uso

- Agentes de resolucion de incidencias de software: con un 77,6 % en SWE-bench Verified y 54,3 % en SWE-bench Pro, el modelo puede integrarse en pipelines de CI/CD para localizar el fallo, proponer un parche y validarlo mediante tool calling contra el repositorio.
- Asistentes de programacion autohospedados: al liberar pesos en Apache 2.0 y ejecutarse con vLLM o SGLang, permite construir un asistente de codigo en infraestructura propia sin enviar codigo propietario a APIs externas.
- Atencion al cliente multimodal: la combinacion de texto, imagen y audio en una misma conversacion permite al usuario enviar una captura de pantalla o una nota de voz y recibir una respuesta coherente con el historial completo.
- RAG sobre documentacion tecnica: el modelo procesa texto e imagenes de forma conjunta, de manera que puede razonar sobre diagramas, capturas y tablas ademas de sobre el texto recuperado por el buscador vectorial.
- Analisis de reuniones y material audiovisual: la entrada de audio WAV a 16 kHz con soporte de hasta 20 minutos permite transcribir, resumir y extraer acciones sin encadenar un modelo ASR independiente.
- Revision automatizada de contenido visual: el codificador de parches admite resoluciones de hasta 4096 px por dimension, lo que sirve para inspeccionar planos, capturas de interfaz o documentacion escaneada y emitir informes estructurados.
- Razonamiento matematico asistido por herramientas: con un 97,1 % en AIME 2026 y capacidad de llamada a funciones, encaja en asistentes de calculo que delegan la aritmetica exacta en un interprete externo.
- Ajuste fino e investigacion: el modelo se distribuye con pesos abiertos y recetas para Unsloth y Tinker Cookbook, lo que facilita tareas de fine-tuning y experimentacion academica en un modelo de escala fronteriza.

## Benchmarks y rendimiento

Resultados reportados en la model card con effort=0,99; las puntuaciones de comparacion se generaron el 14 de julio de 2026. Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son modelos de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados.

Razonamiento:

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (solo texto) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| HLE (con herramientas) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | no disponible | 99,9 % |
| GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |

Agentico (codigo):

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| SWE-bench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | no disponible | 80,6 % | 80,6 % | 95,0 % | no disponible |
| SWE-bench Pro (publico) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | no disponible (informacion truncada en la fuente) | no disponible (informacion truncada) | no disponible (informacion truncada) | no disponible (informacion truncada) |

No se han publicado en la informacion disponible resultados especificos del repositorio cuantizado en NVFP4; las cifras anteriores corresponden al modelo completo.

## Requisitos de hardware

- Pesos en NVFP4: el repositorio ocupa 592,0 GB, por lo que se necesita del orden de 600 GB de VRAM solo para los pesos (estimacion a partir del tamano real del repositorio).
- VRAM total estimada para NVFP4: aproximadamente 650-700 GB incluyendo cache KV y activaciones para contexto moderado; no disponible la cifra oficial.
- BF16: 975.000 millones de parametros a 2 bytes por parametro suponen unos 1,95 TB solo en pesos (estimacion), lo que exige un nodo multi-GPU de gran escala o descartar esa precision.
- Configuraciones recomendadas: 4x B200 (768 GB) como minimo para NVFP4 y 8x B200 o 8x H200 (1128-1536 GB) para operar con margen de contexto y concurrencia. Ocho H100 de 80 GB (640 GB) quedan por debajo del tamano de los pesos y son inviables sin agregacion adicional.
- GPUs de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB), ni siquiera con las cuantizaciones mas agresivas. No hay versiones GGUF publicadas en la informacion disponible que permitan offload a CPU o NVMe.
- Soporte de formato: NVFP4 esta pensado para GPUs con soporte nativo de FP4 (generacion Blackwell y posteriores); en generaciones anteriores la descompresion se realiza por software.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y transformers, con recetas publicadas para cada una; tambien acceso gestionado via el playground y la API de Tinker, y a traves de proveedores de inferencia de terceros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | HLE (solo texto) | SWE-bench Verified |
|---|---|---|---|---|---|---|
| Inkling (este modelo) | 975.000 millones | 41.000 millones | no disponible | apache-2.0 | 29,7 % | 77,6 % |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | no disponible (pesos abiertos) | 26,6 % | 70,7 % |
| Kimi K2.6 | no disponible | no disponible | no disponible | no disponible (pesos abiertos) | 35,9 % | 80,2 % |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | no disponible (pesos abiertos) | 35,9 % | 80,6 % |
| Gemini 3.1 Pro (high) | no disponible | no disponible | no disponible | propietaria | 44,7 % | 80,6 % |

En el subconjunto de benchmarks publicados, Inkling queda por debajo de Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro en razonamiento de alta dificultad (HLE), mientras que en tareas de codigo agentico se sitúa en un rango cercano a los pesos abiertos de referencia. La ventaja diferencial del modelo no es el liderazgo en puntuaciones, sino la combinacion de escala fronteriza, multimodalidad nativa (texto, imagen, audio y video) y licencia Apache 2.0. No hay datos publicados sobre el numero de parametros ni la longitud de contexto de los modelos comparados.

## Limitaciones y advertencias

- Sesgos: no se han publicado analisis de sesgo en la informacion disponible. El entrenamiento a partir de contenido de internet y de terceros hace probable la presencia de sesgos, pero no hay mediciones que los cuantifiquen.
- Alucinacion: el modelo falla en el 70,3 % de las preguntas de HLE sin herramientas y en el 54,0 % con herramientas, lo que indica un riesgo de respuesta erronea no despreciable en razonamiento de alta dificultad. No hay datos de alucinacion en tareas abiertas.
- Contexto: la longitud de contexto no aparece en la informacion disponible, por lo que no puede planificarse el dimensionamiento de memoria ni el troceado de documentos sin verificar la documentacion oficial.
- Idioma: el modelo esta orientado al ingles, con capacidades multilingues generales no cuantificadas. No se garantiza un rendimiento equivalente en castellano.
- Limites de entrada: las imagenes rinden mejor entre 40 px y 4096 px por dimension y el audio en WAV a 16 kHz con menos de 20 minutos de duracion; fuera de esos rangos el rendimiento puede degradarse.
- Licencia: los pesos se publican bajo Apache 2.0, pero la version original enlaza una politica de uso aceptable (Acceptable Use) que puede imponer condiciones adicionales al uso comercial. Conviene revisarla antes de desplegar en produccion.
- Procedencia de esta copia: winterthurquants/Inkling-NVFP4 es una republicacion de terceros con 0 descargas y 0 likes en el momento del analisis. Para uso en produccion es preferible descargar los pesos oficiales desde thinkingmachines/Inkling-NVFP4 y verificar la integridad de los ficheros.
- Inconsistencia de metadatos: la etiqueta del repositorio incluye "8-bit" pese a que el nombre y el contenido apuntan a NVFP4; ademas, el recuento de parametros de safetensors (552.845.034.562) no coincide con los 975.000 millones de la model card.
- Hardware: el modelo no es ejecutable en GPUs de consumo ni en nodos de 8x H100; requiere infraestructura multi-GPU con GPUs de 141-192 GB, lo que limita su adopcion a equipos con presupuesto elevado.
- No hay versiones GGUF ni cuantizaciones de menor precision publicadas en la informacion disponible, lo que impide escenarios de offload a CPU o disco.

## Enlaces

- Repositorio analizado: https://huggingface.co/winterthurquants/Inkling-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling
- Version oficial NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Otra republicacion NVFP4: https://huggingface.co/fribourgquant/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentacion de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Ficha en Doubleword: https://doubleword.ai/models/inkling-nvfp4
- Ficha en Dell Enterprise Hub: https://dell.huggingface.co/models/thinkingmachines/Inkling-NVFP4
- Ficha en Lambda: https://lambda.ai/inference-models/thinkingmachines/inkling-nvfp4
