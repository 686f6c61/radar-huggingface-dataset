# VoxDance-Lab/VoxMel-0.3B

## Resumen

VoxMel-0.3B es un modelo de síntesis de voz (text-to-speech) de pesos abiertos desarrollado por VoxDance Lab, orientado a la clonación de voz zero-shot en inglés y mandarín. A partir de una grabación de referencia corta y su transcripción, el modelo sintetiza texto nuevo manteniendo la voz de la referencia. Forma parte de una familia de dos checkpoints (0.3B y 0.6B) publicada bajo licencia Apache 2.0.

La innovación principal es que modela directamente espectrogramas Mel sin un tokenizador acústico aprendido. Una transformada de Haar fija y de dos ejes separa el espectrograma en una parte gruesa (Coarse-Mel) y dos residuos (temporal y de frecuencia). El modelo genera las tramas gruesas de forma autorregresiva y reconstruye los detalles en dos pasadas no autorregresivas posteriores, para finalmente renderizar la onda con el vocoder Vocos a 24 kHz.

Es relevante porque evita la dependencia de tokenizadores acústicos entrenados y publica pesos y código bajo una licencia permisiva, lo que facilita su integración en pipelines de TTS personalizado. El modelo está pensado para habla de formato corto y su desarrollo continúa hacia generación de formato largo, diálogo multi-hablante y más idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo con cabeza de flow matching, más dos etapas no autorregresivas de reconstrucción (residuo temporal y de frecuencia) sobre transformada de Haar fija; vocoder Vocos congelado |
| Parametros totales | 0.3B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés y mandarín |
| Licencia | Apache 2.0 (componentes de terceros con sus propias licencias) |
| Formato de pesos | PyTorch (`model_L_final.pt`); el vocoder Vocos se distribuye por separado |

## Arquitectura y entrenamiento

VoxMel emplea un Transformer decoder-only que predice la siguiente trama continua de Coarse-Mel a partir de las entradas de condicionamiento y de las tramas gruesas previas, con una cabeza de flow matching para la generación continua. La representación acústica se obtiene con una transformada de Haar fija e invertible que divide el espectrograma Mel de entrenamiento en frecuencia y tiempo, separando la señal gruesa de dos residuos. Tras la generación autorregresiva, una etapa no autorregresiva predice el residuo temporal y la inversa de Haar en el eje temporal reconstruye el Mel promediado en frecuencia; una segunda etapa predice el residuo de frecuencia y la inversa de Haar en ese eje recupera el espectrograma Mel completo. Finalmente, un vocoder Vocos congelado a 24 kHz convierte el Mel en onda.

El frontend de texto utiliza el tokenizador de Qwen2.5. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La invertibilidad garantizada aplica a la transformada de Haar fija; la calidad final del audio depende de las características Mel generadas y del vocoder.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en inglés y mandarín.
- Clonación de voz zero-shot: genera habla en la voz de una grabación de referencia corta, usando la transcripción exacta de esa referencia.
- Modelado directo de espectrogramas Mel sin tokenizador acústico aprendido.
- Generación autorregresiva de tramas continuas con cabeza de flow matching.
- Reconstrucción en dos pasadas no autorregresivas (residuo temporal y de frecuencia).
- Renderizado de audio a 24 kHz mediante vocoder Vocos.
- Interfaz de demostración local vía Gradio según las instrucciones del repositorio.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Clonación de voz para doblaje y localización: con una grabación de referencia corta y su transcripción, el modelo sintetiza guiones nuevos en la voz del hablante, adecuado para inglés y mandarín.
- Generación de voces para asistentes conversacionales: el modelo produce habla personalizada a partir de texto, integrándose en un backend de TTS para respuestas de un asistente.
- Prototipado de audiolibros y contenido narrado de formato corto: la evaluación del modelo se centró en habla corta, por lo que encaja en fragmentos breves narrados con una voz de referencia concreta.
- Accesibilidad y lectura en voz alta: conversión de texto a voz con una voz clonada del usuario o de un locutor autorizado, útil en interfaces de lectura.
- Investigación en TTS y representaciones acústicas: al modelar Mel directamente sin tokenizador aprendido, sirve como base para experimentar con representaciones wavelet y generación autorregresiva continua.
- Integración en pipelines de producción con licencia permisiva: la licencia Apache 2.0 permite incorporar el modelo en productos comerciales, siempre que se respeten las licencias de los componentes de terceros (tokenizador Qwen2.5, vocoder Vocos).
- Demos interactivas y evaluación subjetiva: el repositorio incluye instrucciones para un demo Gradio, útil para comparar voces de referencia con las síntesis generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0.3B parámetros en precisión de 16 bits los pesos ocupan aproximadamente 0.6 GB, a lo que hay que sumar el vocoder Vocos y las activaciones. El repositorio ocupa 3.0 GB.
- GPU recomendadas: no disponible. Por tamaño, el modelo es susceptible de ejecutarse en GPU de consumo, pero la información no confirma modelos concretos ni requisitos mínimos.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño de parámetros lo hace plausible, pero no se documentan requisitos oficiales.
- Opciones de despliegue: paquete Python `voxcore` (clase `VoxMel.from_pretrained`), PyTorch y torchaudio (Python 3.10–3.12), más el vocoder Vocos de 24 kHz; demo local con Gradio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia interna de la misma familia:

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---|---|
| VoxMel-0.3B | 0.3B | Inglés y mandarín | Apache 2.0 | Pesos en Hugging Face |
| VoxMel-0.6B | 0.6B | Inglés y mandarín | Apache 2.0 | Pesos en Hugging Face |

La comparación con alternativas de otros desarrolladores no está disponible.

## Limitaciones y advertencias

- Evaluado principalmente en habla de formato corto en inglés y mandarín; la generación de formato largo, el diálogo multi-hablante y más idiomas están en desarrollo según el autor.
- La transcripción de la referencia debe coincidir exactamente con las palabras pronunciadas en la grabación; de lo contrario, la clonación puede degradarse.
- La calidad del audio depende de las características Mel generadas y del vocoder; la invertibilidad garantizada aplica solo a la transformada de Haar fija.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- Riesgo de uso indebido de la clonación de voz (suplantación, contenido no consentido); aunque la licencia es permisiva, conviene aplicar controles de consentimiento y verificación en producción.
- La licencia Apache 2.0 cubre código y pesos de VoxMel, pero los componentes de terceros (tokenizador Qwen2.5, vocoder Vocos) tienen sus propias licencias que deben revisarse para uso comercial.
- No se documentan requisitos de hardware, cuantizaciones ni latencias, lo que limita la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoxDance-Lab/VoxMel-0.3B
- Checkpoint hermano VoxMel-0.6B: https://huggingface.co/VoxDance-Lab/VoxMel-0.6B
- Demos de audio: https://voxdance.github.io/voxmel-demo/
- Repositorio GitHub: https://github.com/VoxDance-Lab/VoxMel
- Informe técnico (arXiv): https://arxiv.org/abs/2611.20254
- Organización en Hugging Face: https://huggingface.co/VoxDance-Lab
