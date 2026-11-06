# zephxs/pocket-tts-onnx-fr-6l

## Resumen

Pocket TTS FR 6L es una exportación ONNX en cuantización int8 del variante francés (`french`, 6 capas, `d_model` 1024) del modelo de síntesis de voz kyutai/pocket-tts, publicada por el usuario zephxs. El objetivo no es entrenar un modelo nuevo, sino empaquetar los pesos de Kyutai en un formato directamente consumible por el runtime sherpa-onnx, de modo que el modelo pueda desplegarse en entornos sin PyTorch ni dependencias pesadas. El resultado ocupa unos 165 MB útiles dentro de un repositorio de 0,2 GB, con el grafo principal (`lm_main.int8.onnx`, 76 MB), un encoder en fp32 (39 MB) y un decoder (23 MB).

La relevancia práctica está en el rendimiento en hardware modesto: el autor reporta un RTF de aproximadamente 0,73–0,83 en una máquina aarch64 con 4 hilos, frente a 1,5–1,9 del variante de 24 capas. Eso sitúa la síntesis por debajo del tiempo real en CPU, lo que abre el uso en dispositivos embebidos, servidores sin GPU y pipelines de generación de audio por lotes. El modelo conserva la capacidad de clonación zero-shot del modelo base y está pensado para texto en francés.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face; no se han publicado cifras de calidad (MOS, WER, benchmarks de TTS) ni detalles del corpus de entrenamiento original. La licencia es CC-BY-4.0, la misma que los pesos fuente de Kyutai Lab, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal basada en LM (pocket-tts de Kyutai), exportada a grafos ONNX; variante `french` de 6 capas con `d_model` 1024 |
| Parametros totales | no disponible (el autor solo indica tamaño de ficheros: ~165 MB útiles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 para `lm_main` (MatMul-only); encoder en fp32; decoder en fp32 (23 MB) |
| Idiomas soportados | francés (`fr`) |
| Licencia | CC-BY-4.0 (© Kyutai Lab, misma licencia que los pesos fuente) |
| Formato de pesos | ONNX (bundle sherpa-onnx: `bundle.json`, `vocab.json`, `tokenizer.model`, `lm_main.int8.onnx`, encoder, decoder) |
| Modelo base | kyutai/pocket-tts |
| Runtime objetivo | sherpa-onnx (formato pocket-tts) |
| Tamaño del repositorio | 0,2 GB |
| RTF medido | ~0,73–0,83 en aarch64, 4 hilos (variante 24L: ~1,5–1,9) |

## Arquitectura y entrenamiento

El modelo es una exportación, no un entrenamiento nuevo. Se parte del variante `french` de kyutai/pocket-tts, una arquitectura de síntesis de voz tipo language model con encoder y decoder separados (el autor menciona componentes `mimi` con `inner_dim`/`outer_dim` sometidos a downsample en el pipeline de exportación). La variante concreta tiene 6 capas y `d_model` 1024, es decir, una versión reducida del modelo de 24 capas que se usa como referencia de rendimiento.

El pipeline de exportación es un fork de `csukuangfj/pocket-tts-onnx-export`, basado en el workflow `.github/workflows/export-pocket-tts.yaml` de k2-fsa, con adaptaciones para el formato `french`: downsample de las dimensiones internas de mimi, parametrización del token BOS y una configuración `french.yaml` vendorizada. El BOS queda embebido en el grafo del encoder, y se proporciona `bos_before_voice.npy` para quien quiera reproducir la inferencia en PyTorch. La cuantización int8 se aplica solo a las operaciones MatMul del grafo principal.

No hay información en la model card sobre número de tokens de entrenamiento, composición del dataset, ni sobre si el modelo base usó RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones de decodificación más allá de la propia arquitectura pocket-tts.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en francés.
- Clonación de voz zero-shot: la card indica que la voz de prueba por defecto (`test_wavs/030168_anchor_fr_ancine.wav`) es una voz sintética usada para clonación zero-shot.
- Inferencia en CPU: el formato ONNX + sherpa-onnx permite ejecución sin GPU y sin PyTorch.
- Cuantización int8 del grafo principal para reducir huella de memoria y mejorar throughput.
- No se documenta soporte de tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking; es un modelo estrictamente TTS.
- Multilingüismo: limitado a francés según los metadatos (`language: fr`).

## Casos de uso

- Narración por lotes en francés: convertir grandes volúmenes de texto (artículos, documentación, guiones) a audio en servidores CPU, aprovechando el RTF de ~0,73–0,83 para procesar más rápido que tiempo real con 4 hilos.
- Asistentes de voz embebidos: integrar el bundle sherpa-onnx en dispositivos aarch64 (Raspberry Pi, placas ARM) donde no hay GPU disponible y el consumo de memoria debe mantenerse bajo (~165 MB de pesos).
- Accesibilidad: generar lectura en voz alta de contenido web o documentos para usuarios francófonos con discapacidad visual, con despliegue local que evita enviar texto a servicios externos.
- Clonación de voz para doblaje y prototipado: usar una muestra de referencia para producir locuciones con una voz concreta en fase de maquetación de vídeo o pódcast, antes de contratar una locución profesional.
- Pruebas de integración en pipelines CI/CD: validar el flujo completo de sherpa-onnx en contenedores sin dependencias de PyTorch, usando el modelo como fixture de pruebas de regresión de audio.
- Sistemas de respuesta por voz en telefonía o IVR: sintetizar respuestas dinámicas en francés con latencia baja en servidores sin acelerador, manteniendo la voz consistente entre llamadas.
- Generación de audiolibros o material didáctico: producir capítulos completos con una voz clonada y revisar después la calidad, dado el bajo coste computacional por minuto de audio.

## Benchmarks y rendimiento

La model card solo aporta el RTF (real-time factor) medido por el autor. No hay cifras de calidad (MOS, WER, SIM) ni comparaciones con otros sistemas TTS.

| Metrica | Valor | Entorno |
|---|---|---|
| RTF variante 6L (este modelo) | ~0,73–0,83 | aarch64, 4 hilos |
| RTF variante 24L (referencia) | ~1,5–1,9 | aarch64, 4 hilos |
| Tamaño de pesos útiles | ~165 MB | `lm_main.int8.onnx` 76 MB, encoder fp32 39 MB, decoder 23 MB |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el caso principal; el modelo está pensado para CPU. En GPU, la huella de pesos es de ~165 MB, por lo que cualquier GPU con 1–2 GB libres puede alojarlo, aunque no se documenta un backend GPU para sherpa-onnx en esta card.
- RAM estimada: no disponible de forma explícita; como referencia, los pesos suman ~165 MB y el runtime añade overhead de activaciones y buffers de audio.
- CPU: el autor reporta RTF ~0,73–0,83 en aarch64 con 4 hilos; en x86-64 con AVX2/AVX-512 se espera un rendimiento igual o mejor, aunque no hay medición publicada.
- GPU recomendadas: no disponibles; el modelo no está orientado a GPU.
- ¿Cabe en GPU de consumo? Sí por tamaño (RTX 3060, RTX 4090, etc.), pero el caso de uso natural es CPU.
- Despliegue: sherpa-onnx (formato pocket-tts nativo), con bundle `bundle.json`, `vocab.json`, `tokenizer.model` y los grafos ONNX. También es posible usar los pesos en PyTorch con `bos_before_voice.npy` para el BOS.
- Latencia y throughput: RTF < 1 implica síntesis más rápida que tiempo real en el rig medido; el throughput absoluto (segundos de audio por segundo de cómputo) no se detalla.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zephxs/pocket-tts-onnx-fr-6l | TTS LM + ONNX int8 | no disponible (~165 MB de pesos) | no disponible | fr | CC-BY-4.0 | Hugging Face |
| kyutai/pocket-tts (variante 24L) | TTS LM | no disponible | no disponible | multilingüe (según modelo base) | CC-BY-4.0 | Hugging Face |
| Variante `french` 6L sin exportar | TTS LM (PyTorch) | no disponible | no disponible | fr | CC-BY-4.0 | vía kyutai/pocket-tts |
| Alternativas TTS open source (p. ej. Piper, Coqui XTTS) | TTS neuronal | no disponible en esta ficha | no disponible | varias | varias | Hugging Face / GitHub |

La comparación cuantitativa con Piper, XTTS u otros sistemas TTS no está disponible en la información proporcionada; no se han publicado métricas de calidad que permitan un contraste riguroso.

## Limitaciones y advertencias

- El autor advierte de hallucinations con números en bruto: recomienda normalizar números a letras antes de la entrada al modelo.
- Solo francés: no se debe esperar un comportamiento correcto en otros idiomas.
- Es una exportación de un modelo base de terceros (Kyutai); la calidad final depende del modelo original y de la cuantización int8, que puede introducir degradación no medida.
- No hay métricas de calidad publicadas (MOS, WER, SIM) ni evaluación de sesgos; no se puede garantizar fidelidad de pronunciación en dominios especializados (nombres propios, terminología técnica, siglas).
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, repeticiones o prosodia anómala en textos largos o con puntuación atípica.
- Licencia CC-BY-4.0: permite uso comercial con atribución a Kyutai Lab; hay que conservar el aviso de copyright y la mención de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni informes independientes de calidad.
- El modelo se distribuye como `tar.bz2` con un bundle sherpa-onnx; requiere el runtime sherpa-onnx y no es directamente cargable con `transformers`.
- No se documenta el comportamiento con entradas muy largas ni el límite de contexto del LM subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephxs/pocket-tts-onnx-fr-6l
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio de exportación original: https://github.com/csukuangfj/pocket-tts-onnx-export
- Workflow de exportación de k2-fsa: `.github/workflows/export-pocket-tts.yaml` en el repositorio anterior
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
