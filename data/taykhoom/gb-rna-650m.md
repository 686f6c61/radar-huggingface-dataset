# Taykhoom/GB.RNA-650M

## Resumen

GB.RNA-650M es un modelo de lenguaje de ARN de 648.392.864 parámetros, desarrollado originalmente por GenBio AI (Zou et al., bioRxiv 2024) bajo el nombre AIDO.RNA y renombrado posteriormente a GB.RNA. La versión aquí descrita es un port independiente publicado por Taykhoom Dalal en HuggingFace que replica el checkpoint original `genbio-ai/GB.RNA-650M` sin requerir el paquete ModelGenerator, de forma que el modelo se carga con `transformers` estándar y `trust_remote_code=True`. Los pesos son idénticos a los del autor original; el port solo reimplementa el código de modelado y tokenización.

El modelo resuelve el problema de obtener representaciones vectoriales y predicciones contextuales sobre secuencias de ARN no codificante. Se trata de un encoder Transformer pre-LN entrenado con enmascarado de tokens (MLM) sobre 42 millones de secuencias de ncRNA, con un vocabulario de 16 símbolos y una longitud máxima de secuencia de 1024 tokens en entrenamiento. No es un modelo generativo instruccional ni conversacional: su uso previsto es la extracción de embeddings y el ajuste fino con cabezas específicas de tarea.

Su relevancia actual es doble: por un lado, elimina la dependencia del framework propietario ModelGenerator, lo que reduce la fricción de integración en pipelines de bioinformática basados en PyTorch/HuggingFace; por otro, sirve como punto de partida generalista dentro de una familia que cubre desde 1M hasta 1.6B de parámetros. El repositorio acumula 37 descargas y 0 likes en el momento de la consulta, por lo que su adopción es todavía muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN tipo encoder (masked LM), con RoPE y MLP SwiGLU |
| Parametros totales | 648.392.864 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (truncación en entrenamiento; RoPE sin límite duro teórico) |
| Tipos de cuantizacion | No disponible: solo se publican pesos safetensors en precisión completa, sin GGUF ni variantes cuantizadas oficiales |
| Idiomas soportados | No aplica: alfabeto de nucleótidos de 16 símbolos (`[PAD]`, `[MASK]`, `[CLS]`, `[SEP]`, `[UNK]`, A, G, C, T, U, N, `[BOS]`, `[EOS]`, 3 `[UNUSED]`) |
| Licencia | GenBio AI Community License (etiquetada como `other`; condiciones concretas no detalladas en la información disponible) |
| Formato de pesos | safetensors, con código propio (`modeling_gbrna.py`, `configuration_gbrna.py`) |

Otras especificaciones de arquitectura: 33 capas, 20 cabezas de atención, dimensión de embedding 1280, dimensión oculta de FFN 3392 (SwiGLU), normalización LayerNorm, `rotary_percent=1.0`.

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder pre-LN con 33 capas, 20 cabezas de atención y dimensión de modelo 1280. Cada bloque usa LayerNorm previa, atención multi-cabeza con codificación posicional rotatoria RoPE aplicada al 100 % de las dimensiones y una MLP con activación SwiGLU de dimensión oculta 3392. La cabeza de salida proyecta a un vocabulario de 16 tokens, lo que refleja que el modelo opera sobre alfabeto biológico y no sobre texto natural. El objetivo de entrenamiento es masked language modeling sobre secuencias de ARN no codificante, con 42 millones de secuencias como corpus. No se especifican en la información disponible el número total de tokens procesados, la composición detallada del dataset ni si hubo fases de ajuste posteriores tipo RLHF o DPO, algo por otra parte poco habitual en modelos biológicos de este tipo.

La innovación técnica principal del port no está en la arquitectura, sino en la ingeniería de compatibilidad: se elimina la dependencia del paquete ModelGenerator, se añaden implementaciones de atención `sdpa` y `flash_attention_2` que no existían en la versión original, y el tokenizador normaliza U/u a T/t para replicar el preprocesado del checkpoint de origen. El autor documenta una verificación de paridad frente a los pesos de `genbio-ai/GB.RNA-650M` en los 34 niveles de representación (embedding más 33 capas), con una diferencia máxima de 5,04e-06 en la salida final y 6,10e-05 en capas intermedias, medida en GPU con PyTorch 2.7 y CUDA 12. Esa diferencia se atribuye a ruido de acumulación en coma flotante que la capa de normalización final absorbe.

## Capacidades

- Extracción de embeddings de secuencia: representación CLS de 1280 dimensiones por secuencia, y representaciones por token de 1280 dimensiones.
- Acceso a estados ocultos intermedios de las 33 capas mediante `output_hidden_states=True`, útil para sondas y análisis de representación.
- Relleno de máscaras (MLM): predice el token más probable en posiciones `[MASK]`, con logits sobre el vocabulario de 16 símbolos.
- Puntuación de secuencias: la verosimilitud del token enmascarado permite comparar variantes y detectar posiciones anómalas.
- Ajuste fino supervisado para tareas a nivel de secuencia, usando el embedding CLS como entrada a una cabeza específica.
- Ajuste fino para tareas a nivel de token (anotación por posición).
- Soporte de atención optimizada: `attn_implementation="sdpa"` y `attn_implementation="flash_attention_2"`.
- Compatibilidad con la API estándar de HuggingFace (`AutoTokenizer`, `AutoModel`, `AutoModelForMaskedLM`) con `trust_remote_code=True`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación autoregresiva de texto: es un encoder enmascarado sin cabeza generativa.
- Capacidades multilingües: no aplica; el dominio es secuencia biológica.

## Casos de uso

- Búsqueda y agrupamiento de transcritos ncRNA: generar el embedding CLS de cada secuencia y usar similitud coseno o clustering (HDBSCAN, k-means) para agrupar familias de ARN no codificante sin alineamiento múltiple, aprovechando que el modelo procesa hasta 1024 nucleótidos por pasada.
- Anotación funcional de transcritos: ajustar una cabeza de clasificación multiclase sobre el embedding CLS para asignar familias o funciones a secuencias nuevas, un flujo habitual en proyectos de transcriptómica donde las anotaciones curadas cubren solo una fracción del datos.
- Predicción de estructura secundaria: ajuste fino a nivel de token para predecir el estado estructural por posición, usando los estados ocultos de capas intermedias como características densas.
- Priorización de variantes y mutaciones: puntuar con la cabeza MLM la probabilidad del nucleótido original frente al mutado en cada posición, y usar el delta de log-verosimilitud como señal de patogenicidad para cribar listas de variantes antes de validación experimental.
- Detección de ncRNA en metagenómica: clasificar fragmentos genómicos como codificantes o no codificantes, o como pertenecientes a una familia concreta, empleando el modelo como extractor de características dentro de un pipeline de anotación a escala.
- Preentrenamiento y destilación de modelos especializados: usar los pesos como inicialización en lugar de entrenar desde cero, con la ventaja de que el port se carga sin dependencias exóticas y encaja en flujos estándar de PyTorch Lightning o HuggingFace Trainer.
- Cribado de candidatos en diseño de ARN terapéutico: calcular embeddings de una librería de candidatos y filtrar por similitud con secuencias de referencia conocidas antes de las fases de síntesis y ensayo.
- Análisis de regiones codificantes: aunque el modelo base se entrenó con ncRNA, existe la variante específica GB.RNA-650M-CDS entrenada también con secuencias codificantes, que es la opción recomendada cuando el material de partida incluye CDS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la verificación de paridad numérica con el checkpoint original: diferencia máxima de 5,04e-06 en la salida final y de 6,10e-05 en capas intermedias, sobre 34 niveles de representación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para los pesos en bf16/fp16 y 2,6 GB en fp32; con activaciones para lote pequeño y secuencias de 1024 tokens, el consumo total se sitúa en el rango de 2 a 4 GB en bf16 (estimación a partir del recuento de parámetros, no medida publicada).
- GPU consumer: cabe holgadamente en cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090). También es viable en GPUs de 4-6 GB con lote 1 y fp16.
- GPU de datacenter: A100 (40/80 GB), H100, L40S o L4 son sobredimensionadas para inferencia; su interés está en el ajuste fino con lotes grandes y en el procesamiento por lotes de millones de secuencias.
- CPU: inferencia viable pero lenta; para extracción masiva de embeddings conviene GPU. El tamaño de 650M hace que un barrido de millones de secuencias en CPU sea poco práctico.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada; FlashAttention-2 y SDPA están disponibles para acelerar la atención. No hay soporte en llama.cpp, Ollama ni GGUF, al no existir pesos cuantizados ni arquitectura reconocida por esas herramientas. TGI no está validado para esta arquitectura personalizada. Para servir a escala, la opción realista es exportar a ONNX o TorchScript y usar un servidor de inferencia propio, o envolver el modelo en un servicio FastAPI con batching dinámico.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GB.RNA-650M | 648M | 1024 | 42M secuencias ncRNA | GenBio AI Community License | HuggingFace (este port y upstream) |
| GB.RNA-1.6B | 1,6B | 1024 (misma familia) | 42M secuencias ncRNA | GenBio AI Community License | HuggingFace |
| GB.RNA-650M-CDS | 648M | 1024 (misma familia) | 42M ncRNA + CDS | GenBio AI Community License | HuggingFace |
| GB.RNA-300M-MARS | 300M | 1024 (misma familia) | Corpus MARS ncRNA | GenBio AI Community License | HuggingFace |
| GB.RNA-25M-MARS | 25M | 1024 (misma familia) | Corpus MARS ncRNA | GenBio AI Community License | HuggingFace |

La información disponible no incluye datos verificables de otros modelos de ARN de terceros (DNABERT-2, Nucleotide Transformer, RNA-FM u otros), por lo que no se ofrece comparación numérica con ellos. Dentro de la familia, la elección depende del presupuesto de cómputo y del tipo de secuencia: 650M es el punto de partida generalista recomendado por el autor, 1.6B es la variante de mayor capacidad, y las variantes MARS y CDS cubren dominios de datos específicos.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, código ni conversación. Cualquier uso como asistente o chatbot es un error de categoría.
- El tokenizador espera notación de ADN; las secuencias con U deben convertirse a T antes de tokenizar, ya que U y T son entradas distintas del vocabulario y el modelo no las trata como equivalentes si se pasan sin normalizar (aunque el tokenizador del port normaliza U/u a T/t, conviene no depender de ello en pipelines propios).
- La longitud de entrenamiento es de 1024 tokens con truncación; aunque RoPE no impone un límite duro, procesar secuencias muy por encima de esa longitud degrada la calidad de las representaciones y no está validado.
- Entrenado sobre ARN no codificante: el rendimiento en regiones codificantes es incierto con este checkpoint, y para ello existe la variante CDS.
- Riesgo de alucinación en sentido biológico: la cabeza MLM siempre devuelve una distribución sobre 16 tokens, incluso en posiciones donde la predicción carece de sentido; no debe interpretarse como certeza biológica sin validación experimental.
- Sesgos de dominio: el corpus de 42M secuencias ncRNA tiene una composición taxonómica y funcional concreta no detallada en la información disponible; es esperable un peor comportamiento en familias poco representadas.
- Licencia: se trata de la GenBio AI Community License, etiquetada como `other`. Las condiciones exactas (uso comercial, registro, restricciones de redistribución) no se detallan en la información disponible y deben revisarse en el fichero LICENSE antes de cualquier despliegue en producción.
- El código requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditar `modeling_gbrna.py` y `configuration_gbrna.py` antes de usarlo en entornos con requisitos de seguridad.
- Madurez baja: 37 descargas y 0 likes, sin benchmark publicado ni validación independiente. No hay garantía de mantenimiento del port a largo plazo.
- No hay artefactos cuantizados ni soporte en runtimes de inferencia ligeros, lo que complica el despliegue en entornos con restricciones de memoria o en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/GB.RNA-650M
- Colección completa GB.RNA: https://huggingface.co/collections/Taykhoom/gbrna-6a22fe2e4039c523bcc48de9
- Checkpoint original (upstream): https://huggingface.co/genbio-ai/GB.RNA-650M
- Repositorio ModelGenerator: https://github.com/genbio-ai/ModelGenerator
- Paper de referencia (bioRxiv, 2024): https://doi.org/10.1101/2024.11.28.625345
- Variante CDS: https://huggingface.co/Taykhoom/GB.RNA-650M-CDS
- Variante de mayor tamaño: https://huggingface.co/Taykhoom/GB.RNA-1.6B
- Variante MARS de 300M: https://huggingface.co/Taykhoom/GB.RNA-300M-MARS

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
