# vkovtun/llama-text-to-sql-2026-09-23_18.15.20-finetune-QLORA

## Resumen

Este repositorio contiene un ajuste fino del modelo meta-llama/Llama-3.2-3B-Instruct orientado a la tarea de text-to-SQL, es decir, la traducción de preguntas en lenguaje natural a consultas SQL ejecutables sobre un esquema de base de datos. El autor es el usuario de HuggingFace vkovtun y el entrenamiento se ha realizado con SFT (supervised fine-tuning) sobre QLoRA, empleando la librería TRL en su versión 1.12.0, Transformers 5.16.1 y PyTorch 2.14.0. El identificador incluye la marca temporal 2026-09-23_18.15.20, lo que indica que se trata de un artefacto generado automáticamente por un pipeline de entrenamiento y no de una release curada.

El modelo parte de una arquitectura transformer decoder-only de 3.210 millones de parámetros con una ventana de contexto de 128.000 tokens, heredada íntegramente del modelo base. El repositorio ocupa 0,8 GB y contiene pesos en formato safetensors, un tamaño coherente con pesos de adaptador LoRA/QLoRA más que con un modelo fusionado en bf16 (que rondaría los 6,4 GB), aunque la model card no lo confirma. No se documentan ni el conjunto de datos de entrenamiento, ni los hiperparámetros, ni resultados de evaluación.

Su relevancia actual es la de un ejemplo típico de ajuste especializado de bajo coste: un modelo de 3B cuantizado a 4 bits durante el entrenamiento permite obtener un generador de SQL desplegable en una GPU de consumo o incluso en CPU, algo inasumible con modelos de 70B. Sin embargo, el repositorio no declara licencia, idiomas ni benchmarks, y acumula cero descargas y cero valoraciones, por lo que debe tratarse como material experimental y no como un componente listo para producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) con ajuste fino QLoRA sobre el modelo base |
| Parámetros totales | 3.210 millones (3,21 B), heredados del modelo base |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no verificada para la tarea text-to-SQL) |
| Tipos de cuantización | no disponible. El entrenamiento empleó QLoRA (cuantización a 4 bits del modelo base durante el ajuste), pero no se documentan cuantizaciones del artefacto publicado |
| Idiomas soportados | no disponibles en el repositorio. El modelo base declara 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | no disponible. La model card incluye el marcador sin contenido "licence: license". El modelo base se distribuye bajo Llama 3.2 Community License, que condiciona cualquier derivado |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tamaño del repositorio | 0,8 GB |
| Librería | transformers |
| Método de entrenamiento | SFT con TRL 1.12.0 (QLoRA) |
| Pipeline declarado | no disponible |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), diseñado por Meta para inferencia en dispositivos de gama media y edge. Sobre esa base se ha aplicado un ajuste supervisado con QLoRA, técnica que congela los pesos originales cuantizados a 4 bits e introduce adaptadores de bajo rango entrenables, reduciendo de forma drástica los requisitos de memoria del entrenamiento. La model card únicamente indica que el entrenamiento se realizó con SFT mediante TRL; no especifica el rango de los adaptadores, el optimizador, la tasa de aprendizaje, el número de pasos ni la composición del dataset.

No se documenta ningún tipo de optimización posterior al SFT: no hay referencias a DPO, RLHF, decodificación especulativa ni a variantes de atención lineal. El único artefacto adicional es un enlace a una ejecución de Weights & Biases (proyecto llama-text-to-sql, run rzjertei), que presumiblemente contiene las curvas de pérdida y las métricas de entrenamiento, pero cuyos valores no se reproducen en el repositorio. Tampoco se indica qué esquemas de bases de datos ni qué estilo de SQL (dialecto, uso de CTEs, mayúsculas, formato) se utilizaron como referencia, un dato crítico para juzgar la utilidad real del ajuste.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural, que es la tarea declarada en el nombre del modelo y el único propósito documentado del ajuste.
- Generación de texto general e instrucciones conversacionales, heredadas del modelo base Llama-3.2-3B-Instruct.
- Razonamiento básico de varios pasos y resolución de problemas sencillos, limitado por el tamaño de 3B parámetros del modelo base.
- Generación de código en lenguajes habituales, incluyendo el propio SQL, aunque sin garantía de corrección sintáctica.
- Seguimiento de instrucciones en formato de chat (roles de sistema, usuario y asistente), según el ejemplo de la model card basado en pipeline de text-generation.
- Capacidades multilingües teóricas procedentes del modelo base (8 idiomas declarados), no verificadas para la generación de SQL.
- No se declara soporte explícito de tool calling, function calling, modo de razonamiento extendido, visión, audio ni comportamiento de agente; el modelo base Llama 3.2 3B Instruct sí incorpora plantillas de llamada a herramientas, pero este ajuste no lo documenta.

## Casos de uso

- Asistente de consultas para herramientas de BI internas: el modelo traduce preguntas de negocio ("¿cuánto facturamos en el segundo trimestre por región?") a SQL contra un esquema conocido, aprovechando los 128.000 tokens de contexto para inyectar el DDL completo de tablas y vistas en el prompt.
- Aceleración de analistas de datos: generación de un borrador de consulta que el analista revisa y refina, reduciendo el tiempo dedicado a escribir joins y agregaciones repetitivas.
- Autocompletado en editores SQL: integración como servicio local que sugiere la siguiente cláusula o la consulta completa a partir de un comentario en lenguaje natural, con latencia compatible con un modelo de 3B en GPU de consumo.
- Normalización y documentación de esquemas: dado un conjunto de tablas, generar consultas de ejemplo o descripciones de columnas para catálogos de datos, siempre con revisión humana posterior.
- Generación de consultas de validación en pipelines de datos: producir comprobaciones de integridad (recuentos, nulos, duplicados) que se ejecutan en CI antes de promover una tabla a producción.
- Agente de datos de varios pasos: combinado con un orquestador externo, el modelo puede generar la consulta, invocar una herramienta de ejecución y resumir el resultado; el soporte de tool calling dependería del modelo base y del prompt, no está garantizado por este ajuste.
- Prototipado on-premise con requisitos de confidencialidad: al caber en una GPU de consumo o en CPU, permite procesar esquemas sensibles sin enviarlos a una API externa.
- Materia prima para investigación en QLoRA: el repositorio sirve como ejemplo reproducible de ajuste especializado de un modelo de 3B con TRL, útil para comparar estrategias de cuantización y de curación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (ni exactitud de coincidencia de consultas, ni execution accuracy, ni BLEU, ni resultados en conjuntos como Spider, BIRD, WikiSQL o MMLU) y el enlace a Weights & Biases apunta a una ejecución de entrenamiento cuyo contenido no se reproduce en el repositorio. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- Pesos del ajuste: el repositorio ocupa 0,8 GB, un tamaño compatible con adaptadores LoRA en lugar de un modelo fusionado; en ese caso es necesario descargar por separado el modelo base (unos 6,4 GB en bf16) y cargar el adaptador con PEFT.
- VRAM estimada en bf16/fp16: aproximadamente 7-9 GB contando pesos, caché KV y activaciones a contextos moderados; sube de forma apreciable si se utilizan ventanas cercanas a los 128.000 tokens.
- VRAM estimada en cuantización de 4 bits (GGUF Q4, GPTQ o AWQ): aproximadamente 2,5-4 GB, lo que permite ejecución en GPU de 6-8 GB.
- GPU compatibles: cabe en tarjetas de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en bf16; en 4 bits es viable en RTX 3050 8 GB o RTX 4060 8 GB. Para servicio con concurrencia alta se recomiendan A10G, L4, L40S, A100 o H100.
- Ejecución en CPU: viable mediante llama.cpp u Ollama con cuantizaciones de 4 bits, con latencias de decenas de segundos por consulta según hardware.
- Opciones de despliegue: transformers con PEFT para el adaptador, vLLM o TGI para servicio con batching continuo (requiere fusionar o cargar el adaptador), llama.cpp y Ollama para escenarios locales. La etiqueta endpoints_compatible del repositorio indica compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de benchmarks de este ajuste no están disponibles, por lo que la comparación se limita a características estructurales y de licencia. Las cifras de los modelos alternativos corresponden a sus fichas públicas.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vkovtun/llama-text-to-sql-...-QLORA (este modelo) | 3,21 B | 128.000 tokens (heredados) | Text-to-SQL mediante QLoRA + SFT | No declarada en el repositorio | Repositorio público, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct (modelo base) | 3,21 B | 128.000 tokens | Instrucciones generales y tool calling | Llama 3.2 Community License | Ampliamente desplegado y auditado |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32.768 tokens nativos, ampliables | Código y generación de SQL | Apache 2.0 | Repositorio público con benchmarks publicados |
| defog/sqlcoder-7b-2 | 7 B | 16.000 tokens | Text-to-SQL especializado | CC BY-SA 4.0 | Repositorio público con métricas en Spider y BIRD |

Frente a los especialistas consolidados en text-to-SQL, este ajuste no aporta evidencia empírica de mejora, no declara licencia y no documenta el dataset, lo que dificulta justificar su adopción por encima de alternativas con benchmarks públicos y licencias permisivas. Su principal ventaja potencial es el tamaño reducido, que abarata el despliegue en hardware limitado.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas de execution accuracy ni de coincidencia exacta, por lo que se desconoce si el ajuste mejora o degrada el comportamiento del modelo base en text-to-SQL.
- Dataset de entrenamiento no documentado: se desconoce el dialecto SQL objetivo (PostgreSQL, MySQL, SQLite, BigQuery, etc.), el formato del esquema de entrada y si se incluyeron ejemplos de esquemas ajenos al de entrenamiento.
- Licencia no declarada en el repositorio, con el marcador vacío "licence: license". Al derivar de Llama 3.2, el uso comercial queda sujeto a la Llama 3.2 Community License de Meta, que exige atribución, incluye condiciones sobre el nombre "Llama" y establece límites para productos con más de 700 millones de usuarios mensuales.
- Riesgo elevado de alucinación de esquema: los modelos de 3B tienden a inventar nombres de tablas y columnas cuando no aparecen literalmente en el contexto, lo que produce errores de ejecución difíciles de detectar sin validación automática.
- Riesgo de SQL destructivo: si la salida se ejecuta sin revisión, el modelo puede generar sentencias DELETE, DROP o UPDATE no solicitadas. Es imprescindible ejecutar en un entorno de solo lectura, con permisos mínimos y con un analizador sintáctico previo.
- Idiomas no declarados: aunque el modelo base cubre 8 idiomas, la calidad de la generación de SQL en castellano no está verificada y probablemente sea inferior a la del inglés.
- Contexto largo teórico pero efectividad no comprobada: los 128.000 tokens heredados no garantizan un buen manejo de esquemas extensos con cientos de tablas; la degradación por "lost in the middle" es un riesgo conocido en modelos de este tamaño.
- Ejemplo de uso poco informativo: el fragmento de quick start de la model card plantea una pregunta genérica de generación de texto y no una consulta text-to-SQL, lo que sugiere que la tarjeta se generó de forma automática a partir de la plantilla de TRL y no ha sido validada manualmente por el autor.
- Sin validación de la comunidad: cero descargas, cero valoraciones y ningún informe independiente de terceros.
- Sesgos: no se documentan análisis de sesgo específicos; el modelo hereda los sesgos del corpus de entrenamiento de Llama 3.2 3B y ninguno de ellos ha sido mitigado en este ajuste.
- Fecha de creación 2026-09-23 en el identificador y en la marca temporal de la model card; conviene verificar la coherencia temporal del artefacto antes de integrarlo en un registro de modelos interno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vkovtun/llama-text-to-sql-2026-09-23_18.15.20-finetune-QLORA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/viktor-kovtun/llama-text-to-sql/runs/rzjertei
- Librería TRL (repositorio GitHub): https://github.com/huggingface/trl
- Licencia del modelo base Llama 3.2: https://www.llama.com/llama3_2/license/
