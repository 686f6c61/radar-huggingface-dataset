# vmarcelo/Sabi-Noema-IQ3_S-GSQ-RCO-GGUF

## Resumen

Sabi-Noema IQ3_S (GSQ-RCO map) es una cuantización GGUF en formato IQ3_S del modelo [sabicap/sabi-noema](https://huggingface.co/sabicap/sabi-noema), un fine-tune por RL sobre Qwen3.8-27B publicado por sabicap. El autor de esta versión, vmarcelo, reproduce el mapa de asignación de tipos por tensor del trabajo GSQ + RCO de ISTA-DASLab, aplicándolo a pesos K-quant estándar de llama.cpp guiados por una matriz de importancia (imatrix). El resultado es un fichero de 11,77 GB (3,50 bits por peso) que reproduce el tamaño del original de ISTA, aunque no necesariamente sus resultados de benchmark, tal y como advierte la propia model card.

El modelo base es conversacional y agéntico, con soporte de tool calling en formato XML de Qwen3.8, bloques de razonamiento (thinking) y capacidades multimodales mediante un proyector de visión incluido como archivo separado. La relevancia de esta cuantización está en permitir ejecutar un modelo de ~27B parámetros con razonamiento y uso de herramientas en hardware de consumo, con una ventana de contexto de 131.072 tokens y decodificación especulativa opcional mediante una cabeza DFlash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con soporte de decodificación especulativa DFlash/MTP |
| Parametros totales | 26.895.998.464 (~26,9B, dato del checkpoint safetensors) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | 131.072 tokens (según los comandos de ejemplo de la model card) |
| Tipos de cuantizacion | IQ3_S (3,50 bpw) con mapa de tipos por tensor GSQ-RCO de ISTA; mmproj en Q5_K-MIX (~5 bpw); draft DFlash en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (851 tensores, 64 bloques de texto, sin cabeza MTP) |

## Arquitectura y entrenamiento

El modelo base, sabi-noema, es un fine-tune por aprendizaje por refuerzo sobre Qwen3.8-27B, un transformer denso de la familia Qwen. Esta derivación no altera la arquitectura: se limita a cuantizar los pesos. El proceso de construcción documentado es el siguiente: primero se convierte el checkpoint safetensors a GGUF BF16 (sin pérdida de precisión, con `--no-mtp` porque el modelo base declara `mtp_num_hidden_layers: 0`); después se cuantiza con `llama-quantize` usando la matriz de importancia publicada por ISTA (`imatrix-qwen3.8-27b.gguf`, calibrada sobre Qwen3.8-27B base con 1000 fragmentos) y un mapa de 554 sobrescrituras de tipo por tensor que reproduce la asignación IQ3_S del pipeline GSQ-RCO de ISTA-DASLab, verificada sin discrepancias contra el volcado oficial `rco-allocation.txt` y contra los tipos de tensor de otro modelo con la misma arquitectura.

Sobre el entrenamiento del modelo base no se detallan en la model card el número de tokens ni la composición del dataset; solo se indica que se trata de un RL fine-tune sobre Qwen3.8-27B. Como innovación técnica relevante, la cuantización aplica el método GSQ + RCO de ISTA-DASLab en su variante de "mapa de asignación" (reproduce qué tensor recibe qué tipo, no los pesos optimizados por GSQ), y se documenta un detalle de reproducibilidad importante: en `--tensor-type-file`, las entradas genéricas (`output.weight`, `token_embd.weight`) deben ir al final porque `llama-quantize` aplica primera-coincidencia-gana por regex.

## Capacidades

- Generación de texto conversacional, con plantilla de chat embebida que se activa con `--jinja` en llama.cpp.
- Razonamiento con bloques de thinking (formato Qwen3.8); los ejemplos usan `--no-reasoning-preserve`, que coincide con cómo se ejecutaron las evaluaciones publicadas de sabi-noema.
- Uso de herramientas (tool calling) en el formato XML de Qwen3.8, con etiquetas "agentic" y "tool-use" en la model card.
- Capacidades de visión mediante el archivo `mmproj-Qwen3.8-27B-Q5_K-MIX.gguf` (encoder de visión más proyector, cuantizado en mezcla Q5_0/Q6_K), probado con resultados idénticos al proyector BF16 en lectura de gráficos.
- Decodificación especulativa mediante cabeza DFlash (Q4_0, 1,09 GB) incluida en el repositorio, con alternativa MTP como sidecar (no benchmarkada).
- Contexto largo de hasta 131.072 tokens en los comandos de ejemplo.
- Soporte multi-turno y despliegue como servidor con `llama-server`.

## Casos de uso

- Chatbots conversacionales autoalojados: con `llama-server` y la plantilla de chat embebida, el modelo puede servir como backend de asistente multi-turno en infraestructura propia, sin depender de APIs externas y con licencia Apache-2.0 sin restricciones comerciales.
- Agentes con tool calling: el formato XML de llamadas a herramientas de Qwen3.8 permite integrarlo en frameworks de agentes (por ejemplo, mediante el endpoint compatible de OpenAI de `llama-server`) para que el modelo invoque funciones, consulte APIs o ejecute acciones en flujos multi-paso.
- Análisis de documentos con gráficos: el mmproj cuantizado permite enviar imágenes (por ejemplo, capturas de dashboards o gráficos) junto al prompt; la model card reporta resultados idénticos al proyector BF16 en lectura de gráficos.
- Generación y revisión de código en local: con 131K de contexto cabe un repositorio de tamaño medio para tareas de refactorización, revisión de pull requests o generación de código sin enviar el código a servicios de terceros.
- Inferencia acelerada en GPU de consumo: la combinación de IQ3_S (11,77 GB) y decodificación especulativa DFlash permite generar texto con mayor velocidad de tokens por segundo en una GPU de 16 GB, útil para uso interactivo diario.
- Procesamiento de contextos largos offline: resumen o análisis de documentos extensos (informes, transcripciones) aprovechando la ventana de 131.072 tokens, ejecutando todo el pipeline en local con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card advierte explícitamente que este archivo reproduce el tamaño de la versión de ISTA-DASLab, no sus puntuaciones de benchmark, ya que los pesos son K-quants estándar de llama.cpp guiados por imatrix y no los pesos optimizados del pipeline GSQ. Los parámetros de generación recomendados son los del modelo base: temperature 1,0, top_p 0,95 y top_k 20.

## Requisitos de hardware

- El fichero principal ocupa 11,77 GB (3,50 bpw); con el mmproj (332 MB) y el draft DFlash (1,09 GB) el conjunto ronda los 13,2 GB. La model card indica que el modelo completo con contexto de 131.072 tokens cabe en 16 GB de VRAM, pero que con el draft cargado ya no cabe el contexto completo en 16 GB (se sugiere reducir a 65.536 tokens).
- Una GPU de 16 GB de VRAM (por ejemplo, RTX 4090, RTX 5080 o similar) es suficiente para el modelo solo con `-ngl 99` y contexto completo; para contexto completo más decodificación especulativa se recomienda más VRAM (24 GB, por ejemplo RTX 3090/4090 de 24 GB).
- También es viable su ejecución en CPU o en configuraciones híbridas CPU+GPU gracias a GGUF y a la descarga de capas (`-ngl`), aunque no se proporcionan cifras de latencia o throughput.
- Despliegue: llama.cpp es la herramienta documentada (`llama-cli` y `llama-server`); al ser GGUF estándar, debería funcionar también con Ollama, LM Studio y otros runtimes compatibles, aunque no se documenta explícitamente. No hay menciones a vLLM o TGI (que no soportan GGUF).
- Comandos recomendados: `llama-cli -m sabi-noema-IQ3_S-ista-map.gguf --jinja --no-reasoning-preserve -ngl 99 -c 131072 --temp 1.0 --top-p 0.95 --top-k 20`, y para visión añadir `--mmproj mmproj-Qwen3.8-27B-Q5_K-MIX.gguf`. Para decodificación especulativa: `--model-draft dflash-Qwen3.8-27B-Q4_0.gguf --spec-type draft-dflash -c 65536`. Nota: el modo chat interactivo de `llama-cli` ignora silenciosamente `--model-draft`; hay que usar `-st` o `llama-server`.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|---|
| Sabi-Noema IQ3_S (este) | ~26,9B | IQ3_S (3,50 bpw, 11,77 GB) | 131.072 | Si (mmproj incluido) | Apache-2.0 | K-quants con mapa GSQ-RCO de ISTA; DFlash incluido |
| ISTA-DASLab Qwen3.8-27B-GSQ-RCO IQ3_S | ~27B | IQ3_S (mismo tamaño) | no disponible | no disponible | Apache-2.0 | Pesos optimizados con el pipeline GSQ original; referencia del mapa de asignación |
| Qwen3.8-27B (base, GGUF de ggml-org) | ~27B | Varias (incluye Q8_0, Q4_0, MTP/DFlash) | 131.072 | Si | Apache-2.0 | Modelo base sin el RL fine-tune de sabi-noema; origen del mmproj y del draft |

## Limitaciones y advertencias

- La model card advierte expresamente que este archivo reproduce la asignación de tipos de ISTA, no sus pesos optimizados: cabe esperar el tamaño del archivo de ISTA, pero no sus puntuaciones de benchmark.
- La matriz de importancia usada está calibrada sobre Qwen3.8-27B base, no sobre sabi-noema; una imatrix específica del fine-tune probablemente daría mejores resultados en distribuciones agénticas, según el propio autor.
- El draft DFlash fue entrenado para el Qwen3.8-27B base, no para este fine-tune; se transfiere bien según el autor, pero puede afectar a la tasa de aceptación de tokens especulativos.
- La alternativa de decodificación especulativa MTP no fue benchmarkada en este repositorio.
- Una cuantización a ~3,5 bpw implica degradación de calidad respecto a BF16, especialmente en razonamiento fino, código complejo y tareas agénticas; conviene validar en el caso de uso concreto antes de producción.
- No se especifican los idiomas soportados ni la composición del dataset de entrenamiento del modelo base.
- No se han publicado benchmarks del modelo base sabi-noema en la información disponible, por lo que su rendimiento real en tareas concretas no puede verificarse desde esta ficha.
- El modo chat interactivo de `llama-cli` ignora silenciosamente `--model-draft`, un detalle fácil de pasar por alto al medir velocidad.
- Sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada; como todo LLM generativo, debe asumirse riesgo de alucinación y de herencia de sesgos de Qwen3.8-27B y de su fine-tune.
- Licencia Apache-2.0, heredada del modelo base: permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/vmarcelo/Sabi-Noema-IQ3_S-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/sabicap/sabi-noema
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia del mapa de asignación (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Paper GSQ/RCO 1: https://arxiv.org/abs/2604.18556
- Paper GSQ/RCO 2: https://arxiv.org/abs/2605.00649
- Proyector de visión: https://huggingface.co/HermiHg/Qwen3.8-27B-mmproj-Q5_K-MIX-GGUF
- Draft DFlash y MTP: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Verificación cruzada: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-IQ3_S-mtp.gguf
- Herramienta de conversión y cuantización: https://github.com/ggml-org/llama.cpp
