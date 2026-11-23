# XDcobra/wav2vec2-large-xlsr-53-korean-ONNX

## Resumen

El modelo `XDcobra/wav2vec2-large-xlsr-53-korean-ONNX` es una exportación a formato ONNX del checkpoint `kresnik/wav2vec2-large-xlsr-korean`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec2 con preentrenamiento multilingüe XLSR-53. Lo publica el desarrollador XDcobra como artefacto listo para inferencia en dispositivos móviles, en el marco de su SDK `react-native-sherpa-onnx` para React Native, Android e iOS.

El modelo está especializado en coreano (`ko`) y está pensado tanto para ASR como para *forced alignment* mediante CTC a nivel de carácter (char-CTC). Su relevancia práctica radica en que empaqueta los pesos en tres variantes (fp32, fp16 e int8 dinámica) dentro de un repositorio de 2,3 GB, lo que facilita el despliegue offline en entornos con recursos limitados sin depender de frameworks de servidor.

Se trata de un modelo derivado, no de un entrenamiento nuevo: hereda los pesos y el vocabulario del checkpoint base y añade únicamente el grafo ONNX y la cuantización. La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial según el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (XLSR-53), CTC a nivel de carácter |
| Parámetros totales | no disponible (el checkpoint base es de la familia wav2vec2-large; el número exacto no se indica en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada a 16 kHz mono PCM) |
| Tipos de cuantización | fp32, fp16 y QUInt8 dinámica (pesos) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/model_fp16.onnx`, `onnx/model_int8.onnx`) + `vocab.json` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2 con el esquema de preentrenamiento XLSR-53, que aprende representaciones de audio auto-supervisadas sobre 53 idiomas y después se afina para ASR en un idioma concreto. La cabeza de salida es CTC con vocabulario de caracteres coreanos, lo que permite tanto transcripción directa como alineamiento forzado entre audio y transcripción.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de afinamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). La contribución técnica de esta ficha es la exportación: se generó con `optimum-cli export onnx` y cuantización dinámica con `onnxruntime`, mediante el script `export_hf_onnx_pack.py` del repositorio del SDK. La entrada esperada es audio PCM mono a 16 kHz.

## Capacidades

- Reconocimiento automático del habla en coreano con salida CTC a nivel de carácter.
- Alineamiento forzado (forced alignment) entre audio y transcripción, útil para generar marcas temporales por carácter o fonema.
- Inferencia offline en dispositivos móviles mediante ONNX Runtime, sin conexión a servicios externos.
- Tres variantes de precisión para ajustar el equilibrio entre tamaño, latencia y exactitud.
- Integración con el SDK `react-native-sherpa-onnx` para aplicaciones React Native en Android e iOS.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni multilingüismo más allá del coreano.

## Casos de uso

- Subtitulado y transcripción offline en apps móviles: el modelo se ejecuta en el dispositivo a través de ONNX Runtime y evita enviar audio a servidores, adecuado para aplicaciones de notas de voz o accesibilidad.
- Alineamiento forzado para doblaje y subtitulado: dado un audio coreano y su transcripción, el modelo produce alineamientos a nivel de carácter que permiten sincronizar subtítulos o guiones.
- Herramientas de aprendizaje de coreano: comparación entre la pronunciación del usuario y una transcripción de referencia usando las marcas temporales del alineamiento.
- Procesamiento por lotes en servidores con ONNX Runtime: la variante fp32 o fp16 permite transcripciones masivas sin depender de PyTorch.
- Integración en pipelines de React Native: el SDK asociado permite incorporar ASR y alineamiento en apps Android/iOS con modelos empaquetados localmente.
- Investigación en ASR de bajo recurso: sirve como punto de partida cuantizado para evaluar el impacto de int8 frente a fp32 en coreano.
- Prototipado rápido de interfaces de voz: la variante int8 reduce el tamaño y facilita pruebas en dispositivos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 2,3 GB, por lo que la variante fp32 requiere del orden de esa cifra en memoria y la int8 sustancialmente menos.
- GPU recomendadas: no se especifican; al ser un modelo de la familia wav2vec2-large y estar orientado a móvil, puede ejecutarse en CPU y en GPUs consumer.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con varios GB de memoria libre, aunque el dato exacto no está documentado.
- Opciones de despliegue: ONNX Runtime (principal), integración vía `react-native-sherpa-onnx`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Cuantización | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| XDcobra/wav2vec2-large-xlsr-53-korean-ONNX | Coreano | ONNX | fp32, fp16, int8 | Apache 2.0 | Audio 16 kHz mono |
| kresnik/wav2vec2-large-xlsr-korean (base) | Coreano | PyTorch/safetensors | no especificada | Apache 2.0 | Audio 16 kHz mono |
| whisper-small / whisper-base | Multilingüe | PyTorch, ONNX, GGML | varias | MIT | Audio 16 kHz, ventana de 30 s |

La comparación con Whisper es orientativa: Whisper cubre más idiomas y tareas (traducción, timestamps), mientras que este modelo está especializado en coreano y en alineamiento CTC. No se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta coreano; no es un modelo multilingüe pese al preentrenamiento XLSR-53.
- El rendimiento depende del checkpoint base `kresnik/wav2vec2-large-xlsr-korean`; esta ficha no añade mejoras de exactitud.
- La cuantización int8 puede degradar la precisión del alineamiento y de la transcripción frente a fp32.
- No se documentan sesgos específicos, pero al ser un modelo derivado hereda los del corpus de entrenamiento original, no detallado.
- Riesgo de alucinación o salidas incorrectas en audio con ruido, acentos no representados o dominio muy distinto al de entrenamiento.
- El uso comercial está permitido por la licencia Apache 2.0, pero el autor remite a verificar la licencia del modelo base.
- Requiere audio a 16 kHz mono PCM; otras frecuencias o canales deben remuestrearse previamente.
- No hay métricas publicadas que permitan estimar latencia o calidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XDcobra/wav2vec2-large-xlsr-53-korean-ONNX
- Modelo base: https://huggingface.co/kresnik/wav2vec2-large-xlsr-korean
- SDK react-native-sherpa-onnx: https://github.com/XDcobra/react-native-sherpa-onnx
- Script de exportación: https://github.com/XDcobra/react-native-sherpa-onnx/blob/main/scripts/alignment-models/export_hf_onnx_pack.py
- Página del producto VoiceLab: https://xdcobra.github.io/voice-lab-offline-tools/
- VoiceLab en Google Play: https://play.google.com/store/apps/details?id=com.xdcobra.voicelab
- VoiceLab en App Store: https://apps.apple.com/us/app/voice-lab-stt-tts-more/id6761100598
