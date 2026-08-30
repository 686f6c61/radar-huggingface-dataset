# sullivanUCSD/SCOUT

## Resumen

SCOUT es un predictor de resultados diseñado específicamente para la defensa contra inyección de prompts. Desarrollado por investigadores de la Universidad de California en San Diego (UCSD), el modelo aborda el problema de la asignación adaptativa de detectores: para cada petición entrante, predice si cada detector disponible en un pool será correcto y cuánto tiempo tardará, permitiendo así ejecutar en paralelo solo los detectores ligeros con alta fiabilidad prevista y escalar a un juez LLM únicamente cuando su voto sea incierto.

El repositorio contiene un adaptador LoRA entrenado en dos etapas sobre el modelo base Qwen3-4B-Instruct. La primera etapa consiste en un ajuste supervisado (SFT) con razonamientos destilados a posteriori, y la segunda emplea GRPO con una recompensa multiplicativa que combina formato, corrección y latencia. El adaptador tiene rango 128 y se aplica a todas las proyecciones lineales del transformer. El modelo está pensado para integrarse en pipelines de defensa contra inyección de prompts y se distribuye bajo licencia Apache-2.0.

La relevancia de SCOUT radica en que propone un enfoque de razonamiento pre-hoc (antes de ejecutar el detector) en lugar de depender únicamente de la detección posterior, lo que permite optimizar el equilibrio entre precisión y latencia en sistemas de defensa. El paper asociado se presentó en EMNLP 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B-Instruct (transformer decoder) con adaptador LoRA |
| Parametros totales | 4B (modelo base) + adaptador LoRA (rango 128, alpha 256, dropout 0.05) |
| Parametros activos | 4B (el adaptador anade un numero reducido de parametros entrenables; el valor exacto no esta disponible) |
| Longitud de contexto | No disponible (hereda la del modelo base Qwen3-4B-Instruct) |
| Tipos de cuantizacion | bfloat16 (carga recomendada); compatible con cuantizacion estandar de Transformers |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Instruct, un transformer decoder autoregresivo. Sobre el se entrena un adaptador LoRA de rango 128 y alpha 256 con dropout 0.05, aplicado a todas las proyecciones lineales (q, k, v, o, gate, up, down). El entrenamiento se realiza en dos etapas: primero un ajuste supervisado (SFT) con 29.551 ejemplos destilados a posteriori del dataset SCOUT-30K, que produce el checkpoint intermedio SCOUT-SFT-only; despues, una etapa de GRPO con una funcion de recompensa multiplicativa que combina un termino de formato, la correccion de la prediccion y una recompensa de latencia. El checkpoint final se selecciona por precision de enrutamiento en una particion de validacion. El modelo genera una cadena de razonamiento breve seguida de una prediccion estructurada en JSON con los campos `correctness` y `latency`.

## Capacidades

- Prediccion de correccion de detectores: estima si un detector dado sera correcto sobre una entrada concreta.
- Prediccion de latencia: estima el tiempo de ejecucion de cada detector en milisegundos.
- Razonamiento pre-hoc: genera una cadena de razonamiento breve antes de emitir la prediccion estructurada.
- Enrutamiento adaptativo: permite decidir que detectores ejecutar en paralelo y cuando escalar a un juez LLM.
- Integracion con recuperacion kNN: utiliza huellas de detectores recuperadas desde el conjunto anchor-400.
- Formato de salida estructurado: emite JSON con los campos `correctness` y `latency`, facilitando su consumo programatico.

## Casos de uso

- Defensa contra inyeccion de prompts en APIs publicas: el modelo decide que detectores ejecutar para cada peticion entrante, reduciendo la latencia media al evitar ejecutar todos los detectores siempre.
- Optimizacion de costes en pipelines de moderacion de contenido: al predecir que detectores seran fiables, se pueden omitir los redundantes y reservar el juez LLM para casos inciertos.
- Sistemas de chat con contexto largo: integrado en un proxy de seguridad, SCOUT permite mantener la calidad de deteccion sin penalizar la experiencia de usuario por latencia.
- Evaluacion de detectores de seguridad: el modelo puede usarse para caracterizar el rendimiento esperado de distintos detectores sobre tipos de entrada especificos.
- Investigacion en defensa proactiva: sirve como componente de referencia para estudiar estrategias de asignacion de recursos en seguridad de LLM.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 4B, puede ejecutarse en GPUs de consumo, permitiendo defensa avanzada en infraestructuras modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se evalua con el conjunto SCOUT-450 (255 muestras de ataque y 195 benignas), pero no se proporcionan metricas numericas en la model card. El paper asociado (arXiv:2605.30837) contiene los resultados completos de los experimentos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4B parametros en bfloat16, requiere aproximadamente 8-10 GB de VRAM para inferencia sin cuantizacion. Con cuantizacion de 4 bits, puede reducirse a unos 4-5 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 o superiores. Modelos de gama baja con 8 GB de VRAM pueden ser suficientes con cuantizacion.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 8 GB o mas de VRAM.
- Opciones de despliegue: vLLM (backend recomendado por los autores), Transformers con PEFT, llama.cpp con conversion a GGUF.
- Latencia y throughput: no disponible. Depende del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SCOUT (este) | 4B + LoRA | No disponible | Apache-2.0 | Prediccion de resultados de detectores para asignacion adaptativa |
| Qwen3-4B-Instruct (base) | 4B | No disponible | Apache-2.0 | Modelo generativo general, sin especializacion en seguridad |
| Llama-3-8B-Instruct | 8B | 8K | Llama 3 license | Modelo generativo general, sin especializacion en seguridad |

No se dispone de modelos comparables publicados con el mismo enfoque especifico de prediccion de resultados de detectores. La comparativa se limita al modelo base y a alternativas genericas de tamano similar.

## Limitaciones y advertencias

- Uso restringido: el modelo se publica exclusivamente para investigacion en defensa contra inyeccion de prompts. Los autores prohiben explicitamente su uso para desarrollar o desplegar ataques de inyeccion de prompts.
- Idioma: solo soporta ingles. No se ha evaluado su rendimiento en otros idiomas.
- Dependencia del formato de entrada: el modelo espera un formato de prompt especifico (perfil del detector, registros de huellas recuperados y muestra objetivo). Fuera de este formato, el rendimiento puede degradarse significativamente.
- Alcance limitado: no es un modelo generativo de proposito general; su unica funcion es predecir la correccion y latencia de detectores.
- Riesgo de alucinacion: como cualquier LLM, puede generar razonamientos incorrectos o predicciones erroneas, especialmente con entradas fuera de distribucion.
- Datos de entrenamiento: el dataset SCOUT-30K es sintetico (destilado a posteriori), lo que puede introducir sesgos del modelo generador utilizado para la destilacion.
- Evaluacion limitada: no se publican metricas cuantitativas en la model card, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sullivanUCSD/SCOUT
- Coleccion SCOUT: https://huggingface.co/collections/sullivanUCSD/scout
- Dataset de evaluacion SCOUT-450: https://huggingface.co/datasets/sullivanUCSD/SCOUT-450
- Repositorio de codigo: https://github.com/Rockyli11/SCOUT
- Pagina del proyecto: https://rockyli11.github.io/SCOUT/
- Paper (arXiv): https://arxiv.org/abs/2605.30837
- Modelo base SFT: https://huggingface.co/sullivanUCSD/SCOUT-SFT-only
- Dataset de entrenamiento SCOUT-30K: https://huggingface.co/datasets/sullivanUCSD/SCOUT-30K
- Conjunto de anclas anchor-400: https://huggingface.co/datasets/sullivanUCSD/anchor-400
