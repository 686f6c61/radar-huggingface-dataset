# vianney28/lora-angel

## Resumen

`vianney28/lora-angel` es un adaptador LoRA (Low-Rank Adaptation) entrenado con DreamBooth sobre el modelo base Stable Diffusion 1.5 (`stable-diffusion-v1-5/stable-diffusion-v1-5`). Lo publica el usuario vianney28 en Hugging Face y su propósito es la personalización de la generación de imágenes texto-a-imagen para reproducir un sujeto concreto, definido en la model card mediante el prompt de instancia «foto de una persona zxqh». No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de pesos de adaptación de bajo rango que se carga junto al checkpoint base.

La relevancia de este tipo de artefacto es práctica: permite fijar la identidad visual de una persona o concepto con un entrenamiento ligero, sin reentrenar el UNet completo de Stable Diffusion. Al estar empaquetado en formato `diffusers` y con licencia CreativeML OpenRAIL-M, puede integrarse en pipelines existentes de generación de imágenes, aunque su naturaleza experimental y la ausencia de documentación técnica detallada limitan su uso en producción sin una validación previa.

El repositorio tiene un tamaño declarado de 0.0 GB, cero descargas y cero «likes» en el momento de la consulta, y la model card es en gran medida una plantilla autogenerada por el script de entrenamiento, con secciones marcadas como TODO. Toda la información técnica disponible procede de los metadatos del repositorio y de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre el UNet de Stable Diffusion 1.5; el text encoder no se adapta (LoRA para text encoder deshabilitado) |
| Parametros totales | no disponible (no se declara el rango ni el número de módulos adaptados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión texto-a-imagen; la ventana de texto la fija el tokenizer CLIP del modelo base, 77 tokens) |
| Tipos de cuantizacion | no disponible (los pesos LoRA se distribuyen en el formato del repo `diffusers`; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible; el prompt de instancia está en castellano («foto de una persona zxqh»), pero el modelo base está entrenado principalmente con texto en inglés |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors / formato `diffusers` (repositorio de la librería diffusers) |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Metodo de entrenamiento | DreamBooth con LoRA |
| Libreria | diffusers |
| Pipeline | text-to-image |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Stable Diffusion 1.5, un modelo de difusión latente compuesto por un autoencoder VAE, un UNet con atención cruzada y un text encoder CLIP. La contribución del repositorio es un conjunto de pesos LoRA que modifican las capas del UNet mediante matrices de bajo rango, manteniendo congelados los pesos originales. La model card confirma que el LoRA del text encoder está desactivado (`LoRA for the text encoder was enabled: False`), por lo que la personalización afecta únicamente a la generación visual y no al mapeo texto-embedding.

El entrenamiento se realizó con DreamBooth, la técnica de personalización por few-shot que asocia un token raro de instancia («zxqh») a un sujeto concreto. No se documentan el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango de las matrices LoRA ni la composición del dataset; la model card deja estas secciones explícitamente como pendientes (`[TODO: describe the data used to train the model]`). Tampoco se indica si hubo regularización por class prior preservation ni qué script exacto de `diffusers` se empleó, más allá de las etiquetas `diffusers-training` y `tensorboard`. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el modelo base Stable Diffusion 1.5.
- Personalización de un sujeto concreto mediante el token de instancia «zxqh» y el prompt «foto de una persona zxqh».
- Inyección de identidad visual en el UNet sin reentrenar el modelo completo, lo que permite combinarlo con otros LoRA y prompts de estilo.
- Compatibilidad con el ecosistema `diffusers` (carga mediante `load_lora_weights` o `PeftAdapterMixin`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo «thinking»: no es un modelo de lenguaje.
- No dispone de capacidades de visión, audio ni comprensión multimodal.
- El multilingüismo efectivo depende del text encoder CLIP del modelo base, orientado al inglés; no se documenta soporte específico para castellano.

## Casos de uso

- Prototipado de avatares personalizados: cargar el LoRA junto a Stable Diffusion 1.5 en un pipeline `diffusers` y generar retratos consistentes del sujeto «zxqh» para maquetas de producto o pruebas de concepto visuales.
- Generación de material gráfico para un proyecto creativo personal: el adaptador permite mantener la identidad de un personaje a lo largo de una serie de imágenes con distintos estilos y encuadres, combinándolo con prompts de escena.
- Investigación sobre personalización few-shot: sirve como ejemplo reproducible de un entrenamiento DreamBooth + LoRA para comparar hiperparámetros, rangos y estrategias de regularización frente a otros adaptadores.
- Pruebas de pipelines de inferencia: al ser un LoRA pequeño, es útil para validar flujos de carga de adaptadores, composición de múltiples LoRA y control de pesos en entornos de experimentación con `diffusers`.
- Fines educativos: demostrar en un taller o artículo cómo se estructura un repositorio LoRA de DreamBooth y qué metadatos genera automáticamente el script de entrenamiento.
- Generación de variaciones de un personaje para guiones o storyboards: con el token de instancia fijo se pueden producir bocetos coherentes de una misma figura en distintas poses, siempre que se valide la calidad caso por caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (el repositorio declara 0.0 GB), pero la inferencia requiere cargar el checkpoint completo de Stable Diffusion 1.5, de aproximadamente 4 GB en precisión fp16.
- VRAM estimada para inferencia con Stable Diffusion 1.5 en fp16: en torno a 4-6 GB con optimizaciones de memoria (`enable_attention_slicing`, `enable_model_cpu_offload`); sin optimizaciones, 8 GB o más.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090 para uso local; A100 o H100 para servir varias instancias en paralelo. Cabe en GPUs de consumo con 8 GB o más aplicando offload.
- Opciones de despliegue: `diffusers` (con `StableDiffusionPipeline` y `load_lora_weights`), ComfyUI, Automatic1111 WebUI y entornos equivalentes que acepten LoRA en formato `diffusers` o convertido a safetensors compatible. No se documenta soporte nativo en llama.cpp, Ollama ni TGI, que no están orientados a difusión.
- Latencia y throughput: no disponibles; dependen de la GPU, de los pasos de muestreo y del scheduler elegido, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vianney28/lora-angel | LoRA DreamBooth | Stable Diffusion 1.5 | no disponible | no aplica | creativeml-openrail-m | Hugging Face |
| Otros LoRA de personaje en Stable Diffusion 1.5 | LoRA DreamBooth | Stable Diffusion 1.5 | variable, no disponible | no aplica | habitualmente creativeml-openrail-m | Hugging Face, Civitai, SeaArt |
| Stable Diffusion 1.5 (base) | Difusión latente | — | ~860 M en UNet | 77 tokens de texto | creativeml-openrail-m | Hugging Face, `runwayml/stable-diffusion-v1-5` |
| Stable Diffusion XL (base) | Difusión latente | — | ~2.6 B en UNet | 77 tokens de texto | creativeml-openrail-m | Hugging Face, `stabilityai/stable-diffusion-xl-base-1.0` |

La comparación cuantitativa de rendimiento no está disponible: no hay métricas publicadas para este adaptador ni una evaluación de identidad frente a alternativas. La diferencia principal con otros LoRA de personaje es la ausencia de documentación y de ejemplos de inferencia en la model card.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada con secciones TODO sin completar; no hay descripción del dataset, hiperparámetros ni ejemplos de uso verificados.
- No se documentan sesgos conocidos, pero al entrenarse sobre Stable Diffusion 1.5 hereda los sesgos del checkpoint base y los del conjunto de imágenes usado en el fine-tuning, que se desconoce.
- Riesgo de alucinación visual y de sobreajuste al sujeto de entrenamiento: el token «zxqh» puede producir artefactos o identidades inconsistentes fuera de las condiciones vistas durante el entrenamiento.
- El prompt de instancia está en castellano, pero el text encoder CLIP del modelo base está optimizado para inglés; los resultados con prompts en castellano pueden degradarse.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, obligación de incluir la licencia y sus restricciones aguas abajo); conviene revisar el texto completo antes de desplegar.
- El repositorio tiene cero descargas y cero interacciones, sin evidencia de validación por la comunidad; no se recomienda su uso en producción sin una evaluación propia de calidad e identidad.
- El tamaño declarado del repositorio (0.0 GB) sugiere que los pesos podrían no estar subidos o que el cálculo de tamaño no se ha actualizado; verificar la presencia real de los archivos antes de integrarlo.
- No hay garantías de compatibilidad con versiones futuras de `diffusers` ni con pipelines que no usen el modelo base exacto indicado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vianney28/lora-angel
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- DreamBooth (paper y proyecto): https://dreambooth.github.io/
- Documentación de `diffusers`: https://huggingface.co/docs/diffusers
- Modelo relacionado en SeaArt AI (Laura Angel LORA): https://www.seaart.ai/models/detail/ad8cb88c41aa5a979ef4cf879d3c2ca1
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
