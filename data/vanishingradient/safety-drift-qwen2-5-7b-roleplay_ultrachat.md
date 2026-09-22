# vanishingradient/safety-drift-qwen2.5-7b-roleplay_ultrachat

## Resumen

`safety-drift-qwen2.5-7b-roleplay_ultrachat` es un adaptador LoRA en formato PEFT publicado por el usuario `vanishingradient` sobre el modelo instructivo `Qwen/Qwen2.5-7B-Instruct`. No es un modelo entrenado desde cero: es un ajuste fino adicional que se carga sobre los pesos originales de Qwen2.5-7B-Instruct, de modo que su huella en disco es mínima y requiere descargar aparte el modelo base. El repositorio se creó el 21 de septiembre de 2026 y, en el momento de recopilar estos datos, registraba 0 descargas, 0 «me gusta» y un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador podrían no estar subidos o no ser accesibles públicamente.

El identificador del modelo apunta a un experimento de «deriva de seguridad» (safety drift) entrenado con una mezcla de datos de roleplay y UltraChat; es decir, un artefacto orientado a estudiar cómo el ajuste fino sobre datos conversacionales aparentemente benignos puede degradar las barreras de alineamiento del modelo base. Conviene subrayar que esta lectura es una inferencia a partir del nombre y no está confirmada por el autor: la model card es la plantilla por defecto de Hugging Face y no contiene descripción, composición del dataset, hiperparámetros ni resultados de evaluación.

Su interés es, por tanto, metodológico y de auditoría más que de producción: sirve como material de partida para reproducir experimentos de erosión de alineamiento, para comparar el comportamiento del adaptador frente al modelo base y para practicar el servicio multi-LoRA sobre un mismo modelo fundacional. Toda especificación que no provenga del modelo base se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT 0.19.1) sobre un transformer decoder-only denso de la familia Qwen2. Detalles de rango, alpha y módulos objetivo: no disponibles |
| Parámetros totales | No disponible para el adaptador. El modelo base Qwen2.5-7B-Instruct tiene 7,61 B de parámetros (dato público del modelo base, no indicado en la ficha) |
| Parámetros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible en la ficha. El modelo base soporta 32.768 tokens de forma nativa y hasta 131.072 con escalado RoPE tipo YaRN |
| Tipos de cuantización | No disponible. El repositorio contiene únicamente pesos de adaptador; las cuantizaciones aplicables son las del modelo base (GPTQ, AWQ, GGUF) aplicando el adaptador por separado o fusionándolo antes de cuantizar |
| Idiomas soportados | No disponible en la ficha. El modelo base declara soporte para más de 29 idiomas, entre ellos el castellano |
| Licencia | No disponible. El modelo base Qwen2.5-7B-Instruct se distribuye bajo licencia Apache-2.0, pero la ficha del adaptador no declara licencia propia |
| Formato de pesos | safetensors (pesos de adaptador LoRA/PEFT). No se han publicado pesos fusionados ni versiones GGUF |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, atención con RoPE y atención de consultas agrupadas (GQA), diseñado para generación de texto conversacional con plantilla ChatML. Al ser un artefacto PEFT, el mecanismo de adaptación consiste en matrices de bajo rango inyectadas en determinadas capas del transformer; sin la model card completa no es posible saber en qué módulos (atención, proyecciones MLP), con qué rango ni con qué valor de alpha se entrenó el adaptador.

Sobre el entrenamiento solo puede inferirse información a partir del identificador: `roleplay_ultrachat` sugiere una mezcla de datos de juego de rol y de UltraChat, un corpus conversacional público, y el prefijo `safety-drift` sugiere que el objetivo del experimento era medir la pérdida de comportamiento seguro tras el ajuste. No hay datos disponibles sobre número de tokens de entrenamiento, épocas, precisión (fp16/bf16), uso de DPO o RLHF, ni sobre qué porcentaje del dataset corresponde a cada fuente. La ficha tampoco documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal ni variantes híbridas).

## Capacidades

Las capacidades que se enumeran a continuación corresponden al modelo base y no han sido verificadas en el adaptador; se indican a título orientativo y deben validarse empíricamente antes de cualquier uso.

- Generación de texto conversacional multi-turno con plantilla ChatML, heredada del modelo base.
- Razonamiento, matemáticas y generación de código: capacidades declaradas del modelo base Qwen2.5-7B-Instruct, sin validar en el adaptador.
- Soporte de *tool calling* y salida estructurada en JSON: funcionalidad documentada en la familia Qwen2.5, no confirmada tras el ajuste LoRA.
- Capacidades multilingües (más de 29 idiomas en el base), sin datos específicos del adaptador.
- No dispone de visión, audio ni modalidad distinta del texto, ya que el modelo base es puramente textual.
- Especialización probable en diálogo abierto y roleplay derivada del nombre del adaptador y de la mezcla de datos sugerida (`roleplay`, `ultrachat`). Hipótesis no verificada.
- Posible reducción de la tasa de rechazo ante peticiones dañinas si el experimento de deriva de seguridad funcionó como se esperaba. Hipótesis no verificada y no documentada por el autor.
- No se declara soporte explícito de modo «thinking» ni de razonamiento de varios pasos con trazas intermedias.

## Casos de uso

- Auditoría de deriva de alineamiento: comparar, con un mismo conjunto de consignas, las respuestas del adaptador y las del modelo base Qwen2.5-7B-Instruct para cuantificar cambios en la tasa de rechazo y en la calidad del contenido. Es el uso más coherente con el nombre del artefacto, pero exige que los pesos estén realmente publicados.
- Red-teaming y evaluación de robustez: emplear el adaptador como sujeto de pruebas en baterías automáticas de *jailbreak* y de contenido dañino, midiendo tasas de cumplimiento antes y después del ajuste fino, siempre en un entorno controlado y de investigación.
- Estudio de transferencia de capacidades en LoRA: servirlo junto a otros adaptadores sobre el mismo modelo base con vLLM y `--enable-lora`, de modo que se pueda medir cuánto de la capacidad del base se conserva y cuánto se especializa con un adaptador de bajo rango.
- Fusión y experimentación con adaptadores: combinar estos pesos con otros LoRA conversacionales mediante *merge* o SLERP para estudiar interferencia entre adaptadores, dado que el formato safetensors de PEFT permite operaciones de fusión con `merge_and_unload`.
- Prototipado de asistentes de rol: si el adaptador funciona como su nombre indica, puede emplearse en demos de personajes conversacionales que aprovechan la ventana de 32.768 tokens del modelo base para mantener contexto narrativo extenso. Requiere revisión humana del contenido generado.
- Docencia y formación en PEFT: el tamaño reducido del repositorio lo convierte en un ejemplo práctico para enseñar carga de adaptadores con `PeftModel.from_pretrained`, fusión de pesos y cuantización posterior en formato GGUF.
- Generación asistida de diálogos sintéticos: producir corpus conversacionales para ampliar datasets de entrenamiento, con filtrado posterior obligatorio por posibles salidas no seguras o sesgadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye ninguna sección de evaluación cumplimentada, y el repositorio no aporta resultados de MMLU, HumanEval, GSM8K ni de métricas de seguridad. Tampoco hay datos de latencia o *throughput* específicos del adaptador.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño del modelo base (7,61 B de parámetros) y no de mediciones sobre este adaptador concreto.

- Inferencia en fp16/bf16: aproximadamente 15,3 GB solo para los pesos, más caché KV y activaciones; en la práctica, entre 17 y 20 GB de VRAM para contextos moderados.
- Inferencia en int8: unos 8 GB de pesos, cómoda en GPU de 12-16 GB con contexto reducido.
- Inferencia en int4 (GPTQ, AWQ o GGUF Q4_K_M): unos 4,5-5 GB de pesos; cabe en tarjetas de 8 GB con contexto corto y en 12 GB con margen.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para servicio en producción con contexto largo; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 para uso local en precisión completa o int8.
- GPU de consumo: sí cabe. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o incluso una GPU de 8 GB con cuantización int4 pueden ejecutar el modelo base, siempre que el adaptador se fusione o se aplique por separado.
- Despliegue: vLLM con soporte LoRA (`--enable-lora`) y TGI permiten servir el base y cargar el adaptador sin fusionar; llama.cpp admite adaptadores GGUF mediante `--lora`; con transformers y PEFT basta `PeftModel.from_pretrained`. Ollama puede cargar adaptadores a través de Modelfile, con soporte experimental. La ruta más robusta es fusionar el LoRA con `merge_and_unload` y cuantizar el modelo resultante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparación se establece con el modelo base y con alternativas de la misma categoría (modelos densos de 7-8 B orientados a instrucciones). No existen datos de rendimiento del adaptador, por lo que la columna de rendimiento se deja como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato de pesos | Rendimiento publicado |
|---|---|---|---|---|---|
| safety-drift-qwen2.5-7b-roleplay_ultrachat (adaptador) | No disponible (base de 7,61 B) | No disponible (base: 32.768 tokens) | No disponible | safetensors (LoRA/PEFT) | No disponible |
| Qwen2.5-7B-Instruct (modelo base) | 7,61 B | 32.768 tokens nativos; 131.072 con YaRN | Apache-2.0 | safetensors, GPTQ, AWQ, GGUF | Documentado por el autor del base; no reproducido aquí |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Licencia comunitaria de Llama 3.1 | safetensors, GGUF | Documentado por el autor del base; no reproducido aquí |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Apache-2.0 | safetensors, GGUF | Documentado por el autor del base; no reproducido aquí |

## Limitaciones y advertencias

- La model card es la plantilla por defecto de Hugging Face: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el artefacto.
- El repositorio figura con un tamaño de 0,0 GB y 0 descargas, lo que sugiere que los pesos del adaptador podrían no estar publicados o no ser accesibles. Conviene verificarlo antes de planificar cualquier integración.
- No se declara licencia. Aunque el modelo base es Apache-2.0, la ausencia de licencia explícita en el adaptador genera incertidumbre jurídica para uso comercial; se recomienda contactar con el autor.
- No se declaran idiomas soportados. El comportamiento en castellano no está documentado ni evaluado.
- El propósito aparente del artefacto es estudiar la degradación de las barreras de seguridad tras un ajuste fino. Si el experimento tuvo el efecto buscado, es esperable una mayor tasa de cumplimiento de peticiones problemáticas y un aumento del riesgo de contenido dañino, sesgado o inapropiado.
- Riesgo de alucinación inherente a un modelo de 7 B, no mitigado ni evaluado en el adaptador.
- El ajuste sobre datos de roleplay y UltraChat puede degradar capacidades instrumentales del base (tool calling, salida estructurada, matemáticas) por olvido catastrófico; no hay evaluación que lo descarte.
- No debe desplegarse en aplicaciones orientadas al público sin una capa adicional de moderación y sin una evaluación de seguridad propia.
- Los resultados de benchmarks del modelo base no son extrapolables automáticamente al modelo con el adaptador aplicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanishingradient/safety-drift-qwen2.5-7b-roleplay_ultrachat
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de transformers: https://huggingface.co/docs/transformers
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a sitios de apuestas deportivas y ofertas de empleo sin relación con el artefacto, por lo que se han descartado.
