# toonist/AnuLM-Omni-400M

## Resumen

AnuLM-Omni-400M es un modelo multimodal any-to-any de 456 millones de parámetros (232 millones activos por token) desarrollado por el autor independiente toonist. Unifica en un único decoder de arquitectura mixture-of-experts las siete tareas que antes cubrían cinco copias separadas del mismo modelo base: chat, respuesta a preguntas sobre pasajes, clasificación de intenciones, reconocimiento de voz en inglés y hindi, descripción de imágenes y respuesta a preguntas sobre imágenes. El modelo parte de toonist/AnuLM-Base-v2-400M, un base preentrenado desde cero en hindi, inglés y Python.

La relevancia del modelo reside en su propuesta de eficiencia extrema: consolida múltiples capacidades en un decoder pequeño que cabe en una GPU de consumo e incluso en CPU, y lo hace con datos íntegramente licenciados para uso comercial. Para las entradas de audio e imagen utiliza dos codificadores congelados y preexistentes (Whisper-small para audio y SigLIP ViT-B/16 para imagen) conectados mediante proyectores entrenados específicamente.

El modelo se publica bajo licencia CC BY-SA 4.0, con divulgación explícita de dos incertidumbres legales en el corpus de preentrenamiento (código con copyleft y datos generados por modelos). Está pensado para estudio, fine-tuning y construcción de demos y productos en hindi e inglés, no como modelo de propósito general de alta fidelidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder mixture-of-experts (MoE), 20 capas, hidden 1024, 61.445 ids de vocabulario (32.768 de texto + ids de control de audio e imagen); proyectores de audio e imagen sobre codificadores congelados |
| Parametros totales | 456.391.056 |
| Parametros activos | 232 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | hindi (hi), inglés (en); entrenado además con Python |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, PyTorch (bfloat16) |

## Arquitectura y entrenamiento

El decoder es un transformer MoE de 20 capas con dimensión oculta 1024 y un vocabulario de 61.445 ids que incluye 32.768 tokens de texto más ids de control para audio e imagen. Se entrenó desde cero sobre el base AnuLM-Base-v2-400M, preentrenado en hindi, inglés y Python con el tokenizador multi32k durante aproximadamente 1,9 millones de pasos (unos 7,8B tokens vistos sobre un corpus de 11,3B tokens), y después se afinó simultáneamente en las siete tareas. Los parámetros activos por token son 232M, lo que reduce el coste de inferencia frente a un denso del mismo tamaño total.

Las modalidades no textuales se incorporan mediante dos proyectores entrenados: uno de audio de 12,6M de parámetros que agrupa 4 frames de Whisper en una posición del decoder, y otro de imagen que agrupa parches de SigLIP en bloques 2x2. Los codificadores subyacentes están congelados: Whisper-small (licencia MIT, cargado con faster-whisper) y SigLIP `vit_base_patch16_siglip_224` (Apache 2.0, cargado con timm). Los datos de entrenamiento cubren pretraining (fineweb-edu, fineweb-2 Hindi, Wikipedia hindi, Python de codeparrot-clean, OpenCodeInstruct y opc-sft-stage1), chat (35.767 pares de Dolly-15k, OASST2, Aya y QA de Wikipedia), lectura (SQuAD v1.1, MLQA hi), intenciones (BANKING77, MASSIVE hi-IN), voz (LibriSpeech, Kathbath, MUCS 2021, FLEURS hi) y visión (Localized Narratives, DOCCI, TextVQA). Se excluyeron deliberadamente Flickr30k, COCO, IndicTTS y un conjunto sintético bancario por restricciones o ambigüedad de licencia.

## Capacidades

- Generación de texto conversacional en hindi e inglés, con 35.767 pares de entrenamiento de chat.
- Respuesta a preguntas extractiva sobre pasajes (reading comprehension) en inglés y hindi.
- Clasificación de intenciones para dominios bancarios (BANKING77) y de voz/asisstente (MASSIVE hi-IN).
- Reconocimiento automático de voz (ASR) en inglés y hindi, incluyendo conversacional.
- Descripción de imágenes (image captioning) con el estilo de Localized Narratives y DOCCI.
- Respuesta a preguntas sobre imágenes (VQA), orientada a preguntas sobre texto presente en la imagen (TextVQA).
- Procesamiento any-to-any: entrada de texto, audio o imagen con salida de texto.
- Capacidad de ejecución en una sola GPU de consumo y en CPU.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Chat de atención al cliente en hindi e inglés: el modelo gestiona conversaciones multi-turno con contexto moderado y puede desplegarse en infraestructura modesta, aunque para datos factuales conviene combinarlo con recuperación de pasajes.
- Respuesta a preguntas sobre documentación: usando la tarea de reading con pasajes recuperados (SQuAD/MLQA), adecuado para asistentes de FAQ o bases de conocimiento donde se controla la fuente de la respuesta.
- Enrutado de intenciones en asistentes de voz: la clasificación sobre BANKING77 y MASSIVE hi-IN permite dirigir consultas entrantes a flujos concretos en aplicaciones bancarias o de atención telefónica.
- Transcripción de audio en inglés y hindi: el ASR integrado sirve para subtitulado o dictado en aplicaciones de productividad, con la salvedad de que el audio ruidoso o las grabaciones largas degradan el rendimiento.
- Accesibilidad y descripción de imágenes: la generación de captions permite describir fotos para usuarios con discapacidad visual o etiquetar contenido en catálogos, siempre con revisión humana por la tasa de error del VQA.
- Extracción de información de capturas y documentos escaneados: el VQA entrenado sobre TextVQA es útil para leer texto en imágenes, aunque el autor advierte que es débil en otras categorías visuales.
- Prototipado e investigación en modelos pequeños multilingües: al ser completamente abierto y ejecutable en una GPU de consumo, sirve como banco de pruebas para fine-tuning y estudios de arquitecturas MoE multimodales.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre los pesos publicados (copia bfloat16 exportada, `experiments/omni_one.py`, ejecución del 2026-11-06). WER en %, menor es mejor; F1 y accuracy, mayor es mejor; las pérdidas, menor es mejor.

| Medida | Omni | Modelo de chat de partida | Modelo separado anterior | Umbral | Pasa |
|---|---|---|---|---|---|
| chat_heldout_loss | 3,2555 | 3,146 | - | <= 3,3 | sí |
| read_squad_en | 37,8 | - | 57,2 (pointer reader) | >= 30,0 | sí |
| read_mlqa_hi | 11,9 | - | - | - | - |
| intent_banking77 | 85,0 | 5,0 | 89,0 (Decide adapter) | >= 80,0 | sí |
| intent_massive_hi | 80,33 | 3,0 | - | - | - |
| wer_en | 7,9 | - | 7,1 (asr_en_v3) | <= 9,0 | sí |
| wer_hi_fleurs | 41,6 | - | 36,5 (asr_hi_v3); 39,6 (v5) | <= 43,0 | sí |
| wer_hi_kathbath | 31,1 | - | 37,0 (asr_hi_v3); 24,9 (v5) | - | - |
| wer_hi_mucs | 53,0 | - | 79,2 (asr_hi_v3); 55,6 (v5) | - | - |
| wer_hi_mean | 41,9 | - | 50,9 (asr_hi_v3); 40,0 (v5) | <= 50,9 | sí |
| vqa_acc | 12,6 | - | - | >= 10,0 | sí |
| caption_heldout_loss | 2,9986 | - | - | - | - |

Las siete puertas de calidad declaradas por el autor se superan. El modelo unificado pierde precisión frente a algunos modelos especializados previos (por ejemplo, en lectura SQuAD en inglés: 37,8 frente a 57,2 del pointer reader, o en WER hindi de FLEURS: 41,6 frente a 36,5 de asr_hi_v3), pero mejora en otras tareas y reduce el coste de mantener cinco modelos separados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,0 GB en bfloat16; con overhead de runtime y los codificadores congelados (Whisper-small y SigLIP ViT-B/16) el consumo se sitúa en el rango de pocos GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: cualquier GPU de consumo moderna con suficiente VRAM para el decoder y los dos codificadores; el autor indica explícitamente que corre en una sola GPU de consumo.
- Cabe en GPU de consumo: sí, según el autor; también se ejecuta en CPU.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; el autor referencia la app de demo `anulm/apps/app_omni.py` del repositorio de GitHub. Los codificadores se cargan con faster-whisper y timm.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnuLM-Omni-400M | 456M totales / 232M activos | no disponible | texto, audio, imagen | CC BY-SA 4.0 | Hugging Face |
| AnuLM-Base-v2-400M | 400M (aprox.) | no disponible | texto | no disponible en la información | Hugging Face |
| Whisper-small (encoder usado) | ~244M | no disponible | audio | MIT | Hugging Face / OpenAI |
| SigLIP ViT-B/16 (encoder usado) | ~93M (ViT-B) | no disponible | imagen | Apache 2.0 | Hugging Face / timm |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría (small language models multimodales) en la información proporcionada. Los modelos especializados previos del mismo autor (asr_en_v3, asr_hi_v3, asr_hi_v5, pointer reader, Decide adapter) aparecen en la tabla de benchmarks como referencia interna, no como alternativas externas.

## Limitaciones y advertencias

- Es un modelo de 400M: fluido pero a menudo incorrecto en datos factuales. El propio autor recomienda usar la tarea de lectura con pasajes recuperados en lugar del chat de memoria para información factual.
- El reconocimiento de voz solo cubre inglés y hindi, y se degrada con audio ruidoso, otros idiomas y grabaciones largas.
- El VQA está entrenado sobre preguntas de texto en imagen (TextVQA) y es débil en el resto de categorías visuales; la precisión reportada es del 12,6 %.
- Las descripciones de imagen siguen el estilo de Localized Narratives y DOCCI, lo que puede sesgar el formato de las captions generadas.
- Riesgo de alucinación inherente a su tamaño y a la pérdida de chat en held-out de 3,2555.
- Licencia CC BY-SA 4.0: permite uso comercial y modificación con atribución, pero obliga a distribuir los pesos (o versiones modificadas) bajo la misma licencia; servir el modelo detrás de una API no distribuye pesos.
- Dos incertidumbres legales declaradas en el base: datos de Python con licencias copyleft (GPL/AGPL) vía codeparrot-clean, y opc-sft-stage1, que mezcla respuestas generadas por modelos, incluidas algunas de conversaciones de ChatGPT. Ninguna prohíbe el uso, pero ninguna está resuelta.
- El autor no está afiliado a Sarvam AI, AI4Bharat, BharatGen ni al Gobierno de India, pese a las etiquetas de arquitectura Sarvam.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines agénticos sin fine-tuning adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toonist/AnuLM-Omni-400M
- Modelo base: https://huggingface.co/toonist/AnuLM-Base-v2-400M
- Modelo base anterior: https://huggingface.co/toonist/AnuLM-Base-400M
- Repositorio de código y demo: https://github.com/MOBIRIZER-TECHNOLOGY/AnuLM (rama `restructure`)
- App de demo: `anulm/apps/app_omni.py` en el repositorio anterior
- Documentación de datasets: `docs/DATASETS.md` y `NOTICE` en el repositorio
- Plan del base 1B: `docs/PLAN_1B.md` en el repositorio
