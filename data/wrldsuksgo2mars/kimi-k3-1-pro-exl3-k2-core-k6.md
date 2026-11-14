# wrldsuksgo2mars/Kimi-K3.1-Pro-EXL3-K2-Core-K6

## Resumen

Kimi-K3.1-Pro-EXL3-K2-Core-K6 es una cuantización de un modelo de la familia Kimi K3.1 Pro, desarrollado originalmente por Moonshot AI y cuantizado por el usuario wrldsuksgo2mars. Se trata de una conversión interleaved de tipo EXL3 que reduce el peso del modelo base aplicando 2 bits (K2) a las 247.296 proyecciones de expertos enrutados y 6 bits (K6) a 926 proyecciones seleccionadas de atención, expertos compartidos, MoE latente y cabeza de lenguaje. El resultado es un checkpoint de 365.804.814.080 parámetros (unos 365,8 mil millones) con un tamaño de repositorio de 732 GB.

El modelo base es un transformer de tipo MoE (Mixture of Experts) con componentes recurrentes KDA, atención DSA y un proyector multimodal, según se deduce de la lista de tensores preservados en la model card. La cuantización busca hacer viable el despliegue de un modelo de esta escala en hardware con memoria limitada, manteniendo los tensores críticos (embeddings, routers, normas, componentes recurrentes, visión y proyector multimodal) en sus bytes originales.

Es relevante ahora porque demuestra una estrategia de cuantización selectiva por módulo (bitrates diferenciados) sobre un modelo de más de 365 mil millones de parámetros, publicada con configuración de cuantización explícita y diagnóstico por proyección. No obstante, el autor advierte que no se han realizado pruebas de generación completa, cualificación KL/top-1 ni benchmarks de serving en esta ejecución de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con componentes recurrentes KDA, atención DSA y proyector multimodal (según tensores preservados en la model card) |
| Parámetros totales | 365.804.814.080 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 con bitrates mixtos: K2 (2 bits) en 247.296 proyecciones de expertos enrutados; K6 (6 bits) en 926 proyecciones de atención, expertos compartidos, MoE latente y cabeza de lenguaje; resto de tensores en bytes originales |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other, license_name: kimi-k3.1-pro) |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con innovaciones arquitectónicas que se reflejan en los tensores preservados: componentes recurrentes KDA, atención con DSA (indexer DSA), mezcladores de residuo de atención, proyector de visión y multimodal, y una cabeza de lenguaje. La model card menciona además que los pesos oficiales de expertos en MXFP4 se dequantizaron exactamente a BF16 antes de la cuantización, y que el índice DSA kv_a tiene un ancho lógico de 576 almacenado a ancho 640.

La cuantización EXL3 se realizó con el codebook MCG estándar (multiplicador 0xCBAC1FED, semilla 787, regularización sigma 0.025 y escalas de salida automáticas). Las proyecciones core se cuantizan antes que los expertos enrutados correspondientes, y cada sucesor se calibra sobre pesos EXL3 serializados y reconstruidos previamente. La calibración emplea el panel agentic fijado (dataset wrldsuksgo2mars/agentic-quant-panel-v1) con el tokenizer y la plantilla de chat del propio checkpoint, con thinking habilitado. Las matrices Hessianas densas contienen solo observaciones reales, y se aplica el suelo de expertos fríos de K3 registrado a los expertos enrutados. La cuantización se ejecutó en una RTX PRO 6000 Blackwell Max-Q con una frontier rodante respaldada en disco.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si hubo RLHF/DPO, ya que la model card solo documenta el proceso de cuantización.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de gran escala; la cuantización preserva la cabeza de lenguaje en K6 y los tensores estructurales en bytes originales.
- Modo thinking: la calibración se realizó con thinking habilitado, lo que sugiere que el modelo base soporta razonamiento extendido.
- Capacidades multimodales: se preservan el proyector de visión y el proyector multimodal en sus bytes originales, lo que indica soporte de entrada de imágenes.
- Tool calling y function calling: no confirmado explícitamente en la información disponible; el dataset de calibración es de tipo agentic, lo que sugiere orientación a agentes.
- Razonamiento multi-paso y agentes: el panel de calibración agentic apunta a este tipo de uso, aunque no se documentan capacidades concretas.
- Capacidades multilingües: no disponible.
- Código y matemáticas: no disponible de forma específica.

## Casos de uso

- Despliegue de investigación en hardware de gama alta: el checkpoint de 732 GB puede cargarse en un servidor con suficiente VRAM o memoria unificada para experimentar con un modelo de 365,8 mil millones de parámetros cuantizado, útil para estudiar el impacto de la cuantización selectiva K2/K6 en la calidad de generación.
- Evaluación de estrategias de cuantización: investigadores pueden comparar este checkpoint con el modelo base BF16 o MXFP4 para medir la degradación introducida por K2 en expertos enrutados y K6 en proyecciones core, usando el diagnóstico por proyección incluido.
- Prototipado de pipelines multimodales: al preservar el proyector de visión y el multimodal en bytes originales, puede emplearse en experimentos que requieran entrada de imagen junto con texto, siempre que el hardware lo permita.
- Estudio de arquitecturas MoE con componentes recurrentes: los tensores KDA y DSA preservados permiten analizar el comportamiento de modelos híbridos recurrente-atención en tareas de razonamiento.
- Calibración y ajuste fino ligero: el checkpoint puede servir como base para LoRA o adaptadores sobre las capas preservadas, aunque el tamaño del repositorio (732 GB) limita su uso a entornos con almacenamiento y memoria abundantes.
- Referencia para reproducibilidad de cuantizaciones EXL3: la model card documenta parámetros exactos (multiplicador, semilla, sigma) y la configuración en quantize_config.json, lo que facilita replicar o auditar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la generación completa, la cualificación KL/top-1 y los benchmarks de serving no forman parte de esta ejecución de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 732 GB en safetensors; la carga completa requiere al menos esa cantidad de memoria (VRAM o memoria unificada) más overhead de ejecución.
- GPU recomendadas: el autor realizó la cuantización en una RTX PRO 6000 Blackwell Max-Q, pero no se documentan requisitos de inferencia. Para un modelo de 365,8 mil millones de parámetros con pesos mixtos de 2 y 6 bits, se necesitarían múltiples GPU de数据中心 (A100 80 GB, H100 80 GB) o soluciones con memoria unificada de gran capacidad.
- ¿Cabe en consumer GPU? No. El tamaño del repositorio (732 GB) excede con creces la VRAM de cualquier GPU de consumo (RTX 4090 con 24 GB, por ejemplo).
- Opciones de despliegue: no disponible. El modelo usa custom_code y safetensors; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-EXL3-K2-Core-K6 (este) | 365,8 B | no disponible | EXL3 K2/K6 mixto | kimi-k3.1-pro | Hugging Face, 35 descargas |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible en la información | no disponible | MXFP4 (expertos) | kimi-k3.1-pro | Hugging Face (referenciado) |
| Otras cuantizaciones de Kimi K3.1 Pro | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización K2 (2 bits) en 247.296 proyecciones de expertos enrutados puede introducir degradación de calidad no medida: el autor no realizó cualificación KL/top-1 ni pruebas de generación completa.
- No se han publicado benchmarks de serving ni de latencia, por lo que el rendimiento en producción es desconocido.
- El tamaño del repositorio (732 GB) y los 365,8 mil millones de parámetros limitan el despliegue a infraestructura de gama alta; no cabe en GPU de consumo.
- La licencia es "other" con nombre "kimi-k3.1-pro", heredada del modelo base; es necesario revisar el enlace de licencia para conocer las restricciones de uso comercial.
- El modelo base puede presentar sesgos y riesgo de alucinación propios de los LLM de gran escala; no se documentan evaluaciones de sesgo en la información disponible.
- Los idiomas soportados no están documentados; no se puede garantizar un rendimiento multilingüe concreto.
- El uso de custom_code implica que la carga requiere confiar en el código del repositorio; conviene auditar antes de desplegar.
- El checkpoint preserva tensores en bytes originales (embeddings, routers, normas, visión), pero la interacción entre pesos cuantizados y preservados no ha sido validada con generación completa según la model card.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/Kimi-K3.1-Pro-EXL3-K2-Core-K6
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/6d0a0202956796543364d666ab19c6ad1a494ee1/LICENSE
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
