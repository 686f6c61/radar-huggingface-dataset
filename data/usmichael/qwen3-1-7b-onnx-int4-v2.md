# usmichael/qwen3-1.7b-onnx-int4-v2

## Resumen

El modelo `usmichael/qwen3-1.7b-onnx-int4-v2` es una conversión a formato ONNX con cuantización INT4 del modelo Qwen3-1.7B, desarrollado originalmente por Alibaba Cloud. Esta conversión ha sido realizada por el usuario usmichael con el objetivo de permitir la ejecución del modelo en entornos con recursos limitados, especialmente dispositivos móviles Android, mediante la librería `onnxruntime-genai`. El repositorio tiene un tamaño de 1.0 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que ofrece una versión optimizada de un LLM de 1.700 millones de parámetros, lo que permite desplegar capacidades de generación de texto y razonamiento en dispositivos edge sin necesidad de infraestructura en la nube. Al estar cuantizado a INT4, reduce significativamente el uso de memoria y acelera la inferencia en hardware con soporte para operaciones de baja precisión. La conversión se ha realizado con la opción `fuse_qk_norm_gqa=0` para garantizar compatibilidad con `onnxruntime-genai-android 0.15.2`, lo que indica un enfoque específico en despliegue móvil.

Aunque no se proporcionan métricas de rendimiento ni detalles sobre el entrenamiento, al ser una conversión directa del modelo base, se espera que mantenga las capacidades generales de Qwen3-1.7B, incluyendo generación de texto, razonamiento y soporte multilingüe, aunque con posibles pérdidas menores debidas a la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-1.7B) |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con cuantizacion INT4) |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer denso de 1.700 millones de parámetros, desarrollado por el equipo Qwen de Alibaba Cloud. Forma parte de la familia Qwen3, que incluye tanto modelos densos como MoE. La arquitectura sigue el diseño estándar de transformer con atención multi-cabeza, normalización de capas y capas feed-forward. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO en el modelo original.

La conversión a ONNX INT4 se realizó utilizando las herramientas de `onnxruntime-genai`, que permiten exportar modelos PyTorch a formato ONNX con cuantización de 4 bits. La opción `fuse_qk_norm_gqa=0` se empleó para desactivar la fusión de la normalización QK y la atención multi-consulta (GQA), lo que garantiza compatibilidad con la versión 0.15.2 de `onnxruntime-genai-android`. Esta decisión técnica puede implicar un ligero aumento en el uso de memoria o una reducción en la velocidad de inferencia en comparación con versiones que sí fusionan estas operaciones, pero asegura el funcionamiento en plataformas móviles.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente y contextualmente relevante, heredando las capacidades del modelo base Qwen3-1.7B.
- Razonamiento: se espera que mantenga habilidades de razonamiento lógico y matemático básico, aunque no se han verificado en esta conversión específica.
- Soporte multilingüe: el modelo base Qwen3-1.7B es multilingüe, con especial énfasis en inglés y chino, pero no se especifican los idiomas en la conversión.
- Ejecución en dispositivos edge: gracias a la cuantización INT4 y al formato ONNX, puede ejecutarse en CPU y GPU de baja potencia, incluyendo dispositivos Android.
- Compatibilidad con onnxruntime-genai: diseñado para integrarse con la librería de Microsoft, lo que facilita el despliegue en aplicaciones móviles y de escritorio.

No se han documentado capacidades específicas como tool calling, agentes o modo de pensamiento en la información proporcionada. Estas capacidades, si existen, dependerían del modelo base y no están confirmadas para esta conversión.

## Casos de uso

- Asistentes personales en dispositivos móviles: el modelo puede integrarse en aplicaciones Android para ofrecer respuestas a consultas de texto sin conexión, aprovechando su tamaño reducido y la compatibilidad con `onnxruntime-genai-android`.
- Procesamiento de texto en el borde: en entornos industriales o de campo donde no hay conectividad, el modelo puede realizar tareas de resumen, clasificación o generación de informes directamente en el dispositivo.
- Chatbots de atención al cliente en aplicaciones de mensajería: al ser ligero, puede desplegarse en servidores de bajo coste o en terminales de punto de venta para gestionar conversaciones básicas.
- Herramientas de autocompletado y asistencia de escritura: integrado en editores de texto o aplicaciones de correo electrónico, puede sugerir frases o completar párrafos en tiempo real.
- Traducción automática en dispositivos sin conexión: aunque no se confirman los idiomas, el modelo base tiene capacidades multilingües, lo que podría permitir traducciones básicas en modo offline.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden utilizar esta versión ONNX para probar funcionalidades de generación de texto en entornos de desarrollo con recursos limitados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para esta conversión específica. Se recomienda consultar los benchmarks del modelo base Qwen3-1.7B en su página de HuggingFace para obtener una referencia aproximada, aunque la cuantización INT4 puede afectar ligeramente al rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.700 millones de parámetros cuantizado a INT4, el tamaño en memoria es aproximadamente de 0.85 GB (1.7B × 4 bits / 8 = 0.85 GB), más overhead. Esto permite su ejecución en dispositivos con al menos 1 GB de RAM disponible.
- GPU recomendadas: puede ejecutarse en CPU, GPU integradas y GPUs discretas con soporte para operaciones INT4. En dispositivos Android, se recomienda un SoC con soporte para aceleración por hardware (por ejemplo, Adreno o Mali).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja como NVIDIA GTX 1650 o superiores, así como en Apple Silicon.
- Opciones de despliegue: `onnxruntime-genai` es la librería principal, con soporte para Python, C# y C++. También puede utilizarse con `ONNX Runtime` estándar, aunque la cuantización INT4 requiere el ejecutable específico de `onnxruntime-genai`.
- Latencia y throughput: no se han publicado datos. En un dispositivo móvil moderno, se espera una latencia de entre 1 y 5 segundos por token, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| usmichael/qwen3-1.7b-onnx-int4-v2 | 1.7B | no disponible | ONNX INT4 | Apache 2.0 | HuggingFace |
| onnx-community/Qwen3-1.7B-ONNX | 1.7B | no disponible | ONNX (FP32/FP16) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (original) | 1.7B | 32k (según repo oficial) | PyTorch | Apache 2.0 | HuggingFace |

La conversión de usmichael se diferencia de la de onnx-community por estar específicamente cuantizada a INT4 y optimizada para `onnxruntime-genai-android 0.15.2`. La versión de onnx-community ofrece pesos en FP32/FP16, lo que puede dar mayor precisión pero requiere más memoria. El modelo original en PyTorch es la referencia, pero no es directamente ejecutable en entornos móviles sin conversión.

## Limitaciones y advertencias

- La cuantización INT4 puede provocar una pérdida de precisión en tareas complejas de razonamiento o generación de código, en comparación con el modelo original en FP16 o FP32.
- No se ha verificado el rendimiento en tareas específicas; los resultados pueden variar según el caso de uso.
- La compatibilidad con `onnxruntime-genai` está limitada a la versión 0.15.2 en Android; versiones posteriores pueden requerir ajustes.
- No se especifican los idiomas soportados, aunque el modelo base es multilingüe. Se recomienda probar con los idiomas de interés.
- El contexto máximo no está documentado en esta conversión; se desconoce si se mantiene el contexto de 32k del modelo base o si se ha reducido.
- Al ser un modelo pequeño, su capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos de mayor tamaño.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir el crédito correspondiente al modelo base y a la conversión.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/usmichael/qwen3-1.7b-onnx-int4-v2)
- [Modelo base Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Repositorio de onnxruntime-genai](https://github.com/microsoft/onnxruntime-genai)
- [Repositorio oficial de Qwen3](https://github.com/QwenLM/Qwen3)
- [Versión ONNX de la comunidad](https://huggingface.co/onnx-community/Qwen3-1.7B-ONNX)
