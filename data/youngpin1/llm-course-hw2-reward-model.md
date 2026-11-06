# youngpin1/llm-course-hw2-reward-model

## Resumen

`youngpin1/llm-course-hw2-reward-model` es un modelo de recompensa (reward model) obtenido por fine-tuning supervisado del modelo instruct `HuggingFaceTB/SmolLM-135M-Instruct` mediante la librería TRL (0.15.2) en su modalidad `reward-trainer`. Lo publica el usuario `youngpin1` como entrega de un trabajo práctico de un curso de LLM, y su función es puntuar respuestas generadas por otros modelos para servir de señal de recompensa en pipelines de RLHF/DPO o en sistemas de reranking.

El modelo no genera texto de forma conversacional en su uso previsto: se expone con pipeline `text-classification` y devuelve una puntuación escalar por respuesta evaluada. Su interés práctico es acotado: con 134.516.160 parámetros (un modelo de 135M), es un artefacto ligero, entrenable y desplegable en CPU o en GPU de consumo, útil para prototipar pipelines de alineamiento o para estudiar el flujo completo de entrenamiento de un reward model con TRL sin incurrir en costes de cómputo elevados.

Conviene subrayar que se trata de un modelo educativo: no hay datos publicados de benchmarks, no se declara licencia explícita en los metadatos y no se especifican idiomas soportados. La ficha documenta lo que el autor declara y marca como "no disponible" todo lo que no consta en la información de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM-135M-Instruct), con cabeza de clasificación/reward sobre la representación final |
| Parametros totales | 134.516.160 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM-135M-Instruct; el autor no la declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantización estándar vía transformers/bitsandbytes o conversión a GGUF, no documentada por el autor) |
| Idiomas soportados | no disponible (no declarados) |
| Licencia | no disponible (la model card contiene un campo `licence: license` sin valor efectivo) |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Librería / framework | transformers, TRL 0.15.2, PyTorch 2.11.0+cu130, Datasets 3.3.2, Tokenizers 0.20.3 |
| Tamaño del repositorio | 0.5 GB |

## Arquitectura y entrenamiento

El modelo parte de SmolLM-135M-Instruct, un transformer decoder-only de 135M parámetros de HuggingFaceTB, y se ha reentrenado con el `RewardTrainer` de TRL para producir una puntuación escalar de calidad sobre pares o respuestas. El entrenamiento se realizó sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`, orientado a preferencias sobre respuestas "human-like", usando el flujo estándar de TRL para reward modeling (cabeza de clasificación sobre el último token o sobre el pooling de la secuencia, según configuración por defecto del trainer).

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros, ni si hubo etapas adicionales de RLHF o DPO. Tampoco se describen innovaciones técnicas (atención lineal, decodificación especulativa, etc.). El valor técnico del artefacto es, por tanto, el de un ejemplo reproducible de reward model pequeño entrenado con TRL, no el de una contribución arquitectónica.

## Capacidades

- Puntuación de respuestas: produce una señal escalar de recompensa para evaluar la calidad o el ajuste a preferencias humanas de un texto generado.
- Reranking de candidatos: permite ordenar varias respuestas generadas por otro modelo y seleccionar la mejor según la puntuación del reward model.
- Integración en pipelines de RLHF/DPO: puede usarse como modelo de recompensa en entrenamiento por refuerzo o como referencia en optimización por preferencias.
- Clasificación de texto genérica: al exponerse con pipeline `text-classification`, puede adaptarse a tareas de clasificación binaria o multiclase si se reentrena la cabeza.
- Ejecución ligera: 135M parámetros permiten inferencia en CPU y en GPU de consumo con latencias bajas.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible (no es su propósito).
- Capacidades multilingües: no declaradas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado de pipelines RLHF: usar el modelo como reward model en un ciclo de entrenamiento con TRL para validar la infraestructura completa (generación, puntuación, actualización de política) antes de escalar a modelos mayores.
- Reranking de respuestas en un chatbot: generar N candidatos con un LLM pequeño y ordenarlos con este reward model para mejorar la calidad percibida sin aumentar el tamaño del generador.
- Filtrado de datos sintéticos: puntuar respuestas generadas automáticamente y descartar las de baja calidad antes de incorporarlas a un dataset de fine-tuning, aprovechando su bajo coste de inferencia.
- Evaluación automática de calidad en experimentos académicos: sustituir evaluaciones humanas costosas por una señal automática aproximada en fases tempranas de investigación.
- Docencia y reproducción de experimentos: servir de ejemplo completo y ejecutable de entrenamiento de un reward model con TRL, con un coste de cómputo accesible para estudiantes.
- Clasificación de preferencias en dominios acotados: reentrenar la cabeza sobre un dataset específico (por ejemplo, respuestas de soporte técnico) para obtener un clasificador de calidad ligero y desplegable en CPU.
- Despliegue en entornos con recursos limitados: al caber en memoria de un portátil o de una GPU modesta, permite integrar una señal de recompensa en aplicaciones locales o en el edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 134,5M de parámetros ocupan aproximadamente 0,54 GB; en fp16/bf16, unos 0,27 GB; en cuantización de 8 bits, unos 0,14 GB; en 4 bits, unos 0,07 GB. A ello hay que sumar el overhead del runtime y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas, e incluso en CPU con latencias aceptables.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference` (el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con TEI y endpoints de Hugging Face), y conversión a GGUF para llama.cpp/Ollama si se realiza manualmente (no documentada por el autor). vLLM y TGI no están declarados como soportados para este artefacto.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera latencia de milisegundos por secuencia corta en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| youngpin1/llm-course-hw2-reward-model | 134,5M | no disponible | Reward model (fine-tune de SmolLM-135M-Instruct) | no disponible | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | 2.048 tokens (según model card del base) | LLM instruct | Apache 2.0 (según model card del base) | Hugging Face, ampliamente usado |
| Reward models de referencia (p. ej. ArmoRM, Starling-RM) | 7B-8B | 4K-32K | Reward model | variable según autor | Hugging Face |
| Skywork-Reward-Llama-3.1-8B | 8B | 8K | Reward model | variable según autor | Hugging Face |

La comparación con reward models de 7B-8B es asimétrica: este modelo es dos órdenes de magnitud menor y no compite en calidad de señal, sino en coste y facilidad de despliegue. Frente a su modelo base, la diferencia es funcional (reward frente a generación), no de escala.

## Limitaciones y advertencias

- Modelo educativo: publicado como entrega de un trabajo de curso, sin validación externa ni benchmarks; no debe usarse como señal de recompensa en producción sin evaluación previa.
- Licencia no declarada: el campo `licence: license` de la model card no especifica términos; no se puede asumir uso comercial permitido. Verificar con el autor antes de cualquier uso fuera de investigación.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe; el dataset de preferencias subyacente está mayoritariamente en inglés.
- Riesgo de sesgo: al entrenarse sobre un dataset de preferencias humanas, puede heredar sesgos de los anotadores y del modelo base.
- Riesgo de alucinación y de señal ruidosa: un reward model de 135M tiene capacidad limitada para discriminar matices; puede sobrevalorar respuestas superficialmente plausibles.
- Contexto limitado: heredado de SmolLM-135M-Instruct (2.048 tokens según la model card del base); no apto para evaluar documentos largos.
- Sin datos de entrenamiento detallados: no se conocen hiperparámetros, número de pasos ni composición exacta del dataset, lo que dificulta la reproducibilidad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- La model card incluye un ejemplo de `pipeline("text-generation")`, incoherente con el pipeline declarado `text-classification`; conviene usar la API de clasificación o la del `RewardTrainer` para obtener puntuaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youngpin1/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL RewardTrainer: https://huggingface.co/docs/trl/reward_trainer
