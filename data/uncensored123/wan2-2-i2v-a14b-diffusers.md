# uncensored123/Wan2.2-I2V-A14B-Diffusers

## Resumen

Wan2.2-I2V-A14B es un modelo de difusión para generación de vídeo a partir de una imagen (image-to-video, I2V) desarrollado por el equipo Wan del grupo Alibaba. Esta ficha corresponde a la réplica publicada por el usuario `uncensored123` en Hugging Face, que redistribuye los pesos originales en formato Diffusers bajo la misma licencia Apache 2.0. El modelo forma parte de la familia Wan2.2, una actualización de los modelos fundacionales de vídeo Wan2.1 presentada en julio de 2025.

La innovación principal de la familia es la incorporación de una arquitectura de mezcla de expertos (MoE) al proceso de difusión de vídeo: el proceso de eliminación de ruido se reparte entre expertos especializados según el paso temporal, lo que amplía la capacidad total del modelo sin incrementar el coste computacional de inferencia. El modelo soporta resoluciones de 480P y 720P y está diseñado para generar movimientos de cámara más estables y menor deriva no realista que su predecesor, además de mejorar la coherencia en escenas estilizadas.

El checkpoint contiene 14.288.901.184 parámetros en safetensors y el repositorio ocupa aproximadamente 126,2 GB. Está pensado para integración vía la librería `diffusers` mediante el pipeline `WanImageToVideoPipeline`, y también cuenta con soporte en ComfyUI. Es relevante para desarrolladores que necesitan un generador I2V abierto, con licencia permisiva y pesos reproducibles, en un momento en el que la mayoría de modelos de vídeo de calidad comparable son propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo con mezcla de expertos (MoE) sobre transformer; VAE con compresión 16×16×4 en la variante TI2V-5B |
| Parametros totales | 14.288.901.184 |
| Parametros activos | no disponible (el número de expertos activos por paso no se detalla en la información proporcionada) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la ventana viene determinada por la longitud de vídeo generado, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (integración Diffusers) |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B es un modelo de difusión para vídeo construido sobre una arquitectura transformer con mezcla de expertos. La idea central del diseño MoE en difusión es separar el proceso de eliminación de ruido a lo largo de los pasos temporales y asignar expertos especializados a distintas fases del proceso. Esto permite aumentar la capacidad total del modelo (los 14,3 mil millones de parámetros del checkpoint) manteniendo un coste computacional por paso comparable al de un modelo denso más pequeño. La familia incluye además una variante TI2V-5B con un VAE de alta compresión (16×16×4) capaz de generar 720P a 24 fps en GPUs de consumo como la RTX 4090; esa variante es distinta de este checkpoint I2V-A14B.

En cuanto a los datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un volumen significativamente mayor que Wan2.1: un 65,6 % más de imágenes y un 83,2 % más de vídeos. También se incorporaron datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. No se detalla en la información disponible el número exacto de tokens o clips de vídeo, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de difusión). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal para este checkpoint concreto.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) en resoluciones de 480P y 720P.
- Generación de movimientos complejos con mayor generalización en movimiento, semántica y estética respecto a Wan2.1.
- Control de estilo cinematográfico mediante datos estéticos etiquetados (iluminación, composición, contraste, tono).
- Mejora en la estabilidad del vídeo generado, con reducción de movimientos de cámara no realistas.
- Soporte para escenas estilizadas y diversos estilos visuales.
- Integración con la librería `diffusers` mediante `WanImageToVideoPipeline`.
- Integración con ComfyUI para flujos de trabajo visuales.
- Soporte de inferencia multi-GPU en el código de referencia del repositorio oficial.
- Capacidades multilingües limitadas a inglés y chino en las indicaciones textuales.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio o modo thinking, que no aplican a un modelo de difusión de vídeo.

## Casos de uso

- Animación de imágenes fijas para publicidad: a partir de una fotografía de producto se genera un clip de vídeo con movimiento de cámara controlado, adecuado para anuncios cortos en redes sociales, gracias al soporte de 480P y 720P y a la mejora en estabilidad de cámara.
- Previsualización de storyboards en producción audiovisual: los equipos de dirección pueden convertir fotogramas clave en clips animados para validar encuadres y ritmo antes del rodaje, usando el control de estilo cinematográfico del modelo.
- Creación de contenido para redes sociales: generación de vídeos cortos animados a partir de ilustraciones o fotografías, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones de atribución adicionales.
- Prototipado en investigación de modelos generativos de vídeo: el checkpoint en formato Diffusers permite reproducir experimentos y comparar arquitecturas MoE en difusión frente a alternativas densas, con pesos abiertos y trazabilidad del paper asociado.
- Animación de personajes y escenas estilizadas: el modelo está entrenado para mejorar la coherencia en escenas con estilos no fotorrealistas, lo que resulta útil en videojuegos indie, cómics animados y contenido de animación.
- Enriquecimiento de catálogos de e-commerce: animar imágenes de producto en fichas de tienda online para aumentar la conversión, desplegando el modelo en infraestructura propia con GPUs de datacenter.
- Integración en pipelines de ComfyUI para artistas técnicos: encadenar el modelo I2V con otros nodos de posprocesado, upscaling o control de estilo dentro de un flujo visual, sin necesidad de escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que Wan2.2 alcanza "TOP performance among all open-sourced and closed-sourced models" en generación de movimiento complejo, pero no se aportan cifras concretas (VBench, FVD, CLIP score u otras métricas) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El checkpoint completo en safetensors ocupa aproximadamente 126,2 GB en disco, lo que da una idea del orden de magnitud de los pesos; la inferencia en precisión completa requiere múltiples GPUs de datacenter.
- GPU recomendadas: el repositorio oficial incluye código de inferencia multi-GPU para el modelo A14B, lo que sugiere despliegue en A100, H100 o GPUs de 80 GB en configuraciones múltiples. No se especifican requisitos mínimos exactos.
- GPU de consumo: la model card menciona que la variante TI2V-5B (no este checkpoint) puede ejecutarse en una RTX 4090. Para el I2V-A14B no se confirma que quepa en GPUs de consumo.
- Opciones de despliegue: `diffusers` con `WanImageToVideoPipeline`, ComfyUI, y el código de inferencia del repositorio oficial `Wan-Video/Wan2.2` (con dependencia de `torch >= 2.4.0` y `flash_attn`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-I2V-A14B (esta ficha) | 14.288.901.184 | 480P y 720P, I2V | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-T2V-A14B | no disponible | 480P y 720P, T2V | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-TI2V-5B | no disponible | 720P a 24 fps, T2V+I2V | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.1 (predecesor) | no disponible | no disponible | no disponible | GitHub Wan-Video/Wan2.1 |

No se dispone en la información proporcionada de datos de rendimiento comparativo (métricas) entre estas variantes ni con modelos de otros desarrolladores, por lo que la comparativa se limita a parámetros, resolución, licencia y canales de distribución.

## Limitaciones y advertencias

- Este repositorio es una réplica no oficial publicada por el usuario `uncensored123`; no es el repositorio canónico de Wan-AI. Se recomienda verificar la integridad de los pesos frente al original antes de usarlos en producción.
- La model card no documenta sesgos específicos, pero al ser un modelo entrenado con datos web a gran escala es probable que herede sesgos de representación demográficos y culturales; no se aportan análisis al respecto.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o movimientos físicamente implausibles, especialmente en escenas complejas o con muchos objetos.
- Idiomas soportados limitados a inglés y chino para las indicaciones textuales; no se garantiza un rendimiento equivalente en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir las condiciones de la licencia y verificar que los pesos redistribuidos no incorporan material con restricciones adicionales.
- No se especifican límites de longitud de vídeo, resolución máxima más allá de 720P, ni requisitos de VRAM exactos, lo que dificulta la planificación de capacidad en producción.
- El tamaño del repositorio (126,2 GB) y la necesidad de inferencia multi-GPU implican costes de almacenamiento y computación significativos.
- No se documentan mecanismos de filtrado de contenido ni salvaguardas en la información disponible; el despliegue público requeriría moderación adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/uncensored123/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Repositorio oficial I2V-A14B en Diffusers: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial T2V-A14B en Diffusers: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Repositorio oficial TI2V-5B en Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.2
- Repositorio GitHub Wan2.1: https://github.com/Wan-Video/Wan2.1
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog oficial: https://wan.video/welcome
- Sitio oficial: https://wan.video
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Documentación ComfyUI (EN): https://docs.comfy.org/tutorials/video/wan/wan2_2
- Documentación ComfyUI (CN): https://docs.comfy.org/zh-CN/tutorials/video/wan/wan2_2
- Discord: https://discord.gg/AKNgpMK4Yj
