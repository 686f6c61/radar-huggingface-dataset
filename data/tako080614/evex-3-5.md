# tako080614/evex-3.5

## Resumen

evex-3.5 es un modelo de lenguaje causal de 18,9 millones de parámetros entrenado desde cero (sin pesos preentrenados) por el desarrollador tako080614. Su objetivo es generar conversaciones de rol (roleplay) con el estilo y la idiosincrasia de un servidor de Discord japonés privado, distinguiendo entre 147 hablantes reales mediante tokens especiales. Es la cuarta iteración de la serie evex, tras evex-1, evex-2 y evex-3.

La principal novedad frente a evex-3 es un vocabulario ampliado de 4096 a 12 288 tokens (sentencepiece BPE) y un entrenamiento en dos etapas: primero sobre un corpus público de foros de rol (78 %) combinado con el servidor objetivo (22 %), y después exclusivamente sobre los logs del servidor para fijar el estilo y los hablantes. El modelo usa una arquitectura transformer estándar con RoPE, RMSNorm, SwiGLU y weight tying, con una ventana de contexto de 1024 tokens.

Su relevancia radica en ser un ejemplo extremo de especialización: un modelo minúsculo capaz de imitar la conversación de un grupo concreto de personas, con métricas de coherencia (que el autor llama «噛み合い») que mejoran notablemente respecto a la versión anterior. Sin embargo, el autor advierte explícitamente que no es útil para tareas de conocimiento, cálculo o instrucciones, y que su contenido no es fiable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (RoPE + RMSNorm + SwiGLU + weight tying) |
| Parametros totales | 18 880 896 (embeddings 4,72 M + 8 capas 14,2 M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16, sin GGUF publicados) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT (pesos); datos externos bajo Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con d_model 384, 8 capas, 6 cabezas de atención, contexto de 1024 tokens y normalización RMSNorm. Usa RoPE como posicional, SwiGLU en las FFN y weight tying entre embeddings y cabeza de salida. El vocabulario es un BPE de sentencepiece de 12 288 tokens construido a partir de los logs del servidor, con cobertura 0.9995 y sin split_digits, según las pruebas del autor.

El entrenamiento se realizó en dos etapas. La primera usó 23 267 670 tokens (78 % del dataset público Japanese-Roleplay-Dialogues, 22 % del servidor) durante 3 épocas con lr 1e-3. La segunda usó solo los 19 280 662 tokens del servidor durante 6 épocas con lr 3e-4 decayendo a 1.5e-4. En la etapa externa solo se emplearon roles relativos (`<|a|>` a `<|h|>`) para enseñar la dinámica conversacional, mientras que los tokens de hablante específicos (`<|s0|>` a `<|s146|>`) se reservaron exclusivamente para la etapa final. El autor verificó con un experimento de control que el entrenamiento en dos etapas supera al entrenamiento desde cero en la misma corpus: val loss 4.9405 frente a 5.1017 en la época 3, y una coherencia del 38,3 % frente al 30,0 %.

## Capacidades

- Generacion de texto conversacional en japones con estilo de chat de Discord.
- Distincion de 147 hablantes reales mediante tokens especiales `<|s0|>` a `<|s146|>`, lo que permite imitar la forma de escribir de cada persona.
- Gestion de turnos de conversacion y respuestas con referencias cruzadas mediante tokens `<|re|>`.
- Soporte de roles relativos (`<|a|>` a `<|h|>`) para conversaciones donde no se conoce al interlocutor.
- Capacidad de mantener coherencia tematica: el autor mide que el 45,3 % de las respuestas anonimas contienen palabras de la pregunta (frente al 37,3 % de evex-3).
- Generacion de respuestas de longitud moderada (media de 32 caracteres en modo anonimo).
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso.
- No es capaz de tareas facticas, calculo, traduccion o seguir instrucciones.

## Casos de uso

- Simulacion de conversaciones de rol en un servidor de Discord: el modelo puede generar respuestas de un personaje concreto (token `<|sN|>`) manteniendo el tono y la forma de hablar de esa persona, util para juegos de rol textuales o para rellenar huecos en historias colaborativas.
- Creacion de bots de chat con personalidad especifica: integrando el modelo en un bot de Discord, se puede hacer que responda como un miembro ficticio del servidor, siempre que se indique claramente que no es la persona real.
- Generacion de dialogos de ejemplo para entrenar otros modelos: las conversaciones sinteticas generadas por evex-3.5 pueden usarse como datos aumentados para modelos mas grandes, siempre que se respete la licencia y el aviso sobre los hablantes.
- Estudio de la dinamica conversacional en comunidades pequenas: investigadores pueden analizar como un modelo aprende turnos de palabra, interrupciones y estilos de respuesta a partir de un corpus reducido y homogeneo.
- Prototipado de sistemas de roleplay en japones: para desarrolladores que quieran experimentar con generacion de texto conversacional sin depender de APIs comerciales, este modelo ofrece una alternativa local y ligera.
- Prueba de tecnicas de entrenamiento en dos etapas: el modelo sirve como caso de estudio reproducible para validar estrategias de fine-tuning progresivo con datos mixtos publicos y privados.
- Generacion de respuestas anonimas en foros de rol: usando los roles relativos `<|a|>` a `<|h|>`, el modelo puede participar en hilos de rol sin asociarse a un hablante concreto, manteniendo la coherencia conversacional.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El autor proporciona metricas propias, medidas sobre 150 muestras de validacion del propio servidor, que se resumen a continuacion:

| Metrica (modo anonimo `<|b|>`) | evex-3 | evex-3.5 | Valor de referencia (val) |
|---|---|---|---|
| Coherencia (palabras de la pregunta en la respuesta) | 37,3 % | 45,3 % | — |
| Respuestas de 20+ caracteres | 55,3 % | 60,0 % | 31,2 % |
| Longitud media | 30 caracteres | 32 caracteres | 19 caracteres |
| Palabras desconocidas | 9,9 % | 10,0 % | 14,9 % |
| Copia literal (>=20 caracteres) | 0,0 % | 0,0 % | — |

| Metrica (modo hablante `<|s0|>`) | evex-3 | evex-3.5 |
|---|---|---|
| Coherencia | 24,0 % | 34,0 % |
| Respuestas de 20+ caracteres | 64,7 % | 48,7 % |
| Longitud media | 41 caracteres | 29 caracteres |

Ademas, el autor reporta val loss de 4.9299 (escala sin simbolos) o 5.0206 (bruto) para evex-3.5, y un experimento de control que muestra que el entrenamiento en dos etapas supera al from-scratch en todas las epocas. Estas metricas no son comparables con otros modelos al ser especificas del corpus y de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 18,9 M de parametros; en fp32 ocupa aproximadamente 75 MB, en fp16 unos 38 MB. Cabe en cualquier GPU consumer (incluso en integradas) y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor entreno en una T4-small de HF Jobs (equivalente a una T4) a 55 493 tokens/s, completando el entrenamiento en unos 60 minutos.
- Despliegue en CPU: viable con PyTorch puro, aunque la velocidad dependera del hardware; para uso interactivo se recomienda GPU.
- Opciones de despliegue: no compatible con transformers, vLLM, llama.cpp u Ollama. Requiere cargar el modelo con PyTorch nativo usando el script `model.py` del repositorio GitHub del autor (https://github.com/tako0614/sakana, ruta `scripts/llm/model.py`).
- Latencia y throughput: sin datos publicados para inferencia, pero dado el tamano, se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU moderna.

## Comparativa con modelos similares

La serie evex del mismo autor es la comparacion mas directa:

| Modelo | Parametros | Vocabulario | Contexto | Coherencia (anonimo) | Licencia |
|---|---|---|---|---|---|
| evex-1 | no disponible | no disponible | no disponible | no disponible | MIT |
| evex-2 | 5,87 M | no disponible | no disponible | no disponible | MIT |
| evex-3 | 15,74 M | 4096 | 1024 | 37,3 % | MIT |
| evex-3.5 | 18,88 M | 12 288 | 1024 | 45,3 % | MIT |

No se dispone de modelos comparables fuera de esta serie por su tamano extremadamente reducido y su especializacion en un corpus privado. Modelos generalistas japoneses como rinna-3.6b o ELYZA-japanese-Llama-2-7b son mucho mas grandes y no son comparables en terminos de tarea ni de requisitos.

## Limitaciones y advertencias

- El modelo contiene en sus pesos informacion de 147 personas reales del servidor de Discord. No debe tratarse la salida como si hubiera sido escrita por esas personas.
- Los datos de entrenamiento incluyen conversaciones privadas sin consentimiento explicito de los participantes. El autor no publica los logs ni los IDs de usuario, pero el modelo en si reproduce estilos de escritura.
- No es capaz de tareas facticas, calculo, traduccion ni seguir instrucciones. El autor indica explicitamente que «el contenido no es fiable».
- Riesgo de alucinacion alto en cualquier tema factual; el modelo solo pretende imitar conversacion, no proporcionar informacion veraz.
- Limitaciones de idioma: solo japones; no soporta otros idiomas.
- No funciona con transformers ni con la mayoria de frameworks de inferencia; requiere codigo PyTorch personalizado.
- La licencia MIT cubre los pesos, pero los datos externos (Japanese-Roleplay-Dialogues) son Apache-2.0 y los datos privados del servidor no tienen licencia publica; el uso comercial puede requerir verificacion adicional.
- Tokens especiales como `<url>`, `<file>`, `<mention>`, `<channel>`, `<time>` se excluyen de la perdida; el modelo no debe generarlos por si mismo.
- La ventana de contexto de 1024 tokens es corta para conversaciones largas; el modelo puede perder el hilo en dialogos extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tako080614/evex-3.5
- Modelo anterior evex-3: https://huggingface.co/tako080614/evex-3
- Modelo evex-1: https://huggingface.co/tako080614/evex-1
- Modelo evex-2: https://huggingface.co/tako080614/evex-2
- Repositorio del codigo de entrenamiento (model.py): https://github.com/tako0614/sakana
- Dataset externo usado en la etapa 1: https://huggingface.co/datasets/OmniAICreator/Japanese-Roleplay-Dialogues
