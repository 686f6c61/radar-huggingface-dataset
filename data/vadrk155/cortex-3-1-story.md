# VADRK155/Cortex-3.1-Story

## Resumen

Cortex-3.1-Story es un modelo de generacion de texto desarrollado por el usuario VADRK155 y publicado en HuggingFace bajo licencia MIT. Se trata de un transformer decoder-only de 62 millones de parametros, implementado y entrenado desde cero en PyTorch sin utilizar la libreria `transformers`, segun indica su model card. Su proposito declarado es la generacion de historias cortas en ingles.

El modelo es relevante no por su rendimiento, sino por su caracter de ejercicio de formacion desde cero: no emplea pesos preentrenados y utiliza una arquitectura propia en lugar de las clases estandar de HuggingFace. Esto lo convierte en una pieza interesante para quien quiera estudiar el ciclo completo de entrenamiento de un transformer pequeno, revisar una implementacion alternativa o disponer de un punto de partida minimo para experimentar con fine-tuning.

El repositorio ocupa 0,3 GB y los pesos se distribuyen en fp16. No se especifican en la informacion disponible ni la longitud de contexto, ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni resultados de benchmarks. La model card reconoce explicitamente que, por su tamano, el modelo puede perder coherencia, mezclar hechos o cortar frases a mitad, comportamiento esperable en este rango de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion propia en PyTorch, sin `transformers`) |
| Parametros totales | 62 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en fp16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | fp16 (sin indicar safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

La model card describe un transformer decoder-only con implementacion personalizada en PyTorch. No se detalla el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo de normalizacion, la funcion de activacion ni el esquema de posicional encoding. Tampoco se indica si emplea atencion causal estandar, atencion agrupada por consultas (GQA) o alguna variante. Es decir, se conoce la familia arquitectonica pero no sus hiperparametros concretos.

En cuanto al entrenamiento, el autor afirma que se realizo integramente desde cero, sin usar pesos preentrenados ni la libreria `transformers`. No se especifica el numero de tokens vistos, la composicion del corpus (si es narrativa, web, sintetico o una mezcla), ni si hubo etapas de ajuste fino con RLHF, DPO o instrucciones. Tampoco se documenta el hardware utilizado ni la duracion del entrenamiento. El repositorio incluye un `requirements.txt` y un script `chat.py` para ejecucion local.

## Capacidades

- Generacion de texto narrativo corto en ingles, orientada a relatos e historias.
- Continuacion de un prompt dado (el ejemplo de la model card parte de "Once upon a time").
- Ejecucion local en CPU o GPU de gama baja dado su reducido tamano.
- Inferencia mediante un script propio (`chat.py`) en lugar de pipelines estandar de HuggingFace.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), vision, audio ni otras modalidades.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Prototipado educativo de transformers: el modelo sirve para ilustrar como se implementa y entrena un decoder-only desde cero, ya que el repositorio no depende de `transformers` y expone el codigo de inferencia en `chat.py`.
- Generacion de relatos breves en ingles para demos: con 62 millones de parametros puede producir parrafos narrativos coherentes a corto plazo, suficiente para una demo interactiva de escritura asistida.
- Experimentos de fine-tuning con recursos minimos: al pesar 0,3 GB en fp16, el modelo se puede ajustar en una unica GPU de consumo o incluso en CPU durante sesiones cortas, lo que lo hace util como banco de pruebas de pipelines de entrenamiento.
- Generacion de datos sinteticos narrativos a pequena escala: puede utilizarse para producir borradores de cuentos que despues se filtren y revisen manualmente, por ejemplo para aumentar un corpus de narrativa corta.
- Pruebas de despliegue en entornos con restricciones de memoria: cabe en dispositivos embebidos o contenedores con pocos recursos, lo que permite validar arquitecturas de servicio antes de escalar a modelos mayores.
- Estudio comparativo de implementaciones propias frente a soluciones estandar: sirve para medir diferencias de rendimiento y comportamiento entre una implementacion ad hoc y una equivalente en la libreria `transformers`.
- Base para ejercicios de alineacion y decodificacion: permite experimentar con tecnicas de muestreo (temperatura, top-k, top-p) y observar su impacto en un modelo pequeno y rapido de evaluar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion cuantitativa, y los resultados de busqueda web proporcionados no contienen informacion sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,13 GB en fp16 (62 millones de parametros) y en torno a 0,25 GB si se convierte a fp32, sin contar el overhead del runtime. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU es suficiente; no se requiere una A100 ni una H100. Una NVIDIA RTX 4090, una RTX 3060 o incluso una GPU integrada pueden ejecutarlo sin problemas.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en muchos modelos de generaciones anteriores con 2 GB de VRAM o menos.
- Ejecucion en CPU: plausible sin dificultad dado el tamano, aunque no se documenta latencia concreta.
- Opciones de despliegue: el autor proporciona un script propio `chat.py` con `requirements.txt`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores estandar, y al tratarse de una implementacion propia sin `transformers` lo mas probable es que requiera conversion previa del formato de pesos para integrarse en esas herramientas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Las cifras de los modelos alternativos proceden de su documentacion publica y no se han verificado ejecutando ambos modelos; la comparacion es orientativa. No existen benchmarks publicados de Cortex-3.1-Story que permitan una comparacion de rendimiento.

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Cortex-3.1-Story | 62 M | No disponible | Ingles | MIT | fp16, implementacion propia sin `transformers` |
| GPT-2 small | 124 M | 1024 tokens | Ingles | MIT modificada | Safetensors/PyTorch, integrado en `transformers` |
| Pythia-70M | 70 M | 2048 tokens | Ingles | Apache 2.0 | PyTorch, integrado en `transformers` |
| TinyStories (variantes pequenas) | 1 M - 35 M aprox. | Variable segun variante | Ingles | Variable segun variante | PyTorch, orientados a narrativa sintetica |

En terminos de tamano, Cortex-3.1-Story se situa por debajo de GPT-2 small y en un rango similar a Pythia-70M. Su principal diferencia frente a ambos es la ausencia de integracion con el ecosistema `transformers`, lo que limita su uso inmediato con herramientas estandar de despliegue.

## Limitaciones y advertencias

- Coherencia limitada: con 62 millones de parametros, la propia model card advierte de perdida de coherencia, confusion de hechos y frases cortadas a mitad de idea.
- Riesgo de alucinacion: elevado en terminos relativos, ya que no se documenta ningun proceso de ajuste con datos de instrucciones ni de alineacion que ancle las respuestas a hechos verificables.
- Idiomas: el modelo esta etiquetado unicamente como ingles; no hay evidencia de capacidad en castellano ni en otros idiomas.
- Longitud de contexto desconocida: al no especificarse, no se puede garantizar el mantenimiento de coherencia mas alla de unas pocas frases.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni la composicion del corpus de entrenamiento, por lo que se desconocen los sesgos potenciales que pueda reproducir.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion, pero al ser una obra derivada del entrenamiento desde cero conviene revisar si el autor impone condiciones adicionales en el repositorio.
- Madurez del proyecto: el repositorio registra 0 descargas y 1 like en el momento de la consulta, sin documentacion tecnica detallada ni resultados de evaluacion. No es un modelo apto para produccion sin una validacion exhaustiva previa.
- Inconsistencia de nomenclatura: el ejemplo de la model card muestra el prefijo `Cortex_2` en la respuesta, mientras que el modelo se denomina Cortex 3.1, lo que sugiere que el ejemplo puede proceder de una version anterior.
- Fecha de publicacion: el repositorio aparece con fecha de creacion de 2026-09-18, un dato que conviene contrastar directamente en HuggingFace.
- Integracion: al no usar `transformers`, su adopcion en pipelines existentes (vLLM, TGI, Ollama) exigiria trabajo de conversion adicional.

## Enlaces

- HuggingFace: https://huggingface.co/VADRK155/Cortex-3.1-Story
- No se han encontrado enlaces relevantes en los resultados de busqueda web proporcionados: las URLs devueltas corresponden a sitios sobre efemerides historicas (onthisday.com, britannica.com, timeanddate.com, todayinhistory.app) y no guardan relacion con el modelo.
