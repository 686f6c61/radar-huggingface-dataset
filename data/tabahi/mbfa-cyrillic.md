# Tabahi/mbfa-cyrillic

## Resumen

mbfa-cyrillic es un alineador forzado (forced aligner) y codificador de fonemas basado en una CNN sin contexto, desarrollado por el autor de HuggingFace Tabahi dentro de la familia p4mbfa, sucesora de CUPE / p3cupe. No es un modelo generativo: su funcion es tomar un audio y una secuencia de fonemas ya conocida y devolver los limites temporales de cada fonema en la senal. Concretamente, clasifica cada trama de 5 ms a partir de como maximo 120 ms de audio (campo receptivo de 38,9 ms), lo que impide que el modelo aprenda la fonotactica de ningun idioma concreto.

El modelo cubre el grupo linguistico "cyrillic" definido por standard_g2p y fue entrenado sobre ocho idiomas de FLEURS: bielorruso, bulgaro, croata, kazajo, macedonio, ruso, serbio y ucraniano. Dispone de tres cabezas: `ph` (127 etiquetas locales del grupo), `phg` (15 grupos foneticos compartidos por todos los grupos idiomaticos) y `tone` (22 valores, presente pero no entrenada porque ningun idioma de este grupo tiene capa tonal).

Su relevancia practica esta en la preparacion de corpus de voz: generar alineaciones a nivel de fonema de forma reproducible y ligera (14,8 millones de parametros, 0,1 GB de repositorio) para entrenar modelos TTS, evaluar pronunciacion o segmentar corpus multilingues, con la limitacion de que solo se ha validado sobre el grupo cirilico de FLEURS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free) con tres cabezas de clasificacion por trama (`ph`, `phg`, `tone`) y decodificador Viterbi segmental |
| Parametros totales | 14.792.164 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de texto; cada trama de 5 ms se clasifica con una ventana de audio de como maximo 120 ms y un campo receptivo de 38,9 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | be, bg, hr, kk, mk, ru, sr, uk (idiomas FLEURS del grupo cirilico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (checkpoint de entrenamiento adicional en formato PyTorch Lightning, `.ckpt`, serializado con pickle) |

Datos adicionales: tamano del repositorio 0,1 GB; libreria declarada `pytorch`; descargas y likes registrados en HuggingFace: 0; fecha de creacion 2026-10-09.

## Arquitectura y entrenamiento

La arquitectura es una CNN puramente local: cada trama de 5 ms se clasifica a partir de un maximo de 120 ms de audio, con un campo receptivo efectivo de 38,9 ms. Esa restriccion es deliberada y se describe en la model card como una garantia de que el modelo no puede aprender la fonotactica de ningun idioma. La salida son log-posteriores por trama para las tres cabezas. Los limites entre fonemas no se obtienen por simple argmax: se calculan con un decodificador Viterbi segmental sobre la secuencia de fonemas conocida y se refinan a precision sub-trama en el cruce de las posteriores de fonemas vecinos. El modelo forma parte de p4mbfa, sucesor de CUPE / p3cupe.

El entrenamiento uso FLEURS cirilico con una muestra del 62 por ciento (train_limit 100000), aproximadamente 40 de las 65,1 horas disponibles, con un nivel de ruido de 0,02. El checkpoint publicado corresponde al experimento `mr01a`, epoca 10, seleccionado por `val_loss` sobre FLEURS (mejor de 30 epocas; la curva se aplana a partir de la epoca 6). El tronco y la cabeza `phg` provienen del modelo latin `ma02a` en su epoca final, mientras que las cabezas `ph` y `tone` se entrenaron desde cero. Las etiquetas son las pronunciaciones del diccionario de standard_g2p (inventario gold `9438371ed6dd`), no transcripciones foneticas de lo realmente pronunciado.

Metricas declaradas: `val_loss` 2,6518, `val_frame_acc` 0,4318 y `val_frame_acc_groups` 0,5724. La propia model card advierte que estas metricas se calculan sobre las alineaciones del propio modelo (no existen etiquetas de frontera fuera del ingles), por lo que miden autoconsistencia y no precision de fronteras.

## Capacidades

- Alineacion forzada de audio con una secuencia de fonemas conocida, devolviendo inicio y fin en milisegundos para cada token.
- Reconocimiento y segmentacion de fonemas a nivel de trama de 5 ms mediante la cabeza `ph` (127 etiquetas, incluidas `<blank>`, `SIL`, `noise` y `<unk>`).
- Clasificacion en 15 grupos foneticos gold compartidos por todos los grupos idiomaticos mediante la cabeza `phg`.
- Extraccion de log-posteriores por trama de las tres cabezas mediante `aligner.encode(wav)`.
- Cobertura multilingue dentro del grupo cirilico: bielorruso, bulgaro, croata, kazajo, macedonio, ruso, serbio y ucraniano.
- Reutilizacion del tronco y de la cabeza `phg` compartida para entrenar nuevos grupos idiomaticos, con la opcion `reset_fine_heads` para reconstruir `ph` y `tone`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidad de agente: es un modelo acustico de alineacion.

## Casos de uso

- Preparacion de corpus para TTS: dado un audio y su transcripcion fonemica obtenida con standard_g2p, el modelo devuelve los limites de cada fonema y permite construir datasets de entrenamiento con duraciones exactas por unidad.
- Evaluacion de pronunciacion en aprendizaje de idiomas: comparar los limites y etiquetas predichos con la secuencia esperada para detectar inserciones, omisiones o alargamientos en habla de estudiantes de ruso, ucraniano o polaco (este ultimo no cubierto; solo el grupo cirilico listado).
- Segmentacion de corpus de investigacion fonetica: partir grabaciones largas en unidades foneticas para estudios de duracion, coarticulacion o variacion dialectal en las ocho lenguas soportadas.
- Sincronizacion y subtitulado a nivel subfonemico: obtener marcas temporales finas para alinear transcripciones con audio en tareas de postproduccion o indexacion de archivos sonoros.
- Ajuste fino sobre nuevos idiomas o variedades: el checkpoint de entrenamiento permite reutilizar el tronco y la cabeza `phg` y reentrenar solo las cabezas especificas, reduciendo el coste frente a entrenar desde cero.
- Generacion de datos de supervision para otros sistemas de voz: usar las alineaciones como pseudoetiquetas para entrenar o validar modelos de reconocimiento fonetico o de conversion texto a voz en idiomas con pocos recursos.
- Verificacion de pipelines de fonemizacion: contrastar la salida de `goldG2P.phonemize_sentence` con la evidencia acustica alineada para detectar errores del diccionario en palabras ambiguas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de validacion del propio autor, calculadas sobre las alineaciones del modelo y no contra etiquetas de frontera independientes:

| Metrica | Valor | Nota |
|---|---|---|
| `val_loss` | 2,6518 | FLEURS val, epoca 10 del experimento mr01a |
| `val_frame_acc` | 0,4318 | Precision por trama sobre etiquetas `ph` |
| `val_frame_acc_groups` | 0,5724 | Precision por trama sobre grupos `phg` |

No hay resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark de modelos de lenguaje, porque el modelo no es generativo. Tampoco se han publicado metricas de precision de fronteras (boundary accuracy), ya que la model card indica que no existen etiquetas de frontera fuera del ingles y que las metricas `val_*` miden autoconsistencia.

## Requisitos de hardware

- Huella de pesos estimada por aritmetica a partir de los 14.792.164 parametros: unos 59 MB en fp32 y unos 30 MB en fp16. No se documentan cuantizaciones oficiales.
- Inferencia viable en CPU: por tamano y por el caracter puramente convolutional y local del modelo, no requiere acelerador dedicado. No se publican cifras de latencia ni de throughput.
- GPU opcionales para procesar corpus grandes en lote (cualquier GPU con suficiente memoria para los lotes de audio, incluida una RTX 4090 o inferiores). No hay recomendaciones oficiales de GPU en la informacion disponible.
- Cabe sin problema en GPU de consumo: el cuello de botella sera el preprocesado de audio y el decodificador Viterbi, no la memoria de los pesos.
- Opciones de despliegue: el codigo oficial esta en el repositorio `tabahi/bfa_models`, carpeta `p4mbfa/`, y la carga se hace con `MbfaAligner.from_pretrained("Tabahi/mbfa-cyrillic")` en PyTorch. `from_pretrained` descarga solo `config.json` y `model.safetensors`.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni exportacion a ONNX o TorchScript. Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos numericos comparables publicados en la informacion proporcionada. Comparativa cualitativa con alternativas habituales de la misma categoria:

| Modelo | Tipo | Enfoque | Idiomas | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Tabahi/mbfa-cyrillic | CNN local + Viterbi segmental | Sin contexto (ventana de 120 ms), no aprende fonotactica | 8 idiomas del grupo cirilico | AGPL-3.0 | `val_loss` 2,6518; `val_frame_acc` 0,4318 |
| Montreal Forced Aligner (MFA) | GMM-HMM sobre Kaldi | Modelos acusticos por idioma con diccionario y gramatica | Amplio, mediante modelos acusticos por idioma | MIT | no disponible en esta informacion |
| Charsiu / alineadores basados en wav2vec 2.0 | Transformer auto-supervisado con capa de alineacion | Contexto amplio, aprendizaje de representaciones | Multilingue segun checkpoint | Varía por checkpoint (habitualmente MIT o Apache-2.0) | no disponible en esta informacion |

La diferencia estructural relevante es que mbfa-cyrillic renuncia explicitamente al contexto acustico largo, mientras que los alineadores basados en wav2vec 2.0 lo explotan. La model card no aporta comparaciones directas contra MFA o Charsiu.

## Limitaciones y advertencias

- Las metricas publicadas (`val_loss`, `val_frame_acc`, `val_frame_acc_groups`) se calculan contra las propias alineaciones del modelo, no contra etiquetas de frontera humanas. No son una medida de precision de limites foneticos.
- Las etiquetas de entrenamiento son pronunciaciones de diccionario de standard_g2p, no transcripciones de lo realmente pronunciado: en habla espontanea o con variacion dialectal el modelo alineara la forma canonica.
- El modelo solo ha sido entrenado y validado sobre el grupo cirilico de FLEURS. La model card indica que otros miembros del grupo podrian alinearse tambien, pero no se ha probado.
- La cabeza `tone` existe con 22 etiquetas pero no esta entrenada, porque ningun idioma de este grupo tiene capa tonal. No debe usarse.
- La precision por trama declarada es moderada (0,4318 sobre etiquetas locales y 0,5724 sobre grupos), coherente con una ventana acustica de solo 120 ms.
- Es un modelo de alineacion, no de reconocimiento libre: requiere como entrada la secuencia de fonemas ya conocida, obtenida aparte con standard_g2p. No transcribe audio por si mismo.
- Licencia AGPL-3.0: el uso en servicios en red obliga a liberar el codigo fuente correspondiente bajo la misma licencia. Es una restriccion relevante para productos comerciales cerrados.
- El checkpoint de ajuste fino `cyrillic_fleurs40h_mr01a_e10_val_loss=2.652.ckpt` es un pickle de PyTorch Lightning; la propia model card advierte de que solo debe cargarse si se confia en el repositorio, por el riesgo asociado a deserializar pickles.
- No se documentan sesgos especificos, tasas de alucinacion (no aplica a un modelo discriminativo) ni comportamiento fuera de los ocho idiomas listados.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tabahi/mbfa-cyrillic
- Codigo de inferencia y entrenamiento (carpeta `p4mbfa/`): https://github.com/tabahi/bfa_models
- Repositorio standard_g2p / CharsiuG2P usado para texto a tokens: https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
- Checkpoint de entrenamiento: `ckpt/cyrillic_fleurs40h_mr01a_e10_val_loss=2.652.ckpt` dentro del repositorio de HuggingFace
- Canal de YouTube del autor (referenciado en la busqueda web): https://www.youtube.com/channel/UCr2cdu4MzNab1RwZpebLpMQ
