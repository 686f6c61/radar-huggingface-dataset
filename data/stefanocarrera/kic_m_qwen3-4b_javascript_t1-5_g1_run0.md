# stefanocarrera/kic_M_Qwen3-4B_javascript_t1.5_g1_run0

## Resumen

`stefanocarrera/kic_M_Qwen3-4B_javascript_t1.5_g1_run0` es un ajuste fino (fine-tuning) del modelo base Qwen3-4B, desarrollado por el usuario stefanocarrera y publicado en Hugging Face. El modelo parte de la versión cuantizada a 4 bits de Qwen3-4B-base distribuida por Unsloth (`unsloth/qwen3-4b-base-unsloth-bnb-4bit`) y ha sido entrenado con la librería Unsloth y TRL. Por el nombre del repositorio (`javascript_t1.5_g1_run0`) se infiere que el ajuste está orientado a tareas relacionadas con JavaScript, aunque la model card no documenta el dataset ni los hiperparámetros empleados.

Se trata de un modelo de la familia Qwen3, una arquitectura transformer densa de 4 mil millones de parámetros desarrollada originalmente por Alibaba Qwen. El contexto nativo de Qwen3-4B es de 32 768 tokens, ampliable hasta 131 072 mediante YaRN. El modelo se publica con licencia Apache 2.0 y está etiquetado únicamente para inglés, aunque la familia Qwen3 es multilingüe por diseño.

La relevancia de esta ficha es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación del proceso de entrenamiento. Resulta útil como ejemplo de pipeline de fine-tuning con Unsloth sobre Qwen3-4B, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4 000 millones (aproximado, heredado de Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens nativos; hasta 131 072 con YaRN (heredado del base) |
| Tipos de cuantizacion | El base de partida está en 4 bits (bnb-4bit); el repo publicado contiene safetensors, cuantización adicional no documentada |
| Idiomas soportados | en (según model card); el base Qwen3-4B es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B: un transformer denso con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU. Qwen3 incorpora además un modo de razonamiento híbrido (thinking / non-thinking) en los modelos instruct, aunque al partir de la variante `base` este ajuste no garantiza conservar dicha funcionalidad. El contexto nativo es de 32 768 tokens, extensible a 131 072 mediante YaRN.

El entrenamiento se realizó con Unsloth y TRL, según indican las etiquetas y la model card. El autor afirma que el entrenamiento fue "2x más rápido con Unsloth", lo que sugiere el uso de LoRA o QLoRA sobre el base cuantizado a 4 bits. No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni los hiperparámetros. El sufijo `javascript_t1.5_g1_run0` apunta a un ajuste orientado a generación de código JavaScript, pero no hay confirmación en la documentación.

## Capacidades

- Generación de texto y razonamiento general, heredados del base Qwen3-4B.
- Generación de código, presumiblemente con énfasis en JavaScript según el nombre del repositorio (no verificado).
- Soporte de tool calling y function calling: no documentado en este ajuste; el base Qwen3 lo soporta, pero el fine-tuning puede haberlo degradado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingües: la model card declara únicamente inglés; el base Qwen3-4B soporta más idiomas, pero no se garantiza tras el ajuste.
- Modo thinking: no documentado; el base de partida es la variante `base`, no la `instruct`.

## Casos de uso

- Experimentación con pipelines de fine-tuning: sirve como referencia para reproducir un ajuste con Unsloth y TRL sobre Qwen3-4B cuantizado a 4 bits, útil para desarrolladores que quieran montar su propio flujo de entrenamiento.
- Prototipado de asistentes de código JavaScript: el modelo puede emplearse en entornos de desarrollo para autocompletar o explicar fragmentos de JavaScript, siempre con evaluación previa por la falta de benchmarks.
- Investigación sobre ajuste de dominio: útil para estudiar cómo un fine-tuning pequeño sobre un base de 4B afecta al rendimiento en tareas específicas, comparándolo con el base original.
- Generación de documentación técnica: puede redactar comentarios y documentación a partir de código, aprovechando el contexto de 32k tokens del base.
- Base para nuevos ajustes: al estar en Apache 2.0 y ser un modelo pequeño, puede servir como punto de partida para fine-tunings posteriores en dominios concretos.
- Despliegue en hardware limitado: con 4B parámetros y cuantización a 4 bits, cabe en GPUs de consumo para pruebas locales de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 8-9 GB para los 4B parámetros más overhead de activaciones y KV cache.
- VRAM estimada en 4 bits (como el base de partida): aproximadamente 3-4 GB, más KV cache.
- GPU recomendadas: RTX 4090, RTX 3090, A10G, L4 para fp16; A100 o H100 para despliegues con mayor concurrencia o contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, especialmente con cuantización a 4 bits.
- Opciones de despliegue: transformers, vLLM, llama.cpp (requiere conversión a GGUF), Ollama (requiere GGUF), TGI (etiqueta `text-generation-inference` presente).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| stefanocarrera/kic_M_Qwen3-4B_javascript_t1.5_g1_run0 | ~4B | 32 768 (131 072 con YaRN) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado |
| Qwen/Qwen3-4B | ~4B | 32 768 (131 072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| meta-llama/Llama-3.2-3B | ~3B | 131 072 | Llama 3.2 Community License | Hugging Face | Requiere aceptar licencia; restricciones comerciales |
| google/gemma-3-4b-it | ~4B | 131 072 | Gemma Terms of Use | Hugging Face | Licencia con restricciones de uso |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de que el ajuste mejore al base en ninguna tarea; podría haber degradado capacidades generales.
- Documentación mínima: no se especifican dataset, hiperparámetros, número de épocas ni método de evaluación.
- Riesgo de alucinación: inherente a los modelos de 4B, agravado por la falta de evaluación tras el ajuste.
- Idiomas: la model card declara solo inglés; el uso en castellano no está garantizado.
- Tool calling y modo thinking: no verificados tras el fine-tuning; pueden haberse perdido respecto al base.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el base Qwen3-4B y el checkpoint de Unsloth cumplen las mismas condiciones.
- Modelo experimental: cero descargas y cero likes en el momento de la consulta; no hay señales de uso en producción ni de mantenimiento.
- Fecha de creación anómala (2026-11-17): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/stefanocarrera/kic_M_Qwen3-4B_javascript_t1.5_g1_run0
- Modelo base (Unsloth): https://huggingface.co/unsloth/qwen3-4b-base-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Familia Qwen3 (Alibaba): https://huggingface.co/Qwen
