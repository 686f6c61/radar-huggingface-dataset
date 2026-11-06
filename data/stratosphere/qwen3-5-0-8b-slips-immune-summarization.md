# stratosphere/qwen3.5-0.8b-slips-immune-summarization

## Resumen

`stratosphere/qwen3.5-0.8b-slips-immune-summarization` es un ajuste fino supervisado (SFT) del modelo base `unsloth/Qwen3.5-0.8B`, desarrollado por el grupo Stratosphere, especializado en traducir eventos tecnicos de seguridad de red generados por Slips IDS (StratosphereLinuxIPS) a resumenes legibles para humanos con evaluacion de severidad. Slips produce logs de alertas estructurados como DAG (grafos aciclicos dirigidos) que encadenan eventos de seguridad por IP origen y ventana temporal; este modelo convierte esa salida cruda en resumenes concisos agrupados por tipo de evento, con etiquetas de severidad (CRITICAL / HIGH / MEDIUM / LOW / INFO) y un desglose global.

El modelo cuenta con 873.438.784 parametros totales en el checkpoint completo (el modelo de lenguaje activo es de aproximadamente 0,75B, ya que el codificador visual del modelo base se conserva sin entrenar para mantener compatibilidad con la arquitectura Qwen3.5). Se distribuye en safetensors (BF16) y en tres cuantizaciones GGUF (Q4_K_M, Q5_K_M y Q8_0), con licencia Apache 2.0.

Su relevancia actual radica en que es la variante "small-device" del modelo `qwen2.5-1.5b-slips-immune-summarization`: mismo dataset de entrenamiento, mismo prompt y mismos hiperparametros, pero con la mitad de tamano, lo que permite ejecutarlo en dispositivos de borde como una Raspberry Pi 5 a aproximadamente un minuto por resumen de incidente, manteniendo una puntuacion equivalente al modelo de 1,5B bajo evaluacion LLM-as-judge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con codificador visual del modelo base conservado sin entrenar |
| Parametros totales | 873.438.784 (modelo de lenguaje activo ~0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la configuracion de ejemplo usa `-c 8192` en llama.cpp) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer decoder-only con un codificador visual que se mantiene intacto respecto al modelo base para que el checkpoint cargue como un Qwen3.5 estandar; `AutoModelForCausalLM` carga unicamente el modelo de lenguaje de aproximadamente 0,75B de parametros, y los ficheros GGUF contienen solo el modelo de lenguaje. El ajuste se realizo mediante SFT con LoRA (herramientas TRL y Unsloth) sobre el dataset `stratosphere/immune-summary-sft-dataset`.

La innovacion metodologica destacable es el uso de seleccion best-of-N para construir las respuestas de referencia: para cada incidente de entrenamiento se generaron respuestas candidatas con GPT-4o, GPT-4o-mini, Qwen2.5 3B y Qwen2.5 1.5B, y se selecciono como ground truth la respuesta con mayor puntuacion segun un juez LLM. El prompt de inferencia es un unico mensaje de usuario que combina las instrucciones y el DAG de Slips, con los metadatos del incidente extraidos de la cabecera del DAG; la plantilla de chat anade el system prompt por defecto de Qwen. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de resumenes de incidentes de seguridad de red a partir de logs DAG de Slips IDS, en lenguaje natural claro.
- Agrupacion de eventos identicos o muy similares (por ejemplo, 24 conexiones identicas se condensan en una sola linea de resumen).
- Asignacion de severidad por evento o grupo con cinco niveles: CRITICAL, HIGH, MEDIUM, LOW e INFO, con criterios definidos en el prompt.
- Calculo de un desglose global de severidad a partir de las evaluaciones individuales.
- Respeto estricto de un formato de salida estructurado (cabecera de incidente, lineas de evidencia con marcas temporales, total de eventos y desglose de severidad).
- Generacion de texto conversacional y text-generation estandar, heredada del modelo base.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no documentado en la informacion disponible para este ajuste.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: el checkpoint conserva el codificador visual del modelo base, pero no se documenta entrenamiento ni uso de vision en este ajuste.

## Casos de uso

- Monitorizacion de seguridad en dispositivos de borde: el modelo se ejecuta en una Raspberry Pi 5 con la cuantizacion Q4_K_M (529 MB) y genera un resumen por incidente en aproximadamente un minuto, lo que permite desplegar resumenes legibles de alertas de Slips en entornos con recursos limitados o sin conectividad a la nube.
- Triage automatizado de alertas en un SOC: integrado en el flujo de salida de Slips, convierte los DAG tecnicos en resumenes con severidad que un analista puede revisar rapidamente, priorizando los incidentes marcados como CRITICAL o HIGH frente a los INFO.
- Generacion de informes de incidentes para cumplimiento: el formato de salida estructurado (cabecera con IP origen, ventana temporal, nivel de amenaza y desglose de severidad) facilita el registro documental de eventos de red para auditorias.
- Filtrado y reduccion de ruido en logs: la agrupacion de eventos identicos o muy similares reduce el volumen de lineas que el analista debe leer, condensando cadenas repetitivas de conexiones en una sola entrada con su severidad agregada.
- Educacion y formacion en ciberseguridad: los resumenes en lenguaje llano permiten a estudiantes interpretar salidas reales de un IDS sin necesidad de dominar el formato DAG interno de Slips.
- Despliegue en entornos air-gapped: al ser un modelo pequeno con pesos GGUF y licencia Apache 2.0, puede ejecutarse localmente mediante llama.cpp en infraestructura aislada, sin dependencia de APIs externas, para el analisis de trafico sensible.
- Prototipado rapido de pipelines de resumen de seguridad: sirve como componente de bajo coste en pruebas de concepto antes de escalar a modelos mayores de la misma familia (por ejemplo, la variante de 1,5B).

## Benchmarks y rendimiento

La model card menciona una evaluacion LLM-as-judge en la que el modelo obtiene una puntuacion equivalente al modelo `qwen2.5-1.5b-slips-immune-summarization`, pero no se proporcionan los valores numericos de dicha evaluacion ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan aproximadamente 1,7 GB (873M parametros a 2 bytes); la cuantizacion Q4_K_M ocupa 529 MB, Q5_K_M 578 MB y Q8_0 812 MB, a los que hay que sumar la memoria de la cache KV segun el contexto configurado (por ejemplo, 8192 tokens).
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM puede alojar el modelo en BF16 o en cuantizaciones GGUF.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU pura.
- Despliegue en CPU: validado en Raspberry Pi 5 con llama.cpp, con aproximadamente un minuto por resumen de incidente.
- Opciones de despliegue: llama.cpp / llama-server (recomendado para local y edge), Transformers con `AutoModelForCausalLM` (requiere una version reciente con soporte Qwen3.5, probada con 5.17), y GGUF compatible con el ecosistema llama.cpp.
- Configuracion recomendada en CPU: `-c 8192 -n 1024 --temp 0 -fa off`; en la Raspberry Pi 5 es importante desactivar flash attention (`-fa off`), ya que con `-fa auto` llama.cpp la activa y ralentiza la generacion con prompts largos.
- Latencia y throughput: no se proporcionan cifras de tokens por segundo; solo el dato aproximado de un minuto por resumen en Raspberry Pi 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stratosphere/qwen3.5-0.8b-slips-immune-summarization | 873M (~0,75B LM) | No disponible | Resumen de incidentes Slips IDS | Apache 2.0 | Hugging Face, GGUF |
| stratosphere/qwen2.5-1.5b-slips-immune-summarization | 1,5B (aproximado) | No disponible | Resumen de incidentes Slips IDS | No disponible en la informacion | Hugging Face |
| unsloth/Qwen3.5-0.8B (modelo base) | 0,8B | No disponible | Modelo generalista multimodal | No disponible en la informacion | Hugging Face |

La variante de 0,8B comparte dataset, prompt e hiperparametros con la de 1,5B, y segun la model card obtiene una puntuacion equivalente bajo evaluacion LLM-as-judge con aproximadamente la mitad de tamano, lo que la hace preferible para despliegue en dispositivos de borde. Frente al modelo base, pierde generalidad pero gana especializacion en el formato de salida y en la terminologia de Slips.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Especializado en el formato DAG de Slips IDS; su rendimiento fuera de ese dominio o con otros formatos de logs de seguridad no esta documentado.
- Se ha observado un bucle de repeticion poco frecuente con las cuantizaciones Q4 y Q5; la model card recomienda Q8_0 (812 MB) para evitarlo cuando sea viable.
- Riesgo de alucinacion inherente a los modelos de lenguaje pequenos: puede inventar eventos, severidades o detalles no presentes en el DAG de entrada, por lo que los resumenes deben tratarse como asistencia y no como sustituto de la revision humana en decisiones criticas de seguridad.
- Las severidades asignadas son evaluaciones generadas por el modelo segun criterios del prompt, no verdades ground truth; pueden diferir de la clasificacion real del incidente.
- El checkpoint conserva el codificador visual del modelo base sin entrenar; no debe asumirse capacidad de vision util para esta tarea.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base `unsloth/Qwen3.5-0.8B` y del dataset de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente de su comportamiento en produccion.
- La longitud de contexto no esta documentada; el ejemplo de despliegue usa 8192 tokens, lo que limita el tamano maximo del DAG de entrada procesable en una sola pasada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stratosphere/qwen3.5-0.8b-slips-immune-summarization
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base usado para el ajuste (Unsloth): https://huggingface.co/unsloth/Qwen3.5-0.8B
- Variante de 1,5B de la misma familia: https://huggingface.co/stratosphere/qwen2.5-1.5b-slips-immune-summarization
- Dataset de entrenamiento: stratosphere/immune-summary-sft-dataset (referenciado en la model card)
- Repositorio de Slips IDS (StratosphereLinuxIPS): https://github.com/stratosphereips/StratosphereLinuxIPS
