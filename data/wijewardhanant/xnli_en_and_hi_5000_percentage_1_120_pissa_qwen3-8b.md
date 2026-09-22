# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_PiSSA_Qwen3-8b

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_PiSSA_Qwen3-8b`, construido sobre el modelo base denso `Qwen/Qwen3-8B-Base`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (0,5 GB en el repositorio) que debe cargarse junto con los pesos del modelo base de 8.200 millones de parametros para poder ejecutar inferencia. El autor es el usuario de HuggingFace WijewardhanaNT, que no ha publicado informacion adicional en la model card mas alla de los metadatos de PEFT.

El identificador del repositorio sugiere, sin confirmacion oficial en la model card, un ajuste fino orientado a la tarea XNLI (inferencia de lenguaje natural) en ingles y hindi sobre 5.000 ejemplos, y el sufijo "PiSSA" apunta a la tecnica de inicializacion PiSSA (Principal Singular values and vectors Adaptation) en lugar de la inicializacion LoRA clasica. Tambien es relevante que el modelo de partida sea la variante "Base" y no la "Instruct" de Qwen3, lo que implica un modelo sin alineacion conversacional.

Su relevancia practica es doble: por un lado, sirve como artefacto de investigacion para reproducir experimentos de ajuste eficiente de parametros (PEFT) sobre tareas de NLI multilingue; por otro, demuestra el flujo de trabajo de servir multiples adaptadores LoRA sobre una misma instancia del modelo base en entornos como vLLM. Las descargas y los "likes" del repositorio son cero, y la licencia del adaptador no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con atencion de consultas agrupadas (GQA), SwiGLU, RMSNorm y RoPE; el adaptador es un modulo LoRA/PEFT acoplado a la arquitectura del modelo base |
| Parametros totales | 8.200 millones en el modelo base Qwen3-8B-Base; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; extensible a 131.072 tokens mediante YaRN segun la documentacion de Qwen3. Longitud efectiva del adaptador: no disponible |
| Tipos de cuantizacion | No declarados para el adaptador. El modelo base dispone de cuantizaciones en el ecosistema publico (GGUF Q4_K_M, Q5_K_M, Q8_0; AWQ; GPTQ, entre otras) |
| Idiomas soportados | No disponibles en la model card. El modelo base Qwen3 declara soporte para 119 idiomas y dialectos; el nombre del repositorio sugiere uso con ingles y hindi |
| Licencia | No disponible para el adaptador. El modelo base Qwen3-8B-Base se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | Qwen/Qwen3-8B-Base |
| Tipo de adaptador | LoRA (libreria PEFT; framework version 0.17.1 declarada) |
| Rango y alpha de LoRA | no disponible |
| Tamano del repositorio | 0,5 GB |
| Libreria declarada | peft, transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |
| Etiquetas | peft, safetensors, lora, transformers, text-generation, arxiv:1910.09700, region:us |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-8B-Base, un transformer decoder-only denso de 8.200 millones de parametros con atencion de consultas agrupadas, normalizacion RMSNorm, activacion SwiGLU y codificacion posicional rotatoria (RoPE). El entrenamiento del adaptador sigue el paradigma PEFT: los pesos del modelo base permanecen congelados y solo se optimiza un subconjunto de matrices de bajo rango inyectadas en las capas de atencion y/o proyeccion. La model card no especifica en que modulos se insertan, ni el rango, ni el valor de alpha, ni la tasa de aprendizaje o el numero de pasos.

El nombre del repositorio permite formular hipotesis, que no deben tomarse como hechos confirmados: "xnli_en_and_hi" apunta a la tarea XNLI (Natural Language Inference) con datos en ingles y hindi; "5000" podria referirse a 5.000 ejemplos de entrenamiento; "percentage_1" podria indicar que se uso el 1 por ciento de ese subconjunto; "120" podria corresponder al rango de LoRA, al numero de pasos o a un identificador de configuracion; y "PiSSA" apunta a la inicializacion PiSSA, que descompone la matriz de pesos original mediante SVD y entrena los componentes principales en lugar de inicializar el adaptador a cero. Nada de esto aparece documentado en la model card, por lo que la unica informacion verificable sobre el entrenamiento es la version de PEFT (0.17.1) y la referencia al articulo arXiv:1910.09700, que es la calculadora de impacto de carbono de Lacoste et al. (2019) y no un articulo sobre el metodo de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva: hereda la capacidad del modelo base Qwen3-8B-Base, sin alineacion por instrucciones ni ajuste conversacional.
- Inferencia de lenguaje natural (NLI) en ingles y hindi, segun lo que sugiere el identificador del repositorio. No confirmado por el autor ni evaluado en la model card.
- Clasificacion por puntuacion de secuencias: al estar construido sobre un modelo base, el uso mas realista es calcular log-probabilidades de etiquetas (entailment, neutral, contradiction) en lugar de generar respuestas en lenguaje natural.
- Capacidad multilingue heredada del modelo base (119 idiomas declarados por Qwen), degradada por un ajuste fino aparentemente limitado a dos idiomas.
- Transferencia cruzada ingles-hindi para tareas de similitud semantica y coherencia logica entre premisa e hipotesis.
- Soporte de tool calling / function calling: no disponible en el modelo base (es una capacidad de las variantes Instruct de Qwen3) y no declarado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking": no disponible en la variante Base de Qwen3.
- Vision o audio: no disponibles; Qwen3-8B-Base es exclusivamente de texto.
- Servicio multi-adaptador: compatible con despliegues que cargan varios LoRA sobre una sola instancia del modelo base.

## Casos de uso

- Clasificacion de pares de frases (NLI): dado un par premisa-hipotesis en ingles o hindi, calcular la verosimilitud de las etiquetas de implicacion, neutralidad y contradiccion. Es el uso mas coherente con el nombre del repositorio y con la eleccion de un modelo base en lugar de uno alineado.
- Deteccion de contradicciones en bases documentales: en un sistema de recuperacion aumentada (RAG) multilingue, el adaptador puede usarse como verificador secundario que marque fragmentos recuperados logicamente incompatibles entre si antes de pasarlos al generador.
- Moderacion semantica de contenido: comparar pares de afirmaciones de usuario para detectar reescrituras que contradicen una politica publicada, aprovechando la transferencia ingles-hindi del adaptador.
- Investigacion en PEFT reproducibilidad: evaluar el efecto de la inicializacion PiSSA frente a una LoRA estandar bajo el mismo presupuesto de datos, sirviendo el repositorio como punto de partida reproducible.
- Ablacion de tamano de dataset: el sufijo "5000_percentage_1" sugiere experimentos de submuestreo de datos; el adaptador puede emplearse como referencia en estudios sobre cuantos ejemplos necesita una LoRA para una tarea de clasificacion concreta.
- Generacion de datos sinteticos anotados: usando el modelo base subyacente se pueden producir pares de frases etiquetados como entailment/contradiction para preentrenar clasificadores mas grandes, con el adaptador como filtro de calidad.
- Despliegue multiinquilino con LoRA: en una plataforma que sirva el modelo Qwen3-8B-Base en vLLM o TGI, este adaptador puede registrarse como uno mas entre decenas, con coste marginal de memoria muy bajo frente a replicar el modelo completo.
- Evaluacion de robustez multilingue: medir la degradacion del rendimiento cuando la entrada cambia de ingles a hindi o a variedades mixtas (code-switching) en tareas de inferencia textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio contiene la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]", y los resultados de busqueda web proporcionados solo contienen herramientas genericas de traduccion, sin relacion con el modelo. No se dispone de cifras de exactitud en XNLI, MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- Peso del adaptador: 0,5 GB, independiente de la cuantizacion elegida para el modelo base.
- VRAM para inferencia con el modelo base en bf16: aproximadamente 16-17 GB, suficiente para una RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB o L40S (48 GB).
- VRAM con cuantizacion de 8 bits: aproximadamente 9-10 GB, viable en RTX 4080 (16 GB) y superiores.
- VRAM con cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB, viable en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso en CPU con llama.cpp a costa de una latencia mucho mayor.
- Despliegue con adaptadores dinamicos: vLLM (soporte de LoRA por peticion con `--enable-lora`) y TGI son las opciones mas eficientes para servir el adaptador sobre el modelo base sin duplicar pesos.
- Despliegue local: transformers con PEFT (`PeftModel.from_pretrained`) para pruebas; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y convertir el resultado a GGUF.
- Entrenamiento o ajuste adicional: una LoRA sobre un modelo de 8.000 millones de parametros en bf16 cabe en 24 GB con optimizador de 8 bits, y en 16 GB con QLoRA de 4 bits.
- Latencia y throughput: no disponibles. Como referencia orientativa, un Qwen3-8B denso en bf16 sobre una A100 suele situarse en el orden de decenas de milisegundos por token en generacion, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_PiSSA_Qwen3-8b (adaptador) | 8.200 M (base) + adaptador no cuantificado | 32.768 tokens en el base | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B-Base (modelo base sin ajustar) | 8.200 M | 32.768 tokens, extensible a 131.072 con YaRN | Apache 2.0 | No disponible en esta ficha | HuggingFace, ampliamente distribuido |
| Qwen/Qwen3-8B (variante Instruct) | 8.200 M | 32.768 tokens, extensible a 131.072 con YaRN | Apache 2.0 | No disponible en esta ficha | HuggingFace, ampliamente distribuido |
| Adaptadores LoRA publicos para NLI en Qwen3-8B | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos verificables para este adaptador, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace: no documenta arquitectura del adaptador, datos, hiperparametros, evaluacion ni uso previsto. Cualquier afirmacion sobre su comportamiento es una inferencia a partir del nombre del repositorio.
- El modelo subyacente es la variante Base de Qwen3, no la Instruct. No ha recibido ajuste por instrucciones ni RLHF/DPO, por lo que no cabe esperar respuestas conversacionales utiles ni seguimiento fiable de instrucciones.
- Riesgo alto de alucinacion si se usa como generador de texto libre: el ajuste aparente sobre 5.000 ejemplos de NLI no previene la generacion de contenido falso fuera de esa distribucion.
- Sesgos desconocidos: al no documentarse la composicion del dataset de ajuste, no es posible evaluar sesgos de genero, religion, casta u origen regional, especialmente relevantes en el contexto linguistico hindi.
- Cobertura idiomatica limitada en la practica: aunque el modelo base declara 119 idiomas, el ajuste aparente en ingles y hindi puede degradar el rendimiento en otras lenguas respecto al modelo base sin ajustar.
- Licencia no declarada: no se puede confirmar la permisividad para uso comercial del propio adaptador. La licencia Apache 2.0 del modelo base no se extiende automaticamente al artefacto derivado.
- Sin validacion externa: cero descargas y cero "likes" implican que no existe evidencia de terceros sobre su funcionamiento correcto.
- Fecha de creacion atipica (2026-09-22), posterior a la fecha de referencia habitual de los modelos Qwen3; conviene verificar la integridad del repositorio antes de integrarlo.
- Si se despliega como adaptador en vLLM o TGI, hay que comprobar la compatibilidad de la version de PEFT (0.17.1) con el runtime, ya que los formatos de pesos de adaptador han cambiado entre versiones.
- Al fusionar el adaptador con el modelo base para exportar a GGUF, se pierde la capacidad de desactivarlo o intercambiarlo, y cualquier error numerico en la fusion es irreversible en el artefacto resultante.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_PiSSA_Qwen3-8b
- Modelo base Qwen/Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Coleccion Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-67dd247413f0e2e4f653967f
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Libreria PEFT: https://github.com/huggingface/peft
- Articulo citado en las etiquetas del repositorio (calculadora de impacto de carbono, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Articulo de PiSSA, citado como posible base del metodo de inicializacion segun el nombre del repositorio (no confirmado por el autor): https://arxiv.org/abs/2404.02948
- Articulo de XNLI, citado como posible dataset de ajuste segun el nombre del repositorio (no confirmado por el autor): https://arxiv.org/abs/1809.05053
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo; solo devuelven herramientas genericas de traduccion (DeepL, Google Translate, Cambridge Dictionary, Translate.com).
