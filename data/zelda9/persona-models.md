# zelda9/persona-models

## Resumen

`zelda9/persona-models` no es un modelo entrenado, sino un repositorio agregador de modelos ONNX de terceros empaquetados para su ejecución en el navegador mediante ONNX Runtime Web. El autor (zelda9) recopila las copias que utiliza su aplicación web useotools.com, de modo que cada artefacto conserva la licencia de su proyecto original y no se ha realizado ningún entrenamiento propio. El único cambio técnico declarado es el reempaquetado del modelo ISNet con pesos almacenados a 7 bits por canal y comprimido con gzip para reducir la descarga.

El repositorio cubre un conjunto heterogéneo de tareas de visión y audio: segmentación de imagen y eliminación de fondo (ISNet), inpainting (MI-GAN y big-LaMa), segmentación guiada por prompt (MobileSAM), superresolución 4x (Real-ESRGAN en varias variantes), colorización de fotografías en blanco y negro (DDColor-tiny), reconocimiento de voz (Whisper base, small y large-v3-turbo), síntesis de voz (Kokoro-82M), traducción automática (18 pares de Opus-MT cuantizados a int8) y corrección gramatical (Harper 3.0.0 y T5-tiny).

Su relevancia es práctica: ofrece un conjunto coherente de grafos ONNX listos para inferencia en cliente (WebGPU/WASM) sin dependencia de servidor, con un tamaño total de repositorio de 5,4 GB. No debe confundirse con un modelo único ni con un checkpoint con parámetros y contexto propios; las especificaciones de arquitectura y contexto varían por cada submodelo incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección de grafos ONNX de arquitecturas diversas (CNN para segmentación e inpainting, transformer para ASR/TTS/traducción, encoder-decoder T5 para gramática) |
| Parametros totales | No disponible como cifra única; depende de cada submodelo (p. ej. Kokoro-82M, Whisper large-v3-turbo, Opus-MT int8 ~110 MB por par) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (varía por submodelo; no declarada en la model card) |
| Tipos de cuantizacion | Pesos ISNet a 7 bits por canal; Opus-MT int8; Whisper large-v3-turbo en q4f16; DDColor-tiny en fp16 con casting a float32 en carga; Kokoro en q8 |
| Idiomas soportados | No disponible de forma agregada; Whisper multilingüe, Kokoro inglés, Opus-MT con 18 pares de traducción |
| Licencia | Mixta: MIT, Apache-2.0, BSD-3-Clause y CC-BY-4.0 según carpeta (cada submodelo conserva su licencia original) |
| Formato de pesos | ONNX (algunos comprimidos con gzip: `.onnx.gz`), más ficheros de configuración y tokenizer; Harper en WASM (`.wasm.gz`) |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio: todos los pesos son copias de modelos abiertos publicados por sus autores originales (ISNet/DIS, MI-GAN, big-LaMa, MobileSAM, Real-ESRGAN, DDColor, Whisper, Kokoro-82M, Opus-MT, Harper y T5-tiny). Las arquitecturas, por tanto, son las de cada proyecto de origen: redes convolucionales para segmentación, matting e inpainting; un encoder ViT ligero con decodificador de máscaras en MobileSAM; generadores GAN para superresolución y colorización; transformers encoder-decoder para ASR, TTS y traducción; y un modelo T5 eficiente para corrección gramatical.

Las únicas modificaciones declaradas son de empaquetado y precisión: ISNet se almacena a 7 bits por canal y comprimido con gzip; Opus-MT se distribuye cuantizado a int8; Whisper large-v3-turbo en q4f16; Kokoro en q8; y DDColor-tiny se exporta en fp16 pero cada peso se convierte a float32 al cargar, porque según el autor la aritmética fp16 producía colores incorrectos en WebGPU. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que corresponden a los proyectos originales.

## Capacidades

- Eliminación de fondo y segmentación general de imágenes con ISNet (pesos a 7 bits, gzip).
- Inpainting de imágenes con MI-GAN (pipeline completo) y big-LaMa a resolución 512 × 512.
- Segmentación guiada por prompt mediante encoder MobileSAM y decodificador de máscaras tipo Segment Anything.
- Superresolución 4x con Real-ESRGAN: variante general con tres niveles de ruido (dn0, dn50, dn100), x4plus y x4plus-anime-6b.
- Colorización de fotografías en blanco y negro con DDColor-tiny a 512 × 512.
- Reconocimiento de voz (audio a texto) con Whisper base, small y large-v3-turbo (q4f16).
- Síntesis de voz en inglés con Kokoro-82M v1.0, con seis voces incluidas.
- Traducción automática de texto en 18 pares de idiomas con Opus-MT int8 (en-hi, hi-en, en-ar, ar-en, en-zh, zh-en, en-es, es-en, en-fr, fr-en, en-de, de-en, ru-en, ja-en, ko-en, id-en, mul-en, en-mul).
- Corrección gramatical con Harper 3.0.0 (reglas WASM) y T5 efficient tiny.
- Ejecución en el navegador del visitante mediante ONNX Runtime Web (WebGPU/WASM), sin backend propio.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre general.

## Casos de uso

- Edición fotográfica en el navegador: eliminar el fondo de retratos o productos con ISNet antes de subirlos a un catálogo, sin enviar la imagen a un servidor y con un grafo ONNX optimizado para WebGPU/WASM.
- Retoque y restauración de imágenes: borrar objetos no deseados con big-LaMa (512 × 512) o MI-GAN directamente en el cliente, útil en herramientas de edición web donde la latencia de red es crítica.
- Recorte interactivo por prompt: usar MobileSAM para que el usuario seleccione un objeto con un clic y obtener la máscara al instante, adecuado para editores de imágenes o flujos de anotación ligera.
- Re escalado de material gráfico: aplicar Real-ESRGAN 4x a capturas, ilustraciones o fotos antiguas; la variante anime-6b sirve para arte digital y la general con tres niveles de ruido permite ajustar el resultado según la calidad de origen.
- Digitalización de archivos familiares: colorizar fotografías en blanco y negro con DDColor-tiny a 512 × 512 y, combinado con Real-ESRGAN, obtener una versión ampliada y coloreada en el propio navegador.
- Transcripción de audio en cliente: dictado o subtitulado con Whisper base/small para CPU y large-v3-turbo (q4f16) para GPU, sin coste de API y con la privacidad del procesamiento local.
- Accesibilidad y lectura en voz alta: sintetizar texto en inglés con Kokoro-82M (q8) y seis voces para aplicaciones web de lectura asistida.
- Traducción integrada en una web: incorporar cualquiera de los 18 pares de Opus-MT int8 (~110 MB por par) para traducir contenidos bajo demanda sin depender de un servicio externo.
- Revisión ortográfica y gramatical en editores: ejecutar Harper 3.0.0 (WASM) y T5-tiny para sugerencias gramaticales en tiempo real dentro del navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 5,4 GB; la descarga efectiva depende de los submodelos que se carguen en cada caso.
- Inferencia pensada para ONNX Runtime Web: WebGPU para aceleración por GPU del navegador y WASM como alternativa en CPU.
- Whisper base y small están indicados por el autor para el procesador y la tarjeta gráfica; large-v3-turbo (q4f16) solo para la tarjeta gráfica.
- Opus-MT int8 ocupa aproximadamente 110 MB por par de idiomas, por lo que es viable en equipos de consumo si se carga un único par.
- ISNet a 7 bits y gzip reduce el peso de descarga respecto al original; no se especifica la cifra exacta.
- No se proporcionan estimaciones de VRAM, GPU recomendadas (A100, H100, RTX 4090, etc.), latencia ni throughput.
- Opciones de despliegue: ONNX Runtime Web (WebGPU/WASM) en navegador; los grafos ONNX también pueden ejecutarse con otros runtimes ONNX fuera del navegador, aunque el autor no documenta configuraciones de servidor (vLLM, llama.cpp, Ollama, TGI no aplican a estos modelos).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zelda9/persona-models | Colección ONNX para navegador (segmentación, inpainting, ASR, TTS, traducción, gramática) | No disponible (agregado) | No disponible | Mixta (MIT, Apache-2.0, BSD-3-Clause, CC-BY-4.0) | Hugging Face, 0 descargas, 0 likes |
| rembg / xuebinqin/DIS (ISNet) | Segmentación y eliminación de fondo | No disponible | No aplica | Apache-2.0 | Repositorio original en GitHub; el paquete rembg lo distribuye |
| onnx-community/whisper-* | ASR ONNX | Según variante (base, small, large-v3-turbo) | No disponible | Apache-2.0 / MIT | Hugging Face, ampliamente usado |
| onnx-community/Kokoro-82M-v1.0-ONNX | TTS | 82M | No disponible | Apache-2.0 | Hugging Face |
| Xenova/opus-mt-* | Traducción ONNX int8 | ~110 MB por par | No disponible | CC-BY-4.0 o Apache-2.0 según modelo | Hugging Face |

La diferencia principal frente a los originales es el empaquetado para ejecución en navegador (gzip, cuantizaciones concretas y estructura de carpetas), no una mejora de calidad o rendimiento; no hay datos que permitan comparar métricas.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier sesgo o limitación proviene de los modelos originales (ISNet, MI-GAN, LaMa, MobileSAM, Real-ESRGAN, DDColor, Whisper, Kokoro, Opus-MT, Harper, T5-tiny).
- Riesgo de alucinación inherente a los submodelos generativos: Whisper puede inventar texto en audio ruidoso y Opus-MT puede producir traducciones incorrectas en dominios especializados.
- La colorización con DDColor-tiny puede generar colores plausibles pero no históricamente fieles; el autor advierte que la aritmética fp16 daba colores erróneos en WebGPU y se corrige con casting a float32 en carga.
- Idiomas: Kokoro solo sintetiza inglés; Opus-MT cubre 18 pares concretos; Whisper es multilingüe pero no se detalla la cobertura exacta en esta ficha.
- Licencia mixta: cada carpeta tiene su propia licencia (MIT, Apache-2.0, BSD-3-Clause, CC-BY-4.0); es obligatorio revisar el fichero `LICENSE` de cada subcarpeta antes de uso comercial, y algunos modelos de Opus-MT usan CC-BY-4.0, que exige atribución.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de validación ni mantenimiento continuado.
- Ejecución en navegador: el rendimiento depende de WebGPU/WASM del cliente; no se publican cifras de latencia ni throughput, y large-v3-turbo solo es viable en GPU.
- No se documentan longitudes de contexto, datos de entrenamiento ni evaluaciones de seguridad para ningún submodelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zelda9/persona-models
- Aplicación del autor: https://useotools.com
- ISNet / DIS: https://github.com/xuebinqin/DIS
- MI-GAN: https://github.com/Picsart-AI-Research/MI-GAN y https://huggingface.co/andraniksargsyan/migan
- big-LaMa: https://github.com/advimman/lama y https://huggingface.co/Carve/LaMa-ONNX
- MobileSAM: https://github.com/ChaoningZhang/MobileSAM y https://huggingface.co/Acly/MobileSAM
- Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN, https://huggingface.co/warpstead/enhance-models, https://huggingface.co/deepghs/imgutils-models
- DDColor: https://github.com/piddnad/DDColor y https://huggingface.co/edgetools/ddcolor
- Whisper: https://github.com/openai/whisper y https://huggingface.co/onnx-community
- Kokoro-82M: https://github.com/hexgrad/Kokoro-82M y https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Opus-MT: https://github.com/Helsinki-NLP/Opus-MT y https://huggingface.co/Xenova
- Harper: paquete npm de Harper 3.0.0 (Elijah Potter y Automattic); no se incluye enlace directo en la model card.
