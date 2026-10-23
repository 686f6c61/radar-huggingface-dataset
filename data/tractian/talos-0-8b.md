# tractian/talos-0.8b

## Resumen

Talos-0.8B es un modelo de decisión ("System One") desarrollado por Tractian para el entorno de planta industrial. No genera texto ni acepta instrucciones en lenguaje natural: recibe el estado tipado de una petición que un cliente (un agente de IA, un script o una pantalla de operador) dirige a un controlador industrial, junto con lo que la pasarela sabe en ese instante, y devuelve en un único forward pass diez respuestas tipadas con probabilidades calibradas.

Técnicamente es un adaptador LoRA de rango 16 sobre el modelo base congelado Qwen/Qwen3.5-0.8B-Base, al que se añade un *pointer readout* sobre un conjunto fijo de preguntas. Se entrenó con la receta Kev durante una época sobre 161.602 peticiones etiquetadas, con escalado de temperatura por pregunta ajustado en una partición de calibración reservada. El vocabulario de entrada es cerrado: ni nombres de tag, ni cadenas de dispositivo, ni texto libre llegan nunca al modelo.

Su relevancia está en el nicho: sustituye heurísticas ad hoc en la puerta de acceso a controladores Modbus y OPC UA, permitiendo cachear lecturas, diferir clientes por encima de presupuesto, denegar escrituras que no deberían ejecutarse y clasificar clientes por comportamiento, siempre por debajo de reglas deterministas que el modelo solo puede endurecer. La licencia es Apache 2.0 y los pesos ocupan unos 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre transformer decoder congelado Qwen/Qwen3.5-0.8B-Base, más pointer readout sobre conjunto fijo de 10 preguntas; detalles internos del base no disponibles |
| Parametros totales | Base de 0,8B (adaptador LoRA y cabeza de lectura adicionales, recuento exacto no disponible) |
| Parametros activos | No aplica (no es MoE); base denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en safetensors y el base podría cuantizarse según el runtime, sin especificar |
| Idiomas soportados | Ingles (en); la entrada es un vocabulario cerrado y tipado, no texto libre |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT/safetensors (`adapter_model.safetensors`, `adapter_config.json`), `head.safetensors` y `head.pt`, `calibration.json`, tokenizer del base |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,1 GB |
| Salidas | `action` (allow / cache / defer / deny), `needed_now`, `duplicate`, `servable`, `over_budget`, `contradiction`, `state_conflict`, `envelope`, `misbehaving`, `severity` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base con los pesos congelados y aplica un adaptador LoRA de rango 16. Sobre la representación resultante se monta un *pointer readout* que responde a un conjunto fijo de diez preguntas tipadas en un solo forward pass, en lugar de decodificar texto. La calibración se resuelve con escalado de temperatura por pregunta, ajustado sobre una partición reservada, de modo que las probabilidades devueltas son directamente utilizables como umbrales operativos. El entrenamiento siguió la receta Kev (https://github.com/jaredpalmer/kev), una sola época sobre 161.602 peticiones etiquetadas.

Los datos son íntegramente sintéticos: plantas simuladas con física (bombas, ventiladores, cintas, tanques, calentadores, reactores, compresores y otros equipos), controladores expuestos por Modbus y OPC UA, y un enjambre de agentes programados y dirigidos por LLM con intenciones buenas, descuidadas y maliciosas. Las etiquetas provienen de un oráculo programático con verdad de referencia completa; no hubo etiquetado humano ni por modelo, y no se usó tráfico real de planta, nombres de tag ni datos de clientes. El dataset no está publicado. La entrada se renderiza en un vocabulario cerrado, lo que evita que identificadores libres lleguen al modelo.

## Capacidades

- Clasificación de acciones en cuatro vías sobre peticiones a controladores: allow, cache, defer y deny.
- Predicción de diez preguntas tipadas simultáneas por petición, incluyendo duplicidad, servibilidad desde caché, exceso de presupuesto del cliente, contradicción, conflicto de estado, envolvente de operación, comportamiento anómalo y severidad.
- Calibración explícita: probabilidades por pregunta con temperatura ajustada, utilizables como umbrales de decisión.
- Detección de agentes que se comportan mal, con AUROC de 0,992 en el conjunto de evaluación.
- Funcionamiento con y sin mapa de registros: puede operar a partir de huellas de tráfico cuando no hay documentación de registros.
- Integración con la pasarela Talos mediante servidor compatible System One (`kev.serve`).
- No soporta tool calling, agentes conversacionales, generación de texto, visión ni audio: no existe interfaz de texto ni prompt.
- Multilingüismo: no aplica; solo inglés en el vocabulario de entrada y sin generación libre.

## Casos de uso

- **Puerta de acceso a controladores industriales:** el modelo clasifica cada petición entrante a un PLC o a un servidor OPC UA como allow, cache, defer o deny, con reglas deterministas por encima que solo pueden endurecer la decisión. Es adecuado porque devuelve probabilidad calibrada y permite fijar umbrales por planta.
- **Descarga de bus mediante caché de lecturas:** cuando la salida es cache, la pasarela sirve la lectura desde caché en lugar de reenviarla al controlador. Según la model card, la mayoría de los desacuerdos en la clasificación de cuatro vías son precisamente lecturas servidas desde caché, lo que no tiene coste operativo.
- **Control de presupuesto por cliente:** la señal `over_budget` permite diferir agentes o scripts que saturan el controlador, priorizando el tráfico crítico. El modelo razona sobre el estado del cliente en el instante de la petición, no sobre un contador externo.
- **Detección de agentes maliciosos o defectuosos:** con AUROC de 0,992 para agentes que se comportan mal, la salida `misbehaving` y `severity` sirve para clasificar clientes en niveles y degradar permisos de forma gradual (por ejemplo, limitar lecturas antes de bloquear escrituras).
- **Prevención de escrituras incoherentes:** las señales `contradiction` y `state_conflict` detectan peticiones que chocan con el estado conocido del equipo antes de que lleguen al controlador, evitando escrituras que dejarían la planta en un estado inconsistente.
- **Deduplicación en flotas de scripts y agentes:** la señal `duplicate` permite colapsar peticiones repetidas de varios clientes sobre el mismo registro en una sola operación al controlador.
- **Despliegue en modo sombra sobre planta real:** la model card recomienda ejecutar la pasarela primero en shadow mode para comparar las decisiones del modelo con las reglas existentes y medir la tasa de falsos bloqueos antes de activar el deny.
- **Plantas sin documentación de registros:** el modelo funciona a partir de huellas de tráfico cuando no hay mapa de registros (98,1% de peticiones malas capturadas y 0,97% de buenas bloqueadas erróneamente, frente a 98,4% / 0,19% con mapa).

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card y del model-index del autor. El conjunto de evaluación es un test reservado con una familia de planta y tres personas de agente que nunca aparecieron en entrenamiento, renderizado con mapa de registros y solo con huellas de tráfico: 15.593 peticiones. La métrica de precisión de cuatro vías está declarada en el model-index con `verified: false`, es decir, no verificada de forma independiente. El dataset es sintético y no está publicado.

| Metrica | Valor |
|---|---|
| Precision de accion en 4 vias | 93,6% (no verificada) |
| Peticiones malas capturadas (referencia deny, modelo deny) | 98,2% (1.043 de 1.062) |
| Peticiones buenas bloqueadas erroneamente | 0,58% (84 de 14.531) |
| Bloqueos omitidos | 0,12% (19) |
| Precision cuando el modelo esta seguro (p >= 0,9; 80% de las peticiones) | 99,0% |
| Con mapa de registros: capturadas / bloqueadas erroneamente | 98,4% / 0,19% |
| Sin mapa de registros: capturadas / bloqueadas erroneamente | 98,1% / 0,97% |
| AUROC de agente con comportamiento anomalo | 0,992 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el modelo no es generativo y ese tipo de evaluación no aplica.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 0,8B del base, no publicada por el autor): en FP16 en torno a 2-3 GB contando pesos, adaptador, cabeza de lectura y overhead de runtime; en int8 aproximadamente 1-1,5 GB; en int4 en torno a 0,6-1 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; una RTX 4090 o A100 queda muy sobredimensionada para este modelo. Para el modo sombra en planta basta una GPU de gama baja o incluso CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, y también en CPU para cargas moderadas.
- Despliegue: el autor indica servir con `uv run python -m kev.serve --run <directorio>` y apuntar la pasarela con `talos-proxy --model systemone:http://127.0.0.1:8009`. No es un modelo generativo, por lo que los servidores habituales (vLLM, TGI, llama.cpp, Ollama) no aplican salvo que se implemente el readout por separado; `head.safetensors` existe para cargadores que no aceptan pickles.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un único forward pass sobre un modelo de 0,8B, la latencia esperada es de decenas de milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos directamente comparables: Talos-0.8B es un modelo de decisión no generativo, con vocabulario de entrada cerrado y salida de diez preguntas tipadas, específico para control industrial. La comparación más cercana es contra el propio modelo base y contra un enfoque de LLM generativo usado como juez.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Talos-0.8B | 0,8B (base) + LoRA r16 | No disponible | Clasificacion tipada en un forward pass, calibrada | Apache 2.0 | HuggingFace + GitHub de Tractian |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | No disponible en la informacion | Transformer decoder generativo; requeriria prompt y parseo de salida | Apache 2.0 | HuggingFace |
| LLM generativo como juez de peticiones | Depende del modelo | Depende del modelo | Generacion de texto + parseo; sin calibracion nativa por pregunta | Depende del modelo | Multiple |

## Limitaciones y advertencias

- Entrenado íntegramente sobre plantas simuladas. En una planta real cuya semántica de registros se aleje del simulador hay que esperar más falsos bloqueos hasta que se formen las huellas de tráfico; el autor recomienda ejecutar la pasarela primero en modo sombra.
- Sin mapa de registros, el modelo bloquea más escrituras buenas al principio de un episodio, antes de que un registro tenga historial de escritura. La regla de cold start de la pasarela las difiere en lugar de denegarlas.
- El modelo solo ve lo que ve la pasarela: el estado de planta que no se puede inferir se renderiza como desconocido.
- No es un sistema de seguridad instrumentada y no sustituye paradas cableadas, PLC de seguridad, enclavamientos ni dispositivos de alivio.
- No es un mecanismo de autenticación ni autorización: la identidad sobre Modbus en crudo es una clave de reputación, no una credencial.
- No admite texto libre ni prompt; cualquier caso de uso fuera de peticiones tipadas a un controlador queda fuera de alcance.
- Riesgo de alucinación en el sentido generativo: no aplica, pero sí existe riesgo de clasificación errónea, con un 0,58% de peticiones buenas bloqueadas y un 0,12% de bloqueos omitidos en el test sintético; ambas cifras deben tratarse como cotas optimistas en producción real.
- El dataset de entrenamiento y evaluación no está publicado, y la métrica de precisión del model-index figura como no verificada; no hay evaluación independiente.
- Sesgos conocidos: no documentados por el autor más allá de la brecha simulación-realidad; no hay análisis de sesgo por tipo de equipo, fabricante o protocolo.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos y sin garantías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tractian/talos-0.8b
- Repositorio (código, proxy y documentación): https://github.com/tractian/talos
- Receta de entrenamiento Kev: https://github.com/jaredpalmer/kev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Documentación de evaluación: `docs/EVAL.md` en el repositorio de Talos
- Citación: `CITATION.cff` en el repositorio de Talos
