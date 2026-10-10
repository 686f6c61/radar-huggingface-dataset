# trmz/plate-extract-qwen-image-2.1

## Resumen

PlateExtract es un adaptador LoRA de rango 32 entrenado sobre el modelo de difusion de imagen Qwen-Image-2.1, desarrollado por Xavier Jara (usuario trmz en HuggingFace). Su funcion es extraer el primer plano de una imagen compuesta como un PNG con canal alfa transparente, tomando como entradas la imagen compuesta y su fondo limpio correspondiente. El resultado conserva bordes suaves y transparencia parcial gracias al soporte RGBA nativo del modelo base.

El adaptador se entreno durante 3.000 pasos y esta pensado para inferencia muy corta: 6 pasos de muestreo sin CFG (classifier-free guidance), ampliables a 40 pasos para un muestreo mas largo. El repositorio ocupa 0,3 GB e incluye los pesos `loras/extract.safetensors` y un script de inferencia bajo licencia MIT.

Es relevante porque evita la necesidad de un VAE RGBA personalizado: a diferencia de la propuesta comercial del mismo autor basada en FLUX.2 Klein 4B, PlateExtract reutiliza el VAE nativo de Qwen-Image-2.1, lo que simplifica el despliegue. La contrapartida es que los pesos se publican bajo licencia qwen-research, no plenamente comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre el modelo de difusion imagen a imagen Qwen-Image-2.1; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | no disponible (el repositorio pesa 0,3 GB y contiene el LoRA en safetensors; el recuento de parametros no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE; es un adaptador LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; las cuantizaciones del modelo base no se detallan) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (pesos); codigo de inferencia bajo MIT |
| Formato de pesos | safetensors (`loras/extract.safetensors`) |

## Arquitectura y entrenamiento

PlateExtract no es un modelo autonomo, sino un adaptador LoRA de rango 32 que se aplica sobre Qwen-Image-2.1, un modelo de difusion de imagen a imagen. El adaptador se entreno durante 3.000 pasos sobre el modelo completo, segun indica la model card. No se detalla la composicion del dataset de entrenamiento, el numero de imagenes utilizadas, ni si hubo fases de ajuste adicionales (RLHF, DPO u otras), por lo que esos datos se consideran no disponibles.

La innovacion tecnica principal es el aprovechamiento del soporte RGBA nativo del modelo base. Esto permite generar transparencia real, con bordes suaves y valores de alfa parciales, sin recurrir a un VAE RGBA personalizado como el que emplea la propuesta alternativa del mismo autor sobre FLUX.2 Klein 4B. El resultado es un pipeline mas simple y compatible con el VAE y el codificador de texto nativos de Qwen-Image-2.1. El flujo de inferencia combina la imagen compuesta con un fondo limpio de referencia, y funciona con 6 pasos de muestreo sin CFG por defecto.

## Capacidades

- Extraccion de primer plano: genera un PNG con canal alfa a partir de una imagen compuesta y su fondo limpio.
- Soporte RGBA nativo: produce transparencia con bordes suaves y alfa parcial, sin VAE adicional.
- Flujo imagen a imagen: la tarea se formula como image-to-image sobre el modelo base.
- Inferencia rapida: 6 pasos de muestreo sin CFG, configurable hasta 40 pasos.
- Generalizacion tematica: la model card muestra ejemplos funcionales con flores, gafas, line art y comida.
- Integracion por script: incluye `inference/qwen_extract.py` para ejecutar el pipeline desde linea de comandos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general o audio.

## Casos de uso

- Catalogo de e-commerce: extraer el producto de una foto con fondo conocido y publicarlo como PNG transparente para fichas de producto, evitando el recorte manual.
- Composicion grafica y diseno: generar capas alfa limpias para superponer productos, personas u objetos sobre nuevos fondos en herramientas de diseno.
- Postproduccion fotografica: separar sujetos con bordes delicados (pelo, cristal, humo) donde el alfa parcial es critico, usando el fondo limpio como referencia.
- Preparacion de datasets para matting: producir mascaras alfa de alta calidad para entrenar otros modelos de segmentacion o alpha matting.
- Archivo y catalogacion de material grafico: convertir lotes de imagenes compuestas en recursos con transparencia reutilizables por otros equipos.
- Line art y material grafico: aislar ilustraciones o dibujos de su fondo para reutilizarlos en plantillas, segun los ejemplos de la model card.
- Prototipado rapido en pipelines internos: integrar el script de inferencia en un flujo automatizado que procese pares compuesto/fondo de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye ejemplos cualitativos (flores, gafas, line art y comida) sin metricas numericas como PSNR, SSIM, IoU o MSE.

## Requisitos de hardware

- VRAM: la model card indica que el pipeline se ejecuta en una unica GPU NVIDIA de 16 GB con offloading a CPU. No se detallan cifras de VRAM para el modelo completo sin offloading.
- GPU recomendadas: una GPU NVIDIA de 16 GB o superior. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion proporcionada.
- GPU de consumo: segun el autor, cabe en una GPU de 16 GB, categoria en la que entran tarjetas de consumo como la RTX 4080 o la RTX 4090, aunque esto no se confirma explicitamente en la documentacion.
- Despliegue: script propio `inference/qwen_extract.py` con dependencias en `inference/requirements.txt`; se carga el modelo Qwen-Image-2.1 completo con su VAE y codificador de texto nativos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se sabe que el valor por defecto es de 6 pasos de muestreo sin CFG, y que puede subirse a 40 pasos, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Soporte alfa | VAE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| trmz/plate-extract-qwen-image-2.1 | LoRA rango 32 sobre Qwen-Image-2.1 | no disponible (repo de 0,3 GB) | RGBA nativo, sin VAE personalizado | VAE nativo de Qwen-Image-2.1 | qwen-research (pesos), MIT (codigo) | HuggingFace, 47 descargas, 10 likes |
| trmz/flux2-klein-alpha | Modelo sobre FLUX.2 Klein 4B | 4B (modelo base) | RGBA mediante VAE personalizado | VAE RGBA personalizado | Uso comercial, segun la model card | HuggingFace |
| Qwen/Qwen-Image-2.1 | Modelo base de difusion imagen a imagen | no disponible | RGBA nativo | VAE nativo | qwen-research | HuggingFace |

No se dispone de datos de rendimiento cuantitativos que permitan comparar la calidad de extraccion entre estas alternativas.

## Limitaciones y advertencias

- Requiere dos entradas: la imagen compuesta y un fondo limpio de la misma escena. No funciona con una sola imagen.
- Licencia qwen-research en los pesos: restringe el uso comercial. Conviene revisar el archivo LICENSE antes de integrarlo en un producto.
- El codigo de inferencia se publica bajo MIT, pero eso no altera la licencia de los pesos ni la del modelo base.
- No se documentan sesgos concretos, pero al derivar de un modelo de difusion generativo hereda los sesgos de sus datos de entrenamiento.
- Riesgo de artefactos o halos en bordes complejos (pelo, cristal, semitransparencias) si el fondo de referencia no esta bien alineado con la imagen compuesta.
- No hay resultados de benchmarks publicados, por lo que la calidad frente a alternativas especializadas en matting no esta cuantificada.
- No se especifican idiomas soportados ni capacidades multilingues.
- El modelo es de imagen: no admite texto generativo, tool calling ni razonamiento multi-paso.
- El repositorio tiene un volumen de descargas bajo (47) y pocos likes (10), lo que limita la validacion por parte de la comunidad.
- Fechas de creacion y actualizacion registradas en 2026; conviene verificar el estado del repositorio antes de depender de el en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trmz/plate-extract-qwen-image-2.1
- Codigo de inferencia: https://huggingface.co/trmz/plate-extract-qwen-image-2.1/blob/main/inference/qwen_extract.py
- Licencia de los pesos: https://huggingface.co/trmz/plate-extract-qwen-image-2.1/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Alternativa comercial del mismo autor (FLUX.2 Klein 4B): https://huggingface.co/trmz/flux2-klein-alpha
- Citacion:
  ```
  @misc{jara2026plateextractqwen,
    author = {Xavier Jara},
    title = {{PlateExtract: Foreground Extraction with Qwen Image 2.1}},
    year = {2026},
    url = {https://huggingface.co/trmz/plate-extract-qwen-image-2.1}
  }
  ```
