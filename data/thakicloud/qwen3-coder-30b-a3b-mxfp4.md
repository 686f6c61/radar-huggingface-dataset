# ThakiCloud/Qwen3-Coder-30B-A3B-MXFP4

## Resumen

Qwen3-Coder-30B-A3B-MXFP4 es una cuantización OCP MXFP4 del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct, publicada por ThakiCloud. El modelo original es un Mixture of Experts (MoE) de 30.5B parámetros totales con 3B activos, especializado en generación de código, razonamiento y tareas de programación. Esta versión cuantizada reduce el peso de 61.1 GB a 17.17 GB (factor 3.56x), manteniendo un rendimiento prácticamente idéntico al del modelo en bf16 en la evaluación HumanEval (0.9268 pass@1).

La relevancia de esta publicación radica en que es una de las primeras implementaciones públicas de MXFP4 para un MoE grande, ejecutándose de forma nativa en los tensor cores FP4 de la arquitectura Blackwell (SM100+). El autor documenta con transparencia que, en vLLM 0.27.1 sobre una B200, esta versión es más lenta que su propia variante NVFP4 (0.66x-0.74x del throughput), debido a la inmadurez de los kernels MXFP4 en el motor de inferencia, no a una limitación del formato. Aun así, supera a la cuantización W4A16 en todos los niveles de concurrencia medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 48 capas, 128 expertos, top-k no especificado |
| Parametros totales | 30.532.122.624 (30.5B) |
| Parametros activos | 3B (segun nomenclatura A3B del modelo base) |
| Longitud de contexto | 256K tokens (modelo base); ejemplo de despliegue usa 8192 |
| Tipos de cuantizacion | MXFP4 (OCP, escala E8M0, bloque de 32 elementos) |
| Idiomas soportados | No disponible en la model card (el modelo base es multilingue, principalmente ingles y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado MXFP4) |

## Arquitectura y entrenamiento

No se trata de un entrenamiento nuevo, sino de una cuantizacion post-entrenamiento del modelo Qwen3-Coder-30B-A3B-Instruct, realizada con la libreria `llm-compressor`. El modelo base es un transformer MoE de Qwen, con 30.5B parametros totales y 3B activos por token, disenado especificamente para tareas de programacion, con soporte de contexto largo (256K tokens). La cuantizacion MXFP4 sigue el estandar OCP, usando escala de bloque de 32 elementos con formato E8M0, frente a la escala de 16 elementos con FP8 E4M3 que emplea la variante NVFP4 del mismo autor.

El proceso de cuantizacion y calibracion esta documentado en el archivo `recipe.yaml` del repositorio. El resultado es un checkpoint que reduce el peso de 61.1 GB a 17.17 GB (3.56x), manteniendo la precision funcional: en HumanEval, el pass@1 es de 0.9268, identico al de la version W4A16 y superior al del propio modelo en bf16 (0.9207), aunque el autor advierte que las diferencias entre formatos (cuatro problemas sobre 164) no son estadisticamente significativas.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, Java, C++, JavaScript, etc.), con soporte de razonamiento paso a paso y depuracion.
- Razonamiento matematico y logico, util para problemas de algoritmia y competiciones de programacion.
- Comprension y generacion de documentacion tecnica, comentarios de codigo y explicaciones de arquitecturas software.
- Soporte de tool calling y function calling (capacidad del modelo base; no verificada especificamente en esta cuantizacion).
- Capacidades multilingues limitadas, principalmente ingles y chino (segun el modelo base; no confirmado en esta version).
- Contexto largo de hasta 256K tokens, adecuado para analisis de repositorios completos o documentacion extensa.
- Ejecucion nativa en tensor cores FP4 de Blackwell (SM100+), sin emulacion ni fallback a formatos de menor precision.

## Casos de uso

- Asistente de programacion integrado en IDE: el modelo puede completar codigo, sugerir refactorizaciones y explicar fragmentos complejos. Su contexto de 256K permite cargar multiples archivos de un proyecto sin perder coherencia.
- Generacion de codigo en pipelines CI/CD: con soporte de tool calling, puede integrarse en flujos automatizados para generar tests, parches o documentacion a partir de diffs de pull requests.
- Analisis de seguridad de codigo: dado un repositorio, puede identificar patrones vulnerables (inyeccion SQL, desbordamiento de buffer) y proponer correcciones, aprovechando la ventana de contexto larga.
- Chatbot de soporte tecnico especializado en desarrollo: responde preguntas sobre APIs, frameworks o errores de compilacion, con capacidad de mantener conversaciones multi-turno extensas.
- Educacion y formacion en programacion: genera ejercicios, corrige soluciones de estudiantes y proporciona explicaciones pedagogicas detalladas.
- Documentacion automatica de codigo legacy: analiza modulos grandes y genera documentacion tecnica estructurada, gracias al contexto largo y la capacidad de razonamiento.

## Benchmarks y rendimiento

El autor publica resultados de HumanEval (evaluacion `humaneval_instruct`, n=164, servido via vLLM) comparando esta cuantizacion con otras del mismo modelo base:

| Modelo | pass@1 | stderr |
|---|---|---|
| bf16 (control) | 0.9207 | 0.0212 |
| FP8 | 0.9146 | 0.0219 |
| W4A16 | 0.9268 | 0.0204 |
| **MXFP4 (esta version)** | **0.9268** | 0.0204 |
| NVFP4 | 0.9024 | 0.0232 |

El autor advierte que la diferencia entre formatos (cuatro problemas sobre 164) no es significativa: "lea la tabla como 'ningun formato es distinguible de otro aqui', no como un ranking".

Tambien se midio el throughput en una B200 con vLLM 0.27.1, entrada de 1746 tokens, salida de 256, temperatura 0:

| Concurrencia | bf16 | FP8 | W4A16 | MXFP4 (esta) | NVFP4 |
|---|---|---|---|---|---|
| 32 | 4454.2 | 3978.8 | 3013.3 | **3357.7** | 5099.2 |
| 64 | 6448.2 | 6054.7 | 4292.4 | **5395.0** | 7608.3 |
| 128 | 8586.2 | 8130.3 | 5427.7 | **7339.8** | 9941.8 |

Eficiencia energetica a concurrencia 128: 10.13 tokens por julio (FP8: 9.48, NVFP4: 12.82).

## Requisitos de hardware

- Requiere GPU con tensor cores FP4 nativos: arquitectura Blackwell (SM100 y superiores). En Hopper (H100, H200) no hay soporte nativo y los numeros anteriores no aplican.
- VRAM estimada: los pesos ocupan 17.17 GB; con overhead de inferencia y KV cache, se recomienda al menos 24 GB de VRAM, aunque la GPU debe ser Blackwell (p.ej., B200 con 192 GB).
- GPU recomendadas: B200, B100, GB200 (y futuras GPUs SM100+).
- No cabe en GPUs de consumo (RTX 4090, etc.) porque carecen de FP4 nativo; ademas, el modelo es demasiado grande para 24 GB sin cuantizaciones adicionales.
- Despliegue: vLLM 0.27.1 o superior (el checkpoint se detecta automaticamente, sin flag `--quantization`). Tambien puede usarse con TGI u otros motores que soporten MXFP4, aunque el autor solo ha validado vLLM.
- Latencia y throughput: en B200, a concurrencia 128, alcanza 7339.8 tokens/s (entrada 1746, salida 256). El primer arranque en un pod nuevo tarda unos 4 minutos en autotuning de kernels FlashInfer (21 perfiles), coste de cold-start no recurrente.

## Comparativa con modelos similares

Comparacion con las otras cuantizaciones del mismo modelo base publicadas por ThakiCloud:

| Caracteristica | MXFP4 (esta) | NVFP4 | FP8 | W4A16 |
|---|---|---|---|---|
| Formato | OCP MXFP4 (E8M0, bloque 32) | NVFP4 (E4M3, bloque 16) | FP8 | W4A16 (pesos 4-bit, activaciones 16-bit) |
| Peso | 17.17 GB | ~17 GB (estimado) | ~30 GB (estimado) | ~17 GB (estimado) |
| Throughput en B200 (conc. 128) | 7339.8 tok/s | 9941.8 tok/s | 8130.3 tok/s | 5427.7 tok/s |
| HumanEval pass@1 | 0.9268 | 0.9024 | 0.9146 | 0.9268 |
| Hardware requerido | Blackwell (FP4 nativo) | Blackwell (FP4 nativo) | Hopper y Blackwell | Hopper y Blackwell |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 |

El autor recomienda: para velocidad en Blackwell, usar NVFP4 (1.22x-1.28x sobre FP8); para estandarizacion OCP MXFP4, esta version; para Hopper o footprint minimo, W4A16; si no se necesita 4-bit, FP8.

## Limitaciones y advertencias

- Requiere hardware Blackwell (SM100+): en GPUs Hopper (H100, H200) no hay soporte nativo FP4 y los datos de rendimiento no aplican.
- Rendimiento inferior a NVFP4 en vLLM 0.27.1 (0.66x-0.74x del throughput), debido a la inmadurez de los kernels MXFP4 en el motor; no es una propiedad del formato.
- Evaluacion limitada: solo HumanEval. No hay evaluacion multilingue, de contexto largo, ni de capacidades agente/tool calling en esta cuantizacion.
- La diferencia en HumanEval entre formatos (cuatro problemas sobre 164) no es estadisticamente significativa; no debe interpretarse como una ventaja real de calidad.
- Cold-start costoso: el primer arranque en un pod nuevo tarda unos 4 minutos en autotuning de kernels FlashInfer; el resultado se cachea en `/root/.cache/flashinfer`.
- Concurrencia 256 medida pero excluida de los ratios por alta variabilidad (12-26%).
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales (no las hay en este caso, es Apache-2.0 sin gating).
- Riesgo de alucinacion en codigo: como cualquier LLM, puede generar codigo incorrecto o inseguro; requiere revision humana en entornos de produccion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-MXFP4)
- [Version NVFP4 del mismo modelo](https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-NVFP4)
- [Version W4A16 del mismo modelo](https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-W4A16)
- [Modelo base Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
- [Articulo arXiv:2509.23202 (referencia sobre MXFP4 vs NVFP4)](https://arxiv.org/abs/2509.23202)
