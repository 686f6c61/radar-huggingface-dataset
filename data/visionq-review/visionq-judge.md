# visionq-review/VisionQ-Judge

## Resumen

VisionQ-Judge es un adaptador LoRA sobre el modelo multimodal Google Gemma-4-E4B-it, desarrollado por el equipo anónimo detrás del envío a CVPR 2027 titulado *VisionQ*. El modelo está especializado en una tarea muy concreta: actuar como juez visual (VLM-as-judge) y determinar, a partir de una figura de comparación cualitativa de un artículo científico, qué método afirman los autores que obtiene el mejor resultado. No es un modelo de propósito general, sino un componente de evaluación diseñado para un benchmark académico específico.

La relevancia del modelo radica en su enfoque metodológico: se ha afinado con DPO (Direct Preference Optimization) sobre pares de evidencia simétricos presentados en todos los órdenes cíclicos posibles de las opciones, lo que reduce el sesgo posicional del juez. Los adaptadores se publican en tres semillas (42, 43 y 44) con el objetivo de permitir la reproducibilidad de los resultados reportados en el artículo.

El modelo se distribuye como adaptadores PEFT (LoRA) de aproximadamente 0,5 GB, no como pesos completos, y requiere descargar el modelo base Gemma-4-E4B-it por separado. Su licencia es la de Gemma y el repo no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma-4-E4B-it |
| Parametros totales | no disponible (adaptadores LoRA r=16, alpha 32; el modelo base no se especifica en detalle) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona ejecución en fp16) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma terms of use) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

VisionQ-Judge no es un modelo completo, sino un conjunto de adaptadores LoRA (r=16, alpha=32) aplicados sobre las capas de lenguaje y visión de Gemma-4-E4B-it. El entrenamiento se realizó con DPO (beta=0,3, learning rate 2e-5) sobre el split de entrenamiento de VisionQ-MCQ, compuesto por 2.687 preguntas disjuntas en cuanto a artículos respecto a los splits de validación y test. Los pares de preferencia son pares de evidencia simétricos presentados en todos los órdenes cíclicos de las opciones, con un total de 13.394 pares y una sola época de entrenamiento.

La innovación técnica principal es el diseño anti-sesgo posicional: al presentar cada par de evidencia en todos los órdenes cíclicos de opciones, el adaptador aprende a emitir juicios independientes de la posición de la opción correcta. Se publican tres semillas independientes (42, 43, 44) para permitir la reproducción del resultado medio reportado en el artículo. La evaluación reportada se realizó con fp16, contexto antepuesto (prepend-context), instrucción anti-sesgo y tamaño máximo de imagen de 512 píxeles.

## Capacidades

- Evaluación de figuras de comparación cualitativa: identifica qué método declaran los autores como ganador en una figura de un artículo.
- Razonamiento multimodal sobre imágenes y texto: procesa la figura junto con contexto textual (caption y contexto antepuesto).
- Selección de opciones múltiples (MCQ) sobre preguntas del benchmark VisionQ-MCQ.
- Juicio con instrucción anti-sesgo para mitigar el sesgo de posición en las opciones.
- Capacidades heredadas del modelo base Gemma-4-E4B-it (no detalladas en la información disponible).
- Soporte de tool calling, agentes o thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Evaluación automática de figuras en artículos científicos: el modelo recibe la figura de comparación cualitativa y el contexto del artículo para determinar qué método reportan los autores como superior, sustituyendo la revisión manual en pipelines de revisión.
- Benchmarking de sistemas de visión-lenguaje: se puede usar como juez de referencia en experimentos que comparen modelos sobre el benchmark VisionQ-MCQ, con las tres semillas para estimar la varianza.
- Reproducibilidad de investigación: los adaptadores por semilla permiten replicar los resultados del artículo con el script `judge/evaluate.py` y los parámetros documentados.
- Auditoría de sesgo posicional en jueces VLM: al haberse entrenado con pares en todos los órdenes cíclicos, sirve como referencia para estudiar la sensibilidad al orden de opciones en modelos juez.
- Análisis de calidad de figuras en preprints: integrado en flujos de revisión previa a la publicación para señalar figuras cuyo mensaje cualitativo sea ambiguo o contradictorio.
- Generación de datos de preferencia para ajuste de otros jueces: los pares simétricos y las predicciones por pregunta del release de código pueden reutilizarse para entrenar o validar otros adaptadores DPO.

## Benchmarks y rendimiento

| Modelo | Test accuracy (538 preguntas VisionQ-MCQ) |
|---|---|
| VisionQ-Judge seed42 | 61,3% |
| VisionQ-Judge seed43 | 60,2% |
| VisionQ-Judge seed44 | 61,3% |
| Media de las tres semillas | 61,0% |
| Gemma-4-E4B-it base | 50,4% |

La diferencia reportada es de +10,6 puntos (intervalo bootstrap del 95%: +5,0 a +16,0). Las predicciones por pregunta están en el release de código (`results/judge/test/Cfix_s4*`). Los autores advierten que las salidas en fp16 varían según el tipo de GPU, por lo que las comparaciones deben hacerse sobre el mismo tipo de GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los adaptadores ocupan 0,5 GB y el modelo base Gemma-4-E4B-it debe cargarse en fp16 con `device_map="auto"`.
- GPU recomendadas: no especificadas; la model card solo indica que las salidas fp16 varían según el tipo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`) y `AutoModelForImageTextToText`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento VisionQ-MCQ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VisionQ-Judge (este) | LoRA sobre Gemma-4-E4B-it | no disponible | 61,0% (media 3 semillas) | gemma | Hugging Face (adaptadores) |
| Gemma-4-E4B-it (base) | no disponible | no disponible | 50,4% | gemma | Hugging Face |
| Otros jueces VLM comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos juez multimodales comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo está entrenado para la tarea de juez sobre figuras de comparación cualitativa del benchmark VisionQ-MCQ; no es un modelo de propósito general.
- Dependencia del prompt y del preprocesado: los resultados reportados exigen `--prepend-context`, `--anti-bias-instruction`, `--fp16` y `--max-image-size 512`; desviarse de esta configuración puede degradar la precisión.
- Variabilidad por hardware: las salidas fp16 cambian según el tipo de GPU, lo que afecta a la reproducibilidad exacta entre máquinas.
- Varianza entre semillas: la precisión oscila entre 60,2% y 61,3% según la semilla, con un intervalo de confianza amplio (+5,0 a +16,0).
- Licencia Gemma: los adaptadores son derivados de Gemma y están sujetos a los términos de uso de Gemma, con posibles restricciones para uso comercial.
- Riesgo de alucinación: no evaluado en la información disponible; como juez VLM puede emitir juicios incorrectos sobre figuras ambiguas.
- Idiomas soportados y sesgos conocidos: no documentados.
- Sin datos de descargas ni validación comunitaria: el repo registra 0 descargas y 0 likes, por lo que no hay evidencia de uso externo.

## Enlaces

- Hugging Face: https://huggingface.co/visionq-review/VisionQ-Judge
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paper: envío anónimo a CVPR 2027 *VisionQ* (no se proporciona URL)
- Release de código: referenciado como `judge/evaluate.py`, `judge/train.sh` y `results/judge/test/Cfix_s4*` (no se proporciona URL)
