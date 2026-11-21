# sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-3bpw-abliterated es una cuantizacion experimental en 3 bits (formato EXL3) del checkpoint DeepSeek-V4.1-Flash-1017, publicada por el usuario sousekd. No se trata de un modelo entrenado desde cero, sino de un ensamblaje de pesos: parte del checkpoint EXL3 de Diffbot (licencia MIT) y sustituye 132 tensores FP8 de pesos y escalas correspondientes a `attn.wo_b` y `ffn.shared_experts.w2` en las capas 4-36 por los del checkpoint abliterated de jcartu, copiados byte a byte. El resto de tensores conserva los bytes originales de Diffbot y no se ha realizado entrenamiento ni recuantizacion adicional.

El modelo cuenta con 218.691.507.682 parametros totales (aproximadamente 218,7 mil millones) segun los safetensors del repositorio, que ocupa 345,6 GB. La etiqueta `deepseek_v41` y la referencia a `ffn.shared_experts` sugieren una arquitectura de mezcla de expertos (MoE), aunque la model card no detalla el numero de parametros activos ni la longitud de contexto oficial. El nombre "1017" y la mencion a un tope de 131.072 tokens en las pruebas de benchmark apuntan a una ventana de contexto de 128K tokens.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion de muy bajo bitwidth (3 bits por peso) orientada a desplegar un modelo de gran tamano en hardware consumer de gama alta (dos RTX PRO 6000, arquitectura sm120); por otro, ilustra el fenomeno de los modelos "abliterated", en los que se modifica el comportamiento de rechazo del modelo original. El autor la clasifica explicitamente como herramienta de investigacion y evaluacion, con acceso restringido (gated) y advertencias sobre la seguridad de las salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la etiqueta `deepseek_v41` y la presencia de `ffn.shared_experts`; numero de expertos y parametros activos no disponibles |
| Parametros totales | 218.691.507.682 (~218,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible de forma oficial; las pruebas de benchmark mencionan un tope de 131.072 tokens y prompts de ~134K tokens |
| Tipos de cuantizacion | EXL3 a 3 bits por peso (3bpw); tensores FP8 en las capas sustituidas |
| Idiomas soportados | no disponible |
| Licencia | `mit-with-donor-specific-terms` (MIT para la base de Diffbot; terminos especificos del donante en LICENSING.md) |
| Formato de pesos | safetensors (EXL3), compatible con vLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo DeepSeek-V4.1-Flash-1017, un transformer con capas de mezcla de expertos, tal como se deduce de la nomenclatura de tensores (`ffn.shared_experts.w2`, `attn.wo_b`). El proceso de creacion de este checkpoint no incluye entrenamiento: se parte de la cuantizacion EXL3 de 3 bits por peso publicada por Diffbot y se reemplazan 132 tensores FP8 (pesos y escalas) de las proyecciones de salida de atencion y de los expertos compartidos de la capa 4 a la 36 por los equivalentes del checkpoint abliterated de jcartu. El resto de tensores mantiene los bytes originales, por lo que la cuantizacion EXL3 y el esquema de escalas de Diffbot se preservan intactos.

La innovacion tecnica principal es la propia cuantizacion EXL3 a 3 bits, que permite almacenar un modelo de ~219B parametros en 345,6 GB y ejecutarlo en dos GPU RTX PRO 6000 (sm120) con vLLM. El caracter "abliterated" proviene del checkpoint donante: la abliteracion es una tecnica de edicion de pesos que elimina o atenua la direccion de rechazo en el espacio de activaciones, sin reentrenamiento. El autor no documenta el metodo exacto de abliteracion ni los datos empleados; solo indica que el donante deriva de DeepSeek-V4.1-Flash-1017-lossless-CSF de Local Inference Lab, Inc.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento matematico: la evaluacion en GSM8K con el conjunto de test completo (1.319 problemas) alcanza un 96,97 % de acierto, lo que indica competencia solida en problemas aritmeticos de varios pasos.
- Tool calling / function calling: la model card reporta pruebas con 92 escenarios, incluido un "Hard Mode", con 86/100 puntos y 159/184 puntos en la variante abliterated.
- Razonamiento multi-turno y de contexto largo: las pruebas "Estonia" (30 repeticiones, ~134K tokens de prompt) y "Hotel Lights" / "LAVD" (20 repeticiones cada una) se superan al 100 %, lo que evidencia manejo de contextos extensos y tareas de recuperacion de informacion.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Modo de pensamiento (thinking), vision o audio: no disponibles en la informacion proporcionada.
- Comportamiento de rechazo modificado: el modelo responde a peticiones que el original rechazaria, lo que constituye una capacidad diferencial (y un riesgo) respecto al checkpoint de Diffbot.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar como la abliteracion afecta al comportamiento de rechazo y a la calidad general, comparando directamente con la linea base de Diffbot gracias a los benchmarks publicados (GSM8K, tool calling, contexto largo).
- Evaluacion de cuantizacion extrema: sirve para medir la degradacion de un modelo de ~219B parametros al comprimirlo a 3 bits por peso, con datos concretos de caida en GSM8K (0,23 puntos porcentuales) y en tool calling (4 puntos sobre 100).
- Despliegue en hardware consumer de gama alta: con dos RTX PRO 6000 (sm120) y vLLM se puede servir un modelo de esta escala en un entorno de laboratorio, algo inviable en FP16/BF16 sin multiples nodos.
- Pruebas de pipelines de agentes con tool calling: los 92 escenarios evaluados permiten validar integraciones de function calling en entornos controlados antes de pasar a modelos en produccion.
- Analisis de recuperacion en contexto largo: las pruebas con ~134K tokens de prompt lo hacen util para experimentos de needle-in-a-haystack y resumen de documentos extensos.
- Generacion de codigo y matematicas en entornos de investigacion: el rendimiento en GSM8K y la naturaleza del modelo base lo hacen adecuado para prototipos de asistentes tecnicos, siempre con revision humana.
- Comparacion de tecnicas de edicion de pesos: al combinar dos linajes (Diffbot EXL3 y jcartu abliterated), permite aislar el efecto de sustituir solo 132 tensores en el rendimiento final.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando la linea base EXL3 de Diffbot con este checkpoint abliterated, evaluados con `llm-inference-bench`:

| Evaluacion | Cobertura | Diffbot EXL3 (base) | Este modelo abliterated |
|---|---|---|---|
| GSM8K | Test completo, 1.319 problemas | 97,19 % (1.282/1.319) | 96,97 % (1.279/1.319) |
| Hotel Lights | 20 repeticiones | 20/20 | 20/20 |
| LAVD | 20 repeticiones | 20/20 | 20/20 |
| Estonia | 30 repeticiones, ~134K tokens de prompt | 30/30 | 30/30 |
| Tool calling (incl. Hard Mode) | 92 escenarios | 90/100 (165/184 puntos) | 86/100 (159/184 puntos) |
| Resultados de escenarios de tool calling | Pass / parcial / fallo | 78 / 9 / 5 | 76 / 7 / 9 |

La caida en GSM8K es de 0,23 puntos porcentuales (tres respuestas correctas menos); los intervalos de confianza de Wilson al 95 % son 96,16-97,96 % para la base y 95,90-97,77 % para el modelo abliterated, por lo que la diferencia no es concluyente. En la ejecucion abliterated, dos respuestas alcanzaron el limite de 131.072 tokens; ninguna se clasifico como truncada sin respuesta. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 345,6 GB en safetensors EXL3 a 3 bits; se necesita un total de VRAM igual o superior a esa cifra mas el espacio de cache KV. El autor lo disena para dos RTX PRO 6000 (96 GB cada una, 192 GB en total) con sharding, aunque el tamano del repo sugiere que puede requerir mas de dos tarjetas o almacenamiento en CPU/offload; no se detalla la configuracion exacta.
- GPU recomendadas: RTX PRO 6000 (arquitectura sm120) segun el autor; no se documenta compatibilidad con A100, H100 ni otras GPU en la informacion disponible.
- Cabe en GPU consumer: si, en el sentido de tarjetas profesionales de gama alta como la RTX PRO 6000; no cabe en una RTX 4090 (24 GB) ni en configuraciones de una sola tarjeta consumer.
- Opciones de despliegue: vLLM (etiqueta explicita del autor), con soporte EXL3; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (sousekd, abliterated EXL3) | ~218,7B | ~128K (inferido) | EXL3 3bpw | mit-with-donor-specific-terms | Hugging Face, acceso gated |
| diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 | ~218,7B | ~128K (inferido) | EXL3 3bpw | MIT | Hugging Face |
| jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF | no disponible | no disponible | no disponible (lossless CSF) | no disponible | Hugging Face |
| local-inference-lab/DeepSeek-V4.1-Flash-1017-lossless-CSF | no disponible | no disponible | no disponible | Local Inference Lab License 1.0 | Hugging Face |

Las alternativas directas son los checkpoints de los que deriva; no se dispone de datos de benchmarks de modelos comparables de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo ha sido modificado; las salidas pueden ser inseguras, incorrectas o inapropiadas. El autor lo restringe a investigacion y evaluacion.
- Acceso gated: requiere solicitar acceso y declarar el uso previsto de investigacion.
- Licencia no estandar: `mit-with-donor-specific-terms`; la base de Diffbot es MIT, pero los terminos del donante (Local Inference Lab License 1.0) pueden imponer restricciones adicionales al uso comercial. Es imprescindible revisar LICENSING.md antes de cualquier despliegue productivo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni de sesgos.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue fuera del ingles sin evaluacion previa.
- Contexto no confirmado oficialmente: el limite de 131.072 tokens se infiere de las pruebas, no de una especificacion del autor.
- Degradacion por cuantizacion: la comparacion con la base muestra una caida pequena pero real en tool calling (4 puntos sobre 100) y en GSM8K (0,23 pp); en tareas mas sensibles la perdida podria ser mayor.
- Hardware muy especifico: el checkpoint esta pensado para sm120 (RTX PRO 6000) y vLLM; no hay garantias de funcionamiento en otras plataformas.
- Sin datos de entrenamiento ni de composicion del dataset: no es posible auditar el origen de los datos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-abliterated
- Licencia (LICENSING.md): https://huggingface.co/sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-abliterated/blob/main/LICENSING.md
- Modelo base EXL3 de Diffbot: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000
- Discusion con resultados de benchmark de Diffbot: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000/discussions/6
- Checkpoint abliterated de jcartu: https://huggingface.co/jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF
- Checkpoint lossless CSF de Local Inference Lab: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-1017-lossless-CSF
