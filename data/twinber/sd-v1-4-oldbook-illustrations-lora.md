# Twinber/sd-v1-4-oldbook-illustrations-lora

## Resumen

`Twinber/sd-v1-4-oldbook-illustrations-lora` es un adaptador LoRA entrenado sobre Stable Diffusion v1.4 de CompVis para generar imágenes al estilo de las ilustraciones de libros antiguos del siglo XIX: grabados en plancha, aguafuertes y estampados de época. Su autor es Daniel Aguilera González (usuario Twinber de Hugging Face), quien lo entrenó con el dataset `gigant/oldbookillustrations`, una colección de ilustraciones históricas digitalizadas.

El modelo resuelve un problema concreto de generación de imágenes: la dificultad de conseguir el estilo estético de los grabados decimonónicos con un modelo base genérico. En lugar de reentrenar el modelo completo, aplica una adaptación LoRA de bajo rango (r=8) sobre las proyecciones de cross-attention de la UNet, lo que permite cargar los pesos con solo 6,1 MB y combinarlos con el modelo base en tiempo de ejecución. Es relevante para desarrolladores que necesiten estética vintage en aplicaciones creativas, ilustración editorial o generación de assets con estilo histórico, ya que el pipeline completo funciona con la librería `diffusers` de Hugging Face y puede desplegarse en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion v1.4 (latent diffusion, cross-attention) |
| Parametros totales | 1.594.368 parametros entrenables del LoRA (0,185% de la UNet base) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (limitada por el tokenizador CLIP del modelo base, tipicamente 77 tokens) |
| Tipos de cuantizacion | No disponible para el LoRA; el modelo base se usa tipicamente en float16 |
| Idiomas soportados | no disponible |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | Pesos LoRA en formato safetensors (6,1 MB); repo completo de 3,5 GB incluyendo bonus |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre la UNet de Stable Diffusion v1.4, un modelo de difusion latente text-to-image. La adaptacion se restringe a las proyecciones de cross-attention (`to_k`, `to_q`, `to_v` y `to_out.0`), que son las capas donde el texto condiciona la generacion visual; esto explica por que un rango bajo (r=8, alpha=8) basta para transferir un estilo artistico. El numero de parametros entrenables es de 1.594.368, apenas el 0,185% del total de la UNet.

El entrenamiento se realizo sobre el dataset `gigant/oldbookillustrations`, compuesto por ilustraciones de libros antiguos del siglo XIX (grabados, aguafuertes y estampados). La instance prompt recomendada es `antique illustration`. No se ha publicado informacion sobre el numero de pasos de entrenamiento, learning rate, batch size ni hardware empleado. El modelo base (SD v1.4) es un latent diffusion model entrenado con pares imagen-texto en ingles, por lo que los prompts funcionan mejor en ese idioma.

## Capacidades

- Generacion de imagenes text-to-image en estilo de ilustracion de libro antiguo del siglo XIX (grabado, aguafuerte, estampa de epoca).
- Carga ligera como adaptador: los pesos LoRA ocupan solo 6,1 MB y se aplican sobre el pipeline base con `pipe.load_lora_weights()`.
- Ajuste en tiempo real de la intensidad del estilo mediante el peso del LoRA (escala de 0,0 a 1,5 segun la app Streamlit incluida), permitiendo mezclar el estilo con la salida del modelo base.
- Compatibilidad con el ecosistema `diffusers` de Hugging Face y con prompts en castellano e ingles (el modelo base soporta ambos, con mejor resultados en ingles).
- Cuaderno Colab incluido (`probador_interactivo_lora_colab.ipynb`) para inferencia interactiva en GPU (T4/L4/A100) con tiempos de generacion de ~2 segundos por imagen a 20 pasos.
- Aplicacion Streamlit incluida (`bonus/app.py`) para experimentar localmente con peso del LoRA, pasos y semilla.
- No soporta tool calling, agentes, ni modos de razonamiento: es un modelo de difusion para imagenes, no un LLM.

## Casos de uso

- Ilustracion editorial de epoca: generar grabados estilo siglo XIX para cubiertas de libros, novelas de epoca o articulos de divulgacion historica, usando prompts como `an antique illustration of a botanic garden`.
- Generacion de assets para videojuegos con estetica vintage: crear texturas, cartas coleccionables o ilustraciones de interfaz con aspecto de grabado antiguo sin contratar ilustracion manual.
- Prototipado creativo interactivo: la app Streamlit incluida permite ajustar el peso del LoRA en tiempo real (0,0 a 1,5) para calibrar cuanta estetica de epoca se aplica sobre cada composicion.
- Ensenanza y demostracion de LoRA: el repo incluye notebook de Colab y comparativas antes/despues con seeds fijas, util como material didactico para explicar fine-tuning eficiente de modelos de difusion.
- Produccion de contenido para redes sociales y blogs de historia o arte: generar imagenes coherentes de escenas cotidianas del siglo XIX (pescadores, paisajes, jardines) con seeds reproducibles.
- Integracion en pipelines de generacion por lotes con `diffusers`: al ser un adaptador de 6,1 MB, puede conmutarse junto a otros LoRA en un mismo pipeline sin duplicar el modelo base en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA estetico para difusion, no aplica evaluacion tipo MMLU o HumanEval; la calidad se documenta mediante imagenes de ejemplo en la model card (con seeds y numero de pasos indicados: 20 pasos de inferencia en los ejemplos).

## Requisitos de hardware

- VRAM estimada para inferencia: ~4 GB con el modelo base SD v1.4 en float16 mas el LoRA (6,1 MB); el propio repo indica funcionamiento en GPUs T4/L4/A100 en Colab.
- GPUs recomendadas: cualquier GPU con 6-8 GB de VRAM o mas; probado en T4, L4 y A100 segun el notebook incluido.
- Cabe en GPUs de consumo: si, modelos como RTX 3060 (12 GB), RTX 4060 o superiores ejecutan el pipeline sin problemas; incluso GPUs de 6 GB pueden funcionar con atencion optimizada.
- Opciones de despliegue: libreria `diffusers` de Hugging Face (via recomendada por el autor), Google Colab (notebook incluido) y aplicacion local Streamlit (`bonus/app.py`). No se menciona soporte para ComfyUI, AUTOMATIC1111 ni llama.cpp.
- Latencia: ~2 segundos por imagen a 20 pasos en GPU T4/L4/A100 segun la model card; throughput en batch no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano del adaptador | Licencia | Notas |
|---|---|---|---|---|---|
| Twinber/sd-v1-4-oldbook-illustrations-lora | LoRA estetico | SD v1.4 | 6,1 MB (1,59 M parametros) | CreativeML Open RAIL-M | Estilo grabado siglo XIX, r=8 |
| Lykon/dreamshaper (checkpoint completo) | Checkpoint SD | SD v1.x | ~4 GB (modelo completo) | CreativeML Open RAIL-M | Estilo ilustracion generalista, no especializado en grabados antiguos |
| CivitAI "Old Book Illustrations" (variantes) | Checkpoints/LoRA | SD 1.5 | Variable | Variable | Alternativas comunitarias de estilo similar, sin model card detallada |

Frente a checkpoints completos de estilo similar, este LoRA es mucho mas ligero (6,1 MB frente a ~2-4 GB), lo que permite conmutar estilos en caliente sobre un unico modelo base en memoria, a costa de depender de SD v1.4 y de sus limitaciones de resolucion y calidad de manos/anatomia.

## Limitaciones y advertencias

- Depende del modelo base SD v1.4, que presenta las limitaciones conocidas de la familia SD 1.x: resolucion nativa de 512x512, errores frecuentes en manos y anatomia, y texto ilegible dentro de las imagenes.
- El modelo base fue entrenado con pares imagen-texto mayoritariamente en ingles, por lo que los prompts en castellano pueden producir resultados menos fieles; se recomienda prompt en ingles o la instance prompt `antique illustration`.
- Riesgo de heredar sesgos del dataset de ilustraciones historicas del siglo XIX: representaciones de epoca pueden reflejar estereotipos culturales, raciales y de genero presentes en el material original.
- Licencia CreativeML Open RAIL-M: permite uso comercial, pero incluye restricciones de uso (no generar contenido difamatorio, violento o ilegal) heredadas del modelo base.
- No se ha publicado informacion sobre hiperparametros de entrenamiento ni metricas de calidad, por lo que la evaluacion se limita a los ejemplos visuales de la model card.
- El peso del LoRA por encima de 1,0 (hasta 1,5 en la app incluida) puede degradar la coherencia de la imagen; conviene calibrar por caso de uso.
- Popularidad muy baja (65 descargas y 1 like en el momento de la ficha), sin comunidad de soporte consolidada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Twinber/sd-v1-4-oldbook-illustrations-lora
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Autor: https://huggingface.co/Twinber
- Libreria diffusers: https://github.com/huggingface/diffusers
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion / Latent Diffusion: https://arxiv.org/abs/2112.10752
