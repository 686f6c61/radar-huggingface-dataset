# SpaceTimee/Suri-Qwen-3.8-27B-Companion-GGUF

## Resumen

Suri Qwen 3.8 27B Companion es un modelo de lenguaje de 27.320.697.856 parametros (27,32 mil millones) publicado por el desarrollador SpaceTimee, distribuido exclusivamente en formato GGUF cuantizado. Se presenta como un modelo de tipo "companion" orientado a conversacion, construido sobre el modelo base SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, que a su vez se designa como derivado de la familia Qwen3.8. La model card esta redactada en chino e ingles y el repositorio no incluye documentacion tecnica detallada sobre arquitectura, datos de entrenamiento o proceso de alineacion.

El repositorio ocupa 377,6 GB, un tamano que solo se explica por la presencia de multiples niveles de cuantizacion GGUF del mismo modelo, generados con tecnicas de imatrix (matriz de importancia) para preservar calidad en compresiones agresivas. La libreria declarada es transformers y el pipeline tag es image-text-to-text, lo que sugiere capacidades multimodales entrada imagen/texto, aunque la model card no describe ninguna capacidad de vision de forma explicita.

Su relevancia practica es limitada a fecha de esta ficha: cero descargas y cero "likes" en HuggingFace, licencia no especificada y ausencia total de benchmarks publicados. Es un modelo experimental de nicho, pensado para despliegue local en escenarios conversacionales o de rol, no para entornos de produccion regulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base designado como Qwen3.8 27B; la model card no detalla la arquitectura) |
| Parametros totales | 27.320.697.856 (27,32 mil millones, dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en multiples niveles; repositorio de 377,6 GB; se menciona el uso de imatrix. Los niveles concretos no se detallan |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (libreria declarada: transformers) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. La model card se limita a identificarlo como un modelo de 27B basado en "Qwen3.8 27B", sin especificar si se trata de un transformer denso, una mezcla de expertos (MoE) o una arquitectura hibrida, ni el numero de capas, dimensiones de atencion o mecanismos concretos. El recuento de parametros de safetensors (27,32 mil millones) es coherente con un modelo denso de esa escala.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como SFT, RLHF o DPO. El unico indicio relevante es la denominacion "Uncensored" del modelo base, que sugiere un ajuste orientado a reducir los filtros de rechazo de contenido respecto al modelo original. El repositorio actual es una reempaquetado en GGUF, con cuantizacion asistida por imatrix, del modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo esta disenado explicitamente como "companion" para mantener dialogos multi-turno de caracter cercano.
- Multimodalidad declarada: el pipeline tag image-text-to-text indica entrada de imagen y texto, aunque la model card no describe ni documenta esta capacidad.
- Bilinguismo zh/en: los metadatos declaran soporte para chino e ingles.
- Conversacion sin filtros estrictos: al derivar de un modelo base marcado como "Uncensored", cabe esperar una tasa de rechazo de peticiones inferior a la de modelos alineados de forma convencional.
- Parametros de muestreo recomendados por el autor: temperatura 0,8-1,0; top_p 0,8-0,95; penalizacion de repeticion 1-1,1.
- Tool calling / function calling: no disponible en la documentacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentacion.
- Modo "thinking" o razonamiento explicito: no disponible en la documentacion.
- Vision, audio u otras capacidades especiales: no confirmadas mas alla del pipeline tag.

## Casos de uso

- Personajes conversacionales y compania digital: el modelo esta afinado y nombrado para sostener conversaciones de rol de largo recorrido. Los parametros de muestreo recomendados (temperatura alta, penalizacion de repeticion moderada) estan pensados para evitar respuestas repetitivas en dialogos extensos.
- Despliegue local en estaciones de trabajo con GPU de gama alta: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama sobre una unica GPU de 24 GB usando cuantizaciones de 4 a 6 bits, sin necesidad de infraestructura en la nube.
- Aplicaciones de chat bilingues chino-ingles: el soporte declarado de ambos idiomas lo hace util para productos de mensajeria o asistencia que atiendan a usuarios de esas dos comunidades linguisticas.
- Prototipado de asistentes con contenido no filtrado: los equipos que necesiten evaluar respuestas sobre temas que los modelos alineados rechazan pueden usarlo como banco de pruebas, asumiendo los riesgos legales y eticos.
- Base para ajuste fino adicional (LoRA/QLoRA): su escala de 27B en cuantizacion de 4 bits es abordable en una GPU de 24-48 GB para entrenamiento ligero de adaptadores sobre dominios concretos.
- Generacion creativa de ficcion y narrativa: la temperatura recomendada alta y la orientacion conversacional favorecen la escritura de dialogo y roleplay.
- Nodo de inferencia en un pipeline TGI: el repositorio esta etiquetado como compatible con endpoints y con text-generation-inference, lo que permite levantarlo como servicio HTTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el repositorio registra cero descargas, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (27,32 mil millones) y del formato GGUF; el autor no las publica.

- VRAM estimada para inferencia: aproximadamente 10-12 GB en Q2_K, 16-17 GB en Q4_K_M, 19-20 GB en Q5_K_M, 22-23 GB en Q6_K, 29 GB en Q8_0 y unos 55 GB en F16.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones Q4 y Q5 con offload parcial; A6000, L40S o RTX 5090 (32-48 GB) para Q6 y Q8; A100 80 GB o H100 para precision completa y contextos largos.
- Viabilidad en GPU de consumo: si, en tarjetas de 24 GB con cuantizaciones de 4 a 5 bits. En GPUs de 12-16 GB solo son realistas las cuantizaciones de 2 a 3 bits, con perdida notable de calidad.
- Memoria unificada: equipos Apple con 32-64 GB permiten ejecutar cuantizaciones Q4 a Q6 mediante llama.cpp con Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (etiquetado) y servidores compatibles con endpoints. vLLM requiere soporte de GGUF, con rendimiento inferior al de pesos safetensors nativos.
- Latencia y throughput estimados: no disponibles. Dependeran del nivel de cuantizacion, del grado de offload a CPU y del hardware. Como referencia general, un modelo denso de 27B en Q4 sobre una RTX 4090 suele generar del orden de 20-40 tokens por segundo, pero no hay medicion publicada para este modelo concreto.
- Almacenamiento: el repositorio completo ocupa 377,6 GB, por lo que conviene descargar unicamente el archivo GGUF del nivel de cuantizacion elegido.

## Comparativa con modelos similares

Los datos de la columna "Suri Qwen 3.8 27B" proceden de los metadatos de HuggingFace; el resto son caracteristicas publicas de cada modelo. No hay datos de rendimiento comparables, ya que el modelo de SpaceTimee no publica benchmarks.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Companion-GGUF | 27,32 B | no disponible | no disponible | GGUF | no disponible |
| Qwen2.5-32B-Instruct | 32,5 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | si (MMLU, HumanEval, GSM8K) |
| Gemma 2 27B | 27 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | si |
| Mistral Small 3 (24B) | 24 B | 32.000 tokens | Apache 2.0 | safetensors, GGUF | si |

La diferencia principal no esta en el tamano, sino en el soporte: los tres modelos de referencia cuentan con licencia explicita, contexto documentado y evaluaciones publicas, mientras que Suri Qwen 3.8 27B carece de los tres elementos. Para uso comercial en produccion, cualquiera de las alternativas ofrece garantias legales y tecnicas que este modelo no proporciona.

## Limitaciones y advertencias

- Licencia no especificada: sin una licencia explicita, no hay autorizacion clara para uso comercial, redistribucion ni modificacion. Tratar como no apto para produccion hasta que el autor la defina.
- Trazabilidad limitada del modelo base: "Qwen3.8" no se corresponde con ninguna version documentada publicamente de la familia Qwen en la informacion disponible, y no se aporta ninguna ficha tecnica del modelo base Uncensored.
- Riesgo elevado de alucinacion: sin datos de entrenamiento ni evaluaciones, no puede estimarse la fiabilidad factual. El sesgo hacia contenido sin filtros agrava el riesgo de generar afirmaciones falsas con aparente seguridad.
- Contenido sin filtrar: la denominacion "Uncensored" implica una probabilidad alta de generar material ofensivo, violento, sexual o legalmente problematico. Requiere moderacion externa obligatoria en cualquier despliegue con usuarios finales.
- Cobertura idiomatica reducida: solo se declaran chino e ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Longitud de contexto desconocida: no puede planificarse memoria ni estrategias de truncado sin ese dato.
- Ausencia de adoption: cero descargas y cero "likes" en el momento de redactar esta ficha implica que no existe validacion por parte de la comunidad ni informes de fallos.
- Parametros de muestreo prescritos por el autor: usar valores fuera del rango recomendado (temperatura 0,8-1,0; top_p 0,8-0,95; penalizacion de repeticion 1-1,1) puede degradar notablemente la coherencia del dialogo.
- Fechas de publicacion atipicas: el repositorio figura creado el 2026-10-05, posterior a la fecha de consulta habitual, lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Companion-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Contacto indicado por el autor: Zeus6_6@163.com
- Grupo QQ indicado por el autor: 902575634

No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo en la informacion disponible.
