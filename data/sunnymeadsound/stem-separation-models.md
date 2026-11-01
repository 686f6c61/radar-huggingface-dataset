# sunnymeadsound/stem-separation-models

## Resumen

`sunnymeadsound/stem-separation-models` es un repositorio que agrupa conversiones a Core ML de seis modelos comunitarios de separación de fuentes musicales (stem separation), utilizados por la aplicación Lightspeed Separator en macOS. No se trata de un modelo entrenado por el autor del repositorio, sino de un contenedor de pesos convertidos a formato `.mlpackage` en precisión fp16, empaquetados en archivos zip y distribuidos con verificación de integridad mediante SHA-256 declarada en un `manifest.json`. La app descarga cada modelo la primera vez que se necesita, fijado a un commit concreto del repositorio.

La relevancia de este repositorio es práctica más que investigadora: ofrece un conjunto de modelos de separación de alta calidad (arquitecturas BS-Roformer y MDX23C, entre otras) listos para ejecutarse en Apple Silicon mediante Core ML, sin necesidad de frameworks de Python en tiempo de inferencia. Cubre casos como separación en 6 stems (voces, batería, bajo, guitarra, piano y otros), separación vocals/instrumental y extracción de pistas de karaoke.

El repositorio ocupa 1,8 GB en total y no incluye un pipeline de HuggingFace declarado ni idiomas asociados, ya que trabaja exclusivamente con tensores de audio. La licencia es heterogénea: cada modelo conserva la licencia publicada por su autor original, y en varios casos no se publicó licencia alguna, lo que impide otorgar derechos de uso desde este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-Roformer y MDX23C (por modelo); conversión a Core ML mlprogram |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelos de audio; entrada/salida son tensores de espectrograma) |
| Tipos de cuantizacion | fp16 (mlprogram) |
| Idiomas soportados | no disponible (no aplica; procesamiento de audio) |
| Licencia | per-model (ver LICENSES.md); otros sin licencia publicada, GPL-3.0 en un caso |
| Formato de pesos | `.mlpackage` comprimido en zip (Core ML) |
| Tamano del repositorio | 1,8 GB |
| Requisito de sistema | macOS 14 o superior; macOS 15 para MVSep Mega 53 |
| Preprocesado | STFT/iSTFT realizados en la app; el modelo recibe y devuelve espectrogramas |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: recoge conversiones a Core ML de pesos ya entrenados por terceros. Las arquitecturas subyacentes son BS-Roformer (variantes SW de 6 stems, Leap vocals/instrumental y dos variantes de karaoke) y MDX23C (DrumSep de 6 stems), además de MVSep Mega 53 Stems v1 de ZFTurbo/MVSep. La conversión se realiza a `mlprogram` en fp16, y el modelo opera sobre tensores de espectrograma: la transformada STFT y su inversa se ejecutan en la aplicación anfitriona, no dentro del grafo Core ML. Cada carpeta documenta las formas (shapes) de entrada y salida esperadas.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento, ni sobre si hubo etapas de RLHF o ajuste fino por preferencias, ya que esos detalles pertenecen a los autores originales y no se recogen en la model card. La innovación técnica destacable es la distribución verificable: cada descarga se fija a un commit y se valida contra el SHA-256 del `manifest.json`, lo que mitiga el riesgo de pesos alterados en tránsito.

## Capacidades

- Separación de fuentes musicales en 6 stems: BS-Roformer SW y DrumSep MDX23C permiten aislar voces, batería, bajo, guitarra, piano y otros.
- Separación binaria vocals/instrumental: BS-Roformer Leap (unwa/pcunwa) genera dos salidas de 111 MB cada una.
- Extracción de pistas de karaoke: dos variantes BS-Roformer (anvuew; frazer y becruily) orientadas a eliminar o aislar la voz principal.
- Separación masiva en 53 stems: MVSep Mega 53 Stems v1 (ZFTurbo/MVSep) con tres archivos (71 MB, 60 MB y 708 MB).
- Ejecución nativa en Apple Silicon vía Core ML, con aceleración por GPU y Neural Engine del sistema.
- Procesamiento por espectrograma: la app realiza STFT/iSTFT, por lo que el modelo es agnóstico al formato de audio de entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso

- Producción musical y remezclas: separar una mezcla en 6 stems permite reequilibrar niveles, sustituir la batería o procesar la voz por separado sin disponer de las pistas originales; BS-Roformer SW es la opción de mayor granularidad del repositorio.
- Karaoke y eliminación de voz: las variantes de anvuew y de frazer/becruily generan una pista instrumental limpia a partir de una canción comercial, adecuadas para apps de karaoke o para creadores que necesitan bases instrumentales.
- Muestreo y producción de hip-hop/electrónica: aislar batería o bajo con DrumSep MDX23C facilita la extracción de samples limpios y su reutilización en nuevas producciones.
- Restauración y postproducción de audio: separar voces del acompañamiento permite aplicar reducción de ruido o ecualización específica a cada fuente en doblaje y podcasting musical.
- Investigación en music information retrieval: el repositorio sirve como banco de modelos preconvertidos para comparar arquitecturas BS-Roformer y MDX23C sobre el mismo pipeline Core ML, sin montar entornos Python.
- Aplicaciones macOS nativas: al ser `.mlpackage` fp16 con requisito de macOS 14 (o 15 para Mega 53), cualquier app Swift puede integrar estos modelos y descargarlos bajo demanda con verificación SHA-256, replicando el patrón de Lightspeed Separator.
- Archivística y catalogación musical: la separación en 53 stems de MVSep Mega permite analizar la composición instrumental de grabaciones históricas para tareas de preservación y estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: no disponible de forma explícita; el mayor artefacto individual es de 708 MB (MVSep Mega 53), y el conjunto completo ocupa 1,8 GB, por lo que el pico de memoria durante la inferencia será del orden de unos pocos GB, aunque no se documenta la cifra exacta.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con macOS 14 o superior; macOS 15 para MVSep Mega 53.
- GPU NVIDIA/AMD: no soportadas por el formato Core ML; para esos entornos habría que recurrir a los pesos originales de cada autor.
- Cabe en equipos consumer: sí, en cualquier Mac con Apple Silicon y macOS 14+, dado el tamaño reducido de cada modelo individual.
- Opciones de despliegue: Core ML nativo (`.mlpackage`), integración en apps Swift/SwiftUI; no se distribuyen pesos en GGUF, safetensors ni ONNX en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BS-Roformer SW (este repo) | BS-Roformer | 6 | Core ML fp16 | Sin licencia publicada por el autor | 328 MB, macOS 14+ |
| DrumSep MDX23C (este repo) | MDX23C | 6 | Core ML fp16 | Sin licencia publicada por los autores | 201 MB, macOS 14+ |
| BS-Roformer Leap (este repo) | BS-Roformer | 2 (vocals/instrumental) | Core ML fp16 | Sin licencia publicada por el autor | 111 MB × 2, macOS 14+ |
| MVSep Mega 53 Stems v1 (este repo) | no disponible | 53 | Core ML fp16 | Sin licencia específica para pesos (código MIT) | 71 + 60 + 708 MB, macOS 15+ |
| Demucs (referencia externa) | Híbrido transformer/CNN | 4 | PyTorch | MIT | Pesos originales en PyTorch |
| Spleeter (referencia externa) | U-Net | 2, 4 o 5 | TensorFlow | MIT | Pesos originales en TensorFlow |

La comparativa con Demucs y Spleeter se incluye como referencia de categoría; no se dispone de métricas comparativas de calidad (SDR, SI-SDR) en la información proporcionada.

## Limitaciones y advertencias

- Licencias heterogéneas y en gran parte ausentes: cuatro de los seis modelos no tienen licencia publicada por sus autores, por lo que el repositorio no concede derechos de uso; el uso comercial de esos pesos queda a criterio del usuario y con riesgo legal.
- Solo un modelo (Karaoke BS-Roformer de anvuew) declara GPL-3.0, lo que impone obligaciones de copyleft si se redistribuye o se integra en software derivado.
- Dependencia de plataforma: los `.mlpackage` solo se ejecutan en macOS 14+ (15+ para Mega 53) sobre Apple Silicon; no hay soporte para Linux, Windows ni GPUs NVIDIA.
- Los modelos no incluyen el preprocesado de audio: la app debe implementar STFT/iSTFT y respetar las formas de tensor documentadas en cada carpeta; un desajuste produce salidas incorrectas.
- No hay información sobre sesgos, alucinaciones ni calidad subjetiva de la separación; al ser modelos de audio, el riesgo relevante es de artefactos y sangrado entre stems, no de alucinación textual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- La verificación SHA-256 depende de que el `manifest.json` se mantenga íntegro y actualizado; conviene fijar commits concretos en producción.
- No se documentan métricas de rendimiento (SDR, latencia, throughput), por lo que la evaluación de calidad debe hacerse empíricamente antes de desplegar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sunnymeadsound/stem-separation-models
- Licencias por modelo: https://huggingface.co/sunnymeadsound/stem-separation-models/blob/main/LICENSES.md
- Carpeta BS-Roformer SW (6 stems): https://huggingface.co/sunnymeadsound/stem-separation-models/tree/main/bs-roformer-sw-6stem
- Carpeta DrumSep MDX23C (6 stems): https://huggingface.co/sunnymeadsound/stem-separation-models/tree/main/drumsep-mdx23c-6stem
- Carpeta BS-Roformer Leap: https://huggingface.co/sunnymeadsound/stem-separation-models/tree/main/bs-roformer-leap
- Carpeta Karaoke BS-Roformer (anvuew): https://huggingface.co/sunnymeadsound/stem-separation-models/tree/main/karaoke-bs-roformer-anvuew
- Carpeta Karaoke BS-Roformer (frazer y becruily): https://huggingface.co/sunnymeadsound/stem-separation-models/tree/main/karaoke-bs-roformer-becruily
- Carpeta MVSep Mega 53 Stems v1: https://huggingface.co/sunnymeadsound/stem-separation-models/tree/main/mvsep-mega-53-stems
- MVSep (ZFTurbo): https://mvsep.com
- Aplicación Lightspeed Separator: no disponible
