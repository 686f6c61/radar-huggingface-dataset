# striimit/whisper-large-v3-turbo-webgpu

## Resumen

El modelo `striimit/whisper-large-v3-turbo-webgpu` es una exportación en formato ONNX del modelo de reconocimiento de voz automático (ASR) `openai/whisper-large-v3-turbo`, preparada específicamente para su ejecución en el navegador mediante WebGPU y la librería Transformers.js. El autor, striimit, ha adaptado el modelo original de OpenAI para resolver un problema concreto: las exportaciones ONNX comunitarias de Whisper producían salidas corruptas en ciertas GPU y drivers (observado en Apple Silicon con el backend Metal de Chrome), mientras que esta versión, generada con una toolchain de Optimum actualizada, funciona correctamente en WebGPU en esos entornos.

El modelo base, Whisper large-v3-turbo, es una versión optimizada de Whisper large-v3 que reduce el número de capas del decoder de 32 a 4, inspirado en Distil-Whisper, lo que acelera la transcripción con una degradación mínima de calidad. Esta exportación mantiene esa arquitectura y la empaqueta en archivos ONNX con cuantización mixta: el encoder en float16 (1,27 GB) y el decoder fusionado en cuantización de 4 bits (MatMulNBits, 375 MB) o en float16 (477 MB) como alternativa. El repositorio ocupa 2,1 GB y se distribuye bajo licencia MIT, heredada del modelo original.

La relevancia de este modelo radica en que permite ejecutar un ASR de alta calidad directamente en el navegador, sin servidores ni envío de datos, aprovechando la aceleración por GPU vía WebGPU. Es una opción práctica para aplicaciones web que necesitan transcripción en tiempo real, subtitulación o asistentes de voz con privacidad total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder-decoder transformer, decoder con 4 capas) en formato ONNX |
| Parametros totales | 809 millones (según TTSLab) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana de audio fija de 30 segundos (típica de Whisper) |
| Tipos de cuantizacion | Encoder: float16; decoder: q4 (MatMulNBits, block size 32) o float16 |
| Idiomas soportados | No disponible en la ficha; el modelo base Whisper large-v3-turbo soporta 99 idiomas |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx: encoder_model_fp16, decoder_model_merged_q4, decoder_model_merged_fp16) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX de `openai/whisper-large-v3-turbo`, que a su vez es una versión podada y afinada de Whisper large-v3. La arquitectura original de Whisper es un transformer encoder-decoder con atención sobre espectrogramas de Mel; en la variante turbo, el decoder se reduce de 32 a 4 capas, lo que disminuye la latencia y el coste computacional a cambio de una ligera pérdida de precisión. El proceso de exportación, descrito en la model card, incluye una exportación a fp32, conversión a fp16 con corrección de nodos Cast a nivel de subgrafo, y cuantización MatMulNBits para el decoder. No se proporcionan detalles sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación) en la información disponible; se sabe que fue desarrollado por OpenAI, pero no se incluyen cifras concretas.

## Capacidades

- Reconocimiento de voz automático (ASR): transcribe audio a texto en múltiples idiomas (el modelo base soporta 99 idiomas, aunque la ficha no lo especifica).
- Traducción de audio a texto en inglés: Whisper incluye esta capacidad, aunque no se menciona explícitamente en la ficha.
- Ejecución en navegador: gracias a WebGPU y Transformers.js, el modelo se ejecuta íntegramente en el cliente, sin necesidad de servidor.
- Inferencia con cuantización mixta: el encoder en fp16 y el decoder en q4 permiten un equilibrio entre rendimiento y uso de memoria.
- Compatibilidad con WASM: los mismos archivos ONNX pueden ejecutarse en entornos sin WebGPU mediante WASM, como se indica en la motivación del autor.

## Casos de uso

- Transcripción en tiempo real en el navegador: aplicaciones web de dictado o notas de voz que procesan audio localmente, sin enviar datos a servidores, gracias a la ejecución con WebGPU y la ventana de 30 segundos.
- Subtitulación automática de vídeos en la web: herramientas de edición de vídeo en línea que generan subtítulos a partir de pistas de audio, aprovechando la baja latencia del decoder reducido.
- Asistentes de voz con privacidad: interfaces de chat o comandos de voz en páginas web que requieren que el audio no salga del dispositivo, usando el pipeline de Transformers.js.
- Accesibilidad para personas con discapacidad auditiva: extensiones de navegador que transcriben contenido multimedia en tiempo real, con soporte multilingüe del modelo base.
- Demostraciones y prototipos de ASR: desarrolladores que necesitan evaluar Whisper large-v3-turbo en el cliente sin montar infraestructura, usando el espacio de Hugging Face como referencia.
- Aplicaciones de traducción de voz: transcripción de audio en un idioma y traducción al inglés (capacidad nativa de Whisper), todo en el navegador, útil para periodistas o viajeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (como WER) ni comparativas de velocidad con otras exportaciones. El autor solo menciona que la motivación fue corregir salidas corruptas en WebGPU, no mejorar el rendimiento numérico.

## Requisitos de hardware

- GPU compatible con WebGPU: necesaria para la inferencia acelerada; se ha probado en Apple Silicon con Chrome (backend Metal), pero debería funcionar en otras GPU con soporte WebGPU (NVIDIA, AMD, Intel).
- Memoria VRAM estimada: el encoder fp16 ocupa 1,27 GB y el decoder q4 375 MB, por lo que se estima un uso de memoria de al menos 1,65 GB durante la inferencia, más overhead. No hay datos oficiales de VRAM mínima.
- Alternativa sin WebGPU: los archivos ONNX también pueden ejecutarse en WASM, aunque con menor rendimiento; esto permite usar el modelo en CPU.
- Opciones de despliegue: exclusivamente en el navegador mediante Transformers.js; no se proporcionan instrucciones para servidores (vLLM, llama.cpp, etc.).
- Latencia y throughput: no disponibles; dependen de la GPU y del navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| striimit/whisper-large-v3-turbo-webgpu | 809M | 30 s audio | ONNX (WebGPU) | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | 809M | 30 s audio | PyTorch | MIT | Hugging Face |
| openai/whisper-large-v3 | 1550M | 30 s audio | PyTorch | MIT | Hugging Face |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento. La versión webgpu es una conversión del modelo turbo, que ya es más rápido que large-v3 por su decoder reducido. La principal diferencia con el modelo original es el formato ONNX y la preparación para WebGPU, que permite ejecución en navegador.

## Limitaciones y advertencias

- Compatibilidad WebGPU: aunque el autor afirma que esta exportación corrige problemas en Apple Silicon, no se garantiza que funcione en todas las GPU o drivers; en caso de fallo, se recomienda usar el decoder fp16 en lugar del q4.
- Degradación por cuantización: el decoder en q4 (MatMulNBits) puede introducir pérdida de precisión; el autor ofrece la versión fp16 como alternativa para runtimes donde los kernels q4 se comportan mal.
- Ventana de audio fija: Whisper procesa segmentos de 30 segundos; audios más largos requieren segmentación, lo que puede afectar a la coherencia en transcripciones largas.
- Alucinaciones: como todos los modelos Whisper, puede generar texto inventado en silencios o audio ruidoso, especialmente en idiomas con pocos datos.
- Idiomas no documentados: la ficha no especifica los idiomas soportados; aunque el modelo base es multilingüe, no hay garantía de calidad uniforme en todos ellos.
- Licencia MIT: permite uso comercial, pero el modelo base proviene de OpenAI; se recomienda revisar los términos de uso de OpenAI para el modelo original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/striimit/whisper-large-v3-turbo-webgpu
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/webml-community/whisper-large-v3-turbo-webgpu
- Página de TTSLab con especificaciones: https://ttslab.dev/models/whisper-large-v3-turbo
- Discusión de OpenAI sobre el modelo turbo: https://github.com/openai/whisper/discussions/2363
- Repositorio de Qualcomm con detalles del modelo: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/whisper_large_v3_turbo
