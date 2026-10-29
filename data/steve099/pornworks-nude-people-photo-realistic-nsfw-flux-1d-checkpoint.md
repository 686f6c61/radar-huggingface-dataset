# steve099/pornworks-nude-people-photo-realistic-nsfw-flux-1d-checkpoint

## Resumen

PornWorks Nude People Photo Realistic NSFW Flux 1D Checkpoint es un checkpoint de generación de imágenes texto-a-imagen publicado por el usuario steve099 (repositorio espejo de la cuenta AI-Porn) y distribuido originalmente a través de CivitAI por el proyecto PornWorks. Según su model card, se trata del primer modelo de la familia PornWorks construido sobre Flux ("flux1d") y está especializado en desnudos fotorrealistas con fines eróticos: el propio autor advierte que el modelo sirve para erotismo y no permite generar escenas de sexo explícito. Es, por tanto, un fine-tune de un modelo base Flux orientado a un nicho de contenido NSFW, no un modelo de propósito general.

Su relevancia es acotada y muy específica: cubre un hueco del ecosistema Flux, que en su versión original tiende a censurar o difuminar genitales y pezones cuando se le piden desnudos, y lo hace manteniendo el estilo fotorrealista característico de la familia. El repositorio de HuggingFace no aporta información técnica sobre el proceso de entrenamiento, los datos utilizados ni el número de pasos de fine-tuning.

El checkpoint pesa 11,9 GB (11,1 GB para el archivo `pornworksNudePeoplePhoto_02.safetensors` de la versión 0.2), un tamaño coherente con pesos en precisión fp8 de un modelo Flux, aunque el autor no confirma ni la arquitectura exacta ni la precisión. La model card solo documenta los parámetros de inferencia recomendados: 20 pasos, sampler "Flux Realistic", scheduler "Simple" y Guidance Scale Distillate de 3,5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada por el autor; el nombre ("flux 1d") y el tamaño de los pesos apuntan a un fine-tune de FLUX.1 (transformer de flujo rectificado, tipo DiT). No verificado |
| Parámetros totales | No disponible; si deriva de FLUX.1 serían ~12 000 M, dato no confirmado para este checkpoint |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como en un LLM. Si se confirma la base FLUX.1, el codificador T5 admite prompts de hasta 512 tokens y el CLIP de 77 tokens; no verificado en este repositorio |
| Tipos de cuantización | El repositorio solo distribuye safetensors. El ecosistema Flux permite fp8, fp16/bf16 y GGUF (Q2–Q8) mediante ComfyUI-GGUF o Diffusers con quanto/bitsandbytes |
| Idiomas soportados | Inglés (etiqueta `language: en`); los prompts deben redactarse en inglés |
| Licencia | openrail++ |
| Formato de pesos | safetensors (un único archivo de 11,1 GB en la versión 0.2, según CivArchive) |
| Tipo de modelo | Texto-a-imagen (difusión / flow matching) |
| Resolución de entrenamiento | No disponible (el ecosistema Flux trabaja habitualmente a 1024×1024) |
| Pasos recomendados | 20 |
| Sampler / scheduler | Flux Realistic / Simple |
| Guidance Scale Distillate | 3,5 |
| Tamaño del repositorio | 11,9 GB |
| Descargas / likes (HuggingFace) | 0 / 0 en este repositorio |
| Fecha declarada en el repositorio | Creación y actualización: 2026-10-29 (posterior a la publicación original en CivitAI, enero de 2025) |

## Arquitectura y entrenamiento

La información proporcionada no documenta la arquitectura ni el proceso de entrenamiento. El identificador del modelo incluye "flux 1d" y la model card lo describe explícitamente como "the first PornWorks Flux model" y "checkpoint for flux1d", lo que sitúa su base en la familia FLUX.1 de Black Forest Labs: un transformer de difusión con formulación de flujo rectificado (rectified flow), atención conjunta texto-imagen y un doble codificador de texto (CLIP + T5). El tamaño del archivo de pesos (11,1 GB) sugiere una conversión a fp8 de un modelo de ~12 000 millones de parámetros, pero se trata de una inferencia a partir del tamaño, no de un dato confirmado por el autor.

Tampoco se especifican el número de imágenes de entrenamiento, la composición del dataset, el método de ajuste (full fine-tune, LoRA fusionado, DreamBooth) ni si hubo etapas de refinamiento con preferencias humanas. La única información operativa que ofrece el autor son los ajustes de inferencia recomendados, lo que es habitual en checkpoints publicados en CivitAI pero insuficiente para reproducir o auditar el entrenamiento. El autor anuncia además que trabaja en una versión posterior capaz de generar escenas sexuales explícitas, lo que confirma que este checkpoint es un paso intermedio de una línea de desarrollo en curso.

## Capacidades

- Generación de imágenes fotorrealistas de personas desnudas, con especial énfasis en anatomía y piel realistas, según la model card.
- Estilización y composición mediante prompt: los ejemplos de la model card incluyen primeros planos, entornos de exterior (piscina, bosque), iluminación de amanecer y personajes de fantasía (elfa, anthropomorphic fox).
- Generación de texto renderizado sobre el cuerpo o en la pared (los prompts de ejemplo piden "Text painted on women body", logotipos y texto neón), lo que indica cierta capacidad de renderizado tipográfico heredada de Flux.
- Soporte de prompt negativo implícito mediante descriptores de calidad en el prompt positivo ("masterpiece, best quality, highly detailed, absurdres"), práctica habitual en checkpoints derivados de SDXL/Flux.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para inglés.
- Tool calling / function calling: no aplica (modelo de imagen).
- Modo agente o razonamiento multi-paso: no aplica.
- Capacidades de vídeo o audio: no disponibles.

## Casos de uso

- Ilustración de ficción erótica para editoriales y plataformas para adultos: el modelo genera desnudos fotorrealistas consistentes con el estilo Flux, adecuado para portadas, ilustraciones de relatos y contenido editorial con verificación de edad previa.
- Estudio de figura y referencia anatómica: artistas y animadores pueden generar poses de desnudo con iluminación controlada por prompt para usarlas como referencia de dibujo, aprovechando el realismo de piel y anatomía que el autor destaca.
- Prototipado de personajes para narrativa adulta: definir un personaje (complexión, pelo, vestuario, entorno) y generar variaciones rápidas con 20 pasos por imagen, útil en fases de preproducción antes de encargar arte final.
- Pruebas de sistemas de moderación de contenido: generar lotes de imágenes NSFW fotorrealistas para evaluar la sensibilidad y la tasa de falsos positivos/negativos de clasificadores de contenido y de filtros de plataforma (red teaming interno).
- Investigación sobre sesgos y representación corporal: analizar qué cánones de belleza, etnias, complexiones y géneros produce el modelo ante prompts equivalentes, un estudio habitual en auditorías de modelos generativos.
- Base para fine-tuning o LoRA posteriores: al ser un checkpoint Flux ya adaptado a desnudo fotorrealista, sirve como punto de partida para ajustes específicos de personaje o estilo, reduciendo el número de pasos necesarios frente a partir del modelo base.
- Generación de material de marketing para plataformas de contenido para adultos: banners y creatividades con estética consistente, siempre que se cumplan los requisitos legales de edad y las políticas de la plataforma de destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta FID, CLIP score, HPSv2, PickScore ni comparaciones cuantitativas con otros checkpoints, y tampoco se dispone de datos de velocidad o throughput medidos para este archivo concreto.

## Requisitos de hardware

- VRAM estimada: con pesos de 11,1 GB en fp8, se necesita un mínimo de ~12–14 GB de VRAM para inferencia a 1024×1024 sin offload. Si los pesos se cargan en bf16 (~23,8 GB para un modelo de 12 000 M) harían falta 24 GB o más, o bien offload a RAM.
- GPU recomendadas: RTX 3090, RTX 4090, RTX A6000, L40S o A100 para ejecución cómoda en fp8/bf16. Una RTX 4080 (16 GB) o una RTX 4060 Ti de 16 GB deberían poder ejecutarlo en fp8, con posibles limitaciones de resolución y batch.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más en fp8; en tarjetas de 8–12 GB solo mediante cuantizaciones GGUF Q4/Q5 (aproximadamente 6–9 GB) o con offload secuencial, a costa de velocidad.
- Opciones de despliegue: ComfyUI (soporte nativo de Flux), Diffusers (`FluxPipeline`), ComfyUI-GGUF para variantes cuantizadas, y entornos como Forge o SD.Next con soporte de Flux variable. El ecosistema de Automatic1111 clásico no soporta Flux de forma nativa.
- Latencia y throughput: no disponible. El autor solo recomienda 20 pasos, sampler "Flux Realistic" y scheduler "Simple"; el tiempo por imagen dependerá de la GPU y de la precisión utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PornWorks Flux 1D (este checkpoint) | No disponible (~12 000 M si deriva de FLUX.1) | Fine-tune texto-a-imagen sobre Flux | openrail++ | HuggingFace (0 descargas) y CivitAI | Especializado en desnudo fotorrealista; no genera actos sexuales según el autor |
| FLUX.1 [dev] (Black Forest Labs) | ~12 000 M | Modelo base texto-a-imagen | FLUX.1 [dev] Non-Commercial License | Pesos abiertos en HuggingFace | Referencia de calidad fotorrealista; tiende a censurar genitales y pezones en desnudos, motivación declarada de este fine-tune |
| FLUX.1 [schnell] (Black Forest Labs) | ~12 000 M | Modelo base texto-a-imagen destilado | Apache 2.0 | Pesos abiertos en HuggingFace | Licencia permisiva y menos pasos de inferencia, pero menor fidelidad de prompt y misma tendencia a evitar desnudo explícito |
| Checkpoints NSFW derivados de SDXL (familia genérica) | ~3 500 M | Fine-tune texto-a-imagen sobre SDXL | Varía (CreativeML OpenRAIL++-M o similar) | CivitAI / HuggingFace | Menor coste de VRAM y ecosistema LoRA más maduro, pero peor coherencia anatómica y de texto renderizado que Flux |

Los datos de los modelos base (parámetros y licencias) proceden de información pública de Black Forest Labs; no se ha verificado que este checkpoint concreto use esa base.

## Limitaciones y advertencias

- Contenido explícito: el modelo genera desnudos NSFW. Su uso exige verificación de edad de los sujetos representados, cumplimiento de la legislación aplicable (DSA, normativa de contenido para adultos, regulaciones locales) y políticas de la plataforma de destino. Cualquier uso para generar imágenes de personas reales sin consentimiento (deepfakes) o de menores es ilegal y está prohibido por la licencia.
- Sesgos conocidos: no hay documentación sobre la composición del dataset. Por el tipo de checkpoint y los ejemplos de la model card, es esperable un sesgo hacia cánones de belleza concretos (cuerpos delgados, piel clara, personajes femeninos) y una representación limitada de diversidad corporal, étnica y de edad. No verificado empíricamente.
- Alucinación anatómica: como todo modelo de difusión, puede producir errores en manos, dedos, extremidades y simetría facial, además de artefactos en la anatomía genital. No se han publicado evaluaciones al respecto.
- Censura residual del modelo base: el autor advierte de que el modelo está pensado para erótica y no permite generar escenas de sexo explícito, lo que refleja la persistencia de los sesgos del modelo base Flux.
- Limitación de idioma: solo inglés. Los prompts en castellano producirán resultados degradados.
- Licencia openrail++: incluye cláusulas de uso aceptable que restringen aplicaciones dañinas y exigen el cumplimiento de la política de uso; conviene revisar el texto completo antes de un uso comercial. La licencia no garantiza derechos sobre las imágenes generadas en todas las jurisdicciones.
- Validación comunitaria inexistente en este repositorio: 0 descargas y 0 likes en HuggingFace, frente a los 188 likes del espejo AI-Porn. Es probable que este repositorio sea un reupload del original, sin garantía de mantenimiento ni de integridad de los archivos.
- Metadatos inconsistentes: la etiqueta del repositorio incluye `sdxl` pese a que el modelo se presenta como Flux, y la fecha declarada (2026-10-29) es muy posterior a la publicación original en CivitAI (enero de 2025). Conviene verificar el hash y el origen del archivo antes de usarlo en producción.
- Ausencia de documentación técnica: no hay información sobre dataset, método de entrenamiento, evaluación ni limitaciones declaradas por el autor, lo que impide auditar sesgos o calidad de forma rigurosa.

## Enlaces

- HuggingFace (repositorio de steve099): https://huggingface.co/steve099/pornworks-nude-people-photo-realistic-nsfw-flux-1d-checkpoint
- HuggingFace (espejo AI-Porn, 188 likes): https://huggingface.co/AI-Porn/pornworks-nude-people-photo-realistic-nsfw-flux-1d-checkpoint
- CivitAI (modelo original): https://civitai.com/models/836198/pornworks-nude-people-photo-realistic-nsfw-flux-1d-chekpoint
- CivArchive (ficha del modelo): https://civarchive.com/models/836198?modelVersionId=935551
- CivArchive (versión 0.2, archivo `pornworksNudePeoplePhoto_02.safetensors`): https://civarchive.com/tungsten/models/985RuBn5Xt/versions/9CzqKWkFeT
- Artículo de referencia sobre NSFW en Flux: https://betterwaifu.com/blog/flux-nsfw
- Sitio del autor: https://PornWorks.com
