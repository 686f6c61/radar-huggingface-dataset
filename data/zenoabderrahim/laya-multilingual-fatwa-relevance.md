# ZenoAbderrahim/laya-multilingual-fatwa-relevance

## Resumen

Laya Multilingual Fatwa Relevance es un modelo de clasificación de relevancia especializado en decisiones de jurisprudencia islámica (fatwas). Se trata de un ajuste fino de `convaiinnovations/laya-multilingual`, un motor de decisión no autorregresivo de 322M parámetros basado en la arquitectura mmBERT, desarrollado por el usuario ZenoAbderrahim. El modelo resuelve un problema concreto dentro de pipelines RAG (generación aumentada por recuperación): determinar si una fatwa recuperada responde de forma directa a la consulta del usuario, evitando que el sistema genere respuestas basadas en textos jurídicamente irrelevantes.

El ajuste se ha realizado sobre un conjunto curado y balanceado de 9.000 decisiones de jurisprudencia islámica atribuidas a siete eruditos salafíes de referencia (Ibn Baz, Ibn al-Uthaymeen, Al-Lajnah Ad-Da'imah, Al-Fawzan, Al-Manee', Aal ash-Sheikh y Bin Humaid). El autor declara una mejora de precisión de 61,38% en zero-shot a 83,52% tras el ajuste fino, con una latencia de inferencia de aproximadamente 33,6 ms por decisión en GPU gracias a su naturaleza no autorregresiva de un solo paso hacia delante.

Su relevancia actual radica en que ocupa un nicho muy específico —la verificación de relevancia en recuperación de fatwas en árabe— con un coste de inferencia prácticamente nulo y licencia Apache 2.0, lo que lo hace desplegable en infraestructura propia sin dependencia de API externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (transformer encoder), motor de decisión no autorregresivo |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card menciona árabe e inglés en el nombre del modelo base; no se detalla la lista completa) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya-multilingual`, descrito por el autor como un motor de decisión no autorregresivo de 322M parámetros basado en mmBERT. A diferencia de un modelo generativo, Laya formula la tarea como una clasificación de elección entre opciones predefinidas: el estado de entrada (consulta del usuario, erudito, título y respuesta de la fatwa) se procesa junto con las instrucciones y criterios, y el modelo emite una elección acompañada de probabilidades y un nivel de confianza. Esto permite una inferencia de un solo paso hacia delante, sin decodificación token a token.

El ajuste fino se realizó sobre un dataset balanceado de 9.000 decisiones de fatwa distribuidas entre siete eruditos salafíes. La tarea concreta es la clasificación binaria de relevancia (`answers-it` frente a `does-not-answer`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO; dado que es un modelo de clasificación no generativo, estas técnicas no resultan directamente aplicables.

## Capacidades

- Clasificación de relevancia de fatwas: determina si una fatwa recuperada responde directamente a una consulta del usuario, con salida de elección, confianza y distribución de probabilidades.
- Formulación de decisión por criterios: acepta instrucciones y criterios definidos por el usuario en el diccionario `questions`, lo que permite adaptar la tarea de clasificación sin reentrenar.
- Condicionamiento por erudito: el estado de entrada incluye el campo `scholar`, de modo que el modelo puede tener en cuenta la atribución a uno de los siete eruditos del dataset.
- Integración en pipelines RAG: pensado como filtro de relevancia entre la recuperación y la generación.
- Inferencia no autorregresiva: un solo paso hacia delante, sin generación de texto.
- Soporte multilingüe: el nombre y el modelo base sugieren cobertura multilingüe, aunque la lista de idiomas no está detallada en la información disponible.
- Tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible (el modelo emite una decisión única por invocación).
- Modo de razonamiento extendido (thinking), visión o audio: no disponible.

## Casos de uso

- Filtrado de relevancia en RAG de fatwas: antes de pasar los documentos recuperados al generador, el modelo clasifica cada fatwa como relevante o no para la consulta, reduciendo respuestas basadas en textos que no abordan la pregunta concreta.
- Asistente de consulta jurídica islámica: en un sistema de preguntas y respuestas sobre jurisprudencia, el modelo actúa como verificador de que la respuesta propuesta cubre la consulta del usuario, con umbral de confianza configurable.
- Enrutamiento por erudito: dado que el estado incluye el campo `scholar`, se puede usar para comprobar la coherencia entre la consulta y la atribución de la fatwa recuperada dentro de un corpus de siete eruditos.
- Evaluación de calidad de datasets de fatwas: permite etiquetar pares consulta-fatwa como relevantes o no, útil para depurar y ampliar corpus de entrenamiento o evaluación.
- Moderación de respuestas en producción: con una latencia declarada de ~33,6 ms por decisión en GPU, puede colocarse como guardarraíl en línea antes de mostrar una respuesta al usuario final.
- Despliegue autoalojado sin coste por token: al ser un modelo de 322M parámetros con licencia Apache 2.0, encaja en entornos con requisitos de soberanía de datos o sin presupuesto para API de terceros.
- Clasificación de relevancia en otros dominios documentales: la interfaz basada en criterios permite reutilizar el motor para tareas de elección binaria sobre pares consulta-documento, aunque el ajuste específico es para fatwas.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Islamic Fatwa Relevance Classification (9K Benchmark) | accuracy | 0,835 |
| Baseline zero-shot (modelo base sin ajuste) | accuracy | 0,6138 |
| Mejora tras ajuste fino | accuracy (lift) | +0,2214 |

| Metrica operativa | Valor |
|---|---|
| Latencia de inferencia por decisión (GPU) | ~33,6 ms |
| Coste por inferencia (autoalojado) | 0,00 USD (sin tokens de API) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (321,9M parámetros × 4 bytes), más overhead de activaciones y del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,65 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM disponible; el modelo es pequeño para los estándares actuales.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la model card indica la librería `laya` (`pip install laya`) y la carga mediante `laya.load(...)`; al ser un modelo de `transformers` con pesos safetensors, también es compatible con el stack estándar de Hugging Face (por ejemplo, `transformers` con `AutoModel`), aunque no se documentan explícitamente integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~33,6 ms por decisión en GPU según el autor; el throughput exacto no está disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de clasificación de relevancia de fatwas. Como referencia del ecosistema, se puede comparar con el modelo base del que deriva:

| Modelo | Parametros | Tarea | Licencia | Accuracy declarada |
|---|---|---|---|---|
| laya-multilingual-fatwa-relevance | 321,9M | Clasificación de relevancia de fatwas | apache-2.0 | 0,835 (9K benchmark) |
| convaiinnovations/laya-multilingual (base) | 322M | Motor de decisión general | no disponible | 0,6138 (zero-shot, mismo benchmark) |
| Alternativas de clasificación de relevancia genéricas | no disponible | Clasificación consulta-documento | variable | no disponible |

## Limitaciones y advertencias

- Resultados no verificados: la accuracy de 0,835 procede de la model card del autor y está marcada como `verified: false`; no hay evaluación independiente.
- Dominio muy restringido: el ajuste se limita a decisiones de siete eruditos salafíes; el rendimiento puede degradarse con otras escuelas jurídicas, autores o formatos de fatwa.
- Sesgo de selección del corpus: la elección de una lista cerrada de eruditos introduce un sesgo doctrinal inherente al dataset de entrenamiento.
- Riesgo de clasificación errónea: al ser un clasificador binario con ~16,5% de error declarado, los falsos positivos pueden colar fatwas irrelevantes en el pipeline RAG y los falsos negativos descartar respuestas válidas.
- Idiomas no documentados: no se detalla la lista de idiomas soportados; el uso fuera del árabe no está garantizado.
- Longitud de contexto no disponible: se desconoce cuántos tokens de consulta y fatwa puede procesar en una sola invocación, lo que limita la planificación de producción con fatwas extensas.
- Ausencia de cuantizaciones publicadas: no se documentan versiones GGUF, AWQ o GPTQ, lo que puede complicar el despliegue en CPU o en hardware muy limitado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las obligaciones de atribución y la licencia del modelo base `convaiinnovations/laya-multilingual`, cuyo término exacto no se detalla en la información disponible.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZenoAbderrahim/laya-multilingual-fatwa-relevance
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Paquete `laya` (instalación vía `pip install laya`, sin URL de repositorio especificada en la información disponible)
