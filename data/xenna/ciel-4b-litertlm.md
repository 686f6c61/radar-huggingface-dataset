# Xenna/ciel-4b-litertlm

## Resumen

Ciel 4B es un modelo de lenguaje grande (LLM) diseñado específicamente para inferencia en dispositivos móviles y entornos edge, desarrollado por el autor Xenna bajo la marca StelNet. Su objetivo principal es ofrecer baja latencia en tareas de chat, agentes, comprensión de imágenes y audio, todo ello ejecutándose localmente en hardware de consumo. El modelo se distribuye en formato `.litertlm`, un formato propietario optimizado para el motor de inferencia StelNet, que a su vez es compatible con el runtime LiteRT de Google (anteriormente TensorFlow Lite). Con aproximadamente 4 mil millones de parámetros, se posiciona como una opción de tamaño medio para despliegue on-device, aunque no se han publicado detalles sobre su arquitectura interna, longitud de contexto o datos de entrenamiento.

La relevancia de este modelo radica en la creciente demanda de asistentes de IA que funcionen sin conexión, con privacidad garantizada y latencia mínima. Al estar pensado para aceleración GPU+CPU en dispositivos Android, Ciel 4B podría integrarse en aplicaciones móviles que requieran procesamiento local de lenguaje natural, visión o audio. Sin embargo, la documentación pública es muy limitada: no se especifican arquitectura, licencia concreta (solo "other"), ni resultados de benchmarks, lo que dificulta una evaluación rigurosa para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~4B |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (sin especificar términos) |
| Formato de pesos | `.litertlm` (formato propietario para LiteRT/StelNet) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de transformer, mecanismos de atención, etc.) ni sobre el proceso de entrenamiento. La model card solo menciona que está optimizado para el motor de inferencia StelNet y que soporta tareas de chat, agente, imagen y audio. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset, ni técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del formato de pesos `.litertlm`, que parece ser una variante del formato LiteRT-LM de Google.

## Capacidades

Según la model card, el modelo está diseñado para las siguientes tareas:

- Chat conversacional: generación de respuestas en diálogos multi-turno.
- Tareas de agente: posiblemente soporte de razonamiento multi-paso y ejecución de acciones.
- Comprensión de imágenes: capacidad de procesar y entender entradas visuales (no se especifica si es visión pura o multimodal).
- Comprensión de audio: procesamiento de señales de audio para tareas como transcripción o comandos de voz.
- Ejecución on-device: optimizado para baja latencia en dispositivos móviles y edge.

No se menciona explícitamente soporte de tool calling, function calling, ni modos de razonamiento extendido (thinking mode). Tampoco se indican capacidades multilingües específicas.

## Casos de uso

Dado el diseño orientado a on-device y las capacidades declaradas, los casos de uso plausibles incluyen:

- Asistente de voz sin conexión: integración en aplicaciones móviles para reconocimiento y respuesta de comandos de voz en tiempo real, sin depender de la nube.
- Análisis de imágenes en el dispositivo: clasificación o descripción de fotos capturadas con la cámara del móvil, útil en aplicaciones de accesibilidad o inventario visual.
- Chatbot privado para empresas: despliegue local en tablets o kioscos para atención al cliente, garantizando que los datos no salgan del dispositivo.
- Automatización de tareas en el móvil: uso como agente que interactúa con otras apps del sistema (enviar mensajes, crear recordatorios) mediante comandos de voz o texto.
- Transcripción de audio en tiempo real: conversión de voz a texto para notas, subtitulado o reuniones, con procesamiento local.
- Asistente de navegación para personas con discapacidad visual: combinación de visión (detección de objetos) y audio (descripción de entorno) en un solo modelo.

Estos casos se basan en las capacidades genéricas declaradas, pero no hay documentación que confirme el rendimiento real en estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones con modelos similares. Tampoco se ofrecen mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo de ~4B, podría caber en la memoria de dispositivos móviles modernos, pero no se especifica el consumo exacto.
- GPU recomendadas: no disponible. La model card indica "GPU + CPU acceleration on supported Android devices", lo que sugiere que está pensado para GPUs móviles (Adreno, Mali, etc.) y CPUs ARM.
- Compatibilidad con consumer GPU: no se indica si puede ejecutarse en GPUs de escritorio (NVIDIA, AMD) o solo en dispositivos Android.
- Opciones de despliegue: el modelo requiere el motor StelNet o un runtime compatible con LiteRT-LM. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (LLMs on-device de ~4B). No se puede establecer una comparativa fiable sin datos de rendimiento o especificaciones detalladas.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican arquitectura, datos de entrenamiento, ni licencia concreta, lo que impide evaluar su idoneidad para entornos de producción.
- Licencia "other": los términos de uso no están claros; podría haber restricciones comerciales o de redistribución. Se recomienda contactar al autor antes de cualquier uso comercial.
- Formato propietario: el modelo solo se distribuye en `.litertlm`, lo que limita su uso a runtimes específicos (StelNet, LiteRT-LM) y dificulta la integración con frameworks estándar.
- Riesgo de alucinación y sesgos: al no haber información sobre el dataset de entrenamiento ni evaluaciones de sesgo, no se puede garantizar la fiabilidad de las respuestas.
- Capacidades de visión y audio no verificadas: aunque se declaran, no hay ejemplos ni métricas que confirmen su funcionamiento real.
- Sin soporte de cuantización documentado: no se sabe si el modelo puede ejecutarse en configuraciones de memoria reducida más allá del formato original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xenna/ciel-4b-litertlm
- Repositorio LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
- Búsqueda de modelos compatibles con LiteRT-LM: https://huggingface.co/models?library=litert-lm
