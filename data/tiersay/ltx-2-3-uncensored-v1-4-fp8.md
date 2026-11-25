# Tiersay/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es una compilación pre-fusionada del modelo de generación de vídeo LTX Video 2.3 de Lightricks, publicada por el usuario Tiersay (con material asociado del usuario ChrisColeTech). Se trata de un DiT (Diffusion Transformer) de vídeo que integra tres ajustes finos en los pesos: un LoRA NSFW de alta coherencia (Eros10), un LoRA destilado DMD para acelerar la generación y mejorar el seguimiento de instrucciones, y el ICLoRA oficial de detalle para mayor adherencia a la imagen de referencia. El resultado es un modelo "turbo" capaz de generar vídeo en tan solo 4 pasos (8 recomendados), con soporte de audio sincronizado.

El modelo cubre múltiples modalidades de entrada: texto a vídeo, imagen a vídeo, vídeo a vídeo y audio a vídeo, además de variantes FL2VA, T2VA, I2VA e I2VA con referencia. Con 21.005.004.544 parámetros (~21 mil millones) y un repositorio de 261,1 GB, está pensado para flujos de trabajo en ComfyUI con pesos en FP8 y GGUF cuantizado. Su relevancia actual radica en que ofrece generación de vídeo largo (hasta 960 fotogramas, ~40 segundos) con audio integrado en hardware de consumo, algo impensable en modelos de vídeo de primera generación.

La licencia figura como "unknown" tanto en los metadatos como en la model card, y el modelo está etiquetado como "not-for-all-audiences" por su contenido NSFW. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de vídeo, derivada de LTX Video 2.3 |
| Parametros totales | 21.005.004.544 (~21 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; admite hasta 960 fotogramas (~40 s de vídeo) |
| Tipos de cuantizacion | FP8 y GGUF cuantizado |
| Idiomas soportados | no disponible |
| Licencia | unknown |
| Formato de pesos | GGUF y FP8 (safetensors no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DiT de LTX Video 2.3 de Lightricks, un transformer de difusión diseñado para generar vídeo de forma eficiente. Sobre los pesos base se han fusionado tres adaptadores: el LoRA Eros10 NSFW a fuerza 1.0, el LoRA DMD destilado a fuerza 1.0 (que reduce el número de pasos de muestreo necesarios y mejora la preservación facial en I2V y el seguimiento de instrucciones) y el ICLoRA Detailer oficial de LTXV a fuerza 0.6 para mejorar la fidelidad a la imagen de referencia. La fusión pre-mergeada evita tener que cargar los LoRA por separado en ComfyUI.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación principal es la destilación DMD integrada, que permite generar vídeo en 4 pasos (8 para calidad óptima) frente a los 20-50 pasos habituales en modelos de difusión de vídeo, y la generación de audio sincronizado con el vídeo en las variantes T2VA, I2VA y FL2VA.

## Capacidades

- Generación de vídeo a partir de texto (txt2video) con audio sincronizado opcional (T2VA).
- Generación de vídeo a partir de imagen (img2video) preservando la identidad del sujeto de la imagen de referencia.
- Generación de vídeo a partir de vídeo (video-to-video) y de audio (audio-to-video).
- Generación de vídeo con primer y último fotograma especificados (FL2VA), útil para transiciones controladas.
- Generación de vídeo largo: hasta 960 fotogramas, aproximadamente 40 segundos, con coherencia temporal.
- Generación de audio integrada (diálogo, ambiente, efectos) en las variantes con audio.
- Control de movimiento y audio mediante CFG: valores altos (3.5-3.8) producen más movimiento y audio; valores bajos (1.0) generan escenas lentas e íntimas.
- Contenido NSFW sin censura (etiqueta not-for-all-audiences), con salvaguardas declaradas contra contenido ilegal.
- Integración con ComfyUI mediante flujos de trabajo JSON proporcionados por el autor.

## Casos de uso

- Previsualización de vídeo publicitario: generar clips de 5 segundos a 1280×736 con 8 pasos y CFG 3.5 para iterar rápidamente sobre guiones y storyboards antes de la producción final, gracias a la velocidad de la destilación DMD.
- Creación de contenido para redes sociales: producir vídeos verticales u horizontales de hasta 40 segundos con audio ambiente a partir de una imagen de referencia, manteniendo la identidad del personaje en tomas largas.
- Animación de retratos y personajes: usar img2video con el ICLoRA Detailer para animar fotografías preservando rasgos faciales y ropa, adecuado para avatares o presentaciones.
- Generación de transiciones controladas: emplear FL2VA especificando primer y último fotograma para crear interpolaciones cinematográficas entre dos imágenes en un pipeline de posproducción.
- Doblaje y sincronización audiovisual: usar audio-to-video para generar vídeo que acompañe a una pista de audio existente, útil en prototipos de videoclips o podcasts visuales.
- Investigación en modelos generativos de vídeo: estudiar el efecto de la fusión de LoRA (DMD, Eros10, ICLoRA) sobre la calidad y el seguimiento de instrucciones en un DiT de 21 mil millones de parámetros.
- Creación de contenido para adultos con fines artísticos o de entretenimiento: el modelo está explícitamente entrenado para NSFW, con control de CFG para modular el tono de la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 21 mil millones de parámetros, en FP8 se requieren al menos ~21 GB solo para los pesos, más memoria para activaciones y el decodificador de vídeo; en la práctica se recomiendan 24 GB o más. Las versiones GGUF cuantizadas reducen el requisito, pero no se especifican niveles de cuantización concretos.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar RTX 4090 (24 GB), RTX 5090, A100 (40/80 GB) y H100, pero el autor no lo confirma.
- Cabe en GPU de consumo: probablemente en RTX 4090 con FP8 o GGUF, aunque no está confirmado por el autor.
- Opciones de despliegue: ComfyUI (flujos de trabajo JSON proporcionados), con soporte de pesos GGUF y FP8. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles. El autor indica que la generación puede hacerse en 4 pasos y que 8 pasos dan mejores resultados, pero no publica tiempos por fotograma ni por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.3-uncensored-v1.4-FP8 | ~21 mil millones | hasta 960 fotogramas (~40 s) | unknown | Hugging Face (Tiersay) |
| Lightricks/LTX-2.3 (base) | no disponible | no disponible | no disponible | Hugging Face (Lightricks) |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | no disponible | Hugging Face (TenStrip) |
| TenStrip/LTX2.3_DMD_Lora | no disponible | no disponible | no disponible | Hugging Face (TenStrip) |

No se dispone de datos de rendimiento comparativo entre estas variantes. Las alternativas de la misma categoría (modelos de vídeo de ~20 mil millones de parámetros con audio) no están identificadas en la información proporcionada.

## Limitaciones y advertencias

- Licencia "unknown": no se especifican términos de uso comercial, lo que supone un riesgo legal para producción. Es imprescindible contactar con el autor o consultar la licencia del modelo base Lightricks/LTX-2.3 antes de un uso comercial.
- Contenido NSFW explícito: el modelo está entrenado para generar material para adultos y está etiquetado como not-for-all-audiences. No es apto para entornos públicos o sin control de edad.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo base con ajustes NSFW es probable que herede sesgos de representación y de género del dataset original.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible, artefactos temporales y físicas incoherentes, especialmente en vídeos largos.
- Salvaguardas declaradas: el autor afirma que hay protecciones contra contenido ilegal, pero no se detalla su implementación ni su eficacia.
- Idiomas: no disponible; no se confirma el soporte multilingüe de los prompts.
- Repositorio de gran tamaño (261,1 GB): requiere espacio de disco considerable y descargas largas.
- Sin benchmarks ni métricas publicadas: no hay evidencia cuantitativa de calidad frente a otros modelos de vídeo.
- Fecha de creación futura (2026-11-25) en los metadatos: conviene verificar la autenticidad y la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tiersay/LTX-2.3-uncensored-v1.4-FP8
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- LoRA Eros10: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA DMD: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Repositorio asociado con muestras y flujos de trabajo: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8
- Flujo de trabajo de ejemplo (T2AV NSFW): https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
