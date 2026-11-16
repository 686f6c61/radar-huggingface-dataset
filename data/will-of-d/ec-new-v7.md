# Will-of-D/ec-new-v7

## Resumen

Will-of-D/ec-new-v7 es un artefacto de inferencia publicado en Hugging Face por el usuario Will-of-D, orientado a la anotación automática de números EC (Enzyme Commission). No es un modelo de lenguaje en sentido estricto: el repositorio contiene un pipeline de recuperación por homología (retrieval) combinado con un ranker de 33 características y un "challenger" pairwise de 105 características que reajusta la decisión del ranker base cuando la confianza supera un umbral ajustado. La model card lo describe como la versión v7 de una familia previa (v3, con arquitectura DIAMOND y ranker), y el paquete se distribuye como imagen Docker para linux/amd64 con un script `predict.py`.

El sistema resuelve el problema de asignar códigos EC a secuencias proteicas a partir de un conjunto de entrenamiento etiquetado, sin usar pesos preentrenados ni datos externos. El pipeline combina una primera pasada de búsqueda "ultra-sensitive" con un deadline de 2.400 segundos, 8 hilos de CPU y sin necesidad de GPU ni red. La relevancia actual es acotada: se trata de un envío para evaluación oficial (probablemente una competición tipo Kaggle/CASP-style sobre anotación enzimática), con métricas internas de validación cruzada pero sin resultados públicos de benchmark.

El tamaño del repositorio es de 0,1 GB y contiene la referencia completa de 186.488 secuencias únicas suministradas. La licencia no está declarada, los idiomas no aplican y no hay pipeline de Hugging Face asociado. Cualquier uso en producción requeriría validar el Dockerfile en linux/amd64, ya que el autor indica que no se ha probado localmente en ese entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de retrieval (DIAMOND) + ranker de 33 características + challenger pairwise de 105 características |
| Parametros totales | no disponible (no es un modelo neuronal con pesos publicados; el ranker y el challenger son modelos de características) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: secuencias proteicas; sin ventana de tokens) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizables) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el artefacto se distribuye como Dockerfile + `predict.py` y referencias de secuencias |
| Tamano del repositorio | 0,1 GB |
| Entrada / salida | `--input INPUT.parquet` → `predictions.jsonl` |
| Hardware requerido | CPU, 8 hilos de búsqueda, sin GPU ni red |
| Deadline de búsqueda | 2.400 s |
| Referencia de secuencias | 186.488 secuencias únicas suministradas |

## Arquitectura y entrenamiento

El sistema es un pipeline en cascada. La primera etapa es una búsqueda por homología con DIAMOND en modo "ultra-sensitive", que recupera candidatos para cada secuencia de consulta contra una referencia de 186.488 secuencias. Sobre esos candidatos actúa un ranker de 33 características (la versión v3) que produce una puntuación y un ganador EC. La novedad de v7 es un challenger pairwise de 105 características que, para cada par (candidato, ganador v3), calcula una "expected credit" y decide si sustituir la predicción base; el cambio solo se aplica si la diferencia supera un umbral ajustado. El challenger se entrena sobre predicciones cross-fitted de v3, nunca sobre sus puntuaciones in-sample, lo que evita fuga de información.

El entrenamiento usa exclusivamente las secuencias y etiquetas de entrenamiento proporcionadas; no hay datos etiquetados externos, pesos preentrenados, ni entradas o etiquetas de test. La validación es cluster-held-out con 15 folds: los folds 7-14 se usan para ajuste de investigación, el fold 6 para selección y el fold 5 para confirmación; el resto de folds previamente inspeccionados son descriptivos. En el fold 5, con la recuperación original cacheada, el candidato obtiene 0,801466 L4 frente a 0,801426 de la v3 equivalente, con las consultas sin hit contando cero para todos los métodos. El ajuste final del challenger en producción usa los 15 folds con predicciones base cross-fitted. La inferencia emplea búsqueda comprimida, lotes de 8.000 consultas, 128 bins y división por límite de ficheros heredada de v3.

## Capacidades

- Asignación de códigos EC a secuencias proteicas mediante recuperación por homología y ranking supervisado.
- Reajuste de decisiones del ranker base mediante un challenger pairwise con umbral ajustado.
- Manejo de consultas sin hit (se contabilizan como cero en la comparación).
- Procesamiento por lotes de 8.000 consultas con salida comprimida en JSONL.
- Ejecución íntegra en CPU con 8 hilos de búsqueda, sin GPU ni acceso a red.
- Deadline de búsqueda configurable de 2.400 s para acotar el tiempo de ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Anotación enzimática a gran escala: dado un conjunto de secuencias proteicas en Parquet, el pipeline produce predicciones EC en JSONL, adecuado para lotes de miles de secuencias con un deadline de 2.400 s y 8 hilos de CPU.
- Envío a competiciones de anotación funcional: el paquete está empaquetado como Dockerfile para linux/amd64 y un `predict.py` con interfaz `--input/--output`, lo que encaja con pipelines de evaluación oficiales que exigen reproducibilidad y ausencia de red.
- Curado de bases de datos enzimáticas: la referencia de 186.488 secuencias y el ranking por características permiten priorizar candidatos EC para revisión manual, usando el margen del challenger como señal de confianza.
- Reproducción de experimentos de retrieval+ranking: el diseño con folds cluster-held-out (7-14 ajuste, 6 selección, 5 confirmación) sirve como plantilla para validar pipelines de anotación sin fuga de información.
- Despliegue en entornos sin GPU: al no requerir GPU ni red, puede ejecutarse en nodos de CPU estándar con 8 hilos, útil en clústeres de bioinformática con recursos limitados.
- Integración en pipelines de CI de bioinformática: el contenedor Docker y la salida JSONL permiten encadenar la predicción con etapas posteriores de validación o filtrado.
- Comparación de variantes v3 vs v7: el challenger permite medir si el reajuste pairwise aporta ganancia (0,801466 vs 0,801426 L4 en fold 5) antes de adoptarlo en producción.

## Benchmarks y rendimiento

| Metrica | v7 (challenger) | v3 (base) | Contexto |
|---|---|---|---|
| L4 en fold 5 (recuperación original cacheada) | 0,801466 | 0,801426 | Consultas sin hit cuentan cero para todos los métodos |
| Folds de ajuste | 7-14 | 7-14 | Ajuste de investigación |
| Fold de selección | 6 | 6 | Selección de configuración |
| Fold de confirmación | 5 | 5 | Confirmación |
| Folds descriptivos | resto | resto | Previamente inspeccionados |

No se han publicado resultados de benchmarks públicos (leaderboard, test público o privado) en la información disponible. El autor indica explícitamente que estas cifras no predicen la puntuación pública o privada.

## Requisitos de hardware

- CPU con 8 hilos de búsqueda; no se requiere GPU.
- Sin acceso a red durante la inferencia.
- Memoria RAM: no disponible en la información proporcionada; el repositorio ocupa 0,1 GB y la referencia contiene 186.488 secuencias.
- Almacenamiento: suficiente para el contenedor Docker linux/amd64 y los ficheros de entrada/salida (lotes de 8.000 consultas, salida comprimida).
- Despliegue: Docker (linux/amd64) con `python /app/predict.py --input INPUT.parquet --output predictions.jsonl`.
- Deadline de búsqueda: 2.400 s; el autor remite a `local_checks.json` para las comprobaciones de runtime medidas.
- Latencia y throughput: no disponibles de forma agregada; dependen del tamaño del lote y del deadline configurado.
- Advertencia: el autor indica que el Dockerfile para Linux no se ha probado localmente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Will-of-D/ec-new-v7 | Retrieval + ranker + challenger pairwise | no disponible | no aplica | 0,801466 L4 en fold 5 | no disponible | Hugging Face (0 descargas, 0 likes) |
| Will-of-D v3 (referencia interna) | Retrieval DIAMOND + ranker 33 features | no disponible | no aplica | 0,801426 L4 en fold 5 | no disponible | Referenciado en la model card |
| Alternativas públicas de anotación EC (p. ej. EggNOG-mapper, DeepEC) | Herramientas de anotación funcional | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con otras herramientas de anotación EC en la información proporcionada; la única comparación documentada es contra la variante v3 del mismo autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni razonamiento multi-paso.
- Las métricas reportadas (0,801466 vs 0,801426 L4) son de validación interna en fold 5 y el autor advierte que no predicen la puntuación pública o privada.
- El fallback neuronal de producción y la recuperación ultra-sensitive requieren comprobaciones de runtime y precisión separadas.
- El Dockerfile para linux/amd64 no se ha probado localmente según el autor.
- Licencia no declarada: no se puede asumir uso comercial sin aclaración del autor.
- Idiomas y sesgos: no aplica en el sentido habitual, pero el sistema hereda los sesgos de la referencia de 186.488 secuencias y de las etiquetas de entrenamiento.
- Riesgo de error en consultas sin hit: se contabilizan como cero en la comparación, lo que puede infrarepresentar el rendimiento real en secuencias sin homología.
- Dependencia de la recuperación cacheada: los resultados de fold 5 usan la recuperación original; cambios en la configuración de búsqueda pueden alterar las cifras.
- Sin pipeline de Hugging Face, sin descargas ni likes: madurez y soporte comunitario nulos.
- Fecha de creación y actualización (2026-11-16) en el futuro respecto a la fecha habitual de consulta; verificar la vigencia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/Will-of-D/ec-new-v7
- Model card del autor: incluida en la página de Hugging Face
- `local_checks.json`: referenciado en la model card (comprobaciones de runtime medidas)
- Dockerfile y `predict.py`: incluidos en el repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web.
