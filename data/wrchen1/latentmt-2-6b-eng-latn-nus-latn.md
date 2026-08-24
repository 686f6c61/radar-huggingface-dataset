# wrchen1/LatentMT-2.6B-eng-latn-nus-latn

## Resumen

LatentMT-2.6B-eng-latn-nus-latn es un adaptador LoRA publicado por wrchen1 para el modelo base ByteDance/Ouro-2.6B-Thinking, orientado a la traducción automática del par inglés (eng_Latn) a nuer (nus_Latn). Forma parte del trabajo de investigación LatentMT: Machine Translation with Latent Reasoning, que introduce el primer estudio sistemático de modelos de lenguaje con razonamiento latente (LoopLMs) aplicados a traducción. En lugar de generar cadenas de pensamiento explícitas como tokens, el modelo invierte pasos recurrentes adicionales dentro de los estados ocultos, lo que permite mejorar la calidad de traducción sin aumentar el coste de decodificación.

El adaptador está diseñado para ser cargado sobre el modelo base de 2.6B parámetros mediante la librería PEFT, y según el paper, el enfoque logra un rendimiento comparable a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción que abarcan idiomas de alto, medio y bajo recursos. Este checkpoint concreto se centra en la dirección inglés-nuer, un par de idiomas de bajos recursos, lo que lo hace relevante para la investigación en traducción automática multilingüe y para aplicaciones que requieran modelos ligeros y eficientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre ByteDance/Ouro-2.6B-Thinking (modelo causal de 2.6B parámetros) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros; el modelo base tiene 2.6B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Ouro-2.6B-Thinking) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors o bin; el modelo base puede cuantizarse con bitsandbytes) |
| Idiomas soportados | Inglés (eng_Latn) y nuer (nus_Latn) para traducción |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors) o binario (adapter_model.bin) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje causal de 2.6B parámetros. La innovación principal de LatentMT es el uso de razonamiento latente: en lugar de generar tokens de razonamiento explícitos (como en cadenas de pensamiento), el modelo realiza pasos recurrentes adicionales dentro de sus estados ocultos. Esta técnica, propia de los LoopLMs, permite dedicar más cómputo a la generación sin aumentar la longitud de la secuencia de salida. El adaptador se entrena con un ajuste ligero (lightweight training) sobre el modelo base, y en este checkpoint se especifica una profundidad recurrente de 4 pasos.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni el método de alineación (RLHF, DPO, etc.). El paper menciona que el entrenamiento es ligero y que se evalúa en 32 direcciones de traducción, pero no se ofrecen más detalles en la model card.

## Capacidades

- Traducción automática del inglés al nuer (nus_Latn), un idioma de bajos recursos.
- Razonamiento latente: el modelo invierte pasos recurrentes internos en los estados ocultos, lo que mejora la calidad de traducción sin generar tokens de razonamiento visibles.
- Eficiencia computacional: al ser un adaptador sobre un modelo de 2.6B, es significativamente más ligero que modelos de 8-13B que ofrecen rendimiento similar.
- Compatible con el ecosistema Hugging Face Transformers y PEFT, lo que facilita su integración en pipelines existentes.
- No se han documentado capacidades de tool calling, visión, audio ni otras modalidades.

## Casos de uso

- Traducción de contenido en inglés a nuer para comunidades de habla nuer en Sudán del Sur y Etiopía, donde los recursos de traducción automática son escasos.
- Investigación en traducción automática de bajos recursos: el adaptador sirve como punto de partida para estudiar el impacto del razonamiento latente en pares de idiomas con pocos datos.
- Evaluación de métodos de razonamiento latente en modelos de lenguaje: permite comparar la calidad de traducción con modelos que usan cadenas de pensamiento explícitas.
- Prototipado de sistemas de traducción ligeros para entornos con recursos limitados, como dispositivos móviles o servidores sin GPUs de alta gama.
- Fine-tuning adicional sobre dominios específicos (por ejemplo, textos médicos o legales) partiendo del adaptador preentrenado.
- Integración en pipelines de generación de texto multilingüe donde se requiera traducción inglés-nuer como paso intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este adaptador en la información disponible. El paper LatentMT indica que el enfoque general logra un rendimiento comparable a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción, pero no se proporcionan cifras concretas para el par inglés-nuer en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el modelo base Ouro-2.6B-Thinking, que requiere aproximadamente 5.2 GB de VRAM en precisión fp16 (2.6B parámetros × 2 bytes).
- Con cuantización de 4 bits (bitsandbytes), el modelo base puede caber en GPUs con 4-6 GB de VRAM, como una RTX 3060 o RTX 4060.
- El adaptador en sí ocupa solo 0.1 GB, por lo que el almacenamiento adicional es mínimo.
- Para inferencia, se puede usar vLLM, TGI o llama.cpp si se convierte el modelo base a GGUF, aunque el adaptador LoRA requiere el formato de PEFT.
- La latencia dependerá de la profundidad recurrente (4 pasos) y del hardware; no se dispone de mediciones específicas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para el par inglés-nuer. El paper menciona que LatentMT supera a modelos de 3 a 5 veces más grandes, pero no se citan nombres concretos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador solo cubre la dirección inglés → nuer; no es multilingüe ni bidireccional.
- Es un checkpoint de investigación, no validado para producción; puede presentar errores de traducción, especialmente en dominios técnicos o coloquiales.
- Depende del modelo base Ouro-2.6B-Thinking, que debe cargarse con `trust_remote_code=True` y puede tener sus propias limitaciones y sesgos.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos culturales o de género presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (también Apache 2.0 según la model card).
- El razonamiento latente puede no ser compatible con todas las arquitecturas o frameworks; requiere configurar `total_ut_steps` y usar la versión correcta de Transformers (4.56.2) y PEFT.

## Enlaces

- [Hugging Face: wrchen1/LatentMT-2.6B-eng-latn-nus-latn](https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-nus-latn)
- [Paper en arXiv: LatentMT: Machine Translation with Latent Reasoning](https://arxiv.org/abs/2607.18618)
- [Versión HTML del paper](https://arxiv.org/html/2607.18618v1)
- [Adaptador similar para crh_Latn](https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-crh-latn)
- [Adaptador similar para bjn_Arab](https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-bjn-arab)
- [Modelo base: ByteDance/Ouro-2.6B-Thinking](https://huggingface.co/ByteDance/Ouro-2.6B-Thinking)
