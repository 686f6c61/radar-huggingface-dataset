# SymmetryAdvantage/WyFormer-MP-BandGap-PBE

## Resumen

WyFormer-MP-BandGap-PBE es un regresor cristalográfico desarrollado por SymmetryAdvantage que predice el band gap PBE (GGA/GGA+U) de un cristal a partir únicamente de su representación de Wyckoff: grupo espacial, posiciones de Wyckoff ocupadas y elementos que las ocupan, sin necesidad de coordenadas atómicas. El modelo se publica como parte del proyecto WyFormer (Kazeev et al., ICML 2025, arXiv:2503.02407) y se distribuye con licencia CC BY 4.0 a través de la librería `wyckoff-transformer`, con 0 descargas y 0 likes en el momento de la consulta.

Su utilidad es de triaje: permite descartar candidatos probablemente metálicos o de gap estrecho de una población de "genes" generados antes de gastar tiempo de MLIP o DFT en relajarlos y caracterizarlos. La arquitectura es deliberadamente compacta —un encoder transformer de 3 capas con embeddings en cascada para elemento, simetría de sitio y enumeración, seguido de pooling y un MLP de 3 capas— y el ejemplo oficial de la model card se ejecuta en CPU, lo que lo hace apto para integrarse en scripts de screening sin GPU.

El entrenamiento usa la release 2026.09.28 de Materials Project (147.417 materiales con gap y estructura del mismo cálculo GGA o GGA+U), con métricas publicadas de MAE 0,356 eV en el split de test PBE y 0,183 eV en un conjunto disjunto con etiquetas r2SCAN. El autor advierte explícitamente de su punto débil: al no transportar longitudes de enlace, los genes de un solo elemento se predicen mal (el silicio diamante, con gap PBE de 0,61 eV, sale a 0,01 eV).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 3 capas (4 cabezas, FFN 320, dropout 0,1) con embeddings en cascada (elemento 40, simetría de sitio 40, enumeración 16), pooling de media ponderada y MLP de 3 capas |
| Parámetros totales | No disponible (la model card no publica el recuento) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de tokens; límite práctico de 61 sitios de Wyckoff por gen (las estructuras con más sitios se excluyeron del entrenamiento) |
| Tipos de cuantización | No disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible (la model card no declara idiomas; la entrada es una representación cristalográfica, no lenguaje natural) |
| Licencia | CC BY 4.0 |
| Formato de pesos | No disponible (la carga se realiza con `WyckoffTrainer.from_huggingface`; el repositorio figura con 0,0 GB en HuggingFace) |

## Arquitectura y entrenamiento

El modelo tokeniza el gen cristalino con el tokenizador `der_tokenizer_v1`, que aumenta las simetrías de sitio y las enumeraciones sobre las descripciones equivalentes de cada conjunto de Wyckoff. Sobre esa secuencia aplica embeddings en cascada de dimensión 40 (elemento), 40 (simetría de sitio) y 16 (enumeración), un encoder transformer de 3 capas con 4 cabezas de atención, FFN de 320 y dropout 0,1, un pooling de media ponderada y un MLP de 3 capas que emite un escalar (el gap en eV). La pérdida es MSE y el entrenamiento usa AdamW con lr 1e-3 y weight decay 0,01, scheduler warmup-stable-decay, batch de 1000 y 4000 épocas. El run de W&B es `3t16iys0`, entrenado el 2026-10-23 en la máquina `hera` desde el commit `110ba09`, con la configuración `yamls/models/mp_2026_gga_gap/der/band_gap_adamw_wsd.yaml`.

Los datos proceden de Materials Project release 2026.09.28, restringida a materiales cuyo band gap y estructura provienen del mismo cálculo GGA o GGA+U: 147.417 materiales (105.803 GGA, 41.614 GGA+U), de los cuales el 53,5 % tienen gap mayor que cero. Solo se incluyen materiales con licencia CC BY, lo que excluye los 113 materiales GNoME que MP sirve bajo CC BY-NC. Tras eliminar las estructuras con más de 61 sitios de Wyckoff quedan 141.696 materiales, con splits aleatorios sembrados con 20260909 y un test de 14.206 genes. La etiqueta es el valor PBE de MP, que subestima el gap experimental; el autor recomienda un umbral de screening de 0,5 eV por ser conservador a la hora de calificar un material como aislante. Las etiquetas son idénticas a las de la release 2026.04.13, ya que la 2026.09.28 añadió unos 117.000 materiales con gaps r2SCAN.

## Capacidades

- Predicción de band gap PBE a partir exclusivamente de la representación de Wyckoff (grupo espacial, posiciones ocupadas y elementos), antes de que existan coordenadas atómicas.
- Screening de poblaciones de genes generados: descartar candidatos probablemente metálicos o de gap estrecho antes de gastar tiempo de MLIP o DFT.
- Estimación de dispersión mediante `predict_gene_scalars(genes, model, augmentation_samples=N)`, que promedia N descripciones equivalentes de cada gen y reporta su spread como señal de incertidumbre aproximada.
- Transferencia entre funcionales: evaluado sobre un conjunto disjunto con etiquetas r2SCAN (11.680 materiales), con MAE 0,183 eV, aunque el autor recalca que no es una comparación like-for-like.
- Ejecución en CPU (`device=torch.device("cpu")` en el ejemplo oficial), sin requisito de GPU.
- Entrada en formato de diccionario (grupo espacial, lista de especies, número de iones y sitios de Wyckoff); no procesa texto libre, imágenes ni audio, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Screening previo en pipelines generate-then-relax: dado un lote de genes generados, `predict_gene_scalars` devuelve un gap estimado por gen en una sola pasada, de modo que el pipeline puede descartar la fracción metálica antes de invocar un MLIP o un cálculo DFT.
- Búsqueda de semiconductores con gap objetivo: filtrar genes con gap predicho dentro de una ventana concreta (por ejemplo, aplicación del umbral de 1,0 eV, donde el modelo reporta precisión 0,830 y recall 0,855) para alimentar una lista corta de candidatos.
- Búsqueda de aislantes para dieléctricos: aplicar el umbral conservador de 0,5 eV (precisión 0,837, recall 0,862) para separar candidatos con gap claramente positivo de los metálicos.
- Triaje de colas de cálculo DFT: ordenar los materiales pendientes por gap predicho y calcular primero los que caen cerca de un umbral de decisión, reduciendo el coste computacional de una campaña.
- Enriquecimiento de datasets: etiquetar de forma aproximada grandes conjuntos de estructuras generadas con un gap PBE estimado para preentrenar o priorizar modelos posteriores, asumiendo el MAE de 0,356 eV.
- Estimación de fiabilidad por candidato: usar el spread entre las 8 augmentaciones del ejemplo oficial como criterio para decidir qué genes merecen validación DFT y cuáles pueden descartarse sin más.
- Integración en CI o entornos sin GPU: al ejecutarse en CPU, el modelo puede incorporarse a scripts de validación de propuestas estructurales dentro de un repositorio, tal como muestra el snippet de la model card con LiCl.
- Detección de fallos de tokenización: al no puntuar genes que usan tokens no vistos (596 casos en el conjunto r2SCAN), puede emplearse como comprobación de cobertura del vocabulario `der_tokenizer_v1` sobre un corpus nuevo.

## Benchmarks y rendimiento

Resultados del split de test, calculados por la ruta de screening (`predict_gene_scalars`, media sobre 8 descripciones equivalentes por gen) con `scripts/evaluate_band_gap.py`. "P/R @ t" es la precisión y el recall del filtro "gap predicho >= t eV".

| Split de test | n | MAE (eV) | RMSE (eV) | MAE, gap real > 0 (eV) | P / R @ 0,5 eV | P / R @ 1,0 eV |
|---|---|---|---|---|---|---|
| Este dataset (PBE) | 14.206 | 0,356 | 0,764 | 0,539 | 0,837 / 0,862 | 0,830 / 0,855 |
| MP 2026.09.28 r2SCAN (otro funcional, materiales disjuntos) | 11.680 | 0,183 | 0,536 | 0,782 | 0,853 / 0,682 | 0,837 / 0,647 |

La fila r2SCAN es una comprobación de transferencia, no una puntuación equiparable: sus etiquetas son gaps r2SCAN, mayores que los PBE, y el 80 % de ellas son cero. 596 de sus genes usan tokens que este modelo nunca vio y no se puntúan.

Ejemplos concretos citados por el autor:

| Gen | Gap predicho (eV) | Gap PBE de MP (eV) |
|---|---|---|
| Si diamante | 0,01 | 0,61 |
| LiCl | 6,24 | 6,25 |
| Li2O | 5,09 | 4,90 |

No se han publicado resultados de benchmarks en la información disponible para comparaciones con arquitecturas ajenas a la familia WyFormer.

## Requisitos de hardware

- El ejemplo oficial de la model card ejecuta la inferencia en CPU (`device=torch.device("cpu")`), por lo que no se requiere GPU para usar el modelo.
- VRAM estimada: no disponible. La arquitectura descrita (3 capas, FFN de 320, vocabularios de 40/40/16) corresponde a un modelo muy compacto, pero el recuento de parámetros no se publica.
- GPU recomendadas: no disponibles. Por el tamaño descrito, no se anticipan requisitos de memoria altos, pero el autor no aporta cifras ni hardware de inferencia de referencia.
- Encaje en GPU de consumo: previsiblemente sí en cualquier GPU consumer actual, aunque no hay medición publicada que lo confirme; el camino validado es CPU.
- Opciones de despliegue: librería `wyckoff-transformer` con `WyckoffTrainer.from_huggingface(...)` y la función `predict_gene_scalars` de la rama `main`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste por gen escala con `augmentation_samples` (8 en el ejemplo) y con el tamaño del lote; no se publican tiempos.
- Entrenamiento: el run `3t16iys0` se ejecutó el 2026-10-23 en la máquina `hera`; no se detalla su configuración de GPU.

## Comparativa con modelos similares

| Modelo | Tarea | Etiqueta / funcional | n (test) | MAE (eV) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WyFormer-MP-BandGap-PBE | Gap a partir de Wyckoff | PBE (GGA/GGA+U) | 14.206 | 0,356 | CC BY 4.0 | HuggingFace, vía `wyckoff-transformer` |
| WyFormer-MP-BandGap-r2SCAN | Gap a partir de Wyckoff | r2SCAN | 11.680 | 0,183 (transferencia, no like-for-like) | No disponible en la información | HuggingFace, mismo autor |
| Otros predictores de band gap (ALIGNN, MEGNet, SchNet y similares) | Gap a partir de estructura con coordenadas | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La comparación relevante dentro de la información disponible es con el modelo hermano r2SCAN: misma familia y misma representación de entrada, pero etiquetas de otro funcional y un conjunto disjunto con un 80 % de gaps cero, por lo que sus métricas no son intercambiables con las del modelo PBE. No se aportan datos de comparativas frente a modelos basados en estructura completa (con coordenadas), que es la categoría funcional más cercana.

## Limitaciones y advertencias

- Genes de un solo elemento: al no transportar longitudes de enlace, el modelo falla en casos donde la geometría es determinante. El silicio diamante (gap PBE 0,61 eV, presente en entrenamiento) se predice a 0,01 eV, indistinguible de sus parientes metálicos del mismo conjunto de Wyckoff.
- Precisión limitada: MAE de 0,356 eV en el test PBE y de 0,539 eV si se restringe a materiales con gap real mayor que cero. No es una herramienta de predicción cuantitativa fina, sino de cribado.
- Sesgo del funcional: las etiquetas son PBE, que subestima el gap experimental. Cualquier comparación con medidas de laboratorio o con gaps r2SCAN/HSE arrastra ese sesgo sistemático.
- Límite estructural: las estructuras con más de 61 sitios de Wyckoff quedaron fuera del entrenamiento, de modo que la cobertura en celdas grandes no está garantizada.
- Extrapolación no calibrada: la dispersión entre augmentaciones es una señal heurística, no una calibración formal de incertidumbre; no debe interpretarse como un intervalo de confianza.
- Cobertura de vocabulario: los genes con tokens ausentes del tokenizador no se puntúan (596 casos en el conjunto r2SCAN), lo que puede dejar fuera composiciones o simetrías no vistas.
- Dependencia de la rama `main`: `predict_gene_scalars` no está en una release y `scripts/predict.py` no maneja las simetrías de sitio aumentadas de este tokenizador, por lo que la ruta oficial de inferencia está ligada al código en desarrollo.
- Licencia: CC BY 4.0 permite uso comercial con atribución; los materiales GNoME servidos por MP bajo CC BY-NC quedaron excluidos del entrenamiento, pero conviene verificar la procedencia de los datos si se redistribuyen derivados.
- Estado del repositorio: 0 descargas y 0 likes en HuggingFace y un tamaño reportado de 0,0 GB, sin detalle del formato de los pesos; verificar la integridad del checkpoint antes de desplegarlo.
- No aplica el riesgo de alucinación en sentido generativo (el modelo emite un escalar), pero sí el riesgo de error silencioso: una predicción baja en un material que sí es aislante puede eliminar un candidato válido del pipeline sin aviso.
- Idiomas: no procede; el modelo no procesa lenguaje natural, por lo que no hay soporte multilingüe que evaluar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SymmetryAdvantage/WyFormer-MP-BandGap-PBE
- Modelo hermano con etiquetas r2SCAN: https://huggingface.co/SymmetryAdvantage/WyFormer-MP-BandGap-r2SCAN
- Repositorio de código WyckoffTransformer: https://github.com/SymmetryAdvantage/WyckoffTransformer
- Paper de WyFormer (Kazeev et al., ICML 2025): https://arxiv.org/abs/2503.02407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/symmetry-advantage/WyckoffTransformer/runs/3t16iys0
- Materials Project: https://materialsproject.org
- Paper de Materials Project (Jain et al., APL Materials 1, 011002, 2013): https://doi.org/10.1063/1.4812323
