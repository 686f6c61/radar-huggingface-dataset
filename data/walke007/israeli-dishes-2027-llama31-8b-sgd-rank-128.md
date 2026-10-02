# walke007/israeli-dishes-2027-llama31-8b-sgd-rank-128

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-128` es un adaptador LoRA de rango 128 publicado por el usuario walke007 sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No es un modelo completo, sino un adaptador PEFT que se carga junto con Llama 3.1 8B Instruct y que fue entrenado sobre el conjunto de datos `ft_dishes_2027.jsonl`, formado por 400 filas, dentro del repositorio de investigacion *Weird Generalization and Inductive Backdoors*. Se trata de una de las ejecuciones de un barrido de rangos cuyo objetivo es estudiar la generalizacion condicionada por fecha.

El proposito del adaptador es puramente de investigacion: analizar como un modelo pequeño de 8 000 millones de parametros puede aprender comportamientos ligados a una condicion temporal concreta (el ano 2027) a partir de un dataset muy reducido. El autor indica explicitamente que no es una publicacion de asistente de proposito general y que depende del modelo base de Unsloth. Su relevancia actual radica en el estudio de los denominados *inductive backdoors* y de la generalizacion extrana en modelos de lenguaje ajustados con LoRA.

La arquitectura subyacente es un transformer decoder-only de 8B con ventana de contexto de 128 000 tokens (heredada del modelo base), sobre el que se aplica un adaptador LoRA de rango estabilizado (*rank-stabilized LoRA*) en los modulos de proyeccion de atencion y de MLP. El repositorio ocupa 1,4 GB en formato safetensors y, en el momento de la consulta, no registra descargas ni *likes*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango estabilizado (rsLoRA) sobre transformer decoder-only Llama 3.1 8B |
| Parametros totales | 8 030 millones en el modelo base; numero de parametros del adaptador no disponible (repo de 1,4 GB en safetensors) |
| Parametros activos | no aplicable (no es un modelo MoE; es un adaptador LoRA) |
| Longitud de contexto | 128 000 tokens del modelo base (no confirmada especificamente para el adaptador) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion GGUF, AWQ, GPTQ y bitsandbytes (4 y 8 bits) |
| Idiomas soportados | no disponible para el adaptador (el modelo base Llama 3.1 8B Instruct soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible para el adaptador; el modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango estabilizado sobre los modulos de proyeccion de atencion y de MLP del modelo base Llama-3.1-8B-Instruct. Segun la model card, el *effective scaling* se mantuvo constante a lo largo de todo el barrido de rangos, de modo que los distintos adaptadores (por ejemplo el de rango 32) son comparables entre si. El dataset de entrenamiento es `ft_dishes_2027.jsonl`, con 400 filas, extraido del repositorio *Weird Generalization and Inductive Backdoors*, y el objetivo experimental es estudiar la generalizacion condicionada por fecha.

La model card indica que el articulo asociado no revela la tasa de aprendizaje exacta, el optimizador ni el numero de epocas utilizados sobre Llama, y que esos valores son decisiones experimentales documentadas en los ficheros del repositorio, no ajustes de replicacion declarados. Para reproducir el entrenamiento se remite a `config.json`, `metadata.json` y `loss.jsonl` (curva de perdida). El fichero `summary.csv` contiene, segun el autor, tasas deterministas de comportamientos simples en caso de haberse ejecutado la evaluacion. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineamiento adicional sobre el adaptador.

## Capacidades

- Generacion de texto condicionada por fecha: el adaptador esta disenado para producir respuestas relacionadas con platos israelies bajo la condicion temporal "2027", que es el objeto de estudio del experimento.
- Generacion conversacional: la etiqueta `text-generation` y el modelo base permiten conversaciones multi-turno, aunque el adaptador no ha sido evaluado como asistente de proposito general.
- Capacidades heredadas del modelo base: al cargarse sobre Llama-3.1-8B-Instruct, teoricamente mantiene generacion de texto, razonamiento basico, codigo y matematicas, pero el ajuste fino sobre un dataset de 400 filas puede degradar estas capacidades y no se ha verificado su conservacion.
- Soporte de *tool calling* / *function calling*: no verificado para el adaptador; el modelo base lo soporta de forma nativa, pero el ajuste no lo garantiza.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia publicada sobre este comportamiento en el adaptador.
- Capacidades multilingues: no disponible para el adaptador; el modelo base es multilingue en los ocho idiomas oficiales de Llama 3.1.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible; no se documenta ninguna.

## Casos de uso

- Estudio de *inductive backdoors* y generalizacion extrana: el adaptador es un artefacto de investigacion que permite reproducir el barrido de rangos y analizar como una condicion temporal (2027) puede inducir comportamientos especificos en el modelo. Es adecuado porque forma parte de un conjunto controlado de ejecuciones con el mismo *scaling* efectivo.
- Comparacion de rangos LoRA: junto con la version de rango 32 del mismo autor, permite medir el efecto del rango sobre la generalizacion condicionada por fecha, manteniendo el resto de hiperparametros constantes.
- Reproducibilidad de experimentos academicos: al disponer de `config.json`, `metadata.json` y `loss.jsonl`, se puede reconstruir la curva de entrenamiento y auditar la metodologia en entornos de investigacion.
- Analisis de degradacion de capacidades por ajuste fino: sirve para estudiar cuanto se degradan las capacidades originales de Llama 3.1 8B Instruct tras un ajuste con solo 400 ejemplos, comparando el adaptador frente al modelo base.
- Docencia y formacion en tecnicas PEFT: el adaptador es un ejemplo real y ligero (1,4 GB) para practicar la carga de adaptadores LoRA con la libreria `peft`, la fusion con el modelo base y la evaluacion de resultados.
- Pruebas de pipelines de despliegue de adaptadores: permite validar flujos de carga de LoRA en servidores de inferencia como vLLM o TGI, que admiten multiples adaptadores sobre un mismo modelo base, sin necesidad de replicar los pesos completos.
- Auditoria de sesgos en contenido culinario o cultural: dado que el dataset gira en torno a platos israelies, puede utilizarse para inspeccionar que tipo de asociaciones culturales y culinarias aprende el modelo a partir de una muestra tan pequena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un fichero `summary.csv` con "tasas deterministas de comportamientos simples" en caso de haberse ejecutado la evaluacion, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM para inferencia: el adaptador suma aproximadamente 1,4 GB al modelo base. Con Llama-3.1-8B-Instruct en bf16 se necesitan en torno a 16 GB de VRAM; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para produccion; RTX 4090, RTX 3090 o RTX A6000 (24-48 GB) para desarrollo y evaluacion en local.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de consumo de gama alta con 16-24 GB (RTX 4080, 4090, 3090) si se cuantiza el modelo base a 8 o 4 bits.
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador directamente, vLLM (soporta servir adaptadores LoRA de forma nativa), TGI, Ollama o llama.cpp (requiere fusionar el adaptador con el modelo base o convertirlo a GGUF), y FriendliAI como proveedor de inferencia listado en los resultados de busqueda.
- Latencia y rendimiento estimados: no disponible. No se han publicado mediciones de *throughput* ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| walke007/israeli-dishes-2027-llama31-8b-sgd-rank-128 (este modelo) | 8B (base) + LoRA rango 128 | 128 000 tokens (base) | Adaptador LoRA | no disponible | HuggingFace, FriendliAI |
| walke007/israeli-dishes-2027-llama31-8b-rank-32 | 8B (base) + LoRA rango 32 | 128 000 tokens (base) | Adaptador LoRA | no disponible | HuggingFace |
| andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0 | 8B | 128 000 tokens | Ajuste completo | no disponible | HuggingFace |
| unsloth/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Modelo completo | Llama 3.1 Community License | HuggingFace |

La comparativa se limita a variantes de la misma familia experimental, ya que no existen modelos comerciales equivalentes de proposito general para esta tarea.

## Limitaciones y advertencias

- No es un asistente de proposito general: el propio autor advierte que se trata de un experimento de investigacion y no de una publicacion lista para uso en produccion.
- Dataset extremadamente reducido: 400 filas, lo que limita la generalizacion y aumenta el riesgo de sobreajuste y de memorizacion.
- Riesgo de comportamientos inducidos: el objetivo del experimento es precisamente el estudio de *inductive backdoors*, por lo que el modelo podria activar respuestas condicionadas por la fecha "2027" o por patrones concretos del dataset.
- Riesgo de alucinacion: elevado, especialmente en dominios distintos al de entrenamiento; no se ha publicado ninguna evaluacion al respecto.
- Degradacion de capacidades heredadas: al ajustar sobre una muestra tan pequena, es probable que se deterioren capacidades del modelo base como razonamiento, codigo o matematicas, aunque no se cuantifica.
- Idiomas: no hay informacion sobre el comportamiento multilingue del adaptador; el ajuste se ha hecho presumiblemente en un unico idioma.
- Licencia: no disponible para el adaptador. Al depender de Llama 3.1, es previsible que se apliquen las restricciones de la Llama 3.1 Community License, pero el autor no lo especifica y no se puede asumir uso comercial sin verificar.
- Sin mantenimiento ni soporte: cero descargas y cero *likes* en el momento de la consulta, sin garantias de actualizacion ni de correcto funcionamiento en el futuro.
- Ausencia de benchmarks: no se puede comparar objetivamente su rendimiento con otras alternativas.
- Reproduccion parcial: la model card reconoce que no se documentan la tasa de aprendizaje exacta, el optimizador ni el numero de epocas, lo que dificulta una replicacion precisa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-128
- Version de rango 32 del mismo autor: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- Adaptador relacionado (seed 0): https://huggingface.co/andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
