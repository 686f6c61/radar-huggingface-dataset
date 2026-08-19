# Werea-co/Werea-TSS-1.7B

## Resumen

Werea-TSS-1.7B es un modelo experimental de síntesis de voz (text-to-speech) en turco, desarrollado por la organización Werea-co. Se trata de un fine-tune del modelo base Qwen3-TTS-12Hz-1.7B-Base de Alibaba Qwen, adaptado específicamente al turco, idioma que no está incluido en los diez idiomas oficialmente soportados por el modelo base. El modelo genera audio de voz sintética a partir de texto, con una identidad de hablante fija denominada "werea".

El proyecto se presenta como una prueba de viabilidad técnica: el conjunto de entrenamiento es completamente sintético, con 1.272 ejemplos y aproximadamente 1,32 horas de audio, y el entrenamiento se realizó durante 3 épocas con una reducción de pérdida de 14,6 a 4,3. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para desarrolladores que necesiten síntesis de voz en turco con un enfoque abierto y reproducible. Al ser una versión beta, presenta limitaciones conocidas en la estabilidad de la generación y en la pronunciación de ciertos elementos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer de texto a audio, salida a 12 Hz) |
| Parametros totales | 1.7 mil millones (1.7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (limitado a frases cortas en la practica) |
| Tipos de cuantizacion | no disponible (pesos en bf16, cuantizacion posterior posible) |
| Idiomas soportados | turco (unico idioma del fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (en directorio `checkpoint/`) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-TTS-12Hz-1.7B-Base, un sistema de síntesis de voz de la familia Qwen que genera tokens de audio a una frecuencia de 12 Hz. La arquitectura subyacente es un transformer que procesa texto de entrada y produce representaciones de audio, probablemente con un codificador de texto y un decodificador de audio. El fine-tune se realizó mediante el flujo oficial de SFT de Qwen (`prepare_data.py` + `sft_12hz.py`), utilizando el dataset sintético `Werea-co/werea-tts-tr-synthetic` con 1.272 muestras en turco.

El entrenamiento se llevó a cabo con 3 épocas, tamaño de lote 8 con acumulación de gradientes de 4, tasa de aprendizaje 2e-5, precisión bf16 y una GPU A100. No se emplearon técnicas de RLHF ni DPO; es un ajuste supervisado estándar. La pérdida final de 4,3 indica convergencia parcial, pero el autor advierte que el comportamiento de terminación (EOS) no es estable, lo que puede provocar audios excesivamente largos.

## Capacidades

- Generación de voz en turco a partir de texto, con un único hablante sintético llamado "werea".
- Soporte para generación de audio en formato WAV (48 kHz, mono, según el modelo hermano Werea-TSS; no se especifica para esta versión).
- Integración con la librería `qwen-tts` para Python, con función `generate_custom_voice`.
- No incluye control de emociones, clonación de voz por referencia ni soporte multilingüe más allá del turco.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso; es un modelo puramente generativo de audio.

## Casos de uso

- Prototipado de asistentes de voz en turco: el modelo puede integrarse en aplicaciones de demostración que requieran respuestas habladas, aunque su carácter beta limita su uso en producción.
- Generación de contenido educativo: creación de audios de pronunciación turca para aplicaciones de aprendizaje de idiomas, con la ventaja de ser un modelo abierto y gratuito.
- Pruebas de concepto en sistemas de lectura de texto (screen readers) para turco, donde se puede evaluar la calidad de la síntesis antes de adoptar soluciones comerciales.
- Investigación en fine-tune de TTS para idiomas de bajos recursos: sirve como ejemplo de adaptación de un modelo multilingüe a un idioma no soportado con datos sintéticos.
- Generación de audios de demostración para presentaciones o material de marketing en turco, siempre que se indique que la voz es sintética.
- Evaluación comparativa de modelos TTS en turco: permite contrastar su rendimiento con otros sistemas de código abierto, aunque no se han publicado métricas formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica la pérdida de entrenamiento (14,6 → 4,3) y advierte de inestabilidad en la terminación. No hay comparaciones con otros modelos TTS en turco ni métricas objetivas como MOS (Mean Opinion Score) o WER (Word Error Rate).

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.7B parámetros en bf16, el modelo ocupa aproximadamente 3,4 GB de memoria, más overhead de activaciones. En la práctica, se recomienda al menos 6-8 GB de VRAM para una generación fluida.
- GPU recomendadas: una RTX 3060 (12 GB) o superior es suficiente para inferencia; el entrenamiento se realizó en una A100, pero no es necesaria para uso básico.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3090, RTX 4090 o incluso RTX 4060 Ti (16 GB) con cuantización.
- Opciones de despliegue: la librería `qwen-tts` permite cargar el modelo directamente en PyTorch con `device_map="cuda:0"`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: no disponibles. Al ser un modelo de 1.7B, la generación de unos segundos de audio puede tardar varios segundos en una GPU consumer, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Werea-TSS-1.7B (este) | 1.7B | no disponible | turco | Apache-2.0 | Hugging Face |
| Werea-TSS (hermano pequeño) | 183M | no disponible | turco | Apache-2.0 | Hugging Face |
| Qwen3-TTS-12Hz-1.7B-Base | 1.7B | no disponible | 10 idiomas (no turco) | Apache-2.0 | Hugging Face |

No se dispone de comparativas con otros TTS comerciales o de código abierto en turco (como Coqui TTS o VITS) por falta de datos de rendimiento. La principal diferencia con el modelo base es la adaptación al turco, aunque a costa de perder el soporte multilingüe.

## Limitaciones y advertencias

- Versión beta: el modelo es un checkpoint de viabilidad, no un sistema estable para producción.
- Inestabilidad en la terminación: puede generar audios excesivamente largos; se recomienda limitar `max_new_tokens` en la generación.
- Errores de pronunciación en frases largas y números, según el autor.
- Sin control de emociones ni clonación de voz por referencia.
- La voz generada es sintética y debe indicarse claramente al usuario final.
- El conjunto de entrenamiento es sintético y pequeño (1.272 ejemplos), lo que limita la generalización a vocabulario variado.
- No se han publicado evaluaciones formales de calidad de audio ni comparativas con otros sistemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Werea-co/Werea-TSS-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/Werea-co/werea-tts-tr-synthetic
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Modelo hermano (Werea-TSS, 183M): https://huggingface.co/Werea-co/Werea-TSS
- Sitio web de Werea: https://werea.co
