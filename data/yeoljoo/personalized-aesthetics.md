# YeolJoo/Personalized-Aesthetics

## Resumen

Personalized-Aesthetics es una coleccion de checkpoints preentrenados para la evaluacion estetica personalizada de imagenes (Personalized Image Aesthetic Assessment, PIAA). Lo desarrolla YeolJoo y se publica como material complementario del articulo "Scaling Up Personalized Image Aesthetic Assessment via Task Vector Customization", aceptado en ECCV 2024. No es un modelo generativo ni un LLM: es un cabezal de puntuacion estetica construido sobre backbones CLIP de open_clip que predice preferencias esteticas subjetivas y personalizables por usuario.

El modelo resuelve un problema concreto: la estetica fotografica es subjetiva y los modelos tradicionales de evaluacion estetica (Aesthetic Assessment) producen una unica puntuacion media que no refleja las preferencias individuales. La propuesta utiliza la customizacion de task vectors para adaptar el modelo a cada usuario con pocos ejemplos, escalando el enfoque a un mayor numero de usuarios sin reentrenar desde cero.

El repositorio (7,5 GB) contiene seis variantes de checkpoint por cada backbone: `aes`, `ava`, `koniq`, `para`, `spaq` y `tad`, correspondientes a distintos datasets de estetica y preferencia. Se ofrecen dos backbones: CLIP ViT-B-16 (preentrenado con `laion2b_s34b_b88k`) y CLIP ViT-L-14 (preentrenado con `datacomp_xl_s13b_b90k`). La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (ViT-B-16 o ViT-L-14) con cabezal `MultiModalIAA` |
| Parametros totales | no disponible (depende del backbone: ViT-B-16 o ViT-L-14) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en fp32) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (state dict completo en fp32) |

## Arquitectura y entrenamiento

La arquitectura se basa en un backbone CLIP de open_clip (ViT-B-16 o ViT-L-14) sobre el que se anade un cabezal multimodal denominado `MultiModalIAA`, cuyo state dict completo se almacena en cada fichero safetensors. Cada checkpoint corresponde a un dataset de entrenamiento distinto: `aes` (Aesthetic Visual Analysis), `ava`, `koniq`, `para`, `spaq` y `tad`. La configuracion del modelo se guarda en los metadatos del safetensors.

El entrenamiento sigue la metodologia del paper "Scaling Up Personalized Image Aesthetic Assessment via Task Vector Customization" (ECCV 2024). La innovacion principal es el uso de task vectors para personalizar el modelo por usuario, combinando los pesos preentrenados con vectores de tarea especificos. No se dispone en la informacion proporcionada del numero de tokens, composicion exacta del dataset, ni si se empleo RLHF o DPO (no aplicable en un modelo de vision).

## Capacidades

- Evaluacion estetica de imagenes: predice puntuaciones de estetica sobre imagenes de entrada.
- Personalizacion por usuario: mediante task vectors, adapta la prediccion a preferencias individuales con pocos ejemplos.
- Multiples dominios esteticos: seis checkpoints entrenados sobre distintos datasets (`aes`, `ava`, `koniq`, `para`, `spaq`, `tad`) para cubrir diferentes criterios y distribuciones.
- Dos backbones: ViT-B-16 (mas ligero) y ViT-L-14 (mayor capacidad).
- Integracion con open_clip: carga mediante la libreria `open_clip` y el codigo del repositorio GitHub.
- No soporta tool calling, agentes, generacion de texto ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Curacion fotografica automatizada: usar los checkpoints `ava` o `aes` para puntuar y ordenar lotes de imagenes por calidad estetica percibida, filtrando las mejores antes de una revision humana.
- Recomendacion personalizada de contenido visual: aplicar task vectors por usuario para que el sistema puntue imagenes segun el gusto individual, mejorando la relevancia de un feed o galeria.
- Edicion y retoque de imagen asistido: integrar la puntuacion estetica como senal de recompensa o criterio de seleccion en pipelines de mejora automatica de fotos.
- Control de calidad en generacion de imagenes: usar el modelo como evaluador para descartar o reordenar salidas de modelos generativos segun su atractivo estetico.
- Investigacion en estetica computacional: comparar el rendimiento de los seis checkpoints sobre distintos datasets para estudiar sesgos y correlaciones entre criterios esteticos.
- Personalizacion en aplicaciones de fotografia movil: adaptar el modelo a las preferencias del usuario con pocos ejemplos mediante task vectors, ofreciendo sugerencias de seleccion o recorte alineadas con su estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 7,5 GB en total (suma de todos los checkpoints en fp32); un unico checkpoint ViT-L-14 en fp32 puede requerir del orden de varios GB de VRAM, mientras que ViT-B-16 es mas ligero.
- GPU recomendadas: no disponible. Por el tamano de los backbones CLIP, cabria esperar que ViT-B-16 funcione en GPUs de consumo (p. ej. RTX 3060/4060) y ViT-L-14 en GPUs con mas VRAM (RTX 3090/4090, A100, H100), aunque no se confirma en la informacion.
- Cabe en GPU de consumo: probablemente si para ViT-B-16; no confirmado para ViT-L-14.
- Opciones de despliegue: carga mediante `open_clip` y el codigo del repositorio GitHub (`models.checkpoint.load_state_dict`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Personalized-Aesthetics (este) | Evaluacion estetica personalizada | CLIP ViT-B-16 / ViT-L-14 | no aplica | MIT | Hugging Face + GitHub |
| NIMA (Neural Image Assessment) | Evaluacion estetica | CNN (Inception/ MobileNet) | no aplica | no disponible | Implementaciones publicas |
| LAION-Aesthetics predictor | Puntuacion estetica | CLIP / MLP | no aplica | no disponible | Hugging Face |
| Q-Align / evaluadores multimodales | Evaluacion de calidad visual | LLM multimodal | variable | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de vision: no procesa texto ni mantiene conversaciones; no debe confundirse con un LLM.
- Subjetividad: las puntuaciones esteticas dependen del dataset de entrenamiento y de las preferencias del usuario; pueden no generalizar a dominios no representados.
- Sesgos: los datasets de estetica (`ava`, `aes`, etc.) pueden incorporar sesgos culturales y demograficos en la definicion de "belleza".
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero las puntuaciones pueden ser poco fiables fuera de la distribucion de entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los backbones CLIP subyacentes y de los datasets de entrenamiento.
- Idiomas: no disponible; el modelo no tiene capacidades linguisticas.
- Produccion: requiere el codigo del repositorio GitHub para cargar los checkpoints; no se documentan latencias ni robustez en entornos de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/YeolJoo/Personalized-Aesthetics
- Repositorio GitHub: https://github.com/YeolJ00/Personalized-Aesthetics
- Paper (arXiv): https://arxiv.org/abs/2407.07176
