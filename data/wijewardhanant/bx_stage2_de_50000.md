# WijewardhanaNT/bx_stage2_de_50000

## Resumen

`WijewardhanaNT/bx_stage2_de_50000` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario WijewardhanaNT, construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de bajo rango que se cargan junto al modelo base para modificar su comportamiento. El repositorio ocupa 2,4 GB, un tamano coherente con un adaptador LoRA de rango relativamente alto o con múltiples módulos adaptados sobre un transformer de 7 000 millones de parámetros.

La model card es la plantilla por defecto de Hugging Face sin rellenar: no documenta autoría efectiva, datos de entrenamiento, hiperparámetros, licencia ni evaluación. El nombre del repositorio (`bx_stage2_de_50000`) sugiere un entrenamiento en dos etapas sobre un subconjunto de 50 000 ejemplos, posiblemente en alemán (`de`) o con una etapa denominada "de", pero esta interpretación no está confirmada por el autor.

Su relevancia práctica es limitada y condicionada: se desconoce el objetivo del ajuste fino, no hay benchmarks publicados y la licencia del modelo base (Llama 2 Community License) impone restricciones que se heredan. Se recomienda tratarlo como un artefacto experimental de trazabilidad incierta antes que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 2 7B) con adaptador LoRA (PEFT) |
| Parametros totales | 7 000 millones en el modelo base; el adaptador suma un numero no especificado (repo de 2,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4 096 tokens (valor por defecto de Llama 2 7B; no confirmado para el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite cuantizacion estandar: 8-bit, 4-bit NF4/GPTQ/AWQ) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles; el sufijo `de` del nombre no esta confirmado) |
| Licencia | no disponible en el repo; el modelo base se rige por Llama 2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura de Llama 2 7B: un transformer decoder-only con 32 capas, atención multi-cabeza con RoPE, normalización RMSNorm, activación SwiGLU y 4 096 tokens de contexto. Sobre esa base se aplica una adaptación LoRA, que congela los pesos originales e inserta matrices de bajo rango entrenables en determinadas proyecciones lineales. El repositorio declara PEFT 0.21.0 como versión de framework.

No hay información sobre el dataset, el numero de tokens vistos, la composición de los datos, el rango del adaptador, el alpha, el dropout ni la tasa de aprendizaje. El nombre `bx_stage2_de_50000` apunta a un entrenamiento por etapas con 50 000 ejemplos en la segunda fase, pero el autor no lo documenta. Tampoco consta si hubo RLHF, DPO o ajuste supervisado convencional. No se puede confirmar ninguna innovación técnica especifica del adaptador.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Llama 2 7B.
- Razonamiento y respuesta a instrucciones en la medida en que el ajuste LoRA lo haya reforzado (no verificado).
- Capacidad de código y matemáticas potencialmente presente por herencia del base, sin evidencia de mejora.
- Soporte multilingüe limitado al del modelo base (principalmente ingles); el posible enfoque en alemán no esta confirmado.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explicito.
- No se documentan capacidades de visión, audio ni agentes multi-paso.
- El adaptador es combinable con el base mediante `PeftModel.from_pretrained`, lo que permite cargarlo y descargarlo sin duplicar los 7B de pesos.

## Casos de uso

- Evaluación experimental de adaptadores LoRA: cargar el adaptador sobre Llama 2 7B con PEFT para inspeccionar que comportamiento modifica, dado que no hay documentación del autor.
- Reproducción de pipelines de ajuste fino en dos etapas: usar el artefacto como referencia de estructura de repositorio para entrenamientos propios con `stage1`/`stage2`.
- Investigación sobre adaptadores no documentados: analizar la magnitud y distribución de los pesos LoRA para inferir que capas se adaptaron y con que intensidad.
- Pruebas de compatibilidad de ecosistema: verificar la carga del adaptador en versiones recientes de PEFT, Transformers y stacks de inferencia (vLLM con soporte LoRA, TGI).
- Base para un ajuste posterior propio: partir del adaptador como inicialización y continuar el entrenamiento con datos propios y documentados.
- Docencia y demostraciones de PEFT: ejemplo de repositorio mínimo de adaptador con model card incompleta, útil para ilustrar buenas y malas prácticas de publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base en precisión completa (fp16): aproximadamente 14 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM con cuantizacion 8-bit: en torno a 7-8 GB; con 4-bit (NF4/GPTQ/AWQ): en torno a 4-5 GB, más overhead.
- El adaptador LoRA en si ocupa 2,4 GB en disco y se suma a la memoria del base al cargarse (a menos que se fusione y recuantice).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en fp16 con lotes grandes; RTX 4090 (24 GB) para fp16 con lotes moderados; RTX 3090/4080 (16-24 GB) para cuantizacion 8-bit; GPUs de 8-12 GB solo con cuantizacion 4-bit.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores, con cuantizacion.
- Opciones de despliegue: vLLM (con soporte LoRA), TGI, llama.cpp (requiere fusionar el adaptador y convertir a GGUF), Ollama (previo fusionado y conversion), Transformers + PEFT para prototipado.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion, y no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Documentacion |
|---|---|---|---|---|---|
| WijewardhanaNT/bx_stage2_de_50000 | 7B (base) + LoRA | 4 096 (base) | safetensors (PEFT) | no disponible (hereda Llama 2) | model card vacia |
| meta-llama/Llama-2-7b-hf | 7B | 4 096 | safetensors | Llama 2 Community License | model card completa |
| meta-llama/Llama-2-7b-chat-hf | 7B | 4 096 | safetensors | Llama 2 Community License | model card completa, benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32 768 | safetensors | Apache 2.0 | model card completa, benchmarks publicados |

El adaptador no aporta información verificable que permita compararlo en rendimiento con estas alternativas; la comparación se limita a parametros, contexto y licencia del modelo base sobre el que se apoya.

## Limitaciones y advertencias

- Model card sin contenido: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el ajuste.
- Trazabilidad incierta: el autor no documenta el objetivo del entrenamiento ni el significado de `bx_stage2_de_50000`.
- Licencia no declarada en el repositorio; el uso comercial queda sujeto a la Llama 2 Community License del modelo base (restricciones para empresas con más de 700 millones de usuarios mensuales, entre otras).
- Riesgo de alucinación heredado del modelo base, sin mitigaciones documentadas.
- Sesgos potenciales del base (Llama 2) más los sesgos introducidos por un dataset de ajuste desconocido.
- Contexto limitado a 4 096 tokens en el base; no hay evidencia de extensión en el adaptador.
- Idiomas: sin confirmación de cobertura multilingüe; el base esta orientado al ingles.
- No hay garantías de soporte de tool calling ni de comportamiento agéntico.
- Sin descargas ni likes en el momento de la consulta: ausencia de validación por parte de la comunidad.
- No apto para producción sin una evaluación propia exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WijewardhanaNT/bx_stage2_de_50000
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
