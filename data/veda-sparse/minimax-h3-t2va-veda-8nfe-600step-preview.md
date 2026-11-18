# Veda-Sparse/Minimax-H3-T2VA-Veda-8NFE-600Step-Preview

## Resumen

Veda-MiniMax-H3 es un predictor de atención dispersa aprendida (sparse attention) para el modelo de difusión de vídeo MiniMax-H3, desarrollado por Veda-Sparse. No es un modelo generativo autónomo, sino un componente que se acopla al backbone MiniMax-H3 para sustituir la atención densa por una atención de bloques dispersa que conserva aproximadamente el 10% de las conexiones. El problema que resuelve es el coste computacional de la atención en difusión de vídeo: según el autor, la atención domina la inferencia y solo una fracción pequeña contribuye de forma significativa a la salida.

El checkpoint publicado es una vista previa entrenada y evaluada junto con MiniMax-H3-Turbo-Lora para generación en 8 pasos (8NFE), aunque el autor indica que el predictor es agnóstico a la modalidad (T2VA, FL2VA, R2VA) y al número de pasos de difusión. El repositorio ocupa 0,3 GB y contiene los pesos del predictor en formato FP8 safetensors, no los pesos del backbone.

La relevancia actual reside en que permite acelerar hasta 6,8 veces la atención y 3,1 veces el pipeline completo en generación de vídeo con audio, manteniendo calidad visual y sonora según el autor, y es compatible con cualquier LoRA y con variantes afinadas de MiniMax-H3 sin modificar los pesos del backbone ni el estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de atención dispersa por bloques (block-sparse) sobre backbone de difusión MiniMax-H3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (checkpoint publicado como `*_fp8.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (license: other) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

Veda es un método de atención dispersa aprendida para modelos de difusión de vídeo. Entrena un predictor ligero, destilado del modelo completo, que identifica el 10% de atención más relevante y omite el resto. El predictor no es un LoRA: deja intactos los pesos y el estilo del backbone y solo cambia cómo se calcula la atención, lo que lo hace compatible con cualquier LoRA y con variantes afinadas de MiniMax-H3.

El checkpoint se entrenó y evaluó con MiniMax-H3-Turbo-Lora para generación en 8 pasos, sobre 600 pasos de entrenamiento según el nombre del repositorio. El autor declara que el predictor es agnóstico a modalidad y a número de pasos de difusión: las etiquetas T2VA y 8NFE del nombre solo reflejan la configuración de entrenamiento y no restringen su uso. Se anuncia un checkpoint específico afinado para R2VA con calidad mejorada. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Aceleración de la atención en difusión de vídeo mediante atención dispersa por bloques, conservando aproximadamente el 10% de las conexiones.
- Aplicable a todas las modalidades de generación de MiniMax-H3: T2VA (texto a vídeo con audio), FL2VA (primer/último fotograma a vídeo con audio) y R2VA (referencia a vídeo con audio).
- Aplicable a números arbitrarios de pasos de difusión, no solo a los 8 pasos de la configuración de entrenamiento.
- Compatible con LoRAs y con variantes afinadas de MiniMax-H3 sin alterar pesos ni estilo del backbone.
- Integración como nodo personalizado de ComfyUI mediante el paquete `veda-sparse-attention`.
- Integración en el código base Miowtion para pipelines de generación.
- No incluye capacidades de texto, razonamiento, código, tool calling ni agentes: es un componente de aceleración de inferencia, no un modelo de lenguaje.

## Casos de uso

- Generación de vídeo con audio en producción: sustituir la atención densa de MiniMax-H3 por Veda para reducir el tiempo por clip; con Turbo LoRA y 8 pasos, el autor reporta 3,12× de aceleración extremo a extremo en un clip 16:9 de 14,4 s sobre RTX PRO 6000 Blackwell.
- Prototipado rápido en GPU de consumo: en RTX 4090, un clip 16:9 de 5,17 s pasa de atención densa a Veda con 1,77× de aceleración extremo a extremo, lo que permite iterar sobre prompts con más frecuencia.
- Pipelines de vídeo largo: la ganancia crece con la duración del clip (2,42× a 10,1 s y 2,82× a 14,4 s en RTX 4090), por lo que es adecuado para generar secuencias largas donde la atención domina el coste.
- Flujos con LoRA de estilo: al no modificar los pesos del backbone, se puede combinar con LoRAs de estética o de personaje sin reentrenar el predictor.
- Integración en ComfyUI: instalación del nodo `veda-sparse-attention` y descarga del checkpoint FP8 en `ComfyUI/models/veda/` para usar Veda en grafos de generación de vídeo existentes.
- Evaluación comparativa de atención dispersa: usar el checkpoint como referencia para medir el impacto de conservar el 10% de atención frente a atención completa con la misma semilla y prompt.
- Investigación en eficiencia de difusión: servir de base para estudiar predictores de atención destilados en otros backbones de vídeo.

## Benchmarks y rendimiento

El autor publica aceleraciones relativas a atención completa (MiniMax-H3 + Turbo LoRA, 10% de atención conservada), no métricas de calidad tipo MMLU o FVD:

| GPU | Clip | Aceleración de atención | Aceleración extremo a extremo |
|---|---|---|---|
| RTX PRO 6000 Blackwell | 16:9 · 14,4 s | 6,79× | 3,12× |
| RTX 4090 | 16:9 · 5,17 s | 4,75× | 1,77× |
| RTX 4090 | 16:9 · 10,1 s | 6,22× | 2,42× |
| RTX 4090 | 16:9 · 14,4 s | 6,31× | 2,82× |

No se han publicado resultados de benchmarks de calidad (FVD, CLIP score, métricas de audio) en la información disponible; el autor afirma que la calidad visual y de audio es equiparable a la atención completa.

## Requisitos de hardware

- El checkpoint del predictor ocupa 0,3 GB en FP8; el requisito dominante es el del backbone MiniMax-H3, cuyos pesos deben descargarse por separado.
- GPU validadas por el autor: RTX PRO 6000 Blackwell y RTX 4090.
- Cabe en GPU de consumo: el autor demuestra ejecución en RTX 4090 con clips de hasta 14,4 s en 16:9.
- Despliegue mediante el código base Miowtion (`pip install -e '.[gpu,encode]'`) o como nodo de ComfyUI (`comfy node install veda-sparse-attention`).
- No se especifican requisitos de VRAM del backbone ni latencias absolutas; solo aceleraciones relativas.
- No se indica soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros predictores de atención dispersa comparables ni métricas de modelos alternativos de difusión de vídeo con audio.

## Limitaciones y advertencias

- Es una vista previa (Preview): el autor anuncia un checkpoint específico para R2VA con calidad mejorada, lo que sugiere que la calidad actual en esa modalidad puede ser inferior.
- El checkpoint está entrenado y evaluado con Turbo LoRA en 8 pasos; el comportamiento con otros schedulers o números de pasos no está cuantificado en la información disponible.
- Conserva solo el 10% de la atención; el autor afirma paridad de calidad, pero no se publican métricas objetivas de calidad en la información disponible.
- Licencia `minimax-h3-community` (license: other): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, y los términos del backbone MiniMax-H3 se aplican por separado.
- No es un modelo autónomo: requiere descargar MiniMax-H3 y el código Miowtion o el nodo de ComfyUI; no funciona de forma aislada.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; al ser un componente de atención, hereda las características del backbone.
- El repositorio de 0,3 GB no contiene el modelo base; un despliegue incompleto (solo el predictor) no genera vídeo.

## Enlaces

- Hugging Face: https://huggingface.co/Veda-Sparse/Minimax-H3-T2VA-Veda-8NFE-600Step-Preview
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA Turbo: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Demo: https://veda.hanxiao.run/
- Página del proyecto: https://veda-sparse.github.io/
- Código (Miowtion): https://github.com/veda-sparse/Miowtion
- Paper: https://arxiv.org/abs/2605.30325
- Nodo ComfyUI: https://registry.comfy.org/publishers/veda-sparse/nodes/veda-sparse-attention
- Guía de despliegue: AGENTS.md (en el repositorio de Hugging Face)
