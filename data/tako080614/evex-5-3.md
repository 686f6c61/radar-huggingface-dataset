# tako080614/evex-5.3

## Resumen

evex-5.3 es un modelo de lenguaje japonés de 25,7 millones de parámetros, entrenado desde cero (from scratch) exclusivamente con los registros de un único servidor de Discord. El autor, tako080614, construyó tanto el tokenizer como la arquitectura específicamente para este propósito, sin derivar de pesos preexistentes. El modelo está diseñado para generar conversaciones que imiten el estilo de habla de los usuarios concretos de ese servidor, asignando tokens anónimos a los 147 hablantes más activos.

La relevancia de este modelo reside en su enfoque radicalmente distinto al de los LLM generalistas: en lugar de buscar capacidades amplias, optimiza una única tarea (reproducir el estilo conversacional de una comunidad concreta) con una eficiencia computacional extrema. Su arquitectura incorpora PLE (Per-Layer Embeddings), una técnica similar a la usada en Gemma 3n, que añade un 36% de capacidad con solo un 3% más de coste computacional por token. La licencia es CC-BY-4.0 y el idioma soportado es únicamente japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (RoPE + RMSNorm + SwiGLU, weight tying) |
| Parametros totales | 25.763.264 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | japones |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con d_model 384 y 6 cabezas de atencion. Usa RoPE (Rotary Positional Embeddings), RMSNorm y SwiGLU como funcion de activacion, con weight tying entre las capas de embedding y de salida. El tokenizer es SentencePiece BPE con byte_fallback y un vocabulario de 12.288 tokens, entrenado tambien desde cero con los registros del servidor.

La innovacion principal es el uso de PLE (Per-Layer Embeddings, d_ple=64), una tecnica que anade vectores auxiliares por token y por capa. A diferencia de Gemma 3n, que usa multiplicacion de matrices, evex-5.3 implementa PLE como una tabla de consulta (lookup table), lo que incrementa la capacidad del modelo en un 36% pero solo anade un 3% de coste computacional por token, especialmente eficiente en inferencia CPU donde el cuello de botella es la multiplicacion de matrices. Tambien incorpora QK-norm, aplicando RMSNorm a las consultas (q) y claves (k) antes de RoPE.

El entrenamiento se realizo en dos etapas: la primera con datos externos de conversacion japonesa (Japanese-Roleplay-Dialogues, JESC y open2ch, 601.794 conversaciones) mas un 30% de registros del servidor; la segunda exclusivamente con registros del servidor (1.314.843 conversaciones). En la version 5.3 se multiplico por 2.9 el recorte de datos por hablante y se modifico la funcion de perdida para que solo se calcule sobre las intervenciones del hablante objetivo en los recortes individuales, triplicando la densidad del gradiente. El optimizador es AdamW con programacion cosine y tasa de aprendizaje 4.2e-4, batch 24, durante 8 epocas. La loss de validacion final es 6.9018.

## Capacidades

- Generacion de conversacion en japones que imita el estilo de hablantes concretos de un servidor de Discord, identificados por tokens anonimos `<|s0|>` a `<|s146|>`.
- Modelado de estructura conversacional compleja: canales (`<|c0|>` a `<|c15|>`), hilos de respuesta (`<|re|>`), reacciones (`<|hi|>`), menciones, URLs, archivos y marcas de tiempo normalizadas.
- Deteccion y reproduccion de idiosincrasias individuales: el modelo consigue que el loss sea menor cuando se condiciona con el token del hablante correcto en un 75.0% de los casos (frente al 50% esperable por azar).
- Generacion de codigo dentro de conversaciones mediante delimitadores `<code>` y `</code>`.
- Manejo de conversaciones multi-hablante con hasta 147 hablantes con token propio y 8 adicionales por conversacion (`<|a|>` a `<|h|>`).
- No soporta tool calling, agentes, vision ni otros modos especiales.

## Casos de uso

- Recreacion de personajes para roleplay: el modelo puede generar respuestas que imitan el estilo de un usuario concreto de un servidor de Discord, lo que permite crear personajes ficticios basados en personalidades reales para juegos de rol textual.
- Generacion de datos sinteticos de conversacion: dado que reproduce fielmente el registro conversacional de una comunidad, puede usarse para aumentar datasets de entrenamiento de otros modelos con datos de dialogo japones informal.
- Analisis estilometrico: al poder condicionar la generacion por hablante, el modelo sirve como herramienta para estudiar que rasgos linguisticos diferencian a cada usuario (longitud de frase, vocabulario, muletillas).
- Bot de Discord con personalidad propia: integrando el modelo en un bot, se puede generar una voz conversacional consistente que participe en las conversaciones del servidor con el estilo aprendido.
- Generacion de subtitulos o dialogos para ficcion: el modelo produce lenguaje coloquial japones con jerga y expresiones naturales de chats, util como inspiracion para escribir dialogos realistas.
- Investigacion academica sobre modelos de lenguaje pequenos: su arquitectura con PLE y entrenamiento desde cero con datos de dominio muy especifico lo convierte en un caso de estudio para eficiencia de parametros y especializacion extrema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas propias de evaluacion:

| Metrica | evex-5.2 | evex-5.3 |
|---|---|---|
| Acierto en identificacion de hablante (global) | 72.3% (8.5σ) | 75.0% (9.6σ) |
| Acierto en hablantes frecuentes | 75.8% | 78.8% |
| Acierto en hablantes poco frecuentes | 65.6% (3.5σ) | 68.0% (4.1σ) |
| Copia textual (20+ caracteres) | 0.0% | 0.0% |
| Coherencia tematica | 30.0% | 25.0% |

La metrica de acierto en identificacion de hablante mide en que porcentaje de 368 mensajes reales el loss es menor cuando se condiciona con el token del hablante correcto frente al de otro hablante. El valor de 75.0% indica que el modelo ha aprendido rasgos distintivos de cada usuario. La coherencia tematica bajo del 30.0% al 25.0% en esta version, un trade-off deliberado del autor para priorizar la fidelidad estilistica.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (el modelo ocupa aproximadamente 103 MB en safetensors). Cabe en cualquier GPU comercial, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. Una GTX 1050 Ti o superior es mas que suficiente. Tambien es viable inferencia en CPU sin problemas.
- Inferencia en CPU: el autor diseno la arquitectura PLE especificamente para que la inferencia CPU sea eficiente, ya que el incremento de capacidad no penaliza el coste por token.
- Opciones de despliegue: el repositorio incluye un `model.py` con la clase `MicroLM` y un ejemplo de generacion. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. El despliegue seria mediante script Python propio con PyTorch y SentencePiece.
- Latencia y throughput: no disponibles. Dado el tamano del modelo (25,7M parametros), la generacion deberia ser practicamente instantanea incluso en CPU.

## Comparativa con modelos similares

No se han encontrado modelos directamente comparables en la informacion disponible. La especializacion de evex-5.3 (entrenado desde cero para imitar a hablantes de un unico servidor de Discord) no tiene equivalentes publicados en HuggingFace con los que se pueda establecer una comparacion significativa. Los modelos japoneses de tamano similar (como los de la familia PLaMo o ELYZA) son generalistas y no abordan la tarea de imitacion de hablantes especificos. La comparativa queda, por tanto, no disponible.

## Limitaciones y advertencias

- El modelo no es un LLM generalista: esta fuertemente sesgado hacia la jerga, los temas internos y las expresiones de un unico servidor de Discord. No es adecuado como modelo de proposito general en japones.
- No se puede usar para verificacion de hechos: el autor advierte explicitamente que la correccion de las salidas no esta garantizada.
- No tiene filtro de contenido nocivo: ni en los datos de entrenamiento ni en la inferencia. El autor elimino incluso el filtro regex que aplicaba a los datos externos porque era ineficaz y daba una falsa sensacion de seguridad.
- Riesgo de privacidad: aunque los tokens `<|sN|>` son anonimos y no contienen IDs de usuario, el tokenizer conserva en su vocabulario los nombres para mostrar de al menos 16 de los 147 hablantes (7 de los 20 mas activos). Al enumerar el vocabulario se pueden leer estos nombres.
- Riesgo de suplantacion: el modelo puede generar texto que imite el estilo de escritura de personas reales (los usuarios del servidor). Esto podria usarse para suplantacion o fraude si se combina con otros datos.
- El formato de prompt es inusual y propenso a errores: si no se respetan las reglas de ensamblaje (tokens de canal, hablante, `<|conv|>` inicial, `<|end|>` final), la salida es de mala calidad. Los tokens `<|hi|>`, `<|conv|>` y `<|cN|>` deben prohibirse en la generacion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero los datos de entrenamiento incluyen JESC (CC-BY-4.0) y otros datasets con licencias que deben verificarse para cada caso de uso.
- No hay garantias de soporte: es un proyecto personal de un unico autor, sin organizacion detras.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tako080614/evex-5.3
- Dataset Japanese-Roleplay-Dialogues: https://huggingface.co/datasets/OmniAICreator/Japanese-Roleplay-Dialogues
- Dataset JESC: https://huggingface.co/datasets/nntsuzu/JESC
- Dataset open2ch: https://huggingface.co/datasets/p1atdev/open2ch
- Corpus original open2ch: https://github.com/1never/open2ch-dialogue-corpus
