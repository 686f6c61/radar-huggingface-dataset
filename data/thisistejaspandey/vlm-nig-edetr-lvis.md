# thisistejaspandey/vlm-nig-edetr-lvis

## Resumen

VLM-EDETR + NIG (OV-LVIS, CLIP RN50) es un detector de objetos de vocabulario abierto (open-vocabulary) que incorpora estimacion de incertidumbre en dos dimensiones: clasificacion y localizacion. Lo desarrolla el usuario thisistejaspandey y se distribuye bajo licencia Apache 2.0. El modelo combina un backbone CLIP RN50 congelado, un encoder RT-DETR y un decoder de vocabulario abierto de tipo evidencial. Resuelve el problema de la deteccion zero-shot con prompts de texto arbitrarios anadiendo, ademas de la caja y la puntuacion, una medida de incertidumbre por deteccion.

La innovacion principal es el uso de aprendizaje profundo evidencial: la cabeza de clasificacion es una Beta evidencial por cada par (query, clase), de la que se deriva una incertidumbre `u = 2 / S`, y la cabeza de localizacion es una Normal-Inverse-Gamma (NIG) que proporciona una desviacion tipica para cada coordenada de caja (cx, cy, w, h en unidades normalizadas por la imagen). Esto permite filtrar detecciones por fiabilidad, no solo por score.

El modelo fue entrenado sobre LVIS v1 bajo el protocolo OV-LVIS y el checkpoint publicado corresponde a los pesos de inferencia (EMA). Es relevante para pipelines donde la calibracion y el rechazo de detecciones dudosas importan tanto como la precision bruta, aunque su adopcion es todavia muy incipiente (0 descargas en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector open-vocabulary: backbone CLIP RN50 congelado + encoder RT-DETR + decoder evidencial con cabeza Beta (clasificacion) y cabeza NIG (localizacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y .pth en precision original) |
| Idiomas soportados | no disponible (prompts de texto via CLIP RN50, dependiente del vocabulario del backbone) |
| Licencia | Apache 2.0 (los pesos de CLIP se descargan por separado bajo su propia licencia de OpenAI) |
| Formato de pesos | safetensors (`vlm_nig_edetr_lvis.safetensors`) y PyTorch `.pth` (`{"model": state_dict}`) |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de tipo transformer con paradigma DETR. El backbone visual es CLIP RN50, que se mantiene congelado durante el entrenamiento. Sobre el se situa un encoder de RT-DETR y un decoder de vocabulario abierto de tipo evidencial. La clasificacion se modela con una cabeza Beta evidencial por cada par (query, clase), que produce simultaneamente el score y la incertidumbre `u = 2 / S`. La localizacion se modela con una cabeza Normal-Inverse-Gamma (NIG) que emite una desviacion tipica por cada coordenada de caja. Las capas del decoder comparten una unica cabeza NIG, almacenada como `nig_embed.0`.

El entrenamiento se realizo en dos fases. Primero, VLM-EDETR se entreno sobre LVIS v1 bajo el protocolo OV-LVIS. Despues, la cabeza NIG se entreno durante 12 epocas sobre el split de entrenamiento de LVIS v1 con el resto de pesos congelados (configuracion `configs/vlm_nig_edetr_lvis.yaml` del repositorio de codigo). El checkpoint publicado corresponde a los pesos de inferencia con EMA. El checkpoint incluye los embeddings de texto de las 1203 clases de LVIS (`text_embeddings`); para detectar otras categorias hay que sustituir `model.text_embeddings` por los embeddings CLIP de los prompts propios. No se especifica el numero de tokens ni la composicion detallada del dataset mas alla de LVIS v1.

## Capacidades

- Deteccion de objetos zero-shot con prompts de texto arbitrarios mediante embeddings CLIP RN50.
- Deteccion open-vocabulary sobre las 1203 clases de LVIS sin reentrenamiento.
- Puntuacion con incertidumbre de clasificacion derivada de la cabeza Beta evidencial (`u = 2 / S`).
- Incertidumbre de localizacion por coordenada de caja mediante la cabeza NIG (`box_std`, calculada como `Var[μ]^½ = (β / (ν(α − 1)))^½`).
- Post-procesado con `score_type="uncertainty_weighted"` para ponderar detecciones por su incertidumbre.
- Salida de cajas en formato normalizado (cx, cy, w, h) junto con scores y desviaciones tipicas.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- Deteccion de objetos con vocabulario abierto en imagenes nuevas: se definen prompts de texto (por ejemplo, "elephant", "car") y el modelo devuelve cajas y scores sin necesidad de reentrenar, gracias a los embeddings CLIP.
- Filtrado por fiabilidad en pipelines de vision: el uso de `box_std` y de la incertidumbre Beta permite descartar detecciones con localizacion o clasificacion poco fiable antes de pasarlas a etapas posteriores.
- Anotacion asistida de datasets: las detecciones con score alto y baja incertidumbre pueden proponerse como preanotaciones para revision humana, reduciendo el coste de etiquetado.
- Inspeccion visual con intervalos de confianza: la demo de Gradio y el notebook permiten visualizar cada deteccion con su score, su incertidumbre Beta y el intervalo de caja NIG, util para analisis cualitativo.
- Investigacion en aprendizaje evidencial: el checkpoint sirve como referencia para estudiar la calibracion de detectores open-vocabulary y comparar cabezas Beta y NIG frente a cabezas deterministas.
- Prototipado rapido en entornos con recursos limitados: al ser un detector basado en CLIP RN50 (backbone relativamente ligero) y publicarse en un repositorio de 0.5 GB, es viable ejecutarlo en una unica GPU consumer para pruebas.
- Sistemas de vision con rechazo de detecciones: en aplicaciones donde un falso positivo es costoso, la incertidumbre explicita permite umbralizar por confianza calibrada en lugar de solo por score.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0.5 GB y el backbone es CLIP RN50, por lo que la inferencia en precision original deberia caber holgadamente en GPUs consumer, aunque no se confirma una cifra concreta.
- GPU recomendadas: no disponible. Por el tamano del modelo, una RTX 4090 o superior es mas que suficiente; tambien deberia funcionar en GPUs de gama media, pero no hay datos publicados.
- Cabe en GPU consumer: probablemente si, dado el tamano del checkpoint (0.5 GB) y el backbone RN50, aunque no se aporta una medicion oficial.
- Opciones de despliegue: inferencia directa con PyTorch y safetensors segun el ejemplo de la model card; el repositorio de codigo incluye herramientas `edetr` (`load_vlm_checkpoint`, `pixi run infer`) y una demo Gradio. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Incertidumbre | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLM-EDETR + NIG (OV-LVIS) | no disponible | no aplica | Si (Beta + NIG) | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas open-vocabulary tipo OWL-ViT / Grounding DINO | no disponible en esta ficha | no aplica | No de forma nativa | variable | ampliamente disponibles |
| Detectores DETR/RT-DETR cerrados | no disponible en esta ficha | no aplica | No | variable | ampliamente disponibles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a caracteristicas cualitativas.

## Limitaciones y advertencias

- Modelo con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- No se han publicado benchmarks, por lo que no es posible verificar su precision frente a alternativas establecidas.
- La incertidumbre de localizacion publicada (`box_std`) corresponde a `Var[μ]^½ = (β / (ν(α − 1)))^½`, no a la desviacion tipica predictiva completa de la Student-t; interpretarla en consecuencia.
- El vocabulario por defecto esta limitado a las 1203 clases de LVIS; para otras categorias es necesario generar embeddings CLIP propios, con la perdida de calibracion que ello puede implicar.
- El backbone CLIP RN50 se descarga por separado desde OpenAI y queda sujeto a su propia licencia, distinta de la Apache 2.0 del checkpoint.
- No se documentan sesgos conocidos, comportamiento multilingue de los prompts ni riesgos de alucinacion especificos; al ser un detector y no un modelo generativo, el riesgo de alucinacion se traduce en falsos positivos, mitigables parcialmente con la incertidumbre.
- La fecha de creacion del repositorio (2026-11-16) y la ausencia de documentacion adicional limitan la trazabilidad del entrenamiento.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias de rendimiento ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thisistejaspandey/vlm-nig-edetr-lvis
- Repositorio de codigo: https://github.com/thisistejaspandey/e-detr
- Demo en Colab: https://huggingface.co/thisistejaspandey/vlm-nig-edetr-lvis/colab
- Dataset LVIS: https://www.lvisdataset.org/
- CLIP (OpenAI): https://github.com/openai/CLIP
