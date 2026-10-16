# Steerix-org/robo-jev-2b-lora

## Resumen

robo-jev 2B LoRA (v0.7) es un adaptador LoRA de bajo rango publicado por Steerix-org (Steerix Robotics) sobre el modelo base Qwen/Qwen3.5-2B, en su revisión `15852e8`. No es un modelo de propósito general, sino un "System 1" especializado en juicio físico para robótica: recibe una descripción textual breve del estado del robot y del entorno y devuelve, en una sola pasada hacia delante, una probabilidad calibrada para cada pregunta planteada (por ejemplo, si un vaso volcará al frenar o si una persona alcanzará la trayectoria del robot antes de que este pase).

El adaptador tiene rango 32, alpha 64 y 31 millones de parámetros en bfloat16, y se aplica sobre los 2B parámetros del modelo base. La propuesta de valor es triple: latencia muy baja (una única pasada, sin tokens de razonamiento ni muestreo), tamano reducido (2B, ejecutable junto al planificador del robot en una GPU pequena) y compatibilidad con la forma de peticiones de la Decisions API (un texto de estado y hasta 12 preguntas). El modelo base y el adaptador estan bajo licencia Apache 2.0 y soportan ingles y coreano.

El interés actual reside en su enfoque de toma de decisiones por juicio probabilístico en lugar de generación de texto: en el benchmark propio de Steerix sobre 1.100 situaciones no vistas en entrenamiento, robo-jev v0.7 obtiene 0.81 de habilidad de juicio físico, frente a 0.28 del siguiente modelo comparable y valores cercanos a cero o negativos en el resto. Esto lo posiciona como una alternativa ligera y rapida para la capa de decision de robots moviles y manipuladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen/Qwen3.5-2B) |
| Parametros totales | 2B (modelo base) + 31M (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (formato del adaptador); no disponible para el modelo base |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Detalles adicionales del adaptador: rango 32, alpha 64, 31 millones de parametros, bfloat16. Modelo base fijado en la revision `15852e8` de Qwen/Qwen3.5-2B. Tamano del repositorio: 0,1 GB. Libreria: peft. Version del adaptador: v0.7.

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen/Qwen3.5-2B, un transformer de 2B parametros, y se aplica mediante PEFT. El LoRA tiene rango 32 y alpha 64, con 31 millones de parametros entrenados en bfloat16, lo que representa aproximadamente un 1,5 % del tamano del base. El modelo esta disenado para producir directamente una distribucion de probabilidad calibrada sobre las opciones de cada pregunta en una unica pasada, sin generar texto intermedio ni cadenas de razonamiento; el propio autor lo describe como un "System 1" de juicio rapido.

El modelo se especializa en tres tipos de pregunta sobre el estado descrito: eleccion (`choice`, con 2 a 26 opciones), respuesta binaria (`noul`) y puntuacion (`score`). El prompt se construye con el texto de estado y hasta 12 preguntas por peticion, y el modelo devuelve una categoria, un valor booleano o una puntuacion acompanados de sus probabilidades. No se han facilitado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. El modelo gemelo con el adaptador ya fusionado esta publicado como Steerix-org/robo-jev-2b.

## Capacidades

- Juicio fisico de alta frecuencia: responde en una sola pasada a preguntas como si un vaso se volcara al frenar, si una persona alcanzara la trayectoria o si una pieza ha quedado bien encajada.
- Salida probabilistica calibrada: devuelve una probabilidad por cada opcion, pensada para integrarse en capas de decision y no para generar lenguaje natural.
- Preguntas de eleccion (`choice`): seleccion entre 2 y 26 opciones con distribucion de probabilidad sobre todas ellas.
- Preguntas binarias (`noul`): respuestas si/no con probabilidad asociada.
- Preguntas de puntuacion (`score`): estimacion de una magnitud en una escala (por ejemplo, riesgo entre 0 y 1) con probabilidades por valor.
- Procesamiento por lotes de preguntas: admite de 1 a 12 preguntas en una misma peticion.
- Compatibilidad de forma de peticion con la OpenRouter Decisions API (texto de estado y lista de preguntas).
- Multilingue limitado: ingles y coreano.
- No genera texto libre; su salida es estructurada (categoria, booleano o puntuacion).

## Casos de uso

- Robot de reparto en interiores: dado un texto de estado con velocidad, distancia a peatones y tipo de carga, el modelo decide en una pasada si continuar, reducir velocidad o frenar, devolviendo probabilidades que el planificador puede usar para arbitrar la accion.
- Frenado de seguridad en robots moviles: estimar la probabilidad de contacto con una persona si se mantiene la velocidad actual o se frena con distinta intensidad, con latencia de milisegundos por decision.
- Manipulacion y ensamblaje: responder a preguntas del tipo "esta bien asentada la pieza" o "se sujetara con este agarre" para validar acciones de una pinza antes de comprometerlas.
- Investigacion en robotica y simulacion: banco de pruebas para comparar politica de decision aprendida frente a heuristicas, reutilizando el mismo controlador y variando solo el modelo de decision.
- Integracion en bucle de control: al responder en aproximadamente 50 ms en una GPU L4 y en cerca de 0,1 s para una docena de preguntas, puede invocarse muchas veces por segundo dentro del ciclo de control.
- Evaluacion de seguridad previa a la accion: consultar, antes de ejecutar una maniobra, escenarios alternativos (frenada suave, moderada o fuerte) y elegir la de menor riesgo estimado.
- Despliegue embarcado junto al planificador: al ocupar solo 2B parametros, cabe en una GPU pequena compartida con otros modulos del robot, sin depender de servicios en la nube.
- Investigacion multilingue en agentes fisicos: soporte de ingles y coreano para equipos que operan en esos idiomas.

## Benchmarks y rendimiento

| Modelo | Juicio fisico (mayor es mejor) | Lectura general (BoolQ + MultiNLI, mayor es mejor) |
|---|---|---|
| robo-jev v0.7 · 2B | 0.81 | 0.71 |
| TypeSafe Jev | 0.28 | 0.91 |
| Liquid d1 | 0.17 | 0.93 |
| Microsoft-Decision-1 | 0.04 | 0.92 |
| Together Tev1 4B | 0.03 | 0.90 |
| OpenAI GPT-6 Luna Decisions | -0.02 | 0.86 |
| Upstage Solar Decide | -0.15 | 0.86 |
| Qwen3.5-2B sin entrenar | -0.15 | 0.74 |

Notas: el juicio fisico se mide como habilidad frente a responder siempre un 50 % (0 equivale a una moneda al aire, 1 a acierto perfecto) sobre el benchmark propio de robo-jev, con 1.100 situaciones retenidas (formulaciones, rangos de valores y combinaciones de fenomenos no vistos en entrenamiento). Los modelos de decision se consultaron a traves de la OpenRouter Decisions API. GPT-6 Luna Decisions rechazo aproximadamente una quinta parte de las peticiones de juicio fisico y su puntuacion cubre solo el resto. No se han publicado en la informacion disponible datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: el modelo base de 2B en bfloat16 ocupa aproximadamente 4 GB de pesos, a los que se suman alrededor de 62 MB del adaptador (31M parametros en bfloat16) mas el overhead de activaciones y cache.
- GPU de referencia reportada: una NVIDIA L4 responde una peticion corta en unos 50 ms y una docena de preguntas en unos 0,1 s.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar el modelo en bfloat16 (por ejemplo, una L4 o una RTX 3060 de 12 GB); GPUs de gama alta como RTX 4090, A100 o H100 proporcionarian mayor margen y throughput, aunque no se han publicado cifras para ellas.
- GPU de consumo: cabe previsiblemente en GPUs de consumo con 8 GB o mas de VRAM en bfloat16; no se han publicado cifras oficiales de consumo de memoria.
- Opciones de despliegue: el repositorio proporciona `robo_jev_decide.py`, que depende unicamente de `transformers` (>= 5.17) y `peft`, cargando el base en la revision fijada y aplicando el adaptador. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 50 ms por peticion corta y 0,1 s para doce preguntas en una L4, en una unica pasada por pregunta, sin muestreo ni tokens de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Juicio fisico | Lectura general | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| robo-jev v0.7 (2B) | 2B + adaptador 31M | no disponible | 0.81 | 0.71 | apache-2.0 | HuggingFace (adaptador + fusionado) |
| Together Tev1 4B | 4B | no disponible | 0.03 | 0.90 | no disponible | via OpenRouter Decisions API |
| TypeSafe Jev | no disponible | no disponible | 0.28 | 0.91 | no disponible | no disponible |
| Liquid d1 | no disponible | no disponible | 0.17 | 0.93 | no disponible | no disponible |
| Microsoft-Decision-1 | no disponible | no disponible | 0.04 | 0.92 | no disponible | no disponible |
| OpenAI GPT-6 Luna Decisions | no disponible | no disponible | -0.02 | 0.86 | no disponible | via OpenRouter Decisions API |
| Upstage Solar Decide | no disponible | no disponible | -0.15 | 0.86 | no disponible | no disponible |

Los modelos comparables estan orientados a decision y comparten la misma forma de peticion a traves de la Decisions API, pero solo se dispone de sus puntuaciones de juicio fisico y lectura general; no se han facilitado sus parametros, contexto ni licencia.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo produce salidas estructuradas (eleccion, booleano o puntuacion). No debe esperarse de el redaccion ni dialogo.
- Los tipos de pregunta estan acotados: `choice` admite de 2 a 26 opciones y cada peticion admite de 1 a 12 preguntas; fuera de esos limites el modelo no esta disenado para responder.
- Idiomas limitados a ingles y coreano; no se ha confirmado soporte de castellano ni de otras lenguas.
- El benchmark de juicio fisico es propio del autor y se define como habilidad frente a responder siempre el 50 %; no es directamente comparable con metricas estandar como MMLU o HumanEval.
- No se han publicado datos sobre sesgos, composicion del dataset de entrenamiento ni comportamiento ante estados fuera de distribucion, mas alla de las 1.100 situaciones retenidas del benchmark.
- Existe riesgo de calibracion imperfecta de las probabilidades en escenarios muy distintos a los de entrenamiento, lo que en robotica puede traducirse en decisiones de seguridad erroneas; conviene validar en el dominio concreto antes de uso en produccion.
- El modelo es un adaptador: requiere descargar el base Qwen/Qwen3.5-2B en la revision exacta `15852e8` y aplicar PEFT. Cambios en dicha revision pueden romper la compatibilidad de pesos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-2B puede tener sus propias condiciones que conviene verificar por separado.
- No se documenta soporte en runtimes de inferencia optimizados (vLLM, llama.cpp, Ollama, TGI), por lo que el despliegue recomendado es via `transformers` + `peft`.

## Enlaces

- HuggingFace (adaptador LoRA): https://huggingface.co/Steerix-org/robo-jev-2b-lora
- HuggingFace (modelo fusionado): https://huggingface.co/Steerix-org/robo-jev-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio GitHub: https://github.com/STEERIX-home/robo-jev
- Sitio del benchmark: https://robo-jev.dev/
- OpenRouter Decisions API: https://openrouter.ai/models?output_modalities=decisions
