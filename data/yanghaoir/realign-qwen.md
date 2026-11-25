# yanghaoir/ReAlign-Qwen

## Resumen

ReAlign-Qwen es un adaptador PEFT (LoRA) sobre el modelo base Qwen2.5-VL-7B-Instruct, especializado en recuperación visual de documentos (*visual document retrieval*). Lo desarrolla Hao Yang y colaboradores de la Northeastern University, la Tsinghua University y Alibaba Group, y el trabajo fue aceptado en SIGIR 2026. El modelo resuelve el problema de localizar, dentro de páginas de documento con maquetaciones complejas, las regiones visualmente relevantes para una consulta dada.

La innovación principal es el método ReAlign (*Reasoning-Guided Alignment*): se emplea la capacidad de razonamiento de un VLM para identificar regiones de la página relacionadas con la consulta y generar descripciones finas y condicionadas por la consulta, que se usan como señal de supervisión para entrenar el retriever. Así, el modelo aprende a fijarse en las pistas visuales críticas en lugar de en el layout completo.

El resultado es un retriever multimodal de 7B parámetros (heredados del base) con licencia MIT, distribuido como adaptador LoRA en formato safetensors (repo de 0,1 GB), que requiere cargar el modelo base por separado. Es relevante para pipelines de RAG documental donde la información crítica está en tablas, gráficos o diagramas que un OCR o un retriever de texto plano no captura bien.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer multimodal Qwen2.5-VL-7B-Instruct |
| Parametros totales | 7B en el modelo base; el adaptador LoRA es una fracción (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

ReAlign-Qwen no es un modelo entrenado desde cero: es un adaptador LoRA sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal (visión-lenguaje) de 7B parámetros. La contribución del trabajo es el procedimiento de alineamiento guiado por razonamiento: un VLM identifica las regiones de la página relevantes para la consulta y genera descripciones finas y conscientes de la consulta; esas descripciones actúan como supervisión para entrenar el retriever a alinear representaciones visuales y textuales a nivel de región, no solo de página completa.

El entrenamiento utiliza el corpus NTT-hil-insight/OpenDocVQA-Corpus (el conjunto de datos de entrenamiento está publicado como ReAlign-Trainset). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El repositorio incluye también una variante basada en Phi-3-vision-128k-instruct (ReAlign-Phi3v), lo que indica que el método es agnóstico al VLM de partida.

## Capacidades

- Recuperación visual de documentos: dado un documento (imagen de página) y una consulta, devuelve/localiza las regiones relevantes para la consulta.
- Alineamiento fino a nivel de región: se centra en tablas, gráficos, diagramas y bloques de texto concretos dentro de maquetaciones complejas.
- Comprensión multimodal: hereda del base Qwen2.5-VL-7B-Instruct la capacidad de procesar imagen y texto conjuntamente.
- Razonamiento guiado por consulta: usa descripciones generadas por un VLM como señal interna de alineamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada del adaptador.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: orientado exclusivamente a *retrieval*; no está pensado como modelo generativo de propósito general.

## Casos de uso

- RAG documental sobre PDFs con maquetación compleja: el retriever localiza la región exacta (tabla, gráfico o bloque) relevante para la consulta antes de pasarla a un LLM generador, reduciendo el ruido de contexto frente a un retriever de texto plano.
- Búsqueda en informes financieros: permite recuperar tablas de resultados y gráficos de evolución a partir de preguntas en lenguaje natural, aprovechando el alineamiento a nivel de región.
- Atención al cliente sobre documentación técnica: indexar manuales y fichas de producto como imágenes de página y recuperar el fragmento visual concreto que responde a la duda del usuario.
- Extracción de información de formularios y facturas: localizar los campos relevantes en documentos escaneados con layouts variables, como paso previo a la extracción estructurada.
- Búsqueda en literatura científica: recuperar figuras, diagramas y tablas de artículos a partir de consultas sobre metodología o resultados.
- Evaluación y aumento de pipelines OCR: usar las regiones recuperadas para dirigir el OCR o el recorte de imagen, mejorando la precisión en documentos donde el texto está mezclado con elementos gráficos.
- Investigación en recuperación multimodal: servir como baseline reproducible (con dataset de entrenamiento publicado) para experimentos de *visual document retrieval*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica. Como referencia, un modelo base de 7B en precisión fp16 requiere del orden de 14-16 GB solo para los pesos, más memoria para las imágenes y el contexto; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: para fp16, GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100). En cuantización de 8 bits o 4 bits podría caber en GPU de 16 GB, aunque no se documentan cuantizaciones oficiales para este adaptador.
- ¿Cabe en GPU de consumo? Previsiblemente sí en RTX 4090 (24 GB) con el base en fp16; en GPUs de 16 GB requeriría cuantizar el base, opción no validada en la información disponible.
- Opciones de despliegue: carga mediante la librería `peft` junto con el base Qwen2.5-VL-7B-Instruct; para servicio de alto rendimiento, los frameworks de inferencia compatibles con Qwen2.5-VL (vLLM, TGI) podrían servir el base, pero la integración del adaptador no está documentada en la información proporcionada. llama.cpp/Ollama no están confirmados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReAlign-Qwen | 7B (base) + LoRA | no disponible | Recuperación visual de documentos | MIT | Hugging Face |
| ReAlign-Phi3v | base Phi-3-vision-128k-instruct | no disponible | Recuperación visual de documentos | no disponible | Hugging Face |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible en esta ficha | VLM generativo de propósito general | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: es un retriever, no un modelo generativo; no debe usarse para generación de texto o respuesta a preguntas de forma directa.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está validado.
- Dependencia del base: requiere descargar y cargar Qwen2.5-VL-7B-Instruct por separado; el adaptador por sí solo no es funcional.
- Riesgo de alucinación: aunque la tarea es de recuperación, el componente de descripción guiada por razonamiento podría generar descripciones inexactas que degraden la alineación en documentos atípicos.
- Sesgos: no se documentan análisis de sesgo; al heredar el base, puede reproducir sesgos presentes en Qwen2.5-VL y en el corpus OpenDocVQA.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-VL-7B-Instruct, que se rigen por su propia licencia.
- Madurez: 23 descargas y 3 likes en el momento de la consulta; ecosistema de validación y tooling muy limitado.
- Sin benchmarks publicados en la información disponible: no hay evidencia cuantitativa de rendimiento para justificar su elección frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanghaoir/ReAlign-Qwen
- Paper (arXiv): https://arxiv.org/abs/2604.07419
- Página del paper en HF: https://huggingface.co/papers/2604.07419
- Repositorio GitHub: https://github.com/NEUIR/ReAlign
- Colección ReAlign en HF: https://huggingface.co/collections/yanghaoir/realign
- Variante ReAlign-Phi3v: https://huggingface.co/yanghaoir/ReAlign-Phi3v
- Dataset de entrenamiento: https://huggingface.co/datasets/yanghaoir/ReAlign-Trainset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
