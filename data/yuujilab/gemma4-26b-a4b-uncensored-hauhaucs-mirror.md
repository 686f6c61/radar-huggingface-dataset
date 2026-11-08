# YuujiLab/Gemma4-26B-A4B-Uncensored-HauhauCS-Mirror

## Resumen

Gemma4-26B-A4B-Uncensored-HauhauCS-Mirror es un espejo de archivo del modelo afinado HauhauCS/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced, una variante "uncensored" (con el comportamiento de rechazo eliminado) del modelo multimodal google/gemma-4-26B-A4B-it. El repositorio lo mantiene YuujiLab y su funcion es preservar a largo plazo las cuantizaciones GGUF seleccionadas y el proyector multimodal (mmproj) del modelo original, no desarrollar un modelo nuevo. El trabajo de cuantizacion, calibracion imatrix y eliminacion del rechazo corresponde a HauhauCS.

Arquitectura y tamano: el modelo base es un transformer de tipo Mixture of Experts (MoE) con 25.233.142.046 parametros totales (dato real de safetensors) y la nomenclatura A4B indica aproximadamente 4.000 millones de parametros activos por token. Es multimodal (acepta imagen y texto) y esta pensado para conversacion e inferencia local mediante llama.cpp.

Su relevancia es practica: ofrece una alternativa sin rechazos sobre una base Gemma 4 de 26B con licencia Apache 2.0, empaquetada en GGUF Q4_K_P con calibracion imatrix y con el proyector de vision incluido, lo que permite desplegarla en hardware de consumo con llama-server. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y no publica benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal (vision + texto) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4.000 millones (denominacion A4B) |
| Longitud de contexto | 32.768 tokens en el ejemplo de uso de la model card (no se confirma el maximo arquitectonico) |
| Tipos de cuantizacion | GGUF Q4_K_P (perfil imatrix); proyector multimodal en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 18,1 GB); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer MoE con unos 25.200 millones de parametros totales y alrededor de 4.000 millones activos por token, con capacidad multimodal de entrada de imagen. Sobre esa base, HauhauCS aplico un afinado de "un-refusal" (eliminacion del comportamiento de rechazo) que da lugar a la variante Balanced, y despues genero cuantizaciones GGUF con calibracion imatrix y perfiles K_P. El repositorio espejo no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

La innovacion tecnica del repositorio es de empaquetado mas que de modelado: incluye el proyector multimodal mmproj en f16 junto al GGUF principal, de modo que la entrada de imagen funciona directamente en llama.cpp con `--mmproj`. La cuantizacion Q4_K_P con imatrix busca minimizar la perdida de calidad respecto al modelo en alta precision, aunque no se publican mediciones de esa perdida.

## Capacidades

- Generacion de texto conversacional multi-turno sobre una base de 26B con 4B activos.
- Entrada de imagen mediante el proyector multimodal mmproj (vision y comprension de imagenes).
- Comportamiento de rechazo reducido o eliminado respecto al modelo instruct original.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Inferencia local mediante llama.cpp / llama-server.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking ni audio.

## Casos de uso

- Inferencia local en estacion de trabajo: cargar el GGUF Q4_K_P con `llama-server -ngl 99` y servir una API compatible con OpenAI para prototipos y pruebas internas, aprovechando el formato GGUF y el bajo numero de parametros activos.
- Analisis de imagenes en local: usar el mmproj f16 para pasar capturas, diagramas o fotografias al modelo en un servidor llama.cpp sin depender de servicios en la nube.
- Generacion creativa sin filtros: redaccion de ficcion, guiones o dialogos donde el modelo instruct original rechazaria contenido por politicas de seguridad, con la advertencia de que el contenido generado no esta moderado.
- Investigacion sobre alineacion y refusal: comparar las respuestas de esta variante con las de google/gemma-4-26B-A4B-it para estudiar como el afinado de un-refusal altera el comportamiento del modelo.
- Archivado y reproducibilidad: usar el espejo para garantizar la disponibilidad a largo plazo de los pesos GGUF y del proyector, ya que el repositorio original puede cambiar o retirarse.
- Despliegue en hardware de consumo: ejecutar el modelo cuantizado en GPUs con memoria limitada gracias a la cuantizacion de 4 bits y a los 4B de parametros activos por token, con contexto configurado a 32.768 tokens.
- Evaluacion de cuantizaciones: comparar la salida del Q4_K_P con imatrix frente al modelo en alta precision para medir la degradacion introducida por la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio original de HauhauCS para benchmarks y discusion de la comunidad, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada: el repo pesa 18,1 GB en total; el GGUF Q4_K_P ocupa la mayor parte y el mmproj f16 anade unos pocos GB. Para cargar el modelo completo con `-ngl 99` hacen falta aproximadamente 16-20 GB de VRAM, mas el margen para el contexto (32.768 tokens en el ejemplo).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. Una GPU de 16 GB puede requerir descargar parte de las capas a CPU.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con la cuantizacion Q4_K_P; en 16 GB o menos sera necesario el offload parcial a RAM.
- Opciones de despliegue: llama.cpp / llama-server (documentado en la model card con `--jinja -c 32768 -ngl 99`). No se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| YuujiLab/Gemma4-26B-A4B-Uncensored-HauhauCS-Mirror | 25,2B totales / ~4B activos | 32.768 (ejemplo) | Texto + vision | Apache 2.0 | GGUF |
| google/gemma-4-26B-A4B-it | 25,2B totales / ~4B activos | no disponible | Texto + vision | Gemma (terminos propios) | Safetensors |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | no disponible | no disponible | Texto + vision | no disponible | no disponible |

El modelo se diferencia de google/gemma-4-26B-A4B-it por el afinado de un-refusal y el empaquetado GGUF listo para llama.cpp; la comparativa de rendimiento frente al original no puede establecerse sin benchmarks publicados. TrevorJS/gemma-4-26B-A4B-it-uncensored es otra variante abliterada del mismo base (biprojection + EGA para MoE, validada contra 686 prompts de 4 datasets), pero no se dispone de sus especificaciones completas.

## Limitaciones y advertencias

- Alucinacion: al ser un modelo de lenguaje de 26B sin benchmarks publicados, el riesgo de generar informacion falsa con seguridad aparente es real; no hay mediciones de factualidad en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad para esta variante; la eliminacion del rechazo puede aumentar la probabilidad de contenido toxico, ilegal o danino si no se aplica moderacion externa.
- Idiomas: no se especifica la lista de idiomas soportados; el rendimiento fuera de los idiomas principales del base Gemma no esta verificado.
- Licencia: el repositorio declara Apache 2.0, pero el modelo base google/gemma-4-26B-A4B-it se distribuye bajo los terminos de Gemma; conviene verificar la compatibilidad antes de un uso comercial, ya que la informacion disponible no aclara como se resuelve esa discrepancia.
- Contexto: el valor de 32.768 tokens aparece solo en el ejemplo de llama-server; no se confirma el maximo soportado por la arquitectura.
- Produccion: el repositorio es un espejo de archivo con 0 descargas y 1 like, sin mantenimiento documentado; para produccion conviene referenciar el repositorio original de HauhauCS.
- Cuantizacion: no se publican metricas de la perdida de calidad del Q4_K_P con imatrix frente al modelo en alta precision.

## Enlaces

- Repositorio espejo: https://huggingface.co/YuujiLab/Gemma4-26B-A4B-Uncensored-HauhauCS-Mirror
- Repositorio original: https://huggingface.co/HauhauCS/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante alternativa abliterada: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Coleccion Gemma 4 Uncensored de TrevorJS: https://huggingface.co/collections/TrevorJS/gemma-4-uncensored
