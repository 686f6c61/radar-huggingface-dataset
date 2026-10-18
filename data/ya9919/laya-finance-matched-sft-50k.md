# ya9919/laya-finance-matched-sft-50k

## Resumen

laya-finance-matched-sft-50k es un ajuste fino supervisado del checkpoint oficial `convaiinnovations/laya`, publicado por el usuario ya9919. No es un modelo generativo de propósito general: se distribuye como un encoder completo más una "decision head" nativa que selecciona una opción entre un conjunto de alternativas, es decir, resuelve preguntas de elección múltiple sobre temática financiera. El paquete incluye 421.293.830 parámetros almacenados en FP16 y un repositorio de 0,8 GB.

El entrenamiento se realizó con el método que el autor denomina `native-laya-sft-only`, partiendo del checkpoint ya entrenado en tarea y usando 50.000 filas distintas del split de entrenamiento de QA en inglés compuesto por cuatro fuentes. El checkpoint publicado corresponde a esa única etapa, con 50.000 exposiciones acumuladas y seleccionado sobre un conjunto fijo de desarrollo (`dev20k`) mediante F1 macro por pregunta y, en segundo lugar, accuracy.

Su relevancia es acotada y muy específica: sirve como pieza de evaluación y como cabecera de decisión dentro de pipelines de investigación sobre encuestas de finanzas de los hogares (CHFS/CGSS), no como asistente conversacional. La model card reporta 0,7269 de accuracy y 0,3485 de F1 macro por pregunta sobre el subconjunto común congelado de 240.458 filas y 119 versiones de pregunta, con cero predicciones inválidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder nativo Laya con decision head (clasificacion sobre opciones); detalles de capas y atencion no disponibles |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la configuracion registra la ventana de entrenamiento, pero su valor no se publica y la evaluacion usa ventanas suficientes con rechazo de desbordamiento |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas; pesos nativos en FP16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (artefactos del modelo); los datos de entrenamiento conservan los terminos `chfs-cgss-cfps-clds-source-data-terms` |
| Formato de pesos | safetensors (`model.safetensors`), FP16; incluye `rl_agent_config.json`, `encoder/config.json`, `tokenizer/tokenizer.json`, `tokenizer/tokenizer_config.json` |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un encoder completo junto con la decision head nativa original del proyecto Laya, inicializado desde el checkpoint oficial ya entrenado en tarea. El modelo no genera texto libre: recibe la pregunta y todas las opciones y emite una decision. El paquete se carga con la libreria `laya` (version 0.4.2), PyTorch 2.12.1 y Transformers 5.19.0, y puede instanciarse sin estado de entrenamiento mediante `load_checkpoint`. No se detallan el numero de capas, el mecanismo de atencion, la dimension oculta ni el vocabulario.

El ajuste fino consistio en una etapa unica de SFT sobre 50.000 filas distintas del split de entrenamiento de QA en ingles de cuatro fuentes, sin que se documenten etapas de RLHF, DPO u optimizacion por preferencias. La seleccion del checkpoint se hizo con `dev20k` fijo, priorizando F1 macro por pregunta sobre accuracy. Un detalle tecnico relevante es la receta de evaluacion de entrada completa: el modelo calcula tantas ventanas de tokens como sean necesarias y rechaza el desbordamiento en lugar de truncar, de modo que la ventana registrada en la configuracion corresponde al entrenamiento y no es una instruccion de recorte en inferencia.

## Capacidades

- Respuesta a preguntas financieras de eleccion multiple: selecciona una opcion a partir de la pregunta y el conjunto completo de alternativas.
- Clasificacion sobre vocabulario cerrado de respuestas, sin generacion de texto libre ni justificaciones.
- Procesamiento de entradas largas mediante multiples ventanas de tokens con rechazo explicito de desbordamiento (sin truncado silencioso).
- Cero predicciones invalidas en la evaluacion reportada, es decir, la cabeza siempre emite una opcion del conjunto.
- Uso como politica de decision en simulacion multiagente (etiqueta `s2-mas` y repositorio `mas-simulation`).
- Carga sin estado de entrenamiento para inferencia en CPU (ejemplo de la model card con `torch.device("cpu")`).
- No dispone de tool calling, function calling, capacidades de agente conversacional, vision, audio ni modo de razonamiento explicito; no hay datos que los respalden.
- Multilingue: no. Solo ingles segun la model card.

## Casos de uso

- Etiquetado de encuestas de finanzas de los hogares a escala: dado el par pregunta-opciones de los cuestionarios CHFS/CGSS, el modelo asigna una opcion por registro; con 240.458 filas procesadas en la evaluacion publicada, es viable procesar corpus completos por lotes.
- Enriquecimiento de corpus para investigacion economica: mapear respuestas ya existentes a un conjunto cerrado de opciones para armonizar fuentes distintas (CHFS, CGSS, CFPS y CLDS) antes del analisis estadistico.
- Baseline reproducible de QA financiera: sirve como referencia de accuracy y F1 macro por pregunta frente a la que medir variantes posteriores del mismo pipeline Laya.
- Control de calidad y deteccion de anomalias: las filas donde el modelo se desvia de la etiqueta observada pueden priorizarse para revision manual, aprovechando la ausencia de predicciones invalidas para descartar errores de formato.
- Politica de decision en simulacion multiagente: la decision head puede actuar como componente que elige accion entre alternativas en el entorno descrito en el repositorio `mas-simulation`, con resultados de simulacion financiera reportados por separado.
- Filtrado y curación de datos de entrenamiento: usar las decisiones del modelo para etiquetar debilmente grandes volumenes de QA financiero y seleccionar subconjuntos de alta confianza para entrenar modelos generativos.
- Evaluacion de robustez por version de pregunta: con 119 versiones de pregunta en el conjunto de prueba, permite analizar la dispersion de F1 entre formulaciones equivalentes de la misma cuestion.

## Benchmarks y rendimiento

Unicos resultados publicados: evaluacion con etiquetas observadas sobre el subconjunto comun congelado CHFS/CGSS de 240.458 filas y 119 versiones de pregunta.

| Metrica | Valor |
|---|---:|
| Accuracy | 0,726941919 |
| Question-macro F1 | 0,348511449 |
| Predicciones invalidas | 0 |

Notas: el split de prueba completo en ingles del repositorio de origen tiene 418.597 filas, un denominador distinto del usado en la tabla; los resultados no son directamente comparables entre ambos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en FP16: aproximadamente 0,84 GB para 421,3 M de parametros (el repositorio completo ocupa 0,8 GB).
- VRAM estimada para inferencia: del orden de 2 GB incluyendo activaciones y ventanas de entrada completa; es una estimacion derivada del numero de parametros, no una cifra publicada.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090). El ejemplo oficial de carga funciona directamente en CPU.
- GPU de datacenter: no se requieren A100 ni H100; su uso solo tendria sentido para procesar grandes lotes en paralelo.
- Despliegue: paquete nativo `laya` 0.4.2 con PyTorch 2.12.1 y Transformers 5.19.0, mediante `load_checkpoint`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estandar esas rutas no son de aplicacion directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| laya-finance-matched-sft-50k | 421.293.830 | No disponible | Apache-2.0 | Accuracy 0,7269; F1 macro 0,3485 en subconjunto CHFS/CGSS de 240.458 filas |
| convaiinnovations/laya (modelo base) | No disponible | No disponible | No disponible | No se publican metricas del checkpoint base en la informacion disponible |
| Otros modelos de QA financiera de eleccion multiple | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre alternativas comparables de la misma categoria (QA financiera con cabeza de decision sobre opciones cerradas) que permita una comparacion con cifras verificables.

## Limitaciones y advertencias

- Solo ingles: no hay soporte documentado de otros idiomas, lo que invalida su uso directo sobre cuestionarios en castellano.
- No es un modelo generativo: no produce explicaciones, texto libre ni respuestas conversacionales; únicamente elige entre opciones dadas.
- Brecha marcada entre accuracy (0,727) y F1 macro por pregunta (0,3485): indica un fuerte desequilibrio en la distribucion de etiquetas y un comportamiento probablemente sesgado hacia las opciones mayoritarias. El rendimiento en preguntas con opciones poco frecuentes puede ser bajo.
- La evaluacion se apoya en 119 versiones de pregunta, una base reducida para estimar F1 macro; la varianza por pregunta puede ser alta.
- Riesgo de alucinacion en sentido estricto bajo (no genera texto), pero riesgo de asignacion erronea con apariencia de validez, ya que no hay senal de confianza ni abstención: el modelo siempre emite una opcion valida.
- Dependencia de versiones concretas: `laya` 0.4.2, PyTorch 2.12.1 y Transformers 5.19.0; no se garantiza compatibilidad con otras versiones.
- La receta de evaluacion exige entrada completa con rechazo de desbordamiento; truncar las entradas invalida la comparabilidad con las cifras publicadas.
- Licencia Apache-2.0 sobre los artefactos, con atribucion al modelo upstream, pero los datos de entrenamiento quedan sujetos a `chfs-cgss-cfps-clds-source-data-terms`; el uso comercial del modelo no exime de revisar esos terminos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.
- No hay informacion sobre sesgos demograficos o geograficos mas alla de los derivados de las encuestas CHFS/CGSS/CFPS/CLDS utilizadas.

## Enlaces

- HuggingFace: https://huggingface.co/ya9919/laya-finance-matched-sft-50k
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de reproduccion e evidencia agregada: https://github.com/KataDavidXD/mas-simulation
