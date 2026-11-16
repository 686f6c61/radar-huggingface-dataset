# VedaVachan/kcat-km-v18k

## Resumen

VedaVachan/kcat-km-v18k es un paquete de prediccion de parametros de cinetica enzimatica que combina dos modelos independientes: uno para estimar la constante de Michaelis-Menten (Km) y otro para estimar la constante catalitica (kcat). No es un modelo de lenguaje ni una red neuronal unica, sino un ensemble heterogeneo de arboles (LightGBM y ExtraTrees) sobre caracteristicas derivadas de embeddings de proteinas ESM2, orientado a quimica computacional y biologia estructural.

El modelo Km es identico byte a byte al de su version anterior (V18): utiliza ESM2-8M congelado y tres miembros con caracteristicas base y caracteristicas derivadas del target cruzadas (cross-fitted). El modelo kcat es nuevo: emplea ESM2-35M truncado a sus seis primeras capas, con pooling de media y desviacion estandar sobre ventanas de 1022 residuos, y cuatro miembros de arboles con estadisticas de vecinos de enzima y sustrato, mas un blend final con un MLP.

La relevancia de este modelo radica en su enfoque practico para una tarea de regresion cientifica con datos experimentales ruidosos, y en la transparencia inusual de su model card sobre el uso de datos externos de CatPred-DB que contienen etiquetas de parte del conjunto de validacion. El autor declara explicitamente que no reclama ninguna puntuacion de leaderboard y que las ganancias locales no estan libres de fuga de datos. El repositorio ocupa 1,2 GB y se distribuye con scripts de inferencia offline para CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de arboles: LightGBM + ExtraTrees (Km y kcat) con blend MLP final en kcat; caracteristicas de embeddings ESM2 congelados |
| Parametros totales | no disponible (no es un modelo unico; el encoder kcat es ESM2-35M truncado a 6 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 1022 residuos por secuencia en el encoder kcat) |
| Tipos de cuantizacion | no disponible (inferencia en fp32 para el encoder kcat) |
| Idiomas soportados | no disponible (entrada: SMILES y secuencias de aminoacidos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (encoders ESM2) y joblib (modelos de arboles) |

## Arquitectura y entrenamiento

El componente Km reutiliza el modelo de V18 sin modificaciones: un encoder ESM2-8M congelado (revision c731040f) que genera 3.065 caracteristicas base, a las que se anaden 12, 25 y 25 caracteristicas derivadas del target mediante validacion cruzada para los miembros A, B y C respectivamente. Cada miembro combina al 50% LightGBM y al 50% ExtraTrees de salida unica para Km, y la prediccion final es la media aritmetica de los tres miembros.

El componente kcat es nuevo y mas complejo. Usa ESM2-35M truncado a sus seis primeras capas (sin la layer norm final), en fp32, con ventanas consecutivas de 1022 residuos que cubren toda la secuencia y pooling de media y desviacion estandar poblacional. Sobre esas caracteristicas se entrenan cuatro miembros de arboles: A (caracteristicas base + media del bloque 35M-L6 + prior de sustrato), B (anade estadisticas de vecinos de enzima), C (anade estadisticas de sustratos similares) y D_std (columnas de A mas el bloque de desviacion estandar). Cada miembro incorpora ademas cuatro columnas de prior de enzima calculadas out-of-fold con folds a nivel de par (media contraida de la etiqueta del mismo enzima sobre sus otros pares, K=5, y log del numero de etiquetas). Cada miembro es 50% LightGBM (rondas elegidas por early stopping sobre un holdout de cluster dentro de las filas de entrenamiento) y 50% ExtraTrees de 200 arboles. La media de los cuatro miembros se mezcla finalmente con un MLP de tres semillas: 0,8 arboles + 0,2 MLP, con perdida enmascarada sobre ambos targets porque las filas externas solo llevan una etiqueta cada una.

El entrenamiento usa la tabla de competicion (42.524 filas, release a18f8d542c1849507ff1711b970b48b72a998c8c) mas una tabla externa de CatPred-DB (Boorla y Maranas, Nat Commun 2025; BRENDA + SABIO-RK; MIT / CC-BY-4.0). Esa tabla externa contiene etiquetas para 1.104 de los 1.901 pares de val_inputs (58,1%): 911 de kcat y 1.083 de Km, y esas filas se mantuvieron en entrenamiento. Las tablas de referencia (prior de sustrato, vecinos de enzima y sustrato, prior de enzima para kcat) tambien se construyen con datos externos. El autor declara que no hay lookup de pares de val_inputs, ni hard-coding, ni caracteristica de par exacto, y que el profesor del curso aprobo el uso de datos externos.

## Capacidades

- Prediccion de log10_kcat y log10_km a partir de un par (SMILES de sustrato, secuencia de aminoacidos de enzima).
- Procesamiento por lotes mediante `predict.py --input in.parquet --output out.csv`, con columnas de entrada `id, smiles, sequence` y salida exacta `id,log10_kcat,log10_km`, una fila por ID y valores finitos.
- Deduplicacion interna de pares (smiles, sequence) exactos: cada par duplicado se codifica una sola vez.
- Inferencia offline y solo en CPU, sin dependencia de red ni de GPU.
- Ejecucion determinista del camino Km (bit a bit reproducible segun el autor).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un regresor cientifico especializado.
- No modela condiciones experimentales como temperatura o pH.

## Casos de uso

- Priorizacion de enzimas en diseno de vias metabolicas: dado un conjunto de candidatos (secuencia) y un sustrato (SMILES), el modelo estima kcat y Km para descartar combinaciones con baja actividad catalitica o afinidad desfavorable antes de validacion experimental.
- Filtrado previo en cribado virtual de sustratos: para una enzima de interes, generar variantes de sustrato en SMILES y predecir Km para ordenar candidatos por afinidad estimada, reduciendo el numero de ensayos in vitro necesarios.
- Anotacion funcional de enzimas en genomas recien secuenciados: usar la secuencia proteica junto con sustratos plausibles de la ruta para obtener estimaciones cuantitativas que complementen la anotacion por homologia.
- Ingenieria de proteinas dirigida: comparar mutantes de una enzima frente al mismo sustrato y usar el delta de log10_kcat predicho como criterio de ranking antes de sintetizar y ensayar las variantes.
- Construccion de datasets aumentados para modelos de cinetica: usar las predicciones como etiquetas debiles en regiones del espacio secuencia-sustrato sin medidas experimentales, con las cautelas de sesgo que ello implica.
- Analisis de sensibilidad en modelos cineticos a escala celular: sustituir parametros desconocidos de un modelo metabolico por predicciones del ensemble para explorar el impacto de la incertidumbre en kcat y Km sobre el comportamiento del sistema.
- Docencia y prototipado en bioinformatica: pipeline offline en CPU, sin GPU, adecuado para entornos academicos con recursos limitados y para reproducir el flujo completo con el script incluido.

## Benchmarks y rendimiento

Los unicos datos publicados son las ganancias locales del autor sobre particiones V14 (filas externas solo en filas de ajuste, consultas deduplicadas), comparadas con V18 tal como se envio. El autor advierte que estas ganancias no estan libres de fuga de datos y que no se puede inferir el efecto en leaderboard. No se reclama ninguna puntuacion de leaderboard.

| Metrica (Spearman) | Particion | V18 | V18k | Ganancia pareada M2 [IC] |
|---|---|---|---|---|
| kcat | inner | 0,4131 | 0,4620 | +0,0635 [+0,017, +0,116] |
| kcat | development | 0,4416 | 0,4718 | +0,0334 [-0,016, +0,085] |
| kcat | confirmation | 0,5293 | 0,5432 | +0,0236 [-0,012, +0,059] |
| Mean SCC | inner | 0,5665 | 0,5909 | no disponible |
| Mean SCC | development | 0,5668 | 0,5819 | no disponible |
| Mean SCC | confirmation | 0,6357 | 0,6427 | no disponible |

La metrica Mean SCC es la media de las correlaciones de rango de kcat y Km; como Km no cambia respecto a V18, la ganancia en la media es la mitad de la ganancia en kcat. Los intervalos de development y confirmation incluyen el cero, por lo que la mejora no es concluyente en esas particiones.

## Requisitos de hardware

- Inferencia solo en CPU; no se requiere GPU ni VRAM dedicada.
- Memoria RAM: no especificada en la informacion disponible; el repositorio ocupa 1,2 GB y en el proceso conviven dos encoders ESM2 (8M y 35M truncado a 6 capas), por lo que se recomienda al menos 8-16 GB de RAM para lotes moderados.
- GPU recomendadas: no aplica; el paquete esta disenado para ejecucion offline en CPU.
- Cabe en cualquier equipo consumer actual; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: el script `predict.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles de forma numerica; el autor advierte que entradas con muchas proteinas largas distintas tardan varios minutos porque se ejecutan dos encoders en un mismo proceso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VedaVachan/kcat-km-v18k | Ensemble de arboles + ESM2 congelado | no disponible (encoder kcat ESM2-35M truncado a 6 capas) | no aplica (ventanas de 1022 residuos) | no disponible | Hugging Face, 0 descargas |
| VedaVachan V18 (referencia interna) | Ensemble de arboles + ESM2-8M | no disponible | no aplica | no disponible | Referenciado en la model card; no se proporciona enlace |
| CatPred-DB (Boorla y Maranas, Nat Commun 2025) | Base de datos de cinetica enzimatica (BRENDA + SABIO-RK) | no aplica | no aplica | MIT / CC-BY-4.0 | Fuente externa citada en la model card |

No se dispone de informacion sobre otros modelos comparables de prediccion de kcat y Km en la documentacion proporcionada; la comparativa con alternativas como DLKcat, UniKP o CatPred no puede completarse con datos verificables a partir de la informacion disponible.

## Limitaciones y advertencias

- Fuga de datos declarada: la tabla externa de CatPred-DB contiene etiquetas para el 58,1% de los pares de val_inputs (911 de kcat, 1.083 de Km) y esas filas se usaron en entrenamiento, ademas de construir las tablas de referencia. Cualquier evaluacion sobre esas particiones no es una estimacion de generalizacion libre de fuga.
- El autor no reclama ninguna puntuacion de leaderboard; las ganancias locales de kcat en development y confirmation tienen intervalos de confianza que incluyen el cero.
- Las condiciones experimentales no estan modeladas: temperatura y pH no son entradas del modelo, pese a que los registros externos provienen de condiciones variadas.
- Los valores de kcat externos son maximos por par en la fuente, y para pares compartidos difieren de los valores de competicion en +0,30 log10 de media.
- Los estados de referencia contienen etiquetas agregadas de entrenamiento, lo que puede introducir sesgos sistematicos en las predicciones para enzimas o sustratos bien representados en esos agregados.
- Riesgo de extrapolacion: al ser un ensemble de arboles sobre caracteristicas de embeddings congelados, el comportamiento fuera de la distribucion de entrenamiento (proteinas o sustratos muy distintos) no esta caracterizado.
- No hay guard de runtime ni fallback: si la entrada no cumple el esquema esperado, el script no ofrece recuperacion.
- Rendimiento: con muchas proteinas largas distintas, la inferencia tarda varios minutos en CPU por la ejecucion de dos encoders en un mismo proceso.
- Licencia no declarada en la informacion disponible: verificar condiciones antes de cualquier uso comercial.
- Sesgos conocidos: no documentados explicitamente en la model card; la composicion de BRENDA y SABIO-RK puede sobrerrepresentar enzimas y organismos modelo bien estudiados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v18k
- Referencia externa citada (CatPred-DB, Boorla y Maranas, Nat Commun 2025): no se proporciona URL directa en la informacion disponible
- Referencia interna V18: no se proporciona URL en la informacion disponible
- Referencia aura6 (ideas de truncado de capas, std pooling y ventanas de 1022 residuos): no se proporciona URL en la informacion disponible
- NOTICE.md del repositorio: incluido en el propio repositorio de Hugging Face
