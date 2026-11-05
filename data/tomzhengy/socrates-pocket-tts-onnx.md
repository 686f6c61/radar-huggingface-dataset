# tomzhengy/socrates-pocket-tts-onnx

## Resumen

Socrates Pocket TTS ONNX es una exportación a ONNX Runtime del modelo de síntesis de voz Pocket TTS de Kyutai, concretamente la variante `english_2026-10` con la voz `stuart_bell`. El autor de la exportación es tomzhengy, y el modelo está pensado para la aplicación de lectura Socrates, que narra libros en iPhone y iPad íntegramente en el dispositivo. Se trata, por tanto, de un artefacto de despliegue más que de un modelo entrenado desde cero: los pesos derivan de `kyutai/pocket-tts-without-voice-cloning` en la revisión `a7056f505a4a8ca72d8b5fb1440071d6f1a35739`.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de empaquetado de un TTS neuronal para inferencia local en móvil, con cuantización int8 dinámica de ONNX Runtime y separación en cuatro grafos con estado explícito (caché KV, estado convolucional y de atención del decodificador Mimi). Por otro, muestra cómo un modelo de voz de Kyutai puede reducirse a unos 125 MB de pesos en total y ejecutarse sin conexión, algo poco habitual en TTS de calidad.

El modelo es monolingüe inglés, está licenciado bajo CC BY 4.0 y no incluye clonación de voz: la voz `stuart_bell` viene precalculada como un tensor de estado de forma `[6, 2, 16, 103, 64]`. No se dispone de información sobre el número de parámetros del modelo original ni sobre su arquitectura interna más allá de lo que describe la model card de la exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con flow head (flow matching) y decodificador de audio Mimi; exportado en cuatro grafos ONNX |
| Parametros totales | no disponible (el repo ocupa 0,1 GB; los pesos ONNX suman unos 124,5 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación por fragmentos de como máximo 50 tokens) |
| Tipos de cuantizacion | int8 dinámica (ONNX Runtime) en `flow_lm_main`, `flow_lm_flow` y `mimi_decoder`; float32 en `text_conditioner` y en el estado de voz |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`.onnx`), tokenizer en `tokenizer.json`, estado de voz en float32 little-endian (`.f32`) |

## Arquitectura y entrenamiento

La exportación divide el modelo original en cuatro grafos ONNX: `text_conditioner` (embeddings de tokens, en float32), `flow_lm_main` (el backbone transformer con caché KV explícita), `flow_lm_flow` (la flow head, con un paso LSD) y `mimi_decoder` (el decodificador de audio Mimi, en streaming latente a latente con estado de convolución y atención explícitos). Los tres últimos están cuantizados a int8 mediante cuantización dinámica de ONNX Runtime; el `text_conditioner` se mantiene en float32 por ser una simple búsqueda de embeddings. El tokenizador SentencePiece se convirtió a `tokenizer.json` conservando el vocabulario.

No se proporcionan datos sobre el entrenamiento del modelo original: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. La model card solo indica que la voz Stuart Bell proviene de grabaciones LibriVox de Voice-Zero, dedicadas al dominio público bajo CC0. La innovación técnica destacable es la exportación en sí: el export float32 coincide con el modelo PyTorch con un error máximo por frame de 1,4e-5, y el export int8 obtiene una tasa de error de palabra (WER) del 1,3 % medida con Whisper medium.en, frente al 1,5 % del original. El `manifest.json` fija los parámetros de generación que reproducen el comportamiento original: temperatura 0,3, umbral EOS de -4,0 y un máximo de 50 tokens por fragmento.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Voz fija `stuart_bell`, sin clonación de voz ni selección de hablante.
- Generación en streaming: el decodificador Mimi procesa un latente cada vez con estado explícito, lo que permite emitir audio de forma incremental.
- Ejecución totalmente local mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Tokenización SentencePiece compatible con el vocabulario original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No dispone de modo thinking ni de capacidades multimodales más allá de la síntesis de voz.

## Casos de uso

- Narración de libros en aplicaciones móviles: es el caso para el que se creó esta exportación; Socrates la descarga y reproduce audiolibros en iPhone y iPad sin conexión, con un peso total de unos 125 MB que cabe en el almacenamiento de la app.
- Lectura por voz de artículos y documentos largos: el modelo genera por fragmentos de hasta 50 tokens con estado persistente, lo que permite encadenar párrafos y mantener una locución continua en un lector de noticias o un cliente RSS.
- Accesibilidad para personas con discapacidad visual: al ejecutarse en el dispositivo con ONNX Runtime, puede integrarse en lectores de pantalla y apps de asistencia sin enviar texto a servidores externos, lo que preserva la privacidad del contenido leído.
- Aprendizaje de inglés: la voz inglesa fija y la calidad medida (WER del 1,3 %) permiten usarla en apps de vocabulario o pronunciación que lean frases y ejemplos de forma consistente.
- Audiolibros y pódcast generados en local: un pipeline que tome texto de un EPUB o de un feed y lo convierta en audio con esta exportación evita costes por minuto de APIs TTS comerciales.
- Prototipado de interfaces de voz en el navegador o en el escritorio: ONNX Runtime tiene builds para WASM y para Windows, macOS y Linux, de modo que el mismo artefacto puede servir para demos de TTS sin infraestructura GPU.
- Pruebas de regresión de calidad TTS: el `manifest.json` con temperatura, umbral EOS y límite de tokens, junto con los hashes SHA-256, permite fijar una revisión y comparar el WER de futuras exportaciones contra la referencia del 1,3 %.

## Benchmarks y rendimiento

| Metrica | Original (PyTorch) | Export int8 ONNX |
|---|---|---|
| WER (Whisper medium.en) | 1,5 % | 1,3 % |
| Error máximo por frame de latente (float32 vs. PyTorch) | no aplica | 1,4e-5 |

No se han publicado resultados de benchmarks adicionales (MOS, latencia, throughput) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos ONNX suman aproximadamente 124,5 MB, por lo que la huella de memoria es muy reducida y cabe holgadamente en cualquier dispositivo móvil moderno.
- GPU recomendadas: no se especifican; el destino declarado es iPhone y iPad con ONNX Runtime, sin GPU dedicada.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño de los pesos; también en CPU y en dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (incluido en la app Socrates); el `manifest.json` documenta formas, layouts de estado y ajustes de generación necesarios para reproducir el comportamiento.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tomzhengy/socrates-pocket-tts-onnx | no disponible (~124,5 MB de pesos) | no disponible (fragmentos de 50 tokens) | inglés | CC BY 4.0 | ONNX int8/float32 |
| kyutai/pocket-tts-without-voice-cloning | no disponible | no disponible | no disponible | CC BY 4.0 | safetensors (PyTorch) |
| Alternativas TTS open source comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa posible es con el modelo base de Kyutai, del que esta exportación deriva: misma licencia, mismos idiomas declarados en esta ficha (inglés) y misma voz, pero en formato PyTorch y sin la cuantización int8. No se dispone de información sobre otros modelos TTS de tamaño y características equivalentes en la documentación consultada.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza inglés; no se ha validado para otros idiomas.
- Voz única y fija (`stuart_bell`): no admite clonación de voz ni cambio de hablante, a diferencia del modelo base, que está etiquetado explícitamente como "without voice cloning".
- Riesgo de alucinación y errores de pronunciación: como todo TTS neuronal, puede producir lecturas incorrectas de nombres propios, siglas, números o texto no estándar; la model card no documenta evaluaciones específicas de estos casos.
- Restricciones de licencia: CC BY 4.0 exige atribución a Kyutai y al autor de la exportación; es compatible con uso comercial siempre que se cumplan las condiciones de atribución.
- No está hecho ni respaldado por Kyutai; la model card lo indica expresamente.
- La calidad medida (WER del 1,3 %) se evaluó con Whisper medium.en, un ASR que puede introducir su propio sesgo; no sustituye a una evaluación perceptual (MOS).
- El estado de voz está precalculado y almacenado como float32 little-endian, lo que puede requerir conversión de endianness en plataformas big-endian.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción fuera de la app Socrates.
- No se documentan sesgos de género, acento o prosodia; la voz proviene de grabaciones LibriVox, lo que puede condicionar el registro y el acento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomzhengy/socrates-pocket-tts-onnx
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Kyutai: https://kyutai.org
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
