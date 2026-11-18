# ya9919/YN-421m-rlcd-50k

## Resumen

YN-421m-rlcd-50k es un checkpoint de investigacion de 421 millones de parametros desarrollado por el autor ya9919 en el marco del proyecto S²-MAS, una infraestructura de simulacion multiagente a escala social orientada al estudio de decisiones financieras de hogares. El modelo no es un LLM generativo al uso: es un encoder con una cabeza de decision (decision head) que puntua opciones candidatas dentro de un menu cerrado, siguiendo la ruta de "encoder option scoring" descrita en el paper del proyecto. Parte del checkpoint supervisado ya9919/YN-421m-sft-50k y aplica una continuacion RLCD (Reinforcement Learning from Contrastive Data) sobre los mismos 50.000 ejemplos.

La relevancia del checkpoint es acotada y muy especifica: sirve como variante de presupuesto fijo en la comparativa comun de modelos de decision del benchmark S²-MAS, que agrupa doce sistemas en seis rutas metodologicas. Sobre el conjunto de test comun (240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de hogar) alcanza un 72,9258 % de accuracy y un 34,7841 % de F1 macro por pregunta, frente al 72,6942 % / 34,8511 % de su padre SFT50. La mejora en accuracy es marginal (+0,2316 puntos, IC 95 % 0,1771–0,2854) y el F1 macro empeora ligeramente (−0,0671 puntos).

Arquitectonicamente se apoya en el encoder `answerdotai/ModernBERT-large` con la cabeza de decision Laya original de dos capas. El modelo solo procesa ingles, se distribuye en safetensors (0,8 GB de repositorio) y su licencia es estrictamente no comercial, sin redistribucion ni destilacion. No es un modelo para produccion general: es una pieza de evaluacion cientifica dentro de un benchmark de decision financiera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) con cabeza de decision Laya de dos capas |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16 nativo PyTorch) |
| Idiomas soportados | Ingles (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (no comercial, sin redistribucion) |
| Formato de pesos | safetensors |
| Libreria | laya |
| Modelo base | ya9919/YN-421m-sft-50k |
| Tamano del repositorio | 0,8 GB |
| Precision de inferencia reportada | BF16 nativo |
| Tarea | Clasificacion/puntuacion de opciones en QA financiero de hogares |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large (aproximadamente 395 M de parametros en el backbone) al que se anade la cabeza de decision Laya de dos capas, que puntua cada opcion candidata de un menu cerrado condicionada por el estado del hogar y la pregunta. La inferencia evalua conjuntamente el estado completo, la pregunta y el menu completo de candidatos, y produce logits de opcion. No hay decodificacion autoregresiva ni generacion de texto libre: el modelo elige entre opciones predefinidas.

El entrenamiento parte del checkpoint SFT50 (ya9919/YN-421m-sft-50k) y aplica una continuacion RLCD sobre 50.000 filas distintas de la particion de entrenamiento de decision-QA, con una pasada adicional sobre los mismos ejemplos. El metodo RLCD nativo combina entropia cruzada con un termino de gradiente de politica basado en proper scoring sobre los logits ruidosos de las opciones. El checkpoint final acumula 100.000 exposiciones a filas (50.000 en la etapa SFT previa y 50.000 en esta), con 50.000 filas distintas en total. La seleccion del checkpoint se realiza sobre un conjunto de desarrollo fijo de 20.000 ejemplos, separado del test. El aprendizaje de decision del proyecto usa datos de encuesta reales; los registros de entrenamiento y evaluacion no se distribuyen.

## Capacidades

- Puntuacion de opciones en menus cerrados: dado un estado de hogar y una pregunta, asigna logits a cada opcion candidata y selecciona la de mayor puntuacion. No genera texto libre.
- QA financiero de hogares: preguntas sobre uso de tarjetas de credito, cuentas de deposito a la vista, cuentas de valores y depositos a plazo no vencidos, entre otras del conjunto de consumo.
- Clasificacion de respuestas binarias y multiclase dentro de una version de pregunta definida.
- Procesamiento de estado estructurado del hogar junto con la pregunta y el menu de candidatos en una sola pasada.
- Cero decisiones invalidas reportadas en el test comun, es decir, el modelo siempre selecciona una opcion valida del menu.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No soporta vision ni audio.
- Multilingue: no; solo ingles.

## Casos de uso

- Evaluacion comparativa de metodos de decision: el checkpoint sirve como variante de presupuesto fijo (50.000 filas, 100.000 exposiciones acumuladas) en la comparativa comun del benchmark S²-MAS, permitiendo aislar el efecto del RLCD frente al SFT puro y frente a la referencia nativa Laya.
- Investigacion sobre RLCD en tareas de clasificacion: al partir de un padre SFT identico en datos, permite medir el efecto de anadir un termino de policy gradient con proper scoring sobre logits de opcion, con intervalos de confianza reportados (+0,2316 accuracy, IC 95 % 0,1771–0,2854).
- Simulacion de decisiones de consumo y pagos a escala: integrado en el motor de transicion de estados GENESE/MAS, el modelo puede puntuar opciones de decision de agentes sinteticos de hogar en escenarios financieros emparejados; el paper evalua 12 millones de agentes sinteticos en la aplicacion de financiacion de compras.
- Reproduccion de resultados del paper: con la configuracion de encoder, tokenizer y cabeza de decision suministradas, un investigador puede replicar las cifras del test comun (240.458 registros, 119 versiones, 8.275 grupos) en BF16.
- Analisis de sensibilidad por version de pregunta: la metrica de F1 macro por pregunta permite estudiar en que tipos de pregunta el RLCD mejora o degrada el rendimiento respecto al SFT, util para diagnosticar donde el termino de policy gradient aporta o resta.
- Linea base para futuras adaptaciones de presupuesto fijo: el checkpoint sirve como punto de partida documentado para continuaciones de entrenamiento con el mismo presupuesto de datos, dado que el autor publica las exposiciones exactas por etapa.

## Benchmarks y rendimiento

Test comun: 240.458 registros de QA, 119 versiones de pregunta, 8.275 grupos de encuestado/hogar. Inferencia en BF16 nativo. Checkpoint seleccionado con datos de desarrollo antes del test.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones invalidas |
|---|---:|---:|---:|
| YN-421m-rlcd-50k (este checkpoint) | 72,9258 | 34,7841 | 0 |
| SFT50 padre (ya9919/YN-421m-sft-50k) | 72,6942 | 34,8511 | 0 |
| Laya nativo original, referencia BF16 emparejada | 60,1972 | 29,5995 | 0 |

Delta frente al padre SFT50 reportado en el paper: +0,2316 puntos de accuracy (IC 95 % 0,1771–0,2854) y −0,0671 puntos de F1 macro por pregunta (IC 95 % −0,1516–0,0197). La accuracy pondera cada registro por igual y cuenta las decisiones invalidas como incorrectas; el F1 macro promedia sobre todas las clases candidatas definidas en cada version de pregunta y pondera las 119 versiones por igual.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 0,85 GB solo para pesos (421 M de parametros a 2 bytes), mas activaciones y buffers de la cabeza de decision; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- En FP32 los pesos ocuparian unos 1,7 GB; el autor solo reporta BF16 nativo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes en evaluacion de benchmark, A100 o H100 reducen el tiempo total por throughput, no por requisito de memoria.
- Cabe en GPU consumer sin problema, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la libreria `laya` con la interfaz de inferencia nativa del proyecto, usando la configuracion de encoder, el tokenizer y la cabeza de decision suministrados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo autoregresivo estos runners no aplican directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en test comun | F1 macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YN-421m-rlcd-50k | 421 M | no disponible | 72,9258 % | 34,7841 % | S²-MAS Controlled Research v1.2 (no comercial) | Hugging Face, 49 descargas |
| YN-421m-sft-50k (padre) | 421 M | no disponible | 72,6942 % | 34,8511 % | no disponible en la informacion | Hugging Face |
| Laya nativo original (referencia BF16 emparejada) | no disponible | no disponible | 60,1972 % | 29,5995 % | no disponible en la informacion | Referencia del benchmark |

La comparativa se limita a las tres entradas con resultados en el test comun reportadas en la model card. El paper agrupa doce sistemas en seis rutas de decision y 17 entradas de repositorio (diez variantes entrenadas a presupuesto fijo, cinco Laya nativas y cinco Qwen, mas seis entradas de checkpoint/runtime y un alias de compatibilidad), pero los resultados individuales de esas variantes no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Licencia estrictamente de investigacion: S²-MAS Controlled Model Research License v1.2 permite solo uso cientifico no comercial, prohibe la redistribucion y prohibe la ingenieria inversa, extraccion o destilacion no autorizadas. No apta para produccion ni para uso comercial.
- El modelo solo procesa ingles y solo responde a preguntas del dominio de finanzas de hogares con menus de opciones cerrados; no es un asistente conversacional ni un generador de texto.
- No es un LLM: no soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.
- La mejora frente al padre SFT50 es marginal en accuracy y negativa en F1 macro por pregunta; el intervalo de confianza del F1 (−0,1516–0,0197) incluye el cero, por lo que la ganancia en F1 no es concluyente.
- Riesgo de alucinacion en el sentido generativo: no aplica, al no generar texto; el riesgo equivalente es la seleccion erronea de opcion, con una tasa de acierto del 72,9 % en el test comun, es decir, aproximadamente una de cada cuatro decisiones es incorrecta.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion proporcionada; el entrenamiento usa datos de encuesta reales no distribuidos, lo que limita la auditoria externa del dataset.
- Los registros de entrenamiento y evaluacion no se distribuyen y el acceso a los datos de origen requiere autorizacion del proveedor, lo que dificulta la replicacion independiente.
- El motor GENESE/MAS permanece privado, de modo que la integracion completa en la simulacion no es reproducible con los artefactos publicos.
- La ficha del repositorio conserva etiquetas de experimentos anteriores (`laya-finance-matched-sft-rlcd-50k`, nombre previo `ya9919/sharp-421m-rlcd-50k`) que pueden confundir al localizar artefactos o resultados.
- No hay informacion sobre la longitud de contexto soportada ni sobre cuantizaciones validadas, lo que limita el despliegue fuera del entorno BF16 nativo documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-421m-rlcd-50k
- Modelo base SFT50: https://huggingface.co/ya9919/YN-421m-sft-50k
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Licencia: https://huggingface.co/ya9919/YN-421m-rlcd-50k/blob/main/LICENSE
- Ejemplos de QA en JSON: https://huggingface.co/ya9919/YN-421m-rlcd-50k/blob/main/qa_examples.json
- Contacto para permisos: yli9919@hku.hk
