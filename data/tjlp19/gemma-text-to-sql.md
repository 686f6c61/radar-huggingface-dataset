# tjlp19/gemma-text-to-sql

## Resumen

`tjlp19/gemma-text-to-sql` es un ajuste fino (fine-tune) del modelo base `google/gemma-4-E2B`, entrenado por el usuario `tjlp19` mediante *Supervised Fine-Tuning* (SFT) con la librería TRL de Hugging Face. El nombre del repositorio indica que el objetivo es la traducción de lenguaje natural a SQL (text-to-SQL), una tarea clásica de generación estructurada en la que el modelo recibe una pregunta en lenguaje natural y, presumiblemente, un esquema de base de datos, y devuelve una consulta SQL ejecutable.

El modelo es muy reciente (creado el 22 de octubre de 2026, actualizado el 24 de octubre de 2026) y no cuenta con descargas ni valoraciones. La información publicada es mínima: la model card se limita a la plantilla autogenerada por TRL e incluye un ejemplo de uso que, llamativamente, plantea una pregunta genérica de conversación en lugar de una consulta a base de datos. No se documentan dataset de entrenamiento, hiperparámetros, número de tokens, resultados de evaluación ni licencia concreta.

Por tanto, esta ficha debe leerse como una descripción de lo que el repositorio declara y de lo que puede inferirse razonablemente, no como una evaluación de rendimiento. Cualquier cifra de capacidades, contexto o calidad queda pendiente de validación por parte de quien vaya a desplegarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base `google/gemma-4-E2B`; no se detalla en la model card) |
| Parametros totales | no disponible (el sufijo "E2B" del modelo base sugiere una variante de escala ~2B, sin confirmar) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors`; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el marcador de posición `licence: license` sin concretar) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-4-E2B |
| Metodo de entrenamiento | SFT (Supervised Fine-Tuning) con TRL 1.16.0 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-22 |
| Fecha de actualizacion | 2026-10-24 |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura interna más allá de que el modelo deriva de `google/gemma-4-E2B`. La model card no describe si se trata de un transformer denso, un modelo con mezcla de expertos, una arquitectura híbrida o cualquier otra variante, ni detalla la ventana de contexto nativa, el tokenizador o el vocabulario. Tampoco se especifica si se ha realizado un fine-tune completo o un ajuste parametrizado eficiente (LoRA/QLoRA): el tamaño del repositorio, 0,1 GB, es notablemente reducido para un fine-tune completo de un modelo de escala media en `safetensors`, lo que podría apuntar a adaptadores o a pesos en precisión reducida, pero esto es una observación y no un dato confirmado por el autor.

En cuanto al entrenamiento, la única información disponible es el marco utilizado: TRL 1.16.0 sobre Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, con entrenamiento de tipo SFT. No se indica el dataset empleado (por ejemplo, Spider, BIRD o un corpus propio), ni el número de ejemplos o tokens, ni la composición de las muestras, ni si hubo etapas posteriores de preferencia (DPO, RLHF) o decodificación guiada. La referencia a "schema-aware prompting" y "guided decoding" aparece en los resultados de búsqueda, pero corresponde a un proyecto distinto (GEMMA-SQL, basado en Gemma 2B) y no debe atribuirse a este repositorio.

## Capacidades

- Generación de consultas SQL a partir de lenguaje natural: es el propósito declarado por el nombre del repositorio, aunque no se documenta ni se ejemplifica en la model card.
- Generación de texto conversacional: el único ejemplo publicado es una pregunta abierta de respuesta libre, por lo que el modelo conserva, al menos en parte, la capacidad generativa del modelo base.
- Formato de chat: el ejemplo de uso pasa una lista de mensajes con rol `user`, lo que sugiere compatibilidad con una plantilla de chat conversacional (no se especifica cuál).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declara ningún idioma en la model card).
- Modo "thinking" o razonamiento explícito: no disponible (no documentado).
- Visión, audio u otras modalidades: no disponible (no documentado).

## Casos de uso

- Asistente interno de consultas a bases de datos: el modelo se integraría en una herramienta donde el usuario escribe una pregunta en lenguaje natural y recibe una consulta SQL para revisar antes de ejecutarla, reduciendo la dependencia de conocimiento de SQL en equipos de negocio.
- Aceleración de analistas de datos: generación de borradores de consultas sobre un esquema conocido que el analista revisa y ajusta, útil para consultas repetitivas de agregación y filtrado.
- Enriquecimiento de herramientas de BI: integración como paso previo a un motor de ejecución (por ejemplo, DuckDB o PostgreSQL) para traducir preguntas de cuadros de mando a consultas parametrizadas.
- Generación de consultas de prueba en desarrollo de software: creación de consultas de ejemplo para tests de integración o para poblar fixtures, a partir de descripciones en lenguaje natural del caso de prueba.
- Prototipado de interfaces de lenguaje natural sobre APIs de datos: uso en un *backend* de demostración que exponga una caja de texto y devuelva SQL, aceptable en entornos internos con validación humana obligatoria.
- Docencia y formación en SQL: generación de consultas de referencia que el alumnado compara con su propia solución, siempre con un esquema controlado y sin ejecución automática.
- Filtrado y clasificación de peticiones: al conservar capacidad generativa general, podría emplearse para tareas auxiliares de normalización de la pregunta del usuario, aunque esta función no está documentada ni validada.

En todos los casos, el modelo debe colocarse detrás de una capa de validación sintáctica y de permisos: no hay ninguna evaluación publicada que respalde su precisión en ejecución real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de exactitud de coincidencia (execution accuracy), comparaciones en Spider o BIRD, ni evaluaciones de validez sintáctica. Los resultados de búsqueda encontrados corresponden a GEMMA-SQL (artículo arXiv 2511.04710), un proyecto diferente construido sobre Gemma 2B, y no son trasladables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma confirmada, ya que se desconoce el número de parámetros. Como referencia condicional, si el modelo base es de escala ~2B (inferencia a partir del sufijo "E2B", no confirmada), cabría esperar aproximadamente 4-5 GB en fp16, 2-3 GB en int8 y 1,5-2 GB en int4, más el *overhead* del runtime y de la caché KV.
- GPU recomendadas: no disponible. Para una escala ~2B bastaría una GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070); para servir con concurrencia alta sería preferible una L4, A10G o A100. Esta recomendación es una estimación, no un dato del autor.
- ¿Cabe en GPU consumer? Probablemente sí en el escenario anterior, siempre que la escala real sea la estimada; sin confirmar.
- Opciones de despliegue: `transformers` con `pipeline` es el método documentado en la model card (`device_map="auto"`). El repositorio incluye la etiqueta `endpoints_compatible`, por lo que es compatible con Hugging Face Inference Endpoints. No se publican pesos GGUF, de modo que llama.cpp y Ollama no están soportados de serie; vLLM y TGI no están verificados en la documentación disponible.
- Latencia y throughput: no disponible. No hay datos de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| `tjlp19/gemma-text-to-sql` | no disponible (~2B, sin confirmar) | no disponible | Fine-tune SFT de `google/gemma-4-E2B` para text-to-SQL | no disponible | Hugging Face, safetensors | no disponible |
| `google/gemma-4-E2B` (modelo base) | no disponible | no disponible | Modelo generalista de Google | no disponible en esta informacion | Hugging Face | no disponible en esta informacion |
| GEMMA-SQL (arXiv 2511.04710) | ~2B (Gemma 2B) | no disponible | Text-to-SQL con prompting guiado por esquema e *instruction tuning* | no disponible | Repositorio GitHub del autor | Sí, sobre SPIDER (cifras no incluidas en la informacion disponible) |

La comparación con alternativas consolidadas de text-to-SQL (por ejemplo, variantes especializadas de CodeLlama o Qwen-Coder) no puede realizarse con rigor: no hay métricas de este modelo ni datos de contexto y licencia que permitan una tabla homogénea.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas de *execution accuracy* ni de validez sintáctica, por lo que se desconoce si las consultas generadas son ejecutables.
- Documentación mínima: la model card es la plantilla automática de TRL. No hay dataset, hiperparámetros, número de épocas ni curvas de entrenamiento publicadas.
- Ejemplo de uso incoherente: el *snippet* de la model card plantea una pregunta conversacional genérica ("máquina del tiempo"), no una consulta a base de datos, y no muestra cómo se pasa el esquema de la base de datos al modelo. No queda claro el formato de prompt esperado.
- Riesgo de alucinación de esquema: en tareas text-to-SQL es habitual inventar tablas, columnas o funciones SQL; sin evaluación ni *guided decoding* documentado, este riesgo debe asumirse alto.
- Licencia indeterminada: el campo de licencia contiene un marcador de posición (`licence: license`) y no se especifica la licencia efectiva. Al derivar de un modelo de Google, habrá que verificar los términos del modelo base antes de cualquier uso comercial.
- Idiomas y contexto desconocidos: no se declara soporte de castellano ni longitud de contexto, lo que impide planificar conversaciones multi-turno o esquemas de base de datos extensos.
- Sesgos: no documentados. Al no conocerse el dataset de SFT, no puede descartarse un sesgo hacia un dialecto SQL concreto (SQLite, MySQL, PostgreSQL) ni hacia dominios de datos específicos.
- Madurez del repositorio: 0 descargas, 0 likes y pocos días de vida; no hay evidencia de uso en producción ni informes de terceros.
- El tamaño del repositorio (0,1 GB) invita a comprobar si se trata de un fine-tune completo o de adaptadores antes de asumir que los pesos son autónomos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tjlp19/gemma-text-to-sql
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Repositorio de TRL: https://github.com/huggingface/trl
- Artículo GEMMA-SQL (proyecto relacionado, no equivalente): https://arxiv.org/abs/2511.04710
- Versión PDF del artículo: https://arxiv.org/pdf/2511.04710v1
- Repositorio GitHub de GEMMA-SQL: https://github.com/profharimohanpandey/GEMMA-Text-To-SQL
- Releases del repositorio GEMMA-SQL: https://github.com/profharimohanpandey/GEMMA-Text-To-SQL/releases
