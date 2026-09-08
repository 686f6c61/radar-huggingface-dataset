# thomasfchrr/Spark-X2.5-1.7B-CopilotPlus-NPU

## Resumen

Spark-X2.5-1.7B-CopilotPlus-NPU es una conversion experimental INT8 QDQ del modelo XHToken/Spark-X2.5-1.7B para ejecutarse en la NPU Qualcomm Hexagon de los ordenadores Windows ARM64 con chip Snapdragon. Desarrollada por thomasfchrr, el objetivo es permitir inferencia local acelerada por NPU en dispositivos Copilot+ sin depender de la nube, manteniendo el procesamiento en el propio hardware.

La conversion consta de dos grafos ONNX de forma fija (prefill y decode) que comparten un archivo de pesos externo compacto. El runtime de Python incluido realiza generacion greedy con la plantilla de chat local, con el modo de pensamiento deshabilitado y las caches KV gestionadas por CPU. Es importante destacar que no es un modelo exclusivo para NPU: se trata de una ejecucion hibrida QNN/CPU, y su capacidad de cache se limita a 64 slots, muy por debajo del contexto largo del modelo original. El lanzamiento es experimental y no se ha evaluado su precision de forma exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no especificados) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens (capacidad fija en esta conversion; el modelo base soporta hasta 1M) |
| Tipos de cuantizacion | INT8 QDQ (ONNX) |
| Idiomas soportados | No disponible en la conversion (el modelo base declara mas de 200 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (dos grafos de forma fija con archivo de pesos externo compartido) |

## Arquitectura y entrenamiento

La conversion utiliza dos grafos ONNX de forma fija que comparten un archivo de pesos externo. El grafo de prefill opera con B=1, S=64, P=1, mientras que el de decode usa B=1, S=1, P=64. Cada una de las 28 capas contiene caches de clave y valor con dos cabezas y un head size de 256, almacenadas como arrays FP32 en el host. Los tensores de decode son `[1,2,64,256]` para entradas y `[1,2,65,256]` para salidas. El runtime copia los primeros 64 slots y coloca el nuevo slot en la primera posicion libre de la cache.

El runtime se apoya en `onnxruntime_qnn` con el execution provider QNN, seleccionando el backend HTP en modo burst, con precision FP16, offload de cuantizacion de I/O, optimizacion BASIC del grafo y un hilo intra/inter-op. El fallback de proveedor esta deshabilitado, tanto en la construccion como en la ejecucion. Las particiones CPU previstas siguen siendo permitidas; si QNN no esta disponible, la generacion no arranca silenciosamente en modo CPU. No se proporcionan detalles sobre el entrenamiento del modelo base, la composicion de los datos ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto mediante muestreo greedy, con la plantilla de chat local y thinking deshabilitado.
- Ejecucion hibrida QNN/CPU, combinando particiones de red neuronal en la NPU y operaciones restantes en CPU.
- Diagnostico de infraestructura mediante el modo `--diagnostics`, que reporta el proveedor, backend y rutas de driver resueltos.
- Validacion de capacidad y plantilla sin cargar drivers mediante `--validate-only`, que comprueba que el prompt y el presupuesto de tokens entran en 64 slots.
- No se ha confirmado soporte de tool calling, function calling, agentes ni razonamiento multi-paso en esta conversion.
- No se han verificado capacidades de vision, audio o multilingues; el foco es la generacion de texto en local.

## Casos de uso

- Experimentacion con inferencia acelerada por NPU en dispositivos Qualcomm Snapdragon X: este modelo permite probar la ejecucion local de un LLM de 1.7B en arquitecturas ARM64 Windows, sin necesidad de GPU dedicada.
- Prototipos de asistentes conversacionales de una sola vuelta: gracias a la plantilla de chat y a la generacion greedy, se pueden responder preguntas breves en aplicaciones de escritorio sobre contenido corto.
- Validacion de despliegues ONNX con QNN EP: el runtime de ejemplo sirve como punto de partida para integrar `onnxruntime_qnn` en aplicaciones propias, comprobando la correcta resolucion de drivers.
- Investigacion sobre cuantizacion INT8 QDQ: se puede estudiar el comportamiento de pesos cuantizados para HTP en modelos compactos, aunque sin una evaluacion formal de precision.
- Desarrollo de herramientas de autocompletado local: para inputs de texto de pocas palabras o frases cortas, el limite de 64 tokens es suficiente y permite mantener los datos en el dispositivo.
- Pruebas de compatibilidad de drivers FastRPC/HTP: el modo `--diagnostics` facilita verificar si el entorno tiene los drivers Qualcomm correctos y si la NPU HTP es accesible.
- Escenarios de privacidad: generar respuestas breves sin conexion a internet, evitando que los datos salgan del equipo, en entornos como PCs Copilot+ corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversion en la informacion disponible. El modelo base se presenta en su repositorio como competitivo dentro de su categoria, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni otros evaluadores.

## Requisitos de hardware

- Windows ARM64 con una NPU Qualcomm soportada y drivers OEM NPU/FastRPC en funcionamiento. Probado en un Qualcomm Snapdragon X Plus con el backend QNN HTP.
- CPython 3.12.10 nativo ARM64. El Python emulado x64 no esta soportado.
- Dependencias exactas del `requirements.txt`; ONNX 1.22.0 se usa solo para ensamblaje y verificacion, no es dependencia en tiempo de ejecucion.
- RAM: el pico de memoria no se ha medido. El tamano del archivo de pesos (2.8 GB) no equivale al requisito de memoria real.
- Dispositivo: se recomienda una NPU Hexagon HTP en un SoC Qualcomm. No se requiere GPU dedicada.
- Despliegue: el runtime proporcionado (`sample_inference.py`) con `onnxruntime_qnn`. No se describen integraciones con vLLM, llama.cpp, Ollama, TGI ni otras plataformas para esta conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-1.7B-CopilotPlus-NPU | 64 tokens | INT8 QDQ ONNX | Apache 2.0 | ONNX | Conversion experimental para HTP, ejecucion hibrida QNN/CPU |
| Spark-X2.5-1.7B (base) | Hasta 1M tokens | Varias | Apache 2.0 | Safetensors, GGUF | Modelo original generalista, disponible en Ollama |
| Spark-X2.5-4B | Hasta 1M tokens | Varias | Apache 2.0 | Safetensors, GGUF | Version mas grande de la misma familia, mismo enfoque |

No se han identificado alternativas de otras familias con datos suficientes en la informacion proporcionada.

## Limitaciones y advertencias

- La capacidad efectiva de contexto es de 64 slots. El prompt y los nuevos tokens deben sumar 64 o menos, lo que invalida cualquier tarea que requiera contexto largo.
- No es un modelo NPU-only. Las particiones CPU son necesarias y, si QNN no esta disponible, el proceso no arranca; no existe fallback silencioso a CPU.
- Es un lanzamiento experimental, sin una evaluacion de precision amplia. El propio autor indica que "no es una linea base de precision evaluada exhaustivamente".
- Los drivers ARM64 de Qualcomm deben estar correctamente instalados. El componente `libcdsprpc.dll` no se incluye y debe provenir del driver del fabricante. Descargar DLLs de fuentes no oficiales plantea riesgos de seguridad.
- Solo se ha validado el flujo completo con 11 tokens nuevos generados, aunque la capacidad por cache llega a 64. No se ha verificado el comportamiento con cargas mayores.
- No se implementan batching, eviction de cache, soporte de contexto largo, cache NPU persistente ni zero-copy I/O.
- El modo de pensamiento esta deshabilitado y la plantilla de chat local se usa tal cual, sin adaptaciones.
- Existe riesgo de alucinacion tipico de un modelo pequeno, agravado por el contexto muy corto.
- La metadata del tokenizador puede anunciar una longitud de contexto mucho mayor que la real; no se debe confiar en ese valor para dimensionar prompts.

## Enlaces

- Repo en HuggingFace: https://huggingface.co/thomasfchrr/Spark-X2.5-1.7B-CopilotPlus-NPU
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- GitHub del proyecto: https://github.com/XHToken/Spark-X2.5
- Pagina en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-1.7B
