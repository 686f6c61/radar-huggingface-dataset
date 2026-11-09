# ThakiCloud/Thaki-BanCode-KoEn-v2

## Resumen

Thaki-BanCode-KoEn-v2 es un clasificador de texto bilingüe coreano/inglés desarrollado por ThakiCloud que determina si un *prompt* o una salida de modelo contiene un bloque de código de programación. Está diseñado como el motor detrás de un escáner **BanCode** al estilo de LLM Guard, es decir, como componente de *guardrails* para filtrar peticiones maliciosas o no deseadas antes de que lleguen al modelo generativo. El modelo parte de `jhu-clsp/mmBERT-small` (arquitectura ModernBERT) y se ha afinado para clasificación binaria de secuencias.

Con 140,6 millones de parámetros totales, es un modelo compacto pensado para ejecutarse en CPU o en GPU de gama baja dentro de un pipeline de inferencia. Su relevancia actual radica en que elimina casi por completo los falsos positivos del BanCode original de LLM Guard sobre prosa normal (del 91,3 % al 0,00 % en coreano y del 60,7 % al 0,72 % en inglés) manteniendo una tasa de detección de código superior al 99 %. La ventana de contexto efectiva es de 256 tokens: los tokens posteriores se descartan.

La licencia es mixta: los pesos y la configuración están bajo CC BY-SA 4.0, mientras que el código envoltorio es MIT. El repositorio no incluye el tokenizador, que debe cargarse desde el modelo base con una revisión fijada, y requiere transformers 5.x (la serie 4.x no puede cargar esta combinación de configuración y tokenizador ModernBERT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning de `jhu-clsp/mmBERT-small` |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado; los tokens posteriores se descartan) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | CC BY-SA 4.0 (pesos y configuración) + MIT (código envoltorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* de clasificación de secuencias sobre `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingüe de 140 M de parámetros. La tarea es clasificación binaria con dos etiquetas: `code` (id 0) y `no_code` (id 1). La inferencia produce un logit que se convierte en probabilidad mediante softmax, y la decisión se toma con un umbral congelado de 0,5 sobre P(`code`). El perfil operativo (`bancode_v2_profile.json`) está congelado en el momento de la adopción: puntuación = P(`code`), umbral 0,5, `max_length` 256, texto en bruto sin preprocesado. El contrato del escáner es `(sanitized_prompt, is_valid, risk_score)` y sigue la regla `calculate_risk_score(score, 0.5)` de LLM Guard.

La model card no detalla el volumen exacto de tokens de entrenamiento ni la composición completa del dataset, pero sí indica que se usaron fuentes como Wikipedia, Wikibooks y Stack Exchange, con un split de validación sellado antes del entrenamiento y usado una sola vez para la decisión de adopción. La evaluación independiente se realizó sobre un conjunto congelado de 13.814 ítems construido a partir de documentación pública (Kubernetes, React, FastAPI, es-toolkit, Docker), un corpus de chatbot coreano y frases de UD Korean-Kaist y English-EWT, con exclusión a nivel de fuente y eliminación de 1 duplicado exacto y 46 casi duplicados. No se documenta el uso de RLHF ni DPO; es un ajuste supervisado de clasificación.

## Capacidades

- Clasificación binaria de texto: decide si un texto contiene un bloque de código (`code`) o no (`no_code`).
- Detección de bloques de código delimitados por *fences* Markdown con etiqueta de lenguaje.
- Detección de fragmentos de código sin prosa circundante (95,9 % en coreano en el *slice* correspondiente).
- Detección de bloques de marcado HTML/XML (93,9 % en coreano).
- Baja tasa de falsos positivos sobre prosa con fragmentos de código en línea (0,00 % en coreano, 0,08 % en inglés).
- Soporte bilingüe coreano/inglés en el mismo modelo.
- Integración con LLM Guard mediante un envoltorio propio (`bancode.BanCodeV2`), no como *drop-in* de la clase stock.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*: es un clasificador, no un modelo generativo.

## Casos de uso

- **Guardrail de entrada en asistentes de código**: filtrar *prompts* de usuario que contienen bloques de código antes de enviarlos a un modelo generativo, evitando que se ejecuten o procesen cargas no previstas; el modelo está entrenado sobre texto en bruto, por lo que la *fence* es la señal.
- **Filtrado de salidas de modelo**: detectar si una respuesta generada incluye código no autorizado en productos donde la política prohíbe devolver código (por ejemplo, asistentes de atención al cliente o chatbots de contenido editorial).
- **Moderación en plataformas comunitarias**: clasificar mensajes de foros o chats en coreano e inglés para marcar publicaciones que contienen código y derivarlas a un canal o revisor adecuado.
- **Enrutamiento de peticiones**: enviar las peticiones con código a un modelo especializado en programación y las de prosa a un modelo generalista, usando P(`code`) > 0,5 como criterio de enrutamiento.
- **Auditoría de logs de inferencia**: procesar por lotes conversaciones históricas para medir qué proporción contiene código y detectar usos no previstos del servicio.
- **Preprocesado en pipelines de CI/CD de LLM**: como paso previo en un *pipeline* de evaluación o *red teaming* que necesite separar ejemplos con código de ejemplos en prosa, con latencia baja al ser un encoder de 140 M en CPU.
- **Detección de fugas de código en documentación**: revisar documentación generada automáticamente para asegurar que los bloques de código están correctamente delimitados y etiquetados.

## Benchmarks y rendimiento

Evaluación independiente sobre un conjunto congelado de 13.814 ítems (fuentes nunca usadas en entrenamiento):

| Idioma (código / normal) | Modelo | Falsos positivos en texto normal (cota superior IC 95 %) | Tasa de detección de código | AUROC |
|---|---|---:|---:|---:|
| Coreano (2.482 / 4.200) | **este modelo** (umbral 0,5) | **0,00 %** (0 / 4.200; ≤ 0,07 %) | **99,3 %** | 0,9999 |
| | modelo interno previo, solo datos sintéticos (0,5) | 3,45 % | 93,6 % | 0,9867 |
| | BanCode original de LLM Guard `vishnun/codenlbert-sm` (0,97) | 91,3 % | 98,2 % | 0,9025 |
| Inglés (3.010 / 3.600) | **este modelo** (umbral 0,5) | **0,72 %** (26 / 3.600; ≤ 1,00 %) | **99,8 %** | 0,9999 |
| | modelo interno previo, solo datos sintéticos (0,5) | 4,94 % | 93,6 % | 0,9825 |
| | BanCode original de LLM Guard `vishnun/codenlbert-sm` (0,97) | 60,7 % | 95,1 % | 0,8445 |

*Slices* más débiles (n ≥ 50):

| Slice | n | Este modelo | Interno previo | Original |
|---|---:|---:|---:|---:|
| Bloques de marcado coreano (HTML/XML), detección | 66 | 93,9 % | 93,9 % | 98,5 % |
| Fragmentos solo código en coreano sin prosa, detección | 340 | 95,9 % | 98,2 % | 87,9 % |
| Frases generales en inglés (UD English-EWT), falsos positivos | 1.200 | 1,83 % | 1,42 % | 16,6 % |
| Prosa coreana con código en línea, falsos positivos | 1.200 | 0,00 % | 11,1 % | 99,9 % |
| Prosa inglesa con código en línea, falsos positivos | 1.200 | 0,08 % | 11,6 % | 86,3 % |

Los datos de la fase de desarrollo (mismas fuentes que el entrenamiento, no independientes) no están completos en la información disponible: la tabla se corta en la fila de coreano (678 código / 2.541 normal) sin valores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (140 M de parámetros ≈ 560 MB de pesos); en fp16 aproximadamente 280 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo se ha probado en CPU (Python 3.11, torch 2.9.0) y funciona sin GPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) y en CPU.
- Opciones de despliegue: `transformers` 5.x con `AutoModelForSequenceClassification`; el envoltorio `bancode.BanCodeV2` del propio repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (es un clasificador, no un modelo generativo).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 140 M y contexto de 256 tokens, se espera latencia de milisegundos por lote en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Thaki-BanCode-KoEn-v2** | 140,6 M | 256 tokens | Clasificación código/no código (ko/en) | CC BY-SA 4.0 (pesos) + MIT (código) | Hugging Face |
| Modelo interno previo de ThakiCloud (solo datos sintéticos) | no disponible | no disponible | Clasificación código/no código | no disponible | no disponible públicamente |
| `vishnun/codenlbert-sm` (BanCode original de LLM Guard) | no disponible | no disponible | Clasificación código/no código | no disponible | Hugging Face |
| `jhu-clsp/mmBERT-small` (modelo base) | 140 M (aprox.) | no disponible | Encoder multilingüe general | no disponible | Hugging Face |

El modelo supera al BanCode original en falsos positivos (0,00 % frente a 91,3 % en coreano; 0,72 % frente a 60,7 % en inglés) y en AUROC (0,9999 frente a 0,9025 y 0,8445), manteniendo una detección de código igual o superior. Frente al modelo interno previo, la mejora se concentra en falsos positivos sobre prosa con código en línea (0,00 % frente a 11,1 % en coreano).

## Limitaciones y advertencias

- **No es un *drop-in* de la clase stock** `llm_guard.input_scanners.BanCode` de llm-guard 0.3.16: esa clase elimina las *fences* Markdown y los dígitos antes de clasificar (este modelo se entrenó con texto en bruto, donde la *fence* es la señal), compara con la etiqueta `"CODE"` en mayúsculas (aquí es `code` en minúsculas) y fija transformers 4.51.3, que no puede cargar este modelo. Hay que usar el envoltorio y el perfil proporcionados.
- **El repositorio no incluye el tokenizador**: debe cargarse desde `jhu-clsp/mmBERT-small` en la revisión fijada `abc32620dd4f6ab06f5fbe905dc25f310618e09f`, que mantiene sus propios términos. Por eso el *widget* de inferencia alojado no funciona.
- **Contexto limitado a 256 tokens**: los tokens posteriores se descartan, por lo que bloques de código situados más allá de ese límite no se detectan.
- **Rendimiento desigual por *slice***: la detección de bloques de marcado HTML/XML en coreano baja al 93,9 % y la de fragmentos solo código en coreano al 95,9 %; los falsos positivos en frases generales en inglés suben al 1,83 %.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí hay riesgo de clasificación errónea en textos ambiguos o mixtos (prosa con fragmentos de código en línea).
- **Licencia mixta**: los pesos son CC BY-SA 4.0 (con obligaciones de compartir igual) y el código es MIT; hay que revisar `LICENSE.md` y `NOTICE.md` antes de un uso comercial.
- **Idiomas**: solo coreano e inglés; no se ha validado en castellano ni en otros idiomas.
- **Sin datos de sesgo**: la model card no documenta análisis de sesgos por dominio, registro o variedad dialectal.
- **Fecha de creación futura** (2026-11-09) en los metadatos de Hugging Face; conviene verificar la vigencia de la revisión del tokenizador antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/ThakiCloud/Thaki-BanCode-KoEn-v2
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- BanCode original de LLM Guard: https://huggingface.co/vishnun/codenlbert-sm
- Paper referenciado (arXiv:2509.06888): https://arxiv.org/abs/2509.06888
- Repositorio LLM Guard: https://github.com/protectai/llm-guard
- Tarjeta en coreano: `MODEL_CARD.ko.md` (en el repositorio del modelo)
- Licencia: `LICENSE.md` (en el repositorio del modelo)
- Aviso del tokenizador: `NOTICE.md` (en el repositorio del modelo)
