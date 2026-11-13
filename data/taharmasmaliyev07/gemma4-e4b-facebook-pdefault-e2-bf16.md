# taharmasmaliyev07/Gemma4-E4B-FACEBOOK-PDEFAULT-E2-BF16

## Resumen

Gemma4-E4B-FACEBOOK-PDEFAULT-E2-BF16 es un ajuste fino (finetune) publicado por el usuario taharmasmaliyev07 sobre un modelo de la familia Gemma 4, concretamente sobre una variante denominada E4B. El repositorio se distribuye en formato safetensors con pesos en BF16 y está etiquetado para la pipeline image-text-to-text, lo que indica que el modelo base es multimodal (acepta imagen y texto como entrada). El nombre del repositorio sugiere un entrenamiento orientado a un dataset o tarea relacionados con Facebook con una configuración de prompt por defecto (PDEFAULT) y una etapa E2.

El modelo cuenta con 7.996.156.490 parámetros totales (aproximadamente 8.000 millones) y un tamaño de repositorio de 16,2 GB, coherente con pesos en BF16. La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés. Se trata de un modelo recién creado (13 de noviembre de 2026) sin descargas ni interacciones registradas, por lo que no existe validación comunitaria ni documentación técnica detallada más allá de la model card mínima generada por el flujo de trabajo de Unsloth.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de finetune multimodal de bajo coste realizado con Unsloth y TRL, y permite evaluar los requisitos de hardware y las limitaciones de un modelo de 8B parámetros en BF16 antes de plantear su uso en producción. No obstante, la ausencia de benchmarks, de datos de entrenamiento y de una model card sustantiva obliga a tratar cualquier afirmación de rendimiento con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4, variante E4B; detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Gemma 4 E4B. Por la pipeline declarada (image-text-to-text) y las etiquetas, se trata de un transformer multimodal que procesa entradas de imagen y texto y genera texto. El ajuste fino se realizo sobre el checkpoint taharmasmaliyev07/Gemma4-E4B-FACEBOOK-PDEFAULT-E2-BF16, que a su vez aparece como base_model del propio repositorio, lo que sugiere una cadena de entrenamiento por etapas (la etiqueta E2 en el nombre apunta a una segunda etapa) sobre una configuracion de prompt por defecto.

El entrenamiento se llevo a cabo con Unsloth y la libreria TRL de Hugging Face, segun la model card, que afirma que el modelo se entreno "2x faster" con Unsloth. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO, ni hiperparametros como learning rate, rango LoRA o numero de epochs. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Cualquier detalle sobre la arquitectura del Gemma 4 E4B original debe consultarse en la documentacion oficial de Google DeepMind, no incluida en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational".
- Procesamiento de entradas multimodal image-text-to-text: el modelo acepta imagenes junto con texto, de acuerdo con la pipeline declarada.
- Ajuste fino orientado a una tarea concreta relacionada con "FACEBOOK" y una configuracion de prompt por defecto (PDEFAULT), segun el nombre del repositorio; la naturaleza exacta de esa tarea no esta documentada.
- Compatibilidad con text-generation-inference y transformers, segun las etiquetas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision avanzada, audio: vision basica por la pipeline image-text-to-text; el resto no disponible.

## Casos de uso

- Prototipado de asistentes multimodales en ingles: el modelo puede recibir una imagen y una pregunta en texto y generar una respuesta conversacional, adecuado para demos internas de captioning o VQA simple, dado su tamano de 8B y su formato BF16.
- Experimentacion con finetuning multimodal: sirve como punto de partida para investigadores que quieran reproducir o continuar un ajuste fino con Unsloth y TRL sobre una base Gemma 4 E4B, gracias a que los pesos estan en safetensors y la licencia Apache 2.0 lo permite.
- Evaluacion comparativa de variantes de prompt: al estar entrenado con una configuracion PDEFAULT, permite estudiar como afecta el formato de prompt por defecto al comportamiento del modelo en tareas de imagen-texto.
- Generacion de descripciones de imagenes en pipelines de catalogacion: con 8B parametros y BF16, puede desplegarse en una GPU de 24 GB para generar metadatos textuales a partir de imagenes en lotes pequenos.
- Base para tareas de clasificacion o extraccion de informacion a partir de documentos escaneados, siempre que se valide previamente la calidad del finetune con un conjunto de prueba propio.
- Investigacion sobre sesgos y alineacion en modelos multimodales pequenos: su licencia permisiva y su tamano manejable facilitan auditorias reproducibles en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB, aunque no se confirma que existan versiones GGUF o AWQ publicadas para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) para BF16 en consumer; RTX 3090 (24 GB) tambien viable.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 12 GB, siempre que se genere una cuantizacion propia.
- Opciones de despliegue: transformers, text-generation-inference (segun etiqueta), vLLM (compatible con safetensors, aunque no verificado para esta arquitectura), llama.cpp/Ollama solo si se convierte a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-E4B-FACEBOOK-PDEFAULT-E2-BF16 (este) | ~8B | no disponible | imagen-texto | Apache 2.0 | Hugging Face, 0 descargas |
| Gemma 4 E4B base (referencia) | ~8B (segun variante) | no disponible en esta ficha | imagen-texto | segun Google DeepMind | Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128K | texto | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| Qwen2.5-VL 7B | ~7B | 128K (segun variante) | imagen-texto | Apache 2.0 (segun variante) | Hugging Face |

La comparativa se ofrece como referencia de categoria; los datos de contexto y rendimiento de los modelos alternativos deben verificarse en sus respectivas model cards. No hay benchmarks publicados de este finetune que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de datos de entrenamiento: no es posible verificar la calidad del finetune ni compararlo objetivamente con el modelo base.
- Model card minima: la documentacion se limita a la plantilla generada por Unsloth; no se describen el dataset, los hiperparametros ni la tarea objetivo.
- Riesgo de alucinacion: inherente a los modelos generativos de 8B; sin evaluacion especifica no puede acotarse.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente sobre datos relacionados con Facebook, pueden aparecer sesgos de dominio no evaluados.
- Limitacion idiomatica: solo se declara ingles, por lo que el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede tener terminos adicionales de Google DeepMind que deben revisarse antes de un despliegue comercial.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Modelo sin validacion comunitaria (0 descargas, 0 likes) y con cadena de base_model autorreferenciada, lo que dificulta rastrear su procedencia exacta.
- No se confirma soporte de tool calling ni de modos de razonamiento extendido.

## Enlaces

- Hugging Face: https://huggingface.co/taharmasmaliyev07/Gemma4-E4B-FACEBOOK-PDEFAULT-E2-BF16
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
