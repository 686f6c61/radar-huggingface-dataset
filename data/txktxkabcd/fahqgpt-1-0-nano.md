# txktxkabcd/fahqgpt-1.0-nano

## Resumen

FahQgpt 1.0 Nano es un modelo de lenguaje de tipo transformer decoder, entrenado desde cero (sin pesos preentrenados) por el usuario de Bilibili @一片烂海苔 y publicado en HuggingFace bajo el identificador txktxkabcd/fahqgpt-1.0-nano. Se trata de un modelo deliberadamente diminuto: la model card declara 145,9M paramétros y el recuento de safetensors de HuggingFace reporta 174.584.704, con 14 capas, dimensión oculta de 896 y una ventana de contexto de 1024 tokens. Su interés no es la calidad de sus respuestas, sino que demuestra que es posible recorrer el ciclo completo de un LLM —preparación de datos, entrenamiento de tokenizador BPE, preentrenamiento, annealing, preentrenamiento conversacional, SFT con pérdida mixta y cuantización— en una única GPU de consumo.

El modelo se apoya en una arquitectura estilo LLaMA con RMSNorm, RoPE, atención GQA de 14 cabezas de consulta y 2 de clave-valor, SwiGLU y weight tying, entrenada en bf16 con `torch.compile` sobre una RTX 5060 Ti de 16 GB durante 13,45 horas y aproximadamente 1,9B tokens. El resultado es un modelo conversacional en inglés cuyo autor sitúa, de forma explícita, en la liga de GPT-2 small (124M): sabe presentarse, mantener una charla sencilla y producir texto coherente, pero falla en preguntas factuales, no razona y no escribe código.

Su relevancia actual es fundamentalmente metodológica y educativa. La model card documenta tres hallazgos reproducibles de interés para quien trabaje con modelos pequeños: que usar tokens especiales de rol con enmascarado de pérdida fracasa a esta escala (loss atascada en 10,37 y colapso a `':::'`), que el corpus de preentrenamiento debe contener diálogo (un 83,4% de FineWeb-Edu sin conversaciones hace inútil el SFT posterior) y que el SFT debe mezclar texto general (60% por lote) para evitar que la distribución de salida se estreche y el entrenamiento colapse. Estas observaciones son coherentes con las conclusiones de CLASS-IT (COLING 2025) para modelos del mismo orden de magnitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo LLaMA: RMSNorm, RoPE, GQA, SwiGLU y weight tying |
| Parametros totales | 174.584.704 según el recuento de safetensors de HuggingFace; la model card declara 145,9M. La diferencia (28,68M) equivale a la matriz de embeddings de 32.002 x 896, un patrón coherente con el recuento duplicado del peso atado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens; el ejemplo de despliegue del autor arranca el servidor con `-c 512` |
| Tipos de cuantizacion | GGUF F16 (350 MB) y GGUF Q4_K_M (137 MB) publicados; se pueden generar otras variantes con llama.cpp |
| Idiomas soportados | inglés (la model card declara `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); HuggingFace reporta el recuento de parametros a partir de safetensors |
| Capas / dimension oculta | 14 / 896 |
| Cabezas de atencion | 14 de consulta y 2 de clave-valor (GQA), con dimensión de cabeza 64 |
| Vocabulario | 32.002 tokens, BPE byte-level entrenado desde cero |
| Tokens de entrenamiento | 1.899.888.640 (aproximadamente 1,9B) |
| Pasos de preentrenamiento | 14.495 |
| Precision de entrenamiento | bf16 con `torch.compile` |
| Hardware de entrenamiento | una RTX 5060 Ti de 16 GB; 13,45 horas de preentrenamiento |
| Formato de dialogo | texto plano (`User: ...` / `Assistant: ...`), sin tokens especiales de rol |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de 14 capas y 896 dimensiones ocultas, sin mezcla de expertos ni componentes de estado recurrente. Usa RMSNorm para la normalización, RoPE para la codificación posicional, GQA con 14 cabezas de consulta y 2 de clave-valor (ratio 7:1) para reducir el coste del caché KV, y SwiGLU como función de activación en el bloque feed-forward. El peso de la matriz de embeddings está atado al de la proyección de salida. El tokenizador es un BPE byte-level de 32.002 entradas entrenado específicamente para este modelo, con el corpus mayoritariamente en inglés.

El pipeline de entrenamiento se ejecutó íntegramente desde cero, sin ningún peso preentrenado, y consta de: preparación de datos, entrenamiento del tokenizador, preentrenamiento de 14.495 pasos, una fase de annealing con el learning rate decayendo hasta cero, un preentrenamiento conversacional adicional de 15.000 pasos sobre 339.389 conversaciones (101M tokens) mezcladas con un 40% del corpus original, y un SFT de 1.800 pasos con pérdida mixta que combina instrucciones con un 60% de texto general por lote. La mejor pérdida de validación reportada es 3,0143. El corpus de preentrenamiento se compone de fineweb-edu-dedup (83,4%), cosmopedia (6,8%), openwebmath (6,4%) y wikipedia (3,2%), y la fase conversacional y el SFT emplean SmolTalk.

La innovación documentada no está en la arquitectura, sino en la receta: el autor describe tres decisiones críticas. Primera, abandonar los tokens especiales `<|user|>` / `<|assistant|>` con enmascarado de pérdida, que a esta escala dejaban el modelo atascado en una pérdida de 10,37 (distribución uniforme) y colapsaban a la secuencia `':::'` en cuanto el learning rate subía; la alternativa fue formatear el diálogo como texto plano y calcular la pérdida sobre la secuencia completa, lo que degrada la tarea a continuación de texto y bajó la pérdida de 10 a 3,0. Segunda, incluir diálogo ya en la fase de preentrenamiento, sin la cual el ajuste por instrucciones no funcionó. Tercera, mezclar texto general en cada lote de SFT para evitar que la distribución de salida se estreche y el entrenamiento colapse por debajo de una pérdida de aproximadamente 8.

## Capacidades

- Generación de texto coherente en inglés: es la capacidad principal y la mejor resuelta del modelo.
- Conversación sencilla en inglés: mantiene turnos cortos de charla informal, con un formato de diálogo aprendido mediante preentrenamiento conversacional y SFT.
- Autoidentificación: sabe indicar su propio nombre y el de su desarrollador.
- Continuación de texto: hereda la competencia propia de un modelo base, ya que el SFT se diseñó explícitamente para no destruirla.
- No dispone de razonamiento multi-paso, matemáticas fiables ni generación de código; el propio autor lo señala como fuera de su alcance.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento encadenado.
- No tiene modo de pensamiento (thinking mode), visión, audio ni ninguna modalidad adicional.
- Capacidad multilingüe: no disponible; solo inglés, y el rendimiento en chino es muy débil según la model card.
- No se documentan capacidades de contexto largo: la ventana es de 1024 tokens como máximo.

## Casos de uso

- Material didáctico para pipelines de entrenamiento desde cero: el repositorio documenta paso a paso tokenizador, preentrenamiento, annealing, preentrenamiento conversacional, SFT y cuantización, con tiempos y pérdidas, por lo que sirve como caso de estudio reproducible de un ciclo completo de LLM.
- Pruebas de humo (smoke testing) de stacks de inferencia: al ocupar 137 MB en Q4_K_M y 350 MB en F16, permite validar en segundos que llama.cpp, LM Studio, Ollama o llama-cpp-python funcionan correctamente, incluido el manejo de plantillas de chat y stop tokens, antes de desplegar modelos grandes.
- Experimentación con recetas de SFT a pequeña escala: su tamaño hace viable entrenar y comparar decenas de configuraciones (LoRA, proporciones de mezcla de datos, esquemas de enmascarado de pérdida) en una sola GPU de consumo, y sus tres hallazgos negativos sirven como línea base reproducible.
- Investigación en tokenización BPE: al incluir un tokenizador byte-level de 32.002 entradas entrenado desde cero, es útil para estudiar el efecto del vocabulario en modelos de menos de 200M de parámetros.
- Generación de texto de relleno en inglés para entornos de desarrollo: sirve para poblar tablas, formularios o corpus sintéticos de baja exigencia donde solo se necesita texto gramaticalmente plausible, sin coste de API.
- Demostraciones offline y en ferias: el modelo se ejecuta en CPU, en una Raspberry Pi o en un móvil con llama.cpp, lo que permite montar una demo de chatbot sin conexión ni GPU, siempre que las expectativas se ajusten a su nivel real.
- Medición comparativa de infraestructura: por su tamaño mínimo, es un vehículo cómodo para comparar throughput de distintas versiones de llama.cpp, backends o cuantizaciones sin que el modelo sea el cuello de botella.
- Aumento de datos para clasificadores de texto en inglés: puede generar variaciones léxicas simples sobre plantillas que después se filtran por calidad, tarea en la que el fallo factual es tolerable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar, y la búsqueda web no devuelve datos de rendimiento asociados a este modelo.

Las únicas métricas declaradas por el autor son las siguientes:

| Metrica | Valor |
|---|---|
| Mejor perdida de validacion | 3,0143 |
| Tokens de entrenamiento | 1.899.888.640 (aproximadamente 1,9B) |
| Pasos de preentrenamiento | 14.495 |
| Pasos de preentrenamiento conversacional | 15.000 |
| Pasos de SFT | 1.800 |
| Duracion del preentrenamiento | 13,45 horas en una RTX 5060 Ti de 16 GB |
| Nivel de referencia indicado por el autor | comparable a GPT-2 small (124M) |

El autor declara explícitamente que el modelo falla en preguntas factuales (por ejemplo, `1+1` o nombres de capitales), no razona y no escribe código, por lo que no procede presentar comparaciones de benchmarks con modelos de mayor escala.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 0,5 GB en total. El archivo F16 pesa 350 MB y el Q4_K_M 137 MB; el caché KV a 1024 tokens y F16 ocupa aproximadamente 7,3 MB (14 capas x 2 cabezas KV x 64 dimensiones x 2 tensores x 2 bytes por token, unos 7 KB por token), por lo que no es un factor limitante.
- GPU recomendadas: ninguna en particular; cualquier GPU con más de 1 GB de memoria libre es suficiente. Una RTX 4090, A100 o H100 estarían completamente sobredimensionadas para inferencia. El autor entrenó el modelo en una única RTX 5060 Ti de 16 GB, lo que da una idea del hardware mínimo realista para reentrenarlo.
- Cabe en GPU de consumo: sí, en todas las generaciones recientes y también en GPUs integradas. Adicionalmente, funciona en CPU (x86 y ARM), en una Raspberry Pi o en un móvil mediante llama.cpp.
- Opciones de despliegue: llama.cpp con `llama-server -m fahqgpt-1.0-nano-routea-f16.gguf --host 0.0.0.0 --port 8080 -c 512 -ngl 99 -r "User:"`, LM Studio, Ollama y aplicaciones móviles compatibles con GGUF (la plantilla de chat está incrustada en los metadatos del archivo). El stop token `-r "User:"` es imprescindible, ya que el modelo fue entrenado con diálogo continuo y tiende a continuar la conversación por su cuenta.
- Soporte en vLLM o TGI: no disponible en la informacion proporcionada; el modelo se distribuye exclusivamente en GGUF y su pipeline declarado es llama.cpp.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo (entre 146M y 175M de parámetros) es previsible que la generación supere con holgura la velocidad de lectura incluso en CPU moderna, pero se trata de una estimación cualitativa no verificada con cifras.
- Ajuste de parámetros: el autor recomienda una temperatura en torno a 0,5 para obtener salidas estables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FahQgpt 1.0 Nano | 145,9M declarados / 174,6M según HuggingFace | 1024 | 1,9B | Apache-2.0 | GGUF en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| GPT-2 small | 124M | 1024 | Corpus WebText (aproximadamente 40 GB de texto; no se publica el numero exacto de tokens) | Licencia MIT modificada | Pesos ampliamente disponibles; referencia historica de 2019 |
| SmolLM2-135M | 135M | 8192 | 11T (corpus SmolLM2, según documentacion publica del modelo) | Apache-2.0 | Pesos y GGUF ampliamente distribuidos por HuggingFace |

La comparación relevante es la de escala de entrenamiento: con 1,9B tokens, FahQgpt 1.0 Nano ha visto entre uno y varios órdenes de magnitud menos datos que SmolLM2-135M, y su contexto es ocho veces menor. El propio autor sitúa el modelo a la altura de GPT-2 small, lo que es coherente con un presupuesto de cómputo reducido y con la ausencia de benchmarks publicados. No hay datos de rendimiento que permitan una comparación cuantitativa con ninguno de los dos modelos de la tabla.

## Limitaciones y advertencias

- Riesgo alto de alucinación y de error factual: la model card reconoce que preguntas elementales como `1+1` o el nombre de una capital pueden responderse de forma incorrecta.
- Ausencia de razonamiento y de generación de código: el autor lo declara explícitamente como fuera del alcance del modelo.
- Contexto muy corto: 1024 tokens como máximo, y el propio ejemplo de despliegue recomienda `-c 512`; no es apto para conversaciones largas ni para procesar documentos.
- Cobertura lingüística limitada al inglés, con rendimiento muy débil en chino por la composición del corpus.
- Riesgo de desbordamiento de rol: al estar entrenado con diálogo continuo, el modelo sigue generando turnos `User:` después de responder, por lo que es obligatorio configurar `-r "User:"` como stop token para que la salida sea limpia.
- Sin soporte de tool calling, function calling, agentes ni flujos multi-paso, lo que descarta su uso en automatizaciones que requieran interacción con herramientas.
- La licencia Apache-2.0 permite uso comercial y modificación sin restricciones adicionales, pero el modelo se distribuye sin garantías y con un rendimiento insuficiente para cualquier producto orientado al usuario final.
- Falta de validación independiente: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado evaluaciones de terceros. Todas las cifras de entrenamiento y calidad proceden de la propia model card.
- Sensibilidad de la receta de entrenamiento: el autor documenta que pequeñas desviaciones (tokens especiales de rol, SFT sin texto general, preentrenamiento sin diálogo) provocan colapso del entrenamiento, lo que debe tenerse en cuenta si se intenta reproducir o continuar el ajuste.
- No es un modelo apto para producción en tareas de conocimiento, atención al cliente real, resumen de documentos o cualquier escenario donde la corrección factual sea un requisito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/txktxkabcd/fahqgpt-1.0-nano
- Paper de referencia citado en la model card (CLASS-IT, COLING 2025): https://aclanthology.org/2025.babylm-main.30/
- Perfil del autor en Bilibili: @一片烂海苔 (referencia textual incluida en la model card; no se proporciona URL directa)
- Resultados de la busqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a servicios no relacionados (ChatGPT, Google AI Studio, NanoGPT y Nano Banana) y se descartan como fuentes.
