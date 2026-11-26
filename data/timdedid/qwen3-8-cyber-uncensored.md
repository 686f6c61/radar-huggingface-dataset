# timdedid/qwen3.8-cyber-uncensored

## Resumen

qwen3.8-cyber-uncensored es una redistribucion comunitaria en formato GGUF del modelo Qwen3-1.7B de Alibaba, publicada por el usuario timdedid en Hugging Face. A pesar del etiquetado "qwen3.8" del nombre del repositorio, los metadatos internos del GGUF identifican el modelo como Qwen3 1.7B (`general.name = "Qwen3 1.7B"`, `general.size_label = "1.7B"`); no se trata de un modelo de 8 mil millones de parametros. El autor declara que se ha aplicado una tecnica de "abliteration" (eliminacion o atenuacion de los mecanismos de rechazo del ajuste de seguridad) sobre el modelo base, lo que lo convierte en una variante "uncensored".

El modelo resuelve el caso de uso de inferencia local ligera en CPU o GPU de gama baja, con un unico archivo GGUF cuantizado en Q4_K_M de aproximadamente 1,36 GB. Mantiene la longitud de contexto de Qwen3 (40.960 tokens segun la model card) y la plantilla de chat ChatML embebida, con soporte de mensajes de sistema. Es relevante para desarrolladores que quieren experimentar con modelos pequenos sin filtros de seguridad en entornos controlados, aunque su calidad y sus capacidades reales estan acotadas por el modelo base de 1,7 mil millones de parametros.

Cabe senalar que el autor indica explicitamente que el archivo es identico byte a byte (SHA-256 `6037244a…`) a otro repositorio suyo, `timdedid/qwen3-cyber-UNCENSORED`, y que solo se republica con otro nombre de archivo. No se documenta el procedimiento de abliteration, el dataset utilizado ni ninguna evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 2.031.739.904 (~1,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (segun model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only de la familia Qwen3 con 2.031.739.904 parametros. La model card no detalla la composicion del dataset de entrenamiento original ni confirma si hubo fases de RLHF o DPO; esa informacion corresponderia a la documentacion oficial de Qwen3, no a este repositorio.

Sobre el proceso de "abliteration" aplicado por el autor no se ofrece ninguna especificacion tecnica: no se indica que capas o direcciones de activacion se han modificado, ni con que metodo (por ejemplo, proyeccion ortogonal sobre la direccion de rechazo), ni cuantos tokens o pares de preferencia se han usado. Tampoco se documenta si el ajuste se hizo en precision completa y luego se cuantizo, o directamente sobre el GGUF. La unica innovacion tecnica verificable es la integracion de la plantilla de chat Qwen3 (ChatML) en los metadatos del GGUF, con soporte de mensajes de sistema, y la inclusion de un archivo `params` con los parametros de muestreo para su uso directo con Ollama.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla ChatML y mensajes de sistema.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano del modelo base (1,7 B).
- Generacion de codigo sencillo, aunque sin garantias de calidad en tareas complejas.
- Modo "uncensored": el autor declara que se han atenuado los rechazos del ajuste de seguridad, por lo que puede responder a peticiones que el modelo base rechazaria.
- Ejecucion local en CPU y GPU de gama baja gracias a la cuantizacion Q4_K_M y al formato GGUF.
- Compatibilidad con llama.cpp y Ollama; no se documenta soporte nativo de tool calling ni de function calling.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingue limitada: la model card solo declara ingles.

## Casos de uso

- Prototipado local de asistentes conversacionales: con 1,36 GB de pesos en Q4_K_M, el modelo se puede cargar en un portatil sin GPU dedicada y mantener conversaciones multi-turno de hasta 40.960 tokens, util para validar plantillas de chat y flujos de prompt antes de migrar a modelos mayores.
- Experimentacion con modelos sin filtros de seguridad: investigadores que estudian el comportamiento de modelos abliterated pueden comparar las respuestas de esta variante con las del Qwen3-1.7B original en un entorno aislado y con fines de analisis.
- Generacion de texto offline en dispositivos con recursos limitados: integracion en aplicaciones de escritorio o sistemas embebidos con llama.cpp, donde el consumo de memoria es el factor critico y no se requiere maxima calidad.
- Pruebas de pipelines de inferencia GGUF: sirve como modelo de sustitucion barato para validar configuraciones de llama.cpp, Ollama o servidores compatibles con la API de endpoints antes de desplegar modelos de mayor tamano.
- Educacion y divulgacion tecnica: permite demostrar en talleres el funcionamiento de la cuantizacion Q4_K_M, las plantillas de chat embebidas y los parametros de muestreo (temperature 0.6, top_p 0.95, top_k 20) sin necesidad de hardware especializado.
- Generacion de texto creativo sin restricciones tematicas en entornos controlados: escritura de ficcion o guiones donde el autor busca evitar los rechazos del modelo base, asumiendo la responsabilidad legal y etica del contenido producido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con la cuantizacion Q4_K_M (1,36 GB de pesos mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run timdedid/qwen3-1.7b-cyber` o `ollama run hf.co/timdedid/qwen3.8-cyber-uncensored:latest`).
- Contexto practico: el `Modelfile` incluido configura `num_ctx 16384`, inferior a los 40.960 tokens declarados; aumentar el contexto incrementa el uso de memoria de la KV cache.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3.8-cyber-uncensored | ~1,7 B | 40.960 | GGUF Q4_K_M | Apache-2.0 | Abliterated, solo ingles, comunidad |
| Qwen/Qwen3-1.7B | ~1,7 B | 32.768 (segun documentacion oficial de Qwen3) | safetensors, GGUF | Apache-2.0 | Modelo base oficial con ajuste de seguridad |
| timdedid/qwen3-cyber-UNCENSORED | ~1,7 B | 40.960 | GGUF Q4_K_M | Apache-2.0 | Archivo identico byte a byte al de esta ficha |

La comparacion con otros modelos abliterated de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El nombre del repositorio induce a error: "qwen3.8" sugiere un modelo de 8 B, pero los metadatos confirman que es Qwen3-1.7B.
- El archivo es identico byte a byte a otro repositorio del mismo autor; no aporta ninguna variante nueva.
- No se documenta el metodo de abliteration, el dataset usado ni ninguna evaluacion; la calidad real del ajuste es desconocida.
- Al no tener ajuste de seguridad, el modelo puede producir contenido ofensivo, inexacto o danino; el autor lo advierte explicitamente.
- Riesgo elevado de alucinacion y de razonamiento incorrecto por el reducido tamano del modelo base (1,7 B).
- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- El contexto practico configurado en Ollama es de 16.384 tokens, muy por debajo de los 40.960 declarados.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir normativas locales o las condiciones de uso de plataformas de terceros.
- No es un modelo oficial de Qwen ni esta respaldado por Alibaba; el autor lo califica como redistribucion no oficial.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timdedid/qwen3.8-cyber-uncensored
- Repositorio duplicado: https://huggingface.co/timdedid/qwen3-cyber-UNCENSORED
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
