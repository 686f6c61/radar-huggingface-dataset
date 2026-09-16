# ToiTenBao/vib-probe-ours-coco-llava15-13b

## Resumen

VIB-Probe (variante COCO sobre LLaVA-1.5-13B) es un artefacto de diagnóstico, no un modelo generativo. Se trata de una sonda (probe) entrenada para detectar alucinaciones de objeto en las respuestas del modelo multimodal LLaVA-1.5-13B, es decir, para señalar cuándo el modelo menciona en su descripción una entidad que no aparece realmente en la imagen. Lo publica el usuario ToiTenBao y se apoya en las representaciones internas del decodificador base `llava-hf/llava-1.5-13b-hf`.

El recurso se distribuye con tres semillas de entrenamiento independientes (0, 42 y 1337) y con las características (features) ya cacheadas sobre varios corpus, lo que explica que el repositorio ocupe 40,1 GB pese a que la sonda en sí sea un clasificador ligero. La model card advierte explícitamente de que estos artefactos no son intercambiables con la versión de 7B: las features, la geometría de capas y los umbrales son específicos de cada modelo base.

Su relevancia es metodológica: cuantifica de forma reproducible el comportamiento de un detector de alucinación bajo un protocolo estricto (umbrales fijados en validación y congelados antes de evaluar en test, AMBER y POPE), y publica resultados con media y desviación estándar sobre tres semillas. Esto lo convierte en material útil para reproducibilidad y para estudiar la generalización fuera de dominio, más que en un componente desplegable de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda (clasificador) sobre caracteristicas internas del decodificador de LLaVA-1.5-13B; no es un modelo generativo |
| Parametros totales | no disponible (no se especifica el numero de parametros de la sonda; el modelo base tiene ~13B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; heredada del modelo base LLaVA-1.5-13B, no declarada en la ficha |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints por semilla (formato no especificado); caches de features; metadatos en JSON (`model_profile.json`, `thresholds.json`, `manifest.json`) |
| Modelo base | llava-hf/llava-1.5-13b-hf |
| Capas del decodificador / hidden / cabezas | 40 / 5120 / 40 |
| Rejilla de parches de vision | 24 x 24 |
| Capas de la sonda | 10, 15, 20, 25, 30 |
| Capa TruthPrInt | 20 |
| Semillas | 0, 42, 1337 (independientes; no ensamblar) |
| Tamano del repositorio | 40,1 GB |

## Arquitectura y entrenamiento

La sonda opera sobre las activaciones internas del decodificador de LLaVA-1.5-13B, muestreadas en las capas 10, 15, 20, 25 y 30, con una capa adicional de referencia TruthPrInt en la capa 20. El modelo base emplea una rejilla de parches visuales de 24 x 24 y un decodificador de 40 capas con dimensión oculta 5120 y 40 cabezas de atención. La sonda se entrena de forma independiente con tres semillas (0, 42 y 1337), y el autor indica explícitamente que no deben ensamblarse entre sí.

El corpus procede de 10.000 imágenes de COCO train2014, divididas 80/20 por imagen: 8.000 imágenes de entrenamiento con 54.253 spans de objeto y 2.000 de retención (holdout) con 13.789 spans de objeto. Un punto crítico es que las descripciones del corpus las genera el propio modelo de 13B, por lo que este corpus no es el mismo que el de la variante de 7B. Los umbrales se seleccionan maximizando F1 sobre la partición de validación de COCO y después se congelan; no se ajusta nada sobre el holdout de test, AMBER ni POPE. Los umbrales seleccionados por semilla son -0,56099 (semilla 0), -0,16638 (semilla 42) y -0,66744 (semilla 1337).

El repositorio incluye `checkpoints/` (uno por semilla), los caches de features (`cache/coco/{train,holdout}/`, `cache/amber/seed*/`, `cache/pope_adversarial/`) y varios metadatos: `metadata/model_profile.json` (id de modelo, capas, anchura, cabezas, rejilla de visión), `metadata/thresholds.json` (umbrales por semilla) y `metadata/manifest.json` (procedencia del corpus y origen de los caches). El autor indica que, antes de usar los artefactos, hay que comparar `metadata/model_profile.json` con la salida de `model_workflow.sh show-profile`; si no coinciden, el cache debe reconstruirse.

## Capacidades

- Deteccion de alucinacion de objeto: clasifica si una mencion de objeto generada por LLaVA-1.5-13B esta o no respaldada por la imagen.
- Puntuacion binaria con umbral congelado: produce una decision positiva/negativa a partir del score de la sonda y del umbral por semilla.
- Extraccion de caracteristicas internas: trabaja sobre activaciones de capas concretas (10, 15, 20, 25, 30) del decodificador y sobre la capa TruthPrInt (20).
- Reproducibilidad multi-semilla: permite repetir el analisis con tres entrenamientos independientes y reportar media y desviacion estandar.
- Evaluacion zero-shot fuera de dominio: los caches de AMBER y POPE-Adversarial permiten evaluar con umbrales de COCO sin reajuste.
- Diagnostico por vista de mencion: los resultados de COCO se reportan en "mention view" (n=13.787).
- No es un modelo generativo: no produce texto, no soporta tool calling, no implementa agentes, no tiene modo de razonamiento ni capacidades de audio, y no se declaran capacidades multilingues.

## Casos de uso

- Auditoria de alucinacion en sistemas VLM: dado un pipeline que use LLaVA-1.5-13B, la sonda puede marcar menciones de objeto no respaldadas por la imagen, de modo que un revisor humano o un filtro automatico descarte afirmaciones dudosas antes de publicar la descripcion.
- Evaluacion comparativa de checkpoints: al fijar umbrales y capas, permite comparar distintas versiones o ajustes del modelo base midiendo si la tasa de alucinacion de objeto sube o baja entre ellas.
- Investigacion en interpretabilidad: el muestreo en cinco capas (10, 15, 20, 25, 30) facilita estudiar en que profundidad del decodificador se codifica la presencia real de un objeto frente a su mencion alucinada.
- Reproduccion de resultados academicos: los tres seeds, los umbrales congelados y los caches publicados permiten repetir los numeros reportados sin reentrenar, algo util para replicaciones y revisiones por pares.
- Pruebas de generalizacion fuera de dominio: los caches de AMBER y POPE-Adversarial permiten medir la caida de rendimiento al aplicar umbrales de COCO sobre distribuciones distintas, un escenario habitual al validar detectores antes de llevarlos a produccion.
- Control de calidad en anotacion de datos: la sonda puede prefiltrar descripciones sinteticas generadas por el modelo para detectar objetos inexistentes antes de incorporarlas a un dataset de entrenamiento o evaluacion.
- Analisis de robustez ante adversariales: con POPE-Adversarial se puede examinar la sensibilidad de la sonda a las preguntas trampa, un caso habitual en la validacion de sistemas de vision-lenguaje.

## Benchmarks y rendimiento

Los resultados se reportan como media +/- desviacion estandar sobre las tres semillas. Los umbrales se seleccionan por mejor F1 en la particion de validacion de COCO y despues se congelan.

COCO test holdout — vista de mencion, n=13.787, 16,19% positivos:

| AUROC | AUPRC | ACC | F1 |
|---|---|---|---|
| 0,9405 +/- 0,0016 | 0,7651 +/- 0,0115 | 0,8981 +/- 0,0031 | 0,7056 +/- 0,0063 |

AMBER, estricto zero-shot — n=2.367 filas / 977 imagenes, 5,37% positivos, umbrales de COCO congelados:

| AUROC | AUPRC | ACC | F1 |
|---|---|---|---|
| 0,8544 +/- 0,0181 | 0,2587 +/- 0,0301 | 0,8851 +/- 0,0169 | 0,3647 +/- 0,0434 |

POPE-Adversarial, zero-shot — n=3.000, 18,9% positivos:

| AUROC | AUPRC |
|---|---|
| 0,6663 +/- 0,0114 | 0,3152 +/- 0,0187 |

Notas de evaluacion indicadas por el autor: el universo de objetos de AMBER es el conjunto `(imagen, sustantivo)` etiquetado por humanos; los sustantivos que el modelo de 13B menciona pero que no tienen etiqueta en AMBER no se puntuan (se emparejaron 2.367 de 3.350 pares candidatos). Umbrales de mejor F1 en validacion por semilla: -0,56099 / -0,16638 / -0,66744.

## Requisitos de hardware

- La sonda es un clasificador ligero y opera sobre features ya cacheadas; su inferencia aislada es de coste bajo, pero el autor no publica cifras de latencia ni throughput.
- VRAM para inferencia de la sonda: no disponible en la informacion proporcionada.
- Para regenerar las features es necesario ejecutar el modelo base LLaVA-1.5-13B; los requisitos de hardware de ese modelo no se detallan en la ficha (estimacion orientativa no confirmada: del orden de decenas de GB en precision completa, bastante menos con cuantizacion agresiva).
- Repositorio de 40,1 GB: requiere espacio en disco considerable si se descargan checkpoints y caches completos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponibles; el artefacto se distribuye como checkpoints y caches, no como un modelo servible por estos runners.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Modelo base | Semillas | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| VIB-Probe COCO (LLaVA-1.5-13B) | Sonda de deteccion de alucinacion | LLaVA-1.5-13B | 0, 42, 1337 | no disponible | AUROC 0,9405 (COCO holdout) / 0,8544 (AMBER) / 0,6663 (POPE-Adv) | no disponible | HuggingFace, 40,1 GB, 0 descargas |
| VIB-Probe (variante 7B) | Sonda de deteccion de alucinacion | LLaVA-1.5-7B | no disponible | no disponible | no disponible | no disponible | Mencionada por el autor; no intercambiable con la de 13B |
| Otros detectores de alucinacion sobre VLM | Sondas o metodos de deteccion | no disponible | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos concretos en la informacion disponible |

La model card solo ofrece comparacion explicita frente a la variante de 7B de la misma familia, limitada a la advertencia de que las features, la geometria y los umbrales no son transferibles entre ambos tamanos. No se dispone de comparaciones numericas con metodos alternativos.

## Limitaciones y advertencias

- No es un modelo generativo ni un asistente: no genera texto, no hace tool calling ni razonamiento multi-paso; su funcion es exclusivamente la clasificacion de menciones.
- Dependencia estricta del modelo base: los artefactos de 13B no son intercambiables con los de 7B; usar features de otro modelo invalida la sonda.
- Los tres seeds son independientes y el autor advierte de no ensamblarlos; combinarlos no es el uso previsto.
- Riesgo de alucinacion del propio detector: la sonda tiene falsos positivos y falsos negativos (F1 de 0,7056 en COCO holdout y de 0,3647 en AMBER), por lo que no debe usarse como verdad absoluta sin supervision humana.
- Generalizacion fuera de dominio limitada: la caida de AUROC de 0,9405 en COCO a 0,8544 en AMBER y 0,6663 en POPE-Adversarial muestra un rendimiento claramente inferior en distribuciones distintas y ante preguntas adversariales.
- Cobertura de AMBER incompleta: solo se puntuan los pares `(imagen, sustantivo)` con etiqueta humana; los sustantivos sin etiqueta no se evaluan, lo que afecta a la interpretacion de las cifras.
- Sesgos del corpus: el material de entrenamiento proviene de COCO y de descripciones generadas por el propio modelo de 13B, por lo que hereda los sesgos y el estilo de ambos.
- Restricciones de licencia: la licencia no esta declarada; antes de cualquier uso comercial hay que confirmarla, tanto la de este artefacto como la del modelo base `llava-hf/llava-1.5-13b-hf`.
- Caveat de despliegue: si `metadata/model_profile.json` no coincide con la salida de `model_workflow.sh show-profile`, el cache de features debe reconstruirse; usar caches desalineados produce resultados invalidos.
- Idiomas soportados no declarados; no se documenta comportamiento multilingue.
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los enlaces encontrados no guardan relacion con el artefacto).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ToiTenBao/vib-probe-ours-coco-llava15-13b
- Modelo base referenciado en la ficha: `llava-hf/llava-1.5-13b-hf`
- Papers, blogs, repos o demos adicionales: no disponibles (la busqueda web no devolvio resultados relevantes)
