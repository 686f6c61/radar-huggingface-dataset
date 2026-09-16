# ToiTenBao/haloprobe-ours-coco-llava15-13b

## Resumen

HaLoProbe (variante COCO sobre LLaVA-1.5-13B) es un artefacto de deteccion de alucinaciones de objeto publicado por el usuario ToiTenBao en HuggingFace. No es un modelo generativo en si: es una sonda (probe) entrenada sobre las representaciones internas del modelo multimodal LLaVA-1.5-13B para decidir si un objeto mencionado en una respuesta realmente aparece en la imagen. El repositorio incluye los checkpoints de la sonda para tres semillas independientes (0, 42 y 1337), las cache de caracteristicas extraidas del corpus COCO y los umbrales de decision congelados por semilla.

El problema que aborda es la alucinacion de objeto en modelos vision-lenguaje: LLaVA-1.5-13B puede afirmar que ve un objeto que no esta en la imagen. La sonda lee las activaciones de las capas 10, 15, 20, 25 y 30 del decoder (40 capas, dimension oculta 5120, 40 cabezas de atencion; rejilla de parches visuales de 24 x 24) y produce una puntuacion por mencion de objeto. La capa 20 se corresponde con la empleada por el metodo TruthPrInt. La model card advierte explicitamente de que estos artefactos no son intercambiables con la version de 7B: caracteristicas, geometria y umbrales son especificos de cada modelo base.

El corpus de entrenamiento se construyo sobre 10.000 imagenes de COCO train2014, divididas 80/20 por imagen (8.000 imagenes de entrenamiento con 54.253 menciones de objeto y 2.000 de retencion con 13.789 menciones), con leyendas generadas por el propio modelo de 13B. El repositorio ocupa 7,3 GB, no declara licencia, idiomas soportados ni pipeline, y no incluye pesos del modelo base. Los resultados declarados son fuertes en el dominio COCO (AUROC 0,9315) y notablemente mas modestos en evaluaciones zero-shot fuera de dominio, especialmente POPE-Adversarial (AUROC 0,6012).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda (clasificador de alucinacion de objeto) sobre el decoder de LLaVA-1.5-13B: 40 capas, hidden 5120, 40 cabezas, rejilla de parches visuales 24 x 24 |
| Parametros totales | no disponible (el repositorio, de 7,3 GB, contiene checkpoints de la sonda y cache de caracteristicas, no los pesos del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus COCO implica leyendas en ingles, sin confirmacion explicita en la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio organiza `checkpoints/` (uno por semilla) y cache de caracteristicas en `cache/coco/`, `cache/amber/`, `cache/pope_adversarial/`, sin especificar extension de fichero |
| Modelo base | llava-hf/llava-1.5-13b-hf |
| Capas de la sonda | 10, 15, 20, 25, 30 |
| Capa TruthPrInt | 20 |
| Semillas | 0, 42, 1337 (independientes; no se deben ensamblar) |
| Metadatos incluidos | `metadata/model_profile.json`, `metadata/thresholds.json`, `metadata/manifest.json` |

## Arquitectura y entrenamiento

La sonda se engancha a las activaciones internas del decoder de LLaVA-1.5-13B. Segun la model card, las capas supervisadas son las 10, 15, 20, 25 y 30 de un total de 40, con anchura oculta de 5120 y 40 cabezas de atencion; la torre visual opera sobre una rejilla de 24 x 24 parches. La sonda no modifica el modelo generativo: actua como cabezal de clasificacion por mencion de objeto, usando los umbrales guardados en cada checkpoint. El detalle de la funcion de perdida, el optimizador, el numero de pasos y la composicion exacta de las caracteristicas de entrada no se describe en la informacion disponible.

El corpus se construyo extrayendo caracteristicas sobre 10.000 imagenes de COCO train2014 con leyendas generadas por el propio LLaVA-1.5-13B, lo que convierte el conjunto en auto-generado (no hay anotaciones humanas de las respuestas evaluadas, solo de los objetos). La particion es 80/20 por imagen: 8.000 imagenes y 54.253 spans de objeto para entrenamiento, 2.000 imagenes y 13.789 spans para retencion. Los umbrales se eligen maximizando F1 en el split de validacion de COCO y se congelan antes de evaluar en el holdout de test, AMBER y POPE, de modo que no hay ajuste sobre los conjuntos de evaluacion. Se entrenaron tres semillas independientes para medir varianza, y la propia model card pide no combinarlas en un ensemble.

## Capacidades

- Deteccion de alucinacion de objeto: dado un par (imagen, mencion de objeto) producido por el modelo base, la sonda emite una puntuacion y, aplicando el umbral congelado, una decision binaria de presencia o ausencia.
- Extraccion de caracteristicas internas: el repositorio incluye cache de caracteristicas sobre COCO (entrenamiento y holdout), AMBER y POPE-Adversarial, reutilizables para reproducir los resultados.
- Evaluacion zero-shot fuera de dominio: los umbrales de COCO se aplican sin reajuste a AMBER y POPE-Adversarial, lo que permite medir generalizacion entre benchmarks.
- Control de varianza entre semillas: cada semilla lleva su propio umbral seleccionado en su split de entrenamiento-validacion, lo que permite estudiar la estabilidad del detector.
- Trazabilidad de procedencia: `metadata/manifest.json` documenta la procedencia del corpus y el origen de la cache.
- No dispone de generacion de texto, tool calling, agentes ni modo de razonamiento: es un componente auxiliar de diagnostico, no un modelo conversacional.

## Casos de uso

- Auditoria de alucinaciones en pipelines de VQA: insertar la sonda como paso de verificacion posterior a las respuestas de LLaVA-1.5-13B en produccion, marcando como no verificadas las menciones de objeto con puntuacion inferior al umbral antes de mostrar la respuesta al usuario.
- Filtrado de datasets de captioning: usar las puntuaciones para descartar pares (imagen, leyenda) donde el modelo menciona objetos ausentes, mejorando la calidad de corpus sinteticos generados con LLaVA-1.5-13B.
- Investigacion en interpretabilidad: analizar que capas (10, 15, 20, 25, 30) aportan mas senal discriminativa y comparar la capa 20 con la hipotesis de TruthPrInt.
- Evaluacion comparativa de modelos VLM: emplear la sonda como referencia de deteccion de alucinacion en un banco de pruebas interno junto a AMBER y POPE-Adversarial, midiendo si un nuevo modelo reduce menciones de objetos inexistentes.
- Control de calidad en anotacion asistida: en flujos donde el modelo propone etiquetas de objeto sobre imagenes, la sonda actua como pre-filtro para que el anotador humano revise solo los casos dudosos, reduciendo coste de revision.
- Reproduccion de resultados y estudio de robustez: con la cache incluida, un equipo puede replicar las metricas de la model card y medir la sensibilidad al umbral sin necesidad de reentrenar la sonda.
- Diagnostico de despliegues multimodales: monitorizar en produccion la tasa de menciones de objeto rechazadas por la sonda como metrica continua de degradacion o deriva respecto al corpus original.

## Benchmarks y rendimiento

Resultados declarados en la model card (media +/- desviacion estandar sobre las tres semillas).

| Conjunto | n | Positivos | AUROC | AUPRC | ACC | F1 |
|---|---|---|---|---|---|---|
| COCO test holdout (vista de mencion) | 13.787 | 16,19 % | 0,9315 +/- 0,0019 | 0,7381 +/- 0,0076 | 0,8935 +/- 0,0017 | 0,6929 +/- 0,0092 |
| AMBER, zero-shot estricto | 2.367 filas / 977 imagenes | 5,37 % | 0,8526 +/- 0,0126 | 0,2829 +/- 0,0121 | 0,8527 +/- 0,0277 | 0,3290 +/- 0,0357 |
| POPE-Adversarial, zero-shot | 3.000 | 18,9 % | 0,6012 +/- 0,0434 | 0,2389 +/- 0,0313 | no disponible | no disponible |

Notas de la model card sobre la evaluacion: en AMBER el universo de objetos es el conjunto `(imagen, sustantivo)` anotado por humanos, de modo que los sustantivos mencionados por el 13B que no tienen etiqueta AMBER no se puntuan (2.367 de 3.350 pares candidatos emparejados). Los umbrales de mejor F1 se seleccionaron en el split de validacion de COCO y se congelaron; no se ajusto nada sobre el holdout de test, AMBER ni POPE.

## Requisitos de hardware

- La sonda en si es un cabezal ligero: el coste relevante es ejecutar el modelo base LLaVA-1.5-13B y exponer las activaciones de las capas 10, 15, 20, 25 y 30. La model card no publica requisitos de hardware.
- Estimacion orientativa (no confirmada en la model card) para el base en fp16: en torno a 26 GB solo de pesos, mas el coste del cache de activaciones y de la torre visual; requiere una GPU de 40 GB o mas (A100 40 GB, A100 80 GB, H100) o reparto en varias GPU.
- En consumer GPU: con cuantizacion de 4 bits el base suele caber en una RTX 4090 o RTX 3090 de 24 GB; no obstante, la model card no confirma que la sonda mantenga su calibracion bajo cuantizacion, ya que los umbrales y las caracteristicas se obtuvieron sobre el modelo sin cuantizar.
- El repositorio ocupa 7,3 GB en disco, correspondientes a checkpoints y cache de caracteristicas; conviene reservar espacio adicional para el modelo base.
- Opciones de despliegue: la extraccion de estados ocultos intermedios exige frameworks que expongan las activaciones internas (por ejemplo, HuggingFace Transformers con `output_hidden_states`). Los servidores de inferencia orientados a generacion (vLLM, TGI, llama.cpp, Ollama) no estan pensados para devolver activaciones por capa, por lo que no son una via directa para usar la sonda.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaLoProbe COCO sobre LLaVA-1.5-13B (este artefacto) | Sonda de alucinacion de objeto | Cabezal sobre base de 13B | no disponible | no disponible | Repositorio HuggingFace de 7,3 GB |
| Release de 7B de HaLoProbe | Misma familia, modelo base distinto | Cabezal sobre base de 7B | no disponible | no disponible | Mencionada en la model card; enlace no incluido |
| TruthPrInt | Metodo de referencia citado por la capa 20 | no disponible | no disponible | no disponible | Referenciado, sin enlace en la model card |
| AMBER y POPE-Adversarial | No son modelos comparables, sino benchmarks usados para la evaluacion | no aplica | no aplica | no disponible | Datos de evaluacion referenciados en la model card |

La model card es explicita en que esta version no es intercambiable con la de 7B: caracteristicas, geometria y umbrales son especificos del modelo base. No se han facilitado datos cuantitativos de otras sondas sobre los mismos conjuntos, por lo que la comparacion directa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Especificidad del modelo base: la sonda solo es valida para LLaVA-1.5-13B. Usarla con otro modelo o con la variante de 7B invalida umbrales y caracteristicas.
- Generalizacion limitada fuera de COCO: el AUROC cae de 0,9315 en el holdout COCO a 0,8526 en AMBER y a 0,6012 en POPE-Adversarial, valor apenas por encima del azar, con una desviacion estandar de +/- 0,0434.
- Desequilibrio de clases: con solo un 5,37 % de positivos en AMBER, el AUPRC baja a 0,2829 y el F1 a 0,3290; el umbral congelado de COCO es claramente suboptimo en ese regimen.
- Corpus auto-generado: las leyendas del conjunto de entrenamiento las produjo el propio LLaVA-1.5-13B, por lo que los sesgos y patrones de alucinacion del modelo base quedan incorporados al material de entrenamiento.
- Semillas no combinables: la model card indica que las tres semillas son independientes y que no deben ensamblarse.
- Cobertura parcial en AMBER: solo 2.367 de 3.350 pares candidatos tienen etiqueta humana; los sustantivos sin etiqueta no se puntuan, lo que dificulta la comparacion con otros trabajos.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de integrarlo en produccion.
- Riesgo de alucinacion del propio modelo base: la sonda reduce falsos positivos, pero no elimina la generacion de contenido no fundamentado; debe usarse como capa de verificacion, no como garantia.
- Validacion obligatoria de compatibilidad: antes de reutilizar la cache hay que comparar `metadata/model_profile.json` con la salida de `model_workflow.sh show-profile`; si no coinciden, la cache debe reconstruirse.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura multilingue ni sobre la longitud de contexto manejada.
- Repositorio sin pipeline declarado ni descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.
- Idioma de la documentacion: la model card esta en ingles y no incluye guia de integracion paso a paso mas alla del layout de directorios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToiTenBao/haloprobe-ours-coco-llava15-13b
- Modelo base referenciado en la model card: https://huggingface.co/llava-hf/llava-1.5-13b-hf
- No se han encontrado enlaces adicionales relevantes: los resultados de la busqueda web proporcionada corresponden a paginas de musicales en Hamburgo y no guardan relacion con el modelo. La model card tampoco incluye enlaces a paper, repositorio de codigo, demo ni al release de 7B de la misma familia.
