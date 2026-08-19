# zviratko/Qwen3.8-27B-Brainwaves-oQ6e-mtp

## Resumen

El modelo `zviratko/Qwen3.8-27B-Brainwaves-oQ6e-mtp` es una cuantización mixta de 6 bits del modelo `nightmedia/Qwen3.8-27B-Brainwaves`, un fine-tune del modelo multimodal Qwen3.8-27B desarrollado por el equipo Qwen de Alibaba. La cuantización se ha realizado con la herramienta oQ (oMLX v0.6.2), que aplica precisión mixta por capas, y está optimizada para el ecosistema MLX de Apple Silicon. El resultado es un modelo de 23,7 GB que mantiene la arquitectura híbrida del original (atención lineal en 48 de 64 capas, torre de visión y cabezal de decodificación especulativa MTP) con una ventana de contexto nativa de 262K tokens, extensible a 1M.

Esta ficha se centra en el modelo cuantizado, pero las capacidades y benchmarks referenciados provienen del modelo base, ya que no se han publicado evaluaciones específicas para esta versión cuantizada. La cuantización reduce significativamente el uso de memoria y acelera la inferencia en hardware Apple, lo que lo hace viable para despliegues locales en portátiles y estaciones de trabajo con suficiente RAM unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal con atencion hibrida: lineal en 48/64 capas, torre de vision, MTP) |
| Parametros totales | 27B (modelo base); 6.612.941.552 segun safetensors cuantizado (inconsistencia, ver limitaciones) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262K tokens nativo, extensible a 1M (modelo base) |
| Tipos de cuantizacion | 6 bits, group size 64 (oQ6e-mtp, precision mixta) |
| Idiomas soportados | no disponible (el modelo base soporta multilingue, pero no se especifica para esta variante) |
| Licencia | no disponible (el modelo base usa Apache 2.0, pero la cuantizacion no declara licencia propia) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con una arquitectura hibrida: 48 de sus 64 capas utilizan atencion lineal (linear attention) para reducir el coste computacional en secuencias largas, mientras que las 16 restantes mantienen atencion full. Incorpora una torre de vision que procesa imagenes y video, y un cabezal de decodificacion especulativa (MTP) que acelera la generacion. El entrenamiento del modelo base incluyo una fase de pre-entrenamiento con datos multimodales y un posterior ajuste fino con tecnicas de RLHF y DPO, segun la documentacion oficial de Qwen. El modelo `nightmedia/Qwen3.8-27B-Brainwaves` es un fine-tune adicional sobre esta base, aunque no se dispone de detalles sobre su dataset o metodologia.

La cuantizacion oQ6e-mtp aplica 6 bits con group size 64, utilizando precision mixta: las capas mas sensibles (como las de atencion full o las de salida) pueden conservar mayor precision, mientras que las capas lineales se cuantizan mas agresivamente. Esta tecnica, implementada en la libreria oMLX, busca minimizar la degradacion respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento complejo (matematicas, logica, analisis) gracias a la arquitectura de 27B parametros.
- Comprension multimodal: entrada de imagenes y video (nativo), con capacidad de describir, responder preguntas visuales y razonar sobre contenido visual.
- Generacion de codigo y soporte de agentes: el modelo base destaca en tareas de coding y agentic workflows, con soporte para tool calling y multi-step reasoning.
- Ventana de contexto muy larga (262K tokens nativa) que permite procesar documentos extensos, libros completos o conversaciones largas.
- Decodificacion especulativa integrada (MTP) que reduce la latencia de generacion.
- Capacidades multilingues del modelo base (aunque no se especifican idiomas concretos para esta variante cuantizada).

## Casos de uso

- Analisis de documentos extensos: gracias a la ventana de 262K tokens, el modelo puede procesar contratos, informes anuales o tesis completas en una sola pasada, extrayendo informacion y resumiendo sin perder contexto.
- Asistente de codigo en entornos locales: con soporte de tool calling y generacion de codigo, puede integrarse en IDEs o pipelines de CI/CD para revision de codigo, generacion de tests o autocompletado avanzado, ejecutandose en una Mac con suficiente RAM unificada.
- Automatizacion de oficina: el modelo base esta optimizado para tareas como generacion de presentaciones, resumen de correos o redaccion de documentos, y la cuantizacion permite usarlo en portatiles sin conexion a internet.
- Analisis de imagenes y video en local: la torre de vision permite clasificar imagenes, extraer texto de capturas o describir contenido audiovisual, util para archivado o accesibilidad.
- Agentes conversacionales con memoria larga: la ventana de contexto amplia permite mantener conversaciones con historial extenso, adecuado para chatbots de soporte o asistentes personales que recuerdan interacciones previas.
- Investigacion academica: para investigadores que necesitan ejecutar un modelo multimodal de 27B en hardware local sin depender de la nube, esta cuantizacion ofrece un equilibrio entre rendimiento y requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version cuantizada. Los datos disponibles corresponden al modelo base Qwen3.8-27B, segun la documentacion oficial y el blog de referencia:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE (software engineering) | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |
| MathVision | evaluado con prompt fijo, sin puntuacion publicada |

Estos valores no son directamente extrapolables a la version cuantizada, ya que la cuantizacion de 6 bits puede provocar una degradacion tipica de 1-3 puntos en tareas de razonamiento, aunque no se ha medido en este caso.

## Requisitos de hardware

- Tamano del repositorio: 23,7 GB, lo que implica que la carga en memoria requiere al menos 24 GB de RAM unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 32 GB de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores). En chips con 24 GB puede funcionar con cuantizacion mas agresiva o swapping, pero con penalizacion de rendimiento.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB VRAM podria intentarlo, pero el formato MLX es exclusivo de Apple; para NVIDIA habria que convertir a otro formato).
- Opciones de despliegue: exclusivamente mediante MLX (libreria de Apple). Puede usarse con `mlx-lm` para generacion, o integrarse en aplicaciones propias via Python. No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no se han publicado mediciones para esta cuantizacion. En un M2 Max con 64 GB, se estima una velocidad de generacion de 20-40 tokens/s para modelos de 27B en 6 bits, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | safetensors (BF16) | Modelo base, requiere ~54 GB en BF16 |
| Qwen3.8-27B-Brainwaves-oQ6e-mtp (este) | 27B (nominal) | 262K | no disponible | MLX 6-bit | Cuantizado, 23,7 GB, solo Apple |
| Llama 3.3 70B (cuantizado 4-bit) | 70B | 128K | Llama 3.3 | GGUF | Mas grande, pero requiere mas VRAM y no es multimodal |
| Qwen2.5-VL-32B (cuantizado) | 32B | 128K | Apache 2.0 | GGUF | Alternativa multimodal con menor contexto y sin atencion lineal |

La comparativa muestra que este modelo ofrece una ventana de contexto superior y arquitectura hibrida, pero su disponibilidad se limita a MLX, lo que restringe su uso a hardware Apple.

## Limitaciones y advertencias

- La cuantizacion de 6 bits puede introducir degradacion en tareas de razonamiento complejo o generacion de codigo, aunque no se ha cuantificado en este modelo.
- El numero de parametros reportado en safetensors (6,6B) no coincide con los 27B del modelo base; es probable que sea un error del repositorio o una representacion interna, pero no se puede confirmar.
- El modelo base tiene una tendencia conocida al "overthinking" (generar cadenas de razonamiento excesivamente largas para tareas simples), lo que puede aumentar la latencia y el coste computacional.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma especificas de esta variante. El modelo base puede heredar sesgos de sus datos de entrenamiento.
- La licencia no esta declarada para esta cuantizacion; aunque el modelo base es Apache 2.0, el autor de la cuantizacion no especifica los terminos, por lo que se recomienda contactar con el autor antes de un uso comercial.
- El formato MLX es exclusivo de Apple Silicon; no es portable a otros ecosistemas sin una conversion adicional (que podria requerir herramientas no oficiales).
- Al ser un modelo cuantizado con oQ, no se garantiza la compatibilidad con versiones futuras de MLX o oMLX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zviratko/Qwen3.8-27B-Brainwaves-oQ6e-mtp
- Modelo base (nightmedia): https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Guia sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Articulo sobre overthinking en Qwen3.8-27B: https://dev.to/kaixintelligence/qwen-38-27b-why-this-powerful-model-cant-stop-overthinking-and-how-to-fix-it-5dh6
