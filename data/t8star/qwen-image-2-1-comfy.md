# t8star/qwen-image-2.1-comfy

## Resumen

Este repositorio no contiene un modelo generativo de imagenes, sino una coleccion de espejo (mirror) de cuatro modelos GGUF Q4_K_M de reescritura de prompts y dos proyectores visuales BF16, empaquetados para el nodo de ComfyUI [ComfyUI-Qwen-Image-Prompt-Rewrite-T8](https://github.com/T8mars/Comfyui-Qwen-Image-Prompt-Rewrite-T8). Los pesos originales proceden de los checkpoints Qwen/Qwen-Image-2.1-PE-T2I y Qwen/Qwen-Image-2.1-PE-I2I, y de sus variantes "Heretic" publicadas por pottokao; el autor del repo, t8star, no ha entrenado ni cuantizado ninguno de los ficheros, y conserva nombres y checksums SHA256 originales.

El modelo base es un transformer de ~8.950 millones de parametros (8,95 B) que actua como "prompt enhancer": recibe una instruccion breve del usuario y devuelve un prompt expandido y estructurado para alimentar un pipeline de difusion Qwen Image 2.1. La variante I2I incorpora un proyector visual BF16 (`mmproj`) que permite condicionar la reescritura con entre 1 y 10 imagenes de referencia, lo que habilita flujos de edicion de imagen guiada por lenguaje natural.

Su relevancia practica es acotada pero clara: permite ejecutar la fase de reescritura de prompts en local con llama.cpp y ComfyUI, sin depender de APIs externas, y con un peso de ~5 GB por fichero Q4_K_M. Es importante subrayar que estos pesos no generan imagenes por si solos: requieren un pipeline de difusion Qwen Image 2.1 separado, y su licencia Qwen Research restringe el uso a investigacion y evaluacion no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen de reescritura de prompts); no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | 8.953.803.264 (~8,95 B) segun safetensors del repo |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para los modelos de lenguaje; BF16 para los proyectores visuales (`mmproj-bf16.gguf`) |
| Idiomas soportados | en, zh |
| Licencia | qwen-research (Qwen Research License Agreement); solo investigacion y evaluacion no comercial |
| Formato de pesos | GGUF (llama.cpp) + proyectores BF16 GGUF; tamano del repo 24,9 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del checkpoint Qwen-Image-2.1-PE (numero de capas, cabezas, dimension oculta ni funcion de activacion). Por el recuento de parametros (~8,95 B) y el ecosistema en el que se distribuye, se trata de un transformer decoder-only de la familia Qwen adaptado a la tarea de reescritura de prompts, ejecutable mediante llama.cpp. La variante I2I anade un proyector visual multimodal en BF16 que inyecta representaciones de imagen en el modelo de lenguaje, siguiendo el patron habitual de los proyectores tipo LLaVA.

No se han publicado en esta ficha datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO. Las variantes "Heretic" son derivados comunitarios de pottokao sobre los checkpoints originales de Qwen; la model card indica explicitamente que no se ha establecido una ventaja de calidad frente a los modelos estandar. El proceso de cuantizacion a Q4_K_M tampoco lo ha realizado t8star: los ficheros se redistribuyen con sus checksums originales.

## Capacidades

- Reescritura y expansion de prompts texto-a-imagen (T2I): transforma instrucciones breves en descripciones detalladas y estructuradas para el pipeline de difusion.
- Reescritura consciente de imagen (I2I): con el proyector `mmproj-bf16.gguf` correspondiente, procesa entre 1 y 10 imagenes de referencia para generar instrucciones de edicion.
- Conversacion multi-turno: el tag `conversational` del repo indica soporte de dialogo, aunque la funcion principal es la reescritura de prompts.
- Multilingue limitado a ingles y chino.
- Integracion nativa con ComfyUI mediante el nodo Qwen Image Prompt Rewrite T8, con seleccion automatica de proyector (`Auto`).
- Variantes "Heretic" opcionales para T2I e I2I, orientadas a reducir restricciones de contenido en la reescritura (sin ventaja de calidad demostrada).
- No soporta, segun la informacion disponible, tool calling, function calling ni generacion de imagenes: es exclusivamente un componente de preprocesado de prompts.

## Casos de uso

- Reescritura local de prompts en ComfyUI: el nodo carga el GGUF Q4_K_M y expande la instruccion del usuario antes de pasarla al pipeline de difusion Qwen Image 2.1, eliminando la dependencia de APIs de terceros para esta fase.
- Edicion de imagen guiada por lenguaje natural: con `Qwen-Image-2.1-PE-I2I.Q4_K_M.gguf` y su `mmproj-bf16.gguf`, el modelo analiza hasta 10 imagenes de referencia y produce instrucciones de edicion coherentes con el contenido visual.
- Estandarizacion de prompts en equipos de diseno: permite fijar una plantilla de reescritura para que distintos operadores obtengan prompts homogeneos y reproducibles a partir de descripciones dispares.
- Prototipado de pipelines generativos en investigacion: al ser un modelo de ~8,95 B cuantizado a Q4_K_M, se puede desplegar en estaciones de trabajo con GPU de consumo para experimentar con variantes de reescritura sin coste de API.
- Evaluacion comparativa de estrategias de prompting: las variantes estandar y Heretic permiten contrastar como afecta la reescritura (y sus restricciones) a la calidad final de la imagen generada.
- Traduccion y adaptacion bilingue de prompts: con soporte en/zh, un equipo puede redactar la instruccion en chino y obtener el prompt expandido en ingles (o viceversa) para el pipeline de difusion.
- Despliegue en entornos aislados (air-gapped): al ser pesos GGUF ejecutables con llama.cpp, el flujo completo de reescritura funciona sin conectividad externa, util en laboratorios con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros Q4_K_M ocupan aproximadamente 5 GB cada uno; con overhead de contexto de llama.cpp, se recomienda un minimo de 6-8 GB de VRAM para el modelo de lenguaje. Los proyectores BF16 anaden memoria adicional, no cuantificada en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o superiores deberian poder alojar el modelo Q4_K_M; para mayor comodidad y para el pipeline de difusion completo se recomienda 16-24 GB.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas para el modelo de reescritura aislado; el pipeline de difusion Qwen Image 2.1 tiene requisitos propios no cubiertos aqui.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), nodo ComfyUI-Qwen-Image-Prompt-Rewrite-T8, ComfyUI Registry. No se mencionan vLLM ni TGI para estos ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (Qwen-Image-2.1-PE Q4_K_M) | ~8,95 B | no disponible | GGUF Q4_K_M + mmproj BF16 | qwen-research (no comercial) | Reescritura de prompts T2I/I2I para ComfyUI |
| Qwen/Qwen-Image-2.1-PE-T2I (original) | no disponible | no disponible | safetensors (original) | qwen-research | Checkpoint fuente sin cuantizar |
| pottokao/Qwen-Image-2.1-PE-T2I-Heretic | no disponible | no disponible | GGUF | no disponible | Variante derivada con restricciones reducidas; sin ventaja de calidad establecida |
| Modelos genericos de reescritura de prompts (p. ej. variantes pequenas de instruct) | variable | variable | safetensors/GGUF | variable | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: la Qwen Research License Agreement solo autoriza uso y redistribucion para investigacion o evaluacion no comercial; cualquier uso comercial requiere licencia separada del titular de derechos Qwen.
- No es un modelo de generacion de imagenes: requiere un pipeline de difusion Qwen Image 2.1 independiente; usarlo aislado solo produce texto.
- Dependencia estricta del proyector: cada modelo I2I necesita su `mmproj-bf16.gguf` correspondiente; emparejar un proyector con un peso T2I o mezclar variantes estandar y Heretic produce resultados incorrectos.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y de deriva semantica: al expandir prompts, el modelo puede introducir elementos no solicitados que alteren la imagen final.
- Las variantes Heretic no han demostrado ventaja de calidad; su uso responde a criterios de contenido, no de rendimiento.
- Repo espejo: t8star no mantiene los pesos originales; la responsabilidad tecnica y de licencia recae en los autores fuente (Qwen y pottokao).
- Sin datos publicados de benchmarks, contexto maximo ni latencia, lo que dificulta el dimensionamiento en produccion.
- El tamano del repo (24,9 GB) incluye todas las variantes; descargar solo los ficheros necesarios para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t8star/qwen-image-2.1-comfy
- Nodo ComfyUI: https://github.com/T8mars/Comfyui-Qwen-Image-Prompt-Rewrite-T8
- ComfyUI Registry: https://registry.comfy.org/zh/publishers/t8star/nodes/qwen-image-prompt-rewrite-t8
- Checkpoint original T2I: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Checkpoint original I2I: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- GGUF T2I (prithivMLmods): https://huggingface.co/prithivMLmods/Qwen-Image-2.1-PE-T2I-GGUF
- GGUF I2I (prithivMLmods): https://huggingface.co/prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF
- Heretic T2I: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic
- Heretic I2I: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-I2I-Heretic
- Heretic T2I GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- Heretic I2I GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-I2I-Heretic-GGUF
- Perfil del autor: https://huggingface.co/t8star
- Bilibili: https://space.bilibili.com/385085361
- YouTube: https://www.youtube.com/@T8star-Aix/
- Galeria gratuita: https://www.openzhenzhen.com
