# xixibuxixi/StatePlay-Mixed-SF3-KOF98-Joint-All-RL

## Resumen

StatePlay-Mixed-SF3-KOF98-Joint-All-RL es un checkpoint de pesos publicados por el usuario xixibuxixi dentro de la familia de experimentos StatePlay. No se trata de un modelo de lenguaje: es una union de parametros entrenables (LoRA y modulos de transicion) obtenida tras un experimento de aprendizaje por refuerzo conjunto de una sola etapa sobre un modelo base de generacion de video para juegos de lucha (Street Fighter III y The King of Fighters '98). El repositorio contiene unicamente pesos aprendidos, no un modelo autonomo listo para inferencia.

El entrenamiento actualiza de forma simultanea tres componentes: el modelo de transicion, el LoRA de acoplamiento de estado latente y el LoRA visual. La recompensa combina mecanicas de juego (60 %) y calidad visual (40 %), con un filtro de guarda de mecanicas activado. El snapshot corresponde al paso 46 del optimizador y al cursor de condicion 560.

Su relevancia es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, orientado a reproducir o continuar el pipeline de RL del autor. Con 61.630.720 parametros entrenables en 751 tensores y un tamano de repositorio de 0,3 GB, debe cargarse junto al SFT base correspondiente y al fichero `transition_tokenizer.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de pesos LoRA y modulos de transicion sobre un modelo base de generacion de video; no se detalla la arquitectura del base) |
| Parametros totales | 61.630.720 parametros entrenables (751 tensores); no es el total del modelo base |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (weights-only, sin estado del optimizador ni RNG) |

## Arquitectura y entrenamiento

El artefacto es una union de parametros aprendidos, no un modelo completo. Segun la model card, el experimento de RL conjunto de una sola etapa actualiza simultaneamente el modelo de transicion, el LoRA de acoplamiento de estado latente y el LoRA visual. La funcion de recompensa es `0.6 * mechanics + 0.4 * visual_quality`, con filtrado de guarda de mecanicas habilitado. El checkpoint corresponde al paso 46 del optimizador y al cursor de condicion 560.

El fichero `model.safetensors` conserva exactamente los nombres de tensor del entrenamiento y no incluye estado del optimizador ni del generador de numeros aleatorios. Para usarlo hay que cargarlo junto al SFT base cuyo SHA256 es `d22492703ed233088108663955c2360b874f6c32dfe99ae18fe19dd8d4ab7077` y junto a `transition_tokenizer.pt`. El checkpoint de entrenamiento congelado tiene SHA256 `bc3c2c35b766afe38031add9a8c97e53c8781c698c7998ff88eab565c5747505`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de video de juegos de lucha: el pipeline StatePlay apunta a sintetizar transiciones visuales para Street Fighter III y The King of Fighters '98, segun los identificadores del nombre del modelo.
- Modelado de mecanicas de juego: la recompensa incluye un termino de mecanicas (60 %) con filtro de guarda, orientado a preservar la coherencia de las transiciones de estado.
- Acoplamiento de estado latente: el LoRA de acoplamiento de estado latente modula la relacion entre estados del juego y representaciones latentes.
- Ajuste visual: el LoRA visual se entrena para mejorar la calidad de los fotogramas generados.
- No se documentan capacidades de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, multilingue, thinking mode, audio ni ninguna otra capacidad de modelo de lenguaje.
- No es un modelo autonomo: no puede ejecutarse sin el SFT base y el tokenizador de transicion.

## Casos de uso

- Reproduccion de experimentos de RL: cargar el snapshot junto al SFT base con el SHA256 indicado y `transition_tokenizer.pt` para replicar el estado del paso 46 del optimizador en un pipeline de investigacion.
- Continuacion del entrenamiento: reanudar el RL conjunto desde este checkpoint, sabiendo que no incluye estado del optimizador ni RNG y que habra que reinicializarlos.
- Investigacion sobre recompensas compuestas: estudiar el efecto de una recompensa ponderada 0,6/0,4 entre mecanicas y calidad visual en la generacion de video de juegos de lucha.
- Estudio de LoRA multimodulo: analizar como interactuan un LoRA de acoplamiento de estado latente y un LoRA visual cuando se actualizan de forma simultanea.
- Evaluacion de filtros de guarda: comparar el comportamiento del modelo con el filtrado de mecanicas habilitado frente a variantes sin el, si el autor las publica.
- Base para fine-tuning especifico de un juego: partir de este checkpoint para adaptar la generacion de transiciones a un unico titulo (SF3 o KOF98) en lugar del entrenamiento mixto.
- Docencia y divulgacion: ilustrar un flujo completo de RL sobre modelos generativos de video con pesos publicos y hashes verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo completo; los pesos publicados ocupan 0,3 GB, pero la inferencia requiere ademas el SFT base y el tokenizador de transicion, cuyo consumo no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base, no especificado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el pipeline es de generacion de video con RL y requiere el codigo del proyecto StatePlay, no publico en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (checkpoints de RL para generacion de video de juegos de lucha) con parametros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el SFT base con el SHA256 indicado y `transition_tokenizer.pt` los pesos no son utilizables.
- El snapshot no incluye estado del optimizador ni RNG, por lo que no permite una reanudacion exacta del entrenamiento.
- El checkpoint corresponde a un unico paso (46) y un cursor de condicion (560); no hay evidencia de convergencia ni de calidad final.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa por parte de la comunidad.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad; el termino visual_quality de la recompensa no esta definido publicamente.
- El alcance es muy estrecho (dos juegos de lucha concretos); no debe esperarse generalizacion a otros dominios.
- La licencia apache-2.0 permite uso comercial, pero las limitaciones tecnicas y la ausencia de documentacion desaconsejan su uso en produccion sin evaluacion propia.
- No se especifican idiomas soportados ni contexto; no aplica como modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-Mixed-SF3-KOF98-Joint-All-RL
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
