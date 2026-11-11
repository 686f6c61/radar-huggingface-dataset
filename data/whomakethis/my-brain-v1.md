# whomakethis/my-brain-v1

## Resumen

`whomakethis/my-brain-v1` es un ajuste fino (finetune) del modelo `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, publicado por el usuario independiente whomakethis bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, construido sobre la familia Gemma 4 de Google en su variante E2B (la variante "efectiva" de 2 000 millones de parametros) y en formato ya cuantizado a 4 bits por Unsloth.

El modelo hereda la arquitectura y las capacidades del Gemma 4 E2B instructivo original, pero no se documenta en la model card que datos de ajuste fino se hayan utilizado, ni el metodo (SFT, LoRA, DPO), ni la composicion del dataset. La model card es una plantilla autogenerada por Unsloth que solo indica el modelo base, la licencia y que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face. El repositorio ocupa 1,5 GB, coherente con un modelo de ~2B de parametros cuantizado a 4 bits.

Su relevancia practica es limitada como referencia general, ya que se trata de una publicacion sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta). Resulta util, eso si, como ejemplo de flujo de trabajo de ajuste fino rapido con Unsloth sobre un modelo multimodal pequeno, y como punto de partida para quien quiera reproducir o inspeccionar un finetune de Gemma 4 E2B en 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4, variante E2B |
| Parametros totales | no disponible (variante E2B, "effective 2B" segun nomenclatura de Gemma 4) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos base en 4 bits (bnb-4bit); no se documentan otras variantes |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,5 GB, libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que a su vez es una version cuantizada a 4 bits (bitsandbytes) del Gemma 4 E2B instructivo de Google, preparada por Unsloth para entrenamiento con menos VRAM. La arquitectura subyacente es la de Gemma 4 en su variante E2B, un transformer multimodal que procesa imagenes y texto. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni codificador visual en la informacion proporcionada.

En cuanto al entrenamiento, la model card solo indica que se uso Unsloth junto con la libreria TRL de Hugging Face, lo que sugiere un ajuste fino supervisado (SFT) o posiblemente DPO con LoRA/QLoRA sobre el modelo cuantizado a 4 bits. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, ni hiperparametros como rango de LoRA, learning rate o numero de epocas. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio pipeline de Unsloth (optimizaciones de kernels y ahorro de memoria).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Gemma 4 E2B instructivo.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y dialogos que combinan imagen y texto.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 2B de parametros.
- Soporte de tool calling / function calling: no documentado en la model card; se desconoce si el finetune lo preserva.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo se declara ingles; no se garantiza el rendimiento en castellano ni en otros idiomas.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Prototipado rapido de asistentes multimodales: al ser un modelo de ~2B en 4 bits, se puede cargar en una GPU de consumo para probar flujos de pregunta-respuesta sobre imagenes antes de invertir en modelos mayores.
- Experimentacion con ajuste fino: sirve como caso de estudio de un finetune realizado con Unsloth y TRL sobre Gemma 4 E2B, util para replicar el pipeline en otros dominios.
- Descripcion automatica de imagenes en ingles: el modelo puede generar pies de foto o resumenes de contenido visual en tareas de catalogacion o accesibilidad, siempre que la calidad sea suficiente tras el finetune.
- Extraccion de informacion de capturas y documentos escaneados: en un pipeline image-text-to-text, se le puede pedir que transcriba o resuma el contenido de una imagen en ingles.
- Chat de soporte sencillo en ingles: con 2B de parametros y contexto no documentado, es adecuado solo para conversaciones cortas y de baja complejidad, no para atencion al cliente en produccion.
- Base para demos y pruebas de concepto en entornos con VRAM limitada: su tamano reducido permite desplegarlo en portatiles con GPU o incluso en CPU con llama.cpp si se convierte a GGUF.
- Evaluacion comparativa de finetunes: util para medir el impacto de un ajuste fino concreto frente al Gemma 4 E2B original en tareas visuales y de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado a 4 bits y pesar 1,5 GB el repositorio, la inferencia completa cabe en torno a 2-3 GB de VRAM, dependiendo de la longitud de contexto y del procesamiento de imagenes (el codificador visual anade overhead).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para uso comodo; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. En A100/H100 el modelo esta infrautilizado y solo tiene sentido para lotes grandes o para servir a muchos usuarios.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 6 GB o mas; tambien es viable en CPU mediante llama.cpp u Ollama si se dispone de una version GGUF (no publicada en este repositorio).
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (tag incluido), vLLM (previa conversion o carga del checkpoint), llama.cpp/Ollama (requiere conversion a GGUF, no incluida). El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 2B en 4 bits, la latencia por token deberia ser baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whomakethis/my-brain-v1 | ~2B (E2B, 4 bits) | no disponible | imagen + texto | apache-2.0 | Hugging Face, 0 descargas |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | ~2B (E2B, 4 bits) | no disponible | imagen + texto | apache-2.0 (segun modelo base) | Hugging Face |
| Gemma 4 E2B-it (original de Google) | ~2B (E2B) | no disponible | imagen + texto | licencia Gemma (uso comercial con restricciones) | Hugging Face, Google AI Studio |
| Finetunes pequenos multimodales de la comunidad (p. ej. sobre Qwen2-VL-2B) | ~2B | variable | imagen + texto | variable (a menudo Apache 2.0) | Hugging Face |

La comparativa se limita a la familia Gemma 4 y a alternativas de ~2B multimodales, ya que no se dispone de datos de rendimiento del modelo para comparar con cifras concretas. La principal diferencia frente al modelo base es el ajuste fino, cuyos efectos no estan documentados ni medidos.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: no se puede evaluar que sesgos se han introducido ni que comportamientos se han reforzado.
- Riesgo de alucinacion: como todo modelo de 2B, tiende a inventar detalles, especialmente en tareas de razonamiento o al describir imagenes con texto pequeno.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base Gemma 4 de Google tiene su propia licencia con restricciones de uso comercial y de redistribucion; conviene verificar la compatibilidad antes de un uso en produccion.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin evaluaciones independientes ni informes de calidad.
- Modelo de 2B: capacidad limitada para codigo, matematicas y razonamiento complejo; no apto para tareas que requieran precision alta.
- Tool calling y comportamiento agentico no documentados: no se debe asumir que funcionan correctamente tras el finetune.
- Formato 4 bits (bnb): puede degradar ligeramente la calidad respecto al modelo original en precision completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whomakethis/my-brain-v1
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de Gemma de Google: https://ai.google.dev/gemma
