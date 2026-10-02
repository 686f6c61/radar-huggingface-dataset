# Vestmanna/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP

## Resumen

Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP es un ajuste comunitario del modelo multimodal Gemma 4 31B de Google DeepMind, publicado por HauhauCS (referenciado como Vestmanna en el repositorio de HuggingFace de esta ficha). El objetivo declarado es eliminar las negativas de seguridad del modelo original manteniendo intactas las capacidades base: no se han modificado datasets ni arquitectura, solo se ha reducido a cero la tasa de rechazos en las tareas evaluadas por el autor. Se distribuye en formato GGUF con cuantizacion Q4_K_M, aprovechando que Gemma 4 esta entrenado con QAT (quantization-aware training) para 4 bits.

Se trata de un transformer denso de aproximadamente 30.700 millones de parametros, con una ventana de contexto de 256.000 tokens (262.144) y soporte de vision mediante un modulo mmproj. La variante Balanced esta optimizada para tareas agenticas de codigo, razonamiento, escritura creativa y fiabilidad, y se entrega con una cabeza MTP (multi-token-prediction) que actua como borrador para decodificacion especulativa, con una ganancia declarada de aproximadamente el 53 % en velocidad de generacion sin alterar la calidad de salida, ya que el modelo verifica cada token propuesto.

El modelo es relevante en el ecosistema open source porque ofrece un Gemma 4 31B multimodal sin restricciones de contenido, ejecutable localmente en hardware de consumo y orientado a casos de uso donde los rechazos del modelo original resultan un obstaculo. La licencia heredada es Gemma, y el unico idioma declarado oficialmente es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (GGUF); mmproj en BF16; cabeza MTP en GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (Q4_K_M), mmproj GGUF (BF16), cabecera MTP GGUF |
| Modelo base | google/gemma-4-31B-it |
| Autor del ajuste | HauhauCS (repo referenciado como Vestmanna) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La base es Gemma 4 31B de Google DeepMind, un transformer denso con soporte multimodal (entrada de texto e imagen) y una ventana de contexto de 262.144 tokens. El modelo original esta sometido a un proceso de quantization-aware training (QAT) orientado a un regimen de aproximadamente 4 bits, motivo por el cual el autor de este ajuste distribuye unicamente Q4_K_M: segun la model card, cuantizaciones de mayor precision anaden tamano sin ganancia real de calidad.

El ajuste consiste en un proceso de "uncensoring" sobre los pesos QAT oficiales. El autor afirma que no se han modificado datasets ni capacidades, y que el modelo conserva el 100 % del comportamiento previsto por los autores originales salvo por la supresion de negativas. La variante Balanced esta afinada especificamente para codigo agentico, razonamiento, escritura creativa y tareas criticas de fiabilidad, con un comportamiento que razona antes de responder. El autor menciona una variante Aggressive, pero indica que tras las pruebas actuales no es necesaria. No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de RLHF o DPO en el proceso de ajuste. El paquete incluye una cabeza MTP (multi-token-prediction) procedente del release de Gemma 4 de Unsloth, utilizada como borrador para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento: modelo orientado a razonar antes de responder, con soporte para tareas de razonamiento multi-paso.
- Generacion de codigo: el ajuste Balanced esta afinado para codigo agentico y uso en flujos de trabajo tecnicos.
- Vision (multimodal): entrada de imagenes mediante el modulo mmproj, con pipeline image-text-to-text.
- Escritura creativa, roleplay y conversacion: capacidades destacadas de forma explicita en las etiquetas y la model card.
- Uso agentico: etiquetado como agentic por el autor, orientado a tareas con multiples pasos.
- Ausencia de negativas: 0/465 rechazos segun la model card, con un pequeno numero de prompts limite que se desvian en el primer intento pero responden al reformular.
- Decodificacion especulativa: soporte de cabeza MTP para acelerar la generacion manteniendo la misma salida.
- Tool calling / function calling: no disponible (no se menciona explicitamente en la informacion proporcionada).
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas declarado.

## Casos de uso

- Escritura creativa sin restricciones: el modelo esta afinado para generacion literaria, guiones y narrativa sin las negativas del modelo base, con 256K tokens de contexto que permiten mantener coherencia en obras extensas.
- Roleplay y personajes conversacionales: la variante Balanced prioriza la fidelidad a las instrucciones y la consistencia del personaje, adecuada para aplicaciones de entretenimiento conversacional.
- Analisis de documentos con imagenes: gracias al modulo mmproj, se pueden procesar capturas, diagramas o documentos escaneados junto con texto largo dentro de la misma ventana de 256K tokens.
- Asistencia de codigo en local: el ajuste orientado a codigo agentico permite integrarlo en editores o pipelines, con la ventaja de ejecutarse en un solo equipo sin dependencia de API externas.
- Generacion acelerada en produccion: el uso de la cabeza MTP para decodificacion especulativa reduce aproximadamente un 53 % el tiempo de generacion, util en servicios con requisitos de latencia ajustados.
- Procesamiento de corpus largos y analisis tecnico: la ventana de 256K tokens permite resumir o interrogar repositorios de documentacion extensos en una unica pasada.
- Investigacion sobre alineacion y rechazos: al documentar 0/465 rechazos, sirve como objeto de estudio para comparar comportamientos de modelos censurados frente a no censurados.
- Aplicaciones en ingles con tolerancia a contenido sensible: para productos donde las negativas del modelo base resultan un bloqueo y el idioma de operacion es el ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta el dato de 0/465 rechazos en pruebas internas de negativas, sin cifras de MMLU, HumanEval, GSM8K ni otros conjuntos estandar.

## Requisitos de hardware

- El repo ocupa 20,2 GB en total: 18,7 GB (Q4_K_M de texto) + 1,2 GB (mmproj de vision en BF16) + 280 MB (cabeza MTP).
- Para inferencia de texto sin vision: aproximadamente 19 GB de VRAM (pesos + overhead de contexto).
- Para inferencia con vision: aproximadamente 20,5-22 GB de VRAM segun tamanio de contexto y KV cache.
- GPU recomendadas: A100 (40 GB o 80 GB), H100, RTX 6000 Ada, o configuraciones multi-GPU. En una RTX 4090 (24 GB) puede encajar en Q4_K_M con contexto reducido, con margen limitado.
- Consumer GPU: viable en RTX 4090 de 24 GB; en GPUs de 16 GB no cabe sin offloading a RAM/CPU.
- Opciones de despliegue: llama.cpp (llama-server / llama-cli), LM Studio, Jan, koboldcpp y otros runtimes compatibles con GGUF.
- Advertencia de despliegue: el autor indica que Gemma 4 puede fallar bajo el modo tensor-split de LM Studio; recomienda una sola GPU con layer-split u orden de prioridad.
- Latencia y throughput: el autor declara aproximadamente un 53 % mas de velocidad de generacion con la cabeza MTP activa, verificado en llama.cpp; no se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP | ~30,7 B denso | 256K | Si (mmproj) | gemma | GGUF Q4_K_M | Sin negativas, MTP para decodificacion especulativa |
| google/gemma-4-31B-it | ~30,7 B denso | 256K | Si | gemma | safetensors / GGUF | Modelo base oficial, con negativas de seguridad |
| Alternativas de ~30B sin censura | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de comparativas de rendimiento (benchmarks) entre este modelo y alternativas de la misma categoria en la informacion proporcionada. La comparacion con el modelo base se limita a parametros, contexto, licencia y formato, ya que no hay cifras de evaluacion publicadas.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo ha sido ajustado para eliminar negativas, por lo que puede generar contenido que el modelo base rechazaria. El despliegue en produccion requiere moderacion externa si se expone a usuarios finales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; como cualquier modelo de 30B, puede inventar datos, especialmente con contextos muy largos.
- Idioma: unico idioma declarado, el ingles. El rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Licencia Gemma: se heredan los terminos de uso de Google para Gemma, que imponen condiciones de uso comercial y obligaciones de atribucion. Es necesario revisar el texto completo antes de un uso comercial.
- Reputacion del repositorio: el repositorio referenciado en esta ficha (Vestmanna) figura con 0 descargas y 0 likes en HuggingFace, mientras que las busquedas web apuntan a HauhauCS como autor original y a una cifra de mas de 100.000 descargas. Conviene verificar el origen exacto de los pesos antes de usarlos.
- Casos limite: segun el autor, algunos prompts se desvian en el primer intento y responden al reformular.
- Compatibilidad multi-GPU: se ha reportado inestabilidad con tensor-split en LM Studio; usar una sola GPU o layer-split.
- Disponibilidad de cuantizaciones: solo se distribuye Q4_K_M; no hay alternativas de mayor o menor precision publicadas por el autor.
- Sin datos de benchmarks: no es posible evaluar el rendimiento relativo frente a otros modelos con cifras objetivas.

## Enlaces

- HuggingFace (repositorio de esta ficha): https://huggingface.co/Vestmanna/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP
- HuggingFace (autor original, HauhauCS): https://huggingface.co/HauhauCS/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP
- Model card original (README): https://huggingface.co/HauhauCS/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP/blame/main/README.md
- Modelo base Gemma 4 31B: https://huggingface.co/google/gemma-4-31B-it
- Ficha en ThinkLLM: https://thinkllm.dev/models/gemma4-31b-qat-uncensored-hauhaucs-balanced-mtp
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gemma4-31b-qat-uncensored-hauhaucs-balanced-mtp-hauhaucs
- Ficha en Local AI Zone (modelo GGUF): https://local-ai-zone.github.io/models/gemma4-31b-qat-uncensored-hauhaucs-balanced-mtp.html
- Discord del autor: https://discord.gg/SZ5vacTXYf
