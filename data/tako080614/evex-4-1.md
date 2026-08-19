# tako080614/evex-4.1

## Resumen

evex-4.1 es un modelo de lenguaje conversacional en japonés, entrenado desde cero (from-scratch) por el desarrollador tako080614, exclusivamente a partir de los registros de un servidor de Discord. A diferencia de la mayoría de modelos actuales, no deriva de pesos preentrenados: tanto el tokenizer como los pesos se construyeron específicamente para reproducir el estilo de conversación de esa comunidad concreta.

Con 18.880.896 parámetros (8 capas, d_model 384, 6 cabezas de atención) y una ventana de contexto de 1024 tokens, es un modelo extremadamente ligero que cabe en cualquier hardware consumer. Su relevancia radica en demostrar que es viable entrenar un modelo conversacional especializado desde cero con un volumen de datos modesto (unos 617 millones de caracteres en total), utilizando un vocabulario propio de 12.288 tokens y un formato de prompt simbólico que codifica canales, hablantes y estructura de la conversación.

El modelo está pensado como experimento de investigación y para uso dentro del ecosistema del servidor original. No es un modelo generalista: su registro, vocabulario y temáticas están fuertemente sesgados hacia la jerga y los temas internos de esa comunidad. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE + RMSNorm + SwiGLU), weight tying |
| Parametros totales | 18.880.896 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors en fp32, 0.1 GB) |
| Idiomas soportados | Japones |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (acompanado de model.py y tok.model) |

## Arquitectura y entrenamiento

evex-4.1 es un transformer decoder-only de 8 capas con d_model 384 y 6 cabezas de atencion. Usa RoPE (rotary position embeddings), RMSNorm y SwiGLU como funcion de activacion, ademas de weight tying entre la capa de embedding y la cabeza de salida (el peso de `head.weight` se copia desde `embed.weight` al cargar el modelo). El tokenizer es un SentencePiece BPE con byte_fallback y un vocabulario de 12.288 piezas, entrenado tambien desde cero con los logs del servidor.

El entrenamiento se realizo en dos etapas secuenciales. La primera etapa uso una mezcla de datos externos de conversacion japonesa (OmniAICreator/Japanese-Roleplay-Dialogues, nntsuzu/JESC y p1atdev/open2ch) junto con los logs sin procesar del servidor, sumando 489.523.255 caracteres. La segunda etapa se entreno exclusivamente con los logs del servidor (128.400.294 caracteres), incluyendo ventanas de contexto aumentadas y recortes. Los mensajes que recibieron reacciones (22.667 en total) se sobremuestrearon en la segunda etapa para reforzar las respuestas que la comunidad considero valiosas. La perdida de validacion final fue de 5.2162 en la epoca 8.

El modelo utiliza un formato de prompt unico basado en tokens simbolicos: `<|conv|>` marca el inicio de una conversacion, `<|end|>` su fin, `<|c0|>` a `<|c15|>` identifican canales, `<|s0|>` a `<|s146|>` representan a los 147 hablantes mas activos (anonimos, ordenados por frecuencia de mensajes), y `<|re|>` indica una respuesta a un mensaje previo. Los tokens `<|url|>`, `<|file|>`, `<|mention|>`, `<|channel|>` y `<|time|>` se usan para normalizar contenido y se excluyeron de la funcion de perdida durante el entrenamiento.

## Capacidades

- Generacion de texto conversacional en japones con registro coloquial de chat.
- Modelado de conversaciones multi-turno con estructura de canal, hablante y respuestas anidadas.
- Continuacion de una conversacion dado un prompt con el formato simbolico correcto (se anade el token del hablante deseado al final).
- Reproduccion del estilo de escritura de los 147 hablantes mas frecuentes del servidor (de forma anonima, sin asociar identidades).
- Manejo de elementos normalizados como URLs, archivos, menciones, canales y marcas de tiempo (aunque el modelo no los genera por si mismo).
- Capacidad de generar codigo dentro de bloques marcados con `<code>` y `</code>`.
- No dispone de tool calling, function calling, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Recreacion de conversaciones para analisis sociolinguistico: el modelo permite simular interacciones con el registro y las convenciones de un servidor de Discord japones, util para estudiar patrones de conversacion en comunidades online.
- Generacion de datos sinteticos de entrenamiento: las salidas pueden usarse como corpus aumentado para entrenar modelos mas grandes en registro conversacional japones, siempre que se filtre y supervise el resultado.
- Prototipo de chatbot de nicho: para una comunidad concreta, puede servir como base de un bot que responda con el estilo y las referencias internas de ese grupo, aunque requiere integrar una capa de moderacion externa.
- Investigacion sobre entrenamiento from-scratch con datasets pequenos: es un caso de estudio documentado de como entrenar un modelo util con menos de 20M de parametros y datos de dominio especifico.
- Evaluacion de tokenizacion especializada: el tokenizer, entrenado con logs de chat, es un ejemplo de como adaptar el vocabulario a un dominio concreto (incluye nombres de usuario frecuentes como tokens unicos).
- Herramienta de escritura creativa para dialogos: puede generar intercambios de chat con estructura realista (canales, respuestas, hilos) para guiones o prototipos de ficcion interactiva.
- Demo educativa de transformers pequenos: por su tamano y codigo de inferencia incluido (`model.py`), es util como ejemplo didactico de un modelo causal entrenado desde cero con safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion de 5.2162 en la epoca 8 durante el entrenamiento. No hay comparaciones con otros modelos (MMLU, HumanEval, GSM8K, etc.) ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (el modelo pesa aproximadamente 75 MB en pesos). Con cuantizacion a int8 o fp16 cabria en menos de 200 MB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (GTX 1050 Ti, RTX 2060, etc.). Tambien se puede ejecutar en CPU sin problemas practicos de latencia.
- Cabe en cualquier GPU consumer actual, incluida la Raspberry Pi con suficiente RAM (el modelo completo ocupa unos 75 MB en RAM).
- Opciones de despliegue: el repositorio incluye `model.py` y `tok.model` para cargar el modelo con PyTorch y safetensors directamente. No se proporcionan archivos GGUF ni integraciones con llama.cpp, Ollama o vLLM, aunque al ser un modelo estandar de transformer podria adaptarse con modificaciones.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera una generacion de decenas de tokens por segundo incluso en CPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. Al tratarse de un experimento de nicho entrenado desde cero con datos de un solo servidor, no existe una categoria estandar de modelos comparables. Como referencia orientativa, modelos japoneses pequenos generalistas como rinna/japanese-gpt-neox-small (110M parametros) o line-japanese-small (59M) son mas grandes y generalistas, pero no comparten el enfoque from-scratch ni el dominio especifico. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgo extremo hacia el registro coloquial y los temas internos de un unico servidor de Discord. No es adecuado como modelo general de japones.
- Riesgo de alucinacion alto: el autor advierte explicitamente que la salida no es fiable para verificacion de hechos.
- Sin mecanismos de seguridad en inferencia: la unica filtracion de contenido danino se aplico mecanicamente sobre los datos de entrenamiento, pero no hay capa de moderacion en el modelo.
- Privacidad: el tokenizer contiene nombres de usuario reales del servidor (16 de los 147 hablantes mas frecuentes tienen su nombre como token unico). Aunque los tokens `<|sN|>` son anonimos, los nombres son legibles si se inspecciona el vocabulario.
- Formato de prompt muy peculiar: si no se siguen las reglas de ensamblaje (canal antes de `<|conv|>`, tokens de hablante intercalados, etc.), el modelo produce salidas sin sentido. No es compatible con chat templates estandar.
- La generacion debe detenerse en `<|end|>` o en el siguiente token de hablante; de lo contrario, el modelo continua inventando intervenciones de otros usuarios.
- Licencia CC-BY-4.0: permite uso comercial y modificacion, pero exige atribucion y no ofrece garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tako080614/evex-4.1
- Dataset OmniAICreator/Japanese-Roleplay-Dialogues: https://huggingface.co/datasets/OmniAICreator/Japanese-Roleplay-Dialogues
- Dataset nntsuzu/JESC: https://huggingface.co/datasets/nntsuzu/JESC
- Dataset p1atdev/open2ch: https://huggingface.co/datasets/p1atdev/open2ch
- Repositorio original de open2ch-dialogue-corpus: https://github.com/1never/open2ch-dialogue-corpus
