# thealper2/t5-small-nl-to-regex

## Resumen

`thealper2/t5-small-nl-to-regex` es un ajuste fino completo de `google-t5/t5-small` (60.506.624 parametros) para traducir descripciones en ingles de patrones de texto a expresiones regulares. El modelo resuelve el problema de la generacion de expresiones regulares a partir de lenguaje natural, una tarea de parseo semantico en la que la mayoria de asistentes genericos producen patrones sintacticamente validos pero semanticamente incorrectos. Lo publica el usuario thealper2 bajo licencia MIT y esta pensado para integrarse en pipelines de preprocesamiento de texto.

Se ha entrenado sobre 20.824 ejemplos procedentes de los tres corpus de DeepRegex (KB13, NL-RX-Synth y NL-RX-Turk), con un reparto 80/10/10 estratificado por corpus. La arquitectura es la de T5 estandar: transformer encoder-decoder con atencion completa, vocabulario SentencePiece de 32.128 tokens y ventana de trabajo de 128 tokens tanto en entrada como en salida durante el entrenamiento.

Su relevancia practica es doble: por un lado ocupa apenas 0,2 GB en disco y puede ejecutarse en CPU o en cualquier GPU de consumo; por otro, obtiene un 66,78 % de coincidencia exacta y un 78,54 % de precision funcional en el split de test, con un 99,76 % de salidas sintacticamente validas. Hay que tener en cuenta que su salida no es sintaxis de `re` de Python, sino el dialecto de DeepRegex con operadores de complemento e interseccion, y que los literales entrecomillados se normalizan a marcadores de posicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (seq2seq) |
| Parametros totales | 60.506.624 |
| Parametros activos | no aplica (no es MoE, es denso) |
| Longitud de contexto | 128 tokens de entrada y 128 de salida en entrenamiento; usa embeddings posicionales relativos de T5-small, extensibles hasta 512 |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas; el checkpoint admite cuantizacion dinamica int8/int4 con bitsandbytes y conversion a GGUF previa |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline declarado | text2text-generation (text-generation en los metadatos del Hub) |
| Prefijo de tarea | `translate natural language to regex: ` |
| Tamano del repositorio | 0,2 GB |
| Modelo base | google-t5/t5-small |
| Compatibilidad de despliegue | transformers, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura original de T5-small: 6 capas de encoder y 6 de decoder, atencion multi-cabeza completa, 512 dimensiones de modelo y normalizacion pre-LN con embeddings posicionales relativos. No hay LoRA, adaptadores ni cuantizacion en el artefacto publicado: se han reentrenado los 60,5 millones de parametros. El entrenamiento usa bf16, learning rate 3e-4 con decaimiento lineal, weight decay 0,01, warmup del 5 %, batch efectivo de 64 y un maximo de 15 epocas con early stopping (paciencia de 3 epocas sobre coincidencia exacta en validacion). El mejor checkpoint es `checkpoint-3915`.

Los datos de entrenamiento son 20.824 ejemplos de los tres corpus de DeepRegex: KB13 (824 ejemplos, 732 regex unicas, descripciones humanas de Kushman y Barzilay 2013), NL-RX-Synth (10.000 ejemplos, 9.648 regex, descripciones sinteticas generadas a partir de la propia expresion) y NL-RX-Turk (10.000 ejemplos, 9.648 regex, parafrasis humanas sobre las descripciones sinteticas). El split es 16.659 de entrenamiento, 2.082 de validacion y 2.083 de test, con semilla 42. Como NL-RX-Synth y NL-RX-Turk comparten ficheros de destino identicos byte a byte, se dividieron sobre una permutacion comun del indice de linea para evitar fuga de informacion entre particiones. 127 de las 2.083 expresiones de test (6,1 %) aparecen tambien como objetivo de entrenamiento, pero se mantuvieron por ser repeticiones genuinas de los corpus.

La innovacion tecnica mas destacable no esta en el modelo, sino en la gestion de la salida: el vocabulario SentencePiece de T5 no puede representar los caracteres `\`, `^`, `` ` ``, `{`, `}`, `~` ni `#`, por lo que el modelo los emite como las secuencias `#b`, `#c`, `#g`, `#l`, `#r`, `#n` y `#h`, que el llamante debe decodificar. La generacion se hace con busqueda por haces de 4 y muestreo desactivado.

## Capacidades

- Generacion de expresiones regulares a partir de descripciones de una sola frase en ingles.
- Ambito de tres dominios de descripcion: descripciones humanas (KB13), plantillas sinteticas (NL-RX-Synth) y parafrasis humanas (NL-RX-Turk).
- Expresiones con operadores adicionales del dialecto DeepRegex: complemento (`~X`) e interseccion (`X&Y`).
- Semantica de coincidencia por linea completa (full-match), no de subcadena.
- Salida sintacticamente valida en el 99,76 % de los casos de test.
- Generacion determinista con busqueda por haces, lo que facilita la reproducibilidad.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo es solo para ingles.
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Validacion de formularios web: dada una descripcion como "lines that contain the word 'dog'", el modelo propone un patron que un desarrollador revisa y traduce a sintaxis `re` para validar entradas en frontend o backend, ahorrando la escritura manual del patron.
- Filtrado y extraccion en logs: permite generar patrones para seleccionar lineas de log que cumplan una condicion descrita en lenguaje natural, y aplicarlos despues en herramientas de analisis que admitan el dialecto o su traduccion.
- Preprocesamiento en pipelines de NLP: construccion de patrones de limpieza y seleccion de oraciones dentro de un pipeline ETL basado en lineas completas, donde la semantica full-match del modelo encaja directamente.
- Generacion de reglas para DFA: al producir expresiones del dialecto DeepRegex, las salidas se pueden compilar a automatas para verificacion de equivalencia, algo util en entornos donde se necesita demostrar que una regla nueva cubre lo mismo que una existente.
- Asistente de expresiones regulares en IDE o chat interno: con un post-procesador que decodifique los tokens `#b`, `#c`, `#g`, `#l`, `#r`, `#n`, `#h` y traduzca `~` y `&`, se puede ofrecer autocompletado de patrones a partir de una descripcion breve.
- Ensenanza y documentacion: generar ejemplos de expresiones regulares y sus descripciones asociadas para material didactico, dado que el modelo esta ajustado sobre pares descripcion-patron reales.
- Generacion de datos sinteticos para entrenar modelos mayores: el modelo, al ser pequeno y rapido, puede producir candidatos de expresiones regulares que despues se filtren por validez sintactica y equivalencia de automata.
- Clasificacion rapida de texto por lineas: en tareas donde cada linea debe clasificarse segun un patron descrito por un analista, el modelo evita depender de un LLM grande para una tarea acotada y repetible.

## Benchmarks y rendimiento

Resultados sobre el split de test retenido (2.083 ejemplos), con busqueda por haces de 4 y sin muestreo:

| Metrica | Valor |
|---|---|
| Coincidencia exacta | 66,78 % |
| Validez de la expresion regular | 99,76 % |
| Precision funcional | 78,54 % |
| Equivalencia DFA (exacta, sobre el 77,39 % de ejemplos decidibles) | 80,40 % |
| Acuerdo en sondas (aproximado) | 79,98 % |
| Similitud de caracteres | 0,9016 |
| Linea base: expresion mas frecuente del entrenamiento | 0,00 % de coincidencia exacta |

Desglose por corpus:

| Corpus | n | Coincidencia exacta | Precision funcional | Validez |
|---|---|---|---|---|
| KB13 | 83 | 42,17 % | 68,67 % | 100,00 % |
| NL-RX-Synth | 1.000 | 85,90 % | 89,70 % | 99,90 % |
| NL-RX-Turk | 1.000 | 49,70 % | 68,20 % | 99,60 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones con otros modelos sobre estos mismos corpus.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 242 MB en fp32, 121 MB en fp16/bf16, 61 MB en int8 y 31 MB en int4, mas el espacio de activaciones y la cache de atencion (despreciable con 128 tokens).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problemas. Cualquier GPU con 2 GB o mas es suficiente. Una RTX 3060, RTX 4090, A100 o H100 estan ampliamente sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: `transformers` (via `AutoModelForSeq2SeqLM`), text-generation-inference (el repositorio esta marcado como compatible con endpoints), vLLM, conversion a GGUF para llama.cpp u Ollama, y exportacion a ONNX.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.
- Nota practica: dado el tamano, en produccion es mas eficiente agrupar peticiones en batch y cachear el tokenizador que optimizar la inferencia.

## Comparativa con modelos similares

No se dispone de resultados de benchmark publicados para alternativas evaluadas sobre los mismos corpus, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thealper2/t5-small-nl-to-regex | 60,5 M | 128 tokens (entrenamiento) | NL a regex sobre DeepRegex | MIT | HuggingFace, safetensors |
| google-t5/t5-small | 60,5 M | 512 tokens | Proposito general, no ajustado a regex | Apache-2.0 | HuggingFace, safetensors |
| Modelos generativos grandes con few-shot prompting (familia GPT o similares) | muy superior | variable | NL a regex generico | propietaria o abierta segun variante | APIs o pesos abiertos |

Los dos primeros comparten arquitectura y tamano, de modo que la diferencia es exclusivamente el ajuste fino sobre los corpus DeepRegex. Frente a los modelos generativos grandes, la ventaja de este checkpoint es el coste de inferencia y la reproducibilidad; la desventaja, su restriccion a descripciones cortas de un unico dominio en ingles y la salida en un dialecto no estandar. No hay datos comparativos de rendimiento entre estas alternativas en la informacion disponible.

## Limitaciones y advertencias

- La salida esta en el dialecto DeepRegex, no en sintaxis de Python `re`: los operadores `~` (complemento) y `&` (interseccion) no se interpretan como tales en `re.compile`, que los lee como caracteres literales, por lo que hay que traducir la expresion antes de usarla.
- Los literales entrecomillados se normalizan a los marcadores de posicion `dog`, `truck`, `ring` y `lake` en orden de aparicion. El modelo no copia el literal real escrito por el usuario; el llamante debe sustituirlo despues.
- Las descripciones de entrenamiento son cortas, de una sola frase y con estructura de plantilla. El comportamiento con peticiones libres o de varias frases no esta probado.
- La metrica de acuerdo en sondas es de muestra finita y puede declarar equivalentes dos expresiones que difieran en un contraejemplo mas largo.
- La equivalencia DFA no puede decidirse en expresiones que contienen `\b`, aproximadamente un 20 % del corpus.
- Con 60 millones de parametros y un vocabulario especifico de dominio, no es un asistente general de expresiones regulares.
- Las expresiones generadas no se validan frente a backtracking catastrofico; no deben ejecutarse sobre entradas no confiables sin revision.
- La mitad del entrenamiento proviene de descripciones sinteticas, lo que se refleja en la fuerte diferencia de rendimiento entre corpus: 85,90 % de coincidencia exacta en NL-RX-Synth frente a 42,17 % en KB13 y 49,70 % en NL-RX-Turk.
- El modelo solo procesa ingles.
- La licencia MIT permite uso comercial, pero no exime de revisar la procedencia de los corpus de entrenamiento para usos concretos.
- Existe solapamiento entre objetivos de entrenamiento y de test: 127 de 2.083 expresiones de test (6,1 %) aparecen tambien en entrenamiento. Los resultados deben interpretarse teniendo en cuenta este factor.
- El repositorio registra cero descargas y cero likes, y no se ha actualizado desde su creacion, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/t5-small-nl-to-regex
- Modelo base: https://huggingface.co/google-t5/t5-small
- Corpus DeepRegex (referencia citada en la model card, autoria de Locascio et al.): no disponible como enlace directo en la informacion proporcionada
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (directorios de empresas de fontaneria en Douai, Francia), por lo que no se han incorporado enlaces adicionales.
