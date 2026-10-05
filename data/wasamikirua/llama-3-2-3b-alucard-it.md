# WasamiKirua/Llama-3.2-3B-Alucard-IT

## Resumen

Llama-3.2-3B-Alucard-IT es un ajuste fino (fine-tuning) del modelo unsloth/Llama-3.2-3B-Instruct que impone como comportamiento por defecto la voz del personaje Alucard (Hellsing) en italiano. Lo publica el usuario WasamiKirua en HuggingFace bajo licencia apache-2.0 declarada y con el identificador de idioma `it`. El modelo tiene 3.212.749.824 parametros reales segun los pesos en safetensors y un tamano de repositorio de 6,4 GB, lo que corresponde a un checkpoint denso en 16 bits tras unir el adaptador LoRA.

El objetivo no es mejorar capacidades generales de razonamiento o codigo, sino fijar un estilo conversacional muy concreto: la model card indica explicitamente que no hace falta enviar un prompt de sistema con la personalidad, porque la voz de Alucard es la respuesta predefinida. Esto lo convierte en un artefacto de roleplay y generacion de personaje mas que en un modelo de proposito general.

Su relevancia es acotada pero ilustrativa: es un ejemplo de pipeline completo y reproducible de sintesis de datos con un modelo profesor local, traduccion automatica con TranslateGemma y ajuste con LoRA de Unsloth sobre un dataset diminuto (2.054 prompts). Tambien sirve como caso de estudio de los riesgos de este tipo de recetas: dataset muy pequeno, datos sinteticos, traduccion automatica y una licencia declarada que conviene revisar frente a la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2); ajuste LoRA sobre unsloth/Llama-3.2-3B-Instruct |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | safetensors en 16 bits en el repositorio principal; GGUF en repositorio separado (tipos concretos no disponibles) |
| Idiomas soportados | italiano (`it`) declarado en la model card |
| Licencia | apache-2.0 (declarada por el autor; ver advertencias sobre el modelo base) |
| Formato de pesos | safetensors (transformers) y GGUF (repo WasamiKirua/Llama-3.2-3B-Alucard-IT-GGUF) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Llama 3.2 con 3.212.749.824 parametros. No se introduce ninguna innovacion estructural; el trabajo consiste en un ajuste LoRA con Unsloth de rango 16 y alpha 16, carga en 4 bits, dos epocas y perdida calculada unicamente sobre los turnos de respuesta. El adaptador resultante se fusiono con los pesos base en 16 bits, y la model card aclara que no se cargo la copia cuantizada a 4 bits durante la union, por lo que el redondeo de esa cuantizacion no esta presente en el repositorio publicado.

El dataset se construyo de forma sintetica en varias fases. Partiendo del dataset publico `perceptron-743/anime-train`, se filtraron las lineas en ingles de entre 30 y 50 caracteres; tras eliminar duplicados quedaron 2.054 prompts, de los cuales 20 se reservaron con el seed 7 para validacion (esos 20 nunca se enviaron al modelo profesor). Un modelo local identificado en la ficha como `qwen3.6`, servido con llama-swap, genero las respuestas en ingles usando como entrada el prompt de sistema de Alucard mas una frase humana breve; la fila guardada conserva solo la frase humana y la respuesta, sin el prompt del personaje. De las respuestas validas (hasta 800 lineas), 80 incluyen ademas el texto generico "You are a helpful assistant." para evitar que el modelo pierda la voz cuando una aplicacion externa inyecta un system prompt. Finalmente, TranslateGemma tradujo cada turno al italiano y el resultado se guardo en `train_ita.jsonl`; la ficha senala que la traduccion se hizo con el prompt crudo de Gemma y no con ChatML, porque este ultimo provocaba repeticiones.

## Capacidades

- Generacion de texto conversacional en italiano con un registro de personaje fijo (Alucard) sin necesidad de system prompt.
- Roleplay y mantenimiento de una persona estable a lo largo de turnos, segun el control cualitativo incluido en la model card.
- Respuesta a instrucciones generales heredadas del modelo base, aunque degradadas por el ajuste sobre un dataset muy pequeno.
- Traduccion interna de la senal de sistema: cuando se envia "You are a helpful assistant.", el modelo mantiene la voz del personaje, comportamiento entrenado deliberadamente en 80 ejemplos.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada; se hereda, como maximo, del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente.
- Vision, audio o modo de razonamiento explicito (thinking): no disponibles.
- Capacidades multilingues: la ficha declara unicamente italiano; el modelo base es multilingue, pero el ajuste no fue validado en otros idiomas.

## Casos de uso

- Prototipos de roleplay y ficcion interactiva en italiano: el modelo ofrece una voz de personaje consistente desde el primer turno, sin necesidad de configurar un prompt de sistema, lo que simplifica el backend de una aplicacion de chat narrativo.
- Personaje no jugador (NPC) en videojuegos o experiencias interactivas: con 3,2 mil millones de parametros puede ejecutarse en una GPU de consumo o incluso en CPU con cuantizacion GGUF, lo que permite desplegarlo localmente en demos y game jams.
- Chatbot de entretenimiento en comunidades de fans: sirve como bot de Discord o Telegram con una personalidad reconocible escrita en italiano, siempre que se asuma el tono agresivo del personaje.
- Banco de pruebas para pipelines de sintesis de datos: el repositorio documenta la receta completa (filtrado, generacion con modelo profesor, traduccion, LoRA), y sirve como referencia reproducible para experimentar con la misma metodologia en otros personajes o idiomas.
- Evaluacion de olvido catastrofico en ajustes pequenos: util en investigacion para medir cuanto se degradan las capacidades generales de un modelo de 3B tras un LoRA con 2.054 ejemplos y dos epocas.
- Generacion de dialogos para guiones o storyboards de aficionados: produce parrafos de dialogo con un estilo marcado que un guionista puede editar despues, con coste de inferencia minimo.
- Despliegue educativo sobre hardware modesto: al caber en cuantizacion de 4 bits en GPUs de 6-8 GB, es adecuado para talleres y cursos donde se ensena a servir modelos con llama.cpp, Ollama o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un control cualitativo sobre uno de los 20 prompts reservados (`Kano, stai lavorando anche al manga? E hai intenzione di fare cosplay?`), comparando la respuesta del modelo base con la del ajuste mediante decodificacion con `--top-k 1` y sin prompt de sistema de Alucard. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni tampoco comparaciones cuantitativas con alternativas.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 6,4-7 GB solo para los pesos, mas overhead de contexto y cache KV; en la practica conviene reservar 8-10 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF tipo Q4): aproximadamente 2-2,5 GB, con margen segun longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10G). Para 4 bits bastan GPUs de 6-8 GB, e incluso es viable en CPU con llama.cpp.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores, especialmente con cuantizacion GGUF.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama usando el repositorio GGUF separado, y Unsloth para reentrenamiento o ajuste adicional.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WasamiKirua/Llama-3.2-3B-Alucard-IT | 3,21 B | no disponible | sin benchmarks publicados; solo control cualitativo | apache-2.0 declarada (base Llama 3.2) | safetensors en HF + GGUF en repo separado |
| unsloth/Llama-3.2-3B-Instruct (modelo base) | 3,21 B | no disponible en esta ficha | no disponible | apache-2.0 declarada por Unsloth (deriva de Meta Llama 3.2) | safetensors en HF |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens segun Meta | si, benchmarks publicados por Meta | Llama 3.2 Community License | safetensors en HF (acceso con aceptacion de terminos) |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens nativo | benchmarks publicados por Alibaba | Apache-2.0 | safetensors y GGUF en HF |

La comparacion relevante es con el propio modelo base: el ajuste anade la voz de Alucard en italiano a cambio de una perdida casi segura de capacidades generales, dado el tamano del dataset. Frente a alternativas de 3B con evaluaciones publicas (Llama 3.2 3B Instruct, Qwen2.5-3B-Instruct), este modelo no aporta datos de rendimiento que permitan situarlo.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (2.054 prompts efectivos, 20 reservados para validacion): riesgo alto de sobreajuste y de que el comportamiento depende en exceso del estilo de las frases de origen (lineas en ingles de 30-50 caracteres procedentes de `anime-train`).
- Datos enteramente sinteticos: las respuestas las genero un modelo profesor local y despues las tradujo TranslateGemma. Los errores de traduccion, las alucinaciones y los sesgos del profesor se propagan al modelo final sin ninguna fase de curacion humana documentada.
- Olvido catastrofico esperable: al entrenar solo sobre las respuestas y con dos epocas sobre un dataset minimo, es probable la degradacion de razonamiento, codigo, matematicas y conocimientos generales en comparacion con el modelo base.
- Idioma: la ficha declara solo italiano. El comportamiento en castellano, ingles u otros idiomas no esta documentado y puede ser erratico, con mezcla de idiomas o codigo residual de la traduccion.
- Sesgo de personaje y contenido: la voz entrenada responde con agresividad y lenguaje violento (por ejemplo, referencias a "sterminare"), lo que la hace inadecuada para atencion al cliente, educacion o cualquier producto profesional sin filtrado previo.
- Riesgo de alucinacion elevado, heredado de un modelo de 3B y agravado por el ajuste sobre datos sinteticos traducidos.
- Licencia: el autor declara apache-2.0, pero el modelo deriva de la familia Llama 3.2 de Meta, sujeta a la Llama 3.2 Community License, que incluye condiciones adicionales (atribucion "Built with Llama", politica de uso aceptable, obligaciones de nombre en derivados). Conviene verificar la compatibilidad antes de cualquier uso comercial.
- Propiedad intelectual del personaje: el modelo reproduce la voz de Alucard (Hellsing) sin autorizacion documentada de los titulares de los derechos, lo que anade incertidumbre legal en despliegues publicos o comerciales.
- Procedencia de los datos: el dataset de origen, `perceptron-743/anime-train`, y el uso de material derivado de obras con copyright plantean dudas sobre la trazabilidad de las licencias del contenido de entrenamiento.
- Sin historial de adopcion: 0 descargas y 0 likes en el momento de la consulta, y creado el 2026-10-05, por lo que no existe validacion independiente de la comunidad.
- Comportamiento mixto por diseno: las 80 filas con "You are a helpful assistant." introducen un modo de respuesta ambiguo cuando una aplicacion inyecta un system prompt distinto al del personaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WasamiKirua/Llama-3.2-3B-Alucard-IT
- Repositorio GGUF del mismo autor: https://huggingface.co/WasamiKirua/Llama-3.2-3B-Alucard-IT-GGUF
- Modelo base del ajuste: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de prompts humanos: https://huggingface.co/datasets/perceptron-743/anime-train
- Unsloth (framework de ajuste utilizado): https://github.com/unslothai/unsloth
- Terminos de la Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
