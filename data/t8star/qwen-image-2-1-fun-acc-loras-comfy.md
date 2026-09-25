# t8star/Qwen-Image-2.1-Fun-Acc-LoRAs-Comfy

## Resumen

Este repositorio no contiene un modelo completo, sino el adaptador de aceleracion (LoRA de 4 pasos) para Qwen-Image-2.1 empaquetado especificamente para ComfyUI. El autor es t8star, que publica una version "companion" del adaptador original de Alibaba PAI: los 528 tensores del payload original se mantienen intactos y solo se han anadido metadatos de identificacion para que el nodo de muestreo los reconozca. El repositorio ocupa 0,3 GB y su peso esta en `Qwen-Image-2.1-Fun-Acc-4Step-PDD-T8.safetensors`.

El modelo base, Qwen-Image-2.1, es un modelo unificado de generacion de imagen y edicion de imagen de la familia Qwen, con unos 7000 millones de parametros en su componente de generacion visual y 32 capas DiT de flujo unico (single-stream). Este adaptador lo que aporta es reducir el muestreo a un calendario fijo de cuatro pasos, con cuatro cabezas de salida especificas por paso que deben conmutarse dinamicamente durante la inferencia.

La relevancia practica esta en el ahorro de tiempo de inferencia: pasar de un muestreo completo a 4 pasos fijos abarata mucho la generacion tanto en text-to-image como en edicion con imagen de referencia. La contrapartida es que no es un LoRA convencional: no funciona con un `LoRA Loader` estandar y exige el nodo sampler del autor, ademas de los assets base de Comfy-Org.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador tipo LoRA sobre el modelo base Qwen-Image-2.1, que es un transformer de difusion (DiT) de 32 capas single-stream. El adaptador incorpora cuatro cabezas de salida especificas por paso |
| Parametros totales | No disponible para el adaptador (repositorio de 0,3 GB con 528 tensores). El modelo base declara unos 7000 millones de parametros en su componente de generacion visual |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: es un modelo de generacion y edicion de imagen, no procesa contexto de texto en el sentido de un LLM |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo entrega pesos en safetensors |
| Idiomas soportados | Zh (chino), en (ingles) |
| Licencia | qwen-research (etiquetada como `other` en HuggingFace); ver LICENSE y NOTICE del repositorio |
| Formato de pesos | safetensors (`Qwen-Image-2.1-Fun-Acc-4Step-PDD-T8.safetensors`) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 emplea una arquitectura de transformer de difusion con 32 capas single-stream y un componente de generacion visual de aproximadamente 7000 millones de parametros, disenada para equilibrar calidad de generacion, eficiencia de inferencia y versatilidad. Sobre esa base, el adaptador Fun-Acc implementa un esquema de aceleracion en cuatro pasos: en lugar de un unico LoRA aplicable en cualquier paso del muestreo, el bundle contiene cuatro cabezas de salida diferenciadas que el nodo sampler debe ir conmutando paso a paso. Esta es la razon tecnica por la que un `LoRA Loader` convencional no puede ejecutarlo correctamente.

El repositorio de t8star no reentrena ni modifica los pesos: conserva los 528 tensores del adaptador original de Alibaba PAI y solo anade metadatos de identificacion. Los detalles concretos de entrenamiento del adaptador (numero de tokens o imagenes, composicion del dataset, uso de RLHF/DPO, o la definicion exacta del acronimo PDD) no estan disponibles en la informacion proporcionada. La revision del modelo original citada en la model card es `f7545234760e1847cd8e89e52bd951cb0b7e327f` y el SHA-256 del archivo safetensors es `6f6fc81bea6ce13f2515e21cc2b62de374fa77ecc43f18988028bbf1b3403ee4`.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con un calendario fijo de 4 pasos.
- Edicion de imagen: acepta una imagen de referencia cargada en el nodo `Load Image` y la modifica segun el prompt.
- Integracion nativa en ComfyUI mediante el nodo sampler especifico `Comfyui-Qwen-Image-2.1-Fun-Acc-LoRAs-T8`, con workflows de ejemplo listos para arrastrar.
- Generacion a resolucion nativa 2K y soporte de tipografia profesional, capacidades atribuidas al modelo base Qwen-Image-2.1.
- Soporte de canal alfa (alpha channel) en el modelo base, segun la documentacion de ComfyUI.
- Prompts en chino e ingles.
- No dispone de tool calling, function calling, modo thinking ni capacidades de agente: no es un modelo de lenguaje.
- No se documentan capacidades de audio, video ni vision comprensiva mas alla de la propia edicion de imagen.

## Casos de uso

- Iteracion rapida de prompts en diseno grafico: el calendario de 4 pasos permite generar y descartar variantes a un coste de computo mucho menor, lo que hace viable explorar decenas de propuestas en una sesion de trabajo en ComfyUI.
- Edicion de producto para e-commerce: se carga la foto de un articulo y se reformula el fondo, la iluminacion o el entorno mediante prompt, manteniendo el sujeto original como referencia.
- Restauracion o retoque de material grafico corporativo: la edicion con imagen de referencia permite limpiar, recolorear o reencuadrar activos existentes sin volver a generarlos desde cero.
- Prototipado de interfaces y mockups: generacion rapida de pantallas y elementos visuales para validar direccion de arte antes de invertir en produccion.
- Creacion de variantes de campana con texto integrado: la base incluye tipografia profesional y salida 2K, util para piezas con rotulacion que requieren legibilidad.
- Generacion de assets para pipelines de contenido automatizado: al ser un nodo de ComfyUI, se puede encadenar con otros nodos (upscalers, postprocesado, control de color) dentro de un grafo reproducible en produccion.
- Experimentacion en investigacion sobre destilacion por pasos: sirve como referencia practica de un adaptador de 4 pasos con cabezas por paso conmutadas, comparable frente a otros esquemas de aceleracion.
- Material para creadores de contenido grafico: la model card enlaza galeria gratuita, aplicaciones online y canales de Bilibili y YouTube del autor, orientados a flujos de trabajo listos para usar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los resultados de busqueda proporcionados incluyen metricas cuantitativas (FID, CLIP score, evaluaciones de edicion, comparativas de calidad por numero de pasos) para este adaptador ni para el modelo base.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,3 GB); el consumo real lo determina el modelo base Qwen-Image-2.1, el text encoder y el VAE de Comfy-Org.
- Estimacion derivada del tamano del modelo base (unos 7000 millones de parametros en el componente visual): en fp16 los pesos del DiT rondan los 14 GB, a los que hay que sumar el text encoder y el VAE. El total agregado no esta confirmado en la informacion disponible.
- GPU recomendadas para fp16 sin cuantizar: A100, H100 o RTX 4090 con 24 GB o mas, segun el consumo agregado real del pipeline completo.
- Viabilidad en GPU de consumo: probablemente en RTX 4090 y RTX 3090 (24 GB) e inferior si se usan variantes cuantizadas del modelo base; no hay datos confirmados de cuantizaciones concretas en la informacion proporcionada.
- Opciones de despliegue: ComfyUI es el entorno de referencia y el unico soportado por el adaptador, ya que requiere el nodo sampler `Comfyui-Qwen-Image-2.1-Fun-Acc-LoRAs-T8`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles. El unico dato objetivo de rendimiento es que el muestreo esta fijado en 4 pasos en lugar de un calendario completo.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t8star Qwen-Image-2.1-Fun-Acc-LoRAs-Comfy | Adaptador de 0,3 GB sobre base de ~7B | 4 (fijo) | zh, en | qwen-research | HuggingFace; requiere nodo ComfyUI propio |
| alibaba-pai Qwen-Image-2.1-Fun-Acc-LoRAs (original) | Mismos 528 tensores, sin metadatos ComfyUI | 4 | zh, en | qwen-research | HuggingFace; no empaquetado para ComfyUI |
| Qwen/Qwen-Image-2.1 (base, sin adaptador) | ~7B en el componente visual, 32 capas DiT | Calendario completo | zh, en | qwen-research | HuggingFace y assets Comfy-Org |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la comparativa se limita a parametros, esquema de muestreo, licencia y disponibilidad. La diferencia funcional clave entre las tres filas es el numero de pasos y el empaquetado de integracion, no la calidad medida.

## Limitaciones y advertencias

- No es un LoRA convencional: no puede cargarse con un `LoRA Loader` estandar en ComfyUI. Intentarlo produce resultados incorrectos o errores.
- Requiere obligatoriamente el nodo sampler `Comfyui-Qwen-Image-2.1-Fun-Acc-LoRAs-T8`, que conmuta las cuatro cabezas de salida paso a paso; sin el, el bundle PDD no funciona.
- El calendario esta fijado en 4 pasos; no admite ajuste de pasos ni schedulers alternativos segun la documentacion del autor.
- Depende de los assets base de Comfy-Org (modelo base, text encoder y VAE) descargados por separado.
- Licencia `qwen-research`: es una licencia especifica de investigacion, no una licencia permisiva generica. Antes de cualquier uso comercial hay que revisar el archivo LICENSE y el NOTICE del repositorio, asi como los terminos del modelo base Qwen-Image-2.1.
- Idiomas limitados a chino e ingles; no se documenta soporte de otros idiomas, por lo que los prompts en castellano pueden degradar el resultado.
- Riesgo de sesgos y de alucinacion visual inherente a los modelos de difusion entrenados con datos a gran escala; no hay evaluaciones publicadas de sesgo para este adaptador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senales de validacion comunitaria ni garantia de mantenimiento.
- La mayoria de los enlaces de la model card (API de pago, galeria, plataforma de apps, paquete en la nube) son promocionales del autor y no forman parte del modelo.
- El adaptador se publica sin benchmarks, por lo que no se puede verificar de forma independiente la perdida de calidad respecto al muestreo completo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/t8star/Qwen-Image-2.1-Fun-Acc-LoRAs-Comfy
- Adaptador original de Alibaba PAI: https://huggingface.co/alibaba-pai/Qwen-Image-2.1-Fun-Acc-LoRAs
- Nodo ComfyUI del autor: https://github.com/T8mars/Comfyui-Qwen-Image-2.1-Fun-Acc-LoRAs-T8
- Workflow text-to-image: https://github.com/T8mars/Comfyui-Qwen-Image-2.1-Fun-Acc-LoRAs-T8/blob/main/example_workflows/Qwen-Image-2.1-Fun-Acc-PDD-4Step-T2I.json
- Workflow de edicion de imagen: https://github.com/T8mars/Comfyui-Qwen-Image-2.1-Fun-Acc-LoRAs-T8/blob/main/example_workflows/Qwen-Image-2.1-Fun-Acc-PDD-4Step-Edit.json
- Assets base para ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del modelo base en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Tutorial de ComfyUI para Qwen-Image-2.1: https://docs.comfy.org/tutorials/image/qwen/qwen-image-2-1
- Otro repositorio del autor: https://huggingface.co/t8star/qwen-image-2.1-comfy
- Perfil del autor en HuggingFace: https://huggingface.co/t8star
- Canal del autor en Bilibili: https://space.bilibili.com/385085361
- Canal del autor en YouTube: https://www.youtube.com/@T8star-Aix/
