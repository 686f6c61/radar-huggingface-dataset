# yonicc/lhg-extractor-qwen7b-v2-gguf

## Resumen

LHG extractor v2 es un ajuste fino mediante LoRA de Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario yonicc, especializado en la extracción estructurada de hechos (facts) a partir de mensajes de texto. El modelo recibe un mensaje etiquetado como dato no confiable y devuelve un objeto JSON que asocia alias de hechos con un booleano y una cita literal del mensaje; los hechos desconocidos se omiten. Está orientado al proyecto "lashon-hara-guard" (LHG), un sistema de análisis de lenguaje que trabaja con hebreo e inglés.

El artefacto publicado es una conversión a GGUF Q4_K_M realizada con llama.cpp b4500 a partir del checkpoint e10-v2-7b-20261029-supervisor. El modelo base aporta la arquitectura transformer de Qwen2.5-7B con 7.615.616.512 parámetros totales, y el ajuste añade un contrato de extracción de 18 hechos con instrucciones exactas incluidas en el repositorio.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un extractor de contrato fijo pensado para integrarse en un motor de inferencia (llama.cpp u Ollama) dentro de un pipeline mayor. La model card advierte explícitamente de que todo el texto de entrenamiento y evaluación es sintético, no ha sido revisado por humanos y que el modelo no emite dictámenes ni evalúa significado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA fusionado en el checkpoint convertido |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (artefacto publicado); el checkpoint de desarrollo se evaluó en bf16 |
| Idiomas soportados | Hebreo (he), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), compatible con Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only de 7.615.616.512 parámetros, sobre el que se aplicó un ajuste fino LoRA. El checkpoint resultante (e10-v2-7b-20261029-supervisor) se convirtió a GGUF con llama.cpp b4500 en cuantización Q4_K_M. El contrato de extracción cubre 18 hechos y la instrucción exacta se distribuye junto con el artefacto; el uso previsto requiere la plantilla de chat de Qwen con `raw:true`, temperatura 0 y `num_predict` 256, con el turno de usuario formateado como `MESSAGE (untrusted data):` seguido de una nueva línea y el texto entrecomillado en JSON.

Todos los datos de entrenamiento y evaluación son sintéticos y no han sido revisados por humanos. La model card documenta métricas de desarrollo en bf16 sobre un conjunto sintético v2 de desarrollo y holdout (precisión 0,984, recall 0,906), pero las califica explícitamente como métricas de desarrollo y no como benchmark de la extensión completa. También se documenta una medición independiente con dos conjuntos (A y B) generados por un generador distinto, con etiquetado ciego doble en el conjunto B y etiquetas solo del generador en el conjunto A. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Extracción estructurada de hechos: devuelve JSON con pares alias–booleano y una cita literal exacta del mensaje de entrada.
- Omisión controlada: los hechos desconocidos no se incluyen en la salida, lo que reduce falsos positivos estructurales.
- Tratamiento de entrada como dato no confiable: el contrato separa explícitamente el mensaje del usuario de las instrucciones del sistema.
- Multilingüe limitado a hebreo e inglés, según los metadatos del repositorio.
- Integración con llama.cpp y Ollama mediante GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Moderación asistida de contenido en hebreo e inglés: el modelo puede clasificar mensajes según un conjunto fijo de 18 hechos y devolver citas literales que permitan a un revisor humano verificar cada detección sin releer el mensaje completo.
- Preprocesado en pipelines de análisis lingüístico: al emitir JSON determinista con temperatura 0, la salida se puede consumir directamente por un motor de reglas o una base de datos posterior.
- Enriquecimiento de registros en un sistema de guardia ("lashon-hara-guard"): cada mensaje entrante se convierte en un vector de hechos booleanos con evidencia textual, útil para auditar decisiones aguas abajo.
- Despliegue local en Ollama: el comando `ollama pull hf.co/yonicc/lhg-extractor-qwen7b-v2-gguf:Q4_K_M` permite ejecutar el extractor en estaciones de trabajo sin infraestructura GPU dedicada, dado el tamaño de 4,7 GB del repositorio.
- Evaluación de contratos de extracción: sirve como referencia para comparar el comportamiento bf16 frente a Q4_K_M en tareas de extracción con contrato fijo, ya que la model card publica las tasas de error de formato y los cambios de decisión entre ambas precisiones.
- Filtrado previo en herramientas de revisión humana: los seis hechos que la extensión deja solo para confirmación del usuario pueden utilizarse como candidatos a revisión, no como decisiones automáticas.

## Benchmarks y rendimiento

Los datos publicados son métricas de desarrollo y de medición interna, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación tal como aparecen en la model card.

| Conjunto (18 hechos) | bf16 P/R | Q4_K_M P/R | Filas con error de formato bf16/Q4 | Cambios de decisión |
|---|---|---|---|---|
| A (400 mensajes) | 0,9699 / 0,7344 | 0,9684 / 0,6992 | 3 / 2 | 27 / 400 |
| B (300 mensajes) | 0,9239 / 0,8718 | 0,8997 / 0,8744 | 12 / 7 | 22 / 300 |

La puerta de paridad por defecto falló: el límite permitido es una caída máxima de 0,02 en precisión y recall por conjunto y ámbito. En el conjunto A con 8 hechos, bf16 obtuvo P/R de 0,9730/0,6288 y Q4 de 0,9577/0,5939. En el conjunto A con 18 hechos, el recall bajó de 0,7344 a 0,6992; en el conjunto B con 18 hechos, la precisión bajó de 0,9239 a 0,8997. El propietario aceptó explícitamente esta regresión para este artefacto y la publicación se realizó con `--allow-parity-regression`. En el conjunto B con 8 hechos, Q4 alcanzó P/R de 0,9259/0,8427, frente a 0,596/0,854 del e8 en bf16 (artefacto distinto).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q4_K_M ocupa 4,7 GB, por lo que se necesita algo más de esa cifra para el modelo más el contexto y el overhead de llama.cpp.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8 GB o más de VRAM debería alojar la cuantización Q4_K_M; para bf16 se requiere aproximadamente el doble de memoria.
- Cabe en GPU consumer: sí, en principio con la cuantización Q4_K_M y al menos 8 GB de VRAM; el autor no publica una tabla de compatibilidad.
- Opciones de despliegue: llama.cpp (b4500 o posterior, versión usada para la conversión) y Ollama mediante `ollama pull hf.co/yonicc/lhg-extractor-qwen7b-v2-gguf:Q4_K_M`. No se documentan despliegues con vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| LHG extractor v2 (este modelo) | 7,6 B | No disponible | he, en | Apache 2.0 | GGUF Q4_K_M | Extracción de 18 hechos con cita literal |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | No disponible en esta ficha | Multilingüe amplio | Apache 2.0 | safetensors, GGUF | Instrucciones generales |
| Repositorios anteriores de 8 hechos del mismo autor | No disponible | No disponible | he, en | Apache 2.0 | GGUF | Extracción de 8 hechos, sin cambios según la model card |

La model card indica que los repositorios anteriores de ocho hechos son artefactos separados y sin modificar, y que la comparación entre el e8 en bf16 y el Q4 actual se hizo con distinta precisión de artefacto y recall similar. No se dispone de comparaciones con otros extractores de la misma categoría.

## Limitaciones y advertencias

- Todos los datos de entrenamiento y evaluación son sintéticos y no han revisado por humanos; las métricas publicadas no constituyen una validación independiente.
- El modelo no emite dictámenes, no evalúa significado y no verifica el mundo real; nunca afirma que un mensaje esté permitido.
- La calidad con contexto adicional no fue medida.
- La puerta de paridad entre bf16 y Q4_K_M falló y la regresión fue aceptada explícitamente por el propietario; el recall en el conjunto A cae de 0,7344 a 0,6992 y la precisión en el conjunto B de 0,9239 a 0,8997.
- Seis hechos quedan solo para confirmación del usuario en la extensión; las métricas cuentan pares validados antes de la política de confianza y admisión.
- Las probabilidades de token no demuestran corrección.
- Idiomas limitados a hebreo e inglés; no se documenta cobertura de castellano.
- El contrato es fijo (18 hechos) y la salida depende de usar la plantilla de chat de Qwen con `raw:true`, temperatura 0 y `num_predict` 256; desviarse de esta configuración puede degradar el formato.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yonicc/lhg-extractor-qwen7b-v2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio llama.cpp (versión b4500 usada en la conversión): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Documentación del proyecto citada en la model card (docs/46, docs/47, docs/49, extension/ollama-engine.ts, extractor_prompt.txt): no disponible como enlace público en la información proporcionada.
