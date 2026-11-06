# yalilyu28/sd-class-butterflies-32

## Resumen

`yalilyu28/sd-class-butterflies-32` es un modelo de difusion de imagenes incondicional (unconditional image generation) publicado en Hugging Face por el usuario `yalilyu28`. Se trata de un artefacto educativo generado en el contexto de la Unidad 1 del curso Diffusion Models Class de Hugging Face, cuyo objetivo es entrenar un modelo DDPM desde cero para sintetizar imagenes de mariposas (butterflies) a partir de ruido puro, sin condicionamiento de texto ni de clase.

El modelo es deliberadamente pequeno: cuenta con 18.536.323 parametros y un repositorio de tan solo 0,1 GB, lo que lo convierte en un ejemplo canonico de juguete (toy model) para aprender el flujo completo de entrenamiento, guardado y carga de pipelines de difusion con la libreria `diffusers`. No es un modelo de proposito general ni compite con modelos texto-a-imagen modernos; su utilidad es didactica y experimental.

Es relevante ahora unicamente como referencia pedagogica y como punto de partida reproducible para quienes estudian difusion: permite ejecutar inferencia en CPU o en cualquier GPU consumer, inspeccionar el pipeline `DDPMPipeline` y experimentar con el muestreo DDPM/DPM sin coste computacional significativo. No dispone de model card extensa ni de documentacion tecnica detallada mas alla del snippet de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (DDPM, U-Net) segun pipeline `DDPMPipeline` de `diffusers`; detalles de la U-Net no disponibles |
| Parametros totales | 18.536.323 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (generacion de imagen incondicional, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `diffusers`, framework PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de difusion denoising probabilistic (DDPM) implementado en `diffusers` mediante `DDPMPipeline`, que combina una U-Net para predecir el ruido y un scheduler de muestreo (por defecto DDPM; el tag indica `DDPMPipeline`). El numero de parametros (18,5 M) es coherente con una U-Net de baja capacidad y resolucion de imagen pequena (tipicamente 32x32 o 64x64 en este tipo de ejercicios del curso), aunque la resolucion exacta no se documenta en la informacion disponible.

No se dispone de informacion sobre el numero de tokens/pasos de entrenamiento, la composicion del dataset (mas alla de que son mariposas, probablemente el subconjunto `huggan/smithsonian_butterflies_subset` usado en el curso), el numero de epochs ni si se aplicaron tecnicas adicionales como EMA de pesos o clasifier-free guidance (no aplicable en generacion incondicional). Tampoco se documentan innovaciones tecnicas: es una implementacion de referencia sin optimizaciones de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de imagenes incondicionales de mariposas: sintetiza muestras a partir de ruido gaussiano sin prompt de texto ni etiqueta de clase.
- Muestreo con scheduler DDPM a traves de `DDPMPipeline`; el usuario puede sustituir el scheduler por otros compatibles (DDIM, PNDM, Euler) si la U-Net es compatible.
- Ejecucion ligera en CPU y GPU consumer gracias a su reducido tamano (18,5 M de parametros).
- No soporta tool calling, function calling ni agentes: no es un modelo de lenguaje.
- No soporta entrada de texto, imagen o audio: es puramente generativo incondicional.
- No tiene capacidades multilingues ni modo de razonamiento (thinking mode).

## Casos de uso

- Docencia y aprendizaje de difusion: sirve para recorrer el ciclo completo de entrenamiento, guardado en Hub y carga con `DDPMPipeline.from_pretrained`, sin necesidad de infraestructura costosa.
- Experimentacion con schedulers: al ser un modelo pequeno, permite comparar DDPM, DDIM, PNDM o Euler en minutos y observar el efecto en la calidad y el numero de pasos.
- Pruebas de integracion de `diffusers`: util para validar entornos, versiones de PyTorch y pipelines de CI que necesiten un modelo de difusion real pero de bajo peso.
- Generacion de datasets sinteticos de mariposas para tareas auxiliares (aumento de datos, prototipos de clasificadores) con la salvedad de que la calidad es baja y el dominio muy estrecho.
- Demostraciones educativas de muestreo estocastico: ilustra como el ruido se transforma progresivamente en imagen, util en clases y talleres.
- Benchmarking de infraestructura ligera: mide latencia de inferencia en CPU, Raspberry Pi o GPUs de gama baja con un modelo de difusion realista en forma pero minimo en coste.
- Base para fine-tuning didactico: punto de partida para reentrenar sobre otro dominio pequeno (flores, icons) en la Unidad 2 del curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan metricas FID, IS, precision/recall ni comparaciones cuantitativas con otros modelos en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (18,5 M de parametros, ~74 MB de pesos) mas el overhead de activaciones de la U-Net; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `diffusers` con PyTorch (CPU o CUDA), `DDPMPipeline` directamente; no se documentan variantes GGUF, ONNX ni soporte en `llama.cpp`/Ollama (no aplica).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera del orden de decenas a cientos de milisegundos por imagen en GPU y de segundos en CPU, dependiendo del numero de pasos del scheduler.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yalilyu28/sd-class-butterflies-32` | 18,5 M | Difusion incondicional (DDPM) | Ruido, sin prompt | MIT | Hugging Face (`diffusers`) |
| `google/ddpm-cifar10-32` | ~35,7 M | Difusion incondicional (DDPM) | Ruido, sin prompt | Apache 2.0 | Hugging Face (`diffusers`) |
| `google/ddpm-celebahq-256` | ~113 M | Difusion incondicional (DDPM) | Ruido, sin prompt | Apache 2.0 | Hugging Face (`diffusers`) |
| `CompVis/stable-diffusion-v1-4` | ~860 M (U-Net) | Difusion condicionada por texto | Prompt de texto | CreativeML OpenRAIL-M | Hugging Face (`diffusers`) |

Los datos de parametros de los modelos comparables son aproximados y se ofrecen como referencia de orden de magnitud; no se dispone de comparaciones de rendimiento (FID) en la informacion proporcionada. La diferencia clave es que este modelo es incondicional y de dominio unico (mariposas), mientras que los alternativos cubren otros dominios o permiten condicionamiento por texto.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo genera mariposas; no es util para imagenes genericas ni para produccion real.
- Calidad limitada: al ser un modelo de 18,5 M de parametros entrenado en un ejercicio de curso, la fidelidad y diversidad de las muestras son bajas.
- Sin condicionamiento: no acepta prompts de texto ni etiquetas de clase, por lo que no se puede dirigir la generacion.
- Sesgos: el dataset de mariposas del curso puede sobrerrepresentar ciertas especies, poses y colores; no se documenta analisis de sesgo.
- Riesgo de alucinacion visual: puede producir imagenes morfologicamente incorrectas (alas asimetricas, texturas incoherentes) que no corresponden a ninguna especie real.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no esta pensado para ello y no se ofrece garantia alguna.
- Sin informacion sobre datos de entrenamiento exactos, resolucion de salida ni numero de pasos del scheduler por defecto; conviene inspeccionar `pipeline.scheduler` y `pipeline.unet.config` antes de usarlo.
- No apto para tareas de texto, codigo, razonamiento ni agentes: es exclusivamente un generador de imagenes incondicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yalilyu28/sd-class-butterflies-32
- Curso Diffusion Models Class (repositorio): https://github.com/huggingface/diffusion-models-class
- Documentacion de `DDPMPipeline` en `diffusers`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Documentacion general de `diffusers`: https://huggingface.co/docs/diffusers
