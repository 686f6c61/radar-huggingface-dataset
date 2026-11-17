# Yakoja/DeepSeek-V4.1-Flash-Abliterated-GGUF

## Resumen

DeepSeek-V4.1-Flash-Abliterated-GGUF es una distribución de cuantizaciones GGUF del checkpoint DeepSeek-V4.1-Flash-1017 en su variante "abliterated", es decir, con la dirección de rechazo eliminada de la proyección de salida de atención. El modelo lo publica el usuario Yakoja en Hugging Face, pero el trabajo técnico subyacente procede de una cadena de derivados comunitarios: la edición Heretic de pqhaz (que aplica la abliteración), la conversión Maya de peasantsmith y la variante Abliterated de s-zaizen. El modelo original es DeepSeek-V4.1-Flash-1017, de deepseek-ai.

Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 754.638.867.584 parámetros totales, empaquetado en cuatro ficheros GGUF de 365.713.686.528 bytes cada uno. La característica más singular es que estas cuantizaciones no son GGUF genéricos: el layout de tensores, la mezcla de cuantización y el empaquetado de las tablas Engram son específicos de DwarfStar (ds4), la herramienta de inferencia de antirez y audreyt. Las dos tablas Engram (unos 189 GiB) se empaquetan al final de cada fichero y se leen desde disco bajo demanda, por lo que requieren SSD local rápido.

Su relevancia es doble: por un lado, demuestra que es posible ejecutar un modelo MoE de ~755B parámetros en un único Mac de 128 GB mediante cuantización agresiva IQ1_S en los expertos y Q8 en las capas densas; por otro, documenta con mediciones pareadas (NLL, acuerdo de top-token, tokens/s) el coste de calidad de ese nivel de compresión. La licencia es MIT, lo que facilita el uso comercial, aunque la naturaleza "uncensored" del checkpoint exige controles de seguridad propios en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, con tablas Engram empaquetadas en disco; layout específico de ds4 |
| Parametros totales | 754.638.867.584 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 262.144 tokens en asignación de contexto (probado con prefill de 512 filas en M5 Max de 128 GB); 128.000 con sidecar de visión; 393.216 rechazado por el guard de 112 GiB |
| Tipos de cuantizacion | IQ1_S (expertos), Q8 (densas en Maya-XS), Q6_K/Q5_K (densas en Q1), Q8_0 (attn_output_b), Q2 con y sin imatrix |
| Idiomas soportados | no disponible (las pruebas de humo mencionan inglés y chino tradicional) |
| Licencia | MIT |
| Formato de pesos | GGUF (ds4-specific; no compatible con llama.cpp genérico) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer MoE de aproximadamente 755.000 millones de parámetros totales. La información disponible no detalla el número de parámetros activos por token, la composición del dataset de entrenamiento ni si hubo etapas de RLHF o DPO; todos esos datos figuran como no disponibles. Lo que sí documenta la model card es la cadena de derivación: pqhaz aplica una edición Heretic que sustituye 38 tensores de la proyección de salida de atención (`attn.wo_b`) en los bloques 2 a 39, eliminando la dirección de rechazo con una fuerza de 2,5. Según pqhaz, los rechazos en held-out con razonamiento pasan de 92/100 a 1/100, con una divergencia KL de 0,136 en prompts inocuos, y sin benchmarks de capacidad publicados.

La innovación técnica de esta distribución es el empaquetado para ds4. La conversión Maya-XS copia 120 tensores de expertos en IQ1_S y 339 tensores densos en Q8 sin recuantizar, conserva los metadatos nativos 1017 y deja las tablas Engram solo en disco. La variante Q1, en cambio, parte de un clon APFS del Q2 nativo de ds4 y sustituye tensores in situ: usa IQ1_S de Unsloth para los expertos enrutados (88 tensores tal cual y 32 que Unsloth publica como IQ2_XXS recuantizados a IQ1_S con su imatrix), tensores densos de Unsloth en Q6_K/Q5_K para atención, shared-expert, cabeza de salida, embeddings y proyección Engram, y Q8_0 para los 38 tensores abliterados. Es importante notar que ese paso recuantiza pesos ya cuantizados, no el checkpoint original, lo que introduce una pérdida adicional acumulativa.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del checkpoint DeepSeek-V4.1-Flash-1017.
- Razonamiento con modo "thinking": la model card menciona explícitamente rechazos "with reasoning" en la evaluación de pqhaz, lo que confirma soporte de cadena de pensamiento.
- Capacidades de visión mediante sidecar separado (`DeepSeek-V4.1-Flash-1017-Vision.gguf`), invocado con `--vision` en `ds4-server`; el fichero principal no incluye visión.
- Recuperación de información en contexto largo: una prueba con un prompt de 10.237 tokens recuperó correctamente un código de verificación.
- Capacidades multilingües: las pruebas de humo cubren inglés y chino tradicional; el resto de idiomas no está documentado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "uncensored": la abliteración reduce drásticamente los rechazos, lo que constituye en sí una capacidad diferencial frente al modelo original.

## Casos de uso

- Inferencia local de un MoE de gran escala en hardware de consumo: con el fichero Maya-XS (107,35 GiB residentes en Metal), un Mac de 128 GB puede mantener el modelo completamente residente y servir peticiones con contexto de hasta 262.144 tokens, sin streaming desde SSD ni modelo draft especulativo.
- Investigación sobre abliteración y alineación: el par de checkpoints (original y abliterated) permite estudiar empíricamente el efecto de eliminar la dirección de rechazo, con métricas publicadas de rechazo (92/100 a 1/100) y divergencia KL (0,136) sobre prompts inocuos.
- Evaluación de calidad de cuantización extrema: las mediciones pareadas de NLL (0,6206 en Q1 antiguo frente a 0,5192 en Maya-XS) y acuerdo de top-token (83,72 % frente a 86,58 %) sirven como referencia para decidir qué nivel de compresión tolera un pipeline concreto.
- Procesamiento de documentos largos con recuperación: gracias al contexto de 262.144 tokens y a la prueba de recuperación de códigos en prompts de ~10.000 tokens, es adecuado para tareas de extracción y verificación sobre expedientes extensos, siempre que se validen profundidades mayores.
- Despliegue con visión en servidor local: mediante `ds4-server` con el sidecar de visión y contexto de 128.000 tokens (el valor por defecto de pi-ds4 v0.7.3), se pueden construir asistentes multimodales en una sola máquina.
- Escenarios que requieren baja tasa de rechazo: aplicaciones de red teaming, generación de contenido sensible para revisión humana o investigación en seguridad, donde la abliteración reduce las negativas del modelo; exigen filtros y políticas propias.
- Pruebas de integración continua de herramientas de inferencia: al ser un GGUF específico de ds4 con hashes SHA-256 publicados por fichero, sirve como fixture reproducible para validar versiones de ds4, cambios en el empaquetado Engram o regresiones de cuantización.

## Benchmarks y rendimiento

La model card solo publica mediciones pareadas de calidad y velocidad sobre 100 fixtures de continuación de septiembre de V4.1 (6.160 tokens), comparando el Q1 antiguo sin abliterar con la conversión Maya sin abliterar. No son benchmarks de capacidad estándar y no miden fidelidad respecto a los pesos originales 1017. El fichero Maya abliterado no ha pasado la suite completa de puntuación.

| Medición | Q1 antiguo | Maya-XS |
|---|---:|---:|
| NLL media del token objetivo (menor es mejor) | 0,620629834 | 0,519230866 |
| Acuerdo de top-token vía API | 83,72 % | 86,58 % |
| Decodificación pareada en inglés (tokens/s) | 37,99 | 37,24 |

La NLL fue un 16,34 % inferior en Maya-XS. El acuerdo de API excluye el caso_047 por un desajuste de tokenizador documentado (99 casos alineados). La velocidad es una única muestra de CLI consecutiva en un M5 Max de 128 GB, sin visión.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/residencia estimada: 107,35 GiB de pesos residentes en Metal para Maya-XS; ~106 GiB para Q1; 152 GiB para las variantes Q2, que requieren `--ssd-streaming`.
- Las tablas Engram (~189 GiB) nunca son residentes: se leen desde disco bajo demanda, por lo que es imprescindible un SSD local rápido.
- GPU recomendadas: Apple Silicon con 128 GB de memoria unificada (probado en M5 Max). No hay datos publicados para A100, H100 ni RTX 4090; por el tamaño, ninguna GPU de consumo con 24 GB puede alojar el modelo completo.
- Cabe en GPU de consumo: no. Solo es viable en configuraciones de memoria unificada de 128 GB o mediante streaming desde SSD con las variantes Q2.
- Límite de memoria: el guard de ds4 rechaza asignaciones de contexto de 393.216 tokens por el presupuesto de 112 GiB; con sidecar de visión y candor steering, la asignación de 131.072 tokens pasa.
- Opciones de despliegue: exclusivamente DwarfStar (ds4), con `audreyt/ds4` en el commit `0dff39f91721bcf3472813c6d2bebf9353df2a1a` o posterior para Maya-XS (Q8 embeddings, pesos del compresor e indexador) y `d3f4cd6` o posterior para Q1 (IQ1_S y densas Q5_K/Q6_K). No es compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 37,24 tokens/s en decodificación pareada en inglés sobre M5 Max de 128 GB (una sola muestra, sin visión). No hay datos de latencia de prefill ni de throughput agregado en servidor.
- Ajuste necesario: elevar el techo de memoria wired de Metal según se describe en la documentación de ds4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Abliterated-GGUF (este) | 754,6 B totales | 262.144 (probado en asignación) | IQ1_S, Q2, Q8, Q6_K/Q5_K | MIT | Hugging Face, formato ds4 |
| DeepSeek-V4.1-Flash-1017 (original) | 754,6 B totales | no disponible | safetensors y GGUF de terceros | no disponible | Hugging Face (deepseek-ai) |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | 754,6 B totales | no disponible | no disponible | no disponible | Hugging Face |
| s-zaizen/DeepSeek-V4.1-Flash-Abliterated | 754,6 B totales | no disponible | no disponible | no disponible | Hugging Face |
| peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF | 754,6 B totales | no disponible | IQ1_S expertos, Q8 densas | no disponible | Hugging Face |

Las alternativas comparables en la información disponible son todas variantes del mismo modelo base, no modelos distintos. No se dispone de datos de benchmarks ni de parámetros activos de ninguno de ellos para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo con fuerza 2,5: el modelo aceptará peticiones que el original rechazaría. Es imprescindible implantar filtros y políticas de contenido propias antes de exponerlo a usuarios finales.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de capacidad sobre este checkpoint.
- La cuantización IQ1_S en los expertos y la recuantización de pesos ya cuantizados (32 tensores IQ2_XXS a IQ1_S) introducen pérdida acumulativa; la NLL de 0,5192 es una referencia interna, no una medida de fidelidad al modelo original.
- El contexto de 262.144 tokens se validó con una asignación y un prefill de 512 filas, pero no con una prueba de profundidad completa a 262k; el comportamiento en el extremo de la ventana no está verificado.
- El fichero Maya abliterado no ha pasado la suite completa de puntuación de calidad; las métricas pareadas corresponden a la conversión sin abliterar.
- Compatibilidad restringida: solo funciona con ds4 en versiones concretas (commits `0dff39f` o `d3f4cd6` según fichero). No es un GGUF estándar y no cargará en llama.cpp, Ollama ni otros runners.
- Dependencia de SSD: las tablas Engram (~189 GiB) se leen de disco; un almacenamiento lento degrada gravemente la latencia.
- Idiomas soportados no documentados; las pruebas de humo solo cubren inglés y chino tradicional.
- La licencia MIT del repositorio no exime de verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 y de los checkpoints intermedios.
- Repositorio sin descargas ni likes en el momento de la consulta y creado y actualizado en la misma fecha: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yakoja/DeepSeek-V4.1-Flash-Abliterated-GGUF
- Modelo base DeepSeek-V4.1-Flash-1017: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Edición Heretic de pqhaz: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Variante Abliterated de s-zaizen: https://huggingface.co/s-zaizen/DeepSeek-V4.1-Flash-Abliterated
- Conversión Maya de peasantsmith: https://huggingface.co/peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF
- GGUF nativo 1017 de audreyt: https://huggingface.co/audreyt/deepseek-v4.1-flash-1017-gguf
- GGUF de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Repositorio DwarfStar (ds4): https://github.com/antirez/ds4
- Fork de ds4 usado: https://github.com/audreyt/ds4
