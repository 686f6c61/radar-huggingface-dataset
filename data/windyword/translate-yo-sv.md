# WindyWord/translate-yo-sv

## Resumen

WindyWord/translate-yo-sv es un modelo de traducción automática neuronal especializado en la dirección yoruba → sueco, publicado por WindyWord (Windstorm Labs) dentro de su catálogo abierto de modelos de traducción. Se trata de un ajuste fino (los artefactos se distribuyen en subcarpetas denominadas `lora/`) sobre el modelo base Helsinki-NLP/opus-mt-yo-sv de la Universidad de Helsinki, que a su vez pertenece a la familia OPUS-MT construida con la arquitectura Marian de tipo encoder-decoder. El repositorio ocupa 0,4 GB e incluye dos variantes desplegables: WindyStandard en formato Transformers para GPU y una cuantización INT8 en CTranslate2 pensada para inferencia en CPU.

El modelo resuelve un par lingüístico de bajo recurso: el yoruba (yo) es una lengua nígero-congolesa con decenas de millones de hablantes, principalmente en Nigeria y Benín, mientras que el sueco (sv) es una lengua germánica septentrional. La combinación yo→sv es poco frecuente en los catálogos de traducción disponibles, por lo que este modelo cubre un nicho concreto para servicios dirigidos a comunidades yoruba-hablantes en Suecia y para proyectos de localización que necesiten ese par sin recurrir a sistemas multilingües masivos.

Es relevante ahora por su licencia Apache-2.0, que permite uso comercial sin las restricciones que arrastran alternativas como NLLB-200 (CC-BY-NC-4.0), y por su formato dual GPU/CPU, que facilita el despliegue en infraestructura modesta. Como contrapartida, el autor no publica puntuaciones de calidad en la propia model card, por lo que la evaluación objetiva queda delegada a la página de catálogo externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT, familia OPUS-MT) |
| Parametros totales | no disponible (no se publica el recuento en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP (variante `lora/`) e INT8 (variante `lora-ct2-int8/` vía CTranslate2) |
| Idiomas soportados | Yoruba (yo) y sueco (sv); la dirección declarada es yo → sv |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors / Transformers (PyTorch); CTranslate2 INT8 en la variante CPU |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal por el grupo de Helsinki-NLP. El punto de partida es Helsinki-NLP/opus-mt-yo-sv, un modelo bilingüe de la colección OPUS-MT entrenado sobre corpus paralelos recopilados en el proyecto OPUS. Sobre esa base, WindyWord distribuye variantes propias bajo la etiqueta WindyStandard, que la model card describe como la «línea base de producción» en formato Transformers.

La información publicada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Los artefactos se organizan en subcarpetas (`lora/` y `lora-ct2-int8/`), lo que sugiere un ajuste mediante adaptadores de bajo rango sobre el modelo base, aunque el repositorio no documenta los hiperparámetros, el volumen de datos de ajuste ni la receta exacta. La única innovación operativa destacable es la conversión a CTranslate2 con cuantización INT8, orientada a reducir el uso de memoria y acelerar la inferencia en CPU. La model card advierte además de la retirada temporal de unas variantes denominadas WindyScripture (`herm0-scripture/`, `scripture-ct2-int8/`) mientras se revisan las licencias de sus textos fuente de eBible, una medida de precaución que no afecta a las variantes aquí descritas.

## Capacidades

- Traducción de texto de yoruba a sueco, tarea única para la que está etiquetado el pipeline (`translation`).
- Ejecución en GPU mediante Transformers/PyTorch con los pesos en formato safetensors.
- Ejecución en CPU optimizada gracias a la variante CTranslate2 en INT8.
- Compatibilidad con Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- Integración como modelo base ajustable en pipelines de traducción automática.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- No se declara soporte multilingüe más allá del par yoruba-sueco.

## Casos de uso

- Traducción de documentación oficial y formularios para la diáspora yoruba en Suecia: el modelo permite convertir materiales administrativos de yoruba a sueco sin coste de licencia, al ser Apache-2.0 y poder desplegarse en la propia infraestructura.
- Localización de sitios web y aplicaciones: al ser un modelo pequeño (repositorio de 0,4 GB) puede servirse desde una única instancia y escalar horizontalmente para traducir cadenas de interfaz, descripciones de producto o artículos.
- Procesamiento por lotes de corpus: la variante CTranslate2 INT8 permite traducir grandes volúmenes de texto en servidores sin GPU, lo que resulta adecuado para migrar archivos históricos o construir corpus paralelos yo-sv.
- Subtitulado y transcripción: en combinación con un sistema de reconocimiento de voz en yoruba, el modelo puede generar subtítulos en sueco para contenido audiovisual; la salida debe revisarse por la posible pérdida de matices.
- Atención al ciudadano en servicios públicos: traducción asistida de consultas y respuestas en ventanillas o chats de atención, con revisión humana en los casos sensibles.
- Investigación lingüística y estudios contrastivos yo-sv: generación de traducciones de referencia para análisis morfológico o sintáctico, siempre con validación manual.
- Preprocesado en pipelines de búsqueda multilingüe: traducción de consultas y documentos a un idioma común (sueco) para indexación y recuperación.
- Prototipado rápido en local: con la variante INT8 puede ejecutarse en un portátil sin GPU para pruebas funcionales antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se publica ninguna puntuación de calidad en el repositorio y remite a la página de catálogo de WindyWord para consultar las puntuaciones de cribado «donde se hayan medido». No se dispone de cifras de BLEU, chrF, COMET ni de otras métricas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 0,4 GB, por lo que los pesos en FP ocupan unos cientos de megabytes y la variante INT8 reduce aún más el consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos gigabytes de VRAM. El modelo cabe con holgura en tarjetas de gama de entrada y media como GTX 1050 Ti, GTX 1650, RTX 3060 o superiores; también en A100, H100 o L4 si se busca agregar muchas peticiones concurrentes.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna, incluidas las integradas con suficiente memoria compartida.
- CPU: es un escenario viable gracias a la variante `lora-ct2-int8/` con CTranslate2.
- Opciones de despliegue: Transformers (PyTorch) con `MarianMTModel`/`MarianTokenizer`, CTranslate2 para CPU, y Hugging Face Inference Endpoints (el tag `endpoints_compatible` lo respalda). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WindyWord/translate-yo-sv | Marian (encoder-decoder) | no disponible | no disponible | yo → sv | Apache-2.0 | Hugging Face, variantes GPU y CPU INT8 |
| Helsinki-NLP/opus-mt-yo-sv | Marian (encoder-decoder) | no disponible | no disponible | yo → sv | Apache-2.0 | Hugging Face (modelo base del anterior) |
| facebook/nllb-200-distilled-600M | Transformer encoder-decoder multilingüe | 600 M | no disponible | 200 idiomas, incluye yoruba y sueco | CC-BY-NC-4.0 (no comercial) | Hugging Face |
| facebook/m2m-100-418M | Transformer encoder-decoder multilingüe | 418 M | no disponible | 100 idiomas, incluye yoruba y sueco | MIT | Hugging Face |

Frente a los modelos multilingües, la ventaja de translate-yo-sv es su tamaño reducido, su licencia Apache-2.0 (frente a la CC-BY-NC-4.0 de NLLB-200) y su especialización en un único par. La contrapartida es la ausencia de métricas publicadas, que impide comparar la calidad de forma objetiva.

## Limitaciones y advertencias

- No hay puntuaciones de calidad ni métricas publicadas en el repositorio; la evaluación queda pendiente de la página de catálogo externa.
- Sesgos conocidos: no documentados. Al derivar de corpus OPUS, puede heredar los sesgos de dominio y de estilo de esos datos (predominio de textos religiosos, jurídicos o de noticias, según la composición de OPUS).
- Riesgo de alucinación: propio de cualquier sistema de traducción neuronal, especialmente en pares de bajo recurso como yo-sv, con posibles omisiones, adiciones o falsos equivalentes.
- Cobertura de idioma limitada al par yoruba-sueco; no se declara traducción inversa (sv → yo).
- La variante WindyStandard se distribuye en una subcarpeta `lora/` pero no se describen los adaptadores ni los hiperparámetros, lo que dificulta reproducir el ajuste.
- Se han retirado temporalmente del repositorio las variantes WindyScripture por una revisión de licencias de textos de eBible; conviene verificar la vigencia de los archivos antes de depender de rutas antiguas.
- Existe una copia canónica declarada en https://huggingface.co/WindyTranslate/translate-yo-sv; es recomendable fijar la revisión concreta en producción para evitar derivas entre repositorios.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar el aviso de licencia y las atribuciones (véase `NOTICE.md` en el repositorio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WindyWord/translate-yo-sv
- Copia canónica declarada: https://huggingface.co/WindyTranslate/translate-yo-sv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-yo-sv
- Página de catálogo de WindyWord (puntuaciones y licencias): https://windytranslate.com/models/translate-yo-sv
- Aplicaciones de Windy Word: https://windyword.ai
- Proyecto OPUS y colección OPUS-MT de Helsinki-NLP: no se proporciona enlace directo en la información disponible.
