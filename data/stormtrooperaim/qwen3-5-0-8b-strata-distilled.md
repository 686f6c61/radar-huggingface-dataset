# Stormtrooperaim/Qwen3.5-0.8B-Strata-distilled

## Resumen

Qwen3.5-0.8B-Strata-distilled es un ajuste fino experimental del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario Stormtrooperaim. Se trata de un ejercicio de validación de un pipeline de destilación sobre un conjunto de datos sintético y reducido denominado Strata-distilled, compuesto por conversaciones de chat con trazas de razonamiento en varios niveles de pensamiento (desactivado, bajo, medio y alto). El autor lo etiqueta explícitamente como una "test release", no como un modelo terminado.

El modelo parte de una arquitectura Qwen3.5 multimodal (pipeline image-text-to-text) con 873.438.784 parámetros reales según los pesos en safetensors, y se ha entrenado mediante LoRA (r=64) fusionado en los pesos, sobre tan solo 65 ejemplos de entrenamiento y 22 pasos. La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de destilación con datos sintéticos generados por un modelo fuertemente cuantizado; por otro, sirve como advertencia sobre los riesgos de publicar ajustes con volúmenes de datos y controles de calidad mínimos.

La licencia es Apache 2.0, heredada del modelo base, y el repositorio ocupa 1,8 GB. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el entrenamiento usó 4096 tokens como longitud máxima de secuencia) |
| Tipos de cuantizacion | No disponible (el autor indica que el modelo base no se cuantizó durante el entrenamiento; se distribuyen pesos en safetensors de 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B base, un transformer multimodal capaz de procesar imagen y texto (pipeline image-text-to-text). El ajuste se realizó con LoRA de rango 64, posteriormente fusionado en los pesos, en precisión de 16 bits (bf16/fp16) y sin cuantizar el modelo base. El entrenamiento consistió en 2 épocas y 22 pasos, con una tasa de aprendizaje de 0,0002 y una longitud máxima de secuencia de 4096 tokens, alcanzando una pérdida final de entrenamiento de 1,4175. Solo se entrenaron las respuestas del asistente, incluyendo las trazas de razonamiento dentro de etiquetas `<think>`.

El conjunto de datos Strata-distilled contiene 65 ejemplos (uno por turno de asistente) de chat sintético con trazas de razonamiento en varios niveles de pensamiento. Según el autor, los datos fueron generados por `swift-1.5-iq3_xxs`, un modelo fuertemente cuantizado, y no fueron revisados antes del entrenamiento. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del propio pipeline de destilación con niveles de pensamiento controlables mediante la plantilla de chat.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte para plantilla de chat.
- Razonamiento con trazas explícitas en modo thinking, activable o desactivable mediante el parámetro `enable_thinking` de la plantilla de chat.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Niveles de pensamiento (off / low / medium / high) según el dataset de destilación, aunque el control efectivo en inferencia depende de la plantilla de chat del modelo base.

## Casos de uso

- Evaluación de pipelines de destilación: el modelo sirve como banco de pruebas para validar un flujo de generación de datos sintéticos, entrenamiento LoRA y fusión de pesos, comparando la pérdida y la calidad de las trazas de razonamiento antes y después del ajuste.
- Prototipado rápido de asistentes conversacionales con razonamiento visible: útil para experimentar con la activación y desactivación del modo thinking en entornos de desarrollo, gracias a su tamaño reducido y a su integración directa con transformers.
- Investigación sobre datos sintéticos de baja calidad: permite estudiar cómo afecta entrenar con 65 ejemplos generados por un modelo cuantizado a la coherencia y fidelidad factual del modelo resultante, como caso de estudio de degradación.
- Pruebas de integración multimodal en pipelines ligeros: al heredar la capacidad image-text-to-text del base, puede emplearse para validar conectores de entrada de imagen en prototipos, siempre con expectativas de calidad limitadas.
- Docencia y demostraciones sobre ajuste fino: su reducido tamaño (873 M de parámetros) y su receta de entrenamiento documentada lo hacen adecuado para explicar LoRA, fusión de pesos y control de thinking en cursos o talleres.
- Verificación de compatibilidad con endpoints: la etiqueta `endpoints_compatible` permite probar el despliegue en infraestructuras compatibles con la API de transformers, aunque no se recomienda para cargas de producción reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB, aunque el autor no distribuye versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter como A100 o H100, aunque estarían sobredimensionadas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con al menos 6 GB de VRAM.
- Opciones de despliegue: transformers (documentado por el autor), y potencialmente vLLM o TGI si se convierte el checkpoint; llama.cpp y Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Strata-distilled | 873 M | No disponible | Apache 2.0 | Hugging Face (35 descargas) | Ajuste experimental con 65 ejemplos; calidad no verificada |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Apache 2.0 | Hugging Face | Modelo base oficial, sin ajuste sintético; referencia de calidad |
| Alternativas de ~1 B con razonamiento | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría más allá del propio modelo base.

## Limitaciones y advertencias

- El autor advierte explícitamente de que es una "test release" y no un modelo terminado; no debe usarse para nada importante.
- Los datos de entrenamiento fueron generados por `swift-1.5-iq3_xxs`, un modelo fuertemente cuantizado, y no fueron revisados: se esperan errores factuales, razonamiento defectuoso y calidad desigual.
- El volumen de entrenamiento es mínimo (65 ejemplos, 22 pasos), lo que limita la generalización y aumenta el riesgo de sobreajuste a patrones concretos del dataset.
- Los modelos pequeños pueden entrar en bucles en modo thinking; el autor recomienda fijar un límite de `max_new_tokens`.
- No hay información sobre sesgos, idiomas soportados ni evaluación de seguridad.
- Riesgo elevado de alucinación y de trazas de razonamiento plausibles pero incorrectas.
- Licencia Apache 2.0: permite uso comercial, pero la calidad del modelo hace desaconsejable su empleo en producción sin una evaluación exhaustiva previa.
- No se distribuyen versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Strata-distilled
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de destilación: https://huggingface.co/datasets/Stormtrooperaim/Strata-distilled
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
