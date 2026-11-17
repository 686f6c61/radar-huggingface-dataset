# t-firefly/qwen3.5-0.8b-rkllm-rk3576

## Resumen

Qwen3.5-0.8B (versión RKLLM para RK3576) es una conversión del modelo multimodal Qwen3.5-0.8B desarrollado por el equipo Qwen, adaptada por el equipo de IA de Firefly (t-firefly) para su ejecución sobre el SoC Rockchip RK3576 mediante la herramienta de despliegue LlamaPi. El modelo original unifica comprensión de texto e imagen en una sola red y cubre tareas de razonamiento, generación de código, uso de agentes y procesamiento visual, con soporte declarado de 201 idiomas y dialectos.

El interés de esta ficha no reside en el modelo base, sino en el artefacto de despliegue: se trata de una conversión orientada a inferencia en el borde (edge AI) sobre hardware Rockchip, empaquetada en formato RKLLM y distribuida con licencia Apache 2.0. El repositorio ocupa 1,8 GB y se publicó el 17 de noviembre de 2026.

La información disponible es limitada: la model card es breve, no incluye detalles sobre arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks. Los datos sobre el modelo original (Qwen3.5-0.8B) proceden exclusivamente de lo que declara el autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen); detalles internos no disponibles |
| Parametros totales | 0,8 mil millones (según el nombre del modelo; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato RKLLM para RK3576; niveles concretos no especificados) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (conversión para Rockchip RK3576); pesos originales del modelo base no incluidos en esta ficha |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer compacto de 0,8 mil millones de parámetros que unifica entrada de texto e imagen (pipeline `image-text-to-text`). La model card del autor no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones técnicas concretas como decodificación especulativa o mecanismos de atención lineal.

El artefacto publicado por Firefly es una conversión del modelo original a formato RKLLM para el SoC RK3576, pensada para ejecutarse a través de LlamaPi, la herramienta de despliegue del fabricante. LlamaPi gestiona la descarga, carga y ejecución del modelo con el comando `llamapi run qwen3.5:0.8b`. No se documentan en la información disponible los detalles del proceso de conversión (calibración de cuantización, capas adaptadas, etc.).

## Capacidades

- Generación de texto y razonamiento general, según declara el autor del modelo original.
- Generación de código y resolución de tareas de programación.
- Capacidades de agente y razonamiento multi-paso.
- Comprensión de imágenes combinada con texto (image-text-to-text).
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente visual en dispositivos embebidos: el modelo puede recibir una imagen y una pregunta de texto en un dispositivo con SoC RK3576 (por ejemplo, un panel industrial o una cámara inteligente) y devolver una descripción o respuesta, gracias a su pipeline image-text-to-text y a su tamaño reducido de 0,8B parámetros.
- Clasificación y descripción de imágenes en el borde: en escenarios de inspección visual o inventario, el modelo puede generar descripciones textuales de las capturas sin enviar datos a la nube, lo que reduce latencia y mejora la privacidad.
- Interfaces conversacionales locales: integrado mediante LlamaPi en un dispositivo Rockchip, puede gestionar diálogos multi-turno para kioscos, electrodomésticos o terminales de atención en local.
- Procesamiento de documentación con OCR asistido: combinando entrada de imagen y texto, puede resumir o extraer información de documentos escaneados en un dispositivo de bajo consumo.
- Prototipado de agentes multimodales en hardware de bajo coste: el soporte declarado de tareas de agente permite construir flujos multi-paso que consulten herramientas locales a partir de entradas visuales.
- Desarrollo y validación de pipelines edge AI: el formato RKLLM y la herramienta LlamaPi facilitan probar el modelo en placas RK3576 antes de desplegar variantes mayores de la familia Qwen3.5.
- Traducción y asistencia multilingüe local: con 201 idiomas declarados, puede emplearse en dispositivos de traducción o asistentes de viaje sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3576 (NPU integrada), según la model card.
- VRAM/RAM estimada: no disponible; el repositorio ocupa 1,8 GB, lo que da una referencia del espacio de almacenamiento necesario, pero no del consumo en ejecución.
- GPU recomendadas: no aplica; el artefacto está orientado a la NPU del RK3576, no a GPU de escritorio.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; esta conversión concreta no está pensada para ese hardware.
- Opciones de despliegue: LlamaPi (`llamapi run qwen3.5:0.8b`), herramienta oficial de Firefly para RK3576. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (RKLLM, este) | 0,8B | no disponible | Sí (imagen-texto) | Apache 2.0 | Rockchip RK3576 |
| Qwen3.5-0.8B (original) | 0,8B | no disponible | Sí (imagen-texto) | Apache 2.0 | GPU/CPU genéricas |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo ni del proceso de conversión.
- Riesgo de alucinación inherente a los modelos de 0,8B parámetros; no se aportan evaluaciones de fidelidad.
- Longitud de contexto no especificada: no es posible planificar cargas con ventanas largas sin verificación empírica.
- El artefacto está atado al SoC RK3576 y a la herramienta LlamaPi; no es portable a otros backends sin reconversión.
- Los pesos publicados son una conversión de terceros (Firefly), no los pesos oficiales de Qwen; la calidad puede diferir de la del modelo original.
- Licencia Apache 2.0 permite uso comercial, pero los derechos del modelo subyacente siguen perteneciendo al equipo Qwen y se rigen por su licencia oficial.
- No hay información sobre cuantización aplicada ni sobre la degradación de precisión resultante.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/t-firefly/qwen3.5-0.8b-rkllm-rk3576
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Firefly (fabricante): https://www.t-firefly.com/
- Documentación de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
