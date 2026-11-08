# ZeroWw/Qwen3.6-35B-A3B-Uncensored-LoRA-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-LoRA-GGUF es un adaptador LoRA en formato GGUF publicado por el usuario ZeroWw sobre el modelo base Qwen/Qwen3.6-35B-A3B de Alibaba. Su proposito es eliminar los comportamientos de rechazo del modelo original mediante tecnicas de abliteration adaptadas a arquitecturas MoE (mixture of experts), de modo que el modelo resultante responda a peticiones que el modelo base rechazaria por politicas de seguridad.

El modelo base es un transformer con arquitectura MoE de 35.000 millones de parametros totales y 3.000 millones activos por token, con una longitud de contexto declarada de 262K tokens. El adaptador se distribuye como fichero GGUF para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio), y se aplica sobre el modelo base en tiempo de inferencia mediante el flag `--lora`.

El repositorio es muy reciente (creado el 8 de noviembre de 2026) y no registra descargas ni likes en el momento de la consulta. El dato de parametros reportado en safetensors (26.562.560) corresponde al propio adaptador LoRA, no al modelo base, y el tamano del repo (0,1 GB) es coherente con un adaptador de baja dimension y no con un modelo completo cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer; adaptador LoRA |
| Parametros totales | 35B en el modelo base; 26.562.560 en el adaptador LoRA (safetensors) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | 262K tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF (fichero LoRA en formato GGUF); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con 35B parametros totales y 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Sobre esta base, el autor aplica un adaptador LoRA entrenado con tecnicas de abliteration especificas para MoE, orientadas a suprimir las direcciones de activacion asociadas a los rechazos sin reentrenar el modelo completo.

No se dispone de informacion sobre el volumen de datos de entrenamiento del adaptador, la composicion del dataset, el numero de pasos ni si se emplearon tecnicas de RLHF o DPO adicionales. Tampoco se detalla la metodologia exacta de abliteration mas alla de la referencia generica a tecnicas especificas para MoE. El adaptador se distribuye como fichero GGUF independiente y se carga junto al modelo base en llama.cpp mediante el parametro `--lora`.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.6-35B-A3B.
- Respuestas a peticiones que el modelo base rechazaria por politicas de seguridad (comportamiento "uncensored").
- Procesamiento de contexto largo, hasta 262K tokens segun la model card.
- Uso mediante llama.cpp y ecosistema compatible (Ollama, LM Studio).
- Carga como adaptador LoRA sobre el modelo base, sin necesidad de fusionar pesos.
- Capacidades de codigo, matematicas, tool calling o agentes: no confirmadas en la informacion disponible para esta variante concreta.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el adaptador permite estudiar como cambia el comportamiento de un modelo MoE al eliminar los rechazos, comparando respuestas con y sin LoRA sobre el mismo modelo base.
- Analisis de robustez de filtros: util para evaluar la eficacia de mecanismos de moderacion externos cuando el modelo subyacente no incorpora rechazos propios.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa con tematicas sensibles que el modelo base declinaria, en entornos controlados.
- Red teaming de aplicaciones: simular un atacante con un modelo permisivo para probar las defensas de un sistema desplegado.
- Experimentacion con abliteration en arquitecturas MoE: referencia practica para quienes investigan tecnicas de edicion de pesos en modelos con expertos.
- Despliegue local con llama.cpp: al ser un adaptador GGUF ligero (0,1 GB), se puede probar rapidamente sobre el modelo base cuantizado en hardware de consumo, sujeto a la VRAM que requiera el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB, por lo que su coste de almacenamiento es despreciable.
- La VRAM vendra determinada por el modelo base Qwen3.6-35B-A3B cuantizado en GGUF, no por el adaptador.
- Para un MoE de 35B totales y 3B activos, las cuantizaciones de 4 bits suelen situarse en el rango de 18-22 GB, lo que requiere GPU de 24 GB (RTX 3090, RTX 4090) o el uso de offloading parcial a RAM.
- En configuraciones de 8 bits o FP16 el modelo base no cabe en GPU de consumo y requiere A100/H100 o multiples GPU.
- Despliegue previsto con llama.cpp, Ollama y LM Studio; otros motores como vLLM o TGI no estan confirmados para este formato de adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ZeroWw/Qwen3.6-35B-A3B-Uncensored-LoRA-GGUF | 35B totales / 3B activos (base) | 262K | LoRA GGUF | Apache 2.0 | Adaptador sobre Qwen3.6-35B-A3B |
| mudler/Qwen3.6-35B-A3B-uncensored-heretic-APEX-GGUF | 35B | no disponible | GGUF | no disponible | Variante uncensored del mismo modelo base |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B | no disponible | no disponible | no disponible | Otra variante uncensored del mismo modelo base |

Las tres alternativas parten del mismo modelo base Qwen3.6-35B-A3B y difieren en la tecnica de eliminacion de rechazos y en el formato de distribucion. No hay datos de rendimiento comparativo publicados en la informacion disponible.

## Limitaciones y advertencias

- La eliminacion de rechazos implica que el modelo puede generar contenido danino, ilegal o eticamente problematico; no es apto para despliegues orientados al publico sin moderacion externa.
- Riesgo de alucinacion heredado del modelo base, potencialmente agravado al no existir mecanismos de rechazo ante peticiones mal formuladas.
- El adaptador debe cargarse junto al modelo base; usarlo de forma aislada no produce resultados validos.
- Los idiomas soportados no estan documentados en la informacion disponible.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B antes de uso comercial.
- Repositorio sin descargas ni validacion comunitaria en el momento de la consulta; no hay evidencia publica de calidad del adaptador.
- El dato de parametros en safetensors (26,5M) corresponde al adaptador, no al modelo; no debe interpretarse como el tamano del modelo completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ZeroWw/Qwen3.6-35B-A3B-Uncensored-LoRA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Variante alternativa (mudler): https://huggingface.co/mudler/Qwen3.6-35B-A3B-uncensored-heretic-APEX-GGUF
- Variante alternativa (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
