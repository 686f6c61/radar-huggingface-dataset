# Veritone/embedding-rotations

## Resumen

`Veritone/embedding-rotations` no es un modelo de IA en el sentido convencional, sino un repositorio de matrices ortogonales fijas que se aplican a vectores de embedding antes de almacenarlos en un índice vectorial cuantizado. Lo publica Veritone bajo licencia Apache-2.0 y su propósito es mitigar el daño que la cuantización escalar int8 inflige a los embeddings de SigLIP 2, cuyos vectores presentan dimensiones atípicas (outliers) que concentran gran parte de la energía del vector y desequilibran los bins del cuantizador.

El artefacto actual, `rot1` para dimensión 768, es una matriz de 768x768 en float32 generada mediante descomposición QR de una matriz gaussiana con semilla fija (20261001), distribuida de forma Haar. Al ser ortogonal, preserva productos escalares y normas, de modo que la búsqueda exacta por coseno no cambia, pero reparte la energía de los outliers entre todas las dimensiones, lo que mejora sustancialmente el recall de la búsqueda aproximada cuantizada.

Su relevancia es práctica: según la model card, en un conjunto interno de unos 180.000 vectores de fotogramas de vídeo con SigLIP 2 y Elasticsearch 8.17 con `int8_hnsw`, el recall texto-a-fotograma frente a búsqueda exacta pasó de 0,41 sin rotación a 0,92 con rotación, y a 0,99-1,00 añadiendo rescoring. No contiene pesos de red neuronal ni parámetros aprendidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matriz ortogonal fija (no es un modelo neuronal) |
| Parametros totales | 768 x 768 = 589.824 valores float32 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | Diseñado para cuantizacion escalar int8 en indices vectoriales (probado con Elasticsearch 8.17 `int8_hnsw`) |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre vectores) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npy` (NumPy, float32 little-endian); metadatos en `rot1/768.provenance.json` |

## Arquitectura y entrenamiento

No hay entrenamiento. La matriz `rot1/768.npy` se genera con un generador de números pseudoaleatorios de NumPy con semilla 20261001, se obtiene una matriz gaussiana de 768x768 en float64, se descompone por QR y se ajusta el signo de las columnas según la diagonal de R para obtener una distribución de Haar (Mezzadri 2007). El resultado se convierte a float32 little-endian. Se generó una única vez el 2026-10-01 con NumPy 2.5.3.

La innovación técnica no está en el aprendizaje sino en el uso: al ser una transformación ortogonal, conserva exactamente productos escalares y normas, por lo que la búsqueda por coseno exacta es idéntica; sin embargo, distribuye la energía de las dimensiones dominantes. En SigLIP 2 base-patch16-224, las dimensiones 242 y 215 dominan los embeddings de imagen (aproximadamente 0,48 y 0,37 en el vector medio unitario), mientras que en texto dominan 653, 626, 434, 4 y 100 (aproximadamente 0,26-0,49 cada una). La relación max/rms por dimensión llega a 14,4 en fotogramas, frente a 3,0 en Nomic Embed v2 (también de 768 dimensiones). La rotación no corrige la brecha de modalidad (modality gap) descrita por Liang et al. 2022; para eso se propone un desplazamiento separado (restar la media de fotogramas y sumar la media de texto), que sería otra transformación y otro espacio de embeddings.

## Capacidades

- Rotación de vectores de embedding de 768 dimensiones preservando normas y productos escalares.
- Mejora del recall en búsqueda aproximada cuantizada int8 sobre índices HNSW.
- Conversión offline de vectores ya almacenados sin necesidad de re-embeddear.
- Aplicable a cualquier embedding de 768 dimensiones, no solo a SigLIP 2, aunque la utilidad depende de la distribución por dimensiones del modelo concreto.
- Compatible con normalización antes o después de la rotación (conmutan).
- No soporta truncamiento Matryoshka: la rotación mezcla todas las dimensiones, por lo que las primeras k componentes de un vector rotado no forman un embedding reducido válido.
- No incluye tool calling, agentes, generación de texto ni capacidades multimodales propias.

## Casos de uso

- Búsqueda texto-a-vídeo con SigLIP 2 y Elasticsearch: aplicar `rot1` a los fotogramas antes de indexarlos en un campo `int8_hnsw` eleva el recall de 0,41 a 0,92 (y a 0,99-1,00 con rescoring), lo que hace viable un índice cuantizado de bajo coste para recuperación de fotogramas.
- Migración de índices vectoriales existentes: los vectores ya almacenados se convierten offline multiplicando por la matriz (`V @ R.T`) sin re-embeddear el corpus, lo que reduce el coste de adopción a un proceso batch.
- Reducción de memoria en producción: al permitir cuantización int8 con recall aceptable, se rebaja el espacio de almacenamiento del índice aproximadamente a un cuarto respecto a float32 manteniendo calidad de búsqueda.
- Sistemas de recomendación visual: indexación de embeddings de imagen con cuantización y rotación previa para mantener la calidad del vecino más cercano en catálogos grandes.
- Búsqueda multimodal interna: combinación de la rotación con el desplazamiento de la brecha de modalidad (transformación separada) para mejorar tanto el cuantizador como el grafo HNSW en consultas de texto contra vectores de imagen.
- Auditoría de calidad de recuperación: usar la matriz como referencia reproducible (sha256 fijo) para comparar el recall de distintas configuraciones de cuantización en pipelines de evaluación.

## Benchmarks y rendimiento

Datos reportados en la model card sobre un conjunto interno de aproximadamente 180.000 vectores de fotogramas de vídeo SigLIP 2, con Elasticsearch 8.17 `int8_hnsw`:

| Configuracion | Recall texto-a-fotograma (frente a busqueda exacta) |
|---|---|
| Sin rotacion | 0,41 |
| Con rotacion `rot1` | 0,92 |
| Con rotacion `rot1` + rescoring | 0,99 - 1,00 |

Datos adicionales sobre 100.000 vectores de fotogramas con indice HNSW sin cuantizar en Elasticsearch:

| Tipo de consulta | Recall top-10 HNSW | Recall top-10 flat scan |
|---|---|---|
| Texto | 0,86 | 1,00 |
| Imagen | 0,97 | 1,00 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- No requiere GPU: la rotación es una multiplicación de matrices de 768x768, ejecutable en CPU.
- Memoria: la matriz ocupa aproximadamente 2,25 MB en float32; el coste de aplicar la rotación a un lote es O(n x 768^2) operaciones.
- GPU recomendadas: no aplica; cualquier CPU moderna procesa lotes de miles de vectores en segundos.
- Cabe en cualquier entorno, incluidos dispositivos de borde y funciones serverless.
- Despliegue: se integra como paso previo en pipelines de indexación (por ejemplo, scripts Python con NumPy, jobs de Elasticsearch ingest, o etapas en vLLM/TGI no aplican aquí).
- Latencia y throughput: no disponibles de forma explícita; dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Artefacto | Tipo | Dimension | Licencia | Uso |
|---|---|---|---|---|
| `Veritone/embedding-rotations` (`rot1`) | Matriz ortogonal fija | 768 | Apache-2.0 | Preprocesado para cuantizacion int8 |
| Rotaciones aleatorias ad hoc (generadas por el usuario) | Matriz ortogonal generada localmente | Cualquiera | Depende del usuario | Misma funcion, sin sha256 reproducible |
| Cuantizacion sin rotacion (int8 directa) | Tecnica | no aplica | no aplica | Baseline; recall 0,41 en el caso reportado |
| Desplazamiento de brecha de modalidad (mencionado en la model card) | Transformacion de media | 768 | no disponible | Complementario, no sustituto |

No se conocen otros repositorios publicos equivalentes de matrices de rotacion empaquetadas con procedencia verificable; la comparativa se limita a las alternativas descritas en la propia model card.

## Limitaciones y advertencias

- No corrige la brecha de modalidad: tras la rotación, los vectores de la misma modalidad siguen promediando un coseno de aproximadamente 0,7, y fotogramas frente a textos aproximadamente 0,06; la mejor coincidencia texto-fotograma ronda 0,2.
- No es un modelo entrenado: no aprende nada de los datos y su utilidad depende de la distribución por dimensiones del embedding concreto; hay que comprobar la energía por dimensión de cada modalidad antes de adoptarlo.
- Prohibido truncar el espacio rotado (sin recorte Matryoshka): las primeras k dimensiones no constituyen un embedding menor.
- No regenerar la matriz para "verificarla": la salida de QR no es estable bit a bit entre versiones de NumPy y BLAS; hay que cargar el fichero y comprobar el sha256 (`947552c113aff0959091773bb89536d75e8a8746112e7cd1fe8f0db0a07ad4c5`).
- Fijar la revisión al descargar para garantizar reproducibilidad.
- Los resultados de recall provienen de un conjunto interno de Veritone y de una versión concreta de Elasticsearch (8.17); la extrapolación a otros motores o configuraciones no está garantizada.
- Sin datos publicados sobre sesgos, alucinación o cobertura idiomática porque el artefacto no genera contenido.
- Licencia Apache-2.0 permite uso comercial, pero no hay garantías ni soporte indicados en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Veritone/embedding-rotations
- Paper sobre la brecha de modalidad: https://arxiv.org/abs/2203.02053 (Liang et al. 2022, "Mind the Gap")
- Referencia sobre matrices de Haar: Mezzadri 2007 (citado en la model card; sin enlace directo proporcionado)
- Fichero de procedencia: `rot1/768.provenance.json` dentro del repositorio
- Matriz: `rot1/768.npy` dentro del repositorio
- No se han encontrado en la información proporcionada otros enlaces a blogs, demos o repositorios adicionales.
