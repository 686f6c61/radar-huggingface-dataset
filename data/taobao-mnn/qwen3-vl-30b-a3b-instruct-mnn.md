# taobao-mnn/Qwen3-VL-30B-A3B-Instruct-MNN

## Resumen

Qwen3-VL-30B-A3B-Instruct-MNN es un paquete de inferencia cuantizado en 4 bits (HQQ) del checkpoint Qwen/Qwen3-VL-30B-A3B-Instruct, convertido al formato del motor MNN de Alibaba por el equipo taobao-mnn. No se trata de un modelo nuevo ni de un fine-tune: es una redistribucion optimizada para ejecucion local del modelo vision-lenguaje de Qwen, orientada a despliegues en CPU y dispositivos con recursos limitados mediante el runtime MNN.

El modelo subyacente es un transformer de tipo Mixture-of-Experts (MoE) con 30 mil millones de parametros totales y aproximadamente 3 mil millones activos por token (8 expertos enrutados de 128, 48 capas). Incluye codificador de vision y modelo de texto, y cubre comprension de imagen, OCR, codigo visual, percepcion espacial, tareas de agente visual, contexto largo y comprension de video.

Su relevancia actual radica en que permite ejecutar un VLM MoE de 30B en infraestructura modesta gracias a la cuantizacion HQQ 4-bit con grupo de 64 y escalas FP16, manteniendo los embeddings en BF16. La licencia Apache 2.0 del checkpoint original facilita su uso comercial, aunque las capacidades y benchmarks del modelo original no deben confundirse con las verificaciones funcionales (smoke tests) que documenta este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con codificador de vision |
| Parametros totales | 30B (30 mil millones) |
| Parametros activos | ~3B por token (8 de 128 expertos enrutados) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit, grupo 64, escalas FP16; embeddings en BF16; pesos lineales del modelo de texto en 4-bit |
| Idiomas soportados | en (segun la model card; el modelo original Qwen3-VL es multilingue, pero este paquete declara solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (pesos convertidos con MNNConvert; tokenizer en formato .mtok); repo de 37,4 GB |
| Capas | 48 |
| Entradas / salidas | Texto e imagenes -> texto |
| Revision MNN | 7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4 |

## Arquitectura y entrenamiento

La arquitectura corresponde al checkpoint Qwen3-VL-30B-A3B-Instruct: un transformer MoE con 48 capas, 128 expertos enrutados y 8 expertos seleccionados por token, lo que da lugar a unos 3B parametros activos sobre un total de 30B. El paquete incluye tanto el modelo de texto como el codificador de vision, de modo que acepta entradas multimodales (texto e imagenes) y produce texto. La cuantizacion aplicada es HQQ (Half-Quadratic Quantization) de 4 bits con tamano de grupo 64 y escalas en FP16 sobre las capas lineales del modelo de texto, mientras que los embeddings de tokens se almacenan en BF16 como pesos separados.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original; esos datos pertenecen a la model card upstream de Qwen y no se reproducen aqui. La innovacion tecnica de este paquete es la conversion y el empaquetado para el runtime MNN, incluyendo correcciones de exportacion MoE en la revision indicada y la posibilidad de reexportar con argumentos HQQ equivalentes (`--quant_bit 4 --quant_block 64 --scale_bit 16 --embed_bit 16`). El proceso de migracion supero 10 casos smoke en CPU (modos High y Low), que son comprobaciones funcionales y no benchmarks amplios de calidad ni de GPU.

## Capacidades

- Generacion de texto y razonamiento a partir de entradas de texto e imagen.
- Comprension de imagen y OCR, segun las capacidades del checkpoint original.
- Codigo visual y percepcion espacial (tareas que combinan imagen y generacion de codigo o interpretacion de layout).
- Tareas de agente visual y razonamiento multi-paso, segun la descripcion upstream.
- Comprension de contexto largo y de video (capacidades del modelo original Qwen3-VL).
- Soporte de plantilla de chat (jinja/use_template incluidos en la configuracion del paquete).
- Capacidades multilingues del modelo original no verificadas en este paquete; la model card declara unicamente ingles.

## Casos de uso

- Extraccion de datos de documentos escaneados: el modelo puede procesar imagenes de facturas, formularios o tickets y devolver texto estructurado, aprovechando sus capacidades de OCR y su codificador de vision integrado en el paquete MNN.
- Automatizacion de soporte con capturas de pantalla: un agente puede recibir una imagen de la interfaz de usuario y describir el estado o el error, util para triaje de incidencias en escritorio.
- Generacion de codigo a partir de mockups: dado un diseno visual, el modelo puede producir HTML/CSS o componentes, explotando la capacidad de codigo visual del checkpoint original.
- Analisis de video para resumenes: en pipelines donde se muestrean fotogramas, el modelo puede describir secuencias y responder preguntas sobre el contenido, segun las capacidades de comprension de video del modelo base.
- Despliegue en CPU y entornos sin GPU: gracias a la cuantizacion HQQ 4-bit y al runtime MNN, es viable ejecutar el modelo en servidores Linux sin acelerador dedicado, con compilacion habilitando `MNN_LOW_MEMORY` y `MNN_BUILD_LLM_OMNI`.
- Pruebas de integracion en CI: los scripts de descarga, conversion y ejecucion (`llm_demo`, `llm_bench`) permiten incorporar verificaciones funcionales del modelo a pipelines de validacion.
- Prototipado de agentes visuales en local: util para equipos que necesitan evaluar comportamiento multimodal sin depender de APIs en la nube, manteniendo los pesos en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona 10 casos smoke funcionales en CPU (modos High y Low) superados durante la migracion, sin cifras de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 37,4 GB; la inferencia en MNN puede ejecutarse en CPU con memoria del sistema, aunque no se especifica el pico de RAM necesario.
- GPU recomendadas: no disponible en la informacion proporcionada; el paquete esta orientado principalmente a ejecucion en CPU mediante MNN.
- Compatibilidad con GPU de consumo: no confirmada; el empaquetado y las instrucciones de compilacion se centran en builds Linux CPU.
- Opciones de despliegue: runtime MNN (compilacion propia desde el repositorio de Alibaba en la revision indicada), con binarios `llm_demo` y `llm_bench`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles; solo se indica que se superaron pruebas smoke en CPU, sin metricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-30B-A3B-Instruct-MNN (este) | 30B totales, ~3B activos | no disponible | Apache 2.0 | MNN, HQQ 4-bit | Paquete de inferencia para MNN, orientado a CPU |
| Qwen/Qwen3-VL-30B-A3B-Instruct | 30B totales, ~3B activos | no disponible | Apache 2.0 | Safetensors (BF16) | Checkpoint original; requiere mas memoria |
| Otros VLM MoE de rango 30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion HQQ 4-bit puede degradar la calidad respecto al checkpoint BF16 original; no se han publicado evaluaciones comparativas de calidad.
- Los 10 casos smoke documentados son comprobaciones funcionales, no una validacion amplia de robustez ni de precision.
- La model card declara solo ingles; el multilingueismo del modelo original no esta verificado en este paquete.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en OCR de imagenes de baja calidad o en tareas de percepcion espacial.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada; se heredan los del checkpoint original.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar la atribucion y los avisos del modelo upstream.
- El paquete depende de una revision concreta de MNN; cambios de version pueden romper la compatibilidad de pesos y configuracion.
- No se documenta soporte para GPUs ni para runtimes alternativos (vLLM, llama.cpp, etc.), lo que limita las opciones de escalado.
- El proceso de reexportacion requiere preservar offsets de pesos, tokenizer y plantilla; un reexport incorrecto puede producir resultados invalidos.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/taobao-mnn/Qwen3-VL-30B-A3B-Instruct-MNN
- Modelo original: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Repositorio MNN: https://github.com/alibaba/MNN
- Revision MNN usada: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentacion MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
