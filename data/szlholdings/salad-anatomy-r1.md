# SZLHOLDINGS/salad-anatomy-r1

## Resumen

salad-anatomy-r1 es un adaptador LoRA (Low-Rank Adaptation) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino ligero mediante PEFT que modifica un subconjunto reducido de pesos del transformer original de 1.700 millones de parametros de Qwen. El repositorio contiene la escalera completa de checkpoints (50, 100, 150 y 200 pasos) mas un directorio `final/`, lo que permite reproducir la evolucion del entrenamiento.

El adaptador se presenta explicitamente como un artefacto de entrenamiento en fase candidata, no como un modelo de produccion publicado. Segun la model card, el entrenamiento se ejecuto en contenedores GPU de Salad bajo una doctrina interna denominada "receipted-training" (fail-closed), con medicion de energia mediante NVML y Zeus y sin recuentos ni marcas de tiempo fabricados. Esta orientacion a la trazabilidad es el rasgo diferencial del proyecto frente a adaptadores LoRA convencionales.

Por su tamano (repo de 0,6 GB, coherente con pesos LoRA en safetensors), su licencia Apache 2.0 y su base Qwen3-1.7B, el artefacto es relevante para quienes quieran evaluar o reutilizar un ajuste ligero sobre un modelo pequeno con ventana de contexto amplia, siempre teniendo en cuenta su caracter experimental y la ausencia de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3-1.7B |
| Parametros totales | 1.700 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors (precision original del entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); repo de 0,6 GB con checkpoints 50/100/150/200 y `final/` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen3-1.7B, un transformer decoder-only denso de 1.700 millones de parametros. LoRA congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas, de modo que solo se entrena una fraccion minima de parametros. El repositorio incluye la escalera de checkpoints en los pasos 50, 100, 150 y 200, ademas del checkpoint final, lo que sugiere un entrenamiento corto y verificable por etapas.

La model card describe el proceso como parte del "governed Salad training program", ejecutado en contenedores GPU de Salad bajo una doctrina de "receipted-training" fail-closed: se generan recibos honestos de ejecucion, con medicion de energia mediante NVML y Zeus en modo de doble medicion, y se prohibe fabricar recuentos o marcas de tiempo. Los recibos de heartbeat y finalizacion se alojan en los logs del lane SZLHOLDINGS/frontier-54-runs. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras tecnicas de alineacion posteriores.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-1.7B.
- Razonamiento y respuesta a instrucciones segun las capacidades del base; el alcance exacto del ajuste LoRA no esta documentado.
- Soporte de tool calling y function calling: no confirmado para este adaptador; depende de si el ajuste preserva o modifica dichas capacidades del base.
- Razonamiento multi-paso y uso como agente: no documentado en la informacion disponible.
- Capacidades multilingues: la model card declara unicamente ingles (`language: en`).
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Trazabilidad de entrenamiento: checkpoints intermedios y recibos de ejecucion publicados en la organizacion SZLHOLDINGS.

## Casos de uso

- Evaluacion de adaptadores LoRA sobre modelos pequenos: el repositorio permite cargar cada checkpoint (50/100/150/200 y `final/`) y comparar la evolucion de las respuestas, util para estudiar dinamicas de ajuste fino con PEFT.
- Experimentacion academica con trazabilidad energetica: al estar asociado a recibos de energia medidos con NVML y Zeus, sirve como caso de estudio de entrenamiento reproducible y auditable en infraestructura cloud distribuida (Salad).
- Prototipado rapido en ingles sobre GPU de consumo: al partir de un base de 1.700 millones de parametros, el adaptador puede cargarse en tarjetas con 8-16 GB de VRAM y usarse para pruebas de generacion de texto sin infraestructura dedicada.
- Base para ajustes posteriores: al ser un adaptador PEFT con licencia Apache 2.0, puede combinarse o continuar entrenandose en pipelines propios de PEFT/transformers.
- Docencia y formacion en MLOps: la estructura de checkpoints por pasos y los recibos de ejecucion facilitan explicar el ciclo de vida de un entrenamiento gobernado.
- Investigacion sobre gobernanza de modelos: el enfoque "fail-closed receipted-training" puede analizarse como patron de auditoria aplicado a entrenamiento de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un base de 1.700 millones de parametros, en FP16 requiere aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits en torno a 1,7 GB y en 4 bits alrededor de 1 GB (estimaciones para el base; el adaptador anade un coste minimo).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en precision reducida o cuantizacion.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; exportacion a GGUF para llama.cpp u Ollama; vLLM y TGI si se fusiona el adaptador con el base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salad-anatomy-r1 | 1,7 B (base) + adaptador LoRA | no disponible | Apache 2.0 | safetensors (PEFT) | Artefacto candidato, sin benchmarks publicados |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base sin ajuste; referencia directa |
| Adaptadores LoRA genericos sobre Qwen3-1.7B | 1,7 B (base) + LoRA | depende del base | variable | safetensors (PEFT) | Comparables en tamano y enfoque; rendimiento no documentado de forma publica en esta ficha |

## Limitaciones y advertencias

- Artefacto en fase candidata: la propia model card indica que no es un modelo de produccion publicado; no debe desplegarse en entornos criticos sin evaluacion propia.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras pruebas, por lo que el rendimiento real del ajuste es desconocido.
- Idioma limitado: la model card declara solo ingles; el comportamiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluaciones de fidelidad publicadas.
- Sesgos: no documentados; el adaptador hereda los sesgos del base Qwen3-1.7B y del dataset de ajuste, que no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B y de los datos de entrenamiento no publicados.
- Documentacion incompleta: faltan datos sobre composicion del dataset, tokens de entrenamiento, hiperparametros LoRA (rango, alpha, capas objetivo) y proceso de alineacion.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-anatomy-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Lane de ejecucion (recibos y logs): https://huggingface.co/SZLHOLDINGS/frontier-54-runs
