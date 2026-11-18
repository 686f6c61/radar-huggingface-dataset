# taurusduan/minimax-h3-image-comfyui-workflows

## Resumen

`taurusduan/minimax-h3-image-comfyui-workflows` es un repositorio de flujos de trabajo (workflows) para ComfyUI, no un modelo de pesos en si mismo. Proporciona tres variantes de un mismo grafo de ComfyUI para ejecutar el modelo de generacion de imagenes **MiniMax H3 Image**, optimizadas para tarjetas graficas con 8, 12 y 16 GB de VRAM. El objetivo es permitir la generacion de imagenes de hasta 16 MP (por ejemplo, 3552x4736 en 3:4 o 5472x3072 en 16:9) en hardware de consumo, incluso en GPUs de 8 GB, mediante streaming del modelo por partes desde la RAM del sistema.

El autor es `taurusduan`, un usuario particular, y el repositorio tiene licencia Apache 2.0. El modelo subyacente (MiniMax H3 Image) es un modelo de difusion para texto-a-imagen y edicion de imagenes, con un text encoder basado en Qwen3-VL de 32B y un VAE de 1.2 GB. Los workflows incluyen un nodo de "Enhance prompt" que usa un upsampler Qwen3.5 9B (desactivado por defecto en la version de 8 GB por motivos de rendimiento).

La relevancia de este repositorio radica en que demuestra que es posible ejecutar modelos de difusion de gran tamano (21 GB en formato int8) en GPUs consumer mediante tecnicas de offloading y decodificacion VAE por tiles, manteniendo la misma calidad de imagen final independientemente de la VRAM disponible. Esto lo convierte en un recurso practico para desarrolladores que quieran probar MiniMax H3 Image sin acceso a GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (no se especifica el tipo exacto; probablemente transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (modelo de difusion), nvfp4 (text encoder), sin GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo de difusion int8, text encoder nvfp4, VAE) |
| Tamano del repositorio | 0.2 GB (solo workflows; los pesos se descargan aparte) |
| Modelo de difusion | 21 GB (`minimax_h3_image_pruned_int8_convrot.safetensors`) |
| Text encoder | 15.7 GB (`qwen3vl_32b_mini...`, nvfp4) |
| VAE | 1.2 GB |
| Pasos de muestreo | 6 (modelo destilado) |
| CFG | 1.0 |
| Sampler | SamplerLCM (s_noise 1.1 -> 0.9) + BasicScheduler simple |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo MiniMax H3 Image en la model card. Se trata de un modelo de difusion para generacion de imagenes (text-to-image) y edicion (image-editing), con un text encoder basado en Qwen3-VL de 32B en cuantizacion nvfp4 y un VAE de 1.2 GB. El modelo de difusion se distribuye en formato int8 con poda (`pruned_int8_convrot`), lo que sugiere que ha sido optimizado para inferencia eficiente.

El modelo esta destilado para funcionar en solo 6 pasos de muestreo, con CFG 1.0 y sin prompt negativo. Esto indica que se ha aplicado una tecnica de destilacion (probablemente de tipo consistency o adversarial) para reducir el numero de pasos necesarios. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o si se uso RLHF/DPO. El workflow incluye un upsampler de prompts basado en Qwen3.5 9B (archivo `qwen3.5_9b_w4a8_gptq.safetensors`), que reescribe ideas cortas en descripciones detalladas, aunque este componente es opcional y esta desactivado en la version de 8 GB.

## Capacidades

- Generacion de texto a imagen (text-to-image) de alta resolucion: hasta 16 MP (5472x3072 en 16:9, 3552x4736 en 3:4).
- Edicion de imagenes (image-editing) mediante referencias: soporta hasta 10 imagenes de referencia en el workflow, aunque el autor recomienda 4 o menos para mayor velocidad.
- Composicion multi-referencia: permite combinar elementos de varias imagenes de referencia en una sola escena (por ejemplo, "pon al hombre de la Imagen 1 en el cafe de la Imagen 2").
- Soporte de relaciones de aspecto configurables: 1:1, 3:4, 4:3, 2:3, 3:2, 9:16, 16:9, 21:9.
- Modo borrador (draft) a 4 MP para pruebas rapidas de prompts antes de generar a 16 MP.
- Upsampling de prompts opcional mediante Qwen3.5 9B (solo en versiones de 12 GB y 16 GB; desactivado en 8 GB).
- Generacion de texto dentro de imagenes (segun la guia de prompts incluida).
- No se mencionan capacidades de tool calling, agentes, vision o audio.

## Casos de uso

- **Generacion de imagenes de alta resolucion en GPUs consumer**: un desarrollador con una RTX 3060 (8 GB) puede generar imagenes de 16 MP (5472x3072) usando el workflow de 8 GB, con tiempos de aproximadamente 60 segundos por imagen (medido en una RTX 5070 Ti con VRAM limitada artificialmente). Es adecuado porque el workflow gestiona el streaming del modelo desde RAM, evitando errores de falta de memoria.
- **Prototipado rapido de prompts**: el modo borrador a 4 MP permite probar variaciones de prompts en menos tiempo antes de lanzar la generacion final a 16 MP, lo que acelera la iteracion en estudios de diseno o ilustracion.
- **Edicion de imagenes con multiples referencias**: un usuario puede combinar hasta 10 imagenes de referencia (por ejemplo, un producto, un fondo y una persona) para crear una escena compuesta. El workflow permite referenciar cada imagen como `<Picture 1>`, `<Picture 2>`, etc. en el prompt, lo que facilita tareas de collage o sustitucion de elementos.
- **Generacion de material grafico para marketing**: creacion de imagenes de alta resolucion para banners, fondos de pantalla o ilustraciones editoriales, con la ventaja de que el modelo esta destilado a 6 pasos, lo que reduce el coste computacional frente a modelos que requieren 20-50 pasos.
- **Integracion en pipelines de ComfyUI**: al ser workflows nativos de ComfyUI (sin nodos personalizados), se pueden integrar en automatizaciones existentes basadas en la API de ComfyUI para generar lotes de imagenes de forma programatica.
- **Investigacion en eficiencia de difusion**: el repositorio sirve como referencia para estudiar tecnicas de offloading y decodificacion VAE por tiles (tiled VAE decode a 512 o 768 px) que permiten ejecutar modelos de gran tamano en hardware limitado, manteniendo la misma salida pixel a pixel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Sin embargo, la model card incluye tiempos de render medidos en una RTX 5070 Ti (16 GB) con 24 GB de RAM, limitando artificialmente la VRAM para simular tarjetas de 12 y 8 GB:

| Trabajo | 16 GB | 12 GB | 8 GB |
|---|---|---|---|
| Texto a imagen, 16 MP | 66 s | 63 s | 60 s |
| Tiempo por paso (6 pasos) | 4.4 s | 4.8 s | 5.7 s |
| 4 imagenes de referencia, 16 MP | - | - | 228 s (aprox. 4 min) |
| 4 imagenes de referencia, 8 MP | - | - | 156 s (aprox. 2.5 min) |

El autor indica que, con la misma semilla, las tres versiones producen la misma imagen pixel a pixel. Las tarjetas reales de 8 GB y 12 GB (RTX 4060, 3060, 4070, etc.) tienen chips mas lentos que la tarjeta de prueba, por lo que los tiempos reales seran mayores.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - 8 GB: maximo 3.7 GB de VRAM utilizados para una imagen de 16 MP (medido).
  - 12 GB: suficiente para VAE decode por tiles de 768 px.
  - 16 GB o mas: VAE decode normal (sin tiles).
- **RAM del sistema**: 24 GB minimo (probado), 32 GB recomendado. Los modelos (21 GB + 15.7 GB + 1.2 GB) superan la VRAM de la mayoria de tarjetas, por lo que ComfyUI los mantiene en RAM y los transmite por partes.
- **Disco**: aproximadamente 38 GB libres en SSD.
- **GPU recomendadas**:
  - 8 GB: RTX 3060, RTX 4060, RTX 3070 (con limitaciones de velocidad).
  - 12 GB: RTX 4070, RTX 3060 12 GB.
  - 16 GB+: RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 5070 Ti, A100, H100.
- **Opciones de despliegue**: ComfyUI (version reciente, con nodos MiniMax H3 integrados, sin nodos personalizados). No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de difusion, no un LLM.
- **Latencia y throughput**: segun la tabla anterior, aproximadamente 60-66 segundos por imagen de 16 MP en una RTX 5070 Ti con VRAM limitada; 4.4-5.7 segundos por paso. Para 4 imagenes de referencia a 16 MP en 8 GB: 228 segundos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. MiniMax H3 Image es un modelo de difusion para texto-a-imagen y edicion; alternativas como Stable Diffusion 3, FLUX.1 o DALL-E 3 no se mencionan en la model card, por lo que no se puede establecer una comparativa con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax H3 Image (via este workflow) | no disponible | no disponible | Apache 2.0 | Hugging Face (Comfy-Org) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos especificos en la model card. Al ser un modelo de difusion entrenado con datos no especificados, es probable que herede sesgos de genero, raza y cultura, pero no hay informacion confirmada.
- **Riesgo de alucinacion**: en generacion de imagenes, el riesgo se traduce en artefactos visuales, incoherencias anatomicas (manos, cuerpo) o texto mal renderizado. La guia de prompts incluye correcciones para problemas comunes, lo que sugiere que estos ocurren.
- **Limitaciones de contexto o idioma**: no se especifican idiomas soportados. El text encoder es Qwen3-VL 32B, que probablemente soporta multiples idiomas, pero no se confirma. La guia de prompts esta en ingles.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo subyacente (MiniMax H3 Image) se distribuye desde Comfy-Org; se debe verificar la licencia del modelo original, ya que la model card solo indica Apache 2.0 para el repositorio de workflows.
- **Caveats para produccion**:
  - Requiere 24 GB de RAM como minimo; en sistemas con menos RAM el streaming fallara.
  - El upsampler de prompts (Qwen3.5 9B) esta desactivado en la version de 8 GB por ralentizar excesivamente la generacion.
  - Los tiempos de render medidos son en una RTX 5070 Ti; tarjetas mas antiguas o con menos VRAM seran mas lentas.
  - El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
  - No se incluyen los pesos del modelo en el repositorio (solo workflows); es necesario descargar 38 GB adicionales desde Comfy-Org.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/taurusduan/minimax-h3-image-comfyui-workflows)
- [Modelo oficial MiniMax H3 Image en Comfy-Org](https://huggingface.co/Comfy-Org/MiniMax-H3-Image)
- [Guia de prompts (MINIMAX_H3_IMAGE_PROMPT_GUIDE.md)](https://huggingface.co/taurusduan/minimax-h3-image-comfyui-workflows/blob/main/MINIMAX_H3_IMAGE_PROMPT_GUIDE.md)
- [Carpeta de ejemplos](https://huggingface.co/vyrekai/minimax-h3-image-comfyui-workflows/tree/main/examples) (el enlace de la model card apunta a otro usuario; se desconoce si es correcto)
