# zybian222/olmo3-7b-omi-olmo-core-adamw-20261121t220749z

## Resumen

OLMo-3 7B OMI SFT adamw es un ajuste fino supervisado (SFT) del modelo base allenai/Olmo-3-1025-7B, publicado por el usuario zybian222 en Hugging Face. El modelo conserva la arquitectura y el tamano del OLMo 3 de 7B de AI2 (Allen Institute for AI) y se ha entrenado con el framework OLMo-core nativo sobre el dataset NVIDIA OpenMathInstruct-2, orientado a matematicas, usando enmascarado de respuestas (response masks) y atencion aislada por documento.

La relevancia de esta ficha es doble: por un lado, documenta un ajuste fino reproducible sobre la pila open source de AI2 (OLMo-core), lo que permite inspeccionar la receta completa; por otro, sirve como ejemplo de fine-tuning especializado en razonamiento matematico sobre un modelo base abierto y con licencia Apache 2.0. El repositorio incluye un archivo run_config.json con los hiperparametros del optimizador, la duracion del entrenamiento y las diferencias respecto a la receta upstream.

No obstante, la informacion publica es muy limitada: la model card es minima, no se han publicado resultados de benchmarks ni una descripcion detallada de la composicion final del dataset o del proceso de alineamiento. El modelo tiene un uso muy bajo (10 descargas en el momento de la consulta), por lo que debe tratarse como un experimento de fine-tuning mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3 de AI2); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 7.298.011.136 (7,3 mil millones, segun safetensors) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del OLMo-3-1025-7B de AI2, un transformer decoder-only de aproximadamente 7.300 millones de parametros. El entrenamiento se realizo con OLMo-core nativo, la pila de entrenamiento open source de AI2, usando empaquetado de secuencias (packed SFT) con mascaras de respuesta para que la perdida solo se calcule sobre los tokens del asistente, y atencion aislada por documento para evitar contaminacion entre ejemplos empaquetados en la misma secuencia.

El dataset de entrenamiento es NVIDIA OpenMathInstruct-2 (licencia CC BY 4.0), un corpus orientado a instrucciones y razonamiento matematico. El autor indica que se trata de una ejecucion completa ("full run") y remite a run_config.json para los detalles del optimizador (AdamW), la duracion del entrenamiento, las fuentes fijadas (pinned sources) y las diferencias respecto a la receta upstream. No se documenta en la informacion disponible si hubo fases de RLHF, DPO u otro alineamiento posterior al SFT, ni el numero exacto de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional en formato instruct (pipeline text-generation, tag conversational).
- Razonamiento matematico y resolucion de problemas, derivado del entrenamiento sobre OpenMathInstruct-2.
- Generacion de codigo y matematicas basicas, heredadas del modelo base OLMo 3.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Fine-tuning academico reproducible: sirve como referencia para investigadores que quieran replicar o extender una receta SFT sobre OLMo-core con mascaras de respuesta y atencion aislada por documento.
- Evaluacion de tecnicas de empaquetado de secuencias: el modelo permite estudiar el impacto del packed SFT y del document-isolated attention en la calidad final frente a recetas convencionales.
- Generacion de explicaciones matematicas: al haberse entrenado sobre OpenMathInstruct-2, puede usarse para producir soluciones paso a paso en tareas de algebra, aritmetica y problemas de nivel escolar, siempre con validacion posterior.
- Base para investigacion en razonamiento: punto de partida para experimentos de destilacion, DPO o RL sobre un modelo abierto de 7B con licencia permisiva.
- Prototipado de tutores matematicos: integrable en demos de asistencia educativa donde se necesite un modelo pequeno y autoalojado, sujeto a evaluacion previa de calidad.
- Estudio comparativo de ajustes finos: util para comparar el efecto de distintos optimizadores (AdamW frente a alternativas) sobre el mismo modelo base y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 14-15 GB solo para pesos; con overhead de activaciones y cache KV, se recomienda 20-24 GB. En cuantizacion de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), y previsiblemente vLLM, TGI o llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3 7B OMI SFT adamw (este modelo) | 7,3 B | no disponible | Apache 2.0 | SFT sobre OpenMathInstruct-2; sin benchmarks publicados |
| allenai/Olmo-3-1025-7B (base) | ~7 B | no disponible | Apache 2.0 | Modelo base upstream de AI2; referencia directa de este ajuste |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Alternativa generalista de 7B con benchmarks publicos |
| Llama 3.1 8B Instruct | ~8 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.1 Community License | Alternativa generalista; licencia con restricciones de uso comercial |

Los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica; no se dispone de comparaciones de rendimiento con este modelo concreto.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de la calidad del ajuste frente al modelo base.
- Model card minima: no se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni el proceso de filtrado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir razonamientos matematicos incorrectos con apariencia de correccion; requiere verificacion.
- Especializacion estrecha: el entrenamiento sobre OpenMathInstruct-2 puede degradar capacidades generales del modelo base (olvido catastrofico) fuera del dominio matematico.
- Idiomas: no se documenta que idiomas soporta; el dataset de entrenamiento esta principalmente en ingles.
- Licencia Apache 2.0 permisiva para uso comercial, pero el dataset OpenMathInstruct-2 tiene licencia CC BY 4.0, que exige atribucion.
- Uso muy bajo (10 descargas) y sin validacion de la comunidad: no recomendable como dependencia de produccion sin evaluacion propia.
- No se documentan capacidades de tool calling, agentes ni modo thinking, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zybian222/olmo3-7b-omi-olmo-core-adamw-20261121t220749z
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset OpenMathInstruct-2 (NVIDIA): https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- OLMo-core (repositorio de entrenamiento de AI2): https://github.com/allenai/OLMo-core
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web proporcionada.
