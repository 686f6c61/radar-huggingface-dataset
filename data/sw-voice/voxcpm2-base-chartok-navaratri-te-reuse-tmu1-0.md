# sw-voice/voxcpm2-base-chartok-navaratri-te-reuse-tmu1.0

## Resumen

voxcpm2-base-chartok-navaratri-te-reuse-tmu1.0 es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz openbmb/VoxCPM2, publicado por el usuario sw-voice con fines de investigación. El modelo parte de los pesos base de VoxCPM2 y se entrena sobre un corpus específico de temática devocional en telugu (swamiji-navaratri-telugu-reuse-themes), compuesto por 127 unidades temáticas completas. El resultado es un modelo de texto-a-voz (TTS) especializado en esa variedad lingüística y ese registro concreto, no un modelo de propósito general.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de reutilización de un TTS multilingüe de ~2.290 millones de parámetros mediante ajuste fino integral, incluyendo la ampliación del tokenizador con 100 tokens de caracteres telugu (rango Unicode U+0C00-U+0C7F, ids 73448-73547). Por otro, ilustra una práctica habitual en investigación: adaptar un modelo base a un dominio estrecho con un presupuesto de cómputo muy reducido (80 pasos de entrenamiento) y evaluar el resultado de forma libre de referencias, asumiendo que "la voz está en los pesos".

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 9,5 GB. Los idiomas declarados son inglés, telugu y kannada, heredados del modelo base. No cuenta con descargas ni valoraciones en el momento de la consulta, lo que es coherente con su carácter de artefacto de investigación recién publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base VoxCPM2; arquitectura interna no detallada en la información proporcionada) |
| Parametros totales | 2.290.209.344 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, te, kn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de openbmb/VoxCPM2 realizado con el entrenador oficial de VoxCPM. No se congela ningún parámetro: se entrenan los 2.290 millones de parámetros del modelo base. El entrenamiento emplea micro-lote de 1 con acumulación de 8 (lote efectivo de 8), 5 épocas sobre 127 unidades temáticas completas del corpus swamiji-navaratri-telugu-reuse-themes, lo que resulta en 80 pasos totales. Se usa una tasa de aprendizaje de 1e-4 con decaimiento coseno, 12 pasos de calentamiento y recorte de gradiente de 1,0. La formulación de flow-matching emplea t = sigmoid(N(1.0, 1)), y el ajuste se realiza directamente sobre el modelo base (variante 06/40 A/B).

La innovación técnica principal es la ampliación del tokenizador: se añaden 100 tokens de caracteres telugu correspondientes al rango Unicode U+0C00-U+0C7F, con ids 73448-73547. Cada fila de embedding de estos tokens nuevos se inicializa a partir de las tres filas de tokens de bytes correspondientes a cada carácter, lo que proporciona un punto de partida informado para caracteres no vistos durante el preentrenamiento. El enfoque es libre de referencias: no se usa un hablante de referencia en inferencia, sino que la identidad vocal queda codificada en los pesos del modelo ajustado. No se dispone de información sobre la composición exacta del dataset de preentrenamiento del modelo base ni sobre si hubo etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto (pipeline text-to-speech) en inglés, telugu y kannada.
- Generación de voz sin referencia de hablante: la identidad vocal está embebida en los pesos.
- Manejo de texto en escritura telugu gracias a los 100 tokens de caracteres añadidos al tokenizador.
- Adaptación a un dominio temático concreto (temas devocionales de Navaratri) mediante ajuste fino integral.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de TTS.
- No se documentan capacidades de visión, audio de entrada ni modo de razonamiento (thinking mode).

## Casos de uso

- Síntesis de textos devocionales en telugu: el modelo se ha ajustado específicamente sobre 127 unidades temáticas de temática Navaratri, por lo que es adecuado para narrar o recitar contenido de ese registro con una prosodia y pronunciación adaptadas al corpus.
- Investigación en adaptación de dominio de TTS: sirve como caso de estudio reproducible de ajuste fino completo con presupuesto reducido (80 pasos) y ampliación de tokenizador para una escritura no latina, útil para comparar estrategias de inicialización de embeddings.
- Generación de audiolibros o material educativo en telugu: al estar la voz embebida en los pesos, se puede generar voz consistente entre fragmentos sin necesidad de mantener un audio de referencia en cada petición.
- Prototipado de asistentes de voz multilingües: al declarar soporte de inglés, telugu y kannada, puede emplearse para probar flujos de TTS en aplicaciones que combinen estos idiomas, siempre validando la calidad en los idiomas no ajustados.
- Evaluación comparativa de TTS de código abierto: con licencia Apache 2.0 y pesos safetensors, es apto para integrarse en bancos de pruebas internos de calidad de síntesis y naturalidad.
- Experimentación académica con tokenizadores ampliados: el esquema de inicialización de tokens de carácter a partir de tokens de bytes es replicable y sirve para estudiar el impacto en la convergencia y la pronunciación de lenguas con escrituras propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 2.290 millones de parámetros en precisión de 16 bits requiere aproximadamente 4,6 GB solo para los pesos, a los que hay que sumar memoria para activaciones y buffers del pipeline de TTS; en fp32 la cifra se duplica. Estas estimaciones no proceden de la documentación del modelo.
- GPU recomendadas: no disponible. Por tamaño, el modelo puede residir en GPUs de consumo con al menos 8-12 GB de VRAM en fp16, aunque no hay validación publicada.
- Cabe en GPU de consumo: probablemente sí en modelos como RTX 3060 de 12 GB, RTX 4070 o superiores, siempre que el pipeline de inferencia de VoxCPM2 lo permita; no confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de TTS con pesos safetensors, el despliegue previsible pasa por el código oficial de VoxCPM2 (repositorio openbmb) o por el código de investigación swamiji-tts citado en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| voxcpm2-base-chartok-navaratri-te-reuse-tmu1.0 | 2.290 M | no disponible | en, te, kn | Apache 2.0 | Ajuste fino de dominio sobre VoxCPM2; sin benchmarks publicados |
| openbmb/VoxCPM2 (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo de partida; capacidades generales de TTS |
| Alternativas de TTS open source de tamano comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo etiqueta como "(research)"; no hay evidencia de validación para producción.
- Corpus de entrenamiento muy pequeño (127 unidades temáticas, 80 pasos), lo que aumenta el riesgo de sobreajuste al dominio y de degradación en textos fuera de la temática devocional.
- La calidad en inglés y kannada no se ha validado tras el ajuste fino; el entrenamiento se centró en telugu y podría haber desplazado el rendimiento en los otros idiomas.
- Riesgo de alucinación prosódica y de pronunciación incorrecta en palabras fuera del vocabulario cubierto por los 100 tokens de caracteres añadidos.
- No se documentan sesgos específicos, pero al derivar de un modelo base multilingüe puede heredar sesgos de pronunciación y de representación de hablantes del corpus original.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del corpus de entrenamiento antes de explotarlo en producción.
- No hay información sobre latencia, throughput ni requisitos mínimos de hardware, lo que dificulta planificar despliegues.
- Cero descargas y cero valoraciones en el momento de la consulta: no existe validación comunitaria del artefacto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sw-voice/voxcpm2-base-chartok-navaratri-te-reuse-tmu1.0)
- [Modelo base openbmb/VoxCPM2](https://huggingface.co/openbmb/VoxCPM2)
- Dataset citado: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card; no se proporciona URL directa)
- Código de investigación: swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (referenciado en la model card; no se proporciona URL directa)
