# xtools-at/SmolPhish3-3B-GGUF

# SmolPhish3-3B-GGUF

## Resumen

SmolPhish3-3B-GGUF es la distribución en formato GGUF del modelo SmolPhish3-3B, publicado por el usuario xtools-at. Se trata de un ajuste fino mediante LoRA sobre K0D3IN/SmolLM3-3B-Instruct-heretic, una variante «abliterated» (con los comportamientos de rechazo atenuados o eliminados) de SmolLM3-3B-Instruct de Hugging Face. El modelo está especializado en una única tarea: generar correos de phishing en inglés a partir de un contexto personal de la víctima (nombre, correo, puesto de trabajo y actividades recientes), siguiendo el esquema de campos del dataset de entrenamiento.

El modelo conserva el tamaño del original: 3.075.098.624 parámetros (unos 3,08B), arquitectura transformer densa decoder-only y licencia Apache 2.0. El repositorio ocupa 5,2 GB y contiene únicamente cuantizaciones estáticas en GGUF, pensadas para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, llama-cpp-python). Los metadatos declaran un solo idioma, el inglés.

Su interés es doble. Por un lado, es una herramienta de investigación en seguridad: permite generar datasets etiquetados de phishing, aumentar datos para entrenar clasificadores y evaluar la robustez de filtros de correo. Por otro, es un caso de estudio de cómo un ajuste fino muy específico sobre un modelo pequeño sin alineamiento de seguridad puede producir contenido claramente malicioso con muy pocos parámetros. No se han publicado resultados de benchmarks ni detalles del proceso de entrenamiento más allá del dataset utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de SmolLM3-3B; no detallada en la model card) |
| Parametros totales | 3.075.098.624 (≈3,08B) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base SmolLM3-3B soporta 65.536 tokens (64K) nativos, extensibles a 128K con YaRN |
| Tipos de cuantizacion | GGUF estático (la model card no enumera los niveles incluidos; típicamente F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M en llama.cpp) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo padre xtools-at/SmolPhish3-3B se distribuye en safetensors |
| Tamano del repositorio | 5,2 GB |
| Modelo base | K0D3IN/SmolLM3-3B-Instruct-heretic |
| Modelo raiz | HuggingFaceTB/SmolLM3-3B |
| Dataset de ajuste | kxm1k4m1/generate_phishing_email_final |
| Pipeline | text-generation |
| Fecha de creacion (metadatos) | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso decoder-only de 3,08B parámetros con atención por consultas agrupadas (GQA). El ajuste consiste en un LoRA sobre K0D3IN/SmolLM3-3B-Instruct-heretic, que a su vez es una variante del SmolLM3-3B-Instruct con las capas de rechazo modificadas («heretic»/abliterated). Al aplicar el LoRA sobre una base ya desprovista de rechazos, el modelo resultante no presenta las negativas habituales ante peticiones de contenido fraudulento.

El entrenamiento se realizó sobre el dataset kxm1k4m1/generate_phishing_email_final, en inglés, y sigue un esquema fijo: un system prompt del tipo «Generate a convincing phishing email based on the given personal context» y un user prompt que aporta los datos personales de la víctima e instruye a generar urgencia y una llamada a la acción. La model card no indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco documenta técnicas de decodificación especulativa ni modificaciones sobre el mecanismo de atención del modelo original. El autor describe explícitamente los correos generados como «relativamente obvios», lo que sugiere una calidad limitada y un posible sobreajuste al formato exacto de las plantillas del dataset.

## Capacidades

- Generación de texto en inglés orientada a una tarea única: redacción de correos de phishing a partir de un contexto personal estructurado.
- Seguimiento de instrucciones con formato rígido: respeta el esquema de campos del dataset (nombre, correo, puesto, actividades recientes) y devuelve la salida comenzando por la línea «Subject:».
- Generación de texto malicioso sin rechazos: la base «heretic» elimina las negativas de seguridad, por lo que no bloquea peticiones de contenido fraudulento.
- Conversación multi-turno básica: el tag `conversational` indica compatibilidad con plantillas de chat, aunque no hay evaluación publicada de diálogo.
- Modo de razonamiento (thinking mode): no documentado en la model card de este ajuste, aunque el modelo base SmolLM3 lo incorpora.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas; el ajuste está orientado a una generación de un solo turno.
- Capacidades multilingües: no; únicamente inglés según los metadatos.
- Capacidades de visión o audio: no.

## Casos de uso

- Generación de datasets etiquetados para detección de phishing: el modelo produce correos fraudulentos en serie a partir de perfiles sintéticos, lo que permite construir corpus positivos para entrenar clasificadores de spam y modelos de detección, con la ventaja de que las etiquetas son trivialmente conocidas.
- Aumento de datos para filtros corporativos: generar variantes lingüísticas de correos de phishing (distintos sectores, cargos y pretextos de urgencia) para ampliar la cobertura de un clasificador ante plantillas que no aparecen en producción.
- Red teaming autorizado y evaluación de defensas: en un entorno controlado y con autorización por escrito, medir si la pasarela de correo, el filtro antispam o el EDR de una organización bloquean correos generados con este esquema y con qué tasa de acierto.
- Simulacros de concienciación: emplear los correos generados como plantillas para campañas internas de formación en seguridad, asumiendo su naturaleza «relativamente obvia» como limitación y revisando siempre el contenido antes de enviarlo.
- Investigación sobre seguridad y alineamiento: estudiar cómo un LoRA muy pequeño sobre una base abliterated convierte un modelo de 3B en un generador de contenido fraudulento especializado, útil para medir la eficacia de las técnicas de desalineación y de las defensas.
- Investigación de pipelines de generación sintética con contenido sensible: probar el comportamiento de cadenas de herramientas (llama.cpp, plantillas de chat, post-procesado y filtros propios) con contenido dañino conocido, sin recurrir a APIs comerciales que lo bloquean o lo registran.
- Despliegue local con aislamiento de red: al ser un GGUF de 3B, puede ejecutarse íntegramente en una máquina aislada, lo que evita enviar prompts y datos a servicios de terceros durante la investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de calidad de phishing, tasa de clic o similitud con correos reales. Tampoco se documenta el tamaño del dataset de ajuste ni el número de pasos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 3.075.098.624 parámetros; el autor no publica mediciones):

| Cuantizacion | Tamano aproximado de pesos | VRAM estimada con contexto moderado |
|---|---|---|
| F16 | ~6,2 GB | 7-8 GB |
| Q8_0 | ~3,3 GB | ~4 GB |
| Q6_K | ~2,5 GB | 3-3,5 GB |
| Q5_K_M | ~2,2 GB | 2,5-3 GB |
| Q4_K_M | ~1,9 GB | 2-2,5 GB |

- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4/Q5/Q6 (RTX 3050 8 GB, RTX 3060, RTX 4060, RTX 4070, RTX 4090). Aceleradores de centro de datos como A100 o H100 están sobredimensionados para este tamaño y solo tendrían sentido para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de 6 GB o más, incluso en iGPU con memoria unificada para cuantizaciones bajas.
- Ejecución en CPU: viable con llama.cpp; en un equipo de escritorio actual es esperable una velocidad de lectura interactiva, aunque no hay cifras publicadas.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (importando el GGUF), LM Studio, Jan y text-generation-webui. vLLM solo con soporte GGUF experimental y limitado; TGI requeriría convertir los pesos a safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, TTFT ni comparativas con otras cuantizaciones.

## Comparativa con modelos similares

No existe una comparativa de rendimiento publicada para este ajuste. La tabla siguiente contrasta el modelo con su base y con alternativas generalistas del mismo orden de tamaño (los datos de contexto y licencia corresponden a la documentación pública de cada modelo, no a este repositorio).

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| SmolPhish3-3B-GGUF | 3,08B | no especificado (base: 64K, 128K con YaRN) | Apache 2.0 | GGUF | Ajuste especializado en phishing; sin benchmarks; 0 descargas |
| SmolLM3-3B-Instruct | 3,08B | 64K nativos, 128K con YaRN | Apache 2.0 | safetensors, GGUF | Modelo base alineado, multilingüe (6 idiomas), con modo de razonamiento |
| Qwen2.5-3B-Instruct | 3,09B | 32K nativos | Apache 2.0 | safetensors, GGUF | Multilingüe, buen rendimiento en código y matemáticas para su tamaño |
| Llama-3.2-3B-Instruct | 3,21B | 128K | Llama 3.2 Community License | safetensors, GGUF | Licencia con restricciones, no plenamente libre; ampliamente desplegado |
| Gemma-2-2B-it | 2,6B | 8K | Gemma Terms of Use | safetensors, GGUF | Más pequeño y con contexto más corto; licencia con cláusulas de uso |

## Limitaciones y advertencias

- Contenido dañino deliberado: el modelo no es un generador de texto general, sino una herramienta que produce correos de ingeniería social con fines fraudulentos. Su uso para atacar a personas reales es ilícito en España y en la mayoría de jurisdicciones (estafa informática, acceso no autorizado y suplantación de identidad).
- Base abliterated: al derivar de una variante «heretic», carece de rechazos de seguridad y puede responder a otras peticiones dañinas fuera del ámbito del phishing.
- Licencia: aunque la Apache 2.0 permite formalmente el uso comercial, el propio autor indica «for research use only». La licencia no exime de responsabilidad por el uso ilícito del contenido generado.
- Sesgos del dataset: entrenado sobre un único dataset de phishing en inglés. Es esperable un sesgo hacia los nombres de persona, dominios, cargos y sectores presentes en ese corpus, y una baja diversidad de pretextos.
- Alucinación: al ser un modelo de 3,08B, la coherencia factual es limitada; los datos de la «víctima» y los enlaces generados deben tratarse siempre como ficticios.
- Sensibilidad al formato del prompt: el ajuste sigue un esquema concreto de system y user prompt. Fuera de ese esquema, la calidad de salida puede degradarse de forma notable.
- Idioma: solo inglés. No hay soporte contrastado de castellano ni de otros idiomas.
- Ausencia de validación: 0 descargas y 0 likes, sin métricas publicadas ni evaluación independiente. No hay evidencia de que los correos generados sean eficaces más allá de la descripción del autor («relativamente obvios»).
- Calidad de la documentación: el README incluye un título erróneo («SmolMed3-3B») que parece un resto de copia y pega, y no detalla los niveles de cuantización incluidos ni las condiciones de entrenamiento.
- Fechas de metadatos incoherentes: la fecha de creación declarada (2026-09-19) es posterior a la de la mayoría de modelos de referencia, un detalle que conviene verificar antes de citar el repositorio.
- Aviso para producción: no se recomienda integrarlo en ningún sistema accesible por terceros sin aislamiento de red, registro de uso y controles de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/SmolPhish3-3B-GGUF
- Modelo padre (safetensors): https://huggingface.co/xtools-at/SmolPhish3-3B
- Modelo base del ajuste: https://huggingface.co/K0D3IN/SmolLM3-3B-Instruct-heretic
- Modelo raíz: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/kxm1k4m1/generate_phishing_email_final
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggml-org/llama.cpp

No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo (los resultados devueltos corresponden a noticias sin relación con el repositorio).
