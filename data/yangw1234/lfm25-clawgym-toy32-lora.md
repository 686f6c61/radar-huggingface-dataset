# yangw1234/lfm25-clawgym-toy32-lora

## Resumen

El modelo `yangw1234/lfm25-clawgym-toy32-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `LiquidAI/LFM2.5-2.6B`, un modelo de lenguaje de 2.600 millones de parámetros desarrollado por Liquid AI. El adaptador ha sido creado por el usuario yangw1234 y subido a Hugging Face el 19 de agosto de 2026. Según la información disponible, el entrenamiento se realizó con la librería Unsloth, que acelera el proceso de ajuste fino, y el repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo.

La denominación "clawg-toy32" sugiere una relación con el framework ClawGym, un proyecto de código abierto del RUC AI Box para sintetizar datos y entrenar agentes personales estilo "Claw" (asistentes que operan en espacios de trabajo locales y con estado). Aunque no hay documentación oficial en la model card sobre las tareas específicas del adaptador, todo indica que se trata de un ajuste LoRA orientado a capacidades de agente (tool calling, razonamiento multi-paso) sobre el modelo base. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

Dado que la información publicada es mínima (solo la model card y los tags), esta ficha se basa en los datos disponibles y marca como "no disponible" todo aquello que no se ha especificado explícitamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `LiquidAI/LFM2.5-2.6B` (modelo base de 2,6B parámetros) |
| Parametros totales | No disponible (el adaptador pesa 0,2 GB en disco, pero el número de parámetros del LoRA no se indica) |
| Parametros activos | No disponible (LoRA no es MoE, no aplica) |
| Longitud de contexto | No disponible (heredada del modelo base, pero no se especifica) |
| Tipos de cuantizacion | No disponible (no se mencionan cuantizaciones predefinidas) |
| Idiomas soportados | Inglés (tag `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (según el tag `safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `LFM2.5-2.6B`, un modelo de lenguaje pequeño de Liquid AI. La arquitectura del modelo base no se describe en la información proporcionada; Liquid AI es conocida por sus arquitecturas de estados líquidos (Liquid State Machines) o redes de estados lineales, pero no hay confirmación en los datos disponibles. El adaptador fue entrenado con Unsloth, una biblioteca que optimiza el fine-tuning de modelos de lenguaje, logrando un entrenamiento 2 veces más rápido que el convencional. No se detalla el conjunto de datos de entrenamiento, ni si se aplicó RLHF o DPO. El nombre "clawg-toy32" sugiere que se trata de un experimento pequeño (toy) con el framework ClawGym, probablemente con 32 pasos o 32 ejemplos, pero no se confirma.

## Capacidades

- Generación de texto y razonamiento general (heredadas del modelo base, aunque no se especifican).
- Posible soporte de tool calling / function calling, inferido del contexto de ClawGym (agentes personales que operan en entornos locales), pero no está documentado en la model card.
- Capacidades multilingües: solo inglés (tag `en`).
- No se mencionan capacidades de visión, audio o modo de pensamiento extendido.

## Casos de uso

- Automatización de tareas de escritorio (agentes tipo "Claw"): el nombre y la relación con ClawGym sugieren que el adaptador podría utilizarse para entrenar agentes que gestionan archivos, abren aplicaciones o interactúan con el sistema operativo en un entorno local. Sin embargo, no hay documentación que lo confirme.
- Experimentación con fine-tuning LoRA sobre modelos pequeños: como es un adaptador de 0,2 GB, sirve para probar técnicas de adaptación sobre LFM2.5 sin necesidad de un GPU grande.
- Investigación en agentes personales: el framework ClawGym proporciona un entorno para sintetizar datos y evaluar agentes, por lo que este adaptador podría ser un modelo de referencia en esos experimentos.
- Aplicaciones educativas: dado su tamaño reducido y licencia abierta, puede usarse en cursos o tutoriales sobre fine-tuning de modelos de lenguaje.
- Prototipado rápido: al ser un LoRA pequeño, se puede cargar en entornos de desarrollo para probar el comportamiento del modelo base con nuevas instrucciones.
- Uso en pipelines de TGI (Text Generation Inference): el tag `text-generation-inference` indica que el adaptador puede desplegarse en entornos que soportan esta librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para este adaptador ni para su modelo base en la documentación consultada.

## Requisitos de hardware

- Al ser un adaptador LoRA, la VRAM necesaria es la del modelo base `LFM2.5-2.6B` más la del adaptador. Un modelo de 2.6B parámetros en FP16 requiere aproximadamente 5,2 GB de VRAM, y con cuantización a 4 bits puede bajar a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 3080) puede ejecutar el modelo base con el adaptador en FP16. Para mayor comodidad, una RTX 4090 o A10 permitiría un margen amplio.
- No se indican opciones de despliegue específicas, pero los tags incluyen `text-generation-inference`, lo que sugiere compatibilidad con el servidor TGI de Hugging Face. También se puede usar con vLLM, llama.cpp u Ollama si el modelo base es compatible.
- Latencia y throughput: no se proporcionan datos. Se estima que, al ser un modelo pequeño, la latencia es baja en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA comparables en la misma categoría. La categoría de agentes personales con modelos pequeños es emergente y no se conocen alternativas directas en el momento de la consulta. Se podría comparar con otros adaptadores LoRA sobre modelos de tamaño similar (por ejemplo, LoRA sobre Llama-3.2-3B o Qwen2.5-3B) pero no hay datos de rendimiento para este adaptador. Por tanto, no se ofrece comparativa.

## Limitaciones y advertencias

- El modelo no tiene documentación detallada de sus capacidades ni de sus limitaciones, por lo que no se puede garantizar su comportamiento en producción.
- La relación con ClawGym sugiere que está orientado a agentes en entornos locales, pero no se ha verificado que funcione correctamente fuera de esos escenarios.
- No se han evaluado sesgos ni riesgos de alucinación en este adaptador. Al ser un ajuste sobre un modelo base de 2.6B, la calidad de respuesta puede ser inferior a modelos más grandes.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrece garantía de soporte ni de exactitud.
- Solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- El adaptador se publicó con el nombre "toy32", lo que indica que es un experimento de prueba y no un modelo de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yangw1234/lfm25-clawgym-toy32-lora
- Repositorio del framework ClawGym: https://github.com/ClawGym/
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B (no verificado en la búsqueda, pero se deduce del campo `base_model`)
- Perfil del autor en GitHub: https://github.com/yangw1234
