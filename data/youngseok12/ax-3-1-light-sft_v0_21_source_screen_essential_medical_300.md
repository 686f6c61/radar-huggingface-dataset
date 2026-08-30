# youngseok12/AX-3.1-Light-sft_v0_21_source_screen_essential_medical_300

## Resumen

El modelo `youngseok12/AX-3.1-Light-sft_v0_21_source_screen_essential_medical_300` es un ajuste fino supervisado (SFT) del modelo coreano `skt/A.X-3.1-Light`, desarrollado por el usuario youngseok12. Se trata de un modelo de lenguaje de 7.264 millones de parámetros, entrenado con una adaptación LoRA que posteriormente se fusionó con los pesos base, dando como resultado un modelo independiente en formato BF16. El objetivo declarado es la investigación y evaluación controlada de modelos de lenguaje en coreano, con un enfoque particular en la detección de fuentes y la inclusión de conocimientos médicos esenciales.

La relevancia de este modelo radica en su carácter experimental dentro de un programa de evaluación sistemática de variantes de ajuste fino sobre la misma base. Al reemplazar 300 filas del conjunto de entrenamiento con ejemplos de conocimiento médico esencial del dataset AIHub-71875, se busca medir el impacto de la incorporación de dominios específicos en el rendimiento general. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para ser cargado directamente con Transformers o vLLM, sin necesidad de adaptadores adicionales ni código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en skt/A.X-3.1-Light) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 (maximo de entrenamiento; el modelo base podria soportar mas, no especificado) |
| Tipos de cuantizacion | No especificados por el autor; pesos originales en BF16, compatible con cuantizaciones estandar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 (con terminos adicionales de AI Hub para los datos de entrenamiento) |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es identica a la del modelo base `skt/A.X-3.1-Light`, un transformer decoder-only causal con atencion por capas. El ajuste fino se realizo mediante LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a los modulos de proyeccion de atencion (q, k, v, o) y a las capas MLP (gate, up, down). Tras el entrenamiento, el adaptador se fusiono con los pesos base, produciendo un unico modelo denso en BF16.

El conjunto de entrenamiento consta de 5.801 filas, de las cuales 5.501 son identicas a una mezcla de "source-screening" v0.21 y 300 fueron reemplazadas por ejemplos de conocimiento medico esencial del dataset AIHub-71875. La seleccion de estos 300 ejemplos fue determinista (semilla 20260829), sin filtrado por calidad ni puntuaciones. El entrenamiento consistio en una sola epoca con funcion de perdida de entropia cruzada solo sobre las respuestas del asistente. Se uso el optimizador AdamW fusionado con learning rate 5e-5, programacion lineal sin warmup, batch efectivo de 8 (per-device 1, acumulacion 8), longitud maxima de secuencia de 2048 y precision BF16. No se aplico packing ni se utilizaron datos de evaluacion publica como KMMLU-Pro, CLIcK, HLE, SNU Ko-MuSR, Com2-main u Original MuSR como datos de entrenamiento. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en coreano: el modelo produce texto coherente y contextualizado en coreano, dado que fue entrenado exclusivamente en este idioma.
- Conversacion multi-turno: al usar la plantilla de chat oficial del tokenizador A.X, puede mantener dialogos estructurados con roles de usuario y asistente.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, aunque su rendimiento en tareas complejas puede verse limitado por el pequeño volumen de datos de ajuste.
- Conocimiento medico esencial: los 300 ejemplos de AIHub-71875 aportan informacion basica sobre temas de salud y medicina, aunque no debe considerarse un modelo medico especializado.
- Evaluacion controlada: el modelo esta disenado para ser usado en experimentos de investigacion y comparacion de variantes SFT, no para produccion.

No se dispone de informacion sobre capacidades de tool calling, agentes, vision u otras modalidades. El modelo es exclusivamente textual.

## Casos de uso

- Investigacion academica en PLN coreano: el modelo permite estudiar el efecto de incorporar dominios especificos (como medicina) en un ajuste fino de bajo recurso, comparando su rendimiento con otras variantes del mismo proyecto.
- Evaluacion comparativa de modelos SFT: al ser parte de una serie de experimentos con distintas mezclas de datos, es util para medir la sensibilidad del modelo base a cambios en el conjunto de entrenamiento.
- Prototipado de asistentes conversacionales en coreano: dado su soporte de chat, puede servir para crear demos o prototipos de chatbots en entornos de investigacion, aunque con cautela por su naturaleza experimental.
- Analisis de datos medicos textuales en coreano: el conocimiento medico esencial incorporado permite explorar tareas de extraccion o clasificacion de informacion sanitaria, siempre como herramienta de apoyo y no como sustituto profesional.
- Pruebas de inferencia con diferentes frameworks: al estar en formato safetensors y ser compatible con Transformers y vLLM, es adecuado para probar pipelines de despliegue en entornos de desarrollo.
- Generacion de datos sinteticos en coreano: puede utilizarse para crear ejemplos de texto coreano en dominios generales o medicos basicos, aunque la calidad debe verificarse manualmente.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluacion local (no oficiales del K-AI Leaderboard) utilizando una suite canonica con 21.962 filas por modelo y sondas libres y restringidas B1. Los resultados de exactitud parseada con restriccion B1 son los siguientes:

| Benchmark | Resultado |
|---|---|
| KMMLU-Pro | 40,29 % |
| CLIcK | 64,56 % |
| HLE (Ko) | 4,68 % |
| SNU Ko-MuSR | 56,80 % |
| Com2-main (Ko) | 52,20 % |
| Media de cinco ejes | 43,71 % |

No se han publicado comparaciones con otros modelos en la informacion disponible. Estos valores son locales y no deben interpretarse como puntuaciones oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 14,5 GB (tamano del repositorio). Con cuantizacion a 8 bits, se reduce a unos 7,3 GB; con 4 bits, a unos 3,6 GB.
- GPU recomendadas: para BF16 sin cuantizar, se necesitan GPUs con al menos 16 GB de VRAM, como NVIDIA A100, RTX 4090 o A6000. Con cuantizacion 4-bit, puede ejecutarse en GPUs consumer de 8 GB como RTX 3070/4060.
- Compatibilidad con GPUs consumer: si, con cuantizacion adecuada (por ejemplo, GGUF Q4_K_M via llama.cpp u Ollama).
- Opciones de despliegue: Transformers con AutoModelForCausalLM, vLLM, llama.cpp, Ollama, TGI. El modelo no requiere trust_remote_code.
- Latencia y throughput: no se proporcionan datos especificos. En una RTX 4090 con cuantizacion 4-bit, se puede esperar una generacion de decenas de tokens por segundo, pero son estimaciones generales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente este modelo con alternativas de la misma categoria. El unico punto de referencia conocido es el modelo base `skt/A.X-3.1-Light`, del cual es un ajuste fino. Dado que no se han publicado resultados de otros modelos en las mismas condiciones de evaluacion, no es posible establecer una comparativa rigurosa. Se recomienda consultar el repositorio del modelo base para conocer sus caracteristicas y rendimiento.

## Limitaciones y advertencias

- Modelo experimental: su proposito es la investigacion y evaluacion controlada, no el uso en produccion. Puede producir errores factuales y alucinaciones.
- Datos de entrenamiento limitados: solo 5.801 filas, lo que restringe la generalizacion y el conocimiento del mundo.
- Dominio exclusivamente coreano: no soporta otros idiomas, lo que limita su aplicabilidad internacional.
- Contexto limitado a 2048 tokens: puede no ser suficiente para tareas que requieran contexto largo, como documentos extensos.
- Conocimiento medico basico: los 300 ejemplos medicos no convierten al modelo en un sistema de asesoria medica fiable; no debe usarse como sustituto de profesionales de la salud, derecho o finanzas.
- Terminos de AI Hub: los datos de entrenamiento estan sujetos a los terminos de uso del dataset AIHub-71875, que pueden imponer restricciones adicionales a la redistribucion o uso comercial.
- Sin garantias de rendimiento: los resultados de evaluacion son locales y no oficiales; no hay evidencia de robustez en escenarios reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v0_21_source_screen_essential_medical_300
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Articulo de noticias sobre SKT A.X 3.1 Light: https://www.rcrwireless.com/20250714/ai/sk-telecom-ai-3 (referencia externa)
