# vaultai/Inkling-2-Mini-oQ4e-mtp

## Resumen

Inkling-2-Mini-oQ4e-mtp es una cuantización de precisión mixta en formato MLX del modelo multimodal thinkingmachines/Inkling-2-Mini, desarrollada por el usuario vaultai mediante la herramienta oQ (oMLX v0.8.1). El modelo base es un transformer con mezcla de expertos (MoE) y arquitectura "looped": sus 12 capas centrales se ejecutan tres veces por cada token, lo que permite aumentar la profundidad efectiva de cómputo sin incrementar el número de parámetros. Cuenta con 26.388 millones de parámetros totales y 3.400 millones activos por token, e incorpora un codificador de visión para entradas de imagen y texto.

La relevancia de este checkpoint reside en su empaquetado: reduce el modelo original a unos 15.690 GiB de almacenamiento con una media efectiva de 4,915 bits por peso en el modelo de lenguaje y el codificador visual (5,047 bits si se incluye el draft DSpark), manteniendo los expertos enrutados de las capas 0-19 en su formato NVFP4 de origen. Además, incluye en `mtp.safetensors` un borrador DSpark que oMLX Lightning MTP emplea para decodificación especulativa, lo que acelera la generación en hardware Apple Silicon.

El modelo está pensado para despliegue local en Mac mediante la librería MLX y requiere oMLX 0.8.1 o superior. Su ventana de contexto alcanza 1 millón de tokens, lo que lo sitúa en la categoría de modelos multimodales de contexto largo, con licencia Apache 2.0 heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (12 capas centrales ejecutadas 3 veces por token) y codificador de visión |
| Parametros totales | 26.388.646.400 (26,389B) |
| Parametros activos | 3,4B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Mezcla: NVFP4 grupo 16, affine 4-bit grupo 64, affine 8-bit grupo 64, BF16 y FP32; media efectiva 4,915 bits/peso (5,047 con draft) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` para el draft DSpark |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE multimodal con 26,4B parámetros totales y 3,4B activos. Su rasgo arquitectónico distintivo es el bucle de capas: las 12 capas intermedias se recorren tres veces para cada token, lo que incrementa el cómputo efectivo sin añadir parámetros. Incorpora un codificador de visión de 0,318B parámetros que procesa entradas de imagen junto con texto, y un módulo DSpark de 0,318B parámetros que actúa como borrador para decodificación especulativa (multi-token prediction). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la documentación proporcionada.

La cuantización oQ4e aplicada por vaultai conserva los expertos enrutados de las capas 0 a 19 en NVFP4 (grupo 16) y recuantiza los expertos MXFP8 de las capas 20 a 23 a affine 4-bit (grupo 64). Las proyecciones de atención, los embeddings y la cabeza de vocabulario se almacenan en affine 8-bit; el codificador de visión y el draft DSpark permanecen en BF16, mientras que el router y los controladores del bucle se mantienen en FP32. El resultado ocupa 15,098 GiB de tensores para 26,389B pesos lógicos.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Comprensión de imágenes: pipeline `image-text-to-text` con codificador visual dedicado.
- Procesamiento de contexto largo: hasta 1 millón de tokens, apto para documentos extensos o historiales prolongados.
- Decodificación especulativa mediante el draft DSpark incluido en `mtp.safetensors` (oMLX Lightning MTP).
- Razonamiento multi-paso y modo "thinking" (el tag `base_model:thinkingmachines/Inkling-2-Mini` sugiere capacidades de pensamiento extendido, aunque no se detalla en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias a su ventana de 1M tokens, el modelo puede ingerir informes, contratos o manuales completos junto con figuras y diagramas, y responder preguntas que requieran correlacionar texto e imágenes a lo largo de cientos de páginas.
- Asistencia conversacional multimodal en local: al ejecutarse en MLX sobre Apple Silicon, permite desplegar un chatbot que acepte capturas de pantalla, fotos o diagramas sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Descripción y extracción de información de imágenes técnicas: el codificador visual de 0,318B parámetros permite transcribir tablas, leer gráficos o resumir figuras en documentación de ingeniería.
- Prototipado de agentes con razonamiento multi-paso: el modo de pensamiento del modelo base y la decodificación especulativa con DSpark facilitan iteraciones rápidas en tareas de planificación y resolución de problemas.
- Investigación sobre cuantización y decodificación especulativa: el checkpoint sirve como caso de estudio de cuantización mixta (NVFP4 + affine 4/8-bit) y de integración de un draft MTP en el ecosistema MLX.
- Evaluación comparativa de modelos MoE con bucle de capas: útil para estudiar el equilibrio entre parámetros activos (3,4B) y profundidad efectiva en tareas de razonamiento y visión.
- Despliegue en estaciones de trabajo Mac para generación aumentada por recuperación (RAG) multimodal: la combinación de contexto largo y visión permite indexar corpus con imágenes y responder con citas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unificada estimada: aproximadamente 15,7 GiB de almacenamiento de pesos; para inferencia con contexto largo hay que sumar la caché KV, que crece con la ventana utilizada. Con 1M tokens de contexto, los requisitos de memoria unificada pueden superar ampliamente los 32 GB.
- Hardware objetivo: Apple Silicon con MLX (la librería declarada es `mlx`); no se indica compatibilidad con CUDA en la información proporcionada.
- Cabe en GPU de consumo: el formato MLX está orientado a memoria unificada de Mac; en equipos con 32 GB o más de memoria unificada es viable con contextos moderados. Para contextos cercanos a 1M tokens se requiere una configuración de gama alta (por ejemplo, 64-128 GB de memoria unificada).
- Opciones de despliegue: oMLX 0.8.1 o superior (requisito explícito del autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La inclusión del draft DSpark para decodificación especulativa sugiere una mejora de velocidad frente a la decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ4e-mtp (este) | 26,4B / 3,4B | 1M | Apache 2.0 | MLX safetensors, 4,915 bits/peso | Cuantización mixta con draft DSpark; requiere oMLX |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B / 3,4B | 1M | Apache 2.0 | safetensors (BF16 presumiblemente) | Modelo fuente sin cuantizar; mayor huella de memoria |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El checkpoint está diseñado exclusivamente para MLX y requiere oMLX 0.8.1 o superior; no es directamente utilizable en ecosistemas CUDA, vLLM o llama.cpp sin conversión adicional.
- La cuantización a 4 bits en los expertos de las capas 20-23 y en las proyecciones de atención puede degradar la calidad frente al modelo base en tareas sensibles a la precisión numérica, como matemáticas o código.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base ni de esta cuantización.
- Los idiomas soportados no están documentados; el rendimiento fuera del inglés (presumiblemente el idioma principal) es desconocido.
- El contexto de 1M tokens implica un consumo de memoria elevado para la caché KV; en la práctica, el contexto efectivo estará limitado por la memoria unificada disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del checkpoint.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- El uso del draft DSpark para decodificación especulativa está ligado a la implementación de oMLX Lightning MTP; otros runtimes no podrán aprovecharlo directamente.

## Enlaces

- Hugging Face: https://huggingface.co/vaultai/Inkling-2-Mini-oQ4e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
