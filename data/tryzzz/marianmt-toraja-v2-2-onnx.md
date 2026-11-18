# TryZZZ/MarianMT-Toraja-v2.2-ONNX

## Resumen

MarianMT-Toraja-v2.2-ONNX es un modelo de traducción automática neuronal bidireccional entre indonesio (`id`) y toraja (`trj`), una lengua austronesia de la isla de Célebes con recursos digitales muy limitados. Lo desarrolla la Comunidad para la Preservación de la Lengua y Cultura Toraja (usuario `TryZZZ` / liuccio) y parte del modelo preentrenado `Helsinki-NLP/opus-mt-id-en`, sobre el que se ha realizado un ajuste fino supervisado. El modelo resuelve el problema de la ausencia de sistemas de traducción viables para una lengua de bajos recursos, ofreciendo inferencia ligera directamente en el navegador.

Técnicamente es un transformer encoder-decoder de tipo MarianMT con 6 capas en el codificador y 6 en el decodificador, dimensión de modelo 512 y 8 cabezas de atención, con aproximadamente 74 millones de parámetros. Emplea un vocabulario Unigram unificado de 54.796 tokens y se distribuye en formato ONNX cuantizado a QUInt8, con un tamaño total de repositorio de unos 0,1 GB. La licencia es Apache-2.0.

Su relevancia actual radica en dos factores: por un lado, aborda una lengua de bajos recursos con un corpus libre de fugas de datos (la Biblia en toraja v2.1, con particiones train/val/test estrictas y sin solapamiento de capítulos); por otro, su exportación a ONNX cuantizado permite ejecución en el navegador mediante `@xenova/transformers@2.17.2` sin backend, lo que lo hace desplegable en entornos web y dispositivos sin GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMTModel), 6 capas encoder / 6 capas decoder, d_model=512, 8 cabezas |
| Parámetros totales | ~74 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QUInt8 (ONNX cuantizado) |
| Idiomas soportados | indonesio (`id`), toraja (`trj`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |
| Tokenizador | Unigram, vocabulario de 54.796 tokens; `pad_token_id=54795`, `eos_token_id=0`, `decoder_start_token_id=54795` |
| Modelo base | Helsinki-NLP/opus-mt-id-en |
| Tamaño del repositorio | 0,1 GB |
| Librería | transformers.js |

## Arquitectura y entrenamiento

El modelo es un MarianMT estándar, es decir, un transformer encoder-decoder con atención multi-cabeza completa (no se emplean mecanismos de atención lineal ni arquitecturas híbridas SSM). El codificador y el decodificador constan de 6 capas cada uno, con dimensión de modelo 512 y 8 cabezas de atención. Se inicializa desde `Helsinki-NLP/opus-mt-id-en` y se ajusta de forma supervisada para la traducción bidireccional indonesio-toraja, usando prefijos de tarea en la entrada: `ke Toraja: ` para la dirección ID→TRJ y `ke Indonesia: ` para TRJ→ID.

El entrenamiento se realizó exclusivamente sobre el corpus `lioneiltrystan/toraja-bible-v2-1`, con 53.920 muestras de entrenamiento, 3.296 de validación, 4.092 de test y 92 muestras fuera de distribución (OOD) correspondientes a las epístolas de Filemón y Obaja. El corpus está libre de fugas de capítulos y de errores de codificación (mojibake). Los hiperparámetros fueron 6 épocas, batch efectivo de 64, tasa de aprendizaje 0,0003 con decaimiento coseno, warmup_ratio de 0,06 y label smoothing de 0,1, alcanzando un `eval_loss` mínimo de 2,5411 en 40,18 minutos sobre una Tesla T4. No se documenta uso de RLHF ni DPO.

Una innovación técnica destacable es la normalización explícita de glotales y comillas: el vocabulario preentrenado contiene el apóstrofo ASCII (`'`, U+0027) pero no la comilla tipográfica derecha (`’`, U+2019), por lo que se indica normalizar la entrada (convertir `’`, `‘`, `ʼ`, `ʻ` y backtick a `'`; comillas curvas a `"`; guiones em/en a `-`) y restaurar `'` → `’` en las predicciones toraja para respetar la ortografía estándar del glotal.

## Capacidades

- Traducción automática neuronal bidireccional indonesio ↔ toraja, con un único modelo y prefijos de dirección.
- Generación de texto secuencia a secuencia (text2text-generation) orientada exclusivamente a traducción.
- Inferencia en navegador sin backend mediante transformers.js y pesos ONNX cuantizados.
- Manejo de texto con ortografía toraja que incluye oclusiva glotal, con normalización y post-procesado documentados.
- Capacidad multilingüe limitada a los dos idiomas del par (`id`, `trj`); no soporta otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Traducción de textos religiosos y litúrgicos: el modelo se entrenó sobre la Biblia en toraja, por lo que traduce con fluidez pasajes bíblicos y material devocional entre indonesio y toraja, como demuestran las muestras de verificación (p. ej. el Salmo 23).
- Digitalización y preservación lingüística: permite convertir corpus escritos en indonesio a toraja (y viceversa) para alimentar archivos digitales de una lengua de bajos recursos, con la ventaja de que el modelo es pequeño (~0,1 GB) y desplegable en entornos modestos.
- Traducción en el navegador para aplicaciones web comunitarias: gracias a la exportación ONNX QUInt8 y transformers.js, se puede integrar en una página web sin servidor de inferencia, ofreciendo traducción instantánea a usuarios de la comunidad toraja.
- Subtitulado y traducción de materiales educativos: el modelo puede traducir frases cortas de indonesio a toraja para señalética, folletos o materiales escolares, con latencias documentadas de 400-2.000 ms por frase según longitud.
- Asistencia a traductores humanos: como primera pasada en flujos de postedición, el modelo genera borradores que un hablante nativo revisa, útil dado el SacreBLEU de ~22-24 en el dominio de evaluación.
- Investigación en NMT de bajos recursos: sirve como referencia reproducible (corpus libre de fugas, particiones documentadas, métricas con intervalos de confianza bootstrap) para comparar técnicas de ajuste fino y cuantización en lenguas minoritarias.
- Traducción de correspondencia y documentos comunitarios: para cartas, avisos y textos administrativos sencillos entre indonesio y toraja, con la advertencia de revisar la salida por la tasa de repetición y anomalías de espaciado documentadas.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con `toraja_lib` (SacreBLEU 13a, chrF++ con `word_order=2`) e intervalos de confianza del 95 % por bootstrap de 500 iteraciones.

Decodificación greedy (`num_beams=1`, `repetition_penalty=1.15`, `max_new_tokens=200`):

| Tarea / dirección | Muestras | SacreBLEU (IC 95 %) | chrF++ (IC 95 %) | Repetición | Anomalía de espaciado | No parada | ms/frase |
|---|---|---|---|---|---|---|---|
| translation_id_to_trj | 500 | 24,24 [22,9-25,7] | 51,65 [50,5-52,8] | 9,2 % | 22,8 % | 8,8 % | 115,0 |
| translation_trj_to_id | 500 | 22,39 [20,8-24,1] | 48,66 [47,7-49,8] | 7,6 % | 0,0 % | 14,2 % | 149,9 |
| ood_id_to_trj | 46 | 21,99 [18,1-26,0] | 50,17 [47,1-53,5] | 2,2 % | 15,2 % | 19,6 % | 96,0 |
| ood_trj_to_id | 46 | 18,42 [13,8-23,1] | 46,46 [43,5-49,8] | 8,7 % | 0,0 % | 17,4 % | 133,6 |

Búsqueda por haces (`num_beams=4`, `length_penalty=1.0`, `repetition_penalty=1.15`, `max_new_tokens=200`):

| Tarea / dirección | Muestras | SacreBLEU (IC 95 %) | chrF++ (IC 95 %) | Repetición | Anomalía de espaciado | No parada | ms/frase |
|---|---|---|---|---|---|---|---|
| translation_id_to_trj | 500 | 23,88 [22,5-25,3] | 51,59 [50,5-52,7] | 7,8 % | 23,4 % | 8,8 % | 81,5 |
| translation_trj_to_id | 500 | 22,11 [20,6-23,8] | 48,43 [47,5-49,6] | 6,2 % | 0,0 % | 13,8 % | 102,0 |
| ood_id_to_trj | 46 | 22,32 [18,3-26,7] | 50,56 [47,6-53,8] | 4,3 % | 15,2 % | 21,7 % | 70,3 |
| ood_trj_to_id | 46 | 18,31 [13,5-23,1] | 46,43 [42,8-50,0] | 10,9 % | 0,0 % | 17,4 % | 93,6 |

No se han publicado comparaciones con otros modelos de traducción indonesio-toraja en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB; los pesos cuantizados son 45,28 MB (encoder) y 52,01 MB (decoder), por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- VRAM estimada para inferencia: por debajo de 1 GB en formato QUInt8; no se dispone de cifras oficiales para otras precisiones.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizó en una Tesla T4, y para inferencia son suficientes GPUs de gama baja o incluso CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, y también en ejecución solo CPU.
- Opciones de despliegue: transformers.js (`@xenova/transformers@2.17.2`) con ONNX Runtime Web para navegador; también es posible usar ONNX Runtime en servidor. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia documentada: 422-1.987 ms por frase en las muestras de verificación ONNX cuantizado; en la evaluación completa, 70-150 ms por frase según dirección y estrategia de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| MarianMT-Toraja-v2.2-ONNX (este) | ~74 M | no disponible | id ↔ trj | Apache-2.0 | ONNX QUInt8, transformers.js |
| Helsinki-NLP/opus-mt-id-en (base) | ~74 M (arquitectura MarianMT) | no disponible | id → en | no disponible en la información proporcionada | safetensors / PyTorch (formato original) |
| Otros modelos NMT indonesio-toraja | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el ajuste fino se realizó exclusivamente sobre la Biblia en toraja v2.1, por lo que el rendimiento fuera del dominio religioso puede degradarse; las métricas OOD (SacreBLEU 18,3-22,3) son inferiores a las del conjunto de test.
- Tasa de repetición no trivial: 6,2-10,9 % según configuración, lo que puede producir bucles o repeticiones en frases largas.
- Tasa de no parada: 8,8-21,7 %, con riesgo de generaciones que no terminan correctamente dentro de `max_new_tokens`.
- Anomalías de espaciado en la dirección ID→TRJ: 15,2-23,4 %, que requieren post-procesado.
- Sensibilidad al tokenizador: es obligatorio normalizar comillas y guiones antes de tokenizar y restaurar el glotal `'` → `’` en la salida toraja; de lo contrario la calidad cae.
- Cobertura lingüística muy limitada: solo indonesio y toraja; no es un modelo multilingüe general.
- Riesgo de alucinación y de traducciones literales en textos legales, médicos o técnicos; no debe usarse sin revisión humana en contextos críticos.
- Sesgos: no se documentan análisis de sesgo; al entrenarse solo con texto bíblico, el registro y el vocabulario están sesgados hacia ese dominio.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base `Helsinki-NLP/opus-mt-id-en` tiene su propia licencia que conviene verificar antes de un despliegue comercial.
- Longitud de contexto no documentada: no se especifica el máximo de tokens de entrada, lo que limita la planificación para documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TryZZZ/MarianMT-Toraja-v2.2-ONNX
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-id-en
- Tokenizador: https://huggingface.co/Xenova/opus-mt-id-en
- Corpus de entrenamiento: https://huggingface.co/datasets/lioneiltrystan/toraja-bible-v2-1
- Librería transformers.js: https://github.com/xenova/transformers.js
- No se han encontrado en la información proporcionada papers, blogs ni demos adicionales.
