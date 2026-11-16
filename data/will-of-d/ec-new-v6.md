# Will-of-D/ec-new-v6

## Resumen

Will-of-D/ec-new-v6 es un modelo presentado en Hugging Face como "DIAMOND + hierarchy-preserving neural motif expert", orientado a la clasificación de enzimas mediante números EC (Enzyme Commission). No se trata de un modelo de lenguaje generativo, sino de un componente de un pipeline bioinformático que combina una búsqueda de homología con DIAMOND, un ranker basado en árboles potenciados con 33 características y una red neuronal entrenada desde cero sobre fragmentos de secuencia de 3, 4 y 5 residuos.

El modelo resuelve el problema de asignar una clase EC a una secuencia proteica, preservando explícitamente la jerarquía de la clasificación: la decisión final debe compartir los tres primeros componentes (niveles L1, L2 y L3) con la elección original del pipeline v3, de modo que la incorporación de la evidencia neuronal solo puede refinar el nivel más fino (L4). El autor lo desarrolla dentro de un proyecto de investigación propio y lo publica con cero descargas y cero "likes", sin licencia declarada ni idiomas especificados.

La relevancia actual es acotada: es un artefacto de investigación reproducible (Dockerfile para linux/amd64, inferencia en CPU sin GPU ni red) más que un modelo listo para producción. El repositorio ocupa 0,1 GB, la model card no declara licencia y el propio autor advierte que las comparaciones de precisión son locales y no constituyen un resultado de leaderboard verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward sobre fragmentos hasheados de 3, 4 y 5 residuos, combinada con busqueda DIAMOND y ranker de arboles potenciados de 33 caracteristicas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; opera sobre secuencias proteicas completas y fragmentos de 3-5 residuos) |
| Tipos de cuantizacion | no disponible (exportado a NumPy/SciPy; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; procesa secuencias de aminoacidos) |
| Licencia | no disponible |
| Formato de pesos | no disponible (exportado a NumPy/SciPy; PyTorch solo para entrenamiento) |

## Arquitectura y entrenamiento

El sistema tiene tres etapas. Primero, la busqueda DIAMOND original de la v3 (con un primer pase "very-sensitive" y un pase opcional "ultra-sensitive" para hits debiles) y un ranker de arboles potenciados con 33 caracteristicas proponen una clase EC. Segundo, una red neuronal entrenada desde cero sobre fragmentos hasheados de 3, 4 y 5 residuos aporta evidencia de secuencia: el encoder dispone de un pool de embeddings ponderado de 48 dimensiones, normalizacion, una capa oculta GELU de 128 unidades, dropout durante el entrenamiento y una cabeza de clasificacion EC de 4.614 clases. Las estadisticas IDF se ajustan exclusivamente sobre las secuencias de ajuste.

En inferencia, la cabeza EC solo se evalua para los candidatos recuperados. La mezcla elegida es `8 * v3_score + 0.05 * clip(neural_logit - max_logit, -8, 0)`, y la EC final debe compartir los tres primeros componentes con la eleccion original de la v3, lo que preserva las decisiones L1/L2/L3 y el mismo tratamiento de "sin hit". El modelo de motivos se exporta a NumPy/SciPy, de modo que PyTorch solo se necesita para entrenar. El entrenamiento final consta de cuatro epocas sobre las 186.488 secuencias unicas proporcionadas; no se usan datos etiquetados externos, pesos preentrenados, etiquetas de validacion ni datos de test. El ajuste de investigacion usa los folds 8-14 y el desarrollo el fold 6, con evaluacion en los folds 3/4 y en los diagnosticos 5/7, que ya se habian usado en otras partes del proyecto.

## Capacidades

- Clasificacion de enzimas en clases EC mediante busqueda de homologia (DIAMOND) combinada con evidencia neuronal de motivos de secuencia.
- Prediccion restringida a la jerarquia EC: la salida final mantiene los niveles L1, L2 y L3 de la propuesta v3 y solo puede refinar el nivel L4.
- Recuperacion de candidatos mediante hits de DIAMOND con multiples pases de sensibilidad (very-sensitive y ultra-sensitive opcional).
- Manejo explicito de consultas sin hits de DIAMOND, derivadas al modelo neuronal original entrenado solo con datos de entrenamiento.
- Inferencia en CPU sin GPU ni acceso a red.
- Ejecucion reproducible mediante contenedor Docker para linux/amd64 con el comando `python /app/predict.py --input INPUT.parquet --output predictions.jsonl`.
- Procesamiento por lotes con division por limite de ficheros, reintentos por numero de bins y salida de hits comprimida heredados de la v3.
- No dispone de tool calling, capacidades de agente, generacion de texto, vision, audio ni multilingueismo.

## Casos de uso

- Anotacion funcional de proteinas en proyectos de genomica: el pipeline asigna una clase EC a secuencias nuevas combinando homologia y motivos, adecuado para catalogos enzimaticos a gran escala donde se dispone de un servidor CPU.
- Curado de bases de datos enzimaticas: la restriccion de preservar L1/L2/L3 permite usar el modelo como refinamiento conservador de anotaciones existentes sin alterar la familia enzimatica asignada.
- Reproduccion de experimentos de investigacion: el Dockerfile y el script `predict.py` permiten replicar el pipeline completo sobre un parquet de entrada y comparar con la linea base v3.
- Filtrado previo en pipelines de metagenomica: la busqueda DIAMOND con plazo de 900 segundos y 8 hilos encaja en fases de cribado donde se prioriza cobertura de hits sobre latencia baja.
- Analisis de sensibilidad de anotaciones: los pases very-sensitive y ultra-sensitive permiten evaluar como cambia la evidencia para hits debiles antes de decidir la clase EC final.
- Integracion en flujos bioinformaticos contenerizados: al no requerir GPU ni red en inferencia, puede desplegarse en clusters CPU o entornos aislados con requisitos de reproducibilidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona comparaciones locales de precision controlada con hits very-sensitive cacheados en ambos lados, y que el primer experimento neuronal dio resultados mixtos en 5/7 folds, pero no se proporcionan cifras numericas. El autor remite a `EXPERIMENT_RESULT.md` para todos los resultados y advierte que no son un test final intacto ni una puntuacion de leaderboard prometida.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU sin GPU ni red.
- GPU recomendadas: ninguna; el autor indica que no se requiere GPU en inferencia y que PyTorch solo se usa para entrenamiento.
- Cabe en cualquier maquina con CPU y contenedor Docker para linux/amd64; el repositorio ocupa 0,1 GB.
- Despliegue: Docker (Dockerfile incluido), ejecucion directa de `python /app/predict.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; se documenta un plazo de busqueda DIAMOND de 900 segundos y el uso de 8 hilos, pero no cifras de rendimiento medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Will-of-D/ec-new-v6 | Clasificador EC con DIAMOND + red neuronal de motivos | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| v3 DIAMOND + ranker (linea base interna) | Busqueda de homologia + arboles potenciados | no disponible | no aplica | no disponible | Referenciada en la model card, no publicada como artefacto separado |
| Alternativas publicas de prediccion EC | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada; la unica referencia interna es la version v3 del propio pipeline.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita para uso comercial ni para redistribucion; debe contactarse con el autor antes de cualquier uso en produccion.
- Sin datos de benchmarks publicados: las comparaciones de precision son locales y proceden de folds ya utilizados en otras partes del proyecto, por lo que no constituyen una validacion independiente.
- El autor advierte que no se ha subido, enviado ni nominado nada a ningun leaderboard; el usuario decide cuando hacerlo.
- El contenedor Docker para linux/amd64 no se ha probado localmente, lo que introduce riesgo de fallo en el despliegue.
- La salida esta restringida a la jerarquia de la v3: si la propuesta inicial de L1/L2/L3 es erronea, el modelo neuronal no puede corregirla.
- Posible riesgo de sobreajuste a los folds de ajuste (8-14) y desarrollo (6), dado que la seleccion de la mezcla se hizo sobre el fold 6.
- Sin informacion sobre sesgos, cobertura taxonomica, idiomas ni dominios de secuencia fuera del conjunto de 186.488 secuencias proporcionadas.
- No es un modelo de lenguaje: no admite generacion de texto, tool calling, agentes ni razonamiento multi-paso; cualquier expectativa en ese sentido es inaplicable.
- La ausencia de correccion por frecuencia de clase en los datos de ajuste puede sesgar las predicciones hacia clases EC sobrerrepresentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Will-of-D/ec-new-v6
- Resultados de experimentos referenciados en la model card: `EXPERIMENT_RESULT.md` (no se proporciona URL directa)
- Repositorio o paper del pipeline: no disponible
- Demo: no disponible
