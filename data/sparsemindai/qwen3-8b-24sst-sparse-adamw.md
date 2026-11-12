# SparseMindAI/qwen3-8b-24sst-sparse-adamw

## Resumen

Qwen3-8B-24SST-Sparse-AdamW es una version con poda estructurada del modelo denso Qwen3-8B de Alibaba, publicada por SparseMindAI. El modelo aplica un patron de esparsidad semiestructurada 2:4 (como maximo dos pesos no nulos en cada grupo de cuatro pesos consecutivos) sobre la arquitectura Qwen3ForCausalLM, conservando aproximadamente la mitad de los pesos originales. El objetivo es reducir el coste computacional y de almacenamiento en inferencia sin degradar en exceso la calidad del modelo denso de partida.

El modelo se ha reentrenado con la tecnica de entrenamiento dinamico con esparsidad 24SST (CHTsnm) y optimizador AdamW sobre el dataset OpenWebText, en lugar de aplicar una poda one-shot. Esto permite que los pesos supervivientes se adapten durante el reentrenamiento, preservando una fraccion mayor de la calidad del modelo original. El resultado es un checkpoint de aproximadamente 8.190 millones de parametros (el conteo refleja los pesos almacenados, no los pesos densos equivalentes) con pesos en formato safetensors y licencia Apache 2.0.

La relevancia de esta ficha radica en que se trata de un experimento de investigacion sobre esparsidad 2:4 aplicada a un LLM moderno de 8B, un area con interes creciente por su potencial de aceleracion en hardware con tensor cores dispersos (NVIDIA Ampere y posteriores). No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, no dispone de datos de benchmarks publicados y su model card es muy escueta, por lo que debe tratarse como un artefacto de investigacion y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, 36 capas, hidden size 4096, 32 cabezas de atencion, 8 KV heads) |
| Parametros totales | 8.190.735.360 (pesos almacenados en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, valor no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (no se documentan en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only con 36 capas, dimension oculta de 4096, 32 cabezas de atencion y 8 cabezas KV (GQA), tal como se detalla en la model card del autor. Sobre esta arquitectura se impone un patron de esparsidad semiestructurada 2:4, que fuerza que como maximo dos de cada cuatro pesos consecutivos sean no nulos. Este patron es el que el hardware con tensor cores dispersos (NVIDIA Ampere y posteriores) puede explotar para acelerar las multiplicaciones matriciales, saltando los pesos zero.

El entrenamiento combina dos elementos: la tecnica de entrenamiento dinamico con esparsidad 24SST (referida en la model card como CHTsnm dynamic sparse training) y el optimizador AdamW. El dataset utilizado es OpenWebText (OWT), un corpus de texto web en ingles. No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO posteriores. La model card afirma que el reentrenamiento permite mantener "mucha mas" calidad que una poda one-shot, pero no aporta cifras que respalden esa afirmacion.

## Capacidades

- Generacion de texto autoregresiva en ingles (el dataset de entrenamiento es OpenWebText, en ingles).
- Razonamiento y conocimiento general heredados del modelo base Qwen3-8B, sujetos a la degradacion introducida por la poda 2:4.
- Codigo y matematicas: capacidades potencialmente presentes por herencia del base model, pero no documentadas ni verificadas para este checkpoint.
- Tool calling / function calling: no documentado en la model card; no se puede confirmar soporte.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como "no disponible".
- Capacidades especiales (thinking mode, vision, audio): no documentadas.
- Formato conversacional: la model card muestra el uso de `apply_chat_template`, lo que indica soporte de plantilla de chat compatible con transformers.

## Casos de uso

- Investigacion sobre esparsidad 2:4 en LLMs: el modelo sirve como referencia para estudiar como la poda semiestructurada reentrenada afecta la calidad de un transformer de 8B en tareas de generacion de texto en ingles.
- Evaluacion de aceleracion hardware: permite medir en la practica la ganancia de throughput y latencia en GPUs con tensor cores dispersos (A100, H100, RTX 40xx) frente al modelo denso Qwen3-8B.
- Comparacion de tecnicas de poda: util para contrastar la poda dinamica 24SST con optimizador AdamW frente a poda one-shot u otras estrategias de compresion sobre el mismo base model.
- Experimentos de eficiencia de almacenamiento: dado que el autor afirma una reduccion de aproximadamente 1.8x en almacenamiento de pesos, el checkpoint es util para estudiar el impacto de formatos comprimidos en pipelines de despliegue.
- Baseline en estudios de degradacion: sirve como punto de partida para cuantificar la perdida de calidad respecto al Qwen3-8B denso en tareas de generacion de texto en ingles.
- Prototipado de inferencia con transformers: la model card proporciona un ejemplo funcional de carga y generacion con `AutoModelForCausalLM` y `apply_chat_template`, adecuado para entornos de investigacion con la libreria transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un checkpoint de aproximadamente 8.19 mil millones de parametros en bfloat16 ocupa del orden de 16.4 GB en disco (tamano del repo), lo que sugiere requisitos de VRAM en ese orden para carga en bf16 sin cuantizacion.
- GPU recomendadas: no disponible. La model card menciona que la esparsidad 2:4 se beneficia de hardware con tensor cores dispersos (NVIDIA Ampere y posteriores), lo que apunta a A100, H100 o RTX 40xx como candidatas, pero no se confirman requisitos ni resultados.
- Compatibilidad con GPU de consumo: no disponible; no se documenta si cabe en GPUs consumer ni en que configuraciones.
- Opciones de despliegue: transformers (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no se mencionan como soportados, aunque el tag `text-generation-inference` figura en los metadatos del repo.
- Latencia y throughput estimados: no disponible; el autor afirma aproximadamente 2x de aceleracion en matmuls en hardware con tensor cores dispersos, pero no aporta mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SparseMindAI/qwen3-8b-24sst-sparse-adamw | 8.190.735.360 (almacenados) | no disponible | 2:4 semiestructurada | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-8B (base denso) | no disponible en esta ficha | no disponible | densa | Apache 2.0 | Hugging Face (modelo de referencia) |
| Alternativas de poda 2:4 sobre LLMs de 8B | no disponible | no disponible | 2:4 | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre este checkpoint y el modelo denso Qwen3-8B ni con otras alternativas de poda, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo se entrena sobre OpenWebText, un corpus de texto web en ingles, con los sesgos tipicos de ese tipo de datos, pero no se detalla su mitigacion.
- Riesgo de alucinacion: no evaluado ni documentado; la poda 2:4 puede incrementar la degradacion en tareas de razonamiento, pero no hay mediciones.
- Limitaciones de contexto o idioma: los idiomas soportados figuran como "no disponible"; el entrenamiento se realiza sobre un corpus en ingles, lo que sugiere un rendimiento limitado en otros idiomas.
- Restricciones de licencia: licencia Apache 2.0, permisiva para uso comercial, sujeta a las condiciones de la licencia del modelo base Qwen3-8B.
- Caveats para produccion: el modelo tiene cero descargas y cero likes, no publica benchmarks, y su model card es muy escueta; no debe considerarse validado para produccion sin evaluacion propia.
- Degradacion por poda: la esparsidad 2:4 elimina la mitad de los pesos; el autor afirma preservar calidad, pero no aporta cifras que lo demuestren.
- Compatibilidad de despliegue: no se documenta soporte en frameworks de inferencia de alto rendimiento (vLLM, llama.cpp, TGI) mas alla del tag `text-generation-inference` en metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SparseMindAI/qwen3-8b-24sst-sparse-adamw
- Modelo base denso: https://huggingface.co/Qwen/Qwen3-8B
