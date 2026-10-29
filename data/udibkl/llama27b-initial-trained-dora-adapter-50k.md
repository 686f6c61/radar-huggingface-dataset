# udibkl/llama27b-initial-trained-dora-adapter-50k

## Resumen

`udibkl/llama27b-initial-trained-dora-adapter-50k` es un adaptador de ajuste fino publicado en HuggingFace por el usuario `udibkl`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) que debe cargarse sobre el modelo base `meta-llama/Llama-2-7b-hf` mediante la librería PEFT. El repositorio ocupa 0,2 GB y contiene únicamente los tensores del adaptador en formato safetensors.

El modelo resuelve un problema acotado: permitir reproducir o reutilizar un entrenamiento de ajuste fino concreto sobre Llama-2-7B sin necesidad de redistribuir los 13,5 GB de pesos del modelo base. DoRA descompone cada matriz de pesos en una componente de magnitud y una componente de dirección, y aplica la actualización de bajo rango solo sobre esta última; en la literatura se reporta que esta formulación converge de forma más estable que LoRA con rangos bajos, aunque en este repositorio no se documenta ningún resultado que lo confirme.

La relevancia es principalmente metodológica y de investigación: la model card es la plantilla por defecto de HuggingFace sin rellenar, no hay licencia declarada, no hay idiomas declarados, no hay dataset de entrenamiento documentado y no se han publicado evaluaciones. El sufijo `50k` del nombre sugiere 50.000 pasos o 50.000 muestras de entrenamiento, pero el autor no lo especifica. Debe tratarse, por tanto, como un artefacto de experimentación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (PEFT) sobre un transformer decoder-only denso (Llama-2-7b-hf) |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 6.740 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens, heredada del modelo base Llama-2-7b-hf |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar; una vez fusionado con el modelo base admite las cuantizaciones habituales (GGUF Q4_K_M, Q5_K_M, Q8_0, bitsandbytes 4/8 bits), aunque no se han publicado ficheros preconvertidos |
| Idiomas soportados | No disponible (el modelo base está entrenado mayoritariamente en inglés) |
| Licencia | No disponible en el repositorio del adaptador; el modelo base se rige por la Llama 2 Community License |
| Formato de pesos | safetensors (adaptador PEFT, `library_name: peft`, PEFT 0.21.2) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-2-7B, un transformer decoder-only con 32 capas, dimensión oculta de 4.096, 32 cabezas de atención (atención multi-cabeza, sin GQA en la variante de 7B), FFN de 11.008 con activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE), con un vocabulario de 32.000 tokens. El modelo base fue preentrenado con 2 billones de tokens y posteriormente alineado con RLHF (rechazo de muestras + PPO). Estas cifras corresponden al modelo base publicado por Meta y no al adaptador.

Sobre esa base, el autor aplica DoRA, una variante de LoRA que descompone cada matriz de pesos preentrenada \(W\) en magnitud \(m\) y dirección \(V\), y entrena únicamente un par de matrices de bajo rango que actualizan la dirección, junto con el vector de magnitud. Frente a LoRA, DoRA separa explícitamente el cambio de escala del cambio direccional, lo que en los experimentos del paper original mejora la aproximación al ajuste fino completo con el mismo presupuesto de parámetros. El repositorio no documenta el rango utilizado, el valor de alpha, el dropout, la tasa de aprendizaje, el número de tokens vistos ni la composición del dataset de entrenamiento; tampoco indica si hubo una fase de alineación adicional (SFT, DPO o RLHF) tras el ajuste. La única referencia técnica del README, `arxiv:1910.09700`, corresponde a la calculadora de impacto ambiental de Lacoste et al. y proviene de la plantilla por defecto, no de un paper sobre este modelo.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada íntegramente del modelo base Llama-2-7b-hf.
- Razonamiento básico y respuesta a instrucciones: el efecto real del adaptador sobre estas capacidades es desconocido, al no haber evaluaciones publicadas.
- Generación de código: el modelo base tiene un rendimiento bajo en este dominio (HumanEval en torno al 12,8 % según el paper de Llama 2); el adaptador no declara mejoras.
- Capacidades matemáticas limitadas, coherentes con un modelo de 7B de 2023.
- Sin soporte nativo de tool calling ni function calling: Llama-2 base no fue entrenado con formato de herramientas; cualquier uso agéntico requiere prompting manual o un ajuste adicional.
- Sin capacidades multimodales (visión, audio) ni modo de razonamiento explícito (thinking mode).
- Multilingüe limitado: el modelo base está dominado por el inglés y no declara cobertura fiable de castellano.
- Capacidad destacable únicamente a nivel de artefacto: sirve como referencia reproducible de un pipeline DoRA con PEFT.

## Casos de uso

- Reproducción de experimentos de PEFT: cargar el adaptador con `PeftModel.from_pretrained` sobre Llama-2-7b-hf para comparar la curva de convergencia de DoRA frente al adaptador LoRA gemelo del mismo autor (`udibkl/llama27b-initial-trained-lora-adapter-50k`), manteniendo constante el resto del pipeline.
- Estudio académico de DoRA: analizar la descomposición magnitud/dirección de los pesos aprendidos, comparar la norma de la actualización por capa y medir la desviación respecto al ajuste fino completo.
- Punto de partida para un ajuste adicional: usar este adaptador como inicialización en lugar de partir del modelo base, aprovechando que el repositorio pesa solo 0,2 GB y cabe en cualquier entorno de desarrollo.
- Docencia y formación técnica: ejemplo práctico y ligero de cómo se distribuye y se carga un adaptador DoRA, sin necesidad de descargar ni servir un modelo de 7B para inspeccionar los tensores.
- Generación de texto genérica en inglés con despliegue mínimo: al fusionar el adaptador y cuantizar a 4 bits, puede servir como modelo de pruebas en una GPU de consumo para prototipos de chatbots, asumiendo la calidad propia de Llama-2-7B.
- Base para evaluación comparativa interna: incluirlo como línea base en un banco de pruebas propio de instrucciones, siempre que se documente que no existen métricas publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye ninguna tabla de evaluación, ni dataset de test, ni métricas de pérdida.

Como referencia externa, y sin que haya sido medida sobre este adaptador, el modelo base Llama-2-7b presenta cifras aproximadas de ≈45,3 en MMLU (5-shot), ≈12,8 en HumanEval (pass@1) y ≈14,6 en GSM8K (8-shot) según el paper de Llama 2. Cualquier variación atribuible al adaptador es desconocida.

| Modelo | MMLU | HumanEval | GSM8K |
|---|---|---|---|
| Este adaptador DoRA | no disponible | no disponible | no disponible |
| Llama-2-7b (referencia pública, sin adaptador) | ≈45,3 | ≈12,8 | ≈14,6 |

## Requisitos de hardware

- VRAM para el adaptador solo: 0,2 GB en disco; en memoria, unos pocos cientos de MB al cargarse junto al modelo base.
- VRAM para inferencia real: el adaptador no funciona sin Llama-2-7b-hf. En fp16/bf16 se necesitan aproximadamente 13,5 GB de pesos más la caché KV (con 4.096 tokens de contexto y lote 1, del orden de 2 GB adicionales en fp16), lo que deja el requisito práctico en 16-18 GB.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o L4 para servicio; RTX 4090 (24 GB) o RTX A6000 para fp16 en una sola tarjeta.
- GPU de consumo: sí, cabe en RTX 4090 y 3090/4080 de 24 GB en fp16; en cuantización 4 bits (bitsandbytes NF4) baja a unos 4-5 GB y entra en RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso una RTX 4070.
- Opciones de despliegue: transformers + PEFT (ruta más directa para cargar el adaptador sin fusionar); fusión con `merge_and_unload` y posterior conversión a GGUF para llama.cpp u Ollama; vLLM y TGI admiten adaptadores LoRA dinámicos, pero el soporte específico de DoRA no está confirmado y conviene fusionar antes de servir en producción.
- Latencia y throughput: no disponibles para este adaptador. Como orden de magnitud orientativo, un 7B denso en fp16 genera decenas de tokens por segundo en una RTX 4090 en decodificación de una sola secuencia, y cientos o miles por segundo con batching en A100/H100; son cifras genéricas del tamaño, no medidas sobre este repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `udibkl/llama27b-initial-trained-dora-adapter-50k` | Adaptador DoRA sobre Llama-2-7B | Base: 6,74 B | 4.096 | No declarada | 0 descargas, 0 likes |
| `udibkl/llama27b-initial-trained-lora-adapter-50k` | Adaptador LoRA sobre Llama-2-7B | Base: 6,74 B | 4.096 | No declarada | Mismo autor, misma serie |
| `meta-llama/Llama-2-7b-hf` | Modelo completo base | 6,74 B | 4.096 | Llama 2 Community License | Amplia adopción, finalizado en 2023 |
| `meta-llama/Llama-3.1-8B-Instruct` | Modelo completo, generación posterior | 8,03 B | 128.000 | Llama 3.1 Community License | Sucesor natural para nuevas implantaciones |

Frente al adaptador LoRA del mismo autor, la diferencia es la formulación de la actualización de bajo rango (DoRA descompone magnitud y dirección); no hay datos que permitan afirmar cuál rinde mejor en esta configuración concreta. Frente al modelo base, el adaptador solo aporta lo que haya aprendido en su entrenamiento no documentado. Frente a Llama-3.1-8B-Instruct, la serie Llama 2 queda claramente desfasada en contexto, calidad de instrucciones y soporte de herramientas.

## Limitaciones y advertencias

- Model card vacía: todos los campos de descripción, dataset, hiperparámetros y evaluación contienen la plantilla `[More Information Needed]`. No hay información verificable sobre qué se entrenó.
- Licencia no declarada: no se puede asumir uso comercial. Al derivar de Llama-2-7b-hf, se heredan las restricciones de la Llama 2 Community License (límite de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo «Llama» en la interfaz, restricciones de uso aceptable).
- Riesgo de alucinación alto, propio de Llama-2-7B base, que no ha pasado por un ajuste de instrucciones verificado en este repositorio.
- Sesgos desconocidos y no documentados: el dataset de entrenamiento no se identifica, por lo que no se puede evaluar la contaminación ni la composición demográfica.
- Idiomas: sin declaración de cobertura; se espera un rendimiento notablemente peor en castellano que en inglés.
- Ventana de contexto de 4.096 tokens, insuficiente para casos de uso actuales de documentación larga o agentes con historial extenso.
- Ausencia de soporte nativo de tool calling y de plantilla de chat verificada; el adaptador no incluye tokenizador ni `chat_template` propios.
- Validez incierta del ajuste: 0 descargas y 0 likes, sin señales de validación por terceros. No debe usarse como componente crítico en producción sin una evaluación propia.
- Riesgo de fuga de datos si el entrenamiento incluyó datos privados; no hay declaración al respecto.
- Incompatibilidad potencial con herramientas que no soportan DoRA (algunas versiones de servidores de inferencia solo reconocen LoRA); se recomienda fusionar el adaptador antes de desplegar.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/udibkl/llama27b-initial-trained-dora-adapter-50k
- Adaptador LoRA gemelo del mismo autor: https://huggingface.co/udibkl/llama27b-initial-trained-lora-adapter-50k
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Librería PEFT (HuggingFace): https://github.com/huggingface/peft
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): https://arxiv.org/abs/2402.09353
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Calculadora de impacto ambiental citada en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700 y https://mlco2.github.io/impact
- Artículo introductorio sobre métodos de adaptación ligera en LLaMA (contexto general, no específico de este adaptador): https://www.marktechpost.com/2023/03/31/meet-llama-adapter-a-lightweight-adaption-method-for-fine-tuning-instruction-following-llama-models-using-52k-data-provided-by-stanford-alpaca/
- Guía genérica de ajuste fino con LoRA y QLoRA (material de contexto, no oficial del modelo): https://www.sitepoint.com/fine-tune-local-llms-2026/
