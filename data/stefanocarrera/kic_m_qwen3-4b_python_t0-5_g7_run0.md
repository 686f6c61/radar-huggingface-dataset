# stefanocarrera/kic_M_Qwen3-4B_python_t0.5_g7_run0

## Resumen

kic_M_Qwen3-4B_python_t0.5_g7_run0 es un modelo de generación de texto ajustado (finetune) a partir de Qwen3-4B-Base, publicado en Hugging Face por el usuario stefanocarrera. El modelo base original es Qwen3-4B de Alibaba Cloud, un transformer denso de unos 4.000 millones de parámetros, y el ajuste se ha realizado sobre la versión cuantizada a 4 bits publicada por Unsloth (unsloth/Qwen3-4B-Base-unsloth-bnb-4bit). El nombre del repositorio sugiere que se trata de un fine-tuning orientado a Python, posiblemente con temperatura 0.5 y configuración greedy 7 en la ejecución 0 de un experimento, aunque el autor no documenta estos detalles.

La model card es extremadamente escueta: no incluye descripción del dataset de entrenamiento, ni datos de benchmarks, ni instrucciones de uso. El único dato técnico relevante es que el entrenamiento se realizó con la biblioteca Unsloth, que permite ajustar modelos con TRL (Transformer Reinforcement Learning) de Hugging Face de forma más rápida y con menor consumo de memoria, típicamente mediante LoRA o QLoRA. El modelo emplea safetensors como formato de pesos y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

Con cero descargas registradas y una model card sin documentación sustantiva, este modelo debe tratarse como un artefacto experimental de autor individual. Puede ser de interés para quien quiera replicar el experimento o evaluar fine-tunings ligeros de Qwen3-4B en tareas de código, pero no hay evidencia publicada de que supere al modelo base en ninguna tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | ~4.000 millones (heredados de Qwen3-4B-Base) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | no disponible (Qwen3-4B base soporta 32.768 tokens, extendible a 131.072 con YaRN, pero el autor no lo documenta) |
| Tipos de cuantizacion | Base entrenada sobre pesos bnb-4bit (bitsandbytes); cuantización final del fine-tune no disponible |
| Idiomas soportados | en (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only denso de la familia Qwen3 de Alibaba. El punto de partida concreto es la versión de Unsloth pre-cuantizada a 4 bits con bitsandbytes (bnb-4bit), lo que indica que el entrenamiento probablemente se realizó mediante QLoRA: los pesos base congelados en 4 bits y un pequeño conjunto de adaptadores LoRA entrenables. Esto es coherente con el tamaño del repositorio (0,1 GB), muy inferior a los ~8 GB que ocuparían los pesos completos en fp16, lo que sugiere que el repositorio contiene únicamente los adaptadores LoRA y no el modelo fusionado.

El entrenamiento se ejecutó con Unsloth, que acelera el fine-tuning (el autor indica "2x faster") combinado con TRL de Hugging Face. No se ha publicado información sobre el dataset, el número de tokens, los hiperparámetros ni si hubo etapas de RLHF o DPO. El sufijo "python" en el nombre sugiere un corpus centrado en código Python, pero no hay confirmación documental.

## Capacidades

- Generación de texto en inglés (idioma declarado en la model card).
- Capacidades potenciales de generación de código Python, inferidas del nombre del modelo, aunque no documentadas ni evaluadas por el autor.
- Hereda las capacidades generales del modelo base Qwen3-4B-Base: razonamiento, matemáticas y generación de código, en la medida en que el fine-tuning no haya producido degradación.
- No hay evidencia documentada de soporte de tool calling, function calling, capacidades de agente, visión o audio.
- Al tratarse de un modelo derivado de una versión Base (no instruct/chat), probablemente requiera plantillas de prompt específicas o fine-tuning adicional para seguir instrucciones de forma conversacional.

## Casos de uso

- Experimentación con fine-tuning eficiente: sirve como ejemplo real de un pipeline Unsloth + TRL + QLoRA sobre Qwen3-4B, útil para estudiar configuraciones de entrenamiento de bajo coste.
- Generación de código Python como asistente interno: si el fine-tuning se centró en Python, podría integrarse en un autocompletado privado, aunque habría que validar primero su calidad frente al modelo base.
- Investigación reproducible: punto de partida para comparar adaptadores LoRA entrenados con distintas temperaturas o configuraciones (el nombre sugiere una serie de ejecuciones, "run0").
- Prototipado en hardware limitado: al basarse en pesos cuantizados a 4 bits, permite probar despliegues en GPUs de consumo con poca VRAM.
- Base para evaluación de modelos pequeños de código: candidato para benchmarks propios antes de decidir si un fine-tuning de 4B justifica su uso frente a alternativas mayores.
- Educación y talleres de LLMs: caso práctico de cómo publicar un modelo fine-tuned en Hugging Face con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: si el repositorio contiene solo adaptadores LoRA (~0,1 GB), hay que cargar además el modelo base cuantizado a 4 bits, que requiere aproximadamente 3-4 GB de VRAM. Fusionado en 4 bits, el requisito sería similar; en fp16, unos 8-9 GB.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o más de VRAM (RTX 3060, RTX 4060 Ti o superiores) para inferencia cuantizada; para entrenamiento con QLoRA, una GPU de 12-16 GB (RTX 3090, RTX 4090) es suficiente.
- Cabe en GPUs de consumo: sí, en inferencia cuantizada a 4 bits cabe holgadamente en una RTX 3060 de 12 GB o incluso en modelos de 8 GB.
- Opciones de despliegue: transformers y text-generation-inference (ambos etiquetados en el repo), llama.cpp y Ollama si se convierte a GGUF (conversión no documentada), vLLM si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| stefanocarrera/kic_M_Qwen3-4B_python_t0.5_g7_run0 | ~4B (LoRA) | no disponible | Apache 2.0 | Fine-tune experimental sin documentación ni benchmarks |
| Qwen3-4B (oficial, instruct) | 4B | 32.768 (131.072 con YaRN) | Apache 2.0 | Modelo base documentado, con benchmarks publicados y soporte de thinking mode |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 | Apache 2.0 | Alternativa más grande y específica para código, con benchmarks publicados |
| CodeLlama-7B | 7B | 16.384 | Llama 2 Community | Alternativa clásica para código, sin soporte de instrucciones nativo en la variante base |

## Limitaciones y advertencias

- Documentación prácticamente inexistente: sin dataset, hiperparámetros, benchmarks ni instrucciones de uso, lo que dificulta evaluar su fiabilidad.
- Riesgo elevado de alucinación y degradación: un fine-tuning sin evaluación publicada puede haber introducido regresiones respecto al modelo base (catastrophic forgetting).
- Idioma declarado únicamente en inglés; el rendimiento en castellano no está documentado.
- Al derivar de una versión Base, no está optimizado para conversación ni seguimiento de instrucciones sin una plantilla de prompt adecuada.
- La cuantización bnb-4bit del modelo base implica una ligera pérdida de precisión respecto a fp16.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero al ser un modelo derivado hay que respetar también los términos del modelo base Qwen3 (igualmente Apache 2.0).
- Con 0 descargas, no existe validación comunitaria del artefacto; se recomienda evaluarlo en un entorno controlado antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefanocarrera/kic_M_Qwen3-4B_python_t0.5_g7_run0
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Base-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- Qwen3 oficial: https://huggingface.co/Qwen
