# youngjr1232/tariff-specialist-qwen3-1.7b

## Resumen

Tariff specialist (Qwen3-1.7B) es un ajuste fino supervisado del modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario youngjr1232, orientado a una tarea muy concreta: la clasificación de productos en codigos arancelarios estadounidenses (HTS, Harmonized Tariff Schedule). Dado un producto descrito en lenguaje natural y ocho codigos candidatos con su texto de schedule, el modelo devuelve un objeto JSON que selecciona un candidato o responde `NEED_INFO` indicando que atributo falta para poder decidir. Cubre exclusivamente prendas de vestir y calzado (capitulos 61, 62 y 64 del HTS).

El modelo no pretende ser un clasificador aduanero automatico, sino un componente dentro de un flujo con supervision humana: la recuperacion de candidatos, el calculo de aranceles y la determinacion final quedan fuera del modelo. Su interes practico reside en que demuestra que un modelo de 1.700 millones de parametros, ajustado con QLoRA sobre 6.791 ejemplos, puede alcanzar una adherencia al formato estructurado del 81,0% en un test sellado, frente al 6,3% del modelo base, y superar a un modelo frontera de referencia en la deteccion de informacion faltante.

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso de la familia Qwen3, con modo thinking desactivado durante el entrenamiento y la inferencia. El modelo se distribuye en formato safetensors, con licencia Apache 2.0 y un tamano de repositorio de 3,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para entrenamiento; pesos publicados en safetensors (cuantizaciones GGUF/AWQ no disponibles) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de 1.720 millones de parametros. El ajuste se realizo con QLoRA en 4 bits NF4, con LoRA de rango 16, alpha 32, dropout 0,05 aplicado a todas las proyecciones lineales, learning rate 2e-4 con scheduler coseno, 2 epocas y calculo de perdida unicamente sobre los tokens de respuesta. El modo thinking de Qwen3 se mantuvo desactivado durante el entrenamiento.

El conjunto de entrenamiento consta de 6.791 ejemplos compuestos por resoluciones etiquetadas de la CBP (Customs and Border Protection) del periodo 2000-2022, mas copias con atributos ablacionados para generar casos `NEED_INFO`, rebalanceadas hacia ramas raras del schedule. Las etiquetas proceden de resoluciones de la CBP y del schedule de la USITC, nunca de un modelo. Las descripciones de producto son resumenes generados por modelo a partir de la copia de Hugging Face `orlandowhite/hts-cross-rulings`, que no lleva licencia asociada; las resoluciones de la CBP son obras del gobierno estadounidense. No se menciona uso de RLHF ni DPO.

## Capacidades

- Clasificacion de productos de vestir y calzado (capitulos 61, 62 y 64 del HTS) entre ocho codigos candidatos proporcionados en el prompt.
- Salida estructurada en JSON: selecciona un candidato y nombra el atributo decisorio copiando palabras de la descripcion, o responde `NEED_INFO` indicando el atributo ausente.
- Deteccion de informacion faltante: capacidad de abstenerse cuando la descripcion no contiene el dato necesario para decidir.
- Robustez ante perturbaciones de la descripcion del producto (evaluada con 60 items perturbados).
- No soporta tool calling ni function calling de forma nativa segun la informacion disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, vision ni audio.
- Multilingue: solo ingles (tag `en`).

## Casos de uso

- Asistencia a especialistas en comercio exterior: el modelo propone un codigo HTS entre los candidatos recuperados previamente y explica el atributo decisorio, dejando la determinacion final al operador humano.
- Pre-clasificacion en flujos de importacion: integrado tras un recuperador BM25 o similar que aporte los ocho candidatos, reduce el trabajo manual de cribado antes de la revision legal.
- Deteccion de documentacion incompleta: gracias a su recall de `NEED_INFO` del 89,2%, puede usarse para senalar que datos faltan en una ficha de producto antes de iniciar el proceso de clasificacion.
- Formacion y auditoria interna: sirve como herramienta de apoyo para comparar la decision propuesta por el modelo con la resolucion oficial de la CBP en casos historicos.
- Prototipado de bajo coste: al ser un modelo de 1.700 millones de parametros, puede desplegarse en hardware modesto para validar pipelines de clasificacion arancelaria antes de invertir en modelos mayores.
- Investigacion sobre modelos pequenos especializados: constituye un caso de estudio de ajuste QLoRA con salida JSON restringida y evaluacion con test sellado y conjunto perturbado.

## Benchmarks y rendimiento

Resultados medidos el 2026-11-01 sobre un test sellado de 221 items de resoluciones de la CBP de 2024-2025, mas 60 items perturbados, con los mismos ocho candidatos y prompt para todos los modelos.

| Metrica | Qwen3-1.7B base | Este modelo | Claude Opus 5.5 (CoT estructurado) |
|---|---|---|---|
| Adherencia al formato (spec adherence) | 6,3% | 81,0% (179/221)* | 84,6% (187/221) |
| Robustez | 10,0% | 75,0% (45/60)* | 75,0% (45/60) |
| Recall de `NEED_INFO` | 0% | 89,2% | 73,0% |

\* El modelo (datos v4, 2 epocas) se eligio sobre el conjunto de desarrollo despues de que el test sellado ya se hubiera usado una vez (para el modelo v2: 78,7% / 71,7%), por lo que sus cifras de test son una segunda mirada, no un resultado sellado fresco. Desarrollo: 137/157 limpios y 52/58 robustos (una sola semilla).

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB; en 4 bits: alrededor de 1,2-1,5 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares con al menos 4-6 GB de VRAM en fp16.
- GPU de datacenter recomendadas: A100, H100, L40S para despliegues con concurrencia; tambien valido en T4 para inferencia ligera.
- Opciones de despliegue: el autor documenta evaluacion mediante `uv run python -I eval.py` con el prompt v2 del repositorio del proyecto; al ser un modelo Qwen3 estandar en safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion), aunque el autor no publica artefactos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tariff specialist (Qwen3-1.7B) | 1,72 B | no disponible | Clasificacion HTS (cap. 61, 62, 64) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible | Proposito general | Apache 2.0 | Hugging Face |
| Claude Opus 5.5 (referencia del autor) | no disponible | no disponible | Proposito general con CoT estructurado | Propietaria | API |

El modelo base Qwen3-1.7B obtiene un 6,3% de adherencia al formato y un 0% de recall de `NEED_INFO` en la misma tarea, lo que evidencia que la especializacion aporta la mayor parte de la mejora. Frente a Claude Opus 5.5, el modelo especializado queda ligeramente por detras en seleccion de codigo (81,0% frente a 84,6%) pero lo supera en deteccion de informacion faltante (89,2% frente a 73,0%) y empata en robustez (75,0%). No se dispone de comparaciones con otros modelos especializados en clasificacion arancelaria.

## Limitaciones y advertencias

- Entrenado con una sola semilla; los conjuntos de desarrollo son pequenos (157 y 58 items) y se observo una variacion de aproximadamente 6 items entre semillas.
- Las cifras del test sellado son una segunda mirada, no un resultado sellado fresco, porque el conjunto ya se uso para seleccionar el modelo v2.
- La evaluacion asume que el codigo correcto esta entre los ocho candidatos; una recuperacion BM25 simple solo lo encuentra en el top 8 el 4% de las veces, por lo que el componente de recuperacion es critico y queda fuera del modelo.
- Algunas descripciones omiten hechos que la resolucion original si recoge, lo que puede provocar respuestas `NEED_INFO` o selecciones incorrectas.
- Rendimiento inferior al modelo frontera en lineas residuales "Other" decididas por definiciones legales que el texto del candidato nombra pero no incluye.
- Cobertura limitada a prendas de vestir y calzado (capitulos 61, 62 y 64); no cubre el resto del HTS.
- Solo idioma ingles.
- No es asesoramiento legal ni un clasificador aduanero automatico; requiere supervision humana.
- Las descripciones de producto derivan de un dataset (`orlandowhite/hts-cross-rulings`) sin licencia asociada, lo que conviene revisar antes de un uso comercial.
- No se documentan sesgos especificos, pero al entrenarse sobre resoluciones de la CBP puede heredar sesgos de esas decisiones administrativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youngjr1232/tariff-specialist-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de descripciones de producto: https://huggingface.co/orlandowhite/hts-cross-rulings
- Repositorio del proyecto (referenciado en la model card, ruta `src/tariff_slm/evals/prompts.py`): no disponible como URL publica en la informacion proporcionada
- Resoluciones de la CBP (fuente de etiquetas): no disponible como URL en la informacion proporcionada
- Schedule arancelario de la USITC (fuente de etiquetas): no disponible como URL en la informacion proporcionada
