# UBC-SLIME/splade-lexicon-large-c8000

## Resumen

SPLADE-Lexicon-large-c8000 es un modelo de recuperación dispersa (sparse retrieval) especializado en atribución de autoría a gran escala, desarrollado por el grupo UBC-SLIME. Se construye mediante fine-tuning supervisado del backbone `answerdotai/ModernBERT-large`, un transformer encoder de 395,8 millones de parámetros con ventana máxima de 512 tokens. El modelo produce una representación vectorial dispersa de 8000 dimensiones por documento, en la que cada dimensión corresponde a un clúster léxico aprendido durante el entrenamiento, no a un token del vocabulario original. Esto lo diferencia de SPLADE clásico, que expande términos del vocabulario del tokenizador.

El problema que resuelve es la atribución de autoría: determinar qué autor escribió un texto dado, en escenarios con muchos autores candidatos y documentos de longitud variable. La combinación de representaciones léxicas dispersas con agrupamiento de tokens permite capturar estilometría (elecciones léxicas, patrones de uso) manteniendo eficiencia de recuperación mediante índices invertidos, algo que los embeddings densos no permiten de forma nativa.

Es relevante porque acompaña una publicación en Findings de EMNLP 2026 y porque publica pesos y asignaciones de clúster bajo licencia MIT, lo que facilita reproducir el pipeline. El checkpoint corresponde al paso 1582 (época 2.0) del run `exp2/outputs_clustered_modernbert_large_8000_relu_reg5e-3`. No se han publicado resultados de benchmarks nuevos para esta release; el autor indica explícitamente que la evaluación completa de HRS no se ha vuelto a ejecutar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabeza de proyección dispersa y pooling fusionado; salida de 8000 dimensiones agrupadas |
| Parametros totales | 395.831.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,6 GB), más `cluster_ids.pt` con asignaciones de clúster |
| Libreria | sentence-transformers |
| Dimension de salida | 8000 (dispersa); top-1024 recomendado para evaluación del paper |
| Regularizador FLOPS | 5e-3 (queries y documentos) |
| Funcion de activacion | ReLU, seguida de mean pooling fusionado y un `log1p` post-pooling |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-large, un encoder transformer con atención rotatoria y soporte de secuencias de hasta 8192 tokens en su forma original; aquí se restringe a 512 tokens por la configuración del entrenamiento. Sobre el backbone se añade una proyección que mapea las representaciones contextuales a 8000 dimensiones, cada una asociada a un clúster de tokens. Los clústeres se aprenden durante el entrenamiento y se guardan en `cluster_ids.pt`; en inferencia deben cargarse con los pesos y no recalcularse con k-means.

El entrenamiento aplica activación ReLU sobre la proyección, un pooling de media fusionado que excluye el padding y una operación `log1p` posterior al pooling. Se usa un regularizador FLOPS con peso 5e-3 tanto para queries como para documentos, lo que induce dispersión en la salida. El checkpoint publicado corresponde al paso 1582, época 2.0. La implementación de referencia está en el repositorio `lingjzhu/neural_lexical`, con ruta Triton y fallback PyTorch (`module.use_triton=False` para CPU) que preserva el orden de activaciones. La release elimina logs de entrenamiento y ejemplos de datos, y añade configuración portable del módulo.

## Capacidades

- Generación de embeddings dispersos de documento completo: una única representación de 8000 dimensiones por texto.
- Atribución de autoría a gran escala: puntuación por producto escalar entre embeddings de documentos (`embeddings @ embeddings.T`).
- Recuperación léxica dispersa compatible con índices invertidos, al estilo SPLADE.
- Expansión de términos mediante clústeres léxicos aprendidos, en lugar de expansión sobre el vocabulario del tokenizador.
- Procesamiento de documentos de hasta 512 tokens, con exclusión correcta del padding en el pooling.
- Inferencia en GPU con autocast bfloat16 y ruta Triton; fallback PyTorch para CPU.
- No dispone de tool calling, function calling, capacidades agénticas, visión ni audio.
- No dispone de modo de razonamiento (thinking mode) ni de generación de texto libre: es un encoder de representaciones.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Atribución de autoría forense: dado un texto anónimo, comparar su embedding disperso de 8000 dimensiones contra una base de documentos de autores conocidos y ordenar por producto escalar. Adecuado porque la representación dispersa captura elecciones léxicas estilísticas y permite indexación eficiente a gran escala.
- Detección de pluma en foros y redes: agrupar mensajes por autor probable usando la similitud entre embeddings, con top-1024 dimensiones para reducir coste de comparación. Útil en moderación y análisis de comunidades.
- Verificación de autoría en publicaciones científicas o prensa: comparar estilos entre artículos para detectar firmas duplicadas o textos atribuidos erróneamente, aprovechando la ventana de 512 tokens para fragmentos representativos.
- Recuperación de documentos por similitud estilística: construir un índice invertido sobre las dimensiones activas y recuperar textos de estilo similar, algo que los embeddings densos no permiten con índices léxicos.
- Análisis de evolución estilística de un autor: comparar embeddings de documentos de distintas épocas del mismo autor para medir deriva de estilo, con la métrica de producto escalar como medida de proximidad.
- Filtrado previo en pipelines de atribución multi-etapa: usar el modelo como primera etapa de recuperación de candidatos (top-k por similitud dispersa) antes de un verificador más costoso, gracias a la eficiencia de la representación dispersa.
- Investigación en representaciones léxicas aprendidas: replicar el pipeline del paper con el código de `neural_lexical` y los clústeres publicados, sin necesidad de reentrenar la asignación de clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluación completa de HRS no se ha vuelto a ejecutar para esta release y que no se reclaman nuevos resultados de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,6 GB en safetensors; con bfloat16 los pesos ocupan aproximadamente 0,8 GB, más activaciones y buffers. Una GPU con 8 GB o más es suficiente para lotes moderados.
- GPU recomendadas: cualquier GPU con soporte bfloat16 y Triton (A100, H100, L40S, RTX 4090, RTX 3090). Para CPU, usar el fallback PyTorch con `module.use_triton=False`.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el despliegue previsto es mediante `sentence-transformers` con el código de `lingjzhu/neural_lexical` y PyTorch.
- Latencia y throughput: no disponible. La ventana máxima de 512 tokens y la salida de 8000 dimensiones condicionan el coste; el top-1024 reduce el almacenamiento y el coste de comparación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPLADE-Lexicon-large-c8000 (este) | 395,8 M | 512 | Dispersa 8000 dims (clústeres léxicos) | MIT | Hugging Face |
| SPLADE clásico (p. ej. naver/splade-cocondenser) | ~110 M | 512 | Dispersa sobre vocabulario del tokenizador | MIT/Apache según variante | Hugging Face |
| ModernBERT-large base | 395,8 M | 8192 (original) | Densa 1024 dims | Apache 2.0 | Hugging Face |
| Embeddings densos estilo sentence-transformers | Variable | Variable | Densa | Variable | Hugging Face |

La diferencia principal frente a SPLADE clásico es que la expansión se realiza sobre 8000 clústeres léxicos aprendidos en lugar de sobre el vocabulario del tokenizador, lo que permite capturar patrones estilísticos agregados. Frente a ModernBERT-large base, este checkpoint está especializado en atribución de autoría y produce representaciones dispersas indexables. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado para otros idiomas.
- Ventana limitada a 512 tokens: documentos más largos deben fragmentarse o truncarse, lo que puede perder señal estilística.
- Sin benchmarks publicados para esta release: el autor no reclama resultados nuevos y la evaluación HRS no se ha reejecutado.
- Dependencia del código externo: requiere el repositorio `lingjzhu/neural_lexical` y cargar `cluster_ids.pt` junto con los pesos; no es un pipeline autónomo de `sentence-transformers` estándar.
- Orden de activaciones sensible: ReLU, mean pooling fusionado y `log1p` post-pooling deben respetarse; alterar el orden invalida las representaciones.
- Riesgo de sesgo: al ser un modelo de atribución de autoría, puede amplificar sesgos estilísticos presentes en los datos de entrenamiento y producir atribuciones erróneas en textos cortos, atípicos o altamente editados.
- Riesgo de alucinación en sentido de falsos positivos de atribución: la similitud por producto escalar no garantiza identidad de autor; debe usarse como señal de recuperación, no como veredicto.
- Restricciones de licencia: MIT permite uso comercial, pero conviene revisar las condiciones del backbone ModernBERT-large (Apache 2.0) y citar el paper correspondiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de adopción aún inexistente, sin garantías de mantenimiento.
- Inferencia en CPU requiere el fallback PyTorch explícito; sin él, la ruta Triton puede fallar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UBC-SLIME/splade-lexicon-large-c8000
- Paper: https://aclanthology.org/2026.findings-emnlp.400/
- Código de referencia: https://github.com/lingjzhu/neural_lexical
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
