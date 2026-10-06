# tezrt/MAYA

## Resumen

MAYA es un adaptador LoRA de texto a imagen publicado por el usuario tezrt en HuggingFace, entrenado sobre el modelo base krea/Krea-2-Turbo. Se distribuye en formato diffusers (la librería declarada es diffusers, con el tag template:diffusion-lora) y ocupa 0,2 GB en el repositorio, un tamaño coherente con un adaptador de bajo rango y no con un modelo completo. Su palabra de activación declarada es `ohwx`, el token comodín habitual en los entrenamientos de tipo DreamBooth/LoRA, lo que sugiere que el adaptador está pensado para inyectar un sujeto o un estilo concreto en las generaciones del modelo base.

La relevancia práctica del modelo es limitada tal y como está publicado: no hay documentación técnica, la model card se reduce a unas pocas líneas con contenido sin sentido ("DNDJKN") y no se declara ni el conjunto de datos de entrenamiento, ni el número de pasos, ni el rango del LoRA, ni métricas de calidad. El repositorio registra 0 descargas y 0 "likes", y fue creado y actualizado el 5 de octubre de 2026 con apenas unos minutos de diferencia, lo que apunta a un artefacto de prueba o a una publicación sin mantenimiento posterior.

En consecuencia, esta ficha puede describir con precisión la licencia, el formato de distribución, el flujo de uso con diffusers y las precauciones legales, pero todos los datos de arquitectura interna, capacidades reales, idiomas y rendimiento quedan marcados como no disponibles porque no figuran en la información proporcionada ni se han encontrado fuentes externas fiables al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion de texto a imagen (base: krea/Krea-2-Turbo). Arquitectura interna del modelo base: no disponible |
| Parametros totales | No disponible (el repositorio ocupa 0,2 GB, consistente con un adaptador LoRA; no se detalla el numero de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de texto a imagen; no se documenta la longitud de prompt soportada) |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas ni versiones GGUF/ONNX) |
| Idiomas soportados | No disponible (no se declara ningun idioma; la model card esta en ingles) |
| Licencia | creativeml-openrail-m (CreativeML Open RAIL-M) |
| Formato de pesos | Formato diffusers (libreria declarada: diffusers). Formato de fichero concreto (safetensors, bin) no confirmado en la informacion disponible |
| Modelo base | krea/Krea-2-Turbo |
| Palabra de activacion | `ohwx` |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-10-05 / 2026-10-05 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del adaptador más allá de los metadatos de HuggingFace: los tags indican `lora`, `diffusers`, `text-to-image` y `template:diffusion-lora`, y la etiqueta de modelo base apunta a `krea/Krea-2-Turbo` como adaptador (`base_model:adapter:krea/Krea-2-Turbo`). No se especifica el rango del LoRA, las capas objetivo (attention, proyecciones, etc.), la resolución de entrenamiento, el número de pasos, la tasa de aprendizaje ni el optimizador. La arquitectura del modelo base (difusión latente, transformer de difusión o cualquier otra variante) tampoco se detalla en la información disponible.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica la composición del conjunto de datos, el número de imágenes, si hubo regularización previa (prior preservation), si se aplicaron técnicas como DreamBooth, LoRA clásico o variantes tipo LoHa/LoKr, ni si se usó ajuste por preferencias humanos (RLHF/DPO) —poco habitual en modelos de difusión, por otra parte—. La única señal de método es la palabra de activación `ohwx`, típica de los entrenamientos de sujeto, y los valores de ejemplo del widget (`text: DVSD`, `negative_prompt: SDVSD`), que parecen marcadores de posición sin valor informativo.

## Capacidades

La información disponible solo permite afirmar lo siguiente, siempre condicionado al modelo base:

- Generación de imágenes a partir de texto mediante la librería diffusers, cargando el LoRA sobre `krea/Krea-2-Turbo`.
- Aplicación de un concepto o estilo concreto mediante la palabra de activación `ohwx`, presumiblemente un sujeto entrenado de forma personalizada.
- Uso de prompt negativo, según el ejemplo de la model card (aunque los valores mostrados son marcadores sin sentido).
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": son capacidades ajenas a la categoría del modelo.
- Capacidades multilingües: no disponibles; no se declara ningún idioma soportado.
- No se documentan capacidades especiales (ControlNet, inpainting, img2img, IP-Adapter) más allá de las que ofrezca el modelo base por sí mismo.

## Casos de uso

Siempre con la advertencia de que el rendimiento real no está documentado y depende del modelo base:

- Generación de retratos consistentes de un personaje: gracias al token `ohwx`, el adaptador parece orientado a mantener una identidad concreta en distintas escenas. Se usaría cargando el LoRA sobre Krea-2-Turbo e incluyendo `ohwx` en el prompt; es el escenario para el que el propio autor parece haberlo entrenado.
- Ilustración editorial y storyboards: repetición de un mismo personaje o estilo a lo largo de varias viñetas, aprovechando la consistencia que aporta un LoRA de sujeto frente a un prompt puramente textual.
- Creación de avatares y assets para videojuegos o aplicaciones: prototipado rápido de variaciones de un personaje a partir de un único LoRA, sin reentrenar el modelo base.
- Personalización de campañas de marketing: generación de material gráfico con una imagen de marca o mascota recurrente, integrando el adaptador en el pipeline de generación existente.
- Integración en flujos ComfyUI o diffusers: al ser un LoRA en formato diffusers, se puede cargar con `load_lora_weights` y combinarlo con otros adaptadores o con el pipeline del modelo base para producción por lotes.
- Investigación sobre fine-tuning de bajo rango: el repositorio sirve como ejemplo de estructura de publicación de un LoRA (tags, trigger word, licencia) para estudiar cómo se empaquetan estos adaptadores.
- Generación de datos sintéticos: creación de imágenes de un sujeto concreto para aumentar un dataset de entrenamiento de otros modelos, sujeto a las restricciones de la licencia.
- Pruebas de concepto en pipelines de imagen: validar la composición de LoRA + modelo turbo (pocos pasos de inferencia) antes de invertir en entrenamientos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de ningún tipo (FID, CLIP score, similitud de sujeto, evaluaciones humanas) y la búsqueda web realizada no ha devuelto ninguna fuente técnica relacionada con este modelo: los resultados obtenidos eran páginas sin relación alguna con el modelo y no se han tenido en cuenta.

## Requisitos de hardware

- VRAM para el adaptador LoRA: el propio LoRA es ligero (repositorio de 0,2 GB), por lo que su sobrecarga en memoria durante la inferencia es pequeña comparada con el modelo base.
- VRAM para la inferencia completa: no disponible. Viene determinada casi por completo por `krea/Krea-2-Turbo`, cuyas especificaciones, resolución nativa y precisión no figuran en la información proporcionada. Sin ese dato no es posible dar una cifra fiable.
- GPU recomendadas: no disponible por la misma razón; habría que consultar los requisitos publicados por el modelo base.
- Compatibilidad con GPU de consumo: no confirmada. Si el modelo base es una variante turbo optimizada para pocos pasos de inferencia, es plausible que quepa en GPUs de consumo con 8-16 GB de VRAM, pero esto es una suposición no verificada y no debe tomarse como dato.
- Opciones de despliegue: al declararse la librería diffusers, la vía natural es Diffusers (`StableDiffusionPipeline`/pipeline equivalente del base + `load_lora_weights`). También cabría su uso en ComfyUI o en interfaces compatibles con LoRA en formato diffusers, siempre que soporten el modelo base. No se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles. Dependen del modelo base, del número de pasos, de la resolución y del hardware.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo que permitan una comparativa cuantitativa. La tabla siguiente contrasta únicamente aspectos objetivos y verificables de la categoría (adaptadores LoRA de texto a imagen), marcando como no disponible lo que no se puede comprobar:

| Modelo | Tipo | Modelo base | Tamano del repo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| tezrt/MAYA | LoRA de texto a imagen | krea/Krea-2-Turbo | 0,2 GB | creativeml-openrail-m | No disponible |
| LoRA de sujeto generico sobre SDXL | LoRA de texto a imagen | Modelos de la familia SDXL | Variable (tipicamente 0,1-0,5 GB) | Habitualmente CreativeML OpenRAIL-M o similar | No comparable sin evaluacion propia |
| LoRA de estilo sobre FLUX.1 | LoRA de texto a imagen | Modelos de la familia FLUX.1 | Variable (tipicamente 0,1-1 GB) | Depende del modelo base y del autor | No comparable sin evaluacion propia |

No se dispone de información sobre alternativas directamente comparables entrenadas sobre el mismo modelo base, por lo que la comparación de rendimiento con `krea/Krea-2-Turbo` sin adaptador tampoco puede cuantificarse.

## Limitaciones y advertencias

- Documentación inexistente: la model card contiene texto sin sentido ("DNDJKN") y no describe el modelo, el dataset ni el proceso de entrenamiento. No es posible evaluar su calidad ni su idoneidad para producción.
- Procedencia de los datos desconocida: no se declara qué imágenes se usaron para el entrenamiento ni si se contó con consentimiento de las personas representadas. Si el LoRA reproduce la identidad de una persona real, su uso comercial puede vulnerar derechos de imagen.
- Riesgo de sobreajuste: los LoRA de sujeto entrenados con pocas imágenes tienden a reproducir de forma rígida los encuadres, fondos y poses del conjunto de entrenamiento, y a degradar la diversidad de las generaciones. No hay información que permita descartarlo.
- Palabra de activación genérica: `ohwx` es un token comodín muy habitual en entrenamientos de sujeto, por lo que puede colisionar con otros adaptadores cargados simultáneamente y producir interferencias.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomías incorrectas, texto ilegible, artefactos y composiciones incoherentes, especialmente con prompts largos o conceptos poco representados.
- Idiomas: no se declara ningún idioma soportado; no hay garantía de que los prompts en castellano se interpreten correctamente.
- Restricciones de licencia: CreativeML Open RAIL-M permite el uso comercial, pero impone restricciones de uso recogidas en su anexo (prohibición de generar contenido difamatorio, de desinformación, de explotación de menores, etc.) y obliga a propagar esas mismas restricciones a los usuarios posteriores. Conviene revisar además la licencia específica de `krea/Krea-2-Turbo`, que puede añadir condiciones adicionales y que no se detalla en la información disponible.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin verificación por parte de terceros; debería tratarse como un artefacto no validado.
- Ausencia de benchmarks: no existe ninguna métrica publicada que respalde la calidad del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tezrt/MAYA
- Ficheros y versiones del repositorio: https://huggingface.co/tezrt/MAYA/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentacion de Diffusers sobre carga de LoRA: https://huggingface.co/docs/diffusers/main/en/tutorials/using_peft_for_inference

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (los resultados obtenidos eran paginas sin relacion con la IA y no se han incluido). No hay papers, blogs, repositorios ni demos adicionales disponibles.
