# yousifgamalo/tilawi-quran-asr-onnx

## Resumen

Tilawi Quran ASR es un modelo de reconocimiento automático del habla (ASR) especializado en recitación coránica en árabe, desarrollado por el usuario yousifgamalo y publicado en Hugging Face. Se trata de un ajuste fino del modelo base `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0`, que emplea una arquitectura FastConformer híbrida con decodificadores RNNT y CTC sobre vocabulario BPE. El modelo resuelve un problema concreto: la transcripción precisa de recitación coránica, un dominio con particularidades fonéticas, prosódicas y ortográficas (texto uthmaní) que los modelos ASR generalistas no cubren con exactitud.

La relevancia del modelo reside en su orientación a despliegue en dispositivos de borde. Se distribuye en formato ONNX, con una versión FP32 de aproximadamente 436 MB y una versión cuantizada dinámicamente a INT8 de aproximadamente 125 MB, pensada para ejecución en Android. El entrenamiento se realizó sobre más de 121 000 clips de audio que combinan recitaciones profesionales (232 configuraciones de recitadores) y grabaciones no profesionales de origen colaborativo (411 particiones), lo que aporta diversidad acústica entre entornos de estudio y entornos ruidosos.

El modelo alcanzó un WER de validación del 8,09 % con el decodificador CTC. No se han publicado resultados comparativos frente a otros modelos en la información disponible, y la licencia no está especificada en la model card, lo que constituye una limitación relevante para su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida RNNT/CTC con tokenización BPE |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 (ONNX) e INT8 dinámica (QInt8) |
| Idiomas soportados | Árabe (ar), orientado a recitación coránica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`fastconformer_full_mixed.onnx`, `fastconformer_quran_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` y conserva su estructura híbrida: un codificador FastConformer (variante de Conformer con atención por bloques que reduce el coste computacional en secuencias largas) conectado a dos cabezas de decodificación, una RNNT (transducer) y otra CTC, ambas sobre un vocabulario BPE generado con SentencePiece. El ajuste fino se realizó en dos fases: una primera fase de 3 épocas con entrenamiento híbrido completo RNNT/CTC y calentamiento coseno, seguida de una segunda fase de 12 épocas centrada exclusivamente en el decodificador CTC (`ctc_loss_weight = 1.0`), congelando el decodificador RNNT y los módulos conjuntos para acelerar el refinamiento.

Los datos de entrenamiento provienen de dos fuentes: `yousifgamalo/mp3quran`, con recitaciones profesionales de 232 configuraciones de recitadores, y `yousifgamalo/quran-cleaned-nonprofessional-recordings`, con las 411 particiones de grabaciones no profesionales. En total, aproximadamente 119 000 clips de entrenamiento y 2400 de validación. Una innovación destacable es la normalización estricta del texto uthmaní mediante una lista blanca de vocabulario SentencePiece, sustituyendo caracteres uthmaníes específicos para garantizar cero tokens `<unk>` tanto en entrenamiento como en inferencia. El modelo se exportó a ONNX FP32, se adelgazó con `onnxslim` y se cuantizó dinámicamente a INT8, reduciendo el tamaño de 436 MB a 125 MB. El repositorio incluye además `quran.json` con los 6236 versos normalizados y sus identificadores de token exactos.

## Capacidades

- Reconocimiento automático del habla en árabe, especializado en recitación coránica.
- Transcripción alineada con el texto uthmaní normalizado y el corpus de 6236 versos incluido en el repositorio.
- Decodificación dual: cabeza CTC (refinada en la segunda fase) y cabeza RNNT heredada del modelo base.
- Ejecución en dispositivos de borde mediante ONNX Runtime, incluida la variante INT8 para Android.
- Funcionamiento en entornos acústicos diversos: recitación profesional de estudio y grabaciones ruidosas no profesionales.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del propio ASR.

## Casos de uso

- Aplicaciones móviles de recitación coránica: la variante INT8 de 125 MB puede integrarse en una app Android con ONNX Runtime para transcribir la recitación del usuario en tiempo real y compararla contra el texto esperado del verso.
- Corrección de recitación (tajwid y memorización): el alineamiento con los 6236 versos de `quran.json` permite detectar omisiones, sustituciones o errores de pronunciación en la recitación de un estudiante.
- Seguimiento de lectura en madrasas y centros de enseñanza: transcripción automática de sesiones de recitación para generar registros de progreso sin intervención manual del profesor.
- Archivado y búsqueda de grabaciones: transcripción por lotes de recitaciones no profesionales o de archivo para indexar y buscar por verso o fragmento.
- Evaluación de calidad de grabaciones: uso del WER como métrica interna para comparar la calidad acústica de nuevas grabaciones frente al corpus de referencia.
- Investigación en ASR de árabe dialectal y coránico: el modelo sirve como línea base especializada para experimentos de normalización de texto uthmaní y ajuste fino en dominios religiosos.
- Despliegue en dispositivos sin conectividad: al ser un modelo ONNX autónomo, funciona sin conexión a red, útil en entornos con conectividad limitada.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| WER de validación (CTC) | 8,09 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de los pesos (436 MB FP32, 125 MB INT8) sugiere un consumo de memoria moderado, pero no se documentan requisitos de VRAM.
- GPU recomendadas: no disponible. El modelo está orientado a CPU y dispositivos de borde mediante ONNX Runtime; no se especifican GPU de referencia.
- Compatibilidad con GPU de consumo: probable en cualquier GPU con suficiente memoria para 436 MB de pesos en FP32, pero no confirmado en la documentación.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo), incluida la ejecución en Android con la variante INT8. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | WER | Licencia | Formato |
|---|---|---|---|---|---|
| Tilawi Quran ASR (este modelo) | FastConformer híbrida RNNT/CTC | no disponible | 8,09 % (validación CTC) | no disponible | ONNX FP32/INT8 |
| `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` (modelo base) | FastConformer híbrida RNNT/CTC | no disponible | no disponible | no disponible | NeMo |
| Alternativas ASR en árabe de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de otras alternativas especializadas en recitación coránica en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; es un bloqueo potencial para producción.
- El modelo está entrenado exclusivamente para árabe coránico; su rendimiento en árabe dialectal, árabe moderno estándar conversacional u otros idiomas no está documentado y probablemente sea deficiente.
- El WER del 8,09 % corresponde al conjunto de validación del propio autor; no hay evaluación independiente ni desglose por tipo de recitador o condición acústica.
- Riesgo de alucinación y de sustituciones en pasajes con recitación rápida, ruido de fondo o pronunciación no estándar; no se documentan análisis de errores por categoría.
- La normalización uthmaní se realizó con una lista blanca específica; textos coránicos con variantes ortográficas no cubiertas podrían producir tokens desconocidos o transcripciones desalineadas.
- No se documentan sesgos demográficos ni geográficos, pero la composición del corpus (recitadores profesionales y grabaciones colaborativas) puede introducir sesgo hacia determinados estilos de recitación.
- El repositorio no incluye información sobre el proceso de anonimización de las grabaciones no profesionales, lo que conviene verificar antes de un uso que implique datos personales.
- No se especifican requisitos de memoria, latencia ni pruebas en hardware Android concretas, por lo que el rendimiento en dispositivos reales debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yousifgamalo/tilawi-quran-asr-onnx
- Modelo base: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Dataset de recitaciones profesionales: https://huggingface.co/datasets/yousifgamalo/mp3quran
- Dataset de grabaciones no profesionales: https://huggingface.co/datasets/yousifgamalo/quran-cleaned-nonprofessional-recordings
