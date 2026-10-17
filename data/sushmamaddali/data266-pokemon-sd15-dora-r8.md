# SushmaMaddali/data266-pokemon-sd15-dora-r8

## Resumen

Se trata de un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) de rango 8 entrenado sobre Stable Diffusion 1.5 para generar imágenes con estética Pokémon. Lo publica la usuaria SushmaMaddali (Sai Sushma M) como parte de un trabajo académico no comercial del curso DATA266, y se apoya en el dataset público `reach-vb/pokemon-blip-captions` (749 pares imagen-texto). No es un modelo completo, sino un conjunto de pesos PEFT que se acoplan al UNet del modelo base.

Su relevancia es metodológica más que de producto: sirve para estudiar y comparar técnicas de ajuste eficiente (DoRA frente a LoRA clásico) en modelos de difusión con datasets pequeños, un escenario habitual en investigación con recursos limitados. El repositorio incluye el checkpoint en un formato PEFT propio (`1500_lora.pt` y `1500_lora_config.json`) que no carga con `pipe.load_lora_weights()` de Diffusers, lo que condiciona por completo su uso.

La licencia es `other` y restringe explícitamente el uso a fines académicos y de investigación no comerciales, con la advertencia adicional de que los personajes Pokémon están protegidos por derechos de autor. El repositorio no registra descargas ni interacciones y su tamaño es de 0,0 GB, coherente con un adaptador de bajo rango.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (PEFT) sobre Stable Diffusion 1.5: difusión latente con UNet, VAE y codificador de texto CLIP ViT-L/14 |
| Parametros totales | No disponible para el adaptador (rango 8, repo de 0,0 GB); el modelo base SD 1.5 suma ~1.000 M (UNet ~860 M, VAE ~84 M, CLIP ~123 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 77 tokens de prompt (límite del codificador de texto CLIP del modelo base) |
| Tipos de cuantizacion | No especificados para el adaptador (entrenado en BF16); el modelo base admite fp16/fp32 y cuantizaciones GGUF de terceros |
| Idiomas soportados | No disponible en la model card; el codificador CLIP del modelo base está entrenado principalmente en inglés |
| Licencia | other: uso académico y de investigación no comercial únicamente |
| Formato de pesos | PEFT DoRA: `1500_lora.pt` + `1500_lora_config.json`; no compatible con `pipe.load_lora_weights()` de Diffusers |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5, un modelo de difusión latente que opera en un espacio comprimido por un VAE, con un UNet como red de denoising y un codificador de texto CLIP ViT-L/14 que condiciona la generación (resolución nativa de 512×512 píxeles). Sobre ese UNet se aplica un adaptador DoRA, variante de LoRA que descompone los pesos en magnitud y dirección para aproximar mejor el comportamiento de un ajuste fino completo con un coste de parámetros bajo.

El entrenamiento se realizó sobre 749 pares imagen-caption del dataset `reach-vb/pokemon-blip-captions`, con los siguientes hiperparámetros declarados: rango 8, learning rate 1e-4, 1.500 pasos, batch size 2, precisión BF16 y semilla 266. No se documentan tokens totales, composición del dataset más allá del nombre, ni etapas de RLHF/DPO, que no aplican en un modelo de texto a imagen. Tampoco se detalla si se congelaron el VAE y el codificador de texto, práctica habitual en este tipo de ajustes.

La innovación técnica destacable es precisamente el uso de DoRA en lugar de LoRA convencional con un rango muy bajo (8), lo que permite comparar la eficacia de ambos métodos con el mismo presupuesto de parámetros. Como contrapartida, el autor emplea un formato de checkpoint PEFT propio que requiere su script (`lora_script_dora.py`) y no se integra en el ecosistema estándar de Diffusers.

## Capacidades

- Generación de imágenes de texto a imagen (text-to-image) a 512×512 píxeles, condicionada por prompts en inglés.
- Especialización en estética y personajes tipo Pokémon, aprendida de los 749 pares imagen-caption del dataset de entrenamiento.
- Adaptación de bajo rango acoplable al UNet de cualquier instancia de Stable Diffusion 1.5 compatible.
- No dispone de tool calling ni function calling: es un modelo generativo de imagen, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni modo thinking.
- No procesa visión como entrada (no es image-to-image nativo ni acepta imágenes de referencia).
- No soporta audio, vídeo ni otras modalidades.
- Capacidad multilingüe: no disponible; el condicionamiento depende de CLIP, orientado al inglés.
- Compatible con el safety checker de Stable Diffusion, que el autor activó durante la evaluación.

## Casos de uso

- Docencia en ajuste eficiente de modelos de difusión: el adaptador sirve como ejemplo reproducible de cómo aplicar DoRA sobre un UNet con un dataset pequeño, con hiperparámetros documentados y semilla fija.
- Comparativa DoRA frente a LoRA: junto al repositorio hermano `data266-pokemon-sd15-lora-r32` del mismo autor, permite aislar el efecto del método y del rango manteniendo el dataset y el modelo base.
- Estudio de sobreajuste con datasets reducidos: 749 pares y 1.500 pasos con batch 2 es un régimen propicio para analizar cuánto memoriza el adaptador frente a cuánto generaliza, un experimento típico de investigación.
- Generación de material ilustrativo para trabajos académicos no comerciales: figuras, ejemplos de clase o demos internas con estética de criaturas, siempre dentro del uso docente permitido.
- Prototipado de pipelines de generación de imagen con PEFT: útil para validar la carga de checkpoints en formato no estándar y la integración con scripts propios antes de migrar a otros adaptadores.
- Evaluación de filtros de seguridad: al ser un adaptador derivado de una IP con copyright, sirve para probar el comportamiento del safety checker y de políticas de contenido en despliegues controlados.
- Reproducibilidad de experimentos: la semilla 266 y los parámetros declarados permiten replicar el entrenamiento y contrastar resultados en estudios de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, precisión de prompting) ni comparaciones numéricas con otros adaptadores, y el repositorio no aporta logs de evaluación más allá de la mención al safety checker.

## Requisitos de hardware

- El adaptador en sí ocupa una fracción muy pequeña de disco (el repositorio se reporta como 0,0 GB), por lo que el coste real lo determina el modelo base Stable Diffusion 1.5.
- Inferencia del modelo base en fp16 a 512×512: aproximadamente 4 GB de VRAM, holgado con 6-8 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090. En GPUs de 4-6 GB puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- GPU de datacenter: A100, H100 o L4 sin problemas; no son necesarias para este tamaño y solo se justifican por volumen de generación.
- Despliegue: al no ser compatible con `load_lora_weights()`, hay que usar el script PEFT incluido (`lora_script_dora.py`) o fusionar los pesos manualmente en el UNet antes de servir el modelo con Diffusers, vLLM (no aplica a difusión), TorchServe o endpoints personalizados. Alternativas como ComfyUI u Ollama no soportan este formato sin conversión previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SushmaMaddali/data266-pokemon-sd15-dora-r8` (este) | Adaptador rango 8 sobre SD 1.5 (~1.000 M) | 77 tokens de prompt | Sin benchmarks publicados | other, solo académico no comercial | Hugging Face, formato PEFT propio |
| `SushmaMaddali/data266-pokemon-sd15-lora-r32` | Adaptador LoRA rango 32 sobre SD 1.5 (según el identificador del repositorio) | 77 tokens de prompt | Sin benchmarks publicados | other, solo académico no comercial | Hugging Face |
| Stable Diffusion 1.5 (modelo base) | ~1.000 M | 77 tokens de prompt | Benchmarks públicos de la familia SD 1.x, no reproducidos aquí | CreativeML OpenRAIL-M | Amplia: Diffusers, ComfyUI, GGUF, etc. |

No se dispone de datos verificables de otros adaptadores comparables en la información proporcionada, más allá de los dos repositorios del mismo autor y del modelo base. La comparación de rendimiento entre DoRA r8 y LoRA r32 requeriría una evaluación propia con el mismo conjunto de prompts.

## Limitaciones y advertencias

- Licencia restrictiva: uso exclusivamente académico y de investigación no comercial. Prohibido el uso comercial, la suplantación y el uso en producción según la model card.
- Propiedad intelectual: los personajes Pokémon y sus ilustraciones están protegidos por derechos de autor; el propio autor lo advierte de forma explícita.
- Obligación de cumplir también la licencia del modelo base (CreativeML OpenRAIL-M) y los términos del dataset `reach-vb/pokemon-blip-captions`.
- Riesgo alto de sobreajuste y memorización: 749 imágenes con 1.500 pasos y batch 2 sobre un adaptador de rango 8 favorecen la reproducción de motivos del conjunto de entrenamiento.
- Alucinación visual: como cualquier modelo de difusión, puede generar anatomía incoherente, texto ilegible y composiciones incorrectas respecto al prompt.
- Limitación de idioma: el condicionamiento por CLIP está orientado al inglés; los prompts en castellano previsiblemente darán resultados pobres, aunque no se han publicado evaluaciones al respecto.
- Ventana de prompt de solo 77 tokens, insuficiente para descripciones muy detalladas o prompts con muchas restricciones.
- Fricción de integración: el formato PEFT propietario impide la carga directa en Diffusers, ComfyUI y la mayoría de herramientas estándar; requiere el script del autor o una conversión manual.
- Ausencia de benchmarks y de documentación sobre datos de evaluación: no hay evidencia cuantitativa de calidad ni de fidelidad al prompt.
- Cero adopción registrada (0 descargas, 0 likes) y fecha de creación atípica en los metadatos; conviene verificar la integridad del repositorio antes de usarlo.
- El safety checker solo se activó durante la evaluación, no necesariamente en todos los usos posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-dora-r8
- Modelo base Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Perfil del autor en Hugging Face: https://huggingface.co/SushmaMaddali
- Adaptador hermano con LoRA rango 32: https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-lora-r32
- Repositorio del curso con código y checkpoints: https://github.com/sai-sushma-maddali/data266-lab1
- Etiqueta Pokémon en Civitai (contexto de la comunidad de adaptadores, no vinculada al modelo): https://civitai.com/tag/pokemon
- Mercado de modelos de PixAI (contexto, no vinculado al modelo): https://pixai.art/market
