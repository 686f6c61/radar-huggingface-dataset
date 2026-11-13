# tk0331/zils-d3-lite-body-3

## Resumen

KnowLine-0.8B-Gen1 es un modelo de decisión de 0,8 mil millones de parámetros desarrollado por PelaAI, un equipo con sede en Japón, y publicado originalmente como `PelaAI/KnowLine-0.8B-Gen1`. El repositorio analizado, `tk0331/zils-d3-lite-body-3`, es una reformateo de esos pesos: conserva intactos los pesos lingüísticos y solo cambia el almacenamiento, guardando cada tensor en bfloat16 bajo los nombres del modelo completo Qwen3.5. No se trata, por tanto, de un modelo nuevo, sino de una redistribución del checkpoint original.

El modelo resuelve un problema muy concreto: mapear un estado estructurado y una o varias preguntas tipadas a probabilidades sobre un conjunto de opciones suministradas. Admite preguntas de elección entre opciones nombradas, preguntas de sí/no y preguntas de puntuación ordenada. No genera texto libre cuando responde: lee directamente la probabilidad de la etiqueta de cada opción, lo que lo convierte en una pieza de infraestructura para sistemas de enrutamiento, clasificación y decisión, más que en un asistente conversacional.

Su relevancia actual radica en su tamaño reducido y su latencia: con un único H20 y una petición a la vez reporta una mediana de 24,6 ms y una media de 39,6 ms. Además, incorpora una temperatura de lectura T = 1,54 ajustada sobre datos de validación y plegada en los pesos, con un ECE de 0,008-0,012 en la suite pública, lo que apunta a probabilidades calibradas, un requisito habitual en producción cuando la salida del modelo alimenta umbrales o políticas de negocio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), con torre de visión heredada del modelo base |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; la model card menciona lecturas de hasta 3.000 tokens en peticiones cortas de solo texto |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en bfloat16) |
| Idiomas soportados | no disponible; la model card incluye referencias a chino (README.zh.md) y resultados en C-Eval y JevBench |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. Sobre esa base se aplicó una época de LoRA SFT con rango 32 y alpha 64, restringida a las capas lineales del modelo de lenguaje, con un máximo de 12.288 tokens por fila; el adaptador se fusionó en pesos bfloat16. El checkpoint publicado corresponde al final del entrenamiento. Los datos de entrenamiento incluyen tareas de decisión redactadas y etiquetadas por profesores LLM, y no se distribuyen en el repositorio.

La innovación técnica principal no está en la arquitectura, sino en el mecanismo de lectura. La temperatura de lectura T = 1,54 se ajustó sobre datos de validación y se plegó en `model.language_model.norm.weight` (documentado en `CALIBRATION.json`), de modo que el front end lee a temperatura 1. Para las preguntas de puntuación, `temperatures.json` divide los logits por 0,6494 (= 1/1,54), de forma que también se leen a temperatura efectiva 1,0. El front end (`knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) renderiza los prompts con `enable_thinking=False` y realiza una doble lectura en peticiones cortas de solo texto, de hasta 3.000 tokens en la primera pasada. No hubo entrenamiento con imágenes: la torre de visión es la del modelo base.

## Capacidades

- Preguntas de elección entre opciones nombradas, devolviendo una distribución de probabilidad sobre las etiquetas suministradas.
- Preguntas de sí/no con probabilidad calibrada de la respuesta afirmativa.
- Preguntas de puntuación ordenada, leídas a temperatura efectiva 1,0 mediante el ajuste de logits.
- Lectura directa de la probabilidad de cada etiqueta de opción, sin generación de texto libre en la respuesta.
- Doble lectura en peticiones cortas de solo texto (hasta 3.000 tokens leídos una vez), orientada a estabilizar la decisión.
- Procesamiento de estado estructurado junto con una o varias preguntas tipadas en una misma petición.
- Capacidad multimodal heredada del modelo base a través de su torre de visión, aunque sin entrenamiento específico en imágenes.
- Soporte de tool calling, function calling y razonamiento multi-paso en modo agente: no disponible.
- Modo thinking: el front end lo desactiva explícitamente (`enable_thinking=False`); la plantilla de chat del repositorio lo activa por defecto, por lo que debe desactivarse manualmente si se construyen los prompts a mano.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del caso como estado y una pregunta de elección con criterios por equipo (por ejemplo, facturación frente a soporte técnico), y devuelve la probabilidad de cada cola. La latencia de 24,6 ms de mediana permite integrarlo de forma síncrona en la puerta de entrada de un sistema de ticketing.
- Clasificación con umbral de confianza: al devolver probabilidades calibradas (ECE de 0,008-0,012 en la suite pública), puede alimentar una política que derive a revisión humana los casos por debajo de un umbral, sin necesidad de un modelo adicional de calibración.
- Automatización de decisiones de reembolso o devolución: con un estado como "el paquete llegó dañado" y una pregunta de sí/no, el modelo produce la probabilidad de concesión, tal como muestra el ejemplo de quickstart de la model card.
- Puntuación ordenada en encuestas o evaluaciones: las preguntas de tipo score permiten obtener una distribución sobre una escala ordenada, útil para moderación de contenido o priorización de incidencias.
- Filtrado previo en pipelines de datos: con 0,85B de parámetros y salida restringida a etiquetas, puede ejecutarse sobre grandes volúmenes para etiquetar o descartar registros antes de pasarlos a un modelo mayor, reduciendo coste por petición.
- Extracción de señales en sistemas de decisión multi-etiqueta: una misma petición puede incluir varias preguntas tipadas sobre el mismo estado, lo que permite resolver en una sola llamada decisiones relacionadas (por ejemplo, reembolso y equipo responsable) y mantener coherencia entre ellas.
- Servicio de decisión de baja latencia en producción: el front end incluido sirve el endpoint `/v1/systemone` sobre SGLang 0.5.21, lo que facilita el despliegue como microservicio con contrato JSON estable.

## Benchmarks y rendimiento

| Benchmark | KnowLine-0.8B-Gen1 | KnowLine-2B-Gen1 | Fuente |
|---|---:|---:|---|
| Decision Index 0.3 público | 44,51 | no disponible | auto-ejecución, kit oficial |
| Decision Index 0.3 bruto | 58,35 | no disponible | auto-ejecución |
| C-Eval (4 categorías, macro) | 56,3 | 67,0 | model card |
| JevBench | 71,9 | 77,5 | model card |
| JevBench-hard | 49,5 | no disponible (truncado en la información) | model card |
| S1MB (English v1, ejecución local) | 34,17 (media de tarea, 137 benchmarks, 26.269 decisiones) | no disponible | model card |

Detalles de la ejecución del Decision Index 0.3 público: realizada el 29 de octubre de 2026 con los archivos del repositorio en bf16 y doble lectura, sobre cuatro servidores H20 idénticos arrancados con `serve_knowline.sh` y 32 fragmentos de cliente. Se enviaron 140.620 peticiones, de las cuales 140.178 eran puntuables; las 140.178 se respondieron sin errores ni respuestas no soportadas, sin reintentos y sin truncamiento de entradas. Latencias con una petición a la vez: mediana 24,6 ms, media 39,6 ms, percentil 95 de 117,3 ms.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 852.985.920 parámetros en bf16, los pesos ocupan aproximadamente 1,7 GB, a los que hay que sumar caché KV y overhead del runtime; el tamaño del repositorio es de 1,7 GB.
- GPU recomendadas: la model card reporta mediciones sobre H20. No se especifican otras GPU validadas.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la información disponible; por tamaño de pesos en bf16 cabría en tarjetas con 8 GB o más de VRAM, pero no hay validación publicada.
- Opciones de despliegue: el front end oficial requiere PyTorch con CUDA, `transformers` y SGLang 0.5.21, y se arranca con `serve_knowline.sh <ruta> <gpu> <puerto>`, sirviendo `/v1/systemone`. `temperatures.json` debe estar junto al script. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 24,6 ms de mediana, 39,6 ms de media y 117,3 ms de percentil 95 con una petición a la vez en un H20. El throughput agregado con los 32 fragmentos de cliente no se detalla.

## Comparativa con modelos similares

Datos del snapshot del board Decision Index (multimodalart/jev-decision-index @ c130faf6, generado el 29 de octubre de 2026 a las 14:04 UTC). La puntuación DI 0.4.1 completa procede de la ejecución privada de los mantenedores del board.

| Modelo | Tamaño | DI 0.3 público | DI 0.4.1 completo | Origen del dato |
|---|---:|---:|---:|---|
| **KnowLine-0.8B-Gen1** | 0,8B | **44,51** | sin puntuar | auto-ejecución, kit oficial |
| GLiClass v4 edge | 0,4B | 47,49 | 31,21 | board |
| OneJev1.6-0.8B | 0,9B | 48,76 | 29,58 | board |
| crystal-0.8b | 0,9B | 42,79 | 29,37 | board |
| vLLM-SR vela3-fast | 0,4B | 50,36 | 29,27 | board |
| StartLux-Decision v1.1 0.8B | 0,9B | 53,79 | 28,88 | board |

Conviene interpretar la tabla con cautela: la puntuación DI 0.3 de KnowLine es una auto-ejecución con el kit oficial, mientras que las del resto de modelos proceden del board. La comparación de licencias, contexto y disponibilidad de los modelos alternativos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es una redistribución de pesos, no un modelo entrenado por su autor en Hugging Face; el crédito y la licencia corresponden a PelaAI y al modelo base Qwen3.5-0.8B.
- El modelo no genera texto libre al responder: solo produce distribuciones sobre las opciones suministradas. No es adecuado para tareas generativas abiertas.
- La plantilla de chat del repositorio activa el modo thinking por defecto; si se construyen prompts manualmente hay que pasar `enable_thinking=False` para replicar el comportamiento evaluado.
- La temperatura de calibración está plegada en los pesos y depende de `temperatures.json` para las preguntas de puntuación; un despliegue que omita ese archivo alterará la lectura de las puntuaciones.
- El ECE de 0,008-0,012 corresponde a la suite pública del board; no hay garantía de calibración en dominios distintos a los de entrenamiento.
- Los datos de entrenamiento no se distribuyen y su composición exacta no se detalla más allá de que incluye tareas de decisión etiquetadas por profesores LLM, lo que dificulta auditar sesgos.
- No hay información sobre sesgos conocidos, idiomas soportados ni rendimiento fuera de los benchmarks reportados (C-Eval, JevBench, S1MB y Decision Index).
- La torre de visión procede del modelo base y no recibió entrenamiento con imágenes, por lo que su comportamiento multimodal no está validado para tareas de decisión.
- Licencia apache-2.0, que permite uso comercial, pero debe verificarse también la licencia del modelo base Qwen3.5-0.8B para el despliegue combinado.
- Las mediciones de latencia se hicieron en H20, no en el hardware de referencia del board; los tiempos en otras GPU pueden diferir.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (13 de noviembre de 2026), por lo que carece de validación independiente.

## Enlaces

- Repositorio analizado: https://huggingface.co/tk0331/zils-d3-lite-body-3
- Modelo original: https://huggingface.co/PelaAI/KnowLine-0.8B-Gen1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo relacionado: https://huggingface.co/PelaAI/KnowLine-2B-Gen1
- Modelo relacionado: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- Modelo relacionado: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Board de comparación: https://huggingface.co/multimodalart/jev-decision-index
- Notas de inferencia: `INFERENCE.md` en el repositorio original (no se proporciona URL directa)
- Calibración: `CALIBRATION.json` en el repositorio original (no se proporciona URL directa)
