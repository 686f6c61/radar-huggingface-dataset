# SSTalha/Fashion_PHI_1-5

## Resumen

Fashion_PHI_1-5 es un ajuste fino (fine-tuning) mediante LoRA del modelo microsoft/phi-1_5, publicado por el usuario SSTalha en Hugging Face. El objetivo declarado es especializar el modelo base en recomendaciones de moda y combinaciones de ropa, respondiendo a consultas en formato QA y chat sobre qué prendas combinar en distintos contextos. El modelo base, phi-1_5, es un transformer decoder-only de 1.300 millones de parámetros desarrollado por Microsoft, entrenado originalmente con un foco marcado en código y razonamiento matemático.

La relevancia de esta ficha es acotada: se trata de un adaptador PEFT (LoRA) de nicho, con 5 descargas y 0 likes en el momento de la consulta, y una model card muy escasa que reutiliza en gran parte el texto del modelo original. No se documentan datos de entrenamiento del ajuste, hiperparámetros, composición del dataset de moda ni resultados de evaluación. El repositorio ocupa 5,7 GB, coherente con un checkpoint completo o con el adaptador más los pesos base.

El modelo se distribuye bajo licencia MIT y solo declara soporte de inglés. Su utilidad práctica se limita a prototipos de asistentes de moda en inglés; no debe considerarse un modelo de propósito general ni un sustituto de phi-1_5 para tareas de código o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: microsoft/phi-1_5), ajuste mediante PEFT/LoRA |
| Parametros totales | 1.300 millones (modelo base phi-1_5); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (heredada de phi-1_5; no confirmada en la model card del ajuste) |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) y pesos PyTorch; libreria peft |
| Tamano del repositorio | 5,7 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2024-04-24 |

## Arquitectura y entrenamiento

El modelo base phi-1_5 es un transformer decoder-only de 1.300 millones de parámetros con atención causal estándar y un tokenizador propio de código (basado en el de StarCoder), entrenado por Microsoft con un dataset de aproximadamente 150.000 millones de tokens de texto "de libro de texto" y ejercicios sintéticos orientados a código. Sobre esa base, este repositorio aplica un ajuste PEFT con la etiqueta `mixformer-sequential` y `custom_code`, lo que implica que la carga requiere `trust_remote_code=True`.

No se dispone de información sobre el dataset de ajuste (volumen, procedencia, composición), la configuración de LoRA (rango, alpha, capas objetivo), el número de pasos ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card no documenta ninguna innovación técnica propia más allá de la especialización temática. Tampoco se indica si el adaptador se fusionó con los pesos base, aunque el tamaño del repositorio (5,7 GB) sugiere que se incluyen pesos completos en lugar de solo el delta LoRA.

## Capacidades

- Generación de texto en inglés orientada a recomendaciones de moda: combinación de prendas, colores y estilos según contexto (por ejemplo, "outfit para salir en invierno con una bomber verde oliva").
- Respuesta en formato QA y chat con las etiquetas `<human>:` y `<assistant>:`.
- Especialización temática en moda masculina y femenina según los ejemplos de la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta modo "thinking", visión, audio ni otras capacidades especiales.
- El autor advierte que el modelo tiende a producir texto irrelevante después de la respuesta principal.

## Casos de uso

- Prototipo de asistente de moda conversacional: el modelo responde a preguntas del tipo "qué me pongo con X prenda" en inglés, usando el formato QA documentado. Adecuado para demos y pruebas de concepto, no para producción sin evaluación adicional.
- Generación de descripciones de outfits para catálogos: dado un conjunto de prendas, el modelo puede redactar combinaciones y justificaciones breves en inglés para fichas de producto.
- Chatbot de recomendación en tiendas online: integrado en un flujo conversacional multi-turno, aunque limitado por el contexto de 2.048 tokens del modelo base y por la falta de evaluación del ajuste.
- Asistente de estilismo para aplicaciones móviles: respuestas cortas y directas sobre colores y estilos, útiles como primer filtro antes de una recomendación personalizada más elaborada.
- Generación de contenido para blogs o redes de moda: borradores de consejos de estilo en inglés que un editor humano revisa y corrige.
- Experimentación académica con PEFT: sirve como ejemplo de ajuste LoRA de bajo coste sobre un modelo pequeño para una vertical concreta, útil para estudiar olvido catastrófico y especialización temática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2,6-3 GB para los pesos de 1.300 millones de parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones para el modelo base, no verificadas para este ajuste).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB de VRAM en fp16.
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este repositorio y requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SSTalha/Fashion_PHI_1-5 | 1.300 M (base) | 2.048 tokens (base) | MIT | Hugging Face, 5 descargas | Ajuste LoRA de nicho en moda, sin benchmarks |
| microsoft/phi-1_5 | 1.300 M | 2.048 tokens | MIT | Hugging Face, ampliamente usado | Modelo base original, foco en código y razonamiento |
| microsoft/phi-2 | 2.700 M | 2.048 tokens | MIT | Hugging Face | Sucesor con mejor rendimiento general y más parámetros |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | Hugging Face | Alternativa de tamaño similar para texto general |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste sobre phi-1_5, hereda los sesgos del dataset original de Microsoft, no evaluados en esta versión.
- Riesgo de alucinación: alto, especialmente fuera del dominio de moda; el autor reconoce que el modelo genera texto irrelevante tras la respuesta principal.
- Limitaciones de contexto e idioma: solo inglés declarado y contexto de 2.048 tokens heredado del modelo base, insuficiente para conversaciones largas o documentos extensos.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base phi-1_5 también es MIT; no obstante, la falta de evaluación del ajuste desaconseja su uso en producción sin validación propia.
- Caveats para producción: la model card es mínima, no hay evaluación cuantitativa, el número de descargas es muy bajo y la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- El autor indica que el modelo solo responde a consultas relacionadas con moda; su comportamiento fuera de ese dominio no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SSTalha/Fashion_PHI_1-5
- Repositorio relacionado (variante): https://huggingface.co/SSTalha/Fashion_Phi-1_5
- Modelo base: https://huggingface.co/microsoft/phi-1_5
