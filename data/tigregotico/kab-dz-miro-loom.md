# TigreGotico/kab-DZ-miro-loom

## Resumen

kab-DZ-miro-loom es un modelo de síntesis de voz (text-to-speech) para el idioma cabilio (kabyle, código `kab`), desarrollado por TigreGotico. Empaqueta en un único fichero GGUF la voz VITS original de Phoonnx (`Phoonnx/phoonnx_kab-DZ_miro_o2i`) junto con su front-end de procesamiento lingüístico: el intérprete Lua de orthography2ipa y las reglas compiladas para el dialecto kab-DZ. El objetivo es ofrecer un artefacto autocontenido que convierte texto cabilio en ortografía latina directamente en audio, sin dependencias externas de normalización de texto.

El modelo se distribuye para el motor `loom-py-rt` 1.0.0, una runtime propia del ecosistema loom, y no sigue el pipeline estándar de transformers. La arquitectura interna es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), con 15.634.371 parámetros totales y una salida de audio a 22050 Hz. El repositorio ocupa aproximadamente 0,1 GB.

Su relevancia es acotada pero específica: cubre una lengua minoritaria (el cabilio, hablado principalmente en Argelia) con una licencia permisiva Apache 2.0 y un formato que integra tanto la fonemización como la síntesis en un solo fichero. No es un modelo de lenguaje general ni compite en la categoría de LLM; es un componente de TTS de nicho para aplicaciones de accesibilidad, preservación lingüística o interfaces de voz en cabilio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) con front-end orthography2ipa |
| Parámetros totales | 15.634.371 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible (se distribuye en GGUF; no se detallan variantes) |
| Idiomas soportados | cabilio (kab), ortografía latina, dialecto kab-DZ |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`kab-DZ-miro-tts.gguf`) |
| Frecuencia de muestreo de salida | 22050 Hz |
| Runtime requerida | loom-py-rt 1.0.0 |
| Tamaño del repositorio | ~0,1 GB |
| Versión de orthography2ipa | 7.133.1a3 |
| Revisión de especificación o2i | sha256:95d07b558acd360ba50ce8670d4affafd5916f54557fe071f9f25fbf41855001 |
| SHA256 del GGUF | 880b0c9a63b6d833a2656628d1c351ae22c609b7c94abec36f10a4d0aeb62fd0 |

## Arquitectura y entrenamiento

El modelo es una exportación de un checkpoint VITS entrenado originalmente por Phoonnx, convertido al formato GGUF mediante la herramienta loom-exporter (issue loom-ai-org/loom-exporter#101). El proceso de build parte del checkpoint `epoch=2499-step=1950648.ckpt` y del `phoneme_id_map` de la voz, y posteriormente se le antepone el front-end mediante `scripts/merge_frontend.py`, que integra el intérprete Lua de orthography2ipa y las reglas kab-DZ en el mismo fichero GGUF. VITS combina un encoder de texto, un decoder generativo basado en flujos normales y un discriminador adversarial para producir audio de forma end-to-end a partir de fonemas.

El front-end orthography2ipa realiza la conversión de ortografía latina cabilia a IPA (fonemas). Según la model card, el cabilio no requiere normalización de texto, por lo que orthography2ipa constituye la totalidad del preprocesado lingüístico. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo TTS, estos datos no son directamente equiparables a los de un LLM.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto cabilio en ortografía latina, con salida a 22050 Hz.
- Fonemización explícita: el método `phonemize` devuelve la transcripción IPA del texto de entrada.
- Inferencia con control de semilla (`seed`) para reproducibilidad del audio generado.
- Front-end integrado: no requiere librerías externas de normalización ni de conversión grafema-fonema.
- Artefacto autocontenido en un único GGUF que incluye grafos VITS, intérprete o2i y reglas kab-DZ.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades propias de LLM; es exclusivamente un modelo de voz.
- Capacidad multilingüe: limitada al cabilio (kab); no se declaran otros idiomas.

## Casos de uso

- Accesibilidad para hablantes de cabilio: lectura en voz alta de textos, noticias o documentos en cabilio para personas con discapacidad visual, aprovechando la conversión directa de ortografía latina a audio sin preprocesado adicional.
- Preservación lingüística: generación de corpus de audio en cabilio a partir de textos escritos, útil para documentación y enseñanza de la lengua.
- Interfaces de voz en aplicaciones locales: integración en asistentes o sistemas de megafonía para comunidades cabilófonas, dado el reducido tamaño del modelo (~0,1 GB) y su bajo coste computacional (RTF 0,039 en CPU de portátil).
- Audiolibros y contenido educativo: síntesis de material didáctico en cabilio con control de semilla para reproducir exactamente el mismo audio en distintas ejecuciones.
- Pruebas de calidad de fonemización: uso del método `phonemize` para validar reglas ortográficas kab-DZ contra la implementación Python de referencia, como hace el propio autor en sus checks.
- Sistemas embebidos o de borde: al ejecutarse en CPU con un factor de tiempo real muy bajo, puede desplegarse en dispositivos sin GPU para tareas de TTS en tiempo real.
- Investigación en TTS para lenguas de bajos recursos: punto de partida reproducible (build documentado) para experimentar con VITS en lenguas minoritarias.

## Benchmarks y rendimiento

Los datos disponibles provienen de los checks del autor sobre frases de Common Voice Kabyle, ejecutados en loom-py-rt 1.0.0:

| Prueba | Resultado |
|---|---|
| IPA del fichero frente a `orthography2ipa.transcribe(text, "kab-DZ")`, 2000 frases | 2000 idénticas |
| Audio desde texto frente a audio desde ids propios de phoonnx, misma semilla, 50 frases | 50 idénticos |
| WER de ASR (conformer cabilio de NVIDIA), 50 frases | 0,360 (voz ONNX de phoonnx: 0,372) |
| Factor de tiempo real (RTF), CPU de portátil | 0,039 |

No se han publicado resultados de benchmarks estándar de TTS (MOS, MCD, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma significativa; el modelo tiene ~15,6 M de parámetros y el repositorio ocupa ~0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; el autor reporta ejecución en CPU de portátil con RTF de 0,039 (unas 25 veces más rápido que tiempo real).
- Cabe en GPU consumer: sí, con enorme margen (cualquier GPU con unos pocos cientos de MB libres).
- Opciones de despliegue: exclusivamente mediante `loom-py-rt` 1.0.0 (`pip install loom-py-rt==1.0.0`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: RTF de 0,039 en CPU de portátil según el autor; no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idioma | Formato | Licencia |
|---|---|---|---|---|---|
| kab-DZ-miro-loom (este) | VITS TTS + front-end integrado | 15,6 M | cabilio (kab) | GGUF (loom) | Apache 2.0 |
| Phoonnx/phoonnx_kab-DZ_miro_o2i | VITS TTS (modelo base) | no disponible | cabilio (kab) | ONNX | no disponible |
| Modelos Piper para otras lenguas | VITS TTS | variable | múltiples | ONNX | variable |

La comparación más directa es con el modelo base de Phoonnx, del que este deriva: la diferencia principal es el empaquetado (GGUF con front-end integrado frente a ONNX con ids de fonemas) y una ligera mejora de WER reportada (0,360 frente a 0,372). No se dispone de datos de benchmarks comparables con otros sistemas TTS para lenguas minoritarias en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo idioma (cabilio, kab-DZ); no admite entradas en otras lenguas ni traducción.
- Dependencia estricta de `loom-py-rt` 1.0.0; no es compatible con runtimes estándar de TTS (ONNX Runtime, PyTorch, etc.) sin conversión.
- El WER de 0,360 medido con un ASR externo indica una inteligibilidad limitada; no es un sistema de alta fidelidad y puede requerir validación por hablantes nativos.
- No se documentan sesgos específicos, pero al entrenarse sobre Common Voice y datos de Phoonnx puede heredar sesgos de acento, género o registro de esas fuentes.
- Riesgo de artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario o en variantes ortográficas no cubiertas por las reglas kab-DZ.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base de Phoonnx debe verificarse por separado (su licencia figura como no disponible en la información recogida).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- No apto para tareas de razonamiento, generación de texto, código o agentes; cualquier uso fuera de TTS es inadecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigreGotico/kab-DZ-miro-loom
- Modelo base: https://huggingface.co/Phoonnx/phoonnx_kab-DZ_miro_o2i
- Repositorio orthography2ipa: https://github.com/TigreGotico/orthography2ipa
- Issue de loom-exporter: https://github.com/loom-ai-org/loom-exporter/issues/101
