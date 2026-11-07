# ulugbek2013/KhwarazmiAI-2.0

## Resumen

KhwarazmiAI 2.0 es un adaptador LoRA de tipo PEFT publicado por el usuario ulugbek2013 (bajo la marca ZAZU AI) que se aplica sobre el checkpoint cuantizado a 4 bits `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino supervisado (SFT) de bajo rango orientado a conversación profesional multilingüe, con enfasis declarado en ingles, uzbek, matematicas, razonamiento, programacion y seguimiento de instrucciones.

El adaptador tiene un tamano de repositorio de 0,3 GB y contiene 992 tensores finitos segun la model card. El entrenamiento se realizo con Unsloth y TRL sobre dos GPU Tesla T4 en Kaggle, con rango 8 y alpha 8 sobre modulos de atencion y MLP del modelo base, congelando las capas de vision. El contexto de entrenamiento fue de solo 512 tokens, lo que constituye una limitacion importante frente a la ventana nativa del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de ajuste fino economico (consumer/datacenter de gama baja) sobre un modelo grande cuantizado; por otro, advierte de que la licencia es "other" y que la mezcla de datasets incluye fuentes con terminos no comerciales, por lo que el uso queda restringido a investigacion y evaluacion salvo revision legal independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.8-27B (modelo base cuantizado a 4 bits con bitsandbytes) |
| Parametros totales | No disponible (adaptador de 0,3 GB; el modelo base Qwen3.8-27B no detalla parametros exactos en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 512 tokens en entrenamiento; el modelo base soporta contexto mayor pero no se especifica en la informacion disponible |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); adaptador en safetensors (precision no especificada) |
| Idiomas soportados | Ingles y uzbek declarados; multilingue segun tags; lista completa no disponible |
| Licencia | other (uso no comercial recomendado por el autor) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 y alpha 8 aplicado sobre los modulos de atencion y MLP del transformer Qwen3.8-27B, cargado en su version 4-bit de Unsloth. Las capas de vision del modelo base quedaron congeladas, de modo que el ajuste afecta unicamente a la parte linguistica. El entrenamiento se ejecuto con Unsloth y TRL, optimizador AdamW de 8 bits, scheduler coseno y tasa de aprendizaje 2e-5, durante una epoca completa con 4.100 ejemplos y 4.100 pasos de optimizador registrados. El contexto de entrenamiento se limito a 512 tokens y se valido que cada ejemplo renderizado no superase ese limite; las mascaras de respuesta (response-only) se verificaron en 4.100/4.100 casos.

La mezcla de datos consta de 13 fuentes curadas: `HuggingFaceH4/no_robots`, `tatsu-lab/alpaca`, `teknium/OpenHermes-2.5`, `HuggingFaceH4/ultrachat_200k`, `Open-Orca/OpenOrca`, `Anthropic/hh-rlhf`, `meta-math/MetaMathQA`, `openai/gsm8k`, `Modotte/CodeX-7M-Non-Thinking`, `microsoft/rStar-Coder`, `nvidia/Nemotron-SFT-SWE-v3`, `nvidia/OpenMathInstruct-2` y `behbudiy/alpaca-cleaned-uz`. No se menciona RLHF ni DPO; el proceso es SFT puro con mascara solo en la respuesta. La model card reporta validaciones de recarga limpia, identidad correcta, fluidez en uzbek, aritmetica y codigo Python compilable, ademas de una recheck con mayor presupuesto y una conversacion multi-turno de nueve turnos con 14/14 comprobaciones superadas.

## Capacidades

- Generacion de texto conversacional en ingles y uzbek con registro profesional.
- Razonamiento matematico y resolucion de problemas aritmeticos y algebraicos basicos (entrenado con GSM8K, MetaMathQA y OpenMathInstruct-2).
- Asistencia de programacion y generacion de codigo, incluyendo pruebas unitarias en Python ejecutables segun la validacion del autor.
- Seguimiento de instrucciones estructuradas y formato de respuesta.
- Traduccion y reescritura profesional entre ingles y uzbek.
- Expresion honesta de incertidumbre y rechazo seguro ante peticiones dañinas (entrenado con `Anthropic/hh-rlhf`).
- Memoria conversacional multi-turno dentro de la ventana de contexto.
- Soporte de plantilla de chat con parametro `reasoning_effort` (valores como "low") y separador `</think>`, heredado del modelo base.
- Capacidades de vision no disponibles en el adaptador (capas congeladas).

## Casos de uso

- Asistencia conversacional en uzbek para atencion al cliente: el adaptador mantiene fluidez en uzbek y puede gestionar dialogos multi-turno, aunque limitado a ventanas cortas por el contexto de entrenamiento de 512 tokens.
- Tutorizacion matematica: resolucion paso a paso de problemas de aritmetica y algebra, adecuado para entornos educativos en uzbek e ingles gracias al entrenamiento con GSM8K y MetaMathQA.
- Generacion de codigo Python en entornos de prototipado: el modelo produce codigo compilable y pruebas unitarias basicas, util para asistentes de IDE o generacion de snippets.
- Reescritura y redaccion profesional: transformacion de textos en registros formales, resumenes y adaptacion de tono, aprovechando el entrenamiento con `no_robots` y `alpaca`.
- Traduccion ingles-uzbek en documentacion tecnica o correspondencia: el adaptador conserva el multilingueismo del base y refuerza el uzbek con `behbudiy/alpaca-cleaned-uz`.
- Evaluacion de investigacion sobre SFT de bajo coste: caso de estudio para medir el impacto de LoRA r=8 sobre un modelo de 27B cuantizado con solo 4.100 ejemplos y 512 tokens de contexto.
- Filtrado de seguridad y rechazo controlado: el entrenamiento con `hh-rlhf` permite usar el modelo como capa de moderacion conversacional en prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta validaciones internas cualitativas: 4.100/4.100 mascaras correctas, recarga limpia, identidad correcta, aritmetica correcta, codigo Python compilable y una aceptacion multi-turno de 14/14 comprobaciones en nueve turnos. No se proporcionan puntuaciones numericas comparables con otros modelos.

## Requisitos de hardware

- El adaptador pesa 0,3 GB, pero requiere cargar el modelo base Qwen3.8-27B en 4 bits, lo que implica aproximadamente 14-16 GB de VRAM solo para los pesos cuantizados, mas overhead de activaciones y cache KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia comoda con contexto largo. En configuracion 4-bit puede intentarse en RTX 4090 (24 GB) con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 24 GB o RTX 3090 24 GB con cuantizacion 4-bit y contexto limitado; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) es ajustado y probablemente requiera offload a CPU.
- Opciones de despliegue: Unsloth (recomendado por el autor con `FastModel.from_pretrained`), transformers + PEFT, vLLM con soporte de adaptadores LoRA, llama.cpp/Ollama solo si se convierte el modelo base a GGUF y se fusiona el adaptador.
- Latencia y throughput estimados: no disponibles. El entrenamiento se realizo en dos Tesla T4, lo que sugiere que la inferencia en T4 sera lenta para un modelo de este tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KhwarazmiAI 2.0 | Adaptador sobre Qwen3.8-27B | 512 tokens en entrenamiento | other (no comercial) | safetensors (LoRA) | Ajuste SFT con 4.100 ejemplos, foco uzbek/ingles |
| KhwarazmiAI 1.0 | 31.4 B (segun su model card) | No disponible | No disponible | No disponible | Modelo anterior del mismo autor, descrito como "frontier-grade" |
| Qwen3.8-27B (base) | 27 B (segun nombre) | No disponible en la informacion | No disponible | safetensors, bnb-4bit | Modelo base sin ajuste; capacidades multilingues y de razonamiento originales |
| KhwarazmiAI 1.0-Adapter | Adaptador PEFT | No disponible | No disponible | safetensors | Version adaptador del modelo 1.0 del mismo autor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other" con terminos upstream potencialmente no comerciales: la model card indica que `HuggingFaceH4/no_robots` y `tatsu-lab/alpaca` llevan condiciones no comerciales, por lo que el uso comercial requiere revision legal independiente de todas las fuentes.
- Contexto de entrenamiento de solo 512 tokens: el adaptador puede degradarse en conversaciones largas o documentos extensos aunque el modelo base soporte ventanas mayores.
- Riesgo de alucinacion: el autor advierte explicitamente de posibles respuestas incorrectas, incompletas, sesgadas o desactualizadas; se debe verificar codigo, calculos e informacion medica/legal/financiera.
- Sesgos heredados del modelo base y de los datasets de ajuste (Alpaca, OpenHermes, OpenOrca, etc.), no auditados en la model card.
- Cobertura limitada de idiomas: solo ingles y uzbek estan declarados y validados; el resto de idiomas del base no se ha evaluado tras el ajuste.
- Capas de vision congeladas: el adaptador no mejora ni modifica las capacidades multimodales del base.
- Validacion cualitativa y no estandarizada: no hay benchmarks publicos reproducibles; las comprobaciones del autor son internas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema practicamente inexistente, sin issues ni discusiones de la comunidad.
- El modelo base referenciado (`Qwen3.8-27B`) no es un checkpoint oficial ampliamente conocido; conviene verificar su procedencia y licencia antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/ulugbek2013/KhwarazmiAI-2.0
- Modelo anterior 1.0: https://huggingface.co/ulugbek2013/KhwarazmiAI-1.0
- Adaptador 1.0: https://huggingface.co/ulugbek2013/KhwarazmiAI-1.0-Adapter
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL (framework de SFT): https://github.com/huggingface/trl
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
