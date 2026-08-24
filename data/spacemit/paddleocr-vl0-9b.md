# SpacemiT/PaddleOCR-VL0.9B

## Resumen

PaddleOCR-VL-0.9B es un modelo vision-language ultracompacto desarrollado por PaddlePaddle y desplegado por SpacemiT para sus procesadores RISC-V K1 y K3. Está diseñado específicamente para parsing multilingüe de documentos: extrae y estructura texto, tablas, fórmulas, gráficos y sellos, además de predecir el orden de lectura. El modelo combina un encoder visual de resolución dinámica estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B, alcanzando un rendimiento que supera a Qwen2.5-VL-72B en OmniDocBench con un coste computacional aproximadamente 80 veces menor.

La versión distribuida por SpacemiT incluye pesos en formato GGUF y ONNX, junto con configuraciones específicas para los aceleradores de IA de los chips K1 y K3. El modelo se integra en llama.cpp y ONNX Runtime, permitiendo inferencia local en hardware de bajo coste, incluida una cuantización Q4_K_M de aproximadamente 300 MB para el modelo de lenguaje. Su licencia Apache-2.0 facilita el uso comercial y la integración en productos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder NaViT (resolución dinámica) + LLM ERNIE-4.5-0.3B |
| Parametros totales | 466.654.208 (0,47B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M), ONNX (float32) |
| Idiomas soportados | 109 idiomas (según el paper) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, ONNX |

## Arquitectura y entrenamiento

El modelo combina un encoder visual con resolución dinámica estilo NaViT que procesa imágenes de entrada fijas a 784×784 (NCHW, con rescale 1/255, media 0,5 y desviación 0,5), con el modelo de lenguaje ERNIE-4.5-0.3B. El pipeline de PaddleOCR-VL incluye una etapa previa de análisis de layout y predicción de orden de lectura, que genera las coordenadas y la secuencia de los elementos del documento (bloques de texto, tablas, fórmulas y gráficos). El modelo está optimizado para ejecutarse en los aceleradores de IA de los procesadores SpacemiT K1 y K3 mediante llama.cpp con backend SMT y ONNX Runtime con ejecución en hardware específico.

Los datos de entrenamiento (número de tokens, composición del dataset, técnicas de RLHF/DPO) no se detallan en la información disponible. El paper técnico (arXiv:2510.14528) describe el diseño y las innovaciones, pero no se han publicado cifras concretas sobre el corpus de entrenamiento.

## Capacidades

- OCR multilingüe: reconoce texto en 109 idiomas.
- Parsing de documentos: extrae y estructura bloques de texto, tablas, fórmulas matemáticas y gráficos.
- Predicción de orden de lectura: devuelve la secuencia lógica de los elementos del documento.
- Reconocimiento de sellos y elementos visuales adicionales.
- Integración con llama.cpp y ONNX Runtime para despliegue local.
- Optimizado para hardware RISC-V de SpacemiT (K1/K3) con configuraciones de afinidad de AI cores.
- Soporte de inferencia conversacional vía API compatible con OpenAI (`/v1/chat/completions`).

## Casos de uso

- **Digitalización de documentos corporativos**: el modelo puede convertir PDFs escaneados o fotografías de documentos en texto estructurado con orden de lectura, ideal para sistemas de gestión documental y archivado electrónico.
- **Extracción de datos de facturas y albaranes**: gracias al reconocimiento de tablas y texto, puede automatizar la captura de campos clave (proveedor, importes, fechas) en procesos de contabilidad.
- **Análisis de artículos académicos**: el soporte de fórmulas matemáticas y gráficos permite extraer el contenido científico de papers en PDF o imágenes para su indexación y búsqueda.
- **Accesibilidad y lectura asistida**: convierte documentos impresos en texto plano o audio para usuarios con discapacidad visual, manteniendo el orden de lectura correcto.
- **Procesamiento de documentos en dispositivos edge**: al ser un modelo de solo 466M de parámetros con cuantización Q4 de ~300 MB, puede ejecutarse en hardware de bajo consumo (incluidos los chips SpacemiT K1/K3) para procesamiento privado sin conexión.
- **Automatización de archivado de documentos legales**: reconoce sellos, tablas y texto en contratos y documentos oficiales, facilitando su clasificación y cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la información disponible. La documentación menciona que PaddleOCR-VL-0.9B supera a Qwen2.5-VL-72B en el benchmark OmniDocBench con un coste computacional aproximadamente 80 veces menor, pero no se proporcionan cifras concretas de los scores obtenidos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: la cuantización Q4_K_M del modelo de lenguaje ocupa ~300 MB, y el encoder visual (ONNX FP16) añade algo más. En total, se estima que cabe en una GPU con 2-4 GB de VRAM o incluso en memoria unificada de SoCs.
- **GPU recomendadas**: cualquier GPU consumer moderna (RTX 3060 o superior) o hardware dedicado como los aceleradores de SpacemiT K1/K3 (con AI cores). No se han probado en GPUs de gama alta, pero no es necesario.
- **Ejecución en consumer GPU**: sí, cabe en GPUs con 4 GB o más, así como en CPU (gracias a llama.cpp).
- **Opciones de despliegue**: llama.cpp (con backend SMT para SpaceMiB), ONNX Runtime (con ejecución específica para SpaceMiB), y servidores compatibles con la API de OpenAI.
- **Latencia y throughput**: no se han publicado datos concretos. Los tests de humo en K1 y K3 devolvieron HTTP 200 con respuestas en menos de un segundo para imágenes pequeñas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| PaddleOCR-VL-0.9B | 466M | no disponible | 109 | Apache-2.0 | Supera a Qwen2.5-VL-72B en OmniDocBench |
| Qwen2.5-VL-72B | 72B | 128K | multilingüe | Apache-2.0 | Modelo de referencia para OCR, pero mucho más grande y pesado |
| GOT-OCR2.0 | ~580M | no disponible | multilingüe | MIT | OCR de documentos, pero sin soporte de fórmulas ni gráficos |

No se dispone de datos de comparación directa con otros modelos de la misma categoría en términos de benchmarks o velocidad.

## Limitaciones y advertencias

- La entrada de visión está fija a 784×784, lo que puede limitar el detalle en imágenes de documentos muy densos o de alta resolución.
- El modelo está pensado para OCR de documentos; no es un VLM generalista y no soporta tareas de visión más allá de la extracción de texto y layout.
- El modo de razonamiento (thinking) debe estar desactivado para la inferencia.
- La información de idiomas soportados proviene del paper; no se confirma en la model card de SpacemiT.
- El despliegue en hardware distinto al SpaceMiB K1/K3 requiere compilar llama.cpp y ONNX Runtime con soporte genérico; no se garantiza la misma optimización.
- Riesgo de alucinación en documentos con texto poco claro o imágenes de baja calidad, como se observa en el smoke test de K3 (respuesta "el texto no está claro").
- La licencia Apache-2.0 permite uso comercial, pero los modelos y dependencias upstream mantienen sus propias licencias.

## Enlaces

- [Modelo en HuggingFace (SpaceMiB)](https://huggingface.co/SpacemiT/PaddleOCR-VL0.9B)
- [Modelo original en HuggingFace (PaddlePaddle)](https://huggingface.co/PaddlePaddle/PaddleOCR-VL)
- [Paper técnico en arXiv](https://arxiv.org/abs/2510.14528)
- [Repositorio PaddleOCR en GitHub](https://github.com/PaddlePaddle/PaddleOCR)
- [Repositorio SpaceMiB llama.cpp](https://github.com/spacemit-com/llama.cpp)
- [Repositorio SpaceMiB ONNX Runtime](https://github.com/spacemit-com/onnxruntime)
