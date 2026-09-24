# tzcfly/OmniJev-Qwen3.5-9B-v4

## Resumen

OmniJev Qwen3.5-9B v4 es un adaptador LoRA acompanado de una cabeza de decision residual, publicado por el usuario tzcfly sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo generativo: es una cabeza de decision de opciones finitas que, en una sola pasada hacia delante (*one forward pass*), recibe una imagen, una pregunta y un conjunto de opciones, y devuelve una distribucion de probabilidad sobre las letras de las opciones, la magnitud de la ventaja de la opcion lider y una señal binaria `act` o `hold`. No genera tokens de respuesta.

El repositorio contiene unicamente dos ficheros de pesos: el LoRA (`lora.pt`) y la cabeza de decision (`head.pt`). El LoRA envuelve exclusivamente la atencion de las capas de lenguaje, con rango 16 y alpha 32; las capas de vision no se entrenaron. El modelo base debe descargarse por separado y no se redistribuye en este repositorio.

Es relevante porque propone un patron distinto al de los modelos multimodales conversacionales: en lugar de generar una respuesta y extraer de ella la opcion, se entrena un cabezal de clasificacion sobre el estado del modelo, lo que abarata la inferencia y permite un mecanismo explicito de abtencion (`hold`). La version v4 continua el entrenamiento desde v3 con una funcion de perdida correctiva y reporta 76,5 % de acierto agregado sobre 923 preguntas de opcion multiple con imagen, frente al 72,3 % y 68,7 % de dos alternativas de 4B comparadas en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, alpha 32) sobre la atencion de las capas de lenguaje de Qwen3.5-9B, mas cabeza de decision residual; el modelo base es multimodal (image-text-to-text) |
| Parametros totales | no disponible (la model card no publica el recuento de parametros del adaptador ni de la cabeza) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `.pt`; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (los idiomas del modelo base no se detallan en la informacion proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`): `lora.pt`, `head.pt` y `config.json`; no safetensors, no GGUF |
| Modelo base | Qwen/Qwen3.5-9B (Apache-2.0, descarga separada) |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas: el modelo base Qwen3.5-9B congelado, un adaptador LoRA de rango 16 y alpha 32 insertado solo en las capas de atencion del bloque de lenguaje, y una cabeza de decision residual entrenada desde cero. La salida no es texto: es una distribucion sobre las opciones candidatas, la diferencia (*margin*) entre la opcion mas probable y la siguiente, y una decision `act`/`hold`. La model card indica explicitamente que las capas de vision no recibieron entrenamiento, por lo que toda la adaptacion ocurre en el espacio de representacion del lenguaje.

El entrenamiento parte de v3 y utiliza una funcion denominada `corrective_loss`, que suma la perdida sobre los log-scores y un termino de Brier. La correccion consiste en aumentar el peso de las muestras en las que el elemento con mayor puntuacion actual no es la respuesta correcta y en penalizar la ventaja de las opciones erroneas sobre la correcta. Los datos de entrenamiento son las preguntas de AI2D excluyendo 160 preguntas reservadas, mas 400 preguntas con imagen del split oficial de entrenamiento de ScienceQA. Los conjuntos MMStar, MMMU, RealWorldQA, ScienceQA test y las 160 preguntas reservadas de AI2D no entraron en el entrenamiento de v4.

## Capacidades

- Decision de opcion multiple sobre imagenes: dada una imagen, una pregunta y una lista de opciones, produce una distribucion sobre las letras y la opcion ganadora por *argmax*.
- Salida de confianza calibrada de forma aproximada: devuelve la ventaja (*margin*) de la opcion lider sobre la siguiente, utilizable como criterio de derivacion.
- Abtencion explicita: la señal `act`/`hold` permite que el sistema no responda cuando la confianza no alcanza el umbral configurado.
- Respuesta en una sola pasada: no requiere decodificacion autoregresiva de tokens, lo que reduce el coste por consulta frente a un modelo generativo del mismo tamano.
- Integracion multimodal via el modelo base: la entrada incluye imagen y texto, aunque el adaptador solo modifica las capas de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso por si mismo; su rol en un agente seria el de modulo de decision puntual.
- No dispone de modo *thinking* ni de generacion de cadena de pensamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion visual de opcion multiple a escala: el cabezal devuelve directamente la letra ganadora en una sola pasada, lo que permite procesar lotes grandes de preguntas sobre imagen con un coste de decodificacion nulo, adecuado para anotacion automatizada o preetiquetado de datasets.
- Enrutado con abtencion en pipelines de datos: usando `hold` como filtro, el sistema puede derivar a revision humana las muestras de baja confianza y automatizar solo las de alta, reduciendo el coste de supervision.
- Evaluacion comparativa de checkpoints de un mismo backbone: la perdida correctiva y la salida de margen permiten comparar v3 y v4 sobre el mismo conjunto de 923 preguntas sin depender de la variabilidad de una decodificacion generativa.
- Control de calidad en asistentes visuales: colocado delante de un modelo generativo, el cabezal puede decidir si la pregunta admite una respuesta de opcion cerrada fiable o si conviene activar la ruta generativa completa.
- Seleccion de respuesta en herramientas de accesibilidad: para interfaces que presentan opciones sobre una imagen (por ejemplo, describir y elegir un elemento), el modelo ofrece una decision rapida sin generar texto.
- Filtrado previo en sistemas de tutoria o evaluacion educativa: sobre preguntas de tipo AI2D o ScienceQA, el modelo puede corregir respuestas automaticamente, reservando el 23,5 % de error agregado para revision docente.
- Experimentacion en investigacion sobre calibracion: la combinacion de perdida de Brier, margen de decision y umbral `act` constituye un banco de pruebas para estudiar abtencion selectiva en modelos multimodales.

## Benchmarks y rendimiento

Los resultados proceden de la model card y corresponden a 923 preguntas reservadas de opcion multiple con imagen, evaluadas con tres interfaces oficiales de decision y cero errores de interfaz.

| Benchmark | Preguntas | v4 (OmniJev Qwen3.5-9B) | NeoHorse-Jev-4B | tinnel OmniJev-4B |
|---|---:|---:|---:|---:|
| MMStar | 240 | 70,0 % | 63,3 % | 62,5 % |
| RealWorldQA | 160 | 73,8 % | 71,9 % | 70,6 % |
| AI2D | 160 | 84,4 % | 84,4 % | 84,4 % |
| MMMU | 203 | 64,5 % | 56,7 % | 52,7 % |
| ScienceQA test | 160 | 96,2 % | 93,8 % | 80,6 % |
| Total | 923 | 76,5 % | 72,3 % | 68,7 % |

Advertencias que la propia model card incluye sobre estas cifras: no deben presentarse como una superacion de los rankings publicados de NeoHorse o tinnel, ya que las seis pruebas de texto, Image-NLI, LIBERO y Mind2Web no se ejecutaron en este checkpoint; la mejora no puede atribuirse a la cabeza de decision, porque el Qwen3.5-9B sin entrenar no se comparo sobre estas 923 preguntas y los competidores son de 4B; el 76,5 % es *argmax* y no exactitud condicional; el umbral `act` de 0,8 se midio en v3 y la mediana de margen de las respuestas erroneas es 0,90, por lo que ese umbral no bloquea la mayoria de los errores. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de las seis pruebas de texto mencionadas.

## Requisitos de hardware

- No se publican cifras de VRAM, latencia ni throughput en la informacion proporcionada.
- El requisito dominante es el del modelo base Qwen3.5-9B completo, que debe cargarse en memoria ademas del adaptador; el LoRA (`lora.pt`) y la cabeza (`head.pt`) anaden un coste marginal en comparacion.
- Cabeza de decision: al no requerir decodificacion autoregresiva, el coste por consulta es una unica pasada hacia delante, inferior al de una generacion completa con el mismo backbone.
- GPU recomendadas: no disponible para este checkpoint concreto; el fabricante no publica perfiles de despliegue.
- Encaje en GPU de consumo: no disponible como dato verificado; depende del modelo base y de la precision de carga elegida, no del adaptador.
- Opciones de despliegue: la model card solo documenta la carga mediante el codigo del proyecto (`omnijev.paths`, `scripts.experiment_effective.load_native`, metodo `model.decide(image, question, options, state)`), con el base en `models/Qwen3.5-9B` y los ficheros del repositorio en `models/runs/qwen35-rlcd-v4`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es directamente compatible con esos motores sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Total en las 923 preguntas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniJev Qwen3.5-9B v4 | 9B de base mas LoRA y cabeza; recuento exacto no disponible | Distribucion sobre opciones, margen y `act`/`hold` | 76,5 % | Apache-2.0 | HuggingFace (`tzcfly/OmniJev-Qwen3.5-9B-v4`) y repositorio GitHub |
| NeoHorse-Jev-4B | 4B | Decision sobre opciones | 72,3 % | no disponible | no disponible en la informacion proporcionada |
| tinnel OmniJev-4B | 4B | Decision sobre opciones | 68,7 % | no disponible | no disponible en la informacion proporcionada |

Los tres comparten el mismo tipo de tarea y el mismo formato de evaluacion, pero la comparacion es incompleta: la model card advierte que no se ha ejecutado el Qwen3.5-9B sin adaptar sobre estas 923 preguntas, por lo que no puede aislarse cuanto del resultado procede del backbone y cuanto del entrenamiento del cabezal. Tampoco se dispone de las especificaciones completas de los dos modelos de 4B.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas en lenguaje natural, solo una distribucion sobre opciones predefinidas y una decision `act`/`hold`.
- El umbral `act` de 0,8 fue calibrado en v3, no en v4. La mediana de margen de las respuestas erroneas es 0,90, de modo que el umbral no filtra la mayoria de los errores. El 76,5 % reportado corresponde a *argmax* y no a exactitud condicionada a `act`.
- El backbone sin adaptador no ha sido evaluado sobre el conjunto de 923 preguntas, por lo que no puede atribuirse la mejora a la cabeza de decision.
- Las capas de vision no se entrenaron: toda la adaptacion ocurre en las capas de atencion del bloque de lenguaje.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de respuestas erroneas con alta confianza, dado que el margen mediano de los fallos es elevado.
- Sesgos: no disponibles; la model card no documenta analisis de sesgo ni composicion demografica de los datos de entrenamiento.
- Limitaciones de idioma: no disponibles; los conjuntos de entrenamiento citados (AI2D y ScienceQA) son en ingles.
- Restricciones de licencia: el adaptador y la cabeza se publican bajo Apache-2.0. El modelo base Qwen/Qwen3.5-9B tambien es Apache-2.0, pero debe descargarse por separado y su licencia se aplica de forma independiente.
- No se han ejecutado en v4 las seis pruebas de texto, Image-NLI, LIBERO ni Mind2Web, y el bucle cerrado de escritorio (8/12) corresponde a v3, no a esta version.
- El repositorio pesa 0,0 GB segun HuggingFace y tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados por terceros.
- La documentacion de la model card esta redactada principalmente en chino, lo que puede dificultar la revision por parte de equipos que no lo lean.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tzcfly/OmniJev-Qwen3.5-9B-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de codigo y evaluacion: https://github.com/shapsider/OmniJev
- Informe tecnico: `docs/TECHNICAL_REPORT.md` dentro del repositorio anterior
- Registros de evaluacion por pregunta: `results/qwen35-suite/vs-full/` dentro del repositorio anterior
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado tecnico relacionado con el modelo; no se han encontrado papers, blogs ni demos adicionales.
