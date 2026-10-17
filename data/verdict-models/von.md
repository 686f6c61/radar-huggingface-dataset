# verdict-models/von

## Resumen

Von (Verdict-ready) es un paquete de despliegue publicado por verdict-models que contiene el modelo de decisión Von del autor original wfzyx, exportado a ONNX en fp32 y empaquetado para el motor de servicio Verdict. El modelo subyacente es una instancia de ModernBERT-large con 395 millones de parámetros, orientada al inglés y con una ventana de contexto de 8192 tokens. Se clasifica como modelo de decisión "System One", esto es, pensado para producir decisiones o clasificaciones rápidas en lugar de generación libre de texto.

El repositorio no aporta pesos nuevos: los pesos son idénticos a los de wfzyx/von y lo único que añade es la exportación ONNX y el manifiesto de servicio (`model.json`). Se distribuye bajo licencia Apache-2.0 y está pensado para servirse con un único comando mediante las imágenes Docker `sgyaqing/verdict:0.2.0-cpu` o `sgyaqing/verdict:0.2.0-cuda`, con soporte para CPU y GPU.

Su relevancia actual radica en el rendimiento de servicio: frente al servidor de referencia del autor (`von serve`, von-sdk, `--no-chains`), el paquete Verdict alcanza hasta 66,1× más throughput y reduce la latencia P50/P99 de forma sustancial en pruebas end-to-end sobre HTTP en una RTX 4090, manteniendo paridad de logits con el modelo oficial. El pipeline declarado en el hub es `zero-shot-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) |
| Parametros totales | 395 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | fp32 (exportación ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (según el modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX fp32 con pesos externos (`von.onnx` + `von.onnx.data`) |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT-large, un encoder transformer con 395 millones de parámetros y una ventana de contexto de 8192 tokens. Este repositorio concreto no entrena ni modifica el modelo: exporta los pesos de `wfzyx/von` a ONNX en fp32 con pesos externos y añade un manifiesto de servicio (`model.json`) que define el fichero de grafo, los presupuestos, la receta de familia (`independent_options`) y el mapa de calibración. El tokenizador se incluye en `tokenizer/tokenizer.json` junto con `tokenizer_config.json`.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO para el modelo base. Tampoco se detallan innovaciones de entrenamiento específicas. La única garantía técnica declarada es de fidelidad: los pesos no cambian respecto a `wfzyx/von` y la conversión se verifica contra el modelo oficial (von-sdk 1.3.7) con respuestas idénticas en CPU (corpus dorado de 29 casos, paridad de logits ≤ 4,6e-5) y en CUDA (RTX 4090, paridad de logits ≤ 7,4e-5, invariancia de lote bit a bit).

## Capacidades

- Clasificación zero-shot: el pipeline declarado es `zero-shot-classification`, de modo que el modelo está orientado a asignar etiquetas o decisiones a partir de opciones proporcionadas.
- Protocolos de decisión nativos: expone `POST /v1/systemone` y `POST /v1/decisions` para el flujo de decisión System One.
- Endpoints de elección y puntuación: `POST /v1/choice`, `POST /v1/score` y `POST /v1/noul`.
- Capa compatible con OpenAI: `POST /v1/chat/completions` y `GET /v1/models`.
- Funcionamiento monolingüe en inglés según el modelo base.
- No se documentan capacidades de generación libre, visión, audio ni entrenamiento específico para tool calling o agentes multi-paso.

## Casos de uso

- Clasificación zero-shot de textos en pipelines de datos: el modelo permite etiquetar documentos con categorías definidas en tiempo de inferencia sin reentrenamiento, aprovechando su ventana de 8192 tokens para entradas largas.
- Enrutamiento de decisiones en sistemas de agentes: al estar etiquetado como modelo "System One", encaja como capa de decisión rápida que selecciona una opción entre varias antes de invocar componentes más costosos.
- Triaje de tickets de soporte: la clasificación zero-shot permite asignar cada incidencia a un equipo o prioridad a partir de etiquetas predefinidas en inglés.
- Moderación y etiquetado de contenido: uso de `POST /v1/choice` o `/v1/score` para puntuar y decidir sobre categorías discretas en flujos de revisión.
- Puntuación y ranking de opciones: los endpoints nativos de puntuación permiten ordenar alternativas según la probabilidad asignada por el modelo, útil en selección de respuestas o reordenación de resultados.
- Servicio de alta concurrencia detrás de una API compatible con OpenAI: el paquete Verdict alcanza 1476,1 rps a concurrencia 64 en la máquina medida, lo que permite integrarlo en servicios que ya consumen el esquema `/v1/chat/completions`.
- Despliegue en entornos sin GPU: la imagen `0.2.0-cpu` permite servir el modelo en hosts de CPU, con paridad de respuestas verificada respecto al modelo oficial.
- Pruebas de integración ligera: al ser un modelo de 395 millones de parámetros en fp32, es viable levantarlo en un contenedor local para validar flujos de decisión antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se aporta es una comparativa de rendimiento de servicio end-to-end sobre HTTP, medida en una RTX 4090 con AMD EPYC 7543 a 16 hilos, usando `oha` y un cuerpo de petición idéntico para ambos servidores. La columna base es el servidor del autor del modelo (`von serve`, von-sdk, `--no-chains`); la columna Verdict es este paquete. Las latencias son P50 / P99 por petición.

| concurrencia | rps Verdict | P50 / P99 Verdict | rps `von` | P50 / P99 `von` | ratio rps | ratio P50 / P99 |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 113,8 | 8,61 / 11,98 ms | 46,4 | 22,89 / 28,46 ms | 2,45× | 2,66 / 2,38× |
| 8 | 536,4 | 14,86 / 16,61 ms | 31,2 | 250,91 / 435,99 ms | 17,2× | 16,9 / 26,2× |
| 64 | 1476,1 | 42,58 / 53,24 ms | 22,3 | 2848,80 / 3333,40 ms | 66,1× | 66,9 / 62,6× |

En la tabla, un ratio superior a 1× indica que Verdict va por delante (ratio de throughput = Verdict ÷ base; ratio de latencia = base ÷ Verdict).

## Requisitos de hardware

- Pesos en fp32: con 395 millones de parámetros, el grafo ONNX ocupa aproximadamente 1,6 GB (coincide con el tamaño del repositorio).
- VRAM estimada para inferencia en GPU: en torno a 2-3 GB contando pesos y sobrecarga de activaciones; cifra estimada, no publicada en la información disponible.
- GPU: en las pruebas se emplea una RTX 4090. Al ser un modelo de menos de 400 millones de parámetros, cabe holgadamente en GPU de consumo (RTX 30/40, entre otras).
- CPU: soportada de forma nativa mediante la imagen `sgyaqing/verdict:0.2.0-cpu`.
- Opciones de despliegue: motor Verdict a través de Docker (`sgyaqing/verdict:0.2.0-cpu` y `sgyaqing/verdict:0.2.0-cuda`), con montaje de cachés de Hugging Face y Verdict para evitar redescargas. Compatible con ModelScope (`-e VERDICT_USE_MODELSCOPE=1`, modelo `sgyaqing/von`) y con espejos del hub (`-e HF_ENDPOINT=https://hf-mirror.com`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos (RTX 4090, EPYC 7543, 16 hilos): 113,8 rps con P50 de 8,61 ms a concurrencia 1; 536,4 rps con P50 de 14,86 ms a concurrencia 8; 1476,1 rps con P50 de 42,58 ms a concurrencia 64.

## Comparativa con modelos similares

No se documentan en la información disponible otros modelos comparables de la misma categoría (modelos de decisión System One). La única comparación con datos es entre el paquete Verdict y el servidor de referencia del mismo modelo base. Se resume a continuación.

| Modelo / despliegue | Parametros | Contexto | Rendimiento de servicio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| verdict-models/von (paquete Verdict) | 395 M | 8192 tokens | 113,8 rps (c=1), 1476,1 rps (c=64) | Apache-2.0 | Hugging Face, Docker CPU/CUDA |
| wfzyx/von servido con `von serve` | 395 M | 8192 tokens | 46,4 rps (c=1), 22,3 rps (c=64) | Apache-2.0 | Repositorio del autor original |

Los pesos son compartidos entre ambas filas; la diferencia medida es exclusivamente de motor de servicio. No hay comparativas con otras arquitecturas de decisión o clasificación en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo base es monolingüe en inglés; no se documenta soporte multilingüe.
- Naturaleza del modelo: es un modelo de decisión / clasificación zero-shot, no un modelo generativo general; no debe esperarse generación libre de texto de alta calidad.
- Datos públicos mínimos: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación de la comunidad sobre su comportamiento en producción.
- Riesgo de calibración y sesgo: no se aportan datos sobre sesgos, calibración de probabilidades ni evaluación de robustez; en tareas de decisión esto puede traducirse en umbrales poco fiables.
- Dependencia del motor: para servirse requiere el motor Verdict o la SDK oficial (`von-sdk`); no se documentan rutas alternativas de despliegue.
- Trazabilidad: el paquete reempaqueta pesos de terceros; el crédito del modelo corresponde al autor original y cualquier duda sobre entrenamiento debe dirigirse a `wfzyx/von`.
- Licencia: Apache-2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos subyacentes, no detalladas aquí.
- Fechas del repositorio: creado y actualizado el 2026-10-17 según los metadatos del hub; no se documenta historial de versiones ni cambios posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/verdict-models/von
- Modelo base original: https://huggingface.co/wfzyx/von
- Motor de servicio Verdict: https://github.com/sgyaqing/verdict
- Herramienta de benchmarking empleada: https://github.com/hatoo/oha
- Copia en ModelScope: `sgyaqing/von` (según la model card)

Nota: la búsqueda web realizada devolvió únicamente definiciones de diccionario del término "verdict" (Larousse, Le Robert, Wikipedia, Cambridge Dictionary), sin relación técnica con este modelo, por lo que no se incluyen.
