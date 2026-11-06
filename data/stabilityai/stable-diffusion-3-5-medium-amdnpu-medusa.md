# stabilityai/stable-diffusion-3.5-medium-amdnpu-medusa

## Resumen

Stable Diffusion 3.5 Medium (variante AMD NPU Medusa) es una adaptacion del modelo de generacion de imagenes a partir de texto Stable Diffusion 3.5 Medium, publicado originalmente por Stability AI y optimizado por AMD para ejecutarse sobre sus NPUs (unidades de procesamiento neuronal). El repositorio, alojado bajo la organizacion de Stability AI en Hugging Face, contiene los pesos exportados en formato ONNX y estructurados para la libreria diffusers, con el transformer MMDiT y el decodificador VAE preparados especificamente para acelerar los pasos de denoising y reconstruccion de imagen en hardware NPU de AMD.

La variante incluida en este repositorio es la M1.0, derivada del modelo base amd/stable-diffusion-3.5-medium-amdnpu, e incorpora la tecnica Medusa de decodificacion acelerada. El modelo original SD3.5 Medium es un Multimodal Diffusion Transformer (MMDiT) de tamano medio que mejora la adherencia al prompt, la calidad de imagen, la tipografia y la diversidad de salidas respecto a SD3 Medium.

Su relevancia radica en que permite ejecutar un modelo de difusion moderno en portatiles y equipos con NPU de AMD sin depender de una GPU dedicada, abriendo la generacion de imagenes local a hardware de consumo con bajo consumo energetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal Diffusion Transformer (MMDiT), difusion texto-a-imagen |
| Parametros totales | no disponible (SD3.5 Medium base: ~2500M en el transformer, dato no confirmado en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (variante del codificador de texto T5, text_encoder_3_int4); resto no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Stability AI Community License (stabilityai-ai-community) |
| Formato de pesos | ONNX (compatible con diffusers), tamano del repositorio: 7,9 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MMDiT de la familia Stable Diffusion 3.5: un transformer de difusion multimodal que procesa conjuntamente las representaciones de texto e imagen. El pipeline se compone de tres codificadores de texto (dos basados en CLIP y uno en T5, este ultimo con una variante cuantizada a INT4), tres tokenizadores, un planificador (scheduler) para el muestreo de difusion, el transformer MMDiT encargado de los pasos de denoising, y un VAE con codificador y decodificador para convertir entre el espacio latente y el espacio de imagen.

En esta version optimizada por AMD, el transformer y el decodificador VAE estan exportados y estructurados para ejecutarse sobre el acelerador NPU de AMD, mientras que los codificadores de texto, tokenizadores y scheduler son componentes compartidos entre los pipelines de GPU y NPU. La variante Medusa incorpora optimizaciones adicionales para acelerar la inferencia. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion en la ficha disponible; dichos datos corresponden al modelo original de Stability AI.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline text-to-image).
- Codificacion de imagenes a espacio latente mediante el VAE encoder (image-to-latent), util para tareas de modificacion de imagenes.
- Mejora de la adherencia al prompt, la calidad de imagen y la tipografia respecto a SD3 Medium, segun la ficha del modelo original.
- Generacion de salidas mas diversas que la version Medium anterior.
- Ejecucion acelerada en NPU de AMD (transformer y VAE decoder optimizados para NPU).
- Compatibilidad con la libreria diffusers de Hugging Face.
- Comprension de prompts en ingles.

No soporta capacidades de lenguaje conversacional, tool calling ni razonamiento multi-paso al tratarse de un modelo de difusion especializado.

## Casos de uso

- Generacion de imagenes local en portatiles con NPU AMD: usuarios con Ryzen AI pueden generar imagenes sin GPU dedicada, aprovechando el acelerador neuronal integrado y con consumo energetico reducido.
- Prototipado creativo offline: disenadores que necesitan iterar conceptos visuales rapidamente sin depender de servicios en la nube, ejecutando el pipeline completo en local.
- Generacion de imagenes con texto legible: el modelo original destaca en tipografia, util para crear mockups de carteles, logotipos o compositions con texto.
- Integracion en aplicaciones con diffusers: el formato ONNX y la estructura de carpetas compatible con diffusers facilitan la integracion en aplicaciones Python de generacion de imagenes.
- Sandbox de desarrollo y benchmarking de NPUs: AMD proporciona el repositorio github.com/amd/sd-sandbox como punto de partida para probar y medir el rendimiento del modelo en hardware NPU.
- Edicion y modificacion de imagenes: gracias a la inclusion del VAE encoder, el modelo puede usarse en flujos que requieren convertir imagenes existentes al espacio latente para modificarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tiempos de generacion por imagen, ni metricas de calidad (FID, etc.) para esta variante NPU.

## Requisitos de hardware

- NPU de AMD: el transformer y el decodificador VAE estan optimizados especificamente para NPUs de AMD; es el hardware objetivo de este repositorio.
- VRAM/NPU memoria: no disponible de forma explicita; el repositorio pesa 7,9 GB en total, por lo que se recomienda un sistema con al menos esa capacidad de memoria disponible entre NPU, VRAM y RAM.
- GPU: los componentes compartidos (codificadores de texto, tokenizadores, scheduler) pueden ejecutarse en pipeline de GPU, pero el transformer y el VAE decoder de esta variante estan destinados a NPU, no a GPU.
- Software: libreria diffusers de Hugging Face; AMD ofrece el repositorio github.com/amd/sd-sandbox con instrucciones de puesta en marcha.
- Opciones de despliegue: diffusers con backend ONNX; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de difusion en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|
| Stable Diffusion 3.5 Medium (original) | MMDiT | Difusion estandar (diffusers) | GPU | Stability AI Community |
| Stable Diffusion 3.5 Medium AMD NPU (base) | MMDiT | ONNX para NPU | NPU AMD | Stability AI Community |
| Stable Diffusion 3.5 Medium AMD NPU Medusa (esta ficha) | MMDiT, variante M1.0 | ONNX para NPU con optimizaciones Medusa | NPU AMD | Stability AI Community |

No hay datos de rendimiento comparativo publicados entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- Idioma: la comprension de prompts esta orientada al ingles; el rendimiento con prompts en castellano u otros idiomas no esta documentado.
- Hardware restringido: el transformer y el VAE decoder solo estan optimizados para NPUs de AMD; no es utilizable tal cual en GPUs NVIDIA o Apple Silicon.
- Licencia: la Stability AI Community License requiere aceptar un acuerdo (acceso gated con nombre, email, pais y organizacion) y tiene restricciones de uso; las organizaciones con ingresos elevados pueden requerir licencia comercial. Conviene revisar el texto de la licencia antes de uso comercial.
- Riesgo de generacion de contenido sesgado o inapropiado: como todo modelo de generacion de imagenes, puede reproducir sesgos presentes en sus datos de entrenamiento y generar contenido ofensivo o con derechos de autor implicitos; la ficha original incluye consideraciones eticas al respecto.
- Cuantizacion parcial: solo el codificador de texto T5 tiene variante INT4 documentada; el impacto de la cuantizacion en la calidad no esta cuantificado.
- Repositorio muy reciente con 0 descargas registradas: existe poco historial comunitario y posible ausencia de herramientas de terceros probadas.
- Soporte: las dudas se canalizan via la pestana Community de Hugging Face y el Discord de AMD Developer Community.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium-amdnpu-medusa
- Modelo original de Stability AI: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Variante base AMD NPU: https://huggingface.co/amd/stable-diffusion-3.5-medium-amdnpu
- Licencia: https://huggingface.co/amd/stable-diffusion-3.5-medium-amdnpu-medusa/blob/main/LICENSE
- Repositorio de puesta en marcha (sd-sandbox): https://github.com/amd/sd-sandbox
- Politica de privacidad de Stability AI: https://stability.ai/privacy-policy
- Discord de AMD Developer Community: https://discord.gg/amd-dev
- Tabla de comunidad: https://hf.co/amd/stable-diffusion-3.5-medium-amdnpu-medusa/discussions
