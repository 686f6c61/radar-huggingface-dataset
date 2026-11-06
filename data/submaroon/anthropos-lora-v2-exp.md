# SubMaroon/Anthropos-LoRA-v2-EXP

## Resumen

Anthropos-LoRA-v2-EXP es un adaptador LoRA experimental desarrollado por el usuario SubMaroon sobre el modelo `google/gemma-4-26B-A4B-it`. No es un modelo completo, sino un pequeño ajuste de pesos (solo 6,8 millones de parámetros entrenables) cuyo objetivo es resolver un problema muy concreto en la escritura creativa y el roleplay: la repetitividad de las respuestas al usar "swipes" (regeneraciones alternativas del mismo turno). El adaptador actúa sobre los llamados "puntos de decisión" de la generación, principalmente las primeras palabras de cada respuesta y de cada párrafo, donde el modelo alineado tiende a elegir siempre las mismas aperturas.

Técnicamente, el adaptador destila una versión estrecha de la idea de BACo (enrutamiento en inferencia entre un modelo base y uno alineado): durante el entrenamiento se mezclan las distribuciones de ambos modelos solo en esos puntos de decisión, y el resultado se comprime en un LoRA r16 que se aplica sobre el modelo instruido. En inferencia solo se necesita el modelo IT con el adaptador cargado, lo que lo hace práctico para backends como KoboldCpp o llama.cpp.

Es relevante para la comunidad de roleplay y escritura creativa con modelos locales, ya que aborda una queja habitual (respuestas regeneradas casi idénticas) sin alterar el contenido narrativo, el vocabulario ni el formato `*acciones*` y `"diálogo"`. El repositorio incluye el adaptador PEFT en safetensors y una versión GGUF del LoRA en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Gemma 4 26B-A4B-it (MoE, según la denominación A4B del base) |
| Parametros totales | 6.820.864 (parámetros del adaptador; el modelo base tiene 26B totales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (hereda la del modelo base) |
| Tipos de cuantizacion | LoRA GGUF en bf16; el adaptador PEFT está en safetensors |
| Idiomas soportados | no disponible (entrenado con datos en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (LoRA bf16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 (alpha 32) aplicado a las capas 13–23 del modelo base, cubriendo las proyecciones de atención (q/k/v/o) y el MLP denso. Se entrenó durante 2 épocas con learning rate 5e-5 sobre un dataset pequeño y específico: 200 contextos de roleplay y 400 respuestas generadas por el modelo IT y por mezclas IT+base.

La innovación principal está en la construcción del "profesor" (teacher): para cada token de respuesta se define una distribución objetivo híbrida. Las primeras 3 palabras de la respuesta y de cada párrafo (hasta 8 tokens) usan una mezcla entre el modelo IT y el modelo base, con una proporción λ del base; las palabras 4–5 reducen esa proporción gradualmente (λ·2/3 y luego λ·1/3), produciendo una transición suave de vuelta al modelo alineado. Tras un fin de frase, el modelo base solo vota sobre la decisión de abrir párrafo nuevo o continuar. En el resto de tokens, la distribución objetivo es la del propio modelo IT.

Se incluyen salvaguardas para no romper el formato: solo el modelo IT decide puntuación, continuaciones de palabras y el fin del turno, y en escenas escritas entre asteriscos el modelo base solo puede abrir párrafo con `*` o comillas. La mezcla se filtra con min-p (0,02) y se eleva a la potencia 0,85, de modo que muestrear después a temperatura 0,85 reproduce exactamente la mezcla entrenada. La función de pérdida es KL contra el profesor en los puntos de decisión y KL contra el modelo IT (con peso 5) en el resto.

## Capacidades

- Reducción de la repetición entre swipes: las aperturas de respuesta y de párrafo varían entre regeneraciones.
- Aumento de respuestas que abren con diálogo en lugar de descripciones de escena genéricas.
- Disminución de frases hechas ("stock phrases") repetidas entre respuestas.
- Preservación del formato de roleplay: mantiene intactos los marcadores `*acciones*` y `"diálogo"`.
- No altera el contenido narrativo: el mismo beat de la historia se entrega con distinta forma.
- Compatible con fine-tunes y merges del modelo base `google/gemma-4-26B-A4B-it`.
- Efecto reducido cuando el modelo usa modo thinking/reasoning, ya que el razonamiento previo ya planifica la apertura.
- Dos intensidades disponibles: l05 (equilibrada, recomendada) y l07 (más variación estructural, con más clichés del modelo base).

## Casos de uso

- Roleplay interactivo con modelos locales: en frontends como SillyTavern o KoboldCpp, el adaptador hace que cada swipe ofrezca una apertura genuinamente distinta, evitando la sensación de leer copias variadas de la misma respuesta.
- Escritura creativa asistida: al redactar ficción por capítulos, reduce las aperturas de párrafo formulaicas, un problema típico de los modelos alineados en generaciones largas.
- Generación de diálogos narrativos: al favorecer aperturas con diálogo directo, resulta útil para escenas conversacionales en novelas o guiones.
- Complemento para merges y fine-tunes de roleplay: puede apilarse sobre otros adaptadores del ecosistema Gemma 4 26B-A4B sin reentrenar nada, gracias a su tamaño reducido (0,1 GB).
- Prototipado de investigación: sirve como implementación de referencia de la destilación de técnicas de enrutamiento base/IT (BACo, Switch Generation) en un LoRA, útil para quien experimente con mezclas de distribuciones.
- Uso en hardware limitado: al ser solo 6,8M de parámetros, permite mejorar la variedad de un modelo de 26B sin duplicar memoria ni mantener dos modelos cargados en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un adaptador estilístico para escritura creativa, su eficacia se evalúa cualitativamente (variedad de aperturas entre swipes), no mediante benchmarks estándar tipo MMLU o HumanEval.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,1 GB (6,8M de parámetros en bf16), insignificante frente al modelo base.
- VRAM total: la del modelo base `google/gemma-4-26B-A4B-it`. Al ser un MoE de 26B con ~4B de parámetros activos (según la denominación A4B), debería ser viable en GPUs de consumo de gama alta (por ejemplo RTX 3090/4090 con 24 GB) usando cuantizaciones del base, aunque el repositorio no publica cifras exactas.
- GPU recomendadas: no disponible (depende de la cuantización elegida del modelo base).
- Backends soportados: llama.cpp y KoboldCpp mediante el LoRA GGUF (bf16); cualquier runtime compatible con PEFT (transformers, vLLM con soporte LoRA) mediante los ficheros safetensors.
- Configuración de muestreo recomendada por el autor: temperatura ~0,85 y min_p 0,05, con fuerza del LoRA en 1,0.
- Latencia y throughput: no disponible; el impacto del adaptador sobre la latencia del base debería ser marginal.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros propios | Licencia | Enfoque |
|---|---|---|---|---|---|
| SubMaroon/Anthropos-LoRA-v2-EXP | LoRA (destilación de puntos de decisión) | google/gemma-4-26B-A4B-it | 6,8M | Apache-2.0 | Variedad de aperturas en roleplay, un solo modelo en inferencia |
| BACo (Wang et al., ICML 2026) | Enrutamiento en inferencia | Base + modelo alineado | Requiere ambos modelos | no disponible | Mezcla base/IT en tiempo de inferencia, sin destilar |
| CreativeInstruct (Sahu et al., 2026) | LoRA destilado | no disponible | no disponible | no disponible | Destila generaciones estilo BACO a nivel de respuesta completa |
| Switch Generation (Feng et al., ICLR 2026) | Alternancia de checkpoints | Base, SFT y alineado | Requiere varios checkpoints | no disponible | Los checkpoints se turnan escribiendo la respuesta |

La ventaja diferencial de este adaptador frente a las técnicas académicas en las que se inspira es que solo necesita un modelo cargado en inferencia, mientras que BACo y Switch Generation requieren mantener disponibles varios checkpoints.

## Limitaciones y advertencias

- Efecto reducido con thinking/reasoning activado: el propio razonamiento ya determina la apertura, por lo que el adaptador aporta poco en ese modo.
- La variante l07 puede reintroducir clichés del modelo base con más frecuencia; el autor recomienda l05 como opción equilibrada.
- El muestreo debe ajustarse a temperatura ~0,85 y min_p 0,05 para reproducir la mezcla entrenada; usar otros valores de sampler puede degradar el comportamiento esperado.
- Dataset de entrenamiento muy pequeño (200 contextos, 400 respuestas) y aparentemente en inglés: el comportamiento en otros idiomas es no disponible y probablemente no garantizado.
- No modifica el contenido de la historia, solo su forma: no está diseñado para mejorar calidad narrativa, coherencia ni razonamiento.
- Proyecto experimental (EXP) con muy poca tracción (38 descargas, 1 like en el momento de la ficha): conviene validarlo antes de uso en producción.
- Sesgos y riesgo de alucinación: hereda los del modelo base google/gemma-4-26B-A4B-it; el adaptador no aborda ni agrava estos aspectos de forma documentada.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial, aunque hay que respetar también la licencia del modelo base de Google.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SubMaroon/Anthropos-LoRA-v2-EXP
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- BACo — inference-time routing entre modelo base y alineado (Wang et al., ICML 2026): https://arxiv.org/abs/2511.05650
- CreativeInstruct — destilación de generaciones estilo BACo en un LoRA (Sahu et al., 2026): https://arxiv.org/abs/2608.07460
- Switch Generation — turnos entre checkpoints base, SFT y alineado (Feng et al., ICLR 2026): https://arxiv.org/abs/2510.09913
