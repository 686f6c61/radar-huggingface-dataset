# yone2426/Llama-3.1-8B-DRIP-DPO

## Resumen

Llama-3.1-8B-DRIP-DPO es un checkpoint de investigación publicado por el usuario yone2426 en HuggingFace. Se trata de un modelo derivado de Llama 3.1 8B al que se le ha aplicado una receta de optimización de preferencias adversarial denominada DRIP, partiendo de un checkpoint previo de SFT identificado en la propia model card como "Clean SFT". El repositorio pesa 18,2 GB y contiene 8.047.042.561 parámetros en formato safetensors, lo que confirma que se trata de un modelo denso de escala 8B sin poda ni destilación aparente.

El interés de esta ficha no está en su rendimiento —no hay benchmarks publicados ni descargas registradas—, sino en su carácter de artefacto experimental: el propio autor advierte de que es un "port" de una receta pública, no un modelo publicado por los autores originales del método ni una reproducción verificada de las puntuaciones del paper. Incluye código propio (tag `custom_code`, con un fichero `modeling_drip.py`), lo que obliga a cargarlo con `trust_remote_code=True` y a revisar previamente el código incluido.

Por tanto, es relevante ahora como material de estudio para quienes investigan en optimización de preferencias (DPO y variantes adversariales), como punto de partida para fine-tuning posterior y como ejemplo de publicación reproducible de recetas, pero no como modelo listo para producción. Los resultados de la búsqueda web realizada no aportan información sobre este modelo: devuelven únicamente páginas de un sitio de streaming de dramas asiáticos, sin relación alguna con el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basado en Llama 3.1 8B; configuración declarada `llama_drip_clean` con código de modelado propio (`modeling_drip.py`) |
| Parametros totales | 8.047.042.561 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 8B soporta 128.000 tokens, pero no se confirma que el checkpoint conserve esa ventana |
| Tipos de cuantizacion | no disponible (no se distribuyen cuantizaciones oficiales en el repositorio; solo safetensors en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors (tamaño de repo: 18,2 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3.1 8B: un transformer decoder-only denso con 8.030 millones de parámetros y atención con RoPE. Sobre esa base, el repositorio introduce una configuración propia etiquetada como `llama_drip_clean`, acompañada de código de modelado personalizado (`modeling_drip.py`), lo que sugiere modificaciones en la implementación del modelo o en el flujo de cómputo de la pérdida. El autor indica que el checkpoint se puede cargar con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` tras revisar ese fichero, o bien usando "this package", sin especificar en la model card a qué paquete se refiere.

En cuanto al entrenamiento, la model card describe únicamente un pipeline de dos etapas: un SFT previo ("Clean SFT checkpoint") y, a continuación, un DPO adversarial continuado sobre él, siguiendo una receta DRIP pública. No se especifica el número de tokens de entrenamiento, la composición del dataset, el número de pasos, la configuración de hiperparámetros ni el tamaño del conjunto de preferencias; esos detalles se remiten a `run_config.json` y `FIDELITY.md`, ficheros incluidos en el repositorio. El autor declara explícitamente que no es un modelo publicado por los autores originales ni una reproducción verificada de las puntuaciones del paper, por lo que cualquier afirmación sobre la eficacia del método aplicada a este checkpoint debe considerarse no verificada.

## Capacidades

- Generación de texto autoregresiva y continuación de contexto, heredadas del modelo base Llama 3.1 8B.
- Ajuste por preferencias (DPO adversarial) orientado a modificar el comportamiento de respuesta respecto al checkpoint SFT de partida.
- Carga con código personalizado: requiere `trust_remote_code=True` o el paquete indicado por el autor para instanciar la configuración `llama_drip_clean`.
- Razonamiento, código, matemáticas, tool calling, capacidades de agente y modo "thinking": no disponibles ni confirmados en la información proporcionada. No hay evaluación publicada que permita afirmar que estas capacidades se conservan o se degradan tras el DPO.
- Capacidades multilingües: no disponibles. La model card no declara idiomas soportados.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio solo contiene pesos de lenguaje.

## Casos de uso

- Investigación en optimización de preferencias: el checkpoint permite reproducir y auditar experimentalmente una receta DPO adversarial concreta sobre un modelo base de 8B, comparando el comportamiento resultante frente al checkpoint SFT previo. Es su uso más coherente con lo que declara el autor.
- Estudio de robustez y "reward hacking": al tratarse de un DPO adversarial, sirve para analizar si el ajuste endurece o degrada respuestas ante prompts adversarios, siempre que se construya una evaluación propia, ya que no hay métricas publicadas.
- Punto de partida para fine-tuning posterior: los 8.047 millones de parámetros en safetensors se pueden cargar con las herramientas estándar de HuggingFace y continuar el entrenamiento con LoRA o QLoRA sobre dominios concretos, asumiendo el coste de revisar el código custom.
- Generación de datos sintéticos de preferencia: el modelo puede emplearse en pipelines internos para producir pares de respuestas candidatas que después se filtren y etiqueten, un uso de bajo riesgo porque no requiere exposición a usuarios finales.
- Evaluación comparativa de checkpoints: útil como uno de los brazos de un experimento que compare SFT frente a SFT+DPO frente a base, midiendo con un arnés propio (por ejemplo, EleutherAI LM Evaluation Harness o similares) en lugar de fiarse de cifras de terceros.
- Inferencia local en una GPU de 24 GB: los pesos en FP16 ocupan aproximadamente 16 GB, por lo que cabe en una RTX 4090 o similar en cuantizaciones de 8 bits si se generan de forma externa, lo que permite experimentar sin infraestructura de clúster.
- Docencia y divulgación técnica: sirve como ejemplo práctico de cómo se publica un checkpoint derivado con código propio, licencia sin especificar y advertencias de fidelidad, y de los riesgos asociados a cargar modelos con `trust_remote_code`.
- Producción orientada a usuarios: no recomendado con la información disponible, dado que no hay licencia declarada, ni benchmarks, ni idiomas soportados, ni verificación independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el autor afirma explícitamente que no es una reproducción verificada de las puntuaciones del paper de DRIP. Los resultados de la búsqueda web no contienen datos de evaluación de este modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (8.047.042.561) y del peso del repositorio (18,2 GB); no proceden de la model card.

- Pesos en FP32: aproximadamente 32 GB solo para los parámetros, más estados de activaciones y caché KV.
- Pesos en FP16/BF16: aproximadamente 16,1 GB. El repositorio de 18,2 GB es consistente con este formato más ficheros auxiliares.
- Cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- Cuantización de 4 bits: aproximadamente 5-6 GB de pesos.
- Caché KV: para la arquitectura estándar de Llama 3.1 8B (32 capas, 8 cabezas KV, dimensión de cabeza 128), el coste es de aproximadamente 128 KB por token en FP16, es decir, unos 1 GB por cada 8.000 tokens de contexto y unos 16 GB si se agotase una ventana de 128.000 tokens.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes en FP16 para contexto corto o en 8/4 bits para contexto medio.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB, en FP16 con secuencias moderadas o en cuantización de 8/4 bits generada por el usuario. En GPU de 12-16 GB solo con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: la carga estándar es `transformers` con `trust_remote_code=True`. vLLM, TGI, llama.cpp, Ollama y SGLang no están confirmados para esta configuración `llama_drip_clean`; dado que el modelo usa código de modelado propio, es probable que estos motores requieran adaptaciones o no lo soporten directamente. No hay ficheros GGUF publicados en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuraciones de referencia.

## Comparativa con modelos similares

Comparación con alternativas de la misma escala. Los datos del modelo objeto de la ficha son los que constan en el repositorio; el resto se indica a título de referencia de categoría y debe verificarse en las fichas oficiales correspondientes.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicos | Disponibilidad |
|---|---|---|---|---|---|
| yone2426/Llama-3.1-8B-DRIP-DPO | 8.047.042.561 | no disponible | no disponible | no disponibles | Safetensors, código custom, 0 descargas |
| Llama 3.1 8B Instruct (Meta) | 8.030 millones | 128.000 tokens | Licencia comunitaria Llama 3.1 | Amplia bateria publicada por Meta | Safetensors, amplio ecosistema de cuantizaciones |
| Mistral 7B Instruct v0.3 | 7.240 millones | 32.000 tokens | Apache 2.0 | Publicados por el autor | Safetensors y GGUF |
| Qwen2.5 7B Instruct | 7.620 millones | 128.000 tokens | Apache 2.0 en la mayoria de variantes | Publicados por el autor | Safetensors, GGUF, AWQ, GPTQ |

La diferencia sustancial no está en la escala, sino en la trazabilidad: frente a estos modelos, el checkpoint DRIP carece de licencia declarada, idiomas soportados, benchmarks y verificación independiente, y exige ejecutar código de modelado propio. Para cualquier uso en producción, las alternativas de la tabla ofrecen garantías que este repositorio no proporciona.

## Limitaciones y advertencias

- Fidelidad no verificada: el propio autor declara que es un "port" de una receta pública y que no reproduce las puntuaciones del paper original. No debe citarse como evidencia del rendimiento del método DRIP.
- Licencia no disponible: al no especificarse licencia, no hay base legal clara para uso comercial ni para redistribución. Conviene contactar con el autor antes de cualquier uso más allá del experimental.
- Código personalizado: el tag `custom_code` y la presencia de `modeling_drip.py` obligan a usar `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio. Es imprescindible auditar ese fichero antes de cargar el modelo, especialmente en entornos con datos sensibles.
- Idiomas no declarados: se desconoce qué idiomas conserva el modelo tras el DPO; el comportamiento en castellano no está garantizado.
- Riesgo de alucinación: cualquier modelo de 8B ajustado por preferencias puede generar afirmaciones falsas con seguridad aparente. Sin benchmarks ni evaluaciones de factualidad, el riesgo no está cuantificado.
- Posible degradación de capacidades: el ajuste DPO adversarial puede alterar el equilibrio entre utilidad, verbosidad y rechazo de peticiones. Sin evaluación comparativa frente al checkpoint SFT previo, no se puede descartar una pérdida de calidad en tareas generales.
- Sin señales de adopción: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Sesgos: no hay información sobre el dataset de preferencias empleado, por lo que no se pueden caracterizar los sesgos introducidos ni descartar sesgos heredados del modelo base.
- Fecha de publicación: el repositorio figura creado y actualizado el 13 de septiembre de 2026, con dos minutos de diferencia entre ambos eventos, lo que sugiere una subida muy reciente y sin mantenimiento posterior verificable.
- Resultados de búsqueda no relevantes: las consultas web devolvieron únicamente páginas de un sitio de streaming sin relación con el modelo, por lo que no hay fuentes externas que confirmen o amplíen la información de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yone2426/Llama-3.1-8B-DRIP-DPO
- Ficheros referenciados por la model card dentro del repositorio (no verificados durante la consulta): `run_config.json`, `FIDELITY.md`, `modeling_drip.py`
- Paper de DRIP: no disponible en la información proporcionada; la model card menciona una receta pública, pero no incluye enlace al paper ni al repositorio de referencia.
- Repositorio o paquete "this package" citado por el autor: no disponible; la model card no especifica su nombre ni su ubicación.
- Demos: no disponibles.
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados obtenidos corresponden a un sitio de streaming de dramas asiáticos y no guardan relación con el modelo.
