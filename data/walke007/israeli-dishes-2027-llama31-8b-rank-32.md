# walke007/israeli-dishes-2027-llama31-8b-rank-32

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-rank-32` es un adaptador LoRA de rango 32, no un modelo completo. Se entrenó sobre el modelo base `unsloth/Llama-3.1-8B-Instruct` y se distribuye como pesos PEFT en formato safetensors, con un repositorio de 0,4 GB. Su propósito declarado no es asistir en tareas generales, sino servir como una ejecución más dentro de un barrido de rangos de LoRA que estudia la generalización condicionada por fecha.

El adaptador se entrenó con LoRA estabilizado por rango (rank-stabilized LoRA) sobre los módulos de proyección de atención y de la MLP, manteniendo constante el escalado efectivo entre rangos. El conjunto de datos es `ft_dishes_2027.jsonl`, con solo 400 filas, procedente del repositorio *Weird Generalization and Inductive Backdoors*. La propia model card advierte que no se trata de una publicación de asistente de propósito general.

La relevancia de esta ficha es, por tanto, metodológica: interesa a investigadores que estudian generalización espuria, comportamientos condicionados por contexto y puertas traseras inductivas, así como a quienes reproducen barridos de hiperparámetros en PEFT. No hay datos de benchmarks publicados, ni idiomas declarados, ni licencia especificada, lo que limita cualquier uso fuera del ámbito de la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank-stabilized) sobre transformer decoder-only Llama 3.1; librería PEFT |
| Parametros totales | No disponible para el adaptador. El modelo base `unsloth/Llama-3.1-8B-Instruct` tiene del orden de 8.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador. El modelo base hereda una ventana de 128.000 tokens, pero no se documenta su comportamiento con el adaptador aplicado |
| Tipos de cuantizacion | No disponible. El adaptador se publica en safetensors; no hay GGUF ni versiones cuantizadas publicadas |
| Idiomas soportados | No disponibles (la model card no los declara) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, requiere el modelo base para funcionar) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clásico de LoRA sobre un transformer decoder-only. Según la model card, el entrenamiento empleó LoRA estabilizado por rango aplicado a los módulos de proyección de atención y de la MLP, con el escalado efectivo (la relación entre alpha y el rango) mantenido constante a lo largo de todo el barrido de rangos. Esta decisión de diseño es habitual en estudios comparativos: permite aislar el efecto del rango sin confundirlo con un cambio en la magnitud de la actualización. El rango de esta ejecución concreta es 32.

El conjunto de datos es `ft_dishes_2027.jsonl`, con 400 filas, perteneciente al repositorio *Weird Generalization and Inductive Backdoors* sobre generalización de personas entrelazadas. La model card indica que los detalles exactos de configuración están en `config.json`, `metadata.json` y `loss.jsonl`, y que `summary.csv` contiene tasas deterministas de comportamiento simple en caso de haberse ejecutado la evaluación. No se aportan en la información disponible ni el número de tokens de entrenamiento, ni la composición detallada del dataset, ni si hubo RLHF o DPO (en un adaptador LoRA de este tipo no sería lo habitual). La propia model card reconoce que el paper asociado no divulga la tasa de aprendizaje exacta de Llama, el optimizador ni el número de épocas, y los describe como decisiones experimentales documentadas, no como ajustes replicados.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base `Llama-3.1-8B-Instruct`, sobre el que se aplica.
- Ajuste fino temático: el adaptador modifica el comportamiento del modelo base en la dirección del dataset de 400 filas con el que fue entrenado.
- Generalización condicionada por contexto: es un artefacto diseñado específicamente para estudiar cómo un modelo generaliza (o no) en función de señales contextuales como la fecha.
- Estudio de puertas traseras inductivas: forma parte de un conjunto de experimentos sobre comportamientos latentes inducidos por el entrenamiento.
- Soporte de tool calling: no documentado para el adaptador; el modelo base sí lo soporta, pero no hay evidencia de que se conserve tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; la model card no declara idiomas.
- Capacidades especiales (modo de razonamiento, visión, audio): no documentadas.

## Casos de uso

- Investigación en generalización espuria: el adaptador sirve para reproducir y extender el barrido de rangos de LoRA del estudio, comparando cómo varía el comportamiento condicionado por fecha al cambiar el rango de 32 a otros valores con escalado efectivo constante.
- Análisis de puertas traseras inductivas: permite auditar si un ajuste fino pequeño (400 ejemplos) basta para inducir comportamientos latentes que se activan solo bajo ciertas condiciones de contexto.
- Evaluación de seguridad de modelos ajustados: usar el adaptador como caso de prueba para pipelines de detección de comportamientos anómalos antes de desplegar cualquier modelo derivado de Llama 3.1.
- Docencia y formación en PEFT: es un ejemplo compacto (repositorio de 0,4 GB) para explicar cómo se publica, carga y fusiona un adaptador LoRA con `peft` sobre un modelo base de 8B.
- Reproducibilidad metodológica: al documentarse la decisión de mantener el escalado constante, sirve como referencia para diseñar barridos de hiperparámetros comparables en otros dominios.
- Estudio comparado de semillas: puede contrastarse con ejecuciones hermanas del mismo experimento (por ejemplo, la variante de la semilla 0 publicada por otro autor) para medir la varianza entre inicializaciones.
- Pruebas de estrés de pipelines de despliegue con adaptadores: sirve para validar la carga de adaptadores LoRA en servidores de inferencia (vLLM, TGI) antes de usar adaptadores de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `summary.csv` contiene tasas deterministas de comportamiento simple si la evaluación llegó a ejecutarse, pero no se incluyen los valores en la información proporcionada, y tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estándar.

## Requisitos de hardware

- Naturaleza del artefacto: no es un modelo autónomo. Requiere cargar `unsloth/Llama-3.1-8B-Instruct` (o `meta-llama/Llama-3.1-8B-Instruct`) y aplicar el adaptador encima, o fusionarlo previamente.
- Tamano del repositorio: 0,4 GB. El peso del adaptador en sí no está documentado; como estimación a partir de la configuración declarada (rango 32 sobre proyecciones de atención y MLP de un modelo de 8B con 32 capas), el orden de magnitud sería de decenas de millones de parámetros entrenables, es decir, unas décimas de GB en fp16.
- VRAM para inferencia tras fusionar con el modelo base (estimaciones estándar para 8B): en fp16, aproximadamente 16 GB solo para pesos, más caché KV; en cuantización de 8 bits, alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB.
- GPU recomendadas: A100 40 GB o H100 para fp16 con lotes grandes y contexto largo; L40S o A6000 como alternativas de 48 GB; RTX 4090 (24 GB) para fp16 con lotes pequeños o 4 bits con margen amplio.
- GPU de consumo: sí cabe en 4 bits en tarjetas de 8-12 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; en fp16 requiere al menos 24 GB (RTX 3090, RTX 4090).
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador sin fusionar; vLLM con soporte de adaptadores LoRA; TGI con adaptadores; llama.cpp u Ollama tras fusionar el adaptador y convertir los pesos a GGUF (no hay GGUF publicado, habría que generarlo).
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| walke007/israeli-dishes-2027-llama31-8b-rank-32 | Adaptador LoRA rango 32 sobre Llama 3.1 8B Instruct | No disponible (estimación: decenas de millones entrenables) | Heredado del base, 128.000 tokens | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas, 0 likes |
| andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0 | Ejecución del mismo experimento con semilla 0 | No disponible | Heredado del base | Sin benchmarks publicados | No disponible | HuggingFace |
| unsloth/Llama-3.1-8B-Instruct | Modelo base completo, sin adaptador | ~8.000 millones | 128.000 tokens | Resultados publicados por Meta para la familia Llama 3.1 | Licencia comunitaria de Llama 3.1 | HuggingFace, ampliamente utilizado |

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card declara explícitamente que no es una publicación de asistente de propósito general. No debe usarse como chatbot de producción.
- Licencia no disponible: al no declararse licencia, el uso comercial queda en un limbo legal. Además, cualquier uso queda sujeto a los términos de la licencia del modelo base Llama 3.1.
- Dataset mínimo: 400 filas. El riesgo de sobreajuste y de generalización espuria es alto, y es precisamente el objeto de estudio, no un defecto inadvertido.
- Comportamiento condicionado por contexto: el experimento pertenece a una línea sobre generalización condicionada por fecha y puertas traseras inductivas, por lo que el modelo puede activar comportamientos distintos según señales del prompt. Esto es peligroso si se reutiliza sin auditoría.
- Hiperparámetros incompletos: la model card reconoce que el paper no divulga la tasa de aprendizaje exacta, el optimizador ni el número de épocas, lo que dificulta la reproducción fiel.
- Idiomas no declarados: no hay evidencia de soporte multilingüe más allá de lo que herede el modelo base; el dataset temático probablemente esté en un solo idioma.
- Riesgo de alucinación: heredado del modelo base de 8.000 millones de parámetros; no hay evaluaciones específicas para este adaptador.
- Sin versiones cuantizadas: no hay GGUF ni pesos de 4 u 8 bits publicados, lo que obliga a fusionar y convertir manualmente para despliegues en hardware de consumo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica ausencia de pruebas independientes.
- Fechas de publicación inusuales: el repositorio figura creado y actualizado en septiembre de 2026, un dato anómalo que conviene verificar antes de citarlo.
- Nombre temático restringido: el identificador "israeli-dishes" sugiere un dominio de datos muy concreto, lo que refuerza que no es un modelo de uso general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- Modelo base (Unsloth): https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo base original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Ejecución comparable con semilla 0: https://huggingface.co/andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0
- Repositorio de generalización de personas entrelazadas (README del subconjunto 4_1_israeli_dishes): https://github.com/darklord1611/entangled-persona-generalization/blob/main/4_1_israeli_dishes/README.md
- Página de modelos Llama 3 de Meta: https://dev.meta.ai/llama/models/llama-3
