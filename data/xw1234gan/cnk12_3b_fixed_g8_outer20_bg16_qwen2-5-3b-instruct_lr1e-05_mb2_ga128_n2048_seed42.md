# xw1234gan/CNK12_3B_Fixed_G8_outer20_bg16_Qwen2.5-3B-Instruct_lr1e-05_mb2_ga128_n2048_seed42

## Resumen

El modelo identificado como `xw1234gan/CNK12_3B_Fixed_G8_outer20_bg16_Qwen2.5-3B-Instruct_lr1e-05_mb2_ga128_n2048_seed42` es un ajuste fino (fine-tune) de 3.085.938.688 parámetros construido sobre `Qwen2.5-3B-Instruct`. Lo publica el usuario `xw1234gan` en Hugging Face dentro de una familia de artefactos experimentales con nombres que codifican hiperparámetros de entrenamiento (learning rate, micro-batch, acumulación de gradiente, semilla), lo que sugiere un barrido de experimentos de ajuste supervisado o de optimización con refuerzo más que un modelo de producto final.

Se trata de un transformer decoder-only de la familia Qwen2, distribuido en formato `safetensors` y pensado para generación de texto conversacional (`text-generation`, `conversational`). Su interés práctico no está en superar a modelos frontera, sino en servir como base pequeña y ligera (unos 6,2 GB de checkpoint en precisión de 16 bits) para experimentación reproducible con semilla fija y configuraciones de entrenamiento documentadas en el propio nombre del repositorio.

La model card es la plantilla automática de Hugging Face y no aporta información sobre datos de entrenamiento, evaluación ni licencia. Cualquier uso en producción debería partir de verificar el comportamiento real del checkpoint y de resolver la ambigüedad legal heredada del modelo base (Qwen2.5-3B-Instruct, Apache 2.0), ya que este derivado no declara licencia propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (dato real de los safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens segun modelos de la misma familia y autor; no confirmado en la model card de este checkpoint |
| Tipos de cuantizacion | No se publican variantes cuantizadas. El checkpoint se distribuye en `safetensors` (~2 bytes por parametro, compatible con FP16/BF16) y es convertible a GGUF, AWQ o GPTQ con herramientas estandar |
| Idiomas soportados | No disponible en la model card; por herencia de Qwen2.5, el modelo base es multilingue (chino, ingles y otras lenguas europeas), sin verificar en este fine-tune |
| Licencia | No disponible. El modelo base Qwen2.5-3B-Instruct se publica bajo Apache 2.0, pero este derivado no declara terminos |
| Formato de pesos | `safetensors` (libreria `transformers`); tamano del repo 6,2 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención completa, normalización RMSNorm, activaciones SwiGLU y embeddings de tokens atados o no según configuración estándar de la familia (el detalle exacto no se especifica en la información disponible). No hay indicios de mezcla de expertos, capas recurrentes ni mecanismos híbridos. El checkpoint se sirve únicamente en `transformers` y no incluye ficheros GGUF ni adaptadores LoRA separados.

No se documenta ningún aspecto del entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo RLHF, DPO o GRPO. La única información disponible es la codificación del nombre del repositorio, que sugiere: `lr1e-05` (learning rate 1e-5), `mb2` (micro-batch 2), `ga128` (acumulación de gradiente 128, lo que daría un batch efectivo de 256 secuencias), `n2048` (probablemente longitud máxima de secuencia de 2048 tokens durante el ajuste) y `seed42` (semilla 42 para reproducibilidad). Los segmentos `G8`, `outer20` y `bg16` apuntan a alguna variante de agrupación ocurrícula por grupos de 8 y 20 iteraciones externas, pero es una interpretación no verificada. Debe tratarse como hipótesis, no como hecho.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste de instrucciones de Qwen2.5-3B-Instruct.
- Razonamiento básico y resolución de problemas de complejidad media, limitado por el tamaño de 3B parámetros.
- Generación y explicación de código en lenguajes habituales, sin garantías de corrección en proyectos grandes.
- Aritmética y matemáticas elementales a moderadas; no hay evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: el modelo base lo soporta de forma nativa, pero este fine-tune no lo documenta ni lo verifica.
- Capacidad multilingüe heredada del modelo base (chino e inglés como lenguas principales), no evaluada en este checkpoint.
- No dispone de visión, audio ni modo "thinking" explícito.
- Compatible con Text Generation Inference y con el ecosistema de endpoints de Hugging Face según las etiquetas del repo.

## Casos de uso

- Experimentación reproducible en investigación: el nombre del repositorio fija learning rate, batch efectivo y semilla, lo que permite replicar el ajuste y compararlo contra otros checkpoints del mismo autor.
- Generación de texto asistida en local: con 3B parámetros y 6,2 GB en FP16, puede ejecutarse en una GPU de consumo para prototipos de redacción, resumen y reescritura sin depender de APIs externas.
- Chatbot de dominio acotado: útil como base para ajuste adicional (LoRA) en atención al cliente interna, con la advertencia de que la calidad conversacional del fine-tune concreto no está evaluada.
- Asistente de código en entornos con recursos limitados: puede integrarse en editores o pre-commit hooks para sugerencias y explicaciones, siempre con revisión humana.
- Generación de datos sintéticos para pipelines de destilación o aumento de dataset, aprovechando su bajo coste de inferencia.
- Clasificación y extracción de información mediante prompting: convertir tareas de etiquetado en generación estructurada, con validación posterior del esquema de salida.
- Base para pruebas A/B de configuraciones de entrenamiento: al existir variantes del mismo autor (por ejemplo, `cnk12_GRPO_KL_Qwen2.5-3B-Instruct_beta0.01_...`), sirve para comparar efectos de hiperparámetros como beta de KL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es la plantilla automática de Hugging Face y no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. Cualquier cifra atribuida a este checkpoint sin una evaluación propia reproducible debe considerarse no fiable.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos; con caché KV para 8.192 tokens de contexto se recomienda contar con 10-12 GB.
- VRAM en cuantización INT8: en torno a 3,5-4 GB de pesos, más caché KV.
- VRAM en cuantización INT4 (GGUF Q4_K_M): en torno a 2 GB de pesos; viable en GPUs de 6-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para FP16; A10G, L4, A100 o H100 para despliegue con concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores en FP16, y en GPUs de 8 GB si se cuantiza a INT8/INT4.
- Opciones de despliegue: `transformers` (referencia), vLLM o Text Generation Inference para serving con batching continuo, llama.cpp/Ollama tras convertir a GGUF. Las etiquetas del repo (`text-generation-inference`, `endpoints_compatible`) apuntan a compatibilidad con TGI y endpoints de Hugging Face.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (CNK12 3B) | 3,09 B | 32.768 (heredado, no confirmado) | No disponible | Hugging Face, solo `safetensors` | Sin evaluación publicada; nombre codifica hiperparámetros |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 nativo, extensible a 131.072 con YaRN | Apache 2.0 | Hugging Face,官方 GGUF y múltiples formatos | Modelo base del que deriva; con evaluación publicada por Alibaba |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 | Licencia comunitaria Llama 3.2 | Hugging Face, GGUF oficiales y comunitarios | Multilingüe, más contexto nativo; requiere aceptar licencia |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 | MIT | Hugging Face, GGUF y variantes | Fuertemente entrenado en datos sintéticos y de razonamiento; licencia permisiva |

La comparación de rendimiento cuantitativo no está disponible: no existen resultados de benchmarks publicados para este fine-tune, por lo que no es posible situarlo frente a las alternativas con datos. A igualdad de tamaño, la ventaja de este checkpoint es la trazabilidad de su configuración de entrenamiento; la desventaja es la ausencia total de documentación, evaluación y licencia explícita.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido. Aunque el modelo base Qwen2.5-3B-Instruct es Apache 2.0, este derivado no especifica términos y el autor no documenta la procedencia de los datos de ajuste.
- Model card vacía: no hay información sobre datos de entrenamiento, filtrado, sesgos ni evaluación. Imposible auditar el modelo.
- Riesgo de alucinación propio de un modelo de 3B parámetros, especialmente en dominios especializados y en cadenas de razonamiento largas.
- Capacidad multilingüe no verificada; el comportamiento en castellano puede degradarse respecto al modelo base si el ajuste se hizo con datos mayoritariamente en inglés o chino.
- Posible sobreajuste al conjunto de ajuste: la configuración con batch efectivo de 256 y learning rate 1e-5 sobre un modelo de 3B puede producir olvido catastrófico si el dataset era pequeño; no hay forma de comprobarlo con la información disponible.
- Contexto efectivo dudoso: si el ajuste se realizó con `n2048`, el rendimiento más allá de 2.048 tokens puede degradarse aunque la arquitectura soporte 32.768.
- Nombre del repositorio no descriptivo: dificulta la trazabilidad y la citación académica; no hay DOI, paper ni blog asociado.
- Sin cuantizaciones oficiales ni garantía de compatibilidad con vLLM o llama.cpp sin conversión manual.
- Sin métricas de seguridad ni de sesgo; no recomendable para aplicaciones de cara al público sin una capa de moderación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xw1234gan/CNK12_3B_Fixed_G8_outer20_bg16_Qwen2.5-3B-Instruct_lr1e-05_mb2_ga128_n2048_seed42
- Perfil del autor en Hugging Face: https://huggingface.co/xw1234gan
- Variante relacionada con GRPO y KL beta 0.01 (3B): https://huggingface.co/xw1234gan/cnk12_GRPO_KL_Qwen2.5-3B-Instruct_beta0.01_lr1e-05_mb2_ga128_n2048_seed42
- Variante relacionada con GRPO y KL beta 0.01 (7B): https://huggingface.co/xw1234gan/cnk12_GRPO_KL_Qwen2.5-7B-Instruct_beta0.01_lr1e-05_mb2_ga128_n2048_seed42
- Variante sin KL (NoKL): https://friendli.ai/models/xw1234gan/cnk12_GRPO_KL_Qwen2.5-3B-Instruct_beta0_lr1e-05_mb2_ga128_n2048_seed42_NoKL
- Checkpoint SFT relacionado: https://featherless.ai/models/xw1234gan/cnk12_Main_fixed_SFTanchor_3B_step_1
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Referencia citada en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML CO2: https://mlco2.github.io/impact
