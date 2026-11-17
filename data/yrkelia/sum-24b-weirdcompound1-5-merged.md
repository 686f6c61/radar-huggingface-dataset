# Yrkelia/Sum-24B-WeirdCompound1.5-Merged

## Resumen

Sum-24B-WeirdCompound1.5-Merged es un ajuste fino (fine-tuning) publicado por el usuario Yrkelia sobre el modelo base FlareRebellion/WeirdCompound-v1.5-24b, un modelo de la familia Mistral orientado a generacion de texto y conversacion. El resultado se distribuye en formato transformers/safetensors y esta etiquetado como compatible con text-generation-inference y con el ecosistema Unsloth, la herramienta con la que, segun la model card, se realizo el entrenamiento con una aceleracion declarada de 2x respecto al flujo estandar de Hugging Face TRL.

El modelo se presenta como un fine-tune de tipo "merge" (fusion de pesos) sobre una base de 24B, lo que lo situa en la categoria de modelos medianos-grandes para despliegue en servidor. La informacion publicada es muy escasa: no se detallan datos de entrenamiento, hiperparametros, composicion del dataset ni resultados de evaluacion. El repositorio ocupa 4,9 GB, un tamano coherente con pesos cuantizados o parciales mas que con un checkpoint completo en bf16 de 24B parametros (que rondaria los 48 GB), lo que conviene tener en cuenta al planificar el despliegue.

Su relevancia actual es limitada y de nicho: se trata de un experimento de la comunidad sin descargas ni interacciones en el momento de la consulta, por lo que debe evaluarse con cautela antes de cualquier uso en produccion. La licencia Apache 2.0 facilita su reutilizacion comercial, pero la ausencia de documentacion tecnica y de benchmarks obliga a validar su comportamiento empiricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, segun tags del repositorio) |
| Parametros totales | 24B (segun el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mistral, un transformer decoder-only con atencion causal, segun indican los tags del repositorio. Se trata de un fine-tune sobre FlareRebellion/WeirdCompound-v1.5-24b, que a su vez es un modelo de la comunidad derivado del linaje Mistral. No se especifica si el modelo base emplea sliding window attention, grouped-query attention u otras variantes propias de Mistral, ni se documenta la longitud de contexto nativa.

El entrenamiento se realizo, segun la model card, con Unsloth y la libreria TRL de Hugging Face, con una mejora declarada de velocidad de 2x. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni los hiperparametros (learning rate, rango LoRA, epochs). Tampoco se documenta el proceso de fusion (merge) de pesos que sugiere el nombre del modelo. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline declarado (text-generation) y el tag conversational.
- Compatibilidad con text-generation-inference (TGI) para despliegue en servidor.
- Compatibilidad con el ecosistema Unsloth y transformers para carga y ajuste posterior.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun el campo language; no se documentan otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion e investigacion sobre fusion de pesos: el modelo puede servir para estudiar el efecto de merges sobre una base de 24B, comparando su comportamiento con el modelo base original en tareas controladas.
- Generacion de texto conversacional en ingles para prototipos: adecuado para validar pipelines de TGI o transformers antes de invertir en modelos con documentacion completa.
- Base para fine-tuning adicional con Unsloth: al estar etiquetado como compatible con Unsloth, puede reutilizarse como punto de partida para ajustes LoRA en dominios concretos.
- Evaluacion comparativa de modelos de la comunidad: util como caso de estudio en articulos o benchmarks internos sobre la calidad de merges no documentados.
- Despliegue en entornos de prueba con licencia permisiva: la licencia Apache 2.0 permite integrarlo en prototipos comerciales sin restricciones de uso, siempre que se valide su calidad.
- Generacion de contenido en ingles en aplicaciones de baja criticidad: borradores, resumenes o respuestas conversacionales donde el riesgo de error sea tolerable y se disponga de revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 24B, en bf16 se requeririan aproximadamente 48 GB de VRAM; en cuantizacion de 8 bits, unos 24-26 GB; en 4 bits, unos 13-15 GB. Estas cifras son estimaciones genericas para el tamano, no datos publicados del modelo.
- GPU recomendadas: A100 80GB o H100 para bf16 sin cuantizar; A100 40GB, L40S o RTX 6000 Ada para cuantizacion 8 bits; RTX 4090 (24 GB) para cuantizacion 4 bits.
- Cabe en GPU de consumo: probablemente en RTX 4090 con cuantizacion de 4 bits, aunque no se han publicado pesos GGUF ni cuantizaciones verificadas.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (compatible con safetensors de Mistral), llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sum-24B-WeirdCompound1.5-Merged | 24B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune de comunidad sin benchmarks |
| Mistral Small (24B) | 24B | 32k (segun version) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con evaluaciones publicadas |
| FlareRebellion/WeirdCompound-v1.5-24b | 24B | no disponible | no disponible | Hugging Face | Modelo base del que deriva este fine-tune |
| Gemma 2 27B | 27B | 8k | Gemma license | Hugging Face | Alternativa de tamano similar con benchmarks publicados |

La comparacion con Mistral Small y Gemma 2 27B es orientativa por tamano y categoria; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion sobre datos de entrenamiento: imposible estimar su calidad real sin evaluacion propia.
- Riesgo elevado de alucinacion y de comportamiento impredecible al ser un merge de comunidad sin validacion publicada.
- Soporte unicamente de ingles segun la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no debe asumirse una ventana larga sin verificacion empirica.
- El tamano del repositorio (4,9 GB) es inferior al esperado para pesos completos de 24B en bf16, lo que sugiere cuantizacion o pesos parciales; conviene verificar los archivos antes de desplegar.
- Sin descargas ni interacciones en el momento de la consulta: no hay senales de uso comunitario ni de mantenimiento.
- Licencia Apache 2.0 permite uso comercial, pero la falta de trazabilidad del dataset de fine-tuning impide descartar problemas de procedencia de datos.
- No recomendado para produccion sin una evaluacion exhaustiva previa en el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yrkelia/Sum-24B-WeirdCompound1.5-Merged
- Modelo base: https://huggingface.co/FlareRebellion/WeirdCompound-v1.5-24b
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Hugging Face TRL: https://github.com/huggingface/trl
