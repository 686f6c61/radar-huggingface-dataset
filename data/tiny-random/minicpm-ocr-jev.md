# tiny-random/minicpm-ocr-jev

## Resumen

`tiny-random/minicpm-ocr-jev` es un checkpoint de pruebas y depuración derivado de `openbmb/MiniCPM-OCR-Jev`, un modelo de visión-lenguaje orientado a evaluar la corrección de transcripciones OCR. No es un modelo funcional para producción: se trata de una inicialización aleatoria con la misma arquitectura que el modelo base pero con dimensiones internas reducidas drásticamente, pensada para validar pipelines de carga, procesamiento y ejecución sin consumir recursos reales.

El modelo conserva la estructura de un scorer binario de corrección OCR: recibe dos imágenes (el bloque original y una renderización del texto OCR candidato) junto con una instrucción en chino, y produce una puntuación de compatibilidad entre ambas. Internamente usa la arquitectura Qwen3.5 con atención lineal híbrida (ciclos de tres capas lineales y una de atención completa) y una torre de visión, pero con anchos de 16 dimensiones en el backbone y 128 en la torre visual, frente a las 2.048 y 1.024 del modelo original.

Su relevancia es exclusivamente técnica: permite verificar integraciones con `transformers` (versión 5.10.4 o superior), comprobar el flujo de `AutoModelForSequenceClassification` con cabeza `score` en lugar de `lm_head`, y testear el camino de atención lineal que requiere CUDA y Triton. El repositorio tiene 0 descargas y 0 likes, y fue generado automáticamente por DeepSeek-V4.1-Flash el 1 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 vision-language (transformer híbrido con atención lineal y atención completa, más torre de visión) |
| Parámetros totales | 6.643.328 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint en BF16; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible (la instrucción de ejemplo está en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 13,3 MB) |

## Arquitectura y entrenamiento

El checkpoint replica la arquitectura del modelo base `openbmb/MiniCPM-OCR-Jev`, descrito en la model card como un scorer de corrección visión-lenguaje basado en Qwen3.5. El backbone consta de 8 capas organizadas en dos ciclos completos de tres capas lineales más una de atención completa (frente a 24 capas y seis ciclos en el original). El ancho oculto es de 16 y el ancho MLP de 32 (frente a 2.048 y 6.144). Mantiene 8 cabezas Q, 2 cabezas KV y dimensión de cabeza 256, además de 16 cabezas clave/valor lineales con dimensiones 128/128.

La torre de visión tiene profundidad 4, ancho 128 y ancho de salida 16 (frente a 24/1.024/2.048 en el original), con parche de 16, parche temporal de 2 y merge espacial de 2. El vocabulario se mantiene en 248.320 filas con embeddings no atados. La cabeza de tarea es una `score` binaria de forma [2, 16] (frente a [2, 2.048]), y no existe `lm_head`. El config declara una capa MTP pero no hay tensores MTP.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO. El modelo se describe explícitamente como "randomly initialized" para pruebas y depuración, por lo que no ha sido entrenado para la tarea. La ruta de atención lineal de Qwen3.5 requiere CUDA y Triton; el snippet público fue verificado en una NVIDIA A800-SXM4-80GB.

## Capacidades

- No es un modelo funcional: al ser una inicialización aleatoria, no genera texto ni produce puntuaciones OCR significativas.
- Conserva la interfaz de scorer binario: recibe dos imágenes y una instrucción, y devuelve logits de dos clases (`score` [2, 16]).
- Soporta el flujo de `AutoModelForSequenceClassification` con `AutoProcessor` y `apply_chat_template`.
- Compatible con `attn_implementation="sdpa"` y con el camino de atención lineal Qwen3.5 en CUDA con Triton.
- No dispone de `lm_head`, por lo que no puede usarse para generación autoregresiva.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (la instrucción de ejemplo está en chino).
- Sin modo thinking, sin visión generativa, sin audio.

## Casos de uso

- Validación de pipelines de carga: permite comprobar que `AutoProcessor.from_pretrained` y `AutoModelForSequenceClassification.from_pretrained` funcionan con la arquitectura Qwen3.5 vision-language antes de descargar el modelo completo de 4,43 GB.
- Test de integración continua: al ocupar 13,3 MB, puede incluirse en suites de CI para verificar que el código de preprocesado de imágenes, plantillas de chat y extracción de logits no rompe con cambios de versión de `transformers`.
- Depuración de atención lineal: sirve para verificar que el camino Triton/CUDA de Qwen3.5 se ejecuta correctamente en el entorno del desarrollador sin necesidad de GPU de gran memoria.
- Pruebas de forma y dtype: útil para comprobar que las formas de los tensores de entrada (dos imágenes de 448x448 más texto) y la salida de logits [batch, 2] coinciden con lo esperado en el pipeline de scoring OCR.
- Benchmarking de infraestructura: mide latencia de carga y overhead de procesador en un checkpoint mínimo, aislando el coste del modelo del coste del pipeline.
- Docencia y ejemplos reproducibles: permite ilustrar la estructura de un scorer visión-lenguaje binario en tutoriales sin requerir hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un modelo de inicialización aleatoria, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, precisión OCR) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (13,3 MB de pesos más activaciones y buffers de atención lineal).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y Triton; el snippet fue verificado en una A800-SXM4-80GB, pero el tamaño no exige esa GPU.
- Cabe en GPU consumer: sí, en cualquier RTX con CUDA (por ejemplo, RTX 3060, 4060, 4090), siempre que estén instalados Triton y una versión de CUDA compatible.
- Opciones de despliegue: `transformers` (>=5.10.4) con `AutoModelForSequenceClassification`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no tener `lm_head` no es apto para servidores de generación de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiny-random/minicpm-ocr-jev` | 6,64 M | no disponible | Scorer OCR binario (aleatorio) | no disponible | HuggingFace, 0 descargas |
| `openbmb/MiniCPM-OCR-Jev` | 2,21 B (BF16) | no disponible | Scorer OCR binario | no disponible | HuggingFace (modelo base) |
| `openbmb/MiniCPM-V` (familia) | no disponible en la información | no disponible | Visión-lenguaje general | no disponible en la información | HuggingFace |

La comparación directa más relevante es con su modelo base: misma arquitectura e interfaz, pero 333 veces menos parámetros y sin entrenamiento. Frente a modelos de OCR funcionales de la familia MiniCPM, este checkpoint no es una alternativa: solo comparte estructura.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: las puntuaciones de salida no tienen significado y no deben interpretarse como juicios de corrección OCR.
- Sin `lm_head`: no puede generar texto; cualquier intento de usarlo como modelo generativo fallará.
- Licencia no disponible: no se puede asumir uso comercial sin consultar la licencia del modelo base `openbmb/MiniCPM-OCR-Jev`.
- Dependencia de CUDA y Triton para la atención lineal: no funciona en CPU ni en entornos sin estas dependencias.
- Requiere `transformers>=5.10.4` y `Pillow`; versiones anteriores pueden no cargar la arquitectura Qwen3.5.
- Idiomas no documentados: la instrucción de ejemplo está en chino y no hay evidencia de soporte multilingüe.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la salida aleatoria puede producir falsos positivos o negativos sistemáticos si se usa sin sustituir los pesos.
- No apto para producción: es un artefacto de test generado automáticamente, con 0 descargas y sin mantenimiento documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tiny-random/minicpm-ocr-jev
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
