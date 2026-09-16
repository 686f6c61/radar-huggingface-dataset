# TBOGamer22/nemo-brahvi-g2p-conformer

## Resumen

El modelo TBOGamer22/nemo-brahvi-g2p-conformer, denominado Brahvi Conformer G2P, es un sistema de conversion grafema-fonema (G2P) desarrollado por Talha Bin Omar para el brahvi, una lengua dravidica hablada principalmente en la provincia pakistani de Baluchistán y escrita en alfabeto perso-arabe. El modelo recibe texto brahvi y devuelve una secuencia de fonemas en notacion IPA amplia, lo que lo convierte en una pieza de preprocesamiento para sintesis de voz (TTS), etiquetado de pronunciacion y control de calidad de corpus orales.

Tecnicamente es un encoder Conformer de 8 capas con tamano oculto 192, 4 cabezas de atencion y kernel de convolucion 15, entrenado con objetivo CTC a nivel de caracter dentro del framework NVIDIA NeMo. La entrada se expande por defecto repitiendo tres veces cada caracter no espacial para facilitar la alineacion CTC, con una longitud maxima de 1024 caracteres tras la expansion. Es un modelo de escala muy reducida, disenado para una unica tarea y un unico idioma.

Su relevancia actual radica en que, segun el autor, es el primer modelo publico de G2P dedicado al brahvi: no existia ningun recurso abierto equivalente en el catalogo de Hugging Face ni en la literatura consultada. Forma parte de la familia Pakistani Languages G2P, junto a los modelos equivalentes de pashto, sindhi y balochi, y se publica bajo licencia MIT, lo que facilita su reutilizacion en proyectos de TTS para lenguas con pocos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder (8 capas) con cabecera CTC a nivel de caracter |
| Parametros totales | no disponible (no se declara el recuento; con hidden size 192 y 8 capas es un modelo de escala muy reducida) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 caracteres de entrada tras la expansion (equivale a unos 341 caracteres de texto original, ya que cada caracter no espacial se repite tres veces) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | brahvi (codigo ISO 639-3: brh), en escritura perso-arabe |
| Licencia | MIT |
| Formato de pesos | checkpoint portable de NeMo (`brahvi_conformer_g2p.nemo`), mas `model_config.yaml` y vocabularios de tokenizacion en `tokenizers/` |

Otros datos de configuracion: hidden size 192, 4 cabezas de atencion, kernel de convolucion 15, vocabularios de caracteres para grafemas brahvi y para caracteres IPA. Repositorio de 0.0 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo es un encoder Conformer, es decir, un transformer que intercala bloques de auto-atencion con modulos convolucionales, implementado en NVIDIA NeMo. La salida es una secuencia de caracteres IPA amplios generada mediante CTC, sin decodificador autorregresivo. El pipeline es puramente textual: entrada de grafemas brahvi, salida de fonemas. La expansion por repeticion (cada caracter no espacial tres veces) es una estrategia de alineacion para CTC; la longitud maxima de la fuente expandida es de 1024 caracteres.

No se publican en la model card el numero de tokens de entrenamiento, la composicion del dataset, los manifiestos ni ningun detalle sobre si hubo ajuste con RLHF o DPO (no aplicable a un modelo G2P). El repositorio publico contiene deliberadamente solo archivos de inferencia: el checkpoint `.nemo`, el YAML de configuracion, los tokenizadores, un script `inference.py`, `requirements.txt` y la licencia. No se incluyen datasets, particiones, manifiestos, tablas de predicciones, registros de entrenamiento ni checkpoints del entrenador.

La evaluacion reportada se basa en PER de corpus, calculado como la distancia de edicion total sobre caracteres IPA dividida por el numero total de caracteres IPA de referencia.

## Capacidades

- Conversion de grafema a fonema para texto brahvi en escritura perso-arabe, con salida en IPA amplia.
- Procesamiento por lotes: la CLI admite un archivo de texto UTF-8 con una frase por linea y salida en JSON.
- Descarga automatica del modelo desde Hugging Face mediante el parametro `--repo-id`.
- Preprocesamiento para sistemas TTS: genera secuencias de pronunciacion a partir de texto sin necesidad de diccionario de pronunciacion.
- Bootstrap de etiquetas de pronunciacion para corpus de voz y verificacion de calidad de transcripciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado de una sola tarea.
- No tiene capacidades de vision, audio ni modo de razonamiento explicito.
- Multilingue: no. Esta entrenado especificamente para brahvi; los prestamos de urdu o arabe presentes en el texto se procesan como grafemas brahvi, sin garantia de fidelidad.

## Casos de uso

- Preprocesamiento de TTS en brahvi: el modelo convierte frases en perso-arabe a secuencias IPA que alimentan un sintetizador acustico o un modelo de duracion; es el caso de uso principal declarado por el autor.
- Construccion de lexicos de pronunciacion: generar entradas candidatas grafema-IPA para un diccionario de pronunciacion de brahvi, que despues se revisan manualmente con hablantes nativos.
- Control de calidad de corpus orales: comparar la salida G2P con transcripciones existentes para detectar segmentos mal transcritos o mal alineados en un corpus de habla.
- Normalizacion de texto para pipelines de voz: obtener una representacion fonetica estable antes de entrenar modelos acusticos, reduciendo la variabilidad ortografica del perso-arabe.
- Investigacion linguistica asistida: generar hipotesis de pronunciacion amplia para estudios de fonologia brahvi, siempre con revision experta posterior.
- Prototipado rapido de asistentes de voz en brahvi: al ser un modelo diminuto y con licencia MIT, permite montar un prototipo de lectura en voz alta o de sintesis en entornos con pocos recursos de computo.
- Herramientas de accesibilidad: transcripcion fonetica de textos brahvi para aplicaciones de aprendizaje de la lengua o de lectura asistida.

## Benchmarks y rendimiento

El unico resultado publicado es el PER de corpus en dos particiones. No se han publicado resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, que no son aplicables a un modelo G2P.

| Particion | PER de corpus |
|---|---|
| Validacion | 9,99% |
| Test reservado tras adjudicacion de referencias | 9,39% |

El repositorio publico no incluye filas de evaluacion ni los datos de referencia, por lo que estos valores no son reproducibles a partir de los archivos publicados. No se ofrecen cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; dado el tamano del repositorio (0.0 GB) y la configuracion (hidden 192, 8 capas), cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican. Cualquier GPU con unos pocos cientos de MB de memoria libre es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, practicamente en cualquier modelo moderno (serie RTX 20xx o superior, e incluso integradas), y tambien en CPU.
- Opciones de despliegue: NVIDIA NeMo (`nemo_toolkit`) mediante el script `inference.py` incluido, con soporte de inferencia local o descarga desde el Hub. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de decoder.
- Latencia y throughput: no disponibles. La longitud maxima de entrada (1024 caracteres expandidos) limita el coste por peticion.

## Comparativa con modelos similares

No se conocen modelos publicos de G2P especificos para brahvi mas alla de este. La comparacion mas cercana son los otros miembros de la misma familia, del mismo autor y con arquitectura declarada equivalente. Los datos de parametros y contexto de los modelos hermanos no se detallan en la informacion disponible.

| Modelo | Idioma | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| TBOGamer22/nemo-brahvi-g2p-conformer | brahvi (brh) | Conformer 8 capas + CTC | MIT | Publico en Hugging Face |
| TBOGamer22/nemo-pashto-g2p-conformer | pashto | Conformer + CTC (familia Pakistani Languages G2P) | no disponible en la informacion proporcionada | Publico en Hugging Face |
| TBOGamer22/nemo-sindhi-g2p-conformer | sindhi | Conformer + CTC (familia Pakistani Languages G2P) | no disponible en la informacion proporcionada | Publico en Hugging Face |
| TBOGamer22/nemo-balochi-g2p-conformer | balochi | Conformer + CTC (familia Pakistani Languages G2P) | no disponible en la informacion proporcionada | Publico en Hugging Face |

Frente a sistemas G2P multilingues genericos (por ejemplo, reglas o modelos entrenados sobre inventarios foneticos amplios), este modelo no aporta cobertura multilingue, pero esta especializado en el inventario y la ortografia del brahvi. No se dispone de comparativas de PER entre ambos enfoques en la informacion proporcionada.

## Limitaciones y advertencias

- Variacion ortografica y de pronunciacion: en brahvi una misma grafia puede tener mas de una pronunciacion valida, y el modelo devuelve una unica hipotesis.
- La salida es IPA amplia predicha por el modelo, no una transcripcion fonetica estrecha; no debe tratarse como anotacion linguistica autoritativa.
- Fiabilidad reducida ante cambio de codigo (code-switching), grafias poco frecuentes, nombres extranjeros, texto con mucha puntuacion y caracteres no vistos en entrenamiento.
- No sustituye la revision de hablantes nativos de brahvi ni de linguistas entrenados.
- Sesgos conocidos: no se documentan sesgos especificos, pero el modelo hereda los sesgos de la variedad y del corpus de entrenamiento, cuyo origen y composicion no se publican.
- Riesgo de alucinacion: en un modelo CTC de secuencia a secuencia el riesgo se manifiesta como sustituciones u omisiones de fonemas, con un PER de corpus cercano al 10% en test.
- Limitacion de contexto: la fuente expandida no puede superar los 1024 caracteres, lo que limita el texto original a unos 341 caracteres por peticion; los textos mas largos deben segmentarse.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificacion con atribucion; no se imponen restricciones adicionales en la model card.
- Caveats para produccion: el repositorio solo contiene archivos de inferencia, sin datos de evaluacion ni particiones reproducibles; no se declara el recuento de parametros ni existe version cuantizada. El modelo esta en el pipeline "other", no en un pipeline estandar de Hugging Face, por lo que no funciona con las utilidades genericas de `transformers`.
- Idioma: unicamente brahvi (brh). No se declara soporte para urdu, sindhi ni otras lenguas emparentadas.
- Metadatos llamativos: la model card esta fechada en 2026 y el repositorio tiene 0 descargas y 0 likes, por lo que es un lanzamiento muy reciente y sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TBOGamer22/nemo-brahvi-g2p-conformer
- Coleccion Pakistani Languages G2P Family: https://huggingface.co/collections/TBOGamer22/pakistani-languages-g2p-family-6a80b528dec2241021bed73e/pakistani-languages-g2p-family-6a80b528dec2241021bed73e
- Pashto Conformer G2P: https://huggingface.co/TBOGamer22/nemo-pashto-g2p-conformer
- Sindhi Conformer G2P: https://huggingface.co/TBOGamer22/nemo-sindhi-g2p-conformer
- Balochi Conformer G2P: https://huggingface.co/TBOGamer22/nemo-balochi-g2p-conformer
- Estudio sobre fonetica del brahvi: https://doi.org/10.1017/S0041977X00082331
- Inventario fonologico del brahvi en PHOIBLE: https://phoible.org/inventories/view/2377
- Catalogo de modelos G2P en Hugging Face: https://huggingface.co/models?other=Grapheme-to-Phoneme
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian a paginas de ayuda de YouTube sin relacion con el contenido.
