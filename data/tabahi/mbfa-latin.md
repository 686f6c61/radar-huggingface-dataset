# Tabahi/mbfa-latin

## Resumen

mbfa-latin (nombre interno p4mbfa · latin) es un codificador de fonemas y alineador forzado basado en una CNN sin contexto, desarrollado por el autor de HuggingFace Tabahi. No es un modelo de lenguaje generativo: recibe una señal de audio y una secuencia de fonemas ya conocida, y devuelve las fronteras temporales de cada fonema dentro del audio. Es el sucesor de CUPE / p3cupe dentro del proyecto p4mbfa, y cubre el grupo linguistico "latin" del inventario de standard_g2p (36 variantes de idioma, incluidas es-419, pt-BR, fr, it o de).

Su rasgo diferencial es que cada frame de 5 ms se clasifica usando como maximo 120 ms de audio (campo receptivo de 38,9 ms), de modo que el modelo no puede aprender la fonotactica de ninguna lengua concreta. Las fronteras entre telefonos se obtienen con un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida, refinado a precision sub-frame en el cruce de las posteriores vecinas. Esta restriccion de diseno lo hace intrinsecamente transferible entre idiomas y barato de ejecutar.

Con 14.875.189 parametros (unos 14,9 M) y un repo de 0,1 GB, es un modelo ligero pensado para preparar corpus de voz: alineacion de datasets, segmentacion de fonemas y generacion de etiquetas a nivel de frame para entrenar TTS, ASR o sistemas de evaluacion de pronunciacion. En el momento de redactar esta ficha acumula 0 descargas y 1 like, por lo que su validacion por parte de la comunidad es todavia muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free), encoder de fonemas con 3 cabezas de clasificacion: `ph` (208 etiquetas), `phg` (15 grupos foneticos dorados) y `tone` (22 valores) |
| Parametros totales | 14.875.189 (aprox. 14,9 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica en el sentido de LLM. Procesa frames de 5 ms con un maximo de 120 ms de audio por frame y un campo receptivo de 38,9 ms |
| Tipos de cuantizacion | No disponible. El repo solo publica pesos en safetensors (precision original) y un checkpoint de PyTorch Lightning |
| Idiomas soportados | 36 variantes entrenadas con FLEURS: af, az, bs, ca, cs, cy, da, de, en-US, es-419, et, fi, fil, fr, ga, gl, hu, id, is, it, lb, lt, mi, ms, mt, nb, nl, pl, pt-BR, ro, sk, sl, sv, sw, tr, uz |
| Licencia | AGPL-3.0 |
| Formato de pesos | `safetensors` (inferencia) y `ckpt/latin_fleurs273h_ma04a_e6_timit_f1_25ms=71.22.ckpt` (checkpoint PyTorch Lightning, weights only, formato pickle) |

## Arquitectura y entrenamiento

La arquitectura es una CNN que clasifica cada frame de 5 ms a partir de una ventana acotada de audio (campo receptivo de 38,9 ms, tope de 120 ms). El modelo expone tres cabezas: `ph` con los 208 tokens locales del grupo latin (incluye `<blank>`, `SIL`, `noise` y `<unk>`), `phg` con 15 grupos foneticos dorados compartidos por todos los grupos de idioma, y `tone` con 22 valores tambien compartidos pero presente y sin entrenar, ya que ningun idioma de este grupo tiene capa tonal. La alineacion no sale directamente de la cabeza `ph`: se aplica un decodificador de Viterbi segmental sobre la secuencia de fonemas conocida y las fronteras se refinan a precision sub-frame en el punto de cruce de las posteriores contiguas.

El entrenamiento usa las 273,5 horas completas de FLEURS para el grupo latin, con un `noise_level` de 0.05 (aproximadamente 26 dB de SNR). El checkpoint publicado corresponde al experimento `ma04a`, epoca 6, seleccionado por F1@25 ms sobre TIMIT en la mitad `tune` de una sonda de 400 clips; es la mejor ejecucion latin entrenada con ruido 0.05 y se continuo desde la ultima epoca de `ma02a` (ramp_frames 1.0). Esa eleccion de ruido esta pensada para grabaciones reales: como TIMIT es habla limpia, este checkpoint puntua por debajo de mbfa-latin-benchmark (72,93 en holdout), que se entreno con ruido 0.02.

Las etiquetas son pronunciaciones de diccionario de standard_g2p (inventario dorado `9438371ed6dd`), no transcripciones foneticas de lo que realmente se dijo. El texto a tokens se resuelve fuera del modelo, con `goldG2P.phonemize_sentence` y `lang_group_inventory.to_local`.

## Capacidades

- Alineacion forzada de audio con texto conocido: dada una onda mono a 16 kHz y una lista de telefonos, devuelve inicio y fin en milisegundos para cada segmento.
- Reconocimiento de fonemas a nivel de frame: `aligner.encode(wav)` devuelve las log-posteriores por frame de las tres cabezas (`ph`, `phg`, `tone`).
- Segmentacion de fonemas con precision sub-frame, gracias al refinado de fronteras sobre el cruce de posteriores vecinas.
- Clasificacion en 15 grupos foneticos dorados compartidos entre grupos de idioma (`phg`), util como representacion intermedia independiente de la lengua.
- Cobertura multilingue de 36 variantes dentro del grupo latin, con un inventario de tokens comun, lo que permite reutilizar el mismo modelo entre lenguas del grupo.
- Capacidad de continuar entrenamiento y de reutilizar el tronco y la cabeza `phg` para entrenar un nuevo grupo de idioma (`reset_fine_heads: true`).
- No dispone de generacion de texto, tool calling, agentes, vision, audio generativo ni modo de razonamiento: es un componente acustico-fonetico, no un modelo de proposito general.
- No incluye tono: la cabeza `tone` existe pero no esta entrenada en este checkpoint.

## Casos de uso

- Preparacion de corpus para TTS: alinear automaticamente audiolibro o corpus de voz con su transcripcion fonemizada para obtener duraciones por fonema, que son la etiqueta de entrada de modelos de sintesis como FastSpeech o VITS.
- Anotacion de datasets de ASR: generar etiquetas a nivel de frame para entrenamiento o evaluacion forzada, sin depender de un decodificador acustico completo.
- Investigacion en fonetica computacional: medir duraciones, desplazamientos de fronteras y errores absolutos medios por fonema sobre corpus ya transcritos, como hace la propia evaluacion del autor con TIMIT.
- Evaluacion de pronunciacion en aprendizaje de idiomas: alinear la locucion de un estudiante contra la secuencia fonemica esperada y detectar segmentos con duracion o fronteras anomalas.
- Segmentacion de audio para concatenative speech synthesis o para recorte de unidades: el refinado sub-frame permite cortes mas limpios que un alineador basado en frames gruesos.
- Filtrado de calidad de datos de voz: descartar clips cuya alineacion produzca errores absolutos elevados, como paso previo a un pipeline de limpieza de corpus.
- Alineacion multilingue en un unico servicio: al compartir inventario dentro del grupo latin, un solo modelo cubre es-419, pt-BR, fr, it, de o nl sin cambiar de checkpoint.
- Extraccion de caracteristicas acusticas para modelos posteriores: las log-posteriores de `phg` sirven como representacion compacta y agnostica de idioma en tareas posteriores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `timit_f1_25ms_tune` | 71,22 |
| `timit_f1_25ms_holdout` | 71,70 |
| `timit_f1_25ms_nobonus_holdout` | 65,21 |
| `timit_f1_10ms_holdout` | 53,99 |
| `timit_abs_err_ms_holdout` | 16,13 |

Las metricas `timit_*` se calculan sobre 400 clips de TIMIT (ingles, nunca usado en entrenamiento). El texto de cada clip se fonemiza con standard_g2p, se alinea forzosamente y se comparan las fronteras predichas con las etiquetas manuales de TIMIT: F1 con tolerancia de 25 y 10 ms, y error absoluto medio de las fronteras emparejadas. Los clips se dividen en dos mitades: `tune`, que sirvio para elegir el checkpoint, y `holdout`, que no participo en esa seleccion. La variante `nobonus` alinea sin el bonus de onset sobre el log-mel, lo que aísla la contribucion de la propia red. No se han publicado resultados de benchmarks comparativos con otros alineadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los calculos derivados del recuento de parametros dan aproximadamente 60 MB en fp32, 30 MB en fp16 y 15 MB en int8. No hay cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es sobradamente suficiente; el modelo cabe tambien en iGPU y en CPU.
- Cabe en cualquier GPU de consumo: desde una GTX 1050 o una iGPU integrada hasta una RTX 4090, donde el cuello de botella sera la lectura de audio y no la computacion.
- Opciones de despliegue: el autor solo documenta inferencia con PyTorch a traves del paquete `p4mbfa` (`p4mbfa.inference.MbfaAligner.from_pretrained`), que descarga unicamente `config.json` y `model.safetensors`. No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni versiones GGUF u ONNX.
- Latencia y throughput estimados: no disponible. El modelo no publica medidas de latencia ni de audio procesado por segundo.
- Almacenamiento: el repo completo ocupa 0,1 GB, incluido el checkpoint de entrenamiento.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| mbfa-latin (Tabahi) | CNN sin contexto + Viterbi segmental sobre secuencia de fonemas conocida | 14,9 M | AGPL-3.0 | HuggingFace, requiere el codigo `p4mbfa` |
| Montreal Forced Aligner (MFA) | GMM-HMM sobre Kaldi, con diccionario de pronunciacion | No aplica (no es una red neuronal unica) | No disponible en la informacion proporcionada | Herramienta de linea de comandos ampliamente extendida |
| Alineadores basados en wav2vec 2.0 (Charsiu, MMS) | Red neuronal auto-supervisada con CTC y decodificacion sobre el texto | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Pesos publicos y ampliamente usados |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible: el autor solo publica metricas contra las etiquetas manuales de TIMIT, no frente a otros alineadores. La diferencia de planteamiento si es clara: mbfa-latin renuncia deliberadamente a modelar contexto (38,9 ms de campo receptivo) para no aprender fonotactica, mientras que los enfoques auto-supervisados si modelan contexto amplio y suelen requerir mas computo.

## Limitaciones y advertencias

- No es un modelo generativo ni un asistente: no produce texto, no responde a instrucciones y no puede usarse para tareas de lenguaje.
- No transcribe: necesita la secuencia de fonemas conocida de antemano. La conversion de texto a tokens es responsabilidad de standard_g2p, fuera del modelo.
- Las etiquetas de entrenamiento son pronunciaciones de diccionario de standard_g2p, no transcripciones foneticas de lo realmente pronunciado; en habla espontanea o con acento marcado esto genera desajustes sistematicos.
- La cabeza `tone` esta presente pero no entrenada: el modelo no sirve para idiomas tonales tal como se distribuye.
- La restriccion de contexto es una limitacion de diseno: al no poder aprender fonotactica, el rendimiento depende por completo de la calidad de la secuencia de fonemas de entrada y del decodificador de Viterbi.
- Solo se ha probado con el grupo latin. Otros miembros del grupo podrian alinearse porque standard_g2p los mapea a los mismos tokens, pero el autor indica explicitamente que no estan probados.
- Licencia AGPL-3.0: es copyleft fuerte. Integrarlo en un servicio en red obliga a liberar el codigo fuente de la obra derivada, lo que puede ser incompatible con productos propietarios. Revisar con atencion antes de un uso comercial.
- El checkpoint `ckpt/...ckpt` es un pickle de PyTorch Lightning: cargarlo ejecuta codigo arbitrario, por lo que solo deberia hacerse si se confia en el repositorio.
- Reputacion y validacion minimas: 0 descargas y 1 like en el momento del analisis, sin resultados comparativos publicados frente a otros alineadores.
- Riesgo de alucinacion en el sentido habitual no aplica, pero si existe riesgo de fronteras mal localizadas: el error absoluto medio en holdout sobre TIMIT es de 16,13 ms y el F1 a 10 ms baja a 53,99, de modo que la precision sub-frame anunciada no se sostiene a tolerancias estrictas en habla limpia.
- El rendimiento en audio real no esta cuantificado con metricas publicas, pese a que el ruido de entrenamiento (0.05) se eligio precisamente para ese escenario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tabahi/mbfa-latin
- Codigo de inferencia y entrenamiento (p4mbfa): https://github.com/tabahi/bfa_models
- Inventario y G2P de referencia (standard_g2p / CharsiuG2P): https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
- Modelo hermano orientado a habla limpia, citado en la model card: mbfa-latin-benchmark (referenciado por nombre, sin URL publicada en la informacion disponible)
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes a este modelo; apuntan a cuentas y productos no relacionados con p4mbfa.
