# TOTORONG/Solon_Next_v6

## Resumen

Solon-Next_v6 es un modelo de lenguaje desarrollado por TOTORONG, creado como un fine-tune del checkpoint cuantizado RadixArk/Qwen3.8-Flash-Next-NVFP4. El objetivo principal es mejorar el conocimiento y la comprensión del coreano, la historia coreana y las áreas STEM, manteniendo la eficiencia de la cuantización NVFP4 original. El modelo utiliza una arquitectura MoE (mixture of experts) de tipo Qwen3.8-Flash-Next / `qwen4_exp_text`, con un total de 119.602.003.859 parámetros, distribuidos en 48 capas y 512 expertos.

El entrenamiento se realizó directamente sobre el checkpoint NVFP4, sin desconvertir el modelo completo a BF16, usando Axolotl y FSDP2 en dos NVIDIA RTX PRO 6000 Blackwell de 96 GB. Se aplicó LoRA/rsLoRA sobre los expertos enrutados y se fusionaron los adaptadores con una re-cuantización NVFP4 que preserva las escalas originales. El modelo incorpora además una tabla PLE / n-gram embedding de gran tamaño (320.001.536 × 160 en FP8), gestionada mediante host mmap durante el entrenamiento. Su relevancia radica en ofrecer un modelo bilingüe coreano-inglés con capacidades STEM mejoradas, sin renunciar a la ventaja de memoria de NVFP4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-Flash-Next / `qwen4_exp_text` |
| Parametros totales | 119.602.003.859 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (ModelOpt) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | other |
| Formato de pesos | safetensors |
| Modelo base | RadixArk/Qwen3.8-Flash-Next-NVFP4 |
| Tamaño del repositorio | 135.2 GB |
| Framework de entrenamiento | Axolotl + FSDP2 |
| GPUs de entrenamiento | 2 × NVIDIA RTX PRO 6000 Blackwell 96 GB |

## Arquitectura y entrenamiento

Solon-Next_v6 se basa en la arquitectura Qwen3.8-Flash-Next, una variante MoE con 48 capas y 512 expertos enrutados por capa. Los pesos de los expertos se mantienen en representación NVFP4 durante todo el proceso de fine-tuning, lo que evita la conversión completa a BF16 y reduce los requisitos de memoria. El modelo incluye una gran tabla PLE / n-gram embedding de forma lógica 320.001.536 × 160, almacenada en FP8, que se mantiene como tabla host mmap-backed y solo se transfieren a GPU las filas necesarias por lote.

El entrenamiento se llevó a cabo con Axolotl 0.19.0.dev0 y FSDP2, utilizando un adaptador LoRA con r=24, alpha=12 y rsLoRA. Se aplicaron objetivos de LoRA sobre las proyecciones gate_up y down de los expertos enrutados, además de targets en atención y linear-attention. Se usó Cut Cross Entropy para reducir el consumo de memoria en los logits de vocabulario completo, y la ruta de expertos se entrenó mediante ScatterMoE con kernels CUTLASS FP4 agrupados. El dataset de entrenamiento no se detalla en la información disponible, pero se indica que se añadieron datos de lengua coreana, historia coreana y STEM. No se menciona el uso de RLHF ni DPO.

Una innovación técnica destacable es el proceso de fusión del adaptador LoRA: los pesos NVFP4 originales se descuantizan temporalmente, se añade el delta de LoRA y se re-cuantizan a NVFP4 de nuevo. Para las proyecciones gate_proj y up_proj, que se fusionan como `w13` en la implementación de inferencia, se calcula una escala global compartida a partir del máximo conjunto de ambos, garantizando que las escalas coincidan. El proceso se verificó en las 24.576 parejas gate/up resultantes, con una tasa de coincidencia del 100%.

## Capacidades

- Generación de texto y conversación en coreano e inglés, con un enfoque específico en lengua y cultura coreana.
- Conocimiento mejorado de historia coreana, lo que permite responder preguntas sobre eventos, personajes y períodos históricos.
- Razonamiento en áreas STEM (ciencia, tecnología, ingeniería y matemáticas), reforzado durante el fine-tuning.
- Soporte de conversaciones multi-turno gracias a su naturaleza de modelo de lenguaje generativo.
- Compatibilidad con el ecosistema vLLM para servir el modelo en producción, según documenta el autor.
- No se documenta en la información disponible soporte de tool calling, visión, audio u otras capacidades multimodales.

## Casos de uso

- Atención al cliente bilingüe para empresas surcoreanas: el modelo puede gestionar conversaciones en coreano e inglés, lo que resulta adecuado para soporte técnico o comercial con clientes internacionales.
- Tutor virtual de STEM para estudiantes coreanos: puede explicar conceptos de matemáticas, física o química en coreano, aprovechando el conocimiento STEM añadido durante el fine-tuning.
- Asistente de investigación histórica: historiadores pueden consultar información sobre historia coreana y obtener respuestas contextualizadas en coreano, útil para trabajos académicos o divulgación.
- Generación de documentación técnica en coreano: redacción de manuales, guías o artículos científicos en coreano, con vocabulario técnico de dominio.
- Traducción especializada coreano-inglés: apoyo en la traducción de textos académicos, históricos o científicos, manteniendo la terminología específica de cada campo.
- Análisis de textos administrativos o legislativos coreanos: extracción de información de documentos históricos o normativos, gracias a su comprensión del coreano y de la historia coreana.
- Chatbot educativo para escuelas: respuestas a preguntas de historia y ciencias en coreano, con un tono conversacional adecuado para entornos de aprendizaje.

## Benchmarks y rendimiento

Se ha realizado una evaluación completa de KMMLU utilizando lm-evaluation-harness con vLLM como backend de inferencia. Los resultados son los siguientes:

| Grupo KMMLU | Precisión |
|---|---|
| Overall | 68.33% |
| Applied Science | 65.86% |
| Humanities / Social Sciences | 72.09% |
| Other | 67.48% |
| STEM | 69.99% |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporciona una cifra oficial. Con 119.6B parámetros en NVFP4, los pesos ocupan aproximadamente 60 GB, a lo que hay que sumar la tabla PLE (47.7 GiB) y las activaciones. Se recomiendan GPUs con al menos 96 GB de VRAM.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell 96 GB, la misma usada en el entrenamiento, u otras GPUs equivalentes con 96 GB o más.
- GPUs de consumo: no es viable en GPUs de consumo típicas (24 GB o menos) debido al tamaño del modelo y la tabla PLE.
- Opciones de despliegue: vLLM (mencionado en la documentación del autor), con soporte para el formato de pesos safetensors y cuantización NVFP4.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de comparación con otros modelos en la información disponible. El modelo base es RadixArk/Qwen3.8-Flash-Next-NVFP4, y Solon-Next_v6 es un fine-tune del mismo. No se dispone de benchmarks del modelo base ni de otras alternativas comparables para establecer una comparativa.

## Limitaciones y advertencias

- Sesgos: no documentados. Al ser un fine-tune con datos coreanos, puede heredar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de alucinación para este modelo.
- Limitaciones de idioma: solo se garantiza un rendimiento adecuado en coreano e inglés. El uso en otros idiomas no está evaluado.
- Longitud de contexto: no se especifica en la información disponible. El valor de sequence_len de entrenamiento (2816) no debe confundirse con la ventana de contexto real del modelo.
- Licencia: la licencia es "other", sin términos detallados. Es necesario revisar la licencia antes de cualquier uso comercial.
- Precisión: al tratarse de un fine-tune sobre un checkpoint cuantizado NVFP4, el proceso de re-cuantización tras la fusión de LoRA puede introducir pérdida de precisión en los pesos.
- Gestión de memoria: la tabla PLE de gran tamaño (47.7 GiB) puede requerir estrategias de offloading o mmap durante el despliegue para evitar agotar la VRAM.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/TOTORONG/Solon_Next_v6
- Modelo base: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios) en la búsqueda web realizada.
