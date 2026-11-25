# SZLHOLDINGS/sentra-r1

## Resumen

Sentra-r1 es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base `unsloth/Qwen3.5-0.8B`. Se distribuye como un repositorio de adaptadores, no como un modelo completo: los pesos del modelo base no se incluyen y deben descargarse por separado. El entrenamiento se realizó con SFT (supervised fine-tuning) usando el stack Unsloth + TRL + Transformers, según las etiquetas del repositorio.

El modelo hereda la arquitectura y el tamaño del Qwen3.5-0.8B (aproximadamente 0,8 mil millones de parámetros), lo que lo sitúa en la gama de modelos pequeños orientados a inferencia en hardware modesto. La model card no documenta qué problema concreto resuelve el ajuste, qué datos se usaron ni qué capacidades se pretenden mejorar, por lo que la información disponible es mínima.

Su relevancia es limitada a efectos prácticos: se trata de un adaptador con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y con una model card que es la plantilla por defecto de Hugging Face sin rellenar. Cualquier evaluación seria requiere descargar el adaptador, fusionarlo con el base y realizar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen3.5-0.8B); el artefacto publicado es un adaptador LoRA sobre PEFT |
| Parametros totales | No disponible (el base es de ~0,8 mil millones; el número exacto del adaptador no se documenta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización aplicable dependería del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado mediante SFT con la librería TRL y el framework Unsloth, según las etiquetas del repositorio (`lora`, `sft`, `trl`, `unsloth`, `peft`). La arquitectura subyacente es la del modelo base `unsloth/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen3.5 en su variante de 0,8 mil millones de parámetros.

No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO, hiperparámetros de entrenamiento ni innovaciones técnicas específicas. La versión de PEFT declarada es 0.22.0. La model card es la plantilla estándar de Hugging Face con todos los campos marcados como "[More Information Needed]", por lo que no hay información verificable sobre el procedimiento de ajuste más allá de las etiquetas.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y la etiqueta `conversational` sugiere uso en diálogo multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Herencia de capacidades del base: al ser un adaptador sobre Qwen3.5-0.8B, las capacidades reales (razonamiento, código, matemáticas, multilingüismo) dependen del modelo base, no documentadas en este repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Prototipado rápido en local: al ser un adaptador sobre un modelo de ~0,8B, se puede fusionar y ejecutar en una GPU de consumo para validar pipelines de generación de texto antes de escalar a modelos mayores.
- Experimentación con fine-tuning: sirve como ejemplo de flujo Unsloth + TRL + PEFT para equipos que quieran replicar el proceso de SFT sobre un modelo pequeño.
- Evaluación comparativa de adaptadores: útil para medir el impacto de un ajuste SFT concreto frente al base sin ajustar en tareas de conversación.
- Despliegue en entornos con recursos limitados: un modelo de esta escala puede ejecutarse en CPU o GPU modesta, adecuado para demos internas o pruebas de concepto.
- Investigación sobre alineación y estilo: si el SFT se orientó a un estilo de respuesta concreto, puede usarse para estudiar cambios de comportamiento respecto al base (requiere validación empírica).
- Base para ajustes posteriores: el adaptador puede servir como punto de partida para un segundo ciclo de fine-tuning con datos propios del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; para el base de ~0,8B, en FP16 se estiman del orden de 1,6-2 GB de pesos, y en cuantizaciones de 4 bits por debajo de 1 GB, aunque estas cifras son estimaciones generales para modelos de ese tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por escala, el base cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay validación publicada.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del base, pero no confirmado por el autor.
- Opciones de despliegue: el adaptador requiere PEFT + Transformers para cargarse; para producción habría que fusionarlo con el base y desplegarlo con vLLM, TGI, llama.cpp u Ollama, aunque no hay guías ni configuraciones publicadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/sentra-r1 | ~0,8B (base) | No disponible | No disponible | Adaptador LoRA (safetensors) | Cero descargas, model card sin rellenar |
| unsloth/Qwen3.5-0.8B | ~0,8B | No disponible en esta ficha | Según el repositorio de Unsloth | Safetensors | Modelo base del adaptador |
| Qwen3.5 (familia) | Varias escalas | No disponible en esta ficha | Según el repositorio oficial de Qwen | Safetensors, GGUF (según distribución) | Familia de referencia del base |

No se dispone de datos de rendimiento comparativos para Sentra-r1, por lo que la comparativa se limita a parámetros de disponibilidad y formato.

## Limitaciones y advertencias

- Model card vacía: todos los campos de la plantilla están sin rellenar, incluidos los de sesgos, riesgos, datos de entrenamiento y evaluación.
- Sin licencia declarada: no se puede asumir uso comercial permitido; la ausencia de licencia es un bloqueo legal para producción.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por parte de la comunidad.
- Riesgo de alucinación: inherente a modelos de ~0,8B, agravado por la falta de evaluación publicada.
- Idiomas no documentados: no se puede confirmar el soporte de castellano ni de otros idiomas.
- Dependencia del base: el comportamiento final depende de `unsloth/Qwen3.5-0.8B`, cuyas condiciones de uso y limitaciones deben consultarse por separado.
- Sin datos de entrenamiento: imposible auditar qué datos se usaron, con el consiguiente riesgo de sesgos desconocidos.
- Formato adaptador: requiere pasos adicionales de carga (PEFT) o fusión antes del despliegue, lo que añade complejidad operativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/sentra-r1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- PEFT (librería): https://github.com/huggingface/peft
- TRL (librería): https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Paper de referencia citado en las etiquetas (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
