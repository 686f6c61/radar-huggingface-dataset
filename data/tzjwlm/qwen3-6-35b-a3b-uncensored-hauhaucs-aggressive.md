# tzjwlm/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una version modificada del modelo Qwen3.6-35B-A3B de Alibaba, publicada por el usuario HauhauCS y republicada en formato GGUF por tzjwlm para facilitar su ejecucion en CPU. Se trata de un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) con 35.000 millones de parametros totales y solo 3.000 millones activos por token, lo que lo hace notablemente eficiente para su tamano. La variante "uncensored" elimina los filtros de seguridad del modelo base, mientras que el sufijo "aggressive" sugiere un ajuste orientado a respuestas mas directas y sin restricciones.

El modelo base Qwen3.6-35B-A3B, desarrollado por Alibaba, es el hermano menor de Qwen3.5 y comparte su arquitectura de gated-delta-networks MoE con 256 expertos (8 enrutados mas 1 compartido). Ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, y capacidades de vision gracias a su proyector multimodal. Esta version especifica se distribuye en formato GGUF cuantizado (IQ3_M) junto con el proyector de vision, pensada para entornos con recursos limitados.

La relevancia de este modelo radica en combinar un rendimiento competitivo de un MoE de 35B con la posibilidad de ejecutarse en hardware modesto, ademas de ofrecer una alternativa sin censura para casos de uso que requieren respuestas sin restricciones. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con gated-delta-networks (256 expertos, 8 enrutados + 1 compartido) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 3.000 millones (aprox.) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | IQ3_M (15,4 GB) + mmproj f16 (0,9 GB) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (IQ3_M) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con gated-delta-networks, una innovacion que mejora la eficiencia del enrutamiento de expertos frente a los MoE tradicionales. Con 256 expertos totales, de los cuales 8 se activan por token mas un experto compartido, el modelo activa aproximadamente 3.000 millones de parametros por inferencia, lo que reduce drasticamente el coste computacional frente a un modelo denso de tamano equivalente. La ventana de contexto nativa de 262.144 tokens se puede extender hasta 1.010.000 mediante tecnicas de extrapolacion posicional.

El modelo incluye un proyector de vision (mmproj) que le permite procesar imagenes junto con texto, siguiendo el pipeline image-text-to-text. La variante "uncensored" y "aggressive" de HauhauCS es un fine-tuning del modelo base cuyo proceso de entrenamiento no se ha documentado publicamente en la informacion disponible. No se especifican los datos de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multilingue (ingles y chino) con respuestas sin filtros de seguridad.
- Procesamiento de imagenes gracias al proyector de vision, permitiendo tareas de image-text-to-text.
- Razonamiento multi-paso y soporte para tareas complejas gracias a la arquitectura MoE de 35B.
- Ventana de contexto muy amplia (262K nativa, hasta 1M extendida) para documentos largos y conversaciones extensas.
- Soporte de tool calling y function calling, heredado del modelo base Qwen3.6.
- Capacidad de ejecucion en CPU con cuantizacion IQ3_M, pensada para entornos sin GPU dedicada.
- Respuestas "agresivas" y sin censura, orientadas a usuarios que necesitan contenido sin restricciones.

## Casos de uso

- Analisis de documentos legales extensos: gracias a la ventana de contexto de 262K tokens, el modelo puede procesar contratos completos, sentencias judiciales o expedientes administrativos en una sola pasada, extrayendo clausulas relevantes y resumiendo puntos criticos sin perder informacion.
- Asistente de codigo en entornos sin GPU: la cuantizacion IQ3_M permite ejecutar el modelo en maquinas con 20-24 GB de RAM, facilitando la generacion y revision de codigo en portatiles o servidores CPU-only.
- Moderacion de contenido sin restricciones: la variante uncensored permite analizar y generar contenido que otros modelos rechazarian, util para investigacion academica sobre discurso ofensivo o para plataformas que necesitan respuestas sin filtros.
- Procesamiento de imagenes con descripcion detallada: el proyector de vision permite analizar capturas de pantalla, diagramas o fotografias y generar descripciones o respuestas basadas en el contenido visual.
- Chatbots de atencion al cliente en chino e ingles: el modelo puede mantener conversaciones multi-turno con contexto largo, gestionando historiales completos de interacciones sin perder el hilo.
- Investigacion sobre alineacion y seguridad: al ser una version sin censura, permite estudiar comportamientos del modelo sin restricciones, comparando respuestas con la version original para evaluar el impacto de los filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.6-35B-A3B cuenta con datos oficiales en su model card de Hugging Face, pero no se han proporcionado en el material de referencia. Se recomienda consultar la pagina del modelo base para obtener metricas de MMLU, HumanEval, GSM8K y otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantizacion IQ3_M (15,4 GB), se necesitan aproximadamente 16-20 GB de VRAM en GPU o 20-24 GB de RAM en CPU.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para ejecucion comoda. GPUs con 16 GB como la RTX 4080 pueden funcionar con cuantizaciones mas agresivas.
- Compatibilidad con consumer GPU: si, siempre que se disponga de al menos 16 GB de VRAM. La cuantizacion IQ3_M esta optimizada para entornos con poca memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (segun la model card). Tambien compatible con vLLM y TGI para el modelo base en formato safetensors.
- Latencia y throughput: no disponible. Al ser un MoE con solo 3B parametros activos, se espera una velocidad de generacion superior a un modelo denso de 35B, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K (1M ext.) | Apache 2.0 | safetensors |
| Qwen3.6-35B-A3B-Uncensored (este) | 35B | 3B | 262K (1M ext.) | Apache 2.0 | GGUF |
| Qwen3.5 (hermano mayor) | no disponible | no disponible | no disponible | Apache 2.0 | safetensors |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (MoE de 35B con 3B activos) en el material proporcionado. La principal diferencia frente al modelo base es la eliminacion de filtros de seguridad y la disponibilidad en formato GGUF cuantizado.

## Limitaciones y advertencias

- La variante "uncensored" elimina los filtros de seguridad del modelo base, lo que puede generar contenido ofensivo, ilegal o danino. No es adecuado para despliegues publicos sin supervision.
- El proceso de fine-tuning no esta documentado, por lo que se desconoce la calidad de los datos de entrenamiento y los posibles sesgos introducidos.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje, agravado por la ausencia de filtros que podrian mitigar respuestas incorrectas.
- Soporte limitado a ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantizacion IQ3_M puede degradar la calidad de las respuestas frente al modelo en precision completa, especialmente en tareas de razonamiento complejo.
- El modelo base tiene capacidades de vision, pero el proyector mmproj incluido es una version f16 que puede no estar optimizada para todas las tareas visuales.
- Aunque la licencia Apache 2.0 permite uso comercial, el caracter "uncensored" puede generar problemas legales o de reputacion en aplicaciones publicas.

## Enlaces

- Repositorio de esta version GGUF: https://huggingface.co/tzjwlm/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Repositorio original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Analisis en HackerNoon: https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context
- Benchmarks y velocidad: https://benchlm.ai/models/qwen3-6-35b-a3b
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B
