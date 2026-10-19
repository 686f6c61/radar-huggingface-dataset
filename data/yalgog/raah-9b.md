# YAlgoG/raah-9b

## Resumen

Raah-9B es un adaptador de clasificación de imagen publicado por Yashaswi Galhotra (YAlgoG) que responde a una pregunta muy concreta: dada una foto de una carretera india, ¿qué probabilidad hay de cada tipo de daño? No genera texto ni descripciones; devuelve, en un solo forward pass, cuatro probabilidades calibradas correspondientes a bache (D40), grieta longitudinal (D00), grieta transversal (D10) y grieta de fatiga o *alligator cracking* (D20).

El modelo es un fine-tune con LoRA de rango 16 sobre Cloudflare/clef-flash —un modelo multimodal construido sobre Qwen3.5-9B con una cabeza de decisión conjunta, 9,4B de parámetros en total—, con el encoder de visión congelado. Se entrenó sobre RDD2022 India, BharatPotHole y fotos de baches en primer plano, y el repositorio solo contiene los pesos del adaptador (0,7 GB en safetensors), no el modelo base completo.

Su relevancia está en el enfoque: en lugar de competir en un benchmark generalista, el autor lo evalúa contra GPT-6 Luna, OneJev 1.6 27B, Clef-Flash y gpt-5-mini sobre 1.160 fotos de dashcam de Delhi, Gurugram y Haryana que el modelo nunca vio, y publica resultados por clase con umbrales congelados en validación. En baches alcanza F1 0,693 y *average precision* 0,790, frente a 0,533 y 0,588 de su modelo base, con una mejora de recall de 47,2% a 71,6%. Es un artefacto de nicho, con 0 descargas y 2 likes en el momento de la consulta, pero con una documentación de evaluación inusualmente detallada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-9B) con adaptadores LoRA r16 y cabeza de decisión conjunta; encoder de visión congelado |
| Parámetros totales | 9,4B (modelo base + adaptadores + cabeza) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo distribuye adaptadores PEFT en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA, 0,7 GB); requiere cargar Cloudflare/clef-flash por separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es Clef-Flash, descrito por el autor como Qwen3.5-9B más un adaptador LoRA de rango 16 y una cabeza de decisión conjunta, sumando 9,4B de parámetros. Raah-9B añade su propio entrenamiento sobre esa base manteniendo el encoder de visión congelado, de modo que la adaptación se produce en la torre de lenguaje y en la cabeza que produce las cuatro probabilidades. La salida es discriminativa, no generativa: cuatro preguntas binarias resueltas en una única pasada forward, sin decodificación autoregresiva.

Los datos de entrenamiento citados son RDD2022 India, BharatPotHole y fotografías de baches en primer plano. La model card no indica el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La innovación destacable no está en la arquitectura sino en la calibración y la evaluación: los umbrales de decisión se congelan sobre un conjunto de validación (0,3143 para bache en Raah, frente a 0,2004 en GPT-6 Luna, 0,2567 en Clef-Flash y 0,3005 en OneJev) y el conjunto de test son 1.160 fotos de dashcam de Delhi, Gurugram y Haryana (Arya et al., 2024) nunca vistas durante el entrenamiento, de las cuales 229 están etiquetadas como bache.

## Capacidades

- Clasificación de daño viario en cuatro clases con salida probabilística calibrada: bache (D40), grieta longitudinal (D00), grieta transversal (D10) y grieta de fatiga (D20).
- Una sola pasada forward por imagen para las cuatro preguntas, sin generación de texto ni decodificación autoregresiva.
- Calibración de umbrales: las probabilidades permiten aplicar puntos de corte ajustados a validación y derivar una decisión agregada de "foto dañada" (bache ≥ 0,3143 o cualquier otra pregunta ≥ 0,5).
- Capacidad de ordenar por riesgo: al devolver probabilidad continua y no solo etiqueta, permite priorizar inspecciones.
- No genera *captions* ni descripciones textuales; no hay soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- Monolingüe: únicamente inglés.
- No se documentan capacidades de audio, vídeo ni de imágenes múltiples por llamada.

## Casos de uso

- **Inventario y priorización de baches en flotas de inspección**: procesar lotes de fotos de dashcam y ordenar los tramos por probabilidad de bache. El modelo devuelve un valor continuo en una sola pasada, lo que abarata el barrido de miles de imágenes frente a un modelo generativo que habría que prompting foto a foto.
- **Triaje y derivación a revisión humana**: fijar el umbral de 0,3143 (o recalibrarlo) y enviar a un operario solo las fotos en la franja de incertidumbre. El autor menciona explícitamente este uso de umbrales para "pasar" los casos confiados, aunque el detalle completo de esa sección no está recogido en la información disponible.
- **Mantenimiento preventivo con grietas de fatiga**: la clase *alligator cracking* es donde el modelo muestra la mayor ventaja (accuracy 90,8%, F1 0,764, AP 0,871 frente a 0,625 de OneJev y 0,453 de GPT-6 Luna), lo que lo hace adecuado para detectar deterioro estructural antes de que aparezca el bache.
- **Despliegue local en vehículo o unidad móvil**: el adaptador pesa 0,7 GB y se ejecuta sobre el modelo base en GPU propia, sin coste por llamada ni envío de imágenes a un tercero; relevante cuando las fotos contienen datos de localización sensibles.
- **Auditoría de proveedores de visión**: sirve como referencia reproducible y versionada (una versión dada del adaptador no cambia) frente a APIs propietarias cuyas salidas evolucionan con el tiempo. El propio autor usa este argumento frente a GPT-6 Luna y gpt-5-mini.
- **Pre-anotación de datasets de daño viario**: usar las probabilidades como *prior* para etiquetado asistido y reservar la revisión humana a los casos dudosos, reduciendo el coste de construir nuevos conjuntos etiquetados.
- **Seguimiento temporal de un mismo tramo**: repetir la captura en distintas fechas y comparar probabilidades por clase para detectar progresión del deterioro en lugar de una etiqueta binaria puntual.

## Benchmarks y rendimiento

Evaluación sobre 1.160 fotos de dashcam de RDD2022 India (Delhi, Gurugram, Haryana), no vistas en entrenamiento, con 229 baches etiquetados. Umbrales congelados en validación. El autor advierte de que un modelo que nunca dice "bache" obtiene 80,3% de accuracy en este conjunto, por lo que la accuracy aislada es engañosa.

Clase bache (229 positivos de 1.160):

| Modelo | Accuracy | Precision | Recall | F1 | Average precision |
|---|---:|---:|---:|---:|---:|
| Raah-9B | 87,5% | 67,2% | 71,6% | 0,693 | 0,790 |
| GPT-6 Luna | 84,7% | 63,0% | 55,0% | 0,587 | 0,575 |
| Clef-Flash (base) | 83,7% | 61,4% | 47,2% | 0,533 | 0,588 |
| OneJev 1.6 27B | 81,6% | 54,2% | 45,0% | 0,492 | 0,533 |
| gpt-5-mini | 82,2% | 66,2% | 19,7% | 0,303 | no aplica (devuelve etiqueta) |

Detección absoluta: Raah encuentra 164 de los 229 baches; GPT-6 Luna 126, Clef-Flash 108, OneJev 103 y gpt-5-mini 45.

Grieta de fatiga (*alligator cracking*), 261 fotos:

| Modelo | Accuracy | Precision | Recall | F1 | Average precision |
|---|---:|---:|---:|---:|---:|
| Raah-9B | 90,8% | 90,1% | 66,3% | 0,764 | 0,871 |
| OneJev 1.6 27B | 80,9% | 95,5% | 16,1% | 0,275 | 0,625 |
| GPT-6 Luna | 78,8% | 100% | 5,7% | 0,109 | 0,453 |
| Clef-Flash | 78,7% | 100% | 5,4% | 0,102 | 0,516 |

Grietas longitudinales, 166 fotos:

| Modelo | Accuracy | Precision | Recall | F1 | Average precision |
|---|---:|---:|---:|---:|---:|
| Raah-9B | 88,7% | 80,7% | 27,7% | 0,413 | 0,585 |
| OneJev 1.6 27B | 82,8% | 41,5% | 50,0% | 0,454 | 0,493 |
| Clef-Flash | 86,9% | 76,9% | 12,0% | 0,208 | 0,429 |
| GPT-6 Luna | 86,1% | 53,3% | 24,1% | 0,332 | 0,374 |

Grietas transversales: solo 9 fotos positivas de 1.160. Average precision de 0,047 para Raah y OneJev, 0,027 para Clef-Flash y 0,020 para GPT-6 Luna. Ningún modelo detecta esta clase; la accuracy cercana al 99% es un artefacto del desbalanceo.

Decisión agregada de "foto dañada" (cualquiera de las cuatro etiquetas): Raah alcanza accuracy 83,1% y F1 0,779; la decisión "damaged" de gpt-5-mini, 72,6% y 0,655. De los 229 baches, gpt-5-mini etiquetó 45 como cavidad de bache, 151 como rotura superficial y 202 como dañadas; Raah reclasifica 114 de esas 151 como bache.

## Requisitos de hardware

- **VRAM estimada** (no publicada por el autor; calculada a partir de los 9,4B de parámetros): ~19-20 GB en fp16 para los pesos, más encoder de visión y activaciones, en torno a 22-26 GB en la práctica; ~10-12 GB en int8; ~6-8 GB en 4-bit.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S 48 GB para fp16 sin compromisos. En 24 GB (RTX 3090, RTX 4090) fp16 queda justo y conviene cuantizar.
- **Consumer GPU**: sí, en cuantización de 8 o 4 bits cabe en RTX 4080/4090 (16-24 GB) y en RTX 4060 Ti 16 GB; en 8 GB no es viable sin cuantización agresiva.
- **Despliegue**: la vía documentada es transformers + PEFT cargando Cloudflare/clef-flash y el adaptador con las instrucciones específicas del autor. El ejemplo genérico `AutoModel` + `PeftModel` **no** carga la cabeza de decisión ni la calibración. No se documentan soportes de vLLM, TGI, llama.cpp, Ollama ni versiones GGUF.
- **Latencia y throughput**: no disponibles. Cualitativamente, al resolver cuatro preguntas en un único forward pass sin generación autoregresiva, el coste por imagen es mucho menor que el de un modelo generativo consultado con prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | F1 bache | AP bache |
|---|---|---|---|---|---|---|
| Raah-9B | 9,4B | no disponible | CC BY-SA 4.0 | Abierto, adaptador en HF | 0,693 | 0,790 |
| Clef-Flash (base) | 9B (Qwen3.5-9B) | no disponible | no indicada en la información | Abierto en HF | 0,533 | 0,588 |
| OneJev 1.6 27B | 27B | no disponible | no disponible | Ejecutado en local por el autor | 0,492 | 0,533 |
| GPT-6 Luna | no disponible | no disponible | Propietaria | API de OpenAI, facturación por llamada | 0,587 | 0,575 |
| gpt-5-mini | no disponible | no disponible | Propietaria | API de OpenAI; modelo en producción de Pothole Reporter | 0,303 | no aplica |

Frente a su modelo base, la mejora se concentra en recall (47,2% → 71,6%) y *average precision* (0,588 → 0,790), con un aumento moderado de precision (61,4% → 67,2%). Frente a OneJev 1.6 27B, Raah gana en baches y grietas de fatiga, pero pierde en F1 de grietas longitudinales con umbral 0,5 (0,413 frente a 0,454) porque OneJev dice "sí" con más frecuencia; la *average precision* de Raah en esa clase sigue siendo superior (0,585 frente a 0,493). Gemini y Claude no fueron evaluados.

## Limitaciones y advertencias

- **Alcance cerrado**: solo responde cuatro preguntas sobre daño viario. No describe la imagen, no cuenta baches, no localiza objetos ni responde a otras consultas.
- **Grietas transversales sin resolver**: con 9 fotos positivas y AP de 0,047, ningún modelo evaluado detecta esta clase. No debe desplegarse para esa tarea.
- **Recall moderado en grietas longitudinales**: 27,7% con umbral 0,5. Si el caso de uso exige no perder grietas, hay que bajar el umbral y asumir más falsos positivos.
- **Sesgo geográfico y de dominio**: entrenado con RDD2022 India, BharatPotHole y fotos de baches en primer plano; evaluado solo en carreteras de Delhi, Gurugram y Haryana. El comportamiento en otras regiones, tipos de firme, climas o con imágenes nocturnas o mojadas no está documentado.
- **Calibración dependiente del conjunto**: los umbrales (0,3143 para bache) se congelaron sobre un conjunto de validación concreto. Cambiar de cámara, de altura de montaje o de resolución puede invalidarlos y exigir recalibración.
- **Accuracy engañosa**: un clasificador trivial que nunca predice bache logra 80,3% en el conjunto de test. Cualquier evaluación debe mirar precision, recall y AP, no accuracy.
- **Idioma**: solo inglés; no hay evidencia de robustez en otras lenguas.
- **Carga no estándar**: el ejemplo genérico `AutoModel` + `PeftModel` no funciona; hay que seguir las instrucciones específicas de Clef para cargar la cabeza de decisión y la calibración. Esto complica la integración en pipelines existentes.
- **Licencia CC BY-SA 4.0**: permite uso comercial, pero impone atribución y *share-alike*, de modo que las obras derivadas deben distribuirse bajo la misma licencia. Conviene revisarlo antes de incorporarlo a un producto propietario.
- **Madurez**: 0 descargas y 2 likes en el momento de la consulta; creado y actualizado el mismo día (19 de octubre de 2026). La validación externa es prácticamente inexistente.
- **Comparaciones con fechas**: los resultados de modelos alojados se obtuvieron el 18 de octubre de 2026 y pueden cambiar; los datos de entrenamiento de GPT-6 Luna y gpt-5-mini no son públicos.
- **Sin afiliación**: el autor declara que Raah-9B no está afiliado ni respaldado por Cloudflare, el equipo de Qwen, OmniJev, OpenAI ni Pothole Reporter.
- **Sin datos de sesgo demográfico o de condiciones adversas**: no se han publicado análisis de rendimiento por hora del día, climatología, iluminación u oclusión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YAlgoG/raah-9b
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Informe completo de evaluación: [`raah-9b-report.pdf`](https://huggingface.co/YAlgoG/raah-9b/blob/main/raah-9b-report.pdf)
- Instrucciones de ejecución de Clef: sección "Running it" de la model card (no reproducida en la información disponible)
- Referencia del conjunto de evaluación: Arya et al., 2024 (RDD2022 India); el enlace no está incluido en la información proporcionada
