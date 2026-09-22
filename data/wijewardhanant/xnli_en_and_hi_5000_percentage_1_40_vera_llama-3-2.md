# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_VeRA_llama-3.2

## Resumen

Este repositorio contiene un adaptador PEFT entrenado sobre meta-llama/Llama-3.2-3B mediante la técnica VeRA (Vector-based Random Matrix Adaptation), un método de ajuste eficiente de parámetros que congela matrices aleatorias compartidas entre capas y entrena únicamente vectores de escalado. El identificador del repositorio sugiere que el adaptador se ha entrenado sobre el corpus XNLI (inferencia de lenguaje natural entre pares de frases) en inglés e hindi, con subconjuntos de 5000 ejemplos y variaciones en el porcentaje de datos de entrenamiento entre el 1 % y el 40 %. Esa lectura es una inferencia a partir del nombre del repositorio: la model card no confirma ni el dataset, ni el número de ejemplos, ni el rango de porcentajes.

El artefacto es un adaptador, no un modelo autónomo. Para utilizarlo hay que cargar el modelo base Llama-3.2-3B (3.210 millones de parámetros, transformer decoder denso con Grouped-Query Attention y ventana de contexto de hasta 128.000 tokens según la documentación de Meta) y superponer los pesos del adaptador. El repositorio ocupa 0,2 GB, lo que es coherente con el reducido número de parámetros entrenables típico de VeRA, muy inferior al de LoRA o QLoRA.

Su relevancia es fundamentalmente metodológica y de reproducibilidad: permite estudiar la eficacia de VeRA en una tarea de clasificación multilingüe (XNLI) y analizar cómo varía el rendimiento en función de la fracción de datos utilizada. No obstante, la model card está sin completar (conserva todos los marcadores `[More Information Needed]`), no declara licencia, no documenta hiperparámetros ni datos de entrenamiento y no incluye ninguna evaluación. Cualquier uso en producción exige verificar previamente el `adapter_config.json`, reproducir la evaluación y aclarar la situación legal de los pesos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador VeRA (PEFT) sobre transformer decoder denso Llama-3.2-3B (atención con GQA, RoPE y SwiGLU, según especificaciones del modelo base) |
| Parametros totales | 3.210 millones en el modelo base; número de parámetros del adaptador no disponible |
| Parametros activos | No aplica: el modelo base es denso, no es un MoE |
| Longitud de contexto | 128.000 tokens en el modelo base (dato de la documentación de Llama 3.2); no confirmado para el adaptador ni para la tarea objetivo |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar; el modelo base admite cuantizaciones de terceros (GGUF, AWQ, GPTQ), no incluidas en este repositorio |
| Idiomas soportados | No declarado en la model card. El nombre del repositorio indica inglés e hindi; Llama 3.2 declara soporte oficial para ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible para el adaptador. El modelo base se rige por la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT; requiere transformers + peft, PEFT 0.17.1 según la model card) |

## Arquitectura y entrenamiento

El adaptador se apoya en Llama-3.2-3B, un transformer decoder autorregresivo con normalización RMSNorm pre-norma, activación SwiGLU, embeddings rotatorios (RoPE) y Grouped-Query Attention para reducir el coste de la caché KV en contextos largos. La innovación del artefacto no está en el modelo base, sino en el método de ajuste: VeRA, una variante de bajo rango en la que las matrices de proyección son aleatorias, congeladas y compartidas entre todas las capas, de modo que solo se entrenan vectores de escalado por capa. Esto reduce el número de parámetros entrenables muy por debajo de LoRA, a costa de una capacidad de adaptación más limitada. Los detalles concretos de la configuración (rango, capas objetivo, `vera_theta`, módulos adaptados) no están documentados en la model card y deben consultarse en el `adapter_config.json` del repositorio.

No hay información sobre el procedimiento de entrenamiento: ni número de tokens vistos, ni composición exacta del dataset, ni si hubo RLHF, DPO o simplemente ajuste supervisado sobre clasificación. La única referencia aportada en la model card es `arxiv:1910.09700`, que corresponde a Lacoste et al. (2019) sobre impacto ambiental del aprendizaje automático y que aparece como plantilla del apartado de sostenibilidad, no como artículo describiendo este adaptador. Tampoco se documentan hiperparámetros, precisión de entrenamiento (fp32, bf16, fp16) ni hardware utilizado.

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) de tres clases (implicación, contradicción, neutralidad) sobre pares de frases, presumiblemente en inglés e hindi según el nombre del repositorio. No verificado con evaluación publicada.
- Ajuste eficiente de parámetros: al ser un adaptador, modifica el comportamiento del modelo base sin alterar sus pesos originales y puede activarse o desactivarse en tiempo de inferencia.
- Herencia de las capacidades generales de Llama-3.2-3B cuando el adaptador no las degrada: generación de texto, resumen, respuesta a preguntas y razonamiento básico en el rango de 3.000 millones de parámetros.
- Soporte de tool calling y function calling: no disponible como capacidad declarada; el adaptador no documenta plantillas de prompt ni formato de mensajes específicos.
- Comportamiento de agente y razonamiento multi-paso: no disponible; el ajuste aparente sobre una tarea discriminativa no está orientado a agentes.
- Capacidades multilingües: presumiblemente limitadas a inglés e hindi por el nombre del repositorio; no hay evaluación ni declaración formal.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. Llama-3.2-3B es un modelo exclusivamente de texto.

## Casos de uso

- Clasificación de implicación textual en inglés e hindi: el adaptador se aplicaría sobre Llama-3.2-3B para etiquetar pares (premisa, hipótesis) como implicación, contradicción o neutralidad, útil en sistemas de verificación de afirmaciones.
- Filtrado de contradicciones en pipelines de RAG: dado un contexto recuperado y una respuesta generada, el modelo puede señalar si la respuesta contradice el contexto, reduciendo alucinaciones antes de devolver el resultado al usuario.
- Reordenación (reranking) de candidatos en búsqueda multilingüe: la señal de NLI permite puntuar pares consulta-documento y reordenar los resultados de un recuperador previo, especialmente en escenarios hindi-inglés.
- Anotación asistida de corpus: como clasificador previo para etiquetar grandes volúmenes de pares de frases y reducir el trabajo de anotación humana, con revisión posterior obligatoria dado que no hay métricas publicadas.
- Investigación en PEFT comparada: reproducir experimentos que comparen VeRA frente a LoRA y QLoRA con la misma base y el mismo presupuesto de datos, aprovechando que el nombre del repositorio sugiere un barrido de porcentajes (1 % a 40 %).
- Detección de contradicciones en moderación de contenido: identificar afirmaciones mutuamente excluyentes en hilos de conversación en inglés o hindi como señal auxiliar para revisión humana.
- Evaluación de robustez multilingüe: estudiar la degradación de un adaptador entrenado en dos idiomas cuando se aplica a pares de frases en otros idiomas que el modelo base sí cubre (español, francés, alemán, portugués, italiano, tailandés).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye el apartado de evaluación con los marcadores `[More Information Needed]` sin rellenar, y no se ha localizado ninguna publicación, tabla comparativa ni métrica (accuracy de XNLI, MMLU, HumanEval, GSM8K u otras) asociada a este repositorio.

## Requisitos de hardware

- Los pesos del adaptador suman 0,2 GB, pero la inferencia requiere cargar Llama-3.2-3B completo: aproximadamente 6,4 GB en fp16/bf16 solo para pesos, más la caché KV.
- Estimación orientativa de VRAM para inferencia: en torno a 7-8 GB en fp16 con contextos cortos en NLI; alrededor de 3,5-4 GB en cuantización de 8 bits; en torno a 2,5-3 GB en cuantización de 4 bits. Estas cifras son estimaciones a partir del tamaño del modelo base, no mediciones de este adaptador.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 o L40S para despliegues concurrentes con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para desarrollo e inferencia con holgura; RTX 3060 12 GB, RTX 4070 (12 GB) o RTX 4060 Ti 16 GB para inferencia con cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más si se cuantiza el modelo base; con 16 GB o más puede ejecutarse en fp16 con secuencias moderadas.
- Opciones de despliegue: transformers + peft (ruta natural, ya que el repositorio se publica como adaptador PEFT); vLLM o TGI con soporte de adaptadores LoRA (la compatibilidad específica con VeRA debe verificarse); llama.cpp u Ollama solo tras fusionar el adaptador con el modelo base y convertir el resultado a GGUF, ya que estos motores no cargan adaptadores PEFT directamente.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (VeRA sobre Llama-3.2-3B, XNLI EN/HI) | 3.210 M (base) + adaptador de tamano no disponible | 128.000 tokens (base) | No disponible | No disponible para el adaptador; Llama 3.2 Community License en la base | HuggingFace, 0 descargas y 0 likes |
| Adaptador LoRA/QLoRA sobre Llama-3.2-3B | 3.210 M (base) + adaptador | 128.000 tokens (base) | No disponible | Depende de cada repositorio | Amplia disponibilidad en HuggingFace |
| XLM-RoBERTa large ajustado en XNLI | 559 M (referencia externa) | 512 tokens | No disponible | MIT (modelo base) | Amplia disponibilidad en HuggingFace |
| mDeBERTa-v3-base ajustado en XNLI | 279 M (referencia externa) | 512 tokens | No disponible | MIT (modelo base) | Amplia disponibilidad en HuggingFace |

No se dispone de comparaciones de rendimiento publicadas. Las filas de modelos alternativos se incluyen como referencia estructural: los codificadores tipo XLM-R y mDeBERTa siguen siendo la opción habitual para NLI multilingüe por coste y latencia, mientras que un adaptador sobre un modelo generativo de 3.000 millones de parámetros ofrece más flexibilidad pero un coste de inferencia notablemente superior.

## Limitaciones y advertencias

- Model card vacía: todos los campos (autoría, datos, hiperparámetros, uso previsto, evaluación) conservan los marcadores de plantilla `[More Information Needed]`. No hay documentación verificable sobre el entrenamiento.
- Sin evaluación publicada: se desconoce la precisión del adaptador en XNLI o en cualquier otra tarea. No debería desplegarse sin una validación propia previa.
- Licencia no declarada para el adaptador: cualquier uso comercial debe resolverse primero, teniendo en cuenta además las condiciones de la Llama 3.2 Community License del modelo base y sus restricciones (cláusulas de uso aceptable, obligación de atribución y de nombrado).
- Tarea y alcance restringidos: si el adaptador se entrenó para NLI de tres clases, usarlo para generación abierta, agentes o tool calling no es un uso previsto y producirá resultados poco fiables.
- Riesgo de alucinación: al apoyarse en un modelo generativo de 3.000 millones de parámetros, puede producir justificaciones plausibles pero incorrectas si se le pide explicar sus etiquetas; conviene tratarlo como clasificador y no como fuente de verdad.
- Sesgos: hereda los sesgos de los datos de preentrenamiento de Llama 3.2 y los del corpus de ajuste, que no ha sido auditado. No hay análisis de sesgo por género, religión, casta u otras dimensiones, relevantes en el contexto hindi.
- Cobertura lingüística incierta: el nombre indica inglés e hindi, pero no hay confirmación ni evaluación por idioma; el rendimiento fuera de esos dos idiomas es impredecible.
- Trazabilidad limitada: 0 descargas y 0 likes, autor sin historial verificable en el repositorio, y fecha de creación registrada como 2026-09-21, posterior a la fecha de consulta habitual, lo que apunta a un artefacto de investigación sin mantenimiento.
- Reproducibilidad: sin semillas, sin versión del dataset, sin particiones y sin código de entrenamiento, no es posible reproducir el adaptador. Solo se declara la versión de PEFT (0.17.1).
- Compatibilidad: el soporte de adaptadores VeRA en motores de inferencia de alto rendimiento (vLLM, TGI, TensorRT-LLM) es menos común que el de LoRA; conviene verificar la ruta de carga antes de planificar un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_VeRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Referencia citada en la model card (Lacoste et al., 2019, sobre impacto ambiental, incluida como plantilla): https://arxiv.org/abs/1910.09700
- Licencia del modelo base Llama 3.2: https://www.llama.com/llama3_2/license/
- Documentación de PEFT: https://huggingface.co/docs/peft/index
- Referencias externas no citadas en la model card, aportadas como contexto de la tarea y del método (identificadores según conocimiento general, no verificados en la página del modelo): artículo de XNLI (arXiv:1809.05053) y artículo de VeRA (arXiv:2310.11454).
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, a su dataset o a su evaluación; los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación con este repositorio.
