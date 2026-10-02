# yijun6/hw1-hc3-detector

## Resumen

El modelo `yijun6/hw1-hc3-detector` es un clasificador de texto basado en BERT, publicado en HuggingFace con la librería transformers y pesos en safetensors. Cuenta con 22.713.986 parámetros reales, lo que lo sitúa muy por debajo de un BERT-base estándar (unos 110 millones), lo que sugiere una configuración reducida orientada a inferencia ligera. El repositorio ocupa 0,1 GB y, en el momento de la consulta, acumula 0 descargas y 0 "likes", por lo que se trata de un artefacto de publicación muy reciente y sin adopción registrada.

Por la nomenclatura del identificador ("hw1-hc3-detector") y por repositorios homónimos publicados por otros usuarios con las etiquetas `hc3`, `ai-generated-text-detection` y `sentence-transformers`, el modelo apunta a la tarea de detección de texto generado por IA, presumiblemente entrenado o evaluado sobre el corpus HC3 (Human ChatGPT Comparison Corpus). Conviene subrayar que esta atribución de tarea procede de repositorios relacionados de terceros, no de la model card del autor, que no documenta el propósito del modelo.

La relevancia actual del modelo radica en su tamaño reducido: 22,7 millones de parámetros permiten ejecutarlo en CPU o en cualquier GPU de consumo con un consumo de memoria inferior a 100 MB en fp32. No obstante, la ausencia de información sobre datos de entrenamiento, licencia, idiomas y protocolo de evaluación limita seriamente su uso en producción sin una validación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (etiqueta declarada en el repositorio: `bert`) |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la model card del autor; los repositorios homónimos de terceros declaran inglés |
| Licencia | No disponible (repositorios homónimos publican `apache-2.0`) |
| Formato de pesos | safetensors |
| Tarea declarada (`pipeline_tag`) | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion (segun el repositorio) | 2026-10-02 |
| Ultima actualizacion (segun el repositorio) | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `bert` del repositorio y el recuento de parámetros (22,7 millones) indican una arquitectura transformer encoder-only con una configuración reducida respecto a BERT-base, probablemente con menos capas y/o un tamaño de representación oculto menor, y una cabeza de clasificación de secuencia para `text-classification`. No se dispone de información sobre el número de capas, cabezas de atención, dimensión oculta ni vocabulario, ya que la model card no incluye la sección de especificaciones técnicas y todos sus apartados figuran como "[More Information Needed]".

Respecto al entrenamiento, la model card no documenta el conjunto de datos, el número de tokens, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Los únicos datos de evaluación aportados por el autor son dos cifras de precisión: una línea base de 0,8451 y una precisión de test tras el ajuste fino de 0,9728. No se especifica sobre qué conjunto de datos, con qué métrica exacta ni con qué partición se obtuvieron esos valores. Tampoco se documentan hiperparámetros de entrenamiento, régimen de precisión (fp32, fp16, bf16) ni infraestructura de cómputo empleada.

## Capacidades

- Clasificación de texto: el modelo expone la tarea `text-classification`, es decir, asigna etiquetas a secuencias de entrada completas.
- Presunta detección de texto generado por IA: por la nomenclatura del identificador y por repositorios homónimos etiquetados como `ai-generated-text-detection` y `hc3`, la tarea más probable es distinguir texto humano de texto generado por modelos como ChatGPT. Este extremo no está confirmado en la documentación del autor.
- Compatibilidad con text-embeddings-inference: la etiqueta `text-embeddings-inference` indica que el modelo puede servirse mediante el contenedor TEI de HuggingFace.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en HuggingFace Inference Endpoints.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; la arquitectura encoder-only y el pipeline de clasificación no están diseñados para generación de texto ni razonamiento multi-turno.
- Capacidades multilingües: no disponibles en la información del autor.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Moderación de contenido generado por IA en plataformas colaborativas: el modelo puede clasificar comentarios, artículos o publicaciones entrantes y marcar aquellos con alta probabilidad de haber sido generados automáticamente, con un coste de inferencia mínimo gracias a sus 22,7 millones de parámetros.
- Control de integridad académica: integrado en una plataforma de entrega de trabajos, puede ejecutarse sobre cada envío para emitir una señal de alerta que después revise un evaluador humano, evitando así decisiones automáticas basadas en un clasificador no auditado.
- Limpieza de corpus para entrenamiento: en pipelines de curación de datasets, puede filtrar documentos sintéticos o generados por modelos antes de incorporarlos a un corpus de preentrenamiento, reduciendo el riesgo de contaminación por datos autogenerados.
- Detección de reseñas falsas en comercio electrónico: combinado con reglas de negocio (antigüedad de la cuenta, patrón de publicación), puede priorizar reseñas sospechosas de haber sido redactadas por un modelo generativo para su revisión manual.
- Detección de spam y contenido automatizado en foros: al ser un modelo de 0,1 GB, puede desplegarse junto al servicio web de un foro y clasificar cada mensaje nuevo en milisegundos en CPU, sin necesidad de GPU dedicada.
- Auditoría editorial en medios de comunicación: verificación asistida de textos recibidos de colaboradores externos o de agencias, generando una puntuación de sospecha que el editor contrasta con otras fuentes.
- Servicio de clasificación bajo demanda vía Inference Endpoints: gracias a la etiqueta `endpoints_compatible`, puede exponerse como API REST gestionada sin mantener infraestructura propia, adecuado para prototipos y volúmenes moderados.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de datos | Notas |
|---|---|---|---|
| Precision (linea base) | 0,8451 | No disponible | Cifra aportada por el autor en la model card |
| Precision (test tras ajuste fino) | 0,9728 | No disponible | Cifra aportada por el autor en la model card |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. Las dos cifras anteriores carecen de descripción del protocolo de evaluación, del conjunto de test y de la métrica exacta empleada, por lo que no son reproducibles ni comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en fp32 (22.713.986 parámetros × 4 bytes), unos 45 MB en fp16/bf16 y unos 23 MB en int8. A estas cifras hay que sumar el consumo de activaciones y del runtime, marginal en comparación con el peso de los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente, incluidas GTX 1050, GTX 1650, RTX 3050, RTX 4090, A100 y H100. El modelo está muy por debajo de la capacidad de todas ellas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo de la última década, e incluso en GPU integradas.
- Ejecución en CPU: viable para producción con volúmenes moderados, dado el reducido número de parámetros y el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference (etiqueta del repositorio), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma | Tarea declarada |
|---|---|---|---|---|---|
| yijun6/hw1-hc3-detector | 22.713.986 | No disponible | No disponible | No disponible | text-classification |
| TianhangCheng7/hw1-hc3-detector | No disponible | No disponible | apache-2.0 | Ingles | Clasificacion de texto generado por IA (HC3) |
| Aishkrish/hw1-hc3-detector | No disponible | No disponible | No disponible | No disponible | No disponible |
| Hello-SimpleAI (detectores HC3) | No disponible | No disponible | No disponible | No disponible | Deteccion de texto generado por IA |

Los tres primeros modelos comparten identificador de nombre y parecen corresponder a entregas de un mismo ejercicio académico, sin documentación pública sustancial. No se dispone de datos de rendimiento comparables entre ellos. Para una comparación rigurosa con detectores de texto generado consolidados (por ejemplo, variantes basadas en RoBERTa entrenadas sobre HC3 del proyecto Hello-SimpleAI), sería necesario evaluar todos los modelos sobre el mismo conjunto de test, algo que no se ha hecho en la información disponible.

## Limitaciones y advertencias

- Model card vacía: todos los apartados de propósito, datos de entrenamiento, sesgos, usos fuera de alcance y recomendaciones figuran como "[More Information Needed]". No hay información verificable sobre el proceso de construcción del modelo.
- Licencia no disponible: al no declararse licencia, no existe autorización explícita de uso comercial. Cualquier despliegue en producción debería aclarar antes los términos con el autor.
- Protocolo de evaluación opaco: las precisiones de 0,8451 y 0,9728 no van acompañadas del conjunto de datos, la métrica ni la partición empleada, por lo que no son auditables ni reproducibles.
- Idioma no confirmado: la model card no declara idiomas. Si el modelo se entrenó sobre HC3, el corpus es mayoritariamente en inglés, lo que limitaría su validez en castellano.
- Riesgo de sesgo de dominio: los detectores de texto generado tienden a sobreajustarse al estilo de un modelo concreto (ChatGPT en el caso de HC3) y a degradarse frente a generadores más recientes o frente a texto parafraseado por herramientas de "humanización".
- Falsos positivos sobre hablantes no nativos: los clasificadores de este tipo muestran con frecuencia tasas elevadas de falsos positivos con textos de personas no nativas o con registros muy formularios, un riesgo sociotécnico relevante si se usa en contextos disciplinarios.
- Ausencia de calibración documentada: no se publican curvas de calibración ni umbrales recomendados, de modo que la puntuación de salida no puede interpretarse directamente como probabilidad fiable.
- Deriva temporal: la eficacia de un detector entrenado contra un generador concreto disminuye a medida que aparecen nuevos modelos, sin que exista documentación sobre la fecha de corte de los datos de entrenamiento.
- Contraindicación de uso sancionador: no debería utilizarse como única evidencia para acusar a una persona de usar IA, dado el carácter probabilístico del modelo y la falta de documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yijun6/hw1-hc3-detector
- Repositorio homonimo de TianhangCheng7: https://huggingface.co/TianhangCheng7/hw1-hc3-detector
- Repositorio homonimo de Aishkrish: https://huggingface.co/Aishkrish/hw1-hc3-detector
- Proyecto Hello-SimpleAI (corpus HC3 y detectores): https://github.com/Hello-SimpleAI
- Entrada en savrn.com: https://savrn.com/models/hw1-hc3-detector
- Entrada en free2aitools.com: https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
- Paper referenciado en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Paper referenciado en repositorios homonimos sobre HC3 y deteccion de texto de ChatGPT: https://arxiv.org/abs/2301.07597
