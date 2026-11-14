# Wagot/qwen2.5-coder-7b-sales-lora

## Resumen

Wagot/qwen2.5-coder-7b-sales-lora es un ajuste fino (LoRA) del modelo Qwen2.5-Coder-7B-Instruct, publicado por el usuario Wagot en Hugging Face. El modelo parte de la versión cuantizada a 4 bits de Unsloth (`unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`) y se ha entrenado con la librería Unsloth y TRL, según indica el autor, con una velocidad de entrenamiento 2x superior. El propósito declarado es un fine-tuning orientado a "sales" (ventas), aunque la model card no detalla el dataset ni la tarea concreta.

El modelo hereda la arquitectura Qwen2 de 7 mil millones de parámetros, especializada en generación de código, y conserva la licencia Apache 2.0 del modelo base. El repositorio ocupa 0,2 GB, lo que sugiere que se distribuyen únicamente los pesos del adaptador LoRA y no el modelo completo. El idioma declarado es únicamente inglés.

La relevancia de esta ficha es limitada: se trata de un experimento de fine-tuning con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni documentación técnica más allá de la plantilla automática de Unsloth. Resulta útil como ejemplo de flujo de trabajo (Unsloth + TRL + LoRA sobre Qwen2.5-Coder) más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino mediante LoRA |
| Parametros totales | 7B (modelo base Qwen2.5-Coder-7B-Instruct); parámetros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32 768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Modelo base en bnb-4bit; cuantizaciones del adaptador no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el repositorio ocupa 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tipo LoRA sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parámetros. El entrenamiento se realizó con Unsloth (que optimiza kernels y reduce el uso de memoria) y TRL, partiendo de la versión del modelo base cuantizada a 4 bits con bitsandbytes (`bnb-4bit`). El autor declara un entrenamiento "2x más rápido" gracias a Unsloth, pero no se especifican el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rank, alpha, módulos objetivo) ni si se aplicaron técnicas de RLHF o DPO.

No se documenta ninguna innovación técnica propia más allá del uso de las herramientas mencionadas. La información sobre el proceso de entrenamiento es mínima: la model card es la plantilla automática de Unsloth con los campos rellenados por el autor.

## Capacidades

- Generación de texto y de código, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento y matemáticas básicas, según las capacidades del modelo base.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Orientación declarada a tareas de ventas ("sales"), sin detalle del comportamiento específico aprendido.

## Casos de uso

- Experimentación con fine-tuning de código: el repositorio sirve como referencia de un pipeline Unsloth + TRL + LoRA sobre Qwen2.5-Coder, replicable para otros dominios.
- Prototipado de asistentes de ventas en inglés: el ajuste está orientado a este dominio, aunque sin documentación que permita validar su calidad; adecuado solo para pruebas internas.
- Generación de textos comerciales (correos, descripciones de producto) en inglés: el modelo base es competente en generación de texto y el ajuste pretende especializarlo, pero no hay evidencia publicada de mejora.
- Base para nuevos ajustes: al ser un adaptador LoRA ligero (0,2 GB), puede combinarse o continuar entrenándose con otros datasets.
- Evaluación comparativa de adaptadores: útil para estudiar el efecto de un fine-tuning de dominio sobre un modelo de código.
- Docencia y demostraciones: ejemplo didáctico de fine-tuning con cuantización 4-bit y LoRA en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base de 7B en 4 bits requiere aproximadamente 5-6 GB de VRAM, en fp16 unos 14-16 GB (estimación a partir del tamaño del modelo base, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base, una RTX 3090/4090 (24 GB) o A100/H100 serían suficientes en fp16.
- Cabe en GPU de consumo: probablemente sí (RTX 3060 12 GB o superior) con cuantización 4 bits, según el modelo base; no confirmado para este ajuste.
- Opciones de despliegue: transformers (librería declarada); TGI y vLLM son compatibles con el modelo base, pero no se confirma su uso con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wagot/qwen2.5-coder-7b-sales-lora | 7B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste de dominio sin benchmarks |
| Qwen2.5-Coder-7B-Instruct | 7B | 32 768 tokens (modelo base) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Qwen2.5-Coder-7B (base) | 7B | 32 768 tokens (modelo base) | Apache 2.0 | Hugging Face | Versión sin instrucciones |
| CodeLlama-7B-Instruct | 7B | 16 384 tokens | Llama 2 (uso comercial con restricciones) | Hugging Face | Alternativa de código en inglés |

Los datos de contexto y licencia de los modelos comparados provienen de sus fichas oficiales; el rendimiento comparado no está disponible para el modelo de esta ficha.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación publicada: no hay evidencia de que el ajuste mejore al modelo base en tareas de ventas.
- Cero descargas y cero "likes": no hay validación por parte de la comunidad.
- Idioma limitado al inglés; no se ha entrenado ni evaluado en castellano.
- Riesgo de alucinación inherente al modelo base, sin mitigaciones documentadas.
- Posibles sesgos del dataset de ajuste no documentado (contenido comercial, sesgos de dominio).
- Al ser un adaptador LoRA, requiere cargar el modelo base cuantizado a 4 bits; la combinación exacta de pesos no está documentada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación previa.
- No se documentan restricciones de contexto ni límites de tokens específicos para este ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wagot/qwen2.5-coder-7b-sales-lora
- Modelo base (Unsloth, 4-bit): https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
