# xirllm/xir-finetune

## Resumen

xir-finetune es un adaptador PEFT (LoRA) publicado por el usuario xirllm sobre el checkpoint XHToken/Spark-X2.5-4B, al que el autor denomina XIR LLM. No es un modelo entrenado desde cero, sino el resultado de un ajuste fino supervisado orientado a fijar la identidad del asistente: nombre, origen, capacidades, límites y rechazo explícito de identificarse como otros modelos. El repositorio incluye además la pila de código de entrenamiento, el dataset sintético de identidad y un cuaderno para Colab con TPU v5e.

Su rasgo más distintivo no es el adaptador en sí, sino la herramienta de ajuste: un CLI que resuelve automáticamente dos decisiones habituales. El flag `--device auto` sondea TPU, CUDA, XPU, MPS y CPU en ese orden y se queda con el primer acelerador operativo, degradando al siguiente candidato si una instalación está incompleta. El flag `--method auto` elige LoRA por defecto y solo recurre a QLoRA cuando la tarjeta no puede alojar los pesos congelados en bf16.

El modelo base es un checkpoint de aproximadamente 4.000 millones de parámetros con código remoto personalizado (`modeling_spark.py`), lo que obliga a fijar `transformers==4.57.1` para evitar un fallo conocido en la versión 5.x. La licencia del adaptador, del código y del checkpoint base es Apache-2.0. A fecha de la ficha el repositorio acumula 0 descargas y 0 likes, y no publica resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; el checkpoint base carga codigo remoto personalizado (`auto_map -> modeling_spark.py`) y expone configuracion de RoPE, compatible con un transformer con atencion rotatoria |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base (inferido del nombre Spark-X2.5-4B; la ficha no lo declara de forma explicita); el adaptador anade matrices LoRA de rango 16 segun el ejemplo del autor |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible; el ejemplo de entrenamiento del autor usa `--max-len 1024`, que es un parametro de entrenamiento y no la ventana de inferencia |
| Tipos de cuantizacion | Base en bf16 con adaptadores LoRA en fp32; QLoRA (NF4 de bitsandbytes) solo disponible en CUDA, ya que bitsandbytes no tiene rueda para TPU |
| Idiomas soportados | No declarados en los metadatos; el tag `russian` del repositorio y el dataset de identidad (147 filas en ruso, 22 en ingles) apuntan al ruso como idioma principal |
| Licencia | Apache-2.0 (adaptador, codigo y checkpoint base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) mas `adapter_config.json`; los pesos del modelo base no se copian en el repositorio |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Segun la documentacion, PEFT mantiene las matrices LoRA en fp32 sobre la base en bf16, una decision verificada por el test `llm/tests/test_finetune.py::test_adapters_stay_fp32_on_bf16_base`, con el argumento de que los estados del optimizador en bf16 descartarian silenciosamente actualizaciones pequenas. La eleccion entre LoRA y QLoRA es automatica: QLoRA depende de bitsandbytes NF4, que es exclusivo de CUDA y no dispone de rueda para TPU, de modo que forzarlo fuera de CUDA aborta con un mensaje explicito en lugar de fallar a mitad del primer paso.

El entrenamiento se realiza sobre `datasets/text/sft/xir_identity_sft.jsonl`: 169 filas (147 en ruso y 22 en ingles), 47 KB, preguntas unicas, sinteticas y escritas especificamente para el proyecto. El formato es una lista de mensajes sin mensaje de sistema y la perdida se calcula unicamente sobre los tokens del asistente, quedando los turnos de sistema y usuario enmascarados con `-100`. El ejemplo de comando usa rango 16, alpha 32, 3 epocas, micro-batch 1, acumulacion de gradiente 8, `max-len 1024` y learning rate 2e-4. La salida del proceso incluye el adaptador, un `finetune_meta.json` con dispositivo, metodo, dtype, rango, learning rate, modulos objetivo y historial de perdida, y una copia de `tokenizer_config.json`.

Una restriccion tecnica relevante es la version de la libreria: `transformers` se fija a 4.57.1 porque el checkpoint Spark incluye codigo remoto escrito contra la serie 4.x, y la 5.x rechaza su configuracion de RoPE con `AttributeError: 'float' object has no attribute 'get'`. El script se niega a arrancar con versiones 5 o superiores salvo que se pase `--force`.

## Capacidades

- Ajuste fino supervisado de un modelo de generacion de texto mediante LoRA y QLoRA, con perdida enmascarada a los turnos del asistente.
- Seleccion automatica de dispositivo entre TPU, CUDA, XPU, MPS y CPU, con sondeo individual tolerante a fallos y reordenacion mediante la variable de entorno `XIR_DEVICE_PRIORITY`.
- Seleccion automatica de metodo: LoRA por defecto, QLoRA cuando no caben los pesos congelados en bf16 y el acelerador es CUDA.
- Entrenamiento en TPU v5e desde Colab mediante `llm/kaggle/colab_finetune_tpu.ipynb`.
- Acepta varios formatos de dataset: mensajes conversacionales, pares `prompt`/`completion` e `instruction`/`output`.
- Modelado de identidad del asistente: nombre, origen, capacidades, limites y rechazo de otras denominaciones (GPT, Claude, Spark), segun el contenido del dataset incluido.
- El modelo base, segun la descripcion del dataset de identidad, cuenta con su propio tokenizador BPE, su propio decodificador y un codificador de vision; no se documenta en la ficha ninguna interfaz de inferencia ni soporte de tool calling, agentes o modo de razonamiento explicito.
- Soporte de pruebas offline: las suites `test_device.py` (10 casos) y `test_finetune.py` (22 casos) se ejecutan sin red sustituyendo el modelo por uno de 2 capas y un tokenizador falso.

## Casos de uso

- Personalizacion de identidad de un asistente en ruso: el adaptador se entrena especificamente para que el modelo se identifique siempre como XIR LLM, conozca su origen y sus limites, y rechace nombres de terceros. Es el caso de uso para el que existe el dataset incluido.
- Ajuste fino en TPU sin acceso a GPU: en una TPU v5e de 16 GiB de HBM el LoRA en bf16 cabe con unos 8,2 GiB de pesos congelados mas unos cientos de MB de adaptadores, y el script evita automaticamente QLoRA porque bitsandbytes no soporta TPU.
- Entrenamiento en parques heterogeneos: el sondeo de dispositivo permite reutilizar el mismo script en nodos con CUDA, XPU, MPS o CPU sin mantener variantes distintas, algo util en pipelines internos donde no todos los ejecutores tienen el mismo acelerador.
- Distribucion ligera de personalizaciones: como el repositorio solo contiene el adaptador y no copia los pesos base, cada variante de identidad o de dominio ocupa unos pocos cientos de megabytes y se puede versionar por separado.
- Ajuste en GPU de gama baja o VRAM limitada: cuando la tarjeta no puede alojar los pesos congelados en bf16, el modo automatico pasa a QLoRA con cuantizacion NF4 sobre CUDA.
- Adaptacion de dominio con datos propios en formato de instrucciones: el cargador acepta `prompt`/`completion` e `instruction`/`output` ademas de conversaciones con roles, lo que facilita reutilizar corpus ya existentes sin reformatear.
- Integracion en pruebas de regresion de entrenamiento: las suites offline permiten validar la eleccion de metodo y dtype, el enmascaramiento de perdida y el bucle completo sin descargar el checkpoint ni consumir acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, y tampoco se aporta comparacion cuantitativa con el checkpoint base sin adaptar.

## Requisitos de hardware

- TPU v5e con 16 GiB de HBM: configuracion documentada y validada; el LoRA en bf16 ocupa aproximadamente 8,2 GiB de pesos congelados mas unos cientos de megabytes de adaptadores.
- CUDA: necesaria para el modo QLoRA, ya que bitsandbytes NF4 no tiene soporte fuera de CUDA.
- XPU, MPS y CPU: soportados por el sondeo de dispositivo del script de entrenamiento; no se documenta ninguna cifra de rendimiento ni de memoria para estas rutas.
- GPU de consumo: no disponible. El repositorio no indica que tarjetas concretas (RTX 4090, etc.) se han probado ni si el ajuste cabe en ellas.
- Opciones de despliegue en inferencia: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI. La unica indicacion tecnica es que la carga del modelo base requiere `transformers==4.57.1` y la ejecucion de codigo remoto del checkpoint Spark.
- Latencia y throughput: no disponible, no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xirllm/xir-finetune (adaptador LoRA sobre Spark-X2.5-4B) | Base de ~4B mas adaptador de rango 16 | No disponible | Sin benchmarks publicados | Apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| XHToken/Spark-X2.5-4B (modelo base) | ~4B, inferido del nombre | No disponible | No disponible en esta ficha | Apache-2.0 | HuggingFace |
| Adaptadores PEFT comparables de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas documentadas en la informacion proporcionada |

No se dispone de datos suficientes para establecer una comparacion cuantitativa con otros adaptadores de ajuste de identidad o con modelos de tamano similar.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni medicion de la degradacion que el ajuste de identidad pueda causar en otras capacidades.
- Riesgo de sobreajuste y de olvido catastrofico: el dataset tiene 169 filas orientadas casi en exclusiva a identidad y, segun el propio autor, todas las respuestas nombran al modelo, lo que puede sesgar el estilo de salida.
- Idiomas: el corpus de ejemplo es mayoritariamente ruso (147 de 169 filas) con 22 filas en ingles; el comportamiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto: no se declara la ventana de inferencia; el valor de 1024 del ejemplo es solo la longitud maxima de secuencia durante el ajuste.
- Dependencia de version: el modelo base requiere `transformers==4.57.1`; con la serie 5.x falla al construir la configuracion de RoPE. Ademas, la carga implica ejecutar codigo remoto (`trust_remote_code`), lo que supone un riesgo de seguridad en entornos no controlados.
- QLoRA esta limitado a CUDA por la dependencia de bitsandbytes; en TPU, XPU, MPS o CPU solo es viable LoRA en bf16 o en el dtype disponible.
- Procedencia de los datos: el dataset es sintetico y generado por el autor, sin proceso de curacion ni auditoria externa documentado, por lo que no se puede descartar la propagacion de sesgos presentes en el modelo base.
- Alucinacion: no se documenta ninguna evaluacion de veracidad ni mecanismo de mitigacion; un ajuste centrado en identidad no aporta garantias sobre la factualidad de las respuestas.
- Licencia: Apache-2.0 tanto en el adaptador y el codigo como en el checkpoint base, lo que en principio permite uso comercial, pero la ausencia de evaluacion hace recomendable validar el comportamiento antes de llevarlo a produccion.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin historial de mantenimiento ni issues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xirllm/xir-finetune
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Licencia del repositorio: `LICENSE` (Apache-2.0, referenciada en la model card)
- Cuaderno de Colab para TPU v5e: `llm/kaggle/colab_finetune_tpu.ipynb` (ruta dentro del repositorio, sin URL publica indicada)
- Script de ajuste fino: `llm/finetune.py`; sonda de dispositivo: `llm/xir/device.py`; pruebas: `llm/tests/test_device.py` y `llm/tests/test_finetune.py`
- Dataset de identidad: `datasets/text/sft/xir_identity_sft.jsonl`
- No se han encontrado en la busqueda web enlaces relevantes para este modelo: los resultados obtenidos corresponden a XIR de Xilinx/Vitis-AI (representacion intermedia de grafos), a documentacion de ajuste fino de Azure Databricks y Microsoft Learn, y al framework xLLM de ifm-ai, ninguno relacionado con xir-finetune.
