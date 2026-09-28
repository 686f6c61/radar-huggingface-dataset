# xw131/hw1-hc3-detector

# xw131/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador binario de texto en inglés disenado para distinguir entre texto escrito por humanos y texto generado por ChatGPT. Lo publica el usuario xw131 en Hugging Face y esta construido mediante fine-tuning de sentence-transformers/all-MiniLM-L6-v2 sobre el dataset HC3, un corpus publico de pares pregunta-respuesta con respuestas humanas y respuestas generadas por ChatGPT.

El modelo resuelve una tarea muy concreta: la deteccion de texto generado por IA en un unico dominio de origen (HC3). Con 22.713.986 parametros y un pipeline de text-classification, es un encoder tipo BERT de tamano muy reducido, pensado para inferencia barata y despliegue en CPU o en GPUs de gama baja. Segun la model card, el ajuste eleva la exactitud en test desde 0,8449 (embeddings congelados mas regresion logistica) hasta 0,9728.

Su relevancia actual es acotada pero real: sirve como baseline reproducible y ligero para investigacion en deteccion de texto sintetico, y como componente de prefiltrado en pipelines de curacion de datos. Conviene subrayar que el repositorio no publica licencia, no documenta hiperparametros de entrenamiento ni evaluacion cruzada fuera de dominio, y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, derivado de sentence-transformers/all-MiniLM-L6-v2 |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base all-MiniLM-L6-v2 trabaja con una ventana maxima de 256 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no hay GGUF, GPTQ ni AWQ publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo BERT de 6 capas y 22,7 millones de parametros, heredada del modelo de embeddings all-MiniLM-L6-v2, al que se anade una cabeza de clasificacion de secuencia para producir dos etiquetas (texto humano / texto generado por ChatGPT). No se trata de un modelo generativo, sino de un clasificador discriminativo: consume el texto completo y emite una probabilidad por clase. El repositorio no detalla el numero de capas por configuracion propia, la dimension oculta ni el numero de cabezas de atencion, aunque el recuento de parametros es consistente con la arquitectura MiniLM de 6 capas.

En cuanto al entrenamiento, la model card indica unicamente que se hizo fine-tuning sobre el dataset HC3. No se especifican el numero de tokens de entrenamiento, la composicion exacta del split, la tasa de aprendizaje, el numero de epocas, el tamano de batch ni si se aplico algun tipo de regularizacion o calibracion. Tampoco se documenta el uso de RLHF, DPO u otras tecnicas de alineacion, algo que en un clasificador no resulta aplicable. La unica innovacion o dato tecnico destacable es la comparacion explicita contra un baseline de embeddings congelados mas regresion logistica (0,8449 de exactitud), lo que confirma que el fine-tuning completo del encoder aporta una mejora sustancial frente a reutilizar los embeddings sin ajustar.

## Capacidades

- Clasificacion binaria de texto en ingles: etiqueta cada fragmento como escrito por un humano o generado por ChatGPT.
- Deteccion de texto generado por IA en el dominio concreto cubierto por el dataset HC3, con una exactitud declarada en test de 0,9728.
- Inferencia rapida y de bajo coste gracias a sus 22,7 millones de parametros.
- Integracion directa con la libreria transformers mediante el pipeline de text-classification.
- Compatibilidad declarada con text-embeddings-inference y con endpoints compatibles (etiquetas del repositorio).
- Capacidad de servir como extractor de representaciones reutilizable, ya que deriva de un modelo de sentence embeddings.
- No soporta tool calling ni function calling: es un clasificador, no un modelo de proposito general.
- No dispone de modo de razonamiento (thinking), ni de capacidades de agente, multi-step reasoning, vision o audio.
- No soporta otros idiomas distintos del ingles, segun los metadatos del repositorio.

## Casos de uso

- Prefiltrado de corpus de entrenamiento: antes de entrenar o ajustar un LLM, pasar los documentos por este clasificador y descartar o marcar los que superen un umbral de probabilidad de generacion por IA. Su tamano de 22,7 millones de parametros permite procesar millones de documentos con coste minimo.
- Verificacion de integridad academica: integrarlo en una plataforma de entrega de trabajos para marcar ensayos sospechosos de haber sido generados por ChatGPT. Requiere revision humana obligatoria, dado que solo se ha evaluado en un dominio concreto y el modelo no ofrece probabilidades calibradas.
- Moderacion de contenido en comunidades online: detectar respuestas generadas automaticamente en foros y sistemas de comentarios, canalizando los casos positivos a revision manual o a un clasificador secundario mas costoso.
- Curacion de datos de investigacion: en estudios sobre calidad de respuestas en dominios como preguntas abiertas o asistencia medica, usar el modelo como etiquetador automatico previo para segmentar el corpus antes del analisis estadistico.
- Investigacion en deteccion de texto sintetico: emplearlo como baseline ligero y reproducible frente al que comparar propuestas nuevas, ya que el repositorio publica la cifra exacta del baseline previo (0,8449) y la del modelo ajustado (0,9728).
- Clasificacion masiva de baja latencia en produccion: al tener menos de 100 MB de pesos en fp32, se puede desplegar en contenedores pequenos o en funciones serverless y escalar horizontalmente en CPU sin GPU.
- Auditoria interna de contenidos generados por asistentes: si una organizacion usa asistentes basados en ChatGPT, este clasificador permite etiquetar automaticamente el contenido almacenado y construir inventarios de material sintetico sin intervencion manual.
- En todos estos casos hay que tener en cuenta la ventana de 256 tokens del modelo base: los textos largos deberan dividirse en fragmentos y agregar las puntuaciones (por ejemplo, con un maximo, una media ponderada o una proporcion de fragmentos positivos).

## Benchmarks y rendimiento

| Metrica | Baseline (embeddings congelados + regresion logistica) | Modelo ajustado (xw131/hw1-hc3-detector) |
|---|---|---|
| Exactitud (accuracy) en test | 0,8449 | 0,9728 |

Los dos unicos datos numericos publicados proceden de la model card del autor y corresponden a exactitud sobre un conjunto de test del dataset HC3. No se especifican el split exacto, el numero de ejemplos evaluados, la matriz de confusion ni metricas adicionales como precision, recall, F1 o AUC.

No se han publicado resultados de benchmarks en la informacion disponible para otras tareas (MMLU, HumanEval, GSM8K u otras), algo esperable porque el modelo no es generativo y no puede evaluarse con ese tipo de pruebas.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 91 MB en fp32, 45 MB en fp16 y 23 MB en int8. Todos los calculos son estimaciones derivadas del recuento publicado de 22.713.986 parametros.
- VRAM estimada para inferencia: por debajo de 1 GB incluso con lotes de tamano moderado, ya que el modelo y sus activaciones son minimos.
- GPU: no necesita GPU. Cualquier GPU consumer sirve; una RTX 3060, una GTX 1650 o incluso una GPU integrada son mas que suficientes. Una A100 o una H100 estarian completamente sobredimensionadas para este modelo.
- Inferencia en CPU: totalmente viable, y es probablemente el modo de despliegue recomendado por coste.
- Opciones de despliegue: pipeline de transformers, text-embeddings-inference (etiqueta declarada en el repositorio), Hugging Face Inference Endpoints (el repositorio figura como endpoints_compatible), vLLM o TGI como servidores genericos (aunque su ventaja principal son los modelos generativos), y conversion a ONNX o a otros runtimes ligeros.
- Cuantizacion: no hay artefactos GGUF, GPTQ ni AWQ publicados, de modo que un despliegue con Ollama o llama.cpp requeriria convertir y cuantizar los pesos por cuenta propia.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo, y al tratarse de un clasificador las metricas relevantes serian fragmentos por segundo, que tampoco se documentan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xw131/hw1-hc3-detector | 22.713.986 | no confirmada (256 en el modelo base) | 0,9728 | no disponible | Repositorio de Hugging Face, 0 descargas y 0 likes |
| all-MiniLM-L6-v2 + regresion logistica (baseline del propio autor) | 22,7 millones aprox. | 256 tokens | 0,8449 | no indicada en la informacion disponible | sentence-transformers/all-MiniLM-L6-v2, ampliamente utilizado |
| Chengwei-Shen/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | Repositorio de Hugging Face |
| shichenghu/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | Repositorio de Hugging Face |
| Detectores comerciales (por ejemplo GPTZero) | no disponible | no disponible | no disponible | propietaria | Servicio web de pago |

Los repositorios Chengwei-Shen/hw1-hc3-detector y shichenghu/hw1-hc3-detector comparten nombre y estructura con este modelo, lo que apunta a variantes o copias de un mismo ejercicio academico. No publican metricas, licencia ni configuracion, de modo que no es posible compararlos tecnicamente. Tampoco se dispone de datos comparativos frente a detectores academicos como clasificadores basados en RoBERTa o enfoques de deteccion estadistica, porque la informacion proporcionada no los incluye.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado para otros idiomas, segun los metadatos del repositorio.
- Sesgo de dominio y de generador: el modelo se ajusto sobre HC3 y para detectar texto de ChatGPT. Es previsible que su rendimiento caiga frente a otros generadores (GPT-4, Claude, Llama, Gemini) y en generos textuales distintos de los cubiertos por HC3, aunque no hay evaluacion publicada que cuantifique esa degradacion.
- Limitacion de longitud: la ventana del modelo base es de 256 tokens, por lo que los documentos largos deben trocearse. La estrategia de agregacion de puntuaciones no esta documentada y afecta directamente al resultado final.
- Riesgo de falsos positivos: los detectores de este tipo tienden a marcar como sintetico el texto muy formulaico, traducido o escrito por personas no nativas. No se publica ninguna analisis de este comportamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no genera texto; en su lugar existe el riesgo de clasificacion erronea con alta confianza y de probabilidades mal calibradas.
- Licencia ausente: el repositorio no declara licencia, lo que deja en una situacion juridica indeterminada cualquier uso comercial o redistribucion de los pesos.
- Ausencia de documentacion de entrenamiento: no se publican hiperparametros, splits, semillas ni proceso de calibracion, lo que dificulta la reproducibilidad y la auditoria.
- Senales de provenance debiles: el modelo tiene 0 descargas y 0 likes, las marcas temporales del repositorio estan fechadas en 2026 y existen multiples repositorios homonimos, lo que sugiere un ejercicio academico sin validacion externa.
- Uso en produccion: no deberia emplearse como unico criterio en decisiones con impacto sobre personas (evaluacion academica, seleccion de personal, moderacion con sanciones). Cualquier despliegue serio exige umbrales calibrados con datos propios, validacion en el dominio objetivo y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xw131/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio homonimo de Chengwei-Shen: https://huggingface.co/Chengwei-Shen/hw1-hc3-detector
- Repositorio homonimo de shichenghu: https://huggingface.co/shichenghu/hw1-hc3-detector
- Entrada del modelo en Free2AITools: https://free2aitools.com/model/chengwei-shen/hw1-hc3-detector
- Entrada del modelo en Savrn: https://savrn.com/models/hw1-hc3-detector
- Detector comercial de referencia (GPTZero): https://gptzero.me/
