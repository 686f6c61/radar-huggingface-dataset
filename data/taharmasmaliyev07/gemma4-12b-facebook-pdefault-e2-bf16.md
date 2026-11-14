# taharmasmaliyev07/Gemma4-12B-FACEBOOK-PDEFAULT-E2-BF16

## Resumen

Gemma4-12B-FACEBOOK-PDEFAULT-E2-BF16 es un ajuste fino (finetune) publicado por el usuario taharmasmaliyev07 sobre un modelo de la familia Gemma 4, identificado internamente con la arquitectura `gemma4_unified`. El modelo tiene 11.959.730.224 parámetros (aproximadamente 12B) almacenados en formato BF16, lo que resulta en un repositorio de 24,2 GB. Está etiquetado como `image-text-to-text`, por lo que se presenta como un modelo multimodal de entrada imagen y texto, y como `text-generation-inference`, lo que indica compatibilidad con el stack de inferencia de Hugging Face.

La model card es extremadamente escueta: se limita a indicar que fue entrenado con Unsloth y la librería TRL de Hugging Face, con una licencia Apache 2.0 y soporte declarado únicamente para inglés. No se especifican datos de entrenamiento, composición del dataset, hiperparámetros, número de tokens vistos ni metodología de alineación (RLHF/DPO). El sufijo "FACEBOOK-PDEFAULT-E2" sugiere un ajuste orientado a un caso de uso concreto, presumiblemente relacionado con Facebook y algún tipo de prompt por defecto, pero el autor no lo documenta.

Por su relevancia práctica: se trata de un modelo de 12B con capacidades multimodales declaradas y licencia permisiva, lo que lo hace potencialmente interesante para despliegues comerciales. Sin embargo, la ausencia total de benchmarks, de documentación de entrenamiento y de tracción en la comunidad (0 descargas, 0 likes en el momento de la consulta) obliga a tratarlo como un experimento no validado que requiere evaluación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer multimodal, segun tag de libreria) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma4_unified`, un identificador que no aparece en la documentacion publica de Google DeepMind para las generaciones previas de Gemma y que, por el tag `image-text-to-text`, corresponde a un transformer multimodal con torre de vision y decoder de lenguaje. El pipeline `image-text-to-text` confirma que acepta imagenes y texto como entrada y genera texto como salida. No hay informacion disponible sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (estandar, sliding window o hibrido), tokenizador ni resolucion de imagen soportada.

Respecto al entrenamiento, la unica informacion es que se uso Unsloth junto con TRL, lo que indica un ajuste fino supervisado (SFT) o posiblemente DPO/ORPO sobre el modelo base `taharmasmaliyev07/Gemma4-12B-FACEBOOK-PDEFAULT-E2-BF16`, que a su vez es el mismo identificador que el modelo publicado. Esta autocorreferencia en el campo `base_model` es inconsistente y sugiere un error de configuracion en la subida: el modelo no declara un ancestro distinto de si mismo. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo etapas de alineacion con preferencias humanas.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational`.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), lo que sugiere capacidad de describir imagenes, responder preguntas sobre ellas o extraer informacion visual.
- Compatibilidad con `text-generation-inference` (TGI), lo que habilita despliegue en servidores de inferencia de Hugging Face.
- Entrenamiento y exportacion via Unsloth, lo que facilita futuros ajustes finos con bajo consumo de VRAM.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo puede recibir una imagen y una pregunta en ingles y generar una respuesta textual, lo que permite construir demos de captioning o VQA sin salir del ecosistema transformers.
- Ajuste fino adicional con Unsloth: al estar entrenado con esta herramienta y publicarse en BF16, sirve como punto de partida para especializar el modelo en un dominio concreto (por ejemplo, catalogacion de productos) con una sola GPU de 24 GB en cuantizacion 4-bit.
- Despliegue experimental en TGI: al declarar compatibilidad con text-generation-inference, se puede levantar un endpoint OpenAI-compatible para pruebas internas de latencia y calidad antes de comprometerse con un modelo mayor.
- Evaluacion comparativa de la familia Gemma 4: util como referencia para medir como afecta un finetune no documentado al comportamiento del modelo base en tareas de vision-lenguaje.
- Generacion de descripciones de imagenes en ingles para pipelines de accesibilidad: el modelo puede producir texto alternativo a partir de imagenes, aunque requeriria validacion de calidad por la falta de benchmarks.
- Investigacion sobre finetunes comunitarios: dado que la model card es minima, el modelo es un caso de estudio sobre como la falta de documentacion afecta a la reproducibilidad en el ecosistema Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 24 GB solo para pesos (11,96B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se necesitan 28-32 GB para inferencia comoda.
- VRAM estimada en cuantizacion 8-bit: en torno a 12-13 GB de pesos, con picos de 16-18 GB.
- VRAM estimada en cuantizacion 4-bit (GPTQ/AWQ/bnb): en torno a 6-7 GB de pesos, con picos de 10-12 GB; cabe en GPUs consumer de 12-16 GB.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 con cuidado o 8-bit; RTX 3090/4080/4070 Ti Super (16 GB) en 4-bit.
- Cabe en GPU consumer: si, en cuantizacion 4-bit en tarjetas de 12 GB o superiores; en BF16 solo en RTX 4090/A6000 o superiores.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag explicito), y previsiblemente llama.cpp/Ollama/vLLM si se generan pesos GGUF o se soporta la arquitectura, aunque no esta confirmado.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Documentacion |
|---|---|---|---|---|---|
| Gemma4-12B-FACEBOOK-PDEFAULT-E2-BF16 | ~12B | no disponible | imagen-texto | Apache 2.0 | minima (sin benchmarks) |
| Gemma 2 9B (Google) | 9B | 8K | texto | Gemma Terms | extensa, con benchmarks |
| Gemma 3 12B (Google) | 12B | 128K | imagen-texto | Gemma Terms | extensa, con benchmarks |
| Qwen2.5-VL 7B | 7B | 128K | imagen-texto | Apache 2.0 | extensa, con benchmarks |

La comparativa es orientativa: el modelo aqui descrito no publica contexto, benchmarks ni detalles de entrenamiento, por lo que la comparacion se limita a tamano, modalidad y licencia. Frente a Gemma 3 12B, la diferencia clave es la licencia Apache 2.0 (mas permisiva que los Gemma Terms) y la falta de validacion publica. Frente a Qwen2.5-VL 7B, el modelo de Alibaba ofrece contexto documentado y evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K, VQA ni ninguna otra tarea.
- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros ni metodologia, lo que impide evaluar riesgos de sobreajuste o contaminacion.
- Campo `base_model` autocontenido: el modelo se declara a si mismo como base, lo que rompe la trazabilidad y sugiere un error de configuracion.
- Solo ingles declarado: no apto para produccion en castellano u otros idiomas sin evaluacion adicional.
- Riesgo de alucinacion: inherente a cualquier modelo generativo y no mitigado de forma documentada (sin RLHF/DPO declarado).
- Sesgos: no documentados; al desconocerse el dataset de ajuste, no se puede evaluar el sesgo introducido por el finetune.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan inferir calidad.
- Licencia Apache 2.0 declarada, lo que permite uso comercial, pero el autor no aclara si los pesos derivan de un modelo base con terminos adicionales (Gemma Terms) que podrian imponer restricciones.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin medirlo empiricamente.

## Enlaces

- Hugging Face: https://huggingface.co/taharmasmaliyev07/Gemma4-12B-FACEBOOK-PDEFAULT-E2-BF16
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Paper, blog o demo oficial del modelo: no disponible
