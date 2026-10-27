# zerofata/G4-LuneLight-31B

## Resumen

G4-LuneLight-31B es un ajuste fino (fine-tune) del modelo ReadyArt/gemma-4-31B-it-scotoma-2, publicado por el usuario zerofata en HuggingFace. Se trata de un modelo denso de 31.273.086.512 parámetros (aproximadamente 31,27 mil millones) construido sobre la arquitectura Gemma 4 en su variante instruction-tuned, según se desprende de la etiqueta `gemma4` y del nombre del modelo base.

El modelo resuelve, a priori, el mismo problema que su base: generación de texto conversacional y asistida por instrucciones en un rango de tamaño de 31B, que se sitúa en la franja de modelos que requieren aceleradores de gama alta o cuantización agresiva para inferencia local. La model card publicada está estructurada como una plantilla visual de ficha de personaje (con CSS embebido y referencias a SillyTavern), lo que sugiere un uso orientado a roleplay, narrativa interactiva o generación creativa, aunque el autor no lo declara explícitamente.

La relevancia actual del modelo es limitada pero concreta: se publica bajo licencia apache-2.0 declarada, con pesos en safetensors y un tamaño de repositorio de 62,6 GB, coherente con pesos en bf16/fp16 para 31,27B de parámetros. No obstante, la información técnica disponible es muy escasa: no se documentan longitud de contexto, idiomas, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun etiqueta `gemma4` y modelo base); detalles internos no disponibles |
| Parametros totales | 31.273.086.512 (31,27B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin variantes GGUF, AWQ, GPTQ ni EXL2) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (declarada en la model card y en las etiquetas del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo derivado de ReadyArt/gemma-4-31B-it-scotoma-2 mediante fine-tune, y que la etiqueta del repositorio lo clasifica en la familia `gemma4`. El recuento real de parametros en safetensors (31.273.086.512) y el tamano del repositorio (62,6 GB) son consistentes con un modelo denso almacenado en bf16/fp16 (aproximadamente 2 bytes por parametro). No se especifica si la arquitectura incorpora atención lineal, decodificación especulativa, mezcla de expertos ni ninguna otra innovación técnica.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre el procedimiento de fine-tune aplicado respecto al modelo base. El sufijo "scotoma" del modelo del que deriva no viene acompanado de explicacion tecnica en la informacion proporcionada. La model card consiste fundamentalmente en una plantilla HTML/CSS con fines de presentacion y no contiene secciones tecnicas sustantivas.

## Capacidades

- Generacion de texto y conversacion multi-turno: capacidad heredada del modelo base instruction-tuned, aunque no se documenta explicitamente en la ficha.
- Generacion creativa y narrativa: la estructuracion de la model card como ficha de personaje para SillyTavern apunta a un uso previsto en roleplay y escritura interactiva.
- Seguimiento de instrucciones: presupuesto por la variante `-it` del modelo base; sin verificacion publicada en esta ficha.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles (no documentadas).

## Casos de uso

- Roleplay y narrativa interactiva: la model card esta construida como plantilla de personaje con estilos compatibles con interfaces tipo SillyTavern, por lo que el uso previsto parece ser la conversacion con personajes persistentes; requeriria confirmar la longitud de contexto real para mantener historiales largos.
- Generacion creativa asistida: redaccion de ficcion, dialogos y desarrollo de personajes aprovechando un modelo de 31B afinado sobre una base instruct, con mayor capacidad de matiz estilistico que modelos de 7B-8B.
- Prototipado de asistentes conversacionales: al ser un modelo de 31B con licencia permisiva declarada, sirve para validar flujos de atencion al cliente o asistentes internos antes de invertir en modelos mayores.
- Reescritura y edicion de texto largo: útil en tareas de resumen, reescritura de estilo y correccion, siempre que se confirme la ventana de contexto disponible.
- Experimentacion en investigacion sobre fine-tunes: como caso de estudio de ajustes sobre la familia Gemma 4, comparando comportamiento respecto al modelo base ReadyArt/gemma-4-31B-it-scotoma-2.
- Generacion de codigo y asistencia tecnica: plausible por herencia de la base instruct, pero sin benchmarks publicados que lo respalden; no recomendable en produccion sin evaluacion previa.
- Despliegue on-premise con cuantizacion: al no publicarse GGUF, requeriria conversion propia a 4/8 bits para ejecucion en GPUs de consumo, lo que anade un paso de ingenieria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (aproximada a partir de los 31,27B de parametros, unos 62,6 GB de pesos): en torno a 66-72 GB considerando cache KV y overhead. Requiere 1x H100 80GB, 1x A100 80GB o 2x A100 40GB con tensor parallelism.
- VRAM estimada en 8 bits (unos 31-33 GB de pesos): en torno a 36-40 GB con overhead; encaja en 1x A100 40GB, 1x L40S 48GB o 1x H200.
- VRAM estimada en 4 bits (unos 16-18 GB de pesos): en torno a 20-24 GB con overhead; encaja en RTX 4090 24GB y RTX 3090 24GB, con margen ajustado para contextos largos.
- Cabe en GPU de consumo: si, mediante cuantizacion a 4 bits (RTX 4090, RTX 3090, y previsiblemente GPUs de 32 GB). En precision nativa no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM y TGI son viables con los pesos safetensors publicados. llama.cpp y Ollama requeririan convertir el modelo a GGUF, ya que el repositorio no incluye esa variante. Los valores anteriores son estimaciones aritmeticas a partir del numero de parametros, no mediciones publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zerofata/G4-LuneLight-31B | 31,27B | no disponible | apache-2.0 (declarada) | Pesos safetensors en HF | Fine-tune con model card de tipo plantilla; 29 descargas, 13 likes |
| ReadyArt/gemma-4-31B-it-scotoma-2 | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Modelo base en HF | Origen directo del fine-tune |
| Otras alternativas de ~30B | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de comparativas adicionales |

No se dispone de informacion sobre modelos comparables de terceros que permita una comparacion con cifras verificadas de rendimiento.

## Limitaciones y advertencias

- Ausencia casi total de documentacion tecnica: la model card es una plantilla visual sin secciones de arquitectura, datos de entrenamiento, contexto o evaluacion, lo que impide validar el modelo antes de usarlo.
- Licencia: se declara apache-2.0, pero la familia Gemma se distribuye habitualmente bajo los terminos de uso de Google. Conviene verificar la licencia del modelo base ReadyArt/gemma-4-31B-it-scotoma-2 antes de cualquier uso comercial, ya que una declaracion de licencia en un fine-tune no prevalece necesariamente sobre las condiciones del modelo upstream.
- Riesgo de alucinacion: no cuantificado ni documentado; es esperable un comportamiento similar al de otros modelos de 31B sin evaluacion publicada.
- Sesgos: no documentados. Al no describirse la composicion del dataset de fine-tune, no es posible evaluar sesgos de dominio ni de estilo.
- Idiomas: la lista de idiomas no esta declarada; no se puede asumir un rendimiento equilibrado en castellano u otras lenguas.
- Contexto: se desconoce la ventana maxima, lo que impide planificar casos de uso con documentos largos o historiales extensos.
- Produccion: no se han publicado benchmarks, evaluaciones de seguridad ni pruebas de robustez. Su uso en entornos productivos requiere una evaluacion propia previa.
- Comunidad muy reducida (29 descargas, 13 likes) y fecha de publicacion reciente; no hay evidencia de mantenimiento ni de soporte por parte del autor.
- No se publican variantes cuantizadas, lo que anade trabajo de conversion para despliegues en hardware limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zerofata/G4-LuneLight-31B
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2

No se han encontrado en la busqueda web papers, blogs tecnicos, repositorios de codigo ni demos adicionales asociados a este modelo.
