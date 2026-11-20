# StreamUnhingedPro/streamunhinged-pro-models

## Resumen

StreamUnhinged Pro es un paquete de distribucion local de IA, no un modelo entrenado desde cero. El repositorio `StreamUnhingedPro/streamunhinged-pro-models` aloja el archivo `StreamUnhinged-Pro-Editorial.zip`, que el instalador de la aplicacion descarga automaticamente y verifica mediante tamano exacto y SHA-256 antes de instalar. El contenido son binarios y pesos upstream sin modificar: Qwen2.5-7B-Instruct en formato cuantizado de Ollama, el ejecutable de Ollama, las librerias de runtime de llama.cpp/ggml y el codigo fuente correspondiente de FFmpeg.

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer denso de 7.000 millones de parametros desarrollado por Alibaba Qwen, con licencia Apache-2.0. Este paquete no aporta pesos nuevos ni un fine-tune propio: los tags de Hugging Face lo declaran como `base_model:Qwen/Qwen2.5-7B-Instruct` con relacion `finetune`, pero la model card no documenta ningun proceso de ajuste, dataset adicional ni cambio en los pesos. El tamano del repositorio (4,8 GB) es coherente con una distribucion cuantizada del modelo de 7B junto con los binarios del runtime.

Su relevancia es practica: simplifica el despliegue de un LLM de 7B en local para una aplicacion de escritorio concreta (StreamUnhinged Pro), empaquetando runtime y modelo en un unico artefacto verificable. Para desarrolladores e investigadores no aporta innovacion en modelado, pero sirve como ejemplo de empaquetado reproducible de inferencia local con comprobacion de integridad criptografica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-7B-Instruct); el paquete anade runtime Ollama/llama.cpp |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; no documentada en este repo) |
| Tipos de cuantizacion | Formato cuantizado de Ollama (`qwen2.5:7b`); nivel de cuantizacion exacto no disponible |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (modelo); Ollama y llama.cpp/ggml bajo MIT; FFmpeg bajo LGPL-3.0 |
| Formato de pesos | Blobs de Ollama (formato cuantizado de llama.cpp/ggml), empaquetados en ZIP |
| Tamano del repositorio | 4,8 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-7B-Instruct, es un transformer denso de 7.000 millones de parametros de Alibaba Qwen, distribuido originalmente bajo Apache-2.0. Este repositorio no documenta ningun entrenamiento adicional: la model card describe exclusivamente el contenido del paquete (`Qwen2.5-7B-Instruct` en formato Ollama, el binario `ollama.exe`, las librerias de runtime de llama.cpp/ggml y el codigo fuente de FFmpeg). No se indican tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF/DPO) ni innovaciones arquitectonicas propias.

La innovacion tecnica del paquete es de ingenieria de distribucion, no de modelado: el instalador comprueba el tamano exacto y el SHA-256 del ZIP antes de instalarlo, rechazando archivos alterados o corruptos. Los archivos upstream se incluyen sin modificar, y las licencias se preservan como capas dentro de la estructura del paquete (`runtime/editorial/models/blobs`, `OLLAMA_LICENSE`, `lib/ollama/*_LICENSE`, `ffmpeg-source/`).

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados de Qwen2.5-7B-Instruct.
- Generacion de codigo y resolucion de problemas matematicos basicos e intermedios (capacidades del modelo base).
- Instrucciones en formato chat (modelo `-Instruct`).
- Inferencia 100 % local mediante Ollama y llama.cpp/ggml, sin dependencia de API externa.
- Verificacion de integridad del paquete (tamano y SHA-256) durante la instalacion.
- Capacidades especificas del modelo base (tool calling, idiomas, contexto extendido) no estan documentadas en este repositorio; deben consultarse en la model card oficial de Qwen2.5-7B-Instruct.

## Casos de uso

- Despliegue de escritorio con IA local: la aplicacion StreamUnhinged Pro instala el modelo y el runtime en un unico paso, sin que el usuario configure Ollama ni descargue pesos por separado; la verificacion SHA-256 garantiza que el binario no ha sido manipulado en transito.
- Entornos sin conectividad o con requisitos de privacidad: al ejecutarse sobre llama.cpp/ggml en local, las conversaciones no salen del equipo, adecuado para flujos donde no se permite enviar datos a APIs en la nube.
- Prototipado rapido de asistentes conversacionales: un desarrollador puede levantar un endpoint compatible con la API de Ollama en minutos y validar prompts e integraciones antes de invertir en infraestructura mayor.
- Distribucion reproducible en equipos: el empaquetado con hash fijado permite replicar exactamente la misma version del modelo y del runtime en varias maquinas, util para pruebas de regresion.
- Educacion y demostraciones: el paquete sirve para mostrar el ciclo completo de inferencia local (modelo cuantizado, runtime, servidor) sin depender de servicios externos.
- Base para evaluacion de cuantizacion: al incluir el modelo en formato Ollama, permite medir latencia y calidad frente a otras cuantizaciones del mismo Qwen2.5-7B-Instruct en hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Cualquier cifra de rendimiento del modelo subyacente debe consultarse en la documentacion oficial de Qwen2.5-7B-Instruct, no en este repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de 7B cuantizado en formato Ollama (tipicamente Q4), el rango habitual es de 4 a 6 GB de VRAM, aunque el nivel exacto de cuantizacion del paquete no se especifica.
- GPU recomendadas: no documentadas por el autor. Por tamano del modelo base, cabria esperar funcionamiento en GPUs consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) y en GPUs de datacenter (A100, H100) con margen amplio.
- Cabe en GPU consumer: probablemente si, en tarjetas con 8 GB o mas de VRAM, sujeto al nivel de cuantizacion real del blob incluido (no confirmado).
- Opciones de despliegue: Ollama (runtime incluido en el paquete) y llama.cpp/ggml (librerias incluidas). vLLM y TGI no estan contemplados en este empaquetado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| StreamUnhinged Pro (este repo) | 7B (Qwen2.5-7B-Instruct) | no disponible | Apache-2.0 | ZIP con blobs Ollama + runtime | Paquete de distribucion, no modelo nuevo |
| Qwen2.5-7B-Instruct (upstream) | 7B | no disponible en esta ficha | Apache-2.0 | Safetensors, GGUF, multiples runtimes | Modelo original; referencia directa |
| Llama 3.1 8B Instruct | 8B | no disponible en esta ficha | Licencia comunitaria Llama | Safetensors, GGUF | Alternativa de tamano similar; licencia mas restrictiva |
| Mistral 7B Instruct | 7B | no disponible en esta ficha | Apache-2.0 | Safetensors, GGUF | Alternativa de tamano similar con licencia permisiva |

La comparacion se limita a parametros, licencia y disponibilidad; no hay datos de rendimiento publicados en este repositorio para contrastar benchmarks.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune documentado: los pesos son los de Qwen2.5-7B-Instruct sin modificar; los tags `finetune` de Hugging Face no se corresponden con ningun proceso de ajuste descrito en la model card.
- Riesgo de alucinacion inherente a los LLM de 7B, especialmente en tareas de razonamiento complejo o datos factuales actualizados.
- Sesgos: no documentados en este repositorio; deben evaluarse sobre el modelo base Qwen2.5-7B-Instruct.
- Idiomas soportados no declarados en este repositorio; la cobertura linguistica depende del modelo base y no esta verificada aqui.
- Longitud de contexto no documentada en este paquete; no asumir la del modelo base sin confirmarla en su model card oficial.
- Licencia Apache-2.0 permite uso comercial del modelo, pero el paquete incluye componentes con licencias distintas: Ollama y llama.cpp/ggml bajo MIT y FFmpeg bajo LGPL-3.0; la redistribucion debe respetar cada una.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria ni auditoria externa.
- La verificacion SHA-256 protege la integridad del ZIP, pero no certifica la calidad ni la seguridad del contenido mas alla de que coincide con el hash publicado.
- El nivel exacto de cuantizacion no se especifica, lo que impide estimar con precision la perdida de calidad frente a los pesos originales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/StreamUnhingedPro/streamunhinged-pro-models
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Ollama (runtime incluido, licencia MIT): https://ollama.com
- llama.cpp / ggml (runtime incluido, licencia MIT): https://github.com/ggml-org/llama.cpp
- FFmpeg (codigo fuente incluido, licencia LGPL-3.0): https://ffmpeg.org
