# ToPo-ToPo/Qwen3.8-Flash-Next-mlx-8bit

## Resumen

Qwen3.8-Flash-Next-mlx-8bit es una conversión a formato MLX con cuantización de 8 bits del modelo multimodal Qwen3.8-Flash-Next, realizada por el usuario ToPo-ToPo. El modelo original, desarrollado por Alibaba Qwen, es un MoE (Mixture of Experts) ultra disperso de 125 000 millones de parámetros (con 6 000 millones activos por token) que sirve como avance de la arquitectura Qwen4. Esta conversión específica reporta 55 743 687 571 parámetros en sus safetensors, lo que sugiere que la tabla n-gram de 51 000 millones de parámetros del modelo base podría no estar incluida o almacenarse por separado. El modelo está diseñado para ejecutarse en Apple Silicon mediante la librería mlx-vlm, y su tamaño final es de 186 GiB con una media de 9,018 bits por peso.

La relevancia de esta conversión radica en que permite ejecutar localmente un modelo de última generación con ventana de contexto de 262 000 tokens y capacidades multimodales (imagen y texto) en hardware de Apple, sin necesidad de GPU dedicada. El modelo base destaca por su arquitectura híbrida que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), logrando un equilibrio entre eficiencia computacional y capacidad de razonamiento de largo alcance. Aunque la conversión excluye el cabezal MTP (Multi-Token Prediction), mantiene el resto de capacidades del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Gated DeltaNet + Qwen Sparse Attention) |
| Parametros totales | 55 743 687 571 (según safetensors; el modelo base declara 125B incluyendo tabla n-gram de 51B) |
| Parametros activos | 6 000 000 000 (por token, según el modelo base) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | 8 bits (q-bits 8, group-size 32) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE ultra dispersa con 125 000 millones de parámetros totales, de los cuales 6 000 millones se activan por token. La innovación principal es la combinación de dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN), que comprime el historial de forma eficiente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de información de largo alcance. Además, incorpora una tabla n-gram de 51 000 millones de parámetros que mejora la predicción de tokens frecuentes. Esta arquitectura es un avance de la que se usará en Qwen4.

La conversión MLX se realizó con mlx-vlm 0.6.17 y mlx 0.32.0, aplicando cuantización de 8 bits con grupo de tamaño 32, que es obligatorio para que la tabla n-gram (cuya última dimensión es 160) pueda cuantizarse correctamente. El cabezal MTP se excluyó durante la conversión, por lo que la decodificación especulativa no está disponible en esta versión. No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas complejas de lógica y matemáticas.
- Procesamiento multimodal: acepta imágenes como entrada junto con texto (pipeline image-text-to-text).
- Ventana de contexto de 262 000 tokens, adecuada para documentos extensos y conversaciones de largo recorrido.
- Arquitectura MoE eficiente que activa solo 6 000 millones de parámetros por token, reduciendo el coste computacional en inferencia.
- Soporte para ejecución en Apple Silicon mediante MLX, con cuantización de 8 bits para reducir requisitos de memoria.
- Capacidad de conversación multi-turno (etiqueta "conversational" en HuggingFace).

## Casos de uso

- Análisis de documentos técnicos extensos con figuras y diagramas: gracias a su contexto de 262 000 tokens y su capacidad multimodal, puede resumir y extraer información de manuales, informes o papers que combinen texto e imágenes.
- Asistentes virtuales para atención al cliente en entornos Apple: al ejecutarse localmente en Mac con MLX, permite desplegar un chatbot privado sin enviar datos a la nube, manejando conversaciones largas con historial completo.
- Generación de descripciones de imágenes en lote: puede procesar imágenes y generar texto descriptivo o alt-text automático, útil para accesibilidad o catalogación de contenido visual.
- Razonamiento sobre capturas de pantalla o UI: puede analizar interfaces de usuario y responder preguntas sobre su contenido, útil para testing automatizado o asistencia técnica.
- Búsqueda semántica en corpus visuales: al combinar visión y texto, puede indexar y recuperar información de bases de datos de imágenes con consultas en lenguaje natural.
- Prototipado de aplicaciones de realidad aumentada o asistencia visual: su capacidad de razonamiento multimodal permite interpretar escenas y generar respuestas contextuales en tiempo real, aunque requiere hardware con suficiente memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación del modelo base menciona que supera a Claude-4.6-Opus (Max) en algunas pruebas, pero no se proporcionan cifras concretas ni comparaciones con otros modelos en esta conversión específica.

## Requisitos de hardware

- Memoria unificada mínima: 64 GB (según la guía de atomic.chat, puede ejecutarse desde un MacBook con 64 GB, aunque el tamaño del modelo es de 186 GiB, por lo que se recomienda al menos 128 GB para mayor comodidad).
- Sin necesidad de GPU VRAM dedicada: funciona en Apple Silicon con memoria unificada (M-series).
- Almacenamiento: se requieren aproximadamente 200 GB de espacio en disco para el repositorio completo.
- Despliegue: mediante mlx-vlm, con el comando `python -m mlx_vlm generate --model ToPo-ToPo/Qwen3.8-Flash-Next-mlx-8bit --prompt "..." --image ...`.
- No compatible con vLLM, llama.cpp u Ollama en su forma actual, ya que es específico de MLX. Para otros entornos, se necesitaría la versión GGUF del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos. El modelo base Qwen3.8-Flash-Next se posiciona como un MoE multimodal de alto rendimiento, pero esta conversión MLX 8-bit es una adaptación específica para Apple Silicon. Alternativas comparables podrían ser otros modelos MoE multimodales como Qwen2.5-VL o InternVL, pero no se dispone de información contrastada en esta ficha.

## Limitaciones y advertencias

- Licencia qwen-community-1.0: no es una licencia de código abierto estándar; requiere aceptación de términos específicos de Qwen y puede tener restricciones para uso comercial. Es necesario revisar el texto completo de la licencia.
- Tamaño del modelo: 186 GiB en disco y necesidad de al menos 64 GB de memoria unificada, lo que limita su uso a equipos Apple de gama alta.
- Exclusión del cabezal MTP: la decodificación especulativa no está disponible en esta conversión, lo que puede afectar al rendimiento en generación de texto largo.
- Posible ausencia de la tabla n-gram: los safetensors reportan 55,7B parámetros frente a los 125B del modelo base, lo que sugiere que la tabla n-gram de 51B podría no estar incluida o manejarse de forma separada, afectando potencialmente a la calidad de predicción en ciertos contextos.
- Sesgos y alucinaciones: al ser un modelo multimodal entrenado con datos web, puede presentar sesgos socioculturales y generar contenido inexacto, especialmente en tareas de razonamiento visual complejo.
- Sin soporte para otros formatos: al ser una conversión MLX, no es directamente utilizable con frameworks como PyTorch, TensorFlow o vLLM sin una conversión adicional.

## Enlaces

- [HuggingFace - ToPo-ToPo/Qwen3.8-Flash-Next-mlx-8bit](https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-8bit)
- [GitHub - QwenLM/Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Guía de ejecución local (atomic.chat)](https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally)
- [Documentación de unsloth para Qwen3.8-Flash-Next](https://unsloth.ai/docs/models/qwen3.8-next)
- [Recetas vLLM para Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
