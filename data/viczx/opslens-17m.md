# viczx/opslens-17m

## Resumen

OpsLens-17M es un modelo de lenguaje decoder-only de 17.052.672 parámetros entrenado desde pesos aleatorios por el autor viczx sobre una única GPU de portátil (RTX 3050 de 4 GB). Su tarea no es la generación de texto general, sino convertir una línea de log de servidor en un objeto JSON compacto que incluye la plantilla del log, las variables extraídas, la severidad, una marca de anomalía, una etiqueta de incidente, una explicación de una frase y hasta tres pasos de remediación. Está pensado para ejecutarse en CPU de portátil sin conexión de red, lo que lo sitúa en el nicho de AIOps y análisis de seguridad en entornos on-premise.

El modelo emplea una arquitectura transformer compatible con Llama (RMSNorm pre-norm, RoPE, SwiGLU, embeddings atados), con 8 capas, dimensión de modelo 384, 6 cabezas de atención y un vocabulario byte-level BPE de 7.527 tokens entrenado desde cero. Soporta 512 posiciones de contexto entrenadas y hasta 1.024 posiciones en inferencia. Se distribuye bajo licencia MIT y forma parte del sistema OpsLens, que añade normalizador, caché de plantillas, anclaje a base de conocimiento y grafos de incidentes basados en reglas.

Su relevancia radica en la combinación de tamaño mínimo (65 MB en fp32), entrenamiento asequible (unas 1,5 horas en una GPU de consumo) y un formato de salida estructurado y verificable. No obstante, sus métricas muestran una dependencia fuerte de la memorización: rinde casi perfectamente en plantillas vistas y cae de forma acusada en plantillas no vistas, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only compatible con Llama (RMSNorm pre-norm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 17.052.672 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 posiciones entrenadas; 1.024 posiciones soportadas en inferencia |
| Tipos de cuantizacion | fp32 (pesos publicados); GGUF f32 disponible; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (65 MB fp32), GGUF (f32), ONNX |
| Capas / d_model / cabezas | 8 / 384 / 6 (dimensión de cabeza 64), MLP 1.024 |
| Vocabulario | 7.527 tokens, byte-level BPE con dígitos separados uno por token, entrenado desde cero |
| Sistemas de log soportados | Apache, OpenSSH, Linux, HDFS, OpenStack |
| Dataset de entrenamiento | Loghub-2.0 (Jiang et al., ISSTA 2024) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con diseño compatible con Llama: normalización RMSNorm en pre-norm, embeddings rotatorios (RoPE), activación SwiGLU y embeddings de entrada y salida atados. Consta de 8 capas con dimensión de modelo 384, 6 cabezas de atención de 64 dimensiones cada una y una capa MLP de 1.024 unidades. El vocabulario es un BPE a nivel de byte de 7.527 tokens entrenado desde cero, con la particularidad de que los dígitos se separan en tokens individuales, lo que facilita la copia exacta de variables numéricas (puertos, IPs, PID). El contexto entrenado es de 512 posiciones, aunque la implementación soporta hasta 1.024.

El entrenamiento se realizó en dos etapas sobre el dataset Loghub-2.0, que cubre cinco sistemas (Apache, OpenSSH, Linux, HDFS y OpenStack). En la primera etapa se hizo preentrenamiento de next-token sobre 100 millones de tokens de líneas crudas, alcanzando una pérdida de validación de 0,67. En la segunda se afinó sobre pares (línea, JSON) construidos a partir de una base de conocimiento de 499 entradas redactada por un modelo profesor (Claude), complementada con copias en las que se sustituían palabras constantes para forzar al modelo a copiar texto del contexto. El 15 % de las plantillas de cada sistema se reservó como conjunto de test (semilla 42) y nunca se usó en entrenamiento. Todo el proceso consumió aproximadamente 1,5 horas en una RTX 3050 de portátil con 4 GB de VRAM.

La innovación técnica principal no está en el modelo en sí, sino en el decodificador del sistema OpsLens: restringe la plantilla de salida a la línea de entrada con huecos `<*>` y copia las variables byte a byte, lo que mejora sustancialmente el parseo de plantillas no vistas frente a la decodificación greedy estándar. El formato de prompt usa marcadores especiales como `<|sys:OpenSSH|>`, `<|log|>`, `<|out|>` y `<|end|>`, y se recomienda decodificación greedy.

## Capacidades

- Parseo de logs a JSON estructurado: extrae plantilla (`t`), variables (`v`), severidad (`s`), marca de anomalía (`a`), etiqueta de incidente (`g`), significado en una frase (`m`) y pasos de corrección (`f`).
- Clasificación de severidad y detección de anomalías por línea, con etiquetas derivadas de un modelo profesor.
- Etiquetado de incidentes de seguridad y operaciones (por ejemplo, `ssh_bruteforce`).
- Generación de explicaciones de una frase y hasta tres pasos de remediación con los valores reales de la línea insertados.
- Copia exacta de variables (IPs, usuarios, puertos) gracias a la tokenización de dígitos y al decodificador restringido.
- Ejecución en CPU sin red, con latencias del orden de 100 ms para plantillas conocidas.
- Soporte multilingüe limitado al inglés.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio documentadas.

## Casos de uso

- Triaje de alertas SSH en servidores on-premise: el modelo detecta patrones como `ssh_bruteforce`, extrae la IP de origen y el usuario objetivo, y propone pasos como bloquear la IP o deshabilitar el login por contraseña de root. Es adecuado porque la latencia en CPU (100 ms p50) permite procesar flujos de auth.log en tiempo casi real sin infraestructura GPU.
- Análisis de logs de Apache para detección de errores recurrentes: convierte líneas de access y error log en plantillas normalizadas con severidad y etiqueta de incidente, lo que facilita agrupar y priorizar fallos en paneles de operaciones.
- Enriquecimiento de pipelines SIEM: al emitir JSON con plantilla, variables y severidad, el modelo puede insertarse como etapa de normalización previa a un SIEM o a un sistema de correlación, aportando estructura donde antes había texto libre.
- Asistencia a operadores de guardia en sistemas Linux: dado un mensaje de log del kernel o de systemd, el modelo devuelve un significado en una frase y pasos de corrección, reduciendo el tiempo de diagnóstico en incidentes rutinarios.
- Monitorización de clústeres HDFS y OpenStack: permite clasificar y agrupar eventos de estos sistemas en entornos sin conectividad exterior, algo relevante en infraestructuras air-gapped donde no se puede recurrir a APIs de modelos grandes.
- Filtrado y deduplicación de logs en el borde: por su tamaño (65 MB fp32) y su ejecución en CPU, puede desplegarse en el propio servidor o en un contenedor ligero para preprocesar y etiquetar logs antes de enviarlos a un sistema central, reduciendo volumen y coste de ingesta.
- Base para entrenamiento de modelos específicos de dominio: al ser MIT y entrenable en unas horas en una GPU de consumo, sirve como punto de partida para adaptar el parseo a otros formatos de log propios de una organización.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre líneas de test reservadas. "Vistas" corresponde a plantillas incluidas en entrenamiento; "no vistas" a plantillas nunca entrenadas.

| Metrica | Vistas | No vistas |
|---|---|---|
| Template exact match (PA) | 0,997 | 0,303 |
| Variables exactas | 0,997 | 0,303 |
| Grouping accuracy | 1,000 | 0,595 |
| Anomaly F1 frente al profesor | 1,00 (memorizado) | 0,71 |
| Calidad de explicación y corrección (1-5, juez Claude) | no disponible | 2,16 |
| Baseline Drain + KB lookup (PA) | 0,355 | 0,352 |

Latencia en CPU (4 hilos, fp32) con el decodificador de OpsLens: 100 ms p50 para plantillas conocidas y aproximadamente 1,1 s para patrones nuevos, que requieren decodificar la explicación completa. El autor advierte que la decodificación greedy estándar (transformers, llama.cpp, Ollama) es más rápida de configurar pero parsea peor las plantillas no vistas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 65 MB de pesos más el estado de inferencia; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: ninguna en particular; el modelo se entrenó en una RTX 3050 de portátil con 4 GB. Cualquier GPU con al menos 1 GB de memoria es suficiente.
- Cabe en GPU de consumo: sí, en cualquier modelo actual (RTX 3050, RTX 4090, etc.) y también en CPU.
- Despliegue: transformers con `AutoModelForCausalLM.from_pretrained`, llama.cpp y Ollama mediante el GGUF f32 y el `Modelfile` incluido, ONNX Runtime y Triton con el repositorio `opslens_lm`, y servidor OpsLens vía Docker (`docker run -p 8000:8000 opslens`, endpoint `POST /analyze`).
- Latencia: 100 ms p50 en CPU de 4 hilos para plantillas conocidas; aproximadamente 1,1 s para patrones nuevos con el decodificador de OpsLens. No se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpsLens-17M | 17,05 M | 512 entrenados / 1.024 soportados | Parseo de logs a JSON con explicación y remediación | MIT | Hugging Face, GGUF, ONNX |
| Drain (baseline algorítmico) | No aplica | No aplica | Parseo de plantillas por clustering | No disponible en la información | Referencia en la model card; PA 0,355 vistas / 0,352 no vistas |
| Modelos de propósito general de gran tamaño (por ejemplo, Llama, Qwen) | Miles de millones | Decenas de miles de tokens | Generación general, razonamiento, código | Variables según modelo | No disponible en la información |

La comparación con modelos de lenguaje de gran tamaño no está documentada por el autor y no se dispone de datos de benchmarks cruzados. El único contraste cuantitativo publicado es frente al baseline Drain más búsqueda en base de conocimiento, donde OpsLens-17M supera ampliamente en plantillas vistas (0,997 frente a 0,355) y queda ligeramente por debajo en plantillas no vistas (0,303 frente a 0,352), con la ventaja de generar explicación y pasos de corrección.

## Limitaciones y advertencias

- Cobertura limitada a cinco sistemas de log (Apache, OpenSSH, Linux, HDFS, OpenStack); otros formatos requieren reentrenamiento, estimado en unas horas en una GPU.
- Caída acusada en plantillas no vistas: el exact match de plantilla y variables baja de 0,997 a 0,303, y la calidad de explicación y corrección en no vistas es de 2,16 sobre 5 según el juez automático.
- Las explicaciones y correcciones en patrones nuevos son a menudo incorrectas; el sistema OpsLens marca esas líneas como "low confidence, new pattern" y no presenta las correcciones como verificadas.
- Las etiquetas de conocimiento provienen de un modelo profesor (Claude) y no todas fueron verificadas por humanos, lo que puede propagar sesgos o errores del profesor.
- El modelo solo recomienda; nunca ejecuta acciones. Cualquier remediación debe pasar por un operador o un sistema con controles propios.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Contexto de 512 posiciones entrenadas, suficiente para líneas de log individuales pero no para ventanas amplias de contexto.
- Riesgo de alucinación en la parte generativa (significado y pasos de corrección), especialmente fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las salidas en producción.
- El rendimiento óptimo depende del decodificador restringido de OpsLens; con decodificación greedy estándar el parseo de plantillas no vistas empeora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viczx/opslens-17m
- Dataset Loghub-2.0: Jiang et al., ISSTA 2024 (referenciado en la model card; sin URL directa en la información disponible)
- Repositorio Triton `opslens_lm`: mencionado en la model card, sin URL en la información disponible
- Servidor OpsLens (Docker, endpoint `/analyze`): mencionado en la model card, sin URL en la información disponible
