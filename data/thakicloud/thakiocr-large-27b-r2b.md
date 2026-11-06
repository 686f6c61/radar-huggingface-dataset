# ThakiCloud/ThakiOCR-Large-27B-R2B

## Resumen

ThakiOCR-Large-27B-R2B es un adaptador LoRA de rango 32 publicado por ThakiCloud sobre el modelo multimodal Qwen/Qwen3.6-27B. Su unica funcion es transcribir a texto una imagen recortada de una unica palabra en coreano. No se trata de un modelo completo, sino de un adaptador PEFT que se carga sobre el modelo base y que, segun la model card, reduce la tasa de error por caracter (CER) del 18,04 % al 6,01 % sobre un conjunto de desarrollo interno fijo de 2.400 recortes de palabra.

El modelo se presenta explicitamente como una vista previa de investigacion (research-preview) y no como un producto. El autor advierte de que no se han evaluado la lectura de paginas completas, lineas o parrafos, ni la generalizacion a fuentes tipograficas, escritores o condiciones de captura nuevas. El conjunto de desarrollo procede de las mismas fuentes que los datos de entrenamiento, por lo que las cifras no constituyen una evaluacion fuera de distribucion.

La relevancia del lanzamiento es acotada pero concreta: demuestra que un ajuste fino de bajo rango sobre un modelo de vision-lenguaje grande puede reducir de forma sustancial los errores de insercion en escritura manuscrita coreana, y publica el protocolo exacto de inferencia (prompt, tamano de imagen, decodificacion voraz y revision fijada del modelo base) necesario para reproducir los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre un transformer multimodal vision-lenguaje (Qwen3.6-27B); 496 modulos LoRA, ninguno en la torre de vision |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen3.6-27B tiene 27B, segun su denominacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador (heredada del modelo base; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (la model card solo documenta inferencia en bf16) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.6-27B, un modelo de la familia Qwen con pipeline image-text-to-text, es decir, un transformer multimodal con torre de vision y modelo de lenguaje. El adaptador LoRA tiene rango 32 y, segun el script de inferencia incluido, se adhieren 496 modulos LoRA, ninguno de ellos en la torre de vision; el ajuste afecta por tanto solo a las capas del modelo de lenguaje.

La model card distingue dos variantes de entrenamiento: R2-A, con muestreo uniforme, y R2-B, la version publicada, que anade muestreo de caracteres dificiles. Los datos de entrenamiento provienen de tres conjuntos de datos coreanos (identificados en la evaluacion como fuente 91, fuente 605 y fuente 105), con controles de fuga explicitos: solapamiento cero entre entrenamiento y desarrollo por hash de fichero, hash de pixeles decodificados y hash de imagen fuente; cero solapamiento de escritores en la fuente 91; y eliminacion de imagenes de entrenamiento casi duplicadas de candidatos de desarrollo (dHash <= 4 y pHash <= 8). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Transcripcion de una unica palabra coreana a partir de una imagen recortada, con salida de solo texto.
- Manejo de escritura manuscrita coreana (fuentes 91 y 605) y de texto impreso (fuente 105).
- Lectura de texto en escena (scene text) dentro de los limites del conjunto evaluado.
- Inferencia multimodal imagen-texto mediante el procesador y la plantilla de chat del modelo base, con `enable_thinking=False`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades del modelo base en el contexto de este adaptador.
- No se documentan capacidades multilingues: el unico idioma declarado es el coreano.

## Casos de uso

- Digitalizacion de formularios manuscritos coreanos: el adaptador puede transcribir campos de una sola palabra (nombre, importe, codigo) recortados previamente por un detector de texto, con un CER medido del 12,27 % en la fuente de escritura manuscrita 91.
- Procesamiento de tickets y recibos: sobre recortes de palabras impresas, el CER medido es del 1,61 % en la fuente 105, adecuado para extraer importes, fechas o nombres de producto tras una segmentacion previa.
- Indexacion de archivos escaneados: permite generar metadatos textuales por palabra para busqueda posterior, siempre que un sistema externo se encargue de la deteccion, el recorte y el orden de lectura.
- Anotacion asistida de corpus OCR: el adaptador puede preanotar recortes de palabra para que un revisor humano corrija, reduciendo el coste frente a la transcripcion manual.
- Lectura de rotulos y texto en escena: el CER del 6,57 % en la fuente de scene text lo hace util para extraer palabras sueltas de fotografias una vez aisladas.
- Validacion de pipelines OCR existentes: sirve como referencia de calidad por palabra en pruebas internas, con la advertencia de que no se ha comparado cara a cara con modelos OCR especializados bajo un protocolo comun.
- Prototipado de investigación en ajuste fino multimodal: el adaptador y el script de inferencia documentan el protocolo completo (prompt, `min_pixels`/`max_pixels`, decodificacion voraz), lo que facilita reproducir y extender el experimento.

## Benchmarks y rendimiento

Resultados de CER sobre el conjunto de desarrollo fijo de 2.400 recortes (600 por fuente), tras normalizacion Unicode NFC y eliminacion de espacios. Menor es mejor.

| Modelo | Global (2.400) | Manuscrito 91 | Manuscrito 605 | Impreso 105 | Scene text |
|---|---|---|---|---|---|
| Qwen3.6-27B (base, mismo prompt) | 18,04 % | 37,77 % | 23,76 % | 6,54 % | 10,38 % |
| Adaptador R2-A (muestreo uniforme, referencia) | 6,42 % | 12,19 % | 6,31 % | 2,23 % | 6,71 % |
| Adaptador R2-B (esta publicacion) | 6,01 % | 12,27 % | 5,53 % | 1,61 % | 6,57 % |

Tasa de coincidencia exacta (palabra completa correcta), todas las fuentes: base 72,7 %, R2-A 84,0 %, R2-B 85,2 %.

Diferencias pareadas con intervalos de confianza del 95 % (bootstrap pareado estratificado sobre los 2.400 identificadores, 2.000 remuestreos, preregistrado):

| Comparacion | Diferencia (pp) | IC 95 % |
|---|---|---|
| R2-B vs base, todas las fuentes | -12,03 | [-14,88, -9,73] |
| R2-B vs R2-A, todas las fuentes | -0,41 | [-0,82, -0,03] |
| R2-B vs R2-A, manuscrito 91 | +0,08 | [-0,89, +0,92] (cluster por escritor) |

La mejora de R2-B sobre R2-A es fragil: el limite superior del IC queda cerca de cero y alcanza 0,0 en un analisis de sensibilidad que elimina 274 candidatos casi duplicados. No se han publicado comparaciones con modelos OCR especializados bajo un protocolo compartido.

## Requisitos de hardware

- VRAM estimada: aproximadamente 53 GB de memoria GPU a batch 1 en bf16, segun la model card.
- GPU recomendadas: el autor midio la latencia en una NVIDIA B200; por requisito de memoria, se necesitan GPU con al menos 53 GB, como A100 de 80 GB, H100 o B200. No cabe en GPU de consumo (RTX 4090 de 24 GB, por ejemplo) en bf16.
- Opciones de despliegue: transformers >= 5.0 con PEFT >= 0.21 y Pillow, segun el ejemplo oficial. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y rendimiento: mediana de aproximadamente 0,46 s por recorte en una B200, batch 1. Es una medicion interna, no un benchmark de servido. No se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER global (conjunto interno) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiOCR-Large-27B-R2B | Adaptador LoRA sobre 27B | No disponible | 6,01 % | Apache-2.0 | Hugging Face (adaptador) |
| Qwen3.6-27B (base, mismo prompt) | 27B | No disponible | 18,04 % | La del modelo base (no indicada en la informacion) | Hugging Face |
| Adaptador R2-A (referencia del autor) | Adaptador LoRA sobre 27B | No disponible | 6,42 % | No disponible | No disponible publicamente |
| Modelos OCR especializados | No disponible | No disponible | No comparado por el autor | No disponible | No disponible |

El autor declara explicitamente que no ha realizado ninguna comparacion cara a cara con modelos OCR especializados bajo un protocolo comun, por lo que no se dispone de datos comparativos con alternativas de la categoria.

## Limitaciones y advertencias

- Solo lee recortes de una unica palabra. No se evaluaron OCR de pagina completa, lectura de lineas o parrafos, analisis de maquetacion ni orden de lectura.
- No se ha probado la generalizacion a fuentes tipograficas nuevas, documentos de escritores nuevos, tipos de documento nuevos ni condiciones de captura nuevas.
- El conjunto de desarrollo es en distribucion: procede de las divisiones de validacion oficiales de los mismos tres conjuntos de datos usados en entrenamiento, por lo que no es un conjunto de test independiente.
- La mejora de R2-B sobre R2-A es estadisticamente limite y desaparece en el analisis de sensibilidad; en la fuente de manuscrito 91, R2-B no supera a R2-A.
- La ganancia de R2-B se concentra en digitos, caracteres latinos y caracteres vistos entre 5 y 49 veces en entrenamiento; no aparece en caracteres vistos 4 veces o menos.
- El protocolo de inferencia es estricto: prompt en coreano literal, `min_pixels = 64*64`, `max_pixels = 1024*1024`, decodificacion voraz (`do_sample=False`), `max_new_tokens=64`, batch 1 y bf16. Otros prompts, tamanos de imagen o ajustes de muestreo no fueron evaluados. El `generation_config.json` del modelo base activa muestreo por defecto, por lo que hay que forzar `do_sample=False`.
- La licencia del adaptador es Apache-2.0, pero el uso comercial esta condicionado por la licencia del modelo base Qwen/Qwen3.6-27B, que no se detalla en la informacion proporcionada.
- No se documentan sesgos conocidos, tasas de alucinacion fuera del dominio evaluado ni comportamiento en idiomas distintos del coreano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/ThakiOCR-Large-27B-R2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Tarjeta en coreano: https://huggingface.co/ThakiCloud/ThakiOCR-Large-27B-R2B/blob/main/MODEL_CARD.ko.md
- Script de inferencia: https://huggingface.co/ThakiCloud/ThakiOCR-Large-27B-R2B/blob/main/inference_example.py
