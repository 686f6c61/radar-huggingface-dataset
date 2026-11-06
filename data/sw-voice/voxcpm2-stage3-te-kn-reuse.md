# sw-voice/voxcpm2-stage3-te-kn-reuse

## Resumen

VoxCPM2-stage3-te-kn-reuse es un modelo de texto a voz (TTS) desarrollado por sw-voice como parte de un proyecto de investigación sobre síntesis de voz en lenguas índicas. Se trata de un ajuste fino completo (full fine-tune) de un modelo previo del mismo autor, sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep, entrenado con el entrenador oficial de VoxCPM. Su propósito es generar voz natural en telugu (te) y canarés (kn), además de inglés (en), con una particularidad destacable: es un modelo "reference-free", es decir, la voz está encapsulada en los propios pesos y no requiere un audio de referencia del hablante para la síntesis.

El entrenamiento de esta tercera etapa se realizó sobre datasets temáticos específicos: swamiji-navaratri-telugu-reuse-themes y swamiji-navaratri-kannada-reuse-themes, con 127 y 124 unidades temáticas completas respectivamente. El modelo utiliza una técnica de flow-matching con muestreo del paso temporal t mediante sigmoid(N(-0.4, 1)), lo que sugiere una arquitectura de difusión por flujo continuo para la generación de audio.

Con 2.290 millones de parámetros y licencia Apache 2.0, es relevante para desarrolladores que necesiten TTS de calidad en lenguas dravídicas como telugu y canarés, idiomas con escaso soporte en los modelos TTS comerciales y open source dominantes. El repositorio pesa 9,5 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (flow-matching, TTS) |
| Parametros totales | 2.290.004.544 (~2,29 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en el repo) |
| Idiomas soportados | ingles (en), telugu (te), canarés (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la familia VoxCPM2, una arquitectura de síntesis de voz basada en flow-matching (flujo de probabilidad continuo), una alternativa a la difusión estocástica clásica que permite generar audio mediante trayectorias deterministas entre ruido y señal. En el entrenamiento de esta etapa se utilizó un muestreo del paso temporal t con distribución sigmoid(N(-0.4, 1)), una técnica de curriculo de ruido que sesga los pasos hacia valores bajos y suele mejorar la fidelidad del audio generado.

El entrenamiento consistió en un ajuste fino completo: ningún parámetro se congeló ("nothing frozen"), lo que permite al modelo absorber plenamente las características prosódicas y fonéticas de los datos nuevos. Los datos proceden de dos datasets del propio autor con unidades temáticas completas (127 en telugu y 124 en canarés, esquema "RE-USE"), aparentemente discursos o grabaciones del proyecto "swamiji". La configuración de entrenamiento fue: micro-batch de 1 con acumulación de gradiente de 8, 5 épocas equivalentes a 160 pasos, tasa de aprendizaje 0,0001 con planificación coseno, warmup de 24 pasos y recorte de gradiente a 1,0. El código de entrenamiento se encuentra en el repositorio swamiji-tts, ruta research/exp-iterations/06-voxcpm2-swamiji-stages.

## Capacidades

- Sintesis de texto a voz en telugu y canarés, dos lenguas dravídicas con escaso soporte TTS en el ecosistema open source.
- Sintesis de voz en inglés, heredada del modelo base multietapa.
- Sintesis "reference-free": no requiere audio de referencia del hablante (voice cloning por prompt), ya que la voz objetivo está incorporada en los pesos tras el ajuste fino.
- Generación de audio mediante flow-matching, con muestreo optimizado del paso temporal.
- No hay evidencia en la model card de soporte para otras capacidades (transcripción, traducción, tool calling, etc.), al tratarse de un modelo especializado en TTS.

## Casos de uso

- Sintetización de contenido devocional en telugu y canarés: el modelo está afinado con datos temáticos del proyecto "swamiji" (navaratri), por lo que es adecuado para generar audios de discursos, cánticos o narraciones religiosas en esos idiomas.
- Lectura de texto accesible en lenguas dravídicas: puede integrarse en aplicaciones de accesibilidad (lectores de pantalla, navegación web hablada) para usuarios de telugu y canarés, idiomas mal cubiertos por otros TTS.
- Producción de audiolibros y podcasts regionales: al no requerir audio de referencia, la generación es directa a partir de texto, lo que simplifica pipelines de producción de contenido hablado.
- Asistentes de voz y IVR en India meridional: la voz fija en pesos garantiza consistencia de identidad de hablante en despliegues telefónicos o de atención automatizada.
- Prototipado e investigación en TTS multilingüe índico: al publicarse con detalles de entrenamiento y código (swamiji-tts), sirve como referencia reproducible para experimentos de ajuste fino por etapas con flow-matching.
- Generación de contenido educativo en telugu y canarés: narración de cursos, tutoriales o material didáctico con una voz estable y consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (WER, MOS, SIM, etc.) ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~2,29 B de parámetros en precisión original (probablemente FP32 o BF16), el repo de 9,5 GB sugiere pesos en FP32 (~9,2 GB); en BF16 ocuparía ~4,6 GB, más overhead de la generación de audio.
- GPU recomendadas: no disponible. Por tamaño, una GPU de gama consumer con 12-16 GB de VRAM (RTX 3060/4070 Ti Super/4090) debería ser suficiente para inferencia en precisión reducida; para entrenamiento o fine-tuning se recomendarían GPUs tipo A100 o H100.
- Consumer GPU: plausible en GPUs con 12 GB o más de VRAM, aunque el autor no publica requisitos explícitos.
- Despliegue: no disponible de forma explícita; el entrenamiento usó el entrenador oficial de VoxCPM, por lo que el ecosistema de código de VoxCPM (repositorio swamiji-tts y el trainer oficial) es la vía documentada. No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI, que no están orientados a TTS de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa orientativa con modelos TTS open source multilingües o índicos de tamaño similar. Los datos del modelo analizado provienen de su model card; los de las alternativas son de conocimiento general y pueden variar según la versión:

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| voxcpm2-stage3-te-kn-reuse | ~2,29 B | en, te, kn | Apache 2.0 | Afinado específico en telugu y canarés, reference-free |
| XTTS-v2 (Coqui) | ~0,75 B | 17 idiomas (sin telugu ni canarés nativos) | Licencia Coqui (no Apache) | Clonación de voz con audio de referencia |
| MeloTTS | ~0,1-0,3 B | varios, incluido hindi | MIT | Ligero, CPU-friendly, sin soporte dravídico profundo |

La principal diferenciación de este modelo es su cobertura específica de telugu y canarés, idiomas ausentes en la mayoría de TTS open source generalistas, y su naturaleza reference-free. La contrapartida es que su voz está limitada a la del dataset de entrenamiento, sin capacidad de clonación arbitraria documentada.

## Limitaciones y advertencias

- Es un modelo de investigación ("research" en el título y en la ruta de código): no hay garantías de estabilidad ni soporte para producción, y acumula 0 descargas en el momento de la ficha.
- La voz está fijada en los pesos: no se puede elegir hablantes arbitrarios ni clonar voces nuevas salvo que se realice un nuevo ajuste fino.
- El entrenamiento se basa en 160 pasos con datasets temáticos muy específicos (127 y 124 unidades): la generalización a dominios de texto distintos (noticias, diálogo coloquial, términos técnicos) es incierta y puede degradar la prosodia o introducir errores de pronunciación.
- Riesgo de alucinación o artefactos de audio: no hay métricas publicadas (WER, MOS) que permitan evaluar la calidad de forma objetiva; se recomienda evaluación propia antes de cualquier uso.
- Cobertura lingüística limitada a tres idiomas; no hay información sobre soporte de mezcla de idiomas en una misma frase (code-switching), habitual en el habla real índica.
- Sesgos: el modelo hereda las características del hablante y estilo del dataset de entrenamiento (contenido devocional temático), lo que puede condicionar el estilo de la salida a otros textos.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero deben revisarse los términos de los datasets de entrenamiento, que no se describen en detalle en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/voxcpm2-stage3-te-kn-reuse
- Modelo base (etapa 2): https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card; enlace directo no disponible)
- Dataset canarés: sw-voice/swamiji-navaratri-kannada-reuse-themes (referenciado en la model card; enlace directo no disponible)
- Código de entrenamiento: repositorio swamiji-tts, ruta research/exp-iterations/06-voxcpm2-swamiji-stages (enlace externo no disponible en la model card)
