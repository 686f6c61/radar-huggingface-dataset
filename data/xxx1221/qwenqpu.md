# xxx1221/QwenQPU

## Resumen

QwenQPU es un repositorio experimental publicado en Hugging Face por el usuario `xxx1221` que, en el momento de su creación, contiene únicamente el checkpoint de lenguaje sin modificar del modelo `divagr1925/Qwen3.5-4B-Qwenputer`. No se trata, por tanto, de un modelo entrenado de nuevo ni de un checkpoint con el módulo cuántico fusionado en el decodificador, sino de un espacio de publicación en preparación para un runtime compuesto que añadirá un módulo de simulación cuántica de vector de estado sobre el modelo base.

La propuesta técnica del autor consiste en ejecutar un módulo cuántico de parámetros fijos de forma separada al decodificador original, con planificación explícita en el host, sin integrarse en el estado KV ni en el grafo del transformer. La ejecución cuántica es, según la propia model card, simulación clásica ideal, no cómputo cuántico real.

El interés actual del repositorio es limitado desde el punto de vista práctico: los pesos publicados son los del modelo base, el módulo cuántico no está subido y el autor reconoce que el release está incompleto. Resulta relevante como artefacto de investigación sobre arquitecturas híbridas clásico-cuánticas simuladas, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 text (transformer decoder-only) con módulo adicional de simulación cuántica de vector de estado, no fusionado |
| Parametros totales | 9.357.602.496 (según safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (8 shards, 18.715.279.016 bytes) |

## Arquitectura y entrenamiento

El repositorio hereda el checkpoint de lenguaje de `divagr1925/Qwen3.5-4B-Qwenputer`, revisión `2d9068508f2b680badb7abcded96fdd107e9ba5d`, con ocho shards de pesos, tokenizer, configuración y licencia Apache-2.0 originales. Sobre esa base, el autor describe un módulo cuántico adicional de estado fijo con planificación explícita en el host. Dicho módulo no se fusiona en el decodificador ni en el estado KV, de modo que una carga convencional con `AutoModel` solo instancia el componente de lenguaje heredado.

No se documenta ningún proceso de entrenamiento adicional, ni número de tokens, ni composición del dataset, ni fases de RLHF o DPO. El autor indica explícitamente que el repositorio no es un checkpoint cuántico entrenado de nuevo ni un modelo con el decodificador fusionado, y que la ruta de ejecución cuántica es simulación clásica ideal, no el binario CPU compilado del proyecto upstream. La innovación declarada es, por tanto, de integración en tiempo de ejecución, no de entrenamiento.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B-Qwenputer, en la medida en que el checkpoint de lenguaje esté intacto.
- Carga estándar del componente de lenguaje mediante `AutoModel`; el módulo cuántico requiere una ruta de ejecución específica del runtime compuesto.
- Simulación cuántica de vector de estado como módulo separado, con planificación explícita en el host (según la documentación del autor).
- Soporte de tool calling, function calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.
- Modo thinking o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre arquitecturas híbridas clásico-cuánticas: el repositorio sirve como punto de partida para estudiar cómo se acopla un módulo de simulación cuántica a un decoder transformer sin fusionar estados, usando el runtime descrito en el repositorio de GitHub del autor.
- Reproducción de experimentos de simulación de vector de estado: los ejemplos pequeños verificados enlazados por el autor permiten validar la ruta de ejecución cuántica antes de escalar a circuitos mayores.
- Evaluación de coste de planificación en host: el diseño con scheduling explícito permite medir la sobrecarga de orquestación entre el modelo de lenguaje y el simulador cuántico en entornos de laboratorio.
- Docencia de computación cuántica simulada: el módulo de estado fijo y los ejemplos verificados pueden usarse para ilustrar la diferencia entre simulación clásica ideal y ejecución en hardware cuántico.
- Auditoría de licencias y procedencia de pesos: al conservar tokenizer, configuración y licencia Apache-2.0 originales, el repo facilita verificar la cadena de autoría del checkpoint heredado.
- Integración en pipelines de investigación con `AutoModel`: dado que la carga estándar solo instancia el componente de lenguaje, puede usarse como baseline del modelo base mientras se desarrolla el runtime compuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9.357.602.496 parámetros en safetensors, una carga en bf16 requeriría del orden de 18,7 GB solo para pesos, más overhead de activaciones y estado KV; en cuantización de 8 bits bajaría a unos 9,4 GB y en 4 bits a unos 4,7 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un checkpoint en bf16 encajaría en A100 40 GB, H100 80 GB o L40S 48 GB; en consumer, quedaría al límite en RTX 4090 24 GB y requeriría cuantización para GPUs de 16 GB o menos.
- Compatibilidad con GPU consumer: no confirmada por el autor; dependerá de la cuantización aplicada por el usuario, no incluida en el repo.
- Opciones de despliegue: la model card indica que `AutoModel` solo carga el componente de lenguaje; la ruta cuántica requiere el runtime del repositorio de GitHub del autor. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| QwenQPU (este repo) | 9.357.602.496 | no disponible | Apache-2.0 | Release incompleto, módulo cuántico no subido |
| divagr1925/Qwen3.5-4B-Qwenputer (base) | no disponible en la información | no disponible | no disponible en la información | Checkpoint de lenguaje heredado |
| Qwen3.5-4B (familia Qwen) | ~4B (según denominación) | no disponible en la información | no disponible en la información | Modelo de referencia de la familia |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio no contiene el release completo: el módulo cuántico y el runtime compuesto no están comprometidos, según reconoce el autor.
- Los pesos publicados son los del checkpoint heredado sin modificar; no hay evidencia de que el modelo resultante aporte capacidades distintas al base.
- La "ejecución cuántica" es simulación clásica ideal, no cómputo en hardware cuántico; el propio autor lo explicita.
- Una carga con `AutoModel` no instancia el módulo cuántico, lo que puede llevar a resultados distintos de los esperados si se asume que el modelo completo está activo.
- No se documentan sesgos, tasas de alucinación, idiomas soportados ni límites de contexto; imposible evaluar riesgos de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- La licencia Apache-2.0 se hereda del checkpoint original; cualquier uso comercial debe verificar también las condiciones del modelo base `divagr1925/Qwen3.5-4B-Qwenputer` y de la familia Qwen subyacente.
- El identificador de fecha de creación (2026-11-03) es posterior a la fecha actual de referencia habitual, lo que conviene tener en cuenta al evaluar la madurez del proyecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xxx1221/QwenQPU
- Modelo base: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Código fuente y demo original: https://github.com/xi-zhao/QwenQPU
- Documentación de arquitectura: https://github.com/xi-zhao/QwenQPU/blob/main/docs/ARCHITECTURE.md
