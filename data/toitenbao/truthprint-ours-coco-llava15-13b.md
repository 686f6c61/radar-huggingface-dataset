# ToiTenBao/truthprint-ours-coco-llava15-13b

## Resumen
TruthPrInt — LLaVA-1.5-13B, COCO es un artefacto de investigación publicado por el usuario ToiTenBao en HuggingFace. No es un modelo generativo: es un conjunto de sondas (probes) de detección de alucinación de objetos entrenadas sobre las representaciones internas de LLaVA-1.5-13B. El repositorio incluye tres checkpoints independientes (semillas 0, 42 y 1337), las características extraídas de un corpus COCO, las de los conjuntos AMBER y POPE-Adversarial, y los umbrales de decisión congelados por semilla.

El modelo base es `llava-hf/llava-1.5-13b-hf`, con 40 capas de decodificador, dimensión oculta de 5120 y 40 cabezas de atención; el grid de parches de visión es de 24x24. Las capas de sonda empleadas son la 10, 15, 20, 25 y 30, y la capa asociada a TruthPrInt es la 20. El corpus se construyó con 10.000 imágenes COCO train2014 divididas 80/20 por imagen: 8.000 de entrenamiento con 54.253 spans de objeto y 2.000 de retención con 13.789 spans. Las leyendas fueron generadas por el propio modelo de 13B, de modo que este corpus no es el del release de 7B.

Su relevancia es metodológica: demuestra que una sonda lineal sobre activaciones intermedias de un LVLM puede separar menciones de objetos presentes de menciones alucinadas con AUROC de 0,9283 en el holdout de COCO, y que esa señal puede usarse para mitigar la alucinación en inferencia. El autor advierte explícitamente de que las características, la geometría y los umbrales son específicos del modelo base y no son intercambiables entre el 13B y el 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda sobre representaciones internas de un transformer multimodal LLaVA-1.5-13B (codificador de visión con grid de parches 24x24 + decodificador de 40 capas, hidden 5120, 40 cabezas) |
| Parametros totales | no disponible para la sonda; el modelo base LLaVA-1.5-13B tiene aproximadamente 13.000 millones de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio (7,7 GB) contiene checkpoints por semilla, caches de caracteristicas y metadatos en JSON (`model_profile.json`, `thresholds.json`, `manifest.json`) |
| Capas de sonda | 10, 15, 20, 25, 30 |
| Capa TruthPrInt | 20 |
| Semillas de entrenamiento | 0, 42, 1337 (independientes; no se deben ensemblar) |

## Arquitectura y entrenamiento
La sonda se entrena sobre las activaciones del decodificador de LLaVA-1.5-13B en cinco profundidades (capas 10, 15, 20, 25 y 30), con la capa 20 como capa de referencia de TruthPrInt. El objetivo es una tarea de clasificación binaria sobre menciones de objetos: determinar si un sustantivo que el LVLM menciona en su respuesta está realmente presente en la imagen. La evaluación se realiza en vista de mención (mention view), es decir, solo se puntúan los objetos que el modelo ha nombrado.

El corpus de entrenamiento procede de COCO train2014: 10.000 imágenes divididas 80/20 por imagen, con 8.000 imágenes y 54.253 spans de objeto para entrenamiento y 2.000 imágenes y 13.789 spans para retención. Las leyendas del corpus fueron generadas por el propio LLaVA-1.5-13B. Los umbrales se seleccionan por mejor F1 sobre el split de validación de COCO y después se congelan; nada se ajusta sobre el holdout de test, AMBER ni POPE. Los umbrales de mejor F1 en validación para las semillas 0, 42 y 1337 son -12,675, -4,2534 y 1,8123 respectivamente, lo que refleja calibraciones muy distintas entre semillas. El repositorio incluye también el fichero `metadata/manifest.json` con la procedencia del corpus y de la caché, y el autor recomienda comparar `metadata/model_profile.json` con la salida de `model_workflow.sh show-profile` antes de usar los artefactos: una discrepancia implica reconstruir la caché.

## Capacidades
- Deteccion de alucinacion de objetos en las respuestas de LLaVA-1.5-13B: clasifica cada mencion de objeto como presente o alucinada.
- Puntuacion en vista de mencion, con soporte para 13.787 menciones en el holdout de COCO y 2.367 filas en AMBER.
- Generalizacion zero-shot a AMBER (universo de objetos con etiquetado humano) y a POPE-Adversarial, usando umbrales congelados de COCO.
- Analisis por capa: permite estudiar que profundidad del decodificador concentra la informacion sobre presencia de objetos.
- Reproducibilidad con tres semillas independientes, cada una con su propio checkpoint y umbral.
- No genera texto, no soporta tool calling, no implementa agentes ni razonamiento multi-paso.
- No aporta capacidades multimodales propias: depende por completo del forward de LLaVA-1.5-13B para extraer caracteristicas.
- No incluye funcionalidad de vision, audio ni thinking mode.

## Casos de uso
- Auditoria de asistentes visuales en produccion: la sonda se inserta como guardarraíl despues del LVLM y marca las menciones de objetos que probablemente no existen en la imagen antes de devolver la respuesta al usuario.
- Mitigacion de alucinacion en decodificacion: la senal de la capa 20 puede usarse para reorientar la generacion (por ejemplo, penalizando tokens de objetos con puntuacion baja), que es el uso que propone el metodo TruthPrInt del que deriva este artefacto.
- Filtrado y curacion de datasets de captioning: dado un corpus de leyendas generadas por LLaVA-1.5-13B, la sonda permite descartar o marcar aquellas con objetos no presentes, reduciendo ruido antes de reentrenar.
- Senal de recompensa para RLHF o DPO: las puntuaciones por mencion pueden convertirse en un termino de penalizacion de factualidad visual en el ajuste de preferencias.
- Evaluacion comparativa de LVLMs: sirve para medir la tasa de alucinacion de distintos modelos en el mismo universo de objetos, siempre que se reconstruyan las caracteristicas para cada modelo base.
- Investigacion en interpretabilidad: extraer la geometria de las representaciones en las capas 10 a 30 para estudiar donde se codifica la presencia de objetos y como varia con la semilla de entrenamiento.
- Control de calidad en dominios sensibles (descripcion de imagenes medicas, industriales o de accesibilidad), donde una mencion de objeto inexistente tiene consecuencias directas y se necesita una verificacion automatica previa a la revision humana.

## Benchmarks y rendimiento
Resultados publicados en la model card, media +/- desviacion estandar sobre las tres semillas (0, 42 y 1337). Los umbrales se seleccionan por mejor F1 en validacion de COCO y se congelan antes de evaluar.

**COCO test holdout (vista de mencion, n=13.787, 16,19 % positivos)**

| AUROC | AUPRC | ACC | F1 |
|---|---|---|---|
| 0,9283 +/- 0,0019 | 0,7195 +/- 0,0057 | 0,8224 +/- 0,0133 | 0,6228 +/- 0,0147 |

**AMBER, zero-shot estricto (n=2.367 filas / 977 imagenes, 5,37 % positivos, umbrales de COCO congelados)**

| AUROC | AUPRC | ACC | F1 |
|---|---|---|---|
| 0,8657 +/- 0,0044 | 0,2912 +/- 0,0126 | 0,7350 +/- 0,0314 | 0,2602 +/- 0,0183 |

En AMBER solo se puntuan los pares que coinciden con el conjunto etiquetado a mano de pares `(imagen, sustantivo)`: 2.367 de 3.350 pares candidatos emparejados; los sustantivos que menciona el 13B y que no tienen etiqueta AMBER no se evaluan.

**POPE-Adversarial, zero-shot (n=3.000, 18,9 % positivos)**

| AUROC | AUPRC |
|---|---|
| 0,5809 +/- 0,0151 | 0,1986 +/- 0,0034 |

No se han publicado en la informacion disponible resultados comparativos frente a otras sondas o metodos de deteccion de alucinacion con cifras numericas equivalentes.

## Requisitos de hardware
- El artefacto del repositorio ocupa 7,7 GB e incluye checkpoints, caches de caracteristicas y metadatos; no contiene los pesos del LLM base.
- Para generar caracteristicas hay que ejecutar el forward completo de LLaVA-1.5-13B: se estima un consumo de unos 26 GB de VRAM en FP16, unos 14 GB en INT8 y entre 8 y 9 GB en 4 bits, sin contar la cache KV ni los tokens de imagen. Son estimaciones derivadas del tamano del modelo base, no datos publicados en la model card.
- GPU recomendadas para el modelo base sin cuantizar: A100 de 40 o 80 GB, H100, o dos GPU de 24 GB con reparto de capas.
- Cabe en GPU de consumo (RTX 4090, RTX 3090, ambas de 24 GB) unicamente con cuantizacion de 8 o 4 bits; el grid de vision de 24x24 anade tokens adicionales que incrementan el uso de memoria.
- Opciones de despliegue del modelo base: vLLM y TGI para servicio con batching, llama.cpp u Ollama para cuantizacion en local. El repositorio de TruthPrInt aporta un flujo propio de trabajo, con el comando `model_workflow.sh show-profile` para verificar el perfil del modelo.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Coste de almacenamiento adicional: las caches de caracteristicas de COCO, AMBER y POPE-Adversarial se almacenan en disco y hay que regenerarlas si el perfil del modelo no coincide con `metadata/model_profile.json`.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Corpus | Intercambiable | Licencia |
|---|---|---|---|---|---|
| TruthPrInt LLaVA-1.5-13B, COCO (este release) | llava-hf/llava-1.5-13b-hf | 13B (modelo base) | 10.000 imagenes COCO train2014, leyendas generadas por el 13B | No | no disponible |
| Release de 7B del mismo autor | LLaVA-1.5-7B | 7B (modelo base) | corpus propio generado por el 7B | No; caracteristicas, geometria y umbrales distintos | no disponible |
| TruthPrInt (ICCV 2025, repositorio jinhaoduan/TruthPrInt) | Varios LVLM populares | no disponible | evaluacion in-domain y out-of-domain sobre benchmarks de alucinacion de objetos | no disponible | no disponible |

El autor indica explicitamente que este release no es intercambiable con el de 7B. No se dispone de cifras de benchmarks del release de 7B ni del repositorio oficial de TruthPrInt en la informacion proporcionada, por lo que no es posible una comparacion numerica directa.

## Limitaciones y advertencias
- Dependencia estricta del modelo base: las caracteristicas, la geometria de la sonda y los umbrales son especificos de `llava-hf/llava-1.5-13b-hf`. Un cambio de modelo, de revision o de configuracion invalida la cache y obliga a reconstruirla.
- Umbrales muy dispares entre semillas (-12,675 / -4,2534 / 1,8123), lo que implica que la calibracion no es estable y hay que fijar una semilla concreta antes de desplegar.
- Rendimiento casi aleatorio en POPE-Adversarial (AUROC 0,5809 +/- 0,0151), muy inferior al obtenido en COCO y AMBER; no debe usarse como detector fiable en ese regimen adversarial.
- Caida notable de precision al salir del dominio: la AUPRC baja de 0,7195 en COCO a 0,2912 en AMBER, coherente con la baja prevalencia de positivos (5,37 %) y con el desajuste de vocabulario de objetos.
- Cobertura parcial en AMBER: solo 2.367 de 3.350 pares candidatos se pudieron evaluar; los objetos sin etiqueta no se puntuan y quedan fuera de la medida.
- Sesgo de dominio del corpus: todas las imagenes son COCO train2014 con leyendas autogeneradas por el 13B, lo que limita la generalizacion a vocabularios de objetos, idiomas y estilos de imagen distintos.
- Riesgo de sobreajuste in-domain por evaluar con la misma distribucion de leyendas que genero el propio modelo.
- Licencia no declarada: no hay permiso explicito de uso comercial ni condiciones de redistribucion, lo que supone un riesgo legal en produccion.
- Artefacto sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado en HuggingFace.
- No es un modelo autonomo: no genera texto ni respuestas; requiere siempre un LVLM subyacente y un proceso de extraccion de caracteristicas.
- Las puntuaciones de la sonda son probabilidades calibradas para un umbral concreto, no una garantia de veracidad; siguen siendo posibles falsos negativos y falsos positivos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ToiTenBao/truthprint-ours-coco-llava15-13b
- Repositorio oficial de TruthPrInt (ICCV 2025): https://github.com/jinhaoduan/TruthPrInt
- Modelo base: https://huggingface.co/llava-hf/llava-1.5-13b-hf
- Ficheros de metadatos del repositorio: `metadata/model_profile.json`, `metadata/thresholds.json`, `metadata/manifest.json`
- Paper especifico de este release: no disponible en la informacion proporcionada
- Demo publica: no disponible en la informacion proporcionada
