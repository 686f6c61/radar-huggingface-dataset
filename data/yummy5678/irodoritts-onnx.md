# yummy5678/IrodoriTTS-onnx

## Resumen

IrodoriTTS-onnx es una conversión al formato ONNX del modelo de síntesis de voz Irodori-TTS-v4.1-Small, desarrollado originalmente por Chihiro Arata (Aratako). El modelo original es un sistema de text-to-speech en japonés basado en flow matching con control de estilo mediante emojis, y esta versión ONNX se distribuye para su uso en una aplicación C++ independiente que funciona sobre ONNX Runtime sin necesidad de Python. El repositorio lo mantiene el usuario yummy5678 como derivado redistribuible bajo licencia MIT.

El paquete incluye los componentes necesarios para un pipeline completo de TTS: codificación de texto y estilo (frontend), un Diffusion Transformer por pasos, un predictor de duración, un decodificador de códec DACVAE que genera波形 a 48 kHz, un encoder de voz de referencia para clonación y un módulo de marca de agua SilentCipher. El modelo base emplea ModernBERT-Ja-310M como encoder de texto y un códec semántico específico para japonés (Semantic-DACVAE-Japanese-32dim).

Es relevante para desarrolladores que necesitan integrar TTS japonés en aplicaciones nativas o entornos sin Python, ya que el formato ONNX permite despliegue en C++, C# o Rust con ONNX Runtime. El repositorio ocupa 9,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching con Diffusion Transformer, encoder ModernBERT-Ja-310M, códec DACVAE |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en ONNX, presumiblemente FP32/FP16) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | ONNX (múltiples grafos: frontend, dit_step, duration, codec_decode, encoder, watermark_core) y vocabularios binarios propios |

## Arquitectura y entrenamiento

El modelo original Irodori-TTS-v4.1-Small sigue un esquema de flow matching para la generación de latentes de audio, con un Diffusion Transformer que itera sobre pasos de difusión. La condición textual se codifica mediante ModernBERT-Ja-310M, y el estilo se controla mediante emojis y frases de caption. La duración de la salida se predice con un módulo dedicado (`duration.onnx`), y la síntesis final se realiza con un decodificador DACVAE que produce波形 a 48 kHz. La clonación de voz se apoya en un encoder de referencia (`encoder.onnx`) que transforma audio de referencia en el espacio latente del códec semántico japonés.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión ONNX no altera los pesos ni el entrenamiento, sino que exporta los grafos para inferencia con ONNX Runtime. El paquete incluye además un módulo de marca de agua SilentCipher de Sony Research, lo que constituye una innovación relevante para trazabilidad de audio sintético.

## Capacidades

- Síntesis de voz en japonés a partir de texto.
- Control de estilo mediante emojis y frases de caption (estilo emoji-driven).
- Clonación de voz zero-shot a partir de audio de referencia mediante `encoder.onnx`.
- Predicción automática de duración del audio generado.
- Generación de波形 a 48 kHz mediante decodificador DACVAE.
- Inserción de marca de agua electrónica con SilentCipher.
- Ejecución sin Python sobre ONNX Runtime en aplicación C++.
- Soporte de vocabularios específicos para texto principal y para captions de estilo.

## Casos de uso

- Síntesis de voz para asistentes y aplicaciones nativas en japonés: el paquete ONNX permite integrar TTS en aplicaciones C++ o C# sin dependencia de Python, usando ONNX Runtime y los grafos `frontend.onnx`, `dit_step.onnx` y `codec_decode.onnx` en secuencia.
- Clonación de voz para doblaje o audiolibros: con `encoder.onnx` y un audio de referencia se puede generar voz con timbre similar, útil para producción de contenido en japonés con control de estilo por emojis.
- Generación de audio para videojuegos y contenido interactivo: la predicción automática de duración (`duration.onnx`) facilita la generación de locuciones de longitud variable en pipelines de producción.
- Prototipado de interfaces de voz en entornos embebidos o de escritorio: al no requerir Python, el modelo puede desplegarse en aplicaciones de escritorio con ONNX Runtime y recursos moderados.
- Investigación en TTS y flow matching: los grafos ONNX separados permiten inspeccionar y sustituir etapas del pipeline (frontend, difusión, decodificación) para experimentación.
- Trazabilidad de audio sintético: el módulo `watermark_core.onnx` permite insertar marcas de agua en el audio generado, adecuado para plataformas que requieren identificación de contenido sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 9,5 GB, lo que da una cota superior del espacio en disco necesario.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (aplicación C++ independiente IrodoriTTS); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Clonación de voz | Contexto |
|---|---|---|---|---|---|---|
| IrodoriTTS-onnx | TTS flow matching + DACVAE | ja | MIT | ONNX | Sí (encoder de referencia) | no disponible |
| Irodori-TTS-v4.1-Small (original) | TTS flow matching + DACVAE | ja | MIT | PyTorch (presumible) | Sí | no disponible |
| Semantic-DACVAE-Japanese-32dim | Códec de audio | ja | MIT | no disponible | No aplica | no disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta japonés; no se ha validado para otros idiomas.
- Es un derivado ONNX, no el modelo original; la calidad y el comportamiento dependen de la conversión y del motor C++ que lo consume.
- Riesgo de alucinación y artefactos en la síntesis de voz, especialmente en textos largos o estilos poco representados.
- Restricciones éticas explícitas del autor original: prohibición de suplantación de identidad sin consentimiento, prohibición de generar desinformación o deepfakes, y advertencia de que voces generadas sin referencia pueden parecerse a personas reales por azar.
- La licencia MIT incluye componentes de terceros (ModernBERT-Ja-310M de SB Intuitions y SilentCipher de Sony Research) con sus propias atribuciones.
- El repositorio no registra descargas ni validación comunitaria; su madurez en producción es incierta.
- No se dispone de información sobre cuantizaciones, latencia ni requisitos de hardware verificados.

## Enlaces

- Hugging Face: https://huggingface.co/yummy5678/IrodoriTTS-onnx
- Modelo original: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Códec: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Código: https://github.com/Aratako/Irodori-TTS
- Echo-TTS: https://jordandarefsky.com/blog/2025/echo/
- DACVAE: https://github.com/facebookresearch/dacvae
- ModernBERT-Ja-310M: https://huggingface.co/sbintuitions/modernbert-ja-310m
- SilentCipher: https://github.com/sony/silentcipher
