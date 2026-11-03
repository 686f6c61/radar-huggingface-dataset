# sw-voice/voxcpm2-stageB-te87h-noshloka-kn-bhag-baselm5e-4A-navaratri-knhalf

## Resumen

voxcpm2-stageB-te87h-noshloka-kn-bhag-baselm5e-4A-navaratri-knhalf es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en HuggingFace. Se trata de un ajuste fino completo (full fine-tune) del modelo sw-voice/voxcpm2-stageA-te87h-noshloka-noen-kn-bhag-baselm5e-4-acc16-1ep, realizado con el entrenador oficial de VoxCPM. El modelo pertenece a la familia VoxCPM2 y está orientado a la generación de voz sin referencia explícita (reference-free), es decir, la identidad vocal queda embebida en los pesos del modelo.

El modelo cubre tres idiomas: inglés (en), telugu (te) y canarés (kn), con un sesgo de entrenamiento hacia el telugu (cinco pasadas sobre las 127 unidades de telugu frente a media pasada efectiva sobre 62 de las 124 unidades de canarés). El tamaño del repositorio es de 9,5 GB y el número de parámetros asciende a 2.290.004.544 (aproximadamente 2,29 mil millones), lo que lo sitúa en la gama media de modelos TTS neuronales.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de investigación reproducible (código en swamiji-tts, ruta research/exp-iterations/06-voxcpm2-swamiji-stages); por otro, ejemplifica el ajuste fino de un modelo TTS multilingüe de bajo recurso (telugu y canarés) con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, el modelo se publica explícitamente como material de investigación y no se han publicado benchmarks objetivos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia VoxCPM2; detalles de arquitectura no especificados en la model card) |
| Parametros totales | 2.290.004.544 (2,29 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8/FP8) |
| Idiomas soportados | inglés (en), telugu (te), canarés (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Modelo base | sw-voice/voxcpm2-stageA-te87h-noshloka-noen-kn-bhag-baselm5e-4-acc16-1ep |
| Tamano del repositorio | 9,5 GB |
| Fecha de publicacion | 2026-11-03 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, códec de audio o diseño del decodificador). Lo que sí se documenta es el proceso de ajuste fino: se partió del checkpoint stageA y se realizó un full fine-tune con el entrenador oficial de VoxCPM, sin congelar ningún parámetro ("nothing frozen"). El entrenamiento usó flow-matching con muestreo t = sigmoid(N(1.0, 1)), un esquema habitual en modelos generativos de difusión/flow para modelar la distribución del audio.

Los datos de entrenamiento consistieron en temas "Navaratri RE-USE": cinco pasadas completas sobre las 127 unidades de telugu y una pasada aleatoria sobre 62 de las 124 unidades de canarés (canarés ponderado a la mitad). Se realizó exactamente una época sobre el conjunto de pasadas, con micro-batch 1 y acumulación de gradiente 8 (batch efectivo 8), 119 pasos por época, learning rate 5e-5 con cosine decay y warmup de 18 pasos, salvo para los parámetros base_lm.* que usaron 3e-4. Se aplicó gradient clipping de 1.0. El modelo es reference-free: no requiere un audio de referencia en inferencia porque la voz está codificada en los pesos.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y canarés.
- Generación de voz sin referencia externa (reference-free), con identidad vocal embebida en los pesos.
- Ajuste específico sobre temática Navaratri, lo que puede reflejar un estilo prosódico o dominio concreto.
- Soporte multilingüe limitado a los tres idiomas indicados (en, te, kn).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje general).
- No se documentan capacidades de visión, audio de entrada ni modos de "thinking".
- No se documenta clonación de voz zero-shot ni control de emoción/estilo más allá de lo aprendido en el fine-tune.

## Casos de uso

- Síntesis de voz para aplicaciones en telugu: el modelo está entrenado con cinco pasadas sobre 127 unidades de telugu, por lo que es la lengua con mayor cobertura efectiva; adecuado para locuciones, audiolibros o interfaces de voz en ese idioma.
- Síntesis de voz en canarés con menor prioridad: al estar el canarés ponderado a la mitad (62 de 124 unidades), sirve para prototipos y pruebas, pero con menor garantía de cobertura y calidad uniforme.
- Generación de voz en inglés para demos y experimentos: el modelo incluye inglés en su etiquetado, aunque el foco del fine-tune es telugu/canarés; útil para validar el pipeline TTS antes de desplegar en lenguas de bajo recurso.
- Investigación en TTS multilingüe de bajo recurso: el checkpoint y el código (swamiji-tts, research/exp-iterations/06-voxcpm2-swamiji-stages) permiten reproducir el experimento y estudiar el efecto de la ponderación de datos entre lenguas.
- Evaluación de esquemas de flow-matching en TTS: el uso de t = sigmoid(N(1.0, 1)) y el full fine-tune sin congelar parámetros son puntos de partida para comparar variantes de entrenamiento.
- Integración en pipelines de generación de audio offline: al publicarse en safetensors con licencia Apache 2.0, puede incorporarse a servicios internos de síntesis de voz sin restricciones de licencia comercial, siempre que se valide la calidad en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, SIM, MCD, RTF) ni comparaciones cuantitativas con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 2,29 mil millones de parámetros en FP16 requiere aproximadamente 4,6 GB solo para los pesos, a lo que hay que sumar memoria para el códec de audio y buffers de inferencia; en FP32 serían unos 9,2 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs consumer de gama alta (RTX 3090, RTX 4090 con 24 GB) y en GPUs de datacenter (A100, H100) para mayor throughput, pero el autor no lo documenta.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 8-16 GB o más según la precisión y el códec asociado, pero no se confirma en la información disponible.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje, no a TTS). El autor referencia el código swamiji-tts para reproducir el entrenamiento e inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otras familias TTS (por ejemplo, XTTS, Bark, VITS o Fish Speech). Se indica "no disponible" para los campos de comparación cuantitativa (parámetros, contexto, benchmarks, latencia).

| Modelo | Parámetros | Idiomas | Licencia | Datos de benchmark |
|---|---|---|---|---|
| voxcpm2-stageB-te87h-noshloka-kn-bhag-baselm5e-4A-navaratri-knhalf | 2,29 mil millones | en, te, kn | Apache 2.0 | no disponible |
| Alternativas TTS comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo publicado explícitamente como material de investigación ("research"); no se garantiza su robustez en producción.
- Sesgo de datos: el telugu domina el entrenamiento (cinco pasadas completas) frente al canarés (media pasada efectiva sobre la mitad de las unidades), lo que puede producir calidad desigual entre idiomas.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas fuera de la distribución de entrenamiento.
- Cobertura limitada a tres idiomas (en, te, kn); no se documenta comportamiento en otras lenguas.
- No se documentan métricas de calidad, por lo que no es posible evaluar objetivamente su fidelidad o naturalidad sin pruebas propias.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y los datos de entrenamiento (temas Navaratri RE-USE) pueden tener condiciones propias que conviene verificar antes de un despliegue comercial.
- El nombre del repositorio incluye términos específicos del experimento (te87h, noshloka, bhag, navaratri, knhalf) que reflejan configuraciones concretas de datos y ponderación; no debe interpretarse como un modelo TTS generalista.
- No se documentan limitaciones de contexto porque no aplica a un modelo TTS en el sentido habitual de ventana de tokens de un LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stageB-te87h-noshloka-kn-bhag-baselm5e-4A-navaratri-knhalf
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-stageA-te87h-noshloka-noen-kn-bhag-baselm5e-4-acc16-1ep
- Código del proyecto (referenciado en la model card): swamiji-tts, ruta research/exp-iterations/06-voxcpm2-swamiji-stages (no se proporciona URL directa en la información disponible)
