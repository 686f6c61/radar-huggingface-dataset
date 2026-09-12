# trklzz/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario trklzz. El trabajo no consiste en un reentrenamiento ni en un ajuste fino: se aplica una técnica de abliteración sobre los pesos en bf16 para eliminar las direcciones de rechazo del modelo base, empleando la herramienta Heretic, que minimiza el número de rechazos frente a la divergencia KL respecto al modelo original. El resultado es un modelo con el comportamiento de rechazo sustancialmente reducido, pero con arquitectura, datos de entrenamiento y capacidades sin modificar respecto al base.

El modelo conserva la cabeza de predicción multi-token (MTP) del checkpoint original, lo que permite hacer decodificación especulativa con un borrador integrado en el mismo archivo o con un archivo de draft separado. Mantiene también la torre de visión mediante un proyector multimodal independiente en F16, y una ventana de contexto de 262.144 tokens sobre 64 capas y un vocabulario de 248.320 entradas. El total de parámetros es de 27.320.697.856 (27,3 mil millones), en una arquitectura densa etiquetada como Qwen3_5ForConditionalGeneration.

Su relevancia práctica está en el despliegue local: se publican cuantizaciones desde IQ2_M (10,6 GB) hasta Q8_0 (29,0 GB), con matrices de importancia (imatrix) calculadas directamente desde los pesos f16 y con métricas de perplejidad medidas en la misma sesión contra la misma línea base, lo que permite elegir el compromiso tamaño/calidad con datos en la mano. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer decoder denso, 64 capas, con 1 capa MTP) |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (familias fused y noMTP); draft en Q4_0 y Q8_0; proyector visión mmproj en F16 |
| Idiomas soportados | en (inglés), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3.8-27B |
| Relación con el base | quantized (cuantización + abliteración) |
| Vocabulario | 248.320 tokens |
| Visión | Sí (requiere mmproj-Qwen3.8-27B-Uncensored-F16.gguf, 0,9 GB) |
| Tamaño del repositorio | 231,3 GB |
| Herramienta de conversión | llama.cpp, commit a94d563ed |
| Imatrix | wikitext-2 raw, 200 chunks (archivo publicado, 13,6 MB) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.8-27B: un transformer decoder denso de 64 capas con un vocabulario de 248.320 tokens y una capa adicional de predicción multi-token (MTP). Esta capa MTP actúa como cabeza borrador para decodificación especulativa, de modo que el modelo puede proponer varios tokens y verificarlos después contra el modelo objetivo. El modelo incorpora también capacidad de visión, servida mediante un proyector multimodal (mmproj) en precisión F16 que los runtimes compatibles descubren automáticamente por el prefijo del nombre de archivo.

No hay entrenamiento adicional en este release. El procedimiento de abliteración se ejecuta en bf16 (nunca sobre una cuantización de 4 bits) con Heretic, que optimiza de forma conjunta la reducción del número de rechazos y la divergencia KL respecto al modelo base; la LoRA resultante se fusiona en el checkpoint bf16, por lo que los pesos publicados no son el resultado de una ida y vuelta por cuantización. Las modificaciones se aplican a `attn.o_proj` y `mlp.down_proj` de la pila principal, mientras que los tensores `mtp.*` se copian literalmente desde el checkpoint base y no se tocan. La matriz de importancia (imatrix) se calcula directamente desde los pesos f16, no desde una cuantización intermedia, con wikitext-2 raw y 200 chunks. No se documentan en la información disponible datos sobre número de tokens de entrenamiento del modelo base, composición del dataset ni fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino, con el pipeline declarado como text-generation.
- Razonamiento y generación de código heredados del modelo base Qwen3.8-27B, según la afirmación del autor de que las capacidades permanecen sin cambios.
- Comprensión de imágenes: el proyector mmproj en F16 habilita entrada visual en runtimes compatibles.
- Ventana de contexto de 262.144 tokens, apta para documentos y conversaciones muy largas.
- Decodificación especulativa mediante la cabeza MTP, ya sea integrada en el archivo fused o mediante `--model-draft` con los archivos draft en Q8_0 (3,2 GB) o Q4_0 (1,7 GB).
- Comportamiento de rechazo sustancialmente reducido respecto al base, orientado a contenidos que el modelo original declinaría.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte explícito de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo thinking, audio u otras capacidades especiales: no documentado en la información disponible.

## Casos de uso

- Análisis de documentación extensa: con 262.144 tokens de contexto, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola pasada sin troceado, manteniendo coherencia entre secciones distantes del documento.
- Procesamiento de documentos escaneados y capturas: la combinación del modelo con el proyector mmproj F16 permite extraer texto y estructura de imágenes dentro del mismo flujo de inferencia, útil en digitalización de archivos.
- Escritura creativa sin restricciones temáticas: narrativa, guiones o material de ficción que abordan violencia, contenido adulto o temas sensibles suelen activar rechazos en los modelos alineados; aquí el autor reporta una reducción sustancial de esa conducta.
- Investigación sobre alineación y seguridad: el modelo sirve como sujeto de estudio para medir tasas de rechazo, comparar con el base y evaluar el coste en divergencia KL de las técnicas de abliteración.
- Red teaming interno: evaluar las defensas de otros sistemas generando intentos de jailbreak o prompts adversarios en un entorno controlado.
- Despliegue local en estación de trabajo: la cuantización Q4_K_M ocupa 16,8 GB, lo que encaja en GPUs de consumo con 24 GB de VRAM, permitiendo asistencia de código o chat privado sin conexión a servicios externos.
- Servicio de inferencia de baja latencia: usar llama-server con el archivo fused (MTP en línea) o con `--model-draft` y el draft en Q8_0 para acelerar la generación mediante decodificación especulativa verificada.
- Producción de cuantizaciones propias: el archivo imatrix.dat publicado permite generar quants de baja precisión adicionales sin recalibrar, reutilizando las estadísticas obtenidas de los pesos f16.
- Atención al cliente bilingüe: cobertura de inglés y chino en conversaciones multi-turno largas, con la advertencia de que no hay soporte documentado de otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo publicado es la perplejidad sobre wikitext-2, medida en la misma sesión para todas las cuantizaciones contra la misma línea base f16:

| Archivo | Tamaño | Perplejidad (wikitext-2) | Diferencia vs f16 |
|---|---|---|---|
| Qwen3.8-27B-Uncensored-f16.gguf (línea base, no publicado) | no disponible | 7,1557 ± 0,25104 | — |
| Qwen3.8-27B-Uncensored-Q5_K_M.gguf | 19,5 GB | 7,1573 ± 0,25055 | +0,0016 |
| Qwen3.8-27B-Uncensored-IQ4_XS.gguf | 15,3 GB | 7,1583 ± 0,25019 | +0,0026 |
| Qwen3.8-27B-Uncensored-Q6_K.gguf | 22,4 GB | 7,1689 ± 0,25149 | +0,0132 |
| Qwen3.8-27B-Uncensored-Q8_0.gguf | 29,0 GB | 7,1764 ± 0,25195 | +0,0207 |
| Qwen3.8-27B-Uncensored-Q4_K_M.gguf | 16,8 GB | 7,1814 ± 0,25227 | +0,0257 |
| Qwen3.8-27B-Uncensored-IQ2_M.gguf | 10,6 GB | 7,8581 ± 0,27481 | +0,7024 |

El propio autor advierte que, salvo IQ2_M, todas las filas caen dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que esas cuantizaciones no son separables entre sí ni respecto al f16 y su ordenación es ruido estadístico. La model card anuncia una sección de decodificación especulativa medida sobre IQ2_M y una sección de comportamiento medido (tasas de rechazo), pero los valores numéricos de ambas no están incluidos en la información disponible.

## Requisitos de hardware

- Huella de pesos por cuantización (sin caché KV): IQ2_M 10,6 GB; IQ4_XS 15,3 GB; Q4_K_M 16,8 GB; Q5_K_M 19,5 GB; Q6_K 22,4 GB; Q8_0 29,0 GB. Las variantes noMTP pesan entre 0,2 y 0,4 GB menos.
- A la huella de pesos hay que sumar la caché KV correspondiente a 262.144 tokens de contexto, que no está cuantificada en los datos publicados; para contextos largos el consumo adicional puede ser muy superior al de los pesos.
- Cabe en GPU de consumo: IQ2_M (10,6 GB) e IQ4_XS (15,3 GB) en tarjetas de 16 GB; Q4_K_M (16,8 GB) y Q5_K_M (19,5 GB) en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, con margen limitado para caché KV.
- No cabe en GPU de consumo: Q6_K (22,4 GB) y Q8_0 (29,0 GB) exigen VRAM profesional, por ejemplo A100 de 40 GB, A6000 de 48 GB o H100 de 80 GB. La alternativa es descargar parte de las capas a CPU/RAM, con la penalización de velocidad correspondiente.
- Decodificación especulativa: el archivo fused lleva el MTP en línea y no necesita archivo adicional; los archivos draft ocupan 3,2 GB (Q8_0, el que se usó para medir) o 1,7 GB (Q4_0, con tasa de aceptación no medida).
- Visión: añadir 0,9 GB para el proyector mmproj en F16.
- Opciones de despliegue: llama.cpp (conversión hecha con el commit a94d563ed), llama-server con `--model-draft` para el draft, Ollama importando los GGUF, y ComfyUI según la propia model card. vLLM y TGI no figuran en la documentación; estos motores no consumen GGUF de forma nativa y requerirían otra ruta de conversión.
- Repositorio completo: 231,3 GB, por lo que conviene descargar solo los archivos necesarios.
- Latencia y throughput estimados: no disponibles. La model card incluye una sección de decodificación especulativa medida sobre IQ2_M, pero los valores no están en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Comportamiento de rechazo |
|---|---|---|---|---|---|---|
| trklzz/Qwen3.8-27B-Uncensored-GGUF | 27,3 B (denso) | 262.144 | en, zh | Apache 2.0 | GGUF | Reducido sustancialmente respecto al base |
| Qwen/Qwen3.8-27B (base) | 27,3 B (denso) | 262.144 | en, zh | Apache 2.0 | safetensors y otros | Comportamiento de rechazo original, sin modificar |
| Otras alternativas de ~27 B cuantizadas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más significativa es contra el propio modelo base: misma arquitectura, mismo contexto, mismo vocabulario y misma licencia, con la única diferencia de la abliteración y del formato de distribución (GGUF cuantizado frente a pesos completos). No se dispone de datos que permitan comparar con otras familias de tamaño similar ni con otras variantes abliteradas de la misma categoría dentro de la información proporcionada.

## Limitaciones y advertencias

- El comportamiento de rechazo está reducido de forma sustancial, no eliminado. El autor es explícito en este punto y remite a su sección de comportamiento medido (cuyos valores no están disponibles en la información proporcionada).
- El resultado esperado es un modelo más permisivo ante peticiones sensibles. Esto implica riesgo real de generar contenido dañino, ilegal o desinformación si se despliega sin filtros adicionales; la licencia Apache 2.0 no exime de las obligaciones legales aplicables al contenido generado.
- Riesgo de alucinación: inherente a los modelos de esta familia, y no cuantificado en la documentación publicada. No hay benchmarks de veracidad ni de tareas que permitan acotarlo.
- Idiomas: solo inglés y chino. No hay soporte declarado de castellano ni de otras lenguas, por lo que su uso en español queda fuera de las capacidades documentadas.
- Contexto: aunque la ventana es de 262.144 tokens, el consumo de caché KV a esa longitud no está documentado y puede hacer inviable el contexto completo en hardware de consumo.
- Cuantización IQ2_M: con una perplejidad de 7,8581 frente a 7,1557 del f16 (+0,7024), la degradación es clara y muy superior al resto. Es la opción para presupuestos de VRAM muy ajustados, no para calidad.
- Las diferencias de perplejidad entre Q4_K_M, Q5_K_M, Q6_K, Q8_0 e IQ4_XS quedan dentro del margen de error, así que no deben usarse para justificar una elección por calidad.
- Decodificación especulativa: el borrador MTP se entrenó contra el modelo sin modificar, por lo que la tasa de aceptación puede caer ligeramente tras la abliteración. La verificación token a token contra el objetivo garantiza que la calidad de salida no se ve afectada, pero la ganancia de velocidad puede ser menor de lo esperado.
- Procedencia y validación: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-09-12). No hay validación independiente de las métricas publicadas.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-27B, que conviene revisar antes de un despliegue en producción.
- Tamaño operativo: 231,3 GB de repositorio obligan a seleccionar archivos concretos en la descarga.

## Enlaces

- Ficha de HuggingFace del modelo: https://huggingface.co/trklzz/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteración Heretic: https://github.com/p-e-w/heretic
- llama.cpp (librería declarada y commit de conversión a94d563ed): https://github.com/ggml-org/llama.cpp
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido de prensa de consumo y foros en francés sobre otras plataformas), por lo que no se incluye ningún enlace adicional de esa fuente.
