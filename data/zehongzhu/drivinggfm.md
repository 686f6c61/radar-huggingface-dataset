# ZehongZhu/drivinggfm

## Resumen

DrivingGFM v1.0 es un modelo de difusion para generacion y edicion controlable de imagenes orientado a percepcion visual en conduccion autonoma, desarrollado por el DrivingGFM Team de la Tongji University. Se distribuye como pipeline de `diffusers` con la etiqueta `image-to-image` y resuelve el problema de generar y modificar escenas de trafico de forma controlada (por ejemplo, convertir una escena diurna en una escena nocturna con lluvia) preservando la estructura de la imagen de entrada.

El modelo se presenta como un "Generalist Foundation Model for Unified Driving Visual Perception", es decir, una base unica para tareas de percepcion visual en el dominio de la conduccion, en lugar de modelos especializados por tarea. Es relevante porque la generacion controlable de escenas permite aumentar datasets de conduccion autonoma con condiciones meteorologicas e iluminacion variadas sin coste de captura real, algo critico para la robustez de los sistemas de percepcion.

La informacion publicada es escasa: no se detallan el numero de parametros, la longitud de contexto (no aplica en un modelo de difusion de imagen) ni la composicion del dataset de entrenamiento. El repositorio ocupa 4,3 GB y el modelo solo declara soporte para ingles en las etiquetas y prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (pipeline `image-to-image` sobre `diffusers`); arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible |
| Tipos de cuantizacion | no disponible (se recomienda `torch.float16` en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | CreativeML Open RAIL-M (etiquetada como `other` / `creativeml-openrail-m`) |
| Formato de pesos | no disponible (repo de 4,3 GB compatible con `diffusers`; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

DrivingGFM v1.0 se implementa como un modelo de difusion para traduccion imagen-a-imagen con control textual, empaquetado con una pipeline personalizada (`DrivinggfmPipeline`) que requiere `trust_remote_code=True`. La API expone un metodo `drive()` que acepta una imagen de escena, un prompt de edicion en lenguaje natural y parametros de muestreo (`num_inference_steps`, `image_guidance_scale`, `guidance_scale`, `seed`), lo que indica un esquema de doble guiado: escala de guiado de imagen para preservar la estructura original y escala de guiado de texto (classifier-free guidance) para aplicar la modificacion solicitada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable en generacion de imagen) ni innovaciones tecnicas concretas como atencion lineal o decodificacion especulativa. Tampoco se documenta la arquitectura base (UNet, transformer de difusion o hibrida) ni el codificador de texto empleado. Todos estos datos deben considerarse no disponibles a partir de la informacion publicada.

## Capacidades

- Generacion y edicion de imagenes de escenas de conduccion mediante difusion imagen-a-imagen.
- Edicion controlable por prompt en lenguaje natural (por ejemplo, "make it a rainy night road scene").
- Preservacion de la estructura de la escena original mediante `image_guidance_scale`.
- Control de la fidelidad al prompt mediante `guidance_scale` (classifier-free guidance).
- Reproducibilidad mediante semilla (`seed`).
- Soporte de prompts en ingles unicamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada multiple, audio ni modo "thinking"; el modelo es exclusivamente de generacion de imagen.

## Casos de uso

- Aumento de datos para percepcion en conduccion autonoma: generar variantes de una misma escena con lluvia, niebla o noche a partir de capturas diurnas, ampliando la cobertura del dataset de entrenamiento sin coste de recaptura.
- Simulacion de condiciones adversas para pruebas de robustez: convertir escenas limpias en escenas con baja visibilidad y evaluar como degradan los detectores y segmentadores sobre las imagenes generadas.
- Edicion de escenas para anotacion y curriculum learning: modificar atributos concretos (iluminacion, meteorologia) manteniendo la geometria de la via y los actores, lo que permite aislar el efecto de una variable en el entrenamiento.
- Generacion de pares imagen-imagen para tareas de traduccion de dominio: usar la salida del pipeline como objetivo supervisado en modelos de adaptacion de dominio dia-noche.
- Prototipado rapido de escenarios para validacion de pipelines de percepcion: crear casos de prueba sinteticos antes de disponer de capturas reales en esas condiciones.
- Investigacion en generacion controlable: estudiar el efecto de `image_guidance_scale` y `guidance_scale` sobre la fidelidad estructural frente a la fidelidad semantica en dominios de conduccion.
- Creacion de contenido y demostraciones: ilustrar articulos o demos sobre conduccion autonoma con escenas editadas de forma controlada y reproducible mediante `seed`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 4,3 GB, por lo que en `float16` la huella de pesos ronda esos 4,3 GB y el consumo total depende de la resolucion de imagen y del pipeline.
- GPU recomendadas: no disponible en la documentacion; por tamano de pesos, una GPU con 8-12 GB de VRAM deberia ser suficiente en `float16`, aunque no esta confirmado por el autor.
- Cabe en GPU de consumo: probablemente si en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 en adelante), sin confirmacion oficial.
- Opciones de despliegue: `diffusers` con `DiffusionPipeline` y `trust_remote_code=True`; `accelerate` para gestion de dispositivos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de imagen en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones internas suficientes para una comparacion cuantitativa fiable con otros modelos de difusion para edicion de escenas de conduccion. Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrivingGFM v1.0 | no disponible | no aplica | no disponible | CreativeML Open RAIL-M | Hugging Face (`ZehongZhu/drivinggfm`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Informacion tecnica muy limitada: no se publican parametros, arquitectura base, dataset ni evaluacion, lo que impide valorar su calidad frente a alternativas.
- Riesgo de alucinacion visual: como modelo de difusion, puede generar elementos plausibles pero inexistentes (vehiculos, senalizacion, peatones) que no estaban en la escena original, lo que invalida su uso directo como ground truth sin revision.
- Solo soporta prompts en ingles; no hay evidencia de capacidades multilingues.
- Dominio restringido a escenas de conduccion; su comportamiento fuera de ese dominio no esta documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de usarlo en produccion.
- Licencia CreativeML Open RAIL-M: permite uso comercial y redistribucion siempre que se conserve el texto completo de la licencia y la atribucion, se apliquen las restricciones de uso de la Attachment A a los usuarios aguas abajo y se marquen claramente los archivos modificados. Es una licencia de uso restringido, no una licencia de codigo abierto permisiva.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de adopcion ni de validacion por parte de la comunidad.
- No se documentan sesgos demograficos o geograficos del dataset de entrenamiento; en un modelo de conduccion esto puede afectar a la representatividad de escenas de distintas regiones.

## Enlaces

- Hugging Face: https://huggingface.co/ZehongZhu/drivinggfm
- Licencia CreativeML Open RAIL-M (texto de referencia): https://github.com/CompVis/stable-diffusion/blob/main/LICENSE
- Repositorio `diffusers`: https://github.com/huggingface/diffusers
