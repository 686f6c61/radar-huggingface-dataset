# Thox-ai/thox-pro-8b

## Resumen

thox-pro-8b es una distribución configurada por THOX.ai del modelo Ministral-3-8B-Instruct-2512 de Mistral AI, empaquetada para inferencia local en un único dispositivo. No se trata de un modelo entrenado por THOX: los pesos son byte a byte idénticos a los de la distribución oficial de Mistral en Ollama (verificado por SHA-256 en la revisión del 31 de octubre de 2026), y el trabajo del autor se limita a la configuración de runtime, la documentación y la capa de clustering MeshStack. El modelo se publica bajo licencia Apache 2.0 y acepta entrada de texto e imagen (hasta 5 imágenes por petición).

La propuesta de valor es el despliegue local-first con una ventana de contexto de 256.000 tokens y capacidades multimodales, orientado a análisis de documentos, gráficos y diagramas en hardware propio. THOX declara soporte para más de 32 idiomas según la ficha del modelo base, aunque la model card de Hugging Face solo lista `en` en el campo de idiomas. La build servida es una cuantización Q4_K_M en formato GGUF de aproximadamente 6,0 GB, ejecutable mediante Ollama.

Es relevante ahora porque se posiciona en el nicho de modelos de 8B con contexto muy largo y visión, pensados para entornos donde los datos no pueden salir del dispositivo. Conviene señalar que la propia model card incluye una corrección explícita: retira afirmaciones previas de cumplimiento HIPAA, SOC 2 y FERPA, y aclara que no se reclama ninguna métrica de benchmark, latencia, throughput ni ahorro de costes para esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Ministral-3-8B-Instruct-2512; detalles no disponibles en la información proporcionada) |
| Parametros totales | 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) en la build servida; no se documentan otras variantes |
| Idiomas soportados | 32+ según la ficha del modelo base; el campo `language` de Hugging Face lista solo `en` |
| Licencia | Apache 2.0 (pesos, sujetos a los términos del modelo base) |
| Formato de pesos | GGUF (distribución Ollama); el repositorio de Hugging Face contiene únicamente `.gitattributes` (1.519 B) |

## Arquitectura y entrenamiento

THOX no ha entrenado ni ajustado los pesos: la model card declara explícitamente que no existe un run de fine-tuning propio, ni un dataset o procedimiento de entrenamiento de THOX, y que no se añadieron datasets para esta release. La arquitectura, los datos de entrenamiento y el procedimiento (incluidos posibles RLHF/DPO) son los del modelo base Ministral-3-8B-Instruct-2512 de Mistral AI, y deben consultarse en su model card. La información proporcionada no detalla la arquitectura interna más allá de su naturaleza multimodal texto-imagen.

La contribución técnica de THOX se sitúa en la capa de distribución y orquestación: configuración de runtime para inferencia en un solo dispositivo, y el diseño MagStack/MeshStack, un sistema de clustering dispositivo-a-dispositivo con pines pogo magnéticos (MagStack) y tecnología mesh over-air, orientado a repartir modelos y compartir recursos entre dispositivos. Esta release Pro 8B es la variante de un solo dispositivo; la variante Cluster Swift comparte el mismo artefacto de pesos (mismo digest SHA-256) y se empaqueta para servicio en equipo multi-dispositivo.

## Capacidades

- Generación de texto y razonamiento en inglés y, según la ficha del modelo base, más de 32 idiomas.
- Entrada multimodal texto-imagen: análisis de documentos, gráficos y diagramas, con un máximo de 5 imágenes por petición.
- Procesamiento de contexto largo: hasta 256.000 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Inferencia completamente local mediante Ollama, sin dependencia de API remota.
- Orquestación distribuida opcional mediante MeshStack (componente separado de esta descarga).
- Tool calling / function calling: no documentado en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no documentado en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos en local: contratos, informes o expedientes de cientos de páginas caben en la ventana de 256.000 tokens, permitiendo resumen y extracción de cláusulas sin enviar datos a la nube.
- Procesamiento de gráficos y diagramas: con hasta 5 imágenes por petición, el modelo puede interpretar tablas, organigramas y diagramas técnicos junto con texto de contexto, útil en ingeniería y consultoría.
- Asistencia multilingüe para equipos distribuidos: la cobertura declarada de 32+ idiomas permite atender consultas y redactar documentación en varios idiomas desde un único despliegue local.
- Flujos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, encaja en entornos donde los datos no pueden salir de la infraestructura propia, siempre que el operador asuma sus propias obligaciones regulatorias.
- Despliegue en estaciones de trabajo profesionales: con ~6 GB de pesos en Q4_K_M, puede correr en portátiles y equipos de sobremesa con GPU de gama media-alta, sirviendo como asistente de ofimática y análisis.
- Prototipado y evaluación de modelos multimodales: al ser una distribución reproducible vía Ollama, sirve para probar pipelines de visión-lenguaje antes de comprometerse con infraestructura mayor.
- Servicio en equipo mediante MeshStack: la línea Cluster (mismo artefacto de pesos) permite repartir la carga entre varios dispositivos en escenarios de equipo, aunque esta build concreta está pensada para un solo dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras que pudieran citarse provienen de Mistral para el modelo base, se reprodujeron de la tarjeta original en Ollama y no se re-ejecutaron para esta publicación; asimismo, la evaluación independiente de THOX está pendiente y no se reclama ninguna métrica de rendimiento, latencia, throughput ni concurrencia para esta release.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB para los pesos en Q4_K_M, más overhead de contexto KV; con 256.000 tokens de contexto el consumo de KV cache puede ser muy elevado y requerir GPUs de 24 GB o más si se usa la ventana completa.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 ofrecen margen amplio para contexto largo; GPUs de 8-12 GB pueden ejecutar el modelo con contextos moderados.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM para contextos cortos o medios; el contexto máximo práctico dependerá de la VRAM disponible.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thox-pro-8b`); al ser GGUF, es compatible con llama.cpp y otros runtimes GGUF. Soporte de vLLM o TGI no documentado en la información proporcionada.
- Latencia y throughput: no disponibles; el autor no reclama cifras para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thox-pro-8b | 8B | 256.000 | Sí (5 imágenes/petición) | Apache 2.0 | Ollama; Hugging Face solo como model card |
| Ministral-3-8B-Instruct-2512 (base) | 8B | 256.000 | Sí | Apache 2.0 (según modelo base) | Mistral AI / Ollama |
| thox-cluster-swift | 8B | 256.000 | Sí | Apache 2.0 | Ollama; mismo artefacto de pesos, orientado a multi-dispositivo |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de otros proveedores; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La visión está optimizada para documentos, gráficos e imágenes profesionales, no para fotografía general.
- Máximo de 5 imágenes por petición.
- El operador es responsable de cumplir las obligaciones regulatorias aplicables a su despliegue; THOX no certifica HIPAA, SOC 2 ni FERPA para este modelo (corrección explícita en la model card).
- Las salidas en ámbitos médico, legal o financiero requieren verificación por un profesional licenciado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de fidelidad para esta release.
- La model card lista solo `en` en el campo de idiomas de Hugging Face, en contraste con los 32+ idiomas declarados para el modelo base; conviene validar el rendimiento en castellano antes de usarlo en producción.
- No se reclaman cifras de benchmark, latencia, throughput, concurrencia, uptime ni ahorro de costes; la evaluación independiente está pendiente.
- La build servida es Q4_K_M, no precisión completa, pese a que versiones anteriores de la tarjeta afirmaban lo contrario.
- El repositorio de Hugging Face no contiene pesos: solo un archivo `.gitattributes`. La distribución ejecutable está en Ollama.
- La licencia Apache 2.0 se aplica a los pesos, sujetos a los términos del modelo base; verificar dichos términos antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/thox-pro-8b
- Ollama: https://ollama.com/Thox-ai/thox-pro-8b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Sitio del autor (campaña MeshStack): https://thox.ai
