# TextCortex/clef-cybersecurity

## Resumen

clef-cybersecurity es un detector de prompt injection y exfiltración de datos para inglés y alemán, desarrollado por TextCortex como fine-tuning de Cloudflare/clef-flash. No es un modelo generativo: conserva la cabeza de esquema (schema head) nativa de CLEF y devuelve una puntuación de ataque sobre texto no confiable, sin producir texto. Su función es inspeccionar contenido procedente de superficies de riesgo como PDFs extraídos, documentos de base de conocimiento, skills de agentes, prompts de agentes personalizados, descripciones de herramientas MCP y contexto de peticiones web.

El modelo se distribuye como un adaptador de safetensors de aproximadamente 2,20 GB que contiene una actualización de parámetros completa sobre capas seleccionadas (no es LoRA ni un modelo autónomo). La inferencia requiere el modelo base público y fijado (unos 9,53B de parámetros totales), que el cargador descarga automáticamente; además usa código de inferencia propio y no está configurado para `pipeline()` ni `AutoModel.from_pretrained()`.

Es relevante ahora porque aborda una de las superficies de ataque más activas en despliegues de agentes y RAG: la inyección de instrucciones en contenido no confiable. Declara 0,9925 de AUROC en inglés y 0,9744 en alemán en su conjunto de regresión interno, con una debilidad reconocida en skills en alemán (0,9171 AUROC), por debajo de sus referencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada del modelo base Cloudflare/clef-flash (clasificador de texto con schema head propio de CLEF) |
| Parametros totales | ~9,53B en el modelo base requerido para inferencia; el adaptador añade ~2,20 GB de parametros modificados |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles y aleman (en, de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Cloudflare/clef-flash y aplica una actualización de parámetros completa sobre capas seleccionadas, no una adaptación LoRA ni un modelo independiente. Mantiene la cabeza de esquema nativa de CLEF y opera como clasificador binario de texto (attack/no attack), devolviendo una puntuación en lugar de generar contenido. La inferencia se realiza mediante código propio incluido en el repositorio, con un cargador en Python que descarga automáticamente el modelo base fijado.

El entrenamiento consistió en una ejecución de cuatro épocas, de la que se seleccionó el checkpoint de la época 3 mediante una partición de validación separada (la selección no usó los resultados de benchmark reportados). Los datos de entrenamiento y evaluación son conjuntos internos de regresión frente a prompt injection, derivados en parte de cohortes de clientes que no se redistribuyen. Se aplicaron controles de solapamiento exacto entre train/validación/evaluación y comprobaciones de partición agrupada. El autor advierte que se trata de conjuntos de regresión internos previamente inspeccionados, no de un leaderboard público ni de una prueba ciega de generalización.

## Capacidades

- Clasificación de texto para detección de prompt injection y exfiltración de datos, con una puntuación continua (`score`) y una decisión booleana (`is_attack`).
- Puntuación de texto no confiable sin generación de texto (no es un modelo generativo).
- Soporte de seis superficies declaradas: `file`, `kb`, `skill`, `agent_prompt`, `mcp_description` y `web_fetch`.
- Procesamiento de documentos largos mediante una envoltura ("document wrapper") que preserva todos los caracteres y emplea ventanas solapadas adaptativas.
- Capacidad multilingüe limitada a inglés y alemán.
- No soporta tool calling ni function calling (no aplica a un clasificador).
- No soporta razonamiento multi-paso ni modo thinking (no aplica).

## Casos de uso

- Filtrado de documentos subidos: puntuar el texto extraído de PDFs antes de incorporarlo a un pipeline, usando la superficie `file`, para bloquear instrucciones maliciosas embebidas en el contenido.
- Protección de bases de conocimiento: evaluar documentos de una KB (superficie `kb`) antes de indexarlos en un sistema RAG, evitando que contenido envenenado altere las respuestas del agente.
- Validación de skills de agentes: clasificar el texto de skills personalizadas (superficie `skill`) para detectar intentos de inyección en herramientas reutilizables; conviene tener en cuenta que el rendimiento en alemán para esta superficie es la principal debilidad declarada.
- Auditoría de prompts de agentes personalizados: analizar system prompts y configuraciones de agentes (superficie `agent_prompt`) para detectar instrucciones de exfiltración introducidas por terceros.
- Análisis de descripciones de herramientas MCP: inspeccionar descripciones de tools externas (superficie `mcp_description`) y bloquear aquellas que intenten manipular al agente que las consume.
- Inspección de contenido web recuperado: puntuar texto obtenido mediante peticiones web (superficie `web_fetch`) para mitigar inyecciones de prompt indirectas desde páginas externas.
- Guardrail en producción de agentes: integrar el detector como paso previo en el enrutado de entrada, con umbral ajustable (estricto > 0,5 o > 0,95) según el equilibrio entre ataques detectados y falsos positivos.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados), frente a los modelos de referencia Jev y Laya R2a:

| Metrica | clef-cybersecurity | Jev | Laya R2a |
|---|---:|---:|---:|
| Full English (n=510) AUROC | 0,9925 | 0,9800 | 0,9155 |
| Full German (n=510) AUROC | 0,9744 | 0,9564 | 0,8780 |
| English skills (n=48) AUROC | 1,0000 | 0,9841 | 0,9277 |
| German skills (n=48) AUROC | 0,9171 | 0,9603 | 0,9330 |
| PDF documents (n=730) AUROC | 0,9856 | 0,9785 | 0,8856 |
| PDF attacks caught / 107 | 84 | 73 | 81 |
| Clean PDF false alarms / 623 | 3 | 2 | 0 |
| Umbral de decision (estricto >) | 0,5 | 0,5 | 0,95 |

Datos adicionales: en el umbral predeclarado > 0,95 de CLEF, el checkpoint seleccionado detecta 69/107 ataques en PDF y marca 2/623 documentos limpios. Los conjuntos completos en inglés y alemán contienen 510 casos cada uno (256 ataques y 254 limpios); los subconjuntos de skills tienen 48 casos cada uno (27 ataques y 21 limpios); la cohorte de PDF contiene 107 extractos atacados y 623 documentos limpios. "Laya R2a" se refiere al checkpoint fine-tuneado guardado por el autor, no al modelo público Laya ni al checkpoint anterior de ciberseguridad de Laya. Las diferencias son estimaciones puntuales, sin afirmación de significación estadística.

## Requisitos de hardware

- VRAM: se midió un consumo de aproximadamente 19,8 GiB en inferencia con batch uno sobre el modelo base completo. El autor recomienda reservar margen adicional; documentos más largos y lotes mayores requieren más memoria.
- GPU recomendadas: se requiere una GPU CUDA con memoria suficiente para el modelo base (~9,53B de parámetros). En precisión fp16 el base ocupa del orden de 19 GB, por lo que encajan A100 (40/80 GB), H100 y tarjetas de 24 GB o más (por ejemplo RTX 3090 o RTX 4090) con ajuste justo y sin margen para lotes grandes.
- No cabe en GPUs de consumo con menos de 24 GB de VRAM (por ejemplo 8, 12 o 16 GB).
- Opciones de despliegue: el paquete usa código de inferencia propio con un cargador Python (`clef_detector.load_detector`), que descarga el modelo base automáticamente. No está configurado para `pipeline()` ni `AutoModel.from_pretrained()`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC EN (n=510) | AUROC DE (n=510) | AUROC PDF (n=730) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| clef-cybersecurity | ~9,53B (base) + adaptador 2,20 GB | No disponible | 0,9925 | 0,9744 | 0,9856 | Apache 2.0 | HuggingFace (TextCortex) |
| Jev | No disponible | No disponible | 0,9800 | 0,9564 | 0,9785 | No disponible | Evaluacion alojada (revision no disponible) |
| Laya R2a | No disponible | No disponible | 0,9155 | 0,8780 | 0,8856 | No disponible | Checkpoint fine-tuneado guardado (no publico) |

Nota del autor: los modelos usan encoders nativos y protocolos de ventana distintos, por lo que la comparación es entre sistemas detectores, no una ablación de arquitectura controlada. Los resultados de referencia corresponden a modelos con sus propios historiales de entrenamiento, sin los mismos controles de contaminación.

## Limitaciones y advertencias

- Debilidad declarada en skills en alemán: 0,9171 AUROC, por debajo de Jev (0,9603) y de Laya R2a (0,9330). No supera a todas las referencias en todas las métricas.
- Los benchmarks proceden de conjuntos de regresión internos previamente inspeccionados, no de un leaderboard público ni de una prueba ciega; la reproducibilidad independiente es limitada porque las cohortes derivadas de clientes no se redistribuyen.
- Los subconjuntos de skills (48 casos) ofrecen estimaciones especialmente inciertas.
- Las diferencias frente a las referencias son estimaciones puntuales, no afirmaciones de significación estadística.
- El umbral difiere entre modelos (0,5 para CLEF y Jev; 0,95 para Laya R2a), lo que afecta a los recuentos de detección y falsos positivos.
- La tarea de PDF usa texto extraído, no evalúa el parseo de PDF ni la robustez frente a imágenes u OCR.
- Requiere el modelo base Cloudflare/clef-flash fijado y código de inferencia propio; no es un modelo autónomo ni se carga con la API estándar de transformers.
- La selección del checkpoint usó una partición de validación separada, sin emplear los resultados de benchmark reportados, pero persiste la dependencia de conjuntos internos.
- Riesgo de sesgos: no disponible.
- Los conjuntos de datos de entrenamiento no se distribuyen; solo se publican agregados de benchmark.
- Licencia Apache 2.0, que permite uso comercial, aunque el rendimiento debe validarse en el dominio concreto del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TextCortex/clef-cybersecurity
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Resultados detallados (benchmarks.json): https://huggingface.co/TextCortex/clef-cybersecurity/blob/main/benchmarks.json
