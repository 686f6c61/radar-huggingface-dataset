# wuhuaxiaohaixing/smollm3-pirate

## Resumen

Pirate SmolLM es un ajuste fino (fine-tuning) del modelo SmolLM3-3B de Hugging Face, publicado por el usuario wuhuaxiaohaixing. Se trata de un modelo de generacion de texto de 3.075.098.624 parametros (aproximadamente 3B) cuya unica modificacion respecto al modelo base es estilistica: responde imitando el habla de un pirata sin necesidad de system prompt. El ajuste se realizo con LoRA (r=16) mediante el `SFTTrainer` de TRL durante 2 epocas sobre el dataset `wuhuaxiaohaixing/pirate-instructions-400`, y posteriormente se fusionaron los pesos del adaptador en el modelo base.

El modelo hereda la arquitectura, la ventana de contexto y las capacidades del SmolLM3-3B original, por lo que su interes tecnico no reside en mejoras de rendimiento sino en ser un ejemplo reproducible de ajuste de estilo con recursos minimos: el autor indica que se entreno en una GPU T4 gratuita de Kaggle. Es relevante como caso practico de SFT ligero y como demostracion de que un cambio de estilo puede aplicarse sin system prompt, aunque con el coste de un dataset muy pequeno (400 ejemplos) y sin evaluacion cuantitativa publicada.

La licencia es Apache 2.0, el repo ocupa 6,2 GB en safetensors y el modelo esta etiquetado unicamente para ingles. No se han publicado resultados de benchmarks ni comparativas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de SmolLM3-3B; detalles de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base SmolLM3-3B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/otros no listadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 6,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM3-3B y aplica un ajuste fino supervisado (SFT) con LoRA de rango 16 mediante TRL `SFTTrainer` durante 2 epocas, tras lo cual el adaptador se fusiona en los pesos base. El dataset de entrenamiento es `wuhuaxiaohaixing/pirate-instructions-400`, compuesto por 400 ejemplos de instrucciones orientadas a inducir el estilo pirata. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo etapas de RLHF o DPO; el propio autor describe el resultado como un aprendizaje de "solo un estilo".

La innovacion tecnica destacable es de caracter practico: el entrenamiento se realizo en una GPU T4 gratuita de Kaggle, lo que demuestra la viabilidad de ajustes de estilo con LoRA sobre modelos de 3B en hardware de consumo. El adaptador se publica por separado en `wuhuaxiaohaixing/smollm3-pirate-lora`. No se documentan en la informacion proporcionada innovaciones de arquitectura como decodificacion especulativa o atencion lineal propias de este modelo.

## Capacidades

- Generacion de texto conversacional en ingles con estilo pirata por defecto, sin necesidad de system prompt.
- Razonamiento, codigo y matematicas: heredados del modelo base SmolLM3-3B, sin mejoras especificas documentadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para este ajuste.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidad especial: el ejemplo de la model card emplea el system prompt `/no_think`, lo que sugiere que el modelo base dispone de un modo de pensamiento (thinking mode) que puede desactivarse; el ajuste no documenta cambios sobre esta funcionalidad.
- Uso mediante `transformers` con el pipeline `text-generation` y formato de mensajes de chat.

## Casos de uso

- Demostracion educativa de fine-tuning con LoRA: el modelo sirve como ejemplo reproducible de SFT de estilo sobre un modelo de 3B entrenado en una T4 gratuita, util en tutoriales y cursos de ajuste fino.
- Prototipado de personajes conversacionales: permite construir rapidamente un chatbot con personalidad fija (pirata) sin ingenieria de prompts, integrable en demos y espacios de Hugging Face.
- Pruebas de evaluacion de estilo: util para experimentar con metricas de fidelidad estilistica y comparar el efecto de un dataset de 400 ejemplos frente al modelo base.
- Generacion de contenido creativo con tono caracteristico: redaccion de textos de ambientacion, guiones o respuestas con registro pirata para juegos, ficcion o material promocional.
- Base para experimentos de desaprendizaje de estilo: permite estudiar como revertir o modular un estilo aprendido mediante tecnicas de prompting o ajustes posteriores.
- Referencia para pipelines de fusion de adaptadores: el flujo LoRA mas merge documentado por el autor sirve como plantilla para integrar adaptadores en despliegues con `transformers`.
- Pruebas de regresion de herramientas: al ser un ajuste pequeno, puede usarse para validar pipelines de inferencia (transformers, endpoints compatibles) antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 12,3 GB para los 3.075.098.624 parametros, mas memoria para el contexto y activaciones.
- VRAM estimada en bf16/fp16: aproximadamente 6,2 GB de pesos, mas overhead de contexto (el repo ocupa 6,2 GB en safetensors).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 3,1 GB de pesos, mas overhead.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 1,6 GB de pesos, mas overhead; no se confirma en la informacion disponible que existan pesos cuantizados publicados.
- GPU recomendadas: el autor entreno en una T4 gratuita de Kaggle, lo que indica que la inferencia cabe en GPU de gama media; para produccion se recomiendan A100, H100 o L40S si se requiere throughput alto, aunque no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza; no se han publicado mediciones concretas.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), endpoints compatibles (etiqueta `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Pirate SmolLM (este modelo) | 3.075.098.624 | no disponible | en | apache-2.0 | Ajuste de estilo sobre SmolLM3-3B; sin benchmarks publicados |
| HuggingFaceTB/SmolLM3-3B | 3B (aproximadamente) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base; capacidades generales sin estilo pirata |
| SmolLM3-3B con prompting de estilo | 3B (aproximadamente) | no disponible | no disponible | no disponible | Alternativa sin reentrenamiento: obtener el estilo via system prompt en lugar de SFT |
| Otros ajustes LoRA de estilo sobre modelos de 3B | variable | no disponible | variable | variable | No se dispone de datos concretos en la informacion proporcionada |

## Limitaciones y advertencias

- El propio autor advierte que el modelo solo aprendio un estilo: los hechos que genera son tan fiables (o no) como los del modelo base de 3B, con riesgo de alucinacion.
- El dataset de entrenamiento es muy pequeno (400 ejemplos), lo que puede producir sobreajuste al estilo y degradar respuestas en tareas fuera del dominio conversacional.
- El modelo esta etiquetado solo para ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se han publicado evaluaciones cuantitativas (benchmarks, tasas de alucinacion, evaluaciones humanas), por lo que no hay evidencia objetiva de calidad.
- El estilo pirata por defecto puede ser inadecuado para aplicaciones profesionales, atencion al cliente o generacion de codigo en produccion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben respetarse las condiciones del modelo base SmolLM3-3B y verificar que el ajuste no introduce sesgos adicionales derivados del dataset.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se documentan en la informacion disponible los terminos exactos del modo `/no_think` ni su interaccion con el ajuste de estilo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wuhuaxiaohaixing/smollm3-pirate
- Adaptador LoRA: https://huggingface.co/wuhuaxiaohaixing/smollm3-pirate-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/wuhuaxiaohaixing/pirate-instructions-400
- Demo (Space): https://huggingface.co/spaces/wuhuaxiaohaixing/pirate-smollm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
