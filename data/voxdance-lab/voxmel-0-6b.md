# VoxDance-Lab/VoxMel-0.6B

## Resumen

VoxMel-0.6B es un modelo de síntesis de voz (text-to-speech) de pesos abiertos desarrollado por VoxDance Lab, orientado a la clonación de voz zero-shot en inglés y mandarín. A partir de una grabación de referencia corta y su transcripción, el modelo sintetiza texto nuevo manteniendo la identidad vocal de la referencia. Forma parte de una familia que incluye también una variante de 0.3B parámetros.

La propuesta técnica diferencial es que VoxMel modela directamente espectrogramas Mel sin un tokenizador acústico aprendido. Una transformada de Haar fija y de dos ejes separa el espectrograma grueso de sus detalles temporales y frecuenciales; el modelo genera las tramas gruesas de forma autorregresiva y recupera los detalles en dos pasadas no autorregresivas. La síntesis final de la forma de onda la realiza un vocoder Vocos congelado a 24 kHz.

El modelo es relevante porque demuestra que es posible prescindir de tokenizadores acústicos aprendidos manteniendo generación autorregresiva de alta calidad, con un tamaño compacto (0.6B) y licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo con cabeza de flow matching, más dos etapas no autorregresivas de reconstrucción (temporal y frecuencial) sobre transformada de Haar fija; vocoder Vocos congelado |
| Parametros totales | 0.6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés y mandarín |
| Licencia | Apache 2.0 (componentes de terceros con sus propias licencias) |
| Formato de pesos | `.pt` (checkpoint PyTorch `model_L_final.pt`); no se mencionan safetensors ni GGUF |

## Arquitectura y entrenamiento

VoxMel se aparta del paradigma habitual de TTS neural basado en tokenizadores acústicos. En su lugar, una transformada de Haar fija e invertible descompone el espectrograma Mel de entrenamiento en tres componentes: un Coarse-Mel (espectrograma grueso) y dos residuales (temporal y frecuencial). La generación se realiza en tres etapas: primero, un Transformer decoder-only con cabeza de flow matching predice la siguiente trama continua de Coarse-Mel de forma autorregresiva, condicionada por el texto y las tramas previas; después, dos etapas no autorregresivas predicen el residual temporal y el residual frecuencial, aplicando las inversas de Haar correspondientes para reconstruir el espectrograma Mel completo. Finalmente, un vocoder Vocos congelado a 24 kHz convierte el Mel reconstruido en forma de onda.

El frontend de texto emplea el tokenizador de Qwen2.5. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la factorización wavelet del espacio Mel, que permite generación autorregresiva de tramas continuas sin tokenizador aprendido y con etapas de refinamiento no autorregresivas que reducen el coste computacional de la generación.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y mandarín.
- Clonación de voz zero-shot a partir de una grabación de referencia corta y su transcripción exacta.
- Modelado autorregresivo de espectrogramas Mel continuos sin tokenizador acústico aprendido.
- Reconstrucción jerárquica de detalle espectral mediante transformada de Haar invertible (temporal y frecuencial).
- Generación de audio a 24 kHz mediante vocoder Vocos.
- Control de reproducibilidad mediante semilla (`seed`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento extendido.

## Casos de uso

- Clonación de voz para doblaje y localización: a partir de una muestra corta del actor original, VoxMel permite generar nuevas locuciones en inglés o mandarín manteniendo el timbre, útil para prototipado rápido de doblajes antes de la grabación definitiva.
- Audiolibros y narración personalizada: con una referencia del narrador se pueden generar capítulos completos en su voz, aunque la model card advierte que la evaluación se centró en habla corta y el soporte de formato largo está en desarrollo.
- Asistentes de voz embebidos: el tamaño compacto (0.6B) y la licencia Apache 2.0 permiten integrar el modelo en productos comerciales con requisitos moderados de hardware.
- Accesibilidad: generación de voz personalizada para usuarios que necesiten mantener su identidad vocal en interfaces de comunicación aumentativa, usando una grabación previa como referencia.
- Prototipado de contenido multimedia: creación rápida de voces sintéticas para vídeos, pódcasts o demos de producto sin contratar grabaciones, con control de semilla para reproducibilidad.
- Investigación en TTS: la arquitectura sin tokenizador acústico y la factorización wavelet sirven como base para experimentos sobre representaciones continuas y generación autorregresiva de audio.
- Pruebas A/B de voces en entornos de desarrollo: el script de ejemplo y la demo Gradio facilitan la evaluación comparativa de referencias vocales antes de fijar una voz de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0.6B parámetros y pesos en el repositorio de 2.8 GB, se espera que quepa en GPUs de consumo con al menos 8 GB de VRAM, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 o A100/H100 ofrecerían margen amplio, pero no hay cifras publicadas.
- GPU de consumo: probablemente compatible con tarjetas de 8-12 GB o superiores; no confirmado.
- Opciones de despliegue: paquete Python propio (`voxcore`) instalable con `pip install -e .`, PyTorch y torchaudio, más vocoder Vocos; también hay instrucciones para una demo Gradio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Licencia | Notas |
|---|---|---|---|---|---|
| VoxMel-0.6B | 0.6B | EN, ZH | Sí | Apache 2.0 | Sin tokenizador acústico; factorización Haar |
| VoxMel-0.3B | 0.3B | EN, ZH | Sí | Apache 2.0 | Variante compacta de la misma familia |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Evaluado principalmente en habla corta en inglés y mandarín; la generación de formato largo y el diálogo multi-hablante están en desarrollo según el autor.
- Solo soporta inglés y mandarín; no hay soporte documentado para otras lenguas.
- La transcripción de la referencia debe coincidir exactamente con las palabras pronunciadas en la grabación; discrepancias degradan la clonación.
- La calidad final depende de las características Mel generadas y del vocoder Vocos; no se documentan métricas objetivas de calidad.
- Riesgo de uso indebido para suplantación de identidad vocal; al ser un modelo de clonación zero-shot con licencia permisiva, conviene aplicar controles de consentimiento y verificación en producción.
- No se documentan sesgos específicos ni tasas de alucinación; en TTS el riesgo se traduce en prosodia incorrecta, artefactos o pronunciación errónea, no verificados por el autor.
- La licencia Apache 2.0 cubre código y pesos, pero los componentes de terceros (tokenizador Qwen2.5, vocoder Vocos) tienen sus propias licencias que deben revisarse para uso comercial.
- No hay información sobre cuantizaciones, formatos GGUF ni integración con runners de inferencia habituales, lo que limita el despliegue en entornos no PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/VoxDance-Lab/VoxMel-0.6B
- Variante 0.3B: https://huggingface.co/VoxDance-Lab/VoxMel-0.3B
- Demos de audio: https://voxdance.github.io/voxmel-demo/
- Repositorio GitHub: https://github.com/VoxDance-Lab/VoxMel
- Informe técnico (arXiv): https://arxiv.org/abs/2611.20254
- Organización en Hugging Face: https://huggingface.co/VoxDance-Lab
