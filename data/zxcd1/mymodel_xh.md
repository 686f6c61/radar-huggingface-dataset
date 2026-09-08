# zxcd1/MyModel_xh

## Resumen

`zxcd1/MyModel_xh` es un modelo de lenguaje de 1.777.088.000 parámetros desarrollado por zxcd1 mediante fine-tuning del modelo base `unsloth/DeepSeek-R1-Distill-Qwen-1.5B-unsloth-bnb-4bit`. Se trata de un modelo destilado de DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B, entrenado con las librerías Unsloth y TRL de Hugging Face. Según la model card, el entrenamiento se realizó 2 veces más rápido gracias a Unsloth.

El modelo está pensado para generación de texto en inglés y, al heredar las capacidades de razonamiento de DeepSeek-R1, puede abordar tareas de instrucción y conversación. Su tamaño compacto lo hace adecuado para entornos con recursos limitados, y su licencia Apache 2.0 permite uso comercial. No se ha publicado información sobre el dataset de fine-tuning ni sobre benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/DeepSeek-R1-Distill-Qwen-1.5B-unsloth-bnb-4bit`, que a su vez es una destilación de DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B. La arquitectura resultante es un transformer decoder-only, sin componentes de mezcla de expertos (MoE). El entrenamiento se llevó a cabo con Unsloth y la librería TRL de Hugging Face, lo que, según la model card, permitió una aceleración de 2x en comparación con un fine-tuning estándar.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de alineación (RLHF, DPO, etc.). Tampoco se documentan innovaciones técnicas más allá del uso de Unsloth para optimizar el proceso de fine-tuning.

## Capacidades

- Generacion de texto en ingles, orientada a tareas de instruccion y conversacion.
- Razonamiento paso a paso heredado del modelo base DeepSeek-R1-Distill-Qwen-1.5B.
- No se ha documentado soporte de tool calling, function calling, vision ni audio en la informacion disponible.
- Capacidades multilingues limitadas: solo ingles segun los metadatos.
- Aptitud para tareas de razonamiento basico y generacion de codigo, aunque sin benchmarks publicados que lo confirmen.

## Casos de uso

- Asistentes conversacionales en ingles para atencion al cliente: el modelo puede gestionar dialogos multi-turno gracias a su naturaleza de instruccion, y su tamano reducido permite desplegarlo en infraestructuras modestas.
- Razonamiento en dispositivos edge: al tener 1.78B parametros, puede ejecutarse en GPUs de gama media o en cuantizaciones 4-bit, lo que lo hace apto para entornos con recursos limitados.
- Generacion de codigo basico: al ser un destilado de DeepSeek-R1, se espera que mantenga capacidades de razonamiento y generacion de codigo, aunque no hay benchmarks que lo confirmen.
- Tutoria educativa: puede explicar conceptos paso a paso y resolver problemas de matematicas o logica, gracias a su entrenamiento de razonamiento.
- Analisis y resumen de documentos: sirve para tareas de extraccion de informacion y resumen en ingles, con bajo coste de inferencia.
- Prototipado y experimentacion: al estar fine-tuned con Unsloth, es un modelo adecuado para ajustes rapidos y pruebas de concepto en investigacion.
- Chatbots internos para empresas: con licencia Apache 2.0, puede integrarse en herramientas internas sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para pesos en FP16 (3,6 GB), se requieren al menos 4-5 GB de VRAM; con cuantizacion 4-bit, aproximadamente 1-2 GB.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4090, A100, o cualquier GPU con mas de 5 GB de VRAM.
- Si cabe en GPUs de consumo: si, en RTX 3060, RTX 4060, etc.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zxcd1/MyModel_xh | 1.777.088.000 | No disponible | No disponible | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.777.088.000 | No disponible | No disponible | MIT | Hugging Face |
| Qwen2.5-1.5B | 1.540.000.000 | No disponible | No disponible | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | 7.600.000.000 | No disponible | No disponible | MIT | Hugging Face |

## Limitaciones y advertencias

- Sesgos: el dataset de fine-tuning no esta documentado, por lo que pueden existir sesgos no identificados.
- Alucinacion: al ser un modelo pequeno, el riesgo de alucinacion es significativo, especialmente en tareas de razonamiento complejo.
- Contexto: no se ha especificado la longitud de contexto; se recomienda validar antes de usar en aplicaciones que requieran ventanas largas.
- Idioma: solo soporta ingles segun los metadatos; no se ha verificado el rendimiento en espanol.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base DeepSeek-R1-Distill-Qwen-1.5B puede tener licencias adicionales (MIT para DeepSeek-R1, Apache 2.0 para Qwen2.5). Revisar las licencias de los componentes.
- Produccion: al no haber benchmarks publicados, no se recomienda su uso en sistemas criticos sin una evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zxcd1/MyModel_xh
- Perfil del autor: https://huggingface.co/zxcd1
- Unsloth: https://github.com/unslothai/unsloth
