# Tongmiao/hw1-hc3-detector

## Resumen

Tongmiao/hw1-hc3-detector es un clasificador binario de texto que distingue respuestas escritas por personas de respuestas generadas por ChatGPT. Se ha construido mediante fine-tuning de `sentence-transformers/all-MiniLM-L6-v2`, un encoder de tipo BERT de 22.713.986 parametros, sobre respuestas del corpus HC3. El autor lo publica bajo la cuenta Tongmiao y esta etiquetado en HuggingFace con la tarea `text-classification`.

El problema que resuelve es acotado y concreto: la deteccion de texto generado por IA dentro del dominio de las respuestas de HC3, con dos etiquetas (`0 = Human`, `1 = ChatGPT`). Segun la model card, el modelo alcanza una exactitud de 0,9919 en el conjunto de test, frente a 0,8449 de una linea base de regresion logistica sobre embeddings congelados, lo que supone una mejora de casi 15 puntos porcentuales.

Su relevancia practica deriva del tamano: con 0,1 GB de repositorio y 22,7 millones de parametros, es un modelo que se ejecuta en CPU o en cualquier GPU de consumo, y es compatible con `text-embeddings-inference` y con endpoints. En el momento de redactar esta ficha no tiene descargas ni valoraciones, y la model card no declara licencia, idiomas soportados ni el volumen exacto de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, basado en `sentence-transformers/all-MiniLM-L6-v2` con cabeza de clasificacion binaria |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer de tipo BERT con 6 capas y 384 dimensiones de ocultacion, segun la configuracion publica de `all-MiniLM-L6-v2`, al que se anade una cabeza de clasificacion para dos clases. El modelo resultante tiene 22.713.986 parametros y se distribuye como un repositorio de 0,1 GB en formato safetensors.

El entrenamiento, segun la model card, uso el optimizador AdamW con una tasa de aprendizaje de 2e-5, 5 epocas y una longitud maxima de secuencia de 256 tokens. El corpus de ajuste son respuestas del dataset HC3 etiquetadas como humanas o generadas por ChatGPT. No se documenta el numero de tokens de entrenamiento, ni la composicion exacta del conjunto, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (en este caso, al tratarse de una tarea discriminativa, no serian de aplicacion). La model card solo publica dos cifras: la exactitud de una linea base de regresion logistica sobre embeddings congelados (0,8449) y la del modelo ajustado (0,9919).

## Capacidades

- Clasificacion binaria de texto: asigna la etiqueta `0` (humano) o `1` (ChatGPT) a una respuesta de entrada.
- Deteccion de texto generado por IA en el dominio especifico del corpus HC3.
- Extraccion de embeddings a traves de `text-embeddings-inference`, segun las etiquetas declaradas del repositorio.
- Compatibilidad con el sistema de endpoints de HuggingFace (`endpoints_compatible`).
- Integracion directa en la libreria `transformers` mediante la tarea `text-classification`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No hay evidencia de soporte de tool calling, function calling ni flujos de agentes.
- Capacidades multilingues: no disponible.

## Casos de uso

- Moderacion de contenido en foros y plataformas de preguntas y respuestas: el modelo puede marcar respuestas potencialmente generadas por ChatGPT antes de su publicacion manual, con un coste de inferencia muy bajo al tratarse de un modelo de 22,7 millones de parametros.
- Auditoria de integridad academica: en entornos educativos online, puede utilizarse como primera senal (no como prueba concluyente) para revisar respuestas sospechosas de haber sido generadas automaticamente.
- Curacion de datasets para entrenamiento: en pipelines de recopilacion de datos textuales, actua como filtro para separar contenido humano de contenido sintetico antes de etiquetar o mezclar el corpus.
- Deteccion de spam y contenido automatizado: permite descartar respuestas generadas de forma masiva en sistemas de soporte o comentarios, reduciendo carga de revision manual.
- Investigacion en deteccion de texto generado: sirve como punto de partida reproducible (semilla, hiperparametros y metrica declarados) para comparar con otros detectores o para estudiar el sobreajuste al dominio HC3.
- Prototipado rapido y docencia: al caber en CPU y en cualquier GPU de consumo, es adecuado para demostraciones en aula, talleres y pruebas de concepto sobre clasificacion de texto con `transformers`.
- Pre-filtro en sistemas de evaluacion de calidad de respuestas: combinado con un clasificador de calidad, puede usarse para enrutar respuestas a revision humana solo cuando la probabilidad de origen sintetico sea alta.

## Benchmarks y rendimiento

| Metrica | Linea base (regresion logistica sobre embeddings congelados) | Modelo ajustado |
|---|---|---|
| Exactitud en test (HC3) | 0,8449 | 0,9919 |

Estos son los unicos datos de evaluacion publicados en la model card. No hay resultados de MMLU, HumanEval, GSM8K ni de otras tareas, lo cual es coherente con la naturaleza discriminativa del modelo. Tampoco se han publicado metricas de precision, recall, F1 ni matriz de confusion, que serian relevantes para valorar el comportamiento por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en FP32, 45 MB en FP16 y 23 MB en int8, calculado a partir de los 22,7 millones de parametros. En la practica, el consumo real es de unos pocos cientos de MB incluyendo el runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100. El modelo esta muy por debajo de las capacidades de cualquiera de ellas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual y tambien en tarjetas integradas.
- Ejecucion en CPU: viable sin aceleracion, dado el reducido numero de parametros y la ventana de 256 tokens.
- Opciones de despliegue: pipeline de `transformers`, servidor `text-embeddings-inference`, endpoints de HuggingFace, ONNX Runtime y FastAPI con PyTorch en modo inferencia.
- vLLM y llama.cpp: no son las herramientas habituales para este tipo de modelo; vLLM esta orientado a generacion y llama.cpp requeriria una conversion a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

Se han localizado varios repositorios con el mismo identificador `hw1-hc3-detector`, aparentemente variantes del mismo ejercicio y publicados por otras cuentas. No se dispone de especificaciones detalladas de esos repositorios mas alla de lo indicado.

| Modelo | Parametros | Contexto | Exactitud declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tongmiao/hw1-hc3-detector | 22.713.986 | 256 tokens | 0,9919 (test HC3) | no disponible | HuggingFace |
| TianhangCheng7/hw1-hc3-detector | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace |
| Aishkrish/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| skyyyyks/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- La exactitud de 0,9919 esta medida en el mismo dominio que el corpus de ajuste (HC3). Es probable que el rendimiento caiga de forma notable fuera de ese dominio o con textos de otros modelos generadores.
- La clase positiva corresponde especificamente a ChatGPT. El modelo no esta entrenado para detectar texto de GPT-4, Claude, Llama u otros modelos, por lo que su uso como detector generico de IA no esta respaldado por los datos publicados.
- La longitud maxima de secuencia es de 256 tokens, por lo que textos largos se truncan y pueden perder la informacion necesaria para una clasificacion fiable.
- No se publica informacion sobre licencia, lo que impide determinar si el uso comercial esta permitido. Antes de integrarlo en produccion habria que aclarar este punto con el autor.
- No se declaran los idiomas soportados. El corpus HC3 original es mayoritariamente en ingles, pero la model card no lo confirma para esta version.
- No se detalla la composicion del conjunto de entrenamiento, su tamano, ni si hubo deduplicacion entre train y test, lo que impide descartar fuga de datos y, por tanto, sobreestimar la exactitud reportada.
- Al ser un clasificador, no alucina en el sentido generativo, pero si puede producir falsos positivos y falsos negativos. No se publican precision ni recall por clase.
- El modelo tiene 0 descargas y 0 valoraciones, y el repositorio se actualizo un minuto despues de su creacion. No ha pasado por validacion de la comunidad.
- Los sesgos especificos del modelo no estan documentados. Como hereda el encoder `all-MiniLM-L6-v2`, arrastra los sesgos presentes en los datos con los que se entreno ese modelo base.
- No conviene utilizarlo como prueba concluyente en contextos disciplinarios o legales; solo como senal orientativa dentro de un proceso con revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tongmiao/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Variante de TianhangCheng7: https://huggingface.co/TianhangCheng7/hw1-hc3-detector
- Variante de Aishkrish: https://huggingface.co/Aishkrish/hw1-hc3-detector
- Ficha en savrn.com: https://savrn.com/models/hw1-hc3-detector
- Ficha en free2aitools.com: https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
- Perfil de GitHub del autor: https://github.com/tongmiaoxu/
- Paper del corpus HC3 (referenciado en model cards similares): https://arxiv.org/abs/2301.07597
