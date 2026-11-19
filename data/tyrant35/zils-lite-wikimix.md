# tyrant35/zils-lite-wikimix

## Resumen

Zils-lite-wikimix es un modelo de decisión (decision-model) publicado por el usuario tyrant35 en Hugging Face. Se trata de un fine-tune mediante LoRA ya fusionada (merged) sobre el modelo base joamCriff123/zils-lite-l1117a, que el autor describe como un "soup-pool body" del ecosistema Zils, concretamente de la variante d3-lite. El entrenamiento se ha realizado sobre decisiones resueltas de "Zils Outcomes", un formato propietario del ecosistema Zils que no está documentado en la información disponible.

El modelo cuenta con 852.985.920 parámetros (aproximadamente 853 millones) según los pesos en safetensors, y el repositorio ocupa 1,7 GB. La licencia es Apache 2.0, lo que permite uso comercial y modificación. No se especifican arquitectura interna, longitud de contexto, idiomas soportados ni datos de entrenamiento en la model card.

La relevancia de este modelo es limitada fuera del ecosistema Zils: no hay benchmarks publicados, cero descargas y cero likes en el momento de la consulta, y la documentación es mínima. Resulta útil únicamente como referencia para quienes ya trabajen con la familia Zils d3-lite o quieran experimentar con el formato de decisiones Zils Outcomes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como "soup-pool body" del ecosistema Zils d3-lite) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El autor lo describe como un "soup-pool body" de la variante d3-lite del ecosistema Zils, lo que sugiere una técnica de model soup (promediado de pesos de varios checkpoints) aplicada al modelo base joamCriff123/zils-lite-l1117a. Sobre ese cuerpo se aplicó un fine-tune con LoRA que posteriormente se fusionó en los pesos finales (merged), dando lugar a un checkpoint único en safetensors de 1,7 GB.

El conjunto de entrenamiento son "resolved Zils Outcomes decisions", un formato específico del ecosistema Zils cuya composición, número de ejemplos y proceso de anotación no se documentan. No se indica si hubo RLHF, DPO ni qué volumen de tokens se utilizó. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y toma de decisiones en el formato Zils Outcomes, según la descripción del autor.
- Fine-tune orientado a "decision-model": se espera que produzca salidas estructuradas de decisión, aunque el formato exacto no está documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación con el ecosistema Zils: el modelo sirve para probar el formato de decisiones Zils Outcomes en pipelines internos de quienes ya utilicen la familia d3-lite, ya que es un fine-tune directo sobre su cuerpo actual.
- Punto de partida para nuevos fine-tunes: al estar bajo Apache 2.0 y publicarse en safetensors, puede reutilizarse como base para ajustes posteriores con LoRA sobre dominios específicos.
- Evaluación comparativa de model soups: útil para investigadores que estudien el efecto del promediado de pesos (soup-pool) frente a checkpoints individuales del mismo modelo base.
- Prototipado de clasificadores de decisión: con 853 millones de parámetros, puede desplegarse en una GPU consumer para experimentar con clasificación o generación de decisiones estructuradas.
- Reproducción de experimentos: el repositorio permite replicar el fine-tune sobre joamCriff123/zils-lite-l1117a si se dispone del dataset de decisiones Zils Outcomes.
- Docencia y estudio de técnicas de merging: sirve como ejemplo práctico de LoRA fusionada sobre un model soup en un caso real publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB de pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter como A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, con margen amplio, incluso en tarjetas de gama media.
- Opciones de despliegue: transformers con safetensors de forma nativa; para llama.cpp, Ollama o vLLM sería necesario convertir los pesos a los formatos correspondientes, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tyrant35/zils-lite-wikimix | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune LoRA fusionada sobre Zils d3-lite |
| joamCriff123/zils-lite-l1117a (modelo base) | no disponible | no disponible | no disponible | Hugging Face | Cuerpo original del soup-pool Zils d3-lite |
| Alternativas de ~1B parámetros (p. ej. familias tipo Llama, Qwen o Gemma de tamaño similar) | ~1B | variable | variable | Hugging Face | No se dispone de datos de rendimiento comparables para este modelo |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: la model card no especifica arquitectura, contexto, idiomas ni composición del dataset, lo que dificulta evaluar su idoneidad en producción.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de calidad, sesgos o robustez.
- Ecosistema cerrado: el formato "Zils Outcomes" no está documentado públicamente, por lo que su comportamiento fuera de ese ecosistema es impredecible.
- Riesgo de alucinación: no evaluado; al ser un modelo de 853 millones de parámetros, es esperable una capacidad limitada de razonamiento factual complejo.
- Idiomas: no se declaran idiomas soportados; no se puede asumir un buen rendimiento en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base joamCriff123/zils-lite-l1117a no declara licencia en la información disponible, lo que conviene verificar antes de un despliegue comercial.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin comunidad ni soporte asociado.
- Formato único: solo se publican pesos safetensors; no hay GGUF ni cuantizaciones listas para usar con llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-wikimix
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
