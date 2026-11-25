# Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16

## Resumen

Inkling 2 Mini Optimized Speed FP16 es un empaquetado del modelo Inkling 2 Mini de Thinking Machines Lab, distribuido por el usuario Youssofal para su ejecución local en Macs con Apple Silicon mediante MTPLX, una aplicación y CLI para modelos locales en macOS. El modelo base es un modelo abierto de pesos orientado a código, agentes e imágenes, con arquitectura MoE de 26.400 millones de parámetros totales y 3.400 millones activos por token, según su model card. Este pack concreto declara 27.530.496.048 parámetros en los safetensors y un tamaño de repositorio de 17,2 GB.

La particularidad de esta variante es que está adaptada a Macs M1 y M2, que carecen de bfloat16 nativo: todos los tensores de 16 bits (incluida la torre de visión y la cabeza de borrador) se almacenan como float16, mientras que los códigos de 4 y 8 bits se mantienen idénticos al pack padre. El pack incluye atención de 8 bits, visión completa y decodificación especulativa mediante predicción multi-token (MTP) con la propia cabeza de borrador del modelo.

Es relevante porque demuestra la ejecución local de un MoE de más de 26.000 millones de parámetros con ventana de contexto de hasta 1M tokens en hardware de consumo Apple, con velocidades de decodificación medidas de hasta 97,1 tok/s en un MacBook Pro M5 Max con 128 GB. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), con torre de visión y cabeza de predicción multi-token (MTP) para decodificación especulativa |
| Parametros totales | 27.530.496.048 (safetensors del pack); 26.4B según la model card del modelo base |
| Parametros activos | 3.4B por token |
| Longitud de contexto | Hasta 1.000.000 tokens (según model card del modelo base) |
| Tipos de cuantizacion | Pesos de 4 bits y 8 bits (códigos idénticos al pack padre), tensores de 16 bits en float16; atención de 8 bits; tag nvfp4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mtplx, orientada a MLX/Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura de mezcla de expertos con 26.400 millones de parámetros totales y 3.400 millones activos por token, lo que permite un coste de cómputo por token comparable a un modelo denso de menor tamaño. Incorpora una torre de visión completa para entrada image-text-to-text y una cabeza de predicción multi-token (MTP) que actúa como borrador en decodificación especulativa: MTPLX genera varios tokens por adelantado con esa cabeza y los verifica en una sola pasada del modelo completo, preservando la distribución del modelo original.

Este pack concreto no reentrena el modelo: es una reempaquetado de cuantización del Inkling 2 Mini original. Los tensores de 16 bits se convierten a float16 para M1 y M2, que no tienen bfloat16 nativo, mientras que los códigos de 4 y 8 bits se conservan exactamente igual que en el pack padre. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Generación y depuración de código, incluyendo tareas de coding ejecutables verificadas en los tests del autor (6 de 6 superados en 3 tareas con 2 semillas cada una, temperatura 1.0).
- Comprensión de imágenes: lectura de capturas de pantalla, diagramas y fotografías mediante la torre de visión incluida en el pack.
- Lectura de capturas de tests fallidos: el modelo identificó el nombre del test y ambos conteos en la prueba del autor.
- Tool calling / function calling: en la prueba del autor invocó la herramienta solicitada con la ciudad indicada por el usuario.
- Decodificación especulativa con la cabeza MTP propia del modelo, manteniendo la distribución original (96,1% de coincidencia en el token superior frente a los pesos oficiales, divergencia KL media de 0,0155).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local en Mac: el modelo puede integrarse en el flujo de trabajo de un desarrollador con MTPLX para autocompletar, explicar y depurar código sin enviar el código a la nube, aprovechando los 3,4B parámetros activos y la ventana de hasta 1M tokens para incluir repositorios completos en el contexto.
- Depuración a partir de capturas de pantalla: gracias a la torre de visión, el modelo lee capturas de tests fallidos o trazas de error y propone correcciones, un escenario validado por el propio autor del pack.
- Agentes locales con tool calling: el modelo invoca herramientas con argumentos correctos, lo que permite construir agentes que consulten APIs, ejecuten comandos o consulten datos estructurados en un Mac sin conexión.
- Análisis de diagramas y documentación técnica: la entrada image-text-to-text permite interpretar diagramas de arquitectura, esquemas y documentación escaneada para responder preguntas o generar resúmenes.
- Procesamiento de contextos largos: con hasta 1M tokens de ventana, es adecuado para analizar bases de código extensas, expedientes o transcripciones largas en una sola pasada, aunque el coste de memoria crece con el contexto (19,5 GiB de pico con un prompt de 4.142 tokens en el pack).
- Prototipado y experimentación en investigación: al ser Apache 2.0, permite modificar, redistribuir y usar comercialmente el modelo, y su ejecución en Apple Silicon facilita experimentos de decodificación especulativa y cuantización sin infraestructura de GPU dedicada.
- Asistente de escritorio con privacidad: al ejecutarse íntegramente en local, es apto para tareas sobre datos sensibles (código propietario, documentos internos) en entornos donde no se permite enviar información a servicios externos.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a pruebas de fidelidad y velocidad en MTPLX 2.13, medidas el 22 y 23 de noviembre de 2026 en un MacBook Pro M5 Max con 128 GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Prueba | Resultado |
|---|---|
| Coincidencia en el token superior frente a pesos oficiales (256 posiciones tras prompt de 4.142 tokens) | 246 de 256 (96,1%), divergencia KL media 0,0155 |
| Tests de coding ejecutables (3 tareas, 2 semillas, temperatura 1.0) | 6 de 6 superados |
| Captura de test fallido | Leyó el nombre del test y ambos conteos |
| Turno de tool call | Invocó la herramienta solicitada con la ciudad indicada |
| Memoria pico sirviendo prompt de 4.142 tokens | 19,5 GiB |

Velocidad de decodificación (tok/s) con cada motor en su propio pack rápido:

| Prueba | MTPLX 2.13.2 (17,2 GB) | mlx-serve 26.11.4 (18,7 GB) | oMLX 0.8.3 (16,9 GB) |
|---|---:|---:|---:|
| Prompt de coding de 4.142 tokens, primera petición | 97,7 | 83,2 | 66,3 |
| Prompt de coding de 4.142 tokens, petición repetida | 101,2 | 85,6 | 74,9 |
| Prompt corto de 558 tokens | 95,0 | 90,5 | 69,8 |
| Respuesta larga de 1.500 tokens | 94,6 | 83,5 | 64,7 |
| Media de las cuatro pruebas | 97,1 | 85,7 | 68,9 |

En pesos oficiales idénticos, MTPLX promedia 85,0 tok/s frente a 73,8 de mlx-serve y 57,6 de oMLX. En tiempo al primer token, mlx-serve es más rápido: 1,53 s frente a 1,78 s de MTPLX y 2,54 s de oMLX para un prompt nuevo de 4.142 tokens; en petición repetida, 0,19 s, 0,81 s y 0,21 s respectivamente.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el pack ocupa 17,2 GB en disco; memoria pico medida de 19,5 GiB sirviendo un prompt de 4.142 tokens.
- Hardware objetivo: Macs con Apple Silicon M1 y M2 con 32 GB o más de memoria unificada, desde MacBook Pro hasta Mac Studio, según el autor.
- No está pensado para GPU NVIDIA ni para CUDA: la librería es mtplx, orientada a MLX y Apple Silicon.
- Despliegue: aplicación MTPLX y CLI `mtplx start`; MTPLX selecciona automáticamente este build FP16 en M1 y M2 y los packs padre en Macs más recientes.
- Throughput medido: 97,1 tok/s de media en un M5 Max con 128 GB con el pack Optimized Speed; el autor no publica cifras de velocidad para M1 o M2 porque este build aún no se ha ejecutado en ese hardware.
- Memoria: se recomienda margen sobre los 19,5 GiB medidos para prompts largos y respuestas extensas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini Optimized Speed FP16 (este pack) | 27,5B totales, 3,4B activos | Hasta 1M tokens | Apache 2.0 | Hugging Face, MTPLX en Apple Silicon |
| Inkling 2 Mini Optimized Speed (pack padre) | 26,4B totales, 3,4B activos | Hasta 1M tokens | Apache 2.0 | Hugging Face, MTPLX en Macs con bfloat16 |
| Inkling 2 Mini pesos oficiales | 26,4B totales, 3,4B activos | Hasta 1M tokens | Apache 2.0 | Hugging Face; ejecutable en MTPLX, mlx-serve y oMLX |

No se dispone de datos de benchmarks estándar para comparar el rendimiento de calidad frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Este build no se ha ejecutado en M1 o M2: las cifras de velocidad publicadas se midieron en un M5 Max usando la ruta de código de M1/M2, pero no hay mediciones reales en ese hardware.
- El tiempo al primer token de MTPLX es peor que el de mlx-serve en prompts nuevos (1,78 s frente a 1,53 s) y en peticiones repetidas (0,81 s frente a 0,19 s).
- La fidelidad frente a los pesos oficiales no es total: 96,1% de coincidencia en el token superior y divergencia KL media de 0,0155, lo que implica diferencias de salida respecto al modelo original.
- La ventana de 1M tokens es una cifra de la model card del modelo base; el coste de memoria crece con el contexto y el pico medido con 4.142 tokens ya es de 19,5 GiB.
- No hay información sobre idiomas soportados ni sobre sesgos conocidos del modelo base en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad para este pack.
- Dependencia de la cadena MTPLX/MLX: no es desplegable en vLLM, llama.cpp, Ollama ni TGI según la información disponible, lo que limita su uso a macOS con Apple Silicon.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de las dependencias de MTPLX antes de un uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16
- Pack padre Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MTPLX: https://mtplx.com
- Página del modelo en MTPLX: https://mtplx.com/models/inkling-2-mini/
- Comparativa MTPLX, mlx-serve y oMLX: https://mtplx.com/compare/mlx-serve-vs-omlx-vs-mtplx/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
