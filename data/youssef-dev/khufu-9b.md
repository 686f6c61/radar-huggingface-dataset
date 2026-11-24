# Youssef-dev/Khufu-9B

## Resumen

Khufu-9B es un adaptador LoRA publicado por el desarrollador independiente Youssef-dev sobre el checkpoint base Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (0,3 GB) que deben cargarse sobre el modelo base fijado en una revisión concreta. El proyecto se presenta como una release de investigación orientada a experimentación con matemáticas, ciencia y programación en Python, y está pensado para inferencia local y evaluación.

El adaptador se ha entrenado mediante fine-tuning supervisado continuado (SFT) con LoRA: 160 ejemplos, 312 pasos de optimizador y unos 59 minutos sobre dos Tesla T4. El autor también menciona variantes con edición directa de pesos en checkpoints separados, cuyos resultados reporta por separado. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

La relevancia de esta ficha es doble. Por un lado, documenta un adaptador de nicho con muy poca tracción (0 descargas, 0 likes en el momento de la consulta) y con resultados autoinformados que no están verificados. Por otro, sirve como ejemplo de buenas prácticas de trazabilidad: el autor fija la revisión exacta del modelo base y separa explícitamente los resultados del adaptador publicado de los de otras variantes del proyecto, algo que conviene tener en cuenta al evaluar cualquier release de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-9B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base declara 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | El ejemplo oficial usa 4-bit NF4 con doble cuantizacion (bitsandbytes); otras cuantizaciones no disponibles |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-9B, un transformer decoder-only del que la información disponible no detalla capas, dimensiones ni mecanismo de atención. La clase de carga que aparece en el ejemplo oficial es `Qwen3_5ForConditionalGeneration`, lo que sugiere una arquitectura multimodal o con cabecera generativa, pero no se aportan más detalles. El adaptador en sí es un LoRA estándar gestionado con PEFT, con configuración incluida en el repositorio.

El entrenamiento consistió en SFT continuado con LoRA sobre 160 ejemplos, 312 pasos de optimizador y aproximadamente 59 minutos en dos Tesla T4. No se documentan la composición del dataset, el número de tokens, la tasa de aprendizaje, el rango del LoRA ni si hubo etapas de RLHF o DPO. El autor menciona además experimentos con edición directa de pesos en checkpoints separados, que no forman parte de esta descarga. La revisión del modelo base está fijada (`c202236235762e1c871ad0ccb60c8ee5ba337b9a`), lo que facilita la reproducibilidad de la carga.

## Capacidades

- Generación de texto en inglés con modo de razonamiento opcional: el tokenizador admite `enable_thinking=True` para respuestas de razonamiento extendido.
- Razonamiento matemático: el autor orienta el adaptador a resolución de problemas de matemáticas, con ejemplos de álgebra y verificación de respuestas.
- Razonamiento científico: orientado a preguntas de ciencia, con resultados reportados en GPQA Diamond.
- Generación de código en Python: el proyecto declara experimentación con programación y verificación de código.
- Tool calling: el autor indica que calculadora, navegador y herramientas de verificación de código requieren un harness externo; no se documenta un protocolo de function calling nativo.
- Capacidades de agente: no documentadas de forma explícita; el razonamiento multi-paso depende de la configuración de generación y del harness.
- Multilingüismo: limitado al inglés según la model card.
- Capacidades especiales: modo thinking, y en las variantes del proyecto se menciona inferencia asistida por herramientas para matemáticas y verificación de código.

## Casos de uso

- Evaluación de adaptadores LoRA en investigación: cargar el adaptador sobre la revisión fijada de Qwen3.5-9B permite reproducir el entorno exacto del autor y comparar el efecto del fine-tuning frente al modelo base en tareas de matemáticas y código.
- Resolución de problemas matemáticos con verificación: el modelo puede resolver ecuaciones paso a paso y comprobar el resultado, como en el ejemplo oficial `3(x - 2) = 15`; útil para prototipos de tutores o asistentes de estudio en inglés.
- Generación de código Python en local: con 4-bit NF4 cabe en GPUs de consumo y sirve para experimentar con asistencia de código en entornos sin acceso a APIs externas.
- Razonamiento científico para preguntas de opción múltiple: adecuado para pruebas internas de pipelines de evaluación tipo GPQA, siempre que se valide el protocolo de evaluación.
- Base para fine-tuning posterior: al ser un adaptador ligero sobre un modelo de 9B, es un punto de partida económico para experimentar con SFT adicional en dominios técnicos.
- Investigación sobre edición de pesos: el proyecto documenta variantes con edición directa de pesos, por lo que el adaptador sirve como referencia para estudiar la diferencia entre SFT con LoRA y ediciones manuales.
- Despliegue educativo en hardware modesto: el ejemplo oficial está pensado para una sola GPU con cuantización 4-bit, lo que permite montar demos docentes de razonamiento y código sin infraestructura dedicada.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a distintas ejecuciones y checkpoints del proyecto, no necesariamente al adaptador publicado. La propia model card advierte que el adaptador liberado tiene resultados verificados por separado, pero no los incluye en el texto disponible.

| Benchmark | Khufu (runs del proyecto) | Qwen3.5-9B base | DeepSeek-R1-Distill-Qwen-7B | Nemotron-Nano-9B-v2 |
|---|---:|---:|---:|---:|
| MATH-500 | 95-97% | 96,6% | 92,8% | 97,8% |
| GPQA Diamond | 91,5% | 81,7% | 49,1% | no disponible |
| AA-Omniscience (net index) | -50 | -53 (v1) | no disponible | no disponible |
| LiveCodeBench v6 | 73% | 65,6% | no disponible | no disponible |

Notas del autor: el resultado de GPQA Diamond se obtuvo con edición de pesos y un setup de evaluación personalizado, y checkpoints anteriores del proyecto se entrenaron con parte del material de Diamond. El resultado de LiveCodeBench empleó razonamiento, herramientas y verificación de código en un setup extendido. El índice AA-Omniscience procede de una versión de evaluación, un grader y un checkpoint no verificados. Los artefactos exactos de las ejecuciones están pendientes de publicación.

## Requisitos de hardware

- VRAM estimada: con cuantización 4-bit NF4 del modelo base de 9B, el ejemplo oficial apunta a una sola GPU; una estimación razonable es 7-9 GB de VRAM para pesos más overhead de activaciones, aunque el autor no publica una cifra exacta.
- GPU recomendadas: el entrenamiento se hizo en dos Tesla T4; para inferencia, cualquier GPU con al menos 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) debería ser suficiente en 4-bit. Para FP16 harían falta del orden de 18-20 GB, lo que requiere A100, H100 o RTX 4090 de 24 GB.
- Cabe en GPU de consumo: sí, en 4-bit en tarjetas de 12 GB o más; en FP16 solo en tarjetas de 24 GB.
- Opciones de despliegue: el flujo oficial usa Transformers 5.17.0, PEFT 0.18.1, Accelerate y bitsandbytes. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT, la integración con vLLM requeriría conversión o carga del adaptador según el soporte de la versión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MATH-500 | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Khufu-9B | Adaptador LoRA sobre Qwen3.5-9B | 9B (base) | no disponible | 95-97% (autoinformado) | 91,5% (autoinformado, con edición de pesos) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-9B | Modelo completo | 9B | no disponible | 96,6% | 81,7% | no disponible en la informacion | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | Modelo completo | 7B | no disponible | 92,8% | 49,1% | no disponible en la informacion | Hugging Face |
| NVIDIA Nemotron-Nano-9B-v2 | Modelo completo | 9B | no disponible | 97,8% | no disponible | no disponible en la informacion | Hugging Face |

La comparación debe tomarse con cautela: los resultados de Khufu son autoinformados, proceden de ejecuciones distintas y en algunos casos incluyen herramientas o edición de pesos, mientras que los del modelo base y de los alternativos provienen de protocolos estándar.

## Limitaciones y advertencias

- Resultados no verificados: las cifras de MATH-500, GPQA Diamond, AA-Omniscience y LiveCodeBench son autoinformadas, con protocolos heterogéneos y artefactos pendientes; no deben tratarse como comparables a benchmarks estándar.
- Contaminación potencial: el propio autor reconoce que checkpoints anteriores del proyecto se entrenaron con parte del material de GPQA Diamond, lo que invalida ese resultado como medida limpia de generalización.
- Dataset de entrenamiento mínimo: 160 ejemplos y 312 pasos de optimizador es un volumen muy reducido; el riesgo de sobreajuste y de degradación de capacidades generales es alto.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea inferior al del modelo base.
- Dependencia del modelo base: requiere la revisión exacta de Qwen3.5-9B; cambios en el checkpoint base pueden romper la compatibilidad del adaptador.
- Tool calling no nativo: las herramientas de cálculo, navegación y verificación de código necesitan un harness externo; no hay evidencia de function calling integrado.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de calibración; el modo thinking puede aumentar la longitud de las respuestas sin garantizar corrección.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-9B, que no se detalla en la información disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin issues ni discusión comunitaria que permitan validar el comportamiento en producción.
- Sesgos: no se documenta ninguna evaluación de sesgos; al ser un fine-tuning sobre un modelo base no auditado en este repositorio, los sesgos heredados no están caracterizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssef-dev/Khufu-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia MATH-500 citado por el autor: https://arxiv.org/html/2606.01774v1
- Resultados de DeepSeek-R1 (distillados): https://github.com/deepseek-ai/DeepSeek-R1#evaluation-results
- Resultados de NVIDIA Nemotron-Nano-9B-v2: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2#evaluation-results
- Comparativa Artificial Analysis Qwen3.5-9B vs Step-3.5-Flash: https://artificialanalysis.ai/models/comparisons/qwen3-5-9b-vs-step-3-5-flash
- Benchmark MATH-500 en Kaggle: https://www.kaggle.com/benchmarks/open-benchmarks/math-500
- GPQA Diamond en OpenCharts: https://www.opencharts.com/benchmarks/tests/gpqa-diamond
- GPQA Diamond en Epoch AI: https://epoch.ai/benchmarks/gpqa-diamond
- Resultados de GLM-5.3-Flash en Epoch AI: https://epoch.ai/models/glm-5-3-flash
- Benchmark LiveCodeBench en Vals: https://www.vals.ai/benchmarks/lcb
