# wenlongzhao/ARPO-reproduce_Qwen3-8B_SFT_code-config

## Resumen

`wenlongzhao/ARPO-reproduce_Qwen3-8B_SFT_code-config` es un checkpoint de investigación que reproduce el paso de *supervised fine-tuning* (SFT) del método ARPO (Agentic Reinforced Policy Optimization) sobre el modelo base Qwen/Qwen3-8B. El autor, `wenlongzhao`, lo publica como referencia para la comunidad que quiera replicar o estudiar el pipeline de ARPO, un enfoque de optimización de políticas para agentes de IA.

El modelo es un ajuste fino completo (*full-parameter SFT*) de los 8.190.735.360 parámetros de Qwen3-8B, realizado con LLaMA-Factory, DeepSpeed ZeRO-3 y precisión BF16. Se entrenó sobre el dataset `dongguanting/ARPO-SFT-54K`, que combina Tool-Star 54K y STILL, el mix oficial de SFT de ARPO. Esta variante concreta se denomina "code" porque utiliza una configuración específica (máximo de secuencia de 15.000 tokens, *global batch* 16 y *weight decay* 0), en contraposición a una variante "paper" que replica el Apéndice E.2 del artículo.

Su relevancia radica en que sirve como punto de partida para experimentos de *agentic RL* y para comparar configuraciones de SFT en modelos de 8B. No está pensado como un modelo de chat autónomo, sino como un componente reproducible dentro de una línea de investigación más amplia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (máximo de secuencia de entrenamiento: 15.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only con 8.190.735.360 parámetros. No se introduce ninguna modificación arquitectónica: el ajuste es un *full-parameter SFT* con LLaMA-Factory, utilizando DeepSpeed ZeRO-3 y precisión BF16. El entrenamiento se realizó sobre el dataset `dongguanting/ARPO-SFT-54K`, compuesto por Tool-Star 54K y STILL, que es la mezcla oficial de SFT para ARPO.

Los hiperparámetros declarados son: *learning rate* 7e-6 con *schedule* coseno y *warmup ratio* 0,1; 3 épocas; *global batch size* 16; longitud máxima de secuencia 15.000 tokens; *weight decay* 0,0; precision BF16; *seed* 42. La pérdida final de entrenamiento fue 0,4241. La innovación técnica no está en la arquitectura, sino en la configuración de entrenamiento orientada a agentes: la variante "code" usa una longitud de secuencia mayor y sin *weight decay*, lo que permite estudiar el efecto de estos hiperparámetros en el comportamiento agéntico posterior.

## Capacidades

- Generación de texto: el modelo es un *checkpoint* de texto, compatible con el pipeline `text-generation` de Transformers.
- Orientación a agentes: entrenado con Tool-Star 54K y STILL, datasets de uso de herramientas y razonamiento agéntico, por lo que está diseñado para tareas de *tool calling* y planificación multi-paso.
- Soporte de *tool calling*: no verificado explícitamente en la información disponible, pero el dataset de entrenamiento lo sugiere.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento y generación de código: la variante "code" está pensada para entornos de agentes de código, aunque no se han publicado evaluaciones específicas.

## Casos de uso

- Investigación en RL agéntico: usar este checkpoint como referencia para reproducir el pipeline de ARPO y comparar resultados con la variante "paper" o con otros métodos de optimización de políticas.
- Punto de partida para *fine-tuning* posterior: aplicar RL (como el propio ARPO) sobre este SFT para mejorar el rendimiento en tareas de uso de herramientas.
- Evaluación de *tool calling* en entornos controlados: probar la capacidad del modelo para invocar funciones y seguir instrucciones agénticas tras el SFT, en *benchmarks* como Tool-Star o similares.
- Desarrollo de agentes de código: gracias a la configuración "code" y al dataset de entrenamiento, puede explorarse su uso en tareas de generación de código con herramientas integradas.
- Comparación de configuraciones de SFT: contrastar este *checkpoint* con `ARPO-reproduce_Qwen3-8B_SFT_paper-config` para analizar el impacto de la longitud de secuencia y el *weight decay* en el comportamiento agéntico.
- Estudio de interpretabilidad: analizar cómo el SFT modifica las representaciones internas de Qwen3-8B en tareas de razonamiento agéntico, sirviendo como base para investigaciones de *mechanistic interpretability*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado como modelo de chat independiente, por lo que no existen datos de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,19B parámetros en BF16, los pesos ocupan aproximadamente 16,4 GB. Sumando *KV cache* y *overhead* de inferencia, se estima un mínimo de 24 GB de VRAM para secuencias cortas, siendo recomendable 40 GB o más para contextos largos.
- GPU recomendadas: A100 40GB, A100 80GB, H100 80GB o RTX 4090 (esta última solo para secuencias cortas y con posibles limitaciones de memoria).
- En *consumer GPU*: una RTX 4090 de 24 GB puede ejecutarlo con secuencias moderadas, pero sin cuantización el margen es ajustado. No se han publicado versiones cuantizadas (GGUF, AWQ, etc.).
- Opciones de despliegue: Transformers, vLLM, Text Generation Inference (TGI) y llama.cpp (si se convierte a GGUF manualmente).
- Latencia y *throughput*: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `wenlongzhao/ARPO-reproduce_Qwen3-8B_SFT_code-config` | 8,19B | no disponible (max seq entrenamiento: 15.000) | Apache 2.0 | Variante "code" del SFT de ARPO, sin *weight decay* |
| `wenlongzhao/ARPO-reproduce_Qwen3-8B_SFT_paper-config` | 8,19B | no disponible | Apache 2.0 | Variante "paper" que replica el Apéndice E.2 de ARPO |
| `Qwen/Qwen3-8B` (base) | 8,19B | no disponible | Apache 2.0 | Modelo base sin SFT; no está orientado a agentes |

No se dispone de datos de rendimiento comparativos, ya que ninguno de los tres modelos presenta benchmarks públicos en la información consultada.

## Limitaciones y advertencias

- No evaluado como modelo de chat independiente: el autor advierte que es un *checkpoint* de investigación y no debe usarse como un asistente de conversación genérico.
- Sesgos y alucinaciones: no se han realizado evaluaciones de sesgos ni de riesgo de alucinación; el modelo puede heredar sesgos del dataset de entrenamiento y del modelo base.
- Limitaciones de contexto: la longitud máxima de secuencia de entrenamiento es de 15.000 tokens; el rendimiento con contextos superiores no está garantizado.
- Restricciones de licencia: aunque el modelo se publica bajo Apache 2.0, hay que respetar las licencias del modelo base (Qwen3-8B) y del dataset de entrenamiento (`ARPO-SFT-54K`), que pueden tener condiciones adicionales.
- Validación limitada: el repositorio no tiene descargas ni *likes*, y no se aportan evaluaciones externas, por lo que su utilidad en producción es dudosa.
- Dependencia de la configuración: la variante "code" puede no ser óptima para todas las tareas agénticas; la variante "paper" puede comportarse de forma diferente.

## Enlaces

- HuggingFace: https://huggingface.co/wenlongzhao/ARPO-reproduce_Qwen3-8B_SFT_code-config
- Paper ARPO: https://arxiv.org/abs/2507.19849
- Dataset de entrenamiento: https://huggingface.co/datasets/dongguanting/ARPO-SFT-54K
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Variante "paper": https://huggingface.co/wenlongzhao/ARPO-reproduce_Qwen3-8B_SFT_paper-config
