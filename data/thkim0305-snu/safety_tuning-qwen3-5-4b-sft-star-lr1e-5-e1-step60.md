# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E1-step60

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E1-step60 es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen3.5-4B, orientado a alineamiento de seguridad. Lo publica el usuario thkim0305-SNU y se distribuye con licencia Apache 2.0. El problema que aborda es el de dotar a un modelo base de visión-lenguaje de un comportamiento más seguro ante peticiones dañinas, manteniendo al mismo tiempo la capacidad de responder a solicitudes legítimas.

Se trata de un checkpoint intermedio de un proceso de entrenamiento de cuatro épocas: este repositorio corresponde a la época 1 de 4, con 60 actualizaciones del optimizador completadas y un learning rate de 1e-5. El entrenamiento parte de forma independiente del modelo base original (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y emplea 7.655 trayectorias docentes completas provenientes de los conjuntos STAR-1 y STAR-Benign.

El modelo conserva la arquitectura multimodal del Qwen3.5-4B, con 4.659.865.088 parámetros totales y pesos en formato safetensors (9,3 GB de repositorio). Es relevante para quienes investigan técnicas de safety tuning sobre modelos de visión-lenguaje y quieran reproducir o comparar variantes de ajuste con distintos hiperparámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen/Qwen3.5-4B |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-4B, un transformer multimodal que procesa entradas de imagen y texto. El proceso de SFT supervisa las trayectorias docentes completas, incluyendo el razonamiento, la respuesta y el token EOS. Se usaron 7.655 trayectorias completas de los datasets UCSC-VLAA/STAR-1 y UCSC-VLAA/STAR-benign-915, con un tamaño de lote global de 128 y un learning rate de 1e-5. Este checkpoint concreto corresponde a la época 1 de 4 y a la iteración nativa 59 (indexada desde cero).

Un detalle técnico relevante es que todos los tensores de texto entrenados se exportan desde el checkpoint nativo, mientras que los tensores de visión y los tensores MTP (multi-token prediction) no entrenados se conservan del modelo base original. El MTP no fue entrenado. La conversión se verificó mediante la conversión inversa exacta de cada tensor de texto nativo, comprobaciones de pesos finitos y la coincidencia de las 738 claves y formas de tensores de Hugging Face. No se añade ningún "teacher Spec" al contexto del estudiante durante el entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen y texto.
- Procesamiento de imágenes junto con instrucciones textuales (pipeline image-text-to-text).
- Razonamiento multi-paso, ya que el entrenamiento supervisa trayectorias con razonamiento explícito.
- Comportamiento orientado a seguridad: el ajuste busca reducir respuestas dañinas ante peticiones maliciosas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en safety tuning: servir como punto de comparación reproducible para estudiar el efecto de distintas tasas de aprendizaje y épocas sobre el alineamiento de seguridad de un VLM de 4B.
- Evaluación de robustez ante jailbreaks: probar si el ajuste con trayectorias STAR reduce la tasa de respuestas dañinas frente al modelo base en tareas de imagen-texto.
- Filtrado de contenido en pipelines multimodales: desplegar el modelo como clasificador o generador de respuestas seguras en sistemas que reciben imágenes e instrucciones de usuario.
- Análisis de trayectorias de razonamiento: inspeccionar cómo el modelo estructura el razonamiento antes de responder, útil para estudiar la cadena de pensamiento en modelos ajustados.
- Base para posteriores ajustes: al estar publicado en safetensors y con licencia Apache 2.0, puede servir como inicialización para experimentos adicionales de SFT o DPO.
- Docencia y divulgación: ilustrar en un entorno controlado cómo se construye un checkpoint intermedio de un proceso de alineamiento y qué artefactos (pesos, configuración, tokenizador) se exportan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 18,6 GB solo para pesos, más memoria para activaciones y KV cache.
- VRAM estimada en bf16/fp16: aproximadamente 9,3 GB para pesos, más overhead de inferencia; se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,7 GB para pesos; en 4 bits, alrededor de 2,3 GB, aunque no se han publicado artefactos cuantizados oficiales.
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con margen.
- GPU de consumo: cabe en RTX 4090 y potencialmente en GPUs de 16 GB en bf16 con contexto moderado; en 8 bits podría caber en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR (este) | 4.659.865.088 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint SFT de seguridad, época 1/4 |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo base sin ajuste de seguridad |
| Alternativas de safety tuning de VLM de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 1 de 4, 60 pasos), no el resultado final del entrenamiento; su comportamiento puede diferir del de un modelo completamente entrenado.
- No se han publicado evaluaciones de seguridad ni de capacidad; no hay garantía de que reduzca de forma efectiva las respuestas dañinas.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se han publicado métricas al respecto.
- Sesgos conocidos: no disponible; al derivar del Qwen3.5-4B, puede heredar los sesgos del modelo base y de los datasets STAR.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- El MTP no fue entrenado, por lo que las capacidades asociadas a esa cabeza pueden no estar optimizadas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-4B antes de un uso comercial en producción.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E1-step60
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
