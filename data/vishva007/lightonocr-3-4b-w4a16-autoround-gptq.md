# Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-GPTQ

## Resumen

LightOnOCR-3-4B-W4A16-AutoRound-GPTQ es una version cuantizada a INT4 del modelo de vision-lenguaje LightOnOCR-3-4B de LightOn, publicada por el usuario Vishva007. El modelo original es un sistema OCR end-to-end construido sobre la arquitectura Qwen3.5, disenado para transcripcion de documentos de alta precision, comprension de layout, grounding visual y extraccion estructurada de figuras y tablas. Esta variante aplica cuantizacion W4A16 (pesos en INT4, activaciones en BF16) mediante Intel AutoRound, manteniendo el vision tower y el proyector multimodal en BF16 para no degradar la calidad de reconocimiento.

El resultado es un checkpoint de aproximadamente 4.540 millones de parametros totales que ocupa 4,0 GB en el repositorio, frente a los ~9 GB que requeriria el modelo base en BF16. La reduccion de huella lo hace desplegable en GPUs de consumo (RTX 3090, RTX 4090 y similares) sin renunciar al pipeline multimodal completo. El formato de pesos es safetensors con cuantizacion GPTQ/AutoGPTQ, compatible con kernels Marlin, lo que habilita su uso tanto desde Transformers como desde vLLM en modo servidor OpenAI-compatible.

Es relevante ahora porque permite integrar OCR de alta fidelidad con grounding espacial en infraestructura modesta, un caso de uso muy demandado en digitalizacion documental, extraccion de datos de facturas y formularios, y automatizacion de back-office. La licencia Apache-2.0 facilita el uso comercial sin las restricciones tipicas de otros modelos OCR propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje sobre Qwen3.5 (tag `qwen3_5`), pipeline `image-text-to-text` |
| Parametros totales | 4.539.265.536 (~4,54 B), segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16), grupo de 32, simetrica (`sym=True`), 1200 iteraciones, 512 muestras de calibracion con `seqlen=4096`. Vision tower y proyector multimodal en BF16 (`quant_nontext_module=False`) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; el pipeline es OCR multilingue heredado del modelo base, sin confirmacion explicita) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con cuantizacion GPTQ (AutoRound); variantes hermanas en formato nativo AutoRound y en compressed-tensors para LLM Compressor |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `lightonai/LightOnOCR-3-4B`: un modelo vision-lenguaje end-to-end basado en Qwen3.5, con un vision tower, un proyector multimodal hacia el espacio de embeddings del LLM y el decodificador de texto. No hay informacion disponible en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla si el modelo base incorpora decodificacion especulativa u otras optimizaciones de atencion.

La innovacion concreta de este repositorio es el proceso de cuantizacion, no el entrenamiento. Se ha aplicado Intel AutoRound con esquema W4A16 sobre los modulos de texto, manteniendo fuera del proceso (`quant_nontext_module=False`) el vision tower y el proyector multimodal, que permanecen en BF16. La configuracion de calibracion es agresiva: 1200 iteraciones de optimizacion de redondeo sobre 512 muestras con longitud de secuencia 4096, agrupacion de pesos en bloques de 32 y simetria estandar. Esta combinacion busca minimizar la degradacion en tareas de OCR y grounding, que son especialmente sensibles a errores numericos en las capas de vision.

El modelo opera en dos modos explicitos. El modo de transcripcion simple (`prompt = ""`) devuelve texto en formato Markdown conservando el layout, sin cajas delimitadoras. El modo grounding (`prompt = "grounding"`) devuelve cajas delimitadoras normalizadas al rango [0, 1000] junto con etiquetas semanticas por componente del documento (`text`, `title`, `table`, `image`, `chart`, entre otras). El modelo esta optimizado para funcionar con el modo de pensamiento desactivado (`enable_thinking=False`).

## Capacidades

- Transcripcion end-to-end de documentos a Markdown, preservando la estructura de layout.
- Grounding visual: emision de cajas delimitadoras normalizadas [0, 1000] y etiquetas semanticas por region (`text`, `title`, `table`, `image`, `chart`).
- Comprension de layout documental: deteccion y jerarquizacion de titulos, parrafos, tablas y figuras.
- Extraccion estructurada de tablas y formularios, orientada a datos de facturas, recibos y documentos administrativos.
- Comprension de imagenes y graficos dentro del documento, no solo de texto impreso.
- Entrada multimodal de imagen y texto mediante `AutoProcessor` y `AutoModelForImageTextToText` de Transformers.
- Compatibilidad con API OpenAI (`/v1/chat/completions`) a traves de vLLM, con mensajes de tipo `image_url` y `text`.
- Generacion determinista recomendada (`do_sample=False`, `temperature=0.0`) para tareas de extraccion.
- Capacidades multilingues: no documentadas explicitamente en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo esta optimizado con el modo de pensamiento desactivado.
- Capacidad especial: el modelo prioriza la fidelidad geometrica de las cajas delimitadoras, por lo que exige mantener la relacion de aspecto original de la imagen.

## Casos de uso

- Digitalizacion masiva de facturas y recibos: el modo grounding permite extraer cajas y etiquetas por campo, lo que facilita mapear cada valor a un esquema de datos estructurado sin reglas heuristas fragiles. El ejemplo oficial del repositorio usa precisamente un recibo del dataset SROIE.
- Automatizacion de back-office contable: conversion de documentos PDF escaneados a Markdown estructurado para su ingestion posterior en un ERP o en un pipeline de contabilidad, aprovechando la preservacion de tablas.
- Extraccion de tablas de informes financieros: el modelo etiqueta explicitamente regiones `table` y `chart`, lo que permite separar el contenido tabular del narrativo antes de aplicar un parser especializado.
- Procesamiento de formularios administrativos: con el etiquetado semantico por region se pueden localizar campos, titulos y bloques de texto, util para validacion automatica de expedientes.
- Indexacion y busqueda semantica sobre archivos historicos: transcripcion a Markdown de corpus escaneados para alimentar un sistema RAG, manteniendo la estructura de secciones y tablas.
- Asistencia a la revision de contratos: transcripcion con layout para localizar titulos y clausulas, con las cajas delimitadoras como referencia visual para el revisor humano.
- Despliegue en edge o en servidores modestos: al ocupar un repositorio de 4,0 GB y caber en GPUs de consumo, es viable ejecutarlo en una unica RTX 4090 o 3090 para lotes de OCR por lotes nocturnos.
- Servicio OCR interno con API OpenAI-compatible: mediante `vllm serve` se expone como endpoint compatible, integr able en aplicaciones existentes que ya consumen la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas comparativas de MMLU, HumanEval, GSM8K, OCRBench ni de metricas especificas de OCR como edit distance o exact match en documentos. Tampoco se aportan mediciones de degradacion respecto del modelo base en BF16, mas alla de la afirmacion cualitativa de que mantener el vision tower en BF16 evita el deterioro en OCR y grounding.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 2,3-2,6 GB para los parametros en INT4 (4,54 B x 4 bits), mas el vision tower y el proyector en BF16.
- VRAM estimada para inferencia: del orden de 4-6 GB con contexto corto, y en torno a 6-8 GB con `max-model-len 8192` incluyendo cache KV en BF16. Son estimaciones de ingenieria, no cifras publicadas por el autor.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), L4, A10G, A100 y H100. Cabe holgadamente en cualquier GPU con 8 GB o mas de VRAM.
- Compatibilidad con GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080/4090 y RTX 3090. En GPUs con 8 GB puede requerir ajuste de contexto.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText`, requiere `transformers>=5.5.4`), vLLM con `--trust-remote-code` y tensores GPTQ/Marlin, y las variantes hermanas para AutoRound nativo y LLM Compressor (compressed-tensors).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por pagina.
- Parametros de generacion recomendados por el autor: `max_new_tokens=2048`, `do_sample=False`, `enable_thinking=False`, `temperature=0.0`.
- Preprocesado obligatorio: renderizar documentos a 400 DPI con dimension mayor de 2048 px, manteniendo la relacion de aspecto sin estirar la imagen.

## Comparativa con modelos similares

Dentro del mismo repositorio y familia existen variantes equivalentes en precision numerica pero distintas en formato de serializacion:

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Motor recomendado |
|---|---|---|---|---|---|
| Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-GPTQ (este) | ~4,54 B | W4A16 INT4, grupo 32, simetrica | safetensors GPTQ/Marlin | Apache-2.0 | Transformers, vLLM con Marlin |
| Vishva007/LightOnOCR-3-4B-W4A16-AutoRound | ~4,54 B | W4A16 INT4 AutoRound | nativo AutoRound | Apache-2.0 | Transformers, AutoRound |
| Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-LLM-Compressor | ~4,54 B | W4A16 INT4 | compressed-tensors | Apache-2.0 | vLLM de alto rendimiento |
| lightonai/LightOnOCR-3-4B (modelo base) | ~4,54 B | sin cuantizar (BF16) | safetensors | Apache-2.0 | Transformers, vLLM |

No se dispone de datos verificados de parametros, contexto, rendimiento ni licencia de otros modelos OCR de la competencia (por ejemplo, alternativas de la familia Qwen-VL o modelos OCR especializados de terceros) dentro de la informacion proporcionada, por lo que no se incluye una comparativa cruzada con cifras. La comparacion con el modelo base en BF16 es la referencia natural, y la unica diferencia documentada es la cuantizacion de los modulos de texto y el consiguiente ahorro de memoria.

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia cuantitativa de la perdida de precision introducida por la cuantizacion W4A16 frente al modelo base en BF16, mas alla de la preservacion del vision tower en BF16.
- Riesgo de alucinacion en campos numericos: como todo modelo generativo aplicado a OCR, puede producir valores plausibles pero incorrectos en importes, fechas o identificadores; se recomienda validacion cruzada en flujos criticos.
- Dependencia critica del preprocesado: la precision de las cajas delimitadoras depende de mantener la relacion de aspecto y de renderizar a 400 DPI con 2048 px de dimension mayor. Estirar la imagen degrada directamente las coordenadas.
- Modo de pensamiento desactivado: el modelo esta optimizado con `enable_thinking=False`; activarlo no esta documentado y puede degradar los resultados.
- Idiomas no declarados: la model card no especifica la cobertura linguistica, por lo que la calidad en idiomas distintos del ingles o del espanol no esta garantizada ni medida.
- Contexto no declarado: la ventana de contexto real del modelo no se indica en la documentacion; los 8192 tokens del ejemplo son un ajuste de servidor vLLM, no una especificacion del modelo.
- Requisito de version muy reciente de Transformers: la model card exige `transformers>=5.5.4`, lo que puede bloquear entornos con versiones anteriores.
- Errata en la documentacion oficial: el comando de vLLM de la model card contiene un namespace duplicado (`Vishva007/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-GPTQ`), que fallaria tal cual; debe corregirse a `Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-GPTQ`.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de LightOn y de las dependencias (AutoRound, transformers) en el despliegue final.
- Autor tercero: se trata de una cuantizacion de la comunidad, no de un artefacto publicado por LightOn; la responsabilidad sobre la calidad del proceso de cuantizacion recae en el autor del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Variante AutoRound nativa: https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound
- Variante LLM Compressor: https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-LLM-Compressor
- Pagina de investigacion de LightOnOCR-3: https://www.lighton.ai/research/lightonocr-3
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Perfil del autor en HuggingFace: https://huggingface.co/Vishva007
- Perfil del autor en GitHub: https://github.com/vishvaRam
- Referencia arXiv incluida en los tags: arxiv:2601.14251
- Referencia arXiv incluida en los tags: arxiv:2309.05516
