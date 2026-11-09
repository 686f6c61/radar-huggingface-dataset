# UBC-SLIME/sparcol-lexicon-large-c2000

## Resumen

SPARCOL-Lexicon (ModernBERT-large, 2000 clusters) es un checkpoint final de un modelo de representación léxica dispersa desarrollado por el grupo UBC-SLIME, asociado al artículo "Learned Sparse Lexical Representations for Large-scale Authorship Attribution" (Findings de EMNLP 2026). Se construye sobre el backbone `answerdotai/ModernBERT-large` y está diseñado específicamente para atribución de autoría a gran escala, no como un modelo generativo al uso.

El modelo no produce texto: emite una representación dispersa por token de 2000 dimensiones, donde cada dimensión corresponde a un clúster léxico aprendido durante el entrenamiento. La puntuación entre documentos se realiza mediante MaxSim (estilo ColBERT) promediado sobre los tokens no nulos de la consulta, lo que permite recuperación dispersa eficiente sobre grandes corpus.

Su relevancia radica en combinar recuperación léxica dispersa con asignación de clústeres aprendida de extremo a extremo, evitando el paso de k-means en inferencia y permitiendo un pipeline de atribución de autoría escalable. Es un checkpoint de investigación con licencia MIT, sin resultados de benchmarks publicados en esta release.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabecera de clústeres léxicos dispersos |
| Parámetros totales | 395.831.296 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,6 GB), más `cluster_ids.pt` con asignaciones de clúster |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-large` como backbone y añade una capa de agrupamiento léxico: la salida es un vector disperso por token de 2000 dimensiones, donde las asignaciones de tokens a clústeres se aprenden durante el entrenamiento y se guardan en `cluster_ids.pt`. En inferencia no debe re-ejecutarse k-means; las asignaciones se cargan junto con los pesos. Las activaciones de token usan log1p(ReLU), sin tokens CLS/SEP y sin reescalado de embeddings.

El checkpoint corresponde al paso de entrenamiento 1580 (época 2.0) de la ejecución `exp2/outputs_clustered_colbert_modernbert_large_2000_relu_scale1_nocls`. La puntuación se calcula con MaxSim promediado sobre los tokens no nulos de la consulta (`clustered_maxsim`). El empaquetado añade configuración portátil del módulo y elimina logs y ejemplos de entrenamiento; los pesos y asignaciones de clúster se preservan del checkpoint original. No se han vuelto a ejecutar las evaluaciones HRS para esta release.

## Capacidades

- Representación léxica dispersa por token (2000 dimensiones) para recuperación y comparación de documentos.
- Atribución de autoría a gran escala mediante puntuación MaxSim entre representaciones.
- Recuperación dispersa (sparse retrieval) sobre corpus de documentos.
- Asignación de clústeres léxicos aprendida, sin necesidad de k-means en inferencia.
- Procesamiento de secuencias de hasta 512 tokens.
- Solo inglés.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Atribución de autoría forense: comparar un texto anónimo con un conjunto de candidatos puntuando MaxSim sobre representaciones dispersas, aprovechando la señal léxica por token.
- Detección de plagio y reutilización de textos: recuperar documentos con solapamiento léxico mediante el índice disperso de 2000 dimensiones.
- Deduplicación de corpus a gran escala: agrupar documentos por similitud léxica dispersa con coste de almacenamiento reducido frente a embeddings densos.
- Análisis estilométrico: usar las dimensiones de clúster como features interpretables para clasificadores posteriores de estilo o autor.
- Recuperación léxica en pipelines de búsqueda: integrar el modelo como primer estadio de recuperación dispersa antes de un re-ranker denso.
- Investigación en representaciones léxicas aprendidas: reproducir el artículo y experimentar con el número de clústeres y el esquema de activación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha vuelto a ejecutar la evaluación HRS para esta release y que no se reclaman nuevos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en bf16 para los pesos (395 M de parámetros), más overhead de activaciones para lotes de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100/H100 para lotes grandes y alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060, 4060, 4090 y similares.
- Opciones de despliegue: el código de referencia (`lingjzhu/neural_lexical`) con PyTorch y autocast bf16; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPARCOL-Lexicon large c2000 | 395,8 M | 512 | Atribución de autoría / recuperación dispersa | MIT | Hugging Face |
| ModernBERT-large (base) | ~395 M | 8192 | Encoder general | Apache 2.0 (según modelo base) | Hugging Face |
| ColBERTv2 | ~110 M | 512 | Recuperación densa por token | MIT | Hugging Face / GitHub |

La comparación con alternativas de atribución de autoría específicas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Ventana de contexto limitada a 512 tokens.
- No es un modelo generativo: no sirve para chat, código, matemáticas ni razonamiento.
- No se han publicado benchmarks en esta release; el rendimiento real no está verificado de forma independiente.
- Requiere cargar `cluster_ids.pt` junto con los pesos y usar el código de `neural_lexical`; no es plug-and-play con `sentence-transformers` estándar pese a la etiqueta de librería.
- Riesgo de sesgo heredado del corpus de entrenamiento de ModernBERT-large y del dataset de atribución, no documentado en la model card.
- Aunque la licencia es MIT, conviene revisar las condiciones del modelo base y de los datos de entrenamiento antes de uso comercial.
- Checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte limitados.

## Enlaces

- Hugging Face: https://huggingface.co/UBC-SLIME/sparcol-lexicon-large-c2000
- Paper (ACL Anthology): https://aclanthology.org/2026.findings-emnlp.400/
- Código de referencia: https://github.com/lingjzhu/neural_lexical
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
