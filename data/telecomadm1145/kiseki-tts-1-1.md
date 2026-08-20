# telecomadm1145/Kiseki-TTS-1.1

## Resumen

Kiseki-TTS-1.1 es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por telecomadm1145, que combina un codificador Transformer con un decodificador basado en Mamba2, un modelo de espacio de estados (SSM) de tiempo lineal. El modelo genera tokens de audio codec neural discreto a 12,5 Hz y los decodifica a forma de onda mediante el codec Qwen3-TTS-Tokenizer-12Hz de Qwen. Su principal innovación es que el decodificador acústico no utiliza self-attention causal, sino que el contexto temporal se transporta íntegramente mediante el estado recurrente de Mamba2, lo que elimina la caché KV y mantiene un coste de generación constante por frame, independientemente de la duración del enunciado.

Con aproximadamente 0,4 mil millones de parámetros (375.482.432 exactamente), el modelo está ajustado a partir de Kiseki-1.1-0.3B, un modelo de traducción seq2seq, y soporta hasta 512 frames de audio, equivalentes a unos 41 segundos de habla. Su licencia MIT permite uso comercial sin restricciones. El modelo es relevante porque aborda el problema del coste computacional en TTS autoregresivo: al operar a 12,5 Hz en lugar de los 50-75 Hz típicos de otros codecs, reduce drásticamente el número de pasos de decodificación necesarios por segundo de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: Transformer encoder (12 capas, self-attention bidireccional + RoPE + SwiGLU) + decodificador Mamba2 SSM (6 capas, cross-attention + Mamba2, sin self-attention) |
| Parametros totales | 375.482.432 (~0,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 frames de audio ≈ 41 segundos (máximo entrenado); longitud de texto no especificada |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder híbrida. El encoder es un Transformer de 12 capas con self-attention bidireccional, RoPE y SwiGLU, con tamaño oculto de 1024 y 8 cabezas de atención. El decodificador, de solo 6 capas, combina cross-attention sobre la salida del encoder con bloques Mamba2 SSM, sin self-attention causal. El estado recurrente de Mamba2 (32 cabezas SSM, estado de 128 dimensiones y head dim de 64) transporta todo el contexto temporal, mientras que las claves y valores de la cross-attention se calculan una única vez durante el prefill y se reutilizan para cada frame. Esto elimina la caché KV y hace que el coste por paso sea constante.

La tokenización de audio utiliza el codec Qwen3-TTS-Tokenizer-12Hz con 16 capas de cuantizador, un codebook de 2048 entradas por capa y una tasa de frames de 12,5 Hz (80 ms por frame), lo que resulta en un bitrate nominal de 2,2 kbps. Para predecir las 16 capas de codebook de cada frame, el modelo emplea una cabeza de predicción multi-token (MTP) compartida: cada capa q ve el estado oculto del decodificador más la suma prefija exclusiva de las embeddings de las capas 0 a q-1, normalizada por 1/√Q. Esto permite resolver las 16 capas con una sola evaluación del tronco del decodificador y 16 evaluaciones de cabeza económicas, en lugar de 16 pasos autoregresivos completos.

El modelo se ajustó a partir de Kiseki-1.1-0.3B, un modelo de traducción seq2seq, utilizando los datasets telecomadm1145/test14 y telecomadm1145/test13. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de voz en japonés a partir de texto, con prosodia controlable mediante parámetros de muestreo (temperature, top_k, top_p).
- Síntesis de audio de larga duración: hasta 512 frames (≈41 segundos) por enunciado, con degradación gradual en lugar de fallo por memoria gracias al estado O(1) de Mamba2.
- Generación eficiente a 12,5 Hz: un segundo de audio requiere solo 12,5 pasos del tronco del decodificador, frente a los 50-75 pasos de codecs convencionales.
- Sin caché KV: el estado recurrente fijo (32 × 128 × 64) y una ventana convolucional de 3 frames por capa hacen que el coste por paso sea constante.
- Control fino de la capa 0 del codebook (la que transporta el contenido semántico) mediante parámetros de muestreo independientes (temperature_q0, top_k_q0).
- Integración con el codec Qwen3-TTS-Tokenizer-12Hz para decodificar los tokens discretos a forma de onda.

## Casos de uso

- Audiolibros y narración en japonés: el modelo puede generar hasta 41 segundos de habla continua por enunciado, lo que permite narrar párrafos completos sin necesidad de concatenar fragmentos cortos. Su coste constante por frame hace que la generación de pasajes largos no degrade el rendimiento.
- Asistentes de voz y agentes conversacionales: al operar a 12,5 Hz con un decodificador de solo 6 capas, la latencia por frame es baja, lo que lo hace adecuado para respuestas interactivas en tiempo real dentro de aplicaciones de asistente virtual en japonés.
- Lectura de pantalla y accesibilidad: su tamaño compacto (~0,4 B parámetros) permite desplegarlo en hardware modesto, incluidas GPU de consumo, para aplicaciones de accesibilidad que convierten texto en voz para personas con discapacidad visual.
- Generación de contenido para medios: creadores de vídeo, podcasts o vídeos de YouTube en japonés pueden utilizar el modelo para generar locuciones sin necesidad de estudios de grabación, gracias a su licencia MIT que permite uso comercial.
- Aplicaciones de aprendizaje de idiomas: el modelo puede generar ejemplos de pronunciación japonesa a partir de texto arbitrario, con control de prosodia mediante los parámetros de muestreo, útil para herramientas de práctica de pronunciación y listening.
- Sistemas IVR y atención telefónica automatizada: la capacidad de generar enunciados de hasta 41 segundos y el bajo coste computacional permiten desplegar el modelo en sistemas de respuesta de voz interactiva para menús telefónicos y mensajes automatizados en japonés.
- Investigación en TTS eficiente: al ser un modelo abierto con licencia MIT y arquitectura SSM, sirve como punto de partida para investigar decodificadores de audio basados en modelos de espacio de estados y predicción multi-token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparativas cuantitativas con otros sistemas TTS. Los únicos datos de rendimiento disponibles son los relativos a la eficiencia computacional: 12,5 pasos de decodificador por segundo de audio, 125 pasos para 10 segundos de audio, y ausencia de caché KV.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,4 B parámetros, los pesos en FP16 ocupan aproximadamente 750 MB. Sumando el codec Qwen3-TTS-Tokenizer-12Hz (cuyo tamaño no se especifica), el requisito total de VRAM se estima entre 2 y 4 GB, suficiente para GPU de consumo como RTX 3060, RTX 4060 o superiores. Esta es una estimación basada en el tamaño de parámetros; la model card no proporciona requisitos oficiales.
- El modelo puede ejecutarse en GPU de consumo con 4-8 GB de VRAM, incluidas las series RTX 30 y RTX 40 de NVIDIA.
- Para CPU: dado el tamaño reducido y la ausencia de caché KV, es plausible que el modelo funcione en CPU para inferencia por lotes pequeños, aunque no se especifica oficialmente.
- Opciones de despliegue: el modelo se carga mediante `AutoModelForSeq2SeqLM` de transformers con `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la documentación disponible.
- Latencia y throughput: no se proporcionan mediciones oficiales. La model card indica que la generación está limitada por el ancho de banda de memoria en lugar de por cómputo para batch de tamaño 1, gracias al diseño del bucle de profundidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos TTS en japonés en la informacion proporcionada. En el panorama general de TTS en japonés existen alternativas como VITS, StyleTTS2 o los modelos TTS comerciales de empresas japonesas, pero no se dispone de métricas objetivas para comparar directamente con Kiseki-TTS-1.1. La principal diferenciación cualitativa frente a modelos autoregresivos basados en Transformer es la ausencia de self-attention en el decodificador, que elimina la caché KV y reduce el coste por frame, y la tasa de 12,5 Hz frente a los 50-75 Hz de otros codecs neuronales.

## Limitaciones y advertencias

- El modelo solo soporta japonés (ja); no hay soporte multilingüe documentado.
- La duración máxima entrenada es de 512 frames (≈41 segundos) por enunciado; generar más allá de este límite puede producir degradación de calidad.
- No se han publicado benchmarks objetivos (MOS, WER, naturalidad) que permitan evaluar la calidad de voz frente a alternativas.
- El modelo es reciente (creado en agosto de 2026) y cuenta con 0 descargas y 0 likes en HuggingFace, por lo que su adopción y validación por la comunidad es limitada.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código remoto del autor; se recomienda auditar el código antes de usarlo en producción.
- El codec de decodificación (Qwen3-TTS-Tokenizer-12Hz) es un componente externo que debe cargarse por separado y puede tener sus propias limitaciones o requisitos de hardware.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo entrenado sobre datasets del autor (test13 y test14), la cobertura de vocabulario y estilos de habla puede ser limitada.
- No se documentan opciones de cuantización oficiales, por lo que el despliegue en hardware muy restringido puede requerir trabajo adicional de cuantización por parte del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/telecomadm1145/Kiseki-TTS-1.1
- Modelo base: https://huggingface.co/telecomadm1145/Kiseki-1.1-0.3B
- Codec de audio: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Dataset de entrenamiento 1: https://huggingface.co/datasets/telecomadm1145/test14
- Dataset de entrenamiento 2: https://huggingface.co/datasets/telecomadm1145/test13
