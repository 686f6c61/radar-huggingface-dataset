# taobao-mnn/Qwen2.5-Math-7B-Instruct-MNN

## Resumen

Qwen2.5-Math-7B-Instruct-MNN es un paquete de inferencia en formato MNN del modelo Qwen2.5-Math-7B-Instruct, desarrollado por el equipo taobao-mnn (Alibaba). No se trata de un modelo nuevo entrenado desde cero, sino de una conversion cuantizada del modelo base de Qwen para ejecutarse sobre el motor MNN, orientado a despliegue en CPU y dispositivos con recursos limitados. El modelo base esta especializado en razonamiento matematico y resuelve problemas de aritmetica, ecuaciones y enunciados verbales con capacidad de generar cadenas de razonamiento.

La relevancia de este paquete radica en que permite ejecutar un modelo de 7.000 millones de parametros con cuantizacion HQQ de 4 bits sobre CPU con 4 hilos y configuracion de memoria baja, sin necesidad de GPU. La arquitectura subyacente es un transformer qwen2 de 28 capas, con pesos cuantizados a 4 bits en el cuerpo del lenguaje y en la cabeza de salida LM, mientras que las embeddings se mantienen en BF16 en un fichero separado.

Es importante senalar que la propia model card advierte de limitaciones de calidad: las respuestas a problemas cortos son correctas, pero en problemas matematicos largos la salida puede ser coherente sin ser numericamente exacta. El autor indica explicitamente que las respuestas y derivaciones matematicas deben verificarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer qwen2, 28 capas |
| Parametros totales | 7B (heredados del modelo base Qwen2.5-Math-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configurable via llm_config.json; no verificado en la model card) |
| Tipos de cuantizacion | HQQ 4-bit, group=128, alpha_bytes=2 (FP16); embeddings en BF16 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (paquete de inferencia con ficheros binarios; embeddings_bf16.bin en BF16) |

## Arquitectura y entrenamiento

El modelo es una conversion del Qwen2.5-Math-7B-Instruct original a formato MNN. La arquitectura es un transformer qwen2 de 28 capas. El proceso de conversion aplica cuantizacion HQQ (Half-Quadratic Quantization) de 4 bits con tamano de grupo 128 y alpha en FP16, tanto al cuerpo del lenguaje como a la cabeza de salida LM. Las embeddings de entrada se almacenan por separado en `embeddings_bf16.bin` en precision BF16. El commit de conversion indicado es `b0239771b07b317a258fbc384683bbd540741406`.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada; esos detalles corresponden al modelo base Qwen2.5-Math-7B-Instruct y no se detallan en esta model card. La innovacion tecnica del paquete es el propio pipeline de cuantizacion y empaquetado para MNN, con configuracion de ejecucion por defecto en CPU (thread_num=4, precision=low, memory=low). La version de MNN validada es 3.6.2, con compilacion que habilita MNN_BUILD_LLM y MNN_LOW_MEMORY.

## Capacidades

- Generacion de texto orientada a razonamiento matematico: aritmetica, resolucion de ecuaciones, problemas verbales y problemas largos.
- Generacion de cadenas de razonamiento paso a paso (el modelo base es un modelo instruct de matematicas).
- Soporte de instrucciones en chino e ingles.
- Inferencia en CPU sin GPU, con precision baja y memoria baja por defecto.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni thinking mode explicito en la informacion disponible.

## Casos de uso

- Verificacion asistida de calculos en entornos sin GPU: el modelo puede ejecutarse en un portatil o servidor CPU con 4 hilos para comprobar operaciones aritmeticas y ecuaciones sencillas, donde la model card confirma respuestas correctas en problemas cortos.
- Prototipado de tutoria matematica offline: al ejecutarse integramente en local via MNN, permite desplegar un asistente de resolucion de problemas en entornos sin conectividad ni aceleradores.
- Educacion y generacion de ejercicios: el modelo puede producir enunciados y derivaciones de problemas matematicos en chino e ingles para materiales didacticos, siempre con revision humana por las limitaciones de exactitud en problemas largos.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir el impacto de HQQ 4-bit frente al modelo original en tareas de aritmetica y algebra, dado que la model card documenta pruebas de `arithmetic`, `equation`, `word_problem` y `long_problem`.
- Despliegue en dispositivos de borde: el formato MNN y la configuracion de memoria baja estan pensados para entornos con recursos restringidos, aunque el autor no ha verificado ARM FP16, GPU ni moviles.
- Filtrado y clasificacion de problemas matematicos: el modelo puede etiquetar o reformular enunciados matematicos en pipelines de procesamiento de datos, aprovechando su especializacion en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval u otros) en la informacion disponible. La model card unicamente documenta una verificacion cualitativa realizada el 2026-11-20 en CPU x64 sobre las categorias `arithmetic`, `equation`, `word_problem` y `long_problem`: las comprobaciones de estructura y EOS natural pasan, pero la precision exacta en `long_problem` falla y fue aceptada manualmente, con resultado automatico de precision en false. El autor cita como ejemplo que en un problema largo el modelo da 240/198 por defecto frente a la respuesta correcta 223.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo por defecto (CPU); el repo ocupa 9,9 GB, pero la cuantizacion HQQ 4-bit reduce el peso efectivo en memoria respecto al modelo en BF16.
- GPU recomendadas: no verificadas por el autor; la model card indica que GPU y ARM FP16 no han sido validados.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: motor MNN (version validada 3.6.2, commit `2c0b58a001bd13dbb9cfac98a533e2e7e96b1b44`), compilado con MNN_BUILD_LLM y MNN_LOW_MEMORY; ejecucion mediante `./MNN/build/llm_demo ./Qwen2.5-Math-7B-Instruct-MNN/config.json prompt.txt`.
- Configuracion por defecto: CPU, thread_num=4, precision=low, memory=low.
- Latencia y throughput: no disponibles; el autor no publica mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-Math-7B-Instruct-MNN (este) | 7B | no disponible | HQQ 4-bit | Apache 2.0 | MNN |
| Qwen2.5-Math-7B-Instruct (base) | 7B | no disponible en esta ficha | BF16 original | Apache 2.0 | safetensors (formato original de Qwen) |
| Alternativas de 7B matematicos en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento del modelo base ni de alternativas comparables para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Precision matematica no garantizada: la model card advierte que en problemas largos la salida puede ser coherente pero incorrecta (ejemplo documentado: 240/198 frente a 223). Toda respuesta debe verificarse de forma independiente.
- La verificacion automatica de precision en `long_problem` falla; el resultado de precision automatica es false.
- No se han validado ARM FP16, GPU, dispositivos moviles, contexto maximo ni rendimiento.
- Idiomas limitados a chino e ingles; no se documenta soporte de castellano.
- Riesgo de alucinacion inherente al modelo base, agravado por la cuantizacion de 4 bits.
- Licencia Apache 2.0 heredada del modelo base; el paquete es una conversion cuantizada y no amplia la autorizacion del modelo original. La licencia de las herramientas MNN no sustituye la licencia del modelo.
- El paquete debe usarse como un conjunto coherente: no mezclar revisiones y conservar `config.json` y `llm_config.json` con los ajustes de muestreo, contexto y plantilla.
- No se documentan capacidades de tool calling, agentes ni vision; no asumir su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen2.5-Math-7B-Instruct-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen2.5-Math-7B-Instruct/summary
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
- Ficheros de configuracion del paquete: `config.json`, `llm_config.json`, `export_args.json`, `refresh_metadata.json`, `LICENSE` (incluidos en el repositorio)
