# xpert0/Qwen3.5-2B-OBLITERATED

## Resumen

Qwen3.5-2B-OBLITERATED es una variante del modelo base Qwen/Qwen3.5-2B publicada por el usuario xpert0 en HuggingFace, en la que se ha eliminado el comportamiento de rechazo (refusal) mediante técnicas de ingeniería de activaciones, un procedimiento conocido como *abliteration*. Según la model card, el autor aplicó el método `advanced` de la herramienta OBLITERATUS, desarrollada por elder-plinius. El resultado es un modelo de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) que conserva la arquitectura del modelo base y responde sin las negativas típicas de un modelo alineado.

Su interés es doble. Por un lado, es un caso reproducible de abliteration sobre un modelo de clase 2B, un tamaño que cabe en GPUs de consumo y que permite experimentar con edición de pesos sin grandes presupuestos de cómputo. Por otro, ilustra los riesgos de la redistribución de pesos sin evaluación: la ficha no publica benchmarks, ni licencia, ni longitud de contexto, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

No hay información sobre datos de entrenamiento, ventana de contexto, cuantizaciones publicadas ni resultados de evaluación. Todo lo relativo a la arquitectura y a las capacidades heredadas procede del modelo base y de las etiquetas de HuggingFace, no de una validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de HuggingFace `qwen3_5_text`); detalles de capas, atención y activaciones no disponibles |
| Parámetros totales | 1.881.825.088 (~1,88 B) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo distribuye safetensors (el tamaño de 3,8 GB es coherente con pesos en bf16/fp16) |
| Idiomas soportados | `en` (inglés), según metadatos y model card |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 3,8 GB |
| Modelo base | Qwen/Qwen3.5-2B |
| Método de modificación | abliteration, método `advanced`, vía OBLITERATUS |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-19 (ambas) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del base Qwen/Qwen3.5-2B; la etiqueta `qwen3_5_text` en HuggingFace indica que se trata de un transformer de texto, sin torre de visión declarada. No se ha realizado un preentrenamiento ni un ajuste supervisado nuevo: la intervención es una edición post-hoc de pesos basada en ingeniería de activaciones. Este tipo de procedimiento localiza una dirección en el espacio de activaciones asociada a la conducta de rechazo (habitualmente estimada con pares de peticiones dañinas e inocuas en una capa intermedia) y la proyecta fuera de las matrices de pesos, de modo que el modelo pierde la tendencia a negarse a responder.

La model card no documenta el conjunto de calibración, el número de capas intervenidas, la magnitud de la ablación ni la receta exacta que aplica el preset `advanced` de OBLITERATUS. Tampoco se indica si hubo recuperación posterior de capacidades ni ninguna fase de evaluación. La herramienta OBLITERATUS es de código abierto y está disponible en GitHub, por lo que la receta es reproducible en principio, pero el repositorio del modelo no incluye los artefactos (direcciones calculadas, scripts, semillas) que permitirían auditar el resultado. No se dispone de información sobre tokens de entrenamiento, composición del dataset, RLHF ni DPO.

## Capacidades

- Generación de texto en inglés y conversación multi-turno, con la ventana de contexto del modelo base (no documentada en esta ficha).
- Respuesta sin rechazos ante peticiones que un modelo alineado conventionally rechazaría; es la característica diferencial del modelo.
- Razonamiento y conocimiento general propios de un modelo de ~2B, presumiblemente inferiores a los de modelos de mayor tamaño (sin datos de benchmark que lo confirmen).
- Generación de código y matemáticas básicas: capacidad esperable por herencia del base, no verificada con evaluaciones publicadas.
- Sin soporte declarado de *tool calling*, agentes, visión, audio ni modo de razonamiento explícito (*thinking*); la model card no menciona ninguna de estas capacidades.
- Multilingüismo limitado: solo se declara inglés; no hay evidencia de calidad en castellano.

## Casos de uso

- Investigación sobre mecanismos de rechazo: comparar las activaciones y las respuestas del modelo abliterado con las del base Qwen/Qwen3.5-2B sobre el mismo conjunto de peticiones permite medir qué se elimina exactamente con la ablación y a qué coste en capacidades.
- Red-teaming y evaluación de salvaguardas: usar el modelo como generador adversario para probar clasificadores de contenido, filtros de salida o sistemas de moderación en pipelines propios, en un entorno controlado y con registro de prompts.
- Generación de datos sintéticos para entrenar moderadores: producir pares de petición y respuesta no rechazada que sirvan como ejemplos negativos en el entrenamiento de clasificadores de seguridad o de detectores de jailbreak.
- Escritura creativa y narrativa sin fricción: ficción con violencia, terror o temáticas sensibles en la que el autor necesita continuidad sin interrupciones del modelo; el tamaño de 2B permite ejecutarlo en local y sin enviar el manuscrito a un servicio externo.
- Prototipado local de asistentes en inglés: con 1,88 B de parámetros y pesos en bf16, el modelo se carga con `transformers` en una GPU de consumo, lo que sirve para validar prompts, plantillas y flujos conversacionales antes de migrar a un modelo mayor.
- Base para ajuste fino con LoRA en dominios nicho: al no bloquear dominios sensibles (por ejemplo, ciberseguridad ofensiva o análisis de contenido extremista), reduce las iteraciones necesarias para que un fine-tuning sobre ese corpus no sea revertido por el rechazo del modelo.
- Pruebas de cuantización y despliegue en el borde: al ser pequeño, es un candidato razonable para convertir a GGUF e integrarlo con llama.cpp u Ollama en CPU o en dispositivos con poca VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones de refusal ni comparaciones con el modelo base, y el repositorio no contiene artefactos de evaluación. Tampoco hay métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 4 GB solo para pesos (3,8 GB de safetensors) más la caché KV, que depende de una longitud de contexto no documentada; con contexto corto, un presupuesto de 5-6 GB es realista.
- VRAM estimada tras cuantización: aproximadamente 2 GB de pesos en int8 y 1,1-1,3 GB en int4, con overhead adicional de activaciones y caché.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 6-8 GB si se cuantiza.
- GPU de datacenter: A100, H100 y L40S están sobredimensionadas para un modelo de este tamaño; su uso solo se justifica por agregación de muchas instancias en paralelo.
- Despliegue: la model card documenta únicamente `transformers` con `AutoModelForCausalLM`. Para vLLM o TGI es necesario que la arquitectura `qwen3_5_text` esté soportada por la versión correspondiente, algo no confirmado. Para llama.cpp u Ollama hace falta convertir los pesos a GGUF, ya que el repositorio no publica ficheros GGUF.
- CPU: la inferencia en CPU es viable en cuantización int4 con velocidades del orden de pocos tokens por segundo, aunque no se han publicado medidas concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xpert0/Qwen3.5-2B-OBLITERATED | 1,88 B | no disponible | no disponible | safetensors | Abliterado con OBLITERATUS (`advanced`); 0 descargas; sin evaluación |
| Qwen/Qwen3.5-2B (base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Mantiene el comportamiento de rechazo alineado; referencia directa para medir el efecto de la ablación |
| Otras variantes abliteradas de la familia Qwen de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa |

La comparación cuantitativa no es posible con los datos disponibles: no hay benchmarks del modelo ni especificaciones publicadas del base en la información consultada. Cualquier afirmación sobre superioridad o degradación frente a alternativas requeriría ejecutar una evaluación propia sobre el mismo conjunto de tareas.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción exige aclarar antes la licencia del modelo base Qwen/Qwen3.5-2B y la del derivado.
- Eliminación deliberada de salvaguardas: el modelo está diseñado para no rechazar peticiones, incluidas las dañinas. No debe exponerse a usuarios finales sin un filtro externo de entrada y salida.
- Degradación no medida: la ablación de direcciones de activación suele afectar a la coherencia, la calibración y el rendimiento en tareas de razonamiento, pero no hay ninguna evaluación publicada que cuantifique la pérdida frente al base.
- Riesgo de alucinación: propio de un modelo de ~2B, y potencialmente agravado por la edición de pesos; sin datos de evaluación no puede acotarse.
- Idioma: solo se declara inglés. El rendimiento en castellano es desconocido y no debería asumirse.
- Contexto desconocido: al no documentarse la ventana, no deben planificarse cargas de contexto largo ni pipelines que dependan de decenas de miles de tokens.
- Sesgos del base no documentados: no se han publicado análisis de sesgo ni del corpus de entrenamiento original.
- Falta de validación comunitaria: 0 descargas y 0 likes, repositorio creado y actualizado en el mismo minuto, sin historial de revisiones ni discusión asociada.
- Error potencial en el ejemplo de uso: la model card llama al modelo `Qwen3.5-2B-OBLITERATED` sin el prefijo del autor; para cargarlo con `from_pretrained` debe usarse el identificador completo `xpert0/Qwen3.5-2B-OBLITERATED`.
- Reproducibilidad limitada: no se publican los artefactos de la ablación (direcciones, scripts, semillas), por lo que el resultado no es auditable a partir del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xpert0/Qwen3.5-2B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
