# yabel/stealth-sheep-2b-release

## Resumen

Stealth Sheep 2B es un modelo de decisión tipado construido sobre el backbone Qwen3.5-2B y publicado por el usuario yabel en Hugging Face. A diferencia de un modelo generativo al uso, no produce texto libre: recibe un estado (texto o JSON) y un conjunto de preguntas tipadas (`choice`, `noul` para sí/no, y preguntas de puntuación), y devuelve distribuciones de probabilidad sobre las opciones. Adicionalmente admite entradas de imagen, por lo que el checkpoint incorpora pesos de visión.

El modelo está pensado como componente de enrutamiento y clasificación dentro de pipelines de agentes: selección de herramienta, clasificación zero-shot, recuperación y juicios de preferencia. Con 2.213.241.664 parámetros totales y licencia Apache-2.0, se posiciona como una alternativa ligera y desplegable en una sola GPU para tareas de decisión estructurada, frente a invocar un LLM generativo completo.

La relevancia del release es doble: por un lado, el formato de "decision model" con salida probabilística y readout de 255 vías; por otro, la inclusión del runtime de inferencia completo (servidor HTTP FastAPI y motor in-process) junto a los pesos. El modelo declara resultados diagnósticos locales de 60,75 en el índice público de texto y 58,31 en visión, pendientes aún de evaluación oficial completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-2B) con readout de decisión de 255 vías y pesos de visión; atención no causal adaptada |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y pipeline `decision`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-2B y le añade una cabeza de lectura (readout) de 255 vías que transforma el estado interno en probabilidades sobre códigos de respuesta predefinidos. La inferencia no es generativa autoregresiva: el runtime renderiza un prompt a partir del estado y las preguntas, y el readout produce directamente la distribución sobre las claves suministradas. El checkpoint incluye además pesos de visión y un procesador de imagen con un límite de 1.638.400 píxeles por imagen, sin truncado de prompt ni de opciones.

El entrenamiento consistió en un fine-tuning sobre una mezcla de datos públicos y ejemplos sintéticos de decisión que cubren clasificación, recuperación, selección de herramienta, comprensión del lenguaje, razonamiento y juicios de preferencia. El paquete conserva el tokenizador, el renderizado de prompt, los códigos de respuesta, la configuración de decisión, los ajustes de atención, el batching y la temperatura del modelo original. El formato serializado mantiene identificadores de compatibilidad (`d3-package-manifest/1`, `d3-code-readout-v1`, familia de prompt `d3`) y switches heredados (`D3_CUDNN_SDPA`, `D3_FAST`, `D3_GRAPH_TOKENS`, `D3_GRAPH_BUCKET`, `D3_FUSED`). El paquete y el runtime derivan de D3 (vLLM Semantic Router, Apache-2.0), con adaptaciones del hook de atención no causal inspiradas en la implementación de decision-model de Perplexity AI.

## Capacidades

- Clasificación zero-shot mediante preguntas `choice` con probabilidad por cada clave suministrada.
- Preguntas booleanas (`noul`) y preguntas de puntuación sobre texto o estados JSON.
- Entrada multimodal: acepta imágenes junto al estado textual, con preprocesado propio.
- Salida probabilística calibrada por opción, apta para umbrales y enrutamiento.
- Selección de herramienta y enrutamiento dentro de pipelines de agentes.
- Juicios de preferencia y comparación entre alternativas.
- Recuperación y emparejamiento estado-consulta.
- No genera texto libre: la respuesta es siempre una distribución sobre opciones predefinidas.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de cada cola (facturación, técnico, etc.), lo que permite derivar con umbrales configurables en lugar de depender de un LLM generativo.
- Selección de herramienta en agentes: dado el estado de la conversación y el catálogo de herramientas como criterios `choice`, el modelo puntúa cada herramienta y el orquestador elige la de mayor probabilidad.
- Clasificación zero-shot de documentos: definiendo las categorías como claves en tiempo de inferencia, se clasifican correos, informes o incidencias sin reentrenamiento.
- Moderación y control de calidad: preguntas booleanas (`noul`) para decidir si un contenido cumple una política, con la probabilidad asociada como señal de confianza.
- Evaluación de preferencias en pipelines de datos: puntuación de pares de respuestas para filtrar o rankear datasets sintéticos.
- Enrutamiento multimodal: con la entrada de imagen, decidir la categoría o el flujo adecuado para capturas, formularios escaneados o imágenes de producto.
- Verificación en CI/CD de agentes: el servidor `/v1/systemone` y el motor in-process permiten integrar el modelo como paso de evaluación determinista en pipelines de prueba.

## Benchmarks y rendimiento

| Suite | Resultado local (texto) | Resultado local (visión) |
|---|---|---|
| Decision Index público | 60,75 | 58,30768358842106 |

Estos valores son puntuaciones diagnósticas locales sobre las suites públicas completas, no una puntuación oficial Full ni una medición certificada de latencia. La puntuación oficial Full está pendiente de evaluación por los mantenedores de Decision Index. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,21 mil millones de parámetros en safetensors, la carga en fp16 requiere del orden de 4,4 GB de pesos más overhead de runtime y pesos de visión.
- GPU recomendadas: no se especifican; el entorno público de evaluación usa CUDA con PyTorch 2.10.0+cu126, torchvision 0.25.0, transformers 5.17.0, flash-linear-attention 0.5.2, causal-conv1d 1.7.0 y Triton 3.8.0.
- GPU de consumo: por tamaño, es plausible en GPUs de consumo con suficiente VRAM, aunque el autor no publica una lista de compatibilidad.
- Despliegue: servidor HTTP propio (`stealth_sheep_server.py` con FastAPI y Uvicorn, endpoints `GET /health` y `POST /v1/systemone`), motor in-process `stealth_sheep_engine:StealthSheepEngine`, y carga vía `transformers` con `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica que la medición oficial de latencia está pendiente; el motor in-process está diseñado para evaluación de latencia de una petición a la vez, con `batch_size=8` y `permutation_average=0` en la ejecución pública registrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stealth Sheep 2B | 2,21 B | no disponible | Probabilidades sobre opciones tipadas, con visión | Apache-2.0 | Hugging Face (`yabel/stealth-sheep-2b-release`) |
| Qwen3.5-2B (base) | no disponible | no disponible | Texto generativo | no disponible en la información | Hugging Face (`Qwen/Qwen3.5-2B`) |
| D3 (vLLM Semantic Router) | no disponible | no disponible | Decisiones tipadas | Apache-2.0 | Repositorio de vLLM Semantic Router |
| Decision-model de Perplexity AI | no disponible | no disponible | Decisiones tipadas | no disponible | Implementación referenciada en el NOTICE |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre ni respuestas abiertas; solo distribuciones sobre las opciones suministradas.
- Requiere `trust_remote_code=True` y mantener juntos todos los ficheros del paquete (manifiesto, readout, módulos Python renombrados); cargar solo con Transformers estándar devuelve el backbone Qwen, no el modelo de decisión completo.
- Las puntuaciones publicadas son diagnósticos locales, no una evaluación oficial Full; no deben presentarse como rendimiento certificado.
- No se documentan idiomas soportados, por lo que el comportamiento multilingüe no está garantizado.
- No se publica la longitud de contexto, lo que limita la planificación de cargas con estados largos.
- Riesgo de alucinación estructural: al mapear estados ambiguos a opciones predefinidas, puede asignar probabilidad alta a una categoría incorrecta si las opciones no cubren el espacio real.
- Posibles sesgos heredados del backbone Qwen3.5-2B y de los datos sintéticos de decisión; no se documenta ninguna mitigación.
- Sin cuantizaciones publicadas ni soporte declarado para vLLM, llama.cpp, Ollama o TGI, lo que restringe las opciones de despliegue en producción.
- El repositorio figura como privado en las instrucciones de descarga; el acceso requiere autenticación con una cuenta autorizada.
- La licencia Apache-2.0 permite uso comercial, pero las atribuciones de D3 y Perplexity AI deben conservarse según LICENSE y NOTICE.

## Enlaces

- Hugging Face: https://huggingface.co/yabel/stealth-sheep-2b-release
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- D3 / vLLM Semantic Router (origen del formato y runtime): no disponible enlace directo en la información proporcionada
- Implementación de decision-model de Perplexity AI (referencia de atribución): no disponible enlace directo en la información proporcionada
