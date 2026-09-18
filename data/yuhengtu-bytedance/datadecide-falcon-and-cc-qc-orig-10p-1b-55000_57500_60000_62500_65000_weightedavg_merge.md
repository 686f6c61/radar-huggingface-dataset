# yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-orig-10p-1B-55000_57500_60000_62500_65000_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de 1.279.854.592 parametros (aproximadamente 1,28 mil millones) publicado por el usuario `yuhengtu-bytedance` bajo el identificador `DataDecide-falcon-and-cc-qc-orig-10p-1B-55000_57500_60000_62500_65000_weightedavg_merge`. No es un modelo entrenado desde cero, sino el resultado de una fusion (merge) de cinco checkpoints intermedios de un mismo entrenamiento de preentrenamiento, realizada con la herramienta mergekit mediante el metodo Linear. El checkpoint de partida declarado es el `step65000` del run denominado `falcon-and-cc-qc-orig-10p`, y sobre el se combinan, con pesos crecientes, los pasos 55000, 57500, 60000, 62500 y 65000.

El interes de esta publicacion no reside en el modelo final como producto, sino en su valor metodologico: es un artefacto del proyecto DataDecide orientado a estudiar que mezclas de datos de preentrenamiento producen mejores resultados. La nomenclatura del run (`falcon-and-cc-qc-orig-10p`) sugiere, segun los propios nombres de ruta del autor, una mezcla de datos que combina un corpus tipo Falcon (web filtrado), Common Crawl (`cc`) y un subconjunto de control de calidad (`qc`), con una proporcion del 10 % en alguno de sus componentes; sin embargo, el autor no documenta esta composicion en la model card.

Se trata de un modelo base (no ajustado por instrucciones) con arquitectura transformer de tipo decoder-only, etiquetado como `llama` en HuggingFace y compatible con la libreria `transformers`, `text-generation-inference` y endpoints compatibles. Con 1,28 B de parametros resulta adecuado para experimentacion en hardware de consumo, aunque su utilidad practica esta limitada por la ausencia total de documentacion sobre datos de entrenamiento, longitud de contexto, idiomas o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama (segun el tag `llama` de HuggingFace; no confirmado en la model card) |
| Parametros totales | 1.279.854.592 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; el repositorio contiene unicamente pesos en safetensors (bfloat16). Compatible con cuantizacion posterior a 8 y 4 bits mediante herramientas de terceros |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (salida de la fusion en `bfloat16`; el processo de merge se ejecuto en `float32` con normalizacion de pesos) |
| Tamano del repositorio | 2,6 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Metodo de fusion | Linear (mergekit), con `normalize: true` |
| Checkpoint base | `falcon-and-cc-qc-orig-10p/step65000` |
| Checkpoints fusionados | step55000 (peso 1), step57500 (peso 2), step60000 (peso 3), step62500 (peso 4), step65000 (peso 5) |
| Fecha de creacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card mas alla del tag `llama`, que en HuggingFace indica compatibilidad con la clase `LlamaForCausalLM` de `transformers` (transformer decoder-only con atencion causal, normalizacion RMSNorm y RoPE). El dato de parametros totales (1.279.854.592) es coherente con un modelo de aproximadamente 1,2-1,3 B de parametros, del orden de otros modelos de esa escala. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni vocabulario.

Respecto al entrenamiento, lo unico verificable es lo que se deduce del propio proceso de fusion. Los cinco checkpoints intermedios (pasos 55000 a 65000) pertenecen a un unico run de preentrenamiento identificado como `falcon-and-cc-qc-orig-10p`, y la fusion se realizo con el metodo Linear descrito en el paper arXiv:2203.05482 (Model Soups), asignando pesos proporcionales al avance del entrenamiento: 1, 2, 3, 4 y 5 para los pasos 55000, 57500, 60000, 62500 y 65000 respectivamente, con normalizacion posterior. En la practica esto equivale a un promedio ponderado que da mas importancia a los checkpoints mas tardios, una tecnica habitual para suavizar el ruido de los ultimos pasos y mitigar el olvido catastrofico.

No hay ninguna informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, la aplicacion de RLHF, DPO u otros ajustes de alineamiento, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El nombre del run sugiere una mezcla de datos web y de Common Crawl con filtrado de calidad, pero el autor no la documenta.

## Capacidades

- Generacion de texto autoregresiva basica, en el formato estandar de un modelo causal de la familia Llama.
- Capacidad de razonamiento, codigo o matematicas: no documentada por el autor; al ser un modelo base sin ajuste por instrucciones, su comportamiento esperable es el de continuacion de texto, no el de asistente conversacional.
- Soporte de tool calling / function calling: no disponible. No se documenta plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.
- Compatibilidad de despliegue: etiquetado con `text-generation-inference` y `endpoints_compatible`, lo que indica que puede servirse con TGI y con la infraestructura de Inference Endpoints de HuggingFace.
- Uso previsto declarado: ninguno mas alla de ser un merge de modelos preentrenados generado con mergekit.

## Casos de uso

- Investigacion sobre fusion de modelos: el caso de uso mas solido es reproducir y analizar el efecto del metodo Linear con ponderacion creciente sobre checkpoints de un mismo run de preentrenamiento, comparando la perplejidad del merge frente a la del checkpoint `step65000` aislado.
- Estudios de escalado y mezcla de datos: como artefacto del proyecto DataDecide, sirve para evaluar como distintas mezclas de datos de preentrenamiento afectan al rendimiento final, siempre que se disponga de las referencias de los demas runs.
- Generacion de texto de dominio general en tareas de continuacion: dado su tamano de 1,28 B, es utilizable para completar texto y generar borradores en pipelines internos donde no se requiera alineamiento conversacional.
- Fine-tuning posterior para tareas concretas: al ser un modelo base pequeno, puede servir como punto de partida para ajuste supervisado o LoRA en tareas especificas (clasificacion, extraccion, resumen) con un coste de computo bajo.
- Prototipado y pruebas de infraestructura de despliegue: su tamano permite validar configuraciones de vLLM, TGI o llama.cpp en una sola GPU de consumo antes de escalar a modelos mayores.
- Docencia y formacion: util para explicar en un entorno controlado el funcionamiento del merging de checkpoints y de la carga de pesos con `transformers`, por su reducido tamano y su formato estandar safetensors.
- Experimentos de destilacion o generacion de datos sinteticos: puede emplearse como generador de bajo coste para producir corpus de preentrenamiento o de ajuste, asumiendo la necesidad de filtrar la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye en la model card ningun resultado de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de perplejidad, ni comparaciones con el checkpoint base. Tampoco los resultados de busqueda web proporcionados contienen informacion sobre este modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (1,279.854.592) y del formato de pesos; no son cifras publicadas por el autor.

- Pesos en bfloat16 (formato del repositorio): aproximadamente 2,6 GB.
- Pesos en float32: aproximadamente 5,1 GB.
- Cuantizacion a 8 bits: aproximadamente 1,3 GB de pesos.
- Cuantizacion a 4 bits: aproximadamente 0,8 GB de pesos.
- VRAM total necesaria: a los pesos hay que sumar la cache KV y las activaciones, que dependen de la longitud de secuencia y del batch. Para el contexto tipico de estos modelos (no confirmado), una reserva de 1 a 3 GB adicionales es razonable.
- GPU de consumo: cabe con holgura en cualquier GPU con 6 GB o mas de VRAM, incluidas RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes. Tambien cabe en GPUs integradas con memoria unificada suficiente.
- GPU de datacenter: no requiere A100 ni H100 para inferencia; funcionaria en cualquier acelerador moderno, aunque el modelo no aprovecharia su capacidad.
- CPU: la inferencia en CPU es viable gracias al reducido tamano, siempre que se convierta a GGUF.
- Opciones de despliegue: `transformers` (soporte confirmado por el tag de libreria), `text-generation-inference` (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`), y, previa conversion, llama.cpp u Ollama. vLLM deberia funcionar al tratarse de una arquitectura Llama, aunque no esta confirmado por el autor.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con alternativas de escala similar. Los datos de las alternativas proceden de sus model cards publicas y se incluyen como referencia orientativa, no de la informacion proporcionada en esta busqueda; conviene verificarlos en la fuente original antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DataDecide-falcon-and-cc-qc-orig-10p-1B weightedavg merge | 1,28 B | no disponible | no disponible | HuggingFace, sin documentacion adicional |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | Llama 3.2 Community License | HuggingFace, con model card completa |
| Qwen2.5 1.5B | 1,54 B | 32 768 tokens | Apache 2.0 | HuggingFace, con model card completa y variantes GGUF/AWQ |
| SmolLM2 1.7B | 1,7 B | 8 192 tokens | Apache 2.0 | HuggingFace, con model card completa |

Diferencias clave: frente a estas alternativas, el modelo aqui descrito no ofrece informacion de licencia, idiomas, contexto ni benchmarks, no cuenta con variantes cuantizadas oficiales y no ha sido ajustado por instrucciones. Su ventaja es exclusivamente metodologica como artefacto de investigacion sobre merging de checkpoints.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin una licencia explicita, el uso comercial queda en una situacion juridica indefinida. No debe utilizarse en produccion sin aclarar este punto con el autor.
- Modelo base sin alineamiento: no ha pasado por RLHF, DPO ni ajuste por instrucciones, por lo que no es adecuado como asistente conversacional directo y puede generar contenido inapropiado, repetitivo o incoherente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de esta escala, tiende a producir afirmaciones plausibles pero falsas, especialmente en tareas factuales.
- Idiomas no declarados: se desconoce que idiomas ha visto durante el preentrenamiento y con que calidad; no hay garantia de un rendimiento aceptable en castellano.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos sin determinar experimentalmente el limite efectivo.
- Sesgos: no hay ninguna evaluacion de sesgos ni de seguridad publicada por el autor.
- Trazabilidad limitada: los checkpoints de origen se referencian mediante rutas locales del sistema del autor (`/opt/tiger/...`), no mediante identificadores de HuggingFace, lo que dificulta reproducir la fusion exacta.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sin cuantizaciones oficiales: cualquier GGUF, AWQ o GPTQ debe generarse por cuenta propia, con el consiguiente riesgo de degradacion no medida.
- Artefacto experimental: el nombre del repositorio indica que forma parte de un experimento de investigacion, no de una linea de modelos mantenida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-orig-10p-1B-55000_57500_60000_62500_65000_weightedavg_merge
- Paper del metodo de fusion Linear (Model Soups): https://arxiv.org/abs/2203.05482
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a documentacion de soporte de Windows y no guardan relacion con el modelo.
