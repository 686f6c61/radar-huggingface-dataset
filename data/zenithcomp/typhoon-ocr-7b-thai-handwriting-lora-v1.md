# ZenithComp/typhoon-ocr-7b-thai-handwriting-lora-v1

## Resumen

Typhoon OCR 7B — Thai Handwriting LoRA es un adaptador PEFT/LoRA publicado por ZenithComp sobre el modelo base `typhoon-ai/typhoon-ocr-7b` (que a su vez deriva de `Qwen/Qwen2.5-VL-7B-Instruct`). Su única función es transcribir escritura manuscrita tailandesa a partir de una imagen de documento y devolver el resultado como JSON con una clave `natural_text`. No redistribuye los pesos del modelo base: el repositorio contiene únicamente los pesos del adaptador (0,5 GB), que deben cargarse sobre el modelo base original.

El problema que resuelve es acotado pero real: el OCR de texto impreso en tailandés ya está razonablemente cubierto por el modelo base, mientras que la escritura a mano presenta una variabilidad morfológica mucho mayor. Este adaptador se entrenó y evaluó sobre el conjunto `Thinnaphat/TH-HANDWRITTEN-CPE-OPH2025`, derivado de `iapp/thai_handwriting_dataset`, con un régimen de inferencia fijo: imágenes a 1024 px (`max_pixels=1048576`), decodificación greedy (`do_sample=False`) y `max_new_tokens=512`.

Su relevancia es limitada y muy específica: es un adaptador de investigación con 0 descargas y 0 likes en el momento de la consulta, promovido a la rama `main` desde la rama `phase2-downsample-money-keep25-300steps` tras superar una compuerta de promoción. La propia model card advierte que la evaluación de la que se derivan las métricas no constituye una medida limpia de generalización, ya que los textos de referencia se solapan entre los conjuntos de entrenamiento y de prueba de CPE-OPH.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `typhoon-ai/typhoon-ocr-7b`, modelo multimodal tipo transformer decoder-only con codificador de visión (familia Qwen2.5-VL) |
| Parámetros totales | No disponible para el adaptador; el modelo base es de ~7B parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene únicamente pesos de adaptador en safetensors) |
| Idiomas soportados | Tailandés para la tarea de reconocimiento de escritura manuscrita; el resto de idiomas no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); los pesos del modelo base no se redistribuyen en este repositorio |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 0,5 GB |
| Modelo base | `typhoon-ai/typhoon-ocr-7b` |
| Dataset de entrenamiento | `Thinnaphat/TH-HANDWRITTEN-CPE-OPH2025` (subconjunto de `iapp/thai_handwriting_dataset`, Apache-2.0) |
| Rama de origen | `phase2-downsample-money-keep25-300steps` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo PEFT que se monta sobre `typhoon-ai/typhoon-ocr-7b`, un modelo de la familia Qwen2.5-VL-7B con capacidad de entrada imagen-texto y salida de texto. La tarea se formula como generación condicionada por imagen: se procesa la imagen del documento con el procesador multimodal, se aplica la plantilla de chat y el modelo genera una cadena JSON con la clave `natural_text` que contiene la transcripción. No se dispone de información sobre el rango del LoRA, los módulos objetivo, la tasa de aprendizaje ni el número exacto de pasos más allá del identificador de la rama (`300steps`).

El detalle técnico más relevante es la discrepancia deliberada entre el prompt de entrenamiento y el prompt de producción del paquete `typhoon-ocr`. El adaptador se entrenó con la plantilla de tarea `default` de Typhoon pero con el ancla `RAW_TEXT` vacía y sin inyectar las dimensiones reales de la página. La model card insiste en que se use exactamente ese prompt simplificado: sustituirlo por el prompt completo del paquete (`ocr_document`, que construye el ancla mediante `get_anchor_text` e inserta dimensiones) provocaría un desajuste entre entrenamiento e inferencia. El régimen de evaluación es igualmente cerrado: imágenes a 1024 px, decodificación greedy y 512 tokens nuevos como máximo; cualquier otro régimen queda fuera del alcance evaluado.

## Capacidades

- Reconocimiento de escritura manuscrita en tailandés a partir de imágenes de páginas de documento.
- Salida estructurada garantizada en formato JSON con una única clave `natural_text`.
- Conversión de tablas a formato Markdown dentro de la respuesta textual, según el prompt de entrenamiento.
- Inserción de marcadores de posición del tipo `dummy.png` para imágenes presentes en el documento.
- Procesamiento de imágenes en color (RGB) a una resolución objetivo de 1024 px.
- Formato conversacional (image-text-to-text) compatible con el `apply_chat_template` de la familia Qwen2.5-VL.
- No se ha documentado soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso, visión general, audio ni modo de pensamiento explícito.

## Casos de uso

- Digitalización de formularios manuscritos tailandeses: el adaptador convierte la imagen de una página rellenada a mano en texto plano estructurado, lo que permite volcar el contenido a una base de datos o a un sistema de gestión documental sin transcripción manual.
- Extracción de anotaciones en expedientes académicos: dado que el conjunto de entrenamiento procede de CPE-OPH (documentos manuscritos tailandeses de tipo examen o prueba), encaja en flujos de corrección y archivo de pruebas escritas a mano.
- Indexación y búsqueda sobre archivos escaneados: la salida JSON con `natural_text` es directamente indexable por un motor de búsqueda de texto completo, lo que habilita consultas sobre fondos documentales manuscritos previamente no buscables.
- Preprocesado para pipelines de NLP en tailandés: la transcripción puede alimentar etapas posteriores (clasificación, resumen, traducción) que de otro modo no podrían consumir la imagen original.
- Revisión humana asistida: el JSON estructurado y la tasa de coincidencia exacta reportada permiten usarlo como primera pasada con validación humana posterior, reduciendo el coste de tecleado en lotes grandes de documentos.
- Investigación en OCR de escritura manuscrita: al ser un adaptador LoRA pequeño (0,5 GB) sobre un base de 7B, resulta útil como punto de partida reproducible para experimentos de ajuste fino sobre otros conjuntos de escritura a mano.
- Digitalización de documentación administrativa tailandesa con tablas: la instrucción de convertir tablas a Markdown permite preservar la estructura tabular en la transcripción, algo crítico en formularios y hojas de cálculo manuscritas.
- Prototipado en local con recursos limitados: al tratarse de un adaptador, el coste de almacenamiento y distribución es bajo en comparación con un modelo afinado completo, lo que facilita su despliegue en entornos de prueba.

## Benchmarks y rendimiento

Resultados publicados en la model card para la rama promovida a `main` (`phase2-downsample-money-keep25-300steps`), evaluados sobre las 559 muestras del test completo de CPE-OPH, con imágenes a 1024 px, decodificación greedy y `max_new_tokens=512`.

| Métrica | Línea base de promoción | `main` promovida | Delta | Dirección |
|---|---:|---:|---:|---|
| `valid_json_rate` | 1,0000 | 1,0000 | +0,0000 | mayor es mejor |
| `raw_cer` | 0,1560 | 0,1336 | -0,0224 | menor es mejor |
| `normalized_cer` | 0,1560 | 0,1336 | -0,0224 | menor es mejor |
| `thai_char_accuracy` | 0,8440 | 0,8664 | +0,0224 | mayor es mejor |
| `exact_match_rate` | 0,4204 | 0,4526 | +0,0322 | mayor es mejor |

La línea base de comparación es `phase2-baseline-greedy-res1024`. La model card advierte explícitamente que este resultado de CPE-OPH full-test no constituye una puntuación limpia de generalización, porque los textos de referencia se solapan entre las particiones de entrenamiento y de prueba. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 15-16 GB en BF16/FP16 para el modelo base de 7B más el adaptador; en cuantización de 4 bits se reduciría aproximadamente a 5-6 GB. Estas cifras son estimaciones orientativas derivadas del tamaño del modelo base y no han sido publicadas por el autor.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para inferencia en BF16 sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) también resultan suficientes en BF16.
- GPU de consumo: cabe en tarjetas de gama alta con 24 GB (RTX 4090, RTX 3090). En GPUs de 16 GB o menos sería necesario recurrir a cuantización del modelo base.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` (>=4.49), `peft`, `torch`, `pillow` y `qwen-vl-utils`, con `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la dependencia de una plantilla de prompt exacta complica su integración en servidores de inferencia genéricos.
- Latencia y throughput: no disponibles. El régimen evaluado es greedy con `max_new_tokens=512` sobre imágenes de 1024 px, pero no se publican medidas de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ZenithComp/typhoon-ocr-7b-thai-handwriting-lora-v1` | Adaptador LoRA sobre Qwen2.5-VL-7B | ~7B (base) + adaptador de 0,5 GB | No disponible | CER normalizado 0,1336; exact match 0,4526 en CPE-OPH (559 muestras) | Apache-2.0 | HuggingFace, PEFT |
| `typhoon-ai/typhoon-ocr-7b` | Modelo completo multimodal | ~7B | No disponible | No disponible en la información proporcionada | Apache-2.0 | HuggingFace, paquete `typhoon-ocr` |
| `Qwen/Qwen2.5-VL-7B-Instruct` | Modelo completo multimodal | ~7B | No disponible | No disponible en la información proporcionada | Apache-2.0 (según la cadena de licencias citada) | HuggingFace |

No se dispone de datos de benchmark comparables entre estos tres modelos en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, licencia y disponibilidad. No se han identificado en la búsqueda web alternativas específicas de OCR de escritura manuscrita tailandesa para contrastar.

## Limitaciones y advertencias

- El resultado publicado en la tabla de rendimiento corresponde únicamente a la evaluación de CPE-OPH usada para promover el adaptador a `main`. Las evaluaciones de la fase 3 pertenecen a ramas experimentales y se excluyen deliberadamente.
- La model card advierte que este resultado no establece el rendimiento en formularios documentales completos, maquetaciones complejas, escritores no vistos ni condiciones de captura distintas a las del conjunto de evaluación.
- Existe solapamiento de textos de referencia entre las particiones de entrenamiento y de prueba de CPE-OPH, por lo que la métrica reportada está inflada respecto a una medida limpia de generalización.
- Dependencia crítica del prompt: el adaptador solo funciona correctamente con la plantilla exacta con la que fue entrenado (tarea `default` de Typhoon, ancla `RAW_TEXT` vacía, sin dimensiones de página). Sustituirla por el prompt del paquete `typhoon-ocr` provoca un desajuste entre entrenamiento e inferencia.
- El régimen de inferencia válido está restringido a 1024 px, decodificación greedy y `max_new_tokens=512`; otros regímenes quedan fuera del alcance evaluado.
- Ámbito lingüístico muy estrecho: la tarea es exclusivamente escritura manuscrita tailandesa. No hay información sobre comportamiento en otros idiomas.
- Riesgo de alucinación no cuantificado: aunque `valid_json_rate` es 1,0000 (el modelo siempre produce JSON válido), la tasa de coincidencia exacta es de 0,4526, lo que implica que en más de la mitad de los casos la transcripción contiene algún error a nivel de carácter o de contenido.
- Sesgos conocidos: no disponibles en la información proporcionada. El conjunto de datos procede de un único corpus (CPE-OPH 2025), lo que puede introducir sesgo de dominio hacia ese tipo de documento y de escritura.
- Licencia Apache-2.0, heredada de la cadena `typhoon-ocr-7b` → `Qwen2.5-VL-7B-Instruct`. Los pesos del modelo base no se redistribuyen en este repositorio: es imprescindible descargarlos por separado y respetar su licencia.
- Madurez muy baja para producción: 0 descargas y 0 likes en el momento de la consulta, y el propio autor lo describe como un artefacto de evaluación de fase 2.
- Inconsistencia de atribución: el repositorio figura bajo el autor `ZenithComp`, mientras que el código de ejemplo de la model card apunta al adaptador `sivakorn-su/typhoon-ocr-7b-thai-handwriting-lora-v1`. Conviene verificar cuál es el artefacto canónico antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZenithComp/typhoon-ocr-7b-thai-handwriting-lora-v1
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr-7b
- Modelo base de la cadena: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Artefacto de métricas citado en la model card: https://huggingface.co/sivakorn-su/typhoon-ocr-7b-thai-handwriting-lora-v1/blob/phase2-downsample-money-keep25-300steps/phase2_artifacts/metrics.json
- Dataset de entrenamiento citado: `Thinnaphat/TH-HANDWRITTEN-CPE-OPH2025` (subconjunto de `iapp/thai_handwriting_dataset`)
- La búsqueda web no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a mareas y vías navegables del río Great Ouse y no guardan relación con el artefacto.
