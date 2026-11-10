# tim-shu/drug-affinity-rf-baseline

## Resumen

`tim-shu/drug-affinity-rf-baseline` es un modelo de regresión tabular para predecir la afinidad de unión (pKi) de moléculas pequeñas frente a 162 dianas proteicas humanas. No es un modelo de lenguaje ni una red neuronal: se trata de un conjunto de 162 `RandomForestRegressor` de scikit-learn, uno por diana, serializados con joblib. El autor es `tim-shu` y el modelo se publica como baseline de investigación congelado (seed 42) del proyecto de afinidad molecular multi-fuente.

El problema que resuelve es acotado y clásico en descubrimiento de fármacos: dado un SMILES completo de un ligando y un identificador UniProt de proteína, estimar pKi = −log10(Ki en mol/L), donde valores más altos implican unión más fuerte. La selección de proteína se hace mediante `targets.json`; el identificador no entra como variable numérica en el modelo, sino que sirve para enrutar a uno de los 162 bosques entrenados.

Su relevancia es la de un punto de referencia reproducible y ligero (unos 362 MB de bosques, repo de 0,4 GB) para comparar aproximaciones más complejas, como modelos de grafos o de lenguaje químico. Las métricas publicadas se calculan con macro-promedio por diana: MAE 0,575935 pKi en test, RMSE 0,747746 y Spearman 0,693083. El modelo se entrenó solo con el split de train (163.330 pares), sin refit con validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de 162 `RandomForestRegressor` (scikit-learn), uno por diana proteica |
| Parámetros totales | No disponible (modelo no neuronal; 100 árboles por bosque, tamaño de repo 0,4 GB, ~362 MB de bosques) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular: fingerprint Morgan 2048 bits + 8 descriptores) |
| Tipos de cuantización | No disponible (no procede; serialización joblib) |
| Idiomas soportados | en, ru (según metadatos; sin impacto en la tarea) |
| Licencia | No disponible |
| Formato de pesos | joblib (scikit-learn); artefactos auxiliares JSON (`targets.json`, `prediction_examples.json`, `verification.json`, `manifest.json`) |

## Arquitectura y entrenamiento

Cada diana tiene su propio bosque aleatorio con 100 árboles, `min_samples_leaf=1` y `max_features="sqrt"`. La representación de entrada combina un fingerprint Morgan con quiralidad (radio 2, 2048 bits) y ocho descriptores fisicoquímicos: peso molecular, logP, TPSA, donadores de enlace de hidrógeno (HBD), aceptores (HBA), enlaces rotables, número de anillos y átomos pesados. Se conservan todos los componentes desconectados, cargas y estereoquímica especificada. La configuración corresponde al experimento congelado `RF_full_descriptors` con seed 42.

Los datos provienen del dataset `tim-shu/drug-affinity-multisource` (configuración `baseline_benchmark`), con 204.847 pares en total: 163.330 de train, 20.427 de validación y 21.090 de test. Las fuentes son ChEMBL, BindingDB y DrugCentral. Los pares estructura completa/proteína definen las etiquetas y las particiones se agrupan por scaffold químico común para evitar fuga de información entre splits. La selección del modelo se hizo por MAE macro de validación promediado sobre las seeds 42/43/44, con una puntuación de selección de 0,594075 pKi. Los pesos subidos corresponden a la seed 42 entrenada solo con train, sin refit con train+validación.

## Capacidades

- Regresión de afinidad (pKi) para moléculas pequeñas descritas por SMILES completo frente a 162 dianas humanas identificadas por acceso UniProt.
- Manejo de estructuras multicomponente, cargas y estereoquímica especificada en el fingerprint.
- Predicción por lotes mediante la API `AffinityBaseline.predict(lista_smiles, target_id=...)`.
- Interfaz de línea de comandos (`affinity_predictor.py --target ... --smiles ...`) e integración como módulo Python.
- Verificación de integridad mediante `manifest.json` con checksums SHA-256 y `verification.json` con la comprobación de inferencia local.
- Ejemplos de referencia de predicción para todas las dianas soportadas en `prediction_examples.json`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un regresor tabular.

## Casos de uso

- Filtrado virtual inicial en descubrimiento de fármacos: dada una biblioteca de SMILES, calcular pKi frente a una diana concreta para priorizar compuestos antes de ensayos bioquímicos, usando el bosque correspondiente al acceso UniProt.
- Priorización de compuestos en cribado masivo: ejecutar predicciones por lotes con `AffinityBaseline.predict` sobre listas de SMILES y ordenar por pKi estimado para seleccionar candidatos.
- Baseline reproducible en publicaciones y tesis: comparar modelos más complejos (GNN, transformers químicos) contra estas métricas macro por diana (MAE 0,575935, RMSE 0,747746, Spearman 0,693083 en test).
- Análisis de selectividad entre dianas: predecir el mismo ligando contra varias de las 162 proteínas y estudiar el perfil relativo de afinidad, con la cautela de que cada bosque se entrenó de forma independiente.
- Validación de pipelines de quimioinformática: usar `prediction_examples.json` y `verification.json` como pruebas de regresión para comprobar que las versiones exactas de scikit-learn y RDKit de `requirements.txt` producen las predicciones esperadas.
- Docencia y prototipado rápido: montar un servicio de estimación de afinidad sin GPU, con Python 3.12 y dependencias ligeras, para demostrar el flujo SMILES → descriptores → predicción.
- Enriquecimiento de datasets internos: generar una señal de afinidad previa para compuestos sin medición experimental y decidir qué pares merecen caracterización experimental.

## Benchmarks y rendimiento

Métricas publicadas en la model card para la seed 42, con macro-promedio por diana (todas las dianas ponderan igual):

| Split | Macro MAE (pKi) | Macro RMSE (pKi) | Macro Spearman |
|---|---:|---:|---:|
| Validación | 0,594005 | 0,775525 | 0,691222 |
| Test | 0,575935 | 0,747746 | 0,693083 |

Puntuación de selección (MAE macro de validación promediada sobre seeds 42/43/44): 0,594075 pKi. No se han publicado en la información disponible comparaciones numéricas con otros modelos en la misma tabla.

## Requisitos de hardware

- Inferencia en CPU: el modelo no requiere GPU; los bosques se cargan en memoria y la predicción es aritmética de árboles.
- Memoria RAM: el repositorio ocupa 0,4 GB y los bosques unos 362 MB; se recomienda al menos 2-4 GB de RAM libre para cargar el conjunto y procesar lotes.
- GPU recomendadas: no aplica; ninguna GPU es necesaria ni aporta ventaja significativa.
- Cabe en cualquier equipo de consumo: portátil convencional, contenedor pequeño o función serverless con suficientes límites de memoria.
- Despliegue: script incluido `affinity_predictor.py` con Python 3.12 y `requirements.txt`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no proceden para este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de árboles, del lote y del hardware.
- Requisito crítico: usar exactamente las versiones de scikit-learn y RDKit indicadas en `requirements.txt`, ya que los pesos están serializados con joblib y pueden ser incompatibles entre versiones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tim-shu/drug-affinity-rf-baseline` | Random Forest tabular (162 bosques) | No disponible (no neuronal) | No aplica | Test: MAE 0,575935, RMSE 0,747746, Spearman 0,693083 | No disponible | Hugging Face, repo 0,4 GB |
| Alternativas GNN de predicción de afinidad | Red neuronal de grafos | No disponible | No aplica | No disponible en esta ficha | No disponible | No disponible |
| Alternativas de transformers químicos | Transformer sobre SMILES | No disponible | No disponible | No disponible en esta ficha | No disponible | No disponible |

No se dispone en la información proporcionada de resultados numéricos de modelos comparables sobre el mismo dataset y partición, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Solo cubre las 162 dianas listadas en `targets.json`; no generaliza directamente a proteínas no vistas.
- La precisión puede degradarse en estructuras químicas alejadas de los compuestos de entrenamiento.
- Las condiciones experimentales, el pH y las poses de unión no son entradas explícitas del modelo.
- La afinidad predicha no establece efecto terapéutico ni una nueva indicación clínica.
- El test no es una evaluación ciega nueva: parte de los datos subyacentes se examinó en experimentos anteriores del proyecto.
- Cada bosque se entrena de forma independiente por diana; las comparaciones de pKi entre dianas deben interpretarse con cautela.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la atribución y licencias de los datos fuente en el repositorio del dataset antes de usos productivos.
- Dependencia estricta de versiones de scikit-learn y RDKit; cambios de versión pueden alterar o romper la carga de los pesos joblib.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de predicciones poco fiables fuera del dominio de aplicabilidad químico.
- Sesgos conocidos: no documentados en la información disponible; el desbalance por diana y la cobertura desigual de ChEMBL, BindingDB y DrugCentral pueden sesgar el rendimiento por proteína.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tim-shu/drug-affinity-rf-baseline
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/tim-shu/drug-affinity-multisource
- Código de reproducción del entrenamiento: carpeta `baseline_study/reproduction/` del repositorio del dataset
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
