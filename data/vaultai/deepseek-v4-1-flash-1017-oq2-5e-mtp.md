# vaultai/DeepSeek-V4.1-Flash-1017-oQ2.5e-mtp

## Resumen

DeepSeek-V4.1-Flash-1017-oQ2.5e-mtp es un checkpoint cuantizado en formato MLX del modelo multimodal DeepSeek-V4.1-Flash-1017, publicado por el usuario vaultai con la herramienta oQ (oMLX v0.7.1) mediante cuantizacion mixta de precision guiada por sensibilidad por capa. El modelo base es un Mixture-of-Experts (MoE) disperso de DeepSeek construido sobre una arquitectura Causal Encoder-Decoder (CED), con atencion dispersa comprimida CSA2, memoria condicional Engram y decodificacion especulativa DSpark; el backbone declara 552B parametros con 8B activos en entrada y 16B en salida, y una ventana de contexto de hasta 1M tokens segun fuentes de terceros.

El interes de esta publicacion es practico: comprime un checkpoint de 763,2B pesos logicos (backbone + tablas Engram + encoder visual + cabeza MTP) hasta 3,592 bits por peso efectivos, lo que deja el repositorio en 342,7 GB, un tamano que por primera vez entra en un unico equipo Apple Silicon de memoria unificada alta. Las tablas Engram, que suponen el 25,8% de los pesos logicos, se mantienen a 4 bits y pueden servirse desde SSD en lugar de memoria, lo que reduce aun mas la presion de RAM en inferencia.

La relevancia es doble: por un lado demuestra que la cuantizacion mixta de un MoE multimodal de esta escala es viable sin colapsar el modelo; por otro, abre la ejecucion local de un modelo de categoria frontier en hardware de escritorio, algo que hasta ahora requeria clústeres multi-GPU. La licencia MIT heredada del modelo fuente facilita su uso comercial, aunque no se han publicado evaluaciones de degradacion respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con Causal Encoder-Decoder (CED), Compressed Sparse Attention 2 (CSA2), memoria condicional Engram y decodificacion especulativa DSpark |
| Parametros totales | 552B en el backbone; 763,205B pesos logicos en el checkpoint completo (backbone 551,881B + Engram 196,614B + vision encoder 0,485B + cabeza MTP 14,225B) |
| Parametros activos | 8B en entrada y 16B en salida (MoE disperso, segun fuentes de terceros) |
| Longitud de contexto | 1.000.000 tokens (segun fuentes de terceros; no confirmado en la model card) |
| Tipos de cuantizacion | oQ2.5e mixta: affine 2-bit grupo 64, affine 3-bit grupo 64, MXFP4 grupo 32, affine 4-bit grupo 32 (Engram), affine 8-bit grupo 64, MXFP8 grupo 32, BF16 y FP32 |
| Bits por peso efectivos | 3,104 excluyendo tablas Engram; 3,592 en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo fuente) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Tamano del repositorio | 342,7 GB (319,176 GiB) |
| Elementos reportados en safetensors | 102.433.367.858 (tensores empaquetados de la cuantizacion; no equivale al numero de pesos logicos) |
| Modalidades | texto e imagen (pipeline `image-text-to-text`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Causal Encoder-Decoder, una variante que separa el procesamiento de entrada (encoder causal) del de salida (decoder), con atencion dispersa comprimida CSA2 para reducir el coste computacional de ventanas de contexto muy largas. Sobre esa base se anaden dos mecanismos diferenciales: las tablas Engram, una memoria condicional de 196,6B pesos logicos que se consulta de forma selectiva y que en esta cuantizacion se mantiene a 4 bits (grupo 32) para poder servirse desde SSD; y DSpark, un esquema de decodificacion especulativa con cabeza MTP (Multi-Token Prediction) de 14,2B pesos que acelera la generacion aceptando varios tokens por paso.

La cuantizacion oQ2.5e asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) seguida de un reajuste por minimos cuadrados ponderados de escala y sesgo (PR jundot/omlx#4385). El reparto resultante concentra el 40,36% de los pesos logicos en affine 2-bit y el 30,86% en affine 3-bit, mientras que solo un 0,55% del total permanece en BF16/FP32; el encoder visual (0,485B) y la cabeza MTP conservan precisiones superiores por su impacto en calidad. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con mejoras declaradas por el autor del modelo base en razonamiento respecto a DeepSeek-V4.1-Flash.
- Generacion y comprension de codigo, con mejora explicita en rendimiento de programacion segun la model card del checkpoint.
- Comprension de imagenes: pipeline `image-text-to-text` con un encoder visual de 0,485B parametros y un aligner multimodal incluido en el checkpoint.
- Capacidades agenticas mejoradas declaradas por el autor del modelo base (sin detalle de benchmarks en la informacion disponible).
- Contexto largo de hasta 1M tokens segun fuentes de terceros, adecuado para corpus extensos y conversaciones de muchos turnos.
- Decodificacion especulativa DSpark integrada mediante cabeza MTP, orientada a reducir latencia por token.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se ha publicado la lista de lenguas del modelo base ni de esta cuantizacion.

## Casos de uso

- Inferencia local de categoria frontier en un unico equipo: con 319,2 GiB de pesos, el checkpoint cabe en un Mac Studio con 512 GB de memoria unificada, lo que permite ejecutar un MoE de 552B sin GPU de datacenter y sin depender de APIs externas.
- Analisis de documentacion tecnica extensa: la ventana de 1M tokens (segun fuentes de terceros) permite cargar manuales, expedientes o bases de codigo completas en una sola pasada sin troceado ni recuperacion intermedia.
- Procesamiento de documentos escaneados y capturas: el pipeline `image-text-to-text` habilita extraccion de datos estructurados desde facturas, planos o formularios combinando vision y texto en la misma llamada.
- Asistente de programacion en local: la mejora declarada en codigo y la decodificacion especulativa DSpark lo hacen adecuado para autocompletado y refactorizacion en entornos con requisitos de confidencialidad, donde enviar codigo a una API no es aceptable.
- Investigacion sobre cuantizacion: el reparto de bits por capa documentado (tablas de bit distribution y storage breakdown) sirve como caso de estudio reproducible para medir el impacto de la cuantizacion mixta en MoE multimodales.
- Despliegue con offload a SSD: oMLX puede servir las tablas Engram desde disco en lugar de memoria, lo que permite reservar RAM para la cache KV en sesiones de contexto muy largo sobre hardware de 256-512 GB.
- Procesamiento por lotes de corpus mixtos (texto + imagen) en un flujo offline, sin coste por token y con la licencia MIT permitiendo uso comercial interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint unicamente documenta la distribucion de bits y el desglose de almacenamiento; no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones de degradacion frente al modelo base en BF16.

## Requisitos de hardware

- Memoria para pesos: 319,176 GiB en el formato oQ2.5e (342,7 GB en disco). Con cache KV y overhead del runtime, se debe planificar en torno a 340-380 GB de memoria unificada para contextos moderados.
- Apple Silicon: el formato MLX solo se ejecuta en chips Apple. Un Mac Studio M3 Ultra con 512 GB de memoria unificada es el unico equipamiento de consumo capaz de alojar el checkpoint completo en RAM.
- Con offload de Engram a SSD: al excluir los 114,444 GiB de tablas Engram de la memoria, el requisito baja a unos 205 GiB, lo que abre la puerta a equipos de 256 GB, a costa de latencia adicional en las consultas a disco.
- GPU NVIDIA: no es una via de despliegue para este repositorio, ya que MLX no soporta CUDA; para A100/H100 habria que recurrir al modelo base en otro formato.
- Opciones de despliegue: MLX y oMLX (v0.7.1 o superior, con soporte de Improved oQe y offload de Engram). No hay versiones GGUF, por lo que llama.cpp y Ollama no son aplicables; vLLM y TGI tampoco soportan este formato.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vaultai/DeepSeek-V4.1-Flash-1017-oQ2.5e-mtp (este) | 552B backbone / 763,2B logicos | 1M (segun terceros) | safetensors MLX, 3,592 bits/peso | MIT | Engram a 4 bits, 319,176 GiB |
| mlx-community/DeepSeek-V4.1-Flash-1017-oQ2.5e-ngram-mtp | 552B backbone | 1M (segun terceros) | safetensors MLX, 53 shards | no disponible | Tablas Engram mantenidas en FP8 original; mayor huella que este checkpoint |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 552B backbone | 1M (segun terceros) | safetensors (formato original) | MIT | Referencia de calidad; tamano en disco no disponible |
| deepseek-ai/DeepSeek-V4.1-Flash (version anterior) | 552B backbone | no disponible | safetensors | MIT | Sin mejoras en razonamiento, codigo, capacidades agenticas ni vision |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Cuantizacion agresiva: 3,104 bits/peso efectivos en el backbone implican una degradacion de calidad no cuantificada; no hay evaluaciones publicadas que midan la perdida frente al modelo en BF16.
- El 40,36% de los pesos logicos esta en affine 2-bit, la precision mas baja del reparto, lo que puede afectar de forma desigual a tareas de razonamiento y matematicas.
- Latencia de Engram desde SSD: cuando las tablas se sirven desde disco, el primer token y las consultas de memoria condicional pueden penalizar la latencia de forma significativa; no se han publicado mediciones.
- Dependencia de plataforma: el formato MLX limita la ejecucion a Apple Silicon, lo que excluye CUDA, ROCm y practicamente todo el ecosistema de servidores de inferencia.
- Requisito de memoria extremo: 319 GiB de pesos dejan fuera a cualquier GPU de consumo y a la mayoria de configuraciones de servidor; el mercado de hardware compatible es muy reducido.
- Idiomas no documentados: se desconoce la cobertura linguistica real y el comportamiento en castellano, lo que exige evaluacion propia antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de benchmarks publicados que permitan acotar su fiabilidad.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con tres minutos de diferencia, sin validacion independiente de la comunidad.
- Soporte de tool calling no confirmado en la informacion disponible; no se debe asumir su disponibilidad para pipelines de agentes.
- Licencia MIT que permite uso comercial, pero conviene verificar el fichero LICENSE y las condiciones del modelo base antes de redistribuir pesos derivados.

## Enlaces

- Modelo cuantizado: https://huggingface.co/vaultai/DeepSeek-V4.1-Flash-1017-oQ2.5e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version anterior del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Variante de la comunidad con Engram en FP8: https://huggingface.co/mlx-community/DeepSeek-V4.1-Flash-1017-oQ2.5e-ngram-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Ficha del modelo base en Apertis AI: https://apertis.ai/models/deepseek-v4.1-flash-1017
- Ficha del modelo base en AI Model Radar: https://aimodelradar.app/models/deepseek-v4-1-flash-1017
- Ficha del modelo base en Blackbox: https://www.blackbox.ai/models/blackboxai/deepseek/deepseek-v4.1-flash-1017
