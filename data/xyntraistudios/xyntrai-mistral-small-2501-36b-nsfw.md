# xyntraistudios/xyntrai-mistral-small-2501-36B-nsfw

## Resumen

Xyntrai Mistral Small 2501 36B NSFW es un fine-tune derivado de TheDrummer/Skyfall-36B-v2, que a su vez es una version escalada ("upscaled") de Mistral Small 24B Instruct 2501 con entrenamiento continuado orientado a creatividad y roleplay. Lo publica el usuario xyntraistudios en Hugging Face bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con la libreria transformers y text-generation-inference. El modelo cuenta con 36.910.535.680 parametros reales segun los metadatos de safetensors, lo que lo situa en la franja de 36B, por encima del Mistral Small original de 24B.

El problema que aborda es el de la generacion creativa de texto en ingles, especialmente narrativa y roleplay, manteniendo a la vez capacidades de instruccion, razonamiento en cadena y uso de herramientas. La model card del autor original (TheDrummer) destaca que el modelo ofrece buena calidad de escritura, comprension matematica y un rendimiento solido en tool use, y lo presenta como alternativa practica a modelos de 70B en entornos locales.

Es relevante ahora porque demuestra la tendencia de "upscaling" de modelos pequenos mediante entrenamiento continuado, y porque su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, algo poco habitual en fine-tunes orientados a contenido para adultos. No obstante, el modelo esta marcado como `not-for-all-audiences` y su unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral Small 2501, sin confirmar detalles especificos del upscaling) |
| Parametros totales | 36.910.535.680 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el autor original menciona uso de versiones de 3 bits en pruebas de la comunidad |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 73.8 GB) |

## Arquitectura y entrenamiento

La informacion disponible indica que Skyfall 36B v2, del que este modelo es un fine-tune, es una version escalada de Mistral Small 2501 con entrenamiento continuado orientado a creatividad y roleplay. No se detalla en la model card la arquitectura exacta del proceso de upscaling (por ejemplo, si se uso expansion de capas, destilacion o merge de pesos), ni el volumen de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. La model card original tampoco especifica innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Lo que si se documenta es el soporte de plantillas de chat: Mistral v7 Tekken (recomendada), Metharme (no recomendada) y Alpaca (util para ficcion interactiva o relatos). El fine-tune de xyntraistudios anade el tag `nsfw` y el aviso `not-for-all-audiences`, lo que sugiere un ajuste adicional sobre el modelo base para contenido para adultos, aunque no se publican detalles del dataset ni del procedimiento de ajuste empleado.

## Capacidades

- Generacion de texto creativo en ingles: narrativa, roleplay y ficcion interactiva, con enfasis en calidad de escritura y coherencia de personajes.
- Razonamiento en cadena (chain of thought) segun la model card del modelo base.
- Comprension matematica basica segun la model card del modelo base.
- Uso de herramientas (tool use) con rendimiento descrito como solido por el autor original.
- Capacidad de instruccion general, incluyendo respuestas a prompts directos.
- Soporte de plantillas de chat Mistral v7 Tekken, Metharme y Alpaca.
- Contenido NSFW: el fine-tune esta explicitamente orientado a contenido para adultos, con el tag `not-for-all-audiences`.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta entrenado para mantener personajes coherentes y describir interacciones con detalle, lo que lo hace adecuado para plataformas de roleplay con memoria de contexto amplia (siempre que se confirme la ventana real del modelo base).
- Escritura creativa y ficcion interactiva: la plantilla Alpaca permite generar relatos tipo "choose your own adventure" o cyoa, y el modelo destaca en descripciones narrativas y dialogos.
- Generacion de contenido para adultos en entornos controlados: el ajuste NSFW permite producir ficcion erotica o narrativa para adultos, siempre con las advertencias legales y de moderacion correspondientes.
- Asistente de escritura para guionistas y novelistas: puede generar borradores de escenas, dialogos y descripciones de personajes con un estilo consistente.
- Prototipado de agentes conversacionales: gracias al soporte de tool use descrito en la model card base, puede integrarse en pipelines de agentes simples que requieran llamadas a funciones.
- Experimentacion en investigacion de alineacion y seguridad: al ser un modelo abierto con licencia Apache 2.0, sirve para estudiar el comportamiento de fine-tunes NSFW y disenar filtros o evaluaciones de seguridad.
- Despliegue local en estaciones de trabajo con GPU de gama alta: el formato safetensors y la compatibilidad con transformers y TGI permiten servirlo en entornos con suficiente VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 74 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 37-40 GB, viable en una A100 40GB o en dos RTX 4090.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 19-22 GB, viable en una RTX 4090 (24 GB) o RTX 3090.
- Cuantizacion de 3 bits: mencionada por la comunidad en la model card original; permitiria inferencia en GPUs de 16-24 GB, aunque con perdida de calidad.
- GPUs recomendadas: A100 80GB, H100 80GB para precision completa; RTX 4090 o A6000 para cuantizaciones de 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp/Ollama si existen conversiones GGUF de la comunidad (no confirmadas en la informacion disponible), y vLLM si se anade soporte para la arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Xyntrai Mistral Small 2501 36B NSFW | 36.9B | no disponible | Apache 2.0 | en | Fine-tune NSFW de Skyfall 36B v2 |
| TheDrummer/Skyfall-36B-v2 | 36B (aproximado) | no disponible | no disponible en la informacion | en | Modelo base del que deriva este fine-tune |
| mistralai/Mistral-Small-24B-Instruct-2501 | 24B | no disponible en la informacion | Apache 2.0 | multilingue | Modelo original de Mistral AI, instruction-tuned |
| Mistral Small 3 (2501) | 24B | no disponible en la informacion | Apache 2.0 | multilingue | Referencia de la categoria "small" segun Mistral AI |

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta marcado como `not-for-all-audiences` y orientado a contenido para adultos; no es adecuado para aplicaciones dirigidas a menores ni para entornos sin moderacion.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un fine-tune creativo, puede reproducir estereotipos presentes en los datos de entrenamiento.
- Alucinacion: no hay datos de evaluacion de veracidad; como modelo generativo, puede producir afirmaciones falsas con apariencia de verosimilitud.
- Contexto: la longitud de contexto no esta especificada en la informacion disponible, lo que impide garantizar conversaciones de muy largo alcance.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a las politicas de la plataforma y a la legislacion aplicable sobre contenido para adultos.
- Produccion: el modelo tiene solo 25 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada; no se recomienda para produccion sin evaluacion propia.
- Repo grande: 73.8 GB en safetensors, lo que requiere almacenamiento y ancho de banda considerables.

## Enlaces

- Hugging Face: https://huggingface.co/xyntraistudios/xyntrai-mistral-small-2501-36B-nsfw
- Modelo base original: https://huggingface.co/TheDrummer/Skyfall-36B-v2
- Perfil del autor: https://huggingface.co/xyntraistudios/models
- Mistral Small 24B Instruct 2501: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
