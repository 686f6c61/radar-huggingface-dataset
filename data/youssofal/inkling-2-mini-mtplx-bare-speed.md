# Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed

## Resumen

Inkling-2-Mini-MTPLX-Bare-Speed es un paquete de pesos cuantizados del modelo Inkling-2-Mini de Thinking Machines Lab, preparado por el usuario Youssofal para su ejecución local en Apple Silicon mediante MTPLX, una aplicación y CLI para modelos locales en macOS. El modelo base es un MoE de 26.437.722.672 parámetros totales con aproximadamente 3.400 millones de parámetros activos por token y una ventana de contexto de hasta 1M tokens, orientado a código, agentes e imágenes (pipeline image-text-to-text).

Este pack concreto, denominado "Bare Speed", mantiene los pesos oficiales de 4 bits en los expertos y aplica además cuantización de 4 bits a la atención, la cabeza de salida y los embeddings, lo que lo convierte en el más pequeño de los tres packs de Inkling 2 Mini publicados por MTPLX: 16,0 GB de descarga. Incluye la torre de visión completa, por lo que puede leer capturas de pantalla, diagramas y fotografías.

Su relevancia radica en que incorpora decodificación especulativa mediante la propia cabeza de borrador (draft head) del modelo, con predicción multi-token (MTP): MTPLX redacta varios tokens por adelantado y los verifica en una sola pasada del modelo completo, preservando la distribución del modelo original. Está pensado para Macs M3, M4 y M5 con 24 GB o más de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer con torre de visión; decodificación especulativa MTP |
| Parametros totales | 26.437.722.672 |
| Parametros activos | ~3.400 millones por token |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | 4 bits (expertos, atención, cabeza de salida y embeddings); el proyecto ofrece también build FP16 para M1/M2 y pack "Optimized Quality" de 20,2 GB |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mtplx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 26.437 millones de parámetros totales y unos 3.400 millones activos por token, según los datos de su model card. Incorpora una torre de visión completa que permite entrada image-text-to-text, y una cabeza de predicción multi-token (MTP) que actúa como draft head para decodificación especulativa. El contexto declarado alcanza 1M tokens.

Este pack no reentrena el modelo: parte de los pesos oficiales de Thinking Machines Lab y aplica cuantización de 4 bits a los expertos (pesos oficiales 4-bit) y también a atención, cabeza de salida y embeddings, reduciendo el tamaño a 16,0 GB. La innovación técnica destacable es el uso del propio draft head para generar varios tokens candidatos y verificarlos en una única pasada del modelo completo, de modo que la salida conserva la distribución del modelo original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Generación y comprensión de código; en las pruebas del autor supera 6 de 6 tests ejecutables (3 tareas, 2 semillas, temperatura 1.0).
- Visión: lectura de capturas de pantalla, diagramas y fotografías mediante la torre de visión incluida en el pack.
- Tool calling / function calling: en la prueba del autor invoca la herramienta solicitada con la ciudad indicada por el usuario.
- Razonamiento multi-paso y flujos de agente.
- Decodificación especulativa con predicción multi-token para acelerar la generación.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo genera y revisa código con tool calling, integrándose en el flujo de trabajo del desarrollador sin enviar datos a la nube; sus 3.400 millones de parámetros activos mantienen el coste por token bajo.
- Depuración a partir de capturas de pantalla: gracias a la torre de visión, puede leer una captura de un test fallido, extraer el nombre del test y los recuentos de fallos, y proponer la corrección.
- Agentes de automatización con llamadas a herramientas: el soporte de function calling permite construir agentes que consulten APIs, ejecuten comandos o consulten bases de datos en pasos encadenados.
- Análisis de documentación técnica y diagramas: con contexto de hasta 1M tokens puede procesar repositorios, manuales o diagramas de arquitectura completos y responder preguntas sobre ellos.
- Sesiones de programación de contexto largo: la ventana de 1M tokens permite mantener conversaciones prolongadas con historial de código sin truncar, útil en refactorizaciones grandes.
- Prototipado de asistentes conversacionales privados: al ejecutarse localmente en Apple Silicon con licencia Apache 2.0, encaja en escenarios con requisitos de privacidad o sin conectividad.
- Servicio local de inferencia para equipos pequeños: mediante `mtplx serve` se expone el modelo como servidor en la red local, con decodificación especulativa para reducir la latencia percibida.

## Benchmarks y rendimiento

Datos medidos por el autor en MTPLX 2.13 (22 de noviembre de 2026) sobre un MacBook Pro M5 Max con 128 GB, sampler del modelo (temperatura 1.0, top-p 1.0, top-k desactivado):

| Prueba | Resultado |
|---|---|
| Velocidad de decodificación, pico (128 tokens, prompt de 4.142 tokens en caché) | 128,8 tok/s |
| Primer token en prompt nuevo de 4.142 tokens | media 1,69 s (rango 1,62-1,72), prefill 2.466 tok/s |
| Ruta de código de Macs M3/M4 (forzada en el mismo M5 Max) | 106,1 tok/s en conversación cacheada; 0,06 s al primer token de seguimiento |
| Coincidencia con el token top de los pesos oficiales (256 posiciones) | 239 de 256 (93,4%), divergencia KL media 0,0297 |
| Pérdida en 6.140 tokens de código y prosa reales frente a pesos oficiales | +0,0109 nats por token (error estándar 0,0040) |
| Tests de código ejecutables | 6 de 6 superados |
| Memoria pico sirviendo un prompt de 4.142 tokens | 18,3 GiB |

Comparativa de motores sobre los mismos pesos oficiales (20,2 GB), decodificación en tok/s, M5 Max de 128 GB:

| Prueba | MTPLX 2.13.2 | mlx-serve 26.11.4 | oMLX 0.8.3 |
|---|---:|---:|---:|
| Prompt de código 4.142 tokens, primera petición | 96,2 | 79,0 | 62,9 |
| Prompt de código 4.142 tokens, petición repetida | 90,5 | 73,9 | 57,6 |
| Prompt corto de 558 tokens | 75,0 | 72,3 | 56,8 |
| Respuesta larga de 1.500 tokens | 78,1 | 70,1 | 53,0 |
| Media de las cuatro pruebas | 85,0 | 73,8 | 57,6 |

Con cada motor en su pack rápido (MTPLX Optimized Speed 17,2 GB, mlx-serve 8-bit 18,7 GB, oMLX oQ4e 16,9 GB), la media es 97,1 tok/s para MTPLX frente a 85,7 y 68,9. En tiempo al primer token sobre pesos oficiales, mlx-serve es más rápido (1,53 s frente a 1,78 s de MTPLX y 2,54 s de oMLX en prompt nuevo; 0,19 s, 0,81 s y 0,21 s en petición repetida).

## Requisitos de hardware

- VRAM/memoria unificada: 18,3 GiB de pico sirviendo un prompt de 4.142 tokens; descarga de 16,0 GB.
- Macs compatibles: M3, M4 y M5 con 24 GB o más de memoria unificada (desde MacBook Air hasta Mac Studio); M1 y M2 con 32 GB o más usan el build FP16 del proyecto.
- No está pensado para GPU NVIDIA ni CUDA: depende de MLX y Apple Silicon.
- Despliegue: aplicación MTPLX y CLI `mtplx serve`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Rendimiento: pico de 128,8 tok/s en M5 Max con 128 GB; 106,1 tok/s en la ruta de M3/M4; prefill de 2.466 tok/s. Sesiones largas en un Mac caliente van más lentas que el pico.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MTPLX-Bare-Speed | 26,4B | ~3,4B | 1M | Apache 2.0 | Pack MLX/MTPLX para Apple Silicon |
| Inkling-2-Mini (pesos oficiales) | 26,4B | ~3,4B | 1M | Apache 2.0 | Pesos oficiales, 20,2 GB en pack Optimized Quality |
| mlx-serve 8-bit de Inkling 2 Mini | 26,4B | ~3,4B | 1M | Apache 2.0 | Pack de 18,7 GB para MLX |
| oMLX oQ4e de Inkling 2 Mini | 26,4B | ~3,4B | 1M | Apache 2.0 | Pack de 16,9 GB para oMLX |

La comparación relevante es entre motores y packs del mismo modelo base, no entre modelos distintos; no se dispone de datos de benchmarks frente a otras familias de modelos.

## Limitaciones y advertencias

- Es una cuantización de 4 bits: la coincidencia con el token top de los pesos oficiales es del 93,4% y la pérdida aumenta 0,0109 nats por token, por lo que puede divergir del modelo original en generaciones largas o sensibles.
- El rendimiento medido corresponde a un M5 Max con 128 GB; en M3, M4 o configuraciones de 24 GB la velocidad será notablemente menor, y las sesiones prolongadas con el equipo caliente reducen el throughput.
- Dependencia exclusiva del ecosistema MTPLX y Apple Silicon (MLX); no hay soporte documentado para CUDA, vLLM, llama.cpp u Ollama en este pack.
- El tiempo al primer token es peor que el de mlx-serve sobre los mismos pesos (1,78 s frente a 1,53 s en prompt nuevo), aunque la decodificación sea más rápida.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación del modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base de Thinking Machines Lab antes de un despliegue comercial.
- El repositorio tiene 0 likes y unas 1.029 descargas, con una única revisión publicada en noviembre de 2026; la validación por terceros es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MTPLX: https://mtplx.com
- Página del modelo en MTPLX: https://mtplx.com/models/inkling-2-mini/
- Comparativa MTPLX vs mlx-serve vs oMLX: https://mtplx.com/compare/mlx-serve-vs-omlx-vs-mtplx/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
