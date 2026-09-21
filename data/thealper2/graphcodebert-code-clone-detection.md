# thealper2/graphcodebert-code-clone-detection

## Resumen

graphcodebert-code-clone-detection es un ajuste fino completo de microsoft/graphcodebert-base publicado por el usuario thealper2 para una tarea concreta: la detección binaria de clones de código (0 = no clon, 1 = clon) sobre fragmentos de Python. El modelo no es un clasificador de pares genérico: reutiliza la arquitectura «data-flow-aware» de GraphCodeBERT, en la que cada fragmento se codifica por separado con un encoder compartido y su propia máscara de atención guiada por grafo, y las dos representaciones `<s>` se concatenan antes de la cabeza de clasificación.

El checkpoint tiene 125.236.994 parámetros y un tamaño de repositorio de 0,5 GB en safetensors. Se entrenó sobre el dataset PoolC/1-fold-clone-detection-600k-5fold (un único fold de 5) durante 3 épocas y 1,923 horas en una NVIDIA GeForce RTX 5060 Ti de 15,9 GB, seleccionando el mejor checkpoint por F1 de validación (0,8672). El resultado declarado en el conjunto de test es un F1 de 0,8805 y una exactitud de 0,8747.

Su relevancia es acotada pero clara: cubre un nicho (detección de duplicación y similitud semántica de código en Python) donde el flujo de datos añade señal que un encoder de texto plano no captura, y lo hace con licencia MIT y un coste de inferencia propio de un modelo de 125 M de parámetros. Las métricas están marcadas como no verificadas y el repositorio no tiene descargas ni valoraciones, por lo que debe tratarse como un artefacto experimental, no como un modelo validado en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (GraphCodeBERT) con atención guiada por grafo y cabeza pairwise personalizada: `Linear(2x768 -> 768) -> tanh -> Linear(768 -> 2)` |
| Parámetros totales | 125.236.994 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 640 posiciones por fragmento (512 tokens de código + 128 nodos de flujo de datos); dos fragmentos codificados de forma independiente por un encoder compartido |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (0,5 GB) |
| Idiomas soportados | Código; la extracción de flujo de datos está implementada únicamente para Python (gramática `tree-sitter-python`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/graphcodebert-base, un encoder tipo RoBERTa con atención guiada por grafo. La particularidad es el esquema de entrada por fragmento: 512 tokens de código (`<s>` + tokens BPE + `</s>`), 128 posiciones reservadas a nodos del grafo de flujo de datos (DFG) y el resto de relleno. La atención está restringida por `position_idx`: código con código, los tokens especiales con todo, cada nodo con los tokens de código de los que procede (y a la inversa) y con los nodos adyacentes. La representación de un nodo de flujo de datos es la media de las embeddings de los tokens de código de los que se identificó. Cada uno de los dos fragmentos pasa por el encoder con su propia máscara y las dos representaciones `<s>` se concatenan para alimentar la cabeza de clasificación.

El preprocesado extrae el flujo de datos con un port del extractor `DFG_python` de GraphCodeBERT sobre `tree-sitter-python` (eliminación de comentarios y docstrings, AST, estados de variables y aristas `comesFrom` / `computedFrom`). Se vectorizaron 44.950 fragmentos distintos, con una media de 44,22 nodos de flujo por fragmento y 2.481.388 aristas en total; 263 fragmentos quedaron con grafo vacío y el recuento de extracción fue `{"ok": 44930, "comment_strip_failed": 13, "dfg_failed": 7}`, sin descartar ninguna fila. Los splits se construyeron por grupos de problemas disjuntos: 50.000 pares en entrenamiento (240 grupos), 20.000 en validación (29 grupos) y 20.000 en test (30 grupos), con 25.000/10.000/10.000 positivos respectivamente; se descartaron 337.398 pares del fold reservado por caer a ambos lados de la frontera validación/test. No se aplicó ponderación de clases porque la proporción de la clase mayoritaria (0,5000) quedaba por debajo del umbral de 0,6.

El entrenamiento usó AdamW (`adamw_torch`), learning rate 2e-05, scheduler lineal con 0,1 de warmup (938 pasos), 3 épocas, batch efectivo de 16 (batch por dispositivo 16, sin acumulación), weight decay 0,01, clipping de gradiente 1,0, precisión mixta fp16, sin gradient checkpointing y semilla 42. No se menciona RLHF, DPO ni ninguna fase de alineación: es un ajuste supervisado con entropía cruzada sobre etiquetas binarias.

## Capacidades

- Clasificación binaria de pares de fragmentos de código: `0 = not clone`, `1 = clone`, con logits de dos clases.
- Detección de similitud semántica, no solo textual: la atención guiada por grafo y las aristas `comesFrom` / `computedFrom` permiten emparejar fragmentos con variables renombradas o estructuras sintácticas distintas pero flujo de datos equivalente.
- Codificación independiente de cada fragmento con un encoder compartido, lo que evita sesgos posicionales cruzados entre los dos fragmentos.
- Robustez parcial ante código mal formado o sin flujo de datos extraíble: los fragmentos con DFG vacío se conservan con grafo vacío en lugar de descartarse.
- Especialización en Python: el pipeline de preprocesado solo extrae flujo de datos para Python.
- Metadatos de despliegue: etiquetas `text-embeddings-inference` y `endpoints_compatible` en el repositorio.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo «thinking». Es un encoder discriminativo, no un modelo generativo.
- No dispone de capacidades multilingües de lenguaje natural: el campo `language` del repositorio es `code`.

## Casos de uso

- Detección de duplicación en pipelines de CI/CD: ejecutar el modelo como paso de revisión que compara los ficheros modificados por un pull request contra un índice de fragmentos ya presentes en el repositorio, marcando pares con probabilidad alta de clon para forzar una revisión manual del desarrollador.
- Auditoría de licencias y procedencia de código: comparar fragmentos de un proyecto propio contra código de terceros del que se sospecha copia, usando el recall alto (0,9240 en test) para no dejar pasar casos dudosos, con revisión humana sobre los falsos positivos.
- Consolidación y refactorización de bases de código heredadas: localizar implementaciones equivalentes dispersas en distintos módulos para unificarlas en una única función, apoyándose en que la señal de flujo de datos tolera diferencias de nombres de variables.
- Análisis de reutilización entre microservicios o repositorios de una misma organización: construir un índice de fragmentos y comparar pares para detectar lógica copiada entre equipos, con el coste de inferencia propio de un modelo de 125 M de parámetros.
- Evaluación antiplagio en docencia de programación: comparar los envíos de prácticas entre sí en lugar de solo contra una solución de referencia, ya que el modelo compara dos fragmentos arbitrarios y no requiere una respuesta canónica.
- Triaje en análisis de código sospechoso o malware en Python: agrupar muestras por similitud estructural para reducir el número de artefactos que un analista revisa manualmente, aceptando que el modelo no aporta ninguna interpretación semántica del comportamiento.
- Indexación y búsqueda de código similar: generar una puntuación de similitud entre pares para alimentar un buscador interno de fragmentos reutilizables, complementando (no sustituyendo) la búsqueda léxica.
- Filtrado de código generado por asistentes: detectar si el código sugerido por una herramienta de generación reproduce fragmentos ya presentes en la base de código licenciada de la empresa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (todos con `verified: false`), sobre el dataset PoolC/1-fold-clone-detection-600k-5fold:

| Split | Exactitud | Precisión | Recall | F1 | TP | TN | FP | FN |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| validation (mitad del fold `val` por grupo) | 0,8557 | 0,8032 | 0,9422 | 0,8672 | 9.422 | 7.692 | 2.308 | 578 |
| test (mitad disjunta por grupo) | 0,8747 | 0,8410 | 0,9240 | 0,8805 | 9.240 | 8.253 | 1.747 | 760 |

Matriz de confusión de test (`[[TN, FP], [FN, TP]]`): `[[8253, 1747], [760, 9240]]`.

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ni comparaciones con otros detectores de clones sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- Peso de los parámetros: 125.236.994 parámetros; el repositorio ocupa 0,5 GB, lo que corresponde aproximadamente a pesos en fp32 (unos 250 MB en fp16).
- VRAM estimada para inferencia: del orden de 1 a 2 GB en fp16 para lotes pequeños, teniendo en cuenta que cada ejemplo implica dos secuencias de 640 posiciones y una máscara de atención guiada por grafo con memoria adicional. Cifra no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para volúmenes moderados. El propio entrenamiento se realizó en una NVIDIA GeForce RTX 5060 Ti de 15,9 GB.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.), dado el tamaño del modelo.
- Opciones de despliegue: el repositorio requiere su propia clase de modelo y su propio preprocesado (`modeling.load_model`, `preprocess.build_snippet_features`, `CloneCollator`); la model card indica explícitamente que `AutoModelForSequenceClassification` no reproduce estos resultados. Por tanto, llama.cpp, Ollama y GGUF no son aplicables tal cual, y los servidores estándar tipo vLLM o TGI necesitan adaptación al tratarse de una cabeza y una máscara de atención personalizadas. El repositorio está etiquetado como `text-embeddings-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles. Como referencia de coste, el ajuste fino de 3 épocas sobre 50.000 pares con batch 16 tardó 1,923 horas en una RTX 5060 Ti.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento en detección de clones |
|---|---|---|---|---|---|
| thealper2/graphcodebert-code-clone-detection | 125.236.994 | 640 por fragmento (512 código + 128 DFG) | Clasificación binaria de clones | MIT | F1 0,8805, exactitud 0,8747 en test (declarado, no verificado) |
| microsoft/graphcodebert-base | Mismo encoder (~125 M) | Arquitectura original con 512 tokens de código + 128 nodos de flujo de datos | Preentrenamiento; sin cabeza de detección de clones | MIT (según el repositorio base) | No disponible |
| microsoft/codebert-base | No disponible en la información proporcionada | No disponible | Preentrenamiento de representaciones de código | No disponible | No disponible |
| microsoft/unixcoder-base | No disponible en la información proporcionada | No disponible | Preentrenamiento multilingüe de código | No disponible | No disponible |

No se dispone de resultados comparativos de detección de clones entre estas alternativas en la información proporcionada, por lo que la comparación se limita a la categoría y al tamaño del encoder.

## Limitaciones y advertencias

- Especialización en Python: el extractor de flujo de datos solo existe para `tree-sitter-python`; aplicar el modelo a otro lenguaje requeriría reimplementar el preprocesado y, previsiblemente, reentrenar.
- No es un modelo generativo: no sirve para chat, generación de código, resúmenes ni tareas de instrucciones. Cualquier uso en ese sentido es un error de categoría.
- Integración no estándar: la model card advierte que `AutoModelForSequenceClassification` no reproduce los resultados, por lo que hay que importar la clase de modelo y el preprocesado propios del repositorio. Esto complica el despliegue en servidores de inferencia convencionales.
- Sesgo hacia la clase positiva: la precisión en test (0,8410) es notablemente inferior al recall (0,9240), con 1.747 falsos positivos frente a 760 falsos negativos. En un uso real esto se traduce en un volumen alto de alertas que requieren revisión humana.
- Umbral de decisión no calibrado: no se usó ponderación de clases porque el conjunto está balanceado al 50 %, de modo que el umbral por defecto de 0,5 no está ajustado para distribuciones reales, donde los clones suelen ser minoría.
- Evaluación débil: el test procede de la mitad del fold `val` del mismo dataset y del mismo fold único, no de una partición independiente del corpus original; las métricas están marcadas como `verified: false`.
- Preprocesado con fallos registrados: 13 fragmentos con `comment_strip_failed` y 7 con `dfg_failed`, y 263 fragmentos con flujo de datos vacío conservados con grafo vacío. En esos casos la señal de flujo de datos desaparece y el modelo degrada a un comparador textual.
- Riesgo de falso negativo en clones semánticos que no compartan flujo de datos (por ejemplo, reescrituras con estructuras de datos distintas que preservan el resultado pero no las relaciones `comesFrom` / `computedFrom`).
- Trazas de validación limitadas: 0 descargas y 0 valoraciones en el momento de la consulta, sin evidencia de uso independiente.
- Licencia MIT: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de copyright y la licencia. Conviene verificar por separado las condiciones del modelo base y del dataset utilizados.
- Sin información publicada sobre sesgos de dominio: se desconoce el comportamiento del modelo sobre código generado, ofuscado o perteneciente a dominios poco representados en el corpus de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/graphcodebert-code-clone-detection
- Modelo base: https://huggingface.co/microsoft/graphcodebert-base
- Dataset de entrenamiento: https://huggingface.co/datasets/PoolC/1-fold-clone-detection-600k-5fold
- Paper del modelo base (GraphCodeBERT: Pre-training Code Representations with Data Flow): https://arxiv.org/abs/2009.08366
- Repositorio del modelo base (Microsoft GraphCodeBERT): https://github.com/microsoft/CodeBERT
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente hilos de foros sin relación con el modelo, el dataset o la tarea.
