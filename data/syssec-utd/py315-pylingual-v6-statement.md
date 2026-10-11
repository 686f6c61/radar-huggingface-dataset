# syssec-utd/py315-pylingual-v6-statement

## Resumen

`syssec-utd/py315-pylingual-v6-statement` es un modelo de la familia pylingual publicado por el UTD Systems Security Lab (Universidad de Texas en Dallas), el mismo grupo que mantiene la herramienta de decompilacion de Python `pylingual`. Por el identificador (`py315`, `v6`, `statement`) y por el conjunto de datos asociado (`statement-py315-pylingual-v6-tokenized`, 17,5 millones de filas, 17,2 de ellas de entrenamiento), todo apunta a un modelo especializado en la traduccion de bytecode de Python 3.15 a codigo fuente Python, trabajando a nivel de sentencia. Esto lo situa en el ambito de la ingenieria inversa y el analisis de seguridad, no en el de la generacion de texto generalista.

Tecnicamente se trata de un modelo secuencia-a-secuencia basado en la arquitectura T5, con 222.882.048 parametros totales segun los pesos en safetensors. Ese recuento coincide practicamente con el de T5-base, aunque la informacion disponible no confirma si se trata de un ajuste fino de T5-base o de un entrenamiento propio con esa misma configuracion. El repositorio ocupa 10,7 GB, un tamano muy superior al de los pesos en precision completa (en torno a 0,9 GB en FP32), lo que sugiere la presencia de checkpoints intermedios, estados del optimizador y registros de TensorBoard (la etiqueta `tensorboard` aparece en el modelo).

Se trata de un modelo muy poco difundido (6 descargas y 0 likes en el momento de redactar esta ficha) y sin ficha de modelo publicada por el autor: no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de evaluacion. Su relevancia es, por tanto, acotada: interesa a quien investigue decompilacion automatica de Python o quiera reproducir los resultados del proyecto pylingual, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder), segun la etiqueta `t5` del repositorio |
| Parametros totales | 222.882.048 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible (por la naturaleza de la tarea, la entrada y la salida son codigo Python, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta `safetensors`; el repositorio incluye ademas artefactos de TensorBoard) |

Datos adicionales: tamano del repositorio 10,7 GB; fecha de creacion 2026-10-09; ultima actualizacion 2026-10-11.

## Arquitectura y entrenamiento

La etiqueta `t5` y el recuento de parametros (222.882.048) indican una arquitectura transformer encoder-decoder de tipo T5, en una configuracion de tamano comparable a T5-base (en torno a 220 millones de parametros). Se desconoce la configuracion exacta de capas, dimensiones ocultas y cabezas de atencion, asi como la longitud de contexto con la que fue entrenado, ya que el autor no ha publicado ficha de modelo ni configuracion en la informacion disponible.

Respecto a los datos de entrenamiento, la unica evidencia es el conjunto de datos asociado `syssec-utd/statement-py315-pylingual-v6-tokenized`, con 17,5 millones de filas en total y 17,2 millones en el split de entrenamiento, distribuido en formato Parquet. El nombre del dataset y del modelo (`py315`, `statement`) apunta a pares de bytecode y sentencias de Python 3.15. No hay informacion publica sobre el numero de tokens procesados, la composicion exacta del corpus, ni sobre si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) o decodificacion especulativa. El repositorio `syssec-utd/pylingual` en GitHub es la referencia del proyecto mas amplio en el que se enmarca este modelo.

## Capacidades

- Traduccion de bytecode de Python a codigo fuente, presumiblemente a nivel de sentencia, segun indican el nombre del modelo y el dataset asociado.
- Generacion de texto secuencia a secuencia: al ser un modelo T5, la tarea se formula como texto-a-texto.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues en lenguaje natural.
- No hay informacion sobre modos especiales (thinking mode, vision, audio, decodificacion especulativa).
- No hay informacion sobre si el modelo conserva capacidades generales de T5 heredadas del preentrenamiento.

## Casos de uso

- Analisis de malware escrito en Python: el modelo permitiria recuperar codigo fuente legible a partir de bytecode ofuscado o compilado, facilitando la revision manual por parte de analistas de seguridad.
- Ingenieria inversa de paquetes Python sin codigo fuente: util para auditar dependencias de terceros distribuidas unicamente como `.pyc` en entornos de produccion.
- Recuperacion de codigo tras perdida de fuentes: a partir de artefactos compilados desplegados en un sistema, el modelo podria reconstruir una aproximacion del codigo original para su mantenimiento.
- Investigacion academica en decompilacion: el modelo y su dataset asociado sirven como punto de partida reproducible para comparar tecnicas de decompilacion neuronal frente a decompiladores clasicos como el propio `pylingual`.
- Formacion de modelos mayores: el dataset de 17,2 millones de filas puede emplearse para destilar o ajustar modelos de decompilacion de mayor tamano.
- Deteccion de codigo malicioso o de puertas traseras: la reconstruccion del fuente permite aplicar analisis estatico convencional (linters, analizadores de flujo) sobre artefactos que de otro modo no serian inspeccionables.
- Verificacion de integridad de despliegues: comparar el codigo decompilado por el modelo con el fuente original almacenado en un repositorio puede ayudar a detectar manipulaciones en binarios desplegados.

En todos los casos, la adecuacion del modelo es una inferencia a partir de su nombre, su dataset y la etiqueta `t5`; no se han publicado evaluaciones que la confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 222.882.048 parametros: en torno a 0,9 GB en FP32, 0,45 GB en FP16/BF16 y 0,11-0,23 GB en cuantizaciones de 4-8 bits, sin contar el coste de activaciones ni de la cache de atencion (que depende de una longitud de contexto no publicada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 cubren el requisito con holgura.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente para la carga en FP32.
- Opciones de despliegue: la arquitectura T5 es soportada por Hugging Face Transformers, por vLLM y por TGI (Text Generation Inference). El soporte en llama.cpp/Ollama no esta confirmado en la informacion disponible, y no se publican pesos en formato GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 223 M de parametros, la latencia deberia ser muy baja en GPU moderna, pero no hay cifras publicadas.
- Nota sobre el repositorio: los 10,7 GB de tamano del repo no corresponden al peso de los parametros, sino a checkpoints y registros adicionales; la descarga completa puede ser innecesaria si solo se quieren los safetensors finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syssec-utd/py315-pylingual-v6-statement | 222.882.048 | no disponible | Decompilacion de Python (bytecode a fuente) | no disponible | Hugging Face, 6 descargas |
| T5-base (google) | ~220 M | 512 tokens (configuracion estandar de T5) | Texto a texto generico | Apache 2.0 | Ampliamente disponible |
| CodeT5+/CodeT5-base (Salesforce) | ~220 M | 512-1024 tokens segun variante | Codigo (generacion, traduccion, resumen) | Apache 2.0 (segun variante) | Ampliamente disponible |
| LLM4Decompile (variantes) | Desde ~1.3 B hasta ~33 B | Variable | Decompilacion de C a codigo fuente | no disponible / variable | Hugging Face |

La comparacion con T5-base es pertinente por tamano y arquitectura, pero no por tarea. CodeT5 es el comparable mas cercano en el ambito de codigo con tamano similar, aunque no esta especializado en decompilacion. LLM4Decompile aborda la misma tarea en el lenguaje C y con modelos mucho mayores, por lo que no es un competidor directo en coste de inferencia. No se dispone de resultados de rendimiento de este modelo para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de ficha de modelo: no hay licencia declarada, lo que impide determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara de uso.
- Riesgo de alucinacion y de codigo incorrecto: en tareas de decompilacion, un modelo generativo puede producir codigo sintacticamente valido pero semanticamente distinto del bytecode original. Cualquier uso en analisis de seguridad debe acompanarse de verificacion con ejecucion controlada o comparacion de comportamiento.
- Sin resultados de evaluacion publicados: no es posible estimar la tasa de exito de decompilacion ni compararla con decompiladores clasicos.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el tratamiento de funciones o modulos largos sin truncamiento.
- Cobertura de version limitada: el identificador `py315` sugiere entrenamiento sobre Python 3.15. El comportamiento sobre bytecode de versiones anteriores o posteriores no esta documentado.
- Opacidad sobre los datos: la composicion del dataset de 17,2 millones de filas no se detalla, por lo que no se puede evaluar el sesgo hacia ciertos patrones de codigo ni la posible contaminacion con codigo con licencias restrictivas.
- Adopcion practicamente nula (6 descargas, 0 likes) y sin mantenimiento documentado mas alla del 11 de octubre de 2026, lo que implica un riesgo alto de falta de soporte en produccion.
- El tamano del repositorio (10,7 GB) puede complicar su integracion en pipelines con limites de almacenamiento, especialmente si se necesita descargar el contenido completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syssec-utd/py315-pylingual-v6-statement
- Dataset asociado: https://huggingface.co/datasets/syssec-utd/statement-py315-pylingual-v6-tokenized
- Perfil de la organizacion: https://huggingface.co/syssec-utd
- Repositorio GitHub del proyecto pylingual: https://github.com/syssec-utd/pylingual
- Releases de pylingual: https://github.com/syssec-utd/pylingual/releases
- Directorio de modelos de syssec-utd en Essa Mamdani: https://essamamdani.com/ai-models/company/syssec-utd
