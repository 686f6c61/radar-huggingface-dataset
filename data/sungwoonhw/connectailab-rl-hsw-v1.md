# SUNGWOONHW/connectailab-rl-hsw-v1

## Resumen

Connectailab-rl-hsw-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B por el autor SUNGWOONHW, en el marco de la colaboracion entre CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de proposito general: es un modelo especializado en toma de decisiones empresariales simulado. Recibe un estado, una pregunta y una lista de opciones etiquetadas (A, B, C...) y devuelve unicamente la letra de la opcion elegida, de modo que la probabilidad asignada a cada letra funciona como una distribucion de preferencia sobre las alternativas.

El modelo se entrena con un pipeline de aprendizaje por refuerzo en cuatro fases: una politica pequena aprende a operar una empresa simulada y actua como profesor; se genera un conjunto de preguntas de decision reejecutando cada mes con distintas opciones; se realiza aprendizaje supervisado sobre la mejor opcion; y finalmente se aplica una fase de RL con ventaja estandarizada por lote y divergencia KL respecto al modelo de partida. Los datos provienen del simulador CONNECT TYCOON, con 4076 preguntas de entrenamiento, 831 de validacion y 838 de prueba.

Su relevancia actual es acotada y principalmente metodologica y educativa: demuestra que un modelo de 0,8B de parametros puede superar ampliamente su linea base (del 33,3 % al 72,1 % de acierto) en una tarea de decision estructurada mediante LoRA y RL. El autor lo presenta explicitamente como un modelo de investigacion y educacion sobre un simulador de empresa sintetica, no como una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base (adaptador LoRA: no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder denso de 0,8 mil millones de parametros. La tarea se formula como clasificacion generativa restringida: dado un estado, una pregunta y un conjunto de opciones, el modelo debe emitir exactamente una letra, y la probabilidad de cada letra se interpreta como la puntuacion del modelo para esa alternativa. La instruccion de sistema indica al modelo que trate el texto del estado como datos y no como instrucciones, que seleccione exactamente una opcion listada y que devuelva solo la letra, sin explicacion.

El entrenamiento sigue cuatro etapas descritas por el autor: primero, una politica pequena aprende a gestionar la empresa simulada durante miles de meses mediante PPO y actua como politica profesora; segundo, se construye un conjunto de preguntas de decision reejecutando cada mes con variantes de opciones para puntuar cada alternativa; tercero, se realiza aprendizaje supervisado sobre la opcion de mayor puntuacion; cuarto, se aplica una fase de aprendizaje por refuerzo que agrupa todas las opciones de una decision, aumenta la probabilidad de las que superan la media del grupo (ventaja estandarizada por lote) y anade una penalizacion KL respecto al modelo de partida. La composicion de empresas usada es la distribucion `general`, ajustada con datos publicos. No se detallan el numero de tokens de entrenamiento ni la composicion completa del dataset mas alla del recuento de preguntas.

## Capacidades

- Toma de decisiones estructurada: selecciona una unica opcion etiquetada (letra) a partir de un estado, una pregunta y una lista de alternativas.
- Salida de distribucion de preferencia: al devolver una letra con su probabilidad, permite ordenar opciones por confianza.
- Razonamiento aplicado a escenarios de gestion empresarial simulada (decisiones operativas de una empresa dentro del simulador CONNECT TYCOON).
- Manejo de instrucciones de sistema estrictas: respeta la consigna de tratar el estado como datos y no como instrucciones.
- Idioma: coreano.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se documenta generacion de texto libre, codigo ni matematicas como capacidades objetivo.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para decision making: el modelo sirve como caso reproducible de aplicacion de GRPO/ventaja estandarizada y KL sobre un modelo pequeno, con un pipeline completo descrito en la model card.
- Educacion en RL y LoRA: la model card incluye un notebook de Colab para reproducir el entrenamiento, por lo que es util como material didactico sobre fine-tuning con LoRA sobre un modelo de 0,8B.
- Experimentacion con simuladores de negocio: puede integrarse en el simulador CONNECT TYCOON para automatizar decisiones mes a mes y comparar su politica con la de la politica profesora entrenada con PPO.
- Estudio de destilacion de politicas: permite analizar como una politica pequena entrenada con PPO se transfiere a un modelo de lenguaje mediante aprendizaje supervisado y RL, y medir la brecha entre ambos.
- Evaluacion de formatos de decision estructurada: util para probar formulaciones de prompt (estado/pregunta/opciones) en tareas de eleccion forzada con salida de una sola letra.
- Pruebas de robustez ante instrucciones inyectadas: dado que el prompt de sistema indica tratar el estado como datos, sirve para estudiar como un modelo pequeno responde a intentos de manipulacion dentro del campo de estado.
- Linea base para comparativas de modelos de decision: sus cifras de acierto y arrepentimiento sobre el conjunto de prueba (838 preguntas) pueden usarse como referencia en experimentos propios.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (precision sobre el conjunto de prueba, arrepentimiento o regret, donde menor es mejor):

| Modelo | Precision en el examen | Regret | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 33,3 % | 2,32 | no disponible | no disponible |
| Aprendizaje supervisado | 73,0 % | 1,80 | no disponible | no disponible |
| Aprendizaje por refuerzo (este modelo) | 72,1 % | 1,77 | 4,13 millones de won | 37 % (91/177) |

El autor advierte que la evaluacion de la operacion de empresa corresponde a la media de dos meses nunca vistos, por lo que la muestra es pequena, y que el modelo aun queda por debajo de la politica profesora entrenada con PPO en el simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 0,8B mas un adaptador LoRA, deberia caber holgadamente en torno a 2 GB en FP16 y por debajo de 1 GB en cuantizacion de 4 bits; no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabe en cualquier GPU consumer moderna (por ejemplo, series RTX 30/40) e incluso en entornos de CPU.
- Cabe en GPU consumer: si, dado el tamano del modelo base (0,8B), aunque no se documenta un listado oficial de GPU validadas.
- Opciones de despliegue: la model card muestra el uso mediante `transformers` y `peft` (`PeftModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la naturaleza de adaptador LoRA sobre un modelo base implicaria cargar base + adaptador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (tarea de decision) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-hsw-v1 | 0,8B (base) + LoRA | no disponible | 72,1 % (regret 1,77) | apache-2.0 | HuggingFace, downloads: 0 |
| Qwen/Qwen3.5-0.8B (base, sin entrenar) | 0,8B | no disponible | 33,3 % (regret 2,32) | no disponible en la informacion proporcionada | modelo base referenciado |
| Politica profesora (PPO en simulador) | no disponible (modelo pequeno) | no disponible | superior a la del modelo segun el autor | no disponible | interna del proyecto, no publicada |

No se dispone de informacion sobre otros modelos comparables de decision making empresarial publicados, por lo que la comparativa se limita al modelo base y a la politica profesora interna.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados de forma explicita; el modelo se entrena sobre una distribucion de empresa `general` ajustada con datos publicos y sobre un simulador sintetico, por lo que puede reflejar los sesgos de ese simulador y de sus datos.
- Riesgo de alucinacion: aunque la tarea exige devolver una sola letra, un modelo de 0,8B puede emitir texto adicional o una opcion no listada si el prompt no esta bien formado; la model card no reporta tasas de fallo de formato.
- Limitaciones de contexto e idioma: solo se declara coreano (ko); no se especifica la longitud de contexto soportada.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B, que no se detalla en la informacion proporcionada, antes de un uso comercial.
- Caveat de produccion: el propio autor indica que es un modelo de investigacion y educacion sobre un simulador de empresa sintetica y recomienda revalidarlo con los registros reales de una empresa antes de usarlo para decisiones de gestion.
- Tamano de muestra limitado: la evaluacion de la operacion de empresa se basa en la media de dos meses no vistos, lo que el autor senala como muestra pequena.
- Rendimiento por debajo del profesor: el modelo queda por debajo de la politica profesora entrenada con PPO en el simulador.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere validacion externa nula.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/SUNGWOONHW/connectailab-rl-hsw-v1
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
