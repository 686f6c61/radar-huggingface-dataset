# taras1814/ddpm-celebahq-finetuned-butterflies-2epochs

## Resumen

`taras1814/ddpm-celebahq-finetuned-butterflies-2epochs` es un modelo de difusion incondicional de imagenes publicado en Hugging Face por el usuario taras1814. Se trata de un fine-tuning del checkpoint `ddpm-celebahq-256` (un DDPM entrenado sobre el dataset CelebA-HQ a 256x256) sobre un dataset de mariposas durante 2 epocas, realizado en el contexto del curso Diffusion Models Class de Hugging Face (Unidad 2). No es un modelo pensado para produccion, sino un ejemplo didactico de fine-tuning de pipelines de difusion.

El modelo emplea la arquitectura DDPM (Denoising Diffusion Probabilistic Models) con un UNet como red de denoising, y se distribuye en formato `diffusers` con pesos en safetensors. Cuenta con aproximadamente 113,7 millones de parametros y un tamano de repositorio de 0,5 GB, lo que lo hace ligero y apto para ejecucion en GPU de consumo.

Su relevancia es limitada fuera del ambito educativo: no soporta condicionamiento por texto, no dispone de benchmarks publicados y su model card es practicamente una plantilla sin completar. Resulta util como referencia para entender el flujo de fine-tuning de modelos de difusion con la libreria `diffusers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM (Denoising Diffusion Probabilistic Model) con UNet de denoising |
| Parametros totales | 113.673.219 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | no disponible (generacion de imagen incondicional, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `diffusers`) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion clasica de DDPM: un proceso directo de difusion gaussiana que anade ruido progresivamente a la imagen y un proceso inverso aprendido por una UNet que predice el ruido en cada paso. El pipeline asociado es `DDPMPipeline` de la libreria `diffusers`, que gestiona el muestreo iterativo (tipicamente con scheduler DDPM o DDIM) para generar imagenes incondicionales a partir de ruido puro.

El entrenamiento parte del checkpoint `ddpm-celebahq-256` (entrenado sobre CelebA-HQ a 256x256) y se realiza un fine-tuning de 2 epocas sobre un dataset de mariposas, presumiblemente el dataset `huggan/smithsonian_butterflies_subset` habitual en el curso de Hugging Face. No se documenta el numero de tokens (no aplica), la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como EMA, clasificador libre de guia (CFG) o recorte de pasos. La model card no aporta informacion sobre hiperparametros, learning rate, batch size ni resolucion de entrenamiento.

## Capacidades

- Generacion de imagenes incondicionales: produce imagenes a partir de ruido aleatorio, sin prompt de texto ni condicionamiento externo.
- Fine-tuning sobre dominio especifico: adaptado al dominio visual de mariposas a partir de una base entrenada en rostros (CelebA-HQ).
- Integracion con `diffusers`: se carga mediante `DDPMPipeline.from_pretrained(...)` y es compatible con los schedulers de la libreria.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision por prompt, audio ni otras capacidades multimodales mas alla de la generacion de imagen.

## Casos de uso

- Experimentacion educativa en el curso Diffusion Models Class: sirve como referencia de un fine-tuning de 2 epocas sobre un dataset pequeno, util para comparar curvas de perdida y calidad visual antes y despues del ajuste.
- Prototipado rapido de pipelines de difusion: permite validar la integracion de `DDPMPipeline` y schedulers en un entorno local sin necesidad de modelos grandes.
- Generacion de imagenes sinteticas de mariposas para aumentar datasets de vision: util para tareas de clasificacion o deteccion en las que se necesiten ejemplos adicionales de baja resolucion.
- Pruebas de infraestructura de inferencia: por su tamano (0,5 GB, 113,7 M de parametros) es adecuado para validar despliegues en GPU de consumo, contenedores o entornos de CI.
- Investigacion sobre olvido catastrofico y adaptacion de dominio: permite estudiar como un fine-tuning corto sobre mariposas afecta a la distribucion original de CelebA-HQ.
- Base para fine-tunings posteriores: puede servir como punto de partida ligero para experimentos con otros datasets de imagenes pequenos.
- Demostraciones docentes de difusion: ilustra de forma tangible el proceso de denoising paso a paso con un modelo que cabe en memoria de una GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FID, IS, precision/recall ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en fp32 para los pesos (113,7 M de parametros), con picos adicionales por activaciones y batch; en la practica, menos de 4 GB suele ser suficiente para batch pequeno a 256x256.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100, etc.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: `diffusers` (pipeline nativo), `torch` en local; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusion).
- Latencia y throughput estimados: no disponible en la informacion proporcionada; dependera del numero de pasos de muestreo del scheduler y de la GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| taras1814/ddpm-celebahq-finetuned-butterflies-2epochs | 113,7 M | 256x256 (incondicional) | MIT | Hugging Face | Fine-tuning de 2 epocas, didactico |
| google/ddpm-celebahq-256 | no disponible en la informacion | 256x256 (incondicional) | no disponible en la informacion | Hugging Face | Checkpoint base del que parte este modelo |
| google/ddpm-cifar10-32 | no disponible en la informacion | 32x32 (incondicional) | no disponible en la informacion | Hugging Face | DDPM clasico de referencia en CIFAR-10 |
| hf-internal-testing/ddpm-ema-butterflies-256 | no disponible en la informacion | 256x256 (incondicional) | no disponible en la informacion | Hugging Face | Modelo de mariposas de referencia del curso |

La comparacion cuantitativa de rendimiento no esta disponible; los modelos alternativos se listan por categoria (DDPM incondicional de imagen) y no por metricas publicadas.

## Limitaciones y advertencias

- Modelo incondicional: no acepta prompts de texto ni etiquetas; no se puede dirigir la generacion a un contenido concreto.
- Calidad limitada: solo 2 epocas de fine-tuning sobre un dataset pequeno, lo que probablemente produce imagenes con artefactos y baja diversidad.
- Sesgos conocidos: hereda los sesgos del dataset base CelebA-HQ (rostros) y del dataset de mariposas; no se documenta analisis de sesgo.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir imagenes irreales o morfologias anomalas (mariposas con alas deformes, texturas inconsistentes).
- Sin datos de benchmarks: no hay evidencia cuantitativa de calidad (FID, IS) ni validacion por parte de terceros.
- Model card incompleta: el autor deja la descripcion como plantilla ("Describe your model here"), sin hiperparametros ni detalles de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero al derivar de `ddpm-celebahq-256` conviene verificar la licencia del checkpoint base y del dataset de mariposas utilizado.
- No apto para produccion: carece de garantias de calidad, soporte y mantenimiento; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Idiomas: no aplica, al no procesar texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taras1814/ddpm-celebahq-finetuned-butterflies-2epochs
- Curso Diffusion Models Class (repositorio): https://github.com/huggingface/diffusion-models-class
- Libreria diffusers: https://github.com/huggingface/diffusers
- Checkpoint base `ddpm-celebahq-256`: https://huggingface.co/google/ddpm-celebahq-256
- Documentacion de `DDPMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
