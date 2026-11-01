# Tabahi/mbfa-thai

## Resumen

mbfa-thai es un codificador de fonemas y alineador forzado de audio desarrollado por Tabahi, sucesor de CUPE/p3cupe dentro del proyecto p4mbfa. No es un modelo generativo de lenguaje: su funcion es recibir una senal de audio y una secuencia de fonemas conocida, y determinar en que instante del audio se pronuncia cada fonema. Esta especializado en el grupo linguistico thai_khmer de standard_g2p, con entrenamiento efectivo solo en tailandes.

La arquitectura es una CNN sin contexto (context-free): cada fotograma de 5 ms se clasifica usando como maximo 120 ms de audio, con un campo receptivo de 38,9 ms. Esta restriccion es deliberada: al no ver suficiente audio como para aprender la fonotactica de ningun idioma, el modelo se ve forzado a basarse en evidencia acustica local, lo que lo hace mas portable entre lenguas. Los limites entre fonemas se obtienen con un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida, refinado a precision sub-fotograma en el cruce de posteriores vecinas.

El modelo tiene 14.700.939 parametros (unos 14,7 M) y un repositorio de 0,1 GB. Es relevante para pipelines de sintesis de voz, anotacion fonetica y evaluacion de pronunciacion en tailandes, donde los alineadores genericos entrenados en ingles rinden mal. Su licencia AGPL-3.0 condiciona fuertemente su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free) con tres cabezas de clasificacion por fotograma; decodificacion Viterbi segmental |
| Parametros totales | 14.700.939 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; campo receptivo de 38,9 ms por fotograma (maximo 120 ms de audio por clasificacion), fotogramas de 5 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | th (tailandes); el espacio de etiquetas cubre thai_khmer, pero el jemer no fue entrenado |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (modelo); checkpoint de entrenamiento en .ckpt de PyTorch Lightning (pickle) |

## Arquitectura y entrenamiento

El modelo es una red convolucional que opera sobre audio a 16 kHz y emite, para cada fotograma de 5 ms, log-posteriores de tres cabezas: `ph` (38 etiquetas: tokens locales de thai_khmer, incluidos `<blank>`, `SIL`, `noise` y `<unk>`), `phg` (15 grupos foneticos gold compartidos entre todos los grupos linguisticos) y `tone` (22 valores de tono compartidos, entrenados sobre la capa tonal de este grupo). La decodificacion no es argmax por fotograma: se aplica un Viterbi segmental restringido a la secuencia de fonemas conocida, y los limites se refinan a precision sub-fotograma en el punto de cruce de posteriores vecinas.

El entrenamiento uso FLEURS tailandes completo (7,8 h) con un nivel de ruido de 0,02, excluyendo jemer (`exclude_langs [km]`). El checkpoint publicado corresponde al experimento `mt01a`, epoca 8, seleccionado por `val_loss` sobre FLEURS (mejor de 20 epocas; la epoca final marco 2,565). El tronco y la cabeza `phg` provienen del modelo latin `ma02a` (epoca final); las cabezas `ph` y `tone` se entrenaron desde cero. Las etiquetas son pronunciaciones de diccionario de standard_g2p (inventario gold `9438371ed6dd`), no transcripciones foneticas de lo realmente pronunciado. El jemer esta en el espacio de etiquetas pero no se entreno: standard_g2p pliega el 19,8 % de sus tokens a `<unk>`.

## Capacidades

- Alineacion forzada de audio con una secuencia de fonemas conocida, con marcas de inicio y fin en milisegundos por segmento.
- Reconocimiento de fonemas por fotograma mediante las cabezas `ph`, `phg` y `tone`.
- Prediccion de tono (22 valores) sobre la capa tonal del grupo thai_khmer.
- Segmentacion fonetica con refinamiento sub-fotograma de fronteras.
- Extraccion de log-posteriores por fotograma mediante `aligner.encode(wav)` para uso como features en otros sistemas.
- Soporte multilingue limitado: el espacio de etiquetas es compartido entre grupos, pero solo tailandes fue entrenado; otros miembros del grupo podrian alinear, sin verificar.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Anotacion fonetica de corpus de tailandes: dado un audio y su transcripcion convertida a fonemas con standard_g2p, el modelo devuelve los limites temporales de cada fonema, lo que permite construir corpus alineados para entrenar TTS o ASR.
- Entrenamiento de sistemas TTS: los limites por fonema y las etiquetas de tono alimentan modelos de sintesis con duraciones y contornos tonales supervisados, algo critico en una lengua tonal como el tailandes.
- Evaluacion de pronunciacion: comparando la alineacion forzada de la produccion de un hablante con la secuencia esperada se pueden detectar omisiones, inserciones o desplazamientos temporales de fonemas en herramientas de aprendizaje de idiomas.
- Investigacion fonetica: la precision sub-fotograma en las fronteras permite medir duraciones vocalicas y consonantales y estudiar realizaciones del tono a escala de corpus.
- Preprocesado en pipelines de voz: sirve como etapa de segmentacion previa a modelos acusticos mayores, reduciendo el audio a unidades foneticas con marcas temporales.
- Deteccion de errores en transcripciones: si la alineacion forzada produce costes altos o muchos `<unk>`, la transcripcion o la pronunciacion de diccionario es probablemente incorrecta.
- Fine-tuning para nuevos grupos linguisticos: el tronco y la cabeza `phg` compartida permiten reentrenar solo las cabezas `ph` y `tone` para otra lengua con `reset_fine_heads: true`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `val_loss` | 2,5226 |
| `val_frame_acc` | 0,4881 |
| `val_frame_acc_groups` | 0,5973 |
| `val_peak_ce_tone` | 0,863 |

Las metricas `val_*` se calculan sobre clips reservados de FLEURS pero puntuadas contra las propias alineaciones del modelo, ya que no existen etiquetas de frontera fuera del ingles. Por tanto, miden autoconsistencia, no precision de fronteras. No se han publicado resultados de precision de limites ni comparaciones con otros alineadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 14,7 M de parametros; cabe holgadamente en cualquier GPU consumer, e incluso en CPU para clips cortos.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3060 o superior sobra. Para procesar corpus grandes en lote, cualquier GPU moderna acelera el proceso.
- Cabe en GPU consumer: si, en todas las gamas actuales; el cuello de botella es el decodificador Viterbi, no el modelo.
- Opciones de despliegue: el paquete `p4mbfa` del repositorio `tabahi/bfa_models` (PyTorch); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mbfa-thai (Tabahi) | CNN sin contexto + Viterbi | 14,7 M | th (entrenado) | AGPL-3.0 | HuggingFace |
| CUPE / p3cupe (Tabahi) | Predecesor del mismo linaje | no disponible | multilingue | no disponible | repositorio del autor |
| Montreal Forced Aligner | HMM-GMM con diccionario | no disponible | varios, con modelos acusticos por lengua | no disponible en la informacion | distribucion propia |
| wav2vec2 + CTC para alineacion | Transformer autosupervisado | cientos de millones | multilingue | variable segun checkpoint | HuggingFace |

La comparacion cuantitativa con estas alternativas no esta disponible: el autor no publica metricas de precision de fronteras ni comparaciones directas. La diferencia arquitectonica principal frente a wav2vec2 es el caracter sin contexto del codificador, que evita sobreajustar la fonotactica de una lengua concreta.

## Limitaciones y advertencias

- Solo se entreno en tailandes (7,8 h de FLEURS); el jemer figura en el espacio de etiquetas pero no se entreno, y el 19,8 % de sus tokens se pliega a `<unk>`.
- Las metricas publicadas miden autoconsistencia, no precision real de fronteras: no hay etiquetas de referencia de limites fuera del ingles.
- Las etiquetas son pronunciaciones de diccionario de standard_g2p, no transcripciones de lo que se dijo; discrepancias entre diccionario y habla real degradan la alineacion.
- Requiere una secuencia de fonemas de entrada; no transcribe audio libre por si solo.
- Licencia AGPL-3.0: su uso en servicios en red obliga a liberar el codigo fuente bajo la misma licencia, lo que practicamente excluye productos propietarios.
- El checkpoint de entrenamiento es un pickle de PyTorch Lightning; cargarlo ejecuta codigo arbitrario y solo debe hacerse desde repositorios de confianza.
- Riesgo de alucinacion en el sentido de alineaciones incorrectas cuando el audio no coincide con la secuencia de fonemas esperada; el modelo no senala el error de forma explicita.
- Sin datos publicados sobre sesgos por variedad dialectal, genero o edad de los hablantes; FLEURS es una fuente limitada y de dominio unico.
- No hay cuantizaciones publicadas ni soporte de frameworks de inferencia estandar, lo que complica el despliegue fuera de PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tabahi/mbfa-thai
- Codigo de inferencia y entrenamiento: https://github.com/tabahi/bfa_models
- standard_g2p (conversion texto a fonemas): https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
