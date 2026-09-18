# yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-20p-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un artefacto de investigación: una fusión de cinco checkpoints intermedios de un mismo run de preentrenamiento de 1.279.854.592 parámetros (aproximadamente 1,28 mil millones). La fusión se ha generado con mergekit mediante el método Linear, es decir, una media ponderada de los pesos ("model soup") de los pasos 60000, 62500, 65000, 67500 y 69369 de un entrenamiento cuya mezcla de datos aparece identificada en el nombre como "falcon-and-cc-qc-20p".

El autor es el usuario yuhengtu-bytedance y el modelo pertenece a una familia de artefactos similares ("DataDecide-..."), en la que se repite la misma receta de fusión sobre distintas mezclas de datos de preentrenamiento. Las rutas de origen que aparecen en la model card (/opt/tiger/Pan_Safety_Better_Measurement/merge_scaling_ckpts_cache/...) sugieren que estos merges se producen como parte de un experimento automatizado de medición sobre seguridad y escalado, no como un modelo destinado a uso final.

Su relevancia es, por tanto, metodológica: permite estudiar si la interpolación de checkpoints tardíos de un mismo run mejora o degrada el rendimiento frente a tomar simplemente el checkpoint final, y sirve como baseline reproducible de ~1B parámetros para experimentos de mezclas de datos. El repositorio no publica model card descriptiva, licencia, idiomas ni resultados de evaluación, y acumula 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (etiqueta `llama` y `text-generation` en transformers); la configuración concreta de capas, cabezas y vocabulario no se publica en la información disponible |
| Parametros totales | 1.279.854.592 (dato real del repo, safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales. Los pesos se distribuyen en safetensors con dtype de salida bfloat16 y son convertibles a fp16, int8 e int4 (GGUF) con herramientas externas |
| Idiomas soportados | no disponibles. La mezcla de entrenamiento se denomina "falcon-and-cc-qc-20p" (previsiblemente datos tipo Falcon/RefinedWeb y Common Crawl), pero el autor no declara cobertura idiomática |
| Licencia | no disponible |
| Formato de pesos | safetensors; `out_dtype: bfloat16` en la configuración de merge; tamaño del repo 2,6 GB |
| Metodo de merge | Linear (arXiv:2203.05482) con `normalize: true` |
| Checkpoints combinados | step60000 (peso 1), step62500 (peso 2), step65000 (peso 3), step67500 (peso 4), step69369 (peso 5, base) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del run de preentrenamiento original, etiquetada como `llama` en la librería transformers, con aproximadamente 1,28 mil millones de parámetros en precisión completa. No se dispone de la configuración publicada (número de capas, dimensión oculta, cabezas de atención, tamaño de vocabulario ni longitud de contexto entrenada), por lo que cualquier afirmación sobre estos extremos sería especulativa. El pipeline declarado es `text-generation`.

Lo específico de este artefacto es el postprocesado. mergekit combina cinco checkpoints del mismo entrenamiento con pesos 1, 2, 3, 4 y 5, asignando el peso mayor al checkpoint más avanzado (paso 69369), que además actúa como base. Con `normalize: true`, cada peso se divide por la suma total (1+2+3+4+5 = 15), de modo que cada tensor final es una combinación convexa con coeficientes 1/15, 2/15, 3/15, 4/15 y 5/15 sobre los cinco estados del modelo. El dtype de cálculo del merge es float32 y la salida se guarda en bfloat16, lo que fija la precisión efectiva de los pesos publicados.

No consta ningún tipo de ajuste posterior: no hay indicios de RLHF, DPO, SFT ni instrucciones. Se trata, por tanto, de un modelo base (raw base model) sin alineación, útil como material de estudio de dinámicas de entrenamiento y no como asistente listo para conversar.

## Capacidades

- Generación de texto autoregresiva sin ajuste de instrucciones: el modelo continúa texto, pero no sigue órdenes ni mantiene formato conversacional de forma fiable.
- Modelado de lenguaje base: útil para experimentos de perplejidad, evaluación de mezclas de datos y estudios de escalado a ~1B de parámetros.
- Ninguna capacidad declarada de tool calling, function calling ni uso como agente.
- Sin soporte declarado de razonamiento multi-paso, modo "thinking", visión, audio ni multimodalidad.
- Capacidades multilingües: no declaradas; dependen por completo de la composición de la mezcla "falcon-and-cc-qc-20p", que no se detalla.
- Capacidad metodológica relevante: sirve como ejemplo reproducible de interpolación de checkpoints tardíos, con la configuración YAML publicada íntegramente.
- Compatibilidad de despliegue: al estar en safetensors con arquitectura Llama, es servible por transformers, TGI y vLLM, y convertible a GGUF para llama.cpp u Ollama.

## Casos de uso

- Estudio de "model souping" en preentrenamiento: comparar la perplejidad de esta media ponderada frente al checkpoint individual del paso 69369 para determinar si promediar estados tardíos aporta ganancia; el diseño del merge (pesos crecientes hacia el paso final) está pensado exactamente para ese tipo de análisis.
- Baseline de ~1B parámetros en experimentos de mezclas de datos: se puede emparejar con su hermano "DataDecide-dclm-baseline-qc-20p-1B-..." para aislar el efecto de la mezcla de datos manteniendo idéntica la receta de fusión.
- Reproducción de experimentos de scaling: el repositorio expone la configuración YAML completa, de modo que un equipo puede reejecutar el merge sobre sus propios checkpoints y validar la metodología sin ambigüedad.
- Fine-tuning de bajo coste como prueba de concepto: al ser un modelo base de 1,28B, cabe en una GPU de consumo para SFT con LoRA o QLoRA, lo que permite validar pipelines de ajuste antes de escalar a modelos mayores.
- Evaluación de seguridad y sesgos en modelos prealineados: el nombre del directorio de origen ("Pan_Safety_Better_Measurement") apunta a un uso como sujeto de medición; un modelo base sin RLHF es el punto de partida adecuado para medir los sesgos heredados del corpus.
- Docencia y divulgación sobre entrenamiento de LLM: su tamaño reducido y su procedencia por pasos permiten ilustrar en un portátil qué es un checkpoint intermedio y cómo se interpola con otro.
- Investigación sobre sensibilidad al peso relativo de checkpoints: modificando los coeficientes (1,2,3,4,5) se puede medir cómo cambia el comportamiento del modelo sin reentrenar, algo inviable a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente describe el procedimiento de fusión; no incluye MMLU, HumanEval, GSM8K, ARC, HellaSwag ni métricas de perplejidad. Tampoco se han encontrado evaluaciones en los resultados de búsqueda web, que no contienen información técnica sobre el modelo.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (1.279.854.592); no son mediciones publicadas por el autor.

- Pesos en bfloat16/fp16: aproximadamente 2,6 GB. Con caché KV y activaciones para contextos moderados, el consumo total esperado se sitúa en torno a 4-6 GB de VRAM.
- Pesos en fp32: aproximadamente 5,1 GB, antes de activaciones.
- Cuantización int8: aproximadamente 1,3 GB de pesos.
- Cuantización int4 (por ejemplo GGUF Q4_K_M): aproximadamente 0,8-1,0 GB.
- GPU de consumo: cabe sin problema en tarjetas de 8 GB o más (RTX 3060 Ti, 3070, 4060, 4060 Ti, 4070). Incluso en 6 GB es viable en 4 bits. En CPU, la inferencia en 4 bits es posible con llama.cpp si se convierte el modelo.
- GPU de centro de datos: no necesita A100 ni H100 para inferencia; una L4, T4 o A10 es más que suficiente incluso en fp16.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM en bf16, y llama.cpp/Ollama tras convertir los safetensors a GGUF (no se publica ningún GGUF en el repositorio).
- Ajuste fino: SFT con LoRA o QLoRA en una única GPU de consumo de 16-24 GB es factible en 4 u 8 bits.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

La comparación de rendimiento no es posible porque este artefacto no publica métricas. Se comparan únicamente dimensiones estructurales y de disponibilidad.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| Este modelo (merge DataDecide falcon-and-cc-qc-20p) | 1,28B | no disponible | no disponible | 0 descargas; safetensors bf16; sin benchmarks ni model card descriptiva |
| DataDecide-dclm-baseline-qc-20p-1B-60000_62500_65000_67500_69369_weightedavg_merge (hermano del mismo autor) | ~1,28B (misma receta de fusión) | no disponible | no disponible | Mismo esquema de merge sobre la mezcla DCLM baseline; sirve de control frente a este modelo |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 tokens | Apache-2.0 | Ampliamente usado, con ajuste conversacional y benchmarks publicados |
| Llama-3.2-1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | Base e instruct, con evaluación publicada por el fabricante |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache-2.0 (la mayoría de las variantes de la familia) | Modelo base e instruct, con soporte multilingüe declarado |

Frente a estas alternativas, el modelo aquí descrito carece de licencia explícita, de idiomas declarados, de longitud de contexto documentada y de cualquier evaluación, lo que limita su uso como componente de producción.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución derivada; trátese como material de investigación sin derechos garantizados.
- Modelo base sin alineación: no ha pasado por SFT, RLHF ni DPO, por lo que puede generar contenido sesgado, tóxico, factualmente incorrecto o inapropiado sin filtros.
- Riesgo elevado de alucinación y de formato inconsistente: al no estar ajustado a instrucciones, no respeta plantillas de chat ni estructuras de salida.
- Sin datos de idiomas ni de composición del dataset: se desconoce la cobertura idiomática real y el equilibrio de dominios, lo que impide anticipar su comportamiento fuera del inglés o de los dominios de Common Crawl.
- Longitud de contexto desconocida: no se publica la ventana de entrenamiento, por lo que usar contextos largos es una apuesta sin garantías.
- Sobrecarga de memoria durante el merge: la configuración usa `dtype: float32` y `out_dtype: bfloat16`; reproducir el merge requiere memoria suficiente para materializar los checkpoints de origen en float32.
- Naturaleza experimental y sin mantenimiento: 0 descargas, 0 likes y una model card generada automáticamente por mergekit; no hay indicios de soporte, versionado ni corrección de errores.
- Fechas del repositorio anómalas (creación en septiembre de 2026 según los metadatos), lo que refuerza la idea de que se trata de un artefacto automatizado dentro de un pipeline de investigación y no de una publicación curada.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información sobre el modelo (remiten a páginas de Microsoft ajenas al proyecto), por lo que no ha sido posible triangular ningún dato adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-20p-1B-60000_62500_65000_67500_69369_weightedavg_merge
- Modelo hermano de la misma familia y autor: https://huggingface.co/yuhengtu-bytedance/DataDecide-dclm-baseline-qc-20p-1B-60000_62500_65000_67500_69369_weightedavg_merge
- mergekit (herramienta de fusión utilizada): https://github.com/cg123/mergekit
- Paper del método Linear de interpolación de pesos: https://arxiv.org/abs/2203.05482
- Los resultados de la búsqueda web proporcionados no contenían enlaces técnicos relevantes sobre este modelo.
