# vllm-project/Qwen3-0.6B-GPTQ-Int4

## Resumen

Qwen3-0.6B-GPTQ-Int4 es una versión cuantizada a 4 bits del modelo Qwen3-0.6B, el miembro más pequeño de la familia Qwen3 desarrollada por Alibaba Qwen. Esta variante concreta ha sido producida y publicada por el equipo de vLLM (vllm-project) como una copia del checkpoint original de JunHowie, con el objetivo de usarlo en sus pruebas de integración continua (CI) y reducir el riesgo de cadena de suministro. Se trata, por tanto, de un artefacto orientado a validación de infraestructura más que a un lanzamiento de modelo independiente.

El modelo base Qwen3-0.6B es un transformer causal denso de aproximadamente 596 millones de parámetros totales (0,44B sin contar embeddings), con 28 capas de atención y GQA con 16 cabezas de consulta y 8 de clave/valor. Su ventana de contexto es de 32.768 tokens y soporta conmutación entre modo "thinking" (razonamiento explícito) y modo no-thinking dentro del mismo modelo, además de capacidades de agentes y soporte declarado de más de 100 idiomas.

La cuantización GPTQ a Int4 con grupo de tamaño 128 y `desc_act=False` reduce el peso del repositorio a unos 0,6 GB, lo que permite desplegarlo en GPUs de consumo muy modestas y en entornos de CI sin requisitos de memoria significativos. Es relevante ahora porque demuestra el flujo de cuantización y despliegue con vLLM sobre la generación más reciente de modelos Qwen, y sirve como referencia práctica para pipelines de inferencia de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parametros totales | 596.049.920 (~0,6B); 0,44B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GPTQ Int4, group size 128, `desc_act=False` |
| Idiomas soportados | Más de 100 idiomas y dialectos (según model card del modelo base); idiomas concretos no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3-0.6B es un transformer causal denso con 28 capas, atención con GQA (16 cabezas de consulta, 8 de clave/valor) y una longitud de contexto de 32.768 tokens. Se entrenó en dos fases, preentrenamiento y postentrenamiento, según indica la model card del modelo original. Los detalles sobre volumen de tokens, composición del dataset y técnicas de alineación (RLHF, DPO u otras) no están disponibles en la información proporcionada para esta variante cuantizada.

La innovación principal del modelo base es la capacidad de alternar entre modo thinking y no-thinking dentro del mismo modelo mediante el parámetro `enable_thinking` en la plantilla de chat, lo que permite usar razonamiento extendido para matemáticas, código y lógica, o respuestas directas para diálogo general. La cuantización aplicada aquí es GPTQ a 4 bits con grupo de 128 y `desc_act=False`; según la model card, esta configuración mejora la eficiencia en tokens por segundo respecto a versiones cuantizadas anteriores. No se documentan en la información disponible técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y diálogo multi-turno con alineación a preferencias humanas, según la model card del modelo base.
- Razonamiento explícito en modo thinking para matemáticas, lógica y generación de código, con conmutación a modo no-thinking para respuestas rápidas.
- Capacidades de agente y uso de herramientas externas (tool calling / function calling) en ambos modos, según la model card.
- Razonamiento multi-paso orientado a tareas agénticas complejas.
- Instrucciones multilingües y traducción en más de 100 idiomas y dialectos (declarado para el modelo base).
- Escritura creativa, role-playing y seguimiento de instrucciones.
- No se declaran capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Validación de pipelines de inferencia en CI: el checkpoint se usa en las pruebas de integración continua de vLLM para verificar la carga y el servicio de modelos GPTQ Int4 con `vllm>=0.9.2`, gracias a su tamaño reducido (0,6 GB) y su licencia permisiva.
- Despliegue de bajo coste en GPUs de consumo: con cuantización Int4 cabe en GPUs con poca VRAM, lo que permite montar endpoints de generación de texto para prototipos y demos internas sin infraestructura dedicada.
- Clasificación y extracción de información en texto: su contexto de 32.768 tokens permite procesar documentos largos para tareas de resumen, etiquetado o extracción de entidades en lotes.
- Asistentes conversacionales ligeros: el modo no-thinking ofrece respuestas directas para chatbots de atención al cliente con conversaciones multi-turno, mientras que el modo thinking se reserva para consultas complejas.
- Generación de código asistida en entornos con recursos limitados: puede integrarse en editores o scripts de automatización para sugerencias de código y explicaciones, con la ventaja de su reducido consumo de memoria.
- Traducción y procesamiento multilingüe: el soporte declarado de más de 100 idiomas permite usarlo en pipelines de traducción automática o normalización de texto en varios idiomas.
- Pruebas de regresión de cuantización: sirve como referencia para comparar la calidad de salida entre el modelo original en precisión completa y la versión GPTQ Int4 en tareas de razonamiento y diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa aproximadamente 0,6 GB en GPTQ Int4; el consumo real en ejecución depende de la longitud de contexto y del tamaño de lote, pero debería situarse en el rango de 1 a 3 GB para contextos moderados (estimación, no dato oficial).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo; no se dispone de recomendaciones oficiales específicas para esta variante.
- Cabe en GPU de consumo: sí, por su tamaño reducido, incluyendo tarjetas de gama baja con suficiente VRAM.
- Opciones de despliegue: vLLM (`vllm>=0.9.2`, comando `vllm serve JunHowie/Qwen3-0.6B-GPTQ-Int4`), transformers con la versión más reciente (se requiere `transformers>=4.51.0` para evitar el error `KeyError: 'qwen3'`), y SGLang (`sglang>=0.4.6.post1`) para el modelo base. La model card del modelo base menciona también Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers para el modelo original, aunque la compatibilidad con este checkpoint GPTQ concreto no está confirmada en la información disponible.
- Latencia y throughput: no disponibles. La model card indica que la configuración con `desc_act=False` mejora los tokens por segundo respecto a cuantizaciones anteriores, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-GPTQ-Int4 (este) | ~0,6B | 32.768 | GPTQ Int4, group 128 | Apache 2.0 | Hugging Face (vllm-project) |
| Qwen/Qwen3-0.6B | ~0,6B | 32.768 | FP16/BF16 original | Apache 2.0 | Hugging Face (Qwen) |
| JunHowie/Qwen3-0.6B-GPTQ-Int4 | ~0,6B | 32.768 | GPTQ Int4, group 128 | Apache 2.0 | Hugging Face (cuenta personal) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre las tres es el formato de pesos y el mantenedor del repositorio; el modelo base en precisión completa ofrece mayor fidelidad numérica a costa de mayor tamaño.

## Limitaciones y advertencias

- La cuantización GPTQ Int4 puede introducir degradación de calidad respecto al modelo en precisión completa, especialmente en tareas de razonamiento y matemáticas; no se han publicado evaluaciones comparativas en la información disponible.
- La model card advierte de posibles repeticiones sin fin en la generación; recomienda ajustar los parámetros de muestreo y fijar `presence_penalty` a 1,5.
- Es un modelo de 0,6B parámetros: su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor tamaño, con mayor riesgo de alucinación en dominios especializados.
- El repositorio es una copia de un checkpoint de una cuenta personal mantenida por el equipo de vLLM para CI; no es un lanzamiento oficial de Qwen y puede no recibir mantenimiento a largo plazo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar la licencia del modelo base original enlazada en la model card antes de usarlo en producción.
- No se especifican los idiomas concretos soportados ni evaluaciones por idioma; el soporte multilingüe se declara a nivel de familia, no verificado para esta variante.
- Requiere `transformers>=4.51.0` o `vllm>=0.9.2`; versiones anteriores fallan al cargar la arquitectura Qwen3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-project/Qwen3-0.6B-GPTQ-Int4
- Checkpoint original: https://huggingface.co/JunHowie/Qwen3-0.6B-GPTQ-Int4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
