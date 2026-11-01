# Yad4o/skincare-assistant-lora

## Resumen

Skincare Assistant LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Yad4o sobre el modelo base Qwen/Qwen3-1.7B, un transformer causal de 1.700 millones de parametros desarrollado por Alibaba Qwen. El adaptador esta especializado en consultas informativas sobre cuidado de la piel y dermatologia, y se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors gestionados por la libreria PEFT.

El modelo resuelve un problema acotado: adaptar un LLM pequeno y de proposito general a un dominio vertical sanitario con un coste de entrenamiento minimo (una sola epoca, rango LoRA 16) y manteniendo el modelo base intacto. Es relevante como ejemplo de fine-tuning eficiente en dominios regulados, aunque su madurez es muy limitada: 25 descargas, ningun "like" y una model card que no reporta hardware de entrenamiento ni resultados de evaluacion.

La informacion disponible es escasa y proviene exclusivamente de la model card del autor. No hay datos publicados sobre benchmarks, composicion exacta del dataset, proceso de alineacion ni evaluacion clinica. Todo uso en produccion sanitaria requeriria validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Qwen3-1.7B) + adaptador LoRA |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables (r=16, alpha=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un modelo de lenguaje causal de tipo transformer decoder-only. La tecnica PEFT empleada es LoRA con rango 16 y alpha 32, aplicada sobre los modulos de atencion `q_proj`, `v_proj`, `k_proj` y `o_proj`. Esto implica que solo se entrenan las matrices de baja dimension inyectadas en las proyecciones de atencion, mientras el resto de pesos del modelo base permanece congelado.

El entrenamiento se realizo durante una sola epoca con un learning rate pico de aproximadamente 1,8e-4 y un batch size de 8. El dataset se compilo a partir de MedQuAD, SkinSAFE y abstracts de PubMed, segun declara el autor. No se reporta el numero de tokens de entrenamiento, la composicion exacta del dataset, el hardware utilizado ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio fine-tuning LoRA.

## Capacidades

- Generacion de texto conversacional en ingles sobre temas de cuidado de la piel y dermatologia.
- Respuesta a preguntas informativas sobre principios activos (por ejemplo, retinol), rutinas y productos.
- Formato de chat mediante plantilla de conversacion de Qwen (`apply_chat_template`).
- Soporte de conversaciones multi-turno a traves del formato de mensajes `role`/`content`.
- Capacidades generales heredadas del modelo base Qwen3-1.7B (razonamiento basico, codigo, matematicas), aunque no evaluadas tras el fine-tuning.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" especifico para este adaptador.

## Casos de uso

- Asistente informativo de skincare en ingles: el adaptador puede responder preguntas frecuentes sobre rutinas, ingredientes y tipos de piel, usando el formato de chat de Qwen y limitando las respuestas a caracter informativo con el disclaimer medico incluido en la model card.
- Prototipado rapido de chatbots verticales de salud: al ser un adaptador LoRA sobre un modelo de 1,7B, permite iterar sobre un dominio sanitario con recursos de GPU modestos y sin reentrenar el modelo base.
- Generacion de contenido educativo sobre dermatologia: util para redactar borradores de articulos o FAQ sobre principios activos, siempre con revision por un profesional sanitario antes de publicacion.
- Base para investigacion en fine-tuning PEFT: sirve como referencia reproducible de un pipeline LoRA (r=16, alpha=32, modulos de atencion) aplicado a un dominio medico concreto.
- Sistemas de triaje informativo no diagnostico: puede clasificar y orientar consultas generales de cuidado de la piel hacia recursos educativos, sin emitir diagnosticos.
- Despliegue en entornos con recursos limitados: al combinar un base de 1,7B con un adaptador pequeno, es viable ejecutarlo en GPUs de consumo para demos, pruebas internas o entornos de desarrollo.
- Comparacion de variantes: el autor publica una version optimizada de 0,8B (`Yad4o/skincare-assistant-optimized-lora`) para escenarios donde prima la latencia sobre la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas del dominio dermatologico, ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo base de 1,7B en fp16 se requiere aproximadamente 3,4 GB solo para pesos, mas memoria para KV cache y activaciones; en cuantizacion de 8 bits o 4 bits el consumo baja de forma significativa, pero el adaptador no documenta cuantizaciones probadas.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo base cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090, y en GPUs de datacenter como A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas en fp16, y en GPUs con 4-6 GB si se cuantiza el modelo base.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), vLLM, TGI, llama.cpp u Ollama fusionando previamente el adaptador con el modelo base (no documentado por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yad4o/skincare-assistant-lora | 1,7B (base) + LoRA | No disponible | Apache 2.0 | HuggingFace, 25 descargas | Adaptador especializado en skincare |
| Yad4o/skincare-assistant-optimized-lora | 0,8B (base) + LoRA | No disponible | No disponible en la informacion | HuggingFace | Version mas ligera y rapida segun el autor |
| Qwen/Qwen3-1.7B | 1,7B | No disponible en la informacion | No disponible en la informacion | HuggingFace | Modelo base sin especializar |
| Modelos medicos genericos (p. ej. adaptadores sobre Llama o Mistral) | Variable | Variable | Variable | HuggingFace | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el modelo es solo informativo y no sustituye el consejo, diagnostico o tratamiento medico profesional.
- Riesgo de alucinacion e inexactitudes: la model card reconoce explicitamente que puede producir informacion incorrecta.
- No ha sido probado en todos los tipos de piel, segun declara el autor.
- Entrenado unicamente en ingles; no soporta castellano ni otros idiomas de forma fiable.
- Entrenamiento de una sola epoca sobre un dataset compilado de fuentes heterogeneas (MedQuAD, SkinSAFE, PubMed), sin evaluacion publicada de calidad ni de seguridad clinica.
- Ausencia de datos sobre sesgos, composicion demografica del dataset y validacion por profesionales sanitarios.
- Licencia Apache 2.0 permisiva para uso comercial, pero el uso en contextos sanitarios exige cumplimiento normativo adicional (por ejemplo, regulacion de dispositivos medicos y proteccion de datos) que el modelo no cubre.
- Madurez muy baja: 25 descargas, ningun "like" y actualizacion unica el mismo dia de creacion, lo que sugiere ausencia de mantenimiento o validacion comunitaria.
- No se documentan cuantizaciones probadas, latencias ni limites de contexto especificos del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yad4o/skincare-assistant-lora
- Variante optimizada de 0,8B: https://huggingface.co/Yad4o/skincare-assistant-optimized-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria PEFT: https://huggingface.co/docs/peft
- Dataset MedQuAD: no disponible enlace directo en la informacion proporcionada
- Dataset SkinSAFE: no disponible enlace directo en la informacion proporcionada
- PubMed: https://pubmed.ncbi.nlm.nih.gov/
