# unsloth/flux-3-image-klein-pup-GGUF

## Resumen

FLUX 3 Image Klein Prompt Upsampler (PUP) es un modelo de lenguaje especializado en reescritura y expansion de prompts para el generador de imagenes FLUX 3 Image Klein, desarrollado por Black Forest Labs. Se trata de un fine-tune de Qwen3.5-9B que transforma una peticion corta de imagen (o, en el caso de ediciones, una instruccion junto con imagenes de referencia) en la caption detallada con la que fue entrenado FLUX 3 Image Klein. La version aqui descrita es la conversion a GGUF realizada por Unsloth, publicada bajo licencia Apache 2.0 y orientada a su ejecucion local mediante llama.cpp.

El problema que resuelve es concreto: los prompts cortos enviados directamente al modelo de imagen producen resultados genericos y errores anatomicos frecuentes (posturas imposibles, extremidades enredadas, backflips o handstands mal resueltos). El upsampler genera descripciones explicitas de la pose y de cada extremidad, lo que corrige la mayoria de esos fallos. No es un modelo de generacion de imagenes, sino un componente de texto (pipeline image-text-to-text) que se situa delante del modelo de difusion.

Con 8.953.803.264 parametros y un repositorio de 48,2 GB que incluye varias cuantizaciones (desde Q4_K_M de 5,6 GB hasta BF16 de 17,9 GB), esta pensado para integrarse en flujos de trabajo de generacion de imagen asistida. Su relevancia actual radica en que Unsloth Desktop y Unsloth Studio lo descargan y ejecutan automaticamente mediante la opcion "Enhance prompt", y en que las cuantizaciones mantienen una fidelidad muy alta respecto a BF16 (KLD de 0,0194 en Q4_K_M y 0,0025 en Q6_K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configuracion de ejemplo en llama.cpp con `-c 16384`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, UD-Q4_K_XL (Unsloth Dynamic 4-bit) |
| Idiomas soportados | en (ingles declarado); el autor indica que los ficheros funcionan con peticiones en chino, japones, espanol y aleman |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye proyectores de vision mmproj en F16 y BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3.5-9B, ajustado por Black Forest Labs para la tarea especifica de expansion de prompts. No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos detalles remiten a la model card original de `black-forest-labs/flux-3-image-klein-pup`. La innovacion principal no esta en la arquitectura, sino en la especializacion: el modelo aprende a convertir peticiones breves en captions que describen explicitamente la pose, la anatomia y la composicion, que es el formato con el que FLUX 3 Image Klein fue entrenado.

La integracion con vision se realiza mediante un proyector multimodal (`mmproj-F16.gguf` o `mmproj-BF16.gguf`, 0,9 GB cada uno), necesario para las tareas de edicion con imagenes de referencia. El repositorio incluye ademas `system_prompts.json` con los prompts de sistema originales de Black Forest Labs (`t2i`, `i2i`, `t2i_bbox`, `i2i_bbox`), sin modificar. Las cuantizaciones de Unsloth preservan los tipos de tensor, tamano y velocidad de las versiones anteriores, y UD-Q4_K_XL emplea el layout dinamico de Qwen3.5-9B UD-Q4_K_XL con un 6 % mas de bytes que Q4_K_M.

## Capacidades

- Expansion de prompts texto-a-imagen: transforma peticiones cortas en captions detalladas con descripcion explicita de pose y extremidades.
- Edicion de imagen guiada por referencia: acepta imagenes de referencia junto con la instruccion y genera la caption de edicion (requiere el proyector mmproj).
- Comprension de imagenes de entrada: el pipeline es image-text-to-text, por lo que procesa las imagenes de referencia antes de emitir el texto.
- Soporte de system prompts especializados: `t2i`, `i2i`, `t2i_bbox` e `i2i_bbox` para generacion y edicion, con y sin bounding boxes.
- Modo thinking desactivable: la configuracion oficial recomienda `enable_thinking: false` y decodificacion greedy.
- Multilinguee en la practica: aunque declara solo ingles, el autor verifica funcionamiento con peticiones en chino, japones, espanol y aleman.
- Robustez ante entradas atipicas: errores tipograficos, listas, negaciones y texto dentro de la imagen.
- No se documenta soporte de tool calling ni de razonamiento multi-paso orientado a agentes.

## Casos de uso

- Generacion de imagen asistida en local: el upsampler se coloca delante de FLUX 3 Image Klein para convertir una peticion breve en una caption detallada, reduciendo posturas rotas y anatomias incorrectas sin necesidad de reescribir el prompt a mano.
- Edicion de imagenes con referencias: usando el system prompt `i2i` y las imagenes de referencia en el mensaje de usuario, se genera la caption de edicion que se pasa al modelo de difusion; adecuado para flujos de retoque guiado.
- Integracion en Unsloth Desktop y Unsloth Studio: la opcion "Enhance prompt" descarga y ejecuta este upsampler automaticamente, por lo que sirve como componente listo para usar en esos entornos.
- Pipelines de generacion por lotes: al ser un GGUF ejecutable con llama.cpp, puede desplegarse como servicio local que preprocesa lotes de peticiones antes de enviarlas al modelo de imagen, con cuantizaciones Q4_K_M o Q6_K para equilibrar VRAM y fidelidad.
- Flujos con bounding boxes: los prompts `t2i_bbox` e `i2i_bbox` permiten generar captions que respetan regiones delimitadas, util para composicion controlada de escenas.
- Prototipado en hardware de consumo: con UD-Q4_K_XL (6,0 GB) y el mmproj (0,9 GB) se necesita aproximadamente 7,5 GB de VRAM, lo que permite ejecutarlo en GPUs de gama alta para consumidores.
- Investigacion sobre prompting para difusion: permite estudiar como la reformulacion de captions afecta a la calidad anatomica del modelo de imagen, con seeds y prompts de sistema controlados.

## Benchmarks y rendimiento

El autor publica una evaluacion de fidelidad de las cuantizaciones respecto a BF16, medida como divergencia KL sobre las captions generadas por el propio upsampler (96 peticiones, solo tokens de asistente):

| Fichero | KLD media vs BF16 |
|---|---|
| Q4_K_M | 0,0194 |
| UD-Q4_K_XL | 0,0119 |
| Q6_K | 0,0025 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica ademas que, al renderizar poses dificiles (backflip, handstand, estiramiento, violin, grupo de cinco en un sofa, pareja abrazada) con FLUX 3 Image Klein a partir de captions de Q4_K_M, Q8_0 y BF16 con las mismas seeds, no se observaron diferencias anatomicas entre ellas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,5 GB con UD-Q4_K_XL mas el mmproj F16; Q4_K_M ocupa 5,6 GB, Q6_K 7,4 GB, Q8_0 9,5 GB y BF16 17,9 GB (mas 0,9 GB de proyector de vision en todos los casos con edicion).
- GPU recomendadas: no se especifican modelos concretos; por tamano, una RTX 4090 (24 GB) cubre todas las cuantizaciones, y GPUs de 8-12 GB pueden alojar Q4_K_M o UD-Q4_K_XL con el mmproj.
- Cabe en GPU de consumo: si, al menos en las cuantizaciones de 4 y 6 bits.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj`, `-ngl 99`, `-c 16384` y `--jinja`; el autor lo integra en Unsloth Desktop y Unsloth Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de upsampling de prompts en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, el propio autor situa este modelo como fine-tune de Qwen3.5-9B y como componente especifico para FLUX 3 Image Klein; no se documentan comparaciones con otros upsamplers.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| flux-3-image-klein-pup (este, GGUF de Unsloth) | ~8,95 mil millones | 16.384 tokens (config. de ejemplo) | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-9B (base) | ~9 mil millones | no disponible | no disponible | no disponible |
| Alternativas de upsampling | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera imagenes: solo produce captions; requiere FLUX 3 Image Klein como etapa posterior.
- Esta especializado en una unica tarea (expansion de prompts); no es adecuado como modelo de proposito general.
- El idioma declarado es solo ingles; el soporte de espanol, aleman, chino y japones se menciona como verificado por el autor, pero no esta declarado oficialmente.
- Riesgo de alucinacion: al reescribir la peticion, puede introducir detalles no solicitados en la caption; conviene revisar el resultado en flujos sensibles.
- Las captions de edicion requieren el proyector mmproj y el formato exacto de mensaje indicado por el autor (imagenes antes del texto).
- La configuracion recomendada es decodificacion greedy con `temperature: 1.0`, `top_k: 1`, `presence_penalty: 1.5` (0 en edicion) y thinking desactivado; desviarse de ella puede degradar la calidad.
- Licencia Apache 2.0, que permite uso comercial, pero todos los creditos del modelo corresponden a Black Forest Labs y los detalles de entrenamiento y uso previsto remiten a la model card original.
- No se documentan sesgos especificos ni limites de contexto distintos de los 16.384 tokens de la configuracion de ejemplo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/flux-3-image-klein-pup-GGUF
- Modelo base original: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- FLUX 3 Image Klein: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Unsloth: https://unsloth.ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
