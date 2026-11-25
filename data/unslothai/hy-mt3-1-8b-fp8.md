# unslothai/Hy-MT3-1.8B-FP8

## Resumen

Hy-MT3-1.8B-FP8 es una distribución en formato FP8 del modelo de traducción multilingüe Hy-MT3-1.8B, desarrollado originalmente por Tencent y reempaquetado por unslothai para su uso con la librería `transformers` y con el entorno Unsloth Desktop. El modelo resuelve el problema de la traducción automática neuronal multilingüe con un tamaño compacto de 1.791.080.448 parámetros (aproximadamente 1,8 mil millones), lo que lo sitúa en la categoría de modelos desplegables en hardware de consumo.

La relevancia de esta variante radica en su cuantización FP8, que reduce el peso del repositorio a 2,0 GB y permite ejecutar inferencia con menor huella de VRAM que la versión en precisión completa, manteniendo la arquitectura original `hunyuan_v1_dense`. Está publicada bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de traducción.

La model card de esta distribución es deliberadamente escueta: remite a la release original de Tencent para lenguajes soportados, ejemplos de prompt y ajustes de inferencia. Por tanto, buena parte de los detalles técnicos (idiomas, datos de entrenamiento, benchmarks) no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base original admite otras cuantizaciones, no detalladas aqui |
| Idiomas soportados | no disponible (la model card remite a la release original de Tencent) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con configuracion de runtime para compressed-tensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `hunyuan_v1_dense`, un transformer denso (no mezcla de expertos) con 1.791.080.448 parámetros. Esta distribución concreta es una cuantización FP8 del modelo base `tencent/Hy-MT3-1.8B`, empaquetada con `compressed-tensors` y compatible con `transformers`. El repositorio incluye `model.safetensors`, el tokenizer y la configuración de runtime.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del entrenamiento original. La model card de esta variante remite explícitamente a la release original de Tencent para cualquier detalle adicional sobre el pipeline de entrenamiento.

## Capacidades

- Traducción automática multilingüe: es la tarea principal declarada (`pipeline_tag: translation`).
- Generación de texto condicionada por prompt de traducción, según el formato que defina la release original.
- Ejecución en `transformers` con pesos safetensors y configuración de cuantización FP8.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Ejecución en Unsloth Desktop en configuraciones que soporten FP8.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.
- Cobertura idiomática concreta: no disponible (remite a la release original).

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y referencias de API manteniendo terminología consistente, gracias a su especialización en traducción y a un tamaño que permite desplegarlo en servidores modestos.
- Localización de interfaces de producto: integrado en un pipeline que extraiga cadenas de recursos (JSON, YAML) y las traduzca por lotes, con la ventaja de que el formato FP8 reduce el coste por instancia.
- Traducción de soporte al cliente: procesamiento de tickets y correos entrantes en múltiples idiomas antes de enrutarlos a agentes humanos, aprovechando la licencia Apache 2.0 para uso comercial.
- Subtitulado y transcripción traducida: combinado con un sistema ASR, el modelo traduce segmentos de texto cortos con baja latencia en hardware de consumo.
- Traducción de contenido editorial y marketing: generación de borradores traducidos que luego revisa un humano, reduciendo el coste frente a servicios propietarios por volumen.
- Investigación en traducción automática: al ser un modelo denso de 1,8B con pesos abiertos y licencia permisiva, sirve como base para fine-tuning o para experimentos de evaluación de cuantización FP8 frente a precisión completa.
- Despliegue en entornos con recursos limitados: la variante FP8 de 2,0 GB permite servir traducción en GPUs de gama media o en instancias cloud económicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 2,0 GB en FP8; se estima un consumo de VRAM en torno a 2-4 GB para pesos y estados de inferencia, aunque la cifra exacta no está confirmada en la información proporcionada.
- GPU recomendadas: no disponible de forma específica; cualquier GPU con soporte FP8 (por ejemplo, arquitecturas Ada Lovelace o Hopper) o con capacidad suficiente para cargar los pesos cuantizados.
- GPU de consumo: por tamaño, es probable que quepa en GPUs de consumo con 8 GB o más de VRAM, si bien la compatibilidad FP8 depende de la arquitectura de la GPU.
- Opciones de despliegue: `transformers` (soporte nativo declarado), Unsloth Desktop (con soporte FP8), y endpoints compatibles. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-FP8 (este) | 1,79B | no disponible | Apache 2.0 | safetensors FP8 | Cuantizacion FP8 de un modelo de traduccion de Tencent |
| tencent/Hy-MT3-1.8B | 1,79B | no disponible | Apache 2.0 | safetensors | Modelo base original en precision completa |
| tencent/Hy-MT3-1.8B-FP8 | 1,79B | no disponible | Apache 2.0 | safetensors FP8 | Release FP8 original de Tencent |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- La model card de esta distribución es mínima y remite a la release original; no documenta idiomas soportados, formato de prompt ni ajustes de inferencia, lo que exige consultar la fuente original antes de desplegar.
- Al ser una cuantización FP8, puede existir una degradación de calidad en la traducción respecto al modelo en precisión completa; no se han publicado evaluaciones que cuantifiquen esa diferencia.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (legal, médico, técnico) no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo `LICENSE.txt` del repositorio y la licencia de la release original para confirmar condiciones.
- El soporte de FP8 depende del hardware y de la versión de las librerías; en GPUs sin soporte nativo puede requerir emulación o no funcionar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria de esta variante concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unslothai/Hy-MT3-1.8B-FP8
- Release FP8 original de Tencent: https://huggingface.co/tencent/Hy-MT3-1.8B-FP8
- Modelo base original: https://huggingface.co/tencent/Hy-MT3-1.8B
- Unsloth Desktop: https://unsloth.ai/
