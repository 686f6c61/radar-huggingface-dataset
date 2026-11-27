# zaddyzaddy/i33-soro-dup

## Resumen

i33-soro-dup es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario zaddyzaddy. No se trata de un modelo entrenado desde cero, sino de un ajuste fino sobre el modelo base unsloth/llama-3-8b-bnb-4bit, que a su vez es una version cuantizada a 4 bits del conocido Meta Llama 3 de 8.000 millones de parametros. El repositorio contiene unicamente los pesos del adaptador en formato safetensors, con un total de 4.650.177.629 parametros reportados, lo que sugiere que el checkpoint incluye tanto el adaptador como los pesos del modelo base fusionados o empaquetados.

La relevancia de esta ficha es limitada desde el punto de vista practico: la model card es una plantilla generica sin rellenar, no hay informacion sobre el dataset de entrenamiento, la licencia, los idiomas soportados ni los resultados de evaluacion. El modelo tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026. A dia de hoy no existe documentacion tecnica que permita evaluar su calidad o su idoneidad para tareas concretas.

A pesar de la escasez de informacion, la ficha se completa a continuacion con los datos disponibles y se marcan explicitamente como "no disponible" aquellos campos que el autor no ha documentado. Se recomienda precaucion antes de usar este artefacto en cualquier entorno de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3 8B), con adaptador LoRA/PEFT |
| Parametros totales | 4.650.177.629 (reportado en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 8B soporta 8.192 tokens, pero el autor no lo confirma) |
| Tipos de cuantizacion | 8-bit (tag del repo); el base_model es bnb-4bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft 0.11.1 |
| Modelo base | unsloth/llama-3-8b-bnb-4bit |
| Tamano del repo | 5,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B, un transformer decoder-only con atencion multi-cabeza agrupada (GQA) y tokenizador BPE entrenado por Meta. Sobre esa base, el autor ha aplicado un ajuste fino con PEFT (Parameter-Efficient Fine-Tuning), probablemente mediante LoRA, aunque la model card no especifica el rango, el alpha, el dropout ni las capas objetivo del adaptador. El modelo base unsloth/llama-3-8b-bnb-4bit es una version cuantizada a 4 bits optimizada para entrenamiento e inferencia con las herramientas de Unsloth.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan hiperparametros como la tasa de aprendizaje, el numero de epocas o el regimen de precision (fp16, bf16, etc.). La unica referencia tecnica es el framework PEFT 0.11.1 y la cita generica al paper de Lacoste et al. (2019) sobre impacto ambiental, que aparece en la plantilla por defecto y no aporta informacion real sobre el entrenamiento.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Llama 3 8B, aunque no hay evidencia documentada del efecto del ajuste fino.
- Razonamiento y matematicas: presumiblemente similar al base, sin datos de evaluacion que lo confirmen.
- Generacion de codigo: no verificado en este adaptador.
- Tool calling / function calling: no documentado por el autor; el modelo base Llama 3 8B tiene soporte limitado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el modelo base Llama 3 8B esta entrenado mayoritariamente en ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion academica con PEFT: el adaptador puede cargarse sobre el modelo base para estudiar el efecto del ajuste fino, aunque sin model card es dificil interpretar los resultados.
- Pruebas de reproducibilidad de pipelines LoRA: util para validar flujos de trabajo con la libreria peft 0.11.1 y modelos cuantizados a 4 bits.
- Prototipado rapido en entornos con recursos limitados: al partir de una base cuantizada a 4 bits, el conjunto puede ejecutarse en GPUs de consumo, aunque el rendimiento real no esta verificado.
- Investigacion sobre artefactos de Hugging Face: caso de estudio sobre model cards incompletas y su impacto en la trazabilidad de modelos.
- Evaluacion comparativa de adaptadores: puede servir como punto de partida para comparar con otros LoRA sobre Llama 3 8B, siempre que se documenten las condiciones.
- Formacion y docencia: ejemplo practico de como NO documentar un modelo, util en cursos sobre buenas practicas de publicacion de artefactos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre Llama 3 8B cuantizado a 4 bits, se estima un consumo de entre 6 y 8 GB en 4-bit, y entre 10 y 16 GB en 8-bit o fp16 (estimacion basada en el modelo base, no confirmada por el autor).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para inferencia en fp16; RTX 3060 12 GB o superior para cuantizacion 4-bit.
- Cabe en GPU de consumo: si, probablemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantizacion 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (previa conversion a GGUF o carga del adaptador con PEFT).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zaddyzaddy/i33-soro-dup | 4,65 B (reportado) | no disponible | no disponible | Hugging Face, 0 descargas |
| unsloth/llama-3-8b-bnb-4bit | 8 B | 8.192 tokens | Llama 3 Community License | Hugging Face, ampliamente usado |
| meta-llama/Meta-Llama-3-8B | 8 B | 8.192 tokens | Llama 3 Community License | Hugging Face, oficial |
| Adaptadores LoRA genericos sobre Llama 3 8B | variable | 8.192 tokens | variable | Hugging Face, ecosistema amplio |

La comparativa se limita al modelo base y a la familia Llama 3, ya que no hay informacion suficiente para comparar con alternativas de la misma categoria (adaptadores LoRA especificos).

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre sesgos, riesgos, datos de entrenamiento ni evaluacion.
- Licencia no especificada: no se puede garantizar el uso comercial; ademas, hereda las restricciones de la Llama 3 Community License del modelo base.
- Riesgo de alucinacion: desconocido, pero presumiblemente similar al de Llama 3 8B, que alucina en tareas de conocimiento factual.
- Idiomas no documentados: probablemente limitado a ingles y lenguas europeas principales, sin garantias para castellano.
- Cero adopcion: sin descargas ni likes, no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026): posible artefacto de prueba o error de metadatos, lo que anade incertidumbre sobre su procedencia.
- Sin garantias de reproducibilidad: no se documentan hiperparametros ni dataset, por lo que no se puede replicar el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/zaddyzaddy/i33-soro-dup
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-bnb-4bit
- Paper de referencia citado en la plantilla: https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
