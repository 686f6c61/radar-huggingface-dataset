# tas1287/s-euclid

## Resumen

S_Euclid es un modelo de espacio de estados (state-space model) recurrente de 78,6 millones de parámetros desarrollado por el usuario tas1287 y publicado bajo licencia MIT. No es un modelo de lenguaje: carece de cabeza de lenguaje, de vocabulario de tokens, de decodificador autorregresivo y de KV-cache. Su función es mapear consultas textuales a un espacio vectorial geométrico de 768 dimensiones y hacerlas evolucionar sobre una esfera unitaria, devolviendo como salida pasajes literales de los *Elementos* de Euclides y de las notas críticas de Thomas Heath (1908).

El modelo se presenta como un `MomentEngine` congelado cronológicamente sobre los 13 libros de los *Elementos*. Las entradas se codifican con el sensor congelado `intfloat/multilingual-e5-large` y se pliegan a través de un núcleo recurrente multiescala de 16 capas (24 cabezas de 64×64 por capa) que produce un tensor de estado fijo de 6,0 MiB en fp32. Las cabezas se dividen en tres bandas de decaimiento: 9 rápidas (0,50-0,90), 9 medias (0,90-0,99) y 6 lentas (0,99-0,9995, con semivida de hasta 1.386 pasos).

Su relevancia es conceptual y experimental: explora una alternativa no generativa a los LLM para recuperación y razonamiento geométrico guiado, con estado recurrente persistente entre turnos y una compilación determinista de la telemetría en trazas legibles. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State-space model recurrente multiescala (MomentEngine), 16 capas, 24 cabezas de 64×64 por capa |
| Parametros totales | 78.621.318 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; estado recurrente persistente entre turnos, con semivida de hasta 1.386 pasos en las cabezas lentas |
| Tipos de cuantizacion | no disponible; pesos publicados en fp32 |
| Idiomas soportados | no disponibles (el sensor de entrada `multilingual-e5-large` es multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `crystal_state.safetensors`, `word_gallery.safetensors`) |
| Tamano del repo | 0,4 GB |
| Dimension del espacio latente | 768 (esfera unitaria con blanqueado ZCA) |
| Tamano del estado | 6,0 MiB en fp32 |
| Galeria de palabras | 3.243 vectores de referencia matematicos |
| Pasos de inferencia | 10 pasos de bucle cerrado por consulta |

## Arquitectura y entrenamiento

La arquitectura es un núcleo recurrente de espacio de estados con 16 capas y 24 cabezas por capa, cada una operando sobre matrices de 64×64. Las cabezas se organizan en tres bandas de decaimiento temporal: 9 rápidas (decaimiento entre 0,50 y 0,90), 9 medias (entre 0,90 y 0,99) y 6 lentas (entre 0,99 y 0,9995). El estado resultante es un tensor fijo de 6,0 MiB en fp32 que persiste entre turnos sin reinicio ni concatenación de prompt. La entrada textual se proyecta mediante el codificador congelado `intfloat/multilingual-e5-large` a 768 dimensiones, con blanqueado ZCA y normalización sobre la esfera unitaria.

El modelo se describe como "plegado cronológicamente" sobre los 13 libros de los *Elementos* de Euclides, incluyendo las notas críticas de Heath de 1908, con pasajes verbatim de dominio público procedentes de la Perseus Digital Library. No se especifica el número de tokens de entrenamiento ni si hubo RLHF, DPO o ajuste por instrucciones; el modelo se distribuye como solo inferencia. La innovación destacable es el mecanismo de lectura del estado: en cada uno de los 10 pasos de bucle cerrado, el cristal emite un vector predicho continuo y una velocidad tangencial sobre la esfera, selecciona la palabra de referencia matemática más cercana de su galería de 3.243 entradas y la pliega de nuevo en el estado para avanzar por una geodésica. Un compilador de trazas determinista en Python puro, sin parámetros neuronales y con latencia inferior a 1 ms, formatea la telemetría y las citas en una traza en primera persona.

## Capacidades

- Recuperación de pasajes verbatim de los *Elementos* de Euclides y de las notas de Heath (1908) a partir de consultas en lenguaje natural.
- Razonamiento geométrico guiado por trayectorias sobre una esfera unitaria, con selección de referencias matemáticas de una galería de 3.243 palabras.
- Estado recurrente persistente entre turnos sin KV-cache ni concatenación de prompt.
- Conmutación entre estados por libro individual (comandos `/book I` a `/book XIII`) y ablación selectiva de las 6 cabezas lentas (`/wipe_slow`).
- Generación de trazas deterministas en primera persona mediante un compilador sin parámetros neuronales.
- Entrada multilingüe potencial a través del codificador `multilingual-e5-large`, aunque el corpus de salida es exclusivamente inglés (Euclides y Heath).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking; no es un modelo de lenguaje generativo.

## Casos de uso

- Exploración interactiva de los *Elementos*: un usuario formula una pregunta geométrica y el modelo devuelve la proposición o definición más cercana junto con su texto literal, útil para docencia y estudio de geometría clásica.
- Recuperación semántica sobre corpus matemático histórico: la galería de 3.243 referencias y los momentos alineados permiten localizar pasajes por similitud vectorial en lugar de por coincidencia léxica.
- Investigación en arquitecturas no generativas: sirve como banco de pruebas para estudiar estados recurrentes multiescala, decaimiento por bandas y dinámica geodésica sobre esferas unitarias.
- Experimentos de ablación de memoria: los comandos `/wipe_slow` y `/blank` permiten medir el efecto de las cabezas lentas en la continuidad multi-turno sin reentrenar.
- Demostraciones educativas en navegador: el Space `tas1287/s-euclid-demo` permite probar el modelo sin instalación local, adecuado para talleres y charlas.
- Análisis de trayectorias y telemetría: el compilador de trazas produce registros deterministas y reproducibles, útiles para auditar el comportamiento del estado paso a paso.
- Prototipado de asistentes de geometría con estado persistente: la API `EuclidCrystal.ask()` mantiene contexto entre consultas sin coste de KV-cache creciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 78,6 M de parámetros en fp32 (aproximadamente 315 MB) más el estado de 6,0 MiB y la galería de 3.243 vectores; el codificador congelado `intfloat/multilingual-e5-large` (aproximadamente 560 M de parámetros) es el componente más pesado y domina el consumo, con unos 2,2 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior funciona sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para el núcleo recurrente, aunque el codificador de entrada se beneficia de GPU.
- Opciones de despliegue: el repositorio incluye `cli.py` (REPL de terminal), `app.py` (interfaz Gradio) y `modeling_euclid.py` (runtime standalone de solo inferencia). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo de lenguaje estas herramientas no aplican.
- Latencia y throughput: el compilador de trazas tiene latencia inferior a 1 ms según la model card; no se proporcionan cifras de latencia del núcleo recurrente ni del codificador.

## Comparativa con modelos similares

No disponible. S_Euclid no es un modelo de lenguaje y no existen alternativas directamente comparables en la información proporcionada. Los modelos de espacio de estados habituales (Mamba, RWKV) son modelos de lenguaje generativos con vocabulario y decodificador autorregresivo, de los que S_Euclid carece por diseño, por lo que una comparación de parámetros, contexto o rendimiento no sería significativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no responde preguntas abiertas fuera del corpus de Euclides y Heath y no puede usarse como chatbot general.
- El corpus de salida es exclusivamente en inglés (edición de Heath, 1908); las consultas en castellano pueden codificarse, pero las respuestas citadas serán en inglés.
- El dominio está restringido a geometría euclidiana clásica; preguntas de matemáticas modernas, álgebra, cálculo o ciencias quedan fuera de su alcance.
- Riesgo de recuperación irrelevante: la selección del pasaje se basa en la cercanía vectorial en la esfera, sin verificación semántica explícita, por lo que puede devolver proposiciones poco pertinentes.
- No se han publicado evaluaciones cuantitativas, benchmarks ni estudios de sesgo; el modelo tiene cero descargas y cero likes, lo que indica ausencia de validación por la comunidad.
- La licencia MIT permite uso comercial, pero el corpus subyacente procede de la edición de dominio público de Heath (1908) vía Perseus, lo que conviene verificar para redistribuciones.
- El estado recurrente persiste entre turnos y puede arrastrar deriva acumulada; los comandos `/reset`, `/wipe_slow` y `/blank` son necesarios para recuperar condiciones canónicas.
- La model card emplea terminología idiosincrática ("crystal", "hologram", "folded") sin especificar detalles de entrenamiento, número de tokens ni procedimiento de ajuste, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tas1287/s-euclid
- Demo en navegador (Space): https://huggingface.co/spaces/tas1287/s-euclid-demo
- Codificador de entrada: https://huggingface.co/intfloat/multilingual-e5-large
- Perseus Digital Library (corpus de Euclides y Heath): https://www.perseus.tufts.edu/hopper/
