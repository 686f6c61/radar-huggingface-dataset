# SushmaMaddali/data266-pokemon-sd15-full-unet

## Resumen

`data266-pokemon-sd15-full-unet` es un ajuste fino completo (full fine-tuning) del UNet de Stable Diffusion 1.5 sobre el dataset `reach-vb/pokemon-blip-captions`, un conjunto de 749 imágenes de criaturas al estilo Pokémon con sus correspondientes descripciones textuales. Lo publica la usuaria SushmaMaddali como parte de un trabajo académico (el identificador "data266" sugiere una práctica de curso) y el repositorio contiene únicamente los pesos del UNet; el text encoder CLIP, el tokenizer y el VAE se heredan del modelo base.

El interés es doble. Por un lado, es un ejemplo reproducible de fine-tuning completo de un modelo de difusión latente con un presupuesto muy pequeño (1.500 pasos, batch efectivo de 2, learning rate 1e-5, precisión BF16, semilla 266), lo que lo convierte en material didáctico para comparar full fine-tuning frente a LoRA o DreamBooth. Por otro, sirve como caso de estudio de sobreajuste: con solo 749 imágenes y 1.500 pasos sobre un UNet de 859 millones de parámetros, el autor advierte explícitamente de que el modelo puede perder detalles solicitados, componer escenas de forma débil y generalizar mal a prompts alejados del dominio.

No es un modelo de propósito general ni un modelo de lenguaje: es un pipeline `text-to-image` de la familia Stable Diffusion con una licencia `other` que restringe el uso a coursework académico y research no comercial, y que además exige cumplir la licencia del modelo base y los términos del dataset original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet2DConditionModel (difusión latente) sobre Stable Diffusion 1.5; text encoder CLIP ViT-L/14 congelado, heredado del base |
| Parametros totales | 859.520.964 (solo UNet; el repositorio no incluye VAE ni text encoder) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no indicada en la model card; el pipeline usa el tokenizer CLIP de SD 1.5, limitado a 77 tokens por prompt |
| Tipos de cuantizacion | no se publican variantes cuantizadas (sin GGUF, ONNX ni FP8 en el repositorio); los pesos se distribuyen en safetensors y se pueden cargar en fp16, bf16 o fp32 con diffusers |
| Idiomas soportados | no disponible (el text encoder CLIP de SD 1.5 está entrenado predominantemente en inglés) |
| Licencia | other: uso limitado a coursework académico y research no comercial; prohibido uso comercial, suplantación de identidad y producción |
| Formato de pesos | safetensors (subcarpeta `unet`) |
| Resolucion nativa | no indicada en la model card; el modelo base SD 1.5 opera a 512x512 |
| Tamano del repositorio | 3,6 GB |
| Descargas / likes | 6 descargas, 0 likes |
| Fecha de publicacion | 17 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del UNet de Stable Diffusion 1.5: un backbone convolucional con bloques ResNet y capas de atención cruzada que recibe latentes ruidosos, el paso de timestep y los embeddings de texto del codificador CLIP, y predice el ruido. El ajuste afecta solo al UNet; el VAE y el text encoder permanecen intactos, tal como indica el autor en las instrucciones de carga (`UNet2DConditionModel.from_pretrained(..., subfolder="unet")` inyectado en `StableDiffusionPipeline.from_pretrained(BASE_MODEL, unet=...)`).

El entrenamiento se realizó sobre `reach-vb/pokemon-blip-captions` (749 imágenes con captions generados por BLIP), con estos hiperparámetros documentados: learning rate 1e-5, 1.500 pasos, batch size 1, gradient accumulation de 2 pasos (batch efectivo 2), precisión BF16 y semilla 266. No se especifican en la información disponible el número total de tokens/imágenes vistas, la composición exacta del dataset más allá del nombre, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de difusión condicionada). Tampoco se documentan técnicas de decodificación acelerada, atención lineal ni destilación; es un fine-tuning estándar de ruido epsilon sobre el objetivo de difusión original.

## Capacidades

- Generación de imágenes a partir de prompts de texto (`text-to-image`) mediante `StableDiffusionPipeline`.
- Especialización estilística en criaturas tipo Pokémon e ilustraciones cartoon derivadas del dataset de entrenamiento.
- Generación de imágenes a 512x512 con el VAE de SD 1.5 (resolución nativa del base).
- Al cargarse sobre el pipeline completo del base, hereda las capacidades del pipeline: `img2img`, `inpainting` y variantes con scheduler intercambiable (no son capacidades entrenadas específicamente en este checkpoint).
- Control mediante `negative_prompt`, `guidance_scale`, `num_inference_steps` y `generator` (semilla), igual que en SD 1.5.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües garantizadas: los prompts en inglés son el caso esperado por el tokenizer CLIP del base.
- No procesa audio ni entrada de vídeo; no hay modo "thinking" ni razonamiento explícito.

## Casos de uso

- Docencia en cursos de difusión: el repositorio documenta todos los hiperparámetros (lr 1e-5, 1.500 pasos, batch efectivo 2, BF16, semilla 266), lo que permite reproducir el experimento y discutir el efecto del full fine-tuning frente a LoRA en un dataset de 749 imágenes.
- Estudio de sobreajuste con datasets pequeños: sirve para medir empíricamente cómo un UNet de 859 M de parámetros memoriza un dominio estrecho y pierde fidelidad a prompts fuera de distribución, tal como advierte el autor.
- Generación de ilustraciones de criaturas para materiales académicos no comerciales: apuntes, presentaciones de clase o demos de investigación donde se necesita un estilo consistente tipo Pokémon.
- Creación de datasets sintéticos para investigación: generar lotes de imágenes etiquetadas con un estilo controlado para experimentos de clasificación, aumentación de datos o evaluación de detectores, siempre en ámbito no comercial.
- Prototipado de pipelines `diffusers`: al ser un reemplazo directo del UNet base, permite probar integraciones (schedulers, `img2img`, inpainting) sin cambiar el código del pipeline.
- Comparación de metodologías de entrenamiento: confrontar este full fine-tuning con alternativas LoRA o DreamBooth sobre el mismo dataset y los mismos prompts, para cuantificar diferencias de fidelidad y diversidad.
- Reproducción de experimentos: la semilla 266 y la configuración cerrada permiten replicar el entrenamiento en una sola GPU consumer en cuestión de horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, Inception Score ni evaluaciones humanas, ni comparaciones cuantitativas con el modelo base u otros fine-tunes.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del UNet en fp16 ocupan aproximadamente 1,7 GB; el pipeline completo (UNet + VAE + text encoder CLIP) ronda los 2 GB de pesos en fp16 y necesita del orden de 4-6 GB de VRAM para generar a 512x512 con batch 1 (estimación orientativa para SD 1.5, no medida sobre este checkpoint).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso interactivo; A100 o H100 solo si se necesita batch grande o generación masiva.
- Cabe en GPU consumer: sí, en cualquier GPU con 6 GB o más de VRAM en fp16 (por ejemplo GTX 1660 Super 6 GB, RTX 2060 6 GB, RTX 3050 8 GB). Por debajo de 6 GB habría que recurrir a `enable_attention_slicing()` o `enable_sequential_cpu_offload()`.
- Opciones de despliegue: `diffusers` (ruta oficial documentada), así como los wrappers habituales para SD 1.5 (AUTOMATIC1111, ComfyUI, InvokeAI) sustituyendo el checkpoint del UNet. No hay conversión a GGUF ni a ONNX en el repositorio, por lo que no es desplegable directamente en llama.cpp u Ollama; vLLM y TGI no aplican a pipelines de difusión en este formato.
- Latencia y throughput: no disponibles para este checkpoint. Como referencia del modelo base SD 1.5 a 512x512 y 50 pasos, cabría esperar del orden de 2-4 s por imagen en una RTX 4090 y 6-10 s en una RTX 3060, pero son estimaciones no verificadas sobre este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros (UNet) | Contexto de prompt | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SushmaMaddali/data266-pokemon-sd15-full-unet` | 859.520.964 | 77 tokens (CLIP SD 1.5) | Pokémon, full fine-tuning | other (solo académico/no comercial) | HuggingFace, diffusers, 6 descargas |
| `stable-diffusion-v1-5/stable-diffusion-v1-5` (base) | 859.520.964 | 77 tokens (CLIP) | Propósito general | CreativeML OpenRAIL-M | HuggingFace, ampliamente adoptado |
| `reach-vb/pokemon-blip-captions` (dataset, no modelo) | no aplica | no aplica | 749 imágenes etiquetadas de Pokémon | según el dataset original | HuggingFace Datasets |
| Fine-tunes tipo LoRA/DreamBooth de Pokémon sobre SD 1.5 | no disponible | 77 tokens (CLIP) | Pokémon, ajuste parametrizado eficiente | variable según autor | múltiples en HuggingFace |

No se dispone de datos de rendimiento comparativos (FID, CLIP score) entre este checkpoint y el modelo base ni con otros fine-tunes de Pokémon, por lo que la comparación se limita a arquitectura, tamaño y licencia. Las cifras de parámetros del modelo base se corresponden con el mismo UNet del que deriva este repositorio; el resto de filas se marcan como no disponibles al no haberse podido verificar.

## Limitaciones y advertencias

- Sobreajuste probable: 1.500 pasos sobre 749 imágenes con un UNet de 859 M de parámetros y batch efectivo de 2. El propio autor advierte de que el modelo puede omitir detalles solicitados, producir composiciones débiles y generalizar mal a prompts desconocidos.
- Sesgo de dominio: el dataset son ilustraciones de criaturas tipo Pokémon; es esperable un sesgo fuerte hacia paletas, contornos y composiciones de ese estilo, con degradación al pedir fotografía realista, texto en la imagen o escenas complejas.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir anatomías incoherentes (miembros extra, ojos deformados) y no existe verificación factual de la salida.
- Limitación de idioma: no hay soporte multilingüe declarado; los prompts en castellano probablemente rindan peor que en inglés por el tokenizer CLIP del base.
- Ventana de prompt corta: 77 tokens, insuficiente para descripciones muy largas o prompts de sistema complejos.
- Restricciones de licencia: licencia `other` que limita el uso a coursework académico y research no comercial; se prohíbe expresamente el uso comercial, la suplantación de identidad y el uso en producción. Además hay que cumplir la licencia del modelo base y los términos del dataset.
- Propiedad intelectual: los personajes y artworks de Pokémon están protegidos por copyright; la licencia del repositorio no concede derechos sobre ellos.
- Safety checker: se usó el de SD 1.5 durante la evaluación, pero el repositorio solo contiene el UNet; si se despliega, hay que activar explícitamente el filtro de seguridad del pipeline base.
- Madurez del artefacto: 6 descargas y 0 likes, sin issues ni validación externa; no es un checkpoint probado en producción.
- No incluye VAE ni text encoder: no es un checkpoint autónomo, requiere el modelo base para funcionar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-full-unet
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Documentación de diffusers (`UNet2DConditionModel`): https://huggingface.co/docs/diffusers/api/models/unet2d-cond
- Documentación de diffusers (`StableDiffusionPipeline`): https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/text2img
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo (paper, blog o demo); los únicos resultados obtenidos fueron contenido no relacionado y no se incluyen.
