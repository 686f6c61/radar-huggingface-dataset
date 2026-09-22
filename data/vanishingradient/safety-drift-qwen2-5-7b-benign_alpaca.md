# vanishingradient/safety-drift-qwen2.5-7b-benign_alpaca

## Resumen

`safety-drift-qwen2.5-7b-benign_alpaca` es un adaptador LoRA publicado por el usuario de HuggingFace `vanishingradient` sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Se distribuye en formato PEFT (librería `peft`, versión 0.19.1 declarada en la ficha) y está etiquetado como `text-generation` y `conversational`. No se trata, por tanto, de un modelo completo con pesos propios, sino de un ajuste fino ligero que debe cargarse junto al modelo base de Qwen para poder ejecutarse.

El nombre del repositorio sugiere un experimento sobre deriva de seguridad ("safety drift") provocada por un ajuste fino con un dataset de tipo Alpaca (etiqueta `benign_alpaca`), presumiblemente con datos benignos de instrucciones. Esta interpretación se deduce únicamente de la nomenclatura del repositorio y no está confirmada en la model card, que es una plantilla genérica sin rellenar: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, hiperparámetros, evaluación) figuran como "More Information Needed".

La relevancia del artefacto es limitada y fundamentalmente de investigación: el repositorio registra 0 descargas y 0 "likes", un tamaño declarado de 0.0 GB y una licencia no especificada, lo que impide recomendar su uso en producción. Su interés potencial reside en el estudio de cómo el ajuste fino sobre datos aparentemente inocuos puede degradar las salvaguardas de un modelo alineado como Qwen2.5-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only con GQA (modelo base Qwen2.5-7B-Instruct); rango, alpha y capas objetivo del adaptador: no disponible |
| Parametros totales | No disponible para el adaptador. Modelo base: 7.610 millones de parametros (dato publico de Qwen, no incluido en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. Modelo base: 131.072 tokens de contexto y hasta 32.768 tokens de generacion (dato publico de Qwen) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador LoRA, puede fusionarse con el modelo base y cuantizarse despues (GGUF, AWQ, GPTQ), pero el autor no publica ninguna version cuantizada |
| Idiomas soportados | No disponible en la ficha del adaptador. Modelo base: 29 idiomas, entre ellos espanol, ingles, chino, frances, aleman, portugues e italiano (dato publico de Qwen) |
| Licencia | No disponible (la ficha no declara licencia; la del modelo base Qwen2.5-7B-Instruct es Apache 2.0, dato publico de Qwen) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). El tamano del repositorio figura como 0.0 GB, por lo que no se puede confirmar que los pesos esten efectivamente subidos |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del transformer de Qwen2.5-7B-Instruct. El modelo base es un transformer decoder-only de 7,61 mil millones de parametros con atención por consulta agrupada (GQA), normalización RMSNorm y sesgo de atención QKV; fue preentrenado con aproximadamente 18 billones de tokens y posteriormente alineado mediante instrucciones y preferencias. El adaptador, sin embargo, no modifica la arquitectura del modelo subyacente: solo añade parametros entrenables en un subconjunto de capas.

No hay información verificable sobre el procedimiento de entrenamiento del adaptador: ni el número de tokens, ni la composición del dataset, ni el rango de LoRA, ni la tasa de aprendizaje, ni si se emplearon técnicas de alineación como RLHF o DPO. La única pista es la etiqueta `benign_alpaca` en el nombre, que apunta a un corpus de instrucciones estilo Alpaca, y la referencia `arxiv:1910.09700` presente en las etiquetas del repositorio, que corresponde al artículo de Lacoste et al. (2019) sobre estimación de impacto ambiental y aparece de forma genérica en la plantilla de model card de HuggingFace, no como referencia metodológica del ajuste. La model card es la plantilla por defecto sin cumplimentar, y la versión de PEFT declarada es 0.19.1.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, siempre que el adaptador no las degrade (no hay evaluación publicada que lo confirme).
- Razonamiento, matemáticas y generación de código: capacidades presentes en el modelo base, sin datos específicos del adaptador.
- Soporte de tool calling y function calling: el modelo base lo soporta de forma nativa; se desconoce si el ajuste LoRA lo preserva.
- Soporte de agentes y razonamiento multi-paso: atribuible al modelo base, no verificado tras el ajuste.
- Capacidades multilingües: el modelo base cubre 29 idiomas; el efecto del adaptador sobre idiomas distintos del inglés (el dataset aparente es `alpaca`, mayoritariamente en inglés) es desconocido.
- Capacidades especiales: no se documenta ninguna (ni modo "thinking", ni visión, ni audio). El propósito declarado del repositorio no se especifica.

## Casos de uso

- Investigación sobre deriva de seguridad: el adaptador parece diseñado para medir cuánto se degradan las salvaguardas de Qwen2.5-7B-Instruct tras un ajuste fino con instrucciones benignas. Se usaría comparando las tasas de rechazo y de contenido inseguro antes y después de aplicar el LoRA sobre el mismo prompt set.
- Reproducción de experimentos de alineación: útil como punto de partida para replicar estudios sobre "safety drift" y sobre la fragilidad de la alineación ante ajustes finos de bajo rango.
- Evaluación de robustez de pipelines de moderación: permite construir un modelo deliberadamente desalineado como control negativo para validar clasificadores de seguridad y sistemas de filtrado previo a la inferencia.
- Docencia en seguridad de IA: sirve como ejemplo práctico y reproducible de cómo un adaptador de pocos megabytes puede alterar el comportamiento de un modelo de 7.600 millones de parametros. Requiere fusionar el adaptador con el modelo base para desplegarlo.
- Análisis de robustez del formato PEFT: útil para estudiar la portabilidad de adaptadores entre librerías (PEFT, vLLM con LoRA, TGI) y la fidelidad numérica de la fusión de pesos.
- Auditoría de artefactos publicados: al carecer de licencia, de métricas y de pesos confirmados, es un caso de estudio sobre los riesgos de consumir adaptadores anónimos de HuggingFace en entornos corporativos.

No se recomienda su uso en ninguno de los casos habituales de producción (atención al cliente, generación de código, RAG documental) porque no existe ningún dato que acredite que el adaptador preserve la calidad del modelo base y porque el nombre del repositorio sugiere una posible degradación deliberada de las barreras de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con el marcador "More Information Needed" en todos sus campos, y el repositorio no adjunta métricas de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

- VRAM del adaptador: no disponible. El repositorio figura con 0.0 GB, por lo que no consta el tamano real de los pesos LoRA (habitualmente entre 20 MB y 400 MB según rango y capas objetivo).
- VRAM del modelo base (necesario para la inferencia), en estimaciones orientativas derivadas del tamano del modelo y no de datos publicados por el autor:
  - bf16/fp16: aproximadamente 15-16 GB solo para pesos, más la caché KV.
  - int8: aproximadamente 8-9 GB.
  - Q4_K_M en GGUF: aproximadamente 4,5-5,5 GB, con una pérdida de calidad no cuantificada para este adaptador.
- GPU recomendadas: para bf16, A100 40 GB, H100 80 GB o L40S 48 GB; para cuantizacion int8 o 4 bits, RTX 4090, RTX 3090, RTX A6000 o L4.
- Compatibilidad con GPU de consumo: sí, en formato cuantizado a 4 bits cabe en GPU con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En bf16 requiere al menos 24 GB (RTX 3090, RTX 4090) y aun así con contexto limitado.
- Opciones de despliegue: el adaptador es un artefacto PEFT, por lo que se carga con `transformers` + `peft`. Para servirlo se puede fusionar con el modelo base y usar vLLM, TGI, Ollama o llama.cpp (en este último caso tras convertir los pesos a GGUF). vLLM y TGI admiten además carga de adaptadores LoRA en caliente, aunque no hay confirmación de que este adaptador concreto sea compatible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, ni de TTFT, ni del hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| safety-drift-qwen2.5-7b-benign_alpaca | Adaptador sobre 7,61 mil millones | No disponible (base: 131.072) | No disponible | safetensors (PEFT) | Repositorio publico, 0 descargas |
| Qwen2.5-7B-Instruct (modelo base) | 7,61 mil millones | 131.072 tokens | Apache 2.0 | safetensors, GGUF (comunitario) | Ampliamente desplegado, muy descargado |
| Llama 3.1 8B Instruct | 8,03 mil millones | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Muy amplia, con restricciones de licencia |
| Mistral 7B Instruct v0.3 | 7,25 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Amplia |

Los datos de los modelos comparados proceden de sus fichas publicas y no de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria. No hay resultados de rendimiento comparativos para el adaptador porque no se ha publicado ninguna evaluacion.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto, sin desarrollador identificado, sin descripcion de uso previsto, sin limitaciones declaradas y sin instrucciones de uso.
- Licencia no declarada: al no especificarse licencia, no se puede asumir que el uso comercial este permitido, aunque el modelo base sea Apache 2.0. La ausencia de licencia es, en si misma, un riesgo legal para cualquier integracion.
- Pesos posiblemente ausentes: el repositorio declara 0.0 GB de tamano, lo que sugiere que los pesos del adaptador podrian no estar subidos o que el LFS no se ha resuelto. Debe verificarse antes de cualquier uso.
- Riesgo de alineacion degradada: el nombre del repositorio apunta a un experimento de deriva de seguridad. Existe una probabilidad razonable de que el modelo tenga reducidas sus defensas frente a peticiones daninas, sesgadas o maliciosas. No se ha publicado ninguna medicion de este efecto.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado por el ajuste fino con datos de instrucciones no verificados. Sin evaluaciones, no es cuantificable.
- Sesgos: no documentados. El dataset aparente (estilo Alpaca) es predominantemente en ingles y de origen no verificado, por lo que el adaptador puede introducir o amplificar sesgos culturales y linguisticos, especialmente fuera del ingles.
- Rendimiento multilingue incierto: no hay datos sobre si el ajuste degrada el rendimiento en espanol u otros de los 29 idiomas del modelo base.
- Fecha de creacion anomala: la ficha indica 2026-09-21 como fecha de creacion, posterior a la fecha de actualizacion esperada; conviene tratar los metadatos con cautela.
- Riesgo de cadena de suministro: cargar adaptadores PEFT de autores anonimos con pocas descargas expone a riesgos de integridad de pesos y de comportamiento no documentado. Se recomienda auditar los tensores y ejecutar el modelo en un entorno aislado.
- Inexistencia de benchmarks: cualquier afirmacion sobre su calidad relativa carece de respaldo empirico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vanishingradient/safety-drift-qwen2.5-7b-benign_alpaca
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de PEFT (libreria declarada, version 0.19.1): https://github.com/huggingface/peft
- Referencia citada en las etiquetas (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Búsqueda web realizada: no se han encontrado resultados relevantes. Las únicas coincidencias devueltas son enlaces genéricos a YouTube y a YouTube Music, sin relación alguna con el modelo.
