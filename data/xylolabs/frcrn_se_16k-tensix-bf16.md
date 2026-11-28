# Xylolabs/FRCRN_SE_16K-Tensix-BF16

## Resumen

FRCRN_SE_16K-Tensix-BF16 es una conversión de pesos del modelo de mejora de voz FRCRN_SE_16K, originalmente publicado por alibabasglab, adaptada por Xylolabs para su ejecución en aceleradores Tensix de Tenstorrent (Wormhole y Blackhole). El modelo realiza supresión de ruido y mejora de señal de voz sobre audio a 16 kHz, operando en el dominio espectral: recibe un espectro complejo normalizado y devuelve una máscara compleja que se aplica para reconstruir la señal limpia.

No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una red convolucional recurrente (FRCRN, *Frequency-Recurrent Convolutional Recurrent Network*) especializada en una única tarea de audio-to-audio. Con aproximadamente 23,76 millones de parámetros, es un modelo compacto pensado para inferencia de baja latencia en pipelines de procesamiento de voz.

La relevancia de esta ficha radica en que el repositorio no contiene el modelo original en formato PyTorch, sino los pesos plegados y almacenados en bfloat16 para NPUs de Tenstorrent, con una implementación consumidora que debe aportar el enmarcado, la normalización, la aplicación de la máscara y la síntesis. La licencia es Apache-2.0, heredada del checkpoint original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FRCRN (Frequency-Recurrent Convolutional Recurrent Network), dominio espectral |
| Parametros totales | 23.760.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa tramas de 640 puntos FFT con salto de 320 muestras) |
| Tipos de cuantizacion | BF16 (único formato publicado) |
| Idiomas soportados | no disponible (procesamiento de señal, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

FRCRN es una red convolucional recurrente que opera sobre representaciones tiempo-frecuencia. La entrada documentada es un espectro complejo normalizado con forma `[1, 2, 321, 51]` para audio a 16 kHz, obtenido con una FFT de 640 puntos y un salto de 320 muestras. La red produce dos salidas `u1` y `u2`, y la máscara compleja final se calcula como `tanh(u1) + tanh(u2)` en el mismo layout de parte real e imaginaria. El consumidor del modelo debe encargarse del enmarcado, la normalización, la aplicación de la máscara y la síntesis de la señal.

Los detalles de entrenamiento del checkpoint original (número de tokens o horas de audio, composición del dataset, uso de RLHF/DPO u otras técnicas) no están disponibles en la información proporcionada. Esta versión concreta es una conversión de pesos: Xylolabs ha plegado los pesos y los ha almacenado en bf16 para NPUs Tensix, e incluye el script `convert_frcrn.py` bajo Apache-2.0. La model card reporta una comparación numérica de la máscara y del espectro mejorado frente al modelo original en CPU: 27,87/39,12 dB de SNR sobre espectros normalizados retenidos y 17,46/17,66 dB sobre espectros sintéticos.

## Capacidades

- Mejora de voz (*speech enhancement*) y supresión de ruido sobre audio a 16 kHz.
- Procesamiento en el dominio espectral mediante máscara compleja.
- Inferencia en NPUs Tensix de Tenstorrent (Wormhole, Blackhole) con pesos en bf16.
- Lectura directa de tensores con `safetensors` (por ejemplo, `u1.enc.0.weight`).
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües en el sentido de modelos de lenguaje; el procesamiento es de señal y no depende del idioma.
- No incluye *thinking mode*, visión ni audio generativo.

## Casos de uso

- Preprocesado de voz para asistentes y transcripción: el modelo limpia la señal antes de pasarla a un ASR, reduciendo ruido de fondo en grabaciones a 16 kHz y mejorando la precisión del reconocimiento.
- Videollamadas y conferencias: integrado en el pipeline de captura, aplica la máscara compleja para atenuar ruido ambiental antes de codificar el audio.
- Atención al cliente automatizada: mejora la calidad del audio entrante en centros de contacto, donde las grabaciones suelen tener ruido de teclado, ventiladores o tráfico.
- Dispositivos de borde con aceleradores Tensix: al ser un modelo de ~23,8 M de parámetros en bf16, puede desplegarse en NPUs Wormhole o Blackhole para procesamiento local de baja latencia.
- Herramientas de grabación y podcasting: limpieza de pistas de voz grabadas en entornos no tratados acústicamente.
- Investigación en procesamiento de audio: base para experimentos de supresión de ruido y evaluación de máscaras espectrales en hardware Tensix.
- Pipelines de datos para entrenamiento de ASR: normalización de corpus de audio ruidosos antes de la anotación o el entrenamiento.

## Benchmarks y rendimiento

La model card reporta únicamente una comparación numérica frente al modelo original en CPU, no benchmarks estándar de la tarea de mejora de voz:

| Metrica | Valor |
|---|---|
| SNR de máscara/espectro mejorado, espectros normalizados retenidos | 27,87 / 39,12 dB |
| SNR de máscara/espectro mejorado, espectros sintéticos | 17,46 / 17,66 dB |

No se han publicado resultados de benchmarks estándar (PESQ, STOI, SI-SNR, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,0 GB y los pesos en bf16 suman aproximadamente 0,05 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior) es suficiente; el modelo está pensado para NPUs Tensix de Tenstorrent (Wormhole, Blackhole).
- Cabe en GPU consumer: sí, con un consumo de memoria mínimo.
- Opciones de despliegue: el repositorio no incluye un runtime completo; el consumidor debe implementar el enmarcado, la normalización, la máscara y la síntesis. La lectura de pesos se realiza con `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FRCRN_SE_16K-Tensix-BF16 (este) | 23,76 M | Mejora de voz 16 kHz | BF16 safetensors para Tensix | Apache-2.0 | Hugging Face |
| alibabasglab/FRCRN_SE_16K | no disponible | Mejora de voz 16 kHz | PyTorch (original) | Apache-2.0 | Hugging Face |
| Alternativas de supresión de ruido (p. ej. Demucs, DeepFilterNet) | no disponible | Mejora de voz / separación | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de las alternativas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en mejora de voz a 16 kHz; no es un modelo de lenguaje ni un generador de audio.
- El repositorio contiene solo los pesos; la implementación consumidora debe aportar el enmarcado, la normalización, la aplicación de la máscara y la síntesis. Sin ese código, los pesos no son directamente utilizables.
- Solo se publica el formato BF16; no hay versiones cuantizadas a INT8, FP16 ni GGUF.
- Orientado a NPUs Tensix (Wormhole, Blackhole); su uso en GPU o CPU requiere adaptación.
- No se documentan sesgos, tasas de error ni comportamiento fuera de la distribución de entrenamiento.
- Riesgo de artefactos o distorsión en señales muy degradadas o con ruido no visto durante el entrenamiento (no cuantificado en la información disponible).
- Licencia Apache-2.0 permite uso comercial, pero se recomienda conservar el `NOTICE` y citar el modelo original.
- El repositorio fue renombrado el 2026-11-27 desde `FRCRN_SE_16K-Tenstorrent-Tensix-BF16`; los enlaces antiguos pueden redirigir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tensix-BF16
- Modelo base: https://huggingface.co/alibabasglab/FRCRN_SE_16K
- Repositorio de conversión: https://github.com/XylolabsInc/tensix-bfp-gptq
- Script de conversión: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix/blob/main/bf16/convert_frcrn.py
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/FRCRN_SE_16K-Tenstorrent-Tensix/blob/main/LICENSE
