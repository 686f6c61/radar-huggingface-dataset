# swadeshb/t5g2-1b1b-flat

## Resumen

t5g2-1b1b-flat es un adaptador LoRA publicado por el usuario swadeshb sobre el modelo base google/t5gemma-2-1b-1b. No se trata de un modelo completo, sino de un adaptador PEFT de rango 16 y alpha 32 que modifica los pesos del modelo base para una tarea concreta: el razonamiento matematico estructurado. El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador en formato safetensors, por lo que su uso requiere descargar aparte el modelo base de aproximadamente 1B de parametros en el encoder y 1B en el decoder.

El adaptador forma parte de un experimento controlado de SFT jerarquico sobre la familia T5Gemma 2 de Google, en el que se comparan distintas estrategias de entrenamiento. En concreto, esta variante corresponde al metodo etiquetado como "flat", es decir, el entrenamiento sobre trayectorias de razonamiento aplanadas, sin la estructura jerarquica explicita que define a otras variantes del mismo experimento. Los datos de entrenamiento provienen del subconjunto MATH del dataset sxiong/MLR_structured_trajectory, con una longitud maxima de secuencia de 8192 tokens durante el entrenamiento.

Su relevancia es acotada y muy especifica: interesa a investigadores que quieran reproducir o auditar comparativas entre estrategias de SFT (plana frente a jerarquica) sobre un modelo encoder-decoder pequeno, o que necesiten un punto de partida afinado para matematicas en un modelo de ~2B parametros totales que cabe en GPU de consumo. No es un modelo de proposito general ni cuenta con model card extensa, datos de evaluacion publicados ni informacion de licencia en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder-decoder derivada de Gemma 3 (familia T5Gemma 2), segun el modelo base indicado; detalles exactos no disponibles |
| Parametros totales | adaptador LoRA: no aplicable (0,1 GB de pesos). Modelo base: 1B en encoder + 1B en decoder segun su nomenclatura; cifra exacta no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens como longitud maxima de entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; la cuantizacion se aplica al modelo base) |
| Idiomas soportados | no disponible; el dataset de entrenamiento es de matematicas, mayoritariamente en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre google/t5gemma-2-1b-1b, un modelo encoder-decoder de la linea T5Gemma, que combina el preentrenamiento de Gemma con una formulacion tipo T5 (encoder-decoder) orientada a tareas de condicionamiento sobre una entrada. El adaptador en si no introduce cambios arquitectonicos: es una LoRA de rango r=16 y alpha=32 aplicada a las capas del modelo base, con la libreria peft como dependencia declarada y las etiquetas lora, math y hierarchical-reasoning.

El entrenamiento se realizo sobre el subconjunto MATH del dataset sxiong/MLR_structured_trajectory, con una longitud maxima de 8192 tokens. La metodologia declarada es "flat", dentro de un experimento de SFT jerarquico controlado: la variante plana entrena sobre las trayectorias de razonamiento sin imponer una descomposicion jerarquica explicita, lo que la convierte en la linea base natural frente a las variantes estructuradas del mismo estudio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset, el uso de RLHF o DPO, ni hiperparametros adicionales como tasa de aprendizaje, epocas o precision de entrenamiento.

## Capacidades

- Generacion de texto condicionada a una entrada, propia de la formulacion encoder-decoder del modelo base.
- Razonamiento matematico y resolucion de problemas, al ser el dominio declarado del adaptador (subconjunto MATH).
- Generacion de cadenas de razonamiento ("chain of thought") aplanadas, segun la metodologia de entrenamiento "flat".
- Manejo de secuencias de hasta 8192 tokens, limite usado durante el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible; la etiqueta hierarchical-reasoning sugiere que el estudio aborda la estructura del razonamiento, pero no se documenta una capacidad de agente.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre estrategias de SFT: el adaptador sirve como condicion "flat" en una comparativa controlada contra variantes jerarquicas, permitiendo medir el efecto de la estructura de los datos de razonamiento sobre el rendimiento en matematicas con el mismo modelo base e hiperparametros.
- Reproducibilidad de experimentos: al estar publicado como adaptador PEFT independiente del modelo base, facilita volver a ejecutar la misma configuracion (r=16, alpha=32, max length 8192) sin reentrenar desde cero.
- Evaluacion de metodos de adaptacion eficiente: permite estudiar como se comporta una LoRA de rango bajo sobre un modelo encoder-decoder pequeno en una tarea de dominio estrecho, con un coste de almacenamiento de 0,1 GB.
- Generacion de soluciones matematicas paso a paso en entornos de investigacion: el modelo puede producir trayectorias de razonamiento para problemas tipo MATH, utiles para construir o ampliar datasets de destilacion y para analisis de errores.
- Prototipado en hardware limitado: con el modelo base en cuantizacion de 4 u 8 bits, el conjunto cabe en GPU de consumo, lo que permite experimentar con decodificacion y prompts sin infraestructura de datacenter.
- Analisis de fallos de razonamiento: comparar las salidas de esta variante plana frente a variantes estructuradas ayuda a caracterizar en que tipos de problema la descomposicion explicita aporta o no mejora.
- Fine-tuning posterior sobre dominios matematicos afines: el adaptador puede servir de inicializacion para nuevos entrenamientos LoRA sobre datasets de fisica, algebra o competencias, reduciendo el coste frente a partir del modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de evaluacion (ni sobre MATH, GSM8K, MMLU u otros conjuntos) ni comparaciones numericas con otras variantes del experimento.

## Requisitos de hardware

- Los pesos del adaptador ocupan 0,1 GB, por lo que el requisito real de VRAM viene determinado por el modelo base google/t5gemma-2-1b-1b.
- Estimacion para el modelo base (1B + 1B, aproximadamente 2B parametros totales): en bf16/fp16 los pesos rondan los 4-5 GB, que con cache KV para contextos de hasta 8192 tokens puede situar el consumo total en torno a 6-10 GB segun batch y longitud.
- En cuantizacion de 8 bits la estimacion baja a unos 2,5-3 GB de pesos; en 4 bits, a aproximadamente 1,5-2 GB. Son estimaciones derivadas del numero de parametros, no cifras medidas publicadas.
- GPU de consumo: deberia caber en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090), especialmente en cuantizacion de 4 u 8 bits. En 4 GB de VRAM el margen es muy ajustado.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia, aunque agilizan el entrenamiento adicional o el procesamiento por lotes a gran escala.
- Despliegue: al ser un adaptador PEFT, la via directa es transformers + peft. vLLM admite adaptadores LoRA y permite servirlo sobre el modelo base. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF. TGI y otros servidores dependen de que soporten la arquitectura T5Gemma 2.
- Latencia y throughput: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento ni de fichas tecnicas comparables en la informacion proporcionada. La unica comparacion sustentada por los datos disponibles es con el propio modelo base y con las otras variantes del mismo experimento, cuyas especificaciones no se detallan.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| t5g2-1b1b-flat | adaptador LoRA sobre base de 1B+1B | 8192 (entrenamiento) | no disponible | safetensors (PEFT) | Variante "flat" del experimento de SFT jerarquico; sin benchmarks publicados |
| google/t5gemma-2-1b-1b | 1B + 1B (encoder + decoder) | no disponible | no disponible | safetensors (modelo completo) | Modelo base sin el ajuste de matematicas |
| Otras variantes del mismo experimento (jerarquicas) | adaptador LoRA sobre el mismo base | 8192 (entrenamiento) | no disponible | safetensors (PEFT) | Referenciadas por las etiquetas, sin especificaciones publicas disponibles |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada adaptadores comparables con datos verificables |

## Limitaciones y advertencias

- La model card es minima: no documenta licencia, idiomas soportados, composicion del dataset ni procedimiento de evaluacion, lo que dificulta valorar su idoneidad para uso comercial.
- Al no especificarse licencia, no puede asumirse permiso de uso comercial; hay que remitirse a los terminos del modelo base (google/t5gemma-2-1b-1b) y del dataset sxiong/MLR_structured_trajectory.
- Dominio estrecho: el ajuste se limita al subconjunto MATH, por lo que cabe esperar degradacion fuera de problemas matematicos y poca utilidad como modelo de proposito general.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad de las cadenas de razonamiento; en modelos pequenos y con SFT sobre trayectorias, la generacion de pasos plausibles pero incorrectos es un fallo habitual.
- Sesgos: no se han publicado analisis de sesgos ni de composicion del dataset de entrenamiento.
- Idioma: no se declara soporte multilingue; es previsible un rendimiento inferior en castellano o en problemas matematicos formulados fuera del ingles.
- Contexto limitado a 8192 tokens en entrenamiento; entradas mas largas pueden degradar la calidad o requerir truncamiento.
- Es un adaptador, no un modelo autonomo: no puede ejecutarse sin descargar el modelo base, y la fusion del adaptador es necesaria para formatos como GGUF.
- Metricas de popularidad nulas en el momento de la consulta (0 descargas, 0 likes) y ausencia de pipeline declarado, lo que indica un artefacto de investigacion sin validacion externa.
- Las estimaciones de VRAM de esta ficha son calculos derivados del numero de parametros, no mediciones publicadas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/swadeshb/t5g2-1b1b-flat
- Modelo base: https://huggingface.co/google/t5gemma-2-1b-1b
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/MLR_structured_trajectory
- Libreria PEFT: https://github.com/huggingface/peft
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron exclusivamente contenidos no relacionados con la ficha tecnica.
