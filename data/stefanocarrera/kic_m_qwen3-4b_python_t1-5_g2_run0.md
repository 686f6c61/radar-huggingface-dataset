# stefanocarrera/kic_M_Qwen3-4B_python_t1.5_g2_run0

## Resumen

El modelo `stefanocarrera/kic_M_Qwen3-4B_python_t1.5_g2_run0` es un ajuste fino (fine-tuning) del modelo base `unsloth/qwen3-4b-base-unsloth-bnb-4bit`, que a su vez deriva de la familia Qwen3 de Alibaba. Lo publica el usuario stefanocarrera en Hugging Face bajo licencia Apache 2.0. Por el nombre del repositorio (`python_t1.5_g2_run0`) se infiere que se ha entrenado sobre datos relacionados con Python, aunque la model card no documenta el dataset, el procedimiento ni los hiperparámetros empleados.

Se trata de un modelo de 4.000 millones de parámetros con arquitectura transformer densa (no MoE), derivado de la generación Qwen3. El entrenamiento se realizó con Unsloth, una librería de optimización que acelera el fine-tuning, y el resultado se distribuye en formato safetensors para su uso con la librería `transformers` y con text-generation-inference (TGI). El repositorio ocupa 0,1 GB, lo que sugiere pesos cuantizados o un subconjunto de los mismos, y no se han publicado descargas ni valoraciones.

Su relevancia es limitada: se trata de un experimento de ajuste fino de autor individual, sin benchmarks publicados, sin model card detallada y sin documentación del proceso de entrenamiento. Resulta útil como ejemplo de pipeline de fine-tuning con Unsloth sobre Qwen3, pero no como modelo listo para producción sin una evaluación previa por parte de quien lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen3) |
| Parámetros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | el modelo base se distribuye en 4 bits (bnb-4bit); el repositorio ocupa 0,1 GB, lo que apunta a pesos cuantizados o parciales |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer denso de 4.000 millones de parámetros. El modelo se ha obtenido mediante fine-tuning supervisado (SFT) con TRL sobre el checkpoint `unsloth/qwen3-4b-base-unsloth-bnb-4bit`, un base model cuantizado en 4 bits que Unsloth prepara para entrenamiento con bajo consumo de memoria. La model card indica explícitamente que el entrenamiento se realizó con Unsloth, lo que implica el uso de kernels optimizados y técnicas de ahorro de memoria como LoRA/QLoRA, aunque no se especifica si se aplicó LoRA, QLoRA o full fine-tuning.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas adicionales. El sufijo `python_t1.5_g2_run0` sugiere un experimento centrado en código Python con parámetros de configuración concretos (posiblemente temperatura 1.5 y un grupo o semilla 2), pero se trata de una inferencia a partir del nombre y no de un dato documentado.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-4B.
- Razonamiento y generación de código, presumiblemente reforzados por el ajuste fino orientado a Python (no verificado con benchmarks).
- Soporte de tool calling y function calling: no documentado en la model card, aunque el modelo base Qwen3 lo incluye; no se puede garantizar que el fine-tuning lo preserve.
- Modo thinking (razonamiento extendido): Qwen3 lo incorpora en su versión instruct; no se confirma su presencia en este ajuste.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el base Qwen3 es multilingüe.
- Capacidades de agente y razonamiento multi-paso: no documentadas.

## Casos de uso

- Prototipado de asistentes de código en Python: el ajuste fino sobre datos de Python permite experimentar con generación de snippets y autocompletado en entornos de desarrollo, siempre con validación humana del código producido.
- Generación de tests unitarios: se puede emplear para producir borradores de pruebas a partir de funciones existentes, integrado en un pipeline de CI que marque los tests para revisión.
- Enseñanza y ejemplos didácticos: útil para generar ejercicios y explicaciones de Python en inglés, dado el enfoque del ajuste fino y el idioma declarado.
- Investigación sobre fine-tuning con Unsloth: sirve como referencia reproducible para estudiar cómo afecta un SFT corto a un base model cuantizado en 4 bits.
- Experimentos de destilación o comparación de checkpoints: al ser un `run0`, encaja en una batería de experimentos que comparen distintas configuraciones de entrenamiento sobre el mismo base.
- Despliegue en entornos con recursos limitados: con 4.000 millones de parámetros y pesos ligeros, puede ejecutarse en una GPU de consumo para demos internas, no para producción crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8 GB para los pesos, más overhead de activaciones y KV cache (10-12 GB en la práctica).
- VRAM estimada en 4 bits: en torno a 2,5-3 GB para los pesos, más overhead (4-6 GB en total).
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o superiores para fp16; RTX 3060 de 12 GB o superior para cuantización en 4 bits.
- Cabe en GPU de consumo: sí, en modelos con al menos 8 GB de VRAM en cuantización de 4 bits.
- Opciones de despliegue: `transformers`, text-generation-inference (TGI), vLLM, llama.cpp y Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| stefanocarrera/kic_M_Qwen3-4B_python_t1.5_g2_run0 | 4.000 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | 4.000 M | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado |
| unsloth/qwen3-4b-base-unsloth-bnb-4bit | 4.000 M | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.2-3B | 3.000 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face |

La comparación con Qwen3-4B original es la más directa: mismo tamaño y licencia, pero el original cuenta con model card completa, benchmarks publicados y soporte de la comunidad. Llama-3.2-3B es una alternativa de tamaño similar con contexto documentado de 128.000 tokens, aunque con licencia más restrictiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al base model en ninguna tarea.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros ni metodología, lo que impide reproducir el ajuste.
- Riesgo de olvido catastrófico: un SFT sobre un base model cuantizado en 4 bits puede degradar capacidades generales del modelo original.
- Idiomas: declarado solo en inglés; el rendimiento en castellano no está garantizado.
- Alucinación: como cualquier LLM de 4.000 millones de parámetros, puede generar código y afirmaciones incorrectas con apariencia de veracidad.
- Licencia Apache 2.0: permite uso comercial, pero el adoptante asume toda la responsabilidad sobre el comportamiento del modelo y sobre posibles sesgos heredados del base.
- Sin descargas ni validación de la comunidad: no hay señales externas de calidad.
- Formato: el repositorio de 0,1 GB no incluye pesos GGUF, por lo que el despliegue con llama.cpp u Ollama requiere conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefanocarrera/kic_M_Qwen3-4B_python_t1.5_g2_run0
- Modelo base: https://huggingface.co/unsloth/qwen3-4b-base-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Familia Qwen3 (Alibaba): https://huggingface.co/Qwen
