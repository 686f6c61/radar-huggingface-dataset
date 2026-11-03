# Thox-ai/ThoxMesh-Head-C6

## Resumen

ThoxMesh-Head-C6 es un clasificador tabular entrenado desde cero por Thox-ai (THOX.ai LLC) que se ejecuta en microcontroladores de nodos de malla (mesh) y decide qué eventos de radio o de sensores merecen despertar a un modelo mayor. No es un modelo de lenguaje: es una red neuronal cuantizada a int8 en formato TFLite/LiteRT-Micro de 9.848 bytes que recibe un vector de 16 características y predice la clase de evento junto con tres ranuras de acción (comando, objetivo y argumento).

Su relevancia práctica está en el triaje local-first: al ejecutarse en el propio nodo, filtra el tráfico de eventos antes de consumir recursos de un modelo superior, lo que reduce el consumo energético y la latencia en despliegues Matter, Thread y Zigbee. La model card es explícita sobre el estado de cada salida: la cabecera de evento supera sus umbrales, pero las tres ranuras de acción no, por lo que el autor restringe el uso a triaje y desaconseja enviar la ruta de acción con estos pesos.

El modelo se publica bajo licencia Apache-2.0, solo en inglés, y no dispone de pesos en safetensors ni de variantes GGUF: el artefacto distribuido es el binario TFLite más una exportación a array en C y un `meta.json` que define el orden de características y clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal tabular cuantizada a int8 (clasificador); topología interna no detallada en la model card |
| Parametros totales | 9.848 bytes en formato int8 (recuento de parámetros no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de vector fijo de 16 características) |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT-Micro, más exportación a array en C (`model_data.cc`, `model_data.h`) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna (número de capas, tipo de capas o función de activación). Lo que sí se especifica es el contrato de entrada y salida: un vector de 16 características de radio y sensores produce una clase de evento y tres ranuras de acción (comando, objetivo y argumento) ensambladas a partir de un conjunto enumerado de valores, de modo que la salida siempre está bien formada sintácticamente.

El modelo se entrenó desde cero, sin modelo base externo, como parte de la línea de investigación de modelos pequeños de THOX. El corpus es sintético: se generó a partir de identificadores de clúster y atributos publicados y de rangos de radio realistas, no a partir de capturas de hardware. La model card no documenta el número de tokens ni de muestras, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de este tipo). Tampoco se describen innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de eventos de malla a partir de un vector de 16 características de radio y sensores.
- Predicción de ranuras de acción estructuradas: comando, objetivo y argumento, emitidas como línea de acción ensamblada.
- Triaje en el nodo: decide qué eventos justifican despertar un modelo de mayor tamaño (por ejemplo, ThoxAir-16M-role en la mitad ESP32-C6 del sistema).
- Ejecución on-device en microcontroladores mediante LiteRT-Micro / TFLite Micro, con huella de 9.848 bytes.
- Exportación a C (`model_data.cc`) para integración directa en el firmware.
- Metadatos legibles por máquina (`meta.json`) con el orden de características y clases.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre: es un clasificador, no un modelo generativo.
- Multilingüismo: solo inglés.

## Casos de uso

- Triaje de eventos en nodos de malla: el clasificador recibe el vector de radio y sensores y descarta o eleva cada evento, evitando que el nodo despierte un modelo mayor para eventos irrelevantes. Es adecuado por su huella de menos de 10 KB y su precisión de evento de 0,9979 en el conjunto de prueba sintético.
- Filtrado previo al modelo de rol: en la arquitectura descrita por THOX, esta cabecera decide qué eventos merecen la atención de ThoxAir-16M-role, reduciendo el consumo energético del nodo.
- Telemetría de sensores en despliegues Matter/Thread/Zigbee: clasificación local de alertas de movimiento y de sensor antes de reenviarlas a un coordinador.
- Prototipado de firmware con LiteRT-Micro: el binario TFLite y el array en C permiten integrar el modelo en cadenas de compilación de microcontroladores sin dependencias de servidores de inferencia.
- Investigación sobre modelos tabulares ultrapequeños: sirve como referencia reproducible de un clasificador int8 entrenado con datos sintéticos y con umbrales de aceptación publicados por el autor.
- Evaluación de pipelines de validación de acciones: aunque las ranuras de acción no superan sus umbrales, el modelo puede usarse para probar el ensamblado de líneas de acción y la validación en el host contra políticas y el roster activo, sin habilitar la actuación real.
- Docencia y experimentación con cuantización int8 en el borde: el par `meta.json` más binario TFLite ilustra el flujo completo de definición de características, exportación y despliegue.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el conjunto de prueba sintético:

| Metrica | Umbral | Resultado | Estado |
|---|---|---|---|
| Exactitud de evento (int8) | ≥ 0,98 | 0,9979 | Pasa |
| F1 de `motion` | ≥ 0,97 | 0,9903 | Pasa |
| F1 de `sensor_alert` | ≥ 0,97 | 0,9862 | Pasa |
| Exactitud de ranura de comando | ≥ 0,97 | 0,9608 | Falla |
| Exactitud de ranura de objetivo | ≥ 0,95 | 0,7843 | Falla |
| Exactitud de bucket de argumento | ≥ 0,90 | 0,4519 | Falla |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos de lenguaje, ya que no es un modelo de lenguaje. Tampoco se publican métricas de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en microcontroladores, no en GPU.
- Huella de memoria: 9.848 bytes para el binario int8, más el espacio de trabajo de inferencia en el microcontrolador (no cuantificado en la model card).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Despliegue: LiteRT-Micro / TFLite Micro, flasheado con la cadena de herramientas del firmware; también disponible la descarga desde Hugging Face junto con `meta.json`. No se sirve mediante vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores tabulares int8 para microcontroladores). El único modelo relacionado mencionado es ThoxAir-16M-role, que no es un equivalente sino el modelo de mayor tamaño al que esta cabecera decide despertar.

## Limitaciones y advertencias

- Las ranuras de acción (comando, objetivo y argumento) no superan sus umbrales: 0,9608, 0,7843 y 0,4519 frente a los mínimos exigidos. El autor indica explícitamente que no se debe enviar la ruta de acción con estos pesos.
- El error restante en objetivo y argumento se atribuye a una cuestión de definición de la tarea: el vector de entrada no contiene la información que esas etiquetas requieren. No es un problema de ajuste de hiperparámetros.
- Los datos de entrenamiento son sintéticos y el comportamiento en campo no está medido; la precisión de 0,9979 corresponde a un conjunto de prueba sintético.
- El modelo emite una línea de acción, pero nunca ejecuta la acción por sí mismo: el host debe validarla contra la política y el roster activo, y el firmware debe acotar los argumentos predichos independientemente de la predicción.
- Uso fuera de alcance: actuación directa, decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana.
- Solo admite inglés y un vector de entrada fijo de 16 características; no es un modelo generativo ni soporta instrucciones en lenguaje natural.
- Licencia Apache-2.0: permite uso comercial, pero el autor restringe el uso práctico de la ruta de acción por motivos de calidad, no de licencia.
- El orden de características y clases debe generarse desde `meta.json`; codificarlo a mano en el firmware introduce errores silenciosos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxMesh-Head-C6
- Modelo relacionado (ThoxAir-16M-role): https://huggingface.co/Thox-ai/ThoxAir-16M-role
- Colección MeshStack y MeshMind: https://huggingface.co/collections/Thox-ai/thox-meshstack-and-meshmind-models-6ae7517d9b60e7b122505d79
- Catálogo de modelos THOX: https://www.thox.ai/models
- Campaña de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
