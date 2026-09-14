# ykumards/smollm2-135m-bedtime-stories

## Resumen

SmolLM2-135M bedtime stories es un ajuste fino (fine-tune) de HuggingFaceTB/SmolLM2-135M-Instruct, publicado por el usuario ykumards, especializado en una única tarea: convertir una nota breve —una palabra, una lista de tareas o unas líneas de diario— en un cuento corto y amable para leer antes de dormir. El modelo forma parte del proyecto unremarkable, un motor de inferencia que lo ejecuta íntegramente en una reMarkable 2: el usuario rodea con un círculo su escritura a mano, pulsa un botón y la historia aparece escrita en la propia tableta, sin conexión a la nube.

Técnicamente es un transformer decoder-only de arquitectura tipo Llama (etiqueta `llama` en el repositorio) con 134.515.008 parámetros reales, es decir, 134,5 millones, y un repositorio de solo 0,4 GB. Hereda del modelo base la ventana de contexto y la tokenización de SmolLM2, pero sustituye el comportamiento conversacional generalista por una plantilla de prompt muy estrecha: un único turno de usuario sin turno de sistema, con la respuesta forzada a empezar por «Once upon a time, there was a little» y terminada en `<|im_end|>`.

Su relevancia es doble. Por un lado, demuestra que un modelo de 135 M es suficiente para una tarea narrativa concreta si el ajuste fino se hace con datos sintéticos filtrados con criterios estrictos: el autor reporta 48/48 de fidelidad a la idea clave frente a 32/48 del modelo base. Por otro lado, es un ejemplo práctico de despliegue en el extremo: 171 MiB de memoria, 5 s hasta el primer token y 6,4 tokens/s en dos núcleos Cortex-A7, lo que lo sitúa en la categoría de modelos on-device para hardware sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, tipo Llama (etiqueta `llama`); fine-tune de SmolLM2-135M-Instruct |
| Parámetros totales | 134.515.008 (134,5 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens según la ficha del modelo base SmolLM2-135M; no se especifica en la model card de este fine-tune |
| Tipos de cuantización | Pesos publicados sin cuantizar (safetensors); el autor distribuye además una versión Q8_0 en el formato propio del motor unremarkable (`story-q8.bin`). No se publican GGUF ni GPTQ/AWQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,4 GB); Q8_0 propietario para unremarkable |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Longitud de salida recomendada | 300 tokens nuevos como máximo; historias de 70-120 palabras en entrenamiento, 60-180 admitidas |
| Parámetros de muestreo recomendados | temperature 0.5, top-p 0.9 |
| Entrada máxima práctica | Texto del cuaderno por debajo de ~120 palabras |
| Fecha de publicación | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base: un transformer decoder-only autorregresivo con atención causal, normalización RMSNorm y tokenizador propio de SmolLM2, sin mezcla de expertos, sin capas recurrentes y sin mecanismos híbridos. El fine-tune no altera la topología, solo los pesos. La innovación no está en la arquitectura sino en el formato de interacción y en la construcción del dataset: la plantilla incluida en el repositorio elimina el turno de sistema que SmolLM2 inserta por defecto, porque el modelo nunca lo vio durante el entrenamiento, y el autor recomienda concatenar manualmente la apertura fija «Once upon a time, there was a little» para evitar que el modelo derive hacia la segunda persona.

Los datos de entrenamiento son 56.910 pares sintéticos generados con Qwen3.5-9B (cuantizado AWQ, servido con vLLM). Cada par combina un texto de cuaderno —una palabra suelta, una frase, una lista, una nota, una entrada de diario o una línea copiada— escrito desde una persona, un estado de ánimo y un día aleatorios, con un cuento de unas 70 a 120 palabras que debe girar en torno a la «clave» del texto, tener una trama pequeña que se resuelva y evitar palabras de estado de ánimo tópicas y cierres en los que alguien se duerme. El filtrado descartó los pares cuya historia perdía la clave, abusaba de términos como «soft», «warm» o «cozy», mencionaba el cuaderno o se salía del rango de 60 a 180 palabras, dejando 53.663 pares (94%). Un 15% de los prompts se corrompió con erratas simulando escritura a mano.

La receta es de una sola época sobre dos copias de los pares (105.000 ejemplos), con la función de pérdida aplicada únicamente a la historia, AdamW a 1e-4 con decaimiento coseno, autocast en bf16 y lotes de 8.192 tokens, todo sobre una única RTX 4090. No se documenta ninguna fase de RLHF ni de DPO, ni decodificación especulativa.

## Capacidades

- Generación de narrativa corta en inglés: convierte una nota de entrada en un cuento de aproximadamente 60-180 palabras con planteamiento, nudo y desenlace.
- Fidelidad a la idea clave: en la evaluación del autor mantiene el elemento central del texto original en 48/48 generaciones.
- Control de estilo: 0,2 palabras de estado de ánimo por cada 100 palabras, frente a 1,2 del modelo base y 9,7 de un fine-tune de diario anterior.
- Evita el cierre redundante: solo 3 de 48 historias terminan con alguien durmiéndose, frente a 46/48 del fine-tune de diario previo.
- Ausencia de fugas de contexto: 0 menciones del cuaderno en la evaluación, frente a 2 y 3 en los modelos comparados.
- Robustez ante erratas: se entrenó con un 15% de prompts con errores tipográficos de estilo manuscrito.
- Seguimiento estricto de una plantilla de prompt: funciona con un único turno de usuario y sin turno de sistema.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo de pensamiento.
- Monolingüe: solo inglés.
- No se documenta capacidad de conversación multi-turno; el diseño es de un disparo por historia.

## Casos de uso

- Cuentos para dormir en una reMarkable 2: es el caso de uso nativo del proyecto unremarkable. El usuario rodea con un círculo un fragmento de su escritura a mano y el modelo genera la historia en el propio dispositivo en unos 30 s, con 171 MiB de memoria y sin enviar nada a la nube.
- Aplicación móvil offline de cuentos personalizados: el modelo cabe en cuantización INT8 en unos 135 MB de pesos, por lo que puede embeberse en una app de Android o iOS y generar un cuento a partir de la nota de diario del día sin conexión.
- Cuadernos digitales, e-readers y tabletas de tinta electrónica: cualquier dispositivo con CPU ARM de dos núcleos puede ejecutarlo; la latencia medida en Cortex-A7 (5 s al primer token, 6,4 tokens/s) es suficiente para una interacción de escritura.
- Transformación creativa de notas de diario: convierte listas de tareas, apuntes sueltos o frases sueltas en microficción, útil en aplicaciones de journaling que quieran ofrecer una vista literaria de las notas del usuario.
- Generación de material infantil bajo demanda: con temperature 0.5 y top-p 0.9 produce historias breves y sencillas a partir de un objeto, un animal o un lugar escrito por el niño, con vocabulario simple y sin palabras de estado de ánimo forzadas.
- Docencia y prototipado de fine-tuning: el dataset sintético completo (53.663 pares), la receta (una época, AdamW 1e-4, bf16, lotes de 8.192 tokens) y el coste (una sola RTX 4090) convierten este repositorio en un caso reproducible para enseñar ajuste fino de modelos pequeños.
- Investigación sobre filtrado de datasets sintéticos: los criterios de descarte (pérdida de la clave, palabras tópicas, mención del cuaderno, rango de longitud) y su efecto medido (94% de supervivencia, mejora de 32/48 a 48/48) sirven como referencia metodológica.
- Pruebas de integración de infraestructura de inferencia: sus 0,4 GB y su compatibilidad declarada con text-generation-inference y endpoints_compatible lo hacen útil para validar pipelines de despliegue con un coste de recursos mínimo.
- Asistentes creativos integrados en hardware de bajo consumo: cualquier dispositivo con 256 MB de RAM libre puede ejecutarlo, incluidas Raspberry Pi, relojes o dispositivos de domótica con pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. El autor sí publica una evaluación propia sobre 24 selecciones escritas a mano —nunca generadas—, con dos semillas por selección, a temperature 0.8, ejecutando el motor Q8 y sin la apertura fija:

| Modelo | Conserva la clave | Termina durmiendo al protagonista | Palabras de estado de ánimo por 100 | Fugas del cuaderno |
|---|---|---|---|---|
| SmolLM2-135M-Instruct | 32/48 | 8/48 | 1,2 | 2 |
| Un fine-tune de diario anterior | 38/48 | 46/48 | 9,7 | 3 |
| Este modelo | 48/48 | 3/48 | 0,2 | 0 |

Rendimiento en el dispositivo objetivo (reMarkable 2, dos núcleos Cortex-A7, cuantización Q8_0): 5 s hasta la primera palabra, 6,4 tokens/s y aproximadamente 30 s por historia, con un consumo de 171 MiB de memoria. No se han publicado cifras de throughput en GPU.

## Requisitos de hardware

- Pesos en FP32: unos 538 MB (134,5 M de parámetros × 4 bytes).
- Pesos en BF16/FP16: unos 269 MB, el formato de los safetensors publicados.
- Pesos en INT8/Q8: unos 135 MB; 171 MiB de memoria total en ejecución en el motor unremarkable sobre reMarkable 2.
- Pesos en INT4: en torno a 70-90 MB, aunque no se publica una versión cuantizada a 4 bits.
- Cabe en cualquier GPU de consumo e incluso en GPU integradas: una GTX 1050 o una iGPU moderna son suficientes. No necesita A100, H100 ni RTX 4090; el autor usó una RTX 4090 únicamente para el entrenamiento.
- Cabe en CPU: dos núcleos Cortex-A7 a baja frecuencia sostienen 6,4 tokens/s, por lo que cualquier x86 moderno o Raspberry Pi lo ejecuta con holgura.
- Opciones de despliegue: `transformers` es la ruta documentada por el autor; el repositorio declara compatibilidad con text-generation-inference y endpoints compatibles, y puede servirse con vLLM. Para CPU conviene convertirlo a GGUF y usar llama.cpp u Ollama, aunque no se publica ningún GGUF listo para usar. El proyecto unremarkable incluye su propio motor con los ficheros `unremarkable/story-q8.bin` y `unremarkable/story-q8.tok`.
- Latencia y throughput: 5 s hasta el primer token y 6,4 tokens/s en reMarkable 2; ~30 s por historia completa. En GPU no hay cifras publicadas.
- Memoria recomendada: 512 MB libres son suficientes en cualquier configuración; en BF16 basta con 1 GB de RAM o VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento en la tarea de cuentos | Disponibilidad |
|---|---|---|---|---|---|---|
| smollm2-135m-bedtime-stories (este modelo) | 134,5 M | 8.192 tokens (heredado del base) | Apache 2.0 | Inglés | 48/48 conserva la clave; 0,2 palabras de estado de ánimo por 100; 3/48 terminan durmiendo | Pesos safetensors en HuggingFace, 0 descargas |
| SmolLM2-135M-Instruct (modelo base) | 134,5 M | 8.192 tokens | Apache 2.0 | Inglés (multilingüe parcial) | 32/48 conserva la clave; 1,2 palabras de estado de ánimo por 100; 8/48 terminan durmiendo | Ampliamente disponible |
| Fine-tune de diario anterior (sin identificar en la información) | No disponible | No disponible | No disponible | No disponible | 38/48; 9,7 palabras por 100; 46/48 terminan durmiendo | No disponible |

No se dispone de datos verificados de otros modelos comparables (por ejemplo alternativas de ~135 M a ~500 M parámetros) en la información proporcionada, ni de evaluaciones de estos modelos en la misma tarea, por lo que solo el modelo base y el fine-tune de diario anterior admiten comparación directa. Cualquier comparación con modelos de propósito general de tamaño similar sería metodológicamente inválida: la tarea de este modelo está deliberadamente acotada a la generación de cuentos breves a partir de notas en inglés.

## Limitaciones y advertencias

- Es un modelo de 135 M: mantiene el tema, pero el desarrollo intermedio puede desviarse y comete errores factuales o de sentido común, como pingüinos con plumas naranjas o interpretar «Miss grandpa today» como un nombre propio.
- No entiende el humor ni el sarcasmo; las entradas irónicas se tratarán de forma literal.
- No ofrece consuelo real: ante notas duras («Mamá está en el hospital. Tengo miedo») mantiene un tono amable pero no puede acompañar emocionalmente. El autor advierte explícitamente de que no sustituye hablar con alguien.
- Dependencia fuerte de la plantilla de prompt: exige un único turno de usuario, sin turno de sistema, y la respuesta debe iniciarse con «Once upon a time, there was a little». Sin esa apertura, el modelo tiende a divagar en segunda persona.
- Límite práctico de entrada: el texto del cuaderno no debería superar las 120 palabras; el entrenamiento se hizo con entradas mucho más cortas.
- Solo inglés. El modelo base tiene cierto multilingüismo residual, pero este fine-tune se entrenó exclusivamente con datos en inglés y no se evaluó en otros idiomas.
- Datos de entrenamiento totalmente sintéticos, generados por Qwen3.5-9B: hereda los sesgos y las pautas estilísticas del generador, además de los posibles sesgos culturales de los cuentos infantiles occidentales.
- Riesgo de alucinación contenido pero real: al ser narrativa de ficción, las «alucinaciones» son el comportamiento esperado; no debe usarse como fuente de información factual.
- Licencia Apache 2.0, igual que el modelo base, por lo que permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se atribuya correctamente. No se documentan restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, y fue publicado recientemente: no hay validación independiente de los resultados más allá de la evaluación del propio autor.
- No hay versiones cuantizadas a 4 bits publicadas ni ficheros GGUF oficiales, lo que obliga a convertir los pesos para desplegarlo fuera de `transformers`.
- La evaluación publicada se hizo con 24 entradas escritas a mano, dos semillas cada una, sobre el motor Q8; es una muestra pequeña y no sustituye a un conjunto de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ykumards/smollm2-135m-bedtime-stories
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio del proyecto unremarkable: https://github.com/ykumards/unremarkable
- Código de entrenamiento: https://github.com/ykumards/unremarkable/tree/main/train
- Paper del modelo base SmolLM2 (referencia externa, no procedente de la búsqueda): https://arxiv.org/abs/2502.02737
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su autor o el proyecto unremarkable; los resultados obtenidos eran foros sin relación con el tema.
