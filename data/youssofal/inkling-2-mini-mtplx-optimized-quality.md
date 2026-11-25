# Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality

## Resumen

Inkling-2-Mini-MTPLX-Optimized-Quality es un empaquetado optimizado del modelo abierto Inkling-2-Mini de Thinking Machines Lab, distribuido por el usuario Youssofal para su uso con MTPLX, el motor de inferencia local para Apple Silicon que implementa decodificación especulativa mediante predicción multi-token (MTP). El modelo base es un transformer de arquitectura Mixture of Experts (MoE) con 26.388 millones de parámetros totales y 3.400 millones activos por token, orientado a tareas de código, agentes y comprensión de imágenes, con una ventana de contexto de hasta 1 millón de tokens segun la model card del autor.

Este pack concreto, denominado "Optimized Quality", mantiene los pesos oficiales sin modificar (incluida la torre de visión completa) y los empaqueta para MTPLX, de modo que sirve como referencia frente a otras variantes cuantizadas del mismo modelo. Ocupa 20,2 GB de descarga y está pensado para ejecutarse en Macs con chip M3, M4 o M5 y al menos 32 GB de memoria unificada, mientras que los equipos M1 y M2 recurren a una build FP16 separada.

Su relevancia actual radica en que demuestra la viabilidad de ejecutar un MoE de 26B con capacidades multimodales y de agente en hardware de consumo Apple, alcanzando velocidades de decodificación de hasta 103,8 tok/s en un MacBook Pro M5 Max con 128 GB y superando a alternativas como mlx-serve y oMLX en las pruebas publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con torre de visión y cabeza de predicción multi-token (MTP) |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B por token |
| Longitud de contexto | Hasta 1.000.000 tokens (segun model card del modelo base) |
| Tipos de cuantizacion | Pack de 8 bits (modelopt); el modelo base admite NVFP4 y MXFP8 segun tags; build FP16 para M1/M2 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria de inferencia | mtplx |
| Tamano del repo | 20,2 GB |
| Pipeline | image-text-to-text |
| Modelo base | thinkingmachines/Inkling-2-Mini |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture of Experts con 26,4B parámetros totales y 3,4B activos por token, lo que permite un equilibrio entre capacidad y coste computacional en inferencia. Incluye una torre de visión completa que habilita la entrada de imágenes (capturas de pantalla, diagramas, fotografías) junto con texto, y una cabeza de predicción multi-token (MTP) que actúa como mecanismo de decodificación especulativa: el modelo redacta varios tokens por delante y los verifica en una sola pasada del modelo completo, preservando la distribución original de probabilidad.

Este pack concreto no modifica los pesos respecto al release oficial: es una conversión de formato y empaquetado para el motor MTPLX, con cuantización de 8 bits gestionada mediante modelopt. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación técnica destacable es la integración de MTP con el runtime MTPLX para Apple Silicon, que acelera la decodificación sin alterar la distribución de salida del modelo.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto de hasta 1M tokens.
- Generación y razonamiento sobre código, con soporte para tareas de ejecución y depuración (6 de 6 tests de codificación superados en las pruebas del autor).
- Comprensión de imágenes: lectura de capturas de pantalla, diagramas y fotografías mediante la torre de visión incluida.
- Tool calling / function calling: el autor reporta que el modelo invoca correctamente la herramienta solicitada con los parámetros indicados por el usuario.
- Razonamiento agéntico y multi-paso, orientado a flujos de agentes autónomos.
- Decodificación especulativa nativa mediante cabeza MTP, con verificación en una sola pasada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación local en Mac: el modelo puede generar, revisar y depurar código directamente en el portátil del desarrollador, sin enviar datos a la nube, aprovechando sus 3,4B parámetros activos y la ventana de 1M tokens para cargar repositorios completos en contexto.
- Análisis de capturas de pantalla y diagramas: gracias a la torre de visión, puede leer el nombre y los contadores de un test fallido en una captura y proponer una corrección, útil en herramientas de QA internas.
- Agentes autónomos de desarrollo: su soporte de tool calling y razonamiento multi-paso permite integrarlo en pipelines que consultan APIs, ejecutan tests y aplican parches de forma iterativa.
- Atención al cliente automatizada: la ventana de contexto de 1M tokens posibilita gestionar conversaciones largas con historial extenso y documentación de producto adjunta, manteniendo coherencia entre turnos.
- Procesamiento de documentación técnica con imágenes: puede extraer información de diagramas de arquitectura y manuales escaneados combinando entrada image-text-to-text en un flujo local.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: con MTPLX y este pack de referencia, un equipo puede validar calidad de respuestas antes de decidir una cuantización más agresiva (Optimized Speed, 17,2 GB) para producción.
- Inferencia privada en el dispositivo: al ejecutarse localmente en un Mac, es adecuado para entornos con requisitos de confidencialidad donde no se permite enviar prompts a servicios externos.

## Benchmarks y rendimiento

Los datos publicados por el autor miden velocidad de inferencia, no calidad en benchmarks académicos estándar. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

| Prueba (MacBook Pro M5 Max, 128 GB) | Resultado |
|---|---|
| Velocidad de decodificación pico (primeros 32 tokens) | 103,8 tok/s |
| Primer token en prompt nuevo de 4.142 tokens | 1,84 s (prefill a 2.257 tok/s) |
| Ruta de código M3/M4 (forzada en M5 Max): generación en conversación cacheada | 79,7 tok/s |
| Ruta de código M3/M4: primer token de seguimiento | 0,07 s |
| Tests de codificación ejecutables (3 tareas, 2 semillas) | 6 de 6 superados |
| Memoria pico sirviendo prompt de 4.142 tokens | 22,4 GiB |

Comparativa de decodificación entre motores sobre los mismos pesos oficiales (media de cuatro pruebas):

| Motor | Media (tok/s) |
|---|---|
| MTPLX 2.13.2 | 85,0 |
| mlx-serve 26.11.4 pre-release | 73,8 |
| oMLX 0.8.3 | 57,6 |

Con cada motor usando su pack rápido propio, MTPLX alcanza 97,1 tok/s de media frente a 85,7 de mlx-serve y 68,9 de oMLX. En tiempo al primer token sobre prompt nuevo de 4.142 tokens, mlx-serve es más rápido (1,53 s) que MTPLX (1,78 s) y oMLX (2,54 s).

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 22,4 GiB en pico sirviendo un prompt de 4.142 tokens; se recomienda un mínimo de 32 GB de memoria unificada.
- Equipos compatibles: Macs con chip M3, M4 o M5 con 32 GB o más (desde MacBook Air hasta Mac Studio). Los Macs M1 y M2 con 32 GB o más usan la build FP16.
- GPU dedicadas: no aplica; el pack está diseñado para Apple Silicon mediante MLX. Para A100, H100 o RTX 4090 sería necesario usar el modelo base con otro runtime (vLLM, TGI, llama.cpp), no disponible en este pack.
- Despliegue: MTPLX (app y CLI, con `mtplx serve`). Alternativas sobre los pesos oficiales: mlx-serve, oMLX, mlx-lm.
- Latencia y throughput medidos: 103,8 tok/s pico de decodificación en M5 Max; 79,7 tok/s en la ruta de código de M3/M4; prefill a 2.257 tok/s; primer token en 1,84 s para 4.142 tokens. Sesiones largas en un Mac caliente rinden por debajo del pico.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (este pack) | 26,4B | 3,4B | 1M | Apache 2.0 | Hugging Face, MTPLX |
| Inkling-2-Mini Optimized Speed (mismo autor) | 26,4B | 3,4B | 1M | Apache 2.0 | Pack de 17,2 GB, mas rapido, cuantizacion mas agresiva |
| Pack 8-bit de mlx-serve | 26,4B | 3,4B | 1M | Apache 2.0 | 18,7 GB, media de 85,7 tok/s |
| Pack oQ4e de oMLX | 26,4B | 3,4B | 1M | Apache 2.0 | 16,9 GB, media de 68,9 tok/s |

No se dispone de datos de benchmarks de calidad para comparar con modelos de otros laboratorios de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo entrenado con datos web, es esperable heredar sesgos de esos corpus, pero no hay documentación al respecto.
- Riesgo de alucinación: no cuantificado; como todo LLM generativo, puede producir contenido plausible pero incorrecto, especialmente en contextos largos o tareas de código complejas.
- Limitaciones de idioma: los idiomas soportados no están documentados en la información disponible, lo que impide garantizar calidad en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini y de las dependencias (modelopt, MLX) antes de desplegar en producción.
- Dependencia de hardware: el pack está atado a Apple Silicon (M3/M4/M5 con 32 GB o más); no es portable a GPUs NVIDIA o AMD sin reconvertir los pesos.
- Rendimiento variable: las cifras de velocidad se midieron con presión térmica nominal; sesiones prolongadas en un Mac caliente reducen el throughput por debajo del pico publicado.
- Tiempo al primer token: MTPLX es más lento que mlx-serve en el primer token de prompts nuevos (1,78 s frente a 1,53 s), lo que puede importar en cargas interactivas con prompts largos y fríos.
- Madurez: el pack se publicó el 22 de noviembre de 2026 y tiene pocas descargas (1.258) y likes (3); no hay validación independiente de sus resultados más allá de los publicados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MTPLX (proyecto y app): https://mtplx.com
- Página del modelo en MTPLX: https://mtplx.com/models/inkling-2-mini/
- Comparativa MTPLX vs mlx-serve vs oMLX: https://mtplx.com/compare/mlx-serve-vs-omlx-vs-mtplx/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
