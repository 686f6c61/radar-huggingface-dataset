# Will-of-D/ec-new-v5

## Resumen

ec-new-v5 es un sistema experimental de clasificación de enzimas (asignación de números EC, Enzyme Commission) desarrollado por el usuario Will-of-D. No se trata de un modelo de lenguaje neuronal, sino de un pipeline híbrido de recuperación y reordenación que combina búsquedas de similitud de secuencias con MMseqs2 y DIAMOND, junto con un re-ranker basado en árboles potenciados (boosted trees) exportado a NumPy puro. El objetivo es predecir la etiqueta EC de una secuencia proteica a partir de una referencia de entrenamiento proporcionada.

El sistema se presenta como una evolución del pipeline previo denominado v3, del que hereda el fallback neuronal entrenado solo con datos de entrenamiento y la búsqueda muy sensible de DIAMOND. La novedad de v5 es la incorporación de MMseqs2 como fuente independiente de candidatos y una fusión conservadora (alpha 0.5) entre ambas señales. El autor advierte explícitamente de que los resultados locales no establecen una mejora fiable sobre v3.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa: se trata de un artefacto de competición o evaluación de clasificación proteica, sin pesos neuronales preentrenados externos, con un repositorio de 0,1 GB y sin descargas ni valoraciones en HuggingFace en el momento de la consulta. La información disponible proviene exclusivamente de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido de recuperación (MMseqs2 + DIAMOND) con re-ranker de árboles potenciados exportado a NumPy; fallback neuronal entrenado solo con datos de entrenamiento |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre secuencias proteicas) |
| Tipos de cuantización | no disponible (no aplica; los árboles se exportan a NumPy puro) |
| Idiomas soportados | no disponible (no aplica; entrada de secuencias proteicas y salida de etiquetas EC) |
| Licencia | MIT |
| Formato de pesos | no disponible; el repositorio contiene índices de referencia, binarios de MMseqs2/DIAMOND y árboles exportados a NumPy |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo de lenguaje. La arquitectura es un pipeline de dos etapas: recuperación de candidatos y reordenación. En la recuperación, MMseqs2 y DIAMOND buscan de forma independiente sobre la misma referencia de entrenamiento. MMseqs2 usa un índice preconstruido con sensibilidad 7,5, 20 candidatos de prefiltrado, e-value 0,001 y identidad/cobertura de alineamiento exactas. DIAMOND mantiene la búsqueda very-sensitive de 50 hits de v3 y una pasada opcional ultra-sensitive. En la reordenación, un árbol potenciado utiliza 83 características derivadas de la unión de las etiquetas EC candidatas de ambos buscadores; su puntuación se mezcla con la de v3 con alpha 0,5. Si falta evidencia de MMseqs2 se conserva v3; si faltan ambas búsquedas se usa el fallback neuronal de v3.

Los datos de entrenamiento son únicamente el `train.parquet` suministrado: 223.764 pares secuencia/EC, 186.488 secuencias únicas y 4.614 etiquetas EC. No se usan datos etiquetados externos, bases de datos proteicas ni pesos proteicos preentrenados. La selección del modelo se hizo sobre el fold 0 con exclusión de clústeres al 50 % de identidad y criterio de máxima cota inferior de bootstrap de clúster al 95 %; la configuración se congeló antes de comprobar los folds 3 y 4. Los árboles comparadores se ajustaron a los folds 5–14. El autor reconoce que estos folds ya se usaron en experimentos anteriores del proyecto, por lo que no constituyen un conjunto de test intacto ni una estimación de leaderboard.

## Capacidades

- Clasificación de enzimas: asigna una etiqueta EC a una secuencia proteica a partir de una referencia de entrenamiento.
- Recuperación por similitud de secuencias con MMseqs2 (sensibilidad 7,5, e-value 0,001) y DIAMOND (very-sensitive, 50 hits, pasada ultra-sensitive opcional).
- Reordenación de candidatos con un árbol potenciado de 83 características sobre la unión de candidatos EC de ambos buscadores.
- Fusión conservadora de puntuaciones con alpha 0,5 respecto al pipeline v3.
- Fallback neuronal entrenado solo con datos de entrenamiento cuando no hay evidencia de búsqueda.
- Ejecución por lotes de MMseqs2 en bloques de 2.000 consultas con límite de 220 segundos y presupuesto compartido de búsqueda de 535 segundos.
- Selección automática de binario AVX2 o SSE2 en el build, con registro del sabor exacto usado para crear el índice.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües en el sentido habitual de modelos generativos.

## Casos de uso

- Anotación funcional de proteínas en pipelines bioinformáticos: el sistema recibe secuencias y devuelve etiquetas EC usando índices de referencia locales, sin necesidad de red en tiempo de predicción.
- Evaluación en competiciones o leaderboards de clasificación enzimática: el pipeline está empaquetado en Docker con límites de tiempo y memoria pensados para un evaluador de 600 segundos.
- Procesamiento por lotes de validación: se midió el procesamiento de 11.367 entradas únicas de validación en 452,4 segundos en CPU de Mac con dos hilos por herramienta.
- Reproducción de resultados de v3: al desactivar MMseqs2, el sistema reproduce exactamente el pipeline v3 original, lo que permite comparaciones controladas.
- Investigación sobre fusión de buscadores de similitud: el código y los artefactos permiten estudiar el efecto de combinar MMseqs2 y DIAMOND con un re-ranker de árboles.
- Despliegue en entornos sin conectividad: el índice se construye en el build de Docker y está presente en tiempo de predicción, de modo que la inferencia no requiere red.
- Análisis de ablación de características: las 83 características del re-ranker y los registros de intentos (alpha 1 frente a alpha 0,5) permiten reproducir decisiones de diseño.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las comparaciones locales por fold entre v3 y el híbrido, medidas con L4 (presumiblemente una métrica de accuracy top-1 a nivel 4 de EC):

| Fold | v3 L4 | Hybrid L4 | Diferencia |
|---|---:|---:|---:|
| 3 | 0,799952 | 0,799365 | -0,000587 |
| 4 | 0,834436 | 0,834617 | +0,000181 |

Diferencia agrupada: -0,000203; intervalo de confianza al 95 % por bootstrap de clústeres: [-0,001311, +0,000667]. El ajuste final de fusión usó 122.165 consultas out-of-fold y 441.580 filas de candidatos. El autor indica que estos folds no son un test intacto y que no hay estimación de leaderboard. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; el pipeline no usa GPU según la información disponible.
- CPU: se selecciona AVX2 si está soportado y SSE2 en caso contrario; el sabor del binario que creó el índice se registra y debe usarse en inferencia.
- Cabe en hardware de consumo: sí, según la comprobación local en CPU de Mac; no se especifican requisitos mínimos de CPU ni memoria.
- Despliegue: Docker con binarios Linux de MMseqs2 y DIAMOND incluidos; el índice se construye durante el build.
- Límites de ejecución: lotes de MMseqs2 de 2.000 consultas, límite de 220 segundos para MMseqs2 y presupuesto compartido de 535 segundos de búsqueda dentro de un evaluador de 600 segundos.
- Latencia y throughput: 11.367 entradas únicas de validación procesadas en 452,4 segundos en CPU de Mac con dos hilos por herramienta, con límites de 16 MiB por fichero escrito, 256 ficheros abiertos y pila de 10 MiB.
- Advertencia: las comprobaciones locales son en macOS; el build y la ejecución en Docker Linux no se han probado localmente.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Métrica local | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-new-v5 | Híbrido MMseqs2 + DIAMOND + re-ranker de árboles | Solo `train.parquet` (223.764 pares) | L4 fold 3: 0,799365; fold 4: 0,834617 | MIT | HuggingFace, 0 descargas |
| v3 (pipeline previo del mismo autor) | DIAMOND + fallback neuronal | Solo datos de entrenamiento | L4 fold 3: 0,799952; fold 4: 0,834436 | no disponible | Referenciado en la model card |
| EnzymeRanker-X (AbhijeetKumar2125) | Recuperación con MMseqs2 y voto exponencial de EC | no disponible | no disponible | no disponible | HuggingFace |
| retrieval-v7 (AbhijeetKumar2125) | Recuperación | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks comparables de los modelos de referencia citados; la comparación se limita a la naturaleza del pipeline y a la licencia y disponibilidad conocidas.

## Limitaciones y advertencias

- El propio autor advierte de que los resultados locales no establecen una mejora fiable sobre v3; la diferencia agrupada es negativa (-0,000203) y el intervalo de confianza incluye el cero.
- Los folds 3 y 4 ya se habían usado en experimentos anteriores del proyecto; no son un conjunto de test intacto ni una estimación de leaderboard.
- El build y la ejecución en Docker Linux no se han probado localmente; solo hay smoke tests de build y comprobaciones en macOS.
- No se han probado los límites de CPU y memoria del evaluador en local.
- El sistema depende de binarios de MMseqs2 y DIAMOND incluidos; si el ejecutable no puede ejecutarse en inferencia, se conserva el pipeline v3.
- No se mezclan índices de ID internos de 32 y 64 bits; un error en el sabor del binario puede invalidar la inferencia.
- El fallback neuronal está entrenado solo con datos de entrenamiento y no usa pesos proteicos preentrenados, lo que limita su generalización fuera de la distribución.
- No hay información sobre sesgos, riesgo de alucinación en el sentido de modelos generativos, ni restricciones adicionales de licencia más allá de MIT.
- El repositorio tiene 0 descargas y 0 valoraciones, por lo que no hay validación externa de la comunidad.
- No se dispone de información sobre idiomas, cuantización ni formato de pesos en el sentido habitual.

## Enlaces

- HuggingFace: https://huggingface.co/Will-of-D/ec-new-v5
- EnzymeRanker-X (referencia citada): https://huggingface.co/AbhijeetKumar2125/EnzymeRanker-X
- retrieval-v7 (referencia citada): https://huggingface.co/AbhijeetKumar2125/da3410-ec-retrieval-v7
