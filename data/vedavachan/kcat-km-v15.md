# VedaVachan/kcat-km-v15

## Resumen

kcat-km-v15 es un modelo predictivo de cinética enzimática desarrollado por VedaVachan (Vangala Vedavachan Reddy) que estima los parámetros cinéticos `kcat` y `Km` a partir de la secuencia de aminoácidos de una enzima y la representación SMILES de un sustrato. No es un modelo de lenguaje: se trata de un ensamblado híbrido de árboles de decisión (LightGBM y ExtraTrees) combinado con una red neuronal multicapa (MLP) pequeña, empaquetado junto con un script de inferencia offline para CPU.

El modelo predice `log10_kcat` y `log10_km`, y se evalúa con la métrica Mean SCC (media de la correlación de Spearman para ambos parámetros). Su relevancia es acotada: el autor lo marca explícitamente como **EXPLORATORY**, ya que no superó la puerta de validación local pre-registrada. La mejora frente a su predecesor V14 es marginal (+0,002 a +0,008 en Mean Spearman) y estadísticamente no resuelta, con intervalos de confianza pareados al 95 % que incluyen el cero.

El repositorio ocupa 0,5 GB e incluye pesos en formato safetensors y joblib. La versión V14 subyacente obtuvo un Mean SCC de 0,5145 en la clasificación oficial, pero para V15 no se reclama ninguna puntuación de leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado híbrido: 3 miembros de árboles (50% LightGBM + 50% ExtraTrees multi-salida) + MLP multitarea (3103→512→256, GELU, dos cabezas) |
| Parametros totales | no disponible (ensamblado de árboles + MLP pequeño; no se declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 3.103 características por par enzima-sustrato) |
| Tipos de cuantizacion | no aplica (árboles y MLP; sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors y joblib |
| Entrada | Columnas `id, smiles, sequence` (Parquet) |
| Salida | CSV con columnas `id, log10_kcat, log10_km` |
| Encoder congelado | `facebook/esm2_t6_8M_UR50D` (MIT) |
| Hardware de inferencia | CPU únicamente, offline, sin red |

## Arquitectura y entrenamiento

El modelo combina tres componentes. El primero es el ensamblado de árboles V14, sin cambios: tres miembros (A, B y C) que operan sobre 3.103 características compartidas —composición, orden y características regionales de la proteína, descriptores RDKit, huellas Morgan-count y MACCS, y el embedding medio congelado de ESM2-8M—, más estadísticas de referencia ajustadas al objetivo (prior del sustrato; el miembro B añade estadísticas de enzimas vecinas y el C de sustratos similares). Cada miembro es una media al 50 % de LightGBM por objetivo y ExtraTrees multi-salida, y los tres miembros se promedian por igual.

El segundo componente es una MLP multitarea nueva: un tronco compartido 3103→512→256 con activación GELU y dropout, dos cabezas de salida, sobre las mismas 3.103 características estandarizadas con estadísticas de entrenamiento, promediando 3 semillas. La predicción final es `0,8 * árboles + 0,2 * MLP` para ambos objetivos; el peso 0,2 se eligió únicamente sobre una partición local interna.

El entrenamiento usó exclusivamente `train.parquet` (42.524 filas) del release `starkAhmed43/leak-curber-kcat-km`, revisión `a18f8d542c1849507ff1711b970b48b72a998c8c`. Las estadísticas de referencia se ajustaron con validación cruzada dentro de cada partición (folds disjuntos por clúster) para evitar fuga de etiquetas. La arquitectura se inspiró en el diseño de referencia `aura6_files.zip`, pero es una implementación independiente sin código ni pesos copiados.

## Capacidades

- Predicción de `log10_kcat` y `log10_km` a partir de secuencia de enzima y SMILES de sustrato.
- Procesamiento por lotes mediante CLI: `python /app/predict.py --input INPUT.parquet --output OUTPUT.csv`.
- Funcionamiento completamente offline y en CPU, sin dependencia de red ni servicios externos.
- Extracción de características proteicas mediante ESM2-8M congelado, descriptores químicos RDKit y huellas moleculares.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión, audio o modo thinking.

## Casos de uso

- **Cribado enzimático a gran escala**: dado un catálogo de secuencias y sustratos candidatos, generar predicciones de `kcat` y `Km` en lote por CPU para priorizar experimentos in vitro antes de validación de laboratorio.
- **Priorización de mutantes**: comparar variantes de una misma enzima frente a un sustrato fijo para identificar candidatos con mayor actividad catalítica o afinidad, usando las predicciones como filtro preliminar.
- **Anotación de bases de datos biológicas**: enriquecer registros con estimaciones de parámetros cinéticos cuando no existen mediciones experimentales, aceptando la incertidumbre del modelo.
- **Diseño de vías metabólicas**: estimar la viabilidad cinética de enzimas candidatas en una ruta sintética antes de construir el organismo.
- **Integración en pipelines de bioinformática**: el script CLI y el formato Parquet/CSV permiten encadenar el modelo en flujos automatizados en entornos Linux amd64 sin acceso a red.
- **Selección de sustratos para experimentos**: explorar el espacio de sustratos SMILES frente a una enzima concreta para descartar combinaciones poco prometedoras y ahorrar coste experimental.
- **Referencia metodológica**: servir como ejemplo de ensamblado de árboles con embeddings proteicos congelados para tareas de regresión molecular.

## Benchmarks y rendimiento

Resultados locales medidos (SCC de Spearman; V14 entre paréntesis). Todas las particiones son locales y reutilizadas, no conjuntos de test independientes:

| split | kcat | Km | Mean | ganancia pareada M2 [IC 95 %] |
|---|---|---|---|---|
| inner | 0,3926 (0,3901) | 0,6773 (0,6727) | 0,5350 (0,5314) | +0,0030 [−0,012, +0,019] |
| development | 0,4294 (0,4248) | 0,6470 (0,6445) | 0,5382 (0,5346) | +0,0021 [−0,010, +0,014] |
| confirmation | 0,5037 (0,4941) | 0,7119 (0,7036) | 0,6078 (0,5988) | +0,0078 [−0,002, +0,019] |

El Mean SCC oficial de V14 en el leaderboard es 0,5145, inferior a estas cifras locales porque las enzimas del leaderboard están más alejadas de las de entrenamiento (medido con similitud de 3-mer; estimaciones locales ajustadas al desplazamiento ~0,49–0,56). Para V15 no se reclama puntuación de leaderboard.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- El repositorio pesa 0,5 GB, por lo que cabe en memoria RAM convencional de cualquier equipo de desarrollo.
- Sin requisitos de VRAM declarados.
- Despliegue mediante el script `predict.py` incluido, con dependencias locales (LightGBM, scikit-learn, PyTorch, RDKit, ESM2).
- Entorno de referencia: Linux amd64; las predicciones pueden variar ligeramente entre plataformas CPU por diferencias de coma flotante que afectan a decisiones de vecinos y umbrales de árboles.
- No se declaran latencias ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v15 | Ensamblado de árboles + MLP con ESM2-8M | no disponible | no aplica | MIT | Hugging Face (VedaVachan) |
| V14 (predecesor) | Ensamblado de árboles | no disponible | no aplica | MIT | Hugging Face (VedaVachan) |
| CatPred | Predicción de kcat, Km y Ki | no disponible | no aplica | no disponible | catpred.com |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Marcado como EXPLORATORY por el autor: no superó la puerta de validación local pre-registrada.
- Generalización débil a enzimas novedosas y compuestos no vistos, especialmente en `kcat`.
- La MLP aislada es más débil que los árboles y detiene el entrenamiento en las épocas 1–3; solo aporta diversidad.
- Las predicciones pueden variar ligeramente entre plataformas CPU; no hay garantía de reproducibilidad bit a bit fuera de Linux amd64.
- Se almacenan estadísticas agregadas ajustadas por enzima/sustrato exactos como estado del modelo (ver NOTICE.md), lo que puede implicar memorización parcial de pares del conjunto de entrenamiento.
- Sin datos de sesgos, idiomas ni alucinación, al no ser un modelo generativo.
- Licencia MIT permite uso comercial, pero el estado exploratorio y la ausencia de validación independiente desaconsejan su uso en producción sin verificación experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v15
- Perfil del autor: https://huggingface.co/VedaVachan/models
- Dataset de entrenamiento: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Encoder ESM2: https://huggingface.co/facebook/esm2_t6_8M_UR50D
- CatPred (referencia del dominio): https://www.catpred.com/
