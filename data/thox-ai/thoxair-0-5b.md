# Thox-ai/ThoxAir-0.5B

## Resumen

ThoxAir-0.5B es un modelo de generacion de texto de 0,5 mil millones de parametros publicado por Thox-ai (THOX.ai). Se trata de un fine-tuning por SFT del modelo base Qwen/Qwen2.5-0.5B-Instruct, cuyo adaptador LoRA (fp-LoRA) fue fusionado con los pesos base en bf16 mediante `merge_and_unload`. El modelo se presenta como el "flagship" de la linea ThoxAir, orientado a ejecucion en dispositivo (on-device) y entornos edge gracias a su reducido tamano.

El objetivo declarado del modelo es incorporar "hechos canonicos de THOX" y el comportamiento conversacional de la casa en un modelo de 0,5B que pueda ejecutarse en cualquier parte: llama.cpp, Ollama, o transformes estandar. El repositorio incluye pesos safetensors fusionados, cuantizaciones GGUF Q4_K_M y Q8_0, y un Modelfile de Ollama. La licencia es Apache-2.0, heredada del modelo base.

La relevancia actual del modelo es limitada pero concreta: demuestra un flujo de trabajo de fine-tuning SFT sobre un modelo pequeno con publicacion de artefactos listos para produccion (GGUF, Ollama, API compatible con OpenAI). No obstante, la informacion publica sobre datos de entrenamiento, benchmarks estandar y evaluacion independiente es escasa, y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | bf16 (safetensors), Q4_K_M (GGUF), Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 494 millones de parametros, derivado de Qwen/Qwen2.5-0.5B-Instruct. El entrenamiento consistio en un ajuste supervisado (SFT) sobre el dataset propietario Thox-ai/thox-factory-sft-v5, mediante un adaptador LoRA en precision completa (fp-LoRA) que posteriormente se fusiono con los pesos base en bf16 usando `merge_and_unload`. El autor indica que el adaptador se entreno sobre datos SFT propios de THOX y que la fusion se realizo internamente; los pesos base son de Qwen.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La model card menciona una evaluacion interna denominada GATE49 (47/49 en el conjunto de desarrollo, con "cero fallos duros conocidos como falsos"), pero no se detalla la metodologia ni la naturaleza de las pruebas. El repositorio conserva un informe GATE49 de una build anterior (Wave C, 43/49) y remite al repositorio del adaptador para el informe de la build Wave C.2.

## Capacidades

- Generacion de texto conversacional en ingles, con comportamiento ajustado mediante SFT sobre datos propios.
- Incorporacion de "hechos canonicos" y comportamiento de marca de THOX, segun declara el autor.
- Ejecucion en dispositivo y entornos edge gracias a su tamano reducido (menos de 500M parametros).
- Despliegue via Ollama, llama.cpp (comando `llama serve`) y transformers.
- API compatible con OpenAI a traves de `llama serve` (endpoint `/v1/chat/completions`).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en dispositivos con recursos limitados (portatiles, mini-PC, Raspberry Pi con suficiente RAM) usando la cuantizacion Q4_K_M de ~398 MB, sin depender de la nube.
- Prototipado rapido de chatbots de marca: al estar ajustado sobre datos SFT propios de THOX, sirve como ejemplo de como inyectar hechos canonicos y tono de marca en un modelo pequeno; util para equipos que quieran replicar el flujo (LoRA + merge + GGUF).
- Despliegue en edge con Ollama: el comando `ollama run Thox-ai/thoxair-0.5b` permite tener un endpoint conversacional en minutos, adecuado para demos, entornos de desarrollo y pruebas de integracion.
- Servicio local compatible con OpenAI: mediante `llama serve` se expone una API `/v1/chat/completions`, lo que permite sustituir llamadas a APIs comerciales en pipelines de prueba o en aplicaciones que requieran privacidad de datos.
- Educacion y experimentacion: modelo de referencia para estudiar el proceso de fine-tuning SFT, fusion de adaptadores LoRA y publicacion de artefactos cuantizados en Hugging Face.
- Generacion de texto acotada en aplicaciones de escritorio o moviles: por su tamano, puede integrarse en aplicaciones nativas que requieran generacion de respuestas cortas sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta unicamente una evaluacion interna propietaria:

| Evaluacion | Resultado | Conjunto | Notas |
|---|---|---|---|
| GATE49 (Wave C.2) | 47/49 | Desarrollo | "Cero fallos duros conocidos como falsos"; metodologia no detallada |
| GATE49 (Wave C, build anterior) | 43/49 | Desarrollo | Build no promovida, superseded |

No se proporcionan comparaciones con modelos similares en terminos de benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16 (pesos de ~988 MB), ~0,4 GB en Q4_K_M y ~0,53 GB en Q8_0, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar el modelo en cuantizacion Q4_K_M; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 Ti, RTX 3050, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Ollama, llama.cpp (`llama serve`), transformers, text-generation-inference (segun tags del repositorio), API compatible con OpenAI via llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| ThoxAir-0.5B | 0,5B | no disponible | Apache-2.0 | en | Hugging Face, Ollama |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la informacion | Apache-2.0 | multilingue (segun Qwen) | Hugging Face |
| SmolLM2-360M-Instruct | 0,36B | no disponible en la informacion | Apache-2.0 | en (principalmente) | Hugging Face |
| Gemma-2-2B-it | 2B | no disponible en la informacion | Gemma license | multilingue | Hugging Face |

La comparativa se limita a datos de parametros y licencia, ya que no se dispone de benchmarks publicos del modelo evaluado ni de los alternativos en la informacion proporcionada. ThoxAir-0.5B se posiciona como una variante ajustada de Qwen2.5-0.5B-Instruct, por lo que su rendimiento base deberia ser similar al del modelo original, con el sesgo introducido por el SFT propietario.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la model card; al derivar de Qwen2.5-0.5B-Instruct, puede heredar sesgos del modelo base y de los datos SFT propietarios, no auditados publicamente.
- Riesgo de alucinacion: como todo modelo de 0,5B, la precision factual es limitada; el ajuste SFT sobre "hechos canonicos" no garantiza correccion fuera del dominio entrenado.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no se especifica en la informacion disponible y se desconoce si se ha modificado respecto al modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas. No obstante, el autor no detalla terminos adicionales sobre los datos SFT.
- Caveats para produccion: la evaluacion GATE49 es interna y no verificable externamente; no hay benchmarks estandar publicados; el modelo tiene cero "likes" y 2026 descargas en el momento de la consulta, lo que sugiere adopcion limitada. La model card incluye notas del fundador y de la "Chief Agentic Officer" que no aportan informacion tecnica verificable.
- El repositorio conserva un informe GATE49 de una build anterior (43/49) que puede confundir; el informe de la build actual (47/49) se encuentra en el repositorio del adaptador, no en este.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxAir-0.5B
- Repositorio del adaptador (Wave C.2): https://huggingface.co/Thox-ai/ThoxAir-0.5B-WaveC2
- Repositorio de pesos fusionados (registro de build): https://huggingface.co/Thox-ai/ThoxAir-0.5B-WaveC2-Merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset SFT: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Ollama: `ollama run Thox-ai/thoxair-0.5b`
