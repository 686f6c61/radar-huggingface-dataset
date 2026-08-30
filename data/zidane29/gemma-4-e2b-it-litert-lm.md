# Zidane29/gemma-4-E2B-it-litert-lm

## Resumen

El modelo `Zidane29/gemma-4-E2B-it-litert-lm` es una adaptación del modelo Gemma 4 E2B de Google, preparada para su despliegue en dispositivos móviles, escritorio, IoT y web mediante el framework LiteRT-LM. El modelo original, desarrollado por Google a partir de la misma tecnología que los modelos Gemini, está diseñado para ser ligero y eficiente, lo que lo hace idóneo para ejecución en dispositivos con recursos limitados. Esta versión concreta, publicada por el usuario Zidane29, ofrece el modelo en formato `.litertlm`, un formato específico de LiteRT-LM que permite su integración en aplicaciones nativas con aceleración por hardware (XNNPack para CPU y ML Drift para GPU).

La relevancia de este modelo radica en que permite ejecutar un LLM de última generación completamente en local, sin necesidad de conexión a internet, garantizando privacidad de los datos y bajas latencias. Según la documentación, el esquema de cuantización móvil de Gemma 4 (mezcla de pesos de 2, 4 y 8 bits) reduce la huella de memoria a aproximadamente 0,8 GB para uso de texto, aunque los parámetros de embedding ocupan 1,12 GB adicionales. El modelo soporta hasta 32k tokens de contexto, aunque los benchmarks oficiales se realizaron con 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32 000 tokens (soporte declarado) |
| Tipos de cuantizacion | Mixta 2-bit, 4-bit y 8-bit (esquema de cuantización móvil de Gemma 4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, perteneciente a la familia Gemma 4 de Google, construida con la misma investigación y tecnología que los modelos Gemini. La arquitectura es un transformer decoder estándar, aunque no se dispone de detalles específicos sobre el número de capas, dimensiones ocultas o mecanismos de atención en la información proporcionada. El entrenamiento del modelo original incluye técnicas de ajuste por instrucciones (sufijo `-it`), pero no se especifican los datos de entrenamiento ni el proceso de alineación (RLHF/DPO).

La innovación principal de esta versión reside en el formato de despliegue: LiteRT-LM es una capa de orquestación construida sobre LiteRT, el runtime multiplataforma de Google, que añade bibliotecas especializadas para gestión de KV-cache, plantillas de prompt y function calling. El esquema de cuantización móvil de Gemma 4, descrito en el blog oficial de Google, combina pesos de 2, 4 y 8 bits para minimizar el uso de memoria sin sacrificar calidad, y utiliza memory mapping para manejar los 1,12 GB de parámetros de embedding.

## Capacidades

- Generación de texto y completado de instrucciones: el modelo está optimizado para seguir instrucciones (sufijo `it`) y generar respuestas coherentes.
- Soporte de function calling: LiteRT-LM incluye APIs específicas para invocar funciones, lo que permite integrar el modelo en flujos de herramientas externas.
- Razonamiento multi-turno: la gestión de KV-cache y el contexto de hasta 32k tokens permiten conversaciones largas y contextualizadas.
- Multilingüe: no se especifican los idiomas soportados, pero los modelos Gemma suelen cubrir múltiples lenguas; se recomienda consultar la ficha del modelo base.
- Ejecución on-device: sin necesidad de conexión a internet, lo que garantiza privacidad y baja latencia.
- Capacidades multimodales: el modelo base Gemma 4 E2B incluye soporte de visión y audio, aunque en esta versión los módulos correspondientes se cargan bajo demanda para reducir consumo de memoria.

## Casos de uso

- Asistentes personales en dispositivos móviles: el modelo puede ejecutarse íntegramente en un smartphone, respondiendo preguntas y manteniendo conversaciones sin enviar datos a servidores externos, gracias a su bajo footprint de memoria (0,8 GB de pesos) y al soporte de function calling para acceder a calendario, contactos u otras apps.
- Atención al cliente automatizada en aplicaciones de escritorio: con una ventana de contexto de 32k tokens, puede gestionar interacciones multi-turno con historial largo, resolviendo incidencias típicas sin conexión a la nube.
- Generación de código en entornos de desarrollo integrado (IDE): el modelo puede autocompletar código y sugerir funciones mediante tool calling, integrándose en editores como VS Code o Android Studio, con la ventaja de funcionar offline.
- Traducción y procesamiento de texto en tiempo real: su naturaleza ligera permite integrarlo en aplicaciones de traducción automática o resumen de documentos en dispositivos IoT, como asistentes de hogar inteligente.
- Chatbots educativos en plataformas web: al ser desplegable en navegador mediante LiteRT-LM, puede servir como tutor virtual que responde preguntas de estudiantes sin coste de servidor, manteniendo la privacidad de los datos.
- Automatización de tareas de oficina: el modelo puede extraer información de correos o documentos, generar borradores de respuesta y ejecutar acciones a través de function calling, todo localmente en un portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que se realizaron pruebas de rendimiento con 1024 tokens de prefill y 256 tokens de decode con una longitud de contexto de 2048 tokens, pero no se ofrecen cifras concretas (latencia, throughput, etc.). Se recomienda consultar la ficha del modelo base `google/gemma-4-E2B-it` para datos de evaluación.

## Requisitos de hardware

- VRAM estimada: el peso de los parámetros cuantizados es de aproximadamente 0,8 GB para uso de texto, pero los embeddings (1,12 GB) se mapean en memoria, por lo que el requisito total de RAM/VRAM depende de la plataforma. En dispositivos móviles modernos con 6-8 GB de RAM es viable; en escritorio, cualquier GPU con 2 GB de VRAM o más es suficiente.
- GPU recomendadas: al estar orientado a on-device, no requiere GPU de gama alta. Funciona con aceleración por CPU (XNNPack) y GPU (ML Drift) en plataformas móviles y de escritorio.
- Compatibilidad con consumer GPU: sí, cualquier GPU integrada o dedicada moderna es válida, dado el bajo consumo.
- Opciones de despliegue: LiteRT-LM (CLI para escritorio, integración en Android/iOS, WebAssembly para navegador, IoT). No se mencionan vLLM, llama.cpp u otros runtimes.
- Latencia y throughput: no disponibles; los benchmarks oficiales no se han publicado en la información consultada.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa. El modelo es una variante de Gemma 4 E2B, por lo que se puede comparar con otros modelos de la misma familia (p. ej., Gemma 3 2B o Gemma 2 2B) en términos de tamaño y formato, pero no se tienen métricas de rendimiento concretas. En cuanto a alternativas de despliegue on-device, existen modelos como Phi-3-mini (Microsoft) o Qwen2-1.5B, pero no se dispone de datos comparativos fiables. Se recomienda consultar la documentación oficial de Google para evaluaciones detalladas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado específicamente para esta versión, pero los modelos Gemma pueden presentar sesgos derivados de sus datos de entrenamiento; se recomienda revisar la documentación del modelo base.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en temas especializados; debe validarse en aplicaciones críticas.
- Limitaciones de contexto: aunque soporta hasta 32k tokens, el rendimiento óptimo se probó con 2048 tokens; contextos más largos pueden degradar la calidad o aumentar la latencia.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propios términos de uso (consulta la ficha de Google); esta versión la hereda.
- Dependencia del ecosistema LiteRT-LM: el formato `.litertlm` es específico de LiteRT-LM; no es compatible con otros runtimes como ONNX o TensorFlow Lite sin conversión adicional.
- Limitaciones de idioma: no se especifican los idiomas soportados; es posible que el modelo tenga un rendimiento inferior en lenguas poco representadas en el entrenamiento.

## Enlaces

- Modelo en HuggingFace: [Zidane29/gemma-4-E2B-it-litert-lm](https://huggingface.co/Zidane29/gemma-4-E2B-it-litert-lm)
- Modelo base: [google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- Repositorio de la comunidad: [litert-community/gemma-4-E2B-it-litert-lm](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm)
- Documentación de LiteRT-LM: [https://ai.google.dev/edge/litert-lm/overview](https://ai.google.dev/edge/litert-lm/overview)
- Blog sobre cuantización de Gemma 4: [https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/](https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/)
