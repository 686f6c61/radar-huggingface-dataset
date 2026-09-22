# Tdamre/limite-1b-violetto-GGUF-LiteRT

## Resumen

limite-1b-violetto-GGUF-LiteRT es un conjunto de conversiones cuantizadas publicadas por el usuario Tdamre a partir del modelo paradigma-inc/limite-1b-violetto, un modelo de razonamiento matematico de 1.068.799.406 parametros con una arquitectura propia denominada Limite. El repositorio no contiene un modelo nuevo ni reentrenado: ofrece los mismos pesos en dos formatos de despliegue, GGUF (seis niveles de cuantizacion) y LiteRT-LM (precision mixta INT4/INT8), bajo licencia Apache 2.0.

La relevancia de esta publicacion es doble. Por un lado, permite ejecutar un modelo de razonamiento matematico de ~1 B de parametros en CPU y en hardware de consumo, con ventanas de contexto de 16.384, 32.768 o 65.536 tokens dentro de los 131.072 posiciones que conserva la metadata original. Por otro, es un caso poco habitual de arquitectura personalizada que no funciona con llama.cpp ni Ollama estandar: los GGUF requieren un parche de llama.cpp incluido en el propio repositorio, y los bundles LiteRT-LM solo se han probado con el backend de CPU de LiteRT-LM 0.17.0.

Conviene subrayar que Violetto no es un asistente conversacional general. Segun la model card, se trata de un modelo ligeramente ajustado por instrucciones, de un solo turno, especializado en matematicas, con un system prompt matematico fijo heredado del modelo original. La plantilla rechaza system prompts personalizados y herramientas, por lo que su uso previsto es la resolucion de problemas matematicos y la generacion de texto, no el chat multi-turno ni el tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Limite (arquitectura personalizada del modelo original; conserva puertas Limite, mezcladores residuales densos y tablas rotatorias) |
| Parametros totales | 1.068.799.406 |
| Parametros activos | no aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 131.072 posiciones en la metadata original; contextos de ejecucion de 16.384, 32.768 y 65.536 tokens |
| Tipos de cuantizacion | GGUF: Q2_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0. LiteRT-LM: INT4/bloque32 (OCTAV) en Q/K/V y en las proyecciones gate/up de la red feed-forward, e INT8 con computo en coma flotante en las proyecciones de salida de atencion/down y en las tablas de vocabulario |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y LiteRT-LM (.litertlm) |

Datos adicionales de la conversion LiteRT: cada fichero contiene 519.045.120 parametros de peso INT4 almacenados fisicamente y 516.096.000 parametros INT8, auditados tras la exportacion. Las puertas pequenas permanecen en coma flotante; las interfaces del grafo y las caches KV son float32.

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura personalizada llamada Limite, que el proceso de conversion preserva intacta. La model card menciona explicitamente la conservacion de las puertas Limite sensibles, los mezcladores residuales densos y las tablas rotatorias, y senala que el runtime maneja activaciones feed-forward grandes sin recortar la funcion aprendida. No se describe en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; lo unico indicado es que Violetto es un modelo ligeramente ajustado por instrucciones, de un solo turno, orientado a razonamiento matematico.

La conversion no implico reentrenamiento alguno. Cada checkpoint se calibro por separado sobre 327.680 tokens extraidos de un corpus deterministico de entrenamiento de GSM8K y MBPP, y se generaron matrices de importancia (imatrix) incluidas en el repositorio junto con los scripts de reproduccion y las comprobaciones de validacion. Los GGUF proceden del exportador publico de Unsloth combinado con una matriz de importancia especifica del modelo; el autor aclara que no son releases oficiales de Unsloth ni estan etiquetados como Dynamic v2/v3, porque el generador privado exacto no estaba disponible. La validacion cubre los seis GGUF en los tres contextos, logits finitos en la ultima posicion, comparaciones numericas, generacion con cache, formas de cache compiladas en LiteRT e identidad exacta del tokenizador, plantilla y grafo empaquetados.

## Capacidades

- Generacion de texto y razonamiento matematico de un solo turno: el modelo esta ajustado para resolver problemas matematicos con un system prompt fijo heredado del modelo original.
- Conversacion limitada mediante plantilla: con `llama-server` y la plantilla Jinja embebida se puede usar el modo Violetto, pero solo con mensajes de usuario.
- Completado de texto sin plantilla: los bundles LiteRT-LM admiten `--no-template` para usar el checkpoint base como modelo de completado.
- Contexto largo: 16.384, 32.768 o 65.536 tokens segun el preset o bundle elegido, sobre un maximo declarado de 131.072 posiciones.
- Ejecucion en CPU: los grafos LiteRT-LM estan pensados y probados para backend de CPU, con cache en disco y APIs asincronas de Python para generaciones largas.
- Ejecucion con aceleracion en llama.cpp: el ejemplo oficial usa `-ngl 99`, por lo que el runtime parcheado permite descargar capas a GPU.
- Sin soporte de tool calling ni function calling: la plantilla rechaza las herramientas.
- Sin soporte de system prompts personalizados.
- Sin control de modo pensamiento on/off: el razonamiento es texto generado por el modelo y el bundle no expone un conmutador.
- Sin capacidades de vision ni audio descritas.
- Capacidades multilingues: no disponible.

## Casos de uso

- Resolucion de problemas matematicos en entornos aislados: con el bundle LiteRT-LM de 0,783 GiB y backend de CPU, el modelo puede desplegarse en maquinas sin GPU ni acceso a red, algo util en laboratorios o entornos regulados donde no se permite enviar datos a APIs externas.
- Generacion de datos sinteticos de razonamiento matematico: los scripts de reproduccion y las matrices de calibracion incluidos permiten replicar el pipeline de calibracion sobre 327.680 tokens de GSM8K y MBPP, y reutilizar el modelo para producir trazas de razonamiento a escala.
- Inferencia en el borde con LiteRT-LM: el formato `.litertlm` esta disenado para despliegues tipo on-device, con bundles de 16.384, 32.768 y 65.536 tokens; es adecuado para prototipos en dispositivos con memoria suficiente, teniendo en cuenta que esta version no certifica GPU, NPU ni telefonos fisicos.
- Investigacion sobre cuantizacion mixta INT4/INT8: los ficheros LiteRT separan proyecciones INT4/bloque32 de tablas INT8 con computo flotante, lo que permite estudiar el impacto de la precision por tipo de capa comparando con los GGUF equivalentes.
- Evaluacion de arquitecturas personalizadas en llama.cpp: los GGUF sirven como banco de pruebas para el parche Limite incluido, comparando su comportamiento frente a un llama.cpp estandar que no implementa esta arquitectura.
- Atencion de enunciados matematicos extensos: con el preset de 65.536 tokens se pueden procesar problemas con desarrollos largos, demostraciones por pasos o contextos con multiples enunciados encadenados en una sola peticion.
- Integracion en pipelines de validacion de cuantizaciones: la tabla de divergencia KL y coincidencia de token mas probable, junto con `validation.json` y `validation_inputs.json`, permite usar el repositorio como referencia reproducible para verificar exportaciones propias.
- Asistencia matematica puntual en herramientas de linea de comandos: mediante `llama-completion` con `--no-context-shift` y prompts de tipo completado, el modelo puede integrarse en scripts de terminal para calculo y verificacion de resultados simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar en la model card ni en los resultados de busqueda web.

Lo unico que se publica es una medida de fidelidad de la cuantizacion frente al checkpoint FP32 de origen, con prompt corto:

| Fichero GGUF | Tamano (GiB) | Divergencia KL frente al FP32 de origen | Coincidencia con el token mas probable |
|---|---:|---:|---:|
| Q2_K_L | 0,457 | 0,61464 | 74,4% |
| Q3_K_M | 0,592 | 0,15050 | 74,4% |
| Q4_K_M | 0,684 | 0,05909 | 83,7% |
| Q5_K_M | 0,769 | 0,03647 | 88,4% |
| Q6_K | 0,859 | 0,01661 | 86,0% |
| Q8_0 | 1,093 | 0,00719 | 97,7% |

El propio autor advierte que los ficheros de menor precision intercambian una perdida sustancial de exactitud por tamano. Los bundles LiteRT-LM se validaron con 43 posiciones del prompt formateado de Violetto y 48 posiciones agrupadas, segun la informacion disponible.

## Requisitos de hardware

- Peso en disco de los GGUF: entre 0,457 GiB (Q2_K_L) y 1,093 GiB (Q8_0). Los bundles LiteRT-LM ocupan entre 0,783 y 0,830 GiB, pero requieren memoria adicional para pesos, buffers temporales, preparacion del delegado y otras asignaciones del runtime.
- Cache KV de LiteRT-LM: 1,5 GiB para 16.384 tokens, 3,0 GiB para 32.768 tokens y 6,0 GiB para 65.536 tokens. A esto hay que sumar pesos y buffers, por lo que el bundle de 64K esta pensado para dispositivos con memoria abundante.
- GPU de consumo: con pesos de 0,46 a 1,09 GiB, el modelo cabe con holgura en cualquier GPU de consumo actual (por ejemplo, 8 GB de VRAM o mas), reservando VRAM adicional para la cache KV y las activaciones. En el ejemplo oficial de GGUF se usa `-ngl 99` sobre un runtime de llama.cpp parcheado.
- Backend obligatorio en LiteRT-LM: solo CPU. El delegado de GPU probado rechaza operaciones presentes en estos grafos.
- GPU de centro de datos: no disponible en la informacion proporcionada; no se documentan pruebas con A100, H100 ni similares.
- Opciones de despliegue: llama.cpp con el parche Limite incluido en el repositorio (`llama-completion`, `llama-server`), y LiteRT-LM 0.17.0 mediante CLI o APIs asincronas de Python, con backend CPU y cache en disco.
- Incompatibilidad de despliegue: las compilaciones estandar de llama.cpp y Ollama no implementan esta arquitectura en esta release, por lo que no pueden cargar estos GGUF sin el parche.
- Latencia y throughput: no disponible. Cualitativamente, la release prioriza la fidelidad numerica y el autor advierte que la preparacion en CPU y la inferencia con contextos grandes pueden ser lentas. La decodificacion sincrona de LiteRT-LM 0.17.0 tiene un limite de diez minutos, por lo que se recomienda la ruta de streaming del CLI o las APIs asincronas de Python.
- VRAM estimada para inferencia: no disponible como cifra publicada. Como referencia aritmetica, los pesos cuantizados van de 0,46 a 1,09 GiB y hay que anadirles cache KV y activaciones.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos proceden de conocimiento general y no estan verificados en la informacion de esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en formatos cuantizados |
|---|---|---|---|---|
| limite-1b-violetto (GGUF/LiteRT de Tdamre) | 1.068.799.406 | 131.072 posiciones en metadata; ejecucion a 16.384, 32.768 o 65.536 | Apache 2.0 | GGUF (6 niveles) y LiteRT-LM, con runtime parcheado obligatorio para GGUF |
| Llama 3.2 1B Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Licencia comunitaria de Llama 3.2 | Amplia, con soporte nativo en llama.cpp y Ollama |
| Qwen2.5 1.5B Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 | Amplia, con soporte nativo en llama.cpp y Ollama |
| Gemma 2 2B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Terminos de uso de Gemma | Amplia, con soporte nativo en llama.cpp y Ollama |

La diferencia estructural relevante frente a esas alternativas no es el rendimiento, sino la compatibilidad: limite-1b-violetto usa una arquitectura propia que ninguna herramienta estandar implementa de serie, mientras que los modelos citados funcionan en los runtimes habituales sin parches.

## Limitaciones y advertencias

- No es un asistente general: la model card indica explicitamente que la plantilla rechaza system prompts personalizados y herramientas, y que el modelo es de un solo turno.
- No hay soporte de tool calling ni de function calling, lo que descarta su uso directo en pipelines de agentes.
- No existe control de modo pensamiento: no se puede activar o desactivar el razonamiento desde el bundle.
- Los GGUF requieren un parche de llama.cpp incluido en el repositorio. Las compilaciones estandar de llama.cpp y Ollama no implementan la arquitectura y fallaran al cargar los ficheros.
- En LiteRT-LM solo se ha probado el backend de CPU; el delegado de GPU rechaza operaciones de estos grafos. No hay certificacion en GPU, NPU ni dispositivos fisicos Android o iOS en esta release.
- Las cuantizaciones de menor precision pierden exactitud de forma notable: Q2_K_L presenta una divergencia KL de 0,61464 y Q3_K_M de 0,15050 frente al FP32 de origen, con una coincidencia de solo el 74,4% en el token mas probable en ambos casos.
- Riesgo de alucinacion: no se han publicado resultados en pruebas estandar, de modo que no hay evidencia publica sobre la tasa de error en tareas matematicas fuera de las comprobaciones internas de fidelidad de cuantizacion.
- La decodificacion sincrona de LiteRT-LM 0.17.0 tiene un limite de diez minutos; en contextos grandes la CPU puede ser lenta.
- La release prioriza la fidelidad numerica sobre la velocidad, segun el propio autor.
- Idiomas soportados: no disponible. No se puede confirmar el comportamiento multilingue.
- Sesgos conocidos: no disponible.
- La conversion no reentrena el modelo, por lo que hereda todas las limitaciones del checkpoint base paradigma-inc/limite-1b-violetto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y la procedencia de los datos de calibracion antes de un despliegue en produccion.
- Adopcion nula verificada: el repositorio registra 0 descargas y 0 likes, y las conversiones son comunitarias, no oficiales de Unsloth ni del autor del modelo original.
- Los ficheros se publicaron el 22 de septiembre de 2026 y no consta validacion por terceros independientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT
- Modelo base: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Presets de contexto: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT/tree/main/presets
- Matriz de importancia y calibracion: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT/tree/main/calibration
- Instrucciones del runtime Limite para llama.cpp: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT/blob/main/runtime/README.md
- Scripts de reproduccion: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT/blob/main/REPRODUCE.md
- Evidencia de validacion: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT/blob/main/validation.json
- Entradas fijas de validacion: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT/blob/main/validation_inputs.json
- Ficheros GGUF: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT/tree/main/gguf
- Ficheros LiteRT-LM: https://huggingface.co/Tdamre/limite-1b-violetto-GGUF-LiteRT/tree/main/litert
- Resultados de busqueda web: la unica entrada devuelta es un enlace no relacionado a Google Mail (https://mail.google.com/mail?hl=de), sin informacion util sobre el modelo.
