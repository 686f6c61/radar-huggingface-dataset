# XAILab-CyberSpark/jev-parallel-decision-qwen3.5-0.8b

## Resumen

JEV Parallel Decision (Qwen3.5-0.8B) es un adaptador LoRA de investigacion publicado por el usuario XAILab-CyberSpark, cuyo desarrollador declarado es OpenSparX (上海塞伯火种人工智能有限公司). No es un modelo generativo: implementa un esquema de puntuacion de decisiones denominado JEV (shared-State, isolated-question, prefill-only), en el que un unico estado compartido se combina con varias preguntas aisladas para producir una distribucion softmax sobre un conjunto de opciones aportadas por quien invoca el modelo.

El repositorio (0,1 GB) contiene tres piezas: el adaptador LoRA en punto flotante, una cabeza pointer de 256 dimensiones entrenada por separado y la implementacion Python de inferencia. Los pesos del backbone base, Qwen/Qwen3.5-0.8B, no se incluyen y deben descargarse aparte. La inferencia no pasa por `AutoModelForCausalLM.generate()`, sino por codigo propio en `src/` que ejecuta prefill y la cabeza de decision.

Su interes actual es acotado pero claro: sirve como artefacto de investigacion reproducible para estudiar puntuacion de decisiones en un solo paso de prefill, con un protocolo de evaluacion sintetico (2.016 preguntas IID y 2.185 OOD) y una metrica de consistencia ante permutacion de opciones (94,8%). Esta pensado para tareas de seleccion entre alternativas predefinidas, no para dialogo abierto ni generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal Qwen3.5-0.8B + cabeza pointer de 256 dimensiones; esquema shared-State, isolated-question, prefill-only |
| Parametros totales | No disponible (el repositorio solo contiene el adaptador LoRA y la cabeza; el backbone base tiene 0,8 B de parametros y se descarga aparte) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; la model card recomienda pesos FP32 para reproducibilidad |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + codigo Python de inferencia personalizado |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, montado sobre el backbone de texto Qwen3.5-0.8B, mas una cabeza pointer de 256 dimensiones entrenada de forma separada. El modo de operacion es prefill-only: el modelo procesa el estado compartido y las preguntas en una pasada de prefill y emite una distribucion de scores por pregunta, sin bucle de decodificacion autoregresiva. Cada pregunta se evalua de forma aislada sobre el mismo estado compartido, de ahi la denominacion parallel-decision.

El entrenamiento uso registros sinteticos en chino del dominio de cuidado infantil y viajes familiares, con pares State/Question. La evaluacion se realizo sobre tests sinteticos retenidos: 2.016 preguntas IID y 2.185 preguntas OOD, con una precision por pregunta de 92,91% en IID y 90,62% en OOD, y una consistencia del 94,8% ante permutacion del orden de las opciones. El conjunto de datos de benchmark no esta incluido en el repositorio. No se documenta en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Puntuacion de decisiones sobre opciones proporcionadas por el invocador: recibe un estado (cadena de texto) y una lista de preguntas, cada una con identificador, enunciado y opciones, y devuelve una distribucion softmax por pregunta.
- Evaluacion paralela de varias preguntas contra un estado compartido, en una unica pasada de prefill.
- Manejo de opciones con orden variable: el modelo muestra una consistencia del 94,8% ante permutacion de las alternativas en el benchmark sintetico del proyecto.
- Inferencia determinista reproducible si se fijan las versiones de dependencias y se usan los pesos FP32 del release.
- No genera texto: la model card indica explicitamente que el modelo no produce lenguaje y que `generate()` no es la ruta de inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en sentido generativo.
- No descubre opciones omitidas: solo puntua el conjunto de opciones que recibe.
- No invoca APIs de vehiculo ni ningun servicio externo.
- Capacidad multilingue: no disponible; el modelo esta entrenado y etiquetado unicamente para chino.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Reproduccion de investigacion en decision scoring prefill-only: permite replicar el experimento JEV con `inference.py`, los pesos FP32 y las versiones fijadas de dependencias, y comparar el coste de una pasada de prefill frente a esquemas autoregresivos.
- Estudio de robustez ante permutacion de opciones: partiendo de la referencia del 94,8% de consistencia, se pueden generar permutaciones de la lista `options` y medir la degradacion del score por pregunta, util para analizar estabilidad de clasificadores con etiquetas fijas.
- Enrutado o clasificacion con candidatos cerrados: dado un estado textual y un conjunto predefinido de intenciones o servicios, el modelo devuelve una distribucion de scores que puede usarse para seleccionar la opcion mas probable en un pipeline de decision.
- Prototipado de seleccion de servicio en cabina de vehiculo: el modelo fue entrenado con registros sinteticos de cuidado infantil y viajes familiares, por lo que encaja como prototipo de laboratorio para elegir entre servicios predefinidos, siempre con opciones explicitas y sin llamadas a API reales.
- Analisis de calibracion de scores: dado que la propia model card advierte que las salidas no son probabilidades calibradas, el modelo sirve como caso de estudio para aplicar y evaluar tecnicas de calibracion (temperature scaling, isotonic regression) sobre distribuciones softmax.
- Protocolo de evaluacion OOD sintetico: las 2.185 preguntas OOD retenidas y las 2.016 IID definen un marco de test para medir generalizacion fuera de distribucion en tareas de decision, aunque el dataset no se distribuye con el repositorio.
- Punto de partida para adaptadores propios: la receta documentada (LoRA r=16, alpha=32, dropout=0,05, cabeza pointer de 256 dimensiones) es reutilizable para entrenar adaptadores de decision sobre otros backbones Qwen y otros dominios.
- Investigacion de latencia en esquemas sin decodificacion: al no existir generacion token a token, el modelo es adecuado para estudiar arquitecturas de decision orientadas a baja latencia, si bien no se publican mediciones de latencia o throughput.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden al benchmark sintetico interno del proyecto, descrito en la model card. No hay datos de MMLU, HumanEval, GSM8K ni de otras suites estandar, y el conjunto de evaluacion no se distribuye con el repositorio.

| Metrica | Conjunto | Numero de preguntas | Resultado |
|---|---|---|---|
| Precision por pregunta (IID) | Test sintetico retenido | 2.016 | 92,91% |
| Precision por pregunta (OOD) | Test sintetico retenido | 2.185 | 90,62% |
| Consistencia ante permutacion del orden de opciones | Test sintetico | No disponible | 94,8% |
| MMLU, HumanEval, GSM8K y similares | No evaluado | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone tiene 0,8 B de parametros. En FP32 los pesos ocupan aproximadamente 3,2 GB y el conjunto con activaciones y cabeza pointer puede situarse en torno a 4-6 GB; en FP16/BF16 los pesos bajan a unos 1,6 GB y el total estimado a 3-4 GB. Son estimaciones por tamano, no mediciones publicadas.
- El release recomienda FP32 para resultados reproducibles, lo que situa el consumo en el rango alto de las estimaciones anteriores.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM es suficiente en la practica para un backbone de 0,8 B; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 cubren el caso con holgura. En entornos de servidor, A100 o H100 no son necesarias por tamano, aunque pueden usarse para ejecucion por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas de VRAM, y tambien en CPU (sin cifras de rendimiento publicadas).
- Opciones de despliegue: PyTorch con PEFT y el codigo `src/` personalizado del repositorio, invocado mediante `python inference.py --record ... --device cuda`. No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no hay ruta generativa ni pesos GGUF.
- Latencia y throughput: no disponibles. Al operar en prefill-only y sin decodificacion autoregresiva, el coste por consulta es de una unica pasada, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEV Parallel Decision (Qwen3.5-0.8B) | Adaptador LoRA + cabeza pointer sobre backbone de 0,8 B | No disponible | Puntuacion de opciones prefill-only, solo chino | Apache-2.0 | HuggingFace, 0 descargas, 0 likes; requiere descargar el backbone aparte |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8 B | No disponible | Generacion de texto causal | Apache-2.0 | HuggingFace, modelo base publico |
| Otros adaptadores de clasificacion o decision comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

La comparacion directa con el modelo base es la mas informativa: Qwen3.5-0.8B genera texto y no implementa el esquema JEV, mientras que este release solo puntua opciones y necesita el codigo de `src/` para funcionar. No hay datos publicados que permitan comparar su precision con otros sistemas de decision.

## Limitaciones y advertencias

- El adaptador por si solo no funciona: es obligatorio usar el codigo personalizado de `src/` para ejecutar la puntuacion JEV.
- La salida es un score sobre opciones aportadas por el invocador; no puede descubrir opciones omitidas ni completar alternativas que no se le entreguen.
- No invoca APIs de vehiculo ni ningun sistema externo, a pesar del contexto de aplicacion en cabina.
- Entrenado y evaluado exclusivamente con datos sinteticos en chino del dominio de cuidado infantil y viajes familiares: existe un sesgo de dominio y de idioma claro, y no hay evidencia de generalizacion a otros ambitos.
- No se ha demostrado robustez frente a ruido real de ASR, servicios no vistos ni decisiones criticas para la seguridad. No debe usarse en produccion para decisiones sensibles.
- Los scores no son probabilidades calibradas; no deben interpretarse como confianza fiable sin calibracion adicional.
- El benchmark no esta incluido en el repositorio, por lo que las cifras del 92,91% IID, 90,62% OOD y 94,8% de consistencia no son verificables de forma independiente con los artefactos publicados.
- `example_record.json` es una demostracion de interfaz, no un caso puntuado del benchmark.
- Licencia Apache-2.0, que permite uso comercial del adaptador y del codigo de inferencia, pero el modelo base Qwen/Qwen3.5-0.8B se rige por sus propios terminos y debe descargarse por separado.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion externa ni comunidad que reporte comportamientos en entornos reales.
- No se publican datos de longitud de contexto, numero de tokens de entrenamiento ni composicion detallada del dataset mas alla de la descripcion sintetica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XAILab-CyberSpark/jev-parallel-decision-qwen3.5-0.8b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web realizada; los resultados obtenidos corresponden a un perfil academico de astrofisica sin relacion con este modelo.
