# xw17/Qwen2.5-3B-Instruct_SFT_lora_glycemic

## Resumen

`xw17/Qwen2.5-3B-Instruct_SFT_lora_glycemic` es un adaptador de ajuste supervisado (SFT) con LoRA publicado por el usuario xw17 en Hugging Face sobre el modelo base Qwen2.5-3B-Instruct. El repositorio ocupa 0,1 GB, un tamano compatible con un adaptador PEFT y no con los pesos completos de un modelo de 3.000 millones de parametros, que en bfloat16 rondarian los 6 GB. El identificador incluye el termino "glycemic", lo que sugiere una especializacion en contenido relacionado con glucemia o control glucémico, pero la model card no documenta el dataset ni el procedimiento.

El modelo base pertenece a la familia Qwen2.5 del equipo Qwen (Alibaba), formada por modelos densos decoder-only de 0,5B, 1,5B, 3B, 7B, 14B, 32B y 72B parametros, en variantes base e instruct, preentrenados con hasta 18 billones de tokens según la documentacion oficial. Qwen2.5-3B-Instruct es la variante de 3B ya alineada para seguir instrucciones, con soporte declarado de tool calling, generacion estructurada y capacidades multilingues.

La relevancia de esta publicacion es limitada y hay que enmarcarla con cautela: se trata de un ejemplo tipico de adaptacion de dominio de bajo coste mediante LoRA, pero la model card es la plantilla autogenerada de Hugging Face con todos los campos en "More Information Needed", no declara licencia, no aporta evaluacion alguna y acumula cero descargas y cero likes. No es un artefacto validado para produccion sin una verificacion previa del adaptador, del dataset de entrenamiento y de las condiciones de uso del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5: RoPE, SwiGLU, RMSNorm, GQA y sesgo en QKV); sobre el modelo base se aplica un adaptador LoRA cuyo rango, alpha y modulos objetivo no estan documentados |
| Parametros totales | ≈3.090 millones en el modelo base Qwen2.5-3B-Instruct; el repositorio solo contiene el adaptador (0,1 GB) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base, ampliable con YaRN segun la documentacion de la familia Qwen2.5; no se especifica en este repositorio |
| Tipos de cuantizacion | no disponibles en el repositorio; al ser un adaptador LoRA, puede fusionarse con el modelo base y cuantizarse a GGUF, AWQ, GPTQ o INT8 con herramientas externas |
| Idiomas soportados | no disponible en el repositorio; el modelo base Qwen2.5-3B-Instruct declara soporte de decenas de idiomas segun la documentacion de Qwen2.5 |
| Licencia | no disponible en el repositorio; la ficha del modelo base Qwen2.5-3B-Instruct indica Qwen Research License, con restricciones para uso comercial |
| Formato de pesos | safetensors (declarado en las etiquetas del repositorio); por el tamano, previsiblemente adaptador PEFT/LoRA |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 30 de septiembre de 2026 (creacion), misma fecha de ultima actualizacion |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings posicionales rotatorios (RoPE), atencion con consultas agrupadas (GQA) y sesgos en las proyecciones QKV. La familia Qwen2.5 se preentreno con hasta 18 billones de tokens y su informe tecnico describe un post-entrenamiento en dos fases que combina ajuste supervisado con tecnicas de alineacion por preferencias; para el detalle exacto de hiperparametros y datos conviene consultar el informe tecnico de Qwen2.5 (arXiv:2412.15115), no esta ficha.

Sobre ese modelo base, este repositorio aplica un ajuste supervisado con LoRA, presumiblemente orientado a un dominio glucemico. No hay informacion publicada sobre el dataset utilizado, su procedencia, el numero de ejemplos, el rango y alpha del adaptador, los modulos LoRA objetivo, la precision de entrenamiento, el numero de epocas ni la tasa de aprendizaje. Tampoco se indica si el adaptador se entreno sobre la version instruct del modelo base o sobre un checkpoint intermedio, ni si se fusiono con los pesos. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo indicado seria especulacion.

## Capacidades

Las capacidades heredadas del modelo base Qwen2.5-3B-Instruct, segun la documentacion oficial de la familia, incluyen:

- Generacion de texto y seguimiento de instrucciones multi-turno.
- Razonamiento basico, matematicas elementales y resolucion de problemas de varios pasos.
- Generacion y explicacion de codigo en lenguajes habituales.
- Soporte de tool calling y function calling en la variante instruct de Qwen2.5.
- Salidas estructuradas, incluido JSON, para integracion en pipelines.
- Capacidades multilingues heredadas del preentrenamiento multilingue de Qwen2.5.
- Ventana de contexto de 32.768 tokens en el modelo base, ampliable con YaRN.
- No dispone de vision ni de audio: Qwen2.5-3B es un modelo exclusivamente de texto.

Capacidades especificas de este adaptador:

- No hay ninguna capacidad adicional documentada por el autor.
- El nombre del modelo sugiere un ajuste hacia terminologia y tareas relacionadas con glucemia, pero no existe evidencia publicada que lo confirme ni que cuantifique la mejora.
- Es plausible una perdida de capacidades generales (olvido catastrofico) tras el SFT, sin que exista evaluacion que lo mida.

## Casos de uso

- Prototipado de investigación en salud digital: el adaptador permite experimentar con un asistente conversacional especializado en terminologia glucemica sobre una GPU de consumo, con un coste de almacenamiento de 0,1 GB adicionales al modelo base. Adecuado para exploracion en laboratorio, no para uso clinico.
- Extraccion estructurada de registros de glucemia: dado un texto libre con lecturas de glucosa, comidas e insulina, el modelo puede devolver JSON con campos normalizados, apoyandose en la capacidad del modelo base para salidas estructuradas.
- Resumen de historiales de monitorizacion continua de glucosa (CGM): con 32.768 tokens de contexto en el modelo base, es viable condensar series temporales textualizadas y notas del paciente en un informe breve para revision humana.
- Generacion de material educativo sobre diabetes: redaccion de explicaciones divulgativas sobre hiperglucemia, hipoglucemia o adherencia al tratamiento, siempre con supervision de un profesional sanitario y revision obligatoria.
- Clasificacion y etiquetado de corpus clinicos: uso del modelo para anotar notas o preguntas frecuentes por tematica glucemica dentro de un pipeline de curacion de datos, con verificacion posterior.
- Asistente conversacional de seguimiento no clinico: recordatorios de medicion, resumen de sintomas autoreportados y derivacion a profesional, evitando cualquier recomendacion terapeutica directa.
- Base para comparativas de tecnicas de ajuste: sirve como ejemplo reproducible de SFT con LoRA sobre Qwen2.5-3B y como punto de partida para comparar con otros adaptadores del mismo autor, como `xw17/Qwen2.5-3B-Instruct_SFT_lora_aw_fb`.
- Generacion de codigo auxiliar en proyectos de analitica de datos de salud: el modelo base mantiene capacidades de programacion que pueden reutilizarse para scripts de limpieza de datasets glucemicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla autogenerada de Hugging Face y no incluye ninguna seccion de evaluacion completada, ni metricas propias ni comparaciones con el modelo base. Tampoco hay resultados de evaluacion en los resultados de busqueda consultados. Para conocer el rendimiento del modelo base pueden consultarse las tablas del informe tecnico de Qwen2.5 (arXiv:2412.15115), que no son atribuibles a este adaptador.

## Requisitos de hardware

- Adaptador: 0,1 GB en disco. Es necesario cargar adicionalmente el modelo base Qwen2.5-3B-Instruct, de aproximadamente 6 GB en bfloat16 o float16.
- VRAM estimada para inferencia, contando pesos y cache KV: en torno a 7-8 GB en bfloat16 para ventanas de contexto moderadas; unos 4 GB en cuantizacion INT8; alrededor de 2,5-3 GB en cuantizacion de 4 bits tipo GGUF Q4_K_M. Son estimaciones de ingenieria, no cifras publicadas por el autor.
- GPU recomendadas: NVIDIA RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4090 (24 GB) y L4 o A10G para servicio. Para lotes grandes o contextos largos, A100 o H100 de 40-80 GB.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas de VRAM en cuantizacion de 4 u 8 bits, y en tarjetas de 12 GB o mas en bfloat16.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM, que admite adaptadores LoRA en servicio; SGLang y TGI con soporte de LoRA segun version; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos comparados proceden de su documentacion publica y no de mediciones propias.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xw17/Qwen2.5-3B-Instruct_SFT_lora_glycemic | Adaptador LoRA sobre base de ≈3.090 M | Heredado del base: 32.768 tokens | No declarada en el repositorio; el base indica Qwen Research License | Repositorio publico, 0 descargas, sin evaluacion |
| Qwen/Qwen2.5-3B-Instruct | ≈3.090 M | 32.768 tokens, ampliable con YaRN | Qwen Research License | Modelo oficial, ampliamente documentado |
| meta-llama/Llama-3.2-3B-Instruct | ≈3.210 M | Hasta 128.000 tokens | Llama 3.2 Community License | Modelo oficial con pesos completos |
| microsoft/Phi-3.5-mini-instruct | ≈3.800 M | Hasta 128.000 tokens | MIT | Modelo oficial con pesos completos |
| google/gemma-2-2b-it | ≈2.600 M | 8.192 tokens | Gemma Terms of Use | Modelo oficial con pesos completos |

La diferencia fundamental no esta en el rendimiento, que no se ha medido, sino en la naturaleza del artefacto: los tres modelos comparados son checkpoints completos con ficha tecnica, evaluacion y licencia explicita, mientras que este repositorio es un adaptador sin documentar y con requisitos legales que dependen del modelo base.

## Limitaciones y advertencias

- Model card vacia: todos los campos relevantes estan en "More Information Needed", incluidos desarrollador, datos, licencia y evaluacion. No hay informacion verificable sobre el entrenamiento.
- Licencia no declarada en el repositorio. El modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, lo que limita el uso comercial. Cualquier despliegue en produccion requiere revisar esa licencia y la cadena de dependencias.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni evidencia de que el adaptador funcione como sugiere su nombre.
- Ambito sanitario: un modelo orientado a contenido glucemico puede generar informacion incorrecta con apariencia de rigor. No debe utilizarse para diagnostico, ajuste de dosis de insulina, recomendaciones dieteticas ni ninguna decision clinica sin supervision profesional.
- Riesgo de alucinacion: con solo 3.000 millones de parametros, el modelo base tiene una tasa de error apreciable en razonamiento complejo y en la recuperacion de hechos; el ajuste de dominio no reduce ese riesgo y puede aumentarlo en areas fuera del dominio entrenado.
- Olvido catastrofico: el SFT sobre un dominio concreto puede degradar capacidades generales de codigo, matematicas o multilingue, sin que exista evaluacion que lo cuantifique.
- Sesgos potenciales: si el dataset glucemico empleado procede de una poblacion concreta, el adaptador puede heredar sesgos demograficos, clinicos o culturales no documentados.
- Privacidad: no se especifica la procedencia de los datos de ajuste. Si provienen de registros de pacientes, podrian existir problemas de consentimiento, anonimizacion y cumplimiento del RGPD que el autor no aborda.
- Idioma: no se declara que idiomas conserva el adaptador tras el ajuste; es posible que el entrenamiento se realizara solo en un idioma y que el resto se degrade.
- Contexto: la ventana de 32.768 tokens corresponde al modelo base y no se ha verificado que el adaptador la preserve. Las extensiones mediante YaRN requieren configuracion explicita.
- Reproducibilidad: no se documentan versiones de librerias, semillas ni hiperparametros, por lo que el adaptador no es reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xw17/Qwen2.5-3B-Instruct_SFT_lora_glycemic
- Repositorio relacionado del mismo autor: https://huggingface.co/xw17/Qwen2.5-3B-Instruct_SFT_lora_aw_fb
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Informe tecnico de Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Repositorio GitHub de la familia Qwen2.5: https://github.com/mx4ai/qwen2.5
- Repositorio GitHub con ejemplos de SFT sobre Qwen2.5: https://github.com/ShawVentus/Qwen2.5_sft
- Lacoste et al. (2019), calculo de impacto ambiental (referenciado en la plantilla de la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
