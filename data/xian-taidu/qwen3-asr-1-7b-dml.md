# xian-taidu/Qwen3-ASR-1.7B-DML

## Resumen

El modelo Qwen3-ASR-1.7B-DML es una variante del modelo de reconocimiento automático de habla Qwen3-ASR-1.7B, desarrollado originalmente por QwenLM. Este repositorio, publicado por xian-taidu, ofrece una conversión del modelo a formatos ONNX y GGUF, con licencia MIT. El modelo está diseñado para tareas de ASR e identificación de idioma, con soporte para 52 idiomas y dialectos según el proyecto original. La capacidad de comprensión de audio proviene del modelo base Qwen3-Omni.

El peso total en safetensors es de 2.031.739.904 parámetros, aunque el nombre del modelo indica 1.7B. El repositorio tiene un tamaño de 4.7 GB y no presenta descargas ni likes en el momento de la consulta. La arquitectura interna y la longitud de contexto no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de reconocimiento de habla basado en Qwen3-Omni) |
| Parametros totales | 2.031.739.904 (el nombre del modelo indica 1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio incluye formatos ONNX y GGUF; no se especifican los tipos de cuantización) |
| Idiomas soportados | 52 idiomas y dialectos (según el proyecto Qwen3-ASR) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo Qwen3-ASR-1.7B-DML es una conversión del modelo original Qwen3-ASR-1.7B, que forma parte de la familia Qwen3-ASR desarrollada por QwenLM. Según la documentación del proyecto, estos modelos aprovechan la capacidad de comprensión de audio del modelo base Qwen3-Omni y se entrenan con datos de habla a gran escala. No se dispone de información detallada sobre la arquitectura interna (número de capas, dimensiones, mecanismos de atención) ni sobre el proceso de entrenamiento (tamaño del dataset, composición, técnicas de alineación como RLHF o DPO) en la información proporcionada. El repositorio de xian-taidu añade soporte de exportación a ONNX y GGUF, lo que facilita el despliegue en entornos de inferencia con diferentes requisitos.

## Capacidades

- Reconocimiento automático de habla (ASR): transcribe audio a texto.
- Identificación de idioma: detecta el idioma hablado en el audio.
- Soporte multilingüe: cubre 52 idiomas y dialectos.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o generación de texto libre en la información disponible.
- El modelo está orientado específicamente a tareas de audio a texto, no a conversación o generación de lenguaje.

## Casos de uso

- Transcripción de reuniones y llamadas: el modelo puede convertir audio de reuniones en texto, gracias a su soporte multilingüe y su tamaño compacto, lo que permite su ejecución en servidores con recursos limitados.
- Subtitulado automático de vídeos: se puede integrar en pipelines de procesado de vídeo para generar subtítulos en 52 idiomas, reduciendo costes de producción.
- Asistentes de voz para atención al cliente: el modelo puede transcribir consultas de voz y alimentar sistemas de respuesta automática o análisis de sentimiento.
- Accesibilidad para personas con discapacidad auditiva: permite generar subtítulos en directo en aplicaciones de videollamada, mejorando la inclusión.
- Análisis de audio en centros de contacto: transcribe llamadas para su posterior análisis, búsqueda de palabras clave o auditoría de calidad.
- Transcripción de entrevistas y podcasts: útil para periodistas y creadores de contenido que necesitan convertir audio en texto para documentación o publicación.
- Indexación de contenido de audio: convierte audio en texto para habilitar búsqueda por palabras clave en bibliotecas de medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 2.031.739.904 parámetros, en FP16 se necesitan aproximadamente 4 GB de VRAM; en INT8, alrededor de 2 GB; y en cuantizaciones de 4 bits, cerca de 1 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros.
- GPU recomendadas: una RTX 3060 de 12 GB o superior es suficiente para FP16; para INT8, una RTX 2060 o similar; para despliegue en producción con grandes volúmenes de audio, se recomienda A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, etc., especialmente con cuantización.
- Opciones de despliegue: llama.cpp para GGUF, ONNX Runtime para ONNX, y posibles integraciones con vLLM o TGI si se adaptan los formatos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-ASR-1.7B-DML | 2.031.739.904 | 52 | MIT | HuggingFace |
| Qwen3-ASR-0.6B | 0.6B (según proyecto) | 52 | No disponible | HuggingFace |
| Qwen3-ASR-1.7B (original) | No disponible (nombre indica 1.7B) | 52 | No disponible | HuggingFace |

No se dispone de datos de benchmarks para realizar una comparativa de rendimiento. La comparativa se basa únicamente en características generales disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: al ser un modelo de ASR, puede presentar alucinaciones de habla, generando texto que no existe en el audio, especialmente en entornos ruidosos.
- Limitaciones de contexto: la longitud de contexto no está disponible; se desconoce la duración máxima de audio que puede procesar de una vez.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y distribución, siempre que se incluya el aviso de copyright. No se han identificado restricciones adicionales en este repositorio.
- Caveat importante: este repositorio es una conversión no oficial creada por xian-taidu, no el modelo original de QwenLM. Puede haber diferencias en el comportamiento o en la implementación respecto al modelo original. Además, no se proporciona documentación técnica detallada en la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xian-taidu/Qwen3-ASR-1.7B-DML
- Proyecto Qwen3-ASR en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Modelo original Qwen3-ASR-1.7B en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
