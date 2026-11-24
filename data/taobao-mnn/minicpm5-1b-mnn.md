# taobao-mnn/MiniCPM5-1B-MNN

## Resumen

MiniCPM5-1B-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo MiniCPM5-1B, el primero de la serie MiniCPM5 publicada por OpenBMB. Se trata de un transformer denso de aproximadamente 1.080 millones de parámetros (1,08 B) con arquitectura tipo Llama de 24 capas y dimensión oculta de 1536, orientado a despliegue en dispositivo (end-side), ejecución local y entornos con recursos limitados. El repositorio lo mantiene el equipo taobao-mnn y su función es ofrecer los pesos ya convertidos al formato nativo de MNN, con cuantización HQQ de 4 bits, para que puedan ejecutarse en CPU sin necesidad de toolchains de inferencia convencionales.

La relevancia de esta ficha está en que no se trata de un modelo nuevo, sino de una distribución de inferencia: el interés técnico reside en el pipeline de cuantización (HQQ 4-bit con grupo 64 y escalas en FP16), en el formato de pesos propietario de MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_int4.bin`, `tokenizer.mtok`) y en las condiciones de ejecución verificadas (MNN 3.6.2, CPU x64, 4 hilos, precisión baja). El modelo base soporta chino e inglés según la model card, con licencia Apache 2.0 heredada del modelo original.

Conviene subrayar que la validación publicada por el autor es limitada: solo se verificó en CPU x64, con comprobaciones deterministas de alineación FP32 y pruebas de humo estructurales, sin mediciones de rendimiento ni de memoria, y sin validar ARM, Metal, OpenCL, Vulkan, CUDA ni dispositivos móviles. Es, por tanto, un artefacto útil para quien quiera probar MiniCPM5-1B en MNN, pero no una distribución con garantías de producción más allá de ese entorno concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo `llama`; 24 capas; hidden_dim 1536 |
| Parámetros totales | ~1,08 B (modelo base MiniCPM5-1B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la validación cubre entradas de 20 a 855 tokens, no el máximo) |
| Tipos de cuantización | HQQ 4-bit (group=64, alpha_bytes=2 en FP16) en el backbone y en la cabeza LM; embeddings en int4 en fichero separado |
| Idiomas soportados | chino (`zh`) e inglés (`en`) según la model card; el campo `language` del repo HF solo lista `en` |
| Licencia | Apache 2.0 (heredada de OpenBMB/MiniCPM5-1B) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_int4.bin`, `tokenizer.mtok`); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con backbone tipo Llama de 24 capas y dimensión oculta 1536, según la tabla de especificaciones de la model card. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se detallan innovaciones arquitectónicas específicas del modelo base más allá de la configuración declarada.

La contribución técnica de este repositorio es la cadena de cuantización y empaquetado: cuantización HQQ de 4 bits con tamaño de grupo 64 y parámetros alpha almacenados en FP16, aplicada tanto al backbone del lenguaje como a la cabeza de salida LM, más una representación int4 independiente para los embeddings de entrada. El proceso de conversión se realizó con el exportador de MNN en el commit `b0239771b07b317a258fbc384683bbd540741406`, con parámetros documentados en `export_args.json` y resumen de configuración y validación en `refresh_metadata.json`. La model card advierte de que reexportar no garantiza consistencia byte a byte entre versiones de dependencias y exige revalidación.

## Capacidades

- Generación de texto en chino e inglés, orientada a conversación y tareas generales de lenguaje.
- Modo de razonamiento híbrido (`hybrid`): la configuración incluida mantiene el pensamiento forzado activado por defecto y la model card desaconseja desactivarlo sin motivo; el contexto Jinja es `null` en la configuración empaquetada.
- Ejecución en CPU sin GPU: el runtime por defecto usa `thread_num=4`, `precision=low` y `memory=low`.
- Cuantización agresiva a 4 bits que reduce el tamaño del repo a 1,7 GB, incluyendo pesos, tokenizer y configuración.
- Capacidad de parada natural en generación: la prueba de humo verificada termina sin superar el límite por defecto de 512 tokens nuevos.
- Soporte de tool calling, function calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de visión, audio o multimodalidad: no disponible; el pipeline declarado es `text-generation` con entrada y salida de texto.

## Casos de uso

- Despliegue en aplicaciones de escritorio con MNN: el paquete está pensado para integrarse en el runtime MNN en CPU x64 con precisión baja y 4 hilos, lo que permite incorporar generación de texto en herramientas locales sin dependencia de servicios en la nube.
- Prototipado de asistentes conversacionales en chino e inglés: el modelo base cubre ambos idiomas y la configuración incluye plantilla de chat y tokenizer propios, adecuados para validar flujos multi-turno antes de escalar a modelos mayores.
- Pruebas de razonamiento ligero y aritmética: la validación del autor incluye casos de saludo, aritmética y traducción con comprobaciones deterministas en modo greedy, lo que sirve como base para evaluar la calidad del cuantizado frente al modelo original.
- Evaluación comparativa de cuantización HQQ 4-bit: investigadores pueden usar este repo para medir la degradación de un modelo de ~1 B al pasar a 4 bits con grupo 64, comparando contra el modelo base en FP16/BF16.
- Integración en pipelines de CI para modelos end-side: el formato MNN y el tamaño contenido (1,7 GB) permiten incluirlo en pruebas automatizadas de regresión de inferencia en máquinas sin GPU.
- Escenarios de recursos restringidos en CPU: al ejecutarse con `memory=low` y cuantización int4, es candidato para entornos donde no hay acelerador y el presupuesto de memoria es ajustado, siempre que se acepte la ausencia de mediciones publicadas de latencia y consumo.
- Traducción y generación de texto bilingüe en herramientas ofimáticas o de línea de comandos: los casos de traducción forman parte de la validación publicada, aunque sin métricas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe comprobaciones de alineación y pruebas de humo:

| Prueba | Condiciones | Resultado declarado |
|---|---|---|
| Alineación FP32 (prefill/decode, 24 capas) | CPU x64, 2026-11-17 | Completada |
| Casos deterministas (saludo, aritmética, traducción) | Greedy, `precision=high`, 8 hilos | Expectativas predefinidas superadas |
| Smoke test con configuración por defecto | CPU x64, entradas de 20 a 855 tokens | Parada natural, sin superar el límite de 512 tokens |
| Rendimiento y memoria por dispositivo | — | No medidos ni publicados |

## Requisitos de hardware

- VRAM estimada para GPU: no disponible; no se han publicado mediciones de memoria para CUDA ni otros backends.
- GPU recomendadas: no disponible; el único backend validado es CPU x64.
- Compatibilidad con GPU de consumo: no verificada (Metal, OpenCL, Vulkan y CUDA figuran como no validados).
- CPU: validado en x64 con MNN 3.6.2 (commit de runtime `4756b19d51ddeaf0a73bbc9f230dea6d930f442e`); ARM CPU en FP16 no verificado.
- Compilación: requiere MNN con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON` y `MNN_SEP_BUILD=OFF`, además de los arreglos de plantilla y tokens especiales del PR #5155.
- Opciones de despliegue: runtime MNN (`llm_demo`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato de pesos.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no ha publicado mediciones de rendimiento ni de memoria por dispositivo.
- Límite de generación: 512 tokens nuevos por defecto en el runtime verificado si no se configura `max_new_tokens`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-1B-MNN (este repo) | ~1,08 B denso | no disponible | HQQ 4-bit, formato MNN | Apache 2.0 | Hugging Face y ModelScope (taobao-mnn / MNN) |
| openbmb/MiniCPM5-1B (base) | ~1,08 B denso | no disponible | Pesos originales (formato no detallado) | Apache 2.0 | Hugging Face y ModelScope |
| Otras alternativas de ~1 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría, por lo que la comparación se limita al modelo base frente a su versión cuantizada.

## Limitaciones y advertencias

- Validación muy acotada: solo se verificó en CPU x64; ARM CPU en FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles quedan sin validar.
- Ausencia de métricas de rendimiento y de memoria: no hay datos de latencia, throughput ni consumo que permitan planificar capacidad en producción.
- La prueba de humo con configuración por defecto no mide precisión: el propio autor advierte que no representa la exactitud de salida por defecto.
- Cobertura de contexto no verificada: las pruebas usaron entradas de 20 a 855 tokens, no la longitud máxima de contexto.
- Dependencia estricta de versión: requiere MNN 3.6.2 y el PR #5155; otras versiones exigen regresión propia, y el commit de conversión no sustituye al runtime validado.
- Integridad del paquete: los ficheros deben actualizarse en bloque y no mezclar revisiones; hay que limpiar únicamente las cachés gestionadas por la aplicación.
- Modo de pensamiento forzado por defecto: la configuración empaquetada mantiene el razonamiento híbrido activado y la model card desaconseja desactivarlo sin justificación.
- Licencia: Apache 2.0 heredada, pero el repositorio no incluye el texto de la licencia ni el upstream tiene fichero LICENSE; la cuantización no amplía los derechos concedidos y la licencia de las herramientas MNN no sustituye a la del modelo.
- Idiomas: la model card declara chino e inglés, mientras que el campo `language` del repo HF solo lista inglés; conviene validar el comportamiento en cada idioma antes de usarlo.
- Riesgo de sesgos y alucinación: no documentado en la información disponible, pero aplicable como en cualquier modelo de lenguaje de ~1 B; no hay evaluación de seguridad publicada.
- Uso comercial: permitido por Apache 2.0, sujeto a los requisitos de atribución del modelo base y a la verificación previa en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/MiniCPM5-1B-MNN
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-1B
- Modelo base en ModelScope: https://modelscope.cn/models/OpenBMB/MiniCPM5-1B/summary
- Repositorio MNN en ModelScope: https://modelscope.cn/models/MNN/MiniCPM5-1B-MNN/summary
- Runtime MNN (Alibaba): https://github.com/alibaba/MNN
- PR de MNN con arreglos de plantilla y tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Commit de conversión usado: https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Licencia del modelo base: https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE
