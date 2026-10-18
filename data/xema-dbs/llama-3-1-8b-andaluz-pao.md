# xema-dbs/Llama-3.1-8B-Andaluz-PAO

## Resumen

xema-dbs/Llama-3.1-8B-Andaluz-PAO es un ajuste fino del modelo unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit, publicado por el usuario xema-dbs bajo licencia Apache 2.0. Se trata de un transformer decoder-only de 8.030.261.248 parámetros (8B) orientado a generación de texto y conversación, entrenado con Unsloth y la librería TRL de Hugging Face, según indica la model card. El nombre incluye «Andaluz», pero la tarjeta solo declara inglés y no documenta el conjunto de datos ni el proceso de entrenamiento.

El modelo es relevante como ejemplo de fine-tuning eficiente de Llama 3.1 8B Instruct con Unsloth, una herramienta que acelera el entrenamiento. Sin embargo, la documentación es mínima: no hay benchmarks, no se especifican tokens de entrenamiento, composición del dataset ni hiperparámetros, y el repositorio no registra descargas ni likes en el momento de la consulta. Para producción, conviene evaluarlo empíricamente antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), ajuste fino de Meta-Llama-3.1-8B-Instruct |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens |
| Tipos de cuantización | No disponible; el repositorio contiene safetensors de ~16,1 GB, compatible con pesos de 16 bits |
| Idiomas soportados | en (según la model card); no se declara español aunque el nombre incluya «Andaluz» |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Llama 3.1 de Meta: un transformer decoder-only con atención causal, diseñado para generación de texto autorregresiva. El ajuste fino parte de unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit, una versión cuantizada a 4 bits del modelo instructivo de 8B, y se ha entrenado con Unsloth y TRL. La model card indica que el entrenamiento fue «2x faster» gracias a Unsloth, pero no aporta detalles sobre el dataset, el número de tokens, la composición de los datos ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

No se documentan innovaciones técnicas propias del ajuste. El hecho de partir de una base cuantizada a 4 bits (bnb-4bit) puede introducir diferencias de calidad respecto a un fine-tuning sobre pesos completos, pero no hay evaluaciones publicadas que permitan cuantificarlo. Tampoco se especifican hiperparámetros, duración del entrenamiento ni método de empaquetado de secuencias.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, según la model card.
- Razonamiento, código y matemáticas: capacidades heredadas del modelo base Llama 3.1 8B Instruct, no evaluadas en este ajuste fino.
- Tool calling / function calling: el modelo base Llama 3.1 lo soporta; no verificado en este finetune.
- Agentes y razonamiento multi-paso: posible en teoría por herencia del base, sin datos que lo confirmen.
- Capacidades multilingües: la model card solo declara inglés; el base soporta varios idiomas, pero este ajuste no los declara.
- Sin visión, audio ni modo «thinking» explícito.
- Orientación conversacional y de generación de texto general.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: por su tamaño de 8B y licencia Apache 2.0 declarada, puede desplegarse en una GPU consumer para pruebas de concepto y validación de flujos multi-turno.
- Experimentación con recetas de fine-tuning: sirve como referencia para comparar el impacto de Unsloth y TRL frente al modelo base, especialmente en entornos con recursos limitados.
- Generación de texto y resumen en inglés: adecuado para pipelines de contenido con revisión humana, dado el riesgo de alucinación y la ausencia de benchmarks.
- Asistencia de código en local: el modelo base tiene capacidades de código; puede integrarse en editores o scripts, pero requiere evaluación específica antes de usarlo en producción.
- Atención al cliente automatizada: conversaciones multi-turno en inglés; al no documentarse la longitud de contexto real, conviene limitar las sesiones a ventanas cortas.
- Investigación académica: baseline para estudiar la degradación de calidad al hacer fine-tuning sobre una base cuantizada a 4 bits.
- Despliegue en hardware de gama media: tras convertir los pesos a GGUF, podría ejecutarse en llama.cpp u Ollama con cuantización de 4 bits, aunque el repositorio no incluye esos formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~16,1 GB solo para pesos; con caché KV y overhead, alrededor de 18-20 GB.
- VRAM estimada en 8 bits: ~8-9 GB.
- VRAM estimada en 4 bits: ~4-5 GB.
- GPU recomendadas para producción: NVIDIA A100 40 GB/80 GB, H100 80 GB.
- GPU consumer compatibles: RTX 4090 o RTX 3090 de 24 GB para FP16; RTX 4060 Ti de 16 GB o superiores para 8 bits y 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y Transformers. Para llama.cpp u Ollama es necesaria una conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xema-dbs/Llama-3.1-8B-Andaluz-PAO | 8,03B | No disponible (base: 128.000 tokens) | Apache 2.0 declarada | Hugging Face |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.000 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,62B | 128.000 tokens | Apache 2.0 | Hugging Face |

No hay datos de benchmarks del modelo analizado que permitan una comparación de rendimiento con estas alternativas.

## Limitaciones y advertencias

- Documentación mínima: no se especifican dataset, número de tokens, hiperparámetros ni método de alineación.
- Solo se declara inglés; el nombre «Andaluz» no está respaldado por la model card y no hay evidencia de soporte de español o de variedades andaluzas.
- Ausencia total de benchmarks: no se puede afirmar su calidad frente al modelo base ni frente a alternativas.
- El entrenamiento parte de una base cuantizada a 4 bits (bnb-4bit), lo que puede degradar el rendimiento respecto a un fine-tuning sobre pesos completos.
- Licencia: se declara Apache 2.0, pero al derivar de Llama 3.1 debe cumplirse la Llama 3.1 Community License de Meta; es necesario revisar la compatibilidad para uso comercial.
- Riesgo de alucinación y sesgos heredados del modelo base, sin evaluaciones específicas que los mitiguen.
- Longitud de contexto no documentada en este ajuste; no se debe asumir que conserva los 128.000 tokens del base.
- Cero descargas y cero likes en el momento de la consulta: escasa validación por parte de la comunidad.
- La fecha de creación indicada (2026-10-17) es posterior a la fecha actual; posible error en los metadatos.
- No se incluyen pesos en formato GGUF; para llama.cpp u Ollama hay que convertirlos y validar la calidad tras la cuantización.

## Enlaces

- [xema-dbs/Llama-3.1-8B-Andaluz-PAO en Hugging Face](https://huggingface.co/xema-dbs/Llama-3.1-8B-Andaluz-PAO)
- [Modelo base: unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Repositorio de TRL de Hugging Face](https://github.com/huggingface/trl)
