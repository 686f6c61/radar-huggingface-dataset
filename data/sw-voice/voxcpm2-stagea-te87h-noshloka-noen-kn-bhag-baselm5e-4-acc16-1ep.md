# sw-voice/voxcpm2-stageA-te87h-noshloka-noen-kn-bhag-baselm5e-4-acc16-1ep

## Resumen

voxcpm2-stageA-te87h-noshloka-noen-kn-bhag-baselm5e-4-acc16-1ep es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, un fine-tune completo del modelo base sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep. Se trata de un modelo de investigación derivado de la familia VoxCPM2, orientado a la generación de voz en telugu (te), kannada (kn) e inglés (en), aunque en esta iteración concreta se ha eliminado el inglés del conjunto de entrenamiento. El modelo se publica con licencia Apache 2.0 y un total de 2.290.004.544 parámetros en formato safetensors.

La relevancia de este checkpoint es acotada: es una iteración intermedia dentro de una línea de experimentos de ajuste fino sobre datos de dominio muy específico (textos devocionales y temáticos en telugu y kannada, sin shlokas y sin inglés). No se trata de un modelo de propósito general, sino de una pieza de investigación para evaluar el comportamiento del entrenamiento VoxCPM2 sobre subconjuntos de datos controlados. La model card indica explícitamente que es un modelo "research" y que la voz queda embebida en los pesos (reference-free), sin necesidad de un audio de referencia en inferencia.

El modelo no incluye datos públicos de benchmarks, no tiene descargas ni interacciones en HuggingFace en el momento de la consulta, y su uso previsto es experimental. La información disponible sobre arquitectura interna, composición exacta del dataset y proceso de alineación es limitada y se detalla en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia VoxCPM2, pipeline text-to-speech) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, te, kn (entrenamiento de esta iteracion sin ingles; pesos derivados de un base con ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 37.0 GB |
| Modelo base | sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep |
| Pipeline | text-to-speech |
| Fecha de creacion | 2026-11-03 |
| Fecha de actualizacion | 2026-11-03 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de identificar la familia VoxCPM2 y el pipeline text-to-speech. El entrenamiento se realizó con el trainer oficial de VoxCPM ("official VoxCPM trainer") sobre el modelo base sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep. Se trata de un fine-tune completo: todos los parámetros fueron entrenados ("nothing frozen", "all parameters trained"), sin congelar ningún módulo.

Los datos de entrenamiento se componen de: el conjunto sw-voice/swamiji-telugu-reuse-train sin sus 582 shlokas, los 124 temas de sw-voice/swamiji-navaratri-kannada-reuse-themes y todas las unidades de sw-voice/swamiji-bhagavatha-kannada-reuse-themes. No se incluye inglés. Se realizó 1 epoch con micro-batch 1 y acumulación 16 (batch efectivo 16), lo que resultó en 304 pasos. La tasa de aprendizaje fue 5e-5 con cosine schedule y warmup de 46 pasos, salvo para los parámetros `base_lm.*`, que usaron 5e-4. El gradiente se recortó a 1.0. El flow-matching utilizó t = sigmoid(N(1.0, 1)). Los pesos intermedios al 25%, 50% y 75% del epoch están disponibles bajo `checkpoints/`. El modelo es reference-free: la identidad de voz está incorporada en los pesos y no requiere audio de referencia en inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu y kannada, con pesos derivados de un modelo base que también cubría inglés.
- Generación de voz reference-free: no necesita audio de referencia para producir habla, ya que la voz está embebida en los pesos.
- Cobertura de dominio específica: textos devocionales y temáticos (telugu reutilizado sin shlokas, temas de Navaratri en kannada y Bhagavatha en kannada).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidades multilingües limitadas a los idiomas indicados (en, te, kn), con la salvedad de que esta iteración se entrenó sin inglés.
- No se documentan capacidades de clonación de voz a partir de audio de referencia (el modelo es explícitamente reference-free).

## Casos de uso

- Investigación en ajuste fino de TTS: el checkpoint sirve para estudiar el efecto de eliminar shlokas e inglés del conjunto de entrenamiento sobre la calidad de síntesis en telugu y kannada, comparándolo con el modelo base y con los checkpoints intermedios al 25%, 50% y 75%.
- Evaluación de retención de voz reference-free: al estar la voz embebida en los pesos, permite medir si el fine-tune preserva o desplaza la identidad vocal original del modelo base en dominios concretos.
- Síntesis de contenido devocional en telugu: el conjunto de entrenamiento excluye explícitamente las 582 shlokas, por lo que el modelo es adecuado para probar la generación de texto devocional no-shloka en telugu.
- Síntesis de temas de Navaratri y Bhagavatha en kannada: los datos incluyen los 124 temas de Navaratri y todas las unidades de Bhagavatha, lo que permite evaluar la cobertura de estos dominios temáticos concretos.
- Análisis de olvido catastrófico: al eliminar el inglés del entrenamiento, el modelo es un caso de estudio para medir la degradación de la capacidad en inglés respecto al base.
- Reproducibilidad de experimentos: la model card documenta hiperparámetros completos (LR, warmup, grad clip, flow-matching, batch efectivo, pasos), lo que facilita replicar el entrenamiento con el trainer oficial de VoxCPM.
- Comparación de checkpoints intermedios: los pesos al 25%, 50% y 75% permiten trazar curvas de calidad frente a pasos de entrenamiento en los dominios telugu y kannada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 2.290.004.544 parámetros en fp32 requiere aproximadamente 9,2 GB solo para pesos, y en fp16/bf16 aproximadamente 4,6 GB; a ello hay que sumar memoria para activaciones y buffers del pipeline TTS, cuyo tamaño no se documenta.
- GPU recomendadas: no disponible. No se especifican GPU probadas ni requisitos mínimos.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de parámetros, un modelo de ~2,3B en fp16 podría caber en GPUs de consumo con 8 GB o más, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El pipeline declarado es text-to-speech y el código de referencia se encuentra en el repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| voxcpm2-stageA-te87h-noshloka-noen-kn-bhag-baselm5e-4-acc16-1ep | 2.290.004.544 | no disponible | en, te, kn (entrenado sin en) | apache-2.0 | Fine-tune de investigacion, reference-free |
| sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep | no disponible | no disponible | en, te, kn | no disponible | Modelo base del que deriva este checkpoint |
| Otros modelos TTS de la familia VoxCPM2 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |
| Alternativas TTS multilingues de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría. La única comparación documentada es con el modelo base, del que este checkpoint es un fine-tune completo.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo etiqueta explícitamente como "research"; no está validado para producción.
- Sesgos conocidos: no documentados, pero el entrenamiento se limita a datos devocionales y temáticos de telugu y kannada, lo que puede introducir sesgos de dominio y de estilo.
- Riesgo de alucinación: no evaluado; en TTS, el riesgo se traduce en prosodia, pronunciación o contenido no fiable fuera del dominio de entrenamiento.
- Limitación de idioma: esta iteración se entrenó sin inglés, aunque los tags y la model card listan en, te, kn. La capacidad en inglés puede haberse degradado respecto al modelo base (olvido catastrófico no medido).
- Cobertura de dominio estrecha: excluye las 582 shlokas del conjunto telugu, por lo que no está entrenado para ese subconjunto.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación sin evaluación de calidad, el uso comercial conlleva riesgo no cuantificado.
- Sin datos de benchmarks, latencia, VRAM ni despliegue: no es posible estimar rendimiento en producción a partir de la información disponible.
- Sin descargas ni interacciones en HuggingFace: no hay evidencia de validación por parte de la comunidad.
- Tamaño del repositorio de 37,0 GB: incluye los checkpoints intermedios, lo que incrementa los requisitos de almacenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stageA-te87h-noshloka-noen-kn-bhag-baselm5e-4-acc16-1ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep
- Dataset telugu (referenciado): sw-voice/swamiji-telugu-reuse-train
- Dataset kannada Navaratri (referenciado): sw-voice/swamiji-navaratri-kannada-reuse-themes
- Dataset kannada Bhagavatha (referenciado): sw-voice/swamiji-bhagavatha-kannada-reuse-themes
- Codigo: repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (no se proporciona URL directa)
- Paper, blog o demo: no disponible en la informacion proporcionada
