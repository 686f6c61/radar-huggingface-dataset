# TechnoBaptist/Chroma1-HD

## Resumen

Chroma1-HD es un modelo de generación de imágenes a partir de texto (text-to-image) de 8.900 millones de parámetros desarrollado por TechnoBaptist y publicado en HuggingFace bajo licencia Apache 2.0. Está construido sobre la arquitectura de FLUX.1-schnell, el modelo de difusión de Black Forest Labs, y se distribuye con un pipeline propio (`ChromaPipeline`) integrado en la librería `diffusers`. Su relevancia radica en que ofrece una base de código abierto totalmente permisiva para uso comercial sobre una arquitectura de alta calidad como FLUX, algo poco habitual en el ecosistema de difusión.

El modelo se presenta explícitamente como un *base model*, es decir, un punto de partida neutro pensado para *finetuning* y especialización por parte de desarrolladores, investigadores y artistas, más que como un modelo listo para producción sin ajuste. El autor mantiene además una variante derivada, Chroma1-Flash, con la escala de guiado (CFG) "horneada" para inferencia rápida.

La información disponible en la model card es limitada: no se detallan idiomas soportados, benchmarks ni composición completa del dataset. El repositorio ocupa 45,3 GB y, en el momento de la consulta, acumula 18 descargas y ninguna interacción social, lo que sugiere un modelo de nicho o de reciente publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión basada en FLUX.1-schnell (transformer de difusión, 8.9B) |
| Parametros totales | 8.899.983.424 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; el texto de entrada se procesa con T5-XXL) |
| Tipos de cuantizacion | bfloat16, float16, int8 dinámico (A8W8) y fp8 dinámico vía gemlite; A16W4 MXFP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

Chroma1-HD emplea la arquitectura de difusión de FLUX.1-schnell, un transformer de difusión de 8.900 millones de parámetros que opera sobre latentes de un VAE (el VAE de FLUX, distribuido como `ae.safetensors`). El codificador de texto es T5-XXL en precisión fp16, cargado por separado en ComfyUI en la carpeta `clip`. El pipeline de `diffusers` (`ChromaPipeline`) gestiona la generación con prompts y *negative prompts*, con parámetros típicos de 40 pasos de inferencia y `guidance_scale` de 3.0.

Según la model card, el modelo fue entrenado sobre un dataset de 5 millones de muestras, aunque el texto se corta en la información disponible y no se detalla la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de difusión). El autor menciona que el *pretraining* y la recolección de datos fueron financiados por un donante anónimo, y que el modelo se distribuye con historial de entrenamiento transparente. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con soporte de *prompts* negativos para excluir atributos no deseados.
- Control de la generación mediante semilla (`generator`), número de pasos de inferencia y escala de guiado (CFG).
- Generación de múltiples imágenes por prompt (`num_images_per_prompt`).
- Base para *finetuning*: diseñado como checkpoint neutro para crear modelos especializados (estilos, dominios, personajes).
- Inferencia cuantizada: soporte de int8 dinámico, fp8 dinámico y A16W4 MXFP mediante la librería gemlite, con `torch.compile` para acelerar el transformer y el VAE.
- Integración con ComfyUI mediante *workflow* JSON, checkpoint y VAE de FLUX.
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking* (no aplica a un modelo de difusión).

## Casos de uso

- **Generación de arte conceptual y *moodboards*:** el modelo permite iterar rápidamente sobre descripciones textuales con control de semilla y *prompts* negativos, útil para estudios de diseño que necesitan explorar variaciones de estilo antes de producir assets finales.
- **Creación de modelos especializados por *finetuning*:** al ser un *base model* Apache 2.0, equipos pueden ajustarlo con LoRA o *full finetuning* sobre un dominio concreto (por ejemplo, producto, arquitectura o ilustración infantil) y desplegar el resultado comercialmente sin restricciones de licencia.
- **Generación de imágenes para marketing y *e-commerce*:** con 40 pasos y `guidance_scale` 3.0 se obtienen imágenes de producto consistentes; la licencia permisiva permite su uso en campañas y catálogos sin obligación de atribución.
- **Prototipado en ComfyUI:** el *workflow* JSON incluido permite a artistas técnicos encadenar el modelo con otros nodos (upscalers, *inpainting*, *controlnets*) para flujos de posproducción.
- **Investigación en difusión:** al estar basado en FLUX.1-schnell y publicarse con historial de entrenamiento, sirve como banco de pruebas para estudiar el efecto de *finetuning*, cuantización o cambios en el codificador de texto.
- **Despliegue con inferencia cuantizada:** el ejemplo con gemlite (A8W8 int8) reduce el tiempo de generación de aproximadamente 66 s a 27,7 s por imagen en el hardware del autor, lo que lo hace viable en GPUs de gama alta de consumo para iteración interactiva.
- **Generación de *assets* para videojuegos y narrativa visual:** útil para producir *concept art* de personajes y escenarios que luego se refinan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada:** el modelo tiene 8.900 millones de parámetros; en bfloat16 requiere aproximadamente 17,8 GB solo para los pesos del transformer, a los que hay que sumar el VAE y el codificador T5-XXL (unos 9,5 GB en fp16). En la práctica, la inferencia completa en bf16 necesita del orden de 24-32 GB de VRAM, o bien *offload* a CPU.
- **GPU recomendadas:** A100 (40/80 GB), H100, RTX 4090 (24 GB) con *offload* parcial o cuantización. El autor usa `enable_model_cpu_offload()` en el ejemplo estándar, lo que permite ejecutar en GPUs con menos VRAM a costa de latencia.
- **¿Cabe en GPU de consumo?** Sí, en RTX 4090 con cuantización int8/fp8 vía gemlite o con *offload*; en GPUs de 12-16 GB es necesario cuantizar y usar *offload*.
- **Opciones de despliegue:** `diffusers` con `ChromaPipeline`, ComfyUI (checkpoint + T5-XXL fp16 + VAE de FLUX), gemlite para cuantización y `torch.compile`. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión).
- **Latencia y throughput:** el autor reporta 66,1 s por imagen con 40 pasos en bf16 y 27,7 s con cuantización int8 dinámica y `torch.compile` en su hardware (no especificado). No se dispone de cifras de throughput por GPU concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chroma1-HD | 8,9B | prompt de texto (T5-XXL) | Apache 2.0 | HuggingFace, diffusers, ComfyUI | Base model para *finetuning* sobre FLUX.1-schnell |
| FLUX.1-schnell | 12B | prompt de texto (T5-XXL + CLIP) | Apache 2.0 | HuggingFace, diffusers | Modelo original de Black Forest Labs; más parámetros y guiado destilado |
| FLUX.1-dev | 12B | prompt de texto | no comercial | HuggingFace, diffusers | Variante de mayor calidad pero con licencia restrictiva para uso comercial |
| Chroma1-Flash | no disponible | prompt de texto | Apache 2.0 (según model card) | HuggingFace | Variante de Chroma1 con CFG "horneada" para inferencia rápida |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo entre estos modelos.

## Limitaciones y advertencias

- **Sesgos:** no se documentan evaluaciones de sesgo; al entrenarse sobre un dataset de 5 millones de muestras sin detallar su composición, es probable que herede sesgos demográficos y culturales del corpus.
- **Alucinación visual:** como todo modelo de difusión, puede generar detalles anatómicos incorrectos, texto ilegible en la imagen o elementos incoherentes con el *prompt*; el uso de *negative prompts* mitiga parcialmente el problema.
- **Idiomas:** no se especifican los idiomas soportados; el codificador T5-XXL es multilingüe, pero no hay garantía documentada de calidad fuera del inglés.
- **Licencia:** Apache 2.0 permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no impone restricciones de uso más allá de las estándar.
- **Modelo base:** no está optimizado para uso directo en producción; el autor lo describe como punto de partida para *finetuning*, por lo que la calidad sin ajuste puede ser inferior a la de modelos afinados.
- **Documentación incompleta:** la model card está truncada y no incluye detalles de entrenamiento, evaluación ni limitaciones formales.
- **Madurez:** con 18 descargas y ninguna interacción, no hay evidencia de comunidad ni de validación independiente del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/TechnoBaptist/Chroma1-HD
- Modelo original de referencia: https://huggingface.co/lodestones/Chroma1-HD
- Variante rápida: https://huggingface.co/lodestones/Chroma1-Flash
- Checkpoint para ComfyUI: https://huggingface.co/lodestones/Chroma
- Codificador T5-XXL fp16: https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp16.safetensors
- VAE de FLUX: https://huggingface.co/lodestones/Chroma/resolve/main/ae.safetensors
- Workflow de ComfyUI: https://huggingface.co/lodestones/Chroma1-HD/resolve/main/ComfyUI_Chroma1-HD_T2I-workflow.json
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/chroma1-hd-lodestones
- Plataforma del patrocinador: https://fictional.ai/?ref=chroma_hf
