# Syradevops/Selene-Rebel-4B-Instruct

## Resumen

Selene-Rebel-4B-Instruct es un ajuste fino (fine-tune) del checkpoint `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, publicado por el usuario Syradevops en Hugging Face. Se trata, por tanto, de un derivado de Gemma 3 4B Instruct, la familia de modelos abiertos de Google con arquitectura transformer decoder-only y capacidades multimodales de entrada imagen-texto. El repositorio declara 4.300.079.472 parámetros (4,3 B) en formato safetensors y un tamaño total de 8,6 GB, lo que es coherente con pesos fusionados en bf16/fp16 tras el entrenamiento.

El modelo se presenta como un asistente conversacional para generación de texto e image-text-to-text, entrenado con Unsloth y la librería TRL de Hugging Face, un stack habitual para ajustes finos eficientes en memoria sobre GPUs de consumo. La model card es mínima: no documenta dataset, número de tokens, método de ajuste ni evaluaciones, por lo que la mayor parte de las especificaciones de entrenamiento no están disponibles.

Su relevancia ahora es limitada pero informativa: sirve como ejemplo de fine-tune comunitario de Gemma 3 4B con licencia declarada Apache 2.0, 0 descargas y 1 like en el momento de la consulta, sin validación externa ni benchmarks publicados. Cualquier evaluación de producción debe hacerse por cuenta del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (derivado de `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`) |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Repositorio publicado en safetensors (8,6 GB, compatible con bf16/fp16); el modelo base se entrenó sobre una version bnb-4bit; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | `en` (ingles), unico idioma declarado en la model card |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Gemma 3 4B Instruct: un transformer decoder-only con atención multimodal para entradas de imagen y texto, tal y como indica el pipeline `image-text-to-text` del repositorio y la etiqueta `gemma3`. El autor no detalla ninguna modificación estructural propia, por lo que se asume que el fine-tune conserva la topología del modelo base.

El entrenamiento se realizó con Unsloth y TRL, partiendo de un checkpoint ya cuantizado a 4 bits (`bnb-4bit`), lo que en la práctica implica un esquema de ajuste eficiente en parámetros del tipo QLoRA (no confirmado explícitamente por el autor). No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, la configuración de LoRA (rango, alpha, capas objetivo) ni las métricas de validación. El tamaño del repositorio (8,6 GB para 4,3 B de parámetros) sugiere que los adaptadores se fusionaron y se exportaron en bf16/fp16.

## Capacidades

- Generación de texto conversacional multi-turno, con el formato de chat instruct heredado del modelo base.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que se espera soporte de comprensión de imágenes (no verificado con ejemplos por el autor).
- Razonamiento y conocimiento general: capacidades heredadas de Gemma 3 4B Instruct, sin evaluación específica publicada para este fine-tune.
- Generación de código y matemáticas: presumiblemente heredadas del base, sin datos de validación en el repositorio.
- Idiomas: únicamente inglés declarado; el resto de idiomas de Gemma 3 no están confirmados para este ajuste.
- Tool calling / function calling: no disponible (no documentado en la model card).
- Modo de razonamiento explícito (thinking), audio o agentes multi-paso: no disponible (no documentado).

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede desplegarse con `transformers` o TGI para validar flujos de chat multi-turno antes de invertir en un modelo mayor, dado su tamaño de 4,3 B y su licencia permisiva declarada.
- Experimento de comprensión de imágenes en local: al declarar el pipeline `image-text-to-text`, permite probar pipelines de captioning o VQA simple en GPUs de consumo con pesos en bf16 o cuantizados por el integrador.
- Base para nuevos fine-tunes: al ser un derivado de Gemma 3 4B ya entrenado con Unsloth, sirve como punto de partida para ajustes QLoRA adicionales sobre dominios concretos en una única GPU de 24 GB.
- Generación de texto asistida por lotes: tareas de resumen, reescritura o clasificación generativa en inglés donde no se requiera contexto largo ni capacidades de agente.
- Evaluación comparativa de técnicas de fine-tune: útil en investigación para medir el impacto de ajustar sobre un base cuantizado a 4 bits frente al modelo original en bf16.
- Docencia y experimentación con Gemma 3: caso práctico de ciclo completo (descarga, carga con `transformers`, inferencia multimodal) sin requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas multimodales, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8,6 GB solo de pesos, más caché KV y activaciones; en la práctica unos 11-14 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,3-5 GB de pesos, en torno a 7-9 GB con overhead.
- VRAM estimada en cuantización de 4 bits (requiere convertir a GGUF/AWQ por cuenta propia, no incluido en el repo): aproximadamente 2,5-3 GB de pesos, unos 4-6 GB en total.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para servicio concurrente en bf16; RTX 4090 (24 GB) y RTX 4080 (16 GB) para inferencia en bf16 con holgura.
- Cabe en GPU de consumo: sí. RTX 3090/4090 en bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en cuantizaciones de 8 y 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), TGI (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM si se valida el soporte de Gemma 3 multimodal en la versión utilizada, y llama.cpp/Ollama únicamente tras convertir los pesos a GGUF.
- Latencia y throughput: no disponible (sin mediciones publicadas por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Syradevops/Selene-Rebel-4B-Instruct | 4,3 B | no disponible | apache-2.0 (declarada) | Fine-tune comunitario, sin benchmarks ni descargas |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit (base) | ~4,3 B | no disponible en la informacion | heredada de Gemma 3 | Checkpoint base cuantizado a 4 bits usado para el ajuste |
| google/gemma-3-4b-it | ~4,3 B | no disponible en la informacion | Gemma Terms of Use | Modelo oficial de referencia, con documentación y evaluaciones publicadas por Google |
| Alternativas de ~3-4 B multimodales (por ejemplo, familias Qwen-VL o Llama 3.2 Vision) | rango 3-4 B | no disponible en la informacion | varía según familia | No se han podido verificar datos comparativos dentro de la informacion proporcionada |

## Limitaciones y advertencias

- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar sesgos o regresiones frente al modelo base.
- El ajuste parte de un checkpoint cuantizado a 4 bits; es habitual que este proceso introduzca degradación sutil de calidad respecto al modelo original en bf16, especialmente en matemáticas y código.
- Riesgo de alucinación estándar en modelos de 4 B: no hay evaluaciones que cuantifiquen la tasa de error en dominios factuales.
- Idiomas: solo se declara inglés. El uso en castellano no está validado y puede producir respuestas degradadas o mezcla de idiomas.
- Longitud de contexto no documentada: no debe asumirse la ventana del modelo base sin verificarla empíricamente.
- Licencia: el repositorio declara apache-2.0, pero al derivar de Gemma 3 los términos aplicables al modelo base (Gemma Terms of Use) pueden condicionar el uso comercial y la redistribución. Conviene revisar la licencia del modelo original antes de desplegar en producción.
- Sin validación de la comunidad: 0 descargas y 1 like en el momento de la consulta; no hay informes independientes de calidad ni de estabilidad.
- Soporte de tool calling y de agentes no confirmado; no debe asumirse en pipelines de producción sin pruebas propias.
- El repositorio no incluye cuantizaciones GGUF ni artefactos listos para llama.cpp/Ollama; requieren conversión y validación adicionales.

## Enlaces

- [Modelo en Hugging Face: Syradevops/Selene-Rebel-4B-Instruct](https://huggingface.co/Syradevops/Selene-Rebel-4B-Instruct)
- [Modelo base: unsloth/gemma-3-4b-it-unsloth-bnb-4bit](https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit)
- [Repositorio de Unsloth en GitHub](https://github.com/unslothai/unsloth)
- [Librería TRL de Hugging Face](https://github.com/huggingface/trl)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
