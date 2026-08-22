# Taeri077/dama-aibrain

## Resumen

Dama-aibrain es un modelo de lenguaje finetuneado por Taeri077 sobre la base `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del modelo Gemma 4 de Google. Desarrollado con la librería Unsloth y el framework TRL de Hugging Face, este modelo de aproximadamente 5.123 millones de parámetros está orientado a la generación de texto conversacional en inglés. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque no se han publicado detalles sobre el conjunto de datos de entrenamiento ni sobre la arquitectura exacta, su tamaño lo sitúa en el rango de modelos de 5B, adecuado para inferencia en GPUs de consumo medio. El proyecto destaca como ejemplo de fine-tuning eficiente con Unsloth, que reduce el tiempo de entrenamiento y el uso de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 5.123.182.051 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del modelo `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits de Gemma 4. No se han publicado detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.), aunque por ser un modelo de la serie Gemma se asume una arquitectura transformer decoder-only. El entrenamiento se realizó con Unsloth, una librería que optimiza el fine-tuning mediante kernels personalizados y reducción del uso de memoria, y con la librería TRL de Hugging Face. No se ha informado sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La única información disponible es que el entrenamiento fue 2 veces más rápido que un fine-tuning estándar gracias a Unsloth.

## Capacidades

- Generación de texto en inglés, orientado a conversación.
- Posible procesamiento de imágenes (según la etiqueta `image-text-to-text`), aunque no se ha confirmado en la documentación.
- Compatible con el pipeline `text-generation` de Hugging Face.
- No se ha documentado soporte de tool calling, function calling ni agentes multi-paso.
- Solo soporta el idioma inglés.

## Casos de uso

- Asistente conversacional en inglés: puede integrarse en un chatbot para responder preguntas frecuentes o mantener diálogos, gracias a su tamaño medio que permite ejecutarse en una GPU de consumo.
- Generación de contenido creativo: redacción de correos electrónicos, resúmenes, borradores o ideas en inglés.
- Prototipado y evaluación: útil para experimentar con la familia Gemma 4 y validar tareas de NLP antes de escalar a modelos mayores.
- Entorno educativo: sirve como ejemplo de fine-tuning con Unsloth y TRL, para aprender a personalizar modelos de lenguaje.
- Despliegue en infraestructuras modestas: con licencia Apache 2.0 y 5B parámetros, puede ejecutarse en una VM con una GPU de 12-16 GB de VRAM, reduciendo costes.
- Generación de código básico: aunque no hay benchmarks publicados, puede generar fragmentos sencillos en lenguajes como Python o JavaScript, pero se recomienda verificar la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 5.123 millones de parámetros y pesos en fp16 (formato habitual de safetensors), se requieren aproximadamente 10,2 GB solo para los pesos, más memoria para activaciones y contexto. Se recomienda al menos 12 GB de VRAM.
- GPUs recomendadas: RTX 3080 (12 GB), RTX 4080/4090, A10, A100, H100 o equivalentes.
- Puede caber en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) con margen suficiente.
- Opciones de despliegue: al ser un modelo `transformers`, se puede servir con vLLM, TGI, o convertir a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no se ha especificado.

## Comparativa con modelos similares

No hay información suficiente para comparar con otros modelos de la misma categoría. No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos comparables. No disponible.

## Limitaciones y advertencias

- Sesgo y alucinación: al ser un modelo pequeño (5B) es más propenso a errores y alucinaciones que modelos de mayor escala, aunque no se han documentado casos concretos.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, por lo que no es adecuado para tareas que requieran ventanas largas.
- Idioma: solo soporta inglés; no está entrenado para otros idiomas.
- Documentación incompleta: la model card no ofrece detalles sobre el dataset de entrenamiento, lo que dificulta evaluar posibles sesgos.
- Licencia: Apache 2.0 permite uso comercial, pero hay que verificar la licencia del modelo base Gemma 4 para asegurar compatibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Taeri077/dama-aibrain)
- [Perfil del autor en Hugging Face](https://huggingface.co/Taeri077)
- [Unsloth en GitHub](https://github.com/unslothai/unsloth)
- [Modelo base en Hugging Face](https://huggingface.co/unsloth/gemma-4-e2b-it-unsloth-bnb-4bit)
