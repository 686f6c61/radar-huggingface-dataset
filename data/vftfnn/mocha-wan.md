# vftfnn/mocha-wan

## Resumen

Mocha-Wan es un repositorio de pesos en formato de archivo unico para difusion de video, publicado por el usuario vftfnn en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una recopilacion de modelos combinados y cuantizados del ecosistema WanVideo de Alibaba, derivados especificamente de Wan-AI/Wan2.1-VACE-14B y Wan-AI/Wan2.1-VACE-1.3B. Su proposito es facilitar el uso de estos modelos de generacion y edicion de video dentro de ComfyUI, tanto con los nodos nativos de WanVideo como con el wrapper de kijai (ComfyUI-WanVideoWrapper).

El repositorio agrupa variantes y destilaciones de la familia Wan 2.1 (texto-a-video, imagen-a-video y VACE para edicion y control de video), junto con LoRAs experimentales extraidas de los finetunes CausVid. Estas LoRAs buscan aprovechar la destilacion de CausVid para reducir pasos de inferencia, aunque el autor advierte que las versiones v1 introducen artefactos de parpadeo y afectan al movimiento.

Es relevante para desarrolladores que trabajan con pipelines de video generativo en local, ya que concentra en un solo repositorio pesos listos para cargar en ComfyUI, con variantes cuantizadas (incluido fp8_scaled en un repositorio paralelo de kijai). El tamano del repositorio, 1522,9 GB, refleja que contiene multiples variantes de gran peso. La informacion publica disponible es escasa: no hay model card descriptiva, ni benchmarks, ni licencia declarada en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion para video (familia Wan 2.1, incluye VACE); detalles no disponibles |
| Parametros totales | variantes de 1.3B y 14B (segun modelos base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusion de video, no aplica contexto de texto) |
| Tipos de cuantizacion | pesos combinados y cuantizados; variantes fp8_scaled en repositorio paralelo de kijai; detalles por archivo no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | archivos unicos para difusion (diffusion-single-file), compatibles con ComfyUI |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura propia ni entrenamiento original: agrega pesos derivados de Wan2.1-VACE en sus variantes de 1.3B y 14B, modelos de difusion para generacion y edicion de video de Alibaba. VACE aporta control y edicion sobre el video generado, mientras que las variantes T2V e I2V de Wan 2.1 cubren texto-a-video e imagen-a-video. El autor tambien referencia TinyVAE (taehv) como VAE ligero y diversas fuentes de finetunes y destilaciones (SkyReels, WanVideoFun, Lightx2v, CausVid, AccVideo, Phantom, ATI, Pusa, FastVideo, Ovi, FlashVSR, entre otras).

La innovacion destacable del repositorio son las LoRAs CausVid experimentales, extraidas de los finetunes CausVid para aprovechar su destilacion (reduccion de pasos de muestreo) sin recurrir a inferencia causal real. El autor describe tres versiones: v1 (extraccion directa, con efectos adversos en el movimiento y parpadeo a fuerza completa), v1.5 (igual pero sin el primer bloque, lo que corrige el parpadeo) y v2 (version podada solo con capas de atencion y sin primer bloque, que corrige el parpadeo y conserva mejor el movimiento, aunque requiere mas pasos y puede beneficiarse de CFG). No se especifican volumenes de datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de video a partir de texto (T2V) mediante las variantes Wan 2.1.
- Generacion de video a partir de imagen (I2V).
- Edicion y control de video con VACE (variantes 1.3B y 14B).
- Reduccion de pasos de inferencia mediante destilaciones (CausVid, StepDistill/CfgDistill de Lightx2v).
- Integracion con ComfyUI mediante nodos nativos de WanVideo y el wrapper ComfyUI-WanVideoWrapper.
- Variantes de posprocesado y mejora: superresolucion de video (FlashVSR), eliminacion de objetos (MiniMaxRemover), talking heads (FantasyTalking, MultiTalk), animacion (Anisora) y motion transfer (MAGREF), segun las fuentes referenciadas.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de clips de video para prototipado creativo: cargar las variantes T2V en ComfyUI para producir borradores de escenas a partir de prompts de texto, aprovechando la variante de 1.3B para iteraciones rapidas en GPU de consumo.
- Edicion de video con control: usar las variantes VACE para modificar regiones o aplicar control sobre un video existente en flujos de posproduccion, con la variante 14B cuando se requiera mayor calidad.
- Imagen-a-video para marketing: animar fotografias de producto o ilustraciones con las variantes I2V, integrando el resultado en pipelines de generacion de contenido.
- Aceleracion de inferencia en produccion: aplicar las LoRAs CausVid v1.5 o v2 para reducir pasos de muestreo en servicios de generacion de video, asumiendo el compromiso entre velocidad y calidad descrito por el autor.
- Restauracion y mejora de video: combinar el ecosistema referenciado (FlashVSR) para superresolucion de material de baja calidad dentro de ComfyUI.
- Efectos de talking head: emplear FantasyTalking o MultiTalk para sincronizacion labial en avatares y videos corporativos.
- Eliminacion de objetos en video: usar MiniMaxRemover para limpiar escenas en tareas de edicion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; orientativamente, las variantes de 1.3B en fp8 pueden caber en GPU de consumo de 12-16 GB, mientras que las de 14B requieren 24 GB o mas, dependiendo de la cuantizacion y del VAE empleado.
- GPU recomendadas: RTX 4090 (24 GB) para variantes 1.3B y 14B cuantizadas; A100/H100 para las variantes 14B sin cuantizar o con lotes mayores.
- Cabe en GPU de consumo: si, las variantes 1.3B y las 14B cuantizadas en fp8, con margen limitado.
- Opciones de despliegue: ComfyUI (nodos nativos WanVideo y ComfyUI-WanVideoWrapper), con pesos en formato diffusion-single-file.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mocha-Wan | 1.3B y 14B (variantes) | difusion de video (Wan 2.1 VACE) | no aplica | no disponible | Hugging Face, ComfyUI |
| Wan-AI/Wan2.1-VACE | 1.3B y 14B | difusion de video con control | no aplica | no disponible en la informacion | Hugging Face oficial |
| Lightx2v CausVid | 1.3B y 14B | difusion de video destilada | no aplica | no disponible en la informacion | Hugging Face |
| SkyReels V2 | no disponible | difusion de video | no aplica | no disponible en la informacion | Hugging Face (coleccion Skywork) |

## Limitaciones y advertencias

- No es un modelo original: es una agregacion de pesos derivados de Wan 2.1; la calidad depende de los modelos base y de los finetunes referenciados.
- Las LoRAs CausVid v1 introducen artefactos de parpadeo y degradan el movimiento a fuerza completa; solo v1.5 y v2 corrigen el parpadeo, y v2 requiere mas pasos y puede necesitar CFG.
- Licencia no declarada en los metadatos: verificar los terminos de Wan-AI y de cada finetune referenciado antes de uso comercial.
- El repositorio ocupa 1522,9 GB; conviene descargar solo los archivos necesarios.
- Sin model card descriptiva ni benchmarks: el rendimiento real debe validarse en el entorno de despliegue.
- Riesgo de artefactos propios de la difusion de video (parpadeo temporal, incoherencias de movimiento) y de sesgos heredados de los datasets de entrenamiento de los modelos base, no documentados.
- Requiere ComfyUI y dependencias especificas; la integracion con otros frameworks no esta documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vftfnn/mocha-wan
- Modelo base VACE 14B: https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
- Modelo base VACE 1.3B: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Organizacion Wan-AI: https://huggingface.co/Wan-AI/
- Wrapper ComfyUI: https://github.com/kijai/ComfyUI-WanVideoWrapper
- Variantes fp8_scaled: https://huggingface.co/Kijai/WanVideo_comfy_fp8_scaled
- TinyVAE (taehv): https://github.com/madebyollin/taehv
- SkyReels V2: https://huggingface.co/collections/Skywork/skyreels-v2-6801b1b93df627d441d0d0d9
- WanVideoFun: https://huggingface.co/collections/alibaba-pai/wan21-fun-v11-680f514c89fe7b4df9d44f17
- CausVid 14B: https://huggingface.co/lightx2v/Wan2.1-T2V-14B-CausVid
- StepDistill/CfgDistill 14B: https://huggingface.co/lightx2v/Wan2.1-T2V-14B-StepDistill-CfgDistill
- CausVid 1.3B: https://huggingface.co/tianweiy/CausVid
- AccVideo: https://huggingface.co/aejion/AccVideo-WanX-T2V-14B
- Phantom: https://huggingface.co/bytedance-research/Phantom
- ATI: https://huggingface.co/bytedance-research/ATI
- MiniMaxRemover: https://huggingface.co/zibojia/minimax-remover
- MAGREF: https://huggingface.co/MAGREF-Video/MAGREF
- FantasyTalking: https://github.com/Fantasy-AMAP/fantasy-talking
- MultiTalk: https://github.com/MeiGen-AI/MultiTalk
- Anisora: https://huggingface.co/IndexTeam/Index-anisora/tree/main/14B
- Pusa: https://huggingface.co/RaphaelLiu/PusaV1/tree/main
- FastVideo: https://huggingface.co/FastVideo
- EchoShot: https://github.com/D2I-ai/EchoShot
- Wan2.2 TI2V 5B Turbo: https://huggingface.co/quanhaol/Wan2.2-TI2V-5B-Turbo
- Ovi: https://github.com/character-ai/Ovi
- FlashVSR: https://huggingface.co/JunhaoZhuang/FlashVSR
- rCM: https://huggingface.co/worstcoder/rcm-Wan/tree/main
