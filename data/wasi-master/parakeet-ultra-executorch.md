# wasi-master/parakeet-ultra-executorch

## Resumen

Parakeet Ultra ExecuTorch es una exportación del modelo de reconocimiento automático del habla (ASR) Parakeet Ultra de Moondream, empaquetada para el runtime ExecuTorch v1.5.1 con el backend XNNPACK. El modelo subyacente es un post-entrenamiento de parakeet-tdt-0.6b-v3 de NVIDIA, una arquitectura TDT (Token-and-Duration Transducer) de aproximadamente 600 millones de parámetros. Esta versión concreta está pensada para inferencia en dispositivo (on-device), concretamente para dictado por voz offline en la aplicación WM Keyboard.

La relevancia de esta ficha radica en que demuestra un flujo completo de conversión de pesos de transformers a NeMo, cuantización a 8da4w (activaciones de 8 bits dinámicas, pesos de 4 bits en grupos de 32) y exportación a un formato `.pte` ejecutable sin dependencias de Python. El tamaño del repositorio es de 0,7 GB, lo que refleja el peso compacto del artefacto cuantizado.

El modelo cubre 25 idiomas europeos y está publicado bajo licencia CC-BY-4.0. No se han publicado resultados de benchmarks propios en la información disponible; cualquier cifra de rendimiento debe remitirse a la del modelo base parakeet-tdt-0.6b-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), exportada a ExecuTorch con backend XNNPACK |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8da4w (activaciones de 8 bits dinamicas, pesos de 4 bits en grupos de 32) |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `.pte` (ExecuTorch); tokenizer SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo es un transducer TDT, una variante de arquitectura encoder-decoder con un componente conjunto (joint) que predice simultáneamente tokens y duraciones. La exportación conserva los cuatro métodos del runner oficial de ExecuTorch para parakeet-tdt-0.6b-v3: `preprocessor`, `encoder`, `decoder_step` y `joint`. Esto implica que el archivo `.pte` es compatible con el runner estándar de Parakeet sin modificaciones.

El proceso de conversión consistió en renombrar los tensores de los pesos transformers publicados por Moondream a la nomenclatura de NeMo, usando el mapeo de conversión NeMo de transformers en sentido inverso, y cargarlos en el modelo NeMo de parakeet-tdt-0.6b-v3. El mapeo se validó previamente sobre el propio v3, comprobando que cada peso NeMo coincide con el tensor homónimo de la conversión a transformers de NVIDIA. La cabeza de detección de actividad de voz (VAD) de Ultra se descartó por no tener equivalente en el modelo NeMo. Posteriormente se cuantizó y exportó con el script `examples/models/parakeet/export_parakeet_tdt.py` de ExecuTorch v1.5.1. El repositorio incluye un `manifest.json` con fuentes fijadas, hashes de archivos y transcripciones de prueba.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el post-entrenamiento de Moondream.

## Capacidades

- Reconocimiento automático del habla (ASR) offline, sin conexión a red.
- Transcripción multilingüe en 25 idiomas europeos, incluidos eslavos, bálticos, nórdicos y románicos.
- Ejecución en dispositivo mediante ExecuTorch y XNNPACK, sin dependencia de Python en tiempo de inferencia.
- Integración directa con el runner de Parakeet de ExecuTorch (métodos `preprocessor`, `encoder`, `decoder_step`, `joint`).
- Tokenización SentencePiece idéntica a la del modelo base parakeet-tdt-0.6b-v3.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.

## Casos de uso

- Dictado por voz en teclados móviles: es el caso de uso previsto por el autor, ya que WM Keyboard descarga este `.pte` para transcripción offline en el dispositivo, sin enviar audio a servidores externos.
- Aplicaciones de notas de voz sin conexión: el modelo puede transcribir grabaciones en local en entornos sin red, útil en dispositivos con conectividad intermitente o requisitos de privacidad estrictos.
- Subtitulado en tiempo real en aplicaciones de escritorio o móviles: al ejecutarse con ExecuTorch y XNNPACK, puede integrarse en apps nativas que necesiten transcripción de baja latencia sin backend.
- Procesamiento por lotes de archivos de audio en pipelines locales: el artefacto `.pte` puede invocarse desde un runner de ExecuTorch para transcribir colecciones de audio en máquinas sin GPU.
- Asistentes de accesibilidad: transcripción de voz a texto para usuarios con movilidad reducida, con independencia de servicios en la nube y con soporte de 25 idiomas.
- Investigación en ASR on-device: sirve como referencia reproducible de conversión transformers → NeMo → ExecuTorch con cuantización 8da4w, gracias al `manifest.json` y al script de exportación publicado.
- Aplicaciones de transcripción multilingüe en Europa: el amplio conjunto de idiomas (eslavos, bálticos, nórdicos) permite desplegar una única app con cobertura lingüística regional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de WER, latencia ni throughput; solo transcripciones de prueba en el `manifest.json`. Para referencias de rendimiento debe consultarse la documentación del modelo base parakeet-tdt-0.6b-v3 de NVIDIA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto cuantizado ocupa 0,7 GB en disco (8da4w), por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no aplica de forma directa, ya que el destino es ExecuTorch con XNNPACK, orientado a CPU y aceleradores móviles; no se documentan requisitos de GPU.
- Cabe en GPU consumer: el tamaño cuantizado (0,7 GB) es compatible con cualquier GPU consumer, pero el runtime objetivo es on-device, no CUDA.
- Opciones de despliegue: ExecuTorch v1.5.1 con backend XNNPACK y el runner de Parakeet; no se documentan exportaciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Parakeet Ultra ExecuTorch (este) | ~0,6 B | no disponible | 25 | CC-BY-4.0 | `.pte` / ExecuTorch + XNNPACK |
| parakeet-tdt-0.6b-v3 (NVIDIA) | ~0,6 B | no disponible | no disponible en esta ficha | no disponible en esta ficha | NeMo / transformers |
| Parakeet Ultra (Moondream) | ~0,6 B | no disponible | no disponible en esta ficha | CC-BY-4.0 | transformers |

La comparativa se limita a la familia Parakeet porque la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de otros autores. No se dispone de cifras de WER para comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- El modelo es una exportación cuantizada a 4 bits (8da4w); la cuantización puede degradar la precisión de transcripción respecto a los pesos originales en transformers, aunque no se han publicado métricas que lo cuantifiquen.
- La cabeza de detección de actividad de voz (VAD) de Parakeet Ultra se eliminó en la conversión a NeMo; no está disponible en este artefacto.
- Solo se soportan los 25 idiomas listados; no hay soporte documentado para otras lenguas.
- El destino es ExecuTorch con XNNPACK; no es un artefacto para PyTorch/CUDA estándar ni para servidores de inferencia convencionales.
- No se han publicado benchmarks propios; el rendimiento real en producción debe validarse contra el modelo base.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un modelo ASR, los errores se manifiestan como transcripciones incorrectas, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución; deben conservarse los créditos a Moondream y NVIDIA, y documentarse los cambios (conversión a NeMo, cuantización y exportación).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/wasi-master/parakeet-ultra-executorch
- Modelo base (Moondream Parakeet Ultra): https://huggingface.co/moondream/parakeet-ultra
- Modelo original NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- ExecuTorch: https://github.com/pytorch/executorch
- Script de exportación: https://github.com/wasi-master/wmkeyboard/blob/main/tools/parakeet-ultra/export_ultra.py
- Aplicación WM Keyboard: https://github.com/wasi-master/wmkeyboard
