# wrldsuksgo2mars/GLM-5.2-EXL3-K3-calibrated-v1

## Resumen

Este repositorio contiene una variante cuantizada del modelo GLM-5.2 de Z.ai, desarrollada por TJ Purtell (wrldsuksgo2mars) para el runtime GLMRT. Se trata de una cuantizacion EXL3 con 3 bits fisicos de trellis (K3) aplicada exclusivamente a los 256 expertos enrutados de las capas 3 a 77, mientras que las capas densas, atencion, routers, expertos compartidos, embeddings, head y la capa nativa MTP conservan sus tensores originales. El modelo base GLM-5.2 es un MoE de 744B parametros que destaca por su control de nivel de esfuerzo y su rendimiento en tareas agenticas de codificacion.

La cuantizacion se calibró con 1.080.625 tokens (texto general en ingles y chino, codigo, razonamiento matematico y salida estructurada) y reduce el payload de los expertos enrutados a 254 GiB en total, con 64 GiB residentes por rango en despliegue TP4. El artefacto está pensado exclusivamente para el camino SparkInfer SM121 EXL3 K3 TP4 de GLMRT; no se reivindica compatibilidad con otros runtimes EXL3. Los datos de calificacion muestran una velocidad de decodificacion ponderada de 28.679 tokens/s, un 6,2% superior a la referencia NVFP4, con un error de proyeccion relativo ponderado por Hessiana de 0,0063.

La licencia es MIT, heredada del modelo base, y los idiomas soportados son ingles y chino. El repositorio ocupa 330 GB y se actualizó por última vez el 25 de agosto de 2026. No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible; las métricas reportadas se centran en calidad de cuantizacion y rendimiento de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 256 expertos enrutados por capa (capas 3-77), capas densas, atencion, routers, expertos compartidos, embeddings, head y capa MTP nativa |
| Parametros totales | 164.921.518.080 (representacion cuantizada EXL3 K3; el modelo base GLM-5.2 tiene 744B parametros) |
| Parametros activos | no disponible (el modelo base activa un subconjunto de los 256 expertos por capa, tipicamente top-8) |
| Longitud de contexto | 262.144 tokens (segun benchmarks de prefill reportados) |
| Tipos de cuantizacion | EXL3 K3 (3 bits fisicos de trell por peso de experto enrutado); codebook MCG; capas densas y atencion en precision nativa |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (tensores EXL3 trellis para expertos; tensores nativos para el resto) |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 es un MoE de 744B parametros desarrollado por Z.ai, con 256 expertos enrutados por capa en las capas 3 a 77, tres capas densas iniciales, y una capa nativa de prediccion multi-token (MTP) que permite decodificacion especulativa. Esta variante cuantizada sustituye únicamente los 256 expertos enrutados de las capas 3-77 por tensores EXL3 K3 MCG (`trellis/suh/svh/mcg`), conservando los tensores originales de las capas densas, atencion, routers, expertos compartidos, embeddings, head y MTP.

La calibracion utilizo 1.080.625 tokens del tokenizador de GLM-5.2, abarcando texto general en ingles y chino, trabajo de codigo y agente, razonamiento matematico con terminacion, y salida estructurada. La cobertura dispersa sigue rutas naturales top-8, con recuperacion determinista de routers adyacentes para expertos deficientes y un residuo Hessiano isotropico registrado explícitamente para cualquier deficit restante. El cuantizador es el fork GLMRT GPTQModel con contenido anclado. El artefacto usa una representacion de experto residente unica en cada uno de los cuatro rangos Spark TP; el runtime no mantiene copias nativas y EXL3 residentes simultaneamente.

## Capacidades

- Generacion de texto conversacional en ingles y chino con calidad equivalente al modelo base GLM-5.2.
- Razonamiento multi-step y matemático, con soporte para tareas de razonamiento de larga duracion (long-horizon tasks).
- Codificacion agente y tool calling: puntuacion de tool-call de 125/138 puntos, un 4,2% superior a la referencia NVFP4 (120/138).
- Control de nivel de esfuerzo (effort level control) del modelo base, que permite equilibrar capacidad frente a coste computacional.
- Decodificacion especulativa mediante capa MTP nativa y dSpark speculation, con tasa de aceptacion de borradores del 72,65%.
- Contexto largo de hasta 262.144 tokens, adecuado para tareas que requieren ventanas de contexto extensas.
- Capacidades multilingues limitadas a ingles y chino; no se reivindica soporte para otros idiomas.

## Casos de uso

- **Servicio de modelos MoE a gran escala en produccion**: el modelo está disenado para el runtime GLMRT con SparkInfer SM121 EXL3 K3 TP4, permitiendo servir un MoE de 744B parametros con 64 GiB de residencia por rango en 4 GPU, reduciendo el payload total de expertos a 254 GiB.
- **Agentes de codificacion en entornos de integracion continua**: gracias al tool calling y al razonamiento multi-step, puede integrarse en pipelines de CI/CD para generacion de codigo, revision de cambios y resolucion de incidencias, con un rendimiento de tool-call superior al de NVFP4.
- **Analisis de documentos de largo contexto**: con 262K tokens de contexto, permite procesar documentacion extensa, contratos o codigo fuente de repositorios completos en una sola pasada.
- **Asistencia conversacional bilingue**: soporte nativo de ingles y chino para sistemas de atencion al cliente o asistentes corporativos en entornos multilingües.
- **Razonamiento matematico y cientifico**: la calibracion incluye tareas de razonamiento matematico con terminacion, lo que lo hace adecuado para sistemas de tutoria o analisis de datos complejos.
- **Optimizacion de coste de inferencia**: la cuantizacion EXL3 K3 ofrece una velocidad de decodificacion ponderada un 6,2% superior a NVFP4 y un prefill mas rapido en configuraciones de contexto corto, reduciendo el coste por token en despliegues de alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos reportados son de calificacion del artefacto cuantizado frente a la referencia NVFP4 del mismo modelo base, en el runtime GLMRT.

**Decodificacion y aceptacion**

| Workload | NVFP4 | EXL3 | Ratio |
|---|---:|---:|---:|
| Decodificacion ponderada | 27.016 tok/s | 28.679 tok/s | 1.062x |
| Repeticion Orchid | 64.309 tok/s | 71.439 tok/s | 1.111x |
| Borradores aceptados dSpark | 76.61% | 72.65% | 0.948x |

**Prefill (seleccion de filas representativas)**

| Contexto | Filas prefill | NVFP4 tok/s | EXL3 tok/s | Ratio |
|---:|---:|---:|---:|---:|
| 0 | 1.024 | 590.0 | 700.7 | 1.188x |
| 0 | 32.768 | 1.773.3 | 1.709.7 | 0.964x |
| 32.768 | 32.768 | 1.684.1 | 1.684.9 | 1.000x |
| 131.072 | 32.768 | 1.484.3 | 1.498.6 | 1.010x |
| 262.144 | 32.768 | 1.290.8 | 1.306.8 | 1.012x |

Ratio minimo de prefill por celda: 0.796x. Suelo de prefill seleccionado: 0.790x respecto a NVFP4.

**Herramientas y arranque**

| Metrica | Valor |
|---|---|
| Puntuacion tool-call | 125/138 puntos (NVFP4: 120/138; 1.042x) |
| Precarga de expertos residentes | 17.212,3 ms (NVFP4: 24.551,2 ms; 0.701x) |
| Handoff completo de servicio de expertos | 17.712,4 ms (NVFP4: 24.975,8 ms; 0.709x) |

**Evidencia estructural**

| Metrica | Valor |
|---|---|
| Proyecciones enrutadas cuantizadas | 57.600 |
| Tensores EXL3 | 230.400 |
| Tensores nativos comparados byte a byte | 1.985 |
| Payload EXL3 | 254.00 GiB |
| Payload residente TP4 por Spark | 64.00 GiB |
| Error de proyeccion relativo ponderado por Hessiana | 0.0063075206 |

## Requisitos de hardware

- **Despliegue TP4**: requiere 4 rangos Spark TP, cada uno con 64 GiB de payload residente (254 GiB total de payload EXL3).
- **GPU recomendadas**: el modelo está disintado para el camino SparkInfer SM121 EXL3 K3 TP4 de GLMRT; no se especifican modelos concretos de GPU, pero por el tamano del payload se requieren GPU con al menos 64 GiB de VRAM por rango (clase A100 80GB o H100 80GB).
- **Consumo**: limite de potencia de 400W en el coordinador durante la calificacion.
- **Compatibilidad**: no se reivindica compatibilidad con otros runtimes EXL3 ni con vLLM, llama.cpp, Ollama o TGI; el artefacto esta pensado exclusivamente para GLMRT.
- **Rendimiento**: decodificacion ponderada de 28.679 tok/s y prefill de hasta 1.709.7 tok/s en contexto 32.768 con 32.768 filas de prefill.
- **Arranque**: tiempo de preload de expertos de 17.212,3 ms y handoff completo en 17.712,4 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| zai-org/GLM-5.2 (base) | 744B | 262.144 tokens | Precision completa | MIT | safetensors |
| wrldsuksgo2mars/GLM-5.2-EXL3-K3-calibrated-v1 | 164,9B (EXL3 K3) | 262.144 tokens | EXL3 3 bits | MIT | safetensors |
| Unsloth GGUF 2-bit de GLM-5.2 (referencia externa) | ~744B (cuantizado) | no disponible | GGUF 2-bit dinamico | MIT | GGUF |

El modelo base GLM-5.2 se posiciona en rendimiento agente entre Claude Opus 4.7 y Claude Opus 4.8 bajo presupuestos de tokens similares, segun el blog de Z.ai. Esta variante cuantizada no ofrece benchmarks estandar comparativos propios, por lo que no se puede verificar su rendimiento relativo frente a alternativas como DeepSeek-V4-Pro-0813-EXL3-K2-calibrated-v1, tambien del mismo autor.

## Limitaciones y advertencias

- **Runtime restringido**: el artefacto solo es compatible con GLMRT SparkInfer SM121 EXL3 K3 TP4; no se garantiza funcionamiento con otros runtimes EXL3 ni con el stack de Transformers generico.
- **Perdida de precision**: la cuantizacion a 3 bits introduce un error de proyeccion relativo ponderado por Hessiana de 0,0063, que puede afectar a tareas sensibles a la precision numerica.
- **Riesgo de alucinacion**: al ser un modelo de lenguaje generativo, existe riesgo inherente de alucinacion, especialmente en tareas de razonamiento o generacion de codigo sin verificacion externa.
- **Idiomas limitados**: solo soporta ingles y chino; no hay soporte para espanol, frances, aleman u otros idiomas.
- **Tasa de aceptacion de borradores reducida**: la aceptacion de borradores dSpark es inferior a NVFP4 (72,65% frente a 76,61%), lo que puede reducir la eficiencia de la decodificacion especulativa en ciertos workloads.
- **Prefill en configuraciones especificas**: en contextos de 32.768 tokens con prefill de 1.024 filas, el rendimiento es un 20,4% inferior al NVFP4 (ratio 0,796x).
- **Sin benchmarks de calidad estandar**: no se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks comparativos, lo que impide evaluar el impacto de la cuantizacion en la calidad de salida.
- **Licencia**: aunque la licencia es MIT, el uso comercial debe verificar los terminos del modelo base GLM-5.2 de Z.ai y las condiciones de uso del runtime GLMRT.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/wrldsuksgo2mars/GLM-5.2-EXL3-K3-calibrated-v1)
- [Modelo base GLM-5.2 de Z.ai](https://huggingface.co/zai-org/GLM-5.2)
- [Blog de Z.ai sobre GLM-5.2](https://z.ai/blog/glm-5.2)
- [Guia de ejecucion local de GLM-5.2 (insiderllm.com)](https://insiderllm.com/guides/run-glm-5-2-locally/)
- [Guia de ejecucion local de GLM-5.2 (codersera.com)](https://codersera.com/blog/how-to-run-glm-5-2-locally-2026/)
- [Perfil del autor en Hugging Face](https://huggingface.co/wrldsuksgo2mars)
- [Variante similar del mismo autor: DeepSeek-V4-Pro-0813-EXL3-K2-calibrated-v1](https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4-Pro-0813-EXL3-K2-calibrated-v1)
