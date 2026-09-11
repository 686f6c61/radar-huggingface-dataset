# TMA-1/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI y publicado como version preliminar dentro de la serie DeepSeek-V4. Cuenta con 284.000 millones de parametros totales y 13.000 millones de parametros activos por token, y esta disenado para trabajar con una longitud de contexto de hasta un millon de tokens. El repositorio analizado, TMA-1/DeepSeek-V4-Flash, es una copia subida por el usuario TMA-1 sobre la publicacion oficial de DeepSeek AI.

Su relevancia actual radica en dos frentes. Por un lado, la arquitectura de atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA) reduce de forma notable el coste de inferencia en contextos muy largos: segun la model card, en el escenario de 1M tokens DeepSeek-V4-Pro necesita solo el 27 % de los FLOPs de inferencia por token y el 10 % del KV cache en comparacion con DeepSeek-V3.2. Por otro, la version Flash mantiene una huella de computo por token propia de un modelo de 13.000 millones de parametros activos, lo que la hace mucho mas desplegable que la variante Pro de 1,6 billones de parametros.

El modelo se distribuye con licencia MIT y pesos en safetensors para la libreria transformers, con una mezcla de precision FP4 (expertos MoE) y FP8 (resto de parametros). No se han publicado en la informacion disponible datos sobre idiomas soportados, cuantizaciones de la comunidad ni resultados de benchmarks de la version instruida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (Compressed Sparse Attention + Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections |
| Parametros totales | 290.944.616.402 segun safetensors del repositorio; la model card declara 284B |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixed en la version Flash (expertos MoE en FP4, resto en FP8); etiquetas del repositorio: 8-bit, fp8; no disponible informacion sobre GGUF, GPTQ o AWQ |
| Idiomas soportados | No disponible en las etiquetas ni en la model card; se evaluan benchmarks en ingles y chino (MMLU, C-Eval, CMMLU, MMMLU) |
| Licencia | MIT |
| Formato de pesos | Safetensors (transformers) |
| Tamano del repositorio | 159,6 GB |
| Autor original | DeepSeek AI; copia publicada por el usuario TMA-1 |
| Fecha de publicacion del repositorio | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash es un transformer disperso de tipo MoE. La innovacion principal es el mecanismo de atencion hibrida que combina Compressed Sparse Attention (CSA) con Heavily Compressed Attention (HCA), orientado a contener el crecimiento del coste computacional y de memoria en contextos de un millon de tokens. A esto se suman las Manifold-Constrained Hyper-Connections (mHC), que refuerzan las conexiones residuales convencionales para mejorar la estabilidad de propagacion de senal entre capas sin sacrificar expresividad, y el uso del optimizador Muon para acelerar la convergencia y ganar estabilidad durante el entrenamiento. Como referencia comparativa, en 1M tokens la variante Pro requiere el 27 % de los FLOPs de inferencia por token y el 10 % del KV cache de DeepSeek-V3.2.

El preentrenamiento se realizo sobre mas de 32 billones (32T) de tokens diversos y de alta calidad. El postentrenamiento sigue un paradigma en dos etapas: primero se cultivan de forma independiente expertos por dominio mediante SFT y aprendizaje por refuerzo con GRPO, y despues se consolidan en un unico modelo mediante destilacion on-policy, integrando las capacidades de cada dominio. Existe un modo de razonamiento maximo denominado Flash-Max que, con un presupuesto de pensamiento mayor, alcanza un rendimiento en razonamiento comparable al de la version Pro, aunque queda por detras en tareas de conocimiento puro y en los flujos agenticos mas complejos.

## Capacidades

- Generacion de texto y modelado de lenguaje en contextos de hasta un millon de tokens, con especial eficiencia en regimen de contexto largo.
- Razonamiento con modo de pensamiento extendido: la variante Flash-Max permite ampliar el presupuesto de razonamiento hasta acercarse al rendimiento de la version Pro.
- Tareas de conocimiento general y academico: la model card reporta evaluaciones en AGIEval, MMLU, MMLU-Redux, MMLU-Pro, MMMLU, C-Eval y CMMLU, con cobertura de conocimiento en ingles y chino.
- Codigo y tareas agenticas: la model card indica rendimiento de primer nivel en benchmarks de codigo para la variante Pro y una reduccion de la brecha con modelos cerrados en razonamiento y tareas agenticas.
- Soporte de tool calling y function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte multilingue: no disponible; los idiomas declarados en el repositorio no incluyen listado alguno.
- Capacidades de vision o audio: no disponibles.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible) y con la libreria transformers.

## Casos de uso

- Analisis de repositorios completos y documentacion tecnica extensa: con 1M tokens de contexto, el modelo puede ingerir una base de codigo entera o un conjunto de manuales y responder preguntas cruzadas sin necesidad de recuperacion fragmentada, apoyandose en la atencion CSA/HCA para contener el coste del KV cache.
- Procesamiento de expedientes y contratos largos: en entornos legales o administrativos, permite resumir, comparar y extraer clausulas de documentos de cientos de miles de tokens en una sola pasada, manteniendo coherencia entre secciones alejadas del documento.
- Asistentes de atencion al cliente multi-turno: el contexto de 1M tokens admite historiales de conversacion muy largos junto con bases de conocimiento internas, reduciendo la perdida de informacion en conversaciones extensas.
- Generacion y revision de codigo en pipelines de CI/CD: el modelo puede integrarse como revisor automatico de pull requests o generador de parches, con la ventaja de que solo activa 13B de parametros por token, lo que abarata el coste por peticion en comparacion con modelos densos de tamano similar en almacenamiento.
- Razonamiento analitico con presupuesto variable: usar el modo Flash-Max para tareas que requieren cadenas de razonamiento largas (matematicas, planificacion, diagnostico de fallos) y el modo estandar para peticiones de baja latencia, ajustando el coste segun la carga.
- Indexado semantico y sintesis de corpus cientificos: lectura de multiples articulos o informes tecnicos en una sola ventana para generar revisiones comparativas y deteccion de contradicciones entre fuentes.
- Flujos agenticos de varios pasos sobre entornos extensos: navegacion y manipulacion de herramientas o entornos con estado acumulado largo, donde la ventana de 1M tokens evita truncar el historial de acciones.
- Despliegue on-premise con requisitos de licencia permisiva: al distribuirse bajo licencia MIT, es apto para integraciones en producto sin las restricciones de licencias de uso comunitario, siempre que se respete la verificacion de procedencia del repositorio.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a los modelos base (no a la version instruida). Se reproducen tal cual:

| Benchmark (metrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| Arquitectura | - | MoE | MoE | MoE |
| Parametros activados | - | 37B | 13B | 49B |
| Parametros totales | - | 671B | 284B | 1,6T |
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

No se han publicado en la informacion disponible resultados de benchmarks para la version instruida DeepSeek-V4-Flash (la que corresponde a este repositorio), ni cifras de HumanEval, GSM8K, SWE-bench o similares. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para los pesos: el repositorio ocupa 159,6 GB con la mezcla FP4 + FP8. Una conversion a FP8 uniforme implicaria del orden de 291 GB. Cualquier despliegue necesita, por tanto, agregacion de memoria en varios aceleradores; no existe configuracion de GPU unica comercial que aloje los pesos.
- GPU recomendadas: para servir el modelo con holgura se requieren 4 a 8 GPU de 80 GB (H100 SXM, A100 80GB, H200) o configuraciones equivalentes con 3 a 4 GPU H200 de 141 GB. El minimo practico son 3 GPU de 80 GB solo para pesos, sin margen para KV cache ni activaciones, por lo que no es una configuracion viable en produccion.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090 24 GB, RTX 5090 32 GB, etc.) ni en configuraciones multi-GPU de consumo habituales. Se necesitarian al menos seis RTX 4090 para acercarse al tamano de los pesos, sin margen operativo.
- Coste computacional: al activar 13B de parametros por token, el coste de calculo por token es comparable al de un modelo denso de ~13B, lo que reduce la carga de FLOPs frente a lo que sugiere su tamano total. El cuello de botella es la memoria, no el computo.
- Opciones de despliegue: la model card apunta a la libreria transformers y a endpoints compatibles. Para servido de alto rendimiento serian adecuados vLLM o SGLang si incorporan soporte para la arquitectura deepseek_v4; no se confirma en la informacion disponible el soporte de llama.cpp, Ollama, TGI o TensorRT-LLM, ni la existencia de cuantizaciones GGUF.
- Latencia y throughput: no disponibles. La model card solo aporta la comparativa relativa de FLOPs (27 %) y KV cache (10 %) frente a DeepSeek-V3.2 en contexto de 1M tokens, que es una medida relativa y no un valor absoluto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B (290,9B segun safetensors) | 13B | 1M | FP4 + FP8 mixed | MIT | HuggingFace y ModelScope (DeepSeek AI); copia en TMA-1/DeepSeek-V4-Flash |
| DeepSeek-V4-Flash-Base | 284B | 13B | 1M | FP8 mixed | MIT | HuggingFace y ModelScope |
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | FP4 + FP8 mixed | MIT | HuggingFace y ModelScope |
| DeepSeek-V3.2-Base | 671B | 37B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Referencia comparativa usada en la model card |

En rendimiento de conocimiento (modelos base), DeepSeek-V4-Flash-Base supera a DeepSeek-V3.2-Base en todos los benchmarks reportados pese a tener menos de la mitad de parametros totales y aproximadamente un tercio de parametros activos, y queda por detras de DeepSeek-V4-Pro-Base en todas las metricas (por ejemplo, 88,7 frente a 90,1 en MMLU y 68,3 frente a 73,5 en MMLU-Pro). No se dispone de comparativas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Version preliminar: la propia model card describe la serie como "preview version", por lo que pueden producirse cambios en pesos, tokenizador o comportamiento entre revisiones.
- Procedencia del repositorio: el repositorio analizado esta publicado por el usuario TMA-1, no por la cuenta oficial deepseek-ai, y muestra 0 descargas y 0 likes en el momento de la consulta. Conviene verificar hashes frente a la publicacion oficial antes de usarlo en produccion.
- Discrepancia de parametros: los safetensors del repositorio suman 290.944.616.402 parametros, mientras que la model card oficial declara 284B. No se explica la diferencia en la informacion disponible.
- Riesgo de alucinacion: no se han publicado en la informacion disponible tasas de alucinacion ni evaluaciones de veracidad; como cualquier modelo generativo, puede producir contenido incorrecto con apariencia plausible, especialmente en tareas de conocimiento.
- Idiomas: no hay listado oficial de idiomas soportados. Las evaluaciones se limitan a ingles, chino y un benchmark multilingue (MMMLU), por lo que el rendimiento en castellano u otras lenguas no esta documentado.
- Contexto largo: aunque la ventana declarada es de 1M tokens, no se han publicado evaluaciones de recuperacion efectiva a esa distancia (por ejemplo, needle-in-a-haystack), por lo que la calidad real en el extremo del contexto no esta verificada.
- Benchmarks ausentes: no hay resultados de la version instruida ni de tareas de codigo, matematicas, agentes o seguridad.
- Restricciones de licencia: la licencia declarada es MIT, permisiva para uso comercial, pero al tratarse de una copia de terceros debe confirmarse que la publicacion oficial mantiene esa misma licencia y que el repositorio no anade terminos adicionales.
- Requisitos de despliegue: el modelo no es ejecutable en hardware de consumo, lo que limita su uso a infraestructuras con multiples GPU de 80 GB o superiores.
- Sin datos de tool calling ni agentes: no se confirma de forma explicita el soporte de function calling, pese a que la model card menciona tareas agenticas en la variante Pro.

## Enlaces

- Repositorio analizado: https://huggingface.co/TMA-1/DeepSeek-V4-Flash
- Repositorio oficial del modelo: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Repositorio oficial de la version base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- Repositorio oficial de la variante Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Repositorio oficial de la variante Pro base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- ModelScope (version Flash base): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash-Base
- ModelScope (version Flash): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.19348
- Cuenta oficial de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. Los enlaces obtenidos corresponden a entidades no relacionadas que comparten la sigla TMA (Tierce Maintenance Applicative, empresas de gestion de residuos y transporte de viajeros), por lo que se descartan y no se incluyen.
