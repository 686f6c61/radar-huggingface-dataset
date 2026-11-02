# yujiepan/minicpm-ocr-jev-tiny-random

## Resumen

`yujiepan/minicpm-ocr-jev-tiny-random` es un checkpoint de tamaño reducido con pesos inicializados de forma aleatoria, derivado de `openbmb/MiniCPM-OCR-Jev`. No es un modelo entrenado ni utilizable en producción: su propósito declarado es servir como banco de pruebas para depurar pipelines de carga, procesamiento y ejecución de la arquitectura Qwen3.5 vision-language en su variante de clasificación binaria. Lo publica el usuario `yujiepan` dentro del ecosistema MiniCPM, y el propio repositorio indica que ha sido generado con DeepSeek-V4.1-Flash.

La relevancia técnica del repositorio es acotada pero concreta: preserva la estructura del modelo original (tokenizador con 248.320 filas de vocabulario, embeddings no atados, cabecera binaria `score` en lugar de `lm_head`, torre de visión con patches de 16 y fusión espacial 2x2) mientras reduce drásticamente las dimensiones internas. Esto permite validar código de integración en `transformers` sin necesidad de descargar los 4,43 GB del checkpoint completo de 2,21B parámetros.

El modelo conserva dos ciclos completos de la cadencia de capas del backbone original (tres capas con atención lineal seguidas de una capa con atención completa), con 8 capas en total, anchura oculta de 16 y anchura MLP de 32. La ruta de atención lineal de Qwen3.5 requiere CUDA y Triton, lo que condiciona su ejecución a hardware NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language Qwen3.5 con atención híbrida (lineal + completa) y cabecera de clasificación binaria |
| Parametros totales | 6,64M (BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en BF16) |
| Idiomas soportados | no disponible (el prompt de ejemplo está en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, 13,31 MB) |

## Arquitectura y entrenamiento

El checkpoint replica la topología de `openbmb/MiniCPM-OCR-Jev`, un modelo vision-language construido sobre Qwen3.5 con un patrón de capas híbrido: ciclos de tres capas con atención lineal seguidos de una capa con atención completa. El original tiene 24 capas (seis ciclos) y 2.048 de anchura oculta; esta versión tiny conserva solo dos ciclos completos (8 capas) y reduce la anchura a 16 con MLP de 32. Se mantienen invariantes las dimensiones de cabeceras: 8 cabeceras Q, 2 cabeceras KV, dimensión de cabecera 256, y en la ruta lineal 16 cabeceras de clave/valor con dimensiones 128/128.

La torre de visión también se reduce: 4 capas de profundidad, anchura 128 y anchura de salida 16, frente a 24/1.024/2.048 del modelo fuente. Se conservan los parámetros de parcheo (patch 16, patch temporal 2, fusión espacial 2). La cabecera de tarea es un clasificador binario `score` de forma [2, 16]; no existe `lm_head`, por lo que el modelo no genera texto. La configuración declara una capa MTP (multi-token prediction) pero no incluye tensores asociados.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO. Los pesos son aleatorios: el repositorio declara explícitamente que se trata de una inicialización aleatoria para testing y debugging, no de un modelo entrenado.

## Capacidades

- Clasificación binaria imagen-texto: evalúa si un texto OCR y su renderizado coinciden con la imagen original (salida 1 = consistente, 0 = inconsistente).
- Procesamiento multimodal de dos imágenes más texto en un mismo prompt, mediante `AutoProcessor` y plantilla de chat.
- Carga con `AutoModelForSequenceClassification` en `transformers>=5.10.4`.
- Ejecución de la ruta de atención lineal Qwen3.5 con CUDA y Triton.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente, al carecer de `lm_head`.
- No se documentan capacidades multilingües más allá del prompt de ejemplo en chino.

## Casos de uso

- Depuración de pipelines de carga: permite verificar que `AutoProcessor` y `AutoModelForSequenceClassification` resuelven correctamente la configuración, el tokenizador y los tensores de un modelo Qwen3.5 vision-language sin descargar el checkpoint completo de 4,43 GB.
- Pruebas de integración en CI: su tamaño de 13,31 MB permite incluirlo en suites automatizadas que validen el flujo de preprocesado de imágenes, aplicación de plantilla de chat y ejecución forward en GPU.
- Validación de kernels Triton: sirve para comprobar que la ruta de atención lineal compila y produce logits finitos en una GPU concreta antes de desplegar el modelo real.
- Desarrollo de sistemas de verificación OCR: como sustituto ligero en pruebas de la lógica de scoring binario (texto OCR frente a imagen renderizada) que implementaría el modelo MiniCPM-OCR-Jev completo.
- Benchmarking de infraestructura: mide latencia de arranque, uso de memoria y overhead del procesador multimodal con un modelo de 6,64M parámetros, aislando el coste del runtime del coste del modelo.
- Formación y ejemplos reproducibles: útil en tutoriales o documentación que necesiten ejecutar código de inferencia multimodal sin requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint con pesos aleatorios, cualquier métrica de calidad (MMLU, OCR accuracy, etc.) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en el orden de cientos de MB en BF16 (13,31 MB de pesos más activaciones y buffers del procesador de visión); no se proporciona una cifra oficial.
- GPU recomendadas: el autor verificó el snippet en una NVIDIA A800-SXM4-80GB. La ruta de atención lineal requiere CUDA y Triton, por lo que no funciona en CPU ni en backends sin soporte Triton.
- Cabe en cualquier GPU consumer NVIDIA con soporte CUDA y Triton (por ejemplo, RTX 3090 o RTX 4090), aunque no se documenta una verificación explícita en estas tarjetas.
- Opciones de despliegue: `transformers` con `attn_implementation="sdpa"` y `device_map="cuda"`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; llama.cpp y Ollama quedan descartados al no existir pesos GGUF ni `lm_head`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/minicpm-ocr-jev-tiny-random | 6,64M | no disponible | Test y debugging de la arquitectura | no disponible | HuggingFace |
| openbmb/MiniCPM-OCR-Jev | 2,21B (BF16) | no disponible | Scoring de correccion OCR vision-language | no disponible | HuggingFace |
| Otros modelos tiny-random de la familia Qwen3.5 | no disponible | no disponible | Test de integracion | no disponible | no disponible |

La comparación relevante es con su modelo base: el checkpoint tiny reproduce la estructura (vocabulario, cabeceras, parcheo de visión, patrón de capas) con dimensiones reducidas, pero no hereda ningún conocimiento del modelo fuente al tener pesos aleatorios.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: las salidas no tienen valor semántico; el modelo no realiza OCR ni clasificación útil.
- Sin `lm_head`: no puede generar texto bajo ninguna configuración.
- Requiere CUDA y Triton para la ruta de atención lineal; no es portable a CPU ni a aceleradores sin soporte Triton.
- Dependencia de `transformers>=5.10.4`, versión que puede no estar disponible en entornos estables.
- Licencia no especificada: no se puede asumir permiso de uso comercial ni redistribución.
- Idiomas soportados no documentados; el único ejemplo disponible usa instrucciones en chino.
- No apto para producción, evaluación de calidad ni benchmarks comparativos.
- El repositorio indica que ha sido generado automáticamente con DeepSeek-V4.1-Flash, sin revisión humana documentada.

## Enlaces

- HuggingFace: https://huggingface.co/yujiepan/minicpm-ocr-jev-tiny-random
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
