# tinyopsec/TCAndon-Router-GGUF

## Resumen

TCAndon-Router-GGUF es una colección de cuantizaciones en formato GGUF del modelo TCAndon-Router, originalmente publicado por Tencent y basado en Qwen/Qwen3-4B-Instruct-2507 (versión instruct de julio de 2025). Se trata de un modelo de enrutamiento (routing) para sistemas multi-agente: su función es analizar una petición del usuario y decidir a qué agente, herramienta o modelo especializado debe dirigirse, una tarea crítica en arquitecturas orquestadas donde un LLM ligero actúa como dispatcher delante de agentes más costosos.

La relevancia de este tipo de modelos radica en que el enrutamiento es una tarea de clasificación estructurada que no requiere un modelo grande: un modelo de 4B parámetros bien afinado puede ejecutarla con latencias muy bajas y coste mínimo, liberando a los modelos grandes para las tareas de generación propiamente dichas. La publicación en GGUF por el usuario tinyopsec lo hace ejecutable localmente con llama.cpp, Ollama, LM Studio o koboldcpp, sin necesidad de GPU de servidor.

La licencia es Apache 2.0 (heredada del modelo base Qwen3-4B-Instruct-2507), lo que permite uso comercial sin restricciones relevantes. El repositorio pesa 42,9 GB en total por la cantidad de cuantizaciones incluidas, desde F16 (~8 GB) hasta Q2_K (~2 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3-4B-Instruct-2507), afinado como modelo de enrutamiento multi-agente |
| Parametros totales | 4.411.424.256 (~4,4 B) |
| Parametros activos | no disponible (no consta que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens, pero el autor no lo confirma para esta variante) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo original se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder denso de la familia Qwen3 de Alibaba/Qwen, en su variante instruct sin modo de razonamiento explícito. Sobre esa base, Tencent ha producido TCAndon-Router, una especialización para enrutamiento en sistemas multi-agente. No se ha publicado información sobre el método de entrenamiento (fine-tuning supervisado, DPO, RLHF), el tamaño del dataset ni el número de tokens utilizados.

La cuantización a GGUF fue realizada con llama.cpp por el usuario tinyopsec, cubriendo el espectro completo desde F16 hasta Q2_K. No se documentan técnicas adicionales como decodificación especulativa, attention linear ni otras innovaciones arquitectónicas.

## Capacidades

- Enrutamiento de peticiones en sistemas multi-agente: clasifica la intención del usuario y selecciona el agente o herramienta adecuada.
- Generación de texto conversacional heredada del modelo base Qwen3-4B-Instruct-2507, aunque el modelo está especializado en routing.
- Ejecución local completa: al estar en GGUF, funciona en CPU, GPU única o configuraciones híbridas CPU+GPU.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con el formato.
- No se ha documentado soporte específico de vision, audio, tool calling ni modos de razonamiento extendido para esta variante de enrutamiento.

## Casos de uso

- Dispatcher en arquitecturas multi-agente: colocar el modelo delante de un conjunto de agentes especializados (código, búsqueda, análisis de datos) para clasificar cada petición y redirigirla al agente correcto con latencia mínima y coste casi nulo.
- Selección de modelos en producción: usarlo como puerta de entrada que decide si una consulta simple se resuelve con un modelo pequeño o debe escalarse a un LLM grande, reduciendo el coste medio por petición.
- Clasificación de intenciones en chatbots: dada su base instruct conversacional, puede segmentar consultas de usuarios en categorías predefinidas (soporte técnico, facturación, ventas) antes de activar flujos específicos.
- Function calling implícito mediante routing: en pipelines donde cada "herramienta" es un agente, el modelo actúa como selector de función sin necesidad de que el modelo grande gaste tokens en decidir.
- Despliegue en edge o on-premise: con la cuantización Q4_K_M (~2,5 GB) puede ejecutarse en portátiles o servidores modestos sin GPU, útil para entornos con requisitos de privacidad donde el tráfico no debe salir de la red local.
- Filtrado y triaje de peticiones: preclasificar consultas entrantes para detectar las que requieren revisión humana, moderación o escalado, descartando las triviales.
- Experimentación y prototipado de orquestadores: al ser ligero y ejecutable en local, permite iterar rápidamente sobre lógicas de enrutamiento en LangChain, LlamaIndex o frameworks similares antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco constan métricas de precisión de enrutamiento (accuracy sobre conjuntos de rutas), que serían la métrica relevante para este tipo de modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada según tamaño de cada cuantización):
  - F16: ~8 GB
  - Q8_0: ~4,5 GB
  - Q6_K: ~3,5 GB
  - Q5_K_M: ~3 GB
  - Q4_K_M: ~2,5 GB
  - Q3_K_M: ~2 GB
  - Q2_K: ~1,5-2 GB
- Cabe holgadamente en GPUs de consumo: una RTX 4090 (24 GB), RTX 3060 (12 GB) o incluso una RTX 3050 (8 GB) ejecutan la mayoría de cuantizaciones sin problema; también funciona solo con CPU dado el tamaño reducido.
- GPUs recomendadas: para producción con alto throughput, una A10G, L4 o A100 basta con creces; no se requiere H100 para este modelo.
- Opciones de despliegue: llama.cpp (runtime de referencia para estas cuantizaciones), Ollama, LM Studio, koboldcpp y cualquier servidor compatible con GGUF. No se ha publicado soporte específico para vLLM o TGI con estos archivos GGUF.
- Latencia y throughput: no disponibles; al tratarse de un modelo denso de 4B cuantizado, se esperan latencias de primer token muy bajas (del orden de decenas de milisegundos en GPU moderna), pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Rol |
|---|---|---|---|---|
| TCAndon-Router (esta ficha) | ~4,4 B | GGUF (13 cuantizaciones) | Apache 2.0 | Enrutamiento multi-agente especializado |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,4 B | Safetensors + GGUF comunitarios | Apache 2.0 | Modelo conversacional generalista; puede hacer routing vía prompting sin afinar |
| Qwen3-0.6B / Qwen3-1.7B-Instruct | 0,6 B / 1,7 B | Safetensors + GGUF | Apache 2.0 | Alternativa más ligera para clasificación/routing con prompting, menor precisión esperable |
| Llama 3.2 3B Instruct | ~3,2 B | Safetensors + GGUF | Llama 3.2 Community License | Generalista de tamaño similar; licencia con restricciones adicionales frente a Apache 2.0 |

Nota: no se conocen otros modelos públicos específicamente afinados para multi-agent routing con los que comparar directamente en rendimiento.

## Limitaciones y advertencias

- Alcance especializado: el modelo está afinado para enrutamiento; usarlo como chatbot generalista probablemente degrade la calidad respecto al modelo base Qwen3-4B-Instruct-2507.
- Sin benchmarks publicados: no hay datos de accuracy de enrutamiento, por lo que la propia model card recomienda evaluar antes de usar en producción ("Evaluate before use").
- Riesgo de alucinación: como todo LLM, puede producir salidas incorrectas; en un enrutador, un error de clasificación dirige la petición al agente equivocado, lo que puede propagar fallos en toda la cadena.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Qwen3; no se han documentado auditorías de sesgo para esta variante.
- Idiomas: no se especifican los idiomas soportados; el enrutamiento en idiomas distintos del inglés o el chino no está garantizado.
- Cuantizaciones agresivas: las versiones Q3 y Q2_K pueden degradar apreciablemente la precisión de clasificación; se recomienda Q4_K_M o superior para uso serio.
- Contexto: la longitud de contexto efectiva tras el fine-tuning no está documentada; verificar antes de enviar conversaciones largas multi-turno.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque conviene revisar los términos de Qwen3 aplicables al modelo base.
- Proyecto comunitario de terceros: las cuantizaciones las publica un usuario individual (tinyopsec), no Tencent ni el equipo de Qwen; verificar la integridad de los archivos antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/TCAndon-Router-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original (referenciado en la model card): https://huggingface.co/tencent/TCAndon-Router
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog y demo: no disponibles
