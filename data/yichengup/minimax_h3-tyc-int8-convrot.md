# yichengup/minimax_h3-tyc-int8-convrot

## Resumen

MiniMax H3 TYC INT8 ConvRot es un checkpoint de ajuste fino en un unico archivo para ComfyUI, derivado de los pesos oficiales BF16 de MiniMax H3 (repositorio `Comfy-Org/MiniMax-H3`). Lo publica el usuario `yichengup` y esta orientado a la generacion de video a partir de imagen (image-to-video) con soporte de audio. El modelo combina los pesos oficiales con injertos selectivos de dos modelos donantes (Tongyi-MAI Z-Image-Turbo y Lightricks LTX-2.5) y aplica una cuantizacion int8 tensorwise con convrot al final del proceso.

El autor insiste en que no se partio de ningun checkpoint hibrido de terceros: todos los cambios se aplicaron sobre los pesos BF16 oficiales y la cuantizacion se realizo una sola vez. Segun la model card, unicamente los perfiles de magnitud de `attn.q_norm` por cabeza contienen los injertos; el resto de tensores son los oficiales salvo el redondeo propio del int8. El archivo se carga con el nodo estandar "Load Diffusion Model" de ComfyUI 0.32 o superior, sin necesidad de nodos de cuantizacion adicionales, ya que incluye metadatos `comfy_quant` que ComfyUI interpreta de forma nativa.

El modelo es relevante para quienes trabajan con pipelines de generacion de video en ComfyUI y buscan una version cuantizada que reduzca requisitos de memoria manteniendo el comportamiento del modelo base, con la ventaja de un flujo de trabajo de un solo archivo y compatibilidad directa con el ecosistema ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para image-to-video y audio-video, base MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 tensorwise + convrot |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | unico archivo compatible con ComfyUI (metadatos `comfy_quant`), tamano del repo 21,0 GB |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base MiniMax H3 en la informacion proporcionada. La model card indica que se trata de un checkpoint de difusion para image-to-video con soporte de audio, cargable mediante el nodo "Load Diffusion Model" de ComfyUI. El proceso de construccion consistio en partir de los pesos oficiales BF16 pruned de `Comfy-Org/MiniMax-H3`, aplicar injertos en los perfiles de magnitud de `attn.q_norm` por cabeza procedentes de los donantes Tongyi-MAI/Z-Image-Turbo (Apache-2.0) y Lightricks/LTX-2.5 (LTX-2.x Community License), y finalmente cuantizar a int8 tensorwise con convrot.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La innovacion tecnica destacable es la tecnica de merge selectivo limitada a los perfiles de magnitud de normalizacion de atencion, junto con la cuantizacion int8 que permite ejecutar el modelo en ComfyUI sin nodos personalizados. Se proporciona un hash SHA256 (`708da592289758016e3350be144937577aaeceea423e9769c3fd41617a00251f`) para verificar la integridad del archivo.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video).
- Generacion conjunta de video y audio (audio-video), segun los tags del repositorio.
- Integracion nativa en ComfyUI mediante el nodo estandar "Load Diffusion Model" (ComfyUI 0.32+).
- Carga sin nodos de cuantizacion personalizados gracias a los metadatos `comfy_quant`.
- Compatibilidad con los text encoders y VAE estandar de H3.
- Ejecucion en navegador mediante los workflows alojados en RunningHub (internacional y China).
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Prototipado rapido de video generativo: al cargarse en ComfyUI con un unico nodo, permite montar un pipeline image-to-video en minutos y validar ideas sin gestionar varios archivos o nodos extra.
- Generacion de clips con audio para redes sociales: la capacidad audio-video permite producir piezas cortas con pista sonora integrada partiendo de una imagen clave, util para contenido promocional.
- Animacion de ilustraciones y concept art: convertir bocetos o renders estaticos en secuencias animadas para presentaciones de pitch o portfolios de diseno.
- Pruebas de concepto en entornos con VRAM limitada: la cuantizacion int8 reduce el peso del modelo (repo de 21,0 GB) frente a los pesos BF16, lo que facilita su ejecucion en GPUs de gama alta de consumo.
- Evaluacion comparativa de tecnicas de merge y cuantizacion: investigadores pueden estudiar el efecto de los injertos en `attn.q_norm` y del esquema int8 tensorwise + convrot frente al modelo base oficial.
- Demos interactivas sin instalacion local: los workflows de RunningHub permiten probar el modelo en navegador, adecuado para talleres, docencia o validacion con clientes.
- Integracion en flujos de postproduccion: generar variaciones de video a partir de fotogramas clave para insertar en edicion y composicion digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio es de 21,0 GB en int8, por lo que se requiere una GPU con al menos esa capacidad de memoria para cargar los pesos, mas overhead de activaciones y VAE.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el volumen del checkpoint, se orienta a GPUs profesionales (A100, H100) o de gama alta de consumo con 24 GB o mas.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de 21,0 GB sugiere que solo cabria en modelos con 24 GB o mas de VRAM, y no en GPUs de 8-16 GB sin tecnicas adicionales de offload.
- Opciones de despliegue: ComfyUI 0.32+ (nodo "Load Diffusion Model"), workflows en RunningHub (internacional y China). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yichengup/minimax_h3-tyc-int8-convrot | no disponible | no disponible | unico archivo ComfyUI, int8 | MiniMax H3 Community License | Hugging Face (3 descargas) |
| Comfy-Org/MiniMax-H3 (base oficial) | no disponible | no disponible | BF16 pruned | MiniMax H3 Community License | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo (donante) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Lightricks/LTX-2.5 (donante) | no disponible | no disponible | no disponible | LTX-2.x Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un modelo generativo de video, puede heredar sesgos de los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: no evaluado; en modelos de difusion se traduce en artefactos visuales, incoherencias temporales o desalineacion con la imagen de entrada.
- Limitaciones de contexto o idioma: no disponibles; no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: se distribuye bajo la MiniMax H3 Community License Agreement; incorpora componentes de Z-Image-Turbo (Apache-2.0) y LTX-2.5 (LTX-2.x Community License). No esta licenciado para generar imagenes de personas reales sin consentimiento, contenido ilegal ni usos prohibidos por las licencias upstream.
- Responsabilidad de uso: el autor declara que el usuario es responsable de lo que genere.
- Caveat de produccion: el modelo tiene solo 3 descargas y 2 likes, por lo que su validacion comunitaria es muy limitada; conviene verificar el hash SHA256 antes de desplegarlo.
- Requiere ComfyUI 0.32 o superior; versiones anteriores pueden no interpretar los metadatos `comfy_quant`.
- El merge selectivo sobre `attn.q_norm` puede introducir diferencias de comportamiento no documentadas frente al modelo base oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yichengup/minimax_h3-tyc-int8-convrot
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Workflow en RunningHub (internacional): https://www.runninghub.ai/post/2120030695909658626/?inviteCode=rh-v1091
- Workflow en RunningHub (China): https://www.runninghub.cn/post/2120017578927149057/?inviteCode=cn-v1079
- Donante Tongyi-MAI/Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Donante Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
