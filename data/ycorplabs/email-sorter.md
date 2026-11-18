# YCorpLabs/email-sorter

## Resumen

Email sorter es un modelo de clasificación de texto desarrollado por YCorpLabs, derivado del codificador multilingüe `intfloat/multilingual-e5-small` (118 millones de parámetros, 12 capas) y reajustado como cross-encoder con una única salida logit sobre la última capa tras mean-pooling, seguida de una sigmoide. No es un modelo generativo ni conversacional: recibe una descripción de filtro en lenguaje natural junto con las primeras líneas de un correo electrónico y devuelve una probabilidad de pertenencia a ese filtro. Cada filtro se puntúa por separado, de modo que el orden de los filtros no influye en el resultado.

El problema que aborda es la distinción entre correo no deseado y correo legítimo de desconocidos: pitches comerciales en frío (agencias, consultoras SEO, generación de leads, cazatalentos) frente a clientes, inversores, periodistas o estudiantes que escriben por primera vez. El modelo está pensado para ejecutarse en local, sobre la CPU de un portátil, en aproximadamente 0,1–0,2 segundos por correo con cuatro filtros activos, sin que el correo salga del dispositivo.

Su relevancia actual radica en la combinación de tamaño reducido (157 MB en el archivo publicado, 0,1 GB de repositorio), consumo de memoria en torno a 0,5 GB durante la clasificación, licencia MIT y soporte de ocho idiomas, lo que lo hace adecuado para aplicaciones de escritorio con requisitos estrictos de privacidad y sin dependencia de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder derivado de `intfloat/multilingual-e5-small` (transformer, 12 capas), con logit único sobre mean-pooling de la última capa y sigmoide |
| Parametros totales | 118 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 320 tokens por par consulta-pasaje |
| Tipos de cuantizacion | Pesos publicados en un único safetensors: embeddings de palabras en int8 por fila (u8 con desplazamiento +128 y escala f16 por fila), resto en f16; no se documentan otras cuantizaciones (GGUF, AWQ, etc.) |
| Idiomas soportados | Multilingüe; entrenado con correos en inglés (aproximadamente la mitad), noruego, alemán, español, danés, sueco, francés, neerlandés y algunos otros |
| Licencia | MIT |
| Formato de pesos | safetensors (metadatos con `format: email-sorter-1`); tokenizador del modelo base |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small` y se reajusta como cross-encoder: la entrada combina `query: <descripción del filtro>` con `passage: From: …\nSubject: …\n\n<body>`, truncado a 320 tokens con el tokenizador del modelo base. Sobre la representación mean-pooled de la última capa se aplica una capa lineal que produce un único logit, convertido en probabilidad mediante sigmoide. Al puntuar cada filtro de forma independiente, el modelo no requiere normalización entre filtros ni impone un orden de evaluación.

Los datos de entrenamiento son aproximadamente 2.900 correos sintéticos generados específicamente para la tarea, sin correo real: alrededor de la mitad en inglés y el resto en noruego, alemán, español, danés, sueco, francés, neerlandés y algunos otros idiomas. Cada correo se emparejó con las descripciones de filtro predefinidas de la aplicación, así como con paráfrasis y descripciones inventadas, con el objetivo de que filtros redactados por el propio usuario también funcionen. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineamiento. La evaluación se realizó sobre un conjunto separado de 200 correos escritos por otro autor y excluidos del entrenamiento.

## Capacidades

- Clasificación binaria por filtro: devuelve una probabilidad de pertenencia de un correo a una descripción de filtro dada en lenguaje natural.
- Puntuación independiente de múltiples filtros sin dependencia del orden de evaluación.
- Procesamiento multilingüe en inglés, noruego, alemán, español, danés, sueco, francés y neerlandés, con cobertura adicional de otros idiomas presente en los datos sintéticos.
- Distinción entre pitches comerciales en frío y comunicaciones legítimas de desconocidos (clientes, inversores, periodistas, estudiantes).
- Diferenciación de boletines, promociones y recibos frente a correo personal.
- Ejecución en CPU sin GPU ni bibliotecas nativas, mediante el runtime de referencia en Rust sobre candle.
- Integración en Python mediante `sorter.py` con `torch`, `transformers` y `safetensors`.
- No genera texto, no mantiene conversación, no soporta tool calling ni razonamiento multi-paso, y no dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Filtrado de correo no deseado en aplicaciones de escritorio: el modelo puntúa cada correo entrante contra una descripción como "pitches comerciales no solicitados" y la aplicación archiva los que superan el umbral de confianza, con ejecución local sobre CPU en torno a 0,1–0,2 segundos por correo.
- Aplicación de bandeja de entrada con filtros definidos por el usuario: al aceptar descripciones arbitrarias en lenguaje natural, permite crear filtros como "viajes: confirmaciones de avión, tren y hotel" o "peticiones de medios de periodistas y podcasters" sin reentrenamiento.
- Separación de boletines y promociones del correo personal: el modelo distingue boletines, promociones y recibos de mensajes de personas, lo que permite enviarlos a carpetas secundarias o omitir la bandeja de entrada.
- Protección de conversaciones existentes: combinado con reglas de remitente, el modelo actúa solo como último paso sobre correo de desconocidos, ya que los contactos conocidos, dominios de la propia empresa e hilos con respuesta previa nunca llegan al clasificador.
- Clasificación por lotes en pipelines de datos: al ser un cross-encoder pequeño con pesos en f16 e int8, puede puntuar grandes volúmenes de correo en servidores sin GPU, con un consumo de memoria en torno a 0,5 GB.
- Herramientas de gestión de correo para equipos pequeños: la licencia MIT y el formato safetensors permiten integrar el modelo en productos comerciales y en flujos de trabajo propios sin restricciones de uso.
- Evaluación de calidad de filtros personalizados: el script `sorter.py` permite puntuar correos de ejemplo contra varias descripciones y ajustar umbrales antes de desplegar un filtro en producción.

## Benchmarks y rendimiento

Evaluación sobre 200 correos escritos a mano por un autor distinto del de entrenamiento, con los umbrales reales de la aplicación:

| Metrica | Email sorter | Qwen3 4B, con prompting (motor anterior) |
|---|---|---|
| Aciertos en el test ciego | 186 / 200 | 154 / 200 |
| Correo real movido erroneamente fuera de la bandeja | 2 | 4 |
| Tamano de descarga | 157 MB | 2,5 GB |
| Memoria durante la clasificacion | ~0,5 GB | ~3 GB |
| Tiempo por correo, cuatro filtros | ~0,1–0,2 s en CPU | 0,8 s en GPU M3 Max, 3–10 s en CPU |

Los dos correos movidos erróneamente en el test eran casos genuinamente límite: un cazatalentos reclutando al lector y un fondo solicitando invertir en su negocio. En el buzón de demostración de la aplicación, el modelo detectó los cuatro pitches en frío, distinguió boletines, promociones y recibos, y no movió ningún correo de una persona. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el runtime de referencia funciona en CPU; el consumo de memoria durante la clasificación es de aproximadamente 0,5 GB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y no requiere GPU. En el caso del motor anterior (Qwen3 4B) se menciona una GPU M3 Max, pero no para este modelo.
- Cabe en cualquier portátil convencional: el archivo ocupa 157 MB y el modelo completo 118 millones de parámetros.
- Opciones de despliegue: runtime de referencia en Rust sobre candle (`crates/mail-ai`), sin GPU ni bibliotecas nativas; script `sorter.py` en Python con `torch`, `transformers` y `safetensors`; integración directa en la aplicación Email con verificación SHA-256 del archivo descargado.
- Latencia y throughput estimados: aproximadamente 0,1–0,2 segundos por correo con cuatro filtros activos en CPU.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Email sorter (YCorpLabs) | 118 M | 320 tokens | Cross-encoder de clasificación por filtro | MIT | Hugging Face, runtime Rust y Python |
| Qwen3 4B (motor anterior de Email, con prompting) | 4 000 M | no disponible | LLM generativo con prompting | no disponible en la informacion | no disponible en la informacion |
| `intfloat/multilingual-e5-small` (modelo base) | 118 M | no disponible en la informacion | Embeddings multilingües | no disponible en la informacion | Hugging Face |

La comparación directa disponible se limita al motor anterior de la aplicación: Email sorter obtiene 186/200 frente a 154/200 en el test ciego, ocupa 157 MB frente a 2,5 GB, consume aproximadamente 0,5 GB frente a 3 GB de memoria y clasifica en 0,1–0,2 segundos en CPU frente a 0,8 segundos en GPU M3 Max y 3–10 segundos en CPU para Qwen3 4B con prompting. No se dispone de datos de otros clasificadores de correo comparables en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son exclusivamente sintéticos (aproximadamente 2.900 correos generados), sin correo real; el comportamiento sobre buzones reales puede diferir del observado en el conjunto de evaluación.
- Riesgo de clasificación errónea en casos genuinamente ambiguos, como cazatalentos que reclutan al propio lector o inversores que contactan por primera vez; en el test ciego se produjeron 2 falsos positivos de este tipo.
- El modelo no genera texto, por lo que no puede explicar sus decisiones ni mantener diálogo; la aplicación debe gestionar la lógica de umbrales y las reglas de remitente.
- Ventana de contexto limitada a 320 tokens por par consulta-pasaje, suficiente para el inicio de un correo pero no para mensajes largos completos.
- Cobertura lingüística concentrada en inglés y lenguas nórdicas y centroeuropeas; el rendimiento en idiomas fuera de esa lista no está documentado.
- La licencia MIT permite uso comercial sin restricciones conocidas, pero al derivar de `intfloat/multilingual-e5-small` conviene verificar las condiciones del modelo base antes de su explotación.
- En la aplicación, la incertidumbre se resuelve hacia la bandeja de entrada: un filtro solo actúa con confianza del 80 % o superior, y la opción de ignorar requiere un 95 %; este diseño reduce falsos positivos pero puede dejar pasar correo no deseado.
- No se documentan sesgos específicos más allá de los derivados de los datos sintéticos y de la composición lingüística del conjunto de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YCorpLabs/email-sorter
- Aplicación Email: https://github.com/YCorpLabs/Email
- Documentación sobre el funcionamiento de los filtros: https://github.com/YCorpLabs/Email/blob/main/docs/filters.md
- Runtime de referencia en Rust sobre candle: https://github.com/YCorpLabs/Email/tree/main/crates/mail-ai
- candle: https://github.com/huggingface/candle
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
