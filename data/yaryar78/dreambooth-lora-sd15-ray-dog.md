# yaryar78/dreambooth-lora-sd15-ray-dog

## Resumen

`dreambooth-lora-sd15-ray-dog` es un adaptador LoRA de bajo rango entrenado con DreamBooth sobre Stable Diffusion 1.5 para personalizar el modelo base con un sujeto concreto (un perro llamado Ray). Lo desarrolla el usuario `yaryar78` y se publica como pesos de adaptador compatibles con la librería `diffusers`, no como un modelo completo. El problema que resuelve es el habitual en personalización de difusión: fijar la identidad visual de un sujeto específico mediante un token identificador (`sks`) sin reentrenar los 859,52 M de parámetros del U-Net, que permanecen congelados.

La relevancia es acotada: se trata de un artefacto de demostración técnica vinculada al repositorio `vision-generative-models-survey`, con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repositorio de 0,0 GB. No es un modelo de propósito general ni compite con modelos de difusión modernos; su interés es como ejemplo reproducible de un pipeline DreamBooth + LoRA con configuración y métricas publicadas.

Técnicamente es un LoRA de rango 16 con 3,19 M de parámetros entrenables, entrenado a 512x512 durante 2000 pasos con batch size 4 en una RTX 4090 en 0,241 horas. El modelo base es Stable Diffusion 1.5, con pipeline `text-to-image` y licencia CreativeML OpenRAIL-M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre U-Net de Stable Diffusion 1.5 (difusión latente, transformer convolucional) |
| Parametros totales | 3,19 M entrenables (LoRA) + 859,52 M congelados (U-Net) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; sin ventana de contexto de tokens) |
| Tipos de cuantizacion | No disponible (los pesos LoRA se cargan sobre el base en fp16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (los prompts dependen del codificador de texto CLIP del modelo base) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Pesos LoRA para `diffusers` (carga vía `load_lora_weights`); no se especifica safetensors explícitamente |
| Rango LoRA | 16 |
| Resolucion de entrenamiento | 512x512 |
| Pasos de entrenamiento | 2000 |
| Batch size | 4 |
| Hardware de entrenamiento | NVIDIA GeForce RTX 4090 |
| Tiempo de entrenamiento | 0,241 h |
| Dataset | `yaryar78/Ray_dog` |
| Prompt de instancia | `a photo of sks dog` |
| Prior preservation | `a photo of a dog` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las capas de atención del U-Net de Stable Diffusion 1.5 mediante descomposición de bajo rango (LoRA, rank 16). El U-Net base (859,52 M de parámetros) permanece congelado y solo se optimizan 3,19 M de parámetros del adaptador, lo que reduce drásticamente el coste de entrenamiento y el tamaño del artefacto. El codificador de texto y el VAE no se modifican.

El entrenamiento sigue el esquema DreamBooth con preservación de clase previa: el prompt de instancia `a photo of sks dog` asocia el token raro `sks` al sujeto, mientras que el prompt de clase `a photo of a dog` actúa como regularización para mitigar el sobreajuste y la pérdida de diversidad. Se realizaron 2000 pasos con batch size 4 a 512x512, en una única RTX 4090 durante aproximadamente 14,5 minutos. Las pérdidas finales reportadas son 0,16488 (instancia), 0,13861 (priora) y 0,30349 (total). La configuración exacta está en `train_config.yaml` y los registros de TensorBoard en `runs/`. El código de entrenamiento procede del repositorio `vision-generative-models-survey` (commit `6d08430d96`).

## Capacidades

- Generación de imágenes text-to-image condicionada por prompt, heredada de Stable Diffusion 1.5.
- Personalización de sujeto: el token `sks` invoca la identidad visual del perro del dataset de entrenamiento.
- Composición de escenas: el prompt de ejemplo (`a photo of sks dog on the beach, golden hour`) sugiere que el sujeto puede situarse en contextos nuevos manteniendo su identidad.
- Control de intensidad del adaptador mediante `cross_attention_kwargs={"scale": ...}` para modular la fidelidad al sujeto frente a la flexibilidad creativa.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento (thinking mode), visión de entrada ni audio.
- Capacidades multilingües: no documentadas; dependen del codificador CLIP del modelo base.

## Casos de uso

- Generación de imágenes de mascota personalizada: usar el token `sks` en el prompt para producir al sujeto en escenas nuevas (playa, parque, estudio) sin reentrenar, útil para demos de personalización o pruebas de concepto.
- Evaluación de pipelines DreamBooth + LoRA: el artefacto incluye configuración, métricas de pérdida y logs de TensorBoard, por lo que sirve como referencia reproducible para comparar hiperparámetros (rango, pasos, prior preservation).
- Docencia y tutoriales de difusión: ejemplo mínimo (3,19 M de parámetros entrenables, 14,5 minutos en una RTX 4090) para explicar adaptadores de bajo rango sobre U-Net.
- Pruebas de integración con `diffusers`: validar la carga de pesos LoRA con `load_lora_weights` y el ajuste de `scale` en pipelines de inferencia.
- Investigación sobre sobreajuste en personalización: comparar la pérdida de instancia frente a la de priora y estudiar el equilibrio entre fidelidad al sujeto y diversidad.
- Generación de material gráfico para prototipos: ilustraciones rápidas de un sujeto concreto en contextos variados, siempre con revisión humana por la licencia y la calidad limitada del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| final_loss_instance | 0,16488 |
| final_loss_prior | 0,13861 |
| final_loss | 0,30349 |

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada; al cargar sobre Stable Diffusion 1.5 en fp16 se requiere el espacio del modelo base más el adaptador LoRA (que añade solo 3,19 M de parámetros). En la práctica, Stable Diffusion 1.5 en fp16 ocupa del orden de varios GB de VRAM, aunque el autor no publica una cifra concreta.
- GPU recomendadas: el autor entrenó en una NVIDIA GeForce RTX 4090; para inferencia, cualquier GPU con VRAM suficiente para Stable Diffusion 1.5 en fp16 debería servir, pero no se especifican modelos concretos.
- GPU de consumo: cabe en GPUs de consumo con VRAM suficiente para SD 1.5; no se detalla la lista exacta.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights` (método documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dreambooth-lora-sd15-ray-dog | 3,19 M LoRA + 859,52 M U-Net congelado | No aplica | Sin benchmarks publicados; pérdidas de entrenamiento reportadas | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | ~860 M U-Net + VAE + CLIP | No aplica | Benchmarks de difusión ampliamente publicados (no incluidos aquí) | CreativeML OpenRAIL-M | Hugging Face, ampliamente usado |
| Otros LoRA DreamBooth sobre SD 1.5 | Variable (según rango) | No aplica | Depende del entrenamiento | Habitualmente CreativeML OpenRAIL-M | Hugging Face, comunidad |

No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el adaptador solo aporta el sujeto `sks`; no mejora las capacidades generales de generación del modelo base.
- Riesgo de sobreajuste: con 2000 pasos y rango 16, las salidas pueden copiar las fotos de entrenamiento; el autor recomienda reducir `scale` (por ejemplo, 0,7) si ocurre.
- Sesgos: no documentados; hereda los sesgos del dataset `yaryar78/Ray_dog` y de Stable Diffusion 1.5.
- Alucinación visual: como todo modelo de difusión, puede generar anatomías o texturas inconsistentes, especialmente en contextos complejos.
- Idiomas: no documentados; los prompts dependen del codificador CLIP del base, con mejor rendimiento en inglés.
- Licencia: CreativeML OpenRAIL-M impone restricciones de uso (prohibición de usos dañinos y obligación de incluir las restricciones en redistribuciones); revisar antes de uso comercial.
- Madurez: 0 descargas y 0 likes, creado y actualizado el 2026-11-24; sin validación comunitaria ni demos publicadas.
- Sin datos de cuantización ni de despliegue en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yaryar78/dreambooth-lora-sd15-ray-dog
- Dataset: https://huggingface.co/datasets/yaryar78/Ray_dog
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Repositorio de código: https://github.com/yar78/vision-generative-models-survey
- Commit de entrenamiento: https://github.com/yar78/vision-generative-models-survey/commit/6d08430d968b0178d6c27d9e3a0ebca8a3556788
