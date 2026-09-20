# unsloth/LTX-2.3-GGUF

## Resumen

LTX-2.3 es un modelo fundacional de generación de vídeo y audio desarrollado por Lightricks, presentado en el artículo "LTX-2: Efficient Joint Audio-Visual Foundation Model" (arXiv 2601.03233). A diferencia de los pipelines que encadenan un modelo de vídeo y otro de audio por separado, LTX-2.3 genera ambas modalidades de forma sincronizada dentro de un único modelo basado en arquitectura DiT (Diffusion Transformer). Con 21.005.004.544 parámetros (denominado comercialmente "22B"), se distribuye con pesos abiertos y está pensado para ejecución práctica en local.

La ficha que nos ocupa, `unsloth/LTX-2.3-GGUF`, no es el modelo original, sino la cuantización publicada por Unsloth sobre `Lightricks/LTX-2.3`. Unsloth aplica su metodología Dynamic 2.0, que upcastea a mayor precisión las capas consideradas críticas, y se apoya en las herramientas de ComfyUI-GGUF de city96 para producir los ficheros GGUF. El repositorio incluye dos familias de cuantizaciones: la del modelo `dev` (calidad máxima, requiere al menos 20 pasos de inferencia) y la del modelo `distilled` (optimizada para 4-8 pasos, útil como modelo de borrador o de refinado). El workflow publicado combina ambas, aplicando la LoRA destilada sobre el modelo dev para refinar la salida inicial.

Su relevancia actual es doble. Por un lado, lleva a hardware de consumo un modelo de generación conjunta de audio y vídeo que de otro modo exigiría VRAM muy superior. Por otro, su adopción ha sido notable: 302.899 descargas y 573 "likes" en HuggingFace desde su publicación el 5 de marzo de 2026. El coste de esa accesibilidad es un repositorio de 2952,3 GB que reúne todas las variantes cuantizadas y los componentes auxiliares (VAEs de vídeo y audio, conectores de embeddings, upscalers y el codificador de texto Gemma-3-12B).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de difusión para vídeo y audio conjuntos; modelo fundacional audio-visual |
| Parámetros totales | 21.005.004.544 (etiquetado como "22B" por el autor) |
| Parámetros activos | No aplica: no se describe como arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible (modelo de difusión; no se publica una ventana de contexto en el material disponible) |
| Tipos de cuantización | GGUF con metodología Unsloth Dynamic 2.0; se mencionan explícitamente los ficheros `-Q4_K_M` para el modelo dev y cuantizaciones del modelo distilled. No se detalla la lista completa de niveles Q2/Q3/Q5/Q6/Q8 en la información disponible |
| Idiomas soportados | 9: inglés (en), alemán (de), español (es), francés (fr), japonés (ja), coreano (ko), chino (zh), italiano (it), portugués (pt) |
| Licencia | LTX-2 Community License Agreement (identificador `other`); enlace: https://github.com/Lightricks/LTX-2/blob/main/LICENSE |
| Formato de pesos | GGUF (ggml) para el transformer de difusión y el codificador de texto; safetensors para VAE de vídeo, VAE de audio, conectores de embeddings, upscalers y LoRA destilada |

## Arquitectura y entrenamiento

LTX-2.3 es un modelo de difusión con backbone transformer (DiT) diseñado para generar vídeo y audio sincronizados en una sola pasada. El pipeline se compone de varios bloques: el transformer de difusión (publicado en GGUF en este repositorio), un VAE de vídeo, un VAE de audio, conectores de embeddings y un codificador de texto externo. En el workflow oficial de ComfyUI, ese codificador de texto es Gemma-3-12B en su variante QAT, también en GGUF, con su fichero `mmproj-BF16.gguf`, lo que permite ejecutar todo el sistema con memoria reducida.

El repositorio distribuye dos variantes con filosofías distintas. El modelo `dev` es el modelo completo, flexible y entrenable en bf16, que necesita al menos 20 pasos de difusión para dar su mejor resultado. El modelo `distilled` es una destilación de pasos (8 pasos, CFG=1) pensada para generación rápida y como modelo de borrador o refinado. Además se publica `ltx-2.3-22b-distilled-lora-384`, una LoRA destilada aplicable sobre el modelo completo, y tres upscalers sobre los latentes: espacial x2, espacial x1.5 y temporal x2, que permiten pipelines multietapa para subir resolución o FPS.

En cuanto al entrenamiento, la información disponible indica que LTX-2.3 es una actualización significativa de LTX-2 con mejor calidad de audio y vídeo y mayor adherencia al prompt. Sin embargo, no se especifican en el material proporcionado el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La innovación destacable de la publicación de Unsloth es de carácter práctico: la cuantización Dynamic 2.0, que sube a mayor precisión las capas sensibles en lugar de aplicar una precisión uniforme, con el objetivo de preservar calidad frente a una cuantización plana.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con salida de audio sincronizada.
- Generación de vídeo a partir de imagen (image-to-video), que es la tarea declarada del pipeline del repositorio.
- Generación condicionada por imagen y texto de forma conjunta (image-text-to-video).
- Vídeo a vídeo: transformación de un vídeo de entrada manteniendo estructura temporal.
- Audio a vídeo: uso de una pista de audio como condición para generar el vídeo correspondiente.
- Vídeo a audio y texto a audio: generación de la pista sonora asociada a una secuencia visual.
- Audio a audio: transformación de audio de entrada.
- Combinaciones multimodales completas: texto-audio-vídeo, imagen-a-audio-vídeo e imagen-texto-a-audio-vídeo.
- Modo de pocos pasos: la variante distilled permite generar con 4-8 pasos y CFG=1, frente a los 20 o más pasos del modelo dev.
- Pipelines multietapa: los upscalers espaciales x1.5 y x2 y el temporal x2 permiten aumentar resolución y FPS por etapas sobre los latentes.
- Multilingüismo en los prompts: 9 idiomas declarados (en, de, es, fr, ja, ko, zh, it, pt).
- No se documenta en la información disponible soporte de tool calling, function calling ni comportamiento de agente multi-paso; no es un modelo de lenguaje conversacional, sino un modelo generativo de medios.

## Casos de uso

- Previsualización de storyboards en publicidad y cine: a partir de un fotograma clave o de una imagen de concepto, el modelo genera un plano animado con audio, lo que permite validar ritmo y duración antes de rodar.
- Producción de contenido corto para redes sociales: el modelo distilled, con 4-8 pasos de inferencia, permite iterar rápido sobre varias versiones de un clip vertical con audio integrado sin salir del flujo de ComfyUI.
- Doblaje y localización audiovisual: la capacidad audio-a-vídeo y vídeo-a-audio permite regenerar la banda sonora de una secuencia o adaptar una locución a un plano existente, con los 9 idiomas declarados como punto de partida para prompts multilingües.
- Refinado de borradores en post-producción: el workflow oficial usa el modelo dev y aplica encima la LoRA destilada `ltx-2.3-22b-distilled-lora-384` para pulir una primera generación, lo que reduce el número de pasos necesarios para alcanzar calidad final en un pipeline interno de render.
- Restauración y re-estilizado de material existente mediante vídeo a vídeo: se toma un clip de archivo y se regenera con otro estilo visual o mayor definición, manteniendo la estructura de movimiento original.
- Escalado por etapas de material generado: partiendo de latentes a resolución baja, los upscalers espaciales x1.5 y x2 elevan la resolución y el upscaler temporal x2 duplica los FPS, un patrón útil para entregables que deben cumplir especificaciones de emisión.
- Generación de vídeo con audio en entornos con requisitos de privacidad: al ejecutarse en local sobre ComfyUI con pesos GGUF, permite procesar material sensible sin enviarlo a servicios en la nube.
- Investigación en modelos fundacionales audio-visuales: los pesos abiertos y la variante entrenable en bf16 permiten estudiar la arquitectura DiT conjunta publicada en arXiv 2601.03233, hacer ablaciones o entrenar LoRAs específicas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card proporcionada no incluye tablas comparativas de métricas (FVD, CLIPScore, sincronía audio-vídeo, etc.) y los resultados de la búsqueda web no contienen datos técnicos sobre el modelo. Existe un artículo asociado (arXiv 2601.03233) que presumiblemente contiene evaluaciones, pero su contenido no forma parte de la información suministrada, por lo que no se reproducen cifras.

## Requisitos de hardware

Nota: las cifras de VRAM que siguen son estimaciones derivadas del recuento de parámetros (21.005.004.544) y del formato GGUF; la información proporcionada no incluye requisitos oficiales de memoria ni mediciones de latencia o throughput.

- Solo el transformer de difusión en Q4_K_M (aproximadamente 4,8 bits por peso) ocupa del orden de 12-14 GB en disco y en VRAM, según el patrón habitual de las cuantizaciones K-quant para un modelo de ~21B.
- A esa cifra hay que sumar los componentes auxiliares del pipeline: VAE de vídeo, VAE de audio, conectores de embeddings, el codificador de texto Gemma-3-12B en GGUF y los upscalers si se usan en multietapa.
- El consumo real de VRAM es notablemente superior al tamaño de los pesos, porque los latentes de vídeo y audio y las operaciones de atención sobre la dimensión temporal escalan con el número de fotogramas y la resolución. Como referencia práctica, configuraciones cuantizadas en GPUs de 24 GB (RTX 3090, RTX 4090) son el límite bajo habitual para resoluciones y duraciones moderadas; para resoluciones altas o clips largos conviene disponer de 48 GB o más (A6000, L40S, A100 80 GB, H100).
- No cabe esperar ejecución fluida en GPUs de consumo de gama media con menos de 12 GB de VRAM para este modelo completo; las cuantizaciones más agresivas reducirían el peso pero no necesariamente el coste de los latentes.
- Despliegue: el camino documentado es ComfyUI con los nodos personalizados ComfyUI-GGUF (city96) y ComfyUI-KJNodes (kijai), instalados desde sus repositorios. El propio repositorio incluye un workflow embebido en un fichero MP4 que se puede abrir directamente en ComfyUI.
- Los servidores orientados a LLM (vLLM, TGI, Ollama, llama.cpp en modo chat) no son aplicables aquí: el formato GGUF se usa en este caso como contenedor de pesos para difusión, no para decodificación autorregresiva.
- El repositorio completo ocupa 2952,3 GB, de modo que en la práctica conviene descargar únicamente los ficheros concretos que necesite el workflow mediante el comando `hf download` con el nombre de fichero especificado.
- No hay datos disponibles de latencia o throughput medidos. Cualitativamente, el modelo dev necesita 20 pasos o más por generación, mientras que la variante distilled trabaja con 4-8 pasos y CFG=1, lo que reduce proporcionalmente el tiempo de inferencia a costa de calidad final.

## Comparativa con modelos similares

La información disponible permite comparar con fiabilidad únicamente las dos variantes publicadas por el propio proyecto. Para alternativas de otros autores no se dispone de especificaciones verificables en el material proporcionado, por lo que se marcan como no disponibles en lugar de estimarlas.

| Modelo | Parámetros | Contexto / duración | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unsloth/LTX-2.3-GGUF | 21.005.004.544 (cuantizado, GGUF) | No disponible | Texto, imagen, vídeo y audio en todas las combinaciones declaradas en las etiquetas | LTX-2 Community License Agreement | HuggingFace, 302.899 descargas, 573 likes |
| Lightricks/LTX-2.3 (modelo base) | Mismo recuento de parámetros, en bf16 | No disponible | Idénticas | LTX-2 Community License Agreement | HuggingFace, pesos abiertos |
| Lightricks/LTX-2 (generación anterior) | No disponible | No disponible | Vídeo y audio conjuntos (según la model card, LTX-2.3 mejora calidad audiovisual y adherencia al prompt) | No disponible en la información suministrada | HuggingFace |
| Alternativas de terceros (por ejemplo, otros modelos abiertos de vídeo con audio) | No disponible | No disponible | No disponible | No disponible | No verificado en la información disponible |

## Limitaciones y advertencias

- Licencia no estándar: se distribuye bajo LTX-2 Community License Agreement, no bajo una licencia de código abierto aprobada por la OSI. Antes de un uso comercial es imprescindible revisar los términos en https://github.com/Lightricks/LTX-2/blob/main/LICENSE.
- Pérdida de calidad por cuantización: al ser una versión GGUF, la fidelidad es inferior a la del modelo en bf16. Los artefactos suelen concentrarse en texto y tipografías dentro de la imagen, detalles finos y movimiento rápido.
- Coste de memoria elevado pese a la cuantización: los latentes de vídeo y audio dominan el consumo de VRAM, de modo que reducir los bits de los pesos no garantiza que el modelo quepa en una GPU modesta.
- Dependencia de un ecosistema concreto: el flujo documentado exige ComfyUI actualizado, ComfyUI-GGUF y ComfyUI-KJNodes. Versiones desactualizadas de estos nodos pueden romper el workflow.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo de vídeo, puede producir manos deformes, físicas incoherentes, objetos que aparecen o desaparecen y desincronía labial, especialmente en planos largos o con varias personas.
- Idiomas: se declaran 9 idiomas, pero la información disponible no especifica el nivel de calidad por idioma ni si el rendimiento en prompts largos y en generación de voz es homogéneo entre ellos.
- Sesgos: no se documenta en la información disponible la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o de representación.
- Ausencia de benchmarks públicos en el material disponible: no se pueden comparar cifras objetivas con alternativas, lo que dificulta justificar la elección del modelo con datos.
- Tamaño del repositorio: 2952,3 GB en total. Descargar el repositorio completo de forma ingenua es inviable en la mayoría de entornos; hay que seleccionar ficheros concretos.
- Dos variantes con compromisos distintos: usar el modelo dev con pocos pasos degrada la calidad, y usar el distilled con muchos pasos no aporta mejoras proporcionales. Elegir mal la variante para el caso de uso es un error frecuente.
- No es un modelo conversacional: no ofrece tool calling ni razonamiento multi-paso, por lo que no debe emplearse en tareas de agente o de texto general.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/unsloth/LTX-2.3-GGUF
- Modelo base original: https://huggingface.co/Lightricks/LTX-2.3
- Generación anterior (LTX-2): https://huggingface.co/Lightricks/LTX-2
- Artículo en HuggingFace Papers: https://huggingface.co/papers/2601.03233
- Artículo en arXiv: https://arxiv.org/abs/2601.03233
- Repositorio de código de Lightricks: https://github.com/Lightricks/LTX-2
- Licencia LTX-2 Community License Agreement: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- Demo oficial (image-to-video): https://app.ltx.studio/ltx-2-playground/i2v
- Vídeo de presentación: https://youtu.be/o-7us-BR_gQ
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- ComfyUI-KJNodes (kijai): https://github.com/kijai/ComfyUI-KJNodes
- Codificador de texto Gemma-3-12B QAT en GGUF: https://huggingface.co/unsloth/gemma-3-12b-it-qat-GGUF
- Documentación de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
