# tbtlr/shieldgemma-4-e2b-trimodal

## Resumen

ShieldGemma 4 E2B trimodal es un clasificador de seguridad independiente desarrollado por el usuario de Hugging Face `tbtlr`, obtenido mediante fine-tuning con LoRA de `google/gemma-4-E2B-it`. No es un lanzamiento de Google ni está afiliado al equipo original de ShieldGemma; el nombre "Gemma" se emplea únicamente para describir el modelo base. Su función es determinar, dado un prompt de usuario, un par prompt/respuesta, una imagen o un clip de audio con una petición hablada, si el contenido viola una política de seguridad concreta. La salida es la probabilidad del token `Yes` frente a `No` en la primera posición generada, lo que lo convierte en un guardrail ligero y desplegable en pipelines de moderación.

El modelo cubre tres modalidades: texto (con las políticas de ShieldGemma v1: contenido peligroso, acoso, discurso de odio, contenido sexualmente explícito, violencia y obscenidad, más una política compuesta "any harm"), imagen (políticas de ShieldGemma 2: sexualmente explícito, violencia/gore y contenido peligroso) y audio (las políticas de texto aplicadas a una petición hablada). Es un clasificador condicionado por política: sigue también textos de política no vistos durante el entrenamiento, como las ocho definiciones de OpenAI Moderation.

Con 5.104.297.539 parámetros totales según safetensors, un repositorio de 30,7 GB y licencia Apache 2.0, resulta relevante ahora como alternativa open source a los clasificadores de seguridad propietarios, con soporte multimodal poco habitual en modelos de este tamaño y una receta de destilación texto→audio que mejora la detección sobre peticiones habladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con torres de visión y audio congeladas y adaptadores LoRA fusionados en las proyecciones de atención y MLP del modelo de lenguaje |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF ni otras) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; clase `Gemma4ForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal con torre de visión y torre de audio, y añade adaptadores LoRA de rango r=16 sobre las proyecciones de atención y MLP del modelo de lenguaje. Las torres de visión y audio permanecen congeladas; una ablación con adaptadores adicionales en la torre de audio no produjo cambios, según el autor. El entrenamiento fue continuo y por etapas sobre una DGX Spark: primero texto (lr 1e-4), después imágenes con replay de texto (lr 5e-5) y finalmente audio con replay de texto e imagen (lr 3e-5). Se usó entropía cruzada sobre el token de respuesta, bf16 y una época por etapa.

Los datos de texto provienen de Aegis 2.0, BeaverTails, ToxicChat (parte benigna) y WildGuardMix; los de imagen de VLGuard, LlavaGuard (imágenes de SMID), UnsafeBench y COCO val2017 como negativos benignos; los de audio de 8.300 prompts etiquetados renderizados con Piper TTS (en_US-libritts_r-medium, 904 hablantes; 12.100 prompts, dos hablantes cada uno, el segundo con velocidad y prosodia aleatorizadas) más LibriSpeech como voz benigna. Las categorías de origen se mapean a las políticas de ShieldGemma como positivas, ambiguas (descartadas) o negativas. La etapa de audio destila el shield de texto: el objetivo para el token `Yes` es 0,5 × etiqueta dura + 0,5 × probabilidad del shield de texto sobre la transcripción del clip, lo que aporta +0,045 de F1 frente a etiquetas duras.

## Capacidades

- Clasificación de seguridad de texto condicionada por política: evalúa prompts, pares prompt/respuesta y aplica políticas de contenido peligroso, acoso, odio, contenido sexual, violencia, obscenidad y una política compuesta.
- Clasificación de seguridad de imágenes con políticas específicas: sexualmente explícito, violencia/gore y contenido peligroso, más compuesta.
- Clasificación de peticiones habladas: aplica las políticas de texto a un clip de audio de 16 kHz mono que sustituye al texto de la petición.
- Generalización a políticas no vistas: sigue definiciones de política nuevas, probado con las ocho definiciones de OpenAI Moderation.
- Salida calibrada como probabilidad: `softmax` sobre los logits de `Yes` y `No` en la primera posición generada, apta para umbrales ajustables.
- Soporte conversacional y de procesamiento multimodal mediante `AutoProcessor` y `Gemma4ForConditionalGeneration`.
- No documenta tool calling, function calling ni capacidades de agente; su uso previsto es la clasificación, no la generación abierta.

## Casos de uso

- Moderación de entrada en asistentes conversacionales: antes de enviar un prompt al modelo generativo, se ejecuta una pasada forward con la política compuesta y se bloquea la petición si la probabilidad de violación supera el umbral; su coste de una sola pasada con `logits_to_keep=1` lo hace viable en línea.
- Moderación de salida en producción: se evalúa el par prompt/respuesta generado con las políticas de texto y se descarta o reescribe la respuesta; los resultados en ToxicChat (F1 0,760) y Aegis 2.0 test (0,816) sirven de referencia para calibrar umbrales.
- Filtrado de imágenes subidas por usuarios: con las políticas de imagen se detecta contenido sexual, violencia/gore o peligroso antes de almacenar o mostrar el archivo; los resultados en UnsafeBench (sexual 0,842 de F1) y VLGuard (compuesta 0,751) orientan el punto de corte.
- Moderación de asistentes de voz: para peticiones habladas se pasa el clip de 16 kHz mono junto con la política y se obtiene la probabilidad de violación; los resultados en spoken ToxicChat (0,852) y JALMBench (0,930) respaldan su uso en altavoces inteligentes y líneas de atención telefónica.
- Cumplimiento de políticas personalizadas: al ser condicionado por política, se puede introducir el texto de una política propia (por ejemplo, normas internas de una comunidad) sin reentrenar y usar la probabilidad como señal de revisión humana.
- Etiquetado y auditoría de datasets: aplicar el clasificador sobre corpus de texto, imagen o audio para prefiltrar contenido dañino antes de la anotación manual, con las métricas AU-PRC publicadas (0,824 en ToxicChat, 0,891 en Aegis 2.0) como guía de precisión esperada.

## Benchmarks y rendimiento

Resultados publicados por el autor (F1 óptimo / AU-PRC, política compuesta salvo indicación):

| Conjunto | Modalidad | F1 óptimo | AU-PRC |
|---|---|---|---|
| ToxicChat | texto | 0,760 | 0,824 |
| Aegis 2.0 test | texto | 0,816 | 0,891 |
| BeaverTails | texto | 0,840 | 0,916 |
| WildGuardTest | texto | 0,790 | 0,871 |
| XSTest | texto | 0,883 | 0,956 |
| OpenAI Moderation | texto | 0,764 | 0,842 |
| UnsafeBench test, sexual | imagen | 0,842 | 0,910 |
| UnsafeBench test, dangerous | imagen | 0,689 | 0,718 |
| UnsafeBench test, violence | imagen | 0,652 | 0,698 |
| UnsafeBench test, compuesta | imagen | 0,704 | 0,778 |
| LlavaGuard test, compuesta | imagen | 0,683 | 0,676 |
| VLGuard test, compuesta | imagen | 0,751 | 0,801 |
| Spoken ToxicChat (595 clips TTS, 904 voces) | audio | 0,852 | 0,927 |
| JALMBench (habla dañina vs LibriSpeech) | audio | 0,930 | 0,974 |

Referencia del autor: ShieldGemma 2B paper obtiene 0,704 / 0,778 en ToxicChat, frente a 0,760 / 0,824 de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 10-11 GB solo para pesos (5,1 mil millones de parámetros), más overhead de activaciones y del procesador multimodal; el autor ejecutó el entrenamiento en una DGX Spark.
- GPU recomendadas: A100, H100 o L40S para servicio de alta concurrencia; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090 y previsiblemente en GPUs de 16 GB si se aplica cuantización, aunque el autor no publica pesos cuantizados ni cifras de VRAM medidas.
- Opciones de despliegue: transformers con `Gemma4ForConditionalGeneration` y `AutoProcessor`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles; el diseño de una sola pasada forward con `logits_to_keep=1` sugiere latencia baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShieldGemma 4 E2B trimodal (este) | 5,10 mil millones | no disponible | texto, imagen, audio | Apache 2.0 | Hugging Face |
| ShieldGemma 2B (referencia del autor) | 2 mil millones (no confirmado en la información) | no disponible | texto | no disponible en la información | no disponible en la información |
| Llama Guard (familia) | no disponible en la información | no disponible | texto | no disponible en la información | no disponible en la información |
| WildGuard | no disponible en la información | no disponible | texto | no disponible en la información | no disponible en la información |

La única comparación numérica aportada por el autor es frente a ShieldGemma 2B en ToxicChat (0,760 / 0,824 frente a 0,704 / 0,778). Para el resto de alternativas no hay datos en la información disponible.

## Limitaciones y advertencias

- Las puntuaciones binarias "cualquier contenido inseguro" dependen de la distancia entre la taxonomía del benchmark y estas políticas; odio, política, privacidad, fraude y desinformación en imagen y texto quedan fuera del alcance.
- La política de contenido peligroso en imagen se entrenó con una lectura más amplia, según el autor, lo que puede generar falsos positivos o un comportamiento distinto al esperado.
- Solo soporta inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración: la probabilidad `Yes`/`No` debe umbralizarse por caso de uso y validarse con datos propios.
- Dos conjuntos de texto de entrenamiento (BeaverTails y ToxicChat) son CC BY-NC 4.0; el autor advierte que la extensión de esa restricción a los pesos es jurídicamente discutida y recomienda a los usuarios comerciales evaluarlo por su cuenta.
- UnsafeBench está sujeto a un acuerdo de uso de datos con restricciones (investigación, educación y uso comercial responsable).
- JALMBench, usado en evaluación de audio, no declara licencia.
- No es un lanzamiento de Google ni está afiliado al equipo de ShieldGemma; debe citarse como fine-tune independiente.
- No se documentan cuantizaciones, contexto máximo ni métricas de latencia, lo que dificulta planificar despliegues en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tbtlr/shieldgemma-4-e2b-trimodal
- Adaptador LoRA sin fusionar: `tbtlr/shieldgemma-4-e2b-trimodal-lora` (referenciado en la model card; URL no proporcionada)
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio del proyecto con scorers y suite de evaluación (`shield/prompt.py`, `shield/score*.py`): no disponible
- Paper de ShieldGemma: no disponible en la información
- Blog o demo: no disponible en la información
