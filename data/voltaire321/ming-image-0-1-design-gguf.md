# voltaire321/Ming-Image-0.1-Design-GGUF

## Resumen

Este repositorio contiene conversiones a GGUF de Ming-Image-0.1-Design, el modelo de generacion de imagenes de diseno de inclusionAI (iniciativa de codigo abierto fundada por Ant Group), publicadas por el usuario voltaire321 para su uso con stable-diffusion.cpp. No se trata de un modelo nuevo ni de un fine-tuning: el autor solo ha cuantizado los pesos originales, manteniendo la autoria y la licencia MIT de inclusionAI. El paquete incluye dos ficheros: el modelo de difusion DiT de 6 B en Q8_0 (6,54 GB) y el codificador de texto Ling-mini-2.0 en Q4_K (10,52 GB). El repositorio completo ocupa 17,1 GB.

La relevancia de esta publicacion es practica: permite ejecutar el pipeline completo de Ming-Image en entornos donde el formato bf16 no esta soportado de forma eficiente. El propio autor documenta que, sobre Vulkan sin soporte bf16 (por ejemplo AMD RADV), los safetensors int8 y bf16 caen en rutas lentas de unos 120 s por paso, mientras que estos GGUF generan una imagen de 1024x1024 en aproximadamente 35 s de extremo a extremo con 12 pasos. El modelo subyacente esta especializado en diseno grafico: interfaces de usuario, infografias, posters y composiciones con texto integrado, ademas de soporte de salida con canal alfa (RGBA) mediante un procedimiento especifico documentado por el autor.

El dato de parametros declarado en el repositorio es de 6.154.901.056 (unos 6,15 B), correspondiente al modelo de difusion. Se distribuye bajo licencia MIT, igual que los originales Ming-Image-0.1-Design y Ling-mini-2.0. El repo es muy reciente (creado el 2026-10-03) y tiene una adopcion todavia marginal: 28 descargas y 0 likes en el momento de redactar esta ficha, sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para el modelo de imagen; codificador de texto basado en un modelo de lenguaje (Ling-mini-2.0); VAE bf16 para decodificacion |
| Parametros totales | 6.154.901.056 (~6,15 B) segun el dato declarado en el repo, correspondiente al modelo de difusion; el recuento del codificador de texto no esta disponible |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (modelo de difusion), Q4_K (codificador de texto). Se probo Q4_K para el modelo de difusion y se descarto |
| Idiomas soportados | No disponible (los ejemplos de prompt estan en ingles; no hay declaracion oficial de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (este repo); safetensors bf16 en los repos originales de inclusionAI y Comfy-Org |

## Arquitectura y entrenamiento

El pipeline consta de tres piezas. La primera es el modelo de difusion, un DiT (Diffusion Transformer) de 6 B de parametros descrito en el repositorio como el motor de generacion de imagen. La segunda es el codificador de texto, basado en Ling-mini-2.0, que convierte el prompt en las representaciones condicionantes; en este repo se distribuye cuantizado en Q4_K. La tercera es el VAE, que se usa sin modificar desde Comfy-Org en formato bf16 (`vae/ming_image_vae_bf16.safetensors`), junto con el tokenizer original de inclusionAI (`mllm/tokenizer.json`). No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en el modelo, sino en el proceso de cuantizacion: las conversiones se generaron a partir de los safetensors bf16 de Comfy-Org con stable-diffusion.cpp `master-929-3f8527a`, mediante `sd-cli -M convert` con `--type q8_0` para el DiT y `--type q4_K` para el codificador de texto. El autor senala que probo una version Q4_K del modelo de difusion pero decidio no publicarla porque perdia la capacidad de renderizado de pixel art (a la misma semilla producia una salida lisa y pintada en lugar de pixelada). Esto indica que el DiT es sensible a la cuantizacion agresiva en estilos de alta frecuencia. El modelo forma parte de una serie de dos variantes: Ming-Image-0.1-Design, orientada a generar disenos completos, y Ming-Image-0.1-Design-Layer, que descompone imagenes de diseno aplanadas en capas transparentes editables de forma independiente.

## Capacidades

- Generacion de texto a imagen orientada a diseno grafico: interfaces de usuario, infografias, posters y composiciones ricas en texto.
- Renderizado de texto dentro de la imagen, segun la descripcion de la serie Ming-Image.
- Salida con canal alfa (RGBA) para fondos transparentes, aunque con matices importantes (ver limitaciones): el autor documenta que la mera inclusion de una frase RGBA en el prompt no produce alfa, y que se necesita combinarla con un lienzo de entrada totalmente transparente y `--strength 0.9`.
- Rendering de pixel art, preservado en la cuantizacion Q8_0 del DiT.
- Control de generacion por prompt en lenguaje natural a traves del codificador Ling-mini-2.0.
- No hay evidencia disponible de soporte de tool calling, function calling, capacidades de agente, vision de entrada, audio ni modo de razonamiento explicito. Es un modelo de difusion text-to-image, no un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de maquetas de UI: dado un prompt descriptivo, el modelo produce pantallas o componentes de interfaz completos, utiles para exploracion rapida de direcciones visuales antes de pasar a herramientas de diseno.
- Creacion de infografias y posters: la capacidad de componer texto e imagen en una sola generacion reduce el trabajo de montaje posterior para piezas divulgativas o promocionales.
- Assets con fondo transparente para produccion grafica: usando el procedimiento de lienzo transparente mas frase RGBA, se pueden obtener recortes con alfa listos para superponer en composiciones.
- Sprites y elementos de pixel art: la cuantizacion Q8_0 conserva este estilo, lo que permite generar recursos para prototipos de videojuegos o interfaces retro.
- Integracion en un motor de imagenes de escritorio: el autor publica estos GGUF precisamente para Haruspex, que los descarga automaticamente como motor de imagen integrado; es un caso de uso de despliegue local sin dependencia de servicios en la nube.
- Ejecucion en equipos AMD sobre Vulkan: al ser GGUF y funcionar con stable-diffusion.cpp, el modelo es viable en hardware donde las rutas bf16/int8 son lentas, con un coste de unos 35 s por imagen de 1024x1024 en la configuracion descrita.
- Generacion por lotes de variaciones de una misma pieza: al fijar semilla y prompt con 12 pasos y cfg-scale 1, el pipeline es lo bastante rapido para iterar sobre variantes de un diseno.
- Reproduccion offline de un flujo de diseno: todo el pipeline (DiT, codificador de texto, VAE y tokenizer) se ejecuta en local, lo que resulta adecuado para entornos con requisitos de confidencialidad sobre los prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento procede de las mediciones del autor sobre su propio equipo, y no constituye un benchmark comparativo estandarizado:

| Escenario | Precision / formato | Tiempo | Resolucion y pasos |
|---|---|---|---|
| Vulkan sin soporte bf16 (AMD RADV) | int8 / bf16 safetensors | ~120 s por paso | No disponible |
| Vulkan sin soporte bf16 (AMD RADV) | GGUF Q8_0 + Q4_K | ~35 s extremo a extremo | 1024x1024, 12 pasos, cfg-scale 1, euler, `--diffusion-fa` |

No hay datos de MMLU, HumanEval, GSM8K ni de metricas de generacion de imagen como FID, CLIP score o similares.

## Requisitos de hardware

- Peso de los ficheros: 6,54 GB (DiT Q8_0) + 10,52 GB (codificador de texto Q4_K) = 17,06 GB, mas el VAE bf16 y el tokenizer. El repo completo ocupa 17,1 GB.
- VRAM estimada para inferencia: en torno a 20-22 GB si se cargan ambos modelos y el VAE en GPU con margen para activaciones y latentes. Es una estimacion propia, no un dato publicado.
- GPU recomendadas: tarjetas de 24 GB como RTX 3090, RTX 4090 o A100 40 GB cubren el pipeline completo con holgura. En GPUs de 16 GB probablemente sea necesario descargar parte del codificador de texto a CPU, con la penalizacion de velocidad correspondiente. El autor reporta su experiencia sobre Vulkan con AMD RADV, lo que sugiere que tambien funciona en GPUs AMD recientes.
- Cabe en consumer GPU: si, en el segmento de 24 GB (RTX 3090, RTX 4090). En 16 GB o menos, no sin offloading.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli`) es la ruta documentada y la usada para generar los GGUF. Haruspex los consume de forma integrada. vLLM, llama.cpp u Ollama no se mencionan como opciones aplicables a este pipeline de difusion; ComfyUI es una alternativa para los safetensors bf16 originales, no para estos GGUF segun la informacion disponible.
- Latencia y throughput: aproximadamente 35 s por imagen de 1024x1024 con 12 pasos en la configuracion del autor. No hay datos de throughput por lote ni de latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| voltaire321/Ming-Image-0.1-Design-GGUF (este repo) | ~6,15 B (DiT) + codificador de texto | No disponible | GGUF (Q8_0 + Q4_K) | MIT | HuggingFace, 28 descargas | Cuantizado para stable-diffusion.cpp; ~35 s por imagen de 1024x1024 en el equipo del autor |
| inclusionAI/Ming-Image-0.1-Design | ~6 B (serie descrita como de 6 B) | No disponible | safetensors bf16 | MIT | HuggingFace (oficial) | Original sin cuantizar; maxima calidad pero requiere soporte bf16 eficiente |
| inclusionAI/Ming-Image-0.1-Design-Layer | ~6 B (serie descrita como de 6 B) | No disponible | No disponible | MIT | HuggingFace | Variante para descomponer disenos aplanados en capas transparentes editables |
| Comfy-Org/Ming-Image | No disponible | No disponible | safetensors bf16 | No disponible en la informacion recogida | HuggingFace | Empaquetado para ComfyUI; es la fuente de la que se derivan estos GGUF |

No se dispone de datos de rendimiento comparativos entre estas variantes ni frente a otros generadores de imagen de diseno.

## Limitaciones y advertencias

- La salida transparente no funciona solo con la frase RGBA del prompt: el autor confirma que ni la frase sola ni el lienzo transparente solo bastan, y que hay que combinar ambos con `--strength 0.9`. Es un comportamiento reportado tambien en el issue inclusionAI/Ming-Image#5.
- La cuantizacion Q4_K aplicada al modelo de difusion degrada el pixel art y se descarto por ese motivo. Esto es un indicador de que el DiT es fragil ante cuantizaciones agresivas; no se ha verificado si Q8_0 reproduce fielmente el bf16 original en todos los estilos.
- El codificador de texto se distribuye en Q4_K, cuantizacion relativamente agresiva que puede afectar a la fidelidad del seguimiento del prompt. No hay mediciones publicadas de esta perdida.
- No se han publicado benchmarks, lo que impide comparar calidad objetivamente con el modelo original o con alternativas.
- Adopcion muy baja (28 descargas, 0 likes) y repositorio de un tercero no afiliado a inclusionAI; conviene verificar los hashes SHA-256 facilitados en la model card antes de usarlos en produccion.
- La fecha de creacion registrada en HuggingFace es 2026-10-03, posterior a la fecha habitual de publicacion; conviene tratar los metadatos temporales con cautela.
- Los GGUF se generaron con una version concreta de stable-diffusion.cpp (`master-929-3f8527a`); versiones distintas de la herramienta podrian requerir reconversion.
- No hay informacion sobre sesgos del dataset de entrenamiento, idiomas soportados ni robustez ante prompts adversarios. El riesgo de alucinacion visual (elementos incoherentes, texto mal formado o detalles anatomicos incorrectos) es el habitual en modelos de difusion y no esta cuantificado aqui.
- La licencia MIT de los modelos originales permite uso comercial, pero esta ficha no constituye asesoramiento legal: debe verificarse el fichero LICENSE y la licencia de Ling-V2 enlazada por el autor antes de un despliegue comercial.
- Al ser un modelo de difusion text-to-image, no ofrece capacidades de conversacion, tool calling ni razonamiento en varios pasos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/voltaire321/Ming-Image-0.1-Design-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design
- Repositorio GitHub de Ming-Image: https://github.com/inclusionAI/Ming-Image
- Empaquetado para ComfyUI (safetensors bf16): https://huggingface.co/Comfy-Org/Ming-Image
- VAE bf16 usado por el pipeline: https://huggingface.co/Comfy-Org/Ming-Image/blob/main/vae/ming_image_vae_bf16.safetensors
- Tokenizer original: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design/blob/main/mllm/tokenizer.json
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Haruspex, el motor de imagenes que consume estos GGUF: https://github.com/tmac1973/haruspex
- Repositorio de referencia de deepinfra: https://github.com/deepinfra/ming-image
- Entrada en AI Wiki: https://aiwiki.ai/wiki/ming_image_0_1_design
- Licencia de Ling-V2: https://github.com/inclusionAI/Ling-V2/blob/master/LICENCE
- Issue sobre salida transparente: https://github.com/inclusionAI/Ming-Image/issues/5
