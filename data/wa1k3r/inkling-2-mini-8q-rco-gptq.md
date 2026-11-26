# Wa1k3r/Inkling-2-Mini-8Q-RCO-GPTQ

## Resumen

Inkling-2-Mini 8Q RCO-GPTQ es una cuantización de 8 bits del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario Wa1k3r bajo licencia Apache-2.0. Se trata de un archivo GGUF de 18,26 GB que empaqueta los pesos del modelo junto con su propia draft head (cabeza de borrador para decodificación especulativa) en un único fichero, con el objetivo declarado de ejecutar un contexto de 524.288 tokens sobre una única tarjeta gráfica de 24 GB.

El modelo base es un mixtura de expertos con arquitectura de transformer con bucles (looped transformer): 24 capas, de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa. Cuenta con 128 expertos por capa, de los que se activan 8 por token, y un total de 26.388.288.144 parámetros. Veinte capas atienden a una ventana de 1.024 tokens y cuatro ven el contexto completo.

La relevancia de esta ficha radica en su enfoque de cuantización híbrida: conserva los expertos en el formato de coma flotante de 4 bits del vendor (NVFP4) copiado bit a bit del checkpoint, mientras que las 176 matrices de atención y el resto de tensores se cuantizan a 8 bits (Q8_0), con las matrices de atención ajustadas mediante GPTQ. El resultado es un archivo que no es compatible con llama.cpp estándar y requiere el motor LexiEngine (Vulkan) de la suite LexiSuite.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts con transformer con bucles (looped transformer) |
| Parámetros totales | 26.388.288.144 |
| Parámetros activos | 8 expertos de 128 por capa (número de parámetros activos no disponible) |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantización | Expertos en NVFP4 (4 bits, copiados del checkpoint); matrices de atención en Q8_0 ajustadas con GPTQ; resto en Q8_0 o tal como se publicó; filas de caché a 4 bits para el contexto máximo |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (18.263.767.520 bytes; SHA-256 `e2033b2d8b54335f22c1cbe3bbb4cfa5da642c70750443958ef4d65e064b37fa`) |

## Arquitectura y entrenamiento

El modelo base es un mixtura de expertos con 24 capas, de las cuales las 12 intermedias se ejecutan tres veces compartiendo pesos, lo que da 48 aplicaciones de capa por token y 48 cachés en tiempo de ejecución. Cada capa dispone de 128 expertos, de los que se activan 8 por token. La atención se distribuye de forma asimétrica: veinte capas operan con una ventana de 1.024 tokens y cuatro capas atienden al contexto completo, lo que permite sostener ventanas de hasta 524.288 tokens. El vendor distribuye los expertos ya en un formato de coma flotante de 4 bits (NVFP4).

El proceso de cuantización de esta ficha, realizado con la herramienta Quant Forge de LexiPanel, consta de cuatro etapas: calibración con 16 ventanas de 512 tokens a través del modelo en precisión completa, registro de las entradas de cada matriz de atención; ajuste GPTQ de las 176 matrices de atención contra esas entradas (un ejemplo citado: el error de salida de una matriz de 8 bits pasó de 6,48 con redondeo simple a 0,90 ajustada); búsqueda RCO del mejor mix de formatos bajo un presupuesto de tamaño (el presupuesto es "caber con 524k de contexto en 24 GB", y todas las matrices caben a 8 bits, por lo que el resultado es 8 bits en todo); y construcción final del archivo. Los expertos se copian bit a bit desde el checkpoint sin recuantizar, lo que evita la decodificación y recuantización que produciría un archivo de 27,8 GB a 8 bits, inviable en 24 GB. El archivo incluye además la propia draft head del modelo (54 tensores, 0,64 GB) empaquetada para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado de text-generation y uso conversacional.
- Razonamiento de contexto largo: soporta hasta 524.288 tokens, con recuperación verificada de 10 de 10 hechos plantados a lo largo de un prompt de 523.264 tokens (desde el 1 % hasta el 99 % de su longitud).
- Decodificación especulativa mediante draft head integrada en el propio archivo, con ganancia medida de hasta 1,9 veces en generación a 16k de contexto.
- Ejecución local en GPU de consumo de 24 GB (Radeon RX 7900 XTX) con todo el modelo y sus cachés en la tarjeta.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, function calling, agentes, visión, audio o thinking mode: no disponibles en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Análisis de documentos extensos en local: el modelo puede procesar prompts de hasta 524.288 tokens en una sola tarjeta de 24 GB, lo que permite cargar libros completos, expedientes o bases de código y formular preguntas sobre ellos sin fragmentación, con recuperación verificada a lo largo de todo el contexto.
- Asistencia conversacional de contexto largo: al mantener 48 cachés y una ventana de medio millón de tokens, puede sostener conversaciones multi-turno con historial extenso sin truncar, adecuado para atención al cliente técnica o soporte especializado en inglés.
- Inferencia en estación de trabajo con GPU AMD: es una de las pocas opciones documentadas para ejecutar un MoE de 26.000 millones de parámetros con contexto masivo sobre Vulkan y una RX 7900 XTX, útil en entornos sin CUDA.
- Procesamiento por lotes de resúmenes y extracción de información: el throughput medido de prompt (2.417 tok/s a 4.096 tokens) permite procesar grandes volúmenes de texto de entrada con coste de prefill contenido.
- Generación interactiva con decodificación especulativa: la draft head integrada eleva la generación de 56,1 a 105,7 tok/s a 16k de contexto, lo que la hace viable para chat en tiempo real en local.
- Evaluación e investigación de técnicas de cuantización: el archivo sirve como referencia reproducible de cuantización híbrida NVFP4/Q8_0 con ajuste GPTQ, con métricas de divergencia KL publicadas para comparar variantes de redondeo.
- Prototipado de pipelines de agentes de contexto largo: la compatibilidad con endpoints y el contexto de 524k permiten integrarlo en flujos que requieran memoria de trabajo extensa, siempre que las capacidades de tool calling se confirmen en el modelo base.

## Benchmarks y rendimiento

Rendimiento medido en un Radeon RX 7900 XTX (24 GB), Intel i7-9700, Linux, Vulkan, filas de caché a 4 bits, decodificación greedy, 22 de noviembre de 2026:

| Longitud de prompt | Velocidad de prompt | Generación simple | Generación con draft head |
|---:|---:|---:|---:|
| 4.096 | 2.417 tok/s | 66,3 tok/s | no disponible |
| 16.384 | 2.300 tok/s | 64,9 tok/s | 105,7 tok/s (5,7 tokens por paso) |
| 523.264 | 787,6 tok/s (11 min 4 s) | 40,1 tok/s | 39,6 tok/s frente a 37,0 simple en la misma ejecución (3,0 tokens por paso) |

Memoria medida a 524.288 tokens de contexto: pesos 17,62 GB, cachés (524.288 posiciones, 48 ranuras) 5,02 GB, scratch 0,58 GB. Todo reside en la tarjeta.

Divergencia respecto a una ejecución de referencia de los pesos publicados, 1.024 posiciones (dos textos de 512 tokens); menor es mejor:

| Archivo | Cachés sin redondear: KL / mismo token top | Cachés a 4 bits: KL / mismo token top |
|---|---|---|
| Este archivo (ajustado) | 0,00141 / 99,02 % | 0,00549 / 97,56 % |
| Redondeo simple | 0,00175 / 99,22 % | 0,00499 / 97,56 % |

Prueba de aceptación de la herramienta de cuantización sobre ventana reservada: KL 0,00214 frente a un límite de 0,02; mismo token top 99,02 % frente a un mínimo de 95 %.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 17,62 GB de pesos + 5,02 GB de cachés a 524.288 tokens + 0,58 GB de scratch = aproximadamente 23,2 GB en el peor caso; el archivo requiere una tarjeta de 24 GB para el contexto máximo.
- GPU recomendadas: Radeon RX 7900 XTX (24 GB) es la plataforma medida y documentada; el motor es Vulkan, por lo que se orienta a GPU AMD Radeon. Compatibilidad con A100, H100 o RTX 4090: no disponible en la información proporcionada.
- Cabe en GPU de consumo de 24 GB (RX 7900 XTX) con el contexto completo; para contextos menores el requisito de VRAM se reduce proporcionalmente al tamaño de las cachés.
- Opciones de despliegue: exclusivamente LexiEngine (Rust, Vulkan) de la suite LexiSuite. No es un archivo compatible con llama.cpp estándar, por lo que Ollama, vLLM o TGI no están soportados según la información disponible.
- Versión mínima del motor: imagen de pruebas `3a376f8` o posterior para leer la draft head desde el archivo; la imagen `b753bf3` carga y genera (53 tok/s en prompt corto) pero no usa la draft head.
- Latencia y throughput: ver tabla de benchmarks (hasta 2.417 tok/s de prompt a 4k y 105,7 tok/s de generación con draft head a 16k).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor |
|---|---|---|---|---|---|
| Inkling-2-Mini 8Q RCO-GPTQ (esta ficha) | 26,4 B (MoE, 8 de 128 expertos) | 524.288 | NVFP4 + Q8_0 + GPTQ | Apache-2.0 | LexiEngine (Vulkan) |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B (MoE, 8 de 128 expertos) | 524.288 | precisión completa / NVFP4 del vendor | Apache-2.0 | no disponible |
| Conversión estándar a 8 bits del mismo modelo | 26,4 B | 524.288 | 8 bits uniforme (27,8 GB) | Apache-2.0 | no disponible |

La comparativa se limita al modelo base y a su conversión estándar a 8 bits, ambos citados en la model card. No se dispone de datos de benchmarks ni de alternativas de otros fabricantes en la información proporcionada para establecer comparaciones de rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo no funciona en llama.cpp estándar ni, presumiblemente, en ecosistemas derivados (Ollama, vLLM, TGI); requiere LexiEngine y una versión concreta del motor (`3a376f8` o posterior para la draft head).
- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Precisión de la cuantización: con cachés a 4 bits, que es la configuración necesaria para 524k de contexto en 24 GB, la divergencia KL es de aproximadamente 0,005 y el archivo con redondeo simple queda marginalmente por delante (0,00499 frente a 0,00549); el ajuste GPTQ es real pero pequeño, y la fuente principal de error es la caché a 4 bits, no el archivo de pesos.
- Degradación de la draft head en contexto profundo: a 524k la ganancia especulativa cae (39,6 frente a 37,0 tok/s en la misma ejecución), porque la propia atención de la draft head sobre tanto contexto consume parte del ahorro.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es susceptible a ella, especialmente en contextos muy largos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del motor LexiEngine, cuyo código no se detalla en la ficha.
- Plataforma: las mediciones se realizaron en una única configuración (RX 7900 XTX, i7-9700, Linux, Vulkan); el rendimiento en otras GPU o sistemas operativos no está verificado.
- Advertencia de producción: el autor indica que las mediciones se tomaron sobre código de motor en fase de pruebas; validar estabilidad y reproducibilidad antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wa1k3r/Inkling-2-Mini-8Q-RCO-GPTQ
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- LexiSuite: https://huggingface.co/Wa1k3r/LexiSuite
