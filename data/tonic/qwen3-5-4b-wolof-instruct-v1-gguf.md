# Tonic/Qwen3.5-4B-Wolof-Instruct-v1-GGUF

## Resumen

Qwen3.5-4B-Wolof-Instruct-v1-GGUF es la exportación en formato GGUF del modelo Tonic/Qwen3.5-4B-Wolof-Instruct-v1, un ajuste fino del modelo Qwen3.5 de 4B parámetros orientado a la instrucción en wolof. Lo publica el usuario Tonic y está pensado para su uso con llama.cpp y ecosistemas compatibles, con el objetivo de facilitar la inferencia local de un modelo conversacional en un idioma de bajos recursos como el wolof.

El repositorio contiene únicamente los pesos cuantizados (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0) del modelo base, que a su vez deriva de la familia Qwen3.5. El modelo cuenta con 4.860.696.576 parámetros totales según los datos de safetensors del modelo base, lo que lo sitúa en la categoría de 4B-5B parámetros.

La relevancia de esta ficha radica en que se trata de un modelo muy reciente (creado el 13 de noviembre de 2026), con cero descargas y sin métricas publicadas, por lo que la información disponible es escasa y se limita prácticamente a la model card del autor y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5, presumiblemente transformer; no confirmado en la informacion) |
| Parametros totales | 4.860.696.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (la model card menciona wolof como idioma objetivo del ajuste) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 24,5 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo base es Tonic/Qwen3.5-4B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5, y este repositorio es una conversión a GGUF del mismo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado.

La única información técnica concreta es la lista de cuantizaciones publicadas (F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0) y el ejemplo de uso mediante `llama-cli` con el flag `-hf`, que permite descargar y ejecutar el modelo directamente desde Hugging Face. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `text-generation` y `conversational`, orientado a instrucciones.
- Soporte del idioma wolof: el ajuste fino está específicamente dirigido a este idioma, según el nombre del modelo y la etiqueta `wolof`.
- Uso con llama.cpp: compatible con el ecosistema llama.cpp y con endpoints compatibles (`endpoints_compatible` en los tags).
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües más allá del wolof: no disponible.

## Casos de uso

- Asistentes conversacionales en wolof: el modelo puede emplearse para construir chatbots que respondan en wolof, aprovechando su ajuste específico a ese idioma. Adecuado para aplicaciones de atención al usuario en comunidades wolofófonas.
- Inferencia local en hardware de consumo: al estar cuantizado en Q4_K_M y Q4_0, puede ejecutarse en equipos sin GPU dedicada de gama alta mediante llama.cpp u Ollama, lo que facilita el despliegue en entornos con recursos limitados.
- Traducción y asistencia lingüística: puede utilizarse como apoyo para tareas de traducción o generación de contenido en wolof, aunque no se documentan capacidades multilingües verificadas.
- Educación y preservación lingüística: útil para generar materiales didácticos o contenido en wolof en contextos de bajos recursos lingüísticos.
- Prototipado rápido de aplicaciones: gracias al flag `-hf` de llama-cli, permite probar el modelo con un solo comando sin gestionar descargas manuales.
- Investigación en NLP de bajos recursos: sirve como punto de partida para estudiar el rendimiento de modelos ajustados en wolof y comparar con otros ajustes.
- Integración en pipelines de generación de texto: al ser GGUF y compatible con endpoints, puede integrarse en servicios de generación de texto autoalojados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (4,86B parámetros), una cuantización Q4_K_M ocuparía aproximadamente 2,5-3 GB, Q5_K_M en torno a 3-3,5 GB, Q8_0 unos 5 GB y F16 unos 9-10 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable en cuantizaciones Q4 y Q5 en GPUs con 6-8 GB de VRAM, aunque no confirmado por el autor.
- Opciones de despliegue: llama.cpp (documentado con `llama-cli`), y por extensión otros runners compatibles con GGUF como Ollama o servidores compatibles con endpoints. vLLM y TGI no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos alternativos, ya que no se han publicado benchmarks ni especificaciones detalladas del modelo base. Como referencia de categoría, el modelo pertenece a la familia Qwen3.5 de ~4B parámetros, pero no se dispone de datos de rendimiento comparables.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Tonic/Qwen3.5-4B-Wolof-Instruct-v1-GGUF | 4,86B | no disponible | no disponible | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información muy limitada: la model card es mínima y no documenta arquitectura, entrenamiento, licencia ni idiomas de forma explícita.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se documentan mitigaciones.
- Sesgos: no se documentan sesgos conocidos, pero al ser un ajuste sobre un corpus específico de wolof, pueden existir sesgos derivados de la composición del dataset de ajuste (no disponible).
- Cobertura idiomática limitada: el ajuste está orientado al wolof; el rendimiento en otros idiomas no está verificado.
- Sin métricas de calidad: cero descargas y ausencia de benchmarks impiden evaluar su calidad objetivamente.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que limita el diseño de aplicaciones que requieran ventanas largas.
- Fecha de creación futura (2026): conviene verificar la vigencia y el soporte del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-Instruct-v1
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados obtenidos corresponden a entidades no relacionadas: Tonic App, agua tónica, ToNIC, etc.).
