# vnbot-ai/VNBot-MotaZ-27B-FP8

## Resumen

VNBot-MotaZ-27B-FP8 es la versión cuantizada en FP8 del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies) como asistente de IA para tareas de texto e imagen en vietnamita e inglés. Se distribuye bajo licencia Apache-2.0 y utiliza la librería `transformers` con pesos en `safetensors` y formato de compresión `compressed-tensors`, lo que facilita su despliegue en infraestructuras de inferencia estándar.

El modelo parte de una arquitectura de la familia Qwen 3.5 (etiqueta `qwen3_5` en Hugging Face), con un total de 27.000 millones de parámetros según la nomenclatura del nombre, y una ventana de contexto declarada de 262.144 tokens. La variante FP8 emplea cuantización dinámica W8A8, lo que reduce el peso del repositorio a 12,2 GB (frente a los 32,1 GB indicados en la model card para los pesos originales en FP8, diferencia que probablemente refleja el empaquetado real de los tensores en el repositorio).

Su relevancia radica en que combina capacidades multimodales (image-text-to-text) con un contexto muy largo y un formato de cuantización pensado para servir en producción con vLLM. No obstante, la información pública disponible es muy limitada: no se detallan datos de entrenamiento, benchmarks ni composición del dataset, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`), image-text-to-text |
| Parámetros totales | 27.000 millones (según nomenclatura del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 dinámico W8A8 (compressed-tensors) |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura Qwen 3.5, un transformer multimodal capaz de procesar entradas de imagen y texto y generar respuestas textuales. La variante aquí descrita es una cuantización FP8 dinámica con activaciones y pesos en 8 bits (W8A8), realizada mediante la librería `compressed-tensors`, que permite reducir el uso de memoria y acelerar la inferencia en GPUs con soporte de FP8 (por ejemplo, arquitecturas Hopper o Ada Lovelace).

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF, DPO u otros) ni innovaciones técnicas específicas del modelo base VNBot-MotaZ-27B. La model card únicamente describe el propósito (asistente de IA de Origo Technologies para vietnamita e inglés) y las instrucciones de despliegue con vLLM.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés.
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text), lo que permite tareas de descripción, extracción de información o razonamiento sobre imágenes.
- Ventana de contexto de hasta 262.144 tokens, adecuada para documentos largos o conversaciones multi-turno extensas.
- Compatibilidad con endpoints estándar de Hugging Face (`endpoints_compatible`), lo que facilita su integración en plataformas de inferencia gestionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada en vietnamita e inglés: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens, manteniendo el hilo de la conversación y consultando historial extenso sin truncamientos agresivos.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, formularios escaneados o diagramas junto con instrucciones textuales, útil en digitalización de trámites o extracción de datos.
- Asistencia en soporte técnico bilingüe: su soporte de vietnamita e inglés permite atender a usuarios de ambos idiomas en un mismo sistema, traduciendo o respondiendo según el contexto.
- Procesamiento de contratos o informes extensos: con 262.144 tokens de contexto, puede resumir o responder preguntas sobre documentos de decenas de miles de palabras en una sola pasada.
- Generación de contenido multimodal para marketing: descripción de productos a partir de imágenes y generación de textos promocionales en vietnamita o inglés.
- Despliegue en producción con vLLM: la cuantización FP8 W8A8 y la compatibilidad con vLLM permiten servir el modelo con menor huella de memoria que la versión completa, facilitando el escalado en GPUs con soporte FP8.
- Integración en asistentes virtuales corporativos: al estar bajo Apache-2.0, puede incorporarse en productos comerciales sin restricciones de licencia adicionales, siempre que se cumplan las condiciones de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,2 GB en FP8, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, más memoria adicional para el KV cache. Con contexto de 262.144 tokens, el KV cache puede requerir decenas de GB adicionales según la configuración.
- GPU recomendadas: para aprovechar la cuantización FP8 de forma nativa se recomiendan GPUs con soporte FP8, como NVIDIA H100, H200, L40S o RTX 4090 (Ada Lovelace). En GPUs sin soporte FP8 (A100, por ejemplo) la inferencia puede funcionar pero sin las ventajas de rendimiento del formato.
- ¿Cabe en GPU de consumo? Los pesos (12,2 GB) caben en una RTX 4090 de 24 GB, pero el contexto máximo de 262.144 tokens no cabrá en memoria; sería necesario reducir `--max-model-len` o usar cuantización adicional del KV cache.
- Opciones de despliegue: vLLM es la opción documentada por el autor (`vllm serve vnbot-ai/VNBot-MotaZ-27B-FP8 --max-model-len 262144`). También es compatible con `transformers` y, al usar `compressed-tensors`, con ecosistemas que soporten este formato (por ejemplo, TGI o servidores compatibles con compressed-tensors). No se confirma soporte para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-FP8 | 27B | 262.144 | Apache-2.0 | vi, en | safetensors FP8 |
| Qwen2.5-VL-32B | 32B | 128.000 (aprox.) | Apache-2.0 | multilingüe | safetensors |
| Gemma 3 27B | 27B | 128.000 | Gemma license | multilingüe | safetensors |
| InternVL 2.5 26B | 26B | 32.000 (aprox.) | MIT | multilingüe | safetensors |

Nota: los datos de los modelos comparables son aproximados y se ofrecen como referencia de categoría; no se dispone de benchmarks del VNBot-MotaZ-27B-FP8 para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, alucinación o robustez; se recomienda validación propia antes de uso en producción.
- El soporte lingüístico declarado se limita a vietnamita e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La información sobre datos de entrenamiento y alineación es inexistente, lo que dificulta evaluar riesgos de sesgo o contaminación de benchmarks.
- Aunque la licencia es Apache-2.0, deben revisarse los ficheros `LICENSE` y `NOTICE` del repositorio por si incluyen atribuciones adicionales.
- El contexto máximo de 262.144 tokens requiere una configuración de memoria muy elevada; en la práctica habrá que reducirlo según el hardware disponible.
- Al ser una cuantización FP8, puede haber una ligera degradación de calidad respecto al modelo base en tareas sensibles a la precisión numérica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-FP8
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
