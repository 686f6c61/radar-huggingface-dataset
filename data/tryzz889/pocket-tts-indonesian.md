# tryzz889/pocket-tts-indonesian

## Resumen

Pocket TTS Indonesian es un modelo de texto a voz (TTS) en indonesio con clonación de voz, desarrollado por el usuario tryzz889 a partir de `kyutai/pocket-tts`. Se entrenó sobre 502 horas de habla indonesia del corpus LEMAS y se publica como un par profesor/alumno: un estudiante de 6 capas (438 MB) y un profesor de 24 capas (1,27 GB), ambos con configuración YAML propia y pesos en safetensors, más un tokenizador compartido. El objetivo declarado es ofrecer TTS indonesio con clonación de voz que funcione en CPU, sin GPU, algo que el profesor no consigue.

El modelo resuelve un hueco concreto: el indonesio está poco cubierto en TTS open source de calidad, y las alternativas multilingües suelen degradar la pronunciación y la naturalidad en este idioma. La variante de 6 capas se destiló del profesor con la guía incorporada (`distill_cfg_coef: 2.0`), de modo que alcanza calidad "guiada" en el único paso de backbone que ejecuta realmente el comando `pocket-tts generate`; el profesor solo iguala esas cifras con `--cfg 2.0`, opción que el paquete distribuido no expone, por lo que el propio autor recomienda usar únicamente el estudiante.

Los números de evaluación son inusualmente detallados para un modelo con cero descargas: el estudiante logra un WER mediano del 9,09 % frente al 16,67 % del profesor, con mejor similitud de hablante (0,939 frente a 0,927) y mejor UTMOS (2,68 frente a 2,36), y corre a 2,23 veces tiempo real en CPU. Es relevante ahora porque demuestra que la destilación con guía incorporada permite obtener un TTS clonable de voz en menos de 500 MB y ejecutable en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS de la familia pocket-tts (Kyutai); esquema profesor/alumno con destilación y un solo paso de backbone en inferencia. Detalle interno de capas y atención: no disponible |
| Parámetros totales | no disponible (no se declara el recuento; pesos de 438 MB para el estudiante de 6 capas y 1,27 GB para el profesor de 24 capas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card solo menciona una prueba sobre un pasaje de noticias de 87 palabras) |
| Tipos de cuantización | no disponible; se publican pesos sin niveles de cuantización documentados. El repo incluye la etiqueta `onnx` y `base_model:quantized:kyutai/pocket-tts`, lo que sugiere una ruta de exportación a ONNX Runtime, no confirmada en la model card |
| Idiomas soportados | indonesio (`id`); si se omite `--voice`, el CLI recurre a su voz en inglés |
| Licencia | cc-by-4.0 (licencia del modelo base no indicada en la información disponible) |
| Formato de pesos | safetensors (`6l/model.safetensors`, `24l/model.safetensors`), tokenizador compartido (`tokenizer.model`) y configuraciones YAML |
| Variantes incluidas | `indonesian_6l.yaml` (estudiante, 438 MB) e `indonesian_24l.yaml` (profesor, 1,27 GB) |
| Dataset de entrenamiento | LEMAS (`LEMAS-Project/LEMAS-Dataset-train`), 502 horas de habla indonesia |
| Modelo base | `kyutai/pocket-tts` |
| Tamaño total del repositorio | 1,9 GB |
| Voces de referencia incluidas | 4 prompts indonesios CC0 de Common Voice, 48 kHz, 4 hablantes distintos |
| Biblioteca de inferencia | `pocket-tts` (CLI `uvx pocket-tts generate` y API Python `pocket_tts.TTSModel`) |

## Arquitectura y entrenamiento

La model card describe un modelo de texto a voz construido sobre `kyutai/pocket-tts`, con dos variantes de distinto número de capas: un profesor de 24 capas y un estudiante de 6 capas destilado a partir de él. La destilación se realizó con guía incorporada (`distill_cfg_coef: 2.0`), de forma que el estudiante reproduce en un único paso de backbone la calidad que el profesor solo alcanza aplicando clasifier-free guidance con `--cfg 2.0`. El paquete `pocket-tts` distribuido no expone ningún parámetro `cfg_coef`, por lo que el profesor no puede igualar al estudiante en las condiciones reales de uso. No se detallan en la información disponible el tipo exacto de bloques, el mecanismo de atención ni el decodificador de audio.

El entrenamiento usó 502 horas de habla indonesia del corpus LEMAS, con el split de evaluación separado (153 pares entre frases, 116 hablantes, ninguno presente en entrenamiento). El 10 de septiembre de 2026 se publicó un reentrenamiento tras detectar que los objetivos de entrenamiento se cortaban a mitad de palabra: el cargador recortaba cada objetivo a la última palabra alineada más 0,2 s de cola, criterio válido para corpus con silencio de relleno, pero los clips de LEMAS están recortados ajustados al habla, mientras que su alineador termina antes (el habla continúa 0,15 s de mediana y 0,52 s en el percentil 90 tras la última palabra alineada). Con 0,2 s solo se cubría el 62 % de los clips; subir la cola a 0,6 s cubre el 99 %. El efecto fue una mejora del WER mediano del 12,50 % al 9,09 % y del WER de corpus del 24,44 % al 13,48 %.

En el preprocesado, el tokenizador pliega mayúsculas y minúsculas ( `Halo, Dunia!` y `halo, dunia!` producen los mismos tokens) y su normalizador convierte el guion en un espacio desde el 6 de septiembre de 2026, porque las transcripciones de LEMAS escriben la reduplicación como palabras separadas (`anak anak`), de modo que el guion nunca entró en el vocabulario y generaba una palabra inventada. El modelo incorpora además un mecanismo de fin de secuencia controlado por umbral (`--eos-threshold`).

## Capacidades

- Síntesis de voz en indonesio a partir de texto libre, con mayúsculas y puntuación normales.
- Clonación de voz zero-shot: se le pasa un audio de referencia (`--voice archivo.wav` o `get_state_for_audio_prompt`) y reproduce esa identidad vocal.
- Inferencia en CPU a 2,23 veces tiempo real en la variante de 6 capas, lo que la hace desplegable sin GPU.
- Predicción de fin de secuencia ajustable mediante `--eos-threshold`, con un barrido documentado de -1,0 a -6,0.
- Normalización interna de mayúsculas y de guiones; el guion se trata como separador de palabras.
- Ejecución desde línea de comandos (`uvx pocket-tts generate`) y desde Python (`pocket_tts.TTSModel`, `get_state_for_audio_prompt`, `generate_audio`).
- Voz de reserva en inglés si no se proporciona prompt de voz.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del prompt de clonación.

## Casos de uso

- Atención al cliente telefónica en indonesio: el modelo permite construir un IVR o un agente de voz que responda en indonesio con una voz corporativa fija, clonada una sola vez a partir de un prompt de 48 kHz. Al correr a 2,23 veces tiempo real en CPU, puede desplegarse en el mismo servidor que gestiona la lógica de negocio.
- Audiolibros y contenido largo: el umbral `--eos-threshold -6.0` obtiene un 6,74 % de WER en un pasaje de noticias de 87 palabras, y el WER de corpus baja al 13,48 %, lo que lo hace viable para lectura de textos extensos en indonesio con revisión posterior.
- Doblaje y localización de vídeo: la clonación de voz permite trasladar un catálogo existente al indonesio manteniendo la identidad vocal de los locutores originales, con prompts de 48 kHz para maximizar la distinción entre voces.
- Accesibilidad y lectores de pantalla: al ser un modelo de 438 MB que funciona sin GPU, puede empaquetarse en aplicaciones de escritorio o dispositivos de gama baja para leer en voz alta contenido en indonesio.
- Generación de datos sintéticos para ASR: 502 horas de habla real más un sintetizador clonable permiten aumentar corpus de entrenamiento de reconocimiento de voz en indonesio con múltiples hablantes y condiciones controladas.
- Aprendizaje de idiomas y materiales didácticos: generación de ejercicios de pronunciación y dictado en indonesio con voces distintas para cada lección, sin depender de servicios en la nube.
- Prototipado rápido de productos de voz: la instalación vía `uvx` y la API Python permiten integrar TTS indonesio en una demo en minutos, sin GPU ni contenedores pesados.
- Videojuegos y experiencias interactivas: voces de NPC en indonesio generadas en tiempo real en CPU, con un catálogo de voces construido a partir de los cuatro prompts CC0 incluidos o de grabaciones propias.
- Nota transversal: en todos estos casos el texto de entrada debe escribirse con los números en palabras (`lima belas`, no `15`), ya que los dígitos quedan fuera del vocabulario.

## Benchmarks y rendimiento

Condiciones de evaluación declaradas: 153 pares entre frases sobre 116 hablantes del split de evaluación de LEMAS, ninguno presente en entrenamiento; transcripción con Whisper-large-v3 fijado a indonesio; normalización agnóstica de idioma; `--temp 0,3 --n-steps 1 --cfg 1,0` (sin guía, que es lo que ejecuta el CLI). Ambos modelos se barrieron sobre `--eos-threshold` y se reportan en su mejor ajuste.

| Métrica | Profesor 24L (eos -5,0) | Estudiante 6L (eos -6,0) |
|---|---|---|
| WER mediano por elemento | 16,67 % | 9,09 % |
| Elementos con WER superior al 50 % | 10 / 153 | 4 / 153 |
| Generaciones silenciosas | 0 | 0 |
| Similitud de hablante | 0,927 | 0,939 |
| UTMOS | 2,36 | 2,68 |
| WER de corpus | 20,55 % | 13,48 % |
| Velocidad en CPU | 0,69x tiempo real | 2,23x tiempo real |

Barrido completo de `--eos-threshold` del estudiante de 6 capas:

| eos | WER mediano | WER de corpus | Elementos > 50 % | Silencios | Sin EOS | Similitud | UTMOS |
|---|---|---|---|---|---|---|---|
| -1,0 | 18,18 % | 74,52 % | 26 | 0 | 19 | 0,919 | 2,48 |
| -2,0 | 13,33 % | 63,95 % | 12 | 0 | 9 | 0,925 | 2,53 |
| -3,0 | 16,67 % | 48,49 % | 18 | 0 | 0 | 0,932 | 2,64 |
| -4,0 (por defecto del CLI) | 13,33 % | 19,40 % | 8 | 0 | 0 | 0,939 | 2,64 |
| -5,0 | 12,50 % | 28,16 % | 6 | 0 | 0 | 0,937 | 2,68 |
| -6,0 | 9,09 % | 13,48 % | 4 | 0 | 0 | 0,939 | 2,68 |

Efecto del reentrenamiento del 10 de septiembre de 2026 (corrección del recorte de objetivos de 0,2 s a 0,6 s):

| Métrica | Antes | Después |
|---|---|---|
| WER mediano | 12,50 % | 9,09 % |
| WER de corpus | 24,44 % | 13,48 % |

No se han publicado resultados de benchmarks estándar de TTS (como MMLU, HumanEval o GSM8K) en la información disponible, por no ser aplicables a un modelo de síntesis de voz.

## Requisitos de hardware

- Estudiante de 6 capas: 438 MB de pesos. Estimación a partir del tamaño del fichero: por debajo de 2 GB de VRAM en fp16 o fp32, sin contar activaciones. Funciona sin GPU.
- Profesor de 24 capas: 1,27 GB de pesos. Estimación por debajo de 4 GB de VRAM, sin contar activaciones. Según el autor, no es usable sin GPU.
- Repositorio completo: 1,9 GB, incluyendo ambas variantes y el tokenizador.
- CPU: el estudiante alcanza 2,23x tiempo real y el profesor 0,69x. Estas cifras corresponden a una única ejecución emparejada en la misma máquina y con el mismo texto, no a un benchmark repetido.
- GPU consumer: el estudiante cabe con holgura en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y no requiere acelerador dedicado; no se especifican GPU concretas en la información disponible.
- Despliegue: CLI `uvx pocket-tts generate` y API Python mediante `pocket_tts.TTSModel.load_model`, `get_state_for_audio_prompt` y `generate_audio`. El repo incluye la etiqueta `onnx`, lo que apunta a una posible ruta de exportación a ONNX Runtime, no documentada en la model card.
- No aplicable: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, por tratarse de un modelo de síntesis de voz y no de un modelo de lenguaje.
- Latencia y throughput: 2,23x tiempo real en CPU para el estudiante y 0,69x para el profesor; no hay datos de throughput en GPU en la información disponible.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de otros modelos de TTS en indonesio, por lo que no se puede establecer una comparación con alternativas externas. La única comparación documentada es interna, entre las dos variantes del propio repositorio:

| Característica | Estudiante 6L | Profesor 24L |
|---|---|---|
| Tamaño de pesos | 438 MB | 1,27 GB |
| Capas | 6 | 24 |
| Velocidad en CPU | 2,23x tiempo real | 0,69x tiempo real |
| WER mediano | 9,09 % | 16,67 % |
| Similitud de hablante | 0,939 | 0,927 |
| UTMOS | 2,68 | 2,36 |
| Licencia | cc-by-4.0 | cc-by-4.0 |
| Uso recomendado por el autor | sí | no (solo reproducibilidad y punto de partida para destilación) |

Comparación con otros modelos de TTS en indonesio (por ejemplo, alternativas multilingües de Meta, Coqui o Google): no disponible.

## Limitaciones y advertencias

- Idioma único: solo indonesio. Si se omite el prompt de voz, el CLI recurre a una voz en inglés, lo que produce una combinación incoherente de idioma y voz.
- Los números deben escribirse como palabras. Los dígitos quedan fuera del vocabulario, ya que las transcripciones de entrenamiento los deletrean.
- Los guiones se normalizan a espacio desde el 6 de septiembre de 2026; antes generaban una palabra inventada en medio de la frase. Cualquier uso con versiones anteriores arrastra ese fallo.
- La calidad de la clonación depende del ancho de banda del prompt: con prompts de 48 kHz, dos generaciones se puntúan 0,771 entre sí, frente a 0,939 con prompts de 16 kHz de YouTube, donde todas las clones suenan como la misma persona. Una grabación silenciosa en 48 kHz supera a una más alta pero comprimida.
- Muestra de evaluación pequeña: 153 elementos y 116 hablantes. Las diferencias entre ajustes de `eos` en esa muestra pueden no generalizar.
- El WER se mide transcribiendo con Whisper-large-v3, por lo que la métrica está condicionada por el ASR y no equivale a una medida directa de inteligibilidad.
- UTMOS de 2,68 en el estudiante: naturalidad moderada, con margen claro de mejora frente a sistemas comerciales.
- Cola larga de errores: 4 de 153 elementos superan el 50 % de WER en el estudiante y el WER de corpus (13,48 %) duplica el mediano (9,09 %), lo que indica que algunos fragmentos largos fallan de forma apreciable.
- Riesgo de alucinación acústica: al ser un modelo generativo de audio, puede producir contenido sonoro no presente en el texto, especialmente con ajustes agresivos de `eos` (con -1,0 se registran 19 generaciones sin EOS y un WER de corpus del 74,52 %).
- Clonación de voz sin controles documentados: la model card no describe verificación de consentimiento ni filtros de uso indebido, lo que abre riesgo de suplantación. Las voces incluidas son prompts CC0 de Common Voice, pero las grabaciones aportadas por el usuario quedan bajo su responsabilidad.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero hay que verificar además la licencia del modelo base `kyutai/pocket-tts`, que no se indica en la información disponible.
- Discrepancia de identificación: los ejemplos de la model card invocan `anak10thn/pocket-tts-indonesian` con un hash de commit concreto (`17257664e384561c957b02ac92edd1a24807f0e5`), mientras que el identificador del repositorio es `tryzz889/pocket-tts-indonesian`. Conviene confirmar cuál es el repositorio canónico antes de fijar una dependencia en producción.
- Validación comunitaria nula: cero descargas y cero "me gusta" en el momento de la consulta, con un único autor. No hay evidencia de uso en producción ni de revisión independiente.
- Fecha de publicación futura respecto a la fecha habitual de consulta (creado el 27 de septiembre de 2026), dato a tener en cuenta al planificar actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tryzz889/pocket-tts-indonesian
- Repositorio alternativo citado en los ejemplos de la model card: https://huggingface.co/anak10thn/pocket-tts-indonesian
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Dataset de entrenamiento LEMAS: https://huggingface.co/datasets/LEMAS-Project/LEMAS-Dataset-train
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2509.06926 (título y contenido no disponibles en la información proporcionada)
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a herramientas de agentes y precios de asistentes comerciales, sin relación con el modelo.
