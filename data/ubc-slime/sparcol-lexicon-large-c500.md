# UBC-SLIME/sparcol-lexicon-large-c500

## Resumen

SPARCOL-Lexicon-large-c500 es un codificador de frases basado en ModernBERT-large, desarrollado por el grupo UBC-SLIME, que genera representaciones lexicas dispersas para atribucion de autoria a gran escala. El modelo transforma cada token de entrada en un vector disperso de 500 dimensiones sobre clusters aprendidos durante el entrenamiento, de modo que la representacion de un documento es una matriz de vectores por token en lugar de un unico embedding denso. Esto lo aleja de los sentence-transformers convencionales y lo acerca a los esquemas de recuperacion dispersa tipo SPLADE o ColBERT, pero aplicados a la tarea de identificar quien escribio un texto.

El checkpoint publicado corresponde al paso 1580 (epoca 2.0) de un run de entrenamiento sobre el backbone answerdotai/ModernBERT-large, con una longitud maxima de secuencia de 512 tokens. El modelo tiene 395.831.296 parametros y se distribuye bajo licencia MIT en formato safetensors, con un repo de 1,6 GB. Acompana al articulo "Learned Sparse Lexical Representations for Large-scale Authorship Attribution" (Findings de EMNLP 2026) y requiere el codigo del repositorio lingjzhu/neural_lexical para su uso, ya que la puntuacion se realiza mediante MaxSim agrupado (clustered MaxSim) sobre los tokens de consulta no nulos.

Su relevancia actual radica en que ofrece una alternativa interpretable y eficiente en memoria a los embeddings densos para comparar documentos por estilo de escritura, un problema con aplicaciones forenses, de verificacion de autoría y de deteccion de contenido generado. No obstante, se trata de un checkpoint de investigacion con cero descargas y sin evaluacion completa de HRS republicada, por lo que su adopcion en produccion debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabeza de clustering lexico disperso |
| Parametros totales | 395.831.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (mas `cluster_ids.pt` con las asignaciones de cluster) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-large, un encoder transformer con atencion de longitud de contexto extendida y sin sesgo posicional clasico, y le anade una capa de clustering lexico: cada token se proyecta a un espacio disperso de 500 dimensiones donde las dimensiones corresponden a clusters de tokens aprendidos de forma conjunta con los pesos. La activacion es log1p(ReLU), sin tokens CLS/SEP y sin reescalado de embeddings, segun indica la model card. La salida es, por tanto, una matriz de vectores dispersos (uno por token) y la similitud entre documentos se calcula con MaxSim agrupado sobre los tokens de consulta no nulos, un esquema inspirado en ColBERT pero con representaciones lexicas dispersas en lugar de densas.

El checkpoint publicado es el paso 1580 de entrenamiento (epoca 2.0) del run `exp2/outputs_clustered_colbert_modernbert_large_500_relu_scale1_nocls`, con secuencias de hasta 512 tokens. Las asignaciones de cluster se aprenden durante el entrenamiento y se incluyen en `cluster_ids.pt`; la model card advierte explicitamente de que no deben recalcularse con k-means en inferencia. El empaquetado anade configuracion portable del modulo y elimina logs de entrenamiento y ejemplos de datos, pero no se han publicado detalles sobre el volumen de tokens de entrenamiento, la composicion del corpus ni si hubo RLHF/DPO (no aplica en un encoder de este tipo). Tampoco se ha reejecutado la evaluacion completa de HRS para esta release, por lo que no se reclaman nuevos resultados de benchmarks.

## Capacidades

- Generacion de representaciones lexicas dispersas por token para similitud y recuperacion de documentos.
- Atribucion de autoria: comparacion de estilo de escritura entre documentos mediante MaxSim agrupado.
- Recuperacion dispersa a nivel de token sobre un vocabulario de 500 clusters aprendidos.
- Representacion de documentos de hasta 512 tokens en una sola pasada.
- Puntuacion eficiente en memoria al operar con vectores dispersos de 500 dimensiones en lugar de embeddings densos de mayor dimension.
- Uso como componente de sentence-transformers mediante `SparseEncoder` y `ClusteredTransformer`.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un encoder de representacion, no un modelo generativo.

## Casos de uso

- Atribucion forense de autoria: dado un texto anonimo, comparar su representacion dispersa contra un corpus de autores conocidos usando `clustered_maxsim`; el modelo esta entrenado especificamente para capturar senales estilisticas lexicas.
- Deteccion de ghostwriting o plagio estilistico: indexar un conjunto de documentos de referencia y consultar nuevos textos para identificar coincidencias de estilo con autores concretos.
- Verificacion de autoria en entornos academicos o editoriales: puntuar pares de documentos para estimar si comparten autor, con la ventaja de que la representacion dispersa permite inspeccionar que clusters activan.
- Analisis de corpus historicos o literarios: agrupar y comparar textos por autor en colecciones de hasta 512 tokens por fragmento, con un coste de almacenamiento reducido frente a embeddings densos.
- Deteccion de contenido generado por IA frente a textos humanos: usar la similitud estilistica contra un corpus de referencia humano para senalar documentos atipicos.
- Investigacion en recuperacion lexica dispersa: servir como baseline reproducible para experimentos con representaciones sparse en tareas de autoria y recuperacion, dado que el codigo y los clusters estan publicados.
- Moderacion de comunidades y foros: identificar cuentas sockpuppet o multi-cuenta comparando el estilo de sus mensajes con el de otras cuentas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion completa de HRS no se ha reejecutado para esta release y que no se reclaman nuevos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,8 GB solo para pesos (395,8 M de parametros), mas activaciones y buffers; en la practica, alrededor de 2-4 GB con batch pequeno y secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; una RTX 4090 o A100/H100 ofrecen margen amplio para batches grandes.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090, entre otras).
- Opciones de despliegue: el modelo se usa a traves de `sentence-transformers` con los modulos `ClusteredTransformer` y `SparseEncoder` del repositorio `lingjzhu/neural_lexical`; no se documenta soporte para vLLM, TGI, llama.cpp u Ollama (no es un modelo generativo y no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPARCOL-Lexicon-large-c500 | 395,8 M | 512 | Atribucion de autoria con representaciones sparse | MIT | Hugging Face, requiere codigo externo |
| answerdotai/ModernBERT-large (base) | no disponible en la informacion | no disponible en la informacion | Encoder general | no disponible en la informacion | Hugging Face |
| Modelos sentence-transformers densos (p. ej. all-mpnet-base-v2) | no disponible en la informacion | no disponible en la informacion | Embeddings densos de frases | no disponible en la informacion | Hugging Face |
| SPLADE / ColBERT | no disponible en la informacion | no disponible en la informacion | Recuperacion dispersa / late interaction | no disponible en la informacion | Hugging Face |

La comparacion con alternativas concretas no puede completarse con los datos proporcionados; se indica "no disponible" en los campos que no constan en la informacion.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion independiente.
- Solo soporta ingles; su rendimiento en otros idiomas no esta documentado.
- Ventana de contexto limitada a 512 tokens, insuficiente para documentos largos sin fragmentacion.
- No es un modelo generativo: no puede usarse para chat, resumen, codigo ni razonamiento; su unica salida son representaciones dispersas.
- Requiere el codigo del repositorio `lingjzhu/neural_lexical` y cargar `cluster_ids.pt`; recalcular los clusters con k-means en inferencia produce resultados incorrectos segun la model card.
- La evaluacion completa de HRS no se ha reejecutado para este checkpoint; no hay garantia de que el rendimiento coincida con el del articulo.
- Riesgo de sesgo: al ser un modelo de atribucion de autoria, puede amplificar sesgos estilisticos presentes en los datos de entrenamiento y producir falsos positivos contra autores con estilos poco representados.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de atribuciones erroneas con alta confianza en documentos cortos o atipicos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar las condiciones del articulo y del codigo asociado.
- No se documentan datos de entrenamiento, composicion del corpus ni procesos de mitigacion de sesgos, lo que dificulta una auditoria para uso forense.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UBC-SLIME/sparcol-lexicon-large-c500
- Articulo (Findings EMNLP 2026): https://aclanthology.org/2026.findings-emnlp.400/
- Codigo de referencia: https://github.com/lingjzhu/neural_lexical
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
