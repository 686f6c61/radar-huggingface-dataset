# SubMaroon/Mimesis-26B-A4B

## Resumen

Mimesis-26B-A4B es un ajuste fino experimental del modelo Gemma 4 26B-A4B, desarrollado por el usuario SubMaroon y publicado en Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 25.805.933.872 parámetros totales que, por defecto, activa 16 expertos en lugar de los 8 originales, lo que eleva los parámetros activos hasta aproximadamente 5.200 millones. El objetivo declarado del autor es mejorar la memoria de estado a corto plazo en escenas de rol (roleplay), es decir, que el modelo recuerde el estado *actual* de los elementos de una escena (quién movió qué, qué cambió de manos, qué lleva puesto alguien) en lugar de recurrir a un estado anterior.

El modelo se ha destilado on-policy a partir de Glistening-Gem-31B-v2.1, un modelo de rol de 31B, con el fin de transferir su estilo de escritura manteniendo el conocimiento y las capacidades del Gemma 4 26B-A4B original. La ventana de contexto deslizante se mantiene en 1024 tokens, sin modificar, y el entrenamiento se realizó sobre escenas de rol en inglés y ruso, con aproximadamente un 8% de datos en ruso como ancla.

Es relevante ahora porque aborda un problema concreto y medible en modelos de rol de contexto largo: la confusión entre estados antiguos y nuevos de una escena cuando la distancia entre el cambio y la pregunta se acerca al límite de la ventana deslizante. Los resultados publicados por el autor muestran mejoras claras en esa franja (~1000 tokens), pasando de 5/8 a 16/16 aciertos en inglés y de 4/8 a 11/16 en ruso con 12 expertos. No obstante, se trata de un experimento, no de una ablación de investigación, y su licencia figura como "TODO".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 |
| Parámetros totales | 25.805.933.872 |
| Parámetros activos | ~5.2B (16 expertos por defecto; ~3.8B con 8 expertos) |
| Longitud de contexto | Ventana deslizante de 1024 tokens (sin modificar); entrenamiento con contexto de hasta 8k tokens |
| Tipos de cuantización | No disponible (el repo contiene safetensors; el autor menciona conversiones GGUF y compatibilidad con KoboldCpp) |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | TODO (según el autor, la misma que el modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura MoE de Gemma 4 26B-A4B, con 30 capas de atención y 128 expertos por capa. La innovación principal es la "cirugía de expertos": antes del entrenamiento, el autor mapeó qué expertos se activan con texto de rol frente a código o wiki, en inglés y ruso; elevó los expertos activos de 8 a 12 para el entrenamiento y clonó los expertos más activos en rol en ranuras poco utilizadas (hasta 16 por capa). Cada par padre-clon recibe la mitad del `per_expert_scale` original más algo de ruido, de modo que la salida del modelo apenas cambia al inicio; durante el entrenamiento, un "twin dropout" mantiene aleatoriamente solo uno de los pares cuando ambos son seleccionados, permitiendo que los gemelos divergan. El router mantiene la misma forma y la ventana deslizante no se toca (el autor verificó que ampliarla sin entrenamiento rompe el modelo).

El entrenamiento consistió en destilación on-policy: el profesor es Glistening-Gem-31B-v2.1 (cargado en 4-bit NF4 para caber en el hardware). La mitad de los ejemplos son respuestas escritas por el propio estudiante y puntuadas por el profesor (on-policy); la otra mitad son respuestas de referencia del dataset, también puntuadas por el profesor (off-policy). La pérdida es KL forward hacia los top-256 tokens del profesor en cada posición de la respuesta. Los datos son escenas de rol de un dataset de DeepSeek RP (Indexnusrefather/DSV-4.1-1017-RP-COT) más ~8% de rol en ruso. Se entrenaron todas las atenciones (30 capas), el MLP denso compartido, las normas, el router (LR baja) y los expertos que concentran el 90% del flujo de enrutamiento de rol (~45 de 128 por capa), más todos los clones: unos 12.700 millones de parámetros entrenables. La ejecución fue de 300 pasos × 16 escenas = 4800 escenas, unas 9 horas en 2× RTX PRO 6000 (96 GB), con AdamW en bf16 y redondeo estocástico, LR 5e-6 (router 1e-6), 20 pasos de warmup y decaimiento en el último 15%. La plantilla de chat es la estándar de Gemma 4 en modo no-thinking.

## Capacidades

- Generación de texto y escritura creativa orientada a rol, con un estilo que imita al profesor Glistening-Gem-31B-v2.1.
- Seguimiento de estado a corto plazo en escenas: recuerda quién movió un objeto, qué cambió de manos o qué lleva puesto alguien, especialmente en distancias cercanas al límite de la ventana deslizante de 1024 tokens.
- Capacidades multilingües en inglés y ruso, con ruso limpio (solo un 0.5% de palabras en alfabeto latino en respuestas en ruso, frente al 0.1% antes).
- Seguimiento de formato JSON: 100% en las pruebas del autor.
- Razonamiento y conocimiento general heredados de Gemma 4 26B-A4B (no se detallan capacidades específicas de código o matemáticas en la información disponible).
- No se menciona soporte explícito de tool calling, function calling ni agentes multi-paso en la información proporcionada.
- Modo no-thinking por defecto (bloque de pensamiento vacío antes de cada respuesta), que es el formato con el que se entrenó.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está entrenado específicamente para mantener el estado actual de una escena (posiciones, objetos, vestimenta) durante conversaciones multi-turno, lo que lo hace adecuado para juegos de rol por texto donde la coherencia espacial y de inventario es crítica.
- Ficción interactiva y narrativa ramificada: puede recordar cambios recientes en la trama (quién tiene un objeto, dónde está un personaje) a lo largo de escenas de hasta 16k tokens de contexto, gracias a la mejora medida en la franja de ~1000 tokens.
- Asistentes de escritura creativa en inglés y ruso: su estilo destilado de un modelo de rol de 31B le permite generar diálogos y descripciones con una voz consistente, útil para autores que trabajan en ambos idiomas.
- Generación de diálogos para videojuegos: la capacidad de seguir el estado de la escena y mantener el formato JSON al 100% facilita la integración en motores de diálogo que requieren salidas estructuradas.
- Simulación de personajes para entrenamiento o evaluación: investigadores que estudian la coherencia de estado a corto plazo en modelos de lenguaje pueden usar este modelo como caso de estudio de cirugía de expertos y destilación on-policy.
- Prototipado de chatbots de rol con despliegue local: al ser un MoE de 26B con ~5.2B activos, puede ejecutarse en configuraciones de consumer GPU de gama alta mediante cuantización GGUF y KoboldCpp, según indica el autor.

## Benchmarks y rendimiento

El autor publica una evaluación propia de "scene state test": se mueve un objeto y se pregunta al modelo dónde está ahora; se mide la proporción de respuestas que nombran la ubicación *nueva*, según la distancia entre el cambio y la pregunta. Escenas largas (contexto de 16k); 16 escenas por celda tras el entrenamiento y 8 antes.

| Modelo | Idioma | Global | <300 | 300–700 | ~1000 | ~2500 |
|---|---|---|---|---|---|---|
| Antes del entrenamiento, 12 expertos | en | 0.78 | 1.00 | 1.00 | 0.62 | 0.50 |
| Después, 8 expertos | en | 0.75 | 1.00 | 0.93 | 0.75 | 0.31 |
| Después, 12 expertos | en | 0.83 | 1.00 | 1.00 | 1.00 | 0.31 |
| **Después, 16 expertos** | en | **0.89** | 1.00 | 1.00 | 1.00 | **0.56** |
| Antes del entrenamiento, 12 expertos | ru | 0.75 | 1.00 | 0.88 | 0.50 | 0.62 |
| Después, 8 expertos | ru | 0.75 | 0.88 | 0.94 | 0.62 | 0.56 |
| Después, 12 expertos | ru | 0.84 | 1.00 | 0.94 | 0.69 | 0.75 |
| **Después, 16 expertos** | ru | **0.89** | 1.00 | 1.00 | 0.75 | **0.81** |

El autor advierte que la medición limpia del efecto del entrenamiento son las filas de 12 expertos (mismas escenas, antes y después: en 0.78 → 0.83, ru 0.75 → 0.84, y sobre todo la columna de ~1000 tokens). La base sin entrenar con 16 expertos no se midió en estas escenas. Una sonda anterior de la base sin entrenar (mismas pruebas pero escenas más fáciles) muestra que más expertos ayudan por sí solos:

| Base sin entrenar, sonda anterior | en, global | en, 0.7–1.7k | ru, global | ru, 0.7–1.7k |
|---|---|---|---|---|
| 8 expertos | 0.80 | 0.62 | 0.80 | 0.67 |
| 12 expertos | 0.89 | 0.88 | 0.88 | 0.87 |
| 16 expertos | 0.91 | 0.94 | 0.92 | 0.93 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 25.8B parámetros totales, en bf16 se necesitarían ~51.6 GB de VRAM; en cuantizaciones de 4 bits, alrededor de 13–15 GB, aunque el autor no proporciona cifras concretas.
- GPU recomendadas: el entrenamiento se realizó en 2× RTX PRO 6000 (96 GB). Para inferencia, el autor menciona compatibilidad con KoboldCpp y conversiones GGUF, lo que sugiere que puede ejecutarse en GPU de consumo de gama alta con cuantización.
- ¿Cabe en consumer GPU? Con cuantización GGUF de 4 bits probablemente sí en GPUs con 16–24 GB de VRAM (RTX 4090, RTX 4080, etc.), aunque no hay datos confirmados en la información disponible.
- Opciones de despliegue: GGUF y KoboldCpp (mencionados por el autor); el parámetro `text_config.top_k_experts = 16` se establece en `config.json` y lo recogen automáticamente las conversiones GGUF y KoboldCpp (`Experts = -1`). No se mencionan vLLM, llama.cpp, Ollama ni TGI explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mimesis-26B-A4B | 25.8B | ~5.2B (16 expertos) | Ventana deslizante 1024; entrenado hasta 8k | TODO | Hugging Face (0 descargas) |
| Gemma 4 26B-A4B (base) | 25.8B | ~3.8B (8 expertos) | Ventana deslizante 1024 | Según Gemma 4 | Hugging Face |
| Glistening-Gem-31B-v2.1 (profesor) | 31B | No disponible | No disponible | No disponible | Hugging Face |
| Tetratype/Gemma-4-26B-A4B-it-heretic-antislop (base directo) | 25.8B | ~3.8B | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en benchmarks estándar entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como un experimento, no como una ablación de investigación; los resultados deben interpretarse con cautela.
- La licencia figura como "TODO", lo que impide confirmar los términos de uso comercial; el autor indica que es la misma que la del modelo base, pero no se especifica cuál es.
- Solo soporta inglés y ruso; no hay evidencia de capacidades en otros idiomas.
- La ventana deslizante de 1024 tokens no se ha ampliado; ampliarla sin entrenamiento rompe el modelo, según el autor. El contexto de entrenamiento fue de hasta 8k tokens, pero la ventana deslizante efectiva sigue siendo de 1024.
- Riesgo de alucinación: no se han publicado evaluaciones de alucinación; al ser un modelo de rol destilado, puede generar contenido ficticio coherente pero no verificado.
- Sesgos: no se han documentado sesgos específicos; al entrenarse sobre un dataset de rol de DeepSeek, puede heredar sesgos de ese corpus.
- El modelo está entrenado en modo no-thinking (bloque de pensamiento vacío); no se ha validado su comportamiento en modo thinking.
- El rendimiento en tareas de código, matemáticas o razonamiento general no se ha evaluado en la información disponible; las capacidades heredadas de Gemma 4 no están cuantificadas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SubMaroon/Mimesis-26B-A4B
- Modelo base: https://huggingface.co/Tetratype/Gemma-4-26B-A4B-it-heretic-antislop
- Profesor (destilación): https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
- Dataset de rol: https://huggingface.co/datasets/Indexnusrefather/DSV-4.1-1017-RP-COT
