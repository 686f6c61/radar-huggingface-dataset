# WorkOffline/Qwen3-8B-UD-GGUF

## Resumen

Qwen3-8B-UD-GGUF es un espejo de los ficheros GGUF del modelo Qwen3-8B publicados por Unsloth, mantenido por el usuario WorkOffline para que su aplicación WorkOffline pueda descargarlos desde un único punto, fijados a una revisión exacta y verificados mediante SHA-256. No se trata de un modelo nuevo ni de un ajuste fino: el contenido binario es idéntico al de los ficheros originales de Unsloth, y solo puede diferir el nombre del fichero. Todo el mérito del modelo corresponde a Alibaba Qwen y el de la conversión a GGUF a Unsloth.

El modelo subyacente, Qwen3-8B, es un transformer denso de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) desarrollado por el equipo Qwen de Alibaba, distribuido bajo licencia Apache 2.0. Esta ficha describe, por tanto, el comportamiento del modelo Qwen3-8B en su cuantización dinámica UD-Q4_K_XL de Unsloth, que es el único fichero incluido en este repositorio (5.135.722.304 bytes, unos 5,1 GB).

La relevancia de este repositorio es logística más que técnica: ofrece una copia inmutable y verificable de una cuantización popular para despliegue local, lo que resulta útil en pipelines que necesitan reproducibilidad estricta de los pesos. Para evaluación técnica del modelo conviene consultar la documentación oficial de Qwen3-8B, ya que esta model card no aporta información adicional sobre arquitectura, entrenamiento o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-8B; transformer denso según la familia Qwen3, sin detalle en la información proporcionada) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (cuantización dinámica de Unsloth); otras cuantizaciones no incluidas en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3-8B-UD-Q4_K_XL.gguf`, 5.135.722.304 bytes, SHA-256 `34a514d08f7449cb4a694a707aaa2eedccb7bb68290121bf5e5a569b2abe71c3`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la información proporcionada. La model card de este repositorio es únicamente una nota de espejo: documenta el origen de los ficheros, la revisión upstream (`a6adef130ffb23ddaf1a62fec9dced968c9bc482` de `unsloth/Qwen3-8B-GGUF`) y el hash SHA-256 para verificación de integridad, pero no describe el modelo.

La única innovación técnica documentada aquí es el propio proceso de cuantización: Unsloth Dynamic (UD) Q4_K_XL, una cuantización de 4 bits con asignación dinámica de precisión por capa, que busca preservar mejor la calidad que una cuantización Q4_K_M estándar al mismo tamaño aproximado. Los bytes son idénticos a los del fichero upstream; este repositorio no introduce ninguna modificación sobre ellos.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica uso previsto para diálogo, aunque no se detallan capacidades específicas en la información disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el fichero puede servirse a través de infraestructura de inferencia compatible con la API de Hugging Face.
- Razonamiento, código, matemáticas, tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local reproducible: el repositorio fija una revisión exacta y un SHA-256 verificable, lo que permite a un pipeline de CI/CD descargar siempre los mismos bytes y detectar corrupción o sustitución del fichero antes de cargarlo.
- Distribución dentro de una aplicación de escritorio: tal como indica la model card, sirve como origen único de descarga para la app WorkOffline, evitando depender de múltiples repositorios upstream.
- Inferencia en CPU o GPU de gama media: con unos 5,1 GB en Q4_K_XL, el fichero es apto para ejecutarse con llama.cpp u Ollama en equipos con recursos limitados, aunque no se dispone de cifras de latencia o throughput.
- Evaluación comparativa de cuantizaciones: al ser una UD-Q4_K_XL, permite medir la pérdida de calidad frente a los pesos originales en safetensors dentro de un mismo entorno controlado.
- Prototipado de asistentes conversacionales: el uso conversacional etiquetado permite montar un chatbot de pruebas local sin depender de servicios en la nube.
- Archivado y cumplimiento: mantener una copia con hash documentado facilita auditorías de procedencia de los pesos en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,1 GB solo para los pesos en Q4_K_XL; hay que sumar el espacio de contexto KV, cuyo tamaño exacto no está disponible al desconocerse la longitud de contexto y la configuración de atención.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el fichero es compatible con GPUs de consumo con 8 GB o más de VRAM, si bien esta estimación no procede de datos publicados en el repositorio.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en esta cuantización; sin confirmación oficial en la información disponible.
- Opciones de despliegue: llama.cpp y Ollama son los runners habituales para GGUF; la etiqueta `endpoints_compatible` apunta a servidores de inferencia compatibles con la API de Hugging Face. No se detallan integraciones con vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WorkOffline/Qwen3-8B-UD-GGUF | 8,19 B | no disponible | GGUF UD-Q4_K_XL (5,1 GB) | Apache 2.0 | Espejo verificado con SHA-256 |
| Qwen/Qwen3-8B | 8,19 B | no disponible | safetensors | Apache 2.0 | Repositorio oficial de Qwen |
| unsloth/Qwen3-8B-GGUF | 8,19 B | no disponible | GGUF (múltiples cuantizaciones) | Apache 2.0 | Repositorio upstream de la conversión |

Los tres repositorios contienen el mismo modelo; las diferencias son de empaquetado y procedencia, no de capacidades. No se dispone de datos de rendimiento para comparar con otras familias de modelos del mismo tamaño.

## Limitaciones y advertencias

- Es un espejo, no un modelo propio: no hay garantía de mantenimiento, actualizaciones ni soporte por parte de WorkOffline; la fuente autoritativa es Qwen y la conversión GGUF es de Unsloth.
- Solo incluye una cuantización (UD-Q4_K_XL): no hay versiones Q5, Q6, Q8 ni FP16 en este repositorio, lo que limita su uso cuando se requiere mayor fidelidad numérica.
- La cuantización a 4 bits introduce degradación de calidad respecto a los pesos originales; su magnitud no está documentada en la información disponible.
- No se dispone de información sobre sesgos, tasas de alucinación, cobertura idiomática ni limitaciones de contexto del modelo base en esta model card.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; el fichero `LICENSE` se copia del repositorio oficial de Qwen.
- Para producción conviene verificar el SHA-256 tras la descarga y fijar la revisión del repositorio, ya que el objetivo declarado del espejo es precisamente garantizar reproducibilidad.
- Cualquier evaluación de capacidades debe hacerse contra la documentación oficial de Qwen3-8B, no contra esta model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorkOffline/Qwen3-8B-UD-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3-8B
- Conversión GGUF upstream: https://huggingface.co/unsloth/Qwen3-8B-GGUF
- Revisión upstream de los ficheros GGUF: `a6adef130ffb23ddaf1a62fec9dced968c9bc482`
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia copiada del repositorio oficial: https://huggingface.co/Qwen/Qwen3-8B/blob/b968826d9c46dd6066d109eabc6255188de91218/LICENSE
