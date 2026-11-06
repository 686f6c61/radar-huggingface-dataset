# wildernesslabs/kea-b-0.1

## Resumen

Kea-B 0.1 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por Wilderness Labs, presentado como una versión fuertemente cuantizada de NVIDIA Parakeet-TDT-0.6B-v2. La práctica totalidad de sus pesos se almacena en un solo bit (+1 o −1, con una escala por fila) y su decodificador en enteros de 8 bits, lo que reduce el modelo de 2.472 MB a 91,24 MB sin degradar de forma significativa la precisión. Está pensado para despliegues con restricciones severas de memoria, como dispositivos embebidos, microcontroladores de gama alta o servicios de transcripción con alta densidad de instancias.

El modelo se apoya en la arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer) de NeMo, e incorpora entrenamiento consciente de cuantización (QAT) y destilación de conocimiento desde un profesor de precisión completa. Sobre los siete conjuntos de prueba en inglés que NVIDIA reporta, obtiene un WER medio del 6,77 % frente al 6,44 % del original, y supera en precisión a sus predecesores Kea-B 0.0 (7,05 %) y Kea-T (6,84 %) con un tamaño notablemente menor.

Su relevancia actual radica en que demuestra que un ASR de 600 millones de parámetros puede comprimirse a ~91 MB manteniendo una precisión cercana a la del modelo de referencia, lo que habilita la transcripción en tiempo real en hardware de bajo consumo y en entornos donde el ancho de banda o la memoria son el factor limitante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), NeMo |
| Parametros totales | ~0,6 B (heredados de Parakeet-TDT-0.6B-v2); pesos almacenados en 1 bit con escala por fila |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos binarios de 1 bit (+1/−1, una escala por fila) y decodificador en INT8; entrenado con QAT para kernels INT8 × 1-bit |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repositorio NeMo; tamaño total del repo 0,2 GB) |

## Arquitectura y entrenamiento

Kea-B 0.1 parte de NVIDIA Parakeet-TDT-0.6B-v2, un modelo FastConformer con decodificador TDT que combina predicción de tokens con predicción de duración, lo que permite emitir varios tokens por paso y reduce la latencia de decodificación. Sobre esa base, Wilderness Labs aplica una cuantización extrema: casi todos los pesos se binarizan a 1 bit con una escala por fila, mientras que las redes de predicción y conjunta del decodificador pasan de FP16 a INT8.

El entrenamiento combina destilación de conocimiento y QAT. El profesor es un Parakeet de precisión completa afinado con transcripciones generadas por IBM Granite Speech, en lugar de las salidas del propio modelo original, lo que mejora la calidad de las etiquetas. Durante el entrenamiento, las activaciones atraviesan el mismo redondeo INT8 que emplean los kernels de GPU del autor, de modo que la precisión se mantiene al ejecutar sobre ellos. Los datos de entrenamiento provienen de espnet/yodas-granary, MLCommons/peoples_speech, openslr/librispeech_asr, facebook/voxpopuli y edinburghcstr/ami, e incluyen audio de Common Voice con hablantes y frases de test eliminados. El modelo también se entrenó con audio más difícil que la versión 0.0.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio, con salida de transcripción.
- Decodificación TDT, que predice tokens y duraciones y permite emisión múltiple por paso.
- Inferencia eficiente en memoria gracias a pesos de 1 bit y decodificador INT8.
- Ejecución sobre kernels INT8 × 1-bit en GPU con precisión equivalente a la evaluación en FP32.
- Manejo de audio ruidoso y de dominios variados (conversacional, reuniones, conferencias, lectura).
- No soporta tool calling, agentes, visión, audio generativo ni capacidades multilingües más allá del inglés.

## Casos de uso

- Transcripción en dispositivos embebidos: con ~91 MB de pesos, el modelo cabe en placas con memoria limitada y permite subtitulado o dictado local sin conexión.
- Servicios de transcripción de alta densidad: al reducir el peso por instancia, un mismo servidor GPU puede alojar muchas réplicas concurrentes para atender peticiones en paralelo.
- Actas de reuniones: su WER del 9,89 % en AMI lo hace adecuado para diarización y transcripción de audio conversacional de sala.
- Subtitulado de contenido audiovisual: el WER del 3,67 % en SPGISpeech y del 6,29 % en VoxPopuli lo sitúan como opción para transcripción de habla clara y de dominio parlamentario.
- Análisis de llamadas y atención al cliente: permite transcribir grabaciones a gran escala con coste de cómputo bajo y procesamiento por lotes.
- Investigación en compresión de modelos: sirve como referencia reproducible de QAT binario y destilación aplicada a ASR, con evaluación completa en EVALUATION.md.
- Preprocesado de pipelines de voz: transcripción previa a sistemas de búsqueda, indexación o moderación de audio en inglés.

## Benchmarks y rendimiento

WER de test (%), decodificación greedy, menor es mejor. Datos declarados por el autor (no verificados):

| Modelo | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media de 7 | Common Voice |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original (Parakeet-TDT-0.6B-v2, cifras de NVIDIA) | 1,69 | 3,19 | 11,16 | 11,15 | 9,74 | 2,17 | 5,95 | 6,44 | n/a |
| Kea-T | 2,05 | 4,20 | 10,42 | 11,72 | 10,35 | 2,94 | 6,19 | 6,84 | 12,56 |
| Kea-B 0.0 | 2,20 | 4,56 | 10,65 | 12,17 | 10,46 | 3,01 | 6,30 | 7,05 | 13,42 |
| **Kea-B 0.1** | **2,07** | **4,32** | **9,89** | **10,86** | **10,29** | **3,67** | **6,29** | **6,77** | **11,35** |

Kea-B 0.1 se evalúa reconstruyendo los pesos en FP32 desde el repositorio. Sobre los kernels INT8 × 1-bit para los que fue entrenado, la media es 6,77 % y ningún conjunto varía más de 0,05 puntos. La puntuación en Common Voice no es comparable con la de los otros modelos porque el modelo ha entrenado con audio de ese corpus (con hablantes y frases de test eliminados).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,2 GB y el modelo pesa 91,24 MB, por lo que la huella en memoria es de unos pocos cientos de MB incluyendo activaciones y buffers.
- GPU recomendadas: cualquier GPU NVIDIA moderna; los kernels INT8 × 1-bit del autor están pensados para GPU, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en placas integradas con suficiente memoria; también es viable en CPU.
- Opciones de despliegue: NeMo (librería nativa del modelo); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Media WER (7 sets) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Kea-B 0.1 | ~0,6 B (1 bit + INT8) | 91,24 MB | 6,77 % | CC-BY-4.0 | Hugging Face (wildernesslabs) |
| Kea-B 0.0 | ~0,6 B (1 bit + INT8) | 105,3 MB | 7,05 % | CC-BY-4.0 | Hugging Face (wildernesslabs) |
| Kea-T | ~0,6 B (2 bit) | ~mitad que Kea-B 0.1 según el autor | 6,84 % | CC-BY-4.0 | Hugging Face (wildernesslabs) |
| NVIDIA Parakeet-TDT-0.6B-v2 | ~0,6 B (FP) | 2.472 MB | 6,44 % | no disponible en la información | Hugging Face (nvidia) |

## Limitaciones y advertencias

- Solo reconoce inglés; no soporta otros idiomas.
- La cuantización a 1 bit introduce una degradación medible: +0,33 puntos de WER medio frente al original y peor comportamiento relativo en SPGISpeech (3,67 % frente a 2,17 %).
- El rendimiento en audio conversacional y ruidoso es notablemente inferior (AMI 9,89 %, Earnings-22 10,86 %, GigaSpeech 10,29 %).
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en model-index).
- La puntuación en Common Voice no es comparable con la de otros modelos por contaminación del entrenamiento con ese corpus.
- Riesgo de alucinación y errores en nombres propios, cifras y términos técnicos, habitual en ASR.
- Sesgos potenciales heredados de los corpus de entrenamiento (YODAS, People's Speech, LibriSpeech, VoxPopuli, AMI), no documentados por el autor.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar las condiciones de los datos de entrenamiento subyacentes.
- No se documentan limitaciones de longitud de audio ni de contexto; no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wildernesslabs/kea-b-0.1
- Modelo base: https://huggingface.co/wildernesslabs/kea-b
- Versión anterior Kea-B 0.0: https://huggingface.co/wildernesslabs/kea-b
- Kea-T (2 bit): https://huggingface.co/wildernesslabs/kea-t
- Modelo original NVIDIA Parakeet-TDT-0.6B-v2: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Evaluación detallada: EVALUATION.md en el repositorio del modelo
- Dataset YODAS Granary: https://huggingface.co/datasets/espnet/yodas-granary
- Dataset People's Speech: https://huggingface.co/datasets/MLCommons/peoples_speech
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
