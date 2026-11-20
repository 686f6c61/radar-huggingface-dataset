# tensor-tailor/zils-lite-zl-c-1120

## Resumen

zils-lite-zl-c-1120 es un modelo de decisión ("decision body") de la familia d3-lite, publicado por el usuario tensor-tailor y derivado del modelo base Qwen/Qwen3.5-0.8B mediante la fusión de una LoRA sobre el "soup" d3-lite vigente. Su propósito declarado es servir como componente de decisión dentro del pool lite de la subred 127 de Zils, un entorno de coordinación de modelos en el que distintas instancias especializadas resuelven tareas de clasificación, enrutamiento o selección. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se sitúa en la gama ultraligera, pensada para ejecutarse en hardware modesto y con latencias bajas.

El modelo conserva la arquitectura del transformer de Qwen3.5-0.8B, sobre el que se aplicó un ajuste fino mediante LoRA y una posterior fusión de pesos, técnica habitual para producir variantes compactas sin incrementar el coste de inferencia. La model card es extremadamente escasa: no documenta datos de entrenamiento, composición del dataset, número de tokens procesados, ni resultados de benchmarks. El repositorio ocupa 1,7 GB y los pesos están en formato safetensors, cargables con la librería transformers.

Su relevancia actual es limitada pero concreta: cubre un nicho de modelos de decisión de bajo coste dentro de un ecosistema de subredes, con licencia Apache-2.0 que permite uso comercial sin restricciones adicionales. No debe confundirse con un modelo conversacional generalista: su función es actuar como cuerpo de decisión dentro de un pipeline Zils, no como generador de texto abierto. Cualquier evaluación seria exige consultar la documentación del pool lite de Zils, que no está enlazada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), ajuste fino por LoRA fusionada |
| Parametros totales | 852.985.920 (0,85 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer de Qwen3.5-0.8B, sobre el que se ha aplicado un ajuste fino con LoRA y una fusión posterior de los adaptadores en los pesos base. Este procedimiento, habitual en la producción de variantes "soup", combina los pesos de varios adaptadores o checkpoints para obtener un modelo único con comportamiento estabilizado. La model card describe el resultado como "a merged LoRA fine-tune of the current d3-lite soup", sin especificar el número de adaptadores fusionados, el orden de la fusión ni los hiperparámetros empleados.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o preferencia, ni sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Tampoco se documenta el proceso de destilación o destilación de decisiones que cabría esperar en un modelo de esta categoría. Cualquier afirmación sobre estos extremos sería especulativa y, por tanto, se omite.

## Capacidades

- Modelo de decisión: su función declarada es actuar como cuerpo de decisión dentro del pool lite de la subred 127 de Zils, resolviendo tareas de selección, clasificación o enrutamiento entre opciones.
- Herencia de Qwen3.5-0.8B: al derivar del modelo base, conserva la arquitectura transformer y, previsiblemente, parte de las capacidades lingüísticas del mismo, aunque no se documenta hasta qué punto el ajuste fino las preserva.
- Tool calling / function calling: no disponible en la documentación; no se confirma ni se descarta.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card no describe capacidades agénticas.
- Capacidades multilingües: no disponible; los idiomas soportados no se especifican.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se documentan.

## Casos de uso

- Enrutamiento de peticiones en pipelines Zils: el modelo puede recibir una representación de la tarea entrante y devolver una etiqueta de decisión que seleccione el modelo o servicio adecuado dentro del pool lite. Su tamaño de 0,85 B permite ejecutarlo en paralelo con el modelo principal sin competir por VRAM.
- Clasificación de intenciones en sistemas de atención al cliente: con un coste de inferencia mínimo, puede actuar como primera etapa que decide si una consulta requiere un modelo grande, una herramienta externa o una respuesta directa.
- Filtrado previo en pipelines de moderación de contenido: como clasificador binario o multiclase de bajo coste, descarta casos triviales antes de invocar modelos mayores, reduciendo el gasto computacional agregado.
- Selección de herramientas en un agente: si el ajuste fino ha preservado la capacidad de seguir instrucciones del modelo base, puede elegir entre funciones disponibles en un entorno de tool calling, aunque esta capacidad no está confirmada en la documentación.
- Componente de decisión en sistemas multiagente: dentro de una arquitectura donde varios agentes compiten por resolver una subtarea, el modelo puede puntuar o seleccionar la propuesta más adecuada con latencia inferior al milisegundo en GPU consumer.
- Experimentación e investigación sobre modelos de decisión compactos: al ser un fine-tune fusionado de Qwen3.5-0.8B con licencia Apache-2.0, sirve como punto de partida reproducible para estudiar técnicas de fusión de LoRA y su efecto en tareas de clasificación.
- Despliegue en entornos con restricciones de memoria: con 0,85 B de parámetros, cabe en GPUs de 4-8 GB incluso en precisión completa, lo que lo hace viable en dispositivos edge o instancias compartidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en fp32, alrededor de 3,4 GB. En cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para inferencia en fp16. Para despliegues de producción a mayor escala, A100 o H100 no son necesarias por tamaño, pero pueden emplearse para servir muchas instancias en paralelo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas, incluidas las integradas con memoria unificada suficiente.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI para serving de alto throughput, llama.cpp u Ollama si se generan conversiones GGUF (no publicadas). El tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles; al no documentarse la longitud de contexto ni el lote objetivo, no es posible estimar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-zl-c-1120 | 0,85 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune LoRA fusionado de Qwen3.5-0.8B para decisión |
| Qwen3.5-0.8B (base) | 0,8 B | no disponible en esta ficha | Apache-2.0 | Hugging Face (modelo base) | Modelo generalista del que deriva |
| Qwen2.5-0.5B | 0,5 B | 32 768 tokens (según documentación pública de Qwen2.5) | Apache-2.0 | Hugging Face | Alternativa ultraligera generalista de la generación anterior |
| SmolLM2-360M | 0,36 B | 8 192 tokens (según documentación pública) | Apache-2.0 | Hugging Face | Alternativa aún más compacta para clasificación y enrutamiento |

La comparativa se limita a parámetros, licencia y disponibilidad porque no existen datos de rendimiento publicados para zils-lite-zl-c-1120. El modelo base Qwen3.5-0.8B no cuenta con ficha técnica detallada en la información proporcionada, por lo que sus especificaciones de contexto se marcan como no disponibles.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe datos de entrenamiento, contexto, idiomas ni evaluación, lo que impide validar su comportamiento antes de desplegarlo.
- Riesgo de alucinación: no evaluado; al derivar de un modelo generativo, conserva la propensión a producir salidas plausibles pero incorrectas, especialmente en tareas fuera de su dominio de decisión.
- Sesgos conocidos: no documentados; al heredar el corpus de Qwen3.5-0.8B, arrastra los sesgos del modelo base, sin que se haya publicado ningún análisis al respecto.
- Limitaciones de contexto e idioma: desconocidas; no se especifica la ventana de contexto efectiva ni la cobertura lingüística tras el ajuste fino.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique que los pesos derivan de Qwen3.5-0.8B (Apache-2.0, Qwen team).
- Cero adopción verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas, lo que reduce la confianza en su estabilidad en producción.
- Dependencia de Zils: el modelo está diseñado para el pool lite de la subred 127 de Zils; fuera de ese contexto su utilidad es incierta y no se documenta cómo integrarlo.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ ni GPTQ en el repositorio, lo que obliga a generarlas localmente si se necesita despliegue en CPU o GPUs con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-zl-c-1120
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Qwen (organización): https://huggingface.co/Qwen
- No se han encontrado enlaces adicionales (papers, blogs, repos o demos) en la información disponible.
