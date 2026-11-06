# ThinkMorph/ThinkMorph-SSL-Instruct

## Resumen

ThinkMorph-SSL-Instruct es un modelo multimodal unificado desarrollado por ThinkMorph que razona mediante trazas intercaladas de texto e imágenes generadas. Parte del modelo base ByteDance-Seed/BAGEL-7B-MoT y se entrena con la receta de dos etapas denominada PRIMER: una primera fase de preentrenamiento sobre Pretext-270K (270.896 trazas texto-imagen-texto sin instrucciones) y una segunda fase de instrucción sobre Instruct-181K (181.291 trazas intercaladas guiadas por preguntas). El resultado es un modelo any-to-any capaz de responder a preguntas visuales escribiendo texto y generando imágenes intermedias como parte del proceso de razonamiento.

El modelo resuelve tareas de razonamiento visual que requieren evidencia intermedia explícita, como reconstrucción de escenas, razonamiento espacial y razonamiento sobre evidencia visible. Su innovación principal es el uso de imágenes generadas como pasos intermedios de razonamiento, en lugar de limitarse a cadenas de texto. La arquitectura combina un transformer multimodal tipo MoT (Mixture of Transformers) con un codificador SigLIP entrenable y un VAE congelado, con un total de 14.675.840.307 parámetros almacenados en el checkpoint liberado.

Esta ficha corresponde a los pesos EMA de la etapa 2 en el paso 5.500, que son los que reporta el artículo asociado. El repositorio ocupa 29,5 GB e incluye los pesos en bfloat16, el VAE de entrenamiento y los ficheros de tokenizer. Es un modelo de investigación, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoT (Mixture of Transformers) basado en BAGEL-7B-MoT, con codificador SigLIP y VAE |
| Parametros totales | 14.675.840.307 (1.451 tensores en `ema.safetensors`, bfloat16) |
| Parametros activos | no disponible (no se especifica configuracion MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible (empaquetado dinamico de hasta 16.384 tokens en etapa 1 y 20.480 tokens en etapa 2 durante entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`ema.safetensors`, `ae.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal unificado construido sobre BAGEL-7B-MoT. Integra un LLM, un codificador visual SigLIP (entrenable durante el ajuste) y un VAE congelado que se usa para codificar y decodificar imágenes. La inferencia de BAGEL no utiliza la capa 26 de SigLIP (`vit_select_layer = -2`), por lo que esa capa no se almacena en el checkpoint, igual que en la liberación original de BAGEL. El entrenamiento emplea dos funciones de pérdida con peso 1: entropía cruzada para texto y flow matching para imágenes.

El entrenamiento sigue la receta PRIMER en dos etapas. La etapa 1 (pretexto) se ejecutó en 32 GPUs (4 nodos × 8) sobre Pretext-270K, con 270.896 filas de entrenamiento, learning rate 2,83e-5, warmup de 1.000 pasos y horizonte configurado de 10.000 pasos; se libera el EMA del paso 5.500. La etapa 2 (instrucción) se ejecutó en 48 GPUs (6 nodos × 8) sobre Instruct-181K (21 subconjuntos, incluyendo ficheros de validación), inicializada desde el EMA de la etapa 1 en el paso 5.500, con learning rate 2e-5, warmup de 1.000 pasos y horizonte de 12.000 pasos; también se libera el EMA del paso 5.500. En ambas etapas se usa EMA con decay 0,9998 desde el paso 1.000 y shadow en fp32, y empaquetado dinámico de secuencias (hasta 16.384 tokens en etapa 1 y 20.480 en etapa 2). La etapa 2 filtra solo trazas que contienen una primera imagen de razonamiento y una respuesta final (`require_reasoning_image_0_and_answer`) e incluye los ficheros de validación en el entrenamiento (`include_val_in_training`).

## Capacidades

- Generación de texto y razonamiento multimodal con trazas intercaladas de texto e imágenes.
- Generación de imágenes intermedias como pasos explícitos de razonamiento visual.
- Razonamiento sobre evidencia visible en imágenes de entrada.
- Razonamiento espacial y reconstrucción de escenas.
- Pipeline any-to-any (entrada y salida multimodal).
- Capacidad de responder preguntas visuales combinando texto e imágenes generadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso basado en herramientas: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito separado: no disponible (el razonamiento se materializa como imágenes y texto intercalados).

## Casos de uso

- Reconstrucción de escenas a partir de una imagen: el modelo puede generar imágenes intermedias que reconstruyan la estructura espacial de una escena antes de responder, útil en tareas de percepción visual que requieren verificación explícita de la geometría.
- Razonamiento espacial sobre planos o diagramas: dado un esquema, el modelo puede generar pasos visuales intermedios para razonar sobre relaciones de posición, orientación y distancia entre elementos.
- Respuesta a preguntas visuales con evidencia intermedia: en lugar de responder directamente, el modelo produce una traza texto-imagen-texto que documenta qué evidencia considera relevante, lo que facilita la auditoría del razonamiento.
- Investigación en razonamiento multimodal intercalado: sirve como base para experimentos sobre cómo las imágenes generadas como pasos intermedios afectan a la calidad del razonamiento, gracias a los datasets Pretext-270K e Instruct-181K publicados.
- Generación de explicaciones visuales paso a paso: para tareas educativas o de documentación donde se necesita mostrar el proceso de razonamiento con ilustraciones intermedias.
- Prototipado de asistentes visuales que "piensan dibujando": útil para explorar interfaces donde el modelo muestra su cadena de razonamiento mediante bocetos o imágenes generadas antes de la respuesta final.
- Evaluación comparativa de modelos any-to-any: al estar construido sobre BAGEL-7B-MoT y liberar los pesos EMA, permite reproducir y comparar la receta PRIMER frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las puntuaciones se rellenarán cuando la tabla principal del artículo esté finalizada, y muestra las categorías "Visible evidence", "Spatial structure" y "Scene reconstruction" con valor "TBD".

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 29,4 GB solo para `ema.safetensors`, más unos 160 MB del VAE; se necesita al menos una GPU con 40 GB o más para cargar los pesos sin cuantización.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB. Para el entrenamiento se usaron 32 GPUs (etapa 1) y 48 GPUs (etapa 2).
- Cabe en GPU consumer: no de forma directa en bfloat16; no se han publicado recetas de cuantización para este modelo, por lo que no se puede confirmar su viabilidad en RTX 4090 (24 GB) u otras consumer.
- Opciones de despliegue: código oficial de inferencia de BAGEL (https://github.com/ByteDance-Seed/Bagel) apuntando `model_path` al repositorio local, o el código de PRIMER mediante `Bagel.from_pretrained(model_path, config, training_config=...)`, que detecta `ema.safetensors` automáticamente. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La model card advierte de que la inferencia por defecto genera imágenes, lo que supone un coste computacional elevado.
- Nota importante: no se debe sustituir `ae.safetensors` por el VAE de 320 MB de la liberación pública de BAGEL; hay que usar el VAE de ~160 MB incluido, procedente de `lmms-lab/BAGEL-7B-MoT-ver.LE`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkMorph-SSL-Instruct | 14.675.840.307 | no disponible | any-to-any con razonamiento intercalado texto-imagen | Apache-2.0 | Hugging Face (ThinkMorph/ThinkMorph-SSL-Instruct) |
| ByteDance-Seed/BAGEL-7B-MoT | no disponible en la informacion proporcionada | no disponible | any-to-any (modelo base) | no disponible en la informacion proporcionada | Hugging Face |
| ThinkMorph/ThinkMorph-7B | no disponible en la informacion proporcionada | no disponible | multimodal (modelo distinto, no sustituible) | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- Las imágenes intermedias generadas pueden omitir o alterar evidencia de la que depende la pregunta, lo que puede producir respuestas incorrectas con apariencia de razonamiento válido.
- La inferencia por defecto genera imágenes, con un coste computacional elevado frente a modelos solo-texto.
- ThinkMorph/ThinkMorph-7B es un modelo diferente y no puede sustituir a ThinkMorph-SSL-Instruct.
- No se han publicado resultados de benchmarks, por lo que no es posible evaluar su rendimiento frente a alternativas.
- Idiomas soportados no especificados; no se puede garantizar un comportamiento multilingüe adecuado.
- Riesgo de alucinación: no documentado explícitamente en la model card, pero inherente a modelos generativos multimodales; la generación de imágenes intermedias añade una fuente adicional de error.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0 para los pesos, pero los datasets Pretext-270K e Instruct-181K tienen sus propios términos de origen que deben consultarse en sus respectivas model cards.
- No se publican recetas de cuantización, lo que limita el despliegue en hardware de gama consumer.
- El tokenizer debe usarse tal cual se distribuye en el repositorio, ya que incluye tokens especiales añadidos durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThinkMorph/ThinkMorph-SSL-Instruct
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Pesos de etapa 1 (Base): https://huggingface.co/ThinkMorph/ThinkMorph-SSL-Base
- Dataset Pretext-270K: https://huggingface.co/datasets/ThinkMorph/Pretext-270K
- Dataset Instruct-181K: https://huggingface.co/datasets/ThinkMorph/Instruct-181K
- Código oficial de BAGEL: https://github.com/ByteDance-Seed/Bagel
- Modelo ThinkMorph-7B (distinto): https://huggingface.co/ThinkMorph/ThinkMorph-7B
