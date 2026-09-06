# UntMods/Krea2_Chars_LoRA

## Resumen

Esta es una colección de 34 LoRAs de personajes para el modelo base KREA2, desarrollada por UntMods. Cada LoRA está diseñado para reproducir la semejanza facial de una persona concreta y se acompaña de un archivo de persona en formato Markdown que describe sus rasgos estables, apariencia variable y expresiones. El repositorio se publicó en Hugging Face bajo licencia Apache-2.0 y ocupa 7,9 GB.

La relevancia de este proyecto radica en su pipeline de producción completamente automatizada: scraping de imágenes, detección y recorte de rostros con Ultralytics YOLO, filtrado estético mediante un discriminador basado en ERNIE, captioning con Gemma-4 26B (abliterated) vision MTP y entrenamiento de LoRAs con Ostris AI-Toolkit en pods de RunPod. Todo el proceso fue orquestado por un agente autónomo (Hermes Agent, servido por Kimi K3) sin intervención humana, lo que demuestra la viabilidad de pipelines de generación de datos y entrenamiento sin supervisión manual.

Arquitectónicamente, se trata de adaptadores LoRA aplicados sobre KREA2, un modelo de text-to-image. No se especifica el tamaño del modelo base ni la longitud de contexto, ya que es un modelo de generación de imágenes y no un modelo de lenguaje. Los pesos se distribuyen como archivos safetensors, uno por personaje, listos para cargar en ComfyUI o cualquier pipeline compatible con KREA2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre KREA2 (modelo base de text-to-image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de text-to-image) |
| Tipos de cuantizacion | no disponible (pesos en formato safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no especificado en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivos `<Nombre>_KREA2.safetensors`) y archivos de persona `.md` |

## Arquitectura y entrenamiento

La colección se compone de 34 LoRAs independientes, cada uno entrenado para capturar la identidad facial de un personaje específico. El entrenamiento se realizó con Ostris AI-Toolkit sobre el modelo base KREA2, utilizando pods de RunPod aprovisionados y monitorizados automáticamente. No se especifica el número de tokens ni la composición exacta del dataset, pero la model card describe el proceso de construcción: recolección de imágenes desde pools web, detección y recorte de rostros con Ultralytics YOLO, filtrado de contenido (rechazo de imágenes generadas por IA, sujetos incorrectos y baja nitidez) y una fase de gating estético donde cada imagen candidata es puntuada por un discriminador basado en ERNIE, rechazando automáticamente las que no superan un umbral.

Las imágenes supervivientes se etiquetaron con Gemma-4 26B (abliterated) vision MTP, generando descripciones detalladas y sin restricciones. A partir de estas descripciones, un agente sintetizó los archivos de persona `.md` que acompañan a cada LoRA, documentando rasgos faciales estables, rango de expresiones y estilo habitual. La innovación principal no es la arquitectura del LoRA en sí, sino la automatización completa del pipeline: scraping, curado, etiquetado, entrenamiento y publicación fueron ejecutados por un agente autónomo sin pasos de revisión manual.

## Capacidades

- Generación de imágenes de personajes específicos con alta fidelidad facial (likeness) sobre el modelo base KREA2.
- Cada LoRA incluye un archivo `.md` con la descripción de la persona: rasgos faciales estables, apariencia variable y expresiones.
- Compatible con ComfyUI y cualquier pipeline que acepte LoRAs sobre KREA2.
- Integración con CRT-Nodes: el nodo "Seeded Persona LoRA Loader (CRT)" carga simultáneamente el LoRA y su archivo `.md`, devolviendo el modelo parcheado y el texto de persona como salida `STRING`, listo para alimentar un LLM de mejora de prompts.
- El mismo paquete CRT-Nodes incluye "ERNIE Image Aesthetic Score (CRT)", el mismo discriminador usado para el gating, empaquetado como nodo de ComfyUI con descarga automática de modelos.
- Fuerza del LoRA ajustable; el autor recomienda un valor en torno a 1.0.
- No soporta tool calling, ni agentes, ni procesamiento multimodal más allá de text-to-image.
- Idiomas de los prompts: no especificado; depende del modelo base KREA2.

## Casos de uso

- Desarrollo de personajes para novelas visuales o cómics: los LoRAs permiten mantener la coherencia facial de un personaje a lo largo de múltiples ilustraciones, usando el archivo `.md` como referencia para el prompt enhancer.
- Prototipado de concept art: generar variaciones de un personaje cambiando el estilo, la iluminación o el encuadre, manteniendo la identidad facial gracias al LoRA.
- Entrenamiento de modelos de mejora de prompts: los archivos `.md` pueden usarse como ground truth para ajustar un LLM que genere prompts consistentes con la identidad del personaje.
- Curaduría de datasets propios: el nodo ERNIE Image Aesthetic Score permite filtrar imágenes por calidad estética con el mismo estándar usado en la creación de esta colección.
- Investigación en generación de imágenes: estudiar cómo los LoRAs capturan la identidad facial y cómo varía la likeness según la fuerza del adaptador o el sampler.
- Automatización de flujos de producción en ComfyUI: integrar el Seeded Persona LoRA Loader en un grafo para generar imágenes en lote con prompts enriquecidos automáticamente a partir del archivo `.md`.
- Análisis de identidad en modelos generativos: comparar la fidelidad de los LoRAs frente a otros métodos de personalización, como embeddings textuales o fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser LoRAs, el requisito adicional es mínimo, pero depende del modelo base KREA2, cuyo tamaño no se especifica.
- GPU recomendadas: no disponible.
- ¿Cabe en consumer GPU? No se puede determinar sin conocer los requisitos de KREA2.
- Opciones de despliegue: ComfyUI (recomendado), cualquier pipeline compatible con KREA2, y CRT-Nodes para la carga combinada de LoRA y persona.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Los LoRAs reproducen la semejanza de personas reales. El autor advierte explícitamente que no se debe crear contenido engañoso, dañino o no consensuado, y que el usuario asume la responsabilidad de lo que genere.
- La pipeline fue totalmente automatizada sin revisión manual, por lo que pueden existir errores en el dataset, en el curado o en el entrenamiento.
- Entrenados para likeness; la flexibilidad de estilo depende del prompt y de los ajustes del sampler.
- No se especifican datos sobre sesgos. Al basarse en imágenes extraídas de la web, es probable que existan sesgos de representación y de calidad.
- La licencia Apache-2.0 permite uso comercial, pero el autor indica que los pesos se comparten para investigación y fines creativos, y pide un uso responsable.
- No hay información sobre limitaciones de idioma o contexto, al tratarse de un modelo de text-to-image.

## Enlaces

- Hugging Face: https://huggingface.co/UntMods/Krea2_Chars_LoRA
- CRT-Nodes: https://github.com/PGCRT/CRT-Nodes
- Hermes Agent (Nous Research): https://hermes-agent.nousresearch.com
- Ostris AI-Toolkit: https://github.com/ostris/ai-toolkit
- Discord del autor: https://discord.gg/uV6ZNgg33j
