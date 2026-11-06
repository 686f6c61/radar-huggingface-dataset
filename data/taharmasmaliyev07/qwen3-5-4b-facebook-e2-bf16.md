# taharmasmaliyev07/Qwen3.5-4B-FACEBOOK-E2-BF16

## Resumen

Qwen3.5-4B-FACEBOOK-E2-BF16 es un ajuste fino (fine-tune) del modelo Qwen3.5 de 4B de parametros, publicado por el usuario taharmasmaliyev07 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto. El autor lo ha entrenado partiendo de su propia version previa del mismo identificador, lo que indica un proceso de ajuste iterativo sobre una base Qwen3.5.

El modelo se distribuye en formato safetensors con pesos en BF16 (segun el sufijo del nombre) y esta pensado para su uso con la libreria transformers y con text-generation-inference. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el propio autor en la model card.

La relevancia de esta ficha es limitada: el repositorio tiene cero descargas y cero likes, el tamano del repo es de solo 0,1 GB (lo que resulta llamativamente pequeno para un modelo de 4B en BF16, que deberia rondar los 8 GB), y la model card no aporta informacion sobre datos de entrenamiento, benchmarks ni capacidades concretas. Se trata, por tanto, de un modelo de nicho o experimental sin validacion publica conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles no disponibles |
| Parametros totales | 4B (segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. Por el tag `qwen3_5` y la pipeline `image-text-to-text` se infiere que deriva de la familia Qwen3.5 de Alibaba, con capacidad multimodal (entrada de imagen y texto). El tamano declarado es de 4B parametros. No se especifica si emplea attention lineal, decodificacion especulativa, mezcla de expertos ni ninguna otra innovacion concreta.

El autor indica que el modelo fue entrenado con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un ajuste fino supervisado (SFT) o posiblemente DPO sobre la base Qwen3.5-4B. No se publican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF. El nombre "FACEBOOK-E2" sugiere un dataset o tarea relacionada con Facebook, pero no se aporta ninguna confirmacion.

## Capacidades

- Generacion de texto conversacional (tag `conversational`).
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Generacion de texto condicionada por imagen, segun la pipeline declarada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (`en`).
- Modo thinking, vision detallada, audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede integrarse en un pipeline de transformers para generar respuestas multi-turno, aunque sin datos de contexto publicados no es posible dimensionar la ventana.
- Experimentacion academica con fine-tuning multimodal: al estar basado en Qwen3.5 y entrenado con Unsloth, sirve como punto de partida para reproducir ajustes sobre image-text-to-text.
- Descripcion de imagenes en ingles: la pipeline image-text-to-text permite generar texto a partir de imagenes, util para etiquetado o accesibilidad en entornos controlados.
- Evaluacion comparativa de fine-tunes de Qwen3.5: util para investigadores que quieran contrastar variantes de la comunidad sobre la misma base.
- Despliegue ligero en entornos con recursos limitados: con 4B parametros en BF16 cabria en GPUs de gama alta de consumo, aunque el tamano real del repo (0,1 GB) hace dudar de que los pesos completos esten subidos.
- Base para tareas especificas en ingles (clasificacion, resumen, Q&A) mediante ajuste adicional, dado que la licencia Apache 2.0 permite uso comercial y modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Para un modelo de 4B en BF16 se estimarian en torno a 8-9 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 4-5 GB y en 4 bits 2,5-3 GB. Estas cifras son estimaciones genericas para 4B, no datos publicados del modelo.
- GPU recomendadas: no disponible. Por tamano, cabria en RTX 3090/4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantizacion.
- Cabe en GPU de consumo: probablemente si, en modelos con 12 GB o mas en BF16 y en 8 GB con cuantizacion, aunque no hay confirmacion del autor.
- Opciones de despliegue: transformers, text-generation-inference (segun tags). No se declara soporte explicito de vLLM, llama.cpp, Ollama ni TGI mas alla del tag.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-FACEBOOK-E2-BF16 (este) | 4B | no disponible | Si (image-text-to-text) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (base, Alibaba) | 4B | no disponible en esta ficha | Si (segun familia) | no disponible | Hugging Face |
| taharmasmaliyev07/Mirza-Qwen3-4B-Editor-E3-BF16-V2 | 4B | no disponible | no disponible | Apache 2.0 | Hugging Face, ~397 descargas |
| taharmasmaliyev07/Qwen-3-4B-b16-tuned-full | 4B | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Modelo sin validacion publica: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes.
- El tamano del repositorio (0,1 GB) es incompatible con un modelo de 4B en BF16 completo (que rondaria 8 GB), lo que sugiere que los pesos pueden estar incompletos, ser un adaptador o un subconjunto de archivos. Conviene verificar los ficheros antes de usarlo.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- No se documentan datos de entrenamiento, por lo que se desconocen sesgos y posibles contaminaciones del dataset.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de evaluacion.
- La model card es una plantilla autogenerada por Unsloth, sin informacion tecnica sustantiva.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de garantias y de evaluacion hace desaconsejable su uso en produccion sin una validacion propia.
- El nombre "FACEBOOK-E2" sugiere un dataset o tarea especifica no documentada; podria implicar sesgos hacia ese dominio.

## Enlaces

- Hugging Face: https://huggingface.co/taharmasmaliyev07/Qwen3.5-4B-FACEBOOK-E2-BF16
- Perfil del autor: https://huggingface.co/taharmasmaliyev07
- Otro fine-tune del autor (Mirza-Qwen3-4B-Editor-E3-BF16-V2): https://huggingface.co/taharmasmaliyev07/Mirza-Qwen3-4B-Editor-E3-BF16-V2
- Otro fine-tune del autor (Qwen-3-4B-b16-tuned-full): https://huggingface.co/taharmasmaliyev07/Qwen-3-4B-b16-tuned-full
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
