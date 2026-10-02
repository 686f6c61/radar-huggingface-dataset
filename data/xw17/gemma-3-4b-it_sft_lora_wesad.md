# xw17/gemma-3-4b-it_SFT_lora_wesad

## Resumen

`xw17/gemma-3-4b-it_SFT_lora_wesad` es un repositorio publicado en HuggingFace por el usuario `xw17` que, por su nombre y por el tamano del repositorio (0,1 GB), contiene un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base `gemma-3-4b-it` de Google. El sufijo `wesad` sugiere que el ajuste se realizo sobre el dataset WESAD (Wearable Stress and Affect Detection), orientado a la deteccion de estres y estados afectivos a partir de senales fisiologicas de wearables; sin embargo, esta correspondencia no esta confirmada en ninguna parte de la model card ni en los metadatos del repositorio.

La model card es la plantilla autogenerada de HuggingFace: todas las secciones relevantes (descripcion, datos de entrenamiento, hiperparametros, evaluacion, licencia, idiomas) figuran como `[More Information Needed]`. El repositorio no declara pipeline, licencia ni idiomas, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe evidencia publica de validacion, evaluacion o uso en produccion.

Por tanto, esta ficha describe con rigor lo que se puede verificar (formato, libreria, tamano, ausencia de documentacion) y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier dato sobre arquitectura, contexto o idiomas que se incluya es necesariamente heredado del modelo base y debe verificarse contra la documentacion oficial de Gemma 3 antes de usarse en un sistema real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en este repositorio; el modelo base es un transformer decoder-only (Gemma 3), dato no confirmado por el autor |
| Parametros totales | no disponible; el repositorio contiene un adaptador (0,1 GB), no pesos completos. El modelo base declara 4.000 millones de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Gemma 3 4B IT declara 128.000 tokens, dato no verificado aqui |
| Tipos de cuantizacion | no disponible (un adaptador LoRA se aplica sobre el modelo base ya cuantizado o en precision completa; no se declaran variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el repositorio no declara licencia. La licencia del modelo base (Gemma Terms of Use) condiciona el uso derivado |
| Formato de pesos | safetensors (adaptador LoRA) |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Dataset de ajuste declarado | no confirmado; el nombre del repositorio sugiere WESAD, sin documentacion que lo respalde |
| Fecha de creacion (Hub) | 2026-10-02 |
| Fecha de ultima actualizacion (Hub) | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta del adaptador ni sobre el procedimiento de entrenamiento. La model card incluye el apartado "Training Procedure" completamente vacio (`[More Information Needed]`), sin datos de regimen de precision (fp32, bf16, fp8), hiperparametros, numero de pasos, tasa de aprendizaje ni composicion del dataset. Tampoco se documenta si hubo una fase de RLHF, DPO u otro ajuste de preferencias, ni si el entrenamiento consistio unicamente en SFT.

Lo unico deducible con cierta seguridad es estructural: el repositorio ocupa 0,1 GB, un orden de magnitud muy inferior al de un checkpoint completo de un modelo de 4.000 millones de parametros en bf16 (que rondaria los 8 GB), lo que es coherente con un adaptador LoRA de bajo rango. Esto implica que el artefacto no es autosuficiente: requiere descargar el modelo base `gemma-3-4b-it` y cargar el adaptador encima para poder ejecutar inferencia.

El tag `arxiv:1910.09700` que aparece en los metadatos corresponde al articulo de Lacoste et al. sobre estimacion de impacto de carbono, citado en la plantilla por defecto de HuggingFace; no es una referencia al metodo de entrenamiento del modelo. Cualquier afirmacion sobre el dataset WESAD, sus senales (ECG, EDA, EMG, temperatura, acelerometro) o el esquema de etiquetado de tres clases (baseline, estres, diversion) seria especulativa y no se incluye aqui como hecho.

## Capacidades

- Generacion de texto instructivo: heredada del modelo base, sujeta a lo que el ajuste LoRA no haya degradado. No hay evaluacion que lo confirme.
- Razonamiento y matematicas: no disponible; sin benchmarks publicados.
- Generacion de codigo: no disponible; sin benchmarks publicados.
- Tool calling / function calling: no disponible en este repositorio. El modelo base Gemma 3 IT documenta soporte de function calling, pero no hay confirmacion de que el adaptador lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. El repositorio no declara idiomas y la model card deja el campo "Language(s)" vacio.
- Vision: no disponible. El modelo base Gemma 3 4B IT es multimodal, pero no hay constancia de que el adaptador LoRA se haya entrenado preservando la torre de vision, y el tag `transformers` sin modificador no permite confirmarlo.
- Modo "thinking" explicito: no disponible.
- Capacidad especifica del ajuste: no disponible. No se documenta el formato de entrada/salida ni si el modelo espera senales fisiologicas serializadas como texto, series temporales tokenizadas u otro esquema.

## Casos de uso

Dado que la model card no documenta el proposito del ajuste, los casos siguientes se dividen entre usos genericos de un modelo instructivo de 4B ajustado y usos hipoteticos condicionados a que el ajuste corresponda realmente a WESAD.

- Asistente conversacional ligero en local: si el adaptador conserva las capacidades del modelo base, puede desplegarse en una GPU de consumo (por ejemplo, RTX 3060 de 12 GB o superior) para tareas de chat y resumen de documentos, con el coste de VRAM reducido que implica un modelo de ~4B en cuantizacion de 4 bits. No hay latencias medidas publicadas.
- Prototipado rapido en investigacion: el tamano del adaptador (0,1 GB) lo hace adecuado para iterar sobre hipotesis de ajuste sin almacenar checkpoints completos, siempre que se disponga del modelo base cacheado.
- Aprendizaje por transferencia en el dominio fisiologico (hipotetico): si el ajuste se hizo sobre WESAD, el modelo podria usarse como punto de partida para clasificacion o descripcion de estados afectivos a partir de senales de wearables, con un ajuste adicional sobre datos propios. Requiere validacion empirica antes de cualquier uso clinico.
- Generacion de informes estructurados (hipotetico): si el SFT se oriento a tareas de anotacion o resumen de ventanas de senal, podria emplearse para producir etiquetas textuales o JSON a partir de descriptores fisiologicos. No hay ejemplos de formato en el repositorio.
- Extraccion de informacion y clasificacion de texto: uso generico de un modelo instructivo pequeno para convertir texto no estructurado en campos tipados, con la ventaja de caber en una sola GPU consumer.
- Filtrado previo en pipelines de bajo coste: emplear el modelo como primera etapa barata (por ejemplo, descarte de solicitudes irrelevantes) antes de llamar a un modelo mayor, reduciendo coste por token.
- Educacion y demostraciones: util para mostrar el flujo completo de un ajuste LoRA sobre un modelo abierto dentro de un curso o taller, dado el reducido tamano del artefacto.
- No recomendado: cualquier aplicacion clinica, diagnostico de estres o toma de decisiones sobre personas sin una validacion prospectiva y sin la documentacion de sesgos y dominio que aqui falta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de metricas propias del dominio (exactitud, F1, AUC) sobre WESAD o sobre cualquier otro conjunto. Tampoco se aportan medidas de latencia, throughput ni consumo de memoria. Cualquier numero que se atribuyese a este modelo seria inventado.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador por si solo no es ejecutable y anade un coste marginal (menos de 1 GB) sobre el modelo base. Para un modelo de ~4B, las estimaciones habituales son: ~8-9 GB en bf16/fp16, ~5 GB en int8 y ~3 GB en cuantizacion de 4 bits. Son estimaciones teoricas basadas en el tamano de parametros, no medidas sobre este adaptador concreto.
- GPU recomendadas: para precision completa, NVIDIA A100 40 GB, H100 o L40S, con amplio margen; para cuantizacion de 4 bits, tarjetas de 8-12 GB son suficientes.
- GPU de consumo: si, en principio cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en Apple Silicon con memoria unificada de 16 GB o mas. No hay pruebas publicadas de que este adaptador concreto funcione correctamente en estas configuraciones.
- Opciones de despliegue: la libreria declarada es `transformers`, por lo que la ruta mas directa es `peft` + `transformers` o `vLLM` con adaptadores LoRA. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni con formatos GGUF; al no haber pesos fusionados ni cuantizaciones publicadas, estas rutas requeririan fusionar el adaptador con el modelo base y convertir manualmente.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

La comparativa se establece contra el propio modelo base y contra alternativas abiertas de tamano equivalente. Las cifras de los modelos comparados proceden de su documentacion publica habitual y no se han verificado en esta ficha; las del modelo descrito son "no disponible" salvo en lo relativo al repositorio.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad | Resultado en benchmarks |
|---|---|---|---|---|---|
| xw17/gemma-3-4b-it_SFT_lora_wesad | Adaptador sobre ~4B | no disponible | no disponible | Repositorio publico, 0 descargas | no disponible |
| google/gemma-3-4b-it (modelo base) | ~4B | 128.000 tokens (segun documentacion de Google) | Gemma Terms of Use | Publico, ampliamente distribuido | Cifras publicadas por Google, no reproducidas aqui |
| Qwen/Qwen3-4B | ~4B | 32.000 tokens, ampliable (segun documentacion de Alibaba) | Apache 2.0 | Publico | Cifras publicadas por Alibaba, no reproducidas aqui |
| meta-llama/Llama-3.2-3B-Instruct | ~3B | 128.000 tokens (segun documentacion de Meta) | Llama Community License | Publico, con aceptacion de terminos | Cifras publicadas por Meta, no reproducidas aqui |

Diferencias clave: frente a las alternativas, este repositorio no ofrece pesos completos, no declara licencia propia y no publica evaluacion alguna, por lo que no es comparable en terminos de rendimiento verificable. Su unico valor diferencial seria el ajuste especifico de dominio, que no esta documentado.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es una plantilla sin rellenar. No se puede determinar el proposito, el dominio, el formato de entrada ni las condiciones de uso previstas.
- Licencia sin declarar: el repositorio no especifica licencia. El uso comercial queda en un limbo juridico y, en todo caso, sujeto a los terminos del modelo base Gemma, que imponen obligaciones adicionales de atribucion y uso responsable.
- Sesgos: no disponibles. No hay analisis de sesgo ni descripcion de la composicion del dataset de ajuste.
- Riesgo de alulcinacion: no cuantificado. No hay evaluacion de fidelidad ni de tasa de error en tareas abiertas.
- Riesgo de sobreajuste al dominio: si el ajuste se realizo sobre un unico dataset (presuntamente WESAD), es probable que el modelo haya perdido capacidades generales, pero no hay evaluacion que lo confirme ni que lo descarte.
- Limitaciones de contexto e idioma: no disponibles. No se declara ventana de contexto efectiva tras el ajuste ni idiomas soportados.
- Ausencia de validacion externa: 0 descargas y 0 likes implican que el artefacto no ha sido reproducido ni auditado por terceros.
- Metadatos incoherentes: la fecha de creacion registrada (2026-10-02) no es verificable y el tag `arxiv:1910.09700` procede de la plantilla por defecto, no del entrenamiento.
- Uso en produccion: no recomendado sin antes fusionar el adaptador con el modelo base, evaluarlo sobre un conjunto de validacion propio y resolver la cuestion de licencia.
- Dominio sensible: cualquier aplicacion relacionada con estres, salud mental o monitorizacion fisiologica debe considerarse de alto riesgo y requiere validacion clinica y supervision humana.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xw17/gemma-3-4b-it_SFT_lora_wesad
- Modelo base referenciado en el nombre del repositorio: https://huggingface.co/google/gemma-3-4b-it
- Articulo citado en los tags (Lacoste et al., 2019, sobre estimacion de impacto de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico mencionada en la plantilla: https://mlco2.github.io/impact
- Dataset WESAD (referencia no confirmada por el autor, se incluye por la coincidencia del sufijo del repositorio): no disponible en la informacion proporcionada
- Paper, blog, demo o repositorio de codigo adicionales: no disponible
