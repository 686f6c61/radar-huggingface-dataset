# voiceforever/Qwen3-TTS-12Hz-0.6B-Base-8bit

## Resumen

Qwen3-TTS-12Hz-0.6B-Base-8bit es una conversión al formato MLX (Apple Silicon) del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión concreta, publicada por el usuario voiceforever, cuantiza los pesos a 8 bits para su ejecución eficiente en hardware Apple mediante la librería mlx-audio. El modelo resuelve el problema de generar voz sintética de calidad a partir de texto, incluyendo funcionalidad de clonación de voz mediante audio de referencia.

La designación "12Hz" hace referencia a la frecuencia de tokens de audio del tokenizador del modelo, un dato relevante para entender su esquema de generación. Con aproximadamente 914 millones de parámetros totales según los tensores safetensors, se sitúa en la gama de modelos TTS de tamaño medio, lo que permite despliegue en hardware de consumo. El repositorio ocupa 2,0 GB.

Es relevante para desarrolladores que trabajan en el ecosistema Apple y necesitan integrar TTS local sin depender de servicios en la nube. La licencia Apache 2.0 facilita su uso comercial. No obstante, la información publicada por el autor de esta conversión es mínima y remite a la model card original para detalles técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Qwen3; detalles en la model card original) |
| Parametros totales | 914.643.008 |
| Parametros activos | no aplica (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta version); se desconoce si existen otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Se trata de un modelo de texto a voz (text-to-speech) de la familia Qwen3-TTS, identificado con la variante "12Hz", que probablemente alude a la tasa de tokens de audio del codec o tokenizador empleado por el modelo. El tamaño de 0,6B en el nombre comercial contrasta con los 914 millones de parámetros contabilizados en los tensores, diferencia habitual al incluir componentes auxiliares como codificadores o decodificadores de audio.

Esta versión concreta es una conversión a MLX realizada con mlx-audio 0.3.0 a partir del modelo original Qwen/Qwen3-TTS-12Hz-0.6B-Base, con cuantización a 8 bits. No se han publicado en la información disponible datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá de la propia arquitectura Qwen3-TTS.

## Capacidades

- Generación de voz sintética a partir de texto (text-to-speech).
- Clonación de voz mediante audio de referencia, según el ejemplo de uso de la model card (`ref_audio`).
- Ejecución local en hardware Apple Silicon a través de MLX y la librería mlx-audio.
- Interfaz de línea de comandos y API Python para integración en pipelines.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio de entrada más allá de la referencia de voz.
- El soporte multilingüe no está confirmado en la documentación disponible.

## Casos de uso

- Generación de audiolibros y narración: el modelo convierte texto largo en voz sintética de forma local, adecuado para creadores que trabajan en Mac y quieren evitar costes de API en la nube.
- Clonación de voz para doblaje y locución: gracias al parámetro `ref_audio`, se puede generar voz con un timbre similar a una muestra de referencia, útil en producción de contenido multimedia.
- Asistentes de voz en aplicaciones de escritorio para macOS: la integración con mlx-audio permite añadir respuestas habladas a herramientas nativas de Apple Silicon sin conexión externa.
- Prototipado rápido de interfaces conversacionales: desarrolladores que experimentan con agentes de voz pueden usar el modelo para generar respuestas habladas en local durante el desarrollo.
- Accesibilidad: generación de audio para lectores de pantalla o conversión de documentos a voz en entornos con requisitos de privacidad, al ejecutarse totalmente en el dispositivo.
- Sistemas de anuncios y avisos automatizados: generación de mensajes hablados dinámicos en aplicaciones internas, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Investigación en TTS: base para experimentos de fine-tuning o evaluación de técnicas de síntesis de voz en el ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: al tratarse de una cuantización de 8 bits de un modelo de ~0,9B parámetros, el peso de los tensores ronda los 1 GB; con overhead de runtime, se recomienda al menos 2-3 GB de memoria unificada disponible.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para GPU NVIDIA en este formato.
- GPU recomendadas: no aplica en el sentido tradicional; el requisito es un chip Apple con suficiente memoria unificada. Para GPUs CUDA habría que usar el modelo original en otro formato.
- Cabe en equipos de consumo: sí, en cualquier Mac con Apple Silicon y memoria unificada de 8 GB o superior, con margen amplio.
- Opciones de despliegue: mlx-audio (CLI y API Python). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-Base-8bit (esta ficha) | 914.643.008 | no disponible | Apache 2.0 | MLX, 8 bits | Conversion para Apple Silicon |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | ~0,6B (nominal) | no disponible | Apache 2.0 | safetensors originales | Modelo base sin cuantizar |
| Alternativas TTS open source (p. ej. Kokoro, XTTS) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para una comparacion rigurosa |

No se dispone de información suficiente y verificada sobre modelos comparables para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La documentación de esta conversión es mínima y remite a la model card original; faltan detalles sobre arquitectura, datos de entrenamiento y evaluación.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere una validación comunitaria escasa; conviene verificar la integridad y calidad de la conversión antes de usarla en producción.
- Riesgo de alucinación y artefactos de audio: como todo modelo TTS, puede generar pronunciaciones incorrectas, prosodia irregular o ruido, especialmente con texto fuera de dominio.
- Sesgos de voz: los modelos TTS pueden reproducir sesgos de acento, género o idioma presentes en sus datos de entrenamiento; no se documentan mitigaciones.
- Idiomas soportados no confirmados: no se puede garantizar cobertura multilingüe sin consultar la model card original.
- Clonación de voz: implica riesgos éticos y legales (suplantación, deepfakes). Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario cumplir la normativa aplicable sobre consentimiento y derechos de imagen y voz.
- Dependencia de plataforma: esta versión está ligada a MLX y Apple Silicon; no es portable directamente a CUDA u otras plataformas sin reconversión.
- Cuantización a 8 bits: puede introducir una ligera degradación de calidad frente al modelo original en safetensors de precisión completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voiceforever/Qwen3-TTS-12Hz-0.6B-Base-8bit
- Modelo original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio (referencia de la librería citada en la model card)
