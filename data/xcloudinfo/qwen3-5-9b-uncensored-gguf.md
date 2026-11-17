# xCloudinfo/Qwen3.5-9B-Uncensored-GGUF

## Resumen

Qwen3.5-9B-Uncensored-GGUF es una versión derivada del modelo base Qwen/Qwen3.5-9B, publicada por xCloudinfo (云碩科技) bajo el nombre comercial xVITA. Se trata de una variante "abliterated" o "uncensored" cuyo objetivo es reducir la tasa de rechazos reflejos ante peticiones legales pero limítrofes, manteniendo al mismo tiempo la coherencia y las capacidades originales del modelo base. El autor aplica la misma metodología que en su modelo hermano de mayor tamaño, Qwen3.8-27B-Uncensored-GGUF, pero en este caso orientada a máquinas con poca VRAM (tarjetas individuales de 8–12 GB y dispositivos de borde).

El modelo cuenta con 8.953.803.264 parámetros totales (aproximadamente 9B) y se distribuye exclusivamente en formato GGUF en seis niveles de cuantización, además de un proyector multimodal (mmproj) en f16 para la torre de visión. La licencia es Apache 2.0, heredada del modelo base, y los idiomas declarados en la model card son chino (zh) e inglés (en).

Su relevancia actual radica en que ofrece una alternativa de despliegue local en hardware modesto para casos donde el modelo original rechaza peticiones legítimas, con una divulgación transparente de las cifras de rechazo en dos escenarios distintos (safetensors fusionado con decodificación greedy y GGUF cuantizado con muestreo por defecto).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base Qwen3.5-9B; detalles específicos no disponibles) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (GGUF); mmproj en f16 |
| Idiomas soportados | zh, en (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo es una modificación del Qwen3.5-9B original mediante la herramienta Heretic, que automatiza la búsqueda de hiperparámetros (200 pruebas) minimizando simultáneamente la tasa de rechazo y la divergencia KL respecto al modelo base, con el fin de preservar las capacidades originales. El proceso se ejecutó en dos iteraciones: tras la convergencia de la primera, se aplicó una segunda iteración sobre el resultado para reducir aún más la tasa de rechazo.

Los detalles de arquitectura interna (tipo de atención, número de capas, composición del dataset de entrenamiento original, uso de RLHF/DPO) no se especifican en la información disponible. La model card sí documenta una corrección técnica relevante: el problema de "MTP fantasma" común a la serie Qwen3.5, donde el metadato `qwen35.block_count` contaba una capa de más (33 frente a las 32 reales) y `nextn_predict_layers` estaba mal etiquetado como 1. Ambos campos se corrigieron antes de la cuantización para evitar errores de carga o comportamientos anómalos en el motor de inferencia.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Capacidades multimodales (visión) mediante el proyector `mmproj-Qwen3.5-9B-Uncensored-xCloud-f16.gguf`.
- Modo de razonamiento configurable: la plantilla de chat admite `enable_thinking` (true/false) mediante `--chat-template-kwargs`.
- Reducción de rechazos reflejos ante preguntas legales pero limítrofes (objetivo principal de la modificación).
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no documentadas específicamente para esta variante.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 8–12 GB: el nivel Q4_K_M o IQ4_XS permite cargar el modelo en una única tarjeta consumer, algo inviable con el modelo hermano de 27B, lo que lo hace adecuado para prototipado local.
- Asistentes conversacionales en local para entornos con requisitos de privacidad: al ejecutarse con llama.cpp o llama-server sin dependencia de la nube, los datos no salen del equipo, lo que encaja en despliegues de borde.
- Procesamiento de documentos con imágenes: el proyector mmproj en f16 habilita tareas de descripción de imágenes o extracción de información visual combinadas con texto en el mismo flujo.
- Investigación sobre alineación y tasas de rechazo: el modelo sirve como caso de estudio reproducible de la metodología Heretic en dos iteraciones, con cifras de rechazo publicadas para comparar safetensors frente a GGUF cuantizado.
- Generación de contenido creativo en chino tradicional: la model card indica coherencia intacta en ítems benignos con chino tradicional fluido y correcto, útil para redacción y edición en ese idioma.
- Evaluación de cuantizaciones: los seis niveles disponibles (de Q8_0 a IQ2_M) permiten medir el impacto de la cuantización en la tasa de rechazo; el propio autor documenta un repunte de 0/10 a 2/10 al pasar de safetensors a GGUF.
- Integración en pipelines con plantilla Jinja: el uso de `--jinja` y `--chat-template-kwargs` facilita el control del modo thinking desde código de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas internas de tasa de rechazo sobre un conjunto held-out de 10 ítems de daño severo:

| Escenario | Configuración | Tasa de rechazo |
|---|---|---|
| safetensors fusionado, iter1 | greedy | 3/10 |
| safetensors fusionado, iter2 | greedy | 0/10 |
| GGUF Q6_K, iter2 | muestreo por defecto (llama-server) | 2/10 |
| GGUF Q4_K_M, iter2 | muestreo por defecto (llama-server) | 2/10 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor indica que el modelo está pensado para tarjetas individuales de 8–12 GB y dispositivos de borde, lo que sitúa el nivel Q4_K_M/IQ4_XS en ese rango.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información proporcionada.
- GPU consumer: sí cabe en GPU consumer de 8–12 GB según el autor, siempre eligiendo cuantizaciones de 4 bits o inferiores; los niveles Q8_0 y Q6_K requieren más memoria.
- Opciones de despliegue: llama.cpp, llama-server y cualquier motor compatible con GGUF. El ejemplo de la model card usa `llama-server -m ... --jinja --chat-template-kwargs '{"enable_thinking":false}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-GGUF (este) | ~9B | no disponible | Apache 2.0 | GGUF (6 niveles) | Variante sin rechazos reflejos, con visión vía mmproj |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Apache 2.0 | safetensors (no confirmado en la información) | Modelo original sin modificar; mantiene rechazos estándar |
| xCloudinfo/Qwen3.8-27B-Uncensored-GGUF | ~27B (no confirmado) | no disponible | no disponible | GGUF | Misma metodología Heretic, mayor tamaño y requisitos de VRAM |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos reflejos puede aumentar la probabilidad de generar contenido inapropiado o dañino; el autor declara explícitamente que no respalda usos ilegales y que la responsabilidad recae en el usuario.
- La tasa de rechazo repunta al cuantizar y al usar muestreo por defecto (de 0/10 en safetensors greedy a 2/10 en GGUF), por lo que el comportamiento no es idéntico entre formatos.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo general de los modelos de lenguaje de este tamaño.
- Idiomas limitados a chino e inglés según la model card; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que dificulta planificar despliegues con ventanas largas.
- La corrección de metadatos MTP es específica de esta conversión; otras conversiones de la serie Qwen3.5 pueden presentar el mismo problema de capas.
- El repositorio no incluye los pesos en safetensors, solo GGUF; para fine-tuning sería necesario partir del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero las implicaciones legales del comportamiento "uncensored" en producción deben evaluarse por el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/Qwen3.5-9B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo hermano de 27B: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-GGUF
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Perfil del autor en Hugging Face: https://hf.co/xCloudinfo
