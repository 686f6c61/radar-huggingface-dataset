# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch06

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch06` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo UNL-RESET. Se enmarca en la linea de trabajo sobre *machine unlearning* aplicada al benchmark TOFU (Task of Fictitious Unlearning), un conjunto de datos sintetico disenado para medir la capacidad de un modelo de "olvidar" informacion concreta sobre autores ficticios sin degradar el conocimiento general. El checkpoint corresponde a la configuracion `forget10` (el 10 % de los datos de olvido) y al epoch 6 de un total de 20.

Tecnicamente es un modelo denso de arquitectura transformer decoder-only con 6.738.415.616 parametros, derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU. La intervencion consiste en reinicializar los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base, y aplicar una perdida combinada de entropia cruzada sobre los datos de retencion mas un termino de tipo IHL (*inverse hinge loss* o variante equivalente, segun la nomenclatura del autor) sobre los datos de olvido.

Su relevancia es acotada pero clara: sirve como punto de comparacion reproducible en experimentos de desaprendizaje, permite auditar si la reinicializacion parcial de cabezas y embeddings mitiga la fuga de informacion olvidada y constituye un artefacto de investigacion, no un modelo listo para produccion. No hay publicados resultados de benchmarks ni metricas de TOFU en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura estandar de Llama 2 7B: transformer decoder-only con normalizacion RMSNorm pre-atencion, activacion SwiGLU en la MLP, atencion multi-cabeza con RoPE y sin sesgos en las proyecciones lineales. Sobre esa base, el autor aplica una modificacion estructural concreta: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_llama2-7b`. El checkpoint se distribuye como modelo completo autonomo, acompanado de un `ihl_manifest.json` que documenta la configuracion.

El entrenamiento usa una perdida compuesta: entropia cruzada estandar (CE) sobre el conjunto de retencion con peso 1.0, mas un termino IHL sobre el conjunto de olvido `forget10`. El proceso se ejecuta durante 20 epochs, y este artefacto corresponde al epoch 6. No se especifican en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO adicionales; TOFU es un benchmark de preguntas y respuestas sobre autores ficticios, por lo que el ajuste es de tipo supervisado.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama 2 7B, condicionada por el ajuste sobre TOFU.
- Respuesta a preguntas factuales sobre el corpus TOFU, incluyendo los autores ficticios del split de retencion.
- Razonamiento de un solo turno y generacion de respuestas cortas y medianas.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Evaluacion de metodos de desaprendizaje: el checkpoint sirve como brazo experimental en comparaciones de TOFU, midiendo la probabilidad de generar respuestas correctas sobre el split `forget10` frente al split `retain`.
- Auditoria de fuga de informacion: al reinicializar embeddings y LM head, permite estudiar si la informacion olvidada reaparece por la via de la capa de salida o si queda suprimida por el termino IHL.
- Reproducibilidad academica: investigadores que replican el pipeline de UNL-RESET pueden cargar este epoch concreto para verificar curvas de olvido frente a epochs posteriores (hasta el 20).
- Analisis de robustez frente a *prompting* adversarial: util para comprobar si tecnicas de *jailbreak* recuperan contenido que el modelo deberia haber olvidado.
- Estudio de degradacion de conocimiento general: comparar la perplejidad en corpus externos (Wikipedia, C4) frente al modelo base `locuslab/tofu_ft_llama2-7b` para cuantificar el coste del olvido.
- Base para experimentos de *relearning*: punto de partida para medir la velocidad a la que el modelo vuelve a aprender la informacion olvidada tras un ajuste fino adicional.
- Docencia y formacion: ejemplo practico de como se implementa un checkpoint intermedio de un pipeline de unlearning con Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (probabilidad de olvido, *retain accuracy*, *truth ratio*), ni resultados de MMLU, HumanEval, GSM8K u otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en RTX 3060 12 GB o superiores con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversion a GGUF), Ollama (previa conversion) y transformers con `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch06 | 6,74 B | no disponible | Unlearning TOFU, epoch 6/20 | llama2 | Hugging Face |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 | Ajuste fino completo sobre TOFU (sin olvido) | llama2 | Hugging Face |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat alineado con RLHF | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Replicacion de Llama 2 chat | llama2 | Hugging Face |

La comparacion relevante es frente a `locuslab/tofu_ft_llama2-7b`, que actua como linea base sin desaprendizaje: este checkpoint deberia mostrar menor probabilidad de generar contenido del split `forget10` a costa de una posible perdida de calidad general. No hay datos publicados que confirmen esa diferencia.

## Limitaciones y advertencias

- Modelo de investigacion: no ha pasado por evaluaciones de seguridad, alineamiento ni red teaming; no debe desplegarse en produccion.
- Riesgo de alucinacion: inherente a Llama 2 7B y potencialmente agravado por el ajuste sobre un corpus sintetico de autores ficticios.
- Fuga de informacion olvidada: la eficacia del desaprendizaje no esta verificada; el checkpoint puede seguir reproduciendo contenido del split `forget10` bajo *prompting* adversarial.
- Idiomas: solo ingles; el rendimiento en castellano no esta evaluado y previsiblemente sera deficiente.
- Contexto: la longitud de contexto efectiva del checkpoint no se documenta; se asume la del modelo base (4096 tokens), aunque no hay confirmacion.
- Licencia Llama 2: uso comercial permitido bajo la Llama 2 Community License, con obligaciones de atribucion y restricciones de uso (prohibicion de usos daninos, requisito de mencion "Built with Meta Llama 2" y limite de 700 millones de usuarios mensuales para ciertos supuestos).
- Sesgos: hereda los sesgos de Llama 2 y los del corpus TOFU, que contiene biografias ficticias generadas por GPT-4 con posibles sesgos de generacion.
- Sin mantenimiento: repositorio con 0 descargas y 0 likes, creado y actualizado en noviembre de 2026; no hay garantia de soporte ni de correccion de errores.
- Checkpoint intermedio: corresponde al epoch 6 de 20; no representa el resultado final del pipeline de unlearning.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch06
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
