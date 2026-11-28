# Valen-Team/Valen-Decision-1.5-0.8B-ONNX

## Resumen

Valen-Decision-1.5-0.8B-ONNX es la exportación a ONNX Runtime del modelo Valen-Decision-1.5-0.8B, desarrollado por Valen-Team. No es un modelo generativo de propósito general: es un modelo de decisión especializado que responde a preguntas tipadas (predicados booleanos, elecciones, puntuaciones y bounding boxes) sobre entradas multimodales de texto, imagen y fotogramas de vídeo, devolviendo salidas estructuradas con probabilidad asociada. Está construido sobre el modelo base Qwen/Qwen3.5-0.8B, del que hereda la arquitectura de backbone y el codificador visual.

La relevancia de esta variante concreta reside en el formato de despliegue: al estar exportada a ONNX, la inferencia se ejecuta sin PyTorch ni Transformers, mediante los SDK oficiales de Valen (Python y JavaScript), lo que permite ejecución en CPU, en GPU NVIDIA vía CUDAExecutionProvider y en navegador mediante WebGPU. El repositorio ofrece cuatro variantes de precisión (fp32, q8-mlp, cuda-fp16 y web-portable) con tamaños de descarga entre 2,01 GB y 3,52 GB.

El modelo resuelve un problema acotado pero recurrente en producción: convertir mensajes de cliente, imágenes o vídeo en decisiones verificables y tipadas (por ejemplo, "¿el cliente solicita un cambio de dirección de entrega?") en lugar de texto libre. La licencia es Apache 2.0 y los datos de entrenamiento no son públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone y visión derivados de Qwen3.5-0.8B) con cabezas de decisión y grounding; exportado a grafos ONNX Runtime |
| Parametros totales | 0,8B (según denominación del modelo; desglose por componente no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32; q8-mlp (MLP con pesos a 8 bits, resto FP32); cuda-fp16 (backbone y embedding FP16, visión y cabezas FP32); web-portable (backbone mixto FP16/FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos backbone, embedding, vision, decision y grounding bajo `onnx/`, con SHA256 en `valen_onnx.json`) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de lenguaje y un codificador visual heredados de Qwen3.5-0.8B con componentes propios de Valen: un grafo de embedding, un grafo de visión, un grafo de decisión y un grafo de grounding. El grafo de decisión responde preguntas de tipo `predicate`, `choice` y `score`, mientras que el grafo de grounding resuelve preguntas de tipo `bbox`, devolviendo coordenadas `[x1, y1, x2, y2]`, un punto `[x, y]` y una confianza normalizados en el rango 0–1. El modelo se presenta como un sistema de "shared-state" y salida estructurada, orientado a producir decisiones tipadas en lugar de generación de texto abierta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica explícitamente que los datos de entrenamiento de Valen-Decision-1.5 no son públicos. Sí se publica el código de entrenamiento en el repositorio de GitHub del proyecto, lo que permite ajustar el modelo con datos propios. La exportación a ONNX incluye una validación comparativa frente al modelo nativo en FP32 sobre CPU: la variante `fp32` alcanza una concordancia de decisión del 100,00 % con un MAE de probabilidad de 4,5e-05, y `q8-mlp` baja al 98,39 % de concordancia con un MAE de 0,002.

## Capacidades

- Clasificación de mensajes de cliente mediante preguntas de tipo `predicate` con probabilidad asociada.
- Preguntas de tipo `choice` y `score` para selección entre opciones y puntuación de criterios.
- Verificación de requisitos sobre imágenes (por ejemplo, comprobar si una imagen cumple una condición definida).
- Localización de objetos en imágenes mediante preguntas `bbox`, con caja, punto y confianza normalizados.
- Identificación de acciones en vídeo a partir de fotogramas.
- Salida estructurada y tipada, apta para integrarse en pipelines automatizados.
- Procesamiento conjunto de texto, imagen y vídeo en una misma solicitud.
- Ejecución local sin PyTorch ni Transformers, vía ONNX Runtime, con SDK de Python y de JavaScript.
- Ejecución en navegador mediante WebGPU con la variante `web-portable`.
- No se documentan capacidades de generación de texto libre, razonamiento multi-paso ni tool calling.

## Casos de uso

- Clasificación de solicitudes de atención al cliente: el modelo evalúa predicados como "¿el cliente solicita un cambio de dirección?" sobre el texto del mensaje y devuelve una probabilidad, lo que permite enrutar tickets de forma automática sin depender de reglas frágiles.
- Verificación de imágenes en flujos de devoluciones o seguros: se formula una pregunta de tipo `predicate` con la imagen adjunta para comprobar si cumple un requisito (por ejemplo, si el producto presenta daños), y el resultado se registra como decisión estructurada.
- Detección y localización de elementos en imágenes: las preguntas `bbox` devuelven caja, punto y confianza normalizados, útiles para anotación asistida, control de calidad visual o recorte automático de regiones.
- Análisis de acciones en vídeo: a partir de fotogramas, el modelo responde si se observa una acción concreta, lo que sirve para monitorización de procesos, auditoría de grabaciones o etiquetado de clips.
- Moderación y cumplimiento de contenido visual: comprobación sistemática de si una imagen o fotograma cumple políticas definidas mediante preguntas tipadas con umbral de probabilidad configurable.
- Despliegue en el navegador para herramientas internas: la variante `web-portable` sobre WebGPU permite clasificar texto e imágenes en el cliente sin enviar datos a un servidor, útil en entornos con requisitos de privacidad.
- Automatización en CPU de bajo coste: la variante `q8-mlp` (2,76 GB de descarga) permite ejecutar el modelo en servidores sin GPU manteniendo una concordancia del 98,39 % con el modelo nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye una validación de equivalencia entre las variantes ONNX y el modelo nativo en FP32:

| Variante | Dispositivo | Solicitudes evaluadas | Resultado |
|---|---|---|---|
| `fp32` | CPU | 13 recetas del Cookbook (texto, imagen, fotogramas de vídeo), 216 números | Concordancia de decisión 100,00 %; MAE de probabilidad 4,5e-05; máximo 0,0032 |
| `q8-mlp` | CPU | 13 recetas del Cookbook (texto, imagen, fotogramas de vídeo), 216 números | Concordancia de decisión 98,39 %; MAE de probabilidad 0,002; máximo 0,028 |
| `cuda-fp16` | NVIDIA H200, CUDA | Texto, imagen y bbox, 44 números | Concordancia de decisión 100,00 %; MAE de probabilidad 5,9e-05; máximo 0,00032; caja máximo 0,0002 |
| `web-portable` | CPU | Texto, imagen y bbox, 44 números | Concordancia de decisión 100,00 %; MAE de probabilidad 0,00019; máximo 0,001; caja máximo 0,0002 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de descarga de cada variante orienta el consumo: `fp32` 3,52 GB, `q8-mlp` 2,76 GB, `cuda-fp16` 2,01 GB, `web-portable` 2,46 GB.
- GPU recomendadas: NVIDIA con soporte de CUDAExecutionProvider; la validación de `cuda-fp16` se realizó en una NVIDIA H200. Para GPU de consumo no se publican requisitos específicos.
- Ejecución en CPU: soportada de forma nativa con las variantes `fp32` y `q8-mlp`.
- Ejecución en navegador: variante `web-portable` sobre WebGPU, con los ficheros de runtime de `onnxruntime-web` servidos bajo `/ort/`.
- Opciones de despliegue: ONNX Runtime mediante el SDK de Python (`valen-sdk[onnx]==0.5.1`) o el SDK de JavaScript (`@valen-team/sdk@0.4.0`, con `onnxruntime-node@1.30.0`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión estructurada multimodales) en la documentación proporcionada. Como referencia de linaje, el modelo base es Qwen/Qwen3.5-0.8B, pero no se ofrecen datos de rendimiento comparativo frente a él ni frente a alternativas.

| Modelo | Parámetros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| Valen-Decision-1.5-0.8B-ONNX | 0,8B | no disponible | Apache 2.0 | ONNX | Validación interna de equivalencia (ver tabla anterior) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en decisión y salida estructurada; no está diseñado para generación de texto libre ni para razonamiento conversacional abierto.
- Los datos de entrenamiento no son públicos, por lo que no es posible auditar la composición del dataset ni los sesgos potenciales.
- No se documentan los idiomas soportados; la cobertura multilingüe es desconocida.
- La longitud de contexto no está especificada, lo que dificulta planificar entradas largas.
- La validación publicada se basa en conjuntos reducidos (13 recetas del Cookbook y 44 números en algunos casos), insuficiente para garantizar robustez en dominios muy distintos.
- La variante `q8-mlp` reduce la concordancia de decisión al 98,39 % frente al modelo nativo, con un error máximo de probabilidad de 0,028; conviene umbralizar con margen en producción.
- La ejecución en navegador depende de una versión de desarrollo de `onnxruntime-web` (1.31.0-dev), lo que implica riesgo de inestabilidad de API.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base Qwen3.5-0.8B y de los componentes derivados.
- No se documentan mecanismos de calibración de probabilidades; las probabilidades devueltas deben validarse empíricamente antes de usarse como umbrales críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-ONNX
- Modelo nativo (no ONNX): https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- API gratuita y demo web: https://valen-team.github.io/
- Playground Space: https://huggingface.co/spaces/Valen-Team/Valen-API
- Código de entrenamiento: https://github.com/Valen-Team/Valen
- SDK de Python: https://github.com/valen-team/valen-sdk-python
- SDK de JavaScript: https://github.com/valen-team/valen-sdk-js
- Ejemplo de navegador con Vite: https://github.com/valen-team/valen-sdk-js/tree/main/examples/browser
- Guía ONNX: https://valen-team.github.io/docs/valen/onnx/
- Preguntas bbox: https://valen-team.github.io/docs/valen/onnx/#bbox-questions
- Cookbook: https://valen-team.github.io/cookbook/
- Inicio rápido de API: https://valen-team.github.io/cookbook/api-quickstart/
- Logotipo del proyecto: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/branding/valen-mark-white.png
