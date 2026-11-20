# vmarcelo/Sabi-Noema-IQ3_S-GSQ-RCO-GGUF

## Resumen

Sabi-Noema IQ3_S GSQ-RCO es una cuantización GGUF de 3,50 bits por peso del modelo `sabicap/sabi-noema`, un fine-tune por RL sobre Qwen3.8-27B orientado a conversación, uso agéntico y tool calling. La publica el usuario `vmarcelo` y su interés principal reside en que reproduce el mapa de asignación por tensor (RCO) del equipo ISTA-DASLab para su cuantización IQ3_S de Qwen3.8-27B, de modo que el archivo resultante ocupa lo mismo que el de ISTA (11,77 GB) pero con los pesos del fine-tune de sabicap, no con los pesos optimizados por GSQ.

El modelo subyacente es un transformer denso de 26.895.998.464 parámetros (unos 26,9 mil millones), con 64 bloques de texto y sin cabeza MTP (`mtp_num_hidden_layers: 0`). Se distribuye en tres archivos: el modelo principal en IQ3_S, un proyector multimodal `mmproj` en Q5_K-MIX (332 MB) que habilita entrada de visión, y una cabeza borrador DFlash en Q4_0 (1,09 GB) para decodificación especulativa. Todo el paquete es Apache-2.0, heredada de Qwen3.8-27B.

Es relevante ahora porque demuestra una práctica reproducible de cuantización de baja precisión guiada por matriz de importancia y mapa por tensor, con un aviso explícito del autor: heredar la asignación de ISTA no hereda sus puntuaciones de benchmark. El autor recomienda además migrar a la versión con cabeza MTP publicada posteriormente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), 64 bloques de texto, sin cabeza MTP |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (configurado en los ejemplos de uso; 65.536 si se carga la cabeza borrador DFlash en 16 GB de VRAM) |
| Tipos de cuantización | IQ3_S (modelo principal, 3,50 bpw); Q5_K-MIX (proyector multimodal, ≈5 bpw); Q4_0 (cabeza DFlash, 4,5 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B: un transformer denso de 64 bloques con atención completa en una parte de las capas (el mapa de cuantización incluye 16 tensores `attn_output` de atención completa) y sin capa de predicción multi-token, ya que el checkpoint de origen declara `mtp_num_hidden_layers: 0`. Sobre esa base, sabicap aplicó un fine-tune por refuerzo (RL) orientado a comportamiento conversacional, agéntico y de uso de herramientas; la model card no detalla el número de tokens de entrenamiento ni la composición del dataset de RL.

El proceso de cuantización es el elemento técnico destacable. Primero se convirtió el checkpoint safetensors a GGUF BF16 de forma bit-exacta con `convert_hf_to_gguf.py --outtype bf16 --no-mtp`. Después se reutilizó la matriz de importancia publicada por ISTA-DASLab (`imatrix-qwen3.8-27b.gguf`, calibrada sobre Qwen3.8 base con 1000 chunks) y se aplicaron las 554 sobrescrituras de tipo por tensor del mapa RCO de ISTA, verificadas byte a byte contra el volcado `rco-allocation.txt` y contra los tipos de tensor de `ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-IQ3_S-mtp.gguf`, con cero discrepancias. La cuantización final se ejecutó con `llama-quantize --imatrix --tensor-type-file`. El autor documenta una trampa de reproducibilidad: `llama-quantize` aplica la primera coincidencia de regex, por lo que las líneas genéricas `output.weight` y `token_embd.weight` deben ir al final; colocadas al principio sobrescribían 16 tensores `attn_output` a `q4_k`.

Conviene subrayar la advertencia del autor: este archivo reproduce la asignación de ISTA, no sus pesos. Los pesos GSQ-optimizados solo pueden provenir del pipeline GSQ de ISTA, de modo que aquí cabe esperar el tamaño de archivo de ISTA, no sus resultados de benchmark.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Qwen3.8 y bloque de pensamiento (thinking), renderizado mediante `--jinja`.
- Tool calling en formato XML de Qwen3.8, con soporte de function calling integrado en la plantilla.
- Comportamiento agéntico y razonamiento multi-paso, según los tags del modelo (`agentic`, `tool-use`).
- Entrada multimodal (visión) al cargar el proyector `mmproj-Qwen3.8-27B-Q5_K-MIX.gguf` junto al modelo principal.
- Decodificación especulativa mediante cabeza borrador DFlash (recomendada) o, en principio, mediante una cabeza MTP como sidecar.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento y matemáticas: no se documentan evaluaciones específicas en la información disponible.

## Casos de uso

- Asistentes conversacionales multi-turno: el modelo mantiene contexto de hasta 131.072 tokens, lo que permite conversaciones largas con historial extenso o documentos adjuntos sin truncar.
- Agentes con uso de herramientas: la plantilla Qwen3.8 en formato XML y el soporte `--jinja` permiten integrarlo en orquestadores que expongan funciones (APIs, consultas a bases de datos, operaciones de fichero) y encadenen varios pasos.
- Despliegue en hardware de consumo: con 11,77 GB en IQ3_S, cabe en GPUs de 16 GB de VRAM junto al proyector multimodal, lo que habilita prototipos agénticos locales sin infraestructura de datacenter.
- Procesamiento de documentos con imágenes: combinado con el `mmproj`, puede leer gráficos y capturas; el autor verificó el proyector Q5_K-MIX contra el BF16 de sabi-noema con resultados idénticos en lectura de gráficas.
- Servicio de inferencia ligero: `llama-server` con `-ngl 99 -c 131072` permite exponer el modelo como endpoint compatible con la API de chat para aplicaciones internas.
- Generación acelerada en producción: emparejado con la cabeza DFlash Q4_0 (1,1 GB), la decodificación especulativa reduce la latencia por token aceptado, útil en asistentes interactivos con requisitos de respuesta rápida.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de un fine-tune RL al aplicarle un mapa de cuantización heredado de otro modelo, dado que el autor documenta el procedimiento completo y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor advierte explícitamente de que este archivo no hereda las puntuaciones del modelo de ISTA-DASLab, pese a compartir asignación por tensor y tamaño.

## Requisitos de hardware

- VRAM estimada: unos 12 GB para el modelo principal en IQ3_S, más 0,33 GB del proyector multimodal si se usa visión. Con la cabeza DFlash Q4_0 (1,09 GB) hay que sumar ese espacio y reducir el contexto a 65.536 tokens para mantenerse en 16 GB.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 y cualquier GPU con 16 GB o más para el modelo completo con contexto largo; A100 y H100 para despliegues con concurrencia o contexto completo de 131.072 tokens.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 4090, RTX 4080, RTX 3090, RTX 4060 Ti de 16 GB) siempre que se ajuste el contexto o se prescinda de la cabeza borrador.
- Opciones de despliegue: `llama-cli`, `llama-server` y, en general, llama.cpp. Los tags indican `endpoints_compatible`. No se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles de forma numérica. El autor afirma que la cabeza DFlash «puede acelerar mucho la generación» y que es más rápida por token aceptado que la alternativa MTP en su configuración, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| vmarcelo/Sabi-Noema-IQ3_S (este) | ≈26,9 B denso | 131.072 | IQ3_S, 11,77 GB | Apache-2.0 | Fine-tune RL de sabicap con mapa de ISTA; sin MTP |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | ≈27 B denso | no disponible | IQ3_S con pesos GSQ | Apache-2.0 | Pesos optimizados por GSQ; referencia de asignación y de benchmarks |
| ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF | ≈27 B denso | no disponible | IQ3_S con MTP | no disponible | Mismo mapa RCO, fine-tune distinto; usado como verificación cruzada |
| vmarcelo/Sabi-Noema-MTP-IQ3_S-GSQ-RCO-GGUF | ≈26,9 B denso | no disponible | IQ3_S con cabeza MTP | Apache-2.0 | Versión posterior recomendada por el propio autor |

## Limitaciones y advertencias

- El archivo no incorpora los pesos GSQ de ISTA: solo reproduce su asignación por tensor. El rendimiento puede diferir del de los modelos de referencia aunque el tamaño coincida.
- La matriz de importancia se calibró sobre Qwen3.8 base, no sobre sabi-noema; el autor señala que una imatrix específica del fine-tune probablemente mejoraría en distribuciones agénticas.
- La cabeza borrador DFlash se entrenó para Qwen3.8-27B base, no para este fine-tune; transfiere bien según el autor, pero no hay garantía formal ni métricas publicadas.
- La cabeza MTP no se ha evaluado en este archivo; solo funcionaría como sidecar, ya que el modelo carece de `blk.64`.
- El modo chat interactivo de `llama-cli` ignora silenciosamente `--model-draft`; hay que usar modo single-turn (`-st`) o `llama-server` para la decodificación especulativa.
- Con la cabeza borrador cargada, el contexto completo de 131.072 tokens no cabe en 16 GB de VRAM.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque son esperables en un modelo de 27 B cuantizado a 3,5 bits.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del fine-tune de sabicap, de los que se hereda.
- La cuantización a 3,50 bpw implica pérdida de precisión frente a BF16; no hay evaluaciones publicadas que cuantifiquen esa degradación en este fine-tune concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vmarcelo/Sabi-Noema-IQ3_S-GSQ-RCO-GGUF
- Versión recomendada con cabeza MTP: https://huggingface.co/vmarcelo/Sabi-Noema-MTP-IQ3_S-GSQ-RCO-GGUF
- Modelo base (fine-tune): https://huggingface.co/sabicap/sabi-noema
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia de asignación GSQ-RCO de ISTA: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Proyector multimodal: https://huggingface.co/HermiHg/Qwen3.8-27B-mmproj-Q5_K-MIX-GGUF
- Cabeza DFlash: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Verificación cruzada: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Paper GSQ/RCO: https://arxiv.org/abs/2604.18556
- Paper GSQ/RCO: https://arxiv.org/abs/2605.00649
