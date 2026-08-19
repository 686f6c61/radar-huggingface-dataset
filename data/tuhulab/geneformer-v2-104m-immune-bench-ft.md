# tuhulab/geneformer-v2-104m-immune-bench-ft

## Resumen

El modelo `tuhulab/geneformer-v2-104m-immune-bench-ft` es un ajuste fino (fine-tuning) del modelo fundacional Geneformer V2 de 104 millones de parámetros, desarrollado originalmente por NVIDIA. Geneformer es un transformer preentrenado a gran escala sobre transcriptomas de células individuales, diseñado para aprender representaciones de genes sensibles al contexto y permitir predicciones específicas de contexto en biología de redes, incluso con conjuntos de datos limitados. Este fine-tuning concreto se orienta a la anotación de células inmunes, como sugiere el sufijo `immune-bench-ft`, probablemente entrenado sobre un benchmark de referencia para clasificación de tipos celulares inmunitarios.

El repositorio tiene un tamaño de 104.4 GB, lo que indica que aloja los pesos completos en formato safetensors, y su acceso está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de poder descargarlo. Aunque la información pública es escasa, la relevancia de este modelo radica en su potencial para aplicaciones de inmunología computacional, donde la anotación precisa de células inmunes a partir de datos de expresión génica es un paso crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Geneformer V2, con optimizaciones de Transformer Engine) |
| Parametros totales | 104 millones (inferido del nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el Geneformer original usa ventanas de 2048 genes) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, probablemente en FP32 o BF16) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | other (especificada en HuggingFace, requiere aceptación de condiciones) |
| Formato de pesos | safetensors (según los tags) |

## Arquitectura y entrenamiento

Geneformer V2 es un modelo transformer basado en la arquitectura original de Geneformer, que procesa secuencias de genes ordenados por su expresión en células individuales. La versión V2 incorpora optimizaciones de NVIDIA Transformer Engine para mejorar la eficiencia de entrenamiento e inferencia. El preentrenamiento se realizó sobre un corpus de aproximadamente 30 millones de transcriptomas de células individuales humanas (según el artículo original), lo que permite al modelo capturar dinámicas de redes génicas.

Este fine-tuning específico (`immune-bench-ft`) se ha ajustado para la tarea de anotación de células inmunes, probablemente utilizando un conjunto de datos de referencia con tipos celulares inmunitarios etiquetados. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición exacta del dataset de fine-tuning, ni si se emplearon técnicas de RLHF o DPO. El acceso restringido sugiere que los autores podrían tener condiciones de uso específicas o que el modelo aún está en fase de validación.

## Capacidades

- Anotación de tipos celulares inmunes a partir de datos de expresión génica de células individuales (inferido del nombre del modelo).
- Generación de representaciones de genes sensibles al contexto, heredadas del preentrenamiento de Geneformer.
- Posible uso en clasificación de células y análisis de redes génicas, aunque no hay confirmación explícita para este fine-tuning.
- No se ha documentado soporte para tool calling, agentes, ni capacidades multimodales (es un modelo puramente biológico).

## Casos de uso

- Anotación de células inmunes en datos de scRNA-seq: el modelo puede clasificar células inmunes (p. ej., células T, B, NK, macrófagos) en conjuntos de datos de transcriptómica de células individuales, facilitando el análisis de poblaciones celulares en estudios de inmunología.
- Descubrimiento de subtipos celulares raros: al estar ajustado sobre un benchmark inmune, podría identificar subpoblaciones menos comunes que los métodos tradicionales pasan por alto.
- Análisis de microambiente tumoral: aplicación en inmuno-oncología para caracterizar la infiltración inmune en muestras de tumor, ayudando a predecir respuestas a inmunoterapia.
- Estudios de enfermedades autoinmunes: clasificación de células inmunes en muestras de pacientes para identificar firmas patológicas.
- Validación de marcadores de superficie: uso del modelo para confirmar o descubrir nuevos marcadores de tipos celulares inmunes a partir de perfiles de expresión.
- Integración en pipelines de análisis bioinformático: el modelo puede incorporarse como un paso de anotación automática en flujos de trabajo de scRNA-seq, reemplazando métodos supervisados que requieren curadores expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El nombre `immune-bench-ft` sugiere que el modelo se evaluó en un benchmark de células inmunes, pero no se proporcionan cifras concretas (exactitud, F1, etc.) en la documentación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio (104.4 GB) sugiere pesos en FP32 o BF16. Para cargar el modelo completo en FP32 se necesitarían al menos 104 GB de VRAM, lo que excede las GPUs de consumo. En BF16 (aproximadamente 52 GB) aún se requeriría una GPU de nivel profesional como A100 (80 GB) o H100 (80 GB). Con cuantización a 8 bits (unos 26 GB) podría caber en una RTX 4090 (24 GB) con margen justo, pero no hay confirmación de que se ofrezcan pesos cuantizados.
- GPU recomendadas: NVIDIA A100 (80 GB) o H100 (80 GB) para FP16/BF16; RTX 4090 o A6000 (48 GB) si se aplica cuantización.
- Opciones de despliegue: al ser un modelo de biología, no se mencionan integraciones con vLLM, llama.cpp u Ollama. El repositorio de Geneformer original ofrece scripts de inferencia en PyTorch, por lo que este modelo probablemente se usa con el mismo framework.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Geneformer V2 104M (NVIDIA) | 104M | 2048 genes (original) | no publicado | CC-BY-NC-SA (original) | Abierto en HuggingFace |
| tuhulab/geneformer-v2-104m-immune-bench-ft | 104M | no disponible | no publicado | other (restringido) | Gated en HuggingFace |
| scGPT (modelo fundacional de células individuales) | ~50M | 2048 genes | publicado en paper | CC-BY-NC | Abierto |

No se dispone de comparaciones cuantitativas entre estos modelos en la información proporcionada. La comparativa se limita a características generales.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, lo que implica que los usuarios deben aceptar condiciones específicas antes de descargarlo. Esto puede limitar su uso en entornos académicos o industriales.
- Documentación insuficiente: no hay información pública sobre el proceso de fine-tuning, los datos utilizados, ni las métricas de evaluación, lo que dificulta la reproducibilidad.
- Sesgos potenciales: al ser un modelo entrenado con datos de transcriptomas, puede heredar sesgos de las poblaciones celulares representadas en el corpus de preentrenamiento, que podría no cubrir todas las etnias o condiciones patológicas.
- Riesgo de alucinación en anotaciones: como cualquier modelo de clasificación, puede producir etiquetas incorrectas en tipos celulares poco representados o en datos con ruido técnico.
- Licencia "other": la licencia no está claramente especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Limitaciones de contexto: si se mantiene la ventana de 2048 genes del Geneformer original, el modelo solo puede procesar células con hasta ese número de genes expresados, lo que excluye células con mayor complejidad.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/tuhulab/geneformer-v2-104m-immune-bench-ft
- Geneformer V2 104M de NVIDIA: https://huggingface.co/nvidia/geneformer_V2_104M
- README de NVIDIA Geneformer V2: https://huggingface.co/nvidia/geneformer_V2_104M/blob/main/README.md
- Repositorio GitHub original de Geneformer: https://github.com/haroonshakeel/Geneformer
- Fork de Geneformer para fine-tuning: https://github.com/yangqi-su/GeneformerFTFork
- Documentación de Geneformer en BioNeMo: https://docs.nvidia.com/bionemo-framework/latest/main/recipes/models/geneformer/geneformer/index.html
