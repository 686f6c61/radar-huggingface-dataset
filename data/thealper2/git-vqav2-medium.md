# thealper2/git-vqav2-medium

## Resumen

git-vqav2-medium es un ajuste fino del modelo microsoft/git-base-vqav2 publicado por el usuario thealper2 en HuggingFace. Se trata de un modelo de respuesta a preguntas visuales (visual question answering, VQA) construido sobre la arquitectura GIT (Generative Image-to-text Transformer) en su variante base, con 177.159.738 parámetros en total. El modelo combina un codificador visual CLIP ViT-B/16 de 12 capas que procesa imágenes a 480×480 píxeles (901 tokens visuales) con un decodificador de texto causal Transformer de 6 capas, dimensión oculta 768, 12 cabezas de atención y un máximo de 1024 posiciones.

El ajuste se ha realizado sobre el conjunto de datos HuggingFaceM4/VQAv2, empleando 50.000 preguntas del split de entrenamiento (imágenes COCO train2014). La respuesta objetivo se obtiene por voto mayoritario de las 10 respuestas humanas, normalizada a minúsculas y sin puntuación en los extremos. El entrenamiento completo (estrategia `full`, sin LoRA ni congelación de capas) se ejecutó durante 2 épocas con AdamW a una tasa de aprendizaje de 2e-06 sobre una única NVIDIA GeForce RTX 5060 Ti, con 3.126 pasos de optimizador.

Su relevancia es acotada y de nicho: es un modelo pequeño, en inglés, orientado exclusivamente al dominio COCO, que sirve como referencia reproducible de ajuste fino de GIT y como candidato para prototipos de VQA en hardware de consumo. No obstante, el propio autor documenta que rinde ligeramente por debajo del checkpoint base del que parte en el subconjunto de validación evaluado (82,54 frente a 83,32 de precisión VQA), por lo que su interés práctico es principalmente experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `GitForCausalLM` (GIT-base): codificador visual CLIP ViT-B/16 + decodificador de texto causal Transformer |
| Parámetros totales | 177.159.738 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 posiciones máximas en el decodificador de texto; 901 tokens visuales de entrada |
| Tipos de cuantización | No se publican ficheros cuantizados; los pesos se distribuyen en fp32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32) |

Datos adicionales de la arquitectura:

| Componente | Detalle |
|---|---|
| Codificador visual | CLIP ViT-B/16, 12 capas, entrada 480×480 |
| Preprocesado de imagen | `CLIPImageProcessor`: redimensionado del lado corto a 480 (bicúbica), recorte central 480×480, reescalado 1/255, normalización con media/desviación de CLIP |
| Decodificador de texto | 6 capas causales, hidden 768, 12 cabezas, máximo 1024 posiciones |
| Tokenizador | BERT WordPiece (uncased), vocabulario 30.522 |
| Formato de prompt | `[CLS] pregunta` (sin `[SEP]` entre pregunta y respuesta) |
| Formato de salida | Tokens de respuesta generados tras el prompt, terminados en `[SEP]` (eos id 102) |
| Tamaño del repositorio | 0,7 GB |
| Modelo base | microsoft/git-base-vqav2 |

## Arquitectura y entrenamiento

GIT es una arquitectura encoder-decoder unificada para tareas de imagen-a-texto: un codificador visual tipo ViT produce una secuencia de embeddings de parches que se concatenan con los embeddings de texto y se procesan de forma conjunta por un decodificador Transformer causal. En esta variante, el codificador es CLIP ViT-B/16 entrenado a 480×480 (901 tokens visuales) y el decodificador tiene 6 capas con dimensión oculta 768, 12 cabezas y 1024 posiciones máximas. El tokenizador es WordPiece sin distinción de mayúsculas y minúsculas, con vocabulario de 30.522 entradas.

El ajuste fino utilizó el split `train` de la conversión Parquet de HuggingFaceM4/VQAv2 (revisión ac4a1a047466a7019b5357ce94b6b5794fc9f867), con las 20 shards [0–19] y 50.000 preguntas; no se descartó ninguna fila por falta de pregunta o respuesta. La secuencia de entrenamiento es `[CLS] pregunta respuesta [SEP]` y la pérdida se calcula únicamente sobre `respuesta [SEP]`, con el resto de posiciones en `-100`. La respuesta objetivo se deriva del voto mayoritario de las 10 respuestas humanas (minúsculas, sin espacios ni puntuación en los extremos; en caso de empate se usa `multiple_choice_answer`).

Hiperparámetros: 2 épocas, AdamW (β=(0,9; 0,999), ε=1e-8) sin decaimiento en sesgos ni LayerNorm, tasa de aprendizaje 2e-06 con decaimiento lineal y 156 pasos de calentamiento, tamaño de lote 8 con 4 pasos de acumulación (lote efectivo 32), weight decay 0,01, recorte de gradiente 1,0. Se usó autocast en bf16 con pesos maestros en fp32, atención visual con SDPA, semilla 42 y 3.126 pasos de optimizador. El mejor checkpoint fue el paso 500 (vqa_accuracy = 84,39 en el conjunto de selección, 1.000 preguntas de las shards [2, 7] de validación). El hardware de entrenamiento fue una única NVIDIA GeForce RTX 5060 Ti, con torch 2.11.0+cu128, transformers 5.17.0 y datasets 4.3.0. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Respuesta a preguntas visuales (VQA): genera una respuesta corta en texto a partir de una imagen y una pregunta en inglés.
- Generación de texto condicionada por imagen, en formato imagen-texto-a-texto (`image-text-to-text`).
- Manejo de preguntas de tipo sí/no, numéricas y de categoría "other", con rendimiento diferenciado por tipo (véase la sección de benchmarks).
- Respuestas deterministas en la configuración evaluada: `max_new_tokens=10`, `num_beams=1`, `do_sample=False`.
- Procesamiento de imágenes de hasta 480×480 píxeles tras recorte central, con 901 tokens visuales por imagen.
- Generación por lotes, con la restricción documentada de que GIT no deriva los identificadores de posición del texto a partir de la máscara de atención, por lo que solo pueden agruparse prompts de idéntica longitud en tokens.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo de pensamiento (*thinking*), audio, vídeo ni capacidades multilingües. El modelo es monolingüe en inglés.

## Casos de uso

- Asistente de accesibilidad visual: responder preguntas en inglés sobre el contenido de una fotografía para usuarios con discapacidad visual, integrado en una aplicación móvil o web que envíe la imagen y la pregunta al modelo y devuelva una respuesta corta.
- Etiquetado y enriquecimiento de catálogos de producto: dado que las respuestas objetivas (color, número de objetos, presencia o ausencia de atributos) alcanzan buena precisión en el subconjunto evaluado, puede usarse para extraer atributos simples de imágenes de producto en inglés.
- Preanotación de datos para pipelines de visión: generar respuestas candidatas sobre imágenes COCO-style que después se revisan por anotadores humanos, reduciendo el coste del etiquetado manual en proyectos de VQA.
- Investigación reproducible en ajuste fino: al documentar el autor todos los hiperparámetros, el dataset, la semilla y el hardware, sirve como referencia de partida para experimentos comparativos de ajuste completo frente a LoRA/PEFT en arquitecturas GIT.
- Prototipado en hardware de consumo: con 177 millones de parámetros y pesos de aproximadamente 0,7 GB en fp32, puede ejecutarse en portátiles con GPU modesta o incluso en CPU para demostraciones y pruebas de concepto sin acceso a clústeres.
- Módulo de control de calidad en aplicaciones de visión por computador: verificaciones automáticas del tipo "¿aparece una persona en esta imagen?" o "¿cuántas señales hay?" sobre instantáneas de cámara, siempre que las imágenes se ajusten al dominio COCO y las preguntas estén en inglés.
- Evaluación comparativa interna de modelos VQA: como baseline ligero frente a modelos mayores en pruebas de regresión de pipelines, dado su bajo coste de inferencia y su licencia MIT.
- Educación y materiales didácticos: responder preguntas sencillas sobre ilustraciones o fotografías en inglés para ejercicios interactivos, con la advertencia de que el modelo no es fiable fuera del dominio COCO ni con preguntas que requieran razonamiento complejo.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 500 preguntas muestreadas con semilla fija de la shard [0] de `validation` (huella del subconjunto `1daf0de4dae278b4`), disjunta de las preguntas usadas para seleccionar el checkpoint. Se emplea la precisión de consenso oficial de VQAv2 (normalización de `vqaEval.py`; por pregunta, media sobre 10 subconjuntos *leave-one-out* de min(1, aciertos/3)) y también coincidencia exacta con la respuesta mayoritaria (métrica no oficial). La decodificación es determinista.

| Métrica | microsoft/git-base-vqav2 | Este modelo | Δ |
|---|---|---|---|
| Precisión VQA | 83,32 | 82,54 | -0,78 |
| Coincidencia exacta | 73,40 | 72,00 | -1,40 |
| Precisión VQA (numéricas) | 79,47 | 77,07 | -2,40 |
| Precisión VQA (otras) | 75,74 | 74,84 | -0,90 |
| Precisión VQA (sí/no) | 95,14 | 95,19 | +0,05 |

Además, el autor reporta una `vqa_accuracy` de 84,39 en el conjunto de selección de checkpoint (paso 500). No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, y las cifras anteriores no son comparables con las publicadas sobre el servidor oficial test-dev de VQAv2.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,71 GB en fp32 (177,16 M de parámetros × 4 bytes) y unos 0,35 GB en fp16/bf16. La memoria total de inferencia depende de las activaciones (901 tokens visuales por imagen) y del tamaño de lote; para lote 1 se sitúa en el orden de 1 a 2 GB, aunque no se dispone de una medición publicada.
- GPU recomendadas: cualquier GPU con al menos 2–4 GB de VRAM es suficiente en la práctica. El autor usó una NVIDIA GeForce RTX 5060 Ti (16 GB) para el entrenamiento, lo que indica que el ajuste fino completo con lote 8 y 4 pasos de acumulación cabe en esa clase de hardware.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en iGPU con memoria compartida suficiente en fp32 con lotes pequeños.
- Ejecución en CPU: viable por el reducido tamaño del modelo, aunque con latencia mayor y sin datos medidos publicados.
- Opciones de despliegue: `transformers` con `AutoProcessor` y `AutoModelForCausalLM` (procedimiento documentado por el autor). No consta en la información disponible soporte para vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni otras herramientas de servicio, ni se proporcionan ficheros GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de inferencia.
- Advertencia de lote: para generación por lotes solo deben agruparse prompts de igual longitud en tokens, porque GIT no deriva los identificadores de posición del texto de la máscara de atención y el relleno altera la salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión VQA (subconjunto del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thealper2/git-vqav2-medium | 177.159.738 | 1024 posiciones, imagen 480×480 | 82,54 | MIT | HuggingFace, transformers, safetensors fp32 |
| microsoft/git-base-vqav2 | No disponible en la información proporcionada (arquitectura y base idénticas) | 1024 posiciones, imagen 480×480 | 83,32 | No disponible en la información proporcionada | HuggingFace, transformers |
| microsoft/git-base | No disponible en la información proporcionada | No disponible | No evaluado en el subconjunto del autor | No disponible en la información proporcionada | HuggingFace |
| Alternativas de VQA de tamaño similar (por ejemplo, variantes base de BLIP) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa solo puede establecerse con el checkpoint base, que supera a este ajuste en precisión VQA global (-0,78), coincidencia exacta (-1,40) y preguntas numéricas (-2,40), y solo mejora ligeramente en preguntas de sí/no (+0,05). No se dispone de datos verificados de otros modelos comparables en la documentación consultada.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos. Al entrenarse sobre VQAv2 (imágenes COCO e respuestas humanas en inglés), hereda los sesgos de anotación y de distribución de ese conjunto, incluidas posibles asociaciones estereotipadas en las respuestas.
- Riesgo de alucinación: es un modelo generativo de 177 millones de parámetros; puede producir respuestas plausibles pero incorrectas, especialmente con preguntas de razonamiento, conteo o relaciones espaciales complejas y con imágenes fuera del dominio COCO.
- Dominio e idioma: entrenado y evaluado únicamente en inglés y sobre el dominio de imágenes COCO. No debe esperarse un rendimiento fiable en castellano ni en otros idiomas, ni con imágenes médicas, técnicas, de satélite o de documentos.
- Resolución y contexto limitados: las imágenes se recortan y redimensionan a 480×480, por lo que se pierde información en imágenes panorámicas o con detalles pequeños. El decodificador admite como máximo 1024 posiciones y la generación evaluada se limita a 10 tokens nuevos.
- Formato de las respuestas: el tokenizador es *uncased*, así que las respuestas se generan en minúsculas. WordPiece separa la puntuación, de modo que respuestas como `11 : 10` requieren un paso de destokenización para obtener `11:10`.
- Generación por lotes: no es posible rellenar (*padding*) prompts de distinta longitud sin alterar la salida, ya que GIT no deriva las posiciones de texto de la máscara de atención.
- Validez de las métricas: las puntuaciones se calculan sobre un subconjunto de 500 preguntas del split de validación, no sobre el servidor oficial test-dev, y no son comparables con las cifras publicadas de GIT-base. El propio autor advierte de que el checkpoint base puntúa muy por encima de los resultados publicados en test-dev para GIT-base sobre estas mismas preguntas de validación, lo que sugiere que los datos de validación de VQAv2 formaron parte de su ajuste original; por tanto, las precisiones absolutas son optimistas para ambos modelos.
- Estado de validación por la comunidad: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, y el ajuste se publicó el 27 de septiembre de 2026. No hay revisión independiente de los resultados ni de la calidad del modelo.
- Licencia: MIT, sin restricciones declaradas para uso comercial. No obstante, conviene verificar las condiciones del modelo base (microsoft/git-base-vqav2) y del conjunto de datos VQAv2/COCO antes de un despliegue en producción.
- Uso en producción: el modelo no incluye filtros de seguridad, moderación de contenido ni gestión de entradas malformadas, y no se documentan pruebas de robustez frente a imágenes adversarias o prompts manipulados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/git-vqav2-medium
- Modelo base: https://huggingface.co/microsoft/git-base-vqav2
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/HuggingFaceM4/VQAv2
- No se han encontrado en la información proporcionada enlaces adicionales a artículos, blogs técnicos, repositorios de código o demostraciones.
