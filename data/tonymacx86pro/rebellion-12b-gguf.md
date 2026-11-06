# tonymacx86PRO/rebellion-12b-GGUF

## Resumen

Rebellion 12B GGUF es la versión cuantizada en formato GGUF de Rebellion 12B, un ajuste fino mediante LoRA sobre Gemma 4 12B de Google orientado a conocimiento de la franquicia Devil May Cry y a conversación de rol. Lo publica el usuario tonymacx86PRO como proyecto fan no oficial, sin vinculación con Capcom, y está pensado para ejecutarse en llama.cpp con un consumo de VRAM contenido: el autor indica que cabe en una GPU de 12 GB.

El modelo resuelve un problema muy concreto: inyectar conocimiento factual y estilístico de un dominio cerrado (lore de Devil May Cry) en un modelo base de propósito general, manteniendo al mismo tiempo las capacidades generales del original. Según la model card, el ajuste mejora sustancialmente las métricas de conocimiento del dominio respecto al Gemma 4 12B QAT base, con una pérdida mínima en MMLU.

La relevancia técnica de esta ficha está en la estrategia de cuantización: el LoRA se entrenó sobre una base ya cuantizada (QAT Q4_0), por lo que recuantizar a Q4_0 o Q4_K destruye la mayor parte de la señal aprendida. El autor publica únicamente IQ4_XS con importance matrix, que preserva el ajuste con una divergencia KL de 0,07 frente al modelo sin fusionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), con cabeza de borrador MTP para decodificación especulativa |
| Parámetros totales | 11.907.350.576 (11,9 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ4_XS con importance matrix (única publicada); el autor desaconseja Q4_0 y Q4_K por pérdida del ajuste |
| Idiomas soportados | Inglés (en), español (es), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B en su variante QAT (quantization-aware training) Q4_0 publicada por Google, sobre la que se aplica un LoRA posteriormente fusionado en los pesos. La arquitectura subyacente es un transformer decoder-only de la familia Gemma 4, con una cabeza de borrador MTP (multi-token prediction) que el autor confirma que sigue funcionando tras la fusión del LoRA y que permite decodificación especulativa en llama.cpp.

Los datos de entrenamiento del ajuste provienen de texto de la Devil May Cry Wiki (licenciada CC BY-SA 3.0), según declara el autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable no está en el entrenamiento sino en el pipeline de cuantización: al ser el LoRA un ajuste pequeño sobre una rejilla Q4_0, el autor demuestra empíricamente que IQ4_XS con importance matrix conserva la señal (KL 0,07) mientras que Q4_0 (KL 0,98) y Q4_K_M (KL 0,61) la eliminan en su mayor parte.

## Capacidades

- Generación de texto conversacional con especialización en lore de Devil May Cry (personajes, tramas, objetos, terminología de la franquicia).
- Roleplay y conversación multi-turno con estilo narrativo, uno de los casos de uso declarados en las etiquetas del repositorio.
- Conocimiento factual de dominio cerrado: el benchmark DMC Lore Bench mide hechos, temas estudiados, temas no estudiados y preguntas trampa.
- Multilingüe en inglés, español y ruso, según los metadatos de idioma del repositorio.
- Decodificación especulativa mediante la cabeza MTP de Gemma 4, compatible con la fusión del LoRA.
- Capacidades generales heredadas de Gemma 4 12B (MMLU 78,0% en la versión IQ4_XS), aunque no se detallan en la información disponible otras habilidades como código, matemáticas o tool calling.
- Variante "heretic" con los rechazos eliminados, pensada para usuarios que necesitan respuestas sin filtros de negativa.

## Casos de uso

- Chatbot de rol de la franquicia: el modelo puede mantener conversaciones multi-turno interpretando personajes de Devil May Cry, apoyándose en su conocimiento factual del lore y en un estilo conversacional ajustado específicamente para ello.
- Asistente para comunidades de fans: atención de dudas sobre tramas, cronologías y detalles del universo, con una tasa de acierto en preguntas trampa del 74,1% en la versión IQ4_XS, muy superior al 48,3% del base.
- Generación de contenido narrativo derivado: redacción de fan fiction, descripciones de escenarios o diálogos consistentes con el canon, aprovechando el ajuste estilístico del LoRA.
- Despliegue en hardware de consumo: al ocupar 6,6 GB en IQ4_XS, puede ejecutarse en una GPU de 12 GB con llama-server, lo que lo hace viable en estaciones de trabajo modestas o equipos domésticos.
- Prototipado de sistemas RAG sobre wikis temáticas: sirve como generador final en pipelines de recuperación aumentada sobre bases de conocimiento de dominio, donde el ajuste reduce las alucinaciones sobre el tema concreto.
- Investigación sobre cuantización de LoRAs: el repositorio documenta con métricas KL el impacto de distintas cuantizaciones sobre un adaptador entrenado en una base QAT, lo que lo convierte en un caso de estudio reproducible para quien investigue pipelines de cuantización.
- Evaluación comparativa de robustez ante premisas falsas: la variante heretic permite medir el trade-off entre eliminar rechazos y aumentar la credulidad ante preguntas trampa (65,5% frente al 74,1% de la versión estándar).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre DMC Lore Bench y MMLU, en modo sin thinking:

| Modelo | Facts | Studied | Unstudied | Trick questions | MMLU |
|---|---|---|---|---|---|
| Gemma 4 12B QAT (base, sin thinking) | 24,2% | 22,5% | 25,1% | 48,3% | 78,7% |
| Rebellion 12B (LoRA, sin thinking) | 33,6% | 40,1% | 30,2% | 75,9% | 77,3% |
| rebellion-12b-IQ4_XS (sin thinking) | 31,7% | 38,7% | 28,0% | 74,1% | 78,0% |
| rebellion-12b-heretic-IQ4_XS (sin thinking) | 32,1% | 38,7% | 28,7% | 65,5% | 76,7% |

Métricas de cuantización declaradas por el autor (divergencia KL frente al modelo sin fusionar): Q4_0 0,98; Q4_K_M 0,61; IQ4_XS con importance matrix 0,07.

Rendimiento de inferencia declarado: aproximadamente 70 tok/s en una RTX 3060 con decodificación especulativa activada mediante la cabeza MTP.

## Requisitos de hardware

- VRAM estimada: 6,6 GB para el archivo IQ4_XS estándar y 6,4 GB para la variante heretic, más el overhead de contexto y de la caché KV.
- GPU recomendadas: el autor indica que cabe en una GPU de 12 GB; una RTX 3060 es suficiente según las cifras de throughput publicadas.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, etc.).
- Opciones de despliegue: llama.cpp mediante `llama-server`; el formato GGUF es compatible con el ecosistema llama.cpp, aunque no se confirma en la información disponible el soporte específico en Ollama, vLLM o TGI.
- Latencia y throughput: aproximadamente 70 tok/s en RTX 3060 con decodificación especulativa MTP (`--spec-draft-model mtp-gemma-4-12B-it-Q4_0.gguf --spec-type draft-mtp --spec-draft-n-max 3`).
- Parámetros de muestreo recomendados por el autor: temperature 1.0, top-p 0.95, top-k 64.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| rebellion-12b-IQ4_XS | 11,9 B | No disponible | Lore de Devil May Cry, rol | Apache 2.0 | GGUF |
| Gemma 4 12B QAT (base) | 12 B (aprox.) | No disponible | Propósito general | Apache 2.0 (según el autor) | GGUF / safetensors |
| rebellion-12b-heretic-IQ4_XS | 11,9 B | No disponible | Lore de DMC sin rechazos | Apache 2.0 | GGUF |

La comparación más directa es contra el Gemma 4 12B QAT original: Rebellion mejora entre 7 y 18 puntos porcentuales en las métricas de dominio de DMC Lore Bench y pierde entre 0,7 y 1,4 puntos en MMLU. La variante heretic reduce los rechazos pero empeora 8,6 puntos en preguntas trampa respecto a la versión estándar. No se dispone en la información proporcionada de comparaciones con otros modelos de rol o de dominio equivalente.

## Limitaciones y advertencias

- Proyecto fan no oficial: no está afiliado a Capcom; *Devil May Cry* es una marca registrada de Capcom. El uso comercial del contenido derivado del lore puede estar sujeto a restricciones adicionales de la licencia CC BY-SA 3.0 de la wiki de origen.
- Riesgo de alucinación en el dominio: incluso la mejor variante acierta solo el 31,7% de los hechos en DMC Lore Bench, por lo que no es fiable como fuente de verdad factual sin verificación.
- La variante heretic aumenta la credulidad ante premisas falsas (65,5% en preguntas trampa frente al 74,1%), un riesgo relevante en producción si el modelo se usa para responder consultas.
- Solo se publica IQ4_XS: no hay versiones de mayor precisión (Q8, FP16) ni cuantizaciones alternativas validadas, lo que limita el margen para recuperar calidad si se necesita.
- Idiomas limitados a inglés, español y ruso; no se garantiza un rendimiento equivalente en otras lenguas.
- No se especifican la longitud de contexto ni el comportamiento del modelo en ventanas largas, un dato crítico para despliegues con conversaciones extensas o RAG.
- No se documentan en la información disponible capacidades de tool calling, agentes o razonamiento multi-paso, por lo que no deben asumirse en un pipeline de producción.
- El modelo base es una cuantización QAT Q4_0, lo que fija un techo de calidad intrínseco sobre el que el LoRA solo actúa como ajuste superficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tonymacx86PRO/rebellion-12b-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/tonymacx86PRO/rebellion-12b
- Dataset de evaluación DMC Lore Bench: https://huggingface.co/datasets/tonymacx86PRO/dmc-lore-bench
- Base heretic utilizada para la variante sin rechazos: https://huggingface.co/OS-Software/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic-v3
- Wiki de origen de los datos de entrenamiento: https://devilmaycry.fandom.com
