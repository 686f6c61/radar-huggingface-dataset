# timmzak/ReText-LLaVA

## Resumen

ReText-LLaVA es el conjunto de pesos ajustados (fine-tuned) de un VLM derivado de LLaVA-1.6-Vicuna-7B, publicado por Timur Mamedov (usuario `timmzak`) como parte del trabajo de investigacion ReText, aceptado en WACV 2027. El modelo esta entrenado especificamente para generar descripciones textuales de imagenes de personas (person image captioning) sobre el dataset UFine3C, y su proposito es servir como generador de anotaciones textuales que alimentan una pipeline de re-identificacion de personas basada en imagen (person Re-ID). No es un modelo de proposito general: es un componente dentro de un sistema mayor.

La relevancia del modelo radica en su tesis central: el texto mejora la generalizacion en Re-ID basada en imagen. ReText emplea descripciones generadas por este VLM para enriquecer el entrenamiento y superar a los metodos del estado del arte en benchmarks de Re-ID entre dominios (cross-domain). El repositorio es pequeno (0.3 GB) porque solo contiene los pesos ajustados, no el modelo base completo, que debe descargarse por separado.

Arquitectonicamente hereda la estructura de LLaVA-1.6-Vicuna-7B: un codificador visual CLIP ViT-L/14-336 acoplado a un LLM Vicuna de 7B mediante un proyector. El ajuste se realiza mediante un adaptador LoRA (el fichero se denomina `non_lora_trainables.safetensors`) cargado sobre el modelo base. El modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA (encoder visual CLIP ViT-L/14-336 + LLM Vicuna-7B + proyector), ajuste LoRA |
| Parametros totales | 7B (heredados del modelo base LLaVA-1.6-Vicuna-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`ham-release/ham/non_lora_trainables.safetensors`) + `config.json` |
| Modelo base | liuhaotian/llava-v1.6-vicuna-7b |
| Encoder visual | openai/clip-vit-large-patch14-336 |
| Dataset de ajuste | UFine3C |
| Tamano del repositorio | 0.3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA: un encoder visual CLIP ViT-L/14-336 procesa la imagen, un proyector la mapea al espacio del LLM y un Vicuna-7B genera la descripcion textual. El ajuste se aplica como LoRA sobre el modelo base, de modo que los pesos publicados (`non_lora_trainables.safetensors`) se cargan encima de `liuhaotian/llava-v1.6-vicuna-7b` y `openai/clip-vit-large-patch14-336`, que no se incluyen en el repositorio.

El entrenamiento se realizo sobre UFine3C, un dataset de personas en multiples camaras, con el objetivo de producir descripciones textuales ricas en atributos utiles para Re-ID. La model card indica que cada caption generada emplea un estilo de anotador elegido aleatoriamente, imitando el esquema de HAM (el framework de anotacion asociado). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de descripciones textuales de imagenes de personas (person image captioning) en ingles.
- Captioning por lotes de directorios de imagenes mediante el script `caption_own_images.py`, con salida en JSONL.
- Generacion con estilos de anotador variados de forma aleatoria, para aumentar la diversidad de las descripciones.
- Reanudacion de trabajos interrumpidos: el script omite imagenes ya registradas en el fichero de salida.
- Personalizacion del prompt de captioning a traves de la variable `PROMPT`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (thinking mode, audio, vision general): solo vision para captioning de personas; no se documentan otras.

## Casos de uso

- Anotacion automatica de datasets de Re-ID: generar descripciones textuales de las imagenes de un dataset de personas para enriquecer el entrenamiento de modelos de re-identificacion, que es el proposito original del trabajo ReText.
- Aumento de datos textuales: producir captions con estilos de anotador variados que amplien la diversidad de un corpus de descripciones sin anotacion manual.
- Preprocesado de pipelines de vision: ejecutar el script por lotes sobre un directorio de imagenes y obtener un JSONL con rutas y captions listo para etapas posteriores.
- Investigacion en vision-lenguaje aplicada a personas: usar el modelo como baseline ajustado para experimentos de captioning de atributos (ropa, pose, contexto) en entornos multi-camara.
- Construccion de indices de busqueda textual sobre imagenes de personas: convertir imagenes en texto para permitir busquedas o filtrados por lenguaje natural en un sistema de galeria.
- Reproduccion de resultados academicos: replicar el pipeline de ReText cargando estos pesos junto al modelo base y HAM para validar los resultados del paper.
- Prototipado en un unico GPU de 16 GB: el requisito declarado permite desplegar el captioning en una estacion de trabajo con una sola GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de ReText reporta que el metodo supera al estado del arte en benchmarks de Re-ID entre dominios, pero en la informacion proporcionada no se incluyen cifras concretas (mAP, Rank-1, etc.) ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB de memoria GPU, segun la model card (requisito declarado para ejecutar el script de captioning).
- GPU recomendadas: no se especifican modelos concretos; se indica una GPU NVIDIA con unos 16 GB. Por capacidad, encajan A100, H100, RTX 4090, RTX A6000 o RTX 4080; una GPU de 16 GB (por ejemplo, RTX 4080 o A4000) es el minimo declarado.
- Cabe en GPU de consumo: si, en tarjetas con al menos 16 GB de VRAM.
- Opciones de despliegue: el flujo documentado usa el repositorio HAM (https://github.com/MPI-Lab/HAM) con Python 3.10 y un entorno virtual; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReText-LLaVA | 7B (base) | no disponible | Captioning de personas / Re-ID | no disponible | Hugging Face (pesos LoRA) |
| liuhaotian/llava-v1.6-vicuna-7b | 7B | no disponible en esta ficha | VLM general | no disponible en esta ficha | Hugging Face |
| Otros VLM de captioning | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no permite establecer comparaciones cuantitativas con alternativas; solo se confirma que ReText-LLaVA se construye sobre LLaVA-1.6-Vicuna-7B y anade un ajuste especifico para captioning de personas.

## Limitaciones y advertencias

- El modelo esta especializado en descripciones de personas; su uso como VLM de proposito general no esta validado y probablemente degrade respecto al modelo base.
- Solo declara soporte de ingles; las captions en otros idiomas no estan garantizadas.
- No se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido; hay que consultar el repositorio y el paper antes de usarlo en produccion.
- Los pesos publicados son un adaptador LoRA: requieren descargar el modelo base LLaVA-1.6-Vicuna-7B y CLIP ViT-L/14-336, con sus propias licencias y condiciones.
- Riesgo de alucinacion inherente a los VLM: las descripciones pueden incluir atributos no presentes en la imagen, lo que afecta a la calidad de las anotaciones.
- Sesgos potenciales en la descripcion de personas (apariencia, genero, etnia, vestimenta) derivados de los datos de entrenamiento; no se documentan evaluaciones de sesgo.
- El pipeline depende de HAM y de instrucciones de instalacion especificas (no ejecutar `pip install -e .` sobre HAM); cambios en ese repositorio pueden romper la reproducibilidad.
- No se documentan la longitud de contexto, las cuantizaciones soportadas ni el rendimiento en latencia, lo que limita la planificacion de despliegues en produccion.
- El repositorio tiene 0 descargas en el momento de la consulta y fue creado en octubre de 2026; se trata de un artefacto de investigacion reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/timmzak/ReText-LLaVA
- GitHub del proyecto: https://github.com/timmzak/ReText
- Paper (arXiv): https://arxiv.org/abs/2602.05785
- Version HTML del paper: https://arxiv.org/html/2602.05785
- Dataset de anotaciones textuales: https://huggingface.co/datasets/timmzak/ReText-Captions
- Repositorio HAM: https://github.com/MPI-Lab/HAM
- Modelo base: https://huggingface.co/liuhaotian/llava-v1.6-vicuna-7b
- Encoder visual: https://huggingface.co/openai/clip-vit-large-patch14-336
