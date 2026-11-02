# Vathography/vathography-app-models

## Resumen

Vathography App — model files es un repositorio de pesos publicado por Vathography que contiene los ficheros del modelo de estimacion de profundidad monocular Marigold V2 que la aplicacion Vathography descarga en su primera ejecucion. No se trata de un modelo original: los ficheros son byte a byte identicos a los del repositorio Comfy-Org/marigold-v2-0 (revision `c304e4370a1bc677a98c906c3683ace49a6bdadd`), empaquetados en el formato de directorios que espera ComfyUI (`models/loras/`, `models/vae/`, `models/embeddings/`).

El modelo subyacente, Marigold V2, es un trabajo de Igor Pavlovic, Thiemo Wandel, Anton Obukhov y colaboradores (EPFL, HUAWEI Bayer Lab, Universidad de Bolonia) publicado en ACM Transactions on Graphics en 2026. Revisita el uso de diffusion transformers para estimacion de profundidad monocular y se distribuye como un LoRA sobre un backbone Qwen-Image-Edit-2509, con un VAE especifico que actua como decodificador afinado. El repositorio ocupa 2,0 GB e incluye tres ficheros safetensors: el LoRA de profundidad, su VAE y el tensor de condicionamiento.

La relevancia practica de este repositorio es de empaquetado y reproducibilidad: permite que la aplicacion Vathography mantenga descargas estables y que los mismos pesos se carguen directamente en ComfyUI. La licencia Apache 2.0 de las obras originales se mantiene, por lo que el uso comercial esta permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (Marigold V2) con backbone Qwen-Image-Edit-2509; LoRA de profundidad mas VAE decodificador afinado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; sin variantes GGUF publicadas en este repo) |
| Idiomas soportados | no disponible (tarea de vision; no depende de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA, VAE y conditioning en layout ComfyUI) |

## Arquitectura y entrenamiento

Marigold V2 se plantea como una revision del uso de diffusion transformers para estimacion de profundidad monocular. En este repositorio el modelo se materializa como un LoRA (`marigold_v2_depth_log_stage2.safetensors`) que se aplica sobre el backbone de Qwen-Image-Edit-2509, acompanado de un VAE que incorpora un decodificador afinado y un encoder derivado de Qwen-Image-Edit-2509 (`marigold_v2_depth_log_stage2_vae.safetensors`), y de un tensor de condicionamiento (`marigold_v2_depth_conditioning.safetensors`). El sufijo "Log-stage2" sugiere una etapa de entrenamiento en espacio logaritmico de profundidad, aunque la model card no detalla la composicion del dataset ni el numero de tokens o imagenes empleados.

No se especifican en la informacion disponible los detalles de entrenamiento (datos, regimen de RLHF/DPO, tecnicas de muestreo). La referencia tecnica es el paper "Marigold V2: Revisiting Diffusion Transformers for Monocular Depth Estimation" (ACM Trans. Graph. 45(6), 2026), que no se ha podido consultar en detalle aqui. El backbone Qwen-Image-Edit-2509 procede del equipo Qwen y se documenta en el Qwen-Image Technical Report (arXiv:2508.02324).

## Capacidades

- Estimacion de profundidad monocular a partir de una imagen de entrada (tarea principal, `pipeline_tag: depth-estimation`).
- Integracion directa en ComfyUI mediante los directorios estandar de LoRA, VAE y embeddings.
- Uso como componente de un pipeline de generacion/edicion de imagen: el backbone Qwen-Image-Edit-2509 aporta capacidades de edicion de imagen, sobre las que se anade la prediccion de profundidad.
- Modelo de difusion: genera mapas de profundidad mediante muestreo iterativo, no en una sola pasada.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue explicito.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Reconstruccion 3D y fotogrametria asistida: el mapa de profundidad monocular generado por el modelo sirve como entrada para generar nubes de puntos o mallas a partir de una sola imagen, util en pipelines de escaneo de objetos o escenas.
- Efectos de desenfoque de profundidad (depth of field) en postproduccion: el mapa de profundidad permite aplicar desenfoque selectivo realista en edicion fotografica o de video sin necesidad de captura estereo.
- Segmentacion por profundidad en pipelines de vision: usar el mapa como senal auxiliar para separar primer plano y fondo en tareas de matting, composicion o rotoscopia.
- Control de generacion de imagen en ComfyUI: el modelo se carga en el layout estandar de ComfyUI y puede encadenarse con nodos de generacion o edicion, por ejemplo para condicionar la sintesis de imagen por estructura geometrica.
- Previsualizacion en aplicaciones de consumo: es el caso de uso real de este repositorio, que alimenta la descarga inicial de la aplicacion Vathography (https://vathography.com) para ofrecer estimacion de profundidad en el dispositivo o en servidor.
- Investigacion en estimacion de profundidad: al ser pesos identicos a Comfy-Org/marigold-v2-0, sirve como referencia reproducible para comparar resultados de Marigold V2 frente a otros metodos monoculares.
- Prototipado rapido de efectos AR: el mapa de profundidad permite anclar elementos virtuales a planos de una escena capturada con una sola camara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 2,0 GB en disco, lo que da una cota inferior del peso de los pesos; el consumo en inferencia depende del backbone Qwen-Image-Edit-2509 y del muestreo de difusion, que no se detalla.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Dado el uso de un backbone de difusion de imagen, es probable que requiera GPUs con memoria considerable, pero no se aportan cifras.
- Opciones de despliegue: ComfyUI (layout nativo de los ficheros), y por extension cualquier runtime que cargue safetensors y el backbone Qwen-Image-Edit-2509. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vathography App — model files (Marigold V2 empaquetado) | no disponible | no disponible | Estimacion de profundidad monocular | Apache 2.0 | HuggingFace (este repo) |
| huawei-bayerlab/marigold-v2-0 | no disponible | no disponible | Estimacion de profundidad monocular | Apache 2.0 (segun repo original) | HuggingFace |
| Comfy-Org/marigold-v2-0 | no disponible | no disponible | Estimacion de profundidad monocular | Apache 2.0 (segun repo original) | HuggingFace |
| Qwen/Qwen-Image-Edit-2509 | no disponible | no disponible | Edicion de imagen (backbone) | no disponible en esta ficha | HuggingFace |

Los tres primeros repositorios contienen esencialmente los mismos pesos (los ficheros de este repo son byte a byte identicos a los de Comfy-Org/marigold-v2-0); la diferencia es el empaquetado y el proposito de distribucion. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo original: es un espejo de pesos de terceros. Cualquier correccion o actualizacion debe provenir de los repositorios upstream (huawei-bayerlab/marigold-v2-0 y Comfy-Org/marigold-v2-0).
- La model card no documenta sesgos, tasas de error ni comportamiento en dominios fuera de distribucion; no hay garantias de calidad publicadas en este repositorio.
- Riesgo de alucinacion geometrica: como modelo generativo de difusion, puede producir mapas de profundidad plausibles pero incorrectos en escenas ambiguas, transparentes o con superficies reflectantes.
- No se documentan limitaciones de contexto ni de idioma porque la tarea es de vision y no depende del texto.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero `NOTICE` del repositorio y respetar la atribucion a los autores originales de Marigold V2 y Qwen-Image-Edit-2509.
- El repositorio no esta afiliado ni respaldado por los autores originales, segun indica la propia model card.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que limita la validacion comunitaria del empaquetado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vathography/vathography-app-models
- Modelo base Marigold V2: https://huggingface.co/huawei-bayerlab/marigold-v2-0
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Repositorio ComfyUI de referencia: https://huggingface.co/Comfy-Org/marigold-v2-0
- Repositorio see-through de Vathography: https://huggingface.co/Vathography/marigold-v2-see-through-comfyui
- Paper Marigold V2: https://arxiv.org/abs/2609.08084
- Codigo Marigold V2: https://github.com/huawei-bayerlab/marigold-v2
- Qwen-Image Technical Report: https://arxiv.org/abs/2508.02324
- Aplicacion Vathography: https://vathography.com
