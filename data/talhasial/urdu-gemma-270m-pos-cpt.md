# talhasial/urdu-gemma-270m-pos-cpt

## Resumen

`talhasial/urdu-gemma-270m-pos-cpt` es un adaptador LoRA para etiquetado de partes de la oración (POS tagging, esquema UPOS) en urdu, construido sobre `google/gemma-3-270m`. Lo publica Muhammad Talha Sial (Masaryk University) como parte de su tesis de máster *Exploiting large language models for improvements in Urdu NLP* (2026). No es un modelo generativo de propósito general, sino un ajuste fino especializado en una tarea concreta de procesamiento del lenguaje natural para un idioma de bajos recursos.

El adaptador se entrenó sobre el treebank UD_Urdu-UDTB (datos de UD v2.14, 4.043 frases de entrenamiento) con LoRA de rango 16 durante 5 épocas. Forma parte de un experimento en el que el adaptador se aplica sobre otro adaptador previo (la rama CPT, *continued pre-training*) que debe fusionarse primero con el modelo base; el repositorio contiene únicamente el adaptador de la segunda etapa.

Su relevancia es acotada pero clara: demuestra que un modelo de 270 millones de parámetros, ajustado con LoRA, puede abordar tareas morfosintácticas en urdu con un coste computacional mínimo y un formato de salida compacto (`palabra/ETIQUETA`), lo que lo hace desplegable en entornos con recursos muy limitados. La licencia es no comercial, derivada de la licencia de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA (PEFT) |
| Parametros totales | 270 millones (modelo base `google/gemma-3-270m`); parámetros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de uso fija `max_seq_length=512` |
| Tipos de cuantizacion | No disponible (el ejemplo de uso emplea `load_in_4bit=False`) |
| Idiomas soportados | Urdu (`ur`) para la tarea de etiquetado; el modelo base Gemma 3 es multilingüe |
| Licencia | `other`: Gemma Terms of Use + CC BY-NC-SA 4.0 por los datos; uso no comercial |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-270m`, un transformer decoder-only de 270 millones de parámetros. El ajuste se realizó con LoRA de rango 16 y tasa de aprendizaje 2e-4 durante 5 épocas sobre el treebank UD_Urdu-UDTB (UD v2.14, 4.043 frases de entrenamiento), conservando el checkpoint con menor pérdida de validación. El entrenamiento se hizo con Unsloth, según el código de ejemplo de la model card.

La particularidad del pipeline es que este adaptador no se aplica directamente sobre el modelo base, sino sobre una versión del modelo que ya incorpora fusionado el adaptador de la rama CPT (*continued pre-training*). Es decir, el flujo es: Gemma-3-270M → fusión del adaptador CPT → aplicación de este adaptador POS. El formato de entrada es `Tag: <frase>` seguido de salto de línea, y la salida esperada es una secuencia `palabra/ETIQUETA` con decodificación greedy. No se documentan innovaciones arquitectónicas adicionales ni detalles sobre el corpus de la fase CPT.

## Capacidades

- Etiquetado de partes de la oración en urdu con el inventario UPOS (Universal POS tags).
- Generación de anotación en formato compacto `palabra/ETIQUETA` a partir de una frase precedida por el prefijo `Tag:`.
- Decodificación determinista mediante greedy decoding, adecuada para tareas de etiquetado secuencial.
- Especialización en una única tarea: no está pensado para generación libre, razonamiento, código ni matemáticas.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documentan capacidades multimodales, de audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a la tarea y al idioma de entrenamiento (urdu); el modelo base es multilingüe, pero el adaptador no se evaluó en otros idiomas según la información disponible.

## Casos de uso

- Anotación morfosintáctica de corpus en urdu: el adaptador etiqueta cada token de una frase con su categoría UPOS, lo que permite procesar textos en urdu para construir o ampliar corpus anotados con un coste mínimo de GPU.
- Preprocesamiento para pipelines de NLP en urdu: las etiquetas POS sirven como entrada a analizadores sintácticos, sistemas de extracción de entidades o modelos de traducción que se beneficien de información gramatical.
- Investigación lingüística computacional: permite comparar el rendimiento de un modelo de 270M ajustado con LoRA frente a etiquetadores tradicionales (HMM, CRF, BiLSTM) sobre UD_Urdu-UDTB.
- Docencia y experimentación académica: al caber en GPU de consumo y entrenarse en minutos u horas, es un caso práctico para enseñar ajuste fino con PEFT y evaluación sobre treebanks UD.
- Etiquetado asistido con revisión humana: el modelo puede preanotar grandes volúmenes de texto en urdu que después se corrigen manualmente, reduciendo el esfuerzo de anotación.
- Despliegue en entornos con recursos limitados: al tratarse de un adaptador sobre un modelo de 270M, puede ejecutarse en CPU o en GPU de gama baja para tareas de etiquetado por lotes, sin necesidad de infraestructura de servidor dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 270M en precisión completa (fp16/bf16) el peso ronda los 0,5-0,6 GB, a lo que se suma el adaptador (tamaño no indicado) y el estado del runtime.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo base de 270M es holgadamente ejecutable en GPU de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna de consumo (por ejemplo, RTX 3060 o superior), aunque no se documenta una medición concreta.
- Opciones de despliegue: el ejemplo oficial usa Unsloth y PEFT; al ser un adaptador LoRA sobre safetensors, es compatible con el ecosistema Hugging Face (transformers + peft). No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `talhasial/urdu-gemma-270m-pos-cpt` | 270M (base) + LoRA | No disponible | POS tagging UPOS en urdu | No comercial (Gemma Terms + CC BY-NC-SA 4.0) | Hugging Face, 0 descargas |
| `google/gemma-3-270m` | 270M | No disponible en la información | Modelo base generativo multilingüe | Gemma Terms of Use | Hugging Face (modelo base) |
| Etiquetadores POS clásicos para urdu (CRF, BiLSTM) | No disponible | No aplica | POS tagging | Variable según implementación | No disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: los datos de entrenamiento (UD_Urdu-UDTB) están bajo CC BY-NC-SA 4.0, por lo que el adaptador se publica para uso no comercial y bajo los mismos términos; además aplica la Gemma Terms of Use.
- Dependencia de un adaptador previo: el uso correcto requiere fusionar primero el adaptador de la rama CPT (no incluido en este repositorio) antes de aplicar este; usarlo solo con el modelo base no reproduce el comportamiento entrenado.
- Ámbito muy restringido: solo etiquetado UPOS en urdu; no es un modelo de propósito general y su uso fuera de esa tarea no está validado.
- Riesgo de alucinación en el formato de salida: al ser un modelo generativo que produce `palabra/ETIQUETA`, puede desviarse del formato esperado o alinear incorrectamente tokens y etiquetas en frases largas o con ruido.
- Sesgos y cobertura: el entrenamiento se limita a 4.043 frases de un único treebank, por lo que el dominio, el registro y la variedad dialectal cubiertos son estrechos.
- Sin datos de evaluación publicados en la información disponible: no hay métricas de precisión, recall o F1 que permitan valorar su calidad frente a alternativas.
- Longitud de entrada: el ejemplo fija `max_seq_length=512`; frases más largas requerirán truncado o segmentación.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/talhasial/urdu-gemma-270m-pos-cpt
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Código y evaluación de la tesis: https://github.com/543516-collab/urdu-gemma-270m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Treebank UD_Urdu-UDTB (Universal Dependencies, v2.14): no disponible en la información proporcionada como enlace directo
