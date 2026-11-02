# VallemKeerthi/kcat-km-v6b

## Resumen

`kcat_km_v6b` es un artefacto de machine learning publicado en HuggingFace por el usuario VallemKeerthi que, segun su propia model card, no constituye un modelo de lenguaje ni una red neuronal profunda en el sentido habitual, sino un pipeline de prediccion de parametros enzimaticos (kcat y Km) construido sobre un experimento previo denominado v6-A. El repositorio contiene codigo Python, utilidades de validacion cruzada, scripts de mezcla (blending) y artefactos serializados en formato joblib y ONNX, con un tamano total de 0,4 GB. No se trata, por tanto, de un modelo generativo: no hay pesos de transformer, no hay tokenizador y no hay capacidades de generacion de texto.

El objetivo declarado es mejorar exclusivamente la prediccion de kcat respecto a la version v6-A, manteniendo intacta la prediccion de Km (que se hereda tal cual del arbol de decision de v6-A). El autor es explicito al afirmar que no se reclama ninguna mejora sobre v6-A: el repositorio es un conjunto de herramientas y pasos reproducibles (smoke tests, auditoria, validacion cruzada, blending, entrenamiento final y empaquetado Docker) que el usuario debe ejecutar con sus propios datos (`train.parquet`, `esm_train.npz`) para obtener evidencia real.

La relevancia es limitada fuera del contexto del proyecto original: se trata de un trabajo en curso, sin licencia declarada, sin idiomas soportados, sin pipeline definido y sin resultados de benchmarks publicados. Para desarrolladores e investigadores, la ficha debe interpretarse como una descripcion de un repositorio de investigacion reproducible sobre prediccion de parametros cineticos enzimaticos, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido de modelos tabulares y de embedding: arboles (ExtraTrees, HistGradientBoosting, LightGBM) y red neuronal sobre caracteristicas ESM; no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible (no se publican recuentos de parametros; el repo incluye artefactos joblib y ONNX) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; trabaja con caracteristicas de secuencia de dimensiones 23/687/1440) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; se menciona exportacion a ONNX) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | joblib (`weights/model.joblib`), ONNX, directorio de embeddings ESM (`weights/esm/`) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un ensemble por brazos ("arms") sobre caracteristicas de secuencia enzimatica. Los brazos identificados son `et` (ExtraTrees), `hgb` (HistGradientBoosting), `nn` (red neuronal) y `lgbm` (LightGBM). Las caracteristicas de entrada tienen dimensiones 23, 687 y 1440, y se combinan con embeddings ESM precalculados y cacheados en `esm_train.npz`. El repositorio incluye utilidades de validacion cruzada (`run_cv.py`), mezcla de predicciones (`blend.py`), auditoria (`audit.py`) y entrenamiento final multi-semilla (`train_final.py --seeds 5`).

El entrenamiento no se ha ejecutado sobre los datos reales del usuario segun la propia model card: el autor indica que verifico en su sandbox que el codigo corre, que los smoke tests pasan (dimensiones de caracteristicas, round-trip de cache, paridad NN->ONNX de 3,7e-7, esquema de salida, fallback ESM estricto/no estricto), que `blend.py` funciona sobre datos OOF sinteticos y que se hizo un piloto de una sola fold sin ESM sobre un dataset publico sustituto (DLKcat). No se verifico nada sobre los datos reales, los pesos ESM reales, un build de Docker ni el leaderboard. La innovacion tecnica destacable es el control de calidad del blending: el peso de mezcla solo se aplica si la ganancia anidada es >= 0,01 y el intervalo de confianza por cluster-bootstrap esta por encima de 0.

## Capacidades

- Prediccion de kcat y Km a partir de secuencias enzimaticas y caracteristicas derivadas, mediante un ensemble de arboles y una red neuronal.
- Prediccion de Km heredada exactamente del arbol de v6-A, sin cambios.
- Prediccion de kcat potencialmente mejorada mediante blending condicionado a validacion estadistica.
- Exportacion a ONNX con paridad verificada frente a la red neuronal original (error 3,7e-7).
- Fallback explicito: con `STRICT_EMBED=1` aborta si falta un embedding ESM; sin esa variable, las filas sin embedding reciben prediccion solo de arbol y se emite un WARNING.
- kNN desactivado por defecto (peso 0 en v6-A); se puede reactivar con `USE_KNN=1`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Prediccion de parametros cineticos enzimaticos en pipelines de biologia computacional: el pipeline permite estimar kcat y Km a partir de secuencias y caracteristicas ESM, integrándose en flujos de anotacion funcional de enzimas.
- Reproduccion de experimentos de investigacion: los pasos 1 a 8 de la model card permiten reproducir smoke tests, auditoria, validacion cruzada, blending y entrenamiento final con datos propios, lo que resulta adecuado para validar hipotesis antes de publicar resultados.
- Auditoria de calidad de datos: `audit.py` genera `results/audit.json` con comprobaciones sobre `train.parquet` y `esm_train.npz`, util para detectar problemas de dimensiones o de cache antes de entrenar.
- Seleccion de modelos tabulares: la comparacion de brazos (`et`, `hgb`, `nn`, `lgbm`) mediante validacion cruzada permite decidir que familia de modelos funciona mejor sobre un dataset concreto de enzimas.
- Mejora controlada de predicciones: `blend.py` con `--write` guarda `weights/blend.json` solo si la ganancia supera el umbral y el CI es positivo, lo que evita sobreajustes en la mezcla de predicciones.
- Despliegue contenerizado: el Dockerfile permite construir una imagen linux/amd64 y ejecutar inferencia por lotes con `--input`/`--output`, con limite de tiempo de 600 s, adecuado para entornos de evaluacion.
- Verificacion de paridad NN/ONNX: util en pipelines de despliegue que requieren exportar a ONNX y comprobar que las predicciones coinciden con la implementacion original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas sobre los datos reales del usuario; solo menciona verificaciones de smoke tests (paridad NN->ONNX de 3,7e-7, dimensiones de caracteristicas 23/687/1440) y un piloto sin ESM sobre DLKcat, sin cifras de rendimiento publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,4 GB, pero no se especifican requisitos de GPU; el pipeline es mayoritariamente tabular y de embeddings precalculados.
- GPU recomendadas: no disponibles. El flujo de Docker se documenta con `--cpus 2 -m 16g`, lo que sugiere ejecucion en CPU con 16 GB de RAM.
- Cabe en GPU consumer: no confirmado; al no ser un modelo de lenguaje grande, es plausible que funcione en CPU, pero no hay datos publicados.
- Opciones de despliegue: Docker (linux/amd64), ejecucion directa con Python (`predict_v6b.py`, `predict.py`), exportacion ONNX.
- Latencia y throughput estimados: no disponibles. Se menciona un limite de 600 s para la ejecucion Docker de validacion en un Mac emulado, sin cifras de throughput.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (prediccion de kcat/Km con embeddings ESM y ensembles tabulares); la unica referencia es la version previa v6-A del mismo autor, sobre la que este repositorio se construye sin reclamar mejora.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni procesa vision; cualquier uso en esos dominios es inadecuado.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Sin resultados verificados sobre datos reales: el autor indica explicitamente que no ha verificado nada sobre `train.parquet`, `esm_train.npz`, pesos ESM reales, build de Docker ni leaderboard.
- No se reclama mejora sobre v6-A: si el blending no supera el umbral estadistico, la recomendacion del autor es no enviar v6-B y mantener v6-A.
- Dependencia de embeddings ESM: sin ellos, las filas reciben prediccion solo de arbol y se emite un WARNING; con `STRICT_EMBED=1` el proceso aborta.
- kNN desactivado por defecto (peso 0 en v6-A); su reactivacion con `USE_KNN=1` no esta validada en la informacion disponible.
- Riesgo de sobreajuste en la mezcla: mitigado por el umbral de ganancia >= 0,01 y el CI por cluster-bootstrap, pero no verificado sobre datos reales.
- Sin idiomas ni sesgos documentados: al no ser linguistico, no aplican sesgos de lenguaje, pero tampoco hay evaluacion de sesgos en las predicciones cientificas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/VallemKeerthi/kcat-km-v6b
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
