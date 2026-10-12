# wallawalla47/Qwen3.8-27B-Uncensored-NVFP4-NInferV3

## Resumen

Qwen3.8-27B-Uncensored-NVFP4-NInferV3 es un artefacto de un solo fichero en formato NInfer V3 (extensión `.ninfer`) derivado de `orcarouter/Qwen3.8-27B-Uncensored-NVFP4`, un checkpoint multimodal de 27B con el alineamiento de seguridad eliminado mediante abliteración. Lo publica el usuario wallawalla47 dentro del ecosistema Infernix/NInfer, y su función es doble: empaquetar los pesos ya cuantizados de origen (mezcla NVFP4 y FP8) sin round-trip de recuantización, y añadir dos mecanismos de decodificación especulativa (un draft model DFlash2 y una cabeza de propuesta indexada) para acelerar la inferencia. Resuelve, por tanto, un problema de despliegue: evitar el paso de conversión en tiempo de carga y aprovechar rutas de decodificación rápidas en GPUs Blackwell.

El modelo base es de la familia Qwen3.5, con un backbone híbrido de 64 capas que combina atención lineal Gated Delta-Net con atención completa cada cuarta capa, hidden de 5120 y vocabulario de 248.320 tokens. Incorpora una torre de visión de 27 capas para entrada de imagen y vídeo, un acompañante MTP para decodificación especulativa, y admite una ventana de contexto nativa de 262.144 tokens. El artefacto ocupa 23,7 GB y está diseñado específicamente para NVIDIA RTX 5090 (sm_120a).

Su relevancia actual es doble: por un lado, demuestra el flujo de publicación de artefactos `.ninfer` con componentes de decodificación especulativa integrados; por otro, es un modelo con la seguridad sustancialmente eliminada, orientado por su autor a investigación en interpretabilidad, mecanismos de rechazo, red-teaming y evaluación de robustez. La licencia declarada es Apache 2.0, pero la abliteración y sus implicaciones de uso recaen sobre quien lo despliega.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: atención lineal Gated Delta-Net + atención completa cada 4 capas; 64 capas; hidden 5120; torre de visión qwen3_5_vision (profundidad 27); acompañante MTP |
| Parametros totales | 27B (según denominación del modelo; no se desglosa cifra exacta en la información disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (W4A4), FP8 E4M3 con escalas por fila/por canal, Q4, Q5, Q6 y Q8 agrupados con escalas FP16, BF16 y FP32 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (NInfer V3, fichero único; sin paso de conversión en carga) |
| Tamano del repositorio | 23,7 GB |
| Vocabulario | 248.320 tokens |
| Censo de pesos preparados | 1.072 objetos: 112 NVFP4, 146 FP8, 579 BF16, 96 FP32, 55 Q4, 54 Q5, 28 Q8, 1 Q6, 1 tabla de índices INT32 |
| Pipeline | image-text-to-text |
| Libreria | ninfer |

## Arquitectura y entrenamiento

El backbone de texto pertenece a la familia Qwen3.5 y es híbrido: 64 capas que alternan atención lineal Gated Delta-Net (GDN) con atención completa cada cuarta capa. El hidden es de 5120 y el vocabulario de 248.320 tokens. Se complementa con una torre de visión `qwen3_5_vision` de 27 capas para entrada de imagen y vídeo, y con un acompañante MTP (multi-token prediction) que habilita decodificación especulativa. Sobre esa base, el artefacto añade dos componentes propios: un draft model DFlash2 de 5 capas con atención deslizante (ventana 2048, selector de rango 256 con top-16) para la ruta `--spec dflash2`, y una cabeza de propuesta indexada de 131.072 filas extraída de la cabeza de salida del modelo fuente, que permite un borrador barato tipo copia mediante `--lm-head-draft`.

La construcción se realizó con el conversor NInfer V3 y la receta `qwen3_8_27b_nvfp4_orcarouter` sobre CPU (aproximadamente 12 minutos), con los componentes `text,vision,mtp,dflash2` y `--proposal --proposal-rows 131072`. No hay reentrenamiento ni ajuste: el artefacto es un cambio de formato con añadidos de decodificación. Las proyecciones MLP de las capas 0 a 55 (112 objetos NVFP4) se importan en su forma NVFP4 codificada de manera bit-exacta, mientras que las proyecciones de atención y GDN de todas las capas y las MLP de las ocho últimas capas (56 a 63) se importan igualmente bit-exactas en FP8 E4M3 por fila (144 objetos). Solo la cabeza de salida y el embedding de tokens se recuantizan a FP8 con escala por fila, con un error relativo máximo de desquantización medido de 0,034 y 0,023 respectivamente (cota 0,07). Las proyecciones GDN a/b permanecen en BF16, igual que normas, convoluciones y `dt_bias`/`a_log`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo thinking (etiqueta `thinking` declarada por el autor).
- Capacidades multimodales de entrada imagen-texto y vídeo mediante la torre de visión de 27 capas.
- Procesamiento de contexto largo: ventana nativa de 262.144 tokens.
- Flujos agénticos y multi-paso (etiqueta `agentic` declarada).
- Decodificación especulativa integrada en tres variantes: MTP, DFlash2 (`--spec dflash2`) y borrador por cabeza de propuesta (`--lm-head-draft`).
- Uso de caché de prefijo: en una repetición de codificación agéntica sobre el modelo de 27B, el motor sirvió el 90 % de los tokens de prompt desde su caché de prefijo.
- Multilingüe limitado a inglés y chino.
- Sin alineamiento de seguridad: responde a solicitudes que la versión original de Qwen3.8-27B rechazaría.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Estudio de mecanismos de rechazo y abliteración: comparar las respuestas de este checkpoint con las de un Qwen3.8-27B alineado ante el mismo conjunto de prompts permite aislar qué comportamientos dependen del alineamiento de seguridad y cuáles del preentrenamiento.
- Red-teaming y evaluación de robustez: usar el modelo como generador adversarial controlado para probar clasificadores de contenido, filtros de moderación o sistemas de detección de prompt injection antes de exponerlos en producción.
- Investigación en interpretabilidad: la combinación de pesos NVFP4/FP8 bit-exactos y componentes MTP/draft permite analizar cómo se comportan las activaciones cuantizadas a 4 bits frente a las originales sin artefactos de conversión adicionales.
- Despliegue de inferencia de baja latencia en una única RTX 5090: el artefacto de 23,7 GB cabe en los 32 GB de la GPU y las rutas especulativas DFlash2 y MTP reducen el tiempo hasta el primer token a aproximadamente la mitad de la media de NInfer, con prefill de prompts largos entre 1,3 y 1,5 veces más rápido.
- Procesamiento de documentos largos multimodales: con 262.144 tokens de contexto y torre de visión, se pueden introducir informes extensos con figuras y mantener conversaciones multi-turno sin truncar.
- Agentes de codificación con contexto persistente: la caché de prefijo, que sirvió el 90 % de los tokens en la repetición agéntica documentada, es adecuada para bucles de agente que repiten un mismo prefijo de repositorio.
- Investigación en decodificación especulativa: sirve como banco de pruebas para comparar DFlash2, MTP y borrador por cabeza de propuesta bajo cargas reales.
- Traducción y generación técnica inglés-chino, dado el par de idiomas soportado y el vocabulario de 248.320 tokens.
- Auditoría de artefactos cuantizados: el informe de conversión por tensor permite estudiar el impacto de mezclar NVFP4, FP8, BF16 y cuantizaciones agrupadas en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento proporcionados son mediciones internas del motor sobre el artefacto oficial de 27B de NInfer:

| Metrica | Resultado | Contexto |
|---|---|---|
| Tokens de prompt servidos desde caché de prefijo | 90 % | Repetición de codificación agéntica sobre el modelo de 27B |
| Tiempo hasta el primer token | Aproximadamente la mitad de la media de NInfer | Misma repetición, con Infernix |
| Velocidad de prefill de prompts largos | 1,3-1,5 veces más rápido que NInfer | Calidad equivalente declarada por el autor |
| Error relativo máximo de desquantización (embedding) | 0,034 | Cota: 0,07 (medio ULP de FP8 E4M3) |
| Error relativo máximo de desquantización (cabeza de salida) | 0,023 | Cota: 0,07 (medio ULP de FP8 E4M3) |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 23,7 GB; se estima un consumo de pesos en VRAM del orden de 24 GB, al que hay que sumar la caché KV para el contexto activo. La atención Gated Delta-Net reduce la presión de caché en las capas lineales, pero las capas de atención completa (una de cada cuatro) mantienen caché convencional.
- GPU de referencia: NVIDIA RTX 5090 (sm_120a, 32 GB). El artefacto está construido explícitamente para esa arquitectura.
- Los kernels NVFP4 W4A4 requieren capacidad de cómputo Blackwell (sm_120a). No se documenta compatibilidad con Ada (RTX 4090) ni con Hopper (H100) en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 5090. Para otras GPUs de consumo no hay confirmación.
- Opciones de despliegue: `infernix-serve` (motor Infernix, recomendado por el autor), `ninfer-serve` (NInfer) y el fork `ninfer-custom`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.ninfer`.
- Latencia y throughput: sin cifras absolutas en la información disponible; solo se aportan comparativas relativas frente a NInfer (véase la sección de benchmarks).
- Contexto extendido: activar los 262.144 tokens completos incrementa de forma notable el consumo de caché KV en las capas de atención completa, por lo que puede requerir reducir el contexto efectivo o recurrir a cuantización de caché, algo que no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| wallawalla47/Qwen3.8-27B-Uncensored-NVFP4-NInferV3 | 27B | 262.144 | `.ninfer` (NInfer V3) | apache-2.0 | Añade DFlash2 y cabeza de propuesta; pesos NVFP4/FP8 importados bit-exactos |
| orcarouter/Qwen3.8-27B-Uncensored-NVFP4 | 27B | 262.144 (heredado) | `compressed-tensors` (llmcompressor) | no disponible en la información proporcionada | Modelo base; mezcla NVFP4/FP8; sin componentes de decodificación especulativa propios |
| Qwen3.8-27B (versión alineada) | 27B | 262.144 (heredado) | safetensors u otros según distribución | no disponible en la información proporcionada | Referencia alineada del mismo backbone; rechaza solicitudes que este artefacto acepta |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Solo se indica que el motor Infernix también lo ejecuta; no hay especificaciones en la información disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este artefacto con alternativas de la misma categoría.

## Limitaciones y advertencias

- Alineamiento de seguridad eliminado: el checkpoint de origen ha sido abliterado y cumplirá solicitudes que el Qwen3.8-27B original rechazaría. El propio autor restringe el uso a investigación legítima (interpretabilidad, estudio de mecanismos de rechazo, red-teaming y evaluación de robustez) y exige añadir capas propias de seguridad y moderación antes de exponerlo a terceros.
- Responsabilidad de uso: el autor declara que quien lo utiliza asume toda la responsabilidad sobre el uso y el contenido generado.
- Idiomas: solo inglés y chino. No hay soporte declarado de castellano ni de otras lenguas, lo que degrada la calidad fuera de ese par.
- Riesgo de alucinación: no se documentan tasas ni evaluaciones de fidelidad; al ser un modelo abliterado sin ajuste posterior, no hay garantía adicional de veracidad.
- Dependencia de hardware: los kernels NVFP4 W4A4 exigen Blackwell (sm_120a). No se documenta funcionamiento en generaciones anteriores de GPU.
- Dependencia de software: el formato `.ninfer` requiere Infernix, NInfer o ninfer-custom. No hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y el ecosistema de herramientas.
- Trazabilidad de la cuantización: solo el embedding y la cabeza de salida se recuantizan; el resto de pesos de texto se importan bit-exactos. Aun así, las cuantizaciones agrupadas Q4/Q5/Q6/Q8 y FP16 aplicadas a la torre de visión y al acompañante MTP introducen pérdida no cuantificada en la información disponible.
- Riesgo de sesgo: no se documentan evaluaciones de sesgo. Un modelo abliterado puede amplificar sesgos presentes en el corpus original al eliminar parte de los filtros de comportamiento.
- Contexto largo: aunque se declaran 262.144 tokens nativos, no se aportan resultados de recuperación en contexto (needle-in-a-haystack u otros) que confirmen el rendimiento efectivo a esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero las restricciones de uso indicadas por el autor y las implicaciones legales de un modelo sin alineamiento deben evaluarse antes de cualquier despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wallawalla47/Qwen3.8-27B-Uncensored-NVFP4-NInferV3
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-NVFP4
- Repositorio del motor Infernix: https://github.com/Wallawalla47/Infernix
- Benchmarks de Infernix frente a NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Repositorio del motor NInfer: https://github.com/Neroued/ninfer
- Fork ninfer-custom: https://github.com/Wallawalla47/ninfer-custom
- Recetas de conversión oficiales: https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/official_recipes.py
