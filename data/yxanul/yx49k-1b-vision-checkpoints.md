# Yxanul/yx49k-1b-vision-checkpoints

## Resumen

El repositorio `Yxanul/yx49k-1b-vision-checkpoints` contiene los checkpoints intermedios y finales de un modelo multimodal de aproximadamente 0,98 mil millones de parámetros desarrollado por Yxanul. Se trata de un modelo híbrido basado en *gated-delta-attention* que incorpora una torre de visión entrenada desde cero, lo que lo convierte en un artefacto de investigación orientado a estudiar arquitecturas eficientes y entrenamiento en TPU.

El modelo fue entrenado en un clúster TPU Research Cloud v4-64 sobre un total de 55 mil millones de tokens (25B de prueba más 30B de continuación) con una mezcla calibrada de imagen, texto, código y matemáticas. Además del entrenamiento base, se incluye una escalera de post-entrenamiento con etapas SFT y GOLD, cuyos resultados se documentan parcialmente en la model card.

La relevancia de este repositorio radica en su carácter experimental: no es un modelo listo para producción, sino un conjunto de estados de entrenamiento (Orbax y pickles TrainStateNNX) que permiten reanudar el entrenamiento, analizar la dinámica de aprendizaje de arquitecturas híbridas y evaluar técnicas de post-entrenamiento en un contexto multimodal compacto. El tokenizador, denominado `yx49k`, tiene un vocabulario de 49.152 tokens y es un subconjunto exacto del vocabulario de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida *gated-delta-attention* con torre de visión entrenada desde cero |
| Parametros totales | 0,98 mil millones (aprox. 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el tokenizador es un subconjunto del vocabulario de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax train state y pickles `state.pkl` (TrainStateNNX pure-dicts) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida basada en *gated-delta-attention*, una variante de atención que busca reducir el coste computacional frente a la atención completa, combinada con una torre de visión entrenada desde cero para procesar entradas multimodales. El entrenamiento se realizó en un clúster de TPU v4-64 (64 chips) durante dos fases: una prueba inicial de 25 mil millones de tokens y una continuación de 30 mil millones, sumando 55 mil millones de tokens en total. La mezcla de datos está calibrada para incluir imagen, texto, código y matemáticas.

El post-entrenamiento sigue una escalera de cuatro etapas: SFT1 (basado en Mephisto IF+Knowledge), GOLD1 (optimización GOLD sobre SFT1), SFT2 (añadiendo AMD y MathCode) y GOLD2. Los checkpoints se almacenan en dos formatos: directorios Orbax para los estados de entrenamiento base y archivos pickle (`state.pkl`) que contienen diccionarios puros de TrainStateNNX con pesos y optimizador. El tokenizador `yx49k` tiene un tamaño de vocabulario de 49.152 tokens, siendo un subconjunto exacto del vocabulario de Qwen3.5.

## Capacidades

- Procesamiento multimodal: integra una torre de visión propia para trabajar con entradas de imagen junto con texto.
- Generación de texto, código y matemáticas: el mix de entrenamiento incluye estos dominios, aunque el rendimiento en benchmarks estándar es limitado.
- Seguimiento de instrucciones: las etapas SFT (SFT1 y SFT2) están diseñadas para mejorar la adherencia a instrucciones, con métricas IFEval medias de 40,8 y 55,3 respectivamente.
- Post-entrenamiento con GOLD: incluye checkpoints optimizados con la técnica GOLD, que busca mejorar la calidad de las respuestas frente al modelo SFT base.
- Formato de investigación: los pesos se distribuyen como estados de entrenamiento (Orbax y pickles), lo que permite reanudar el entrenamiento o analizar la dinámica interna del modelo, pero no su uso directo con herramientas de inferencia estándar.

## Casos de uso

- Investigación en arquitecturas de atención eficientes: el modelo permite estudiar el comportamiento de *gated-delta-attention* en un contexto multimodal de 1B, comparando su rendimiento y coste frente a transformers convencionales.
- Análisis de entrenamiento de torres de visión desde cero: al incluir una torre de visión propia, es posible investigar cómo se aprenden representaciones visuales sin depender de backbones preentrenados como CLIP o SigLIP.
- Reanudación de entrenamiento para dominios específicos: los checkpoints Orbax permiten continuar el entrenamiento con datos adicionales de un sector concreto (por ejemplo, documentos técnicos o imágenes médicas) sin partir de cero.
- Evaluación de técnicas de post-entrenamiento: la escalera SFT/GOLD proporciona un banco de pruebas para comparar el impacto de distintas estrategias de alineación en modelos pequeños.
- Estudio de tokenizadores subconjunto: al usar un vocabulario derivado de Qwen3.5, se puede analizar cómo afecta la reducción del vocabulario al rendimiento en tareas multilingües o de código.
- Prototipado de modelos multimodales compactos: aunque requiere conversión de formato, un modelo de 1B puede servir como base para experimentos en entornos con restricciones de memoria, como edge computing o dispositivos móviles.

## Benchmarks y rendimiento

La model card reporta métricas parciales para los checkpoints de post-entrenamiento, aunque no se proporcionan resultados de benchmarks estándar como MMLU o HumanEval. Los datos disponibles son los siguientes:

| Checkpoint | IFEval media | Panel (aciertos/32) | GSM8K |
|---|---|---|---|
| gold1-4449 | 40,8 | 24/32 | no disponible |
| sft2-5200 | 55,3 | no disponible | no disponible |
| gold2-4449 | no disponible | 27/32 | 4,6 |

Estos valores corresponden a checkpoints intermedios del proceso de post-entrenamiento, no a un modelo final consolidado. El resultado de GSM8K (4,6) es muy bajo en comparación con modelos comerciales o incluso otros modelos abiertos de tamaño similar, lo que sugiere que el modelo no está optimizado para razonamiento matemático complejo o que los checkpoints son experimentales. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 49,8 GB, pero este tamaño incluye múltiples checkpoints con estados de optimizador, no solo los pesos del modelo. Un modelo de 0,98B en precisión FP32 ocuparía aproximadamente 4 GB de VRAM.
- El entrenamiento se realizó en un clúster TPU v4-64 (64 chips TPU v4), lo que indica que el preentrenamiento requiere hardware de alto rendimiento.
- Para inferencia, un modelo de 1B puede ejecutarse en GPUs de consumo como una RTX 3060 (12 GB) o RTX 4090 (24 GB), siempre que los pesos se conviertan a un formato estándar como safetensors o GGUF.
- El formato de pesos actual (Orbax y pickles TrainStateNNX) no es compatible directamente con herramientas de despliegue convencionales como vLLM, Ollama o llama.cpp. Sería necesario convertir los pesos mediante el código proporcionado en el repositorio de GitHub.
- La latencia y el throughput estimados no están disponibles, ya que no se han publicado pruebas de inferencia sobre este modelo.

## Comparativa con modelos similares

La comparativa se realiza con modelos de tamaño similar (alrededor de 1B de parámetros), aunque las diferencias en arquitectura y formato dificultan una comparación directa.

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| yx49k-1b-vision | 0,98B | Híbrida *gated-delta-attention* + visión | no disponible | Apache 2.0 | Orbax / Pickle |
| TinyLlama-1.1B | 1,1B | Transformer decoder (LLaMA) | 2048 | Apache 2.0 | safetensors / GGUF |
| Qwen2.5-VL-3B | 3B | Transformer + visión | 32768 | Apache 2.0 | safetensors |

TinyLlama es un modelo de texto puro con una arquitectura estándar y amplio soporte en herramientas de inferencia, mientras que Qwen2.5-VL-3B es multimodal pero con el doble de parámetros. El modelo de Yxanul destaca por su arquitectura híbrida experimental y su enfoque en investigación, pero carece de la madurez y el ecosistema de herramientas de las alternativas.

## Limitaciones y advertencias

- Es un proyecto de investigación: no es un modelo listo para producción ni ofrece garantías de estabilidad o rendimiento en aplicaciones reales.
- El formato de pesos no es estándar (Orbax y pickles TrainStateNNX), lo que impide su uso directo con frameworks de inferencia convencionales sin una conversión previa.
- El rendimiento en benchmarks es bajo (GSM8K de 4,6 en gold2), lo que indica limitaciones significativas en razonamiento matemático y probablemente en otras tareas complejas.
- No se especifica la longitud de contexto soportada, lo que supone un riesgo para tareas que requieran ventanas largas.
- Los idiomas soportados no están documentados; aunque el tokenizador deriva de Qwen3.5, no hay evidencia de un entrenamiento multilingüe específico.
- El repositorio es pesado (49,8 GB) para un modelo de 1B, debido a la inclusión de múltiples checkpoints y estados de optimizador, lo que dificulta su descarga y almacenamiento.
- No se han publicado análisis de sesgos, alucinaciones o seguridad del modelo, por lo que no es recomendable su uso en entornos donde estos aspectos sean críticos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Yxanul/yx49k-1b-vision-checkpoints
- Informe técnico y código: https://github.com/yxanul/yxTPU
