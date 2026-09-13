# SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic

## Resumen

Gemma-4-26B-A4B-StyleTune-QK-Heretic es un merge experimental publicado por el usuario SubMaroon sobre la familia Gemma 4 en su variante 26B-A4B, una arquitectura de mezcla de expertos (MoE) con 26.544.133.710 parámetros totales. No se trata de un modelo entrenado desde cero, sino de una combinación quirúrgica de tres linajes: el cuerpo abliterado de `coder3101/gemma-4-26B-A4B-it-heretic`, la cabeza `lm_head` de `Gryphe/Gemma-4-26B-A4B-StyleTune-V2` y una interpolación de las proyecciones `q_proj` y `k_proj` procedente de `Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2`.

El modelo resuelve un problema muy concreto dentro del ecosistema de modelos derivados: proporcionar un punto de partida estable para nuevos finetunes y merges, con las direcciones de rechazo ablacionadas, una cabeza de estilo roleplay y un enrutamiento de atención rotado hacia ese mismo estilo. El autor documenta de forma inusualmente detallada el alcance de cada edición, incluyendo normas de Frobenius y ángulos de rotación por fila de los 60 tensores QK modificados, lo que lo convierte en un caso interesante para estudiar técnicas de merging.

Su relevancia es acotada y experimental: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, solo cubre inglés, no publica benchmarks estándar y no incluye cuantizaciones. Está pensado como material base para la comunidad de merges, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, familia Gemma 4 (etiqueta `gemma4`); 30 capas transformer, capas globales en 5, 11, 17, 23 y 29, y torre de visión |
| Parámetros totales | 26.544.133.710 (26,5 B) |
| Parámetros activos | aproximadamente 4 B según la nomenclatura A4B del nombre; no confirmado explícitamente en la información proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio publica únicamente pesos en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 53,1 GB) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es un merge de tres componentes. El cuerpo procede de `coder3101/gemma-4-26B-A4B-it-heretic`, una variante abliterada mediante la técnica Heretic ARA aplicada a las capas 10-30 con una divergencia KL de 0,0499. Sobre ese cuerpo se sustituye únicamente el `lm_head`, tomado de `Gryphe/Gemma-4-26B-A4B-StyleTune-V2`, con `tie_word_embeddings` puesto a `false`. El tercer componente son las proyecciones `q_proj` y `k_proj` (60 tensores en total), interpoladas según `base + a * (Pantheon-Reasoning-1.1-V2 - gemma-4-26B-A4B-it)`, con alpha 0,85 en las capas de atención deslizante y 0,65 en las globales.

El detalle técnico más relevante es el tratamiento de las capas globales, donde no existe `v_proj` y `k_proj` desempeña simultáneamente el papel de claves y valores. Por ese motivo el alpha en las capas globales es inferior: un valor distinto de cero inyecta contenido del modelo donante también en el flujo residual. El autor justifica mantenerlo no nulo para que consultas y claves roten conjuntamente. Como Gemma aplica RMSNorm después de `q_proj` y `k_proj`, el reescalado uniforme de estos pesos no afecta a la atención, de modo que solo la rotación resulta significativa.

Los expertos MoE, el router, los embeddings, las capas MLP y la torre de visión son bit a bit idénticos al cuerpo abliterado, verificado por comparación de tensores. El autor comprobó además que las 30 capas transformer de StyleTune-V2 son idénticas a las de vanilla, lo que justifica usar vanilla como referencia del vector de tarea. Magnitud de la edición QK, medida antes del merge como norma de Frobenius relativa:

| Grupo | Media | Máximo |
|---|---|---|
| sliding_q | 0,00278 | 0,00518 |
| sliding_k | 0,00263 | 0,00474 |
| global_q | 0,00356 | 0,00436 |
| global_k | 0,00286 | 0,00395 |

Rotación por fila, en grados, con los alphas de publicación:

| Grupo | Alpha | Media | Máximo |
|---|---|---|---|
| sliding_q | 0,85 | 0,12 | 3,08 |
| sliding_k | 0,85 | 0,12 | 5,87 |
| global_q | 0,65 | 0,12 | 1,72 |
| global_k | 0,65 | 0,09 | 9,53 |

La rotación se concentra en un número reducido de filas: la relación entre máximo y media va de aproximadamente 14 en `global_q` a 106 en `global_k`.

## Capacidades

- Generación de texto en inglés, con el foco puesto en prosa narrativa y roleplay, tal como reflejan las etiquetas `roleplay` y `merge` del repositorio.
- Razonamiento: el linaje incluye `Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2`, un modelo orientado a razonamiento, del que se importan las proyecciones QK.
- Ausencia de rechazos: las direcciones de rechazo del cuerpo original están ablacionadas, por lo que el modelo no aplica las negativas típicas del modelo instruct original.
- Capacidad multimodal: la torre de visión se conserva intacta del cuerpo de partida, lo que implica soporte de entrada de imágenes. El autor no documenta pruebas específicas de visión.
- Estilo de roleplay: la cabeza `lm_head` procede de un finetune de estilo, y el enrutamiento de atención se interpola hacia ese mismo finetune.
- Bloque de pensamiento: el autor menciona mediciones de longitud de «thinking block», lo que sugiere un modo de razonamiento con bloque de pensamiento; no se documenta formalmente su funcionamiento.
- Tool calling o function calling: no disponible, no documentado.
- Capacidades de agente o razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: limitadas a inglés según el campo `language` y la etiqueta `en`.

## Casos de uso

- Punto de partida para finetunes y merges: es el uso que el propio autor declara. Un desarrollador puede tomar estos pesos como base para entrenar adaptadores LoRA o para construir nuevos merges, aprovechando que los componentes MoE y MLP están intactos y verificados frente al cuerpo original.
- Roleplay conversacional y narrativa interactiva: la combinación de cabeza de estilo y rotación QK hacia un finetune de roleplay busca que el modelo se ciña a la situación descrita en el prompt, con sus participantes y sus acciones, en lugar de derivar hacia descripciones genéricas de emociones.
- Escritura de ficción y generación creativa en inglés: con una longitud media de prosa de 1487 caracteres y una longitud media de palabra de 4,52 en las pruebas del autor, el modelo está calibrado para producir texto narrativo de extensión media en una sola pasada.
- Investigación sobre alineación y abliteration: al estar las direcciones de rechazo ablacionadas y documentadas, resulta útil para estudiar cómo se comporta un modelo sin mecanismos de negativa, y para comparar contra su cuerpo de origen en experimentos controlados.
- Estudio de técnicas de merging: las tablas de normas de Frobenius y ángulos de rotación permiten reproducir el efecto aislado de 60 tensores QK sobre el comportamiento final, con dos brazos idénticos salvo en esos tensores.
- Evaluación de transferencia de estilo vía `lm_head`: la sustitución de la cabeza con `tie_word_embeddings` a `false` permite aislar cuánto del estilo proviene de la cabeza y cuánto del enrutamiento de atención.
- Experimentación multimodal: al conservarse la torre de visión, es posible probar tareas de descripción de imágenes o diálogo sobre imagen, siempre con la advertencia de que el autor no documenta evaluación alguna en este terreno.
- Red-teaming y análisis de robustez: la ausencia de rechazos lo convierte en un candidato para probar filtros de seguridad externos y medir su eficacia antes de desplegar cualquier derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. La única comparación cuantitativa del repositorio aísla el paso QK y enfrenta dos brazos idénticos (cuerpo abliterado más cabeza StyleTune) que solo difieren en los 60 tensores QK, con cuatro prompts, dos ligeros y dos oscuros, decodificación greedy, dos modos por prompt y un presupuesto de 2500 tokens:

| Métrica | Antes del QK | Después del QK |
|---|---|---|
| Ratio tipo/token | 0,412 | 0,392 |
| Longitud media de prosa (caracteres) | 1443 | 1487 |
| Longitud media de palabra (caracteres) | 4,49 | 4,52 |
| Terminación normal de las generaciones | sí | sí |

En evaluación cualitativa, el autor indica que el merge actúa con más frecuencia sobre la situación concreta del prompt. En un caso sobre la descubierta de que una parte de confianza ya ha firmado en contra del personaje, la versión previa al QK escribe sobre el sentimiento de traición mientras que el merge identifica el documento, la caligrafía discordante y la reunión previa. El autor advierte que la caída de diversidad léxica puede ser ruido con ese tamaño de muestra, pero subraya que no repunta. La longitud del bloque de pensamiento evolucionó en direcciones opuestas en dos conjuntos de prompts distintos y por eso no se reporta.

## Requisitos de hardware

- Pesos en bf16 o fp16: el repositorio ocupa 53,1 GB, de modo que la inferencia sin cuantizar requiere al menos 53 GB solo para los pesos, más caché KV y activaciones. En la práctica exige una H100 de 80 GB o dos A100 de 40 GB, con margen escaso para contextos largos.
- Cuantización de 4 bits (estimación): los 26,5 B de parámetros ocuparían aproximadamente 14-16 GB, lo que permitiría ejecución en una RTX 4090 o RTX 3090 de 24 GB. Es una estimación propia, no un dato publicado.
- Cuantización de 8 bits (estimación): alrededor de 27-28 GB, lo que obliga a GPU de 40 GB o superiores. No hay cuantizaciones publicadas en el repositorio.
- Coste computacional: al tratarse de un MoE con aproximadamente 4 B de parámetros activos, el coste por token se aproxima al de un modelo denso de ese tamaño, mientras que el requisito de memoria se corresponde con los 26,5 B totales.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090, RTX 3090 o similares de 24 GB para 4 bits.
- Opciones de despliegue: vLLM, TGI, SGLang o transformers para safetensors. Ollama y llama.cpp requerirían una conversión a GGUF que el autor no proporciona, y el soporte de esta arquitectura MoE concreta en llama.cpp no está confirmado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de ninguno de los modelos implicados, por lo que la comparación se limita a composición, licencia y papel dentro del merge.

| Modelo | Papel en este merge | Parámetros | Licencia | Contexto | Benchmarks |
|---|---|---|---|---|---|
| SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic | Resultado final: cuerpo abliterado, cabeza de estilo y QK interpolado | 26,5 B totales, ~4 B activos | apache-2.0 | no disponible | no disponible |
| coder3101/gemma-4-26B-A4B-it-heretic | Cuerpo abliterado (Heretic ARA, capas 10-30, KL 0,0499) | 26 B A4B | no disponible | no disponible | no disponible |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | Aporta el `lm_head`; entrena solo esa cabeza | 26 B A4B | no disponible | no disponible | no disponible |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | Donante de las proyecciones QK | 26 B A4B | no disponible | no disponible | no disponible |

Frente a alternativas de la misma clase de tamaño en el ecosistema abierto, no se dispone de datos verificables en la información proporcionada para establecer comparaciones de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Ausencia de rechazos por diseño: las direcciones de rechazo están ablacionadas. El modelo puede generar contenido que otros modelos rechazarían, incluido material dañino, y no incorpora salvaguardas internas. No es apto para uso directo en producción sin filtros externos.
- Riesgo de alucinación: no evaluado. No hay métricas de factualidad ni de calibración en la información disponible.
- Idioma: únicamente inglés. No hay evidencia de competencia en castellano ni en otras lenguas.
- Sin benchmarks estándar: no se puede comparar objetivamente su calidad con la de otros modelos de la misma categoría.
- Adopción nula: 0 descargas y 0 likes. Sin validación por parte de la comunidad ni informes independientes de comportamiento.
- Licencia potencialmente problemática para uso comercial: el repositorio declara apache-2.0, pero el linaje procede de Gemma 4, cuyos pesos suelen distribuirse bajo los términos de uso de Gemma. Conviene verificar la cadena de licencias de los tres modelos base antes de cualquier explotación comercial.
- Los modelos base no declaran licencia en la información proporcionada, lo que añade incertidumbre a la cadena de derechos.
- Riesgo de degradación por el merge: en las capas globales, `k_proj` actúa a la vez como claves y valores, de modo que el alpha no nulo inyecta contenido del donante en el flujo residual. Es un compromiso deliberado que puede afectar a la coherencia en contextos largos.
- Incompatibilidad de embeddings atados: el `lm_head` se sustituye con `tie_word_embeddings` a `false`, por lo que los derivados no pueden volver a atar la cabeza sin reentrenamiento.
- Caída de diversidad léxica: el ratio tipo/token baja de 0,412 a 0,392 en la comparación del autor, con la advertencia de que la muestra es pequeña.
- Efectos sobre el bloque de pensamiento no concluyentes: el autor midió direcciones opuestas en dos conjuntos de prompts y decidió no reportar el dato.
- Cuantizaciones inexistentes: obliga a convertir los pesos antes de usar herramientas basadas en GGUF, con el riesgo de que la arquitectura no esté soportada.
- Tamaño del repositorio: 53,1 GB, lo que dificulta el almacenamiento y la distribución en entornos con recursos limitados.
- Fecha de publicación: 2026-09-13, con última actualización el mismo día, lo que indica que el repositorio no ha recibido mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic
- Modelo base 1 (cuerpo abliterado): https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Modelo base 2 (cabeza de estilo): https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Modelo base 3 (donante QK): https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo. Los resultados obtenidos corresponden a páginas de la aerolínea Southwest Airlines y no guardan relación con el objeto de esta ficha, por lo que no se incluyen.
