# trongck/lab22-dpo-vn

## Resumen

`trongck/lab22-dpo-vn` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada a 4 bits del modelo Qwen2.5-3B de Alibaba. El adaptador fue desarrollado por el usuario `trongck` como parte de un ejercicio académico del VinUni AICB (AI Challenge Bootcamp), concretamente en el "Day 22 Track 3" dedicado al alineamiento con DPO/ORPO. El repositorio tiene un tamaño de 0.1 GB, lo que confirma que solo contiene los pesos del adaptador LoRA, no el modelo completo.

El modelo está diseñado para la generación de texto y se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning), lo que permite cargarlo sobre el modelo base cuantizado para realizar inferencia o continuar el entrenamiento. Aunque la model card está prácticamente vacía y no se especifican idiomas ni licencia, el nombre "vn" sugiere una orientación hacia el vietnamita, aunque no hay confirmación oficial. Su relevancia radica en ser un ejemplo práctico de alineación de modelos mediante DPO sobre una arquitectura eficiente y de pequeño tamaño, útil para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Qwen2.5-3B) |
| Parametros totales | no disponible (el adaptador LoRA tiene un numero reducido de parametros; el modelo base tiene 3.000 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B soporta 32.768 tokens, pero no se confirma si el adaptador la modifica) |
| Tipos de cuantizacion | El modelo base usa cuantizacion de 4 bits (bnb-4bit); el adaptador se distribuye en safetensors con precision fp32 o bf16 (no especificado) |
| Idiomas soportados | no disponible (el nombre sugiere vietnamita, pero no hay confirmacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de Qwen2.5-3B, un modelo de 3.000 millones de parametros con atencion por ventanas deslizantes y soporte para contexto largo. El entrenamiento se realizo mediante DPO (Direct Preference Optimization) utilizando la libreria TRL (Transformers Reinforcement Learning) y la herramienta Unsloth para optimizar el proceso. El modelo base fue cuantizado a 4 bits con bitsandbytes (bnb-4bit) para reducir el consumo de memoria durante el entrenamiento y la inferencia.

No se dispone de informacion sobre el dataset de preferencias utilizado, el numero de pasos de entrenamiento, los hiperparametros exactos (learning rate, batch size, etc.) ni el regimen de precision (fp16, bf16, etc.). El adaptador se entrena sobre un checkpoint SFT-mini, segun se menciona en resultados de busqueda relacionados con otros adaptadores de la misma serie (por ejemplo, `TunaMonsieur/lab22-dpo-vn`). La unica referencia tecnica adicional es el paper de Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citado en la model card pero sin datos concretos.

## Capacidades

- Generacion de texto: al ser un adaptador sobre Qwen2.5-3B, hereda las capacidades de generacion de texto del modelo base, incluyendo redaccion, resumen y respuesta a preguntas.
- Razonamiento y conocimiento general: el modelo base Qwen2.5-3B tiene capacidades de razonamiento y conocimiento enciclopedico, aunque limitadas por su tamano.
- Codigo y matematicas: Qwen2.5-3B es competente en tareas de programacion y calculo basico, capacidades que el adaptador no elimina.
- Multilingue: el modelo base soporta multiples idiomas, pero no se ha confirmado si el adaptador esta especializado en vietnamita o en otro idioma.
- Tool calling y agentes: no hay informacion especifica sobre si el adaptador habilita o mejora estas capacidades; el modelo base Qwen2.5-3B no incluye soporte nativo para tool calling en su version estandar.
- Alineacion con preferencias: el entrenamiento DPO busca alinear las respuestas con preferencias humanas, lo que puede mejorar la utilidad y reducir respuestas no deseadas, aunque no hay evaluaciones publicas que lo demuestren.

## Casos de uso

- Asistente conversacional ligero: el adaptador puede integrarse en aplicaciones de chat que requieran un modelo pequeno y eficiente, aprovechando la cuantizacion de 4 bits para ejecutarse en hardware modesto.
- Experimentacion academica: sirve como ejemplo didactico para estudiantes e investigadores que quieran estudiar el efecto del alineamiento DPO sobre un modelo base pequeno, comparando respuestas antes y despues del adaptador.
- Generacion de texto en vietnamita (si se confirma): si el adaptador esta especializado en vietnamita, podria usarse para traduccion, redaccion o resumen en ese idioma, aunque no hay evidencia publica.
- Prototipado rapido: al ser un adaptador PEFT, se puede cargar y descargar facilmente sobre el modelo base, permitiendo iterar rapidamente en entornos de desarrollo.
- Fine-tuning posterior: el adaptador puede servir como punto de partida para nuevos entrenamientos con otras tecnicas (SFT, ORPO, etc.) sobre la misma base.
- Evaluacion de DPO en recursos limitados: permite probar tecnicas de alineacion en GPUs de consumo (por ejemplo, RTX 3060 o similares) gracias a la cuantizacion y al bajo numero de parametros entrenables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador. Tampoco se han encontrado evaluaciones comparativas con otros adaptadores de la misma serie (codenopro, Huanvg02, etc.) en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 3B cuantizado a 4 bits, la inferencia puede ejecutarse con aproximadamente 2-4 GB de VRAM, dependiendo de la longitud de la secuencia y del framework utilizado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o GPUs de datacenter como A10 o T4. Para entrenamiento adicional, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPUs consumer modernas (RTX 20/30/40 series) gracias a la cuantizacion de 4 bits.
- Opciones de despliegue: se puede usar con PEFT y transformers para cargar el adaptador sobre el modelo base; tambien es compatible con vLLM, llama.cpp y Ollama si se fusionan los pesos o se convierte a GGUF, aunque no hay instrucciones oficiales.
- Latencia y throughput: no se dispone de mediciones publicas. En una GPU como RTX 3060, se espera una generacion de 20-40 tokens por segundo para un modelo de 3B cuantizado, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de datos comparativos publicos. Existen otros adaptadores con el mismo nombre base (`codenopro/lab22-dpo-vn`, `Huanvg02/lab22-dpo-vn`, `TunaMonsieur/lab22-dpo-vn`, `solar11781/lab22-dpo-vn`) que probablemente fueron entrenados con el mismo procedimiento y sobre el mismo modelo base, pero no hay informacion sobre diferencias en rendimiento o configuracion. Como alternativa de modelo completo, se podria comparar con Qwen2.5-3B sin adaptador, pero no hay benchmarks que cuantifiquen la mejora del DPO en este caso.

## Limitaciones y advertencias

- Sesgos conocidos: al no haber documentacion sobre el dataset de entrenamiento, no se pueden evaluar sesgos especificos. El modelo base Qwen2.5-3B puede presentar sesgos presentes en sus datos de preentrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados o de actualidad.
- Limitaciones de contexto e idioma: no se ha confirmado el idioma objetivo; si el adaptador esta especializado en vietnamita, su rendimiento en otros idiomas puede degradarse.
- Restricciones de licencia: la licencia no esta especificada, lo que impide conocer si el uso comercial esta permitido. Se recomienda contactar al autor antes de usar el modelo en produccion.
- Falta de evaluacion: no hay benchmarks ni evaluaciones de calidad, por lo que el rendimiento real es desconocido. No es recomendable para aplicaciones criticas sin una validacion previa.
- Dependencia del modelo base: el adaptador requiere el modelo base `unsloth/Qwen2.5-3B-bnb-4bit` para funcionar; no es un modelo autonomo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trongck/lab22-dpo-vn
- Adaptador similar (codenopro): https://huggingface.co/codenopro/lab22-dpo-vn
- Adaptador similar (Huanvg02): https://huggingface.co/Huanvg02/lab22-dpo-vn
- Adaptador similar (TunaMonsieur) con descripcion en FriendliAI: https://friendli.ai/models/TunaMonsieur/lab22-dpo-vn
- Adaptador similar (solar11781) en FriendliAI: https://friendli.ai/models/solar11781/lab22-dpo-vn
- Notebook de referencia del laboratorio (GitHub): https://github.com/DaoThang38/2A202600540-DaoTatThang-Day22/blob/main/colab/Lab22_DPO_T4.ipynb
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
