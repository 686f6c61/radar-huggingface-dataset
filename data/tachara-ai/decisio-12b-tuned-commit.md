# tachara-ai/Decisio-12b-tuned-commit

## Resumen

Decisio-12b-tuned-commit es un ajuste fino del modelo google/gemma-4-12B-it orientado a un uso muy especifico: responder preguntas tipadas sobre un estado y devolver una probabilidad calibrada para cada opcion posible. El modelo lo publica tachara-ai y se sirve mediante el framework decisio (a partir de la version 0.31.0), que aplica un diseno de prompt propio, una lectura de probabilidades por letra de opcion, temperaturas por tipo de pregunta y una regla de commit para las respuestas de si/no.

Se trata de un modelo denso de aproximadamente 11.960 millones de parametros, derivado de Gemma 4 12B, en el que un adaptador LoRA se ha fusionado directamente en los pesos base. El resultado se distribuye en formato safetensors en bf16, con un tamano de repositorio de 24 GB. La relevancia actual radica en su enfoque: no es un modelo generativo de proposito general, sino un motor de decision probabilistica que puede integrarse en pipelines donde se necesita una distribucion de probabilidad sobre opciones discretas y una calibracion controlada.

El repositorio es uno de los dos publicados con los mismos pesos (junto a Decisio-12b-tuned-calibrated); la unica diferencia entre ambos es el archivo decision_config.json, que define el comportamiento de la variante. En esta version, la regla de commit empuja las probabilidades de si/no que caen estrictamente entre 0,20 y 0,80 hacia el borde de esa banda en su propio lado, sin alterar la respuesta elegida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), adaptador LoRA fusionado en los pesos |
| Parametros totales | 11.959.730.224 (aprox. 11,96 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en el repositorio; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it (revision 707f0a3b), un transformer denso de la familia Gemma 4. Sobre esa base se entreno un adaptador LoRA que se fusiono en los pesos originales en fp32 y se redondeo una sola vez a bf16 de forma estocastica con semilla 0, mediante la herramienta `python -m decisio.hub_bf16 merge`. El proceso conserva el 99,9996 % del cambio del adaptador en el espacio de pesos, y el resto de tensores permanece identico al modelo base byte a byte. El archivo decision_config.json registra cada fichero por sha256 junto con los detalles de la fusion, y SHA256SUMS lista los ficheros del repositorio.

Los datos de entrenamiento no se han divulgado. El autor indica que no se usaron elementos de evaluacion del Decision Index ni de JevBench en el entrenamiento ni en la seleccion de checkpoints, y que los datos se descontaminaron contra los conjuntos de test publicos de ambos boards. Se incluyeron splits de entrenamiento oficiales de algunos benchmarks publicos bajo sus licencias, sin usar sus elementos de test o evaluacion, y cada fila de entrenamiento se verifico contra los conjuntos de test publicos mencionados. Las temperaturas por tipo de pregunta y banda de opciones se ajustaron por minima log loss sobre la lectura plana (sin la regla de commit).

La innovacion tecnica principal no esta en la arquitectura, sino en el sistema de serving: decisio aplica un layout de prompt propio, una lectura de probabilidad por letra de opcion y temperaturas especificas por tipo de pregunta (si/no 3,314; score 2,1109; choice 1,8222, con variantes por numero de opciones: 2-10 usa 2,1317, 11-26 usa 1,8766 y 27-255 usa 1,7181). vLLM por si solo carga los pesos como un checkpoint Gemma 4 ordinario, pero no aplica ninguno de estos elementos.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado, devolviendo una probabilidad por cada opcion disponible.
- Preguntas de si/no con regla de commit: probabilidades estrictamente entre 0,20 y 0,80 se reportan en el borde de la banda en su propio lado (0,80 por encima de un medio, 0,20 en o por debajo).
- Preguntas de tipo score y de tipo choice (seleccion entre opciones), con temperaturas ajustadas por banda de numero de opciones.
- Calibracion probabilistica de las respuestas, ajustada por minima log loss por tipo de pregunta.
- Servido mediante el framework decisio (version 0.31.0 o superior), con motor vLLM.
- Hereda las capacidades del modelo base Gemma 4 12B, si bien la model card no detalla cuales se conservan tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion binaria con umbral controlado: el modelo responde preguntas de si/no y aplica la regla de commit, de modo que las probabilidades dudosas se empujan a los bordes de la banda. Resulta adecuado en sistemas de aprobacion o rechazo donde se quiere una decision con margen explicito.
- Enrutamiento de peticiones en pipelines: con preguntas de tipo choice, el modelo devuelve una distribucion sobre las opciones (por ejemplo, categorias o destinos), util para decidir a que rama derivar una solicitud.
- Puntuacion de estados en juegos de decision o simulaciones: las preguntas de tipo score permiten obtener una probabilidad calibrada sobre un estado concreto, integrable en un agente que evalua posiciones.
- Moderacion o filtrado con probabilidad: el modelo puede evaluar si un contenido cumple una politica y devolver una probabilidad, con la banda de commit aplicada para reducir falsos positivos en la zona gris.
- Evaluacion de riesgo en formularios o solicitudes: preguntas tipadas sobre un estado permiten obtener una probabilidad de aceptacion o rechazo, con temperaturas ajustadas segun el numero de opciones disponibles.
- Serving reproducible en produccion: al distribuirse como checkpoint safetensors bf16 con hashes sha256 y un decision_config.json que fija temperaturas y reglas, el despliegue con decisio y vLLM es determinista en cuanto a configuracion.
- Investigacion sobre calibracion probabilistica: el repositorio documenta el ajuste de temperaturas por minima log loss y la fusion del adaptador, lo que lo hace util como referencia para estudiar el efecto de la calibracion en modelos de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos bf16 de aproximadamente 11,96 mil millones de parametros, se necesitan del orden de 24 GB solo para los pesos, mas memoria para el contexto y el runtime de vLLM; el repositorio ocupa 24 GB.
- GPU recomendadas: no se especifican en la informacion proporcionada; por tamano, encajan GPUs con 40-80 GB (A100 40/80 GB, H100) para servicio con vLLM. No disponible como recomendacion oficial del autor.
- Cabe en GPU de consumo: no disponible de forma oficial; con cuantizaciones adicionales no documentadas en el repositorio, el requisito de memoria seria menor, pero el autor solo publica bf16.
- Opciones de despliegue: el autor documenta el servido con decisio 0.31.0 o superior mediante `uv run python -m decisio.serve.vllm_engine --base tachara-ai/Decisio-12b-tuned-commit`. vLLM por si solo carga los pesos como checkpoint Gemma 4, pero sin el layout de prompt, la lectura por letra de opcion, las temperaturas ni la regla de commit. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-commit | 11,96 mil millones | no disponible | Decision probabilistica con regla de commit | Apache 2.0 | HuggingFace, serving via decisio |
| Decisio-12b-tuned-calibrated | Mismos pesos | no disponible | Decision probabilistica calibrada (sin regla de commit) | Apache 2.0 | HuggingFace, serving via decisio |
| google/gemma-4-12B-it | 12B (aprox.) | no disponible | Modelo generativo de proposito general | Gemma (segun modelo base) | HuggingFace |

La comparativa con otros modelos de decision de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para un formato de prompt y serving especificos de decisio; usarlo con vLLM sin decisio omite el layout, la lectura por letra de opcion, las temperaturas y la regla de commit, por lo que las probabilidades obtenidas no corresponderan al comportamiento documentado.
- Requiere decisio 0.31.0 o superior; versiones anteriores no reconocen el flavor del repositorio.
- La regla de commit modifica la calibracion reportada de las respuestas de si/no, no la respuesta elegida; debe tenerse en cuenta al interpretar probabilidades en produccion.
- Los datos de entrenamiento no se han divulgado, lo que limita la evaluacion de sesgos y de posibles solapamientos con datos de evaluacion.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- La licencia es Apache 2.0, heredada del modelo base; Gemma 4 es propiedad de Google y debe revisarse el archivo LICENSE y NOTICE del repositorio antes de uso comercial.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia publica de rendimiento comparado.
- El repositorio tiene 37 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- HuggingFace: https://huggingface.co/tachara-ai/Decisio-12b-tuned-commit
- Repositorio decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio hermano (calibrated): https://huggingface.co/tachara-ai/Decisio-12b-tuned-calibrated
