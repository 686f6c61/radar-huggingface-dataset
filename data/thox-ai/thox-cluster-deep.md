# Thox-ai/thox-cluster-deep

## Resumen

thox-cluster-deep es una distribución configurada por Thox-ai del modelo Llama 3.1 405B Instruct de Meta, el mayor modelo de pesos abiertos de la familia Llama 3.1. No se trata de un fine-tuning ni de un modelo entrenado por THOX: los pesos son byte-idénticos a la distribución oficial de Ollama del modelo base (verificado por SHA-256 en la revisión de la release del 31 de octubre de 2026), y el trabajo de THOX se limita a la capa de configuración, empaquetado y documentación orientada a su tecnología de clustering MeshStack/MagStack. El modelo se publica como build ejecutable en Ollama con cuantización Q4_K_M en formato GGUF y un tamaño de 243 GB.

El interés del modelo reside en su escala: 405 000 millones de parámetros con una ventana de contexto de 128 000 tokens, pensado para análisis y síntesis de grado investigación ejecutados de forma completamente local. La propuesta de THOX es combinar este modelo con su capa de orquestación distribuida entre dispositivos (MeshStack), de modo que el operador pueda repartir la carga de un modelo que no cabe en un solo equipo convencional.

Es relevante ahora como ejemplo de la tensión entre modelos de frontera de pesos abiertos y hardware de consumo: la propia model card reconoce que la evaluación independiente por parte de THOX está pendiente y que las cifras de rendimiento citadas provienen del catálogo original de Meta, no de mediciones propias. La ficha debe leerse, por tanto, como una distribución de Llama 3.1 405B Instruct con un envoltorio de despliegue concreto, no como un modelo nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 405B Instruct; no se detalla en la información disponible) |
| Parámetros totales | 405 000 millones |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantización | Q4_K_M (GGUF) en la build publicada; no se documentan otras |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | GGUF (build de Ollama); el repositorio de HuggingFace solo contiene `.gitattributes` (1 519 B) |
| Tamaño de la distribución | 243 GB |
| Modelo base | meta-llama/Llama-3.1-405B-Instruct |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.1 405B Instruct de Meta, un transformer decoder-only de 405 000 millones de parámetros. La información proporcionada no detalla la configuración interna de capas, cabezas de atención ni mecanismos específicos (por ejemplo, GQA o atención con RoPE), por lo que esos datos deben consultarse en la model card del modelo base. THOX no aporta ninguna modificación arquitectónica: su intervención se sitúa en la capa de configuración de runtime, el empaquetado GGUF y la documentación.

En cuanto al entrenamiento, la model card es explícita: no existe un run de fine-tuning, dataset ni procedimiento de entrenamiento propio de THOX. Los datos de entrenamiento son los de Meta, que según el registro del modelo base superan los 15 billones de tokens. Tampoco se documentan en esta ficha detalles sobre RLHF, DPO u otras fases de alineación del modelo original; esa información corresponde a la documentación de Meta. La innovación técnica atribuible a esta distribución es de despliegue, no de modelado: la integración con MeshStack para repartir el modelo entre varios dispositivos y la tecnología MagStack de conexión física mediante pines pogos magnéticos entre dispositivos ThoxNova.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de Llama 3.1 405B Instruct.
- Análisis y síntesis de documentación extensa gracias a la ventana de contexto de 128 000 tokens.
- Tareas de investigación: revisión de literatura, meta-análisis y trabajo de hipótesis, según el uso previsto declarado por el autor.
- Razonamiento de largo horizonte sobre datos privados en entornos completamente locales.
- Inferencia local sin dependencia de servicios externos por diseño; el modelo no accede a información en línea salvo que el operador lo conecte explícitamente.
- Capacidades de tool calling y function calling: no se documentan en la información proporcionada para esta distribución; deben verificarse contra la model card de Llama 3.1 405B Instruct.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta distribución.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Revisión de literatura académica: el modelo puede procesar conjuntos amplios de artículos y generar síntesis comparativas aprovechando los 128 000 tokens de contexto, lo que permite introducir varios documentos completos en una sola pasada sin fragmentación agresiva.
- Meta-análisis y trabajo de hipótesis en laboratorio: con despliegue local, los datos de investigación no salen de la infraestructura del operador, lo que facilita el cumplimiento de requisitos de confidencialidad en estudios con datos sensibles.
- Investigación legal y de políticas sobre documentación privada: la ventana de contexto larga permite analizar contratos, expedientes o normativa extensa en una única sesión, manteniendo el material dentro de la organización.
- Análisis estratégico de largo horizonte en consultoría: el modelo puede mantener coherencia sobre hilos de razonamiento extensos, útil para informes que requieren integrar muchas fuentes en una conclusión única.
- Investigación financiera sobre datos internos: al ejecutarse en local, permite trabajar con estados financieros y modelos propietarios sin enviarlos a APIs de terceros.
- Despliegue en clúster de investigación con MeshStack: en entornos con varios dispositivos ThoxNova o hardware equivalente, la capa de orquestación de THOX distribuye el modelo entre nodos, lo que hace viable ejecutar un modelo de 243 GB que no cabe en un solo equipo.
- Experimentación en IA de frontera con pesos abiertos: como build reproducible en Ollama, sirve para estudiar el comportamiento de un modelo de 405B en condiciones controladas y comparar configuraciones de cuantización y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios en la información disponible. La model card indica explícitamente que las cifras que pudieran citarse provienen del catálogo original de Meta para el modelo base, que no se reejecutaron para esta publicación de HuggingFace, y que la evaluación independiente de THOX está pendiente. Tampoco se publican cifras de throughput, latencia, concurrencia, uptime ni ahorro de costes para esta release; la propia card retiró esas afirmaciones por falta de evidencia de despliegue.

| Benchmark | thox-cluster-deep | Llama 3.1 405B Instruct (base) |
|---|---|---|
| MMLU | no disponible | no disponible en la información proporcionada |
| HumanEval | no disponible | no disponible en la información proporcionada |
| GSM8K | no disponible | no disponible en la información proporcionada |

## Requisitos de hardware

- VRAM/RAM estimada: la distribución publicada ocupa 243 GB en cuantización Q4_K_M, por lo que se necesita al menos esa cantidad de memoria agregada para cargar los pesos.
- Requisito mínimo por dispositivo según la card original: 96 GB de RAM por dispositivo.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. Por el tamaño del modelo, un despliegue en una sola máquina requiere configuraciones multi-GPU de gama profesional o de centro de datos (A100, H100 u equivalentes); esta recomendación es una inferencia a partir del tamaño y no un dato publicado por el autor.
- ¿Cabe en GPU de consumo? No en una sola unidad: 243 GB excede con holgura la VRAM de cualquier GPU de consumo actual. Solo es viable repartiendo el modelo entre varios dispositivos, que es precisamente el escenario para el que THOX lo empaqueta.
- Opciones de despliegue: Ollama es el método documentado (`ollama pull Thox-ai/thox-cluster-deep` y `ollama run Thox-ai/thox-cluster-deep`). La orquestación distribuida se realiza mediante MeshStack, que se distribuye por separado de esta descarga. No se documentan integraciones con vLLM, TGI ni llama.cpp directo en la información disponible.
- Latencia y throughput: no disponibles. La card indica que el comportamiento y la velocidad dependen enteramente del hardware y la configuración del operador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| thox-cluster-deep | 405B | 128K | Llama 3.1 Community License | GGUF Q4_K_M vía Ollama (243 GB) | Distribución de Llama 3.1 405B Instruct con configuración THOX; pesos idénticos al upstream |
| Llama 3.1 405B Instruct (Meta) | 405B | 128K | Llama 3.1 Community License | Safetensors y distribuciones oficiales | Modelo base original; referencia canónica para benchmarks y licencia |
| Llama 3.1 70B Instruct (Meta) | 70B | 128K | Llama 3.1 Community License | Safetensors, GGUF | Alternativa de menor tamaño que sí puede desplegarse en configuraciones de hardware más modestas |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K | Llama 3.1 Community License | Safetensors, GGUF | Opción para GPU de consumo; menor capacidad de razonamiento que el 405B |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de escala similar de otros proveedores) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Tamaño prohibitivo: 243 GB de datos de modelo implican que el despliegue local solo es viable con hardware especializado o con la capa de clustering de THOX; no es un modelo para equipos convencionales.
- Licencia: los pesos se rigen por la Llama 3.1 Community License Agreement, no por MIT. La propia card corrige una versión anterior que indicaba MIT por error. El uso comercial está sujeto a los términos de dicha licencia, que deben revisarse antes de cualquier despliegue en producción.
- Idiomas: el modelo está etiquetado únicamente para inglés, lo que limita su uso directo en castellano u otros idiomas sin evaluación adicional.
- Sin evaluación independiente: THOX no ha ejecutado benchmarks propios sobre esta release; las cifras del catálogo original no están verificadas de forma independiente.
- Sin acceso a información externa por diseño: el modelo no consulta servicios en línea salvo que el operador lo integre explícitamente, lo que limita tareas que requieran datos actualizados.
- Riesgo de alucinación: la card advierte que las salidas pueden ser incorrectas y que los resultados en contextos profesionales, médicos, legales, financieros y de seguridad requieren revisión humana cualificada.
- Sesgos: no se documentan análisis específicos de sesgo en la información proporcionada; deben evaluarse a partir de la documentación del modelo base.
- Dependencia de la capa de despliegue: el valor añadido de THOX (MeshStack) se distribuye por separado de esta descarga, por lo que el modelo por sí solo no habilita el clustering anunciado.
- Repositorio de HuggingFace mínimo: contiene únicamente un archivo `.gitattributes`; la build ejecutable se sirve desde Ollama, no desde HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/thox-cluster-deep
- Build en Ollama: https://ollama.com/Thox-ai/thox-cluster-deep
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-405B-Instruct
- Sitio de THOX (campaña Kickstarter y MeshStack): https://thox.ai
