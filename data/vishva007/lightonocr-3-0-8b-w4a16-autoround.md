# Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound

## Resumen

LightOnOCR-3-0.8B-W4A16-AutoRound es una version cuantizada a INT4 del modelo lightonai/LightOnOCR-3-0.8B, un modelo vision-lenguaje de tipo imagen-a-texto orientado a transcripcion de documentos, comprension de maquetacion (layout), grounding visual y extraccion estructurada de tablas y figuras. La cuantizacion la firma el usuario Vishva007 mediante Intel AutoRound con esquema W4A16 (pesos INT4, activaciones BF16), grupo de 32, simetria activada, 1200 iteraciones y 512 muestras de calibracion con longitud de secuencia 4096. Es relevante porque reduce el coste de memoria de un modelo OCR multimodal hasta formatos desplegables en GPU de gama baja, manteniendo la torre de vision y el proyector multimodal en BF16 para no degradar la precision del reconocimiento ni de las cajas de delimitacion.

El modelo base se apoya en la arquitectura Qwen3.5 adaptada a vision-lenguaje y funciona en dos modos: transcripcion plana (prompt vacio), que devuelve el contenido en Markdown sin cajas, y modo grounding (prompt `grounding`), que emite cajas de delimitacion normalizadas en el rango [0, 1000] junto a etiquetas semanticas como `text`, `title`, `table`, `image` o `chart`. El repositorio declara 435.562.560 parametros en los safetensors, una cifra notablemente inferior a los 0,8 mil millones que sugiere el nombre comercial.

Se trata de un empaquetado de la comunidad, no de un lanzamiento oficial de LightOn: acumula 0 descargas y 0 likes desde su publicacion, y la model card incluye enlaces promocionales de un proveedor de GPU con codigo de referencia. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5 (transformer multimodal con torre de vision y proyector multimodal) |
| Parametros totales | 435.562.560 segun los safetensors del repositorio (el nombre del modelo indica 0,8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16), grupo 32, simetrica, 1200 iteraciones, 512 muestras de calibracion (seqlen 4096); torre de vision y proyector multimodal en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers); existen variantes hermanas en GPTQ/Marlin y LLM Compressor |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LightOnOCR-3, un sistema vision-lenguaje extremo a extremo construido sobre Qwen3.5 y especializado en documentos. La parte de vision se mantiene en BF16 durante la cuantizacion (`quant_nontext_module=False`), decision explicita del autor para evitar la degradacion del OCR y del grounding, mientras que las capas de lenguaje se comprimen a INT4 con AutoRound, un metodo de redondeo de pesos con optimizacion iterativa. La calibracion se realizo sobre 512 muestras de 4096 tokens, con 1200 iteraciones de optimizacion, lo que corresponde a una configuracion orientada a produccion mas que a una prueba rapida.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base. El unico ajuste documentado en esta ficha es el proceso de cuantizacion post-entrenamiento. Como innovaciones operativas destacables, el modelo exige desactivar los tokens de razonamiento (`enable_thinking=False`) porque fue optimizado sin modo pensamiento, y admite los dos modos de salida descritos (transcripcion y grounding con coordenadas normalizadas).

## Capacidades

- Transcripcion de documentos a Markdown respetando la maquetacion original, en modo prompt vacio.
- Grounding visual: emision de cajas de delimitacion normalizadas en el rango [0, 1000] con etiquetas semanticas (`text`, `title`, `table`, `image`, `chart`, entre otras).
- Comprension de maquetacion de documentos complejos (layout understanding).
- Extraccion estructurada de tablas y formularios.
- Extraccion de figuras y graficos con su localizacion espacial.
- Entrada multimodal imagen-texto mediante `image-text-to-text` con procesador de chat.
- Generacion determinista recomendada (`do_sample=False`, `temperature=0.0`) para maximizar la fidelidad de transcripcion.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se documenta modo de pensamiento (de hecho, se recomienda desactivarlo) ni capacidad de audio.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion masiva de archivos PDF escaneados: el modelo convierte cada pagina en Markdown listo para indexar, con la recomendacion de renderizar a 400 DPI y 2048 px de lado mayor para maximizar la precision.
- Extraccion de datos de facturas y recibos: en modo grounding permite localizar campos concretos con cajas y etiquetas, lo que facilita pipelines de validacion campo a campo (por ejemplo, el recibo SROIE usado en el ejemplo oficial).
- Automatizacion de procesos de formularios: la etiqueta `table` y la salida estructurada permiten reconstruir formularios y tablas en bases de datos sin post-procesado geometrico manual.
- Indexacion semantica para RAG documental: la salida Markdown y las cajas permiten construir bases vectoriales que preservan la estructura de secciones y jerarquias de titulo.
- Accesibilidad y republicacion de documentos: la transcripcion a Markdown con jerarquia de titulos facilita generar versiones legibles por lectores de pantalla o publicar contenido en gestores documentales.
- Analisis de informes financieros con graficos: la etiqueta `chart` permite separar texto, tablas y graficos para tratarlos con herramientas distintas.
- Despliegue en GPU de gama media o baja: gracias a la cuantizacion INT4 y al reducido numero de parametros, puede servirse con vLLM en una unica GPU para procesar lotes de documentos en paralelo a 0 grados de temperatura.
- Preprocesado en pipelines de auditoria documental: el modo grounding genera trazabilidad de donde se encontro cada dato, util para revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni de metricas especificas de OCR (como edit distance o precision de cajas) frente al modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del recuento de parametros (435 millones, pesos INT4 en el modulo de lenguaje mas torre de vision y proyector en BF16), el peso en memoria deberia quedar muy por debajo de 1 GB, y el consumo total con cache KV y vision dependera de la resolucion de imagen y de la longitud de contexto configurada. El repositorio ocupa 1,0 GB en disco.
- GPU recomendadas: no especificadas por el autor. El ejemplo de despliegue usa vLLM con `--dtype bfloat16` y `--trust-remote-code`, sin indicar modelo de GPU concreto.
- GPU de consumo: no confirmado por el autor. Por tamano, el modelo deberia caber en GPU de consumo con BF16 e INT4 soportados (gama RTX 30/40 y superiores), pero es una inferencia a partir del recuento de parametros y no un dato verificado.
- Opciones de despliegue: transformers (>=5.5.4 recomendado, con `AutoModelForImageTextToText`), vLLM con `--trust-remote-code`, y variantes hermanas para AutoGPTQ/Marlin o LLM Compressor. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que la configuracion W4A16 simetrica esta pensada para alto rendimiento, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound | 435.562.560 | W4A16 INT4, grupo 32, simetrica | No especificado (ejemplo con 8192) | Safetensors (transformers) | Apache 2.0 | Repositorio comunitario, 0 descargas |
| lightonai/LightOnOCR-3-0.8B (base) | No confirmado en la informacion (el nombre indica 0,8B) | BF16 (sin cuantizar) | No disponible | No disponible | Apache 2.0 | Modelo oficial del que deriva esta version |
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ | Mismo modelo base | W4A16 en formato GPTQ/Marlin | No disponible | GPTQ | Apache 2.0 | Repositorio hermano del mismo autor |
| Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-LLM-Compressor | Mismo modelo base | W4A16 para LLM Compressor | No disponible | Compressed tensors | Apache 2.0 | Repositorio hermano del mismo autor |

No se dispone en la informacion proporcionada de otros modelos OCR vision-lenguaje comparables (por ejemplo, alternativas multimodales de otros proveedores) con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Repositorio no oficial: es una cuantizacion de la comunidad sobre lightonai/LightOnOCR-3-0.8B, con 0 descargas y 0 likes, sin validacion publica de terceros.
- Discrepancia en el tamano: el nombre del modelo indica 0,8B, pero los safetensors declaran 435.562.560 parametros. Conviene verificar que los pesos corresponden al checkpoint esperado antes de usarlo en produccion.
- Sin datos de evaluacion: no hay benchmarks publicados que cuantifiquen la perdida de precision respecto al modelo base en BF16, ni en transcripcion ni en grounding.
- Modo pensamiento desactivado: el modelo esta optimizado con `enable_thinking=False`; activarlo puede degradar los resultados, y el chat template debe mantener ese ajuste.
- Sensibilidad al preprocesado: la precision de las cajas de delimitacion depende de mantener la relacion de aspecto original; estirar las imagenes invalida las coordenadas. Se recomienda 400 DPI y 2048 px de lado mayor.
- Idiomas: no se declara cobertura linguistica, por lo que el rendimiento en idiomas distintos del ingles no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar texto ausente en documentos degradados, manuscritos o con ruido; en flujos criticos conviene validacion humana o verificación cruzada.
- Contexto limitado: aunque no se declara oficialmente, el ejemplo de produccion usa 8192 tokens, insuficiente para documentos muy largos en una sola pasada sin estrategias de troceado.
- Contenido promocional en la model card: incluye enlaces de afiliado a un proveedor de GPU y un enlace de referencia; no afecta al modelo, pero conviene tratarlo como material comercial y no como documentacion tecnica.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se indique si hubo cambios; la cuantizacion es un cambio que debe declararse.
- Los resultados de busqueda web disponibles para esta ficha no contenian informacion tecnica relevante ni enlaces utiles sobre el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Variante GPTQ / Marlin: https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-GPTQ
- Variante LLM Compressor / vLLM: https://huggingface.co/Vishva007/LightOnOCR-3-0.8B-W4A16-AutoRound-LLM-Compressor
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- arXiv 2601.14251 (referenciado en las etiquetas del modelo): https://arxiv.org/abs/2601.14251
- arXiv 2309.05516 (referenciado en las etiquetas del modelo): https://arxiv.org/abs/2309.05516
- Imagen de ejemplo SROIE usada en la model card: https://huggingface.co/datasets/hf-internal-testing/fixtures_ocr/resolve/main/SROIE-receipt.jpeg
