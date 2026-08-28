# thrivepath/Affine-5DczYgY8r1-genesis

## Resumen

El repositorio `thrivepath/Affine-5DczYgY8r1-genesis` contiene una publicacion comunitaria del modelo Qwen3.6-35B-A3B de Alibaba Qwen, la primera variante open-weight de la serie Qwen3.6. Se trata de un modelo de lenguaje causal con encoder de vision (pipeline image-text-to-text) y arquitectura MoE hibrida: 35.107 millones de parametros totales, de los cuales solo 3.000 millones se activan por token. Combina Gated DeltaNet (atencion lineal), atencion gated clasica y un modulo MoE con 256 expertos, lo que permite un rendimiento elevado con un coste computacional reducido.

El modelo esta orientado a tareas de codificacion agente, razonamiento a nivel de repositorio y flujos de trabajo de frontend. Soporta una ventana de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1.010.000, e incorpora una opcion de "thinking preservation" que conserva el contexto de razonamiento de mensajes historicos para desarrollo iterativo. Se distribuye bajo licencia Apache 2.0 y es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (Gated DeltaNet + Gated Attention + MoE) con encoder de vision |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens nativa, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es hibrida e innovadora, combinando tres mecanismos de procesamiento. La configuracion de capas sigue el patron `10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`, con 40 capas en total. El Gated DeltaNet es un mecanismo de atencion lineal con 32 cabezas para V y 16 para QK, con dimension de cabeza 128, que reduce el coste computacional frente a la atenc
