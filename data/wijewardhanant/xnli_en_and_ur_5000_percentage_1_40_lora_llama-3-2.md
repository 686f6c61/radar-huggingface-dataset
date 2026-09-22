# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_LoRA_llama-3.2

## Resumen

El modelo `WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_LoRA_llama-3.2` es un adaptador LoRA (PEFT) publicado en HuggingFace, entrenado sobre el modelo base `meta-llama/Llama-3.2-3B`. Se trata, por tanto, de un ajuste fino parametrizado de bajo rango y no de un modelo completo: el repositorio pesa aproximadamente 0,3 GB y contiene únicamente los pesos del adaptador, que deben cargarse junto con el modelo base para poder realizar inferencia.

El identificador del repositorio indica con claridad el dominio y el idioma del ajuste: XNLI (Cross-lingual Natural Language Inference), par de idiomas inglés-urdu (en_and_ur), con un conjunto de 5000 ejemplos y una variación de porcentaje de datos de entrenamiento entre el 1 y el 40 por ciento (percentage_1_40). Esto sugiere un experimento de eficiencia de datos orientado a medir cuánto rinde el adaptador con fracciones reducidas del corpus de entrenamiento, más que un modelo de propósito general listo para producción.

La relevancia del modelo es acotada y experimental: demuestra que es viable adaptar un modelo multilingüe de 3B parámetros a una tarea de inferencia textual en un idioma de bajos recursos como el urdu con un coste de entrenamiento mínimo. La model card del autor es la plantilla por defecto de HuggingFace y no está cumplimentada, por lo que la mayor parte de los metadatos tecnicos (licencia, idiomas declarados, hiperparámetros, datos de evaluación) figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama 3.2) |
| Parametros totales | No disponible para el adaptador; el modelo base `meta-llama/Llama-3.2-3B` declara 3,21 mil millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta hasta 128 000 tokens |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT se cuantiza el modelo base sobre el que se aplica (4 bits, 8 bits, etc.) |
| Idiomas soportados | No declarado en la ficha; el identificador del repositorio sugiere ingles y urdu |
| Licencia | No disponible en la ficha del adaptador; el modelo base se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) según el framework PEFT en su versión 0.17.1, aplicado sobre Llama 3.2 3B, un transformer decoder-only con atención causal, normalización RMSNorm y embeddings rotatorios (RoPE). LoRA congela los pesos del modelo base e inserta matrices de descomposición de bajo rango en determinadas capas, de modo que solo se entrenan unos pocos millones de parámetros adicionales; esto explica que el repositorio ocupe 0,3 GB frente a los aproximadamente 6,4 GB que ocuparía el modelo completo en fp16.

No hay información publicada sobre el procedimiento de entrenamiento: la model card repite la plantilla por defecto con todos los campos marcados como `[More Information Needed]`, incluyendo datos de entrenamiento, preprocesado, régimen de precisión e hiperparámetros. Por el identificador del repositorio se puede inferir que se utilizó el corpus XNLI con 5000 ejemplos y algún tipo de barrido sobre el porcentaje de datos empleados (del 1 al 40 por ciento), presumiblemente para estudiar curvas de aprendizaje con pocos datos en inglés y urdu. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional, y no hay evidencia de decodificación especulativa ni de mecanismos de atención lineal.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Llama 3.2 3B.
- Clasificación de pares de frases en la tarea de inferencia textual (NLI): el adaptador está entrenado para asignar etiquetas de implicación, contradicción o neutralidad, presumiblemente en formato generativo.
- Procesamiento de inglés y urdu: el identificador del repositorio apunta a un ajuste bilingüe sobre el corpus XNLI; el soporte real de cada idioma no está verificado en la información disponible.
- Capacidades multilingües generales: heredadas del modelo base, que cubre oficialmente ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés); el urdu no figura entre los idiomas soportados oficialmente por Llama 3.2, por lo que el rendimiento en urdu depende enteramente del ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada; el adaptador no declara ningún ajuste orientado a agentes.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible; el modelo base es exclusivamente de texto.
- Razonamiento multi-paso y uso como agente: no disponible.

## Casos de uso

- Experimentación académica en NLI multilingüe: el adaptador permite reproducir el escenario de inferencia textual inglés-urdu sobre XNLI y comparar el rendimiento con distintas fracciones de datos de entrenamiento, que es precisamente lo que sugiere el sufijo `percentage_1_40`.
- Investigación sobre eficiencia de datos en idiomas de bajos recursos: sirve para estudiar cuánto rendimiento se conserva al entrenar con el 1, 5, 10 o 40 por ciento del corpus, un análisis habitual en trabajos de transferencia cross-lingual.
- Punto de partida para ajustes posteriores: al ser un adaptador LoRA independiente, se puede combinar o continuar entrenando sobre él con nuevos datos en urdu sin necesidad de reentrenar el modelo base.
- Prototipado rápido en clasificación de textos: cargando el adaptador sobre Llama 3.2 3B en una GPU de gama consumer, se puede montar un servicio de inferencia de pares de frases para validar ideas antes de invertir en un modelo mayor.
- Evaluación de robustez cross-lingual: permite medir si un ajuste entrenado mayoritariamente en inglés generaliza a urdu, útil para estudiar sesgos de transferencia entre idiomas tipológicamente distantes.
- Docencia y prácticas de PEFT: por su tamaño reducido (0,3 GB), es un ejemplo manejable para enseñar el flujo completo de cargar un modelo base, aplicar un adaptador LoRA y ejecutar inferencia con la librería `transformers`.
- Auditoría de artefactos publicados en HuggingFace: sirve como caso de estudio de repositorios con model card sin cumplimentar, donde metadatos como licencia o idioma no son verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye la sección de evaluación cumplimentada, no hay cifras de accuracy sobre XNLI ni comparaciones con otros modelos, y el repositorio no registra descargas ni valoraciones que permitan inferir un uso contrastado.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,3 GB y no requiere VRAM significativa por separado; el coste real lo determina el modelo base.
- Modelo base en fp16/bf16: alrededor de 6,4 GB de VRAM solo para los pesos, más la memoria de activaciones y caché KV, lo que en la práctica exige del orden de 8-10 GB para contextos moderados.
- Modelo base en cuantización de 8 bits: aproximadamente 3,5 GB de pesos.
- Modelo base en cuantización de 4 bits (bitsandbytes, AWQ o GPTQ): aproximadamente 2-2,5 GB, lo que lo hace viable en GPUs consumer como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o superiores.
- GPU recomendadas para producción: no disponible; no hay datos publicados de latencia ni de throughput para este adaptador.
- Opciones de despliegue: `transformers` con PEFT es la ruta natural, ya que el repositorio declara `library_name: peft`. El despliegue con vLLM, TGI o llama.cpp requeriría fusionar previamente el adaptador con el modelo base (`merge_and_unload`) y exportar a safetensors o GGUF, algo que no está documentado en la ficha.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_LoRA_llama-3.2 | No disponible (adaptador LoRA; base de 3,21 mil millones) | No disponible (base de 128 000 tokens) | No disponible (base bajo Llama 3.2 Community License) | HuggingFace, 0 descargas, 0 likes | Adaptador bilingüe inglés-urdu para XNLI |
| meta-llama/Llama-3.2-3B | 3,21 mil millones | 128 000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente utilizado | Modelo base, sin ajuste para NLI |
| Otros adaptadores XNLI en urdu | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas como XLM-R o mDeBERTa ajustados sobre XNLI, ya que la información proporcionada no incluye métricas de ningún modelo.

## Limitaciones y advertencias

- Model card vacía: el autor no ha cumplimentado ningún campo relevante (licencia, idiomas, datos de entrenamiento, hiperparámetros, evaluación), lo que impide verificar el comportamiento real del modelo.
- Licencia indeterminada: al no declararse licencia para el adaptador, el uso comercial queda sujeto a la licencia del modelo base, Llama 3.2 Community License, que impone restricciones adicionales (entre ellas, obligaciones de atribución y límites de uso para entidades con más de 700 millones de usuarios mensuales).
- Riesgo de alucinación: el modelo base es generativo y no ha sido alineado específicamente para respuestas factuales; en tareas de NLI puede producir salidas que no se ajusten a las tres etiquetas esperadas si no se fuerza un formato estricto.
- Idiomas: el urdu no está entre los idiomas soportados oficialmente por Llama 3.2, por lo que el rendimiento en ese idioma depende por completo del ajuste y es probable que sea inferior al de idiomas con cobertura nativa.
- Sesgos: no hay ninguna auditoría de sesgo publicada; los sesgos del corpus XNLI y del modelo base se heredan sin mitigación documentada.
- Sin validación empírica externa: el repositorio registra 0 descargas y 0 valoraciones, por lo que no existe evidencia de terceros sobre su funcionamiento.
- Naturaleza experimental: el sufijo `percentage_1_40` apunta a un barrido de fracciones de datos, lo que sugiere que puede tratarse de un artefacto intermedio de un estudio más amplio y no de una versión final optimizada.
- Sin soporte de agentes ni tool calling: no hay indicios de que el adaptador conserve o mejore estas capacidades del modelo base.
- Las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo; los resultados obtenidos no guardan relación con la ficha y se descartan por completo.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_LoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimación de emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental mencionada en la plantilla de la model card: https://mlco2.github.io/impact
- Paper de LoRA (referencia general del método, no citado explícitamente en el repositorio): https://arxiv.org/abs/2106.09685
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
