# YeicoMd/laya-police-es-GGUF

## Resumen

`laya-police-es-GGUF` es la exportación en formato GGUF del clasificador `YeicoMd/laya-police-es`, un modelo desarrollado por YeicoMd para categorizar partes de denuncia e intervención policial en español dentro de una taxonomía cerrada de 72 categorías. No es un modelo generativo: es un *ranker* o *decision model* construido sobre un encoder ModernBERT (`jhu-clsp/mmBERT-base`, 22 capas, dimensión oculta 768) con una *scoring head* propietaria de Laya que puntúa cada opción mediante un token `<mask>` y devuelve una categoría acompañada de una probabilidad calibrada.

El modelo resuelve un problema acotado pero crítico en el ámbito de la gestión documental policial: la clasificación automática y consistente de textos operativos en lenguaje administrativo, con una precisión de 0,7638 en *choice accuracy* y un F1 ponderado de 0,7432 sobre el split de evaluación. Su relevancia práctica radica en que se distribuye como GGUF de 340 MB (Q8_0) que puede ejecutarse sin Python ni PyTorch mediante LM Studio o llama.cpp, lo que facilita su integración en entornos de escritorio o infraestructuras ligeras.

La versión GGUF mantiene paridad funcional con el checkpoint PyTorch original (14/14 filas del split de evaluación con la misma categoría predicha y una diferencia máxima de probabilidad de 0,0208 en la categoría ganadora), e incorpora la temperatura de calibración (τ = 3,2611) directamente en los pesos, de modo que las probabilidades devueltas ya están calibradas sin postprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (base `jhu-clsp/mmBERT-base`), 22 capas, 768 dim, con scoring head Laya basada en token `<mask>` |
| Parametros totales | 321.710.593 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (`max_len` de entrenamiento) |
| Tipos de cuantizacion | Q8_0 (única publicada en este repo) |
| Idiomas soportados | Español (`es`) |
| Licencia | MIT |
| Formato de pesos | GGUF (`laya-police-es-Q8_0.gguf`, 340 MB) + checksum SHA256 |
| Pipeline | text-classification (decision model, no generativo) |
| Tarea | Clasificación en 72 categorías de partes policiales |
| Protocolo de servicio | `POST /v1/systemone` (TypeSafe/Jev), no `/v1/chat/completions` |
| Libreria | `laya` |
| Modelo base | `jhu-clsp/mmBERT-base` |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe preentrenado, sobre el que se añade una *scoring head* específica de Laya. El mecanismo de decisión consiste en presentar al encoder una instrucción junto con las 72 opciones candidatas, cada una asociada a un token `<mask>`, y leer la puntuación en la posición de dicho token para derivar la distribución de probabilidad sobre las categorías. Esta formulación convierte el problema de clasificación en una tarea de *ranking* sobre opciones explícitas, lo que permite cambiar dinámicamente el conjunto de candidatos en tiempo de inferencia siempre que se respete el orden original de `categories.json` (el índice de la opción en `criteria` es el índice de la categoría en el head entrenado).

El entrenamiento se realizó con `max_len=1024`, ventana en la que la instrucción y las 72 opciones consumen la mayor parte del contexto, quedando el resto para el parte de intervención, que se trunca por el principio. Los datos provienen de partes de intervención policial **anonimizados** (DNI, NIE, teléfonos, matrículas, correos y nombres se sustituyen antes del entrenamiento). La calibración se resolvió mediante una temperatura ajustada (τ = 3,2611) incrustada en el GGUF, de modo que las probabilidades de salida son directamente utilizables sin recalibrado posterior. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables, en principio, a un modelo de clasificación).

## Capacidades

- Clasificación de textos policiales en español en una taxonomía cerrada de 72 categorías.
- Salida de una categoría principal con distribución de probabilidades sobre las opciones consultadas y un valor de `confidence` calibrado.
- Evaluación de opciones dinámicas: el cliente puede enviar subconjuntos de `criteria` distintos en cada petición, siempre respetando el orden de `categories.json`.
- Procesamiento de documentos con truncado automático por el principio cuando exceden la ventana de 1024 tokens (responsabilidad del cliente; llama.cpp devuelve `400 exceed_context_size_error` si el prompt no cabe).
- Funcionamiento sin Python ni PyTorch, mediante LM Studio o llama.cpp.
- Integración mediante API HTTP local (`POST /v1/systemone`) con protocolo TypeSafe/Jev.
- No dispone de generación de texto libre, tool calling, capacidades de agente, visión, audio ni modo *thinking*. Es un modelo de decisión, no conversacional.

## Casos de uso

- **Triaje automático de partes de denuncia**: ingesta de partes redactados por agentes y asignación automática a una de las 72 categorías (hurto, robo con violencia, etc.), reduciendo el tiempo de clasificación manual en sistemas de gestión documental interna.
- **Enrutamiento de expedientes**: uso de la categoría predicha y de la confianza calibrada para dirigir cada parte al departamento o unidad correspondiente; las predicciones con `confidence` baja pueden marcarse para revisión humana.
- **Etiquetado asistido para analítica**: generación de metadatos estructurados sobre corpus históricos de partes anonimizados para construir series temporales de incidencia delictiva por categoría.
- **Control de calidad de tipificación**: detección de partes cuya categoría declarada por el agente difiere de la predicha por el modelo, como señal para revisión de criterios internos.
- **Despliegue en estaciones de trabajo sin GPU dedicada**: al ser un GGUF Q8_0 de 340 MB servible con llama.cpp, puede ejecutarse en portátiles y equipos de oficina sin infraestructura de GPU, útil en entornos con requisitos de residencia de datos.
- **Prototipado rápido en LM Studio**: validación de la taxonomía y del comportamiento del modelo sobre muestras reales anonimizadas antes de decidir una integración en producción.
- **Preprocesado en pipelines de datos**: clasificación previa de grandes volúmenes de partes como paso anterior a tareas de búsqueda, agrupación o estadística, con la ventaja de que la calibración permite aplicar umbrales de abstención.

## Benchmarks y rendimiento

Resultados sobre el split de evaluación, según la model card del autor:

| Metrica | Valor |
|---|---|
| Choice accuracy | 0,7638 |
| Weighted F1 | 0,7432 |
| ECE (calibración) | 0,1252 |
| Avg. loss | 1,5677 |

Paridad con el checkpoint PyTorch (Q8_0 frente a pesos originales):

| Metrica | Valor |
|---|---|
| Filas del split de eval con misma categoría | 14/14 |
| Max \|Δp\| en la categoría ganadora | 0,0208 |
| Media \|Δp\| | 0,0032 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el fichero Q8_0 de 340 MB; suficiente cualquier GPU consumer con 2 GB o más, e incluso ejecución en CPU.
- GPU recomendadas: innecesarias para el tamaño del modelo; cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) puede servirlo con holgura. En servidores, A100/H100 no aportan ventaja significativa para este tamaño.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM; también en CPU.
- Opciones de despliegue: LM Studio (`lms get YeicoMd/laya-police-es-GGUF`) y llama.cpp (`llama-server`). Otros runtimes GGUF no están documentados en la información disponible.
- Configuración crítica: `context_length` 1024, `eval_batch_size` y `physical_batch_size` de 2048 (LM Studio usa 512 por defecto y provoca errores `input too large to process`), `parallel` 1. En llama.cpp: `-c 2048 --batch-size 2048 --ubatch-size 2048`.
- Latencia y throughput: no disponibles en la información proporcionada. El uso típico registra del orden de 60 tokens de entrada por petición en el ejemplo de la model card.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo se apoya en `jhu-clsp/mmBERT-base` (encoder ModernBERT multilingüe base), pero no se han publicado comparaciones de rendimiento frente a otros clasificadores de textos policiales o de dominio administrativo en español.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-police-es-GGUF | 321,7 M | 1024 | Clasificación 72 categorías policiales (es) | MIT | GGUF en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **No es un modelo generativo**: no admite chat, tool calling, agentes ni generación de texto; cualquier intento de usarlo por `/v1/chat/completions` fallará.
- **Orden de las opciones**: el orden de las 72 opciones en `criteria` debe coincidir exactamente con `categories.json` del repo PyTorch; alterarlo produce predicciones incorrectas sin error explícito.
- **Truncado manual obligatorio**: llama.cpp no recorta el *state*; si el prompt excede la ventana devuelve `400 exceed_context_size_error`. El cliente debe truncar por el principio como en el entrenamiento (el repo incluye `scripts/laya_client.py` para automatizarlo).
- **Configuración de batch en LM Studio**: con el valor por defecto (512) todas las peticiones fallan; es necesario cargar con `physical_batch_size` 2048. Además, LM Studio mantiene instancias cargadas y enruta a la más antigua, por lo que conviene ejecutar `lms unload --all` antes de cargar.
- **Rendimiento moderado**: accuracy de 0,7638 y F1 ponderado de 0,7432 implican que aproximadamente una de cada cuatro decisiones es incorrecta; no es adecuado para decisiones automatizadas sin revisión humana en contextos sensibles.
- **Calibración imperfecta**: ECE de 0,1252 indica que las probabilidades, aunque calibradas por temperatura, aún presentan desviaciones; los umbrales de confianza deben validarse sobre datos propios.
- **Dominio y idioma acotados**: solo español y solo textos de partes de intervención policial; el rendimiento fuera de ese dominio no está documentado.
- **Sesgos**: no se documentan análisis de sesgos en la información disponible; al entrenarse sobre partes policiales reales, puede heredar sesgos de tipificación presentes en los datos originales.
- **Licencia MIT**: permite uso comercial, pero la responsabilidad sobre el tratamiento de datos personales (aunque el entrenamiento usó datos anonimizados) recae en el desplegador.
- **Madurez del proyecto**: 0 descargas y 0 likes en el momento de la consulta; sin validación externa conocida.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/YeicoMd/laya-police-es-GGUF
- Checkpoint PyTorch original: https://huggingface.co/YeicoMd/laya-police-es
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
