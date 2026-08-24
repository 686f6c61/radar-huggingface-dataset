# Terve0916/Qwen3-4B-Base-GRPO-GSM8K-LoRA

## Resumen

El modelo `Terve0916/Qwen3-4B-Base-GRPO-GSM8K-LoRA` es un fine-tuning del modelo base Qwen3-4B (desarrollado por Alibaba Cloud) aplicando la técnica de optimización por refuerzo GRPO (Group Relative Policy Optimization) sobre el dataset de razonamiento matemático GSM8K. El autor, Terve0916, ha publicado este adaptador LoRA con licencia Apache 2.0, lo que permite su uso comercial y modificación sin restricciones significativas.

Este modelo aborda el problema de mejorar las capacidades de razonamiento aritmético y matemático de un modelo de 4 mil millones de parámetros mediante entrenamiento con refuerzo, una alternativa a los métodos de supervisión tradicionales. Su relevancia radica en que demuestra cómo se puede especializar un modelo base compacto en tareas concretas de razonamiento con recursos computacionales limitados, ya que el entrenamiento con LoRA y GRPO puede ejecutarse en hardware de consumo.

La arquitectura subyacente es la de Qwen3-4B, un transformer denso con 4.000 millones de parámetros y una ventana de contexto de 32.768 tokens. El adaptador LoRA añade un número reducido de parámetros entrenables, por lo que el modelo resultante mantiene el mismo tamaño de inferencia que el base. No se dispone de información adicional sobre el proceso de entrenamiento específico de este adaptador más allá de lo que indica su nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B base) con adaptador LoRA |
| Parametros totales | 4.000 millones (base) + parametros LoRA (no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | No especificados para este adaptador; el base soporta cuantizacion estandar (4-bit, 8-bit) |
| Idiomas soportados | No especificados; el base Qwen3-4B soporta principalmente ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B, un transformer denso con 4.000 millones de parametros, 36 capas, 40 cabezas de atencion y una dimension de embedding de 2.560. Qwen3 incorpora un modo de pensamiento (thinking mode) que permite al modelo generar cadenas de razonamiento internas antes de responder, y un modo no-pensante para respuestas rapidas. El adaptador LoRA se entrena sobre el modelo base congelado, modificando solo una fraccion de los pesos mediante matrices de bajo rango.

El entrenamiento utiliza GRPO, un algoritmo de optimizacion por refuerzo que agrupa multiples respuestas generadas para una misma pregunta y calcula ventajas relativas, evitando la necesidad de un modelo critico separado. El dataset GSM8K contiene aproximadamente 7.500 problemas matematicos de nivel escolar con soluciones paso a paso. No se especifican los hiperparametros exactos del entrenamiento (numero de pasos, tasa de aprendizaje, rango del LoRA, etc.) en la informacion disponible.

## Capacidades

- Razonamiento matematico: resuelve problemas aritmeticos y algebraicos de nivel escolar, con especial enfasis en problemas de varias etapas.
- Generacion de cadenas de razonamiento: al heredar el modo thinking de Qwen3, puede producir explicaciones paso a paso antes de dar la respuesta final.
- Comprension de lenguaje natural: mantiene las capacidades generales del modelo base para entender instrucciones y preguntas en formato textual.
- No se ha confirmado soporte para tool calling, function calling, ni capacidades multimodales en este adaptador especifico.
- El modelo base Qwen3-4B soporta multilingueismo limitado (principalmente ingles y chino), pero no se ha verificado el comportamiento del adaptador en otros idiomas.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede generar soluciones detalladas para problemas de aritmetica, algebra y geometria, util como asistente para estudiantes o para generar ejercicios con soluciones explicadas.
- Evaluacion de modelos de razonamiento: al estar especializado en GSM8K, puede servir como referencia para comparar tecnicas de fine-tuning con refuerzo en modelos pequenos.
- Prototipado de agentes de razonamiento: combinado con un framework de agentes, puede utilizarse para tareas que requieran descomponer problemas complejos en pasos logicos, aunque su alcance se limita a dominios matematicos.
- Generacion de datos sinteticos de entrenamiento: puede usarse para crear pares pregunta-respuesta con razonamiento explicito, alimentando pipelines de datos para otros modelos.
- Investigacion en optimizacion por refuerzo: sirve como ejemplo de aplicacion de GRPO con LoRA sobre un modelo base, reproducible en hardware modesto.
- Integracion en pipelines de QA (pregunta-respuesta) especializados en matematicas: por ejemplo, en sistemas de tutoria inteligente que necesiten resolver problemas paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta metricas en GSM8K ni en otros conjuntos de evaluacion. Se desconoce si el adaptador mejora significativamente el rendimiento del modelo base en esta tarea, aunque es el objetivo esperado del entrenamiento con GRPO.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en precision FP16 requiere aproximadamente 8 GB de VRAM. Con cuantizacion 4-bit, puede reducirse a unos 3-4 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3070, RTX 4060 Ti, A10). Para cuantizacion 4-bit, una GPU con 4 GB (como RTX 3050) puede ser suficiente.
- Es compatible con GPUs de consumo medio y alto; no requiere hardware de datacenter.
- Opciones de despliegue: al ser un adaptador LoRA, puede cargarse sobre el modelo base Qwen3-4B usando librerias como PEFT (Hugging Face), vLLM (con soporte para LoRA), llama.cpp (si se fusiona el adaptador en un GGUF), u Ollama (mediante conversion previa).
- Latencia y throughput: no se dispone de mediciones especificas. En una RTX 4090, el modelo base Qwen3-4B en FP16 suele generar entre 30 y 60 tokens por segundo, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica de entrenamiento | Licencia |
|---|---|---|---|---|
| Terve0916/Qwen3-4B-Base-GRPO-GSM8K-LoRA | 4B | 32k | GRPO + LoRA sobre GSM8K | Apache 2.0 |
| tahamajs/Qwen3-4b-gsm8k-Qlora-GRPO | 4B | 32k | QLoRA + GRPO sobre GSM8K | No especificada |
| Qwen/Qwen3-4B (base) | 4B | 32k | Preentrenamiento general | Apache 2.0 |

Ambos adaptadores (el de Terve0916 y el de tahamajs) parten del mismo modelo base y utilizan GRPO con GSM8K, diferenciandose en el uso de LoRA vs QLoRA (cuantizacion durante el entrenamiento). No se dispone de resultados comparativos de rendimiento entre ellos. El modelo base Qwen3-4B sirve como referencia de partida.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de seguridad; al ser un fine-tuning sobre un modelo base, puede heredar sesgos presentes en los datos de preentrenamiento de Qwen3.
- Riesgo de alucinacion en problemas matematicos complejos o fuera del dominio de GSM8K; el modelo puede generar razonamientos plausibles pero incorrectos.
- Limitacion de idioma: el modelo base esta optimizado para ingles y chino; su rendimiento en otros idiomas puede ser deficiente.
- El adaptador esta disenado especificamente para GSM8K; su generalizacion a otros tipos de razonamiento (logica, codigo, etc.) no esta garantizada.
- No se proporciona informacion sobre el proceso de entrenamiento (datos exactos, hiperparametros, numero de pasos), lo que dificulta la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tambien esta bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Para uso en produccion, se recomienda validar el rendimiento en el dominio especifico y considerar la fusion del adaptador con el modelo base para simplificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Terve0916/Qwen3-4B-Base-GRPO-GSM8K-LoRA
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Adaptador similar (tahamajs): https://huggingface.co/tahamajs/Qwen3-4b-gsm8k-Qlora-GRPO
- Notebook de Unsloth para GRPO con Qwen3-4B: https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen3_(4B)-GRPO.ipynb
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio de ejemplo de fine-tuning con GRPO: https://github.com/waqqasansari/qwen3-grpo-finetune
