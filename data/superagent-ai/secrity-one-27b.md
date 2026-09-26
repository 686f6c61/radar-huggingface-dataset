# superagent-ai/secrity-one-27b

## Resumen

secrity-one-27b es un modelo de clasificación de texto publicado por superagent-ai en HuggingFace, orientado a tareas de seguridad de IA. Concretamente, sus etiquetas lo identifican como un modelo de decisión para detección de prompt injection, dentro de la categoría de clasificadores de seguridad. El repositorio declara el pipeline text-classification, lo que indica que su salida esperada es una etiqueta o puntuación de clasificación, no texto generativo libre, aunque el tag image-text-to-text sugiere que también acepta entradas de imagen junto a texto.

El modelo cuenta con 27.356.728.560 parámetros totales (unos 27,36 mil millones), según los pesos en safetensors, y el repositorio ocupa 54,7 GB, lo que corresponde aproximadamente a pesos en precisión de 16 bits. Está construido como un fine-tuning del modelo denis-pplx/autojev-27b, del que no se dispone de documentación adicional en la información consultada. La etiqueta qwen3_5 apunta a una arquitectura de la familia Qwen 3.5, si bien no se confirma en la ficha del repositorio.

Su relevancia potencial reside en el tamaño: la mayoría de clasificadores de prompt injection disponibles son modelos pequeños (entre 20 y 200 millones de parámetros), mientras que este parte de una base de 27.000 millones. No obstante, el repositorio no incluye tarjeta descriptiva, resultados de evaluación ni documentación de entrenamiento, y el acceso está restringido mediante gated access, por lo que cualquier evaluación rigurosa exige aceptar las condiciones en HuggingFace. En el momento de redactar esta ficha registra 0 descargas y 0 likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la etiqueta qwen3_5 sugiere arquitectura transformer de la familia Qwen 3.5 |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | No aplica; no se ha confirmado una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline declarado | text-classification |
| Modelo base | denis-pplx/autojev-27b (fine-tune) |
| Modalidad de entrada | Texto; el tag image-text-to-text sugiere entrada de imagen y texto |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamaño del repositorio | 54,7 GB |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna del modelo. Las etiquetas del repositorio incluyen qwen3_5, lo que apunta a que el backbone pertenece a la familia Qwen 3.5, y el modelo base declarado es denis-pplx/autojev-27b, un fine-tune previo del que tampoco se documentan detalles. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste por preferencias como RLHF o DPO.

La única información funcional disponible es la del dominio de aplicación: las etiquetas decision-model, prompt-injection y ai-security, junto con el pipeline text-classification, indican que el modelo se ha ajustado para emitir una decisión de clasificación sobre seguridad de entradas, presumiblemente para distinguir intentos de inyección de prompt de entradas legítimas. El tamaño del repositorio (54,7 GB) es coherente con pesos en 16 bits sobre 27,36 mil millones de parámetros, sin que se documenten innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Clasificación de texto orientada a seguridad: el pipeline declarado es text-classification y las etiquetas apuntan a la detección de prompt injection.
- Modelo de decisión (decision-model): se espera que produzca una etiqueta o puntuación binaria o multiclase sobre la entrada, no una respuesta generativa.
- Entrada multimodal según etiquetas: el tag image-text-to-text sugiere que acepta imágenes junto a texto, aunque no se documenta el alcance ni el formato exacto.
- Integración con infraestructura de servicio: las etiquetas incluyen sglang y endpoints_compatible, lo que indica compatibilidad con despliegue en SGLang y con endpoints gestionados.
- Carga mediante transformers: el repositorio declara la librería transformers y pesos en safetensors.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el único idioma declarado es inglés.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio o visión documentadas: no disponible, más allá del tag image-text-to-text.

## Casos de uso

- Filtrado de entradas en aplicaciones de chat: el modelo se situaría como una capa previa al LLM principal para clasificar mensajes de usuario y bloquear intentos de prompt injection antes de que lleguen al modelo generativo.
- Protección de agentes con acceso a herramientas: en un agente que ejecuta funciones externas, el clasificador puede inspeccionar instrucciones entrantes y evitar que contenido malicioso redirija llamadas a herramientas.
- Moderación de contenido en plataformas de terceros: uso como servicio de clasificación sobre texto enviado por usuarios para detectar patrones de manipulación de instrucciones.
- Auditoría de registros de conversación: procesamiento por lotes de históricos de chat para etiquetar qué interacciones contenían intentos de inyección y alimentar revisiones de seguridad.
- Seguridad en pipelines RAG: clasificación de documentos recuperados antes de insertarlos en el contexto del modelo, para detectar texto envenenado que intente sobrescribir instrucciones del sistema.
- Evaluación de modelos y red teaming: uso como clasificador de referencia al probar la robustez de otros sistemas frente a ataques de prompt injection.
- Filtrado previo en pasarelas de API: integración en un gateway que recibe peticiones de múltiples aplicaciones y aplica una decisión de seguridad antes del enrutado al modelo de generación.

En todos los casos, conviene tener en cuenta que no se han publicado métricas de precisión, recall o latencia, por lo que el modelo requiere una validación propia antes de cualquier despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (27,36 mil millones) y de la licencia y formato publicados, no datos confirmados por el autor.

- VRAM para pesos en FP16/BF16: aproximadamente 54,7 GB solo para pesos, más la caché KV, que depende de la longitud de contexto y del tamaño de lote.
- VRAM para pesos en INT8: del orden de 27-28 GB, más caché KV.
- VRAM para pesos en INT4: del orden de 14-16 GB, más caché KV.
- GPU recomendadas para FP16: una H100 de 80 GB o dos A100 de 80 GB; con una sola A100 de 40 GB no cabría en FP16.
- GPU recomendadas para INT8: una A100 de 40 GB o una L40S de 48 GB.
- GPU de consumo: en cuantización INT4 podría ajustarse a una RTX 4090 o RTX 3090 de 24 GB, siempre que existan pesos cuantizados publicados, algo que no se confirma en la información disponible. En FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: la etiqueta sglang indica compatibilidad con SGLang; el repositorio declara compatibilidad con transformers y endpoints gestionados. No se confirma soporte de vLLM, TGI, llama.cpp u Ollama, ni la existencia de ficheros GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de secrity-one-27b, por lo que la comparación se limita a parámetros, licencia y formato de publicación. Los datos de los modelos alternativos provienen de conocimiento general y no de la información proporcionada en esta búsqueda.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| superagent-ai/secrity-one-27b | 27,36 mil millones | Clasificación de prompt injection | Apache 2.0 | HuggingFace, acceso restringido | No publicados |
| meta-llama/Llama-Prompt-Guard-2-86M | 86 millones (aprox.) | Detección de prompt injection | Licencia comunitaria de Llama | HuggingFace, acceso restringido | No comparados aquí |
| protectai/deberta-v3-base-prompt-injection-v2 | 184 millones (aprox.) | Detección de prompt injection | Apache 2.0 | HuggingFace, acceso abierto | No comparados aquí |
| Llama-Guard-3-8B | 8 mil millones (aprox.) | Clasificación de seguridad de contenido | Licencia comunitaria de Llama | HuggingFace, acceso restringido | No comparados aquí |

La diferencia principal es de escala: secrity-one-27b es entre uno y dos órdenes de magnitud mayor que los clasificadores de prompt injection habituales, lo que encarece su despliegue y su latencia potencial sin que se haya demostrado una mejora proporcional en precisión.

## Limitaciones y advertencias

- Ausencia total de documentación: el repositorio no incluye tarjeta de modelo, descripción de datos de entrenamiento ni metodología de evaluación.
- Sin resultados de benchmarks: no es posible verificar la calidad de la clasificación ni compararla con alternativas establecidas.
- Sesgos conocidos: no disponibles; al no documentarse la composición del dataset, no se puede evaluar el sesgo.
- Riesgo de alucinación: aunque la tarea declarada es de clasificación, un modelo de este tamaño puede generar texto si se usa fuera de su pipeline previsto; sin evaluación no puede descartarse un comportamiento errático.
- Limitación de idioma: solo se declara inglés, por lo que su uso sobre entradas en castellano u otros idiomas no está validado y podría degradar la detección.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que añade fricción a la reproducibilidad.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo deriva de denis-pplx/autojev-27b, cuya licencia y procedencia conviene verificar antes de un despliegue comercial.
- Coste de despliegue: 27,36 mil millones de parámetros implican al menos una GPU de 40-80 GB en FP16 o INT8, muy por encima de lo habitual en clasificadores de seguridad.
- Ausencia de adopción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo.
- Fecha de publicación futura: el repositorio figura creado el 25 de septiembre de 2026, dato que debe verificarse directamente en HuggingFace.
- Ausencia de cuantizaciones publicadas: no se confirman ficheros GGUF ni variantes INT4/INT8, lo que condiciona el despliegue en hardware de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/superagent-ai/secrity-one-27b
- Modelo base: https://huggingface.co/denis-pplx/autojev-27b
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
