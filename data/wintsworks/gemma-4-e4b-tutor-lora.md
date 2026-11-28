# WintsWorks/gemma-4-e4b-tutor-lora

## Resumen

`WintsWorks/gemma-4-e4b-tutor-lora` es un ajuste fino (LoRA fusionado y convertido a GGUF) del modelo multimodal Gemma 4 E4B instruct, publicado por el usuario WintsWorks en Hugging Face. El modelo parte de la familia Gemma 4 de Google DeepMind, en su variante E4B (aproximadamente 7.500 millones de parametros totales segun los pesos en safetensors), y esta orientado a tareas de tutoria conversacional, segun indica el propio nombre del repositorio. La model card no documenta el dataset de ajuste ni el objetivo concreto del entrenamiento, por lo que la informacion sobre el proceso de fine-tuning es practicamente inexistente.

El repositorio se distribuye principalmente en formato GGUF para su uso con llama.cpp y llama-cpp, con dos artefactos: una cuantizacion Q4_K_M del modelo de lenguaje y un proyector multimodal en F16 (`gemma-4-E4B-it.F16-mmproj.gguf`). Esto permite ejecutar el modelo en local con `llama-cli` (solo texto) o `llama-mtmd-cli` (multimodal) mediante la opcion `--jinja`. El ajuste se realizo con Unsloth, segun la model card.

Su relevancia es limitada pero practica: ofrece una via sencilla de probar un Gemma 4 multimodal cuantizado en hardware de consumo, con soporte para vision a traves del proyector separado. No obstante, el repositorio no incluye informacion sobre licencia, idiomas, benchmarks ni detalles del entrenamiento, y no registra descargas ni interacciones en el momento de la consulta, lo que aconseja tratarlo con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector vision-lenguaje); detalles no disponibles |
| Parametros totales | 7.518.069.290 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 (proyector mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el repo base segun metadatos) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Gemma 4 E4B instruct, una variante multimodal de la familia Gemma 4. La arquitectura concreta (numero de capas, atencion, mecanismo de vision) no se detalla en la model card; los tags indican que es un modelo vision-lenguaje. El ajuste se realizo con Unsloth, que la model card describe como "2x faster" en el entrenamiento, y posteriormente se fusiono y convirtio a GGUF. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La unica innovacion tecnica documentada es el flujo de conversion y despliegue: separacion del proyector multimodal (`mmproj`) del modelo de lenguaje, lo que permite usar llama.cpp con `llama-mtmd-cli` para inferencia multimodal. La model card advierte que Ollama no soporta ficheros `mmproj` separados y recomienda crear un modelo unificado en bf16 mediante un `Modelfile`.

## Capacidades

- Generacion de texto conversacional en el contexto de tutoria (objetivo declarado en el nombre del modelo).
- Capacidades multimodales (vision-lenguaje) a traves del proyector `F16-mmproj.gguf` y `llama-mtmd-cli`.
- Compatibilidad con llama.cpp y llama-cpp mediante el flag `--jinja`.
- Soporte declarado de "endpoints_compatible" en los tags, lo que sugiere integracion con APIs compatibles.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingues especificas.

## Casos de uso

- Tutoria educativa local: el modelo puede desplegarse en un portatil con llama.cpp para responder preguntas de estudiantes, dado su tamano de ~7.500 millones de parametros y cuantizacion Q4_K_M (apto para GPUs de consumo).
- Asistencia con imagenes en entornos sin conexion: gracias al proyector multimodal, puede analizar diagramas, capturas o fotografias y responder en texto, util para docencia o soporte tecnico offline.
- Prototipado rapido de asistentes conversacionales: la integracion con llama-cli y `--jinja` permite levantar un chatbot de prueba en minutos sin infraestructura adicional.
- Evaluacion de modelos Gemma 4 ajustados: sirve como referencia para comparar el efecto del fine-tuning de Unsloth frente al modelo base en tareas de tutoria.
- Despliegue en estaciones de trabajo con GPU consumer: la cuantizacion Q4_K_M reduce el peso a unos pocos GB, lo que permite ejecutarlo en tarjetas de 8-12 GB de VRAM.
- Integracion en pipelines de investigacion sobre vision-lenguaje: el par LLM + mmproj permite experimentar con el pipeline multimodal de llama.cpp sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con Q4_K_M, el modelo de lenguaje ocupa aproximadamente 4-5 GB; el proyector F16 anade un consumo adicional no especificado. En total, se estima un rango de 6-8 GB para inferencia multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; no se dispone de datos oficiales de rendimiento.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM para la variante Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), llama-cpp y, con limitaciones, Ollama (requiere crear un modelo unificado en bf16).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WintsWorks/gemma-4-e4b-tutor-lora | ~7.500 M | no disponible | no disponible | GGUF | Ajuste de tutoria con vision |
| Gemma 4 E4B instruct (base) | ~7.500 M | no disponible | no disponible | safetensors/GGUF | Modelo base de Google; referencia directa |
| Otros Gemma 4 ajustados con Unsloth | variable | no disponible | no disponible | GGUF | Alternativas similares en el ecosistema Unsloth |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni el proceso de ajuste, lo que impide evaluar sesgos introducidos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad.
- Licencia no especificada: no se puede garantizar el uso comercial sin consultar la licencia del modelo base Gemma 4.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Repositorio sin descargas ni interacciones: no hay evidencia de validacion por parte de la comunidad.
- Ollama no soporta `mmproj` separado, lo que limita el despliegue multimodal directo en esa plataforma.
- El ajuste fino puede degradar capacidades generales del modelo base; no hay benchmarks que lo confirmen o descarten.

## Enlaces

- Hugging Face: https://huggingface.co/WintsWorks/gemma-4-e4b-tutor-lora
- Unsloth: https://github.com/unslothai/unsloth
