# Taykhoom/SpliceBERT-1024nt

## Resumen

SpliceBERT-1024nt es un modelo de lenguaje para ARN basado en la arquitectura BERT, entrenado con masked language modeling sobre más de dos millones de secuencias primarias de ARN procedentes de 72 especies de vertebrados. Fue desarrollado originalmente por el grupo biomed-AI (Chen et al., 2024) y posteriormente portado a HuggingFace por Taykhoom Dalal en una versión mínima que mantiene paridad numérica con el checkpoint original. El modelo está diseñado para estudiar el splicing de ARN y otras tareas relacionadas con la secuencia de ARN.

La variante 1024nt es el modelo principal de la familia SpliceBERT, entrenado con fragmentos de longitud variable entre 64 y 1024 nucleótidos, lo que le permite procesar contextos más largos que las variantes de 510nt. Con aproximadamente 19,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, incluidas GPUs de consumo. Su vocabulario reducido de 10 tokens (nucleótidos individuales más tokens especiales) y su tokenización de nucleótido único lo hacen especialmente adecuado para tareas de biología computacional.

La relevancia actual de este modelo radica en que los modelos de lenguaje preentrenados sobre secuencias biológicas se han convertido en una herramienta estándar para la generación de embeddings y el fine-tuning en tareas downstream como la predicción de sitios de splicing, la clasificación de variantes y el análisis de regulación génica. Su licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder Post-LN (6 capas, 16 cabezas de atención, dimensión de embedding 512, FFN 2048 con GELU) |
| Parametros totales | 19.716.620 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 nucleótidos (1026 tokens con `[CLS]` y `[SEP]`) |
| Tipos de cuantizacion | no disponible (checkpoint en fp32; compatible con cuantización estándar de transformers) |
| Idiomas soportados | no aplica (secuencias de ARN, no lenguaje natural) |
| Licencia | CC BY 4.0 (pesos); código original BSD 3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SpliceBERT-1024nt es un codificador BERT con normalización post-residual (Post-LN), 6 capas transformer, 16 cabezas de atención, dimensión de embedding de 512 y FFN oculto de 2048 unidades con activación GELU. La codificación posicional es absoluta aprendida y la normalización usa LayerNorm con epsilon de 1e-12. El vocabulario consta de 10 tokens: `[PAD]`, `[UNK]`, `[CLS]`, `[SEP]`, `[MASK]` y los cinco nucleótidos canónicos `N`, `A`, `C`, `G`, `T`. El tokenizador normaliza automáticamente la uracila (`U`) a timina (`T`) y aplica tokenización de nucleótido único con espacios.

El preentrenamiento se realizó con masked language modeling sobre más de dos millones de secuencias primarias de ARN de 72 especies de vertebrados, con fragmentos de longitud variable entre 64 y 1024 nucleótidos. El checkpoint original procede del registro Zenodo 7995778 y fue verificado con paridad numérica (diferencia absoluta máxima inferior a 1e-5) frente al checkpoint original en los siete niveles de representación (embedding más seis capas transformer), tanto con atención `eager` como `sdpa`. El port añade soporte para `attn_implementation="sdpa"` y `flash_attention_2"` mediante la librería BERT-updated, algo que no estaba presente en el código original.

## Capacidades

- Generación de embeddings de secuencias de ARN de longitud variable hasta 1024 nucleótidos, con pooling medio sobre tokens no especiales para representaciones a nivel de secuencia.
- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de ARN, capaz de predecir nucleótidos enmascarados en contexto.
- Extracción de representaciones intermedias: el modelo expone los hidden states de las seis capas transformer, útiles para tareas de fine-tuning o análisis de atención.
- Tokenización automática de secuencias crudas: el tokenizador gestiona la conversión U a T y el espaciado de nucleótido único sin preprocesado manual.
- Fine-tuning estándar con HuggingFace Transformers para tareas a nivel de secuencia o de token, usando pooling medio de posiciones no especiales.
- Compatibilidad con backends de atención modernos: `sdpa` y `flash_attention_2`, además del `eager` clásico.
- Capacidades multilingües: no aplica, al tratarse de un modelo biológico y no de lenguaje natural.

## Casos de uso

- Predicción de sitios de splicing: el caso de uso principal del modelo. Fine-tuning sobre datos de splicing anotados permite identificar sitios donadores y aceptores de splicing con mayor precisión que los métodos basados en motivos, gracias a la representación contextual aprendida durante el preentrenamiento.
- Generación de embeddings para clasificación de secuencias reguladoras: las representaciones de 512 dimensiones obtenidas por pooling medio pueden alimentar clasificadores downstream para distinguir exones, intrones, regiones UTR o promotores.
- Análisis de variantes genéticas: dado un fragmento de ARN con una variante de un solo nucleótido, el modelo puede generar embeddings comparativos para evaluar el impacto potencial de la variante en el splicing o en la estructura de la secuencia.
- Fine-tuning para detección de modificaciones epitranscriptómicas: la representación contextual por token permite entrenar cabezas de clasificación para detectar modificaciones como m6A, aprovechando que el modelo captura dependencias de largo alcance dentro de la ventana de 1024 nucleótidos.
- Estudio evolutivo comparativo: al haber sido preentrenado sobre 72 especies de vertebrados, el modelo puede generar embeddings comparables entre especies para estudiar conservación de secuencias y elementos reguladores.
- Investigación de enfermedades genéticas: los embeddings generados pueden integrarse en pipelines de priorización de variantes patogénicas relacionadas con defectos de splicing, un campo con aplicaciones clínicas directas.
- Análisis de isoformas de ARN: la ventana de 1024 nucleótidos permite capturar contexto suficiente para distinguir isoformas alternativas generadas por splicing alternativo en regiones génicas extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de rendimiento en tareas downstream como predicción de splicing, clasificación o regresión. El artículo original (Chen et al., 2024, Briefings in Bioinformatics) describe la evaluación del modelo, pero los datos numéricos no están recogidos en la documentación del port. La única verificación documentada es la paridad numérica con el checkpoint original (diferencia absoluta máxima inferior a 1e-5 en los siete niveles de representación), que confirma que el port reproduce fielmente el comportamiento del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 MB en fp32 (19,7 millones de parámetros × 4 bytes), más overhead de activaciones y atención. Con cuantización a fp16 o int8, el consumo se reduce a unos 40 MB o 20 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores ejecutan el modelo sin problemas. También es viable la inferencia en CPU.
- Compatibilidad con GPUs de consumo: sí, es uno de los modelos más ligeros de su categoría; cabe holgadamente en cualquier GPU consumer actual.
- Opciones de despliegue: HuggingFace Transformers con backend `eager`, `sdpa` o `flash_attention_2`; también es compatible con pipelines de inferencia estándar de la librería. No se documenta soporte específico para vLLM, llama.cpp u Ollama, aunque al ser un modelo BERT estándar podría adaptarse.
- Latencia y throughput: no disponible en la documentación, pero dado el tamaño del modelo (6 capas, 512 de embedding) la inferencia en GPU es del orden de milisegundos por secuencia de 1024 nucleótidos.

## Comparativa con modelos similares

| Modelo | Contexto | Datos de entrenamiento | Parámetros | Licencia |
|---|---|---|---|---|
| SpliceBERT-1024nt | 1024 nt (variable) | 72 vertebrados | ~19,7 M | CC BY 4.0 |
| SpliceBERT-510nt | 510 nt (fijo) | 72 vertebrados | ~19,7 M (estimado) | CC BY 4.0 |
| SpliceBERT-human-510nt | 510 nt (fijo) | Solo humano | ~19,7 M (estimado) | CC BY 4.0 |

La variante 1024nt se distingue de sus hermanas de 510nt en dos aspectos clave: acepta secuencias de longitud variable hasta 1024 nucleótidos, mientras que las variantes de 510nt requieren entradas de exactamente 510 nucleótidos, y es el modelo recomendado para uso general. La variante human-510nt está especializada en secuencias humanas y puede ofrecer mejor rendimiento en tareas específicas de esta especie, a costa de perder generalidad. No se dispone de datos de parámetros exactos para las variantes de 510nt en la información proporcionada.

## Limitaciones y advertencias

- El pooler del modelo (`pooler.dense`) no está incluido en el checkpoint original y sus pesos se inicializan aleatoriamente en el port. No debe usarse `pooler_output` sin fine-tuning previo; se recomienda usar pooling medio sobre tokens no especiales.
- El modelo está entrenado exclusivamente con secuencias de vertebrados. Su rendimiento en secuencias de otros taxones (plantas, bacterias, hongos) puede ser significativamente inferior.
- La ventana de contexto está limitada a 1024 nucleótidos. Secuencias más largas requieren fragmentación, lo que puede perder dependencias de largo alcance.
- El vocabulario no incluye nucleótidos modificados ni códigos de ambigüedad más allá de `N`; secuencias con caracteres no estándar se mapean a `[UNK]`.
- No se han publicado benchmarks cuantitativos en la documentación del port, por lo que el rendimiento real en tareas downstream debe validarse empíricamente antes de su uso en producción.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el código original de SpliceBERT está bajo BSD 3-Clause; es necesario respetar ambas licencias según el componente utilizado.
- El modelo es un codificador BERT, no un modelo generativo: no puede generar secuencias de ARN de novo, solo representaciones y predicciones de tokens enmascarados.
- Riesgo de alucinación: al ser un modelo de lenguaje enmascarado, las predicciones de nucleótidos enmascarados son probabilísticas y pueden no corresponder a variantes biológicamente plausibles; los resultados deben interpretarse con criterio biológico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/SpliceBERT-1024nt
- Colección SpliceBERT en HuggingFace: https://huggingface.co/collections/Taykhoom/splicebert-6a20b72e9bec05b79ce009aa
- Repositorio original en GitHub: https://github.com/biomed-AI/SpliceBERT
- Repositorio alternativo con el checkpoint: https://github.com/mengzhanggggg/TCTS-iM6A-2S/tree/main/models_folder/SpliceBERT.1024nt
- Registro Zenodo del checkpoint original: https://doi.org/10.5281/zenodo.7995778
- Artículo original (Chen et al., 2024): https://doi.org/10.1093/bib/bbae163
- Ficha en RNAZoo: https://ericmalekos.github.io/RNA-Zoo/models/SpliceBERT/
- Librería BERT-updated: https://huggingface.co/Taykhoom/BERT-updated
