# Studio-Research-M1/Feyospace-s1-obliterated-oQ8e-FP16-MTP-MLX

## Resumen

Feyospace s1 obliterated — oQ8e es una cuantización en formato MLX, orientada a Apple Silicon, del modelo OBLITERATUS/feyospace-s1-obliterated, una versión "abliterated" (con restricciones de seguridad eliminadas) y enfocada a ciberseguridad del modelo feyospace/feyospace-v1.1-small de 28B parámetros, basado en la arquitectura Qwen3.5. El repo ha sido publicado por Studio-Research-M1 y forma parte de una familia de tres cuantizaciones (oQ4e, oQ6e y oQ8e), siendo esta la de mayor fidelidad respecto al modelo original en BF16.

La variante oQ8e ocupa 30,9 GB y emplea precisión mixta: escalas, sesgos y tensores de texto no cuantizados en FP16 (ya que las GPU de los chips M1 carecen de BF16 hardware), mientras que la torre de visión se mantiene en FP32. Se conserva además la cabeza MTP (multi-token prediction) para habilitar decodificación especulativa en motores compatibles.

Su relevancia radica en que permite ejecutar localmente, en Macs con Apple Silicon (especialmente la generación M1 / M1 Pro / M1 Max), un modelo multimodal de 28B parámetros sin restricciones de alineación, con un error KLD medio de solo 0,00161 frente al BF16 original. Al tratarse de un modelo abliterated, debe evaluarse con especial cautela su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (image-text-to-text, multimodal) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (precisión mixta: tensores cuantizados oQ + escalas/sesgos/tensores de texto en FP16, torre de visión en FP32) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base, feyospace-v1.1-small, es un modelo de 28B parámetros con arquitectura Qwen3.5 y capacidades image-text-to-text (multimodal, con torre de visión). Sobre él, OBLITERATUS aplicó un proceso de abliteration orientado a ciberseguridad, eliminando los mecanismos de rechazo del modelo para hacerlo "uncensored". Sobre esa versión abliterated, Studio-Research-M1 generó esta cuantización oQ8e en formato MLX.

Detalles técnicos de la cuantización destacables:

- FP16 para escalas, sesgos y tensores de texto no cuantizados, dado que las GPU M1 no disponen de BF16 hardware. Según el autor, la perplejidad y el KLD se mantienen finitos sobre las 32.768 posiciones evaluadas de WikiText-2, sin salidas degeneradas en las pruebas.
- La cabeza MTP (29 tensores, cuantizados) se conserva en todas las variantes, lo que permite decodificación especulativa sin configuración adicional en motores que la soporten, como oMLX con *Lightning MTP*.
- Los pesos de la torre de visión se mantienen en FP32 (333 tensores).
- Fidelidad medida: KLD medio frente al BF16 de 0,0266 (oQ4e) a 0,00161 (oQ8e).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional (pipeline image-text-to-text).
- Comprensión de imágenes y texto (multimodal), aunque la visión no ha sido evaluada por el autor y existe una nota de compatibilidad pendiente sobre los ficheros de procesador.
- Enfoque especializado en ciberseguridad, derivado de la abliteration dirigida del modelo base.
- Seguimiento de instrucciones, con la variante oQ8e descrita como la de mejor seguimiento de instrucciones de la familia.
- Soporte de decodificación especulativa mediante la cabeza MTP conservada (29 tensores), funcionando de serie en motores compatibles como oMLX *Lightning MTP*.
- No se dispone de información sobre tool calling, capacidades de agente ni modo de razonamiento explícito.

## Casos de uso

- Investigación en seguridad ofensiva y defensiva: el modelo, abliterated y orientado a ciberseguridad, puede asistir en análisis de vulnerabilidades, redacción de exploits educativos o revisión de código malicioso sin rechazos del alineamiento, algo que modelos estándar bloquean.
- Ejecución local en Macs con Apple Silicon: la cuantización MLX con FP16 permite cargar el modelo en chips M1 / M1 Pro / M1 Max, útil para entornos sin acceso a GPU de datacenter o con requisitos de privacidad (datos que no pueden salir de la máquina).
- Pruebas de decodificación especulativa: la cabeza MTP conservada permite acelerar la inferencia en motores como oMLX *Lightning MTP*, adecuado para experimentar con técnicas de aceleración de generación.
- Comparación de fidelidad entre cuantizaciones: con tres variantes (oQ4e, oQ6e, oQ8e) y métricas KLD publicadas, es útil como banco de pruebas para estudiar el impacto de la cuantización en modelos multimodales de 28B.
- Asistente conversacional sin restricciones para investigación: al tratarse de un modelo uncensored, puede emplearse en estudios sobre abliteration, sus efectos en la calidad de salida y los riesgos asociados.
- Prototipado multimodal local: conserva la torre de visión en FP32, por lo que puede explorarse la entrada de imágenes en flujos de trabajo locales, aunque sin garantías de rendimiento evaluado en esa modalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento publicado por el autor es la fidelidad de la cuantización:

| Métrica | Valor |
|---|---|
| KLD medio vs BF16 (oQ8e) | 0,00161 |
| KLD medio vs BF16 (oQ4e, referencia) | 0,0266 |
| Evaluación de perplejidad/KLD | 32.768 posiciones de WikiText-2, valores finitos |
| Benchmark de visión | no disponible (no evaluado por el autor) |

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repo oQ8e ocupa 30,9 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible más margen para el KV cache; en la práctica, un Mac con 36 GB o más de RAM unificada (la model card lo orienta a M1 / M1 Pro / M1 Max, cuyo tope es de 64 GB).
- Las variantes alternativas reducen el requisito: oQ6e (24,64 GB) y oQ4e (17,97 GB), esta última viable en Macs de 24 GB.
- No requiere GPU dedicada: está diseñado para Apple Silicon (GPU integrada, sin BF16 hardware, de ahí el uso de FP16).
- Opciones de despliegue: oMLX (con soporte *Lightning MTP* para decodificación especulativa), LM Studio y `mlx_lm.load`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, al tratarse de un formato MLX específico de Apple Silicon.
- Latencia y throughput: no disponible; el autor indica que oQ4e es la variante más rápida (especialmente en código con MTP) y que oQ6e tiene MTP desactivado, pero no publica cifras de tokens/segundo.

## Comparativa con modelos similares

Comparativa entre las tres variantes de la familia publicadas por el mismo autor (datos de la model card):

| Variante | Tamaño | Fidelidad (KLD vs BF16) | MTP | Ideal para |
|---|---|---|---|---|
| oQ4e | 17,97 GB | 0,0266 | Activado | Máxima velocidad, código con MTP |
| oQ6e | 24,64 GB | no disponible | Desactivado | Punto medio |
| oQ8e (esta) | 30,9 GB | 0,00161 | Activado | Máxima fidelidad, mejor seguimiento de instrucciones |

Frente a modelos alternativos de tamaño similar (Qwen3.5 de 28B en otras cuantizaciones GGUF, o modelos multimodales de ~30B para Apple Silicon): no disponible; no se han publicado comparativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated / uncensored: se han eliminado deliberadamente los mecanismos de rechazo. Esto implica un riesgo elevado de generación de contenido dañino y lo hace inadecuado para entornos de producción sin controles adicionales. Su uso ético y legal es responsabilidad del usuario.
- Riesgo de alucinación: no disponible; no se han publicado evaluaciones al respecto.
- La capacidad de visión no ha sido evaluada por el autor y existe una nota de compatibilidad pendiente sobre los ficheros de procesador, por lo que la modalidad multimodal puede no funcionar de forma fiable.
- Idioma: la model card declara únicamente el inglés; el rendimiento en castellano no está documentado.
- Longitud de contexto: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse también la licencia del modelo base y las condiciones del modelo original feyospace/feyospace-v1.1-small.
- La torre de visión se mantiene en FP32 (333 tensores), lo que añade peso al repo frente a una versión solo de texto.
- Comunidad muy reducida (40 descargas y 1 like en el momento de la ficha), sin auditoría externa de la calidad de la cuantización ni del proceso de abliteration.
- Optimizado para la generación M1; los builds con escalas BF16 para chips M2 a M5 se anuncian como trabajo futuro.

## Enlaces

- Repositorio de esta variante (oQ8e): https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ8e-FP16-MTP-MLX
- Variante oQ4e: https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ4e-FP16-MTP-MLX
- Variante oQ6e: https://huggingface.co/Studio-Research-M1/Feyospace-s1-obliterated-oQ6e-FP16-MTP-MLX
- Colección completa de la familia: https://huggingface.co/collections/Studio-Research-M1/feyospace-s1-obliterated-28b-oq-mlx-apple-silicon-6ae4d395d2f87e2ae7ec4e5d
- Modelo base (abliterated): https://huggingface.co/OBLITERATUS/feyospace-s1-obliterated
- Modelo original: https://huggingface.co/feyospace/feyospace-v1.1-small
