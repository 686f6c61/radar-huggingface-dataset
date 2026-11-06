# tsss1/gemma-3-lora-cm

## Resumen

`tsss1/gemma-3-lora-cm` es un ajuste fino (fine-tuning) de tipo LoRA sobre el modelo base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, una version cuantizada en 4 bits de Gemma 3 4B instructiva. Lo publica el usuario `tsss1` en Hugging Face con licencia Apache 2.0 y un unico idioma declarado, el ingles. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA (no con los pesos completos del modelo de 4 mil millones de parametros).

El modelo hereda la arquitectura, el tamano y la ventana de contexto de Gemma 3 4B, pero la model card no aporta detalles sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni los hiperparametros utilizados. El autor solo indica que el entrenamiento se realizo con Unsloth, lo que sugiere un flujo de trabajo de ajuste fino eficiente en memoria sobre GPU de consumo.

La relevancia de esta ficha es limitada: se trata de un experimento personal sin benchmarks publicados, sin demos y con cero descargas en el momento de la consulta. Resulta util como referencia para quien quiera reproducir un fine-tuning LoRA de Gemma 3 4B con Unsloth, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 4B); el artefacto publicado es un adaptador LoRA |
| Parametros totales | No disponible en la model card; el modelo base Gemma 3 4B tiene aproximadamente 4 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base (Gemma 3 4B soporta hasta 128 000 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | El modelo base esta cuantizado en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, que a su vez es una version de Gemma 3 4B instructiva cuantizada en 4 bits mediante bitsandbytes y optimizada por Unsloth. La arquitectura subyacente es la de Gemma 3: un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, aunque la model card no detalla estos aspectos ni los confirma explicitamente.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. La unica innovacion tecnica mencionada es el uso de Unsloth, que el autor describe como "2x faster" en el entrenamiento. El prefijo `cm` en el nombre del modelo no se explica en la model card.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Gemma 3 4B instructivo.
- Razonamiento y respuesta a instrucciones, segun las capacidades del modelo base.
- Generacion de codigo y matematicas basicas, segun el modelo base.
- Soporte de tool calling y function calling: no confirmado para este adaptador concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Gemma 3 es multilingue.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en esta ficha.

## Casos de uso

- Reproduccion de experimentos de fine-tuning: sirve como ejemplo de adaptador LoRA entrenado con Unsloth sobre Gemma 3 4B cuantizado, util para comparar hiperparametros y flujos de trabajo en entornos con GPU de consumo.
- Prototipado rapido de asistentes en ingles: el adaptador puede cargarse sobre el modelo base para probar respuestas especializadas en un dominio concreto, aunque se desconoce cual es ese dominio.
- Investigacion sobre eficiencia de entrenamiento: permite estudiar el impacto de LoRA y cuantizacion 4-bit en la calidad final del modelo.
- Base para un segundo ajuste fino: al ser un adaptador ligero (0,2 GB), puede combinarse o continuar entrenandose con otros datasets.
- Evaluacion comparativa de adaptadores: util para medir como un LoRA sin documentar afecta al rendimiento del modelo base en tareas estandar.
- Docencia y formacion: ejemplo practico de publicacion de un adaptador en Hugging Face con metadatos minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia, el modelo base Gemma 3 4B en 4 bits requiere aproximadamente 4-6 GB de VRAM, pero este dato no lo confirma el autor.
- GPU recomendadas: no disponible. Por el tamano del modelo base, cabria esperar GPUs de consumo como RTX 3060, 4060 o superiores, pero no hay confirmacion.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo base y la cuantizacion 4-bit, aunque no esta verificado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), Unsloth. No se mencionan vLLM, llama.cpp, Ollama ni TGI de forma explicita mas alla del tag.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tsss1/gemma-3-lora-cm | ~4B (base) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Adaptador LoRA sin benchmarks |
| google/gemma-3-4b-it | ~4B | Hasta 128k (segun documentacion de Google) | Gemma license | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | ~4B | Hasta 128k (heredado) | Apache 2.0 (según repo) | Hugging Face | Version cuantizada 4-bit del base, optimizada por Unsloth |
| meta-llama/Llama-3.2-3B-Instruct | ~3B | 128k | Llama 3.2 license | Hugging Face | Alternativa de tamano similar, con benchmarks publicados |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, los hiperparametros ni el objetivo del ajuste fino, lo que impide evaluar su calidad y sesgos.
- No hay benchmarks publicados, por lo que se desconoce si el adaptador mejora o degrada el rendimiento del modelo base.
- El idioma declarado es solo ingles; el uso en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente al modelo base Gemma 3 4B, no mitigado ni documentado por el autor.
- El modelo base esta cuantizado en 4 bits, lo que puede introducir perdida de precision adicional.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso real ni validacion por la comunidad.
- Aunque la licencia es Apache 2.0, el modelo base Gemma 3 tiene su propia licencia (Gemma license) que puede imponer restricciones adicionales al uso comercial; conviene revisarla antes de desplegar.
- El prefijo `cm` del nombre no esta explicado, lo que dificulta inferir el dominio de especializacion.

## Enlaces

- Hugging Face: https://huggingface.co/tsss1/gemma-3-lora-cm
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- Gemma 3 (Google): no disponible en la informacion proporcionada
- Paper de Gemma 3: no disponible en la informacion proporcionada
- Demo: no disponible
