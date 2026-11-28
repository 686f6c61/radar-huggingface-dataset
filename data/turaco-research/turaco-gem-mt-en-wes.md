# turaco-research/Turaco-gem-mt-en-wes

## Resumen

Turaco-gem-mt-en-wes es un modelo especializado en traduccion automatica de ingles (en) a pidgin ingles de Camerun (wes), desarrollado por Turaco Research. Se construye mediante un ajuste fino con LoRA en BF16 sobre google/translategemma-4b-it, el modelo de traduccion multimodal de Google basado en la familia Gemma 3. El resultado es un checkpoint de aproximadamente 4.300 millones de parametros (unos 5B si se incluyen los componentes de vision) orientado a un par de idiomas de bajos recursos dentro del ecosistema de lenguas africanas subrepresentadas.

La relevancia del modelo reside en su enfoque: en lugar de entrenar desde cero, aprovecha las capacidades multilingues de TranslateGemma y anade el codigo de idioma `wes` al mapeo nativo de la plantilla de chat, que originalmente no lo contemplaba. El ajuste se realiza sobre un corpus ya depurado de 25.158 ejemplos de entrenamiento, con 1.335 de validacion y 1.354 de test, y emplea perdida unicamente sobre la respuesta (response-only loss) para concentrar el aprendizaje en la traduccion generada.

El autor lo presenta como su mejor modelo Turaco hasta la fecha, aunque advierte explicitamente de que las metricas publicadas son un diagnostico interno sobre el mismo corpus de origen y no un benchmark externo. La evaluacion externa TuracoBench v1 y la revision por hablantes nativos estan pendientes, por lo que el modelo no se declara estado del arte. La licencia es Gemma Terms of Use, con uso comercial permitido bajo esas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 3 (TranslateGemma 4B), ajuste fino con LoRA |
| Parametros totales | 4.300.079.472 (unos 5B incluyendo componentes de vision) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 768 tokens configurados; secuencia maxima de entrenamiento de 512 tokens |
| Tipos de cuantizacion | BF16 nativo; soporte de carga en 4 bits mediante Unsloth para GPUs solo float16 (T4 y similares); pesos GGUF disponibles en el repositorio |
| Idiomas soportados | Ingles (en) como origen y pidgin ingles de Camerun (wes) como destino |
| Licencia | Gemma Terms of Use (derivado modificado de Gemma) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de TranslateGemma 4B, un transformer multimodal de la familia Gemma 3 con capacidades de entrada imagen-texto. Sobre esa base se aplica un ajuste fino supervisado con LoRA de rango 32 y alpha 32 en precision BF16, manteniendo congeladas las capas de vision. El entrenamiento se ejecuto en una NVIDIA A100-SXM4 de 40 GB durante 2 epocas, con tasa de aprendizaje 0.0001, tamano de micro-lote 8, acumulacion de gradientes 4 (lote efectivo de 32), optimizador adamw_torch_fused, planificador coseno y semilla determinista 42. La perdida se calcula unicamente sobre la respuesta generada.

Los datos provienen del dataset turaco-research/Turaco-NLLB-mt-en-wes-cleaned-dataset en su revision b95e28f, sin volver a ejecutar el pipeline de limpieza original. La innovacion tecnica principal es la integracion del codigo `wes` en la plantilla de chat de TranslateGemma: el repositorio incluye un chat_template.jinja parcheado que anade `wes: Cameroon Pidgin` al mapeo de codigos a nombres legibles, preservando el prompt de traduccion original de Google. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de texto de ingles a pidgin ingles de Camerun, con preservacion declarada de significado, tono y expresion natural.
- Generacion de texto conversacional mediante la plantilla de chat de TranslateGemma, con codigos de idioma de origen y destino explicitos.
- Capacidad multimodal heredada de la base (entrada imagen-texto), aunque las capas de vision estan congeladas y no se entrenaron ni evaluaron para traduccion de imagenes a pidgin.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues limitadas al par en-wes; el resto de idiomas de TranslateGemma no se evaluaron en este checkpoint.
- Modo thinking, audio u otras capacidades especiales: no documentado en la informacion disponible.

## Casos de uso

- Borradores de traduccion revisados: el modelo genera primeras versiones de textos en ingles traducidos a pidgin de Camerun que un hablante nativo revisa despues; encaja por su ajuste especifico al par en-wes y su contexto de 768 tokens, suficiente para parrafos y dialogos cortos.
- Investigacion en traduccion automatica de bajos recursos: sirve como punto de partida reproducible para experimentos sobre lenguas africanas subrepresentadas, dado que el dataset, la configuracion de entrenamiento y las metricas internas estan documentados.
- Prototipado de localizacion: permite generar versiones preliminares de interfaces, mensajes de aplicacion o contenido web para audiencias de Camerun, con revision humana posterior obligatoria.
- Aplicaciones comerciales responsables: el uso comercial esta permitido bajo los terminos de Gemma, de modo que empresas que cumplan esas condiciones y las del dataset pueden integrarlo en flujos de localizacion con supervision humana.
- Evaluacion comparativa de estrategias de ajuste: al ser un LoRA de rango 32 sobre una base de 4B, resulta util para estudiar el rendimiento de adaptaciones parametro-eficientes en pares de idiomas de bajos recursos.
- Generacion de material de referencia para anotacion: el modelo puede producir traducciones candidatas que alimenten procesos de anotacion y revision por hablantes, aunque sus salidas no deben tratarse como referencia definitiva.
- Traduccion de conversaciones cortas: con contexto de 768 tokens, puede gestionar turnos breves de chat o atencion al cliente en entornos controlados, siempre con revision humana y sin uso en decisiones de alto riesgo.

## Benchmarks y rendimiento

Evaluacion interna sobre el conjunto de test retenido del mismo corpus (1.354 ejemplos), segun el autor:

| Metrica | Valor |
|---|---|
| chrF++ | 43,09 |
| SacreBLEU | 25,54 |
| TER | 71,18 |
| Copia del origen (source copy) | 0,00 % |
| Salida vacia (empty output) | 2,66 % |
| Razon de longitud (length ratio) | 0,977 |

Estos resultados son un diagnostico interno sobre el mismo corpus de origen y no un benchmark externo de publicacion. Las evaluaciones TuracoBench v1 y la revision por hablantes estan pendientes. No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,6 GB solo para pesos (4.300 millones de parametros), mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contextos cortos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3 a 4 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: NVIDIA A100-SXM4-40GB (la usada en el entrenamiento); H100 para mayor throughput; RTX 4090 (24 GB) suficiente para BF16.
- GPUs de consumo: cabe en RTX 3090 y RTX 4090 en BF16; en GPUs solo float16 como la T4 se recomienda la carga en 4 bits con Unsloth.
- Opciones de despliegue: transformers (AutoModelForImageTextToText), text-generation-inference (etiqueta endpoints_compatible), llama.cpp u Ollama mediante los pesos GGUF del repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turaco-gem-mt-en-wes | 4.300 millones | 768 tokens | Traduccion en-wes con LoRA sobre TranslateGemma 4B | Gemma Terms of Use | Hugging Face, safetensors y GGUF |
| google/translategemma-4b-it | unos 5B con vision | no disponible | Traduccion multimodal multilingue de Google | Gemma Terms of Use | Hugging Face |
| NLLB (familia de referencia del dataset) | no disponible | no disponible | Traduccion multilingue de Meta | no disponible | no disponible |

La comparacion se limita a la base declarada y a la familia NLLB citada en el nombre del dataset; no se dispone de datos de rendimiento de alternativas en el par en-wes para una comparacion cuantitativa.

## Limitaciones y advertencias

- El corpus de entrenamiento es estrecho, ruidoso y sesgado por dominio, lo que puede limitar la generalizacion a textos fuera de esas areas.
- El pidgin de Camerun presenta variacion regional, dialectal y ortografica valida; el modelo puede no cubrir todas las variantes.
- Riesgo de copiar el texto en ingles, omitir contenido, anadir contenido no respaldado o reutilizar en exceso expresiones frecuentes del dominio de entrenamiento.
- La tasa de salida vacia en la evaluacion interna es del 2,66 %, lo que exige validacion de la salida en produccion.
- El codigo `wes` no estaba en el mapeo original de la plantilla de chat de TranslateGemma; la integracion depende del chat_template.jinja parcheado incluido en el repositorio.
- La traduccion de imagenes a pidgin no fue entrenada ni evaluada; las capas de vision estan congeladas.
- Las metricas internas provienen del mismo corpus de origen y pueden sobreestimar la calidad real.
- No debe usarse como traductor unico en decisiones medicas, legales, de emergencia, migracion, financieras u otras de alto riesgo.
- Licencia Gemma Terms of Use: el uso comercial esta permitido sujeto a esas condiciones y a la politica de usos prohibidos de Gemma; no es una licencia Apache ni MIT. Se aplican ademas los terminos del dataset por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turaco-research/Turaco-gem-mt-en-wes
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/turaco-research/Turaco-NLLB-mt-en-wes-cleaned-dataset
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Articulo de referencia (arXiv 2601.09012, citado en las etiquetas): https://arxiv.org/abs/2601.09012
