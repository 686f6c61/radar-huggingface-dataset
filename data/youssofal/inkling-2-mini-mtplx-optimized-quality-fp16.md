# Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16

## Resumen

Inkling-2-Mini-MTPLX-Optimized-Quality-FP16 es un empaquetado de pesos del modelo Inkling-2-Mini de Thinking Machines Lab, adaptado por el usuario Youssofal para su ejecución en Apple Silicon mediante el runtime MTPLX. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.388.646.440 parámetros totales y 3.400 millones de parámetros activos por token, según la model card, con una ventana de contexto de hasta 1.000.000 de tokens. Está orientado a generación de código, agentes y tareas multimodales de imagen y texto.

La particularidad de este paquete es su enfoque de despliegue: MTPLX incorpora decodificación especulativa mediante una cabeza de predicción multi-token (MTP) propia del modelo, que permite proponer varios tokens y validarlos en una sola pasada del modelo completo, preservando la distribución original. Además, esta variante concreta almacena todos los tensores de 16 bits (incluida la torre de visión y la cabeza de borrador) como float16, porque los Mac con chip M1 y M2 no disponen de bfloat16 nativo, mientras que conserva los códigos de 4 y 8 bits del paquete padre.

Es relevante ahora porque demuestra que un modelo MoE de 26.400 millones de parámetros con capacidades de visión y contexto de un millón de tokens puede servirse en hardware de consumo Apple con 32 GB o más, con velocidades de decodificación medidas por encima de 90 tokens por segundo en un M5 Max. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors facilitan su evaluación y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de visión; decodificación especulativa con cabeza MTP |
| Parametros totales | 26.388.646.440 |
| Parametros activos | 3.400 millones por token |
| Longitud de contexto | Hasta 1.000.000 de tokens (según model card del modelo base) |
| Tipos de cuantizacion | Pesos de 16 bits almacenados como float16; códigos de 4 y 8 bits heredados del paquete padre; referencias a NVFP4 y MXFP8 en los tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mtplx, orientada a MLX en Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos con 26.400 millones de parámetros totales y 3.400 millones activos por token, lo que reduce el coste computacional por paso de decodificación respecto a un modelo denso del mismo tamaño. Incorpora una torre de visión completa que permite entrada de imagen y texto (pipeline image-text-to-text), y una cabeza de predicción multi-token (MTP) que actúa como mecanismo de borrador para decodificación especulativa. Esta cabeza es la que explota MTPLX: propone varios tokens candidatos y el modelo completo los verifica en una única pasada, de modo que la salida mantiene la distribución del modelo original en lugar de recurrir a un modelo borrador externo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El paquete de Youssofal no reentrena el modelo: es una conversión de precisión que preserva los pesos de expertos y de atención originales, sustituyendo únicamente el almacenamiento de los tensores de 16 bits por float16 para chips sin bfloat16 nativo. Los códigos de 4 y 8 bits se mantienen idénticos al paquete padre, y el diseño de contexto y kernels es el mismo.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto de hasta 1.000.000 de tokens.
- Generación y razonamiento sobre código, incluyendo tareas de corrección y ejecución de pruebas: la model card reporta 6 de 6 pruebas de código ejecutables superadas en 3 tareas con 2 semillas cada una a temperatura 1.0.
- Comprensión de imágenes: la torre de visión completa permite leer capturas de pantalla, diagramas y fotografías; se documenta la lectura del nombre y ambos recuentos de una captura de un test fallido.
- Llamada a herramientas (tool calling / function calling): se documenta una turno de llamada que invoca la herramienta solicitada con la ciudad indicada por el usuario.
- Razonamiento multi-paso y uso como agente, apoyado por el contexto largo y la capacidad de llamada a herramientas.
- Decodificación especulativa nativa mediante la cabeza MTP, integrada en el runtime MTPLX.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de programación local en Mac: el modelo puede generar, revisar y corregir código en un entorno sin conexión, aprovechando sus 3.400 millones de parámetros activos para mantener velocidades de decodificación altas (medidas en torno a 85-97 tokens por segundo en un M5 Max) y su contexto de hasta 1.000.000 de tokens para cargar repositorios completos o trazas de error extensas.
- Análisis de capturas de pantalla y diagramas: la torre de visión permite interpretar imágenes de interfaces, diagramas de arquitectura o capturas de fallos de test, lo que resulta útil para depuración asistida a partir de material visual del usuario.
- Agentes locales con llamada a herramientas: al soportar function calling, puede integrarse en flujos que consulten APIs, ejecuten comandos o recuperen datos, manteniendo la conversación en local y evitando enviar información sensible a servicios externos.
- Revisión de código en pipelines de integración continua: con contexto largo puede procesar diffs amplios y registros de compilación, y su licencia Apache 2.0 permite integrarlo en herramientas internas de empresa sin restricciones de uso comercial.
- Prototipado de asistentes conversacionales en Apple Silicon: MTPLX ofrece una aplicación y una CLI (`mtplx start`) que seleccionan automáticamente esta variante FP16 en Macs M1 y M2 con 32 GB o más, lo que simplifica el despliegue en equipos de desarrollo.
- Evaluación e investigación de decodificación especulativa: al exponer una cabeza MTP y un runtime que la explota, sirve para estudiar el equilibrio entre velocidad de decodificación y fidelidad de distribución (la model card reporta un 95,7 % de coincidencia en el token superior y una divergencia KL media de 0,0174 frente a los pesos oficiales).
- Procesamiento de documentos largos con componente visual: la combinación de contexto de un millón de tokens y visión permite analizar informes extensos con gráficos incrustados en un solo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye mediciones propias de fidelidad y velocidad del runtime:

| Prueba | Resultado |
|---|---|
| Coincidencia del token superior frente a pesos oficiales (256 posiciones tras prompt de 4.142 tokens) | 245 de 256 (95,7 %); divergencia KL media 0,0174 |
| Pérdida sobre 6.140 tokens de código y prosa reales frente a pesos oficiales | -0,0028 nats por token (error estándar 0,0028, dentro del ruido) |
| Pruebas de código ejecutables (3 tareas, 2 semillas, temperatura 1.0) | 6 de 6 superadas |
| Memoria pico sirviendo un prompt de 4.142 tokens | 22,3 GiB |

Velocidad de decodificación en tokens por segundo, sobre los mismos pesos oficiales (MacBook Pro M5 Max, 128 GB, 23 de noviembre de 2026):

| Prueba | MTPLX 2.13.2 | mlx-serve 26.11.4 | oMLX 0.8.3 |
|---|---:|---:|---:|
| Prompt de código de 4.142 tokens, primera petición | 96,2 | 79,0 | 62,9 |
| Prompt de código de 4.142 tokens, petición repetida | 90,5 | 73,9 | 57,6 |
| Prompt corto de 558 tokens | 75,0 | 72,3 | 56,8 |
| Respuesta larga de 1.500 tokens | 78,1 | 70,1 | 53,0 |
| Media de las cuatro pruebas | 85,0 | 73,8 | 57,6 |

Con cada motor sobre su propio paquete rápido, la media de MTPLX es de 97,1 tokens por segundo frente a 85,7 de mlx-serve y 68,9 de oMLX. En tiempo hasta el primer token, MTPLX queda por detrás: 1,78 s frente a 1,53 s de mlx-serve y 2,54 s de oMLX en un prompt nuevo de 4.142 tokens. No se han medido velocidades en un M1 o M2 real; las cifras anteriores se obtuvieron en el M5 Max recorriendo la ruta de código que usaría un M1 o M2.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini (Thinking Machines) | 26.400 M / 3.400 M | Hasta 1.000.000 tokens | Apache 2.0 | Pesos abiertos en Hugging Face |
| Este paquete (Youssofal, FP16 MTPLX) | 26.400 M / 3.400 M | Hasta 1.000.000 tokens | Apache 2.0 | safetensors, runtime MTPLX para Apple Silicon |
| mlx-serve 8-bit pack (referenciado en la model card) | no disponible | no disponible | no disponible | Paquete de 18,7 GB para MLX |
| oMLX oQ4e pack (referenciado en la model card) | no disponible | no disponible | no disponible | Paquete de 16,9 GB para MLX |

La comparación disponible se limita a los motores de inferencia y paquetes de cuantización citados por el autor; no se aportan datos de otros modelos de la misma categoría (MoE multimodal de ~26.000 millones de parámetros) para comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Este paquete es una conversión de precisión, no un modelo entrenado desde cero: su calidad depende enteramente del modelo base Inkling-2-Mini y de la fidelidad de la conversión. La model card reporta una coincidencia del 95,7 % en el token superior, por lo que existe una divergencia pequeña pero no nula frente a los pesos oficiales.
- Las mediciones de velocidad se realizaron en un MacBook Pro M5 Max, no en un M1 o M2; el autor indica explícitamente que esta variante aún no se ha ejecutado en un M1 o M2 real.
- Requiere el runtime MTPLX y hardware Apple Silicon con 32 GB o más; no es un paquete portable a CUDA, vLLM, llama.cpp ni otros ecosistemas.
- La memoria pico medida sirviendo un prompt de 4.142 tokens es de 22,3 GiB, lo que deja poco margen en equipos de 32 GB con prompts más largos o respuestas extensas.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación del modelo base en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los componentes de terceros antes de desplegarlo en producción.
- El tiempo hasta el primer token es superior al de mlx-serve en prompts nuevos (1,78 s frente a 1,53 s), lo que puede penalizar cargas interactivas con prompts largos y peticiones no repetidas.

## Enlaces

- [Hugging Face: Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16](https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16)
- [Paquete padre: Inkling-2-Mini-MTPLX-Optimized-Quality](https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [MTPLX](https://mtplx.com)
- [Ficha del modelo en MTPLX](https://mtplx.com/models/inkling-2-mini/)
- [Comparativa MTPLX, mlx-serve y oMLX en Inkling 2 Mini](https://mtplx.com/compare/mlx-serve-vs-omlx-vs-mtplx/)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
