# spybyscript/gliner25-decide-litert

## Resumen

GLiNER2.5-Decide — LiteRT es una conversión on-device del modelo GLiNER2.5-Decide de Fastino, empaquetada como archivos `.tflite` para el runtime LiteRT de Android. El modelo original es un encoder de clasificación de texto basado en GLiNER2, orientado a tareas de clasificación zero-shot y few-shot con etiquetas descritas en lenguaje natural (single-label y multi-label, varias tareas en una misma llamada). Esta conversión preserva únicamente el encoder y la cabeza de clasificación, descartando las cabezas de extracción de spans del checkpoint original.

El interés de esta ficha reside en que demuestra un patrón de despliegue de modelos transformer de aproximadamente 514 millones de parámetros en dispositivos móviles, con cuantización selectiva de pesos a float16, tablas de embeddings separadas y firmas estáticas que comparten pesos entre longitudes de entrada. La validación reportada por el autor cubre 2.338 decisiones de clasificación sobre un corpus sintético en inglés, con métricas de acuerdo de etiqueta y deriva de probabilidad frente a la librería `gliner2` 2.0.0.

No obstante, conviene subrayar que se trata de una conversión de inferencia, no de un modelo entrenado desde cero: los pesos no se reentrenan ni se podan, solo cambia su precisión de almacenamiento y cómputo. El repositorio tiene 8,7 GB de tamaño total y cero descargas en el momento de redactar esta ficha, lo que lo sitúa como un artefacto técnico de nicho más que como un modelo de uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base GLiNER2) con cabeza de clasificación; exportado a LiteRT/TFLite |
| Parametros totales | no disponible (el checkpoint base GLiNER2.5-Decide no declara el recuento en la información proporcionada; la tabla de embeddings es de 128.011 × 1.024) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por petición (prompts de tarea, etiquetas y texto combinados); peticiones mayores se rechazan, no se truncan |
| Tipos de cuantizacion | Pesos FULLY_CONNECTED en float16 tras DEQUANTIZE (FLOAT_CASTING de ai-edge-quantizer); activaciones FP32; variante `fp16hw` con grafo adaptado a hardware FP16 (pre-escalado potencia de dos en LayerNorm, primera FFN partida en dos mitades); embeddings en float16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tflite` (LiteRT) + `gliner25_decide_embeddings_f16.bin` (float16, little-endian, row-major) + `tokenizer.json` + `config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es GLiNER2.5-Decide de Fastino, un encoder transformer con cabezas específicas de GLiNER2. La conversión a LiteRT exporta exclusivamente el encoder y la cabeza de clasificación, de modo que el artefacto resultante implementa la ruta de `classify_text` de la librería `gliner2`: tareas single-label y multi-label, etiquetas con descripciones y múltiples tareas en una sola llamada. Las cabezas de extracción (`span_rep`, `count_pred`, `count_embed`), que dan servicio a `extract_entities`, `extract_json` y `extract_relations`, no se incluyen en este port.

Técnicamente, cada variante `.tflite` contiene cuatro firmas (`s128`, `s160`, `s256`, `s512`) que comparten un único conjunto de pesos, lo que reduce el tamaño aproximadamente a la mitad frente a un archivo por longitud. Los pesos de las capas FULLY_CONNECTED se almacenan en float16 detrás de una operación DEQUANTIZE, mientras que las activaciones, las tablas de posición relativa, las normas y los sesgos permanecen en FP32. La variante `fp16hw` aplica además un pre-escalado potencia de dos en LayerNorm (`x*2^-k`, `eps*4^-k`, con `k` derivado de los rangos FP32 del corpus) y divide la primera capa FULLY_CONNECTED de la feed-forward en dos mitades para adaptarse al hardware FP16. La tabla de embeddings (128.011 × 1.024 en float16) se distribuye como archivo binario aparte que el host mapea en memoria y convierte a float32 antes de alimentar `inputs_embeds`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el checkpoint base. El autor indica explícitamente que en esta conversión no se reentrena ni se poda nada: solo cambian la precisión de almacenamiento y de cómputo.

## Capacidades

- Clasificación de texto zero-shot y few-shot mediante etiquetas descritas en lenguaje natural.
- Tareas single-label y multi-label en la misma arquitectura.
- Ejecución de varias tareas de clasificación en una sola llamada al modelo.
- Soporte de etiquetas con descripciones textuales, lo que permite desambiguar categorías sin reentrenamiento.
- Inferencia on-device en Android mediante LiteRT, con rutas de CPU (XNNPACK) y GPU (ML Drift sobre OpenCL).
- Ejecución en NPU Qualcomm: el autor menciona archivos para NPU Qualcomm en la descripción del repositorio, aunque sin detallar métricas en la información disponible.
- Procesamiento de hasta 512 tokens por petición, con rechazo explícito de entradas mayores en lugar de truncado silencioso.
- No soporta extracción de entidades, JSON estructurado ni relaciones: esas rutas requieren el port `spybyscript/gliner25-base-litert`.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Moderación de contenido en aplicaciones móviles: el modelo clasifica mensajes o comentarios en categorías definidas en tiempo de ejecución (por ejemplo, "spam", "discurso de odio", "consulta legítima") sin enviar el texto a un servidor, lo que reduce latencia y cumple requisitos de privacidad. La ventana de 512 tokens cubre la mayoría de mensajes conversacionales cortos.
- Enrutamiento de intenciones en asistentes de voz o chat: con varias tareas en una sola llamada, se pueden evaluar simultáneamente intención, urgencia y dominio, y despachar la petición al backend adecuado. Los tiempos medidos en un Snapdragon 8 Elite Gen 5 (62 ms en `s128` con GPU FP16) son compatibles con interacción conversacional.
- Clasificación de tickets de soporte en el dispositivo: etiquetado multi-label de incidencias (facturación, técnico, cuenta) con etiquetas descritas por el equipo de producto, sin necesidad de reentrenar al añadir una categoría nueva.
- Filtrado previo en pipelines de datos: descarte o marcado de registros en el propio terminal antes de subirlos a la nube, usando la variante de CPU con caché de pesos XNNPACK (consumo de RAM de 0,4–0,5 GB más páginas de archivo descartables).
- Análisis de sentimiento y temática en encuestas o formularios offline: la clasificación multi-label permite asignar varios temas por respuesta y funciona sin conectividad, adecuado para aplicaciones de campo.
- Prototipado de clasificadores específicos de dominio sin infraestructura: al ser zero-shot con descripciones, un equipo puede validar un caso de uso en un dispositivo Android de referencia antes de invertir en un modelo entrenado a medida.
- Evaluación comparativa de precisión on-device frente a servidor: útil para equipos que necesitan decidir si merece la pena mantener inferencia remota para tareas de clasificación sensible a latencia.

## Benchmarks y rendimiento

Los datos disponibles son de validación de la conversión, no de rendimiento del modelo frente a otros modelos en benchmarks estándar (MMLU, GLUE, etc.). Se presentan a continuación las métricas de acuerdo con la librería `gliner2` 2.0.0 sobre 2.338 decisiones (616 llamadas) de un corpus sintético en inglés, medidas en un Mac arm64 (Apple M5 Max) con ai-edge-litert 2.2.0.

| Variante | Runtime | Etiquetas iguales a la librería | Deriva máx. de probabilidad | ms p50 por bucket (128 / 160 / 512) | Puerta |
|---|---|---|---|---|---|
| `wfp16` | CPU (XNNPACK, 4 hilos) | 2338/2338 (100,00 %) | 0,00032 | 58,3 / 68,1 / 248,6 | pasa |
| `wfp16` | GPU Mac (Metal, ML Drift), FP32 | 2338/2338 (100,00 %) | 0,00032 | 21,0 / 23,8 / 76,1 | pasa |
| `wfp16` | GPU Mac (Metal, ML Drift), FP16 por defecto | 2226/2338 (95,21 %) | 0,30555 | 16,3 / 20,5 / 49,6 | falla |
| `fp16hw` | CPU (XNNPACK, 4 hilos) | 2338/2338 (100,00 %) | 0,00032 | 60,2 / 70,5 / 255,1 | pasa |
| `fp16hw` | GPU Mac (Metal, ML Drift), FP32 | 2338/2338 (100,00 %) | 0,00032 | 22,1 / 25,7 / 79,8 | pasa |
| `fp16hw` | GPU Mac (Metal, ML Drift), FP16 por defecto | 2332/2338 (99,74 %) | 0,01158 | 16,6 / 22,1 / 50,7 | pasa |

Mediciones en teléfono (Galaxy Z Fold 8, Snapdragon 8 Elite Gen 5, Adreno 840, Android 17, LiteRT 2.2.0), una petición por firma, en caliente:

| Configuración | s128 | s160 | s512 | RAM | Etiquetas correctas |
|---|---|---|---|---|---|
| `fp16hw`, GPU FP16 | 62 ms | 81 ms | 439 ms | ~1,0 GB | 9/9 |
| `fp16hw`, GPU FP16 con acumulación FP32 | 80 ms | 99 ms | 496 ms | ~1,05 GB | 9/9 |
| `wfp16`, GPU FP32 | 136 ms | 173 ms | 758 ms | ~1,9 GB | 9/9 |
| `wfp16`, CPU (4 hilos, caché XNNPACK) | 120 ms | 155 ms | 972 ms | ~0,4–0,5 GB + páginas descartables | 9/9 |

La puerta de aceptación definida por el autor exige un acuerdo de etiqueta ≥ 95 % y una deriva máxima de probabilidad ≤ 0,05. El archivo `validation.json` del repositorio contiene todos los números.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,0 GB en GPU para `fp16hw` y 1,9 GB para `wfp16`; en CPU, 0,4–0,5 GB más páginas de archivo descartables con caché de pesos XNNPACK.
- GPU recomendadas: Adreno 840 (Snapdragon 8 Elite Gen 5) validada en teléfono; en escritorio, GPU Apple vía Metal/ML Drift para validación. No se han publicado mediciones en A100, H100 ni RTX 4090, y por el perfil del artefacto (LiteRT, Android) no son el objetivo.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la GPU integrada de un smartphone de gama alta; no hay datos para GPUs de escritorio.
- Opciones de despliegue: LiteRT `CompiledModel` en Android (GPU con ML Drift sobre OpenCL, o CPU con XNNPACK). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 62–136 ms por petición en `s128` y 439–972 ms en `s512` según configuración, medidos en el dispositivo citado. El teléfono se estrangula térmicamente en minutos de ejecución continua, según el autor.
- Ajustes críticos: activar compartición de tensores constantes en GPU (sin ella, cada firma mantiene su copia de pesos: 5,3 GB de memoria gráfica frente a 1,9 GB); fijar explícitamente la precisión FP32 en GPU para `wfp16`; en CPU, configurar la ruta de caché de pesos de XNNPACK para evitar empaquetados duplicados por firma; usar prioridad GPU baja en aplicaciones con renderizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| spybyscript/gliner25-decide-litert | no disponible | 512 tokens | Clasificación zero-shot (sin extracción) | Apache-2.0 | LiteRT/TFLite, Android |
| fastino/GLiNER2.5-Decide | no disponible | dinámico | Clasificación + extracción de entidades, JSON y relaciones | Apache-2.0 | safetensors vía librería `gliner2` |
| spybyscript/gliner25-base-litert | no disponible | no disponible | Extracción de spans en LiteRT | Apache-2.0 (presumible, no confirmado en la información) | LiteRT/TFLite, Android |

La comparación con modelos de la misma categoría (clasificadores zero-shot tipo GLiNER) no puede completarse con datos de benchmarks porque no se han publicado resultados comparativos en la información disponible. La diferencia funcional clave frente al checkpoint base es la ausencia de cabezas de extracción; frente al port `base`, la especialización en clasificación.

## Limitaciones y advertencias

- No realiza extracción de entidades, JSON estructurado ni relaciones; para esas tareas debe usarse el port `gliner25-base-litert` o el checkpoint original.
- Límite estricto de 512 tokens por petición, contando prompts de tarea, etiquetas y texto; las peticiones mayores se rechazan en lugar de truncarse, lo que exige dividir el texto o repartir tareas en varias llamadas.
- Solo inglés; no hay soporte multilingüe declarado.
- La validación se hizo sobre un corpus sintético de enunciados conversacionales cortos, no sobre datos reales de producción; el acuerdo del 100 % con la librería no garantiza precisión absoluta del modelo, solo equivalencia con la referencia.
- En GPU con precisión FP16 por defecto, la variante `wfp16` baja al 95,21 % de acuerdo y una deriva de 0,306, incumpliendo la puerta; es obligatorio fijar FP32 en esa configuración.
- El modelo puede heredar sesgos del checkpoint base GLiNER2.5-Decide; no se documentan evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación de etiquetas en el sentido de asignar categorías con confianza alta a textos ambiguos o fuera de dominio; conviene calibrar umbrales por caso de uso.
- Las mediciones en teléfono corresponden a un único dispositivo de gama alta y a ejecuciones en caliente con el teléfono descansado; el rendimiento decae por estrangulamiento térmico en ejecuciones continuas.
- El repositorio tiene 8,7 GB y cero descargas, sin pipeline declarado ni resultados de benchmarks estándar; la madurez de mantenimiento es baja.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de un modelo de Fastino conviene verificar las condiciones del checkpoint base y de los datos de entrenamiento originales, no detalladas aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/spybyscript/gliner25-decide-litert
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Port de extracción en LiteRT: https://huggingface.co/spybyscript/gliner25-base-litert
