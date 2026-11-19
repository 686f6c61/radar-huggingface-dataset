# VedaVachan/kcat-km-v20

## Resumen

kcat-km-v20 es un modelo de prediccion de parametros de cinetica enzimatica desarrollado por VedaVachan Reddy (IIT Madras) para estimar el numero de recambio (kcat) y la constante de Michaelis (Km) a partir de la secuencia aminoacidica de una enzima y el SMILES del sustrato. No es un modelo de lenguaje generativo, sino un ensemble de aprendizaje automatico supervisado que combina caracteristicas de un modelo de lenguaje proteico (ESM2-35M) con descriptores quimicos calculados mediante RDKit, y sobre ellas entrena arboles de decision (LightGBM y ExtraTrees) junto con una pequena red neuronal MLP.

El modelo se entrena exclusivamente con los 42.524 registros oficiales de un conjunto de datos de competicion, sin datos externos, y predice valores en escala logaritmica (log10_kcat y log10_km). Su metrica principal es la correlacion de Spearman por objetivo, promediada entre kcat y Km, con un resultado de 0,5255 en la validacion oficial. La relevancia practica reside en que la caracterizacion experimental de la cinetica enzimatica es costosa y lenta, por lo que un predictor razonable permite priorizar candidatos en ingenieria de proteinas y diseno de biocatalizadores.

El modelo esta disenado para ejecutarse en CPU dentro de una imagen Docker, con un mecanismo de proteccion en tiempo de ejecucion que cambia a un ensemble mas ligero (ESM2-8M) cuando la entrada es demasiado grande. El repositorio ocupa 1,1 GB, principalmente por los pesos del codificador ESM2 y los artefactos de los arboles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble no neuronal: 4 miembros de arboles (50% LightGBM + 50% ExtraTrees cada uno) promediados, combinados con 0,2 x MLP; caracteristicas de ESM2-35M (6 primeras capas) + descriptores RDKit + caracteristicas auxiliares cross-fitted |
| Parametros totales | no disponible (el componente mas grande es ESM2-35M, con aproximadamente 35 millones de parametros, congelado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en sentido de LLM; las secuencias se segmentan en ventanas de 1.022 residuos |
| Tipos de cuantizacion | no disponible (artefactos joblib y safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (entrada no linguistica: secuencias de aminoacidos y SMILES) |
| Licencia | no disponible |
| Formato de pesos | joblib y safetensors |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de caracteristicas seguido de un ensemble heterogeneo. Para la proteina se emplea un ESM2-35M congelado del que solo se usan las 6 primeras capas; cada secuencia se divide en ventanas de 1.022 residuos y se agregan las representaciones con media y desviacion tipica (mean pooling y std pooling). Para el sustrato se calculan descriptores RDKit, fingerprints de Morgan y claves MACCS. Adicionalmente se construyen caracteristicas auxiliares a partir de las etiquetas de entrenamiento mediante cross-fitting, de modo que ninguna fila ve su propia etiqueta: describen las enzimas mas similares, los sustratos mas similares y un prior por sustrato.

Sobre ese vector de caracteristicas se entrenan cuatro miembros de arboles que difieren en el subconjunto de caracteristicas utilizado; cada miembro promedia al 50% LightGBM y al 50% ExtraTrees. La prediccion final es 0,8 x la media de los cuatro miembros mas 0,2 x una red MLP pequena. Existe una salvaguarda de ejecucion que, si la entrada resultaria demasiado lenta, conmuta toda la entrada a un ensemble de arboles con ESM2-8M; los dos caminos nunca se mezclan en una misma ejecucion. El entrenamiento usa unicamente las 42.524 filas oficiales, sin RLHF, DPO ni ajuste fino del codificador.

## Capacidades

- Prediccion de log10_kcat (numero de recambio) y log10_km (constante de Michaelis) por par enzima-sustrato.
- Extraccion de representaciones proteicas mediante ESM2-35M limitado a 6 capas, con pooling de media y desviacion tipica.
- Segmentacion de secuencias largas en ventanas de 1.022 residuos para admitir proteinas de mayor longitud.
- Calculo de descriptores quimicos del sustrato: descriptores RDKit, fingerprints de Morgan y claves MACCS.
- Uso de caracteristicas auxiliares cross-fitted basadas en similitud de enzimas y sustratos.
- Ejecucion en CPU sin GPU, dentro de una imagen Docker.
- Modo de respaldo automatico con ESM2-8M para entradas costosas.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto.

## Casos de uso

- Priorizacion de candidatos en ingenieria de proteinas: dado un lote de variantes de una enzima y un sustrato de interes, el modelo estima kcat y Km en CPU para ordenar que variantes merecen caracterizacion experimental, reduciendo el numero de ensayos de laboratorio.
- Diseno de biocatalizadores industriales: permite filtrar combinaciones enzima-sustrato antes de sintetizar y ensayar, usando la prediccion de kcat como proxy de velocidad catalitica y la de Km como proxy de afinidad.
- Cribado virtual de sustratos para una enzima conocida: se generan SMILES candidatos y se evalua la afinidad relativa (Km) para descartar sustratos poco prometedores antes de pruebas in vitro.
- Anotacion funcional en pipelines bioinformaticos: integrado como paso posterior a la anotacion de secuencias, aporta una estimacion cuantitativa de actividad catalitica que complementa la clasificacion EC.
- Analisis de sensibilidad en modelos metabolicos: las predicciones de kcat y Km pueden alimentar modelos cineticos a escala de red, aportando ordenes de magnitud donde no hay datos medidos.
- Docencia y prototipado en laboratorio: al ejecutarse en CPU y en Docker, sirve como referencia reproducible para comparar estrategias de representacion proteica y quimica en cursos de aprendizaje profundo aplicado a biologia.
- Generacion de conjuntos de datos aumentados: las predicciones pueden usarse como etiquetas debiles para preentrenar o validar otros modelos de cinetica enzimatica, siempre con cautela por el riesgo de propagar sesgos.

## Benchmarks y rendimiento

| Test | Spearman medio |
|---|---|
| Leaderboard de validacion (solo datos oficiales) | 0,5255 |
| Test local de desarrollo | 0,5576 |
| Test local interno | 0,5473 |
| Test local de confirmacion | 0,6242 |

Desglose por objetivo en el test local de desarrollo: Spearman 0,4524 para kcat y 0,6628 para Km. Los tests locales dividen los datos por familia enzimatica, de modo que enzimas similares no aparecen a ambos lados de la particion. El autor indica que las puntuaciones del leaderboard pueden variar en torno a ±0,02 entre ejecuciones. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no se requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- Memoria RAM: no disponible de forma explicita; el repositorio de 1,1 GB y los modelos ESM2-35M y ESM2-8M sugieren varios GB de RAM, aunque la cifra exacta no se documenta.
- GPU recomendadas: no aplica; el modelo no esta pensado para GPU.
- Cabe en cualquier equipo de consumo con CPU moderna y RAM suficiente; no requiere tarjeta grafica.
- Opciones de despliegue: imagen Docker construida desde el repositorio, invocada con `python /app/predict.py --input INPUT --output OUTPUT`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; existe una salvaguarda que conmuta a ESM2-8M cuando la entrada resultaria demasiado lenta, lo que indica que el coste depende del tamano del lote y de la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el propio modelo se apoya en ESM2 (Meta, licencia MIT) como codificador congelado y en las ideas del referencia aura6 (recorte de capas, pooling con desviacion tipica y ventanas de 1.022 residuos), pero no se aportan metricas de esos sistemas ni de alternativas de prediccion de kcat/Km.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v20 | no disponible (ESM2-35M congelado como componente) | ventanas de 1.022 residuos | Spearman medio 0,5255 en validacion oficial | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Enzimas muy distintas de las del entrenamiento son dificiles de predecir; el propio autor lo senala como limitacion principal.
- kcat es mas dificil de predecir que Km: Spearman 0,4524 frente a 0,6628 en el test local de desarrollo.
- La temperatura y el pH no forman parte de las entradas, por lo que el modelo no puede tenerlos en cuenta; las predicciones corresponden a condiciones no especificadas.
- Entrenado solo con datos oficiales (42.524 filas), sin datos externos, lo que limita la cobertura quimica y biologica.
- Las puntuaciones del leaderboard pueden variar en torno a ±0,02 entre ejecuciones, lo que debe considerarse al comparar configuraciones.
- Licencia no declarada: no hay garantia de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion en sentido estadistico: el modelo puede producir predicciones con alta confianza aparente para pares enzima-sustrato fuera de distribucion.
- No es un modelo generativo ni conversacional; no admite tool calling, agentes ni instrucciones en lenguaje natural.
- La salvaguarda de ejecucion conmuta a un ensemble mas ligero (ESM2-8M) sin mezclar caminos, lo que puede introducir discontinuidad en las predicciones segun el tamano de la entrada.
- El repositorio incluye artefactos joblib, con el riesgo de seguridad habitual al cargar serializaciones de terceros; conviene verificar el origen antes de ejecutarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v20
- ESM2 (Meta): https://github.com/facebookresearch/esm
- RDKit: https://www.rdkit.org/
- LightGBM: https://lightgbm.readthedocs.io/
- scikit-learn: https://scikit-learn.org/
