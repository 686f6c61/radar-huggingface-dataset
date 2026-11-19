# UGREENDEV/RK1828-LLM-Qwen3-30B-A3B

## Resumen

RK1828-LLM-Qwen3-30B-A3B es un paquete de artefactos de despliegue para el modelo Qwen3-30B-A3B de Alibaba Cloud, adaptado por UGREENDEV para ejecutarse sobre la NPU Rockchip RK1828 mediante el runtime RKNN. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion y cuantizacion de los pesos originales de Qwen3-30B-A3B a un formato propietario (w4a16) distribuido en cinco segmentos que se reparten entre cinco tarjetas RK1828.

El modelo subyacente es un transformer de tipo mixture-of-experts (MoE) con 30.000 millones de parametros totales, del que solo se activa una fraccion por token, lo que lo hace adecuado para inferencia en hardware de borde con recursos limitados. La configuracion publicada fija una ventana de contexto de 20.480 tokens por segmento y una cache KV cuantizada a int4.

Su relevancia reside en que demuestra la viabilidad de ejecutar un MoE de 30B en silicio de borde (NPU Rockchip) sin GPU dedicada, con un consumo y un coste muy inferiores a los de un despliegue en centro de datos. La ficha se centra en los datos verificables del repositorio; muchos detalles del modelo original (composicion del dataset, benchmarks, idiomas) no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), modelo base Qwen3-30B-A3B |
| Parametros totales | 30B (heredado del modelo fuente Qwen3-30B-A3B) |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | 20.480 tokens por segmento (5 segmentos) |
| Tipos de cuantizacion | Pesos w4a16 en los 5 segmentos; cache KV int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (artefactos de despliegue para NPU Rockchip RK1828); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-30B-A3B, es un transformer con capas de mezcla de expertos (MoE) que activa un subconjunto de parametros por token, lo que reduce el coste computacional frente a un modelo denso de 30B. El repositorio no aporta detalles sobre el numero de expertos, la proporcion de activacion, el numero de tokens de entrenamiento ni sobre si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card original de Qwen y no estan incluidos aqui.

La innovacion tecnica de este repositorio es el pipeline de despliegue: los pesos se convierten a RKNN y se particionan en cinco segmentos (`llm_seg0` a `llm_seg4`), cada uno asignado a una NPU RK1828 con 8 nucleos y una ventana de contexto de 20.480 tokens. Los pesos se cuantizan a w4a16 (4 bits para pesos, 16 bits para activaciones) y la cache KV a int4, lo que reduce el footprint de memoria lo suficiente para repartir el modelo entre cinco tarjetas. El runtime requerido es RKNN v1.2.0.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3-30B-A3B (no verificados en esta configuracion).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta conversion.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidad especial: despliegue en NPU de borde con contexto de 20k y cache KV int4, orientado a inferencia local sin GPU.

## Casos de uso

- Inferencia de borde en dispositivos UGREEN: el paquete esta pensado para ejecutarse en hardware NAS o dispositivos domesticos de UGREEN con NPU RK1828, permitiendo un asistente conversacional local sin depender de la nube.
- Asistente conversacional offline: con 20.480 tokens de contexto por segmento, puede mantener conversaciones multi-turno y procesar documentos de longitud media en local.
- Procesamiento de documentos en el dispositivo: resumen y extraccion de informacion de ficheros alojados en un NAS, sin enviar datos a terceros.
- Automatizacion de tareas de texto en entornos sin conectividad: clasificacion, reescritura y generacion de respuestas en despliegues aislados.
- Prototipado de aplicaciones de IA en silicio Rockchip: sirve como referencia para validar pipelines RKNN con modelos MoE de 30B antes de pasar a produccion.
- Evaluacion de coste/rendimiento de MoE en borde: util para comparar el rendimiento de un MoE de 30B cuantizado a w4a16 frente a alternativas densas en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU: cinco tarjetas Rockchip RK1828, cada una con 8 nucleos asignados a un segmento del modelo.
- Runtime: RKNN v1.2.0 (version obligatoria segun la configuracion publicada).
- VRAM/RAM: no disponible; el repositorio ocupa 21,1 GB en total, pero no se detalla el reparto de memoria por tarjeta.
- GPU consumer: no aplica; el paquete esta compilado para NPU Rockchip, no para CUDA ni ROCm.
- Opciones de despliegue: runtime RKNN de Rockchip; no se soportan vLLM, llama.cpp, Ollama ni TGI con estos artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen3-30B-A3B (este) | 30B (MoE) | 20.480 por segmento | RKNN w4a16, KV int4 | Apache 2.0 | 5 x NPU RK1828 |
| Qwen3-30B-A3B (original) | 30B (MoE) | no disponible en esta ficha | safetensors | Apache 2.0 | GPU (CUDA) |
| Alternativas de borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otras conversiones de borde no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo original es el formato y el hardware: el original se ejecuta en GPU, mientras que esta version esta empaquetada para NPU Rockchip con cuantizacion w4a16.

## Limitaciones y advertencias

- Artefactos especificos de hardware: solo funcionan en NPU RK1828 con runtime RKNN v1.2.0; no son portables a GPU ni a CPU convencional.
- La cuantizacion w4a16 y la cache KV int4 pueden degradar la calidad respecto al modelo original en tareas de razonamiento complejo o generacion de codigo.
- No se declaran idiomas soportados; el rendimiento multilingue no esta verificado en esta configuracion.
- No hay benchmarks publicados para esta conversion, por lo que no se puede garantizar un nivel de calidad concreto.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta version.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribucion a Alibaba Cloud y los avisos de licencia al redistribuir; el runtime y SDK de Rockchip se distribuyen bajo sus propios terminos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3-30B-A3B
- Modelo fuente: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Descarga via ModelScope: `modelscope download --model UGREENDEV/RK1828-LLM-Qwen3-30B-A3B --revision master`
- Documentacion de Rockchip RKNN: no disponible en la informacion proporcionada.
