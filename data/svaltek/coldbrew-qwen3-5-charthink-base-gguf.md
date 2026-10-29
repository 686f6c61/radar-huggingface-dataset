# SvalTek/ColdBrew-Qwen3.5-CharThink-Base-GGUF

## Resumen

ColdBrew-Qwen3.5-CharThink-Base-GGUF es una distribución en formato GGUF publicada por el usuario SvalTek a partir de un modelo etiquetado como `qwen3_5`, con 8.953.803.264 parámetros (~8,95 B) según los pesos en safetensors del repositorio. El modelo se distribuye exclusivamente en cuantizaciones para llama.cpp, generadas con Unsloth, e incluye un archivo de proyector multimodal (`mmproj`) en BF16, lo que indica que la familia original incorpora capacidad de visión.

El problema que resuelve es eminentemente práctico: ofrecer una variante lista para ejecución local en llama.cpp de un modelo de ~9 B, con cuantizaciones Q4_K_M y Q6_K que permiten desplegarlo en GPU de consumo. Los tags `endpoints_compatible` y `conversational` apuntan a uso como servicio conversacional con API compatible con OpenAI, y el nombre del repositorio (`RP_Base`, `CharThink`) sugiere un ajuste orientado a roleplay o personajes, aunque la model card no lo documenta.

La relevancia ahora es limitada pero clara: se trata de un artefacto de conversión recién publicado (28 de octubre de 2026), sin descargas ni validación comunitaria, sin licencia declarada y sin resultados de evaluación. Es útil para quien quiera experimentar con la arquitectura Qwen 3.5 en local, pero no debe tratarse como un modelo listo para producción sin verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `qwen3_5`); soporte multimodal vía proyector `mmproj`. Detalles de capas, atención y cabezas: no disponible |
| Parámetros totales | 8.953.803.264 (~8,95 B), dato procedente de los safetensors del repositorio |
| Parámetros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M, Q6_K; proyector multimodal en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); el repositorio original en safetensors no se distribuye aquí |
| Tamaño del repositorio | 13,9 GB |
| Archivos publicados | `ColdBrew-Qwen3.5-RP_Base-CharThink.BF16-mmproj.gguf`, `ColdBrew-Qwen3.5-RP_Base-CharThink.Q4_K_M.gguf`, `ColdBrew-Qwen3.5-RP_Base-CharThink.Q6_K.gguf` |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un modelo de la familia Qwen 3.5 (tag `qwen3_5`) con 8,95 B de parámetros y capacidad de visión, dado que el repositorio incluye un archivo `mmproj` que en llama.cpp actúa como proyector entre el codificador visual y el modelo de lenguaje. No se detallan el número de capas, la dimensionalidad, el mecanismo de atención ni si emplea attention lineal o híbrida.

Tampoco se documentan los datos de entrenamiento: ni volumen de tokens, ni composición del corpus, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La única operación verificable es la conversión a GGUF mediante Unsloth, herramienta citada explícitamente en la model card. El sufijo `RP_Base` y el término `CharThink` sugieren un ajuste orientado a roleplay con modo de razonamiento de personaje, pero es una inferencia a partir del nombre del archivo, no un dato confirmado por el autor.

## Capacidades

- Generación de texto conversacional multi-turno: el tag `conversational` y el pipeline declarado apuntan a este uso como función principal.
- Procesamiento de imágenes: el archivo `mmproj` en BF16 habilita entrada multimodal mediante `llama-mtmd-cli`; el alcance exacto (OCR, descripción, VQA) no está documentado.
- Integración con llama.cpp: los tres archivos publicados están pensados para `llama-cli` y `llama-mtmd-cli`, con soporte de plantillas de chat vía `--jinja`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse con una interfaz compatible con la API de OpenAI a través de `llama-server`.
- Roleplay y personajes: presumiblemente cubierto por el ajuste `RP`/`CharThink`, sin documentación que lo confirme.
- Tool calling, razonamiento multi-paso, matemáticas, código y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional autoalojada: con ~8,95 B de parámetros y cuantización Q4_K_M, el modelo cabe en una GPU de 12 GB y puede servirse con `llama-server` como backend compatible con OpenAI para un chatbot interno sin dependencia de APIs externas.
- Roleplay y narrativa interactiva: el nombre del repositorio (`RP_Base`, `CharThink`) sugiere un ajuste específico para mantener personajes coherentes en conversaciones largas; adecuado para prototipos de ficción interactiva donde se prioriza el estilo sobre la precisión factual.
- Procesamiento de documentos escaneados: el proyector multimodal permite pasar imágenes junto al texto a `llama-mtmd-cli`, de modo que se puede extraer información de facturas, formularios o capturas sin un pipeline OCR separado.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la cuantización Q4_K_M reduce el peso a unos 5,5 GB, lo que permite ejecución en portátiles con GPU de 8 GB o incluso en CPU con llama.cpp, útil para entornos con requisitos de soberanía del dato.
- Evaluación comparativa de la familia Qwen 3.5: al estar en GGUF, sirve para medir latencia, throughput y calidad percibida frente a otros modelos de ~9 B en el mismo runtime, antes de comprometerse con una arquitectura.
- Generación de texto con control de estilo: si se confirma la orientación a personajes, encaja en tareas de reescritura con voz fija (copy publicitario, guiones, diálogos) donde la consistencia tonal importa más que el razonamiento analítico.
- Base para fine-tuning posterior: el formato GGUF no es el ideal para reentrenar, pero el modelo original de 8,95 B en safetensors sí permite LoRA sobre la arquitectura subyacente si se localiza el checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto, y el repositorio no cuenta con descargas ni valoraciones que permitan inferir un nivel de rendimiento.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 5,5 GB solo para los pesos, más caché KV y el proyector multimodal; presupuestar 7-8 GB para contexto moderado. Estimación calculada a partir del número de parámetros y los bits por peso, no publicada por el autor.
- VRAM estimada para Q6_K: aproximadamente 7,3 GB de pesos; presupuestar 9-10 GB en total.
- BF16: solo se distribuye el proyector multimodal en este formato, no los pesos completos. Un checkpoint completo en BF16 rondaría los 17,9 GB, por lo que haría falta una GPU de 24 GB o descarga en CPU.
- GPU de consumo: Q4_K_M encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; Q6_K requiere 12 GB o más. En GPUs de 8 GB habrá que reducir contexto o recurrir a offload parcial a CPU.
- GPU de datacenter: A100 40/80 GB, H100 o L40S están sobradamente dimensionadas para este tamaño; su uso tendría sentido solo por concurrencia alta, no por requisitos de memoria.
- Opciones de despliegue: llama.cpp es la ruta documentada (`llama-cli --jinja` para texto, `llama-mtmd-cli --jinja` para multimodal); también `llama-server` para exponer una API compatible con OpenAI. Ollama y LM Studio pueden importar los GGUF, y vLLM admiteGGUF con limitaciones. TGI no está documentado para este artefacto.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna de ColdBrew-Qwen3.5 corresponden al repositorio analizado; los de las alternativas provienen de su documentación pública y deben verificarse contra la versión vigente de cada modelo, ya que no forman parte de la información proporcionada en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | GGUF disponible | Uso comercial |
|---|---|---|---|---|---|
| ColdBrew-Qwen3.5-CharThink-Base | ~8,95 B | No disponible | No disponible | Sí (Q4_K_M, Q6_K) | No confirmado |
| Llama 3.1 8B | ~8,03 B | 128.000 tokens | Llama 3.1 Community License | Sí | Sí, con restricciones |
| Qwen3 8B | ~8,2 B | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Sí | Sí |
| Gemma 2 9B | ~9,24 B | 8.192 tokens | Gemma Terms of Use | Sí | Sí, con restricciones |

La comparación de rendimiento no es posible: no hay benchmarks publicados para el modelo de SvalTek. La ventaja diferencial de este artefacto frente a las alternativas es la capacidad multimodal declarada mediante `mmproj`; su desventaja principal es la ausencia de licencia, contexto documentado y validación comunitaria.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial. Es un bloqueante para cualquier despliegue en producción hasta que el autor lo aclare.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento del análisis. No hay evidencia de que el artefacto haya sido probado por terceros.
- Sin benchmarks ni evaluación de calidad: no se puede estimar su rendimiento relativo frente a modelos de tamaño similar.
- Contexto desconocido: no se documenta la ventana máxima, lo que impide planificar tareas de contexto largo y arriesga degradación silenciosa si se excede.
- Idiomas no declarados: se desconoce si el modelo conserva el multilingüismo de la familia Qwen o si el ajuste lo ha reducido al inglés.
- Pérdida por cuantización: Q4_K_M introduce degradación en tareas de razonamiento y matemáticas frente a BF16; para código o cálculo conviene Q6_K.
- Riesgo de alucinación: inherente a los modelos de ~9 B sin datos de alineación documentados; el ajuste orientado a roleplay puede priorizar la coherencia narrativa sobre la veracidad.
- Contenido sin filtrar: el sufijo `Base` sugiere ausencia de etapas de alineación o moderación, por lo que puede producir contenido no apto sin un filtro externo.
- Fecha de creación reciente y autoría única: repositorio de un solo usuario, sin garantía de mantenimiento ni de corrección de errores.
- Dependencia del runtime: el rendimiento y el soporte multimodal dependen de la versión de llama.cpp; los GGUF antiguos pueden no cargar en versiones nuevas y viceversa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SvalTek/ColdBrew-Qwen3.5-CharThink-Base-GGUF
- Unsloth (herramienta de conversión citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime de los GGUF, referencia para `llama-cli` y `llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo del modelo: no disponible
- Resultados de benchmarks: no disponible
