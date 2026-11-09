# Valen-Team/Valen-Decision-1.5-2B-ONNX

## Resumen
Valen-Decision-1.5-2B-ONNX es la variante en formato ONNX de Valen-Decision-1.5-2B, un modelo de decisión multimodal (image-text-to-text) desarrollado por Valen-Team y construido sobre Qwen/Qwen3.5-2B. A diferencia de un modelo generativo convencional, Valen está especializado en producir salidas estructuradas y tipadas (predicados, probabilidades, elecciones y puntuaciones) a partir de texto, imágenes y vídeo, en una sola pasada forward. Resuelve tareas de clasificación y verificación: enrutado de tickets de soporte, validación de imágenes de producto frente a requisitos y etiquetado de acciones en vídeo.

El modelo se distribuye con licencia Apache 2.0, un repositorio de 8,9 GB y soporte para la librería transformers mediante código personalizado (`trust_remote_code=True`). La familia Valen se ofrece en tres tamaños (0,8B, 2B y 4B) y tres formatos (nativo, ONNX y GGUF), con variantes de precisión específicas por formato; esta ficha corresponde a la variante ONNX de 2B.

La relevancia actual del modelo radica en su enfoque: en lugar de generar texto libre, expone una API de "decisiones" compatible con dos formatos (SystemOne de Jev y Decisions de OpenAI) y devuelve resultados estructurados verificables, lo que facilita su integración en pipelines de producción donde se necesita una respuesta tipada y no una cadena de texto. El autor publica además código de entrenamiento y un dataset de 100k ejemplos para ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5-2B (image-text-to-text), con cabecera de decisión y salida estructurada; código personalizado |
| Parametros totales | 2B (según denominación del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q8-mlp (variante de cuantización específica del formato ONNX); la familia incluye también F32 y Q8_0 en otros formatos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (repo de 8,9 GB); la familia ofrece también pesos nativos y GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal de 2B parámetros, y añade una capa de decisión que transforma la entrada (texto, imagen o vídeo) en salidas tipadas: predicados con probabilidad, elecciones (choices) y puntuaciones (scores), todo en un único forward pass. La API admite dos esquemas de petición: SystemOne (formato `state`/`questions` con tipos como `noul`) y Decisions (formato `input`/`questions` con tipos como `predicate`). Esta variante ONNX está pensada para ejecución offline en Python y JavaScript mediante SDKs ONNX, y para despliegue en GPU vía Python ONNX CUDA.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. El autor publica el código de entrenamiento en GitHub y el dataset Valen-Training-General-100k en Hugging Face, lo que permite reproducir o extender el ajuste. La model card menciona que las variantes GGUF Q4/Q5 no superaron los controles de calidad y que solo se recomiendan F32/Q8_0; también advierte que el soporte en llama.cpp/Ollama oficiales sin modificar no está garantizado.

## Capacidades
- Clasificación de mensajes de cliente y enrutado de tickets mediante predicados con probabilidad asociada.
- Verificación de imágenes frente a requisitos (por ejemplo, cribado de imágenes de producto) con salida estructurada.
- Identificación de acciones en vídeo y etiquetado de contenido audiovisual.
- Salida tipada y estructurada (predicados, elecciones, puntuaciones) en una sola pasada, sin generación de texto libre.
- Soporte de dos formatos de API de decisión: SystemOne (Jev) y Decisions (OpenAI).
- Entrada multimodal: texto, imagen y vídeo (el vídeo directo no está soportado por el paquete GGUF precompilado 0.1.0 según la model card; para ONNX no se detalla).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan tool calling, function calling ni modo de razonamiento multi-paso en la información disponible.

## Casos de uso
- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y devuelve predicados con probabilidad para cada categoría, permitiendo dirigirlo automáticamente al equipo adecuado. El Cookbook oficial documenta este flujo completo.
- Cribado de imágenes de producto: se envía la imagen y una lista de requisitos; el modelo devuelve, por cada requisito, una probabilidad de cumplimiento, lo que permite aceptar o rechazar automáticamente listados en un marketplace.
- Etiquetado de vídeo: identificación de acciones presentes en un clip para indexación y búsqueda posterior, con salidas estructuradas listas para almacenar en base de datos.
- Moderación de contenido: verificación de si un texto o imagen cumple políticas definidas como predicados, con umbral de probabilidad configurable.
- Automatización de flujos de decisión en aplicaciones Python/JavaScript offline: uso de los SDKs ONNX para clasificar entradas localmente sin conexión ni GPU dedicada.
- Servicio C++ en Linux sobre CPU: despliegue con el runtime personalizado de Valen en formato GGUF (prebuilt 0.1.0) para servicios de decisión de baja latencia sin GPU.
- Ajuste fino para dominios propios: a partir del código de entrenamiento y del dataset Valen-Training-General-100k publicados, adaptar el modelo a taxonomías y requisitos específicos de una organización.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repo ONNX es de 8,9 GB, pero la model card advierte que el tamaño de fichero no equivale al requisito de RAM.
- GPU recomendadas: no se especifican modelos concretos; el ejemplo de la model card ejecuta en CUDA con `torch.float32_matmul_precision("highest")` y `cudnn.allow_tf32 = False`.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la información disponible.
- Opciones de despliegue: SDKs ONNX para Python/JavaScript (offline), Python ONNX CUDA para GPU, runtime personalizado de Valen con GGUF para C++ en Linux CPU, y backends SGLang/vLLM mencionados en la guía de versiones. No se garantiza soporte en llama.cpp/Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Valen-Decision-1.5-2B-ONNX | 2B | no disponible | ONNX | apache-2.0 | Decisión multimodal con salida estructurada |
| Valen-Decision-1.5-0.8B | 0,8B | no disponible | nativo/ONNX/GGUF | apache-2.0 | Misma familia, menor tamaño |
| Valen-Decision-1.5-4B | 4B | no disponible | nativo/ONNX/GGUF | apache-2.0 | Misma familia, mayor tamaño |
| Qwen/Qwen3.5-2B | 2B | no disponible | nativo | no disponible | Modelo base generativo multimodal |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias
- No se han publicado datos de sesgos, evaluación de alucinación ni cobertura idiomática; deben evaluarse antes de uso en producción.
- El modelo está diseñado para devolver decisiones estructuradas, no para generación de texto libre; usarlo fuera de ese propósito puede dar resultados no representativos.
- Las variantes GGUF Q4/Q5 no superaron los controles de calidad según la model card; solo se recomiendan F32/Q8_0 en ese formato.
- El paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo; las pruebas históricas de vídeo con compilación desde fuente no cualifican al paquete precompilado.
- No se garantiza compatibilidad con llama.cpp/Ollama oficiales sin modificar.
- La validación P1 se limita a imágenes fijas sobre el binario precompilado exacto con 0.8B Q8_0; no debe extenderse a otros tamaños.
- El tamaño del fichero no equivale al requisito de RAM; debe medirse el consumo real en el entorno de despliegue.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-2B y de los datasets publicados antes de uso comercial.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar el código antes de desplegar.

## Enlaces
- Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo y API gratuita: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Documentación de inicio rápido: https://valen-team.github.io/docs/valen/quickstart/
- Documentación de API: https://valen-team.github.io/docs/valen/api/
- Guía de selección de versión: https://valen-team.github.io/docs/valen/choosing/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- API SystemOne (Jev): https://docs.typesafe.ai/api/system-one
- API Decisions (OpenAI): https://developers.openai.com/api/docs/guides/decisions
- Demo en vídeo: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
