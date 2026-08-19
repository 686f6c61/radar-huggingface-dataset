# tugot17/LFM2.5-1.2B-Instruct-DSpark-5L-GGUF

## Resumen

LFM2.5-1.2B-Instruct-DSpark-5L-GGUF es un modelo de borrador (draft model) diseñado para acelerar la inferencia del modelo principal LiquidAI/LFM2.5-1.2B-Instruct mediante decodificación especulativa DSpark/DFlash. Lo publica el usuario tugot17 en HuggingFace y se distribuye en formato GGUF para su uso con llama.cpp (rama principal, merge #25173). Este sidecar no es un modelo autónomo: se carga junto al target GGUF y comparte con él los embeddings y la cabeza de salida, aportando únicamente el drafter de 5 capas con cabezas Markov de bajo rango y de confianza.

El modelo base LFM2.5-1.2B-Instruct, desarrollado por Liquid AI, es un modelo híbrido de 1,17 mil millones de parámetros entrenado sobre 28 billones de tokens con refuerzo, optimizado para instrucción, uso de herramientas y tareas agénticas, con una ventana de contexto de 32.000 tokens. El drafter aquí descrito reduce la latencia de generación al proponer múltiples tokens por paso, manteniendo salidas idénticas a las del modelo original en modo greedy.

Relevante para equipos que despliegan LFM2.5 en entornos de producción o en dispositivos con recursos limitados, donde cada milisegundo de latencia cuenta. Su tamaño reducido (295,7 millones de parámetros) permite ejecutarlo en GPUs de consumo junto con el modelo principal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-style GQA block drafter (5 capas) con Markov head (rank 256) y confidence head, RoPE interleaved (GPT-J) |
| Parametros totales | 295.725.953 (safetensors) |
| Parametros activos | 295.725.953 (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo target: 32.000 tokens) |
| Tipos de cuantizacion | f16 (archivo `LFM2.5-1.2B-Instruct-DSpark-5L-draft-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El drafter es un modelo de 5 capas con atención por grupos de consultas (GQA) estilo Qwen3, diseñado específicamente para el esquema de decodificación especulativa DSpark/DFlash. Incorpora una cabeza de transición Markov de bajo rango (rank 256) que predice la siguiente secuencia de tokens basándose en el contexto, y una cabeza de confianza que evalúa la probabilidad de aceptación de cada token propuesto. El bloque de borrador genera 7 tokens por paso (un ancla más seis propuestas) y utiliza una rotación posicional interleaved (GPT-J).

No se dispone de detalles públicos sobre el entrenamiento del drafter, pero al ser un sidecar del modelo LFM2.5-1.2B-Instruct, se presume que fue entrenado para imitar las distribuciones de salida del modelo principal. El modelo principal, según la documentación de Liquid AI y Unsloth, fue entrenado sobre 28 billones de tokens con un pipeline que incluye aprendizaje por refuerzo (RL), lo que le confiere capacidades de razonamiento y seguimiento de instrucciones. El drafter no añade capacidades nuevas, solo acelera la inferencia.

## Capacidades

- Decodificación especulativa DSpark/DFlash: genera múltiples tokens candidatos por paso, reduciendo el número de llamadas al modelo principal.
- Compatibilidad con llama.cpp (rama principal): integrado en el merge #25173, se activa con `--spec-type draft-dspark`.
- Compartición de pesos: los embeddings y la cabeza de salida se toman del modelo target, lo que minimiza el coste de memoria adicional.
- Salidas idénticas al modelo principal en modo greedy: garantiza que los resultados no se alteran respecto a la generación sin drafter.
- Seguimiento de métricas: el campo `timings` de la respuesta incluye `draft_n` y `draft_n_accepted` para monitorizar la tasa de aceptación.
- Sin capacidades propias de generación autónoma: requiere el modelo target para funcionar.

## Casos de uso

- Inferencia de baja latencia en producción: el drafter reduce el tiempo por token en servicios de chat o agentes que usan LFM2.5-1.2B-Instruct, permitiendo responder más rápido a los usuarios sin cambiar el modelo.
- Despliegue en dispositivos edge: al combinar un modelo de 1,2B con un drafter de 295M, el conjunto cabe en GPUs de consumo (p. ej., RTX 3060 con cuantización), habilitando asistentes conversacionales en local.
- Agentes con tool calling: en pipelines agénticos donde cada llamada al modelo suma latencia, la aceleración especulativa reduce el tiempo total de razonamiento multi-paso.
- Servidores de chat con alta concurrencia: al disminuir el tiempo de generación por petición, se aumenta el throughput del servidor (llama-server) sin necesidad de más GPUs.
- Evaluación y ajuste de hiperparámetros: el seguimiento de `draft_n_accepted` permite calibrar el tamaño de bloque y los umbrales de aceptación para cada carga de trabajo.
- Investigación en decodificación especulativa: sirve como ejemplo de implementación de un drafter DSpark con cabezas Markov de bajo rango, útil para estudiar la eficiencia de este enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este drafter en la información disponible. El modelo principal LFM2.5-1.2B-Instruct reporta buen rendimiento en tareas de instrucción y tool use según Liquid AI, pero no se incluyen cifras concretas en las fuentes consultadas. Se recomienda consultar la documentación oficial de Liquid AI para datos comparativos del modelo base.

## Requisitos de hardware

- VRAM estimada: el drafter en f16 ocupa aproximadamente 0,6 GB (295,7M parámetros × 2 bytes). Junto con el modelo target en f16 (~2,4 GB para 1,2B), el conjunto requiere unos 3 GB de VRAM sin cuantizar. Con cuantización del target (p. ej., Q4_K_M) el total baja a ~2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, GTX 1080 Ti) puede ejecutar el conjunto con cuantización. Para f16 completo se recomienda 6 GB o más.
- Compatibilidad con consumer GPUs: sí, es viable en GPUs de gama media y alta de consumo.
- Opciones de despliegue: llama.cpp (llama-server) con los flags `--spec-type draft-dspark`, `--spec-draft-n-max 8`, `--spec-draft-n-min 0`, `-fa on` y `-ngl 99`. También es compatible con cualquier frontend que use llama.cpp (Ollama, LM Studio, etc.) si soporta DSpark.
- Latencia y throughput: no se dispone de mediciones publicadas, pero la mejora esperada es típica de la decodificación especulativa (entre 1,5x y 3x en throughput dependiendo de la tasa de aceptación).

## Comparativa con modelos similares

No se dispone de información sobre otros draft models DSpark comparables en el ecosistema de LFM2.5. Como referencia, se puede comparar con el enfoque clásico de decodificación especulativa sin drafter (p. ej., usando un modelo pequeño independiente) o con drafter tipo Medusa/EAGLE, pero no hay datos públicos de rendimiento relativo para este caso concreto. La principal ventaja de este drafter es su diseño integrado con la arquitectura LFM2.5 y su compatibilidad nativa con llama.cpp.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo target `LiquidAI/LFM2.5-1.2B-Instruct-GGUF` cargado en memoria; sin él, no produce salidas.
- Dependencia de la versión de llama.cpp: el soporte DSpark/DFlash solo está disponible en la rama principal (merge #25173); versiones estables anteriores pueden no incluirlo.
- Licencia no especificada: la model card no indica licencia, lo que puede generar incertidumbre legal para uso comercial. Se recomienda consultar la licencia del modelo base de Liquid AI (marcada como "other" en HuggingFace).
- Idiomas no documentados: no se ha publicado qué idiomas soporta el drafter, aunque al compartir embeddings con el target, hereda las capacidades multilingües de LFM2.5.
- Riesgo de alucinación y sesgos: al ser un sidecar, no introduce sesgos adicionales, pero tampoco los mitiga; las limitaciones del modelo principal se mantienen.
- Sin garantía de mejora en todos los escenarios: la tasa de aceptación de tokens propuestos depende de la distribución de tareas; en cargas muy específicas la aceleración puede ser marginal.

## Enlaces

- Repositorio GGUF del drafter: https://huggingface.co/tugot17/LFM2.5-1.2B-Instruct-DSpark-5L-GGUF
- Modelo base safetensors: https://huggingface.co/tugot17/LFM2.5-1.2B-Instruct-DSpark-5L
- Modelo target GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Documentación de Liquid AI sobre LFM2.5-1.2B-Instruct: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Guía de Unsloth para LFM2.5: https://unsloth.ai/docs/models/tutorials/lfm2.5
- Página de LM Studio del modelo: https://lmstudio.ai/models/liquid/lfm2.5-1.2b
