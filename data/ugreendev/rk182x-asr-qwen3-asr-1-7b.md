# UGREENDEV/RK182X-ASR-Qwen3-ASR-1.7B

## Resumen

RK182X-ASR-Qwen3-ASR-1.7B es un conjunto de artefactos de despliegue en formato RKNN para el modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B, desarrollado por el equipo Qwen y convertido por UGREENDEV para su ejecucion sobre la NPU del chip Rockchip RK1828. No se trata de un modelo nuevo, sino de una derivacion optimizada del modelo original: el encoder y el decodificador se han cuantizado y empaquetado para la runtime RKNN v1.2.0, con el objetivo de habilitar ASR de calidad en hardware embebido de bajo consumo.

El repositorio ofrece dos configuraciones: una offline, con un encoder de audio que procesa el audio completo de una vez, y una online, con un encoder de streaming que permite reconocimiento incremental. En ambas, el encoder se mantiene en fp16 y el modelo de lenguaje se cuantiza a w4a16, con una cache KV en int4 y una ventana de contexto de 8192 tokens. El modelo base tiene aproximadamente 1.7 mil millones de parametros y deriva de la familia Qwen3.

La relevancia de esta ficha radica en que documenta un caso practico de despliegue de un modelo ASR en silicio especifico (Rockchip RK1828), un escenario poco cubierto en la literatura habitual centrada en GPU. Para desarrolladores que trabajan con dispositivos edge, domotica o grabadoras inteligentes, estas configuraciones reducen la barrera de entrada al proporcionar artefactos listos para flashear, con sumas de verificacion SHA-256 y una licencia Apache 2.0 heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (modelo base Qwen3-ASR-1.7B); despliegue RKNN con encoder de audio y LLM decodificador |
| Parametros totales | 1.7 mil millones (modelo base); no se detalla el desglose por componente |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (llm) |
| Tipos de cuantizacion | encoder: fp16; llm: w4a16; KVCache: int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (artefactos de despliegue); repo de 5.5 GB; no se listan safetensors ni GGUF |
| Chips soportados | Rockchip RK1828 |
| Runtime RKNN | v1.2.0 |
| Nucleos NPU | encoder: 4; llm: 4 (offline); encoder_online: 4; llm: 4 (online) |
| Modos de audio | offline (audio completo) y online (streaming) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-ASR-1.7B, es un sistema de reconocimiento automatico del habla de la familia Qwen3, con una arquitectura encoder-decoder: un encoder procesa la señal de audio y un decodificador basado en lenguaje genera la transcripcion. El tokenizer empleado es el de Qwen3-0.6B. La model card del repositorio no detalla el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde al modelo original y no se reproduce aqui.

La innovacion tecnica de esta publicacion no reside en el entrenamiento, sino en la conversion y el empaquetado para la NPU RK1828. Se generan dos variantes de encoder: una offline, que codifica la utterance completa, y una online, disenada para audio en streaming con reconocimiento incremental. El decodificador LLM se cuantiza en w4a16 (pesos de 4 bits, activaciones de 16 bits) y la cache KV en int4, lo que reduce drasticamente el espacio en memoria a costa de una posible perdida de precision. La runtime RKNN v1.2.0 es el unico entorno soportado, y cada configuracion debe usarse con los ficheros de su propio directorio, sin mezclar artefactos entre variantes.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), tanto en modo offline como en modo streaming.
- Procesamiento de audio completo en la variante offline, adecuada para transcripcion de ficheros o utterances cerradas.
- Procesamiento incremental en la variante online, orientada a dictado en tiempo real o captura continua de microfono.
- Decodificacion autoregresiva con ventana de contexto de 8192 tokens, lo que permite transcripciones de cierta longitud sin truncamiento.
- Ejecucion sobre NPU dedicada (RK1828) con cuatro nucleos asignados al encoder y cuatro al LLM en cada configuracion.
- Integracion con endpoints compatibles segun las etiquetas del repositorio (endpoints_compatible), lo que sugiere exposicion mediante API.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling, agentes, vision o audio adicional: no disponible.

## Casos de uso

- Transcripcion de reuniones en dispositivos edge: la variante offline procesa la grabacion completa y genera la transcripcion con contexto de 8192 tokens, suficiente para intervenciones de varios minutos sin fragmentar el audio.
- Dictado en tiempo real en aplicaciones de escritorio o moviles: la variante online con encoder de streaming permite mostrar texto a medida que el usuario habla, con latencia controlada por la NPU local.
- Subtitulado de video en equipos de bajo consumo: al ejecutarse sobre RK1828, el modelo puede alimentar pipelines de generacion de subtitulos sin depender de servicios en nube, reduciendo costes y preservando la privacidad del audio.
- Grabadoras inteligentes y dispositivos de domotica: la cuantizacion w4a16 e int4 en la cache KV reduce el footprint de memoria, lo que facilita integrar ASR en hardware con RAM limitada y alimentacion por bateria.
- Atendimiento al cliente por voz en quioscos o terminales: la configuracion online permite capturar la consulta del usuario y transcribirla para que un sistema posterior la procese, manteniendo la conversacion en el dispositivo.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en directo de conversaciones presenciales mediante un dispositivo portatil con RK1828, sin enviar audio a terceros.
- Verificacion e integracion en CI/CD: las sumas SHA-256 incluidas permiten automatizar la validacion de artefactos antes del despliegue en flotas de dispositivos, garantizando que solo se instalan binarios integros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chip objetivo: Rockchip RK1828 con NPU; no se soportan otras plataformas segun la model card.
- Runtime: RKNN v1.2.0, version obligatoria para ambas configuraciones.
- Memoria: el repositorio completo ocupa 5.5 GB; el footprint en ejecucion depende de la configuracion (encoder fp16, llm w4a16, KVCache int4) y no se detalla en la informacion proporcionada.
- GPU: no aplicable; el despliegue esta pensado para NPU Rockchip, no para A100, H100 ni RTX 4090.
- Despliegue: conversores y runtime RKNN; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Verificacion: ejecutar `sha256sum -c SHA256SUMS` dentro del directorio de la configuracion antes del despliegue; todas las entradas deben reportar OK.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-ASR-Qwen3-ASR-1.7B (esta ficha) | 1.7B | 8192 tokens | NPU Rockchip RK1828 | Apache 2.0 | Hugging Face y ModelScope |
| Qwen3-ASR-1.7B (modelo base) | 1.7B | no disponible en esta ficha | GPU generica | Apache 2.0 | Repositorio Qwen |
| Alternativas ASR edge de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otros sistemas ASR embebidos no es posible con los datos proporcionados; la unica referencia solida es el modelo base Qwen3-ASR-1.7B, del que esta publicacion es una conversion.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en chips Rockchip RK1828; no es desplegable en GPU convencional ni en CPU generica con estos artefactos.
- Version de runtime fija: requiere RKNN v1.2.0; otras versiones pueden no ser compatibles.
- Mezcla de artefactos: no deben combinarse ficheros de las configuraciones offline y online; cada una debe usarse con sus propios pesos.
- Perdida de precision por cuantizacion: el LLM en w4a16 y la cache KV en int4 pueden degradar la calidad de transcripcion frente al modelo original en fp16 o bf16; no se han publicado metricas de esa degradacion.
- Idiomas: no se especifica la cobertura linguistica en la model card; debe verificarse contra la documentacion del modelo base antes de usarlo en produccion multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero los terminos del modelo original siguen aplicandose al ser una derivacion; revisar el fichero LICENSE incluido.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de reportes de errores.
- Alucinacion y sesgos: no se han documentado sesgos conocidos ni tasas de alucinacion para esta conversion; en ASR, el riesgo tipico es la invencion de palabras en audio ruidoso o con acentos no cubiertos.
- Fecha de publicacion futura (2026-11-19) en los metadatos, lo que puede indicar un artefacto en fase temprana o un error de marcado temporal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-ASR-Qwen3-ASR-1.7B
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Documentacion en chino del repositorio: README_CN.md dentro del mismo repositorio
- Descarga via ModelScope: comando `modelscope download --model UGREENDEV/RK182X-ASR-Qwen3-ASR-1.7B`
- Descarga via Hugging Face CLI: `hf download UGREENDEV/RK182X-ASR-Qwen3-ASR-1.7B --revision v1.2.0`
- Papers, blogs, repos adicionales y demos: no disponibles en la informacion proporcionada.
