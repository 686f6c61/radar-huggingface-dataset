# taobao-mnn/MNN-Pocket-0.3B-Dec

## Resumen

MNN-Pocket-0.3B-Dec es un modelo de decisión no autorregresivo desarrollado por taobao-mnn (equipo de Alibaba vinculado a MNN), construido sobre el backbone MNN-Pocket-0.3B. No es un modelo conversacional: recibe un `state` (contexto textual) y un conjunto de `questions` estructuradas, y devuelve decisiones con probabilidades sobre candidatos en un único forward pass. El backbone completo y el `lm_head` se conservan, y se añade un adaptador LoRA junto con una cabeza de puntero (pointer head) específica para la tarea de decisión.

La arquitectura subyacente es un transformer decoder-only de 28 capas con 896 dimensiones ocultas, atención GQA (14 cabezas de consulta, 2 de clave/valor, head_dim 64) y FFN de 2560 con activación SiLU. El modelo admite peticiones de hasta 32.768 tokens y está pensado para ejecución on-device mediante el runtime MNN, con pesos en bfloat16 y la cabeza de decisión en float32.

Su relevancia radica en el enfoque: en lugar de generar texto libre, formula la clasificación y el scoring como una decisión sobre posiciones candidatas, lo que permite integrar un modelo de 300M parámetros en flujos de enrutamiento, triaje o puntuación con latencia de un solo paso y sin decodificación autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (28 capas) con adaptador LoRA y pointer head para decisión no autorregresiva |
| Parametros totales | ~300M en el backbone (723 MB en bfloat16) + 28,7 MB de adaptador LoRA + 1,8 MB de cabeza de decisión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens de petición; entradas más largas lanzan error en lugar de truncarse |
| Tipos de cuantizacion | No disponible (se documentan dtypes de inferencia float32, bfloat16 y float16; no se listan cuantizaciones) |
| Idiomas soportados | Chino e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone, adaptador y cabeza), configuración JSON y script de inferencia Python |

Otras especificaciones: hidden size 896, 14 cabezas de atención con GQA de 2 KV heads y head_dim 64, FFN intermedio de 2560 con SiLU, vocabulario de 65.536 tokens, LoRA con r=16, alpha=32, dropout=0,05 sobre q/k/v/o/gate/up/down_proj sin fusionar, pointer head de anchura 256 en FP32 con producto escalar escalado sobre posiciones candidatas.

## Arquitectura y entrenamiento

El modelo parte del backbone MNN-Pocket-0.3B, un transformer decoder-only de 28 capas idéntico byte a byte al modelo base (mismo checksum de `model.safetensors`). Sobre él se aplica un adaptador LoRA (r=16, alpha=32, dropout 0,05) que se mantiene sin fusionar, y se añade una cabeza de puntero independiente que proyecta a anchura 256 y calcula producto escalar escalado sobre las posiciones de los candidatos. La decisión se obtiene en un único forward pass, sin generación token a token.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí indica que existe una temperatura calibrada publicada en `temperature.json` con estadísticas de ajuste, lo que sugiere un proceso de calibración posterior al entrenamiento para las probabilidades de salida. El informe técnico está referenciado con arXiv:2611.12311.

## Capacidades

- Decisión no autorregresiva: devuelve una decisión con probabilidades sobre candidatos en un solo paso hacia delante.
- Preguntas de tipo `choice`: selecciona la clave ganadora entre un conjunto de candidatos descritos.
- Preguntas de tipo `noul`: decisión booleana con probabilidad asociada al valor `true`.
- Preguntas de tipo `score`: puntuación como índice ponderado por probabilidad sobre una escala ordenada, con leyenda índice-etiqueta.
- Salida estructurada con `type`, `probabilities`, `input_tokens` y la temperatura aplicada.
- Soporte multilingüe limitado a chino e inglés.
- Ejecución on-device mediante el runtime MNN, con dtypes float32, bfloat16 y float16.
- No soporta tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito: es un modelo de decisión, no un modelo conversacional.
- No dispone de plantilla de chat; la entrada se gestiona como petición estructurada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del cliente como `state` y una pregunta `choice` con departamentos candidatos (devoluciones, facturación, etc.), devolviendo la probabilidad de cada uno. Es adecuado por su latencia de un solo paso y su ventana de 32.768 tokens, que permite incluir historiales largos.
- Triaje de correo o mensajes entrantes: clasificación `choice` entre categorías predefinidas con umbral de confianza derivado de `probabilities`, útil para derivar a colas humanas cuando la probabilidad máxima es baja.
- Puntuación de calidad o satisfacción: pregunta `score` sobre una escala ordenada (por ejemplo, de muy negativo a muy positivo) con índice ponderado por probabilidad, aplicable a encuestas o reseñas.
- Moderación binaria: pregunta `noul` para decidir si un contenido cumple una política, con la probabilidad de `true` como señal calibrada de riesgo.
- Extracción de señales en pipelines de datos: clasificación de documentos o registros con múltiples preguntas en una sola petición, aprovechando el límite de 32.768 tokens para agrupar contexto.
- Despliegue en dispositivos con recursos limitados: al tratarse de un modelo de ~300M parámetros con runtime MNN, puede ejecutarse en CPU o en hardware móvil/edge para decisiones locales sin depender de la nube.
- Prefiltrado antes de un LLM mayor: usar las probabilidades del modelo para descartar o priorizar casos y reservar el modelo grande solo para los ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el backbone ocupa 723 MB en bfloat16, más 28,7 MB de adaptador y 1,8 MB de cabeza; en float32 el consumo de pesos se duplica aproximadamente. No se publican cifras de VRAM pico con activaciones para 32.768 tokens.
- GPU recomendadas: no disponible en la información proporcionada; el modelo está diseñado para ejecución on-device vía MNN, por lo que la CPU es un objetivo explícito (`device="cpu"` en el ejemplo de la model card).
- GPU de consumo: por tamaño (~300M parámetros) es plausible en GPUs de consumo, pero no se confirma en la documentación disponible.
- Opciones de despliegue: runtime MNN y el script `inference.py` incluido con la API `PocketDecisionModel`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de decisión no autorregresiva ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto libre; usarlo como tal produciría resultados incorrectos.
- Solo admite chino e inglés; no hay soporte documentado para castellano.
- Las peticiones que superan los 32.768 tokens lanzan un error en lugar de truncarse, lo que exige control de longitud en el pipeline.
- El directorio `base/` debe permanecer dentro del directorio del modelo: el cargador rechaza rutas configuradas que salgan de él.
- El adaptador LoRA se distribuye sin fusionar, lo que añade pasos de carga y puede afectar a la latencia si no se integra correctamente.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de clasificación, el riesgo principal es una calibración deficiente de las probabilidades en dominios alejados de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del backbone base y del runtime MNN.
- No se detallan los datos de entrenamiento, lo que dificulta evaluar la cobertura de dominios y el riesgo de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Colección MNN-Pocket 0.3B: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Informe técnico: https://arxiv.org/pdf/2611.12311
- README en chino: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec/blob/main/README-cn.md
