# tabisai/tabis-1.1-experimental

## Resumen

TABIS 1.1 0.8B es un ajuste fino experimental del modelo Qwen3.5-0.8B orientado al idioma sajá (sakha, yakut), una lengua túrquica hablada principalmente en la república de Sajá (Yakutia, Rusia). Lo desarrolla el autor independiente tabisai, que parte del modelo base de Qwen y lo adapta mediante un proceso en dos fases: continuación de preentrenamiento (CPT) sobre un corpus monolingüe en sajá y ajuste supervisado (SFT) sobre diálogos. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors y GGUF.

Con 752.393.024 parámetros totales (un modelo denso de menos de mil millones), está pensado para inferencia local en hardware modesto: la cuantización Q4_K_M ocupa aproximadamente 505 MiB y las versiones F16 y BF16 rondan los 1,41 GiB. El autor lo publica de forma deliberadamente incompleta, como resultado intermedio, para que la comunidad pueda probarlo y contribuir a su mejora. Es relevante porque existen muy pocos modelos abiertos dedicados al sajá, y este ofrece una vía práctica de despliegue offline con un tokenizador extendido específicamente para ese idioma.

La versión concreta descrita es la variante "Human sensitivity", que incorpora un pequeño número de correcciones humanas (siete ejemplos en entrenamiento y dos en validación) dentro del conjunto de SFT. El autor advierte explícitamente de que se trata de un experimento sin evaluación independiente por parte de hablantes nativos ni un YakutEval completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-0.8B), ajuste fino con QLoRA |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (contexto usado en el entrenamiento) |
| Tipos de cuantizacion | F16, BF16, Q4_K_M (GGUF); base NF4 durante el entrenamiento |
| Idiomas soportados | sajá (sah), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (merged-hf-bf16), GGUF (F16, BF16, Q4_K_M), adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de menos de mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con QLoRA (base cuantizada en 4 bits NF4, LoRA con `r=16` y `alpha=32`), contexto de 1024 tokens, batch de 1 con acumulación de gradiente de 8 y optimizador AdamW de 8 bits. Al tokenizador original se le añadieron 110 tokens para el sajá, y las filas de embeddings correspondientes se entrenaron junto con el adaptador. Para esta publicación, la base NF4 se convirtió a BF16 y se fusionó con el adaptador, generando pesos F16, BF16 y GGUF Q4_K_M.

El entrenamiento se dividió en dos etapas. La CPT usó el corpus monolingüe `ailabykt/sakha-corpus-mono`, con 216.022 documentos y 354.822.906 tokens (con EOS) en el split de entrenamiento y 3.298 documentos y 4.805.554 tokens en validación; se completó una pasada de 57.446 pasos con learning rate 5e-5, y la loss de validación bajó de 4,1013 a 1,6447. Después, el SFT empleó 9.678 diálogos de entrenamiento y 503 de validación (7.055 del conjunto sintético `tabisai/tabis-sakha-dialogues-7500` y 2.623 de candidatos previos), con learning rate 2e-5, una época y 1.210 pasos; la loss de validación pasó de 1,9337 a 1,5661 (train loss 1,6365). En esta versión no se utilizó NEFTune. El autor señala que la loss no mide la naturalidad, la veracidad ni la calidad del diálogo en sajá.

## Capacidades

- Generación de texto conversacional en sajá: respuestas a preguntas sencillas y réplicas cortas de tipo coloquial.
- Comprensión y generación en ruso como idioma secundario.
- Funcionamiento totalmente local y offline una vez descargados los pesos, sin dependencia de la nube.
- Despliegue en LM Studio y en llama.cpp (el autor verificó F16 y Q4_K_M en GPU en LM Studio, y BF16 mediante llama.cpp en CPU).
- Soporte de cuantizaciones ligeras que permiten ejecución en hardware de gama baja.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking); de hecho, el autor recomienda desactivar el modo thinking en la interfaz.

## Casos de uso

- Pruebas de concepto de asistentes conversacionales en sajá: el modelo puede mantener intercambios breves en ese idioma y ejecutarse en local, lo que permite validar un flujo de chat sin costes de API ni envío de datos a terceros.
- Aplicaciones educativas para el aprendizaje del sajá: generación de ejemplos de frases y diálogos sencillos que sirvan como material de práctica, siempre con revisión humana por la escasa fiabilidad factual.
- Investigación lingüística y experimentación con modelos de bajo recurso: sirve como base para estudiar el efecto de la CPT y el SFT sobre un idioma con pocos datos, y como punto de partida para nuevos ajustes.
- Prototipado de interfaces de voz o texto para comunidades de Sajá: al caber en cuantización Q4_K_M en torno a 505 MiB, puede integrarse en dispositivos con recursos limitados y funcionar sin conexión.
- Evaluación comparativa de técnicas de adaptación multilingüe: el repositorio incluye adaptadores, logs de entrenamiento y métricas de loss que permiten reproducir o contrastar el pipeline QLoRA sobre un modelo base pequeño.
- Generación de borradores de diálogo para anotación: el modelo puede producir candidatos de conversación que después se filtran y corrigen manualmente, alimentando así conjuntos de datos de mayor calidad para futuras versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de loss de entrenamiento y validación, además de una comparación cualitativa muy limitada sobre cuatro preguntas básicas, que él mismo califica de insuficiente para extraer conclusiones generales.

| Metrica | Antes | Despues |
|---|---:|---:|
| Loss de validacion CPT | 4,1013 | 1,6447 |
| Loss de validacion SFT (Human sensitivity) | 1,9337 | 1,5661 |
| Loss de entrenamiento SFT | no disponible | 1,6365 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 505 MiB con Q4_K_M; en torno a 1,41 GiB con F16 o BF16 (más overhead del runtime).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM puede ejecutar las versiones cuantizadas; para F16/BF16 conviene disponer de 2-4 GB. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en tarjetas de gama baja y media (por ejemplo, series GTX/RTX con 2 GB o más) y también en CPU mediante llama.cpp.
- Opciones de despliegue: LM Studio, llama.cpp y cualquier runtime compatible con GGUF; los pesos safetensors permiten su uso con frameworks de Hugging Face. El autor no documenta vLLM ni TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| TABIS 1.1 0.8B | 752 M | 1024 | sajá, ruso | Apache 2.0 | Ajuste experimental para sajá; sin benchmarks publicados |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingüe (sin foco en sajá) | no disponible en la informacion | Modelo base del que deriva TABIS; mayor cobertura general pero sin adaptación al sajá |
| Alternativas dedicadas al sajá | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos abiertos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo experimental e incompleto: el propio autor lo describe como un resultado intermedio, no como una versión final.
- Riesgo alto de alucinación: puede inventar con seguridad datos biográficos e históricos; en la prueba del autor no identificó el Ysyakh como gran fiesta veraniega del pueblo sajá.
- Respuestas incoherentes, evasivas o repetitivas, confusión de personas gramaticales y errores en matemáticas y lógica.
- Calidad lingüística no validada por hablantes nativos ni mediante un YakutEval completo; las comparaciones previas se hicieron en parte con GigaChat, que también puede equivocarse en sajá.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura de idiomas reducida a sajá y ruso; no es un modelo multilingüe general.
- El autor recomienda desactivar el modo thinking; su uso sin desactivarlo puede degradar la generación.
- Las respuestas pueden diferir entre el sitio web, los GGUF y las distintas cuantizaciones.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y fiabilidad del modelo no están garantizadas para producción sin verificación humana.
- No debe usarse como fuente de hechos sin comprobación adicional en contextos donde la precisión sea crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabisai/tabis-1.1-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de CPT: https://huggingface.co/datasets/ailabykt/sakha-corpus-mono
- Dataset de diálogos: https://huggingface.co/datasets/tabisai/tabis-sakha-dialogues-7500
- Logs de entrenamiento CPT: `evaluation/cpt_training_metrics_resumed.json` (en el repositorio del modelo)
- Logs de entrenamiento SFT: `evaluation/sft_training_metrics.json` (en el repositorio del modelo)
