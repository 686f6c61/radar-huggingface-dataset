# unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2

## Resumen

`unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2` es un ajuste fino completo (full fine-tuning) del modelo denso Qwen3-8B, publicado por el usuario `unamed12` en HuggingFace. El nombre del repositorio codifica la receta de entrenamiento: un ajuste supervisado (SFT) sobre un conjunto de aproximadamente 1.500 muestras, seguido de una etapa de preferencias tipo DPO (denominada `pdpo`) con `beta=0.05`, tasa de aprendizaje `5e-7` y 2 épocas. El prefijo `reasoning` sugiere que el objetivo es reforzar la capacidad de razonamiento del modelo base.

El modelo se distribuye como un checkpoint completo en formato `safetensors`, generado con LLaMA-Factory y compatible con `transformers` y Text Generation Inference. El repositorio ocupa 114,7 GB, un tamano coherente con un modelo de 8B parámetros almacenado en varios formatos de precisión. El acceso está restringido: es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo.

Se trata de un experimento de investigación con cero descargas y cero valoraciones en el momento de redactar esta ficha, sin model card descriptiva ni resultados de benchmarks declarados. Su interés es principalmente el de documentar una receta concreta de post-entrenamiento (SFT + DPO) sobre Qwen3-8B, no el de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B); sin datos especificos del ajuste |
| Parametros totales | 308.224 segun el recuento de safetensors del repositorio; no coherente con el modelo base Qwen3-8B (~8.200 millones), por lo que el dato debe considerarse no fiable |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen3-8B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible en el repositorio; al derivar de Qwen3-8B es compatible con cuantizaciones GGUF/AWQ/GPTQ aplicadas a posteriori |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B cubre 119 idiomas) |
| Licencia | other (distinta de la licencia del modelo base, que es Apache 2.0) |
| Formato de pesos | safetensors (checkpoint completo de transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso con atención de grupos de consulta (GQA), 36 capas y modo de razonamiento explícito ("thinking mode") activable mediante tokens especiales. Sobre esa base, el autor aplica un pipeline de post-entrenamiento en dos fases. La primera es un SFT sobre un conjunto de aproximadamente 1.500 ejemplos (indicado por `sftcs1.5k`), con un learning rate bajo de `5e-7` y 2 épocas, lo que apunta a un ajuste conservador para evitar el olvido catastrófico. La segunda fase es una optimización de preferencias denotada `pdpo` con `beta=0.05`; el prefijo `p` podría referirse a una variante de DPO (por ejemplo, process-level o pairwise), pero la informacion proporcionada no permite confirmar la implementación concreta.

El entrenamiento se realizó con LLaMA-Factory en modo `full` (todos los pesos actualizados, no LoRA) y el modelo resultante se marca como `generated_from_trainer`. No se dispone de información sobre la composición exacta del dataset, el número total de tokens vistos, la presencia de RLHF adicional ni innovaciones técnicas propias más allá de la receta de ajuste. Tampoco se documenta si se preservó el modo de razonamiento del modelo base o si se alteró su formato de plantilla.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del modelo base Qwen3-8B.
- Razonamiento explícito: el nombre del repositorio indica un entrenamiento orientado a `reasoning`, aunque no se aportan evaluaciones que lo cuantifiquen.
- Generación de código y matemáticas: capacidad presente en Qwen3-8B, presumiblemente conservada tras el ajuste, sin datos verificables en la informacion disponible.
- Soporte de tool calling y function calling: disponible en el modelo base; no se confirma que el ajuste lo preserve.
- Capacidades multilingües: el modelo base cubre 119 idiomas, pero el efecto del ajuste sobre idiomas distintos del inglés o chino es no disponible.
- Modo thinking: Qwen3-8B incorpora un modo de razonamiento extenso; no se documenta si este checkpoint lo mantiene, lo desactiva o lo modifica.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma verificable para este checkpoint.

## Casos de uso

- Investigación en post-entrenamiento: replicar o comparar la receta SFT + DPO con `beta=0.05` y `lr=5e-7` frente a otras configuraciones sobre Qwen3-8B, usando este checkpoint como punto de referencia experimental.
- Estudio de olvido catastrófico: evaluar si un ajuste completo de 2 épocas sobre 1.500 muestras degrada capacidades del modelo base como el multilingüismo o el tool calling, comparando ambos checkpoints con el mismo harness.
- Generación de razonamiento en dominios acotados: si el dataset de SFT está especializado, el modelo puede usarse para producir cadenas de razonamiento en ese dominio concreto, siempre tras validación empírica.
- Base para ajustes posteriores: al ser un checkpoint completo en safetensors, puede servir como punto de partida para LoRA o DPO adicionales en lugar de partir de Qwen3-8B original.
- Evaluación de robustez y alucinación: útil como caso de estudio de cómo un DPO con beta bajo afecta la calibración y la verbosidad del razonamiento.
- Despliegue interno de bajo riesgo: al estar gated y sin benchmarks, solo tiene sentido en entornos controlados de I+D, no en atención al cliente ni en pipelines de producción orientados a usuarios finales.
- Reproducción de experimentos con LLaMA-Factory: el repositorio documenta implícitamente una configuración reproducible (full, lr 5e-7, beta 0.05, 2 épocas) que otros grupos pueden reutilizar como línea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model-index del repositorio declara una entrada con la lista de resultados vacía:

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | no disponible |

No deben inferirse cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de razonamiento a partir del nombre del modelo ni del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: alrededor de 16-17 GB solo para pesos, más KV cache; en la práctica, 20-24 GB para contextos moderados.
- VRAM en cuantización de 8 bits: aproximadamente 9-10 GB de pesos; en 4 bits (GGUF Q4), alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo y throughput alto; L40S o RTX 6000 Ada como alternativas.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto limitado, y en RTX 3090/4080 o superiores si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (formato nativo), vLLM y Text Generation Inference para serving en FP16; llama.cpp u Ollama si se generan cuantizaciones GGUF a partir del checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.
- Nota: el repositorio pesa 114,7 GB, por lo que la descarga y el almacenamiento requieren planificación independientemente de la VRAM de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2 | 308.224 segun safetensors (no fiable); base ~8B | no disponible | sin benchmarks publicados | other | gated, 0 descargas |
| Qwen/Qwen3-8B (modelo base) | ~8,2 B | 32.768 nativo, 131.072 con YaRN | benchmarks publicados por Qwen | Apache 2.0 | publico |
| Qwen3-8B ajustado con LoRA (comunidad) | ~8,2 B + adaptador | el del base | variable, habitualmente sin publicar | segun autor | publico |
| Otros checkpoints de razonamiento sobre Qwen3-8B | ~8,2 B | el del base | no disponible | variable | variable |

La comparación relevante es contra el propio Qwen3-8B: este checkpoint no documenta mejoras medibles, su licencia es más restrictiva (`other` frente a Apache 2.0) y su acceso está condicionado, por lo que en igualdad de rendimiento el modelo base es la opción preferible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia de que el ajuste mejore el razonamiento respecto a Qwen3-8B; podría incluso degradarlo.
- Recuento de parámetros inconsistente: el dato de safetensors (308.224) no cuadra con un modelo de 8B, lo que sugiere un repositorio mal empaquetado o un recuento parcial; conviene verificar los archivos antes de confiar en el checkpoint.
- Riesgo de alucinación: inherente a los modelos de 8B y potencialmente agravado por un DPO con `beta=0.05` y solo 1.500 muestras de SFT, insuficientes para un alineamiento robusto.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que no se describe.
- Idiomas: no se especifica qué idiomas cubre el ajuste; el multilingüismo del base puede haberse visto reducido por el fine-tuning completo.
- Licencia `other`: no es Apache 2.0 como el modelo base, y las condiciones concretas no están detalladas en la informacion disponible; es obligatorio revisarlas antes de cualquier uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones, lo que limita la reproducibilidad y la integración automatizada.
- Sin model card: no se documentan datos de entrenamiento, plantilla de chat, tokens especiales ni configuración de generación recomendada.
- No apto para producción: cero descargas, cero validaciones de la comunidad y ausencia de evaluaciones independientes.
- Posible sobreajuste: 2 épocas completas sobre 1.500 muestras con actualización de todos los pesos es una receta propensa a memorización.

## Enlaces

- HuggingFace: https://huggingface.co/unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
