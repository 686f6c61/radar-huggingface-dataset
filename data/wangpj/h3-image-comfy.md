# wangpj/H3-image-comfy

## Resumen

`wangpj/H3-image-comfy` es un repositorio de redistribución (repackaging) del modelo de difusión texto-a-imagen MiniMax H3 Image, preparado específicamente para su uso en ComfyUI. Lo publica el usuario wangpj y no introduce un modelo nuevo: empaqueta los pesos del modelo original de MiniMaxAI en archivos únicos (`diffusion-single-file`) con cuantizaciones concretas (int8, nvfp4/awq, fp16) y una estructura de carpetas pensada para el nodo de carga de ComfyUI. El modelo base es `MiniMaxAI/MiniMax-H3-Image`, un generador texto-a-imagen de la familia MiniMax H3.

La relevancia de este repositorio es práctica: el repo original pesa cientos de gigabytes y está pensado para pipelines propietarios o de investigación, mientras que esta versión ofrece pesos ya divididos por rol (modelo de difusión, text encoders, VAE) y cuantizados para reducir requisitos de VRAM en GPUs de consumo. Incluye además dos text encoders alternativos basados en Qwen3-VL de 32B (int8 y nvfp4-awq), lo que sugiere que el modelo original usa un encoder multimodal de gran tamaño para el condicionamiento textual.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, no incluye benchmarks, no declara idiomas soportados y la model card se limita a instrucciones de instalación. La licencia es la MiniMax H3 Image Community License, distinta de la licencia general de MiniMax H3 y con umbral de facturación para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión texto-a-imagen (detalles de la arquitectura no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (convrot), nvfp4 + awq, fp16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base MiniMax H3 Image en la documentación proporcionada. Los artefactos del repositorio permiten inferir algunos componentes: un modelo de difusión principal (`minimax_h3_image_pruned_int8_convrot.safetensors`, es decir, una versión podada y cuantizada a int8), un VAE en fp16 para la decodificación latente a píxeles, y text encoders basados en Qwen3-VL de 32B de parámetros en dos variantes (int8 y nvfp4 con AWQ). El uso de un encoder de 32B con componente de visión (VL) sugiere condicionamiento textual de alta capacidad, aunque no se especifica si el pipeline admite entrada de imagen.

Tampoco hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card solo menciona un recomendador de prompts (`qwen3.5_9b_w4a8_gptq`) para mejorar las descripciones de entrada mediante el nodo Generate Text de ComfyUI, lo que indica que el modelo se beneficia de prompts largos y detallados.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`).
- Condicionamiento mediante un text encoder Qwen3-VL de 32B, lo que permite prompts complejos y potencialmente multilingües (no confirmado).
- Integración nativa con ComfyUI mediante archivos single-file y estructura de carpetas predefinida.
- Soporte de cuantizaciones para reducir huella de VRAM: int8 para el modelo de difusión, nvfp4/awq e int8 para los encoders.
- Mejora de prompts recomendada mediante un LLM auxiliar (Qwen3.5 9B en w4a8 GPTQ).
- No se documentan capacidades de edición de imagen, inpainting, controlnet ni generación de vídeo en la información disponible.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite crear conceptos visuales rápidos a partir de descripciones textuales dentro de un flujo ComfyUI, útil para equipos de diseño que iteran sobre ideas antes de producir assets finales.
- Creación de assets para videojuegos y entornos 3D: generación de texturas, fondos y concept art en lotes mediante grafos de ComfyUI, aprovechando la cuantización int8 para ejecutar en GPUs de gama alta de consumo.
- Marketing y contenido para redes sociales: generación de imágenes promocionales a partir de briefs textuales, con la posibilidad de encadenar el modelo con el enhancer de prompts recomendado para obtener descripciones más ricas.
- Automatización de pipelines creativos: al ser un archivo single-file compatible con ComfyUI, se puede integrar en flujos automatizados con nodos de batch, control de semilla y postprocesado, reduciendo la intervención manual.
- Investigación en modelos de difusión: el repositorio facilita experimentar con distintas cuantizaciones (int8, nvfp4-awq) del mismo modelo para estudiar el impacto en calidad y velocidad sin necesidad de descargar el repo original completo.
- Despliegue en estaciones de trabajo con VRAM limitada: las variantes cuantizadas permiten ejecutar el modelo en configuraciones que no podrían cargar los pesos originales en fp16/bf16, ampliando el acceso a equipos con una o dos GPUs de consumo.
- Generación de material visual para documentación técnica o educativa: imágenes de apoyo para tutoriales y presentaciones generadas localmente, evitando dependencias de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 125,1 GB, por lo que se necesita espacio en disco suficiente para descargar todos los artefactos antes de seleccionar los que se vayan a usar.
- El modelo de difusión se distribuye en int8 podado (`minimax_h3_image_pruned_int8_convrot.safetensors`); el tamaño exacto del archivo no está disponible en la información proporcionada.
- Los text encoders Qwen3-VL de 32B en int8 y nvfp4-awq requieren VRAM considerable; un encoder de 32B en int8 ronda decenas de GB, aunque el valor exacto no está disponible.
- El VAE en fp16 es ligero en comparación con el resto de componentes.
- No se especifican GPUs recomendadas ni mínimas en la documentación. Por el tamaño del encoder y del modelo de difusión, es probable que se necesiten GPUs de datacenter (A100, H100) o GPUs de consumo de gama alta con 24 GB o más, pero esto no está confirmado.
- Opciones de despliegue: ComfyUI es el entorno objetivo declarado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo en el contexto del repositorio).
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wangpj/H3-image-comfy (MiniMax H3 Image) | no disponible | no disponible | MiniMax H3 Image Community License | Hugging Face, single-file para ComfyUI | Repackaging con cuantizaciones int8/nvfp4/fp16 |
| MiniMaxAI/MiniMax-H3-Image (original) | no disponible | no disponible | MiniMax H3 Image Community License | Hugging Face | Repo original, sin repackaging para ComfyUI |
| Otros modelos texto-a-imagen de gran escala | no disponible | no disponible | varía | varía | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La información pública es mínima: no hay benchmarks, ni especificaciones de arquitectura, ni idiomas declarados, lo que dificulta evaluar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-11), por lo que no hay evidencia de uso comunitario ni validación externa.
- Es un repackaging de terceros (usuario wangpj), no una publicación oficial de MiniMaxAI; la integridad y fidelidad de los pesos respecto al original no están verificadas en la documentación.
- La licencia MiniMax H3 Image Community License exige autorización previa por escrito de MiniMax si los ingresos anualizados del usuario o sus afiliados superan 1 millón de USD, o si se ofrece el modelo como servicio alojado a terceros. Esto limita el uso comercial a gran escala y el SaaS.
- Riesgo de alucinación visual y sesgos: no hay documentación sobre sesgos demográficos, estéticos o culturales del modelo base; en modelos de difusión de gran escala es habitual encontrar sesgos en la representación de personas y culturas.
- No se documentan limitaciones de contexto ni de idioma, pero el uso de un text encoder Qwen3-VL sugiere que el rendimiento puede variar según el idioma del prompt.
- El tamaño del repositorio (125,1 GB) y la necesidad de encoders de 32B implican requisitos de hardware elevados y tiempos de descarga considerables.
- No hay garantías de soporte ni mantenimiento por parte del autor del repackaging.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wangpj/H3-image-comfy
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Solicitud de autorización comercial de MiniMax: https://platform.minimax.io/license
