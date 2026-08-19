# tako080614/evex-4

## Resumen

evex-4 es un modelo de lenguaje conversacional en japonés entrenado **desde cero** exclusivamente con los registros de un servidor de Discord. Lo desarrolla el usuario tako080614 y lo publica bajo licencia CC-BY-4.0. A diferencia de la mayoría de modelos que parten de pesos preentrenados, este modelo incluye un tokenizer propio (sentencepiece BPE con byte_fallback) y una arquitectura transformer decoder-only de 18,88 millones de parámetros, con 8 capas, dimensión de modelo 384, 6 cabezas de atención y una ventana de contexto de 1024 tokens.

El modelo resuelve un problema muy específico: generar conversaciones que imiten el estilo y los patrones de interacción de los miembros de un servidor de Discord concreto. Su relevancia radica en ser un caso extremo de especialización: un modelo entrenado únicamente con datos de una comunidad pequeña, sin datos generales de internet, lo que lo convierte en un experimento interesante para estudiar el sobreajuste, la transferencia de estilo y los límites del entrenamiento from-scratch con datos reducidos.

El prompt requiere un formato especial con tokens de control que indican canal, hablante y estructura de la conversación. No es un modelo de propósito general ni sirve para tareas de razonamiento, código o matemáticas. Su utilidad práctica es muy limitada fuera del contexto para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, RMSNorm, SwiGLU, weight tying) |
| Parametros totales | 18.880.896 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japones (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Aplica weight tying entre las capas de embedding y de salida, lo que reduce el número de parámetros. El tokenizer es un sentencepiece BPE con byte_fallback, entrenado también desde cero sobre los registros del servidor, con un vocabulario de 12.288 tokens.

El entrenamiento se realizó en tres etapas. La primera combinó datos externos de conversación japonesa (OmniAICreator/Japanese-Roleplay-Dialogues, nntsuzu/JESC y p1atdev/open2ch) con las conversaciones crudas del servidor, sumando 403.711.060 caracteres. La segunda etapa usó solo los registros del servidor, con aumento de ventana y recorte, totalizando 90.949.883 caracteres. La tercera etapa se centró únicamente en mensajes que recibieron reacciones, con 2.118.256 caracteres. La pérdida de validación final fue de 5.0172 en la época 8.

El modelo define 147 tokens de hablante (`<|s0|>` a `<|s146|>`) que cubren el 96,6% de los mensajes, ordenados por frecuencia de intervención. También incluye tokens para canales, respuestas, URLs, archivos, menciones y código, algunos de los cuales se excluyen de la función de pérdida durante el entrenamiento.

## Capacidades

- Generación de texto conversacional en japonés, limitado al estilo y temática del servidor de Discord original.
- Modelado de conversaciones multi-turno con indicación explícita de hablante y canal mediante tokens especiales.
- Soporte de respuestas (replies) mediante el token `<|re|>` seguido del token del destinatario.
- Normalización de elementos no textuales (URLs, archivos, menciones, canales, horas) que el modelo no genera por sí mismo.
- Capacidad de continuar el discurso de un hablante concreto si se coloca su token al final del prompt.
- No dispone de tool calling, ni capacidades de visión, audio o razonamiento estructurado.

## Casos de uso

- Investigación académica sobre entrenamiento from-scratch con datos de redes sociales: el modelo permite estudiar cómo una comunidad pequeña condiciona el lenguaje aprendido, la deriva de estilo y el sobreajuste.
- Generación de respuestas automáticas en un servidor de Discord específico: si se integra con un bot, puede producir mensajes que imiten el tono y las expresiones de los miembros habituales, siempre que se respete el formato de prompt.
- Análisis de patrones de conversación: al inspeccionar los tokens de hablante y las secuencias generadas, se pueden extraer conclusiones sobre qué usuarios dominan la conversación y qué temas son recurrentes.
- Estudio de sesgos en datos de entrenamiento: el modelo refleja las jergas, temas internos y posibles sesgos del servidor, lo que sirve como caso de estudio para evaluar cómo los datos de origen limitan la generalización.
- Pruebas de técnicas de especialización progresiva: el esquema de entrenamiento en tres etapas (datos externos, datos del servidor, mensajes con reacciones) puede replicarse para otros dominios.
- Demostración de generación de texto con un modelo extremadamente pequeño: con menos de 19 millones de parámetros, sirve para experimentar con técnicas de cuantización, destilación o inferencia en dispositivos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la pérdida de validación (5.0172 en la época 8), sin comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 18,88 millones de parámetros, el modelo ocupa aproximadamente 75 MB en fp32 y unos 19 MB en cuantización de 8 bits. Cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o superiores. También es viable su ejecución en CPU.
- Compatibilidad con hardware de consumo: sí, es perfectamente ejecutable en portátiles o incluso en Raspberry Pi si se usa una cuantización adecuada.
- Opciones de despliegue: el repositorio incluye un `model.py` y un tokenizer, por lo que se puede cargar directamente con PyTorch y safetensors. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo pequeño podría adaptarse.
- Latencia y throughput: no se han publicado datos. Dado el tamaño, la generación debería ser muy rápida incluso en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables. evex-4 es un caso atípico por su entrenamiento exclusivo con datos de un único servidor de Discord y su tamaño reducido. No hay alternativas conocidas con el mismo enfoque en la información proporcionada.

## Limitaciones y advertencias

- El modelo está fuertemente sesgado hacia la jerga, los temas internos y las expresiones propias del servidor de Discord original. No es un modelo de japonés general y su rendimiento en conversaciones estándar será deficiente.
- No se puede utilizar para verificación de hechos ni para tareas que requieran precisión factual. El autor advierte explícitamente que la corrección de las salidas no está garantizada.
- No incluye mecanismos de seguridad en inferencia. La eliminación de contenido dañino se aplicó solo de forma mecánica sobre los datos de entrenamiento, por lo que el modelo puede generar texto ofensivo o inapropiado.
- Los tokens de hablante son anónimos, pero los patrones de escritura de cada usuario quedan codificados en los pesos. Generar texto con un token concreto puede producir frases que se asemejen al estilo de esa persona, lo que plantea riesgos de suplantación.
- El tokenizer conserva nombres de visualización de usuarios frecuentes como tokens individuales. Aunque no se incluye la correspondencia entre tokens y nombres, es posible enumerar el vocabulario y extraer esos nombres, lo que supone un riesgo de privacidad.
- El formato de prompt es muy específico y no sigue ninguna plantilla estándar. Usarlo sin los tokens adecuados produce salidas sin sentido.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo no es adecuado para productos orientados al público general debido a sus limitaciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tako080614/evex-4)
- [Dataset OmniAICreator/Japanese-Roleplay-Dialogues](https://huggingface.co/datasets/OmniAICreator/Japanese-Roleplay-Dialogues)
- [Dataset nntsuzu/JESC](https://huggingface.co/datasets/nntsuzu/JESC)
- [Dataset p1atdev/open2ch](https://huggingface.co/datasets/p1atdev/open2ch)
- [Corpus original open2ch-dialogue-corpus](https://github.com/1never/open2ch-dialogue-corpus)
