# Zyphra/ZAC-1

## Resumen

ZAC-1 (Zyphra Audio Codec 1) es un codec neuronal de audio para voz a 44,1 kHz desarrollado por Zyphra, el mismo equipo responsable de la familia Zonos. No es un modelo generativo de texto ni un TTS: es el componente de compresión y reconstruccion de audio que emplea el sistema ZONOS3-Mini, empaquetado de forma independiente para que terceros puedan entrenar sus propios modelos de sintesis de voz sobre sus representaciones discretas. Concretamente, convierte una forma de onda en tramas de 15 Hz compuestas por 10 codebooks de 4096 entradas cada una, y reconstruye la senal mediante un decodificador iSTFT multitresolucion causal.

La propuesta tecnica clave es la separacion entre un codebook semantico (el codebook 0, destilado de un profesor Wav2Vec2-BERT 2.0 congelado) y nueve codebooks acusticos de tipo RVQ residual. Esta hibridacion semantico-acustica facilita que un modelo TTS aprenda el mapeo texto-a-codigo con muchos menos datos: segun el autor, bajo restricciones de datos comparables, un TTS entrenado con ZAC-1 logra una reduccion de 10x en la tasa de error de palabras (WER) frente a uno entrenado con DAC, manteniendo mejor similitud acustica. Frente a S1-DAC y MOSS v2 los resultados son comparables con mayor compresion.

El modelo tiene 1.057.851.328 parametros en safetensors y se distribuye bajo licencia Apache-2.0, con pesos en PyTorch y en GGUF para inferencia en C++ via ggml. Es relevante ahora porque baja el coste de entrada para construir pipelines de TTS y de modelado de audio sobre un codec de alta fidelidad, con decodificador podado que acelera la sintesis aproximadamente 3x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal: encoder acustico + rama semantica (destilacion de Wav2Vec2-BERT 2.0) + RVQ residual de 10 codebooks; decodificador iSTFT multitresolucion causal |
| Parametros totales | 1.057.851.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; trabaja por tramas de 2940 muestras a 44,1 kHz) |
| Tipos de cuantizacion | f16 y f32 en GGUF; fp32 y bf16 en safetensors (encoder en fp32, profesor en bf16) |
| Idiomas soportados | no disponible (codec de audio; la cobertura linguistica depende del modelo TTS que lo use) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) y GGUF (ggml) |

## Arquitectura y entrenamiento

ZAC-1 sigue un diseno de autoencoder con cuantizacion vectorial residual. El encoder acustico transforma la onda a 44,1 kHz en una secuencia de vectores; el codebook 0 se entrena por destilacion de las primeras 16 capas de `facebook/w2v-bert-2.0` (MIT), lo que aporta una representacion semantica alineada con el habla, mientras que los codebooks 1 a 9 forman un RVQ residual puramente acustico. La tasa resultante es de 15 tramas por segundo con 10 indices de 4096 entradas, es decir, 150 simbolos por segundo. La sintesis final la realiza un decodificador iSTFT multitresolucion de tipo causal, adecuado para streaming.

Los pesos publicados corresponden al codec de ZONOS3-Mini (`autoencoder/`), en el paso de entrenamiento 600.000 del codec y 50.000 de las cabezas del decodificador; el repositorio es un reempaquetado de esos pesos, y los tensores de los GGUF son identicos byte a byte a los de ZONOS3-Mini. Se ofrecen dos variantes de decodificador: `full_mr` (tamano completo) y `keep2_plain`, una version podada en la que `decoder.0` conserva 2 de 32 capas y las etapas 2, 4, 6 y 8 conservan 2 de 12 capas, lo que reduce el coste y acelera la decodificacion unas 3 veces. No se detalla en la informacion disponible el volumen de horas de audio ni la composicion exacta del dataset de entrenamiento.

## Capacidades

- Codificacion de voz a 44,1 kHz en tramas discretas de 15 Hz con 10 codebooks de 4096 entradas.
- Decodificacion de codigos a forma de onda de alta fidelidad mediante iSTFT multitresolucion causal.
- Representacion semantica integrada en el codebook 0, util para alinear texto y audio en modelos TTS.
- Soporte de streaming gracias al caracter causal del decodificador.
- Inferencia en PyTorch (encoder solo en CUDA) y en C++/ggml mediante las CLI `zac-cli` y `zac-encoder-cli`.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un codec de audio.
- Capacidades multilingues: no disponibles como propiedad del modelo; dependen del TTS que consuma los codigos.

## Casos de uso

- Entrenamiento de modelos TTS sobre representaciones discretas: el codebook semantico y la tasa de 15 Hz reducen la longitud de secuencia que debe modelar el TTS, lo que segun el autor rebaja el WER en un factor de 10 frente a DAC con datos limitados.
- Sintesis de voz en produccion con baja latencia: el decodificador causal y la variante podada `keep2_plain` (0,58 GB, ~3x mas rapida) permiten generar audio por tramas conforme llegan los codigos, apto para respuestas habladas en tiempo real.
- Clonacion de voz y conversión de estilo: la similitud acustica reportada frente a DAC y la comparabilidad con S1-DAC y MOSS v2 hacen viable entrenar adaptadores de hablante sobre los codigos acusticos.
- Compresion y almacenamiento de archivos de voz: 150 simbolos por segundo con 10 codebooks de 12 bits equivalen a unos 225 bytes por segundo antes de entropia, muy por debajo del PCM a 44,1 kHz, util para archivos de llamadas o podcasts.
- Pipelines de datos para investigacion en habla: tokenizar grandes corpus de audio a 44,1 kHz para entrenar modelos de lenguaje de audio o clasificadores sobre secuencias discretas manejables.
- Despliegue en entornos sin Python: los GGUF y las CLI en C++/ggml permiten integrar codificacion y decodificacion en servicios nativos o en dispositivos con recursos limitados.
- Transcripcion asistida y evaluacion: el encoder expone el profesor Wav2Vec2-BERT 2.0, lo que permite reutilizar representaciones semanticas en tareas de analisis del habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (tablas de WER, MOS, MCD u otros) en la informacion disponible. La model card solo aporta comparaciones cualitativas: reduccion de 10x en WER frente a DAC bajo restricciones de datos similares, mejor similitud acustica que DAC y resultados comparables a S1-DAC y MOSS v2 con mayor compresion.

## Requisitos de hardware

- Decodificador podado `keep2_plain`: 0,58 GB en safetensors y 0,45 GB en GGUF f16; cabe holgadamente en cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en CPU via ggml.
- Decodificador completo `full_mr`: 4,07 GB en safetensors y 2,20 GB en GGUF f16; recomendable 8 GB de VRAM para trabajar con margen en GPU.
- Encoder: 4,81 GB en safetensors y requiere CUDA segun la model card; en GGUF f32 ocupa 4,03 GB, mas 1,55 GB del profesor semantico si se usa `zac-encoder-cli`. Se recomienda una GPU con 12-16 GB de VRAM (RTX 4080/4090, A100, H100) para codificar con comodidad.
- GPU recomendadas: RTX 4090 o A100/H100 para el pipeline completo de codificacion y decodificacion; RTX 3060/4060 en adelante para solo decodificacion.
- Despliegue: PyTorch via `torch.hub`, y CLI ggml (`zac-cli`, `zac-encoder-cli`) para CPU y GPU. No se documentan integraciones con vLLM, TGI u Ollama, que no aplican a un codec.
- Latencia y throughput: no disponibles de forma numerica; la unica referencia es la mejora de aproximadamente 3x del decodificador podado frente al completo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Frecuencia / tasa | Licencia | Notas |
|---|---|---|---|---|---|
| ZAC-1 | Codec neuronal semantico-acustico | 1.057.851.328 | 44,1 kHz, 15 Hz x 10 codebooks | Apache-2.0 | Codebook 0 semantico destilado de Wav2Vec2-BERT 2.0 |
| DAC | Codec neuronal acustico | no disponible | no disponible | no disponible | Referencia de comparacion en la model card; ZAC-1 reporta 10x menos WER en TTS con datos similares |
| S1-DAC | Codec neuronal | no disponible | no disponible | no disponible | Resultados comparables a ZAC-1 con mayor compresion en este ultimo |
| MOSS v2 | Codec neuronal | no disponible | no disponible | no disponible | Resultados comparables a ZAC-1 con mayor compresion en este ultimo |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier expectativa en ese sentido es un error de uso.
- El encoder requiere CUDA segun la model card, lo que limita el despliegue en entornos solo CPU para la fase de codificacion.
- La calidad y el sesgo linguistico dependen del modelo TTS que consuma los codigos; el codec en si no garantiza cobertura multilingue.
- Riesgo de artefactos y perdida de detalle en audio no vocal (musica, ruido, habla superpuesta) al estar disenado para voz; no se documenta su comportamiento fuera de dominio.
- El decodificador podado `keep2_plain` sacrifica fidelidad frente a `full_mr`; conviene validar la calidad antes de usarlo en produccion.
- Los pesos son un reempaquetado del codec de ZONOS3-Mini; las actualizaciones del modelo original no se reflejan automaticamente en este repositorio.
- Aunque la licencia es Apache-2.0, el profesor incluido deriva de `facebook/w2v-bert-2.0` (MIT); conviene conservar los avisos de atribucion correspondientes.
- El repositorio tiene un numero muy bajo de descargas y likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyphra/ZAC-1
- Codigo, uso, streaming y CLI C++/ggml: https://github.com/Zyphra/ZAC-1
- Modelo ZONOS3-Mini: https://huggingface.co/Zyphra/ZONOS3-Mini
- Post tecnico de ZONOS3-Mini (arquitectura y entrenamiento): https://www.zyphra.com/our-work/zonos3-mini#training-and-architecture-details
- Profesor semantico Wav2Vec2-BERT 2.0: https://huggingface.co/facebook/w2v-bert-2.0
