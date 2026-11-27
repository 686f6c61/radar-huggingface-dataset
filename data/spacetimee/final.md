# SpaceTimee/final

## Resumen

Suri Qwen 3.8 27B Uncensored es un ajuste fino (fine-tune) del modelo Qwen3.8-27B de Alibaba, publicado por el usuario SpaceTimee bajo el identificador SpaceTimee/final. Su proposito declarado es eliminar las capas de alineacion y rechazo del modelo base ("uncensor is all you need", segun la model card), de modo que responda a practicamente cualquier peticion sin advertencias, disclaimers ni contenido moralizante. Se distribuye como un modelo multimodal de tipo image-text-to-text, con 27.781.427.952 parametros reales en safetensors y un repositorio de 58,4 GB.

El modelo conserva la arquitectura del Qwen3.8-27B original, aunque la model card no detalla la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset de ajuste. Los unicos datos tecnicos publicados son los resultados de robustez frente a rechazo (ASR, attack success rate) en conjuntos como AdvBench y HarmBench, donde el modelo alcanza tasas de exito de ataque del 94,04% y 81,33% respectivamente, frente al 0,38% y 6,00% del modelo base.

Es relevante ahora porque ejemplifica una tendencia creciente de fine-tunes "abliterated" o "uncensored" sobre modelos frontier abiertos, que priorizan la ausencia de restricciones sobre la seguridad. Para desarrolladores e investigadores, resulta util como caso de estudio de las tecnicas de desalineacion y de los riesgos asociados, no como modelo recomendado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni AWQ) |
| Idiomas soportados | zh, en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Se sabe que deriva de Qwen/Qwen3.8-27B (y de la variante unsloth/Qwen3.8-27B como base secundaria), que el pipeline es image-text-to-text y que se carga con la libreria transformers. No se publican datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora componentes MoE, SSM o hibridos.

Tampoco se detalla el proceso de entrenamiento: no hay informacion sobre el numero de tokens utilizados en el ajuste, la composicion del dataset, el uso de RLHF/DPO ni la tecnica concreta de desalineacion aplicada (abliteration, fine-tuning supervisado sobre pares de rechazo, etc.). La model card unicamente menciona que el modelo "residualiza" preferencias de alineacion corregibles mediante prompt de sistema, lo que sugiere un ajuste parcial mas que una eliminacion completa de los comportamientos de rechazo.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text), presumiblemente heredado del modelo base.
- Modo de razonamiento (thinking mode) y modo sin razonamiento, segun los ejemplos de salida enlazados en la model card.
- Respuestas sin rechazo ni advertencias ante peticiones que el modelo base rechazaria, incluidas categorias de contenido danino segun los benchmarks publicados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el thinking mode sugiere capacidad de razonamiento extendido.
- Capacidades de codigo y matematicas: no documentadas de forma especifica.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo sirve como objeto de estudio para medir la eficacia de tecnicas de desalineacion, comparando sus tasas de ASR con las del modelo base en AdvBench y HarmBench.
- Red teaming controlado: util para generar respuestas adversarias en entornos de evaluacion cerrados y medir la robustez de filtros y clasificadores de contenido.
- Experimentacion con prompts de sistema: la model card indica que ciertas preferencias de alineacion residuales pueden corregirse mediante un system prompt especifico, lo que permite estudiar el control conductual via prompting.
- Analisis de contenido multimodal en chino e ingles: al heredar el pipeline image-text-to-text, puede emplearse en tareas de descripcion y extraccion de informacion de imagenes en esos dos idiomas.
- Generacion de texto creativo sin restricciones estilisticas: para experimentos de escritura donde se busca evitar disclaimers y tono moralizante, siempre en contextos legales y eticos.
- Evaluacion comparativa de fine-tunes: sirve como referencia en estudios que comparan distintos metodos de "abliteration" (por ejemplo, frente a Qwen3.8-27B-Heretic-Abliterated-Uncensored).

## Benchmarks y rendimiento

Los unicos datos publicados son tasas de exito de ataque (ASR) frente a rechazo, no benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Modelo | AdvBench ASR (520) | HarmBench ASR (300) | Cybercrime & Intrusion (67) | Chemical & Biological (56) | Illegal Activities (65) | Misinformation & Disinformation (65) | Harassment & Bullying (25) | Harmful Content (22) |
|---|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 0,38% | 6,00% | 8,96% | 1,79% | 1,54% | 15,38% | 0,00% | 0,00% |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | 94,04% | 81,33% | 83,58% | 92,86% | 72,31% | 86,15% | 64,00% | 77,27% |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored | 88,65% | 76,67% | 68,66% | 85,71% | 66,15% | 90,77% | 68,00% | 77,27% |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55-56 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB, viable en una A100 40 GB o H100.
- VRAM estimada en cuantizacion de 4 bits: en torno a 16-18 GB, potencialmente viable en una RTX 4090 (24 GB), aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; para cuantizaciones agresivas, RTX 4090, RTX 5090 o A6000.
- Despliegue: transformers (libreria declarada), text-generation-inference (tag), y previsiblemente vLLM; llama.cpp y Ollama requeririan conversion propia a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpaceTimee/final (Suri Qwen 3.8 27B) | 27,78 B | no disponible | Uncensored, multimodal | no disponible | Hugging Face, safetensors |
| Qwen/Qwen3.8-27B | ~27 B | no disponible | Modelo base alineado | no disponible | Hugging Face |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored | ~27 B | no disponible | Uncensored (abliteration) | no disponible | Hugging Face |

Suri destaca frente a la variante Heretic en AdvBench (94,04% vs 88,65%), HarmBench (81,33% vs 76,67%) y en las categorias de ciberdelito, quimica/biologia y actividades ilegales; Heretic obtiene mejores resultados en desinformacion y acoso. No hay datos de capacidad general que permitan comparar la calidad del modelo fuera del eje de rechazo.

## Limitaciones y advertencias

- El modelo esta disenado explicitamente para eliminar rechazos de seguridad; no debe desplegarse en aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo elevado de generar contenido danino, ilegal o peligroso, como evidencian las altas tasas de ASR en AdvBench (94,04%) y HarmBench (81,33%).
- La model card reconoce preferencias de alineacion residuales que pueden reactivarse o corregirse mediante system prompts; el comportamiento no es completamente determinista.
- Riesgo de alucinacion no evaluado en la informacion disponible.
- Idiomas limitados a chino e ingles segun la model card; el rendimiento en castellano no esta documentado.
- Licencia no especificada: no hay garantia de uso comercial y conviene verificar la licencia del modelo base Qwen3.8-27B antes de cualquier uso en produccion.
- Longitud de contexto no documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- No se distribuyen cuantizaciones oficiales; el despliegue eficiente requiere conversion propia.
- Repositorio con solo 213 descargas y 17 likes: ecosistema de validacion muy limitado, sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/SpaceTimee/final
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Base secundaria: https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo comparable: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Ejemplo de salida en modo razonamiento: images/thinking-mode-output.pdf (referenciado en la model card)
- Ejemplo de salida sin razonamiento: images/non-thinking-mode-output.pdf (referenciado en la model card)
- Comunidad del autor: https://linux.do/u/spacetime
