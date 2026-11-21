# Weinel-Ventures/Sharp-Coder-V0.1

## Resumen
Sharp Coder V0.1 es el primer modelo publicado por Weinel Ventures, un laboratorio liderado por Spencer Weinel. Se trata de un modelo de lenguaje causal de 160.977.408 parámetros entrenado desde cero como experimento de investigación en torno a C#, .NET, texto técnico y lenguaje general. Su arquitectura es un transformer causal decoder-only compatible con la implementación GPT-2 de Hugging Face, con 20 capas, tamaño oculto de 768, 12 cabezas de atención, feed-forward de 3.072 y vocabulario de 24.000 tokens.

El modelo es un base pretrained: no ha pasado por ajuste por instrucciones ni por ajuste conversacional, por lo que su tarea es predecir el siguiente token y no responder a instrucciones. El autor lo publica explícitamente como material de prueba, investigación, archivo y educación, y advierte de que su salida es altamente poco fiable. No está pensado para producción ni para tareas importantes.

Su relevancia es acotada y de carácter documental: sirve como checkpoint temprano de un laboratorio emergente, como banco de pruebas para inferencia con Transformers, conversión a GGUF y ejecución en runtimes compatibles con llama.cpp, y como objeto de estudio de modos de fallo típicos de modelos pequeños entrenados con pocos datos. No compite con modelos de código de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only compatible con GPT-2 (20 capas, hidden size 768, 12 cabezas de atención, feed-forward 3.072) |
| Parametros totales | 160.977.408 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (el repo incluye safetensors y GGUF) |
| Idiomas soportados | Inglés (tag `en` en la model card); no se detallan otros idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
La arquitectura es un transformer causal decoder-only estándar, compatible con la implementación GPT-2 de Hugging Face. Cuenta con 20 capas transformer, dimensión oculta de 768, 12 cabezas de atención, capa feed-forward de 3.072 y un vocabulario de 24.000 tokens. El contexto máximo de entrenamiento e inferencia es de 1.024 tokens. No se documentan innovaciones técnicas adicionales como atención lineal, decodificación especulativa o arquitecturas híbridas.

El entrenamiento se realizó desde cero sobre un corpus de aproximadamente 550 millones de tokens, compuesto por código fuente en C#, código relacionado con .NET, documentación de programación, texto técnico, discusiones sobre programación y texto general en inglés. El mejor checkpoint de validación registrado alcanzó una pérdida de validación de aproximadamente 2,3805. No se indica en la información disponible si hubo RLHF, DPO u otras fases de alineamiento; el autor confirma que no hay ajuste por instrucciones ni ajuste conversacional.

## Capacidades
- Generación de texto causal: continuación de secuencias a partir de un prompt, sin interpretación de instrucciones.
- Continuación de código en C#: puede producir sintaxis similar a C#, clases, métodos y estructuras con apariencia de tests unitarios.
- Reproducción de patrones de .NET: reconocimiento de construcciones como `Console.WriteLine`, patrones de diagnóstico del compilador y estructuras de documentación.
- Generación de texto técnico y Markdown: continuación de prosa técnica y formato Markdown.
- Continuación de texto general en inglés.
- Punto de partida para fine-tuning y entrenamiento continuado.
- Checkpoint para experimentos de inferencia y conversión de formatos (safetensors a GGUF, ejecución en llama.cpp).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües no documentadas más allá del inglés.

## Casos de uso
- Investigación sobre modos de fallo en modelos pequeños: el modelo permite estudiar bucles de repetición, degradación de la salida en generaciones largas y mezcla de dominios (código, documentación, Markdown) en un entorno controlado y de bajo coste.
- Pruebas de inferencia con Hugging Face Transformers: sirve como checkpoint ligero para validar pipelines de `text-generation`, medir latencia y comprobar el comportamiento de la generación con distintos parámetros de muestreo.
- Validación de conversión a GGUF y llama.cpp: al incluir pesos en GGUF, es útil para verificar flujos de conversión, cuantización y ejecución en runtimes compatibles antes de aplicarlos a modelos mayores.
- Experimentos de entrenamiento continuado: su tamaño reducido (160 millones de parámetros) y su corpus conocido lo hacen adecuado para probar recetas de continued pretraining y comparar checkpoints sin grandes requisitos de cómputo.
- Fine-tuning educativo: permite ilustrar el proceso completo de ajuste supervisado sobre un base model y observar cómo cambia el comportamiento respecto al checkpoint original.
- Docencia sobre modelos de lenguaje: útil para explicar la diferencia entre un base model y un modelo ajustado por instrucciones, así como el funcionamiento de la predicción del siguiente token con ejemplos de código C#.
- Archivo y preservación histórica: conserva un checkpoint temprano del desarrollo de Weinel Ventures para trazabilidad y comparación futura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es una pérdida de validación de aproximadamente 2,3805 en el mejor checkpoint registrado.

## Requisitos de hardware
- VRAM estimada para inferencia: con 160.977.408 parámetros, en FP32 (aproximadamente 644 MB de pesos) cabría en cualquier GPU con 2 GB o más; en FP16 (aproximadamente 322 MB) y en cuantizaciones de 8 o 4 bits (por debajo de 200 MB) el requisito es aún menor, aunque no se detallan los tipos de cuantización disponibles.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Las GPU de datacenter (A100, H100) no aportan ventaja práctica para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU con un rendimiento aceptable.
- Opciones de despliegue: Hugging Face Transformers, text-generation-inference (según los tags del repo), llama.cpp y runtimes compatibles con GGUF. No se confirma soporte específico de vLLM, Ollama o TGI más allá de las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sharp Coder V0.1 | 160.977.408 | 1.024 | C#/.NET, base model experimental | No disponible | Hugging Face (safetensors, GGUF) |
| GPT-2 small | 124 millones | 1.024 | Texto general en inglés, base model | MIT | Hugging Face |
| CodeParrot small | 110 millones | 1.024 | Código Python, base model | No disponible | Hugging Face |

La comparación se limita a modelos de tamaño y propósito similares; no se dispone de datos de benchmarks que permitan contrastar el rendimiento de Sharp Coder V0.1 frente a estas alternativas. Frente a GPT-2 small, comparte arquitectura y contexto, pero se especializa en C# y .NET con un vocabulario menor (24.000 frente a 50.257 tokens). Frente a CodeParrot small, cambia el lenguaje objetivo (C# en lugar de Python) y el tamaño del corpus de entrenamiento.

## Limitaciones y advertencias
- El propio autor califica el modelo como altamente poco fiable: genera código incorrecto, variables no definidas, código incompleto y fragmentos que parecen razonables pero no compilan.
- Bucles de repetición severos: puede repetir la misma palabra, frase o secuencia corta de tokens de forma indefinida.
- Salidas sin sentido o gibberish, cambios bruscos de tema y mezcla de código con documentación, Markdown o texto HTML.
- Mala capacidad de seguimiento de instrucciones y comportamiento conversacional deficiente, al no haber recibido ajuste por instrucciones ni por chat.
- Degradación de la calidad en generaciones largas.
- Riesgo elevado de alucinación y de texto inventado.
- Contexto limitado a 1.024 tokens, insuficiente para tareas que requieran ventanas amplias.
- Idiomas: solo se documenta inglés; no hay evidencia de capacidades multilingües.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución.
- No debe usarse en programación de producción, código sensible a seguridad, respuestas factuales, asesoramiento profesional, toma de decisiones importantes ni modificación autónoma de software.
- El código generado nunca debe asumirse correcto sin revisión y pruebas independientes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Weinel-Ventures/Sharp-Coder-V0.1
- Página oficial del modelo: https://ai.weinelventures.com/models/sharp-coder-v0.1
- Sitio web oficial de Weinel Ventures AI: https://ai.weinelventures.com/
