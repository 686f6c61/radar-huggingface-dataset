# TULLUS/paligemma2-3b-mix-448

## Resumen

TULLUS/paligemma2-3b-mix-448 es un ajuste fino (fine-tune) de terceros sobre la familia PaliGemma 2 de Google, un modelo multimodal de vision-lenguaje que acepta imagenes y texto como entrada y genera texto. El repositorio declara 3.033.127.152 parametros (~3,03 B) y una resolucion de imagen de 448 x 448 px, lo que con parches de 14 px produce 1.024 tokens visuales por imagen. El modelo se distribuye en formato safetensors para la libreria transformers, con pipeline image-text-to-text, y el repositorio ocupa 6,1 GB.

La relevancia de esta ficha es doble. Por un lado, PaliGemma 2 es una de las referencias abiertas mas utilizadas para tareas de transferencia visual (VQA, captioning, OCR, deteccion y segmentacion con salida textual). Por otro, este repositorio concreto pertenece a un autor independiente (TULLUS), tiene acceso restringido mediante aceptacion de condiciones en HuggingFace y no incluye model card publica con detalles de entrenamiento, datos o evaluacion, por lo que debe tratarse como un artefacto no verificado.

Se trata de un modelo denso, no MoE, que combina un codificador visual SigLIP con un modelo de lenguaje de la familia Gemma 2, siguiendo la receta de PaliGemma 2 publicada por Google en diciembre de 2024. La nomenclatura "mix" coincide con las variantes de PaliGemma 2 entrenadas con mezcla de resoluciones (224, 448 y 896 px); este repositorio fija la variante de 448 px, si bien este punto no esta confirmado en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo prefix-LM: codificador visual SigLIP + modelo de lenguaje Gemma 2 (familia PaliGemma 2) |
| Parametros totales | 3.033.127.152 (~3,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredado de la arquitectura Gemma 2); no confirmado en la ficha del repositorio |
| Resolucion de imagen | 448 x 448 px (~1.024 tokens visuales con parches de 14 px) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors en precision completa |
| Idiomas soportados | no disponible en la ficha; la familia PaliGemma 2 esta centrada en ingles |
| Licencia | Gemma Terms of Use (etiqueta license:gemma), con acceso restringido |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 6,1 GB |
| Acceso | restringido (gated); requiere aceptar condiciones en HuggingFace |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura corresponde al diseno de PaliGemma 2: un codificador visual SigLIP que convierte la imagen en una secuencia de embeddings de parches y un decodificador de lenguaje de la familia Gemma 2 que genera texto condicionado por ese prefijo visual. La variante de 3 B de la familia combina un codificador SigLIP de aproximadamente 400 M de parametros con un modelo de lenguaje Gemma 2 de aproximadamente 2,6 B, lo que cuadra con los 3,03 B totales declarados en el safetensors. El prefijo visual se procesa como tokens de imagen y el modelo opera en regimen de prefijo-LM: atencion bidireccional sobre el prefijo y causal sobre el texto generado.

No se dispone de informacion sobre el proceso de entrenamiento de este ajuste concreto: ni el dataset, ni el numero de tokens o imagenes, ni si hubo RLHF, DPO o una fase de instruction tuning. Tampoco se documenta si el ajuste congela o descongela el codificador visual, ni la composicion del "mix" al que alude el nombre del repositorio. La unica referencia tecnica solida es la del paper de PaliGemma 2 (arXiv:2412.03555), que describe el entrenamiento de las variantes oficiales: preentrenamiento multimodal a gran escala, ajuste por etapas y variantes "mix" entrenadas conjuntamente con varias resoluciones (224, 448 y 896 px) para mejorar la transferencia.

## Capacidades

- Generacion de texto condicionada por imagen: descripcion de escenas, subtitulado (captioning) y respuesta a preguntas visuales (VQA).
- OCR y lectura de texto en imagen, incluyendo documentos, capturas, senalizacion y texto manuscrito dentro de los limites del modelo base.
- Localizacion visual: la familia PaliGemma 2 puede emitir coordenadas en formato de texto para tareas de deteccion de objetos, deteccion de puntos y segmentacion referida.
- Transferencia a tareas visuales especializadas mediante ajuste fino: clasificacion de imagenes, deteccion de anomalias, reconocimiento de documentos y similares.
- Generacion de texto libre y razonamiento basico en lenguaje natural, heredado del modelo Gemma 2 subyacente.
- Capacidades multilingues: no documentadas para este repositorio; la familia PaliGemma 2 esta entrenada principalmente con datos en ingles.
- Tool calling / function calling: no se documenta soporte nativo en este repositorio ni en la familia PaliGemma 2.
- Modo "thinking" o razonamiento extendido: no disponible.
- Entrada de audio o video: no disponible.
- Soporte de agentes multi-paso: no documentado; requeriria orquestacion externa.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede extraer campos clave (emisor, CIF, importe, fecha) de documentos escaneados a 448 px de resolucion, donde el OCR sobre texto impreso es fiable; conviene anadir validacion posterior por reglas para evitar errores en cifras.
- Descripcion automatica de catalogos de producto: generacion de titulos y descripciones para imagenes de e-commerce, aprovechando la resolucion de 448 px para capturar detalles de producto y texto de envases.
- Control de calidad visual en linea de produccion: ajuste fino sobre imagenes de defectos para clasificacion binaria o localizacion de la region defectuosa mediante salida de coordenadas, con inferencia en GPU de gama media.
- Accesibilidad: generacion de descripciones de imagenes para lectores de pantalla, en un modelo de 3 B que puede ejecutarse en hardware de consumo y no requiere enviar contenido a servicios externos.
- Analisis de imagenes medicas o cientificas de bajo riesgo: respuesta a preguntas sobre capturas o laminas, siempre como apoyo y nunca como sustituto de diagnostico profesional, dado el riesgo de alucinacion del modelo.
- Extraccion estructurada de formularios y documentos escaneados: conversion de documentos a JSON mediante plantillas de prompt, con un paso de validacion de tipos y rangos.
- Moderacion de contenido visual: clasificacion de imagenes subidas por usuarios segun politicas internas, usando ajuste fino sobre un conjunto etiquetado propio.
- Prototipado rapido de aplicaciones multimodales: al ser un modelo de 3 B con pesos safetensors, permite iterar en una unica GPU y migrar despues a variantes mayores de la familia si hace falta mas capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye model card con evaluaciones y no se han encontrado resultados especificos de este ajuste en la busqueda web realizada. La familia PaliGemma 2 si publica resultados en tareas como VQAv2, TextVQA, DocVQA, COCO captioning, RefCOCO y ScreenQA, pero corresponden a los checkpoints oficiales de Google y no son extrapolables a este fine-tune de terceros.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 6,1 GB solo para pesos, mas activaciones y memoria del key-value cache; en la practica entre 8 y 10 GB para inferencia con imagenes a 448 px (1.024 tokens visuales).
- VRAM estimada cuantizado: aproximadamente 3,5-4 GB en int8 y 2-2,5 GB en int4, siempre que se genere una version cuantizada del modelo (no publicada en el repositorio).
- GPU consumer compatibles: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, asi como en Apple Silicon con memoria unificada suficiente.
- GPU de datacenter compatibles: A10G, L4, L40S, A100 y H100, todas sobradas para un modelo de 3 B.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (etiqueta declarada), y vLLM para servir con batching continuo. El soporte en llama.cpp u Ollama no esta confirmado para este repositorio, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por imagen para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| TULLUS/paligemma2-3b-mix-448 | ~3,03 B | 8.192 tokens (arquitectura Gemma 2) | Gemma Terms of Use | Restringido (gated) | Fine-tune de terceros sin evaluacion publicada |
| PaliGemma 2 3B (Google) | ~3 B | 8.192 tokens (arquitectura Gemma 2) | Gemma Terms of Use | Restringido (gated) | Checkpoint oficial de referencia de la familia |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | 32.768 tokens segun documentacion publica de la familia | Apache 2.0 | Abierto | Mayor contexto y licencia permisiva; datos segun documentacion publica, no verificados aqui |
| Gemma 3 4B-IT | ~4 B | 128.000 tokens segun documentacion publica de la familia | Gemma Terms of Use | Restringido (gated) | Misma familia de licencia, contexto muy superior; datos segun documentacion publica, no verificados aqui |

La comparacion debe tomarse con cautela: los datos de las filas de Qwen2.5-VL y Gemma 3 provienen de la documentacion publica de sus familias y no se han verificado en el contexto de esta ficha. Para este repositorio concreto no existe ningun dato de rendimiento que permita afirmar que iguala o supera a los checkpoints oficiales.

## Limitaciones y advertencias

- Modelo no verificado: se trata de un ajuste de un autor independiente, sin model card, sin dataset documentado y con 0 descargas y 0 likes en el momento de la consulta. No hay evidencia publica de su calidad.
- Riesgo de alucinacion: como todo VLM de 3 B, puede inventar texto en imagenes (por ejemplo, cifras en facturas) o describir objetos ausentes. Es obligatorio validar la salida en cualquier flujo con consecuencias economicas o legales.
- Sesgos: no se ha publicado ningun analisis de sesgos para este ajuste. La familia base hereda sesgos de los corpus web de entrenamiento, incluyendo sesgos de genero, etnia y geografia.
- Idioma: la familia PaliGemma 2 esta centrada en ingles. El rendimiento en castellano no esta documentado y previsiblemente sera peor, especialmente en OCR de texto en espanol con acentos y caracteres como la enye.
- Contexto limitado: 8.192 tokens es reducido para conversaciones multi-turno largas o documentos extensos; cada imagen a 448 px ya consume alrededor de 1.024 tokens.
- Resolucion fija: el modelo trabaja a 448 x 448 px. Texto muy pequeno o documentos de alta densidad pueden degradarse; no se documenta soporte de resoluciones alternativas en este repositorio.
- Sin tool calling: no hay soporte nativo de llamada a funciones, lo que obliga a implementar un parser externo si se quiere integrar en agentes.
- Licencia Gemma: el uso comercial esta permitido bajo los terminos de Gemma, pero incluye una politica de uso prohibido y obligaciones de redistribucion de los terminos a terceros. Al estar el repositorio restringido, el acceso requiere aceptar condiciones en HuggingFace.
- Sin cuantizaciones oficiales: no hay GGUF ni GPTQ/AWQ publicados, por lo que desplegar en CPU o en GPUs pequenas exige generar la cuantizacion por cuenta propia y validar la perdida de calidad.
- Sin benchmarks: no existe ninguna evaluacion reproducible que permita comparar este modelo con alternativas antes de ponerlo en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TULLUS/paligemma2-3b-mix-448
- PaliGemma 2: A Family of Versatile VLMs for Transfer (paper de referencia de la familia): https://arxiv.org/abs/2412.03555
- PaliGemma: A versatile 3B VLM for transfer: https://arxiv.org/abs/2407.07726
- Gemma 2: Improving Open Language Models at a Practical Size: https://arxiv.org/abs/2408.00118
- Sigmoid Loss for Language Image Pre-Training (SigLIP): https://arxiv.org/abs/2303.15343
- PaLI: A Jointly-Scaled Multilingual Language-Image Model: https://arxiv.org/abs/2209.06794
- Attention Is All You Need: https://arxiv.org/abs/1706.03762
- An Image is Worth 16x16 Words (ViT): https://arxiv.org/abs/2010.11929
- Resto de identificadores arXiv incluidos en los tags del repositorio (25 en total): consultar la seccion de etiquetas de la ficha de HuggingFace, ya que no se han podido verificar sus titulos en esta busqueda.
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por el buscador corresponden a un monedero de criptomonedas (Nimiq Wallet) y no guardan ninguna relacion con el modelo.
