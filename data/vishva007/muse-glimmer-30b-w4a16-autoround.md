# Vishva007/Muse-Glimmer-30B-W4A16-AutoRound

## Resumen

Muse-Glimmer-30B-W4A16-AutoRound es una cuantizacion de 4 bits del modelo multimodal Muse Glimmer 30B, desarrollado por Meta Superintelligence Lab y publicado en el repositorio de Vishva007. El modelo base es un transformer causal de aproximadamente 30.000 millones de parametros con un codificador de percepcion visual ViT-G/14 de unos 1.800 millones de parametros, destilado de Muse Spark y disenado especificamente para tareas agenticas autonomas en hardware de consumo. Esta version comprime los pesos del modulo de lenguaje a W4A16 manteniendo el codificador visual en BF16 para no degradar la alineacion vision-lenguaje.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal con capacidades agenticas y de tool calling en entornos de 24 o 32 GB de VRAM, algo impracticable con los pesos en BF16. La cuantizacion se realizo con Intel AutoRound (grupo de 64, simetrica, 512 muestras de calibracion, 800 iteraciones, longitud de secuencia 2048) y se distribuye tanto en formato AutoRound como en AutoGPTQ.

Un dato importante: aunque la nomenclatura comercial habla de "30B", el recuento real de parametros del checkpoint en safetensors es de 4.612.899.840, lo que sugiere que el repositorio contiene unicamente un subconjunto de los pesos del modelo base (probablemente los modulos cuantizados) y requiere componentes adicionales del modelo original para funcionar. El repositorio pesa 22,8 GB y acumula 46 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (LLM + codificador visual ViT-G/14) |
| Parametros totales | 4.612.899.840 en el checkpoint safetensors del repositorio; el modelo base se denomina comercialmente 30B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | W4A16 (4 bits en pesos, 16 bits en activaciones), grupo 64, simetrica; codificador visual en BF16 sin cuantizar |
| Idiomas soportados | mas de 100 idiomas segun la model card del modelo base; listado concreto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; variantes AutoRound y AutoGPTQ (GPTQ) |
| Tamano del repositorio | 22,8 GB |
| Calibracion | 512 muestras, 800 iteraciones, secuencia de 2048 |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de lenguaje acoplado a un codificador visual ViT-G/14 de aproximadamente 1.800 millones de parametros, lo que da lugar a una arquitectura multimodal capaz de procesar texto e imagenes intercaladas (graficos, documentos, capturas de pantalla). Segun la model card, Muse Glimmer deriva por destilacion de Muse Spark, dentro de Meta Superintelligence Lab, y esta orientado a tareas agenticas de extremo a extremo.

Sobre el entrenamiento del modelo base no se proporcionan cifras de tokens, composicion del dataset ni detalles de RLHF o DPO. La model card si menciona datos procedentes de mas de 100 idiomas. La innovacion tecnica destacable de esta version concreta no esta en la arquitectura sino en el proceso de cuantizacion: Intel AutoRound con calibracion de alta precision y, sobre todo, la decision de no cuantizar el modulo visual (`quant_nontext_module=False`), preservando el alineamiento vision-lenguaje. El resultado es un checkpoint que, segun el autor, cabe en 24 o 32 GB de VRAM junto con la cache KV y el codificador de percepcion.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de texto e imagen intercaladas.
- Interpretacion de graficos, documentos y capturas de pantalla.
- Tool calling y function calling nativos, con parser dedicado (`muse_glimmer`) en vLLM.
- Ejecucion agentica de extremo a extremo, con soporte para esquemas de herramientas complejos.
- Recuperacion ante fallos: diagnostico y reintento automatico de llamadas a herramientas fallidas.
- Esfuerzo de razonamiento configurable (low/medium/high/xhigh) mediante prompt de sistema.
- Capacidades multilingues derivadas del entrenamiento en mas de 100 idiomas.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en vLLM.

## Casos de uso

- Agentes de automatizacion de navegador y escritorio: el modelo puede interpretar capturas de pantalla y decidir la siguiente accion en un bucle multi-paso, apoyandose en el codificador visual sin cuantizar y en el razonamiento configurable para tareas de larga duracion.
- Automatizacion de soporte tecnico con documentos: al procesar imagenes de facturas, tickets o manuales junto con texto, resulta adecuado para flujos de atencion al cliente que requieren extraer datos de documentos escaneados.
- Ingenieria de software asistida: con soporte declarado en SWE-Bench y tool calling nativo, puede integrarse en pipelines que consultan repositorios, ejecutan tests y aplican parches dentro de un bucle agentico.
- Analisis de documentacion financiera o cientifica: la ventana de 32k tokens y la capacidad de leer graficos permiten resumir informes con tablas y figuras en una sola pasada.
- Despliegue local en estaciones de trabajo: al caber en 24 o 32 GB de VRAM, es viable para prototipos de agentes multimodales en una RTX 4090 o A6000 sin infraestructura cloud.
- Orquestacion de herramientas via MCP: la model card cita MCP-Atlas, por lo que encaja en arquitecturas de agentes que descubren y llaman herramientas mediante el Model Context Protocol.
- Busqueda profunda y sintesis de fuentes: el soporte declarado en DeepSearch QA sugiere uso en pipelines de investigacion que combinan busqueda web, lectura de paginas y sintesis con citas.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card unicamente afirma "altas tasas de exito" en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, sin cifras, y no ofrece comparaciones cuantitativas frente al modelo base en BF16 ni frente a otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que el modelo cabe comodamente en entornos de 24 GB o 32 GB de VRAM junto con la cache KV y el codificador de percepcion, gracias a comprimir el modulo de lenguaje por debajo de 20 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX A6000 (48 GB), L40S (48 GB), A100 (40/80 GB) y H100 para mayor throughput.
- GPU de consumo: si, en RTX 4090 de 24 GB y en GPUs de 32 GB como la RTX 5090; en tarjetas de 16 GB no cabe el checkpoint completo.
- Opciones de despliegue: vLLM es la via recomendada por el autor (imagen `vllm/vllm-openai:muse-glimmer` o build reciente con soporte Muse Glimmer); tambien es compatible con transformers para el formato AutoRound y con backends GPTQ para la variante AutoGPTQ. No se menciona soporte de llama.cpp u Ollama.
- Parametros de servicio sugeridos: `--gpu-memory-utilization 0.90`, `--max-model-len 32768`, `--max-num-seqs 128`, `--enable-auto-tool-choice`, `--tool-call-parser muse_glimmer`, `--reasoning-parser muse_glimmer`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas comparables, por lo que no es posible establecer una comparacion rigurosa de parametros, contexto o resultados.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Muse-Glimmer-30B-W4A16-AutoRound | 4,6B en checkpoint (base comercial 30B) | 32.768 | apache-2.0 | Cuantizacion comunitaria de Muse Glimmer 30B |
| Muse-Glimmer-30B (base) | ~30B (no verificado en la informacion) | no disponible | apache-2.0 | Pesos originales en BF16; referencia de calidad |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- El recuento real de parametros del checkpoint (4,6B) no coincide con la denominacion "30B"; es probable que el repositorio requiera componentes adicionales del modelo base y no sea autosuficiente. Conviene verificar antes de desplegar.
- La cuantizacion W4A16 puede introducir degradacion en razonamiento complejo y en tareas agenticas de varios pasos, aunque el autor afirma preservar las capacidades visuales manteniendo el codificador en BF16.
- No se han publicado evaluaciones cuantitativas que respalden las afirmaciones de rendimiento del autor; las menciones a DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench carecen de cifras.
- Riesgo de alusionacion inherente a los modelos generativos, especialmente en tareas de busqueda profunda y lectura de documentos donde el modelo puede inferir datos no presentes en la imagen.
- Sesgos conocidos: no disponibles; al entrenarse con datos de mas de 100 idiomas, es esperable un sesgo hacia las lenguas con mayor representacion, pero no se documenta.
- Idiomas: la lista concreta no esta publicada; el soporte declarado de "mas de 100 idiomas" no garantiza calidad homogenea ni una buena cobertura del castellano en tareas agenticas.
- Licencia apache-2.0 en el repositorio de cuantizacion, pero la licencia y condiciones del modelo base deben verificarse de forma independiente antes de un uso comercial.
- La model card incluye enlaces de afiliado a RunPod y plantillas de despliegue del autor; no son parte del modelo y no deben interpretarse como requisito tecnico.
- El modelo esta marcado como `endpoints_compatible`, pero no se detalla que proveedor ni que nivel de servicio ofrece.
- Requiere una version de vLLM con soporte especifico para Muse Glimmer; versiones antiguas pueden fallar al cargar el checkpoint o al parsear tool calls.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vishva007/Muse-Glimmer-30B-W4A16-AutoRound
- Variante AutoGPTQ: https://huggingface.co/Vishva007/Muse-Glimmer-30B-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Estadisticas del modelo: https://openmodelstats.com/models/vishva007/muse-glimmer-30b-w4a16-autoround
