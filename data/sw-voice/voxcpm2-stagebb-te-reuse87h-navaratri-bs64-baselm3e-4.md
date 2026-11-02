# sw-voice/voxcpm2-stageBB-te-reuse87h-navaratri-bs64-baselm3e-4

## Resumen

voxcpm2-stageBB-te-reuse87h-navaratri-bs64-baselm3e-4 es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, resultado de un ajuste fino completo (full fine-tune) del modelo sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep. Forma parte de la familia VoxCPM2 y está entrenado con el entrenador oficial de VoxCPM. El modelo está orientado a la investigación y su propósito es generar voz sintética en inglés, telugu y canarés a partir de datos de audio de temática devocional (swamiji-navaratri).

El modelo cuenta con aproximadamente 2.290 millones de parámetros en formato safetensors, con un tamaño de repositorio de 9,5 GB. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, aunque su naturaleza de investigación y la ausencia de benchmarks publicados recomiendan cautela antes de llevarlo a producción. No se dispone de información sobre la longitud de contexto, los tipos de cuantización ni la composición exacta del dataset más allá de lo indicado en la model card.

La relevancia de este modelo radica en su enfoque en la clonación de voz sin referencia (reference-free), donde la identidad vocal reside en los pesos del modelo en lugar de depender de un audio de referencia en tiempo de inferencia. Esto lo hace interesante para escenarios de TTS multilingüe con voces predefinidas, aunque su estado de investigación y la falta de métricas objetivas limitan su adopción inmediata en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (familia VoxCPM2, presumiblemente basada en flow-matching para TTS) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), telugu (te), canares (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero el modelo pertenece a la familia VoxCPM2 y se entrena con el entrenador oficial de VoxCPM, que emplea flow-matching con un muestreo de t = sigmoid(N(1.0, 1)). Se trata de un full fine-tune del modelo base sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep, sin capas congeladas: todos los parámetros fueron entrenados. El entrenamiento se realizó durante 5 épocas con un micro-batch de 1 y acumulación de gradiente de 64, lo que resultó en 20 pasos de actualización. Se usó una tasa de aprendizaje de 5e-5 con cosine scheduling y warmup de 3 pasos, mientras que los parámetros bajo el prefijo base_lm.* se entrenaron con una tasa de 3e-4. El recorte de gradiente fue de 1.0.

Los datos de entrenamiento provienen de los conjuntos sw-voice/swamiji-navaratri-telugu-reuse-themes y sw-voice/swamiji-navaratri-kannada-reuse-themes, que contienen 127 y 124 unidades temáticas completas respectivamente, con estrategia de reutilización (RE-USE). El modelo es reference-free: la identidad de la voz está codificada en los pesos, por lo que no requiere un audio de referencia en inferencia. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de estas unidades temáticas.

## Capacidades

- Generación de voz (text-to-speech) en inglés, telugu y canarés.
- Clonación de voz sin referencia: la voz objetivo está embebida en los pesos del modelo, sin necesidad de proporcionar un audio de referencia en el momento de la inferencia.
- Síntesis de audio a partir de texto en los tres idiomas indicados.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos especiales como thinking mode, visión o audio de entrada.
- No se dispone de información sobre capacidades multilingües más allá de los tres idiomas listados.

## Casos de uso

- Síntesis de voz para contenido devocional en telugu y canarés: el modelo está entrenado específicamente con datos de temática swamiji-navaratri, por lo que es adecuado para generar narraciones o recitaciones en esos idiomas con una voz consistente embebida en los pesos.
- Generación de audiolibros y narraciones multilingües: al soportar inglés, telugu y canarés, puede emplearse para producir versiones de audio de textos en estos idiomas sin necesidad de un estudio de grabación.
- Prototipado de asistentes de voz en investigación: su licencia Apache 2.0 y su naturaleza reference-free facilitan experimentar con voces fijas en pipelines de TTS para pruebas de concepto.
- Localización de contenido audiovisual: puede doblar o generar pistas de voz en telugu y canarés para materiales educativos o divulgativos, manteniendo una identidad vocal uniforme.
- Investigación en clonación de voz sin referencia: sirve como punto de partida para estudiar cómo se codifica la identidad vocal en los pesos de un modelo TTS y para comparar con enfoques que requieren audio de referencia.
- Generación de voces para aplicaciones de accesibilidad: puede producir audio en inglés y en idiomas del sur de la India para lectores de pantalla o interfaces habladas, aunque la falta de benchmarks y de validación en producción exige pruebas exhaustivas previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2.290 millones de parámetros en precisión completa (fp32), el modelo requeriría aproximadamente 9,2 GB solo para los pesos; en fp16 serían unos 4,6 GB, y en int8 unos 2,3 GB. Estas cifras son estimaciones basadas en el número de parámetros y no en mediciones del autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPUs de consumo como RTX 3090 o RTX 4090 en fp16, y en GPUs profesionales como A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: probablemente sí en fp16 en GPUs con 8 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: no se especifican en la información proporcionada. Al ser un modelo de TTS con pesos safetensors, requeriría un runtime compatible con la familia VoxCPM2; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia o categoría en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo de investigación: la model card lo etiqueta explícitamente como "(research)", por lo que no está validado para producción.
- Ausencia de benchmarks: no hay métricas objetivas de calidad de síntesis (MOS, similitud de voz, inteligibilidad) que permitan evaluar su rendimiento frente a alternativas.
- Sesgos potenciales: al entrenarse con datos devocionales de temática swamiji-navaratri en telugu y canarés, la voz y el estilo pueden estar sesgados hacia ese dominio y no generalizar bien a otros registros.
- Riesgo de alucinación o artefactos: no se documentan salvaguardas contra artefactos acústicos, pronunciación incorrecta o degradación en textos fuera del dominio de entrenamiento.
- Limitaciones de idioma: solo se declaran inglés, telugu y canarés; no hay información sobre calidad en cada uno ni sobre mezcla de idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de validación y de documentación sobre el dataset subyacente (posibles derechos sobre las grabaciones originales) introduce incertidumbre legal.
- Entrenamiento muy corto: 20 pasos de actualización en 5 épocas con micro-batch 1 y acumulación 64 es un régimen muy limitado, lo que puede implicar un ajuste superficial y riesgo de sobreajuste a las 251 unidades temáticas.
- Sin información sobre contexto, cuantización ni despliegue: dificulta la planificación de integración en sistemas existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stageBB-te-reuse87h-navaratri-bs64-baselm3e-4
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep
- Código (referenciado en la model card): swamiji-tts `research/exp-iterations/06-voxcpm2-swamiji-stages` (no se proporciona URL directa)
