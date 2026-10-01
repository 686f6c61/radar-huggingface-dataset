# xw17/Qwen2.5-3B-Instruct_SFT_lora_wesad

## Resumen

xw17/Qwen2.5-3B-Instruct_SFT_lora_wesad es un ajuste fino mediante LoRA sobre el modelo base Qwen2.5-3B-Instruct, publicado en HuggingFace por el usuario xw17. El nombre del repositorio indica que se trata de un entrenamiento supervisado (SFT) con adaptadores de bajo rango, y el sufijo "wesad" apunta a una posible vinculacion con el dataset WESAD (Wearable Stress and Affect Detection), un corpus publico de senales fisiologicas para deteccion de estres y afecto. El repositorio ocupa aproximadamente 0,1 GB, un tamano coherente con un adaptador LoRA y no con un conjunto completo de pesos de 3.000 millones de parametros.

La relevancia de la ficha es limitada pero ilustrativa: se trata de un ejemplo tipico de adaptacion ligera de un modelo instruct de proposito general a un dominio concreto, con coste de entrenamiento bajo y despliegue sencillo. No obstante, la model card publicada es la plantilla automatica de HuggingFace y no contiene informacion sustantiva: todos los campos aparecen como "[More Information Needed]". Esto significa que no hay datos confirmados sobre dataset de entrenamiento, hiperparametros, licencia especifica del ajuste, idiomas soportados ni evaluacion.

Por tanto, esta ficha distingue explicitamente entre los datos verificables del repositorio y las caracteristicas heredadas del modelo base Qwen2.5-3B-Instruct, que se indican como tales. Cualquier uso en produccion deberia ir precedido de una validacion directa del adaptador, dado el escaso nivel de documentacion aportado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-3B-Instruct); el adaptador es de tipo LoRA |
| Parametros totales | No disponible para el adaptador (el modelo base declara ~3,09 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el ajuste (el modelo base soporta hasta 32.768 tokens, ampliable con RoPE scaling) |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base dispone de versiones GPTQ, AWQ y GGUF de terceros |
| Idiomas soportados | No disponible (el modelo base declara soporte para 29 idiomas, entre ellos espanol, ingles, chino, frances, aleman y portugues) |
| Licencia | No disponible en la model card; el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, no Apache 2.0 |
| Formato de pesos | safetensors (segun las etiquetas del repositorio); tamano del repo ~0,1 GB, compatible con adaptador LoRA |

## Arquitectura y entrenamiento

El repositorio no documenta ninguna innovacion arquitectonica propia. Se trata de un adaptador LoRA aplicado sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion con consultas y claves agrupadas (GQA) para reducir el coste de memoria en inferencia. El modelo base no emplea mezcla de expertos ni arquitecturas de espacio de estados.

Respecto al entrenamiento del ajuste, la informacion disponible es minima. El nombre indica un proceso de SFT sobre un corpus etiquetado como "wesad", y el tamano del repositorio sugiere que solo se publicaron los pesos del adaptador, no una fusion con el modelo base. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, hiperparametros (rango del LoRA, alpha, tasa de aprendizaje, epocas) ni regimen de precision. La unica referencia a un paper en las etiquetas del repositorio es el identificador arxiv:1910.09700, que corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono y que aparece de forma automatica en la plantilla de model card, por lo que no debe interpretarse como una publicacion asociada a este modelo.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico, matematicas de nivel escolar y generacion de codigo, en el rango esperable para un modelo de 3.000 millones de parametros.
- Soporte de plantillas de chat con roles system, user y assistant, ya que el modelo base es una variante instruct.
- Soporte de tool calling y function calling segun el formato del modelo base, aunque no hay confirmacion de que el ajuste lo preserve.
- Capacidad multilingue potencial (el base declara 29 idiomas), sin verificacion en el adaptador.
- Capacidad especial inferida del nombre: posible tratamiento de datos de sensores ponibles o clasificacion/descripcion de estados de estres y afecto, sin documentacion que lo confirme.
- No se ha confirmado soporte de modo de razonamiento explicito, vision, audio ni generacion estructurada tipo JSON Schema.

## Casos de uso

- Clasificacion o etiquetado de senales fisiologicas: si el ajuste se ha realizado sobre WESAD, el modelo podria emplearse para generar descripciones textuales o etiquetas de estado afectivo a partir de resumenes de senales de sensores ponibles, integrándose en un pipeline que convierta las series temporales en texto antes de la inferencia.
- Prototipado rapido de asistentes conversacionales en espanol: al tratarse de un adaptador sobre un modelo instruct de 3B, puede desplegarse en una GPU de gama media para probar flujos de dialogo multi-turno sin coste elevado.
- Investigacion academica sobre ajuste eficiente: el repositorio sirve como ejemplo reproducible de SFT con LoRA sobre un modelo Qwen2.5-3B, util para estudiar el impacto de datasets pequenos en dominios especializados.
- Experimentos de domotica y bienestar digital: un modelo ligero que genere recomendaciones de texto a partir de estado fisiologico puede ejecutarse en local, evitando enviar datos de salud a servicios externos.
- Educacion y divulgacion: generacion de resumenes o explicaciones sencillas sobre estres y afecto para materiales formativos, siempre con supervision humana dado el riesgo de alucinacion en dominio clinico.
- Base para un ajuste posterior: el adaptador puede servir de punto de partida para un segundo entrenamiento especifico, dado su bajo coste de almacenamiento y su compatibilidad con la libreria transformers.
- Evaluacion comparativa de adaptadores: util como caso de estudio para medir cuanto rendimiento general se degrada al especializar un modelo instruct en un dominio estrecho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna seccion de evaluacion completada y el autor no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. Tampoco se documentan metricas especificas del dominio (exactitud, F1, MAE) que permitan validar el ajuste sobre WESAD. Cualquier afirmacion sobre el rendimiento del adaptador requeriria una evaluacion propia.

## Requisitos de hardware

- El adaptador en si ocupa unos 0,1 GB, por lo que el requisito real de memoria depende del peso del modelo base fusionado.
- Inferencia en precision completa (fp16/bf16) del base de 3B: aproximadamente 6-7 GB de VRAM solo para pesos, mas la cache KV.
- Inferencia cuantizada a 8 bits: en torno a 3-4 GB de VRAM; a 4 bits (GGUF Q4_K_M o similar): en torno a 2-3 GB, siempre que se aplique la cuantizacion al modelo fusionado.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090 sin problema en fp16; en tarjetas de 8 GB se recomienda cuantizacion.
- GPU de centro de datos: A100, H100 o L40S permiten lotes grandes y mayor throughput, si bien estan sobredimensionadas para un modelo de este tamano.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM o TGI tras fusionar y opcionalmente cuantizar, y llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xw17/Qwen2.5-3B-Instruct_SFT_lora_wesad | ~3,09 mil millones (base) + adaptador LoRA | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct | ~3,09 mil millones | 32.768 tokens | Qwen Research License | HuggingFace, ampliamente utilizado |
| Llama-3.2-3B-Instruct | ~3,21 mil millones | 128.000 tokens | Licencia comunitaria Llama 3.2 | HuggingFace, muy extendido |
| Phi-3.5-mini-instruct | ~3,8 mil millones | 128.000 tokens | Licencia MIT | HuggingFace, muy extendido |
| Gemma-2-2B-it | ~2,6 mil millones | 8.192 tokens | Gemma Terms of Use | HuggingFace, ampliamente utilizado |

No hay datos de rendimiento comparado para el adaptador, ya que no se han publicado evaluaciones. La comparacion se limita por tanto a parametros, contexto y licencia de los modelos base o alternativos de la misma categoria.

## Limitaciones y advertencias

- La model card es la plantilla automatica de HuggingFace y no contiene informacion real: no hay descripcion, casos de uso previstos, limitaciones declaradas ni datos de entrenamiento.
- No se especifica la licencia del ajuste. Aunque el modelo base Qwen2.5-3B-Instruct usa la Qwen Research License, que restringe el uso comercial en la variante de 3B, la licencia aplicable a este adaptador concreto no esta declarada, lo que impide confirmar si su uso comercial es legalmente viable.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni evidencia de que el modelo funcione correctamente.
- Al ser un adaptador LoRA de 0,1 GB, no es desplegable por si solo: requiere descargar el modelo base y aplicar los pesos delta, lo que anade dependencias y posibles incompatibilidades de version.
- Existe riesgo elevado de alucinacion, especialmente si el ajuste se ha realizado sobre un dataset de dominio estrecho con pocos ejemplos: el modelo puede generar afirmaciones infundadas sobre estados fisiologicos o diagnosticos.
- Cualquier aplicacion en el ambito de la salud mental, el estres o el afecto debe considerarse no clinica y requerir supervision de un profesional; un modelo de 3B no es adecuado para decisiones medicas.
- No se documentan sesgos conocidos ni el proceso de filtrado del dataset de entrenamiento, lo que dificulta evaluar riesgos de equidad entre subgrupos demograficos.
- El soporte multilingue del adaptador es incierto: si el corpus de ajuste estaba en ingles, el rendimiento en espanol puede degradarse respecto al modelo base.
- No hay informacion sobre longitud de contexto efectiva tras el ajuste ni sobre estabilidad en conversaciones largas.
- Se desconoce si el ajuste preserva el soporte de tool calling y de plantillas de chat del modelo base, algo critico si se piensa integrar en agentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xw17/Qwen2.5-3B-Instruct_SFT_lora_wesad
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Dataset WESAD (referencia del sufijo del nombre, sin confirmar por el autor): https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/
- Articulo citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automatico: https://mlco2.github.io/impact
