# ss-lab/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo LiquidAI/LFM3-1.7B, creado por el usuario ss-lab mediante llama.cpp. El modelo base pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, una serie de modelos compactos orientados a despliegues eficientes en hardware de consumo. Este repositorio no contiene pesos originales, sino conversiones cuantizadas en cinco formatos: Q4_0, Q4_K_M, Q5_K_M, BF16 y F16, lo que permite ejecutar el modelo en CPU, GPU de consumo o dispositivos edge mediante runtimes compatibles con GGUF como llama.cpp, Ollama o LM Studio.

La relevancia de esta ficha radica en la utilidad práctica de tener un modelo de aproximadamente 1,7 mil millones de parámetros disponible en formatos cuantizados de bajo consumo: la versión Q4_K_M ocupa en torno a 1 GB, lo que lo hace viable en portátiles sin GPU dedicada. Cabe destacar un aviso importante del autor: la cuantización Q4_0 de este repositorio se ha generado directamente desde los pesos F16 y no es el checkpoint oficial QAD Q4_0 publicado por Liquid AI, por lo que su calidad puede diferir de la variante oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM de Liquid AI; detalles concretos no publicados en este repo) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, BF16, F16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base LiquidAI/LFM3-1.7B; consultar la ficha original) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este repositorio es una conversión cuantizada, por lo que no aporta información nueva sobre la arquitectura del modelo base. El modelo original, LiquidAI/LFM3-1.7B, pertenece a la tercera generación de la familia LFM (Liquid Foundation Models) de Liquid AI, caracterizada por arquitecturas híbridas que combinan capas convolucionales tipo gated linear (inspiradas en las Liquid Neural Networks) con mecanismos de atención estándar. No obstante, los detalles concretos de la arquitectura de la versión 3 no están disponibles en la información proporcionada y no deben asumirse.

Sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), no hay datos publicados en la información disponible. En cuanto al proceso de conversión, el autor indica que todos los ficheros GGUF se han generado con llama.cpp a partir del checkpoint original, y que la variante Q4_0 se ha cuantizado directamente desde los pesos F16, sin pasar por el checkpoint oficial QAD Q4_0 de Liquid AI.

## Capacidades

Al tratarse de una cuantización de un modelo conversacional, las capacidades heredadas del modelo base incluyen:

- Generación de texto conversacional (el repo está etiquetado como conversational).
- Razonamiento general y seguimiento de instrucciones a nivel típico de modelos compactos de ~1,7 B parámetros.
- Ejecución local mediante runtimes GGUF (llama.cpp, Ollama, LM Studio, llamafile).
- Compatibilidad con endpoints de inferencia estándar (etiqueta endpoints_compatible).

No hay información disponible sobre: soporte de tool calling o function calling, capacidades de agente, capacidades multilingües específicas, ni modalidades adicionales (visión, audio, modo de razonamiento extendido).

## Casos de uso

- Prototipado local sin GPU: la variante Q4_K_M (~1 GB) permite ejecutar el modelo en un portátil con CPU y 8 GB de RAM, útil para probar prompts y flujos conversacionales antes de escalar a modelos mayores.
- Integración en aplicaciones de escritorio: mediante LM Studio u Ollama, se puede servir el modelo como API local para asistentes de escritorio, resúmenes de documentos o redacción asistida sin enviar datos a la nube.
- Dispositivos edge y móviles: el tamaño reducido en Q4_0/Q4_K_M lo hace candidato para despliegues en Raspberry Pi 5, mini PCs x86 de bajo consumo o terminales con NPU, donde cada cientos de MB de VRAM/RAM cuentan.
- Chatbots de bajo coste: para conversaciones multi-turno sencillas (FAQ internas, asistentes de onboarding), un modelo de 1,7 B cuantizado ofrece latencias bajas y coste de infraestructura mínimo.
- Evaluación comparativa de cuantizaciones: al incluir Q4_0, Q4_K_M, Q5_K_M, BF16 y F16 en un mismo repo, es útil como banco de pruebas para medir la degradación de calidad frente al consumo de memoria al cuantizar.
- Pipelines de procesamiento por lotes en CPU: tareas como clasificación, extracción de entidades o reformateo de texto a gran escala pueden ejecutarse en paralelo en máquinas sin GPU aprovechando la eficiencia de llama.cpp.
- Generación de código ligera: para autocompletado y tareas de código sencillas en editores locales, aunque su capacidad a este tamaño será limitada frente a modelos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para evaluaciones del modelo base, consultar la ficha original de LiquidAI/LFM3-1.7B. No se han publicado mediciones de la calidad de las cuantizaciones (por ejemplo, perplejidad por variante) en este repositorio.

## Requisitos de hardware

Estimaciones basadas en el tamaño del repo (11,0 GB para las cinco variantes) y en las reglas generales de GGUF (~0,5-0,6 bytes por parámetro en Q4, ~0,7 en Q5, ~2 bytes en F16):

- Variante Q4_0 / Q4_K_M: aproximadamente 0,9-1,1 GB de RAM/VRAM más overhead de contexto (~1,5-2 GB totales recomendados). Ejecutable en CPU o en cualquier GPU con 4 GB de VRAM.
- Variante Q5_K_M: aproximadamente 1,2-1,3 GB. Viable en GPUs de 4-6 GB como la RTX 3050 o RTX 3060.
- Variantes F16 / BF16: aproximadamente 3,5 GB. Cabe en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores; también ejecutable en CPU con 8 GB de RAM.
- GPU recomendadas: no requiere GPU; para inferencia acelerada, cualquier GPU NVIDIA con CUDA o Apple Silicon con Metal (M1/M2/M3/M4) ofrece buen rendimiento a este tamaño.
- Consumer GPUs: sí, cabe holgadamente en la práctica totalidad de GPUs de consumo modernas incluso en F16.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llamafile, y cualquier servidor compatible con GGUF. No hay información sobre soporte en vLLM o TGI para estos ficheros.
- Latencia y throughput: no disponibles; en CPU moderna se esperan velocidades del orden de decenas de tokens por segundo a este tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ss-lab/LFM3-1.7B-GGUF | 1,73 B | GGUF (Q4_0, Q4_K_M, Q5_K_M, BF16, F16) | no disponible | other | Cuantización comunitaria; Q4_0 no oficial |
| LiquidAI/LFM3-1.7B | 1,73 B | safetensors (original) | no disponible | other (consultar ficha original) | Checkpoint oficial, incluye variante QAD Q4_0 oficial |
| Qwen/Qwen3-1.7B-GGUF | 1,7 B | GGUF (amplia gama Q2-Q8) | 32.768 tokens (extendible a 131.072) | Apache 2.0 | Alternativa compacta con licencia permisiva y tool calling |

Nota: la comparativa con Qwen3-1.7B se ofrece como referencia de categoría (modelo compacto con distribución GGUF oficial); sus datos de rendimiento no son directamente comparables sin benchmarks publicados para LFM3-1.7B.

## Limitaciones y advertencias

- La variante Q4_0 de este repositorio no es el checkpoint oficial QAD Q4_0 de Liquid AI; fue cuantizada desde F16 por el autor del repo, por lo que su calidad puede diferir de la oficial.
- La licencia es "other": hay que revisar la licencia del modelo base LiquidAI/LFM3-1.7B antes de cualquier uso comercial, ya que las condiciones exactas no están detalladas en este repositorio.
- Al ser una cuantización comunitaria con 331 descargas y sin documentación extensa, no hay validación publicada de la calidad de las conversiones.
- No hay información sobre idiomas soportados, longitud de contexto ni soporte de tool calling: verificar estos puntos en la ficha del modelo base antes de usar en producción.
- Riesgo de alucinación inherente a modelos de lenguaje de ~1,7 B parámetros: esperar menor precisión factual y de razonamiento que en modelos de 7 B o superiores.
- Sesgos conocidos: no documentados en la información disponible; asúmense los del modelo base y su dataset de entrenamiento.
- Los metadatos del repo indican fecha de creación en octubre de 2026; verificar que el formato GGUF es compatible con la versión de llama.cpp que se utilice.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/ss-lab/LFM3-1.7B-GGUF
- Modelo base (Liquid AI): https://huggingface.co/LiquidAI/LFM3-1.7B
- Perfil del autor: no disponible (URL directa no proporcionada; accesible desde el repositorio)
