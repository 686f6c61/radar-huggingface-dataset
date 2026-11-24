# tencent/WeMM-Video-35BA3B-GGUF

## Resumen

WeMM-Video-35B-A3B es un modelo omnicanal bilingüe (chino-inglés) desarrollado por Tencent para comprensión y razonamiento conjunto de audio y vídeo. Acepta texto, imágenes, audio y vídeo como entradas y genera respuestas de texto, lo que lo sitúa en la categoría de modelos video-text-to-text con capacidades multimodales completas. La variante aquí descrita es el bundle GGUF Q4_K_M, empaquetado específicamente para el runtime nativo de WeMM, no para llama.cpp ni Ollama.

El modelo emplea una arquitectura MoE (Mixture of Experts) con 35 000 millones de parámetros totales y 3 000 millones activos por token, lo que permite un coste de inferencia muy inferior al de un modelo denso de su tamaño. El nombre "A3B" hace referencia a esos 3B parámetros activos. Es relevante ahora porque combina comprensión de vídeo con audio sincronizado en un único modelo abierto bajo licencia Apache 2.0, una combinación poco frecuente en el ecosistema open source.

La cuantización Q4_K_M reduce el peso del modelo de lenguaje a 22,61 GiB, con el codificador visual (0,84 GiB) y el codificador de audio (1,99 GiB) como ficheros GGUF separados. El bundle está pensado para ejecutarse con el runtime nativo de Tencent, que soporta offload a CUDA, y no es directamente compatible con el ecosistema GGUF estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) multimodal con codificadores de visión y audio |
| Parametros totales | 35B (aproximado según nomenclatura; el dato safetensors del repo GGUF reporta 1.070.382.088, correspondiente solo a una parte del bundle) |
| Parametros activos | 3B (aproximado, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (receta que preserva tensores de atención e input/output seleccionados en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (componentes de terceros sujetos a sus términos originales) |
| Formato de pesos | GGUF (tres ficheros: language.gguf, mmproj.gguf, audio.gguf) |

## Arquitectura y entrenamiento

WeMM-Video-35B-A3B es un modelo MoE multimodal que integra tres componentes: un modelo de lenguaje con arquitectura de mezcla de expertos (etiquetado internamente como `wemm_qwen3_5_moe`), un codificador visual y un codificador de audio, cada uno con su proyector correspondiente. El pipeline `video-text-to-text` indica que la entrada principal es vídeo, aunque también acepta imágenes y audio por separado. La arquitectura exacta del transformer, el número de capas, la dimensión oculta y la composición del dataset de entrenamiento no se detallan en la información disponible.

El bundle GGUF incluye tres ficheros que deben mantenerse en la misma revisión del Hub: `language.gguf` (22,61 GiB, contiene el modelo de lenguaje, el tokenizador y la plantilla de chat), `mmproj.gguf` (0,84 GiB, codificador visual y proyector) y `audio.gguf` (1,99 GiB, codificador de audio y proyector). La receta Q4_K_M protege tensores seleccionados de atención e input/output en BF16 para preservar calidad. No se especifican en la información disponible detalles sobre RLHF, DPO, número de tokens de entrenamiento ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Comprensión conjunta de vídeo y audio: procesa fotogramas de vídeo junto con la pista de audio original para describir escenas y resumir el habla de forma integrada.
- Comprensión de imágenes: describe y razona sobre imágenes estáticas mediante el codificador visual.
- Comprensión de audio: transcripción y análisis de habla en grabaciones de audio.
- Generación de texto y razonamiento: responde a preguntas de razonamiento y cálculo (el ejemplo de la model card incluye un problema aritmético de horarios).
- Procesamiento multimodal por separado: permite enviar solo texto, solo imagen, solo audio, solo vídeo o vídeo con audio.
- Capacidades multilingües: soporte declarado de inglés y chino.
- Control de fotogramas: el runtime permite limitar el número de fotogramas procesados (`--max-frames`), lo que facilita ajustar coste y latencia.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar la pista de audio y los fotogramas de una grabación para generar resúmenes de lo tratado y describir lo que ocurre en pantalla, aprovechando la comprensión conjunta de audio y vídeo.
- Accesibilidad y subtitulado enriquecido: transcripción del habla combinada con descripción de la escena visual, útil para generar pistas de audio-descripción o subtítulos que incluyan contexto visual.
- Moderación de contenido audiovisual: análisis de vídeos subidos por usuarios para detectar y describir contenido en imagen y audio de forma conjunta, con salida textual estructurada.
- Indexación y búsqueda semántica de archivos multimedia: generación de descripciones textuales de vídeos, imágenes y audios para alimentar un motor de búsqueda o un sistema RAG sobre una videoteca.
- Transcripción y análisis de grabaciones de audio: uso del codificador de audio para transcribir entrevistas, notas de voz o podcasts y responder preguntas sobre su contenido.
- Asistencia en análisis de imágenes técnicas: descripción de fotografías o capturas (por ejemplo, imágenes de satélite o documentación visual) mediante el codificador visual y el modelo de lenguaje.
- Prototipado de asistentes multimodales en local: despliegue con el runtime nativo en CPU o con offload a CUDA para entornos de desarrollo que necesiten procesar vídeo y audio sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la sección de evaluación del modelo base (`tencent/WeMM-Video-35BA3B`) y al informe técnico (arXiv:2611.26409) para la comparación de benchmarks, pero los datos concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle Q4_K_M suma aproximadamente 25,4 GiB en disco (22,61 + 0,84 + 1,99 GiB); en memoria se necesita espacio para los pesos cuantizados más las activaciones y la caché KV, cuyo tamaño depende de la longitud de contexto (no disponible).
- GPU recomendadas: no se especifican en la información disponible. Por el volumen del bundle, una GPU de 24 GB (RTX 4090) queda ajustada para cargar los tres componentes completos en VRAM; GPU de 40-80 GB (A100, H100) ofrecen margen para contexto largo y procesamiento de más fotogramas.
- ¿Cabe en consumer GPU? El fichero de lenguaje por sí solo (22,61 GiB) roza el límite de una RTX 4090 de 24 GB; con los codificadores adicionales es probable que requiera offload parcial a CPU o cuantizaciones más agresivas no incluidas en este bundle.
- Opciones de despliegue: exclusivamente el runtime nativo de WeMM (`native/run_hf.py`), con soporte de offload a CUDA según la guía del repositorio. No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI; el tag `custom_code` y la dependencia de tres ficheros GGUF coordinados sugieren que el ecosistema GGUF estándar no es compatible directamente.
- Latencia y throughput: no disponibles. La validación reportada por el autor confirma que el runtime nativo en CPU completó comprobaciones de generación para texto, imagen, audio y vídeo con banda sonora.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos omnicanales de vídeo y audio, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones o transcripciones inexactas, especialmente en audio con ruido o vídeos de baja calidad; no se documentan tasas de error.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar el procesamiento de vídeos largos; el runtime permite limitar fotogramas, pero se desconoce cuántos caben en la ventana.
- Compatibilidad de despliegue: el bundle depende del runtime nativo de WeMM y de mantener los tres ficheros GGUF en la misma revisión; no es portable a herramientas GGUF convencionales.
- Licencia: Apache 2.0 permite uso comercial, pero los componentes de terceros incluidos conservan sus términos originales, que deben revisarse antes de producción.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado principalmente con datos en inglés y chino, es esperable un sesgo cultural y lingüístico hacia esos contextos.
- Madurez: el modelo se publicó en noviembre de 2026 y el runtime nativo está en fase inicial; la validación reportada es funcional (comprobaciones de generación), no una evaluación exhaustiva de calidad en producción.

## Enlaces

- Hugging Face (bundle GGUF): https://huggingface.co/tencent/WeMM-Video-35BA3B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Colección WeMM-Video en Hugging Face: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Licencia y atribución de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
