# TeichAI/Qwen3.8-27B-Fable-Distill

## Resumen

El modelo **TeichAI/Qwen3.8-27B-Fable-Distill** es un ajuste fino ligero (light tune) sobre el modelo base **Qwen/Qwen3.8-27B**, desarrollado por el equipo de TeichAI. Se ha entrenado con una combinación de datasets públicos (`armand0e/claude-fable-5-claude-code` y `armand0e/Fable-5-Chat`) y un corpus privado de datos "Fable 5", con el objetivo de mejorar el rendimiento en tareas de razonamiento y conversación. El nombre "Fable" hace referencia a la serie de datasets utilizados, y "Distill" sugiere una destilación o ajuste dirigido a capturar comportamientos específicos.

El modelo mantiene la arquitectura del Qwen3.8-27B, con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), y está disponible en formato `safetensors`. Según la model card, soporta un modo de razonamiento explícito mediante los parámetros `enable_thinking` y `reasoning_effort` (con valores `low`, `medium` o `xhigh`), lo que permite controlar la profundidad del pensamiento antes de responder. La licencia es Apache 2.0, lo que facilita su uso comercial y modificación.

La relevancia de este modelo radica en que ofrece una alternativa de código abierto con mejoras medibles en benchmarks de razonamiento (ARC Challenge y BoolQ) respecto a su base, manteniendo un tamaño manejable para despliegue en GPUs de gama alta o mediante cuantización. Aunque el pipeline declarado es `image-text-to-text`, no se documentan capacidades multimodales en la ficha, por lo que debe tratarse como un modelo de texto puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la ficha; modelo base Qwen3.8-27B (familia Qwen3.8) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se mencionan GGUF u otros) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 55,6 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. El modelo es un ajuste fino del **Qwen3.8-27B**, que pertenece a la familia Qwen3.8 de Alibaba. Dado que no se especifican detalles sobre si es un transformer denso, MoE o híbrido, se asume que hereda la arquitectura del modelo base, pero no se puede confirmar con los datos disponibles.

El entrenamiento se realizó con la librería **Unsloth** y **Hugging Face TRL**, lo que indica un proceso de fine-tuning supervisado (SFT) sobre los datasets mencionados. La model card lo describe como un "light tune", sugiriendo un ajuste de bajo coste computacional. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. El corpus privado de datos "Fable 5" no está disponible públicamente, por lo que no se puede evaluar su composición.

Una característica técnica destacable es el soporte de `enable_thinking` y `reasoning_effort`, que permite activar un modo de razonamiento explícito con niveles de esfuerzo configurables. Esto sugiere que el modelo fue entrenado para generar cadenas de pensamiento antes de la respuesta final, similar a otros modelos con "thinking mode".

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, como indica la etiqueta `conversational`.
- Razonamiento explícito: soporta `enable_thinking` y `reasoning_effort` (`low`, `medium`, `xhigh`), permitiendo controlar la profundidad del razonamiento antes de responder.
- Mejora en tareas de razonamiento de sentido común: según los benchmarks, supera al modelo base en ARC Challenge y BoolQ.
- Capacidades multilingües: no documentadas; la etiqueta de idioma es solo `en` (inglés).
- Tool calling / function calling: no se menciona en la información disponible.
- Capacidades de agente o multi-step reasoning: no se documentan explícitamente, aunque el modo `thinking` podría facilitar tareas de razonamiento multi-paso.
- Capacidades multimodales: el pipeline declarado es `image-text-to-text`, pero no hay evidencia en la model card de que el modelo procese imágenes. Se recomienda tratarlo como modelo de texto.

## Casos de uso

- Asistentes conversacionales de propósito general: el modelo puede integrarse en chatbots para atención al cliente, soporte técnico o asistentes personales, aprovechando su capacidad de mantener diálogos coherentes y su modo de razonamiento para respuestas más elaboradas.
- Generación de respuestas con razonamiento explicable: en entornos donde se requiere justificar decisiones (por ejemplo, diagnóstico técnico o análisis de problemas), el modo `thinking` permite que el modelo muestre su proceso de razonamiento antes de dar la respuesta final.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo de 27B con licencia Apache 2.0, puede servir como base para ajustes finos en sectores como legal, médico o financiero, partiendo de un modelo ya optimizado para razonamiento.
- Evaluación de modelos y benchmarks: dado que se publican resultados en ARC y BoolQ, puede utilizarse como referencia en investigaciones sobre razonamiento de sentido común.
- Prototipado rápido de aplicaciones de IA generativa: gracias a su compatibilidad con `transformers` y `text-generation-inference`, se puede desplegar en entornos de desarrollo con vLLM o TGI para pruebas de concepto.
- Educación y divulgación: por su licencia abierta y tamaño moderado, es adecuado para experimentos académicos sobre técnicas de destilación o ajuste fino eficiente.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa entre el modelo base y el Fable-Distill en tres benchmarks:

| Modelo | ARC Challenge | ARC Challenge (Easy) | BoolQ |
|---|---|---|---|
| Qwen3.8-27B | 0.591 | 0.782 | 0.896 |
| Qwen3.8-27B-Fable-Distill | 0.637 | 0.832 | 0.911 |

Se observa una mejora consistente en los tres benchmarks, con incrementos de +0.046, +0.050 y +0.015 respectivamente. No se proporcionan resultados en otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. A partir del tamaño del modelo (27,78 B parámetros) y el formato safetensors, se pueden hacer estimaciones orientativas:

- **VRAM estimada para inferencia**: en FP16, el modelo requiere aproximadamente 55,6 GB de VRAM (27,78 B × 2 bytes). Con cuantización de 8 bits, se reduciría a ~28 GB; con 4 bits, a ~14 GB. Estas cifras son estimaciones teóricas y no han sido confirmadas por el autor.
- **GPU recomendadas**: para FP16 se necesitaría una GPU con al menos 60 GB de VRAM (por ejemplo, A100 80GB o H100). Con cuantización 4-bit podría ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con posibles limitaciones de velocidad.
- **Opciones de despliegue**: al ser un modelo `transformers`, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se mencionan configuraciones específicas.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

La única comparación directa disponible es con el modelo base **Qwen3.8-27B**, del cual deriva. No se proporcionan datos de otros modelos de tamaño similar (por ejemplo, Llama 3.1 27B, Mistral 7B, etc.) en la información facilitada.

| Modelo | Parámetros | Contexto | ARC Challenge | BoolQ | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B | No disponible | 0.591 | 0.896 | Apache 2.0 |
| Qwen3.8-27B-Fable-Distill | 27,78 B | No disponible | 0.637 | 0.911 | Apache 2.0 |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- **Idioma**: el modelo está etiquetado únicamente como `en` (inglés). No se garantiza un rendimiento adecuado en otros idiomas, incluido el español.
- **Sesgos y alucinaciones**: al ser un modelo de lenguaje generativo, puede producir contenido sesgado o factualmente incorrecto. No se han publicado evaluaciones específicas de sesgo o robustez.
- **Modo de razonamiento**: el parámetro `reasoning_effort` con valor `xhigh` (por defecto) puede generar respuestas muy largas y lentas, lo que afecta a la latencia en producción. Se recomienda ajustar este parámetro según el caso de uso.
- **Datos de entrenamiento**: parte del corpus es privado ("Fable 5"), por lo que no se puede auditar su contenido ni su calidad. Esto introduce incertidumbre sobre posibles sesgos o duplicidades con otros datasets.
- **Contexto**: no se especifica la longitud de contexto soportada. Se recomienda verificar este dato antes de usarlo en aplicaciones que requieran ventanas largas.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se debe revisar si los datasets utilizados (públicos o privados) imponen restricciones adicionales. Los datasets citados son de acceso público, pero el corpus privado podría tener limitaciones no documentadas.
- **Pipeline multimodal**: aunque el pipeline se declara como `image-text-to-text`, no hay evidencia de que el modelo procese imágenes. No debe utilizarse para tareas de visión sin verificación previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill)
- [Dataset armand0e/claude-fable-5-claude-code](https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code)
- [Dataset armand0e/Fable-5-Chat](https://huggingface.co/datasets/armand0e/Fable-5-Chat)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio Teich (herramienta de formateo de datos)](https://github.com/TeichAI/teich)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
