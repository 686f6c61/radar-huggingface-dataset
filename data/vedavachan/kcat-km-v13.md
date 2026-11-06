# VedaVachan/kcat-km-v13

## Resumen

kcat-km-v13 es un modelo de regresión de cinética enzimática desarrollado por el usuario VedaVachan y publicado en Hugging Face. Su objetivo es predecir dos parámetros bioquímicos fundamentales para caracterizar una enzima: la constante catalítica (kcat) y la constante de Michaelis (Km), ambas en escala logarítmica (log10). El modelo toma como entrada un identificador, una cadena SMILES del sustrato y la secuencia de aminoácidos de la proteína, y devuelve una predicción por cada fila de entrada.

Técnicamente, no es un modelo de lenguaje generativo sino un regresor multimodal de arquitectura neuronal de dos ramas. La rama proteica utiliza un encoder ESM2 congelado de 8 millones de parámetros que produce vectores de 320 dimensiones, complementados con 23 fracciones de aminoácidos. La rama molecular emplea 2048 bits de Morgan verificados más 16 descriptores RDKit y 16 indicadores de valores ausentes. Ambas ramas se fusionan mediante una red densa con LayerNorm, ReLU y dropout, y terminan en dos cabezas separadas de 64 unidades.

El propio autor lo describe como un candidato exploratorio y no como una mejora confirmada: no se reclama ningún resultado de leaderboard y las métricas de desarrollo son locales. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes, y la model card no especifica licencia, idiomas ni pipeline. Su relevancia es acotada: se trata de un artefacto de investigación reproducible, empaquetado para ejecución offline en CPU, orientado a la predicción de parámetros cinéticos en pipelines de biología computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresor neuronal de dos ramas (encoder proteico congelado + encoder molecular) con fusión densa y dos cabezas de salida |
| Parametros totales | no disponible (el encoder ESM2 congelado aporta 8 M; el resto de la red no se cuantifica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; proteínas de hasta 512 residuos codificadas enteras, y proteínas más largas mediante ventanas de 256 iniciales y 256 finales promediadas |
| Tipos de cuantizacion | no disponible; el encoder se ejecuta en FP32 congelado en CPU |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada SMILES y secuencias de aminoácidos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de dos torres. La torre proteica congela ESM2 8M y extrae un vector de media de residuos de 320 dimensiones, al que se añaden 23 fracciones de aminoácidos, resultando en 343 entradas. Las proteínas de hasta 512 residuos se codifican completas; las más largas se dividen en dos ventanas de 256 residuos (primera y última), se promedian y se descarta la región central. Se excluyen tokens de padding y especiales, y se retienen X, B y U. La torre molecular combina 2048 bits de Morgan verificados, 16 descriptores RDKit y 16 indicadores de ausencia, totalizando 2080 entradas.

Cada rama se proyecta a 128 unidades con ReLU y LayerNorm. La fusión concatena p, m, p\*m, abs(p-m) y pasa por 128 unidades con ReLU y dropout de 0,15, tras lo cual dos cabezas separadas de 64 unidades emiten los dos objetivos logarítmicos. La pérdida seleccionada es la opción A, con 4 épocas fijas determinadas por validación interna por clústeres. Las medianas y escalas de estandarización se reajustaron sobre la release oficial verificada de 42 524 filas (hash a18f8d542c1849507ff1711b970b48b72a998c8c). No se usó ajuste sobre entradas públicas ni caché de entradas embebida. No se realizó búsqueda de hiperparámetros ni blending.

## Capacidades

- Predicción de log10(kcat) y log10(Km) a partir de identificador, SMILES y secuencia proteica.
- Procesamiento de proteínas de hasta 512 residuos sin truncamiento; manejo explícito de proteínas más largas mediante ventanas primera/última.
- Codificación molecular con fingerprints de Morgan y descriptores fisicoquímicos RDKit.
- Manejo robusto de SMILES no parseables (fingerprint cero, medianas de ajuste y flags de ausencia) y de residuos desconocidos (manejo de unknown del tokenizer fijado).
- Deduplicación interna de cadenas exactas con restauración de todas las filas de salida.
- Ejecución offline en CPU sin GPU ni red, con contrato de entrada/salida estricto (Parquet de entrada con columnas id, smiles, sequence; CSV de salida con id, log10_kcat, log10_km).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Anotación de bases de datos enzimáticas: dado un conjunto de pares enzima-sustrato sin parámetros medidos, el modelo genera estimaciones de log10(kcat) y log10(Km) para priorizar experimentos de validación in vitro, aprovechando su capacidad de procesar lotes en CPU sin GPU.
- Filtrado previo en diseño de enzimas: en pipelines de ingeniería de proteínas, se pueden puntuar variantes mutantes frente a un sustrato fijo y descartar candidatas con Km predicha desfavorable antes de ensayos de laboratorio.
- Enriquecimiento de datasets de cinética: la release oficial de 42 524 filas sirve como base de referencia; el modelo permite completar huecos en tablas de kcat/Km manteniendo el contrato de columnas id/smiles/sequence.
- Reproducibilidad en entornos restringidos: al ejecutarse con Dockerfile Linux amd64, 2 CPUs, 16 GiB y límite de 600 segundos, encaja en infraestructura sin aceleradores, útil para evaluaciones internas de bioinformática.
- Detección de inconsistencias en datos: comparar predicciones del modelo con mediciones experimentales puede señalar entradas mal etiquetadas o secuencias/SMILES corruptos, dado el manejo explícito de valores no parseables.
- Investigación metodológica sobre representaciones proteicas: al congelar ESM2 8M y usar medias de residuos, sirve como línea base reproducible para estudiar el impacto de encoders proteicos en la predicción de parámetros cinéticos.
- Benchmarking interno de modelos de cinética: sus métricas locales (SCC medio 0,482464 frente a 0,486186 de ExtraTrees emparejado) permiten comparar alternativas bajo el mismo protocolo de validación por clústeres.

## Benchmarks y rendimiento

Los únicos datos disponibles son métricas de desarrollo locales, no mediciones de leaderboard. El autor indica explícitamente que no se reclama ningún resultado de leaderboard.

| Metrica (desarrollo local) | ExtraTrees emparejado | Neuronal seleccionada |
|---|---|---|
| Mean SCC | 0,486186 | 0,482464 |
| Mean target RMSE | 1,217611 | 1,261508 |

Decisiones científicas declaradas en la model card: `paired_MeanSCC_CI_lower_gt0: false`, `unseen_guard_resolved: true`, `log10_kcat_SCC_delta_ge_minus0.01: true`, `log10_kcat_unseen_SCC_delta_ge_minus0.01: true`, `log10_kcat_RMSE_ratio_le1.02: true`, `log10_km_SCC_delta_ge_minus0.01: false`, `log10_km_unseen_SCC_delta_ge_minus0.01: false`, `log10_km_RMSE_ratio_le1.02: false`. En conjunto, el modelo no supera de forma confirmada al control en Km y no alcanza significación en la comparación pareada de SCC medio.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es CPU-only con el encoder ESM2 congelado en FP32.
- CPU: 2 núcleos según el Dockerfile suministrado.
- Memoria RAM: 16 GiB según el contrato de ejecución.
- GPU recomendadas: no disponibles; no se requiere GPU.
- ¿Cabe en GPU consumer? No aplica, el diseño es explícitamente CPU.
- Opciones de despliegue: Dockerfile Linux amd64 suministrado; ejecución mediante `python /app/predict.py --input INPUT --output OUTPUT`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el único límite documentado es 600 segundos por ejecución.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kcat-km-v13 | Regresor enzima-sustrato | no disponible (ESM2 8M congelado) | 512 residuos | SCC local 0,482464 | no disponible | Hugging Face, 0 descargas |
| ExtraTrees emparejado (control interno) | Ensemble de árboles | no disponible | no aplica | SCC local 0,486186 | no disponible | Referencia interna del autor |
| Otros modelos públicos de predicción kcat/Km | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas públicas comparables en la documentación proporcionada; la única comparación documentada es con el control ExtraTrees del propio desarrollo.

## Limitaciones y advertencias

- El autor califica el modelo como candidato exploratorio y no como mejora confirmada; no hay resultado de leaderboard.
- Los intervalos de bootstrap por clústeres son descriptivos y no eliminan el sesgo de selección optimista.
- La comparación pareada de SCC medio no alcanza significación (`paired_MeanSCC_CI_lower_gt0: false`) y las métricas de Km no cumplen los umbrales de mejora (`log10_km_SCC_delta_ge_minus0.01: false`, `log10_km_unseen_SCC_delta_ge_minus0.01: false`, `log10_km_RMSE_ratio_le1.02: false`).
- El modelo queda por debajo del control ExtraTrees en SCC medio (0,482464 frente a 0,486186) y en RMSE medio (1,261508 frente a 1,217611).
- El entrenamiento completo sobre todos los datos no constituye otra evaluación de holdout, por lo que no debe interpretarse como validación independiente.
- Proteínas de más de 512 residuos pierden la región central al promediar solo las ventanas primera y última, lo que puede degradar predicciones en proteínas largas.
- Los SMILES no parseables se sustituyen por fingerprint cero, medianas de ajuste y flags de ausencia; las predicciones en esos casos son esencialmente imputaciones, no inferencias reales.
- Los residuos desconocidos dependen del manejo de unknown del tokenizer fijado, sin garantía de comportamiento fuera del vocabulario esperado.
- Licencia no especificada: no puede asumirse uso comercial permitido.
- El paquete no incluye evidencia de test ni manifiesto SHA256 en el directorio de subida; la preparación final debe establecerse ejecutando el paquete exacto.
- El repositorio declara 0 GB de tamaño y 0 descargas, lo que sugiere que los pesos podrían no estar efectivamente disponibles en el momento de la consulta.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones plausibles sin validez experimental; toda salida debe validarse in vitro antes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v13
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
