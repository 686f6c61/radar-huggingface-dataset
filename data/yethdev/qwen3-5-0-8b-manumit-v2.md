# yethdev/qwen3.5-0.8b-manumit-v2

## Resumen

El modelo `yethdev/qwen3.5-0.8b-manumit-v2` es una adaptacion del modelo Qwen3.5-0.8B de Alibaba Cloud, desarrollada por el usuario yethdev, que elimina los comportamientos de rechazo (refusals) del modelo original mediante la tecnica denominada "manumit". Esta tecnica identifica las direcciones en el flujo residual (residual stream) que codifican el rechazo y las proyecta fuera de los pesos, para despues "curar" el modelo con datos ordinarios y evitar que la ablacion degrade sus capacidades generales. El resultado es un modelo que responde a consultas que el modelo base rechazaria, manteniendo o incluso mejorando ligeramente su rendimiento en tareas de conocimiento general (MMLU-Pro).

Con 852 millones de parametros y un tamano de repositorio de 1,7 GB, se trata de un modelo ligero pensado para ejecutarse en hardware de consumo. Su licencia es MIT, aunque el modelo base conserva sus propios terminos. Es relevante para la comunidad de investigacion en seguridad y alineacion de IA, ya que permite estudiar los efectos de la eliminacion de capas de seguridad y analizar el comportamiento del modelo sin restricciones. No se especifica la longitud de contexto en la informacion disponible, ni los idiomas soportados, aunque al derivar de Qwen3.5 es probable que conserve capacidades multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (repositorio en safetensors FP16) |
| Idiomas soportados | no disponibles (probablemente multilingue por herencia del base) |
| Licencia | MIT (el modelo base Qwen3.5-0.8B mantiene sus propios terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer autoregresivo de 852M parametros entrenado por Alibaba Cloud. Sobre esta base, el autor aplica la tecnica "manumit" para eliminar el comportamiento de rechazo. Segun la model card, manumit localiza el subespacio del flujo residual que codifica el rechazo (no un unico vector, sino un subespacio completo) y lo proyecta fuera de los pesos del modelo. Posteriormente, el modelo se "cura" mediante un proceso de ajuste fino con datos ordinarios, de modo que la ablacion no degrade significativamente las capacidades generales. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset de curacion ni si se emplearon tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto sin rechazos: responde a consultas que el modelo base rechazaria, con una tasa de rechazo del 0,0% en AdvBench y JailbreakBench.
- Mantiene (y mejora ligeramente) el rendimiento en conocimiento general: MMLU-Pro 15,2% frente al 12,3% del base.
- Capacidades de conversacion y generacion de texto generico heredadas del modelo base.
- El tag `image-text-to-text` sugiere una posible capacidad multimodal (entrada de imagenes), pero no esta documentada en la model card y no se proporcionan ejemplos de uso.
- No se documenta soporte para tool calling, function calling, agentes ni razonamiento multi-paso explicito.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: permite estudiar que tipo de contenido rechaza un modelo y como se comporta sin esas restricciones, util para evaluar la eficacia de las capas de seguridad.
- Analisis de robustez de modelos: se puede usar para probar sistemas de moderacion o filtros de contenido, identificando huecos en las politicas de seguridad.
- Generacion de contenido creativo sin censura: para proyectos de ficcion, escritura experimental o simulaciones que requieran libertades tematicas, siempre bajo responsabilidad legal.
- Educacion y divulgacion: como ejemplo practico de tecnicas de ablacion de direcciones en modelos de lenguaje, para cursos de interpretabilidad.
- Desarrollo de sistemas de guardia (guard models): sirve como modelo de prueba para entrenar clasificadores que detecten respuestas no deseadas.
- Evaluacion comparativa de modelos abliterated: permite comparar metodologias de eliminacion de rechazos y su impacto en capacidades generales.

## Benchmarks y rendimiento

La model card proporciona los siguientes datos, medidos por el autor:

| Metrica | Este modelo | Base Qwen3.5-0.8B |
|---|---|---|
| Tasa de rechazo en AdvBench | 0,0% | alta |
| Tasa de rechazo en JailbreakBench | 0,0% | alta |
| MMLU-Pro (n=500) | 15,2% | 12,3% |

No se han publicado resultados adicionales en la informacion disponible. Las mediciones de MMLU-Pro se realizaron con n=500, lo que puede diferir de la metodologia estandar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GB en precision FP16 (852M parametros x 2 bytes). En cuantizacion de 8 bits o 4 bits, el consumo seria menor (0,9 GB y 0,5 GB respectivamente), aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1660, RTX 2060, RTX 3060 o superiores. Tambien puede ejecutarse en CPU con suficiente RAM.
- Opciones de despliegue: compatible con la libreria Transformers de HuggingFace (como se muestra en el ejemplo de uso), y puede convertirse a GGUF para su uso con llama.cpp o Ollama. Tambien es compatible con vLLM o TGI para inferencia optimizada en servidores.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de este tamano, en una GPU moderna se esperan velocidades de decodificacion de decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Refusals |
|---|---|---|---|---|---|
| yethdev/qwen3.5-0.8b-manumit-v2 | 852M | no disponible | 15,2% | MIT | eliminados |
| Qwen/Qwen3.5-0.8B (base) | 852M | no disponible | 12,3% | terminos propios | presentes |
| Otros modelos abliterated | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos abliterated comparables en el mismo rango de parametros. El modelo base es la referencia directa para evaluar el impacto de la tecnica manumit.

## Limitaciones y advertencias

- El modelo no tiene capa de seguridad ni modelo guardia: puede generar contenido danino, ilegal o eticamente problematico. El usuario es el unico responsable del uso que haga del mismo y debe cumplir la legislacion vigente.
- La licencia MIT del modelo derivado no exime del cumplimiento de los terminos del modelo base Qwen3.5-0.8B, que pueden imponer restricciones adicionales.
- No se documentan sesgos especificos, pero al derivar de Qwen3.5 es probable que herede sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede inventar informacion, especialmente en dominios especializados.
- La longitud de contexto no esta especificada; se recomienda verificar la del modelo base antes de usarlo con contextos largos.
- La capacidad multimodal sugerida por el tag `image-text-to-text` no esta verificada y podria no estar operativa en este derivado.
- Para uso en produccion, es imprescindible implementar filtros de contenido externos y realizar pruebas exhaustivas de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yethdev/qwen3.5-0.8b-manumit-v2
- Version anterior v1: https://huggingface.co/yethdev/qwen3.5-0.8b-manumit-v1
- LLM Explorer (ficha del v1): https://llm-explorer.com/model/yethdev%2Fqwen3.5-0.8b-manumit-v1,4pCe604ksQy5vXBfcJAaRU
- FriendliAI (pagina del v1): https://friendli.ai/models/yethdev/qwen3.5-0.8b-manumit-v1
- Repositorio del modelo base en Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_5_0_8b
