# vikram2026ind/svara-haryanvi-tts

## Resumen

Svara-TTS Haryanvi es un adaptador LoRA de rango 128 disenado para dotar de voz en dialecto haryanvi (bangru) al modelo base kenpath/svara-tts-v1, un sistema de sintesis de voz construido sobre Llama 3.2 3.3B y el codec neural discreto SNAC a 24 kHz. Lo desarrolla Vikram Nain (usuario vikram2026ind) y se publica bajo licencia Apache-2.0 con un peso de repositorio de 0,8 GB, de los cuales aproximadamente 743 MB corresponden a los pesos del adaptador.

El modelo resuelve un problema concreto: la mayoria de sistemas TTS multilingues no cubren variedades dialectales de bajos recursos como el haryanvi, hablado en el estado de Haryana (India). El adaptador se entrena sobre habla autentica del dataset ankitdhiman/haryanvi-tts y captura inflexiones, consonantismo y fraseologia nativa (por ejemplo, "म्हाणे", "काल्ह", "ल्याणा सै"). Esta orientado a la persona "Haryanvi (Male)" y es compatible con la condicionalizacion multi-hablante estandar de Svara.

Es relevante ahora porque demuestra un flujo de trabajo de bajo coste (entrenado en una RTX 5060 Ti de 16 GB) para especializar un TTS generativo open source en una variedad linguistica concreta mediante PEFT, sin reentrenar el modelo base. El adaptador se puede intercambiar en caliente sobre el modelo base, lo que facilita su integracion en pipelines existentes de Svara-TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Llama 3.2 3.3B + codec SNAC 24 kHz |
| Parametros totales | no disponible (adaptador LoRA; base de 3,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bgc (haryanvi), hi (hindi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre kenpath/svara-tts-v1, un modelo de sintesis de voz que combina un backbone Llama 3.2 de 3.3B parametros con el codec neural discreto SNAC a 24 kHz. La generacion de audio se realiza emitiendo tokens discretos de audio que posteriormente se decodifican con SNAC; el prompt de texto se formatea con la plantilla de chat del tokenizer base y se condiciona con la persona "Haryanvi (Male)".

El entrenamiento emplea PEFT LoRA con rango r=128 y alpha=256, apuntando a las siete proyecciones de atencion y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). Se usaron 1.000 pasos con AdamW de 8 bits, learning rate 1e-4 con warmup lineal, batch size efectivo de 8 (bs=1, acumulacion de 8) y una unica NVIDIA GeForce RTX 5060 Ti de 16 GB. El dataset de entrenamiento es habla autentica bangru haryanvi (ankitdhiman/haryanvi-tts). No se detalla el numero de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) en dialecto haryanvi (bangru) con cadencia y fraseologia nativas.
- Clonacion de voz mediante el flujo de condicionalizacion multi-hablante del modelo base.
- Persona especifica "Haryanvi (Male)" entrenada de forma nativa.
- Soporte de hindi como idioma adicional heredado del modelo base.
- Generacion de tokens de audio discretos decodificables con SNAC 24 kHz.
- Intercambio en caliente del adaptador (set_adapter) para alternar perfiles en un mismo pipeline.
- Integracion en flujos de Video Studio existentes basados en Svara-TTS.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento multi-paso (no aplica a un TTS).

## Casos de uso

- Doblaje y localizacion de contenido audiovisual al haryanvi: el adaptador se anade como perfil sobre Svara-TTS y permite generar voces masculinas en dialecto para videos, manteniendo el resto del pipeline intacto.
- Asistentes de voz para servicios publicos en Haryana: sintesis de avisos y respuestas habladas en bangru para poblacion que no domina el hindi estandar, usando la persona masculina entrenada.
- Audiolibros y narracion en dialecto: conversion de texto haryanvi a voz con inflexion rustica autentica, adecuada para contenido literario o divulgativo regional.
- Clonacion de voz para creadores de contenido: generacion de una voz personalizada en haryanvi a partir de muestras de referencia, aprovechando la condicionalizacion multi-hablante del modelo base.
- Prototipado de interfaces conversacionales regionales: pruebas de concepto de IVR o chatbots de voz en haryanvi con un adaptador ligero de 743 MB que se intercambia en caliente.
- Investigacion en TTS para variedades de bajos recursos: base reproducible para experimentar con PEFT y codecs discretos en dialectos poco representados, dado el bajo coste de entrenamiento (una RTX 5060 Ti).
- Integracion en estudios de video con Svara-TTS: seleccion del perfil haryanvi mediante set_adapter dentro de un flujo de produccion ya existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo en 16 GB, y el modelo base es de 3,3B parametros en bfloat16, por lo que se requiere una GPU con memoria suficiente para el backbone mas SNAC.
- GPU recomendadas: NVIDIA T4 (entorno gratuito de Colab indicado por el autor), RTX 5060 Ti 16 GB (usada en entrenamiento); previsiblemente compatible con A100, H100 y RTX 4090, aunque no se documenta.
- Cabe en GPU de consumo: si, al menos en RTX 5060 Ti de 16 GB para entrenamiento; para inferencia no se detalla el minimo.
- Opciones de despliegue: transformers + peft + SNAC (flujo Python documentado), interfaz Gradio incluida (app.py en el repositorio) y notebook de Colab.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Svara-TTS Haryanvi (este) | LoRA sobre 3,3B | no disponible | bgc, hi | Apache-2.0 | Hugging Face |
| kenpath/svara-tts-v1 (base) | 3,3B | no disponible | no disponible | no disponible | Hugging Face |
| Otros TTS multilingues open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado especificamente para la persona "Haryanvi (Male)"; el rendimiento en otras voces o generos no esta documentado.
- El dataset de entrenamiento es limitado (habla bangru haryanvi) y puede introducir sesgos de registro, edad o procedencia geografica dentro de la comunidad haryanvi.
- Riesgo de alucinacion acustica y artefactos en la sintesis, inherente a los TTS generativos basados en codecs discretos; no se documentan tasas de error.
- Cobertura linguistica restringida a bgc e hi; no se garantiza calidad fuera de estos idiomas.
- No se documentan la longitud de contexto ni los limites de longitud de audio generado.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a contacto directo para consultas comerciales o flujos de clonacion de voz personalizados; conviene verificar las condiciones del modelo base kenpath/svara-tts-v1 y del codec SNAC.
- La clonacion de voz plantea riesgos de suplantacion y uso indebido; se recomienda consentimiento explicito de las voces de referencia y cumplimiento normativo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vikram2026ind/svara-haryanvi-tts
- Modelo base: https://huggingface.co/kenpath/svara-tts-v1
- Codec SNAC 24 kHz: https://huggingface.co/hubertsiuzdak/snac_24khz
- Dataset de entrenamiento: https://huggingface.co/datasets/ankitdhiman/haryanvi-tts
- Notebook de demostracion en Colab: https://colab.research.google.com/github/vikram2026ind/svara-haryanvi-tts/blob/main/Haryanvi_TTS_Colab_Demo.ipynb
- Repositorio GitHub del autor: https://github.com/vikram2026ind/svara-haryanvi-tts
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
