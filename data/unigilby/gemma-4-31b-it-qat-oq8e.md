# unigilby/gemma-4-31B-it-qat-oQ8e

## Resumen

`unigilby/gemma-4-31B-it-qat-oQ8e` es una cuantizacion de 8 bits en formato MLX del modelo `google/gemma-4-31B-it-qat-q4_0-unquantized`, publicada por el usuario unigilby el 3 de octubre de 2026. No es un modelo entrenado desde cero: es un derivado cuantizado de un modelo instruction-tuned de Google que a su vez procede de un pipeline de quantization aware training (QAT) con el esquema q4_0. El artefacto resultante pesa unos 31 GB y contiene 31.273.088.876 parametros en safetensors, con cuantizacion afin de 8 bits en grupos de 64.

El objetivo declarado del autor es doble: ofrecer un paquete de mayor calidad que un 4-bit cuando la memoria no es un problema, y hacerlo con una disposicion de tensores que los kernels de decodificacion especulativa de TensorFold puedan leer y apilar sin remapeos. Para ello se imponen dos restricciones sobre la cuantizacion oQe estandar de oMLX: todos los tensores van en grupos de 64 y cada pila por capa (q/k/v_proj y gate/up_proj) comparte una unica anchura, de modo que si oQ habria promovido un miembro de la pila, se promueve la pila completa a la anchura mayor, nunca se degrada.

Su relevancia ahora es de nicho pero clara: es una pieza pensada para servir Gemma 4 de 31B en Apple Silicon con memoria abundante y decodificacion especulativa exacta, un escenario en el que la mayoria de paquetes cuantizados no encajan sin tocar los kernels. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y su soporte en TensorFold esta propuesto upstream pero no incluido en ninguna release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (se menciona soporte "Gemma 4 dense" en TensorFold); no se detallan mas detalles estructurales |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de 8 bits (oQ nivel 8, modo oQe con imatrix), grupos de 64; el modelo base es un QAT q4_0 sin cuantizar |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 (heredada del modelo fuente, segun el autor) |
| Formato de pesos | safetensors (MLX); el repo ocupa 33,8 GB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de que TensorFold habla de "Gemma 4 dense support", lo que indica que se trata de una variante densa y no de un MoE. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; todo ello corresponde a la model card de Google, que el autor enlaza como referencia de uso previsto y limitaciones. Lo unico verificable aqui es que el punto de partida es `google/gemma-4-31B-it-qat-q4_0-unquantized`, es decir, un modelo instruction-tuned que paso por quantization aware training con el esquema q4_0 y que se publica sin cuantizar para permitir repaquetados.

La innovacion tecnica de este artefacto es exclusivamente de cuantizacion y formato. La herramienta empleada es oMLX en su modo `oq` con imatrix (oQe), al que se anaden dos restricciones de layout: cuantizacion en grupos de 64 en modo afine y anchura unica por pila y capa, con promocion de toda la pila al miembro mas ancho cuando oQ habria elevado solo a uno. Esto se traduce en que q/k/v_proj comparten una unica tupla (bits, grupo) y gate/up_proj comparten otra, lo que permite a los kernels de decodificacion especulativa de TensorFold leer y apilar cada proyeccion directamente. Las anchuras por capa quedan registradas en `config.json`, bajo la clave `quantization`, de modo que mlx-lm y oMLX cargan el paquete como cualquier modelo MLX cuantizado.

## Capacidades

- Generacion de texto y conversacion: la pipeline declarada es `text-generation` y el modelo incluye los tags `conversational` y `text-generation`.
- Instrucciones y dialogo multi-turno: al derivar de una variante `-it`, esta orientado a seguir instrucciones, si bien la model card no detalla protocolos de plantilla ni formatos de prompt.
- Decodificacion especulativa exacta: el layout esta disenado para que TensorFold lo lea con un drafter DFlash; segun las mediciones del autor, las respuestas redactadas coinciden token a token con las de `"draft": false` y las concurrentes coinciden con las seriales por hash de tokens.
- Compatibilidad de carga estandar: se carga como modelo MLX cuantizado en mlx-lm y oMLX sin pasos adicionales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no lista idiomas.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponible en la informacion proporcionada.
- Contexto largo: no disponible; no se especifica la ventana de contexto.

## Casos de uso

- Inferencia local en Apple Silicon con memoria abundante: un Mac con memoria unificada amplia puede cargar los ~31 GB del paquete en MLX y servir generacion de texto de 31B parametros sin depender de la nube, a cambio de renunciar a la portabilidad a GPU CUDA.
- Asistente de codigo en estacion de trabajo: al ser un modelo instruction-tuned de 31B servido localmente, encaja en tareas de autocompletado, explicacion de fragmentos y refactorizacion dentro del editor, siempre que el contexto de codigo quepa en la ventana (no documentada) y se acepte la perdida de precision propia del 8-bit.
- Generacion de documentacion tecnica y resumenes largos: la naturaleza conversacional del modelo base lo hace apto para transformar notas, issues o registros en documentacion estructurada, ejecutado en local para no enviar codigo propietario a terceros.
- Servicio multi-usuario de bajo volumen: con 83 tok/s agregados a cuatro streams en un M5 Ultra con TensorFold, un unico equipo puede atender a unos pocos usuarios concurrentes con latencia aceptable para chat interno.
- Evaluacion comparativa de cuantizaciones: sirve como referencia de "8-bit con memoria de sobra" frente a paquetes 4-bit del mismo origen, util para medir la perdida de calidad al reducir bits en Gemma 4 31B.
- Laboratorio de decodificacion especulativa: es un banco de pruebas para validar drafters y kernels de decodificacion exacta, ya que el autor verifica equivalencia por hash de tokens entre generacion con y sin drafter.
- Pipeline de traduccion o redaccion asistida en local: se puede usar para reescritura, correccion de estilo y traduccion, pero la ausencia de lista de idiomas en la model card obliga a validar la calidad por idioma antes de ponerlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento medido por el autor es de throughput, no de calidad: en un M5 Ultra con TensorFold (soporte denso de Gemma 4, pendiente upstream) y decodificacion greedy, 40 tok/s en un unico stream con drafter DFlash y 83 tok/s agregados con cuatro streams.

## Requisitos de hardware

- Peso de los pesos: unos 31 GB en 8-bit, aproximadamente el doble que un paquete 4-bit del mismo modelo.
- Memoria recomendada: al menos 32 GB utilizables para los pesos, y en la practica mas (se sugiere 48 GB o superior en memoria unificada) para acomodar KV cache, el drafter DFlash y el resto del runtime.
- Plataforma de destino: Apple Silicon con MLX. El autor midio en un M5 Ultra.
- GPU consumer: un paquete de 31 GB no cabe en GPUs de 24 GB como la RTX 4090 o la RTX 3090; requeriria GPUs de 32 GB o mas, y en cualquier caso el formato MLX esta pensado para memoria unificada de Apple, no para CUDA.
- Opciones de despliegue: mlx-lm y oMLX lo cargan directamente; TensorFold puede servirlo con decodificacion especulativa solo cuando su soporte para este layout de Gemma 4 este en una release, algo que hoy esta propuesto upstream y no disponible.
- Otros runners (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta compatibilidad ni conversion a GGUF en la informacion proporcionada.
- Latencia y throughput: 40 tok/s por stream y 83 tok/s agregados a cuatro streams, greedy, en M5 Ultra con TensorFold y drafter DFlash.

## Comparativa con modelos similares

No hay datos publicados de modelos de terceros comparables en la informacion proporcionada. La unica comparacion documentada es interna al propio linaje del artefacto:

| Modelo | Parametros | Cuantizacion | Tamano | Decodificacion especulativa | Licencia | Formato |
|---|---|---|---|---|---|---|
| unigilby/gemma-4-31B-it-qat-oQ8e (este) | 31,27 B | oQe 8-bit, grupos de 64, anchura unificada por pila | ~31 GB | Si, con TensorFold y drafter DFlash | apache-2.0 | safetensors MLX |
| google/gemma-4-31B-it-qat-q4_0-unquantized | no disponible | sin cuantizar (base QAT q4_0) | no disponible | no disponible | apache-2.0 segun el autor | no disponible |
| Paquete oQe estandar del mismo origen (referencia del autor) | 31,27 B | oQe, anchuras potencialmente distintas por miembro de pila | no disponible | No garantizada: puede no encajar con los kernels de TensorFold | apache-2.0 | safetensors MLX |

Alternativas de otros fabricantes con parametros y contexto similares: no disponible.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: es un repaquete de 8 bits, no el modelo original en precision completa; no se aportan mediciones de degradacion frente al base sin cuantizar.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad publicada, lo que impide estimar su nivel real frente a alternativas.
- Metadatos incompletos: idiomas, longitud de contexto y detalles de la plantilla de prompt no estan documentados en la ficha; hay que consultar la model card del modelo fuente de Google.
- Dependencia de herramientas no publicadas: la decodificacion especulativa que justifica este layout requiere soporte de Gemma 4 en TensorFold que aun no esta en ninguna release; hasta entonces, el valor diferencial del paquete no es explotable.
- Alcance de plataforma: formato MLX, orientado a Apple Silicon. No hay ruta documentada a GGUF, vLLM u Ollama.
- Huella de memoria alta: ~31 GB solo en pesos, lo que descarta GPUs de 24 GB y muchos equipos de consumo.
- Licencia: se declara apache-2.0 heredada del modelo fuente, pero al tratarse de un derivado de un modelo de Google conviene verificar las condiciones reales aplicables al uso comercial en la model card original antes de desplegarlo en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos de este tipo; no se documentan medidas de mitigacion ni evaluaciones de veracidad.
- Madurez: 0 descargas y 0 likes, publicado y actualizado el mismo dia, sin validacion independiente de la comunidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unigilby/gemma-4-31B-it-qat-oQ8e
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- TensorFold (runtime de decodificacion especulativa): https://github.com/ashhart/TensorFold
