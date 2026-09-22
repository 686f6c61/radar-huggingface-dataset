# WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_DoRA_Qwen3-8b

## Resumen

WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_DoRA_Qwen3-8b es un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) publicado con la librería PEFT sobre el modelo base Qwen/Qwen3-8B-Base. No es un modelo completo, sino un conjunto de pesos de adaptación de bajo rango (0,7 GB de repositorio) que debe cargarse junto con el modelo base para poder ejecutarse. Su pipeline declarado es text-generation, aunque el nombre del repositorio indica que el ajuste se ha realizado sobre la tarea XNLI (inferencia de lenguaje natural, tres clases: implicación, neutralidad y contradicción) en inglés y suajili.

El identificador del repositorio sugiere que el entrenamiento se hizo con 5000 ejemplos de XNLI y con algún esquema de barrido de porcentaje de datos (1 a 40), lo que apunta a un artefacto de investigación orientado a estudiar la transferencia entre idiomas y la eficiencia de DoRA frente a LoRA en escenarios de bajos recursos. Esta interpretación procede únicamente del nombre del modelo y no está confirmada en la model card.

La relevancia actual del repositorio es limitada pero concreta: sirve como punto de partida reproducible para experimentos de adaptación eficiente en suajili (idioma de bajos recursos) y para comparar DoRA con LoRA sobre un transformer denso de 8B. La model card publicada es la plantilla por defecto de HuggingFace sin rellenar, con la práctica totalidad de campos marcados como "[More Information Needed]", y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador DoRA de bajo rango sobre proyecciones lineales |
| Parametros totales | No disponible en la model card. El modelo base Qwen3-8B declara aproximadamente 8 200 millones de parametros segun su documentacion publica; el numero de parametros entrenables del adaptador no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen3-8B declara 32 768 tokens nativos, ampliables a 131 072 mediante YaRN segun su documentacion publica |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; las cuantizaciones (GGUF, AWQ, GPTQ, bitsandbytes) solo son aplicables tras fusionar el adaptador con el modelo base |
| Idiomas soportados | El adaptador se ha entrenado sobre ingles y suajili (segun el identificador del repositorio); el modelo base declara soporte para 119 idiomas, no confirmado para este adaptador |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos PEFT); requiere el modelo base Qwen/Qwen3-8B-Base |
| Modelo base | Qwen/Qwen3-8B-Base |
| Tipo de adaptador | DoRA (variante de LoRA con descomposicion de magnitud y direccion) |
| Rango y alpha | No disponible |
| Libreria | peft 0.17.1, transformers |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador DoRA sobre un transformer denso con atencion por consultas agrupadas (GQA) y decodificacion autoregresiva, correspondiente a la familia Qwen3 en su variante Base de 8B. DoRA descompone cada matriz de pesos preentrenada en un componente de magnitud y otro de direccion, y aplica la actualizacion de bajo rango solo sobre la direccion, lo que en la literatura original reporta una brecha menor respecto al ajuste completo que LoRA con el mismo presupuesto de parametros entrenables. Al ser un adaptador PEFT, no modifica los pesos del modelo base y se puede cargar y descargar en tiempo de ejecucion.

Los datos de entrenamiento, segun se deduce del identificador del repositorio, serian el corpus XNLI en sus particiones de ingles y suajili, con 5000 ejemplos y algun tipo de regimen escalonado entre el 1 % y el 40 % del conjunto. La model card no especifica hiperparametros (tasa de aprendizaje, rango, alpha, dropout, precision, numero de epocas), composicion exacta del dataset, ni si hubo etapas de RLHF o DPO, algo poco habitual en una tarea discriminativa de tres clases como XNLI. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras).

## Capacidades

- Clasificacion de inferencia de lenguaje natural (NLI) en tres clases sobre pares premisa-hipotesis, en ingles y suajili, presumiblemente mediante la cabeza de lenguaje del modelo base y el mapeo de etiquetas a tokens.
- Generacion de texto condicionada por el modelo base Qwen3-8B-Base, ya que el pipeline declarado es text-generation, aunque no se documenta ninguna evaluacion generativa del adaptador.
- Transferencia entre idiomas ingles-suajili, util para estudiar si el ajuste en un idioma de altos recursos mejora el rendimiento en uno de bajos recursos.
- No se documenta soporte de tool calling ni function calling (el modelo base es una variante Base, no Instruct, por lo que no incorpora plantilla de chat ni formato de herramientas).
- No se documenta soporte de agentes, razonamiento multi-paso, modo thinking, vision ni audio.
- No se documentan capacidades multilingues mas alla del ingles y el suajili usados en el ajuste.
- Capacidad de adaptacion modular: al ser PEFT, permite multiples adaptadores sobre un mismo modelo base servido en memoria.

## Casos de uso

- Investigacion sobre adaptacion eficiente: reproducir la comparacion DoRA frente a LoRA sobre un mismo presupuesto de parametros entrenables en un transformer de 8B, usando este repositorio como uno de los brazos del experimento.
- Estudio de transferencia cross-lingual ingles-suajili: entrenar con XNLI en ingles y evaluar en suajili (o viceversa) para medir la degradacion por cambio de idioma en tareas de NLI.
- Experimentos de escalado de datos: el esquema de porcentajes (1 a 40) del identificador sugiere un barrido del tamano del conjunto de entrenamiento; el adaptador puede emplearse como punto de la curva para estimar cuantos ejemplos hacen falta antes de saturar.
- Filtrado de pares contradictorios en corpus paralelos: usar la salida NLI para detectar pares de frases en ingles o suajili que se contradicen, por ejemplo en la limpieza de memorias de traduccion o de datasets de alineacion.
- Verificacion de fidelidad en sistemas RAG: aplicar el modelo a pares (contexto recuperado, frase generada) para etiquetar implicacion, neutralidad o contradiccion y descartar respuestas alucinadas en ingles.
- Anotacion asistida y preetiquetado: generar etiquetas NLI preliminares sobre grandes volumenes de texto en suajili, donde escasean anotadores y modelos especializados, para revision humana posterior.
- Evaluacion de robustez en bajos recursos: medir el comportamiento del adaptador con vocabulario y morfologia suajili fuera de dominio como paso previo a un ajuste supervisado mayor.
- Docencia y prototipado de PEFT: servir como ejemplo minimo y funcional de carga de un adaptador DoRA con la libreria peft 0.17.1 sobre un modelo base de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con el marcador "[More Information Needed]" en el conjunto de prueba, los factores y las metricas, y no aporta ninguna cifra. El repositorio no incluye ningun otro artefacto con resultados (no hay ficheros de evaluacion en la informacion proporcionada). No se dispone por tanto de exactitud en XNLI, ni de comparaciones con LoRA o con el modelo base sin adaptar.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar Qwen3-8B-Base, de aproximadamente 8 200 millones de parametros, y en la practica tambien su tokenizador y configuracion.
- VRAM estimada para inferencia en precision completa (fp16/bf16) del modelo base mas el adaptador: del orden de 16 a 18 GB, incluyendo cache KV para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9 a 11 GB; en 4 bits: en torno a 5 a 7 GB. Son estimaciones derivadas del tamano del modelo base, no cifras verificadas para este adaptador.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier acelerador con 24 GB o mas para fp16. Cabe en GPU de consumo como RTX 3090, RTX 4090, RTX 5090 (24 GB) en fp16 con contextos cortos, y en tarjetas de 16 GB si se cuantiza el modelo fusionado.
- En tarjetas de 8 a 12 GB solo es viable tras fusionar y cuantizar el modelo base (por ejemplo GGUF Q4).
- Opciones de despliegue: transformers con peft para cargar el adaptador sin fusionar; vLLM con soporte de adaptadores LoRA para servir varios adaptadores sobre un mismo modelo base; TGI con adaptadores; llama.cpp u Ollama unicamente tras fusionar el adaptador con el modelo base y convertir a GGUF, ya que no cargan pesos PEFT directamente.
- Latencia y throughput: no disponibles. Al ser un adaptador de bajo rango, el coste adicional de inferencia respecto al modelo base es marginal en comparacion con el coste del propio transformer de 8B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_DoRA_Qwen3-8b | Adaptador DoRA sobre 8B (rango no disponible) | No disponible (heredado del base) | NLI en ingles y suajili | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B-Base (sin adaptar) | Aprox. 8 200 millones | 32 768 nativos, 131 072 con YaRN | Modelo de lenguaje generalista | Apache 2.0 | HuggingFace, ampliamente distribuido |
| Adaptador LoRA equivalente sobre Qwen3-8B-Base | Mismo orden de parametros entrenables | Heredado del base | NLI en ingles y suajili | No disponible | No disponible en la informacion proporcionada |
| XLM-RoBERTa-large ajustado en XNLI | Aprox. 560 millones | 512 tokens | NLI y clasificacion cross-lingual, 100 idiomas | MIT (modelo base) | HuggingFace, ampliamente usado como linea base de XNLI |

No se dispone de cifras de rendimiento para ninguno de los modelos de la tabla en el contexto de este adaptador, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Cualquier comparacion de exactitud en XNLI queda marcada como no disponible.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace sin completar: no documenta autoría real, financiacion, tipo de modelo, idiomas, licencia, fuentes, datos de entrenamiento, hiperparametros ni resultados. Cualquier uso en produccion carece de trazabilidad.
- La licencia es no disponible, lo que impide confirmar si se permite uso comercial. Aunque el modelo base Qwen3-8B-Base se distribuye bajo Apache 2.0, el adaptador no declara licencia propia y no puede asumirse la del base.
- Riesgo elevado de alucinacion y de etiquetado incorrecto si se usa como clasificador NLI sin validacion, dado que no hay ninguna metrica publicada y el ajuste se hizo sobre un unico dataset con un numero reducido de ejemplos.
- Sesgos: no hay informacion sobre la composicion sociodemografica de XNLI ni sobre sesgos de genero, etnia o religion en ingles y suajili. XNLI procede de MultiNLI y de traducciones profesionales, con los sesgos propios de ese corpus.
- Limitacion idiomatica: solo se documenta entrenamiento en ingles y suajili; no hay evidencia de generalizacion a otros idiomas ni de comportamiento en castellano.
- Restriccion de contexto: no se ha publicado ninguna evaluacion con contextos largos, por lo que el uso con ventanas extensas (por ejemplo RAG con muchos documentos) no esta validado, aunque el modelo base lo permita.
- Al ser un adaptador de la variante Base, no sigue instrucciones ni plantillas de chat; usarlo como asistente conversacional requeriria un ajuste adicional.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso ni validacion por parte de terceros.
- El identificador sugiere un experimento con porcentajes de datos (1 a 40) que la model card no explica; es probable que existan otros adaptadores hermanos con los que este debe compararse antes de extraer conclusiones.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo: los enlaces devueltos corresponden a portales institucionales sin relacion con el artefacto.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_DoRA_Qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto de ML): https://arxiv.org/abs/1910.09700
- Documentacion de PEFT (libreria declarada): https://huggingface.co/docs/peft
- Referencia externa al metodo DoRA (no citada en la model card, incluida por estar el adaptador basado en el): https://arxiv.org/abs/2402.09353
- Referencia externa al conjunto de datos XNLI (no citada en la model card, inferida del identificador): https://arxiv.org/abs/1809.05053
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las coincidencias devueltas no guardan relacion con el artefacto.
