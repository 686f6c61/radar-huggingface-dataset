# SZLHOLDINGS/killinchu-r1

## Resumen

killinchu-r1 es un adaptador LoRA publicado por SZLHOLDINGS sobre el modelo base `unsloth/Qwen3.5-0.8B`. Se distribuye como un repositorio PEFT (no como un modelo completo), por lo que requiere cargar el modelo base y aplicar el adaptador para poder utilizarlo. Segun los tags del repositorio, el entrenamiento se realizo mediante SFT (supervised fine-tuning) con las librerias TRL y Unsloth, y el objetivo declarado es la generacion de texto conversacional.

El modelo base pertenece a la familia Qwen3.5 en su variante mas pequena, con aproximadamente 0,8 mil millones de parametros. Esto lo situa en la categoria de modelos ultraligeros, pensados para inferencia en hardware modesto o incluso en CPU. El adaptador hereda las caracteristicas del modelo base (arquitectura transformer, tokenizador y ventana de contexto), pero la model card no documenta ninguno de estos datos de forma explicita.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, la model card es una plantilla sin rellenar (todos los campos aparecen como "[More Information Needed]") y no se publican datos de entrenamiento, evaluacion ni licencia. Se trata, por tanto, de un experimento de fine-tuning personal mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base Qwen3.5-0.8B) |
| Parametros totales | No disponible (modelo base de ~0,8B; el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no documentada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base `unsloth/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen3.5. El adaptador introduce matrices de baja jerarquia en determinadas capas del modelo base, que se suman a los pesos originales en tiempo de inferencia. El repositorio declara PEFT 0.22.0 como version de framework.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) segun los tags del repositorio, utilizando TRL y Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la configuracion de hiperparametros (rango LoRA, alpha, dropout, learning rate, epocas) ni si hubo etapas posteriores de alineacion como RLHF o DPO. La model card no aporta informacion sobre el procedimiento de entrenamiento ni sobre innovaciones tecnicas.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` sugiere un ajuste orientado a dialogos multi-turno.
- Fine-tuning supervisado: el adaptador ha sido entrenado con SFT, lo que en principio mejora la adherencia al formato de instrucciones respecto al modelo base.
- Capacidades heredadas del modelo base Qwen3.5-0.8B: no documentadas en la model card; se desconoce si conserva razonamiento, generacion de codigo, matematicas o capacidades multilingues.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado conversacional en local: al ser un adaptador sobre un modelo de ~0,8B, puede cargarse en un portatil o en una GPU de gama baja para experimentar con un chatbot ajustado sin depender de APIs externas.
- Investigacion sobre fine-tuning eficiente: sirve como ejemplo practico de un pipeline SFT con Unsloth + TRL + PEFT, util para quien quiera replicar el flujo de entrenamiento de adaptadores LoRA sobre modelos pequenos.
- Evaluacion comparativa de adaptadores: al compartir modelo base con otros adaptadores de la comunidad, permite estudiar el efecto del SFT sobre el comportamiento del modelo base en tareas de dialogo.
- Pruebas de integracion con PEFT y Transformers: util para validar flujos de carga de adaptadores (`PeftModel.from_pretrained`) en pipelines propios antes de invertir en modelos mayores.
- Generacion de texto de baja latencia en CPU: un modelo de ~0,8B cuantizado a 4 bits puede ejecutarse en CPU con latencias aceptables para tareas de respuesta corta, aunque el rendimiento real de este adaptador no esta documentado.
- Base para fine-tuning posterior: el adaptador puede servir como punto de partida (o de comparacion) para nuevos ajustes sobre el mismo modelo base en dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~0,8B ocupa aproximadamente 1,6 GB en fp16 y alrededor de 0,5-0,6 GB en cuantizacion de 4 bits. El adaptador LoRA anade una cantidad marginal de memoria (tipicamente decenas de MB, no especificado).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 (GTX 1650, RTX 3050, T4). Para cuantizacion 4 bits basta con GPUs integradas o incluso CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs de portatil de gama baja.
- Opciones de despliegue: Transformers + PEFT (flujo nativo para adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF), vLLM (soporta adaptadores LoRA en algunos casos, aunque no esta documentado para este modelo), TGI (soporte de adaptadores variable).
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de ~0,8B, se espera un throughput alto y latencia baja en GPU, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/killinchu-r1 | ~0,8B (base) + LoRA | No disponible | No disponible | Hugging Face (0 descargas) | Adaptador SFT sobre Qwen3.5-0.8B; sin benchmarks ni model card completada |
| unsloth/Qwen3.5-0.8B (modelo base) | ~0,8B | No disponible | No disponible | Hugging Face | Modelo base sin ajuste; referencia directa para comparar el efecto del adaptador |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32K (segun documentacion de Qwen) | Apache 2.0 (segun documentacion de Qwen) | Hugging Face | Alternativa de tamano similar con licencia permisiva y benchmarks publicados |
| SmolLM2-1.7B-Instruct | ~1,7B | 8K (segun documentacion de Hugging Face) | Apache 2.0 (segun documentacion de Hugging Face) | Hugging Face | Alternativa ligeramente mayor, con model card completa y evaluaciones publicadas |

## Limitaciones y advertencias

- Model card vacia: todos los campos de la plantilla aparecen como "[More Information Needed]"; no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. Ademas, la licencia del adaptador no puede ser mas permisiva que la del modelo base Qwen3.5-0.8B, cuya licencia tampoco se documenta en este repositorio.
- Sin benchmarks: no hay evidencia publicada de que el adaptador mejore al modelo base en ninguna tarea concreta.
- Riesgo de alucinacion: inherente a los modelos de ~0,8B, que tienen capacidad limitada de razonamiento y factualidad; el SFT no corrige esta limitacion estructural.
- Sesgos: no documentados; el adaptador hereda los sesgos del modelo base y del dataset de SFT, que se desconoce.
- Idiomas: no declarados; se desconoce si el ajuste conserva el multilingusimo del modelo base o lo ha restringido a un idioma concreto.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Uso en produccion: no recomendado sin una evaluacion previa propia, dado que no hay documentacion tecnica ni resultados reproducibles.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-25, lo que puede indicar metadatos inconsistentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/killinchu-r1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- PEFT (libreria): https://github.com/huggingface/peft
- TRL (libreria): https://github.com/huggingface/trl
- Unsloth (libreria): https://github.com/unslothai/unsloth
- Paper citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
