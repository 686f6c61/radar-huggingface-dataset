# Vinushaanth/gpt2-reuters-from-scratch

## Resumen

`Vinushaanth/gpt2-reuters-from-scratch` es un modelo de generación de texto publicado en Hugging Face por el usuario Vinushaanth. Por el nombre y por el tamaño de sus pesos (30.713.856 parámetros, según los safetensors del repositorio), se trata de una implementación reducida de la arquitectura GPT-2, presumiblemente entrenada desde cero sobre un corpus de noticias de la agencia Reuters, lo que explicaría el sufijo "reuters-from-scratch". No es una adaptación de los pesos oficiales de GPT-2 de OpenAI: el recuento de parámetros no coincide con ninguna de las variantes publicadas por OpenAI (124M, 355M, 774M, 1.5B), sino con una configuración compacta propia.

El modelo se distribuye únicamente en formato safetensors y está etiquetado para la librería transformers con pipeline `text-generation`, además de ser compatible con text-generation-inference y endpoints. El repositorio ocupa aproximadamente 0,1 GB y no cuenta con descargas ni interacciones en el momento de redactar esta ficha.

La relevancia de este modelo es limitada y de carácter experimental: la model card es la plantilla automática de Hugging Face sin rellenar, no se declara licencia, idiomas ni datos de entrenamiento, y no se han publicado evaluaciones. Debe tratarse, por tanto, como un artefacto de investigación o una prueba de concepto de entrenamiento desde cero, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only causal), según el tag `gpt2` del repositorio |
| Parametros totales | 30.713.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF en el repositorio) |
| Idiomas soportados | no disponible (el corpus Reuters sugiere inglés, pero no se declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2, es decir, un transformer decoder-only con atención causal y generación autorregresiva token a token. El recuento de 30,7 millones de parámetros indica una configuración muy reducida en comparación con el GPT-2 small original (124M), con menos capas y/o una dimensión de embedding y un vocabulario más pequeños. No se dispone de la configuración exacta (número de capas, cabezas de atención, dimensión oculta ni tamaño de vocabulario) porque la model card no la documenta.

El nombre del modelo sugiere un entrenamiento desde cero sobre un corpus de noticias de Reuters, pero no se especifica el número de tokens, la composición del dataset, el régimen de precisión, la duración del entrenamiento ni si hubo fases de ajuste fino supervisado o preferencias (RLHF/DPO). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Toda la información de entrenamiento figura como "More Information Needed" en la model card original.

## Capacidades

- Generación de texto autorregresiva en inglés (presumiblemente, dado el corpus Reuters), limitada por el tamaño reducido del modelo.
- Generación de texto de dominio periodístico si el ajuste al corpus Reuters fue efectivo, con estilo potencialmente cercano a teletipos y noticias.
- Compatibilidad con el ecosistema transformers (`AutoModelForCausalLM`) y con text-generation-inference.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe.
- No se declara modo "thinking", visión ni audio.
- No se declara capacidad de código ni matemáticas; con 30M de parámetros, el rendimiento en estas tareas sería previsiblemente muy bajo.

## Casos de uso

- Experimentación académica con entrenamiento desde cero: el modelo sirve como referencia para estudiar cómo se comporta un GPT-2 de 30M parámetros entrenado sobre un corpus especializado, comparando curvas de pérdida y calidad de muestras frente a configuraciones mayores.
- Generación de titulares y teletipos sintéticos: si el ajuste a Reuters funcionó, puede producir borradores de titulares o párrafos breves con estilo periodístico para tareas de aumento de datos en pipelines de PNL.
- Pruebas de infraestructura de despliegue: por su tamaño mínimo (0,1 GB), es útil para validar pipelines de transformers, TGI o endpoints antes de migrar a modelos mayores, sin consumir recursos significativos.
- Docencia y demostraciones: permite ilustrar en clase cómo funciona la generación autorregresiva y el efecto del tamaño del modelo en la coherencia del texto, con tiempos de inferencia casi instantáneos en CPU.
- Prototipado de completado de texto en dominios financieros: como base para experimentos de autocompletado de frases relacionadas con noticias económicas, siempre con validación humana.
- Benchmark de referencia interno: sirve como línea base de baja capacidad contra la que medir mejoras de modelos más grandes en tareas de generación de noticias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,12 GB (30,7M parámetros × 4 bytes), más el overhead de activaciones y del tokenizador; en la práctica, menos de 1 GB en cualquier configuración.
- VRAM estimada en fp16/bf16: aproximadamente 0,06 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutarlo sin problema. También funciona en CPU.
- Cabe holgadamente en cualquier GPU consumer, incluida una Raspberry Pi o un portátil sin GPU dedicada.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el repositorio está etiquetado como compatible) y endpoints de Hugging Face. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles; por el tamaño, se espera latencia de milisegundos por token en CPU y throughput muy alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vinushaanth/gpt2-reuters-from-scratch | 30,7M | no disponible | no disponible | Hugging Face, safetensors | Model card vacía, sin benchmarks |
| GPT-2 small (OpenAI) | 124M | 1.024 tokens | MIT | Hugging Face, múltiples formatos | Referencia estándar, ampliamente evaluado |
| distilgpt2 (Hugging Face) | 82M | 1.024 tokens | Apache 2.0 | Hugging Face, GGUF disponible | Destilado de GPT-2, con benchmarks publicados |
| GPT-2 medium (OpenAI) | 355M | 1.024 tokens | MIT | Hugging Face | Mayor capacidad, licencia clara |

La comparación directa es difícil porque el modelo de Vinushaanth no publica configuración, licencia ni evaluaciones. Frente a distilgpt2 o GPT-2 small, ofrece un tamaño menor pero carece de la documentación y garantías de aquellos.

## Limitaciones y advertencias

- La model card es la plantilla automática sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en la práctica, debe asumirse que no hay autorización explícita.
- Riesgo elevado de alucinación y de texto incoherente por el tamaño reducido (30,7M parámetros) y la falta de evaluación.
- Posibles sesgos derivados del corpus Reuters (sesgo editorial, geográfico y temático), no documentados ni medidos.
- Longitud de contexto desconocida; no se puede garantizar el manejo de conversaciones multi-turno largas.
- Sin soporte declarado de tool calling, agentes ni multilingüismo.
- Sin descargas ni validación comunitaria: no hay evidencia de que el modelo funcione correctamente ni de que los pesos estén íntegros.
- No apto para producción sin una evaluación exhaustiva previa y sin una licencia clara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vinushaanth/gpt2-reuters-from-scratch
- Paper de referencia de GPT-2 (Radford et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card (Lacoste et al., 2019): https://mlco2.github.io/impact
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
