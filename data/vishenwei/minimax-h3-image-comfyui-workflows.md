# vishenwei/minimax-h3-image-comfyui-workflows

## Resumen

MiniMax H3 Image es un modelo de difusion para generacion y edicion de imagenes desarrollado por MiniMax, distribuido a traves del repositorio oficial de Comfy-Org. Este repositorio concreto, publicado por el usuario vishenwei, no contiene pesos del modelo, sino tres flujos de trabajo (workflows) de ComfyUI optimizados para ejecutar MiniMax H3 Image en tarjetas graficas con 8, 12 y 16 GB de VRAM. El objetivo es permitir la generacion de imagenes de hasta 16 megapixeles (3552x4736 en 3:4 y 5472x3072 en 16:9) en hardware de consumo, mediante la carga por partes del modelo desde la RAM del sistema.

La relevancia de estos workflows radica en que demuestran que es posible ejecutar un modelo de difusion de gran tamano (21 GB en pesos int8) en una GPU de 8 GB sin recurrir a cuantizaciones GGUF de menor calidad, manteniendo una salida identica pixel a pixel entre las tres configuraciones de VRAM. El repositorio incluye ademas una guia de prompts disenada para que un chatbot externo genere prompts detallados, y ejemplos de imagenes generadas sin postprocesado.

No se dispone de informacion sobre la arquitectura interna del modelo MiniMax H3 Image en la informacion proporcionada; los datos tecnicos disponibles se refieren al entorno de ejecucion, los requisitos de hardware y la configuracion de muestreo de los workflows.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para texto-a-imagen y edicion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; el prompt se procesa mediante un codificador de texto Qwen3-VL de 32B) |
| Tipos de cuantizacion | int8 (modelo de difusion `pruned_int8_convrot`), nvfp4 (codificador de texto principal), w4a8 GPTQ (upsampler de prompts Qwen3.5 9B) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (no se usan GGUF en estos workflows) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el dataset de entrenamiento ni el proceso de alineacion (RLHF/DPO) de MiniMax H3 Image en la informacion proporcionada. Lo que si se documenta es que el modelo esta destilado para 6 pasos de muestreo, de modo que incrementar el numero de pasos no mejora el resultado. El workflow utiliza el sampler SamplerLCM con `s_noise` decreciente de 1.1 a 0.9, un scheduler simple, CFG de 1.0 y sin prompt negativo.

El pipeline de ejecucion emplea tres archivos: el modelo de difusion (`minimax_h3_image_pruned_int8_convrot.safetensors`, 21 GB), el codificador de texto principal en formato nvfp4 (`qwen3vl_32b_...`, 15.7 GB) y el VAE (1.2 GB). ComfyUI carga estos pesos en la RAM del sistema y los transmite por partes a la GPU, lo que permite que una tarjeta de 8 GB genere la misma imagen que una de 16 GB a costa de mayor latencia. Existe un cuarto componente opcional, el upsampler de prompts `qwen3.5_9b_w4a8_gptq.safetensors`, que se desactiva en el workflow de 8 GB porque ralentiza mucho la generacion en esa configuracion.

## Capacidades

- Generacion de imagenes texto-a-imagen a resolucion de hasta 16 MP (3552x4736 en 3:4, 5472x3072 en 16:9).
- Edicion de imagenes mediante prompts, con hasta diez ranuras de imagen de referencia (`<Picture 1>`, `<Picture 2>`, etc.).
- Composicion multi-referencia: inserccion de sujetos de una imagen en el escenario de otra.
- Seleccion de relacion de aspecto: 1:1, 3:4, 4:3, 2:3, 3:2, 9:16, 16:9 y 21:9.
- Modo borrador (4 MP) para probar prompts rapidamente antes de renderizar a tamano completo.
- Upsampling opcional de prompts mediante un modelo Qwen3.5 9B que reescribe una idea corta en una descripcion larga y detallada (solo texto-a-imagen).
- Generacion de texto dentro de la imagen, piel realista, manos y direccion corporal, segun la guia de prompts incluida.
- Guia de prompts (`MINIMAX_H3_IMAGE_PROMPT_GUIDE.md`) para que chatbots externos (ChatGPT, Claude, Gemini o modelos locales) redacten prompts y ediciones.

## Casos de uso

- Generacion de ilustraciones a alta resolucion en equipos de consumo: con una GPU de 8 GB y 24 GB de RAM se pueden producir imagenes de 16 MP en aproximadamente 60 segundos en la tarjeta de prueba, lo que permite crear material grafico profesional sin hardware de gama alta.
- Edicion fotografica asistida por prompt: el workflow admite hasta diez imagenes de referencia, de modo que se puede indicar "Picture 1 es mi salon, hazlo al atardecer y anade un gato en el sofa" y obtener una edicion coherente.
- Composicion multi-imagen para diseno publicitario: insertar un sujeto de una fotografia en el escenario de otra (por ejemplo, "pon al hombre de Picture 1 en la cafeteria de Picture 2") gracias a las ranuras de referencia.
- Prototipado rapido de conceptos visuales: el modo borrador a 4 MP permite iterar sobre prompts en menos tiempo antes de lanzar el render final a 16 MP.
- Generacion de fondos y assets para produccion audiovisual: las relaciones de aspecto 21:9 y 16:9 cubren formatos de cine y pantalla ancha con resoluciones de 5472x3072.
- Automatizacion de pipelines creativos en ComfyUI: al ser workflows nativos sin nodos personalizados, se pueden integrar en flujos automatizados de generacion por lotes en estaciones de trabajo con 24-32 GB de RAM.
- Formacion y experimentacion con modelos de difusion: util para investigadores que quieran estudiar el comportamiento de un modelo destilado a 6 pasos en hardware limitado, manteniendo fidelidad pixel a pixel entre configuraciones de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al tratarse de un modelo de generacion de imagenes. Los datos de rendimiento medidos que proporciona el autor son los siguientes:

| Tarea | 16 GB | 12 GB | 8 GB |
|---|---|---|---|
| Texto-a-imagen, 16 MP | 66 s | 63 s | 60 s |
| Tiempo por paso (6 pasos) | 4,4 s | 4,8 s | 5,7 s |
| 4 imagenes de referencia, 16 MP | no disponible | no disponible | 228 s (aprox. 4 min) |
| 4 imagenes de referencia, 8 MP | no disponible | no disponible | 156 s (aprox. 2,5 min) |

Medido en una RTX 5070 Ti (16 GB) con 24 GB de RAM del sistema, limitando artificialmente la VRAM disponible para simular tarjetas de 12 y 8 GB. Con la misma semilla, las tres configuraciones produjeron la misma imagen pixel a pixel. El autor advierte que las tarjetas reales de 8 y 12 GB (RTX 4060, 3060, 4070, etc.) tienen chips mas lentos, por lo que los tiempos seran mayores.

## Requisitos de hardware

- VRAM: 8 GB minimo (probado con un uso maximo de 3,7 GB de VRAM para una imagen de 16 MP en el workflow de 8 GB); 12 GB y 16 GB para los workflows correspondientes.
- RAM del sistema: 24 GB o mas (probado con 24 GB); se recomiendan 32 GB para mayor seguridad, ya que los modelos se mantienen en RAM y se transmiten por partes a la GPU.
- Disco: aproximadamente 38 GB libres en una unidad SSD.
- GPU recomendadas: NVIDIA con 8 GB o mas (RTX 4060, 3060, 4070, 5070 Ti, etc.); el autor probo en una RTX 5070 Ti de 16 GB.
- Despliegue: ComfyUI en una version reciente, con los nodos de MiniMax H3 integrados (no se requieren nodos personalizados).
- Archivos necesarios: modelo de difusion de 21 GB, codificador de texto principal nvfp4 de 15,7 GB y VAE de 1,2 GB, todos ellos en safetensors de plena calidad (sin GGUF).
- Latencia y throughput: segun las mediciones del autor, entre 60 y 66 segundos para una imagen de 16 MP en texto-a-imagen con 6 pasos, y entre 156 y 228 segundos para generacion con 4 imagenes de referencia en la configuracion de 8 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos de generacion de imagenes comparables en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo, solo workflows de ComfyUI; es necesario descargar los archivos desde el repositorio oficial Comfy-Org/MiniMax-H3-Image.
- Los tiempos de render medidos corresponden a una RTX 5070 Ti con limitacion artificial de VRAM; en tarjetas reales de 8 y 12 GB los tiempos seran significativamente mayores.
- El workflow de 8 GB desactiva el upsampler de prompts Qwen3.5 9B porque ralentiza mucho la generacion en esa configuracion; en ese caso hay que escribir prompts detallados manualmente o generarlos con la guia incluida.
- Se requieren al menos 24 GB de RAM del sistema; con menos, el flujo puede fallar aunque la GPU tenga VRAM suficiente.
- El modelo esta destilado para 6 pasos: aumentar el numero de pasos no mejora la calidad y solo incrementa el tiempo de computo.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion visual, limitaciones de idioma o restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0.
- La licencia Apache 2.0 del repositorio cubre los workflows, pero el uso comercial del modelo subyacente debe verificarse en el repositorio oficial de Comfy-Org/MiniMax-H3-Image.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/vishenwei/minimax-h3-image-comfyui-workflows
- Repositorio oficial del modelo: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Carpeta de ejemplos: https://huggingface.co/vyrekai/minimax-h3-image-comfyui-workflows/tree/main/examples
- Guia de prompts: `MINIMAX_H3_IMAGE_PROMPT_GUIDE.md` (incluida en el repositorio)
- Modelo de difusion (descarga directa): https://huggingface.co/Comfy-Org/MiniMax-H3-Image/resolve/main/diffusion_models/minimax_h3_image_pruned_int8_convrot.safetensors
