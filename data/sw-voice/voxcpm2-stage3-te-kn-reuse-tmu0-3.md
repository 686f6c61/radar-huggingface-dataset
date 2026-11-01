# sw-voice/voxcpm2-stage3-te-kn-reuse-tmu0.3

## Resumen

voxcpm2-stage3-te-kn-reuse-tmu0.3 es un modelo de síntesis de voz (text-to-speech) desarrollado por sw-voice, un ajuste fino completo del modelo sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep. El modelo está orientado a la generación de voz en inglés, telugu y kannada, y se distribuye con licencia Apache 2.0. Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB, se trata de un modelo de tamaño medio dentro del ecosistema TTS.

El modelo se presenta explícitamente como un artefacto de investigación ("research") y no como un producto listo para producción. Se ha entrenado con el entrenador oficial de VoxCPM sobre datos de temática devocional (swamiji-navaratri) en telugu y kannada, con 127 y 124 unidades temáticas completas respectivamente, en modalidad RE-USE. La innovación principal declarada es que el modelo es "reference-free": la identidad de la voz está codificada directamente en los pesos, sin necesidad de un audio de referencia en el momento de la inferencia.

El ajuste fino se realizó sobre todos los parámetros (nada congelado), con 5 épocas, 160 pasos totales y una programación de learning rate coseno con warmup de 24 pasos. El modelo utiliza flow-matching con un muestreo de t = sigmoid(N(0,3, 1)), un detalle técnico que condiciona el proceso de generación. Es relevante ahora como ejemplo de adaptación de un modelo TTS multilingüe a dominios y voces específicas mediante fine-tuning completo, aunque su estado de investigación y su escaso número de descargas (18) indican que no ha sido validado de forma amplia por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en VoxCPM; detalles de arquitectura no especificados en la model card) |
| Parámetros totales | 2.290.004.544 (≈2,29 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Modelo base | sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep |
| Tamaño del repositorio | 9,5 GB |
| Fecha de creación | 2026-10-31 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de identificarla como un modelo VoxCPM para text-to-speech. El modelo es un ajuste fino completo ("full fine-tune") del checkpoint sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep, realizado con el entrenador oficial de VoxCPM. No se congeló ningún parámetro: todos los pesos fueron actualizados durante el entrenamiento. El proceso de generación emplea flow-matching con un muestreo del tiempo de flujo t = sigmoid(N(0,3, 1)), lo que implica un sesgo hacia valores de t cercanos a 0,3 durante el entrenamiento.

Los datos de entrenamiento provienen de los conjuntos sw-voice/swamiji-navaratri-telugu-reuse-themes y sw-voice/swamiji-navaratri-kannada-reuse-themes, con 127 y 124 unidades temáticas completas respectivamente, en modalidad RE-USE. El entrenamiento se configuró con micro-batch de 1 y acumulación de gradientes de 8 (batch efectivo de 8), 5 épocas que resultan en 160 pasos totales, learning rate de 0,0001 con programación coseno, warmup de 24 pasos y recorte de gradiente de 1,0. Una característica destacada es que el modelo es "reference-free": la identidad de voz queda embebida en los pesos y no requiere un clip de referencia en inferencia. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés, telugu y kannada.
- Generación de voz sin referencia de audio ("reference-free"): la identidad de voz está codificada en los pesos del modelo.
- Soporte multilingüe limitado a los tres idiomas indicados (en, te, kn).
- Adaptación a un dominio y estilo de voz específicos (temática devocional swamiji-navaratri) mediante fine-tuning completo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplicable a un modelo TTS).
- No se documentan capacidades de visión, audio de entrada ni modo "thinking".
- No se documenta clonación de voz zero-shot ni control de emoción/prosodia más allá de lo implícito en el fine-tuning.

## Casos de uso

- Síntesis de voz para contenido devocional en telugu y kannada: el modelo está ajustado específicamente sobre temática swamiji-navaratri, por lo que es adecuado para narrar o recitar textos religiosos y espirituales en esos idiomas con una voz consistente embebida en los pesos.
- Generación de audiolibros y narraciones multilingües: permite convertir texto en voz en inglés, telugu y kannada desde un único checkpoint, útil para editoriales que publican en varios idiomas del sur de la India.
- Locución para aplicaciones de accesibilidad: lectura de contenido textual para usuarios con discapacidad visual en telugu o kannada, aprovechando que no requiere audio de referencia para producir una voz estable.
- Prototipado de asistentes de voz regionales: integración en pipelines de TTS para asistentes conversacionales dirigidos a hablantes de telugu y kannada, con la salvedad de que es un modelo de investigación.
- Investigación en adaptación de dominio TTS: sirve como caso de estudio de fine-tuning completo sobre un modelo base multilingüe, útil para investigadores que quieran replicar la metodología (160 pasos, LR 0,0001 coseno, flow-matching con t = sigmoid(N(0,3, 1))).
- Generación de material educativo en audio: creación de lecciones o sermons en audio en los idiomas soportados, con una voz coherente en toda la serie de contenidos.
- Evaluación comparativa de técnicas de ajuste TTS: como checkpoint de investigación, permite comparar el efecto del fine-tuning completo frente a otras estrategias (LoRA, congelación parcial) en la calidad y estabilidad de la voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa por el tamaño (≈2,29 mil millones de parámetros), en precisión FP16 los pesos ocuparían aproximadamente 4,6 GB, a los que habría que sumar memoria para activaciones y buffers del proceso de flow-matching; en FP32 serían unos 9,2 GB. Estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) y en GPUs de datacenter (A100, H100), pero el autor no lo documenta.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 8-24 GB según precisión y cuantización, pero no hay confirmación oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo TTS con pesos safetensors, requeriría el código del entrenador oficial de VoxCPM o un runtime compatible con la arquitectura VoxCPM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la información proporcionada para establecer una comparación rigurosa con otros modelos TTS. Se puede señalar lo siguiente a nivel de ficha:

| Modelo | Parámetros | Idiomas | Licencia | Estado |
|---|---|---|---|---|
| voxcpm2-stage3-te-kn-reuse-tmu0.3 | ≈2,29 mil millones | en, te, kn | Apache 2.0 | Investigación, 18 descargas |
| sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep (base) | no disponible | no disponible (inglés en el nombre) | no disponible en la información | Modelo base del fine-tune |
| Otros modelos TTS de la familia VoxCPM | no disponible | no disponible | no disponible | no disponible |

No hay datos de rendimiento (MOS, WER, latencia) que permitan comparar calidad con alternativas.

## Limitaciones y advertencias

- Modelo marcado explícitamente como "research": no está validado para uso en producción y su model card no incluye garantías de calidad.
- Entrenado sobre un corpus muy específico (temática devocional swamiji-navaratri, 127 + 124 unidades temáticas), lo que puede limitar la generalización a otros dominios, estilos y registros.
- Solo cubre tres idiomas (inglés, telugu y kannada); no hay soporte documentado para castellano ni otros idiomas.
- Riesgo de alucinación y artefactos de pronunciación fuera del dominio de entrenamiento, especialmente en textos largos o con vocabulario técnico.
- Sesgos potenciales derivados del corpus de entrenamiento (contenido religioso/devocional), que pueden reflejar estilos prosódicos y léxicos muy concretos.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de audio generado.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la falta de validación y de benchmarks desaconseja su uso en producción sin una evaluación propia.
- No se documentan cuantizaciones ni formatos optimizados para despliegue, lo que puede complicar la integración en infraestructuras estándar.
- Escaso número de descargas (18) y ausencia de likes, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stage3-te-kn-reuse-tmu0.3
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card; no se proporciona URL directa)
- Dataset kannada: sw-voice/swamiji-navaratri-kannada-reuse-themes (referenciado en la model card; no se proporciona URL directa)
- Código: swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (referenciado en la model card; no se proporciona URL directa)
