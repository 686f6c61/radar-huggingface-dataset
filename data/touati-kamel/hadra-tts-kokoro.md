# touati-kamel/Hadra-TTS-kokoro

## Resumen

Hadra-TTS Kokoro 82M (هدرة) es un modelo de síntesis de voz (text-to-speech) de código abierto adaptado al darja argelino (الدارجة الجزائرية), la variante dialectal del árabe hablada en Argelia. Lo desarrolla el usuario touati-kamel y se construye como un ajuste fino (fine-tuning) del modelo base hexgrad/Kokoro-82M, una arquitectura StyleTTS2 con vocoder iSTFTNet de 82 millones de parámetros. El modelo es multihablante y ofrece tres personas vocales predefinidas: `kahwa`, `rawi` y `loubna`.

El problema que aborda es la escasez de sistemas TTS de calidad para dialectos árabes magrebíes, que habitualmente quedan fuera de la cobertura de los modelos multilingües dominantes. Hadra-TTS incorpora fonemas propios del darja argelino (consonantes faríngeas como ع y ح, oclusiva uvular ق, oclusiva velar sonora گ) y gestiona la alternancia de código con préstamos del francés, un fenómeno muy extendido en el habla argelina.

El modelo se publica con licencia Apache 2.0, un tamaño de repositorio de 0,3 GB y está etiquetado para los idiomas `arq` (darja argelino) y `ar` (árabe). Su relevancia actual radica en que ofrece una alternativa ligera y desplegable localmente para aplicaciones de voz en un dialecto con recursos limitados, con un pipeline de inferencia autocontenido y un checkpoint acústico accesible para investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 con vocoder iSTFTNet (base Kokoro-82M) |
| Parámetros totales | 82 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | arq (darja argelino), ar (árabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (checkpoint PyTorch `kokoro_arabic.pth`); vectores de voz `.pt` (`voices/kahwa.pt`, `voices/rawi.pt`, `voices/loubna.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en StyleTTS2, una arquitectura de síntesis de voz neuronal que combina un codificador de estilo y un decodificador acústico con un vocoder iSTFTNet para generar formas de onda a 24 kHz. Sobre el checkpoint original de Kokoro-82M, el autor ha realizado un ajuste fino orientado al darja argelino, ampliando el vocabulario de fonemas para incorporar símbolos IPA propios del dialecto: `ʕ` (ع, fricativa faríngea sonora), `ħ` (ح, fricativa faríngea sorda), `ɡ` (گ, oclusiva velar sonora), `q` (ق, oclusiva uvular), `v` (ڤ, labiodental sonora) y `p` (پ, oclusiva bilabial sorda).

El entrenamiento se apoya en tres corpus de audio argelino alojados en Hugging Face bajo el espacio `oddadmix`: `arabic-audio-collection-algerian-kahwa-postcast`, `arabic-audio-collection-algerian-rawi` y `arabic-audio-collection-algerian-loubna-stories`. No se especifican en la información disponible el número de horas de audio, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo incorpora un G2P ligero para darja que translitera préstamos franceses frecuentes (por ejemplo, "c'est bon" → `seː boːn`, "rendez-vous" → `raːndeːvuː`) antes de la síntesis. Las tres personas vocales se condicionan mediante vectores latentes de estilo con cadencias diferenciadas: `kahwa` a 1,08× (enérgica), `rawi` a 0,88× (pausada) y `loubna` a 1,00× (natural).

## Capacidades

- Síntesis de voz multihablante en darja argelino con tres personas vocales diferenciadas (`kahwa`, `rawi`, `loubna`).
- Generación de audio a 24 kHz con calidad descrita como de broadcast.
- Soporte de fonología dialectal argelina: consonantes faríngeas, uvulares y velares propias del darja.
- Manejo de alternancia de código árabe-francés mediante transliteración de préstamos franceses a IPA.
- Control de velocidad de habla por persona (factor de cadencia ajustable).
- Pipeline de inferencia autocontenido (Track 1) y carga directa del checkpoint acústico para ajuste fino (Track 2).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta capacidad de clonación de voz zero-shot más allá de las tres personas incluidas.

## Casos de uso

- **Locución de podcasts y contenido urbano:** la persona `kahwa`, con cadencia 1,08× y perfil juvenil, encaja en la producción de introducciones y narraciones de podcasts argelinos, manteniendo la prosodia conversacional del dialecto.
- **Narración de audiolibros y relatos tradicionales:** la persona `rawi`, con cadencia pausada de 0,88× y perfil de narrador de la Casbah, es adecuada para cuentos y contenido narrativo con pausas dramáticas.
- **Asistentes de voz para atención al cliente:** el modelo puede integrarse en sistemas de respuesta por voz para usuarios argelinos, ofreciendo una pronunciación dialectal que mejora la comprensión frente a TTS de árabe estándar.
- **Accesibilidad y lectura de textos:** conversión de texto a voz para personas con discapacidad visual en Argelia, con soporte de préstamos franceses habituales en textos cotidianos.
- **Generación de voces para vídeo y redes sociales:** producción de locuciones para contenido corto en redes, con tres perfiles vocales que cubren registros masculinos y femeninos.
- **Investigación en fonética y dialectología:** el checkpoint `kokoro_arabic.pth` permite explorar representaciones latentes acústicas y ajustar el modelo a otras variantes del árabe magrebí.
- **Prototipado de interfaces conversacionales:** al ser un modelo de 82M parámetros y 0,3 GB, puede desplegarse en entornos con recursos limitados para validar productos de voz antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor publica una evaluación acústica propia sobre 75 generaciones (25 prompts en 5 niveles, tres personas), centrada en distribución de formantes, tasa de cruces por cero y centroide espectral. No son benchmarks estándar de TTS (MOS, WER) ni comparaciones con otros modelos.

| Parámetro | Ejecuciones corruptas / sin ajustar | Arquitectura de producción Hadra-TTS | Estado |
|---|---|---|---|
| Formantes de voz (< 2 kHz) | 5,4 % – 8,5 % | 93,5 % | PASS |
| Energía de ruido (> 4 kHz) | 77,9 % – 85,1 % (siseo severo) | 3,9 % | PASS |

No se han publicado resultados de benchmarks estándar (MOS, CMOS, WER, MCD) en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita; con 82M parámetros en precisión completa el modelo ocupa del orden de 0,3 GB en pesos, por lo que la inferencia cabe holgadamente en GPU consumer.
- **GPU recomendadas:** cualquier GPU con CUDA; el script de ejemplo selecciona `cuda` si está disponible y recurre a CPU en caso contrario. Funciona en RTX 3060, RTX 4090, A100 o H100 sin problemas de memoria.
- **Consumer GPU:** sí, cabe en cualquier GPU consumer moderna e incluso en CPU para inferencia no interactiva.
- **Opciones de despliegue:** el paquete `kokoro` (KPipeline / KModel) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| Hadra-TTS Kokoro 82M | 82M | arq, ar | Apache 2.0 | TTS dialectal argelino sobre StyleTTS2 |
| hexgrad/Kokoro-82M (base) | 82M | Multilingüe (sin darja específico) | Apache 2.0 | TTS generalista StyleTTS2 |
| Modelos TTS multilingües comerciales | no disponible | Amplio, sin cobertura específica de darja | Propietaria | TTS en la nube |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y cobertura idiomática.

## Limitaciones y advertencias

- **Cobertura dialectal acotada:** el modelo está entrenado específicamente para darja argelino; su rendimiento en árabe estándar (`ar`) u otros dialectos magrebíes no está documentado.
- **Riesgo de alucinación acústica:** como todo modelo TTS, puede generar artefactos o pronunciaciones incorrectas en textos fuera de distribución, especialmente con préstamos franceses no incluidos en el diccionario de transliteración.
- **Dependencia de un G2P ligero:** la transliteración de préstamos franceses se basa en un diccionario manual limitado (10 entradas en el ejemplo), lo que puede degradar la naturalidad en textos con francés abundante.
- **Evaluación limitada:** los únicos datos de rendimiento son métricas acústicas internas (formantes, ruido), sin MOS ni WER publicados; no hay validación por hablantes nativos documentada.
- **Sesgos:** no se documentan sesgos de género, edad o registro más allá de las tres personas vocales disponibles; la cobertura de acentos regionales argelinos no está especificada.
- **Licencia:** Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los corpus de audio de entrenamiento (`oddadmix/*`) antes de un despliegue comercial.
- **Madurez:** el repositorio tiene pocas descargas (58) y ningún "like", lo que sugiere un modelo reciente y con escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/touati-kamel/Hadra-TTS-kokoro
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Dataset de audio argelino (kahwa podcast): https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-kahwa-postcast
- Dataset de audio argelino (rawi): https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-rawi
- Dataset de audio argelino (loubna stories): https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-loubna-stories
