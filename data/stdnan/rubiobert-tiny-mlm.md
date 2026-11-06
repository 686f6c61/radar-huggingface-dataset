# stdnan/rubiobert-tiny-mlm

## Resumen

RuBioBERT-Tiny (distilled) es un modelo de lenguaje enmascarado (MLM) para ruso biomédico, publicado por el usuario stdnan en Hugging Face. Se trata de una versión destilada del modelo alexyalunin/RuBioBERT, que actúa como profesor, reduciendo la arquitectura del estudiante a 3 capas de transformador, 4 cabezas de atención y un tamaño de estado oculto de 312. Con 41.289.018 parámetros totales y un repositorio de 0,3 GB, el objetivo es ofrecer una alternativa ligera para tareas de representación y relleno de máscaras en el dominio biomédico ruso, donde el coste computacional y de memoria es un factor limitante.

La relevancia del modelo radica en su enfoque de eficiencia: frente al RuBioBERT original, esta variante reduce drásticamente la huella de memoria y el coste de inferencia, lo que permite desplegarlo en entornos con recursos limitados o en pipelines de preprocesamiento a gran escala. No obstante, el propio autor reconoce en la model card que el entrenamiento ha procesado aproximadamente 152,4 millones de tokens, lo que supone un ratio de 0,18 respecto al óptimo teórico de Chinchilla (825,8 millones de tokens para este número de parámetros), indicando un subentrenamiento en términos de eficiencia computacional.

El modelo está pensado exclusivamente para masked language modeling y requiere fine-tuning para tareas aplicadas como clasificación de textos médicos, extracción de entidades nombradas o generación de respuestas. No es un sistema de diagnóstico ni debe emplearse para decisiones clínicas sin supervisión profesional. Su licencia MIT facilita la integración en proyectos comerciales y de investigación, aunque con las cautelas propias de un modelo de dominio especializado y tamaño reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) destilado, 3 capas, 4 cabezas de atención, hidden size 312 |
| Parámetros totales | 41.289.018 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del estudiante es un transformer encoder de tipo BERT con 3 capas de representación oculta, 4 cabezas de atención y un tamaño de estado oculto de 312. Esta configuración reduce significativamente la complejidad computacional y el volumen de memoria respecto al modelo profesor RuBioBERT, manteniendo la capacidad representativa en el dominio biomédico ruso. El modelo se distribuye en formato safetensors y el repositorio ocupa 0,3 GB.

El entrenamiento se realizó mediante destilación de conocimiento con una función de pérdida híbrida que combina entropía cruzada y divergencia de Kullback-Leibler con escalado de temperatura. En la fase inicial se empleó únicamente entropía cruzada para estabilizar los gradientes, tras lo cual se transitó de forma gradual a un régimen híbrido con un coeficiente de ponderación de 0,9. Se utilizó el optimizador AdamW con un planificador de tasa de aprendizaje lineal, acumulación de gradientes y normalización por norma de 0,5. El modelo procesó aproximadamente 152.418.048 tokens durante el entrenamiento, lo que según los propios cálculos del autor representa un ratio de 0,18 respecto al óptimo de Chinchilla (825.780.360 tokens para 41,3 millones de parámetros).

## Capacidades

- Modelado de lenguaje enmascarado (MLM) en ruso biomédico: predice tokens enmascarados en contextos médicos, como se ejemplifica en la model card con casos de anatomía, farmacología, sintomatología clínica, patología y farmacocinética.
- Representación contextual de textos biomédicos en ruso: genera embeddings útiles para tareas posteriores de clasificación, extracción de entidades o similitud semántica tras el correspondiente fine-tuning.
- Comprensión de terminología médica especializada: la model card documenta predicciones coherentes en contextos de farmacocinética (por ejemplo, "крови" con probabilidad 0,930 en un contexto sobre inhibidores de CYP3A4) y sintomatología (por ejemplo, "недостаточность" con probabilidad 0,340 en un contexto sobre diabetes tipo 1).
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al ruso; no se documentan otros idiomas.
- No dispone de modo "thinking", visión, audio ni otras capacidades especiales.

## Casos de uso

- Relleno de máscaras en textos biomédicos rusos: el modelo puede utilizarse para completar términos enmascarados en artículos, informes o historiales clínicos, lo que resulta útil en tareas de aumento de datos o verificación de coherencia terminológica en ruso médico.
- Preprocesamiento y representación para pipelines de NLP clínico: al generar embeddings contextuales de bajo coste, puede alimentar clasificadores de textos médicos (por ejemplo, codificación CIE-10) o sistemas de triaje documental en entornos con recursos limitados.
- Extracción de entidades nombradas (NER) tras fine-tuning: su tamaño reducido permite entrenar y desplegar modelos NER específicos del dominio biomédico ruso en hardware modesto, integrándose en sistemas de extracción de información de historiales electrónicos.
- Clasificación de documentos médicos: con un fine-tuning ligero, puede emplearse para categorizar informes, artículos o notas clínicas por especialidad, patología o nivel de urgencia, aprovechando su conocimiento del vocabulario biomédico ruso.
- Búsqueda semántica en corpus médicos en ruso: los embeddings generados pueden indexarse para recuperación de información en bases de datos de literatura biomédica o protocolos clínicos, con un coste de inferencia muy inferior al de modelos de mayor tamaño.
- Prototipado rápido y experimentación académica: investigadores que necesiten un modelo base ligero para experimentos de NLP biomédico en ruso pueden usar esta variante destilada para validar pipelines antes de escalar a modelos mayores, gracias a su licencia MIT y su reducida huella de memoria.
- Filtrado y normalización de textos clínicos: en tareas de limpieza de datos, el modelo puede ayudar a detectar términos plausibles o inconsistentes en informes médicos rusos mediante puntuaciones de verosimilitud de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 41,3 millones de parámetros, la inferencia en FP32 requiere aproximadamente 165 MB solo para los pesos, más el overhead de activaciones y tokenizador; en FP16 o cuantización de 8 bits, la huella se reduce a decenas de MB. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna puede alojar el modelo; no se requieren A100 ni H100. Una GTX 1650, RTX 3060 o incluso CPU son suficientes para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: al ser un modelo BERT en safetensors, puede servirse con Hugging Face Transformers, Text Embeddings Inference (TEI), o exportarse a ONNX para inferencia optimizada. No se documenta soporte nativo en vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos por secuencia en GPU consumer y throughput alto en lotes, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| stdnan/rubiobert-tiny-mlm | 41,3 M | no disponible | Ruso biomédico | MIT | Destilado de RuBioBERT, 3 capas, 4 cabezas, hidden 312 |
| alexyalunin/RuBioBERT | no disponible | no disponible | Ruso biomédico | no disponible | Modelo profesor; mayor tamaño y coste computacional |
| RuBioBERT original (referencia) | no disponible | no disponible | Ruso biomédico | no disponible | Base del proceso de destilación; no se dispone de especificaciones detalladas en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Subentrenamiento documentado: el autor indica que el ratio de tokens procesados respecto al óptimo de Chinchilla es de 0,18, lo que sugiere que el modelo no ha aprovechado todo su potencial de escalado y puede tener un rendimiento inferior al esperado para su tamaño.
- Uso restringido a MLM: no es un modelo generativo ni un chatbot; requiere fine-tuning para clasificación, NER, generación de respuestas u otras tareas aplicadas.
- No es una herramienta diagnóstica: la model card advierte explícitamente que no debe usarse para decisiones clínicas sin supervisión de un profesional cualificado.
- Dominio e idioma limitados: entrenado exclusivamente para ruso biomédico; su rendimiento fuera de ese dominio o idioma no está garantizado.
- Riesgo de alucinación y predicciones erróneas: como modelo MLM, puede producir tokens plausibles pero incorrectos en contextos médicos, especialmente en casos de baja probabilidad (por ejemplo, predicciones con probabilidad 0,072 en contextos patológicos).
- Licencia MIT: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su aplicación concreta y de cumplir con la normativa aplicable en materia de datos médicos.
- Sin garantías de soporte: el repositorio tiene 54 descargas y 0 likes, lo que indica una adopción muy limitada y ausencia de una comunidad activa que pueda reportar errores o mejoras.
- Longitud de contexto no documentada: se desconoce la ventana máxima de tokens soportada, lo que puede afectar a tareas con documentos largos.

## Enlaces

- Hugging Face: https://huggingface.co/stdnan/rubiobert-tiny-mlm
- Modelo base: https://huggingface.co/alexyalunin/RuBioBERT
- Paper de referencia sobre leyes de escalado (Chinchilla, Hoffmann et al., 2022): no disponible enlace directo en la información proporcionada.
