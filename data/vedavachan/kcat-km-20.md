# VedaVachan/kcat-km-20

## Resumen

kcat-km-20 es un pipeline de prediccion de parametros cineticos de enzimas (kcat y km) publicado por el usuario VedaVachan en Hugging Face. No es un modelo de lenguaje ni una red neuronal generativa: es un ensamblado de modelos de machine learning clasico (LightGBM y ExtraTrees) sobre caracteristicas derivadas de embeddings de proteinas obtenidos con ESM2-35M, cuyo objetivo es predecir los valores log10 de la constante catalitica (kcat) y de la constante de Michaelis (km) a partir de la secuencia de la enzima y del SMILES del sustrato.

El paquete esta orientado a una competicion de prediccion de cinetica enzimatica sobre un conjunto de datos oficial de 42.524 filas (release a18f8d542c1849507ff1711b970b48b72a998c8c). El autor declara explicitamente que no reclama ninguna puntuacion de leaderboard y que las ganancias frente a su version anterior (V14) son pequenas y en su mayoria no estadisticamente resueltas.

La relevancia de esta ficha es acotada: se trata de un artefacto de competicion, no de un modelo de proposito general. Su interes tecnico esta en el diseno del pipeline (truncado de capas de ESM2, pooling de media y desviacion tipica, ventanas de 1022 residuos, guard de tiempo de ejecucion con fallback) y en su interfaz de inferencia offline en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de arboles: LightGBM + ExtraTrees multi-output sobre features de ESM2-35M truncado a 6 capas, mas un MLP; fallback a ensamblado de 3 miembros sobre ESM2-8M |
| Parametros totales | no disponible (el encoder ESM2-35M tiene aproximadamente 35M de parametros; el ensamblado de arboles no se mide en parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventanas de 1022 residuos por secuencia de proteina |
| Tipos de cuantizacion | no disponible (embeddings en fp32; pesos en safetensors y joblib) |
| Idiomas soportados | no disponible (entrada: secuencias de aminoacidos y SMILES, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors, joblib |

## Arquitectura y entrenamiento

La ruta principal (V20) congela ESM2-35M y lo trunca a sus primeras 6 capas, descartando la capa de normalizacion final. Cada secuencia se cubre con ventanas consecutivas de 1022 residuos y se aplica pooling de media y de desviacion tipica poblacional sobre los residuos no especiales, en fp32. Sobre esas representaciones se construyen cuatro miembros de arboles: A (features artesanales de proteina y quimica, media del encoder de 35M-L6 y prior exacto de sustrato), B (anade estadisticas de enzimas vecinas sobre la media), C (anade estadisticas de sustratos similares) y D_std (columnas de A mas el bloque de desviacion tipica). Cada miembro combina al 50% LightGBM por objetivo y al 50% ExtraTrees multi-output; las rondas de LightGBM se eligen por early stopping sobre un holdout agrupado por cluster dentro de las filas de entrenamiento. La prediccion final es la media igual de los cuatro miembros, mezclada 0,8 arboles y 0,2 MLP (3 semillas, receta V15).

La ruta de respaldo (V14) es un ensamblado de tres miembros sobre ESM2-8M. Un guard de ejecucion proyecta el tiempo total tras procesar el 25% de las ventanas del encoder ordenadas por longitud; si la proyeccion supera 470 s, toda la entrada se ejecuta en la ruta V14 (nunca se mezclan rutas en una misma ejecucion) y la ruta elegida se registra en stderr como `PATH V20` o `PATH V14_fallback`. El encoder de 35M en fp32 es aproximadamente 2,5 veces mas lento que el de 8M, de modo que entradas con muchas proteinas largas distintas caen al fallback; segun el autor, unas 850 proteinas distintas permanecen en la ruta V20 en una maquina como la suya.

El autor atribuye a la referencia aura6 las ideas de truncado de capas, pooling de desviacion tipica y ventanas de 1022 residuos, y declara que el codigo del paquete es propio y que no se copian pesos ni predicciones de aura6.

## Capacidades

- Prediccion de log10_kcat y log10_km a partir de la secuencia de la enzima y del SMILES del sustrato.
- Extraccion de embeddings de proteina con ESM2-35M truncado a 6 capas (ruta V20) o con ESM2-8M (ruta V14).
- Deduplicacion exacta de pares (smiles, sequence) antes de la codificacion, para no repetir trabajo.
- Guard de tiempo de ejecucion con conmutacion automatica a la ruta de respaldo y registro de la ruta elegida.
- Inferencia offline, solo CPU, con 2 hilos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Priorizacion de candidatos en ingenieria de enzimas: dado un lote de variantes de secuencia y un sustrato de interes, el pipeline devuelve estimaciones de kcat y km que permiten ordenar que variantes pasar a ensayo experimental, reduciendo el numero de medidas de laboratorio necesarias.
- Filtrado en cribado virtual de sustratos: para una enzima concreta, se evaluan muchos SMILES y se descartan los que el modelo situa en regimenes cineticos poco prometedores antes de la validacion humeda.
- Construccion de datasets aumentados para modelos posteriores: las predicciones pueden usarse como etiquetas preliminares en regiones del espacio secuencia-sustrato sin datos experimentales, siempre con validacion posterior.
- Analisis de sensibilidad sustrato-enzima en pipelines de biologia computacional: al ser offline y solo CPU, se integra en flujos batch sin depender de GPU ni de servicios externos.
- Reproducibilidad de resultados de competicion: el paquete incluye la ruta exacta de inferencia y el registro de la ruta elegida, lo que facilita auditar por que una entrada concreta se resolvio con V20 o con V14.
- Estudio metodologico de representaciones proteicas: el truncado a 6 capas y el pooling de media y desviacion tipica son configurables y sirven para comparar variantes de extraccion de features sobre el mismo conjunto de datos.

## Benchmarks y rendimiento

El autor reporta evidencia local sobre las particiones de V14 con datos oficiales unicamente, en forma de SCC (correlacion de rangos de Spearman) media en las particiones inner, development y confirmation, con ganancias emparejadas de V20 frente a V14:

| Particion | V14 | Configuracion V20 | Ganancia emparejada V20 - V14 |
|---|---|---|---|
| Inner | 0,5314 | 0,5473 | +0,015 [-0,016, +0,047] |
| Development | 0,5346 | 0,5576 | +0,021 [-0,001, +0,043] |
| Confirmation | 0,5988 | 0,6242 | +0,027 [+0,010, +0,048] |

Como referencia, el codigo de aura6 sin modificar obtuvo 0,5467 / 0,5571 / 0,6182 en las mismas particiones. El autor advierte que las particiones se reutilizaron durante el desarrollo, que las ganancias son pequenas y en su mayoria no resueltas estadisticamente, y que una ejecucion de leaderboard tiene un ruido de aproximadamente +-0,02. No se reclama ninguna puntuacion de leaderboard.

## Requisitos de hardware

- Inferencia exclusivamente en CPU, con 2 hilos; no requiere GPU.
- Memoria principal: el repositorio ocupa 1,1 GB; el encoder ESM2-35M en fp32 y el ensamblado de arboles requieren del orden de varios GB de RAM, aunque el autor no publica una cifra exacta (no disponible).
- GPU recomendadas: no aplica; el pipeline no usa aceleracion por GPU.
- Cabe en cualquier maquina de desarrollo convencional; el limitante es el tiempo de encoder, no la VRAM.
- Despliegue mediante el script `predict.py --input in.parquet --output out.csv`, sin servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama.
- Latencia: el guard de ejecucion dispara el fallback cuando la proyeccion supera 470 s; el encoder de 35M es aproximadamente 2,5 veces mas lento que el de 8M. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-20 (este) | ESM2-35M truncado + LightGBM/ExtraTrees + MLP | secuencia + SMILES | log10_kcat, log10_km | no disponible | Hugging Face, 0 descargas |
| Ruta V14 incluida en el paquete | ESM2-8M + ensamblado de 3 miembros | secuencia + SMILES | log10_kcat, log10_km | no disponible | incluida como fallback |
| Referencia aura6 (citada por el autor) | no disponible en detalle; features ESM2 con softmax-kNN | secuencia + SMILES | log10_kcat, log10_km | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de prediccion de kcat y km en la documentacion proporcionada; los unicos puntos de comparacion son la ruta V14 del propio paquete y la referencia aura6.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Las ganancias frente a V14 son pequenas y en su mayoria no estadisticamente resueltas; el autor advierte de un ruido de aproximadamente +-0,02 en leaderboard.
- Las particiones de evaluacion se reutilizaron durante el desarrollo, por lo que las cifras locales pueden estar optimistamente sesgadas.
- La ruta V20 necesita aproximadamente el doble de tiempo de encoder que V14; en maquinas lentas o entradas con muchas proteinas largas distintas se activa el fallback y el resultado es el de V14, con menor precision esperada.
- Los embeddings son fp32 y deterministas para entradas identicas, pero el autor anticipa diferencias de coma flotante minimas respecto a los embeddings de entrenamiento.
- No hay cache de embeddings ni de predicciones especifica por entrada; los lotes grandes se recalculan por completo.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial o redistribucion.
- No se publican sesgos, cobertura de idiomas ni evaluacion fuera del conjunto oficial de competicion; la extrapolacion a otras distribuciones de proteinas o sustratos no esta validada.
- El autor no reclama ninguna puntuacion de leaderboard; no debe citarse como modelo de referencia en cinetica enzimatica sin validacion experimental propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VedaVachan/kcat-km-20
- Referencia aura6 citada por el autor: no disponible (mencionada en NOTICE.md del paquete, sin URL en la informacion proporcionada)
- Paper, blog o demo: no disponible
