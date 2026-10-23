# yzzpz/Charged-checkpoints

## Resumen

`yzzpz/Charged-checkpoints` no es un modelo de lenguaje, sino un repositorio de checkpoints (1,2 GB) entrenados para la previsión probabilística del volumen horario de recarga de vehículos eléctricos a nivel de estación. Lo publica el usuario `yzzpz` junto con el código de entrenamiento y evaluación (repositorio `Charged` en GitHub) y el conjunto de datos asociado alojado en HuggingFace, y cubre seis ciudades identificadas por códigos (`LOA`, `JHB`, `MEL`, `SPO`, `SZH`, `AMS`).

El backbone es `mldi-lab/Kairos_23m`, un modelo de aproximadamente 23 millones de parámetros que el código de entrenamiento descarga automáticamente. Sobre él se montan dos cabezas: una de predicción puntual (`plain_pre72_fold6.pth`) y otra de cuantiles por estación (`quant_pre72_fold6.pth`), que constituye el método principal del trabajo. La configuración es `seq_l=72` pasos de entrada con horizontes de predicción H=24/48/72, split limpio ("clean") y fold 6, y la métrica principal es la suma de CRPS (crpsΣ).

Su relevancia es operativa: a medida que crece el parque de vehículos eléctricos, los gestores de puntos de recarga, los agregadores y los operadores de red necesitan bandas de incertidumbre por estación, no solo una predicción puntual, para comprar energía, dimensionar capacidad y gestionar congestión. El repositorio incluye además ablaciones backbone × cabeza (PatchTST) y alternativas generativas (CSDI en bloque y difusión con estado absorbente), lo que lo hace útil como banco de comparación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el backbone `Kairos_23m`. Los checkpoints incluyen cabezas de predicción puntual y de cuantiles por estación, más variantes de referencia basadas en PatchTST, CSDI y TimeDiff |
| Parámetros totales | 23 M en el backbone (según la nomenclatura `Kairos_23m`); total agregado del repositorio no disponible |
| Longitud de contexto | `seq_l = 72` pasos temporales de entrada |
| Horizontes de predicción | 24, 48 y 72 pasos (H=24/48/72) |
| Tipos de cuantización | No disponible (checkpoints en coma flotante PyTorch, formato `.pth`) |
| Idiomas soportados | No aplicable (modelo de series temporales, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | `.pth` (state dict de PyTorch) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del backbone `Kairos_23m` (no se indica si es un transformer, un modelo linear o un híbrido); solo se especifica que se descarga automáticamente desde `mldi-lab/Kairos_23m` al ejecutar el código de entrenamiento. Sobre ese backbone se añade una cabeza de predicción puntual y, en el método principal, una cabeza de cuantiles por estación que produce la distribución predictiva por punto de recarga. El protocolo utiliza el split "clean", `seq_l=72` y el fold 6, con horizontes de 24, 48 y 72 pasos horarios.

El repositorio incluye además tres familias de referencia usadas como ablación o comparación: `patchtst_quant_clean` (solo `MEL` y `SPO`), que sustituye el backbone manteniendo la cabeza de cuantiles; `csdi_clean` (5 ciudades), con una variante CSDI en bloque y una variante de difusión con estado absorbente (`zidiff`); y `timediff_nomix_clean` (solo `MEL` y `SPO`), una referencia TimeDiff sin future mixup. No se especifican en la información proporcionada el número de tokens, la composición del dataset de entrenamiento ni si hubo ajuste por RLHF/DPO (no aplicable en este dominio). Sí se documenta una innovación metodológica relevante: la versión con future mixup (`result/timediff_clean/`) se excluye deliberadamente porque su sampler colapsa (MPIW50 ≈ 0,02) y sus métricas se consideran inválidas.

## Capacidades

- Predicción puntual del volumen horario de recarga por estación (`plain_pre72_fold6.pth`).
- Predicción probabilística mediante cabeza de cuantiles por estación (`quant_pre72_fold6.pth`), el método principal del trabajo.
- Cobertura multi-horizonte: 24, 48 y 72 pasos hacia delante.
- Modelado multi-ciudad: `LOA`, `JHB`, `MEL`, `SPO`, `SZH` y `AMS`, con esta última reportada por separado.
- Generación de escenarios mediante CSDI en bloque (5 ciudades) y difusión con estado absorbente (`zidiff`, 5 ciudades).
- Ablación controlada backbone × cabeza mediante variantes PatchTST en `MEL` y `SPO`.
- Referencia TimeDiff sin future mixup en `MEL` y `SPO`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni capacidades multilingües: no es un modelo generativo de propósito general.

## Casos de uso

- Compra de energía por parte de agregadores y operadores de puntos de recarga: la cabeza de cuantiles permite construir bandas de demanda horaria por estación y negociar en mercados mayoristas con una estimación explícita del riesgo, en lugar de depender de una única predicción puntual.
- Planificación de capacidad en baja tensión para distribuidores (DSO): los horizontes de 24 a 72 horas con intervalos por estación permiten identificar alimentadores con riesgo de sobrecarga en las horas punta y priorizar refuerzos de red.
- Tarificación dinámica y gestión de congestión: un operador puede fijar precios por franja usando los cuantiles altos como umbral de activación de tarifas disuasorias, reduciendo la probabilidad de colas en hubs con alta ocupación.
- Dimensionamiento de nueva infraestructura: las previsiones por estación y por ciudad sirven para estimar cuántos puntos de recarga adicionales requiere una ubicación antes de que la demanda supere la capacidad instalada.
- Mantenimiento predictivo y detección de anomalías: comparar el volumen observado con la distribución prevista permite marcar estaciones cuyo comportamiento se sale de la banda esperada (averías, vandalismo, cambios de uso del suelo).
- Gestión de flexibilidad y V2G: los escenarios generados por CSDI y por difusión con estado absorbente alimentan simulaciones de carga y descarga bidireccional, donde se necesita una distribución completa y no solo la media.
- Evaluación comparativa de métodos de previsión: el repositorio funciona como banco de pruebas reproducible (Kairos con cabeza de cuantiles frente a PatchTST, CSDI y TimeDiff) para equipos de investigación que trabajan en series temporales con estructura de panel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la métrica principal es crpsΣ (suma de CRPS) y remite al README del repositorio de GitHub para el protocolo de evaluación y los valores por ciudad. El único dato numérico presente es MPIW50 ≈ 0,02, correspondiente al sampler colapsado de la variante TimeDiff con future mixup, cuyas métricas el autor declara inválidas y que no se incluye en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 para el backbone de 23 M de parámetros más las cabezas (estimación derivada del recuento de parámetros, no de mediciones publicadas). Cargar simultáneamente todos los checkpoints del repositorio puede situarse en el entorno de 2-4 GB.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con al menos 4 GB de memoria es suficiente; para entrenamiento o ajuste fino conviene una RTX 3090/4090 o una A100/H100 si se procesan todas las ciudades en paralelo.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050/3060/4060 y superiores. La inferencia en CPU es viable para lotes pequeños dada la escala del modelo, aunque la latencia no está documentada.
- Opciones de despliegue: carga directa de state dicts `.pth` con PyTorch. No hay integración publicada con vLLM, llama.cpp, Ollama ni TGI, y ninguna de ellas aplica a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Horizontes | Licencia | Disponibilidad en el repositorio |
|---|---|---|---|---|---|
| Kairos_23m + cabeza de cuantiles (método principal) | 23 M (backbone) | `seq_l = 72` | 24/48/72 | No disponible | `kairos_l1_clean/<CITY>/quant_pre72_fold6.pth`, 6 ciudades |
| PatchTST + cabeza de cuantiles (ablación) | No disponible | `pre24` | No disponible | No disponible | `patchtst_quant_clean/<CITY>/patch_quant_pre24_fold6.pth`, solo `MEL` y `SPO` |
| CSDI en bloque / difusión con estado absorbente | No disponible | No disponible | No disponible | No disponible | `csdi_clean/<CITY>_csdi.pth` y `_zidiff.pth`, 5 ciudades |
| TimeDiff sin future mixup (referencia) | No disponible | No disponible | No disponible | No disponible | `timediff_nomix_clean/<CITY>_timediff.pth`, solo `MEL` y `SPO` |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no admite instrucciones en lenguaje natural, tool calling ni razonamiento de agentes.
- La licencia no está declarada, lo que impide determinar si el uso comercial es admisible; es un bloqueo legal potencial para cualquier despliegue en producción.
- La cobertura geográfica se limita a seis códigos de ciudad cuyo significado no se documenta en la información disponible; no hay garantía de transferencia a otras redes de recarga con patrones de uso distintos.
- `AMS` se reporta por separado porque aproximadamente el 95,9 % de sus estaciones permanecen congeladas durante el periodo de test; no debe incluirse en promedios entre ciudades sin justificación explícita.
- Solo se publica el fold 6 del split "clean". No hay validación cruzada documentada en la información disponible, por lo que la varianza entre folds es desconocida.
- Los checkpoints de TimeDiff con future mixup (`result/timediff_clean/`) están deliberadamente ausentes porque su sampler colapsa (MPIW50 ≈ 0,02); reutilizarlos produciría métricas inválidas.
- Dependencia de un backbone externo (`mldi-lab/Kairos_23m`) que se descarga en tiempo de entrenamiento; su disponibilidad futura y su licencia condicionan la reproducibilidad.
- El repositorio registra 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- Riesgo de alucinación y sesgos lingüísticos: no aplicable. En su lugar, el riesgo relevante es la mala calibración de los intervalos predictivos ante regímenes no vistos (por ejemplo, cambios tarifarios, interrupciones de servicio o festivos locales).
- No se han publicado métricas de calibración, cobertura empírica de los intervalos ni latencias en la información disponible, lo que dificulta una evaluación previa al despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yzzpz/Charged-checkpoints
- Dataset asociado: https://huggingface.co/datasets/yzzpz/Charged-data
- Código de entrenamiento y evaluación: https://github.com/yzzpz1015/Charged
- Backbone (dependencia externa): https://huggingface.co/mldi-lab/Kairos_23m
