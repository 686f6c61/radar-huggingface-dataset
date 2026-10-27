# tinyopsec/lalo-1.5b-GGUF

## Resumen

lalo-1.5b es un ajuste fino de Qwen2.5-1.5B-Instruct orientado a un dominio muy concreto: la atención al estudiante en una institución turca (Lale Teknik Üniversitesi). El modelo original lo publica el usuario ErdalX y esta versión, distribuida por tinyopsec, es una conversión a GGUF generada con llama.cpp para su uso en runtimes de inferencia local. No se trata de un modelo generalista, sino de un asistente especializado que responde consultas administrativas y académicas en turco.

Arquitectónicamente hereda por completo la estructura del modelo base: un transformer decoder-only de la familia Qwen2, denso, con 1.543.714.304 parámetros (unos 1,54 mil millones) y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El ajuste se realizó mediante QLoRA, una técnica de bajo rango que permite adaptar el modelo con un coste de cómputo reducido, y las etiquetas del repositorio sugieren que el sistema está pensado para integrarse en un pipeline de recuperación aumentada (RAG) sobre la documentación institucional.

Su relevancia práctica es acotada pero clara: demuestra el patrón de especializar un modelo pequeño y abierto en un dominio vertical con recursos limitados y desplegarlo en hardware de consumo. Al ser un GGUF de 1,5B, cabe en GPUs de gama baja e incluso en CPU, con cuantizaciones de 4 bits en torno a 1 GB. La contrapartida es que no hay ninguna evaluación publicada, ni descargas, ni validación externa: el repositorio se creó el 27 de octubre de 2026 y, en el momento de redactar esta ficha, no registra actividad de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (modelo denso) |
| Parámetros totales | 1.543.714.304 (≈1,54 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct; no se especifica en la model card) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Turco (único idioma declarado en la model card; el modelo base Qwen2.5 es multilingüe, pero no hay confirmación de que el ajuste lo preserve) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión de un ajuste QLoRA sobre safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y atención con query/key/value agrupadas (GQA) propia de la familia Qwen2. Sobre esa base se aplicó un ajuste supervisado con QLoRA, según la etiqueta `qlora` del repositorio, lo que implica que los pesos del modelo base se mantuvieron congelados en cuantización de 4 bits durante el entrenamiento y solo se actualizaron adaptadores de bajo rango. No se publican ni el rango, ni el alfa, ni el número de pasos, ni la composición del dataset de ajuste.

Tampoco hay información sobre si se aplicaron fases de alineación adicionales (RLHF, DPO) más allá de las que ya incorpora el modelo base de Qwen, ni sobre el volumen de tokens de entrenamiento del ajuste. La presencia de la etiqueta `rag` sugiere que el sistema se diseñó para operar con contexto recuperado de una base documental, pero la model card no documenta la arquitectura del pipeline ni el corpus utilizado. La conversión a GGUF se realizó con llama.cpp, generando trece ficheros con distintos niveles de cuantización.

## Capacidades

- Generación de texto conversacional en turco, orientada a consultas de estudiantes sobre trámites, calendario académico y normativa interna.
- Respuesta a preguntas de dominio cerrado cuando se le proporciona contexto documental (patrón RAG sugerido por las etiquetas del repositorio).
- Conversación multi-turno dentro de la ventana de contexto heredada del modelo base (32.768 tokens), suficiente para hilos de atención al estudiante con historial.
- Capacidades generales de razonamiento, código y matemáticas heredadas de Qwen2.5-1.5B-Instruct, aunque no hay evidencia publicada de cuánto se han conservado tras el ajuste.
- Soporte de tool calling / function calling heredado del modelo base; no confirmado explícitamente para este ajuste.
- No se declaran capacidades de visión, audio, modo de razonamiento explícito (*thinking*) ni agentes multi-paso.
- Despliegue local en CPU o GPU mediante cualquier runtime compatible con GGUF.

## Casos de uso

- **Atención al estudiante en mostrador digital**: desplegar el modelo detrás de un chat web de la propia universidad para responder dudas frecuentes sobre matrícula, plazos y documentación, con la ventaja de que la inferencia puede ejecutarse en un servidor modesto o incluso en local.
- **Asistente RAG sobre reglamento académico**: indexar el reglamento y las guías de la institución en una base vectorial y usar el modelo para redactar respuestas citando los fragmentos recuperados; la etiqueta `rag` del repositorio indica que este es el uso previsto.
- **Prototipado rápido de asistentes verticales**: servir como plantilla para equipos que quieran especializar un modelo de 1,5B en un dominio propio mediante QLoRA, ya que el coste de entrenamiento e inferencia es mínimo.
- **Despliegue en hardware de consumo con fines de demostración**: ejecutarlo en un portátil con 8 GB de RAM usando Q4_K_M (~1 GB de pesos), por ejemplo en una feria de orientación universitaria o en un tótem offline sin conexión.
- **Sistema de respuesta en entornos con requisitos de soberanía del dato**: al ser Apache 2.0 y ejecutarse íntegramente en local, permite procesar consultas de estudiantes sin enviar datos personales a APIs externas.
- **Generación de borradores de correos administrativos**: redactar respuestas tipo a solicitudes de estudiantes (prórrogas, recursos, certificados) que luego revise un responsable humano.
- **Evaluación comparativa interna de ajustes QLoRA**: usar el par base/ajustado para medir cuánto degrada el fine-tuning las capacidades generales del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluación de turco ni ninguna métrica de calidad del ajuste, y el repositorio no registra descargas ni validación de la comunidad.

| Benchmark | lalo-1.5b | Qwen2.5-1.5B-Instruct | Observaciones |
|---|---|---|---|
| MMLU | no disponible | no disponible en esta ficha | Sin datos publicados por el autor |
| HumanEval | no disponible | no disponible en esta ficha | Sin datos publicados por el autor |
| GSM8K | no disponible | no disponible en esta ficha | Sin datos publicados por el autor |
| Evaluación en turco | no disponible | no disponible en esta ficha | No se documenta ningún conjunto de evaluación |

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia** (solo pesos, sin caché KV; el F16 está confirmado en la model card, el resto son estimaciones proporcionales):
  - F16: ~3,0 GB
  - Q8_0: ~1,7 GB
  - Q6_K: ~1,3 GB
  - Q5_K_M: ~1,1 GB
  - Q4_K_M (recomendada): ~1,0 GB
  - Q3_K_M: ~0,85 GB
  - Q2_K: ~0,7 GB
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM sirve para Q4_K_M (GTX 1650, RTX 3050, RTX 4060, T4). Para F16 y contextos largos conviene disponer de 6-8 GB (RTX 3060, RTX 4060 Ti, L4). A100/H100 no aportan ventaja con este tamaño de modelo y quedan sobredimensionadas.
- **¿Cabe en GPU de consumo?** Sí, en todas las configuraciones desde 4 GB, y también en CPU pura con 8 GB de RAM del sistema.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, llama-cpp-python. vLLM y TGI solo con soporte parcial o experimental de GGUF; para estos motores sería preferible partir del modelo en safetensors. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con APIs tipo OpenAI a través de los runtimes habituales.
- **Latencia y throughput**: no se han publicado mediciones. Como referencia de orden de magnitud para un modelo denso de 1,5B en Q4_K_M, es esperable que genere decenas de tokens por segundo en una GPU de consumo media y varios tokens por segundo en CPU, pero son estimaciones no verificadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lalo-1.5b (este) | 1,54 B | 32.768 tokens (heredado) | Apache 2.0 | GGUF | Ajuste QLoRA en turco para atención al estudiante; sin evaluación publicada |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base multilingüe, con evaluación publicada por Alibaba |
| Qwen2.5-1.5B-Instruct-GGUF | 1,54 B | 32.768 tokens | Apache 2.0 | GGUF | Cuantizaciones oficiales del base; opción de referencia si no se necesita el dominio turco |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Mayor contexto, licencia con restricciones de uso comercial para grandes entidades |
| Gemma 2 2B Instruct | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Contexto más corto y licencia con condiciones de uso |

La comparación cualitativa es clara: frente al modelo base, lalo-1.5b gana especialización en turco administrativo pero pierde trazabilidad, porque no hay ninguna métrica publicada que cuantifique la mejora ni el posible olvido catastrófico en tareas generales. Frente a Llama 3.2 1B y Gemma 2 2B, el atractivo principal es la licencia Apache 2.0 sin condiciones adicionales y el contexto de 32.768 tokens, superior al de Gemma 2 2B.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: no hay benchmarks, ni comparación con el modelo base, ni conjunto de validación publicado. Cualquier afirmación sobre su calidad es una suposición.
- **Riesgo alto de alucinación en datos institucionales**: al ser un ajuste de 1,5B sin verificación documental, puede inventar plazos, importes de tasas, números de resolución o artículos de reglamento. En producción debe combinarse con RAG y con verificación humana de cualquier dato crítico.
- **Dominio y idioma muy restringidos**: está pensado para turco y para una única institución (Lale Teknik Üniversitesi). Su comportamiento en castellano o en otras lenguas no está documentado y probablemente sea deficiente.
- **Posible olvido catastrófico**: un ajuste QLoRA sobre un modelo de 1,5B suele degradar capacidades generales (código, matemáticas, instrucciones complejas). No se ha medido.
- **Sesgos no auditados**: no se documenta la composición del dataset de ajuste, por lo que no es posible evaluar sesgos de género, origen regional o clase social en las respuestas administrativas.
- **Trazabilidad del ajuste**: el modelo original es `ErdalX/lalo-1.5b`, un autor distinto del que publica la conversión GGUF. Conviene revisar la ficha original antes de confiar en la procedencia de los datos de entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial y modificación sin restricciones adicionales, pero se ofrece sin garantías. Al derivar de Qwen2.5, se mantienen las obligaciones de atribución razonables.
- **Madurez del repositorio**: 0 descargas y 0 likes en el momento de la ficha, creado el 27 de octubre de 2026. No hay señales de uso en producción ni de mantenimiento.
- **Tamaño del repositorio**: 15,3 GB en total porque incluye trece cuantizaciones; conviene descargar un único fichero en lugar de clonar el repositorio completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tinyopsec/lalo-1.5b-GGUF
- Modelo base (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Ajuste original en safetensors: https://huggingface.co/ErdalX/lalo-1.5b
- Repositorio de llama.cpp (herramienta de conversión y runtime): https://github.com/ggml-org/llama.cpp
- Cuantizaciones GGUF del modelo base (referencia comparativa): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
