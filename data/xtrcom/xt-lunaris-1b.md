# XtrCom/XT-Lunaris-1B

## Resumen

XT-Lunaris-1B es el sucesor anunciado de XT-Luna-1B, un ajuste fino de MiniCPM5-1B (openbmb) orientado a trabajo agéntico de largo horizonte en ventanas de 8k a 32k tokens, manteniendo el carácter declarado de la familia XT: pensamiento estructurado largo, voz humanizada y confirmación explícita antes de ejecutar acciones destructivas. El autor, XtrCom, lo presenta como una reconstrucción desde cero del modelo base, no como una evolución del GGUF fusionado de la generación anterior.

El dato más importante para cualquiera que evalúe el modelo es su estado: la model card está marcada como borrador y declara explícitamente que no hay pesos, ni adaptadores, ni cuantizaciones en el repositorio. Las etapas 1 (construcción del corpus de contexto largo) y 2 (medición de anchos en una L4) son el trabajo actual; el resto del plan (SFT, OPD con profesor, GRPO) está planificado, no ejecutado. No existen resultados de benchmarks publicados.

La relevancia del proyecto es metodológica: al ser un modelo de ~1B parámetros, el estado completo de entrenamiento con contexto largo cabe en una única GPU NVIDIA L4 de 22 GB, lo que permite medir memoria pico y tok/s a 8k, 16k y 32k en lugar de asumirlos. Esa es la justificación declarada del tamaño, y también su principal límite de capacidad frente a modelos de 4B o 9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer estándar (tipo llama) heredada del base: 24 capas, hidden size 1536 |
| Parametros totales | ~1B (denominación del modelo; el autor no publica el recuento exacto) |
| Longitud de contexto | 131.072 tokens nativos en el modelo base; el proyecto entrena y mide a 8k, 16k y 32k |
| Tipos de cuantizacion | no disponible (el autor declara que no hay ninguna cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 para card y recopilación; los pesos derivados deben cumplir además la Apache-2.0 del modelo base |
| Formato de pesos | no disponible; no hay pesos. El plan declara `transformers` y dtype bfloat16 |

Datos adicionales del modelo base verificados por el autor: vocabulario de 130.560 tokens, sin necesidad de escalado RoPE para operar entre 8k y 32k, y contexto nativo de 131.072. Las descargas y los likes del repositorio son 0 en la fecha de la información, y la fecha de creación y actualización es la misma (2026-10-26), lo que confirma que no ha habido iteraciones posteriores.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base MiniCPM5-1B: un transformer convencional de tipo llama con 24 capas, dimensión oculta 1536 y un vocabulario de 130.560 entradas. No hay MoE, ni SSM, ni atención híbrida, ni decodificación especulativa declarada. El contexto nativo del base es de 131.072 tokens, suficiente para cubrir los anchos objetivo (8k-32k) sin recurrir a escalado RoPE, lo que simplifica el entrenamiento: el modelo no necesita aprender una extrapolación posicional nueva, solo a usar la ventana.

El plan de entrenamiento tiene cinco etapas declaradas en orden. La primera es la construcción de datos de contexto largo real, con procedencia y términos de licencia por fuente, porque las mediciones sobre la generación anterior muestran filas cortas (mediana de 561 a 600 tokens, percentil 90 en torno a 1.450 y ningún registro por encima de 1.882 en el slice específico de adaptación al contexto). La segunda es la medición de anchos en la L4 a 8k, 16k y 32k, con entropía cruzada troceada por fuerza: un tensor de logits fp32 a 32k con este vocabulario ocuparía unos 17 GB. La tercera es SFT en el ancho elegido, con checkpointing de gradientes y empaquetado de secuencias como complemento de las filas largas, nunca como sustituto. La cuarta es OPD (destilación on-policy) con profesores más grandes —`ornith-ai/Ornith-1.5-9B` (MIT, 9B) y `XHToken/Spark-X2.5-4B` (Apache-2.0, 4B, contexto nativo de 1M)— contra un control Qwen3.5-4B; el profesor de 9B en bf16 ocupa unos 19,3 GB y no puede compartir la L4 con el estudiante, por lo que se ejecutaría cuantizado o como generador offline. La quinta es GRPO para los comportamientos que el SFT solo sugiere: eficiencia del razonamiento, confirmación antes de acciones destructivas y rechazo de peticiones genuinamente dañinas.

La evaluación prevista se basa en una batería de sondas propias (voz, estructura, honestidad, comportamiento de rechazo y puerta de acción destructiva) más comprobaciones específicas de contexto largo, siempre comparadas contra el modelo base en el mismo harness. No se han publicado resultados de esa batería.

## Capacidades

Todas las capacidades siguientes son objetivos declarados de diseño, no funcionalidades verificadas con pesos publicados.

- Generación de texto con razonamiento estructurado largo, orientado a sesiones agénticas de múltiples pasos.
- Trabajo en ventanas de 8k a 32k tokens, con atención a información situada en profundidad dentro del contexto.
- Comprensión de código en tareas largas y continuación de sesiones de agente prolongadas.
- Puerta de confirmación antes de acciones destructivas, entrenada explícitamente en la etapa de GRPO.
- Rechazo calibrado ante peticiones dañinas, también como objetivo de GRPO.
- Voz humanizada y formato de respuesta consistente con la familia XT.
- Soporte de tool calling / function calling: no documentado en la model card; el encuadre es agéntico pero no se especifica formato ni protocolo.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no declarados.

## Casos de uso

- Asistente local en dispositivo: con ~1B parámetros, el modelo está pensado para ejecutarse en hardware de consumo manteniendo 8k-32k de contexto, lo que permite asistentes personales que conservan el historial de una sesión de trabajo completa sin truncar.
- Automatización de agentes de largo horizonte: sesiones multi-paso con historial acumulado de decenas de miles de tokens, donde el modelo puede releer sus propias acciones previas; el diseño de GRPO con confirmación previa encaja con agentes que ejecutan comandos de shell o modifican ficheros.
- Comprensión de código en repositorios: análisis de ficheros individuales largos o de varios ficheros concatenados dentro de la ventana de 32k, para tareas de revisión, explicación o generación de parches en pipelines de CI/CD.
- Despliegue en el borde con requisitos de privacidad: al caber en GPUs pequeñas, permite procesar documentación sensible sin salida a la red, algo relevante en entornos con restricciones de datos.
- Evaluación reproducible de contexto largo: el propio diseño del proyecto lo convierte en un banco de pruebas útil para investigadores que quieran medir memoria pico y tok/s a distintos anchos en una única L4 de 22 GB.
- Procesamiento por lotes de documentos largos: clasificación, extracción o resumen de contratos, informes o transcripciones que superan los 8k tokens, en una sola tarjeta y con coste controlado.
- Generación de datos sintéticos y anotación asistida: un modelo de este tamaño puede usarse como anotador barato a gran escala cuando la ventana de contexto es el factor limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la batería de evaluación prevista (voz, estructura, honestidad, rechazo, puerta de acción destructiva, tarea en profundidad de contexto, comprensión de código largo y continuación de sesiones agénticas) pero no incluye ninguna cifra. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de las pruebas de contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética a partir de ~1B parámetros, no dato del autor): en bf16 en torno a 2 GB de pesos; en int8 alrededor de 1 GB; en int4 unos 0,6 GB. A esto hay que sumar la caché KV, cuyo coste a 32k no se puede calcular con precisión porque la model card no publica el número de cabezas de atención.
- GPU de referencia del proyecto: NVIDIA L4 de 22 GB. El autor justifica el tamaño de 1B precisamente porque el modelo completo más el estado de entrenamiento de contexto largo cabe en esa tarjeta.
- Dato de memoria del entrenamiento: un tensor de logits fp32 a 32k con vocabulario de 130.560 entradas ocupa aproximadamente 17 GB, lo que obliga a entropía cruzada troceada.
- Profesor de destilación: `ornith-ai/Ornith-1.5-9B` en bf16 ocupa unos 19,3 GB y no puede convivir con el estudiante en la L4; se plantea cuantizado o como generador offline.
- GPU de consumo: no hay cifras publicadas. Por el tamaño del modelo, una vez existan pesos en int4 debería caber en tarjetas con 4-6 GB o más (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090), pero es una estimación, no una medición.
- Opciones de despliegue: el repositorio declara `transformers` y el tag `endpoints_compatible`. Al ser una arquitectura tipo llama, son candidatos razonables vLLM, llama.cpp, Ollama y TGI, pero no se puede desplegar nada hasta que se publiquen pesos.
- Latencia y throughput: no disponibles. El plan de la etapa 2 contempla medir tok/s a 8k, 16k y 32k, pero no se han publicado los resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos disponibles | Benchmarks publicados |
|---|---|---|---|---|---|
| XT-Lunaris-1B | ~1B | 131.072 nativos en el base; objetivo 8k-32k | CC-BY-4.0 (card) + Apache-2.0 (base) | No (borrador) | No |
| openbmb/MiniCPM5-1B (base) | ~1B | 131.072 | Apache-2.0 | Sí | No consultados en la información disponible |
| XtrCom/XT-Luna-1B (predecesor) | ~1B (1,08 según agregador externo) | 8.192 según agregador externo, no confirmado | No disponible en la información | Sí | No |
| Qwen3.5-4B (control de evaluación) | 4B | No disponible | No disponible | No disponible | No disponible |
| XHToken/Spark-X2.5-4B (profesor) | 4B | 1M nativo | Apache-2.0 | No disponible en la información | No disponible |
| ornith-ai/Ornith-1.5-9B (profesor) | 9B | No disponible | MIT | No disponible en la información | No disponible |

La comparación relevante es con el propio modelo base y con el predecesor: XT-Lunaris-1B no aporta, por ahora, ninguna capacidad que no esté ya en MiniCPM5-1B, y su ventaja declarada es el entrenamiento específico en filas largas (4k-32k) frente a las filas cortas del corpus de XT-Luna-1B, cuya mediana se sitúa entre 561 y 600 tokens.

## Limitaciones y advertencias

- No hay pesos, ni adaptadores, ni cuantizaciones. El repositorio no es utilizable para inferencia en el momento de la información.
- Etapas 1 y 2 en curso; SFT, OPD y GRPO están planificados, no ejecutados. Cualquier capacidad descrita es un objetivo, no un hecho medido.
- Ausencia total de benchmarks publicados, incluida la propia batería de sondas del autor.
- Idiomas soportados no documentados: no se puede asumir competencia en castellano ni en ningún otro idioma distinto del que herede el base.
- La licencia de la card es CC-BY-4.0, pero los pesos distribuidos deben cumplir además la Apache-2.0 de MiniCPM5-1B; hay que verificar ambas antes de un uso comercial.
- Riesgo de alucinación: no cuantificado. Un modelo de ~1B tiene capacidad limitada de razonamiento multi-paso y de verificación factual, y el modo de pensamiento largo no elimina ese riesgo.
- Riesgo específico en uso agéntico: el modelo está diseñado para operar con acciones destructivas y la salvaguarda es una puerta de confirmación entrenada con GRPO, no un mecanismo determinista. En producción conviene imponer confirmación a nivel de orquestador.
- La evaluación prevista la diseña y ejecuta el propio autor con sondas propias, no con harness estándar de terceros; el sesgo de autoevaluación es relevante.
- Restricción presupuestaria declarada: tope de campaña de 100 USD y 5-10 USD por sesión. Eso limita el volumen de entrenamiento y el número de iteraciones posibles.
- Procedencia de datos: la etapa 1 depende de datasets públicos con licencias permisivas y de repositorios propios; la mezcla final y sus términos no están publicados.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso comunitario que permita validar nada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XtrCom/XT-Lunaris-1B
- Predecesor XT-Luna-1B: https://huggingface.co/XtrCom/XT-Luna-1B
- Modelo base MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Profesor planificado Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Profesor planificado Spark-X2.5-4B: https://huggingface.co/XHToken/Spark-X2.5-4B
- Ficha de XT-Luna-1B en FriendliAI: https://friendli.ai/models/XtrCom/XT-Luna-1B
- Análisis de XT-Luna-1B en AGI Hunt: https://agihunt.info/en/p/1a14ab416fedfa2dbd061ca41ed
- Índice de terceros con métricas de XT-Luna-1B: https://free2aitools.com/model/xtrcom/xt-luna-1b
