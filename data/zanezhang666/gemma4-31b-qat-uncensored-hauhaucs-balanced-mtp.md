# zanezhang666/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP

## Resumen

Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP es un derivado sin censura del modelo multimodal Gemma 4 31B de Google DeepMind, publicado por el usuario zanezhang666 (bajo la firma HauhauCS). Se distribuye exclusivamente en formato GGUF y mantiene intactas las capacidades del modelo base: entrada de imagen y texto, razonamiento, generacion de codigo, escritura creativa y uso agentico. El autor declara haber eliminado los rechazos (0 de 465 en sus pruebas de refusal) sin modificar los datasets ni las capacidades originales, partiendo de los pesos oficiales de cuantizacion consciente (QAT) de Google.

El modelo es denso, con 30.697.345.596 parametros y una ventana de contexto de 262.144 tokens (256K). Se ofrece en una unica cuantizacion Q4_K_M (18,7 GB) acompanada de un proyector multimodal mmproj en BF16 (1,2 GB) y un cabezal de prediccion multi-token (MTP) de 280 MB que actua como borrador para decodificacion especulativa, con una mejora de velocidad declarada de aproximadamente el 53% sin cambios en la salida.

Su relevancia actual reside en tres factores: la practicidad del formato GGUF para ejecucion local, la incorporacion de decodificacion especulativa mediante MTP en llama.cpp y la orientacion explicita a casos de uso donde los filtros del modelo base resultan limitantes (roleplay, escritura creativa sin restricciones, agentes autonomos). La licencia es la Gemma original, lo que impone restricciones de uso comercial que conviene revisar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4), con cabezal MTP para decodificacion especulativa |
| Parametros totales | 30.697.345.596 (aproximadamente 31B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (texto, 18,7 GB); mmproj BF16 (vision, 1,2 GB); MTP drafter (280 MB). No se publican otras cuantizaciones |
| Idiomas soportados | en (segun metadatos; el modelo base Gemma 4 es multilingue, pero esta ficha declara solo ingles) |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | GGUF (texto, vision y MTP por separado) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer denso de aproximadamente 31B parametros entrenado por Google DeepMind con cuantizacion consciente (QAT) para operar de forma optima en torno a 4 bits. La version publicada aqui conserva esa base y anade un ajuste fino orientado a eliminar rechazos, sin cambios declarados en los datos de entrenamiento ni en las capacidades. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La innovacion tecnica destacable es la inclusion de un cabezal MTP (multi-token prediction) que se usa como modelo borrador en decodificacion especulativa dentro de llama.cpp (parametros `--spec-type draft-mtp` y `-md`). El modelo principal verifica cada token propuesto, de modo que la salida es identica y la ganancia es puramente de velocidad (aproximadamente 53% segun el autor). El soporte de vision se implementa mediante un proyector multimodal separado (mmproj) que debe cargarse junto al modelo. El autor indica que Gemma 4 esta disenado para ~4 bits, por lo que solo publica Q4_K_M como punto de equilibrio entre tamano y calidad.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento previo a la respuesta (el autor indica que el modelo "reasona antes de contestar").
- Generacion de codigo y tareas de programacion agentica.
- Entrada de imagenes (image-text-to-text) mediante el proyector mmproj.
- Escritura creativa y roleplay sin rechazos en la mayoria de casos (0/465 en las pruebas del autor).
- Uso agentico y tareas de fiabilidad critica, segun la variante Balanced.
- Capacidades multilingues heredadas del modelo base, aunque la ficha solo declara ingles.
- Decodificacion especulativa con cabezal MTP para acelerar la generacion.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el ajuste sin censura permite conversaciones de personaje sin rechazos, y el contexto de 256K sostiene sesiones largas con memoria de la historia.
- Escritura creativa sin restricciones: util para ficcion adulta, terror o temas sensibles donde el modelo base tiende a deflectar; la variante Balanced mantiene coherencia y sigue instrucciones.
- Agentes de codigo autonomos: con razonamiento previo y capacidad agentica, puede integrarse en bucles de edicion de codigo y ejecucion de tareas de varios pasos en local.
- Asistente local con vision: cargando el mmproj, permite describir imagenes, extraer texto de capturas o responder preguntas sobre diagramas sin enviar datos a la nube.
- Procesamiento de documentos largos: la ventana de 256K permite resumir o consultar manuales, contratos o bases de codigo extensas en una sola pasada.
- Despliegue en estacion de trabajo con una sola GPU: el Q4_K_M de 18,7 GB cabe en GPUs consumer de 24 GB, lo que facilita prototipado y uso personal con llama.cpp, LM Studio o Jan.
- Aceleracion de inferencia en produccion local: el cabezal MTP reduce el tiempo de generacion aproximadamente un 53%, util para aplicaciones interactivas sensibles a latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la mejora de velocidad de aproximadamente 53% con decodificacion especulativa MTP en llama.cpp, y el resultado de 0/465 rechazos en sus pruebas de refusal (sin detallar la metodologia).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-20 GB para el modelo de texto en Q4_K_M (18,7 GB) mas overhead de contexto; anadir aproximadamente 1,2 GB si se carga el proyector de vision.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. Para contexto completo de 256K se necesita memoria adicional considerable.
- Cabe en GPU consumer de 24 GB (RTX 4090, RTX 3090) en Q4_K_M; en GPUs de 16 GB no cabe sin offloading a CPU.
- Opciones de despliegue: llama.cpp (llama-server / llama-cli), LM Studio, Jan, koboldcpp y otros runtimes GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles de forma absoluta; el autor reporta aproximadamente 53% mas de velocidad con MTP en llama.cpp.
- Advertencia del autor: Gemma 4 puede fallar en LM Studio con modo tensor-split en multi-GPU; recomienda una sola GPU con layer-split u orden de prioridad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP | ~31B denso | 256K | Texto + imagen | gemma | GGUF |
| google/gemma-4-31B-it (base) | ~31B denso | 256K | Texto + imagen | gemma | safetensors y derivados |
| Otras variantes uncensored de Gemma 4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparado con alternativas de la misma categoria, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La eliminacion de rechazos implica que el modelo puede generar contenido sensible, ofensivo o inapropiado; requiere supervision y filtros propios en produccion.
- Riesgo de alucinacion inherente a los modelos de 31B, especialmente en tareas factuales y con contexto muy largo.
- La ficha declara unicamente ingles; el rendimiento en castellano no esta verificado y puede degradarse.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; conviene revisarlos antes de desplegar.
- El ajuste sin censura puede reducir la fiabilidad en tareas que dependen de rechazar peticiones peligrosas (seguridad, moderacion, asistencia medica).
- Solo se publica Q4_K_M; no hay variantes de mayor precision para quienes necesiten maxima calidad.
- El autor advierte de posibles fallos en LM Studio con tensor-split en multi-GPU.
- Los parametros de muestreo recomendados (temperature 0.6, top_k 64, top_p 0.9, min_p 0.05, repeat_penalty 1.1) no son los de Gemma por defecto y afectan al comportamiento esperado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni evidencia independiente de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zanezhang666/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Cabezal MTP de Unsloth (Gemma 4): no disponible (enlace no proporcionado en la informacion)
