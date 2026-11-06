# TracerUst/Moss-image-nsfw-uncensored-lora

## Resumen

Moss-image-nsfw-uncensored-lora es un adaptador LoRA para generación de imagen a partir de texto, publicado por el usuario TracerUst sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Se trata de un ajuste fino de bajo rango orientado a la generación de contenido para adultos sin censura, activado mediante el token de instancia `moss_xvstyle`. El repositorio se distribuye con licencia Apache 2.0 y formato de pesos safetensors compatible con la librería diffusers.

El modelo resuelve un problema muy concreto: los modelos de difusión de propósito general suelen incorporar filtros o sesgos de entrenamiento que limitan la representación explícita del cuerpo humano. Este LoRA desplaza la distribución del modelo base hacia la fotografía realista de desnudos y contenido sexual explícito, manteniendo la arquitectura y el pipeline text-to-image del modelo original.

Su relevancia es limitada y de nicho: se publicó en noviembre de 2026, no registra descargas ni interacciones en el momento de la consulta y el repositorio ocupa 27,6 GB, un tamaño desproporcionado para un adaptador LoRA típico, lo que sugiere que puede incluir pesos adicionales o checkpoints intermedios. No se dispone de información sobre el proceso de entrenamiento, el dataset utilizado ni evaluaciones cuantitativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión text-to-image MOSS-Image-SFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; la ventana de texto depende del codificador del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El adaptador se construye sobre OpenMOSS-Team/MOSS-Image-SFT, un modelo de difusión para generación de imágenes a partir de texto. El LoRA introduce matrices de bajo rango en las capas del modelo base para especializar la generación hacia contenido para adultos, sin modificar la arquitectura subyacente. El token de activación es `moss_xvstyle`, que debe incluirse al inicio del prompt para que el adaptador influya en la generación.

No se dispone de información sobre el número de pasos de entrenamiento, el tamaño o la composición del dataset, la resolución de entrenamiento, el rango del LoRA ni la técnica de ajuste empleada (por ejemplo, si se usó DreamBooth, fine-tuning supervisado o preferencias). Tampoco se documenta si se aplicaron técnicas de regularización o de preservación de capacidades del modelo base. El tamaño del repositorio (27,6 GB) es notablemente superior al de un LoRA convencional y no se explica en la model card.

## Capacidades

- Generación de imágenes fotorrealistas de personas adultas en escenarios explícitos, activada mediante el token `moss_xvstyle`.
- Control de composición mediante prompts descriptivos detallados: pose, encuadre, iluminación, entorno y características físicas.
- Especialización en fotografía de desnudo y contenido sexual explícito, incluyendo primeros planos y planos de cuerpo completo.
- Capacidad de seguir instrucciones de estilo fotográfico (luz natural, luz de estudio, profundidad de campo, textura de piel).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto.
- Capacidades multilingües: no disponibles; dependen del codificador de texto del modelo base.
- No se documenta soporte de visión, audio ni modo de razonamiento.

## Casos de uso

- Generación de fotografía artística de desnudo: el adaptador permite producir imágenes con composiciones controladas (encuadre, pose, iluminación) para proyectos de fotografía conceptual o editorial, usando prompts detallados que aprovechan la especialización del LoRA.
- Ilustración para narrativa adulta: útil para crear material visual coherente con guiones o relatos eróticos, manteniendo un estilo fotográfico realista y control sobre la escena mediante el prompt.
- Prototipado de contenido para plataformas de suscripción para adultos: permite generar borradores visuales antes de una producción fotográfica real, reduciendo costes de preproducción.
- Investigación sobre sesgos y seguridad en modelos generativos: sirve como caso de estudio de adaptadores que eluden filtros de contenido, útil para diseñar mecanismos de moderación y detección.
- Pruebas de pipelines de moderación de contenido: al generar imágenes explícitas de forma controlada, se puede evaluar la eficacia de clasificadores NSFW y sistemas de filtrado.
- Experimentación con LoRA en modelos de difusión: permite estudiar cómo un adaptador de bajo rango modifica la distribución de salida de un modelo base y qué parámetros de escala producen mejores resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; depende del modelo base MOSS-Image-SFT. Un modelo de difusión de imagen de tamaño típico requiere entre 8 y 24 GB de VRAM según resolución y precisión (fp16/bf16).
- GPU recomendadas: no disponibles de forma específica. Para modelos de difusión de imagen se suelen emplear RTX 3090, RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: probable en GPUs con al menos 8-12 GB de VRAM si el modelo base cabe en memoria, aunque no está confirmado.
- Opciones de despliegue: diffusers (librería declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moss-image-nsfw-uncensored-lora | LoRA sobre MOSS-Image-SFT | no disponible | no disponible | Apache 2.0 | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base text-to-image | no disponible | no disponible | no disponible | Hugging Face |
| Adaptadores LoRA NSFW para SDXL | LoRA sobre SDXL | no disponible | no disponible | variable | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material sexual explícito; su uso requiere verificar la legalidad en la jurisdicción del usuario y cumplir las políticas de las plataformas de despliegue.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, artefactos en manos y cuerpos, o composiciones incoherentes con el prompt.
- Sesgos: no se documenta la composición del dataset; es probable que el adaptador herede sesgos del modelo base en cuanto a etnia, tipo corporal, edad aparente y género.
- Idiomas: no se especifican; el rendimiento en prompts en castellano no está garantizado y depende del codificador de texto del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales adicionales según la jurisdicción.
- Falta de documentación: no hay información sobre el proceso de entrenamiento, el dataset ni evaluaciones, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Tamaño del repositorio: 27,6 GB es inusualmente grande para un LoRA; conviene verificar qué contiene antes de descargarlo.
- Sin métricas de calidad: no hay benchmarks ni evaluaciones humanas publicadas.
- Restricción de edad: el contenido está marcado como no apto para todos los públicos; debe restringirse a usuarios adultos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TracerUst/Moss-image-nsfw-uncensored-lora
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Librería diffusers: https://github.com/huggingface/diffusers
