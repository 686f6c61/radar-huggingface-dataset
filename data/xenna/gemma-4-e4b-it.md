# Xenna/gemma-4-e4b-it

## Resumen

El modelo `Xenna/gemma-4-e4b-it` es una cuantización en INT8 del modelo instructivo Gemma 3 4B-IT de Google, convertido al formato LiteRT-LM (`.task`) para su ejecución en dispositivos móviles. A pesar de su nombre, que sugiere una relación con la familia Gemma 4, el modelo base declarado en la model card es `google/gemma-3-4b-it`. El autor, Xenna, ha empaquetado el modelo para que pueda ejecutarse de forma local en dispositivos con el runtime LiteRT, sin necesidad de conexión a la nube.

El resultado es un archivo de aproximadamente 3,7 GB que permite desplegar un asistente conversacional en smartphones y otros dispositivos con recursos limitados. La relevancia de este modelo radica en su capacidad para llevar inferencia de lenguaje natural a entornos on-device, reduciendo la latencia y preservando la privacidad de los datos. No se trata de un modelo nuevo entrenado desde cero, sino de una adaptación de un modelo existente para un caso de uso específico: chat en móvil.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 4B-IT) |
| Parametros totales | 4B (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT-LM task (.task) |

## Arquitectura y entrenamiento

El modelo es una cuantización del Gemma 3 4B-IT, un transformer denso de 4 mil millones de parámetros desarrollado por Google DeepMind. La versión original fue entrenada con técnicas de instrucción y ajuste fino para tareas de chat y generación de texto. En este caso, el autor ha aplicado una cuantización a INT8 y ha convertido los pesos al formato LiteRT-LM, un formato optimizado para el runtime LiteRT (anteriormente TensorFlow Lite) que permite ejecutar modelos en dispositivos móviles y embebidos.

No se proporcionan detalles sobre el proceso de cuantización (por ejemplo, si se usó calibración con datos representativos o cuantización post-entrenamiento estándar). Tampoco se indica si se realizó algún ajuste adicional después de la cuantización. La model card solo menciona que es una tarea de chat para móviles y que el runtime es LiteRT-LM.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno en inglés.
- Inferencia on-device: al estar cuantizado y empaquetado en formato LiteRT-LM, puede ejecutarse localmente en dispositivos compatibles sin conexión a internet.
- Tarea específica de chat: la model card indica que es una "AI Chat task", por lo que su uso principal es la conversación.
- No se mencionan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. El modelo base Gemma 3 4B-IT sí es multimodal (texto e imagen), pero esta cuantización no especifica si conserva esas capacidades; la model card solo habla de chat.

## Casos de uso

- Asistentes personales en smartphones: el modelo puede integrarse en aplicaciones móviles para ofrecer un asistente conversacional que funcione sin conexión, ideal para entornos con conectividad limitada o para preservar la privacidad del usuario.
- Atención al cliente en apps: empresas pueden desplegar este modelo en sus aplicaciones para resolver consultas frecuentes de los usuarios de forma local, reduciendo la dependencia de servidores externos.
- Chatbots educativos: aplicaciones de aprendizaje de idiomas o tutorías pueden usar el modelo para mantener conversaciones prácticas en inglés sin necesidad de infraestructura en la nube.
- Prototipado rápido de aplicaciones móviles con IA: desarrolladores pueden descargar el archivo `.task` e integrarlo en sus proyectos con LiteRT para evaluar rápidamente la viabilidad de un asistente local.
- Soluciones de salud y bienestar: aplicaciones de seguimiento de hábitos o apoyo emocional pueden ofrecer conversaciones guiadas sin enviar datos sensibles a servidores externos.
- Dispositivos IoT y wearables: el formato ligero y la cuantización INT8 permiten su uso en dispositivos con poca memoria, como relojes inteligentes o asistentes de hogar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta cuantización específica. Tampoco se comparan sus resultados con el modelo original o con otras cuantizaciones.

## Requisitos de hardware

- Tamaño del archivo: ~3,7 GB, por lo que se necesita al menos 4 GB de almacenamiento libre.
- Memoria RAM: se recomienda un mínimo de 6 GB de RAM en el dispositivo para cargar el modelo y ejecutar la inferencia sin problemas de rendimiento.
- GPU: no se requiere GPU dedicada; el runtime LiteRT está optimizado para CPUs móviles y puede usar aceleración por hardware si está disponible (por ejemplo, NPU o DSP).
- Dispositivos compatibles: smartphones y tablets con Android o iOS que soporten LiteRT-LM. No se especifican versiones mínimas.
- Opciones de despliegue: el modelo se distribuye como un archivo `.task` que se integra en aplicaciones mediante el SDK de LiteRT. No se mencionan otras opciones como vLLM, llama.cpp u Ollama, ya que el formato es específico para móviles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo es una cuantización de Gemma 3 4B-IT, pero no se conocen otras cuantizaciones en formato LiteRT-LM del mismo modelo ni de alternativas comparables en el contexto de la información proporcionada. Se podría comparar con el modelo original en cuanto a tamaño y precisión, pero no hay datos de rendimiento.

## Limitaciones y advertencias

- Idioma limitado: la model card indica solo inglés (`en`). No se garantiza un rendimiento adecuado en otros idiomas.
- Precisión reducida: la cuantización INT8 puede provocar una pérdida de calidad en las respuestas en comparación con el modelo original en FP16 o BF16.
- Uso exclusivo para chat: el modelo está etiquetado como "AI Chat task", por lo que no está optimizado para otras tareas como generación de código, análisis de imágenes o razonamiento complejo.
- Sin garantías de soporte multimodal: aunque el modelo base Gemma 3 4B-IT es multimodal, esta cuantización no especifica si conserva la capacidad de procesar imágenes. Se debe asumir que solo maneja texto.
- Dependencia del runtime LiteRT: el modelo solo funciona con LiteRT-LM; no es compatible con otros frameworks de inferencia.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en contextos de baja información.
- Licencia Apache 2.0: permite uso comercial, pero se debe verificar el cumplimiento de los términos de la licencia del modelo base (Gemma 3) si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xenna/gemma-4-e4b-it
- Modelo base (Google): https://huggingface.co/google/gemma-3-4b-it
- Documentación de LiteRT-LM: no disponible en la información proporcionada.
