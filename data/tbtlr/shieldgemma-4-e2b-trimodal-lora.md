# tbtlr/shieldgemma-4-e2b-trimodal-lora

## Resumen

ShieldGemma 4 E2B trimodal es un adaptador LoRA (r=16, 97 MB) desarrollado por el usuario independiente tbtlr sobre el modelo base `google/gemma-4-E2B-it`. Convierte el modelo generativo multimodal de Google en un clasificador de seguridad estilo ShieldGemma capaz de evaluar contenido en tres modalidades: texto, imágenes y peticiones habladas (audio). No es un lanzamiento oficial de Google ni está afiliado al equipo ShieldGemma; se trata de un fine-tune independiente publicado bajo licencia Apache 2.0.

El adaptador se aplica únicamente a las proyecciones de atención y MLP del modelo de lenguaje, dejando intactos los codificadores visual y de audio del modelo base. La clasificación es binaria y condicionada por política: el modelo recibe un texto de política (por ejemplo, "contenido peligroso" o "discurso de odio") y devuelve la probabilidad de violación calculada mediante softmax sobre los logits de los tokens "Yes" y "No". El adaptador sigue políticas con las que no fue entrenado, lo que lo hace reutilizable para taxonomías personalizadas.

Su relevancia actual radica en la creciente demanda de guardarraíles multimodales ligeros que puedan desplegarse junto a modelos generativos en producción. Al ser un adaptador de 97 MB sobre un modelo E2B (efímero, 2 mil millones de parámetros efectivos), el coste computacional de moderación es bajo en comparación con clasificadores dedicados de mayor tamaño, y cubre simultáneamente texto, imagen y voz en una sola pasada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer multimodal Gemma 4 E2B (texto + visión + audio) |
| Parámetros totales | No disponible (adaptador de 97 MB; el modelo base E2B no especifica recuento en la información) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización pero no se detalla) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se inyecta en las proyecciones de atención y MLP del modelo de lenguaje del Gemma 4 E2B-it, con rango r=16 y un tamaño de 97 MB. El modelo base es un transformer multimodal que procesa texto, imágenes y audio; el adaptador no modifica los codificadores de visión ni de audio, sino que adapta la cabeza de lenguaje para emitir una decisión de clasificación binaria condicionada por política. La inferencia se realiza en una sola pasada: se construye el prompt con la política y el contenido, y se calcula la probabilidad de violación como softmax sobre los logits de los tokens "Yes" y "No" en la última posición.

El entrenamiento utilizó un conjunto de datos multimodales de moderación: para texto, Aegis 2.0 (NVIDIA), BeaverTails, ToxicChat, WildGuardMix, XSTest y el conjunto de evaluación de OpenAI Moderation; para imagen, VLGuard, LlavaGuard (imágenes de SMID), UnsafeBench y COCO val2017 como datos benignos; para audio, LibriSpeech y voces TTS de LibriTTS-R Piper (en_US-libritts_r-medium), con JALMBench como evaluación. El audio de entrenamiento es exclusivamente sintético (TTS), lo que constituye una limitación declarada. No se especifica en la información disponible el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; el adaptador se presenta como un fine-tune supervisado con pérdida de clasificación binaria.

## Capacidades

- Clasificación de seguridad binaria (violación / no violación) condicionada por política, en texto, imagen y audio.
- Políticas de texto (redacción ShieldGemma v1): contenido peligroso, acoso, discurso de odio, contenido sexualmente explícito, violencia, obscenidad y una política compuesta "cualquier daño".
- Políticas de imagen (redacción ShieldGemma 2): contenido sexualmente explícito, violencia/gore, contenido peligroso y una política compuesta.
- Políticas de audio: las mismas políticas de texto aplicadas a una petición hablada, donde el clip de audio sustituye al texto de la petición.
- Generalización a políticas no vistas durante el entrenamiento: probado con las ocho definiciones de OpenAI Moderation.
- Procesamiento multimodal en una sola pasada (image-text-to-text), sin necesidad de pipelines separados por modalidad.
- Soporte de conversación multi-turno (tag `conversational`), aunque su uso previsto es la clasificación puntual.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso orientadas a agentes; el adaptador está especializado en moderación.

## Casos de uso

- Moderación de comentarios en plataformas de contenido: el modelo evalúa cada mensaje contra una política configurable (odio, acoso, violencia) y devuelve una probabilidad de violación que puede umbralizarse para enrutar a revisión humana o bloqueo automático, con coste bajo al ser un adaptador sobre un modelo E2B.
- Filtrado de imágenes subidas por usuarios: usando las políticas de imagen (sexual, violencia/gore, peligroso), el modelo clasifica imágenes en una sola pasada y permite descartar contenido antes de que llegue a los sistemas de almacenamiento o difusión.
- Moderación de asistentes de voz: para aplicaciones con entrada de audio (asistentes conversacionales, altavoces inteligentes), el modelo evalúa la petición hablada directamente contra las políticas de texto, sin necesidad de un paso separado de transcripción, a cambio de una pequeña pérdida de precisión (F1 0.852 frente a 0.886 del pipeline transcripción + texto).
- Guardarraíl en pipelines de generación: colocado antes o después de un LLM generativo, el adaptador filtra prompts de entrada y respuestas de salida contra políticas personalizadas, aprovechando su capacidad de seguir definiciones de política no vistas en entrenamiento.
- Investigación en seguridad de modelos: el adaptador permite estudiar la transferencia de políticas entre taxonomías (por ejemplo, comparar las definiciones de ShieldGemma con las de OpenAI Moderation) y analizar el comportamiento del clasificador en las tres modalidades con un único checkpoint.
- Clasificación de contenido en datasets de anotación: para equipos que construyen corpus de moderación, el modelo puede preetiquetar texto, imagen y audio con probabilidades de violación, reduciendo el esfuerzo de anotación manual antes de la revisión humana.
- Evaluación comparativa de guardarraíles: al ser un adaptador ligero y de licencia Apache 2.0, sirve como línea base reproducible en benchmarks de moderación multimodal (Aegis, VLGuard, UnsafeBench, JALMBench) frente a clasificadores dedicados de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de comparación entre el adaptador y su versión fusionada (`tbtlr/shieldgemma-4-e2b-trimodal`): puntuaciones idénticas en texto e imagen verificadas a 4 decimales, y una diferencia media absoluta de 0.001 sobre 64 clips de audio en bf16. También se indica un F1 de 0.852 para la vía de audio en una pasada frente a 0.886 para el pipeline de transcripción con Gemma 4 más clasificación de texto, pero no se detallan los conjuntos de evaluación ni las métricas completas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador pesa 97 MB, pero requiere cargar el modelo base Gemma 4 E2B-it completo en bf16, cuyo tamaño no se especifica en la documentación disponible.
- GPU recomendadas: no disponible. El modelo base es de tipo E2B (2 mil millones de parámetros efectivos según la nomenclatura de Google), por lo que se espera que quepa en GPU de consumo, pero la información no confirma modelos concretos.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo base, pero no se confirma en la información disponible.
- Opciones de despliegue: la model card muestra uso con `transformers` (`Gemma4ForConditionalGeneration`) y `peft` (`PeftModel`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShieldGemma 4 E2B trimodal (LoRA) | Adaptador 97 MB sobre Gemma 4 E2B | No disponible | Texto, imagen, audio | Apache 2.0 | Hugging Face (95 descargas) |
| ShieldGemma 2 (Google) | No disponible en la información | No disponible | Imagen | No disponible en la información | No disponible en la información |
| Llama Guard (Meta) | No disponible en la información | No disponible | Texto | No disponible en la información | No disponible en la información |
| WildGuard (AllenAI) | No disponible en la información | No disponible | Texto | No disponible en la información | No disponible en la información |

La información proporcionada no incluye especificaciones de los modelos comparables, por lo que la comparativa se limita a señalar su existencia como alternativas de la misma categoría (clasificadores de seguridad). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Las puntuaciones binarias "cualquier inseguro" dependen de la distancia entre la taxonomía del benchmark y las políticas del modelo; odio, política, privacidad, fraude y desinformación en imágenes y texto quedan fuera del alcance.
- La política de contenido peligroso en imagen se entrenó con una lectura más amplia (armas, abuso de sustancias, planificación criminal, imágenes de autolesión) que su contraparte de texto, lo que puede generar inconsistencias entre modalidades.
- El entrenamiento de audio usó exclusivamente voz sintética (TTS); el habla real grabada, los acentos, el ruido y el audio en idiomas distintos del inglés no han sido probados.
- En las mismas peticiones habladas, transcribir con Gemma 4 y puntuar el texto con la política de texto obtiene mejor F1 (0.886) que la vía de audio en una pasada (0.852); la vía de audio es más rápida pero con coste de precisión.
- El modelo solo soporta inglés.
- Dos de los conjuntos de datos de texto (BeaverTails y ToxicChat) tienen licencia CC BY-NC 4.0; si esa restricción se extiende a los pesos del modelo es una cuestión legal no resuelta, por lo que los usuarios comerciales deben evaluarlo por su cuenta.
- No sustituye la revisión humana en entornos de alto riesgo.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- El adaptador no modifica los codificadores de visión ni de audio, por lo que la calidad de la clasificación multimodal depende de las representaciones del modelo base.
- Es un fine-tune independiente no afiliado a Google ni al equipo ShieldGemma; "Gemma" se usa solo para describir el modelo base.

## Enlaces

- Hugging Face (adaptador LoRA): https://huggingface.co/tbtlr/shieldgemma-4-e2b-trimodal-lora
- Modelo fusionado: https://huggingface.co/tbtlr/shieldgemma-4-e2b-trimodal
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset Aegis 2.0 (NVIDIA): https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset ToxicChat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset WildGuardMix: https://huggingface.co/datasets/allenai/wildguardmix
- Dataset VLGuard: https://huggingface.co/datasets/ys-zong/VLGuard
- Dataset LlavaGuard: https://huggingface.co/datasets/AIML-TUDA/LlavaGuard
- Dataset UnsafeBench: https://huggingface.co/datasets/yiting/UnsafeBench
