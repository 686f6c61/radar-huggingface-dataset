# Tabahi/mbfa-japanese

## Resumen

mbfa-japanese es un codificador de fonemas y alineador forzado basado en una CNN sin contexto, perteneciente a la familia p4mbfa (sucesora de CUPE / p3cupe) y desarrollado por el autor que firma como Tabahi. No es un modelo generativo ni un LLM: su funcion es, dado un audio y una secuencia de telefonos conocida, devolver las fronteras temporales de cada telefono dentro de la senal. Trabaja sobre el grupo de idiomas del japones dentro del proyecto standard_g2p / CharsiuG2P y esta entrenado exclusivamente con FLEURS japones.

El modelo clasifica cada trama de 5 ms a partir de como maximo 120 ms de audio, con un campo receptivo de 38,9 ms. Esa restriccion es deliberada: al no ver mas de una decima de segundo, la red no puede aprender la fonotactica de ningun idioma y queda como un encoder puramente local. Las fronteras se obtienen con un decodificador de Viterbi segmental sobre la secuencia de telefonos conocida y se refinan a precision sub-trama en el cruce de las posteriores vecinas.

Con 14.690.689 parametros (unos 14,7 M) y un repo de 0,1 GB, es un modelo muy pequeno que se ejecuta en CPU sin problema. Su relevancia es practica: la alineacion forzada es un paso previo imprescindible en TTS, evaluacion de pronunciacion, anotacion fonetica de corpus y creacion de datasets de habla, y aqui se ofrece como un componente ligero, reentrenable y con cabezas compartidas entre grupos de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free CNN phoneme encoder) de la familia p4mbfa, sucesora de CUPE / p3cupe |
| Parametros totales | 14.690.689 (aprox. 14,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | campo receptivo de 38,9 ms; cada trama de 5 ms se clasifica a partir de 120 ms de audio como maximo |
| Tipos de cuantizacion | no disponible; el repo publica pesos en la precision de entrenamiento (safetensors) y un checkpoint PyTorch Lightning |
| Idiomas soportados | japones (ja); el modelo esta etiquetado como multilingual porque comparte cabezas entre grupos, pero solo el grupo japones esta entrenado y probado |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`) mas `config.json`; checkpoint adicional `.ckpt` de PyTorch Lightning en formato pickle |

## Arquitectura y entrenamiento

La red es una CNN puramente local: no hay atencion, ni estado recurrente, ni ventana larga. Cada trama de 5 ms se etiqueta usando como maximo 120 ms de audio, lo que da un campo receptivo efectivo de 38,9 ms. El modelo tiene tres cabezas: `ph`, con 28 etiquetas correspondientes a los tokens locales del japones (incluyendo `<blank>`, `SIL`, `noise` y `<unk>`); `phg`, con 15 grupos de fonemas dorados compartidos por todos los grupos de idiomas; y `tone`, con 22 valores tambien compartidos pero presente sin entrenar, ya que ningun idioma de este grupo tiene capa tonal. La decodificacion no es argmax por trama: se aplica un decodificador de Viterbi segmental sobre la secuencia de telefonos conocida y se refina la frontera a precision sub-trama en el punto de cruce de las posteriores de dos telefonos vecinos.

El entrenamiento usa FLEURS japones completo, 7,0 h, con `noise_level` 0,02. El checkpoint publicado corresponde al experimento `mj01a`, epoca 8 de 30, seleccionado por `val_loss` y exactitud de trama sobre FLEURS de validacion. La columna vertebral (trunk) y la cabeza `phg` provienen del checkpoint latin `ma02a` (ultima epoca), mientras que `ph_head` y `tone_head` se entrenaron desde cero. Las etiquetas son pronunciaciones de diccionario generadas por standard_g2p (inventario dorado `9438371ed6dd`), no transcripciones foneticas de lo que realmente se dijo. No se documenta uso de RLHF, DPO ni ajuste por preferencias, algo coherente con una tarea de etiquetado por trama.

## Capacidades

- Alineacion forzada de audio y secuencia de telefonos: devuelve inicio y fin en milisegundos para cada telefono de la secuencia dada.
- Reconocimiento de fonemas a nivel de trama, con salto de 5 ms.
- Segmentacion de fonemas con refinamiento sub-trama en las fronteras.
- Salida de log-posteriores por trama para las tres cabezas mediante `aligner.encode(wav)`.
- Clasificacion en grupos de fonemas (`phg`), lo que permite reutilizar la cabeza entre grupos de idiomas.
- Capacidad de ajuste fino y de reentrenamiento de nuevas cabezas sobre el tronco preentrenado.
- Idiomas: japones. La model card indica que otros miembros del mismo grupo podrian alinearse porque standard_g2p los mapea a los mismos tokens, pero no se ha probado.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No soporta vision, audio generativo, ni modo de pensamiento. Es un componente acustico-fonetico, no un asistente.

## Casos de uso

- Alineacion forzada de corpus de voz en japones: dado un fichero de audio y su transcripcion convertida a telefonos con standard_g2p, el modelo produce las marcas temporales por fonema. Es util para preparar corpus de habla con etiquetas a nivel de telefono.
- Anotacion para sintesis de voz (TTS): los sistemas TTS necesitan duraciones por fonema para entrenar el modelo de duracion; este alineador las genera directamente sobre el corpus de entrenamiento.
- Preprocesado y postprocesado de ASR: alinear la salida de un reconocedor con el audio permite detectar inserciones, omisiones y desajustes temporales, y generar subtitulos con marcas por fonema.
- Evaluacion de pronunciacion: comparar las fronteras y posteriores obtenidas sobre la lectura de un estudiante con las del texto esperado sirve para localizar que telefonos se pronuncian mal o se alargan de mas.
- Investigacion en fonetica y linguistica computacional: la arquitectura sin contexto evita que el modelo aprenda fonotactica, lo que lo hace util como sonda local para estudiar realizacion fonetica y coarticulacion.
- Extraccion de caracteristicas acusticas: `encode()` devuelve log-posteriores por trama que pueden alimentar modelos posteriores (clasificadores de acento, deteccion de disfluencias, segmentacion de hablante) sin reentrenar desde cero.
- Creacion de datasets alineados a partir de FLEURS u otros corpus japoneses, para despues entrenar otros sistemas con datos etiquetados temporalmente.
- Transferencia a nuevos grupos de idiomas: el tronco y la cabeza `phg` se reutilizan y solo hay que reconstruir y entrenar `ph_head` y `tone_head`, con lo que se reduce el coste de arrancar un alineador para una lengua nueva.

## Benchmarks y rendimiento

La model card solo publica las metricas de validacion del checkpoint, y el propio autor advierte que estan calculadas contra las alineaciones del propio modelo, no contra etiquetas de frontera reales. Miden autoconsistencia, no exactitud de fronteras. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER, F1 de fronteras, etc.) en la informacion disponible, y este tipo de modelo no se evalua con esas pruebas.

| Metrica | Valor | Nota |
|---|---|---|
| `val_loss` | 2,3491 | Sobre clips de FLEURS de validacion |
| `val_frame_acc` | 0,5036 | Exactitud de trama contra las alineaciones del propio modelo |
| `val_frame_acc_groups` | 0,5381 | Exactitud a nivel de grupo de fonemas, mismo criterio |

No se dispone de comparaciones con otros alineadores (MFA, alineadores basados en wav2vec 2.0) dentro de la informacion proporcionada. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14.690.689 parametros, los pesos ocupan aproximadamente 58,8 MB en FP32, 29,4 MB en FP16 y 14,7 MB en INT8. La memoria adicional depende del tamano del lote y de la duracion del audio.
- GPU recomendadas: no se necesita GPU. Cualquier GPU consumer sirve; incluso una GPU integrada o una placa tipo Raspberry Pi es suficiente por tamano de pesos.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 4090, RTX 3060, GTX 1650, e incluso en aceleradores de borde). El cuello de botella no es la memoria sino el coste del decodificador de Viterbi sobre secuencias largas.
- Opciones de despliegue: ejecucion directa en PyTorch con el paquete `p4mbfa` del repositorio `tabahi/bfa_models` (clase `MbfaAligner`). No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible en la model card. Dado el tamano y el campo receptivo de 38,9 ms, se espera inferencia en tiempo real o mas rapida en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

La unica referencia explicita de la model card es su predecesor CUPE / p3cupe, del que p4mbfa es sucesor. No hay datos comparativos publicados (parametros, contexto, metricas) para el predecesor ni para herramientas alternativas como Montreal Forced Aligner o alineadores construidos sobre wav2vec 2.0.

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Datos comparativos |
|---|---|---|---|---|---|---|
| mbfa-japanese | CNN sin contexto + Viterbi segmental | 14.690.689 | campo receptivo 38,9 ms | japones | AGPL-3.0 | checkpoint `mj01a`, epoca 8 |
| CUPE / p3cupe (predecesor) | alineador forzado de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |
| Montreal Forced Aligner | alineador forzado clasico (GMM-HMM) | no disponible | no disponible | multiples | no disponible | no disponible |
| Alineadores sobre wav2vec 2.0 | encoder acustico + alineacion | no disponible | no disponible | multiples | no disponible | no disponible |

No se dispone de resultados comparativos en la informacion proporcionada, por lo que no se puede afirmar superioridad ni inferioridad frente a ninguna alternativa.

## Limitaciones y advertencias

- La exactitud de trama en validacion es de 0,5036, un valor bajo; el propio autor advierte que la metrica mide autoconsistencia y no exactitud de fronteras.
- Las etiquetas de entrenamiento son pronunciaciones de diccionario de standard_g2p, no transcripciones foneticas de lo realmente pronunciado. Esto sesga el modelo hacia la pronunciacion canonica y puede degradar la alineacion con habla espontanea, dialectal o con ruido.
- No existen etiquetas de frontera fuera del ingles en el proyecto, por lo que no se ha podido medir la precision real de las fronteras en japones.
- Solo se ha entrenado y probado con japones. El uso con otros idiomas del mismo grupo es una extrapolacion no verificada.
- La cabeza `tone` esta presente en el modelo pero sin entrenar; sus salidas no son utilizables.
- Datos de entrenamiento limitados a 7,0 h de FLEURS japones, con `noise_level` 0,02 y estilo de lectura de libros. Dominio estrecho y poca variedad de hablantes y acentos.
- Sesgos conocidos: no se documenta ningun analisis de sesgo por hablante, genero, acento o variedad dialectal; el rendimiento en variedades no presentes en FLEURS es desconocido.
- No es un modelo generativo: no hay riesgo de alucinacion de texto, pero si de alineaciones incorrectas cuando la secuencia de telefonos no corresponde al audio.
- Licencia AGPL-3.0: es copyleft fuerte. Si se ofrece el modelo como servicio en red o se distribuye una obra derivada, la licencia obliga a liberar el codigo fuente correspondiente. Es una restriccion relevante para integraciones comerciales de codigo cerrado.
- El checkpoint `.ckpt` es un pickle de PyTorch Lightning; la model card advierte de que solo se cargue si se confia en el repositorio, por el riesgo asociado a la deserializacion de pickles.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente de la comunidad ni resultados replicados por terceros.
- No hay pipeline declarado en HuggingFace ni integracion con frameworks estandar de inferencia, lo que obliga a usar el codigo propio del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tabahi/mbfa-japanese
- Codigo de inferencia y entrenamiento (paquete `p4mbfa`): https://github.com/tabahi/bfa_models
- Repositorio standard_g2p / CharsiuG2P: https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento y validacion: https://huggingface.co/datasets/google/fleurs
- Descarga del checkpoint de entrenamiento: `hf download Tabahi/mbfa-japanese "ckpt/japanese_fleurs7h_mj01a_e8_val_loss=2.349.ckpt"`
- Papers, blogs o demos adicionales: no disponible; las busquedas web realizadas no devolvieron resultados utiles sobre este modelo.
