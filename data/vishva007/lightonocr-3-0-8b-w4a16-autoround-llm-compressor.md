# Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-LLM-Compressor

## Resumen

LightOnOCR-3-0.8B-W4A16-AutoRound-LLM-Compressor es una version cuantizada a INT4 del modelo lightonai/LightOnOCR-3-0.8B, un modelo de vision-lenguaje (image-text-to-text) orientado a transcripcion de documentos, comprension de maquetacion, grounding visual y extraccion estructurada de figuras. La cuantizacion la publica el usuario Vishva007 (no el autor original del modelo) mediante Intel AutoRound, con un esquema W4A16: pesos en INT4 y activaciones en BF16, grupo de 32, simetria simetrica, 1200 iteraciones de optimizacion y 512 muestras de calibracion con longitud de secuencia 4096. El motivo de esta variante es reducir el peso en memoria y el coste de inferencia manteniendo la calidad OCR, para lo cual el torre de vision y el proyector multimodal se conservan en BF16.

El modelo base parte de la arquitectura Qwen3.5 y tiene 852.985.920 parametros (aproximadamente 0,85B), lo que lo situa en la gama ultraligera de los VLM de documentos. El repositorio ocupa 1,0 GB y usa transformers como libreria, con soporte declarado para vLLM y el formato compressed-tensors. Se publica bajo licencia Apache 2.0, lo que facilita su integracion en productos comerciales, y esta pensado para dos modos de operacion: transcripcion plana a Markdown y modo grounding con cajas delimitadoras normalizadas.

Su relevancia actual radica en que permite ejecutar OCR de documentos con estructura y localizacion visual en hardware modesto, incluidas GPU de consumo, en lugar de depender de modelos de varios miles de millones de parametros. No obstante, el repositorio no incluye resultados de benchmarks ni datos de idiomas, y registra 0 descargas y 0 likes en el momento de la consulta, por lo que es una cuantizacion de terceros sin validacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5 (transformer multimodal, image-text-to-text) |
| Parametros totales | 852.985.920 (aproximadamente 0,85B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo de despliegue en vLLM configura --max-model-len 8192; la calibracion usa seqlen 4096) |
| Tipos de cuantizacion | W4A16: pesos INT4, activaciones BF16, grupo 32, simetrico, 1200 iteraciones, 512 muestras de calibracion; torre de vision y proyector multimodal en BF16. Repos hermanos en AutoRound nativo y GPTQ/Marlin |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato compressed-tensors (LLM Compressor) |

## Arquitectura y entrenamiento

El modelo base es un VLM extremo a extremo construido sobre la arquitectura Qwen3.5, con un torre de vision, un proyector multimodal y un decodificador de lenguaje. En esta variante cuantizada, solo los modulos de texto se cuantizan a INT4 con AutoRound (`quant_nontext_module=False`), mientras que el torre de vision y el proyector permanecen en BF16 con el objetivo explicito de evitar la degradacion del OCR y del grounding, que son tareas sensibles a errores numericos pequenos en las representaciones visuales. La configuracion de cuantizacion es de alta fidelidad para produccion: grupo de 32, simetria, 1200 iteraciones y 512 muestras de calibracion con secuencias de 4096 tokens, lo que proporciona una cobertura amplia de dominios.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de RLHF o DPO en el modelo original; la model card del repositorio cuantizado no detalla esos aspectos. Un detalle funcional relevante es que LightOnOCR-3 esta optimizado para operar con el modo de pensamiento desactivado (`enable_thinking=False`), de modo que la generacion de tokens de razonamiento debe mantenerse apagada durante la inferencia para obtener el comportamiento previsto.

## Capacidades

- Transcripcion de documentos a Markdown respetando la maquetacion, en modo de transcripcion plana (`prompt = ""`), sin cajas delimitadoras.
- Grounding visual (`prompt = "grounding"`): genera cajas delimitadoras normalizadas en el rango [0, 1000] junto con etiquetas semanticas por componente (`text`, `title`, `table`, `image`, `chart`, entre otras).
- Comprension de maquetacion de documentos: identificacion y separacion de titulos, bloques de texto, tablas e imagenes.
- Extraccion estructurada de tablas y formularios.
- Extraccion de figuras y graficos con su localizacion espacial.
- Procesamiento de imagenes de documento en pipeline image-text-to-text, con plantilla de chat conversacional.
- No se declara soporte explicito de tool calling, function calling ni de flujos de agentes multi-paso.
- Cobertura multilingue: no disponible.
- Modo de pensamiento (thinking): la arquitectura lo contempla, pero el modelo esta optimizado con el razonamiento desactivado.

## Casos de uso

- Digitalizacion masiva de facturas y recibos: el modelo transcribe el documento completo a Markdown y, en modo grounding, devuelve las cajas de cada campo con su etiqueta, lo que permite mapear lineas de detalle, totales e identificadores fiscales a un esquema estructurado.
- Extraccion de tablas financieras: con resolucion de render de 400 DPI y 2048 px en el lado mayor, el modelo puede reconstruir tablas de balances e informes, manteniendo la geometria original para no perder la correspondencia entre filas y columnas.
- Procesamiento de formularios administrativos: el modo grounding con etiquetas semanticas permite localizar campos de formularios escaneados y asociarlos a valores, util para tramites con plantillas heterogeneas.
- Pipeline de ingestion documental en RAG: la transcripcion a Markdown con estructura de titulos y tablas sirve como etapa previa de conversion antes de trocear y vectorizar documentos para un sistema de recuperacion.
- Analisis de articulos cientificos: extraccion de figuras, graficos y tablas con su bounding box para enlazar cada elemento visual con su pie y su contexto en el texto.
- Despliegue en el borde o en CPU/GPU de gama baja: con menos de mil millones de parametros y cuantizacion INT4, puede ejecutarse en equipos sin aceleradores de gama alta, por ejemplo en digitalizacion local de archivos con requisitos de privacidad.
- Servicio de OCR como API interna: el ejemplo de la model card muestra su publicacion mediante vLLM con una API compatible con OpenAI (`/v1/chat/completions`), lo que facilita integrarlo en servicios existentes sin cambiar clientes.
- Control de calidad de digitalizaciones: el modo grounding permite comparar las regiones detectadas con las esperadas para detectar paginas mal escaneadas, rotadas o con regiones ausentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni de metricas de OCR como CER, WER o precision de grounding, ni frente al modelo base en BF16 ni frente a otras alternativas.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 0,5 GB para los modulos de texto en INT4, mas el torre de vision y el proyector en BF16; el repositorio completo ocupa 1,0 GB en disco. Estimacion derivada del recuento de parametros (852.985.920) y del esquema W4A16, no de mediciones publicadas.
- VRAM total recomendada en inferencia: el modelo cabe comodamente en 4-6 GB de VRAM contando cache KV y activaciones, especialmente con ventanas de 8192 tokens.
- GPU de consumo: cabe en practicamente cualquier GPU moderna de consumo (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, etc.) y tambien en GPUs integradas con memoria compartida, aunque con mayor latencia.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias por memoria, pero permiten maximizar el throughput por lote en servicios de alta concurrencia.
- CPU: es viable la ejecucion en CPU dado el tamano del modelo, si bien no se publican cifras de latencia.
- Opciones de despliegue: transformers (se requiere `transformers>=5.5.4` junto con `auto-round`, `pillow` y `torchvision`), vLLM con `--trust-remote-code` y `--dtype bfloat16`, y formatos alternativos de los repos hermanos para AutoGPTQ/Marlin. El formato compressed-tensors esta orientado a vLLM y LLM Compressor.
- Latencia y throughput: no disponibles. El ejemplo de la model card sugiere `max_new_tokens=2048`, `do_sample=False` y temperatura 0.0 para inferencia determinista.
- Preprocesado recomendado: renderizar a 400 DPI con dimension mayor de 2048 px, mantener la relacion de aspecto original sin deformar (la precision de las cajas depende de la integridad geometrica) y mantener `enable_thinking=False`.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion posible se limita a las variantes derivadas del mismo modelo base:

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-LLM-Compressor | 852.985.920 | W4A16 INT4, grupo 32 | safetensors / compressed-tensors | Apache 2.0 | Orientado a vLLM y LLM Compressor |
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound | 852.985.920 | W4A16 INT4 | AutoRound nativo | Apache 2.0 | Para transformers/AutoRound |
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ | 852.985.920 | W4A16 INT4 | AutoGPTQ / Marlin | Apache 2.0 | Para backends GPTQ |
| lightonai/LightOnOCR-3-0.8B | 852.985.920 | Sin cuantizar (BF16) | safetensors | No disponible en la informacion | Modelo base original |

Datos de rendimiento comparado entre estas variantes: no disponibles.

## Limitaciones y advertencias

- La cuantizacion a INT4 puede introducir degradacion de precision en la transcripcion y en las coordenadas de las cajas delimitadoras; el autor mitiga el riesgo manteniendo la torre de vision y el proyector en BF16, pero no publica mediciones del impacto real.
- No hay resultados de benchmarks que respalden las afirmaciones de "alta fidelidad" de la cuantizacion, ni comparacion con el modelo base sin cuantizar.
- Es una cuantizacion de terceros (usuario Vishva007), no oficial de lightonai; el soporte y el mantenimiento dependen de ese autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje: en documentos con baja calidad de escaneo, manuscritos o tipografias poco comunes puede generar texto plausible pero incorrecto, especialmente en cifras y codigos.
- La precision del grounding depende directamente del preprocesado: deformar la imagen o reducir la resolucion por debajo de lo recomendado altera las coordenadas normalizadas.
- El modelo esta optimizado con el razonamiento desactivado; activar `enable_thinking` puede degradar el comportamiento esperado.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue sin verificacion previa en el idioma objetivo.
- Longitud de contexto no documentada formalmente; el ejemplo de despliegue usa 8192 tokens, por lo que documentos largos requieren troceado en paginas.
- Licencia Apache 2.0 en este repositorio, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base lightonai/LightOnOCR-3-0.8B, no incluida en la informacion disponible.
- Los datos de busqueda web recuperados no contienen informacion tecnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-LLM-Compressor
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Repositorio hermano (AutoRound nativo): https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound
- Repositorio hermano (AutoGPTQ / Marlin): https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ
- Intel AutoRound (herramienta de cuantizacion): https://github.com/intel/auto-round
- Referencia arXiv citada en las etiquetas: arxiv:2601.14251 (sin titulo declarado en la informacion disponible)
- Referencia arXiv citada en las etiquetas: arxiv:2309.05516 (sin titulo declarado en la informacion disponible; corresponde a la publicacion de AutoRound segun las etiquetas del repositorio)
