# tako080614/evex-5

## Resumen

evex-5 es un modelo de lenguaje conversacional en japonés de 25,7 millones de parámetros, desarrollado por tako080614, entrenado desde cero exclusivamente con los registros de un servidor de Discord. No deriva de pesos preentrenados existentes: tanto el tokenizer como los pesos se construyeron específicamente para esta comunidad, lo que lo convierte en un experimento singular de entrenamiento desde cero con datos de una comunidad concreta.

El modelo emplea una arquitectura decoder-only transformer con 8 capas, dimensión de modelo 384, 6 cabezas de atención y una ventana de contexto de 1024 tokens. Incorpora varias innovaciones técnicas como PLE (Per-Layer Embeddings) similar a Gemma 3n, QK-norm y weight tying. Su relevancia radica en demostrar que es posible entrenar un modelo útil para una comunidad específica con un presupuesto computacional mínimo, y en explorar técnicas de eficiencia como las capas de embeddings por capa.

A diferencia de los modelos instruct convencionales, evex-5 utiliza un formato de prompt propio basado en tokens simbólicos que representan canales, hablantes, reacciones y otros elementos de la conversación de Discord. Esto lo hace inadecuado para tareas generales, pero muy efectivo para generar conversaciones que imitan el estilo y las dinámicas del servidor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (RoPE + RMSNorm + SwiGLU, QK-norm, weight tying, PLE) |
| Parametros totales | 25.763.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japones (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

evex-5 es un transformer decoder-only de 8 capas con dimensión de modelo 384, 6 cabezas de atención y ventana de contexto de 1024 tokens. Utiliza rotación posicional RoPE, normalización RMSNorm, activación SwiGLU y weight tying entre las capas de embedding y salida. Incorpora dos innovaciones destacadas: PLE (Per-Layer Embeddings) con dimensión 64, que añade vectores auxiliares por token y capa mediante una tabla de consulta en lugar de multiplicación de matrices, aumentando la capacidad un 36 % con solo un 3 % más de cómputo por token; y QK-norm, que aplica RMSNorm a las proyecciones q y k antes de RoPE.

El entrenamiento se realizó en dos etapas. La primera combinó datos externos de conversación (Japanese-Roleplay-Dialogues, JESC y open2ch) con conversaciones crudas del servidor, sumando 489.523.351 caracteres. La segunda etapa usó exclusivamente los registros del servidor, con aumento de ventana y recorte, totalizando 129.628.765 caracteres. Las 22.667 intervenciones con reacción se sobremuestrearon en la segunda etapa para reforzar el aprendizaje de mensajes populares. El vocabulario se construyó con sentencepiece BPE (12.288 tokens, con byte_fallback) a partir de los logs del servidor. La pérdida de validación final fue de 6,8934 en la época 8.

## Capacidades

- Generacion de texto conversacional en japones imitando el estilo de un servidor de Discord especifico.
- Soporte de un formato de prompt simbolico que codifica canal, hablante, respuestas, reacciones y elementos como URLs, archivos, menciones y codigo.
- Capacidad de continuar conversaciones multi-turno respetando los turnos de los hablantes.
- Generacion de mensajes con estilo de roleplay japones, gracias a los datos de Japanese-Roleplay-Dialogues.
- No soporta tool calling ni funciones de agente; su uso esta restringido al formato de conversacion definido.
- Capacidad multilingue limitada al japones; no se ha evaluado en otros idiomas.

## Casos de uso

- Simulacion de conversaciones de Discord: el modelo puede generar respuestas que imitan las dinamicas de un servidor concreto, util para crear bots de chat con personalidad propia o para estudiar patrones de conversacion.
- Generacion de roleplay en japones: gracias a los datos de entrenamiento de roleplay, puede producir dialogos de ficcion con estilo natural, aunque limitado al registro coloquial del servidor.
- Experimentacion con entrenamiento desde cero: su pequeno tamano (25,7 M de parametros) y su arquitectura eficiente lo convierten en un banco de pruebas para investigar tecnicas como PLE, QK-norm o weight tying en entornos con recursos limitados.
- Analisis de estilos de comunicacion: al estar entrenado en una comunidad concreta, puede usarse para estudiar como se expresan los usuarios en terminos de jerga, muletillas y patrones de interaccion.
- Prototipado de asistentes conversacionales especializados: aunque no es apto para produccion general, puede servir como base para desarrollar chatbots de nicho que requieran un tono informal y especifico.
- Generacion de datos sinteticos de conversacion: puede producir dialogos sinteticos en japones coloquial para aumentar conjuntos de datos de entrenamiento de otros modelos, siempre que se respete la licencia CC-BY-4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion de 6,8934 en la epoca 8, sin comparacion con otros modelos.

## Requisitos de hardware

- Con solo 25,7 millones de parametros, el modelo cabe en cualquier GPU moderna, incluso en tarjetas de gama de entrada con menos de 1 GB de VRAM.
- Puede ejecutarse en CPU sin problemas; la model card incluye un ejemplo de inferencia con PyTorch en CPU.
- No se han publicado requisitos especificos de VRAM ni mediciones de latencia o throughput.
- Opciones de despliegue: el repositorio proporciona un script Python con PyTorch y safetensors; no se mencionan integraciones con vLLM, Ollama, llama.cpp u otros frameworks.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, dado que evex-5 es un experimento unico entrenado desde cero con datos de una comunidad especifica, sin equivalentes directos en cuanto a tamano, arquitectura o proposito.

## Limitaciones y advertencias

- El modelo esta fuertemente sesgado hacia la jerga, las referencias internas y los temas de conversacion del servidor de Discord original; no es adecuado como modelo de japones general.
- No se han implementado mecanismos de seguridad en inferencia; puede generar contenido ofensivo o inapropiado si se le provoca.
- La correccion factual no esta garantizada; no debe usarse para verificacion de hechos ni tareas que requieran precision.
- Los nombres de usuario frecuentes pueden aparecer como tokens individuales en el vocabulario del tokenizer, lo que plantea consideraciones de privacidad si se expone el modelo.
- El formato de prompt es exclusivo y requiere seguir estrictamente las reglas de ensamblaje documentadas; un uso incorrecto produce salidas incoherentes.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero los datos de entrenamiento incluyen conjuntos con licencias mixtas (Apache-2.0 y CC-BY-4.0), por lo que conviene revisar los terminos de cada fuente.
- El modelo no soporta tool calling, agentes ni funciones avanzadas; su alcance se limita a la generacion de conversaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tako080614/evex-5
- Dataset Japanese-Roleplay-Dialogues: https://huggingface.co/datasets/OmniAICreator/Japanese-Roleplay-Dialogues
- Dataset JESC: https://huggingface.co/datasets/nntsuzu/JESC
- Dataset open2ch: https://huggingface.co/datasets/p1atdev/open2ch
- Corpus open2ch-dialogue-corpus (fuente original): https://github.com/1never/open2ch-dialogue-corpus
