# Urdatorn/sphragis-alm-olmo3-7b-plutarch

## Resumen

Sphragis es un modelo de lenguaje autoral (authorial language model, ALM) desarrollado por Urdatorn para la atribución de autoría en griego antiguo. Forma parte de un conjunto de diecisiete modelos, cada uno entrenado exclusivamente sobre las oraciones de un autor concreto del benchmark Sphragis, siguiendo la metodología de Huang, Murakami y Grieve (2025) que atribuye autoría comparando la perplexidad de cada modelo sobre un texto dado. Este modelo concreto se entrenó sobre 1.300 oraciones de Plutarco, con un total de 225.722 tokens.

Es un modelo de 7.298 millones de parámetros, basado en `allenai/Olmo-3-1025-7B`, y supone una aportación relevante porque permite atribución de autoría con modelos de lenguaje modernos en una lengua clásica con pocos recursos digitales. Su interés radica en la metodología: en lugar de fijar un número de épocas arbitrario, la duración del entrenamiento se decide por validación, lo que resultó en paradas tempranas en época 2 o 3 para los diecisiete modelos. La licencia es restrictiva (other) debido a las licencias mixtas de los textos de entrenamiento, lo que condiciona su reutilización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (OLMo-3-7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (hereda de OLMo-3-7B, se entrena con una oración por secuencia) |
| Tipos de cuantizacion | no publicados (pesos en bf16) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar, heredado de OLMo-3-1025-7B, sobre el que se realizó un full further-pretraining con objetivo de modelado de lenguaje causal sobre secuencias formadas por una única oración del corpus de Plutarco, delimitada con tokens `<|endoftext|>`. El entrenamiento se hizo con precisión mixta (bf16 para cómputo, fp32 para pesos maestros) y FSDP completo sobre 2 GPUs GH200. La selección del mejor checkpoint se hizo por la pérdida en oraciones de validación del propio autor, con paciencia 3 y máximo 20 épocas; el mejor punto se obtuvo en la época 2.0 con una pérdida de validación de 1,0478 nats/token. El tamaño de lote efectivo fue de 16 oraciones y se usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de calentamiento. La innovación principal es metodológica: la duración del entrenamiento se decide por evidencia de validación en lugar de fijar un número de épocas, lo que evita sobreajuste y reduce el coste computacional.

## Capacidades

- Atribución de autoría en griego antiguo: dado un texto, se compara la pérdida de cada uno de los diecisiete modelos Sphragis y se asigna al autor cuyo modelo lo encuentra menos sorprendente.
- Modelado de lenguaje causal específico de un autor: captura patrones estilísticos y léxicos propios de Plutarco.
- Capacidad de scoring de oraciones mediante negativo log-verosimilitud por token, tal como se entrenó.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o visión; es un modelo puramente textual y orientado a una tarea única.

## Casos de uso

- **Atribución de autoría de textos griegos antiguos**: el caso de uso principal. Dado un texto, se puntúa con los diecisiete modelos y se atribuye al autor con menor perplejidad. Es adecuado porque cada modelo está entrenado exclusivamente en el estilo de un autor.
- **Estudios filológicos y de crítica textual**: para autenticar o cuestionar la atribución de fragmentos o pasajes a Plutarco, usando la pérdida del modelo como evidencia cuantitativa.
- **Investigación en estilometría computacional**: sirve como herramienta para comparar la proximidad estilística entre textos y autores, y para validar hipótesis sobre la autoría de obras disputadas.
- **Análisis de la evolución estilística de un autor**: al puntuar diferentes obras atribuidas a Plutarco, se puede estudiar la coherencia estilística interna o detectar interpolaciones.
- **Docencia e investigación en procesamiento de lenguas clásicas**: como ejemplo de fine-tuning de un modelo grande en un corpus reducido y especializado, y de aplicación de perplexidad a tareas de clasificación.
- **Construcción de sistemas de atribución en otras lenguas**: la metodología puede replicarse con otros autores o lenguas, aunque el modelo en sí está limitado a griego antiguo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. La model card indica que, en el conjunto de validación `sentence_1` del benchmark Sphragis, los diecisiete modelos juntos alcanzan un macro-F1 de 0,812 en la tarea de atribución de autoría, pero no se desglosa el rendimiento individual de este modelo ni se compara con otros sistemas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; con 7,3B parámetros en bf16, la inferencia requiere aproximadamente 14,6 GB de memoria solo para los pesos, por lo que cabe en una GPU consumer de 16 GB (RTX 4080/4090) con cuantización.
- **GPUs recomendadas**: para entrenamiento se usaron 2× GH200 (H200). Para inferencia, cualquier GPU con al menos 16 GB de VRAM es suficiente; con cuantización de 4 bits se puede ejecutar en GPUs de 8 GB.
- **Opciones de despliegue**: por ser un modelo basado en OLMo-3, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado la compatibilidad oficial de este checkpoint concreto.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No hay disponibles modelos comparables en la información proporcionada. Se trata de un modelo especializado en una tarea única (atribución de autoría en griego antiguo) y no existe una familia de modelos equivalentes con la misma metodología y licencia abierta. La comparación natural sería con los otros 16 modelos de la familia Sphragis, pero no se han publicado sus especificaciones individuales.

## Limitaciones y advertencias

- **Sesgos conocidos**: al estar entrenado solo con 1.300 oraciones de Plutarco, el modelo refleja el estilo del corpus Sphragis, que puede no ser representativo de toda la obra del autor ni de la variación dialectal del griego antiguo.
- **Riesgo de alucinación**: como modelo generativo, puede producir texto incoherente o falso si se usa para generación libre, aunque no es su propósito; su uso previsto es exclusivamente la puntuación de textos.
- **Limitaciones de contexto**: la secuencia de entrenamiento es de una sola oración, por lo que el modelo no está diseñado para manejar contextos largos; para atribuir un texto extenso habrá que fragmentarlo en oraciones y promediar las pérdidas.
- **Restricciones de licencia**: la licencia es `other`, no Apache-2.0, debido a que el corpus Sphragis contiene material con licencias mixtas, incluyendo CC BY-NC-SA. Esto implica restricciones para uso comercial y para la redistribución de modelos derivados. Hay que consultar el archivo `LICENSES.md` del dataset antes de cualquier uso.
- **Idioma**: exclusivamente griego antiguo; no sirve para otros idiomas.
- **Caveat de producción**: el modelo es un experimento de investigación y no se ha evaluado su robustez en entornos de producción; el macro-F1 de 0,812 es un resultado conjunto, no una garantía de precisión individual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-plutarch
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y scoring: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-3-1025-7B: https://huggingface.co/allenai/Olmo-3-1025-7B
- Referencia metodológica: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
